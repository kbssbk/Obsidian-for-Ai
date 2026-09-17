import type { LifeOsProject, LifeOsSnapshot, LifeOsTask } from '../../core/domain';

function taskStageProgress(task: LifeOsTask): number {
  if (task.status === 'done') return 100;
  if (task.draftDone) return 75;
  if (task.researchDone) return 50;
  if (task.status === 'doing') return 25;
  return 0;
}

export function resolveProjectProgress(project: LifeOsProject, tasks: LifeOsTask[]): number {
  if (project.progressMode === 'manual') return Math.max(0, Math.min(100, Math.round(project.progress)));
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  if (!projectTasks.length) return 0;
  return Math.round(projectTasks.reduce((sum, task) => sum + taskStageProgress(task), 0) / projectTasks.length);
}

export function buildDashboard(snapshot: LifeOsSnapshot, today: string): { projects: Array<LifeOsProject & { resolvedProgress: number }>; tasks: LifeOsTask[] } {
  const projects = snapshot.projects
    .filter((project) => project.status === 'active')
    .map((project) => ({ ...project, resolvedProgress: resolveProjectProgress(project, snapshot.tasks) }));

  const tasks = snapshot.tasks
    .filter((task) => task.status !== 'done' && Boolean(task.due) && task.due <= today)
    .sort((a, b) => a.due.localeCompare(b.due));

  return { projects, tasks };
}
