-- ============================================================
-- 1. 조회수 원자적 증가 함수
-- ============================================================
CREATE OR REPLACE FUNCTION increment_view_count(p_post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE community_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_post_id;
END;
$$;

-- ============================================================
-- 2. naming_reports RLS 제한: 자신의 리포트만 조회 가능
-- 기존 전체 공개 정책을 소유자 전용으로 변경
-- ============================================================
DROP POLICY IF EXISTS naming_reports_select_all ON naming_reports;
CREATE POLICY naming_reports_select_own ON naming_reports
  FOR SELECT USING (auth.uid() = user_id);

-- 인기도 집계용 별도 뷰 (이름 + 한자만 노출, 개인 사주 데이터 제외)
CREATE OR REPLACE VIEW public.naming_popularity AS
  SELECT selected_name, selected_hanja, COUNT(*) as report_count, MAX(created_at) as last_created
  FROM naming_reports
  WHERE selected_name IS NOT NULL
  GROUP BY selected_name, selected_hanja;

-- ============================================================
-- 3. SECURITY DEFINER 함수에 user_id 검증 추가
-- ============================================================
CREATE OR REPLACE FUNCTION add_fragments(
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
  -- 인증된 사용자 검증 (서비스 롤 키 호출은 auth.uid()가 null)
  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'unauthorized: user_id mismatch';
  END IF;

  SELECT destiny_fragments INTO v_current_balance
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION '사용자를 찾을 수 없습니다: %', p_user_id;
  END IF;

  v_new_balance := v_current_balance + p_amount;

  UPDATE users
  SET destiny_fragments = v_new_balance
  WHERE id = p_user_id;

  INSERT INTO fragment_transactions (
    user_id, amount, type, description, balance_after, reference_id
  ) VALUES (
    p_user_id, p_amount, p_type, p_description, v_new_balance, p_reference_id
  );

  RETURN v_new_balance;
END;
$$;

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
  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'unauthorized: user_id mismatch';
  END IF;

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
-- 4. payment_orders에 인덱스 추가 (결제 확인 성능)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_status ON payment_orders(user_id, status);
