/* Date-only values never acquire an invented appointment time. */
(function(root){
const zone='America/Cuiaba';
const closed=x=>typeof x==='string'?['concluido','pago','cancelado'].includes(x):(x.metadata?.recurrence==='diária'&&x.status!=='cancelado'?false:['concluido','pago','cancelado'].includes(x.status));
const dateKey=d=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d));
const day=x=>x.due_at?dateKey(x.due_at):(x.metadata?.due_date||'');
const time=x=>x.due_at?new Intl.DateTimeFormat('pt-BR',{timeZone:zone,hour:'2-digit',minute:'2-digit'}).format(new Date(x.due_at)):(x.metadata?.local_time||'');
const routine=x=>!!x.metadata?.recurrence;
const financial=x=>['boleto','fatura','nota_fiscal'].includes(x.kind);
const br=s=>s?s.split('-').reverse().join('/'):'Sem prazo informado';
const occurs=(x,d)=>!closed(x)&&(routine(x)&&x.metadata.recurrence==='diária'?x.metadata?.last_completed_date!==d:day(x)===d);
const moduleItems=(items,module,today)=>items.filter(x=>module==='history'?closed(x):!closed(x)).filter(x=>module==='history'||module==='calendar'||module==='today'?(module!=='today'||occurs(x,today)):module==='finance'?financial(x):module==='routines'?routine(x):module==='appointments'?x.kind==='compromisso'&&!routine(x):!financial(x)&&x.kind!=='compromisso'&&!routine(x));
const conflicts=(items,d)=>{const groups={};items.filter(x=>occurs(x,d)&&time(x)&&!financial(x)).forEach(x=>(groups[time(x)]??=[]).push(x));return Object.entries(groups).filter(([,v])=>v.length>1)};
const sort=(a,b)=>(day(a)||'9999').localeCompare(day(b)||'9999')||time(a).localeCompare(time(b))||a.title.localeCompare(b.title);
const api={zone,closed,dateKey,day,time,routine,financial,br,occurs,moduleItems,conflicts,sort};root.Agenda=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);