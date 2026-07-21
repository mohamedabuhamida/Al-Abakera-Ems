"use server";

import { authRoles, normalizeRole, roleLabel, type AuthRole } from "@/core/auth/roles";
import { requireUserAccess } from "@/core/auth/server";
import { createAdminClient } from "@/core/supabase/admin";
import { randomBytes } from "node:crypto";

type CreateUserState =
  | {
      error?: string;
      credentials?: {
        fullName: string;
        role: AuthRole;
        roleLabel: string;
        username: string;
        loginEmail: string;
        password: string;
      };
    }
  | undefined;

function randomToken(length = 8) {
  return randomBytes(length)
    .toString("base64url")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length);
}

function randomPassword() {
  return `${randomToken(6)}-${randomToken(6)}-${randomToken(4)}`;
}

function usernamePrefix(role: AuthRole) {
  const prefixes: Record<AuthRole, string> = {
    admin: "admin",
    teacher: "teacher",
    student: "student",
    parent: "parent",
  };

  return prefixes[role];
}

function createUsername(role: AuthRole) {
  return `${usernamePrefix(role)}-${randomToken(6).toLowerCase()}`;
}

export async function createManagedUser(
  _state: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  await requireUserAccess(["admin"]);

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const role = normalizeRole(formData.get("role"));

  if (!fullName) {
    return { error: "Full name is required." };
  }

  if (!authRoles.includes(role)) {
    return { error: "Invalid role." };
  }

  const username = createUsername(role);
  const loginEmail = `${username}@alabakera.local`;
  const password = randomPassword();
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: loginEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone,
      role,
      username,
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Unable to create user." };
  }

  const { error: profileError } = await supabaseAdmin.rpc(
    "complete_admin_created_user",
    {
      p_user_id: data.user.id,
      p_full_name: fullName,
      p_email: loginEmail,
      p_phone: phone,
      p_role: role,
    }
  );

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    return { error: profileError.message };
  }

  return {
    credentials: {
      fullName,
      role,
      roleLabel: roleLabel(role),
      username,
      loginEmail,
      password,
    },
  };
}
