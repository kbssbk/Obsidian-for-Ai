import { ItemView, Notice, WorkspaceLeaf } from 'obsidian';
import type { VaultRepository } from '../../core/vault-repository';

export const AREAS_VIEW_TYPE='life-os-areas';
function todayIso():string { return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }

export class AreasView extends ItemView {
  constructor(leaf:WorkspaceLeaf,private readonly repository:VaultRepository){super(leaf);}
  getViewType():string{return AREAS_VIEW_TYPE;}
  getDisplayText():string{return 'Life OS 생활 영역';}
  getIcon():string{return 'layout-grid';}
  async onOpen():Promise<void>{await this.render();}

  async render():Promise<void>{
    const root=this.contentEl; root.empty(); root.addClass('life-os-view');
    const snapshot=await this.repository.snapshot(); const today=todayIso();
    root.createEl('h1',{text:'생활 영역'}); root.createEl('p',{text:'목표·사람·돈을 흩어진 데이터가 아니라 같은 삶의 흐름으로 관리합니다.'});

    const goals=root.createDiv({cls:'life-os-card'}); goals.createEl('h2',{text:'목표 · Growth Paths'});
    const activeGoals=(snapshot.goals??[]).filter((goal)=>goal.status!=='done');
    if(!activeGoals.length)goals.createEl('p',{text:'활성 목표가 없습니다.'});
    for(const goal of activeGoals){
      const wrap=goals.createDiv({cls:'life-os-area-block'}); const head=wrap.createDiv({cls:'life-os-row'}); head.createEl('strong',{text:goal.title}); head.createEl('span',{text:`${goal.progress}%${goal.targetDate?` · 목표일 ${goal.targetDate}`:''}`});
      if(goal.path)head.addEventListener('click',()=>void this.app.workspace.openLinkText(goal.path??'','',false));
      if(goal.description)wrap.createEl('small',{text:goal.description});
      const milestones=(snapshot.milestones??[]).filter((item)=>item.goalId===goal.id).sort((a,b)=>a.position-b.position||a.dueDate.localeCompare(b.dueDate));
      for(const milestone of milestones){
        const row=wrap.createDiv({cls:'life-os-row'}); const checkbox=row.createEl('input'); checkbox.type='checkbox'; checkbox.checked=milestone.done; row.createEl('span',{text:`${milestone.title} · ${milestone.dueDate}`});
        checkbox.addEventListener('change',async()=>{if(!milestone.path)return;await this.repository.setMilestoneDone(milestone.path,checkbox.checked);await this.render();});
      }
      const actions=snapshot.goalActions.filter((action)=>action.goalId===goal.id&&!action.done); if(actions.length){wrap.createEl('small',{text:`다음 행동: ${actions[0].title} · ${actions[0].estimatedMinutes}분`});}
    }

    const people=root.createDiv({cls:'life-os-card'}); people.createEl('h2',{text:'사람 · Connections'});
    const visiblePeople=(snapshot.people??[]).slice().sort((a,b)=>Number(Boolean(b.favorite))-Number(Boolean(a.favorite))||(a.nextContactDate??'9999').localeCompare(b.nextContactDate??'9999')||a.name.localeCompare(b.name,'ko'));
    if(!visiblePeople.length)people.createEl('p',{text:'등록된 사람이 없습니다.'});
    for(const person of visiblePeople.slice(0,12)){
      const row=people.createDiv({cls:'life-os-person-row'}); const copy=row.createDiv(); copy.createEl('strong',{text:`${person.favorite?'★ ':''}${person.name}`}); copy.createEl('small',{text:`${person.relationship??'관계 미정'}${person.organization?` · ${person.organization}`:''}${person.nextContactDate?` · 다음 연락 ${person.nextContactDate}`:''}`});
      const actions=row.createDiv({cls:'life-os-actions'});
      if(person.path){
        const fav=actions.createEl('button',{text:person.favorite?'★':'☆'}); fav.setAttr('aria-label','즐겨찾기'); fav.addEventListener('click',async()=>{await this.repository.setPersonFavorite(person.path??'',!person.favorite);await this.render();});
        if(person.nextContactDate&&person.nextContactDate<=today){const contacted=actions.createEl('button',{text:'연락 완료'});contacted.addEventListener('click',async()=>{await this.repository.markPersonContacted(person.path??'',today);new Notice(`${person.name} 연락 기록 완료`);await this.render();});}
        const open=actions.createEl('button',{text:'열기'});open.addEventListener('click',()=>void this.app.workspace.openLinkText(person.path??'','',false));
      }
    }

    const money=root.createDiv({cls:'life-os-card'}); money.createEl('h2',{text:'돈 · Money Flow'}); const month=today.slice(0,7);
    const monthEntries=(snapshot.moneyEntries??[]).filter((entry)=>entry.date.startsWith(month));
    const income=monthEntries.filter((entry)=>entry.kind==='income').reduce((sum,entry)=>sum+entry.amount,0);
    const expense=monthEntries.filter((entry)=>entry.kind==='expense').reduce((sum,entry)=>sum+entry.amount,0);
    const savings=monthEntries.filter((entry)=>entry.kind==='savings').reduce((sum,entry)=>sum+entry.amount,0);
    money.createEl('p',{text:`수입 ${income.toLocaleString('ko-KR')}원 · 지출 ${expense.toLocaleString('ko-KR')}원 · 저축 ${savings.toLocaleString('ko-KR')}원 · 순흐름 ${(income-expense-savings).toLocaleString('ko-KR')}원`});
    for(const budget of (snapshot.budgets??[]).filter((item)=>item.month===month)){
      const spent=monthEntries.filter((entry)=>entry.kind==='expense'&&entry.category===budget.category).reduce((sum,entry)=>sum+entry.amount,0); const ratio=budget.limitAmount?Math.round(spent/budget.limitAmount*100):0;
      const row=money.createDiv({cls:'life-os-budget-row'}); row.createEl('strong',{text:`${budget.category} 예산`}); row.createEl('progress').setAttrs({value:String(Math.min(100,ratio)),max:'100'}); row.createEl('span',{text:`${spent.toLocaleString('ko-KR')} / ${budget.limitAmount.toLocaleString('ko-KR')}원 · ${ratio}%`});
    }
    const upcoming=(snapshot.recurringPayments??[]).filter((item)=>item.active&&item.nextDueDate>=today).sort((a,b)=>a.nextDueDate.localeCompare(b.nextDueDate)).slice(0,5);
    if(upcoming.length){money.createEl('h3',{text:'다가오는 정기 결제'});for(const item of upcoming)money.createEl('p',{text:`• ${item.nextDueDate} · ${item.title} · ${item.amount.toLocaleString('ko-KR')}원`});}
    const savingGoals=snapshot.savingsGoals??[]; if(savingGoals.length){money.createEl('h3',{text:'저축 목표'});for(const goal of savingGoals){const ratio=goal.targetAmount?Math.round(goal.currentAmount/goal.targetAmount*100):0;const row=money.createDiv({cls:'life-os-budget-row'});row.createEl('strong',{text:goal.title});row.createEl('progress').setAttrs({value:String(Math.min(100,ratio)),max:'100'});row.createEl('span',{text:`${goal.currentAmount.toLocaleString('ko-KR')} / ${goal.targetAmount.toLocaleString('ko-KR')}원 · ${ratio}% · ${goal.targetDate}`});}}
    for(const entry of monthEntries.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8)){const row=money.createDiv({cls:'life-os-row'});row.createEl('span',{text:`${entry.date} · ${entry.title}${entry.category?` · ${entry.category}`:''}`});row.createEl('strong',{text:`${entry.kind==='expense'?'-':entry.kind==='income'?'+':'↗'}${entry.amount.toLocaleString('ko-KR')}원`});}
  }
}
