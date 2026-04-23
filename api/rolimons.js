// /api/rolimons — Rolimon's itemdetails proxy
// Rolimon's는 분당 1회 rate limit이라 Vercel edge cache로 5분 보존

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  // 5분 edge cache, 10분 stale-while-revalidate
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const r = await fetch('https://www.rolimons.com/itemapi/itemdetails', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TOKU-Watcher/2.1)',
        'Accept': 'application/json',
        'Referer': 'https://www.rolimons.com/'
      }
    });
    if (!r.ok) {
      return res.status(r.status).json({ error: `Rolimons returned ${r.status}` });
    }
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
