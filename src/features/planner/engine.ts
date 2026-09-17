import type { LifeOsBlock, LifeOsHabit, LifeOsSnapshot, LifeOsTask } from '../../core/domain';

export const TIME_SAVING_SOURCE_URL = 'https://wol.jw.org/ko/wol/d/r8/lp-ko/102010124';

export type PlannerOptions = {
  availableMinutes: number;
  bufferRatio: number;
  maxItems: number;
};

export type DailyPlan = {
  today: LifeOsTask[];
  tomorrow: LifeOsTask[];
  focus: LifeOsTask | null;
  plannedMinutes: number;
  bufferMinutes: number;
  overload: boolean;
};

function taskMinutes(task: LifeOsTask): number {
  return Math.max(5, task.estimatedMinutes ?? 30);
}

function rankTask(task: LifeOsTask, today: string): number {
  const priority = Math.max(1, Math.min(5, task.priority ?? 3));
  const overdueBoost = task.due && task.due < today ? 100 : 0;
  const dueTodayBoost = task.due === today ? 50 : 0;
  return overdueBoost + dueTodayBoost + priority * 10;
}

export function buildDailyPlan(snapshot: LifeOsSnapshot, today: string, options: PlannerOptions): DailyPlan {
  // Product behavior adopts prioritization, realistic capacity, buffer time, and Today/Tomorrow separation.
  // Source: https://wol.jw.org/ko/wol/d/r8/lp-ko/102010124
  const open = snapshot.tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => rankTask(b, today) - rankTask(a, today) || a.due.localeCompare(b.due));

  const bufferMinutes = Math.round(options.availableMinutes * Math.max(0, Math.min(0.8, options.bufferRatio)));
  const capacity = Math.max(0, options.availableMinutes - bufferMinutes);
  const urgent = open.filter((task) => !task.due || task.due <= today);
  const future = open.filter((task) => task.due > today);
  const selected: LifeOsTask[] = [];
  let plannedMinutes = 0;

  for (const task of urgent) {
    const duration = taskMinutes(task);
    if (selected.length >= options.maxItems) break;
    if (plannedMinutes + duration > capacity && selected.length > 0) continue;
    selected.push(task);
    plannedMinutes += duration;
  }

  return {
    today: selected,
    tomorrow: future.slice(0, options.maxItems),
    focus: selected[0] ?? future[0] ?? null,
    plannedMinutes,
    bufferMinutes,
    overload: urgent.reduce((sum, task) => sum + taskMinutes(task), 0) > capacity
  };
}

function previousDate(value: string): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function habitStreak(habit: LifeOsHabit, today: string): number {
  const set = new Set(habit.checkins);
  let cursor = today;
  let count = 0;
  while (set.has(cursor)) {
    count += 1;
    cursor = previousDate(cursor);
  }
  return count;
}

function minutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

function clock(value: number): string {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

export function findScheduleConflicts(blocks: LifeOsBlock[]): Array<{ a: LifeOsBlock; b: LifeOsBlock }> {
  const active = blocks.filter((block) => block.status !== 'done');
  return active.flatMap((a, index) => active.slice(index + 1)
    .filter((b) => a.date === b.date && a.startTime < b.endTime && b.startTime < a.endTime)
    .map((b) => ({ a, b })));
}

export function findOpenSlot(blocks: LifeOsBlock[], date: string, duration = 30, earliest = 9 * 60): { startTime: string; endTime: string } | null {
  // Keep intentional open space rather than filling every minute.
  // Source: https://wol.jw.org/ko/wol/d/r8/lp-ko/102010124
  const booked = blocks.filter((block) => block.date === date && block.status !== 'done').sort((a,b) => a.startTime.localeCompare(b.startTime));
  let start = Math.max(9 * 60, earliest);
  for (const block of booked) {
    if (start + duration <= minutes(block.startTime)) break;
    if (start < minutes(block.endTime)) start = minutes(block.endTime);
  }
  return start + duration <= 21 * 60 ? { startTime:clock(start), endTime:clock(start + duration) } : null;
}

export function computeReviewStats(snapshot: LifeOsSnapshot, today: string) {
  const completed = snapshot.tasks.filter((task) => task.status === 'done').length;
  const month = today.slice(0, 7);
  const monthMoney = (snapshot.moneyEntries ?? []).filter((entry) => entry.date.startsWith(month));
  return {
    tasks: { completed, total: snapshot.tasks.length },
    habits: (snapshot.habits ?? []).map((habit) => ({ id: habit.id, title: habit.title, streak: habitStreak(habit, today) })),
    overdueOpen: snapshot.tasks.filter((task) => task.status !== 'done' && task.due && task.due < today).length,
    activeProjects: snapshot.projects.filter((project) => project.status === 'active').length,
    activeGoals: (snapshot.goals ?? []).filter((goal) => goal.status === 'active').length,
    duePeople: (snapshot.people ?? []).filter((person) => person.nextContactDate && person.nextContactDate <= today).length,
    money: {
      income: monthMoney.filter((entry) => entry.kind === 'income').reduce((sum, entry) => sum + entry.amount, 0),
      expense: monthMoney.filter((entry) => entry.kind === 'expense').reduce((sum, entry) => sum + entry.amount, 0)
    }
  };
}
