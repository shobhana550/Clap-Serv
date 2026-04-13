-- Manually Confirm User Email
-- Run this in Supabase SQL Editor to confirm your account

-- Step 1: Find your user ID (check first)
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'kaushal12081982@gmail.com';

-- Step 2: Manually confirm the email (FIXED - removed confirmed_at)
UPDATE auth.users
SET
  email_confirmed_at = NOW()
WHERE email = 'kaushal12081982@gmail.com';

-- Step 3: Verify it worked
SELECT id, email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email = 'kaushal12081982@gmail.com';

-- You should see timestamps in email_confirmed_at and confirmed_at columns
-- If you see timestamps, your account is now confirmed!
