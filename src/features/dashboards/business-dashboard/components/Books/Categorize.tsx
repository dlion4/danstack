import { useEffect, useMemo, useState } from "react";
import {
  Sparkles, Search, CheckCircle2, Split, Paperclip, Wand2, Plus, Layers,
  Pencil, Trash2, X, FolderTree, Zap,
} from "lucide-react";
import type { BookTx, CoaAccount } from "../../dataBooks";
import { cls, fmt, fmtDT, uid, type QAction } from "../../lib";
import { Badge, Confirm, EmptyState, Field, Kpi, Modal, PillTabs, Section, SlideOver, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Categorize({ txs, setTxs, coa, setCoa, notify, emit, qa, onConsume }: {
  txs: BookTx[];
  setTxs: React.Dispatch<React.SetStateAction<BookTx[]>>;
  coa: CoaAccount[];
  setCoa: React.Dispatch<React.SetStateAction<CoaAccount[]>>;
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [tab, setTab] = useState("uncategorized");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<BookTx | null>(null);
  const [splitFor, setSplitFor] = useState<BookTx | null>(null);
  const [ruleFor, setRuleFor] = useState<BookTx | null>(null);
  const [coaOpen, setCoaOpen] = useState(false);
  const [newAcc, setNewAcc] = useState(false);
  const [editAcc, setEditAcc] = useState<CoaAccount | null>(null);
  const [delAcc, setDelAcc] = useState<CoaAccount | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "focusCategorize") { setTab("uncategorized"); document.getElementById("sec-categorize")?.scrollIntoView({ behavior: "smooth" }); }
    if (qa.a === "coa") setCoaOpen(true);
    if (qa.a === "autoCategorize") setBulkOpen(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const nameOf = (id?: string) => coa.find((c) => c.id === id)?.name ?? "—";
  const codeOf = (id?: string) => coa.find((c) => c.id === id)?.code ?? "";

  const list = useMemo(() => {
    let rows = txs;
    if (tab !== "all") rows = rows.filter((t) => t.status === tab);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      rows = rows.filter((t) => t.desc.toLowerCase().includes(s) || t.ref.toLowerCase().includes(s));
    }
    return rows;
  }, [txs, tab, q]);

  const uncat = txs.filter((t) => t.status === "uncategorized");
  const vatReclaim = uncat.reduce((s, t) => s + (t.amount < 0 ? t.vat : 0), 0);

  const categorize = (id: string, coaId: string) => {
    setTxs((xs) => xs.map((t) => (t.id === id ? { ...t, coa: coaId, status: "categorized" } : t)));
  };

  const acceptAll = () => {
    const n = uncat.filter((t) => t.suggestion).length;
    setTxs((xs) => xs.map((t) => (t.status === "uncategorized" && t.suggestion ? { ...t, coa: t.suggestion, status: "categorized" } : t)));
    notify({ tone: "success", title: `${n} transactions categorized`, body: `Suggestions accepted · KES ${Math.round(vatReclaim).toLocaleString()} input VAT captured for reclaim.` });
    setSel(new Set());
    setBulkOpen(false);
  };

  const toggleSel = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSel = list.length > 0 && list.every((t) => sel.has(t.id));

  return (
    <>
      <Section
        no="4.2" sub="Your Business · Classification" id="sec-categorize"
        title="Transaction Categorization & Chart of Accounts"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setCoaOpen(true)}><FolderTree size={15} /> Chart of Accounts</button>
            <button className="btn pm-btn-violet" onClick={() => setBulkOpen(true)}><Wand2 size={15} /> Auto-Categorize All</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Sparkles size={16} />} label="Uncategorized" value={`${uncat.length} items`} delta="93% avg confidence" sub="ready for 1-click approve" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="Auto-match rate" value="93%" delta="▲ 6 pts" sub="learns from your edits" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Zap size={16} />} label="Input VAT at stake" value={fmt(vatReclaim)} delta="reclaimable" sub="once categorized correctly" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Layers size={16} />} label="Accounts in CoA" value={`${coa.length} accounts`} delta="5 types" sub="Kenya SME template" /></div>
        </div>

        <div className="pm-card">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between px-1 pt-1">
            <PillTabs
              tabs={[
                { id: "uncategorized", label: "Uncategorized", count: uncat.length, tone: "warning" },
                { id: "review", label: "Needs review", count: txs.filter((t) => t.status === "review").length, tone: "danger" },
                { id: "categorized", label: "Categorized", count: txs.filter((t) => t.status === "categorized").length },
                { id: "all", label: "All", count: txs.length },
              ]}
              active={tab}
              onChange={setTab}
            />
            <div className="pm-search"><Search size={15} /><input placeholder="Search description or reference…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          </div>

          {sel.size > 0 && (
            <div className="pm-bulkbar pm-bulkbar-violet mt-3">
              <span className="pm-bulk-count">{sel.size} selected</span>
              <div className="d-flex gap-2 flex-wrap align-items-center">
                <select className="form-select form-select-sm pm-input pm-w-190" defaultValue="" onChange={(e) => {
                  if (!e.target.value) return;
                  const n = sel.size;
                  [...sel].forEach((id) => categorize(id, e.target.value));
                  notify({ tone: "success", title: `${n} transactions categorized`, body: `Assigned to ${nameOf(e.target.value)}.` });
                  setSel(new Set());
                }}>
                  <option value="">Assign category…</option>
                  {coa.filter((c) => c.type === "Expense" || c.type === "Income").map((c) => <option key={c.id} value={c.id}>{c.code} · {c.name}</option>)}
                </select>
                <button className="btn btn-sm pm-btn-soft" onClick={() => { const n = sel.size; [...sel].forEach((id) => { const t = txs.find((x) => x.id === id); if (t?.suggestion) categorize(id, t.suggestion); }); notify({ tone: "success", title: `${n} suggestions accepted` }); setSel(new Set()); }}>
                  <Sparkles size={13} /> Accept suggestions
                </button>
              </div>
              <button className="btn btn-sm pm-btn-ghost" onClick={() => setSel(new Set())}><X size={13} /></button>
            </div>
          )}

          <div className="table-responsive mt-2">
            <table className="table pm-table align-middle mb-0">
              <thead>
                <tr>
                  <th className="pm-th-check"><input type="checkbox" checked={allSel} onChange={() => setSel(allSel ? new Set() : new Set(list.map((t) => t.id)))} /></th>
                  <th>Transaction</th><th className="text-end">Amount</th><th>Category</th><th>VAT</th><th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {list.length === 0 && (
                  <tr><td colSpan={6}><EmptyState icon={<CheckCircle2 size={26} />} title="Nothing here 🎉" body="All caught up in this tab." /></td></tr>
                )}
                {list.map((t) => (
                  <tr key={t.id} className={cls(sel.has(t.id) && "pm-row-sel")}>
                    <td className="pm-th-check"><input type="checkbox" checked={sel.has(t.id)} onChange={() => toggleSel(t.id)} /></td>
                    <td>
                      <button className="pm-num-link pm-fs-13" onClick={() => setDetail(t)}>{t.desc}</button>
                      <div className="pm-muted pm-fs-11">{fmtDT(t.date)} · {t.source} · <span className="pm-mono">{t.ref}</span></div>
                    </td>
                    <td className={cls("text-end fw-bold pm-fs-13", t.amount >= 0 ? "t-success" : "t-danger")}>{t.amount >= 0 ? "+" : "−"}{fmt(Math.abs(t.amount))}</td>
                    <td style={{ minWidth: 210 }}>
                      {t.status === "categorized" ? (
                        <span className="pm-coa-chip"><b>{codeOf(t.coa)}</b> {nameOf(t.coa)}</span>
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          <select className="form-select form-select-sm pm-input" value={t.suggestion ?? ""} onChange={(e) => { categorize(t.id, e.target.value); notify({ tone: "success", title: "Categorized", body: `${t.desc} → ${nameOf(e.target.value)}` }); }}>
                            <option value="">Choose category…</option>
                            {coa.filter((c) => c.type === "Expense" || c.type === "Income").map((c) => <option key={c.id} value={c.id}>{c.code} · {c.name}</option>)}
                          </select>
                          {t.confidence ? <span className="pm-conf-pill">{t.confidence}%</span> : null}
                        </div>
                      )}
                    </td>
                    <td className="pm-fs-12">{t.vat ? <Badge tone="info">{fmt(t.vat)}</Badge> : <span className="pm-muted">—</span>}</td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        {t.status !== "categorized" && t.suggestion && (
                          <button className="btn pm-btn-violet btn-sm" onClick={() => { categorize(t.id, t.suggestion!); notify({ tone: "success", title: "Suggestion accepted", body: `${t.desc} → ${nameOf(t.suggestion)}` }); }}>
                            <CheckCircle2 size={13} /> Accept
                          </button>
                        )}
                        <button className="pm-icon-btn" onClick={() => setSplitFor(t)} title="Split transaction"><Split size={13} /></button>
                        <button className="pm-icon-btn" onClick={() => setRuleFor(t)} title="Create rule"><Wand2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pm-table-foot">
            <span className="pm-muted pm-fs-12">Showing {list.length} of {txs.length} · the engine learns every time you correct it.</span>
            <button className="pm-link-btn pm-fs-12" onClick={() => emit({ a: "newJournal" })}>Post a journal instead →</button>
          </div>
        </div>
      </Section>

      {/* ── tx detail ── */}
      <TxDetail t={detail} onClose={() => setDetail(null)} coa={coa} notify={notify}
        onCategorize={(id, c) => { categorize(id, c); setDetail(null); notify({ tone: "success", title: "Categorized", body: `Assigned to ${nameOf(c)}.` }); }}
        onSplit={(t) => { setDetail(null); setSplitFor(t); }}
        onRule={(t) => { setDetail(null); setRuleFor(t); }}
      />

      {/* ── split ── */}
      <SplitModal t={splitFor} onClose={() => setSplitFor(null)} coa={coa} notify={notify}
        onSplit={(id) => { setTxs((xs) => xs.map((x) => (x.id === id ? { ...x, status: "categorized" } : x))); }} />

      {/* ── rule builder ── */}
      <RuleModal t={ruleFor} onClose={() => setRuleFor(null)} coa={coa} notify={notify} />

      {/* ── chart of accounts ── */}
      <CoaModal open={coaOpen} onClose={() => setCoaOpen(false)} coa={coa} notify={notify}
        onAdd={() => { setCoaOpen(false); setNewAcc(true); }}
        onEdit={(a) => { setCoaOpen(false); setEditAcc(a); }}
        onDelete={(a) => { setCoaOpen(false); setDelAcc(a); }}
      />
      <AccountModal open={newAcc} onClose={() => setNewAcc(false)} notify={notify}
        onSave={(a) => setCoa((cs) => [...cs, a])} />
      <AccountModal open={!!editAcc} onClose={() => setEditAcc(null)} notify={notify} existing={editAcc}
        onSave={(a) => setCoa((cs) => cs.map((x) => (x.id === a.id ? a : x)))} />
      <Confirm open={!!delAcc} onClose={() => setDelAcc(null)}
        onConfirm={() => { if (delAcc) { setCoa((cs) => cs.filter((x) => x.id !== delAcc.id)); notify({ tone: "danger", title: "Account deleted", body: `${delAcc.code} · ${delAcc.name} removed from the chart.` }); } }}
        title="Delete account" confirmLabel="Delete" tone="danger"
        body={<span>Delete <b>{delAcc?.code} {delAcc?.name}</b>? It has {delAcc?.txCount} transactions — they'll move to Uncategorized.</span>}
        icon={<Trash2 size={18} />} />

      {/* ── bulk auto-categorize ── */}
      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} kicker="AI Categorization" title="Auto-categorize everything" subtitle="Review the engine's suggestions before applying." size="lg"
        footer={<><button className="btn pm-btn-ghost" onClick={() => setBulkOpen(false)}>Cancel</button>
          <button className="btn pm-btn-violet" disabled={uncat.filter((t) => t.suggestion).length === 0} onClick={acceptAll}><Wand2 size={15} /> Apply {uncat.filter((t) => t.suggestion).length} suggestions</button></>}
      >
        {uncat.length === 0 && <EmptyState icon={<CheckCircle2 size={26} />} title="All categorized" body="Nothing left for the engine to guess." />}
        {uncat.map((t) => (
          <div className="pm-suggest-row" key={t.id}>
            <div className="flex-grow-1">
              <div className="fw-semibold pm-fs-13">{t.desc}</div>
              <div className="pm-muted pm-fs-11">{fmt(Math.abs(t.amount))} → {t.suggestion ? `${codeOf(t.suggestion)} ${nameOf(t.suggestion)}` : "no confident match — review manually"}</div>
              {t.confidence ? <div className="pm-confbar"><span className="pm-confbar-fill" style={{ width: `${t.confidence}%` }} /></div> : null}
            </div>
            <Badge tone={(t.confidence ?? 0) > 90 ? "success" : (t.confidence ?? 0) > 0 ? "warning" : "muted"}>{t.confidence ? `${t.confidence}%` : "manual"}</Badge>
          </div>
        ))}
        <div className="pm-cyan-note mt-2">The engine uses merchant names, amounts and your past corrections. Anything under 70% is left for you.</div>
      </Modal>
    </>
  );
}

/* ── tx detail ── */

function TxDetail({ t, onClose, coa, notify, onCategorize, onSplit, onRule }: {
  t: BookTx | null; onClose: () => void; coa: CoaAccount[]; notify: Notify;
  onCategorize: (id: string, coa: string) => void; onSplit: (t: BookTx) => void; onRule: (t: BookTx) => void;
}) {
  const [pick, setPick] = useState("");
  useEffect(() => { if (t) setPick(t.coa ?? t.suggestion ?? ""); }, [t]);
  if (!t) return null;
  return (
    <SlideOver open={!!t} onClose={onClose} kicker="Transaction" title={t.desc} width={500}
      footer={
        <>
          <button className="btn pm-btn-soft btn-sm" onClick={() => onSplit(t)}><Split size={14} /> Split</button>
          <button className="btn pm-btn-soft btn-sm" onClick={() => onRule(t)}><Wand2 size={14} /> Create rule</button>
          <button className="btn pm-btn-violet btn-sm" disabled={!pick} onClick={() => onCategorize(t.id, pick)}><CheckCircle2 size={14} /> Save category</button>
        </>
      }
    >
      <div className="pm-detail-head">
        <div className={cls("pm-money-lg", t.amount >= 0 ? "t-success" : "t-danger")}>{t.amount >= 0 ? "+" : "−"}{fmt(Math.abs(t.amount))}</div>
        <div className="pm-muted pm-fs-12">{fmtDT(t.date)} · {t.source} · ref {t.ref}</div>
      </div>
      <div className="pm-detail-section">
        <Field label="Category">
          <select className="form-select pm-input" value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">Choose…</option>
            {coa.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.name} ({c.type})</option>)}
          </select>
        </Field>
        {t.confidence ? <div className="pm-cyan-note">🤖 Suggested with {t.confidence}% confidence based on the merchant name and 12 similar past transactions.</div> : <div className="pm-note">No confident suggestion — this looks like a one-off. Cash withdrawals usually need a manual split.</div>}
      </div>
      <div className="pm-detail-section">
        <div className="pm-preview-label">Tax treatment</div>
        <div className="pm-summary-card">
          <div className="pm-summary-row"><span>VAT component</span><b>{t.vat ? fmt(t.vat) : "none"}</b></div>
          <div className="pm-summary-row"><span>Reclaimable</span><b>{t.amount < 0 && t.vat ? "Yes — input VAT" : t.vat ? "No — output VAT" : "N/A"}</b></div>
          <div className="pm-summary-row"><span>Receipt attached</span><b>{t.attachment ?? "none"}</b></div>
        </div>
        <button className="btn pm-btn-soft btn-sm mt-2 w-100" onClick={() => notify({ tone: "info", title: "Receipt attached", body: "receipt-scan.jpg linked to this transaction (demo)." })}>
          <Paperclip size={14} /> Attach receipt
        </button>
      </div>
    </SlideOver>
  );
}

