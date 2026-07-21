"use client";

import LanguageToggle from "@/components/shared/LanguageToggle";
import ThemeModeToggle from "@/components/shared/ThemeModeToggle";
import { useLanguage } from "@/core/i18n/useLanguage";
import {
  Bell,
  Building2,
  CreditCard,
  Database,
  Globe2,
  KeyRound,
  Lock,
  Mail,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
} from "lucide-react";

const copy = {
  ar: {
    eyebrow: "إعدادات النظام",
    title: "الإعدادات",
    description:
      "اضبط بيانات المؤسسة، الصلاحيات، الإشعارات، وإعدادات الأمان من مكان واحد.",
    save: "حفظ التغييرات",
    displayTitle: "وضع النظام",
    displayDescription: "اختر الوضع الفاتح أو الداكن لهذا المتصفح.",
    languageTitle: "لغة النظام",
    languageDescription: "اختر العربية أو الإنجليزية لهذا المتصفح.",
    operationsTitle: "إعدادات التشغيل",
    securityTitle: "حالة الأمان",
    securityDescription: "ملخص سريع للإعدادات الحساسة وحالة الاتصال.",
    storageTitle: "استخدام قاعدة البيانات",
    storageUsed: "68% مستخدم",
    sections: [
      {
        title: "بيانات المؤسسة",
        description: "المعلومات الأساسية التي تظهر في النظام والفواتير.",
        icon: Building2,
        fields: [
          { label: "اسم المؤسسة", value: "سنتر العباقرة" },
          { label: "البريد الرسمي", value: "admin@alabakera.edu" },
          { label: "رقم الهاتف", value: "+20 100 000 0000" },
          { label: "العنوان", value: "القاهرة، مصر" },
        ],
      },
      {
        title: "الحساب والصلاحيات",
        description: "إعدادات المديرين، الأمان، ومستويات الوصول.",
        icon: UserCog,
        fields: [
          { label: "اسم المدير", value: "أدمن النظام" },
          { label: "الدور", value: "مدير عام" },
          { label: "الجلسة", value: "تسجيل خروج تلقائي بعد 30 دقيقة" },
          { label: "لغة الواجهة", value: "العربية" },
        ],
      },
    ],
    toggles: [
      {
        label: "إشعارات واتساب لأولياء الأمور",
        description: "إرسال تنبيهات تلقائية للفواتير والحضور.",
        icon: Bell,
        enabled: true,
      },
      {
        label: "مراجعة يدوية للمدفوعات",
        description: "تعليق المدفوعات الجديدة حتى يراجعها مسؤول مالي.",
        icon: CreditCard,
        enabled: false,
      },
      {
        label: "تسجيل أنشطة المستخدمين",
        description: "حفظ سجل دقيق للتغييرات الحساسة داخل النظام.",
        icon: ShieldCheck,
        enabled: true,
      },
      {
        label: "النسخ الاحتياطي اليومي",
        description: "إنشاء نسخة احتياطية من البيانات كل ليلة.",
        icon: Database,
        enabled: true,
      },
    ],
    securityItems: [
      { label: "المصادقة الثنائية", value: "مفعلة", icon: Lock },
      { label: "مفاتيح API", value: "3 مفاتيح نشطة", icon: KeyRound },
      { label: "نطاق البريد", value: "alabakera.edu", icon: Mail },
      { label: "المنطقة الزمنية", value: "Africa/Cairo", icon: Globe2 },
    ],
  },
  en: {
    eyebrow: "System Settings",
    title: "Settings",
    description:
      "Manage institution details, permissions, notifications, and security settings in one place.",
    save: "Save changes",
    displayTitle: "System mode",
    displayDescription: "Choose light or dark mode for this browser.",
    languageTitle: "System language",
    languageDescription: "Choose Arabic or English for this browser.",
    operationsTitle: "Operations settings",
    securityTitle: "Security status",
    securityDescription: "A quick summary of sensitive settings and connectivity.",
    storageTitle: "Database usage",
    storageUsed: "68% used",
    sections: [
      {
        title: "Institution details",
        description: "Core information shown across the system and invoices.",
        icon: Building2,
        fields: [
          { label: "Institution name", value: "Al Abakera Center" },
          { label: "Official email", value: "admin@alabakera.edu" },
          { label: "Phone number", value: "+20 100 000 0000" },
          { label: "Address", value: "Cairo, Egypt" },
        ],
      },
      {
        title: "Account and permissions",
        description: "Admin settings, security, and access levels.",
        icon: UserCog,
        fields: [
          { label: "Admin name", value: "System Admin" },
          { label: "Role", value: "General Manager" },
          { label: "Session", value: "Auto sign out after 30 minutes" },
          { label: "Interface language", value: "English" },
        ],
      },
    ],
    toggles: [
      {
        label: "WhatsApp parent notifications",
        description: "Send automated alerts for invoices and attendance.",
        icon: Bell,
        enabled: true,
      },
      {
        label: "Manual payment review",
        description: "Hold new payments until a finance admin reviews them.",
        icon: CreditCard,
        enabled: false,
      },
      {
        label: "User activity logging",
        description: "Keep a precise audit trail for sensitive system changes.",
        icon: ShieldCheck,
        enabled: true,
      },
      {
        label: "Daily backup",
        description: "Create a database backup every night.",
        icon: Database,
        enabled: true,
      },
    ],
    securityItems: [
      { label: "Two-factor authentication", value: "Enabled", icon: Lock },
      { label: "API keys", value: "3 active keys", icon: KeyRound },
      { label: "Email domain", value: "alabakera.edu", icon: Mail },
      { label: "Timezone", value: "Africa/Cairo", icon: Globe2 },
    ],
  },
};

