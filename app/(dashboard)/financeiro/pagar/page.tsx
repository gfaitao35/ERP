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
  ArrowUpRight,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
} from "lucide-react"
import type { AccountPayable } from "@/types/erp"

export default function AccountsPayablePage() {
  const { accountsPayable, suppliers, addAccountPayable } = useERPData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPayable, setNewPayable] = useState<Partial<AccountPayable>>({
    supplierId: "",
    description: "",
    amount: 0,
    dueDate: "",
    category: "",
    paymentMethod: "boleto",
    notes: "",
  })

  const filteredPayables = accountsPayable.filter((ap) => {
    const supplier = suppliers.find((s) => s.id === ap.supplierId)
    const matchesSearch =
      supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ap.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || ap.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddPayable = () => {
    if (newPayable.supplierId && newPayable.amount && newPayable.dueDate) {
      addAccountPayable({
        ...newPayable,
        id: `AP-${Date.now()}`,
        tenantId: "tenant-1",
        documentNumber: `DOC-${Date.now().toString().slice(-6)}`,
        issueDate: new Date().toISOString().split("T")[0],
        amountPaid: 0,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as AccountPayable)
      setNewPayable({
        supplierId: "",
        description: "",
        amount: 0,
        dueDate: "",
        category: "",
        paymentMethod: "boleto",
        notes: "",
      })
      setIsDialogOpen(false)
    }
  }

  const getStatusBadge = (status: AccountPayable["status"]) => {
    const config = {
      pending: { label: "Pendente", variant: "outline" as const, icon: Clock, className: "border-warning text-warning" },
      partial: { label: "Parcial", variant: "secondary" as const, icon: Clock, className: "" },
      paid: { label: "Pago", variant: "default" as const, icon: CheckCircle, className: "bg-success text-success-foreground" },
      overdue: { label: "Vencido", variant: "destructive" as const, icon: AlertTriangle, className: "" },
      cancelled: { label: "Cancelado", variant: "secondary" as const, icon: null, className: "" },
    }
    const { label, variant, icon: Icon, className } = config[status]
    return (
      <Badge variant={variant} className={`flex items-center gap-1 ${className}`}>
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </Badge>
    )
  }

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const columns = [
    {
      key: "documentNumber",
      label: "Documento",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{value || "-"}</span>
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
      key: "description",
      label: "Descrição",
      render: (value: string) => (
        <p className="max-w-xs truncate" title={value}>
          {value}
        </p>
      ),
    },
    {
      key: "amount",
      label: "Valor",
      sortable: true,
      render: (value: number) => <span className="font-medium">{formatCurrency(value)}</span>,
    },
    {
      key: "amountPaid",
      label: "Pago",
      render: (value: number, row: AccountPayable) => (
        <div>
          <span className="text-success">{formatCurrency(value)}</span>
          <p className="text-xs text-muted-foreground">
            Saldo: {formatCurrency(row.amount - value)}
          </p>
        </div>
      ),
    },
    {
      key: "dueDate",
      label: "Vencimento",
      sortable: true,
      render: (value: string, row: AccountPayable) => {
        const isOverdue =
          new Date(value) < new Date() && row.status !== "paid" && row.status !== "cancelled"
        return (
          <span className={isOverdue ? "text-destructive font-medium" : ""}>
            {new Date(value).toLocaleDateString("pt-BR")}
          </span>
        )
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: AccountPayable["status"]) => getStatusBadge(value),
    },
    {
      key: "category",
      label: "Categoria",
      render: (value: string) => value || "-",
    },
  ]

  const totalOpen = filteredPayables
    .filter((ap) => ap.status !== "paid" && ap.status !== "cancelled")
    .reduce((sum, ap) => sum + (ap.amount - ap.amountPaid), 0)

  const totalOverdue = filteredPayables
    .filter((ap) => ap.status === "overdue")
    .reduce((sum, ap) => sum + (ap.amount - ap.amountPaid), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas a Pagar"
        description="Gerenciamento de títulos a pagar"
        icon={<ArrowUpRight className="h-6 w-6" />}
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
                  Novo Título
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Novo Título a Pagar</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Fornecedor</FieldLabel>
                      <Select
                        value={newPayable.supplierId}
                        onValueChange={(value) =>
                          setNewPayable({ ...newPayable, supplierId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um fornecedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
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
                      <FieldLabel>Descrição</FieldLabel>
                      <Input
                        value={newPayable.description}
                        onChange={(e) =>
                          setNewPayable({ ...newPayable, description: e.target.value })
                        }
                        placeholder="Descrição do título"
                      />
                    </Field>
                  </FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Valor</FieldLabel>
                        <Input
                          type="number"
                          step="0.01"
                          value={newPayable.amount}
                          onChange={(e) =>
                            setNewPayable({
                              ...newPayable,
                              amount: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0,00"
                        />
                      </Field>
                    </FieldGroup>
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Vencimento</FieldLabel>
                        <Input
                          type="date"
                          value={newPayable.dueDate}
                          onChange={(e) =>
                            setNewPayable({ ...newPayable, dueDate: e.target.value })
                          }
                        />
                      </Field>
                    </FieldGroup>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Categoria</FieldLabel>
                        <Select
                          value={newPayable.category}
                          onValueChange={(value) =>
                            setNewPayable({ ...newPayable, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Operacional">Operacional</SelectItem>
                            <SelectItem value="Pessoal">Pessoal</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                            <SelectItem value="Impostos">Impostos</SelectItem>
                            <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                            <SelectItem value="Outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </FieldGroup>
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Forma de Pagamento</FieldLabel>
                        <Select
                          value={newPayable.paymentMethod}
                          onValueChange={(value) =>
                            setNewPayable({
                              ...newPayable,
                              paymentMethod: value as AccountPayable["paymentMethod"],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="boleto">Boleto</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="transfer">Transferência</SelectItem>
                            <SelectItem value="debit">Débito Automático</SelectItem>
                            <SelectItem value="check">Cheque</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    </FieldGroup>
                  </div>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Observações</FieldLabel>
                      <Textarea
                        value={newPayable.notes}
                        onChange={(e) =>
                          setNewPayable({ ...newPayable, notes: e.target.value })
                        }
                        placeholder="Observações adicionais..."
                        rows={2}
                      />
                    </Field>
                  </FieldGroup>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddPayable}>Salvar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-card border">
          <p className="text-sm text-muted-foreground">Total em Aberto</p>
          <p className="text-2xl font-bold text-destructive">{formatCurrency(totalOpen)}</p>
        </div>
        <div className="p-4 rounded-lg bg-card border">
          <p className="text-sm text-muted-foreground">Total Vencido</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(totalOverdue)}</p>
        </div>
        <div className="p-4 rounded-lg bg-card border">
          <p className="text-sm text-muted-foreground">Títulos em Aberto</p>
          <p className="text-2xl font-bold">
            {filteredPayables.filter((ap) => ap.status !== "paid" && ap.status !== "cancelled").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por fornecedor, descrição ou documento..."
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
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="partial">Parcialmente Pagos</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="overdue">Vencidos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filteredPayables} columns={columns} searchable={false} />
    </div>
  )
}
