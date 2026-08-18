import React, { useEffect, useMemo, useState } from "react";
import {
  Plus, Search, SlidersHorizontal, MoreVertical, Eye, Send, Copy,
  Trash2, FileText, Download, ArrowUpDown, Mail, MessageCircle,
  CalendarClock, RefreshCw, UserPlus, AlertTriangle, Printer,
  Link2, Paperclip, Package, Zap, CheckCircle2, CalendarX2, X,
} from "lucide-react";
import type { Customer, Invoice, InvoiceLine, Product, Recurring, Tx } from "../../dataGetpaid";
import { reminderTemplates } from "../../dataGetpaid";
import {
  addDays, cls, copyText, daysUntil, downloadCSV, fmt, fmtDate, fmtDT, fmtN,
  statusMeta, todayISO, uid, type QAction,
} from "../../lib";
import {
  Avatar, Badge, Confirm, EmptyState, Field, Modal, Money, Pager, PillTabs,
  QrCode, Section, SlideOver, Stepper, Toggle,
} from "./ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

const PAGE_SIZE = 8;

export default function InvoiceCenter({
  invoices, setInvoices, customers, setCustomers, products, txs, notify, emit, qa, onConsume, onAddRecurring,
}: {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  products: Product[];
  txs: Tx[];
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
  onAddRecurring: (r: Omit<Recurring, "id" | "lifetime" | "count" | "onTime" | "failures">) => void;
}) {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ show: false, from: "", to: "", minAmt: "", maxAmt: "", cust: "", method: "" });
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "due", dir: 1 });
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardCustomer, setWizardCustomer] = useState<string | undefined>(undefined);
  const [quickOpen, setQuickOpen] = useState(false);
  const [detail, setDetail] = useState<Invoice | null>(null);
  const [reminderFor, setReminderFor] = useState<Invoice | null>(null);
  const [duplicateFor, setDuplicateFor] = useState<Invoice | null>(null);
  const [creditFor, setCreditFor] = useState<Invoice | null>(null);
  const [convertFor, setConvertFor] = useState<Invoice | null>(null);
  const [shareFor, setShareFor] = useState<Invoice | null>(null);
  const [scheduleFor, setScheduleFor] = useState<Invoice | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [newCustOpen, setNewCustOpen] = useState(false);
  const [pdfFor, setPdfFor] = useState<Invoice | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<string[] | null>(null);

  useEffect(() => {
    if (!qa) return;
    switch (qa.a) {
      case "newInvoice": setWizardCustomer(undefined); setWizardOpen(true); break;
      case "newInvoiceFor": setWizardCustomer(typeof qa.p === "string" ? qa.p : undefined); setWizardOpen(true); break;
      case "quickInvoice": setQuickOpen(true); break;
      case "export": setExportOpen(true); break;
      case "focusOverdue": {
        setTab("overdue");
        document.getElementById("sec-invoices")?.scrollIntoView({ behavior: "smooth" });
        break;
      }
      case "openInvoice": {
        const inv = invoices.find((i) => i.id === qa.p);
        if (inv) setDetail(inv);
        break;
      }
      case "newCustomer": setNewCustOpen(true); break;
    }
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const custOf = (id: string) => customers.find((c) => c.id === id);
  const nextNumber = () => {
    const maxN = invoices.reduce((m, i) => {
      const n = parseInt(i.number.replace(/\D/g, ""), 10);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);
    return `INV-${String(maxN + 1).padStart(4, "0")}`;
  };

  /* ── derived list ── */
  const filtered = useMemo(() => {
    let rows = invoices;
    if (tab !== "all") rows = rows.filter((i) => i.status === tab);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      rows = rows.filter((i) => {
        const c = custOf(i.customerId);
        return (
          i.number.toLowerCase().includes(s) ||
          (c?.name.toLowerCase().includes(s) ?? false) ||
          (c?.business.toLowerCase().includes(s) ?? false) ||
          String(i.amount).includes(s)
        );
      });
    }
    if (filters.show) {
      if (filters.from) rows = rows.filter((i) => i.issue >= filters.from);
      if (filters.to) rows = rows.filter((i) => i.issue <= filters.to);
      if (filters.minAmt) rows = rows.filter((i) => i.amount >= Number(filters.minAmt));
      if (filters.maxAmt) rows = rows.filter((i) => i.amount <= Number(filters.maxAmt));
      if (filters.cust) rows = rows.filter((i) => i.customerId === filters.cust);
      if (filters.method) rows = rows.filter((i) => i.payments.some((p) => p.method.toLowerCase().includes(filters.method.toLowerCase())));
    }
    const dir = sort.dir;
    return [...rows].sort((a, b) => {
      switch (sort.key) {
        case "number": return a.number.localeCompare(b.number) * dir;
        case "customer": return (custOf(a.customerId)?.name ?? "").localeCompare(custOf(b.customerId)?.name ?? "") * dir;
        case "amount": return (a.amount - b.amount) * dir;
        case "issue": return a.issue.localeCompare(b.issue) * dir;
        case "due": return a.due.localeCompare(b.due) * dir;
        case "paid": return (a.paid - b.paid) * dir;
        default: return 0;
      }
    });
  }, [invoices, tab, q, filters, sort, customers]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [tab, q, filters, sort]);

  /* ── summary strip ── */
  const monthInvoiced = invoices.filter((i) => i.issue.slice(0, 7) === todayISO().slice(0, 7)).reduce((s, i) => s + i.amount, 0);
  const collected = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.paid, 0);
  const outstanding = invoices.filter((i) => i.status === "sent" || i.status === "partial" || i.status === "overdue").reduce((s, i) => s + (i.amount - i.paid), 0);
  const overdueAmt = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + (i.amount - i.paid), 0);

  const counts = (s: string) => invoices.filter((i) => (s === "all" ? true : i.status === s)).length;

  /* ── actions ── */
  const createInvoice = (inv: Invoice) => setInvoices((xs) => [inv, ...xs]);

  const appendActivity = (id: string, text: string, kind: Invoice["activity"][number]["kind"]) =>
    setInvoices((xs) => xs.map((i) => (i.id === id ? { ...i, activity: [...i.activity, { t: new Date().toISOString(), text, kind }] } : i)));

  const markSent = (ids: string[]) => {
    setInvoices((xs) => xs.map((i) => (ids.includes(i.id) && i.status === "draft" ? { ...i, status: "sent", activity: [...i.activity, { t: new Date().toISOString(), text: "Marked as sent", kind: "sent" }] } : i)));
    notify({ tone: "success", title: `${ids.length} invoice${ids.length > 1 ? "s" : ""} marked as sent` });
    setSel(new Set());
  };

  const deleteDrafts = (ids: string[]) => {
    setInvoices((xs) => xs.filter((i) => !(ids.includes(i.id) && i.status === "draft")));
    notify({ tone: "danger", title: `${ids.length} draft${ids.length > 1 ? "s" : ""} deleted` });
    setSel(new Set());
  };

  const exportRows = (rows: Invoice[]) => {
    downloadCSV(
      `paymo-invoices-${todayISO()}.csv`,
      [["Invoice #", "Customer", "Amount", "Status", "Issue Date", "Due Date", "Paid", "Balance"], ...rows.map((i) => [i.number, custOf(i.customerId)?.name ?? "", i.amount, statusMeta[i.status].label, i.issue, i.due, i.paid, i.amount - i.paid])]
    );
    notify({ tone: "success", title: "CSV downloaded", body: `${rows.length} invoices exported.` });
  };

  const printInvoice = (inv: Invoice) => {
    const c = custOf(inv.customerId);
    const w = window.open("", "_blank", "width=860,height=980");
    if (!w) { notify({ tone: "warning", title: "Pop-up blocked", body: "Allow pop-ups to print the invoice PDF." }); return; }
    w.document.write(`<html><head><title>${inv.number}</title><style>body{font-family:Arial;padding:40px;color:#111}h1{font-size:22px}table{width:100%;border-collapse:collapse;margin:18px 0}td,th{border:1px solid #ccc;padding:8px;font-size:13px;text-align:left}.t{text-align:right}.ttl{font-weight:bold}.tot{border-top:2px solid #000}.muted{color:#666;font-size:12px}.foot{margin-top:30px;border-top:1px solid #ddd;padding-top:14px;font-size:12px;color:#444}</style></head><body>
      <h1>TechSol Ltd — ${inv.number}</h1><p class="muted">KRA PIN: P0512345678V · Paybill 880321</p>
      <p><b>Bill to:</b> ${c?.name} — ${c?.business}<br/><span class="muted">${c?.phone} · ${c?.email}</span></p>
      <p class="muted">Issued: ${fmtDate(inv.issue)} · Due: ${fmtDate(inv.due)} · Terms: ${inv.terms}</p>
      <table><tr><th>Description</th><th>Qty</th><th class="t">Unit Price</th><th class="t">Amount</th></tr>
      ${inv.lines.map((l) => `<tr><td>${l.desc}</td><td>${l.qty} ${l.unit}</td><td class="t">${fmtN(l.price)}</td><td class="t">${fmtN(l.qty * l.price - l.disc)}</td></tr>`).join("")}
      </table>
      <p class="ttl">Balance due: ${fmt(inv.amount - inv.paid)}</p>
      <p>${inv.notes}</p>
      <div class="foot">Pay via M-Pesa Paybill 880321, account ${inv.number} · Questions? billing@techsol.co.ke</div>
      <script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  };

  const toggleSel = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allOnPage = pageRows.every((r) => sel.has(r.id));

  return (
    <>
      <Section
        no="1.2" sub="Money In · Invoicing & Billing" id="sec-invoices"
        title="Invoice Center"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setQuickOpen(true)}><Zap size={16} /> Quick Invoice</button>
            <button className="btn pm-btn-primary" onClick={() => setWizardOpen(true)}><Plus size={16} /> New Invoice</button>
          </>
        }
      >
        {/* summary strip */}
        <div className="row g-3 mb-3">
          <MiniStat label="Total invoiced (MTD)" value={fmt(monthInvoiced)} trend="▲ 8.2% vs last month" tone="up" />
          <MiniStat label="Collected (all time)" value={fmt(collected)} trend="▲ 12.4%" tone="up" />
          <MiniStat label="Outstanding" value={fmt(outstanding)} trend="▲ 3.1%" tone="down" />
          <MiniStat label="Overdue" value={fmt(overdueAmt)} trend="▲ 5 invoices need action" tone="bad" />
        </div>

        <div className="pm-card">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between px-3 pt-3">
            <PillTabs
              tabs={[
                { id: "all", label: "All", count: counts("all") },
                { id: "draft", label: "Draft", count: counts("draft") },
                { id: "sent", label: "Sent", count: counts("sent") },
                { id: "paid", label: "Paid", count: counts("paid") },
                { id: "partial", label: "Partially Paid", count: counts("partial") },
                { id: "overdue", label: "Overdue", count: counts("overdue"), tone: "danger" },
                { id: "cancelled", label: "Cancelled", count: counts("cancelled") },
              ]}
              active={tab}
              onChange={setTab}
            />
            <div className="d-flex gap-2">
              <div className="pm-search">
                <Search size={15} />
                <input placeholder="Search invoice, customer, amount…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <button className={cls("btn", filters.show ? "pm-btn-primary" : "pm-btn-soft")} onClick={() => setFilters((f) => ({ ...f, show: !f.show }))}>
                <SlidersHorizontal size={15} /> Filters
              </button>
            </div>
          </div>

          {/* advanced filters */}
          {filters.show && (
            <div className="pm-filters">
              <div className="row g-2">
                <FilterCol label="From"><input type="date" className="form-control form-control-sm pm-input" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></FilterCol>
                <FilterCol label="To"><input type="date" className="form-control form-control-sm pm-input" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></FilterCol>
                <FilterCol label="Min amount"><input type="number" placeholder="KES" className="form-control form-control-sm pm-input" value={filters.minAmt} onChange={(e) => setFilters({ ...filters, minAmt: e.target.value })} /></FilterCol>
                <FilterCol label="Max amount"><input type="number" placeholder="KES" className="form-control form-control-sm pm-input" value={filters.maxAmt} onChange={(e) => setFilters({ ...filters, maxAmt: e.target.value })} /></FilterCol>
                <FilterCol label="Customer">
                  <select className="form-select form-select-sm pm-input" value={filters.cust} onChange={(e) => setFilters({ ...filters, cust: e.target.value })}>
                    <option value="">All customers</option>
                    {customers.map((c) => <option key={c.id} value={c.id}>{c.business}</option>)}
                  </select>
                </FilterCol>
                <FilterCol label="Payment method">
                  <select className="form-select form-select-sm pm-input" value={filters.method} onChange={(e) => setFilters({ ...filters, method: e.target.value })}>
                    <option value="">Any</option><option>M-Pesa</option><option>PesaLink</option><option>Card</option><option>QR</option>
                  </select>
                </FilterCol>
              </div>
              <div className="d-flex gap-2 mt-2 justify-content-end">
                <button className="btn btn-sm pm-btn-ghost" onClick={() => setFilters({ show: true, from: "", to: "", minAmt: "", maxAmt: "", cust: "", method: "" })}>Clear</button>
                <button className="btn btn-sm pm-btn-primary" onClick={() => { setFilters({ ...filters, show: false }); notify({ tone: "info", title: "Filters applied", body: `${filtered.length} invoice(s) match.` }); }}>Apply filters</button>
              </div>
            </div>
          )}

          {/* bulk toolbar */}
          {sel.size > 0 && (
            <div className="pm-bulkbar">
              <span className="pm-bulk-count">{sel.size} selected</span>
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-sm pm-btn-soft" onClick={() => markSent([...sel])}><Send size={13} /> Send / Mark sent</button>
                <button className="btn btn-sm pm-btn-soft" onClick={() => { printInvoice(pageRows.find((r) => sel.has(r.id))!); notify({ tone: "info", title: "Preparing PDFs", body: `${sel.size} invoice PDF(s) sent to print.` }); }}><Download size={13} /> Download PDFs</button>
                <button className="btn btn-sm pm-btn-soft" onClick={() => exportRows(invoices.filter((i) => sel.has(i.id)))}><FileText size={13} /> Export CSV</button>
                <button className="btn btn-sm pm-btn-danger-soft" onClick={() => setConfirmDel([...sel])}><Trash2 size={13} /> Delete drafts</button>
              </div>
              <button className="btn btn-sm pm-btn-ghost" onClick={() => setSel(new Set())}><X size={13} /></button>
            </div>
          )}

          {/* table */}
          <div className="table-responsive">
            <table className="table pm-table align-middle mb-0">
              <thead>
                <tr>
                  <th className="pm-th-check">
                    <input type="checkbox" checked={allOnPage && pageRows.length > 0} onChange={() => setSel(allOnPage ? new Set() : new Set(pageRows.map((r) => r.id)))} />
                  </th>
                  <Th label="Invoice #" k="number" sort={sort} setSort={setSort} />
                  <Th label="Customer" k="customer" sort={sort} setSort={setSort} />
                  <Th label="Amount" k="amount" sort={sort} setSort={setSort} right />
                  <th>Status</th>
                  <Th label="Issued" k="issue" sort={sort} setSort={setSort} />
                  <Th label="Due" k="due" sort={sort} setSort={setSort} />
                  <th className="text-end">Paid / Balance</th>
                  <th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr><td colSpan={9}><EmptyState icon={<FileText size={26} />} title="No invoices found" body="Try a different tab, search term or filter — or create a new invoice." action={<button className="btn pm-btn-primary btn-sm" onClick={() => setWizardOpen(true)}><Plus size={14} /> New Invoice</button>} /></td></tr>
                )}
                {pageRows.map((inv) => {
                  const c = custOf(inv.customerId);
                  const bal = inv.amount - inv.paid;
                  return (
                    <tr key={inv.id} className={cls(sel.has(inv.id) && "pm-row-sel")}>
                      <td className="pm-th-check"><input type="checkbox" checked={sel.has(inv.id)} onChange={() => toggleSel(inv.id)} /></td>
                      <td>
                        <button className="pm-num-link" onClick={() => setDetail(inv)}>{inv.number}</button>
                        {inv.viewed && <Eye size={12} className="pm-eye ms-1" />}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Avatar name={c?.name ?? "?"} size={28} />
                          <div>
                            <div className="fw-semibold pm-fs-13">{c?.name ?? "Unknown"}</div>
                            <div className="pm-muted pm-fs-11">{c?.business}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end fw-bold pm-fs-13"><Money n={inv.amount} /></td>
                      <td>
                        <Badge tone={statusMeta[inv.status].tone} dot={["paid", "partial", "overdue"].includes(inv.status)}>
                          {statusMeta[inv.status].label}
                        </Badge>
                      </td>
                      <td className="pm-muted pm-fs-13">{fmtDate(inv.issue)}</td>
                      <td className="pm-fs-13">
                        {fmtDate(inv.due)}
                        {inv.status === "sent" && daysUntil(inv.due) < 5 && <span className="pm-due-soon"> · due soon</span>}
                      </td>
                      <td className="text-end pm-fs-13">
                        {inv.status === "partial" ? (
                          <div className="d-inline-flex flex-column align-items-end">
                            <span className="pm-muted">{fmt(inv.paid)}</span>
                            <span className="fw-bold t-warning">bal {fmt(bal)}</span>
                          </div>
                        ) : inv.status === "paid" ? (
                          <Badge tone="success">{fmt(inv.paid)}</Badge>
                        ) : (
                          <span className="pm-muted">{bal === 0 ? "—" : `bal ${fmt(bal)}`}</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="pm-menu-wrap">
                          <button className="pm-icon-btn" onClick={() => setMenuFor(menuFor === inv.id ? null : inv.id)} aria-label="Row actions">
                            <MoreVertical size={15} />
                          </button>
                          {menuFor === inv.id && (
                            <>
                              <div className="pm-menu-backdrop" onClick={() => setMenuFor(null)} />
                              <div className="pm-menu">
                                <button onClick={() => { setDetail(inv); setMenuFor(null); }}><Eye size={14} /> View details</button>
                                <button onClick={() => { setReminderFor(inv); setMenuFor(null); }}><MessageCircle size={14} /> Send reminder</button>
                                <button onClick={() => { setShareFor(inv); setMenuFor(null); }}><Link2 size={14} /> Share / Copy link</button>
                                {["draft", "sent"].includes(inv.status) && <button onClick={() => { setScheduleFor(inv); setMenuFor(null); }}><CalendarClock size={14} /> Schedule send</button>}
                                <button onClick={() => { setPdfFor(inv); setMenuFor(null); }}><Printer size={14} /> Preview & print PDF</button>
                                <button onClick={() => { setDuplicateFor(inv); setMenuFor(null); }}><Copy size={14} /> Duplicate</button>
                                {inv.status !== "cancelled" && <button onClick={() => { setCreditFor(inv); setMenuFor(null); }}><CalendarX2 size={14} /> Credit note</button>}
                                {!["cancelled", "paid"].includes(inv.status) && <button onClick={() => { setConvertFor(inv); setMenuFor(null); }}><RefreshCw size={14} /> Convert to recurring</button>}
                                {inv.status === "draft" && <button className="pm-menu-danger" onClick={() => { setConfirmDel([inv.id]); setMenuFor(null); }}><Trash2 size={14} /> Delete draft</button>}
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
            <span className="pm-muted pm-fs-12">Showing {Math.min(filtered.length, (page - 1) * PAGE_SIZE + 1)}–{Math.min(filtered.length, page * PAGE_SIZE)} of {filtered.length}</span>
            <Pager page={page} pages={pages} onPage={setPage} />
          </div>
        </div>
      </Section>

      {/* ══════════ INVOICE WIZARD (1.3) ══════════ */}
      <InvoiceWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        customers={customers}
        setCustomers={setCustomers}
        products={products}
        notify={notify}
        presetCustomer={wizardCustomer}
        nextNumber={nextNumber()}
        onCreated={(inv, action) => {
          createInvoice(inv);
          if (action === "send") notify({ tone: "success", title: "Invoice sent", body: `${inv.number} went out to ${custOf(inv.customerId)?.name}.` });
          else notify({ tone: "info", title: "Draft saved", body: `${inv.number} is in your Draft tab.` });
        }}
      />

      {/* ══════════ QUICK INVOICE ══════════ */}
      <QuickInvoice
        open={quickOpen} onClose={() => setQuickOpen(false)} customers={customers}
        nextNumber={nextNumber()}
        onCreated={(inv) => { createInvoice(inv); notify({ tone: "success", title: "Quick invoice sent", body: `${inv.number} · ${fmt(inv.amount)} to ${custOf(inv.customerId)?.name}.` }); }}
      />

      {/* ══════════ DETAIL SLIDE-OVER ══════════ */}
      <DetailPanel
        inv={detail} onClose={() => setDetail(null)} customer={detail ? custOf(detail.customerId) : undefined}
        txs={txs}
        actions={{
          onRemind: (i) => { setDetail(null); setReminderFor(i); },
          onDuplicate: (i) => { setDetail(null); setDuplicateFor(i); },
          onCredit: (i) => { setDetail(null); setCreditFor(i); },
          onConvert: (i) => { setDetail(null); setConvertFor(i); },
          onShare: (i) => { setDetail(null); setShareFor(i); },
          onPrint: (i) => { setDetail(null); setPdfFor(i); },
        }}
        emit={emit}
      />

      {/* ══════════ ACTION MODALS ══════════ */}
      <ReminderModal inv={reminderFor} onClose={() => setReminderFor(null)} notify={notify} appendActivity={appendActivity} />
      <Confirm
        open={!!duplicateFor} onClose={() => setDuplicateFor(null)}
        onConfirm={() => {
          if (!duplicateFor) return;
          const copy = { ...duplicateFor, id: uid("inv"), number: nextNumber(), status: "draft" as const, issue: todayISO(), due: addDays(todayISO(), 30), viewed: false, reminders: 0, activity: [{ t: new Date().toISOString(), text: "Duplicated from " + duplicateFor.number, kind: "created" as const }] };
          createInvoice(copy);
          notify({ tone: "success", title: "Invoice duplicated", body: `${copy.number} created as a draft.` });
        }}
        title="Duplicate invoice" confirmLabel="Duplicate"
        body={<span>Create a draft copy of <b>{duplicateFor?.number}</b> with today's date and a fresh invoice number.</span>}
        icon={<Copy size={18} />}
      />
      <CreditNoteModal inv={creditFor} onClose={() => setCreditFor(null)} notify={notify} setInvoices={setInvoices} />
      <ConvertModal inv={convertFor} onClose={() => setConvertFor(null)} notify={notify} onAddRecurring={onAddRecurring} />
      <ShareModal inv={shareFor} onClose={() => setShareFor(null)} notify={notify} />
      <ScheduleModal inv={scheduleFor} onClose={() => setScheduleFor(null)} notify={notify} appendActivity={appendActivity} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} invoices={filtered} exportRows={exportRows} notify={notify} />
      <NewCustomerModal open={newCustOpen} onClose={() => setNewCustOpen(false)} setCustomers={setCustomers} notify={notify} />
      <PdfModal inv={pdfFor} onClose={() => setPdfFor(null)} customer={pdfFor ? custOf(pdfFor.customerId) : undefined} notify={notify} printInvoice={printInvoice} />
      <Confirm
        open={!!confirmDel} onClose={() => setConfirmDel(null)}
        onConfirm={() => confirmDel && deleteDrafts(confirmDel)}
        title="Delete drafts" confirmLabel="Delete" tone="danger"
        body={<span>Permanently delete {confirmDel?.length ?? 0} draft invoice(s)? This cannot be undone.</span>}
        icon={<Trash2 size={18} />}
      />
    </>
  );
}

/* ── small helpers ── */

function MiniStat({ label, value, trend, tone }: { label: string; value: string; trend: string; tone: "up" | "down" | "bad" }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="pm-mini">
        <div className="pm-mini-label">{label}</div>
        <div className="pm-mini-value">{value}</div>
        <div className={cls("pm-mini-trend", tone === "bad" ? "t-danger" : tone === "up" ? "t-success" : "t-warning")}>{trend}</div>
      </div>
    </div>
  );
}

function FilterCol({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="col-6 col-md-4 col-xl-2">
      <label className="pm-flabel pm-fs-11">{label}</label>
      {children}
    </div>
  );
}

function Th({ label, k, sort, setSort, right }: { label: string; k: string; sort: { key: string; dir: 1 | -1 }; setSort: (s: { key: string; dir: 1 | -1 }) => void; right?: boolean }) {
  const active = sort.key === k;
  return (
    <th className={cls("pm-th-sort", right && "text-end")} onClick={() => setSort({ key: k, dir: active ? ((sort.dir * -1) as 1 | -1) : 1 })}>
      {label} <ArrowUpDown size={11} className={cls(active && "t-primary")} />
    </th>
  );
}

/* ═══════════════════════ Invoice Wizard ═══════════════════════ */

function InvoiceWizard({
  open, onClose, customers, setCustomers, products, notify, nextNumber, onCreated, presetCustomer,
}: {
  open: boolean;
  onClose: () => void;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  products: Product[];
  notify: Notify;
  nextNumber: string;
  onCreated: (inv: Invoice, action: "send" | "draft") => void;
  presetCustomer?: string;
}) {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [nc, setNc] = useState({ name: "", phone: "", email: "", pin: "" });
  const [custMode, setCustMode] = useState<"existing" | "new" | "walkin">("existing");
  const [q, setQ] = useState("");
  const [lines, setLines] = useState<InvoiceLine[]>([{ desc: "", qty: 1, unit: "pcs", price: 0, tax: 16, disc: 0 }]);
  const [pickOpen, setPickOpen] = useState(false);
  const [details, setDetails] = useState({
    issue: todayISO(), due: addDays(todayISO(), 30), terms: "30 days", po: "",
    notes: "Thank you for your business. Please pay via M-Pesa Paybill 880321 with account reference {INV}.",
    memo: "", template: "Professional", recurring: false, freq: "Monthly",
  });
  const [sendOpts, setSendOpts] = useState({ email: true, sms: false, wa: true, link: false, schedule: false, scheduleAt: "" });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (presetCustomer) {
      const pre = customers.find((x) => x.id === presetCustomer);
      if (pre) { setCustomer(pre); setCustMode("existing"); setQ(pre.name); }
    }
    const t = window.setInterval(() => {
      setSavedAt(new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }));
    }, 30000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presetCustomer]);

  const reset = () => {
    setStep(1); setCustomer(null); setCustMode("existing"); setQ("");
    setLines([{ desc: "", qty: 1, unit: "pcs", price: 0, tax: 16, disc: 0 }]);
    setDetails({ issue: todayISO(), due: addDays(todayISO(), 30), terms: "30 days", po: "", notes: "Thank you for your business. Please pay via M-Pesa Paybill 880321 with account reference {INV}.", memo: "", template: "Professional", recurring: false, freq: "Monthly" });
    setSendOpts({ email: true, sms: false, wa: true, link: false, schedule: false, scheduleAt: "" });
    setSavedAt(null);
  };
  const close = () => { onClose(); window.setTimeout(reset, 250); };

  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const discTotal = lines.reduce((s, l) => s + l.disc, 0);
  const taxTotal = lines.reduce((s, l) => s + Math.max(0, l.qty * l.price - l.disc) * (l.tax / 100), 0);
  const total = Math.round(subtotal - discTotal + taxTotal);

  const setLine = (i: number, p: Partial<InvoiceLine>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...p } : l)));

  const effectiveCustomer: Customer | null =
    custMode === "new" && nc.name && nc.phone
      ? { id: "c-new", name: nc.name, business: nc.name, phone: nc.phone, email: nc.email, pin: nc.pin || "PENDING", balance: 0, avgDays: 0 }
      : custMode === "walkin" ? { id: "c-walk", name: "Walk-in Customer", business: "Cash sale", phone: "—", email: "", pin: "—", balance: 0, avgDays: 0 }
      : customer;

  const validStep1 = custMode === "existing" ? !!customer : custMode === "walkin" ? true : !!(nc.name && nc.phone);
  const validStep2 = lines.some((l) => l.desc.trim() && l.qty > 0 && l.price > 0);

  const previewInv: Invoice = {
    id: "preview", number: nextNumber, customerId: effectiveCustomer?.id ?? "c1",
    issue: details.issue, due: details.due, amount: total, paid: 0, status: "draft",
    lines: lines.filter((l) => l.desc.trim()), terms: details.terms, po: details.po || undefined,
    notes: details.notes.replace("{INV}", nextNumber), memo: details.memo, template: details.template,
    activity: [], payments: [], viewed: false, reminders: 0,
  };

  const submit = (action: "send" | "draft") => {
    if (!effectiveCustomer) return;
    const newCust = custMode === "new" ? { ...effectiveCustomer, id: uid("c") } : effectiveCustomer;
    if (custMode === "new") setCustomers((cs) => [...cs, newCust]);
    const inv: Invoice = {
      ...previewInv,
      customerId: newCust.id,
      status: action === "send" ? "sent" : "draft",
      activity: [
        { t: new Date().toISOString(), text: action === "send" ? "Invoice created & sent" : "Draft saved (auto-save)", kind: "created" },
        ...(action === "send"
          ? [
              { t: new Date().toISOString(), text: `Sent via ${[sendOpts.email && "Email", sendOpts.wa && "WhatsApp", sendOpts.sms && "SMS"].filter(Boolean).join(" + ") || "Payment link"}`, kind: "sent" as const },
              ...(sendOpts.schedule ? [{ t: new Date().toISOString(), text: `Scheduled delivery for ${sendOpts.scheduleAt.replace("T", " ")}`, kind: "system" as const }] : []),
            ]
          : []),
      ],
    };
    if (action === "send" && details.recurring) {
      notify({ tone: "info", title: "Recurring tip", body: "Set up the full recurring schedule in Recurring Invoices — this is saved as the template." });
    }
    onCreated(inv, action);
    close();
  };

  return (
    <Modal
      open={open} onClose={close} kicker="New Invoice · Section 1.3" title="Invoice Wizard" size="xl" hideClose={false}
      footer={
        <>
          <div className="me-auto pm-autosave">{savedAt ? `✓ Draft auto-saved at ${savedAt}` : "Auto-save: every 30s"}</div>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 4 && step > 1 && <button className="btn pm-btn-soft" onClick={() => setStep(4)}>Skip to review</button>}
          {step < 4 && (
            <button className="btn pm-btn-primary" disabled={step === 1 ? !validStep1 : step === 2 ? !validStep2 : false} onClick={() => setStep(step + 1)}>
              Continue →
            </button>
          )}
          {step === 4 && (
            <>
              <button className="btn pm-btn-soft" onClick={() => submit("draft")}><FileText size={15} /> Save as Draft</button>
              <button className="btn pm-btn-primary" onClick={() => submit("send")}><Send size={15} /> Save & Send</button>
            </>
          )}
        </>
      }
    >
      <Stepper current={step} steps={4} labels={["Customer", "Line Items", "Details & Terms", "Review & Send"]} />

      {step === 1 && (
        <div className="pm-wizard-body">
          <div className="pm-wizard-hint">
            {custMode === "existing" && "Search an existing customer — or create a new one inline. You can also invoice a walk-in sale without a customer."}
            {custMode === "new" && "Only the name and phone are required to invoice. The full profile is created in Customers & CRM."}
            {custMode === "walkin" && "Walk-in sale: customer fields are suppressed. The invoice still gets a payment link and QR."}
          </div>
          <div className="pm-mode-tabs mb-3">
            <button className={cls("pm-mode-tab", custMode === "existing" && "pm-mode-on")} onClick={() => setCustMode("existing")}>Existing customer</button>
            <button className={cls("pm-mode-tab", custMode === "new" && "pm-mode-on")} onClick={() => setCustMode("new")}><UserPlus size={13} /> New customer</button>
            <button className={cls("pm-mode-tab", custMode === "walkin" && "pm-mode-on")} onClick={() => setCustMode("walkin")}>Walk-in / no customer</button>
          </div>

          {custMode === "existing" && (
            <>
              <div className="pm-search pm-search-lg mb-2">
                <Search size={15} />
                <input autoFocus placeholder="Search by name, business, phone or KRA PIN…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div className="pm-cust-list">
                {customers.filter((c) => !q || (c.name + c.business + c.phone + c.pin).toLowerCase().includes(q.toLowerCase())).map((c) => (
                  <button key={c.id} className={cls("pm-cust-row", customer?.id === c.id && "pm-cust-on")} onClick={() => setCustomer(c)}>
                    <Avatar name={c.name} size={34} />
                    <div className="flex-grow-1 text-start">
                      <div className="fw-semibold pm-fs-13">{c.name} <span className="pm-muted pm-fs-12">· {c.business}</span></div>
                      <div className="pm-muted pm-fs-11">{c.phone} · {c.email}</div>
                    </div>
                    {c.balance > 0 && <Badge tone="warning">{fmt(c.balance)} owed</Badge>}
                    {customer?.id === c.id && <CheckCircle2 size={17} className="t-primary" />}
                  </button>
                ))}
                {customers.filter((c) => !q || (c.name + c.business + c.phone + c.pin).toLowerCase().includes(q.toLowerCase())).length === 0 && (
                  <div className="pm-empty-inline">No match — switch to “New customer” or adjust your search.</div>
                )}
              </div>
            </>
          )}

          {custMode === "new" && (
            <div className="row g-3">
              <div className="col-md-6"><Field label="Full name" req><input className="form-control pm-input" value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} /></Field></div>
              <div className="col-md-6"><Field label="Phone" req><input className="form-control pm-input" placeholder="07XX XXX XXX" value={nc.phone} onChange={(e) => setNc({ ...nc, phone: e.target.value })} /></Field></div>
              <div className="col-md-6"><Field label="Email"><input className="form-control pm-input" value={nc.email} onChange={(e) => setNc({ ...nc, email: e.target.value })} /></Field></div>
              <div className="col-md-6"><Field label="KRA PIN" hint="Only needed if the invoice must be VAT-compliant."><input className="form-control pm-input" value={nc.pin} onChange={(e) => setNc({ ...nc, pin: e.target.value })} /></Field></div>
            </div>
          )}

          {custMode === "walkin" && (
            <div className="pm-cyan-note">🧾 This creates an anonymous invoice. Customer fields are suppressed, and the payment link / QR handles the collection.</div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="pm-wizard-body" onKeyDown={(e) => {
          if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); if (validStep2) setStep(3); }
          if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT" && lines[lines.length - 1].desc.trim()) {
            e.preventDefault();
            setLines((ls) => [...ls, { desc: "", qty: 1, unit: "pcs", price: 0, tax: 16, disc: 0 }]);
          }
        }}>
          <div className="d-flex gap-2 mb-2 flex-wrap">
            <button className="btn pm-btn-soft btn-sm" onClick={() => setPickOpen(true)}><Package size={14} /> Pick from products</button>
            <button className="btn pm-btn-ghost btn-sm" onClick={() => setLines((ls) => [...ls, { desc: "", qty: 1, unit: "pcs", price: 0, tax: 16, disc: 0 }])}><Plus size={14} /> Add line</button>
            <span className="pm-muted pm-fs-12 ms-auto align-self-center">Enter adds a line · Ctrl+Enter submits</span>
          </div>
          <div className="pm-lines">
            <div className="pm-lines-head">
              <span>Description</span><span>Qty</span><span>Unit</span><span>Price (KES)</span><span>Tax</span><span>Disc</span><span />
            </div>
            {lines.map((l, i) => (
              <div className="pm-line-row" key={i}>
                <input className="form-control form-control-sm pm-input" placeholder="What are you charging for?" value={l.desc} onChange={(e) => setLine(i, { desc: e.target.value })} />
                <input className="form-control form-control-sm pm-input pm-w-70" type="number" min={1} value={l.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} />
                <select className="form-select form-select-sm pm-input pm-w-80" value={l.unit} onChange={(e) => setLine(i, { unit: e.target.value })}>
                  {["pcs", "hours", "days", "kg", "km", "mo"].map((u) => <option key={u}>{u}</option>)}
                </select>
                <input className="form-control form-control-sm pm-input pm-w-110" type="number" min={0} value={l.price} onChange={(e) => setLine(i, { price: Number(e.target.value) })} />
                <select className="form-select form-select-sm pm-input pm-w-90" value={l.tax} onChange={(e) => setLine(i, { tax: Number(e.target.value) })}>
                  <option value={16}>16% VAT</option><option value={0}>Exempt</option><option value={8}>8%</option><option value={10}>10%</option>
                </select>
                <input className="form-control form-control-sm pm-input pm-w-90" type="number" min={0} value={l.disc} onChange={(e) => setLine(i, { disc: Number(e.target.value) })} />
                <button className="pm-icon-btn pm-icon-danger" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} disabled={lines.length === 1}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
          <div className="pm-total-panel">
            <div className="pm-total-title">Live running total</div>
            <div className="pm-total-row"><span>Subtotal</span><b>{fmt(subtotal)}</b></div>
            <div className="pm-total-row"><span>Discounts</span><b className={discTotal ? "t-danger" : ""}>− {fmt(discTotal)}</b></div>
            <div className="pm-total-row"><span>VAT & taxes</span><b>{fmt(taxTotal)}</b></div>
            <div className="pm-total-row pm-total-grand"><span>Total due</span><b>{fmt(total)}</b></div>
            <div className="pm-total-note">Tax auto-calculates from line tax rates. VAT column appears because TechSol Ltd is VAT-registered.</div>
          </div>
          {!validStep2 && <div className="pm-warn-chip mt-2"><AlertTriangle size={13} /> Add at least one line with a description and a price — or use Quick Invoice for a one-liner.</div>}

          <Modal open={pickOpen} onClose={() => setPickOpen(false)} title="Pick from products" subtitle="Auto-fills description, price and tax from your catalog." size="md" footer={<button className="btn pm-btn-ghost" onClick={() => setPickOpen(false)}>Close</button>}>
            <div className="pm-prod-list">
              {products.map((p) => (
                <button key={p.id} className="pm-prod-row" onClick={() => { setLines((ls) => [...ls, { desc: p.name, qty: 1, unit: p.unit, price: p.price, tax: p.tax, disc: 0 }]); setPickOpen(false); notify({ tone: "info", title: "Product added", body: `${p.name} → ${fmt(p.price)}` }); }}>
                  <span className="pm-chan-ic pm-chan-ic-links"><Package size={16} /></span>
                  <div className="flex-grow-1 text-start">
                    <div className="fw-semibold pm-fs-13">{p.name}</div>
                    <div className="pm-muted pm-fs-11">{p.tax}% VAT · per {p.unit}</div>
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
            <div className="col-md-6">
              <Field label="Invoice date"><input type="date" className="form-control pm-input" value={details.issue} onChange={(e) => setDetails({ ...details, issue: e.target.value })} /></Field>
            </div>
            <div className="col-md-6">
              <Field label="Payment terms">
                <select className="form-select pm-input" value={details.terms} onChange={(e) => { const d = e.target.value; const days = d === "On receipt" ? 0 : parseInt(d, 10); setDetails({ ...details, terms: d, due: addDays(details.issue, days) }); }}>
                  <option>On receipt</option><option>15 days</option><option>30 days</option><option>60 days</option><option>Custom</option>
                </select>
              </Field>
            </div>
            <div className="col-md-6"><Field label="Due date"><input type="date" className="form-control pm-input" value={details.due} onChange={(e) => setDetails({ ...details, due: e.target.value })} /></Field></div>
            <div className="col-md-6"><Field label="Purchase order number"><input className="form-control pm-input" placeholder="Optional" value={details.po} onChange={(e) => setDetails({ ...details, po: e.target.value })} /></Field></div>
            <div className="col-12"><Field label="Message to customer" hint="Shown on the sent invoice."><textarea className="form-control pm-input" rows={2} value={details.notes} onChange={(e) => setDetails({ ...details, notes: e.target.value })} /></Field></div>
            <div className="col-12"><Field label="Internal memo" hint="Only visible to your team — never on the invoice."><input className="form-control pm-input" value={details.memo} onChange={(e) => setDetails({ ...details, memo: e.target.value })} /></Field></div>
            <div className="col-md-6">
              <Field label="Attachment" hint="Contracts, delivery notes — PDF or image.">
                <button className="pm-upload" onClick={() => notify({ tone: "info", title: "Attachment uploaded", body: "delivery-note.pdf attached to this invoice (demo)." })}>
                  <Paperclip size={15} /> delivery-note.pdf <X size={13} className="ms-auto" />
                </button>
              </Field>
            </div>
            <div className="col-md-6">
              <Field label="Template">
                <div className="d-flex gap-2">
                  {["Professional", "Simple", "Retail"].map((t) => (
                    <button key={t} className={cls("pm-template-chip", details.template === t && "pm-template-on")} onClick={() => setDetails({ ...details, template: t })}>
                      <span className={cls("pm-template-swatch", t === "Professional" && "tmpl-pro", t === "Simple" && "tmpl-sim", t === "Retail" && "tmpl-ret")} />
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
            <div className="col-12">
              <div className={cls("pm-recur-box", details.recurring && "pm-recur-on")}>
                <Toggle on={details.recurring} onChange={(v) => setDetails({ ...details, recurring: v })} label="Make this a recurring invoice" />
                {details.recurring && (
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    <select className="form-select form-select-sm pm-input pm-w-150" value={details.freq} onChange={(e) => setDetails({ ...details, freq: e.target.value })}>
                      <option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>Yearly</option><option>Custom</option>
                    </select>
                    <span className="pm-muted pm-fs-12 align-self-center">Starts after this invoice is sent. Manage the full schedule in Recurring Invoices.</span>
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
            <div className="pm-preview-label">PDF preview — exactly what your customer sees</div>
            <InvoicePaper inv={previewInv} customer={effectiveCustomer ?? { id: "x", name: "—", business: "", phone: "", email: "", pin: "", balance: 0, avgDays: 0 }} />
          </div>
          <div className="pm-review-side">
            <div className="pm-summary-card">
              <div className="pm-summary-row"><span>Customer</span><b>{effectiveCustomer?.name}</b></div>
              <div className="pm-summary-row"><span>Amount</span><b>{fmt(total)}</b></div>
              <div className="pm-summary-row"><span>Due</span><b>{fmtDate(details.due)}</b></div>
              <div className="pm-summary-row"><span>Payments shown</span><b>M-Pesa Paybill 880321 · QR</b></div>
            </div>
            <div className="pm-send-box">
              <div className="pm-preview-label mb-2">Send options</div>
              {[
                { k: "email", label: "Email", sub: effectiveCustomer?.email || "no email on file", icon: <Mail size={14} /> },
                { k: "wa", label: "WhatsApp", sub: effectiveCustomer?.phone ?? "no phone", icon: <MessageCircle size={14} /> },
                { k: "sms", label: "SMS", sub: "Short message with payment link", icon: <Send size={14} /> },
                { k: "link", label: "Copy link", sub: "Generate shareable payment link", icon: <Link2 size={14} /> },
              ].map((o) => (
                <label key={o.k} className="pm-send-row">
                  <input type="checkbox" checked={sendOpts[o.k as keyof typeof sendOpts] as boolean} onChange={(e) => setSendOpts({ ...sendOpts, [o.k]: e.target.checked })} />
                  <span className="pm-send-ic">{o.icon}</span>
                  <span className="flex-grow-1">
                    <b>{o.label}</b><span className="pm-muted pm-fs-11 d-block">{o.sub}</span>
                  </span>
                </label>
              ))}
              <label className="pm-send-row">
                <input type="checkbox" checked={sendOpts.schedule} onChange={(e) => setSendOpts({ ...sendOpts, schedule: e.target.checked })} />
                <span className="pm-send-ic"><CalendarClock size={14} /></span>
                <span className="flex-grow-1"><b>Schedule send</b><span className="pm-muted pm-fs-11 d-block">Pick a date & time</span></span>
              </label>
              {sendOpts.schedule && (
                <input type="datetime-local" className="form-control form-control-sm pm-input mt-2" value={sendOpts.scheduleAt} onChange={(e) => setSendOpts({ ...sendOpts, scheduleAt: e.target.value })} />
              )}
            </div>
            <div className="pm-cyan-note">💡 {sendOpts.wa ? "WhatsApp delivery includes the PDF — most Kenyan customers open it within an hour." : "Tip: WhatsApp is the most-read channel for invoice PDFs in Kenya."}</div>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════════════ Invoice paper (PDF preview) ═══════════════════════ */

function InvoicePaper({ inv, customer, compact }: { inv: Invoice; customer: Customer; compact?: boolean }) {
  const t = inv.template;
  const accent = t === "Professional" ? "#0f2744" : t === "Retail" ? "#0ea37f" : "#334155";
  const subtotal = inv.lines.reduce((s, l) => s + l.qty * l.price, 0);
  const disc = inv.lines.reduce((s, l) => s + l.disc, 0);
  const tax = inv.lines.reduce((s, l) => s + Math.max(0, l.qty * l.price - l.disc) * (l.tax / 100), 0);
  return (
    <div className={cls("pm-paper", compact && "pm-paper-compact")}>
      <div className="pm-paper-head" style={{ background: t === "Professional" ? `linear-gradient(120deg, ${accent}, #1d4e89)` : t === "Retail" ? `linear-gradient(120deg, #0b8a6b, #0ea37f)` : "#fff", borderBottom: t === "Simple" ? "3px solid #0f2744" : undefined }}>
        <div style={{ color: t === "Simple" ? "#0f2744" : "#fff" }}>
          <div className="pm-paper-logo">TECHSOL<span>LTD</span></div>
          <div className="pm-paper-sub">KRA PIN P0512345678V · Westlands, Nairobi</div>
        </div>
        <div className="text-end" style={{ color: t === "Simple" ? "#0f2744" : "#fff" }}>
          <div className="pm-paper-inv">INVOICE</div>
          <div className="pm-paper-num">{inv.number}</div>
        </div>
      </div>
      <div className="pm-paper-meta">
        <div>
          <div className="pm-paper-mlabel">BILL TO</div>
          <b>{customer.name}</b>
          <div>{customer.business}</div>
          <div>{customer.phone} · {customer.email}</div>
        </div>
        <div className="text-end">
          <div className="pm-paper-mlabel">DETAILS</div>
          <div>Issued: <b>{fmtDate(inv.issue)}</b></div>
          <div>Due: <b>{fmtDate(inv.due)}</b></div>
          <div>Terms: {inv.terms}</div>
          {inv.po && <div>PO: {inv.po}</div>}
        </div>
      </div>
      <table className="pm-paper-table">
        <thead>
          <tr><th>Description</th><th className="t-r">Qty</th><th className="t-r">Unit price</th><th className="t-r">Disc</th><th className="t-r">Amount</th></tr>
        </thead>
        <tbody>
          {inv.lines.map((l, i) => (
            <tr key={i}>
              <td>{l.desc}</td>
              <td className="t-r">{l.qty} {l.unit}</td>
              <td className="t-r">{fmtN(l.price)}</td>
              <td className="t-r">{l.disc ? `−${fmtN(l.disc)}` : "—"}</td>
              <td className="t-r">{fmtN(l.qty * l.price - l.disc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pm-paper-totals">
        <div><span>Subtotal</span><b>{fmt(subtotal)}</b></div>
        {disc > 0 && <div><span>Discount</span><b>− {fmt(disc)}</b></div>}
        <div><span>VAT / Tax</span><b>{fmt(tax)}</b></div>
        <div className="pm-paper-grand"><span>Total due</span><b>{fmt(Math.round(subtotal - disc + tax))}</b></div>
      </div>
      <div className="pm-paper-pay">
        <div className="pm-paper-paytext">
          <b>Pay via M-Pesa</b>
          <div>Paybill <b className="pm-mono">880321</b> · Account <b className="pm-mono">{inv.number}</b></div>
          <div className="pm-paper-note">{inv.notes || "Thank you for your business."}</div>
        </div>
        <QrCode value={`PAYBILL:880321|ACC:${inv.number}|AMT:${inv.amount}`} size={72} />
      </div>
      <div className="pm-paper-foot">Questions? billing@techsol.co.ke · +254 700 123 456 · www.techsol.co.ke</div>
    </div>
  );
}

/* ═══════════════════════ Quick invoice ═══════════════════════ */

function QuickInvoice({ open, onClose, customers, nextNumber, onCreated }: {
  open: boolean; onClose: () => void; customers: Customer[];
  nextNumber: string; onCreated: (inv: Invoice) => void;
}) {
  const [cust, setCust] = useState("");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [sendNow, setSendNow] = useState(true);
  useEffect(() => { if (open) { setCust(""); setDesc(""); setAmount(""); setSendNow(true); } }, [open]);
  const valid = cust && desc.trim() && Number(amount) > 0;
  const submit = () => {
    const inv: Invoice = {
      id: uid("inv"), number: nextNumber, customerId: cust, issue: todayISO(), due: addDays(todayISO(), 14),
      amount: Number(amount), paid: 0, status: sendNow ? "sent" : "draft",
      lines: [{ desc, qty: 1, unit: "pcs", price: Number(amount), tax: 16, disc: 0 }],
      terms: "14 days", notes: `Please pay via M-Pesa Paybill 880321, account ${nextNumber}.`,
      template: "Simple", activity: [{ t: new Date().toISOString(), text: sendNow ? "Quick invoice created & sent" : "Quick invoice saved as draft", kind: "created" }],
      payments: [], viewed: false, reminders: 0,
    };
    onCreated(inv);
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Quick Invoice" title="One-line invoice" subtitle="No line items — just a customer, a description and a total."
      footer={
        <>
          <button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn pm-btn-primary" disabled={!valid} onClick={submit}><Send size={15} /> {sendNow ? "Create & Send" : "Save Draft"}</button>
        </>
      }
    >
      <div className="pm-wizard-grid">
        <Field label="Customer" req>
          <select className="form-select pm-input" value={cust} onChange={(e) => setCust(e.target.value)}>
            <option value="">Select customer…</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.business}</option>)}
          </select>
        </Field>
        <Field label="Description" req><input className="form-control pm-input" placeholder="e.g. Printer setup fee" value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        <Field label="Amount (KES)" req><input type="number" className="form-control pm-input pm-input-lg" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
        <div className="pm-toggle-row"><Toggle on={sendNow} onChange={setSendNow} label="Send immediately after creating" /></div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════ Detail slide-over ═══════════════════════ */

function DetailPanel({ inv, onClose, customer, txs, actions, emit }: {
  inv: Invoice | null; onClose: () => void; customer?: Customer; txs: Tx[];
  actions: { onRemind: (i: Invoice) => void; onDuplicate: (i: Invoice) => void; onCredit: (i: Invoice) => void; onConvert: (i: Invoice) => void; onShare: (i: Invoice) => void; onPrint: (i: Invoice) => void };
  emit: (q: QAction) => void;
}) {
  if (!inv) return null;
  const linked = txs.filter((t) => t.invoice === inv.id);
  const bal = inv.amount - inv.paid;
  const pct = Math.round((inv.paid / inv.amount) * 100);
  return (
    <SlideOver open={!!inv} onClose={onClose} kicker={`Invoice · created ${fmtDate(inv.issue)}`} title={inv.number} width={600}
      footer={
        <>
          <button className="btn pm-btn-soft btn-sm" onClick={() => actions.onRemind(inv)}><MessageCircle size={14} /> Remind</button>
          <button className="btn pm-btn-soft btn-sm" onClick={() => actions.onShare(inv)}><Link2 size={14} /> Share</button>
          <button className="btn pm-btn-soft btn-sm" onClick={() => actions.onPrint(inv)}><Printer size={14} /> PDF</button>
          <button className="btn pm-btn-primary btn-sm" onClick={() => actions.onDuplicate(inv)}><Copy size={14} /> Duplicate</button>
        </>
      }
    >
      <div className="pm-detail-head">
        <div className="d-flex align-items-center gap-3">
          <Avatar name={customer?.name ?? "?"} size={42} />
          <div>
            <div className="fw-bold">{customer?.name}</div>
            <div className="pm-muted pm-fs-12">{customer?.business} · {customer?.phone}</div>
          </div>
          <div className="ms-auto text-end">
            <Badge tone={statusMeta[inv.status].tone} dot>{statusMeta[inv.status].label}</Badge>
            <div className="pm-money-lg mt-1">{fmt(inv.amount)}</div>
          </div>
        </div>
        {inv.status === "partial" && (
          <div className="mt-3">
            <div className="d-flex justify-content-between pm-fs-12 pm-muted mb-1"><span>Paid {fmt(inv.paid)}</span><span>Balance {fmt(bal)}</span></div>
            <div className="progress pm-prog"><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
          </div>
        )}
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Line items</div>
        {inv.lines.map((l, i) => (
          <div className="pm-line-view" key={i}>
            <div className="flex-grow-1">
              <div className="fw-semibold pm-fs-13">{l.desc}</div>
              <div className="pm-muted pm-fs-11">{l.qty} {l.unit} × {fmt(l.price)}{l.tax ? ` · ${l.tax}% VAT` : " · VAT exempt"}{l.disc ? ` · −${fmt(l.disc)}` : ""}</div>
            </div>
            <b className="pm-fs-13">{fmt(l.qty * l.price - l.disc)}</b>
          </div>
        ))}
        <div className="pm-detail-totals">
          <div><span>Subtotal</span><b>{fmt(inv.lines.reduce((s, l) => s + l.qty * l.price, 0))}</b></div>
          <div><span>Tax</span><b>{fmt(inv.lines.reduce((s, l) => s + l.qty * l.price * l.tax / 100, 0))}</b></div>
          <div className="fw-bold"><span>Total</span><b>{fmt(inv.amount)}</b></div>
        </div>
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Payment timeline</div>
        {inv.payments.length === 0 ? (
          <div className="pm-muted pm-fs-13">No payments recorded yet.</div>
        ) : (
          inv.payments.map((p) => (
            <div className="pm-tl-item" key={p.id}>
              <span className="pm-tl-dot pm-tl-dot-pay" />
              <div>
                <div className="fw-semibold pm-fs-13">{fmt(p.amount)} via {p.method}</div>
                <div className="pm-muted pm-fs-11">{fmtDT(p.t)} · ref <span className="pm-mono">{p.ref}</span></div>
              </div>
              <Badge tone={p.status === "settled" ? "success" : "warning"}>{p.status}</Badge>
            </div>
          ))
        )}
        {linked.length > 0 && (
          <div className="pm-tl-item">
            <span className="pm-tl-dot pm-tl-dot-link" />
            <div className="flex-grow-1">
              <div className="fw-semibold pm-fs-13">Linked transactions</div>
              <div className="pm-muted pm-fs-11">
                {linked.map((t) => `${t.ref} (${fmt(t.amount)})`).join(", ")}
              </div>
            </div>
            <button className="pm-link-btn pm-fs-12" onClick={() => { onClose(); emit({ a: "matchTx", p: null }); }}>View matching</button>
          </div>
        )}
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Activity log</div>
        {[...inv.activity].reverse().map((a, i) => (
          <div className="pm-tl-item" key={i}>
            <span className={cls("pm-tl-dot", a.kind === "paid" && "pm-tl-dot-pay", a.kind === "reminder" && "pm-tl-dot-rem", a.kind === "viewed" && "pm-tl-dot-view", a.kind === "sent" && "pm-tl-dot-sent")} />
            <div>
              <div className="pm-fs-13">{a.text}</div>
              <div className="pm-muted pm-fs-11">{fmtDT(a.t)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pm-detail-actions">
        <button className="pm-action-tile" onClick={() => actions.onRemind(inv)}><MessageCircle size={16} /><span>Send reminder</span></button>
        <button className="pm-action-tile" onClick={() => actions.onCredit(inv)}><CalendarX2 size={16} /><span>Credit note</span></button>
        <button className="pm-action-tile" onClick={() => actions.onConvert(inv)}><RefreshCw size={16} /><span>Recurring</span></button>
        <button className="pm-action-tile" onClick={() => actions.onShare(inv)}><Link2 size={16} /><span>Share link</span></button>
      </div>
    </SlideOver>
  );
}

/* ═══════════════════════ Reminder ═══════════════════════ */

function ReminderModal({ inv, onClose, notify, appendActivity }: {
  inv: Invoice | null; onClose: () => void; notify: Notify;
  appendActivity: (id: string, text: string, kind: "reminder") => void;
}) {
  const [channel, setChannel] = useState("whatsapp");
  const [tmpl, setTmpl] = useState("friendly");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (inv) {
      const t = reminderTemplates.find((x) => x.id === "friendly")!;
      setTmpl("friendly");
      setMsg(t.body.replace("{name}", "CUSTOMER").split("{inv}").join(inv.number).replace("{amount}", fmt(inv.amount)).replace("{due}", fmtDate(inv.due)).replace("{days}", "12"));
      setChannel("whatsapp");
    }
  }, [inv]);
  if (!inv) return null;
  const pick = (id: string) => {
    setTmpl(id);
    const t = reminderTemplates.find((x) => x.id === id)!;
    setMsg(t.body.replace("{name}", "CUSTOMER").split("{inv}").join(inv.number).replace("{amount}", fmt(inv.amount)).replace("{due}", fmtDate(inv.due)).replace("{days}", "12"));
  };
  const send = () => {
    appendActivity(inv.id, `Reminder sent via ${channel === "whatsapp" ? "WhatsApp" : channel === "sms" ? "SMS" : "Email"} (${reminderTemplates.find((t) => t.id === tmpl)?.label})`, "reminder");
    notify({ tone: "success", title: "Reminder sent", body: `${inv.number} reminder delivered via ${channel}.` });
    onClose();
  };
  return (
    <Modal open={!!inv} onClose={onClose} kicker="Dunning" title={`Remind customer — ${inv.number}`} subtitle={`Balance due: ${fmt(inv.amount - inv.paid)}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={send}><Send size={15} /> Send reminder</button></>}
    >
      <Field label="Channel">
        <div className="pm-mode-tabs">
          <button className={cls("pm-mode-tab", channel === "whatsapp" && "pm-mode-on")} onClick={() => setChannel("whatsapp")}><MessageCircle size={13} /> WhatsApp</button>
          <button className={cls("pm-mode-tab", channel === "sms" && "pm-mode-on")} onClick={() => setChannel("sms")}><Send size={13} /> SMS</button>
          <button className={cls("pm-mode-tab", channel === "email" && "pm-mode-on")} onClick={() => setChannel("email")}><Mail size={13} /> Email</button>
        </div>
      </Field>
      <Field label="Template">
        <div className="pm-mode-tabs">
          {reminderTemplates.map((t) => (
            <button key={t.id} className={cls("pm-mode-tab", tmpl === t.id && "pm-mode-on")} onClick={() => pick(t.id)}>{t.label}</button>
          ))}
        </div>
      </Field>
      <Field label="Message preview">
        <textarea className="form-control pm-input pm-mono pm-fs-13" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} />
      </Field>
    </Modal>
  );
}

/* ═══════════════════════ Credit note ═══════════════════════ */

function CreditNoteModal({ inv, onClose, notify, setInvoices }: {
  inv: Invoice | null; onClose: () => void; notify: Notify;
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
}) {
  const [reason, setReason] = useState("Disputed");
  const [amount, setAmount] = useState("");
  useEffect(() => { if (inv) setAmount(String(inv.amount - inv.paid)); }, [inv]);
  if (!inv) return null;
  const issue = () => {
    setInvoices((xs) => xs.map((i) => i.id === inv.id ? {
      ...i, status: "cancelled", creditNote: true,
      activity: [...i.activity,
        { t: new Date().toISOString(), text: `Credit note CN-${String(42 + xs.length)} issued — ${reason}`, kind: "note" },
        { t: new Date().toISOString(), text: "Invoice cancelled", kind: "system" }],
    } : i));
    notify({ tone: "success", title: "Credit note issued", body: `CN created for ${fmt(Number(amount) || 0)} on ${inv.number}. Flagged for accountant review.` });
    onClose();
  };
  return (
    <Modal open={!!inv} onClose={onClose} kicker="Credit Note" title={`Credit note on ${inv.number}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-danger" onClick={issue}>Issue credit note</button></>}
    >
      <Field label="Reason">
        <select className="form-select pm-input" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option>Disputed</option><option>Customer insolvent</option><option>Error</option><option>Goodwill adjustment</option><option>Other</option>
        </select>
      </Field>
      <Field label="Credit amount (KES)"><input type="number" className="form-control pm-input" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
      <div className="pm-cyan-note">This offsets the receivable by <b>{fmt(Number(amount) || 0)}</b>, cancels the invoice, and creates a bad-debt/contra entry for your accountant's review.</div>
    </Modal>
  );
}

/* ═══════════════════════ Convert to recurring ═══════════════════════ */

function ConvertModal({ inv, onClose, notify, onAddRecurring }: {
  inv: Invoice | null; onClose: () => void; notify: Notify;
  onAddRecurring: (r: Omit<Recurring, "id" | "lifetime" | "count" | "onTime" | "failures">) => void;
}) {
  const [freq, setFreq] = useState("Monthly");
  const [next, setNext] = useState(addDays(todayISO(), 30));
  const [channel, setChannel] = useState("Email + WhatsApp");
  if (!inv) return null;
  const create = () => {
    onAddRecurring({ customerId: inv.customerId, amount: inv.amount, freq, next, status: "active", channel, start: todayISO() });
    notify({ tone: "success", title: "Recurring schedule created", body: `${inv.number} will regenerate ${freq.toLowerCase()} starting ${fmtDate(next)}.` });
    onClose();
  };
  return (
    <Modal open={!!inv} onClose={onClose} kicker="Recurring Invoices" title={`Convert ${inv.number} to recurring`} subtitle="The line items become the recurring template."
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={create}><RefreshCw size={15} /> Create recurring</button></>}
    >
      <div className="pm-summary-card mb-3">
        <div className="pm-summary-row"><span>Customer</span><b>{inv.customerId}</b></div>
        <div className="pm-summary-row"><span>Amount per cycle</span><b>{fmt(inv.amount)}</b></div>
      </div>
      <div className="row g-3">
        <div className="col-6"><Field label="Frequency"><select className="form-select pm-input" value={freq} onChange={(e) => setFreq(e.target.value)}><option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>Yearly</option></select></Field></div>
        <div className="col-6"><Field label="First invoice date"><input type="date" className="form-control pm-input" value={next} onChange={(e) => setNext(e.target.value)} /></Field></div>
        <div className="col-12"><Field label="Delivery channel"><select className="form-select pm-input" value={channel} onChange={(e) => setChannel(e.target.value)}><option>Email + WhatsApp</option><option>Email only</option><option>WhatsApp only</option><option>SMS + link</option></select></Field></div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════ Share modal ═══════════════════════ */

function ShareModal({ inv, onClose, notify }: { inv: Invoice | null; onClose: () => void; notify: Notify }) {
  const [copied, setCopied] = useState(false);
  if (!inv) return null;
  const url = `https://pay.link/p/tsl/${inv.number.toLowerCase()}`;
  const doCopy = async () => { await copyText(url); setCopied(true); notify({ tone: "info", title: "Payment link copied" }); window.setTimeout(() => setCopied(false), 2000); };
  return (
    <Modal open={!!inv} onClose={onClose} kicker="Payment Link" title={`Share ${inv.number}`} subtitle="The customer pays directly from this link — no app needed."
      footer={<button className="btn pm-btn-primary w-100" onClick={() => { onClose(); }}>Done</button>}
    >
      <div className="d-flex gap-3 align-items-center mb-3 flex-wrap">
        <QrCode value={`PAYLINK:${url}`} size={120} />
        <div className="flex-grow-1">
          <div className="pm-muted pm-fs-12">Shareable payment link</div>
          <div className="pm-copy-line">
            <span className="pm-mono pm-fs-13 text-truncate">{url}</span>
            <button className="pm-link-btn" onClick={doCopy}>{copied ? "✓ Copied" : "Copy"}</button>
          </div>
          <div className="pm-muted pm-fs-12 mt-1">Balance due: <b>{fmt(inv.amount - inv.paid)}</b></div>
        </div>
      </div>
      <div className="d-flex gap-2 flex-wrap">
        <button className="btn pm-btn-soft btn-sm" onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(`Hello! Please pay invoice ${inv.number} here: ${url}`)}`, "_blank"); notify({ tone: "info", title: "WhatsApp opened", body: "Pre-filled message ready to send." }); }}>
          <MessageCircle size={14} /> WhatsApp
        </button>
        <button className="btn pm-btn-soft btn-sm" onClick={() => { window.location.href = `sms:?body=${encodeURIComponent(`Pay invoice ${inv.number}: ${url}`)}`; notify({ tone: "info", title: "SMS drafted" }); }}>
          <Send size={14} /> SMS
        </button>
        <button className="btn pm-btn-soft btn-sm" onClick={() => { window.location.href = `mailto:?subject=${encodeURIComponent(`Invoice ${inv.number} from TechSol Ltd`)}&body=${encodeURIComponent(url)}`; notify({ tone: "info", title: "Email drafted" }); }}>
          <Mail size={14} /> Email
        </button>
      </div>
    </Modal>
  );
}

/* ═══════════════════════ Schedule modal ═══════════════════════ */

function ScheduleModal({ inv, onClose, notify, appendActivity }: {
  inv: Invoice | null; onClose: () => void; notify: Notify;
  appendActivity: (id: string, text: string, kind: "system") => void;
}) {
  const [when, setWhen] = useState("");
  if (!inv) return null;
  return (
    <Modal open={!!inv} onClose={onClose} kicker="Schedule" title={`Schedule ${inv.number}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn pm-btn-primary" disabled={!when} onClick={() => { appendActivity(inv.id, `Delivery scheduled for ${when.replace("T", " ")}`, "system"); notify({ tone: "success", title: "Send scheduled", body: `${inv.number} will go out at ${when.replace("T", " ")}.` }); onClose(); }}><CalendarClock size={15} /> Schedule</button></>}
    >
      <Field label="Delivery date & time"><input type="datetime-local" className="form-control pm-input" value={when} onChange={(e) => setWhen(e.target.value)} /></Field>
      <div className="pm-note">Best-practice: schedule invoice emails for 8–9 AM when customers check their phones.</div>
    </Modal>
  );
}

/* ═══════════════════════ Export modal ═══════════════════════ */

function ExportModal({ open, onClose, invoices, exportRows, notify }: {
  open: boolean; onClose: () => void; invoices: Invoice[]; exportRows: (rows: Invoice[]) => void; notify: Notify;
}) {
  const [range, setRange] = useState("current");
  const [fmtSel, setFmtSel] = useState("csv");
  const doExport = () => {
    if (fmtSel === "csv") { exportRows(invoices); onClose(); }
    else { notify({ tone: "success", title: "PDF export requested", body: `${invoices.length} invoice(s) will be emailed to billing@techsol.co.ke within 2 minutes.` }); onClose(); }
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Export" title="Export invoices"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={doExport}><Download size={15} /> {fmtSel === "csv" ? "Download CSV" : "Request PDFs"}</button></>}
    >
      <Field label="Range">
        <select className="form-select pm-input" value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="current">Current view ({invoices.length} invoice(s))</option>
          <option value="month">This month</option>
          <option value="quarter">This quarter</option>
          <option value="all">All time</option>
        </select>
      </Field>
      <Field label="Format">
        <div className="pm-radio-grid">
          <button className={cls("pm-radio-card", fmtSel === "csv" && "pm-radio-on")} onClick={() => setFmtSel("csv")}>
            <b>CSV spreadsheet</b><span>Instant download — opens in Excel / Sheets</span>
          </button>
          <button className={cls("pm-radio-card", fmtSel === "pdf" && "pm-radio-on")} onClick={() => setFmtSel("pdf")}>
            <b>PDF bundle</b><span>Zipped PDFs emailed to you (2 min)</span>
          </button>
        </div>
      </Field>
      <div className="pm-note">{invoices.length} invoice(s) will be exported with customer, amount, status, dates and payments.</div>
    </Modal>
  );
}

/* ═══════════════════════ New customer ═══════════════════════ */

function NewCustomerModal({ open, onClose, setCustomers, notify }: {
  open: boolean; onClose: () => void; setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>; notify: Notify;
}) {
  const [f, setF] = useState({ name: "", business: "", phone: "", email: "", pin: "" });
  useEffect(() => { if (open) setF({ name: "", business: "", phone: "", email: "", pin: "" }); }, [open]);
  const valid = f.name && f.phone;
  return (
    <Modal open={open} onClose={onClose} kicker="Customers & CRM" title="New customer"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn pm-btn-primary" disabled={!valid} onClick={() => { setCustomers((cs) => [...cs, { id: uid("c"), name: f.name, business: f.business || f.name, phone: f.phone, email: f.email, pin: f.pin || "PENDING", balance: 0, avgDays: 0 }]); notify({ tone: "success", title: "Customer created", body: `${f.name} added to CRM.` }); onClose(); }}><UserPlus size={15} /> Save customer</button></>}
    >
      <div className="row g-3">
        <div className="col-md-6"><Field label="Full name" req><input className="form-control pm-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field></div>
        <div className="col-md-6"><Field label="Business name"><input className="form-control pm-input" value={f.business} onChange={(e) => setF({ ...f, business: e.target.value })} /></Field></div>
        <div className="col-md-6"><Field label="Phone" req><input className="form-control pm-input" placeholder="07XX XXX XXX" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field></div>
        <div className="col-md-6"><Field label="Email"><input className="form-control pm-input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field></div>
        <div className="col-12"><Field label="KRA PIN"><input className="form-control pm-input" value={f.pin} onChange={(e) => setF({ ...f, pin: e.target.value })} /></Field></div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════ PDF preview modal ═══════════════════════ */

function PdfModal({ inv, onClose, customer, notify, printInvoice }: {
  inv: Invoice | null; onClose: () => void; customer?: Customer; notify: Notify; printInvoice: (i: Invoice) => void;
}) {
  if (!inv) return null;
  return (
    <Modal open={!!inv} onClose={onClose} kicker="Invoice PDF" title={`${inv.number} — customer view`} size="lg"
      footer={<>
        <button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
        <button className="btn pm-btn-soft" onClick={() => notify({ tone: "info", title: "Share link opened", body: "Use the Share action to copy the payment link." })}><Link2 size={15} /> Share</button>
        <button className="btn pm-btn-primary" onClick={() => printInvoice(inv)}><Printer size={15} /> Print / Save PDF</button>
      </>}
    >
      <div className="pm-paper-scroll">
        <InvoicePaper inv={inv} customer={customer ?? { id: "x", name: "—", business: "", phone: "", email: "", pin: "", balance: 0, avgDays: 0 }} />
      </div>
    </Modal>
  );
}
