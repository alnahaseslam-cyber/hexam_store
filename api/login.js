const L = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  
  try {
    // حماية من محاولات التخمين المستمرة
    if (await L.limit('rl:login:' + L.ip(req), 10, 300)) {
      return res.status(429).json({ error: 'many' });
    }

    const { user, pass } = req.body || {};
    
    // التحقق من وجود الحساب وصحة الباسورد
    if (user && pass && L.has(user) && L.safeEq(pass, L.ACCOUNTS[user])) {
      const token = L.makeToken(user);
      return res.json({ token, user });
    }
    
    return res.status(401).json({ error: 'auth' });
  } catch (e) {
    L.fail(res, e);
  }
};