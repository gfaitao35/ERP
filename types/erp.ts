// =====================================================
// ERP MULTI-TENANT - CORE TYPES
// =====================================================

// ==================== RBAC SYSTEM ====================
export type UserRole = 
  | 'MASTER'
  | 'ADMINISTRATIVO'
  | 'VENDAS'
  | 'ESTOQUE'
  | 'PRODUCAO'
  | 'RH'
  | 'FINANCEIRO'
  | 'COMPRAS'
  | 'TI'
  | 'MARKETING';

export type Permission = 
  | 'all'
  | 'read'
  | 'write'
  | 'delete'
  | 'admin'
  | 'export'
  | 'import';

export interface RolePermissions {
  role: UserRole;
  modules: string[];
  permissions: Permission[];
  dashboardView: string;
}

// ==================== TENANT / MULTI-EMPRESA ====================
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: 'starter' | 'professional' | 'enterprise';
  settings: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface TenantSettings {
  currency: string;
  timezone: string;
  dateFormat: string;
  fiscalYearStart: number;
  modules: string[];
  integrations: IntegrationConfig[];
  theme?: {
    primaryColor?: string;
    logo?: string;
  };
}

export interface IntegrationConfig {
  type: 'whatsapp' | 'meta_ads' | 'google_ads' | 'nfe' | 'open_banking' | 'sped';
  enabled: boolean;
  credentials?: Record<string, string>;
}

