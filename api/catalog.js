// /api/catalog?id=154415221 — Best Price 조회
// 3단계 fallback: RoProxy → Roblox 공식 → Rolimon's 페이지 스크레이핑

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function tryCatalogPost(url, id) {
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
      body: JSON.stringify({
        items: [{ itemType: 'Asset', id: parseInt(id, 10) }]
      }),
      redirect: 'follow'
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return { ok: false, status: r.status, snippet: text.slice(0, 100) };
    }
    const data = await r.json();
    return { ok: true, data: data?.data?.[0] || null };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function tryRolimonsPage(id) {
  try {
    const r = await fetch(`https://www.rolimons.com/item/${id}`, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.rolimons.com/'
      }
    });
    if (!r.ok) return { ok: false, status: r.status };
    const html = await r.text();

    // HTML 태그 제거 → 평문으로 파싱
    const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

    const bestMatch = plain.match(/Best Price\s+([\d,]+)/i);
    const bestPrice = bestMatch ? parseInt(bestMatch[1].replace(/,/g, ''), 10) : null;

    const rapMatch = plain.match(/\bRAP\s+([\d,]+)/i);
    const rap = rapMatch ? parseInt(rapMatch[1].replace(/,/g, ''), 10) : null;

    const valueMatch = plain.match(/\bValue\s+([\d,]+)/i);
    const value = valueMatch ? parseInt(valueMatch[1].replace(/,/g, ''), 10) : null;

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const name = titleMatch
      ? titleMatch[1].replace(/\s*\|\s*Roblox.*$/i, '').trim()
      : null;

    if (bestPrice === null) {
      return { ok: false, error: 'Best Price not found in Rolimons page' };
    }

    return {
      ok: true,
      data: {
        id: parseInt(id, 10),
        name: name || `Asset ${id}`,
        lowestPrice: bestPrice,
        price: null,
        itemRestrictions: ['Limited'],
        _source: 'rolimons-scrape',
        _rolimonsRap: rap,
        _rolimonsValue: value
      }
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const id = req.query.id;
  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).json({ error: 'id (numeric) required' });
  }

  const errors = [];

  // 1. RoProxy
  const r1 = await tryCatalogPost('https://catalog.roproxy.com/v1/catalog/items/details', id);
  if (r1.ok) return res.status(200).json(r1.data);
  errors.push({ src: 'roproxy', ...r1 });

  // 2. Roblox 공식
  const r2 = await tryCatalogPost('https://catalog.roblox.com/v1/catalog/items/details', id);
  if (r2.ok) return res.status(200).json(r2.data);
  errors.push({ src: 'roblox', ...r2 });

  // 3. Rolimon's 페이지 스크레이핑 (Best Price만)
  const r3 = await tryRolimonsPage(id);
  if (r3.ok) return res.status(200).json(r3.data);
  errors.push({ src: 'rolimons-scrape', ...r3 });

  return res.status(502).json({ error: 'All endpoints failed', attempts: errors });
}
