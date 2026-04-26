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
  Notification,
  AccountReceivable,
  AccountPayable,
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
  notifications: "erp_notifications",
  accountsReceivable: "erp_accounts_receivable",
  accountsPayable: "erp_accounts_payable",
};

// =====================================================
// CONTEXT TYPE
// =====================================================
interface ERPDataContextType {
  // Customers
  customers: Customer[];
  addCustomer: (c: Customer) => void;
  updateCustomer: (c: Customer) => void;
  deleteCustomer: (id: string) => void;

  // Products
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;

  // Opportunities
  opportunities: SalesOpportunity[];
  addOpportunity: (o: SalesOpportunity) => void;
  updateOpportunity: (o: SalesOpportunity) => void;
  deleteOpportunity: (id: string) => void;

  // Sales Orders
  salesOrders: SalesOrder[];
  addSalesOrder: (o: SalesOrder) => void;
  updateSalesOrder: (o: SalesOrder) => void;
  deleteSalesOrder: (id: string) => void;

  // Transactions
  transactions: FinancialTransaction[];
  addTransaction: (t: FinancialTransaction) => void;
  updateTransaction: (t: FinancialTransaction) => void;
  deleteTransaction: (id: string) => void;

  // Accounts Receivable
  accountsReceivable: AccountReceivable[];
  addAccountReceivable: (ar: AccountReceivable) => void;
  updateAccountReceivable: (ar: AccountReceivable) => void;
  deleteAccountReceivable: (id: string) => void;

  // Accounts Payable
  accountsPayable: AccountPayable[];
  addAccountPayable: (ap: AccountPayable) => void;
  updateAccountPayable: (ap: AccountPayable) => void;
  deleteAccountPayable: (id: string) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (s: Supplier) => void;
  updateSupplier: (s: Supplier) => void;
  deleteSupplier: (id: string) => void;

  // Stock Levels
  stockLevels: StockLevel[];
  addStockLevel: (s: StockLevel) => void;
  updateStockLevel: (s: StockLevel) => void;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  addNotification: (n: Notification) => void;

  // Loading
  isLoading: boolean;
}

const ERPDataContext = createContext<ERPDataContextType | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================
export function ERPDataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // — Customers —
  const [customers, setCustomers] = useState<Customer[]>([]);
  const addCustomer = useCallback((c: Customer) => setCustomers((p) => { const n = [c, ...p]; ls_set(KEYS.customers, n); return n; }), []);
  const updateCustomer = useCallback((c: Customer) => setCustomers((p) => { const n = p.map((x) => x.id === c.id ? c : x); ls_set(KEYS.customers, n); return n; }), []);
  const deleteCustomer = useCallback((id: string) => setCustomers((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.customers, n); return n; }), []);

  // — Products —
  const [products, setProducts] = useState<Product[]>([]);
  const addProduct = useCallback((p: Product) => setProducts((prev) => { const n = [p, ...prev]; ls_set(KEYS.products, n); return n; }), []);
  const updateProduct = useCallback((p: Product) => setProducts((prev) => { const n = prev.map((x) => x.id === p.id ? p : x); ls_set(KEYS.products, n); return n; }), []);
  const deleteProduct = useCallback((id: string) => setProducts((prev) => { const n = prev.filter((x) => x.id !== id); ls_set(KEYS.products, n); return n; }), []);

  // — Opportunities —
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>([]);
  const addOpportunity = useCallback((o: SalesOpportunity) => setOpportunities((p) => { const n = [o, ...p]; ls_set(KEYS.opportunities, n); return n; }), []);
  const updateOpportunity = useCallback((o: SalesOpportunity) => setOpportunities((p) => { const n = p.map((x) => x.id === o.id ? o : x); ls_set(KEYS.opportunities, n); return n; }), []);
  const deleteOpportunity = useCallback((id: string) => setOpportunities((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.opportunities, n); return n; }), []);

  // — Sales Orders —
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const addSalesOrder = useCallback((o: SalesOrder) => setSalesOrders((p) => { const n = [o, ...p]; ls_set(KEYS.salesOrders, n); return n; }), []);
  const updateSalesOrder = useCallback((o: SalesOrder) => setSalesOrders((p) => { const n = p.map((x) => x.id === o.id ? o : x); ls_set(KEYS.salesOrders, n); return n; }), []);
  const deleteSalesOrder = useCallback((id: string) => setSalesOrders((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.salesOrders, n); return n; }), []);

  // — Transactions —
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const addTransaction = useCallback((t: FinancialTransaction) => setTransactions((p) => { const n = [t, ...p]; ls_set(KEYS.transactions, n); return n; }), []);
  const updateTransaction = useCallback((t: FinancialTransaction) => setTransactions((p) => { const n = p.map((x) => x.id === t.id ? t : x); ls_set(KEYS.transactions, n); return n; }), []);
  const deleteTransaction = useCallback((id: string) => setTransactions((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.transactions, n); return n; }), []);

  // — Accounts Receivable —
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>([]);
  const addAccountReceivable = useCallback((ar: AccountReceivable) => setAccountsReceivable((p) => { const n = [ar, ...p]; ls_set(KEYS.accountsReceivable, n); return n; }), []);
  const updateAccountReceivable = useCallback((ar: AccountReceivable) => setAccountsReceivable((p) => { const n = p.map((x) => x.id === ar.id ? ar : x); ls_set(KEYS.accountsReceivable, n); return n; }), []);
  const deleteAccountReceivable = useCallback((id: string) => setAccountsReceivable((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.accountsReceivable, n); return n; }), []);

  // — Accounts Payable —
  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>([]);
  const addAccountPayable = useCallback((ap: AccountPayable) => setAccountsPayable((p) => { const n = [ap, ...p]; ls_set(KEYS.accountsPayable, n); return n; }), []);
  const updateAccountPayable = useCallback((ap: AccountPayable) => setAccountsPayable((p) => { const n = p.map((x) => x.id === ap.id ? ap : x); ls_set(KEYS.accountsPayable, n); return n; }), []);
  const deleteAccountPayable = useCallback((id: string) => setAccountsPayable((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.accountsPayable, n); return n; }), []);

  // — Suppliers —
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const addSupplier = useCallback((s: Supplier) => setSuppliers((p) => { const n = [s, ...p]; ls_set(KEYS.suppliers, n); return n; }), []);
  const updateSupplier = useCallback((s: Supplier) => setSuppliers((p) => { const n = p.map((x) => x.id === s.id ? s : x); ls_set(KEYS.suppliers, n); return n; }), []);
  const deleteSupplier = useCallback((id: string) => setSuppliers((p) => { const n = p.filter((x) => x.id !== id); ls_set(KEYS.suppliers, n); return n; }), []);

  // — Stock Levels —
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const addStockLevel = useCallback((s: StockLevel) => setStockLevels((p) => { const n = [s, ...p]; ls_set(KEYS.stockLevels, n); return n; }), []);
  const updateStockLevel = useCallback((s: StockLevel) => setStockLevels((p) => { const n = p.map((x) => x.id === s.id ? s : x); ls_set(KEYS.stockLevels, n); return n; }), []);

  // — Notifications —
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const markNotificationRead = useCallback((id: string) => setNotifications((p) => { const n = p.map((x) => x.id === id ? { ...x, isRead: true } : x); ls_set(KEYS.notifications, n); return n; }), []);
  const addNotification = useCallback((notif: Notification) => setNotifications((p) => { const n = [notif, ...p]; ls_set(KEYS.notifications, n); return n; }), []);

  // =====================================================
  // LOAD FROM LOCALSTORAGE ON MOUNT (only when authenticated)
  // =====================================================
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
    setNotifications(ls_get<Notification[]>(KEYS.notifications, []));
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
      notifications, unreadCount, markNotificationRead, addNotification,
      isLoading,
    }}>
      {children}
    </ERPDataContext.Provider>
  );
}

