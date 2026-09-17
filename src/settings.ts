import { App, PluginSettingTab, Setting } from 'obsidian';
import type LifeOsPlugin from './main';

export interface LifeOsSettings {
  dashboardEnabled: boolean;
  projectsEnabled: boolean;
  timelineEnabled: boolean;
  timelinePastDays: number;
  timelineFutureDays: number;
}

export const DEFAULT_SETTINGS: LifeOsSettings = {
  dashboardEnabled: true,
  projectsEnabled: true,
  timelineEnabled: true,
  timelinePastDays: 7,
  timelineFutureDays: 21
};

export class LifeOsSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: LifeOsPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Life OS 설정' });
    containerEl.createEl('p', { text: '하나의 플러그인 안에서 필요한 영역만 켜고 끌 수 있습니다. 데이터는 Markdown/YAML에 그대로 남습니다.' });

    this.addToggle('오늘 대시보드', '오늘 할 일과 활성 프로젝트를 한눈에 봅니다.', 'dashboardEnabled');
    this.addToggle('업무 진행도', '수동 또는 자동 진행률로 프로젝트를 봅니다.', 'projectsEnabled');
    this.addToggle('타임라인', '일정·업무·목표 행동을 하나의 시간 흐름으로 봅니다.', 'timelineEnabled');

    new Setting(containerEl)
      .setName('타임라인 과거 범위')
      .setDesc('오늘 기준 며칠 전부터 표시할지 정합니다.')
      .addSlider((slider) => slider
        .setLimits(0, 30, 1)
        .setValue(this.plugin.settings.timelinePastDays)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.timelinePastDays = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('타임라인 미래 범위')
      .setDesc('오늘 기준 며칠 뒤까지 표시할지 정합니다.')
      .addSlider((slider) => slider
        .setLimits(7, 90, 1)
        .setValue(this.plugin.settings.timelineFutureDays)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.timelineFutureDays = value;
          await this.plugin.saveSettings();
        }));
  }

  private addToggle(name: string, description: string, key: 'dashboardEnabled' | 'projectsEnabled' | 'timelineEnabled'): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(description)
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings[key])
        .onChange(async (value) => {
          this.plugin.settings[key] = value;
          await this.plugin.saveSettings();
        }));
  }
}
