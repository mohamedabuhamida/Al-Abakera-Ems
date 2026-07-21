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
  Calendar,
  DollarSign,
  UserPlus,
  Clock,
  Loader2,
  ChevronDown,
  ChevronRight,
  Trash,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { createClient } from "@/core/supabase/client";
import {
  createGroup,
  updateGroup,
  deleteGroup,
  getSubjects,
  getGrades,
  getTeachers,
  getClassrooms,
  addGroupSessions,
  getTeacherSchedule,
  checkTeacherAvailability,
} from "./actions";

const DAYS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const DAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const copy = {
  ar: {
    title: "المجموعات الدراسية",
    loading: "جاري تحميل المجموعات...",
    errorPrefix: "حدث خطأ:",
    loadError: "تعذر تحميل المجموعات",
    addGroup: "إضافة مجموعة",
    editGroup: "تعديل مجموعة",
    deleteGroup: "حذف مجموعة",
    deleteConfirm: "هل أنت متأكد من حذف هذه المجموعة؟",
    deleteMessage: "لا يمكن حذف المجموعة إذا كان بها طلاب مسجلين.",
    name: "اسم المجموعة",
    description: "الوصف",
    capacity: "السعة",
    monthlyPrice: "السعر الشهري",
    status: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    completed: "مكتمل",
    cancelled: "ملغي",
    subject: "المادة",
    grade: "الصف",
    teachers: "المعلمين",
    students: "الطلاب",
    sessions: "الجلسات",
    search: "ابحث بالاسم أو المادة",
    refresh: "تحديث",
    totalGroups: "إجمالي المجموعات",
    activeGroups: "مجموعات نشطة",
    totalStudents: "إجمالي الطلاب",
    selectSubject: "اختر المادة",
    selectGrade: "اختر الصف",
    selectTeacher: "اختر المعلم",
    selectClassroom: "اختر الفصل",
    weekday: "اليوم",
    startTime: "وقت البدء",
    endTime: "وقت الانتهاء",
    teacher: "المعلم",
    classroom: "الفصل",
    addSession: "إضافة جلسة",
    removeSession: "حذف جلسة",
    cancel: "إلغاء",
    save: "حفظ",
    update: "تحديث",
    success: "تم بنجاح",
    error: "حدث خطأ",
    groupAdded: "تم إضافة المجموعة بنجاح",
    groupUpdated: "تم تحديث المجموعة بنجاح",
    groupDeleted: "تم حذف المجموعة بنجاح",
    noGroups: "لا توجد مجموعات",
    sessionsAdded: "تم إضافة الجلسات بنجاح",
    pricePlaceholder: "مثل: 500",
    capacityPlaceholder: "مثل: 30",
    enrolledStudents: "الطلاب المسجلين",
    availableSlots: "المقاعد المتاحة",
    viewStudents: "عرض الطلاب",
    viewSchedule: "عرض الجدول",
    back: "رجوع",
    sessionRequired: "يجب اختيار معلم لكل جلسة",
    noTeachers: "لا يوجد معلمين متاحين",
    noClassrooms: "لا يوجد فصول متاحة",
  },
  en: {
    title: "Groups",
    loading: "Loading groups...",
    errorPrefix: "Error:",
    loadError: "Unable to load groups",
    addGroup: "Add Group",
    editGroup: "Edit Group",
    deleteGroup: "Delete Group",
    deleteConfirm: "Are you sure you want to delete this group?",
    deleteMessage: "Cannot delete group if it has enrolled students.",
    name: "Group Name",
    description: "Description",
    capacity: "Capacity",
    monthlyPrice: "Monthly Price",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    completed: "Completed",
    cancelled: "Cancelled",
    subject: "Subject",
    grade: "Grade",
    teachers: "Teachers",
    students: "Students",
    sessions: "Sessions",
    search: "Search by name or subject",
    refresh: "Refresh",
    totalGroups: "Total Groups",
    activeGroups: "Active Groups",
    totalStudents: "Total Students",
    selectSubject: "Select Subject",
    selectGrade: "Select Grade",
    selectTeacher: "Select Teacher",
    selectClassroom: "Select Classroom",
    weekday: "Day",
    startTime: "Start Time",
    endTime: "End Time",
    teacher: "Teacher",
    classroom: "Classroom",
    addSession: "Add Session",
    removeSession: "Remove Session",
    cancel: "Cancel",
    save: "Save",
    update: "Update",
    success: "Success",
    error: "Error",
    groupAdded: "Group added successfully",
    groupUpdated: "Group updated successfully",
    groupDeleted: "Group deleted successfully",
    noGroups: "No groups found",
    sessionsAdded: "Sessions added successfully",
    pricePlaceholder: "e.g., 500",
    capacityPlaceholder: "e.g., 30",
    enrolledStudents: "Enrolled Students",
    availableSlots: "Available Slots",
    viewStudents: "View Students",
    viewSchedule: "View Schedule",
    back: "Back",
    sessionRequired: "Each session must have a teacher assigned",
    noTeachers: "No teachers available",
    noClassrooms: "No classrooms available",
  },
};

