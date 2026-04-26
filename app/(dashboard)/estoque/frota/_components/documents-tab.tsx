"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useERPData } from "@/contexts/erp-data-context"
import { DataTable, DataTableColumnHeader } from "@/components/erp/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Plus, FileText, AlertTriangle, Clock, MoreHorizontal } from "lucide-react"
import type { VehicleDocument, DocumentType } from "@/types/erp"

const documentTypeLabels: Record<DocumentType, string> = {
  ipva: "IPVA",
  licensing: "Licenciamento",
  insurance: "Seguro",
  inspection: "Inspeção Veicular",
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  paid: { label: "Pago", variant: "default" },
  overdue: { label: "Vencido", variant: "destructive" },
}

export function DocumentsTab() {
  const { vehicleDocuments, addVehicleDocument, vehicles } = useERPData()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newDocument, setNewDocument] = useState<Partial<VehicleDocument>>({
    vehicleId: "",
    type: "ipva",
    referenceYear: new Date().getFullYear(),
    amount: 0,
    dueDate: new Date(),
    status: "pending",
  })

  // Stats
  const pendingCount = vehicleDocuments.filter((d) => d.status === "pending").length
  const overdueCount = vehicleDocuments.filter((d) => d.status === "overdue").length
  const pendingAmount = vehicleDocuments
    .filter((d) => d.status === "pending" || d.status === "overdue")
    .reduce((sum, d) => sum + d.amount, 0)

  const handleAddDocument = () => {
    if (newDocument.vehicleId && newDocument.type) {
      addVehicleDocument({
        ...newDocument,
        id: `DOC-${Date.now()}`,
        tenantId: "tenant-1",
        dueDate: new Date(newDocument.dueDate || Date.now()),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as VehicleDocument)
      setNewDocument({
        vehicleId: "",
        type: "ipva",
        referenceYear: new Date().getFullYear(),
        amount: 0,
        dueDate: new Date(),
        status: "pending",
      })
      setIsDialogOpen(false)
    }
  }

  const columns: ColumnDef<VehicleDocument>[] = [
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
      cell: ({ row }) => (
        <Badge variant="outline">{documentTypeLabels[row.getValue("type") as DocumentType]}</Badge>
      ),
    },
    {
      accessorKey: "referenceYear",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ano Ref." />
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Valor" />
      ),
      cell: ({ row }) => (row.getValue("amount") as number).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vencimento" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("dueDate"))
        const doc = row.original
        const isOverdue = doc.status === "overdue"
        const isPending = doc.status === "pending"
        const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        return (
          <div className="flex items-center gap-2">
            <span className={isOverdue ? "text-destructive" : isPending && daysUntil <= 7 ? "text-amber-600" : ""}>
              {date.toLocaleDateString("pt-BR")}
            </span>
            {isPending && daysUntil <= 7 && daysUntil > 0 && (
              <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                {daysUntil} dias
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "paidDate",
      header: "Data Pgto",
      cell: ({ row }) => {
        const date = row.getValue("paidDate") as Date | undefined
        return date ? new Date(date).toLocaleDateString("pt-BR") : "-"
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const statusInfo = statusLabels[status]
        return <Badge variant={statusInfo?.variant || "outline"}>{statusInfo?.label || status}</Badge>
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
            <DropdownMenuItem>Marcar como pago</DropdownMenuItem>
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
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-500/10 p-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-xl font-bold text-destructive">{overdueCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor a Pagar</p>
                <p className="text-xl font-bold">
                  {pendingAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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
              Novo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cadastrar Documento
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <FieldGroup className="col-span-2">
                <Field>
                  <FieldLabel>Veículo *</FieldLabel>
                  <Select
                    value={newDocument.vehicleId}
                    onValueChange={(value) => setNewDocument({ ...newDocument, vehicleId: value })}
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
                  <FieldLabel>Tipo de Documento *</FieldLabel>
                  <Select
                    value={newDocument.type}
                    onValueChange={(value) => setNewDocument({ ...newDocument, type: value as DocumentType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(documentTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Ano Referência</FieldLabel>
                  <Input
                    type="number"
                    value={newDocument.referenceYear}
                    onChange={(e) => setNewDocument({ ...newDocument, referenceYear: parseInt(e.target.value) || 0 })}
                    placeholder="2024"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Valor</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={newDocument.amount || ""}
                    onChange={(e) => setNewDocument({ ...newDocument, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel>Data de Vencimento</FieldLabel>
                  <Input
                    type="date"
                    value={newDocument.dueDate instanceof Date 
                      ? newDocument.dueDate.toISOString().split("T")[0] 
                      : ""}
                    onChange={(e) => setNewDocument({ ...newDocument, dueDate: new Date(e.target.value) })}
                  />
                </Field>
              </FieldGroup>
              <FieldGroup className="col-span-2">
                <Field>
                  <FieldLabel>Número do Documento</FieldLabel>
                  <Input
                    value={newDocument.documentNumber || ""}
                    onChange={(e) => setNewDocument({ ...newDocument, documentNumber: e.target.value })}
                    placeholder="Número de referência"
                  />
                </Field>
              </FieldGroup>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddDocument}>Cadastrar Documento</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={vehicleDocuments}
      />
    </div>
  )
}
