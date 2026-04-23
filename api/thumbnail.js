// /api/thumbnail?id=154415221 — Roblox thumbnails proxy
// 1시간 edge cache (썸네일은 거의 안 바뀜)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const id = req.query.id;
  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).json({ error: 'id (numeric) required' });
  }

  try {
    const r = await fetch(
      `https://thumbnails.roblox.com/v1/assets?assetIds=${id}&size=420x420&format=Png&isCircular=false`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; TOKU-Watcher/2.1)'
        }
      }
    );
    if (!r.ok) {
      return res.status(r.status).json({ error: `Thumbnail returned ${r.status}` });
    }
    return res.status(200).json(await r.json());
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
