import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { getUserById, mockUsers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Dashboard | LinguaLeap",
  description: "Your personal learning dashboard.",
};

// In a real app, this would come from a session
// For now, we'll just use the last registered user as the "logged in" user.
const MOCK_USER_ID = mockUsers[mockUsers.length - 1]?.id || "sup1";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, you'd get the user from a session
  const user = getUserById(MOCK_USER_ID);
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
