-- CLEANUP SCRIPT FOR anniesilver@gmail.com
-- Run these queries in Supabase SQL Editor

-- Step 1: VERIFY the user_id (DO NOT DELETE anything yet)
-- This shows you the user_id for anniesilver@gmail.com
SELECT id, email, created_at
FROM auth.users
WHERE email = 'anniesilver@gmail.com';

-- Step 2: CHECK how many tasks will be deleted (DO NOT DELETE anything yet)
-- Replace 'YOUR_USER_ID_HERE' with the id from Step 1
SELECT COUNT(*) as total_tasks, source_type, completed
FROM tasks
WHERE user_id = 'YOUR_USER_ID_HERE'
GROUP BY source_type, completed;

-- Step 3: PREVIEW the tasks that will be deleted
-- Replace 'YOUR_USER_ID_HERE' with the id from Step 1
SELECT id, text, source_type, completed, created_at
FROM tasks
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY created_at DESC
LIMIT 50;

-- Step 4: DELETE all tasks for anniesilver@gmail.com
-- ⚠️ WARNING: This will permanently delete ALL your tasks!
-- Replace 'YOUR_USER_ID_HERE' with the id from Step 1
DELETE FROM tasks
WHERE user_id = 'YOUR_USER_ID_HERE';

-- Step 5: VERIFY deletion (should return 0)
-- Replace 'YOUR_USER_ID_HERE' with the id from Step 1
SELECT COUNT(*) as remaining_tasks
FROM tasks
WHERE user_id = 'YOUR_USER_ID_HERE';
