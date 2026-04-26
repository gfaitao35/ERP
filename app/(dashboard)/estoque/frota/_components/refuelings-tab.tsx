"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useERPData } from "@/contexts/erp-data-context"
import { DataTable, DataTableColumnHeader } from "@/components/erp/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Plus, Fuel, TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react"
import type { Refueling, VehicleFuelType } from "@/types/erp"

const fuelTypeLabels: Record<VehicleFuelType, string> = {
  gasoline: "Gasolina",
  ethanol: "Etanol",
  diesel: "Diesel",
  flex: "Flex",
  electric: "Elétrico",
  hybrid: "Híbrido",
}

export function RefuelingsTab() {
  const { refuelings, addRefueling, vehicles, drivers } = useERPData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRefueling, setNewRefueling] = useState<Partial<Refueling>>({
    vehicleId: "",
    driverId: "",
    date: new Date(),
    mileage: 0,
    fuelType: "flex",
    liters: 0,
    pricePerLiter: 0,
    totalCost: 0,
    station: "",
    fullTank: true,
    notes: "",
  })

  // Calculate stats
  const totalLiters = refuelings.reduce((sum, r) => sum + r.liters, 0)
  const totalCost = refuelings.reduce((sum, r) => sum + r.totalCost, 0)
  const avgPricePerLiter = refuelings.length > 0 ? totalCost / totalLiters : 0

  const handleAddRefueling = () => {
    if (newRefueling.vehicleId && newRefueling.liters && newRefueling.pricePerLiter) {
      const totalCost = (newRefueling.liters || 0) * (newRefueling.pricePerLiter || 0)
      addRefueling({
        ...newRefueling,
        id: `REF-${Date.now()}`,
        tenantId: "tenant-1",
        totalCost,
        date: new Date(newRefueling.date || Date.now()),
        createdAt: new Date(),
      } as Refueling)
      setNewRefueling({
        vehicleId: "",
        driverId: "",
        date: new Date(),
        mileage: 0,
        fuelType: "flex",
        liters: 0,
        pricePerLiter: 0,
        totalCost: 0,
        station: "",
        fullTank: true,
        notes: "",
      })
      setIsDialogOpen(false)
    }
  }

  const columns: ColumnDef<Refueling>[] = [
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
          <div>
            <span className="font-mono font-medium">{vehicle.plate}</span>
            <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
          </div>
        ) : "-"
      },
    },
    {
      accessorKey: "driverId",
      header: "Motorista",
      cell: ({ row }) => {
        const driverId = row.getValue("driverId") as string | undefined
        if (!driverId) return "-"
        const driver = drivers.find((d) => d.id === driverId)
        return driver?.name || "-"
      },
    },
    {
      accessorKey: "mileage",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Quilometragem" />
      ),
      cell: ({ row }) => {
        const mileage = row.getValue("mileage") as number
        return `${mileage.toLocaleString("pt-BR")} km`
      },
    },
    {
      accessorKey: "fuelType",
      header: "Combustível",
      cell: ({ row }) => fuelTypeLabels[row.getValue("fuelType") as VehicleFuelType] || row.getValue("fuelType"),
    },
    {
      accessorKey: "liters",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Litros" />
      ),
      cell: ({ row }) => `${(row.getValue("liters") as number).toFixed(2)} L`,
    },
    {
      accessorKey: "pricePerLiter",
      header: "R$/L",
      cell: ({ row }) => (row.getValue("pricePerLiter") as number).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
    {
      accessorKey: "totalCost",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {(row.getValue("totalCost") as number).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
      ),
    },
    {
      accessorKey: "station",
      header: "Posto",
      cell: ({ row }) => row.getValue("station") || "-",
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
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
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
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Fuel className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Litros</p>
                <p className="text-xl font-bold">{totalLiters.toFixed(2)} L</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-xl font-bold">
                  {totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <TrendingDown className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preço Médio/L</p>
                <p className="text-xl font-bold">
                  {avgPricePerLiter.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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
              Novo Abastecimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Registrar Abastecimento
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel>Veículo *</FieldLabel>
                  <Select
                    value={newRefueling.vehicleId}
                    onValueChange={(value) => setNewRefueling({ ...newRefueling, vehicleId: value })}
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
                    value={newRefueling.driverId || "none"}
                    onValueChange={(value) => setNewRefueling({ ...newRefueling, driverId: value === "none" ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {drivers.filter((d) => d.isActive).map((driver) => (
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
                  <FieldLabel>Data *</FieldLabel>
                  <Input
                    type="date"
                    value={newRefueling.date instanceof Date 
                      ? newRefueling.date.toISOString().split("T")[0] 
                      : ""}
                    onChange={(e) => setNewRefueling({ ...newRefueling, date: new Date(e.target.value) })}
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Quilometragem</FieldLabel>
                  <Input
                    type="number"
                    value={newRefueling.mileage || ""}
                    onChange={(e) => setNewRefueling({ ...newRefueling, mileage: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Combustível</FieldLabel>
                  <Select
                    value={newRefueling.fuelType}
                    onValueChange={(value) => setNewRefueling({ ...newRefueling, fuelType: value as VehicleFuelType })}
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
                  <FieldLabel>Litros *</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={newRefueling.liters || ""}
                    onChange={(e) => setNewRefueling({ ...newRefueling, liters: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Preço por Litro *</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={newRefueling.pricePerLiter || ""}
                    onChange={(e) => setNewRefueling({ ...newRefueling, pricePerLiter: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Posto / Estabelecimento</FieldLabel>
                  <Input
                    value={newRefueling.station || ""}
                    onChange={(e) => setNewRefueling({ ...newRefueling, station: e.target.value })}
                    placeholder="Nome do posto"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup className="col-span-2">
                <Field>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fullTank"
                      checked={newRefueling.fullTank}
                      onCheckedChange={(checked) => setNewRefueling({ ...newRefueling, fullTank: checked as boolean })}
                    />
                    <label htmlFor="fullTank" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Tanque cheio
                    </label>
                  </div>
                </Field>
              </FieldGroup>
              {newRefueling.liters && newRefueling.pricePerLiter ? (
                <FieldGroup className="col-span-2">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">
                      {((newRefueling.liters || 0) * (newRefueling.pricePerLiter || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                </FieldGroup>
              ) : null}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddRefueling}>Registrar Abastecimento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={refuelings}
        searchKey="station"
        searchPlaceholder="Buscar por posto..."
      />
    </div>
  )
}
