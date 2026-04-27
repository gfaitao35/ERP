"use client"

import { useState } from "react"
import { useERPData } from "@/contexts/erp-data-context"
import { PageHeader } from "@/components/erp/page-header"
import { SimpleDataTable } from "@/components/erp/simple-data-table"
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
import {
  Plus,
  Package,
  Search,
  Filter,
  Download,
  Upload,
  Barcode,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Product } from "@/types/erp"

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useERPData()

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    unit: "UN",
    costPrice: 0,
    salePrice: 0,
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    location: "",
    isActive: true,
  })

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ]

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.sku.toLowerCase().includes(search) ||
      (product.barcode || "").toLowerCase().includes(search)

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.sku || (newProduct.salePrice ?? 0) <= 0) {
      alert("Preencha nome, SKU e preço de venda válido.")
      return
    }

    addProduct({
      ...newProduct,
      id: `PROD-${Date.now()}`,
      tenantId: "tenant-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Product)

    setNewProduct({
      name: "",
      sku: "",
      barcode: "",
      category: "",
      unit: "UN",
      costPrice: 0,
      salePrice: 0,
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      location: "",
      isActive: true,
    })

    setIsDialogOpen(false)
  }

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= 0) {
      return { label: "Sem Estoque", variant: "destructive" as const }
    }
    if (product.currentStock <= product.minStock) {
      return { label: "Estoque Baixo", variant: "outline" as const }
    }
    if (product.currentStock >= product.maxStock) {
      return { label: "Estoque Alto", variant: "secondary" as const }
    }
    return { label: "Normal", variant: "default" as const }
  }

  const columns = [
    {
      key: "sku",
      label: "SKU",
      render: (value: string) => (
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: "name",
      label: "Produto",
      render: (value: string, row: Product) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.category}</p>
        </div>
      ),
    },
    {
      key: "currentStock",
      label: "Estoque",
      render: (value: number, row: Product) => {
        const status = getStockStatus(row)
        return (
          <div className="flex items-center gap-2">
            <span>
              {value} {row.unit}
            </span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        )
      },
    },
    {
      key: "costPrice",
      label: "Custo",
      render: (value: number) =>
        value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
    },
    {
      key: "salePrice",
      label: "Venda",
      render: (value: number) =>
        value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
    },
    {
      key: "margin",
      label: "Margem",
      render: (_: unknown, row: Product) => {
        const margin =
          row.salePrice > 0
            ? ((row.salePrice - row.costPrice) / row.salePrice) * 100
            : 0

        return (
          <span
            className={
              margin >= 30
                ? "text-green-600"
                : margin >= 15
                ? "text-yellow-600"
                : "text-red-600"
            }
          >
            {margin.toFixed(1)}%
          </span>
        )
      },
    },
    {
      key: "location",
      label: "Localização",
      render: (value: string) => value || "-",
    },
    {
      key: "actions",
      label: "",
      render: (_: unknown, row: Product) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                setEditingProduct(row)
                setIsEditOpen(true)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (confirm(`Excluir produto "${row.name}"?`)) {
                  deleteProduct(row.id)
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Cadastro e gerenciamento de produtos"
        icon={<Package className="h-6 w-6" />}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>

            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Produto
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Produto</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Nome</FieldLabel>
                      <Input
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            name: e.target.value,
                          })
                        }
                      />
                    </Field>
                  </FieldGroup>

                  <FieldGroup>
                    <Field>
                      <FieldLabel>SKU</FieldLabel>
                      <Input
                        value={newProduct.sku}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            sku: e.target.value,
                          })
                        }
                      />
                    </Field>
                  </FieldGroup>

                  <FieldGroup>
                    <Field>
                      <FieldLabel>Preço Venda</FieldLabel>
                      <Input
                        type="number"
                        value={newProduct.salePrice}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            salePrice: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </Field>
                  </FieldGroup>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddProduct}>Salvar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="flex gap-4">
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SimpleDataTable data={filteredProducts} columns={columns} />

      {editingProduct && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>

            <Input
              value={editingProduct.name}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  name: e.target.value,
                })
              }
            />

            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={editingProduct.isActive}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    isActive: e.target.checked,
                  })
                }
              />
              <span>Ativo</span>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button
                onClick={() => {
                  updateProduct({
                    ...editingProduct,
                    updatedAt: new Date().toISOString(),
                  })
                  setIsEditOpen(false)
                }}
              >
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}