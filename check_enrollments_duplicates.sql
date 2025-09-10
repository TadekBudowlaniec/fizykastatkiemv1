-- Check for duplicate records that would prevent adding UNIQUE constraint
-- Run this BEFORE adding the constraint to identify any data issues

SELECT user_id, course_id, COUNT(*) as duplicate_count
FROM enrollments 
GROUP BY user_id, course_id 
HAVING COUNT(*) > 1;

-- If this query returns any rows, you need to clean up duplicates first
-- Example cleanup (uncomment and modify as needed):
-- DELETE FROM enrollments 
-- WHERE id NOT IN (
--     SELECT MIN(id) 
--     FROM enrollments 
--     GROUP BY user_id, course_id
-- );