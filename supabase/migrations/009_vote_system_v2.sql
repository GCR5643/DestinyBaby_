-- 009: 투표 시스템 v2 — 복수선택, 덕담, 익명, 커스텀 이름
-- 기존 name_vote_sessions / name_votes 테이블 확장

-- 1. vote_submissions: 한 투표자의 제출 묶음 (복수 이름 선택 + 덕담)
CREATE TABLE IF NOT EXISTS vote_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES name_vote_sessions(id) ON DELETE CASCADE,
  voter_name TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  blessing_message TEXT,  -- 덕담
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vote_submissions_session ON vote_submissions(session_id);

-- 2. vote_selections: 한 제출 내 개별 이름 선택
CREATE TABLE IF NOT EXISTS vote_selections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES vote_submissions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES name_vote_sessions(id) ON DELETE CASCADE,
  voted_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vote_selections_session ON vote_selections(session_id);
CREATE INDEX idx_vote_selections_submission ON vote_selections(submission_id);

-- 3. name_vote_sessions에 title 컬럼 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'name_vote_sessions' AND column_name = 'title'
  ) THEN
    ALTER TABLE name_vote_sessions ADD COLUMN title TEXT DEFAULT '우리 아이 이름 투표';
  END IF;
END $$;

-- 4. name_vote_sessions에 surname 컬럼 추가 (성씨)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'name_vote_sessions' AND column_name = 'surname'
  ) THEN
    ALTER TABLE name_vote_sessions ADD COLUMN surname TEXT DEFAULT '';
  END IF;
END $$;

-- 5. RLS 정책
ALTER TABLE vote_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read submissions" ON vote_submissions FOR SELECT USING (true);
CREATE POLICY "Anyone can submit votes" ON vote_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read selections" ON vote_selections FOR SELECT USING (true);
CREATE POLICY "Anyone can insert selections" ON vote_selections FOR INSERT WITH CHECK (true);
