"use client";

import { useLanguage } from "@/core/i18n/useLanguage";
import { useCallback, useEffect, useMemo, useState } from "react";
import StatsCard from "@/components/shared/StatsCard";
import {
  AlertCircle,
  BookOpen,
  Clock,
  GraduationCap,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";

type DashboardData = {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    activeGroups: number;
    monthlyRevenue: number;
    expectedRevenue: number;
    outstandingDebt: number;
    collectionRate: number;
  };
  reminders: Array<{
    invoiceId: string;
    studentName: string;
    parentName: string | null;
    parentWhatsapp: string | null;
    amount: number;
    billingMonth: string;
    itemDetails: string | null;
  }>;
  sessions: Array<{
    id: string;
    groupName: string;
    classroomName: string | null;
    startTime: string;
    endTime: string;
  }>;
  errors: string[];
};

const emptyDashboard: DashboardData = {
  stats: {
    totalStudents: 0,
    totalTeachers: 0,
    activeGroups: 0,
    monthlyRevenue: 0,
    expectedRevenue: 0,
    outstandingDebt: 0,
    collectionRate: 0,
  },
  reminders: [],
  sessions: [],
  errors: [],
};

function formatTime(value: string) {
  return value.slice(0, 5);
}

async function fetchDashboardData() {
  const response = await fetch("/api/dashboard", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("DASHBOARD_LOAD_FAILED");
  }

  return (await response.json()) as DashboardData;
}

const copy = {
  ar: {
    eyebrow: "Al Abakera EMS",
    title: "مرحبا بك، أدمن النظام",
    description:
      "نظرة مباشرة على مؤشرات السنتر، التحصيل، الجداول، والتنبيهات من قاعدة Supabase.",
    refresh: "تحديث",
    loadError: "تعذر تحميل بيانات لوحة التحكم",
    unexpectedError: "حدث خطأ غير متوقع",
    partialError: "بعض بيانات اللوحة لم يتم تحميلها:",
    noInvoices: "لا توجد فواتير لهذا الشهر",
    collected: "تم تحصيل",
    expected: "من المتوقع",
    totalStudents: "إجمالي الطلاب",
    studentsDescription: "طلاب مسجلون في النظام",
    teachers: "المعلمون",
    teachersDescription: "معلمون مسجلون في السنتر",
    monthlyRevenue: "إيرادات الشهر",
    outstandingDebt: "مديونيات مستحقة",
    debtDescription: "فواتير تحتاج متابعة",
    billingEyebrow: "Billing",
    remindersTitle: "تنبيهات السداد المعلقة",
    emptyReminders: "لا توجد تنبيهات سداد معلقة حاليا.",
    monthlyInvoice: "فاتورة شهرية",
    sendWhatsapp: "إرسال واتساب",
    scheduleEyebrow: "Schedule",
    todaySessions: "حصص اليوم",
    emptySessions: "لا توجد حصص مجدولة اليوم.",
    groupsEyebrow: "Groups",
    activeGroups: "المجموعات النشطة",
  },
  en: {
    eyebrow: "Al Abakera EMS",
    title: "Welcome back, System Admin",
    description:
      "A live view of center performance, collections, schedules, and alerts from Supabase.",
    refresh: "Refresh",
    loadError: "Unable to load dashboard data",
    unexpectedError: "An unexpected error occurred",
    partialError: "Some dashboard data could not be loaded:",
    noInvoices: "No invoices for this month",
    collected: "Collected",
    expected: "of expected revenue",
    totalStudents: "Total students",
    studentsDescription: "Students registered in the system",
    teachers: "Teachers",
    teachersDescription: "Teachers registered in the center",
    monthlyRevenue: "Monthly revenue",
    outstandingDebt: "Outstanding debt",
    debtDescription: "Invoices that need follow-up",
    billingEyebrow: "Billing",
    remindersTitle: "Pending payment reminders",
    emptyReminders: "There are no pending payment reminders right now.",
    monthlyInvoice: "Monthly invoice",
    sendWhatsapp: "Send WhatsApp",
    scheduleEyebrow: "Schedule",
    todaySessions: "Today's sessions",
    emptySessions: "There are no sessions scheduled today.",
    groupsEyebrow: "Groups",
    activeGroups: "Active groups",
  },
};