export default function SettingsPage() {
  const { language } = useLanguage();
  const content = copy[language];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-outline-variant pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label-caps">{content.eyebrow}</p>
          <h1 className="mt-2 text-[30px] font-semibold leading-9 tracking-[-0.01em] text-on-surface">
            {content.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
            {content.description}
          </p>
        </div>

        <button type="button" className="btn-primary">
          <Save size={16} />
          {content.save}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {content.sections.map((section) => (
            <section key={section.title} className="surface-card p-5">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-default bg-primary-fixed text-on-primary-fixed-variant ring-1 ring-primary-fixed-dim/50">
                  <section.icon size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold leading-7 text-on-surface">
                    {section.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {section.fields.map((field) => (
                  <label key={field.label} className="space-y-2">
                    <span className="text-sm font-semibold text-on-surface-variant">
                      {field.label}
                    </span>
                    <input defaultValue={field.value} className="input-field w-full" />
                  </label>
                ))}
              </div>
            </section>
          ))}

          <section className="surface-card overflow-hidden">
            <div className="border-b border-outline-variant p-5">
              <div className="flex items-center gap-3">
                <SlidersHorizontal size={20} className="text-primary" />
                <h2 className="text-xl font-semibold text-on-surface">
                  {content.operationsTitle}
                </h2>
              </div>
            </div>

            <div className="divide-y divide-outline-variant">
              {content.toggles.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-default bg-surface-container-low text-primary">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center self-start md:self-center">
                    <input
                      type="checkbox"
                      defaultChecked={item.enabled}
                      className="peer sr-only"
                    />
                    <span className="h-6 w-11 rounded-full bg-outline-variant transition peer-checked:bg-primary" />
                    <span className="absolute start-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="surface-card p-5">
            <h2 className="text-xl font-semibold leading-7 text-on-surface">
              {content.languageTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              {content.languageDescription}
            </p>
            <div className="mt-5">
              <LanguageToggle variant="segmented" />
            </div>
          </section>

          <section className="surface-card p-5">
            <h2 className="text-xl font-semibold leading-7 text-on-surface">
              {content.displayTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              {content.displayDescription}
            </p>
            <div className="mt-5">
              <ThemeModeToggle />
            </div>
          </section>

          <section className="surface-card p-5">
            <h2 className="text-xl font-semibold leading-7 text-on-surface">
              {content.securityTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              {content.securityDescription}
            </p>

            <div className="mt-6 space-y-3">
              {content.securityItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-default border border-outline-variant bg-surface-container-low p-4"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className="text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5">
            <p className="label-caps">Storage</p>
            <h2 className="mt-2 text-xl font-semibold text-on-surface">
              {content.storageTitle}
            </h2>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full w-[68%] rounded-full bg-primary" />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-on-surface-variant">
              <span>{content.storageUsed}</span>
              <span>32 GB / 48 GB</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
