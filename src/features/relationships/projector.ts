import type { LifeOsAppointment, LifeOsPerson } from '../../core/domain';

export function appointmentsForPerson(appointments:LifeOsAppointment[],personId:string):LifeOsAppointment[]{
  return appointments.filter((item)=>item.personIds.includes(personId)).sort((a,b)=>`${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
}

export function splitPersonAppointments(appointments:LifeOsAppointment[],personId:string,today:string):{upcoming:LifeOsAppointment[];past:LifeOsAppointment[]} {
  const linked=appointmentsForPerson(appointments,personId);
  return {
    upcoming:linked.filter((item)=>item.status==='planned'&&item.date>=today),
    past:linked.filter((item)=>item.status!=='cancelled'&&(item.status==='done'||item.date<today)).sort((a,b)=>`${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`))
  };
}

export function namesForAppointment(appointment:LifeOsAppointment,people:LifeOsPerson[]):string[]{
  const map=new Map(people.map((person)=>[person.id,person.name]));
  return appointment.personIds.map((id)=>map.get(id)??id);
}
