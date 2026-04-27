"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type {
  Customer,
  Product,
  SalesOrder,
  SalesOpportunity,
  FinancialTransaction,
  Supplier,
  StockLevel,
  StockMovement,
  Notification,
  AccountReceivable,
  AccountPayable,
  Vehicle,
  Driver,
  Refueling,
  VehicleMaintenance,
  VehicleDocument,
  VehicleFine,
  QuotationRequest,
  QuotationResponse,
} from "@/types/erp";
import { useAuth } from "./auth-context";

// =====================================================
// STORAGE HELPER
// =====================================================
function ls_get<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function ls_set(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// =====================================================
// STORAGE KEYS
// =====================================================
const KEYS = {
  customers: "erp_customers",
  products: "erp_products",
  opportunities: "erp_opportunities",
  salesOrders: "erp_sales_orders",
  transactions: "erp_transactions",
  suppliers: "erp_suppliers",
  stockLevels: "erp_stock_levels",
  stockMovements: "erp_stock_movements",
  notifications: "erp_notifications",
  accountsReceivable: "erp_accounts_receivable",
  accountsPayable: "erp_accounts_payable",
  vehicles: "erp_vehicles",
  drivers: "erp_drivers",
  refuelings: "erp_refuelings",
  maintenances: "erp_maintenances",
  vehicleDocuments: "erp_vehicle_documents",
  vehicleFines: "erp_vehicle_fines",
  quotationRequests: "erp_quotation_requests",
  quotationResponses: "erp_quotation_responses",
};

// =====================================================
// CONTEXT TYPE
// =====================================================
interface ERPDataContextType {
  customers: Customer[];
  addCustomer: (c: Customer) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;

  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;

  opportunities: SalesOpportunity[];
  addOpportunity: (o: SalesOpportunity) => void;
  updateOpportunity: (o: SalesOpportunity) => void;
  deleteOpportunity: (id: string) => void;

  salesOrders: SalesOrder[];
  addSalesOrder: (o: SalesOrder) => void;
  updateSalesOrder: (o: SalesOrder) => void;
  deleteSalesOrder: (id: string) => void;

  transactions: FinancialTransaction[];
  addTransaction: (t: FinancialTransaction) => void;
  updateTransaction: (t: FinancialTransaction) => void;
  deleteTransaction: (id: string) => void;

  accountsReceivable: AccountReceivable[];
  addAccountReceivable: (ar: AccountReceivable) => void;
  updateAccountReceivable: (ar: AccountReceivable) => void;
  deleteAccountReceivable: (id: string) => void;

  accountsPayable: AccountPayable[];
  addAccountPayable: (ap: AccountPayable) => void;
  updateAccountPayable: (ap: AccountPayable) => void;
  deleteAccountPayable: (id: string) => void;

  suppliers: Supplier[];
  addSupplier: (s: Supplier) => void;
  updateSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;

  stockLevels: StockLevel[];
  addStockLevel: (s: StockLevel) => void;
  updateStockLevel: (s: StockLevel) => void;

  stockMovements: StockMovement[];
  addStockMovement: (m: StockMovement) => void;
  updateStockMovement: (m: StockMovement) => void;
  deleteStockMovement: (id: string) => void;

  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  addNotification: (n: Notification) => void;

  vehicles: Vehicle[];
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (v: Vehicle) => void;
  deleteVehicle: (id: string) => void;

  drivers: Driver[];
  addDriver: (d: Driver) => void;
  updateDriver: (d: Driver) => void;
  deleteDriver: (id: string) => void;

  refuelings: Refueling[];
  addRefueling: (r: Refueling) => void;
  updateRefueling: (r: Refueling) => void;
  deleteRefueling: (id: string) => void;

  maintenances: VehicleMaintenance[];
  addMaintenance: (m: VehicleMaintenance) => void;
  updateMaintenance: (m: VehicleMaintenance) => void;
  deleteMaintenance: (id: string) => void;

  vehicleDocuments: VehicleDocument[];
  addVehicleDocument: (d: VehicleDocument) => void;
  updateVehicleDocument: (d: VehicleDocument) => void;
  deleteVehicleDocument: (id: string) => void;

  vehicleFines: VehicleFine[];
  addVehicleFine: (f: VehicleFine) => void;
  updateVehicleFine: (f: VehicleFine) => void;
  deleteVehicleFine: (id: string) => void;

  quotationRequests: QuotationRequest[];
  addQuotationRequest: (q: QuotationRequest) => void;
  updateQuotationRequest: (q: QuotationRequest) => void;
  deleteQuotationRequest: (id: string) => void;

  quotationResponses: QuotationResponse[];
  addQuotationResponse: (q: QuotationResponse) => void;
  updateQuotationResponse: (q: QuotationResponse) => void;
  deleteQuotationResponse: (id: string) => void;

  isLoading: boolean;
}

const ERPDataContext = createContext<ERPDataContextType | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================
export function ERPDataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const addCustomer = useCallback((c: Customer) => setCustomers((p) => { const n = [c, ...p]; ls_set(KEYS.customers, n); return n; }), []);
  const updateCustomer = useCallback((c: Customer) => setCustomers((p) => { const n = p.map((x) => x.id === c.id ? c : x); ls_set(KEYS.customers, n); return n; }), []);
  const deleteCustomer = useCallback((id: string) => setCustomers((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.customers, n); return n; }), []);

  const [products, setProducts] = useState<Product[]>([]);
  const addProduct = useCallback((p: Product) => setProducts((prev) => { const n = [p, ...prev]; ls_set(KEYS.products, n); return n; }), []);
  const updateProduct = useCallback((p: Product) => setProducts((prev) => { const n = prev.map((x) => x.id === p.id ? p : x); ls_set(KEYS.products, n); return n; }), []);
  const deleteProduct = useCallback((id: string) => setProducts((prev) => { const n = prev.filter((x) => x.id !== id); ls_set(KEYS.products, n); return n; }), []);

  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>([]);
  const addOpportunity = useCallback((o: SalesOpportunity) => setOpportunities((p) => { const n = [o, ...p]; ls_set(KEYS.opportunities, n); return n; }), []);
  const updateOpportunity = useCallback((o: SalesOpportunity) => setOpportunities((p) => { const n = p.map((x) => x.id === o.id ? o : x); ls_set(KEYS.opportunities, n); return n; }), []);
  const deleteOpportunity = useCallback((id: string) => setOpportunities((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.opportunities, n); return n; }), []);

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const addSalesOrder = useCallback((o: SalesOrder) => setSalesOrders((p) => { const n = [o, ...p]; ls_set(KEYS.salesOrders, n); return n; }), []);
  const updateSalesOrder = useCallback((o: SalesOrder) => setSalesOrders((p) => { const n = p.map((x) => x.id === o.id ? o : x); ls_set(KEYS.salesOrders, n); return n; }), []);
  const deleteSalesOrder = useCallback((id: string) => setSalesOrders((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.salesOrders, n); return n; }), []);

  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const addTransaction = useCallback((t: FinancialTransaction) => setTransactions((p) => { const n = [t, ...p]; ls_set(KEYS.transactions, n); return n; }), []);
  const updateTransaction = useCallback((t: FinancialTransaction) => setTransactions((p) => { const n = p.map((x) => x.id === t.id ? t : x); ls_set(KEYS.transactions, n); return n; }), []);
  const deleteTransaction = useCallback((id: string) => setTransactions((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.transactions, n); return n; }), []);

  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([]);
  const addAccountReceivable = useCallback((ar: AccountReceivable) => setAccountsReceivable((p) => { const n = [ar, ...p]; ls_set(KEYS.accountsReceivable, n); return n; }), []);
  const updateAccountReceivable = useCallback((ar: AccountReceivable) => setAccountsReceivable((p) => { const n = p.map((x) => x.id === ar.id ? ar : x); ls_set(KEYS.accountsReceivable, n); return n; }), []);
  const deleteAccountReceivable = useCallback((id: string) => setAccountsReceivable((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.accountsReceivable, n); return n; }), []);

  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>([]);
  const addAccountPayable = useCallback((ap: AccountPayable) => setAccountsPayable((p) => { const n = [ap, ...p]; ls_set(KEYS.accountsPayable, n); return n; }), []);
  const updateAccountPayable = useCallback((ap: AccountPayable) => setAccountsPayable((p) => { const n = p.map((x) => x.id === ap.id ? ap : x); ls_set(KEYS.accountsPayable, n); return n; }), []);
  const deleteAccountPayable = useCallback((id: string) => setAccountsPayable((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.accountsPayable, n); return n; }), []);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const addSupplier = useCallback((s: Supplier) => setSuppliers((p) => { const n = [s, ...p]; ls_set(KEYS.suppliers, n); return n; }), []);
  const updateSupplier = useCallback((s: Supplier) => setSuppliers((p) => { const n = p.map((x) => x.id === s.id ? s : x); ls_set(KEYS.suppliers, n); return n; }), []);
  const deleteSupplier = useCallback((id: string) => setSuppliers((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.suppliers, n); return n; }), []);

  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const addStockLevel = useCallback((s: StockLevel) => setStockLevels((p) => { const n = [s, ...p]; ls_set(KEYS.stockLevels, n); return n; }), []);
  const updateStockLevel = useCallback((s: StockLevel) => setStockLevels((p) => { const n = p.map((x) => x.id === s.id ? s : x); ls_set(KEYS.stockLevels, n); return n; }), []);

  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const addStockMovement = useCallback((m: StockMovement) => setStockMovements((p) => { const n = [m, ...p]; ls_set(KEYS.stockMovements, n); return n; }), []);
  const updateStockMovement = useCallback((m: StockMovement) => setStockMovements((p) => { const n = p.map((x) => x.id === m.id ? m : x); ls_set(KEYS.stockMovements, n); return n; }), []);
  const deleteStockMovement = useCallback((id: string) => setStockMovements((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.stockMovements, n); return n; }), []);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const markNotificationRead = useCallback((id: string) => setNotifications((p) => { const n = p.map((x) => x.id === id ? { ...x, isRead: true } : x); ls_set(KEYS.notifications, n); return n; }), []);
  const addNotification = useCallback((notif: Notification) => setNotifications((p) => { const n = [notif, ...p]; ls_set(KEYS.notifications, n); return n; }), []);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const addVehicle = useCallback((v: Vehicle) => setVehicles((p) => { const n = [v, ...p]; ls_set(KEYS.vehicles, n); return n; }), []);
  const updateVehicle = useCallback((v: Vehicle) => setVehicles((p) => { const n = p.map((x) => x.id === v.id ? v : x); ls_set(KEYS.vehicles, n); return n; }), []);
  const deleteVehicle = useCallback((id: string) => setVehicles((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.vehicles, n); return n; }), []);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const addDriver = useCallback((d: Driver) => setDrivers((p) => { const n = [d, ...p]; ls_set(KEYS.drivers, n); return n; }), []);
  const updateDriver = useCallback((d: Driver) => setDrivers((p) => { const n = p.map((x) => x.id === d.id ? d : x); ls_set(KEYS.drivers, n); return n; }), []);
  const deleteDriver = useCallback((id: string) => setDrivers((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.drivers, n); return n; }), []);

  const [refuelings, setRefuelings] = useState<Refueling[]>([]);
  const addRefueling = useCallback((r: Refueling) => setRefuelings((p) => { const n = [r, ...p]; ls_set(KEYS.refuelings, n); return n; }), []);
  const updateRefueling = useCallback((r: Refueling) => setRefuelings((p) => { const n = p.map((x) => x.id === r.id ? r : x); ls_set(KEYS.refuelings, n); return n; }), []);
  const deleteRefueling = useCallback((id: string) => setRefuelings((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.refuelings, n); return n; }), []);

  const [maintenances, setMaintenances] = useState<VehicleMaintenance[]>([]);
  const addMaintenance = useCallback((m: VehicleMaintenance) => setMaintenances((p) => { const n = [m, ...p]; ls_set(KEYS.maintenances, n); return n; }), []);
  const updateMaintenance = useCallback((m: VehicleMaintenance) => setMaintenances((p) => { const n = p.map((x) => x.id === m.id ? m : x); ls_set(KEYS.maintenances, n); return n; }), []);
  const deleteMaintenance = useCallback((id: string) => setMaintenances((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.maintenances, n); return n; }), []);

  const [vehicleDocuments, setVehicleDocuments] = useState<VehicleDocument[]>([]);
  const addVehicleDocument = useCallback((d: VehicleDocument) => setVehicleDocuments((p) => { const n = [d, ...p]; ls_set(KEYS.vehicleDocuments, n); return n; }), []);
  const updateVehicleDocument = useCallback((d: VehicleDocument) => setVehicleDocuments((p) => { const n = p.map((x) => x.id === d.id ? d : x); ls_set(KEYS.vehicleDocuments, n); return n; }), []);
  const deleteVehicleDocument = useCallback((id: string) => setVehicleDocuments((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.vehicleDocuments, n); return n; }), []);

  const [vehicleFines, setVehicleFines] = useState<VehicleFine[]>([]);
  const addVehicleFine = useCallback((f: VehicleFine) => setVehicleFines((p) => { const n = [f, ...p]; ls_set(KEYS.vehicleFines, n); return n; }), []);
  const updateVehicleFine = useCallback((f: VehicleFine) => setVehicleFines((p) => { const n = p.map((x) => x.id === f.id ? f : x); ls_set(KEYS.vehicleFines, n); return n; }), []);
  const deleteVehicleFine = useCallback((id: string) => setVehicleFines((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.vehicleFines, n); return n; }), []);

  const [quotationRequests, setQuotationRequests] = useState<QuotationRequest[]>([]);
  const addQuotationRequest = useCallback((q: QuotationRequest) => setQuotationRequests((p) => { const n = [q, ...p]; ls_set(KEYS.quotationRequests, n); return n; }), []);
  const updateQuotationRequest = useCallback((q: QuotationRequest) => setQuotationRequests((p) => { const n = p.map((x) => x.id === q.id ? q : x); ls_set(KEYS.quotationRequests, n); return n; }), []);
  const deleteQuotationRequest = useCallback((id: string) => setQuotationRequests((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.quotationRequests, n); return n; }), []);

  const [quotationResponses, setQuotationResponses] = useState<QuotationResponse[]>([]);
  const addQuotationResponse = useCallback((q: QuotationResponse) => setQuotationResponses((p) => { const n = [q, ...p]; ls_set(KEYS.quotationResponses, n); return n; }), []);
  const updateQuotationResponse = useCallback((q: QuotationResponse) => setQuotationResponses((p) => { const n = p.map((x) => x.id === q.id ? q : x); ls_set(KEYS.quotationResponses, n); return n; }), []);
  const deleteQuotationResponse = useCallback((id: string) => setQuotationResponses((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.quotationResponses, n); return n; }), []);

  useEffect(() => {
    if (!isAuthenticated) { setIsLoading(false); return; }
    setCustomers(ls_get<Customer[]>(KEYS.customers, []));
    setProducts(ls_get<Product[]>(KEYS.products, []));
    setOpportunities(ls_get<SalesOpportunity[]>(KEYS.opportunities, []));
    setSalesOrders(ls_get<SalesOrder[]>(KEYS.salesOrders, []));
    setTransactions(ls_get<FinancialTransaction[]>(KEYS.transactions, []));
    setAccountsReceivable(ls_get<AccountReceivable[]>(KEYS.accountsReceivable, []));
    setAccountsPayable(ls_get<AccountPayable[]>(KEYS.accountsPayable, []));
    setSuppliers(ls_get<Supplier[]>(KEYS.suppliers, []));
    setStockLevels(ls_get<StockLevel[]>(KEYS.stockLevels, []));
    setStockMovements(ls_get<StockMovement[]>(KEYS.stockMovements, []));
    setNotifications(ls_get<Notification[]>(KEYS.notifications, []));
    setVehicles(ls_get<Vehicle[]>(KEYS.vehicles, []));
    setDrivers(ls_get<Driver[]>(KEYS.drivers, []));
    setRefuelings(ls_get<Refueling[]>(KEYS.refuelings, []));
    setMaintenances(ls_get<VehicleMaintenance[]>(KEYS.maintenances, []));
    setVehicleDocuments(ls_get<VehicleDocument[]>(KEYS.vehicleDocuments, []));
    setVehicleFines(ls_get<VehicleFine[]>(KEYS.vehicleFines, []));
    setQuotationRequests(ls_get<QuotationRequest[]>(KEYS.quotationRequests, []));
    setQuotationResponses(ls_get<QuotationResponse[]>(KEYS.quotationResponses, []));
    setIsLoading(false);
  }, [isAuthenticated]);

  return (
    <ERPDataContext.Provider value={{
      customers, addCustomer, updateCustomer, deleteCustomer,
      products, addProduct, updateProduct, deleteProduct,
      opportunities, addOpportunity, updateOpportunity, deleteOpportunity,
      salesOrders, addSalesOrder, updateSalesOrder, deleteSalesOrder,
      transactions, addTransaction, updateTransaction, deleteTransaction,
      accountsReceivable, addAccountReceivable, updateAccountReceivable, deleteAccountReceivable,
      accountsPayable, addAccountPayable, updateAccountPayable, deleteAccountPayable,
      suppliers, addSupplier, updateSupplier, deleteSupplier,
      stockLevels, addStockLevel, updateStockLevel,
      stockMovements, addStockMovement, updateStockMovement, deleteStockMovement,
      notifications, unreadCount, markNotificationRead, addNotification,
      vehicles, addVehicle, updateVehicle, deleteVehicle,
      drivers, addDriver, updateDriver, deleteDriver,
      refuelings, addRefueling, updateRefueling, deleteRefueling,
      maintenances, addMaintenance, updateMaintenance, deleteMaintenance,
      vehicleDocuments, addVehicleDocument, updateVehicleDocument, deleteVehicleDocument,
      vehicleFines, addVehicleFine, updateVehicleFine, deleteVehicleFine,
      quotationRequests, addQuotationRequest, updateQuotationRequest, deleteQuotationRequest,
      quotationResponses, addQuotationResponse, updateQuotationResponse, deleteQuotationResponse,
      isLoading,
    }}>
      {children}
    </ERPDataContext.Provider>
  );
}

