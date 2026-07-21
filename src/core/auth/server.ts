import "server-only";

import { createClient } from "@/core/supabase/server";
import { type AuthRole, isAuthRole, type UserAccess } from "./roles";
import { redirect } from "next/navigation";
import { cache } from "react";

type AccessPayload = {
  userId?: string;
  fullName?: string | null;
  email?: string | null;
  role?: string | null;
  centerId?: string | null;
  isActive?: boolean;
};

function mapAccess(payload: AccessPayload | null): UserAccess | null {
  if (!payload?.userId || !payload.role || !isAuthRole(payload.role)) {
    return null;
  }

  return {
    userId: payload.userId,
    fullName: payload.fullName ?? null,
    email: payload.email ?? null,
    role: payload.role,
    centerId: payload.centerId ?? null,
    isActive: payload.isActive !== false,
  };
}

export const getCurrentUserAccess = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase.rpc("get_current_user_access");
  if (error) return null;

  const access = mapAccess(data as AccessPayload);
  if (!access?.isActive) return null;

  return access;
});

export async function requireUserAccess(allowedRoles?: AuthRole[]) {
  const access = await getCurrentUserAccess();

  if (!access) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(access.role)) {
    redirect("/dashboard");
  }

  return access;
}

export async function requireApiAccess(allowedRoles?: AuthRole[]) {
  const access = await getCurrentUserAccess();

  if (!access) {
    return {
      access: null,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (allowedRoles && !allowedRoles.includes(access.role)) {
    return {
      access,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { access, response: null };
}
