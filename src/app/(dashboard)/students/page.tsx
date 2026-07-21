"use client";

import { useLanguage } from "@/core/i18n/useLanguage";
import { type Student } from "@/core/types";
import { useStudents } from "@/modules/students/hooks/useStudents";
import { X, ShieldCheck, AlertCircle, Trash2 } from "lucide-react";
import { Field, SelectField, GroupSelectField } from "@/components/ui";

import { useStudentForm } from "./hooks/useStudentForm";
import { useStudentEdit } from "./hooks/useStudentEdit";
import { useStudentFilters } from "./hooks/useStudentFilters";
import {
  saveStudentToDatabase,
  deleteStudent,
  updateStudent,
  updateStudentGroups,
} from "./actions";
import { useMemo, useState, useCallback } from "react";
import { StudentFilters } from "./components/StudentFilters";
import { StudentMetrics } from "./components/StudentMetrics";
import { StudentTable } from "./components/StudentTable";
import { StudentForm } from "./components/StudentForm";
import { StudentCredentialsModal } from "./components/StudentCredentialsModal";

// Country codes for WhatsApp
const COUNTRY_CODES = [
  { code: "+20", label: "🇪🇬 +20 (Egypt)" },
  { code: "+966", label: "🇸🇦 +966 (Saudi Arabia)" },
  { code: "+971", label: "🇦🇪 +971 (UAE)" },
  { code: "+974", label: "🇶🇦 +974 (Qatar)" },
  { code: "+965", label: "🇰🇼 +965 (Kuwait)" },
  { code: "+973", label: "🇧🇭 +973 (Bahrain)" },
  { code: "+968", label: "🇴🇲 +968 (Oman)" },
  { code: "+962", label: "🇯🇴 +962 (Jordan)" },
  { code: "+961", label: "🇱🇧 +961 (Lebanon)" },
  { code: "+970", label: "🇵🇸 +970 (Palestine)" },
  { code: "+963", label: "🇸🇾 +963 (Syria)" },
  { code: "+964", label: "🇮🇶 +964 (Iraq)" },
  { code: "+967", label: "🇾🇪 +967 (Yemen)" },
  { code: "+218", label: "🇱🇾 +218 (Libya)" },
  { code: "+216", label: "🇹🇳 +216 (Tunisia)" },
  { code: "+213", label: "🇩🇿 +213 (Algeria)" },
  { code: "+212", label: "🇲🇦 +212 (Morocco)" },
  { code: "+222", label: "🇲🇷 +222 (Mauritania)" },
  { code: "+249", label: "🇸🇩 +249 (Sudan)" },
  { code: "+252", label: "🇸🇴 +252 (Somalia)" },
  { code: "+1", label: "🇺🇸 +1 (USA/Canada)" },
  { code: "+44", label: "🇬🇧 +44 (UK)" },
  { code: "+91", label: "🇮🇳 +91 (India)" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatWhatsAppNumber(phoneNumber: string, countryCode: string) {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  const codeDigits = countryCode.replace(/\D/g, "");
  const finalNumber = cleanNumber.startsWith(codeDigits)
    ? cleanNumber
    : codeDigits + cleanNumber;
  return finalNumber;
}

export default function StudentsPage() {
  // ============================================================================
  // 1. ALL HOOKS FIRST (before any conditional returns)
  // ============================================================================

  const { language } = useLanguage();
  const content = language === "ar" ? arabicContent : englishContent;
  const { data: students, loading, error, refresh } = useStudents();

  // All useState hooks
  const [draftStudents, setDraftStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [credentials, setCredentials] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Formatters
  const locale = language === "ar" ? "ar-EG" : "en-US";
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale),
    [locale],
  );
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 0,
      }),
    [locale],
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [locale],
  );

  // All students
  const allStudents = useMemo(
    () => [...draftStudents, ...students],
    [draftStudents, students],
  );

  // Render stage/grade
  const renderStageGrade = useCallback((student: Student) => {
    const stage = student.educational_stage;
    const grade = student.grade;
    if (!stage && !grade) return content.unknownGrade;
    if (stage && grade) return `${stage} / ${grade}`;
    return stage ?? grade ?? content.unknownGrade;
  }, [content.unknownGrade]);

  // Hooks (useStudentForm, useStudentEdit, useStudentFilters)
  const form = useStudentForm();
  const edit = useStudentEdit(form.stages, form.grades, language);
  const filters = useStudentFilters(allStudents, renderStageGrade);

  // Handle grade change to filter groups
  const handleGradeChange = (value: string) => {
    form.updateNewStudent("grade", value);
  };

  // Metrics
  const metrics = useMemo(() => {
    return allStudents.reduce(
      (summary, student) => {
        summary.total += 1;
        if (student.status === "active") summary.active += 1;
        summary.balance += Number(student.current_balance ?? 0);
        summary.overdue += Number(student.overdue_count ?? 0);
        return summary;
      },
      { total: 0, active: 0, balance: 0, overdue: 0 },
    );
  }, [allStudents]);

  // Filter groups for edit modal based on selected grade
  const filteredGroupsForEdit = useMemo(() => {
    if (!edit.formData.grade) return form.groups;
    return form.groups.filter((g) => g.grade_id === edit.formData.grade);
  }, [form.groups, edit.formData.grade]);

  // All callbacks
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const sendCredentialsViaWhatsApp = () => {
    if (!credentials || !credentials.parentWhatsapp) {
      setNotification({
        type: "error",
        message: content.parentPhoneRequired,
      });
      return;
    }

    setIsSendingWhatsApp(true);

    const message = `
${content.whatsappMessageHeader} *${credentials.studentName}* ${content.whatsappMessageBody}

📋 *${content.studentCredentialsLabel}:*
📧 ${content.emailLabel}: ${credentials.studentCredentials.email}
🔑 ${content.passwordLabel}: ${credentials.studentCredentials.password}

📋 *${content.parentCredentialsLabel}:*
📧 ${content.emailLabel}: ${credentials.parentCredentials.email}
🔑 ${content.passwordLabel}: ${credentials.parentCredentials.password}

🔗 ${content.loginLink}

${content.whatsappFooter}
`;

    const encodedMessage = encodeURIComponent(message.trim());
    const phoneNumber = credentials.parentWhatsapp.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");

    setNotification({
      type: "success",
      message: content.credentialsSent,
    });

    setIsSendingWhatsApp(false);
  };

  const handleConfirmRegistration = async () => {
    setIsLoading(true);
    setNotification(null);
    setIsConfirmModalOpen(false);

    try {
      const formattedWhatsApp = form.newStudent.whatsapp_number
        ? formatWhatsAppNumber(
            form.newStudent.whatsapp_number,
            form.selectedCountryCode,
          )
        : "";

      const studentData = {
        full_name: form.newStudent.full_name,
        whatsapp_number: formattedWhatsApp,
        parent_name: form.newStudent.parent_name,
        school: form.newStudent.school,
        gender: form.newStudent.gender,
        grade_id: form.newStudent.grade,
        status: form.newStudent.status,
      };

      const result = await saveStudentToDatabase(studentData);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.success && form.newStudent.group_ids.length > 0) {
        const studentId = result.studentId;
        if (studentId) {
          await updateStudentGroups(studentId, form.newStudent.group_ids);
        }
      }

      if (result.studentCredentials) {
        setCredentials({
          ...result,
          parentWhatsapp: formattedWhatsApp,
          studentName: form.newStudent.full_name,
        });
        setNotification({
          type: "success",
          message: content.studentAdded,
        });
      }

      form.resetForm();
      form.setIsAddOpen(false);
      await refresh();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || content.error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!edit.editingStudent) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const formattedWhatsApp = edit.formData.whatsapp_number
        ? formatWhatsAppNumber(
            edit.formData.whatsapp_number,
            edit.selectedCountryCode,
          )
        : "";

      const updateData = {
        full_name: edit.formData.full_name,
        whatsapp_number: formattedWhatsApp,
        grade_id: edit.formData.grade || "",
        school: edit.formData.school || "",
        gender: edit.editingStudent.gender || "",
        status: edit.formData.status,
      };

      const result = await updateStudent(edit.editingStudent.id, updateData);

      if (result.error) {
        throw new Error(result.error);
      }

      if (edit.editingStudent.id) {
        await updateStudentGroups(edit.editingStudent.id, edit.selectedGroups);
      }

      setNotification({
        type: "success",
        message: content.studentUpdated,
      });
      edit.closeEditModal();
      await refresh();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || content.error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudentId) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const result = await deleteStudent(selectedStudentId);

      if (result.error) {
        throw new Error(result.error);
      }

      setNotification({
        type: "success",
        message: content.studentDeleted,
      });
      setIsDeleteModalOpen(false);
      setSelectedStudentId(null);
      await refresh();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || content.error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDraft = (event: React.FormEvent) => {
    event.preventDefault();

    const student: Student = {
      id: `draft-${Date.now()}`,
      student_code: form.generatedStudentCode,
      full_name: form.newStudent.full_name,
      educational_stage: form.newStudent.educational_stage || null,
      grade: form.newStudent.grade || null,
      parent_name: form.newStudent.parent_name || null,
      whatsapp_number: form.newStudent.whatsapp_number || null,
      status: form.newStudent.status,
      registration_date: new Date().toISOString(),
      gender: form.newStudent.gender || null,
      school: form.newStudent.school || null,
      active_groups: 0,
      current_balance: 0,
      overdue_count: 0,
      profiles: { avatar_url: null },
    };

    setDraftStudents((current) => [student, ...current]);
    form.resetForm();
    form.setIsAddOpen(false);
  };

  const exportCsv = () => {
    const headers = [
      content.code,
      content.student,
      content.stageGrade,
      content.parent,
      content.whatsapp,
      content.groups,
      content.balance,
      content.status,
      content.registered,
    ];
    const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csv = [
      headers.map(escapeCell).join(","),
      ...filters.filteredStudents.map((student) =>
        [
          student.student_code || "",
          student.full_name,
          renderStageGrade(student),
          student.parent_name ?? "",
          student.whatsapp_number ?? "",
          String(student.active_groups ?? 0),
          String(student.current_balance ?? 0),
          student.status === "active" ? content.active : content.inactive,
          student.registration_date,
        ]
          .map((value) => escapeCell(String(value ?? "")))
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "students.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // 2. CONDITIONAL RETURNS (after ALL hooks)
  // ============================================================================

  // Loading state
  if (loading) {
    return (
      <div className="surface-card p-8 text-center text-sm text-on-surface-variant">
        {content.loading}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-default border border-error/30 bg-error-container p-8 text-center text-sm text-on-error-container">
        {content.errorPrefix}{" "}
        {error === "STUDENTS_LOAD_FAILED" ? content.loadError : error}
      </div>
    );
  }

  // ============================================================================
  // 3. RETURN JSX
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`rounded-default p-4 ${
            notification.type === "success"
              ? "bg-secondary-fixed text-on-secondary-fixed"
              : "bg-error-container text-on-error-container"
          }`}
        >
          <p className="text-sm font-semibold">{notification.message}</p>
        </div>
      )}

      {/* Filters */}
      <StudentFilters
        searchTerm={filters.searchTerm}
        setSearchTerm={filters.setSearchTerm}
        isFiltersOpen={filters.isFiltersOpen}
        setIsFiltersOpen={filters.setIsFiltersOpen}
        statusFilter={filters.statusFilter}
        setStatusFilter={filters.setStatusFilter}
        gradeFilter={filters.gradeFilter}
        setGradeFilter={filters.setGradeFilter}
        balanceFilter={filters.balanceFilter}
        setBalanceFilter={filters.setBalanceFilter}
        gradeOptions={filters.gradeOptions}
        clearFilters={filters.clearFilters}
        onRefresh={refresh}
        onExport={exportCsv}
        onAddStudent={() => form.setIsAddOpen(true)}
        language={language}
        content={content}
      />

      {/* Metrics */}
      <StudentMetrics
        total={metrics.total}
        active={metrics.active}
        balance={metrics.balance}
        overdue={metrics.overdue}
        numberFormatter={numberFormatter}
        currencyFormatter={currencyFormatter}
      />

      {/* Table */}
      <section className="surface-card overflow-hidden">
        <StudentTable
          students={filters.filteredStudents}
          onEdit={edit.openEditModal}
          onDelete={(id) => {
            setSelectedStudentId(id);
            setIsDeleteModalOpen(true);
          }}
          language={language}
          renderStageGrade={renderStageGrade}
          numberFormatter={numberFormatter}
          currencyFormatter={currencyFormatter}
          dateFormatter={dateFormatter}
          getInitials={getInitials}
        />
      </section>

      {/* Student Form Modal */}
      <StudentForm
        isOpen={form.isAddOpen}
        onClose={() => {
          form.setIsAddOpen(false);
          form.setAddStep(0);
          form.resetForm();
        }}
        addStep={form.addStep}
        setAddStep={form.setAddStep}
        newStudent={form.newStudent}
        updateNewStudent={form.updateNewStudent}
        generatedStudentCode={form.generatedStudentCode}
        stages={form.stages}
        grades={form.grades}
        isLoadingStages={form.isLoadingStages}
        selectedStageId={form.selectedStageId}
        handleStageChange={form.handleStageChange}
        groups={form.groups}
        isLoadingGroups={form.isLoadingGroups}
        selectedCountryCode={form.selectedCountryCode}
        setSelectedCountryCode={form.setSelectedCountryCode}
        COUNTRY_CODES={COUNTRY_CODES}
        isStepValid={form.isStepValid}
        handleStepChange={form.handleStepChange}
        handleNextStep={form.handleNextStep}
        handlePreviousStep={form.handlePreviousStep}
        openConfirmModal={() => setIsConfirmModalOpen(true)}
        isLoading={isLoading}
        getStageName={form.getStageName}
        getGradeName={form.getGradeName}
        language={language}
        onGradeChange={handleGradeChange}
        content={content}
      />

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={24} className="text-primary" />
                  <h3 className="text-2xl font-semibold text-on-surface">
                    {content.confirmRegistration}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {content.confirmRegistrationDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 border-t border-outline-variant pt-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  [content.studentId, form.generatedStudentCode],
                  [content.fullName, form.newStudent.full_name || "-"],
                  [content.parent, form.newStudent.parent_name || "-"],
                  [
                    content.parentWhatsapp,
                    form.newStudent.whatsapp_number
                      ? `${form.selectedCountryCode}${form.newStudent.whatsapp_number}`
                      : "-",
                  ],
                  [
                    content.stageGrade,
                    form.selectedStageId
                      ? form.getStageName(form.selectedStageId)
                      : "-",
                  ],
                  [
                    content.grade,
                    form.newStudent.grade
                      ? form.getGradeName(form.newStudent.grade)
                      : "-",
                  ],
                  [content.school, form.newStudent.school || "-"],
                  [
                    content.status,
                    form.newStudent.status === "active"
                      ? content.active
                      : content.inactive,
                  ],
                  [
                    content.groups,
                    form.newStudent.group_ids.length > 0
                      ? form.newStudent.group_ids
                          .map((id: string) => {
                            const group = form.groups.find((g) => g.id === id);
                            return group ? group.name : "";
                          })
                          .filter(Boolean)
                          .join(", ")
                      : "-",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label as string}
                    className="rounded-default border border-outline-variant bg-surface-container-low p-4"
                  >
                    <p className="text-xs font-semibold text-on-surface-variant">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-default bg-warning-container p-4 text-sm text-on-warning-container">
                <AlertCircle size={18} className="shrink-0" />
                <p>{content.confirmationWarning}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-outline-variant pt-6">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="btn-secondary"
                disabled={isLoading}
              >
                {content.backToReview}
              </button>
              <button
                type="button"
                onClick={handleConfirmRegistration}
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? content.registering : content.registerNow}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-on-surface">
              {content.deleteConfirm}
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              {content.deleteMessage}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedStudentId(null);
                }}
                className="btn-secondary"
                disabled={isLoading}
              >
                {content.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                className="btn-danger"
                disabled={isLoading}
              >
                <Trash2 size={16} />
                {isLoading ? content.deleting : content.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {edit.isEditModalOpen && edit.editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleEditStudent}
            className="surface-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0"
          >
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant p-6">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">
                  {content.editTitle}
                </h2>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                  {content.editDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={edit.closeEditModal}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field
                    label={content.fullName}
                    value={edit.formData.full_name}
                    required
                    onChange={(value) =>
                      edit.updateEditingStudent("full_name", value)
                    }
                  />
                </div>
                <Field
                  label={content.parent}
                  value={edit.formData.parent_name}
                  onChange={(value) =>
                    edit.updateEditingStudent("parent_name", value)
                  }
                />
                <div className="space-y-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-on-surface-variant">
                      {content.countryCode}
                    </span>
                    <select
                      value={edit.selectedCountryCode}
                      onChange={(e) =>
                        edit.setSelectedCountryCode(e.target.value)
                      }
                      className="input-field w-full"
                    >
                      {COUNTRY_CODES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <Field
                  label={content.parentWhatsapp}
                  value={edit.formData.whatsapp_number}
                  onChange={(value) =>
                    edit.updateEditingStudent("whatsapp_number", value)
                  }
                  placeholder="123456789"
                />

                {/* Stage Selection */}
                <div className="space-y-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-on-surface-variant">
                      {content.stageGrade}
                    </span>
                    <select
                      value={edit.selectedStageId}
                      onChange={(e) => {
                        const stageId = e.target.value;
                        edit.setSelectedStageId(stageId);

                        if (stageId) {
                          const selectedStage = form.stages.find(
                            (s) => s.id === stageId,
                          );
                          if (selectedStage) {
                            const stageGrades = selectedStage.grades.map(
                              (grade: any) => ({
                                ...grade,
                                stage_name:
                                  language === "ar"
                                    ? selectedStage.name_ar
                                    : selectedStage.name_en,
                                stage_id: selectedStage.id,
                              }),
                            );
                          }
                        }
                      }}
                      className="input-field w-full"
                      disabled={form.isLoadingStages}
                    >
                      <option value="">
                        {language === "ar" ? "اختر المرحلة" : "Select Stage"}
                      </option>
                      {form.stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {language === "ar" ? stage.name_ar : stage.name_en}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Grade Selection */}
                <div className="space-y-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-on-surface-variant">
                      {content.grade}
                    </span>
                    <select
                      value={edit.formData.grade}
                      onChange={(e) => {
                        const value = e.target.value;
                        edit.updateEditingStudent("grade", value);

                        if (value) {
                          const gradeObj = form.grades.find(
                            (g) => g.id === value,
                          );
                          if (gradeObj) {
                            const stageObj = form.stages.find(
                              (s) => s.id === gradeObj.stage_id,
                            );
                            if (stageObj) {
                              edit.setSelectedStageId(stageObj.id);
                              edit.updateEditingStudent(
                                "educational_stage",
                                language === "ar"
                                  ? stageObj.name_ar
                                  : stageObj.name_en,
                              );
                            }
                          }
                        } else {
                          edit.setSelectedStageId("");
                          edit.updateEditingStudent("educational_stage", "");
                        }
                      }}
                      className="input-field w-full"
                      disabled={
                        form.isLoadingStages || form.grades.length === 0
                      }
                    >
                      <option value="">
                        {language === "ar" ? "اختر الصف" : "Select Grade"}
                      </option>
                      {form.grades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                          {language === "ar" ? grade.name_ar : grade.name_en}
                          {edit.selectedStageId &&
                            ` (${language === "ar" ? "المرحلة" : "Stage"})`}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <Field
                  label={content.school}
                  value={edit.formData.school}
                  onChange={(value) =>
                    edit.updateEditingStudent("school", value)
                  }
                />
                <SelectField
                  label={content.status}
                  value={edit.formData.status}
                  onChange={(value) =>
                    edit.updateEditingStudent("status", value)
                  }
                  options={[
                    { value: "active", label: content.active },
                    { value: "inactive", label: content.inactive },
                  ]}
                />

                {/* Group Selection - FILTERED BY GRADE */}
                <div className="md:col-span-2">
                  {edit.formData.grade ? (
                    <GroupSelectField
                      label={content.groups}
                      value={edit.selectedGroups}
                      options={filteredGroupsForEdit.map((g) => ({
                        value: g.id,
                        label: g.display_name || g.name,
                      }))}
                      onChange={(values) => edit.setSelectedGroups(values)}
                      isLoading={form.isLoadingGroups}
                      placeholder={
                        language === "ar"
                          ? "اختر المجموعات الدراسية"
                          : "Select study groups"
                      }
                      language={language}
                    />
                  ) : (
                    <div className="rounded-default border border-outline-variant bg-surface-container-low p-4 text-center text-sm text-on-surface-variant">
                      {language === "ar"
                        ? "يرجى اختيار الصف أولاً لعرض المجموعات المتاحة"
                        : "Please select a grade first to see available groups"}
                    </div>
                  )}
                  {filteredGroupsForEdit.length === 0 &&
                    edit.formData.grade && (
                      <p className="text-xs text-warning mt-1">
                        {language === "ar"
                          ? "لا توجد مجموعات متاحة لهذا الصف"
                          : "No groups available for this grade"}
                      </p>
                    )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                onClick={edit.closeEditModal}
                className="btn-secondary"
                disabled={isLoading}
              >
                {content.cancel}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? content.saving : content.saveChanges}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Credentials Modal */}
      <StudentCredentialsModal
        credentials={credentials}
        onClose={() => setCredentials(null)}
        copiedField={copiedField}
        copyToClipboard={copyToClipboard}
        isSendingWhatsApp={isSendingWhatsApp}
        sendCredentialsViaWhatsApp={sendCredentialsViaWhatsApp}
        content={{
          credentials: content.credentials,
          studentEmail: content.studentEmail,
          studentPassword: content.studentPassword,
          parentEmail: content.parentEmail,
          parentPassword: content.parentPassword,
          sendWhatsApp: content.sendWhatsApp,
          parentPhoneRequired: content.parentPhoneRequired,
          confirm: content.confirm,
        }}
      />
    </div>
  );
}

// ============================================================================
// CONTENT OBJECTS
// ============================================================================

const arabicContent = {
  // General
  loading: "جاري تحميل بيانات الطلاب...",
  errorPrefix: "حدث خطأ:",
  loadError: "تعذر تحميل بيانات الطلاب",
  success: "تم بنجاح",
  error: "حدث خطأ",
  cancel: "إلغاء",
  confirm: "تأكيد",

  // Student Fields
  studentId: "كود الطالب",
  fullName: "اسم الطالب",
  parent: "ولي الأمر",
  parentWhatsapp: "واتساب ولي الأمر",
  countryCode: "كود الدولة",
  stageGrade: "المرحلة / الصف",
  grade: "الصف",
  school: "المدرسة",
  status: "الحالة",
  active: "نشط",
  inactive: "غير نشط",
  groups: "المجموعات",
  balance: "الرصيد",
  registered: "تاريخ التسجيل",
  code: "الكود",
  student: "الطالب",
  whatsapp: "واتساب",
  unknownGrade: "غير محدد",
  unknownParent: "لا يوجد ولي أمر",

  // Filters
  filter: "تصفية",
  export: "تصدير",
  newStudent: "طالب جديد",
  filtersTitle: "فلاتر الطلاب",
  allStatuses: "كل الحالات",
  allGrades: "كل الصفوف",
  allBalances: "كل الأرصدة",
  hasBalance: "لديه رصيد",
  noBalance: "بدون رصيد",
  clearFilters: "مسح الفلاتر",
  search: "ابحث بالاسم أو الكود أو ولي الأمر",
  refresh: "تحديث",

  // Metrics
  totalStudents: "إجمالي الطلاب",
  activeStudents: "طلاب نشطون",
  outstandingBalance: "رصيد مستحق",
  overdue: "فواتير متأخرة",

  // Add Student
  addTitle: "إضافة طالب جديد",
  addDescription: "أكمل النموذج لتسجيل طالب جديد داخل نظام العباقرة.",
  personal: "البيانات الشخصية",
  guardian: "ولي الأمر",
  academic: "الدراسة",
  review: "مراجعة",
  profilePhoto: "صورة الطالب",
  uploadPhoto: "رفع صورة",
  photoHint: "JPG أو PNG أو WEBP. الحد الأقصى 5MB",
  dateOfBirth: "تاريخ الميلاد",
  gender: "النوع",
  selectGender: "اختر النوع",
  male: "ذكر",
  female: "أنثى",
  bloodGroup: "فصيلة الدم",
  selectGroup: "اختر الفصيلة",
  autoCodeHint:
    "يتم إنشاء هذا الكود تلقائيا حسب نمط التسجيل الحالي، ولا يحتاج إلى إدخال يدوي.",
  nextStep: "الخطوة التالية",
  previousStep: "السابق",
  confirmRegistration: "تأكيد التسجيل",
  saveDraft: "إضافة كمسودة",

  // Confirm Registration
  confirmRegistrationDesc:
    "يرجى مراجعة البيانات قبل تأكيد تسجيل الطالب. هذا الإجراء سيقوم بإنشاء حساب للطالب وولي الأمر.",
  registerNow: "تسجيل الآن",
  backToReview: "العودة للمراجعة",
  confirmationWarning:
    "سيتم إنشاء حسابات للطالب وولي الأمر. تأكد من صحة البيانات قبل المتابعة.",
  registering: "جاري التسجيل...",

  // Edit Student
  editTitle: "تعديل بيانات الطالب",
  editDescription: "قم بتعديل بيانات الطالب في النظام.",
  saveChanges: "حفظ التغييرات",
  saving: "جاري الحفظ...",

  // Delete
  delete: "حذف",
  deleteConfirm: "تأكيد الحذف",
  deleteMessage:
    "هل أنت متأكد من حذف هذا الطالب؟ هذا الإجراء لا يمكن التراجع عنه.",
  deleting: "جاري الحذف...",

  // Credentials
  credentials: "بيانات الدخول",
  studentEmail: "البريد الإلكتروني للطالب",
  studentPassword: "كلمة مرور الطالب",
  parentEmail: "البريد الإلكتروني لولي الأمر",
  parentPassword: "كلمة مرور ولي الأمر",
  sendWhatsApp: "إرسال عبر واتساب",
  parentPhoneRequired: "رقم واتساب ولي الأمر مطلوب لإرسال البيانات",
  credentialsSent: "تم إرسال بيانات الدخول عبر واتساب",

  // WhatsApp Message
  whatsappMessageHeader: "🎓 *مرحباً ولي الأمر الكريم*\n\nتم تسجيل ابنكم/ابنتكم",
  whatsappMessageBody: "في نظام العباقرة التعليمي.",
  studentCredentialsLabel: "بيانات الدخول للطالب",
  parentCredentialsLabel: "بيانات الدخول لولي الأمر",
  emailLabel: "البريد الإلكتروني",
  passwordLabel: "كلمة المرور",
  loginLink: "رابط الدخول: [الضغط هنا للدخول]",
  whatsappFooter: "يرجى الاحتفاظ بهذه البيانات للاستخدام المستقبلي.",

  // Status Messages
  studentAdded: "تم إضافة الطالب بنجاح",
  studentDeleted: "تم حذف الطالب بنجاح",
  studentUpdated: "تم تحديث بيانات الطالب بنجاح",
};

const englishContent = {
  // General
  loading: "Loading student data...",
  errorPrefix: "Error:",
  loadError: "Unable to load students",
  success: "Success",
  error: "Error",
  cancel: "Cancel",
  confirm: "Confirm",

  // Student Fields
  studentId: "Student ID",
  fullName: "Student Name",
  parent: "Parent",
  parentWhatsapp: "Parent WhatsApp",
  countryCode: "Country Code",
  stageGrade: "Stage / Grade",
  grade: "Grade",
  school: "School",
  status: "Status",
  active: "Active",
  inactive: "Inactive",
  groups: "Groups",
  balance: "Balance",
  registered: "Registered",
  code: "Code",
  student: "Student",
  whatsapp: "WhatsApp",
  unknownGrade: "Not assigned",
  unknownParent: "No parent linked",

  // Filters
  filter: "Filter",
  export: "Export",
  newStudent: "New Student",
  filtersTitle: "Student Filters",
  allStatuses: "All Statuses",
  allGrades: "All Grades",
  allBalances: "All Balances",
  hasBalance: "Has Balance",
  noBalance: "No Balance",
  clearFilters: "Clear Filters",
  search: "Search by name, code, or parent",
  refresh: "Refresh",

  // Metrics
  totalStudents: "Total Students",
  activeStudents: "Active Students",
  outstandingBalance: "Outstanding Balance",
  overdue: "Overdue Invoices",

  // Add Student
  addTitle: "Add New Student",
  addDescription: "Complete the form to enroll a new student into Al Abakera.",
  personal: "Personal",
  guardian: "Parent/Guardian",
  academic: "Academic",
  review: "Review",
  profilePhoto: "Profile Photo",
  uploadPhoto: "Upload Photo",
  photoHint: "JPG, PNG or WEBP. Max size 5MB",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  selectGender: "Select Gender",
  male: "Male",
  female: "Female",
  bloodGroup: "Blood Group",
  selectGroup: "Select Group",
  autoCodeHint:
    "This ID is auto-generated based on current enrollment patterns.",
  nextStep: "Next Step",
  previousStep: "Previous",
  confirmRegistration: "Confirm Registration",
  saveDraft: "Add as Draft",

  // Confirm Registration
  confirmRegistrationDesc:
    "Please review the data before confirming student registration. This action will create accounts for the student and parent.",
  registerNow: "Register Now",
  backToReview: "Back to Review",
  confirmationWarning:
    "Accounts will be created for the student and parent. Please verify the data before proceeding.",
  registering: "Registering...",

  // Edit Student
  editTitle: "Edit Student",
  editDescription: "Update student information in the system.",
  saveChanges: "Save Changes",
  saving: "Saving...",

  // Delete
  delete: "Delete",
  deleteConfirm: "Confirm Delete",
  deleteMessage:
    "Are you sure you want to delete this student? This action cannot be undone.",
  deleting: "Deleting...",

  // Credentials
  credentials: "Login Credentials",
  studentEmail: "Student Email",
  studentPassword: "Student Password",
  parentEmail: "Parent Email",
  parentPassword: "Parent Password",
  sendWhatsApp: "Send via WhatsApp",
  parentPhoneRequired: "Parent WhatsApp number is required to send credentials",
  credentialsSent: "Credentials sent via WhatsApp",

  // WhatsApp Message
  whatsappMessageHeader: "🎓 *Dear Parent*\n\nYour child",
  whatsappMessageBody: "has been registered in Al Abakera educational system.",
  studentCredentialsLabel: "Student Login Credentials",
  parentCredentialsLabel: "Parent Login Credentials",
  emailLabel: "Email",
  passwordLabel: "Password",
  loginLink: "Login Link: [Click here to login]",
  whatsappFooter: "Please keep this information for future use.",

  // Status Messages
  studentAdded: "Student added successfully",
  studentDeleted: "Student deleted successfully",
  studentUpdated: "Student updated successfully",
};