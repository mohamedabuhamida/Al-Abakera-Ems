import { type Student } from "@/core/types";
import { useCallback, useEffect, useState } from "react";

type StudentsPayload = {
  students: Student[];
  errors: string[];
};

async function fetchStudents() {
  const response = await fetch("/api/students", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("STUDENTS_LOAD_FAILED");
  }

  const payload = (await response.json()) as StudentsPayload;

  if (payload.errors.length > 0) {
    throw new Error(payload.errors[0]);
  }

  return payload.students;
}

export function useStudents() {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await fetchStudents());
    } catch (err) {
      setError(err instanceof Error ? err.message : "STUDENTS_LOAD_FAILED");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialStudents() {
      try {
        const students = await fetchStudents();
        if (!isActive) return;
        setData(students);
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "STUDENTS_LOAD_FAILED");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadInitialStudents();

    return () => {
      isActive = false;
    };
  }, []);

  return { data, loading, error, refresh: loadStudents };
}
