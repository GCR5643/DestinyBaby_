# Destiny Baby (운명의 아이) - Project Instructions

## Tech Stack
- Next.js 14 (App Router), TypeScript (strict mode), tRPC v11
- Supabase (Auth + PostgreSQL), Zustand, TanStack Query
- Tailwind CSS, Framer Motion, Three.js (@react-three/fiber)
- LLM: OpenRouter API (meta-llama/llama-4-maverick)
- Forms: React Hook Form + Zod validation

## Build & Check Commands
- `npm run dev` — development server (port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint
- `tsc --noEmit` — TypeScript strict check

## Coding Conventions
- **TypeScript**: strict mode, no `any` (prefer `unknown` + type guards)
- **Naming**: camelCase 변수/함수, PascalCase 컴포넌트/타입
- **Imports**: `@/*` path alias for all src/ imports
- **Components**: Server Components 기본, `'use client'`는 필요할 때만
- **API**: 모든 데이터 fetching은 tRPC routers (`src/lib/trpc/routers/`)
- **State**: Zustand stores (`src/stores/`), 서버 상태는 TanStack Query
- **Styling**: Tailwind utility classes, 커스텀 컬러는 tailwind.config.ts에 정의
- **Validation**: 모든 tRPC input은 Zod schema로 검증
- **Error handling**: Supabase 쿼리는 try/catch + mock fallback
- **텍스트**: 사용자 대면 문자열은 한국어, 코드 주석은 한국어/영어

## Quality Gates (모두 통과해야 머지 가능)
1. `tsc --noEmit` — 0 에러
2. `npm run lint` — 0 워닝
3. `npm run build` — 빌드 성공
4. 하드코딩된 시크릿/API 키 없음
5. 모든 tRPC input은 Zod으로 검증
6. 새 테이블에는 Supabase RLS 정책 필수
7. 사주 계산은 전통 참조 테이블과 검증

## Database
- Supabase project: `sfmhsneonjbxrttwvfpo.supabase.co`
- Migrations: `supabase/migrations/`
- 20개 테이블 (users, cards, naming_requests, community_posts 등)

## Agent System
- 에이전트 정의: `AGENTS.md`
- 에이전트 발견사항: `.omc/agents/{agent-id}/findings.md`
- 통합 백로그: `.omc/agents/backlog.md`
- 각 에이전트는 담당 파일만 수정 제안, 사용자 승인 후 적용
