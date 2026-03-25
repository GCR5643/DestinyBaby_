# Phase II PRD: 오늘의 운수 + 운명의 조각 + 출석체크

> 작성일: 2026-03-25 | 상태: 개발 준비 완료

---

## Executive Summary

Phase I의 핵심 문제: **일회성 사용 패턴** (이름 짓고 나면 재방문 동기 부재)
Phase II 핵심 전략: **"매일 돌아오는 서비스"로 전환**

| 기능 | 핵심 | 과금 |
|------|------|------|
| 오늘의 운수 | 아이 사주+오늘 날짜 기반 6종 콘텐츠 (LLM) | 운명의 조각 1개(=100원)/일, 재열람 무료 |
| 운명의 조각 | 기존 credits 리브랜딩 + 활동 재화 | 출석 무료 + 유료 패키지 |
| 출석 체크 | 캘린더 UI + 연속 스트릭 보너스 | 무료 (1조각/일 + 연속 보너스) |

**가치 가설**: 사주 기반 일간 맞춤 콘텐츠 제공 시 주간 리텐션 25%+, 월 ARPU 525원+ 달성

---

## 1. 오늘의 운수

### Problem Statement
출산 후 작명 서비스 이용이 끝나면 재방문할 이유가 없음. 매일 확인하고 싶은 콘텐츠를 제공하여 DAU를 확보해야 함.

### User Stories
- 부모로서, 아이의 오늘 운세를 확인하여 하루를 긍정적으로 시작하고 싶다
- 부모로서, 아이에게 할 칭찬/대화 주제를 추천받아 육아에 활용하고 싶다
- 부모로서, 사주 기반 맞춤 육아팁을 받아 실천하고 싶다

### 콘텐츠 구성 (6종 카드)

| 카드 | 이모지 | 색상 | 콘텐츠 |
|------|--------|------|--------|
| 오늘의 운세 | sun | gold-100 | 3-4줄 사주 기반 하루 운세 |
| 칭찬 한마디 | star | primary-100 | 구체적 행동 기반 칭찬 문장 |
| 사랑 표현 | heart | secondary-100 | 따뜻한 사랑/격려 메시지 |
| 새로운 사실 | microscope | green-100 | 아이 발달/사주 기반 재미있는 팩트 |
| 대화 주제 | speech_balloon | blue-100 | 아이와 나눌 질문 1개 |
| 육아팁 | seedling | amber-100 | 오행에 맞는 활동 추천 |

### 상태 흐름
```
페이지 진입 → DB 캐시 확인
  ├─ 이미 결제 → 6카드 모두 공개 (무료 재열람)
  └─ 미결제 → 6카드 잠김 + "조각 1개 사용" CTA
       ├─ 잔액 있음 → 확인 바텀시트 → 해금 애니메이션 (순차 reveal)
       └─ 잔액 없음 → "조각 충전" CTA
```

### Acceptance Criteria
- [ ] 같은 날 같은 아이 = 1회만 LLM 호출 (DB UNIQUE 제약)
- [ ] 당일 재방문 시 무료 (DB 캐시에서 로드)
- [ ] LLM 실패 시 조각 자동 환불
- [ ] 카드 해금 시 0.18s stagger reveal + confetti 애니메이션
- [ ] 잠김 카드는 blur 오버레이 + 자물쇠 아이콘

---

## 2. 운명의 조각 (크레딧 시스템)

### 경제 설계

**획득 방법:**
| 방법 | 보상 | 빈도 |
|------|------|------|
| 매일 출석 | 1조각 | 일 1회 |
| 7일 연속 | +3조각 보너스 | 주 최대 1회 |
| 14일 연속 | +5조각 보너스 | 2주 1회 |
| 30일 연속 | +10조각 보너스 | 월 1회 |
| 신규 가입 | 5조각 | 1회 |
| 유료 구매 | 패키지별 | 무제한 |

**월간 무료 획득 상한 (완전 출석)**: ~52조각
**월간 기대 소비량 (운수만)**: 14~21조각

**사용처:**
| 용도 | 비용 |
|------|------|
| 오늘의 운수 | 1조각/일 |
| 카드 뽑기 | 1조각/회 (무료 3회 후) |
| 이름 추천 | 무료 5회 후 1조각/회 |

### 유료 패키지

| 패키지 | 조각 | 가격 | 개당 단가 |
|--------|------|------|----------|
| 한 줌 | 10개 | 1,200원 | 120원 |
| 작은 보따리 | 30개 | 3,000원 | 100원 |
| 복주머니 | 100개 | 8,000원 | 80원 (20%할인) |
| 황금 항아리 | 300개 | 20,000원 | 67원 (33%할인) |

