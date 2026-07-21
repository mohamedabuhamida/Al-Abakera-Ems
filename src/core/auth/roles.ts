export const authRoles = ["admin", "teacher", "student", "parent"] as const;

export type AuthRole = (typeof authRoles)[number];

export type UserAccess = {
  userId: string;
  fullName: string | null;
  email: string | null;
  role: AuthRole;
  centerId: string | null;
  isActive: boolean;
};

export function isAuthRole(value: string): value is AuthRole {
  return authRoles.includes(value as AuthRole);
}

export function normalizeRole(value: FormDataEntryValue | string | null): AuthRole {
  const role = String(value ?? "student");
  return isAuthRole(role) ? role : "student";
}

export function roleLabel(role: AuthRole) {
  const labels: Record<AuthRole, string> = {
    admin: "Admin",
    teacher: "Teacher",
    student: "Student",
    parent: "Parent",
  };

  return labels[role];
}
