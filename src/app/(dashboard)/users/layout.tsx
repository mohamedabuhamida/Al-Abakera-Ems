import { requireUserAccess } from "@/core/auth/server";

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUserAccess(["admin"]);
  return children;
}
