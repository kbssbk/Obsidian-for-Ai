# Future Workshop UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 라이프 OS를 관계/약속, 선택형 타임라인/달력, 빠른 실행 허브, 상세 설명/설정, 다크 네온 반응형 UI까지 포함한 모바일·태블릿·PC 공용 UX로 완성한다.

**Architecture:** Markdown/YAML Vault를 단일 원본으로 유지하고 `appointment`를 새 엔티티로 추가한다. 관계 상세, 타임라인, 달력은 appointment/person/task/block/time_log 등 동일 원본을 projection해서 표시하며 UI 필터 상태만 로컬 뷰 상태로 유지한다.

**Tech Stack:** TypeScript, Obsidian Plugin API, CSS, Node test runner, esbuild

**Spec:** `docs/superpowers/specs/2026-09-18-future-workshop-ux-design.md`

## Global Constraints
- 모든 사용자 명령은 `라이프 OS · ...` 형식.
- `사람 관리`, `사람·돈` 표현 금지. 관계/약속/재정 분리.
- Markdown/YAML Vault가 단일 원본.
- `isDesktopOnly: false` 유지.
- Node/Electron 전용 API를 핵심 경로에서 사용하지 않음.
- 모바일 터치 타깃 최소 44px 수준.
- 기존 데이터 호환 유지.

---

### Task 1: 관계/약속 데이터 모델
**Files:** `src/core/domain.ts`, `src/core/frontmatter.ts`, `src/core/vault-repository.ts`, `tests/appointment.test.ts`
**Produces:** `LifeOsAppointment`, `snapshot.appointments`, `lifeos_type: appointment` 파싱/생성.
- [ ] appointment 파싱 실패 테스트 작성.
- [ ] 테스트 실패 확인.
- [ ] 타입, parser, snapshot collector, `createAppointment()` 구현.
- [ ] 테스트 통과 확인.
- [ ] 커밋.

### Task 2: 약속 입력과 관계 상세
**Files:** `src/features/capture/quick-capture-modal.ts`, `src/features/areas/areas-view.ts`, `tests/relationships.test.ts`
**Consumes:** `LifeOsAppointment`, `snapshot.appointments`.
**Produces:** 여러 사람 연결 가능한 약속 입력, 사람별 예정/지난 약속/후속 행동 표시.
- [ ] 사람-약속 연결 projection 테스트 작성.
- [ ] 실패 확인.
- [ ] 빠른 추가에 약속 종류와 날짜/시간/장소/목적/사람/메모/다음 행동 입력 구현.
- [ ] 관계 화면을 관계 프로필+이력 중심으로 개편.
- [ ] 테스트 통과 확인 후 커밋.

### Task 3: 선택형 타임라인과 달력
**Files:** `src/features/timeline/projector.ts`, `src/features/timeline/timeline-view.ts`, `src/features/calendar/calendar-view.ts`, `tests/timeline-filter.test.ts`, `tests/calendar.test.ts`
**Produces:** 다중 필터, 특정 사람 필터, 타임라인/월간/주간/목록 projection.
- [ ] 필터/달력 projection 실패 테스트 작성.
- [ ] 실패 확인.
- [ ] appointment와 time_log를 타임라인 소스에 포함.
- [ ] 다중 필터와 사람 필터 구현.
- [ ] 새 달력 뷰 구현.
- [ ] 테스트 통과 확인 후 커밋.

### Task 4: 빠른 실행 허브와 명령 체계
**Files:** `src/features/hub/hub-view.ts`, `src/main.ts`, `src/features/dashboard/dashboard-view.ts`, `tests/korean-ui.test.ts`
**Produces:** `라이프 OS · ...` 명령 일관성, 빠른 실행 허브, 오늘 화면 주요 바로가기.
- [ ] 명령/표현 회귀 테스트 보강.
- [ ] 허브 화면 구현.
- [ ] 오늘 화면에 빠른 추가/집중/업무/일정/관계 바로가기.
- [ ] 모든 명령 이름 정리.
- [ ] 테스트 통과 후 커밋.

### Task 5: 설명 화면과 세분화 설정
**Files:** `src/features/help/help-view.ts`, `src/settings.ts`, `src/main.ts`
**Produces:** 자세한 한국어 설명 화면, 그룹화된 설정, 기본값 복원.
- [ ] 도움말 텍스트 회귀 테스트 추가.
- [ ] 설명 화면 구현.
- [ ] 설정 섹션을 기본/오늘/계획/집중/타임라인/달력/관계·약속/알림/표시·테마/데이터로 정리.
- [ ] 기본값 복원 버튼 구현.
- [ ] 테스트 통과 후 커밋.

### Task 6: 미래형 작업실 반응형 UI
**Files:** `styles.css`, 관련 view className 조정.
**Produces:** 다크 차콜 표면, 미세 그리드 질감, cyan/violet 네온 강조, 모바일 1열/태블릿 2열/PC 2~3열.
- [ ] CSS 회귀 테스트에 breakpoint/44px/reduced-motion 조건 추가.
- [ ] 디자인 토큰과 패널/칩/허브/관계/달력 스타일 구현.
- [ ] 600px/900px 기준 반응형 규칙 구현.
- [ ] `prefers-reduced-motion` 처리.
- [ ] 테스트 통과 후 커밋.

### Task 7: 문서·버전·설치 검증
**Files:** `README.md`, `manifest.json`, `package.json`, `.github/workflows/ci.yml`
**Produces:** 최신 사용법, 버전 갱신, 설치 산출물.
- [ ] README를 새 IA/관계/약속/타임라인/달력/기기별 UX에 맞게 갱신.
- [ ] 버전 일치.
- [ ] `npm test` 실행, 전체 PASS.
- [ ] `npm run build` 실행, PASS.
- [ ] CI에서 `main.js`, `manifest.json`, `styles.css` 아티팩트 생성 확인.
- [ ] PR 생성, CI 성공 확인, main 병합.
