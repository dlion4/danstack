import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw, CheckCircle2, AlertTriangle, Search, Loader2, Link2, Wifi,
  ArrowUpRight,
} from "lucide-react";
import type { Invoice, Tx } from "../../dataGetpaid";
import { cls, fmt, fmtDT, type QAction } from "../../lib";
import {
  Badge, EmptyState, Field, Kpi, Modal, PillTabs, Section, SlideOver,
} from "./ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Reconciliation({ txs, setTxs, invoices, notify, qa, onConsume, onInvoicePaid }: {
  txs: Tx[];
  setTxs: React.Dispatch<React.SetStateAction<Tx[]>>;
  invoices: Invoice[];
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
  onInvoicePaid?: (invoiceId: string, amount: number) => void;
}) {
  const [tab, setTab] = useState("all");
  const [detail, setDetail] = useState<Tx | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [matchTx, setMatchTx] = useState<Tx | null>(null);
  const [syncOpen, setSyncOpen] = useState(false);

  useEffect(() => {
    if (!qa) return;
    switch (qa.a) {
      case "matchTx": {
        if (qa.p) setMatchTx(qa.p as Tx);
        else setReviewOpen(true);
        break;
      }
      case "sync": setSyncOpen(true); break;
    }
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const [q, setQ] = useState("");
  const suggested = txs.filter((t) => t.status === "suggested");
  const unmatched = txs.filter((t) => t.status === "unmatched");
  const matched = txs.filter((t) => t.status === "matched" || t.status === "partial");
  const rate = Math.round((matched.length / txs.length) * 100);
  const list = useMemo(() => {
    const base = tab === "all" ? txs : txs.filter((t) => (tab === "partial" ? t.status === "partial" || t.status === "matched" : t.status === tab));
    if (!q.trim()) return base;
    const s = q.trim().toLowerCase();
    return base.filter((t) => t.ref.toLowerCase().includes(s) || (t.name ?? "").toLowerCase().includes(s) || t.phone.includes(s) || String(t.amount).includes(s));
  }, [txs, tab, q]);

  const applyMatch = (txId: string, invoiceId: string, amount: number) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    setTxs((ts) => ts.map((t) => (t.id === txId ? { ...t, status: inv ? "matched" : "unmatched", invoice: inv ? invoiceId : undefined } : t)));
    if (inv) {
      onInvoicePaid?.(invoiceId, amount);
      notify({ tone: "success", title: "Payment matched", body: `${fmt(amount)} → ${inv.number}. Receivable updated.` });
    }
  };

  return (
    <>
      <Section
        no="1.6" sub="Money In · Auto-Reconciliation" id="sec-matching"
        title="Payment Matching & Reconciliation"
        right={
          <button className="btn pm-btn-primary" onClick={() => setSyncOpen(true)}>
            <RefreshCw size={15} /> Sync M-Pesa Now
          </button>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="Matched today" value={`${matched.length} tx`} delta={`${fmt(matched.reduce((s, t) => s + t.amount, 0))}`} sub="auto-settled" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<AlertTriangle size={16} />} label="Unmatched" value={`${unmatched.length} tx`} delta={fmt(unmatched.reduce((s, t) => s + t.amount, 0))} sub="needs review" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Link2 size={16} />} label="Auto-match rate" value={`${rate}%`} delta="4.2 pts" sub="vs last week" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Wifi size={16} />} label="Last sync" value="07:42 AM" delta="142 records" sub="M-Pesa API healthy" /></div>
        </div>

        {suggested.length > 0 && (
          <div className="pm-suggest-banner">
            <div className="pm-suggest-ic"><SparkleIcon /></div>
            <div className="flex-grow-1">
              <b>{suggested.length} payment(s) look like invoice matches</b>
              <span className="pm-muted pm-fs-13 d-block">
                {suggested.map((t) => `${fmt(t.amount)} → ${t.invoice ? `INV-${t.invoice.slice(4)}` : "unknown"} (${t.confidence}% confidence)`).join(" · ")}
              </span>
            </div>
            <button className="btn pm-btn-primary btn-sm" onClick={() => setReviewOpen(true)}>Review suggestions <ArrowUpRight size={14} /></button>
          </div>
        )}

        <div className="pm-card">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between px-3 pt-3">
            <PillTabs
              tabs={[
                { id: "all", label: "All", count: txs.length },
                { id: "matched", label: "Matched", count: matched.length },
                { id: "suggested", label: "Suggested", count: suggested.length },
                { id: "unmatched", label: "Unmatched", count: unmatched.length },
              ]}
              active={tab}
              onChange={setTab}
            />
            <div className="pm-search">
              <Search size={15} />
              <input placeholder="Search ref, phone or amount…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table pm-table align-middle mb-0">
              <thead>
                <tr><th>Reference</th><th>Payer</th><th>Channel</th><th className="text-end">Amount</th><th>Time</th><th>Status</th><th className="text-end" /></tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr key={t.id} className="pm-click-row" onClick={() => setDetail(t)}>
                    <td className="pm-mono pm-fs-13">{t.ref}</td>
                    <td>
                      <div className="fw-semibold pm-fs-13">{t.name ?? "Unknown payer"}</div>
                      <div className="pm-muted pm-fs-11">{t.phone}</div>
                    </td>
                    <td className="pm-fs-13">{t.channel}</td>
                    <td className="text-end fw-bold pm-fs-13">{fmt(t.amount)}</td>
                    <td className="pm-muted pm-fs-12">{fmtDT(t.t)}</td>
                    <td>
                      {t.status === "matched" && <Badge tone="success" dot>Matched</Badge>}
                      {t.status === "partial" && <Badge tone="warning" dot>Partial</Badge>}
                      {t.status === "suggested" && <Badge tone="info" dot>{t.confidence}% match</Badge>}
                      {t.status === "unmatched" && <Badge tone="muted">Unmatched</Badge>}
                    </td>
                    <td className="text-end">
                      <button className="pm-link-btn pm-fs-12" onClick={(e) => { e.stopPropagation(); setMatchTx(t); }}>
                        {t.status === "unmatched" ? "Match manually →" : t.status === "suggested" ? "Review →" : "View →"}
                      </button>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr><td colSpan={7}><EmptyState icon={<RefreshCw size={24} />} title="No transactions here" body="Sync M-Pesa or change the filter." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ── tx detail ── */}
      <TxDetail t={detail} onClose={() => setDetail(null)} invoices={invoices} onMatch={(invId, amt) => { if (detail) applyMatch(detail.id, invId, amt); setDetail(null); }} />

      {/* ── suggestions review ── */}
      <SuggestionsReview
        open={reviewOpen} onClose={() => setReviewOpen(false)} suggested={suggested} invoices={invoices} notify={notify}
        onAccept={(txId, invId, amt) => applyMatch(txId, invId, amt)}
      />

      {/* ── manual match ── */}
      <ManualMatchModal t={matchTx} onClose={() => setMatchTx(null)} invoices={invoices} notify={notify}
        onApply={(invId, amt) => { if (matchTx) applyMatch(matchTx.id, invId, amt); }} />

      {/* ── sync ── */}
      <SyncModal open={syncOpen} onClose={() => setSyncOpen(false)} notify={notify} />
    </>
  );
}

