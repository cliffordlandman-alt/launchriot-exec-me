// Companies: per-company view fed by clifford-api GET /companies and GET /properties; Website go-live from GET /golive. Read-only; all text is untrusted and escaped. No data in this file.
(function(){'use strict';const W=window.WN,{S,api,esc}=W;
S.co=[];S.coState='idle';S.props=[];S.propState='idle';S.gl=null;
const L=(r,k)=>Array.isArray(r)?r:(r&&Array.isArray(r[k])?r[k]:[]);
const obj=x=>x&&typeof x=='object';
W.onLoad(async()=>{
 try{S.co=L(await api('/companies'),'companies').filter(obj);S.coState='ok'}catch(e){if(e.status==401)throw e;S.co=[];S.coState='none'}
 try{S.props=L(await api('/properties'),'properties').filter(obj);S.propState='ok'}catch(e){if(e.status==401)throw e;S.props=[];S.propState='none'}
 try{const r=await api('/golive');S.gl=obj(r)&&!Array.isArray(r)?r:null}catch(e){if(e.status==401)throw e;S.gl=null}});
const num=v=>{if(v===''||v==null||typeof v=='boolean')return null;const n=Number(v);return isFinite(n)?n:null};
const pct=v=>{const n=num(v);return n==null?null:Math.max(0,Math.min(100,Math.round(n)))};
const upd=v=>v&&!isNaN(new Date(v))?'Updated '+W.dl(v)+' (Dubai)':'';
const NR='<span class="mut">Not yet reported</span>';
const bar=(p,lbl)=>`<div class="hbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-label="${esc(lbl)}"><i style="width:${p}%"></i></div>`;
const key=s=>String(s||'').toLowerCase().replace(/[^a-z]/g,'');
function client(c){const p=pct(c.percent);return `<div class="item"><div class="t">${esc(c.name||'(unnamed)')}${c.stage?` <span class="pill">${esc(c.stage)}</span>`:''}</div>${p==null?`<div class="mut sm">Progress: Not yet reported</div>`:`${bar(p,'Progress for '+(c.name||'client'))}<div class="mut sm">${p}% done</div>`}${c.note?`<div class="why">${esc(c.note)}</div>`:''}</div>`}
function product(name,p){const cl=p&&Array.isArray(p.clients)?p.clients.filter(obj):[];return `<h3 style="margin:14px 0 6px">${esc(name)}</h3>${cl.length?cl.map(client).join(''):`<div class="empty">${NR}</div>`}`}
const FIX=[['For Executives','executives'],['For Electrician companies','electriciancompanies'],['For Holiday home companies','holidayhomecompanies']];
function launchriot(){const c=S.co.find(x=>key(x.name)=='launchriot'),P=c&&Array.isArray(c.products)?c.products.filter(obj):[],used=new Set();
 let h=FIX.map(([n,k])=>{const p=P.find(x=>{const q=key(x.name);return q==k||q==key(n)||(q.includes(k.slice(0,6)))});if(p)used.add(p);return product(n,p)}).join('');
 const ex=P.filter(x=>!used.has(x));
 h+=`<h3 style="margin:14px 0 6px">More</h3>${ex.length?ex.map(p=>product(p.name||'(unnamed product)',p)).join(''):`<div class="empty">${NR}</div>`}`;
 return `<div class="card"><h2>LaunchRiot</h2>${S.coState=='ok'&&c?'':`<p class="mut sm" style="margin:0">${NR}</p>`}${h}</div>`}
const money=(v,cur)=>{const n=num(v);return n==null?NR:`<b>${esc(Math.round(n).toLocaleString('en-US'))}${cur?' '+esc(cur):''}</b>`};
function yalla(){const c=S.co.find(x=>key(x.name)=='yallagroup'),P=S.props;
 let tot='';
 if(P.length&&P.every(p=>num(p.revenue_month)!=null)&&P.every(p=>num(p.revenue_total)!=null)){const cs=[...new Set(P.map(p=>p.currency||''))];if(cs.length==1){const sm=k=>P.reduce((a,p)=>a+num(p[k]),0);tot=`<div class="item"><div class="t">All properties</div><div class="mut sm">This month: ${money(sm('revenue_month'),cs[0])} · Total: ${money(sm('revenue_total'),cs[0])}</div></div>`}}
 const rows=P.length?P.map(p=>`<div class="item"><div class="t">${esc(p.name||'(unnamed property)')}${p.location?` <span class="mut sm">· ${esc(p.location)}</span>`:''}</div><div class="mut sm">This month: ${money(p.revenue_month,p.currency)} · Total: ${money(p.revenue_total,p.currency)}</div>${upd(p.updated_at)?`<div class="mut sm">${esc(upd(p.updated_at))}</div>`:''}</div>`).join('')+tot:`<div class="empty">${NR}</div>`;
 const P2=c&&Array.isArray(c.products)?c.products.filter(obj):[];
 return `<div class="card"><h2>Yalla Group</h2><h3 style="margin:6px 0">Properties</h3>${rows}${P2.map(p=>product(p.name||'(unnamed product)',p)).join('')}</div>`}
function view(){return `<h1>Companies</h1><p class="sub">By company. Read-only; figures are set by Chief.</p>${S.authed?'':W.needAuth()}${S.authed&&S.err?`<div class="notice">${esc(S.err)}</div>`:''}${S.authed?yalla()+launchriot():''}`}
W.view('companies','Companies',view,'overview');
// Home helpers (used by home.js)
W.homeCompanies=function(){const c=S.co.filter(x=>key(x.name)=='launchriot'||key(x.name)=='yallagroup'),n=c.reduce((a,x)=>a+(Array.isArray(x.products)?x.products.reduce((b,p)=>b+(Array.isArray(p.clients)?p.clients.length:0),0):0),0);
 if(!n&&!S.props.length)return '';return `<p style="margin:0 0 14px"><a href="#/companies">Companies: Yalla Group and LaunchRiot${n?' · '+n+' client'+(n==1?'':'s')+' tracked':''}</a></p>`};
W.homeGoLive=function(){const g=S.gl,p=g?pct(g.percent):null,cl=g&&Array.isArray(g.checklist)?g.checklist.filter(x=>obj(x)&&String(x.item||'').trim()):[];
 if(p==null&&!cl.length)return '';
 return `<div class="card"><h2>Website go-live</h2>${p!=null?bar(p,'Website go-live progress')+`<p style="margin:6px 0 10px"><b>${p}%</b> done</p>`:''}${cl.length?`<ul style="list-style:none;margin:0;padding:0">${cl.map(x=>`<li style="margin:3px 0"><span aria-hidden="true">${x.done===true||x.done===1||x.done==='true'?'✓':'○'}</span> <span class="sr" style="position:absolute;left:-999px">${x.done?'Done':'Not done'}:</span>${esc(x.item)}</li>`).join('')}</ul>`:''}${g.note?`<p class="mut sm" style="margin:8px 0 0">${esc(g.note)}</p>`:''}${upd(g.updated_at)?`<p class="mut sm" style="margin:8px 0 0">${esc(upd(g.updated_at))}</p>`:''}</div>`};
})();
