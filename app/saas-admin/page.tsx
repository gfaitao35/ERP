"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2, Plus, Users, LogOut, CheckCircle, XCircle,
  ChevronRight, Globe, Loader2, Eye, EyeOff, BarChart3,
  Crown, Zap, Shield, Trash2, RefreshCw, X, Check,
  AlertTriangle, ExternalLink, Copy, UserPlus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Tenant {
  id: string; name: string; slug: string;
  plan: "starter" | "professional" | "enterprise";
  is_active: boolean; modules: string[]; currency: string;
  created_at: string; active_users: number; total_users: number;
}
interface AdminUser { id: string; email: string; name: string }

interface CreatedUser {
  name: string;
  email: string;
  password: string;
  role: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_MODULES = [
  { key: "dashboard",  label: "Dashboard",  color: "#6366F1", description: "Painel de controle e KPIs" },
  { key: "vendas",     label: "Vendas",     color: "#3B82F6", description: "Gestão de vendas e clientes" },
  { key: "estoque",    label: "Estoque",    color: "#10B981", description: "Controle de inventário" },
  { key: "financeiro", label: "Financeiro", color: "#F59E0B", description: "Contas a pagar/receber" },
  { key: "compras",    label: "Compras",    color: "#8B5CF6", description: "Gestão de fornecedores" },
  { key: "producao",   label: "Produção",   color: "#EF4444", description: "Ordens de produção" },
  { key: "rh",         label: "RH",         color: "#EC4899", description: "Recursos humanos" },
  { key: "marketing",  label: "Marketing",  color: "#F97316", description: "Campanhas e leads" },
  { key: "ti",         label: "T.I.",       color: "#06B6D4", description: "Suporte e chamados" },
];

const PLANS = {
  starter:      { label: "Starter",      Icon: Zap,      color: "#6B7280", bg: "#F3F4F6" },
  professional: { label: "Professional", Icon: BarChart3, color: "#3B82F6", bg: "#EFF6FF" },
  enterprise:   { label: "Enterprise",   Icon: Crown,     color: "#7C3AED", bg: "#F5F3FF" },
};

const SAAS_EMAIL = "admin@saas.com";
const SAAS_PASS  = "admin123";
const LS_TENANTS = "saas_tenants";
const LS_ERP_T   = "erp_tenants";
const LS_ERP_U   = "erp_users";

// ─── localStorage ─────────────────────────────────────────────────────────────
function lsGet<T>(k: string, fb: T): T {
  if (typeof window === "undefined") return fb;
  try { return JSON.parse(localStorage.getItem(k) ?? "null") ?? fb; } catch { return fb; }
}
function lsSet(k: string, v: unknown) {
  if (typeof window !== "undefined") localStorage.setItem(k, JSON.stringify(v));
}

// ─── Generate Password ────────────────────────────────────────────────────────
function generatePassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// ─── ERP sync ─────────────────────────────────────────────────────────────────
function syncToERP(tenant: Tenant, users: CreatedUser[]) {
  // Sync tenant
  const erpTenant = {
    id: tenant.id, name: tenant.name, slug: tenant.slug, plan: tenant.plan,
    isActive: tenant.is_active,
    settings: {
      currency: tenant.currency, timezone: "America/Sao_Paulo",
      dateFormat: "DD/MM/YYYY", fiscalYearStart: 1,
      modules: tenant.modules, integrations: [],
    },
    createdAt: tenant.created_at, updatedAt: new Date().toISOString(),
  };
  const ts = (lsGet(LS_ERP_T, []) as Array<{ id: string }>).filter(t => t.id !== tenant.id);
  lsSet(LS_ERP_T, [...ts, erpTenant]);

  // Sync users
  const existingUsers = lsGet(LS_ERP_U, []) as Array<{ id: string; tenantId: string }>;
  const filteredUsers = existingUsers.filter(u => u.tenantId !== tenant.id);
  
  const newErpUsers = users.map((user, idx) => ({
    id: `user_${tenant.id}_${idx}`,
    tenantId: tenant.id,
    email: user.email,
    password: user.password,
    name: user.name,
    role: user.role,
    permissions: user.role === "MASTER" ? ["all"] : user.role === "TI" ? ["ti", "chamados", "ativos", "suporte"] : [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  
  lsSet(LS_ERP_U, [...filteredUsers, ...newErpUsers]);
}

function syncTenantOnly(tenant: Tenant) {
  const erpTenant = {
    id: tenant.id, name: tenant.name, slug: tenant.slug, plan: tenant.plan,
    isActive: tenant.is_active,
    settings: {
      currency: tenant.currency, timezone: "America/Sao_Paulo",
      dateFormat: "DD/MM/YYYY", fiscalYearStart: 1,
      modules: tenant.modules, integrations: [],
    },
    createdAt: tenant.created_at, updatedAt: new Date().toISOString(),
  };
  const ts = (lsGet(LS_ERP_T, []) as Array<{ id: string }>).filter(t => t.id !== tenant.id);
  lsSet(LS_ERP_T, [...ts, erpTenant]);
}

// ─── API ──────────────────────────────────────────────────────────────────────
async function api(path: string, opts?: RequestInit) {
  try {
    const r = await fetch(path, { ...opts, signal: AbortSignal.timeout(4000) });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const INPUT = [
  "w-full border border-gray-300 rounded-xl px-4 py-2.5",
  "text-sm text-gray-900 placeholder-gray-400 bg-white",
  "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
].join(" ");

const LABEL = "block text-sm font-medium text-gray-700 mb-1.5";

// ─── Badges ───────────────────────────────────────────────────────────────────
function PlanBadge({ plan }: { plan: Tenant["plan"] }) {
  const p = PLANS[plan]; const { Icon } = p;
  return (
    <span style={{ background: p.bg, color: p.color }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold">
      <Icon size={10} />{p.label}
    </span>
  );
}
function StatusDot({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
      active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
      {active ? <CheckCircle size={10} /> : <XCircle size={10} />}
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

// ─── Modal nova empresa ────────────────────────────────────────────────────────
function NewTenantModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (t: Tenant, users: CreatedUser[]) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    name: "", slug: "", plan: "starter" as Tenant["plan"],
    currency: "BRL", modules: [] as string[],
  });
  const [adminCreds, setAdminCreds] = useState({ name: "Administrador", email: "", password: "" });
  const [tiCreds, setTiCreds] = useState({ name: "Suporte T.I.", email: "", password: "" });
  const [showPass, setShowPass] = useState({ admin: false, ti: false });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
     .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Auto-generate emails and passwords
  useEffect(() => {
    if (form.slug) {
      setAdminCreds(c => ({
        ...c,
        email: c.email || `admin@${form.slug}.com`,
        password: c.password || generatePassword(),
      }));
      setTiCreds(c => ({
        ...c,
        email: c.email || `ti@${form.slug}.com`,
        password: c.password || generatePassword(),
      }));
    }
  }, [form.slug]);

  const goStep2 = () => {
    if (!form.name.trim()) return setErr("Nome da empresa é obrigatório");
    if (!form.slug.trim()) return setErr("Slug é obrigatório");
    if (form.modules.length === 0) return setErr("Selecione ao menos 1 módulo");
    setErr(""); setStep(2);
  };

  const goStep3 = () => {
    if (!adminCreds.email.trim()) return setErr("E-mail do Admin é obrigatório");
    if (adminCreds.password.length < 6) return setErr("Senha do Admin precisa ter pelo menos 6 caracteres");
    setErr(""); setStep(3);
  };

  const submit = async () => {
    if (!tiCreds.email.trim()) return setErr("E-mail do T.I. é obrigatório");
    if (tiCreds.password.length < 6) return setErr("Senha do T.I. precisa ter pelo menos 6 caracteres");
    setErr(""); setLoading(true);

    // Sempre incluir T.I. nos módulos (para o usuário T.I. poder acessar)
    const modules = form.modules.includes("ti") ? form.modules : [...form.modules, "ti"];

    const res = await api("/api/saas/tenants", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, modules }),
    });

    const tenant: Tenant = res?.success ? res.data : {
      id: `t_${Date.now()}`, ...form, modules,
      is_active: true, created_at: new Date().toISOString(),
      active_users: 2, total_users: 2,
    };

    const users: CreatedUser[] = [
      { name: adminCreds.name, email: adminCreds.email, password: adminCreds.password, role: "MASTER" },
      { name: tiCreds.name, email: tiCreds.email, password: tiCreds.password, role: "TI" },
    ];

    onCreated(tenant, users);
    setLoading(false);
  };

  const toggleMod = (k: string) =>
    setForm(f => ({ ...f, modules: f.modules.includes(k) ? f.modules.filter(m => m !== k) : [...f.modules, k] }));

  const selectAll = () => setForm(f => ({ ...f, modules: ALL_MODULES.map(m => m.key) }));
  const deselectAll = () => setForm(f => ({ ...f, modules: [] }));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nova Empresa</h2>
            <p className="text-sm text-gray-500">
              Passo {step} de 3 — {step === 1 ? "Dados e módulos" : step === 2 ? "Usuário Admin" : "Usuário T.I."}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><X size={18} /></button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4 flex gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-indigo-600" />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-indigo-600" : "bg-gray-200"}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors ${step === 3 ? "bg-indigo-600" : "bg-gray-200"}`} />
        </div>

        {/* Step 1: Company Data & Modules */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div>
              <label className={LABEL}>Nome da Empresa *</label>
              <input className={INPUT} placeholder="Ex: Empresa Granada Ltda" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} />
            </div>

            <div>
              <label className={LABEL}>Slug <span className="font-normal text-gray-400">(identificador único)</span></label>
              <div className="flex border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
                <span className="px-3 py-2.5 bg-gray-100 text-gray-500 text-sm border-r border-gray-300 shrink-0">erp.app/</span>
                <input className="flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none"
                  placeholder="minha-empresa" value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))} />
              </div>
            </div>

            <div>
              <label className={LABEL}>Plano</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(PLANS) as [Tenant["plan"], typeof PLANS.starter][]).map(([k, p]) => {
                  const { Icon } = p; const sel = form.plan === k;
                  return (
                    <button key={k} onClick={() => setForm(f => ({ ...f, plan: k }))}
                      style={sel ? { borderColor: p.color, background: p.bg } : {}}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${sel ? "" : "border-gray-200 hover:border-gray-300"}`}>
                      <Icon size={18} style={{ color: p.color }} className="mx-auto mb-1" />
                      <span className="text-xs font-semibold" style={{ color: p.color }}>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Módulos Contratados *</label>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors">
                    Selecionar Todos
                  </button>
                  <button onClick={deselectAll} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    Limpar
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                {ALL_MODULES.map(m => {
                  const sel = form.modules.includes(m.key);
                  return (
                    <button key={m.key} onClick={() => toggleMod(m.key)}
                      className={`p-3 rounded-xl text-left transition-all border-2 ${
                        sel ? "border-current bg-white shadow-sm" : "border-transparent hover:bg-white"
                      }`}
                      style={sel ? { borderColor: m.color } : {}}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${sel ? "text-white" : ""}`}
                          style={{ backgroundColor: sel ? m.color : m.color + "30" }}>
                          {sel && <Check size={10} />}
                        </div>
                        <span className="text-sm font-medium" style={{ color: sel ? m.color : "#374151" }}>{m.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 ml-6">{m.description}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Módulos selecionados: {form.modules.length} de {ALL_MODULES.length}
              </p>
            </div>

            <div>
              <label className={LABEL}>Moeda</label>
              <select className={INPUT + " cursor-pointer"} value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                <option value="BRL">BRL — Real Brasileiro</option>
                <option value="USD">USD — Dólar Americano</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Admin User */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus size={16} className="text-indigo-600" />
                <p className="text-sm font-semibold text-indigo-900">Usuário Administrador (MASTER)</p>
              </div>
              <p className="text-xs text-indigo-600">Acesso total ao ERP. Pode gerenciar todos os módulos contratados.</p>
            </div>

            <div>
              <label className={LABEL}>Nome do Administrador *</label>
              <input className={INPUT} placeholder="Ex: João Silva"
                value={adminCreds.name} onChange={e => setAdminCreds(c => ({ ...c, name: e.target.value }))} />
            </div>

            <div>
              <label className={LABEL}>E-mail do Administrador *</label>
              <input type="email" className={INPUT} placeholder="admin@empresa.com"
                value={adminCreds.email} onChange={e => setAdminCreds(c => ({ ...c, email: e.target.value }))} />
            </div>

            <div>
              <label className={LABEL}>Senha *</label>
              <div className="relative">
                <input type={showPass.admin ? "text" : "password"} className={INPUT + " pr-10"}
                  placeholder="mínimo 6 caracteres"
                  value={adminCreds.password} onChange={e => setAdminCreds(c => ({ ...c, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(s => ({ ...s, admin: !s.admin }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800">
                  {showPass.admin ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-700">
                <strong>Módulos com acesso:</strong> {form.modules.length === ALL_MODULES.length ? "Todos os módulos" : form.modules.map(m => ALL_MODULES.find(x => x.key === m)?.label).join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: T.I. User */}
        {step === 3 && (
          <div className="p-6 space-y-5">
            <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-100">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus size={16} className="text-cyan-600" />
                <p className="text-sm font-semibold text-cyan-900">Usuário de T.I.</p>
              </div>
              <p className="text-xs text-cyan-600">Acesso ao módulo de T.I. (chamados, ativos, suporte técnico).</p>
            </div>

            <div>
              <label className={LABEL}>Nome do Suporte T.I. *</label>
              <input className={INPUT} placeholder="Ex: Carlos Técnico"
                value={tiCreds.name} onChange={e => setTiCreds(c => ({ ...c, name: e.target.value }))} />
            </div>

            <div>
              <label className={LABEL}>E-mail do T.I. *</label>
              <input type="email" className={INPUT} placeholder="ti@empresa.com"
                value={tiCreds.email} onChange={e => setTiCreds(c => ({ ...c, email: e.target.value }))} />
            </div>

            <div>
              <label className={LABEL}>Senha *</label>
              <div className="relative">
                <input type={showPass.ti ? "text" : "password"} className={INPUT + " pr-10"}
                  placeholder="mínimo 6 caracteres"
                  value={tiCreds.password} onChange={e => setTiCreds(c => ({ ...c, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPass(s => ({ ...s, ti: !s.ti }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800">
                  {showPass.ti ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 font-medium mb-2">Resumo da empresa:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-400">Empresa:</span> <span className="text-gray-900">{form.name}</span></div>
                <div><span className="text-gray-400">Plano:</span> <span className="text-gray-900">{PLANS[form.plan].label}</span></div>
                <div className="col-span-2"><span className="text-gray-400">Módulos:</span> <span className="text-gray-900">{form.modules.length} selecionados</span></div>
              </div>
            </div>
          </div>
        )}

        {err && (
          <div className="mx-6 mb-2 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <AlertTriangle size={14} className="shrink-0" />{err}
          </div>
        )}

        <div className="p-6 border-t border-gray-100 flex gap-3">
          {step === 1 && (
            <>
              <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={goStep2} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                Próximo <ChevronRight size={14} />
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button onClick={() => { setStep(1); setErr(""); }} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Voltar</button>
              <button onClick={goStep3} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                Próximo <ChevronRight size={14} />
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <button onClick={() => { setStep(2); setErr(""); }} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Voltar</button>
              <button onClick={submit} disabled={loading} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {loading ? "Criando..." : "Criar Empresa"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Credentials Modal ────────────────────────────────────────────────────────
function CredentialsModal({ tenant, users, onClose }: {
  tenant: Tenant; users: CreatedUser[]; onClose: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (v: string, k: string) => {
    navigator.clipboard.writeText(v);
    setCopied(k); setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 text-center">
          <div className="inline-flex p-3 bg-green-100 rounded-2xl mb-3">
            <CheckCircle size={28} className="text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Empresa criada com sucesso!</h2>
          <p className="text-sm text-gray-500 mt-1">Guarde estas credenciais com segurança</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Company Info */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Empresa</p>
                <p className="text-sm font-semibold text-gray-900">{tenant.name}</p>
              </div>
              <PlanBadge plan={tenant.plan} />
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Módulos contratados:</p>
              <div className="flex flex-wrap gap-1">
                {tenant.modules.map(mod => {
                  const m = ALL_MODULES.find(x => x.key === mod);
                  if (!m) return null;
                  return (
                    <span key={mod} style={{ background: m.color + "18", color: m.color }}
                      className="px-2 py-0.5 rounded text-xs font-medium">{m.label}</span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Users */}
          {users.map((user, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${user.role === "MASTER" ? "bg-indigo-100 text-indigo-600" : "bg-cyan-100 text-cyan-600"}`}>
                    <Users size={12} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === "MASTER" ? "bg-indigo-100 text-indigo-700" : "bg-cyan-100 text-cyan-700"}`}>
                    {user.role === "MASTER" ? "Admin" : "T.I."}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">E-mail</p>
                  <p className="text-sm font-mono text-gray-900">{user.email}</p>
                </div>
                <button onClick={() => copy(user.email, `e${idx}`)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                  {copied === `e${idx}` ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex items-center justify-between p-3">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Senha</p>
                  <p className="text-sm font-mono text-gray-900">{user.password}</p>
                </div>
                <button onClick={() => copy(user.password, `p${idx}`)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors">
                  {copied === `p${idx}` ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <AlertTriangle size={13} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">Estas credenciais não serão exibidas novamente. Os usuários podem alterá-las dentro do ERP.</p>
          </div>

          <a href="/login" target="_blank"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
            <ExternalLink size={14} />Abrir Login do ERP
          </a>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full text-sm text-gray-500 hover:text-gray-800 transition-colors py-1">Fechar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (a: AdminUser) => void }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [show,  setShow]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setLoading(true);
    const res = await api("/api/saas/auth", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });
    if (res?.success) { onLogin(res.admin); setLoading(false); return; }
    if (email === SAAS_EMAIL && pass === SAAS_PASS) {
      onLogin({ id: "local", email, name: "Super Admin" }); setLoading(false); return;
    }
    setErr(`Credenciais inválidas. Use: ${SAAS_EMAIL} / ${SAAS_PASS}`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px,white 1px,transparent 0)", backgroundSize: "36px 36px" }} />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 mb-4">
            <Shield size={32} className="text-indigo-300" />
          </div>
          <h1 className="text-2xl font-bold text-white">SaaS Admin</h1>
          <p className="text-indigo-300 text-sm mt-1">Painel de administração do ERP</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1.5">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-white border border-white/30 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="admin@saas.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1.5">Senha</label>
              <div className="relative">
                <input type={show ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} required
                  className="w-full bg-white border border-white/30 rounded-xl px-4 py-3 pr-10 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {err && (
              <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-sm text-red-300">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />{err}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              {loading ? "Verificando..." : "Acessar Painel"}
            </button>
          </form>
          <div className="mt-5 p-3 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs text-indigo-300 text-center">
              Padrão: <span className="text-white font-mono">{SAAS_EMAIL}</span> / <span className="text-white font-mono">{SAAS_PASS}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ admin, onLogout }: { admin: AdminUser; onLogout: () => void }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [creds, setCreds] = useState<{ tenant: Tenant; users: CreatedUser[] } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const load = useCallback(async () => {
    setLoading(true);
    const local: Tenant[] = lsGet(LS_TENANTS, []);
    setTenants(local);
    const res = await api("/api/saas/tenants");
    if (res?.success && res.data?.length) {
      setTenants(res.data); lsSet(LS_TENANTS, res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (t: Tenant, users: CreatedUser[]) => {
    const list = [t, ...tenants];
    setTenants(list); lsSet(LS_TENANTS, list);
    syncToERP(t, users);
    setShowNew(false);
    setCreds({ tenant: t, users });
  };

  const toggleActive = async (t: Tenant) => {
    const updated = { ...t, is_active: !t.is_active };
    const list = tenants.map(x => x.id === t.id ? updated : x);
    setTenants(list); lsSet(LS_TENANTS, list);
    syncTenantOnly(updated);
    await api(`/api/saas/tenants/${t.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !t.is_active }),
    });
  };

