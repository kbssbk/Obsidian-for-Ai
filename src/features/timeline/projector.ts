import type { DateRange, LifeOsSnapshot, TimelineEvent } from '../../core/domain';

function shiftIsoDate(value: string, days: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function deriveCheckpoints(finalDueDate: string): { research: string; draft: string; final: string } {
  return { research: shiftIsoDate(finalDueDate, -7), draft: shiftIsoDate(finalDueDate, -3), final: finalDueDate };
}

export function buildTimelineEvents(data: LifeOsSnapshot, range: DateRange): TimelineEvent[] {
  const events: TimelineEvent[] = [
    ...data.blocks.map((block) => ({
      id: `block:${block.id}`,
      source: 'block' as const,
      date: block.date,
      title: block.title,
      status: block.status === 'done' ? 'done' as const : 'planned' as const,
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
        status: date && date < range.from ? 'attention' as const : 'planned' as const,
        detail: date ? `다음 단계 · ${date}` : '기한 미정 업무',
        path: task.path
      };
    }),
    ...(data.goals ?? []).map((goal) => ({
      id: `goal:${goal.id}`,
      source: 'goal' as const,
      date: goal.targetDate ?? '',
      title: goal.title,
      status: goal.status === 'done' ? 'done' as const : 'planned' as const,
      detail: `목표 · 진행 ${goal.progress}%`,
      path: goal.path
    })),
    ...data.goalActions.map((action) => ({
      id: `action:${action.id}`,
      source: 'goal' as const,
      date: '',
      title: action.title,
      status: action.done ? 'done' as const : 'planned' as const,
      detail: `목표 행동 · ${action.estimatedMinutes}분`,
      path: action.path
    })),
    ...(data.people ?? []).filter((person) => person.nextContactDate).map((person) => ({
      id: `person:${person.id}`,
      source: 'person' as const,
      date: person.nextContactDate ?? '',
      title: `${person.name} 연락`,
      status: (person.nextContactDate ?? '') < range.from ? 'attention' as const : 'planned' as const,
      detail: person.relationship ? `관계 · ${person.relationship}` : '연락 예정',
      path: person.path
    })),
    ...(data.moneyEntries ?? []).map((entry) => ({
      id: `money:${entry.id}`,
      source: 'money' as const,
      date: entry.date,
      title: entry.title,
      status: 'done' as const,
      detail: `${entry.kind === 'expense' ? '지출' : '수입'} · ${entry.amount.toLocaleString('ko-KR')}원${entry.category ? ` · ${entry.category}` : ''}`,
      path: entry.path
    }))
  ];

  return events
    .filter((event) => !event.date || event.status === 'attention' || (event.date >= range.from && event.date <= range.to))
    .sort((a, b) => (a.date || '9999-12-31').localeCompare(b.date || '9999-12-31'));
}
