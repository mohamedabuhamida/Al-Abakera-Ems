import { createClient } from "@/core/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const errors: string[] = [];
  

  // Get current date info for sessions and billing month
  const now = new Date();
  const currentWeekday = now.getDay(); // 0 = Sunday, 1 = Monday...
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  try {
    // 1. Fetch Stats in Parallel for speed
    const [
      studentsCount,
      teachersCount,
      groupsCount,
      revenueStats
    ] = await Promise.all([
      supabase.schema('academic').from('students').select('*', { count: 'exact', head: true }),
      supabase.schema('academic').from('teachers').select('*', { count: 'exact', head: true }),
      supabase.schema('academic').from('groups').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.schema('billing').from('view_monthly_revenue_stats').select('*').limit(1).single()
    ]);

    // 2. Fetch Reminders from our Notification View
    const { data: remindersData, error: remindersError } = await supabase
      .schema('notifications')
      .from('view_pending_reminders_data')
      .select(`
        invoice_id,
        student_name,
        parent_name,
        parent_whatsapp,
        remaining_amount,
        billing_month,
        item_details
      `)
      .limit(5);

    if (remindersError) errors.push("Reminders fetch failed");

    // 3. Fetch Today's Sessions
    const { data: sessionsData, error: sessionsError } = await supabase
      .schema('academic')
      .from('group_sessions')
      .select(`
        id,
        start_time,
        end_time,
        group:groups(name),
        classroom:classrooms(name)
      `)
      .eq('weekday', currentWeekday)
      .order('start_time', { ascending: true });

    if (sessionsError) errors.push("Sessions fetch failed");

    // 4. Construct the Dashboard Data Object
    const dashboardData = {
      stats: {
        totalStudents: studentsCount.count || 0,
        totalTeachers: teachersCount.count || 0,
        activeGroups: groupsCount.count || 0,
        monthlyRevenue: revenueStats.data?.collected_revenue || 0,
        expectedRevenue: revenueStats.data?.expected_revenue || 0,
        outstandingDebt: revenueStats.data?.outstanding_debt || 0,
        collectionRate: revenueStats.data?.collection_rate || 0,
      },
      reminders: (remindersData || []).map(r => ({
        invoiceId: r.invoice_id,
        studentName: r.student_name,
        parentName: r.parent_name,
        parentWhatsapp: r.parent_whatsapp,
        amount: r.remaining_amount,
        billingMonth: r.billing_month,
        itemDetails: r.item_details
      })),
      sessions: (sessionsData || []).map(s => ({
        id: s.id,
        groupName: (s.group as any).name,
        classroomName: (s.classroom as any)?.name || null,
        startTime: s.start_time,
        endTime: s.end_time
      })),
      errors
    };

    return NextResponse.json(dashboardData);

  } catch (err) {
    console.error("Dashboard API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}