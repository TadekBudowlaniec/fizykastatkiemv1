-- Simple fix for enrollments table
-- Add the missing UNIQUE constraint that the RPC function needs

ALTER TABLE enrollments ADD CONSTRAINT enrollments_user_course_unique UNIQUE (user_id, course_id);