import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { getUserById, mockUsers } from "@/lib/data";

export const metadata: Metadata = {
  title: "لوحة التحكم | LinguaLeap",
  description: "لوحة التحكم التعليمية الشخصية الخاصة بك.",
};

export default async function DashboardLayout({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const userId = searchParams?.userId as string || mockUsers[mockUsers.length - 1]?.id || "sup1";
  
  // In a real app, you'd get the user from a session
  const user = getUserById(userId);
  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar user={user} />
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