function SparkleIcon() {
  return <span className="pm-sparkle">✦</span>;
}

/* ── tx detail ── */

function TxDetail({ t, onClose, invoices, onMatch }: {
  t: Tx | null; onClose: () => void; invoices: Invoice[]; onMatch: (invId: string, amt: number) => void;
}) {
  if (!t) return null;
  const inv = invoices.find((i) => i.id === t.invoice);
  return (
    <SlideOver open={!!t} onClose={onClose} kicker="Transaction" title={t.ref} width={480}
      footer={
        t.status !== "matched" && (
          <>
            <button className="btn pm-btn-ghost btn-sm flex-grow-1" onClick={() => onMatch("__unmatched__", 0)}>Keep unmatched</button>
            <button className="btn pm-btn-primary btn-sm flex-grow-1" onClick={() => onMatch(inv?.id ?? "", t.amount)}>
              {inv ? `Match to ${inv.number}` : "Choose invoice"}
            </button>
          </>
        )
      }
    >
      <div className="pm-detail-head">
        <div className="pm-money-lg">{fmt(t.amount)}</div>
        <div className="pm-muted pm-fs-13">{t.channel} · {fmtDT(t.t)}</div>
      </div>
      <div className="pm-json">
        {[
          ["Reference", t.ref],
          ["Payer", t.name ?? "Unknown"],
          ["Phone", t.phone],
          ["Status", t.status],
          ["Invoice", inv ? inv.number : "—"],
          ["Confidence", t.confidence ? `${t.confidence}%` : "—"],
          ["Statement", "M-Pesa pull #142 · 07:42 EAT"],
        ].map(([k, v]) => (
          <div className="pm-json-row" key={k}><span>{k}</span><b>{v}</b></div>
        ))}
      </div>
      {t.status === "suggested" && (
        <div className="pm-cyan-note mt-2">
          Why suggested: amount matches invoice balance within tolerance and phone matches the customer record at {t.confidence}%.
        </div>
      )}
    </SlideOver>
  );
}

