import { useEffect, useState } from "react";
import {
  Users, Plus, Upload, Send, Loader2, CheckCircle2, Pencil, Trash2, Landmark, Smartphone,
} from "lucide-react";
import type { Beneficiary } from "../../dataCash";
import { bulkSample, fmtMoney } from "../../dataCash";
import { cls, uid, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, Section, Stepper } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;
type BulkRow = { name: string; target: string; method: string; amount: number };

export default function External({ beneficiaries, setBeneficiaries, notify, qa, onConsume }: {
  beneficiaries: Beneficiary[];
  setBeneficiaries: React.Dispatch<React.SetStateAction<Beneficiary[]>>;
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [single, setSingle] = useState(false);
  const [bulk, setBulk] = useState(false);
  const [manage, setManage] = useState(false);
  const [addBen, setAddBen] = useState(false);
  const [editBen, setEditBen] = useState<Beneficiary | null>(null);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "bulk") setBulk(true);
    if (qa.a === "single") setSingle(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  return (
    <>
      <Section
        no="3.5" sub="Your Money · External Rails" id="sec-external"
        title="External Transfers & Bulk Disbursements"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setManage(true)}><Users size={15} /> Beneficiaries</button>
            <button className="btn pm-btn-soft" onClick={() => setSingle(true)}><Send size={15} /> Single Transfer</button>
            <button className="btn pm-btn-cyan" onClick={() => setBulk(true)}><Upload size={15} /> Bulk Disbursement</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Landmark size={16} />} label="PesaLink today" value="3 transfers" delta={fmtMoney(96000)} sub="instant bank-to-bank" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Smartphone size={16} />} label="M-Pesa B2B today" value="5 transfers" delta={fmtMoney(126500)} sub="supplier float" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Users size={16} />} label="Saved beneficiaries" value={`${beneficiaries.length} people`} delta="2 M-Pesa · 3 bank" sub="pre-verified" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Send size={16} />} label="Bulk runs (30d)" value="4 runs" delta={fmtMoney(575500)} sub="across 32 payments" /></div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div className="pm-card-title">Beneficiary list</div>
            <button className="btn pm-btn-soft btn-sm" onClick={() => setAddBen(true)}><Plus size={13} /> Add</button>
          </div>
          <div className="table-responsive">
            <table className="table pm-table align-middle mb-0">
              <thead><tr><th>Name</th><th>Type</th><th>Destination</th><th className="text-end">Per-payment limit</th><th className="text-end" /></tr></thead>
              <tbody>
                {beneficiaries.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-semibold pm-fs-13">{b.name}</td>
                    <td><Badge tone={b.kind === "bank" ? "info" : "success"}>{b.kind === "bank" ? "Bank" : "M-Pesa"}</Badge></td>
                    <td className="pm-muted pm-fs-13 pm-mono">{b.kind === "bank" ? `${b.bank} ${b.account}` : b.phone}</td>
                    <td className="text-end pm-fs-13">{fmtMoney(b.limit)}</td>
                    <td className="text-end">
                      <button className="pm-icon-btn me-1" onClick={() => setEditBen(b)}><Pencil size={13} /></button>
                      <button className="pm-icon-btn pm-icon-danger" onClick={() => { setBeneficiaries((bs) => bs.filter((x) => x.id !== b.id)); notify({ tone: "warning", title: "Beneficiary removed", body: b.name }); }}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ── single transfer wizard ── */}
      <SingleWizard open={single} onClose={() => setSingle(false)} beneficiaries={beneficiaries} notify={notify} />

      {/* ── bulk wizard ── */}
      <BulkWizard open={bulk} onClose={() => setBulk(false)} notify={notify} />

      {/* ── manage list ── */}
      <Modal open={manage} onClose={() => setManage(false)} kicker="Beneficiaries" title="Manage beneficiaries" subtitle={`${beneficiaries.length} saved — pre-verification skips SMS OTP on every payment.`}
        footer={<button className="btn pm-btn-primary w-100" onClick={() => setManage(false)}>Done</button>}
      >
        {beneficiaries.map((b) => (
          <div className="pm-tx-row mb-2" key={b.id}>
            <div>
              <div className="fw-semibold pm-fs-13">{b.name}</div>
              <div className="pm-muted pm-fs-11">{b.email} · {b.kind === "bank" ? `${b.bank} ${b.account}` : b.phone}</div>
            </div>
            <Badge tone={b.kind === "bank" ? "info" : "success"}>{b.kind}</Badge>
          </div>
        ))}
      </Modal>

      {/* ── add/edit beneficiary ── */}
      <BeneficiaryModal open={addBen} onClose={() => setAddBen(false)} notify={notify}
        onSave={(b) => { setBeneficiaries((bs) => [...bs, { ...b, id: uid("be") }]); }} />
      <BeneficiaryModal open={!!editBen} onClose={() => setEditBen(null)} notify={notify} existing={editBen}
        onSave={(b) => { setBeneficiaries((bs) => bs.map((x) => (x.id === b.id ? b : x))); }} />
    </>
  );
}

