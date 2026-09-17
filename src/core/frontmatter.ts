import type { GoalAction, GoalStatus, HabitFrequency, LifeOsBlock, LifeOsBudget, LifeOsGoal, LifeOsHabit, LifeOsMilestone, LifeOsMoneyEntry, LifeOsPerson, LifeOsProject, LifeOsRecurringPayment, LifeOsSavingsGoal, LifeOsTask, LifeOsStatus, MoneyKind, ProgressMode, ProjectStatus } from './domain';

export type Frontmatter = Record<string, unknown>;
export type ParsedEntity =
  | { kind:'project'; value:LifeOsProject }
  | { kind:'task'; value:LifeOsTask }
  | { kind:'block'; value:LifeOsBlock }
  | { kind:'goal'; value:LifeOsGoal }
  | { kind:'milestone'; value:LifeOsMilestone }
  | { kind:'goalAction'; value:GoalAction }
  | { kind:'habit'; value:LifeOsHabit }
  | { kind:'person'; value:LifeOsPerson }
  | { kind:'money'; value:LifeOsMoneyEntry }
  | { kind:'budget'; value:LifeOsBudget }
  | { kind:'recurring'; value:LifeOsRecurringPayment }
  | { kind:'savings'; value:LifeOsSavingsGoal };

function text(value:unknown, fallback=''):string { return typeof value === 'string' ? value : fallback; }
function bool(value:unknown, fallback=false):boolean { return typeof value === 'boolean' ? value : fallback; }
function number(value:unknown, fallback=0):number { return typeof value === 'number' && Number.isFinite(value) ? value : fallback; }
function textArray(value:unknown):string[] { return Array.isArray(value) ? value.filter((item):item is string => typeof item === 'string') : []; }
function optional(value:unknown):string | undefined { const result = text(value); return result || undefined; }

export function parseLifeOsEntity(path:string, basename:string, frontmatter:Frontmatter):ParsedEntity | null {
  const type = text(frontmatter.lifeos_type);
  const id = text(frontmatter.lifeos_id, path);
  const title = text(frontmatter.title, basename);

  if (type === 'project') return { kind:'project', value:{ id, title, status:text(frontmatter.status,'active') as ProjectStatus, progressMode:text(frontmatter.progress_mode,'manual') as ProgressMode, progress:Math.max(0,Math.min(100,number(frontmatter.progress,0))), path, ...(optional(frontmatter.start)?{start:optional(frontmatter.start)}:{}), ...(optional(frontmatter.due)?{due:optional(frontmatter.due)}:{}) } };
  if (type === 'task') return { kind:'task', value:{ id, title, projectId:text(frontmatter.project), due:text(frontmatter.due), status:text(frontmatter.status,'todo') as LifeOsStatus, researchDone:bool(frontmatter.research_done), draftDone:bool(frontmatter.draft_done), priority:Math.max(1,Math.min(5,number(frontmatter.priority,3))), estimatedMinutes:Math.max(5,number(frontmatter.estimated_minutes,30)), path } };
  if (type === 'block') return { kind:'block', value:{ id, title, date:text(frontmatter.date), startTime:text(frontmatter.start_time), endTime:text(frontmatter.end_time), status:text(frontmatter.status,'todo') as LifeOsStatus, growth:bool(frontmatter.growth), path } };
  if (type === 'goal') return { kind:'goal', value:{ id, title, status:text(frontmatter.status,'active') as GoalStatus, progress:Math.max(0,Math.min(100,number(frontmatter.progress,0))), path, ...(optional(frontmatter.target_date)?{targetDate:optional(frontmatter.target_date)}:{}), ...(optional(frontmatter.description)?{description:optional(frontmatter.description)}:{}) } };
  if (type === 'milestone') return { kind:'milestone', value:{ id, goalId:text(frontmatter.goal), title, dueDate:text(frontmatter.due), done:bool(frontmatter.done), position:number(frontmatter.position,0), path } };
  if (type === 'goal_action') return { kind:'goalAction', value:{ id, goalId:text(frontmatter.goal), title, estimatedMinutes:Math.max(5,number(frontmatter.estimated_minutes,10)), done:bool(frontmatter.done), path } };
  if (type === 'habit') return { kind:'habit', value:{ id, title, frequency:text(frontmatter.frequency,'daily') as HabitFrequency, checkins:textArray(frontmatter.checkins), path } };
  if (type === 'person') return { kind:'person', value:{ id, name:title, path, ...(optional(frontmatter.nickname)?{nickname:optional(frontmatter.nickname)}:{}), ...(optional(frontmatter.relationship)?{relationship:optional(frontmatter.relationship)}:{}), ...(optional(frontmatter.organization)?{organization:optional(frontmatter.organization)}:{}), ...(optional(frontmatter.phone)?{phone:optional(frontmatter.phone)}:{}), ...(optional(frontmatter.email)?{email:optional(frontmatter.email)}:{}), ...(optional(frontmatter.birthday)?{birthday:optional(frontmatter.birthday)}:{}), ...(optional(frontmatter.last_contact)?{lastContactDate:optional(frontmatter.last_contact)}:{}), ...(optional(frontmatter.next_contact)?{nextContactDate:optional(frontmatter.next_contact)}:{}), ...(optional(frontmatter.contact_cadence)?{contactCadence:optional(frontmatter.contact_cadence)}:{}), ...(optional(frontmatter.interests)?{interests:optional(frontmatter.interests)}:{}), ...(optional(frontmatter.gift_ideas)?{giftIdeas:optional(frontmatter.gift_ideas)}:{}), ...(typeof frontmatter.favorite === 'boolean'?{favorite:frontmatter.favorite}:{}) } };
  if (type === 'money') return { kind:'money', value:{ id, title, kind:text(frontmatter.kind,'expense') as MoneyKind, amount:Math.max(0,number(frontmatter.amount,0)), date:text(frontmatter.date), path, ...(optional(frontmatter.category)?{category:optional(frontmatter.category)}:{}), ...(optional(frontmatter.note)?{note:optional(frontmatter.note)}:{}) } };
  if (type === 'budget') return { kind:'budget', value:{ id, month:text(frontmatter.month), category:text(frontmatter.category,'기타'), limitAmount:Math.max(0,number(frontmatter.limit_amount,0)), path } };
  if (type === 'recurring_payment') return { kind:'recurring', value:{ id, title, amount:Math.max(0,number(frontmatter.amount,0)), nextDueDate:text(frontmatter.next_due), active:bool(frontmatter.active,true), path } };
  if (type === 'savings_goal') return { kind:'savings', value:{ id, title, targetAmount:Math.max(0,number(frontmatter.target_amount,0)), currentAmount:Math.max(0,number(frontmatter.current_amount,0)), targetDate:text(frontmatter.target_date), path } };
  return null;
}
