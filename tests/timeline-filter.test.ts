import assert from 'node:assert/strict';
import test from 'node:test';
import type { TimelineEvent } from '../src/core/domain';
import { filterTimelineEvents } from '../src/features/timeline/projector';

const events:TimelineEvent[]=[
  {id:'1',source:'task',date:'2026-09-18',title:'업무',status:'planned',detail:''},
  {id:'2',source:'appointment',date:'2026-09-19',title:'약속',status:'planned',detail:'',personIds:['p1']},
  {id:'3',source:'appointment',date:'2026-09-20',title:'다른 약속',status:'done',detail:'',personIds:['p2']},
  {id:'4',source:'money',date:'2026-09-21',title:'지출',status:'done',detail:''}
];

test('타임라인은 여러 종류를 선택해서 볼 수 있다',()=>{const filtered=filterTimelineEvents(events,{sources:new Set(['task','appointment']),showDone:true});assert.deepEqual(filtered.map((event)=>event.id),['1','2','3']);});

test('특정 사람과 완료 숨김 조건을 함께 적용한다',()=>{const filtered=filterTimelineEvents(events,{sources:new Set(['appointment']),personId:'p1',showDone:false});assert.deepEqual(filtered.map((event)=>event.id),['2']);});
