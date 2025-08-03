
"use client";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { getUserById, mockUsers } from "@/lib/data";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// This component ensures that its children are only rendered on the client side.
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  // In a real app, you'd get the user from a session
  // For now, we'll get it from search params for demo purposes
  const userId = searchParams?.get('userId') as string || mockUsers[mockUsers.length - 1]?.id || "sup1";
  
  const user = getUserById(userId);

  // Note: In a real app with server-side auth, this check might be different.
  // Since we are relying on client-side params for this demo, we handle missing user on the client.
  if (!user) {
    // Can't redirect from server component if user depends on client-side searchParams.
    // A client-side redirect or a "not found" message is more appropriate here.
    if (typeof window !== 'undefined') {
       redirect("/login");
    }
    return null; // Or return a loading spinner
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar user={user} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <ClientOnly>{children}</ClientOnly>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
