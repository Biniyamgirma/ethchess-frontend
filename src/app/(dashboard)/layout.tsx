import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="min-h-svh">
        <Topbar />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          {children}
        </main>
        <footer className="flex flex-col gap-1 border-t px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>EthChess Admin</span>
          <span className="font-heading font-semibold tracking-[0.12em]">
            PLAY. ENJOY. REPEAT.
          </span>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
