"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useERPData } from "@/contexts/erp-data-context"
import { DataTable, DataTableColumnHeader } from "@/components/erp/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Car, MoreHorizontal } from "lucide-react"
import type { Vehicle, VehicleStatus, VehicleFuelType } from "@/types/erp"

const statusLabels: Record<VehicleStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  available: { label: "Disponível", variant: "default" },
  in_use: { label: "Em Uso", variant: "secondary" },
  maintenance: { label: "Em Manutenção", variant: "outline" },
  inactive: { label: "Inativo", variant: "destructive" },
}

const fuelTypeLabels: Record<VehicleFuelType, string> = {
  gasoline: "Gasolina",
  ethanol: "Etanol",
  diesel: "Diesel",
  flex: "Flex",
  electric: "Elétrico",
  hybrid: "Híbrido",
}

export function VehiclesTab() {
  const { vehicles, addVehicle, drivers } = useERPData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    plate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    fuelType: "flex",
    tankCapacity: 50,
    currentMileage: 0,
    status: "available",
    category: "",
  })

  const handleAddVehicle = () => {
    if (newVehicle.plate && newVehicle.brand && newVehicle.model) {
      addVehicle({
        ...newVehicle,
        id: `VEH-${Date.now()}`,
        tenantId: "tenant-1",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Vehicle)
      setNewVehicle({
        plate: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        color: "",
        fuelType: "flex",
        tankCapacity: 50,
        currentMileage: 0,
        status: "available",
        category: "",
      })
      setIsDialogOpen(false)
    }
  }

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "plate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Placa" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-sm font-bold bg-muted px-2 py-1 rounded">
          {row.getValue("plate")}
        </span>
      ),
    },
    {
      accessorKey: "brand",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Veículo" />
      ),
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <div>
            <p className="font-medium">{vehicle.brand} {vehicle.model}</p>
            <p className="text-xs text-muted-foreground">{vehicle.year} - {vehicle.color}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "fuelType",
      header: "Combustível",
      cell: ({ row }) => fuelTypeLabels[row.getValue("fuelType") as VehicleFuelType] || row.getValue("fuelType"),
    },
    {
      accessorKey: "currentMileage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quilometragem" />
      ),
      cell: ({ row }) => {
        const mileage = row.getValue("currentMileage") as number
        return `${mileage.toLocaleString("pt-BR")} km`
      },
    },
    {
      accessorKey: "assignedDriverId",
      header: "Motorista",
      cell: ({ row }) => {
        const driverId = row.getValue("assignedDriverId") as string | undefined
        if (!driverId) return <span className="text-muted-foreground">-</span>
        const driver = drivers.find((d) => d.id === driverId)
        return driver?.name || "-"
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as VehicleStatus
        const statusInfo = statusLabels[status]
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const vehicle = row.original
        return (
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
              <DropdownMenuItem>Registrar abastecimento</DropdownMenuItem>
              <DropdownMenuItem>Agendar manutenção</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Desativar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Cadastrar Veículo
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Placa *</FieldLabel>
                  <Input
                    value={newVehicle.plate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value.toUpperCase() })}
                    placeholder="ABC-1234"
                    maxLength={8}
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Marca *</FieldLabel>
                  <Input
                    value={newVehicle.brand}
                    onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                    placeholder="Ex: Volkswagen"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Modelo *</FieldLabel>
                  <Input
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    placeholder="Ex: Gol 1.6"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Ano</FieldLabel>
                  <Input
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) || 0 })}
                    placeholder="2024"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Cor</FieldLabel>
                  <Input
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                    placeholder="Ex: Branco"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Combustível</FieldLabel>
                  <Select
                    value={newVehicle.fuelType}
                    onValueChange={(value) => setNewVehicle({ ...newVehicle, fuelType: value as VehicleFuelType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(fuelTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Capacidade do Tanque (L)</FieldLabel>
                  <Input
                    type="number"
                    value={newVehicle.tankCapacity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, tankCapacity: parseInt(e.target.value) || 0 })}
                    placeholder="50"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Quilometragem Atual</FieldLabel>
                  <Input
                    type="number"
                    value={newVehicle.currentMileage}
                    onChange={(e) => setNewVehicle({ ...newVehicle, currentMileage: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Chassi</FieldLabel>
                  <Input
                    value={newVehicle.chassi || ""}
                    onChange={(e) => setNewVehicle({ ...newVehicle, chassi: e.target.value.toUpperCase() })}
                    placeholder="9BWHE21JX24060960"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>RENAVAM</FieldLabel>
                  <Input
                    value={newVehicle.renavam || ""}
                    onChange={(e) => setNewVehicle({ ...newVehicle, renavam: e.target.value })}
                    placeholder="00000000000"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup className="col-span-2">
                <Field>
                  <FieldLabel>Categoria</FieldLabel>
                  <Input
                    value={newVehicle.category || ""}
                    onChange={(e) => setNewVehicle({ ...newVehicle, category: e.target.value })}
                    placeholder="Ex: Utilitário, Passeio, Carga"
                  />
                </Field>
              </FieldGroup>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddVehicle}>Salvar Veículo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        searchKey="plate"
        searchPlaceholder="Buscar por placa..."
      />
    </div>
  )
}
