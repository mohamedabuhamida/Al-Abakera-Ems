// hooks/useStudentFilters.ts

import { useState, useMemo, useCallback } from "react";
import { Student } from "@/core/types";

type BalanceFilter = "all" | "with-balance" | "without-balance";

export function useStudentFilters(students: Student[], renderStageGrade: (student: Student) => string) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  // Use string types instead of specific unions
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [balanceFilter, setBalanceFilter] = useState<string>("all");

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return students.filter((student) => {
      const matchesQuery =
        !query ||
        [
          student.full_name,
          student.student_code,
          student.parent_name,
          student.whatsapp_number,
          student.grade,
          student.educational_stage,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query));
      
      const matchesStatus =
        statusFilter === "all" || student.status === statusFilter;
      const matchesGrade =
        gradeFilter === "all" || renderStageGrade(student) === gradeFilter;
      const balance = Number(student.current_balance ?? 0);
      const matchesBalance =
        balanceFilter === "all" ||
        (balanceFilter === "with-balance" && balance > 0) ||
        (balanceFilter === "without-balance" && balance <= 0);

      return matchesQuery && matchesStatus && matchesGrade && matchesBalance;
    });
  }, [students, searchTerm, statusFilter, gradeFilter, balanceFilter, renderStageGrade]);

  const gradeOptions = useMemo(() => {
    return Array.from(
      new Set(
        students
          .map((student) => renderStageGrade(student))
          .filter((grade) => grade !== "غير محدد")
      )
    ).sort();
  }, [students, renderStageGrade]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setGradeFilter("all");
    setBalanceFilter("all");
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    isFiltersOpen,
    setIsFiltersOpen,
    statusFilter,
    setStatusFilter, // Now accepts string
    gradeFilter,
    setGradeFilter,
    balanceFilter,
    setBalanceFilter, // Now accepts string
    filteredStudents,
    gradeOptions,
    clearFilters,
  };
}