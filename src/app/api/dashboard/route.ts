import { createClient } from "@/core/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_dashboard_data");

  if (error) {
    return Response.json(
      {
        stats: {
          totalStudents: 0,
          totalTeachers: 0,
          activeGroups: 0,
          monthlyRevenue: 0,
          expectedRevenue: 0,
          outstandingDebt: 0,
          collectionRate: 0,
        },
        reminders: [],
        sessions: [],
        errors: [error.message],
      },
      { status: 200 }
    );
  }

  return Response.json(data);
}