/* ── split ── */

function SplitModal({ t, onClose, coa, notify, onSplit }: {
  t: BookTx | null; onClose: () => void; coa: CoaAccount[]; notify: Notify; onSplit: (id: string) => void;
}) {
  const [rows, setRows] = useState<{ coa: string; amount: number }[]>([]);
  useEffect(() => { if (t) setRows([{ coa: t.suggestion ?? "", amount: Math.abs(t.amount) }]); }, [t]);
  if (!t) return null;
  const total = Math.abs(t.amount);
  const allocated = rows.reduce((s, r) => s + (r.amount || 0), 0);
  const remaining = total - allocated;
  const valid = Math.abs(remaining) < 1 && rows.every((r) => r.coa);
  return (
    <Modal open={!!t} onClose={onClose} kicker="Split Transaction" title={t.desc} subtitle={`Allocate ${fmt(total)} across multiple accounts.`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn pm-btn-violet" disabled={!valid} onClick={() => { onSplit(t.id); notify({ tone: "success", title: "Transaction split", body: `${rows.length} allocations posted to the ledger.` }); onClose(); }}>Post split</button></>}
    >
      {rows.map((r, i) => (
        <div className="d-flex gap-2 mb-2 align-items-center" key={i}>
          <select className="form-select form-select-sm pm-input flex-grow-1" value={r.coa} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, coa: e.target.value } : x)))}>
            <option value="">Choose account…</option>
            {coa.filter((c) => c.type === "Expense" || c.type === "Income" || c.type === "Asset").map((c) => <option key={c.id} value={c.id}>{c.code} · {c.name}</option>)}
          </select>
          <input type="number" className="form-control form-control-sm pm-input pm-w-110 text-end" value={r.amount} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, amount: Number(e.target.value) } : x)))} />
          <button className="pm-icon-btn pm-icon-danger" disabled={rows.length === 1} onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}><Trash2 size={13} /></button>
        </div>
      ))}
      <button className="btn pm-btn-soft btn-sm" onClick={() => setRows((rs) => [...rs, { coa: "", amount: Math.max(0, remaining) }])}><Plus size={13} /> Add allocation</button>
      <div className={cls("pm-total-panel mt-3")}>
        <div className="pm-total-row"><span>Transaction total</span><b>{fmt(total)}</b></div>
        <div className="pm-total-row"><span>Allocated</span><b>{fmt(allocated)}</b></div>
        <div className="pm-total-row pm-total-grand"><span>Remaining</span><b className={Math.abs(remaining) < 1 ? "t-success" : "t-danger"}>{fmt(remaining)}</b></div>
      </div>
    </Modal>
  );
}

