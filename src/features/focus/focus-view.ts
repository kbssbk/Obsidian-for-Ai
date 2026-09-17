import { ItemView, Notice, WorkspaceLeaf } from 'obsidian';
import type { VaultRepository } from '../../core/vault-repository';
import type { ActiveFocusSession, LifeOsSettings } from '../../settings';

export const FOCUS_VIEW_TYPE='life-os-focus';

function elapsedMinutes(session:ActiveFocusSession,now=Date.now()):number{return Math.max(0,Math.floor((now-session.startedAt)/60000));}
function formatClock(totalSeconds:number):string{const safe=Math.max(0,totalSeconds);const m=Math.floor(safe/60);const s=safe%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}

export class FocusView extends ItemView {
  private timer:number|null=null;
  private selectedTaskId='';
  private selectedTitle='';
  constructor(leaf:WorkspaceLeaf,private readonly repository:VaultRepository,private readonly settings:()=>LifeOsSettings,private readonly save:()=>Promise<void>){super(leaf);}
  getViewType():string{return FOCUS_VIEW_TYPE;}
  getDisplayText():string{return '라이프 OS 집중 타이머';}
  getIcon():string{return 'timer';}
  async onOpen():Promise<void>{await this.render();this.startTicker();}
  async onClose():Promise<void>{this.stopTicker();}

  async render():Promise<void>{
    const root=this.contentEl;root.empty();root.addClass('life-os-view');root.createEl('h1',{text:'집중 타이머'});root.createEl('p',{text:'업무를 고르고 집중을 시작하면 종료할 때 시간 기록이 자동으로 남습니다.'});
    const snapshot=await this.repository.snapshot();const active=this.settings().activeFocus;
    if(active){
      const card=root.createDiv({cls:'life-os-card life-os-focus-timer'});card.createEl('h2',{text:active.title});
      const seconds=Math.floor((Date.now()-active.startedAt)/1000);const planned=active.plannedMinutes*60;const remaining=active.mode==='free'?seconds:Math.max(0,planned-seconds);
      card.createEl('div',{cls:'life-os-timer-clock',text:formatClock(remaining)});card.createEl('p',{text:active.mode==='free'?`자유 집중 · ${elapsedMinutes(active)}분 진행 중`:`${active.plannedMinutes}분 집중 · ${seconds>=planned?'목표 시간 완료':'진행 중'}`});
      const actions=card.createDiv({cls:'life-os-actions'});const finish=actions.createEl('button',{text:'집중 종료 및 기록'});finish.addEventListener('click',()=>void this.finish());const cancel=actions.createEl('button',{text:'기록 없이 취소'});cancel.addEventListener('click',()=>void this.cancel());
      card.createEl('small',{text:`종료 후 ${this.settings().breakMinutes}분 휴식을 권장합니다.`});return;
    }
    const card=root.createDiv({cls:'life-os-card'});card.createEl('h2',{text:'새 집중 시작'});const openTasks=snapshot.tasks.filter((task)=>task.status!=='done');
    if(!openTasks.length){card.createEl('p',{text:'집중할 열린 업무가 없습니다. 먼저 빠른 추가에서 업무를 만들어 주세요.'});return;}
    const select=card.createEl('select');select.createEl('option',{text:'업무 선택',value:''});for(const task of openTasks){select.createEl('option',{text:`${task.title}${task.due?` · ${task.due}`:''}`,value:task.id});}
    select.addEventListener('change',()=>{const task=openTasks.find((item)=>item.id===select.value);this.selectedTaskId=task?.id??'';this.selectedTitle=task?.title??'';});
    const actions=card.createDiv({cls:'life-os-actions'});const pomodoro=actions.createEl('button',{text:`${this.settings().focusMinutes}분 집중 시작`});pomodoro.addEventListener('click',()=>void this.start('pomodoro'));const free=actions.createEl('button',{text:'자유 집중 시작'});free.addEventListener('click',()=>void this.start('free'));
    const todayLogs=(snapshot.timeLogs??[]).filter((log)=>log.category==='집중');if(todayLogs.length)root.createDiv({cls:'life-os-card'}).createEl('p',{text:`저장된 집중 기록 ${todayLogs.length}건`});
  }

  private async start(mode:'pomodoro'|'free'):Promise<void>{if(!this.selectedTaskId){new Notice('집중할 업무를 먼저 선택하세요.');return;}this.settings().activeFocus={taskId:this.selectedTaskId,title:this.selectedTitle,startedAt:Date.now(),plannedMinutes:this.settings().focusMinutes,mode};await this.save();new Notice(`${this.selectedTitle} 집중을 시작했습니다.`);await this.render();}
  private async finish():Promise<void>{const active=this.settings().activeFocus;if(!active)return;const endedAt=Date.now();if(endedAt-active.startedAt<30000){new Notice('30초 미만의 세션은 시간 기록으로 저장하지 않습니다.');this.settings().activeFocus=null;await this.save();await this.render();return;}await this.repository.createFocusLog(active.title,active.taskId,active.startedAt,endedAt);this.settings().activeFocus=null;await this.save();new Notice(`집중 ${Math.max(1,Math.round((endedAt-active.startedAt)/60000))}분을 기록했습니다.`);await this.render();}
  private async cancel():Promise<void>{this.settings().activeFocus=null;await this.save();new Notice('집중 세션을 취소했습니다.');await this.render();}
  private startTicker():void{this.stopTicker();this.timer=window.setInterval(()=>{if(this.settings().activeFocus)void this.render();},1000);}
  private stopTicker():void{if(this.timer!==null){window.clearInterval(this.timer);this.timer=null;}}
}
