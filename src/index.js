const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:JSON_HEADERS});
const validParticipant=v=>typeof v==='string'&&/^MF-[A-Z0-9-]{6,40}$/.test(v);
const validBooth=v=>/^A0[1-9]$/.test(v||'');
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/api/state'&&request.method==='GET'){
   const pid=url.searchParams.get('participant_id'); if(!validParticipant(pid))return json({error:'invalid participant'},400);
   const rows=await env.DB.prepare('SELECT booth_id FROM stamps WHERE participant_id=? ORDER BY id').bind(pid).all();
   const prize=await env.DB.prepare('SELECT exchanged_at FROM prizes WHERE participant_id=? LIMIT 1').bind(pid).first();
   return json({stamps:rows.results.map(r=>r.booth_id),exchanged:!!prize,exchanged_at:prize?.exchanged_at||''});
  }
  if(url.pathname==='/api/stamp'&&request.method==='POST'){
   const b=await request.json(); if(!validParticipant(b.participant_id)||!validBooth(b.booth_id)||typeof b.booth_name!=='string')return json({error:'invalid data'},400);
   const now=new Date().toISOString();
   await env.DB.prepare('INSERT OR IGNORE INTO stamps(participant_id,booth_id,booth_name,stamped_at) VALUES(?,?,?,?)').bind(b.participant_id,b.booth_id,b.booth_name.slice(0,80),now).run();
   const rows=await env.DB.prepare('SELECT booth_id FROM stamps WHERE participant_id=? ORDER BY id').bind(b.participant_id).all();
   return json({ok:true,stamps:rows.results.map(r=>r.booth_id)});
  }
  if(url.pathname==='/api/exchange'&&request.method==='POST'){
   const b=await request.json(); const pid=b.participant_id; if(!validParticipant(pid))return json({error:'invalid participant'},400);
   const c=await env.DB.prepare('SELECT COUNT(DISTINCT booth_id) AS n FROM stamps WHERE participant_id=?').bind(pid).first();
   if(Number(c?.n||0)<9)return json({error:'not complete'},409);
   const now=new Date().toISOString();
   await env.DB.prepare('INSERT OR IGNORE INTO prizes(participant_id,exchanged_at) VALUES(?,?)').bind(pid,now).run();
   const prize=await env.DB.prepare('SELECT exchanged_at FROM prizes WHERE participant_id=?').bind(pid).first();
   return json({ok:true,exchanged:true,exchanged_at:prize.exchanged_at});
  }
  if(url.pathname==='/api/admin/summary'&&request.method==='GET'){
   const total=await env.DB.prepare('SELECT COUNT(DISTINCT participant_id) AS n FROM stamps').first();
   const booths=await env.DB.prepare('SELECT booth_id,booth_name,COUNT(DISTINCT participant_id) AS visitors FROM stamps GROUP BY booth_id,booth_name ORDER BY booth_id').all();
   const completed=await env.DB.prepare('SELECT COUNT(*) AS n FROM (SELECT participant_id FROM stamps GROUP BY participant_id HAVING COUNT(DISTINCT booth_id)=9)').first();
   const exchanged=await env.DB.prepare('SELECT COUNT(*) AS n FROM prizes').first();
   return json({participants:Number(total?.n||0),booths:booths.results,completed:Number(completed?.n||0),exchanged:Number(exchanged?.n||0)});
  }
  return env.ASSETS.fetch(request);
 }
};
