// /api/catalog?id=154415221 — Roblox catalog/items/details proxy
// lowestPrice(리셀러 최저가) 실시간 조회용

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  // 15초 edge cache (실시간이지만 과도한 호출 방지)
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const id = req.query.id;
  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).json({ error: 'id (numeric) required' });
  }

  try {
    const r = await fetch('https://catalog.roblox.com/v1/catalog/items/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; TOKU-Watcher/2.1)'
      },
      body: JSON.stringify({
        items: [{ itemType: 'Asset', id: parseInt(id, 10) }]
      })
    });
    if (!r.ok) {
      return res.status(r.status).json({ error: `Catalog returned ${r.status}` });
    }
    const data = await r.json();
    return res.status(200).json(data?.data?.[0] || null);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
