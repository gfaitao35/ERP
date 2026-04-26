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
import { Plus, AlertTriangle, DollarSign, MapPin, MoreHorizontal } from "lucide-react"
import type { VehicleFine, FineStatus } from "@/types/erp"

const statusLabels: Record<FineStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  paid: { label: "Paga", variant: "default" },
  contested: { label: "Contestada", variant: "secondary" },
  cancelled: { label: "Cancelada", variant: "destructive" },
}

export function FinesTab() {
  const { vehicleFines, addVehicleFine, vehicles, drivers } = useERPData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newFine, setNewFine] = useState<Partial<VehicleFine>>({
    vehicleId: "",
    driverId: "",
    date: new Date(),
    description: "",
    infringementCode: "",
    location: "",
    amount: 0,
    dueDate: new Date(),
    status: "pending",
    points: 0,
  })

  // Stats
  const pendingFines = vehicleFines.filter((f) => f.status === "pending")
  const pendingCount = pendingFines.length
  const pendingAmount = pendingFines.reduce((sum, f) => sum + f.amount, 0)
  const totalPoints = vehicleFines
    .filter((f) => f.status === "pending" || f.status === "paid")
    .reduce((sum, f) => sum + (f.points || 0), 0)

  const handleAddFine = () => {
    if (newFine.vehicleId && newFine.description && newFine.amount) {
      addVehicleFine({
        ...newFine,
        id: `FINE-${Date.now()}`,
        tenantId: "tenant-1",
        date: new Date(newFine.date || Date.now()),
        dueDate: new Date(newFine.dueDate || Date.now()),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as VehicleFine)
      setNewFine({
        vehicleId: "",
        driverId: "",
        date: new Date(),
        description: "",
        infringementCode: "",
        location: "",
        amount: 0,
        dueDate: new Date(),
        status: "pending",
        points: 0,
      })
      setIsDialogOpen(false)
    }
  }

  const columns: ColumnDef<VehicleFine>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data" />
      ),
      cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString("pt-BR"),
    },
    {
      accessorKey: "vehicleId",
      header: "Veículo",
      cell: ({ row }) => {
        const vehicleId = row.getValue("vehicleId") as string
        const vehicle = vehicles.find((v) => v.id === vehicleId)
        return vehicle ? (
          <span className="font-mono font-medium">{vehicle.plate}</span>
        ) : "-"
      },
    },
    {
      accessorKey: "driverId",
      header: "Motorista",
      cell: ({ row }) => {
        const driverId = row.getValue("driverId") as string | undefined
        if (!driverId) return <span className="text-muted-foreground">Não identificado</span>
        const driver = drivers.find((d) => d.id === driverId)
        return driver?.name || "-"
      },
    },
    {
      accessorKey: "description",
      header: "Infração",
      cell: ({ row }) => {
        const fine = row.original
        return (
          <div>
            <p className="max-w-[200px] truncate">{fine.description}</p>
            {fine.infringementCode && (
              <p className="text-xs text-muted-foreground font-mono">
                Cód: {fine.infringementCode}
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "location",
      header: "Local",
      cell: ({ row }) => row.getValue("location") || "-",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Valor" />
      ),
      cell: ({ row }) => {
        const fine = row.original
        return (
          <div>
            <span className="font-medium">
              {fine.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            {fine.discountAmount && fine.discountAmount > 0 && (
              <p className="text-xs text-green-600">
                -{fine.discountAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} desc.
              </p>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "points",
      header: "Pontos",
      cell: ({ row }) => {
        const points = row.getValue("points") as number
        return (
          <Badge variant={points > 0 ? "destructive" : "outline"}>
            {points || 0} pts
          </Badge>
        )
      },
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vencimento" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("dueDate"))
        const fine = row.original
        const isOverdue = fine.status === "pending" && date < new Date()
        return (
          <span className={isOverdue ? "text-destructive" : ""}>
            {date.toLocaleDateString("pt-BR")}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as FineStatus
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
            <DropdownMenuItem>Marcar como paga</DropdownMenuItem>
            <DropdownMenuItem>Contestar</DropdownMenuItem>
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
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Multas Pendentes</p>
                <p className="text-xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-500/10 p-2">
                <DollarSign className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Pendente</p>
                <p className="text-xl font-bold text-destructive">
                  {pendingAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Pontos</p>
                <p className="text-xl font-bold">{totalPoints} pts</p>
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
              Registrar Multa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Registrar Multa
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Veículo *</FieldLabel>
                  <Select
                    value={newFine.vehicleId}
                    onValueChange={(value) => setNewFine({ ...newFine, vehicleId: value })}
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
                  <FieldLabel>Motorista</FieldLabel>
                  <Select
                    value={newFine.driverId || "none"}
                    onValueChange={(value) => setNewFine({ ...newFine, driverId: value === "none" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Não identificado</SelectItem>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Data da Infração *</FieldLabel>
                  <Input
                    type="date"
                    value={newFine.date instanceof Date 
                      ? newFine.date.toISOString().split("T")[0] 
                      : ""}
                    onChange={(e) => setNewFine({ ...newFine, date: new Date(e.target.value) })}
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Código da Infração</FieldLabel>
                  <Input
                    value={newFine.infringementCode || ""}
                    onChange={(e) => setNewFine({ ...newFine, infringementCode: e.target.value })}
                    placeholder="Ex: 746-50"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup className="col-span-2">
                <Field>
                  <FieldLabel>Descrição da Infração *</FieldLabel>
                  <Textarea
                    value={newFine.description}
                    onChange={(e) => setNewFine({ ...newFine, description: e.target.value })}
                    placeholder="Descreva a infração cometida"
                    rows={2}
                  />
                </Field>
              </FieldGroup>
              <FieldGroup className="col-span-2">
                <Field>
                  <FieldLabel>Local da Infração</FieldLabel>
                  <div className="relative">
                    <Input
                      value={newFine.location || ""}
                      onChange={(e) => setNewFine({ ...newFine, location: e.target.value })}
                      placeholder="Endereço ou referência do local"
                      className="pr-10"
                    />
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Valor da Multa *</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={newFine.amount || ""}
                    onChange={(e) => setNewFine({ ...newFine, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Desconto (se houver)</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={newFine.discountAmount || ""}
                    onChange={(e) => setNewFine({ ...newFine, discountAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Pontos na CNH</FieldLabel>
                  <Input
                    type="number"
                    value={newFine.points || ""}
                    onChange={(e) => setNewFine({ ...newFine, points: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Data de Vencimento</FieldLabel>
                  <Input
                    type="date"
                    value={newFine.dueDate instanceof Date 
                      ? newFine.dueDate.toISOString().split("T")[0] 
                      : ""}
                    onChange={(e) => setNewFine({ ...newFine, dueDate: new Date(e.target.value) })}
                  />
                </Field>
              </FieldGroup>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddFine}>Registrar Multa</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={vehicleFines}
        searchKey="description"
        searchPlaceholder="Buscar por descrição..."
      />
    </div>
  )
}
