import type { GoalAction, HabitFrequency, LifeOsBlock, LifeOsHabit, LifeOsProject, LifeOsTask, LifeOsStatus, ProgressMode, ProjectStatus } from './domain';

export type Frontmatter = Record<string, unknown>;

export type ParsedEntity =
  | { kind: 'project'; value: LifeOsProject }
  | { kind: 'task'; value: LifeOsTask }
  | { kind: 'block'; value: LifeOsBlock }
  | { kind: 'goalAction'; value: GoalAction }
  | { kind: 'habit'; value: LifeOsHabit };

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function number(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function textArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function parseLifeOsEntity(path: string, basename: string, frontmatter: Frontmatter): ParsedEntity | null {
  const type = text(frontmatter.lifeos_type);
  const id = text(frontmatter.lifeos_id, path);
  const title = text(frontmatter.title, basename);

  if (type === 'project') {
    const start = text(frontmatter.start);
    const due = text(frontmatter.due);
    const value: LifeOsProject = {
      id,
      title,
      status: text(frontmatter.status, 'active') as ProjectStatus,
      progressMode: text(frontmatter.progress_mode, 'manual') as ProgressMode,
      progress: Math.max(0, Math.min(100, number(frontmatter.progress, 0))),
      path,
      ...(start ? { start } : {}),
      ...(due ? { due } : {})
    };
    return { kind:'project', value };
  }
  if (type === 'task') {
    return { kind:'task', value:{
      id,
      title,
      projectId:text(frontmatter.project),
      due:text(frontmatter.due),
      status:text(frontmatter.status, 'todo') as LifeOsStatus,
      researchDone:bool(frontmatter.research_done),
      draftDone:bool(frontmatter.draft_done),
      priority:Math.max(1, Math.min(5, number(frontmatter.priority, 3))),
      estimatedMinutes:Math.max(5, number(frontmatter.estimated_minutes, 30)),
      path
    } };
  }
  if (type === 'block') {
    return { kind:'block', value:{ id, title, date:text(frontmatter.date), startTime:text(frontmatter.start_time), endTime:text(frontmatter.end_time), path } };
  }
  if (type === 'goal_action') {
    return { kind:'goalAction', value:{ id, goalId:text(frontmatter.goal), title, estimatedMinutes:number(frontmatter.estimated_minutes, 10), done:bool(frontmatter.done), path } };
  }
  if (type === 'habit') {
    return { kind:'habit', value:{ id, title, frequency:text(frontmatter.frequency, 'daily') as HabitFrequency, checkins:textArray(frontmatter.checkins), path } };
  }
  return null;
}
