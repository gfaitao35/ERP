"use client";

import Link from "next/link";
import { Plus, MoreHorizontal, Mail, Phone, Building2 } from "lucide-react";
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
import { useCustomers } from "@/contexts/erp-data-context";
import type { Customer } from "@/types/erp";

// =====================================================
// TABLE COLUMNS
// =====================================================
const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    ),
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="font-medium">{customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.document}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contato" />
    ),
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex flex-col gap-1">
          {customer.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail className="size-3 text-muted-foreground" />
              <span>{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="size-3 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "leadSource",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Origem" />
    ),
    cell: ({ row }) => {
      const source = row.getValue("leadSource") as string | undefined;
      const sourceLabels: Record<string, string> = {
        google_ads: "Google Ads",
        meta_ads: "Meta Ads",
        indicacao: "Indicação",
        organico: "Orgânico",
        whatsapp: "WhatsApp",
      };
      return source ? (
        <Badge variant="outline">{sourceLabels[source] ?? source}</Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[] | undefined;
      if (!tags || tags.length === 0) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cadastro" />
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
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;
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
              <Link href={`/vendas/clientes/${customer.id}`}>Ver detalhes</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/vendas/clientes/${customer.id}/editar`}>Editar</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Nova oportunidade</DropdownMenuItem>
            <DropdownMenuItem>Novo pedido</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// =====================================================
// CUSTOMERS PAGE
// =====================================================
export default function ClientesPage() {
  const { data: customers, isLoading } = useCustomers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie o cadastro de clientes da empresa"
        actions={
          <Button asChild>
            <Link href="/vendas/clientes/novo">
              <Plus className="mr-2 size-4" />
              Novo Cliente
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
          data={customers}
          searchKey="name"
          searchPlaceholder="Buscar por nome..."
        />
      )}
    </div>
  );
}
