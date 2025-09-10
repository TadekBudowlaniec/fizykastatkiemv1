-- Fix enrollments table - Add missing UNIQUE constraint
-- This script fixes the "there is no unique or exclusion constraint matching the ON CONFLICT specification" error

-- First, let's check if the constraint already exists
-- If it does, this will show an error but won't break anything
DO $$
BEGIN
    -- Try to add the unique constraint
    ALTER TABLE enrollments ADD CONSTRAINT enrollments_user_course_unique UNIQUE (user_id, course_id);
    RAISE NOTICE 'Unique constraint added successfully';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Unique constraint already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding constraint: %', SQLERRM;
END $$;

-- Verify the constraint exists
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'enrollments'::regclass 
AND contype = 'u';

-- Also verify the table structure
\d enrollments;