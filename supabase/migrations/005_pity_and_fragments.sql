-- 005: 천장(Pity) 시스템 및 운명의 조각(Fragments) 추가
-- 카드 가챠 시스템 고도화를 위한 컬럼 추가

-- 1. 천장 카운터: SSR 이상 미획득 시 누적되는 뽑기 횟수
ALTER TABLE users ADD COLUMN IF NOT EXISTS pity_counter INT DEFAULT 0;

-- 2. 운명의 조각: 중복 카드 획득 시 전환되는 재화
ALTER TABLE users ADD COLUMN IF NOT EXISTS destiny_fragments INT DEFAULT 0;

-- 3. 인덱스 (천장 카운터 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_users_pity_counter ON users(pity_counter);
