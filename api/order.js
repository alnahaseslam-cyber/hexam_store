const L = require('./_lib');
const s = (v, n) => typeof v === 'string' && v.length <= n;
const PH = /^01[0125]\d{8}$/;
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const o = req.body || {}, items = Array.isArray(o.items) ? o.items : [];
    const okItems = items.length > 0 && items.length <= 30 && items.every(i => s(i.name, 120) && s(i.size, 10) && Number.isInteger(i.qty) && i.qty > 0 && i.qty <= 50 && Number(i.price) > 0 && Number(i.price) < 100000);
    if (!(s(o.code, 20) && s(o.name, 100) && PH.test(o.phone) && (!o.phone2 || PH.test(o.phone2)) && s(o.address, 500) && s(o.note || '', 500) && okItems))
      return res.status(400).json({ error: 'invalid' });
    if (await L.limit('rl:order:' + L.ip(req), 15, 3600)) return res.status(429).json({ error: 'many' });
    const clean = items.map(i => ({ name: i.name.trim(), size: i.size, qty: i.qty, price: Number(i.price) }));
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const order = { id, code: o.code, name: o.name.trim(), phone: o.phone, phone2: o.phone2 || '', address: o.address.trim(), note: (o.note || '').trim(),
      items: clean, total: clean.reduce((a, i) => a + i.qty * i.price, 0), status: 'new', createdAt: Date.now() };
    await L.redis('HSET', 'orders', id, JSON.stringify(order));
    res.json({ ok: true, id });
  } catch (e) { L.fail(res, e); }
};
