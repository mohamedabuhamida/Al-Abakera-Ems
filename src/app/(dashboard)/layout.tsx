import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { requireUserAccess } from "@/core/auth/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await requireUserAccess();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role={access.role} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <Navbar user={access} />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
