"use client"

import { useState } from "react"
import { PageHeader } from "@/components/erp/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Landmark,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  CreditCard,
  CheckCircle,
  MoreHorizontal,
  Eye,
  Pencil,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// =====================================================
// TYPES & MOCK DATA
// =====================================================
interface BankAccount {
  id: string
  name: string
  bank: string
  bankCode: string
  agency: string
  accountNumber: string
  accountType: "checking" | "savings"
  balance: number
  isActive: boolean
  color: string
  lastMovement: string
}

interface BankTransaction {
  id: string
  accountId: string
  date: string
  description: string
  type: "credit" | "debit"
  amount: number
  balance: number
  category: string
}

const MOCK_ACCOUNTS: BankAccount[] = [
  {
    id: "acc-1",
    name: "Conta Principal",
    bank: "Banco do Brasil",
    bankCode: "001",
    agency: "1234-5",
    accountNumber: "00012345-6",
    accountType: "checking",
    balance: 127600,
    isActive: true,
    color: "hsl(var(--chart-1))",
    lastMovement: "18/04/2025",
  },
  {
    id: "acc-2",
    name: "Conta Reserva",
    bank: "Itaú Unibanco",
    bankCode: "341",
    agency: "5678-9",
    accountNumber: "00056789-0",
    accountType: "savings",
    balance: 85300,
    isActive: true,
    color: "hsl(var(--chart-2))",
    lastMovement: "15/04/2025",
  },
  {
    id: "acc-3",
    name: "Conta Pagamentos",
    bank: "Bradesco",
    bankCode: "237",
    agency: "9012-3",
    accountNumber: "00090123-4",
    accountType: "checking",
    balance: 34750,
    isActive: true,
    color: "hsl(var(--chart-3))",
    lastMovement: "17/04/2025",
  },
  {
    id: "acc-4",
    name: "Conta Inativa",
    bank: "Caixa Econômica",
    bankCode: "104",
    agency: "3456-7",
    accountNumber: "00034567-8",
    accountType: "checking",
    balance: 0,
    isActive: false,
    color: "hsl(var(--muted-foreground))",
    lastMovement: "01/01/2024",
  },
]

const MOCK_TRANSACTIONS: BankTransaction[] = [
  { id: "t1", accountId: "acc-1", date: "18/04", description: "Recebimento NF-008", type: "credit", amount: 19500, balance: 127600, category: "Vendas" },
  { id: "t2", accountId: "acc-1", date: "17/04", description: "Internet e Telefone", type: "debit", amount: 1800, balance: 108100, category: "Operacional" },
  { id: "t3", accountId: "acc-1", date: "16/04", description: "Recebimento NF-007", type: "credit", amount: 11200, balance: 109900, category: "Vendas" },
  { id: "t4", accountId: "acc-1", date: "15/04", description: "Marketing Digital", type: "debit", amount: 4500, balance: 98700, category: "Marketing" },
  { id: "t5", accountId: "acc-1", date: "14/04", description: "Recebimento NF-006", type: "credit", amount: 28000, balance: 103200, category: "Vendas" },
  { id: "t6", accountId: "acc-2", date: "15/04", description: "Rendimento Poupança", type: "credit", amount: 312, balance: 85300, category: "Rendimentos" },
  { id: "t7", accountId: "acc-2", date: "10/04", description: "Transferência Recebida", type: "credit", amount: 20000, balance: 84988, category: "Transferência" },
  { id: "t8", accountId: "acc-3", date: "17/04", description: "Pgto Fornecedor ABC", type: "debit", amount: 8500, balance: 34750, category: "Compras" },
  { id: "t9", accountId: "acc-3", date: "16/04", description: "Aluguel Escritório", type: "debit", amount: 6500, balance: 43250, category: "Operacional" },
  { id: "t10", accountId: "acc-3", date: "14/04", description: "Transferência Enviada", type: "debit", amount: 10000, balance: 49750, category: "Transferência" },
]

