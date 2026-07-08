/*
# Create profiles and websites tables for Launch Business

1. New Tables
- `profiles`: Stores user account metadata (email, subscription status, website count, phone, Stripe links).
  - `id` (uuid, PK, references auth.users)
  - `email` (text, not null)
  - `sub_status` (text, one of free/premium_500/premium_1000/premium_1500, default free)
  - `websites_count` (integer, default 0)
  - `phone` (text, unique, optional)
  - `subscription_active` (boolean, default true)
  - `subscription_expires_at` (timestamptz, optional)
  - `stripe_customer_id` (text, optional)
  - `stripe_subscription_id` (text, optional)
  - `created_at` (timestamptz, default now())
- `websites`: Stores generated business websites with full content for the 5-page portal.
  - `id` (uuid, PK)
  - `user_id` (uuid, references auth.users, defaults to auth.uid())
  - `name`, `type`, `city`, `whatsapp`, `address`, `lang`, `headline`, `tagline`, `about` (text)
  - `services` (jsonb, default [])
  - `slug` (text, unique)
  - `is_published` (boolean, default false)
  - `palette` (text, default blue)
  - `pages` (jsonb, home/selling/prize flags)
  - `selling_content`, `prize_content` (text)
  - `selling_items`, `prize_items` (jsonb, default [])
  - `webapp_data` (jsonb, default {})
  - `webapp_content` (text)
  - `created_at` (timestamptz, default now())

2. Security
- RLS enabled on both tables.
- profiles: owner-scoped CRUD (auth.uid() = id).
- websites: owner-scoped CRUD for authenticated users; anon+authenticated can SELECT published sites.
- A SECURITY DEFINER function `increment_websites_count` bumps the owner's website counter.

3. Indexes
- websites(slug), websites(user_id), profiles(phone)
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  sub_status text NOT NULL DEFAULT 'free' CHECK (sub_status IN ('free', 'premium_500', 'premium_1000', 'premium_1500')),
  websites_count integer NOT NULL DEFAULT 0,
  phone text UNIQUE,
  subscription_active boolean DEFAULT true,
  subscription_expires_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Websites table
CREATE TABLE IF NOT EXISTS websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text,
  city text,
  whatsapp text,
  address text,
  lang text NOT NULL DEFAULT 'en',
  services jsonb DEFAULT '[]'::jsonb,
  headline text,
  tagline text,
  about text,
  slug text UNIQUE,
  is_published boolean NOT NULL DEFAULT false,
  palette text DEFAULT 'blue',
  pages jsonb DEFAULT '{"home": true, "selling": false, "prize": false}'::jsonb,
  selling_content text,
  prize_content text,
  selling_items jsonb DEFAULT '[]'::jsonb,
  prize_items jsonb DEFAULT '[]'::jsonb,
  webapp_data jsonb DEFAULT '{}'::jsonb,
  webapp_content text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_websites" ON websites;
CREATE POLICY "select_own_websites" ON websites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_websites" ON websites;
CREATE POLICY "insert_own_websites" ON websites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_websites" ON websites;
CREATE POLICY "update_own_websites" ON websites FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_websites" ON websites;
CREATE POLICY "delete_own_websites" ON websites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "view_published_websites" ON websites;
CREATE POLICY "view_published_websites" ON websites FOR SELECT
  TO anon, authenticated USING (is_published = true);

CREATE INDEX IF NOT EXISTS idx_websites_slug ON websites(slug);
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);

-- Helper to bump website count
CREATE OR REPLACE FUNCTION increment_websites_count(owner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET websites_count = websites_count + 1
  WHERE id = owner_id;
END;
$$;
