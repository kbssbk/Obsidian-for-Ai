import { MetadataCache, TFile, Vault } from 'obsidian';
import type { GoalAction, LifeOsBlock, LifeOsProject, LifeOsSnapshot, LifeOsTask, LifeOsStatus, ProgressMode, ProjectStatus } from './domain';

type Frontmatter = Record<string, unknown>;

type ParsedEntity =
  | { kind: 'project'; value: LifeOsProject }
  | { kind: 'task'; value: LifeOsTask }
  | { kind: 'block'; value: LifeOsBlock }
  | { kind: 'goalAction'; value: GoalAction };

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function number(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function parseLifeOsEntity(path: string, basename: string, frontmatter: Frontmatter): ParsedEntity | null {
  const type = text(frontmatter.lifeos_type);
  const id = text(frontmatter.lifeos_id, path);
  const title = text(frontmatter.title, basename);

  if (type === 'project') {
    return {
      kind: 'project',
      value: {
        id,
        title,
        status: text(frontmatter.status, 'active') as ProjectStatus,
        progressMode: text(frontmatter.progress_mode, 'manual') as ProgressMode,
        progress: Math.max(0, Math.min(100, number(frontmatter.progress, 0))),
        start: text(frontmatter.start) || undefined,
        due: text(frontmatter.due) || undefined,
        path
      }
    };
  }

  if (type === 'task') {
    return {
      kind: 'task',
      value: {
        id,
        title,
        projectId: text(frontmatter.project),
        due: text(frontmatter.due),
        status: text(frontmatter.status, 'todo') as LifeOsStatus,
        researchDone: bool(frontmatter.research_done),
        draftDone: bool(frontmatter.draft_done),
        path
      }
    };
  }

  if (type === 'block') {
    return {
      kind: 'block',
      value: {
        id,
        title,
        date: text(frontmatter.date),
        startTime: text(frontmatter.start_time),
        endTime: text(frontmatter.end_time),
        path
      }
    };
  }

  if (type === 'goal_action') {
    return {
      kind: 'goalAction',
      value: {
        id,
        goalId: text(frontmatter.goal),
        title,
        estimatedMinutes: number(frontmatter.estimated_minutes, 10),
        done: bool(frontmatter.done),
        path
      }
    };
  }

  return null;
}

export class VaultRepository {
  constructor(private readonly vault: Vault, private readonly metadataCache: MetadataCache) {}

  async snapshot(): Promise<LifeOsSnapshot> {
    const snapshot: LifeOsSnapshot = { blocks: [], tasks: [], projects: [], goalActions: [] };

    for (const file of this.vault.getMarkdownFiles()) {
      this.collectFile(file, snapshot);
    }

    return snapshot;
  }

  private collectFile(file: TFile, snapshot: LifeOsSnapshot): void {
    const frontmatter = this.metadataCache.getFileCache(file)?.frontmatter;
    if (!frontmatter) return;
    const entity = parseLifeOsEntity(file.path, file.basename, frontmatter);
    if (!entity) return;

    if (entity.kind === 'project') snapshot.projects.push(entity.value);
    if (entity.kind === 'task') snapshot.tasks.push(entity.value);
    if (entity.kind === 'block') snapshot.blocks.push(entity.value);
    if (entity.kind === 'goalAction') snapshot.goalActions.push(entity.value);
  }
}
