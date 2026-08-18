import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ACTIVITY, DEFAULT_CONFIG, DISCOUNTS, NOTIFICATIONS, ORDERS, PRODUCTS,
} from "./data";
import type { Activity, Discount, Notification, Order, OrderStatus, PStatus, Product, StoreConfig } from "./data";

export type ToastType = "success" | "info" | "warning" | "danger";
export interface Toast { id: number; msg: string; type: ToastType; title?: string }
export interface ModalState { name: string; payload: Record<string, unknown> }

export interface Store {
  business: string;
  setBusiness: (b: string) => void;
  products: Product[];
  orders: Order[];
  discounts: Discount[];
  notifications: Notification[];
  activity: Activity[];
  config: StoreConfig;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  modal: ModalState | null;
  openModal: (name: string, payload?: Record<string, unknown>) => void;
  closeModal: () => void;
  toasts: Toast[];
  toast: (msg: string, type?: ToastType, title?: string) => void;
  dismissToast: (id: number) => void;
  recordActivity: (text: string, icon?: string) => void;
  /* product actions */
  saveProduct: (p: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  archiveProducts: (ids: string[]) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => Product | null;
  adjustStock: (id: string, qty: number, note?: string) => void;
  receiveStock: (id: string, qty: number) => void;
  applyBulkPrice: (ids: string[], mode: "percent" | "fixed", value: number, dir: "up" | "down" | "set") => number;
  importProducts: (list: Product[]) => void;
  /* order actions */
  setOrderStatus: (id: string, status: OrderStatus, note?: string, notify?: boolean) => void;
  refundOrder: (id: string, reason: string, amount: number, method: string) => void;
  addOrder: (o: Order) => void;
  /* store actions */
  setConfig: (patch: Partial<StoreConfig>) => void;
  connectDomain: (domain: string) => void;
  addDiscount: (d: Discount) => void;
  /* notifications */
  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);

let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState("TS Retail Ltd");
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [discounts, setDiscounts] = useState<Discount[]>(DISCOUNTS);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [activity, setActivity] = useState<Activity[]>(ACTIVITY);
  const [config, setConfigState] = useState<StoreConfig>(DEFAULT_CONFIG);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const closeRef = useRef<() => void>(() => {});

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback((msg: string, type: ToastType = "success", title?: string) => {
    const id = ++toastId;
    setToasts((t) => [...t.slice(-4), { id, msg, type, title }]);
    window.setTimeout(() => dismissToast(id), 4200);
  }, [dismissToast]);

  const openModal = useCallback((name: string, payload: Record<string, unknown> = {}) => {
    setModal({ name, payload });
  }, []);
  const closeModal = useCallback(() => setModal(null), []);
  closeRef.current = closeModal;

  const recordActivity = useCallback((text: string, icon = "bi-pencil") => {
    setActivity((a) => [{ time: "Just now", icon, text, by: "You" }, ...a].slice(0, 30));
  }, []);

  const saveProduct = useCallback((p: Product) => {
    setProducts((list) => {
      const i = list.findIndex((x) => x.id === p.id);
      if (i >= 0) {
        const next = [...list];
        next[i] = p;
        return next;
      }
      return [p, ...list];
    });
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const archiveProducts = useCallback((ids: string[]) => {
    setProducts((list) => list.map((p) => (ids.includes(p.id) ? { ...p, status: "Archived" as PStatus, listed: false } : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((list) => list.filter((p) => p.id !== id));
  }, []);

  const duplicateProduct = useCallback((id: string): Product | null => {
    const src = products.find((p) => p.id === id);
    if (!src) return null;
    const copy: Product = {
      ...src,
      id: "p" + Date.now(),
      name: src.name + " (Copy)",
      sku: src.sku + "-C",
      status: "Draft",
      listed: false,
      featured: false,
      sold30: 0,
      rating: 0,
      reviews: 0,
      updated: "Just now",
      tags: [...src.tags],
    };
    setProducts((list) => [copy, ...list]);
    return copy;
  }, [products]);

  const adjustStock = useCallback((id: string, qty: number, note?: string) => {
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + qty), updated: "Just now" } : p)));
    if (note) toast(note, "info", "Stock updated");
  }, [toast]);

