// app/components/landing/Footer.tsx

"use client";

import Link from "next/link";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
} from "react-icons/fa6";

import {
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";

interface FooterProps {
  isArabic: boolean;
}

const content = {
  ar: {
    description:
      "نظام إدارة تعليمي متكامل للمدارس والمراكز التعليمية في الشرق الأوسط.",
    quickLinks: "روابط سريعة",
    features: "المميزات",
    support: "الدعم",
    legal: "قانوني",
    contact: "اتصل بنا",
    rights: "جميع الحقوق محفوظة",
    madeWith: "صنع بـ",
    by: "بواسطة فريق العباقرة",
  },
  en: {
    description:
      "A comprehensive education management system for schools and educational centers in the Middle East.",
    quickLinks: "Quick Links",
    features: "Features",
    support: "Support",
    legal: "Legal",
    contact: "Contact Us",
    rights: "All rights reserved",
    madeWith: "Made with",
    by: "by Al Abakera Team",
  },
};

const quickLinks = {
  ar: [
    { label: "الرئيسية", href: "/" },
    { label: "المميزات", href: "#features" },
    { label: "الأسعار", href: "#pricing" },
    { label: "المدونة", href: "/blog" },
    { label: "اتصل بنا", href: "/contact" },
  ],
  en: [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ],
};

const supportLinks = {
  ar: [
    { label: "مركز المساعدة", href: "/help" },
    { label: "الأسئلة الشائعة", href: "/faq" },
    { label: "الدعم الفني", href: "/support" },
    { label: "الحالة", href: "/status" },
  ],
  en: [
    { label: "Help Center", href: "/help" },
    { label: "FAQ", href: "/faq" },
    { label: "Technical Support", href: "/support" },
    { label: "Status", href: "/status" },
  ],
};

const legalLinks = {
  ar: [
    { label: "سياسة الخصوصية", href: "/privacy" },
    { label: "شروط الخدمة", href: "/terms" },
    { label: "سياسة ملفات التعريف", href: "/cookies" },
  ],
  en: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { icon: FaFacebook, href: "#" },
  { icon: FaTwitter, href: "#" },
  { icon: FaInstagram, href: "#" },
  { icon: FaYoutube, href: "#" },
  { icon: FaLinkedin, href: "#" },
];

export function Footer({ isArabic }: FooterProps) {
  const c = content[isArabic ? "ar" : "en"];
  const ql = quickLinks[isArabic ? "ar" : "en"];
  const sl = supportLinks[isArabic ? "ar" : "en"];
  const ll = legalLinks[isArabic ? "ar" : "en"];

  return (
    <footer className="bg-surface-container border-t border-outline-variant">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-bold text-primary">
              {isArabic ? "العباقرة" : "Al Abakera"}
            </Link>
            <p className="mt-4 text-sm text-on-surface-variant max-w-sm leading-relaxed">
              {c.description}
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="p-2 rounded-full bg-surface border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-on-surface mb-4">
              {c.quickLinks}
            </h4>
            <ul className="space-y-2">
              {ql.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-on-surface mb-4">{c.support}</h4>
            <ul className="space-y-2">
              {sl.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="font-semibold text-on-surface mb-4">{c.legal}</h4>
            <ul className="space-y-2">
              {ll.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="font-semibold text-on-surface mt-6 mb-4">
              {c.contact}
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Mail size={16} className="text-primary shrink-0" />
                info@alabakera.com
              </li>
              <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Phone size={16} className="text-primary shrink-0" />
                +20 100 000 0000
              </li>
              <li className="flex items-center gap-2 text-sm text-on-surface-variant">
                <MapPin size={16} className="text-primary shrink-0" />
                {isArabic ? "القاهرة، مصر" : "Cairo, Egypt"}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-on-surface-variant">
            © {new Date().getFullYear()} Al Abakera. {c.rights}.
          </p>
          <p className="text-sm text-on-surface-variant flex items-center gap-1">
            {c.madeWith}
            <Heart size={14} className="text-red-500 fill-red-500" />
            {c.by}
          </p>
        </div>
      </div>
    </footer>
  );
}