import { useEffect, useMemo, useState } from "react";
import {
  BookOpen, Plus, Search, Trash2, CheckCircle2, Paperclip, Scale, Layers,
  ArrowUpRight, FileText, Copy,
} from "lucide-react";
import type { CoaAccount, JournalEntry, JournalLine } from "../../dataBooks";
import { cls, downloadCSV, fmt, fmtDate, todayISO, uid, type QAction } from "../../lib";
import { Badge, EmptyState, Field, Kpi, Modal, PillTabs, Section, SlideOver, Stepper } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

const TEMPLATES = [
  { id: "dep", name: "Depreciation", desc: "Debit depreciation expense, credit accumulated depreciation", lines: [{ coa: "c6080", debit: 18500, credit: 0, memo: "Depreciation expense" }, { coa: "c1500", debit: 0, credit: 18500, memo: "Accumulated depreciation" }] },
  { id: "accrual", name: "Accrual", desc: "Recognise an expense before the bill arrives", lines: [{ coa: "c6010", debit: 0, credit: 0, memo: "Accrued expense" }, { coa: "c2000", debit: 0, credit: 0, memo: "Accruals payable" }] },
  { id: "prepay", name: "Prepayment release", desc: "Move prepaid cost into the period", lines: [{ coa: "c6040", debit: 0, credit: 0, memo: "Expense for period" }, { coa: "c1200", debit: 0, credit: 0, memo: "Release prepayment" }] },
  { id: "baddebt", name: "Bad debt write-off", desc: "Clear an uncollectible receivable", lines: [{ coa: "c6900", debit: 0, credit: 0, memo: "Bad debt expense" }, { coa: "c1100", debit: 0, credit: 0, memo: "Clear receivable" }] },
  { id: "owner", name: "Owner contribution", desc: "Capital injected by the owner", lines: [{ coa: "c1000", debit: 0, credit: 0, memo: "Cash received" }, { coa: "c3000", debit: 0, credit: 0, memo: "Owner's equity" }] },
  { id: "blank", name: "Blank entry", desc: "Start from scratch", lines: [{ coa: "", debit: 0, credit: 0, memo: "" }, { coa: "", debit: 0, credit: 0, memo: "" }] },
];

