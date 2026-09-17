# Life OS for Obsidian

일정·업무·프로젝트·목표·습관·사람·돈·시간 사용 기록을 각각 따로 관리하지 않고, 하나의 Obsidian 플러그인 안에서 연결해 보는 통합 버전입니다.

핵심 원칙은 **기능은 분리하고 데이터는 통합한다**입니다. 각 Markdown 노트의 YAML frontmatter가 원본이며, Dashboard·Timeline·Planner·Review·Analytics는 같은 데이터를 읽어 파생해서 보여줍니다.

## 주요 화면과 명령

- `Life OS: 빠른 추가` — 업무/일정/목표/사람/돈/시간 사용 기록
- `Life OS: 오늘 열기` — Focus Action, 오늘 업무, 프로젝트, 생활 신호
- `Life OS: 주간 일정 열기` — 7일 일정과 성장 시간
- `Life OS: 프로젝트 진행도 열기` — 프로젝트별 수동/자동 진행률
- `Life OS: 마감 업무 열기` — 기한 그룹과 자료 조사/초안/최종 체크포인트
- `Life OS: 타임라인 열기` — 일정·업무·목표·사람·돈 통합 흐름
- `Life OS: 계획·습관·회고 열기` — 오늘/내일, 버퍼, 빈 슬롯, 충돌, 복구, 습관, Analytics
- `Life OS: 생활 영역 열기` — 목표/마일스톤/사람/예산/정기 결제/저축 목표
- `Life OS: 생각 정리 노트 만들기` — 문제/이유/해결책/다음 행동 템플릿

## 기본 frontmatter 유형

프로젝트:

```yaml
---
lifeos_type: project
lifeos_id: project-life-os
title: Life OS 통합
status: active
progress_mode: manual
progress: 60
start: 2026-09-18
due: 2026-10-01
---
```

업무:

```yaml
---
lifeos_type: task
lifeos_id: task-mobile
project: project-life-os
title: 모바일 대응
status: todo
due: 2026-09-25
priority: 5
estimated_minutes: 60
research_done: true
draft_done: false
---
```

일정:

```yaml
---
lifeos_type: block
title: 집중 작업
date: 2026-09-18
start_time: "09:00"
end_time: "10:30"
status: todo
growth: true
---
```

목표/마일스톤/다음 행동:

```yaml
---
lifeos_type: goal
title: 영어 실력 향상
target_date: 2026-12-31
status: active
progress: 30
---
```

```yaml
---
lifeos_type: milestone
goal: goal-english
title: 교재 1권 완료
due: 2026-10-31
done: false
position: 1
---
```

```yaml
---
lifeos_type: goal_action
goal: goal-english
title: 단어 20개 복습
estimated_minutes: 15
done: false
---
```

습관:

```yaml
---
lifeos_type: habit
title: 운동
frequency: daily
checkins:
  - 2026-09-16
  - 2026-09-17
  - 2026-09-18
---
```

사람:

```yaml
---
lifeos_type: person
title: 민수
relationship: 친구
organization: 회사
phone: "010-0000-0000"
next_contact: 2026-09-20
favorite: true
---
```

돈:

```yaml
---
lifeos_type: money
title: 장보기
kind: expense
amount: 50000
category: 생활
date: 2026-09-18
---
```

예산/정기 결제/저축 목표는 각각 `budget`, `recurring_payment`, `savings_goal` 유형을 사용합니다.

시간 사용 기록:

```yaml
---
lifeos_type: time_log
title: 플러그인 개발
date: 2026-09-18
start_time: "09:00"
end_time: "10:30"
category: 집중
---
```

## 시간 관리 원칙과 근거

Planner/Review/Analytics에는 워치타워 온라인 라이브러리의 「시간을 절약하는 20가지 방법」에 나오는 20개 제안을 모두 제품 원칙으로 매핑했습니다. 우선순위, 단일 일정 원본, 실행 계획, 현실적인 목표, 과부하 제한, 시간 사용 일지, 집중 시간, 에너지 피크, 버퍼, 자투리 시간, 80/20, 오늘/내일 분리, 재충전, 생각 정리, 완벽주의 방지, 즉시 시작, 유연한 조정 등을 기능으로 반영합니다.

공식 원문: https://wol.jw.org/ko/wol/d/r8/lp-ko/102010124

세부 매핑: `docs/references/time-saving-20.md`

기존 저장소에서 흡수한 코드/UX 패턴의 원본 링크: `docs/references/absorbed-sources.md`

## 데이터 안전성

기존 Markdown 노트를 강제로 이동하거나 일괄 변환하지 않습니다. `lifeos_type`이 있는 노트만 Life OS 데이터로 읽습니다. Dashboard와 Timeline은 별도 복제 데이터를 만들지 않습니다. 화면에서 체크/진행률/복구 등을 직접 조작할 때만 해당 노트의 관련 frontmatter를 수정합니다.

## 개발/검증

```bash
npm install
npm test
npm run build
```
