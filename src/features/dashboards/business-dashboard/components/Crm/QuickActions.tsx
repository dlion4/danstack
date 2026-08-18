import {
  Plus, MessageCircle, FileText, Megaphone, Users, Link2, Zap, Download, ArrowUp,
} from "lucide-react";
import { type QAction } from "../../lib";

/* Section 6.7 — persistent quick actions bar for Customers & CRM. */

export default function CrmQuickActions({ emit, counts }: {
  emit: (q: QAction) => void;
  counts: { unread: number; atRisk: number };
}) {
  const actions: { id: string; icon: React.ReactNode; label: string; badge?: number; q: QAction }[] = [
    { id: "new", icon: <Plus size={15} />, label: "Add Customer", q: { a: "newCustomer" } },
    { id: "msg", icon: <MessageCircle size={15} />, label: "Message", q: { a: "compose", p: "" } },
    { id: "inv", icon: <FileText size={15} />, label: "New Invoice", q: { a: "invoiceFor", p: "" } },
    { id: "camp", icon: <Megaphone size={15} />, label: "Broadcast", q: { a: "broadcast" } },
    { id: "seg", icon: <Users size={15} />, label: "Smart List", q: { a: "smartList" } },
    { id: "portal", icon: <Link2 size={15} />, label: "Portal Link", q: { a: "portalLink", p: "" } },
    { id: "nudge", icon: <Zap size={15} />, label: "New Nudge", q: { a: "newNudge" } },
    { id: "imp", icon: <Download size={15} />, label: "Import", q: { a: "importCustomers" } },
    { id: "inbox", icon: <MessageCircle size={15} />, label: "Inbox", badge: counts.unread, q: { a: "compose", p: "" } },
  ];
  return (
    <div className="pm-quickbar">
      <div className="pm-quickbar-inner">
        <span className="pm-quickbar-title">Quick Actions</span>
        {actions.map((a) => (
          <button key={a.id} className="pm-quick-btn" onClick={() => emit(a.q)}>
            <span className="pm-quick-ic">{a.icon}</span>
            {a.label}
            {a.badge !== undefined && a.badge > 0 && <span className="pm-quick-badge">{a.badge}</span>}
          </button>
        ))}
        <button className="pm-quick-btn pm-quick-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} title="Back to top">
          <ArrowUp size={15} /> Top
        </button>
      </div>
    </div>
  );
}
