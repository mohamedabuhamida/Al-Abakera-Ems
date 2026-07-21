// app/components/landing/Stats.tsx

"use client";

import { useEffect, useState } from "react";
import { Users, GraduationCap, School, Globe } from "lucide-react";

interface StatsProps {
  isArabic: boolean;
}

const content = {
  ar: {
    title: "أرقامنا تتحدث عن نفسها",
    description: "نثق في نظامنا، ويثق بنا آلاف المستخدمين حول العالم",
  },
  en: {
    title: "Our Numbers Speak for Themselves",
    description: "We trust our system, and thousands of users worldwide trust us",
  },
};

const stats = [
  { value: 500, suffix: "+", label: "مؤسسة تعليمية", icon: School },
  { value: 50000, suffix: "+", label: "طالب مسجل", icon: Users },
  { value: 2000, suffix: "+", label: "معلم", icon: GraduationCap },
  { value: 15, suffix: "+", label: "دولة", icon: Globe },
];

export function Stats({ isArabic }: StatsProps) {
  const c = content[isArabic ? "ar" : "en"];
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const targetCounts = stats.map((s) => s.value);
    const increments = targetCounts.map((t) => t / steps);

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCounts(targetCounts);
        clearInterval(timer);
        return;
      }
      setCounts((prev) => prev.map((p, i) => Math.floor(p + increments[i])));
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-surface-container">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
            {c.title}
          </h2>
          <p className="mt-4 text-lg text-on-surface-variant">
            {c.description}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-surface border border-outline-variant/50 hover:border-primary/30 transition-all hover:shadow-lg"
              >
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Icon size={32} className="text-primary" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-on-surface">
                  {counts[index].toLocaleString()}
                  {stat.suffix}
                </div>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}