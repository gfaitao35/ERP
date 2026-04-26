"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Moon, Sun, RefreshCw } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { useNotifications, useDashboard } from "@/contexts/erp-data-context";
import { cn } from "@/lib/utils";
import { useState } from "react";

// =====================================================
// PATH TO BREADCRUMB MAPPING
// =====================================================
const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  vendas: "Vendas",
  clientes: "Clientes",
  oportunidades: "Oportunidades",
  pedidos: "Pedidos",
  comissoes: "Comissões",
  estoque: "Estoque",
  produtos: "Produtos",
  movimentacoes: "Movimentações",
  inventario: "Inventário",
  financeiro: "Financeiro",
  receber: "Contas a Receber",
  pagar: "Contas a Pagar",
  "fluxo-caixa": "Fluxo de Caixa",
  bancos: "Contas Bancárias",
  compras: "Compras",
  fornecedores: "Fornecedores",
  cotacoes: "Cotações",
  producao: "Produção",
  ordens: "Ordens",
  bom: "Estrutura de Produtos",
  maquinas: "Máquinas",
  rh: "RH",
  colaboradores: "Colaboradores",
  ponto: "Ponto",
  folha: "Folha de Pagamento",
  marketing: "Marketing",
  campanhas: "Campanhas",
  leads: "Leads",
  ti: "TI",
  chamados: "Chamados",
  ativos: "Ativos",
  configuracoes: "Configurações",
  perfil: "Perfil",
};

// =====================================================
// HEADER COMPONENT
// =====================================================
export function AppHeader() {
  const pathname = usePathname();
  const { data: notifications, unreadCount } = useNotifications();
  const { refresh: refreshDashboard } = useDashboard();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: pathLabels[segment] ?? segment,
    href: "/" + pathSegments.slice(0, index + 1).join("/"),
    isLast: index === pathSegments.length - 1,
  }));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshDashboard();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      {/* Left: Sidebar Trigger + Breadcrumbs */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Center: Search */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar em todo o sistema..."
            className="w-full bg-secondary/50 pl-9 text-sm"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="text-xs">Ctrl</span>K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Refresh Button */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn("size-4", isRefreshing && "animate-spin")}
          />
          <span className="sr-only">Atualizar dados</span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={toggleTheme}
        >
          {isDark ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
          <span className="sr-only">Alternar tema</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 relative">
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 size-5 rounded-full p-0 text-[10px] flex items-center justify-center"
                >
                  {unreadCount}
                </Badge>
              )}
              <span className="sr-only">Notificações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notificações</span>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} não lidas
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications && notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        notification.priority === "high" || notification.priority === "urgent"
                          ? "bg-destructive"
                          : notification.priority === "normal"
                          ? "bg-warning"
                          : "bg-muted-foreground"
                      )}
                    />
                    <span className="font-medium text-sm truncate flex-1">
                      {notification.title}
                    </span>
                    {!notification.isRead && (
                      <span className="size-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 pl-4">
                    {notification.message}
                  </p>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma notificação
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-primary text-sm">
              Ver todas as notificações
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}