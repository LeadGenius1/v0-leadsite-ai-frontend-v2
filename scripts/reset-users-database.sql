-- ⚠️ WARNING: THIS WILL DELETE ALL USER DATA - USE WITH CAUTION ⚠️
-- This script removes all existing users and related data to start fresh

-- Delete all user-related data
DELETE FROM user_profiles;
DELETE FROM campaigns;
DELETE FROM prospects;
DELETE FROM email_stats;
DELETE FROM users;

-- Reset auto-increment sequences if needed
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS user_profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS campaigns_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS prospects_id_seq RESTART WITH 1;

-- Verify all tables are empty
SELECT 'users' as table_name, COUNT(*) as remaining_rows FROM users
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'campaigns', COUNT(*) FROM campaigns
UNION ALL
SELECT 'prospects', COUNT(*) FROM prospects;

-- Expected result: All counts should be 0
