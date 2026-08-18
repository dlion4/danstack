import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ACTIVITY, CHARGEBACK_RISK, DISPUTES, EVIDENCE_VAULT,
  NOTIFICATIONS, SUPPORT_TICKETS, fmtKES,
} from "./data";
import type {
  Activity, ChargebackRisk, Dispute, DisputeStatus, EvidenceItem,
  Notification, Priority, SupportCategory, SupportTicket, TicketStatus,
} from "./data";

export type ToastType = "success" | "info" | "warning" | "danger";
export interface Toast { id: number; msg: string; type: ToastType; title?: string }
export interface ModalState { name: string; payload: Record<string, unknown> }

export interface Store {
  business: string;
  setBusiness: (b: string) => void;
  disputes: Dispute[];
  tickets: SupportTicket[];
  evidenceVault: EvidenceItem[];
  risk: ChargebackRisk;
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

  /* dispute actions */
  submitEvidence: (disputeId: string, docs: string[], notes: string) => void;
  acceptSettlement: (disputeId: string, refundAmount: number, reason: string) => void;
  requestArbitration: (disputeId: string, notes: string) => void;
  resolveDispute: (disputeId: string, status: "Won" | "Lost", notes: string) => void;
  fileDispute: (d: Omit<Dispute, "id" | "raisedDate" | "daysLeft" | "status" | "evidenceSubmitted" | "timeline">) => string;

  /* ticket actions */
  openTicket: (subject: string, category: SupportCategory, priority: Priority, text: string, attachment?: string) => string;
  replyTicket: (ticketId: string, text: string, attachment?: string) => void;
  escalateTicket: (ticketId: string) => void;
  closeTicket: (ticketId: string) => void;

  /* evidence vault actions */
  uploadEvidenceDoc: (e: Omit<EvidenceItem, "id" | "uploaded" | "verified">) => string;

  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
}

