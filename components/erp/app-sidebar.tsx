"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Wallet,
  Truck,
  Factory,
  Users,
  Megaphone,
  Headphones,
  Settings,
  ChevronDown,
  Building2,
  LogOut,
  User,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";

// =====================================================
// NAVIGATION CONFIG
// =====================================================
const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    module: "dashboard",
  },
  {
    title: "Vendas",
    icon: ShoppingCart,
    module: "vendas",
    items: [
      { title: "Visão Geral", href: "/vendas" },
      { title: "CRM / Pipeline", href: "/vendas/crm" },
      { title: "Clientes", href: "/vendas/clientes" },
      { title: "Oportunidades", href: "/vendas/oportunidades" },
      { title: "Pedidos", href: "/vendas/pedidos" },
      { title: "Comissões", href: "/vendas/comissoes" },
    ],
  },
  {
    title: "Estoque",
    icon: Package,
    module: "estoque",
    items: [
      { title: "Visão Geral", href: "/estoque" },
      { title: "Produtos", href: "/estoque/produtos" },
      { title: "Movimentações", href: "/estoque/movimentacoes" },
      { title: "Inventário", href: "/estoque/inventario" },
      { title: "Frota", href: "/estoque/frota" },
    ],
  },
  {
    title: "Financeiro",
    icon: Wallet,
    module: "financeiro",
    items: [
      { title: "Visão Geral", href: "/financeiro" },
      { title: "Contas a Receber", href: "/financeiro/receber" },
      { title: "Contas a Pagar", href: "/financeiro/pagar" },
      { title: "Fluxo de Caixa", href: "/financeiro/fluxo-caixa" },
      { title: "Contas Bancárias", href: "/financeiro/bancos" },
    ],
  },
  {
    title: "Compras",
    icon: Truck,
    module: "compras",
    items: [
      { title: "Visão Geral", href: "/compras" },
      { title: "Fornecedores", href: "/compras/fornecedores" },
      { title: "Cotações", href: "/compras/cotacoes" },
      { title: "Pedidos", href: "/compras/pedidos" },
    ],
  },
  {
    title: "Produção",
    icon: Factory,
    module: "producao",
    items: [
      { title: "Visão Geral", href: "/producao" },
      { title: "Ordens de Produção", href: "/producao/ordens" },
      { title: "Estrutura de Produtos", href: "/producao/bom" },
      { title: "Máquinas", href: "/producao/maquinas" },
    ],
  },
  {
    title: "RH",
    icon: Users,
    module: "rh",
    items: [
      { title: "Visão Geral", href: "/rh" },
      { title: "Colaboradores", href: "/rh/colaboradores" },
      { title: "Ponto", href: "/rh/ponto" },
      { title: "Folha de Pagamento", href: "/rh/folha" },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    module: "marketing",
    items: [
      { title: "Visão Geral", href: "/marketing" },
      { title: "Campanhas", href: "/marketing/campanhas" },
      { title: "Leads", href: "/marketing/leads" },
    ],
  },
  {
    title: "TI",
    icon: Headphones,
    module: "ti",
    href: "/ti",
  },
];

const settingsItems = [
  {
    title: "Configurações",
    icon: Settings,
    href: "/configuracoes",
    module: "configuracoes",
  },
];

// =====================================================
// SIDEBAR COMPONENT
// =====================================================
export function AppSidebar() {
  const pathname = usePathname();
  const { user, tenant, logout, canAccess } = useAuth();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const isGroupActive = (items?: { href: string }[]) => {
    if (!items) return false;
    return items.some((item) => pathname.startsWith(item.href));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Building2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {tenant?.name ?? "ERP System"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {tenant?.plan === "enterprise"
                        ? "Enterprise"
                        : tenant?.plan === "professional"
                        ? "Professional"
                        : "Starter"}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  Empresas
                </DropdownMenuLabel>
                <DropdownMenuItem>
                  <Building2 className="mr-2 size-4" />
                  {tenant?.name ?? "Empresa Atual"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Gerenciar Empresas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                // Verifica acesso ao módulo
                if (!canAccess(item.module)) return null;

                // Item simples (sem submenu)
                if (item.href) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // Item com submenu (collapsible)
                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isGroupActive(item.items)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isGroupActive(item.items)}
                        >
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.href}
                              >
                                <Link href={subItem.href}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Group */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => {
                if (!canAccess(item.module)) return null;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - User Menu */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name ?? "Usuário"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.role ?? "---"}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  Minha Conta
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/perfil">
                    <User className="mr-2 size-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/configuracoes">
                    <Settings className="mr-2 size-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 size-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
