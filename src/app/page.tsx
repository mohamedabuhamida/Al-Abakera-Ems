import { redirect } from "next/navigation";
import { getCurrentUserAccess } from "@/core/auth/server";

export default async function RootPage() {
  const access = await getCurrentUserAccess();
  redirect(access ? "/dashboard" : "/login");
}
