// /api/diag?id=154415221 — 모든 업스트림 헬스체크
// 브라우저에서 직접 열어서 어떤 API가 살아있는지 바로 확인

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function timedFetch(url, options = {}) {
  const t0 = Date.now();
  try {
    const r = await fetch(url, {
      ...options,
      headers: { 'User-Agent': UA, 'Referer': 'https://www.roblox.com/', ...(options.headers || {}) }
    });
    const ms = Date.now() - t0;
    const ok = r.ok;
    let snippet = '';
    if (!ok) snippet = (await r.text().catch(() => '')).slice(0, 120);
    return { url, status: r.status, ok, ms, snippet };
  } catch (e) {
    return { url, status: 0, ok: false, ms: Date.now() - t0, error: e.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const id = req.query.id || '154415221';

  const tests = await Promise.all([
    timedFetch('https://www.rolimons.com/itemapi/itemdetails'),
    timedFetch(`https://www.rolimons.com/item/${id}`),
    timedFetch(`https://catalog.roproxy.com/v1/catalog/items/details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ itemType: 'Asset', id: parseInt(id) }] })
    }),
    timedFetch(`https://catalog.roblox.com/v1/catalog/items/details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ itemType: 'Asset', id: parseInt(id) }] })
    }),
    timedFetch(`https://economy.roproxy.com/v2/assets/${id}/details`),
    timedFetch(`https://economy.roblox.com/v2/assets/${id}/details`),
    timedFetch(`https://thumbnails.roproxy.com/v1/assets?assetIds=${id}&size=420x420&format=Png`),
    timedFetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${id}&size=420x420&format=Png`)
  ]);

  return res.status(200).json({
    testId: id,
    vercelRegion: process.env.VERCEL_REGION || 'unknown',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    results: tests
  });
}
