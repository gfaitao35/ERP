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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { CRMOpportunity, CRMPipelineStage, CRMCustomer, CRMLead } from "@/types/crm"

interface OpportunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity?: CRMOpportunity | null
  stages: CRMPipelineStage[]
  customers: CRMCustomer[]
  leads: CRMLead[]
  defaultStageId?: string
  onSave: (data: Partial<CRMOpportunity>) => Promise<void>
}

export function OpportunityDialog({
  open,
  onOpenChange,
  opportunity,
  stages,
  customers,
  leads,
  defaultStageId,
  onSave,
}: OpportunityDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    stage_id: defaultStageId || "",
    customer_id: "",
    lead_id: "",
    expected_close_date: "",
    description: "",
    source: "",
  })

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || "",
        value: String(opportunity.value || ""),
        stage_id: opportunity.stage_id || defaultStageId || "",
        customer_id: opportunity.customer_id || "",
        lead_id: opportunity.lead_id || "",
        expected_close_date: opportunity.expected_close_date?.split("T")[0] || "",
        description: opportunity.description || "",
        source: opportunity.source || "",
      })
    } else {
      setFormData({
        title: "",
        value: "",
        stage_id: defaultStageId || stages[0]?.id || "",
        customer_id: "",
        lead_id: "",
        expected_close_date: "",
        description: "",
        source: "",
      })
    }
  }, [opportunity, defaultStageId, stages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave({
        ...formData,
        value: parseFloat(formData.value) || 0,
        customer_id: formData.customer_id || undefined,
        lead_id: formData.lead_id || undefined,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving opportunity:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {opportunity ? "Editar Oportunidade" : "Nova Oportunidade"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ex: Venda de equipamentos"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Etapa</Label>
              <Select
                value={formData.stage_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, stage_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a etapa" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="size-2 rounded-full"
                          style={{ backgroundColor: stage.color }}
                        />
                        {stage.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Cliente</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, customer_id: value, lead_id: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead">ou Lead</Label>
              <Select
                value={formData.lead_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, lead_id: value, customer_id: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expected_close_date">Previsão de Fechamento</Label>
              <Input
                id="expected_close_date"
                type="date"
                value={formData.expected_close_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expected_close_date: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Origem</Label>
              <Select
                value={formData.source}
                onValueChange={(value) =>
                  setFormData({ ...formData, source: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a origem" />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detalhes sobre a oportunidade..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {opportunity ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
