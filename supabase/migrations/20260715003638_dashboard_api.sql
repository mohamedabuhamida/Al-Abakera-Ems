-- ============================================================================
-- Al Abakera EMS
-- Migration: 0015_dashboard_api
-- Description: Public RPC used by the application dashboard API
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.get_dashboard_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, core, identity, academic, billing, notifications
AS $$
DECLARE
    v_month DATE := DATE_TRUNC('month', now())::DATE;
    v_weekday INTEGER := EXTRACT(DOW FROM now())::INTEGER;
    v_stats JSONB;
    v_reminders JSONB;
    v_sessions JSONB;
BEGIN
    SELECT jsonb_build_object(
        'totalStudents', (SELECT COUNT(*) FROM academic.students),
        'totalTeachers', (SELECT COUNT(*) FROM academic.teachers),
        'activeGroups', (
            SELECT COUNT(*)
            FROM academic.groups
            WHERE status = 'active'
        ),
        'monthlyRevenue', COALESCE((
            SELECT collected_revenue
            FROM billing.view_monthly_revenue_stats
            WHERE month = v_month
            LIMIT 1
        ), 0),
        'expectedRevenue', COALESCE((
            SELECT expected_revenue
            FROM billing.view_monthly_revenue_stats
            WHERE month = v_month
            LIMIT 1
        ), 0),
        'outstandingDebt', COALESCE((
            SELECT outstanding_debt
            FROM billing.view_monthly_revenue_stats
            WHERE month = v_month
            LIMIT 1
        ), (
            SELECT COALESCE(SUM(remaining_amount), 0)
            FROM billing.invoices
            WHERE status IN ('pending', 'partially_paid', 'overdue')
              AND remaining_amount > 0
        )),
        'collectionRate', COALESCE((
            SELECT collection_rate
            FROM billing.view_monthly_revenue_stats
            WHERE month = v_month
            LIMIT 1
        ), 0)
    )
    INTO v_stats;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'invoiceId', reminder.invoice_id,
            'studentName', reminder.student_name,
            'parentName', reminder.parent_name,
            'parentWhatsapp', reminder.parent_whatsapp,
            'amount', reminder.remaining_amount,
            'billingMonth', reminder.billing_month,
            'itemDetails', reminder.item_details
        )
    ), '[]'::jsonb)
    INTO v_reminders
    FROM (
        SELECT
            invoice_id,
            student_name,
            parent_name,
            parent_whatsapp,
            billing_month,
            remaining_amount,
            item_details
        FROM notifications.view_pending_reminders_data
        ORDER BY due_date ASC
        LIMIT 5
    ) reminder;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', session.id,
            'groupName', COALESCE(session.group_name, 'مجموعة بدون اسم'),
            'classroomName', session.classroom_name,
            'startTime', session.start_time,
            'endTime', session.end_time
        )
    ), '[]'::jsonb)
    INTO v_sessions
    FROM (
        SELECT
            gs.id,
            g.name AS group_name,
            c.name AS classroom_name,
            gs.start_time,
            gs.end_time
        FROM academic.group_sessions gs
        LEFT JOIN academic.groups g ON g.id = gs.group_id
        LEFT JOIN academic.classrooms c ON c.id = gs.classroom_id
        WHERE gs.weekday = v_weekday
        ORDER BY gs.start_time ASC
        LIMIT 5
    ) session;

    RETURN jsonb_build_object(
        'stats', v_stats,
        'reminders', v_reminders,
        'sessions', v_sessions,
        'errors', '[]'::jsonb
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_dashboard_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_dashboard_data() TO anon, authenticated;

COMMIT;
