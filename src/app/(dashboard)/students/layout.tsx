import { requireUserAccess } from "@/core/auth/server";

export default async function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUserAccess(["admin", "teacher"]);
  return children;
}
