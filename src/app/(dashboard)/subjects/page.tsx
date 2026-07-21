"use client";

import { useLanguage } from "@/core/i18n/useLanguage";
import {
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  X,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Loader2,
} from "lucide-react";
import { type FormEvent, useCallback, useMemo, useState, useEffect } from "react";
import { createClient } from "@/core/supabase/client";
import { 
  createSubject, 
  updateSubject, 
  deleteSubject,
  getSubjectTeachers 
} from "./actions";

type Subject = {
  id: string;
  name_ar: string;
  name_en: string | null;
  code: string | null;
  color: string;
  description: string | null;
  created_at: string;
  teacher_count: number;
};

const copy = {
  ar: {
    title: "المواد الدراسية",
    loading: "جاري تحميل المواد...",
    errorPrefix: "حدث خطأ:",
    loadError: "تعذر تحميل المواد",
    addSubject: "إضافة مادة",
    editSubject: "تعديل مادة",
    deleteSubject: "حذف مادة",
    deleteConfirm: "هل أنت متأكد من حذف هذه المادة؟",
    deleteMessage: "لا يمكن حذف المادة إذا كانت مستخدمة من قبل معلمين.",
    nameAr: "الاسم (عربي)",
    nameEn: "الاسم (إنجليزي)",
    code: "الكود",
    color: "اللون",
    description: "الوصف",
    search: "ابحث بالاسم أو الكود",
    refresh: "تحديث",
    totalSubjects: "إجمالي المواد",
    teachers: "المعلمين",
    teachersCount: "عدد المعلمين",
    cancel: "إلغاء",
    save: "حفظ",
    update: "تحديث",
    success: "تم بنجاح",
    error: "حدث خطأ",
    subjectAdded: "تم إضافة المادة بنجاح",
    subjectUpdated: "تم تحديث المادة بنجاح",
    subjectDeleted: "تم حذف المادة بنجاح",
    noSubjects: "لا توجد مواد دراسية",
    codePlaceholder: "مثل: MATH, AR, EN",
    teachersList: "قائمة المعلمين",
    noTeachers: "لا يوجد معلمين لهذه المادة",
    back: "رجوع",
  },
  en: {
    title: "Subjects",
    loading: "Loading subjects...",
    errorPrefix: "Error:",
    loadError: "Unable to load subjects",
    addSubject: "Add Subject",
    editSubject: "Edit Subject",
    deleteSubject: "Delete Subject",
    deleteConfirm: "Are you sure you want to delete this subject?",
    deleteMessage: "Cannot delete subject if it's being used by teachers.",
    nameAr: "Name (Arabic)",
    nameEn: "Name (English)",
    code: "Code",
    color: "Color",
    description: "Description",
    search: "Search by name or code",
    refresh: "Refresh",
    totalSubjects: "Total Subjects",
    teachers: "Teachers",
    teachersCount: "Teachers Count",
    cancel: "Cancel",
    save: "Save",
    update: "Update",
    success: "Success",
    error: "Error",
    subjectAdded: "Subject added successfully",
    subjectUpdated: "Subject updated successfully",
    subjectDeleted: "Subject deleted successfully",
    noSubjects: "No subjects found",
    codePlaceholder: "e.g., MATH, AR, EN",
    teachersList: "Teachers List",
    noTeachers: "No teachers for this subject",
    back: "Back",
  },
};

// Predefined colors for subjects
const SUBJECT_COLORS = [
  '#16a34a', '#2563eb', '#dc2626', '#7c3aed', '#0891b2', '#65a30d',
  '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#6366f1',
  '#84cc16', '#06b6d4', '#d946ef',
];

