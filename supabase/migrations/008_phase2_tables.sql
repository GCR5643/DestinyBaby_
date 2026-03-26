-- 008: Phase II 핵심 테이블 및 함수
-- 일일 운세, 출석 체크인, 운명의 조각 거래 내역

-- ============================================================
-- 0. destiny_fragments 컬럼 안전 확인 (005에서 추가되었으나 보험)
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'destiny_fragments'
  ) THEN
    ALTER TABLE users ADD COLUMN destiny_fragments INT DEFAULT 0;
  END IF;
END $$;

-- ============================================================
-- 1. daily_fortunes: 일일 운세 카드 결과 저장
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_fortunes (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id       UUID        NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fortune_date   DATE        NOT NULL DEFAULT CURRENT_DATE,
  fortune_data   JSONB       NOT NULL,  -- LLM이 생성한 6장 카드 콘텐츠
  fragment_cost  INT         NOT NULL DEFAULT 1,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, fortune_date)
);

ALTER TABLE daily_fortunes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'daily_fortunes' AND policyname = 'daily_fortunes_select_own'
  ) THEN
    CREATE POLICY daily_fortunes_select_own ON daily_fortunes
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'daily_fortunes' AND policyname = 'daily_fortunes_insert_own'
  ) THEN
    CREATE POLICY daily_fortunes_insert_own ON daily_fortunes
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_daily_fortunes_user_date
  ON daily_fortunes(user_id, fortune_date);

-- ============================================================
-- 2. checkin_records: 일일 출석 체크인 기록
-- ============================================================
CREATE TABLE IF NOT EXISTS checkin_records (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkin_date     DATE        NOT NULL DEFAULT CURRENT_DATE,
  streak           INT         NOT NULL DEFAULT 1,
  bonus_fragments  INT         NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

ALTER TABLE checkin_records ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'checkin_records' AND policyname = 'checkin_records_select_own'
  ) THEN
    CREATE POLICY checkin_records_select_own ON checkin_records
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'checkin_records' AND policyname = 'checkin_records_insert_own'
  ) THEN
    CREATE POLICY checkin_records_insert_own ON checkin_records
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_checkin_records_user_date
  ON checkin_records(user_id, checkin_date);

-- ============================================================
-- 3. fragment_transactions: 운명의 조각 입출금 원장
-- ============================================================
CREATE TABLE IF NOT EXISTS fragment_transactions (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount        INT         NOT NULL,  -- 양수 = 획득, 음수 = 소비
  type          TEXT        NOT NULL CHECK (type IN (
                              'checkin', 'checkin_bonus', 'purchase',
                              'fortune_spend', 'refund', 'signup_bonus'
                            )),
  description   TEXT,
  balance_after INT         NOT NULL,
  reference_id  TEXT,       -- 운세/체크인 ID 등 선택적 연결
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fragment_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'fragment_transactions' AND policyname = 'fragment_transactions_select_own'
  ) THEN
    CREATE POLICY fragment_transactions_select_own ON fragment_transactions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'fragment_transactions' AND policyname = 'fragment_transactions_insert_own'
  ) THEN
    CREATE POLICY fragment_transactions_insert_own ON fragment_transactions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_fragment_transactions_user_created
  ON fragment_transactions(user_id, created_at DESC);

-- ============================================================
-- 4. deduct_fragments: 운명의 조각 차감 함수
-- ============================================================
CREATE OR REPLACE FUNCTION deduct_fragments(
  p_user_id     UUID,
  p_amount      INT,
  p_type        TEXT,
  p_description TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INT;
  v_new_balance     INT;
BEGIN
  -- 행 잠금으로 동시성 문제 방지
  SELECT destiny_fragments INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION '사용자를 찾을 수 없습니다: %', p_user_id;
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION '운명의 조각이 부족합니다. 보유: %, 필요: %', v_current_balance, p_amount;
  END IF;

  v_new_balance := v_current_balance - p_amount;

  UPDATE users
  SET destiny_fragments = v_new_balance
  WHERE id = p_user_id;

  INSERT INTO fragment_transactions (
    user_id, amount, type, description, balance_after, reference_id
  ) VALUES (
    p_user_id, -p_amount, p_type, p_description, v_new_balance, p_reference_id
  );

  RETURN v_new_balance;
END;
$$;

-- ============================================================
-- 5. add_fragments: 운명의 조각 적립 함수
-- ============================================================
CREATE OR REPLACE FUNCTION add_fragments(
  p_user_id      UUID,
  p_amount       INT,
  p_type         TEXT,
  p_description  TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INT;
BEGIN
  UPDATE users
  SET destiny_fragments = destiny_fragments + p_amount
  WHERE id = p_user_id
  RETURNING destiny_fragments INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION '사용자를 찾을 수 없습니다: %', p_user_id;
  END IF;

  INSERT INTO fragment_transactions (
    user_id, amount, type, description, balance_after, reference_id
  ) VALUES (
    p_user_id, p_amount, p_type, p_description, v_new_balance, p_reference_id
  );

  RETURN v_new_balance;
END;
$$;

-- ============================================================
-- 6. do_checkin: 출석 체크인 처리 함수
-- ============================================================
CREATE OR REPLACE FUNCTION do_checkin(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today          DATE := CURRENT_DATE;
  v_yesterday      DATE := CURRENT_DATE - INTERVAL '1 day';
  v_yesterday_streak INT;
  v_streak         INT;
  v_bonus          INT := 0;
  v_base_earn      INT := 1;
  v_total_earned   INT;
  v_new_balance    INT;
  v_checkin_id     UUID;
BEGIN
  -- 오늘 이미 체크인했는지 확인 (UNIQUE 제약보다 명확한 에러 메시지 제공)
  IF EXISTS (
    SELECT 1 FROM checkin_records
    WHERE user_id = p_user_id AND checkin_date = v_today
  ) THEN
    RAISE EXCEPTION '오늘은 이미 출석 체크인을 완료했습니다.';
  END IF;

  -- 어제 체크인 기록으로 연속 출석 계산
  SELECT streak INTO v_yesterday_streak
  FROM checkin_records
  WHERE user_id = p_user_id AND checkin_date = v_yesterday;

  IF v_yesterday_streak IS NOT NULL THEN
    v_streak := v_yesterday_streak + 1;
  ELSE
    v_streak := 1;
  END IF;

  -- 연속 출석 보너스 계산
  IF v_streak >= 30 THEN
    v_bonus := 10;
  ELSIF v_streak >= 14 THEN
    v_bonus := 5;
  ELSIF v_streak >= 7 THEN
    v_bonus := 3;
  END IF;

  v_total_earned := v_base_earn + v_bonus;

  -- 체크인 기록 삽입
  INSERT INTO checkin_records (user_id, checkin_date, streak, bonus_fragments)
  VALUES (p_user_id, v_today, v_streak, v_bonus)
  RETURNING id INTO v_checkin_id;

  -- 기본 조각 적립
  v_new_balance := add_fragments(
    p_user_id,
    v_base_earn,
    'checkin',
    v_streak || '일 연속 출석 체크인',
    v_checkin_id::TEXT
  );

  -- 보너스 조각 적립 (있을 경우)
  IF v_bonus > 0 THEN
    v_new_balance := add_fragments(
      p_user_id,
      v_bonus,
      'checkin_bonus',
      v_streak || '일 연속 출석 보너스',
      v_checkin_id::TEXT
    );
  END IF;

  RETURN json_build_object(
    'streak',         v_streak,
    'bonus_fragments', v_bonus,
    'total_earned',   v_total_earned,
    'new_balance',    v_new_balance
  );
END;
$$;
