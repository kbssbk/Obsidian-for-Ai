import { Plugin } from "obsidian";

export default class ObsidianForAiPlugin extends Plugin {
  async onload(): Promise<void> {
    console.log("Obsidian for AI loaded");
  }

  onunload(): void {
    console.log("Obsidian for AI unloaded");
  }
}