/* ── rule builder ── */

function RuleModal({ t, onClose, coa, notify }: {
  t: BookTx | null; onClose: () => void; coa: CoaAccount[]; notify: Notify;
}) {
  const [match, setMatch] = useState("");
  const [target, setTarget] = useState("");
  const [applyPast, setApplyPast] = useState(true);
  useEffect(() => { if (t) { setMatch(t.desc.split(" — ")[1]?.split(" ")[0] ?? t.desc.split(" ")[0]); setTarget(t.suggestion ?? ""); } }, [t]);
  if (!t) return null;
  return (
    <Modal open={!!t} onClose={onClose} kicker="Automation" title="Create a categorization rule" subtitle="Every future transaction that matches is categorized automatically."
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn pm-btn-violet" disabled={!match || !target} onClick={() => { notify({ tone: "success", title: "Rule created", body: `Transactions containing "${match}" → ${coa.find((c) => c.id === target)?.name}${applyPast ? " · applied to 12 past transactions" : ""}.` }); onClose(); }}><Wand2 size={15} /> Create rule</button></>}
    >
      <Field label="When the description contains" req><input className="form-control pm-input pm-mono" value={match} onChange={(e) => setMatch(e.target.value)} /></Field>
      <Field label="Categorize as" req>
        <select className="form-select pm-input" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">Choose…</option>
          {coa.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.name}</option>)}
        </select>
      </Field>
      <div className="pm-toggle-row"><Toggle on={applyPast} onChange={setApplyPast} label="Also apply to past matching transactions (12 found)" /></div>
      <div className="pm-cyan-note">Rules run before the AI engine — they always win, so you stay in control.</div>
    </Modal>
  );
}

