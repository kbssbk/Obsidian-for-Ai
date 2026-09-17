import assert from 'node:assert/strict';
import test from 'node:test';
import { parseLifeOsEntity } from '../src/core/frontmatter';

test('약속 frontmatter는 여러 사람과 장소·목적·후속 행동을 보존한다',()=>{
  const entity=parseLifeOsEntity('Life OS/Appointments/a.md','a',{
    lifeos_type:'appointment',lifeos_id:'appointment-1',title:'민수와 저녁',date:'2026-09-22',start_time:'19:00',end_time:'20:30',location:'수원역',purpose:'이직 상담',person_ids:['person-minsu','person-jisu'],note:'포트폴리오 이야기',next_action:'자료 보내기',status:'planned'
  });
  assert.equal(entity?.kind,'appointment');
  if(entity?.kind!=='appointment')return;
  assert.deepEqual(entity.value.personIds,['person-minsu','person-jisu']);
  assert.equal(entity.value.location,'수원역');
  assert.equal(entity.value.purpose,'이직 상담');
  assert.equal(entity.value.nextAction,'자료 보내기');
});