function Field({
  label,
  value,
  type = "text",
  required,
  readOnly,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-on-surface-variant">
        {label}
      </span>
      {type === "textarea" ? (
        <textarea
          value={value}
          required={required}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="input-field w-full min-h-[80px] read-only:bg-surface-container-low read-only:text-on-surface-variant"
          rows={3}
        />
      ) : (
        <input
          type={type}
          value={value}
          required={required}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="input-field w-full read-only:bg-surface-container-low read-only:text-on-surface-variant"
        />
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string | React.ReactNode }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-on-surface-variant">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input-field w-full"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-on-surface-variant">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-on-surface">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-default bg-primary-fixed text-on-primary-fixed-variant">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function SubjectsPage() {
  const { language } = useLanguage();
  const content = copy[language];
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isViewTeachersOpen, setIsViewTeachersOpen] = useState(false);
  const [subjectTeachers, setSubjectTeachers] = useState<any[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    code: "",
    color: "#16a34a",
    description: "",
  });

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Try the RPC function
      const { data: result, error: rpcError } = await supabase
        .rpc('get_subjects_data');

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        // Fallback: Direct query
        const { data: subjectsData, error: queryError } = await supabase
          .schema('academic')
          .from('subjects')
          .select('*')
          .order('name_ar', { ascending: true });

        if (queryError) throw queryError;

        // Get teacher counts
        const { data: teacherCounts, error: countError } = await supabase
          .schema('academic')
          .from('teacher_subjects')
          .select('subject_id');

        if (!countError && teacherCounts) {
          const counts: Record<string, number> = {};
          teacherCounts.forEach((tc: any) => {
            counts[tc.subject_id] = (counts[tc.subject_id] || 0) + 1;
          });
          
          const subjectsWithCounts = (subjectsData || []).map((s: any) => ({
            ...s,
            teacher_count: counts[s.id] || 0,
          }));
          setSubjects(subjectsWithCounts);
        } else {
          setSubjects(subjectsData || []);
        }
      } else if (result?.subjects) {
        // Make sure we're setting the subjects with teacher_count
        console.log('Subjects data received:', result.subjects);
        setSubjects(result.subjects);
      } else {
        setSubjects([]);
      }
    } catch (err: any) {
      console.error('Failed to load subjects:', err);
      setError(err.message || 'SUBJECTS_LOAD_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const filteredSubjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return subjects;

    return subjects.filter((subject) =>
      subject.name_ar.toLowerCase().includes(query) ||
      subject.name_en?.toLowerCase().includes(query) ||
      subject.code?.toLowerCase().includes(query)
    );
  }, [subjects, searchTerm]);

  const metrics = useMemo(() => {
    return {
      total: subjects.length,
      withTeachers: subjects.filter((s) => s.teacher_count > 0).length,
    };
  }, [subjects]);

  const numberFormatter = useMemo(() => new Intl.NumberFormat('en'), []);

  const resetForm = () => {
    setFormData({
      name_ar: "",
      name_en: "",
      code: "",
      color: "#16a34a",
      description: "",
    });
  };

  const handleAddSubject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setNotification(null);

    try {
      const result = await createSubject(formData);
      if (result.success) {
        setNotification({ type: 'success', message: content.subjectAdded });
        setIsAddOpen(false);
        resetForm();
        await fetchSubjects();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || content.error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSubject) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const result = await updateSubject(selectedSubject.id, formData);
      if (result.success) {
        setNotification({ type: 'success', message: content.subjectUpdated });
        setIsEditOpen(false);
        setSelectedSubject(null);
        resetForm();
        await fetchSubjects();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || content.error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const result = await deleteSubject(selectedSubject.id);
      if (result.success) {
        setNotification({ type: 'success', message: content.subjectDeleted });
        setIsDeleteOpen(false);
        setSelectedSubject(null);
        await fetchSubjects();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || content.error });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      name_ar: subject.name_ar,
      name_en: subject.name_en || "",
      code: subject.code || "",
      color: subject.color || "#16a34a",
      description: subject.description || "",
    });
    setIsEditOpen(true);
  };

  const openDeleteModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteOpen(true);
  };

  const viewTeachers = async (subject: Subject) => {
    setIsLoadingTeachers(true);
    try {
      const result = await getSubjectTeachers(subject.id);
      if (result.success) {
        setSubjectTeachers(result.data);
        setSelectedSubject(subject);
        setIsViewTeachersOpen(true);
      }
    } catch (err) {
      console.error("Failed to load teachers:", err);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  if (loading) {
    return (
      <div className="surface-card p-8 text-center text-sm text-on-surface-variant">
        {content.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-default border border-error/30 bg-error-container p-8 text-center text-sm text-on-error-container">
        {content.errorPrefix}{" "}
        {error === "SUBJECTS_LOAD_FAILED" ? content.loadError : error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`rounded-default p-4 ${
          notification.type === 'success' 
            ? 'bg-secondary-fixed text-on-secondary-fixed' 
            : 'bg-error-container text-on-error-container'
        }`}>
          <p className="text-sm font-semibold">{notification.message}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 border-b border-outline-variant pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[30px] font-semibold leading-9 tracking-[-0.01em] text-on-surface">
            {content.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
            {content.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="btn-primary"
          >
            <Plus size={16} />
            {content.addSubject}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MetricCard
          label={content.totalSubjects}
          value={numberFormatter.format(metrics.total)}
          icon={<BookOpen size={20} />}
        />
        <MetricCard
          label={content.teachers}
          value={numberFormatter.format(metrics.withTeachers)}
          icon={<Users size={20} />}
        />
      </div>

      <section className="surface-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex h-10 w-full items-center gap-2 rounded-default border border-outline-variant bg-surface-container-low px-3 xl:max-w-md">
            <Search size={16} className="text-on-surface-variant" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={content.search}
              className="w-full border-none bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70"
            />
          </div>
          <button
            type="button"
            onClick={fetchSubjects}
            className="btn-secondary self-start xl:self-auto"
          >
            <RefreshCw size={16} />
            {content.refresh}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-start">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="label-caps px-6 py-3">#</th>
                <th className="label-caps px-6 py-3">{content.nameAr}</th>
                <th className="label-caps px-6 py-3">{content.nameEn}</th>
                <th className="label-caps px-6 py-3">{content.code}</th>
                <th className="label-caps px-6 py-3">{content.teachersCount}</th>
                <th className="label-caps px-6 py-3">{content.description}</th>
                <th className="label-caps px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-on-surface-variant"
                  >
                    {content.noSubjects}
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject, index) => (
                  <tr
                    key={subject.id}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-4 w-4 rounded-full shrink-0"
                          style={{ backgroundColor: subject.color || '#16a34a' }}
                        />
                        <span className="text-sm font-semibold text-on-surface">
                          {subject.name_ar}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {subject.name_en || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-sm bg-surface-container px-2 py-1 font-mono text-xs font-semibold text-on-surface-variant">
                        {subject.code || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => viewTeachers(subject)}
                        className={`inline-flex items-center gap-1 text-sm font-semibold ${
                          subject.teacher_count > 0 
                            ? 'text-primary hover:underline' 
                            : 'text-on-surface-variant'
                        }`}
                      >
                        <Users size={14} />
                        {subject.teacher_count || 0}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant max-w-[200px] truncate">
                      {subject.description || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(subject)}
                          className="rounded p-1 hover:bg-surface-container-high"
                          title={content.editSubject}
                        >
                          <Edit size={16} className="text-primary" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(subject)}
                          className="rounded p-1 hover:bg-surface-container-high"
                          title={content.deleteSubject}
                          disabled={subject.teacher_count > 0}
                        >
                          <Trash2 size={16} className={subject.teacher_count > 0 ? "text-on-surface-variant/40" : "text-error"} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Subject Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleAddSubject}
            className="surface-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0"
          >
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant p-6">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">
                  {content.addSubject}
                </h2>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                  {content.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  resetForm();
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
                    label={content.nameAr}
                    value={formData.name_ar}
                    required
                    onChange={(value) => setFormData({ ...formData, name_ar: value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Field
                    label={content.nameEn}
                    value={formData.name_en}
                    onChange={(value) => setFormData({ ...formData, name_en: value })}
                  />
                </div>
                <Field
                  label={content.code}
                  value={formData.code}
                  placeholder={content.codePlaceholder}
                  onChange={(value) => setFormData({ ...formData, code: value })}
                />
                <SelectField
                  label={content.color}
                  value={formData.color}
                  onChange={(value) => setFormData({ ...formData, color: value })}
                  options={SUBJECT_COLORS.map((color) => ({
                    value: color,
                    label: (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
                        <span>{color}</span>
                      </div>
                    ),
                  }))}
                />
                <div className="md:col-span-2">
                  <Field
                    label={content.description}
                    value={formData.description}
                    type="textarea"
                    onChange={(value) => setFormData({ ...formData, description: value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  resetForm();
                }}
                className="btn-secondary"
                disabled={isLoading}
              >
                {content.cancel}
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? "Saving..." : content.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Subject Modal */}
      {isEditOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleEditSubject}
            className="surface-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0"
          >
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant p-6">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">
                  {content.editSubject}
                </h2>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                  {content.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedSubject(null);
                  resetForm();
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
                    label={content.nameAr}
                    value={formData.name_ar}
                    required
                    onChange={(value) => setFormData({ ...formData, name_ar: value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Field
                    label={content.nameEn}
                    value={formData.name_en}
                    onChange={(value) => setFormData({ ...formData, name_en: value })}
                  />
                </div>
                <Field
                  label={content.code}
                  value={formData.code}
                  placeholder={content.codePlaceholder}
                  onChange={(value) => setFormData({ ...formData, code: value })}
                />
                <SelectField
                  label={content.color}
                  value={formData.color}
                  onChange={(value) => setFormData({ ...formData, color: value })}
                  options={SUBJECT_COLORS.map((color) => ({
                    value: color,
                    label: (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
                        <span>{color}</span>
                      </div>
                    ),
                  }))}
                />
                <div className="md:col-span-2">
                  <Field
                    label={content.description}
                    value={formData.description}
                    type="textarea"
                    onChange={(value) => setFormData({ ...formData, description: value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedSubject(null);
                  resetForm();
                }}
                className="btn-secondary"
                disabled={isLoading}
              >
                {content.cancel}
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? "Updating..." : content.update}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-on-surface">{content.deleteSubject}</h3>
            <p className="mt-2 text-sm text-on-surface-variant">{content.deleteConfirm}</p>
            {selectedSubject.teacher_count > 0 && (
              <p className="mt-2 text-sm text-error">{content.deleteMessage}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedSubject(null);
                }}
                className="btn-secondary"
                disabled={isLoading}
              >
                {content.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteSubject}
                className="btn-danger"
                disabled={isLoading || selectedSubject.teacher_count > 0}
              >
                <Trash2 size={16} />
                {isLoading ? "Deleting..." : content.deleteSubject}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Teachers Modal */}
      {isViewTeachersOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant p-6">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">
                  {content.teachersList}
                </h2>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                  {selectedSubject.name_ar} - {content.teachersCount}: {subjectTeachers.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsViewTeachersOpen(false);
                  setSelectedSubject(null);
                  setSubjectTeachers([]);
                }}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {isLoadingTeachers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : subjectTeachers.length === 0 ? (
                <p className="text-center text-sm text-on-surface-variant py-8">
                  {content.noTeachers}
                </p>
              ) : (
                <div className="space-y-2">
                  {subjectTeachers.map((teacher: any) => (
                    <div
                      key={teacher.id}
                      className="flex items-center justify-between rounded-default border border-outline-variant p-3 hover:bg-surface-container-low"
                    >
                      <div>
                        <p className="font-semibold text-on-surface">{teacher.full_name}</p>
                        {teacher.email && (
                          <p className="text-sm text-on-surface-variant">{teacher.email}</p>
                        )}
                      </div>
                      <span
                        className={`rounded-sm px-2 py-1 text-xs font-semibold ${
                          teacher.status === "active"
                            ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                            : "bg-error-container text-on-error-container"
                        }`}
                      >
                        {teacher.status === "active" ? "نشط" : "غير نشط"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsViewTeachersOpen(false);
                  setSelectedSubject(null);
                  setSubjectTeachers([]);
                }}
                className="btn-secondary"
              >
                {content.back}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}