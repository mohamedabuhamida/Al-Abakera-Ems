-- ============================================================================
-- Al Abakera EMS
-- Migration: Students API
-- Description: Public RPC used by the students registry page
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.get_students_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity, academic, billing
AS $$
DECLARE
    v_students JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', student.profile_id,
            'student_code', student.student_code,
            'full_name', student.full_name,
            'educational_stage', student.stage_name_ar,
            'grade', student.grade_name_ar,
            'parent_name', student.parent_name,
            'whatsapp_number', student.parent_whatsapp,
            'status', student.status,
            'registration_date', student.registration_date,
            'gender', student.gender,
            'school', student.school,
            'address', student.address,
            'active_groups', student.active_groups,
            'current_balance', student.current_balance,
            'overdue_count', student.overdue_count,
            'profiles', jsonb_build_object('avatar_url', student.avatar_url)
        )
        ORDER BY student.registration_date DESC, student.full_name ASC
    ), '[]'::jsonb)
    INTO v_students
    FROM (
        SELECT
            s.profile_id,
            s.student_code,
            p.full_name,
            p.avatar_url,
            g.name_ar AS grade_name_ar,
            st.name_ar AS stage_name_ar,
            parent_data.parent_name,
            parent_data.parent_whatsapp,
            s.status,
            s.registration_date,
            s.gender,
            s.school,
            s.address,
            COALESCE(progress.active_groups, 0) AS active_groups,
            COALESCE(balance.current_balance, 0) AS current_balance,
            COALESCE(balance.overdue_count, 0) AS overdue_count
        FROM academic.students s
        JOIN identity.profiles p ON p.id = s.profile_id
        LEFT JOIN academic.grades g ON g.id = s.grade_id
        LEFT JOIN academic.stages st ON st.id = g.stage_id
        LEFT JOIN LATERAL (
            SELECT
                par.full_name AS parent_name,
                par.whatsapp AS parent_whatsapp
            FROM academic.student_parents sp
            JOIN academic.parents par ON par.id = sp.parent_id
            WHERE sp.student_id = s.profile_id
            ORDER BY
                CASE sp.relationship
                    WHEN 'father' THEN 1
                    WHEN 'mother' THEN 2
                    ELSE 3
                END
            LIMIT 1
        ) parent_data ON TRUE
        LEFT JOIN academic.view_student_learning_progress progress
            ON progress.student_id = s.profile_id
        LEFT JOIN billing.view_student_balances balance
            ON balance.profile_id = s.profile_id
    ) student;

    RETURN jsonb_build_object(
        'students', v_students,
        'errors', '[]'::jsonb
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_students_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_students_data() TO anon, authenticated;

COMMIT;
