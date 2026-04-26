"use client";

import Link from "next/link";
import { Plus, MoreHorizontal, FileText, Truck, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
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
import { DataTable, DataTableColumnHeader } from "@/components/erp/data-table";
import { useSalesOrders, useCustomers } from "@/contexts/erp-data-context";
import type { SalesOrder, OrderStatus } from "@/types/erp";
import { cn } from "@/lib/utils";

// =====================================================
// STATUS CONFIG
// =====================================================
const statusConfig: Record<
  OrderStatus,
  { label: string; icon: typeof Clock; color: string }
> = {
  draft: { label: "Rascunho", icon: FileText, color: "bg-muted text-muted-foreground" },
  pending: { label: "Pendente", icon: Clock, color: "bg-warning/20 text-warning" },
  approved: { label: "Aprovado", icon: CheckCircle, color: "bg-info/20 text-info" },
  processing: { label: "Em Processo", icon: Loader2, color: "bg-primary/20 text-primary" },
  shipped: { label: "Enviado", icon: Truck, color: "bg-accent/20 text-accent-foreground" },
  delivered: { label: "Entregue", icon: CheckCircle, color: "bg-success/20 text-success" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "bg-destructive/20 text-destructive" },
};

// =====================================================
// TABLE COLUMNS
// =====================================================
function createColumns(customerMap: Map<string, string>): ColumnDef<SalesOrder>[] {
  return [
    {
      accessorKey: "orderNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pedido" />
      ),
      cell: ({ row }) => {
        return (
          <Link
            href={`/vendas/pedidos/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.getValue("orderNumber")}
          </Link>
        );
      },
    },
    {
      accessorKey: "customerId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cliente" />
      ),
      cell: ({ row }) => {
        const customerId = row.getValue("customerId") as string;
        return customerMap.get(customerId) ?? "Cliente não encontrado";
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Data" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return (
          <span className="text-muted-foreground">
            {new Intl.DateTimeFormat("pt-BR").format(date)}
          </span>
        );
      },
    },
    {
      accessorKey: "items",
      header: "Itens",
      cell: ({ row }) => {
        const items = row.getValue("items") as SalesOrder["items"];
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        return (
          <span>
            {items.length} produto(s) ({totalItems} un.)
          </span>
        );
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => {
        const total = row.getValue("total") as number;
        return (
          <span className="font-semibold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(total)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as OrderStatus;
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
          <Badge className={cn("font-normal gap-1", config.color)}>
            <Icon className="size-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/vendas/pedidos/${order.id}`}>Ver detalhes</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/vendas/pedidos/${order.id}/editar`}>Editar</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Imprimir</DropdownMenuItem>
              <DropdownMenuItem>Duplicar</DropdownMenuItem>
              <DropdownMenuSeparator />
              {order.status === "pending" && (
                <DropdownMenuItem className="text-success">
                  Aprovar pedido
                </DropdownMenuItem>
              )}
              {!["cancelled", "delivered"].includes(order.status) && (
                <DropdownMenuItem className="text-destructive">
                  Cancelar pedido
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

// =====================================================
// ORDERS PAGE
// =====================================================
export default function PedidosPage() {
  const { data: orders, isLoading } = useSalesOrders();
  const { data: customers } = useCustomers();

  // Create customer lookup map
  const customerMap = new Map(customers.map((c) => [c.id, c.name]));
  const columns = createColumns(customerMap);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos de Venda"
        description="Gerencie os pedidos de venda da empresa"
        actions={
          <Button asChild>
            <Link href="/vendas/pedidos/novo">
              <Plus className="mr-2 size-4" />
              Novo Pedido
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          searchKey="orderNumber"
          searchPlaceholder="Buscar por número do pedido..."
        />
      )}
    </div>
  );
}
