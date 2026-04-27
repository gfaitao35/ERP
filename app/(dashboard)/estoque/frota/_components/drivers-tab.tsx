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
import { Plus, Users, MoreHorizontal, AlertTriangle } from "lucide-react"
import type { Driver } from "@/types/erp"

export function DriversTab() {
  const { drivers, addDriver } = useERPData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({
    name: "",
    document: "",
    cnh: "",
    cnhCategory: "B",
    cnhExpiration: new Date(),
    phone: "",
    email: "",
    isActive: true,
  })

  const handleAddDriver = () => {
    if (newDriver.name && newDriver.document && newDriver.cnh) {
      addDriver({
        ...newDriver,
        id: `DRV-${Date.now()}`,
        tenantId: "tenant-1",
        cnhExpiration: new Date(newDriver.cnhExpiration || Date.now()),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Driver)
      setNewDriver({
        name: "",
        document: "",
        cnh: "",
        cnhCategory: "B",
        cnhExpiration: new Date(),
        phone: "",
        email: "",
        isActive: true,
      })
      setIsDialogOpen(false)
    }
  }

  const isCnhExpiringSoon = (expirationDate: Date) => {
    const today = new Date()
    const expDate = new Date(expirationDate)
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  const isCnhExpired = (expirationDate: Date) => {
    return new Date(expirationDate) < new Date()
  }

  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nome" />
      ),
      cell: ({ row }) => {
        const driver = row.original
        return (
          <div>
            <p className="font-medium">{driver.name}</p>
            <p className="text-xs text-muted-foreground">CPF: {driver.document}</p>
          </div>
        )
      },
    },
    {
      accessorKey: "cnh",
      header: "CNH",
      cell: ({ row }) => {
        const driver = row.original
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{driver.cnh}</span>
            <Badge variant="outline" className="text-xs">
              Cat. {driver.cnhCategory}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "cnhExpiration",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Validade CNH" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("cnhExpiration"))
        const expired = isCnhExpired(date)
        const expiringSoon = isCnhExpiringSoon(date)
        
        return (
          <div className="flex items-center gap-2">
            <span className={expired ? "text-destructive" : expiringSoon ? "text-amber-600" : ""}>
              {date.toLocaleDateString("pt-BR")}
            </span>
            {expired && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Vencida
              </Badge>
            )}
            {!expired && expiringSoon && (
              <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Vence em breve
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ row }) => row.getValue("phone") || "-",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.getValue("email") || "-",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Ativo" : "Inativo"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const driver = row.original
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
              <DropdownMenuItem>Atribuir veículo</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                {driver.isActive ? "Desativar" : "Ativar"}
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
              Novo Motorista
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cadastrar Motorista
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <FieldGroup className="col-span-2">
                <Field>
                  <FieldLabel>Nome Completo *</FieldLabel>
                  <Input
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    placeholder="Nome do motorista"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>CPF *</FieldLabel>
                  <Input
                    value={newDriver.document}
                    onChange={(e) => setNewDriver({ ...newDriver, document: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Número da CNH *</FieldLabel>
                  <Input
                    value={newDriver.cnh}
                    onChange={(e) => setNewDriver({ ...newDriver, cnh: e.target.value })}
                    placeholder="00000000000"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Categoria CNH</FieldLabel>
                  <Select
                    value={newDriver.cnhCategory}
                    onValueChange={(value) => setNewDriver({ ...newDriver, cnhCategory: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - Motos</SelectItem>
                      <SelectItem value="B">B - Carros</SelectItem>
                      <SelectItem value="AB">AB - Motos e Carros</SelectItem>
                      <SelectItem value="C">C - Caminhões</SelectItem>
                      <SelectItem value="D">D - Ônibus</SelectItem>
                      <SelectItem value="E">E - Carretas</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Validade CNH</FieldLabel>
                  <Input
                    type="date"
                    value={newDriver.cnhExpiration instanceof Date 
                      ? newDriver.cnhExpiration.toISOString().split("T")[0] 
                      : ""}
                    onChange={(e) => setNewDriver({ ...newDriver, cnhExpiration: new Date(e.target.value) })}
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Telefone</FieldLabel>
                  <Input
                    value={newDriver.phone || ""}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    value={newDriver.email || ""}
                    onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </Field>
              </FieldGroup>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddDriver}>Salvar Motorista</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={drivers}
        searchKey="name"
        searchPlaceholder="Buscar por nome..."
      />
    </div>
  )
}
