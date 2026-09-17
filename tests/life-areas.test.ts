import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLifeOsEntity } from '../src/core/frontmatter.ts';
import { findOpenSlot, findScheduleConflicts } from '../src/features/planner/engine.ts';
import { buildTimelineEvents } from '../src/features/timeline/projector.ts';
import type { LifeOsSnapshot } from '../src/core/domain.ts';

test('parses goal person money budget recurring and savings records', () => {
  const goal = parseLifeOsEntity('Goals/a.md','a',{lifeos_type:'goal',title:'언어 학습',target_date:'2026-12-01',progress:30});
  const person = parseLifeOsEntity('People/b.md','b',{lifeos_type:'person',title:'민수',relationship:'친구',next_contact:'2026-09-18',favorite:true});
  const money = parseLifeOsEntity('Money/c.md','c',{lifeos_type:'money',title:'장보기',kind:'expense',amount:50000,date:'2026-09-18',category:'생활'});
  const budget = parseLifeOsEntity('Money/d.md','d',{lifeos_type:'budget',month:'2026-09',category:'생활',limit_amount:500000});
  const recurring = parseLifeOsEntity('Money/e.md','e',{lifeos_type:'recurring_payment',title:'구독',amount:10000,next_due:'2026-09-22',active:true});
  const savings = parseLifeOsEntity('Money/f.md','f',{lifeos_type:'savings_goal',title:'비상금',target_amount:1000000,current_amount:250000,target_date:'2026-12-31'});
  assert.equal(goal?.kind,'goal');
  assert.equal(person?.kind,'person');
  assert.equal(money?.kind,'money');
  assert.equal(budget?.kind,'budget');
  assert.equal(recurring?.kind,'recurring');
  assert.equal(savings?.kind,'savings');
});

test('schedule coach finds collisions and next open slot', () => {
  const blocks = [
    {id:'a',title:'A',date:'2026-09-18',startTime:'09:00',endTime:'10:00',status:'todo' as const},
    {id:'b',title:'B',date:'2026-09-18',startTime:'09:30',endTime:'10:30',status:'todo' as const},
    {id:'c',title:'C',date:'2026-09-18',startTime:'11:00',endTime:'12:00',status:'todo' as const}
  ];
  assert.equal(findScheduleConflicts(blocks).length,1);
  assert.deepEqual(findOpenSlot(blocks,'2026-09-18',30),{startTime:'10:30',endTime:'11:00'});
});

test('timeline projects people and money without creating duplicate stores', () => {
  const snapshot:LifeOsSnapshot = {
    blocks:[],tasks:[],projects:[],goalActions:[],
    people:[{id:'p',name:'민수',relationship:'친구',nextContactDate:'2026-09-18'}],
    moneyEntries:[{id:'m',title:'장보기',kind:'expense',amount:50000,date:'2026-09-18',category:'생활'}]
  };
  const events=buildTimelineEvents(snapshot,{from:'2026-09-18',to:'2026-09-20'});
  assert.deepEqual(events.map((event)=>event.source),['person','money']);
});
