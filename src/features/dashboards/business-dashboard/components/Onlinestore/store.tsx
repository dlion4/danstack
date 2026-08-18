import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ACTIVITY, ADJUSTMENTS, BATCHES, COUNTS, LOCS, MOVEMENTS, NOTIFICATIONS, POS, PRODUCTS, RETURNS,
} from "./data";
import type {
  Activity, Adjustment, Batch, Location, Movement, MoveType, Notification, PO, Product, ReturnItem, ReturnStatus, StockCount,
} from "./data";

export type ToastType = "success" | "info" | "warning" | "danger";
export interface Toast { id: number; msg: string; type: ToastType; title?: string }
export interface ModalState { name: string; payload: Record<string, unknown> }

export interface TransferItem { productId: string; qty: number }
export interface AdjItem { productId: string; qty: number; reason: string }
export interface CountItemInput { productId: string; counted: number | null }

export interface Store {
  business: string;
  setBusiness: (b: string) => void;
  products: Product[];
  locations: Location[];
  movements: Movement[];
  adjustments: Adjustment[];
  counts: StockCount[];
  pos: PO[];
  batches: Batch[];
  returns: ReturnItem[];
  notifications: Notification[];
  activity: Activity[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  modal: ModalState | null;
  openModal: (name: string, payload?: Record<string, unknown>) => void;
  closeModal: () => void;
  toasts: Toast[];
  toast: (msg: string, type?: ToastType, title?: string) => void;
  dismissToast: (id: number) => void;
  recordActivity: (text: string, icon?: string) => void;
  /* inventory actions */
  transferStock: (fromLoc: string, toLoc: string, items: TransferItem[]) => void;
  postAdjustment: (type: string, items: AdjItem[], locId: string, note: string) => void;
  startCount: (name: string, scopeLabel: string, locId: string, assignedTo: string, items: { productId: string; expected: number }[]) => string;
  updateCount: (id: string, items: CountItemInput[]) => void;
  postCount: (id: string, sheet: { productId: string; expected: number; counted: number | null }[]) => void;
  closePO: (id: string) => void;
  receivePO: (id: string, items: TransferItem[], locId: string) => void;
  createPO: (supplier: string, items: TransferItem[], expected: string, note: string) => string;
  writeOff: (items: TransferItem[], reason: string, method: string, locId: string) => void;
  processReturn: (id: string, decision: "Restock" | "Quarantine" | "Destroy" | "Refund", note: string) => void;
  updateReorder: (productId: string, patch: { reorderAt?: number; reorderQty?: number; autoPO?: boolean }) => void;
  addLocation: (l: Location) => void;
  updateLocation: (id: string, patch: Partial<Location>) => void;
  removeLocation: (id: string) => void;
  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 0;
let refSeq = 100;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState("TS Retail Ltd");
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [locations, setLocations] = useState<Location[]>(LOCS);
  const [movements, setMovements] = useState<Movement[]>(MOVEMENTS);
  const [adjustments, setAdjustments] = useState<Adjustment[]>(ADJUSTMENTS);
  const [counts, setCounts] = useState<StockCount[]>(COUNTS);
  const [pos, setPos] = useState<PO[]>(POS);
  const [batches, setBatches] = useState<Batch[]>(BATCHES);
  const [returns, setReturns] = useState<ReturnItem[]>(RETURNS);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [activity, setActivity] = useState<Activity[]>(ACTIVITY);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((msg: string, type: ToastType = "success", title?: string) => {
    const id = ++toastId;
    setToasts((t) => [...t.slice(-4), { id, msg, type, title }]);
    window.setTimeout(() => dismissToast(id), 4200);
  }, [dismissToast]);
  const openModal = useCallback((name: string, payload: Record<string, unknown> = {}) => setModal({ name, payload }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const recordActivity = useCallback((text: string, icon = "bi-pencil") => {
    setActivity((a) => [{ time: "Just now", icon, text, by: "You" }, ...a].slice(0, 40));
  }, []);

  /* ---------- internal helpers ---------- */
  const pushMoves = useCallback((list: Omit<Movement, "id" | "by" | "value" | "balance">[], valueOfQty: (m: Omit<Movement, "id" | "by" | "value" | "balance">) => number, balanceOf: (productId: string) => number) => {
    setMovements((prev) => [
      ...list.map((m) => ({
        ...m,
        id: "mv-" + Date.now() + "-" + Math.floor(Math.random() * 999),
        by: "You",
        value: valueOfQty(m),
        balance: balanceOf(m.productId),
      })),
      ...prev,
    ].slice(0, 120));
  }, []);

  const shiftStock = useCallback((productId: string, locId: string, delta: number) => {
    setProducts((list) => list.map((p) => {
      if (p.id !== productId) return p;
      const cur = p.stockByLoc[locId] ?? 0;
      return { ...p, stockByLoc: { ...p.stockByLoc, [locId]: Math.max(0, cur + delta) }, updated: "Just now" };
    }));
  }, []);

  const findProduct = (id: string) => products.find((p) => p.id === id);

  /* ---------- transfers ---------- */
  const transferStock = useCallback((fromLoc: string, toLoc: string, items: TransferItem[]) => {
    items.forEach((it) => {
      shiftStock(it.productId, fromLoc, -it.qty);
      shiftStock(it.productId, toLoc, it.qty);
    });
    const ref = `TRF-${++refSeq}`;
    const fromLocName = locations.find((l) => l.id === fromLoc)?.name ?? fromLoc;
    const toLocName = locations.find((l) => l.id === toLoc)?.name ?? toLoc;
    pushMoves(
      items.flatMap((it) => [
        { time: "Just now", type: "Transfer out" as MoveType, productId: it.productId, qty: -it.qty, locId: fromLoc, ref },
        { time: "Just now", type: "Transfer in" as MoveType, productId: it.productId, qty: it.qty, locId: toLoc, ref },
      ]),
      (m) => (m.qty > 0 ? findProduct(m.productId)?.cost ?? 0 : -(findProduct(m.productId)?.cost ?? 0)) * Math.abs(m.qty),
      (productId) => Object.values(findProduct(productId)?.stockByLoc ?? {}).reduce((a, b) => a + b, 0),
    );
    recordActivity(`${ref}: ${items.length} line(s) moved ${fromLocName} → ${toLocName}`, "bi-arrow-left-right");
    toast(`${items.length} product(s) transferred to ${toLocName}.`, "success", "Transfer posted");
  }, [shiftStock, locations, pushMoves, findProduct, recordActivity, toast]);

  /* ---------- adjustments ---------- */
  const postAdjustment = useCallback((type: string, items: AdjItem[], locId: string, note: string) => {
    items.forEach((it) => shiftStock(it.productId, locId, it.qty));
    const id = `ADJ-${20 + Math.floor(Math.random() * 40)}`;
    const value = items.reduce((a, it) => a + (findProduct(it.productId)?.cost ?? 0) * it.qty, 0);
    setAdjustments((prev) => [{
      id, date: "Just now", type, locId, by: "You",
      items, value, note: note || "Posted from wizard",
    }, ...prev]);
    pushMoves(
      items.map((it) => ({ time: "Just now", type: "Adjustment" as MoveType, productId: it.productId, qty: it.qty, locId, ref: id })),
      (m) => (findProduct(m.productId)?.cost ?? 0) * m.qty,
      (productId) => Object.values(findProduct(productId)?.stockByLoc ?? {}).reduce((a, b) => a + b, 0),
    );
    recordActivity(`${id}: ${items.length} line(s) — ${type}`, "bi-clipboard-x");
    toast(`${id} posted (${type}) — ${items.reduce((a, b) => a + Math.abs(b.qty), 0)} units, ${value >= 0 ? "+" : "−"}KES ${Math.abs(value).toLocaleString()} value impact.`, "success", "Adjustment posted");
  }, [shiftStock, pushMoves, findProduct, recordActivity, toast]);

  /* ---------- stock counts ---------- */
  const startCount = useCallback((name: string, scopeLabel: string, locId: string, assignedTo: string, items: { productId: string; expected: number }[]) => {
    const id = `CNT-${114 + Math.floor(Math.random() * 20)}`;
    setCounts((prev) => [{
      id, name, scopeLabel, locId, assignedTo, status: "Counting", started: "Just now",
      items: items.map((i) => ({ productId: i.productId, expected: i.expected, counted: null, variance: null })),
    }, ...prev]);
    recordActivity(`Stock count ${id} started — ${scopeLabel} (${assignedTo})`, "bi-clipboard-check");
    return id;
  }, [recordActivity]);

  const updateCount = useCallback((id: string, items: CountItemInput[]) => {
    setCounts((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      return {
        ...c,
        items: c.items.map((it) => {
          const upd = items.find((x) => x.productId === it.productId);
          if (!upd) return it;
          const variance = upd.counted === null ? null : upd.counted - it.expected;
          return { ...it, counted: upd.counted, variance };
        }),
      };
    }));
  }, []);

  const postCount = useCallback((id: string, sheet: { productId: string; expected: number; counted: number | null }[]) => {
    const variances = sheet.filter((i) => i.counted !== null && i.counted !== i.expected);
    if (variances.length > 0) {
      const items: AdjItem[] = variances.map((v) => ({
        productId: v.productId,
        qty: (v.counted ?? 0) - v.expected,
        reason: "Count variance",
      }));
      const value = items.reduce((a, it) => a + (findProduct(it.productId)?.cost ?? 0) * it.qty, 0);
      setAdjustments((prev) => [{
        id: `ADJ-${20 + Math.floor(Math.random() * 40)}`, date: "Just now", type: "Cycle count", locId: "l1", by: "You",
        items, value, note: `${id} reconciliation`,
      }, ...prev]);
      items.forEach((it) => shiftStock(it.productId, "l1", it.qty));
      pushMoves(
        items.map((it) => ({ time: "Just now", type: "Count" as MoveType, productId: it.productId, qty: it.qty, locId: "l1", ref: id })),
        (m) => (findProduct(m.productId)?.cost ?? 0) * m.qty,
        (productId) => Object.values(findProduct(productId)?.stockByLoc ?? {}).reduce((a, b) => a + b, 0),
      );
    }
    setCounts((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      return {
        ...c,
        status: "Completed" as const,
        items: c.items.map((it) => {
          const s = sheet.find((x) => x.productId === it.productId);
          if (!s) return it;
          return { ...it, counted: s.counted, variance: s.counted === null ? null : s.counted - it.expected };
        }),
      };
    }));
    recordActivity(`${id} completed — ${variances.length} variance(s) posted`, "bi-clipboard-check");
    toast(`${id} completed. ${variances.length} variance(s) found & posted as adjustments.`, "success", "Count closed");
  }, [findProduct, shiftStock, pushMoves, recordActivity, toast]);

  const closePO = useCallback((id: string) => {
    setPos((prev) => prev.map((po) => (po.id === id ? { ...po, status: "Closed" as const } : po)));
  }, []);

  /* ---------- purchase orders ---------- */
  const receivePO = useCallback((id: string, items: TransferItem[], locId: string) => {
    items.forEach((it) => {
      shiftStock(it.productId, locId, it.qty);
      setProducts((list) => list.map((p) => (p.id === it.productId ? { ...p, onOrder: Math.max(0, (p.onOrder ?? 0) - it.qty) } : p)));
    });
    setPos((prev) => prev.map((po) => {
      if (po.id !== id) return po;
      const newItems = po.items.map((it) => {
        const upd = items.find((x) => x.productId === it.productId);
        return upd ? { ...it, received: it.received + upd.qty } : it;
      });
      const done = newItems.every((it) => it.received >= it.qty);
      return { ...po, items: newItems, status: done ? "Received" as const : "Partial" as const };
    }));
    pushMoves(
      items.map((it) => ({ time: "Just now", type: "Purchase" as MoveType, productId: it.productId, qty: it.qty, locId, ref: id })),
      (m) => (findProduct(m.productId)?.cost ?? 0) * m.qty,
      (productId) => Object.values(findProduct(productId)?.stockByLoc ?? {}).reduce((a, b) => a + b, 0),
    );
    recordActivity(`${id} received — ${items.length} line(s) into stock`, "bi-box-arrow-in-down");
    toast(`${id} received into stock. Ledger entry posted: Dr Inventory, Cr Accounts Payable.`, "success", "Goods received");
  }, [shiftStock, pushMoves, findProduct, recordActivity, toast]);

  const createPO = useCallback((supplier: string, items: TransferItem[], expected: string, note: string) => {
    const id = `PO-${1043 + Math.floor(Math.random() * 30)}`;
    setPos((prev) => [{
      id, supplier, date: "Just now", expected, note, status: "Sent",
      items: items.map((i) => ({ productId: i.productId, qty: i.qty, received: 0 })),
    }, ...prev]);
    items.forEach((it) => {
      setProducts((list) => list.map((p) => (p.id === it.productId ? { ...p, onOrder: (p.onOrder ?? 0) + it.qty } : p)));
    });
    recordActivity(`${id} sent to ${supplier} — ${items.length} line(s)`, "bi-cart-plus");
    toast(`${id} sent to ${supplier}. Stock-on-order updated.`, "success", "PO created");
    return id;
  }, [recordActivity, toast]);

  /* ---------- write-offs ---------- */
  const writeOff = useCallback((items: TransferItem[], reason: string, method: string, locId: string) => {
    items.forEach((it) => shiftStock(it.productId, locId, -it.qty));
    const batchIds = items.map((it) => it.productId);
    setBatches((prev) => prev.filter((b) => !batchIds.includes(b.productId) || b.qty > 0));
    const id = `EXP-${10 + Math.floor(Math.random() * 30)}`;
    const value = items.reduce((a, it) => a + (findProduct(it.productId)?.cost ?? 0) * it.qty, 0);
    setAdjustments((prev) => [{
      id: `ADJ-${20 + Math.floor(Math.random() * 40)}`, date: "Just now", type: "Expired", locId, by: "You",
      items: items.map((it) => ({ ...it, reason })), value: -value, note: `${method} — ${id}`,
    }, ...prev]);
    pushMoves(
      items.map((it) => ({ time: "Just now", type: "Write-off" as MoveType, productId: it.productId, qty: -it.qty, locId, ref: id })),
      (m) => -(findProduct(m.productId)?.cost ?? 0) * Math.abs(m.qty),
      (productId) => Object.values(findProduct(productId)?.stockByLoc ?? {}).reduce((a, b) => a + b, 0),
    );
    recordActivity(`${id}: wrote off ${items.reduce((a, b) => a + b.qty, 0)} units — ${method} (${reason})`, "bi-trash");
    toast(`${id} posted — ${items.reduce((a, b) => a + b.qty, 0)} units ${method.toLowerCase()}. Loss of KES ${value.toLocaleString()} recorded.`, "warning", "Write-off posted");
  }, [shiftStock, pushMoves, findProduct, recordActivity, toast]);

  /* ---------- returns ---------- */
  const processReturn = useCallback((id: string, decision: "Restock" | "Quarantine" | "Destroy" | "Refund", note: string) => {
    setReturns((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const status: ReturnStatus = decision === "Restock" ? "Restocked" : decision === "Quarantine" ? "Quarantined" : decision === "Destroy" ? "Destroyed" : "Refunded";
      return { ...r, status, condition: note };
    }));
    const r = returns.find((x) => x.id === id);
    if (r && decision === "Restock") {
      shiftStock(r.productId, "l1", r.qty);
      pushMoves(
        [{ time: "Just now", type: "Return" as MoveType, productId: r.productId, qty: r.qty, locId: "l1", ref: r.id }],
        (m) => (findProduct(m.productId)?.cost ?? 0) * m.qty,
        (productId) => Object.values(findProduct(productId)?.stockByLoc ?? {}).reduce((a, b) => a + b, 0),
      );
    }
    if (r && decision === "Destroy") {
      shiftStock(r.productId, "l3", -r.qty);
    }
    recordActivity(`${id} → ${decision} (${note})`, "bi-arrow-counterclockwise");
    toast(`${id} processed — ${decision}. ${decision === "Restock" ? "Stock returned to Main Warehouse." : decision === "Destroy" ? "Written off and logged." : "Customer update sent."}`, "success", "Return processed");
  }, [returns, shiftStock, pushMoves, findProduct, recordActivity, toast]);

