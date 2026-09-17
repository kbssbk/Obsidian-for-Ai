import assert from 'node:assert/strict';
import test from 'node:test';
import { eventsForDate, monthGridDates, weekDates } from '../src/features/calendar/engine';
import type { TimelineEvent } from '../src/core/domain';

test('월간 달력은 월요일 시작 42칸을 만든다',()=>{const dates=monthGridDates('2026-09-18');assert.equal(dates.length,42);assert.equal(dates[0],'2026-08-31');assert.equal(dates[41],'2026-10-11');});

test('주간 달력은 선택 날짜가 포함된 월요일부터 7일을 만든다',()=>{assert.deepEqual(weekDates('2026-09-18'),['2026-09-14','2026-09-15','2026-09-16','2026-09-17','2026-09-18','2026-09-19','2026-09-20']);});

test('날짜별 이벤트를 추린다',()=>{const events:TimelineEvent[]=[{id:'a',source:'task',date:'2026-09-18',title:'업무',status:'planned',detail:''},{id:'b',source:'appointment',date:'2026-09-19',title:'약속',status:'planned',detail:''}];assert.deepEqual(eventsForDate(events,'2026-09-18').map((event)=>event.id),['a']);});
