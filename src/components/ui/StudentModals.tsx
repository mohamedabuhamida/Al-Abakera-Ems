"use client";

import { Student } from "@/core/types";
import {
  X,
  Shield,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Camera,
  Send,
  Copy,
  Check,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Field, SelectField } from "./FormFields";
import { GroupSelectField } from "./GroupSelectField";

interface StudentModalsProps {
  // Add Student Modal
  isAddOpen: boolean;
  setIsAddOpen: (value: boolean) => void;
  addStep: number;
  setAddStep: (value: number) => void;
  newStudent: any;
  updateNewStudent: (field: string, value: string) => void;
  generatedStudentCode: string;
  stages: any[];
  grades: any[];
  isLoadingStages: boolean;
  selectedStageId: string;
  handleStageChange: (stageId: string) => void;
  groups: any[];
  isLoadingGroups: boolean;
  selectedCountryCode: string;
  setSelectedCountryCode: (value: string) => void;
  COUNTRY_CODES: Array<{ code: string; label: string }>;
  isStepValid: (step: number) => boolean;
  handleStepChange: (step: number) => void;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  openConfirmModal: () => void;
  isLoading: boolean;
  getStageName: (stageId: string) => string;
  getGradeName: (gradeId: string) => string;

  // Edit Student Modal
  isEditModalOpen: boolean;
  setIsEditModalOpen: (value: boolean) => void;
  editingStudent: Student | null;
  formData: any;
  updateEditingStudent: (field: string, value: string) => void;
  selectedGroups: string[];
  setSelectedGroups: (values: string[]) => void;
  handleEditStudent: (e: React.FormEvent) => Promise<void>;

  // Delete Modal
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (value: boolean) => void;
  handleDeleteStudent: () => Promise<void>;

  // Confirmation Modal
  isConfirmModalOpen: boolean;
  setIsConfirmModalOpen: (value: boolean) => void;
  handleConfirmRegistration: () => Promise<void>;

  // Credentials Modal
  credentials: any;
  setCredentials: (value: any) => void;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
  isSendingWhatsApp: boolean;
  sendCredentialsViaWhatsApp: () => void;

  language: string;
  content: any;
}

