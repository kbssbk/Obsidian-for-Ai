import { Notice, Plugin } from 'obsidian';
import { VaultRepository } from './core/vault-repository';
import { AreasView, AREAS_VIEW_TYPE } from './features/areas/areas-view';
import { CalendarView, CALENDAR_VIEW_TYPE } from './features/calendar/calendar-view';
import { QuickCaptureModal } from './features/capture/quick-capture-modal';
import { DashboardView, DASHBOARD_VIEW_TYPE } from './features/dashboard/dashboard-view';
import { FocusView, FOCUS_VIEW_TYPE } from './features/focus/focus-view';
import { HelpView, HELP_VIEW_TYPE } from './features/help/help-view';
import { HubView, HUB_VIEW_TYPE } from './features/hub/hub-view';
import { PlannerView, PLANNER_VIEW_TYPE } from './features/planner/planner-view';
import { ProjectsView, PROJECTS_VIEW_TYPE } from './features/projects/projects-view';
import { RelationshipsView, RELATIONSHIPS_VIEW_TYPE } from './features/relationships/relationships-view';
import { ScheduleView, SCHEDULE_VIEW_TYPE } from './features/schedule/schedule-view';
import { TasksView, TASKS_VIEW_TYPE } from './features/tasks/tasks-view';
import { TimelineView, TIMELINE_VIEW_TYPE } from './features/timeline/timeline-view';
import { DEFAULT_SETTINGS, LifeOsSettingTab, type LifeOsSettings } from './settings';

function todayIso():string{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}

export default class LifeOsPlugin extends Plugin {
  settings:LifeOsSettings=DEFAULT_SETTINGS;
  private repository!:VaultRepository;

