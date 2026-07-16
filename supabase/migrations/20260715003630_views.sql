-- ============================================================================
-- Al Abakera EMS
-- Migration: 0011_views
-- Description: Simplified data structures for Reports and Dashboard
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Student Financial Overview
-- Combines Student, Grade, and their current Balance
-- ============================================================================

CREATE OR REPLACE VIEW billing.view_student_balances AS
SELECT 
    p.id AS profile_id,
    p.full_name,
    s.student_code,
    g.name_ar AS grade_name,
    COALESCE(SUM(i.total_amount - i.discount_amount), 0) AS total_invoiced,
    COALESCE(SUM(i.paid_amount), 0) AS total_paid,
    COALESCE(SUM(i.remaining_amount), 0) AS current_balance,
    COUNT(CASE WHEN i.status = 'overdue' THEN 1 END) AS overdue_count
FROM identity.profiles p
JOIN academic.students s ON p.id = s.profile_id
LEFT JOIN academic.grades g ON s.grade_id = g.id
LEFT JOIN billing.invoices i ON s.profile_id = i.student_id
GROUP BY p.id, p.full_name, s.student_code, g.name_ar;

-- ============================================================================
-- 2. Monthly Revenue Analytics
-- Provides data for the "Revenue per Month" Chart
-- ============================================================================

CREATE OR REPLACE VIEW billing.view_monthly_revenue_stats AS
SELECT 
    center_id,
    DATE_TRUNC('month', billing_month)::DATE AS month,
    COUNT(id) AS invoice_count,
    SUM(total_amount - discount_amount) AS expected_revenue,
    SUM(paid_amount) AS collected_revenue,
    SUM(remaining_amount) AS outstanding_debt,
    ROUND((SUM(paid_amount) / NULLIF(SUM(total_amount - discount_amount), 0)) * 100, 2) AS collection_rate
FROM billing.invoices
WHERE status != 'cancelled'
GROUP BY center_id, 2;

-- ============================================================================
-- 3. Overdue Reminder Helper
-- Combines Invoice data with Parent Contact info for the WhatsApp system
-- ============================================================================

CREATE OR REPLACE VIEW notifications.view_pending_reminders_data AS
SELECT 
    i.id AS invoice_id,
    i.center_id,
    p.full_name AS student_name,
    par.full_name AS parent_name,
    par.whatsapp AS parent_whatsapp,
    i.billing_month,
    i.remaining_amount,
    i.due_date,
    -- Get list of items as a string for the WhatsApp template
    (SELECT STRING_AGG(description, ' + ') 
     FROM billing.invoice_items 
     WHERE invoice_id = i.id) AS item_details
FROM billing.invoices i
JOIN identity.profiles p ON i.student_id = p.id
JOIN academic.student_parents sp ON i.student_id = sp.student_id
JOIN academic.parents par ON sp.parent_id = par.id
WHERE i.status IN ('pending', 'partially_paid', 'overdue')
  AND i.remaining_amount > 0;

-- ============================================================================
-- 4. Teacher Statistics
-- Shows teacher performance and assigned groups
-- ============================================================================

CREATE OR REPLACE VIEW academic.view_teacher_stats AS
SELECT 
    p.id AS teacher_id,
    p.full_name,
    COUNT(DISTINCT g.id) AS active_groups,
    COUNT(DISTINCT e.student_id) AS total_students,
    SUM(g.monthly_price) AS potential_monthly_revenue
FROM identity.profiles p
JOIN academic.teachers t ON p.id = t.profile_id
LEFT JOIN academic.group_sessions gs ON t.profile_id = gs.teacher_id
LEFT JOIN academic.groups g ON gs.group_id = g.id
LEFT JOIN academic.enrollments e ON g.id = e.group_id
GROUP BY p.id, p.full_name;

-- ============================================================================
-- 5. Student Learning Overview
-- Combines enrollment, attendance, exam, and assignment progress.
-- ============================================================================

CREATE OR REPLACE VIEW academic.view_student_learning_progress AS
SELECT
    s.profile_id AS student_id,
    p.full_name,
    s.center_id,
    COUNT(DISTINCT e.group_id) FILTER (WHERE e.status = 'active') AS active_groups,
    COUNT(DISTINCT a.id) AS attendance_records,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'absent') AS absences,
    COUNT(DISTINCT er.id) AS graded_exams,
    ROUND(AVG(er.score), 2) AS average_exam_score,
    COUNT(DISTINCT sub.id) FILTER (WHERE sub.status IN ('submitted', 'late', 'graded', 'returned')) AS submitted_assignments
FROM academic.students s
JOIN identity.profiles p ON p.id = s.profile_id
LEFT JOIN academic.enrollments e ON e.student_id = s.profile_id
LEFT JOIN academic.attendance a ON a.student_id = s.profile_id
LEFT JOIN academic.exam_results er ON er.student_id = s.profile_id
LEFT JOIN academic.assignment_submissions sub ON sub.student_id = s.profile_id
GROUP BY s.profile_id, p.full_name, s.center_id;

COMMIT;
