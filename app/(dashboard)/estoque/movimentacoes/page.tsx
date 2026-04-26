"use client"

import { useState } from "react"
import { useERPData } from "@/contexts/erp-data-context"
import { PageHeader } from "@/components/erp/page-header"
import { DataTable } from "@/components/erp/data-table"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  ArrowUpDown,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Truck,
} from "lucide-react"
import type { StockMovement } from "@/types/erp"

export default function StockMovementsPage() {
  const { stockMovements, products, addStockMovement } = useERPData()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMovement, setNewMovement] = useState<Partial<StockMovement>>({
    productId: "",
    type: "entry",
    quantity: 0,
    unitCost: 0,
    reason: "",
    notes: "",
  })

  const filteredMovements = stockMovements.filter((movement) => {
    const product = products.find((p) => p.id === movement.productId)
    const matchesSearch =
      product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || movement.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleAddMovement = () => {
    if (newMovement.productId && newMovement.quantity) {
      addStockMovement({
        ...newMovement,
        id: `MOV-${Date.now()}`,
        tenantId: "tenant-1",
        date: new Date().toISOString(),
        userId: "user-1",
        totalCost: (newMovement.quantity || 0) * (newMovement.unitCost || 0),
        createdAt: new Date().toISOString(),
      } as StockMovement)
      setNewMovement({
        productId: "",
        type: "entry",
        quantity: 0,
        unitCost: 0,
        reason: "",
        notes: "",
      })
      setIsDialogOpen(false)
    }
  }

  const getTypeIcon = (type: StockMovement["type"]) => {
    switch (type) {
      case "entry":
        return <ArrowDownLeft className="h-4 w-4 text-success" />
      case "exit":
        return <ArrowUpRight className="h-4 w-4 text-destructive" />
      case "adjustment":
        return <RefreshCw className="h-4 w-4 text-warning" />
      case "transfer":
        return <Truck className="h-4 w-4 text-info" />
    }
  }

  const getTypeLabel = (type: StockMovement["type"]) => {
    const labels = {
      entry: "Entrada",
      exit: "Saída",
      adjustment: "Ajuste",
      transfer: "Transferência",
    }
    return labels[type]
  }

  const columns = [
    {
      key: "date",
      label: "Data",
      sortable: true,
      render: (value: string) =>
        new Date(value).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    {
      key: "type",
      label: "Tipo",
      sortable: true,
      render: (value: StockMovement["type"]) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(value)}
          <Badge
            variant={
              value === "entry"
                ? "default"
                : value === "exit"
                  ? "destructive"
                  : "secondary"
            }
          >
            {getTypeLabel(value)}
          </Badge>
        </div>
      ),
    },
    {
      key: "productId",
      label: "Produto",
      render: (value: string) => {
        const product = products.find((p) => p.id === value)
        return (
          <div>
            <p className="font-medium">{product?.name || "Produto não encontrado"}</p>
            <p className="text-xs text-muted-foreground">{product?.sku}</p>
          </div>
        )
      },
    },
    {
      key: "quantity",
      label: "Quantidade",
      sortable: true,
      render: (value: number, row: StockMovement) => {
        const product = products.find((p) => p.id === row.productId)
        const isPositive = row.type === "entry"
        return (
          <span className={isPositive ? "text-success" : "text-destructive"}>
            {isPositive ? "+" : "-"}
            {value} {product?.unit || "UN"}
          </span>
        )
      },
    },
    {
      key: "unitCost",
      label: "Custo Unit.",
      render: (value: number) =>
        value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
    {
      key: "totalCost",
      label: "Custo Total",
      sortable: true,
      render: (value: number) =>
        value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
    {
      key: "reason",
      label: "Motivo",
      render: (value: string) => value || "-",
    },
    {
      key: "documentNumber",
      label: "Documento",
      render: (value: string) =>
        value ? (
          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{value}</span>
        ) : (
          "-"
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimentações de Estoque"
        description="Histórico de entradas, saídas e ajustes"
        icon={<ArrowUpDown className="h-6 w-6" />}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Movimentação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Tipo de Movimentação</FieldLabel>
                    <Select
                      value={newMovement.type}
                      onValueChange={(value) =>
                        setNewMovement({ ...newMovement, type: value as StockMovement["type"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entrada</SelectItem>
                        <SelectItem value="exit">Saída</SelectItem>
                        <SelectItem value="adjustment">Ajuste</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Produto</FieldLabel>
                    <Select
                      value={newMovement.productId}
                      onValueChange={(value) => setNewMovement({ ...newMovement, productId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Quantidade</FieldLabel>
                      <Input
                        type="number"
                        value={newMovement.quantity}
                        onChange={(e) =>
                          setNewMovement({
                            ...newMovement,
                            quantity: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Custo Unitário</FieldLabel>
                      <Input
                        type="number"
                        step="0.01"
                        value={newMovement.unitCost}
                        onChange={(e) =>
                          setNewMovement({
                            ...newMovement,
                            unitCost: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0,00"
                      />
                    </Field>
                  </FieldGroup>
                </div>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Motivo</FieldLabel>
                    <Input
                      value={newMovement.reason}
                      onChange={(e) => setNewMovement({ ...newMovement, reason: e.target.value })}
                      placeholder="Ex: Compra, Venda, Ajuste de inventário..."
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Observações</FieldLabel>
                    <Textarea
                      value={newMovement.notes}
                      onChange={(e) => setNewMovement({ ...newMovement, notes: e.target.value })}
                      placeholder="Informações adicionais..."
                      rows={3}
                    />
                  </Field>
                </FieldGroup>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddMovement}>Registrar Movimentação</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por produto ou documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="entry">Entradas</SelectItem>
            <SelectItem value="exit">Saídas</SelectItem>
            <SelectItem value="adjustment">Ajustes</SelectItem>
            <SelectItem value="transfer">Transferências</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filteredMovements} columns={columns} searchable={false} />
    </div>
  )
}