// Helper components
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
      <input
        type={type}
        value={value}
        required={required}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="input-field w-full read-only:bg-surface-container-low read-only:text-on-surface-variant"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
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
        required={required}
      >
        <option value="">{placeholder || "اختر"}</option>
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
          <p className="text-sm font-semibold text-on-surface-variant">
            {label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-on-surface">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-default bg-primary-fixed text-on-primary-fixed-variant">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const { language } = useLanguage();
  const content = copy[language];

  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: "",
    monthly_price: "",
    status: "active",
    subject_id: "",
    grade_id: "",
  });

  // Session data - use a proper array with unique IDs
  const [sessions, setSessions] = useState<any[]>([
    {
      id: Date.now(),
      weekday: 0,
      start_time: "09:00",
      end_time: "10:30",
      teacher_id: "",
      classroom_id: "",
    },
  ]);
  const [nextSessionId, setNextSessionId] = useState(Date.now() + 1);

  // Dropdown options
  const [subjects, setSubjects] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // View modals
  const [isViewStudentsOpen, setIsViewStudentsOpen] = useState(false);
  const [isViewSessionsOpen, setIsViewSessionsOpen] = useState(false);
  const [groupStudents, setGroupStudents] = useState<any[]>([]);
  const [groupSessions, setGroupSessions] = useState<any[]>([]);
  const [isLoadingView, setIsLoadingView] = useState(false);

  const [teacherSchedule, setTeacherSchedule] = useState<any[]>([]);
  const [isViewingTeacherSchedule, setIsViewingTeacherSchedule] =
    useState(false);
  const [selectedTeacherForSchedule, setSelectedTeacherForSchedule] =
    useState<string>("");

  const viewTeacherSchedule = async (
    teacherId: string,
    teacherName: string,
  ) => {
    setIsLoadingView(true);
    try {
      const result = await getTeacherSchedule(teacherId);
      if (result.success) {
        setTeacherSchedule(result.data);
        setSelectedTeacherForSchedule(teacherName);
        setIsViewingTeacherSchedule(true);
      }
    } catch (err) {
      console.error("Failed to fetch teacher schedule:", err);
    } finally {
      setIsLoadingView(false);
    }
  };

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: result, error: rpcError } =
        await supabase.rpc("get_groups_data");

      if (rpcError) {
        console.error("RPC Error:", rpcError);
        const { data: groupsData, error: queryError } = await supabase
          .schema("academic")
          .from("groups")
          .select(
            `
            *,
            subject:subject_id (
              id, name_ar, name_en, code, color
            ),
            grade:grade_id (
              id, name_ar, name_en
            )
          `,
          )
          .order("name", { ascending: true });

        if (queryError) throw queryError;
        setGroups(groupsData || []);
      } else if (result?.groups) {
        setGroups(result.groups);
      } else {
        setGroups([]);
      }
    } catch (err: any) {
      console.error("Failed to load groups:", err);
      setError(err.message || "GROUPS_LOAD_FAILED");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    try {
      const [subjectsResult, gradesResult, teachersResult, classroomsResult] =
        await Promise.all([
          getSubjects(),
          getGrades(),
          getTeachers(),
          getClassrooms(),
        ]);

      if (subjectsResult.success) {
        console.log("Subjects loaded:", subjectsResult.data);
        setSubjects(subjectsResult.data);
      }
      if (gradesResult.success) {
        console.log("Grades loaded:", gradesResult.data);
        setGrades(gradesResult.data);
      }
      if (teachersResult.success) {
        console.log("Teachers loaded:", teachersResult.data);
        setTeachers(teachersResult.data);
      }
      if (classroomsResult.success) {
        console.log("Classrooms loaded:", classroomsResult.data);
        setClassrooms(classroomsResult.data);
      }
    } catch (err) {
      console.error("Failed to fetch options:", err);
    } finally {
      setIsLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
    fetchOptions();
  }, [fetchGroups, fetchOptions]);

  const filteredGroups = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return groups;

    return groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.subject?.name_ar?.toLowerCase().includes(query) ||
        group.subject?.name_en?.toLowerCase().includes(query),
    );
  }, [groups, searchTerm]);

  const metrics = useMemo(() => {
    return {
      total: groups.length,
      active: groups.filter((g) => g.status === "active").length,
      students: groups.reduce((sum, g) => sum + (g.enrolled_students || 0), 0),
    };
  }, [groups]);

  const numberFormatter = useMemo(() => new Intl.NumberFormat("en"), []);

  const resetForm = () => {
    const newId = Date.now();
    setFormData({
      name: "",
      description: "",
      capacity: "",
      monthly_price: "",
      status: "active",
      subject_id: "",
      grade_id: "",
    });
    setSessions([
      {
        id: newId,
        weekday: 0,
        start_time: "09:00",
        end_time: "10:30",
        teacher_id: "",
        classroom_id: "",
      },
    ]);
    setNextSessionId(newId + 1);
  };

  const addSession = () => {
    const newId = nextSessionId;
    setNextSessionId(newId + 1);
    setSessions([
      ...sessions,
      {
        id: newId,
        weekday: 0,
        start_time: "09:00",
        end_time: "10:30",
        teacher_id: "",
        classroom_id: "",
      },
    ]);
  };

  const removeSession = (id: number) => {
    if (sessions.length > 1) {
      setSessions(sessions.filter((s) => s.id !== id));
    }
  };

  const updateSession = async (id: number, field: string, value: any) => {
    // When teacher is selected, check for conflicts
    if (field === "teacher_id" && value) {
      const session = sessions.find((s) => s.id === id);
      if (session) {
        const result = await checkTeacherAvailability(
          value,
          session.weekday,
          session.start_time,
          session.end_time,
        );

        if (!result.available) {
          setNotification({
            type: "error",
            message: `هذا المعلم مشغول في هذا الوقت. يرجى اختيار وقت آخر أو معلم آخر.`,
          });
          return;
        }
      }
    }

    setSessions(
      sessions.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const validateSessions = () => {
    const invalidSessions = sessions.filter((s) => !s.teacher_id);
    if (invalidSessions.length > 0) {
      setNotification({
        type: "error",
        message: content.sessionRequired,
      });
      return false;
    }
    return true;
  };

  const handleAddGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateSessions()) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const result = await createGroup({
        name: formData.name,
        description: formData.description,
        capacity: formData.capacity ? parseInt(formData.capacity) : 30,
        monthly_price: formData.monthly_price
          ? parseFloat(formData.monthly_price)
          : 0,
        status: formData.status,
        subject_id: formData.subject_id,
        grade_id: formData.grade_id,
      });

      if (result.success) {
        // Add sessions
        const validSessions = sessions
          .filter((s) => s.teacher_id)
          .map((s) => ({
            weekday: s.weekday,
            start_time: s.start_time,
            end_time: s.end_time,
            teacher_id: s.teacher_id,
            classroom_id: s.classroom_id || null,
          }));

        if (validSessions.length > 0) {
          const sessionResult = await addGroupSessions(
            result.data.id,
            validSessions,
          );
          if (!sessionResult.success) {
            console.error("Failed to add sessions:", sessionResult.error);
          }
        }

        setNotification({ type: "success", message: content.groupAdded });
        setIsAddOpen(false);
        resetForm();
        await fetchGroups();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || content.error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedGroup) return;

    if (!validateSessions()) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const result = await updateGroup(selectedGroup.id, {
        name: formData.name,
        description: formData.description,
        capacity: formData.capacity ? parseInt(formData.capacity) : 30,
        monthly_price: formData.monthly_price
          ? parseFloat(formData.monthly_price)
          : 0,
        status: formData.status,
        subject_id: formData.subject_id,
        grade_id: formData.grade_id,
      });

      if (result.success) {
        // Update sessions
        const validSessions = sessions
          .filter((s) => s.teacher_id)
          .map((s) => ({
            weekday: s.weekday,
            start_time: s.start_time,
            end_time: s.end_time,
            teacher_id: s.teacher_id,
            classroom_id: s.classroom_id || null,
          }));

        if (validSessions.length > 0) {
          await addGroupSessions(selectedGroup.id, validSessions);
        }

        setNotification({ type: "success", message: content.groupUpdated });
        setIsEditOpen(false);
        setSelectedGroup(null);
        resetForm();
        await fetchGroups();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || content.error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const result = await deleteGroup(selectedGroup.id);
      if (result.success) {
        setNotification({ type: "success", message: content.groupDeleted });
        setIsDeleteOpen(false);
        setSelectedGroup(null);
        await fetchGroups();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || content.error });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = async (group: any) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      capacity: group.capacity?.toString() || "",
      monthly_price: group.monthly_price?.toString() || "",
      status: group.status || "active",
      subject_id: group.subject_id || "",
      grade_id: group.grade_id || "",
    });

    // Fetch existing sessions
    try {
      const supabase = createClient();
      const { data: result, error } = await supabase.rpc("get_group_sessions", {
        p_group_id: group.id,
      });

      if (!error && result?.sessions && result.sessions.length > 0) {
        const formattedSessions = result.sessions.map(
          (s: any, index: number) => ({
            id: Date.now() + index,
            weekday: s.weekday,
            start_time: s.start_time?.substring(0, 5) || "09:00",
            end_time: s.end_time?.substring(0, 5) || "10:30",
            teacher_id: s.teacher?.id || "",
            classroom_id: s.classroom?.id || "",
          }),
        );
        setSessions(formattedSessions);
        setNextSessionId(Date.now() + formattedSessions.length + 1);
      } else {
        // If no sessions, add a default one
        const newId = Date.now();
        setSessions([
          {
            id: newId,
            weekday: 0,
            start_time: "09:00",
            end_time: "10:30",
            teacher_id: "",
            classroom_id: "",
          },
        ]);
        setNextSessionId(newId + 1);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      const newId = Date.now();
      setSessions([
        {
          id: newId,
          weekday: 0,
          start_time: "09:00",
          end_time: "10:30",
          teacher_id: "",
          classroom_id: "",
        },
      ]);
      setNextSessionId(newId + 1);
    }

    setIsEditOpen(true);
  };

  const openDeleteModal = (group: any) => {
    setSelectedGroup(group);
    setIsDeleteOpen(true);
  };

  const viewStudents = async (group: any) => {
    setIsLoadingView(true);
    try {
      const supabase = createClient();
      const { data: result, error } = await supabase.rpc("get_group_students", {
        p_group_id: group.id,
      });

      if (!error && result?.students) {
        setGroupStudents(result.students);
        setSelectedGroup(group);
        setIsViewStudentsOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setIsLoadingView(false);
    }
  };

  const viewSessions = async (group: any) => {
    setIsLoadingView(true);
    try {
      const supabase = createClient();
      const { data: result, error } = await supabase.rpc("get_group_sessions", {
        p_group_id: group.id,
      });

      if (!error && result?.sessions) {
        setGroupSessions(result.sessions);
        setSelectedGroup(group);
        setIsViewSessionsOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setIsLoadingView(false);
    }
  };

  // Create options arrays with proper labels
  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: language === "ar" ? s.name_ar : s.name_en,
  }));

  const gradeOptions = grades.map((g) => ({
    value: g.id,
    label: language === "ar" ? g.name_ar : g.name_en,
  }));

  const teacherOptions = teachers.map((t) => ({
    value: t.id,
    label: t.full_name,
  }));

  const filteredTeacherOptions = useMemo(() => {
    const selectedSubjectId = formData.subject_id;

    if (!selectedSubjectId) {
      return teacherOptions;
    }

    // Filter teachers based on selected subject
    const availableTeachers = teachers.filter((t: any) =>
      t.subject_ids?.includes(selectedSubjectId),
    );

    return availableTeachers.map((t: any) => ({
      value: t.id,
      label: t.full_name,
    }));
  }, [teachers, formData.subject_id]);

  const classroomOptions = classrooms.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const statusOptions = [
    { value: "active", label: content.active },
    { value: "inactive", label: content.inactive },
    { value: "completed", label: content.completed },
    { value: "cancelled", label: content.cancelled },
  ];

  const weekdayOptions = (language === "ar" ? DAYS : DAYS_EN).map(
    (day, index) => ({
      value: index.toString(),
      label: day,
    }),
  );

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
        {error === "GROUPS_LOAD_FAILED" ? content.loadError : error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="btn-primary"
          >
            <Plus size={16} />
            {content.addGroup}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label={content.totalGroups}
          value={numberFormatter.format(metrics.total)}
          icon={<BookOpen size={20} />}
        />
        <MetricCard
          label={content.activeGroups}
          value={numberFormatter.format(metrics.active)}
          icon={<Users size={20} />}
        />
        <MetricCard
          label={content.totalStudents}
          value={numberFormatter.format(metrics.students)}
          icon={<UserPlus size={20} />}
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
            onClick={fetchGroups}
            className="btn-secondary self-start xl:self-auto"
          >
            <RefreshCw size={16} />
            {content.refresh}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-start">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="label-caps px-6 py-3">{content.name}</th>
                <th className="label-caps px-6 py-3">{content.subject}</th>
                <th className="label-caps px-6 py-3">{content.grade}</th>
                <th className="label-caps px-6 py-3">{content.teachers}</th>
                <th className="label-caps px-6 py-3">{content.students}</th>
                <th className="label-caps px-6 py-3">{content.monthlyPrice}</th>
                <th className="label-caps px-6 py-3">{content.status}</th>
                <th className="label-caps px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm text-on-surface-variant"
                  >
                    {content.noGroups}
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => (
                  <tr
                    key={group.id}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-on-surface">
                          {group.name}
                        </p>
                        {group.description && (
                          <p className="text-xs text-on-surface-variant">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {group.subject?.color && (
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: group.subject.color }}
                          />
                        )}
                        <span className="text-sm text-on-surface">
                          {language === "ar"
                            ? group.subject?.name_ar
                            : group.subject?.name_en}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {language === "ar"
                        ? group.grade?.name_ar
                        : group.grade?.name_en}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {group.teachers?.slice(0, 3).map((teacher: any) => (
                          <button
                            key={teacher.id}
                            onClick={() =>
                              viewTeacherSchedule(teacher.id, teacher.full_name)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed text-xs font-semibold text-on-primary-fixed-variant ring-2 ring-surface hover:ring-primary transition-all"
                            title={`${teacher.full_name} - ${language === "ar" ? "عرض الجدول" : "View Schedule"}`}
                          >
                            {teacher.full_name?.charAt(0).toUpperCase()}
                          </button>
                        ))}
                        {group.teachers?.length > 3 && (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-xs font-semibold text-on-surface-variant ring-2 ring-surface">
                            +{group.teachers.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => viewStudents(group)}
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        {group.enrolled_students || 0}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-surface">
                      {group.monthly_price} EGP
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`rounded-sm px-2 py-1 text-xs font-semibold ${
                          group.status === "active"
                            ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                            : group.status === "completed"
                              ? "bg-primary-fixed text-on-primary-fixed-variant"
                              : group.status === "cancelled"
                                ? "bg-error-container text-on-error-container"
                                : "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {group.status === "active"
                          ? content.active
                          : group.status === "completed"
                            ? content.completed
                            : group.status === "cancelled"
                              ? content.cancelled
                              : content.inactive}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => viewSessions(group)}
                          className="rounded p-1 hover:bg-surface-container-high"
                          title={content.viewSchedule}
                        >
                          <Calendar size={16} className="text-primary" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(group)}
                          className="rounded p-1 hover:bg-surface-container-high"
                          title={content.editGroup}
                        >
                          <Edit size={16} className="text-primary" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(group)}
                          className="rounded p-1 hover:bg-surface-container-high"
                          title={content.deleteGroup}
                          disabled={group.enrolled_students > 0}
                        >
                          <Trash2
                            size={16}
                            className={
                              group.enrolled_students > 0
                                ? "text-on-surface-variant/40"
                                : "text-error"
                            }
                          />
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

      {/* Add/Edit Group Modal */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <form
            onSubmit={isAddOpen ? handleAddGroup : handleEditGroup}
            className="surface-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto p-0"
          >
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant p-6">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">
                  {isAddOpen ? content.addGroup : content.editGroup}
                </h2>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                  {content.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setIsEditOpen(false);
                  setSelectedGroup(null);
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
                    label={content.name}
                    value={formData.name}
                    required
                    onChange={(value) =>
                      setFormData({ ...formData, name: value })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Field
                    label={content.description}
                    value={formData.description}
                    type="textarea"
                    onChange={(value) =>
                      setFormData({ ...formData, description: value })
                    }
                  />
                </div>
                <SelectField
                  label={content.subject}
                  value={formData.subject_id}
                  options={subjectOptions}
                  onChange={(value) =>
                    setFormData({ ...formData, subject_id: value })
                  }
                  placeholder={content.selectSubject}
                  required
                />
                <SelectField
                  label={content.grade}
                  value={formData.grade_id}
                  options={gradeOptions}
                  onChange={(value) =>
                    setFormData({ ...formData, grade_id: value })
                  }
                  placeholder={content.selectGrade}
                  required
                />
                <Field
                  label={content.capacity}
                  value={formData.capacity}
                  type="number"
                  placeholder={content.capacityPlaceholder}
                  onChange={(value) =>
                    setFormData({ ...formData, capacity: value })
                  }
                />
                <Field
                  label={content.monthlyPrice}
                  value={formData.monthly_price}
                  type="number"
                  placeholder={content.pricePlaceholder}
                  onChange={(value) =>
                    setFormData({ ...formData, monthly_price: value })
                  }
                />
                <SelectField
                  label={content.status}
                  value={formData.status}
                  options={statusOptions}
                  onChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                />

                {/* Sessions */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-on-surface">
                      {content.sessions}
                    </h3>
                    <button
                      type="button"
                      onClick={addSession}
                      className="btn-secondary text-sm"
                    >
                      <Plus size={14} />
                      {content.addSession}
                    </button>
                  </div>

                  {/* Show message if no teachers available */}
                  {teacherOptions.length === 0 && (
                    <p className="mt-2 text-sm text-warning">
                      {content.noTeachers}
                    </p>
                  )}

                  <div className="mt-3 space-y-3">
                    {sessions.map((session, index) => (
                      <div
                        key={session.id}
                        className="grid grid-cols-1 gap-3 rounded-default border border-outline-variant p-3 md:grid-cols-5"
                      >
                        <SelectField
                          label={content.weekday}
                          value={session.weekday.toString()}
                          options={weekdayOptions}
                          onChange={(value) =>
                            updateSession(
                              session.id,
                              "weekday",
                              parseInt(value),
                            )
                          }
                          required
                        />
                        <Field
                          label={content.startTime}
                          value={session.start_time}
                          type="time"
                          onChange={(value) =>
                            updateSession(session.id, "start_time", value)
                          }
                        />
                        <Field
                          label={content.endTime}
                          value={session.end_time}
                          type="time"
                          onChange={(value) =>
                            updateSession(session.id, "end_time", value)
                          }
                        />
                        <SelectField
                          label={content.teacher}
                          value={session.teacher_id}
                          options={filteredTeacherOptions}
                          onChange={(value) =>
                            updateSession(session.id, "teacher_id", value)
                          }
                          placeholder={
                            filteredTeacherOptions.length === 0
                              ? "لا يوجد معلمين لهذه المادة"
                              : content.selectTeacher
                          }
                          required
                        />
                        <div className="relative">
                          <SelectField
                            label={content.classroom}
                            value={session.classroom_id}
                            options={classroomOptions}
                            onChange={(value) =>
                              updateSession(session.id, "classroom_id", value)
                            }
                            placeholder={
                              classroomOptions.length === 0
                                ? content.noClassrooms
                                : content.selectClassroom
                            }
                          />
                          {sessions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSession(session.id)}
                              className="absolute -right-2 -top-2 rounded-full bg-error-container p-0.5 text-on-error-container hover:bg-error-container/80"
                              title={content.removeSession}
                            >
                              <Trash size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {sessions.some((s) => !s.teacher_id) && (
                    <p className="mt-2 text-xs text-error">
                      {content.sessionRequired}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setIsEditOpen(false);
                  setSelectedGroup(null);
                  resetForm();
                }}
                className="btn-secondary"
                disabled={isLoading}
              >
                {content.cancel}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading || teacherOptions.length === 0}
              >
                {isLoading
                  ? "Saving..."
                  : isAddOpen
                    ? content.save
                    : content.update}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-on-surface">
              {content.deleteGroup}
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              {content.deleteConfirm}
            </p>
            {selectedGroup.enrolled_students > 0 && (
              <p className="mt-2 text-sm text-error">{content.deleteMessage}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedGroup(null);
                }}
                className="btn-secondary"
                disabled={isLoading}
              >
                {content.cancel}
              </button>
              <button
                type="button"
                onClick={handleDeleteGroup}
                className="btn-danger"
                disabled={isLoading || selectedGroup.enrolled_students > 0}
              >
                <Trash2 size={16} />
                {isLoading ? "Deleting..." : content.deleteGroup}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Students Modal */}
      {isViewStudentsOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant p-6">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">
                  {content.students}
                </h2>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                  {selectedGroup.name} - {content.enrolledStudents}:{" "}
                  {groupStudents.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsViewStudentsOpen(false);
                  setSelectedGroup(null);
                  setGroupStudents([]);
                }}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {isLoadingView ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : groupStudents.length === 0 ? (
                <p className="text-center text-sm text-on-surface-variant py-8">
                  {content.noGroups}
                </p>
              ) : (
                <div className="space-y-2">
                  {groupStudents.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between rounded-default border border-outline-variant p-3 hover:bg-surface-container-low"
                    >
                      <div>
                        <p className="font-semibold text-on-surface">
                          {student.full_name}
                        </p>
                        {student.email && (
                          <p className="text-sm text-on-surface-variant">
                            {student.email}
                          </p>
                        )}
                      </div>
                      <span
                        className={`rounded-sm px-2 py-1 text-xs font-semibold ${
                          student.status === "active"
                            ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                            : "bg-error-container text-on-error-container"
                        }`}
                      >
                        {student.status === "active" ? "نشط" : "غير نشط"}
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
                  setIsViewStudentsOpen(false);
                  setSelectedGroup(null);
                  setGroupStudents([]);
                }}
                className="btn-secondary"
              >
                {content.back}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Sessions Modal */}
      {isViewSessionsOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant p-6">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">
                  {content.sessions}
                </h2>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                  {selectedGroup.name} - {content.sessions}:{" "}
                  {groupSessions.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsViewSessionsOpen(false);
                  setSelectedGroup(null);
                  setGroupSessions([]);
                }}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {isLoadingView ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : groupSessions.length === 0 ? (
                <p className="text-center text-sm text-on-surface-variant py-8">
                  {content.noGroups}
                </p>
              ) : (
                <div className="space-y-2">
                  {groupSessions.map((session: any) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-default border border-outline-variant p-3 hover:bg-surface-container-low"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock
                            size={16}
                            className="text-on-surface-variant"
                          />
                          <span className="font-semibold text-on-surface">
                            {language === "ar"
                              ? DAYS[session.weekday]
                              : DAYS_EN[session.weekday]}
                          </span>
                        </div>
                        <div className="text-sm text-on-surface">
                          {session.start_time?.substring(0, 5) ||
                            session.start_time}{" "}
                          -{" "}
                          {session.end_time?.substring(0, 5) ||
                            session.end_time}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-on-surface-variant">
                          {session.teacher?.full_name}
                        </div>
                        {session.classroom && (
                          <span className="rounded-sm bg-surface-container px-2 py-1 text-xs text-on-surface-variant">
                            {session.classroom.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsViewSessionsOpen(false);
                  setSelectedGroup(null);
                  setGroupSessions([]);
                }}
                className="btn-secondary"
              >
                {content.back}
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewingTeacherSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant p-6">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">
                  {language === "ar" ? "جدول المعلم" : "Teacher Schedule"}
                </h2>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                  {selectedTeacherForSchedule}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsViewingTeacherSchedule(false);
                  setTeacherSchedule([]);
                  setSelectedTeacherForSchedule("");
                }}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {isLoadingView ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : teacherSchedule.length === 0 ? (
                <p className="text-center text-sm text-on-surface-variant py-8">
                  {language === "ar"
                    ? "لا توجد جلسات لهذا المعلم"
                    : "No sessions for this teacher"}
                </p>
              ) : (
                <div className="space-y-3">
                  {teacherSchedule.map((session: any) => (
                    <div
                      key={session.session_id}
                      className="flex items-center justify-between rounded-default border border-outline-variant p-3 hover:bg-surface-container-low"
                    >
                      <div>
                        <p className="font-semibold text-on-surface">
                          {session.group_name}
                        </p>
                        <p className="text-sm text-on-surface-variant">
                          {session.day_name}
                        </p>
                      </div>
                      <div className="text-sm text-on-surface-variant">
                        {session.start_time} - {session.end_time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsViewingTeacherSchedule(false);
                  setTeacherSchedule([]);
                  setSelectedTeacherForSchedule("");
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
