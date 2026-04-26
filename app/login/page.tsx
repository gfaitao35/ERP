"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import type { UserRole } from "@/types/erp";

// Redireciona cada role para a página inicial mais relevante
const ROLE_HOME: Partial<Record<UserRole, string>> = {
  MASTER: "/dashboard",
  ADMINISTRATIVO: "/dashboard",
  VENDAS: "/vendas",
  ESTOQUE: "/estoque",
  PRODUCAO: "/dashboard",
  RH: "/dashboard",
  FINANCEIRO: "/financeiro",
  COMPRAS: "/compras",
  TI: "/ti",
  MARKETING: "/dashboard",
};

// =====================================================
// LOGIN FORM COMPONENT
// =====================================================
interface StoredUser {
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

interface StoredTenant {
  id: string;
  name: string;
}

function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [availableUsers, setAvailableUsers] = useState<Array<StoredUser & { tenantName: string }>>([]);

  // Load available users from localStorage
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("erp_users") ?? "[]") as StoredUser[];
    const tenants = JSON.parse(localStorage.getItem("erp_tenants") ?? "[]") as StoredTenant[];
    
    const usersWithTenant = users.slice(0, 6).map(u => ({
      ...u,
      tenantName: tenants.find(t => t.id === u.tenantId)?.name ?? "Empresa",
    }));
    
    setAvailableUsers(usersWithTenant);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const success = await login(email, password);

    if (success) {
      // Redireciona baseado no role do usuário logado
      const session = JSON.parse(localStorage.getItem("erp_session") ?? "{}");
      const role = session?.user?.role ?? "MASTER";
      const dest = ROLE_HOME[role as UserRole] ?? "/dashboard";
      router.push(dest);
    } else {
      setError("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <Card className="relative w-full max-w-md border-border/50 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="size-8" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">ERP System</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sistema de Gestão Empresarial
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-background"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="bg-background pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4 text-muted-foreground" />
                    ) : (
                      <Eye className="size-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </Field>
            </FieldGroup>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            {availableUsers.length > 0 && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Usuários cadastrados
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground max-h-48 overflow-y-auto">
                  {availableUsers.map((u, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEmail(u.email)}
                      className="w-full flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2 hover:bg-secondary transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Users size={12} className="text-muted-foreground" />
                        <div>
                          <span className="text-foreground font-medium">{u.name}</span>
                          <span className="text-muted-foreground"> ({u.role})</span>
                        </div>
                      </div>
                      <code className="text-foreground text-xs">{u.email}</code>
                    </button>
                  ))}
                </div>

                <p className="text-center pt-2 text-xs text-muted-foreground">
                  Clique em um usuário para preencher o e-mail
                </p>
              </>
            )}

            {availableUsers.length === 0 && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300 text-center">
                  Nenhuma empresa cadastrada. Acesse <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">/saas-admin</code> para criar uma empresa primeiro.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// LOGIN PAGE
// =====================================================
export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
