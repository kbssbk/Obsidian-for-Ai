import { Plugin } from 'obsidian';
import { VaultRepository } from './core/vault-repository';
import { DashboardView, DASHBOARD_VIEW_TYPE } from './features/dashboard/dashboard-view';
import { ProjectsView, PROJECTS_VIEW_TYPE } from './features/projects/projects-view';
import { TimelineView, TIMELINE_VIEW_TYPE } from './features/timeline/timeline-view';
import { PlannerView, PLANNER_VIEW_TYPE } from './features/planner/planner-view';
import { DEFAULT_SETTINGS, LifeOsSettingTab, type LifeOsSettings } from './settings';

export default class LifeOsPlugin extends Plugin {
  settings: LifeOsSettings = DEFAULT_SETTINGS;
  private repository!: VaultRepository;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.repository = new VaultRepository(this.app);

    this.registerView(DASHBOARD_VIEW_TYPE, (leaf) => new DashboardView(leaf, this.repository, () => this.settings));
    this.registerView(PROJECTS_VIEW_TYPE, (leaf) => new ProjectsView(leaf, this.repository, () => this.settings));
    this.registerView(TIMELINE_VIEW_TYPE, (leaf) => new TimelineView(leaf, this.repository, () => this.settings));
    this.registerView(PLANNER_VIEW_TYPE, (leaf) => new PlannerView(leaf, this.repository));

    this.addRibbonIcon('layout-dashboard', 'Life OS 열기', () => void this.openView(DASHBOARD_VIEW_TYPE));
    this.addCommand({ id:'open-life-os-dashboard', name:'Life OS: 오늘 열기', callback:() => void this.openView(DASHBOARD_VIEW_TYPE) });
    this.addCommand({ id:'open-life-os-projects', name:'Life OS: 업무 현황 열기', callback:() => void this.openView(PROJECTS_VIEW_TYPE) });
    this.addCommand({ id:'open-life-os-timeline', name:'Life OS: 타임라인 열기', callback:() => void this.openView(TIMELINE_VIEW_TYPE) });
    this.addCommand({ id:'open-life-os-planner', name:'Life OS: 계획·습관·회고 열기', callback:() => void this.openView(PLANNER_VIEW_TYPE) });

    this.addSettingTab(new LifeOsSettingTab(this.app, this));
    this.registerEvent(this.app.metadataCache.on('changed', () => void this.refreshOpenViews()));
  }

  onunload(): void {
    this.app.workspace.detachLeavesOfType(DASHBOARD_VIEW_TYPE);
    this.app.workspace.detachLeavesOfType(PROJECTS_VIEW_TYPE);
    this.app.workspace.detachLeavesOfType(TIMELINE_VIEW_TYPE);
    this.app.workspace.detachLeavesOfType(PLANNER_VIEW_TYPE);
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<LifeOsSettings> | null);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    await this.refreshOpenViews();
  }

  private async openView(type: string): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(type)[0];
    const leaf = existing ?? this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type, active:true });
    this.app.workspace.revealLeaf(leaf);
  }

  private async refreshOpenViews(): Promise<void> {
    for (const leaf of this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE)) {
      if (leaf.view instanceof DashboardView) await leaf.view.render();
    }
    for (const leaf of this.app.workspace.getLeavesOfType(PROJECTS_VIEW_TYPE)) {
      if (leaf.view instanceof ProjectsView) await leaf.view.render();
    }
    for (const leaf of this.app.workspace.getLeavesOfType(TIMELINE_VIEW_TYPE)) {
      if (leaf.view instanceof TimelineView) await leaf.view.render();
    }
    for (const leaf of this.app.workspace.getLeavesOfType(PLANNER_VIEW_TYPE)) {
      if (leaf.view instanceof PlannerView) await leaf.view.render();
    }
  }
}
