import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

export const metadata: Metadata = {
  title: "Dashboard | LinguaLeap",
  description: "Your personal learning dashboard.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, you'd get the user from a session
  const user = { id: "user1", role: "student" }; // Mock user
  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar userRole={user.role as "student" | "supervisor"} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
