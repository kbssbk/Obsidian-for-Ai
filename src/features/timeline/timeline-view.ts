import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { TimelineSource } from '../../core/domain';
import type { VaultRepository } from '../../core/vault-repository';
import type { LifeOsSettings } from '../../settings';
import { CALENDAR_VIEW_TYPE } from '../calendar/calendar-view';
import { buildTimelineEvents, filterTimelineEvents } from './projector';

export const TIMELINE_VIEW_TYPE='life-os-timeline';
function shiftIsoDate(value:string,days:number):string{const date=new Date(`${value}T12:00:00Z`);date.setUTCDate(date.getUTCDate()+days);return date.toISOString().slice(0,10);}
function todayIso():string{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
const SOURCE_LABELS:Record<TimelineSource,string>={block:'일정',task:'업무',goal:'목표',person:'관계',appointment:'약속',money:'재정',time:'집중·시간'};
const SOURCE_GROUPS:Array<{label:string;sources:TimelineSource[]}>= [{label:'일정',sources:['block']},{label:'업무',sources:['task']},{label:'목표',sources:['goal']},{label:'관계',sources:['person','appointment']},{label:'재정',sources:['money']},{label:'집중·시간',sources:['time']}];

export class TimelineView extends ItemView {
  private activeSources=new Set<TimelineSource>(['block','task','goal','person','appointment','money','time']);private personId='';private showDone=true;private initialized=false;
  constructor(leaf:WorkspaceLeaf,private readonly repository:VaultRepository,private readonly settings:()=>LifeOsSettings){super(leaf);}
  getViewType():string{return TIMELINE_VIEW_TYPE;}
  getDisplayText():string{return '라이프 OS 타임라인';}
  getIcon():string{return 'git-branch';}
  async onOpen():Promise<void>{if(!this.initialized){this.showDone=this.settings().timelineShowDone;this.initialized=true;}await this.render();}

  async render():Promise<void>{
    const root=this.contentEl;root.empty();root.addClass('life-os-view','life-os-timeline-view');root.createEl('h1',{text:'타임라인'});root.createEl('p',{text:'일정·업무·목표·관계·재정·집중 기록 중 원하는 것만 골라 하나의 시간 흐름으로 봅니다.'});
    if(!this.settings().timelineEnabled){root.createDiv({cls:'life-os-empty',text:'설정에서 타임라인 기능이 꺼져 있습니다.'});return;}
    const snapshot=await this.repository.snapshot();const today=todayIso();const range={from:shiftIsoDate(today,-this.settings().timelinePastDays),to:shiftIsoDate(today,this.settings().timelineFutureDays)};
    const toolbar=root.createDiv({cls:'life-os-toolbar'});toolbar.createEl('span',{text:`${range.from} — ${range.to}`});const calendar=toolbar.createEl('button',{text:'달력 보기'});calendar.addEventListener('click',()=>void this.openCalendar());
    const filters=root.createDiv({cls:'life-os-filter-row'});for(const group of SOURCE_GROUPS){const active=group.sources.every((source)=>this.activeSources.has(source));const button=filters.createEl('button',{text:group.label,cls:`life-os-filter-chip${active?' is-active':''}`});button.setAttr('aria-pressed',String(active));button.addEventListener('click',()=>{for(const source of group.sources){if(active)this.activeSources.delete(source);else this.activeSources.add(source);}void this.render();});}
    const select=filters.createEl('select');select.setAttr('aria-label','특정 관계만 보기');select.createEl('option',{text:'모든 관계',value:''});for(const person of snapshot.people??[])select.createEl('option',{text:person.name,value:person.id});select.value=this.personId;select.addEventListener('change',()=>{this.personId=select.value;void this.render();});const done=filters.createEl('button',{text:this.showDone?'완료 표시':'완료 숨김',cls:`life-os-filter-chip${this.showDone?' is-active':''}`});done.addEventListener('click',()=>{this.showDone=!this.showDone;void this.render();});
    const events=filterTimelineEvents(buildTimelineEvents(snapshot,range),{sources:this.activeSources,personId:this.personId||undefined,showDone:this.showDone});
    if(!events.length){root.createDiv({cls:'life-os-empty',text:'선택한 조건에 맞는 기록이 없습니다.'});return;}
    const list=root.createDiv({cls:'life-os-timeline'});let previousDate='';for(const event of events){if(event.date!==previousDate){previousDate=event.date;list.createEl('h3',{cls:'life-os-timeline-divider',text:event.date||'기한 미정'});}const row=list.createDiv({cls:`life-os-timeline-event is-${event.status}`});row.createDiv({cls:'life-os-timeline-date',text:event.date||'기한 미정'});const copy=row.createDiv({cls:'life-os-timeline-copy'});copy.createEl('strong',{text:event.title});copy.createEl('small',{text:event.detail});row.createSpan({cls:'life-os-chip',text:SOURCE_LABELS[event.source]});if(event.path)row.addEventListener('click',()=>void this.app.workspace.openLinkText(event.path??'','',false));}
  }

  private async openCalendar():Promise<void>{const existing=this.app.workspace.getLeavesOfType(CALENDAR_VIEW_TYPE)[0];const leaf=existing??this.app.workspace.getLeaf(true);await leaf.setViewState({type:CALENDAR_VIEW_TYPE,active:true});this.app.workspace.revealLeaf(leaf);}
}
