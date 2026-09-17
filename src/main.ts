import { Plugin } from 'obsidian';
import { VaultRepository } from './core/vault-repository';
import { AreasView, AREAS_VIEW_TYPE } from './features/areas/areas-view';
import { QuickCaptureModal } from './features/capture/quick-capture-modal';
import { DashboardView, DASHBOARD_VIEW_TYPE } from './features/dashboard/dashboard-view';
import { PlannerView, PLANNER_VIEW_TYPE } from './features/planner/planner-view';
import { ProjectsView, PROJECTS_VIEW_TYPE } from './features/projects/projects-view';
import { ScheduleView, SCHEDULE_VIEW_TYPE } from './features/schedule/schedule-view';
import { TasksView, TASKS_VIEW_TYPE } from './features/tasks/tasks-view';
import { TimelineView, TIMELINE_VIEW_TYPE } from './features/timeline/timeline-view';
import { DEFAULT_SETTINGS, LifeOsSettingTab, type LifeOsSettings } from './settings';

function todayIso():string{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}

export default class LifeOsPlugin extends Plugin {
  settings:LifeOsSettings=DEFAULT_SETTINGS;
  private repository!:VaultRepository;

  async onload():Promise<void>{
    await this.loadSettings();this.repository=new VaultRepository(this.app);
    this.registerView(DASHBOARD_VIEW_TYPE,(leaf)=>new DashboardView(leaf,this.repository,()=>this.settings));
    this.registerView(SCHEDULE_VIEW_TYPE,(leaf)=>new ScheduleView(leaf,this.repository));
    this.registerView(PROJECTS_VIEW_TYPE,(leaf)=>new ProjectsView(leaf,this.repository,()=>this.settings));
    this.registerView(TASKS_VIEW_TYPE,(leaf)=>new TasksView(leaf,this.repository));
    this.registerView(TIMELINE_VIEW_TYPE,(leaf)=>new TimelineView(leaf,this.repository,()=>this.settings));
    this.registerView(PLANNER_VIEW_TYPE,(leaf)=>new PlannerView(leaf,this.repository,()=>this.settings));
    this.registerView(AREAS_VIEW_TYPE,(leaf)=>new AreasView(leaf,this.repository));

    this.addRibbonIcon('layout-dashboard','라이프 OS 열기',()=>void this.openView(DASHBOARD_VIEW_TYPE));
    this.addRibbonIcon('plus-circle','라이프 OS 빠른 추가',()=>new QuickCaptureModal(this.app,this.repository,()=>void this.refreshOpenViews()).open());
    this.addCommand({id:'quick-capture-life-os',name:'라이프 OS: 빠른 추가',callback:()=>new QuickCaptureModal(this.app,this.repository,()=>void this.refreshOpenViews()).open()});
    this.addCommand({id:'create-life-os-reflection',name:'라이프 OS: 생각 정리 노트 만들기',callback:()=>void this.createReflection()});
    this.addCommand({id:'open-life-os-dashboard',name:'라이프 OS: 오늘 열기',callback:()=>void this.openView(DASHBOARD_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-schedule',name:'라이프 OS: 주간 일정 열기',callback:()=>void this.openView(SCHEDULE_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-projects',name:'라이프 OS: 프로젝트 진행도 열기',callback:()=>void this.openView(PROJECTS_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-tasks',name:'라이프 OS: 마감 업무 열기',callback:()=>void this.openView(TASKS_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-timeline',name:'라이프 OS: 타임라인 열기',callback:()=>void this.openView(TIMELINE_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-planner',name:'라이프 OS: 계획·습관·회고 열기',callback:()=>void this.openView(PLANNER_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-areas',name:'라이프 OS: 생활 영역 열기',callback:()=>void this.openView(AREAS_VIEW_TYPE)});
    this.addSettingTab(new LifeOsSettingTab(this.app,this));
    this.registerEvent(this.app.metadataCache.on('changed',()=>void this.refreshOpenViews()));
  }

  onunload():void{for(const type of [DASHBOARD_VIEW_TYPE,SCHEDULE_VIEW_TYPE,PROJECTS_VIEW_TYPE,TASKS_VIEW_TYPE,TIMELINE_VIEW_TYPE,PLANNER_VIEW_TYPE,AREAS_VIEW_TYPE])this.app.workspace.detachLeavesOfType(type);}
  async loadSettings():Promise<void>{this.settings=Object.assign({},DEFAULT_SETTINGS,await this.loadData() as Partial<LifeOsSettings>|null);}
  async saveSettings():Promise<void>{await this.saveData(this.settings);await this.refreshOpenViews();}
  private async createReflection():Promise<void>{const path=await this.repository.createReflectionNote(`생각 정리 ${todayIso()}`,todayIso());await this.app.workspace.openLinkText(path,'',false);}
  private async openView(type:string):Promise<void>{const existing=this.app.workspace.getLeavesOfType(type)[0];const leaf=existing??this.app.workspace.getLeaf(true);await leaf.setViewState({type,active:true});this.app.workspace.revealLeaf(leaf);}
  private async refreshOpenViews():Promise<void>{
    for(const leaf of this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE))if(leaf.view instanceof DashboardView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(SCHEDULE_VIEW_TYPE))if(leaf.view instanceof ScheduleView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(PROJECTS_VIEW_TYPE))if(leaf.view instanceof ProjectsView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(TASKS_VIEW_TYPE))if(leaf.view instanceof TasksView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(TIMELINE_VIEW_TYPE))if(leaf.view instanceof TimelineView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(PLANNER_VIEW_TYPE))if(leaf.view instanceof PlannerView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(AREAS_VIEW_TYPE))if(leaf.view instanceof AreasView)await leaf.view.render();
  }
}
