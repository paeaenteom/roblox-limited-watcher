// /api/asset?id=154415221 — economy v2 assets details

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const id = req.query.id;
  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).json({ error: 'id (numeric) required' });
  }

  const endpoints = [
    `https://economy.roproxy.com/v2/assets/${id}/details`,
    `https://economy.roblox.com/v2/assets/${id}/details`
  ];

  const errors = [];
  for (const url of endpoints) {
    try {
      const r = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': UA,
          'Referer': 'https://www.roblox.com/'
        }
      });
      if (r.ok) {
        return res.status(200).json(await r.json());
      }
      errors.push({ url, status: r.status });
      console.warn(`[asset] ${url} -> ${r.status}`);
    } catch (e) {
      errors.push({ url, error: e.message });
    }
  }

  return res.status(502).json({ error: 'All asset endpoints failed', attempts: errors });
}
