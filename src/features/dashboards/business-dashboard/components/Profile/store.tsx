import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ACTIVITY, DEFAULT_PROFILE, DIRECTORS, FOLDERS, KYB_DOCS, NOTIFICATIONS, PORTFOLIO,
  SECTOR_PRESETS, TAX_REGISTRATIONS,
} from "./data";
import type {
  Activity, BusinessProfile, ComplianceLevel, Director, DocStatus, EntityStatus, EntityType,
  Folder, KYBDoc, Notification, PortfolioBusiness, TaxReg,
} from "./data";

export type ToastType = "success" | "info" | "warning" | "danger";
export interface Toast { id: number; msg: string; type: ToastType; title?: string }
export interface ModalState { name: string; payload: Record<string, unknown> }

export interface Store {
  business: string;
  setBusiness: (b: string) => void;
  currentBusinessId: string;
  setCurrentBusinessId: (id: string) => void;
  profile: BusinessProfile;
  directors: Director[];
  kybDocs: KYBDoc[];
  taxRegistrations: TaxReg[];
  portfolio: PortfolioBusiness[];
  folders: Folder[];
  appliedPresets: string[];
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
  /* profile */
  updateProfile: (patch: Partial<BusinessProfile>) => void;
  verifyKraPin: () => void;
  /* KYB */
  uploadDoc: (docId: string, fileName: string) => void;
  submitKybForReview: () => void;
  /* directors */
  addDirector: (d: Omit<Director, "id">) => string;
  updateDirector: (id: string, patch: Partial<Director>) => void;
  removeDirector: (id: string) => void;
  /* tax */
  toggleTaxRegistration: (id: string, patch: Partial<TaxReg>) => void;
  /* presets */
  applyPreset: (presetId: string) => void;
  /* portfolio */
  addBusiness: (b: Omit<PortfolioBusiness, "id">) => string;
  updateBusiness: (id: string, patch: Partial<PortfolioBusiness>) => void;
  deactivateBusiness: (id: string) => void;
  reactivateBusiness: (id: string) => void;
  deleteBusiness: (id: string) => void;
  moveBusinessToFolder: (id: string, folderId: string) => void;
  addFolder: (name: string, emoji: string, color: string) => string;
  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState("TechSolutions Ltd");
  const [currentBusinessId, setCurrentBusinessId] = useState("b1");
  const [profile, setProfile] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [directors, setDirectors] = useState<Director[]>(DIRECTORS);
  const [kybDocs, setKybDocs] = useState<KYBDoc[]>(KYB_DOCS);
  const [taxRegistrations, setTaxRegistrations] = useState<TaxReg[]>(TAX_REGISTRATIONS);
  const [portfolio, setPortfolio] = useState<PortfolioBusiness[]>(PORTFOLIO);
  const [folders, setFolders] = useState<Folder[]>(FOLDERS);
  const [appliedPresets, setAppliedPresets] = useState<string[]>(["sp3"]);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [activity, setActivity] = useState<Activity[]>(ACTIVITY);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback((msg: string, type: ToastType = "success", title?: string) => {
    const id = ++toastId;
    setToasts((t) => [...t.slice(-4), { id, msg, type, title }]);
    window.setTimeout(() => dismissToast(id), 4600);
  }, [dismissToast]);
  const openModal = useCallback((name: string, payload: Record<string, unknown> = {}) => setModal({ name, payload }), []);
  const closeModal = useCallback(() => setModal(null), []);
  const recordActivity = useCallback((text: string, icon = "bi-pencil") => {
    setActivity((a) => [{ time: "Just now", icon, text, by: "You" }, ...a].slice(0, 40));
  }, []);

