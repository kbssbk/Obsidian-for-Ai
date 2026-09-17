import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { VaultRepository } from '../../core/vault-repository';
import type { LifeOsSettings } from '../../settings';
import { CALENDAR_VIEW_TYPE } from '../calendar/calendar-view';
import { QuickCaptureModal } from '../capture/quick-capture-modal';
import { FOCUS_VIEW_TYPE } from '../focus/focus-view';
import { buildDailyPlan, computeReviewStats } from '../planner/engine';
import { buildDashboard } from '../projects/projector';
import { RELATIONSHIPS_VIEW_TYPE } from '../relationships/relationships-view';
import { TASKS_VIEW_TYPE } from '../tasks/tasks-view';

export const DASHBOARD_VIEW_TYPE='life-os-dashboard';
function todayIso():string{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}

export class DashboardView extends ItemView {
  constructor(leaf:WorkspaceLeaf,private readonly repository:VaultRepository,private readonly settings:()=>LifeOsSettings){super(leaf);}
  getViewType():string{return DASHBOARD_VIEW_TYPE;}
  getDisplayText():string{return '라이프 OS 오늘';}
  getIcon():string{return 'layout-dashboard';}
  async onOpen():Promise<void>{await this.render();}
  async render():Promise<void>{
    const root=this.contentEl;root.empty();root.addClass('life-os-view','life-os-dashboard');const today=todayIso();const hero=root.createDiv({cls:'life-os-dashboard-hero'});hero.createEl('span',{cls:'life-os-eyebrow',text:'LIFE OS / TODAY'});hero.createEl('h1',{text:'오늘'});hero.createEl('p',{text:`${today} · 가장 중요한 다음 행동부터 시작합니다.`});this.renderQuickActions(hero);
    if(!this.settings().dashboardEnabled){root.createDiv({cls:'life-os-empty',text:'설정에서 오늘 대시보드 기능이 꺼져 있습니다.'});return;}
    const snapshot=await this.repository.snapshot();const dashboard=buildDashboard(snapshot,today);const settings=this.settings();const plan=buildDailyPlan(snapshot,today,{availableMinutes:settings.plannerAvailableMinutes,bufferRatio:settings.plannerBufferPercent/100,maxItems:settings.plannerMaxItems});const review=computeReviewStats(snapshot,today);
    const focus=root.createDiv({cls:'life-os-card life-os-focus'});focus.createEl('h2',{text:'지금 할 한 가지'});if(plan.focus){focus.createEl('strong',{text:plan.focus.title});focus.createEl('p',{text:`우선순위 ${plan.focus.priority??3} · ${plan.focus.estimatedMinutes??30}분${plan.focus.due?` · 마감 ${plan.focus.due}`:''}`});if(plan.focus.path)focus.addEventListener('click',()=>void this.app.workspace.openLinkText(plan.focus?.path??'','',false));}else focus.createEl('p',{text:'새로 급한 일은 없습니다.'});
    const taskSection=root.createDiv({cls:'life-os-section'});taskSection.createEl('h2',{text:'지금 확인할 업무'});if(!dashboard.tasks.length)taskSection.createDiv({cls:'life-os-empty',text:'오늘까지 확인할 미완료 업무가 없습니다.'});for(const task of dashboard.tasks){const row=taskSection.createDiv({cls:'life-os-row'});row.createSpan({text:task.title});row.createEl('small',{text:task.due||'기한 미정'});if(task.path)row.addEventListener('click',()=>void this.app.workspace.openLinkText(task.path??'','',false));}
    const upcoming=(snapshot.appointments??[]).filter((item)=>item.status==='planned'&&item.date>=today).sort((a,b)=>`${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)).slice(0,3);const relation=root.createDiv({cls:'life-os-section'});relation.createEl('h2',{text:'다가오는 약속'});if(!upcoming.length)relation.createDiv({cls:'life-os-empty',text:'예정된 약속이 없습니다.'});for(const item of upcoming){const row=relation.createDiv({cls:'life-os-row'});row.createSpan({text:item.title});row.createEl('small',{text:`${item.date} ${item.startTime}${item.location?` · ${item.location}`:''}`});if(item.path)row.addEventListener('click',()=>void this.app.workspace.openLinkText(item.path??'','',false));}
    const projectSection=root.createDiv({cls:'life-os-section'});projectSection.createEl('h2',{text:'진행 중 프로젝트'});if(!dashboard.projects.length)projectSection.createDiv({cls:'life-os-empty',text:'진행 중인 프로젝트가 없습니다.'});for(const project of dashboard.projects){const row=projectSection.createDiv({cls:'life-os-row'});row.createSpan({text:project.title});row.createEl('strong',{text:`${project.resolvedProgress}%`});if(project.path)row.addEventListener('click',()=>void this.app.workspace.openLinkText(project.path??'','',false));}
    const signals=root.createDiv({cls:'life-os-card'});signals.createEl('h2',{text:'생활 신호'});const grid=signals.createDiv({cls:'life-os-signal-grid'});const entries:Array<[string,string]>=[['기한 지난 업무',`${review.overdueOpen}개`],['연락 예정',`${review.duePeople}명`],['진행 중 목표',`${review.activeGoals}개`],['이번 달 지출',`${review.money.expense.toLocaleString('ko-KR')}원`]];for(const [label,value] of entries){const card=grid.createDiv({cls:'life-os-signal'});card.createEl('span',{text:label});card.createEl('strong',{text:value});}
  }
  private renderQuickActions(container:HTMLElement):void{const bar=container.createDiv({cls:'life-os-quick-actions'});const items:Array<[string,()=>void]>=[['＋ 빠른 추가',()=>new QuickCaptureModal(this.app,this.repository,()=>void this.render()).open()],['집중',()=>void this.open(FOCUS_VIEW_TYPE)],['업무',()=>void this.open(TASKS_VIEW_TYPE)],['달력',()=>void this.open(CALENDAR_VIEW_TYPE)],['관계',()=>void this.open(RELATIONSHIPS_VIEW_TYPE)]];for(const [label,action] of items){const button=bar.createEl('button',{text:label});button.addEventListener('click',(event)=>{event.stopPropagation();action();});}}
  private async open(type:string):Promise<void>{const existing=this.app.workspace.getLeavesOfType(type)[0];const leaf=existing??this.app.workspace.getLeaf(true);await leaf.setViewState({type,active:true});this.app.workspace.revealLeaf(leaf);}
}