  const deleteTenant = (id: string) => {
    const list = tenants.filter(t => t.id !== id);
    setTenants(list); lsSet(LS_TENANTS, list);
    const erpTs = (lsGet(LS_ERP_T, []) as Array<{ id: string }>).filter(t => t.id !== id);
    lsSet(LS_ERP_T, erpTs);
    const erpUs = (lsGet(LS_ERP_U, []) as Array<{ tenantId: string }>).filter(u => u.tenantId !== id);
    lsSet(LS_ERP_U, erpUs);
    setExpanded(null);
  };

  const filtered = tenants.filter(t =>
    filter === "all" ? true : filter === "active" ? t.is_active : !t.is_active
  );
  const stats = {
    total: tenants.length, active: tenants.filter(t => t.is_active).length,
    users: tenants.reduce((a, t) => a + (t.active_users || 2), 0),
    enterprise: tenants.filter(t => t.plan === "enterprise").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl"><Shield size={18} className="text-white" /></div>
            <div>
              <h1 className="font-bold text-gray-900 leading-none">SaaS Admin</h1>
              <p className="text-xs text-gray-400">Painel Global ERP</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="pl-2 border-l border-gray-200 flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                <p className="text-xs text-gray-400">{admin.email}</p>
              </div>
              <button onClick={onLogout} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-gray-400">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total de Empresas", value: stats.total,      icon: Building2,   cls: "bg-indigo-50 text-indigo-600" },
            { label: "Empresas Ativas",   value: stats.active,     icon: CheckCircle, cls: "bg-emerald-50 text-emerald-600" },
            { label: "Usuários Ativos",   value: stats.users,      icon: Users,       cls: "bg-blue-50 text-blue-600" },
            { label: "Plano Enterprise",  value: stats.enterprise, icon: Crown,       cls: "bg-purple-50 text-purple-600" },
          ].map(({ label, value, icon: Icon, cls }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`inline-flex p-2 rounded-xl mb-3 ${cls}`}><Icon size={16} /></div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex gap-2">
            {(["all", "active", "inactive"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === f ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                }`}>
                {f === "all" ? "Todas" : f === "active" ? "Ativas" : "Inativas"}
              </button>
            ))}
          </div>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus size={15} />Nova Empresa
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map(t => {
            const mods = ALL_MODULES.filter(m => t.modules.includes(m.key));
            const isExp = expanded === t.id;
            return (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="p-2.5 bg-indigo-50 rounded-xl shrink-0">
                      <Building2 size={18} className="text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{t.name}</h3>
                        <PlanBadge plan={t.plan} />
                        <StatusDot active={t.is_active} />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2.5">
                        <span className="flex items-center gap-1"><Globe size={10} />/{t.slug}</span>
                        <span className="flex items-center gap-1"><Users size={10} />{t.active_users ?? 2} usuário(s)</span>
                        <span>{t.currency}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {mods.map(m => (
                          <span key={m.key} style={{ background: m.color + "18", color: m.color }}
                            className="px-2 py-0.5 rounded text-xs font-medium">{m.label}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleActive(t)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        t.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}>
                      {t.is_active ? "Desativar" : "Ativar"}
                    </button>
                    <button onClick={() => setExpanded(isExp ? null : t.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors">
                      Detalhes <ChevronRight size={12} className={`transition-transform ${isExp ? "rotate-90" : ""}`} />
                    </button>
                  </div>
                </div>

                {isExp && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 rounded-b-2xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div><p className="text-xs text-gray-400 mb-0.5">ID</p><code className="text-xs font-mono text-gray-600 break-all">{t.id}</code></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">Criado em</p><p className="text-gray-700">{new Date(t.created_at).toLocaleDateString("pt-BR")}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">Total usuários</p><p className="text-gray-700">{t.total_users ?? 2}</p></div>
                      <div><p className="text-xs text-gray-400 mb-0.5">Módulos</p><p className="text-gray-700">{t.modules.length} módulo(s)</p></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a href="/login" target="_blank"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors">
                        <ExternalLink size={12} />Acessar ERP
                      </a>
                      <button onClick={() => deleteTenant(t.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors">
                        <Trash2 size={12} />Remover
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-20 text-center bg-white rounded-2xl border border-gray-100">
              <Building2 size={40} className="mx-auto mb-3 text-gray-200" />
              <p className="font-medium text-gray-600">Nenhuma empresa encontrada</p>
              <p className="text-sm text-gray-400 mt-1">Clique em "Nova Empresa" para começar</p>
            </div>
          )}
        </div>
      </div>

      {showNew && <NewTenantModal onClose={() => setShowNew(false)} onCreated={handleCreated} />}
      {creds && <CredentialsModal tenant={creds.tenant} users={creds.users} onClose={() => setCreds(null)} />}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function SaasAdminPage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const logout = async () => { await api("/api/saas/auth", { method: "DELETE" }); setAdmin(null); };
  if (!admin) return <LoginScreen onLogin={setAdmin} />;
  return <Dashboard admin={admin} onLogout={logout} />;
}
