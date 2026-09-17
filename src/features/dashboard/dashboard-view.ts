import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { VaultRepository } from '../../core/vault-repository';
import type { LifeOsSettings } from '../../settings';
import { buildDashboard } from '../projects/projector';

export const DASHBOARD_VIEW_TYPE = 'life-os-dashboard';

function todayIso(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
}

export class DashboardView extends ItemView {
  constructor(leaf: WorkspaceLeaf, private readonly repository: VaultRepository, private readonly settings: () => LifeOsSettings) {
    super(leaf);
  }

  getViewType(): string { return DASHBOARD_VIEW_TYPE; }
  getDisplayText(): string { return 'Life OS 오늘'; }
  getIcon(): string { return 'layout-dashboard'; }

  async onOpen(): Promise<void> {
    await this.render();
  }

  async render(): Promise<void> {
    const root = this.contentEl;
    root.empty();
    root.addClass('life-os-view');
    root.createEl('h1', { text:'오늘' });
    root.createEl('p', { text:'지금 해야 할 일과 진행 중인 프로젝트를 한 화면에서 봅니다.' });

    if (!this.settings().dashboardEnabled) {
      root.createDiv({ cls:'life-os-empty', text:'설정에서 오늘 대시보드 기능이 꺼져 있습니다.' });
      return;
    }

    const snapshot = await this.repository.snapshot();
    const dashboard = buildDashboard(snapshot, todayIso());

    const taskSection = root.createDiv({ cls:'life-os-section' });
    taskSection.createEl('h2', { text:'지금 확인할 업무' });
    if (!dashboard.tasks.length) taskSection.createDiv({ cls:'life-os-empty', text:'오늘까지 확인할 미완료 업무가 없습니다.' });
    for (const task of dashboard.tasks) {
      const row = taskSection.createDiv({ cls:'life-os-row' });
      row.createSpan({ text:task.title });
      row.createEl('small', { text:task.due });
      if (task.path) row.addEventListener('click', () => void this.app.workspace.openLinkText(task.path ?? '', '', false));
    }

    const projectSection = root.createDiv({ cls:'life-os-section' });
    projectSection.createEl('h2', { text:'활성 프로젝트' });
    if (!dashboard.projects.length) projectSection.createDiv({ cls:'life-os-empty', text:'활성 프로젝트가 없습니다.' });
    for (const project of dashboard.projects) {
      const row = projectSection.createDiv({ cls:'life-os-row' });
      row.createSpan({ text:project.title });
      row.createEl('strong', { text:`${project.resolvedProgress}%` });
      if (project.path) row.addEventListener('click', () => void this.app.workspace.openLinkText(project.path ?? '', '', false));
    }
  }
}
