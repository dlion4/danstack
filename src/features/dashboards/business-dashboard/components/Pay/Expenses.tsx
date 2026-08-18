import { useEffect, useState } from "react";
import {
  Plus, Upload, CheckCircle2, XCircle, Wallet, Coins, Camera,
} from "lucide-react";
import type { Expense } from "../../dataPay";
import { cls, fmt, fmtDate, uid, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, Section, Stepper } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

const CATS = ["Travel", "Meals", "Tools & Equipment", "Software", "Internet & Airtime", "Office", "Other"];

export default function Expenses({ notify }: {
  notify: Notify;
  emit?: (q: QAction) => void;
  qa?: QAction;
  onConsume?: () => void;
}) {
  const [claims, setClaims] = useState<Expense[]>([]);
  const [wizard, setWizard] = useState(false);
  const [detail, setDetail] = useState<Expense | null>(null);
  const [topUp, setTopUp] = useState(false);
  const [petty, setPetty] = useState({ balance: 25000, txs: [{ label: "Fuel float", amt: -15000, t: "today" }, { label: "Top-up from KCB", amt: 20000, t: "3 days ago" }, { label: "Courier stamps", amt: -800, t: "6 days ago" }] });

  useEffect(() => {
    // seed once
    import("../../dataPay").then((m) => setClaims(m.expensesSeed));
  }, []);

  const pending = claims.filter((c) => c.status === "pending");
  const vatReclaim = claims.reduce((s, c) => s + c.vat, 0);

  const approve = (c: Expense) => {
    setClaims((cs) => cs.map((x) => (x.id === c.id ? { ...x, status: "approved" } : x)));
    notify({ tone: "success", title: "Claim approved", body: `${c.emp} · ${fmt(c.amount)} · ready for reimbursement.` });
  };
  const reject = (c: Expense) => {
    setClaims((cs) => cs.map((x) => (x.id === c.id ? { ...x, status: "rejected" } : x)));
    notify({ tone: "danger", title: "Claim rejected", body: `${c.emp} was notified with your reason.` });
  };

  return (
    <>
      <Section
        no="2.7" sub="Money Out · Staff" id="sec-expenses"
        title="Expense Claims & Petty Cash"
        right={<button className="btn pm-btn-out" onClick={() => setWizard(true)}><Plus size={15} /> New Claim</button>}
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Wallet size={16} />} label="Pending claims" value={`${pending.length} claims`} delta={fmt(pending.reduce((s, c) => s + c.amount, 0))} sub="awaiting approval" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="Reimbursed (30d)" value={fmt(claims.filter((c) => c.status === "reimbursed").reduce((s, c) => s + c.amount, 0))} delta="9 claims" sub="avg 1.8 days to pay" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Coins size={16} />} label="VAT reclaimable" value={fmt(vatReclaim)} delta="16% VAT" sub="on receipts with PIN" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Wallet size={16} />} label="Petty cash balance" value={fmt(petty.balance)} delta="KES 20K cap" sub="custodian: Sarah A." /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Claims queue</div><div className="pm-card-sub">Receipts required above KES 2,000</div></div>
              <div className="table-responsive">
                <table className="table pm-table align-middle mb-0">
                  <thead><tr><th>Employee</th><th>Category</th><th className="text-end">Amount</th><th>VAT</th><th>Submitted</th><th>Status</th><th className="text-end" /></tr></thead>
                  <tbody>
                    {claims.map((c) => (
                      <tr key={c.id} className="pm-click-row" onClick={() => setDetail(c)}>
                        <td className="fw-semibold pm-fs-13">{c.emp}</td>
                        <td className="pm-muted pm-fs-13">{c.category}</td>
                        <td className="text-end fw-bold pm-fs-13">{fmt(c.amount)}</td>
                        <td className="pm-fs-13">{c.vat ? <Badge tone="info">+{fmt(c.vat)} reclaimable</Badge> : <span className="pm-muted">—</span>}</td>
                        <td className="pm-muted pm-fs-13">{fmtDate(c.submitted)}</td>
                        <td>
                          {c.status === "pending" && <Badge tone="warning" dot>Pending</Badge>}
                          {c.status === "approved" && <Badge tone="info">Approved</Badge>}
                          {c.status === "reimbursed" && <Badge tone="success">Reimbursed</Badge>}
                          {c.status === "rejected" && <Badge tone="danger">Rejected</Badge>}
                        </td>
                        <td className="text-end">
                          {c.status === "pending" && (
                            <div className="d-inline-flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <button className="pm-icon-btn" onClick={() => reject(c)} aria-label="Reject"><XCircle size={13} /></button>
                              <button className="pm-icon-btn" onClick={() => approve(c)} aria-label="Approve" style={{ color: "#16a34a" }}><CheckCircle2 size={13} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div className="pm-card-title">Petty cash</div>
                <button className="btn pm-btn-soft btn-sm" onClick={() => setTopUp(true)}><Plus size={13} /> Top up</button>
              </div>
              <div className="pm-money-lg t-primary">{fmt(petty.balance)}</div>
              <div className="pm-muted pm-fs-12 mb-2">custodian: Sarah A. · replenish at KES 5,000</div>
              {petty.txs.map((t, i) => (
                <div className="pm-line-view" key={i}>
                  <div className="flex-grow-1">
                    <div className="fw-semibold pm-fs-13">{t.label}</div>
                    <div className="pm-muted pm-fs-11">{t.t}</div>
                  </div>
                  <b className={cls("pm-fs-13", t.amt < 0 ? "t-danger" : "t-success")}>{t.amt < 0 ? "− " + fmt(-t.amt) : "+ " + fmt(t.amt)}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <ClaimWizard open={wizard} onClose={() => setWizard(false)} notify={notify}
        onCreate={(c) => { setClaims((cs) => [c, ...cs]); }} />

      <ClaimDetail c={detail} onClose={() => setDetail(null)} notify={notify}
        onApprove={(x) => { approve(x); setDetail(null); }} onReject={(x) => { reject(x); setDetail(null); }} />

      <Modal open={topUp} onClose={() => setTopUp(false)} kicker="Petty Cash" title="Top up petty cash" subtitle="Transfers from the business wallet to the custodian."
        footer={<><button className="btn pm-btn-ghost" onClick={() => setTopUp(false)}>Cancel</button><button className="btn pm-btn-primary" onClick={() => { setPetty((p) => ({ balance: p.balance + 15000, txs: [{ label: "Top-up from KCB", amt: 15000, t: "just now" }, ...p.txs] })); notify({ tone: "success", title: "Petty cash topped up", body: "+ KES 15,000 → new balance " + fmt(petty.balance + 15000) + "." }); setTopUp(false); }}><Coins size={15} /> Top up KES 15,000</button></>}
      >
        <Field label="Amount (KES)"><input className="form-control pm-input pm-input-lg" defaultValue={15000} /></Field>
        <Field label="From account"><select className="form-select pm-input"><option>KCB Current — •••• 4491</option><option>M-Pesa Business wallet</option></select></Field>
        <div className="pm-note">A signed voucher is created for the custodian and filed to the ledger.</div>
      </Modal>
    </>
  );
}

/* ── claim wizard ── */

function ClaimWizard({ open, onClose, notify, onCreate }: {
  open: boolean; onClose: () => void; notify: Notify; onCreate: (c: Expense) => void;
}) {
  const [step, setStep] = useState(1);
  const [emp, setEmp] = useState("Mary Kamau");
  const [cat, setCat] = useState("Travel");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [vat, setVat] = useState(true);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [approval, setApproval] = useState(true);
  useEffect(() => { if (open) { setStep(1); setEmp("Mary Kamau"); setCat("Travel"); setDesc(""); setAmount(""); setVat(true); setReceipt(null); setApproval(true); } }, [open]);
  const valid1 = desc.trim() && Number(amount) > 0;
  const submit = () => {
    const c: Expense = {
      id: uid("x"), emp, category: cat, desc, amount: Number(amount),
      vat: vat ? Math.round(Number(amount) * 16 / 116) : 0,
      status: approval ? "pending" : "approved", receipt: receipt ?? "no-receipt",
      submitted: new Date().toISOString().slice(0, 10),
    };
    onCreate(c);
    notify({ tone: "success", title: "Claim submitted", body: `${fmt(c.amount)} · ${c.emp} · ${approval ? "pending approval" : "auto-approved (below threshold)"}.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Expense Claims" title="New expense claim"
      footer={
        <>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 3 && <button className="btn pm-btn-primary" disabled={step === 1 && !valid1} onClick={() => setStep(step + 1)}>Continue →</button>}
          {step === 3 && <button className="btn pm-btn-out" onClick={submit}><Upload size={15} /> Submit claim</button>}
        </>
      }
    >
      <Stepper steps={3} current={step} labels={["Details", "Receipt", "Review"]} />
      {step === 1 && (
        <div className="row g-3">
          <div className="col-md-6"><Field label="Employee"><select className="form-select pm-input" value={emp} onChange={(e) => setEmp(e.target.value)}>{["Mary Kamau", "Daniel Otieno", "Faith W.", "Kevin O.", "Mercy J.", "Sarah A.", "Peter N."].map((n) => <option key={n}>{n}</option>)}</select></Field></div>
          <div className="col-md-6"><Field label="Category"><select className="form-select pm-input" value={cat} onChange={(e) => setCat(e.target.value)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field></div>
          <div className="col-12"><Field label="What was it for?" req><input className="form-control pm-input" placeholder="e.g. Fuel for Nakuru site visit" value={desc} onChange={(e) => setDesc(e.target.value)} /></Field></div>
          <div className="col-md-6"><Field label="Amount (KES)" req><input type="number" className="form-control pm-input pm-input-lg" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field></div>
          <div className="col-md-6"><Field label="VAT"><div className="pm-toggle-row"><button className={cls("pm-toggle-wrap")} onClick={() => setVat(!vat)}><span className={cls("pm-toggle", vat && "pm-toggle-on")}><span className="pm-toggle-knob" /></span></button><span className="pm-fs-13 fw-semibold">{vat ? "16% VAT included — reclaimable" : "No VAT"}</span></div></Field></div>
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="pm-wizard-hint">Receipts are required for claims above KES 2,000. Photos are OCR'd for VAT reclaim.</div>
          <div className={cls("pm-dropzone", receipt && "pm-dropzone-has")} onClick={() => setReceipt("receipt-" + Math.floor(Math.random() * 900 + 100) + ".jpg")} role="button">
            <Camera size={22} />
            {receipt ? <><b>{receipt}</b><span className="pm-muted pm-fs-12">Tap to re-take · OCR: supplier + amount + VAT detected</span></> : <><b>Snap or upload the receipt</b><span className="pm-muted pm-fs-12">JPG / PNG / PDF</span></>}
          </div>
          {receipt && <div className="pm-cyan-note mt-2">✓ OCR read: KRA PIN on receipt + VAT {vat ? "16%" : "—"} — ready for VAT reclaim.</div>}
        </div>
      )}
      {step === 3 && (
        <div>
          <div className="pm-summary-card">
            <div className="pm-summary-row"><span>Employee</span><b>{emp}</b></div>
            <div className="pm-summary-row"><span>Category</span><b>{cat}</b></div>
            <div className="pm-summary-row"><span>Description</span><b>{desc}</b></div>
            <div className="pm-summary-row"><span>Amount</span><b>{fmt(Number(amount) || 0)}</b></div>
            <div className="pm-summary-row"><span>VAT reclaim</span><b className="t-success">{vat ? "+ " + fmt(Math.round((Number(amount) || 0) * 16 / 116)) : "—"}</b></div>
            <div className="pm-summary-row"><span>Receipt</span><b>{receipt ?? "missing"}</b></div>
          </div>
          <div className="pm-toggle-row mt-2">
            <button className="pm-toggle-wrap" onClick={() => setApproval(!approval)}>
              <span className={cls("pm-toggle", approval && "pm-toggle-on")}><span className="pm-toggle-knob" /></span>
            </button>
            <span className="pm-fs-13 fw-semibold">Send for approval {approval ? "· owner" : "· auto-approve (< KES 5,000 policy)"}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ── claim detail ── */

function ClaimDetail({ c, onClose, notify, onApprove, onReject }: {
  c: Expense | null; onClose: () => void; notify: Notify;
  onApprove: (c: Expense) => void; onReject: (c: Expense) => void;
}) {
  if (!c) return null;
  return (
    <Modal open={!!c} onClose={onClose} kicker="Claim" title={`${c.emp} — ${fmt(c.amount)}`} subtitle={`${c.category} · submitted ${fmtDate(c.submitted)}`}
      footer={
        c.status === "pending" ? (<>
          <button className="btn pm-btn-danger" onClick={() => onReject(c)}><XCircle size={15} /> Reject</button>
          <button className="btn pm-btn-primary" onClick={() => onApprove(c)}><CheckCircle2 size={15} /> Approve & reimburse</button>
        </>) : (<button className="btn pm-btn-ghost" onClick={onClose}>Close</button>)
      }
    >
      <div className="pm-detail-section">
        <div className="pm-preview-label">Description</div>
        <p className="pm-fs-13">{c.desc}</p>
      </div>
      <div className="pm-evidence">
        <Camera size={14} /> {c.receipt}
        <button className="pm-link-btn ms-auto" onClick={() => notify({ tone: "info", title: "Receipt opened", body: `${c.receipt} (demo preview).` })}>View</button>
      </div>
      <div className="pm-summary-card mt-2">
        <div className="pm-summary-row"><span>Amount</span><b>{fmt(c.amount)}</b></div>
        <div className="pm-summary-row"><span>VAT reclaim</span><b className="t-success">{c.vat ? "+ " + fmt(c.vat) : "—"}</b></div>
        <div className="pm-summary-row"><span>Status</span><b>{c.status}</b></div>
      </div>
    </Modal>
  );
}
