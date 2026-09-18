const BOOTHS=Array.from({length:9},(_,i)=>({id:`A0${i+1}`,name:`ブース${String.fromCharCode(65+i)}`}));
const key='mff_'; const $=id=>document.getElementById(id);
let pid=localStorage.getItem(key+'participant')||('MF-'+Math.random().toString(36).slice(2,8).toUpperCase());localStorage.setItem(key+'participant',pid);
let stamps=JSON.parse(localStorage.getItem(key+'stamps')||'[]');let exchange=JSON.parse(localStorage.getItem(key+'exchange')||'null');
function toast(s){$('toast').textContent=s;$('toast').style.display='block';setTimeout(()=>$('toast').style.display='none',1800)}
function save(){localStorage.setItem(key+'stamps',JSON.stringify(stamps))}
function add(id){const b=BOOTHS.find(x=>x.id===id);if(!b)return;if(stamps.includes(id)){toast(`${b.name}は取得済みです ✓`);return}if(exchange){toast('景品交換済みです');return}stamps.push(id);save();render();toast(`STAMP GET! ${b.name}`)}
function render(){$('pid').textContent=pid;$('count').textContent=`${stamps.length} / 9`;$('stamps').innerHTML=BOOTHS.map((b,i)=>`<div class="stamp ${stamps.includes(b.id)?`got c${i+1}`:''}"><span>${stamps.includes(b.id)?'✓':'◎'}</span><small>${b.id}</small></div>`).join('');
$('buttons').innerHTML=BOOTHS.map(b=>`<button onclick="add('${b.id}')">${b.id}<br>${b.name}${stamps.includes(b.id)?' ✓':''}</button>`).join('');
if(exchange)$('status').innerHTML=`<b class="done">✓ 景品交換済み</b><br><small>交換日時：${exchange.at}</small>`;else if(stamps.length===9)$('status').innerHTML='<b>🎉 9ブース COMPLETE!</b><br><small>景品交換所でこの画面を見せてください。</small>';else $('status').innerHTML=`<b>あと ${9-stamps.length} ブース！</b><br><small>全9ブースのQRを読み込むと景品交換できます。</small>`;
$('exchange').disabled=stamps.length!==9||!!exchange;$('exchange').textContent=exchange?'✓ 景品交換済み':stamps.length===9?'景品交換を確定':`あと${9-stamps.length}ブース必要`}
$('exchange').onclick=()=>{if(stamps.length!==9||exchange)return;exchange={at:new Date().toLocaleString('ja-JP')};localStorage.setItem(key+'exchange',JSON.stringify(exchange));render();toast('景品交換を記録しました')};
$('reset').onclick=()=>{['participant','stamps','exchange'].forEach(x=>localStorage.removeItem(key+x));location.href=location.pathname};
const spot=new URLSearchParams(location.search).get('spot');render();if(spot)setTimeout(()=>add(spot.toUpperCase()),250);