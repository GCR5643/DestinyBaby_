-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'unknown');
CREATE TYPE card_grade AS ENUM ('N', 'R', 'SR', 'SSR', 'UR', 'SSS');

-- Table: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_location TEXT,
  credits INTEGER DEFAULT 0,
  total_pulls INTEGER DEFAULT 0,
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: children
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  birth_time TIME,
  gender gender_type,
  saju_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: cards
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  grade card_grade NOT NULL,
  element TEXT,
  description TEXT,
  ability TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: user_cards
CREATE TABLE user_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  card_id UUID NOT NULL REFERENCES cards(id),
  obtained_at TIMESTAMPTZ DEFAULT now(),
  is_favorite BOOLEAN DEFAULT false,
  UNIQUE(user_id, card_id)
);

-- Table: saju_readings
CREATE TABLE saju_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  child_id UUID REFERENCES children(id),
  reading_data JSONB NOT NULL,
  interpretation TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: credit_transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'use', 'reward', 'refund')),
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: community_posts
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  category TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  image_urls TEXT[],
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: community_comments
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  parent_id UUID REFERENCES community_comments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: event_packs
CREATE TABLE event_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  description TEXT,
  card_count INTEGER DEFAULT 1,
  price INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: avatar_shop_items
CREATE TABLE avatar_shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  item_type TEXT NOT NULL,
  image_url TEXT,
  price_credits INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: gacha_probability_config
CREATE TABLE gacha_probability_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grade card_grade NOT NULL UNIQUE,
  probability DECIMAL(5,4) NOT NULL,
  pity_threshold INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: naming_requests
CREATE TABLE naming_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  child_id UUID REFERENCES children(id),
  parent1_saju JSONB NOT NULL,
  parent2_saju JSONB,
  baby_birth_date DATE,
  baby_birth_time TIME,
  gender gender_type NOT NULL DEFAULT 'unknown',
  hangryeol_char TEXT,
  sibling_names TEXT[],
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: naming_results
CREATE TABLE naming_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES naming_requests(id) ON DELETE CASCADE,
  suggested_names JSONB NOT NULL,
  is_regenerated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: naming_reports
CREATE TABLE naming_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id UUID NOT NULL REFERENCES naming_results(id),
  user_id UUID NOT NULL REFERENCES users(id),
  selected_name TEXT NOT NULL,
  selected_hanja TEXT,
  report_data JSONB NOT NULL,
  pdf_url TEXT,
  sns_card_url TEXT,
  tts_audio_urls JSONB,
  price_paid INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: naming_reviews
CREATE TABLE naming_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  input_name TEXT NOT NULL,
  input_hanja TEXT,
  child_id UUID REFERENCES children(id),
  quick_result JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: taemyeong_results
CREATE TABLE taemyeong_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  request_id UUID REFERENCES naming_requests(id),
  suggested_names JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: english_name_results
CREATE TABLE english_name_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  korean_name TEXT NOT NULL,
  korean_hanja TEXT,
  selected_options TEXT[],
  custom_prompt TEXT,
  suggestions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: referral_codes
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  code TEXT UNIQUE NOT NULL,
  reward_type TEXT NOT NULL DEFAULT 'free_naming_report',
  used_by UUID REFERENCES users(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- Enable RLS on all tables
-- =====================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE saju_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_probability_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE naming_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE naming_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE naming_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE naming_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE taemyeong_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE english_name_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS Policies: users
-- =====================
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- =====================
-- RLS Policies: children
-- =====================
CREATE POLICY "children_all_own" ON children
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- RLS Policies: saju_readings
-- =====================
CREATE POLICY "saju_readings_all_own" ON saju_readings
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- RLS Policies: user_cards
-- =====================
CREATE POLICY "user_cards_all_own" ON user_cards
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- RLS Policies: credit_transactions
-- =====================
CREATE POLICY "credit_transactions_select_own" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "credit_transactions_insert_own" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================
-- RLS Policies: community_posts
-- =====================
CREATE POLICY "community_posts_select_all" ON community_posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "community_posts_insert_own" ON community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_posts_update_own" ON community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "community_posts_delete_own" ON community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- =====================
-- RLS Policies: community_comments
-- =====================
CREATE POLICY "community_comments_select_all" ON community_comments
  FOR SELECT USING (true);

CREATE POLICY "community_comments_insert_own" ON community_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_comments_update_own" ON community_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "community_comments_delete_own" ON community_comments
  FOR DELETE USING (auth.uid() = user_id);

-- =====================
-- RLS Policies: cards (read-only for authenticated)
-- =====================
CREATE POLICY "cards_select_authenticated" ON cards
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================
-- RLS Policies: event_packs (read-only for authenticated)
-- =====================
CREATE POLICY "event_packs_select_authenticated" ON event_packs
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================
-- RLS Policies: avatar_shop_items (read-only for authenticated)
-- =====================
CREATE POLICY "avatar_shop_items_select_authenticated" ON avatar_shop_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================
-- RLS Policies: gacha_probability_config (read-only for authenticated)
-- =====================
CREATE POLICY "gacha_probability_config_select_authenticated" ON gacha_probability_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================
-- RLS Policies: naming_requests
-- =====================
CREATE POLICY "naming_requests_all_own" ON naming_requests
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- RLS Policies: naming_results
-- =====================
CREATE POLICY "naming_results_all_own" ON naming_results
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM naming_requests WHERE id = request_id)
  );

-- =====================
-- RLS Policies: naming_reports
-- =====================
CREATE POLICY "naming_reports_all_own" ON naming_reports
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- RLS Policies: naming_reviews
-- =====================
CREATE POLICY "naming_reviews_all_own" ON naming_reviews
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- RLS Policies: taemyeong_results
-- =====================
CREATE POLICY "taemyeong_results_all_own" ON taemyeong_results
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- RLS Policies: english_name_results
-- =====================
CREATE POLICY "english_name_results_all_own" ON english_name_results
  FOR ALL USING (auth.uid() = user_id);

-- =====================
-- RLS Policies: referral_codes
-- =====================
CREATE POLICY "referral_codes_select_authenticated" ON referral_codes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "referral_codes_update_used_by" ON referral_codes
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (used_by IS NOT NULL);

-- =====================
-- Default gacha probabilities
-- =====================
INSERT INTO gacha_probability_config (grade, probability, pity_threshold) VALUES
  ('N',   0.5000, NULL),
  ('R',   0.3000, NULL),
  ('SR',  0.1500, NULL),
  ('SSR', 0.0350, 80),
  ('UR',  0.0100, 150),
  ('SSS', 0.0050, 200);
