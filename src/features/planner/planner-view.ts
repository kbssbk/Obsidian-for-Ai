import { ItemView, Notice, WorkspaceLeaf } from 'obsidian';
import type { VaultRepository } from '../../core/vault-repository';
import type { LifeOsSettings } from '../../settings';
import { buildDailyPlan, computeReviewStats, findOpenSlot, findScheduleConflicts, TIME_SAVING_SOURCE_URL } from './engine';

export const PLANNER_VIEW_TYPE='life-os-planner';
function seoulToday():string{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}

export class PlannerView extends ItemView {
  constructor(leaf:WorkspaceLeaf,private readonly repository:VaultRepository,private readonly settings:()=>LifeOsSettings){super(leaf);}
  getViewType():string{return PLANNER_VIEW_TYPE;}
  getDisplayText():string{return '라이프 OS 계획·회고';}
  getIcon():string{return 'calendar-check-2';}
  async onOpen():Promise<void>{await this.render();}

  async render():Promise<void>{
    const root=this.contentEl;root.empty();root.addClass('life-os-view');const today=seoulToday();const snapshot=await this.repository.snapshot();const settings=this.settings();
    const plan=buildDailyPlan(snapshot,today,{availableMinutes:settings.plannerAvailableMinutes,bufferRatio:settings.plannerBufferPercent/100,maxItems:settings.plannerMaxItems});
    const review=computeReviewStats(snapshot,today);const conflicts=findScheduleConflicts(snapshot.blocks).filter(({a})=>a.date>=today);const peakEarliest=this.toMinutes(settings.energyPeakStart);const peakDuration=Math.max(5,this.toMinutes(settings.energyPeakEnd)-peakEarliest);const peakSlot=findOpenSlot(snapshot.blocks,today,Math.min(peakDuration,90),peakEarliest);const overdueBlocks=snapshot.blocks.filter((block)=>block.date<today&&block.status!=='done').sort((a,b)=>b.date.localeCompare(a.date));
    root.createEl('h1',{text:'계획 · 습관 · 회고'});root.createEl('p',{text:`${today} · 중요한 일부터, 일정은 여유 있게.`});

    const focus=root.createDiv({cls:'life-os-card'});focus.createEl('h2',{text:'지금 할 한 가지'});
    if(plan.focus){focus.createEl('strong',{text:plan.focus.title});focus.createEl('p',{text:`우선순위 ${plan.focus.priority??3} · 예상 ${plan.focus.estimatedMinutes??30}분${plan.focus.due?` · 마감 ${plan.focus.due}`:''}`});focus.createEl('small',{text:`집중이 잘되는 시간 ${settings.energyPeakStart}–${settings.energyPeakEnd}${peakSlot?` · 비어 있는 시간 ${peakSlot.startTime}–${peakSlot.endTime}`:' · 비어 있는 시간 없음'}`});if(plan.focus.path){const open=focus.createEl('button',{text:'열기'});open.addEventListener('click',()=>void this.app.workspace.openLinkText(plan.focus?.path??'','',false));}}else focus.createEl('p',{text:'지금 바로 처리해야 할 열린 업무가 없습니다.'});

    const todayCard=root.createDiv({cls:'life-os-card'});todayCard.createEl('h2',{text:'오늘'});todayCard.createEl('p',{text:`계획 ${plan.plannedMinutes}분 · 여유 시간 ${plan.bufferMinutes}분 · 재충전 ${settings.rechargeMinutes}분${plan.overload?' · 계획이 너무 많습니다':''}`});
    if(!plan.today.length)todayCard.createEl('p',{text:'오늘로 잡힌 업무가 없습니다.'});for(const task of plan.today){const row=todayCard.createDiv({cls:'life-os-row'});row.createEl('strong',{text:task.title});row.createEl('span',{text:`${task.estimatedMinutes??30}분`});}
    if(conflicts.length){todayCard.createEl('h3',{text:`겹치는 일정 ${conflicts.length}건`});for(const {a,b} of conflicts.slice(0,5))todayCard.createEl('p',{text:`⚠ ${a.date} ${a.title} ↔ ${b.title}`});}
    const smallTasks=snapshot.tasks.filter((task)=>task.status!=='done'&&(task.estimatedMinutes??30)<=15).sort((a,b)=>(b.priority??3)-(a.priority??3)).slice(0,3);if(smallTasks.length){todayCard.createEl('h3',{text:'짧은 시간에 할 수 있는 일'});for(const task of smallTasks)todayCard.createEl('p',{text:`• ${task.title} · ${task.estimatedMinutes??30}분`});}

    const tomorrowCard=root.createDiv({cls:'life-os-card'});tomorrowCard.createEl('h2',{text:'내일 이후'});if(!plan.tomorrow.length)tomorrowCard.createEl('p',{text:'뒤로 미뤄 둔 열린 업무가 없습니다.'});for(const task of plan.tomorrow)tomorrowCard.createEl('p',{text:`• ${task.title} · ${task.due||'기한 미정'}`});

    if(overdueBlocks.length){const recovery=root.createDiv({cls:'life-os-card'});recovery.createEl('h2',{text:'미룬 일정 다시 정리하기'});recovery.createEl('p',{text:'미룬 일정은 다시 배치하거나 짧게 줄여 정리할 수 있습니다.'});for(const block of overdueBlocks.slice(0,5)){const row=recovery.createDiv({cls:'life-os-recovery-row'});const copy=row.createDiv();copy.createEl('strong',{text:block.title});copy.createEl('small',{text:`${block.date} · ${block.startTime}–${block.endTime}`});const actions=row.createDiv({cls:'life-os-actions'});if(block.path){for(const [label,action] of [['내일로','tomorrow'],['5분으로 줄이기','shrink'],['완료','complete']] as const){const button=actions.createEl('button',{text:label});button.addEventListener('click',async()=>{await this.repository.recoverBlock(block.path??'',action);new Notice(`${block.title}: ${label}`);await this.render();});}}}}

    const habitCard=root.createDiv({cls:'life-os-card'});habitCard.createEl('h2',{text:'습관 기록'});if(!(snapshot.habits??[]).length)habitCard.createEl('p',{text:'빠른 추가에서 습관을 만들면 여기에 표시됩니다.'});for(const habit of snapshot.habits??[]){const row=habitCard.createDiv({cls:'life-os-row'});const checkbox=row.createEl('input');checkbox.type='checkbox';checkbox.checked=habit.checkins.includes(today);row.createEl('span',{text:habit.title});checkbox.addEventListener('change',async()=>{if(!habit.path)return;await this.repository.setHabitCheckin(habit.path,today,checkbox.checked);new Notice(checkbox.checked?'오늘의 습관을 기록했습니다.':'오늘의 습관 기록을 취소했습니다.');await this.render();});}

    const reviewCard=root.createDiv({cls:'life-os-card'});reviewCard.createEl('h2',{text:'회고 · 분석'});reviewCard.createEl('p',{text:`업무 완료 ${review.tasks.completed}/${review.tasks.total} · 기한 지난 업무 ${review.overdueOpen}개 · 진행 중 프로젝트 ${review.activeProjects}개 · 진행 중 목표 ${review.activeGoals}개 · 연락 예정 ${review.duePeople}명`});reviewCard.createEl('p',{text:`이번 달 수입 ${review.money.income.toLocaleString('ko-KR')}원 · 지출 ${review.money.expense.toLocaleString('ko-KR')}원`});reviewCard.createEl('p',{text:`오늘 기록된 시간 ${review.timeUse.totalMinutes}분`});for(const category of review.timeUse.categories.slice(0,5))reviewCard.createEl('p',{text:`${category.category}: ${category.minutes}분`});for(const habit of review.habits)reviewCard.createEl('p',{text:`${habit.title}: 연속 ${habit.streak}일`});reviewCard.createEl('p',{text:'업무·습관·시간·재정·관계 지표는 하나의 점수로 합치지 않습니다.'});

    const source=root.createDiv({cls:'life-os-card'});source.createEl('h2',{text:'채택한 시간 관리 원칙'});source.createEl('p',{text:'우선순위, 현실적인 계획, 시간 사용 기록, 여유 시간, 방해 최소화, 집중 시간대, 자투리 시간, 80/20, 오늘/내일 구분, 재충전, 완벽주의 방지, 유연한 재계획을 반영합니다.'});const link=source.createEl('a',{text:'참조 근거: 「시간을 절약하는 20가지 방법」'});link.href=TIME_SAVING_SOURCE_URL;link.target='_blank';link.rel='noopener noreferrer';
  }

  private toMinutes(value:string):number{const [h,m]=value.split(':').map(Number);return Number.isFinite(h)&&Number.isFinite(m)?h*60+m:9*60;}
}
