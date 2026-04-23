# 🎮 Roblox Limited Watcher

> **로블록스 리미티드 아이템 가격 변동을 자동 추적하고 Discord 웹훅으로 알림 받는 단일 HTML 도구**
> _v2.0 · メレ Edition · Rolimon's 통합판_

![HTML](https://img.shields.io/badge/HTML-single--file-E34F26?style=flat-square&logo=html5&logoColor=white)
![No Backend](https://img.shields.io/badge/backend-none-1B5E20?style=flat-square)
![Rolimons](https://img.shields.io/badge/data-Rolimon's-8E24AA?style=flat-square)
![License: MIT](https://img.shields.io/badge/License-MIT-FFB300?style=flat-square)

---

## 🆕 v2.0 업데이트

- 🎯 **Rolimon's API 통합** — RAP / Value / Demand / Trend / 정확한 이름까지 2,200+ 리미티드 데이터 풀 로드
- 💎 **3가지 추적 필드** — Best Price(실시간 리셀러 최저가) / RAP / Value 중 선택
- 🛒 **Bargain Detector** — "Value의 80% 이하 도달시 알림" 같은 스마트 조건
- 🏷️ **Projected / Hyped / Rare 태그** 자동 표시
- 📊 **카드당 정보 대폭 증가** — RAP, Value, Demand, Trend 한눈에

---

## ✨ 핵심 기능

- 🔗 **링크 / ID 다 지원** — Roblox URL, Rolimon's URL, 숫자 ID 전부 파싱
- 💰 **정확한 가격 소스**
  - **Best Price** = 로블록스 카탈로그의 "최저가격" 109K+ 같은 값 (실시간)
  - **RAP** = Recent Average Price, 최근 실제 거래 평균가
  - **Value** = Rolimon's 커뮤니티 가치 추정가
- 🔔 **알림 조건 5가지**
  - 모든 변경시 무조건
  - 하락시에만
  - 임계값 이하 도달시
  - 임계값 이상 도달시
  - **Value의 X% 이하 도달시 (bargain)**
- 📡 **Discord 웹훅** — 변동 내역을 풍부한 임베드로 전송 (RAP/Value/Demand/Value 대비 % 포함)
- 🖥️ **브라우저 Notification API** — 탭만 열어두면 데스크탑 알림
- 💾 **localStorage 자동 저장** — 웹훅 URL, 추적 목록, 설정 모두 보존
- 🎨 **メレ 테마** — 다크 + 그린/마젠타/골드 + 샤프 컷 디자인

---

## 🚀 사용법

### 그냥 받아서 열기
`index.html` 다운로드 → 더블클릭

### GitHub Pages 호스팅
리포 → **Settings → Pages → Source: `main` / `/(root)`** → Save
→ `https://<유저명>.github.io/<리포명>/`

### 로컬 서버
```bash
python -m http.server 8080
# 또는
npx serve .
```

---

## ⚙️ 사용 순서

1. **Discord 웹훅 URL 발급**
   채널 톱니바퀴 → 연동 → 웹후크 → 새 웹후크 → URL 복사
2. **상단 입력 → "웹훅 테스트"** 로 연결 확인
3. **Rolimon's 자동 로드** (페이지 열면 자동, 2,200+ 리미티드 데이터 캐싱)
4. **아이템 추가**
   - URL 또는 ID
   - 추적 필드 선택 (Best Price 추천)
   - 알림 조건 + 임계값
   - `+ 아이템 추가`
5. **▶ 모니터링 시작**

---

## 🛠️ 기술 스택 · 데이터 소스

| 데이터 | 소스 | 갱신 주기 |
|--------|------|----------|
| RAP / Value / Demand / Trend / 이름 | [Rolimon's](https://www.rolimons.com) `/itemapi/itemdetails` | 10분 캐시 |
| Best Price (리셀러 최저가) | Roblox Catalog API via [RoProxy](https://roproxy.com) | 설정 주기마다 |
| 썸네일 | Roblox Thumbnails API via RoProxy | 아이템 추가시 |

| 영역 | 기술 |
|------|------|
| 저장 | 브라우저 `localStorage` (5-10MB) |
| 폴링 | `setInterval` 15초~3600초 설정 가능 |
| 알림 | Discord Webhook + Notification API |
| 폰트 | Noto Serif KR / Noto Sans KR / JetBrains Mono |
| 의존성 | **0개** — 순수 단일 HTML |

### Rolimon's itemdetails 배열 구조

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

## ⚠️ 주의사항

- **페이지를 닫으면 모니터링 중단.** 24/7 추적은 탭 열어두거나 Electron으로 래핑 권장.
- **체크 주기는 60초 이상 권장.** 너무 짧으면 RoProxy 레이트리밋 위험.
- **Rolimon's는 리미티드만 추적.** 일반 카탈로그 아이템은 RAP/Value/Demand가 전부 `-`로 표시되며 Best Price만 동작.
- **localStorage는 도메인 단위.** GitHub Pages에 올리면 그 URL에서 모든 기기가 같은 데이터 (로그인 아님).
- **Rolimon's API는 분당 1회 rate limit.** 10분 캐시로 해결하지만 수동 갱신 버튼 남발 금지.

---

## 🎨 메레 테마 컬러 팔레트

| 역할 | HEX |
|------|-----|
| Deep BG | `#0A0A14` |
| Panel | `#14142A` |
| Chameleon Green | `#1B5E20` → `#4CAF50` |
| Magenta-Violet | `#8E24AA` → `#BA68C8` |
| Phoenix Gold | `#FFB300` → `#FFD54F` |

---

## 📄 라이선스

MIT — [LICENSE](./LICENSE) 참조

## 🙏 크레딧

- 리미티드 데이터 : [Rolimon's](https://www.rolimons.com)
- CORS 프록시 : [RoProxy](https://roproxy.com)
- 디자인 : 게키레인저 メレ

> _メレが見守っている。_
