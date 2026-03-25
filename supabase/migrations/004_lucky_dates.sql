-- Table: lucky_dates (예비 사주 / 길일 목록)
CREATE TABLE lucky_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME,
  lunar_date TEXT,
  saju_analysis JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  source TEXT DEFAULT 'recommendation' CHECK (source IN ('recommendation', 'manual', 'hospital')),
  status TEXT DEFAULT 'candidate' CHECK (status IN ('candidate', 'selected', 'confirmed', 'passed')),
  hospital_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: birth_date_requests (탄생일 추천 요청)
CREATE TABLE birth_date_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent1_birth_date DATE,
  parent1_birth_time TEXT,
  parent2_birth_date DATE,
  parent2_birth_time TEXT,
  baby_gender TEXT DEFAULT 'unknown' CHECK (baby_gender IN ('male', 'female', 'unknown')),
  pregnancy_start_date DATE,
  current_weeks INTEGER,
  due_date DATE NOT NULL,
  safe_start_date DATE,
  safe_end_date DATE,
  recommended_dates JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE lucky_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE birth_date_requests ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Users can manage own lucky_dates" ON lucky_dates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own birth_date_requests" ON birth_date_requests
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_lucky_dates_user ON lucky_dates(user_id);
CREATE INDEX idx_lucky_dates_date ON lucky_dates(date);
CREATE INDEX idx_birth_date_requests_user ON birth_date_requests(user_id);
