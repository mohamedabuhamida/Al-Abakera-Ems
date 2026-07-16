-- ============================================================================
-- Al Abakera EMS
-- Migration: 0008_settings
-- Description: Operational configurations and module toggles
-- ============================================================================

BEGIN;

-- ============================================================================
-- Academic Years
-- Defines the current active academic period (e.g., 2024/2025)
-- ============================================================================

CREATE TABLE core.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL, -- e.g., "2024 - 2025"
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    is_current BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure only one year is marked as current per center while allowing many past years.
CREATE UNIQUE INDEX idx_academic_years_one_current
ON core.academic_years(center_id)
WHERE is_current = TRUE;

-- ============================================================================
-- Billing & Automation Settings
-- Configures the "Brain" of the financial system
-- ============================================================================

ALTER TABLE core.settings 
ADD COLUMN IF NOT EXISTS auto_invoice_generation_day INTEGER DEFAULT 1, -- Day of month to generate
ADD COLUMN IF NOT EXISTS default_due_days INTEGER DEFAULT 5,           -- Days after generation
ADD COLUMN IF NOT EXISTS currency_symbol TEXT DEFAULT 'ج.م',
ADD COLUMN IF NOT EXISTS whatsapp_provider_config JSONB DEFAULT '{
    "provider": "meta_cloud_api",
    "is_active": false,
    "api_version": "v19.0"
}'::jsonb;

-- ============================================================================
-- Feature Toggles
-- Architecture-ready for future portals and AI
-- ============================================================================

CREATE TABLE core.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    feature_name TEXT NOT NULL, -- e.g., 'student_portal', 'ai_exam_generator'
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    
    config JSONB DEFAULT '{}'::jsonb,

    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(center_id, feature_name)
);

-- ============================================================================
-- Seed Default Flags
-- Prepares the system for the Admin-only stage
-- ============================================================================

-- This allows us to check in the UI if a module should be visible or hidden
COMMENT ON TABLE core.feature_flags IS
'Enables/Disables modular parts of the LMS (Teacher Portal, Student Portal, AI features)';

COMMIT;
