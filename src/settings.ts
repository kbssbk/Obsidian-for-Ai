import { App, PluginSettingTab, Setting } from 'obsidian';
import type LifeOsPlugin from './main';

export type ActiveFocusSession={taskId:string;title:string;startedAt:number;plannedMinutes:number;mode:'pomodoro'|'free'};
export type CalendarDefaultMode='month'|'week'|'list';
export interface LifeOsSettings {
  dashboardEnabled:boolean;projectsEnabled:boolean;timelineEnabled:boolean;startupSummaryEnabled:boolean;
  timelinePastDays:number;timelineFutureDays:number;timelineShowDone:boolean;calendarDefaultMode:CalendarDefaultMode;
  plannerAvailableMinutes:number;plannerBufferPercent:number;plannerMaxItems:number;energyPeakStart:string;energyPeakEnd:string;rechargeMinutes:number;
  focusMinutes:number;breakMinutes:number;activeFocus:ActiveFocusSession|null;relationshipHistoryLimit:number;visualGlow:boolean;
}

export const DEFAULT_SETTINGS:LifeOsSettings={dashboardEnabled:true,projectsEnabled:true,timelineEnabled:true,startupSummaryEnabled:true,timelinePastDays:7,timelineFutureDays:21,timelineShowDone:true,calendarDefaultMode:'month',plannerAvailableMinutes:480,plannerBufferPercent:20,plannerMaxItems:5,energyPeakStart:'09:00',energyPeakEnd:'11:00',rechargeMinutes:30,focusMinutes:25,breakMinutes:5,activeFocus:null,relationshipHistoryLimit:12,visualGlow:true};

