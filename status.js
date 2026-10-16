// Status: one-page numbers view. Values come from clifford-api /memory entries tagged 'status'. No figures in this file. Missing = 'unsure'.
(function(){'use strict';const W=window.WN,{S,esc}=W;
S.st={};S.stLoaded=false;
W.onLoad(async soft=>{const r=await soft('/memory');if(!r)return;const o={};W.arr(r).forEach(m=>{const tg=Array.isArray(m.tags)?m.tags:[];if(tg.indexOf('status')<0||!/^status\./.test(m.title||''))return;try{const e=JSON.parse(m.body);if(e&&typeof e=='object'&&'v' in e)o[m.title.slice(7)]=e}catch(x){}});S.st=o;S.stLoaded=true});
const U='<span class="unsure">unsure</span>';
const g=k=>S.stLoaded&&S.st[k]&&S.st[k].v!==''&&S.st[k].v!=null?S.st[k]:null;
const num=k=>{const e=g(k);return e&&typeof e.v=='number'&&isFinite(e.v)?e.v:null};
const aed=n=>'AED '+n.toLocaleString('en-US');
const tag=e=>e?`<span class="stc">${esc(e.conf||'')}${e.src?' · '+esc(e.src):''}</span>`:'';
function val(k,f){const e=g(k);if(!e)return U;return '<b>'+esc(f?f(e.v):e.v)+'</b>'}
function cell(label,html,note){return `<div class="stcell"><div class="stl">${esc(label)}</div><div class="stv">${html}</div>${note?`<div class="stn">${note}</div>`:''}</div>`}
const nm=(k,f)=>{const e=g(k);return cell(null,'')};
function c(label,k,f){const e=g(k);return cell(label,val(k,f),e?tag(e):'')}
function parts(k){const d=g('goal_date');if(!d||!/^\d{4}-\d\d-\d\d$/.test(d.v))return null;const a=W.todayK().split('-').map(Number),b=d.v.split('-').map(Number);return Math.round((Date.UTC(b[0],b[1]-1,b[2])-Date.UTC(a[0],a[1]-1,a[2]))/864e5)}
function view(){
 const now=W.fmt(new Date().toISOString(),{weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
 const dl=parts(),goal=num('goal_aed'),dep=num('deposits_collected_aed'),rec=num('receivables_aed');
 const open=S.decLoaded?S.decisions.filter(d=>d.status!='decided').length:null;
 const gap=goal!=null&&dep!=null?Math.max(goal-dep,0):null;
 const th=g('unanswered_threads'),bl=g('unfinished_builds');
 const lst=e=>Array.isArray(e.v)&&e.v.length?`<ul class="stul">${e.v.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul>${tag(e)}`:'<b>none recorded</b>'+tag(e);
 const sc=(label,k)=>{const a=num(k),t=num(k=='exec_clients_signed'?'exec_clients_target':'conversations_target');return cell(label,a==null?U:'<b>'+a+'</b>'+(t!=null?' <span class="mut">of '+t+'</span>':''))};
 return `<h1>Status</h1><p class="sub">${esc(now)} (Dubai) · ${dl==null?U:'<b>'+(dl>=0?dl+' days left to 31 Oct 2026':Math.abs(dl)+' days past the goal date')+'</b>'} · values come from your private server; 'unsure' = not supplied or not verified.</p>${W.gate()}${W.needAuth()}
 ${S.authed&&!S.stLoaded?'<div class="notice">Status values could not be loaded. Everything shows unsure.</div>':''}
 <div class="card"><h2>1 · Where you are now</h2><div class="stgrid">${c('LaunchRiot clients in setup','clients_in_setup')}${c('Bots live','bots_live')}${c('Videos in progress','videos_in_progress')}</div></div>
 <div class="card"><h2>2 · Pending</h2><div class="stgrid">${cell('Open items (decisions)',open==null?U:'<b>'+open+'</b>','live from Decisions')}${cell('Receivables',rec==null?U:'<b>'+aed(rec)+'</b>',g('receivables_aed')?tag(g('receivables_aed')):'')}${cell('Cash on hand',U,g('cash_on_hand_note')?'<span class="stc">'+esc(g('cash_on_hand_note').v)+'</span>':'')}</div>
 <div class="stgrid"><div class="stcell wide"><div class="stl">Unanswered threads</div>${th?lst(th):U}</div><div class="stcell wide"><div class="stl">Unfinished builds</div>${bl?lst(bl):U}</div></div></div>
 <div class="card"><h2>3 · Goal</h2><div class="stgrid">${cell('Goal',goal==null?U:'<b>'+aed(goal)+'</b> by 31 Oct 2026',tag(g('goal_aed')))}${cell('Today (Dubai)','<b>'+esc(W.fmt(new Date().toISOString(),{day:'numeric',month:'short',year:'numeric'}))+'</b>')}${cell('Days left',dl==null?U:'<b>'+dl+'</b>')}</div></div>
 <div class="card"><h2>4 · KPIs</h2><div class="stgrid">${sc('Exec clients signed','exec_clients_signed')}${sc('Conversations started','conversations_started')}${cell('Deposits collected',dep==null?U:'<b>'+aed(dep)+'</b>',tag(g('deposits_collected_aed')))}${cell('Recurring run rate',num('recurring_run_rate_aed')==null?U:'<b>'+aed(num('recurring_run_rate_aed'))+'</b> / month',tag(g('recurring_run_rate_aed')))}${cell('MRR target by 31 Oct',num('mrr_target_aed')==null?U:'<b>~'+aed(num('mrr_target_aed'))+'</b> / month <span class="mut">(estimate)</span>',tag(g('mrr_target_aed')))}</div>
 <p class="mut sm">Targets: ${num('exec_clients_target')==null?U:num('exec_clients_target')+' exec clients'} · ${num('conversations_target')==null?U:num('conversations_target')+' conversations'}</p></div>
 <div class="card"><h2>5 · Gap to goal</h2><div class="stgrid">${cell('Gap in AED',gap==null?U:'<b>'+aed(gap)+'</b>','computed: goal minus deposits collected')}${cell('Clients still needed',num('exec_clients_signed')==null||num('exec_clients_target')==null?U:'<b>'+Math.max(num('exec_clients_target')-num('exec_clients_signed'),0)+'</b>')}${cell('Conversations still needed',num('conversations_started')==null||num('conversations_target')==null?U:'<b>'+Math.max(num('conversations_target')-num('conversations_started'),0)+'</b>')}</div></div>
 <div class="card"><h2>6 · Staff costs</h2><div class="stgrid">${cell('India dev',g('india_dev_cost_aed_per_month')?'<b>AED '+esc(g('india_dev_cost_aed_per_month').v)+'</b> / month':U,tag(g('india_dev_cost_aed_per_month')))}${c('Sales','sales_commission')}${cell('Break-even',val('breakeven_note'),tag(g('breakeven_note')))}</div></div>`}
W.view('status','Status',view,'overview');
})();
