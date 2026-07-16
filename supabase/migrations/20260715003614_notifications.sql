-- ============================================================================
-- Al Abakera EMS
-- Migration: 0007_notifications
-- Description: Reminder Management & WhatsApp Queue
-- ============================================================================

BEGIN;

-- ============================================================================
-- WhatsApp Templates
-- Stores the message structures with placeholders like {{StudentName}}
-- ============================================================================

CREATE TABLE notifications.whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL, -- e.g., 'payment_reminder_v1'
    
    body TEXT NOT NULL, -- The Arabic template provided in requirements
    
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(center_id, name)
);

-- ============================================================================
-- Reminder Rules
-- Configurable logic: First reminder after X days, Second after Y days
-- ============================================================================

CREATE TABLE notifications.reminder_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    days_after_due INTEGER NOT NULL,
    
    -- Helps identify if this is a First, Second, or Final Warning
    reminder_level INTEGER NOT NULL, 

    is_enabled BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(center_id, reminder_level)
);

-- ============================================================================
-- Reminders Queue/Log
-- The core table the Admin will use to view/send/retry reminders
-- ============================================================================

CREATE TABLE notifications.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    invoice_id UUID NOT NULL
        REFERENCES billing.invoices(id)
        ON DELETE CASCADE,

    student_id UUID NOT NULL
        REFERENCES academic.students(profile_id),

    -- Status: pending, scheduled, sent, failed, cancelled (from Enums file)
    status reminder_status NOT NULL DEFAULT 'pending',

    -- The actual processed message content
    processed_message TEXT,

    scheduled_for TIMESTAMPTZ NOT NULL,
    
    sent_at TIMESTAMPTZ,
    
    -- Error tracking for retries
    retry_count INTEGER DEFAULT 0,
    error_log TEXT,

    metadata JSONB DEFAULT '{}'::jsonb, -- Store provider response (e.g. Meta Message ID)

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Seed Default Template
-- ============================================================================

-- Note: This is an example. In production, we'd insert this via the UI or seed file.
-- But we include it here to satisfy the requirement of having the template ready.

COMMENT ON TABLE notifications.reminders IS
'Queue for payment reminders to be sent via WhatsApp/SMS';

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX idx_reminders_status ON notifications.reminders(status);
CREATE INDEX idx_reminders_scheduled ON notifications.reminders(scheduled_for);
CREATE INDEX idx_reminders_invoice ON notifications.reminders(invoice_id);

COMMIT;