import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { LifeOsTask } from '../../core/domain';
import type { VaultRepository } from '../../core/vault-repository';
import { deriveCheckpoints } from '../timeline/projector';

export const TASKS_VIEW_TYPE='life-os-tasks';
type Urgency='overdue'|'today'|'urgent'|'upcoming'|'comfortable'|'complete';
const groups:Array<{key:Urgency;label:string}>=[{key:'overdue',label:'기한 지남'},{key:'today',label:'오늘'},{key:'urgent',label:'3일 이내'},{key:'upcoming',label:'7일 이내'},{key:'comfortable',label:'나중'},{key:'complete',label:'완료'}];
function todayIso():string{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function daysBetween(from:string,to:string):number{return Math.ceil((new Date(`${to}T12:00:00Z`).getTime()-new Date(`${from}T12:00:00Z`).getTime())/86400000);}
function urgency(task:LifeOsTask,today:string):Urgency{if(task.status==='done')return'complete';if(!task.due)return'comfortable';const days=daysBetween(today,task.due);if(days<0)return'overdue';if(days===0)return'today';if(days<=3)return'urgent';if(days<=7)return'upcoming';return'comfortable';}

export class TasksView extends ItemView {
  constructor(leaf:WorkspaceLeaf,private readonly repository:VaultRepository){super(leaf);}
  getViewType():string{return TASKS_VIEW_TYPE;}
  getDisplayText():string{return '라이프 OS 마감 업무';}
  getIcon():string{return 'clipboard-list';}
  async onOpen():Promise<void>{await this.render();}

  async render():Promise<void>{
    const root=this.contentEl;root.empty();root.addClass('life-os-view');const snapshot=await this.repository.snapshot();const today=todayIso();
    root.createEl('h1',{text:'마감 업무'});root.createEl('p',{text:'마감까지 필요한 단계를 쪼개고, 지금 해야 할 단계에 집중합니다.'});
    for(const group of groups){const items=snapshot.tasks.filter((task)=>urgency(task,today)===group.key);if(!items.length)continue;const section=root.createDiv({cls:'life-os-card'});section.createEl('h2',{text:`${group.label} · ${items.length}개`});for(const task of items.sort((a,b)=>a.due.localeCompare(b.due))){const card=section.createDiv({cls:`life-os-task-card urgency-${group.key}`});const head=card.createDiv({cls:'life-os-card-header'});head.createEl('strong',{text:task.title});head.createEl('span',{text:task.due||'기한 미정'});if(task.path)head.addEventListener('click',()=>void this.app.workspace.openLinkText(task.path??'','',false));const checkpoints=deriveCheckpoints(task.due);const stages:[string,'research'|'draft'|'final',boolean,string][]=[['자료 조사','research',task.researchDone,checkpoints.research],['초안 완료','draft',task.draftDone,checkpoints.draft],['최종 마감','final',task.status==='done',checkpoints.final]];const stageWrap=card.createDiv({cls:'life-os-checkpoints'});for(const [label,stage,done,date] of stages){const row=stageWrap.createDiv({cls:'life-os-stage'});const checkbox=row.createEl('input');checkbox.type='checkbox';checkbox.checked=done;row.createEl('span',{text:`${label}${date?` · ${date}`:''}`});checkbox.addEventListener('change',async()=>{if(!task.path)return;await this.repository.setTaskStage(task.path,stage,checkbox.checked);await this.render();});}}
    }
    if(!snapshot.tasks.length)root.createDiv({cls:'life-os-empty',text:'등록된 업무가 없습니다. 빠른 추가로 첫 업무를 만들 수 있습니다.'});
  }
}
