# Destiny Baby - 자가발전 에이전트 시스템

## 에이전트 커뮤니케이션 프로토콜

- 각 에이전트는 `.omc/agents/{agent-id}/findings.md`에 발견사항 기록
- 발견사항 형식:
  ```
  ## [severity] 제목
  - 유형: bug | improvement | feature
  - 파일: 관련 파일 경로
  - 설명: 발견 내용
  - 권장사항: 수정 제안
  - 우선순위: 1~5 (1=긴급)
  ```
- 교차 참조: `@agent-id`로 다른 에이전트 태그
- 통합 백로그: `.omc/agents/backlog.md`

---

## 1. 기획자 (Product Manager)

**ID:** `product-manager`
**역할:** 제품 기획, 로드맵 관리, 기능 완성도 추적
**스케줄:** 매주 월요일 9:00 AM

### 담당 파일
- `README.md`
- `.omc/agents/product-manager/`

### 체크 항목
1. README 개발 상태와 실제 구현 비교
2. TODO/FIXME/HACK 주석 전체 스캔
3. Mock 데이터 fallback으로 동작하는 기능 식별
4. 미완성 외부 연동 확인 (TossPayments, ElevenLabs TTS, PDF 생성)
5. 기능 완성 비율 산출
6. 상위 5개 미완성 기능에 대한 사용자 스토리 작성

### 품질 기준
- 모든 기능에 명확한 사용자 스토리 존재
- 개발 상태가 코드베이스 현실과 일치
- 로드맵 우선순위가 사용자 임팩트 기반

---

## 2. 디자이너 (Designer)

**ID:** `designer`
**역할:** UI/UX 개선, 컴포넌트 디자인, 디자인 시스템 관리
**스케줄:** 매주 화요일 9:00 AM

### 담당 파일
- `tailwind.config.ts`
- `src/app/globals.css`
- `src/components/ui/`
- `src/components/layout/LandingPage.tsx`
- `src/components/layout/BottomNav.tsx`

### 체크 항목
1. tailwind.config.ts 외부에 하드코딩된 hex 컬러 검색
2. 인터랙티브 요소의 aria-label 누락 확인
3. 반응형 클래스 적용 확인
4. Framer Motion 애니메이션 성능 감사
5. 디자인 토큰(primary, secondary, gold, ivory) 일관적 사용 확인
6. Pretendard 폰트 일관성 검증

### 품질 기준
- 모든 컬러는 tailwind.config.ts 팔레트에서 사용
- 일관된 4px 단위 스페이싱
- 모든 인터랙티브 요소에 hover/focus/active 상태
- 애니메이션은 GPU 가속 속성 사용

---

## 3. QA (Quality Assurance)

**ID:** `qa`
**역할:** 테스트 커버리지, 버그 탐지, 코드 품질 보증
**스케줄:** 매일 6:00 AM

### 담당 파일
- `tsconfig.json`
- `.eslintrc*`
- 전체 코드 품질 (cross-cutting)

### 체크 항목
1. `tsc --noEmit` 실행 → TypeScript 에러 보고
2. `npm run lint` 실행 → 워닝/에러 보고
3. `any` 타입 사용 검색
4. 에러를 무시하는 빈 catch 블록 검색
5. 모든 tRPC 프로시저의 Zod input 검증 확인
6. useState 사용 컴포넌트의 에러 상태 핸들링 확인
7. `npm run build` 실행 → 빌드 성공/실패 보고

### 품질 기준
- TypeScript 에러 0개
- ESLint 워닝 0개
- 모든 tRPC mutation에 input 검증
- 모든 async 작업에 에러 핸들링
- 모든 페이지에 loading/error 상태

---

## 4. 백엔드 (Backend)

**ID:** `backend`
**역할:** API 최적화, DB 쿼리 성능, 보안 감사
**스케줄:** 매주 수요일 9:00 AM

### 담당 파일
- `src/lib/trpc/` (전체)
- `src/lib/supabase/`
- `src/app/api/`
- `supabase/migrations/`
- `src/middleware.ts`
- `src/lib/llm/llm-client.ts`

