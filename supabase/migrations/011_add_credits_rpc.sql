-- ============================================================
-- add_credits: 원자적 크레딧 추가 함수 (race condition 방지)
-- add_fragments 패턴과 동일한 FOR UPDATE 행 잠금 사용
-- ============================================================
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount  INT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current INT;
  v_new     INT;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION '크레딧 추가 금액은 양수여야 합니다: %', p_amount;
  END IF;

  -- 행 잠금으로 동시성 문제 방지
  SELECT COALESCE(credits, 0) INTO v_current
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '사용자를 찾을 수 없습니다: %', p_user_id;
  END IF;

  v_new := v_current + p_amount;

  UPDATE users
  SET credits = v_new
  WHERE id = p_user_id;

  RETURN v_new;
END;
$$;