export default function Journals({ journals, setJournals, coa, notify, emit, qa, onConsume }: {
  journals: JournalEntry[];
  setJournals: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  coa: CoaAccount[];
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [wizard, setWizard] = useState(false);
  const [detail, setDetail] = useState<JournalEntry | null>(null);
  const [ledgerFor, setLedgerFor] = useState<CoaAccount | null>(null);
  const [ledgerOpen, setLedgerOpen] = useState(false);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "newJournal") setWizard(true);
    if (qa.a === "ledger") setLedgerOpen(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const nameOf = (id: string) => coa.find((c) => c.id === id)?.name ?? id;
  const codeOf = (id: string) => coa.find((c) => c.id === id)?.code ?? "";

  const list = useMemo(() => {
    let rows = journals;
    if (tab !== "all") rows = rows.filter((j) => (tab === "draft" ? j.status === "draft" : tab === "posted" ? j.status === "posted" : j.source === tab));
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      rows = rows.filter((j) => j.narration.toLowerCase().includes(s) || j.number.toLowerCase().includes(s));
    }
    return rows;
  }, [journals, tab, q]);

  const posted = journals.filter((j) => j.status === "posted");
  const totalDebits = posted.reduce((s, j) => s + j.lines.reduce((x, l) => x + l.debit, 0), 0);

  return (
    <>
      <Section
        no="4.3" sub="Your Business · Double Entry" id="sec-journals"
        title="General Ledger & Journal Entries"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setLedgerOpen(true)}><Layers size={15} /> Browse Ledger</button>
            <button className="btn pm-btn-violet" onClick={() => setWizard(true)}><Plus size={15} /> New Journal Entry</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<BookOpen size={16} />} label="Journal entries" value={`${journals.length} entries`} delta={`${journals.filter((j) => j.status === "draft").length} draft`} sub="this financial year" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Scale size={16} />} label="Total debits posted" value={fmt(totalDebits)} delta="= credits ✓" sub="ledger is in balance" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Layers size={16} />} label="Ledger accounts" value={`${coa.length} accounts`} delta="all reconciled" sub="chart of accounts" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<FileText size={16} />} label="Auto-generated" value={`${journals.filter((j) => j.source === "auto").length} entries`} delta="payroll + VAT" sub="posted by the system" /></div>
        </div>

        <div className="pm-card">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between px-1 pt-1">
            <PillTabs
              tabs={[
                { id: "all", label: "All", count: journals.length },
                { id: "posted", label: "Posted", count: posted.length },
                { id: "draft", label: "Draft", count: journals.filter((j) => j.status === "draft").length, tone: "warning" },
                { id: "adjustment", label: "Adjustments", count: journals.filter((j) => j.source === "adjustment").length },
                { id: "auto", label: "Automatic", count: journals.filter((j) => j.source === "auto").length },
              ]}
              active={tab}
              onChange={setTab}
            />
            <div className="pm-search"><Search size={15} /><input placeholder="Search narration or JE number…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          </div>
          <div className="table-responsive mt-2">
            <table className="table pm-table align-middle mb-0">
              <thead><tr><th>JE #</th><th>Narration</th><th>Date</th><th>Source</th><th className="text-end">Amount</th><th>Status</th><th className="text-end" /></tr></thead>
              <tbody>
                {list.length === 0 && <tr><td colSpan={7}><EmptyState icon={<BookOpen size={26} />} title="No journal entries" body="Post an adjustment or change the filter." action={<button className="btn pm-btn-violet btn-sm" onClick={() => setWizard(true)}><Plus size={14} /> New Journal Entry</button>} /></td></tr>}
                {list.map((j) => {
                  const amt = j.lines.reduce((s, l) => s + l.debit, 0);
                  return (
                    <tr key={j.id} className="pm-click-row" onClick={() => setDetail(j)}>
                      <td className="pm-mono pm-fs-13 fw-bold">{j.number}</td>
                      <td className="pm-fs-13">{j.narration}{j.attachment && <Paperclip size={11} className="ms-1 pm-muted" />}</td>
                      <td className="pm-muted pm-fs-12">{fmtDate(j.date)}</td>
                      <td><Badge tone={j.source === "auto" ? "info" : j.source === "adjustment" ? "warning" : j.source === "closing" ? "muted" : "success"}>{j.source}</Badge></td>
                      <td className="text-end fw-bold pm-fs-13">{fmt(amt)}</td>
                      <td>{j.status === "posted" ? <Badge tone="success">Posted</Badge> : <Badge tone="warning" dot>Draft</Badge>}</td>
                      <td className="text-end"><button className="pm-link-btn pm-fs-12" onClick={(e) => { e.stopPropagation(); setDetail(j); }}>View →</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pm-table-foot">
            <span className="pm-muted pm-fs-12">Every entry is immutable once posted — corrections are made with a reversing entry.</span>
            <button className="pm-link-btn pm-fs-12" onClick={() => emit({ a: "report", p: "tb" })}>Open trial balance →</button>
          </div>
        </div>
      </Section>

      {/* ── journal wizard ── */}
      <JournalWizard open={wizard} onClose={() => setWizard(false)} coa={coa} notify={notify}
        nextNumber={`JE-${String(105 + journals.length).padStart(4, "0")}`}
        onCreate={(j) => setJournals((js) => [j, ...js])} />

      {/* ── journal detail ── */}
      <JournalDetail j={detail} onClose={() => setDetail(null)} nameOf={nameOf} codeOf={codeOf} notify={notify}
        onPost={(id) => { setJournals((js) => js.map((x) => (x.id === id ? { ...x, status: "posted" } : x))); notify({ tone: "success", title: "Journal posted", body: "The entry now affects your reports and trial balance." }); setDetail(null); }}
        onReverse={(j) => {
          const rev: JournalEntry = { ...j, id: uid("je"), number: `JE-${String(200 + journals.length)}`, date: todayISO(), narration: `Reversal of ${j.number} — ${j.narration}`, lines: j.lines.map((l) => ({ ...l, debit: l.credit, credit: l.debit })), source: "adjustment", status: "posted", createdBy: "Wanjiru K." };
          setJournals((js) => [rev, ...js]);
          notify({ tone: "success", title: "Reversing entry posted", body: `${rev.number} cancels ${j.number}.` });
          setDetail(null);
        }}
      />

      {/* ── ledger browser ── */}
      <LedgerModal open={ledgerOpen} onClose={() => setLedgerOpen(false)} coa={coa} journals={journals} notify={notify}
        onPick={(a) => { setLedgerOpen(false); setLedgerFor(a); }} />
      <LedgerDetail a={ledgerFor} onClose={() => setLedgerFor(null)} journals={journals} nameOf={nameOf} notify={notify} />
    </>
  );
}

/* ── journal wizard (3 steps) ── */

function JournalWizard({ open, onClose, coa, notify, nextNumber, onCreate }: {
  open: boolean; onClose: () => void; coa: CoaAccount[]; notify: Notify; nextNumber: string;
  onCreate: (j: JournalEntry) => void;
}) {
  const [step, setStep] = useState(1);
  const [tmpl, setTmpl] = useState("blank");
  const [date, setDate] = useState(todayISO());
  const [narration, setNarration] = useState("");
  const [lines, setLines] = useState<JournalLine[]>([{ coa: "", debit: 0, credit: 0, memo: "" }, { coa: "", debit: 0, credit: 0, memo: "" }]);
  const [attachment, setAttachment] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1); setTmpl("blank"); setDate(todayISO()); setNarration(""); setAttachment(null);
    setLines([{ coa: "", debit: 0, credit: 0, memo: "" }, { coa: "", debit: 0, credit: 0, memo: "" }]);
  }, [open]);

  const pickTemplate = (id: string) => {
    setTmpl(id);
    const t = TEMPLATES.find((x) => x.id === id)!;
    setLines(t.lines.map((l) => ({ ...l })));
    if (id !== "blank") setNarration(t.name + " — " + new Date().toLocaleDateString("en-KE", { month: "long", year: "numeric" }));
  };

  const totalDr = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCr = lines.reduce((s, l) => s + (l.credit || 0), 0);
  const balanced = totalDr > 0 && Math.abs(totalDr - totalCr) < 0.5;
  const setLine = (i: number, p: Partial<JournalLine>) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...p } : l)));
  const validLines = lines.filter((l) => l.coa && (l.debit || l.credit)).length >= 2;

  const post = (status: "posted" | "draft") => {
    onCreate({
      id: uid("je"), number: nextNumber, date, narration: narration || "Journal entry",
      lines: lines.filter((l) => l.coa && (l.debit || l.credit)),
      source: tmpl === "blank" ? "manual" : "adjustment", status, createdBy: "Wanjiru K.",
      attachment: attachment ?? undefined,
    });
    notify({ tone: status === "posted" ? "success" : "info", title: status === "posted" ? "Journal posted" : "Draft saved", body: `${nextNumber} · ${fmt(totalDr)} — ${status === "posted" ? "reports updated instantly" : "post it when you're ready"}.` });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} kicker="Double Entry" title="New journal entry" size="xl"
      footer={
        <>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 3 && <button className="btn pm-btn-violet" disabled={step === 2 && !validLines} onClick={() => setStep(step + 1)}>Continue →</button>}
          {step === 3 && (
            <>
              <button className="btn pm-btn-soft" onClick={() => post("draft")}><FileText size={15} /> Save as draft</button>
              <button className="btn pm-btn-violet" disabled={!balanced} onClick={() => post("posted")}><CheckCircle2 size={15} /> Post entry</button>
            </>
          )}
        </>
      }
    >
      <Stepper steps={3} current={step} labels={["Template", "Debits & credits", "Review & post"]} />
      {step === 1 && (
        <div>
          <div className="pm-wizard-hint">Start from a common adjustment or build your own. Templates pre-fill the correct accounts.</div>
          <div className="pm-preset-grid">
            {TEMPLATES.map((t) => (
              <button key={t.id} className={cls("pm-preset-card", tmpl === t.id && "pm-preset-on")} onClick={() => pickTemplate(t.id)}>
                <span className="pm-acc-ic pm-acc-ic-virtual"><BookOpen size={15} /></span>
                <b>{t.name}</b>
                <span>{t.desc}</span>
              </button>
            ))}
          </div>
          <div className="row g-3 mt-1">
            <div className="col-md-4"><Field label="Entry date"><input type="date" className="form-control pm-input" value={date} onChange={(e) => setDate(e.target.value)} /></Field></div>
            <div className="col-md-8"><Field label="Narration" hint="Explain the why — auditors read this first."><input className="form-control pm-input" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="e.g. Accrue March rent — Cedar Properties" /></Field></div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="pm-lines">
            <div className="pm-je-head">
              <span>Account</span><span>Memo</span><span>Debit</span><span>Credit</span><span />
            </div>
            {lines.map((l, i) => (
              <div className="pm-je-row" key={i}>
                <select className="form-select form-select-sm pm-input" value={l.coa} onChange={(e) => setLine(i, { coa: e.target.value })}>
                  <option value="">Choose account…</option>
                  {coa.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.name}</option>)}
                </select>
                <input className="form-control form-control-sm pm-input" placeholder="Memo" value={l.memo} onChange={(e) => setLine(i, { memo: e.target.value })} />
                <input type="number" className="form-control form-control-sm pm-input text-end" value={l.debit || ""} onChange={(e) => setLine(i, { debit: Number(e.target.value), credit: 0 })} />
                <input type="number" className="form-control form-control-sm pm-input text-end" value={l.credit || ""} onChange={(e) => setLine(i, { credit: Number(e.target.value), debit: 0 })} />
                <button className="pm-icon-btn pm-icon-danger" disabled={lines.length <= 2} onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
          <div className="d-flex gap-2 mt-2">
            <button className="btn pm-btn-soft btn-sm" onClick={() => setLines((ls) => [...ls, { coa: "", debit: 0, credit: 0, memo: "" }])}><Plus size={13} /> Add line</button>
            <button className="btn pm-btn-ghost btn-sm" onClick={() => { setAttachment("supporting-doc.pdf"); notify({ tone: "info", title: "Document attached", body: "supporting-doc.pdf linked to this journal." }); }}><Paperclip size={13} /> {attachment ?? "Attach support"}</button>
          </div>
          <div className={cls("pm-je-balance", balanced ? "pm-je-ok" : "pm-je-bad")}>
            <span>Total debits <b>{fmt(totalDr)}</b></span>
            <span>Total credits <b>{fmt(totalCr)}</b></span>
            <span className="pm-je-diff">{balanced ? "✓ Balanced" : `Out of balance by ${fmt(Math.abs(totalDr - totalCr))}`}</span>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <div className="pm-je-paper">
            <div className="pm-je-paper-head">
              <div><b>{nextNumber}</b><span className="pm-muted pm-fs-12 d-block">{fmtDate(date)} · TechSol Ltd</span></div>
              <Badge tone={balanced ? "success" : "danger"}>{balanced ? "Balanced" : "Out of balance"}</Badge>
            </div>
            <div className="pm-je-narration">{narration || "—"}</div>
            <table className="table pm-table mb-0">
              <thead><tr><th>Account</th><th>Memo</th><th className="text-end">Debit</th><th className="text-end">Credit</th></tr></thead>
              <tbody>
                {lines.filter((l) => l.coa).map((l, i) => (
                  <tr key={i}>
                    <td className="pm-fs-13"><b className="pm-mono">{coa.find((c) => c.id === l.coa)?.code}</b> {coa.find((c) => c.id === l.coa)?.name}</td>
                    <td className="pm-muted pm-fs-12">{l.memo}</td>
                    <td className="text-end pm-fs-13">{l.debit ? fmt(l.debit) : "—"}</td>
                    <td className="text-end pm-fs-13">{l.credit ? fmt(l.credit) : "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="pm-tot-row"><td colSpan={2}>Totals</td><td className="text-end fw-bold">{fmt(totalDr)}</td><td className="text-end fw-bold">{fmt(totalCr)}</td></tr></tfoot>
            </table>
          </div>
          {!balanced && <div className="pm-warn-chip mt-2">Debits must equal credits before posting. Go back and fix the difference.</div>}
          {attachment && <div className="pm-evidence mt-2"><Paperclip size={14} /> {attachment}</div>}
        </div>
      )}
    </Modal>
  );
}

/* ── journal detail ── */

function JournalDetail({ j, onClose, nameOf, codeOf, notify, onPost, onReverse }: {
  j: JournalEntry | null; onClose: () => void; nameOf: (id: string) => string; codeOf: (id: string) => string;
  notify: Notify; onPost: (id: string) => void; onReverse: (j: JournalEntry) => void;
}) {
  if (!j) return null;
  const dr = j.lines.reduce((s, l) => s + l.debit, 0);
  return (
    <SlideOver open={!!j} onClose={onClose} kicker={`${j.source} · ${j.createdBy}`} title={j.number} width={560}
      footer={
        <>
          {j.status === "draft" && <button className="btn pm-btn-violet btn-sm" onClick={() => onPost(j.id)}><CheckCircle2 size={14} /> Post entry</button>}
          {j.status === "posted" && <button className="btn pm-btn-soft btn-sm" onClick={() => onReverse(j)}><Copy size={14} /> Post reversal</button>}
          <button className="btn pm-btn-ghost btn-sm" onClick={() => { downloadCSV(`${j.number}.csv`, [["Account", "Memo", "Debit", "Credit"], ...j.lines.map((l) => [`${codeOf(l.coa)} ${nameOf(l.coa)}`, l.memo, l.debit, l.credit])]); notify({ tone: "success", title: "Journal exported", body: `${j.number}.csv downloaded.` }); }}>Export</button>
        </>
      }
    >
      <div className="pm-detail-head">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="fw-bold">{j.narration}</div>
            <div className="pm-muted pm-fs-12">{fmtDate(j.date)} · posted by {j.createdBy}</div>
          </div>
          <Badge tone={j.status === "posted" ? "success" : "warning"} dot>{j.status}</Badge>
        </div>
        <div className="pm-money-lg mt-2">{fmt(dr)}</div>
      </div>
      <div className="pm-detail-section">
        <div className="pm-preview-label">Lines</div>
        {j.lines.map((l, i) => (
          <div className="pm-line-view" key={i}>
            <div className="flex-grow-1">
              <div className="fw-semibold pm-fs-13"><span className="pm-mono">{codeOf(l.coa)}</span> {nameOf(l.coa)}</div>
              <div className="pm-muted pm-fs-11">{l.memo}</div>
            </div>
            <div className="text-end">
              {l.debit ? <b className="pm-fs-13 t-success">Dr {fmt(l.debit)}</b> : <b className="pm-fs-13 t-danger">Cr {fmt(l.credit)}</b>}
            </div>
          </div>
        ))}
      </div>
      {j.attachment && (
        <div className="pm-detail-section">
          <div className="pm-preview-label">Supporting document</div>
          <div className="pm-evidence"><Paperclip size={14} /> {j.attachment}<button className="pm-link-btn ms-auto" onClick={() => notify({ tone: "info", title: "Document opened", body: `${j.attachment} (demo preview).` })}>View</button></div>
        </div>
      )}
      <div className="pm-cyan-note">Posted entries are immutable. To correct one, post a reversing entry — that's what auditors expect to see.</div>
    </SlideOver>
  );
}

/* ── ledger browser ── */

function LedgerModal({ open, onClose, coa, journals, notify, onPick }: {
  open: boolean; onClose: () => void; coa: CoaAccount[]; journals: JournalEntry[]; notify: Notify;
  onPick: (a: CoaAccount) => void;
}) {
  const [q, setQ] = useState("");
  const rows = coa.filter((c) => !q || (c.name + c.code).toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal open={open} onClose={onClose} kicker="General Ledger" title="Browse ledger accounts" subtitle="Drill into any account to see every posting." size="lg"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
        <button className="btn pm-btn-soft" onClick={() => { downloadCSV(`general-ledger-${todayISO()}.csv`, [["Code", "Account", "Type", "Balance", "Transactions"], ...coa.map((c) => [c.code, c.name, c.type, c.balance, c.txCount])]); notify({ tone: "success", title: "Ledger exported", body: "general-ledger.csv downloaded." }); }}>Export ledger</button></>}
    >
      <div className="pm-search mb-2 w-100"><Search size={15} /><input placeholder="Search account…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="pm-select-list">
        {rows.map((c) => (
          <button key={c.id} className="pm-check-list-item" onClick={() => onPick(c)}>
            <span className="pm-mono pm-fs-13 fw-bold" style={{ width: 46 }}>{c.code}</span>
            <span className="flex-grow-1 text-start">
              <b className="pm-fs-13">{c.name}</b>
              <span className="pm-muted pm-fs-11 d-block">{c.type} · {c.txCount} postings · {journals.filter((j) => j.lines.some((l) => l.coa === c.id)).length} journal(s)</span>
            </span>
            <b className="pm-fs-13">{fmt(c.balance)}</b>
            <ArrowUpRight size={14} className="pm-muted" />
          </button>
        ))}
      </div>
    </Modal>
  );
}

function LedgerDetail({ a, onClose, journals, notify }: {
  a: CoaAccount | null; onClose: () => void; journals: JournalEntry[]; nameOf?: (id: string) => string; notify: Notify;
}) {
  if (!a) return null;
  const postings = journals.flatMap((j) => j.lines.filter((l) => l.coa === a.id).map((l) => ({ j, l })));
  let running = 0;
  return (
    <SlideOver open={!!a} onClose={onClose} kicker="Ledger Account" title={`${a.code} · ${a.name}`} width={560}
      footer={<button className="btn pm-btn-violet btn-sm w-100" onClick={() => { downloadCSV(`ledger-${a.code}.csv`, [["JE", "Date", "Memo", "Debit", "Credit"], ...postings.map((p) => [p.j.number, p.j.date, p.l.memo, p.l.debit, p.l.credit])]); notify({ tone: "success", title: "Account ledger exported", body: `ledger-${a.code}.csv downloaded.` }); }}>Export this account</button>}
    >
      <div className="pm-detail-head">
        <div className="pm-money-lg">{fmt(a.balance)}</div>
        <div className="pm-muted pm-fs-12">{a.type} · default VAT {a.vat} · {a.txCount} transactions</div>
      </div>
      <div className="pm-detail-section">
        <div className="pm-preview-label">Journal postings</div>
        {postings.length === 0 && <div className="pm-muted pm-fs-13">No manual journal postings — this account is fed by categorized transactions.</div>}
        {postings.map((p, i) => {
          running += p.l.debit - p.l.credit;
          return (
            <div className="pm-line-view" key={i}>
              <div className="flex-grow-1">
                <div className="fw-semibold pm-fs-13">{p.j.number} · {p.l.memo}</div>
                <div className="pm-muted pm-fs-11">{fmtDate(p.j.date)} · {p.j.narration}</div>
              </div>
              <div className="text-end">
                <b className={cls("pm-fs-13", p.l.debit ? "t-success" : "t-danger")}>{p.l.debit ? `Dr ${fmt(p.l.debit)}` : `Cr ${fmt(p.l.credit)}`}</b>
                <div className="pm-muted pm-fs-11">bal {fmt(running)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </SlideOver>
  );
}
