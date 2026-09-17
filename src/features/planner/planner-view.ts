import { ItemView, Notice, WorkspaceLeaf } from 'obsidian';
import type { VaultRepository } from '../../core/vault-repository';
import { buildDailyPlan, computeReviewStats, TIME_SAVING_SOURCE_URL } from './engine';

export const PLANNER_VIEW_TYPE = 'life-os-planner';

function seoulToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
}

export class PlannerView extends ItemView {
  constructor(leaf: WorkspaceLeaf, private readonly repository: VaultRepository) {
    super(leaf);
  }

  getViewType(): string { return PLANNER_VIEW_TYPE; }
  getDisplayText(): string { return 'Life OS 계획·회고'; }
  getIcon(): string { return 'calendar-check-2'; }

  async onOpen(): Promise<void> { await this.render(); }

  async render(): Promise<void> {
    const root = this.contentEl;
    root.empty();
    root.addClass('life-os-view');
    const today = seoulToday();
    const snapshot = await this.repository.snapshot();
    const plan = buildDailyPlan(snapshot, today, { availableMinutes:480, bufferRatio:0.2, maxItems:5 });
    const review = computeReviewStats(snapshot, today);

    root.createEl('h1', { text:'계획 · 습관 · 회고' });
    root.createEl('p', { text:`${today} · 중요한 일부터, 일정은 여유 있게.` });

    const focus = root.createDiv({ cls:'life-os-card' });
    focus.createEl('h2', { text:'지금 할 한 가지' });
    if (plan.focus) {
      focus.createEl('strong', { text:plan.focus.title });
      focus.createEl('p', { text:`우선순위 ${plan.focus.priority ?? 3} · 예상 ${plan.focus.estimatedMinutes ?? 30}분${plan.focus.due ? ` · 마감 ${plan.focus.due}` : ''}` });
      if (plan.focus.path) {
        const open = focus.createEl('button', { text:'열기' });
        open.addEventListener('click', () => void this.app.workspace.openLinkText(plan.focus?.path ?? '', '', false));
      }
    } else {
      focus.createEl('p', { text:'지금 바로 처리해야 할 열린 업무가 없습니다.' });
    }

    const todayCard = root.createDiv({ cls:'life-os-card' });
    todayCard.createEl('h2', { text:'오늘' });
    todayCard.createEl('p', { text:`계획 ${plan.plannedMinutes}분 · 버퍼 ${plan.bufferMinutes}분${plan.overload ? ' · 과부하 주의' : ''}` });
    if (!plan.today.length) todayCard.createEl('p', { text:'오늘로 잡힌 업무가 없습니다.' });
    for (const task of plan.today) {
      const row = todayCard.createDiv({ cls:'life-os-row' });
      row.createEl('strong', { text:task.title });
      row.createEl('span', { text:`${task.estimatedMinutes ?? 30}분` });
    }

    const tomorrowCard = root.createDiv({ cls:'life-os-card' });
    tomorrowCard.createEl('h2', { text:'내일 이후' });
    for (const task of plan.tomorrow) tomorrowCard.createEl('p', { text:`• ${task.title} · ${task.due || '기한 미정'}` });

    const habitCard = root.createDiv({ cls:'life-os-card' });
    habitCard.createEl('h2', { text:'습관 체크인' });
    if (!(snapshot.habits ?? []).length) habitCard.createEl('p', { text:'lifeos_type: habit 노트를 추가하면 여기에 표시됩니다.' });
    for (const habit of snapshot.habits ?? []) {
      const row = habitCard.createDiv({ cls:'life-os-row' });
      const checkbox = row.createEl('input', { type:'checkbox' });
      checkbox.checked = habit.checkins.includes(today);
      row.createEl('span', { text:habit.title });
      checkbox.addEventListener('change', async () => {
        if (!habit.path) return;
        await this.repository.setHabitCheckin(habit.path, today, checkbox.checked);
        new Notice(checkbox.checked ? '습관을 기록했습니다.' : '오늘 기록을 취소했습니다.');
        await this.render();
      });
    }

    const reviewCard = root.createDiv({ cls:'life-os-card' });
    reviewCard.createEl('h2', { text:'회고 신호' });
    reviewCard.createEl('p', { text:`업무 완료 ${review.tasks.completed}/${review.tasks.total} · 기한 지난 열린 업무 ${review.overdueOpen}개 · 활성 프로젝트 ${review.activeProjects}개` });
    for (const habit of review.habits) reviewCard.createEl('p', { text:`${habit.title}: 연속 ${habit.streak}일` });
    reviewCard.createEl('p', { text:'업무 완료율과 습관 기록은 하나의 점수로 합치지 않습니다.' });

    const source = root.createDiv({ cls:'life-os-card' });
    source.createEl('h2', { text:'채택한 시간 관리 원칙' });
    source.createEl('p', { text:'우선순위, 오늘/내일 분리, 과도한 계획 방지, 버퍼, 집중 시간, 80/20, 재충전, 유연한 재계획 원칙을 반영합니다.' });
    const link = source.createEl('a', { text:'참조: 「시간을 절약하는 20가지 방법」', href:TIME_SAVING_SOURCE_URL });
    link.setAttr('target', '_blank');
    link.setAttr('rel', 'noopener noreferrer');
  }
}