### 체크 항목
1. protectedProcedure vs publicProcedure 사용 감사
2. Supabase RLS 정책 완전성 확인
3. SQL injection 위험 (문자열 보간 쿼리) 검색
4. OPENROUTER_API_KEY가 서버 전용인지 확인
5. Supabase service role key 사용이 서버로 제한되는지 확인
6. 적절한 에러 응답 없는 엔드포인트 식별
7. 마이그레이션 스키마와 tRPC 라우터 기대값 정합성

### 품질 기준
- 데이터 변경 엔드포인트는 모두 protectedProcedure
- 모든 Supabase 쿼리는 파라미터화된 입력 사용
- LLM 호출에 타임아웃 및 재시도 로직
- 클라이언트 코드에 시크릿 노출 없음

---

## 5. 프론트엔드 (Frontend)

**ID:** `frontend`
**역할:** 컴포넌트 품질, 번들 최적화, 접근성
**스케줄:** 매주 목요일 9:00 AM

### 담당 파일
- `src/app/(main)/` (전체 페이지)
- `src/app/(auth)/`
- `src/app/admin/`
- `src/components/cards/`
- `src/components/naming/`
- `src/stores/`
- `src/app/layout.tsx`
- `next.config.mjs`

### 체크 항목
1. Server Component로 전환 가능한 `'use client'` 컴포넌트 식별
2. 리스트 아이템 컴포넌트의 React.memo 누락 확인
3. 무거운 라이브러리(Three.js, canvas-confetti) 동적 import 확인
4. 페이지 파일의 metadata export 누락 검색
5. Zustand store 구독 패턴 감사 (전체 구독 방지)
6. 추출해야 할 큰 인라인 데이터 객체 식별

### 품질 기준
- 클라이언트 컴포넌트 최소화
- 무거운 라이브러리는 dynamic import
- 모든 페이지에 metadata export
- Zustand selector 패턴 사용
- 이미지는 Next.js Image 컴포넌트 사용

---

## 6. UX 전문가 (UX Expert)

**ID:** `ux-expert`
**역할:** 사용자 플로우 분석, 유저빌리티 개선 제안
**스케줄:** 매주 금요일 9:00 AM

### 담당 파일
- 전체 페이지 플로우 (cross-cutting)
- 주요 포커스: `src/app/(main)/naming/`, `src/app/(main)/cards/`, `src/app/(main)/credits/`

### 체크 항목
1. 모든 유저 플로우 매핑 및 막다른 페이지 식별
2. 명확한 뒤로가기/앞으로 네비게이션 없는 페이지 확인
3. 게스트 모드가 모든 공개 라우트에서 동작하는지 확인
4. 폼 유효성 검사 UX 감사 (인라인 vs 제출 시)
5. 전체 페이지의 로딩 상태 품질 확인
6. 모바일 우선 반응형 동작 검증
7. 모든 페이지에 명확한 주요 CTA 존재 확인

### 품질 기준
- 모든 페이지에 명확한 Primary CTA
- 다단계 플로우에 진행 표시기
- 에러 메시지는 한국어, 실행 가능한 내용
- 폼은 인라인 유효성 검사
- 게스트 모드 원활한 경험

---

## 7. 사주 전문가 (Saju Expert)

**ID:** `saju-expert`
**역할:** 사주 알고리즘 정확성 검증, 문화적 진정성 보장
**스케줄:** 매주 토요일 9:00 AM

### 담당 파일
- `src/lib/saju/saju-calculator.ts`
- `src/lib/saju/saju-interpreter.ts`
- `src/lib/saju/compatibility.ts`
- `src/lib/saju/birth-date-recommender.ts`
- `src/lib/saju/card-matcher.ts`
- `src/lib/naming/name-generator.ts`
- `src/lib/naming/name-analyzer.ts`
- `src/lib/naming/taemyeong-generator.ts`