  async onload():Promise<void>{
    await this.loadSettings();this.repository=new VaultRepository(this.app);this.applyTheme();
    this.registerView(HUB_VIEW_TYPE,(leaf)=>new HubView(leaf,this.repository,()=>void this.refreshOpenViews()));
    this.registerView(DASHBOARD_VIEW_TYPE,(leaf)=>new DashboardView(leaf,this.repository,()=>this.settings));
    this.registerView(SCHEDULE_VIEW_TYPE,(leaf)=>new ScheduleView(leaf,this.repository));
    this.registerView(PROJECTS_VIEW_TYPE,(leaf)=>new ProjectsView(leaf,this.repository,()=>this.settings));
    this.registerView(TASKS_VIEW_TYPE,(leaf)=>new TasksView(leaf,this.repository));
    this.registerView(TIMELINE_VIEW_TYPE,(leaf)=>new TimelineView(leaf,this.repository,()=>this.settings));
    this.registerView(CALENDAR_VIEW_TYPE,(leaf)=>new CalendarView(leaf,this.repository,()=>this.settings));
    this.registerView(PLANNER_VIEW_TYPE,(leaf)=>new PlannerView(leaf,this.repository,()=>this.settings));
    this.registerView(RELATIONSHIPS_VIEW_TYPE,(leaf)=>new RelationshipsView(leaf,this.repository,()=>this.settings));
    this.registerView(AREAS_VIEW_TYPE,(leaf)=>new AreasView(leaf,this.repository));
    this.registerView(FOCUS_VIEW_TYPE,(leaf)=>new FocusView(leaf,this.repository,()=>this.settings,()=>this.saveSettings()));
    this.registerView(HELP_VIEW_TYPE,(leaf)=>new HelpView(leaf));

    this.addRibbonIcon('command','라이프 OS · 빠른 실행',()=>void this.openView(HUB_VIEW_TYPE));
    this.addRibbonIcon('plus-circle','라이프 OS · 빠른 추가',()=>this.openCapture());
    this.addRibbonIcon('timer','라이프 OS · 집중 타이머',()=>void this.openView(FOCUS_VIEW_TYPE));

    this.addCommand({id:'open-life-os-hub',name:'라이프 OS · 빠른 실행',callback:()=>void this.openView(HUB_VIEW_TYPE)});
    this.addCommand({id:'quick-capture-life-os',name:'라이프 OS · 빠른 추가',callback:()=>this.openCapture()});
    this.addCommand({id:'open-life-os-dashboard',name:'라이프 OS · 오늘',callback:()=>void this.openView(DASHBOARD_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-focus',name:'라이프 OS · 집중 타이머',callback:()=>void this.openView(FOCUS_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-tasks',name:'라이프 OS · 업무',callback:()=>void this.openView(TASKS_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-projects',name:'라이프 OS · 프로젝트',callback:()=>void this.openView(PROJECTS_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-relationships',name:'라이프 OS · 관계',callback:()=>void this.openView(RELATIONSHIPS_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-schedule',name:'라이프 OS · 주간 일정',callback:()=>void this.openView(SCHEDULE_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-timeline',name:'라이프 OS · 타임라인',callback:()=>void this.openView(TIMELINE_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-calendar',name:'라이프 OS · 달력',callback:()=>void this.openView(CALENDAR_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-planner',name:'라이프 OS · 계획·습관·회고',callback:()=>void this.openView(PLANNER_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-areas',name:'라이프 OS · 목표·재정',callback:()=>void this.openView(AREAS_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-help',name:'라이프 OS · 사용 설명',callback:()=>void this.openView(HELP_VIEW_TYPE)});
    this.addCommand({id:'create-life-os-reflection',name:'라이프 OS · 생각 정리 노트 만들기',callback:()=>void this.createReflection()});
    this.addCommand({id:'check-life-os-reminders',name:'라이프 OS · 오늘 알림 확인',callback:()=>void this.showDueSummary()});
    this.addSettingTab(new LifeOsSettingTab(this.app,this));
    this.registerEvent(this.app.metadataCache.on('changed',()=>void this.refreshOpenViews()));
    this.app.workspace.onLayoutReady(()=>{if(this.settings.startupSummaryEnabled)void this.showDueSummary(false);});
  }

  onunload():void{document.body.classList.remove('life-os-neon-enabled');for(const type of [HUB_VIEW_TYPE,DASHBOARD_VIEW_TYPE,SCHEDULE_VIEW_TYPE,PROJECTS_VIEW_TYPE,TASKS_VIEW_TYPE,TIMELINE_VIEW_TYPE,CALENDAR_VIEW_TYPE,PLANNER_VIEW_TYPE,RELATIONSHIPS_VIEW_TYPE,AREAS_VIEW_TYPE,FOCUS_VIEW_TYPE,HELP_VIEW_TYPE])this.app.workspace.detachLeavesOfType(type);}
  async loadSettings():Promise<void>{this.settings=Object.assign({},DEFAULT_SETTINGS,await this.loadData() as Partial<LifeOsSettings>|null);}
  async saveSettings():Promise<void>{await this.saveData(this.settings);this.applyTheme();await this.refreshOpenViews();}
  private applyTheme():void{document.body.classList.toggle('life-os-neon-enabled',this.settings.visualGlow);}
  private openCapture():void{new QuickCaptureModal(this.app,this.repository,()=>void this.refreshOpenViews()).open();}
  private async createReflection():Promise<void>{const path=await this.repository.createReflectionNote(`생각 정리 ${todayIso()}`,todayIso());await this.app.workspace.openLinkText(path,'',false);}
  private async openView(type:string):Promise<void>{const existing=this.app.workspace.getLeavesOfType(type)[0];const leaf=existing??this.app.workspace.getLeaf(true);await leaf.setViewState({type,active:true});this.app.workspace.revealLeaf(leaf);}
  private async showDueSummary(always=true):Promise<void>{const snapshot=await this.repository.snapshot();const today=todayIso();const overdue=snapshot.tasks.filter((task)=>task.status!=='done'&&task.due&&task.due<today).length;const due=snapshot.tasks.filter((task)=>task.status!=='done'&&task.due===today).length;const contacts=(snapshot.people??[]).filter((person)=>person.nextContactDate&&person.nextContactDate<=today).length;const appointments=(snapshot.appointments??[]).filter((item)=>item.status==='planned'&&item.date===today).length;if(always||overdue+due+contacts+appointments>0)new Notice(`오늘 알림 · 오늘 마감 ${due}개 · 기한 지남 ${overdue}개 · 약속 ${appointments}개 · 연락 예정 ${contacts}명`,6000);}
  private async refreshOpenViews():Promise<void>{
    for(const leaf of this.app.workspace.getLeavesOfType(HUB_VIEW_TYPE))if(leaf.view instanceof HubView)leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE))if(leaf.view instanceof DashboardView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(SCHEDULE_VIEW_TYPE))if(leaf.view instanceof ScheduleView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(PROJECTS_VIEW_TYPE))if(leaf.view instanceof ProjectsView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(TASKS_VIEW_TYPE))if(leaf.view instanceof TasksView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(TIMELINE_VIEW_TYPE))if(leaf.view instanceof TimelineView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(CALENDAR_VIEW_TYPE))if(leaf.view instanceof CalendarView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(PLANNER_VIEW_TYPE))if(leaf.view instanceof PlannerView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(RELATIONSHIPS_VIEW_TYPE))if(leaf.view instanceof RelationshipsView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(AREAS_VIEW_TYPE))if(leaf.view instanceof AreasView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(FOCUS_VIEW_TYPE))if(leaf.view instanceof FocusView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(HELP_VIEW_TYPE))if(leaf.view instanceof HelpView)leaf.view.render();
  }
}