/* ── single external transfer (3 steps) ── */

function SingleWizard({ open, onClose, beneficiaries, notify }: {
  open: boolean; onClose: () => void; beneficiaries: Beneficiary[]; notify: Notify;
}) {
  const [step, setStep] = useState(1);
  const [ben, setBen] = useState("");
  const [method, setMethod] = useState("PesaLink");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [executing, setExecuting] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { if (open) { setStep(1); setBen(""); setMethod("PesaLink"); setAmount(""); setPin(""); setExecuting(false); setDone(false); } }, [open]);
  const b = beneficiaries.find((x) => x.id === ben);
  const amt = Number(amount) || 0;
  const valid1 = !!b && amt > 0 && amt <= (b?.limit ?? 0);
  const exec = () => {
    setExecuting(true);
    window.setTimeout(() => {
      setExecuting(false); setDone(true);
      notify({ tone: "success", title: "Transfer sent", body: `${fmtMoney(amt)} to ${b?.name} via ${method}. Ref: EXT${Math.floor(Math.random() * 9000 + 1000)}.` });
    }, 1500);
  };
  return (
    <Modal open={open} onClose={onClose} kicker="External Transfer" title="Pay someone outside PayMo" hideClose={executing}
      footer={
        done ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
          : step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" disabled={!valid1} onClick={() => setStep(2)}>Continue →</button></>)
          : (<><button className="btn pm-btn-ghost" disabled={executing} onClick={() => setStep(1)}>← Back</button>
            <button className="btn pm-btn-cyan" disabled={!pin || executing} onClick={exec}>{executing ? <><Loader2 size={15} className="pm-spin" /> Sending…</> : <><Send size={15} /> Send transfer</>}</button></>)
      }
    >
      <Stepper steps={2} current={step} labels={["Beneficiary & amount", "Authorize"]} />
      {step === 1 && (
        <div className="pm-wizard-grid">
          <Field label="Beneficiary" req>
            <select className="form-select pm-input" value={ben} onChange={(e) => setBen(e.target.value)}>
              <option value="">Select…</option>
              {beneficiaries.map((x) => <option key={x.id} value={x.id}>{x.name} — {x.kind === "bank" ? `${x.bank} ${x.account}` : x.phone}</option>)}
            </select>
          </Field>
          <Field label="Method">
            <div className="pm-mode-tabs">
              {["PesaLink", "M-Pesa B2B", "RTGS"].map((m) => (
                <button key={m} className={cls("pm-mode-tab", method === m && "pm-mode-on")} onClick={() => setMethod(m)}>{m}</button>
              ))}
            </div>
          </Field>
          <Field label="Amount (KES)" req hint={b ? `Per-payment limit: ${fmtMoney(b.limit)}` : undefined}>
            <input type="number" className="form-control pm-input pm-input-lg" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          {b && amt > b.limit && <div className="pm-warn-chip">Above this beneficiary's per-payment limit — raise it in Beneficiaries.</div>}
        </div>
      )}
      {step === 2 && (
        done ? (
          <div className="text-center py-3">
            <div className="pm-big-ic pm-big-ic-success mx-auto"><CheckCircle2 size={28} /></div>
            <h5 className="fw-bold mt-3">Transfer sent</h5>
            <p className="pm-muted">{fmtMoney(amt)} to {b?.name} via {method} — settles within minutes.</p>
          </div>
        ) : (
          <div>
            <div className="pm-summary-card mb-3">
              <div className="pm-summary-row"><span>To</span><b>{b?.name}</b></div>
              <div className="pm-summary-row"><span>Via</span><b>{method}</b></div>
              <div className="pm-summary-row"><span>Amount</span><b>{fmtMoney(amt)}</b></div>
            </div>
            <Field label="Enter your PIN" req><input type="password" className="form-control pm-input" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} /></Field>
            <div className="pm-note">External transfers need your PIN — even for saved beneficiaries.</div>
          </div>
        )
      )}
    </Modal>
  );
}

