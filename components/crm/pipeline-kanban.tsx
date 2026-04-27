"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  Plus,
  GripVertical,
  Building2,
  Flame,
  Thermometer,
  Snowflake,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { CRMOpportunity, CRMPipelineStage } from "@/types/crm"

// =====================================================
// TYPES
// =====================================================
interface PipelineStageWithOpportunities extends CRMPipelineStage {
  opportunities: ExtendedOpportunity[]
  totalValue: number
}

interface ExtendedOpportunity extends CRMOpportunity {
  customer_name?: string
  customer_email?: string
  customer_classification?: string
  lead_name?: string
  lead_email?: string
  lead_temperature?: string
}

interface PipelineKanbanProps {
  pipeline: PipelineStageWithOpportunities[]
  totals: {
    totalOpportunities: number
    totalValue: number
    weightedValue: number
  }
  onMoveOpportunity: (opportunityId: string, newStageId: string) => Promise<void>
  onOpenOpportunity: (opportunity: ExtendedOpportunity) => void
  onCreateOpportunity: (stageId: string) => void
}

// =====================================================
// OPPORTUNITY CARD COMPONENT
// =====================================================
function OpportunityCard({
  opportunity,
  onClick,
  isDragging = false,
}: {
  opportunity: ExtendedOpportunity
  onClick: () => void
  isDragging?: boolean
}) {
  const name = opportunity.customer_name || opportunity.lead_name || "Sem nome"
  const email = opportunity.customer_email || opportunity.lead_email
  const temperature = opportunity.lead_temperature || opportunity.customer_classification

  const getTemperatureIcon = () => {
    switch (temperature) {
      case "hot":
        return <Flame className="size-3 text-red-400" />
      case "warm":
        return <Thermometer className="size-3 text-amber-400" />
      case "cold":
        return <Snowflake className="size-3 text-blue-400" />
      default:
        return null
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    if (!date) return null
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    })
  }

  return (
    <Card
      className={cn(
        "cursor-pointer border-border/50 bg-card/50 transition-all hover:border-primary/30 hover:bg-card",
        isDragging && "rotate-2 scale-105 shadow-xl ring-2 ring-primary/50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-medium text-foreground">
              {opportunity.title}
            </h4>
            <div className="mt-1 flex items-center gap-1.5">
              {opportunity.customer_id ? (
                <Building2 className="size-3 text-muted-foreground" />
              ) : (
                <User className="size-3 text-muted-foreground" />
              )}
              <span className="truncate text-xs text-muted-foreground">
                {name}
              </span>
              {getTemperatureIcon()}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="size-6">
                <MoreHorizontal className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onClick()}>
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-primary">
            <DollarSign className="size-3" />
            <span className="text-sm font-semibold">
              {formatCurrency(Number(opportunity.value))}
            </span>
          </div>
          {opportunity.expected_close_date && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="size-3" />
              <span className="text-xs">
                {formatDate(opportunity.expected_close_date)}
              </span>
            </div>
          )}
        </div>

        {(email || opportunity.probability > 0) && (
          <div className="mt-2 flex items-center justify-between">
            {email && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Mail className="size-3" />
                <span className="truncate text-xs">{email}</span>
              </div>
            )}
            {opportunity.probability > 0 && (
              <Badge variant="outline" className="text-xs">
                {opportunity.probability}%
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =====================================================
// SORTABLE OPPORTUNITY WRAPPER
// =====================================================
function SortableOpportunity({
  opportunity,
  onClick,
}: {
  opportunity: ExtendedOpportunity
  onClick: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-3 z-10 cursor-grab rounded p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
      >
        <GripVertical className="size-3 text-muted-foreground" />
      </div>
      <OpportunityCard opportunity={opportunity} onClick={onClick} />
    </div>
  )
}

// =====================================================
// PIPELINE STAGE COLUMN
// =====================================================
function PipelineStageColumn({
  stage,
  onOpenOpportunity,
  onCreateOpportunity,
}: {
  stage: PipelineStageWithOpportunities
  onOpenOpportunity: (opportunity: ExtendedOpportunity) => void
  onCreateOpportunity: () => void
}) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
    }).format(value)
  }

  return (
    <div className="flex h-full w-72 flex-shrink-0 flex-col">
      <div
        className="mb-3 flex items-center justify-between rounded-lg p-3"
        style={{ backgroundColor: `${stage.color}15` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="size-3 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-semibold text-foreground">{stage.name}</h3>
          <Badge variant="secondary" className="text-xs">
            {stage.opportunities.length}
          </Badge>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {formatCurrency(stage.totalValue)}
        </span>
      </div>

      <div className="group flex-1 space-y-2 overflow-y-auto rounded-lg border border-dashed border-border/50 bg-muted/20 p-2">
        <SortableContext
          items={stage.opportunities.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {stage.opportunities.map((opportunity) => (
            <SortableOpportunity
              key={opportunity.id}
              opportunity={opportunity}
              onClick={() => onOpenOpportunity(opportunity)}
            />
          ))}
        </SortableContext>

        {stage.opportunities.length === 0 && (
          <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            Arraste oportunidades aqui
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={onCreateOpportunity}
        >
          <Plus className="size-4" />
          Nova Oportunidade
        </Button>
      </div>
    </div>
  )
}

// =====================================================
// MAIN PIPELINE KANBAN COMPONENT
// =====================================================
export function PipelineKanban({
  pipeline,
  totals,
  onMoveOpportunity,
  onOpenOpportunity,
  onCreateOpportunity,
}: PipelineKanbanProps) {
  const [activeOpportunity, setActiveOpportunity] = useState<ExtendedOpportunity | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const opportunity = pipeline
      .flatMap((s) => s.opportunities)
      .find((o) => o.id === active.id)
    if (opportunity) {
      setActiveOpportunity(opportunity)
    }
  }, [pipeline])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveOpportunity(null)

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      // Find the stage the opportunity was dropped into
      const targetStage = pipeline.find(
        (stage) =>
          stage.id === overId ||
          stage.opportunities.some((o) => o.id === overId)
      )

      if (!targetStage) return

      // Find current stage
      const currentStage = pipeline.find((stage) =>
        stage.opportunities.some((o) => o.id === activeId)
      )

      if (currentStage?.id !== targetStage.id) {
        await onMoveOpportunity(activeId, targetStage.id)
      }
    },
    [pipeline, onMoveOpportunity]
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Summary Header */}
      <div className="mb-4 flex items-center gap-6 rounded-lg border border-border bg-card p-4">
        <div>
          <p className="text-sm text-muted-foreground">Total de Oportunidades</p>
          <p className="text-2xl font-bold text-foreground">
            {totals.totalOpportunities}
          </p>
        </div>
        <div className="h-10 w-px bg-border" />
        <div>
          <p className="text-sm text-muted-foreground">Valor do Pipeline</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(totals.totalValue)}
          </p>
        </div>
        <div className="h-10 w-px bg-border" />
        <div>
          <p className="text-sm text-muted-foreground">Valor Ponderado</p>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(totals.weightedValue)}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-4 pb-4">
            {pipeline.map((stage) => (
              <PipelineStageColumn
                key={stage.id}
                stage={stage}
                onOpenOpportunity={onOpenOpportunity}
                onCreateOpportunity={() => onCreateOpportunity(stage.id)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeOpportunity && (
              <div className="w-72">
                <OpportunityCard
                  opportunity={activeOpportunity}
                  onClick={() => {}}
                  isDragging
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
