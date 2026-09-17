import { App, Modal, Notice, Setting } from 'obsidian';
import type { VaultRepository } from '../../core/vault-repository';

type CaptureKind = 'task' | 'block' | 'goal' | 'person' | 'money' | 'timeLog';

export class QuickCaptureModal extends Modal {
  private kind:CaptureKind='task';
  private title='';
  private date='';
  private start='09:00';
  private end='10:00';
  private priority=3;
  private estimatedMinutes=30;
  private amount=0;
  private moneyKind:'expense'|'income'|'savings'='expense';
  private category='생활';
  private relationship='기타';
  private phone='';

  constructor(app:App,private readonly repository:VaultRepository,private readonly onCreated?:()=>void){super(app);}
  onOpen():void{this.renderForm();}
  onClose():void{this.contentEl.empty();}

  private renderForm():void{
    const {contentEl}=this;contentEl.empty();contentEl.createEl('h2',{text:'빠른 추가'});contentEl.createEl('p',{text:'어느 화면에 있든 일정·업무·목표·사람·돈·시간 사용을 바로 기록합니다.'});
    new Setting(contentEl).setName('종류').addDropdown((dropdown)=>dropdown.addOptions({task:'업무',block:'일정',goal:'목표',person:'사람',money:'돈',timeLog:'시간 사용 기록'}).setValue(this.kind).onChange((value)=>{this.kind=value as CaptureKind;this.title='';this.renderForm();}));
    new Setting(contentEl).setName(this.kind==='person'?'이름':'제목').addText((text)=>{text.setPlaceholder(this.placeholder()).setValue(this.title).onChange((value)=>{this.title=value.trim();});text.inputEl.focus();});

    if(this.kind==='task'){
      new Setting(contentEl).setName('마감일').addText((text)=>text.setPlaceholder('YYYY-MM-DD').setValue(this.date).onChange((value)=>{this.date=value.trim();}));
      new Setting(contentEl).setName('우선순위').setDesc('1–5').addSlider((slider)=>slider.setLimits(1,5,1).setValue(this.priority).setDynamicTooltip().onChange((value)=>{this.priority=value;}));
      new Setting(contentEl).setName('예상 시간').setDesc('분').addText((text)=>text.setValue(String(this.estimatedMinutes)).onChange((value)=>{const n=Number(value);if(Number.isFinite(n))this.estimatedMinutes=Math.max(5,n);}));
    }
    if(this.kind==='block'||this.kind==='timeLog'){
      new Setting(contentEl).setName('날짜').addText((text)=>text.setPlaceholder('YYYY-MM-DD').setValue(this.date).onChange((value)=>{this.date=value.trim();}));
      new Setting(contentEl).setName('시작').addText((text)=>text.setValue(this.start).onChange((value)=>{this.start=value.trim();}));
      new Setting(contentEl).setName('종료').addText((text)=>text.setValue(this.end).onChange((value)=>{this.end=value.trim();}));
      if(this.kind==='timeLog')new Setting(contentEl).setName('분류').addText((text)=>text.setPlaceholder('집중, 이동, 휴식 등').setValue(this.category).onChange((value)=>{this.category=value.trim();}));
    }
    if(this.kind==='goal')new Setting(contentEl).setName('목표일').addText((text)=>text.setPlaceholder('YYYY-MM-DD').setValue(this.date).onChange((value)=>{this.date=value.trim();}));
    if(this.kind==='person'){
      new Setting(contentEl).setName('관계').addDropdown((dropdown)=>dropdown.addOptions({가족:'가족',친구:'친구',직장:'직장',고객:'고객',회중:'회중',기타:'기타'}).setValue(this.relationship).onChange((value)=>{this.relationship=value;}));
      new Setting(contentEl).setName('전화').addText((text)=>text.setValue(this.phone).onChange((value)=>{this.phone=value.trim();}));
      new Setting(contentEl).setName('다음 연락일').addText((text)=>text.setPlaceholder('YYYY-MM-DD').setValue(this.date).onChange((value)=>{this.date=value.trim();}));
    }
    if(this.kind==='money'){
      new Setting(contentEl).setName('종류').addDropdown((dropdown)=>dropdown.addOptions({expense:'지출',income:'수입',savings:'저축'}).setValue(this.moneyKind).onChange((value)=>{this.moneyKind=value as typeof this.moneyKind;}));
      new Setting(contentEl).setName('금액').addText((text)=>text.setValue(this.amount?String(this.amount):'').onChange((value)=>{const n=Number(value);if(Number.isFinite(n))this.amount=Math.max(0,n);}));
      new Setting(contentEl).setName('분류').addText((text)=>text.setValue(this.category).onChange((value)=>{this.category=value.trim();}));
      new Setting(contentEl).setName('날짜').addText((text)=>text.setPlaceholder('YYYY-MM-DD').setValue(this.date).onChange((value)=>{this.date=value.trim();}));
    }
    new Setting(contentEl).addButton((button)=>button.setButtonText('저장').setCta().onClick(()=>void this.submit()));
  }

  private placeholder():string{return this.kind==='task'?'해야 할 일':this.kind==='block'?'일정 이름':this.kind==='goal'?'목표 이름':this.kind==='person'?'이름':this.kind==='timeLog'?'무엇을 했나요?':'예: 장보기';}

  private async submit():Promise<void>{
    if(!this.title){new Notice('제목을 입력하세요.');return;}let path='';
    if(this.kind==='task')path=await this.repository.createInboxTask(this.title,this.date,this.priority,this.estimatedMinutes);
    if(this.kind==='block')path=await this.repository.createLifeNote('block',this.title,{date:this.date,start_time:this.start,end_time:this.end,status:'todo'});
    if(this.kind==='goal')path=await this.repository.createLifeNote('goal',this.title,{target_date:this.date,status:'active',progress:0});
    if(this.kind==='person')path=await this.repository.createLifeNote('person',this.title,{relationship:this.relationship,phone:this.phone,next_contact:this.date});
    if(this.kind==='money')path=await this.repository.createLifeNote('money',this.title,{kind:this.moneyKind,amount:this.amount,category:this.category,date:this.date});
    if(this.kind==='timeLog')path=await this.repository.createLifeNote('time_log',this.title,{date:this.date,start_time:this.start,end_time:this.end,category:this.category});
    new Notice(`${this.title} 저장 완료`);this.close();this.onCreated?.();await this.app.workspace.openLinkText(path,'',false);
  }
}
