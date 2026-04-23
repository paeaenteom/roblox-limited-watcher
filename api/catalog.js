// /api/catalog?id=154415221 — Best Price 조회
// v4: Rolimon's 페이지 스크레이핑 최우선 (이미 페이지에 "Best Price 109,999" 박혀있음)

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const BROWSER_HEADERS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

// 🥇 1순위: Rolimon's 페이지에서 "Best Price 109,999" 스크레이핑
async function tryRolimonsPage(id) {
  try {
    const r = await fetch(`https://www.rolimons.com/item/${id}`, {
      headers: BROWSER_HEADERS,
      redirect: 'follow'
    });

    if (!r.ok) return { ok: false, status: r.status, src: 'rolimons-page' };

    const html = await r.text();

    // Cloudflare 챌린지 / 봇 차단 감지
    if (/cf-challenge|Just a moment|checking your browser|cloudflare.com\/5xx/i.test(html)) {
      return { ok: false, error: 'Cloudflare challenge', src: 'rolimons-page' };
    }

    // 너무 짧으면 에러 페이지일 가능성
    if (html.length < 500) {
      return { ok: false, error: `Page too short (${html.length}b)`, src: 'rolimons-page', htmlSnippet: html.slice(0, 200) };
    }

    let bestPrice = null;
    let rap = null;
    let value = null;
    let name = null;
    let demand = null;

    // ── 전략 1: HTML 태그 제거 → 평문 파싱
    const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

    const bestMatch = plain.match(/Best Price\s+([\d,]+)/i);
    if (bestMatch) bestPrice = parseInt(bestMatch[1].replace(/,/g, ''), 10);

    const rapMatch = plain.match(/\bRAP\s+([\d,]+)/i);
    if (rapMatch) rap = parseInt(rapMatch[1].replace(/,/g, ''), 10);

    const valueMatch = plain.match(/\bValue\s+([\d,]+)/i);
    if (valueMatch) value = parseInt(valueMatch[1].replace(/,/g, ''), 10);

    const demandMatch = plain.match(/Demand\s+(None|Terrible|Low|Normal|High|Amazing)/i);
    if (demandMatch) demand = demandMatch[1];

    // ── 전략 2: "Best Price" 주변 500자에서 숫자 직접 탐색 (HTML 구조 변경 대비)
    if (bestPrice === null) {
      const idx = html.indexOf('Best Price');
      if (idx !== -1) {
        const chunk = html.slice(idx, idx + 800);
        // > 숫자 < 패턴 (HTML 요소 안의 숫자)
        const m = chunk.match(/>\s*([\d]{2,}(?:,[\d]{3})*)\s*</);
        if (m) bestPrice = parseInt(m[1].replace(/,/g, ''), 10);
      }
    }

    // ── 타이틀에서 이름 추출
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      name = titleMatch[1]
        .replace(/\s*\|\s*Roblox.*$/i, '')
        .replace(/\s*-\s*Rolimon.*$/i, '')
        .trim();
    }

    if (bestPrice !== null) {
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
          _rolimonsValue: value,
          _rolimonsDemand: demand
        }
      };
    }

    return {
      ok: false,
      error: 'Best Price pattern not matched',
      src: 'rolimons-page',
      htmlSnippet: plain.slice(0, 400),
      htmlLength: html.length
    };
  } catch (e) {
    return { ok: false, error: e.message, src: 'rolimons-page' };
  }
}

// 🥈 2순위: RoProxy catalog API (POST)
async function tryRoProxyCatalog(id) {
  try {
    const r = await fetch('https://catalog.roproxy.com/v1/catalog/items/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': UA,
        'Referer': 'https://www.roblox.com/',
        'Origin': 'https://www.roblox.com'
      },
      body: JSON.stringify({ items: [{ itemType: 'Asset', id: parseInt(id, 10) }] }),
      redirect: 'follow'
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return { ok: false, status: r.status, snippet: text.slice(0, 100), src: 'roproxy' };
    }
    const data = await r.json();
    return { ok: true, data: data?.data?.[0] || null };
  } catch (e) {
    return { ok: false, error: e.message, src: 'roproxy' };
  }
}

// 🥉 3순위: Roblox 공식
async function tryRobloxCatalog(id) {
  try {
    const r = await fetch('https://catalog.roblox.com/v1/catalog/items/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': UA,
        'Referer': 'https://www.roblox.com/',
        'Origin': 'https://www.roblox.com'
      },
      body: JSON.stringify({ items: [{ itemType: 'Asset', id: parseInt(id, 10) }] }),
      redirect: 'follow'
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return { ok: false, status: r.status, snippet: text.slice(0, 100), src: 'roblox' };
    }
    const data = await r.json();
    return { ok: true, data: data?.data?.[0] || null };
  } catch (e) {
    return { ok: false, error: e.message, src: 'roblox' };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const id = req.query.id;
  if (!id || !/^\d+$/.test(String(id))) {
    return res.status(400).json({ error: 'id (numeric) required' });
  }

  const attempts = [];

  // 1. Rolimon's 페이지 스크레이핑
  const r1 = await tryRolimonsPage(id);
  if (r1.ok) return res.status(200).json(r1.data);
  attempts.push(r1);

  // 2. RoProxy
  const r2 = await tryRoProxyCatalog(id);
  if (r2.ok) return res.status(200).json(r2.data);
  attempts.push(r2);

  // 3. Roblox 공식
  const r3 = await tryRobloxCatalog(id);
  if (r3.ok) return res.status(200).json(r3.data);
  attempts.push(r3);

  return res.status(502).json({
    error: 'All endpoints failed',
    attempts
  });
}
