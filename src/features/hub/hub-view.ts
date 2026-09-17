import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { VaultRepository } from '../../core/vault-repository';
import { AREAS_VIEW_TYPE } from '../areas/areas-view';
import { CALENDAR_VIEW_TYPE } from '../calendar/calendar-view';
import { QuickCaptureModal } from '../capture/quick-capture-modal';
import { DASHBOARD_VIEW_TYPE } from '../dashboard/dashboard-view';
import { FOCUS_VIEW_TYPE } from '../focus/focus-view';
import { PLANNER_VIEW_TYPE } from '../planner/planner-view';
import { PROJECTS_VIEW_TYPE } from '../projects/projects-view';
import { RELATIONSHIPS_VIEW_TYPE } from '../relationships/relationships-view';
import { SCHEDULE_VIEW_TYPE } from '../schedule/schedule-view';
import { TASKS_VIEW_TYPE } from '../tasks/tasks-view';
import { TIMELINE_VIEW_TYPE } from '../timeline/timeline-view';

export const HUB_VIEW_TYPE='life-os-hub';
const ACTIONS=[
  {title:'오늘',desc:'오늘 해야 할 일과 중요한 신호',icon:'⌁',type:DASHBOARD_VIEW_TYPE},
  {title:'집중',desc:'업무와 연결한 집중 타이머',icon:'◉',type:FOCUS_VIEW_TYPE},
  {title:'업무',desc:'마감과 체크포인트 확인',icon:'✓',type:TASKS_VIEW_TYPE},
  {title:'프로젝트',desc:'진행 상태와 연결 업무',icon:'▦',type:PROJECTS_VIEW_TYPE},
  {title:'관계',desc:'사람별 약속·만남·다음 행동',icon:'◎',type:RELATIONSHIPS_VIEW_TYPE},
  {title:'달력',desc:'월간·주간·목록 일정 보기',icon:'▣',type:CALENDAR_VIEW_TYPE},
  {title:'타임라인',desc:'원하는 기록만 골라 시간순으로',icon:'⎯',type:TIMELINE_VIEW_TYPE},
  {title:'주간 일정',desc:'7일 일정과 시간 블록',icon:'≡',type:SCHEDULE_VIEW_TYPE},
  {title:'계획·습관',desc:'오늘/내일 계획과 회고',icon:'◇',type:PLANNER_VIEW_TYPE},
  {title:'목표·재정',desc:'목표 진행과 생활 재정',icon:'△',type:AREAS_VIEW_TYPE}
] as const;

export class HubView extends ItemView {
  constructor(leaf:WorkspaceLeaf,private readonly repository:VaultRepository,private readonly onChanged:()=>void){super(leaf);}
  getViewType():string{return HUB_VIEW_TYPE;}
  getDisplayText():string{return '라이프 OS 빠른 실행';}
  getIcon():string{return 'command';}
  async onOpen():Promise<void>{this.render();}
  render():void{
    const root=this.contentEl;root.empty();root.addClass('life-os-view','life-os-hub');const hero=root.createDiv({cls:'life-os-hub-hero'});hero.createEl('span',{cls:'life-os-eyebrow',text:'LIFE OS / WORKSPACE'});hero.createEl('h1',{text:'빠른 실행'});hero.createEl('p',{text:'지금 필요한 화면으로 바로 이동합니다. 모바일에서는 한 손 조작, 큰 화면에서는 작업 콘솔처럼 배치됩니다.'});
    const capture=hero.createEl('button',{cls:'life-os-primary-action',text:'＋ 빠른 추가'});capture.addEventListener('click',()=>new QuickCaptureModal(this.app,this.repository,this.onChanged).open());
    const grid=root.createDiv({cls:'life-os-launch-grid'});for(const action of ACTIONS){const button=grid.createEl('button',{cls:'life-os-launch-card'});button.createEl('span',{cls:'life-os-launch-icon',text:action.icon});const copy=button.createDiv();copy.createEl('strong',{text:action.title});copy.createEl('span',{text:action.desc});button.addEventListener('click',()=>void this.open(action.type));}
  }
  private async open(type:string):Promise<void>{const existing=this.app.workspace.getLeavesOfType(type)[0];const leaf=existing??this.app.workspace.getLeaf(true);await leaf.setViewState({type,active:true});this.app.workspace.revealLeaf(leaf);}
}
