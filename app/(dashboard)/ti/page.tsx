"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/erp/page-header";
import { useAuth } from "@/contexts/auth-context";
import type { UserRole, Permission } from "@/types/erp";
import {
  Users, Plus, Shield, Computer, Ticket, Search, Edit2,
  Trash2, UserCheck, UserX, Key, Check, X, AlertTriangle,
  Loader2, Eye, EyeOff, Monitor, Laptop, Printer, Phone,
  Server, HardDrive, ChevronDown, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

// =====================================================
// TYPES
// =====================================================
interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  is_active: boolean;
  permissions: string[];
  created_at: string;
  last_login?: string;
}

interface ITAssetLocal {
  id: string;
  name: string;
  type: string;
  serial_number?: string;
  manufacturer?: string;
  model?: string;
  assigned_to?: string;
  assignedUserName?: string;
  location?: string;
  status: "active" | "maintenance" | "retired";
  warranty_expiration?: string;
}

// =====================================================
// CONSTANTS — RBAC
// =====================================================
const ROLES: { value: UserRole; label: string; description: string; color: string }[] = [
  { value: "MASTER", label: "Master", description: "Acesso total ao sistema", color: "bg-red-100 text-red-700" },
  { value: "ADMINISTRATIVO", label: "Administrativo", description: "Configurações e usuários", color: "bg-orange-100 text-orange-700" },
  { value: "TI", label: "T.I.", description: "Suporte técnico e ativos", color: "bg-cyan-100 text-cyan-700" },
  { value: "FINANCEIRO", label: "Financeiro", description: "Módulo financeiro completo", color: "bg-yellow-100 text-yellow-700" },
  { value: "VENDAS", label: "Vendas", description: "CRM, clientes e pedidos", color: "bg-blue-100 text-blue-700" },
  { value: "ESTOQUE", label: "Estoque", description: "Produtos e movimentações", color: "bg-green-100 text-green-700" },
  { value: "COMPRAS", label: "Compras", description: "Fornecedores e pedidos de compra", color: "bg-purple-100 text-purple-700" },
  { value: "PRODUCAO", label: "Produção", description: "Ordens e controle de produção", color: "bg-rose-100 text-rose-700" },
  { value: "RH", label: "RH", description: "Colaboradores e folha de pagamento", color: "bg-pink-100 text-pink-700" },
  { value: "MARKETING", label: "Marketing", description: "Campanhas e leads", color: "bg-indigo-100 text-indigo-700" },
];

const MODULE_PERMISSIONS = [
  { module: "vendas", label: "Vendas", submodules: ["Clientes", "Oportunidades", "Pedidos", "Comissões"] },
  { module: "estoque", label: "Estoque", submodules: ["Produtos", "Movimentações", "Inventário"] },
  { module: "financeiro", label: "Financeiro", submodules: ["Contas a Receber", "Contas a Pagar", "Fluxo de Caixa", "Bancos"] },
  { module: "compras", label: "Compras", submodules: ["Fornecedores", "Cotações", "Pedidos de Compra"] },
  { module: "producao", label: "Produção", submodules: ["Ordens de Produção", "Estrutura de Produto", "Máquinas"] },
  { module: "rh", label: "RH", submodules: ["Colaboradores", "Ponto", "Folha de Pagamento"] },
  { module: "marketing", label: "Marketing", submodules: ["Campanhas", "Leads"] },
  { module: "ti", label: "T.I.", submodules: ["Chamados", "Ativos de TI"] },
  { module: "configuracoes", label: "Configurações", submodules: ["Geral", "Usuários", "Integrações"] },
];

