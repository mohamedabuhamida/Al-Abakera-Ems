-- ============================================================================
-- Al Abakera EMS
-- Migration: 0009_functions
-- Description: Business logic, calculations, and automation engines
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Utility: Auto-update 'updated_at' timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION core.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. Identity: Generate Student Code (Format: AB-2025-0001)
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS academic.student_code_seq;

CREATE OR REPLACE FUNCTION academic.fn_generate_student_code()
RETURNS TRIGGER AS $$
DECLARE
    current_year TEXT := TO_CHAR(now(), 'YYYY');
BEGIN
    IF NEW.student_code IS NULL THEN
        NEW.student_code := 'AB-' || current_year || '-' || LPAD(nextval('academic.student_code_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. Billing: Update Invoice Status based on Payments
-- ============================================================================

CREATE OR REPLACE FUNCTION billing.fn_refresh_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_invoice_id UUID;
    v_total_paid NUMERIC(12, 2);
    v_total_amount NUMERIC(12, 2);
    v_discount NUMERIC(12, 2);
BEGIN
    -- Determine which invoice to update
    IF (TG_OP = 'DELETE') THEN v_invoice_id := OLD.invoice_id;
    ELSE v_invoice_id := NEW.invoice_id;
    END IF;

    -- Calculate current paid sum
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid 
    FROM billing.payments WHERE invoice_id = v_invoice_id;

    -- Get invoice totals
    SELECT total_amount, discount_amount INTO v_total_amount, v_discount 
    FROM billing.invoices WHERE id = v_invoice_id;

    -- Update the invoice record
    UPDATE billing.invoices
    SET 
        paid_amount = v_total_paid,
        status = CASE 
            WHEN v_total_paid >= (v_total_amount - v_discount) THEN 'paid'::invoice_status
            WHEN v_total_paid > 0 THEN 'partially_paid'::invoice_status
            WHEN now() > due_date AND v_total_paid = 0 THEN 'overdue'::invoice_status
            ELSE 'pending'::invoice_status
        END,
        updated_at = now()
    WHERE id = v_invoice_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. Billing: Monthly Invoice Generation Engine
-- This function is called by the Admin UI or a Cron job at month start.
-- It finds all active enrollments and creates the invoices automatically.
-- ============================================================================

CREATE OR REPLACE FUNCTION billing.fn_generate_monthly_invoices(
    p_center_id UUID,
    p_billing_month DATE, -- Usually the 1st of the month
    p_due_date DATE
)
RETURNS TABLE (generated_count INTEGER) AS $$
DECLARE
    v_student RECORD;
    v_new_invoice_id UUID;
    v_count INTEGER := 0;
BEGIN
    -- Loop through every student who has at least one active enrollment
    FOR v_student IN 
        SELECT DISTINCT student_id 
        FROM academic.enrollments e
        JOIN academic.students s ON e.student_id = s.profile_id
        WHERE s.center_id = p_center_id AND e.status = 'active'
    LOOP
        IF EXISTS (
            SELECT 1
            FROM billing.invoices i
            WHERE i.center_id = p_center_id
              AND i.student_id = v_student.student_id
              AND i.billing_month = p_billing_month
              AND i.status != 'cancelled'
        ) THEN
            CONTINUE;
        END IF;

        -- 1. Create the master invoice for the student
        INSERT INTO billing.invoices (
            center_id, student_id, billing_month, due_date, status
        ) VALUES (
            p_center_id, v_student.student_id, p_billing_month, p_due_date, 'pending'
        ) RETURNING id INTO v_new_invoice_id;

        -- 2. Insert items for every group the student is currently enrolled in
        INSERT INTO billing.invoice_items (invoice_id, group_id, description, unit_price)
        SELECT 
            v_new_invoice_id, 
            g.id, 
            g.name, 
            g.monthly_price
        FROM academic.enrollments e
        JOIN academic.groups g ON e.group_id = g.id
        WHERE e.student_id = v_student.student_id AND e.status = 'active';

        -- 3. Update the invoice total amount based on the sum of items
        UPDATE billing.invoices
        SET total_amount = (SELECT SUM(total_price) FROM billing.invoice_items WHERE invoice_id = v_new_invoice_id)
        WHERE id = v_new_invoice_id;

        v_count := v_count + 1;
    END LOOP;

    generated_count := v_count;
    RETURN NEXT;
END;

$$ LANGUAGE plpgsql;

COMMIT;