export function useERPData() {
  const context = useContext(ERPDataContext);
  if (context === undefined) throw new Error("useERPData must be used within an ERPDataProvider");
  return context;
}

// Hooks específicos por módulo
export function useCustomers() { const { customers, addCustomer, updateCustomer, deleteCustomer } = useERPData(); return { customers, addCustomer, updateCustomer, deleteCustomer }; }
export function useProducts() { const { products, addProduct, updateProduct, deleteProduct } = useERPData(); return { products, addProduct, updateProduct, deleteProduct }; }
export function useOpportunities() { const { opportunities, addOpportunity, updateOpportunity, deleteOpportunity } = useERPData(); return { opportunities, addOpportunity, updateOpportunity, deleteOpportunity }; }
export function useSalesOrders() { const { salesOrders, addSalesOrder, updateSalesOrder, deleteSalesOrder } = useERPData(); return { salesOrders, addSalesOrder, updateSalesOrder, deleteSalesOrder }; }
export function useFinancialTransactions() { const { transactions, addTransaction, updateTransaction, deleteTransaction } = useERPData(); return { transactions, addTransaction, updateTransaction, deleteTransaction }; }
export function useSuppliers() { const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useERPData(); return { suppliers, addSupplier, updateSupplier, deleteSupplier }; }
export function useStockLevels() { const { stockLevels, addStockLevel, updateStockLevel } = useERPData(); return { stockLevels, addStockLevel, updateStockLevel }; }
export function useNotifications() { const { notifications, unreadCount, markNotificationRead, addNotification } = useERPData(); return { notifications, unreadCount, markNotificationRead, addNotification }; }

// Hook de dashboard calculado a partir dos dados reais
export function useDashboard() {
  const { customers, products, salesOrders, accountsReceivable, accountsPayable, isLoading } = useERPData();
  const totalRevenue = salesOrders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const pendingAR = accountsReceivable.filter((ar) => ar.status !== "paid" && ar.status !== "cancelled").reduce((s, ar) => s + ar.amount - ar.amountPaid, 0);
  const pendingAP = accountsPayable.filter((ap) => ap.status !== "paid" && ap.status !== "cancelled").reduce((s, ap) => s + ap.amount - ap.amountPaid, 0);
  return {
    isLoading,
    totalCustomers: customers.length,
    totalProducts: products.length,
    totalOrders: salesOrders.length,
    totalRevenue,
    pendingAR,
    pendingAP,
  };
}