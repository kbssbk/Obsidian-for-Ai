import { App, Modal, Notice, Setting } from 'obsidian';
import type { VaultRepository } from '../../core/vault-repository';

export class QuickCaptureModal extends Modal {
  private title = '';
  private due = '';
  private priority = 3;
  private estimatedMinutes = 30;

  constructor(app: App, private readonly repository: VaultRepository, private readonly onCreated?: () => void) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text:'빠른 등록' });
    contentEl.createEl('p', { text:'생각난 일을 Inbox에 바로 넣고 나중에 정리합니다.' });

    new Setting(contentEl).setName('업무').addText((text) => {
      text.setPlaceholder('해야 할 일').onChange((value) => { this.title = value.trim(); });
      text.inputEl.focus();
    });
    new Setting(contentEl).setName('마감일').setDesc('선택 사항 · YYYY-MM-DD').addText((text) => text.onChange((value) => { this.due = value.trim(); }));
    new Setting(contentEl).setName('우선순위').setDesc('1–5, 숫자가 높을수록 먼저').addSlider((slider) => slider.setLimits(1, 5, 1).setValue(3).setDynamicTooltip().onChange((value) => { this.priority = value; }));
    new Setting(contentEl).setName('예상 시간').setDesc('분').addText((text) => text.setValue('30').onChange((value) => {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) this.estimatedMinutes = Math.max(5, parsed);
    }));
    new Setting(contentEl).addButton((button) => button.setButtonText('Inbox에 추가').setCta().onClick(() => void this.submit()));
  }

  private async submit(): Promise<void> {
    if (!this.title) {
      new Notice('업무 제목을 입력하세요.');
      return;
    }
    const path = await this.repository.createInboxTask(this.title, this.due, this.priority, this.estimatedMinutes);
    new Notice(`Inbox에 추가했습니다: ${this.title}`);
    this.close();
    this.onCreated?.();
    await this.app.workspace.openLinkText(path, '', false);
  }

  onClose(): void { this.contentEl.empty(); }
}
