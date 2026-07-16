-- ============================================================================
-- Al Abakera EMS
-- Migration: 0014_seed
-- Description: Initial system configuration and master data
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Initialize System Roles
-- ============================================================================

INSERT INTO identity.roles (name, description) VALUES
('admin', 'مدير النظام - كامل الصلاحيات'),
('teacher', 'معلم - صلاحيات إدارة المجموعات والطلاب والدرجات'),
('student', 'طالب - صلاحيات عرض المواد والدرجات والفواتير'),
('parent', 'ولي أمر - صلاحيات متابعة الطلاب والفواتير');

-- ============================================================================
-- 2. Initialize the Primary Center (Al Abakera)
-- ============================================================================

INSERT INTO core.centers (name, code, city, currency, timezone)
VALUES ('العباقرة', 'ABAKERA01', 'القاهرة', 'EGP', 'Africa/Cairo');

-- ============================================================================
-- 3. Initialize Default Settings
-- We use a sub-query to link settings to the center we just created
-- ============================================================================

INSERT INTO core.settings (
    center_id, 
    invoice_prefix, 
    reminder_first_days, 
    reminder_second_days, 
    reminder_final_days
)
SELECT 
    id, 
    'INV-', 
    3, 
    7, 
    14 
FROM core.centers 
WHERE code = 'ABAKERA01';

-- ============================================================================
-- 4. Initialize Academic Stages (Optional but recommended for start)
-- ============================================================================

WITH center_ref AS (SELECT id FROM core.centers WHERE code = 'ABAKERA01' LIMIT 1)
INSERT INTO academic.stages (center_id, name_ar, name_en, display_order)
VALUES 
((SELECT id FROM center_ref), 'المرحلة الابتدائية', 'Primary', 1),
((SELECT id FROM center_ref), 'المرحلة الإعدادية', 'Preparatory', 2),
((SELECT id FROM center_ref), 'المرحلة الثانوية', 'Secondary', 3);

-- ============================================================================
-- 5. Initialize Grades for the Secondary Stage
-- ============================================================================

WITH stage_ref AS (
    SELECT s.id 
    FROM academic.stages s 
    JOIN core.centers c ON s.center_id = c.id 
    WHERE c.code = 'ABAKERA01' AND s.name_en = 'Secondary' 
    LIMIT 1
)
INSERT INTO academic.grades (stage_id, name_ar, name_en, display_order)
VALUES 
((SELECT id FROM stage_ref), 'الصف الأول الثانوي', '1st Secondary', 1),
((SELECT id FROM stage_ref), 'الصف الثاني الثانوي', '2nd Secondary', 2),
((SELECT id FROM stage_ref), 'الصف الثالث الثانوي', '3rd Secondary', 3);

-- ============================================================================
-- 6. Initialize Current Academic Year
-- ============================================================================

WITH center_ref AS (SELECT id FROM core.centers WHERE code = 'ABAKERA01' LIMIT 1)
INSERT INTO core.academic_years (center_id, name, start_date, end_date, is_current)
VALUES
((SELECT id FROM center_ref), '2026 - 2027', DATE '2026-09-01', DATE '2027-06-30', TRUE);

-- ============================================================================
-- 7. Initialize Common Subjects
-- ============================================================================

WITH center_ref AS (SELECT id FROM core.centers WHERE code = 'ABAKERA01' LIMIT 1)
INSERT INTO academic.subjects (center_id, name_ar, name_en, code, color)
VALUES
((SELECT id FROM center_ref), 'اللغة العربية', 'Arabic', 'AR', '#16a34a'),
((SELECT id FROM center_ref), 'اللغة الإنجليزية', 'English', 'EN', '#2563eb'),
((SELECT id FROM center_ref), 'الرياضيات', 'Mathematics', 'MATH', '#dc2626'),
((SELECT id FROM center_ref), 'الفيزياء', 'Physics', 'PHY', '#7c3aed'),
((SELECT id FROM center_ref), 'الكيمياء', 'Chemistry', 'CHEM', '#0891b2'),
((SELECT id FROM center_ref), 'الأحياء', 'Biology', 'BIO', '#65a30d');

-- ============================================================================
-- 8. Initialize Feature Flags
-- ============================================================================

WITH center_ref AS (SELECT id FROM core.centers WHERE code = 'ABAKERA01' LIMIT 1)
INSERT INTO core.feature_flags (center_id, feature_name, is_enabled, config)
VALUES
((SELECT id FROM center_ref), 'admin_dashboard', TRUE, '{}'::jsonb),
((SELECT id FROM center_ref), 'teacher_portal', FALSE, '{}'::jsonb),
((SELECT id FROM center_ref), 'student_portal', FALSE, '{}'::jsonb),
((SELECT id FROM center_ref), 'parent_portal', FALSE, '{}'::jsonb),
((SELECT id FROM center_ref), 'ai_exam_generator', FALSE, '{}'::jsonb);

-- ============================================================================
-- 9. Initialize Reminder Rules and Template
-- ============================================================================

WITH center_ref AS (SELECT id FROM core.centers WHERE code = 'ABAKERA01' LIMIT 1)
INSERT INTO notifications.reminder_rules (center_id, days_after_due, reminder_level, is_enabled)
VALUES
((SELECT id FROM center_ref), 3, 1, TRUE),
((SELECT id FROM center_ref), 7, 2, TRUE),
((SELECT id FROM center_ref), 14, 3, TRUE);

WITH center_ref AS (SELECT id FROM core.centers WHERE code = 'ABAKERA01' LIMIT 1)
INSERT INTO notifications.whatsapp_templates (center_id, name, body, is_active)
VALUES
(
    (SELECT id FROM center_ref),
    'payment_reminder_default',
    'مرحباً {{parent_name}}، نذكركم بسداد مبلغ {{remaining_amount}} عن الطالب {{student_name}} لشهر {{billing_month}}. التفاصيل: {{item_details}}',
    TRUE
);

COMMIT;
