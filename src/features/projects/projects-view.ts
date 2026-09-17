import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { VaultRepository } from '../../core/vault-repository';
import type { LifeOsSettings } from '../../settings';
import { resolveProjectProgress } from './projector';

export const PROJECTS_VIEW_TYPE = 'life-os-projects';

export class ProjectsView extends ItemView {
  constructor(leaf: WorkspaceLeaf, private readonly repository: VaultRepository, private readonly settings: () => LifeOsSettings) {
    super(leaf);
  }

  getViewType(): string { return PROJECTS_VIEW_TYPE; }
  getDisplayText(): string { return 'Life OS 업무'; }
  getIcon(): string { return 'list-checks'; }

  async onOpen(): Promise<void> {
    await this.render();
  }

  async render(): Promise<void> {
    const root = this.contentEl;
    root.empty();
    root.addClass('life-os-view');
    root.createEl('h1', { text:'업무 현황' });
    root.createEl('p', { text:'프로젝트별 진행률과 연결된 업무를 한눈에 봅니다.' });

    if (!this.settings().projectsEnabled) {
      root.createDiv({ cls:'life-os-empty', text:'설정에서 업무 진행도 기능이 꺼져 있습니다.' });
      return;
    }

    const snapshot = await this.repository.snapshot();
    const projects = snapshot.projects.filter((project) => project.status !== 'done');
    if (!projects.length) {
      root.createDiv({ cls:'life-os-empty', text:'등록된 프로젝트가 없습니다.' });
      return;
    }

    const list = root.createDiv({ cls:'life-os-project-list' });
    for (const project of projects) {
      const progress = resolveProjectProgress(project, snapshot.tasks);
      const card = list.createDiv({ cls:'life-os-card' });
      const header = card.createDiv({ cls:'life-os-card-header' });
      header.createEl('strong', { text:project.title });
      header.createSpan({ cls:'life-os-chip', text:project.progressMode === 'auto' ? '자동' : '수동' });
      card.createEl('div', { cls:'life-os-progress-label', text:`${progress}%` });
      const track = card.createDiv({ cls:'life-os-progress-track' });
      const bar = track.createDiv({ cls:'life-os-progress-bar' });
      bar.style.width = `${progress}%`;
      const tasks = snapshot.tasks.filter((task) => task.projectId === project.id);
      if (tasks.length) {
        const ul = card.createEl('ul', { cls:'life-os-task-list' });
        for (const task of tasks) {
          const li = ul.createEl('li');
          li.createSpan({ text:`${task.status === 'done' ? '☑' : '☐'} ${task.title}` });
          if (task.path) li.addEventListener('click', () => void this.app.workspace.openLinkText(task.path ?? '', '', false));
        }
      }
      if (project.path) header.addEventListener('click', () => void this.app.workspace.openLinkText(project.path ?? '', '', false));
    }
  }
}
