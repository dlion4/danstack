import {
  Wand2, BookOpen, FileText, Receipt, BadgeCheck, CalendarClock, Archive, Download, ArrowUp, Calculator,
} from "lucide-react";
import { cls, type QAction } from "../../lib";

/* Section 4.10 — persistent quick actions bar for Bookkeeping & Taxes. */

export default function BooksQuickActions({ emit, counts }: {
  emit: (q: QAction) => void;
  counts: { uncategorized: number; etimsFailed: number; overdue: number };
}) {
  const actions: { id: string; icon: React.ReactNode; label: string; badge?: number; danger?: boolean; q: QAction }[] = [
    { id: "cat", icon: <Wand2 size={15} />, label: "Categorize", badge: counts.uncategorized, q: { a: "focusCategorize" } },
    { id: "je", icon: <BookOpen size={15} />, label: "New Journal", q: { a: "newJournal" } },
    { id: "rep", icon: <FileText size={15} />, label: "Reports", q: { a: "report", p: "pl" } },
    { id: "vat", icon: <Receipt size={15} />, label: "File VAT", q: { a: "fileVat" } },
    { id: "etims", icon: <BadgeCheck size={15} />, label: "eTIMS", badge: counts.etimsFailed, danger: true, q: { a: "focusEtims" } },
    { id: "tax", icon: <Calculator size={15} />, label: "Tax Calc", q: { a: "taxComputation" } },
    { id: "cal", icon: <CalendarClock size={15} />, label: "Calendar", badge: counts.overdue, danger: true, q: { a: "focusCalendar" } },
    { id: "close", icon: <Archive size={15} />, label: "Close Period", q: { a: "yearEnd" } },
    { id: "pack", icon: <Download size={15} />, label: "Report Pack", q: { a: "reportPack" } },
  ];
  return (
    <div className="pm-quickbar">
      <div className="pm-quickbar-inner">
        <span className="pm-quickbar-title">Quick Actions</span>
        {actions.map((a) => (
          <button key={a.id} className="pm-quick-btn" onClick={() => emit(a.q)}>
            <span className="pm-quick-ic pm-quick-ic-violet">{a.icon}</span>
            {a.label}
            {a.badge !== undefined && a.badge > 0 && <span className={cls("pm-quick-badge", a.danger && "pm-quick-badge-red")}>{a.badge}</span>}
          </button>
        ))}
        <button className="pm-quick-btn pm-quick-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} title="Back to top">
          <ArrowUp size={15} /> Top
        </button>
      </div>
    </div>
  );
}
