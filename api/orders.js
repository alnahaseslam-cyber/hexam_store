const L = require('./_lib');
const ST = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];
module.exports = async (req, res) => {
  const me = L.auth(req);
  if (!me) return res.status(401).json({ error: 'auth' });
  try {
    if (req.method === 'GET') {
      const v = await L.redis('HVALS', 'orders');
      return res.json({ orders: (v || []).map(x => JSON.parse(x)).sort((a, b) => b.createdAt - a.createdAt) });
    }
    if (req.method === 'PATCH') {
      const { id, status } = req.body || {};
      if (!ST.includes(status)) return res.status(400).end();
      const raw = await L.redis('HGET', 'orders', String(id));
      if (!raw) return res.status(404).end();
      const o = JSON.parse(raw);
      if (status === 'confirmed' && o.status === 'new') { o.acceptedBy = me; o.acceptedAt = Date.now(); }
      o.status = status;
      await L.redis('HSET', 'orders', o.id, JSON.stringify(o));
      return res.json({ order: o });
    }
    if (req.method === 'DELETE') { await L.redis('HDEL', 'orders', String(req.query.id)); return res.json({ ok: true }); }
    res.status(405).end();
  } catch (e) { L.fail(res, e); }
};
