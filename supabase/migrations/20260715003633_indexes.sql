-- ============================================================================
-- Al Abakera EMS
-- Migration: 0012_indexes
-- Description: Query optimization for search, filtering, and reporting
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Identity & Search Optimization
-- Uses GIN (Generalized Inverted Index) for fast fuzzy searching in Arabic names
-- ============================================================================

-- Fast search for Student/Teacher names
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm 
ON identity.profiles USING gin (full_name gin_trgm_ops);

-- Fast search for Parent names and contact info
CREATE INDEX IF NOT EXISTS idx_parents_name_trgm 
ON academic.parents USING gin (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_parents_contact 
ON academic.parents (phone, whatsapp);

-- Student code lookups (Exact match)
CREATE INDEX IF NOT EXISTS idx_students_code 
ON academic.students (student_code);

-- ============================================================================
-- 2. Financial & Billing Optimization
-- Speeds up Dashboard stats and Unpaid Student reports
-- ============================================================================

-- Filtering invoices by month and status
CREATE INDEX IF NOT EXISTS idx_invoices_lookup 
ON billing.invoices (center_id, billing_month, status);

-- Prevent duplicate monthly invoices for the same student
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_student_month_unique
ON billing.invoices (center_id, student_id, billing_month)
WHERE status != 'cancelled';

-- Finding overdue invoices quickly
CREATE INDEX IF NOT EXISTS idx_invoices_overdue 
ON billing.invoices (status, due_date) 
WHERE status = 'overdue' OR status = 'pending';

-- Payment history sorting
CREATE INDEX IF NOT EXISTS idx_payments_date 
ON billing.payments (payment_date DESC);

-- ============================================================================
-- 3. Academic & Operational Optimization
-- ============================================================================

-- Active groups filtering
CREATE INDEX IF NOT EXISTS idx_groups_active 
ON academic.groups (center_id, status) 
WHERE status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS idx_subjects_center_code_unique
ON academic.subjects (center_id, code)
WHERE code IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_classrooms_center_name_unique
ON academic.classrooms (center_id, name);

-- Quick lookup for group sessions (The Weekly Schedule)
CREATE INDEX IF NOT EXISTS idx_sessions_schedule 
ON academic.group_sessions (group_id, weekday, start_time);

-- Lesson timeline and material ordering
CREATE INDEX IF NOT EXISTS idx_lessons_group_date
ON academic.lessons (group_id, lesson_date DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_materials_order
ON academic.lesson_materials (lesson_id, display_order);

-- Enrollment lookups for attendance/billing
CREATE INDEX IF NOT EXISTS idx_enrollments_lookup 
ON academic.enrollments (group_id, student_id, status);

-- Attendance reporting
CREATE INDEX IF NOT EXISTS idx_attendance_student
ON academic.attendance (student_id, marked_at DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_lesson_status
ON academic.attendance (lesson_id, status);

-- Exam and assignment reporting
CREATE INDEX IF NOT EXISTS idx_exams_group
ON academic.exams (group_id, is_published, starts_at);

CREATE INDEX IF NOT EXISTS idx_exam_results_student
ON academic.exam_results (student_id, graded_at DESC);

CREATE INDEX IF NOT EXISTS idx_assignments_group
ON academic.assignments (group_id, status, due_at);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student
ON academic.assignment_submissions (student_id, status, submitted_at DESC);

-- ============================================================================
-- 4. Notification Queue Optimization
-- ============================================================================

-- Processing the reminder queue
CREATE INDEX IF NOT EXISTS idx_reminders_queue 
ON notifications.reminders (status, scheduled_for) 
WHERE status = 'pending' OR status = 'scheduled';

COMMIT;
