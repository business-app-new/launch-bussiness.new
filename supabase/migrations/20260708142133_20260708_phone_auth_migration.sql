-- Add phone column to websites and update policies for phone-based access

-- Add phone_number column to websites table
ALTER TABLE websites ADD COLUMN IF NOT EXISTS phone_number text;
CREATE INDEX IF NOT EXISTS idx_websites_phone ON websites(phone_number);

-- Make user_id nullable
ALTER TABLE websites ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE websites ALTER COLUMN user_id DROP DEFAULT;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "select_own_websites" ON websites;
DROP POLICY IF EXISTS "insert_own_websites" ON websites;
DROP POLICY IF EXISTS "update_own_websites" ON websites;
DROP POLICY IF EXISTS "delete_own_websites" ON websites;
DROP POLICY IF EXISTS "view_published_websites" ON websites;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "update_own_profile" ON profiles;

-- Create open policies for anon access (phone-based auth)
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "websites_select" ON websites FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "websites_insert" ON websites FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "websites_update" ON websites FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "websites_delete" ON websites FOR DELETE TO anon, authenticated USING (true);

-- Make profiles.id auto-generated (not tied to auth.users)
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Create function to increment website count by phone
CREATE OR REPLACE FUNCTION increment_websites_count_by_phone(p_phone text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET websites_count = websites_count + 1
  WHERE phone = p_phone;
END;
$$;