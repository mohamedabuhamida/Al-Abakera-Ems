// app/components/landing/Hero.tsx

"use client";

import { useState } from "react";
import { ArrowRight, Play, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface HeroProps {
  isArabic: boolean;
}

const content = {
  ar: {
    badge: "🚀 نظام إدارة تعليمي متكامل",
    title: "العباقرة",
    titleHighlight: "نظام تعليمي",
    titleEnd: "متطور",
    description:
      "منصة متكاملة لإدارة المدارس والمراكز التعليمية. سهلة الاستخدام، قوية الأداء، ومصممة خصيصاً للتعليم في الشرق الأوسط.",
    primaryCta: "ابدأ الآن",
    secondaryCta: "شاهد العرض",
    stats: [
      { label: "مؤسسة تعليمية", value: "500+" },
      { label: "طالب مسجل", value: "50,000+" },
      { label: "معلم", value: "2,000+" },
      { label: "دولة", value: "15+" },
    ],
    features: [
      "إدارة الطلاب والمعلمين",
      "الفواتير والمدفوعات",
      "الجدول الزمني",
      "التقارير والإحصائيات",
    ],
  },
  en: {
    badge: "🚀 Comprehensive Education Management System",
    title: "Al Abakera",
    titleHighlight: "Education",
    titleEnd: "Management",
    description:
      "An all-in-one platform for schools and educational centers. Easy to use, powerful, and designed specifically for Middle Eastern education.",
    primaryCta: "Get Started",
    secondaryCta: "Watch Demo",
    stats: [
      { label: "Educational Institutions", value: "500+" },
      { label: "Students", value: "50,000+" },
      { label: "Teachers", value: "2,000+" },
      { label: "Countries", value: "15+" },
    ],
    features: [
      "Student & Teacher Management",
      "Invoicing & Payments",
      "Schedule Management",
      "Reports & Analytics",
    ],
  },
};

export function Hero({ isArabic }: HeroProps) {
  const c = content[isArabic ? "ar" : "en"];
  const [isHovering, setIsHovering] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-surface to-secondary/5 pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 blur-2xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {c.badge}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
            <span className="text-on-surface">{c.title}</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {c.titleHighlight}
            </span>
            <span className="text-on-surface"> {c.titleEnd}</span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-lg md:text-xl text-on-surface-variant max-w-2xl leading-relaxed">
            {c.description}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-on-primary transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {c.primaryCta}
              <ArrowRight
                size={20}
                className={`transition-transform duration-300 ${
                  isHovering ? "translate-x-1" : ""
                } ${isArabic ? "rotate-180" : ""}`}
              />
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant bg-surface/80 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-on-surface transition-all hover:bg-surface-container hover:border-primary/30"
            >
              <Play size={20} className="text-primary" />
              {c.secondaryCta}
            </Link>
          </div>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {c.features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-sm text-on-surface-variant border border-outline-variant/50"
              >
                <CheckCircle size={14} className="text-secondary" />
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}