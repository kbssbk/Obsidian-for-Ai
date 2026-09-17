import { App, TFile } from 'obsidian';
import type { LifeOsSnapshot } from './domain';
import { parseLifeOsEntity } from './frontmatter';

export { parseLifeOsEntity } from './frontmatter';

export class VaultRepository {
  constructor(private readonly app: App) {}

  async snapshot(): Promise<LifeOsSnapshot> {
    const snapshot: LifeOsSnapshot = { blocks: [], tasks: [], projects: [], goalActions: [], habits: [] };
    for (const file of this.app.vault.getMarkdownFiles()) this.collectFile(file, snapshot);
    return snapshot;
  }

  async setProjectProgress(path: string, progress: number): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return;
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter.progress_mode = 'manual';
      frontmatter.progress = Math.max(0, Math.min(100, Math.round(progress)));
    });
  }

  async setTaskDone(path: string, done: boolean): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return;
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter.status = done ? 'done' : 'todo';
    });
  }

  async setHabitCheckin(path: string, date: string, checked: boolean): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return;
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      const existing = Array.isArray(frontmatter.checkins) ? frontmatter.checkins.filter((item): item is string => typeof item === 'string') : [];
      const next = new Set(existing);
      if (checked) next.add(date); else next.delete(date);
      frontmatter.checkins = [...next].sort();
    });
  }

  private collectFile(file: TFile, snapshot: LifeOsSnapshot): void {
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    if (!frontmatter) return;
    const entity = parseLifeOsEntity(file.path, file.basename, frontmatter);
    if (!entity) return;
    if (entity.kind === 'project') snapshot.projects.push(entity.value);
    if (entity.kind === 'task') snapshot.tasks.push(entity.value);
    if (entity.kind === 'block') snapshot.blocks.push(entity.value);
    if (entity.kind === 'goalAction') snapshot.goalActions.push(entity.value);
    if (entity.kind === 'habit') snapshot.habits?.push(entity.value);
  }
}
