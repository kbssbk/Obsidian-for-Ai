export type LifeOsStatus = 'todo' | 'doing' | 'done';
export type ProjectStatus = 'active' | 'paused' | 'done';
export type ProgressMode = 'manual' | 'auto';
export type TimelineStatus = 'planned' | 'done' | 'attention';
export type TimelineSource = 'block' | 'task' | 'goal';

export type LifeOsBlock = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  path?: string;
};

export type LifeOsTask = {
  id: string;
  title: string;
  projectId: string;
  due: string;
  status: LifeOsStatus;
  researchDone: boolean;
  draftDone: boolean;
  path?: string;
};

export type LifeOsProject = {
  id: string;
  title: string;
  status: ProjectStatus;
  progressMode: ProgressMode;
  progress: number;
  start?: string;
  due?: string;
  path?: string;
};

export type GoalAction = {
  id: string;
  goalId: string;
  title: string;
  estimatedMinutes: number;
  done: boolean;
  path?: string;
};

export type LifeOsSnapshot = {
  blocks: LifeOsBlock[];
  tasks: LifeOsTask[];
  projects: LifeOsProject[];
  goalActions: GoalAction[];
};

export type TimelineEvent = {
  id: string;
  source: TimelineSource;
  date: string;
  title: string;
  status: TimelineStatus;
  detail: string;
  path?: string;
};

export type DateRange = { from: string; to: string };
