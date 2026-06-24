# GridA 모바일 / PWA 설계서

> 목표: 기존 데스크톱 웹(Vite + React SPA)을 **모바일 반응형**으로 만들고,
> **설치형 PWA**로 배포한다. 향후 Capacitor로 iOS/Android 앱 스토어 확장을 염두에 둔다.
> (확정 전략: **PWA 우선, 향후 네이티브 확장**)

---

## 0. 현재 상태 진단

| 항목 | 상태 |
|------|------|
| 스택 | Vite 5, React 18, Supabase, Tone.js, lucide-react. 전부 인라인 스타일 |
| 반응형 | **부분적** — 모달은 `maxWidth: "90vw"`, 만다라트 그리드만 `useCompactDetect`(640px) |
| viewport meta | 이미 존재 (`width=device-width, initial-scale=1.0`) |
| 데스크톱 의존 | 루트 `padding: 28`, 홈 100vh 2D 그리드, 플래너 144블록, 호버 효과 다수 |
| 오디오 | Tone.js — 모바일은 사용자 제스처로 unlock 필요 |

### 핵심 리스크
1. **홈 화면**: `gridTemplateColumns: "1fr 220px"` + `height: 100vh, overflow: hidden` 고정 몬드리안 레이아웃 → 모바일은 세로 스택 재설계 필요 ([App.jsx:248](../src/App.jsx))
2. **호버 의존**: 타일/블록의 `:hover` brightness·scale 효과가 모바일엔 안 먹음 → `:active` 보강
3. **플래너 144블록**: 가로로 넓은 그리드 → 모바일 레이아웃 재설계
4. **만다라트 9×9**: 작은 화면에서 81칸 동시 표시 불가 → Focus 뷰 기본화

---

## 1. 전략 & 아키텍처 결정

### 1.1 배포 경로
```
Phase 1 반응형 웹  →  Phase 2 PWA(설치형)  →  [향후] Phase 3 Capacitor 네이티브
```
- 각 Phase가 **독립적으로 출시 가능**. PWA까지가 이번 범위.
- React Native 재작성은 **하지 않음**(인라인 스타일·SVG 전면 재작성 비용 과다).

### 1.2 반응형 구현 방식
- 인라인 스타일 구조 유지. 전역 `useIsMobile()` 훅 + 조건부 스타일 객체로 분기.
- 반복되는 분기는 컴포넌트별 `styles(mobile)` 헬퍼로 정리.
- CSS-in-JS 라이브러리 도입은 **하지 않음**(범위 최소화).

### 1.3 브레이크포인트
| 이름 | 범위 | 용도 |
|------|------|------|
| mobile | `≤ 640px` | 단일 컬럼, 풀스크린 시트 |
| tablet | `641–1024px` | 축소된 데스크톱 레이아웃 |
| desktop | `> 1024px` | 현행 유지 |

> 기존 `useCompactDetect`(640px)를 `useViewport()`로 승격하여 전역 사용.

---

## 2. 반응형 기반 작업 (Phase 1 공통)

- [ ] `src/hooks/useViewport.js` 신설 — `{ isMobile, isTablet, width }` 반환 (기존 `useCompactDetect` 흡수)
- [ ] 디자인 토큰 정리: 루트 패딩 `28 → clamp/모바일 14`, 폰트 스케일, 터치 타깃 최소 44px
- [ ] 전역 CSS: `:active` 피드백 유틸 클래스(`.home-tile:active` 등 호버 대체)
- [ ] `overscroll-behavior`, `-webkit-tap-highlight-color: transparent` 등 모바일 기본기
- [ ] `100vh` → `100dvh`(모바일 주소창 대응) 일괄 교체

---

## 3. 화면별 모바일 설계

### 3.1 홈 (`App.jsx` home 뷰)
- 데스크톱: 좌측 히어로 + 우측 220px 피처 컬럼 + 하단 바 (2D 그리드)
- **모바일**: 세로 스택
  - 상단 히어로(로고 + GRIDA 타이틀, 높이 축소)
  - 피처 타일 3개 세로 풀폭(Planner/Mandalart/Pomodoro)
  - 하단 Profile/About 2분할
  - `TopControls`는 히어로 하단 또는 상단 고정 바로 이동
- `overflow: hidden` 해제 → 모바일은 세로 스크롤 허용

### 3.2 만다라트 그리드 (`MandalartGrid.jsx`)
- 이미 `useCompactDetect` 있음 → 모바일은 **Focus(블록별) 뷰 강제 기본**
- Full Grid는 가로 스크롤 컨테이너 + 핀치줌(`touch-action`) 허용
- 셀 탭 타깃 확대, 설명 편집은 풀스크린 bottom sheet

