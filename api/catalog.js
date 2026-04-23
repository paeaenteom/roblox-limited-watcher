// /api/catalog?id=154415221 — lowestPrice 조회
// 데이터센터 IP에서 공식 API가 403 주는 걸 우회하기 위해 RoProxy 먼저 시도

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const ENDPOINTS = [
  'https://catalog.roproxy.com/v1/catalog/items/details',
  'https://catalog.roblox.com/v1/catalog/items/details'
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const id = req.query.id;
  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).json({ error: 'id (numeric) required' });
  }

  const body = JSON.stringify({
    items: [{ itemType: 'Asset', id: parseInt(id, 10) }]
  });

  const errors = [];
  for (const url of ENDPOINTS) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': UA,
          'Referer': 'https://www.roblox.com/',
          'Origin': 'https://www.roblox.com'
        },
        body
      });
      if (r.ok) {
        const data = await r.json();
        return res.status(200).json(data?.data?.[0] || null);
      }
      const text = await r.text().catch(() => '');
      errors.push({ url, status: r.status, body: text.slice(0, 150) });
      console.warn(`[catalog] ${url} -> ${r.status}`);
    } catch (e) {
      errors.push({ url, error: e.message });
      console.warn(`[catalog] ${url} -> exception: ${e.message}`);
    }
  }

  return res.status(502).json({ error: 'All catalog endpoints failed', attempts: errors });
}
