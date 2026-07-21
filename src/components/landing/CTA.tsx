// app/components/landing/CTA.tsx

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTAProps {
  isArabic: boolean;
}

const content = {
  ar: {
    title: "جاهز لبدء رحلتك التعليمية؟",
    description:
      "انضم إلى آلاف المؤسسات التعليمية التي تثق في نظام العباقرة لإدارة عملياتها.",
    button: "ابدأ الآن مجاناً",
    secondary: "تواصل مع المبيعات",
  },
  en: {
    title: "Ready to Start Your Educational Journey?",
    description:
      "Join thousands of educational institutions that trust Al Abakera to manage their operations.",
    button: "Start Free Trial",
    secondary: "Contact Sales",
  },
};

export function CTA({ isArabic }: CTAProps) {
  const c = content[isArabic ? "ar" : "en"];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 md:p-12 rounded-3xl bg-surface border border-primary/20 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
              {c.title}
            </h2>
            <p className="mt-4 text-lg text-on-surface-variant max-w-2xl mx-auto">
              {c.description}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-on-primary transition-all hover:bg-primary/90 hover:scale-105 shadow-lg shadow-primary/25"
              >
                {c.button}
                <ArrowRight
                  size={20}
                  className={`transition-transform duration-300 group-hover:translate-x-1 ${
                    isArabic ? "rotate-180" : ""
                  }`}
                />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-outline-variant px-8 py-4 text-lg font-semibold text-on-surface transition-all hover:bg-surface-container hover:border-primary/30"
              >
                {c.secondary}
              </Link>
            </div>
            <p className="mt-6 text-sm text-on-surface-variant">
              {isArabic
                ? "لا حاجة لبطاقة ائتمان. ابدأ تجربتك المجانية اليوم."
                : "No credit card required. Start your free trial today."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}