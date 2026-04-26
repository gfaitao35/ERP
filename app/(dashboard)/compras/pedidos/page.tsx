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
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
} from "lucide-react"
import type { PurchaseOrder, PurchaseOrderItem } from "@/types/erp"

export default function PurchaseOrdersPage() {
  const { purchaseOrders, suppliers, products, addPurchaseOrder } = useERPData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newOrder, setNewOrder] = useState<Partial<PurchaseOrder>>({
    supplierId: "",
    expectedDeliveryDate: "",
    notes: "",
    items: [],
  })
  const [newItem, setNewItem] = useState<Partial<PurchaseOrderItem>>({
    productId: "",
    quantity: 0,
    unitPrice: 0,
  })

  const filteredOrders = purchaseOrders.filter((order) => {
    const supplier = suppliers.find((s) => s.id === order.supplierId)
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddItem = () => {
    if (newItem.productId && newItem.quantity && newItem.unitPrice) {
      const product = products.find((p) => p.id === newItem.productId)
      const item: PurchaseOrderItem = {
        id: `ITEM-${Date.now()}`,
        productId: newItem.productId!,
        productName: product?.name || "",
        productSku: product?.sku || "",
        quantity: newItem.quantity,
        unitPrice: newItem.unitPrice,
        totalPrice: newItem.quantity * newItem.unitPrice,
        receivedQuantity: 0,
      }
      setNewOrder({
        ...newOrder,
        items: [...(newOrder.items || []), item],
      })
      setNewItem({ productId: "", quantity: 0, unitPrice: 0 })
    }
  }

  const handleRemoveItem = (itemId: string) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items?.filter((i) => i.id !== itemId),
    })
  }

  const handleAddOrder = () => {
    if (newOrder.supplierId && newOrder.items && newOrder.items.length > 0) {
      const totalAmount = newOrder.items.reduce((sum, item) => sum + item.totalPrice, 0)
      addPurchaseOrder({
        ...newOrder,
        id: `PO-${Date.now()}`,
        tenantId: "tenant-1",
        orderNumber: `PC-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(4, "0")}`,
        status: "draft",
        totalAmount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as PurchaseOrder)
      setNewOrder({
        supplierId: "",
        expectedDeliveryDate: "",
        notes: "",
        items: [],
      })
      setIsDialogOpen(false)
    }
  }

  const getStatusBadge = (status: PurchaseOrder["status"]) => {
    const config = {
      draft: { label: "Rascunho", variant: "secondary" as const, className: "" },
      pending: { label: "Pendente", variant: "outline" as const, className: "border-warning text-warning" },
      approved: { label: "Aprovado", variant: "default" as const, className: "bg-success text-success-foreground" },
      sent: { label: "Enviado", variant: "default" as const, className: "bg-info text-info-foreground" },
      partial: { label: "Parcial", variant: "secondary" as const, className: "" },
      received: { label: "Recebido", variant: "default" as const, className: "bg-success text-success-foreground" },
      cancelled: { label: "Cancelado", variant: "destructive" as const, className: "" },
    }
    const { label, variant, className } = config[status]
    return (
      <Badge variant={variant} className={className}>
        {label}
      </Badge>
    )
  }

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const columns = [
    {
      key: "orderNumber",
      label: "Número",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{value}</span>
      ),
    },
    {
      key: "supplierId",
      label: "Fornecedor",
      render: (value: string) => {
        const supplier = suppliers.find((s) => s.id === value)
        return (
          <div>
            <p className="font-medium">{supplier?.name || "Fornecedor não encontrado"}</p>
            <p className="text-xs text-muted-foreground">{supplier?.document}</p>
          </div>
        )
      },
    },
    {
      key: "items",
      label: "Itens",
      render: (value: PurchaseOrderItem[]) => (
        <span>{value?.length || 0} itens</span>
      ),
    },
    {
      key: "totalAmount",
      label: "Valor Total",
      sortable: true,
      render: (value: number) => <span className="font-medium">{formatCurrency(value)}</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: PurchaseOrder["status"]) => getStatusBadge(value),
    },
    {
      key: "expectedDeliveryDate",
      label: "Previsão",
      sortable: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString("pt-BR") : "-",
    },
    {
      key: "createdAt",
      label: "Criado em",
      sortable: true,
      render: (value: string) =>
        new Date(value).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    {
      key: "actions",
      label: "",
      render: (_: unknown, row: PurchaseOrder) => (
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const orderTotal = newOrder.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos de Compra"
        description="Gerenciamento de pedidos de compra"
        icon={<FileText className="h-6 w-6" />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Pedido de Compra</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  {/* Supplier and Delivery */}
                  <div className="grid grid-cols-2 gap-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Fornecedor</FieldLabel>
                        <Select
                          value={newOrder.supplierId}
                          onValueChange={(value) =>
                            setNewOrder({ ...newOrder, supplierId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um fornecedor" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers
                              .filter((s) => s.status === "active")
                              .map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </FieldGroup>
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Previsão de Entrega</FieldLabel>
                        <Input
                          type="date"
                          value={newOrder.expectedDeliveryDate}
                          onChange={(e) =>
                            setNewOrder({ ...newOrder, expectedDeliveryDate: e.target.value })
                          }
                        />
                      </Field>
                    </FieldGroup>
                  </div>

                  {/* Items Section */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-4">Itens do Pedido</h4>
                    
                    {/* Add Item Form */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <FieldGroup className="col-span-2">
                        <Field>
                          <FieldLabel>Produto</FieldLabel>
                          <Select
                            value={newItem.productId}
                            onValueChange={(value) =>
                              setNewItem({ ...newItem, productId: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
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
                      <FieldGroup>
                        <Field>
                          <FieldLabel>Quantidade</FieldLabel>
                          <Input
                            type="number"
                            value={newItem.quantity || ""}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                quantity: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="0"
                          />
                        </Field>
                      </FieldGroup>
                      <FieldGroup>
                        <Field>
                          <FieldLabel>Preço Unit.</FieldLabel>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={newItem.unitPrice || ""}
                              onChange={(e) =>
                                setNewItem({
                                  ...newItem,
                                  unitPrice: parseFloat(e.target.value) || 0,
                                })
                              }
                              placeholder="0,00"
                            />
                            <Button type="button" onClick={handleAddItem} size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </Field>
                      </FieldGroup>
                    </div>

                    {/* Items List */}
                    {newOrder.items && newOrder.items.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium">Produto</th>
                              <th className="px-4 py-2 text-right text-xs font-medium">Qtd</th>
                              <th className="px-4 py-2 text-right text-xs font-medium">Preço Unit.</th>
                              <th className="px-4 py-2 text-right text-xs font-medium">Total</th>
                              <th className="px-4 py-2 w-10"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {newOrder.items.map((item) => (
                              <tr key={item.id} className="border-t">
                                <td className="px-4 py-2">
                                  <p className="font-medium text-sm">{item.productName}</p>
                                  <p className="text-xs text-muted-foreground">{item.productSku}</p>
                                </td>
                                <td className="px-4 py-2 text-right text-sm">{item.quantity}</td>
                                <td className="px-4 py-2 text-right text-sm">
                                  {formatCurrency(item.unitPrice)}
                                </td>
                                <td className="px-4 py-2 text-right text-sm font-medium">
                                  {formatCurrency(item.totalPrice)}
                                </td>
                                <td className="px-4 py-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-muted/30">
                            <tr>
                              <td colSpan={3} className="px-4 py-2 text-right font-medium">
                                Total do Pedido:
                              </td>
                              <td className="px-4 py-2 text-right font-bold text-primary">
                                {formatCurrency(orderTotal)}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum item adicionado</p>
                      </div>
                    )}
                  </div>

                  <FieldGroup>
                    <Field>
                      <FieldLabel>Observações</FieldLabel>
                      <Textarea
                        value={newOrder.notes}
                        onChange={(e) =>
                          setNewOrder({ ...newOrder, notes: e.target.value })
                        }
                        placeholder="Observações adicionais..."
                        rows={3}
                      />
                    </Field>
                  </FieldGroup>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddOrder} disabled={!newOrder.items?.length}>
                    Criar Pedido
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="sent">Enviados</SelectItem>
            <SelectItem value="partial">Parcialmente Recebidos</SelectItem>
            <SelectItem value="received">Recebidos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={filteredOrders}
        columns={columns}
        searchable={false}
        onRowClick={(order) => console.log("Order clicked:", order)}
      />
    </div>
  )
}
