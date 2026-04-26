"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Spinner } from "@/components/ui/spinner";
import { ShieldOff } from "lucide-react";

// =====================================================
// FINANCIAL MODULE LAYOUT
// Protege todas as páginas sob /financeiro/*
// Apenas usuários com acesso ao módulo "financeiro" podem entrar
// =====================================================
export default function FinanceiroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated, canAccess } = useAuth();
  const router = useRouter();

  const hasAccess = canAccess("financeiro");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-6 text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!hasAccess) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          <div className="p-4 rounded-full bg-destructive/10">
            <ShieldOff className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Acesso Negado</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Você não tem permissão para acessar o módulo Financeiro.
              Entre em contato com o administrador do sistema.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-primary hover:underline"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
