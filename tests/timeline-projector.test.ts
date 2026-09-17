import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTimelineEvents } from '../src/features/timeline/projector.ts';
import type { LifeOsSnapshot } from '../src/core/domain.ts';

const snapshot: LifeOsSnapshot = {
  blocks: [{ id:'b1', title:'집중 작업', date:'2026-09-18', startTime:'09:00', endTime:'10:00' }],
  tasks: [
    { id:'t1', title:'보고서', projectId:'p1', due:'2026-09-20', status:'todo', researchDone:false, draftDone:false },
    { id:'t2', title:'완료 업무', projectId:'p1', due:'2026-09-19', status:'done', researchDone:true, draftDone:true }
  ],
  projects: [{ id:'p1', title:'통합 플러그인', status:'active', progressMode:'auto', progress:0 }],
  goalActions: [{ id:'g1', title:'주간 회고', goalId:'goal1', estimatedMinutes:20, done:false }]
};

test('timeline derives source records, filters completed tasks, and keeps undated actions last', () => {
  const events = buildTimelineEvents(snapshot, { from:'2026-09-18', to:'2026-09-30' });
  assert.deepEqual(events.map(event => event.id), ['task:t1', 'block:b1', 'action:g1']);
  assert.equal(events.at(-1)?.date, '');
});

test('task checkpoint before range is marked attention but retained as actionable', () => {
  const events = buildTimelineEvents(snapshot, { from:'2026-09-19', to:'2026-09-30' });
  const task = events.find(event => event.id === 'task:t1');
  assert.equal(task?.status, 'attention');
});
