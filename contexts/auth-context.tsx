"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { User, Tenant, AuthState, UserRole } from "@/types/erp";

// =====================================================
// ROLE PERMISSIONS CONFIG
// =====================================================
const ROLE_PERMISSIONS: Record<UserRole, { modules: string[]; dashboardView: string }> = {
  MASTER: { modules: ["all"], dashboardView: "executive" },
  ADMINISTRATIVO: { modules: ["configuracoes", "usuarios", "auditoria"], dashboardView: "general" },
  VENDAS: { modules: ["vendas", "clientes", "oportunidades", "pedidos"], dashboardView: "sales_funnel" },
  ESTOQUE: { modules: ["estoque", "produtos", "movimentacoes", "inventario"], dashboardView: "stock_levels" },
  PRODUCAO: { modules: ["producao", "ordens", "pcp", "maquinas"], dashboardView: "production" },
  RH: { modules: ["rh", "colaboradores", "folha", "ponto", "recrutamento"], dashboardView: "people" },
  FINANCEIRO: { modules: ["financeiro", "contas_pagar", "contas_receber", "fluxo_caixa", "contabilidade"], dashboardView: "financial" },
  COMPRAS: { modules: ["compras", "fornecedores", "cotacoes", "pedidos_compra"], dashboardView: "purchasing" },
  TI: { modules: ["ti", "chamados", "ativos", "suporte"], dashboardView: "tickets" },
  MARKETING: { modules: ["marketing", "campanhas", "leads", "integracoes_ads"], dashboardView: "marketing_roi" },
};

// =====================================================
// STORAGE HELPERS
// =====================================================
const SESSION_KEY = "erp_session";
const USERS_KEY = "erp_users";
const TENANTS_KEY = "erp_tenants";

function ls_get(key: string) {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(key) ?? "null"); } catch { return null; }
}
function ls_set(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}
function ls_del(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

// =====================================================
// AUTH CONTEXT
// =====================================================
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (module: string) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const session = ls_get(SESSION_KEY) as { user: User; tenant: Tenant } | null;
    if (session?.user && session?.tenant) {
      setState({ user: session.user, tenant: session.tenant, isAuthenticated: true, isLoading: false });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const users: any[] = ls_get(USERS_KEY) ?? [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenants: any[] = ls_get(TENANTS_KEY) ?? [];

    // Buscar usuário - verificando ambos formatos de propriedade (isActive ou is_active)
    const user = users.find((u) => {
      const isActiveUser = u.isActive ?? u.is_active ?? true;
      return u.email === email && u.password === password && isActiveUser;
    });
    
    if (!user) { 
      setState((prev) => ({ ...prev, isLoading: false })); 
      return false; 
    }

    // Buscar tenant - verificando ambos formatos de propriedade
    const tenant = tenants.find((t) => {
      const isActiveTenant = t.isActive ?? t.is_active ?? true;
      return t.id === user.tenantId && isActiveTenant;
    });
    
    if (!tenant) { 
      setState((prev) => ({ ...prev, isLoading: false })); 
      return false; 
    }

    // Normalizar usuário para o formato esperado
    const normalizedUser: User = {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role as UserRole,
      permissions: user.permissions ?? [],
      department: user.department,
      isActive: user.isActive ?? user.is_active ?? true,
      lastLogin: user.lastLogin ?? user.last_login,
      createdAt: user.createdAt ?? user.created_at ?? new Date(),
      updatedAt: user.updatedAt ?? user.updated_at ?? new Date(),
    };

    // Normalizar tenant para o formato esperado
    const normalizedTenant: Tenant = {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      logo: tenant.logo,
      plan: tenant.plan,
      isActive: tenant.isActive ?? tenant.is_active ?? true,
      createdAt: tenant.createdAt ?? tenant.created_at ?? new Date(),
      updatedAt: tenant.updatedAt ?? tenant.updated_at ?? new Date(),
      settings: tenant.settings ?? {
        currency: tenant.currency ?? "BRL",
        timezone: tenant.timezone ?? "America/Sao_Paulo",
        dateFormat: tenant.dateFormat ?? "DD/MM/YYYY",
        fiscalYearStart: tenant.fiscalYearStart ?? 1,
        modules: tenant.modules ?? ["all"],
        integrations: [],
      },
    };

    ls_set(SESSION_KEY, { user: normalizedUser, tenant: normalizedTenant });
    setState({ user: normalizedUser, tenant: normalizedTenant, isAuthenticated: true, isLoading: false });
    return true;
  }, []);

  const logout = useCallback(() => {
    ls_del(SESSION_KEY);
    setState({ user: null, tenant: null, isAuthenticated: false, isLoading: false });
  }, []);

  const hasPermission = useCallback((module: string): boolean => {
    if (!state.user) return false;
    if (state.user.role === "MASTER") return true;
    if (state.user.permissions.includes("all")) return true;
    const roleConfig = ROLE_PERMISSIONS[state.user.role];
    return roleConfig.modules.includes("all") || roleConfig.modules.includes(module);
  }, [state.user]);

  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  }, [state.user]);

  const canAccess = useCallback((module: string): boolean => {
    if (!state.user || !state.tenant) return false;
    
    // Verificar módulos do tenant
    const tenantModules = state.tenant.settings?.modules ?? [];
    
    // Configurações sempre acessíveis para MASTER e TI
    if (module === "configuracoes" && (state.user.role === "MASTER" || state.user.role === "TI")) {
      return true;
    }
    
    // Dashboard sempre acessível se estiver nos módulos ou para MASTER
    if (module === "dashboard") {
      if (state.user.role === "MASTER") return true;
      return tenantModules.includes("all") || tenantModules.includes("dashboard");
    }
    
    // T.I. sempre tem acesso ao módulo ti
    if (module === "ti" && state.user.role === "TI") {
      return true;
    }
    
    // Se o tenant não tem o módulo contratado, não pode acessar (exceto para MASTER)
    if (state.user.role !== "MASTER") {
      if (!tenantModules.includes("all") && !tenantModules.includes(module)) {
        return false;
      }
    }
    
    return hasPermission(module);
  }, [state.user, state.tenant, hasPermission]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasPermission, hasRole, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export function useModuleAccess(module: string) {
  const { canAccess, isLoading } = useAuth();
  return { hasAccess: canAccess(module), isLoading };
}

export function useTenantConfig() {
  const { tenant } = useAuth();
  return tenant?.settings ?? null;
}
