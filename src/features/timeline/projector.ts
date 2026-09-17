import type { DateRange, LifeOsSnapshot, TimelineEvent } from '../../core/domain';

function shiftIsoDate(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function deriveCheckpoints(finalDueDate: string): { research: string; draft: string; final: string } {
  return {
    research: shiftIsoDate(finalDueDate, -7),
    draft: shiftIsoDate(finalDueDate, -3),
    final: finalDueDate
  };
}

export function buildTimelineEvents(data: LifeOsSnapshot, range: DateRange): TimelineEvent[] {
  const events: TimelineEvent[] = [
    ...data.blocks.map((block) => ({
      id: `block:${block.id}`,
      source: 'block' as const,
      date: block.date,
      title: block.title,
      status: 'planned' as const,
      detail: `${block.startTime}–${block.endTime}`,
      path: block.path
    })),
    ...data.tasks.filter((task) => task.status !== 'done').map((task) => {
      const checkpoints = deriveCheckpoints(task.due);
      const date = !task.researchDone ? checkpoints.research : !task.draftDone ? checkpoints.draft : checkpoints.final;
      return {
        id: `task:${task.id}`,
        source: 'task' as const,
        date,
        title: task.title,
        status: date < range.from ? 'attention' as const : 'planned' as const,
        detail: `다음 단계 · ${date}`,
        path: task.path
      };
    }),
    ...data.goalActions.map((action) => ({
      id: `action:${action.id}`,
      source: 'goal' as const,
      date: '',
      title: action.title,
      status: action.done ? 'done' as const : 'planned' as const,
      detail: `목표 행동 · ${action.estimatedMinutes}분`,
      path: action.path
    }))
  ];

  return events
    .filter((event) => !event.date || event.status === 'attention' || (event.date >= range.from && event.date <= range.to))
    .sort((a, b) => (a.date || '9999-12-31').localeCompare(b.date || '9999-12-31'));
}
