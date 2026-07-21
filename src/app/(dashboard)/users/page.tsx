"use client";

import { createManagedUser } from "./actions";
import { ShieldCheck, UserPlus } from "lucide-react";
import { useActionState } from "react";

const roles = [
  { value: "admin", label: "Admin", description: "Full system access" },
  { value: "teacher", label: "Teacher", description: "Classes and student records" },
  { value: "student", label: "Student", description: "Student portal access" },
  { value: "parent", label: "Parent", description: "Children and billing access" },
];

export default function UsersPage() {
  const [state, action, pending] = useActionState(createManagedUser, undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-outline-variant pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label-caps">Access Control</p>
          <h1 className="mt-2 text-[30px] font-semibold leading-9 tracking-[-0.01em] text-on-surface">
            Users
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
            Create accounts for admins, teachers, students, and parents. The system generates credentials automatically.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <form action={action} className="surface-card space-y-5 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-default bg-primary-fixed text-on-primary-fixed-variant">
              <UserPlus size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-on-surface">
                Add user
              </h2>
              <p className="text-sm text-on-surface-variant">
                Enter the person details and choose their role.
              </p>
            </div>
          </div>

          {state?.error && (
            <div className="rounded-default border border-error/30 bg-error-container px-4 py-3 text-sm font-medium text-on-error-container">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Full name" name="fullName" placeholder="Sarah Ahmed" />
            <Field label="Phone" name="phone" placeholder="+20 100 000 0000" required={false} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface-variant">
              Role
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className="cursor-pointer rounded-default border border-outline-variant bg-surface-container-low p-4 transition has-[:checked]:border-primary has-[:checked]:bg-primary-fixed"
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    defaultChecked={role.value === "student"}
                    className="sr-only"
                  />
                  <span className="block text-sm font-semibold text-on-surface">
                    {role.label}
                  </span>
                  <span className="mt-1 block text-xs text-on-surface-variant">
                    {role.description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button disabled={pending} className="btn-primary">
            <UserPlus size={16} />
            {pending ? "Creating user..." : "Create user"}
          </button>
        </form>

        <aside className="surface-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-default bg-secondary-fixed text-on-secondary-fixed-variant">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-on-surface">
                Generated credentials
              </h2>
              <p className="text-sm text-on-surface-variant">
                Give these details to the user after creation.
              </p>
            </div>
          </div>

          {state?.credentials ? (
            <div className="mt-6 space-y-3">
              <Credential label="Name" value={state.credentials.fullName} />
              <Credential label="Role" value={state.credentials.roleLabel} />
              <Credential label="Username" value={state.credentials.username} />
              <Credential label="Login email" value={state.credentials.loginEmail} />
              <Credential label="Password" value={state.credentials.password} secret />
            </div>
          ) : (
            <div className="mt-6 rounded-default border border-dashed border-outline bg-surface-container-low p-6 text-sm leading-6 text-on-surface-variant">
              Credentials will appear here after the admin creates a user.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-on-surface-variant">
        {label}
      </span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="input-field w-full"
      />
    </label>
  );
}

function Credential({
  label,
  value,
  secret,
}: {
  label: string;
  value: string;
  secret?: boolean;
}) {
  return (
    <div className="rounded-default border border-outline-variant bg-surface-container-low p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.02em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-2 break-all font-mono text-sm font-semibold text-on-surface">
        {secret ? value : value}
      </p>
    </div>
  );
}
