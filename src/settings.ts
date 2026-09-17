import { App, PluginSettingTab, Setting } from 'obsidian';
import type LifeOsPlugin from './main';

export interface LifeOsSettings {
  dashboardEnabled:boolean;
  projectsEnabled:boolean;
  timelineEnabled:boolean;
  timelinePastDays:number;
  timelineFutureDays:number;
  plannerAvailableMinutes:number;
  plannerBufferPercent:number;
  plannerMaxItems:number;
  energyPeakStart:string;
  energyPeakEnd:string;
  rechargeMinutes:number;
}

export const DEFAULT_SETTINGS:LifeOsSettings={
  dashboardEnabled:true,
  projectsEnabled:true,
  timelineEnabled:true,
  timelinePastDays:7,
  timelineFutureDays:21,
  plannerAvailableMinutes:480,
  plannerBufferPercent:20,
  plannerMaxItems:5,
  energyPeakStart:'09:00',
  energyPeakEnd:'11:00',
  rechargeMinutes:30
};

export class LifeOsSettingTab extends PluginSettingTab {
  constructor(app:App,private readonly plugin:LifeOsPlugin){super(app,plugin);}
  display():void{
    const {containerEl}=this;containerEl.empty();containerEl.createEl('h2',{text:'Life OS 설정'});containerEl.createEl('p',{text:'기능은 한 플러그인에 통합하고, 계획 규칙은 사용자의 상황에 맞게 조정합니다.'});
    this.addToggle('오늘 대시보드','오늘 할 일과 생활 신호를 한눈에 봅니다.','dashboardEnabled');
    this.addToggle('업무 진행도','수동 또는 자동 진행률로 프로젝트를 봅니다.','projectsEnabled');
    this.addToggle('타임라인','일정·업무·목표·사람·돈을 하나의 시간 흐름으로 봅니다.','timelineEnabled');
    this.addSlider('타임라인 과거 범위','오늘 기준 며칠 전부터 표시할지 정합니다.',0,30,1,'timelinePastDays');
    this.addSlider('타임라인 미래 범위','오늘 기준 며칠 뒤까지 표시할지 정합니다.',7,90,1,'timelineFutureDays');

    containerEl.createEl('h3',{text:'계획 원칙'});
    containerEl.createEl('p',{text:'근거: 「시간을 절약하는 20가지 방법」 — 계획 과부하 방지, 버퍼, 에너지 피크, 재충전, 융통성.'});
    const source=containerEl.createEl('a',{text:'공식 원문 열기'});source.href='https://wol.jw.org/ko/wol/d/r8/lp-ko/102010124';source.target='_blank';source.rel='noopener noreferrer';
    this.addSlider('하루 계획 가능 시간','업무로 계획할 수 있는 총 시간(분)입니다.',120,900,30,'plannerAvailableMinutes');
    this.addSlider('버퍼 비율','예상 밖 상황을 위해 비워 둘 비율입니다.',0,50,5,'plannerBufferPercent');
    this.addSlider('하루 최대 계획 개수','오늘 목록에 한꺼번에 올릴 최대 업무 수입니다.',1,12,1,'plannerMaxItems');
    new Setting(containerEl).setName('에너지 피크 시작').setDesc('가장 어려운 일을 배치하기 좋은 시간대의 시작입니다.').addText((text)=>text.setValue(this.plugin.settings.energyPeakStart).onChange(async(value)=>{this.plugin.settings.energyPeakStart=value;await this.plugin.saveSettings();}));
    new Setting(containerEl).setName('에너지 피크 종료').setDesc('가장 어려운 일을 배치하기 좋은 시간대의 종료입니다.').addText((text)=>text.setValue(this.plugin.settings.energyPeakEnd).onChange(async(value)=>{this.plugin.settings.energyPeakEnd=value;await this.plugin.saveSettings();}));
    this.addSlider('재충전 시간','하루에 의도적으로 확보할 재충전 시간(분)입니다.',0,120,5,'rechargeMinutes');
  }

  private addToggle(name:string,description:string,key:'dashboardEnabled'|'projectsEnabled'|'timelineEnabled'):void{
    new Setting(this.containerEl).setName(name).setDesc(description).addToggle((toggle)=>toggle.setValue(this.plugin.settings[key]).onChange(async(value)=>{this.plugin.settings[key]=value;await this.plugin.saveSettings();}));
  }

  private addSlider(name:string,description:string,min:number,max:number,step:number,key:'timelinePastDays'|'timelineFutureDays'|'plannerAvailableMinutes'|'plannerBufferPercent'|'plannerMaxItems'|'rechargeMinutes'):void{
    new Setting(this.containerEl).setName(name).setDesc(description).addSlider((slider)=>slider.setLimits(min,max,step).setValue(this.plugin.settings[key]).setDynamicTooltip().onChange(async(value)=>{this.plugin.settings[key]=value;await this.plugin.saveSettings();}));
  }
}
