// CRM Customer Types
export interface CRMCustomer {
  id: string
  tenant_id: string
  type: "pf" | "pj"
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  cpf_cnpj?: string
  ie?: string
  im?: string
  cep?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  score_rfm: number
  score_recency: number
  score_frequency: number
  score_monetary: number
  classification: "hot" | "warm" | "cold" | "inactive"
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  first_touch_channel?: string
  total_orders: number
  total_spent: number
  average_ticket: number
  last_order_date?: string
  first_order_date?: string
  days_since_last_order: number
  tags?: string[]
  notes?: string
  assigned_to?: string
  created_at: string
  updated_at: string
}

// CRM Lead Types
export interface CRMLead {
  id: string
  tenant_id: string
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  company?: string
  position?: string
  status: "new" | "contacted" | "qualified" | "unqualified" | "converted" | "lost"
  temperature: "hot" | "warm" | "cold"
  score: number
  source?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  landing_page?: string
  referrer?: string
  interested_products?: string[]
  estimated_value?: number
  assigned_to?: string
  converted_customer_id?: string
  converted_at?: string
  tags?: string[]
  notes?: string
  custom_fields?: Record<string, unknown>
  created_at: string
  updated_at: string
  last_contact_at?: string
}

// Pipeline Stage Types
export interface CRMPipelineStage {
  id: string
  tenant_id: string
  name: string
  description?: string
  color: string
  position: number
  probability: number
  is_won: boolean
  is_lost: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// Opportunity Types
export interface CRMOpportunity {
  id: string
  tenant_id: string
  customer_id?: string
  lead_id?: string
  stage_id: string
  title: string
  description?: string
  value: number
  probability: number
  expected_close_date?: string
  actual_close_date?: string
  status: "open" | "won" | "lost"
  lost_reason?: string
  won_reason?: string
  source?: string
  utm_campaign?: string
  assigned_to?: string
  products?: { id: string; name: string; quantity: number; price: number }[]
  tags?: string[]
  notes?: string
  custom_fields?: Record<string, unknown>
  created_at: string
  updated_at: string
  stage_changed_at: string
  // Joined fields
  customer?: CRMCustomer
  lead?: CRMLead
  stage?: CRMPipelineStage
}

// Interaction Types
export interface CRMInteraction {
  id: string
  tenant_id: string
  customer_id?: string
  lead_id?: string
  opportunity_id?: string
  type:
    | "call"
    | "email"
    | "whatsapp"
    | "meeting"
    | "visit"
    | "proposal"
    | "follow_up"
    | "note"
    | "task"
    | "status_change"
    | "order"
    | "support"
  direction?: "inbound" | "outbound"
  subject?: string
  content?: string
  outcome?: string
  duration_minutes?: number
  scheduled_at?: string
  completed_at?: string
  performed_by?: string
  created_at: string
}

// Campaign Types
export interface CRMCampaign {
  id: string
  tenant_id: string
  name: string
  description?: string
  type?: "meta_ads" | "google_ads" | "email" | "whatsapp" | "sms" | "other"
  external_id?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  start_date?: string
  end_date?: string
  status: "draft" | "active" | "paused" | "completed"
  budget: number
  spent: number
  impressions: number
  clicks: number
  leads_count: number
  conversions_count: number
  revenue: number
  cpl: number
  cpa: number
  roas: number
  roi: number
  tags?: string[]
  notes?: string
  created_at: string
  updated_at: string
}

// Task Types
export interface CRMTask {
  id: string
  tenant_id: string
  customer_id?: string
  lead_id?: string
  opportunity_id?: string
  title: string
  description?: string
  type: "task" | "call" | "email" | "meeting" | "follow_up" | "reminder"
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed" | "cancelled"
  due_date?: string
  completed_at?: string
  assigned_to?: string
  created_by?: string
  created_at: string
  updated_at: string
}

// Automation Types
export interface CRMAutomation {
  id: string
  tenant_id: string
  name: string
  description?: string
  trigger_type:
    | "lead_created"
    | "lead_status_changed"
    | "opportunity_created"
    | "opportunity_stage_changed"
    | "opportunity_won"
    | "opportunity_lost"
    | "customer_inactive"
    | "task_due"
    | "schedule"
  trigger_conditions?: Record<string, unknown>
  actions: { type: string; config: Record<string, unknown> }[]
  is_active: boolean
  executions_count: number
  last_executed_at?: string
  created_at: string
  updated_at: string
}

// Dashboard KPI Types
export interface CRMDashboardKPIs {
  totalLeads: number
  leadsThisMonth: number
  leadsGrowth: number
  totalOpportunities: number
  openOpportunities: number
  pipelineValue: number
  wonOpportunities: number
  wonValue: number
  lostOpportunities: number
  conversionRate: number
  averageTicket: number
  leadsBySource: { source: string; count: number }[]
  leadsByStatus: { status: string; count: number }[]
  opportunitiesByStage: { stage: string; count: number; value: number }[]
  recentActivities: CRMInteraction[]
  upcomingTasks: CRMTask[]
  topCustomers: { customer: CRMCustomer; totalValue: number }[]
  campaignPerformance: { campaign: CRMCampaign; leads: number; conversions: number }[]
}
