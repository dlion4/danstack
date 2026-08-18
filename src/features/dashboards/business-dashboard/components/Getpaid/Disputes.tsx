import { useState } from "react";
import {
  ShieldAlert, AlertTriangle, FileText, Undo2, Send, Upload,
  CheckCircle2, Scale, MessageCircle,
} from "lucide-react";
import type { Customer } from "../../dataGetpaid";
import { disputesSeed } from "../../dataGetpaid";
import { addDays, cls, fmt, fmtDate, todayISO, type QAction } from "../../lib";
import { Avatar, Badge, Field, Kpi, Modal, Section, SlideOver, Stepper, Toggle } from "./ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;
type Dispute = (typeof disputesSeed)[number];

export default function Disputes({ customers, notify }: {
  customers: Customer[];
  notify: Notify;
  emit?: (q: QAction) => void;
  qa?: QAction;
  onConsume?: () => void;
}) {
  const [disputes, setDisputes] = useState<Dispute[]>(disputesSeed);
  const [detail, setDetail] = useState<Dispute | null>(null);
  const [refundFor, setRefundFor] = useState<Dispute | null>(null);
  const [chargeback, setChargeback] = useState(false);

  const custOf = (id: string) => customers.find((c) => c.id === id);
  const open = disputes.filter((d) => d.status === "open").length;

  return (
    <Section
      no="1.8" sub="Money In · Protection" id="sec-disputes"
      title="Disputes, Refunds & Chargebacks"
      right={
        <button className="btn pm-btn-soft" onClick={() => setChargeback(true)}>
          <ShieldAlert size={15} /> Chargeback log
        </button>
      }
    >
      <div className="row g-3 mb-3">
        <div className="col-6 col-lg-3"><Kpi icon={<ShieldAlert size={16} />} label="Open disputes" value={String(open)} delta={`KES ${fmtN(disputes.filter((d) => d.status === "open").reduce((s, d) => s + d.amount, 0))}`} sub="at risk" deltaTone="down" /></div>
        <div className="col-6 col-lg-3"><Kpi icon={<Scale size={16} />} label="Win rate (12 mo)" value="86%" delta="4 pts" sub="vs last quarter" /></div>
        <div className="col-6 col-lg-3"><Kpi icon={<Undo2 size={16} />} label="Refunds issued" value="KES 96,400" delta="2.1%" sub="of collections" /></div>
        <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="Avg resolution" value="4.2 days" delta="1.1 days" sub="faster than before" /></div>
      </div>

      <div className="pm-card">
        <div className="table-responsive">
          <table className="table pm-table align-middle mb-0">
            <thead>
              <tr><th>Case</th><th>Customer</th><th>Channel</th><th className="text-end">Amount</th><th>Reason</th><th>Opened</th><th>Status</th><th className="text-end" /></tr>
            </thead>
            <tbody>
              {disputes.map((d) => {
                const c = custOf(d.customerId);
                return (
                  <tr key={d.id} className="pm-click-row" onClick={() => setDetail(d)}>
                    <td className="pm-mono pm-fs-13 fw-semibold">{d.id}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Avatar name={c?.name ?? "?"} size={26} />
                        <div>
                          <div className="fw-semibold pm-fs-13">{c?.name}</div>
                          <div className="pm-muted pm-fs-11">{c?.business}</div>
                        </div>
                      </div>
                    </td>
                    <td className="pm-fs-13">{d.channel}</td>
                    <td className="text-end fw-bold pm-fs-13">{fmt(d.amount)}</td>
                    <td className="pm-muted pm-fs-13" style={{ maxWidth: 220 }}>{d.reason}</td>
                    <td className="pm-muted pm-fs-12">{fmtDate(d.opened)}</td>
                    <td>
                      {d.status === "open" && <Badge tone="danger" dot>Open</Badge>}
                      {d.status === "review" && <Badge tone="warning" dot>Under review</Badge>}
                      {d.status === "resolved" && <Badge tone="success">Resolved — won</Badge>}
                      {d.status === "refunded" && <Badge tone="info">Refunded</Badge>}
                    </td>
                    <td className="text-end">
                      {d.status === "open" && <button className="btn pm-btn-soft btn-sm" onClick={(e) => { e.stopPropagation(); setRefundFor(d); }}><Undo2 size={13} /> Refund</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── detail ── */}
      <DisputeDetail d={detail} onClose={() => setDetail(null)} customer={detail ? custOf(detail.customerId) : undefined}
        onRefund={(x) => { setDetail(null); setRefundFor(x); }} notify={notify} setDisputes={setDisputes} />

      {/* ── refund wizard ── */}
      <RefundWizard d={refundFor} onClose={() => setRefundFor(null)} notify={notify} setDisputes={setDisputes} />

      {/* ── chargeback log ── */}
      <ChargebackModal open={chargeback} onClose={() => setChargeback(false)} notify={notify} customers={customers} />
    </Section>
  );
}

function fmtN(n: number) { return Math.round(n).toLocaleString("en-KE"); }

/* ── dispute detail ── */

function DisputeDetail({ d, onClose, customer, onRefund, notify, setDisputes }: {
  d: Dispute | null; onClose: () => void; customer?: Customer;
  onRefund: (d: Dispute) => void; notify: Notify;
  setDisputes: React.Dispatch<React.SetStateAction<Dispute[]>>;
}) {
  const [response, setResponse] = useState("");
  const [evidence, setEvidence] = useState<string[]>(["invoice-pdf.pdf", "delivery-note.jpg"]);
  if (!d) return null;
  const respond = () => {
    if (!response.trim()) { notify({ tone: "warning", title: "Response empty", body: "Write a response before submitting." }); return; }
    setDisputes((ds) => ds.map((x) => (x.id === d.id ? { ...x, status: "review" as const } : x)));
    notify({ tone: "success", title: "Response submitted", body: `Case ${d.id} moved to Under Review. The customer is notified.` });
    onClose();
  };
  const escalate = () => {
    notify({ tone: "info", title: "Escalated to card network", body: `${d.id} will be adjudicated by the acquirer (up to 45 days). Evidence attached.` });
    onClose();
  };
  return (
    <SlideOver open={!!d} onClose={onClose} kicker="Dispute Case" title={d.id} width={540}
      footer={
        d.status === "open" ? (
          <>
            <button className="btn pm-btn-ghost btn-sm" onClick={escalate}>Escalate to network</button>
            <button className="btn pm-btn-danger-soft btn-sm" onClick={() => onRefund(d)}><Undo2 size={14} /> Refund instead</button>
            <button className="btn pm-btn-primary btn-sm" onClick={respond}><Send size={14} /> Submit response</button>
          </>
        ) : (
          <button className="btn pm-btn-ghost btn-sm" onClick={onClose}>Close</button>
        )
      }
    >
      <div className="pm-detail-head">
        <div className="d-flex align-items-center gap-2">
          <Avatar name={customer?.name ?? "?"} size={38} />
          <div>
            <div className="fw-bold">{customer?.name} — {customer?.business}</div>
            <div className="pm-muted pm-fs-12">{d.channel} · {fmt(d.amount)} · opened {fmtDate(d.opened)}</div>
          </div>
        </div>
        <div className="pm-warn-chip mt-3"><AlertTriangle size={13} /> {d.reason}</div>
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Case timeline</div>
        {[
          { t: fmtDate(d.opened), text: `Dispute opened by customer (${d.reason})` },
          { t: fmtDate(addDays(d.opened, 1)), text: "Payment hold placed — funds frozen pending resolution" },
          { t: "Today", text: d.status === "open" ? "Awaiting your response (you have 7 days)" : "Case under review by PayMo support" },
        ].map((x, i) => (
          <div className="pm-tl-item" key={i}>
            <span className={cls("pm-tl-dot", i === 0 && "pm-tl-dot-pay", i === 2 && "pm-tl-dot-rem")} />
            <div><div className="pm-fs-13">{x.text}</div><div className="pm-muted pm-fs-11">{x.t}</div></div>
          </div>
        ))}
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Evidence on file</div>
        {evidence.map((e) => (
          <div className="pm-evidence" key={e}>
            <FileText size={14} /> {e} <button className="pm-link-btn ms-auto" onClick={() => notify({ tone: "info", title: "Evidence opened", body: `${e} (demo preview).` })}>View</button>
          </div>
        ))}
        <button className="btn pm-btn-soft btn-sm mt-2" onClick={() => { setEvidence((es) => [...es, `screenshot-${es.length + 1}.png`]); notify({ tone: "info", title: "Evidence added", body: "Attached to the case file." }); }}>
          <Upload size={13} /> Add evidence
        </button>
      </div>

      {d.status === "open" && (
        <div className="pm-detail-section">
          <Field label="Your response" hint="Explains why the charge was valid. Include delivery proof, contracts or receipts.">
            <textarea className="form-control pm-input" rows={4} placeholder="e.g. Services were delivered on 3 Feb — see delivery-note.pdf attached…" value={response} onChange={(e) => setResponse(e.target.value)} />
          </Field>
        </div>
      )}
    </SlideOver>
  );
}

/* ── refund wizard ── */

function RefundWizard({ d, onClose, notify, setDisputes }: {
  d: Dispute | null; onClose: () => void; notify: Notify;
  setDisputes: React.Dispatch<React.SetStateAction<Dispute[]>>;
}) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("Customer request — disputed charge");
  const [method, setMethod] = useState("M-Pesa reversal");
  const [amt, setAmt] = useState("");
  const [policy, setPolicy] = useState(true);
  const [done, setDone] = useState(false);
  const amount = d ? Number(amt) || d.amount : 0;
  if (!d) return null;
  const execute = () => {
    setDone(true);
    setDisputes((ds) => ds.map((x) => (x.id === d.id ? { ...x, status: "refunded" as const } : x)));
    notify({ tone: "success", title: "Refund processed", body: `${fmt(amount)} returned via ${method}. Ref: RF${Math.floor(Math.random() * 9000 + 1000)}.` });
  };
  return (
    <Modal open={!!d} onClose={onClose} kicker="Refund Workflow" title={`Refund ${d.id}`} subtitle={`${fmt(d.amount)} · ${d.reason}`}
      footer={done ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
        : step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={() => setStep(2)}>Continue →</button></>)
          : (<><button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button><button className="btn pm-btn-primary" onClick={execute}><Undo2 size={15} /> Confirm refund</button></>)}
    >
      <Stepper steps={2} current={step} labels={["Refund details", "Confirm"]} />
      {step === 1 && !done && (
        <div className="pm-wizard-grid">
          <Field label="Reason">
            <select className="form-select pm-input" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option>Customer request — disputed charge</option>
              <option>Duplicate charge</option>
              <option>Service not delivered</option>
              <option>Goodwill gesture</option>
            </select>
          </Field>
          <Field label="Amount (KES)" hint="Leave empty for full refund.">
            <input type="number" className="form-control pm-input pm-input-lg" placeholder={String(d.amount)} value={amt} onChange={(e) => setAmt(e.target.value)} />
          </Field>
          <Field label="Refund method">
            <div className="pm-mode-tabs">
              <button className={cls("pm-mode-tab", method === "M-Pesa reversal" && "pm-mode-on")} onClick={() => setMethod("M-Pesa reversal")}>M-Pesa reversal</button>
              <button className={cls("pm-mode-tab", method === "Original card" && "pm-mode-on")} onClick={() => setMethod("Original card")}>Original card</button>
              <button className={cls("pm-mode-tab", method === "PayMo balance" && "pm-mode-on")} onClick={() => setMethod("PayMo balance")}>PayMo balance</button>
            </div>
          </Field>
          <div className="pm-toggle-row"><Toggle on={policy} onChange={setPolicy} label="Send customer a refund confirmation message" /></div>
        </div>
      )}
      {step === 2 && !done && (
        <div>
          <div className="pm-summary-card">
            <div className="pm-summary-row"><span>Case</span><b>{d.id}</b></div>
            <div className="pm-summary-row"><span>Amount</span><b>{fmt(amount)}</b></div>
            <div className="pm-summary-row"><span>Method</span><b>{method}</b></div>
            <div className="pm-summary-row"><span>Reason</span><b>{reason}</b></div>
          </div>
          <div className="pm-cyan-note">The dispute will be marked <Badge tone="info">Refunded</Badge>, the payment reversed in the ledger, and the customer notified.</div>
        </div>
      )}
      {done && (
        <div className="text-center py-3">
          <div className="pm-big-ic pm-big-ic-success"><CheckCircle2 size={28} /></div>
          <h5 className="fw-bold mt-2">Refund executed</h5>
          <p className="pm-muted">{fmt(amount)} is on its way back to the customer via {method}.</p>
        </div>
      )}
    </Modal>
  );
}

/* ── chargeback log ── */

function ChargebackModal({ open, onClose, notify, customers }: {
  open: boolean; onClose: () => void; notify: Notify; customers: Customer[];
}) {
  const rows = [
    { id: "CB-8871", cust: "c9", amt: 15000, status: "Awaiting evidence", t: addDays(todayISO(), -3) },
    { id: "CB-8790", cust: "c2", amt: 8000, status: "Won", t: addDays(todayISO(), -24) },
  ];
  const custOf = (id: string) => customers.find((c) => c.id === id);
  return (
    <Modal open={open} onClose={onClose} kicker="Chargebacks" title="Card chargeback log" subtitle="Raised by the issuing bank — respond within 7 days."
      size="lg"
      footer={<button className="btn pm-btn-ghost" onClick={onClose}>Close</button>}
    >
      {rows.map((r) => (
        <div className="pm-cb-row" key={r.id}>
          <div className="d-flex align-items-center gap-2">
            <Avatar name={custOf(r.cust)?.name ?? "?"} size={30} />
            <div>
              <div className="fw-semibold pm-fs-13">{r.id} · {custOf(r.cust)?.name}</div>
              <div className="pm-muted pm-fs-11">Raised {fmtDate(r.t)} · {fmt(r.amt)}</div>
            </div>
          </div>
          {r.status === "Awaiting evidence" ? (
            <>
              <Badge tone="danger" dot>{r.status}</Badge>
              <button className="btn pm-btn-soft btn-sm" onClick={() => { notify({ tone: "success", title: "Evidence bundle submitted", body: `${r.id}: invoice, delivery proof and terminal logs sent to the bank.` }); onClose(); }}>
                <MessageCircle size={13} /> Respond with evidence
              </button>
            </>
          ) : (
            <Badge tone="success">{r.status}</Badge>
          )}
        </div>
      ))}
      <div className="pm-note mt-2">Won chargebacks refund the held funds automatically. Lost ones debit your settlement account.</div>
    </Modal>
  );
}
