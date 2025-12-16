-- ==========================================
-- FULL DATABASE RESET SCRIPT V2
-- ==========================================
-- WARNING: This will permanently delete ALL users and data!
-- Use this to start with a completely clean database.
-- ==========================================

-- Start transaction for safety
BEGIN;

-- Log the reset action
DO $$ 
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Starting database reset...';
  RAISE NOTICE 'This will delete ALL users and data!';
  RAISE NOTICE '========================================';
END $$;

-- Delete in correct order to respect foreign key constraints
-- Delete all prospects first
DELETE FROM prospects;
RAISE NOTICE 'Deleted % prospects', ROW_COUNT;

-- Delete all campaigns
DELETE FROM campaigns;
RAISE NOTICE 'Deleted % campaigns', ROW_COUNT;

-- Delete all businesses
DELETE FROM businesses;
RAISE NOTICE 'Deleted % businesses', ROW_COUNT;

-- Delete all user profiles
DELETE FROM user_profiles;
RAISE NOTICE 'Deleted % user profiles', ROW_COUNT;

-- Delete all users (this is the main table)
DELETE FROM users;
RAISE NOTICE 'Deleted % users', ROW_COUNT;

-- Reset all auto-increment sequences to start from 1
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS businesses_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS campaigns_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS prospects_id_seq RESTART WITH 1;

RAISE NOTICE 'Reset all ID sequences to start from 1';

-- Verify all tables are empty
DO $$ 
DECLARE
  user_count INT;
  profile_count INT;
  business_count INT;
  campaign_count INT;
  prospect_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO profile_count FROM user_profiles;
  SELECT COUNT(*) INTO business_count FROM businesses;
  SELECT COUNT(*) INTO campaign_count FROM campaigns;
  SELECT COUNT(*) INTO prospect_count FROM prospects;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database reset complete!';
  RAISE NOTICE 'Current counts:';
  RAISE NOTICE '  - Users: %', user_count;
  RAISE NOTICE '  - Profiles: %', profile_count;
  RAISE NOTICE '  - Businesses: %', business_count;
  RAISE NOTICE '  - Campaigns: %', campaign_count;
  RAISE NOTICE '  - Prospects: %', prospect_count;
  RAISE NOTICE '========================================';
  
  IF user_count = 0 AND profile_count = 0 AND business_count = 0 THEN
    RAISE NOTICE 'SUCCESS: Database is now clean and ready for fresh sign-ups!';
  ELSE
    RAISE WARNING 'Some tables still have data - check foreign key constraints';
  END IF;
END $$;

-- Commit the transaction
COMMIT;
