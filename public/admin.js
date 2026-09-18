const ORDER=[['A01','BenQ'],['A02','RingConn'],['A03','HOVERAir'],['A04','IE3'],['A05','OWC'],['A06','TORRAS'],['A07','LG'],['A08','Melt Interface'],['A09','XREAL']];
const $=id=>document.getElementById(id);
async function load(){
  $('booths').innerHTML='<div class="row">読み込み中...</div>';
  try{
    const r=await fetch('/api/admin/summary',{cache:'no-store'});
    if(!r.ok) throw new Error(await r.text());
    const x=await r.json();
    $('participants').textContent=x.participants;
    $('completed').textContent=x.completed;
    $('exchanged').textContent=x.exchanged;
    const m=Object.fromEntries((x.booths||[]).map(b=>[b.booth_id,Number(b.visitors||0)]));
    $('booths').innerHTML=ORDER.map(([id,name])=>`<div class="row"><b>${name}</b><strong>${m[id]||0}人</strong></div>`).join('');
    $('updated').textContent='最終更新：'+new Date().toLocaleString('ja-JP');
  }catch(e){
    console.error(e);
    $('booths').innerHTML='<div class="row error">集計データを取得できませんでした</div>';
  }
}
$('refresh').onclick=load;
load();
setInterval(load,30000);
