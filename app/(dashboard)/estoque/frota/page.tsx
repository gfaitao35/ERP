"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Car,
  Users,
  Fuel,
  Wrench,
  FileText,
  AlertTriangle,
  Plus,
  TrendingUp,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/erp/page-header"
import { useERPData } from "@/contexts/erp-data-context"
import { cn } from "@/lib/utils"

import { VehiclesTab } from "./_components/vehicles-tab"
import { DriversTab } from "./_components/drivers-tab"
import { RefuelingsTab } from "./_components/refuelings-tab"
import { MaintenancesTab } from "./_components/maintenances-tab"
import { DocumentsTab } from "./_components/documents-tab"
import { FinesTab } from "./_components/fines-tab"

export default function FleetPage() {
  const [activeTab, setActiveTab] = useState("vehicles")
  const { vehicles, drivers, refuelings, maintenances, vehicleDocuments, vehicleFines } = useERPData()

  const availableVehicles = vehicles.filter((v) => v.status === "available").length
  const inUseVehicles = vehicles.filter((v) => v.status === "in_use").length
  const maintenanceVehicles = vehicles.filter((v) => v.status === "maintenance").length

  const pendingMaintenances = maintenances.filter((m) => m.status === "scheduled").length
  const overdueDocuments = vehicleDocuments.filter((d) => d.status === "overdue").length
  const pendingFines = vehicleFines.filter((f) => f.status === "pending").length

  const totalFuelCost = refuelings.reduce((sum, r) => sum + r.totalCost, 0)
  const totalMaintenanceCost = maintenances.reduce((sum, m) => sum + m.totalCost, 0)

  const quickStats = [
    {
      title: "Total de Veículos",
      value: vehicles.length,
      subtitle: `${availableVehicles} disponíveis`,
      icon: Car,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Motoristas Ativos",
      value: drivers.filter((d) => d.isActive).length,
      subtitle: `de ${drivers.length} cadastrados`,
      icon: Users,
      color: "bg-green-500/10 text-green-500",
    },
    {
      title: "Custo Combustível",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        notation: "compact",
      }).format(totalFuelCost),
      subtitle: "total acumulado",
      icon: Fuel,
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Alertas Ativos",
      value: pendingMaintenances + overdueDocuments + pendingFines,
      subtitle: "requerem atenção",
      icon: AlertTriangle,
      color: (pendingMaintenances + overdueDocuments + pendingFines) > 0 
        ? "bg-red-500/10 text-red-500" 
        : "bg-slate-500/10 text-slate-500",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Frota"
        description="Controle de veículos, motoristas, abastecimentos e manutenções"
        icon={<Car className="h-6 w-6" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/estoque/frota/relatorios">
                <TrendingUp className="mr-2 size-4" />
                Relatórios
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

      {/* Vehicle Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Disponíveis</p>
                <p className="text-3xl font-bold text-green-700">{availableVehicles}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Car className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Em Uso</p>
                <p className="text-3xl font-bold text-blue-700">{inUseVehicles}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Em Manutenção</p>
                <p className="text-3xl font-bold text-amber-700">{maintenanceVehicles}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {(pendingMaintenances > 0 || overdueDocuments > 0 || pendingFines > 0) && (
        <Card className="border-destructive/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              <CardTitle className="text-destructive">Alertas Pendentes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {pendingMaintenances > 0 && (
                <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-500/10">
                  <Wrench className="mr-1 h-3 w-3" />
                  {pendingMaintenances} manutenções agendadas
                </Badge>
              )}
              {overdueDocuments > 0 && (
                <Badge variant="outline" className="border-red-500 text-red-600 bg-red-500/10">
                  <FileText className="mr-1 h-3 w-3" />
                  {overdueDocuments} documentos vencidos
                </Badge>
              )}
              {pendingFines > 0 && (
                <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-500/10">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {pendingFines} multas pendentes
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="vehicles" className="gap-2">
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">Veículos</span>
          </TabsTrigger>
          <TabsTrigger value="drivers" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Motoristas</span>
          </TabsTrigger>
          <TabsTrigger value="refuelings" className="gap-2">
            <Fuel className="h-4 w-4" />
            <span className="hidden sm:inline">Abastecimentos</span>
          </TabsTrigger>
          <TabsTrigger value="maintenances" className="gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Manutenções</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="fines" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Multas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <VehiclesTab />
        </TabsContent>
        <TabsContent value="drivers">
          <DriversTab />
        </TabsContent>
        <TabsContent value="refuelings">
          <RefuelingsTab />
        </TabsContent>
        <TabsContent value="maintenances">
          <MaintenancesTab />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab />
        </TabsContent>
        <TabsContent value="fines">
          <FinesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
