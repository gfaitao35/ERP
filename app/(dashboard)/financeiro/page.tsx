"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useERPData } from "@/contexts/erp-data-context"
import { PageHeader } from "@/components/erp/page-header"
import { KPICard } from "@/components/erp/kpi-card"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function FinancePage() {
  const { transactions, accountsPayable, accountsReceivable } = useERPData()

  // Calculate financial KPIs
  const totalReceivable = accountsReceivable.reduce(
    (sum, ar) => sum + ar.amount - ar.amountPaid,
    0
  )
  const totalPayable = accountsPayable.reduce(
    (sum, ap) => sum + ap.amount - ap.amountPaid,
    0
  )
  const overdueReceivable = accountsReceivable
    .filter((ar) => new Date(ar.dueDate) < new Date() && ar.status !== "paid")
    .reduce((sum, ar) => sum + ar.amount - ar.amountPaid, 0)
  const overduePayable = accountsPayable
    .filter((ap) => new Date(ap.dueDate) < new Date() && ap.status !== "paid")
    .reduce((sum, ap) => sum + ap.amount - ap.amountPaid, 0)

  const monthlyIncome = accountsReceivable
    .filter(
      (ar) =>
        ar.status === "paid" &&
        new Date(ar.dueDate).getMonth() === new Date().getMonth()
    )
    .reduce((sum, ar) => sum + ar.amountPaid, 0)

  const monthlyExpenses = accountsPayable
    .filter(
      (ap) =>
        ap.status === "paid" &&
        new Date(ap.dueDate).getMonth() === new Date().getMonth()
    )
    .reduce((sum, ap) => sum + ap.amountPaid, 0)

  const cashBalance = monthlyIncome - monthlyExpenses

  // Mock cash flow data
  const cashFlowData = [
    { month: "Jan", receitas: 125000, despesas: 89000 },
    { month: "Fev", receitas: 142000, despesas: 95000 },
    { month: "Mar", receitas: 138000, despesas: 102000 },
    { month: "Abr", receitas: 155000, despesas: 98000 },
    { month: "Mai", receitas: 168000, despesas: 112000 },
    { month: "Jun", receitas: 175000, despesas: 105000 },
  ]

  const expensesByCategory = [
    { name: "Operacional", value: 45000, color: "hsl(var(--chart-1))" },
    { name: "Pessoal", value: 35000, color: "hsl(var(--chart-2))" },
    { name: "Marketing", value: 15000, color: "hsl(var(--chart-3))" },
    { name: "Infraestrutura", value: 12000, color: "hsl(var(--chart-4))" },
    { name: "Outros", value: 8000, color: "hsl(var(--chart-5))" },
  ]

  const upcomingPayments = accountsPayable
    .filter((ap) => ap.status !== "paid")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const upcomingReceivables = accountsReceivable
    .filter((ar) => ar.status !== "paid")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        description="Visão geral financeira e fluxo de caixa"
        icon={<DollarSign className="h-6 w-6" />}
      />

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard kpi={{ id: "kpi-1", title: "Saldo em Caixa", value: cashBalance, change: 8.2, changeType: "increase", format: "currency" }} />
        <KPICard kpi={{ id: "kpi-2", title: "Receitas do Mês", value: monthlyIncome, change: 12.5, changeType: "increase", format: "currency" }} />
        <KPICard kpi={{ id: "kpi-3", title: "Despesas do Mês", value: monthlyExpenses, change: 5.3, changeType: "decrease", format: "currency" }} />
        <KPICard kpi={{ id: "kpi-4", title: "Margem Líquida", value: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0, change: 2.1, changeType: "increase", format: "percentage" }} />
      </div>

      {/* Receivables and Payables Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowDownLeft className="h-5 w-5 text-success" />
              Contas a Receber
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalReceivable)}</p>
                <p className="text-sm text-muted-foreground">Total em aberto</p>
              </div>
              {overdueReceivable > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formatCurrency(overdueReceivable)} vencido
                </Badge>
              )}
            </div>
            <div className="space-y-3">
              {upcomingReceivables.map((ar) => {
                const daysUntilDue = getDaysUntilDue(ar.dueDate)
                const isOverdue = daysUntilDue < 0
                return (
                  <div
                    key={ar.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{ar.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Venc: {new Date(ar.dueDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(ar.amount - ar.amountPaid)}</p>
                      <Badge
                        variant={isOverdue ? "destructive" : daysUntilDue <= 7 ? "outline" : "secondary"}
                        className={`text-xs ${daysUntilDue <= 7 && !isOverdue ? "border-warning text-warning" : ""}`}
                      >
                        {isOverdue ? `${Math.abs(daysUntilDue)}d atrasado` : `${daysUntilDue}d`}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowUpRight className="h-5 w-5 text-destructive" />
              Contas a Pagar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalPayable)}</p>
                <p className="text-sm text-muted-foreground">Total em aberto</p>
              </div>
              {overduePayable > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {formatCurrency(overduePayable)} vencido
                </Badge>
              )}
            </div>
            <div className="space-y-3">
              {upcomingPayments.map((ap) => {
                const daysUntilDue = getDaysUntilDue(ap.dueDate)
                const isOverdue = daysUntilDue < 0
                return (
                  <div
                    key={ap.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{ap.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Venc: {new Date(ap.dueDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(ap.amount - ap.amountPaid)}</p>
                      <Badge
                        variant={isOverdue ? "destructive" : daysUntilDue <= 7 ? "outline" : "secondary"}
                        className={`text-xs ${daysUntilDue <= 7 && !isOverdue ? "border-warning text-warning" : ""}`}
                      >
                        {isOverdue ? `${Math.abs(daysUntilDue)}d atrasado` : `${daysUntilDue}d`}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart and Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="receitas"
                    stroke="hsl(var(--chart-1))"
                    fill="url(#colorReceitas)"
                    strokeWidth={2}
                    name="Receitas"
                  />
                  <Area
                    type="monotone"
                    dataKey="despesas"
                    stroke="hsl(var(--chart-5))"
                    fill="url(#colorDespesas)"
                    strokeWidth={2}
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {expensesByCategory.map((category) => (
                <div key={category.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(category.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {accountsReceivable.filter((ar) => ar.status === "paid").length}
                </p>
                <p className="text-sm text-muted-foreground">Títulos Recebidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {accountsReceivable.filter((ar) => ar.status === "pending").length}
                </p>
                <p className="text-sm text-muted-foreground">Títulos Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {accountsReceivable.filter((ar) => ar.status === "overdue").length}
                </p>
                <p className="text-sm text-muted-foreground">Títulos Vencidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}