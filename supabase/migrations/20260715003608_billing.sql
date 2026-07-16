-- ============================================================================
-- Al Abakera EMS
-- Migration: 0006_billing
-- Description: Professional Invoice & Payment System
-- ============================================================================

BEGIN;

-- ============================================================================
-- Invoices
-- ============================================================================

CREATE TABLE billing.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    student_id UUID NOT NULL
        REFERENCES academic.students(profile_id)
        ON DELETE CASCADE,

    invoice_number SERIAL, -- Unique per center (handled via logic later)

    -- The first day of the month this invoice covers (e.g., 2025-05-01)
    billing_month DATE NOT NULL,

    due_date DATE NOT NULL,

    status invoice_status NOT NULL DEFAULT 'pending',

    -- Financial Totals (Snapshots)
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Calculated field for remaining balance
    remaining_amount NUMERIC(12, 2) GENERATED ALWAYS AS (total_amount - discount_amount - paid_amount) STORED,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE billing.invoices IS
'Monthly student invoices for group subscriptions';

-- ============================================================================
-- Invoice Items
-- Breakdown of which groups/fees are included in the invoice
-- ============================================================================

CREATE TABLE billing.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    invoice_id UUID NOT NULL
        REFERENCES billing.invoices(id)
        ON DELETE CASCADE,

    -- Links back to the group they are paying for
    group_id UUID
        REFERENCES academic.groups(id)
        ON DELETE SET NULL,

    description TEXT NOT NULL, -- e.g., "Math Group - Level 3"

    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    
    total_price NUMERIC(12, 2) GENERATED ALWAYS AS (unit_price * quantity) STORED,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Payments
-- Record of actual money received (supports partial payments)
-- ============================================================================

CREATE TABLE billing.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    center_id UUID NOT NULL
        REFERENCES core.centers(id)
        ON DELETE CASCADE,

    invoice_id UUID NOT NULL
        REFERENCES billing.invoices(id)
        ON DELETE CASCADE,

    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),

    payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),

    method payment_method NOT NULL DEFAULT 'cash',

    transaction_reference TEXT, -- Instapay ID, Bank Ref, etc.

    received_by UUID NOT NULL
        REFERENCES identity.profiles(id),

    receipt_number SERIAL,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE billing.payments IS
'Actual payment transactions linked to invoices';

-- ============================================================================
-- Indexes for Financial Performance
-- ============================================================================

CREATE INDEX idx_invoices_student ON billing.invoices(student_id);
CREATE INDEX idx_invoices_status ON billing.invoices(status);
CREATE INDEX idx_payments_invoice ON billing.payments(invoice_id);

COMMIT;