// ==================== USER / AUTH ====================
export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  department?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ==================== VENDAS MODULE ====================
export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string; // CPF/CNPJ
  documentType?: 'CPF' | 'CNPJ';
  address?: Address;
  tags?: string[];
  leadSource?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type OpportunityStage = 
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface SalesOpportunity {
  id: string;
  tenantId: string;
  customerId: string;
  customer?: Customer;
  title: string;
  value: number;
  stage: OpportunityStage;
  probability: number;
  expectedCloseDate?: Date;
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | 'draft'
  | 'pending'
  | 'approved'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface SalesOrder {
  id: string;
  tenantId: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  items: SalesOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentTerms?: string;
  shippingAddress?: Address;
  notes?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesOrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Commission {
  id: string;
  tenantId: string;
  orderId: string;
  userId: string;
  amount: number;
  rate: number;
  status: 'pending' | 'approved' | 'paid';
  paidAt?: Date;
  createdAt: Date;
}

// ==================== ESTOQUE MODULE ====================
export interface Product {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  barcode?: string;
  images?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address?: Address;
  isDefault: boolean;
  isActive: boolean;
}

export type MovementType = 'entry' | 'exit' | 'transfer' | 'adjustment';

export interface StockMovement {
  id: string;
  tenantId: string;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  type: MovementType;
  quantity: number;
  unitCost: number;
  totalCost: number;
  reference?: string;
  referenceType?: 'sale' | 'purchase' | 'production' | 'manual';
  referenceId?: string;
  batch?: string;
  expirationDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface StockLevel {
  id: string;
  tenantId: string;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: Date;
}

// ==================== FINANCEIRO MODULE ====================
export type TransactionType = 'receivable' | 'payable';
export type TransactionStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';

export interface FinancialTransaction {
  id: string;
  tenantId: string;
  type: TransactionType;
  description: string;
  amount: number;
  paidAmount: number;
  dueDate: Date;
  paidDate?: Date;
  status: TransactionStatus;
  category?: string;
  costCenterId?: string;
  costCenter?: CostCenter;
  bankAccountId?: string;
  bankAccount?: BankAccount;
  referenceType?: 'sale' | 'purchase' | 'payroll' | 'other';
  referenceId?: string;
  customerId?: string;
  supplierId?: string;
  installmentNumber?: number;
  totalInstallments?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccount {
  id: string;
  tenantId: string;
  name: string;
  bank: string;
  agency: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostCenter {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  parentId?: string;
  isActive: boolean;
}

export interface CashFlowEntry {
  date: Date;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  balance: number;
  category?: string;
}

// ==================== COMPRAS MODULE ====================
export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  tradeName?: string;
  document: string;
  documentType: 'CPF' | 'CNPJ';
  email?: string;
  phone?: string;
  address?: Address;
  contactName?: string;
  paymentTerms?: string;
  categories?: string[];
  rating?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PurchaseOrderStatus = 
  | 'draft'
  | 'sent'
  | 'confirmed'
  | 'partial_received'
  | 'received'
  | 'cancelled';

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  orderNumber: string;
  supplierId: string;
  supplier?: Supplier;
  items: PurchaseOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  freight: number;
  total: number;
  status: PurchaseOrderStatus;
  expectedDelivery?: Date;
  paymentTerms?: string;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  receivedQuantity: number;
}

export interface PurchaseQuotation {
  id: string;
  tenantId: string;
  productId: string;
  product?: Product;
  supplierId: string;
  supplier?: Supplier;
  quantity: number;
  unitPrice: number;
  deliveryDays: number;
  validUntil: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  createdAt: Date;
}

// ==================== PRODUCAO MODULE ====================
export type ProductionOrderStatus = 
  | 'planned'
  | 'released'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface ProductionOrder {
  id: string;
  tenantId: string;
  orderNumber: string;
  productId: string;
  product?: Product;
  quantity: number;
  producedQuantity: number;
  startDate?: Date;
  endDate?: Date;
  status: ProductionOrderStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  salesOrderId?: string;
  workstationId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillOfMaterials {
  id: string;
  tenantId: string;
  productId: string;
  product?: Product;
  items: BOMItem[];
  version: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BOMItem {
  id: string;
  componentId: string;
  component?: Product;
  quantity: number;
  unit: string;
  wastage: number;
}

export interface Machine {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  status: 'available' | 'in_use' | 'maintenance' | 'inactive';
  location?: string;
  capacityPerHour?: number;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

// ==================== RH MODULE ====================
export interface Employee {
  id: string;
  tenantId: string;
  userId?: string;
  name: string;
  document: string;
  email?: string;
  phone?: string;
  position: string;
  department: string;
  hireDate: Date;
  terminationDate?: Date;
  salary: number;
  bankInfo?: {
    bank: string;
    agency: string;
    account: string;
  };
  address?: Address;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeAttendance {
  id: string;
  tenantId: string;
  employeeId: string;
  employee?: Employee;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  totalHours?: number;
  overtime?: number;
  location?: {
    lat: number;
    lng: number;
  };
  status: 'present' | 'absent' | 'late' | 'leave';
}

// ==================== MARKETING MODULE ====================
export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  platform: 'meta' | 'google' | 'email' | 'whatsapp' | 'organic';
  budget: number;
  spent: number;
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  metrics: CampaignMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
  ctr: number;
  cpc: number;
  cpl: number;
  roi: number;
}

export interface Lead {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  source: string;
  campaignId?: string;
  campaign?: Campaign;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string;
  convertedToCustomerId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== TI MODULE ====================
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';

export interface Ticket {
  id: string;
  tenantId: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  requesterId: string;
  assignedTo?: string;
  dueDate?: Date;
  resolvedAt?: Date;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITAsset {
  id: string;
  tenantId: string;
  name: string;
  type: 'computer' | 'laptop' | 'monitor' | 'printer' | 'phone' | 'server' | 'other';
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  assignedTo?: string;
  location?: string;
  purchaseDate?: Date;
  warrantyExpiration?: Date;
  status: 'active' | 'maintenance' | 'retired';
  notes?: string;
  createdAt: Date;
}

// ==================== NOTIFICATIONS ====================
export type NotificationChannel = 'in_app' | 'email' | 'whatsapp' | 'push';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: NotificationPriority;
  channel: NotificationChannel;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ==================== AUDIT LOG ====================
export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export';
  entity: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ==================== DASHBOARD / KPIs ====================
export interface DashboardKPI {
  id: string;
  title: string;
  value: number;
  previousValue?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format: 'currency' | 'number' | 'percentage';
  icon?: string;
  color?: string;
}

export interface DashboardData {
  kpis: DashboardKPI[];
  salesFunnel: {
    stage: string;
    count: number;
    value: number;
  }[];
  cashFlow: CashFlowEntry[];
  topProducts: {
    product: Product;
    quantity: number;
    revenue: number;
  }[];
  recentOrders: SalesOrder[];
  criticalStock: StockLevel[];
  pendingPayments: FinancialTransaction[];
  leadsBySource: {
    source: string;
    count: number;
  }[];
}

// ==================== API RESPONSE ====================
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// ==================== CONTAS A RECEBER / PAGAR ====================

export type AccountStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partial';
export type PaymentMethod = 'boleto' | 'pix' | 'cartao' | 'transferencia' | 'dinheiro' | 'cheque';

export interface AccountReceivable {
  id: string;
  tenantId: string;
  customerId: string;
  description: string;
  documentNumber?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  status: AccountStatus;
  paymentMethod: PaymentMethod;
  category?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountPayable {
  id: string;
  tenantId: string;
  supplierId?: string;
  description: string;
  documentNumber?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  status: AccountStatus;
  paymentMethod: PaymentMethod;
  category?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== FROTA / VEÍCULOS ====================
export type VehicleStatus = 'available' | 'in_use' | 'maintenance' | 'inactive';
export type VehicleFuelType = 'gasoline' | 'ethanol' | 'diesel' | 'flex' | 'electric' | 'hybrid';
export type MaintenanceType = 'preventive' | 'corrective';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type DocumentType = 'ipva' | 'licensing' | 'insurance' | 'inspection';
export type FineStatus = 'pending' | 'paid' | 'contested' | 'cancelled';

export interface Vehicle {
  id: string;
  tenantId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  chassi?: string;
  renavam?: string;
  fuelType: VehicleFuelType;
  tankCapacity: number;
  currentMileage: number;
  status: VehicleStatus;
  assignedDriverId?: string;
  assignedDriver?: Driver;
  category?: string;
  purchaseDate?: Date;
  purchaseValue?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver {
  id: string;
  tenantId: string;
  name: string;
  document: string;
  cnh: string;
  cnhCategory: string;
  cnhExpiration: Date;
  phone?: string;
  email?: string;
  address?: Address;
  employeeId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Refueling {
  id: string;
  tenantId: string;
  vehicleId: string;
  vehicle?: Vehicle;
  driverId?: string;
  driver?: Driver;
  date: Date;
  mileage: number;
  fuelType: VehicleFuelType;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  station?: string;
  fullTank: boolean;
  notes?: string;
  createdAt: Date;
}

export interface VehicleMaintenance {
  id: string;
  tenantId: string;
  vehicleId: string;
  vehicle?: Vehicle;
  type: MaintenanceType;
  status: MaintenanceStatus;
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  mileageAtMaintenance?: number;
  workshop?: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  invoiceNumber?: string;
  nextMaintenanceMileage?: number;
  nextMaintenanceDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleDocument {
  id: string;
  tenantId: string;
  vehicleId: string;
  vehicle?: Vehicle;
  type: DocumentType;
  referenceYear: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue';
  documentNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleFine {
  id: string;
  tenantId: string;
  vehicleId: string;
  vehicle?: Vehicle;
  driverId?: string;
  driver?: Driver;
  date: Date;
  description: string;
  infringementCode?: string;
  location?: string;
  amount: number;
  discountAmount?: number;
  dueDate: Date;
  paidDate?: Date;
  status: FineStatus;
  points?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== COTAÇÕES AVANÇADAS ====================
export type QuotationRequestStatus = 'draft' | 'sent' | 'in_progress' | 'completed' | 'cancelled';
export type QuotationResponseStatus = 'pending' | 'received' | 'accepted' | 'rejected' | 'expired';

export interface QuotationRequest {
  id: string;
  tenantId: string;
  requestNumber: string;
  title: string;
  items: QuotationRequestItem[];
  supplierIds: string[];
  suppliers?: Supplier[];
  responses?: QuotationResponse[];
  deadline: Date;
  status: QuotationRequestStatus;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuotationRequestItem {
  id: string;
  productId?: string;
  product?: Product;
  description: string;
  quantity: number;
  unit: string;
  specifications?: string;
}

export interface QuotationResponse {
  id: string;
  tenantId: string;
  requestId: string;
  request?: QuotationRequest;
  supplierId: string;
  supplier?: Supplier;
  items: QuotationResponseItem[];
  subtotal: number;
  discount: number;
  freight: number;
  total: number;
  deliveryDays: number;
  paymentTerms?: string;
  validUntil: Date;
  status: QuotationResponseStatus;
  notes?: string;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuotationResponseItem {
  id: string;
  requestItemId: string;
  unitPrice: number;
  total: number;
  brand?: string;
  deliveryDays?: number;
  notes?: string;
}
