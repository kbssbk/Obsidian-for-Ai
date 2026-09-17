import { App, TFile, normalizePath } from 'obsidian';
import type { LifeOsSnapshot } from './domain';
import { parseLifeOsEntity } from './frontmatter';

export { parseLifeOsEntity } from './frontmatter';

function safeName(value: string): string {
  return value.replace(/[\\/:*?"<>|#^[\]]/g, '-').trim().slice(0, 80) || '새 업무';
}

function nextDate(value: string): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export class VaultRepository {
  constructor(private readonly app: App) {}

  async snapshot(): Promise<LifeOsSnapshot> {
    const snapshot: LifeOsSnapshot = { blocks: [], tasks: [], projects: [], goals: [], goalActions: [], habits: [], people: [], moneyEntries: [] };
    for (const file of this.app.vault.getMarkdownFiles()) this.collectFile(file, snapshot);
    return snapshot;
  }

  async createInboxTask(title: string, due = '', priority = 3, estimatedMinutes = 30): Promise<string> {
    const folder = normalizePath('Life OS/Inbox');
    if (!this.app.vault.getAbstractFileByPath(folder)) {
      try { await this.app.vault.createFolder(folder); } catch { /* folder may have been created concurrently */ }
    }
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const path = normalizePath(`${folder}/${stamp}-${safeName(title)}.md`);
    const body = `---\nlifeos_type: task\nlifeos_id: inbox-${stamp}\ntitle: ${JSON.stringify(title)}\nstatus: todo\ndue: ${due}\npriority: ${Math.max(1, Math.min(5, Math.round(priority)))}\nestimated_minutes: ${Math.max(5, Math.round(estimatedMinutes))}\nresearch_done: false\ndraft_done: false\n---\n\n`;
    await this.app.vault.create(path, body);
    return path;
  }

  async setProjectProgress(path: string, progress: number): Promise<void> {
    await this.updateFrontmatter(path, (frontmatter) => {
      frontmatter.progress_mode = 'manual';
      frontmatter.progress = Math.max(0, Math.min(100, Math.round(progress)));
    });
  }

  async setTaskDone(path: string, done: boolean): Promise<void> {
    await this.updateFrontmatter(path, (frontmatter) => { frontmatter.status = done ? 'done' : 'todo'; });
  }

  async setHabitCheckin(path: string, date: string, checked: boolean): Promise<void> {
    await this.updateFrontmatter(path, (frontmatter) => {
      const existing = Array.isArray(frontmatter.checkins) ? frontmatter.checkins.filter((item): item is string => typeof item === 'string') : [];
      const next = new Set(existing);
      if (checked) next.add(date); else next.delete(date);
      frontmatter.checkins = [...next].sort();
    });
  }

  async recoverBlock(path: string, action: 'tomorrow' | 'shrink' | 'complete'): Promise<void> {
    await this.updateFrontmatter(path, (frontmatter) => {
      if (action === 'tomorrow' && typeof frontmatter.date === 'string') frontmatter.date = nextDate(frontmatter.date);
      if (action === 'shrink') {
        const start = typeof frontmatter.start_time === 'string' ? frontmatter.start_time : '09:00';
        const [h, m] = start.split(':').map(Number);
        const total = h * 60 + m + 5;
        frontmatter.end_time = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      }
      if (action === 'complete') frontmatter.status = 'done';
    });
  }

  private async updateFrontmatter(path: string, mutate: (frontmatter: Record<string, unknown>) => void): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return;
    await this.app.fileManager.processFrontMatter(file, mutate);
  }

  private collectFile(file: TFile, snapshot: LifeOsSnapshot): void {
    const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
    if (!frontmatter) return;
    const entity = parseLifeOsEntity(file.path, file.basename, frontmatter);
    if (!entity) return;
    if (entity.kind === 'project') snapshot.projects.push(entity.value);
    if (entity.kind === 'task') snapshot.tasks.push(entity.value);
    if (entity.kind === 'block') snapshot.blocks.push(entity.value);
    if (entity.kind === 'goal') snapshot.goals?.push(entity.value);
    if (entity.kind === 'goalAction') snapshot.goalActions.push(entity.value);
    if (entity.kind === 'habit') snapshot.habits?.push(entity.value);
    if (entity.kind === 'person') snapshot.people?.push(entity.value);
    if (entity.kind === 'money') snapshot.moneyEntries?.push(entity.value);
  }
}