const Ctx = createContext<Store | null>(null);
let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState("TS Retail Ltd");
  const [disputes, setDisputes] = useState<Dispute[]>(DISPUTES);
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const [evidenceVault, setEvidenceVault] = useState<EvidenceItem[]>(EVIDENCE_VAULT);
  const [risk, setRisk] = useState<ChargebackRisk>(CHARGEBACK_RISK);
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

  /* ---------- dispute actions ---------- */
  const submitEvidence = useCallback((disputeId: string, docs: string[], notes: string) => {
    setDisputes((prev) => prev.map((d) => {
      if (d.id !== disputeId) return d;
      return {
        ...d,
        status: "Under Arbitration" as DisputeStatus,
        evidenceSubmitted: true,
        evidenceDocs: Array.from(new Set([...d.evidenceDocs, ...docs])),
        notes: notes ? `${d.notes}\nUpdate: ${notes}` : d.notes,
        timeline: [
          ...d.timeline,
          { time: "Just now", title: "Evidence submitted", note: `Uploaded ${docs.length} document(s) & defence notes.` },
        ],
      };
    }));
    recordActivity(`Evidence submitted for dispute ${disputeId}`, "bi-file-earmark-arrow-up-fill");
    toast(`Evidence pack submitted for ${disputeId}. Status updated to Under Arbitration.`, "success", "Defence Submitted");
  }, [recordActivity, toast]);

  const acceptSettlement = useCallback((disputeId: string, refundAmount: number, reason: string) => {
    setDisputes((prev) => prev.map((d) => {
      if (d.id !== disputeId) return d;
      return {
        ...d,
        status: "Lost" as DisputeStatus,
        notes: `Settlement accepted: KES ${refundAmount.toLocaleString()} refunded (${reason})`,
        timeline: [
          ...d.timeline,
          { time: "Just now", title: "Pre-dispute settlement accepted", note: `Refund of KES ${refundAmount.toLocaleString()} processed. Dispute closed.` },
        ],
      };
    }));
    recordActivity(`Settlement accepted for ${disputeId} (${fmtKES(refundAmount)})`, "bi-hand-thumbs-up");
    toast(`Settlement accepted for ${disputeId}. KES ${refundAmount.toLocaleString()} refunded to buyer, claim closed.`, "info", "Dispute Settled");
  }, [recordActivity, toast]);

  const requestArbitration = useCallback((disputeId: string, notes: string) => {
    setDisputes((prev) => prev.map((d) => {
      if (d.id !== disputeId) return d;
      return {
        ...d,
        status: "Under Arbitration" as DisputeStatus,
        timeline: [
          ...d.timeline,
          { time: "Just now", title: "Escalated to formal arbitration", note: notes || "Escalated to card scheme / CBK Ombudsman" },
        ],
      };
    }));
    recordActivity(`Dispute ${disputeId} escalated to formal arbitration`, "bi-bank2");
    toast(`Dispute ${disputeId} escalated to formal arbiter. Review timeline is 5 business days.`, "warning", "Arbitration Escalated");
  }, [recordActivity, toast]);

  const resolveDispute = useCallback((disputeId: string, status: "Won" | "Lost", notes: string) => {
    setDisputes((prev) => prev.map((d) => {
      if (d.id !== disputeId) return d;
      return {
        ...d,
        status: status as DisputeStatus,
        daysLeft: 0,
        timeline: [
          ...d.timeline,
          { time: "Just now", title: `Dispute ruled — ${status.toUpperCase()}`, note: notes || "Final ruling by arbiter" },
        ],
      };
    }));
    if (status === "Won") {
      setRisk((r) => ({ ...r, won30d: r.won30d + 1, atRiskAmount: Math.max(0, r.atRiskAmount - 14500) }));
    } else {
      setRisk((r) => ({ ...r, lost30d: r.lost30d + 1, atRiskAmount: Math.max(0, r.atRiskAmount - 14500) }));
    }
    recordActivity(`Dispute ${disputeId} closed as ${status}`, status === "Won" ? "bi-trophy" : "bi-x-circle");
    toast(`Dispute ${disputeId} resolved as ${status}. ${status === "Won" ? "Held funds released back to your main wallet." : "Held funds disbursed to buyer."}`, status === "Won" ? "success" : "danger", `Dispute ${status}`);
  }, [recordActivity, toast]);

  const fileDispute = useCallback((d: Omit<Dispute, "id" | "raisedDate" | "daysLeft" | "status" | "evidenceSubmitted" | "timeline">) => {
    const id = `DSP-2026-0${90 + Math.floor(Math.random() * 10)}`;
    const newDisp: Dispute = {
      ...d,
      id,
      raisedDate: "Just now",
      deadline: "In 3 days",
      daysLeft: 3,
      status: "Needs Evidence",
      evidenceSubmitted: false,
      timeline: [
        { time: "Just now", title: "Dispute opened", note: "Lodge via PayMo Dispute Resolution Center" },
      ],
    };
    setDisputes((prev) => [newDisp, ...prev]);
    recordActivity(`Dispute ${id} opened for ${d.txnId} (${fmtKES(d.amount)})`, "bi-shield-exclamation");
    toast(`Dispute ${id} opened. Upload evidence before deadline to defend funds.`, "warning", "Dispute Lodged");
    return id;
  }, [recordActivity, toast]);

  /* ---------- ticket actions ---------- */
  const openTicket = useCallback((subject: string, category: SupportCategory, priority: Priority, text: string, attachment?: string) => {
    const id = `TCK-${8820 + Math.floor(Math.random() * 50)}`;
    const newTicket: SupportTicket = {
      id,
      subject,
      category,
      priority,
      status: "Open" as TicketStatus,
      created: "Just now",
      lastUpdate: "Just now",
      agent: "Unassigned (Queue)",
      messages: [
        { sender: "Wanjiku Maina", text, time: "Just now", isAgent: false, attachment },
      ],
    };
    setTickets((prev) => [newTicket, ...prev]);
    recordActivity(`Support ticket ${id} opened: ${subject}`, "bi-headset");
    toast(`Support ticket ${id} submitted. Expected response within 2 hours.`, "success", "Ticket Created");
    return id;
  }, [recordActivity, toast]);

  const replyTicket = useCallback((ticketId: string, text: string, attachment?: string) => {
    setTickets((prev) => prev.map((t) => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        status: "In Progress" as TicketStatus,
        lastUpdate: "Just now",
        messages: [
          ...t.messages,
          { sender: "Wanjiku Maina", text, time: "Just now", isAgent: false, attachment },
        ],
      };
    }));
    recordActivity(`Replied to ticket ${ticketId}`, "bi-chat-left-text");
    toast(`Reply sent on ticket ${ticketId}.`, "info", "Reply Posted");
  }, [recordActivity, toast]);

  const escalateTicket = useCallback((ticketId: string) => {
    setTickets((prev) => prev.map((t) => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        priority: "Urgent" as Priority,
        status: "Escalated" as TicketStatus,
        agent: "KRA / CBK Senior Ombudsman Liaison",
        lastUpdate: "Just now",
        messages: [
          ...t.messages,
          { sender: "System", text: "Escalated to Senior Compliance Officer & Technical Liaison Desk.", time: "Just now", isAgent: true },
        ],
      };
    }));
    recordActivity(`Ticket ${ticketId} escalated to Senior Compliance`, "bi-fire");
    toast(`Ticket ${ticketId} escalated to Senior Manager Desk. Priority set to Urgent.`, "warning", "Ticket Escalated");
  }, [recordActivity, toast]);

  const closeTicket = useCallback((ticketId: string) => {
    setTickets((prev) => prev.map((t) => {
      if (t.id !== ticketId) return t;
      return { ...t, status: "Resolved" as TicketStatus, lastUpdate: "Just now" };
    }));
    recordActivity(`Ticket ${ticketId} marked resolved`, "bi-check-circle");
    toast(`Ticket ${ticketId} closed as resolved.`, "success", "Ticket Closed");
  }, [recordActivity, toast]);

  /* ---------- evidence vault ---------- */
  const uploadEvidenceDoc = useCallback((e: Omit<EvidenceItem, "id" | "uploaded" | "verified">) => {
    const id = `EV-0${evidenceVault.length + 1}`;
    const newDoc: EvidenceItem = {
      ...e,
      id,
      uploaded: "Just now",
      verified: true,
    };
    setEvidenceVault((prev) => [newDoc, ...prev]);
    recordActivity(`Uploaded evidence ${newDoc.title} (${newDoc.fileName})`, "bi-file-earmark-arrow-up");
    toast(`Evidence ${newDoc.title} added to vault & attached to ${e.disputeId}.`, "success", "Evidence Uploaded");
    return id;
  }, [evidenceVault.length, recordActivity, toast]);

  const markNotifsRead = useCallback(() => setNotifications((n) => n.map((x) => ({ ...x, unread: false }))), []);
  const dismissNotif = useCallback((id: number) => setNotifications((n) => n.filter((x) => x.id !== id)), []);

  const value = useMemo<Store>(() => ({
    business, setBusiness, disputes, tickets, evidenceVault, risk, notifications, activity, searchQuery,
    setSearchQuery, modal, openModal, closeModal, toasts, toast, dismissToast, recordActivity,
    submitEvidence, acceptSettlement, requestArbitration, resolveDispute, fileDispute,
    openTicket, replyTicket, escalateTicket, closeTicket, uploadEvidenceDoc, markNotifsRead, dismissNotif,
  }), [business, disputes, tickets, evidenceVault, risk, notifications, activity, searchQuery, modal,
    toasts, openModal, closeModal, toast, dismissToast, recordActivity, submitEvidence, acceptSettlement,
    requestArbitration, resolveDispute, fileDispute, openTicket, replyTicket, escalateTicket, closeTicket,
    uploadEvidenceDoc, markNotifsRead, dismissNotif]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
