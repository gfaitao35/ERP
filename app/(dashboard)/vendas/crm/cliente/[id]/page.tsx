"use client"

import { use, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Clock,
  Edit,
  MessageSquare,
  FileText,
  Users,
  Flame,
  Thermometer,
  Snowflake,
  AlertCircle,
  Target,
  Activity,
  BarChart3,
  Plus,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CustomerForm } from "@/components/crm/customer-form"
import type { CRMCustomer, CRMInteraction, CRMOpportunity } from "@/types/crm"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// =====================================================
// SCORE GAUGE COMPONENT
// =====================================================
function ScoreGauge({
  score,
  maxScore = 100,
  label,
  classification,
}: {
  score: number
  maxScore?: number
  label: string
  classification: string
}) {
  const percentage = (score / maxScore) * 100

  const getClassificationColor = () => {
    switch (classification) {
      case "hot":
        return "text-red-400"
      case "warm":
        return "text-amber-400"
      case "cold":
        return "text-blue-400"
      case "inactive":
        return "text-gray-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getClassificationIcon = () => {
    switch (classification) {
      case "hot":
        return <Flame className="size-5" />
      case "warm":
        return <Thermometer className="size-5" />
      case "cold":
        return <Snowflake className="size-5" />
      case "inactive":
        return <AlertCircle className="size-5" />
      default:
        return null
    }
  }

  const getClassificationLabel = () => {
    switch (classification) {
      case "hot":
        return "Cliente Quente"
      case "warm":
        return "Cliente Morno"
      case "cold":
        return "Cliente Frio"
      case "inactive":
        return "Cliente Inativo"
      default:
        return "Não classificado"
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-32">
        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
          <path
            className="stroke-muted"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={cn("transition-all duration-500", getClassificationColor())}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            style={{ stroke: "currentColor" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold", getClassificationColor())}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </div>
      <div className={cn("flex items-center gap-2", getClassificationColor())}>
        {getClassificationIcon()}
        <span className="font-medium">{getClassificationLabel()}</span>
      </div>
    </div>
  )
}

// =====================================================
// RFM SCORE CARD
// =====================================================
function RFMScoreCard({
  label,
  score,
  description,
  icon: Icon,
}: {
  label: string
  score: number
  description: string
  icon: React.ElementType
}) {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{label}</span>
              <span className="text-lg font-bold text-primary">{score}/5</span>
            </div>
            <Progress value={score * 20} className="mt-2 h-1.5" />
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// TIMELINE ITEM
// =====================================================
function TimelineItem({ interaction }: { interaction: CRMInteraction }) {
  const getIcon = () => {
    switch (interaction.type) {
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
      case "order":
        return <ShoppingBag className="size-4" />
      default:
        return <Clock className="size-4" />
    }
  }

  const getTypeLabel = () => {
    const labels: Record<string, string> = {
      call: "Ligação",
      email: "E-mail",
      whatsapp: "WhatsApp",
      meeting: "Reunião",
      proposal: "Proposta",
      order: "Pedido",
      follow_up: "Follow-up",
      note: "Nota",
      status_change: "Status",
      visit: "Visita",
      support: "Suporte",
    }
    return labels[interaction.type] || interaction.type
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Hoje"
    if (diffDays === 1) return "Ontem"
    if (diffDays < 7) return `${diffDays} dias atrás`

    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: diffDays > 365 ? "numeric" : undefined,
    })
  }

  return (
    <div className="flex gap-4">
      <div className="relative">
        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-card">
          {getIcon()}
        </div>
        <div className="absolute left-1/2 top-10 h-full w-px -translate-x-1/2 bg-border" />
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{getTypeLabel()}</span>
            {interaction.direction && (
              <Badge variant="outline" className="text-xs">
                {interaction.direction === "inbound" ? "Entrada" : "Saída"}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDate(interaction.created_at)}
          </span>
        </div>
        {interaction.subject && (
          <p className="mt-1 text-sm text-foreground">{interaction.subject}</p>
        )}
        {interaction.content && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {interaction.content}
          </p>
        )}
        {interaction.outcome && (
          <Badge variant="secondary" className="mt-2 text-xs">
            {interaction.outcome}
          </Badge>
        )}
      </div>
    </div>
  )
}

// =====================================================
// MAIN CUSTOMER 360 PAGE
// =====================================================
export default function Customer360Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [showEditForm, setShowEditForm] = useState(false)

  const { data, isLoading, mutate } = useSWR(`/api/crm/customers/${id}`, fetcher)

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-1" />
          <Skeleton className="h-64 col-span-2" />
        </div>
      </div>
    )
  }

  if (!data?.customer) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto size-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Cliente não encontrado</h3>
          <Button asChild className="mt-4">
            <Link href="/vendas/crm">
              <ArrowLeft className="mr-2 size-4" />
              Voltar ao CRM
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const { customer, interactions, opportunities } = data as {
    customer: CRMCustomer
    interactions: CRMInteraction[]
    opportunities: (CRMOpportunity & { stage_name: string; stage_color: string })[]
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  const handleSaveCustomer = async (customerData: Partial<CRMCustomer>) => {
    await fetch(`/api/crm/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    })
    mutate()
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/vendas/crm">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <Avatar className="size-14">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {customer.type === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}
              </Badge>
              {customer.cpf_cnpj && <span>{customer.cpf_cnpj}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowEditForm(true)}>
            <Edit className="mr-2 size-4" />
            Editar
          </Button>
          <Button>
            <Plus className="mr-2 size-4" />
            Nova Interação
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Score & Contact */}
        <div className="space-y-6">
          {/* Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="size-5" />
                Score do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ScoreGauge
                score={customer.score_rfm}
                label="RFM Score"
                classification={customer.classification}
              />
              <div className="space-y-3">
                <RFMScoreCard
                  label="Recência"
                  score={customer.score_recency}
                  description={`${customer.days_since_last_order} dias desde última compra`}
                  icon={Clock}
                />
                <RFMScoreCard
                  label="Frequência"
                  score={customer.score_frequency}
                  description={`${customer.total_orders} pedidos realizados`}
                  icon={Activity}
                />
                <RFMScoreCard
                  label="Valor Monetário"
                  score={customer.score_monetary}
                  description={`Ticket médio: ${formatCurrency(customer.average_ticket)}`}
                  icon={DollarSign}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="size-5" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-sm hover:text-primary"
                  >
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-muted-foreground" />
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-sm hover:text-primary"
                  >
                    {customer.phone}
                  </a>
                </div>
              )}
              {customer.whatsapp && (
                <div className="flex items-center gap-3">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  <a
                    href={`https://wa.me/${customer.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-primary flex items-center gap-1"
                  >
                    {customer.whatsapp}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}
              {customer.city && (
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    {customer.city}
                    {customer.state && `, ${customer.state}`}
                  </span>
                </div>
              )}
              {customer.first_touch_channel && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Canal de origem</p>
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {customer.first_touch_channel.replace("_", " ")}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="utm">UTM / Origem</TabsTrigger>
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  {interactions.length > 0 ? (
                    <div className="space-y-0">
                      {interactions.map((interaction, index) => (
                        <TimelineItem
                          key={interaction.id}
                          interaction={interaction}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Clock className="size-12 text-muted-foreground" />
                      <h3 className="mt-4 font-medium">Nenhuma interação registrada</h3>
                      <p className="text-sm text-muted-foreground">
                        Adicione a primeira interação com este cliente
                      </p>
                      <Button className="mt-4">
                        <Plus className="mr-2 size-4" />
                        Adicionar Interação
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Opportunities Tab */}
            <TabsContent value="opportunities" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  {opportunities.length > 0 ? (
                    <div className="space-y-4">
                      {opportunities.map((opp) => (
                        <div
                          key={opp.id}
                          className="flex items-center justify-between rounded-lg border border-border p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="size-3 rounded-full"
                              style={{ backgroundColor: opp.stage_color }}
                            />
                            <div>
                              <p className="font-medium">{opp.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {opp.stage_name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              {formatCurrency(Number(opp.value))}
                            </p>
                            <Badge
                              variant={
                                opp.status === "won"
                                  ? "default"
                                  : opp.status === "lost"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {opp.status === "won"
                                ? "Ganho"
                                : opp.status === "lost"
                                ? "Perdido"
                                : "Aberto"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Target className="size-12 text-muted-foreground" />
                      <h3 className="mt-4 font-medium">Nenhuma oportunidade</h3>
                      <p className="text-sm text-muted-foreground">
                        Crie uma oportunidade para este cliente
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <ShoppingBag className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                        <p className="text-2xl font-bold">{customer.total_orders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <DollarSign className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Gasto</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(customer.total_spent)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <BarChart3 className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ticket Médio</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(customer.average_ticket)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Calendar className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Última Compra</p>
                        <p className="text-2xl font-bold">
                          {customer.last_order_date
                            ? formatDate(customer.last_order_date)
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* UTM Tab */}
            <TabsContent value="utm" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">UTM Source</p>
                      <p className="font-medium">{customer.utm_source || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">UTM Medium</p>
                      <p className="font-medium">{customer.utm_medium || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">UTM Campaign</p>
                      <p className="font-medium">{customer.utm_campaign || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">UTM Term</p>
                      <p className="font-medium">{customer.utm_term || "-"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">UTM Content</p>
                      <p className="font-medium">{customer.utm_content || "-"}</p>
                    </div>
                    <div className="col-span-2 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Canal de Primeiro Contato</p>
                      <Badge variant="secondary" className="mt-1 capitalize">
                        {customer.first_touch_channel?.replace("_", " ") || "Não rastreado"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Form */}
      <CustomerForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        customer={customer}
        onSave={handleSaveCustomer}
      />
    </div>
  )
}
