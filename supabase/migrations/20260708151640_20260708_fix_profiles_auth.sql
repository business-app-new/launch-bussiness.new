-- Fix profiles table to work without auth.users

-- Drop the foreign key constraint that references auth.users
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Make id auto-generated
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Make phone NOT NULL (required for phone-based auth)
UPDATE profiles SET phone = 'legacy_' || id::text WHERE phone IS NULL;

-- Now make phone NOT NULL
ALTER TABLE profiles ALTER COLUMN phone SET NOT NULL;