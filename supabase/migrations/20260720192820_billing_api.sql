-- ============================================================================
-- Al Abakera EMS
-- Migration: Billing API
-- Description: Public RPC used by the billing management page
-- ============================================================================

BEGIN;

-- Get billing overview stats
CREATE OR REPLACE FUNCTION public.get_billing_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity, academic, billing
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'totalInvoices', COALESCE((SELECT COUNT(*) FROM billing.invoices), 0),
        'paidInvoices', COALESCE((SELECT COUNT(*) FROM billing.invoices WHERE status = 'paid'), 0),
        'overdueInvoices', COALESCE((SELECT COUNT(*) FROM billing.invoices WHERE status = 'overdue'), 0),
        'totalRevenue', COALESCE((SELECT SUM(paid_amount) FROM billing.invoices), 0),
        'outstandingBalance', COALESCE((SELECT SUM(remaining_amount) FROM billing.invoices WHERE status IN ('pending', 'partially_paid', 'overdue')), 0),
        'collectionRate', COALESCE(
            (
                SELECT ROUND((SUM(paid_amount) / NULLIF(SUM(total_amount), 0)) * 100, 2)
                FROM billing.invoices
                WHERE status != 'cancelled'
            ),
            0
        )
    ) INTO result;

    RETURN jsonb_build_object(
        'stats', result,
        'errors', '[]'::jsonb
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_billing_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_billing_stats() TO anon, authenticated;

-- Get invoices with student details
CREATE OR REPLACE FUNCTION public.get_invoices_data(
    p_status TEXT DEFAULT NULL,
    p_student_id UUID DEFAULT NULL,
    p_month DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity, academic, billing
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', i.id,
            'invoice_number', i.invoice_number,
            'billing_month', i.billing_month,
            'due_date', i.due_date,
            'status', i.status,
            'total_amount', i.total_amount,
            'paid_amount', i.paid_amount,
            'discount_amount', i.discount_amount,
            'remaining_amount', i.remaining_amount,
            'notes', i.notes,
            'created_at', i.created_at,
            'student', jsonb_build_object(
                'id', s.profile_id,
                'full_name', p.full_name,
                'student_code', s.student_code,
                'grade', jsonb_build_object(
                    'id', g.id,
                    'name_ar', g.name_ar,
                    'name_en', g.name_en
                ),
                'parent_name', (
                    SELECT par.full_name
                    FROM academic.student_parents sp
                    JOIN academic.parents par ON par.id = sp.parent_id
                    WHERE sp.student_id = s.profile_id
                    LIMIT 1
                )
            ),
            'items', COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', it.id,
                            'description', it.description,
                            'unit_price', it.unit_price,
                            'quantity', it.quantity,
                            'total_price', it.total_price,
                            'group', jsonb_build_object(
                                'id', g.id,
                                'name', g.name
                            )
                        )
                    )
                    FROM billing.invoice_items it
                    LEFT JOIN academic.groups g ON g.id = it.group_id
                    WHERE it.invoice_id = i.id
                ),
                '[]'::jsonb
            ),
            'payments', COALESCE(
                (
                    SELECT jsonb_agg(
                        jsonb_build_object(
                            'id', py.id,
                            'amount', py.amount,
                            'payment_date', py.payment_date,
                            'method', py.method,
                            'transaction_reference', py.transaction_reference,
                            'received_by', jsonb_build_object(
                                'id', rp.id,
                                'full_name', rp.full_name
                            )
                        )
                        ORDER BY py.payment_date DESC
                    )
                    FROM billing.payments py
                    JOIN identity.profiles rp ON rp.id = py.received_by
                    WHERE py.invoice_id = i.id
                ),
                '[]'::jsonb
            )
        )
        ORDER BY i.created_at DESC
    ), '[]'::jsonb)
    INTO result
    FROM billing.invoices i
    JOIN academic.students s ON s.profile_id = i.student_id
    JOIN identity.profiles p ON p.id = s.profile_id
    LEFT JOIN academic.grades g ON g.id = s.grade_id
    WHERE (p_status IS NULL OR i.status = p_status)
      AND (p_student_id IS NULL OR i.student_id = p_student_id)
      AND (p_month IS NULL OR DATE_TRUNC('month', i.billing_month) = DATE_TRUNC('month', p_month));

    RETURN jsonb_build_object(
        'invoices', result,
        'errors', '[]'::jsonb
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_invoices_data(TEXT, UUID, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invoices_data(TEXT, UUID, DATE) TO anon, authenticated;

-- Get monthly revenue chart data - FIXED VERSION
CREATE OR REPLACE FUNCTION public.get_monthly_revenue()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity, academic, billing
AS $$
DECLARE
    result JSONB;
    monthly_data JSONB;
BEGIN
    -- First collect the data with order and limit in a subquery
    WITH monthly_data AS (
        SELECT 
            DATE_TRUNC('month', billing_month) AS month,
            COALESCE(SUM(total_amount), 0) AS expected,
            COALESCE(SUM(paid_amount), 0) AS collected,
            COALESCE(SUM(remaining_amount), 0) AS outstanding
        FROM billing.invoices
        WHERE status != 'cancelled'
        GROUP BY DATE_TRUNC('month', billing_month)
        ORDER BY DATE_TRUNC('month', billing_month) DESC
        LIMIT 12
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'month', TO_CHAR(month, 'YYYY-MM'),
            'month_name', TO_CHAR(month, 'Mon YYYY'),
            'expected', expected,
            'collected', collected,
            'outstanding', outstanding
        )
    ) INTO result
    FROM monthly_data;

    RETURN jsonb_build_object(
        'data', COALESCE(result, '[]'::jsonb),
        'errors', '[]'::jsonb
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_monthly_revenue() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_monthly_revenue() TO anon, authenticated;

-- Create invoice
CREATE OR REPLACE FUNCTION public.create_invoice(
    p_student_id UUID,
    p_billing_month DATE,
    p_due_date DATE,
    p_items JSONB,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity, academic, billing
AS $$
DECLARE
    v_invoice_id UUID;
    v_center_id UUID;
    v_item JSONB;
    v_total_amount NUMERIC(12,2) := 0;
BEGIN
    -- Get center ID from student
    SELECT center_id INTO v_center_id
    FROM academic.students
    WHERE profile_id = p_student_id;

    IF v_center_id IS NULL THEN
        RAISE EXCEPTION 'Student not found';
    END IF;

    -- Create invoice
    INSERT INTO billing.invoices (
        center_id,
        student_id,
        billing_month,
        due_date,
        notes,
        status,
        total_amount,
        paid_amount,
        discount_amount
    ) VALUES (
        v_center_id,
        p_student_id,
        p_billing_month,
        p_due_date,
        p_notes,
        'pending',
        0,
        0,
        0
    ) RETURNING id INTO v_invoice_id;

    -- Insert items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO billing.invoice_items (
            invoice_id,
            group_id,
            description,
            unit_price,
            quantity
        ) VALUES (
            v_invoice_id,
            (v_item->>'group_id')::UUID,
            v_item->>'description',
            (v_item->>'unit_price')::NUMERIC(12,2),
            (v_item->>'quantity')::INTEGER
        );
    END LOOP;

    -- Update total amount
    UPDATE billing.invoices
    SET total_amount = (
        SELECT SUM(total_price)
        FROM billing.invoice_items
        WHERE invoice_id = v_invoice_id
    )
    WHERE id = v_invoice_id;

    RETURN jsonb_build_object(
        'invoiceId', v_invoice_id,
        'success', TRUE
    );
END;
$$;

REVOKE ALL ON FUNCTION public.create_invoice(UUID, DATE, DATE, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_invoice(UUID, DATE, DATE, JSONB, TEXT) TO authenticated;

-- Record payment
CREATE OR REPLACE FUNCTION public.record_payment(
    p_invoice_id UUID,
    p_amount NUMERIC(12,2),
    p_method TEXT,
    p_transaction_reference TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity, academic, billing
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_center_id UUID;
    v_invoice_status TEXT;
BEGIN
    -- Get center and status
    SELECT center_id, status INTO v_center_id, v_invoice_status
    FROM billing.invoices
    WHERE id = p_invoice_id;

    IF v_center_id IS NULL THEN
        RAISE EXCEPTION 'Invoice not found';
    END IF;

    IF v_invoice_status = 'paid' THEN
        RAISE EXCEPTION 'Invoice is already paid';
    END IF;

    IF v_invoice_status = 'cancelled' THEN
        RAISE EXCEPTION 'Invoice is cancelled';
    END IF;

    -- Insert payment
    INSERT INTO billing.payments (
        center_id,
        invoice_id,
        amount,
        payment_date,
        method,
        transaction_reference,
        received_by,
        notes
    ) VALUES (
        v_center_id,
        p_invoice_id,
        p_amount,
        now(),
        p_method::payment_method,
        p_transaction_reference,
        v_user_id,
        p_notes
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Payment recorded successfully'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.record_payment(UUID, NUMERIC, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_payment(UUID, NUMERIC, TEXT, TEXT, TEXT) TO authenticated;

COMMIT;