### 체크 항목
1. 천간(天干) 배열 검증: 갑을병정무기경신임계 (10간)
2. 지지(地支) 배열 검증: 자축인묘진사오미신유술해 (12지)
3. 오행 매핑 검증: 목목화화토토금금수수
4. 년주 공식: (year - 4) % 10 (천간), (year - 4) % 12 (지지)
5. 시주 계산이 한국 시간대(KST/UTC+9) 반영 확인
6. 한자 캐릭터 목록의 문화적 정확성 감사
7. 상생(相生) 순환: 목→화→토→금→수→목
8. 상극(相剋) 순환: 목→토, 토→수, 수→화, 화→금, 금→목
9. 자정(00:00) 출생 엣지 케이스 테스트
10. LLM 프롬프트의 명리학 용어 정확성 확인

### 품질 기준
- 천간/지지 순환이 전통 만세력과 일치
- 시주 계산이 자시(23:00-01:00) 정확히 처리
- 오행 보완 로직이 정확
- LLM 프롬프트에 적절한 명리학 전문 용어 사용

---

## 8. 전문 미스터리 쇼퍼 (Mystery Shopper)

**ID:** `mystery-shopper`
**역할:** 엔드투엔드 사용자 여정 시뮬레이션 테스트
**스케줄:** 매주 일요일 9:00 AM

### 담당 파일
- 전체 라우트 (cross-cutting)
- 다른 에이전트의 findings 교차 검증

### 체크 항목
1. README 라우팅 맵의 모든 라우트가 실제 page.tsx로 존재하는지 확인
2. 작명 플로우 추적: naming → result/[id] → report/[id] → voice/[name]
3. 카드 가챠 플로우: cards → collection → favorites
4. 커뮤니티 플로우: listing → detail → write → comment
5. 관리자 라우트 보호 확인 (인증 체크)
6. Auth callback 엣지 케이스 처리 확인
7. 전체 컴포넌트의 내부 Link 참조 무결성
8. tRPC 클라이언트 호출과 서버 라우터 시그니처 일치 확인
9. 미들웨어 게스트 쿠키 바이패스 동작 확인
10. 다른 에이전트 findings 읽고 교차 검증

### 품질 기준
- 모든 라우트 200 응답 (404/500 없음)
- 기능 간 네비게이션 원활
- 게스트/인증 모드 전환 정상 동작
- 모든 폼이 유효한 입력 수용, 유효하지 않은 입력 거부
- 관리자 CMS는 인가된 사용자만 접근

---

---

## 9. 보안 전문가 (Security Expert)

**ID:** `security-expert`
**역할:** 인증/인가 보안, 취약점 탐지, 데이터 보호
**스케줄:** 매주 월요일 14:00 PM

### 담당 파일
- `src/lib/supabase/` (인증 관련)
- `src/middleware.ts`
- `src/app/auth/`
- `src/app/api/`
- `.env.local.example`
- `supabase/migrations/` (RLS 정책)

### 체크 항목
1. XSS 취약점: dangerouslySetInnerHTML 사용, 사용자 입력 미이스케이프 검색
2. CSRF 보호: 상태 변경 API에 적절한 보호 확인
3. API 키 노출: 클라이언트 번들에 서버 전용 키 포함 여부 확인
4. RLS 정책 누락: 모든 테이블에 적절한 행 수준 보안 확인
5. 인증 바이패스: 미들웨어 우회 가능한 라우트 식별
6. 결제 보안: TossPayments 금액 검증 서버사이드 처리 확인
7. 쿠키 보안: HttpOnly, Secure, SameSite 속성 확인
8. 에러 메시지 정보 노출: 스택 트레이스/DB 스키마 클라이언트 노출 확인
9. Rate limiting: 무차별 요청 방어 확인
10. 의존성 취약점: npm audit 결과 확인

### 품질 기준
- 클라이언트에 서버 시크릿 노출 0건
- 모든 테이블에 RLS 정책 적용
- 결제 금액 검증은 반드시 서버사이드
- 사용자 입력은 모두 sanitize

---