### 지갑 UI
- 헤더 우상단: FragmentBadge (보석 아이콘 + 잔액, 탭하면 /wallet)
- /wallet 페이지: 잔액 Hero + 빠른 충전 + 거래 내역 (획득/사용 탭)

---

## 3. 출석 체크

### 핵심 메커니즘
- 매일 1회 출석 → 1조각 무료 지급
- 연속 스트릭 추적 (어제 미출석 → 리셋)
- 마일스톤 보너스 (7/14/30일)

### UI 구성
- **/attendance 페이지**: StreakHero + 월별 캘린더 + 마일스톤 목록 + 출석 CTA
- **홈 미니 배너**: "🔥 5일 연속! 오늘 출석하고 💎 받기" → 즉시 출석 가능

### 감정 설계
| 순간 | 감정 목표 | 수단 |
|------|----------|------|
| 출석 성공 | 성취감 | 버튼 색 변화 + 캘린더 fill + 조각 토스트 |
| 7일 스트릭 | 자부심 | 전체 화면 축하 모달 + confetti |
| 조각 잔액 0 | 긴급함(gentle) | 빨간 뱃지 + 미세 흔들림 |

---

## 4. 하단 네비 변경

**권장 (옵션 A):**
```
기존: 홈 | 작명소 | 탄생일 | 카드 | 프로필
변경: 홈 | 오늘운수 | 작명소 | 카드 | 프로필
```
탄생일은 작명소 내 서브 기능으로 통합 (작명의 전제조건이므로 자연스러움)

---

## 5. 수익 모델

### 유닛 이코노믹스
```
1회 운수 생성 원가:  ~6.5원 (LLM 2.2원 + 인프라 1원 + PG수수료 3.3원)
매출:              100원
마진율:             93.5%
```

### ARPU 시나리오 (MAU 10,000 기준)

| 시나리오 | 무과금(55%) | 라이트(30%) | 과금(15%) | 통합 ARPU | 월 매출 |
|---------|-----------|-----------|---------|---------|--------|
| 보수적 | 0원 | 0원 | 1,500원 | 225원 | 225만원 |
| 기본 | 0원 | 0원 | 3,500원 | 525원 | 525만원 |
| 낙관적 | 0원 | 200원 | 7,000원 | 1,170원 | 1,170만원 |

### 리텐션 목표
| 지표 | 도입 전 | 목표 |
|------|--------|------|
| D1 | 30% | 38% |
| D7 | 12% | 18% |
| D30 | 5% | 9% |
| DAU/MAU | 8% | 15% |

---

## 6. 기술 아키텍처

### DB 스키마 (신규 테이블)

| 테이블 | 용도 | 핵심 제약 |
|--------|------|----------|
| `daily_fortunes` | 운수 캐시 | UNIQUE(child_id, fortune_date) |
| `checkin_records` | 출석 기록 | UNIQUE(user_id, checkin_date) |
| `fragment_transactions` | 조각 이력 | balance_after로 감사 추적 |

### DB 함수 (동시성 제어)
- `deduct_fragments()` — SELECT FOR UPDATE + 잔액 확인 + 차감 (원자적)
- `add_fragments()` — 적립 + 트랜잭션 기록
- `do_checkin()` — 출석 + 스트릭 계산 + 보상 지급 (원자적)

### tRPC 라우터 (신규 3개)
- `dailyFortune` — getDailyFortune, hasTodayFortune, getHistory
- `checkin` — doCheckin, getStreak, getHistory
- `fragments` — getBalance, getHistory, purchase

### 캐싱 전략
- **1차 (필수)**: DB UNIQUE 제약으로 중복 LLM 호출 차단
- **2차 (선택)**: 동일 인스턴스 내 unstable_cache (Vercel Data Cache)

### 보안
- 모든 잔액 연산: DB 함수(SECURITY DEFINER)로만 수행
- Race condition: SELECT FOR UPDATE로 row-level lock
- 출석 날짜: 서버 시간(CURRENT_DATE)만 사용, 클라이언트 시간 무시
- RLS: 모든 신규 테이블에 본인 데이터만 조회 정책 적용

---

## 7. 개발 아이템

### Epic 1: 운명의 조각 시스템 (8 SP)
- [ ] DB 마이그레이션 (users 변경 + fragment_transactions 테이블) — 2 SP
- [ ] deduct_fragments / add_fragments DB 함수 — 2 SP
- [ ] fragments tRPC 라우터 (getBalance, getHistory, purchase) — 2 SP
- [ ] FragmentBadge 헤더 컴포넌트 — 1 SP
- [ ] /wallet 지갑 페이지 (잔액 + 거래 내역 + 충전) — 1 SP

