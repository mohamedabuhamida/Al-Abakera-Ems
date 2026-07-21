// app/components/landing/Testimonials.tsx

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";

interface TestimonialsProps {
  isArabic: boolean;
}

const content = {
  ar: {
    title: "آراء عملائنا",
    description: "ماذا يقول عنا المديرين والمعلمين الذين يستخدمون نظام العباقرة",
  },
  en: {
    title: "What Our Clients Say",
    description: "What administrators and teachers say about Al Abakera",
  },
};

const testimonials = {
  ar: [
    {
      name: "أحمد محمد",
      role: "مدير مدرسة",
      content:
        "نظام العباقرة غيَّر طريقة إدارتنا للمدرسة بشكل كامل. أصبح كل شيء منظماً وسهلاً، من الطلاب إلى الفواتير.",
      rating: 5,
    },
    {
      name: "سارة أحمد",
      role: "معلمة",
      content:
        "أحب استخدام نظام العباقرة لمتابعة طلابي وتوزيع المواد. الواجهة سهلة والنتائج فورية.",
      rating: 5,
    },
    {
      name: "محمد علي",
      role: "مدير مركز تعليمي",
      content:
        "بفضل نظام العباقرة، أصبحنا ندير أكثر من 500 طالب ومعلم بكفاءة عالية. نظام الفواتير ممتاز.",
      rating: 5,
    },
    {
      name: "فاطمة حسن",
      role: "مسؤولة حسابات",
      content:
        "نظام الفواتير والمدفوعات سهل الاستخدام ويوفر لنا تقارير مالية دقيقة في لحظات.",
      rating: 5,
    },
  ],
  en: [
    {
      name: "Ahmed Mohamed",
      role: "School Principal",
      content:
        "Al Abakera has completely transformed how we manage our school. Everything is organized and easy, from students to invoices.",
      rating: 5,
    },
    {
      name: "Sara Ahmed",
      role: "Teacher",
      content:
        "I love using Al Abakera to track my students and manage subjects. The interface is simple and results are instant.",
      rating: 5,
    },
    {
      name: "Mohamed Ali",
      role: "Education Center Manager",
      content:
        "Thanks to Al Abakera, we now manage over 500 students and teachers efficiently. The billing system is excellent.",
      rating: 5,
    },
    {
      name: "Fatima Hassan",
      role: "Accountant",
      content:
        "The invoicing and payment system is easy to use and provides accurate financial reports in seconds.",
      rating: 5,
    },
  ],
};

export function Testimonials({ isArabic }: TestimonialsProps) {
  const c = content[isArabic ? "ar" : "en"];
  const t = testimonials[isArabic ? "ar" : "en"];
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % t.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + t.length) % t.length);
  };

  // Get visible testimonials (3 on desktop, 2 on tablet, 1 on mobile)
  const getVisibleTestimonials = () => {
    const items = [];
    const total = t.length;
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % total;
      items.push(t[index]);
    }
    return items;
  };

  return (
    <section className="py-20 bg-surface-container">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4 border border-primary/20">
            {isArabic ? "الشهادات" : "Testimonials"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-on-surface">
            {c.title}
          </h2>
          <p className="mt-4 text-lg text-on-surface-variant">
            {c.description}
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getVisibleTestimonials().map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-surface border border-outline-variant/50"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-secondary text-secondary"
                    />
                  ))}
                </div>
                <p className="text-on-surface-variant leading-relaxed mb-6">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={prev}
              className="p-2 rounded-full bg-surface border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all"
            >
              <ChevronLeft size={20} className="text-on-surface-variant" />
            </button>
            {t.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-on-surface-variant/30 hover:bg-on-surface-variant/50"
                }`}
              />
            ))}
            <button
              onClick={next}
              className="p-2 rounded-full bg-surface border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all"
            >
              <ChevronRight size={20} className="text-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}