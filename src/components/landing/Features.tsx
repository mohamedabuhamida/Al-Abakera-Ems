// app/components/landing/Features.tsx

"use client";

import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  BarChart,
  Settings,
  MessageSquare,
  Shield,
  Zap,
  Cloud,
  Smartphone,
} from "lucide-react";

interface FeaturesProps {
  isArabic: boolean;
}

const content = {
  ar: {
    title: "مميزات النظام",
    description: "كل ما تحتاجه لإدارة مؤسستك التعليمية في مكان واحد",
  },
  en: {
    title: "System Features",
    description: "Everything you need to manage your educational institution in one place",
  },
};

const features = {
  ar: [
    {
      icon: Users,
      title: "إدارة الطلاب",
      description: "تسجيل الطلاب، متابعة التقدم، والتواصل مع أولياء الأمور بسهولة",
    },
    {
      icon: GraduationCap,
      title: "إدارة المعلمين",
      description: "إدارة المعلمين، توزيع المواد، ومتابعة الأداء",
    },
    {
      icon: BookOpen,
      title: "المجموعات الدراسية",
      description: "إنشاء وإدارة المجموعات الدراسية والجداول الزمنية",
    },
    {
      icon: Calendar,
      title: "الجدول الزمني",
      description: "جدول زمني تفاعلي للمجموعات والمعلمين والطلاب",
    },
    {
      icon: DollarSign,
      title: "الفواتير والمدفوعات",
      description: "نظام فوترة متكامل مع تتبع المدفوعات والتقارير المالية",
    },
    {
      icon: BarChart,
      title: "التقارير والإحصائيات",
      description: "تقارير مفصلة وإحصائيات لحظية لاتخاذ القرارات",
    },
    {
      icon: Settings,
      title: "إعدادات مرنة",
      description: "تخصيص النظام حسب احتياجات مؤسستك التعليمية",
    },
    {
      icon: MessageSquare,
      title: "تواصل مباشر",
      description: "قنوات تواصل مع أولياء الأمور عبر واتساب والبريد الإلكتروني",
    },
    {
      icon: Shield,
      title: "أمان وحماية",
      description: "نظام آمن مع صلاحيات متعددة المستويات",
    },
    {
      icon: Zap,
      title: "أداء سريع",
      description: "تقنية حديثة تضمن سرعة عالية وأداء مستقر",
    },
    {
      icon: Cloud,
      title: "سحابة متكاملة",
      description: "الوصول إلى البيانات من أي مكان وفي أي وقت",
    },
    {
      icon: Smartphone,
      title: "دعم الأجهزة المحمولة",
      description: "واجهة متجاوبة تعمل على جميع الأجهزة",
    },
  ],
  en: [
    {
      icon: Users,
      title: "Student Management",
      description: "Register students, track progress, and communicate with parents easily",
    },
    {
      icon: GraduationCap,
      title: "Teacher Management",
      description: "Manage teachers, assign subjects, and track performance",
    },
    {
      icon: BookOpen,
      title: "Study Groups",
      description: "Create and manage study groups and schedules",
    },
    {
      icon: Calendar,
      title: "Schedule Management",
      description: "Interactive schedule for groups, teachers, and students",
    },
    {
      icon: DollarSign,
      title: "Invoicing & Payments",
      description: "Complete billing system with payment tracking and financial reports",
    },
    {
      icon: BarChart,
      title: "Reports & Analytics",
      description: "Detailed reports and real-time analytics for decision making",
    },
    {
      icon: Settings,
      title: "Flexible Settings",
      description: "Customize the system to fit your institution's needs",
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description: "Communication channels with parents via WhatsApp and email",
    },
    {
      icon: Shield,
      title: "Security & Protection",
      description: "Secure system with multi-level permissions",
    },
    {
      icon: Zap,
      title: "Fast Performance",
      description: "Modern technology ensuring high speed and stable performance",
    },
    {
      icon: Cloud,
      title: "Cloud Integration",
      description: "Access data from anywhere, at any time",
    },
    {
      icon: Smartphone,
      title: "Mobile Support",
      description: "Responsive interface that works on all devices",
    },
  ],
};

export function Features({ isArabic }: FeaturesProps) {
  const c = content[isArabic ? "ar" : "en"];
  const featuresList = features[isArabic ? "ar" : "en"];

  return (
    <section className="py-20 bg-surface">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary mb-4 border border-secondary/20">
            {isArabic ? "المميزات" : "Features"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
            {c.title}
          </h2>
          <p className="mt-4 text-lg text-on-surface-variant">
            {c.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuresList.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-surface-container border border-outline-variant/50 hover:border-primary/30 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="rounded-xl bg-primary/10 w-12 h-12 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-on-surface mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}