// =====================================================
// HOOKS
// =====================================================
export function useERPData() {
  const context = useContext(ERPDataContext);
  if (context === undefined) throw new Error("useERPData must be used within an ERPDataProvider");
  return context;
}

export function useCustomers() { const { customers, addCustomer, updateCustomer, deleteCustomer } = useERPData(); return { customers, addCustomer, updateCustomer, deleteCustomer }; }
export function useProducts() { const { products, addProduct, updateProduct, deleteProduct } = useERPData(); return { products, addProduct, updateProduct, deleteProduct }; }
export function useOpportunities() { const { opportunities, addOpportunity, updateOpportunity, deleteOpportunity } = useERPData(); return { opportunities, addOpportunity, updateOpportunity, deleteOpportunity }; }
export function useSalesOrders() { const { salesOrders, addSalesOrder, updateSalesOrder, deleteSalesOrder } = useERPData(); return { salesOrders, addSalesOrder, updateSalesOrder, deleteSalesOrder }; }
export function useFinancialTransactions() { const { transactions, addTransaction, updateTransaction, deleteTransaction } = useERPData(); return { transactions, addTransaction, updateTransaction, deleteTransaction }; }
export function useSuppliers() { const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useERPData(); return { suppliers, addSupplier, updateSupplier, deleteSupplier }; }
export function useStockLevels() { const { stockLevels, addStockLevel, updateStockLevel } = useERPData(); return { stockLevels, addStockLevel, updateStockLevel }; }
export function useStockMovements() { const { stockMovements, addStockMovement, updateStockMovement, deleteStockMovement, products } = useERPData(); return { stockMovements, addStockMovement, updateStockMovement, deleteStockMovement, products }; }
export function useNotifications() { const { notifications, unreadCount, markNotificationRead, addNotification } = useERPData(); return { notifications, unreadCount, markNotificationRead, addNotification }; }
export function useVehicles() { const { vehicles, addVehicle, updateVehicle, deleteVehicle, drivers } = useERPData(); return { vehicles, addVehicle, updateVehicle, deleteVehicle, drivers }; }
export function useDrivers() { const { drivers, addDriver, updateDriver, deleteDriver } = useERPData(); return { drivers, addDriver, updateDriver, deleteDriver }; }
export function useRefuelings() { const { refuelings, addRefueling, updateRefueling, deleteRefueling, vehicles, drivers } = useERPData(); return { refuelings, addRefueling, updateRefueling, deleteRefueling, vehicles, drivers }; }
export function useMaintenances() { const { maintenances, addMaintenance, updateMaintenance, deleteMaintenance, vehicles } = useERPData(); return { maintenances, addMaintenance, updateMaintenance, deleteMaintenance, vehicles }; }
export function useVehicleDocuments() { const { vehicleDocuments, addVehicleDocument, updateVehicleDocument, deleteVehicleDocument, vehicles } = useERPData(); return { vehicleDocuments, addVehicleDocument, updateVehicleDocument, deleteVehicleDocument, vehicles }; }
export function useVehicleFines() { const { vehicleFines, addVehicleFine, updateVehicleFine, deleteVehicleFine, vehicles, drivers } = useERPData(); return { vehicleFines, addVehicleFine, updateVehicleFine, deleteVehicleFine, vehicles, drivers }; }
export function useQuotationRequests() { const { quotationRequests, addQuotationRequest, updateQuotationRequest, deleteQuotationRequest, suppliers, products } = useERPData(); return { quotationRequests, addQuotationRequest, updateQuotationRequest, deleteQuotationRequest, suppliers, products }; }
export function useQuotationResponses() { const { quotationResponses, addQuotationResponse, updateQuotationResponse, deleteQuotationResponse, quotationRequests, suppliers } = useERPData(); return { quotationResponses, addQuotationResponse, updateQuotationResponse, deleteQuotationResponse, quotationRequests, suppliers }; }

// =====================================================
// DASHBOARD HOOK
// =====================================================
export function useDashboard() {
  const { customers, products, salesOrders, accountsReceivable, accountsPayable, isLoading } = useERPData();
  const totalRevenue = salesOrders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const pendingAR = accountsReceivable.filter((ar) => ar.status !== "paid" && ar.status !== "cancelled").reduce((s, ar) => s + ar.amount - ar.amountPaid, 0);
  const pendingAP = accountsPayable.filter((ap) => ap.status !== "paid" && ap.status !== "cancelled").reduce((s, ap) => s + ap.amount - ap.amountPaid, 0);
  return {
    totalCustomers: customers.length,
    totalProducts: products.length,
    totalOrders: salesOrders.length,
    totalRevenue,
    pendingAR,
    pendingAP,
    isLoading,
  };
}