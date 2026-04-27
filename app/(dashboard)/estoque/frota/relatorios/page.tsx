"use client"

import { useState } from "react"
import { useERPData } from "@/contexts/erp-data-context"
import { PageHeader } from "@/components/erp/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Car,
  Fuel,
  Wrench,
  AlertTriangle,
  DollarSign,
  Gauge,
  FileText,
  ArrowLeft,
  BarChart3,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

export default function FleetReportsPage() {
  const { vehicles, drivers, refuelings, maintenances, vehicleFines, vehicleDocuments } = useERPData()
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("all")
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId)

  // Filter by vehicle and year
  const filteredRefuelings = refuelings.filter((r) => {
    const matchVehicle = selectedVehicleId === "all" || r.vehicleId === selectedVehicleId
    const matchYear = new Date(r.date).getFullYear() === selectedYear
    return matchVehicle && matchYear
  })

  const filteredMaintenances = maintenances.filter((m) => {
    const matchVehicle = selectedVehicleId === "all" || m.vehicleId === selectedVehicleId
    const matchYear = new Date(m.scheduledDate).getFullYear() === selectedYear
    return matchVehicle && matchYear
  })

  const filteredFines = vehicleFines.filter((f) => {
    const matchVehicle = selectedVehicleId === "all" || f.vehicleId === selectedVehicleId
    const matchYear = new Date(f.date).getFullYear() === selectedYear
    return matchVehicle && matchYear
  })

  // Totals
  const totalFuelCost = filteredRefuelings.reduce((s, r) => s + r.totalCost, 0)
  const totalFuelLiters = filteredRefuelings.reduce((s, r) => s + r.liters, 0)
  const totalMaintenanceCost = filteredMaintenances.filter((m) => m.status === "completed").reduce((s, m) => s + m.totalCost, 0)
  const totalFinesCost = filteredFines.reduce((s, f) => s + f.amount, 0)
  const totalCost = totalFuelCost + totalMaintenanceCost + totalFinesCost

  // Monthly fuel cost data
  const monthlyFuelCosts = MONTHS.map((_, idx) => ({
    month: MONTHS[idx],
    fuel: filteredRefuelings.filter((r) => new Date(r.date).getMonth() === idx).reduce((s, r) => s + r.totalCost, 0),
    maintenance: filteredMaintenances.filter((m) => new Date(m.scheduledDate).getMonth() === idx && m.status === "completed").reduce((s, m) => s + m.totalCost, 0),
  }))
  const maxMonthlyTotal = Math.max(...monthlyFuelCosts.map((m) => m.fuel + m.maintenance), 1)

  // Fuel efficiency per vehicle
  const vehicleEfficiency = vehicles.map((v) => {
    const vRefuelings = refuelings.filter((r) => r.vehicleId === v.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const totalLiters = vRefuelings.reduce((s, r) => s + r.liters, 0)
    const avgKmPerLiter = vRefuelings.length >= 2
      ? (() => {
          const first = vRefuelings[0]
          const last = vRefuelings[vRefuelings.length - 1]
          const kmDiff = last.mileage - first.mileage
          return kmDiff > 0 && totalLiters > 0 ? kmDiff / totalLiters : 0
        })()
      : 0
    return { vehicle: v, totalLiters, avgKmPerLiter, cost: vRefuelings.reduce((s, r) => s + r.totalCost, 0) }
  }).filter((e) => e.totalLiters > 0)

  // Cost per vehicle
  const vehicleCosts = vehicles.map((v) => {
    const fuel = refuelings.filter((r) => r.vehicleId === v.id && new Date(r.date).getFullYear() === selectedYear).reduce((s, r) => s + r.totalCost, 0)
    const maint = maintenances.filter((m) => m.vehicleId === v.id && m.status === "completed" && new Date(m.scheduledDate).getFullYear() === selectedYear).reduce((s, m) => s + m.totalCost, 0)
    const fines = vehicleFines.filter((f) => f.vehicleId === v.id && new Date(f.date).getFullYear() === selectedYear).reduce((s, f) => s + f.amount, 0)
    return { vehicle: v, fuel, maintenance: maint, fines, total: fuel + maint + fines }
  }).filter((e) => e.total > 0).sort((a, b) => b.total - a.total)

  const maxVehicleCost = Math.max(...vehicleCosts.map((v) => v.total), 1)

  // Pending documents
  const expiringDocs = vehicleDocuments.filter((d) => {
    const daysUntil = Math.ceil((new Date(d.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntil <= 30 && d.status !== "paid"
  })

  const years = Array.from(new Set([new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2]))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios de Frota"
        description="Análise de custos, consumo e desempenho da frota"
        icon={<BarChart3 className="h-6 w-6" />}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/estoque/frota">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Frota
            </Link>
          </Button>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
          <SelectTrigger className="w-64">
            <Car className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Todos os veículos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Veículos</SelectItem>
            {vehicles.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {v.plate} — {v.brand} {v.model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
          <SelectTrigger className="w-32">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        {selectedVehicle && (
          <Badge variant="secondary" className="px-3 py-1.5 text-sm">
            {selectedVehicle.plate} — {selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.year}
          </Badge>
        )}
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Custo Total", value: totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), icon: DollarSign, color: "bg-blue-500/10 text-blue-500" },
          { label: "Combustível", value: totalFuelCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), sub: `${totalFuelLiters.toFixed(0)} litros`, icon: Fuel, color: "bg-amber-500/10 text-amber-500" },
          { label: "Manutenções", value: totalMaintenanceCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), sub: `${filteredMaintenances.filter(m => m.status === "completed").length} realizadas`, icon: Wrench, color: "bg-purple-500/10 text-purple-500" },
          { label: "Multas", value: totalFinesCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), sub: `${filteredFines.length} infração(ões)`, icon: AlertTriangle, color: filteredFines.length > 0 ? "bg-red-500/10 text-red-500" : "bg-slate-500/10 text-slate-500" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn("rounded-lg p-3", kpi.color)}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold">{kpi.value}</p>
                {kpi.sub && <p className="text-xs text-muted-foreground">{kpi.sub}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Custo mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Custo Mensal ({selectedYear})
            </CardTitle>
            <CardDescription>Combustível + manutenções por mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {monthlyFuelCosts.map((m) => {
                const total = m.fuel + m.maintenance
                if (total === 0 && filteredRefuelings.length > 0) return null
                return (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="w-8 text-xs text-muted-foreground">{m.month}</span>
                    <div className="flex-1 space-y-1">
                      {m.fuel > 0 && (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 rounded-full bg-amber-500"
                            style={{ width: `${(m.fuel / maxMonthlyTotal) * 100}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{m.fuel.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                        </div>
                      )}
                      {m.maintenance > 0 && (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 rounded-full bg-purple-500"
                            style={{ width: `${(m.maintenance / maxMonthlyTotal) * 100}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{m.maintenance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                        </div>
                      )}
                      {total === 0 && <div className="h-2 rounded-full bg-muted w-full" />}
                    </div>
                    <span className="w-20 text-right text-xs font-medium">
                      {total > 0 ? total.toLocaleString("pt-BR", { style: "currency", currency: "BRL", notation: "compact" }) : "—"}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><div className="h-2 w-4 rounded bg-amber-500" /> Combustível</div>
              <div className="flex items-center gap-1"><div className="h-2 w-4 rounded bg-purple-500" /> Manutenção</div>
            </div>
          </CardContent>
        </Card>

        {/* Custo por veículo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Custo por Veículo ({selectedYear})
            </CardTitle>
            <CardDescription>Ranking de custo total por veículo</CardDescription>
          </CardHeader>
          <CardContent>
            {vehicleCosts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhum dado para o período selecionado</p>
            ) : (
              <div className="space-y-4">
                {vehicleCosts.slice(0, 8).map((entry) => (
                  <div key={entry.vehicle.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{entry.vehicle.plate}</p>
                        <p className="text-xs text-muted-foreground">{entry.vehicle.brand} {entry.vehicle.model}</p>
                      </div>
                      <p className="text-sm font-semibold">{entry.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                    </div>
                    <Progress value={(entry.total / maxVehicleCost) * 100} className="h-1.5" />
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {entry.fuel > 0 && <span>⛽ {entry.fuel.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>}
                      {entry.maintenance > 0 && <span>🔧 {entry.maintenance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>}
                      {entry.fines > 0 && <span>⚠️ {entry.fines.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Eficiência de combustível */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              Eficiência de Combustível
            </CardTitle>
            <CardDescription>Km/litro médio por veículo (histórico geral)</CardDescription>
          </CardHeader>
          <CardContent>
            {vehicleEfficiency.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Registre ao menos 2 abastecimentos por veículo para calcular eficiência</p>
            ) : (
              <div className="space-y-3">
                {vehicleEfficiency.sort((a, b) => b.avgKmPerLiter - a.avgKmPerLiter).map((entry) => {
                  const maxEff = Math.max(...vehicleEfficiency.map((e) => e.avgKmPerLiter))
                  return (
                    <div key={entry.vehicle.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{entry.vehicle.plate} — {entry.vehicle.brand} {entry.vehicle.model}</p>
                          <p className="text-xs text-muted-foreground">{entry.totalLiters.toFixed(0)} L abastecidos</p>
                        </div>
                        <p className={cn("text-sm font-bold", entry.avgKmPerLiter >= 10 ? "text-green-600" : entry.avgKmPerLiter >= 7 ? "text-amber-600" : "text-red-600")}>
                          {entry.avgKmPerLiter > 0 ? `${entry.avgKmPerLiter.toFixed(1)} km/L` : "—"}
                        </p>
                      </div>
                      {entry.avgKmPerLiter > 0 && (
                        <Progress value={(entry.avgKmPerLiter / maxEff) * 100} className={cn("h-1.5", entry.avgKmPerLiter >= 10 ? "[&>div]:bg-green-500" : entry.avgKmPerLiter >= 7 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500")} />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentos a vencer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documentos a Vencer
            </CardTitle>
            <CardDescription>Próximos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {expiringDocs.length === 0 ? (
              <div className="flex flex-col items-center py-6 gap-2 text-center">
                <div className="rounded-full bg-green-500/10 p-3">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-sm font-medium text-green-600">Todos os documentos em dia!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {expiringDocs.map((doc) => {
                  const vehicle = vehicles.find((v) => v.id === doc.vehicleId)
                  const daysUntil = Math.ceil((new Date(doc.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={doc.id} className={cn("flex items-center justify-between rounded-lg p-3", daysUntil <= 0 ? "bg-red-500/10" : daysUntil <= 7 ? "bg-amber-500/10" : "bg-muted")}>
                      <div>
                        <p className="text-sm font-medium">{vehicle?.plate} — {doc.type}</p>
                        <p className="text-xs text-muted-foreground">Vence em {new Date(doc.dueDate).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <Badge variant={daysUntil <= 0 ? "destructive" : "outline"} className={daysUntil > 0 && daysUntil <= 7 ? "border-amber-500 text-amber-600" : ""}>
                        {daysUntil <= 0 ? "Vencido" : `${daysUntil}d`}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}