export function StudentModals({
  // Add Student Modal
  isAddOpen,
  setIsAddOpen,
  addStep,
  setAddStep,
  newStudent,
  updateNewStudent,
  generatedStudentCode,
  stages,
  grades,
  isLoadingStages,
  selectedStageId,
  handleStageChange,
  groups,
  isLoadingGroups,
  selectedCountryCode,
  setSelectedCountryCode,
  COUNTRY_CODES,
  isStepValid,
  handleStepChange,
  handleNextStep,
  handlePreviousStep,
  openConfirmModal,
  isLoading,
  getStageName,
  getGradeName,

  // Edit Student Modal
  isEditModalOpen,
  setIsEditModalOpen,
  editingStudent,
  formData,
  updateEditingStudent,
  selectedGroups,
  setSelectedGroups,
  handleEditStudent,

  // Delete Modal
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  handleDeleteStudent,

  // Confirmation Modal
  isConfirmModalOpen,
  setIsConfirmModalOpen,
  handleConfirmRegistration,

  // Credentials Modal
  credentials,
  setCredentials,
  copiedField,
  copyToClipboard,
  isSendingWhatsApp,
  sendCredentialsViaWhatsApp,

  language,
  content,
}: StudentModalsProps) {
  return (
    <>
      {/* Add Student Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant p-6">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">
                  {content.addTitle}
                </h2>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                  {content.addDescription}
                </p>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-on-primary">
                {language === "ar"
                  ? `الخطوة ${addStep + 1} من 4`
                  : `Step ${addStep + 1} of 4`}
              </span>
            </div>

            <div className="border-b border-outline-variant px-6 py-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  content.personal,
                  content.guardian,
                  content.academic,
                  content.review,
                ].map((step, index) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => handleStepChange(index)}
                    className="text-start"
                  >
                    <span
                      className={`block h-1 rounded-full ${
                        index <= addStep
                          ? "bg-primary"
                          : "bg-surface-container-high"
                      }`}
                    />
                    <span
                      className={`mt-2 block text-xs font-semibold ${
                        index === addStep
                          ? "text-primary"
                          : index < addStep
                          ? "text-on-surface-variant"
                          : "text-on-surface-variant/50"
                      }`}
                    >
                      {step}
                    </span>
                    {index < addStep && isStepValid(index) && (
                      <span className="block text-[8px] text-success">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[360px] p-6">
              {addStep === 0 && (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
                  <div>
                    <p className="mb-3 text-sm font-semibold text-on-surface">
                      {content.profilePhoto}
                    </p>
                    <div className="flex aspect-square max-w-[184px] flex-col items-center justify-center rounded-default border border-dashed border-outline bg-surface-container-low text-on-surface-variant">
                      <Camera size={30} />
                      <span className="mt-3 text-xs font-semibold">
                        {content.uploadPhoto}
                      </span>
                    </div>
                    <p className="mt-3 max-w-[184px] text-center text-xs leading-5 text-on-surface-variant">
                      {content.photoHint}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Field
                        label={content.fullName}
                        value={newStudent.full_name}
                        required
                        onChange={(value) => updateNewStudent("full_name", value)}
                      />
                    </div>
                    <Field
                      label={content.studentId}
                      value={generatedStudentCode}
                      readOnly
                      onChange={() => undefined}
                    />
                    <Field
                      label={content.dateOfBirth}
                      value={newStudent.date_of_birth}
                      type="date"
                      onChange={(value) => updateNewStudent("date_of_birth", value)}
                    />
                    <SelectField
                      label={content.gender}
                      value={newStudent.gender}
                      onChange={(value) => updateNewStudent("gender", value)}
                      options={[
                        { value: "", label: content.selectGender },
                        { value: "male", label: content.male },
                        { value: "female", label: content.female },
                      ]}
                    />
                    <SelectField
                      label={content.bloodGroup}
                      value={newStudent.blood_group}
                      onChange={(value) => updateNewStudent("blood_group", value)}
                      options={[
                        { value: "", label: content.selectGroup },
                        { value: "A+", label: "A+" },
                        { value: "A-", label: "A-" },
                        { value: "B+", label: "B+" },
                        { value: "B-", label: "B-" },
                        { value: "O+", label: "O+" },
                        { value: "O-", label: "O-" },
                        { value: "AB+", label: "AB+" },
                        { value: "AB-", label: "AB-" },
                      ]}
                    />
                    <div className="md:col-span-2 rounded-default border border-secondary-container/40 bg-secondary-fixed p-4 text-sm leading-6 text-on-secondary-fixed">
                      <div className="flex gap-3">
                        <AlertCircle size={18} className="mt-0.5 shrink-0 text-secondary" />
                        <p>{content.autoCodeHint}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {addStep === 1 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field
                    label={content.parent}
                    value={newStudent.parent_name}
                    onChange={(value) => updateNewStudent("parent_name", value)}
                  />
                  <div className="space-y-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-on-surface-variant">
                        {content.countryCode}
                      </span>
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
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
                    value={newStudent.whatsapp_number}
                    onChange={(value) => updateNewStudent("whatsapp_number", value)}
                    placeholder="123456789"
                  />
                </div>
              )}

              {addStep === 2 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-on-surface-variant">
                        {content.stageGrade}
                      </span>
                      <select
                        value={selectedStageId}
                        onChange={(e) => handleStageChange(e.target.value)}
                        className="input-field w-full"
                        disabled={isLoadingStages}
                      >
                        <option value="">
                          {language === "ar" ? "اختر المرحلة" : "Select Stage"}
                        </option>
                        {stages.map((stage) => (
                          <option key={stage.id} value={stage.id}>
                            {language === "ar" ? stage.name_ar : stage.name_en}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-on-surface-variant">
                        {content.grade}
                      </span>
                      <select
                        value={newStudent.grade}
                        onChange={(e) => updateNewStudent("grade", e.target.value)}
                        className="input-field w-full"
                        disabled={isLoadingStages || grades.length === 0}
                      >
                        <option value="">
                          {language === "ar" ? "اختر الصف" : "Select Grade"}
                        </option>
                        {grades.map((grade) => (
                          <option key={grade.id} value={grade.id}>
                            {language === "ar" ? grade.name_ar : grade.name_en}
                            {selectedStageId &&
                              ` (${language === "ar" ? "المرحلة" : "Stage"})`}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <Field
                    label={content.school}
                    value={newStudent.school}
                    onChange={(value) => updateNewStudent("school", value)}
                  />
                  <SelectField
                    label={content.status}
                    value={newStudent.status}
                    onChange={(value) => updateNewStudent("status", value)}
                    options={[
                      { value: "active", label: content.active },
                      { value: "inactive", label: content.inactive },
                    ]}
                  />

                  <div className="md:col-span-2">
                    <GroupSelectField
                      label={
                        language === "ar"
                          ? "المجموعات الدراسية"
                          : "Study Groups"
                      }
                      value={newStudent.group_ids}
                      options={groups.map((g) => ({
                        value: g.id,
                        label: g.display_name || g.name,
                      }))}
                      onChange={(values:any) =>
                        updateNewStudent("group_ids", values as any)
                      }
                      isLoading={isLoadingGroups}
                      placeholder={
                        language === "ar"
                          ? "اختر المجموعات الدراسية"
                          : "Select study groups"
                      }
                      language={language}
                    />
                    {groups.length === 0 && !isLoadingGroups && (
                      <p className="text-xs text-warning mt-1">
                        {language === "ar"
                          ? "لا توجد مجموعات دراسية متاحة. قم بإنشاء مجموعات أولاً."
                          : "No study groups available. Please create groups first."}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {addStep === 3 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    [content.studentId, generatedStudentCode],
                    [content.fullName, newStudent.full_name || "-"],
                    [content.parent, newStudent.parent_name || "-"],
                    [
                      content.parentWhatsapp,
                      newStudent.whatsapp_number
                        ? `${selectedCountryCode}${newStudent.whatsapp_number}`
                        : "-",
                    ],
                    [
                      content.stageGrade,
                      selectedStageId ? getStageName(selectedStageId) : "-",
                    ],
                    [
                      content.grade,
                      newStudent.grade ? getGradeName(newStudent.grade) : "-",
                    ],
                    [content.school, newStudent.school || "-"],
                    [
                      content.status,
                      newStudent.status === "active"
                        ? content.active
                        : content.inactive,
                    ],
                    [
                      language === "ar" ? "المجموعات" : "Groups",
                      newStudent.group_ids.length > 0
                        ? newStudent.group_ids
                            .map((id: string) => {
                              const group = groups.find((g) => g.id === id);
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
              )}
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setAddStep(0);
                }}
                className="btn-secondary"
              >
                <X size={16} />
                {content.cancel}
              </button>
              <div className="flex gap-2">
                {addStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="btn-secondary"
                    disabled={isLoading}
                  >
                    <ArrowLeft size={16} />
                    {content.previousStep}
                  </button>
                )}
                {addStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn-primary"
                    disabled={
                      isLoading ||
                      (addStep === 0 && !newStudent.full_name.trim())
                    }
                  >
                    {content.nextStep}
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openConfirmModal}
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    <ShieldCheck size={16} />
                    {content.confirmRegistration}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <Shield size={24} className="text-primary" />
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
                  [content.studentId, generatedStudentCode],
                  [content.fullName, newStudent.full_name || "-"],
                  [content.parent, newStudent.parent_name || "-"],
                  [
                    content.parentWhatsapp,
                    newStudent.whatsapp_number
                      ? `${selectedCountryCode}${newStudent.whatsapp_number}`
                      : "-",
                  ],
                  [content.stageGrade, newStudent.educational_stage || "-"],
                  [content.grade, newStudent.grade || "-"],
                  [content.school, newStudent.school || "-"],
                  [
                    content.status,
                    newStudent.status === "active"
                      ? content.active
                      : content.inactive,
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
                <p>
                  {language === "ar"
                    ? "سيتم إنشاء حسابات للطالب وولي الأمر. تأكد من صحة البيانات قبل المتابعة."
                    : "Accounts will be created for the student and parent. Please verify the data before proceeding."}
                </p>
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
                {isLoading ? "Registering..." : content.registerNow}
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
                {isLoading ? "Deleting..." : content.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && editingStudent && (
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
                onClick={() => {
                  setIsEditModalOpen(false);
                }}
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
                    value={formData.full_name}
                    required
                    onChange={(value) => updateEditingStudent("full_name", value)}
                  />
                </div>
                <Field
                  label={content.parent}
                  value={formData.parent_name}
                  onChange={(value) => updateEditingStudent("parent_name", value)}
                />
                <div className="space-y-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-on-surface-variant">
                      {content.countryCode}
                    </span>
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
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
                  value={formData.whatsapp_number}
                  onChange={(value) => updateEditingStudent("whatsapp_number", value)}
                  placeholder="123456789"
                />

                <div className="space-y-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-on-surface-variant">
                      {content.stageGrade}
                    </span>
                    <select
                      value={selectedStageId}
                      onChange={(e) => handleStageChange(e.target.value)}
                      className="input-field w-full"
                      disabled={isLoadingStages}
                    >
                      <option value="">
                        {language === "ar" ? "اختر المرحلة" : "Select Stage"}
                      </option>
                      {stages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {language === "ar" ? stage.name_ar : stage.name_en}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-on-surface-variant">
                      {content.grade}
                    </span>
                    <select
                      value={formData.grade}
                      onChange={(e) => updateEditingStudent("grade", e.target.value)}
                      className="input-field w-full"
                      disabled={isLoadingStages || grades.length === 0}
                    >
                      <option value="">
                        {language === "ar" ? "اختر الصف" : "Select Grade"}
                      </option>
                      {grades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                          {language === "ar" ? grade.name_ar : grade.name_en}
                          {selectedStageId &&
                            ` (${language === "ar" ? "المرحلة" : "Stage"})`}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <Field
                  label={content.school}
                  value={formData.school}
                  onChange={(value) => updateEditingStudent("school", value)}
                />
                <SelectField
                  label={content.status}
                  value={formData.status}
                  onChange={(value) => updateEditingStudent("status", value)}
                  options={[
                    { value: "active", label: content.active },
                    { value: "inactive", label: content.inactive },
                  ]}
                />

                <div className="md:col-span-2">
                  <GroupSelectField
                    label={
                      language === "ar"
                        ? "المجموعات الدراسية"
                        : "Study Groups"
                    }
                    value={selectedGroups}
                    options={groups.map((g) => ({
                      value: g.id,
                      label: g.display_name || g.name,
                    }))}
                    onChange={(values:any) => setSelectedGroups(values)}
                    isLoading={isLoadingGroups}
                    placeholder={
                      language === "ar"
                        ? "اختر المجموعات الدراسية"
                        : "Select study groups"
                    }
                    language={language}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                }}
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
                {isLoading ? "Saving..." : content.saveChanges}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Credentials Modal with WhatsApp Send */}
      {credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-on-surface">
              {content.credentials}
            </h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-on-surface-variant">
                    {content.studentEmail}
                  </p>
                  <p className="text-sm text-on-surface">
                    {credentials.studentCredentials.email}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      credentials.studentCredentials.email,
                      "student-email"
                    )
                  }
                  className="p-1 hover:bg-surface-container-high rounded"
                >
                  {copiedField === "student-email" ? (
                    <Check size={16} className="text-success" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-on-surface-variant">
                    {content.studentPassword}
                  </p>
                  <p className="text-sm text-on-surface">
                    {credentials.studentCredentials.password}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      credentials.studentCredentials.password,
                      "student-password"
                    )
                  }
                  className="p-1 hover:bg-surface-container-high rounded"
                >
                  {copiedField === "student-password" ? (
                    <Check size={16} className="text-success" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-on-surface-variant">
                    {content.parentEmail}
                  </p>
                  <p className="text-sm text-on-surface">
                    {credentials.parentCredentials.email}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      credentials.parentCredentials.email,
                      "parent-email"
                    )
                  }
                  className="p-1 hover:bg-surface-container-high rounded"
                >
                  {copiedField === "parent-email" ? (
                    <Check size={16} className="text-success" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-on-surface-variant">
                    {content.parentPassword}
                  </p>
                  <p className="text-sm text-on-surface">
                    {credentials.parentCredentials.password}
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      credentials.parentCredentials.password,
                      "parent-password"
                    )
                  }
                  className="p-1 hover:bg-surface-container-high rounded"
                >
                  {copiedField === "parent-password" ? (
                    <Check size={16} className="text-success" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-outline-variant">
                <button
                  onClick={sendCredentialsViaWhatsApp}
                  disabled={isSendingWhatsApp || !credentials.parentWhatsapp}
                  className="btn-primary w-full"
                >
                  <Send size={16} />
                  {isSendingWhatsApp ? "Sending..." : content.sendWhatsApp}
                </button>
                {!credentials.parentWhatsapp && (
                  <p className="text-xs text-on-surface-variant mt-2">
                    {content.parentPhoneRequired}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setCredentials(null);
                }}
                className="btn-secondary"
              >
                {content.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}