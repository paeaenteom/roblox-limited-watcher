// /api/asset?id=154415221 — Roblox economy v2 assets details proxy
// IsLimited / IsForSale / PriceInRobux 등 기본 정보

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const id = req.query.id;
  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).json({ error: 'id (numeric) required' });
  }

  try {
    const r = await fetch(`https://economy.roblox.com/v2/assets/${id}/details`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; TOKU-Watcher/2.1)'
      }
    });
    if (!r.ok) {
      return res.status(r.status).json({ error: `Asset returned ${r.status}` });
    }
    return res.status(200).json(await r.json());
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
