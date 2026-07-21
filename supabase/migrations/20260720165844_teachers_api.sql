-- ============================================================================
-- Al Abakera EMS
-- Migration: Teachers API
-- Description: Public RPC used by the teachers management page
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.get_teachers_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity, academic
AS $$
DECLARE
    v_teachers JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', teacher.profile_id,
            'full_name', teacher.full_name,
            'email', teacher.email,
            'phone', teacher.phone,
            'avatar_url', teacher.avatar_url,
            'qualification', teacher.qualification,
            'salary_type', teacher.salary_type,
            'salary_value', teacher.salary_value,
            'status', teacher.status,
            'bio', teacher.bio,
            'subjects', teacher.subjects,
            'active_groups', teacher.active_groups,
            'total_students', teacher.total_students,
            'joined_at', teacher.joined_at,
            'profiles', jsonb_build_object('avatar_url', teacher.avatar_url)
        )
        ORDER BY teacher.joined_at DESC, teacher.full_name ASC
    ), '[]'::jsonb)
    INTO v_teachers
    FROM (
        SELECT
            t.profile_id,
            p.full_name,
            p.email,
            p.phone,
            p.avatar_url,
            t.qualification,
            t.salary_type,
            t.salary_value,
            t.status,
            t.bio,
            t.created_at AS joined_at,
            COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', s.id,
                            'name', s.name_ar,
                            'name_en', s.name_en,
                            'code', s.code,
                            'color', s.color
                        )
                    )
                    FROM academic.teacher_subjects ts
                    JOIN academic.subjects s ON s.id = ts.subject_id
                    WHERE ts.teacher_id = t.profile_id
                ),
                '[]'::jsonb
            ) AS subjects,
            COALESCE(teacher_stats.active_groups, 0) AS active_groups,
            COALESCE(teacher_stats.total_students, 0) AS total_students
        FROM academic.teachers t
        JOIN identity.profiles p ON p.id = t.profile_id
        LEFT JOIN LATERAL (
            SELECT
                COUNT(DISTINCT gs.group_id) AS active_groups,
                COUNT(DISTINCT e.student_id) AS total_students
            FROM academic.group_sessions gs
            JOIN academic.groups g ON g.id = gs.group_id
            LEFT JOIN academic.enrollments e ON e.group_id = g.id AND e.status = 'active'
            WHERE gs.teacher_id = t.profile_id
              AND g.status = 'active'
        ) teacher_stats ON TRUE
    ) teacher;

    RETURN jsonb_build_object(
        'teachers', v_teachers,
        'errors', '[]'::jsonb
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_teachers_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_teachers_data() TO anon, authenticated;

COMMIT;