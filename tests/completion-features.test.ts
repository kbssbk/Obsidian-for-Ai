import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLifeOsEntity } from '../src/core/frontmatter.ts';

test('반복 업무 frontmatter를 읽는다', () => {
  const parsed=parseLifeOsEntity('Inbox/repeat.md','repeat',{
    lifeos_type:'task',lifeos_id:'task-repeat',title:'매일 운동',due:'2026-09-18',status:'todo',recurrence:'daily',last_completed:'2026-09-17'
  });
  assert.equal(parsed?.kind,'task');
  if(parsed?.kind!=='task')return;
  assert.equal(parsed.value.recurrence,'daily');
  assert.equal(parsed.value.lastCompleted,'2026-09-17');
});

test('집중 시간 기록이 작업 id와 연결된다', () => {
  const parsed=parseLifeOsEntity('Time Logs/focus.md','focus',{
    lifeos_type:'time_log',lifeos_id:'log-focus',title:'보고서 작성',date:'2026-09-18',start_time:'09:00',end_time:'09:25',category:'집중',task:'task-report'
  });
  assert.equal(parsed?.kind,'timeLog');
  if(parsed?.kind!=='timeLog')return;
  assert.equal(parsed.value.taskId,'task-report');
  assert.equal(parsed.value.category,'집중');
});