// =====================================================
// MOCK DATA
// =====================================================
const MOCK_USERS: ManagedUser[] = [
  {
    id: "1", name: "João Silva", email: "joao@empresa.com", role: "VENDAS",
    department: "Comercial", is_active: true, permissions: [],
    created_at: "2024-01-15", last_login: "2025-04-20"
  },
  {
    id: "2", name: "Maria Santos", email: "maria@empresa.com", role: "FINANCEIRO",
    department: "Financeiro", is_active: true, permissions: [],
    created_at: "2024-02-10", last_login: "2025-04-19"
  },
  {
    id: "3", name: "Carlos Lima", email: "carlos@empresa.com", role: "ESTOQUE",
    department: "Logística", is_active: true, permissions: [],
    created_at: "2024-03-05", last_login: "2025-04-18"
  },
  {
    id: "4", name: "Ana Costa", email: "ana@empresa.com", role: "RH",
    department: "Recursos Humanos", is_active: false, permissions: [],
    created_at: "2024-01-20", last_login: "2025-03-10"
  },
];

const MOCK_ASSETS: ITAssetLocal[] = [
  {
    id: "1", name: "Notebook Dell XPS", type: "laptop", serial_number: "DX1234",
    manufacturer: "Dell", model: "XPS 15", assigned_to: "1", assignedUserName: "João Silva",
    status: "active", location: "Sala Comercial", warranty_expiration: "2026-06-15"
  },
  {
    id: "2", name: "Monitor LG 27\"", type: "monitor", serial_number: "LG5678",
    manufacturer: "LG", model: "27UK850", status: "active", location: "Sala Financeiro"
  },
  {
    id: "3", name: "Servidor Principal", type: "server", serial_number: "SRV001",
    manufacturer: "Dell", model: "PowerEdge R740", status: "active", location: "Datacenter"
  },
];

