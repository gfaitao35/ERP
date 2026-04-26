"use client";

import Link from "next/link";
import { Plus, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/erp/page-header";
import { useOpportunities, useCustomers } from "@/contexts/erp-data-context";
import type { OpportunityStage, SalesOpportunity } from "@/types/erp";
import { cn } from "@/lib/utils";

// =====================================================
// KANBAN CONFIG
// =====================================================
const stages: { key: OpportunityStage; label: string; color: string }[] = [
  { key: "lead", label: "Lead", color: "bg-slate-500" },
  { key: "qualified", label: "Qualificado", color: "bg-blue-500" },
  { key: "proposal", label: "Proposta", color: "bg-amber-500" },
  { key: "negotiation", label: "Negociação", color: "bg-purple-500" },
  { key: "won", label: "Ganho", color: "bg-green-500" },
  { key: "lost", label: "Perdido", color: "bg-red-500" },
];

// =====================================================
// OPPORTUNITY CARD COMPONENT
// =====================================================
interface OpportunityCardProps {
  opportunity: SalesOpportunity;
  customerName?: string;
}

function OpportunityCard({ opportunity, customerName }: OpportunityCardProps) {
  return (
    <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{opportunity.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {customerName ?? "Cliente não definido"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6 shrink-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/vendas/oportunidades/${opportunity.id}`}>
                  Ver detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Mover para próxima fase</DropdownMenuItem>
              <DropdownMenuItem>Converter em pedido</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Marcar como perdido
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-semibold text-primary">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              notation: "compact",
            }).format(opportunity.value)}
          </span>
          <Badge variant="outline" className="text-xs">
            {opportunity.probability}%
          </Badge>
        </div>

        {opportunity.expectedCloseDate && (
          <p className="mt-2 text-xs text-muted-foreground">
            Previsão:{" "}
            {new Intl.DateTimeFormat("pt-BR").format(opportunity.expectedCloseDate)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// KANBAN COLUMN COMPONENT
// =====================================================
interface KanbanColumnProps {
  stage: (typeof stages)[0];
  opportunities: SalesOpportunity[];
  customers: Map<string, string>;
}

function KanbanColumn({ stage, opportunities, customers }: KanbanColumnProps) {
  const totalValue = opportunities.reduce((sum, o) => sum + o.value, 0);

  return (
    <div className="flex min-w-[280px] flex-col rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <div className={cn("size-3 rounded-full", stage.color)} />
        <h3 className="font-semibold">{stage.label}</h3>
        <Badge variant="secondary" className="ml-auto">
          {opportunities.length}
        </Badge>
      </div>
      
      <div className="p-2 text-sm text-muted-foreground">
        Total:{" "}
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          notation: "compact",
        }).format(totalValue)}
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        {opportunities.map((opp) => (
          <OpportunityCard
            key={opp.id}
            opportunity={opp}
            customerName={customers.get(opp.customerId)}
          />
        ))}
        {opportunities.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma oportunidade
          </p>
        )}
      </div>
    </div>
  );
}

// =====================================================
// OPPORTUNITIES PAGE (KANBAN VIEW)
// =====================================================
export default function OportunidadesPage() {
  const { data: opportunities } = useOpportunities();
  const { data: customers } = useCustomers();

  // Create customer lookup map
  const customerMap = new Map(customers.map((c) => [c.id, c.name]));

  // Group opportunities by stage
  const opportunitiesByStage = stages.map((stage) => ({
    stage,
    opportunities: opportunities.filter((o) => o.stage === stage.key),
  }));

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Oportunidades"
        description="Pipeline de vendas - Arraste para mover entre fases"
        actions={
          <Button asChild>
            <Link href="/vendas/oportunidades/nova">
              <Plus className="mr-2 size-4" />
              Nova Oportunidade
            </Link>
          </Button>
        }
      />

      {/* Kanban Board */}
      <div className="mt-6 flex flex-1 gap-4 overflow-x-auto pb-4">
        {opportunitiesByStage.map(({ stage, opportunities: stageOpportunities }) => (
          <KanbanColumn
            key={stage.key}
            stage={stage}
            opportunities={stageOpportunities}
            customers={customerMap}
          />
        ))}
      </div>
    </div>
  );
}
