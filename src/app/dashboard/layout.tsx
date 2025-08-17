
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebarWrapper } from "@/components/dashboard-sidebar-wrapper";
import { DashboardHeader } from "@/components/dashboard-header";

// This line is crucial. It tells Next.js not to prerender any pages
// in the /dashboard route at build time. These pages are dynamic and
// depend on the logged-in user, which is only known at request time.
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <SidebarProvider>
        <div className="flex min-h-screen">
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
