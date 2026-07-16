import { createClient } from "@/core/supabase/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type Student } from "@/core/types";

type StudentRow = Omit<Student, "profiles">;

export function useStudents() {
  const supabase = useMemo(() => createClient(), []);
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    const { data, error } = await supabase
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

    if (error) throw error;

    return (data ?? []) as StudentRow[];
  }, [supabase]);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await fetchStudents());
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل بيانات الطلاب");
    } finally {
      setLoading(false);
    }
  }, [fetchStudents]);

  useEffect(() => {
    let isActive = true;

    async function loadInitialStudents() {
      try {
        const students = await fetchStudents();
        if (!isActive) return;
        setData(students);
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "تعذر تحميل بيانات الطلاب");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadInitialStudents();

    return () => {
      isActive = false;
    };
  }, [fetchStudents]);

  return { data, loading, error, refresh: loadStudents };
}
