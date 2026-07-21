-- ============================================================================
-- Al Abakera EMS
-- Migration: Subjects API
-- Description: Public RPC used by the subjects management page
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.get_subjects_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity, academic
AS $$
DECLARE
    v_subjects JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', s.id,
            'name_ar', s.name_ar,
            'name_en', s.name_en,
            'code', s.code,
            'color', s.color,
            'description', s.description,
            'teacher_count', COALESCE(s.teacher_count, 0),
            'created_at', s.created_at
        )
        ORDER BY s.name_ar ASC
    ), '[]'::jsonb)
    INTO v_subjects
    FROM (
        SELECT 
            sub.id,
            sub.name_ar,
            sub.name_en,
            sub.code,
            sub.color,
            sub.description,
            sub.created_at,
            (
                SELECT COUNT(DISTINCT ts.teacher_id)
                FROM academic.teacher_subjects ts
                WHERE ts.subject_id = sub.id
            ) AS teacher_count
        FROM academic.subjects sub
    ) s;

    RETURN jsonb_build_object(
        'subjects', v_subjects,
        'errors', '[]'::jsonb
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_subjects_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_subjects_data() TO anon, authenticated;

COMMIT;