/* ── chart of accounts ── */

function CoaModal({ open, onClose, coa, notify, onAdd, onEdit, onDelete }: {
  open: boolean; onClose: () => void; coa: CoaAccount[]; notify: Notify;
  onAdd: () => void; onEdit: (a: CoaAccount) => void; onDelete: (a: CoaAccount) => void;
}) {
  const [type, setType] = useState("All");
  const [q, setQ] = useState("");
  const types = ["All", "Income", "Expense", "Asset", "Liability", "Equity"];
  const rows = coa.filter((c) => (type === "All" || c.type === type) && (!q || (c.name + c.code).toLowerCase().includes(q.toLowerCase())));
  return (
    <Modal open={open} onClose={onClose} kicker="Chart of Accounts" title="Your account structure" subtitle="Kenya SME template — customise freely." size="xl"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
        <button className="btn pm-btn-soft" onClick={() => notify({ tone: "success", title: "Chart exported", body: "chart-of-accounts.csv downloaded — share with your accountant." })}>Export CSV</button>
        <button className="btn pm-btn-violet" onClick={onAdd}><Plus size={15} /> New account</button></>}
    >
      <div className="d-flex gap-2 flex-wrap mb-3">
        <div className="pm-mode-tabs">
          {types.map((t) => <button key={t} className={cls("pm-mode-tab", type === t && "pm-mode-on")} onClick={() => setType(t)}>{t}</button>)}
        </div>
        <div className="pm-search ms-auto"><Search size={15} /><input placeholder="Search code or name…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      <div className="table-responsive">
        <table className="table pm-table align-middle mb-0">
          <thead><tr><th>Code</th><th>Account</th><th>Type</th><th>VAT</th><th className="text-end">Balance</th><th className="text-end">Txns</th><th className="text-end" /></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="pm-mono pm-fs-13 fw-bold">{c.code}</td>
                <td className="pm-fs-13">{c.name} {c.system && <span className="pm-sys-chip">system</span>}</td>
                <td><Badge tone={c.type === "Income" ? "success" : c.type === "Expense" ? "danger" : c.type === "Asset" ? "info" : c.type === "Liability" ? "warning" : "muted"}>{c.type}</Badge></td>
                <td className="pm-fs-12 pm-muted">{c.vat}</td>
                <td className="text-end fw-bold pm-fs-13">{fmt(c.balance)}</td>
                <td className="text-end pm-muted pm-fs-12">{c.txCount}</td>
                <td className="text-end">
                  <button className="pm-icon-btn me-1" onClick={() => onEdit(c)}><Pencil size={13} /></button>
                  <button className="pm-icon-btn pm-icon-danger" disabled={c.system} onClick={() => onDelete(c)}><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pm-note mt-2">{rows.length} account(s) shown. System accounts are required for statutory reporting and can't be deleted.</div>
    </Modal>
  );
}

