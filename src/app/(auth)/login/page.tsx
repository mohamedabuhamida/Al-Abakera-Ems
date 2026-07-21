"use client";

import { GraduationCap, LogIn } from "lucide-react";
import { useState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="surface-panel w-full max-w-5xl overflow-hidden">
        <div className="grid min-h-[560px] grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-between bg-inverse-surface p-8 text-inverse-on-surface">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-default bg-primary text-on-primary">
                <GraduationCap size={28} />
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-[-0.01em]">
                Al Abakera EMS
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-inverse-on-surface/72">
                Secure access for admins, teachers, students, and parents.
              </p>
            </div>

            <div className="rounded-default border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">Admin-managed accounts</p>
              <p className="mt-2 text-sm leading-6 text-inverse-on-surface/70">
                Users receive their username and password from an administrator.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8">
            <div className="mb-8">
              <p className="label-caps">Welcome back</p>
              <h2 className="mt-2 text-[30px] font-semibold leading-9 tracking-[-0.01em] text-on-surface">
                Login to your workspace
              </h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                Use the username and password provided by your admin.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-default border border-error/30 bg-error-container px-4 py-3 text-sm font-medium text-on-error-container">
                {error}
              </div>
            )}

            <form action={handleLogin} className="space-y-4">
              <Field
                label="Username"
                name="email"
                placeholder="teacher-8k2m4p"
              />
              <Field
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
              />
              <button disabled={loading} className="btn-primary w-full">
                <LogIn size={16} />
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-on-surface-variant">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="input-field w-full"
      />
    </label>
  );
}
