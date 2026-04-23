// /api/thumbnail?id=154415221 — Roblox thumbnails

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const id = req.query.id;
  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).json({ error: 'id (numeric) required' });
  }

  const path = `/v1/assets?assetIds=${id}&size=420x420&format=Png&isCircular=false`;
  const endpoints = [
    `https://thumbnails.roproxy.com${path}`,
    `https://thumbnails.roblox.com${path}`
  ];

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
      console.warn(`[thumbnail] ${url} -> ${r.status}`);
    } catch (e) {
      console.warn(`[thumbnail] ${url} -> ${e.message}`);
    }
  }

  return res.status(502).json({ error: 'All thumbnail endpoints failed' });
}
