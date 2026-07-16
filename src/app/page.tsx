import { redirect } from "next/navigation";

export default function RootPage() {
  // In a real app, we check if user is logged in here.
  // For now, let's redirect to our dashboard.
  redirect("/dashboard");
}