### Epic 2: 출석 체크 (10 SP)
- [ ] DB 마이그레이션 (checkin_records 테이블) — 1 SP
- [ ] do_checkin DB 함수 (원자적 출석 + 보상) — 2 SP
- [ ] checkin tRPC 라우터 (doCheckin, getStreak, getHistory) — 2 SP
- [ ] /attendance 출석 페이지 (캘린더 + 스트릭 + CTA) — 3 SP
- [ ] 홈 미니 배너 (AttendanceMiniStrip) — 1 SP
- [ ] 출석 성공 애니메이션 시퀀스 — 1 SP

### Epic 3: 오늘의 운수 (12 SP)
- [ ] DB 마이그레이션 (daily_fortunes 테이블) — 1 SP
- [ ] LLM 프롬프트 설계 (fortune-prompts.ts) — 2 SP
- [ ] dailyFortune tRPC 라우터 (getDailyFortune, hasTodayFortune, getHistory) — 3 SP
- [ ] /daily-fortune 페이지 (잠김/해금 상태 + 6카드 그리드) — 3 SP
- [ ] 카드 해금 애니메이션 (stagger reveal + confetti) — 2 SP
- [ ] 하단 네비 변경 (탄생일 → 오늘운수) — 1 SP

### Epic 4: 통합 + QA (5 SP)
- [ ] Zustand 스토어 확장 (fragments, streak) — 1 SP
- [ ] types/index.ts Phase II 타입 추가 — 1 SP
- [ ] E2E 시나리오 테스트 — 2 SP
- [ ] Vercel 환경변수 + 배포 검증 — 1 SP

**총 35 Story Points, 2인 기준 약 3 스프린트(6주)**

---

## 8. KPI

| 지표 | 정의 | 목표 |
|------|------|------|
| 운수 열람률 | 당일 운수 열람 DAU / 전체 DAU | 50% |
| 출석 체크율 | 당일 출석 유저 / MAU | 15% (DAU/MAU) |
| 유료 전환율 | 첫 유료 구매 유저 / DAU | 13% |
| ARPU | 월 매출 / MAU | 525원 |

### 핵심 이벤트 스키마
- `daily_fortune_view` — 운수 열람 (P0)
- `checkin_complete` — 출석 완료 (P0)
- `fragment_purchase_complete` — 조각 구매 완료 (P0)
- `fortune_paywall_shown` — 잔액 부족 페이월 노출 (P1)
- `checkin_streak_bonus` — 연속 보너스 지급 (P1)

---

## 9. 컴포넌트 파일 구조

```
src/
├── app/(main)/
│   ├── daily-fortune/page.tsx      — 오늘의 운수
│   ├── wallet/page.tsx             — 조각 지갑
│   └── attendance/page.tsx         — 출석 체크
├── components/
│   ├── fortune/
│   │   ├── FortuneCard.tsx         — 단일 운수 카드
│   │   ├── FortuneCardLocked.tsx   — 잠김 상태
│   │   └── UnlockBanner.tsx        — 해금 CTA
│   ├── wallet/
│   │   ├── FragmentBadge.tsx       — 헤더 잔액 표시
│   │   └── TransactionItem.tsx     — 거래 내역 행
│   └── attendance/
│       ├── AttendanceMiniStrip.tsx  — 홈 미니 배너
│       ├── MonthlyCalendar.tsx     — 월별 달력
│       └── StreakHero.tsx          — 연속 스트릭
├── lib/
│   ├── llm/fortune-prompts.ts      — 운수 LLM 프롬프트
│   └── trpc/routers/
│       ├── daily-fortune.ts        — 운수 라우터
│       ├── checkin.ts              — 출석 라우터
│       └── fragments.ts           — 조각 라우터
└── stores/
    └── userStore.ts                — fragments/streak 액션 추가
```

---

## 10. MVP 범위 vs 후속 확장

**MVP (Phase II-A, 6주):**
- 오늘의 운수 기본 (6카드 잠금/해금)
- 운명의 조각 (출석 적립 + 운수 차감 + 패키지 구매)
- 출석 체크 (캘린더 + 스트릭 + 7/30일 보너스)

**후속 (Phase II-B):**
- 프리미엄 운수 (심층 분석, 2조각)
- 절기별 특별 운수 (설날, 동지 등)
- 구독 상품 (월 3,900원/9,900원)
- 카카오 푸시 알림 (출석/운수 리마인더)
- 운수 콘텐츠 SNS 공유
- 조각 유효기간 (30일 만료)
- 14일/21일/60일 연속 출석 보너스 확장
- 출석 복구권
