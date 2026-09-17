# Life OS for Obsidian

삶의 일정·업무·목표를 각각 따로 관리하지 않고, 하나의 Obsidian 플러그인 안에서 **오늘 / 업무 현황 / 타임라인**으로 연결해 보는 통합 버전입니다.

핵심 원칙은 **기능은 분리하고 데이터는 통합한다**입니다. 프로젝트와 업무는 각 Markdown 노트의 YAML frontmatter가 원본이며, 타임라인과 대시보드는 그 데이터를 읽어 파생해서 보여줍니다. 같은 내용을 다른 곳에 다시 저장하지 않습니다.

## 사용 방법

플러그인을 켠 뒤 명령 팔레트에서 다음 명령을 사용할 수 있습니다.

- `Life OS: 오늘 열기`
- `Life OS: 업무 현황 열기`
- `Life OS: 타임라인 열기`

왼쪽 리본의 대시보드 아이콘을 누르면 `오늘` 화면이 열립니다. 설정에서 각 영역을 개별적으로 켜고 끌 수 있습니다.

## 프로젝트 노트 예시

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

`progress_mode`는 `manual` 또는 `auto`를 사용합니다. `manual`은 `progress` 값을 그대로 사용하고, `auto`는 연결된 업무 단계의 평균으로 진행률을 계산합니다.

## 업무 노트 예시

```yaml
---
lifeos_type: task
lifeos_id: task-mobile
project: project-life-os
title: 모바일 대응
status: todo
due: 2026-09-25
research_done: true
draft_done: false
---
```

업무의 다음 체크포인트는 기존 통합 설계와 동일하게 최종 마감일 기준으로 `자료 조사 -7일`, `초안 -3일`, `최종 마감` 순서로 계산됩니다. 완료된 업무는 타임라인의 예정 업무에서 제외됩니다.

## 일정 블록 예시

```yaml
---
lifeos_type: block
lifeos_id: block-focus
title: 집중 작업
date: 2026-09-18
start_time: "09:00"
end_time: "10:30"
---
```

## 목표 행동 예시

```yaml
---
lifeos_type: goal_action
lifeos_id: action-review
goal: goal-weekly-review
title: 주간 회고
estimated_minutes: 20
done: false
---
```

날짜가 없는 목표 행동은 타임라인 맨 아래에 `기한 미정`으로 표시됩니다.

## 데이터 안전성

이 플러그인은 현재 읽기 중심 통합 버전입니다. 기존 Markdown 노트를 강제로 이동하거나 스키마를 일괄 변환하지 않습니다. `lifeos_type`이 있는 노트만 Life OS 데이터로 읽습니다.

## 개발

```bash
npm install
npm test
npm run build
```

통합 구조는 이후 Habits, Planner, Review, Analytics를 같은 방식으로 추가할 수 있도록 공통 도메인과 파생 뷰를 분리해 두었습니다.
