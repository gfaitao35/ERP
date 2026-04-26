"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/erp/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  BarChart3,
  CalendarDays,
} from "lucide-react"
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
  Legend,
  ReferenceLine,
} from "recharts"

// =====================================================
// MOCK DATA - fluxo de caixa
// =====================================================
const MOCK_CASH_FLOW = [
  { date: "01/04", description: "Recebimento NF-001", type: "income" as const, amount: 15000, balance: 45000, category: "Vendas" },
  { date: "02/04", description: "Pgto Fornecedor ABC", type: "expense" as const, amount: 8500, balance: 36500, category: "Compras" },
  { date: "03/04", description: "Recebimento NF-002", type: "income" as const, amount: 22000, balance: 58500, category: "Vendas" },
  { date: "04/04", description: "Folha de Pagamento", type: "expense" as const, amount: 18000, balance: 40500, category: "Pessoal" },
  { date: "05/04", description: "Recebimento NF-003", type: "income" as const, amount: 9800, balance: 50300, category: "Vendas" },
  { date: "07/04", description: "Aluguel", type: "expense" as const, amount: 6500, balance: 43800, category: "Operacional" },
  { date: "08/04", description: "Recebimento NF-004", type: "income" as const, amount: 31000, balance: 74800, category: "Vendas" },
  { date: "10/04", description: "Energia Elétrica", type: "expense" as const, amount: 2100, balance: 72700, category: "Operacional" },
  { date: "11/04", description: "Recebimento NF-005", type: "income" as const, amount: 14500, balance: 87200, category: "Vendas" },
  { date: "12/04", description: "Pgto Fornecedor XYZ", type: "expense" as const, amount: 12000, balance: 75200, category: "Compras" },
  { date: "14/04", description: "Recebimento NF-006", type: "income" as const, amount: 28000, balance: 103200, category: "Vendas" },
  { date: "15/04", description: "Marketing Digital", type: "expense" as const, amount: 4500, balance: 98700, category: "Marketing" },
  { date: "16/04", description: "Recebimento NF-007", type: "income" as const, amount: 11200, balance: 109900, category: "Vendas" },
  { date: "17/04", description: "Internet e Telefone", type: "expense" as const, amount: 1800, balance: 108100, category: "Operacional" },
  { date: "18/04", description: "Recebimento NF-008", type: "income" as const, amount: 19500, balance: 127600, category: "Vendas" },
]

const MONTHLY_SUMMARY = [
  { month: "Jan", receitas: 125000, despesas: 89000, saldo: 36000 },
  { month: "Fev", receitas: 142000, despesas: 95000, saldo: 47000 },
  { month: "Mar", receitas: 138000, despesas: 102000, saldo: 36000 },
  { month: "Abr", receitas: 155000, despesas: 98000, saldo: 57000 },
  { month: "Mai", receitas: 168000, despesas: 112000, saldo: 56000 },
  { month: "Jun", receitas: 175000, despesas: 105000, saldo: 70000 },
]

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default function CashFlowPage() {
  const [period, setPeriod] = useState("abril")

  const totalIncome = useMemo(
    () => MOCK_CASH_FLOW.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0),
    []
  )
  const totalExpense = useMemo(
    () => MOCK_CASH_FLOW.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0),
    []
  )
  const netBalance = totalIncome - totalExpense
  const openingBalance = MOCK_CASH_FLOW[0].balance - (MOCK_CASH_FLOW[0].type === "income" ? MOCK_CASH_FLOW[0].amount : -MOCK_CASH_FLOW[0].amount)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fluxo de Caixa"
        description="Movimentações e projeção financeira"
        icon={<Wallet className="h-6 w-6" />}
      />

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="janeiro">Janeiro 2025</SelectItem>
              <SelectItem value="fevereiro">Fevereiro 2025</SelectItem>
              <SelectItem value="marco">Março 2025</SelectItem>
              <SelectItem value="abril">Abril 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(openingBalance)}</p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entradas</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Saídas</p>
                <p className="text-2xl font-bold mt-1 text-destructive">{formatCurrency(totalExpense)}</p>
              </div>
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Final</p>
                <p className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {formatCurrency(MOCK_CASH_FLOW[MOCK_CASH_FLOW.length - 1].balance)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Balance curve */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Evolução do Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CASH_FLOW}>
                  <defs>
                    <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      fontSize: "12px",
                    }}
                    formatter={(v: number) => [formatCurrency(v), "Saldo"]}
                  />
                  <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorSaldo)"
                    strokeWidth={2}
                    name="Saldo"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_SUMMARY} layout="vertical" barSize={10}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" fontSize={10} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke="hsl(var(--muted-foreground))" />
                  <YAxis type="category" dataKey="month" fontSize={11} stroke="hsl(var(--muted-foreground))" width={30} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", fontSize: "12px" }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Bar dataKey="receitas" name="Receitas" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Movimentações detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movimentações do Período</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Categoria</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CASH_FLOW.map((entry, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{entry.date}</td>
                    <td className="px-4 py-3 font-medium">{entry.description}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {entry.type === "income" ? (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <ArrowDownLeft className="h-3 w-3" /> Entrada
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-destructive font-medium">
                          <ArrowUpRight className="h-3 w-3" /> Saída
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${entry.type === "income" ? "text-green-600" : "text-destructive"}`}>
                      {entry.type === "income" ? "+" : "-"}{formatCurrency(entry.amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(entry.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
