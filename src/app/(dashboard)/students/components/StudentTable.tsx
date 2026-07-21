"use client";

import { Student } from "@/core/types";
import { Edit, Trash2, MessageCircle } from "lucide-react";
import { format } from "date-fns";

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  language: string;
  renderStageGrade: (student: Student) => string;
  numberFormatter: Intl.NumberFormat;
  currencyFormatter: Intl.NumberFormat;
  dateFormatter: Intl.DateTimeFormat;
  getInitials: (name: string) => string;
}

export function StudentTable({
  students,
  onEdit,
  onDelete,
  language,
  renderStageGrade,
  numberFormatter,
  currencyFormatter,
  dateFormatter,
  getInitials,
}: StudentTableProps) {
  const formatDate = (value: string) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return dateFormatter.format(date);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] border-collapse text-start">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-container-low">
            <th className="label-caps px-6 py-3">الكود</th>
            <th className="label-caps px-6 py-3">الطالب</th>
            <th className="label-caps px-6 py-3 whitespace-nowrap">المرحلة / الصف</th>
            <th className="label-caps px-6 py-3">ولي الأمر</th>
            <th className="label-caps px-6 py-3">المجموعات</th>
            <th className="label-caps px-6 py-3">الرصيد</th>
            <th className="label-caps px-6 py-3">الحالة</th>
            <th className="label-caps px-6 py-3">تاريخ التسجيل</th>
            <th className="label-caps px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {students.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-12 text-center text-sm text-on-surface-variant">
                لا يوجد طلاب مطابقون حاليا.
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr key={student.id} className="transition-colors hover:bg-surface-container-low">
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="rounded-sm bg-surface-container px-2 py-1 font-mono text-xs font-semibold text-on-surface-variant">
                    {student.student_code || "-"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-xs font-semibold text-on-primary-fixed-variant">
                      {getInitials(student.full_name)}
                    </div>
                    <div>
                      <p className="whitespace-nowrap text-sm font-semibold text-on-surface">
                        {student.full_name}
                      </p>
                      {student.school && (
                        <p className="mt-1 whitespace-nowrap text-xs text-on-surface-variant">
                          {student.school}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-on-surface-variant">
                  {renderStageGrade(student)}
                </td>
                <td className="px-6 py-4">
                  <p className="whitespace-nowrap text-sm font-medium text-on-surface">
                    {student.parent_name ?? "لا يوجد ولي أمر"}
                  </p>
                  {student.whatsapp_number && (
                    <a
                      href={`https://wa.me/${student.whatsapp_number}`}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-secondary"
                    >
                      <MessageCircle size={12} />
                      واتساب
                    </a>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-on-surface">
                  {numberFormatter.format(student.active_groups ?? 0)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-on-surface">
                  {currencyFormatter.format(student.current_balance ?? 0)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={
                      student.status === "active"
                        ? "rounded-sm bg-secondary-fixed px-2 py-1 text-xs font-semibold text-on-secondary-fixed-variant"
                        : "rounded-sm bg-error-container px-2 py-1 text-xs font-semibold text-on-error-container"
                    }
                  >
                    {student.status === "active" ? "نشط" : "غير نشط"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-on-surface-variant">
                  {student.id.startsWith("draft-") ? "مسودة" : formatDate(student.registration_date)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(student)}
                      className="rounded p-1 hover:bg-surface-container-high"
                      title="تعديل"
                      disabled={student.id.startsWith("draft-")}
                    >
                      <Edit size={16} className="text-primary" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(student.id)}
                      className="rounded p-1 hover:bg-surface-container-high"
                      title="حذف"
                      disabled={student.id.startsWith("draft-")}
                    >
                      <Trash2 size={16} className="text-error" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}