/* ── add/edit account ── */

function AccountModal({ open, onClose, notify, existing, onSave }: {
  open: boolean; onClose: () => void; notify: Notify; existing?: CoaAccount | null;
  onSave: (a: CoaAccount) => void;
}) {
  const [f, setF] = useState({ code: "", name: "", type: "Expense", vat: "16%" });
  useEffect(() => {
    if (open) setF(existing ? { code: existing.code, name: existing.name, type: existing.type, vat: existing.vat } : { code: "", name: "", type: "Expense", vat: "16%" });
  }, [open, existing]);
  const valid = f.code && f.name;
  return (
    <Modal open={open} onClose={onClose} kicker="Chart of Accounts" title={existing ? `Edit ${existing.code}` : "New account"}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn pm-btn-violet" disabled={!valid} onClick={() => {
          onSave({ id: existing?.id ?? uid("coa"), code: f.code, name: f.name, type: f.type as CoaAccount["type"], vat: f.vat as CoaAccount["vat"], balance: existing?.balance ?? 0, txCount: existing?.txCount ?? 0, system: existing?.system ?? false });
          notify({ tone: "success", title: existing ? "Account updated" : "Account created", body: `${f.code} · ${f.name}` });
          onClose();
        }}>Save account</button></>}
    >
      <div className="row g-3">
        <div className="col-4"><Field label="Code" req><input className="form-control pm-input pm-mono" placeholder="6100" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} /></Field></div>
        <div className="col-8"><Field label="Account name" req><input className="form-control pm-input" placeholder="e.g. Training & Development" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field></div>
        <div className="col-6"><Field label="Type"><select className="form-select pm-input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{["Income", "Expense", "Asset", "Liability", "Equity"].map((t) => <option key={t}>{t}</option>)}</select></Field></div>
        <div className="col-6"><Field label="Default VAT"><select className="form-select pm-input" value={f.vat} onChange={(e) => setF({ ...f, vat: e.target.value })}>{["16%", "Exempt", "Zero-rated", "N/A"].map((t) => <option key={t}>{t}</option>)}</select></Field></div>
      </div>
      <div className="pm-cyan-note mt-1">Codes follow the Kenya SME convention: 1000s assets, 2000s liabilities, 3000s equity, 4000s income, 5000–6000s expenses.</div>
    </Modal>
  );
}
