"use client";

import { useLanguage } from "@/core/i18n/useLanguage";
import { useTeachers } from "./hooks/useTeachers";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  X,
  Edit,
  Trash2,
  Copy,
  Check,
  Shield,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import { type FormEvent, useCallback, useMemo, useState, useEffect } from "react";
import { saveTeacherToDatabase, deleteTeacher, updateTeacher, getSubjects } from "./actions";

type TeacherStatus = "active" | "inactive" | "suspended";

const copy = {
  ar: {
    eyebrow: "Teacher Registry",
    title: "المعلمون",
    description:
      "إدارة ملفات المعلمين: المؤهلات، الرواتب، المواد المدرسية، والمجموعات.",
    loading: "جاري تحميل بيانات المعلمين...",
    errorPrefix: "حدث خطأ:",
    loadError: "تعذر تحميل بيانات المعلمين",
    filter: "تصفية",
    export: "تصدير",
    newTeacher: "معلم جديد",
    filtersTitle: "فلاتر المعلمين",
    allStatuses: "كل الحالات",
    allSubjects: "كل المواد",
    clearFilters: "مسح الفلاتر",
    addTitle: "إضافة معلم جديد",
    addDescription: "أكمل النموذج لتسجيل معلم جديد في نظام العباقرة.",
    saveTeacher: "حفظ المعلم",
    nextStep: "الخطوة التالية",
    previousStep: "السابق",
    cancel: "إلغاء",
    personal: "البيانات الشخصية",
    professional: "البيانات المهنية",
    review: "مراجعة",
    profilePhoto: "صورة المعلم",
    uploadPhoto: "رفع صورة",
    photoHint: "JPG أو PNG أو WEBP. الحد الأقصى 5MB",
    fullName: "اسم المعلم",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    qualification: "المؤهل العلمي",
    salaryType: "نظام الراتب",
    salaryTypes: {
      fixed: "راتب ثابت",
      per_student: "لكل طالب",
      percentage: "نسبة مئوية",
      per_session: "لكل حصة"
    },
    salaryValue: "قيمة الراتب",
    status: "الحالة",
    selectStatus: "اختر الحالة",
    active: "نشط",
    inactive: "غير نشط",
    suspended: "معلق",
    bio: "السيرة الذاتية",
    subjects: "المواد الدراسية",
    selectSubjects: "اختر المواد",
    search: "ابحث بالاسم أو البريد أو التخصص",
    refresh: "تحديث",
    totalTeachers: "إجمالي المعلمين",
    activeTeachers: "معلمين نشطين",
    totalStudents: "إجمالي الطلاب",
    activeGroups: "مجموعات نشطة",
    teacher: "المعلم",
    qualificationLabel: "المؤهل",
    salary: "الراتب",
    subjectCount: "المواد",
    students: "الطلاب",
    groups: "المجموعات",
    noTeachers: "لا يوجد معلمين مطابقين حالياً.",
    delete: "حذف",
    edit: "تعديل",
    deleteConfirm: "تأكيد الحذف",
    deleteMessage: "هل أنت متأكد من حذف هذا المعلم؟ هذا الإجراء لا يمكن التراجع عنه.",
    confirm: "تأكيد",
    editTitle: "تعديل بيانات المعلم",
    editDescription: "قم بتعديل بيانات المعلم في النظام.",
    saveChanges: "حفظ التغييرات",
    success: "تم بنجاح",
    error: "حدث خطأ",
    teacherAdded: "تم إضافة المعلم بنجاح",
    teacherDeleted: "تم حذف المعلم بنجاح",
    teacherUpdated: "تم تحديث بيانات المعلم بنجاح",
    credentials: "بيانات الدخول",
    emailLabel: "البريد الإلكتروني",
    password: "كلمة المرور",
    copyCredentials: "نسخ البيانات",
    pleaseCompleteStep: "يرجى إكمال البيانات المطلوبة في هذه الخطوة أولاً",
    confirmRegistration: "تأكيد التسجيل",
    confirmRegistrationDesc: "يرجى مراجعة البيانات قبل تأكيد تسجيل المعلم.",
    registerNow: "تسجيل الآن",
    backToReview: "العودة للمراجعة",
    whatsapp: "واتساب",
  },
  en: {
    eyebrow: "Teacher Registry",
    title: "Teachers",
    description:
      "Manage teacher profiles: qualifications, salaries, subjects, and groups.",
    loading: "Loading teachers...",
    errorPrefix: "Error:",
    loadError: "Unable to load teachers",
    filter: "Filter",
    export: "Export",
    newTeacher: "New teacher",
    filtersTitle: "Teacher filters",
    allStatuses: "All statuses",
    allSubjects: "All subjects",
    clearFilters: "Clear filters",
    addTitle: "Add new teacher",
    addDescription: "Complete the form to enroll a new teacher into Al Abakera.",
    saveTeacher: "Save teacher",
    nextStep: "Next step",
    previousStep: "Previous",
    cancel: "Cancel",
    personal: "Personal",
    professional: "Professional",
    review: "Review",
    profilePhoto: "Profile photo",
    uploadPhoto: "Upload photo",
    photoHint: "JPG, PNG or WEBP. Max size 5MB",
    fullName: "Teacher name",
    email: "Email",
    phone: "Phone number",
    qualification: "Qualification",
    salaryType: "Salary type",
    salaryTypes: {
      fixed: "Fixed salary",
      per_student: "Per student",
      percentage: "Percentage",
      per_session: "Per session"
    },
    salaryValue: "Salary value",
    status: "Status",
    selectStatus: "Select status",
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
    bio: "Biography",
    subjects: "Subjects",
    selectSubjects: "Select subjects",
    search: "Search by name, email, or qualification",
    refresh: "Refresh",
    totalTeachers: "Total teachers",
    activeTeachers: "Active teachers",
    totalStudents: "Total students",
    activeGroups: "Active groups",
    teacher: "Teacher",
    qualificationLabel: "Qualification",
    salary: "Salary",
    subjectCount: "Subjects",
    students: "Students",
    groups: "Groups",
    noTeachers: "No matching teachers right now.",
    delete: "Delete",
    edit: "Edit",
    deleteConfirm: "Confirm Delete",
    deleteMessage: "Are you sure you want to delete this teacher? This action cannot be undone.",
    confirm: "Confirm",
    editTitle: "Edit Teacher",
    editDescription: "Update teacher information in the system.",
    saveChanges: "Save Changes",
    success: "Success",
    error: "Error",
    teacherAdded: "Teacher added successfully",
    teacherDeleted: "Teacher deleted successfully",
    teacherUpdated: "Teacher updated successfully",
    credentials: "Login Credentials",
    emailLabel: "Email",
    password: "Password",
    copyCredentials: "Copy Credentials",
    pleaseCompleteStep: "Please complete the required fields in this step first",
    confirmRegistration: "Confirm Registration",
    confirmRegistrationDesc: "Please review the data before confirming teacher registration.",
    registerNow: "Register Now",
    backToReview: "Back to Review",
    whatsapp: "WhatsApp",
  },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

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
          className="input-field w-full min-h-[100px] read-only:bg-surface-container-low read-only:text-on-surface-variant"
          rows={4}
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
  options: Array<{ value: string; label: string }>;
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

function MultiSelectField({
  label,
  value,
  options,
  onChange,
  isLoading,
  placeholder,
  language,
}: {
  label: string;
  value: string[];
  options: Array<{ value: string; label: string }>;
  onChange: (values: string[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  language: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-on-surface-variant">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="input-field w-full min-h-[42px] text-start flex items-center gap-2 flex-wrap"
          disabled={isLoading}
        >
          {value.length === 0 ? (
            <span className="text-on-surface-variant/70">
              {placeholder || (language === 'ar' ? 'اختر الخيارات' : 'Select options')}
            </span>
          ) : (
            value.map((v) => {
              const option = options.find((o) => o.value === v);
              return (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 rounded-sm bg-primary-fixed px-2 py-0.5 text-xs text-on-primary-fixed-variant"
                >
                  {option?.label}
                </span>
              );
            })
          )}
          {isLoading && <Loader2 size={16} className="animate-spin ml-auto" />}
        </button>
        {isOpen && !isLoading && (
          <div className="absolute z-10 mt-1 w-full rounded-default border border-outline bg-surface-container-low p-2 shadow-lg max-h-48 overflow-y-auto">
            {options.length === 0 ? (
              <div className="p-2 text-center text-sm text-on-surface-variant">
                {language === 'ar' ? 'لا توجد خيارات' : 'No options'}
              </div>
            ) : (
              options.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-sm p-2 hover:bg-surface-container-high"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                    className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-on-surface">{option.label}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
    </div>
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

export default function TeachersPage() {
  // ============================================================================
  // 1. ALL HOOKS FIRST (before any conditional returns)
  // ============================================================================
  
  const { language } = useLanguage();
  const content = copy[language];
  const { data: teachers, loading, error, refresh } = useTeachers();
  
  // All useState hooks
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addStep, setAddStep] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | TeacherStatus>("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [credentials, setCredentials] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  const [newTeacher, setNewTeacher] = useState({
    full_name: "",
    email: "",
    phone: "",
    qualification: "",
    salary_type: "",
    salary_value: "",
    status: "active" as TeacherStatus,
    bio: "",
    subject_ids: [] as string[],
  });

  // All useEffect hooks
  useEffect(() => {
    async function fetchSubjects() {
      setIsLoadingSubjects(true);
      try {
        const result = await getSubjects();
        if (result.success && result.data) {
          setSubjects(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      } finally {
        setIsLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, []);

  // All useMemo hooks
  const allTeachers = useMemo(() => teachers || [], [teachers]);
  const numberFormatter = useMemo(() => new Intl.NumberFormat('en'), []);
  
  const subjectOptions = useMemo(() => {
    return subjects.map((subject) => ({
      value: subject.id,
      label: language === 'ar' ? subject.name_ar : subject.name_en,
    }));
  }, [subjects, language]);

  const salaryTypeOptions = useMemo(() => [
    { value: "fixed", label: content.salaryTypes.fixed },
    { value: "per_student", label: content.salaryTypes.per_student },
    { value: "percentage", label: content.salaryTypes.percentage },
    { value: "per_session", label: content.salaryTypes.per_session },
  ], [content]);

  const statusOptions = useMemo(() => [
    { value: "active", label: content.active },
    { value: "inactive", label: content.inactive },
    { value: "suspended", label: content.suspended },
  ], [content]);

  const filteredTeachers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return allTeachers.filter((teacher: any) => {
      const matchesQuery =
        !query ||
        [
          teacher.full_name,
          teacher.email,
          teacher.phone,
          teacher.qualification,
          teacher.bio,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query));
      
      const matchesStatus =
        statusFilter === "all" || teacher.status === statusFilter;
      
      const matchesSubject =
        subjectFilter === "all" || 
        teacher.subjects?.some((s: any) => s.id === subjectFilter);

      return matchesQuery && matchesStatus && matchesSubject;
    });
  }, [allTeachers, searchTerm, statusFilter, subjectFilter]);

  const metrics = useMemo(() => {
    return allTeachers.reduce(
      (summary: any, teacher: any) => {
        summary.total += 1;
        if (teacher.status === "active") summary.active += 1;
        summary.totalStudents += teacher.total_students || 0;
        summary.activeGroups += teacher.active_groups || 0;
        return summary;
      },
      { total: 0, active: 0, totalStudents: 0, activeGroups: 0 }
    );
  }, [allTeachers]);

  // All useCallback hooks
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setSubjectFilter("all");
  }, []);

  const isStepValid = useCallback((step: number) => {
    switch (step) {
      case 0:
        return newTeacher.full_name.trim().length > 0;
      case 1:
        return true;
      case 2:
        return true;
      default:
        return true;
    }
  }, [newTeacher.full_name]);

  const handleStepChange = useCallback((targetStep: number) => {
    if (targetStep > addStep && !isStepValid(addStep)) {
      setNotification({
        type: 'error',
        message: content.pleaseCompleteStep
      });
      return;
    }
    
    if (targetStep < addStep) {
      setAddStep(targetStep);
      return;
    }
    
    setAddStep(targetStep);
  }, [addStep, isStepValid, content.pleaseCompleteStep]);

  const handleNextStep = useCallback(() => {
    if (addStep < 2) {
      if (!isStepValid(addStep)) {
        setNotification({
          type: 'error',
          message: content.pleaseCompleteStep
        });
        return;
      }
      setAddStep(addStep + 1);
    }
  }, [addStep, isStepValid, content.pleaseCompleteStep]);

  const handlePreviousStep = useCallback(() => {
    if (addStep > 0) {
      setAddStep(addStep - 1);
    }
  }, [addStep]);

  const openConfirmModal = useCallback(() => {
    setIsConfirmModalOpen(true);
  }, []);

  const closeConfirmModal = useCallback(() => {
    setIsConfirmModalOpen(false);
  }, []);

  const handleConfirmRegistration = useCallback(async () => {
    setIsLoading(true);
    setNotification(null);
    closeConfirmModal();

    try {
      const teacherData = {
        full_name: newTeacher.full_name,
        email: newTeacher.email || undefined,
        phone: newTeacher.phone || undefined,
        qualification: newTeacher.qualification || undefined,
        salary_type: newTeacher.salary_type || undefined,
        salary_value: newTeacher.salary_value ? parseFloat(newTeacher.salary_value) : 0,
        status: newTeacher.status,
        bio: newTeacher.bio || undefined,
        subject_ids: newTeacher.subject_ids,
      };

      const result = await saveTeacherToDatabase(teacherData);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.teacherCredentials) {
        setCredentials({
          ...result,
          teacherName: newTeacher.full_name,
        });
        setNotification({
          type: 'success',
          message: content.teacherAdded
        });
      }

      setNewTeacher({
        full_name: "",
        email: "",
        phone: "",
        qualification: "",
        salary_type: "",
        salary_value: "",
        status: "active",
        bio: "",
        subject_ids: [],
      });
      setAddStep(0);
      setIsAddOpen(false);
      await refresh();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || content.error
      });
    } finally {
      setIsLoading(false);
    }
  }, [newTeacher, closeConfirmModal, content, refresh]);

  const handleDeleteTeacher = useCallback(async () => {
    if (!selectedTeacherId) return;
    
    setIsLoading(true);
    setNotification(null);

    try {
      const result = await deleteTeacher(selectedTeacherId);
      
      if (result.error) {
        throw new Error(result.error);
      }

      setNotification({
        type: 'success',
        message: content.teacherDeleted
      });
      setIsDeleteModalOpen(false);
      setSelectedTeacherId(null);
      await refresh();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || content.error
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedTeacherId, content, refresh]);

  const handleEditTeacher = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingTeacher) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const teacherData = {
        full_name: editingTeacher.full_name,
        email: editingTeacher.email || undefined,
        phone: editingTeacher.phone || undefined,
        qualification: editingTeacher.qualification || undefined,
        salary_type: editingTeacher.salary_type || undefined,
        salary_value: editingTeacher.salary_value || 0,
        status: editingTeacher.status,
        bio: editingTeacher.bio || undefined,
        subject_ids: editingTeacher.subject_ids || [],
      };

      const result = await updateTeacher(editingTeacher.id, teacherData);

      if (result.error) {
        throw new Error(result.error);
      }

      setNotification({
        type: 'success',
        message: content.teacherUpdated
      });
      setIsEditModalOpen(false);
      setEditingTeacher(null);
      await refresh();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || content.error
      });
    } finally {
      setIsLoading(false);
    }
  }, [editingTeacher, content, refresh]);

  const updateNewTeacher = useCallback((field: keyof typeof newTeacher, value: any) => {
    setNewTeacher((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  const updateEditingTeacher = useCallback((field: keyof typeof editingTeacher, value: any) => {
    if (!editingTeacher) return;
    setEditingTeacher((current: any) => ({
      ...current,
      [field]: value,
    }));
  }, [editingTeacher]);

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  // ============================================================================
  // 2. CONDITIONAL RETURNS (after ALL hooks)
  // ============================================================================

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
        {error === "TEACHERS_LOAD_FAILED" ? content.loadError : error}
      </div>
    );
  }

  // ============================================================================
  // 3. RENDER
  // ============================================================================

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
          <p className="label-caps">{content.eyebrow}</p>
          <h1 className="mt-2 text-[30px] font-semibold leading-9 tracking-[-0.01em] text-on-surface">
            {content.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
            {content.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFiltersOpen((value) => !value)}
            className="btn-secondary"
          >
            <Filter size={16} />
            {content.filter}
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="btn-primary"
          >
            <UserPlus size={16} />
            {content.newTeacher}
          </button>
        </div>
      </div>

      {isFiltersOpen && (
        <section className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-on-surface">
              {content.filtersTitle}
            </h2>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-primary"
            >
              {content.clearFilters}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | TeacherStatus)
              }
              className="input-field"
            >
              <option value="all">{content.allStatuses}</option>
              <option value="active">{content.active}</option>
              <option value="inactive">{content.inactive}</option>
              <option value="suspended">{content.suspended}</option>
            </select>
            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
              className="input-field"
            >
              <option value="all">{content.allSubjects}</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {language === 'ar' ? subject.name_ar : subject.name_en}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={content.totalTeachers}
          value={numberFormatter.format(metrics.total)}
          icon={<Users size={20} />}
        />
        <MetricCard
          label={content.activeTeachers}
          value={numberFormatter.format(metrics.active)}
          icon={<UserPlus size={20} />}
        />
        <MetricCard
          label={content.totalStudents}
          value={numberFormatter.format(metrics.totalStudents)}
          icon={<GraduationCap size={20} />}
        />
        <MetricCard
          label={content.activeGroups}
          value={numberFormatter.format(metrics.activeGroups)}
          icon={<BookOpen size={20} />}
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
            onClick={refresh}
            className="btn-secondary self-start xl:self-auto"
          >
            <RefreshCw size={16} />
            {content.refresh}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-start">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="label-caps px-6 py-3">{content.teacher}</th>
                <th className="label-caps px-6 py-3">{content.qualificationLabel}</th>
                <th className="label-caps px-6 py-3">{content.subjects}</th>
                <th className="label-caps px-6 py-3">{content.salary}</th>
                <th className="label-caps px-6 py-3">{content.students}</th>
                <th className="label-caps px-6 py-3">{content.groups}</th>
                <th className="label-caps px-6 py-3">{content.status}</th>
                <th className="label-caps px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-on-surface-variant"
                  >
                    {content.noTeachers}
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher: any) => (
                  <tr
                    key={teacher.id}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-xs font-semibold text-on-primary-fixed-variant">
                          {getInitials(teacher.full_name)}
                        </div>
                        <div>
                          <p className="whitespace-nowrap text-sm font-semibold text-on-surface">
                            {teacher.full_name}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {teacher.email && (
                              <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
                                <Mail size={12} />
                                {teacher.email}
                              </span>
                            )}
                            {teacher.phone && (
                              <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant">
                                <Phone size={12} />
                                {teacher.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {teacher.qualification || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects?.slice(0, 3).map((subject: any) => (
                          <span
                            key={subject.id}
                            className="rounded-sm px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: subject.color + '20',
                              color: subject.color,
                            }}
                          >
                            {language === 'ar' ? subject.name : subject.name_en}
                          </span>
                        ))}
                        {teacher.subjects?.length > 3 && (
                          <span className="text-xs text-on-surface-variant">
                            +{teacher.subjects.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface">
                      {teacher.salary_type ? (
                        <div>
                          <span className="text-xs text-on-surface-variant">
                            {content.salaryTypes[teacher.salary_type as keyof typeof content.salaryTypes] || teacher.salary_type}
                          </span>
                          {teacher.salary_value > 0 && (
                            <span className="block text-sm">
                              {teacher.salary_value}
                              {teacher.salary_type === 'percentage' ? '%' : ' EGP'}
                            </span>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface">
                      {numberFormatter.format(teacher.total_students || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface">
                      {numberFormatter.format(teacher.active_groups || 0)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-sm px-2 py-1 text-xs font-semibold ${
                          teacher.status === "active"
                            ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                            : teacher.status === "suspended"
                            ? "bg-warning-container text-on-warning-container"
                            : "bg-error-container text-on-error-container"
                        }`}
                      >
                        {teacher.status === "active"
                          ? content.active
                          : teacher.status === "suspended"
                          ? content.suspended
                          : content.inactive}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTeacher({
                              ...teacher,
                              subject_ids: teacher.subjects?.map((s: any) => s.id) || [],
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="rounded p-1 hover:bg-surface-container-high"
                          title={content.edit}
                        >
                          <Edit size={16} className="text-primary" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTeacherId(teacher.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="rounded p-1 hover:bg-surface-container-high"
                          title={content.delete}
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
      </section>

      {/* Add Teacher Modal */}
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
                  ? `الخطوة ${addStep + 1} من 3`
                  : `Step ${addStep + 1} of 3`}
              </span>
            </div>

            <div className="border-b border-outline-variant px-6 py-4">
              <div className="grid grid-cols-3 gap-2">
                {[content.personal, content.professional, content.review].map(
                  (step, index) => (
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
                  )
                )}
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
                        value={newTeacher.full_name}
                        required
                        onChange={(value) => updateNewTeacher("full_name", value)}
                      />
                    </div>
                    <Field
                      label={content.email}
                      value={newTeacher.email}
                      type="email"
                      onChange={(value) => updateNewTeacher("email", value)}
                    />
                    <Field
                      label={content.phone}
                      value={newTeacher.phone}
                      onChange={(value) => updateNewTeacher("phone", value)}
                    />
                    <div className="md:col-span-2">
                      <Field
                        label={content.bio}
                        value={newTeacher.bio}
                        type="textarea"
                        onChange={(value) => updateNewTeacher("bio", value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {addStep === 1 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field
                    label={content.qualification}
                    value={newTeacher.qualification}
                    onChange={(value) => updateNewTeacher("qualification", value)}
                  />
                  <SelectField
                    label={content.salaryType}
                    value={newTeacher.salary_type}
                    onChange={(value) => updateNewTeacher("salary_type", value)}
                    options={[
                      { value: "", label: language === 'ar' ? 'اختر نظام الراتب' : 'Select salary type' },
                      ...salaryTypeOptions,
                    ]}
                  />
                  {newTeacher.salary_type && (
                    <Field
                      label={content.salaryValue}
                      value={newTeacher.salary_value}
                      type="number"
                      onChange={(value) => updateNewTeacher("salary_value", value)}
                      placeholder={newTeacher.salary_type === 'percentage' ? '25' : '5000'}
                    />
                  )}
                  <SelectField
                    label={content.status}
                    value={newTeacher.status}
                    onChange={(value) => updateNewTeacher("status", value)}
                    options={statusOptions}
                  />
                  <div className="md:col-span-2">
                    <MultiSelectField
                      label={content.subjects}
                      value={newTeacher.subject_ids}
                      options={subjectOptions}
                      onChange={(values) => updateNewTeacher("subject_ids", values)}
                      isLoading={isLoadingSubjects}
                      placeholder={language === 'ar' ? 'اختر المواد الدراسية' : 'Select subjects'}
                      language={language}
                    />
                  </div>
                </div>
              )}

              {addStep === 2 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    [content.fullName, newTeacher.full_name || "-"],
                    [content.email, newTeacher.email || "-"],
                    [content.phone, newTeacher.phone || "-"],
                    [content.qualification, newTeacher.qualification || "-"],
                    [content.salaryType, newTeacher.salary_type ? content.salaryTypes[newTeacher.salary_type as keyof typeof content.salaryTypes] : "-"],
                    [content.salaryValue, newTeacher.salary_value || "-"],
                    [content.status, newTeacher.status === "active" ? content.active : newTeacher.status === "suspended" ? content.suspended : content.inactive],
                    [content.subjects, newTeacher.subject_ids.length > 0 
                      ? newTeacher.subject_ids.map(id => {
                          const subject = subjects.find(s => s.id === id);
                          return subject ? (language === 'ar' ? subject.name_ar : subject.name_en) : '';
                        }).join(', ')
                      : "-"
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
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
                {addStep < 2 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn-primary"
                    disabled={isLoading || (addStep === 0 && !newTeacher.full_name.trim())}
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
                onClick={closeConfirmModal}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 border-t border-outline-variant pt-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  [content.fullName, newTeacher.full_name || "-"],
                  [content.email, newTeacher.email || "-"],
                  [content.phone, newTeacher.phone || "-"],
                  [content.qualification, newTeacher.qualification || "-"],
                  [content.salaryType, newTeacher.salary_type ? content.salaryTypes[newTeacher.salary_type as keyof typeof content.salaryTypes] : "-"],
                  [content.salaryValue, newTeacher.salary_value || "-"],
                  [content.status, newTeacher.status === "active" ? content.active : newTeacher.status === "suspended" ? content.suspended : content.inactive],
                  [content.subjects, newTeacher.subject_ids.length > 0 
                    ? newTeacher.subject_ids.map(id => {
                        const subject = subjects.find(s => s.id === id);
                        return subject ? (language === 'ar' ? subject.name_ar : subject.name_en) : '';
                      }).join(', ')
                    : "-"
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
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
                <p>{language === "ar" 
                  ? "سيتم إنشاء حساب للمعلم. تأكد من صحة البيانات قبل المتابعة."
                  : "An account will be created for the teacher. Please verify the data before proceeding."
                }</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-outline-variant pt-6">
              <button
                type="button"
                onClick={closeConfirmModal}
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
            <h3 className="text-xl font-semibold text-on-surface">{content.deleteConfirm}</h3>
            <p className="mt-2 text-sm text-on-surface-variant">{content.deleteMessage}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedTeacherId(null);
                }}
                className="btn-secondary"
                disabled={isLoading}
              >
                {content.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteTeacher}
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

      {/* Edit Teacher Modal */}
      {isEditModalOpen && editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleEditTeacher}
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
                  setEditingTeacher(null);
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
                    value={editingTeacher.full_name}
                    required
                    onChange={(value) => updateEditingTeacher("full_name", value)}
                  />
                </div>
                <Field
                  label={content.email}
                  value={editingTeacher.email || ""}
                  type="email"
                  onChange={(value) => updateEditingTeacher("email", value)}
                />
                <Field
                  label={content.phone}
                  value={editingTeacher.phone || ""}
                  onChange={(value) => updateEditingTeacher("phone", value)}
                />
                <Field
                  label={content.qualification}
                  value={editingTeacher.qualification || ""}
                  onChange={(value) => updateEditingTeacher("qualification", value)}
                />
                <SelectField
                  label={content.salaryType}
                  value={editingTeacher.salary_type || ""}
                  onChange={(value) => updateEditingTeacher("salary_type", value)}
                  options={[
                    { value: "", label: language === 'ar' ? 'اختر نظام الراتب' : 'Select salary type' },
                    ...salaryTypeOptions,
                  ]}
                />
                {editingTeacher.salary_type && (
                  <Field
                    label={content.salaryValue}
                    value={editingTeacher.salary_value?.toString() || ""}
                    type="number"
                    onChange={(value) => updateEditingTeacher("salary_value", parseFloat(value) || 0)}
                  />
                )}
                <SelectField
                  label={content.status}
                  value={editingTeacher.status}
                  onChange={(value) => updateEditingTeacher("status", value)}
                  options={statusOptions}
                />
                <div className="md:col-span-2">
                  <MultiSelectField
                    label={content.subjects}
                    value={editingTeacher.subject_ids || []}
                    options={subjectOptions}
                    onChange={(values) => updateEditingTeacher("subject_ids", values)}
                    isLoading={isLoadingSubjects}
                    language={language}
                  />
                </div>
                <div className="md:col-span-2">
                  <Field
                    label={content.bio}
                    value={editingTeacher.bio || ""}
                    type="textarea"
                    onChange={(value) => updateEditingTeacher("bio", value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingTeacher(null);
                }}
                className="btn-secondary"
                disabled={isLoading}
              >
                {content.cancel}
              </button>
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? "Saving..." : content.saveChanges}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Credentials Modal */}
      {credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-on-surface">{content.credentials}</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-on-surface-variant">{content.emailLabel}</p>
                  <p className="text-sm text-on-surface">{credentials.teacherCredentials.email}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(credentials.teacherCredentials.email, 'email')}
                  className="p-1 hover:bg-surface-container-high rounded"
                >
                  {copiedField === 'email' ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-on-surface-variant">{content.password}</p>
                  <p className="text-sm text-on-surface">{credentials.teacherCredentials.password}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(credentials.teacherCredentials.password, 'password')}
                  className="p-1 hover:bg-surface-container-high rounded"
                >
                  {copiedField === 'password' ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                </button>
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
    </div>
  );
}