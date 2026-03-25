-- 이름 투표 세션 (공유 단위)
CREATE TABLE name_vote_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_code TEXT UNIQUE NOT NULL,
  creator_id UUID REFERENCES users(id),
  candidates JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- 개별 투표
CREATE TABLE name_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES name_vote_sessions(id) ON DELETE CASCADE,
  voter_name TEXT,
  voted_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  voter_fingerprint TEXT
);

-- RLS
ALTER TABLE name_vote_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE name_votes ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능 (투표 URL 접근 시)
CREATE POLICY "Anyone can read vote sessions" ON name_vote_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can read votes" ON name_votes FOR SELECT USING (true);
-- 누구나 세션 생성 가능
CREATE POLICY "Users can create sessions" ON name_vote_sessions FOR INSERT WITH CHECK (true);
-- 누구나 투표 가능
CREATE POLICY "Anyone can vote" ON name_votes FOR INSERT WITH CHECK (true);

CREATE INDEX idx_vote_sessions_share_code ON name_vote_sessions(share_code);
CREATE INDEX idx_votes_session_id ON name_votes(session_id);
