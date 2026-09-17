import { ItemView, WorkspaceLeaf } from 'obsidian';

export const HELP_VIEW_TYPE='life-os-help';

export class HelpView extends ItemView {
  getViewType():string{return HELP_VIEW_TYPE;}
  getDisplayText():string{return '라이프 OS 설명';}
  getIcon():string{return 'circle-help';}
  async onOpen():Promise<void>{this.render();}
  render():void{
    const root=this.contentEl;root.empty();root.addClass('life-os-view','life-os-help');
    const hero=root.createDiv({cls:'life-os-help-hero'});hero.createEl('span',{cls:'life-os-eyebrow',text:'LIFE OS / GUIDE'});hero.createEl('h1',{text:'라이프 OS 사용 설명'});hero.createEl('p',{text:'라이프 OS는 업무·일정·집중·관계·목표·재정을 각각 따로 저장하지 않고, Markdown/YAML 기록을 서로 연결해 여러 화면에서 다시 보는 Obsidian 플러그인입니다.'});
    this.section(root,'처음 시작하기',['빠른 실행을 열어 오늘 화면을 확인합니다.','빠른 추가에서 업무·일정·약속·관계 프로필을 입력합니다.','오늘 화면에서 지금 할 한 가지를 정하고 집중 타이머를 시작합니다.','완료와 실제 시간은 기록으로 남고, 타임라인·달력·회고에서 다시 확인합니다.']);
    this.section(root,'화면별 역할',['오늘 — 지금 할 일, 진행 중 프로젝트, 중요한 생활 신호를 빠르게 확인합니다.','업무 — 마감일과 자료 조사·초안·최종 체크포인트를 관리합니다.','프로젝트 — 수동 또는 연결 업무 기반 진행률을 봅니다.','집중 — 포모도로 또는 자유 집중을 실행하고 실제 시간을 자동 기록합니다.','관계 — 한 사람과의 인연, 예정 약속, 지난 만남, 장소·목적·메모·다음 행동을 사람 기준으로 모아 봅니다.','타임라인 — 일정·업무·목표·관계·재정·집중 기록 중 원하는 종류만 골라 시간순으로 봅니다.','달력 — 타임라인과 같은 데이터를 월간·주간·목록으로 전환해 봅니다.','목표·재정 — 목표 진행과 예산·수입·지출·저축을 각각 확인합니다.']);
    this.section(root,'관계와 약속은 어떻게 연결되나요?',['사람은 관계 프로필 하나로 저장됩니다.','약속은 날짜·시간·장소·목적·메모·다음 행동과 함께 별도 기록으로 저장됩니다.','약속에 여러 사람을 선택하면 같은 약속 하나가 선택한 모든 사람의 관계 이력에 나타납니다.','데이터를 복사하지 않기 때문에 약속 노트를 수정하면 관계 화면·타임라인·달력에 함께 반영됩니다.']);
    this.section(root,'타임라인과 달력',['필터에서 일정·업무·목표·관계·재정·집중·시간 기록을 여러 개 동시에 켜고 끌 수 있습니다.','특정 사람을 선택하면 그 사람과 연결된 관계 기록만 볼 수 있습니다.','완료 항목 표시 여부도 바꿀 수 있습니다.','달력은 같은 필터를 사용하며 월간·주간·목록 보기로 전환됩니다.']);
    this.section(root,'데이터 저장 방식',['라이프 OS의 원본은 Vault 안의 Markdown/YAML 파일입니다.','화면은 원본을 읽어서 보여주는 보기(View)이며 별도의 권위 데이터베이스를 만들지 않습니다.','이 구조는 파일 기반 백업과 향후 여러 기기 동기화에 유리합니다.','라이프 OS가 수정하는 것은 해당 기능과 연결된 frontmatter 필드뿐입니다.']);
    const source=root.createDiv({cls:'life-os-card'});source.createEl('h2',{text:'시간 관리 원칙 참고'});source.createEl('p',{text:'계획·여유 시간·집중·재충전·현실적인 목표 등 시간 관리 원칙은 「시간을 절약하는 20가지 방법」을 제품 원칙에 맞게 재해석해 적용했습니다.'});const link=source.createEl('a',{text:'참조 근거 열기'});link.href='https://wol.jw.org/ko/wol/d/r8/lp-ko/102010124';link.target='_blank';link.rel='noopener noreferrer';
  }
  private section(root:HTMLElement,title:string,items:string[]):void{const card=root.createDiv({cls:'life-os-card'});card.createEl('h2',{text:title});const list=card.createEl('ol');for(const item of items)list.createEl('li',{text:item});}
}
