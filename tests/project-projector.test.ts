import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveProjectProgress, buildDashboard } from '../src/features/projects/projector.ts';
import type { LifeOsSnapshot } from '../src/core/domain.ts';

const snapshot: LifeOsSnapshot = {
  blocks: [],
  projects: [
    { id:'manual', title:'수동 프로젝트', status:'active', progressMode:'manual', progress:70 },
    { id:'auto', title:'자동 프로젝트', status:'active', progressMode:'auto', progress:0 }
  ],
  tasks: [
    { id:'a', title:'완료', projectId:'auto', due:'2026-09-18', status:'done', researchDone:true, draftDone:true },
    { id:'b', title:'진행', projectId:'auto', due:'2026-09-19', status:'todo', researchDone:true, draftDone:false }
  ],
  goalActions: []
};

test('manual progress uses stored value and auto progress averages task stage completion', () => {
  assert.equal(resolveProjectProgress(snapshot.projects[0], snapshot.tasks), 70);
  assert.equal(resolveProjectProgress(snapshot.projects[1], snapshot.tasks), 75);
});

test('dashboard returns active projects and due open tasks', () => {
  const dashboard = buildDashboard(snapshot, '2026-09-19');
  assert.equal(dashboard.projects.length, 2);
  assert.deepEqual(dashboard.tasks.map(task => task.id), ['b']);
});
