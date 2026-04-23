# 🎮 Roblox Limited Watcher

> **로블록스 리미티드 아이템 가격 변동을 자동 추적하고 Discord 웹훅으로 알림 받는 단일 HTML 도구**
> _メレ Edition · 카멜레온 그린 / 마젠타-바이올렛 / 피닉스 골드_

![HTML](https://img.shields.io/badge/HTML-single--file-E34F26?style=flat-square&logo=html5&logoColor=white)
![No Backend](https://img.shields.io/badge/backend-none-1B5E20?style=flat-square)
![License: MIT](https://img.shields.io/badge/License-MIT-FFB300?style=flat-square)
![Theme: Mere](https://img.shields.io/badge/theme-メレ-8E24AA?style=flat-square)

---

## ✨ 기능

- 🔗 **링크 / ID 둘 다 지원** — `https://www.roblox.com/ko/catalog/154415221/...` 풀URL이든 `154415221` 숫자ID든 자동 파싱
- 💰 **가격 소스 자동 분기**
  - 리미티드 / 리미티드U → **리셀러 최저가** 추적
  - 일반 카탈로그 → **카탈로그 가격** 추적
- 🔔 **알림 조건 4가지**
  - 모든 변경시 무조건
  - 하락시에만
  - 임계값 이하 도달시
  - 임계값 이상 도달시
- 📡 **Discord 웹훅 자동 전송** — 임베드 카드로 변동 내역 정리
- 🖥️ **브라우저 Notification API** — 탭만 열어두면 데스크탑 알림
- 💾 **localStorage 자동 저장** — 웹훅 URL, 추적 목록, 설정 모두 보존
- 🎨 **メレ 테마** — 다크 배경 + 그린/마젠타/골드 액센트 + 샤프 컷 디자인

---

## 🚀 사용법

### 옵션 1 : 그냥 다운로드해서 열기

`index.html` 다운로드 → 더블클릭 → 끝.

### 옵션 2 : GitHub Pages 호스팅

1. 이 리포 fork 또는 새 리포에 업로드
2. **Settings → Pages → Source: `main` 브랜치 / `/(root)`** 선택
3. 몇 분 후 `https://<유저명>.github.io/<리포명>/` 접속
4. 즐겨찾기 등록

### 옵션 3 : 로컬 서버

```bash
# 파이썬
python -m http.server 8080

# Node
npx serve .
```

---

## ⚙️ 사용 순서

1. **Discord 웹훅 URL 발급**
   디스코드 채널 → 톱니바퀴 → **연동 → 웹후크 → 새 웹후크** → URL 복사
2. **상단 입력창에 붙여넣기 → "웹훅 테스트"** 로 연결 확인
3. **아이템 추가**
   - URL 또는 ID 입력
   - 알림 조건 선택 (필요하면 임계값 입력)
   - `+ 아이템 추가` 클릭
4. **▶ 모니터링 시작** → 설정 주기마다 자동으로 가격 체크
5. 가격 변동 발생 → Discord에 임베드 알림 + 데스크탑 푸시

---

## 🛠️ 기술 스택

| 영역 | 사용 기술 |
|------|----------|
| 데이터 소스 | [`roproxy.com`](https://roproxy.com/) (로블록스 공개 API CORS 프록시) |
| 저장 | 브라우저 `localStorage` |
| 폴링 | `setInterval` (15초 ~ 3600초 설정 가능) |
| 알림 | Discord Webhook + Notification API |
| 폰트 | Noto Serif KR / Noto Sans KR / JetBrains Mono |
| 의존성 | **없음** — 외부 라이브러리 0개, 빌드 0개 |

### API 엔드포인트

```
GET  https://economy.roproxy.com/v2/assets/{id}/details
GET  https://economy.roproxy.com/v1/assets/{id}/resellers?cursor=&limit=10
GET  https://thumbnails.roproxy.com/v1/assets?assetIds={id}&size=420x420&format=Png
```

---

## ⚠️ 주의사항

- **페이지를 닫으면 모니터링이 중단됨.** 24/7 추적이 필요하면 PC에서 탭을 열어두거나, Electron으로 감싸서 백그라운드 실행하는 방향 추천.
- **체크 주기는 너무 짧게 설정하지 말 것.** 60초 권장. 너무 자주 호출하면 RoProxy 쪽 부담 + 레이트리밋 위험.
- **localStorage는 도메인 단위로 저장됨.** 다른 호스팅으로 옮기면 데이터는 따라가지 않음 (export/import 기능은 추후 추가 가능).
- **로블록스 API 응답 구조 변경시** 동작이 멈출 수 있음. RoProxy는 로블록스 API를 그대로 프록시하기 때문.

---

## 🎨 메레 테마 컬러 팔레트

| 역할 | 컬러 | HEX |
|------|------|-----|
| Deep BG | 섀도우 블랙 | `#0A0A14` |
| Panel | 다크 인디고 | `#14142A` |
| Accent 1 | 카멜레온 그린 | `#1B5E20` → `#4CAF50` |
| Accent 2 | 마젠타-바이올렛 | `#8E24AA` → `#BA68C8` |
| Highlight | 피닉스 골드 | `#FFB300` → `#FFD54F` |
| Text | 라이트 그레이 | `#EDEDF5` |

---

## 📄 라이선스

MIT License — 자세한 내용은 [LICENSE](./LICENSE) 참조.

---

## 🙏 크레딧

- API 프록시 : [RoProxy](https://roproxy.com/)
- 디자인 영감 : 게키레인저 メレ
- 캐릭터 : Claude (Anthropic) × 유빈

> _カメレオン グリーン と マゼンタ・ヴァイオレット, フェニックス ゴールド —
> メレが見守っている。_
