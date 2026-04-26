"use client";

import Link from "next/link";
import { Plus, Package, ArrowUpDown, AlertTriangle, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/erp/page-header";
import { useProducts, useStockLevels } from "@/contexts/erp-data-context";
import { cn } from "@/lib/utils";

// =====================================================
// STOCK MODULE OVERVIEW
// =====================================================
export default function EstoquePage() {
  const { data: products } = useProducts();
  const { data: stockLevels } = useStockLevels();

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const criticalStock = stockLevels.filter(
    (sl) => sl.product && sl.quantity <= sl.product.minStock
  );
  const totalStockValue = products.reduce(
    (sum, p) => sum + p.currentStock * p.costPrice,
    0
  );

  const quickStats = [
    {
      title: "Total de Produtos",
      value: totalProducts,
      subtitle: `${activeProducts} ativos`,
      icon: Package,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Valor em Estoque",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        notation: "compact",
      }).format(totalStockValue),
      icon: BarChart3,
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Estoque Crítico",
      value: criticalStock.length,
      subtitle: "produtos",
      icon: AlertTriangle,
      color: criticalStock.length > 0 ? "bg-red-500/10 text-red-500" : "bg-slate-500/10 text-slate-500",
    },
    {
      title: "Movimentações Hoje",
      value: 12,
      subtitle: "entradas/saídas",
      icon: ArrowUpDown,
      color: "bg-purple-500/10 text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Controle de produtos, movimentações e inventário"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/estoque/movimentacoes/nova">
                <ArrowUpDown className="mr-2 size-4" />
                Nova Movimentação
              </Link>
            </Button>
            <Button asChild>
              <Link href="/estoque/produtos/novo">
                <Plus className="mr-2 size-4" />
                Novo Produto
              </Link>
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.title}>
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
        ))}
      </div>

      {/* Critical Stock Alert */}
      {criticalStock.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              <CardTitle className="text-destructive">Alerta de Estoque Crítico</CardTitle>
            </div>
            <CardDescription>
              Os seguintes produtos estão abaixo do estoque mínimo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-destructive/5 p-3"
                >
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.product?.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-destructive">
                        {item.quantity}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {item.product?.minStock} min
                      </span>
                    </div>
                    <Progress
                      value={(item.quantity / (item.product?.minStock ?? 1)) * 100}
                      className="mt-1 h-2 w-24"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5 text-primary" />
              Produtos
            </CardTitle>
            <CardDescription>Cadastro e gestão de produtos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/estoque/produtos">Ver todos</Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href="/estoque/produtos/novo">
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
              <ArrowUpDown className="size-5 text-primary" />
              Movimentações
            </CardTitle>
            <CardDescription>Entradas, saídas e transferências</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/estoque/movimentacoes">Ver todas</Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href="/estoque/movimentacoes/nova">
                  <Plus className="mr-1 size-4" />
                  Nova
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              Inventário
            </CardTitle>
            <CardDescription>Contagem e ajustes de estoque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/estoque/inventario">Ver inventário</Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href="/estoque/inventario/novo">
                  <Plus className="mr-1 size-4" />
                  Nova Contagem
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Levels Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Níveis de Estoque</CardTitle>
          <CardDescription>Visão geral dos níveis de estoque por produto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stockLevels.slice(0, 6).map((item) => {
              const percentage = item.product
                ? (item.quantity / item.product.maxStock) * 100
                : 0;
              const isCritical = item.product && item.quantity <= item.product.minStock;
              const isLow = item.product && item.quantity <= item.product.minStock * 1.5;

              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.product?.name}</span>
                      {isCritical && (
                        <Badge variant="destructive" className="text-xs">
                          Crítico
                        </Badge>
                      )}
                      {!isCritical && isLow && (
                        <Badge variant="outline" className="text-xs text-warning border-warning">
                          Baixo
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.quantity} / {item.product?.maxStock} un
                    </span>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={cn(
                      "h-2",
                      isCritical && "[&>div]:bg-destructive",
                      !isCritical && isLow && "[&>div]:bg-warning"
                    )}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
