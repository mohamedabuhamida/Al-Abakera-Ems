"use server";

import { type AuthRole } from "@/core/auth/roles";
import { createClient } from "@/core/supabase/server";
import { redirect } from "next/navigation";

type AccessPayload = {
  role?: AuthRole;
  isActive?: boolean;
};

function normalizeLoginIdentifier(value: FormDataEntryValue | null) {
  const identifier = String(value ?? "")
    .trim()
    .toLowerCase();

  if (!identifier || identifier.includes("@")) {
    return identifier;
  }

  return `${identifier}@alabakera.local`;
}

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = normalizeLoginIdentifier(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Username and password are required." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid username or password." };
  }

  const { data: access, error: accessError } = await supabase.rpc(
    "get_current_user_access",
  );

  if (accessError) {
    console.error(accessError);

    await supabase.auth.signOut();

    return {
      error: accessError.message,
    };
  }

  const payload = access as AccessPayload;

  if (!payload?.role || payload.isActive === false) {
    await supabase.auth.signOut();
    return { error: "This account does not have an active role." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
