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
    root.createEl('p', { text:'프로젝트별 진행률과 연결된 업무를 한눈에 보고 바로 조정합니다.' });

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

      const progressRow = card.createDiv({ cls:'life-os-progress-row' });
      progressRow.createEl('strong', { text:`${progress}%` });
      if (project.path) {
        const controls = progressRow.createDiv({ cls:'life-os-progress-controls' });
        const down = controls.createEl('button', { text:'−10', attr:{ 'aria-label':'진행률 10% 내리기' } });
        const up = controls.createEl('button', { text:'+10', attr:{ 'aria-label':'진행률 10% 올리기' } });
        down.addEventListener('click', async (event) => {
          event.stopPropagation();
          await this.repository.setProjectProgress(project.path ?? '', progress - 10);
          await this.render();
        });
        up.addEventListener('click', async (event) => {
          event.stopPropagation();
          await this.repository.setProjectProgress(project.path ?? '', progress + 10);
          await this.render();
        });
      }

      const track = card.createDiv({ cls:'life-os-progress-track' });
      const bar = track.createDiv({ cls:'life-os-progress-bar' });
      bar.style.width = `${progress}%`;

      const tasks = snapshot.tasks.filter((task) => task.projectId === project.id);
      if (tasks.length) {
        const ul = card.createEl('ul', { cls:'life-os-task-list' });
        for (const task of tasks) {
          const li = ul.createEl('li');
          if (task.path) {
            const check = li.createEl('button', { cls:'life-os-check', text:task.status === 'done' ? '☑' : '☐', attr:{ 'aria-label':`${task.title} 완료 상태 변경` } });
            check.addEventListener('click', async (event) => {
              event.stopPropagation();
              await this.repository.setTaskDone(task.path ?? '', task.status !== 'done');
              await this.render();
            });
          }
          const label = li.createSpan({ text:task.title });
          if (task.path) label.addEventListener('click', () => void this.app.workspace.openLinkText(task.path ?? '', '', false));
        }
      }
      if (project.path) header.addEventListener('click', () => void this.app.workspace.openLinkText(project.path ?? '', '', false));
    }
  }
}
