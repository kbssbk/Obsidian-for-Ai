import { ItemView, Notice, WorkspaceLeaf } from 'obsidian';
import type { LifeOsAppointment, LifeOsPerson } from '../../core/domain';
import type { VaultRepository } from '../../core/vault-repository';
import type { LifeOsSettings } from '../../settings';
import { splitPersonAppointments } from './projector';

export const RELATIONSHIPS_VIEW_TYPE='life-os-relationships';
function todayIso():string{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}

export class RelationshipsView extends ItemView {
  private selectedPersonId='';
  constructor(leaf:WorkspaceLeaf,private readonly repository:VaultRepository,private readonly settings:()=>LifeOsSettings){super(leaf);}
  getViewType():string{return RELATIONSHIPS_VIEW_TYPE;}
  getDisplayText():string{return '라이프 OS 관계';}
  getIcon():string{return 'users';}
  async onOpen():Promise<void>{await this.render();}

  async render():Promise<void>{
    const root=this.contentEl;root.empty();root.addClass('life-os-view','life-os-relationships');
    root.createEl('h1',{text:'관계'});root.createEl('p',{text:'연락처가 아니라, 한 사람과 이어지는 약속·만남·기억·다음 행동을 시간의 흐름으로 봅니다.'});
    const snapshot=await this.repository.snapshot();const people=(snapshot.people??[]).slice().sort((a,b)=>Number(Boolean(b.favorite))-Number(Boolean(a.favorite))||a.name.localeCompare(b.name,'ko'));
    if(!people.length){root.createDiv({cls:'life-os-empty',text:'아직 등록된 관계가 없습니다. 빠른 추가에서 관계 프로필을 먼저 만들어 보세요.'});return;}
    if(!this.selectedPersonId||!people.some((p)=>p.id===this.selectedPersonId))this.selectedPersonId=people[0].id;
    const layout=root.createDiv({cls:'life-os-relationship-layout'});const nav=layout.createDiv({cls:'life-os-relationship-list'});const detail=layout.createDiv({cls:'life-os-relationship-detail'});
    nav.createEl('h2',{text:'인연'});
    for(const person of people){const button=nav.createEl('button',{cls:`life-os-person-button${person.id===this.selectedPersonId?' is-active':''}`});button.createEl('strong',{text:`${person.favorite?'★ ':''}${person.name}`});button.createEl('span',{text:person.relationship??'관계 미정'});button.addEventListener('click',()=>{this.selectedPersonId=person.id;void this.render();});}
    const person=people.find((p)=>p.id===this.selectedPersonId) as LifeOsPerson;this.renderPerson(detail,person,snapshot.appointments??[],todayIso());
  }

  private renderPerson(container:HTMLElement,person:LifeOsPerson,appointments:LifeOsAppointment[],today:string):void{
    const head=container.createDiv({cls:'life-os-card life-os-relationship-hero'});const title=head.createDiv();title.createEl('h2',{text:person.name});title.createEl('p',{text:[person.relationship,person.organization].filter(Boolean).join(' · ')||'관계 정보를 추가해 보세요.'});
    const meta=head.createDiv({cls:'life-os-meta-grid'});this.meta(meta,'연락처',person.phone||person.email||'미입력');this.meta(meta,'관심사',person.interests||'미입력');this.meta(meta,'다음 연락',person.nextContactDate||'미정');this.meta(meta,'생일',person.birthday||'미입력');
    if(person.path){const actions=head.createDiv({cls:'life-os-actions'});const open=actions.createEl('button',{text:'프로필 노트 열기'});open.addEventListener('click',()=>void this.app.workspace.openLinkText(person.path??'','',false));}
    const {upcoming,past}=splitPersonAppointments(appointments,person.id,today);
    const next=container.createDiv({cls:'life-os-card'});next.createEl('h2',{text:'다음 약속'});if(!upcoming.length)next.createEl('p',{text:'예정된 약속이 없습니다.'});else this.renderAppointment(next,upcoming[0],true);
    const history=container.createDiv({cls:'life-os-card'});history.createEl('h2',{text:'관계 타임라인'});const all=[...upcoming.slice(1),...past].sort((a,b)=>`${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`)).slice(0,this.settings().relationshipHistoryLimit);if(!all.length)history.createEl('p',{text:'아직 쌓인 만남 기록이 없습니다.'});for(const appointment of all)this.renderAppointment(history,appointment,appointment.status==='planned');
  }

  private renderAppointment(container:HTMLElement,appointment:LifeOsAppointment,planned:boolean):void{
    const row=container.createDiv({cls:`life-os-appointment ${appointment.status==='done'?'is-done':''}`});const when=row.createDiv({cls:'life-os-appointment-when'});when.createEl('strong',{text:appointment.date});when.createEl('span',{text:`${appointment.startTime||'시간 미정'}${appointment.endTime?`–${appointment.endTime}`:''}`});const copy=row.createDiv({cls:'life-os-appointment-copy'});copy.createEl('strong',{text:appointment.title});copy.createEl('span',{text:[appointment.location,appointment.purpose].filter(Boolean).join(' · ')||'장소·목적 미입력'});if(appointment.note)copy.createEl('small',{text:`기록 · ${appointment.note}`});if(appointment.nextAction)copy.createEl('small',{text:`다음 행동 · ${appointment.nextAction}`});const actions=row.createDiv({cls:'life-os-actions'});if(planned&&appointment.path){const done=actions.createEl('button',{text:'만남 완료'});done.addEventListener('click',async()=>{await this.repository.setAppointmentStatus(appointment.path??'','done');new Notice(`${appointment.title} 기록을 완료했습니다.`);await this.render();});}if(appointment.path){const open=actions.createEl('button',{text:'열기'});open.addEventListener('click',()=>void this.app.workspace.openLinkText(appointment.path??'','',false));}
  }

  private meta(container:HTMLElement,label:string,value:string):void{const item=container.createDiv({cls:'life-os-meta'});item.createEl('span',{text:label});item.createEl('strong',{text:value});}
}
