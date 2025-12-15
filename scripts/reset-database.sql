-- Reset Database Script
-- This will remove all users and related data from the database
-- WARNING: This is destructive and cannot be undone!

-- Delete all campaigns (which will also delete related prospects due to CASCADE)
DELETE FROM campaigns;

-- Delete all businesses
DELETE FROM businesses;

-- Delete all user profiles
DELETE FROM user_profiles;

-- Delete all users
DELETE FROM users;

-- Reset auto-increment counters (optional)
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE user_profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE businesses_id_seq RESTART WITH 1;
ALTER SEQUENCE campaigns_id_seq RESTART WITH 1;

-- Verify all tables are empty
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'businesses', COUNT(*) FROM businesses
UNION ALL
SELECT 'campaigns', COUNT(*) FROM campaigns;
