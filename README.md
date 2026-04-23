# 🎮 Roblox Limited Watcher

> **로블록스 리미티드 아이템 가격 변동을 자동 추적하고 Discord 웹훅으로 알림 받는 Vercel 웹앱**
> _v2.1 · メレ Edition · Vercel Serverless_

![HTML](https://img.shields.io/badge/HTML-single--page-E34F26?style=flat-square&logo=html5&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?style=flat-square&logo=vercel&logoColor=white)
![Rolimons](https://img.shields.io/badge/data-Rolimon's-8E24AA?style=flat-square)
![License: MIT](https://img.shields.io/badge/License-MIT-FFB300?style=flat-square)

---

## 🆕 v2.1 — Vercel Serverless 아키텍처

v2.0에서 브라우저 직접 호출시 CORS에 막히던 문제를 해결했음. 이제 모든 외부 API는 **Vercel 서버리스 함수**를 경유함 (`/api/*`). 이걸로 얻는 장점:

- ✅ **CORS 완전 해결** — same-origin 호출이라 브라우저 제약 없음
- ✅ **Edge Cache** — Rolimon's 5분, 썸네일 1시간 캐시로 rate limit 회피
- ✅ **User-Agent 자유 설정** — Rolimon's 등이 요구하는 헤더 설정 가능
- ✅ **Third-party 프록시(RoProxy) 의존 제거** — 직접 `roblox.com` 공식 API 호출
- ✅ **무료** — Vercel Hobby 플랜으로 충분

### 아키텍처

```
┌──────────────┐    /api/*     ┌──────────────────┐   https    ┌──────────────┐
│  브라우저     │ ─────────→   │ Vercel Functions │ ─────────→ │ Rolimon's /  │
│  (index.html)│              │  (Node.js)       │            │ Roblox API   │
└──────────────┘ ←─── JSON ─── └──────────────────┘ ←── JSON ── └──────────────┘
     │
     localStorage (웹훅URL, 추적목록)
```

### API 엔드포인트

| Path | 역할 | Cache |
|------|------|-------|
| `/api/rolimons` | Rolimon's 전체 리미티드 데이터 | 5분 |
| `/api/catalog?id={id}` | Roblox catalog/items/details (lowestPrice) | 15초 |
| `/api/asset?id={id}` | Roblox economy/v2/assets/{id}/details | 30초 |
| `/api/thumbnail?id={id}` | Roblox thumbnails | 1시간 |

---

## ✨ 기능

- 🔗 **URL / ID 파싱** — Roblox URL, Rolimon's URL, 숫자 ID 전부 지원
- 💰 **3가지 추적 필드 선택**
  - **Best Price** (실시간 리셀러 최저가, 카탈로그의 109K+ 같은 값)
  - **RAP** (Recent Average Price, 최근 평균 실거래가)
  - **Value** (Rolimon's 커뮤니티 가치)
- 🔔 **알림 조건 5가지**
  - 모든 변경시 무조건
  - 하락시에만
  - 임계값 이하/이상 도달시
  - **Value의 X% 이하 (bargain detector)**
- 📡 **Discord 웹훅** — RAP/Value/Demand/Value 대비% 포함한 풍부한 임베드
- 🖥️ **브라우저 Notification**
- 💾 **localStorage 저장**
- 🎨 **メレ 테마** — 다크 + 그린/마젠타/골드 + 샤프 컷

---

## 🚀 배포 (Vercel)

### 방법 1 : GitHub → Vercel 연동 (권장)
1. 이 리포를 본인 GitHub에 올리기
2. [vercel.com/new](https://vercel.com/new) → GitHub 리포 선택 → Import
3. 빌드 설정 변경 없이 **Deploy**
4. 완료. `/api/*` 자동으로 서버리스 함수로 배포됨

### 방법 2 : Vercel CLI
```bash
npm i -g vercel
cd roblox-limited-watcher
vercel           # 첫 배포 (개발 프리뷰)
vercel --prod    # 프로덕션 배포
```

### 로컬 개발
```bash
vercel dev       # localhost:3000 에서 /api/* 시뮬레이션
```
> ⚠ `python -m http.server`로 열면 `/api/*`가 안 먹음. 반드시 `vercel dev` 사용.

---

## ⚙️ 사용 순서

1. Vercel에 배포 → 접속
2. **Discord 웹훅 URL 발급** → 입력 → **웹훅 테스트**
3. 페이지 열면 **Rolimon's 데이터 자동 로드** (2,200+ 리미티드 캐싱됨)
4. **아이템 추가**
   - URL 또는 ID 입력
   - 추적 필드 선택 (Best Price 추천)
   - 알림 조건 + 임계값
5. **▶ 모니터링 시작**

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | 순수 HTML/CSS/JS (빌드 없음) |
| 백엔드 | Vercel Serverless Functions (Node.js 18+) |
| 저장 | 브라우저 `localStorage` |
| 데이터 소스 | Rolimon's + Roblox 공식 API |
| 폰트 | Noto Serif KR / Noto Sans KR / JetBrains Mono |
| 의존성 | **0개** — npm install 없음 |

### Rolimon's 데이터 구조

```json
{
  "154415221": [
    "Recycled Cardboard Headphones",  // 0: Name
    "RCHP",                            // 1: Acronym
    76821,                             // 2: RAP
    80000,                             // 3: Value
    109999,                            // 4: Default Value
    1,                                 // 5: Demand (-1~4)
    2,                                 // 6: Trend (-1~4)
    -1,                                // 7: Projected (-1 | 1)
    -1,                                // 8: Hyped
    -1                                 // 9: Rare
  ]
}
```

---

## 📁 프로젝트 구조

```
roblox-limited-watcher/
├── index.html              # 프론트엔드 (UI + 클라이언트 로직)
├── api/
│   ├── rolimons.js         # Rolimon's 프록시
│   ├── catalog.js          # Roblox catalog/items/details
│   ├── asset.js            # Roblox economy/v2/assets
│   └── thumbnail.js        # Roblox thumbnails
├── vercel.json             # Vercel 함수 설정
├── docs/                   # 스크린샷 폴더
├── README.md
├── LICENSE
└── .gitignore
```

---

## ⚠️ 주의사항

- **페이지를 닫으면 모니터링 중단.** 24/7 추적은 탭 열어두거나 Electron 래핑 필요.
- **체크 주기는 60초 이상 권장.** 너무 짧으면 Vercel 함수 호출량/Roblox rate limit 걱정됨.
- **Rolimon's는 리미티드만.** 일반 카탈로그 아이템은 RAP/Value/Demand가 `-`로 표시, Best Price만 동작.
- **localStorage는 도메인 단위.** Vercel 도메인에 종속. 다른 도메인 옮기면 데이터 리셋.
- **Vercel Hobby 플랜 limits:** 함수 100GB-hours/월, 대역폭 100GB/월. 개인 사용엔 충분.

---

## 🎨 메레 테마

| 역할 | HEX |
|------|-----|
| Deep BG | `#0A0A14` |
| Chameleon Green | `#1B5E20` → `#4CAF50` |
| Magenta-Violet | `#8E24AA` → `#BA68C8` |
| Phoenix Gold | `#FFB300` → `#FFD54F` |

---

## 📄 라이선스

MIT — [LICENSE](./LICENSE)

## 🙏 크레딧

- 리미티드 데이터 : [Rolimon's](https://www.rolimons.com)
- 호스팅 : [Vercel](https://vercel.com)
- 디자인 : 게키레인저 メレ

> _メレが見守っている。_
