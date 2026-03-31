-- 하루 2회 운세 갱신 (오전/저녁)
-- fortune_period 컬럼 추가 후 unique constraint 변경

ALTER TABLE daily_fortunes
  ADD COLUMN IF NOT EXISTS fortune_period VARCHAR(10) NOT NULL DEFAULT 'morning'
  CHECK (fortune_period IN ('morning', 'evening'));

-- 기존 unique constraint 제거 후 period 포함한 새 constraint 추가
ALTER TABLE daily_fortunes
  DROP CONSTRAINT IF EXISTS daily_fortunes_child_id_fortune_date_key;

ALTER TABLE daily_fortunes
  ADD CONSTRAINT daily_fortunes_child_id_fortune_date_period_key
  UNIQUE (child_id, fortune_date, fortune_period);
