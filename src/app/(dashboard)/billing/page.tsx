"use client";

import { useLanguage } from "@/core/i18n/useLanguage";
import {
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  X,
  Eye,
  CreditCard,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Printer,
  Send,
  Loader2,
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
  getBillingStats,
  getInvoices,
  getMonthlyRevenue,
  getStudentsForInvoice,
  getStudentEnrollments,
  createInvoice,
  recordPayment,
} from "./actions";

const copy = {
  ar: {
    title: "الفواتير",
    description: "إدارة الفواتير والمدفوعات.",
    loading: "جاري تحميل البيانات...",
    errorPrefix: "حدث خطأ:",
    loadError: "تعذر تحميل البيانات",
    stats: {
      totalInvoices: "إجمالي الفواتير",
      paidInvoices: "مدفوعة",
      overdueInvoices: "متأخرة",
      totalRevenue: "إجمالي الإيرادات",
      outstandingBalance: "الأرصدة المستحقة",
      collectionRate: "نسبة التحصيل",
    },
    filters: {
      allStatuses: "كل الحالات",
      pending: "قيد الانتظار",
      paid: "مدفوعة",
      partially_paid: "مدفوعة جزئياً",
      overdue: "متأخرة",
      cancelled: "ملغية",
    },
    invoice: {
      number: "رقم الفاتورة",
      student: "الطالب",
      month: "الشهر",
      dueDate: "تاريخ الاستحقاق",
      status: "الحالة",
      total: "الإجمالي",
      paid: "المدفوع",
      remaining: "المتبقي",
      items: "البنود",
      payments: "المدفوعات",
      notes: "ملاحظات",
      created: "تاريخ الإنشاء",
    },
    actions: {
      view: "عرض",
      pay: "دفع",
      print: "طباعة",
      download: "تحميل",
      send: "إرسال",
    },
    addInvoice: "فاتورة جديدة",
    recordPayment: "تسجيل دفعة",
    search: "ابحث بالطالب أو رقم الفاتورة",
    refresh: "تحديث",
    noInvoices: "لا توجد فواتير",
    cancel: "إلغاء",
    save: "حفظ",
    paymentMethod: "طريقة الدفع",
    selectPaymentMethod: "اختر طريقة الدفع",
    amount: "المبلغ",
    reference: "المرجع",
    transactionReference: "رقم المعاملة",
    paymentDate: "تاريخ الدفع",
    success: "تم بنجاح",
    error: "حدث خطأ",
    invoiceCreated: "تم إنشاء الفاتورة بنجاح",
    paymentRecorded: "تم تسجيل الدفعة بنجاح",
    paymentMethods: {
      cash: "نقدي",
      instapay: "إنستاباي",
      bank_transfer: "تحويل بنكي",
      wallet: "محفظة",
      credit_card: "بطاقة ائتمان",
    },
  },
  en: {
    title: "Invoices",
    description: "Manage invoices and payments.",
    loading: "Loading data...",
    errorPrefix: "Error:",
    loadError: "Unable to load data",
    stats: {
      totalInvoices: "Total Invoices",
      paidInvoices: "Paid",
      overdueInvoices: "Overdue",
      totalRevenue: "Total Revenue",
      outstandingBalance: "Outstanding Balance",
      collectionRate: "Collection Rate",
    },
    filters: {
      allStatuses: "All Statuses",
      pending: "Pending",
      paid: "Paid",
      partially_paid: "Partially Paid",
      overdue: "Overdue",
      cancelled: "Cancelled",
    },
    invoice: {
      number: "Invoice #",
      student: "Student",
      month: "Month",
      dueDate: "Due Date",
      status: "Status",
      total: "Total",
      paid: "Paid",
      remaining: "Remaining",
      items: "Items",
      payments: "Payments",
      notes: "Notes",
      created: "Created",
    },
    actions: {
      view: "View",
      pay: "Pay",
      print: "Print",
      download: "Download",
      send: "Send",
    },
    addInvoice: "New Invoice",
    recordPayment: "Record Payment",
    search: "Search by student or invoice number",
    refresh: "Refresh",
    noInvoices: "No invoices found",
    cancel: "Cancel",
    save: "Save",
    paymentMethod: "Payment Method",
    selectPaymentMethod: "Select payment method",
    amount: "Amount",
    reference: "Reference",
    transactionReference: "Transaction Reference",
    paymentDate: "Payment Date",
    success: "Success",
    error: "Error",
    invoiceCreated: "Invoice created successfully",
    paymentRecorded: "Payment recorded successfully",
    paymentMethods: {
      cash: "Cash",
      instapay: "Instapay",
      bank_transfer: "Bank Transfer",
      wallet: "Wallet",
      credit_card: "Credit Card",
    },
  },
};

