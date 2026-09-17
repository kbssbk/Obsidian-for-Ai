import { Plugin } from 'obsidian';
import { VaultRepository } from './core/vault-repository';
import { AreasView, AREAS_VIEW_TYPE } from './features/areas/areas-view';
import { QuickCaptureModal } from './features/capture/quick-capture-modal';
import { DashboardView, DASHBOARD_VIEW_TYPE } from './features/dashboard/dashboard-view';
import { PlannerView, PLANNER_VIEW_TYPE } from './features/planner/planner-view';
import { ProjectsView, PROJECTS_VIEW_TYPE } from './features/projects/projects-view';
import { ScheduleView, SCHEDULE_VIEW_TYPE } from './features/schedule/schedule-view';
import { TimelineView, TIMELINE_VIEW_TYPE } from './features/timeline/timeline-view';
import { DEFAULT_SETTINGS, LifeOsSettingTab, type LifeOsSettings } from './settings';

export default class LifeOsPlugin extends Plugin {
  settings:LifeOsSettings=DEFAULT_SETTINGS;
  private repository!:VaultRepository;

  async onload():Promise<void>{
    await this.loadSettings();this.repository=new VaultRepository(this.app);
    this.registerView(DASHBOARD_VIEW_TYPE,(leaf)=>new DashboardView(leaf,this.repository,()=>this.settings));
    this.registerView(PROJECTS_VIEW_TYPE,(leaf)=>new ProjectsView(leaf,this.repository,()=>this.settings));
    this.registerView(TIMELINE_VIEW_TYPE,(leaf)=>new TimelineView(leaf,this.repository,()=>this.settings));
    this.registerView(PLANNER_VIEW_TYPE,(leaf)=>new PlannerView(leaf,this.repository));
    this.registerView(AREAS_VIEW_TYPE,(leaf)=>new AreasView(leaf,this.repository));
    this.registerView(SCHEDULE_VIEW_TYPE,(leaf)=>new ScheduleView(leaf,this.repository));

    this.addRibbonIcon('layout-dashboard','Life OS 열기',()=>void this.openView(DASHBOARD_VIEW_TYPE));
    this.addRibbonIcon('plus-circle','Life OS 빠른 추가',()=>new QuickCaptureModal(this.app,this.repository,()=>void this.refreshOpenViews()).open());
    this.addCommand({id:'quick-capture-life-os',name:'Life OS: 빠른 추가',callback:()=>new QuickCaptureModal(this.app,this.repository,()=>void this.refreshOpenViews()).open()});
    this.addCommand({id:'open-life-os-dashboard',name:'Life OS: 오늘 열기',callback:()=>void this.openView(DASHBOARD_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-schedule',name:'Life OS: 주간 일정 열기',callback:()=>void this.openView(SCHEDULE_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-projects',name:'Life OS: 업무 현황 열기',callback:()=>void this.openView(PROJECTS_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-timeline',name:'Life OS: 타임라인 열기',callback:()=>void this.openView(TIMELINE_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-planner',name:'Life OS: 계획·습관·회고 열기',callback:()=>void this.openView(PLANNER_VIEW_TYPE)});
    this.addCommand({id:'open-life-os-areas',name:'Life OS: 생활 영역 열기',callback:()=>void this.openView(AREAS_VIEW_TYPE)});
    this.addSettingTab(new LifeOsSettingTab(this.app,this));
    this.registerEvent(this.app.metadataCache.on('changed',()=>void this.refreshOpenViews()));
  }

  onunload():void{for(const type of [DASHBOARD_VIEW_TYPE,SCHEDULE_VIEW_TYPE,PROJECTS_VIEW_TYPE,TIMELINE_VIEW_TYPE,PLANNER_VIEW_TYPE,AREAS_VIEW_TYPE])this.app.workspace.detachLeavesOfType(type);}
  async loadSettings():Promise<void>{this.settings=Object.assign({},DEFAULT_SETTINGS,await this.loadData() as Partial<LifeOsSettings>|null);}
  async saveSettings():Promise<void>{await this.saveData(this.settings);await this.refreshOpenViews();}

  private async openView(type:string):Promise<void>{const existing=this.app.workspace.getLeavesOfType(type)[0];const leaf=existing??this.app.workspace.getLeaf(true);await leaf.setViewState({type,active:true});this.app.workspace.revealLeaf(leaf);}
  private async refreshOpenViews():Promise<void>{
    for(const leaf of this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE))if(leaf.view instanceof DashboardView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(SCHEDULE_VIEW_TYPE))if(leaf.view instanceof ScheduleView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(PROJECTS_VIEW_TYPE))if(leaf.view instanceof ProjectsView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(TIMELINE_VIEW_TYPE))if(leaf.view instanceof TimelineView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(PLANNER_VIEW_TYPE))if(leaf.view instanceof PlannerView)await leaf.view.render();
    for(const leaf of this.app.workspace.getLeavesOfType(AREAS_VIEW_TYPE))if(leaf.view instanceof AreasView)await leaf.view.render();
  }
}
