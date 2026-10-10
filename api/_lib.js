const crypto = require('crypto');

// ===== الحسابات (على السيرفر بس - الزوار مبيقدروش يشوفوها) =====
// لتغيير باسورد أو إضافة حساب: عدّل هنا وارفع (git push)
const ACCOUNTS = {
  hisham_102hx: 'f2eqQqbT&3hU9#',
  ramzi_907hx: 'UxcP!w6z9!Qwa3',
  islam_872hx: 'j5NE6%&prYsey6',
};

const SECRET = crypto.createHash('sha256').update('hx|' + JSON.stringify(ACCOUNTS)).digest();
// بيدوّر على متغيرات Upstash/Vercel KV مهما كان البريفكس (STORAGE_ / UPSTASH_ / KV_ ...)
const envFind = re => { const k = Object.keys(process.env).find(k => re.test(k) && process.env[k]); return k ? process.env[k] : undefined; };
const DB_URL = envFind(/(KV_REST_API_URL|UPSTASH_REDIS_REST_URL)$/);
const DB_TOK = envFind(/(KV_REST_API_TOKEN|UPSTASH_REDIS_REST_TOKEN)$/);
const fail = (res, e) => res.status(e && e.message === 'no-db' ? 503 : 500).json({ error: e && e.message === 'no-db' ? 'no-db' : String((e && e.message) || 'server').slice(0, 100) });

async function redis(...cmd) {
  if (!DB_URL) throw new Error('no-db');
  const r = await fetch(DB_URL, { method: 'POST', headers: { Authorization: 'Bearer ' + DB_TOK }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
const sign = p => crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
const hash = v => crypto.createHash('sha256').update(String(v)).digest();
const safeEq = (a, b) => crypto.timingSafeEqual(hash(a), hash(b));
const has = u => Object.prototype.hasOwnProperty.call(ACCOUNTS, u);

function makeToken(u) {
  const p = Buffer.from(JSON.stringify({ u, e: Date.now() + 12 * 3600e3 })).toString('base64url');
  return p + '.' + sign(p);
}
function auth(req) {
  const [p, s] = (req.headers.authorization || '').replace('Bearer ', '').split('.');
  if (!p || !s) return null;
  const a = Buffer.from(s), b = Buffer.from(sign(p));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { const d = JSON.parse(Buffer.from(p, 'base64url')); return d.e > Date.now() && has(d.u) ? d.u : null; } catch { return null; }
}
const ip = req => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
async function limit(key, max, sec) {
  try { const n = await redis('INCR', key); if (n === 1) await redis('EXPIRE', key, sec); return n > max; } catch { return false; }
}
module.exports = { fail, ACCOUNTS, has, redis, makeToken, auth, safeEq, ip, limit };
