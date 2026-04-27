"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { CRMCustomer } from "@/types/crm"

interface CustomerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: CRMCustomer | null
  onSave: (data: Partial<CRMCustomer>) => Promise<void>
}

const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]

export function CustomerForm({
  open,
  onOpenChange,
  customer,
  onSave,
}: CustomerFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "pf" as "pf" | "pj",
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    cpf_cnpj: "",
    ie: "",
    im: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    notes: "",
    first_touch_channel: "",
  })

  useEffect(() => {
    if (customer) {
      setFormData({
        type: customer.type || "pf",
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        whatsapp: customer.whatsapp || "",
        cpf_cnpj: customer.cpf_cnpj || "",
        ie: customer.ie || "",
        im: customer.im || "",
        cep: customer.cep || "",
        street: customer.street || "",
        number: customer.number || "",
        complement: customer.complement || "",
        neighborhood: customer.neighborhood || "",
        city: customer.city || "",
        state: customer.state || "",
        notes: customer.notes || "",
        first_touch_channel: customer.first_touch_channel || "",
      })
    } else {
      setFormData({
        type: "pf",
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        cpf_cnpj: "",
        ie: "",
        im: "",
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        notes: "",
        first_touch_channel: "",
      })
    }
  }, [customer])

  const handleCepBlur = async () => {
    if (formData.cep.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${formData.cep}/json/`
        )
        const data = await response.json()
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            street: data.logradouro || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
          }))
        }
      } catch (error) {
        console.error("Error fetching CEP:", error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving customer:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              <TabsTrigger value="outros">Outros</TabsTrigger>
            </TabsList>

            <TabsContent value="dados" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Tipo de Pessoa</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "pf" | "pj") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pf">Pessoa Física</SelectItem>
                    <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  {formData.type === "pf" ? "Nome Completo *" : "Razão Social *"}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf_cnpj">
                    {formData.type === "pf" ? "CPF" : "CNPJ"}
                  </Label>
                  <Input
                    id="cpf_cnpj"
                    value={formData.cpf_cnpj}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf_cnpj: e.target.value })
                    }
                    placeholder={formData.type === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                  />
                </div>
                {formData.type === "pj" && (
                  <div className="space-y-2">
                    <Label htmlFor="ie">Inscrição Estadual</Label>
                    <Input
                      id="ie"
                      value={formData.ie}
                      onChange={(e) =>
                        setFormData({ ...formData, ie: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="endereco" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cep: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    onBlur={handleCepBlur}
                    maxLength={8}
                    placeholder="00000000"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="street">Logradouro</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.complement}
                    onChange={(e) =>
                      setFormData({ ...formData, complement: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) =>
                      setFormData({ ...formData, neighborhood: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select
                    value={formData.state}
                    onValueChange={(value) =>
                      setFormData({ ...formData, state: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="outros" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="first_touch_channel">Canal de Origem</Label>
                <Select
                  value={formData.first_touch_channel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, first_touch_channel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Não especificado</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="meta_ads">Meta Ads</SelectItem>
                    <SelectItem value="google_ads">Google Ads</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                  placeholder="Anotações sobre o cliente..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {customer ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
