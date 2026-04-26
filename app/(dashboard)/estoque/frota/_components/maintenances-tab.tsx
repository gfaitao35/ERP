"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useERPData } from "@/contexts/erp-data-context"
import { DataTable, DataTableColumnHeader } from "@/components/erp/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Plus, Wrench, Calendar, DollarSign, Clock, MoreHorizontal } from "lucide-react"
import type { VehicleMaintenance, MaintenanceType, MaintenanceStatus } from "@/types/erp"

const typeLabels: Record<MaintenanceType, { label: string; color: string }> = {
  preventive: { label: "Preventiva", color: "bg-blue-500" },
  corrective: { label: "Corretiva", color: "bg-amber-500" },
}

const statusLabels: Record<MaintenanceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "Agendada", variant: "outline" },
  in_progress: { label: "Em Andamento", variant: "secondary" },
  completed: { label: "Concluída", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
}

export function MaintenancesTab() {
  const { maintenances, addMaintenance, vehicles } = useERPData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMaintenance, setNewMaintenance] = useState<Partial<VehicleMaintenance>>({
    vehicleId: "",
    type: "preventive",
    status: "scheduled",
    description: "",
    scheduledDate: new Date(),
    workshop: "",
    laborCost: 0,
    partsCost: 0,
    totalCost: 0,
    notes: "",
  })

  // Stats
  const scheduledCount = maintenances.filter((m) => m.status === "scheduled").length
  const inProgressCount = maintenances.filter((m) => m.status === "in_progress").length
  const totalCost = maintenances.filter((m) => m.status === "completed").reduce((sum, m) => sum + m.totalCost, 0)

  const handleAddMaintenance = () => {
    if (newMaintenance.vehicleId && newMaintenance.description) {
      const totalCost = (newMaintenance.laborCost || 0) + (newMaintenance.partsCost || 0)
      addMaintenance({
        ...newMaintenance,
        id: `MNT-${Date.now()}`,
        tenantId: "tenant-1",
        totalCost,
        scheduledDate: new Date(newMaintenance.scheduledDate || Date.now()),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as VehicleMaintenance)
      setNewMaintenance({
        vehicleId: "",
        type: "preventive",
        status: "scheduled",
        description: "",
        scheduledDate: new Date(),
        workshop: "",
        laborCost: 0,
        partsCost: 0,
        totalCost: 0,
        notes: "",
      })
      setIsDialogOpen(false)
    }
  }

  const columns: ColumnDef<VehicleMaintenance>[] = [
    {
      accessorKey: "scheduledDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data Agendada" />
      ),
      cell: ({ row }) => new Date(row.getValue("scheduledDate")).toLocaleDateString("pt-BR"),
    },
    {
      accessorKey: "vehicleId",
      header: "Veículo",
      cell: ({ row }) => {
        const vehicleId = row.getValue("vehicleId") as string
        const vehicle = vehicles.find((v) => v.id === vehicleId)
        return vehicle ? (
          <div>
            <span className="font-mono font-medium">{vehicle.plate}</span>
            <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
          </div>
        ) : "-"
      },
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type") as MaintenanceType
        const typeInfo = typeLabels[type]
        return (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${typeInfo.color}`} />
            <span>{typeInfo.label}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate block">{row.getValue("description")}</span>
      ),
    },
    {
      accessorKey: "workshop",
      header: "Oficina",
      cell: ({ row }) => row.getValue("workshop") || "-",
    },
    {
      accessorKey: "totalCost",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Custo Total" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {(row.getValue("totalCost") as number).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as MaintenanceStatus
        const statusInfo = statusLabels[status]
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Marcar como concluída</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agendadas</p>
                <p className="text-xl font-bold">{scheduledCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-xl font-bold">{inProgressCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Custo Total (Concluídas)</p>
                <p className="text-xl font-bold">
                  {totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Manutenção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Agendar Manutenção
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Veículo *</FieldLabel>
                  <Select
                    value={newMaintenance.vehicleId}
                    onValueChange={(value) => setNewMaintenance({ ...newMaintenance, vehicleId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate} - {vehicle.brand} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Tipo</FieldLabel>
                  <Select
                    value={newMaintenance.type}
                    onValueChange={(value) => setNewMaintenance({ ...newMaintenance, type: value as MaintenanceType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <FieldGroup className="col-span-2">
                <Field>
                  <FieldLabel>Descrição *</FieldLabel>
                  <Textarea
                    value={newMaintenance.description}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                    placeholder="Descreva o serviço a ser realizado"
                    rows={2}
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Data Agendada</FieldLabel>
                  <Input
                    type="date"
                    value={newMaintenance.scheduledDate instanceof Date 
                      ? newMaintenance.scheduledDate.toISOString().split("T")[0] 
                      : ""}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduledDate: new Date(e.target.value) })}
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Oficina</FieldLabel>
                  <Input
                    value={newMaintenance.workshop || ""}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, workshop: e.target.value })}
                    placeholder="Nome da oficina"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Custo Mão de Obra</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMaintenance.laborCost || ""}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, laborCost: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Custo Peças</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMaintenance.partsCost || ""}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, partsCost: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Quilometragem na Manutenção</FieldLabel>
                  <Input
                    type="number"
                    value={newMaintenance.mileageAtMaintenance || ""}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, mileageAtMaintenance: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Próxima Manutenção (km)</FieldLabel>
                  <Input
                    type="number"
                    value={newMaintenance.nextMaintenanceMileage || ""}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, nextMaintenanceMileage: parseInt(e.target.value) || 0 })}
                    placeholder="Ex: 50000"
                  />
                </Field>
              </FieldGroup>
              {(newMaintenance.laborCost || newMaintenance.partsCost) ? (
                <FieldGroup className="col-span-2">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm text-muted-foreground">Custo Total Estimado</p>
                    <p className="text-2xl font-bold">
                      {((newMaintenance.laborCost || 0) + (newMaintenance.partsCost || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                </FieldGroup>
              ) : null}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddMaintenance}>Agendar Manutenção</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={maintenances}
        searchKey="description"
        searchPlaceholder="Buscar por descrição..."
      />
    </div>
  )
}
