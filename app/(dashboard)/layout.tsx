"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/erp/app-sidebar";
import { AppHeader } from "@/components/erp/app-header";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { ERPDataProvider } from "@/contexts/erp-data-context";
import { Spinner } from "@/components/ui/spinner";

// =====================================================
// AUTH GUARD COMPONENT
// =====================================================
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// =====================================================
// DASHBOARD LAYOUT
// =====================================================
function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <ERPDataProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ERPDataProvider>
  );
}

// =====================================================
// MAIN LAYOUT EXPORT
// =====================================================
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </AuthGuard>
    </AuthProvider>
  );
}
