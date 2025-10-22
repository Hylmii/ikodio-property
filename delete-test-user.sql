-- Delete user with email hylmir25@gmail.com
-- Run this in Prisma Studio Query or via psql

-- Check if user exists
SELECT id, email, name, role, "isVerified" 
FROM "User" 
WHERE email = 'hylmir25@gmail.com';

-- Delete the user (will cascade delete related records)
DELETE FROM "User" 
WHERE email = 'hylmir25@gmail.com';

-- Verify deletion
SELECT COUNT(*) as remaining_users 
FROM "User" 
WHERE email = 'hylmir25@gmail.com';
-- Should return 0