/* ── bulk disbursement (4 steps) ── */

function BulkWizard({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [step, setStep] = useState(1);
  const [source, setSource] = useState("kcb");
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [pin, setPin] = useState("");
  const [auth, setAuth] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { if (open) { setStep(1); setSource("kcb"); setRows([]); setPin(""); setAuth(false); setExecuting(false); setDone(false); } }, [open]);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const setRow = (i: number, p: Partial<BulkRow>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...p } : r)));
  const exec = () => {
    setExecuting(true);
    window.setTimeout(() => {
      setExecuting(false); setDone(true);
      notify({ tone: "success", title: "Bulk disbursement executed", body: `${rows.length} payments · ${fmtMoney(total)} · ${source === "kcb" ? "KCB Current" : "M-Pesa wallet"} → recipients.` });
    }, 2000);
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Bulk Disbursement" title="Pay many people at once" size="lg" hideClose={executing}
      footer={
        done ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
          : step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" onClick={() => setStep(2)}>Continue →</button></>)
          : step === 2 ? (<><button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button><button className="btn pm-btn-cyan" disabled={rows.length === 0} onClick={() => setStep(3)}>Continue → ({rows.length} rows)</button></>)
          : step === 3 ? (<><button className="btn pm-btn-ghost" onClick={() => setStep(2)}>← Back</button><button className="btn pm-btn-cyan" disabled={!pin || !auth || executing} onClick={exec}>{executing ? <><Loader2 size={15} className="pm-spin" /> Disbursing…</> : "Execute bulk payment"}</button></>)
          : undefined
      }
    >
      <Stepper steps={3} current={step} labels={["Source & file", "Review rows", "Authorize"]} />
      {step === 1 && (
        <div className="pm-wizard-grid">
          <Field label="Fund from">
            <div className="pm-check-list">
              {[{ id: "kcb", name: "KCB Current — •••• 4491", bal: fmtMoney(2410300) }, { id: "mpesa", name: "M-Pesa Business Wallet", bal: fmtMoney(612400) }].map((a) => (
                <button key={a.id} className={cls("pm-check-list-item", source === a.id && "pm-check-on")} onClick={() => setSource(a.id)}>
                  <span className="pm-checkbox">{source === a.id ? "✓" : ""}</span>
                  <span className="flex-grow-1 text-start"><b className="pm-fs-13">{a.name}</b><span className="pm-muted pm-fs-11 d-block">{a.bal}</span></span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Recipient list" hint="CSV columns: name, phone or account, amount. Use the template below.">
            <div className="pm-dropzone" role="button" onClick={() => { setRows(bulkSample); notify({ tone: "info", title: "File parsed", body: `${bulkSample.length} rows read: name, destination and amount mapped automatically.` }); }}>
              <Upload size={20} />
              <b>Drop payroll.csv here</b>
              <span className="pm-muted pm-fs-12">or tap to choose — mapped automatically</span>
            </div>
          </Field>
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="table-responsive mb-2">
            <table className="table pm-table align-middle mb-0">
              <thead><tr><th>Name</th><th>Destination</th><th>Method</th><th className="text-end">Amount</th><th /></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="fw-semibold pm-fs-13">{r.name}</td>
                    <td className="pm-mono pm-fs-12">{r.target}</td>
                    <td><Badge tone={r.method === "M-Pesa" ? "success" : "info"}>{r.method}</Badge></td>
                    <td className="text-end"><input type="number" className="form-control form-control-sm pm-input pm-w-110 text-end" value={r.amount} onChange={(e) => setRow(i, { amount: Number(e.target.value) })} /></td>
                    <td><button className="pm-icon-btn pm-icon-danger" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}><Trash2 size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pm-total-panel"><div className="pm-total-row pm-total-grand"><span>Total to disburse</span><b>{fmtMoney(total)}</b></div></div>
        </div>
      )}
      {step === 3 && (
        done ? (
          <div className="text-center py-3">
            <div className="pm-big-ic pm-big-ic-success mx-auto"><CheckCircle2 size={28} /></div>
            <h5 className="fw-bold mt-3">Bulk payment executed</h5>
            <p className="pm-muted">{rows.length} recipients · {fmtMoney(total)} · confirmation messages sent.</p>
          </div>
        ) : (
          <div>
            <div className="pm-summary-card mb-3">
              <div className="pm-summary-row"><span>Recipients</span><b>{rows.length}</b></div>
              <div className="pm-summary-row"><span>Total</span><b>{fmtMoney(total)}</b></div>
              <div className="pm-summary-row"><span>From</span><b>{source === "kcb" ? "KCB •••• 4491" : "M-Pesa wallet"}</b></div>
            </div>
            <div className="row g-3">
              <div className="col-md-6"><Field label="Enter your PIN" req><input type="password" className="form-control pm-input" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} /></Field></div>
              <div className="col-md-6"><Field label="Confirm"><button className={cls("pm-check-list-item w-100", auth && "pm-check-on")} onClick={() => setAuth(!auth)}><span className="pm-checkbox">{auth ? "✓" : ""}</span><span>I authorize this bulk payment</span></button></Field></div>
            </div>
            {executing && (
              <div className="pm-sync-list mt-3">
                <div className="pm-sync-step pm-sync-active"><Loader2 size={15} className="pm-spin" /> Queueing {rows.length} payments…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">2</span> Splitting bank & M-Pesa rails…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">3</span> Transmitting…</div>
              </div>
            )}
          </div>
        )
      )}
    </Modal>
  );
}

