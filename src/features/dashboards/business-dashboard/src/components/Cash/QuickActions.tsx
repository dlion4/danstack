import {
  Plus, ArrowLeftRight, Users, Globe, FileText, Zap, Download, Landmark, ArrowUp,
} from "lucide-react";
import { type QAction } from "../../lib";

/* Section 3.10 — persistent quick actions bar for Cash & Accounts. */

export default function CashQuickActions({ emit, counts }: {
  emit: (q: QAction) => void;
  counts: { unmatched: number };
}) {
  const actions: { id: string; icon: React.ReactNode; label: string; badge?: number; q: QAction }[] = [
    { id: "acc", icon: <Plus size={15} />, label: "New Account", q: { a: "newAccount" } },
    { id: "xfer", icon: <ArrowLeftRight size={15} />, label: "Transfer", q: { a: "transfer", p: null } },
    { id: "bulk", icon: <Users size={15} />, label: "Bulk Pay", q: { a: "bulk" } },
    { id: "fx", icon: <Globe size={15} />, label: "Convert FX", q: { a: "convert" } },
    { id: "rec", icon: <FileText size={15} />, label: "Reconcile", badge: counts.unmatched, q: { a: "reconcile" } },
    { id: "sweep", icon: <Zap size={15} />, label: "Sweep Now", q: { a: "sweepNow" } },
    { id: "export", icon: <Download size={15} />, label: "Export", q: { a: "exportLedger" } },
    { id: "stmt", icon: <Landmark size={15} />, label: "Statements", q: { a: "statementScroll" } },
  ];
  return (
    <div className="pm-quickbar">
      <div className="pm-quickbar-inner">
        <span className="pm-quickbar-title">Quick Actions</span>
        {actions.map((a) => (
          <button key={a.id} className="pm-quick-btn" onClick={() => emit(a.q)}>
            <span className="pm-quick-ic pm-quick-ic-cyan">{a.icon}</span>
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
