import { requireApiAccess } from "@/core/auth/server";
import { createClient } from "@/core/supabase/server";

type LegacyStudentRow = {
  id: string;
  student_code: string | null;
  full_name: string;
  educational_stage: string | null;
  grade: string | null;
  parent_name: string | null;
  whatsapp_number: string | null;
  status: "active" | "inactive";
  registration_date: string;
};

function isMissingRpcError(message: string) {
  return (
    message.includes("Could not find the function") &&
    message.includes("get_students_data")
  );
}

export async function GET() {
  const { response } = await requireApiAccess(["admin", "teacher"]);
  if (response) return response;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_students_data");

  if (error) {
    if (isMissingRpcError(error.message)) {
      const { data: legacyStudents, error: legacyError } = await supabase
        .from("students")
        .select(
          `
          id,
          student_code,
          full_name,
          educational_stage,
          grade,
          parent_name,
          whatsapp_number,
          status,
          registration_date
        `
        )
        .order("registration_date", { ascending: false });

      if (!legacyError) {
        return Response.json({
          students: ((legacyStudents ?? []) as LegacyStudentRow[]).map(
            (student) => ({
              ...student,
              student_code: student.student_code ?? "",
              active_groups: 0,
              current_balance: 0,
              overdue_count: 0,
              profiles: { avatar_url: null },
            })
          ),
          errors: [],
        });
      }

      return Response.json({
        students: [],
        errors: [],
        meta: {
          source: "empty",
          reason:
            "Student RPC is not applied yet and no legacy public.students table is exposed.",
        },
      });
    }

    return Response.json(
      {
        students: [],
        errors: [error.message],
      },
      { status: 200 }
    );
  }

  return Response.json(data);
}
