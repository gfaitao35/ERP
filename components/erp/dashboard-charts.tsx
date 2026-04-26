"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CashFlowEntry, SalesOrder, StockLevel, FinancialTransaction, Product } from "@/types/erp";

// =====================================================
// CHART COLORS
// =====================================================
const COLORS = {
  primary: "var(--chart-1)",
  secondary: "var(--chart-2)",
  tertiary: "var(--chart-3)",
  quaternary: "var(--chart-4)",
  quinary: "var(--chart-5)",
};

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

// =====================================================
// CASH FLOW CHART
// =====================================================
interface CashFlowChartProps {
  data: CashFlowEntry[];
  className?: string;
}

export function CashFlowChart({ data, className }: CashFlowChartProps) {
  const chartData = data.map((entry) => ({
    date: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(entry.date),
    entrada: entry.type === "income" ? entry.amount : 0,
    saida: entry.type === "expense" ? entry.amount : 0,
    saldo: entry.balance,
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
        <CardDescription>Projeção dos próximos 7 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("pt-BR", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(value)
                }
              />
              <Area
                type="monotone"
                dataKey="saldo"
                stroke={COLORS.primary}
                fill="url(#colorSaldo)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// SALES FUNNEL CHART
// =====================================================
interface SalesFunnelChartProps {
  data: { stage: string; count: number; value: number }[];
  className?: string;
}

export function SalesFunnelChart({ data, className }: SalesFunnelChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Funil de Vendas</CardTitle>
        <CardDescription>Pipeline de oportunidades</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value: number, name: string) => [
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(value),
                  name,
                ]}
              />
              <Funnel
                dataKey="value"
                data={chartData}
                isAnimationActive
              >
                <LabelList
                  position="right"
                  fill="hsl(var(--foreground))"
                  stroke="none"
                  dataKey="stage"
                  fontSize={12}
                />
                <LabelList
                  position="center"
                  fill="hsl(var(--foreground))"
                  stroke="none"
                  dataKey="count"
                  fontSize={14}
                  fontWeight="bold"
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// TOP PRODUCTS CHART
// =====================================================
interface TopProductsChartProps {
  data: { product: Product; quantity: number; revenue: number }[];
  className?: string;
}

export function TopProductsChart({ data, className }: TopProductsChartProps) {
  const chartData = data.map((item) => ({
    name: item.product.name.length > 20 
      ? item.product.name.substring(0, 20) + "..." 
      : item.product.name,
    quantidade: item.quantity,
    receita: item.revenue,
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top 5 Produtos</CardTitle>
        <CardDescription>Mais vendidos no período</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("pt-BR", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(value)
                }
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(value)
                }
              />
              <Bar dataKey="receita" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// LEADS BY SOURCE CHART
// =====================================================
interface LeadsBySourceChartProps {
  data: { source: string; count: number }[];
  className?: string;
}

export function LeadsBySourceChart({ data, className }: LeadsBySourceChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: PIE_COLORS[index % PIE_COLORS.length],
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Origem dos Leads</CardTitle>
        <CardDescription>Total: {total} leads</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                nameKey="source"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {chartData.map((item, index) => (
            <div key={item.source} className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs text-muted-foreground">
                {item.source} ({item.count})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// RECENT ORDERS TABLE
// =====================================================
interface RecentOrdersProps {
  orders: SalesOrder[];
  className?: string;
}

const statusLabels: Record<SalesOrder["status"], string> = {
  draft: "Rascunho",
  pending: "Pendente",
  approved: "Aprovado",
  processing: "Em Processo",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusColors: Record<SalesOrder["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/20 text-warning",
  approved: "bg-info/20 text-info",
  processing: "bg-primary/20 text-primary",
  shipped: "bg-accent/20 text-accent-foreground",
  delivered: "bg-success/20 text-success",
  cancelled: "bg-destructive/20 text-destructive",
};

export function RecentOrders({ orders, className }: RecentOrdersProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Pedidos Recentes</CardTitle>
        <CardDescription>Últimos pedidos de venda</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-secondary/50"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">{order.orderNumber}</span>
                <span className="text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat("pt-BR").format(order.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Badge className={cn("font-normal", statusColors[order.status])}>
                  {statusLabels[order.status]}
                </Badge>
                <span className="font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(order.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================
// CRITICAL STOCK ALERT
// =====================================================
interface CriticalStockProps {
  items: StockLevel[];
  className?: string;
}

export function CriticalStock({ items, className }: CriticalStockProps) {
  return (
    <Card className={cn("border-destructive/50", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-destructive animate-pulse" />
          <CardTitle className="text-destructive">Estoque Crítico</CardTitle>
        </div>
        <CardDescription>Produtos abaixo do estoque mínimo</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum produto em estoque crítico
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-destructive/5 p-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{item.product?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    SKU: {item.product?.sku}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-destructive">
                    {item.quantity}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    / {item.product?.minStock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// PENDING PAYMENTS
// =====================================================
interface PendingPaymentsProps {
  transactions: FinancialTransaction[];
  className?: string;
}

export function PendingPayments({ transactions, className }: PendingPaymentsProps) {
  const receivables = transactions.filter((t) => t.type === "receivable");
  const payables = transactions.filter((t) => t.type === "payable");

  const totalReceivables = receivables.reduce((sum, t) => sum + t.amount - t.paidAmount, 0);
  const totalPayables = payables.reduce((sum, t) => sum + t.amount - t.paidAmount, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Títulos Pendentes</CardTitle>
        <CardDescription>Próximos vencimentos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg bg-success/10 p-3">
            <span className="text-xs text-muted-foreground">A Receber</span>
            <p className="text-xl font-bold text-success">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalReceivables)}
            </p>
          </div>
          <div className="rounded-lg bg-destructive/10 p-3">
            <span className="text-xs text-muted-foreground">A Pagar</span>
            <p className="text-xl font-bold text-destructive">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalPayables)}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {transactions.slice(0, 4).map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-md border border-border p-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "size-2 rounded-full",
                    t.type === "receivable" ? "bg-success" : "bg-destructive"
                  )}
                />
                <span className="text-sm truncate max-w-[150px]">{t.description}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(t.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("pt-BR").format(t.dueDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
