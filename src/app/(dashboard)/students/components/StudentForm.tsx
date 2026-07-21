"use client";

import { useState } from "react";
import {
  X,
  ArrowLeft,
  ArrowRight,
  Camera,
  ShieldCheck,
  Info,
  AlertCircle,
} from "lucide-react";
import { Field, SelectField } from "@/components/ui/FormFields";
import { GroupSelectField } from "@/components/ui/GroupSelectField";

interface StudentFormProps {
  // State
  isOpen: boolean;
  onClose: () => void;
  addStep: number;
  setAddStep: (step: number) => void;
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
  language: string;
  onGradeChange?: (value: string) => void; // This is defined but not used
  content: any;
}

export function StudentForm({
  isOpen,
  onClose,
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
  language,
  onGradeChange, // Received but not used
  content,
}: StudentFormProps) {
  if (!isOpen) return null;

  // Handle grade change with onGradeChange callback
  const handleGradeSelect = (value: string) => {
    updateNewStudent("grade", value);
    // Call the onGradeChange callback if provided
    if (onGradeChange) {
      onGradeChange(value);
    }
  };

  const renderStepContent = () => {
    switch (addStep) {
      case 0:
        return (
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
                  <Info size={18} className="mt-0.5 shrink-0 text-secondary" />
                  <p>{content.autoCodeHint}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
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
        );

      case 2:
        return (
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

            {/* Grade Selection - FIXED: Now calls onGradeChange */}
            <div className="space-y-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-on-surface-variant">
                  {content.grade}
                </span>
                <select
                  value={newStudent.grade}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleGradeSelect(value); // Use the new handler
                  }}
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
                  language === "ar" ? "المجموعات الدراسية" : "Study Groups"
                }
                value={newStudent.group_ids}
                options={groups.map((g) => ({
                  value: g.id,
                  label: g.display_name || g.name,
                }))}
                onChange={(values) =>
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
        );

      case 3:
        return (
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
        );

      default:
        return null;
    }
  };

  return (
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

        <div className="min-h-[360px] p-6">{renderStepContent()}</div>

        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low px-6 py-4">
          <button type="button" onClick={onClose} className="btn-secondary">
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
                  isLoading || (addStep === 0 && !newStudent.full_name.trim())
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
  );
}