export class LifeOsSettingTab extends PluginSettingTab {
  constructor(app:App,private readonly plugin:LifeOsPlugin){super(app,plugin);}
  display():void{
    const {containerEl}=this;containerEl.empty();containerEl.addClass('life-os-settings');containerEl.createEl('h2',{text:'라이프 OS 설정'});containerEl.createEl('p',{text:'각 기능의 표시 방식과 계획 규칙을 기기와 생활 방식에 맞게 조절합니다. 변경 내용은 바로 적용됩니다.'});

    this.heading('기본','주요 화면을 켜거나 끄고 플러그인의 기본 동작을 정합니다.');
    this.addToggle('오늘 대시보드','오늘 할 일과 생활 신호를 한눈에 보여줍니다.','dashboardEnabled');
    this.addToggle('프로젝트 진행도','프로젝트 진행률 화면을 사용합니다.','projectsEnabled');
    this.addToggle('타임라인','일정·업무·목표·관계·재정·집중 기록을 하나의 흐름으로 봅니다.','timelineEnabled');

    this.heading('오늘 · 알림','앱을 열었을 때 꼭 확인해야 할 항목의 노출 방식을 정합니다.');
    this.addToggle('시작 요약 알림','오늘 마감, 기한 지난 업무, 연락 예정이 있을 때 시작 시 요약을 표시합니다.','startupSummaryEnabled');

    this.heading('계획','하루를 너무 빽빽하게 채우지 않도록 사용 가능한 시간과 여유 시간을 정합니다.');
    const source=containerEl.createEl('a',{text:'참조 근거: 「시간을 절약하는 20가지 방법」'});source.href='https://wol.jw.org/ko/wol/d/r8/lp-ko/102010124';source.target='_blank';source.rel='noopener noreferrer';
    this.addSlider('하루 계획 가능 시간','업무로 계획할 수 있는 총 시간입니다. 단위: 분.',120,900,30,'plannerAvailableMinutes');
    this.addSlider('여유 시간 비율','예상 밖 상황을 위해 비워 둘 시간의 비율입니다. 단위: %.',0,50,5,'plannerBufferPercent');
    this.addSlider('하루 최대 계획 개수','오늘 목록에 한꺼번에 올릴 최대 업무 수입니다.',1,12,1,'plannerMaxItems');
    this.addText('집중이 잘되는 시간 시작','가장 어려운 일을 배치하기 좋은 시간대의 시작입니다.','energyPeakStart');
    this.addText('집중이 잘되는 시간 종료','집중 시간대의 종료입니다.','energyPeakEnd');
    this.addSlider('재충전 시간','하루에 의도적으로 확보할 휴식·재충전 시간입니다. 단위: 분.',0,120,5,'rechargeMinutes');

    this.heading('집중 타이머','포모도로와 자유 집중에서 사용할 기본 시간을 정합니다. 진행 중 세션은 설정 데이터에 복구용으로 저장됩니다.');
    this.addSlider('기본 집중 시간','포모도로 집중 한 회의 기본 시간입니다. 단위: 분.',10,90,5,'focusMinutes');
    this.addSlider('기본 휴식 시간','집중 한 회 뒤 권장 휴식 시간입니다. 단위: 분.',1,30,1,'breakMinutes');

    this.heading('타임라인 · 달력','기본 기간과 처음 열리는 달력 보기를 정합니다. 화면 안의 필터로 언제든 임시 변경할 수 있습니다.');
    this.addSlider('타임라인 과거 범위','오늘 기준 며칠 전부터 표시할지 정합니다.',0,60,1,'timelinePastDays');
    this.addSlider('타임라인 미래 범위','오늘 기준 며칠 뒤까지 표시할지 정합니다.',7,120,1,'timelineFutureDays');
    this.addToggle('완료 기록 기본 표시','타임라인과 달력을 처음 열 때 완료된 기록도 함께 표시합니다.','timelineShowDone');
    new Setting(containerEl).setName('달력 기본 보기').setDesc('달력을 처음 열 때 월간·주간·목록 중 어떤 화면을 보여줄지 정합니다.').addDropdown((dropdown)=>dropdown.addOptions({month:'월간',week:'주간',list:'목록'}).setValue(this.plugin.settings.calendarDefaultMode).onChange(async(value)=>{this.plugin.settings.calendarDefaultMode=value as CalendarDefaultMode;await this.plugin.saveSettings();}));

    this.heading('관계 · 약속','관계 상세 화면에 표시할 지난 만남 기록의 양을 정합니다. 약속 자체는 삭제되지 않습니다.');
    this.addSlider('지난 만남 표시 개수','한 사람의 관계 타임라인에 바로 펼쳐 보여줄 최근 기록 수입니다.',3,30,1,'relationshipHistoryLimit');

    this.heading('표시 · 테마','미래형 작업실 테마의 시각 강조를 조절합니다. 가독성을 위해 네온은 활성 상태에만 사용합니다.');
    this.addToggle('네온 강조','활성 필터, 현재 날짜, 집중 상태, 주요 버튼에 은은한 네온 라인을 사용합니다.','visualGlow');

    this.heading('데이터 · 고급','라이프 OS의 원본은 Vault 안 Markdown/YAML입니다. 화면은 이 원본을 읽어 보여주며 별도 권위 데이터베이스를 만들지 않습니다.');
    const reset=new Setting(containerEl).setName('설정을 기본값으로 복원').setDesc('기능 표시와 계획·테마 설정을 초기값으로 되돌립니다. 진행 중인 집중 세션은 유지합니다.');reset.addButton((button)=>button.setButtonText('기본값 복원').setWarning().onClick(async()=>{const activeFocus=this.plugin.settings.activeFocus;this.plugin.settings={...DEFAULT_SETTINGS,activeFocus};await this.plugin.saveSettings();this.display();}));
  }

  private heading(title:string,description:string):void{this.containerEl.createEl('h3',{text:title});this.containerEl.createEl('p',{cls:'setting-item-description',text:description});}
  private addToggle(name:string,description:string,key:'dashboardEnabled'|'projectsEnabled'|'timelineEnabled'|'startupSummaryEnabled'|'timelineShowDone'|'visualGlow'):void{new Setting(this.containerEl).setName(name).setDesc(description).addToggle((toggle)=>toggle.setValue(this.plugin.settings[key]).onChange(async(value)=>{this.plugin.settings[key]=value;await this.plugin.saveSettings();}));}
  private addSlider(name:string,description:string,min:number,max:number,step:number,key:'timelinePastDays'|'timelineFutureDays'|'plannerAvailableMinutes'|'plannerBufferPercent'|'plannerMaxItems'|'rechargeMinutes'|'focusMinutes'|'breakMinutes'|'relationshipHistoryLimit'):void{new Setting(this.containerEl).setName(name).setDesc(description).addSlider((slider)=>slider.setLimits(min,max,step).setValue(this.plugin.settings[key]).setDynamicTooltip().onChange(async(value)=>{this.plugin.settings[key]=value;await this.plugin.saveSettings();}));}
  private addText(name:string,description:string,key:'energyPeakStart'|'energyPeakEnd'):void{new Setting(this.containerEl).setName(name).setDesc(description).addText((text)=>text.setValue(this.plugin.settings[key]).onChange(async(value)=>{this.plugin.settings[key]=value;await this.plugin.saveSettings();}));}
}
