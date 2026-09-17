import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { VaultRepository } from '../../core/vault-repository';

export const AREAS_VIEW_TYPE = 'life-os-areas';

function todayIso(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
}

export class AreasView extends ItemView {
  constructor(leaf: WorkspaceLeaf, private readonly repository: VaultRepository) { super(leaf); }
  getViewType(): string { return AREAS_VIEW_TYPE; }
  getDisplayText(): string { return 'Life OS 생활 영역'; }
  getIcon(): string { return 'layout-grid'; }
  async onOpen(): Promise<void> { await this.render(); }

  async render(): Promise<void> {
    const root = this.contentEl;
    root.empty();
    root.addClass('life-os-view');
    const snapshot = await this.repository.snapshot();
    const today = todayIso();
    root.createEl('h1', { text:'생활 영역' });
    root.createEl('p', { text:'목표·사람·돈을 같은 원본 데이터에서 연결해 봅니다.' });

    const goals = root.createDiv({ cls:'life-os-card' });
    goals.createEl('h2', { text:'목표' });
    const activeGoals = (snapshot.goals ?? []).filter((goal) => goal.status !== 'done');
    if (!activeGoals.length) goals.createEl('p', { text:'활성 목표가 없습니다.' });
    for (const goal of activeGoals) {
      const row = goals.createDiv({ cls:'life-os-row' });
      row.createEl('strong', { text:goal.title });
      row.createEl('span', { text:`${goal.progress}%${goal.targetDate ? ` · ${goal.targetDate}` : ''}` });
      if (goal.path) row.addEventListener('click', () => void this.app.workspace.openLinkText(goal.path ?? '', '', false));
    }

    const people = root.createDiv({ cls:'life-os-card' });
    people.createEl('h2', { text:'연락할 사람' });
    const duePeople = (snapshot.people ?? []).filter((person) => person.nextContactDate && person.nextContactDate <= today).sort((a,b) => (a.nextContactDate ?? '').localeCompare(b.nextContactDate ?? ''));
    if (!duePeople.length) people.createEl('p', { text:'오늘까지 연락할 사람이 없습니다.' });
    for (const person of duePeople) {
      const row = people.createDiv({ cls:'life-os-row' });
      row.createEl('strong', { text:person.name });
      row.createEl('span', { text:`${person.relationship ?? '관계'} · ${person.nextContactDate ?? ''}` });
      if (person.path) row.addEventListener('click', () => void this.app.workspace.openLinkText(person.path ?? '', '', false));
    }

    const money = root.createDiv({ cls:'life-os-card' });
    money.createEl('h2', { text:'이번 달 돈 흐름' });
    const month = today.slice(0, 7);
    const monthEntries = (snapshot.moneyEntries ?? []).filter((entry) => entry.date.startsWith(month));
    const income = monthEntries.filter((entry) => entry.kind === 'income').reduce((sum, entry) => sum + entry.amount, 0);
    const expense = monthEntries.filter((entry) => entry.kind === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
    money.createEl('p', { text:`수입 ${income.toLocaleString('ko-KR')}원 · 지출 ${expense.toLocaleString('ko-KR')}원 · 순흐름 ${(income - expense).toLocaleString('ko-KR')}원` });
    for (const entry of monthEntries.sort((a,b) => b.date.localeCompare(a.date)).slice(0, 8)) {
      const row = money.createDiv({ cls:'life-os-row' });
      row.createEl('span', { text:entry.title });
      row.createEl('strong', { text:`${entry.kind === 'expense' ? '-' : '+'}${entry.amount.toLocaleString('ko-KR')}원` });
    }
  }
}
