-- 매일 무료 뽑기: users 테이블에 last_free_pull_date 컬럼 추가
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_free_pull_date DATE;

-- RLS: 기존 users 테이블 정책이 적용되므로 추가 정책 불필요
-- (자기 자신의 row만 읽기/쓰기 가능)
