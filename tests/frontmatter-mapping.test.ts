import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLifeOsEntity } from '../src/core/vault-repository.ts';

test('maps project frontmatter without requiring content migration', () => {
  const entity = parseLifeOsEntity('Projects/통합.md', '통합', {
    lifeos_type:'project', lifeos_id:'project-1', status:'active', progress_mode:'manual', progress:60, due:'2026-10-01'
  });
  assert.deepEqual(entity, {
    kind:'project', value:{ id:'project-1', title:'통합', status:'active', progressMode:'manual', progress:60, due:'2026-10-01', path:'Projects/통합.md' }
  });
});

test('maps task frontmatter and normalizes defaults', () => {
  const entity = parseLifeOsEntity('Tasks/테스트.md', '테스트', {
    lifeos_type:'task', project:'project-1', due:'2026-09-30'
  });
  assert.equal(entity?.kind, 'task');
  if (entity?.kind !== 'task') return;
  assert.equal(entity.value.status, 'todo');
  assert.equal(entity.value.id, 'Tasks/테스트.md');
});
