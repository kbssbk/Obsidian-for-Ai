# 「시간을 절약하는 20가지 방법」 채택 기록

공식 원문: https://wol.jw.org/ko/wol/d/r8/lp-ko/102010124

Life OS는 원문의 20개 제안을 제품 원칙으로 채택합니다. 아래 내용은 원문을 복제한 것이 아니라, 각 제안을 현재 기능에 어떻게 적용했는지 정리한 구현 매핑입니다.

1. **매일 목록과 완료/이월** → Planner의 오늘/내일 목록, 업무 완료 체크.
2. **일정표 동기화** → 일정·업무·목표·사람·돈을 같은 Vault 원본에서 읽고 Dashboard/Timeline/Schedule이 같은 데이터를 공유.
3. **실행 계획** → 프로젝트와 연결 업무, 업무 단계 체크포인트, 목표 마일스톤/다음 행동.
4. **중요한 일 우선** → priority + 마감 기반 Focus Action.
5. **달성 가능한 목표** → 목표 진행률, 마일스톤, 작은 goal_action.
6. **모든 일을 다 하지 않기** → 하루 최대 계획 개수, 가용 시간 상한, 오늘/내일 분리.
7. **시간 사용 일지** → `lifeos_type: time_log` 기록과 Review의 시간 사용 Analytics.
8. **과도하게 계획하지 않기** → 계획 가능 시간과 과부하 경고.
9. **방해 최소화 시간** → 설정의 에너지 피크/집중 시간대를 Planner에 표시하고 Focus Action을 한 가지로 제한.
10. **좋은 컨디션 시간에 어려운 일** → 사용자 지정 에너지 피크 시간 + 가장 중요한 Focus Action.
11. **까다로운 일 먼저** → overdue/due/priority 가중치로 Focus Action 선별.
12. **여유 시간 확보** → 사용자 지정 버퍼 비율, 빈 슬롯 탐지.
13. **자투리 시간 활용** → 15분 이하 업무를 자투리 시간 후보로 별도 표시.
14. **80/20** → 우선순위 상위의 소수 행동을 먼저 노출하고 하루 계획 개수를 제한.
15. **오늘/내일로 나누기** → Planner Today/Tomorrow 분리.
16. **재충전** → 사용자 지정 재충전 시간을 하루 계획 신호에 표시.
17. **생각을 글로 외부화** → `Life OS: 생각 정리 노트 만들기` 명령이 문제/이유/해결책/다음 행동 템플릿 생성.
18. **완벽주의 피하기** → 업무를 자료 조사/초안/최종의 단계로 나누고, 미룬 일정은 5분으로 축소 가능.
19. **기분을 기다리지 말고 시작** → Dashboard/Planner의 “지금 할 한 가지”.
20. **융통성** → 가용 시간, 버퍼, 하루 최대 개수, 에너지 피크, 재충전 시간을 설정에서 조정.

## 관련 구현 위치

- Planner / Review / Analytics: `src/features/planner/`
- Quick Capture / 시간 사용 기록: `src/features/capture/`
- Schedule / 빈 슬롯 / 주간 보기: `src/features/schedule/`
- Task checkpoints: `src/features/tasks/`
- Projects: `src/features/projects/`
- Timeline derived view: `src/features/timeline/`
- Goals / People / Money: `src/features/areas/`
- 생각 정리 템플릿: `src/core/vault-repository.ts`

## 출처 추적

기존 저장소에서 흡수한 코드/UX 패턴의 링크는 `docs/references/absorbed-sources.md`에 별도로 기록합니다.
