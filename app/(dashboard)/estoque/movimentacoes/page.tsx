"use client"

import { useState } from "react"
import { useERPData } from "@/contexts/erp-data-context"
import { PageHeader } from "@/components/erp/page-header"
import { SimpleDataTable } from "@/components/erp/simple-data-table"
import type { SimpleColumn } from "@/components/erp/simple-data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import type { StockMovement, MovementType } from "@/types/erp"

const typeConfig: Record<MovementType, { label: string; badgeVariant: "default" | "destructive" | "secondary" | "outline" }> = {
  entry:      { label: "Entrada",       badgeVariant: "default" },
  exit:       { label: "Saída",         badgeVariant: "destructive" },
  adjustment: { label: "Ajuste",        badgeVariant: "outline" },
  transfer:   { label: "Transferência", badgeVariant: "secondary" },
}

export default function StockMovementsPage() {
  const { stockMovements, products, addStockMovement, updateProduct } = useERPData()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMovement, setNewMovement] = useState<Partial<StockMovement>>({
    productId: "",
    warehouseId: "WH-DEFAULT",
    type: "entry",
    quantity: 0,
    unitCost: 0,
    notes: "",
  })

  const totalEntradas = stockMovements.filter((m) => m.type === "entry").reduce((s, m) => s + m.quantity, 0)
  const totalSaidas   = stockMovements.filter((m) => m.type === "exit").reduce((s, m) => s + m.quantity, 0)
  const totalValor    = stockMovements.reduce((s, m) => s + m.totalCost, 0)

  const filteredMovements = stockMovements.filter((movement) => {
    const product = products.find((p) => p.id === movement.productId)
    const matchesSearch =
      product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movement.reference ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || movement.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleAdd = () => {
    if (!newMovement.productId || !newMovement.quantity) return
    const totalCost = (newMovement.quantity || 0) * (newMovement.unitCost || 0)
    addStockMovement({
      ...newMovement,
      id: `MOV-${Date.now()}`,
      tenantId: "tenant-1",
      createdBy: "user-1",
      totalCost,
      createdAt: new Date(),
    } as StockMovement)

    const product = products.find((p) => p.id === newMovement.productId)
    if (product) {
      const delta =
        newMovement.type === "entry"       ?  (newMovement.quantity || 0)
        : newMovement.type === "exit"      ? -(newMovement.quantity || 0)
        : newMovement.type === "adjustment"?  (newMovement.quantity || 0)
        : 0
      updateProduct({ ...product, currentStock: Math.max(0, product.currentStock + delta), updatedAt: new Date() })
    }
    setNewMovement({ productId: "", warehouseId: "WH-DEFAULT", type: "entry", quantity: 0, unitCost: 0, notes: "" })
    setIsDialogOpen(false)
  }

  const selectedProduct = products.find((p) => p.id === newMovement.productId)
  const previewStock = selectedProduct
    ? newMovement.type === "entry"        ? selectedProduct.currentStock + (newMovement.quantity || 0)
    : newMovement.type === "exit"         ? selectedProduct.currentStock - (newMovement.quantity || 0)
    : newMovement.type === "adjustment"   ? selectedProduct.currentStock + (newMovement.quantity || 0)
    : selectedProduct.currentStock
    : 0

  const columns: SimpleColumn<StockMovement>[] = [
    {
      key: "createdAt",
      label: "Data/Hora",
      sortable: true,
      render: (value) =>
        new Date(value as Date).toLocaleDateString("pt-BR", {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        }),
    },
    {
      key: "type",
      label: "Tipo",
      sortable: true,
      render: (value) => {
        const type = value as MovementType
        const icons: Record<MovementType, React.ReactNode> = {
          entry:      <ArrowDownLeft className="h-4 w-4 text-green-500" />,
          exit:       <ArrowUpRight  className="h-4 w-4 text-red-500" />,
          adjustment: <RefreshCw     className="h-4 w-4 text-amber-500" />,
          transfer:   <Truck         className="h-4 w-4 text-blue-500" />,
        }
        return (
          <div className="flex items-center gap-2">
            {icons[type]}
            <Badge variant={typeConfig[type].badgeVariant}>{typeConfig[type].label}</Badge>
          </div>
        )
      },
    },
    {
      key: "productId",
      label: "Produto",
      render: (value) => {
        const product = products.find((p) => p.id === (value as string))
        return (
          <div>
            <p className="font-medium">{product?.name || "—"}</p>
            <p className="text-xs text-muted-foreground font-mono">{product?.sku}</p>
          </div>
        )
      },
    },
    {
      key: "quantity",
      label: "Quantidade",
      sortable: true,
      render: (value, row) => {
        const product = products.find((p) => p.id === row.productId)
        const isPositive = row.type === "entry" || row.type === "adjustment"
        return (
          <span className={isPositive ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
            {isPositive ? "+" : "-"}{value as number} {product?.unit || "UN"}
          </span>
        )
      },
    },
    {
      key: "unitCost",
      label: "Custo Unit.",
      render: (value) =>
        (value as number) > 0
          ? (value as number).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "—",
    },
    {
      key: "totalCost",
      label: "Custo Total",
      sortable: true,
      render: (value) =>
        (value as number) > 0
          ? (value as number).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : "—",
    },
    {
      key: "reference",
      label: "Referência",
      render: (value) =>
        value ? <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{value as string}</span> : "—",
    },
    {
      key: "notes",
      label: "Observações",
      render: (value) => <span className="text-sm text-muted-foreground">{(value as string) || "—"}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimentações de Estoque"
        description="Histórico de entradas, saídas, ajustes e transferências"
        icon={<ArrowUpDown className="h-6 w-6" />}
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
                <DialogDescription>Registre uma entrada, saída, ajuste ou transferência</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Tipo *</FieldLabel>
                    <Select
                      value={newMovement.type}
                      onValueChange={(v) => setNewMovement({ ...newMovement, type: v as MovementType })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">📥 Entrada</SelectItem>
                        <SelectItem value="exit">📤 Saída</SelectItem>
                        <SelectItem value="adjustment">🔄 Ajuste</SelectItem>
                        <SelectItem value="transfer">🚚 Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Produto *</FieldLabel>
                    <Select
                      value={newMovement.productId}
                      onValueChange={(v) => {
                        const prod = products.find((p) => p.id === v)
                        setNewMovement({ ...newMovement, productId: v, unitCost: prod?.costPrice || 0 })
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Selecione um produto" /></SelectTrigger>
                      <SelectContent>
                        {products.filter((p) => p.isActive).map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.sku}) — {p.currentStock} {p.unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Quantidade *</FieldLabel>
                      <Input
                        type="number" min="1"
                        value={newMovement.quantity || ""}
                        onChange={(e) => setNewMovement({ ...newMovement, quantity: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Custo Unitário</FieldLabel>
                      <Input
                        type="number" step="0.01" min="0"
                        value={newMovement.unitCost || ""}
                        onChange={(e) => setNewMovement({ ...newMovement, unitCost: parseFloat(e.target.value) || 0 })}
                        placeholder="0,00"
                      />
                    </Field>
                  </FieldGroup>
                </div>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Referência / Documento</FieldLabel>
                    <Input
                      value={newMovement.reference || ""}
                      onChange={(e) => setNewMovement({ ...newMovement, reference: e.target.value })}
                      placeholder="NF-001, PO-123…"
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Observações</FieldLabel>
                    <Textarea
                      value={newMovement.notes || ""}
                      onChange={(e) => setNewMovement({ ...newMovement, notes: e.target.value })}
                      rows={2}
                    />
                  </Field>
                </FieldGroup>
                {selectedProduct && (newMovement.quantity || 0) > 0 && (
                  <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                    <p className="text-muted-foreground font-medium">Prévia:</p>
                    <p>Custo total: <span className="font-semibold">{((newMovement.quantity || 0) * (newMovement.unitCost || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></p>
                    <p className={previewStock < selectedProduct.minStock ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                      Estoque resultante: {previewStock} {selectedProduct.unit}
                      {previewStock < selectedProduct.minStock && " ⚠️ Abaixo do mínimo!"}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAdd} disabled={!newMovement.productId || !newMovement.quantity}>
                  Registrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg p-2 bg-green-500/10"><TrendingUp className="h-5 w-5 text-green-500" /></div>
          <div><p className="text-sm text-muted-foreground">Total Entradas</p><p className="text-xl font-bold text-green-600">{totalEntradas.toLocaleString("pt-BR")} un</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg p-2 bg-red-500/10"><TrendingDown className="h-5 w-5 text-red-500" /></div>
          <div><p className="text-sm text-muted-foreground">Total Saídas</p><p className="text-xl font-bold text-red-600">{totalSaidas.toLocaleString("pt-BR")} un</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg p-2 bg-blue-500/10"><ArrowUpDown className="h-5 w-5 text-blue-500" /></div>
          <div><p className="text-sm text-muted-foreground">Valor Movimentado</p><p className="text-xl font-bold">{totalValor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", notation: "compact" })}</p></div>
        </CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por produto, SKU ou referência…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="entry">Entradas</SelectItem>
            <SelectItem value="exit">Saídas</SelectItem>
            <SelectItem value="adjustment">Ajustes</SelectItem>
            <SelectItem value="transfer">Transferências</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SimpleDataTable data={filteredMovements} columns={columns} />
    </div>
  )
}