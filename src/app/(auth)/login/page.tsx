"use client";
import { useState } from "react";
import { login } from "./actions";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4" dir="rtl">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-600 p-3 rounded-2xl text-white mb-4">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">سنتر العباقرة</h1>
          <p className="text-slate-500 text-sm mt-1">لوحة تحكم المدير العام</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-500 transition-all outline-none"
              placeholder="admin@abakera.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-500 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-rose-500 text-sm bg-rose-50 p-3 rounded-lg text-center">{error}</p>}

          <button 
            disabled={loading}
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 disabled:opacity-50"
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}