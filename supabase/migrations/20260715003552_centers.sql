-- ============================================================================
-- Al Abakera EMS
-- Migration: 0003_centers
-- Description: Core schema and tenant management
-- ============================================================================

BEGIN;

-- ============================================================================
-- Schemas
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS academic;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS notifications;

-- ============================================================================
-- Centers
-- ============================================================================

CREATE TABLE core.centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,

    logo_url TEXT,

    email CITEXT,
    phone TEXT,

    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Egypt',

    currency TEXT NOT NULL DEFAULT 'EGP',
    timezone TEXT NOT NULL DEFAULT 'Africa/Cairo',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE core.centers IS
'Educational centers (Multi Tenant support)';

COMMENT ON COLUMN core.centers.code IS
'Unique center identifier';

-- ============================================================================
-- Settings
-- ============================================================================

CREATE TABLE core.settings (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    invoice_prefix TEXT DEFAULT 'INV',

    receipt_footer TEXT,

    whatsapp_number TEXT,

    reminder_first_days INTEGER DEFAULT 3,

    reminder_second_days INTEGER DEFAULT 7,

    reminder_final_days INTEGER DEFAULT 14,

    created_at TIMESTAMPTZ DEFAULT now(),

    updated_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(center_id)
);

COMMIT;