  /* ---------- profile ---------- */
  const updateProfile = useCallback((patch: Partial<BusinessProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const verifyKraPin = useCallback(() => {
    setProfile((p) => ({ ...p, kraVerified: true }));
    recordActivity(`KRA PIN ${profile.kraPin} verified via iTax API`, "bi-shield-check");
    toast("KRA PIN verified ✓ — iTax confirmed the business is in good standing.", "success", "PIN verified");
  }, [profile.kraPin, recordActivity, toast]);

  /* ---------- KYB ---------- */
  const uploadDoc = useCallback((docId: string, fileName: string) => {
    setKybDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, status: "Under Review" as DocStatus, uploaded: "Just now", fileName } : d)));
    const doc = kybDocs.find((d) => d.id === docId);
    recordActivity(`${doc?.label ?? docId} uploaded (${fileName})`, "bi-cloud-upload");
    toast(`${doc?.label ?? "Document"} received — verification typically completes within 24 hours.`, "success", "Upload complete");
  }, [kybDocs, recordActivity, toast]);

  const submitKybForReview = useCallback(() => {
    const missing = kybDocs.filter((d) => d.required && d.status === "Missing").length;
    if (missing > 0) {
      toast(`${missing} required document(s) still missing — upload them first.`, "warning", "Cannot submit yet");
      return;
    }
    setKybDocs((prev) => prev.map((d) => (d.status === "Missing" ? d : d.status === "Verified" ? d : { ...d, status: "Under Review" as DocStatus })));
    recordActivity("KYB pack submitted for review by PayMo compliance", "bi-shield-check");
    toast("KYB pack submitted 🎉 — compliance team reviews within 24 hours. You'll be pinged when Level 2 is granted.", "success", "Submitted for review");
  }, [kybDocs, recordActivity, toast]);

  /* ---------- directors ---------- */
  const addDirector = useCallback((d: Omit<Director, "id">) => {
    const id = "dir" + Date.now();
    setDirectors((prev) => [...prev, { ...d, id }]);
    recordActivity(`Director ${d.name} added (${d.role}, ${d.ownershipPct}%)`, "bi-person-plus");
    return id;
  }, [recordActivity]);

  const updateDirector = useCallback((id: string, patch: Partial<Director>) => {
    setDirectors((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const removeDirector = useCallback((id: string) => {
    const d = directors.find((x) => x.id === id);
    setDirectors((prev) => prev.filter((x) => x.id !== id));
    recordActivity(`Director ${d?.name ?? id} removed`, "bi-person-x");
    toast(`${d?.name ?? "Director"} removed — beneficial ownership recalculated.`, "info", "Director removed");
  }, [directors, recordActivity, toast]);

  /* ---------- tax ---------- */
  const toggleTaxRegistration = useCallback((id: string, patch: Partial<TaxReg>) => {
    setTaxRegistrations((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  /* ---------- presets ---------- */
  const applyPreset = useCallback((presetId: string) => {
    const preset = SECTOR_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setAppliedPresets((prev) => (prev.includes(presetId) ? prev : [...prev, presetId]));
    recordActivity(`Applied sector preset: ${preset.name}`, "bi-magic");
    toast(`${preset.emoji} ${preset.name} preset applied — ${preset.changes.length} settings updated. Undo any change from Bookkeeping.`, "success", "Preset applied");
  }, [recordActivity, toast]);

  /* ---------- portfolio ---------- */
  const addBusiness = useCallback((b: Omit<PortfolioBusiness, "id">) => {
    const id = "b" + Date.now();
    setPortfolio((prev) => [...prev, { ...b, id }]);
    recordActivity(`Business "${b.name}" added (${b.entityType})`, "bi-plus-circle");
    return id;
  }, [recordActivity]);

  const updateBusiness = useCallback((id: string, patch: Partial<PortfolioBusiness>) => {
    setPortfolio((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const deactivateBusiness = useCallback((id: string) => {
    setPortfolio((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Inactive" as EntityStatus } : b)));
    const b = portfolio.find((x) => x.id === id);
    recordActivity(`${b?.name ?? id} deactivated`, "bi-pause-circle");
    toast(`${b?.name ?? "Business"} deactivated — data retained, no new transactions accepted.`, "info", "Business deactivated");
  }, [portfolio, recordActivity, toast]);

  const reactivateBusiness = useCallback((id: string) => {
    setPortfolio((prev) => prev.map((b) => (b.id === id ? { ...b, status: "Active" as EntityStatus } : b)));
    const b = portfolio.find((x) => x.id === id);
    recordActivity(`${b?.name ?? id} reactivated`, "bi-play-circle");
    toast(`${b?.name ?? "Business"} reactivated — transactions can flow again.`, "success", "Business active");
  }, [portfolio, recordActivity, toast]);

  const deleteBusiness = useCallback((id: string) => {
    const b = portfolio.find((x) => x.id === id);
    setPortfolio((prev) => prev.filter((x) => x.id !== id));
    recordActivity(`${b?.name ?? id} permanently deleted`, "bi-trash");
    toast(`${b?.name ?? "Business"} deleted permanently. Any transaction history is retained per KRA rules.`, "warning", "Business deleted");
  }, [portfolio, recordActivity, toast]);

  const moveBusinessToFolder = useCallback((id: string, folderId: string) => {
    setPortfolio((prev) => prev.map((b) => (b.id === id ? { ...b, folder: folderId } : b)));
    const b = portfolio.find((x) => x.id === id);
    const f = folders.find((x) => x.id === folderId);
    recordActivity(`${b?.name ?? id} moved to ${f?.name ?? folderId}`, "bi-arrow-left-right");
  }, [portfolio, folders, recordActivity]);

  const addFolder = useCallback((name: string, emoji: string, color: string) => {
    const id = "fol" + Date.now();
    setFolders((prev) => [...prev, { id, name, emoji, color }]);
    recordActivity(`Folder "${name}" created`, "bi-folder-plus");
    return id;
  }, [recordActivity]);

  const markNotifsRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, unread: false }))), []);
  const dismissNotif = useCallback((id: number) => setNotifications((n) => n.filter((x) => x.id !== id)), []);

  const value = useMemo<Store>(() => ({
    business, setBusiness, currentBusinessId, setCurrentBusinessId, profile, directors, kybDocs,
    taxRegistrations, portfolio, folders, appliedPresets, notifications, activity, searchQuery,
    setSearchQuery, modal, openModal, closeModal, toasts, toast, dismissToast, recordActivity,
    updateProfile, verifyKraPin, uploadDoc, submitKybForReview, addDirector, updateDirector,
    removeDirector, toggleTaxRegistration, applyPreset, addBusiness, updateBusiness,
    deactivateBusiness, reactivateBusiness, deleteBusiness, moveBusinessToFolder, addFolder,
    markNotifsRead, dismissNotif,
  }), [business, currentBusinessId, profile, directors, kybDocs, taxRegistrations, portfolio, folders,
    appliedPresets, notifications, activity, searchQuery, modal, toasts, openModal, closeModal, toast,
    dismissToast, recordActivity, updateProfile, verifyKraPin, uploadDoc, submitKybForReview,
    addDirector, updateDirector, removeDirector, toggleTaxRegistration, applyPreset, addBusiness,
    updateBusiness, deactivateBusiness, reactivateBusiness, deleteBusiness, moveBusinessToFolder,
    addFolder, markNotifsRead, dismissNotif]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}

/* export types for wizard modules */
export type { EntityType, EntityStatus, ComplianceLevel, DocStatus };
