# ERP Multi-Tenant — Setup & Guia

## Estrutura adicionada neste update

```
app/
├── saas-admin/
│   └── page.tsx          ← Painel SaaS Admin (adicionar empresas)
├── (dashboard)/
│   └── ti/
│       └── page.tsx      ← Módulo TI (usuários, permissões, ativos, chamados)
├── api/
│   ├── saas/
│   │   ├── auth/route.ts         ← Login SaaS Admin
│   │   └── tenants/
│   │       ├── route.ts          ← CRUD empresas
│   │       └── [id]/route.ts     ← Operações por empresa
│   └── ti/
│       ├── users/route.ts        ← CRUD usuários do tenant
│       └── users/[id]/route.ts   ← Operações por usuário
lib/
├── db.ts           ← Conexão PostgreSQL (Pool + helpers)
├── saas-auth.ts    ← Middleware JWT para SaaS Admin
schema.sql          ← Schema completo do banco de dados
.env.example        ← Template de variáveis de ambiente
```

---

## 1. Instalar dependências novas

```bash
npm install pg bcryptjs jsonwebtoken
npm install --save-dev @types/pg @types/bcryptjs @types/jsonwebtoken
```

## 2. Configurar PostgreSQL

### Opção A — Local (Docker)
```bash
docker run --name erp-postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=erp_multitenant \
  -p 5432:5432 -d postgres:16
```

### Opção B — Supabase (gratuito)
1. Acesse https://supabase.com → New Project
2. Copie a connection string em Settings > Database

## 3. Criar o banco

```bash
# Com psql local:
psql -U postgres -d erp_multitenant -f schema.sql

# Com supabase:
# Cole o conteúdo do schema.sql no SQL Editor do Supabase
```

## 4. Configurar .env.local

```bash
cp .env.example .env.local
# Edite DATABASE_URL e JWT_SECRET
```

## 5. Rodar o projeto

```bash
npm run dev
```

---

## Acessos

| URL | Descrição |
|-----|-----------|
| `http://localhost:3000/saas-admin` | Painel SaaS — cadastrar empresas |
| `http://localhost:3000/login` | Login do ERP (por empresa) |
| `http://localhost:3000/ti` | Módulo TI — usuários e permissões |

### Credenciais padrão SaaS Admin
- Email: `admin@saas.com`
- Senha: `admin123`

---

## Perfis e Módulos

| Perfil | Acesso |
|--------|--------|
| MASTER | Tudo |
| ADMINISTRATIVO | Configurações |
| TI | T.I. + Configurações |
| FINANCEIRO | Financeiro |
| VENDAS | Vendas |
| ESTOQUE | Estoque |
| COMPRAS | Compras |
| PRODUCAO | Produção |
| RH | RH |
| MARKETING | Marketing |

---

## Fluxo completo

1. **SaaS Admin** (`/saas-admin`) → cria empresa (tenant)
2. **TI/Admin** (`/ti`) → cria usuários dentro da empresa, define perfil
3. **Usuário** → faz login em `/login` → vê apenas os módulos do seu perfil
