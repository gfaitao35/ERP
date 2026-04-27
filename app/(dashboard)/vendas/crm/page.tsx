"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR, { mutate } from "swr"
import { PipelineKanban } from "@/components/crm/pipeline-kanban"
import { OpportunityDialog } from "@/components/crm/opportunity-dialog"
import { CustomerForm } from "@/components/crm/customer-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  MessageSquare,
  FileText,
  TrendingUp,
  Users,
  Target,
  Flame,
  Thermometer,
  Snowflake,
} from "lucide-react"
import type { CRMOpportunity, CRMCustomer, CRMLead, CRMPipelineStage, CRMInteraction } from "@/types/crm"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// =====================================================
// OPPORTUNITY DETAIL SHEET
// =====================================================
function OpportunityDetailSheet({
  opportunity,
  open,
  onOpenChange,
}: {
  opportunity: CRMOpportunity & {
    customer_name?: string
    customer_email?: string
    lead_name?: string
    lead_email?: string
    stage_name?: string
    stage_color?: string
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: interactionsData } = useSWR(
    opportunity ? `/api/crm/interactions?opportunity_id=${opportunity.id}` : null,
    fetcher
  )

  if (!opportunity) return null

  const name = opportunity.customer_name || opportunity.lead_name || "Sem nome"
  const email = opportunity.customer_email || opportunity.lead_email

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="size-4" />
      case "email":
        return <Mail className="size-4" />
      case "whatsapp":
        return <MessageSquare className="size-4" />
      case "meeting":
        return <Users className="size-4" />
      case "proposal":
        return <FileText className="size-4" />
      default:
        return <Clock className="size-4" />
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: opportunity.stage_color }}
            />
            {opportunity.title}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Value and Stage */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(Number(opportunity.value))}
              </p>
            </div>
            <Badge
              style={{
                backgroundColor: `${opportunity.stage_color}20`,
                color: opportunity.stage_color,
                borderColor: opportunity.stage_color,
              }}
              variant="outline"
            >
              {opportunity.stage_name}
            </Badge>
          </div>

          {/* Contact Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="size-4" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{name}</span>
              </div>
              {email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-3" />
                  {email}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="size-4" />
                Detalhes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Probabilidade</p>
                  <p className="font-medium">{opportunity.probability}%</p>
                </div>
                {opportunity.expected_close_date && (
                  <div>
                    <p className="text-muted-foreground">Previsão</p>
                    <p className="font-medium">
                      {formatDate(opportunity.expected_close_date)}
                    </p>
                  </div>
                )}
                {opportunity.source && (
                  <div>
                    <p className="text-muted-foreground">Origem</p>
                    <p className="font-medium capitalize">{opportunity.source}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Criado em</p>
                  <p className="font-medium">{formatDate(opportunity.created_at)}</p>
                </div>
              </div>
              {opportunity.description && (
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground text-sm">Descrição</p>
                  <p className="text-sm mt-1">{opportunity.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="size-4" />
                Histórico de Interações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {interactionsData?.interactions?.length > 0 ? (
                <div className="space-y-3">
                  {interactionsData.interactions.map((interaction: CRMInteraction) => (
                    <div
                      key={interaction.id}
                      className="flex gap-3 border-l-2 border-border pl-3"
                    >
                      <div className="mt-0.5 text-muted-foreground">
                        {getInteractionIcon(interaction.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize">
                            {interaction.type.replace("_", " ")}
                          </span>
                          {interaction.direction && (
                            <Badge variant="outline" className="text-xs">
                              {interaction.direction === "inbound"
                                ? "Entrada"
                                : "Saída"}
                            </Badge>
                          )}
                        </div>
                        {interaction.subject && (
                          <p className="text-sm">{interaction.subject}</p>
                        )}
                        {interaction.content && (
                          <p className="text-sm text-muted-foreground">
                            {interaction.content}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(interaction.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma interação registrada
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// =====================================================
// MAIN CRM PAGE
// =====================================================
export default function CRMPage() {
  const [search, setSearch] = useState("")
  const [selectedOpportunity, setSelectedOpportunity] = useState<CRMOpportunity | null>(null)
  const [showOpportunityDetail, setShowOpportunityDetail] = useState(false)
  const [showOpportunityDialog, setShowOpportunityDialog] = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [defaultStageId, setDefaultStageId] = useState<string>("")

  // Fetch pipeline data
  const { data: pipelineData, isLoading: pipelineLoading, mutate: mutatePipeline } = useSWR(
    "/api/crm/pipeline",
    fetcher,
    { refreshInterval: 30000 }
  )

  // Fetch customers for dialog
  const { data: customersData } = useSWR("/api/crm/customers?limit=100", fetcher)

  // Fetch leads for dialog
  const { data: leadsData } = useSWR("/api/crm/leads?limit=100", fetcher)

  // Fetch stages for dialog
  const { data: stagesData } = useSWR("/api/crm/stages", fetcher)

  const handleMoveOpportunity = useCallback(
    async (opportunityId: string, newStageId: string) => {
      try {
        await fetch(`/api/crm/opportunities/${opportunityId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage_id: newStageId }),
        })
        mutatePipeline()
      } catch (error) {
        console.error("Error moving opportunity:", error)
      }
    },
    [mutatePipeline]
  )

  const handleOpenOpportunity = useCallback((opportunity: CRMOpportunity) => {
    setSelectedOpportunity(opportunity)
    setShowOpportunityDetail(true)
  }, [])

  const handleCreateOpportunity = useCallback((stageId: string) => {
    setDefaultStageId(stageId)
    setSelectedOpportunity(null)
    setShowOpportunityDialog(true)
  }, [])

  const handleSaveOpportunity = async (data: Partial<CRMOpportunity>) => {
    const url = selectedOpportunity
      ? `/api/crm/opportunities/${selectedOpportunity.id}`
      : "/api/crm/opportunities"
    const method = selectedOpportunity ? "PUT" : "POST"

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    mutatePipeline()
  }

  const handleSaveCustomer = async (data: Partial<CRMCustomer>) => {
    await fetch("/api/crm/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    mutate("/api/crm/customers?limit=100")
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CRM - Pipeline de Vendas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas oportunidades de venda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => mutatePipeline()}
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button variant="outline" onClick={() => setShowCustomerForm(true)}>
            <Plus className="mr-2 size-4" />
            Cliente
          </Button>
          <Button onClick={() => handleCreateOpportunity("")}>
            <Plus className="mr-2 size-4" />
            Oportunidade
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar oportunidades..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="size-4" />
        </Button>
      </div>

      {/* Pipeline Kanban */}
      {pipelineLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-72 flex-shrink-0 space-y-3">
              <Skeleton className="h-12 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : pipelineData?.pipeline ? (
        <PipelineKanban
          pipeline={pipelineData.pipeline}
          totals={pipelineData.totals}
          onMoveOpportunity={handleMoveOpportunity}
          onOpenOpportunity={handleOpenOpportunity}
          onCreateOpportunity={handleCreateOpportunity}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <Target className="mx-auto size-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Nenhum pipeline encontrado</h3>
            <p className="text-sm text-muted-foreground">
              Comece criando uma nova oportunidade
            </p>
            <Button
              className="mt-4"
              onClick={() => handleCreateOpportunity("")}
            >
              <Plus className="mr-2 size-4" />
              Nova Oportunidade
            </Button>
          </div>
        </div>
      )}

      {/* Opportunity Detail Sheet */}
      <OpportunityDetailSheet
        opportunity={selectedOpportunity as any}
        open={showOpportunityDetail}
        onOpenChange={setShowOpportunityDetail}
      />

      {/* Opportunity Dialog */}
      <OpportunityDialog
        open={showOpportunityDialog}
        onOpenChange={setShowOpportunityDialog}
        opportunity={selectedOpportunity}
        stages={stagesData?.stages || []}
        customers={customersData?.customers || []}
        leads={leadsData?.leads || []}
        defaultStageId={defaultStageId}
        onSave={handleSaveOpportunity}
      />

      {/* Customer Form */}
      <CustomerForm
        open={showCustomerForm}
        onOpenChange={setShowCustomerForm}
        onSave={handleSaveCustomer}
      />
    </div>
  )
}
