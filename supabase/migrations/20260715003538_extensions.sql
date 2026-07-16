-- ============================================================================
-- Al Abakera EMS
-- Migration: 0001_extensions
-- Description: PostgreSQL extensions required by the system
-- ============================================================================

BEGIN;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Better cryptographic functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Case-insensitive text
CREATE EXTENSION IF NOT EXISTS citext;

-- Enable Trigram support (Essential for fast Arabic name searching/filtering)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable Unaccent (Helps with searching text regardless of accents)
CREATE EXTENSION IF NOT EXISTS "unaccent";

COMMIT;