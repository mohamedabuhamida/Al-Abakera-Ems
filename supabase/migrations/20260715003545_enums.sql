-- ====================================================================================
-- 2. ENUMS
-- Purpose: Define fixed values for the entire system to prevent data entry errors.
-- ====================================================================================

-- User Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'parent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Gender
DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('male', 'female');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Financial: Invoice Status
DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('pending', 'partially_paid', 'paid', 'overdue', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Financial: Payment Methods
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'instapay', 'bank_transfer', 'wallet', 'credit_card');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Notifications: Reminder Status
DO $$ BEGIN
    CREATE TYPE reminder_status AS ENUM ('pending', 'scheduled', 'sent', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- HR: Teacher Salary Models
DO $$ BEGIN
    CREATE TYPE salary_type AS ENUM ('fixed', 'per_student', 'percentage', 'per_session');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Academic: Student Status
DO $$ BEGIN
    CREATE TYPE student_status AS ENUM ('active', 'inactive', 'graduated', 'suspended', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Academic: Teacher Status
DO $$ BEGIN
    CREATE TYPE teacher_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Academic: Group Status
DO $$ BEGIN
    CREATE TYPE group_status AS ENUM ('active', 'inactive', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Academic: Enrollment Status
DO $$ BEGIN
    CREATE TYPE enrollment_status AS ENUM ('active', 'paused', 'completed', 'cancelled', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Academic: Attendance Status
DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Academic: Exam Types
DO $$ BEGIN
    CREATE TYPE exam_type AS ENUM ('quiz', 'monthly_test', 'mid_term', 'final');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Academic: Assignment Status
DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM ('draft', 'published', 'closed', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Academic: Submission Status
DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('not_submitted', 'submitted', 'late', 'graded', 'returned');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Academic: Lesson Material Types
DO $$ BEGIN
    CREATE TYPE material_type AS ENUM ('file', 'video', 'link', 'text', 'quiz');
EXCEPTION WHEN duplicate_object THEN null; END $$;
