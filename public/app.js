const BOOTHS=[
{id:'A01',name:'BenQ',logo:'benq.jpg'},
{id:'A02',name:'RingConn',logo:'ringconn.png'},
{id:'A03',name:'HOVERAir',logo:'hoverair.png'},
{id:'A04',name:'IE3',logo:'ie3.png'},
{id:'A05',name:'OWC',logo:'owc.jpg'},
{id:'A06',name:'TORRAS',logo:'torras.jpg'},
{id:'A07',name:'LG',logo:'lg.png'},
{id:'A08',name:'Melt Interface',logo:'melt.png'},
{id:'A09',name:'XREAL',logo:'xreal.png'}
];
const K='mff_'; const $=x=>document.getElementById(x);
let pid=localStorage.getItem(K+'participant')||('MF-'+crypto.randomUUID().slice(0,8).toUpperCase());
localStorage.setItem(K+'participant',pid);
let stamps=[]; let exchanged=false; let exchangedAt='';
function toast(s){$('toast').textContent=s;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',1800)}
async function api(path, options={}) { const r=await fetch('/api/'+path,{headers:{'content-type':'application/json'},...options}); if(!r.ok) throw new Error(await r.text()); return r.json(); }
async function sync(){
 try{const x=await api('state?participant_id='+encodeURIComponent(pid));stamps=x.stamps||[];exchanged=!!x.exchanged;exchangedAt=x.exchanged_at||'';render();}
 catch(e){console.error(e); stamps=JSON.parse(localStorage.getItem(K+'stamps')||'[]'); render();}
}
async function add(id){
 const b=BOOTHS.find(x=>x.id===id); if(!b)return;
 if(stamps.includes(id)){toast(b.name+'は取得済みです ✓');return;}
 try{const x=await api('stamp',{method:'POST',body:JSON.stringify({participant_id:pid,booth_id:b.id,booth_name:b.name})});stamps=x.stamps;localStorage.setItem(K+'stamps',JSON.stringify(stamps));render();toast('STAMP GET! '+b.name);}
 catch(e){console.error(e);toast('通信エラーです。電波状況を確認して再度QRを読み取ってください。');}
}
function render(){
 $('pid').textContent=pid; $('count').textContent=stamps.length+' / 9';
 $('stamps').innerHTML=BOOTHS.map(b=>`<div class="stamp ${stamps.includes(b.id)?'got':''}"><img src="${b.logo}" alt="${b.name}">${stamps.includes(b.id)?'<span class="check">✓</span>':''}</div>`).join('');
 if(exchanged)$('status').innerHTML='<b class="done">✓ 景品交換済み</b><br><small>交換日時：'+exchangedAt+'</small>';
 else if(stamps.length===9)$('status').innerHTML='<b>🎉 9ブース COMPLETE!</b><br><small>受付でこの画面をスタッフに見せてください。</small><br><a class="exchange-link" href="/staff.html?id='+encodeURIComponent(pid)+'">景品交換用画面を表示</a>';
 else $('status').innerHTML='<b>あと '+(9-stamps.length)+' ブース！</b><br><small>全9ブースのQRを読み込むと景品交換できます。</small>';
}
render(); sync();
const spot=new URLSearchParams(location.search).get('spot'); if(spot)setTimeout(()=>add(spot.toUpperCase()),350);
