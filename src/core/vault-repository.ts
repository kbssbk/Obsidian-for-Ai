import { App, TFile, normalizePath } from 'obsidian';
import type { LifeOsSnapshot } from './domain';
import { parseLifeOsEntity } from './frontmatter';

export { parseLifeOsEntity } from './frontmatter';

function safeName(value:string):string { return value.replace(/[\\/:*?"<>|#^[\]]/g,'-').trim().slice(0,80) || '새 항목'; }
function nextDate(value:string):string { const date=new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate()+1); return date.toISOString().slice(0,10); }
function yamlScalar(value:string|number|boolean):string|number|boolean { return typeof value === 'string' ? JSON.stringify(value) : value; }

export class VaultRepository {
  constructor(private readonly app:App) {}

  async snapshot():Promise<LifeOsSnapshot> {
    const snapshot:LifeOsSnapshot = { blocks:[], tasks:[], projects:[], goals:[], milestones:[], goalActions:[], habits:[], people:[], moneyEntries:[], budgets:[], recurringPayments:[], savingsGoals:[] };
    for (const file of this.app.vault.getMarkdownFiles()) this.collectFile(file,snapshot);
    return snapshot;
  }

  async createLifeNote(kind:string, title:string, fields:Record<string,string|number|boolean>):Promise<string> {
    const folderMap:Record<string,string> = { task:'Inbox', block:'Schedule', goal:'Goals', milestone:'Goals', goal_action:'Goals', habit:'Habits', person:'People', money:'Money', budget:'Money', recurring_payment:'Money', savings_goal:'Money' };
    const folder = normalizePath(`Life OS/${folderMap[kind] ?? 'Inbox'}`);
    if (!this.app.vault.getAbstractFileByPath(folder)) { try { await this.app.vault.createFolder(folder); } catch { /* created concurrently */ } }
    const stamp = new Date().toISOString().replace(/[:.]/g,'-');
    const path = normalizePath(`${folder}/${stamp}-${safeName(title)}.md`);
    const lines = ['---',`lifeos_type: ${kind}`,`lifeos_id: ${kind}-${stamp}`,`title: ${JSON.stringify(title)}`];
    for (const [key,value] of Object.entries(fields)) lines.push(`${key}: ${yamlScalar(value)}`);
    lines.push('---','','');
    await this.app.vault.create(path,lines.join('\n'));
    return path;
  }

  createInboxTask(title:string,due='',priority=3,estimatedMinutes=30):Promise<string> {
    return this.createLifeNote('task',title,{ status:'todo', due, priority:Math.max(1,Math.min(5,Math.round(priority))), estimated_minutes:Math.max(5,Math.round(estimatedMinutes)), research_done:false, draft_done:false });
  }

  async setProjectProgress(path:string,progress:number):Promise<void> { await this.updateFrontmatter(path,(fm)=>{ fm.progress_mode='manual'; fm.progress=Math.max(0,Math.min(100,Math.round(progress))); }); }
  async setTaskDone(path:string,done:boolean):Promise<void> { await this.updateFrontmatter(path,(fm)=>{ fm.status=done?'done':'todo'; }); }
  async setHabitCheckin(path:string,date:string,checked:boolean):Promise<void> {
    await this.updateFrontmatter(path,(fm)=>{ const existing=Array.isArray(fm.checkins)?fm.checkins.filter((item):item is string=>typeof item==='string'):[]; const next=new Set(existing); if(checked)next.add(date);else next.delete(date); fm.checkins=[...next].sort(); });
  }
  async setPersonFavorite(path:string,favorite:boolean):Promise<void> { await this.updateFrontmatter(path,(fm)=>{ fm.favorite=favorite; }); }
  async markPersonContacted(path:string,date:string,nextContactDate=''):Promise<void> { await this.updateFrontmatter(path,(fm)=>{ fm.last_contact=date; if(nextContactDate)fm.next_contact=nextContactDate; }); }
  async setMilestoneDone(path:string,done:boolean):Promise<void> { await this.updateFrontmatter(path,(fm)=>{ fm.done=done; }); }
  async setSavingsAmount(path:string,amount:number):Promise<void> { await this.updateFrontmatter(path,(fm)=>{ fm.current_amount=Math.max(0,Math.round(amount)); }); }

  async recoverBlock(path:string,action:'tomorrow'|'shrink'|'complete'):Promise<void> {
    await this.updateFrontmatter(path,(fm)=>{
      if(action==='tomorrow'&&typeof fm.date==='string')fm.date=nextDate(fm.date);
      if(action==='shrink'){ const start=typeof fm.start_time==='string'?fm.start_time:'09:00'; const [h,m]=start.split(':').map(Number); const total=h*60+m+5; fm.end_time=`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`; }
      if(action==='complete')fm.status='done';
    });
  }

  private async updateFrontmatter(path:string,mutate:(frontmatter:Record<string,unknown>)=>void):Promise<void> { const file=this.app.vault.getAbstractFileByPath(path); if(!(file instanceof TFile))return; await this.app.fileManager.processFrontMatter(file,mutate); }

  private collectFile(file:TFile,snapshot:LifeOsSnapshot):void {
    const frontmatter=this.app.metadataCache.getFileCache(file)?.frontmatter; if(!frontmatter)return;
    const entity=parseLifeOsEntity(file.path,file.basename,frontmatter); if(!entity)return;
    if(entity.kind==='project')snapshot.projects.push(entity.value);
    if(entity.kind==='task')snapshot.tasks.push(entity.value);
    if(entity.kind==='block')snapshot.blocks.push(entity.value);
    if(entity.kind==='goal')snapshot.goals?.push(entity.value);
    if(entity.kind==='milestone')snapshot.milestones?.push(entity.value);
    if(entity.kind==='goalAction')snapshot.goalActions.push(entity.value);
    if(entity.kind==='habit')snapshot.habits?.push(entity.value);
    if(entity.kind==='person')snapshot.people?.push(entity.value);
    if(entity.kind==='money')snapshot.moneyEntries?.push(entity.value);
    if(entity.kind==='budget')snapshot.budgets?.push(entity.value);
    if(entity.kind==='recurring')snapshot.recurringPayments?.push(entity.value);
    if(entity.kind==='savings')snapshot.savingsGoals?.push(entity.value);
  }
}