  const receiveStock = useCallback((id: string, qty: number) => {
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, stock: p.stock + qty, onOrder: Math.max(0, (p.onOrder || 0) - qty), updated: "Just now" } : p)));
  }, []);

  const applyBulkPrice = useCallback((ids: string[], mode: "percent" | "fixed", value: number, dir: "up" | "down" | "set") => {
    let count = 0;
    setProducts((list) => list.map((p) => {
      if (!ids.includes(p.id)) return p;
      const sign = dir === "up" ? 1 : dir === "down" ? -1 : 0;
      let np: number;
      if (dir === "set") np = value;
      else if (mode === "percent") np = p.price * (1 + (sign * value) / 100);
      else np = p.price + sign * value;
      np = Math.round(Math.max(10, np));
      if (np === p.price) return p;
      count++;
      return { ...p, price: np, updated: "Just now" };
    }));
    return count;
  }, []);

  const importProducts = useCallback((list: Product[]) => {
    setProducts((prev) => [...list, ...prev]);
  }, []);

  const setOrderStatus = useCallback((id: string, status: OrderStatus, note?: string, notify?: boolean) => {
    setOrders((list) => list.map((o) => {
      if (o.id !== id) return o;
      const now = "Just now";
      const events = [...o.events];
      if (status === "Cancelled") events.push({ time: now, title: "Cancelled", note: note || "Order cancelled" });
      if (status === "Shipped") {
        events[2] = { ...events[2], time: now, title: "Packed", note: "By Mwangi K." };
        events[3] = { ...events[3], time: now, title: "Shipped", note: "Sendy — tracking SK-88500" };
      }
      if (status === "Delivered") {
        events[2] = events[2].time === "—" ? { ...events[2], time: now, title: "Packed" } : events[2];
        events[3] = events[3].time === "—" ? { ...events[3], time: now, title: "Shipped" } : events[3];
        events[4] = { ...events[4], time: now, title: "Delivered", note: note || "Delivered" };
      }
      return { ...o, status, events };
    }));
    if (notify) toast("Customer notified via SMS & WhatsApp", "info", "Notification sent");
  }, [toast]);

  const refundOrder = useCallback((id: string, reason: string, amount: number, method: string) => {
    setOrders((list) => list.map((o) => o.id === id ? { ...o, status: "Refunded" as OrderStatus, events: [...o.events, { time: "Just now", title: "Refunded", note: `${reason} — KES ${amount.toLocaleString()} via ${method}` }] } : o));
  }, []);

  const addOrder = useCallback((o: Order) => {
    setOrders((list) => [o, ...list]);
  }, []);

  const setConfig = useCallback((patch: Partial<StoreConfig>) => {
    setConfigState((c) => ({ ...c, ...patch }));
  }, []);

  const connectDomain = useCallback((domain: string) => {
    setConfigState((c) => ({ ...c, customDomain: domain }));
  }, []);

  const addDiscount = useCallback((d: Discount) => {
    setDiscounts((list) => [d, ...list]);
  }, []);

  const markNotifsRead = useCallback(() => {
    setNotifications((n) => n.map((x) => ({ ...x, unread: false })));
  }, []);

  const dismissNotif = useCallback((id: number) => {
    setNotifications((n) => n.filter((x) => x.id !== id));
  }, []);

  const value = useMemo<Store>(() => ({
    business, setBusiness, products, orders, discounts, notifications, activity, config,
    searchQuery, setSearchQuery, modal, openModal, closeModal, toasts, toast, dismissToast,
    recordActivity, saveProduct, updateProduct, archiveProducts, deleteProduct, duplicateProduct,
    adjustStock, receiveStock, applyBulkPrice, importProducts, setOrderStatus, refundOrder, addOrder,
    setConfig, connectDomain, addDiscount, markNotifsRead, dismissNotif,
  }), [business, products, orders, discounts, notifications, activity, config, searchQuery, modal, toasts,
    openModal, closeModal, toast, dismissToast, recordActivity, saveProduct, updateProduct, archiveProducts,
    deleteProduct, duplicateProduct, adjustStock, receiveStock, applyBulkPrice, importProducts, setOrderStatus,
    refundOrder, addOrder, setConfig, connectDomain, addDiscount, markNotifsRead, dismissNotif]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
