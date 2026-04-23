// /api/rolimons — Rolimon's itemdetails proxy

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const r = await fetch('https://www.rolimons.com/itemapi/itemdetails', {
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.rolimons.com/'
      }
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('[rolimons] upstream error', r.status, text.slice(0, 200));
      return res.status(502).json({ error: `Rolimons returned ${r.status}`, body: text.slice(0, 200) });
    }
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    console.error('[rolimons] exception', e.message);
    return res.status(500).json({ error: e.message });
  }
}