### 3.3 플래너 (`Planner.jsx` / `PlannerDaily.jsx` / `PlannerMonthly.jsx`)
- 144블록(24h × 10분): 모바일은 **세로 타임라인** 또는 시간대별 가로 스크롤
- 탭(Daily/Monthly/Todo) 전환은 하단 세그먼트 컨트롤
- Todo·이벤트 입력은 bottom sheet

### 3.4 뽀모도로 (`PomodoroTimer.jsx`)
- 이미 `maxWidth: 520, margin: auto` → 모바일 거의 OK
- 타이머 종료 시 알림: PWA Notification API(백그라운드 대비)
- BreathingBlocks 애니메이션 모바일 성능 확인

### 3.5 모달/가이드류 (Welcome, Onboarding, *Guide, DescriptionEditor)
- 데스크톱 중앙 카드 → 모바일 **풀스크린 또는 bottom sheet**
- `maxWidth: "90vw"` → 모바일은 `100%` + safe-area 패딩

### 3.6 인증/온보딩 (`AuthGate.jsx`, `WelcomeScreen.jsx`)
- MondrianBg 블록 애니메이션 모바일 성능/레이아웃 확인
- 로그인 폼 `width: 340` → 모바일 풀폭
- Tone.js unlock: 첫 탭에서 `Tone.start()` 호출 보장

### 3.7 기타
- About/MandalartAbout: `gridTemplateColumns: "1fr 340px"` → 모바일 세로 스택
- Friends/Contact/UserGuide: 풀폭 단일 컬럼 확인

---

## 4. 터치 & 인터랙션 대응

- [ ] 모든 호버 효과(`:hover`)에 `:active` 대응 추가
- [ ] 사운드 트리거를 호버 → 탭 기반으로(모바일엔 호버 없음)
- [ ] 드롭다운(`TopControls`)을 탭 토글 + 외부 탭 닫기
- [ ] 스와이프 제스처(선택): 가이드 슬라이드 좌우 넘김
- [ ] 안전 영역: `env(safe-area-inset-*)` 패딩(노치/홈 인디케이터)

---

## 5. PWA 구현 (Phase 2)

- [ ] `vite-plugin-pwa` 설치 및 `vite.config` 설정
- [ ] `manifest.webmanifest`: name, short_name, theme_color(#111), background_color, display: standalone, orientation
- [ ] 앱 아이콘 세트: 192/512(maskable 포함), apple-touch-icon, 스플래시
- [ ] 서비스워커 캐싱 전략:
  - 앱 셸(JS/CSS/폰트/로고): precache
  - Supabase API: 네트워크 우선(오프라인 시 안내)
- [ ] `Add to Home Screen` 프롬프트 + iOS 설치 안내(iOS는 자동 프롬프트 없음)
- [ ] 오프라인 폴백 화면
- [ ] Lighthouse PWA 점수 통과 확인

---

## 6. 테스트 계획

- [ ] Chrome DevTools 디바이스 에뮬레이션(360/390/414px)
- [ ] 실제 기기: iOS Safari, Android Chrome 홈화면 설치 테스트
- [ ] 가로/세로 회전, 다크/라이트, 한/영
- [ ] 오디오 unlock, 알림 권한
- [ ] 오프라인 동작

---

## 7. 향후: Capacitor 네이티브 (참고, 이번 범위 외)

- `@capacitor/core` + CLI, iOS/Android 플랫폼 추가
- `vite build` → `cap sync`
- Supabase 이메일 인증 **딥링크(custom scheme)** 처리
- Safe area, 상태바, 안드로이드 뒤로가기 버튼, 햅틱, 푸시
- 스토어: Apple Developer($99/년), Google Play($25 1회), 개인정보처리방침 URL

---

## 8. 작업 순서 (체크리스트)

### Phase 1 — 반응형
1. [ ] `useViewport` 훅 + 디자인 토큰/전역 CSS 기반
2. [ ] 홈 화면 세로 스택 재설계
3. [ ] 만다라트(Focus 기본 + Full Grid 스크롤/줌)
4. [ ] 플래너(세로 타임라인 + 세그먼트 탭)
5. [ ] 모달/가이드 bottom sheet 전환
6. [ ] 호버 → 탭/`:active` 보강, 오디오 unlock
7. [ ] 인증/온보딩/About 등 나머지 화면 점검

### Phase 2 — PWA
8. [ ] `vite-plugin-pwa` + manifest + 아이콘
9. [ ] 서비스워커 캐싱 + 오프라인 폴백
10. [ ] 설치 안내 + Lighthouse 통과

### 검증
11. [ ] 실기기 테스트(iOS/Android) 및 회귀 점검
