import assert from 'node:assert/strict';
import test from 'node:test';
import { appointmentsForPerson, splitPersonAppointments } from '../src/features/relationships/projector';
import type { LifeOsAppointment } from '../src/core/domain';

const appointments:LifeOsAppointment[]=[
  {id:'a1',title:'저녁',date:'2026-09-22',startTime:'19:00',endTime:'20:00',personIds:['p1','p2'],status:'planned'},
  {id:'a2',title:'지난 만남',date:'2026-09-10',startTime:'12:00',endTime:'13:00',personIds:['p1'],status:'done'},
  {id:'a3',title:'다른 사람',date:'2026-09-23',startTime:'18:00',endTime:'19:00',personIds:['p3'],status:'planned'}
];

test('한 약속은 연결된 모든 사람의 관계 이력에 나타난다',()=>{assert.deepEqual(appointmentsForPerson(appointments,'p1').map((item)=>item.id),['a2','a1']);assert.deepEqual(appointmentsForPerson(appointments,'p2').map((item)=>item.id),['a1']);});

test('관계 상세는 예정과 지난 만남을 나눈다',()=>{const result=splitPersonAppointments(appointments,'p1','2026-09-18');assert.deepEqual(result.upcoming.map((item)=>item.id),['a1']);assert.deepEqual(result.past.map((item)=>item.id),['a2']);});
