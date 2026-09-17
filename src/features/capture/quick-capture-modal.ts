import { App, Modal, Notice, Setting } from 'obsidian';
import type { LifeOsPerson, TaskRecurrence } from '../../core/domain';
import type { VaultRepository } from '../../core/vault-repository';

type CaptureKind='task'|'block'|'appointment'|'goal'|'habit'|'person'|'money'|'budget'|'recurring'|'savings'|'timeLog';
function todayIso():string{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}

export class QuickCaptureModal extends Modal {
  private kind:CaptureKind='task';private title='';private date=todayIso();private start='09:00';private end='10:00';private priority=3;private estimatedMinutes=30;private recurrence:TaskRecurrence='none';private amount=0;private moneyKind:'expense'|'income'|'savings'='expense';private category='생활';private relationship='기타';private phone='';private email='';private organization='';private interests='';private birthday='';private currentAmount=0;private location='';private purpose='';private note='';private nextAction='';private people:LifeOsPerson[]=[];private selectedPersonIds=new Set<string>();
  constructor(app:App,private readonly repository:VaultRepository,private readonly onCreated?:()=>void){super(app);}
  onOpen():void{this.renderForm();void this.loadPeople();}
  onClose():void{this.contentEl.empty();}
  private async loadPeople():Promise<void>{const snapshot=await this.repository.snapshot();this.people=snapshot.people??[];if(this.kind==='appointment')this.renderForm();}

