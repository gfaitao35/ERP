"use client"

import { useState, useMemo } from "react"
import { useERPData } from "@/contexts/erp-data-context"
import { PageHeader } from "@/components/erp/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Package,
  Save,
  RotateCcw,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/erp"

interface CountItem {
  productId: string
  expectedQty: number
  countedQty: number | null
  difference: number | null
  notes: string
  status: "pending" | "counted" | "adjusted"
}

interface InventoryCount {
  id: string
  name: string
  createdAt: Date
  closedAt: Date | null
  status: "open" | "closed"
  items: CountItem[]
  notes: string
}

function getStoredCounts(): InventoryCount[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("erp_inventory_counts") || "[]")
  } catch { return [] }
}
function saveCounts(counts: InventoryCount[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("erp_inventory_counts", JSON.stringify(counts))
}

export default function InventoryPage() {
  const { products, addStockMovement, updateProduct } = useERPData()
  const [counts, setCounts] = useState<InventoryCount[]>(getStoredCounts)
  const [activeCountId, setActiveCountId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isNewCountOpen, setIsNewCountOpen] = useState(false)
  const [newCountName, setNewCountName] = useState("")
  const [newCountNotes, setNewCountNotes] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isSaving, setIsSaving] = useState(false)

  const activeCount = counts.find((c) => c.id === activeCountId) ?? null
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean) as string[])]

  const activeItems = useMemo(() => {
    if (!activeCount) return []
    return activeCount.items.filter((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return false
      const matchSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = statusFilter === "all" || item.status === statusFilter
      const matchCategory = categoryFilter === "all" || product.category === categoryFilter
      return matchSearch && matchStatus && matchCategory
    })
  }, [activeCount, products, searchTerm, statusFilter, categoryFilter])

  const stats = useMemo(() => {
    if (!activeCount) return null
    const total = activeCount.items.length
    const counted = activeCount.items.filter((i) => i.status !== "pending").length
    const withDiff = activeCount.items.filter((i) => i.difference !== null && i.difference !== 0).length
    const totalDiffValue = activeCount.items.reduce((sum, item) => {
      if (item.difference === null) return sum
      const product = products.find((p) => p.id === item.productId)
      return sum + (item.difference * (product?.costPrice || 0))
    }, 0)
    return { total, counted, withDiff, totalDiffValue, progress: total > 0 ? (counted / total) * 100 : 0 }
  }, [activeCount, products])

  function createCount() {
    if (!newCountName.trim()) return
    const count: InventoryCount = {
      id: `INV-${Date.now()}`,
      name: newCountName.trim(),
      createdAt: new Date(),
      closedAt: null,
      status: "open",
      notes: newCountNotes,
      items: products.filter((p) => p.isActive).map((p) => ({
        productId: p.id,
        expectedQty: p.currentStock,
        countedQty: null,
        difference: null,
        notes: "",
        status: "pending" as const,
      })),
    }
    const updated = [count, ...counts]
    setCounts(updated)
    saveCounts(updated)
    setActiveCountId(count.id)
    setNewCountName("")
    setNewCountNotes("")
    setIsNewCountOpen(false)
  }

  function updateItemCount(productId: string, countedQty: number) {
    if (!activeCount) return
    const expectedItem = activeCount.items.find((i) => i.productId === productId)
    const expected = expectedItem?.expectedQty ?? 0
    const diff = countedQty - expected
    const updated = counts.map((c) => {
      if (c.id !== activeCount.id) return c
      return {
        ...c,
        items: c.items.map((i) =>
          i.productId === productId
            ? { ...i, countedQty, difference: diff, status: "counted" as const }
            : i
        ),
      }
    })
    setCounts(updated)
    saveCounts(updated)
  }

  function updateItemNotes(productId: string, notes: string) {
    if (!activeCount) return
    const updated = counts.map((c) => {
      if (c.id !== activeCount.id) return c
      return { ...c, items: c.items.map((i) => i.productId === productId ? { ...i, notes } : i) }
    })
    setCounts(updated)
    saveCounts(updated)
  }

  function applyAdjustments() {
    if (!activeCount) return
    setIsSaving(true)
    const itemsWithDiff = activeCount.items.filter(
      (i) => i.countedQty !== null && i.difference !== 0 && i.difference !== null
    )

    itemsWithDiff.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product || item.difference === null) return

      addStockMovement({
        id: `MOV-INV-${Date.now()}-${item.productId}`,
        tenantId: "tenant-1",
        productId: item.productId,
        warehouseId: "WH-DEFAULT",
        type: "adjustment",
        quantity: Math.abs(item.difference),
        unitCost: product.costPrice,
        totalCost: Math.abs(item.difference) * product.costPrice,
        reference: activeCount.id,
        referenceType: "manual",
        notes: `Ajuste de inventário: ${activeCount.name}. ${item.notes}`,
        createdBy: "user-1",
        createdAt: new Date(),
      })

      updateProduct({
        ...product,
        currentStock: item.countedQty!,
        updatedAt: new Date(),
      })
    })

    // Fecha o inventário e marca itens como adjusted
    const updated = counts.map((c) => {
      if (c.id !== activeCount.id) return c
      return {
        ...c,
        status: "closed" as const,
        closedAt: new Date(),
        items: c.items.map((i) =>
          i.countedQty !== null ? { ...i, status: "adjusted" as const } : i
        ),
      }
    })
    setCounts(updated)
    saveCounts(updated)
    setActiveCountId(null)
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventário"
        description="Contagem física e ajuste de estoque"
        icon={<ClipboardList className="h-6 w-6" />}
        actions={
          <Dialog open={isNewCountOpen} onOpenChange={setIsNewCountOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Contagem
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Contagem de Inventário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Nome da Contagem *</FieldLabel>
                    <Input
                      value={newCountName}
                      onChange={(e) => setNewCountName(e.target.value)}
                      placeholder="Ex: Inventário Mensal Abril 2026"
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel>Observações</FieldLabel>
                    <Textarea
                      value={newCountNotes}
                      onChange={(e) => setNewCountNotes(e.target.value)}
                      placeholder="Detalhes sobre esta contagem…"
                      rows={3}
                    />
                  </Field>
                </FieldGroup>
                <p className="text-sm text-muted-foreground">
                  Serão incluídos <strong>{products.filter((p) => p.isActive).length} produtos ativos</strong> nesta contagem.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewCountOpen(false)}>Cancelar</Button>
                <Button onClick={createCount} disabled={!newCountName.trim()}>
                  Criar Contagem
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Lista de contagens anteriores (quando nenhuma está ativa) */}
      {!activeCount && (
        <>
          {counts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <div className="rounded-full bg-muted p-6">
                  <ClipboardList className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-lg">Nenhuma contagem realizada</p>
                  <p className="text-sm text-muted-foreground">Crie uma nova contagem de inventário para começar</p>
                </div>
                <Button onClick={() => setIsNewCountOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Contagem
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Histórico de Contagens</h2>
              {counts.map((count) => {
                const counted = count.items.filter((i) => i.status !== "pending").length
                const withDiff = count.items.filter((i) => i.difference !== null && i.difference !== 0).length
                return (
                  <Card key={count.id} className={cn("cursor-pointer hover:border-primary/50 transition-colors", count.status === "open" && "border-primary/30 bg-primary/5")}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold truncate">{count.name}</p>
                            <Badge variant={count.status === "open" ? "default" : "secondary"}>
                              {count.status === "open" ? "Aberta" : "Fechada"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Criada em {new Date(count.createdAt).toLocaleDateString("pt-BR")}
                            {count.closedAt && ` · Fechada em ${new Date(count.closedAt).toLocaleDateString("pt-BR")}`}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span><span className="font-medium">{counted}</span>/{count.items.length} contados</span>
                            {withDiff > 0 && <span className="text-amber-600"><span className="font-medium">{withDiff}</span> com divergência</span>}
                          </div>
                          {count.status === "open" && <Progress value={(counted / count.items.length) * 100} className="mt-2 h-1.5" />}
                        </div>
                        <div className="flex gap-2">
                          {count.status === "open" && (
                            <Button size="sm" onClick={() => setActiveCountId(count.id)}>
                              Continuar
                            </Button>
                          )}
                          {count.status === "closed" && (
                            <Button variant="outline" size="sm" onClick={() => setActiveCountId(count.id)}>
                              Ver
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Contagem ativa */}
      {activeCount && (
        <div className="space-y-4">
          {/* Header da contagem */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{activeCount.name}</CardTitle>
                  <CardDescription>
                    Criada em {new Date(activeCount.createdAt).toLocaleDateString("pt-BR")}
                    {activeCount.status === "closed" && " · FECHADA"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveCountId(null)}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  {activeCount.status === "open" && stats && stats.counted > 0 && (
                    <Button size="sm" onClick={applyAdjustments} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      Aplicar Ajustes e Fechar
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            {stats && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total de Itens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.counted}</p>
                    <p className="text-xs text-muted-foreground">Contados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{stats.withDiff}</p>
                    <p className="text-xs text-muted-foreground">Com Divergência</p>
                  </div>
                  <div className="text-center">
                    <p className={cn("text-2xl font-bold", stats.totalDiffValue >= 0 ? "text-green-600" : "text-red-600")}>
                      {stats.totalDiffValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL", notation: "compact" })}
                    </p>
                    <p className="text-xs text-muted-foreground">Valor da Diferença</p>
                  </div>
                </div>
                <Progress value={stats.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1 text-right">{stats.progress.toFixed(0)}% concluído</p>
              </CardContent>
            )}
          </Card>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto ou SKU…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="counted">Contados</SelectItem>
                <SelectItem value="adjusted">Ajustados</SelectItem>
              </SelectContent>
            </Select>
            {categories.length > 0 && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-44">
                  <Package className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Lista de itens */}
          <div className="space-y-2">
            {activeItems.length === 0 && (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum item encontrado com os filtros aplicados</CardContent></Card>
            )}
            {activeItems.map((item) => {
              const product = products.find((p) => p.id === item.productId)
              if (!product) return null
              const hasDiff = item.difference !== null && item.difference !== 0
              return (
                <Card
                  key={item.productId}
                  className={cn(
                    "transition-colors",
                    item.status === "pending" && "border-muted",
                    item.status === "counted" && hasDiff && "border-amber-500/50 bg-amber-500/5",
                    item.status === "counted" && !hasDiff && "border-green-500/30 bg-green-500/5",
                    item.status === "adjusted" && "border-blue-500/30 bg-blue-500/5 opacity-70",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start gap-4">
                      {/* Info do produto */}
                      <div className="flex-1 min-w-[180px]">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{product.name}</p>
                          {item.status === "pending" && <Badge variant="outline" className="text-xs">Pendente</Badge>}
                          {item.status === "counted" && !hasDiff && <Badge variant="default" className="text-xs bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />OK</Badge>}
                          {item.status === "counted" && hasDiff && <Badge variant="outline" className="text-xs border-amber-500 text-amber-600"><AlertTriangle className="h-3 w-3 mr-1" />Divergência</Badge>}
                          {item.status === "adjusted" && <Badge variant="secondary" className="text-xs">Ajustado</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                        {product.category && <p className="text-xs text-muted-foreground">{product.category}</p>}
                      </div>

                      {/* Estoque esperado */}
                      <div className="text-center min-w-[80px]">
                        <p className="text-xs text-muted-foreground mb-1">Esperado</p>
                        <p className="text-lg font-bold">{item.expectedQty}</p>
                        <p className="text-xs text-muted-foreground">{product.unit}</p>
                      </div>

                      {/* Input de contagem */}
                      <div className="min-w-[120px]">
                        <p className="text-xs text-muted-foreground mb-1">Contado</p>
                        <Input
                          type="number"
                          min="0"
                          disabled={activeCount.status === "closed"}
                          value={item.countedQty ?? ""}
                          onChange={(e) => updateItemCount(item.productId, parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className={cn(
                            "w-28 text-center font-semibold",
                            hasDiff && "border-amber-500 focus-visible:ring-amber-500"
                          )}
                        />
                      </div>

                      {/* Diferença */}
                      <div className="text-center min-w-[80px]">
                        <p className="text-xs text-muted-foreground mb-1">Diferença</p>
                        {item.difference !== null ? (
                          <div className="flex items-center justify-center gap-1">
                            {item.difference > 0 && <TrendingUp className="h-4 w-4 text-green-600" />}
                            {item.difference < 0 && <TrendingDown className="h-4 w-4 text-red-600" />}
                            {item.difference === 0 && <Minus className="h-4 w-4 text-muted-foreground" />}
                            <span className={cn(
                              "text-lg font-bold",
                              item.difference > 0 && "text-green-600",
                              item.difference < 0 && "text-red-600",
                              item.difference === 0 && "text-muted-foreground",
                            )}>
                              {item.difference > 0 ? "+" : ""}{item.difference}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                        {hasDiff && item.difference !== null && (
                          <p className={cn("text-xs", item.difference > 0 ? "text-green-600" : "text-red-600")}>
                            {(item.difference * product.costPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </p>
                        )}
                      </div>

                      {/* Observações */}
                      {activeCount.status === "open" && (
                        <div className="w-full sm:w-48">
                          <Input
                            value={item.notes}
                            onChange={(e) => updateItemNotes(item.productId, e.target.value)}
                            placeholder="Observação…"
                            className="text-xs"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Resumo de divergências */}
          {activeCount.status === "open" && stats && stats.withDiff > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  Resumo de Divergências
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeCount.items
                    .filter((i) => i.difference !== null && i.difference !== 0)
                    .map((item) => {
                      const product = products.find((p) => p.id === item.productId)
                      if (!product) return null
                      return (
                        <div key={item.productId} className="flex items-center justify-between text-sm rounded-lg bg-muted/50 px-3 py-2">
                          <span className="font-medium">{product.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground">{item.expectedQty} → {item.countedQty}</span>
                            <span className={cn("font-semibold", (item.difference || 0) > 0 ? "text-green-600" : "text-red-600")}>
                              {(item.difference || 0) > 0 ? "+" : ""}{item.difference}
                            </span>
                            <span className={cn("text-xs", (item.difference || 0) > 0 ? "text-green-600" : "text-red-600")}>
                              {((item.difference || 0) * product.costPrice).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}