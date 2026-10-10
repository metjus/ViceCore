import {categories,risks} from './safety.mjs';
const json=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
class Fail extends Error{constructor(message,status=400){super(message);this.status=status}}
const str=(v,min,max,label)=>{if(typeof v!=='string'||v.trim().length<min||v.trim().length>max)throw new Fail(label);return v.trim()};
export async function marketApi(request,{db,bucket,userId}){
 const u=new URL(request.url),parts=u.pathname.replace(/^\/api\//,'').split('/'),[kind,id]=parts,method=request.method,now=Date.now();
 const all=async(sql,...args)=>(await db.prepare(sql).bind(...args).all()).results;
 const one=async(sql,...args)=>await db.prepare(sql).bind(...args).first();
 const run=async(sql,...args)=>await db.prepare(sql).bind(...args).run();
 const auth=()=>{if(!userId)throw new Fail('Najprv sa prihlás.',401);return userId};
 const body=async()=>{if(Number(request.headers.get('content-length')||0)>16000)throw new Fail('Požiadavka je príliš veľká.',413);const t=await request.text();if(t.length>16000)throw new Fail('Požiadavka je príliš veľká.',413);try{return JSON.parse(t)}catch{throw new Fail('Neplatné údaje.')}};
 const conversation=async()=>{auth();const c=await one('SELECT * FROM conversations WHERE id=?',id);if(!c||![c.buyer,c.seller].includes(userId))throw new Fail('Rozhovor nie je dostupný.',404);return c};
 const blocked=async(a,b)=>!!await one('SELECT id FROM blocks WHERE (owner=? AND target=?) OR (owner=? AND target=?)',a,b,b,a);
 try{
 if(method!=='GET'&&method!=='HEAD'){const origin=request.headers.get('origin');if(origin&&origin!==u.origin)throw new Fail('Neplatný pôvod požiadavky.',403)}
 if(kind==='state'&&method==='GET'){
 const listing=await all("SELECT l.*,p.name AS seller_name,p.created AS member_since FROM listings l JOIN profiles p ON p.id=l.owner WHERE l.status='active' ORDER BY l.created DESC LIMIT 200");
 const me=userId?await one('SELECT * FROM profiles WHERE id=?',userId):null;
 const chats=userId?await all('SELECT c.*,l.title,l.image,p.name AS partner FROM conversations c JOIN listings l ON l.id=c.listing JOIN profiles p ON p.id=CASE WHEN c.buyer=? THEN c.seller ELSE c.buyer END WHERE c.buyer=? OR c.seller=? ORDER BY c.created DESC',userId,userId,userId):[];
 return json({userId:userId||null,profile:me,listings:listing,conversations:chats,saved:userId?(await all('SELECT listing FROM saved WHERE owner=?',userId)).map(x=>x.listing):[],mine:userId?await all('SELECT * FROM listings WHERE owner=? ORDER BY created DESC',userId):[]});
 }
 if(kind==='profile'&&method==='PUT'){
 auth();const b=await body(),name=str(b.name,2,40,'Meno má mať 2 až 40 znakov.'),city=str(b.city,2,60,'Vyplň mesto.'),phone=typeof b.phone==='string'?b.phone.trim():'';
 if(phone&&(!/^[+\d\s()-]{7,24}$/.test(phone)))throw new Fail('Skontroluj telefónne číslo.');
 if(b.showPhone&&!phone)throw new Fail('Najprv vyplň telefón.');
 await run('INSERT INTO profiles(id,name,city,phone,show_phone,created) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,city=excluded.city,phone=excluded.phone,show_phone=excluded.show_phone',userId,name,city,phone,b.showPhone?1:0,now);return json({ok:true});
 }
 if(kind==='listing'&&method==='POST'){
 auth();if(!await one('SELECT id FROM profiles WHERE id=?',userId))throw new Fail('Najprv vyplň profil.');
 if((await one('SELECT COUNT(*) AS n FROM listings WHERE owner=? AND created>?',userId,now-86400000)).n>=15)throw new Fail('Denný limit je 15 nových inzerátov.',429);
 const b=await body(),title=str(b.title,4,100,'Názov má mať 4 až 100 znakov.'),description=str(b.description,20,4000,'Popis má mať 20 až 4 000 znakov.'),city=str(b.city,2,60,'Vyplň mesto.');
 if(!categories.includes(b.category)||!['Ako nové','Používané','Nové','Na diely'].includes(b.condition))throw new Fail('Vyber kategóriu a stav.');
 const price=Number(b.price);if(!Number.isFinite(price)||price<0||price>1000000)throw new Fail('Skontroluj cenu.');
 const image=b.image||'';if(image&&!await one('SELECT id FROM images WHERE id=? AND owner=?',image,userId))throw new Fail('Fotografia nepatrí tvojmu účtu.');
 const nid=crypto.randomUUID();await run('INSERT INTO listings(id,owner,title,description,category,price,city,condition,image,status,created) VALUES(?,?,?,?,?,?,?,?,?,?,?)',nid,userId,title,description,b.category,Math.round(price*100),city,b.condition,image,'active',now);return json({id:nid},201);
 }
 if(kind==='listing'&&method==='PATCH'){
 auth();const b=await body();if(!['active','sold'].includes(b.status))throw new Fail('Neplatný stav.');if(!await one('SELECT id FROM listings WHERE id=? AND owner=?',id,userId))throw new Fail('Inzerát nie je dostupný.',404);await run('UPDATE listings SET status=? WHERE id=? AND owner=?',b.status,id,userId);return json({ok:true});
 }
 if(kind==='phone'&&method==='GET'){
 auth();const l=await one("SELECT l.owner,p.phone,p.show_phone FROM listings l JOIN profiles p ON p.id=l.owner WHERE l.id=? AND l.status='active'",id);if(!l||!l.show_phone||await blocked(userId,l.owner))throw new Fail('Predajca telefón nesprístupnil.',404);return json({phone:l.phone});
 }
 if(kind==='conversation'&&method==='POST'){
 auth();if(!await one('SELECT id FROM profiles WHERE id=?',userId))throw new Fail('Najprv vyplň profil.');const b=await body();const l=await one("SELECT * FROM listings WHERE id=? AND status='active'",b.listing);if(!l)throw new Fail('Ponuka už nie je dostupná.',404);if(l.owner===userId)throw new Fail('Toto je tvoj inzerát.');if(await blocked(userId,l.owner))throw new Fail('Komunikácia medzi týmito účtami je zablokovaná.',403);
 const nid=crypto.randomUUID();await run('INSERT INTO conversations(id,listing,buyer,seller,created) VALUES(?,?,?,?,?) ON CONFLICT(listing,buyer) DO NOTHING',nid,l.id,userId,l.owner,now);return json({id:(await one('SELECT id FROM conversations WHERE listing=? AND buyer=?',l.id,userId)).id});
 }
 if(kind==='messages'&&method==='GET'){const c=await conversation();const partner=c.buyer===userId?c.seller:c.buyer;return json({messages:await all('SELECT id,sender,body,created FROM messages WHERE conversation=? ORDER BY created,id LIMIT 500',id),blocked:await blocked(userId,partner)});}
 if(kind==='messages'&&method==='POST'){
 const c=await conversation();if(await blocked(c.buyer,c.seller))throw new Fail('Komunikácia je zablokovaná.',403);
 if((await one('SELECT COUNT(*) AS n FROM messages WHERE sender=? AND created>?',userId,now-60000)).n>=20)throw new Fail('Posielaš príliš veľa správ. Chvíľu počkaj.',429);
 const b=await body(),text=str(b.body,1,2000,'Správa má mať 1 až 2 000 znakov.');await run('INSERT INTO messages(id,conversation,sender,body,created) VALUES(?,?,?,?,?)',crypto.randomUUID(),id,userId,text,now);return json({ok:true,risks:risks(text)},201);
 }
 if(kind==='block'&&method==='POST'){auth();const b=await body();if(!await one('SELECT id FROM conversations WHERE (buyer=? AND seller=?) OR (seller=? AND buyer=?)',userId,b.target,userId,b.target))throw new Fail('Účet nie je dostupný.',404);await run('INSERT INTO blocks(id,owner,target,created) VALUES(?,?,?,?) ON CONFLICT(owner,target) DO NOTHING',crypto.randomUUID(),userId,b.target,now);return json({ok:true});}
 if(kind==='block'&&method==='DELETE'){auth();await run('DELETE FROM blocks WHERE owner=? AND target=?',userId,id);return json({ok:true});}
 if(kind==='report'&&method==='POST'){
 auth();const b=await body();if(!['listing','message'].includes(b.type))throw new Fail('Neplatný typ hlásenia.');
 if(b.type==='listing'){if(!await one('SELECT id FROM listings WHERE id=?',b.target))throw new Fail('Inzerát nie je dostupný.',404)}else{const m=await one('SELECT c.buyer,c.seller FROM messages m JOIN conversations c ON c.id=m.conversation WHERE m.id=?',b.target);if(!m||![m.buyer,m.seller].includes(userId))throw new Fail('Správa nie je dostupná.',404)}
 if((await one('SELECT COUNT(*) AS n FROM reports WHERE reporter=? AND created>?',userId,now-86400000)).n>=20)throw new Fail('Denný limit hlásení bol dosiahnutý.',429);
 const reason=str(b.reason,3,80,'Vyber dôvod.'),detail=typeof b.detail==='string'?b.detail.trim().slice(0,2000):'';await run('INSERT INTO reports(id,reporter,target_type,target,reason,detail,created) VALUES(?,?,?,?,?,?,?)',crypto.randomUUID(),userId,b.type,b.target,reason,detail,now);return json({ok:true},201);
 }
 if(kind==='saved'&&method==='POST'){auth();if(!await one('SELECT id FROM listings WHERE id=?',id))throw new Fail('Ponuka nie je dostupná.',404);await run('INSERT INTO saved(id,owner,listing) VALUES(?,?,?) ON CONFLICT(owner,listing) DO NOTHING',crypto.randomUUID(),userId,id);return json({ok:true});}
 if(kind==='saved'&&method==='DELETE'){auth();await run('DELETE FROM saved WHERE owner=? AND listing=?',userId,id);return json({ok:true});}
 if(kind==='image'&&method==='POST'){
 auth();if(!bucket)throw new Fail('Úložisko fotografií nie je dostupné.',503);if(Number(request.headers.get('content-length')||0)>5000000)throw new Fail('Fotografia môže mať najviac 5 MB.',413);
 const bytes=new Uint8Array(await request.arrayBuffer());if(bytes.length>5000000||bytes.length<12)throw new Fail('Fotografia môže mať najviac 5 MB.',413);
 let mime='';if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)mime='image/jpeg';else if([137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))mime='image/png';else if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP')mime='image/webp';else throw new Fail('Použi JPG, PNG alebo WebP.');
 if((await one('SELECT COUNT(*) AS n FROM images WHERE owner=? AND created>?',userId,now-86400000)).n>=30)throw new Fail('Denný limit fotografií bol dosiahnutý.',429);
 const nid=crypto.randomUUID();await bucket.put(nid,bytes,{httpMetadata:{contentType:mime}});await run('INSERT INTO images(id,owner,mime,created) VALUES(?,?,?,?)',nid,userId,mime,now);return json({id:nid},201);
 }
 if(kind==='image'&&method==='GET'){if(!/^[a-f0-9-]{36}$/.test(id||''))throw new Fail('Fotografia nie je dostupná.',404);if(!await one('SELECT id FROM listings WHERE image=?',id)&&!await one('SELECT id FROM images WHERE id=? AND owner=?',id,userId||''))throw new Fail('Fotografia nie je dostupná.',404);const obj=await bucket?.get(id);if(!obj)throw new Fail('Fotografia nie je dostupná.',404);return new Response(obj.body,{headers:{'Content-Type':obj.httpMetadata.contentType,'X-Content-Type-Options':'nosniff','Cache-Control':'private, max-age=3600'}});}
 return json({error:'Stránka neexistuje.'},404);
 }catch(e){if(e instanceof Fail)return json({error:e.message},e.status);console.error('Market API error',kind,method);return json({error:'Akciu sa nepodarilo dokončiť. Skús to znova.'},500)}
}