  private renderForm():void{
    const {contentEl}=this;contentEl.empty();contentEl.addClass('life-os-capture');contentEl.createEl('h2',{text:'라이프 OS · 빠른 추가'});contentEl.createEl('p',{text:'업무부터 약속과 관계 기록까지, 필요한 정보를 한 번에 남깁니다.'});
    new Setting(contentEl).setName('종류').addDropdown((dropdown)=>dropdown.addOptions({task:'업무',block:'일정',appointment:'약속·만남',goal:'목표',habit:'습관',person:'관계 프로필',money:'수입·지출',budget:'월 예산',recurring:'정기 결제',savings:'저축 목표',timeLog:'시간 사용 기록'}).setValue(this.kind).onChange((value)=>{this.kind=value as CaptureKind;this.title='';this.renderForm();}));
    new Setting(contentEl).setName(this.kind==='person'?'이름':'제목').addText((text)=>{text.setPlaceholder(this.placeholder()).setValue(this.title).onChange((value)=>{this.title=value.trim();});text.inputEl.focus();});

    if(this.kind==='task'){
      this.dateField(contentEl,'마감일');new Setting(contentEl).setName('우선순위').setDesc('1–5').addSlider((slider)=>slider.setLimits(1,5,1).setValue(this.priority).setDynamicTooltip().onChange((value)=>{this.priority=value;}));new Setting(contentEl).setName('예상 시간').setDesc('분').addText((text)=>text.setValue(String(this.estimatedMinutes)).onChange((value)=>{const n=Number(value);if(Number.isFinite(n))this.estimatedMinutes=Math.max(5,n);}));new Setting(contentEl).setName('반복').setDesc('완료하면 다음 마감일로 자동 이동합니다.').addDropdown((dropdown)=>dropdown.addOptions({none:'반복 없음',daily:'매일',weekly:'매주',monthly:'매월'}).setValue(this.recurrence).onChange((value)=>{this.recurrence=value as TaskRecurrence;}));
    }
    if(this.kind==='block'||this.kind==='timeLog'){
      this.dateField(contentEl,'날짜');this.timeFields(contentEl);if(this.kind==='timeLog')this.categoryField(contentEl,'분류','집중, 이동, 휴식 등');
    }
    if(this.kind==='appointment'){
      this.dateField(contentEl,'약속 날짜');this.timeFields(contentEl);new Setting(contentEl).setName('장소').setDesc('만날 장소나 접속 방법').addText((text)=>text.setPlaceholder('예: 수원역, 온라인').setValue(this.location).onChange((value)=>{this.location=value.trim();}));new Setting(contentEl).setName('목적').setDesc('왜 만나는지 간단히 남깁니다.').addText((text)=>text.setPlaceholder('예: 근황, 상담, 프로젝트 논의').setValue(this.purpose).onChange((value)=>{this.purpose=value.trim();}));this.renderPeoplePicker(contentEl);new Setting(contentEl).setName('메모').addTextArea((area)=>area.setPlaceholder('기억할 내용').setValue(this.note).onChange((value)=>{this.note=value.trim();}));new Setting(contentEl).setName('다음 행동').setDesc('만남 뒤 이어서 할 일').addText((text)=>text.setPlaceholder('예: 자료 보내기').setValue(this.nextAction).onChange((value)=>{this.nextAction=value.trim();}));
    }
    if(this.kind==='goal')this.dateField(contentEl,'목표일');
    if(this.kind==='habit')new Setting(contentEl).setName('반복').addDropdown((dropdown)=>dropdown.addOptions({daily:'매일',weekly:'매주'}).setValue('daily').onChange((value)=>{this.category=value;}));
    if(this.kind==='person'){
      new Setting(contentEl).setName('관계').addDropdown((dropdown)=>dropdown.addOptions({가족:'가족',친구:'친구',직장:'직장',고객:'고객',지인:'지인',기타:'기타'}).setValue(this.relationship).onChange((value)=>{this.relationship=value;}));new Setting(contentEl).setName('소속').addText((text)=>text.setPlaceholder('회사, 모임 등').setValue(this.organization).onChange((value)=>{this.organization=value.trim();}));new Setting(contentEl).setName('전화').addText((text)=>text.setValue(this.phone).onChange((value)=>{this.phone=value.trim();}));new Setting(contentEl).setName('이메일').addText((text)=>text.setValue(this.email).onChange((value)=>{this.email=value.trim();}));new Setting(contentEl).setName('관심사·기억할 점').addTextArea((area)=>area.setValue(this.interests).onChange((value)=>{this.interests=value.trim();}));new Setting(contentEl).setName('생일').addText((text)=>text.setPlaceholder('YYYY-MM-DD').setValue(this.birthday).onChange((value)=>{this.birthday=value.trim();}));this.dateField(contentEl,'다음 연락일');
    }
    if(this.kind==='money'){
      new Setting(contentEl).setName('종류').addDropdown((dropdown)=>dropdown.addOptions({expense:'지출',income:'수입',savings:'저축'}).setValue(this.moneyKind).onChange((value)=>{this.moneyKind=value as typeof this.moneyKind;}));this.amountField(contentEl,'금액',(value)=>{this.amount=value;});this.categoryField(contentEl,'분류','생활, 교통, 교육 등');this.dateField(contentEl,'날짜');
    }
    if(this.kind==='budget'){this.categoryField(contentEl,'분류','생활, 교통 등');this.amountField(contentEl,'월 예산',(value)=>{this.amount=value;});new Setting(contentEl).setName('월').addText((text)=>text.setPlaceholder('YYYY-MM').setValue(this.date.slice(0,7)).onChange((value)=>{this.date=value.trim();}));}
    if(this.kind==='recurring'){this.amountField(contentEl,'금액',(value)=>{this.amount=value;});this.dateField(contentEl,'다음 결제일');}
    if(this.kind==='savings'){this.amountField(contentEl,'목표 금액',(value)=>{this.amount=value;});this.amountField(contentEl,'현재 금액',(value)=>{this.currentAmount=value;});this.dateField(contentEl,'목표일');}
    new Setting(contentEl).addButton((button)=>button.setButtonText('저장').setCta().onClick(()=>void this.submit()));
  }

