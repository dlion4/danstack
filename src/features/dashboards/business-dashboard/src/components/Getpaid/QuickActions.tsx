import {
  Zap, Plus, FileText, Link2, RefreshCw, Send, Download, ArrowUp,
  Link, Settings2,
} from "lucide-react";
import { cls, type QAction } from "../../lib";

/* Section 1.10 — persistent quick actions bar, wired to real modals across the page. */

export default function QuickActions({ emit, counts }: {
  emit: (q: QAction) => void;
  counts: { unmatched: number; suggested: number; overdue: number };
}) {
  const actions: { id: string; icon: React.ReactNode; label: string; badge?: number; q: QAction }[] = [
    { id: "receive", icon: <Zap size={15} />, label: "Receive Payment", q: { a: "receive" } },
    { id: "new", icon: <Plus size={15} />, label: "New Invoice", q: { a: "newInvoice" } },
    { id: "quick", icon: <FileText size={15} />, label: "Quick Invoice", q: { a: "quickInvoice" } },
    { id: "link", icon: <Link2 size={15} />, label: "Create Link", q: { a: "createLink" } },
    { id: "match", icon: <Link size={15} />, label: "Match Payments", badge: counts.unmatched + counts.suggested, q: { a: "matchTx", p: null } },
    { id: "sync", icon: <RefreshCw size={15} />, label: "Sync Now", q: { a: "sync" } },
    { id: "remind", icon: <Send size={15} />, label: "Run Reminders", badge: counts.overdue, q: { a: "reminders" } },
    { id: "report", icon: <Download size={15} />, label: "Export CSV", q: { a: "export" } },
    { id: "builder", icon: <Settings2 size={15} />, label: "Checkout Builder", q: { a: "builder" } },
  ];
  return (
    <div className="pm-quickbar">
      <div className="pm-quickbar-inner">
        <span className="pm-quickbar-title">Quick Actions</span>
        {actions.map((a) => (
          <button key={a.id} className="pm-quick-btn" onClick={() => emit(a.q)}>
            <span className="pm-quick-ic">{a.icon}</span>
            {a.label}
            {a.badge !== undefined && a.badge > 0 && <span className={cls("pm-quick-badge", a.id === "remind" && "pm-quick-badge-red")}>{a.badge}</span>}
          </button>
        ))}
        <button className="pm-quick-btn pm-quick-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} title="Back to top">
          <ArrowUp size={15} /> Top
        </button>
      </div>
    </div>
  );
}
