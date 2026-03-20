# 🌟 Destiny Baby (데스티니 베이비)

AI 기반 아기 작명 서비스 — 사주, 카드 가챠, 커뮤니티, 결제 크레딧을 통합한 Next.js 풀스택 앱

---

## 📌 프로젝트 개요

**Destiny Baby**는 예비 부모를 위한 AI 작명 플랫폼입니다.
사주 분석 기반 이름 추천, 운세 카드 가챠, 커뮤니티 게시판, 크레딧 결제 시스템, 어드민 CMS를 포함합니다.

---

## 🛠 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS, Framer Motion |
| 상태관리 | Zustand, TanStack Query |
| API 레이어 | tRPC v11 |
| 인증 / DB | Supabase (Auth + PostgreSQL) |
| 폼 | React Hook Form + Zod |
| 3D / 애니메이션 | Three.js (@react-three/fiber) |
| 결제 | TossPayments (예정) |
| TTS | ElevenLabs (예정) |

---

## 📁 주요 기능

### 🔤 AI 작명소
- 아기 태명·한국 이름·영어 이름 추천
- 사주(생년월일시) 기반 오행 분석
- 이름 보이스 미리 듣기 (ElevenLabs TTS)
- 작명 리포트 PDF 다운로드 (예정)

### 🃏 카드 가챠
- B / A / S / SS / SSS 5등급 웨이티드 뽑기
- 무료 3회 뽑기 (계정당), 이후 크레딧 차감
- 카드 컬렉션 / 즐겨찾기
- 천장 시스템 (50회 → SS 보장, 90회 → SSS 보장)

### 🔮 사주 분석
- 내 사주 조회 (오행·음양 분석)
- 부부 궁합 계산
- 출산일 추천 (프리미엄)

### 💬 커뮤니티
- 카테고리별 게시판 (임신/출산/육아/작명/사주 등)
- 게시글 작성·좋아요·댓글
- 신고 / 어드민 모더레이션

### 💳 크레딧 결제
| 패키지 | 크레딧 | 가격 |
|---|---|---|
| 체험 | 10 | 1,900원 |
| 기본 | 30 | 4,900원 |
| 프리미엄 | 100 | 12,900원 |
| 로열 | 300 | 29,900원 |

### 🛡 어드민 CMS
- 카드 관리 (추가 / 수정 / 삭제)
- 확률 슬라이더 (등급별 가챠 확률 실시간 조정)
- 커뮤니티 모더레이션 (신고 게시글 처리)
- 유저 관리 (크레딧 지급 / 검색)
- 통계 대시보드 (일간·주간·월간)

---

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 아래 값을 채워넣으세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# TossPayments (결제)
TOSS_CLIENT_KEY=your_toss_client_key
TOSS_SECRET_KEY=your_toss_secret_key

# ElevenLabs (TTS)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

### 4. 타입 체크

```bash
npm run type-check
```

---

## 📂 디렉토리 구조

```
src/
├── app/
│   ├── (main)/           # 사용자 페이지
│   │   ├── naming/       # AI 작명소 + 서브 페이지
│   │   ├── cards/        # 카드 가챠
│   │   ├── saju/         # 사주 분석
│   │   ├── community/    # 커뮤니티
│   │   ├── credits/      # 크레딧 결제
│   │   ├── shop/         # 상점
│   │   └── profile/      # 프로필 / 즐겨찾기 / 설정
│   ├── admin/            # 어드민 CMS
│   │   ├── cards/
│   │   ├── probability/
│   │   ├── community/
│   │   ├── users/
│   │   └── stats/
│   └── api/
│       ├── trpc/         # tRPC 엔드포인트
│       └── payments/     # 결제 콜백
├── lib/
│   ├── trpc/
│   │   └── routers/      # naming / cards / community / payments / user / saju
│   └── saju/             # 사주 계산 & 카드 매칭 로직
├── components/           # 공통 UI 컴포넌트
└── types/                # 공통 타입 정의
```

---

## 🧭 라우팅 맵

| 경로 | 설명 |
|---|---|
| `/` | 메인 홈 |
| `/naming` | AI 작명소 |
| `/naming/taemyeong` | 태명 추천 |
| `/naming/english/[name]` | 영어 이름 분석 |
| `/naming/voice/[name]` | 이름 발음 듣기 |
| `/naming/result/[id]` | 작명 결과 |
| `/naming/report/[id]` | 상세 리포트 |
| `/cards` | 카드 가챠 |
| `/saju` | 사주 분석 |
| `/community` | 커뮤니티 목록 |
| `/community/[id]` | 게시글 상세 |
| `/community/write` | 게시글 작성 |
| `/credits` | 크레딧 충전 |
| `/profile` | 내 프로필 |
| `/profile/favorites` | 즐겨찾기 카드 |
| `/profile/settings` | 계정 설정 |
| `/admin` | 어드민 대시보드 |

---

## 🗄 Supabase 테이블

> 아직 마이그레이션 미실행 상태입니다. 모든 DB 쿼리는 try/catch로 mock 데이터 폴백이 구현되어 있습니다.

주요 테이블: `profiles`, `children`, `naming_results`, `cards`, `user_card_collections`, `community_posts`, `community_comments`, `credit_transactions`, `saju_readings`

---

## 🔐 게스트 모드

로그인 없이 테스트하려면 브라우저 개발자 도구 콘솔에서:

```javascript
document.cookie = "destiny-baby-guest=true; path=/";
location.reload();
```

---

## 📝 개발 현황

| 기능 | 상태 |
|---|---|
| AI 작명소 (UI) | ✅ 완료 |
| 카드 가챠 | ✅ 완료 |
| 사주 분석 | ✅ 완료 |
| 커뮤니티 | ✅ 완료 |
| 크레딧 결제 (UI) | ✅ 완료 |
| 어드민 CMS | ✅ 완료 |
| Supabase DB 마이그레이션 | 🔲 미완료 |
| TossPayments 실결제 연동 | 🔲 미완료 |
| ElevenLabs TTS 연동 | 🔲 미완료 |
| SNS 카드 이미지 생성 | 🔲 미완료 |
| PDF 리포트 다운로드 | 🔲 미완료 |

---

## 📄 라이선스

Private — All rights reserved.