  /* ---------- reorder & locations ---------- */
  const updateReorder = useCallback((productId: string, patch: { reorderAt?: number; reorderQty?: number; autoPO?: boolean }) => {
    setProducts((list) => list.map((p) => (p.id === productId ? { ...p, ...patch, updated: "Just now" } : p)));
  }, []);

  const addLocation = useCallback((l: Location) => {
    setLocations((prev) => [...prev, l]);
  }, []);

  const updateLocation = useCallback((id: string, patch: Partial<Location>) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const removeLocation = useCallback((id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const markNotifsRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, unread: false }))), []);
  const dismissNotif = useCallback((id: number) => setNotifications((n) => n.filter((x) => x.id !== id)), []);

  const value = useMemo<Store>(() => ({
    business, setBusiness, products, locations, movements, adjustments, counts, pos, batches, returns,
    notifications, activity, searchQuery, setSearchQuery, modal, openModal, closeModal, toasts, toast, dismissToast,
    recordActivity, transferStock, postAdjustment, startCount, updateCount, postCount, receivePO, createPO,
    writeOff, processReturn, updateReorder, addLocation, updateLocation, removeLocation, closePO, markNotifsRead, dismissNotif,
  }), [business, products, locations, movements, adjustments, counts, pos, batches, returns, notifications, activity,
    searchQuery, modal, toasts, openModal, closeModal, toast, dismissToast, recordActivity, transferStock, postAdjustment,
    startCount, updateCount, postCount, receivePO, createPO, writeOff, processReturn, updateReorder, addLocation,
    updateLocation, removeLocation, closePO, markNotifsRead, dismissNotif]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