  private renderPeoplePicker(container:HTMLElement):void{const box=container.createDiv({cls:'life-os-people-picker'});box.createEl('strong',{text:'함께하는 사람'});box.createEl('small',{text:'여러 명을 선택할 수 있습니다. 약속은 선택한 사람 모두의 관계 이력에 나타납니다.'});if(!this.people.length){box.createEl('p',{text:'등록된 관계가 없습니다. 먼저 관계 프로필을 추가해도 되고, 사람 없이 약속만 저장해도 됩니다.'});return;}for(const person of this.people){const label=box.createEl('label',{cls:'life-os-picker-option'});const input=label.createEl('input');input.type='checkbox';input.checked=this.selectedPersonIds.has(person.id);input.addEventListener('change',()=>{if(input.checked)this.selectedPersonIds.add(person.id);else this.selectedPersonIds.delete(person.id);});label.createSpan({text:`${person.name}${person.relationship?` · ${person.relationship}`:''}`});}}
  private dateField(container:HTMLElement,name:string):void{new Setting(container).setName(name).addText((text)=>text.setPlaceholder(name==='월'?'YYYY-MM':'YYYY-MM-DD').setValue(this.date).onChange((value)=>{this.date=value.trim();}));}
  private timeFields(container:HTMLElement):void{new Setting(container).setName('시작').addText((text)=>text.setValue(this.start).onChange((value)=>{this.start=value.trim();}));new Setting(container).setName('종료').addText((text)=>text.setValue(this.end).onChange((value)=>{this.end=value.trim();}));}
  private categoryField(container:HTMLElement,name:string,placeholder:string):void{new Setting(container).setName(name).addText((text)=>text.setPlaceholder(placeholder).setValue(this.category).onChange((value)=>{this.category=value.trim();}));}
  private amountField(container:HTMLElement,name:string,onChange:(value:number)=>void):void{new Setting(container).setName(name).addText((text)=>text.setValue('').onChange((value)=>{const n=Number(value);if(Number.isFinite(n))onChange(Math.max(0,n));}));}
  private placeholder():string{return this.kind==='task'?'해야 할 일':this.kind==='block'?'일정 이름':this.kind==='appointment'?'예: 민수와 저녁 약속':this.kind==='goal'?'목표 이름':this.kind==='habit'?'습관 이름':this.kind==='person'?'이름':this.kind==='budget'?'예: 생활 예산':this.kind==='recurring'?'예: 구독 서비스':this.kind==='savings'?'예: 비상금':this.kind==='timeLog'?'무엇을 했나요?':'예: 장보기';}

  private async submit():Promise<void>{
    if(!this.title){new Notice('제목을 입력하세요.');return;}let path='';
    if(this.kind==='task')path=await this.repository.createInboxTask(this.title,this.date,this.priority,this.estimatedMinutes,this.recurrence);
    if(this.kind==='block')path=await this.repository.createLifeNote('block',this.title,{date:this.date,start_time:this.start,end_time:this.end,status:'todo'});
    if(this.kind==='appointment')path=await this.repository.createAppointment(this.title,{date:this.date,startTime:this.start,endTime:this.end,location:this.location,purpose:this.purpose,personIds:[...this.selectedPersonIds],note:this.note,nextAction:this.nextAction});
    if(this.kind==='goal')path=await this.repository.createLifeNote('goal',this.title,{target_date:this.date,status:'active',progress:0});
    if(this.kind==='habit')path=await this.repository.createLifeNote('habit',this.title,{frequency:this.category==='weekly'?'weekly':'daily'});
    if(this.kind==='person')path=await this.repository.createLifeNote('person',this.title,{relationship:this.relationship,organization:this.organization,phone:this.phone,email:this.email,interests:this.interests,birthday:this.birthday,next_contact:this.date});
    if(this.kind==='money')path=await this.repository.createLifeNote('money',this.title,{kind:this.moneyKind,amount:this.amount,category:this.category,date:this.date});
    if(this.kind==='budget')path=await this.repository.createLifeNote('budget',this.title,{month:this.date.slice(0,7),category:this.category,limit_amount:this.amount});
    if(this.kind==='recurring')path=await this.repository.createLifeNote('recurring_payment',this.title,{amount:this.amount,next_due:this.date,active:true});
    if(this.kind==='savings')path=await this.repository.createLifeNote('savings_goal',this.title,{target_amount:this.amount,current_amount:this.currentAmount,target_date:this.date});
    if(this.kind==='timeLog')path=await this.repository.createLifeNote('time_log',this.title,{date:this.date,start_time:this.start,end_time:this.end,category:this.category});
    new Notice(`${this.title} 저장 완료`);this.close();this.onCreated?.();await this.app.workspace.openLinkText(path,'',false);
  }
}
