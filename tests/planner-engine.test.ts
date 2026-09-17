import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDailyPlan, computeReviewStats } from '../src/features/planner/engine.ts';
import type { LifeOsSnapshot } from '../src/core/domain.ts';

const snapshot: LifeOsSnapshot = {
  blocks: [
    { id:'b1', title:'회의', date:'2026-09-18', startTime:'10:00', endTime:'11:00' }
  ],
  projects: [{ id:'p1', title:'Life OS', status:'active', progressMode:'manual', progress:40 }],
  tasks: [
    { id:'t1', title:'핵심 기능', projectId:'p1', due:'2026-09-18', status:'todo', researchDone:true, draftDone:false, priority:5, estimatedMinutes:60 },
    { id:'t2', title:'문서 정리', projectId:'p1', due:'2026-09-20', status:'todo', researchDone:true, draftDone:true, priority:2, estimatedMinutes:30 },
    { id:'t3', title:'완료된 일', projectId:'p1', due:'2026-09-17', status:'done', researchDone:true, draftDone:true, priority:5, estimatedMinutes:20 }
  ],
  goalActions: [],
  habits: [
    { id:'h1', title:'운동', frequency:'daily', checkins:['2026-09-16','2026-09-17','2026-09-18'] }
  ]
};

test('daily plan puts highest-value due work first and reserves buffer time', () => {
  const plan = buildDailyPlan(snapshot, '2026-09-18', { availableMinutes:240, bufferRatio:0.2, maxItems:5 });
  assert.equal(plan.bufferMinutes, 48);
  assert.equal(plan.today[0]?.id, 't1');
  assert.ok(plan.plannedMinutes <= 192);
  assert.ok(plan.tomorrow.some(item => item.id === 't2'));
});

test('review stats expose completion and habit streak without collapsing them into one score', () => {
  const stats = computeReviewStats(snapshot, '2026-09-18');
  assert.equal(stats.tasks.completed, 1);
  assert.equal(stats.tasks.total, 3);
  assert.equal(stats.habits[0]?.streak, 3);
});
