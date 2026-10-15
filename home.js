// Home: what to do today, money coming in, target progress. All values come from clifford-api; untrusted text is escaped. No figures in this file except the agreed goal fallback.
(function(){'use strict';const W=window.WN,{S,api,esc}=W;
const FB={goal:20000,deadline:'2026-10-31'};
S.tg=null;S.tgState='idle';S.money=[];S.moneyState='idle';
W.onLoad(async()=>{
 try{const r=await api('/target');S.tg=r&&typeof r=='object'?(r.target&&typeof r.target=='object'?r.target:r):null;S.tgState=S.tg?'live':'missing'}catch(e){if(e.status==401)throw e;S.tg=null;S.tgState='missing'}
 try{const r=await api('/reports?area=money');S.money=W.arr(r).filter(x=>x&&typeof x=='object');S.moneyState='ok'}catch(e){if(e.status==401)throw e;S.money=[];S.moneyState='none'}});
const num=v=>{if(v===''||v==null)return null;const n=Number(v);return isFinite(n)?n:null};
const aed=n=>'AED '+Math.round(n).toLocaleString('en-US');
const dKey=v=>{if(!v)return '';const s=String(v);return /^\d{4}-\d\d-\d\d/.test(s)?s.slice(0,10):(isNaN(new Date(s))?'':W.dkey(s))};
const PR={urgent:0,high:0,attention:1,normal:1,ok:2,low:2};
const resolved=x=>!!(x.resolved_at||x.resolution);
const isTrue=v=>v===true||v===1||v==='true';
function todo(){const out=[];
 (S.decisions||[]).filter(d=>d.status!='decided').forEach(d=>out.push({k:'Decision',t:d.title||'(untitled)',due:dKey(d.due),p:1,go:'#/decisions'}));
 (S.tasks||[]).filter(t=>t.status!='done'&&t.task_status!='closed').forEach(t=>out.push({k:'Task',t:t.title||t.subject||t.body_summary||t.snippet||'(untitled)',due:dKey(t.due),p:PR[t.priority]!=null?PR[t.priority]:1,go:'#/staff'}));
 (S.rep||[]).filter(x=>isTrue(x.needs_decision)&&!resolved(x)).forEach(x=>out.push({k:'Needs you',t:x.headline||'(no headline)',sub:x.detail||'',due:dKey(x.due),p:PR[x.status]!=null?PR[x.status]:1,id:x.id}));
 return out.sort((a,b)=>((a.due||'9')<(b.due||'9')?-1:(a.due||'9')>(b.due||'9')?1:0)||a.p-b.p)}
function secTodo(){const L=todo(),sh=L.slice(0,8),tk=W.todayK();
 return `<div class="card"><h2>What I have to do today</h2>${sh.length?sh.map(x=>`<div class="item"><div class="t"><span class="pill ${x.k=='Needs you'?'warn':''}">${esc(x.k)}</span>${esc(x.t)}</div><div class="mut sm">${x.due?(x.due<tk?'Overdue · was due ':'Due ')+esc(W.dl(x.due+'T12:00:00+04:00')):'No deadline'}</div>${x.sub?`<div class="why">${esc(x.sub)}</div>`:''}${x.id!=null?`<div class="row" style="margin-top:6px"><button class="btn sm" data-rep-res="approved" data-id="${esc(x.id)}">Approve</button><button class="btn alt sm" data-rep-res="dismissed" data-id="${esc(x.id)}">Dismiss</button></div>`:''}</div>`).join(''):'<div class="empty">Nothing waiting for you.</div>'}${L.length>sh.length?`<p style="margin:12px 0 0"><a href="#/decisions">See all (${L.length}) in Decisions</a></p>`:L.length?'<p style="margin:12px 0 0"><a href="#/decisions">See all in Decisions</a></p>':''}</div>`}
function secMoney(){const L=S.money.slice().sort((a,b)=>(+new Date(b.created_at)||0)-(+new Date(a.created_at)||0)).slice(0,4);
 return `<div class="card"><h2>Money coming in</h2>${L.length?L.map(x=>`<div class="item"><div class="t">${esc(x.headline||'')}</div>${x.detail?`<div class="why">${esc(x.detail)}</div>`:''}<div class="mut sm">${esc(x.agent||'')}${x.created_at&&!isNaN(new Date(x.created_at))?' · reported '+esc(W.dl(x.created_at)):''}</div></div>`).join(''):'<div class="empty">Not yet reported</div>'}</div>`}
function secTarget(){const live=S.tgState=='live'&&S.tg;
 const goal=(live&&num(S.tg.goal))||FB.goal,dl=(live&&S.tg.deadline&&dKey(S.tg.deadline))||FB.deadline;
 let earned=live?num(S.tg.earned):null,src=live?'from the target set by Chief':'fallback: goal and date as agreed, earned from collected deposits on your Status page; the target feed is not live yet';
 if(earned==null&&S.stLoaded&&S.st&&S.st.deposits_collected_aed&&typeof S.st.deposits_collected_aed.v=='number'){earned=S.st.deposits_collected_aed.v;if(live)src='goal from Chief; earned from collected deposits on Status'}
 const a=W.todayK().split('-').map(Number),b=dl.split('-').map(Number),left=Math.round((Date.UTC(b[0],b[1]-1,b[2])-Date.UTC(a[0],a[1]-1,a[2]))/864e5);
 const pct=earned==null?0:Math.max(0,Math.min(100,Math.round(earned/goal*100)));
 const dtxt=new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'}).format(new Date(Date.UTC(b[0],b[1]-1,b[2])));
 return `<div class="card"><h2>Target progress</h2><p style="margin:0 0 10px"><b>${esc(aed(goal))}</b> by ${esc(dtxt)}</p>
 <div class="hbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Progress to target"><i style="width:${pct}%"></i></div>
 <div class="stgrid" style="margin-top:12px"><div class="stcell"><div class="stl">Earned so far</div><div class="stv">${earned==null?'<span class="unsure">unsure</span>':'<b>'+esc(aed(earned))+'</b>'}</div></div><div class="stcell"><div class="stl">Left to earn</div><div class="stv">${earned==null?'<span class="unsure">unsure</span>':'<b>'+esc(aed(Math.max(goal-earned,0)))+'</b>'}</div></div><div class="stcell"><div class="stl">Days left (Dubai)</div><div class="stv"><b>${left>=0?left:'Deadline passed'}</b></div></div></div>
 ${live&&S.tg.note?`<p style="margin:8px 0 0"><b>Note:</b> ${esc(S.tg.note)}</p>`:''}<p class="mut sm" style="margin:8px 0 0">Source: ${esc(src)}.</p></div>`}
function view(){return `<h1>${esc(W.fmt(new Date().toISOString(),{weekday:'long',day:'numeric',month:'long'}))}</h1><p class="sub">Dubai time</p>${S.authed?'':W.needAuth()}${S.authed&&S.err?`<div class="notice">${esc(S.err)}</div>`:''}${S.authed?secTodo()+secMoney()+secTarget():''}`}
W.view('home','Home',view,'status');
})();
