# Life OS Integrated Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Obsidian plugin scaffold into one integrated Life OS plugin that derives Timeline, Projects, and Today dashboard views from shared Vault frontmatter.

**Architecture:** Keep source-of-truth data in Markdown/YAML notes. A VaultRepository reads typed entities, pure projectors derive timeline/dashboard state, and independent Obsidian ItemView modules render those projections. Timeline never owns duplicate records.

**Tech Stack:** TypeScript, Obsidian API, esbuild, Node test runner, tsx.

**Spec:** Port the proven `gpt-site` operations model: source-domain ownership plus a unified derived timeline.

## Global Constraints

- One installed Obsidian plugin, internally modular.
- Mobile compatible (`isDesktopOnly: false`).
- Korean UI/help copy.
- No destructive migration of existing notes.
- Frontmatter is the initial source of truth; derived views do not duplicate data.

---

### Task 1: Pure domain projection
**Files:** Create `src/core/domain.ts`, `src/features/timeline/projector.ts`; Test `tests/timeline-projector.test.ts`.
**Interfaces:** `buildTimelineEvents(snapshot, range)` returns sorted `TimelineEvent[]`; tasks use their next incomplete checkpoint and overdue checkpoints become `attention`.
- [ ] Write failing tests for sorting, range filtering, overdue status, and undated goal actions.
- [ ] Run the focused tests and confirm failure because the projector is missing.
- [ ] Implement the minimal types and projector.
- [ ] Run focused and full tests.

### Task 2: Vault repository
**Files:** Create `src/core/vault-repository.ts`; Test `tests/frontmatter-mapping.test.ts`.
**Interfaces:** `parseLifeOsEntity(path, basename, frontmatter)` maps non-destructively from `lifeos_type` frontmatter into domain entities.
- [ ] Write failing mapping tests.
- [ ] Implement parser and repository scan over Markdown files.
- [ ] Verify tests.

### Task 3: Projects and Today projections
**Files:** Create `src/features/projects/projector.ts`, `src/features/dashboard/projector.ts`; Test `tests/project-projector.test.ts`.
**Interfaces:** project progress supports `manual` and `auto`; auto averages task completion by project id.
- [ ] Write failing progress/dashboard tests.
- [ ] Implement minimal pure projectors.
- [ ] Verify tests.

### Task 4: Obsidian views and module wiring
**Files:** Create `src/app/module-registry.ts`, `src/features/timeline/timeline-view.ts`, `src/features/projects/projects-view.ts`, `src/features/dashboard/dashboard-view.ts`; Modify `src/main.ts`, `styles.css`.
**Interfaces:** Commands open `Life OS: 오늘`, `Life OS: 업무`, `Life OS: 타임라인`; views refresh from the shared repository.
- [ ] Register views and commands.
- [ ] Render direct, readable Korean UI with progress bars and timeline filters.
- [ ] Add responsive styles.
- [ ] Build and verify plugin entrypoint.

### Task 5: Settings and Korean help
**Files:** Create `src/settings.ts`; Modify `manifest.json`, `README.md`.
**Interfaces:** settings toggle Dashboard, Projects, Timeline independently while keeping one plugin.
- [ ] Add settings tab and defaults.
- [ ] Document frontmatter examples and usage in Korean.
- [ ] Run tests/build and review diff before PR.