export default function DashboardPage() {
  const { language } = useLanguage();
  const content = copy[language];
  const locale = language === "ar" ? "ar-EG" : "en-EG";
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 0,
      }),
    [locale]
  );
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function formatCurrency(value: number) {
    return currencyFormatter.format(value);
  }

  const getErrorMessage = useCallback((err: unknown) => {
    if (err instanceof Error && err.message === "DASHBOARD_LOAD_FAILED") {
      return content.loadError;
    }

    return err instanceof Error ? err.message : content.unexpectedError;
  }, [content.loadError, content.unexpectedError]);

  async function loadDashboard() {
    try {
      setIsLoading(true);
      setError(null);

      setDashboard(await fetchDashboardData());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadInitialDashboard() {
      try {
        const payload = await fetchDashboardData();
        if (!isActive) return;
        setDashboard(payload);
      } catch (err) {
        if (!isActive) return;
        setError(getErrorMessage(err));
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadInitialDashboard();

    return () => {
      isActive = false;
    };
  }, [getErrorMessage]);

  const collectionDescription = useMemo(() => {
    if (dashboard.stats.expectedRevenue <= 0) {
      return content.noInvoices;
    }

    return `${content.collected} ${numberFormatter.format(
      dashboard.stats.collectionRate
    )}% ${content.expected}`;
  }, [
    content.collected,
    content.expected,
    content.noInvoices,
    dashboard.stats.collectionRate,
    dashboard.stats.expectedRevenue,
    numberFormatter,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-outline-variant pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="label-caps">{content.eyebrow}</p>
          <h1 className="mt-2 text-[30px] font-semibold leading-9 tracking-[-0.01em] text-on-surface">
            {content.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
            {content.description}
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={isLoading}
          className="btn-secondary"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          {content.refresh}
        </button>
      </div>

      {error && (
        <div className="rounded-default border border-error/30 bg-error-container px-4 py-3 text-sm font-medium text-on-error-container">
          {error}
        </div>
      )}

      {dashboard.errors.length > 0 && (
        <div className="rounded-default border border-tertiary-fixed-dim/60 bg-tertiary-fixed px-4 py-3 text-sm text-on-tertiary-fixed">
          {content.partialError} {dashboard.errors[0]}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label={content.totalStudents}
          value={isLoading ? "..." : numberFormatter.format(dashboard.stats.totalStudents)}
          icon={<Users size={24} />}
          description={content.studentsDescription}
        />
        <StatsCard
          label={content.teachers}
          value={isLoading ? "..." : numberFormatter.format(dashboard.stats.totalTeachers)}
          icon={<GraduationCap size={24} />}
          description={content.teachersDescription}
        />
        <StatsCard
          label={content.monthlyRevenue}
          value={isLoading ? "..." : formatCurrency(dashboard.stats.monthlyRevenue)}
          icon={<Wallet size={24} />}
          trend={
            dashboard.stats.collectionRate > 0
              ? { value: Math.round(dashboard.stats.collectionRate), isUp: true }
              : undefined
          }
          description={collectionDescription}
        />
        <StatsCard
          label={content.outstandingDebt}
          value={isLoading ? "..." : formatCurrency(dashboard.stats.outstandingDebt)}
          icon={<AlertCircle size={24} />}
          description={content.debtDescription}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="surface-card p-5 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="label-caps">{content.billingEyebrow}</p>
              <h2 className="mt-1 text-xl font-semibold leading-7 text-on-surface">
                {content.remindersTitle}
              </h2>
            </div>
            <span className="rounded-sm bg-primary-fixed px-2 py-1 text-xs font-semibold text-on-primary-fixed-variant">
              {numberFormatter.format(dashboard.reminders.length)}
            </span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-md border border-outline-variant bg-surface-container-low"
                />
              ))
            ) : dashboard.reminders.length === 0 ? (
              <div className="rounded-default border border-dashed border-outline bg-surface-container-low p-8 text-center text-sm text-on-surface-variant">
                {content.emptyReminders}
              </div>
            ) : (
              dashboard.reminders.map((reminder) => (
                <div
                  key={reminder.invoiceId}
                  className="flex flex-col gap-4 rounded-default border border-outline-variant bg-surface-container-lowest p-4 transition-colors hover:border-primary-fixed-dim hover:bg-surface-container-low md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-default bg-secondary-fixed font-semibold text-on-secondary-fixed-variant">
                      {reminder.studentName.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {reminder.studentName}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {formatCurrency(reminder.amount)} -{" "}
                        {reminder.itemDetails ?? content.monthlyInvoice}
                      </p>
                    </div>
                  </div>
                  <a
                    href={
                      reminder.parentWhatsapp
                        ? `https://wa.me/${reminder.parentWhatsapp}`
                        : undefined
                    }
                    className="btn-secondary h-9 px-3 text-xs"
                  >
                    {content.sendWhatsapp}
                  </a>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="surface-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="label-caps">{content.scheduleEyebrow}</p>
                <h2 className="mt-1 text-xl font-semibold leading-7 text-on-surface">
                  {content.todaySessions}
                </h2>
              </div>
              <BookOpen size={18} className="text-primary" />
            </div>

            <div className="space-y-4">
              {isLoading ? (
                [1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-14 animate-pulse rounded-md bg-surface-container-low"
                  />
                ))
              ) : dashboard.sessions.length === 0 ? (
                <div className="rounded-default border border-dashed border-outline bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">
                  {content.emptySessions}
                </div>
              ) : (
                dashboard.sessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-4">
                    <div className="h-12 w-1.5 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {session.groupName}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-on-surface-variant">
                        <Clock size={12} />
                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        {session.classroomName ? ` - ${session.classroomName}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="surface-card p-5">
            <p className="label-caps">{content.groupsEyebrow}</p>
            <p className="mt-3 text-3xl font-semibold text-on-surface">
              {isLoading ? "..." : numberFormatter.format(dashboard.stats.activeGroups)}
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">{content.activeGroups}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
