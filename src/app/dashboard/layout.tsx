
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebarWrapper } from "@/components/dashboard-sidebar-wrapper";
import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <SidebarProvider>
        <div className="flex min-h-screen">
          {/* The Sidebar is now wrapped to handle its own client-side data fetching */}
          <DashboardSidebarWrapper />
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
