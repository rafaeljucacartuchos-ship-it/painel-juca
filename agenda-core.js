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
const monthly=x=>x.metadata?.recurrence==='mensal';
const monthDate=(ym,n)=>{const [y,m]=ym.split('-').map(Number);return ym+'-'+String(Math.min(n,new Date(Date.UTC(y,m,0)).getUTCDate())).padStart(2,'0')};
const monthlyDay=x=>Number(x.metadata?.recurrence_day)||Number(day(x).slice(8,10));
const nextMonth=x=>{const d=day(x);if(!/^\d{4}-\d{2}-\d{2}$/.test(d))throw Error('Informe a data da próxima ocorrência.');const [y,m]=d.split('-').map(Number);return monthDate(new Date(Date.UTC(y,m,1)).toISOString().slice(0,7),monthlyDay(x))};
const completeMonthly=(x,now=new Date().toISOString())=>{const next=nextMonth(x);return {status:'a_confirmar',due_at:time(x)?next+'T'+time(x)+':00-04:00':null,metadata:{...x.metadata,recurrence_day:monthlyDay(x),due_date:next,monthly_completions:[...(x.metadata?.monthly_completions||[]),{due_date:day(x),completed_at:now}]}}};
const occurs=(x,d)=>!closed(x)&&(routine(x)&&x.metadata.recurrence==='diária'?x.metadata?.last_completed_date!==d:monthly(x)?!!day(x)&&d>=day(x)&&d===monthDate(d.slice(0,7),monthlyDay(x)):day(x)===d);
const moduleItems=(items,module,today)=>items.filter(x=>module==='history'?closed(x):!closed(x)).filter(x=>module==='history'||module==='calendar'||module==='today'?(module!=='today'||occurs(x,today)):module==='finance'?financial(x):module==='routines'?routine(x):module==='appointments'?x.kind==='compromisso'&&!routine(x):!financial(x)&&x.kind!=='compromisso'&&!routine(x));
const conflicts=(items,d)=>{const groups={};items.filter(x=>occurs(x,d)&&time(x)&&!financial(x)).forEach(x=>(groups[time(x)]??=[]).push(x));return Object.entries(groups).filter(([,v])=>v.length>1)};
const sort=(a,b)=>(day(a)||'9999').localeCompare(day(b)||'9999')||time(a).localeCompare(time(b))||a.title.localeCompare(b.title);
const api={monthly,monthlyDay,nextMonth,completeMonthly,zone,closed,dateKey,day,time,routine,financial,br,occurs,moduleItems,conflicts,sort};root.Agenda=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);