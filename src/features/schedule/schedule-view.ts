import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { VaultRepository } from '../../core/vault-repository';

export const SCHEDULE_VIEW_TYPE='life-os-schedule';
function iso(date:Date):string{return date.toISOString().slice(0,10);}
function monday(offset=0):Date{const now=new Date();const day=(now.getUTCDay()+6)%7;const start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-day+offset*7,12));return start;}
function addDays(date:Date,days:number):Date{const next=new Date(date);next.setUTCDate(next.getUTCDate()+days);return next;}
function duration(start:string,end:string):number{const [sh,sm]=start.split(':').map(Number);const [eh,em]=end.split(':').map(Number);return Math.max(0,eh*60+em-sh*60-sm);}

export class ScheduleView extends ItemView {
  private weekOffset=0;
  constructor(leaf:WorkspaceLeaf,private readonly repository:VaultRepository){super(leaf);}
  getViewType():string{return SCHEDULE_VIEW_TYPE;}
  getDisplayText():string{return '라이프 OS 주간 일정';}
  getIcon():string{return 'calendar-days';}
  async onOpen():Promise<void>{await this.render();}

  async render():Promise<void>{
    const root=this.contentEl;root.empty();root.addClass('life-os-view');const snapshot=await this.repository.snapshot();const start=monday(this.weekOffset);const days=Array.from({length:7},(_,i)=>addDays(start,i));
    const header=root.createDiv({cls:'life-os-schedule-head'});const copy=header.createDiv();copy.createEl('h1',{text:'주간 일정'});copy.createEl('p',{text:'시간을 먼저 보고, 필요한 일을 알맞은 자리에 배치합니다.'});const controls=header.createDiv({cls:'life-os-actions'});
    const prev=controls.createEl('button',{text:'← 이전 주'});prev.addEventListener('click',()=>{this.weekOffset-=1;void this.render();});const current=controls.createEl('button',{text:'이번 주'});current.addEventListener('click',()=>{this.weekOffset=0;void this.render();});const next=controls.createEl('button',{text:'다음 주 →'});next.addEventListener('click',()=>{this.weekOffset+=1;void this.render();});
    const dayKeys=new Set(days.map(iso));const growthMinutes=snapshot.blocks.filter((block)=>block.growth&&dayKeys.has(block.date)&&block.status!=='done').reduce((sum,block)=>sum+duration(block.startTime,block.endTime),0);
    root.createEl('p',{text:`${iso(days[0])} — ${iso(days[6])} · 이번 주 성장 시간 ${Math.floor(growthMinutes/60)}시간 ${growthMinutes%60}분`});
    const grid=root.createDiv({cls:'life-os-week-grid'});const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    for(const day of days){const key=iso(day);const column=grid.createDiv({cls:`life-os-day-column${key===today?' is-today':''}`});column.createEl('strong',{text:key});const blocks=snapshot.blocks.filter((block)=>block.date===key&&block.status!=='done').sort((a,b)=>a.startTime.localeCompare(b.startTime));if(!blocks.length)column.createEl('small',{text:'비어 있음'});for(const block of blocks){const card=column.createDiv({cls:`life-os-time-block${block.growth?' is-growth':''}`});card.createEl('small',{text:`${block.startTime}–${block.endTime}`});card.createEl('strong',{text:block.title});if(block.path)card.addEventListener('click',()=>void this.app.workspace.openLinkText(block.path??'','',false));}}
  }
}