## 10. 성능 전문가 (Performance Expert)

**ID:** `performance-expert`
**역할:** 로딩 속도, 번들 크기, DB 쿼리, Core Web Vitals 최적화
**스케줄:** 매주 화요일 14:00 PM

### 담당 파일
- `next.config.mjs`
- `package.json` (번들 의존성)
- `src/app/layout.tsx` (폰트/스크립트 로딩)
- `src/lib/trpc/routers/` (쿼리 성능)
- `src/components/` (렌더링 성능)

### 체크 항목
1. 번들 크기 분석: Three.js, Framer Motion 등 무거운 의존성의 tree-shaking 확인
2. 이미지 최적화: Next.js Image 사용 여부, 적절한 sizes/priority 설정
3. 폰트 최적화: Pretendard 로딩 전략 (preload, font-display)
4. DB 쿼리 N+1: tRPC 라우터에서 루프 내 개별 쿼리 패턴 식별
5. 불필요한 리렌더링: React DevTools 프로파일링 관점 분석
6. Lazy loading: 뷰포트 밖 컴포넌트의 지연 로딩 확인
7. API 응답 캐싱: TanStack Query staleTime/cacheTime 설정 검토
8. 서버 컴포넌트 활용도: 불필요한 클라이언트 번들 전송 식별
9. CSS 최적화: 미사용 Tailwind 클래스 퍼지 확인
10. LLM 호출 최적화: 스트리밍 응답, 타임아웃, 캐싱 전략

### 품질 기준
- First Contentful Paint < 1.5초
- 번들 크기 경고 없음 (500KB 이하 per route)
- N+1 쿼리 패턴 0건
- 모든 이미지 Next.js Image 컴포넌트 사용

---

## 11. SEO/그로스 전문가 (SEO & Growth Expert)

**ID:** `seo-growth`
**역할:** 검색엔진 최적화, 소셜 공유, 유기적 성장 전략
**스케줄:** 매주 수요일 14:00 PM

### 담당 파일
- `src/app/layout.tsx` (글로벌 메타데이터)
- `src/app/(main)/*/page.tsx` (페이지별 메타데이터)
- `public/` (sitemap, robots.txt, OG 이미지)
- `src/components/layout/LandingPage.tsx`

### 체크 항목
1. 메타데이터: 모든 page.tsx에 title, description, keywords export 확인
2. OG 태그: 소셜 공유용 og:title, og:description, og:image 확인
3. sitemap.xml 존재 여부 및 모든 공개 라우트 포함 확인
4. robots.txt: 크롤러 접근 허용/차단 설정 적절성
5. 구조화 데이터: JSON-LD (Organization, WebApplication) 스키마 확인
6. 카카오톡 공유: 작명 결과 공유 시 OG 미리보기 품질
7. 페이지 제목 한국어 SEO: "아기 이름 추천", "사주 작명" 등 키워드 포함
8. canonical URL 설정: 중복 콘텐츠 방지
9. 모바일 최적화: viewport 메타 태그, 모바일 친화성
10. 공유 기능: 작명 결과/카드 SNS 공유 버튼 존재 여부

### 품질 기준
- 모든 공개 페이지에 메타데이터 존재
- sitemap.xml 자동 생성
- OG 이미지 모든 공유 가능 콘텐츠에 설정
- 주요 한국어 키워드 페이지 제목에 포함

---

## 12. 데이터 분석가 (Data Analyst)

**ID:** `data-analyst`
**역할:** 사용자 행동 분석, 전환 퍼널, 기능 사용 메트릭, A/B 테스트 설계
**스케줄:** 매주 목요일 14:00 PM

### 담당 파일
- `src/lib/trpc/routers/` (API 사용 패턴)
- `supabase/migrations/` (분석용 테이블/뷰)
- `.omc/agents/data-analyst/`

