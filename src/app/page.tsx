// app/page.tsx (updated)

"use client";

import { useLanguage } from "@/core/i18n/useLanguage";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  return (
    <main className="min-h-screen">
      <Hero isArabic={isArabic} />
      <Stats isArabic={isArabic} />
      <Features isArabic={isArabic} />
      <Testimonials isArabic={isArabic} />
      <CTA isArabic={isArabic} />
      <Footer isArabic={isArabic} />
    </main>
  );
}