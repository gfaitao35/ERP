"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useERPData } from "@/contexts/erp-data-context"
import { PageHeader } from "@/components/erp/page-header"
import { KPICard } from "@/components/erp/kpi-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Package,
  Truck,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  DollarSign,
  Plus,
} from "lucide-react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function PurchasesPage() {
  const { purchaseOrders, suppliers, products } = useERPData()

  // Calculate KPIs
  const pendingOrders = purchaseOrders.filter((po) => po.status === "pending")
  const approvedOrders = purchaseOrders.filter((po) => po.status === "approved")
  const inTransitOrders = purchaseOrders.filter((po) => po.status === "sent")

  const totalPurchases = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0)
  const pendingValue = pendingOrders.reduce((sum, po) => sum + po.totalAmount, 0)
  const inTransitValue = inTransitOrders.reduce((sum, po) => sum + po.totalAmount, 0)

  // Products with low stock
  const lowStockProducts = products.filter((p) => p.currentStock <= p.minStock)

  // Recent purchase orders
  const recentOrders = [...purchaseOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Top suppliers by purchase volume (mock data)
  const topSuppliersData = [
    { name: "Fornecedor A", value: 45000 },
    { name: "Fornecedor B", value: 38000 },
    { name: "Fornecedor C", value: 32000 },
    { name: "Fornecedor D", value: 28000 },
    { name: "Fornecedor E", value: 22000 },
  ]

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      draft: { label: "Rascunho", variant: "secondary" },
      pending: { label: "Pendente", variant: "outline", className: "border-warning text-warning" },
      approved: { label: "Aprovado", variant: "default", className: "bg-success text-success-foreground" },
      sent: { label: "Enviado", variant: "default", className: "bg-info text-info-foreground" },
      partial: { label: "Parcial", variant: "secondary" },
      received: { label: "Recebido", variant: "default", className: "bg-success text-success-foreground" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    }
    const { label, variant, className } = config[status] || { label: status, variant: "secondary" }
    return (
      <Badge variant={variant} className={className}>
        {label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compras"
        description="Gestão de compras e fornecedores"
        icon={<ShoppingCart className="h-6 w-6" />}
        actions={
          <Link href="/compras/pedidos">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Pedido
            </Button>
          </Link>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total de Compras"
          value={formatCurrency(totalPurchases)}
          trend={{ value: 8.5, isPositive: true }}
          icon={<DollarSign className="h-5 w-5" />}
          variant="primary"
        />
        <KPICard
          title="Pedidos Pendentes"
          value={pendingOrders.length.toString()}
          subtitle={formatCurrency(pendingValue)}
          icon={<Clock className="h-5 w-5" />}
          variant="warning"
        />
        <KPICard
          title="Em Trânsito"
          value={inTransitOrders.length.toString()}
          subtitle={formatCurrency(inTransitValue)}
          icon={<Truck className="h-5 w-5" />}
          variant="info"
        />
        <KPICard
          title="Fornecedores Ativos"
          value={suppliers.filter((s) => s.status === "active").length.toString()}
          icon={<Users className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Quick Actions and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Pedidos Recentes</CardTitle>
            <Link href="/compras/pedidos">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => {
                  const supplier = suppliers.find((s) => s.id === order.supplierId)
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {supplier?.name || "Fornecedor"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium text-sm">{formatCurrency(order.totalAmount)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum pedido de compra encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-destructive/5"
                  >
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-destructive">
                        {product.currentStock} {product.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mín: {product.minStock} {product.unit}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p className="text-sm">Todos os produtos com estoque adequado</p>
                </div>
              )}
            </div>
            {lowStockProducts.length > 5 && (
              <Link href="/estoque/produtos">
                <Button variant="ghost" size="sm" className="w-full mt-3">
                  Ver todos ({lowStockProducts.length})
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Suppliers Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Principais Fornecedores por Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSuppliersData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/compras/fornecedores">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Fornecedores</p>
                  <p className="text-sm text-muted-foreground">
                    {suppliers.length} cadastrados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/compras/pedidos">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Pedidos de Compra</p>
                  <p className="text-sm text-muted-foreground">
                    {purchaseOrders.length} pedidos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/compras/cotacoes">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Cotações</p>
                  <p className="text-sm text-muted-foreground">
                    Solicitar cotações
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
