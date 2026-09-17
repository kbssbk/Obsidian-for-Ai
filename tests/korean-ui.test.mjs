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
  'src/features/projects/projects-view.ts',
  'src/features/tasks/tasks-view.ts',
  'src/features/schedule/schedule-view.ts',
  'src/features/timeline/timeline-view.ts'
];

const forbiddenVisibleTerms = [
  'Life OS ',
  'Analytics',
  'Growth Paths',
  'Connections',
  'Money Flow'
];

test('사용자에게 보이는 핵심 화면은 한국어 용어를 사용한다', async () => {
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    for (const term of forbiddenVisibleTerms) {
      assert.equal(content.includes(term), false, `${file}에 영어 사용자 문구가 남아 있습니다: ${term}`);
    }
  }
});

test('플러그인 표시 이름과 핵심 명령은 한국어다', async () => {
  const manifest = JSON.parse(await readFile('manifest.json', 'utf8'));
  const main = await readFile('src/main.ts', 'utf8');
  assert.equal(manifest.name, '라이프 OS');
  assert.match(main, /라이프 OS: 빠른 추가/);
  assert.match(main, /라이프 OS: 오늘 열기/);
  assert.match(main, /라이프 OS: 계획·습관·회고 열기/);
});
