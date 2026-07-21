-- ============================================================================
-- Al Abakera EMS
-- Migration: Groups API
-- Description: Public RPC used by the groups management page
-- ============================================================================

BEGIN;

-- Get groups with their details
CREATE OR REPLACE FUNCTION public.get_groups_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity, academic
AS $$
DECLARE
    result JSONB;
BEGIN
    WITH group_details AS (
        SELECT 
            g.id,
            g.name,
            g.description,
            g.capacity,
            g.monthly_price,
            g.status,
            g.created_at,
            g.updated_at,
            g.center_id,
            -- Subject details
            jsonb_build_object(
                'id', s.id,
                'name_ar', s.name_ar,
                'name_en', s.name_en,
                'code', s.code,
                'color', s.color
            ) AS subject,
            -- Grade details
            jsonb_build_object(
                'id', gr.id,
                'name_ar', gr.name_ar,
                'name_en', gr.name_en
            ) AS grade,
            -- Teacher details (from sessions)
            (
                SELECT jsonb_agg(DISTINCT jsonb_build_object(
                    'id', t.profile_id,
                    'full_name', p.full_name,
                    'email', p.email
                ))
                FROM academic.group_sessions gs
                JOIN academic.teachers t ON t.profile_id = gs.teacher_id
                JOIN identity.profiles p ON p.id = t.profile_id
                WHERE gs.group_id = g.id
            ) AS teachers,
            -- Enrollment count
            (
                SELECT COUNT(DISTINCT student_id)
                FROM academic.enrollments e
                WHERE e.group_id = g.id
                  AND e.status = 'active'
            ) AS enrolled_students
        FROM academic.groups g
        JOIN academic.subjects s ON s.id = g.subject_id
        JOIN academic.grades gr ON gr.id = g.grade_id
    )
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', gd.id,
            'name', gd.name,
            'description', gd.description,
            'capacity', gd.capacity,
            'monthly_price', gd.monthly_price,
            'status', gd.status,
            'created_at', gd.created_at,
            'updated_at', gd.updated_at,
            'subject', gd.subject,
            'grade', gd.grade,
            'teachers', COALESCE(gd.teachers, '[]'::jsonb),
            'enrolled_students', gd.enrolled_students,
            'available_slots', gd.capacity - gd.enrolled_students
        )
        ORDER BY gd.name ASC
    ), '[]'::jsonb)
    INTO result
    FROM group_details gd;

    RETURN jsonb_build_object(
        'groups', result,
        'errors', '[]'::jsonb
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_groups_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_groups_data() TO anon, authenticated;

-- Get sessions for a specific group
CREATE OR REPLACE FUNCTION public.get_group_sessions(p_group_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity, academic
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', gs.id,
            'weekday', gs.weekday,
            'start_time', gs.start_time,
            'end_time', gs.end_time,
            'teacher', jsonb_build_object(
                'id', t.profile_id,
                'full_name', p.full_name,
                'email', p.email
            ),
            'classroom', jsonb_build_object(
                'id', c.id,
                'name', c.name
            )
        )
        ORDER BY gs.weekday, gs.start_time
    ), '[]'::jsonb)
    INTO result
    FROM academic.group_sessions gs
    JOIN academic.teachers t ON t.profile_id = gs.teacher_id
    JOIN identity.profiles p ON p.id = t.profile_id
    LEFT JOIN academic.classrooms c ON c.id = gs.classroom_id
    WHERE gs.group_id = p_group_id;

    RETURN jsonb_build_object(
        'sessions', result,
        'errors', '[]'::jsonb
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_group_sessions(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_group_sessions(UUID) TO anon, authenticated;

-- Get students in a group
CREATE OR REPLACE FUNCTION public.get_group_students(p_group_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity, academic
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', s.profile_id,
            'full_name', p.full_name,
            'email', p.email,
            'phone', p.phone,
            'status', e.status,
            'enrolled_at', e.enrolled_at
        )
        ORDER BY p.full_name ASC
    ), '[]'::jsonb)
    INTO result
    FROM academic.enrollments e
    JOIN academic.students s ON s.profile_id = e.student_id
    JOIN identity.profiles p ON p.id = s.profile_id
    WHERE e.group_id = p_group_id;

    RETURN jsonb_build_object(
        'students', result,
        'errors', '[]'::jsonb
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_group_students(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_group_students(UUID) TO anon, authenticated;

COMMIT;