// Helper Components
function MetricCard({
  label,
  value,
  icon,
  color = "text-primary",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
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
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-default bg-primary-fixed ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
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

// ============================================================================
// COMPONENT: SearchableSelect - FIXED
// ============================================================================
function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
  searchPlaceholder,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  searchPlaceholder?: string;
}) {
  // Use the language hook directly here - it's imported at the top level
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(query),
    );
  }, [options, searchTerm]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-on-surface-variant">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="input-field w-full text-start flex items-center justify-between"
        >
          <span
            className={
              selectedOption ? "text-on-surface" : "text-on-surface-variant/70"
            }
          >
            {selectedOption?.label || placeholder || "اختر"}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-default border border-outline bg-surface-container-low shadow-lg max-h-64 overflow-hidden">
            <div className="p-2 border-b border-outline-variant">
              <div className="flex items-center gap-2 rounded-sm border border-outline-variant bg-surface-container-low px-3">
                <Search size={14} className="text-on-surface-variant" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder || "ابحث..."}
                  className="w-full border-none bg-transparent py-1.5 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="p-2 text-center text-sm text-on-surface-variant">
                  {language === "ar" ? "لا توجد نتائج" : "No results found"}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full text-start rounded-sm px-3 py-2 text-sm transition-colors hover:bg-surface-container-high ${
                      value === option.value
                        ? "bg-primary-fixed text-on-primary-fixed-variant"
                        : "text-on-surface"
                    }`}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
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

export default function BillingPage() {
  const { language } = useLanguage();
  const content = copy[language];

  const [stats, setStats] = useState<any>({});
  const [invoices, setInvoices] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [existingInvoices, setExistingInvoices] = useState<any[]>([]);
  // Modal states
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // New invoice form
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [billingMonth, setBillingMonth] = useState<string>(
    new Date().toISOString().slice(0, 7),
  );
  const [dueDate, setDueDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    return date.toISOString().slice(0, 10);
  });
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [invoiceNotes, setInvoiceNotes] = useState<string>("");

  // Payment form
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  // Filters
  const [studentFilter, setStudentFilter] = useState<string>("");
  const [studentsList, setStudentsList] = useState<any[]>([]);

  const numberFormatter = useMemo(() => new Intl.NumberFormat("en"), []);
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en", {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 0,
      }),
    [],
  );

  // Fetch students for filter
  useEffect(() => {
    async function fetchStudents() {
      const result = await getStudentsForInvoice();
      if (result.success) {
        setStudentsList(result.data);
      }
    }
    fetchStudents();
  }, []);

  const checkExistingInvoices = async (studentId: string) => {
    if (!studentId) {
      setExistingInvoices([]);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .schema("billing")
        .from("invoices")
        .select("id, invoice_number, billing_month, status, total_amount")
        .eq("student_id", studentId)
        .neq("status", "cancelled")
        .order("billing_month", { ascending: false });

      if (!error && data) {
        setExistingInvoices(data);
      }
    } catch (err) {
      console.error("Error checking existing invoices:", err);
    }
  };

  const handleStudentChange = (value: string) => {
    setSelectedStudent(value);
    fetchStudentEnrollments(value);
    checkExistingInvoices(value); // Check for existing invoices
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsResult, invoicesResult, revenueResult] = await Promise.all([
        getBillingStats(),
        getInvoices(
          statusFilter === "all" ? undefined : statusFilter,
          studentFilter || undefined,
        ),
        getMonthlyRevenue(),
      ]);

      if (statsResult.success) setStats(statsResult.data);
      if (invoicesResult.success) setInvoices(invoicesResult.data);
      if (revenueResult.success) setRevenueData(revenueResult.data);
    } catch (err: any) {
      console.error("Failed to load billing data:", err);
      setError(err.message || "BILLING_LOAD_FAILED");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, studentFilter]);

  const fetchStudents = useCallback(async () => {
    const result = await getStudentsForInvoice();
    if (result.success) {
      setStudents(result.data);
    }
  }, []);

  const fetchStudentEnrollments = useCallback(async (studentId: string) => {
    if (!studentId) {
      setInvoiceItems([]);
      return;
    }

    const result = await getStudentEnrollments(studentId);
    if (result.success && result.data) {
      const items = result.data.map((enrollment: any) => ({
        group_id: enrollment.group_id,
        description: enrollment.groups?.name || "",
        unit_price: enrollment.groups?.monthly_price || 0,
        quantity: 1,
      }));
      setInvoiceItems(items);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredInvoices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return invoices;

    return invoices.filter(
      (invoice) =>
        invoice.student?.full_name?.toLowerCase().includes(query) ||
        invoice.student?.student_code?.toLowerCase().includes(query) ||
        invoice.invoice_number?.toString().includes(query),
    );
  }, [invoices, searchTerm]);

  const handleCreateInvoice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setNotification(null);

    try {
      const result = await createInvoice(
        selectedStudent,
        billingMonth,
        dueDate,
        invoiceItems,
        invoiceNotes,
      );

      if (result.existing) {
        setNotification({
          type: "error",
          message: result.error || "هذه الفاتورة موجودة بالفعل",
        });
        setIsLoading(false);
        return;
      }

      if (result.success) {
        setNotification({ type: "success", message: content.invoiceCreated });
        setIsAddInvoiceOpen(false);
        resetForm();
        await fetchData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || content.error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedInvoice) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const result = await recordPayment(
        selectedInvoice.id,
        parseFloat(paymentAmount),
        paymentMethod,
        paymentReference,
        paymentNotes,
      );

      if (result.success) {
        setNotification({ type: "success", message: content.paymentRecorded });
        setIsPaymentOpen(false);
        setSelectedInvoice(null);
        resetPaymentForm();
        await fetchData();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || content.error });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedStudent("");
    setBillingMonth(new Date().toISOString().slice(0, 7));
    const date = new Date();
    date.setDate(date.getDate() + 5);
    setDueDate(date.toISOString().slice(0, 10));
    setInvoiceItems([]);
    setInvoiceNotes("");
    setExistingInvoices([]);
  };

  const resetPaymentForm = () => {
    setPaymentAmount("");
    setPaymentMethod("");
    setPaymentReference("");
    setPaymentNotes("");
  };

  const openPaymentModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.remaining_amount?.toString() || "");
    setIsPaymentOpen(true);
  };

  const openViewModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsViewOpen(true);
  };

  const statusColors = {
    pending: "bg-warning-container text-on-warning-container",
    paid: "bg-secondary-fixed text-on-secondary-fixed-variant",
    partially_paid: "bg-primary-fixed text-on-primary-fixed-variant",
    overdue: "bg-error-container text-on-error-container",
    cancelled: "bg-surface-container-high text-on-surface-variant",
  };

  const statusLabels = {
    pending: content.filters.pending,
    paid: content.filters.paid,
    partially_paid: content.filters.partially_paid,
    overdue: content.filters.overdue,
    cancelled: content.filters.cancelled,
  };

  const paymentMethodOptions = [
    { value: "cash", label: content.paymentMethods.cash },
    { value: "instapay", label: content.paymentMethods.instapay },
    { value: "bank_transfer", label: content.paymentMethods.bank_transfer },
    { value: "wallet", label: content.paymentMethods.wallet },
    { value: "credit_card", label: content.paymentMethods.credit_card },
  ];

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
        {error === "BILLING_LOAD_FAILED" ? content.loadError : error}
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
              fetchStudents();
              resetForm();
              setIsAddInvoiceOpen(true);
            }}
            className="btn-primary"
          >
            <Plus size={16} />
            {content.addInvoice}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label={content.stats.totalInvoices}
          value={numberFormatter.format(stats.totalInvoices || 0)}
          icon={<FileText size={20} />}
        />
        <MetricCard
          label={content.stats.paidInvoices}
          value={numberFormatter.format(stats.paidInvoices || 0)}
          icon={<CheckCircle size={20} />}
          color="text-secondary"
        />
        <MetricCard
          label={content.stats.overdueInvoices}
          value={numberFormatter.format(stats.overdueInvoices || 0)}
          icon={<AlertTriangle size={20} />}
          color="text-error"
        />
        <MetricCard
          label={content.stats.totalRevenue}
          value={currencyFormatter.format(stats.totalRevenue || 0)}
          icon={<DollarSign size={20} />}
          color="text-primary"
        />
        <MetricCard
          label={content.stats.outstandingBalance}
          value={currencyFormatter.format(stats.outstandingBalance || 0)}
          icon={<Clock size={20} />}
          color="text-warning"
        />
        <MetricCard
          label={content.stats.collectionRate}
          value={`${stats.collectionRate || 0}%`}
          icon={<Users size={20} />}
          color="text-secondary"
        />
      </div>

      {/* Invoices Table */}
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
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="input-field w-full xl:w-48"
            >
              <option value="">
                {language === "ar" ? "كل الطلاب" : "All Students"}
              </option>
              {studentsList.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name} ({student.student_code})
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-full xl:w-auto"
            >
              <option value="all">{content.filters.allStatuses}</option>
              <option value="pending">{content.filters.pending}</option>
              <option value="paid">{content.filters.paid}</option>
              <option value="partially_paid">
                {content.filters.partially_paid}
              </option>
              <option value="overdue">{content.filters.overdue}</option>
              <option value="cancelled">{content.filters.cancelled}</option>
            </select>

            <button
              type="button"
              onClick={fetchData}
              className="btn-secondary self-start xl:self-auto"
            >
              <RefreshCw size={16} />
              {content.refresh}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-start">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="label-caps px-6 py-3">
                  {content.invoice.number}
                </th>
                <th className="label-caps px-6 py-3">
                  {content.invoice.student}
                </th>
                <th className="label-caps px-6 py-3">
                  {content.invoice.month}
                </th>
                <th className="label-caps px-6 py-3">
                  {content.invoice.dueDate}
                </th>
                <th className="label-caps px-6 py-3">
                  {content.invoice.total}
                </th>
                <th className="label-caps px-6 py-3">
                  {content.invoice.status}
                </th>
                <th className="label-caps px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-on-surface-variant"
                  >
                    {content.noInvoices}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-on-surface">
                        #{invoice.invoice_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-on-surface">
                          {invoice.student?.full_name}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {invoice.student?.student_code}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {new Date(invoice.billing_month).toLocaleDateString(
                        language === "ar" ? "ar-EG" : "en-US",
                        { month: "long", year: "numeric" },
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {new Date(invoice.due_date).toLocaleDateString(
                        language === "ar" ? "ar-EG" : "en-US",
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-on-surface">
                          {currencyFormatter.format(invoice.total_amount)}
                        </p>
                        {invoice.remaining_amount > 0 && (
                          <p className="text-xs text-on-surface-variant">
                            {content.invoice.remaining}:{" "}
                            {currencyFormatter.format(invoice.remaining_amount)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-sm px-2 py-1 text-xs font-semibold ${
                          statusColors[
                            invoice.status as keyof typeof statusColors
                          ]
                        }`}
                      >
                        {
                          statusLabels[
                            invoice.status as keyof typeof statusLabels
                          ]
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openViewModal(invoice)}
                          className="rounded p-1 hover:bg-surface-container-high"
                          title={content.actions.view}
                        >
                          <Eye size={16} className="text-primary" />
                        </button>
                        {invoice.status !== "paid" &&
                          invoice.status !== "cancelled" && (
                            <button
                              type="button"
                              onClick={() => openPaymentModal(invoice)}
                              className="rounded p-1 hover:bg-surface-container-high"
                              title={content.actions.pay}
                            >
                              <CreditCard
                                size={16}
                                className="text-secondary"
                              />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Invoice Modal */}
      {isAddInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateInvoice}
            className="surface-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto p-0"
          >
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant p-6">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">
                  {content.addInvoice}
                </h2>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                  {content.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddInvoiceOpen(false);
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
                  <SearchableSelect
                    label={content.invoice.student}
                    value={selectedStudent}
                    options={students.map((s) => ({
                      value: s.id,
                      label: `${s.full_name} (${s.student_code})`,
                    }))}
                    onChange={handleStudentChange}
                    placeholder="اختر الطالب"
                    required
                    searchPlaceholder={
                      language === "ar"
                        ? "ابحث بالاسم أو الكود..."
                        : "Search by name or code..."
                    }
                  />
                </div>

                {/* Existing Invoices Warning */}
                {existingInvoices.length > 0 && (
                  <div className="md:col-span-2 rounded-default bg-warning-container p-4 text-sm text-on-warning-container">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">
                          {language === "ar"
                            ? "فواتير موجودة لهذا الطالب"
                            : "Existing invoices for this student"}
                        </p>
                        <div className="mt-2 space-y-1">
                          {existingInvoices.slice(0, 3).map((inv) => (
                            <div
                              key={inv.id}
                              className="flex justify-between text-xs"
                            >
                              <span>
                                {new Date(inv.billing_month).toLocaleDateString(
                                  language === "ar" ? "ar-EG" : "en-US",
                                  { month: "long", year: "numeric" },
                                )}
                              </span>
                              <span className="font-medium">
                                {currencyFormatter.format(inv.total_amount)}
                              </span>
                              <span
                                className={`font-medium ${
                                  inv.status === "paid"
                                    ? "text-secondary"
                                    : inv.status === "overdue"
                                      ? "text-error"
                                      : "text-warning"
                                }`}
                              >
                                {
                                  statusLabels[
                                    inv.status as keyof typeof statusLabels
                                  ]
                                }
                              </span>
                            </div>
                          ))}
                          {existingInvoices.length > 3 && (
                            <p className="text-xs text-on-warning-container/70">
                              {language === "ar"
                                ? `+ ${existingInvoices.length - 3} فواتير أخرى`
                                : `+ ${existingInvoices.length - 3} more invoices`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Field
                  label={content.invoice.month}
                  value={billingMonth}
                  type="month"
                  required
                  onChange={(value) => setBillingMonth(value)}
                />
                <Field
                  label={content.invoice.dueDate}
                  value={dueDate}
                  type="date"
                  required
                  onChange={(value) => setDueDate(value)}
                />
                <div className="md:col-span-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-on-surface-variant">
                      {content.invoice.items}
                    </span>
                    <div className="rounded-default border border-outline-variant p-4">
                      {invoiceItems.length === 0 ? (
                        <p className="text-sm text-on-surface-variant/70">
                          {language === "ar"
                            ? "اختر طالباً أولاً لعرض البنود"
                            : "Select a student first to show items"}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {invoiceItems.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-sm bg-surface-container-low p-2"
                            >
                              <div>
                                <p className="text-sm font-medium text-on-surface">
                                  {item.description}
                                </p>
                                <p className="text-xs text-on-surface-variant">
                                  {item.quantity} ×{" "}
                                  {currencyFormatter.format(item.unit_price)}
                                </p>
                              </div>
                              <p className="font-semibold text-on-surface">
                                {currencyFormatter.format(
                                  item.unit_price * item.quantity,
                                )}
                              </p>
                            </div>
                          ))}
                          <div className="border-t border-outline-variant pt-2">
                            <div className="flex justify-between font-semibold">
                              <span>{content.invoice.total}</span>
                              <span>
                                {currencyFormatter.format(
                                  invoiceItems.reduce(
                                    (sum, item) =>
                                      sum + item.unit_price * item.quantity,
                                    0,
                                  ),
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <Field
                    label={content.invoice.notes}
                    value={invoiceNotes}
                    type="textarea"
                    onChange={(value) => setInvoiceNotes(value)}
                    placeholder={
                      language === "ar"
                        ? "ملاحظات إضافية..."
                        : "Additional notes..."
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsAddInvoiceOpen(false);
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
                disabled={
                  isLoading || !selectedStudent || invoiceItems.length === 0
                }
              >
                {isLoading ? "Creating..." : content.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleRecordPayment}
            className="surface-panel w-full max-w-md p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-on-surface">
                  {content.recordPayment}
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {content.invoice.number}: #{selectedInvoice.invoice_number}
                </p>
                <p className="text-sm text-on-surface-variant">
                  {content.invoice.remaining}:{" "}
                  {currencyFormatter.format(selectedInvoice.remaining_amount)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPaymentOpen(false);
                  setSelectedInvoice(null);
                  resetPaymentForm();
                }}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <Field
                label={content.amount}
                value={paymentAmount}
                type="number"
                required
                onChange={(value) => setPaymentAmount(value)}
              />
              <SelectField
                label={content.paymentMethod}
                value={paymentMethod}
                options={paymentMethodOptions}
                onChange={(value) => setPaymentMethod(value)}
                placeholder={content.selectPaymentMethod}
                required
              />
              <Field
                label={content.transactionReference}
                value={paymentReference}
                onChange={(value) => setPaymentReference(value)}
                placeholder={content.reference}
              />
              <Field
                label={content.invoice.notes}
                value={paymentNotes}
                type="textarea"
                onChange={(value) => setPaymentNotes(value)}
                placeholder={language === "ar" ? "ملاحظات..." : "Notes..."}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-outline-variant pt-6">
              <button
                type="button"
                onClick={() => {
                  setIsPaymentOpen(false);
                  setSelectedInvoice(null);
                  resetPaymentForm();
                }}
                className="btn-secondary"
                disabled={isLoading}
              >
                {content.cancel}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading || !paymentAmount || !paymentMethod}
              >
                {isLoading ? "Processing..." : content.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Invoice Modal */}
      {isViewOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto p-0">
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant p-6">
              <div>
                <h2 className="text-2xl font-semibold text-on-surface">
                  {content.invoice.number} #{selectedInvoice.invoice_number}
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {selectedInvoice.student?.full_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsViewOpen(false);
                  setSelectedInvoice(null);
                }}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant">
                    {content.invoice.month}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-on-surface">
                    {new Date(selectedInvoice.billing_month).toLocaleDateString(
                      language === "ar" ? "ar-EG" : "en-US",
                      { month: "long", year: "numeric" },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant">
                    {content.invoice.dueDate}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-on-surface">
                    {new Date(selectedInvoice.due_date).toLocaleDateString(
                      language === "ar" ? "ar-EG" : "en-US",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant">
                    {content.invoice.status}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-sm px-2 py-1 text-xs font-semibold ${
                      statusColors[
                        selectedInvoice.status as keyof typeof statusColors
                      ]
                    }`}
                  >
                    {
                      statusLabels[
                        selectedInvoice.status as keyof typeof statusLabels
                      ]
                    }
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant">
                    {content.invoice.total}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-on-surface">
                    {currencyFormatter.format(selectedInvoice.total_amount)}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-on-surface">
                  {content.invoice.items}
                </h4>
                <div className="mt-2 space-y-2">
                  {selectedInvoice.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-sm bg-surface-container-low p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-on-surface">
                          {item.description}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {item.quantity} ×{" "}
                          {currencyFormatter.format(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-semibold text-on-surface">
                        {currencyFormatter.format(item.total_price)}
                      </p>
                    </div>
                  ))}
                  <div className="border-t border-outline-variant pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>{content.invoice.total}</span>
                      <span>
                        {currencyFormatter.format(selectedInvoice.total_amount)}
                      </span>
                    </div>
                    {selectedInvoice.discount_amount > 0 && (
                      <div className="flex justify-between text-sm text-on-surface-variant">
                        <span>{language === "ar" ? "الخصم" : "Discount"}</span>
                        <span>
                          -
                          {currencyFormatter.format(
                            selectedInvoice.discount_amount,
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>{content.invoice.paid}</span>
                      <span className="text-secondary">
                        {currencyFormatter.format(selectedInvoice.paid_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{content.invoice.remaining}</span>
                      <span className="text-warning">
                        {currencyFormatter.format(
                          selectedInvoice.remaining_amount,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payments */}
              {selectedInvoice.payments?.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-on-surface">
                    {content.invoice.payments}
                  </h4>
                  <div className="mt-2 space-y-2">
                    {selectedInvoice.payments.map((payment: any) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-sm bg-surface-container-low p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-on-surface">
                            {currencyFormatter.format(payment.amount)}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {payment.method} •{" "}
                            {new Date(
                              payment.payment_date,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-on-surface-variant">
                          {payment.received_by?.full_name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedInvoice.notes && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-on-surface">
                    {content.invoice.notes}
                  </h4>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {selectedInvoice.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setIsViewOpen(false);
                  setSelectedInvoice(null);
                }}
                className="btn-secondary"
              >
                {content.cancel}
              </button>
              {selectedInvoice.status !== "paid" &&
                selectedInvoice.status !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsViewOpen(false);
                      openPaymentModal(selectedInvoice);
                    }}
                    className="btn-primary"
                  >
                    <CreditCard size={16} />
                    {content.actions.pay}
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}