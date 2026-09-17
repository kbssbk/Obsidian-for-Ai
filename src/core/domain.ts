export type LifeOsStatus = 'todo' | 'doing' | 'done';
export type ProjectStatus = 'active' | 'paused' | 'done';
export type ProgressMode = 'manual' | 'auto';
export type TimelineStatus = 'planned' | 'done' | 'attention';
export type TimelineSource = 'block' | 'task' | 'goal' | 'person' | 'money';
export type HabitFrequency = 'daily' | 'weekly';
export type GoalStatus = 'active' | 'paused' | 'done';
export type MoneyKind = 'income' | 'expense';

export type LifeOsBlock = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: LifeOsStatus;
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
  priority?: number;
  estimatedMinutes?: number;
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

export type LifeOsGoal = {
  id: string;
  title: string;
  targetDate?: string;
  status: GoalStatus;
  progress: number;
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

export type LifeOsHabit = {
  id: string;
  title: string;
  frequency: HabitFrequency;
  checkins: string[];
  path?: string;
};

export type LifeOsPerson = {
  id: string;
  name: string;
  relationship?: string;
  nextContactDate?: string;
  lastContactDate?: string;
  phone?: string;
  path?: string;
};

export type LifeOsMoneyEntry = {
  id: string;
  title: string;
  kind: MoneyKind;
  amount: number;
  date: string;
  category?: string;
  path?: string;
};

export type LifeOsSnapshot = {
  blocks: LifeOsBlock[];
  tasks: LifeOsTask[];
  projects: LifeOsProject[];
  goals?: LifeOsGoal[];
  goalActions: GoalAction[];
  habits?: LifeOsHabit[];
  people?: LifeOsPerson[];
  moneyEntries?: LifeOsMoneyEntry[];
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
