import { ItemView, WorkspaceLeaf } from 'obsidian';
import type { VaultRepository } from '../../core/vault-repository';
import type { LifeOsSettings } from '../../settings';
import { buildTimelineEvents } from './projector';

export const TIMELINE_VIEW_TYPE = 'life-os-timeline';

function shiftIsoDate(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit' }).format(new Date());
}

export class TimelineView extends ItemView {
  constructor(leaf: WorkspaceLeaf, private readonly repository: VaultRepository, private readonly settings: () => LifeOsSettings) {
    super(leaf);
  }

  getViewType(): string { return TIMELINE_VIEW_TYPE; }
  getDisplayText(): string { return 'Life OS 타임라인'; }
  getIcon(): string { return 'calendar-range'; }

  async onOpen(): Promise<void> {
    await this.render();
  }

  async render(): Promise<void> {
    const root = this.contentEl;
    root.empty();
    root.addClass('life-os-view');
    root.createEl('h1', { text: '타임라인' });
    root.createEl('p', { text: '일정·업무·목표 행동을 원본 데이터에서 파생해 하나의 흐름으로 봅니다.' });

    if (!this.settings().timelineEnabled) {
      root.createDiv({ cls:'life-os-empty', text:'설정에서 타임라인 기능이 꺼져 있습니다.' });
      return;
    }

    const snapshot = await this.repository.snapshot();
    const today = todayIso();
    const range = {
      from: shiftIsoDate(today, -this.settings().timelinePastDays),
      to: shiftIsoDate(today, this.settings().timelineFutureDays)
    };
    root.createEl('small', { text:`${range.from} — ${range.to}` });
    const events = buildTimelineEvents(snapshot, range);

    if (!events.length) {
      root.createDiv({ cls:'life-os-empty', text:'표시할 기록이 없습니다. README의 frontmatter 예시로 시작할 수 있습니다.' });
      return;
    }

    const list = root.createDiv({ cls:'life-os-timeline' });
    for (const event of events) {
      const row = list.createDiv({ cls:`life-os-timeline-event is-${event.status}` });
      row.createDiv({ cls:'life-os-timeline-date', text:event.date || '기한 미정' });
      const copy = row.createDiv({ cls:'life-os-timeline-copy' });
      copy.createEl('strong', { text:event.title });
      copy.createEl('small', { text:event.detail });
      row.createSpan({ cls:'life-os-chip', text:event.source === 'block' ? '일정' : event.source === 'task' ? '업무' : '목표' });
      if (event.path) row.addEventListener('click', () => void this.app.workspace.openLinkText(event.path ?? '', '', false));
    }
  }
}
