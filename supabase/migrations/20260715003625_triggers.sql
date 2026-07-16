-- ============================================================================
-- Al Abakera EMS
-- Migration: 0010_triggers
-- Description: Automatic rule enforcement and data synchronization
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. Timestamp Triggers (Maintain updated_at across all schemas)
-- ============================================================================

-- Core Schema
CREATE TRIGGER tr_centers_updated_at BEFORE UPDATE ON core.centers
FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();

CREATE TRIGGER tr_settings_updated_at BEFORE UPDATE ON core.settings
FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();

-- Identity Schema
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON identity.profiles
FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();

-- Academic Schema
CREATE TRIGGER tr_groups_updated_at BEFORE UPDATE ON academic.groups
FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();

CREATE TRIGGER tr_sessions_updated_at BEFORE UPDATE ON academic.group_sessions
FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();

CREATE TRIGGER tr_lessons_updated_at BEFORE UPDATE ON academic.lessons
FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();

CREATE TRIGGER tr_exams_updated_at BEFORE UPDATE ON academic.exams
FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();

CREATE TRIGGER tr_exam_results_updated_at BEFORE UPDATE ON academic.exam_results
FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();

CREATE TRIGGER tr_assignments_updated_at BEFORE UPDATE ON academic.assignments
FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();

CREATE TRIGGER tr_assignment_submissions_updated_at BEFORE UPDATE ON academic.assignment_submissions
FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();

-- Billing Schema
CREATE TRIGGER tr_invoices_updated_at BEFORE UPDATE ON billing.invoices
FOR EACH ROW EXECUTE FUNCTION core.fn_set_updated_at();

-- ============================================================================
-- 2. Academic Triggers
-- ============================================================================

-- Automatically generate Student Code (e.g., AB-2025-0001) before creation
CREATE TRIGGER tr_generate_student_code
BEFORE INSERT ON academic.students
FOR EACH ROW EXECUTE FUNCTION academic.fn_generate_student_code();

-- ============================================================================
-- 3. Billing & Financial Triggers
-- ============================================================================

-- Re-calculate Invoice status and paid_amount whenever a payment is made
CREATE TRIGGER tr_payment_refresh_invoice
AFTER INSERT OR UPDATE OR DELETE ON billing.payments
FOR EACH ROW EXECUTE FUNCTION billing.fn_refresh_invoice_totals();

-- Re-calculate Invoice totals if an item is added or removed from an invoice
-- (Ensures financial integrity if an Admin manually adds a fee to an invoice)
CREATE OR REPLACE FUNCTION billing.fn_sync_invoice_total_from_items()
RETURNS TRIGGER AS $$
DECLARE
    v_invoice_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN v_invoice_id := OLD.invoice_id;
    ELSE v_invoice_id := NEW.invoice_id;
    END IF;

    UPDATE billing.invoices
    SET total_amount = (
        SELECT COALESCE(SUM(total_price), 0) 
        FROM billing.invoice_items 
        WHERE invoice_id = v_invoice_id
    )
    WHERE id = v_invoice_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_items_sync_invoice_total
AFTER INSERT OR UPDATE OR DELETE ON billing.invoice_items
FOR EACH ROW EXECUTE FUNCTION billing.fn_sync_invoice_total_from_items();

-- ============================================================================
-- 4. Clean-up Logic (Self-Healing)
-- ============================================================================

-- If a student is deleted, their associated profile should be handled 
-- (Already handled by ON DELETE CASCADE in identity.sql, 
-- but we could add complex archiving logic here later).

COMMIT;