/* ── beneficiary add/edit ── */

function BeneficiaryModal({ open, onClose, notify, existing, onSave }: {
  open: boolean; onClose: () => void; notify: Notify; existing?: Beneficiary | null;
  onSave: (b: Beneficiary) => void;
}) {
  const [f, setF] = useState({ name: "", kind: "mpesa", bank: "KCB", account: "", phone: "", email: "", limit: 50000 });
  useEffect(() => {
    if (open) setF(existing ? { name: existing.name, kind: existing.kind, bank: existing.bank ?? "KCB", account: existing.account ?? "", phone: existing.phone ?? "", email: existing.email, limit: existing.limit } : { name: "", kind: "mpesa", bank: "KCB", account: "", phone: "", email: "", limit: 50000 });
  }, [open, existing]);
  const valid = f.name && (f.kind === "mpesa" ? f.phone : f.account);
  const save = () => {
    onSave({
      id: existing?.id ?? uid("be"), name: f.name, kind: f.kind as "mpesa" | "bank",
      bank: f.kind === "bank" ? f.bank : undefined, account: f.kind === "bank" ? f.account : undefined,
      phone: f.kind === "mpesa" ? f.phone : undefined, email: f.email, limit: f.limit,
    });
    notify({ tone: "success", title: existing ? "Beneficiary updated" : "Beneficiary added", body: `${f.name} · ${f.kind === "mpesa" ? f.phone : f.bank + " " + f.account}${existing ? "" : " — OTP verified."}` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Beneficiaries" title={existing ? `Edit ${existing.name}` : "Add beneficiary"}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" disabled={!valid} onClick={save}>Save beneficiary</button></>}
    >
      <div className="pm-wizard-grid">
        <Field label="Name" req><input className="form-control pm-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Type">
          <div className="pm-mode-tabs">
            <button className={cls("pm-mode-tab", f.kind === "mpesa" && "pm-mode-on")} onClick={() => setF({ ...f, kind: "mpesa" })}><Smartphone size={13} /> M-Pesa</button>
            <button className={cls("pm-mode-tab", f.kind === "bank" && "pm-mode-on")} onClick={() => setF({ ...f, kind: "bank" })}><Landmark size={13} /> Bank</button>
          </div>
        </Field>
        {f.kind === "bank" ? (
          <div className="row g-2">
            <div className="col-6"><Field label="Bank"><select className="form-select pm-input" value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })}>{["KCB", "Equity", "Co-op", "NCBA", "Stanbic", "I&M"].map((b) => <option key={b}>{b}</option>)}</select></Field></div>
            <div className="col-6"><Field label="Account number" req><input className="form-control pm-input" value={f.account} onChange={(e) => setF({ ...f, account: e.target.value })} /></Field></div>
          </div>
        ) : (
          <Field label="M-Pesa number" req><input className="form-control pm-input" placeholder="07XX XXX XXX" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        )}
        <Field label="Email (receipts)"><input className="form-control pm-input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Per-payment limit (KES)"><input type="number" className="form-control pm-input" value={f.limit} onChange={(e) => setF({ ...f, limit: Number(e.target.value) })} /></Field>
      </div>
    </Modal>
  );
}
