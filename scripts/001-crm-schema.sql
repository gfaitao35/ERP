-- CRM Inteligente Schema para ERP
-- Versão 1.0 - Sistema de Vendas Brasil

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: crm_customers (Clientes com Score RFM)
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Dados Básicos
    type VARCHAR(10) NOT NULL DEFAULT 'pf' CHECK (type IN ('pf', 'pj')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    
    -- Documentos
    cpf_cnpj VARCHAR(20),
    ie VARCHAR(20), -- Inscrição Estadual
    im VARCHAR(20), -- Inscrição Municipal
    
    -- Endereço
    cep VARCHAR(10),
    street VARCHAR(255),
    number VARCHAR(20),
    complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    
    -- Score e Classificação
    score_rfm INTEGER DEFAULT 0,
    score_recency INTEGER DEFAULT 0,
    score_frequency INTEGER DEFAULT 0,
    score_monetary INTEGER DEFAULT 0,
    classification VARCHAR(20) DEFAULT 'cold' CHECK (classification IN ('hot', 'warm', 'cold', 'inactive')),
    
    -- Dados de Aquisição (UTM)
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    first_touch_channel VARCHAR(100),
    
    -- Métricas
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(15, 2) DEFAULT 0,
    average_ticket DECIMAL(15, 2) DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    first_order_date TIMESTAMP WITH TIME ZONE,
    days_since_last_order INTEGER DEFAULT 0,
    
    -- Metadata
    tags TEXT[], -- Array de tags
    notes TEXT,
    assigned_to UUID, -- Vendedor responsável
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_crm_customers_tenant ON crm_customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_customers_email ON crm_customers(email);
CREATE INDEX IF NOT EXISTS idx_crm_customers_cpf_cnpj ON crm_customers(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_crm_customers_classification ON crm_customers(classification);
CREATE INDEX IF NOT EXISTS idx_crm_customers_score ON crm_customers(score_rfm DESC);

-- =====================================================
-- TABELA: crm_leads (Leads/Prospectos)
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Dados Básicos
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    company VARCHAR(255),
    position VARCHAR(100),
    
    -- Status e Qualificação
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost')),
    temperature VARCHAR(10) DEFAULT 'cold' CHECK (temperature IN ('hot', 'warm', 'cold')),
    score INTEGER DEFAULT 0,
    
    -- Fonte e Campanha
    source VARCHAR(100), -- facebook, google, instagram, indicacao, site, etc
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    landing_page VARCHAR(500),
    referrer VARCHAR(500),
    
    -- Interesse
    interested_products TEXT[],
    estimated_value DECIMAL(15, 2),
    
    -- Atribuição
    assigned_to UUID,
    converted_customer_id UUID REFERENCES crm_customers(id),
    converted_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    tags TEXT[],
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contact_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant ON crm_leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON crm_leads(source);
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned ON crm_leads(assigned_to);

-- =====================================================
-- TABELA: crm_pipeline_stages (Etapas do Funil)
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#6366f1',
    position INTEGER NOT NULL,
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    
    is_won BOOLEAN DEFAULT FALSE,
    is_lost BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_pipeline_stages_tenant ON crm_pipeline_stages(tenant_id);

-- =====================================================
-- TABELA: crm_opportunities (Oportunidades de Venda)
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Relacionamentos
    customer_id UUID REFERENCES crm_customers(id),
    lead_id UUID REFERENCES crm_leads(id),
    stage_id UUID NOT NULL REFERENCES crm_pipeline_stages(id),
    
    -- Dados da Oportunidade
    title VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    weighted_value DECIMAL(15, 2) GENERATED ALWAYS AS (value * probability / 100) STORED,
    
    -- Datas
    expected_close_date DATE,
    actual_close_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
    lost_reason VARCHAR(255),
    won_reason VARCHAR(255),
    
    -- Fonte
    source VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Atribuição
    assigned_to UUID,
    
    -- Produtos
    products JSONB DEFAULT '[]', -- Array de produtos/serviços
    
    -- Metadata
    tags TEXT[],
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stage_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_opportunities_tenant ON crm_opportunities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_customer ON crm_opportunities(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_stage ON crm_opportunities(stage_id);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_status ON crm_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_crm_opportunities_assigned ON crm_opportunities(assigned_to);

-- =====================================================
-- TABELA: crm_interactions (Histórico de Interações)
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Relacionamentos (pode ter customer OU lead)
    customer_id UUID REFERENCES crm_customers(id),
    lead_id UUID REFERENCES crm_leads(id),
    opportunity_id UUID REFERENCES crm_opportunities(id),
    
    -- Tipo de Interação
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'call', 'email', 'whatsapp', 'meeting', 'visit', 'proposal', 
        'follow_up', 'note', 'task', 'status_change', 'order', 'support'
    )),
    direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
    
    -- Conteúdo
    subject VARCHAR(255),
    content TEXT,
    outcome VARCHAR(100), -- resultado da interação
    
    -- Metadata
    duration_minutes INTEGER,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Quem realizou
    performed_by UUID,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_interactions_tenant ON crm_interactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_customer ON crm_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_lead ON crm_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_opportunity ON crm_interactions(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_type ON crm_interactions(type);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_created ON crm_interactions(created_at DESC);

-- =====================================================
-- TABELA: crm_campaigns (Campanhas de Marketing)
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Dados da Campanha
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('meta_ads', 'google_ads', 'email', 'whatsapp', 'sms', 'other')),
    
    -- Identificadores Externos
    external_id VARCHAR(255), -- ID no Meta/Google
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Período
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    
    -- Orçamento e Custos
    budget DECIMAL(15, 2) DEFAULT 0,
    spent DECIMAL(15, 2) DEFAULT 0,
    
    -- Métricas
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    revenue DECIMAL(15, 2) DEFAULT 0,
    
    -- Calculados
    cpl DECIMAL(15, 2) DEFAULT 0, -- Custo por Lead
    cpa DECIMAL(15, 2) DEFAULT 0, -- Custo por Aquisição
    roas DECIMAL(10, 2) DEFAULT 0, -- Return on Ad Spend
    roi DECIMAL(10, 2) DEFAULT 0, -- Return on Investment
    
    -- Metadata
    tags TEXT[],
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_campaigns_tenant ON crm_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_type ON crm_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_status ON crm_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_crm_campaigns_utm ON crm_campaigns(utm_campaign);

-- =====================================================
-- TABELA: crm_tasks (Tarefas e Lembretes)
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    -- Relacionamentos
    customer_id UUID REFERENCES crm_customers(id),
    lead_id UUID REFERENCES crm_leads(id),
    opportunity_id UUID REFERENCES crm_opportunities(id),
    
    -- Dados da Tarefa
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'task' CHECK (type IN ('task', 'call', 'email', 'meeting', 'follow_up', 'reminder')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Status e Datas
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Atribuição
    assigned_to UUID,
    created_by UUID,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_tenant ON crm_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned ON crm_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON crm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due ON crm_tasks(due_date);

-- =====================================================
-- TABELA: crm_automations (Automações)
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Trigger
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN (
        'lead_created', 'lead_status_changed', 'opportunity_created', 
        'opportunity_stage_changed', 'opportunity_won', 'opportunity_lost',
        'customer_inactive', 'task_due', 'schedule'
    )),
    trigger_conditions JSONB DEFAULT '{}',
    
    -- Actions
    actions JSONB NOT NULL DEFAULT '[]', -- Array de ações
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Estatísticas
    executions_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_automations_tenant ON crm_automations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_automations_active ON crm_automations(is_active);

-- =====================================================
-- DADOS INICIAIS: Etapas do Pipeline Padrão
-- =====================================================
-- Nota: Executar após criar as tabelas, usando um tenant_id real

-- Função para inserir etapas padrão para um novo tenant
CREATE OR REPLACE FUNCTION create_default_pipeline_stages(p_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO crm_pipeline_stages (tenant_id, name, description, color, position, probability, is_won, is_lost)
    VALUES
        (p_tenant_id, 'Novo Lead', 'Lead recém chegado, ainda não contatado', '#94a3b8', 1, 10, false, false),
        (p_tenant_id, 'Primeiro Contato', 'Contato inicial realizado', '#3b82f6', 2, 20, false, false),
        (p_tenant_id, 'Qualificação', 'Verificando fit e interesse', '#8b5cf6', 3, 30, false, false),
        (p_tenant_id, 'Proposta', 'Proposta comercial enviada', '#f59e0b', 4, 50, false, false),
        (p_tenant_id, 'Negociação', 'Em negociação de valores/condições', '#f97316', 5, 70, false, false),
        (p_tenant_id, 'Fechamento', 'Aguardando assinatura/pagamento', '#10b981', 6, 90, false, false),
        (p_tenant_id, 'Ganho', 'Negócio fechado com sucesso', '#22c55e', 7, 100, true, false),
        (p_tenant_id, 'Perdido', 'Negócio não fechado', '#ef4444', 8, 0, false, true)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Calcular Score RFM do Cliente
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_customer_rfm(p_customer_id UUID)
RETURNS VOID AS $$
DECLARE
    v_recency INTEGER;
    v_frequency INTEGER;
    v_monetary DECIMAL;
    v_score_r INTEGER;
    v_score_f INTEGER;
    v_score_m INTEGER;
    v_total_score INTEGER;
    v_classification VARCHAR(20);
BEGIN
    -- Calcular métricas básicas
    SELECT 
        COALESCE(EXTRACT(DAY FROM NOW() - last_order_date)::INTEGER, 365),
        COALESCE(total_orders, 0),
        COALESCE(total_spent, 0)
    INTO v_recency, v_frequency, v_monetary
    FROM crm_customers
    WHERE id = p_customer_id;

    -- Score de Recência (1-5, quanto menor o tempo, maior o score)
    v_score_r := CASE 
        WHEN v_recency <= 30 THEN 5
        WHEN v_recency <= 60 THEN 4
        WHEN v_recency <= 90 THEN 3
        WHEN v_recency <= 180 THEN 2
        ELSE 1
    END;

    -- Score de Frequência (1-5)
    v_score_f := CASE 
        WHEN v_frequency >= 10 THEN 5
        WHEN v_frequency >= 5 THEN 4
        WHEN v_frequency >= 3 THEN 3
        WHEN v_frequency >= 1 THEN 2
        ELSE 1
    END;

    -- Score Monetário (1-5) - valores em BRL
    v_score_m := CASE 
        WHEN v_monetary >= 10000 THEN 5
        WHEN v_monetary >= 5000 THEN 4
        WHEN v_monetary >= 1000 THEN 3
        WHEN v_monetary >= 500 THEN 2
        ELSE 1
    END;

    -- Score Total (média ponderada)
    v_total_score := (v_score_r * 3 + v_score_f * 2 + v_score_m * 2) / 7 * 20; -- Normalizado para 0-100

    -- Classificação
    v_classification := CASE 
        WHEN v_total_score >= 70 THEN 'hot'
        WHEN v_total_score >= 40 THEN 'warm'
        WHEN v_total_score >= 20 THEN 'cold'
        ELSE 'inactive'
    END;

    -- Atualizar cliente
    UPDATE crm_customers
    SET 
        score_recency = v_score_r,
        score_frequency = v_score_f,
        score_monetary = v_score_m,
        score_rfm = v_total_score,
        classification = v_classification,
        days_since_last_order = v_recency,
        updated_at = NOW()
    WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'crm_customers', 'crm_leads', 'crm_pipeline_stages', 
            'crm_opportunities', 'crm_campaigns', 'crm_tasks', 'crm_automations'
        ])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
            CREATE TRIGGER update_%s_updated_at
            BEFORE UPDATE ON %s
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$;
