"use client";

import { useDashboard, useERPData } from "@/contexts/erp-data-context";
import { useAuth } from "@/contexts/auth-context";
import { KPICard } from "@/components/erp/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Inbox,
} from "lucide-react";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-32" /></CardContent></Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}><CardContent className="p-4"><Skeleton className="h-40 w-full" /></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-2">
      <Inbox className="h-8 w-8 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { isLoading, totalCustomers, totalProducts, totalOrders, totalRevenue, pendingAR, pendingAP } = useDashboard();
  const { accountsReceivable, accountsPayable, salesOrders } = useERPData();

  if (isLoading) return <DashboardSkeleton />;

  const currentDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  }).format(new Date());

  const recentOrders = [...salesOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const overdueAR = accountsReceivable.filter(
    (ar) => ar.status === "overdue" || (ar.status === "pending" && new Date(ar.dueDate) < new Date())
  );
  const overdueAP = accountsPayable.filter(
    (ap) => ap.status === "overdue" || (ap.status === "pending" && new Date(ap.dueDate) < new Date())
  );

  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Olá, {user?.name?.split(" ")[0] ?? "Usuário"}
        </h1>
        <p className="text-muted-foreground capitalize">{currentDate}</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard kpi={{ id: "revenue", title: "Faturamento Total", value: totalRevenue, format: "currency" }} />
        <KPICard kpi={{ id: "customers", title: "Clientes", value: totalCustomers, format: "number" }} />
        <KPICard kpi={{ id: "products", title: "Produtos", value: totalProducts, format: "number" }} />
        <KPICard kpi={{ id: "orders", title: "Pedidos", value: totalOrders, format: "number" }} />
      </div>

      {/* AR / AP alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
              Contas a Receber em Aberto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountsReceivable.filter((ar) => ar.status !== "paid" && ar.status !== "cancelled").length === 0 ? (
              <EmptyState message="Nenhuma conta a receber em aberto." />
            ) : (
              <div className="space-y-2">
                {accountsReceivable
                  .filter((ar) => ar.status !== "paid" && ar.status !== "cancelled")
                  .slice(0, 5)
                  .map((ar) => (
                    <div key={ar.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/40">
                      <div>
                        <p className="font-medium">{ar.description}</p>
                        <p className="text-xs text-muted-foreground">Venc: {new Date(ar.dueDate).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(ar.amount - ar.amountPaid)}</p>
                        <Badge variant={ar.status === "overdue" ? "destructive" : "secondary"} className="text-xs">
                          {ar.status === "overdue" ? "Vencido" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                <p className="text-xs text-muted-foreground pt-1">
                  Total em aberto: <strong>{formatCurrency(pendingAR)}</strong>
                  {overdueAR.length > 0 && <span className="text-destructive ml-2">• {overdueAR.length} vencido(s)</span>}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-destructive" />
              Contas a Pagar em Aberto
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountsPayable.filter((ap) => ap.status !== "paid" && ap.status !== "cancelled").length === 0 ? (
              <EmptyState message="Nenhuma conta a pagar em aberto." />
            ) : (
              <div className="space-y-2">
                {accountsPayable
                  .filter((ap) => ap.status !== "paid" && ap.status !== "cancelled")
                  .slice(0, 5)
                  .map((ap) => (
                    <div key={ap.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/40">
                      <div>
                        <p className="font-medium">{ap.description}</p>
                        <p className="text-xs text-muted-foreground">Venc: {new Date(ap.dueDate).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(ap.amount - ap.amountPaid)}</p>
                        <Badge variant={ap.status === "overdue" ? "destructive" : "secondary"} className="text-xs">
                          {ap.status === "overdue" ? "Vencido" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                <p className="text-xs text-muted-foreground pt-1">
                  Total em aberto: <strong>{formatCurrency(pendingAP)}</strong>
                  {overdueAP.length > 0 && <span className="text-destructive ml-2">• {overdueAP.length} vencido(s)</span>}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Pedidos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <EmptyState message="Nenhum pedido cadastrado ainda." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Pedido</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-right py-2 font-medium">Valor</th>
                    <th className="text-right py-2 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{order.orderNumber}</td>
                      <td className="py-2"><Badge variant="outline" className="text-xs">{order.status}</Badge></td>
                      <td className="py-2 text-right">{formatCurrency(order.totalAmount)}</td>
                      <td className="py-2 text-right text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}