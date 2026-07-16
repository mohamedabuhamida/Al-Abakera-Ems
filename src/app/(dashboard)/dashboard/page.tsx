"use client";

import { useEffect, useMemo, useState } from "react";
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

const currencyFormatter = new Intl.NumberFormat("ar-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("ar-EG");

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

async function fetchDashboardData() {
  const response = await fetch("/api/dashboard", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("تعذر تحميل بيانات لوحة التحكم");
  }

  return (await response.json()) as DashboardData;
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      setIsLoading(true);
      setError(null);

      setDashboard(await fetchDashboardData());
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
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
        setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadInitialDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  const collectionDescription = useMemo(() => {
    if (dashboard.stats.expectedRevenue <= 0) {
      return "لا توجد فواتير لهذا الشهر";
    }

    return `تم تحصيل ${numberFormatter.format(
      dashboard.stats.collectionRate
    )}% من المتوقع`;
  }, [dashboard.stats.collectionRate, dashboard.stats.expectedRevenue]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-outline-variant pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="label-caps">Al Abakera EMS</p>
          <h1 className="mt-2 text-[30px] font-semibold leading-9 tracking-[-0.01em] text-on-surface">
            مرحبا بك، أدمن النظام
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
            نظرة مباشرة على مؤشرات السنتر، التحصيل، الجداول، والتنبيهات من قاعدة Supabase.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={isLoading}
          className="btn-secondary"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      {error && (
        <div className="rounded-default border border-error/30 bg-error-container px-4 py-3 text-sm font-medium text-on-error-container">
          {error}
        </div>
      )}

      {dashboard.errors.length > 0 && (
        <div className="rounded-default border border-tertiary-fixed-dim/60 bg-tertiary-fixed px-4 py-3 text-sm text-on-tertiary-fixed">
          بعض بيانات اللوحة لم يتم تحميلها: {dashboard.errors[0]}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="إجمالي الطلاب"
          value={isLoading ? "..." : numberFormatter.format(dashboard.stats.totalStudents)}
          icon={<Users size={24} />}
          description="طلاب مسجلون في النظام"
        />
        <StatsCard
          label="المعلمون"
          value={isLoading ? "..." : numberFormatter.format(dashboard.stats.totalTeachers)}
          icon={<GraduationCap size={24} />}
          description="معلمون مسجلون في السنتر"
        />
        <StatsCard
          label="إيرادات الشهر"
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
          label="مديونيات مستحقة"
          value={isLoading ? "..." : formatCurrency(dashboard.stats.outstandingDebt)}
          icon={<AlertCircle size={24} />}
          description="فواتير تحتاج متابعة"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="surface-card p-5 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="label-caps">Billing</p>
              <h2 className="mt-1 text-xl font-semibold leading-7 text-on-surface">
                تنبيهات السداد المعلقة
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
                لا توجد تنبيهات سداد معلقة حاليا.
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
                        {reminder.itemDetails ?? "فاتورة شهرية"}
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
                    إرسال واتساب
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
                <p className="label-caps">Schedule</p>
                <h2 className="mt-1 text-xl font-semibold leading-7 text-on-surface">
                  حصص اليوم
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
                  لا توجد حصص مجدولة اليوم.
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
            <p className="label-caps">Groups</p>
            <p className="mt-3 text-3xl font-semibold text-on-surface">
              {isLoading ? "..." : numberFormatter.format(dashboard.stats.activeGroups)}
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">المجموعات النشطة</p>
          </section>
        </div>
      </div>
    </div>
  );
}
