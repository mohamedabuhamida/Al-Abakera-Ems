-- ============================================================================
-- Al Abakera EMS
-- Migration: Current User Signup Security
-- Description: Complete signup from auth.uid() and restrict legacy helper
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.complete_current_user_signup(
    p_phone TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity, auth
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_email CITEXT;
    v_metadata JSONB;
    v_full_name TEXT;
    v_phone TEXT;
    v_center_id UUID;
    v_role_id UUID;
    v_role TEXT;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authenticated user is required';
    END IF;

    SELECT email::CITEXT, raw_user_meta_data
    INTO v_email, v_metadata
    FROM auth.users
    WHERE id = v_user_id;

    IF v_email IS NULL THEN
        RAISE EXCEPTION 'Auth user was not found';
    END IF;

    v_full_name := COALESCE(
        NULLIF(v_metadata->>'full_name', ''),
        v_email::TEXT,
        'New user'
    );
    v_phone := COALESCE(NULLIF(p_phone, ''), NULLIF(v_metadata->>'phone', ''));
    v_role := COALESCE(NULLIF(v_metadata->>'role', ''), 'student');

    IF v_role NOT IN ('admin', 'teacher', 'student', 'parent') THEN
        v_role := 'student';
    END IF;

    SELECT id INTO v_center_id
    FROM core.centers
    WHERE code = 'ABAKERA01'
    LIMIT 1;

    IF v_center_id IS NULL THEN
        RAISE EXCEPTION 'Primary center ABAKERA01 was not found';
    END IF;

    SELECT id INTO v_role_id
    FROM identity.roles
    WHERE name = v_role
    LIMIT 1;

    IF v_role_id IS NULL THEN
        INSERT INTO identity.roles (name, description)
        VALUES (v_role, v_role)
        RETURNING id INTO v_role_id;
    END IF;

    INSERT INTO identity.profiles (id, full_name, email, phone)
    VALUES (v_user_id, v_full_name, v_email, v_phone)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        is_active = TRUE,
        updated_at = now();

    INSERT INTO identity.center_members (center_id, profile_id, is_active)
    VALUES (v_center_id, v_user_id, TRUE)
    ON CONFLICT (center_id, profile_id) DO UPDATE SET
        is_active = TRUE;

    DELETE FROM identity.profile_roles WHERE profile_id = v_user_id;

    INSERT INTO identity.profile_roles (profile_id, role_id)
    VALUES (v_user_id, v_role_id)
    ON CONFLICT DO NOTHING;

    RETURN jsonb_build_object(
        'userId', v_user_id,
        'fullName', v_full_name,
        'email', v_email,
        'isActive', TRUE,
        'role', v_role,
        'centerId', v_center_id
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_user_signup(
    p_user_id UUID,
    p_full_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity
AS $$
DECLARE
    v_center_id UUID;
    v_role_id UUID;
    v_role TEXT := COALESCE(NULLIF(p_role, ''), 'student');
BEGIN
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'Users can only complete their own signup';
    END IF;

    IF v_role NOT IN ('admin', 'teacher', 'student', 'parent') THEN
        v_role := 'student';
    END IF;

    SELECT id INTO v_center_id
    FROM core.centers
    WHERE code = 'ABAKERA01'
    LIMIT 1;

    IF v_center_id IS NULL THEN
        RAISE EXCEPTION 'Primary center ABAKERA01 was not found';
    END IF;

    SELECT id INTO v_role_id
    FROM identity.roles
    WHERE name = v_role
    LIMIT 1;

    IF v_role_id IS NULL THEN
        INSERT INTO identity.roles (name, description)
        VALUES (v_role, v_role)
        RETURNING id INTO v_role_id;
    END IF;

    INSERT INTO identity.profiles (id, full_name, email, phone)
    VALUES (
        p_user_id,
        COALESCE(NULLIF(p_full_name, ''), p_email, 'New user'),
        NULLIF(p_email, '')::CITEXT,
        NULLIF(p_phone, '')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        is_active = TRUE,
        updated_at = now();

    INSERT INTO identity.center_members (center_id, profile_id, is_active)
    VALUES (v_center_id, p_user_id, TRUE)
    ON CONFLICT (center_id, profile_id) DO UPDATE SET
        is_active = TRUE;

    DELETE FROM identity.profile_roles WHERE profile_id = p_user_id;

    INSERT INTO identity.profile_roles (profile_id, role_id)
    VALUES (p_user_id, v_role_id)
    ON CONFLICT DO NOTHING;

    RETURN jsonb_build_object(
        'userId', p_user_id,
        'fullName', COALESCE(NULLIF(p_full_name, ''), p_email, 'New user'),
        'email', NULLIF(p_email, ''),
        'isActive', TRUE,
        'role', v_role,
        'centerId', v_center_id
    );
END;
$$;

REVOKE ALL ON FUNCTION public.complete_current_user_signup(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_user_signup(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_current_user_signup(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_user_signup(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;

COMMIT;
