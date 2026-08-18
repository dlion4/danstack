import React, { useEffect, useMemo, useState } from "react";
import {
  Plus, Search, SlidersHorizontal, MoreVertical, Eye, ShieldCheck,
  CalendarClock, CheckCircle2, Copy, FileText, Download, ArrowUpDown,
  Trash2, X, Upload, Paperclip, Package, Loader2, Wallet, AlertTriangle, Send,
} from "lucide-react";
import type { Bill, BillLine, BillStatus, Supplier } from "../../dataPay";
import { billCatalog } from "../../dataPay";
import { addDays, cls, downloadCSV, fmt, fmtDate, fmtDT, todayISO, uid, type QAction } from "../../lib";
import {
  Badge, Confirm, EmptyState, Field, Modal, PillTabs, Section, SlideOver, Stepper, Toggle,
} from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export const billStatusMeta: Record<BillStatus, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "muted" },
  pending: { label: "Pending Approval", tone: "warning" },
  approved: { label: "Approved", tone: "info" },
  scheduled: { label: "Scheduled", tone: "info" },
  paid: { label: "Paid", tone: "success" },
  overdue: { label: "Overdue", tone: "danger" },
};

export default function Bills({ bills, setBills, suppliers, notify, emit, qa, onConsume }: {
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  suppliers: Supplier[];
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ show: false, from: "", to: "", minAmt: "", maxAmt: "", supp: "" });
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "due", dir: 1 });
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardSupp, setWizardSupp] = useState<string | undefined>(undefined);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [detail, setDetail] = useState<Bill | null>(null);
  const [scheduleFor, setScheduleFor] = useState<Bill | null>(null);
  const [payFor, setPayFor] = useState<Bill | null>(null);
  const [confirmDel, setConfirmDel] = useState<string[] | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    if (!qa) return;
    switch (qa.a) {
      case "newBill": setWizardSupp(typeof qa.p === "string" ? qa.p : undefined); setWizardOpen(true); break;
      case "uploadBill": setUploadOpen(true); break;
      case "exportBills": setExportOpen(true); break;
      case "openBill": {
        const b = bills.find((x) => x.id === qa.p);
        if (b) setDetail(b);
        break;
      }
    }
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const suppOf = (id: string) => suppliers.find((s) => s.id === id);
  const nextNumber = () => {
    const maxN = bills.reduce((m, b) => { const n = parseInt(b.number.replace(/\D/g, ""), 10); return Number.isFinite(n) ? Math.max(m, n) : m; }, 0);
    return `BILL-${String(maxN + 1).padStart(4, "0")}`;
  };

  const filtered = useMemo(() => {
    let rows = bills;
    if (tab !== "all") rows = rows.filter((b) => b.status === tab);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      rows = rows.filter((b) => b.number.toLowerCase().includes(s) || (suppOf(b.supplierId)?.name.toLowerCase().includes(s) ?? false) || String(b.amount).includes(s));
    }
    if (filters.show) {
      if (filters.from) rows = rows.filter((b) => b.issue >= filters.from);
      if (filters.to) rows = rows.filter((b) => b.issue <= filters.to);
      if (filters.minAmt) rows = rows.filter((b) => b.amount >= Number(filters.minAmt));
      if (filters.maxAmt) rows = rows.filter((b) => b.amount <= Number(filters.maxAmt));
      if (filters.supp) rows = rows.filter((b) => b.supplierId === filters.supp);
    }
    const d = sort.dir;
    return [...rows].sort((a, b) => {
      switch (sort.key) {
        case "number": return a.number.localeCompare(b.number) * d;
        case "supplier": return (suppOf(a.supplierId)?.name ?? "").localeCompare(suppOf(b.supplierId)?.name ?? "") * d;
        case "amount": return (a.amount - b.amount) * d;
        case "issue": return a.issue.localeCompare(b.issue) * d;
        case "due": return a.due.localeCompare(b.due) * d;
        default: return 0;
      }
    });
  }, [bills, tab, q, filters, sort, suppliers]);

  const monthOut = bills.filter((b) => b.issue.slice(0, 7) === todayISO().slice(0, 7)).reduce((s, b) => s + b.amount, 0);
  const paid = bills.filter((b) => b.status === "paid").reduce((s, b) => s + b.paid, 0);
  const upcoming = bills.filter((b) => ["approved", "scheduled", "pending"].includes(b.status)).reduce((s, b) => s + b.amount, 0);
  const overdue = bills.filter((b) => b.status === "overdue").reduce((s, b) => s + (b.amount - b.paid), 0);
  const counts = (s: string) => bills.filter((b) => (s === "all" ? true : b.status === s)).length;

  const appendActivity = (id: string, text: string, kind: Bill["activity"][number]["kind"]) =>
    setBills((bs) => bs.map((b) => (b.id === id ? { ...b, activity: [...b.activity, { t: new Date().toISOString(), text, kind }] } : b)));

  const approveBill = (b: Bill) => {
    setBills((bs) => bs.map((x) => (x.id === b.id ? { ...x, status: "approved", approval: undefined, activity: [...x.activity, { t: new Date().toISOString(), text: "Approved by Wanjiru Kariuki", kind: "approved" }] } : x)));
    notify({ tone: "success", title: `${b.number} approved`, body: `${fmt(b.amount)} released for payment scheduling.` });
  };

  const deleteDrafts = (ids: string[]) => {
    setBills((bs) => bs.filter((b) => !(ids.includes(b.id) && b.status === "draft")));
    notify({ tone: "danger", title: `${ids.length} draft(s) deleted` });
    setSel(new Set());
  };

  const exportRows = (rows: Bill[]) => {
    downloadCSV(`paymo-bills-${todayISO()}.csv`,
      [["Bill #", "Supplier", "Amount", "Status", "Issue", "Due", "Paid", "eTIMS"], ...rows.map((b) => [b.number, suppOf(b.supplierId)?.name ?? "", b.amount, billStatusMeta[b.status].label, b.issue, b.due, b.paid, b.etims])]);
    notify({ tone: "success", title: "CSV downloaded", body: `${rows.length} bills exported.` });
  };

  const toggleSel = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSel = filtered.length > 0 && filtered.every((b) => sel.has(b.id));

  return (
    <>
      <Section
        no="2.2" sub="Money Out · Payables" id="sec-bills"
        title="Bills & Payables Center"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setUploadOpen(true)}><Upload size={16} /> Upload Bill</button>
            <button className="btn pm-btn-out" onClick={() => { setWizardSupp(undefined); setWizardOpen(true); }}><Plus size={16} /> New Bill</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <MiniStat label="Bills captured (MTD)" value={fmt(monthOut)} trend="▲ 5.1% vs last month" tone="up" />
          <MiniStat label="Paid out (all time)" value={fmt(paid)} trend="▲ 9.8%" tone="up" />
          <MiniStat label="Upcoming payables" value={fmt(upcoming)} trend={`${bills.filter((b) => ["approved", "scheduled", "pending"].includes(b.status)).length} bills`} tone="flat" />
          <MiniStat label="Overdue" value={fmt(overdue)} trend="▲ 2 bills need attention" tone="bad" />
        </div>

        <div className="pm-card">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between px-3 pt-3">
            <PillTabs
              tabs={[
                { id: "all", label: "All", count: counts("all") },
                { id: "draft", label: "Draft", count: counts("draft") },
                { id: "pending", label: "Pending Approval", count: counts("pending"), tone: "warning" },
                { id: "approved", label: "Approved", count: counts("approved") },
                { id: "scheduled", label: "Scheduled", count: counts("scheduled") },
                { id: "paid", label: "Paid", count: counts("paid") },
                { id: "overdue", label: "Overdue", count: counts("overdue"), tone: "danger" },
              ]}
              active={tab}
              onChange={setTab}
            />
            <div className="d-flex gap-2">
              <div className="pm-search">
                <Search size={15} />
                <input placeholder="Search bill, supplier, amount…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <button className={cls("btn", filters.show ? "pm-btn-primary" : "pm-btn-soft")} onClick={() => setFilters((f) => ({ ...f, show: !f.show }))}>
                <SlidersHorizontal size={15} /> Filters
              </button>
            </div>
          </div>

          {filters.show && (
            <div className="pm-filters">
              <div className="row g-2">
                <FilterCol label="From"><input type="date" className="form-control form-control-sm pm-input" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></FilterCol>
                <FilterCol label="To"><input type="date" className="form-control form-control-sm pm-input" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></FilterCol>
                <FilterCol label="Min amount"><input type="number" placeholder="KES" className="form-control form-control-sm pm-input" value={filters.minAmt} onChange={(e) => setFilters({ ...filters, minAmt: e.target.value })} /></FilterCol>
                <FilterCol label="Max amount"><input type="number" placeholder="KES" className="form-control form-control-sm pm-input" value={filters.maxAmt} onChange={(e) => setFilters({ ...filters, maxAmt: e.target.value })} /></FilterCol>
                <FilterCol label="Supplier">
                  <select className="form-select form-select-sm pm-input" value={filters.supp} onChange={(e) => setFilters({ ...filters, supp: e.target.value })}>
                    <option value="">All suppliers</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </FilterCol>
                <FilterCol label="eTIMS">
                  <select className="form-select form-select-sm pm-input" onChange={() => {}}><option>Any</option><option>Verified</option><option>Ready</option><option>Missing</option></select>
                </FilterCol>
              </div>
              <div className="d-flex gap-2 mt-2 justify-content-end">
                <button className="btn btn-sm pm-btn-ghost" onClick={() => setFilters({ show: true, from: "", to: "", minAmt: "", maxAmt: "", supp: "" })}>Clear</button>
                <button className="btn btn-sm pm-btn-primary" onClick={() => { setFilters({ ...filters, show: false }); notify({ tone: "info", title: "Filters applied", body: `${filtered.length} bill(s) match.` }); }}>Apply filters</button>
              </div>
            </div>
          )}

          {sel.size > 0 && (
            <div className="pm-bulkbar">
              <span className="pm-bulk-count">{sel.size} selected</span>
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-sm pm-btn-soft" onClick={() => emit({ a: "payRun", p: [...sel] })}><CalendarClock size={13} /> Include in payment run</button>
                <button className="btn btn-sm pm-btn-soft" onClick={() => exportRows(bills.filter((b) => sel.has(b.id)))}><Download size={13} /> Export CSV</button>
                <button className="btn btn-sm pm-btn-danger-soft" onClick={() => setConfirmDel([...sel])}><Trash2 size={13} /> Delete drafts</button>
              </div>
              <button className="btn btn-sm pm-btn-ghost" onClick={() => setSel(new Set())}><X size={13} /></button>
            </div>
          )}

          <div className="table-responsive">
            <table className="table pm-table align-middle mb-0">
              <thead>
                <tr>
                  <th className="pm-th-check"><input type="checkbox" checked={allSel} onChange={() => setSel(allSel ? new Set() : new Set(filtered.map((b) => b.id)))} /></th>
                  <Th label="Bill #" k="number" sort={sort} setSort={setSort} />
                  <Th label="Supplier" k="supplier" sort={sort} setSort={setSort} />
                  <Th label="Amount" k="amount" sort={sort} setSort={setSort} right />
                  <th>Status</th>
                  <Th label="Due" k="due" sort={sort} setSort={setSort} />
                  <th>eTIMS</th>
                  <th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8}><EmptyState icon={<FileText size={26} />} title="No bills found" body="Adjust filters or capture a new bill." action={<button className="btn pm-btn-out btn-sm" onClick={() => { setWizardSupp(undefined); setWizardOpen(true); }}><Plus size={14} /> New Bill</button>} /></td></tr>
                )}
                {filtered.map((b) => {
                  const s = suppOf(b.supplierId);
                  return (
                    <tr key={b.id} className={cls(sel.has(b.id) && "pm-row-sel")}>
                      <td className="pm-th-check"><input type="checkbox" checked={sel.has(b.id)} onChange={() => toggleSel(b.id)} /></td>
                      <td><button className="pm-num-link" onClick={() => setDetail(b)}>{b.number}</button></td>
                      <td>
                        <div className="fw-semibold pm-fs-13">{s?.name}</div>
                        <div className="pm-muted pm-fs-11">{s?.category}</div>
                      </td>
                      <td className="text-end fw-bold pm-fs-13">{fmt(b.amount)}</td>
                      <td><Badge tone={billStatusMeta[b.status].tone} dot={["pending", "overdue", "scheduled"].includes(b.status)}>{billStatusMeta[b.status].label}</Badge></td>
                      <td className="pm-fs-13">
                        {b.etims === "verified" ? <Badge tone="success">✓ verified</Badge> : b.etims === "ready" ? <Badge tone="info">ready</Badge> : <Badge tone="danger">missing</Badge>}
                      </td>
                      <td className="text-end">
                        <div className="pm-menu-wrap">
                          <button className="pm-icon-btn" onClick={() => setMenuFor(menuFor === b.id ? null : b.id)}><MoreVertical size={15} /></button>
                          {menuFor === b.id && (
                            <>
                              <div className="pm-menu-backdrop" onClick={() => setMenuFor(null)} />
                              <div className="pm-menu">
                                <button onClick={() => { setDetail(b); setMenuFor(null); }}><Eye size={14} /> View details</button>
                                {b.status === "pending" && <button onClick={() => { approveBill(b); setMenuFor(null); }}><ShieldCheck size={14} /> Approve now</button>}
                                {["approved", "overdue"].includes(b.status) && <button onClick={() => { setScheduleFor(b); setMenuFor(null); }}><CalendarClock size={14} /> Schedule payment</button>}
                                {!["paid", "scheduled"].includes(b.status) && <button onClick={() => { setPayFor(b); setMenuFor(null); }}><Wallet size={14} /> Mark as paid</button>}
                                <button onClick={() => { setMenuFor(null); notify({ tone: "info", title: `${b.number} duplicated`, body: "A copy was saved as a draft with a fresh number." }); }}><Copy size={14} /> Duplicate</button>
                                {b.status === "draft" && <button className="pm-menu-danger" onClick={() => { setConfirmDel([b.id]); setMenuFor(null); }}><Trash2 size={14} /> Delete draft</button>}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pm-table-foot">
            <span className="pm-muted pm-fs-12">Showing {filtered.length} of {bills.length} bills · WHT auto-deducted on all supplier bills</span>
            <button className="pm-link-btn pm-fs-12" onClick={() => emit({ a: "payRun", p: null })}>Build a payment run →</button>
          </div>
        </div>
      </Section>

      {/* ══════════ BILL WIZARD (2.3) ══════════ */}
      <BillWizard
        open={wizardOpen} onClose={() => setWizardOpen(false)} suppliers={suppliers} notify={notify}
        presetSupplier={wizardSupp} nextNumber={nextNumber()}
        onCreated={(bill, action) => {
          setBills((bs) => [bill, ...bs]);
          if (action === "submit") notify({ tone: "success", title: "Bill submitted", body: `${bill.number} ${bill.status === "pending" ? "sent for approval" : "approved & ready to schedule"}.` });
          else notify({ tone: "info", title: "Draft saved", body: `${bill.number} is in your Draft tab.` });
        }}
      />

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} suppliers={suppliers} notify={notify}
        onSaveDraft={(b) => { setBills((bs) => [b, ...bs]); }} />

      <BillDetail
        b={detail} onClose={() => setDetail(null)} supplier={detail ? suppOf(detail.supplierId) : undefined} notify={notify}
        onApprove={(x) => { setDetail(null); approveBill(x); }}
        onSchedule={(x) => { setDetail(null); setScheduleFor(x); }}
        onPay={(x) => { setDetail(null); setPayFor(x); }}
      />

      <ScheduleModal b={scheduleFor} onClose={() => setScheduleFor(null)} notify={notify} appendActivity={appendActivity} />
      <PayModal b={payFor} onClose={() => setPayFor(null)} notify={notify} setBills={setBills} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} bills={filtered} exportRows={exportRows} notify={notify} />
      <Confirm open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={() => confirmDel && deleteDrafts(confirmDel)}
        title="Delete drafts" confirmLabel="Delete" tone="danger"
        body={<span>Permanently delete {confirmDel?.length ?? 0} draft bill(s)?</span>} icon={<Trash2 size={18} />} />
    </>
  );
}

/* ── helpers ── */

function MiniStat({ label, value, trend, tone }: { label: string; value: string; trend: string; tone: "up" | "down" | "bad" | "flat" }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="pm-mini">
        <div className="pm-mini-label">{label}</div>
        <div className="pm-mini-value">{value}</div>
        <div className={cls("pm-mini-trend", tone === "bad" ? "t-danger" : tone === "up" ? "t-success" : tone === "down" ? "t-warning" : "pm-muted")}>{trend}</div>
      </div>
    </div>
  );
}

function FilterCol({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="col-6 col-md-4 col-xl-2"><label className="pm-flabel pm-fs-11">{label}</label>{children}</div>;
}

function Th({ label, k, sort, setSort, right }: { label: string; k: string; sort: { key: string; dir: 1 | -1 }; setSort: (s: { key: string; dir: 1 | -1 }) => void; right?: boolean }) {
  const active = sort.key === k;
  return (
    <th className={cls("pm-th-sort", right && "text-end")} onClick={() => setSort({ key: k, dir: active ? ((sort.dir * -1) as 1 | -1) : 1 })}>
      {label} <ArrowUpDown size={11} className={cls(active && "t-primary")} />
    </th>
  );
}

/* ═══════════════════════ Bill Wizard (2.3) ═══════════════════════ */

function BillWizard({ open, onClose, suppliers, notify, presetSupplier, nextNumber, onCreated }: {
  open: boolean; onClose: () => void; suppliers: Supplier[]; notify: Notify;
  presetSupplier?: string; nextNumber: string;
  onCreated: (bill: Bill, action: "submit" | "draft") => void;
}) {
  const [step, setStep] = useState(1);
  const [supp, setSupp] = useState<Supplier | null>(null);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [q, setQ] = useState("");
  const [ns, setNs] = useState({ name: "", phone: "", email: "", pin: "" });
  const [lines, setLines] = useState<BillLine[]>([{ desc: "", qty: 1, unit: "pcs", price: 0, tax: 16, wht: 2, disc: 0 }]);
  const [pickOpen, setPickOpen] = useState(false);
  const [details, setDetails] = useState({
    issue: todayISO(), due: addDays(todayISO(), 30), po: "", notes: "",
    approval: true, urgency: "medium" as "low" | "medium" | "high", requester: "Mary Kamau",
  });
  const [attachments, setAttachments] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setLines([{ desc: "", qty: 1, unit: "pcs", price: 0, tax: 16, wht: 2, disc: 0 }]);
    setDetails({ issue: todayISO(), due: addDays(todayISO(), 30), po: "", notes: "", approval: true, urgency: "medium", requester: "Mary Kamau" });
    setAttachments([]);
    setMode("existing");
    setQ("");
    if (presetSupplier) {
      const s = suppliers.find((x) => x.id === presetSupplier);
      if (s) setSupp(s);
    } else setSupp(null);
  }, [open, presetSupplier, suppliers]);

  const close = () => onClose();

  const subtotal = lines.reduce((s, l) => s + l.qty * l.price - l.disc, 0);
  const vat = lines.reduce((s, l) => s + Math.max(0, l.qty * l.price - l.disc) * (l.tax / 100), 0);
  const wht = lines.reduce((s, l) => s + Math.max(0, l.qty * l.price - l.disc) * (l.wht / 100), 0);
  const total = Math.round(subtotal + vat - wht);
  const setLine = (i: number, p: Partial<BillLine>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...p } : l)));
  const effSupp: Supplier | null = mode === "new" && ns.name
    ? { id: "s-new", name: ns.name, category: "New supplier", phone: ns.phone, email: ns.email, pin: ns.pin || "PENDING", contact: ns.name, terms: "Net 30", bank: "—", account: "—", wtType: "Goods · WHT 2%", rating: 0, owed: 0, ytd: 0, status: "active", note: "" }
    : supp;
  const valid1 = !!effSupp;
  const valid2 = lines.some((l) => l.desc.trim() && l.qty > 0 && l.price > 0);

  const submit = (action: "submit" | "draft") => {
    if (!effSupp) return;
    const bill: Bill = {
      id: uid("b"), number: nextNumber, supplierId: effSupp.id, issue: details.issue, due: details.due,
      amount: total, paid: 0, status: action === "draft" ? "draft" : details.approval ? "pending" : "approved",
      lines: lines.filter((l) => l.desc.trim()), po: details.po || undefined, notes: details.notes, attachments,
      activity: [
        { t: new Date().toISOString(), text: details.po ? `Bill captured from ${details.po}` : "Bill created", kind: "created" },
        ...(action === "submit" && details.approval ? [{ t: new Date().toISOString(), text: `Submitted for approval (${details.requester} → Wanjiru Kariuki)`, kind: "submitted" as const }] : []),
      ],
      payments: [], etims: "ready",
      approval: action === "submit" && details.approval
        ? { requester: details.requester, submitted: new Date().toISOString(), chain: [details.requester, "Wanjiru Kariuki"], step: 0, urgency: details.urgency }
        : undefined,
    };
    onCreated(bill, action);
    close();
  };

  return (
    <Modal open={open} onClose={close} kicker="New Bill · Section 2.3" title="Bill Capture Wizard" size="xl"
      footer={
        <>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 4 && <button className="btn pm-btn-primary" disabled={step === 1 ? !valid1 : step === 2 ? !valid2 : false} onClick={() => setStep(step + 1)}>Continue →</button>}
          {step === 4 && (
            <>
              <button className="btn pm-btn-soft" onClick={() => submit("draft")}><FileText size={15} /> Save as Draft</button>
              <button className="btn pm-btn-out" onClick={() => submit("submit")}><Send size={15} /> Save & {details.approval ? "Submit for Approval" : "Approve"}</button>
            </>
          )}
        </>
      }
    >
      <Stepper steps={4} current={step} labels={["Supplier", "Line Items", "Details & WHT", "Review"]} />

      {step === 1 && (
        <div className="pm-wizard-body">
          <div className="pm-mode-tabs mb-3">
            <button className={cls("pm-mode-tab", mode === "existing" && "pm-mode-on")} onClick={() => setMode("existing")}>Existing supplier</button>
            <button className={cls("pm-mode-tab", mode === "new" && "pm-mode-on")} onClick={() => setMode("new")}>New supplier</button>
          </div>
          {mode === "existing" ? (
            <>
              <div className="pm-search pm-search-lg mb-2">
                <Search size={15} />
                <input autoFocus placeholder="Search supplier, category or KRA PIN…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div className="pm-cust-list">
                {suppliers.filter((s) => !q || (s.name + s.category + s.pin).toLowerCase().includes(q.toLowerCase())).map((s) => (
                  <button key={s.id} className={cls("pm-cust-row", supp?.id === s.id && "pm-cust-on")} onClick={() => setSupp(s)}>
                    <span className="pm-sup-ic pm-sup-ic-sm"><Package size={15} /></span>
                    <div className="flex-grow-1 text-start">
                      <div className="fw-semibold pm-fs-13">{s.name} <span className="pm-muted pm-fs-11">· {s.terms}</span></div>
                      <div className="pm-muted pm-fs-11">{s.category} · {s.wtType}</div>
                    </div>
                    {s.owed > 0 && <Badge tone="warning">{fmt(s.owed)} owed</Badge>}
                    {supp?.id === s.id && <CheckCircle2 size={17} className="t-primary" />}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="row g-3">
              <div className="col-md-6"><Field label="Supplier name" req><input className="form-control pm-input" value={ns.name} onChange={(e) => setNs({ ...ns, name: e.target.value })} /></Field></div>
              <div className="col-md-6"><Field label="Phone" req><input className="form-control pm-input" value={ns.phone} onChange={(e) => setNs({ ...ns, phone: e.target.value })} /></Field></div>
              <div className="col-md-6"><Field label="Email"><input className="form-control pm-input" value={ns.email} onChange={(e) => setNs({ ...ns, email: e.target.value })} /></Field></div>
              <div className="col-md-6"><Field label="KRA PIN"><input className="form-control pm-input" value={ns.pin} onChange={(e) => setNs({ ...ns, pin: e.target.value })} /></Field></div>
              <div className="col-12"><div className="pm-cyan-note">A full supplier profile is created in the Directory on save.</div></div>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="pm-wizard-body">
          <div className="d-flex gap-2 mb-2 flex-wrap">
            <button className="btn pm-btn-soft btn-sm" onClick={() => setPickOpen(true)}><Package size={14} /> Pick from catalog</button>
            <button className="btn pm-btn-ghost btn-sm" onClick={() => setLines((ls) => [...ls, { desc: "", qty: 1, unit: "pcs", price: 0, tax: 16, wht: 2, disc: 0 }])}><Plus size={14} /> Add line</button>
          </div>
          <div className="pm-lines">
            <div className="pm-lines-head">
              <span>Description</span><span>Qty</span><span>Unit</span><span>Price</span><span>VAT</span><span>WHT</span><span />
            </div>
            {lines.map((l, i) => (
              <div className="pm-line-row" key={i}>
                <input className="form-control form-control-sm pm-input" placeholder="What are you being charged for?" value={l.desc} onChange={(e) => setLine(i, { desc: e.target.value })} />
                <input className="form-control form-control-sm pm-input pm-w-70" type="number" min={1} value={l.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} />
                <select className="form-select form-select-sm pm-input pm-w-80" value={l.unit} onChange={(e) => setLine(i, { unit: e.target.value })}>{["pcs", "kg", "L", "hours", "days", "mo"].map((u) => <option key={u}>{u}</option>)}</select>
                <input className="form-control form-control-sm pm-input pm-w-110" type="number" min={0} value={l.price} onChange={(e) => setLine(i, { price: Number(e.target.value) })} />
                <select className="form-select form-select-sm pm-input pm-w-90" value={l.tax} onChange={(e) => setLine(i, { tax: Number(e.target.value) })}><option value={16}>16%</option><option value={0}>Exempt</option><option value={8}>8%</option></select>
                <select className="form-select form-select-sm pm-input pm-w-90" value={l.wht} onChange={(e) => setLine(i, { wht: Number(e.target.value) })}><option value={0}>None</option><option value={2}>2%</option><option value={3}>3%</option><option value={5}>5%</option><option value={10}>10%</option></select>
                <button className="pm-icon-btn pm-icon-danger" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} disabled={lines.length === 1}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
          <div className="pm-total-panel">
            <div className="pm-total-title">Live totals — money out</div>
            <div className="pm-total-row"><span>Subtotal</span><b>{fmt(subtotal)}</b></div>
            <div className="pm-total-row"><span>VAT (16%)</span><b>{fmt(vat)}</b></div>
            <div className="pm-total-row"><span>WHT deducted (remitted to KRA)</span><b className="t-danger">− {fmt(wht)}</b></div>
            <div className="pm-total-row pm-total-grand"><span>Total payable to supplier</span><b>{fmt(total)}</b></div>
            <div className="pm-total-note">You keep the WHT: pay KES {fmtN(total)} to the supplier, remit {fmt(wht)} to KRA by the 20th.</div>
          </div>
          {!valid2 && <div className="pm-warn-chip mt-2"><AlertTriangle size={13} /> Add at least one line with a description and a price.</div>}

          <Modal open={pickOpen} onClose={() => setPickOpen(false)} title="Pick from bill catalog" subtitle="Recent goods & services your business buys." footer={<button className="btn pm-btn-ghost" onClick={() => setPickOpen(false)}>Close</button>}>
            <div className="pm-prod-list">
              {billCatalog.map((p) => (
                <button key={p.id} className="pm-prod-row" onClick={() => { setLines((ls) => [...ls, { desc: p.name, qty: 1, unit: p.unit, price: p.price, tax: p.tax, wht: p.wht, disc: 0 }]); setPickOpen(false); notify({ tone: "info", title: "Line added", body: `${p.name} → ${fmt(p.price)}` }); }}>
                  <span className="pm-chan-ic pm-chan-ic-links"><Package size={15} /></span>
                  <div className="flex-grow-1 text-start">
                    <div className="fw-semibold pm-fs-13">{p.name}</div>
                    <div className="pm-muted pm-fs-11">VAT {p.tax}% · WHT {p.wht}% · per {p.unit}</div>
                  </div>
                  <b className="pm-fs-13">{fmt(p.price)}</b>
                </button>
              ))}
            </div>
          </Modal>
        </div>
      )}

      {step === 3 && (
        <div className="pm-wizard-body">
          <div className="row g-3">
            <div className="col-md-6"><Field label="Bill date"><input type="date" className="form-control pm-input" value={details.issue} onChange={(e) => setDetails({ ...details, issue: e.target.value })} /></Field></div>
            <div className="col-md-6"><Field label="Due date"><input type="date" className="form-control pm-input" value={details.due} onChange={(e) => setDetails({ ...details, due: e.target.value })} /></Field></div>
            <div className="col-md-6"><Field label="Purchase order" hint="Links to a PO in Pay Suppliers."><input className="form-control pm-input" placeholder="PO-0203" value={details.po} onChange={(e) => setDetails({ ...details, po: e.target.value })} /></Field></div>
            <div className="col-md-6"><Field label="Attachments">
              <button className="pm-upload" onClick={() => setAttachments((a) => [...a, `invoice-${a.length + 1}.pdf`])}>
                <Paperclip size={15} /> {attachments.length ? `${attachments.length} file(s) attached` : "Add invoice / delivery note"}
              </button>
            </Field></div>
            <div className="col-12"><Field label="Notes"><textarea className="form-control pm-input" rows={2} value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} /></Field></div>
            <div className="col-12">
              <div className={cls("pm-recur-box", details.approval && "pm-recur-on")}>
                <Toggle on={details.approval} onChange={(v) => setDetails({ ...details, approval: v })} label="Send for approval after capture" />
                {details.approval && (
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    <select className="form-select form-select-sm pm-input pm-w-150" value={details.requester} onChange={(e) => setDetails({ ...details, requester: e.target.value })}>
                      <option>Mary Kamau</option><option>Daniel Otieno</option><option>Faith W.</option>
                    </select>
                    <select className="form-select form-select-sm pm-input pm-w-120" value={details.urgency} onChange={(e) => setDetails({ ...details, urgency: e.target.value as "low" | "medium" | "high" })}>
                      <option value="low">Low urgency</option><option value="medium">Medium</option><option value="high">High — due soon</option>
                    </select>
                    <span className="pm-muted pm-fs-12 align-self-center">Approval chain: requester → Wanjiru Kariuki (owner)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="pm-review-grid">
          <div>
            <div className="pm-preview-label">Payment advice preview</div>
            <div className="pm-paper">
              <div className="pm-paper-head" style={{ background: "linear-gradient(120deg, #7f1028, #e11d48)" }}>
                <div style={{ color: "#fff" }}>
                  <div className="pm-paper-logo">PAYMENT ADVICE</div>
                  <div className="pm-paper-sub">TechSol Ltd → {effSupp?.name}</div>
                </div>
                <div className="text-end" style={{ color: "#fff" }}>
                  <div className="pm-paper-inv">BILL</div>
                  <div className="pm-paper-num">{nextNumber}</div>
                </div>
              </div>
              <div className="pm-paper-meta">
                <div>
                  <div className="pm-paper-mlabel">PAY TO</div>
                  <b>{effSupp?.name}</b>
                  <div>{effSupp?.bank} {effSupp?.account} · {effSupp?.phone}</div>
                  <div>KRA PIN {effSupp?.pin}</div>
                </div>
                <div className="text-end">
                  <div className="pm-paper-mlabel">DETAILS</div>
                  <div>Issued: <b>{fmtDate(details.issue)}</b></div>
                  <div>Due: <b>{fmtDate(details.due)}</b></div>
                  {details.po && <div>PO: {details.po}</div>}
                </div>
              </div>
              <table className="pm-paper-table">
                <thead><tr><th>Description</th><th className="t-r">Qty</th><th className="t-r">Unit</th><th className="t-r">Amount</th></tr></thead>
                <tbody>
                  {lines.filter((l) => l.desc.trim()).map((l, i) => (
                    <tr key={i}><td>{l.desc}</td><td className="t-r">{l.qty}</td><td className="t-r">{fmt(l.price)}</td><td className="t-r">{fmt(l.qty * l.price)}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="pm-paper-totals">
                <div><span>Subtotal</span><b>{fmt(subtotal)}</b></div>
                <div><span>VAT</span><b>{fmt(vat)}</b></div>
                <div><span>WHT (remitted to KRA)</span><b>− {fmt(wht)}</b></div>
                <div className="pm-paper-grand"><span>Payable to supplier</span><b>{fmt(total)}</b></div>
              </div>
              <div className="pm-paper-foot">WHT certificate will be issued on payment · eTIMS receipt verified automatically</div>
            </div>
          </div>
          <div className="pm-review-side">
            <div className="pm-summary-card">
              <div className="pm-summary-row"><span>Supplier</span><b>{effSupp?.name}</b></div>
              <div className="pm-summary-row"><span>Subtotal</span><b>{fmt(subtotal)}</b></div>
              <div className="pm-summary-row"><span>VAT</span><b>{fmt(vat)}</b></div>
              <div className="pm-summary-row"><span>WHT to KRA</span><b className="t-danger">{fmt(wht)}</b></div>
              <div className="pm-summary-row"><span>Total payable</span><b>{fmt(total)}</b></div>
              <div className="pm-summary-row"><span>Approval</span><b>{details.approval ? `Yes — ${details.requester} → Wanjiru K.` : "No — auto-approved"}</b></div>
            </div>
            <div className="pm-cyan-note">💡 eTIMS: on submission the supplier's receipt is fetched and verified against iTax before any payment is scheduled.</div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function fmtN(n: number) { return Math.round(n).toLocaleString("en-KE"); }

/* ═══════════════════════ Upload + OCR ═══════════════════════ */

function UploadModal({ open, onClose, suppliers, notify, onSaveDraft }: {
  open: boolean; onClose: () => void; suppliers: Supplier[]; notify: Notify;
  onSaveDraft: (b: Bill) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [ocr, setOcr] = useState<"idle" | "reading" | "done">("idle");
  const [supp, setSupp] = useState("s7");
  const [amount, setAmount] = useState("12,300");
  useEffect(() => { if (open) { setFileName(null); setOcr("idle"); setSupp("s7"); setAmount("12,300"); } }, [open]);
  const extract = () => {
    if (!fileName) { notify({ tone: "warning", title: "Attach a file first", body: "Drop or choose a PDF / image of the bill." }); return; }
    setOcr("reading");
    window.setTimeout(() => { setOcr("done"); notify({ tone: "info", title: "OCR extraction complete", body: "Supplier, amount and date read from the document." }); }, 1600);
  };
  const saveDraft = () => {
    const b: Bill = {
      id: uid("b"), number: `BILL-${String(45 + Math.floor(Math.random() * 9)).padStart(4, "0")}`, supplierId: supp,
      issue: todayISO(), due: addDays(todayISO(), 15), amount: 12300, paid: 0, status: "draft",
      lines: [{ desc: "Auto-extracted from upload — review before submitting", qty: 1, unit: "pcs", price: 12300, tax: 16, wht: 2, disc: 0 }],
      notes: "Captured via OCR upload.", attachments: [fileName ?? "upload.pdf"],
      activity: [{ t: new Date().toISOString(), text: "Bill captured via OCR upload", kind: "created" }],
      payments: [], etims: "ready",
    };
    onSaveDraft(b);
    notify({ tone: "success", title: "Draft saved from upload", body: `${b.number} created — review the extracted values in Drafts.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Capture" title="Upload a supplier bill" subtitle="PDF or photo — PayMo reads it and drafts the bill for you."
      footer={
        ocr !== "done" ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={extract} disabled={!fileName}><Upload size={15} /> Extract with OCR</button></>)
          : (<><button className="btn pm-btn-ghost" onClick={() => setOcr("idle")}>← Another file</button><button className="btn pm-btn-out" onClick={saveDraft}><CheckCircle2 size={15} /> Save as draft</button></>)
      }
    >
      {ocr !== "done" ? (
        <div>
          <div className={cls("pm-dropzone", fileName && "pm-dropzone-has")} onClick={() => { setFileName("soko-agri-march-invoice.pdf"); }} role="button">
            <Upload size={22} />
            {fileName ? <><b>{fileName}</b><span className="pm-muted pm-fs-12">Tap to choose a different file · 2.4 MB</span></> : <><b>Drop the bill here</b><span className="pm-muted pm-fs-12">or tap to choose — PDF, JPG, PNG up to 10 MB</span></>}
          </div>
          {ocr === "reading" && (
            <div className="pm-sync-list mt-3">
              <div className="pm-sync-step pm-sync-active"><Loader2 size={15} className="pm-spin" /> Reading document…</div>
              <div className="pm-sync-step"><span className="pm-sync-num">2</span> Detecting supplier from KRA PIN…</div>
              <div className="pm-sync-step"><span className="pm-sync-num">3</span> Extracting line items & taxes…</div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="pm-big-ic pm-big-ic-success mx-auto mb-3"><CheckCircle2 size={26} /></div>
          <div className="pm-preview-label">Extracted values — review & save</div>
          <div className="row g-3">
            <div className="col-md-6"><Field label="Supplier"><select className="form-select pm-input" value={supp} onChange={(e) => setSupp(e.target.value)}>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field></div>
            <div className="col-md-6"><Field label="Amount (KES)"><input className="form-control pm-input pm-input-lg" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field></div>
            <div className="col-12"><div className="pm-cyan-note">2 line items detected · VAT 16% · WHT 2% · due date 15 days. You'll verify the lines when editing the draft.</div></div>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════════════ Bill detail ═══════════════════════ */

function BillDetail({ b, onClose, supplier, notify, onApprove, onSchedule, onPay }: {
  b: Bill | null; onClose: () => void; supplier?: Supplier; notify: Notify;
  onApprove: (b: Bill) => void; onSchedule: (b: Bill) => void; onPay: (b: Bill) => void;
}) {
  if (!b) return null;
  return (
    <SlideOver open={!!b} onClose={onClose} kicker={`Bill · captured ${fmtDate(b.issue)}`} title={b.number} width={600}
      footer={
        <>
          {b.status === "pending" && <button className="btn pm-btn-primary btn-sm" onClick={() => onApprove(b)}><ShieldCheck size={14} /> Approve</button>}
          {["approved", "overdue"].includes(b.status) && <button className="btn pm-btn-soft btn-sm" onClick={() => onSchedule(b)}><CalendarClock size={14} /> Schedule payment</button>}
          {!["paid", "scheduled"].includes(b.status) && <button className="btn pm-btn-out btn-sm" onClick={() => onPay(b)}><Wallet size={14} /> Mark as paid</button>}
        </>
      }
    >
      <div className="pm-detail-head">
        <div className="d-flex align-items-center gap-3">
          <span className="pm-sup-ic"><Package size={18} /></span>
          <div>
            <div className="fw-bold">{supplier?.name}</div>
            <div className="pm-muted pm-fs-12">{supplier?.category} · {supplier?.terms} · KRA PIN {supplier?.pin}</div>
          </div>
          <div className="ms-auto text-end">
            <Badge tone={billStatusMeta[b.status].tone} dot>{billStatusMeta[b.status].label}</Badge>
            <div className="pm-money-lg mt-1">{fmt(b.amount)}</div>
          </div>
        </div>
        {b.approval && (
          <div className="pm-approval-chip mt-3">
            <span className="pm-approval-steps">
              {b.approval.chain.map((p, i) => (
                <span key={i} className={cls("pm-approval-step", i <= b.approval!.step && "pm-approval-step-done")}>
                  <i>{i + 1}</i>{p}
                </span>
              ))}
            </span>
            <Badge tone="warning">step {b.approval.step + 1} of {b.approval.chain.length}</Badge>
          </div>
        )}
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Line items</div>
        {b.lines.map((l, i) => (
          <div className="pm-line-view" key={i}>
            <div className="flex-grow-1">
              <div className="fw-semibold pm-fs-13">{l.desc}</div>
              <div className="pm-muted pm-fs-11">{l.qty} {l.unit} × {fmt(l.price)} · VAT {l.tax}% · WHT {l.wht}%</div>
            </div>
            <b className="pm-fs-13">{fmt(l.qty * l.price - l.disc)}</b>
          </div>
        ))}
        <div className="pm-detail-totals">
          <div><span>Subtotal</span><b>{fmt(b.lines.reduce((s, l) => s + l.qty * l.price - l.disc, 0))}</b></div>
          <div><span>WHT (remit to KRA)</span><b className="t-danger">− {fmt(b.lines.reduce((s, l) => s + (l.qty * l.price - l.disc) * l.wht / 100, 0))}</b></div>
          <div className="fw-bold"><span>Total payable</span><b>{fmt(b.amount)}</b></div>
        </div>
        {b.po && <div className="pm-fs-12 pm-muted">PO: <b className="pm-mono">{b.po}</b></div>}
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Payment timeline</div>
        {b.payments.length === 0 ? <div className="pm-muted pm-fs-13">No payments recorded yet.</div> : b.payments.map((p) => (
          <div className="pm-tl-item" key={p.id}>
            <span className="pm-tl-dot pm-tl-dot-pay" />
            <div className="flex-grow-1">
              <div className="fw-semibold pm-fs-13">{fmt(p.amount)} via {p.method}</div>
              <div className="pm-muted pm-fs-11">{fmtDT(p.t)} · ref <span className="pm-mono">{p.ref}</span></div>
            </div>
            <Badge tone={p.status === "settled" ? "success" : "warning"}>{p.status}</Badge>
          </div>
        ))}
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Activity log</div>
        {[...b.activity].reverse().map((a, i) => (
          <div className="pm-tl-item" key={i}>
            <span className={cls("pm-tl-dot", a.kind === "approved" && "pm-tl-dot-pay", a.kind === "submitted" && "pm-tl-dot-rem", a.kind === "paid" && "pm-tl-dot-pay", a.kind === "system" && "pm-tl-dot-view")} />
            <div>
              <div className="pm-fs-13">{a.text}</div>
              <div className="pm-muted pm-fs-11">{fmtDT(a.t)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pm-detail-actions">
        <button className="pm-action-tile" onClick={() => onSchedule(b)}><CalendarClock size={16} /><span>Schedule payment</span></button>
        <button className="pm-action-tile" onClick={() => onPay(b)}><Wallet size={16} /><span>Mark as paid</span></button>
        <button className="pm-action-tile" onClick={() => notify({ tone: "info", title: "eTIMS check queued", body: `${b.number} will be verified against iTax in the background.` })}><ShieldCheck size={16} /><span>Verify eTIMS</span></button>
        <button className="pm-action-tile" onClick={() => notify({ tone: "info", title: "WHT certificate", body: "Generate the supplier's WHT certificate in Compliance (2.9) after payment." })}><FileText size={16} /><span>WHT certificate</span></button>
      </div>
    </SlideOver>
  );
}

/* ═══════════════════════ Schedule modal ═══════════════════════ */

function ScheduleModal({ b, onClose, notify, appendActivity }: {
  b: Bill | null; onClose: () => void; notify: Notify;
  appendActivity: (id: string, text: string, kind: "scheduled") => void;
}) {
  const [date, setDate] = useState(addDays(todayISO(), 3));
  const [channel, setChannel] = useState("PesaLink");
  if (!b) return null;
  const schedule = () => {
    appendActivity(b.id, `Scheduled for payment on ${date} via ${channel}`, "scheduled");
    notify({ tone: "success", title: "Payment scheduled", body: `${b.number} · ${fmt(b.amount)} via ${channel} on ${fmtDate(date)}.` });
    onClose();
  };
  return (
    <Modal open={!!b} onClose={onClose} kicker="Scheduled Payments" title={`Schedule ${b.number}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-out" onClick={schedule}><CalendarClock size={15} /> Schedule payment</button></>}
    >
      <div className="pm-summary-card mb-3">
        <div className="pm-summary-row"><span>Bill</span><b>{b.number} — {fmt(b.amount)}</b></div>
        <div className="pm-summary-row"><span>Due</span><b>{fmtDate(b.due)}</b></div>
      </div>
      <Field label="Payment date"><input type="date" className="form-control pm-input" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <Field label="Channel">
        <div className="pm-mode-tabs">
          {["PesaLink", "M-Pesa B2B", "RTGS", "Bank transfer"].map((c) => (
            <button key={c} className={cls("pm-mode-tab", channel === c && "pm-mode-on")} onClick={() => setChannel(c)}>{c}</button>
          ))}
        </div>
      </Field>
      <div className="pm-note">Funds are reserved against the business wallet. You can cancel anytime before execution.</div>
    </Modal>
  );
}

/* ═══════════════════════ Pay modal ═══════════════════════ */

function PayModal({ b, onClose, notify, setBills }: {
  b: Bill | null; onClose: () => void; notify: Notify;
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
}) {
  const [method, setMethod] = useState("M-Pesa B2B");
  const [ref, setRef] = useState("");
  const [when, setWhen] = useState(todayISO());
  const [amt, setAmt] = useState("");
  useEffect(() => { if (b) { setAmt(String(b.amount)); setRef("B2B" + Math.floor(Math.random() * 9000 + 1000)); setWhen(todayISO()); setMethod("M-Pesa B2B"); } }, [b]);
  if (!b) return null;
  const amount = Number(amt) || b.amount;
  const pay = () => {
    setBills((bs) => bs.map((x) => (x.id === b.id ? {
      ...x, status: "paid" as BillStatus, paid: amount, etims: "verified",
      activity: [...x.activity, { t: new Date().toISOString(), text: `Paid ${fmt(amount)} via ${method}`, kind: "paid" }],
      payments: [...x.payments, { id: uid("bp"), amount, method, ref: ref || "—", t: new Date().toISOString(), status: "settled" }],
    } : x)));
    notify({ tone: "success", title: "Payment recorded", body: `${b.number} · ${fmt(amount)} via ${method}. WHT certificate queued for the supplier.` });
    onClose();
  };
  return (
    <Modal open={!!b} onClose={onClose} kicker="Manual Payment" title={`Pay ${b.number}`} subtitle={`Balance due: ${fmt(b.amount - b.paid)}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-out" onClick={pay}><Wallet size={15} /> Record payment</button></>}
    >
      <div className="pm-wizard-grid">
        <Field label="Amount (KES)"><input type="number" className="form-control pm-input pm-input-lg" value={amt} onChange={(e) => setAmt(e.target.value)} /></Field>
        <Field label="Method">
          <div className="pm-mode-tabs">
            {["M-Pesa B2B", "PesaLink", "RTGS", "Card", "Cash"].map((m) => (
              <button key={m} className={cls("pm-mode-tab", method === m && "pm-mode-on")} onClick={() => setMethod(m)}>{m}</button>
            ))}
          </div>
        </Field>
        <Field label="Transaction reference"><input className="form-control pm-input pm-mono" value={ref} onChange={(e) => setRef(e.target.value)} /></Field>
        <Field label="Payment date"><input type="date" className="form-control pm-input" value={when} onChange={(e) => setWhen(e.target.value)} /></Field>
        <div className="pm-cyan-note">Paying now marks the bill <Badge tone="success">Paid</Badge>, files the eTIMS receipt and prepares the supplier's WHT certificate.</div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════ Export modal ═══════════════════════ */

function ExportModal({ open, onClose, bills, exportRows, notify }: {
  open: boolean; onClose: () => void; bills: Bill[]; exportRows: (rows: Bill[]) => void; notify: Notify;
}) {
  const [fmtSel, setFmtSel] = useState("csv");
  const doExport = () => {
    if (fmtSel === "csv") { exportRows(bills); onClose(); }
    else { notify({ tone: "success", title: "PDF bundle requested", body: `${bills.length} bill PDFs will be emailed to billing@techsol.co.ke shortly.` }); onClose(); }
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Export" title="Export bills"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={doExport}><Download size={15} /> {fmtSel === "csv" ? "Download CSV" : "Request PDFs"}</button></>}
    >
      <Field label="Format">
        <div className="pm-radio-grid">
          <button className={cls("pm-radio-card", fmtSel === "csv" && "pm-radio-on")} onClick={() => setFmtSel("csv")}><b>CSV spreadsheet</b><span>Instant download — Excel / Sheets</span></button>
          <button className={cls("pm-radio-card", fmtSel === "pdf" && "pm-radio-on")} onClick={() => setFmtSel("pdf")}><b>PDF bundle</b><span>Zipped PDFs emailed (2 min)</span></button>
        </div>
      </Field>
      <div className="pm-note">{bills.length} bill(s) in the current view will be exported with supplier, amount, status, WHT and eTIMS state.</div>
    </Modal>
  );
}
