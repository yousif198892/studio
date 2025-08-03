
"use client";

import { redirect } from "next/navigation";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { getUserById, mockUsers, User } from "@/lib/data";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ClientOnly } from "@/components/client-only";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userId = searchParams?.get('userId') as string || mockUsers[mockUsers.length - 1]?.id || "sup1";
    const foundUser = getUserById(userId);
    if (foundUser) {
      setUser(foundUser);
    } else {
      // In a real app with proper auth, you might redirect to /login
      // For this demo, we'll handle it client-side.
      redirect("/login");
    }
  }, [searchParams]);

  if (!user) {
    return null; // Or return a loading spinner while user is being determined
  }
  
  return (
    <ClientOnly>
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
    </ClientOnly>
  );
}
