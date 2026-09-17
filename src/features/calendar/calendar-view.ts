import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { TimelineSource } from '../../core/domain';
import type { VaultRepository } from '../../core/vault-repository';
import type { LifeOsSettings } from '../../settings';
import { buildTimelineEvents, filterTimelineEvents } from '../timeline/projector';
import { eventsForDate, monthGridDates, weekDates } from './engine';

export const CALENDAR_VIEW_TYPE='life-os-calendar';
type CalendarMode='month'|'week'|'list';
const SOURCE_GROUPS:Array<{label:string;sources:TimelineSource[]}>=[{label:'일정',sources:['block']},{label:'업무',sources:['task']},{label:'목표',sources:['goal']},{label:'관계',sources:['person','appointment']},{label:'재정',sources:['money']},{label:'집중·시간',sources:['time']}];
const SOURCE_LABELS:Record<TimelineSource,string>={block:'일정',task:'업무',goal:'목표',person:'관계',appointment:'약속',money:'재정',time:'집중·시간'};
function todayIso():string{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function shiftMonth(value:string,delta:number):string{const date=new Date(`${value}T12:00:00Z`);date.setUTCDate(1);date.setUTCMonth(date.getUTCMonth()+delta);return date.toISOString().slice(0,10);}
function shiftDays(value:string,delta:number):string{const date=new Date(`${value}T12:00:00Z`);date.setUTCDate(date.getUTCDate()+delta);return date.toISOString().slice(0,10);}

export class CalendarView extends ItemView {
  private mode:CalendarMode='month';private anchor=todayIso();private selectedDate=todayIso();private activeSources=new Set<TimelineSource>(['block','task','goal','person','appointment','money','time']);private personId='';private showDone=true;private initialized=false;
  constructor(leaf:WorkspaceLeaf,private readonly repository:VaultRepository,private readonly settings:()=>LifeOsSettings){super(leaf);}
  getViewType():string{return CALENDAR_VIEW_TYPE;}
  getDisplayText():string{return '라이프 OS 달력';}
  getIcon():string{return 'calendar-days';}
  async onOpen():Promise<void>{if(!this.initialized){this.mode=this.settings().calendarDefaultMode;this.showDone=this.settings().timelineShowDone;this.initialized=true;}await this.render();}

  async render():Promise<void>{
    const root=this.contentEl;root.empty();root.addClass('life-os-view','life-os-calendar');root.createEl('h1',{text:'달력'});root.createEl('p',{text:'타임라인과 같은 원본 데이터를 월간·주간·목록으로 바꿔 봅니다. 필터를 켜고 끄면 보고 싶은 기록만 남습니다.'});
    const snapshot=await this.repository.snapshot();this.renderControls(root,snapshot.people??[]);
    const dates=this.mode==='month'?monthGridDates(this.anchor):this.mode==='week'?weekDates(this.anchor):[];const range=this.mode==='list'?{from:shiftDays(todayIso(),-this.settings().timelinePastDays),to:shiftDays(todayIso(),this.settings().timelineFutureDays)}:{from:dates[0],to:dates[dates.length-1]};
    const all=buildTimelineEvents(snapshot,range);const events=filterTimelineEvents(all,{sources:this.activeSources,personId:this.personId||undefined,showDone:this.showDone});
    if(this.mode==='month')this.renderMonth(root,dates,events);else if(this.mode==='week')this.renderWeek(root,dates,events);else this.renderList(root,events);
  }

  private renderControls(root:HTMLElement,people:Array<{id:string;name:string}>):void{
    const toolbar=root.createDiv({cls:'life-os-toolbar'});const modes=toolbar.createDiv({cls:'life-os-segmented'});for(const [mode,label] of [['month','월간'],['week','주간'],['list','목록']] as Array<[CalendarMode,string]>){const button=modes.createEl('button',{text:label,cls:this.mode===mode?'is-active':''});button.setAttr('aria-pressed',String(this.mode===mode));button.addEventListener('click',()=>{this.mode=mode;void this.render();});}
    const nav=toolbar.createDiv({cls:'life-os-actions'});const prev=nav.createEl('button',{text:'‹'});prev.setAttr('aria-label','이전 기간');prev.addEventListener('click',()=>{this.anchor=this.mode==='month'?shiftMonth(this.anchor,-1):shiftDays(this.anchor,-7);void this.render();});const today=nav.createEl('button',{text:'오늘'});today.addEventListener('click',()=>{this.anchor=todayIso();this.selectedDate=todayIso();void this.render();});const next=nav.createEl('button',{text:'›'});next.setAttr('aria-label','다음 기간');next.addEventListener('click',()=>{this.anchor=this.mode==='month'?shiftMonth(this.anchor,1):shiftDays(this.anchor,7);void this.render();});
    const filters=root.createDiv({cls:'life-os-filter-row'});for(const group of SOURCE_GROUPS){const active=group.sources.every((source)=>this.activeSources.has(source));const button=filters.createEl('button',{text:group.label,cls:`life-os-filter-chip${active?' is-active':''}`});button.setAttr('aria-pressed',String(active));button.addEventListener('click',()=>{for(const source of group.sources){if(active)this.activeSources.delete(source);else this.activeSources.add(source);}void this.render();});}
    const select=filters.createEl('select');select.setAttr('aria-label','특정 관계만 보기');select.createEl('option',{text:'모든 관계',value:''});for(const person of people)select.createEl('option',{text:person.name,value:person.id});select.value=this.personId;select.addEventListener('change',()=>{this.personId=select.value;void this.render();});const done=filters.createEl('button',{text:this.showDone?'완료 표시':'완료 숨김',cls:`life-os-filter-chip${this.showDone?' is-active':''}`});done.addEventListener('click',()=>{this.showDone=!this.showDone;void this.render();});
  }

  private renderMonth(root:HTMLElement,dates:string[],events:ReturnType<typeof buildTimelineEvents>):void{
    const title=root.createEl('h2',{text:`${this.anchor.slice(0,7).replace('-','년 ')}월`});title.addClass('life-os-calendar-title');const heads=root.createDiv({cls:'life-os-calendar-head'});for(const day of ['월','화','수','목','금','토','일'])heads.createEl('span',{text:day});const grid=root.createDiv({cls:'life-os-calendar-grid'});const month=this.anchor.slice(0,7);
    for(const date of dates){const day=grid.createEl('button',{cls:`life-os-calendar-day${date===todayIso()?' is-today':''}${date===this.selectedDate?' is-selected':''}${!date.startsWith(month)?' is-outside':''}`});day.setAttr('aria-label',date);day.createEl('strong',{text:String(Number(date.slice(8,10)))});const dayEvents=eventsForDate(events,date);for(const event of dayEvents.slice(0,3))day.createEl('span',{cls:`life-os-calendar-dot source-${event.source}`,text:event.title});if(dayEvents.length>3)day.createEl('small',{text:`+${dayEvents.length-3}`});day.addEventListener('click',()=>{this.selectedDate=date;void this.render();});}
    this.renderSelectedDate(root,eventsForDate(events,this.selectedDate));
  }

  private renderWeek(root:HTMLElement,dates:string[],events:ReturnType<typeof buildTimelineEvents>):void{const grid=root.createDiv({cls:'life-os-week-calendar'});for(const date of dates){const column=grid.createDiv({cls:`life-os-calendar-column${date===todayIso()?' is-today':''}`});column.createEl('strong',{text:date});const items=eventsForDate(events,date);if(!items.length)column.createEl('small',{text:'기록 없음'});for(const event of items)this.renderEvent(column,event);}}
  private renderList(root:HTMLElement,events:ReturnType<typeof buildTimelineEvents>):void{const list=root.createDiv({cls:'life-os-card'});list.createEl('h2',{text:'일정 목록'});if(!events.length)list.createEl('p',{text:'선택한 조건에 맞는 기록이 없습니다.'});for(const event of events)this.renderEvent(list,event);}
  private renderSelectedDate(root:HTMLElement,events:ReturnType<typeof buildTimelineEvents>):void{const panel=root.createDiv({cls:'life-os-card'});panel.createEl('h2',{text:`${this.selectedDate} 기록`});if(!events.length)panel.createEl('p',{text:'이 날짜에 표시할 기록이 없습니다.'});for(const event of events)this.renderEvent(panel,event);}
  private renderEvent(container:HTMLElement,event:ReturnType<typeof buildTimelineEvents>[number]):void{const row=container.createDiv({cls:`life-os-calendar-event is-${event.status}`});const copy=row.createDiv();copy.createEl('strong',{text:event.title});copy.createEl('small',{text:event.detail});row.createSpan({cls:'life-os-chip',text:SOURCE_LABELS[event.source]});if(event.path)row.addEventListener('click',()=>void this.app.workspace.openLinkText(event.path??'','',false));}
}
