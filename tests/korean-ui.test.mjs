import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = [
  'manifest.json',
  'src/main.ts',
  'src/settings.ts',
  'src/features/dashboard/dashboard-view.ts',
  'src/features/planner/planner-view.ts',
  'src/features/areas/areas-view.ts',
  'src/features/relationships/relationships-view.ts',
  'src/features/calendar/calendar-view.ts',
  'src/features/help/help-view.ts',
  'src/features/hub/hub-view.ts',
  'src/features/projects/projects-view.ts',
  'src/features/tasks/tasks-view.ts',
  'src/features/schedule/schedule-view.ts',
  'src/features/timeline/timeline-view.ts'
];

const forbiddenVisibleTerms = ['Analytics','Growth Paths','Connections','Money Flow','사람 · 관계 관리','돈 · 자금 흐름'];

test('사용자에게 보이는 핵심 화면은 한국어 중심 용어를 사용한다', async () => {
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    for (const term of forbiddenVisibleTerms) assert.equal(content.includes(term), false, `${file}에 이전 사용자 문구가 남아 있습니다: ${term}`);
  }
});

test('플러그인 표시 이름과 명령은 라이프 OS 중점 구분자를 사용한다', async () => {
  const manifest = JSON.parse(await readFile('manifest.json', 'utf8'));
  const main = await readFile('src/main.ts', 'utf8');
  assert.equal(manifest.name, '라이프 OS');
  assert.match(main, /라이프 OS · 빠른 실행/);
  assert.match(main, /라이프 OS · 빠른 추가/);
  assert.match(main, /라이프 OS · 오늘/);
  assert.match(main, /라이프 OS · 관계/);
  assert.match(main, /라이프 OS · 달력/);
  assert.match(main, /라이프 OS · 사용 설명/);
});

test('모바일·태블릿·PC 반응형과 접근성 스타일이 존재한다', async () => {
  const css = await readFile('styles.css', 'utf8');
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(css, /min-height: 44px/);
  assert.match(css, /prefers-reduced-motion/);
});
