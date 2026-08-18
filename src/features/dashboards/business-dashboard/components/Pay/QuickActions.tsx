import {
  Zap, Plus, Upload, ShieldCheck, Users, CalendarClock, Globe, Download, ArrowUp, Wallet,
} from "lucide-react";
import { cls, type QAction } from "../../lib";

/* Section 2.10 — persistent quick actions bar for Pay Suppliers. */

export default function PayQuickActions({ emit, counts }: {
  emit: (q: QAction) => void;
  counts: { pending: number; scheduled: number };
}) {
  const actions: { id: string; icon: React.ReactNode; label: string; badge?: number; q: QAction }[] = [
    { id: "newBill", icon: <Plus size={15} />, label: "New Bill", q: { a: "newBill", p: undefined } },
    { id: "upload", icon: <Upload size={15} />, label: "Upload Bill", q: { a: "uploadBill" } },
    { id: "run", icon: <Wallet size={15} />, label: "Payment Run", q: { a: "payRun", p: null } },
    { id: "payroll", icon: <Users size={15} />, label: "Run Payroll", q: { a: "payroll" } },
    { id: "approve", icon: <ShieldCheck size={15} />, label: "Approve", badge: counts.pending, q: { a: "approveQueue" } },
    { id: "schedule", icon: <CalendarClock size={15} />, label: "Scheduled", badge: counts.scheduled, q: { a: "scheduleScroll" } },
    { id: "fx", icon: <Globe size={15} />, label: "FX Rates", q: { a: "fx" } },
    { id: "export", icon: <Download size={15} />, label: "Export", q: { a: "exportBills" } },
    { id: "pay", icon: <Zap size={15} />, label: "Pay Supplier", q: { a: "payRun", p: null } },
  ];
  return (
    <div className="pm-quickbar">
      <div className="pm-quickbar-inner">
        <span className="pm-quickbar-title">Quick Actions</span>
        {actions.map((a) => (
          <button key={a.id} className="pm-quick-btn" onClick={() => emit(a.q)}>
            <span className="pm-quick-ic">{a.icon}</span>
            {a.label}
            {a.badge !== undefined && a.badge > 0 && <span className={cls("pm-quick-badge", a.id === "approve" && "pm-quick-badge-red")}>{a.badge}</span>}
          </button>
        ))}
        <button className="pm-quick-btn pm-quick-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} title="Back to top">
          <ArrowUp size={15} /> Top
        </button>
      </div>
    </div>
  );
}