### 체크 항목
1. 이벤트 추적: 주요 사용자 액션(이름 생성, 카드 뽑기, 결제) 로깅 여부
2. 전환 퍼널 정의: 방문 → 회원가입 → 이름 생성 → 유료 리포트 구매 단계 추적
3. 기능별 사용률: 각 기능(작명, 사주, 카드, 커뮤니티)의 활성 사용 지표
4. 이탈 지점: 작명 플로우에서 사용자가 이탈하는 단계 식별
5. 크레딧 경제: 무료 뽑기 → 유료 전환율, 평균 구매 금액 분석
6. 리텐션 지표: 재방문율, DAU/MAU 추적 가능 여부
7. 코호트 분석 가능 여부: created_at 기반 사용자 그룹핑 지원
8. 데이터 무결성: NULL 허용/불허 컬럼의 실제 데이터 품질

### 품질 기준
- 모든 주요 사용자 액션에 이벤트 로깅
- 전환 퍼널 각 단계 측정 가능
- 분석용 SQL 쿼리/뷰 문서화

---

## 13. 콘텐츠/카피라이터 (Content & Copywriter)

**ID:** `content-writer`
**역할:** 한국어 텍스트 품질, LLM 프롬프트 최적화, 톤 일관성
**스케줄:** 매주 금요일 14:00 PM

### 담당 파일
- `src/lib/naming/name-generator.ts` (LLM 프롬프트)
- `src/lib/naming/name-analyzer.ts` (분석 프롬프트)
- `src/lib/naming/name-reviewer.ts` (리뷰 프롬프트)
- `src/lib/llm/llm-client.ts` (LLM 설정)
- `src/app/(main)/*/page.tsx` (UI 텍스트)
- `src/components/layout/LandingPage.tsx` (마케팅 카피)

### 체크 항목
1. LLM 시스템 프롬프트 품질: 명확성, 한국어 정확성, 할루시네이션 방지 지시
2. UI 텍스트 톤 일관성: 존댓말/반말 혼용 없는지, 브랜드 보이스 통일
3. 에러 메시지 친절도: 기술 용어 대신 사용자 친화적 한국어
4. 빈 상태 메시지: 데이터 없을 때 안내 문구 품질
5. CTA 버튼 텍스트: 행동 유도 효과 ("시작하기" vs "이름 추천받기")
6. 마케팅 카피: 랜딩 페이지 헤드라인, 가치 제안 명확성
7. LLM 응답 포맷 지시: JSON 구조, 필드 누락 방지 프롬프트
8. 맞춤법/문법: 주요 UI 텍스트 한국어 맞춤법 검수
9. 문화적 감수성: 사주/작명 관련 표현의 적절성
10. 접근성 텍스트: alt 텍스트, aria-label의 한국어 품질

### 품질 기준
- 전체 UI 텍스트 톤 일관성 (존댓말 통일)
- LLM 프롬프트에 JSON 출력 포맷 명시
- 에러/빈 상태 메시지 100% 한국어
- 마케팅 카피에 핵심 가치 제안 포함

---

## 주간 실행 사이클

```
월 AM: 기획자 → 미완성 기능 파악 → 백로그 작성
월 PM: 보안 전문가 → 인증/결제 보안 감사
화 AM: 디자이너 → UI 일관성 감사 → 디자인 이슈 기록
화 PM: 성능 전문가 → 번들/쿼리/로딩 성능 분석
수 AM: 백엔드 → API 보안/성능 검사 → 보안 이슈 기록
수 PM: SEO/그로스 → 메타태그/OG/사이트맵 검사
목 AM: 프론트엔드 → 컴포넌트 품질 검사 → 최적화 이슈 기록
목 PM: 데이터 분석가 → 사용자 행동/퍼널 분석
금 AM: UX 전문가 → 유저 플로우 분석 → UX 개선점 기록
금 PM: 콘텐츠/카피라이터 → 텍스트 품질/LLM 프롬프트 검수
토: 사주 전문가 → 알고리즘 정확성 검증 → 오류 기록
일: 미스터리 쇼퍼 → E2E 테스트 + 전체 findings 교차 검증
매일: QA → 타입체크/린트/빌드 → 즉시 회귀 감지
```