/* ── suggestions review ── */

function SuggestionsReview({ open, onClose, suggested, invoices, notify, onAccept }: {
  open: boolean; onClose: () => void; suggested: Tx[]; invoices: Invoice[];
  notify: Notify; onAccept: (txId: string, invId: string, amt: number) => void;
}) {
  const acceptAll = () => {
    suggested.forEach((t) => t.invoice && onAccept(t.id, t.invoice, t.amount));
    notify({ tone: "success", title: "All suggestions accepted", body: `${suggested.length} payments matched to invoices.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Auto-Match Engine" title="Review match suggestions" subtitle="Confidence ≥ 70% · one click to accept."
      size="lg"
      footer={<>
        <button className="btn pm-btn-ghost" onClick={onClose}>Dismiss</button>
        <button className="btn pm-btn-primary" onClick={acceptAll} disabled={suggested.length === 0}><CheckCircle2 size={15} /> Accept all ({suggested.length})</button>
      </>}
    >
      {suggested.map((t) => {
        const inv = invoices.find((i) => i.id === t.invoice);
        const bal = inv ? inv.amount - inv.paid : t.amount;
        return (
          <div className="pm-suggest-row" key={t.id}>
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <b className="pm-fs-14">{fmt(t.amount)}</b>
                <span className="pm-muted pm-fs-12">from {t.name}</span>
                <span className="pm-mono pm-fs-11 pm-muted">{t.ref}</span>
              </div>
              <div className="pm-muted pm-fs-12 mt-1">→ {inv ? `${inv.number} · balance ${fmt(bal)}` : "No invoice candidate"}</div>
              <div className="pm-confbar"><span className="pm-confbar-fill" style={{ width: `${t.confidence}%` }} /></div>
            </div>
            <div className="d-flex flex-column align-items-end gap-1">
              <Badge tone={t.confidence! > 85 ? "success" : "info"}>{t.confidence}%</Badge>
              <button className="btn pm-btn-soft btn-sm" onClick={() => { if (t.invoice) { onAccept(t.id, t.invoice, t.amount); notify({ tone: "success", title: "Match accepted", body: `${fmt(t.amount)} → ${inv?.number}` }); onClose(); } }}>Accept</button>
            </div>
          </div>
        );
      })}
      <div className="pm-note mt-2">Accepted matches update the invoice's paid balance and the receivables aging instantly.</div>
    </Modal>
  );
}

/* ── manual match ── */

function ManualMatchModal({ t, onClose, invoices, notify, onApply }: {
  t: Tx | null; onClose: () => void; invoices: Invoice[]; notify: Notify;
  onApply: (invId: string, amt: number) => void;
}) {
  const [q, setQ] = useState("");
  const [invId, setInvId] = useState("");
  const [amt, setAmt] = useState("");
  const [full, setFull] = useState(true);
  useEffect(() => {
    if (t) { setInvId(t.invoice ?? ""); setAmt(String(t.amount)); setFull(true); setQ(""); }
  }, [t]);
  if (!t) return null;
  const candidates = invoices.filter((i) => !q || (i.number + " " + i.customerId).toLowerCase().includes(q.toLowerCase()));
  const chosen = invoices.find((i) => i.id === invId);
  const chosenBal = chosen ? chosen.amount - chosen.paid : 0;
  const applyAmt = full ? t.amount : Number(amt) || 0;
  const over = applyAmt > chosenBal && !!chosen;
  const submit = () => {
    if (!invId) { notify({ tone: "warning", title: "Select an invoice", body: "Pick the invoice this payment settles." }); return; }
    onApply(invId, applyAmt);
    if (applyAmt < t.amount) notify({ tone: "info", title: "Split recorded", body: `${fmt(t.amount - applyAmt)} stays as unapplied credit — create a credit note or keep on account.` });
    onClose();
  };
  return (
    <Modal open={!!t} onClose={onClose} kicker="Manual Match" title={`Match ${t.ref} to an invoice`} subtitle={`${t.name ?? "Unknown payer"} · ${fmt(t.amount)} · ${t.channel}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={submit}><Link2 size={15} /> Record match</button></>}
    >
      <div className="pm-search mb-2">
        <Search size={15} />
        <input placeholder="Search invoice number…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="pm-select-list pm-select-tight">
        {candidates.slice(0, 6).map((i) => (
          <button key={i.id} className={cls("pm-check-list-item", invId === i.id && "pm-check-on")} onClick={() => setInvId(i.id)}>
            <span className="pm-checkbox">{invId === i.id ? "✓" : ""}</span>
            <span className="flex-grow-1 text-start">
              <b className="pm-fs-13">{i.number}</b>
              <span className="pm-muted pm-fs-11 d-block">{i.customerId} · balance {fmt(i.amount - i.paid)}</span>
            </span>
          </button>
        ))}
        {candidates.length === 0 && <div className="pm-empty-inline">No invoices match — check the number or create a credit.</div>}
      </div>
      <div className="row g-3 mt-2">
        <div className="col-6">
          <Field label="Apply amount">
            <div className="pm-mode-tabs mb-1">
              <button className={cls("pm-mode-tab", full && "pm-mode-on")} onClick={() => setFull(true)}>Full {fmt(t.amount)}</button>
              <button className={cls("pm-mode-tab", !full && "pm-mode-on")} onClick={() => setFull(false)}>Partial</button>
            </div>
            {!full && <input type="number" className="form-control pm-input" value={amt} onChange={(e) => setAmt(e.target.value)} />}
          </Field>
        </div>
        <div className="col-6">
          <Field label="Leftover handling">
            <select className="form-select pm-input">
              <option>Keep on account (credit)</option><option>Create credit note</option><option>Refund to payer</option>
            </select>
          </Field>
        </div>
      </div>
      {chosen && (
        <div className="pm-impact-box mt-2">
          <div className="pm-impact-row"><span>Invoice balance</span><b>{fmt(chosenBal)}</b></div>
          <div className="pm-impact-row"><span>After this match</span><b className={over ? "t-danger" : "t-success"}>{fmt(Math.max(0, chosenBal - applyAmt))}</b></div>
        </div>
      )}
      {over && <div className="pm-warn-chip mt-2"><AlertTriangle size={13} /> Overpayment — the excess will be handled as chosen above.</div>}
    </Modal>
  );
}

/* ── sync ── */

function SyncModal({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [phase, setPhase] = useState(0);
  const steps = ["Connecting to M-Pesa API…", "Pulling statement (142 records)…", "Parsing & deduplicating…", "Running auto-match engine…"];
  useEffect(() => {
    if (!open) { setPhase(0); return; }
    setPhase(0);
    const t = window.setInterval(() => setPhase((p) => Math.min(p + 1, 4)), 900);
    return () => window.clearInterval(t);
  }, [open]);
  useEffect(() => {
    if (phase === 4 && open) notify({ tone: "success", title: "Sync complete", body: "142 records · 3 new suggested matches found. Invoice balances updated." });
  }, [phase, open, notify]);
  const done = phase === 4;
  return (
    <Modal open={open} onClose={onClose} kicker="Statement Sync" title={done ? "Sync finished" : "Syncing M-Pesa…"} hideClose={!done}
      footer={done ? <button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button> : undefined}
    >
      <div className="pm-sync-list">
        {steps.map((s, i) => (
          <div key={i} className={cls("pm-sync-step", phase > i && "pm-sync-done", phase === i && "pm-sync-active")}>
            {phase > i ? <CheckCircle2 size={16} /> : phase === i ? <Loader2 size={16} className="pm-spin" /> : <span className="pm-sync-num">{i + 1}</span>}
            <span>{s}</span>
          </div>
        ))}
      </div>
      {done && (
        <div className="pm-cyan-note">✅ 139 matched · 3 suggested (review queue) · 0 failed. The aging table and invoice balances were refreshed.</div>
      )}
    </Modal>
  );
}
