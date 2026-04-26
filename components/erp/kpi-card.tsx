"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardKPI } from "@/types/erp";

// =====================================================
// FORMAT UTILITIES
// =====================================================
function formatValue(value: number, format: DashboardKPI["format"]) {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "number":
    default:
      return new Intl.NumberFormat("pt-BR").format(value);
  }
}

function formatChange(change: number) {
  const prefix = change > 0 ? "+" : "";
  return `${prefix}${change.toFixed(1)}%`;
}

// =====================================================
// KPI CARD COMPONENT
// =====================================================
interface KPICardProps {
  kpi: DashboardKPI;
  className?: string;
}

export function KPICard({ kpi, className }: KPICardProps) {
  const { title, value, change, changeType, format } = kpi;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <span
            className={cn(
              "text-2xl font-bold tracking-tight",
              value < 0 && "text-destructive"
            )}
          >
            {formatValue(value, format)}
          </span>
          {change !== undefined && changeType && (
            <div className="flex items-center gap-1">
              {changeType === "increase" ? (
                <TrendingUp className="size-4 text-success" />
              ) : changeType === "decrease" ? (
                <TrendingDown className="size-4 text-destructive" />
              ) : (
                <Minus className="size-4 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  changeType === "increase" && "text-success",
                  changeType === "decrease" && "text-destructive",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {formatChange(change)}
              </span>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
          )}
        </div>
        {/* Decorative gradient */}
        <div
          className={cn(
            "absolute -right-8 -top-8 size-24 rounded-full opacity-10",
            changeType === "increase" && "bg-success",
            changeType === "decrease" && "bg-destructive",
            !changeType && "bg-primary"
          )}
        />
      </CardContent>
    </Card>
  );
}

// =====================================================
// KPI GRID COMPONENT
// =====================================================
interface KPIGridProps {
  kpis: DashboardKPI[];
  className?: string;
}

export function KPIGrid({ kpis, className }: KPIGridProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", className)}>
      {kpis.map((kpi) => (
        <KPICard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}

// =====================================================
// MINI KPI (for inline use)
// =====================================================
interface MiniKPIProps {
  label: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  className?: string;
}

export function MiniKPI({ label, value, change, changeType, className }: MiniKPIProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold">{value}</span>
        {change !== undefined && changeType && (
          <span
            className={cn(
              "text-xs font-medium",
              changeType === "increase" && "text-success",
              changeType === "decrease" && "text-destructive"
            )}
          >
            {formatChange(change)}
          </span>
        )}
      </div>
    </div>
  );
}
