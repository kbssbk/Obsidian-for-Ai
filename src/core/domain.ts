export type LifeOsStatus = 'todo' | 'doing' | 'done';
export type ProjectStatus = 'active' | 'paused' | 'done';
export type ProgressMode = 'manual' | 'auto';
export type TimelineStatus = 'planned' | 'done' | 'attention';
export type TimelineSource = 'block' | 'task' | 'goal' | 'person' | 'money';
export type HabitFrequency = 'daily' | 'weekly';
export type GoalStatus = 'active' | 'paused' | 'done';
export type MoneyKind = 'income' | 'expense' | 'savings';
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export type LifeOsBlock = { id:string; title:string; date:string; startTime:string; endTime:string; status?:LifeOsStatus; growth?:boolean; path?:string };
export type LifeOsTask = { id:string; title:string; projectId:string; due:string; status:LifeOsStatus; researchDone:boolean; draftDone:boolean; priority?:number; estimatedMinutes?:number; recurrence?:TaskRecurrence; lastCompleted?:string; path?:string };
export type LifeOsProject = { id:string; title:string; status:ProjectStatus; progressMode:ProgressMode; progress:number; start?:string; due?:string; path?:string };
export type LifeOsGoal = { id:string; title:string; targetDate?:string; description?:string; status:GoalStatus; progress:number; path?:string };
export type LifeOsMilestone = { id:string; goalId:string; title:string; dueDate:string; done:boolean; position:number; path?:string };
export type GoalAction = { id:string; goalId:string; title:string; estimatedMinutes:number; done:boolean; path?:string };
export type LifeOsHabit = { id:string; title:string; frequency:HabitFrequency; checkins:string[]; path?:string };
export type LifeOsPerson = { id:string; name:string; nickname?:string; relationship?:string; organization?:string; phone?:string; email?:string; birthday?:string; lastContactDate?:string; nextContactDate?:string; contactCadence?:string; interests?:string; giftIdeas?:string; favorite?:boolean; path?:string };
export type LifeOsMoneyEntry = { id:string; title:string; kind:MoneyKind; amount:number; date:string; category?:string; note?:string; path?:string };
export type LifeOsBudget = { id:string; month:string; category:string; limitAmount:number; path?:string };
export type LifeOsRecurringPayment = { id:string; title:string; amount:number; nextDueDate:string; active:boolean; path?:string };
export type LifeOsSavingsGoal = { id:string; title:string; targetAmount:number; currentAmount:number; targetDate:string; path?:string };
export type LifeOsTimeLog = { id:string; title:string; date:string; startTime:string; endTime:string; category?:string; taskId?:string; path?:string };

export type LifeOsSnapshot = {
  blocks:LifeOsBlock[];
  tasks:LifeOsTask[];
  projects:LifeOsProject[];
  goals?:LifeOsGoal[];
  milestones?:LifeOsMilestone[];
  goalActions:GoalAction[];
  habits?:LifeOsHabit[];
  people?:LifeOsPerson[];
  moneyEntries?:LifeOsMoneyEntry[];
  budgets?:LifeOsBudget[];
  recurringPayments?:LifeOsRecurringPayment[];
  savingsGoals?:LifeOsSavingsGoal[];
  timeLogs?:LifeOsTimeLog[];
};

export type TimelineEvent = { id:string; source:TimelineSource; date:string; title:string; status:TimelineStatus; detail:string; path?:string };
export type DateRange = { from:string; to:string };
