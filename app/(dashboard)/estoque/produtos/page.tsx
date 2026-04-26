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
import { Plus, Package, Search, Filter, Download, Upload, Barcode } from "lucide-react"
import type { Product } from "@/types/erp"

export default function ProductsPage() {
  const { products, addProduct } = useERPData()
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
    status: "active",
  })

  const categories = [...new Set(products.map((p) => p.category))]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.sku) {
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
        status: "active",
      })
      setIsDialogOpen(false)
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= 0) {
      return { label: "Sem Estoque", variant: "destructive" as const }
    }
    if (product.currentStock <= product.minStock) {
      return { label: "Estoque Baixo", variant: "warning" as const }
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
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{value}</span>
      ),
    },
    {
      key: "name",
      label: "Produto",
      sortable: true,
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
      sortable: true,
      render: (value: number, row: Product) => {
        const status = getStockStatus(row)
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {value} {row.unit}
            </span>
            <Badge
              variant={status.variant === "warning" ? "outline" : status.variant}
              className={status.variant === "warning" ? "border-warning text-warning" : ""}
            >
              {status.label}
            </Badge>
          </div>
        )
      },
    },
    {
      key: "costPrice",
      label: "Custo",
      sortable: true,
      render: (value: number) =>
        value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
    {
      key: "salePrice",
      label: "Venda",
      sortable: true,
      render: (value: number) =>
        value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
    },
    {
      key: "margin",
      label: "Margem",
      render: (_: unknown, row: Product) => {
        const margin = ((row.salePrice - row.costPrice) / row.salePrice) * 100
        return (
          <span className={margin >= 30 ? "text-success" : margin >= 15 ? "text-warning" : "text-destructive"}>
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
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Cadastro e gerenciamento de produtos"
        icon={<Package className="h-6 w-6" />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
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
                      <FieldLabel>Nome do Produto</FieldLabel>
                      <Input
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Nome do produto"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>SKU</FieldLabel>
                      <Input
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                        placeholder="Código SKU"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Código de Barras</FieldLabel>
                      <div className="relative">
                        <Input
                          value={newProduct.barcode}
                          onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                          placeholder="EAN/GTIN"
                          className="pr-10"
                        />
                        <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Categoria</FieldLabel>
                      <Input
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        placeholder="Categoria"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Unidade</FieldLabel>
                      <Select
                        value={newProduct.unit}
                        onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UN">Unidade (UN)</SelectItem>
                          <SelectItem value="KG">Quilograma (KG)</SelectItem>
                          <SelectItem value="L">Litro (L)</SelectItem>
                          <SelectItem value="M">Metro (M)</SelectItem>
                          <SelectItem value="CX">Caixa (CX)</SelectItem>
                          <SelectItem value="PCT">Pacote (PCT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Localização</FieldLabel>
                      <Input
                        value={newProduct.location}
                        onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                        placeholder="Ex: A1-P2-N3"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Preço de Custo</FieldLabel>
                      <Input
                        type="number"
                        step="0.01"
                        value={newProduct.costPrice}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="0,00"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Preço de Venda</FieldLabel>
                      <Input
                        type="number"
                        step="0.01"
                        value={newProduct.salePrice}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, salePrice: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="0,00"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Estoque Mínimo</FieldLabel>
                      <Input
                        type="number"
                        value={newProduct.minStock}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, minStock: parseInt(e.target.value) || 0 })
                        }
                        placeholder="0"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Estoque Máximo</FieldLabel>
                      <Input
                        type="number"
                        value={newProduct.maxStock}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, maxStock: parseInt(e.target.value) || 0 })
                        }
                        placeholder="0"
                      />
                    </Field>
                  </FieldGroup>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddProduct}>Salvar Produto</Button>
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
            placeholder="Buscar por nome, SKU ou código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={filteredProducts}
        columns={columns}
        searchable={false}
        onRowClick={(product) => console.log("Product clicked:", product)}
      />
    </div>
  )
}
