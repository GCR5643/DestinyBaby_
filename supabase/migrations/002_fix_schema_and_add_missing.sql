-- =============================================
-- 002: Fix schema mismatches & add missing tables
-- =============================================

-- 1. Fix card_grade enum to match application code (B/A/S/SS/SSS)
ALTER TYPE card_grade ADD VALUE IF NOT EXISTS 'B';
ALTER TYPE card_grade ADD VALUE IF NOT EXISTS 'A';
ALTER TYPE card_grade ADD VALUE IF NOT EXISTS 'S';
ALTER TYPE card_grade ADD VALUE IF NOT EXISTS 'SS';

-- 2. Add free_pulls_used column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_pulls_used INTEGER DEFAULT 0;

-- 3. Change cards.id to TEXT (code generates string IDs like 'dynamic-...')
--    We need to drop dependent constraints first, recreate with TEXT
--    Since this is a fresh DB, we can safely alter
ALTER TABLE user_cards DROP CONSTRAINT IF EXISTS user_cards_card_id_fkey;
ALTER TABLE cards ALTER COLUMN id SET DATA TYPE TEXT USING id::TEXT;
ALTER TABLE user_cards ALTER COLUMN card_id SET DATA TYPE TEXT;
ALTER TABLE user_cards
  ADD CONSTRAINT user_cards_card_id_fkey FOREIGN KEY (card_id) REFERENCES cards(id);

-- 4. Remove UNIQUE constraint on user_cards (users can pull duplicate cards)
ALTER TABLE user_cards DROP CONSTRAINT IF EXISTS user_cards_user_id_card_id_key;

-- 5. Create community_likes table
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_likes_select_all" ON community_likes
  FOR SELECT USING (true);
CREATE POLICY "community_likes_insert_own" ON community_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "community_likes_delete_own" ON community_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create payment_orders table
CREATE TABLE IF NOT EXISTS payment_orders (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  pack_id TEXT NOT NULL,
  credits INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_orders_select_own" ON payment_orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payment_orders_insert_own" ON payment_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payment_orders_update_own" ON payment_orders
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. RPC functions for like count
CREATE OR REPLACE FUNCTION increment_like_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET like_count = like_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_like_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE community_posts
  SET like_count = GREATEST(like_count - 1, 0)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Auth trigger: auto-create users row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname, credits, total_pulls, free_pulls_used)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    0,
    0,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Fix missing RLS policies

-- users: allow INSERT for auth trigger (service role handles this, but also allow self-insert)
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- cards: allow INSERT for authenticated (card pull creates cards)
CREATE POLICY "cards_insert_authenticated" ON cards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- user_cards: explicit INSERT policy (FOR ALL may not cover inserts in some configs)
-- Already covered by "user_cards_all_own" FOR ALL policy

-- credit_transactions: allow INSERT for service operations
-- Already has insert_own policy

-- community_posts: allow SELECT for anonymous/public viewing
DROP POLICY IF EXISTS "community_posts_select_all" ON community_posts;
CREATE POLICY "community_posts_select_all" ON community_posts
  FOR SELECT USING (true);

-- naming_reports: allow SELECT for public (popularity query uses it without auth)
DROP POLICY IF EXISTS "naming_reports_all_own" ON naming_reports;
CREATE POLICY "naming_reports_select_all" ON naming_reports
  FOR SELECT USING (true);
CREATE POLICY "naming_reports_insert_own" ON naming_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_obtained_at ON user_cards(obtained_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_naming_requests_user_id ON naming_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_naming_reports_created_at ON naming_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_naming_reports_selected_name ON naming_reports(selected_name);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
