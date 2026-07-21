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
-- 4. Initialize Academic Stages
-- ============================================================================

WITH center_ref AS (SELECT id FROM core.centers WHERE code = 'ABAKERA01' LIMIT 1)
INSERT INTO academic.stages (center_id, name_ar, name_en, display_order, is_active)
VALUES 
((SELECT id FROM center_ref), 'المرحلة الابتدائية', 'Primary', 1, true),
((SELECT id FROM center_ref), 'المرحلة الإعدادية', 'Preparatory', 2, true),
((SELECT id FROM center_ref), 'المرحلة الثانوية', 'Secondary', 3, true);

-- ============================================================================
-- 5. Initialize Grades for ALL Stages
-- ============================================================================

-- Primary Stage Grades
WITH stage_ref AS (
    SELECT s.id 
    FROM academic.stages s 
    JOIN core.centers c ON s.center_id = c.id 
    WHERE c.code = 'ABAKERA01' AND s.name_en = 'Primary' 
    LIMIT 1
)
INSERT INTO academic.grades (stage_id, name_ar, name_en, display_order)
SELECT 
    (SELECT id FROM stage_ref),
    data.name_ar,
    data.name_en,
    data.display_order
FROM (
    VALUES 
        ('الصف الأول الابتدائي', '1st Primary', 1),
        ('الصف الثاني الابتدائي', '2nd Primary', 2),
        ('الصف الثالث الابتدائي', '3rd Primary', 3),
        ('الصف الرابع الابتدائي', '4th Primary', 4),
        ('الصف الخامس الابتدائي', '5th Primary', 5),
        ('الصف السادس الابتدائي', '6th Primary', 6)
) AS data(name_ar, name_en, display_order)
ON CONFLICT (stage_id, name_ar) DO NOTHING;

-- Preparatory Stage Grades
WITH stage_ref AS (
    SELECT s.id 
    FROM academic.stages s 
    JOIN core.centers c ON s.center_id = c.id 
    WHERE c.code = 'ABAKERA01' AND s.name_en = 'Preparatory' 
    LIMIT 1
)
INSERT INTO academic.grades (stage_id, name_ar, name_en, display_order)
SELECT 
    (SELECT id FROM stage_ref),
    data.name_ar,
    data.name_en,
    data.display_order
FROM (
    VALUES 
        ('الصف الأول الإعدادي', '1st Preparatory', 1),
        ('الصف الثاني الإعدادي', '2nd Preparatory', 2),
        ('الصف الثالث الإعدادي', '3rd Preparatory', 3)
) AS data(name_ar, name_en, display_order)
ON CONFLICT (stage_id, name_ar) DO NOTHING;

-- Secondary Stage Grades
WITH stage_ref AS (
    SELECT s.id 
    FROM academic.stages s 
    JOIN core.centers c ON s.center_id = c.id 
    WHERE c.code = 'ABAKERA01' AND s.name_en = 'Secondary' 
    LIMIT 1
)
INSERT INTO academic.grades (stage_id, name_ar, name_en, display_order)
SELECT 
    (SELECT id FROM stage_ref),
    data.name_ar,
    data.name_en,
    data.display_order
FROM (
    VALUES 
        ('الصف الأول الثانوي', '1st Secondary', 1),
        ('الصف الثاني الثانوي', '2nd Secondary', 2),
        ('الصف الثالث الثانوي', '3rd Secondary', 3)
) AS data(name_ar, name_en, display_order)
ON CONFLICT (stage_id, name_ar) DO NOTHING;

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
((SELECT id FROM center_ref), 'الأحياء', 'Biology', 'BIO', '#65a30d'),
((SELECT id FROM center_ref), 'التاريخ', 'History', 'HIST', '#f59e0b'),
((SELECT id FROM center_ref), 'الجغرافيا', 'Geography', 'GEO', '#8b5cf6'),
((SELECT id FROM center_ref), 'الفلسفة', 'Philosophy', 'PHIL', '#ec4899'),
((SELECT id FROM center_ref), 'علم النفس', 'Psychology', 'PSY', '#14b8a6');

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
((SELECT id FROM center_ref), 'ai_exam_generator', FALSE, '{}'::jsonb),
((SELECT id FROM center_ref), 'whatsapp_integration', FALSE, '{}'::jsonb);

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
),
(
    (SELECT id FROM center_ref),
    'payment_reminder_second',
    'مرحباً {{parent_name}}، نود تذكيركم بأن المبلغ المستحق {{remaining_amount}} عن الطالب {{student_name}} لشهر {{billing_month}} لم يتم سداده بعد. الرجاء الإسراع بالسداد لتجنب الإجراءات المتأخرة.',
    TRUE
),
(
    (SELECT id FROM center_ref),
    'payment_reminder_final',
    'مرحباً {{parent_name}}، هذا تذكير أخير بسداد المبلغ المستحق {{remaining_amount}} عن الطالب {{student_name}} لشهر {{billing_month}}. يرجى سداد المبلغ فوراً لتجنب تعليق الخدمات.',
    TRUE
),
(
    (SELECT id FROM center_ref),
    'welcome_student',
    'مرحباً {{student_name}}، تم تسجيلك بنجاح في نظام العباقرة التعليمي. بيانات الدخول الخاصة بك: البريد الإلكتروني: {{email}}، كلمة المرور: {{password}}',
    TRUE
);

-- ============================================================================
-- 10. Verify the data was inserted correctly
-- ============================================================================

DO $$ 
DECLARE
    v_center_id UUID;
    v_stage_count INTEGER;
    v_grade_count INTEGER;
BEGIN
    SELECT id INTO v_center_id FROM core.centers WHERE code = 'ABAKERA01' LIMIT 1;
    
    SELECT COUNT(*) INTO v_stage_count FROM academic.stages WHERE center_id = v_center_id;
    SELECT COUNT(*) INTO v_grade_count FROM academic.grades g 
    JOIN academic.stages s ON g.stage_id = s.id 
    WHERE s.center_id = v_center_id;
    
    RAISE NOTICE '✅ Seed data inserted successfully!';
    RAISE NOTICE '📚 Stages: %', v_stage_count;
    RAISE NOTICE '📚 Grades: %', v_grade_count;
    RAISE NOTICE '📚 Subjects: 10';
    RAISE NOTICE '📚 Feature Flags: 6';
    RAISE NOTICE '📚 Reminder Rules: 3';
    RAISE NOTICE '📚 WhatsApp Templates: 4';
    
    -- Display all stages and grades
    RAISE NOTICE '';
    RAISE NOTICE '📊 Stages and Grades Summary:';
    FOR r IN (
        SELECT 
            s.name_ar AS stage_name,
            COUNT(g.id) AS grade_count,
            STRING_AGG(g.name_ar, ', ' ORDER BY g.display_order) AS grades
        FROM academic.stages s
        LEFT JOIN academic.grades g ON g.stage_id = s.id
        WHERE s.center_id = v_center_id
        GROUP BY s.id, s.name_ar
        ORDER BY s.display_order
    ) LOOP
        RAISE NOTICE '  • %: % grades (%)', r.stage_name, r.grade_count, r.grades;
    END LOOP;
END $$;

COMMIT;