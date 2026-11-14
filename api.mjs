import { getStore } from "@netlify/blobs";
import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";

const store = getStore("alfa-sessions");
const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  body: JSON.stringify(body)
});
const token = () => randomBytes(24).toString("hex");
const clean = v => typeof v === "string" ? v.trim().slice(0, 120) : "";
const same = (a,b) => {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  try { return timingSafeEqual(Buffer.from(a), Buffer.from(b)); } catch { return false; }
};

export default async (req) => {
  if (req.method !== "POST") return json(405, {error:"POST only"});
  let data;
  try { data = await req.json(); } catch { return json(400,{error:"Invalid JSON"}); }
  const action = clean(data.action);

  if (action === "create") {
    let code;
    for (let i=0; i<8; i++) {
      code = String(randomInt(100000,999999));
      if (!(await store.get(code))) break;
    }
    const ownerToken = token();
    const now = Date.now();
    await store.setJSON(code, { code, ownerToken, participantToken:null, createdAt:now, expiresAt:now+6*60*60*1000, location:null, lastSeen:null, consent:false });
    return json(200,{code,ownerToken,expiresAt:now+6*60*60*1000});
  }

  const code = clean(data.code);
  if (!/^\d{6}$/.test(code)) return json(400,{error:"Kode sesi harus 6 angka."});
  const session = await store.get(code,{type:"json"});
  if (!session || session.expiresAt < Date.now()) {
    if(session) await store.delete(code);
    return json(404,{error:"Sesi tidak ditemukan atau sudah kedaluwarsa."});
  }

  if (action === "join") {
    if (session.participantToken) return json(409,{error:"Sesi sudah memiliki perangkat peserta."});
    const participantToken = token();
    session.participantToken = participantToken;
    session.consent = true;
    session.lastSeen = Date.now();
    await store.setJSON(code,session);
    return json(200,{participantToken,expiresAt:session.expiresAt});
  }

  if (action === "location") {
    if (!same(clean(data.participantToken),session.participantToken)) return json(403,{error:"Token peserta tidak valid."});
    const lat = Number(data.latitude), lon = Number(data.longitude), accuracy = Number(data.accuracy);
    if (!Number.isFinite(lat)||!Number.isFinite(lon)||lat < -90||lat > 90||lon < -180||lon > 180) return json(400,{error:"Koordinat tidak valid."});
    session.location = {latitude:lat,longitude:lon,accuracy:Number.isFinite(accuracy)?Math.max(0,accuracy):null,updatedAt:Date.now()};
    session.lastSeen = Date.now();
    await store.setJSON(code,session);
    return json(200,{ok:true});
  }

  if (action === "heartbeat") {
    if (!same(clean(data.participantToken),session.participantToken)) return json(403,{error:"Token peserta tidak valid."});
    session.lastSeen=Date.now();
    await store.setJSON(code,session);
    return json(200,{ok:true});
  }

  if (action === "get") {
    if (!same(clean(data.ownerToken),session.ownerToken)) return json(403,{error:"Token pemilik tidak valid."});
    return json(200,{code:session.code,consent:!!session.consent,lastSeen:session.lastSeen,location:session.location,expiresAt:session.expiresAt});
  }

  if (action === "end") {
    if (!same(clean(data.ownerToken),session.ownerToken)) return json(403,{error:"Token pemilik tidak valid."});
    await store.delete(code);
    return json(200,{ok:true});
  }
  return json(400,{error:"Action tidak dikenal."});
};
