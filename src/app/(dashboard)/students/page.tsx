"use client";

import { useMemo, useState } from "react";
import { Download, Filter, Plus, Search, UserPlus } from "lucide-react";
import { useStudents } from "@/modules/students/hooks/useStudents";

export default function StudentsPage() {
  const { data: students, loading, error } = useStudents();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) =>
      [student.full_name, student.student_code]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [searchTerm, students]);

  if (loading) {
    return (
      <div className="surface-card p-8 text-center text-sm text-on-surface-variant">
        جاري تحميل البيانات...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-default border border-error/30 bg-error-container p-8 text-center text-sm text-on-error-container">
        حدث خطأ: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-outline-variant pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label-caps">Student Registry</p>
          <h1 className="mt-2 text-[30px] font-semibold leading-9 tracking-[-0.01em] text-on-surface">
            الطلاب
          </h1>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            إدارة ملفات الطلاب، الأكواد، وبيانات التواصل من واجهة مركزة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-secondary">
            <Filter size={16} />
            تصفية
          </button>
          <button type="button" className="btn-secondary">
            <Download size={16} />
            تصدير
          </button>
          <button type="button" className="btn-primary">
            <UserPlus size={16} />
            طالب جديد
          </button>
        </div>
      </div>

      <section className="surface-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex h-10 w-full items-center gap-2 rounded-default border border-outline-variant bg-surface-container-low px-3 md:max-w-sm">
            <Search size={16} className="text-on-surface-variant" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="ابحث بالاسم أو الكود"
              className="w-full border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70"
            />
          </div>
          <button type="button" className="btn-secondary">
            <Plus size={16} />
            إجراء سريع
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-right">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="label-caps px-6 py-3">الكود</th>
                <th className="label-caps px-6 py-3">اسم الطالب</th>
                <th className="label-caps px-6 py-3">الحالة</th>
                <th className="label-caps px-6 py-3">آخر تحديث</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                    لا يوجد طلاب مطابقون حاليا.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="rounded-sm bg-surface-container px-2 py-1 font-mono text-xs font-semibold text-on-surface-variant">
                        {student.student_code}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-on-surface">
                      {student.full_name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="rounded-sm bg-secondary-fixed px-2 py-1 text-xs font-semibold text-on-secondary-fixed-variant">
                        نشط
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-on-surface-variant">
                      متاح
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