// =====================================================
// HELPERS
// =====================================================
function getRoleBadge(role: UserRole) {
  const r = ROLES.find(r => r.value === role);
  return r ? (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.color}`}>
      {r.label}
    </span>
  ) : null;
}

const ASSET_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  laptop: Laptop, computer: Monitor, monitor: Monitor,
  printer: Printer, phone: Phone, server: Server, other: HardDrive,
};

// =====================================================
// USER FORM MODAL
// =====================================================
interface UserFormProps {
  user?: ManagedUser | null;
  onClose: () => void;
  onSaved: (u: ManagedUser) => void;
  allUsers: ManagedUser[];
}

function UserFormModal({ user, onClose, onSaved, allUsers }: UserFormProps) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    role: (user?.role ?? "VENDAS") as UserRole,
    department: user?.department ?? "",
    is_active: user?.is_active ?? true,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRole = ROLES.find(r => r.value === form.role);

  const handleSave = async () => {
    setError("");
    if (!form.name || !form.email) { setError("Nome e e-mail são obrigatórios"); return; }
    if (!isEdit && !form.password) { setError("Senha é obrigatória para novo usuário"); return; }

    setLoading(true);
    // Em produção, chama API. Por enquanto, mock.
    await new Promise(r => setTimeout(r, 600));

    const saved: ManagedUser = {
      id: user?.id ?? Date.now().toString(),
      ...form,
      permissions: user?.permissions ?? [],
      created_at: user?.created_at ?? new Date().toISOString(),
      last_login: user?.last_login,
    };
    onSaved(saved);
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do usuário" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="usuario@empresa.com" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isEdit ? "Nova Senha (deixe em branco para manter)" : "Senha *"}
              </label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
              <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Ex: Comercial" />
            </div>
            <div className="flex items-center justify-between pt-5">
              <label className="text-sm font-medium text-gray-700">Usuário ativo</label>
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Perfil de Acesso *</label>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {ROLES.map(role => (
                <button key={role.value}
                  onClick={() => setForm(f => ({ ...f, role: role.value }))}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    form.role === role.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-1 ${role.color}`}>
                    {role.label}
                  </span>
                  <p className="text-xs text-gray-500 leading-tight">{role.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Role preview */}
          {selectedRole && (
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs font-medium text-gray-700 mb-1">Acesso do perfil <strong>{selectedRole.label}</strong>:</p>
              {form.role === "MASTER" ? (
                <p className="text-xs text-gray-500">✓ Acesso total a todos os módulos do sistema</p>
              ) : (
                <p className="text-xs text-gray-500">{selectedRole.description}. O usuário verá apenas os módulos permitidos no menu.</p>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-600">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            {isEdit ? "Salvar alterações" : "Criar usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================
// PERMISSIONS MATRIX MODAL
// =====================================================
function PermissionsModal({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const role = ROLES.find(r => r.value === user.role);
  const isMaster = user.role === "MASTER";

  // Derive default module access from role
  const defaultModules: Record<string, boolean> = {};
  MODULE_PERMISSIONS.forEach(m => {
    if (isMaster) { defaultModules[m.module] = true; return; }
    const roleModuleMap: Record<UserRole, string[]> = {
      MASTER: ["all"],
      ADMINISTRATIVO: ["configuracoes"],
      VENDAS: ["vendas"],
      ESTOQUE: ["estoque"],
      PRODUCAO: ["producao"],
      RH: ["rh"],
      FINANCEIRO: ["financeiro"],
      COMPRAS: ["compras"],
      TI: ["ti", "configuracoes"],
      MARKETING: ["marketing"],
    };
    defaultModules[m.module] = roleModuleMap[user.role]?.includes(m.module) ?? false;
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key size={16} />
            Permissões — {user.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1 py-2">
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl mb-4">
            <AlertTriangle size={14} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700">
              As permissões são definidas principalmente pelo <strong>Perfil ({role?.label})</strong>.
              Aqui você pode visualizar o acesso padrão de cada módulo.
            </p>
          </div>

          {isMaster ? (
            <div className="p-4 bg-red-50 rounded-xl text-sm text-red-700 font-medium text-center">
              🔴 MASTER — Acesso irrestrito a todos os módulos
            </div>
          ) : (
            <div className="space-y-2">
              {MODULE_PERMISSIONS.map(mod => {
                const hasAccess = defaultModules[mod.module];
                return (
                  <div key={mod.module}
                    className={`p-3 rounded-xl border ${hasAccess ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {hasAccess
                          ? <Check size={14} className="text-green-600" />
                          : <X size={14} className="text-gray-400" />}
                        <span className={`text-sm font-medium ${hasAccess ? "text-green-800" : "text-gray-500"}`}>
                          {mod.label}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${hasAccess ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                        {hasAccess ? "Liberado" : "Bloqueado"}
                      </span>
                    </div>
                    {hasAccess && (
                      <div className="mt-1.5 flex flex-wrap gap-1 pl-5">
                        {mod.submodules.map(sub => (
                          <span key={sub} className="text-xs bg-white text-green-700 border border-green-200 px-1.5 py-0.5 rounded">
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================
// USERS TAB
// =====================================================
function UsersTab() {
  const [users, setUsers] = useState<ManagedUser[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [editUser, setEditUser] = useState<ManagedUser | null | undefined>(undefined);
  const [permUser, setPermUser] = useState<ManagedUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleSaved = (u: ManagedUser) => {
    setUsers(us => {
      const idx = us.findIndex(x => x.id === u.id);
      if (idx >= 0) { const copy = [...us]; copy[idx] = u; return copy; }
      return [u, ...us];
    });
    setEditUser(undefined);
  };

  const handleDelete = (id: string) => {
    setUsers(us => us.filter(u => u.id !== id));
    setDeleteId(null);
  };

  const toggleActive = (u: ManagedUser) => {
    setUsers(us => us.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar usuário..." className="pl-8 h-9" />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="all">Todos os perfis</option>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <Button size="sm" onClick={() => setEditUser(null)} className="h-9">
          <Plus size={14} className="mr-1.5" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats pills */}
      <div className="flex gap-3 text-xs text-gray-500">
        <span>{users.length} total</span>
        <span className="text-green-600">{users.filter(u => u.is_active).length} ativos</span>
        <span className="text-red-500">{users.filter(u => !u.is_active).length} inativos</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuário</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Perfil</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Departamento</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Último acesso</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{user.department ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString("pt-BR") : "Nunca"}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {user.is_active ? <UserCheck size={10} /> : <UserX size={10} />}
                    {user.is_active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setPermUser(user)}
                      className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors text-gray-400"
                      title="Ver permissões">
                      <Key size={14} />
                    </button>
                    <button onClick={() => setEditUser(user)}
                      className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-gray-400"
                      title="Editar">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => toggleActive(user)}
                      className="p-1.5 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors text-gray-400"
                      title={user.is_active ? "Desativar" : "Ativar"}>
                      {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>
                    <button onClick={() => setDeleteId(user.id)}
                      className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-400"
                      title="Excluir">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {editUser !== undefined && (
        <UserFormModal user={editUser} onClose={() => setEditUser(undefined)} onSaved={handleSaved} allUsers={users} />
      )}
      {permUser && (
        <PermissionsModal user={permUser} onClose={() => setPermUser(null)} />
      )}
      {deleteId && (
        <Dialog open onOpenChange={() => setDeleteId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 size={16} />
                Confirmar exclusão
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600">
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={() => handleDelete(deleteId)}>
                <Trash2 size={14} className="mr-1.5" />
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// =====================================================
// ASSETS TAB
// =====================================================
function AssetsTab() {
  const [assets, setAssets] = useState<ITAssetLocal[]>(MOCK_ASSETS);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "laptop", serial_number: "", manufacturer: "",
    model: "", location: "", status: "active" as ITAssetLocal["status"],
  });

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.manufacturer ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    active: "bg-green-50 text-green-700",
    maintenance: "bg-yellow-50 text-yellow-700",
    retired: "bg-gray-100 text-gray-500",
  };
  const statusLabels = { active: "Ativo", maintenance: "Em manutenção", retired: "Desativado" };

  const handleAddAsset = () => {
    if (!form.name) return;
    const asset: ITAssetLocal = {
      id: Date.now().toString(),
      ...form,
    };
    setAssets(as => [asset, ...as]);
    setShowForm(false);
    setForm({ name: "", type: "laptop", serial_number: "", manufacturer: "", model: "", location: "", status: "active" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ativo..." className="pl-8 h-9" />
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} className="h-9">
          <Plus size={14} className="mr-1.5" />
          Novo Ativo
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border border-indigo-200 rounded-xl p-4 shadow-sm">
          <h4 className="font-medium text-gray-900 mb-3">Novo Ativo de TI</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Nome do ativo *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {["laptop", "computer", "monitor", "printer", "phone", "server", "other"].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <Input placeholder="Fabricante" value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} />
            <Input placeholder="Modelo" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
            <Input placeholder="N° de série" value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} />
            <Input placeholder="Localização" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleAddAsset}>Adicionar</Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {filtered.map(asset => {
          const Icon = ASSET_ICONS[asset.type] ?? HardDrive;
          return (
            <div key={asset.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-gray-300 transition-colors">
              <div className="p-2.5 bg-cyan-50 rounded-xl shrink-0">
                <Icon size={18} className="text-cyan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-gray-900">{asset.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[asset.status]}`}>
                    {statusLabels[asset.status]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                  {asset.manufacturer && <span>{asset.manufacturer} {asset.model}</span>}
                  {asset.serial_number && <span>S/N: {asset.serial_number}</span>}
                  {asset.location && <span>📍 {asset.location}</span>}
                  {asset.assignedUserName && <span>👤 {asset.assignedUserName}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setAssets(as => as.filter(a => a.id !== asset.id))}
                  className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors text-gray-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <Computer size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum ativo encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// TICKETS TAB (placeholder)
// =====================================================
function TicketsTab() {
  const MOCK_TICKETS = [
    { id: "1", title: "Computador não liga", category: "Hardware", priority: "high", status: "open", requester: "João Silva", created_at: "2025-04-20" },
    { id: "2", title: "Sem acesso ao sistema de vendas", category: "Software", priority: "medium", status: "in_progress", requester: "Maria Santos", created_at: "2025-04-19" },
    { id: "3", title: "Impressora travando", category: "Hardware", priority: "low", status: "resolved", requester: "Carlos Lima", created_at: "2025-04-18" },
  ];

  const priorityColors = { low: "bg-gray-100 text-gray-600", medium: "bg-yellow-100 text-yellow-700", high: "bg-orange-100 text-orange-700", critical: "bg-red-100 text-red-700" };
  const statusColors = { open: "bg-blue-100 text-blue-700", in_progress: "bg-indigo-100 text-indigo-700", waiting: "bg-amber-100 text-amber-700", resolved: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-500" };
  const statusLabels: Record<string, string> = { open: "Aberto", in_progress: "Em andamento", waiting: "Aguardando", resolved: "Resolvido", closed: "Fechado" };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{MOCK_TICKETS.length} chamados</p>
        <Button size="sm">
          <Plus size={14} className="mr-1.5" />
          Novo Chamado
        </Button>
      </div>
      {MOCK_TICKETS.map(t => (
        <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-gray-900">{t.title}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[t.priority as keyof typeof priorityColors]}`}>
                  {t.priority}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-gray-400">
                <span>{t.category}</span>
                <span>Por {t.requester}</span>
                <span>{new Date(t.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
            <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status as keyof typeof statusColors]}`}>
              {statusLabels[t.status] ?? t.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// =====================================================
// MAIN PAGE
// =====================================================
export default function TIPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="T.I."
        description="Gestão de usuários, ativos e suporte técnico"
      />

      <Tabs defaultValue="usuarios">
        <TabsList className="bg-white border border-gray-200 p-1 rounded-xl">
          <TabsTrigger value="usuarios" className="flex items-center gap-1.5 rounded-lg">
            <Users size={14} />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="permissoes" className="flex items-center gap-1.5 rounded-lg">
            <Shield size={14} />
            Perfis &amp; Permissões
          </TabsTrigger>
          <TabsTrigger value="ativos" className="flex items-center gap-1.5 rounded-lg">
            <Computer size={14} />
            Ativos
          </TabsTrigger>
          <TabsTrigger value="chamados" className="flex items-center gap-1.5 rounded-lg">
            <Ticket size={14} />
            Chamados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="mt-4">
          <UsersTab />
        </TabsContent>

        <TabsContent value="permissoes" className="mt-4">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Veja abaixo os módulos acessíveis por cada perfil do sistema.
              Para alterar o perfil de um usuário, acesse a aba <strong>Usuários</strong>.
            </p>
            <div className="grid gap-3">
              {ROLES.map(role => {
                const roleModuleMap: Record<string, string[]> = {
                  MASTER: MODULE_PERMISSIONS.map(m => m.module),
                  ADMINISTRATIVO: ["configuracoes"],
                  TI: ["ti", "configuracoes"],
                  FINANCEIRO: ["financeiro"],
                  VENDAS: ["vendas"],
                  ESTOQUE: ["estoque"],
                  COMPRAS: ["compras"],
                  PRODUCAO: ["producao"],
                  RH: ["rh"],
                  MARKETING: ["marketing"],
                };
                const mods = roleModuleMap[role.value] ?? [];
                const modLabels = MODULE_PERMISSIONS.filter(m => mods.includes(m.module) || role.value === "MASTER").map(m => m.label);

                return (
                  <div key={role.value} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${role.color}`}>
                          {role.label}
                        </span>
                        <p className="text-xs text-gray-500 mb-2">{role.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {role.value === "MASTER" ? (
                            <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                              ★ Todos os módulos
                            </span>
                          ) : modLabels.map(l => (
                            <span key={l} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ativos" className="mt-4">
          <AssetsTab />
        </TabsContent>

        <TabsContent value="chamados" className="mt-4">
          <TicketsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
