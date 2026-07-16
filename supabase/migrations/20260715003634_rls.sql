-- ============================================================================
-- Al Abakera EMS
-- Migration: 0013_rls
-- Description: Row Level Security (Multi-tenant & Role-based Access)
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Security Helper Functions
-- These functions are used inside policies to check permissions efficiently.
-- ============================================================================

-- Check if current user is an Admin of a specific center
CREATE OR REPLACE FUNCTION identity.is_admin(p_center_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM identity.center_members cm
    JOIN identity.profile_roles pr ON cm.profile_id = pr.profile_id
    JOIN identity.roles r ON pr.role_id = r.id
    WHERE cm.profile_id = auth.uid()
      AND cm.center_id = p_center_id
      AND r.name = 'admin'
      AND cm.is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. Enable RLS on all tables
-- ============================================================================

-- Core Schema
ALTER TABLE core.centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.feature_flags ENABLE ROW LEVEL SECURITY;

-- Identity Schema
ALTER TABLE identity.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.profile_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.center_members ENABLE ROW LEVEL SECURITY;

-- Academic Schema
ALTER TABLE academic.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Billing Schema
ALTER TABLE billing.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing.payments ENABLE ROW LEVEL SECURITY;

-- Notifications Schema
ALTER TABLE notifications.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications.reminder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications.reminders ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. Define Access Policies
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CORE POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Admins can view and update their own center"
ON core.centers FOR ALL TO authenticated
USING ( identity.is_admin(id) );

CREATE POLICY "Admins manage center settings"
ON core.settings FOR ALL TO authenticated
USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage academic years"
ON core.academic_years FOR ALL TO authenticated
USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage feature flags"
ON core.feature_flags FOR ALL TO authenticated
USING ( identity.is_admin(center_id) );

-- ----------------------------------------------------------------------------
-- IDENTITY POLICIES
-- ----------------------------------------------------------------------------

CREATE POLICY "Users can view their own profile"
ON identity.profiles FOR SELECT TO authenticated
USING ( id = auth.uid() );

CREATE POLICY "Admins can view all profiles in their center"
ON identity.profiles FOR ALL TO authenticated
USING ( 
    EXISTS (
        SELECT 1 FROM identity.center_members 
        WHERE profile_id = identity.profiles.id 
        AND identity.is_admin(center_id)
    )
);

CREATE POLICY "Authenticated users can view role names"
ON identity.roles FOR SELECT TO authenticated
USING ( TRUE );

CREATE POLICY "Admins manage center members"
ON identity.center_members FOR ALL TO authenticated
USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage profile roles for their members"
ON identity.profile_roles FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM identity.center_members cm
        WHERE cm.profile_id = identity.profile_roles.profile_id
          AND identity.is_admin(cm.center_id)
    )
);

-- ----------------------------------------------------------------------------
-- ACADEMIC POLICIES (Admin Only for now)
-- ----------------------------------------------------------------------------

CREATE POLICY "Admins manage academic data"
ON academic.students FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage academic stages"
ON academic.stages FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage academic grades"
ON academic.grades FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM academic.stages s
        WHERE s.id = academic.grades.stage_id
          AND identity.is_admin(s.center_id)
    )
);

CREATE POLICY "Admins manage parents"
ON academic.parents FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage student parent links"
ON academic.student_parents FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM academic.students s
        WHERE s.profile_id = academic.student_parents.student_id
          AND identity.is_admin(s.center_id)
    )
);

CREATE POLICY "Admins manage teachers"
ON academic.teachers FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage subjects"
ON academic.subjects FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage teacher subjects"
ON academic.teacher_subjects FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM academic.teachers t
        WHERE t.profile_id = academic.teacher_subjects.teacher_id
          AND identity.is_admin(t.center_id)
    )
);

CREATE POLICY "Admins manage classrooms"
ON academic.classrooms FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage academic groups"
ON academic.groups FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage group sessions"
ON academic.group_sessions FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM academic.groups g
        WHERE g.id = academic.group_sessions.group_id
          AND identity.is_admin(g.center_id)
    )
);

CREATE POLICY "Admins manage lessons"
ON academic.lessons FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM academic.groups g
        WHERE g.id = academic.lessons.group_id
          AND identity.is_admin(g.center_id)
    )
);

CREATE POLICY "Admins manage lesson materials"
ON academic.lesson_materials FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM academic.lessons l
        JOIN academic.groups g ON g.id = l.group_id
        WHERE l.id = academic.lesson_materials.lesson_id
          AND identity.is_admin(g.center_id)
    )
);

CREATE POLICY "Admins manage enrollments"
ON academic.enrollments FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM academic.groups g
        WHERE g.id = academic.enrollments.group_id
          AND identity.is_admin(g.center_id)
    )
);

CREATE POLICY "Admins manage attendance"
ON academic.attendance FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM academic.lessons l
        JOIN academic.groups g ON g.id = l.group_id
        WHERE l.id = academic.attendance.lesson_id
          AND identity.is_admin(g.center_id)
    )
);

CREATE POLICY "Admins manage exams"
ON academic.exams FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage exam questions"
ON academic.exam_questions FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM academic.exams ex
        WHERE ex.id = academic.exam_questions.exam_id
          AND identity.is_admin(ex.center_id)
    )
);

CREATE POLICY "Admins manage exam results"
ON academic.exam_results FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM academic.exams ex
        WHERE ex.id = academic.exam_results.exam_id
          AND identity.is_admin(ex.center_id)
    )
);

CREATE POLICY "Admins manage assignments"
ON academic.assignments FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage assignment submissions"
ON academic.assignment_submissions FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM academic.assignments a
        WHERE a.id = academic.assignment_submissions.assignment_id
          AND identity.is_admin(a.center_id)
    )
);

-- ----------------------------------------------------------------------------
-- BILLING POLICIES (Admin Only)
-- ----------------------------------------------------------------------------

CREATE POLICY "Admins manage billing invoices"
ON billing.invoices FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage invoice items"
ON billing.invoice_items FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM billing.invoices i
        WHERE i.id = billing.invoice_items.invoice_id
          AND identity.is_admin(i.center_id)
    )
);

CREATE POLICY "Admins manage payments"
ON billing.payments FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

-- ----------------------------------------------------------------------------
-- NOTIFICATION POLICIES (Admin Only)
-- ----------------------------------------------------------------------------

CREATE POLICY "Admins manage whatsapp templates"
ON notifications.whatsapp_templates FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage reminder rules"
ON notifications.reminder_rules FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

CREATE POLICY "Admins manage reminders"
ON notifications.reminders FOR ALL TO authenticated USING ( identity.is_admin(center_id) );

-- ----------------------------------------------------------------------------
-- FUTURE PORTAL HOOKS (Placeholder for Students/Teachers)
-- ----------------------------------------------------------------------------

-- Example: Allow students to see their own invoices
-- CREATE POLICY "Students can view own invoices" 
-- ON billing.invoices FOR SELECT TO authenticated
-- USING ( student_id = auth.uid() );

COMMIT;
