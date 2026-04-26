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
  Users,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  MapPin,
  Star,
} from "lucide-react"
import type { Supplier } from "@/types/erp"

export default function SuppliersPage() {
  const { suppliers, addSupplier } = useERPData()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: "",
    tradeName: "",
    document: "",
    email: "",
    phone: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Brasil",
    },
    contactPerson: "",
    category: "",
    paymentTerms: "",
    notes: "",
    status: "active",
  })

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddSupplier = () => {
    if (newSupplier.name && newSupplier.document) {
      addSupplier({
        ...newSupplier,
        id: `SUP-${Date.now()}`,
        tenantId: "tenant-1",
        rating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Supplier)
      setNewSupplier({
        name: "",
        tradeName: "",
        document: "",
        email: "",
        phone: "",
        address: {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
          country: "Brasil",
        },
        contactPerson: "",
        category: "",
        paymentTerms: "",
        notes: "",
        status: "active",
      })
      setIsDialogOpen(false)
    }
  }

  const columns = [
    {
      key: "name",
      label: "Fornecedor",
      sortable: true,
      render: (value: string, row: Supplier) => (
        <div>
          <p className="font-medium">{value}</p>
          {row.tradeName && (
            <p className="text-xs text-muted-foreground">{row.tradeName}</p>
          )}
        </div>
      ),
    },
    {
      key: "document",
      label: "CNPJ/CPF",
      render: (value: string) => (
        <span className="font-mono text-xs">{value}</span>
      ),
    },
    {
      key: "category",
      label: "Categoria",
      render: (value: string) => value || "-",
    },
    {
      key: "contact",
      label: "Contato",
      render: (_: unknown, row: Supplier) => (
        <div className="space-y-1">
          {row.email && (
            <div className="flex items-center gap-1 text-xs">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span>{row.email}</span>
            </div>
          )}
          {row.phone && (
            <div className="flex items-center gap-1 text-xs">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "address",
      label: "Localização",
      render: (_: unknown, row: Supplier) =>
        row.address ? (
          <div className="flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>
              {row.address.city}, {row.address.state}
            </span>
          </div>
        ) : (
          "-"
        ),
    },
    {
      key: "rating",
      label: "Avaliação",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-warning text-warning" />
          <span>{value.toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value: Supplier["status"]) => {
        const config = {
          active: { label: "Ativo", variant: "default" as const, className: "bg-success text-success-foreground" },
          inactive: { label: "Inativo", variant: "secondary" as const, className: "" },
          blocked: { label: "Bloqueado", variant: "destructive" as const, className: "" },
        }
        const { label, variant, className } = config[value]
        return (
          <Badge variant={variant} className={className}>
            {label}
          </Badge>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fornecedores"
        description="Cadastro e gerenciamento de fornecedores"
        icon={<Users className="h-6 w-6" />}
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
                  Novo Fornecedor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Novo Fornecedor</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <FieldGroup className="col-span-2">
                    <Field>
                      <FieldLabel>Razão Social</FieldLabel>
                      <Input
                        value={newSupplier.name}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, name: e.target.value })
                        }
                        placeholder="Razão social do fornecedor"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Nome Fantasia</FieldLabel>
                      <Input
                        value={newSupplier.tradeName}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, tradeName: e.target.value })
                        }
                        placeholder="Nome fantasia"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>CNPJ/CPF</FieldLabel>
                      <Input
                        value={newSupplier.document}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, document: e.target.value })
                        }
                        placeholder="00.000.000/0000-00"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>E-mail</FieldLabel>
                      <Input
                        type="email"
                        value={newSupplier.email}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, email: e.target.value })
                        }
                        placeholder="email@fornecedor.com"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Telefone</FieldLabel>
                      <Input
                        value={newSupplier.phone}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, phone: e.target.value })
                        }
                        placeholder="(00) 00000-0000"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Pessoa de Contato</FieldLabel>
                      <Input
                        value={newSupplier.contactPerson}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, contactPerson: e.target.value })
                        }
                        placeholder="Nome do contato"
                      />
                    </Field>
                  </FieldGroup>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Categoria</FieldLabel>
                      <Select
                        value={newSupplier.category}
                        onValueChange={(value) =>
                          setNewSupplier({ ...newSupplier, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Matéria-Prima">Matéria-Prima</SelectItem>
                          <SelectItem value="Serviços">Serviços</SelectItem>
                          <SelectItem value="Embalagens">Embalagens</SelectItem>
                          <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                          <SelectItem value="Material de Escritório">Material de Escritório</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </FieldGroup>
                  <div className="col-span-2 border-t pt-4 mt-2">
                    <p className="text-sm font-medium mb-3">Endereço</p>
                    <div className="grid grid-cols-2 gap-4">
                      <FieldGroup className="col-span-2">
                        <Field>
                          <FieldLabel>Rua</FieldLabel>
                          <Input
                            value={newSupplier.address?.street}
                            onChange={(e) =>
                              setNewSupplier({
                                ...newSupplier,
                                address: { ...newSupplier.address!, street: e.target.value },
                              })
                            }
                            placeholder="Nome da rua"
                          />
                        </Field>
                      </FieldGroup>
                      <FieldGroup>
                        <Field>
                          <FieldLabel>Número</FieldLabel>
                          <Input
                            value={newSupplier.address?.number}
                            onChange={(e) =>
                              setNewSupplier({
                                ...newSupplier,
                                address: { ...newSupplier.address!, number: e.target.value },
                              })
                            }
                            placeholder="Nº"
                          />
                        </Field>
                      </FieldGroup>
                      <FieldGroup>
                        <Field>
                          <FieldLabel>Complemento</FieldLabel>
                          <Input
                            value={newSupplier.address?.complement}
                            onChange={(e) =>
                              setNewSupplier({
                                ...newSupplier,
                                address: { ...newSupplier.address!, complement: e.target.value },
                              })
                            }
                            placeholder="Apto, Sala..."
                          />
                        </Field>
                      </FieldGroup>
                      <FieldGroup>
                        <Field>
                          <FieldLabel>Bairro</FieldLabel>
                          <Input
                            value={newSupplier.address?.neighborhood}
                            onChange={(e) =>
                              setNewSupplier({
                                ...newSupplier,
                                address: { ...newSupplier.address!, neighborhood: e.target.value },
                              })
                            }
                            placeholder="Bairro"
                          />
                        </Field>
                      </FieldGroup>
                      <FieldGroup>
                        <Field>
                          <FieldLabel>CEP</FieldLabel>
                          <Input
                            value={newSupplier.address?.zipCode}
                            onChange={(e) =>
                              setNewSupplier({
                                ...newSupplier,
                                address: { ...newSupplier.address!, zipCode: e.target.value },
                              })
                            }
                            placeholder="00000-000"
                          />
                        </Field>
                      </FieldGroup>
                      <FieldGroup>
                        <Field>
                          <FieldLabel>Cidade</FieldLabel>
                          <Input
                            value={newSupplier.address?.city}
                            onChange={(e) =>
                              setNewSupplier({
                                ...newSupplier,
                                address: { ...newSupplier.address!, city: e.target.value },
                              })
                            }
                            placeholder="Cidade"
                          />
                        </Field>
                      </FieldGroup>
                      <FieldGroup>
                        <Field>
                          <FieldLabel>Estado</FieldLabel>
                          <Input
                            value={newSupplier.address?.state}
                            onChange={(e) =>
                              setNewSupplier({
                                ...newSupplier,
                                address: { ...newSupplier.address!, state: e.target.value },
                              })
                            }
                            placeholder="UF"
                          />
                        </Field>
                      </FieldGroup>
                    </div>
                  </div>
                  <FieldGroup className="col-span-2">
                    <Field>
                      <FieldLabel>Observações</FieldLabel>
                      <Textarea
                        value={newSupplier.notes}
                        onChange={(e) =>
                          setNewSupplier({ ...newSupplier, notes: e.target.value })
                        }
                        placeholder="Informações adicionais sobre o fornecedor..."
                        rows={3}
                      />
                    </Field>
                  </FieldGroup>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddSupplier}>Salvar Fornecedor</Button>
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
            placeholder="Buscar por nome, CNPJ ou e-mail..."
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
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
            <SelectItem value="blocked">Bloqueados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={filteredSuppliers}
        columns={columns}
        searchable={false}
        onRowClick={(supplier) => console.log("Supplier clicked:", supplier)}
      />
    </div>
  )
}
