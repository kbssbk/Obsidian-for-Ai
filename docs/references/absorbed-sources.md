# 흡수한 원본 코드와 근거

이 문서는 통합 Life OS가 어떤 기존 구현에서 아이디어와 동작 패턴을 가져왔는지 추적하기 위한 기록입니다. 원본 저장소를 삭제하거나 덮어쓰지 않고, Obsidian Markdown/YAML 모델에 맞게 다시 구현했습니다.

## gpt-site

- Today / Focus Action / Recovery: https://github.com/kbssbk/gpt-site/blob/main/components/today/today-view.tsx
- Timeline derived view: https://github.com/kbssbk/gpt-site/blob/main/components/timeline/timeline-view.tsx
- Cross-domain projection / Focus / Money signals: https://github.com/kbssbk/gpt-site/blob/main/lib/operations.ts
- Schedule Coach / 빈 슬롯 / 충돌: https://github.com/kbssbk/gpt-site/blob/main/lib/schedule-coach.ts
- Weekly Calendar / 성장 시간: https://github.com/kbssbk/gpt-site/blob/main/components/calendar/calendar-view.tsx
- Deadline Tasks / 단계 체크포인트: https://github.com/kbssbk/gpt-site/blob/main/components/tasks/tasks-view.tsx
- Goals / milestones / next actions: https://github.com/kbssbk/gpt-site/blob/main/components/goals/goals-view.tsx
- People / next contact / favorites: https://github.com/kbssbk/gpt-site/blob/main/components/people/people-view.tsx
- Money / ledger / budget / recurring / savings: https://github.com/kbssbk/gpt-site/blob/main/components/money/money-view.tsx
- Multi-domain Quick Add: https://github.com/kbssbk/gpt-site/blob/main/components/workspace/quick-add.tsx
- Flow lenses: https://github.com/kbssbk/gpt-site/blob/main/components/flow/flow-hub.tsx
- Life Wall summary: https://github.com/kbssbk/gpt-site/blob/main/components/life-wall/life-wall.tsx
- Original life-operations design: https://github.com/kbssbk/gpt-site/blob/main/docs/superpowers/specs/2026-09-10-life-operations-lobby-design.md

## 외부 시간 관리 원칙

- 「시간을 절약하는 20가지 방법」, 워치타워 온라인 라이브러리: https://wol.jw.org/ko/wol/d/r8/lp-ko/102010124
- 기능별 채택 매핑: `docs/references/time-saving-20.md`

## 통합 원칙

1. 기능은 모듈로 나누되 사용자는 하나의 플러그인으로 설치한다.
2. 원본 데이터는 Markdown/YAML 노트가 소유한다.
3. Dashboard, Timeline, Planner, Analytics는 원본을 읽는 파생 뷰다.
4. 다른 저장소의 React/Next.js/DB 구현을 그대로 복사하지 않고 Obsidian Vault API에 맞게 재구현한다.
5. 원본 아이디어를 사용한 기능에는 이 문서 또는 기능 문서에서 참조 링크를 유지한다.
