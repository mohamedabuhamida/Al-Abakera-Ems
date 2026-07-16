-- ============================================================================
-- Al Abakera EMS
-- Migration: 0004_identity
-- Description: Authentication & RBAC
-- ============================================================================

BEGIN;

-- ============================================================================
-- Profiles
-- Extends Supabase auth.users
-- ============================================================================

CREATE TABLE identity.profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    full_name TEXT NOT NULL,

    email CITEXT,

    phone TEXT,

    avatar_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE identity.profiles IS
'Application users linked to auth.users';

-- ============================================================================
-- Roles
-- ============================================================================

CREATE TABLE identity.roles (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL UNIQUE,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE identity.roles IS
'System roles';

-- ============================================================================
-- Profile Roles
-- ============================================================================

CREATE TABLE identity.profile_roles (

    profile_id UUID NOT NULL
        REFERENCES identity.profiles(id)
        ON DELETE CASCADE,

    role_id UUID NOT NULL
        REFERENCES identity.roles(id)
        ON DELETE CASCADE,

    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY(profile_id, role_id)
);

COMMENT ON TABLE identity.profile_roles IS
'Many-to-many relationship between users and roles';

-- ============================================================================
-- Center Members
-- Links users to centers
-- ============================================================================

CREATE TABLE identity.center_members (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    profile_id UUID NOT NULL
        REFERENCES identity.profiles(id)
        ON DELETE CASCADE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(center_id, profile_id)
);

COMMENT ON TABLE identity.center_members IS
'Users belonging to educational centers';

COMMIT;