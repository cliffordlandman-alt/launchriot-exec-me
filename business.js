// Business: control-room view fed by clifford-api GET /reports. All item text is untrusted and escaped. No data in this file.
// Approve/Dismiss only records a decision via POST /reports/:id/resolve; nothing is sent anywhere from here.
(function(){'use strict';const W=window.WN,{S,api,esc,toast}=W;
S.rep=[];S.repState='idle';S.repArea='';S.repStatus='';S.repBusy={};
const ST=['urgent','attention','ok'],LBL={urgent:'Urgent',attention:'Attention',ok:'OK'};
W.onLoad(async()=>{try{const r=await api('/reports');S.rep=W.arr(r).filter(x=>x&&typeof x=='object');S.repState='ok'}
 catch(e){if(e.status==401)throw e;S.rep=[];S.repState=(e.status==404||e.status==501)?'missing':'error'}});
const st=x=>ST.indexOf(x.status)>=0?x.status:'attention';
const when=x=>x.created_at&&!isNaN(new Date(x.created_at))?W.dl(x.created_at)+' '+W.tm(x.created_at):'';
const area=x=>String(x.area||'').trim()||'Unassigned',agent=x=>String(x.agent||'').trim()||'Unknown';
const ts=x=>x.created_at&&!isNaN(new Date(x.created_at))?+new Date(x.created_at):0;
const resolved=x=>!!(x.resolved_at||x.resolution);
const pend=x=>(x.needs_decision===true||x.needs_decision===1||x.needs_decision==='true')&&!resolved(x);
const pill=s=>`<span class="pill ${s=='ok'?'ok':s=='urgent'?'warn bz-urgent':'warn'}">${esc(LBL[s])}</span>`;
function row(x,act){const id=esc(x.id),b=S.repBusy[x.id];
 return `<div class="item"><div class="t">${esc(x.headline||'(no headline)')} ${pill(st(x))}</div>
 <div class="mut sm">${esc(agent(x))} · ${esc(area(x))}${when(x)?' · '+esc(when(x)):''}${x.resolution?' · '+esc(x.resolution):''}</div>
 ${x.detail?`<div class="why">${esc(x.detail)}</div>`:''}
 ${act?`<div class="row" style="margin-top:6px"><button class="btn sm" data-rep-res="approved" data-id="${id}" ${b?'disabled':''}>Approve</button><button class="btn alt sm" data-rep-res="dismissed" data-id="${id}" ${b?'disabled':''}>Dismiss</button></div>`:''}</div>`}
function view(){
 const head=`<h1>Business</h1><p class="sub">Reports from your agents, grouped by area. Approve or Dismiss only records your decision; nothing is sent to anyone from here.</p>${W.gate()}${W.needAuth()}`;
 if(!S.authed)return head;
 if(S.repState=='missing')return head+'<div class="notice">Reports feed not connected yet.</div>';
 if(S.repState=='error')return head+'<div class="notice">Reports could not be loaded right now. Nothing is shown.</div>';
 if(!S.rep.length)return head+'<div class="card"><div class="empty">No reports yet. Nothing has been reported by your agents.</div></div>';
 const areas=[...new Set(S.rep.map(area))].sort(),f=S.rep.filter(x=>(!S.repArea||area(x)==S.repArea)&&(!S.repStatus||st(x)==S.repStatus));
 const sel=(id,lab,opts,cur)=>`<label style="margin:0;flex:1;min-width:140px">${lab}<select id="${id}"><option value="">All</option>${opts.map(o=>`<option value="${esc(o[0])}" ${o[0]==cur?'selected':''}>${esc(o[1])}</option>`).join('')}</select></label>`;
 const filters=`<div class="row" style="margin-bottom:14px">${sel('rep-area','Area',areas.map(a=>[a,a]),S.repArea)}${sel('rep-status','Status',ST.map(s=>[s,LBL[s]]),S.repStatus)}</div>`;
 const g={};f.forEach(x=>{(g[area(x)]=g[area(x)]||[]).push(x)});
 const ov=Object.keys(g).sort().map(a=>{const c={urgent:0,attention:0,ok:0};g[a].forEach(x=>c[st(x)]++);
  return `<div class="stcell"><div class="stl">${esc(a)}</div><div class="stv"><b>${g[a].length}</b> <span class="mut sm">item${g[a].length==1?'':'s'}</span></div><div class="stn">${ST.map(s=>`<span class="pill ${s=='ok'?'ok':s=='urgent'?'warn bz-urgent':'warn'}">${c[s]} ${esc(LBL[s].toLowerCase())}</span>`).join(' ')}</div></div>`}).join('');
 const nd=f.filter(pend).sort((a,b)=>ts(b)-ts(a));
 const ag={};f.forEach(x=>{(ag[agent(x)]=ag[agent(x)]||[]).push(x)});
 const act=Object.keys(ag).sort().map(a=>`<h3 style="margin:14px 0 4px">${esc(a)}</h3>${ag[a].sort((p,q)=>ts(q)-ts(p)).slice(0,5).map(x=>row(x,false)).join('')}`).join('');
 return head+filters+(f.length?`<div class="card"><h2>1 · Overview by area</h2><div class="stgrid">${ov}</div></div>
 <div class="card"><h2>2 · Needs your decision (${nd.length})</h2>${nd.length?nd.map(x=>row(x,true)).join(''):'<div class="empty">Nothing is waiting for your decision.</div>'}</div>
 <div class="card"><h2>3 · Recent activity by agent</h2>${act}</div>`:'<div class="card"><div class="empty">No reports match these filters.</div></div>');}
W.view('business','Business',view,'overview');
document.addEventListener('change',e=>{if(e.target.id=='rep-area'){S.repArea=e.target.value;W.render()}if(e.target.id=='rep-status'){S.repStatus=e.target.value;W.render()}});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-rep-res]');if(!b)return;const id=b.dataset.id,res=b.dataset.repRes;if(S.repBusy[id])return;
 S.repBusy[id]=1;W.render();
 try{await api('/reports/'+encodeURIComponent(id)+'/resolve',{method:'POST',body:JSON.stringify({resolution:res})});
  const x=S.rep.find(y=>String(y.id)==id);if(x){x.resolution=res;x.resolved_at=new Date().toISOString()}
  toast(res=='approved'?'Approved. Decision recorded; nothing was sent.':'Dismissed. Decision recorded; nothing was sent.')}
 catch(er){toast('Not recorded: the server returned '+(er.status||'no response')+(er.status==400||er.status==422?' (it rejected the request format).':'.'))}
 delete S.repBusy[id];W.render()});
})();
