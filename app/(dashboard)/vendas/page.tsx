"use client";

import Link from "next/link";
import { Plus, Users, Target, ShoppingBag, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/erp/page-header";
import { useCustomers, useOpportunities, useSalesOrders } from "@/contexts/erp-data-context";
import { cn } from "@/lib/utils";

// =====================================================
// SALES MODULE OVERVIEW
// =====================================================
export default function VendasPage() {
  const { data: customers } = useCustomers();
  const { data: opportunities } = useOpportunities();
  const { data: orders } = useSalesOrders();

  const totalClients = customers.length;
  const totalOpportunities = opportunities.length;
  const openOpportunities = opportunities.filter((o) => !["won", "lost"].includes(o.stage)).length;
  const pipelineValue = opportunities
    .filter((o) => !["won", "lost"].includes(o.stage))
    .reduce((sum, o) => sum + o.value, 0);
  const totalOrders = orders.length;
  const orderValue = orders.reduce((sum, o) => sum + o.total, 0);

  const quickStats = [
    {
      title: "Clientes Ativos",
      value: totalClients,
      icon: Users,
      href: "/vendas/clientes",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Oportunidades Abertas",
      value: openOpportunities,
      subtitle: `de ${totalOpportunities} total`,
      icon: Target,
      href: "/vendas/oportunidades",
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Pipeline de Vendas",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        notation: "compact",
      }).format(pipelineValue),
      icon: TrendingUp,
      href: "/vendas/oportunidades",
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Pedidos",
      value: totalOrders,
      subtitle: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(orderValue),
      icon: ShoppingBag,
      href: "/vendas/pedidos",
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendas"
        description="Gerencie clientes, oportunidades e pedidos de venda"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/vendas/clientes/novo">
                <Plus className="mr-2 size-4" />
                Novo Cliente
              </Link>
            </Button>
            <Button asChild>
              <Link href="/vendas/pedidos/novo">
                <Plus className="mr-2 size-4" />
                Novo Pedido
              </Link>
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-colors hover:bg-secondary/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={cn("rounded-lg p-3", stat.color)}>
                    <stat.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Clientes
            </CardTitle>
            <CardDescription>
              Cadastro e gestão de clientes (CRM)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/vendas/clientes">Ver todos</Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href="/vendas/clientes/novo">
                  <Plus className="mr-1 size-4" />
                  Adicionar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-primary" />
              Oportunidades
            </CardTitle>
            <CardDescription>
              Pipeline de vendas e funil comercial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/vendas/oportunidades">Ver pipeline</Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href="/vendas/oportunidades/nova">
                  <Plus className="mr-1 size-4" />
                  Adicionar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-primary" />
              Pedidos de Venda
            </CardTitle>
            <CardDescription>
              Orçamentos e pedidos de venda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/vendas/pedidos">Ver todos</Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href="/vendas/pedidos/novo">
                  <Plus className="mr-1 size-4" />
                  Adicionar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimas ações no módulo de vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(order.total)}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