const BANK_LOGOS: Record<string, string> = {
  "001": "BB",
  "341": "IT",
  "237": "BD",
  "104": "CEF",
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

// =====================================================
// MAIN PAGE
// =====================================================
export default function BankAccountsPage() {
  const [selectedAccount, setSelectedAccount] = useState<string>("acc-1")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newAccount, setNewAccount] = useState({
    name: "",
    bank: "",
    agency: "",
    accountNumber: "",
    accountType: "checking" as "checking" | "savings",
    initialBalance: "",
  })

  const activeAccounts = MOCK_ACCOUNTS.filter((a) => a.isActive)
  const totalBalance = activeAccounts.reduce((s, a) => s + a.balance, 0)

  const selectedAcc = MOCK_ACCOUNTS.find((a) => a.id === selectedAccount)
  const accountTransactions = MOCK_TRANSACTIONS.filter((t) => t.accountId === selectedAccount)

  const handleSave = () => {
    setIsDialogOpen(false)
    setNewAccount({ name: "", bank: "", agency: "", accountNumber: "", accountType: "checking", initialBalance: "" })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas Bancárias"
        description="Gestão de contas e saldos bancários"
        icon={<Landmark className="h-6 w-6" />}
      />

      {/* Header actions */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Conta Bancária</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <FieldGroup>
                <Field>
                  <FieldLabel>Nome da Conta</FieldLabel>
                  <Input
                    placeholder="Ex: Conta Principal"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Banco</FieldLabel>
                  <Input
                    placeholder="Ex: Banco do Brasil"
                    value={newAccount.bank}
                    onChange={(e) => setNewAccount({ ...newAccount, bank: e.target.value })}
                  />
                </Field>
              </FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Agência</FieldLabel>
                  <Input
                    placeholder="0000-0"
                    value={newAccount.agency}
                    onChange={(e) => setNewAccount({ ...newAccount, agency: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Número da Conta</FieldLabel>
                  <Input
                    placeholder="00000000-0"
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Tipo de Conta</FieldLabel>
                  <Select
                    value={newAccount.accountType}
                    onValueChange={(v) => setNewAccount({ ...newAccount, accountType: v as "checking" | "savings" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Conta Corrente</SelectItem>
                      <SelectItem value="savings">Conta Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Saldo Inicial (R$)</FieldLabel>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={newAccount.initialBalance}
                    onChange={(e) => setNewAccount({ ...newAccount, initialBalance: e.target.value })}
                  />
                </Field>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar Conta</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total balance banner */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-primary-foreground/70 text-sm">Saldo Total Consolidado</p>
              <p className="text-4xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
              <p className="text-primary-foreground/70 text-sm mt-1">
                {activeAccounts.length} contas ativas
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-primary-foreground/70 text-xs">Entradas (mês)</p>
                <p className="text-xl font-semibold text-green-300">+{formatCurrency(58700)}</p>
              </div>
              <div className="text-right">
                <p className="text-primary-foreground/70 text-xs">Saídas (mês)</p>
                <p className="text-xl font-semibold text-red-300">-{formatCurrency(21300)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_ACCOUNTS.map((account) => (
          <Card
            key={account.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedAccount === account.id ? "ring-2 ring-primary" : ""
            } ${!account.isActive ? "opacity-60" : ""}`}
            onClick={() => account.isActive && setSelectedAccount(account.id)}
          >
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: account.color }}
                >
                  {BANK_LOGOS[account.bankCode] ?? <Building2 className="h-4 w-4" />}
                </div>
                <div className="flex items-center gap-2">
                  {!account.isActive && <Badge variant="secondary" className="text-xs">Inativa</Badge>}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2"><Eye className="h-4 w-4" /> Ver Extrato</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><Pencil className="h-4 w-4" /> Editar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="font-semibold text-sm">{account.name}</p>
              <p className="text-xs text-muted-foreground">{account.bank}</p>
              <p className="text-xs text-muted-foreground">
                Ag {account.agency} · CC {account.accountNumber}
              </p>

              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">Saldo disponível</p>
                <p className={`text-xl font-bold ${account.balance < 0 ? "text-destructive" : ""}`}>
                  {formatCurrency(account.balance)}
                </p>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {account.accountType === "checking" ? (
                    <><CreditCard className="h-3 w-3 mr-1" />Corrente</>
                  ) : (
                    <><Wallet className="h-3 w-3 mr-1" />Poupança</>
                  )}
                </Badge>
                {account.isActive && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Extrato da conta selecionada */}
      {selectedAcc && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: selectedAcc.color }}
                >
                  {BANK_LOGOS[selectedAcc.bankCode]}
                </div>
                <div>
                  <CardTitle className="text-base">{selectedAcc.name} — Extrato Recente</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {selectedAcc.bank} · Ag {selectedAcc.agency} · CC {selectedAcc.accountNumber}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">Ver Extrato Completo</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {accountTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Landmark className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhuma movimentação encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Categoria</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{tx.date}</td>
                        <td className="px-4 py-3 font-medium">{tx.description}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">{tx.category}</Badge>
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${tx.type === "credit" ? "text-green-600" : "text-destructive"}`}>
                          <span className="flex items-center justify-end gap-1">
                            {tx.type === "credit"
                              ? <ArrowDownLeft className="h-3 w-3" />
                              : <ArrowUpRight className="h-3 w-3" />}
                            {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatCurrency(tx.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
