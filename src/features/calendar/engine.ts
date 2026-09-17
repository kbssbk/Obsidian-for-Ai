import type { TimelineEvent } from '../../core/domain';

function iso(date:Date):string{return date.toISOString().slice(0,10);}
function parse(value:string):Date{return new Date(`${value}T12:00:00Z`);}

export function monthGridDates(anchor:string):string[]{
  const date=parse(anchor);const first=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),1,12));const mondayOffset=(first.getUTCDay()+6)%7;first.setUTCDate(first.getUTCDate()-mondayOffset);const result:string[]=[];for(let i=0;i<42;i++){const day=new Date(first);day.setUTCDate(first.getUTCDate()+i);result.push(iso(day));}return result;
}

export function weekDates(anchor:string):string[]{
  const date=parse(anchor);const mondayOffset=(date.getUTCDay()+6)%7;date.setUTCDate(date.getUTCDate()-mondayOffset);const result:string[]=[];for(let i=0;i<7;i++){const day=new Date(date);day.setUTCDate(date.getUTCDate()+i);result.push(iso(day));}return result;
}

export function eventsForDate(events:TimelineEvent[],date:string):TimelineEvent[]{return events.filter((event)=>event.date===date);}
