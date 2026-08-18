import { useEffect, useState } from "react";
import {
  ShieldCheck, CheckCircle2, XCircle, Settings2, UserPlus, Clock, AlertTriangle,
} from "lucide-react";
import type { Bill, Supplier } from "../../dataPay";
import { cls, fmt, fmtDT, fmtDate, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, Section, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Approvals({ bills, setBills, suppliers, notify, qa, onConsume }: {
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  suppliers: Supplier[];
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [detail, setDetail] = useState<Bill | null>(null);
  const [rejectFor, setRejectFor] = useState<Bill | null>(null);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [delegateOpen, setDelegateOpen] = useState(false);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "approveQueue") {
      document.getElementById("sec-approvals")?.scrollIntoView({ behavior: "smooth" });
    }
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const pending = bills.filter((b) => b.status === "pending");
  const queueValue = pending.reduce((s, b) => s + b.amount, 0);
  const suppOf = (id: string) => suppliers.find((s) => s.id === id);

  const approve = (b: Bill) => {
    setBills((bs) => bs.map((x) => (x.id === b.id ? { ...x, status: "approved", approval: undefined, activity: [...x.activity, { t: new Date().toISOString(), text: "Approved by Wanjiru Kariuki", kind: "approved" }] } : x)));
    notify({ tone: "success", title: `${b.number} approved`, body: `${fmt(b.amount)} released for payment scheduling.` });
  };

  return (
    <>
      <Section
        no="2.4" sub="Money Out · Governance" id="sec-approvals"
        title="Approvals & Delegation"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setDelegateOpen(true)}><UserPlus size={15} /> Delegate Approvals</button>
            <button className="btn pm-btn-soft" onClick={() => setPoliciesOpen(true)}><Settings2 size={15} /> Approval Policies</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Clock size={16} />} label="Awaiting my approval" value={`${pending.length} bills`} delta={fmt(queueValue)} sub="total value in queue" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<ShieldCheck size={16} />} label="Approved (30 days)" value={`${bills.filter((b) => b.status === "approved" || b.status === "scheduled" || b.status === "paid").length} bills`} delta={fmt(bills.filter((b) => b.status === "paid").reduce((s, b) => s + b.paid, 0))} sub="eventually paid" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<XCircle size={16} />} label="Rejected (30 days)" value="1 bill" delta="4.1%" sub="of submissions" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="Avg approval time" value="3.1 h" delta="1.2 h" sub="faster than last month" /></div>
        </div>

        {pending.length === 0 ? (
          <div className="pm-card">
            <div className="text-center py-4">
              <div className="pm-big-ic mx-auto mb-2"><ShieldCheck size={24} /></div>
              <b>Queue is clear 🎉</b>
              <div className="pm-muted pm-fs-13">No bills are waiting for approval right now.</div>
            </div>
          </div>
        ) : (
          <div className="pm-card">
            <div className="pm-card-head">
              <div className="pm-card-title">Approval queue</div>
              <div className="pm-card-sub">You are step 2 of 2 on every chain below.</div>
            </div>
            {pending.map((b) => {
              const s = suppOf(b.supplierId);
              return (
                <div className="pm-approval-row" key={b.id}>
                  <div className="pm-approval-row-head">
                    <div className="d-flex align-items-center gap-3">
                      <button className="pm-num-link pm-fs-14" onClick={() => setDetail(b)}>{b.number}</button>
                      <b className="pm-fs-13">{s?.name}</b>
                      <span className="pm-muted pm-fs-12">{s?.category}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {b.approval?.urgency === "high" && <Badge tone="danger" dot>High urgency</Badge>}
                      {b.approval?.urgency === "medium" && <Badge tone="warning" dot>Medium</Badge>}
                      {b.approval?.urgency === "low" && <Badge tone="muted">Low</Badge>}
                      <b className="pm-fs-14">{fmt(b.amount)}</b>
                    </div>
                  </div>
                  <div className="pm-approval-chain">
                    {(b.approval?.chain ?? []).map((p, i) => (
                      <span key={i} className={cls("pm-approval-step", i === 0 && "pm-approval-step-done", i === 1 && "pm-approval-step-you")}>
                        <i>{i === 0 ? "✓" : i + 1}</i>{p}
                        {i === 1 && <em>you</em>}
                      </span>
                    ))}
                    <span className="pm-muted pm-fs-11 ms-2">submitted {fmtDT(b.approval?.submitted ?? "")} by {b.approval?.requester}</span>
                  </div>
                  <div className="d-flex gap-2 justify-content-end">
                    <button className="btn pm-btn-soft btn-sm" onClick={() => setDetail(b)}>Review</button>
                    <button className="btn pm-btn-danger-soft btn-sm" onClick={() => setRejectFor(b)}><XCircle size={13} /> Reject</button>
                    <button className="btn pm-btn-primary btn-sm" onClick={() => approve(b)}><CheckCircle2 size={13} /> Approve</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pm-tip mt-3">
          <AlertTriangle size={15} />
          <span><b>Policy reminder:</b> dual approval is required for bills above KES 500K. A director PIN is required above KES 1M. <button className="pm-link-btn" onClick={() => setPoliciesOpen(true)}>Edit thresholds →</button></span>
        </div>
      </Section>

      {/* ── detail ── */}
      <ApprovalDetail b={detail} onClose={() => setDetail(null)} supplier={detail ? suppOf(detail.supplierId) : undefined}
        onApprove={(x) => { approve(x); setDetail(null); }} onReject={(x) => { setDetail(null); setRejectFor(x); }} />

      {/* ── reject ── */}
      <RejectModal b={rejectFor} onClose={() => setRejectFor(null)} notify={notify} setBills={setBills} />

      {/* ── policies ── */}
      <PoliciesModal open={policiesOpen} onClose={() => setPoliciesOpen(false)} notify={notify} />

      {/* ── delegation ── */}
      <DelegateModal open={delegateOpen} onClose={() => setDelegateOpen(false)} notify={notify} />
    </>
  );
}

/* ── detail ── */

function ApprovalDetail({ b, onClose, supplier, onApprove, onReject }: {
  b: Bill | null; onClose: () => void; supplier?: Supplier;
  onApprove: (b: Bill) => void; onReject: (b: Bill) => void;
}) {
  if (!b) return null;
  return (
    <Modal open={!!b} onClose={onClose} kicker="Approval Request" title={`${b.number} — ${supplier?.name}`} subtitle={`Requested by ${b.approval?.requester} · ${fmtDT(b.approval?.submitted ?? "")}`}
      size="lg"
      footer={
        <>
          <button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
          <button className="btn pm-btn-danger" onClick={() => onReject(b)}><XCircle size={15} /> Reject</button>
          <button className="btn pm-btn-primary" onClick={() => onApprove(b)}><CheckCircle2 size={15} /> Approve {fmt(b.amount)}</button>
        </>
      }
    >
      <div className="pm-summary-card mb-3">
        <div className="pm-summary-row"><span>Supplier</span><b>{supplier?.name} · {supplier?.category}</b></div>
        <div className="pm-summary-row"><span>Amount</span><b>{fmt(b.amount)}</b></div>
        <div className="pm-summary-row"><span>Due</span><b>{fmtDate(b.due)}</b></div>
        <div className="pm-summary-row"><span>WHT</span><b className="t-danger">{fmt(b.lines.reduce((s, l) => s + (l.qty * l.price - l.disc) * l.wht / 100, 0))} to KRA</b></div>
        <div className="pm-summary-row"><span>eTIMS</span><b>{b.etims}</b></div>
        {b.po && <div className="pm-summary-row"><span>PO</span><b className="pm-mono">{b.po}</b></div>}
      </div>
      <div className="pm-preview-label">Line items</div>
      {b.lines.map((l, i) => (
        <div className="pm-line-view" key={i}>
          <div className="flex-grow-1 pm-fs-13"><b>{l.desc}</b><span className="pm-muted pm-fs-11"> · {l.qty} {l.unit} × {fmt(l.price)} · VAT {l.tax}% · WHT {l.wht}%</span></div>
          <b className="pm-fs-13">{fmt(l.qty * l.price - l.disc)}</b>
        </div>
      ))}
      <div className="pm-cyan-note mt-3">Approving releases the bill to the payment scheduler. You can still cancel the payment before it executes.</div>
    </Modal>
  );
}

/* ── reject ── */

function RejectModal({ b, onClose, notify, setBills }: {
  b: Bill | null; onClose: () => void; notify: Notify;
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
}) {
  const [reason, setReason] = useState("Amount / pricing disputed");
  const [note, setNote] = useState("");
  if (!b) return null;
  const reject = () => {
    setBills((bs) => bs.map((x) => (x.id === b.id ? {
      ...x, status: "draft" as const, approval: undefined,
      activity: [...x.activity, { t: new Date().toISOString(), text: `Rejected by Wanjiru Kariuki — ${reason}${note ? " (" + note + ")" : ""}`, kind: "note" }],
    } : x)));
    notify({ tone: "danger", title: `${b.number} rejected`, body: "Returned to drafts. The requester has been notified." });
    onClose();
  };
  return (
    <Modal open={!!b} onClose={onClose} kicker="Reject Approval" title={`Reject ${b.number}?`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-danger" onClick={reject}>Reject & return to drafts</button></>}
    >
      <Field label="Reason">
        <select className="form-select pm-input" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option>Amount / pricing disputed</option><option>Wrong supplier or duplicate</option><option>Missing supporting documents</option><option>Budget not available</option><option>Other</option>
        </select>
      </Field>
      <Field label="Note to requester"><textarea className="form-control pm-input" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional — helps the requester fix it quickly" /></Field>
    </Modal>
  );
}

/* ── policies ── */

function PoliciesModal({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [f, setF] = useState({
    low: 5000, single: 50000, dual: 500000, pin: 1000000,
    auto: true, dualOn: true, pinOn: true,
  });
  const save = () => {
    notify({ tone: "success", title: "Approval policies saved", body: `Auto-approve < ${fmt(f.low)} · single < ${fmt(f.single)} · dual < ${fmt(f.dual)} · director PIN ≥ ${fmt(f.pin)}.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Governance" title="Approval policies" subtitle="Thresholds apply to bills, expenses and payment runs."
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={save}>Save policies</button></>}
    >
      <div className="row g-3">
        <div className="col-6"><Field label="Auto-approve below (KES)"><input type="number" className="form-control pm-input" value={f.low} onChange={(e) => setF({ ...f, low: Number(e.target.value) })} /></Field></div>
        <div className="col-6"><Field label="Single approval below (KES)"><input type="number" className="form-control pm-input" value={f.single} onChange={(e) => setF({ ...f, single: Number(e.target.value) })} /></Field></div>
        <div className="col-6"><Field label="Dual approval below (KES)"><input type="number" className="form-control pm-input" value={f.dual} onChange={(e) => setF({ ...f, dual: Number(e.target.value) })} /></Field></div>
        <div className="col-6"><Field label="Director PIN required at (KES)"><input type="number" className="form-control pm-input" value={f.pin} onChange={(e) => setF({ ...f, pin: Number(e.target.value) })} /></Field></div>
      </div>
      <div className="pm-toggle-row"><Toggle on={f.auto} onChange={(v) => setF({ ...f, auto: v })} label="Auto-approve small recurring bills" /></div>
      <div className="pm-toggle-row"><Toggle on={f.dualOn} onChange={(v) => setF({ ...f, dualOn: v })} label="Enable dual approval" /></div>
      <div className="pm-toggle-row"><Toggle on={f.pinOn} onChange={(v) => setF({ ...f, pinOn: v })} label="Require director PIN for large amounts" /></div>
      <div className="pm-note mt-2">Current approver pool: Wanjiru Kariuki (owner), Peter N. (finance).</div>
    </Modal>
  );
}

/* ── delegation ── */

function DelegateModal({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [user, setUser] = useState("Peter N. (Finance)");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [scope, setScope] = useState("bills");
  const save = () => {
    if (!from || !to) { notify({ tone: "warning", title: "Pick both dates", body: "Choose the delegation window." }); return; }
    notify({ tone: "success", title: "Delegation active", body: `${user} can approve ${scope} from ${from} to ${to}. You'll be copied on every decision.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Delegation" title="Delegate approvals while away"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={save}>Activate delegation</button></>}
    >
      <div className="pm-wizard-grid">
        <Field label="Delegate to"><select className="form-select pm-input" value={user} onChange={(e) => setUser(e.target.value)}><option>Peter N. (Finance)</option><option>Mary Kamau (Ops)</option><option>Grace M. (Engineering)</option></select></Field>
        <div className="row g-2">
          <div className="col-6"><Field label="From"><input type="date" className="form-control pm-input" value={from} onChange={(e) => setFrom(e.target.value)} /></Field></div>
          <div className="col-6"><Field label="To"><input type="date" className="form-control pm-input" value={to} onChange={(e) => setTo(e.target.value)} /></Field></div>
        </div>
        <Field label="Scope">
          <div className="pm-mode-tabs">
            <button className={cls("pm-mode-tab", scope === "bills" && "pm-mode-on")} onClick={() => setScope("bills")}>Bills only</button>
            <button className={cls("pm-mode-tab", scope === "expenses" && "pm-mode-on")} onClick={() => setScope("expenses")}>Expenses only</button>
            <button className={cls("pm-mode-tab", scope === "all" && "pm-mode-on")} onClick={() => setScope("all")}>Everything</button>
          </div>
        </Field>
        <div className="pm-cyan-note">Delegated approvals stay within the same limits — dual-approval thresholds still apply.</div>
      </div>
    </Modal>
  );
}
