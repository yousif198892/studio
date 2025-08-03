
"use client";

import { redirect, useSearchParams } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { getUserById, type User } from "@/lib/data";
import { useEffect, useState } from "react";
import { ClientOnly } from "@/components/client-only";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would come from a session or a more robust user management system.
    const userId = searchParams?.get('userId') || "sup1";
    const foundUser = getUserById(userId);
    
    if (foundUser) {
      setUser(foundUser);
    } else {
       // In a real app with proper auth, you might redirect to /login
       // For this demo, we'll handle it client-side.
       console.error("User not found, redirecting to login.")
       redirect("/login");
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return null; // Or a loading spinner
  }
  
  if (!user) {
    // This state can be hit briefly before redirect triggers.
    return null;
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
