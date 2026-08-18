import { useEffect, useMemo, useState } from "react";
import {
  Wallet, ShieldCheck, Lock, Loader2, CheckCircle2, Globe, AlertTriangle, Landmark, Smartphone,
} from "lucide-react";
import type { Bill, Supplier } from "../../dataPay";
import { fxSeed, runsSeed } from "../../dataPay";
import { cls, fmt, fmtDate, todayISO, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, Section, Stepper } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function PaymentRun({ bills, setBills, suppliers, notify, qa, onConsume }: {
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  suppliers: Supplier[];
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [wizard, setWizard] = useState(false);
  const [preselect, setPreselect] = useState<string[] | null>(null);
  const [fxOpen, setFxOpen] = useState(false);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "payRun") {
      setPreselect(Array.isArray(qa.p) ? (qa.p as string[]) : null);
      setWizard(true);
    }
    if (qa.a === "fx") setFxOpen(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const payable = bills.filter((b) => ["approved", "overdue"].includes(b.status));
  const totalPayable = payable.reduce((s, b) => s + b.amount, 0);

  return (
    <>
      <Section
        no="2.5" sub="Money Out · Batch Disbursement" id="sec-runs"
        title="Payment Runs"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setFxOpen(true)}><Globe size={15} /> FX Exposure</button>
            <button className="btn pm-btn-out" onClick={() => { setPreselect(null); setWizard(true); }}><Wallet size={15} /> Start Payment Run</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Wallet size={16} />} label="Ready to pay" value={`${payable.length} bills`} delta={fmt(totalPayable)} sub="approved + overdue" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Landmark size={16} />} label="Business wallet" value="KES 2.41M" delta="KCB •••• 4491" sub="sufficient for all runs" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Smartphone size={16} />} label="M-Pesa B2B wallet" value="KES 612,400" delta="float top-up +15K" sub="processing" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<ShieldCheck size={16} />} label="Completed runs (30d)" value="3 runs" delta={fmt(575500)} sub="across 9 bills" /></div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div className="pm-card-title">Recent payment runs</div>
            <button className="pm-link-btn pm-fs-12" onClick={() => { setPreselect(null); setWizard(true); }}>New run →</button>
          </div>
          <div className="table-responsive">
            <table className="table pm-table align-middle mb-0">
              <thead><tr><th>Run</th><th>Bills</th><th className="text-end">Total</th><th>Channel</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {runsSeed.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-semibold pm-fs-13">{r.title}</td>
                    <td className="pm-muted pm-fs-13">{r.bills} bills</td>
                    <td className="text-end fw-bold pm-fs-13">{fmt(r.total)}</td>
                    <td className="pm-fs-13">{r.channel}</td>
                    <td className="pm-muted pm-fs-13">{fmtDate(r.date)}</td>
                    <td><Badge tone="success" dot>Completed</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      <RunWizard open={wizard} onClose={() => setWizard(false)} bills={bills} setBills={setBills} suppliers={suppliers} notify={notify} preselect={preselect} />
      <FxModal open={fxOpen} onClose={() => setFxOpen(false)} notify={notify} />
    </>
  );
}

/* ═══════════════════════ Payment run wizard (2.5) ═══════════════════════ */

function RunWizard({ open, onClose, bills, setBills, suppliers, notify, preselect }: {
  open: boolean; onClose: () => void; bills: Bill[]; setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  suppliers: Supplier[]; notify: Notify; preselect: string[] | null;
}) {
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [account, setAccount] = useState("kcb");
  const [method, setMethod] = useState("M-Pesa B2B");
  const [date, setDate] = useState(todayISO());
  const [pin, setPin] = useState("");
  const [auth, setAuth] = useState(false);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [fxLocks, setFxLocks] = useState<Record<string, boolean>>({ fx1: true });

  const payable = bills.filter((b) => ["approved", "overdue"].includes(b.status));

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setPhase("idle");
    setPin("");
    setAuth(false);
    setAccount("kcb");
    setMethod("M-Pesa B2B");
    setDate(todayISO());
    const init = preselect ?? payable.map((b) => b.id);
    setSel(new Set(init.filter((id) => payable.some((b) => b.id === id))));
  }, [open, preselect]); // eslint-disable-line react-hooks/exhaustive-deps

  const suppOf = (id: string) => suppliers.find((s) => s.id === id);
  const chosen = payable.filter((b) => sel.has(b.id));
  const total = chosen.reduce((s, b) => s + b.amount, 0);
  const bySupplier = useMemo(() => {
    const map = new Map<string, { name: string; count: number; total: number }>();
    chosen.forEach((b) => {
      const s = suppOf(b.supplierId);
      const k = s?.id ?? b.supplierId;
      const cur = map.get(k) ?? { name: s?.name ?? "Unknown", count: 0, total: 0 };
      cur.count += 1;
      cur.total += b.amount;
      map.set(k, cur);
    });
    return [...map.values()];
  }, [chosen, suppliers]);

  const needsDual = total > 500000;

  const execute = () => {
    setPhase("running");
    window.setTimeout(() => {
      setPhase("done");
      setBills((bs) => bs.map((b) => (sel.has(b.id) ? {
        ...b, status: "paid" as const, paid: b.amount, etims: "verified",
        activity: [...b.activity, { t: new Date().toISOString(), text: `Paid ${fmt(b.amount)} via ${method} (batch run)`, kind: "paid" }],
        payments: [...b.payments, { id: "run-" + Date.now(), amount: b.amount, method, ref: `RUN-${date.slice(5).replace("-", "")}`, t: new Date().toISOString(), status: "settled" }],
      } : b)));
      notify({ tone: "success", title: "Payment run executed", body: `${chosen.length} bills · ${fmt(total)} via ${method}. WHT certificates queued for all suppliers.` });
    }, 1800);
  };

  return (
    <Modal open={open} onClose={onClose} kicker="Batch Payment Run" title="Payment run builder" size="lg" hideClose={phase === "running"}
      footer={
        phase === "done" ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
          : step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" disabled={sel.size === 0} onClick={() => setStep(2)}>Continue → ({sel.size} bills)</button></>)
          : step === 2 ? (<><button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button><button className="btn pm-btn-primary" onClick={() => setStep(3)}>Review →</button></>)
          : step === 3 ? (<><button className="btn pm-btn-ghost" onClick={() => setStep(2)}>← Back</button><button className="btn pm-btn-out" onClick={() => setStep(4)}>Proceed to authorize →</button></>)
          : (<><button className="btn pm-btn-ghost" disabled={phase === "running"} onClick={() => setStep(3)}>← Back</button>
            <button className="btn pm-btn-out" disabled={phase === "running" || !pin || !auth} onClick={execute}>
              {phase === "running" ? <><Loader2 size={15} className="pm-spin" /> Disbursing…</> : <><Lock size={15} /> Execute run</>}
            </button></>)
      }
    >
      <Stepper steps={4} current={step} labels={["Select bills", "Funding & FX", "Review", "Authorize"]} />

      {step === 1 && (
        <div>
          <div className="pm-wizard-hint">{payable.length} bills are cleared for payment ({fmt(payable.reduce((s, b) => s + b.amount, 0))} total). Pick which to include — or run all.</div>
          <div className="d-flex gap-2 mb-2">
            <button className="btn pm-btn-soft btn-sm" onClick={() => setSel(new Set(payable.map((b) => b.id)))}>Select all</button>
            <button className="btn pm-btn-ghost btn-sm" onClick={() => setSel(new Set())}>Clear</button>
          </div>
          <div className="pm-select-list">
            {payable.map((b) => {
              const s = suppOf(b.supplierId);
              const on = sel.has(b.id);
              return (
                <button key={b.id} className={cls("pm-check-list-item", on && "pm-check-on")} onClick={() => setSel((x) => { const n = new Set(x); on ? n.delete(b.id) : n.add(b.id); return n; })}>
                  <span className="pm-checkbox">{on ? "✓" : ""}</span>
                  <span className="flex-grow-1 text-start">
                    <b className="pm-fs-13">{b.number} · {s?.name}</b>
                    <span className="pm-muted pm-fs-11 d-block">Due {fmtDate(b.due)} · {b.status === "overdue" ? "overdue" : "approved"}</span>
                  </span>
                  <b className="pm-fs-13">{fmt(b.amount)}</b>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="row g-3">
          <div className="col-md-6">
            <Field label="Fund from">
              <div className="pm-check-list">
                {[
                  { id: "kcb", name: "KCB Current — •••• 4491", bal: "KES 2,410,300", ic: <Landmark size={16} /> },
                  { id: "mpesa", name: "M-Pesa Business wallet", bal: "KES 612,400", ic: <Smartphone size={16} /> },
                ].map((a) => (
                  <button key={a.id} className={cls("pm-check-list-item", account === a.id && "pm-check-on")} onClick={() => setAccount(a.id)}>
                    <span className="pm-checkbox">{account === a.id ? "✓" : ""}</span>
                    <span className="pm-chan-ic pm-chan-ic-pesalink">{a.ic}</span>
                    <span className="flex-grow-1 text-start"><b className="pm-fs-13">{a.name}</b><span className="pm-muted pm-fs-11 d-block">{a.bal}</span></span>
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <div className="col-md-6">
            <Field label="Disbursement channel">
              <div className="pm-mode-tabs">
                {["M-Pesa B2B", "PesaLink", "RTGS"].map((m) => (
                  <button key={m} className={cls("pm-mode-tab", method === m && "pm-mode-on")} onClick={() => setMethod(m)}>{m}</button>
                ))}
              </div>
            </Field>
            <Field label="Execution date"><input type="date" className="form-control pm-input" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <div className="pm-preview-label">FX on this run</div>
            {fxSeed.filter((f) => chosen.some((b) => b.number === f.bill)).length === 0 ? (
              <div className="pm-cyan-note">This run is entirely in KES — no FX conversion required. 💱</div>
            ) : (
              fxSeed.filter((f) => chosen.some((b) => b.number === f.bill)).map((f) => (
                <div className="pm-evidence" key={f.id}>
                  <Globe size={14} /> {f.bill} · USD {f.usd.toLocaleString()}
                  <b className="ms-auto pm-fs-12">KES {f.kes.toLocaleString()}</b>
                  <button className="pm-link-btn pm-fs-12" onClick={() => { setFxLocks((x) => ({ ...x, [f.id]: !x[f.id] })); notify({ tone: "info", title: fxLocks[f.id] ? "Rate unlocked" : "Rate locked at 129.4", body: fxLocks[f.id] ? "You're exposed to market drift now." : "KES amount fixed until payment executes." }); }}>
                    {fxLocks[f.id] ? "Rate locked ✓" : "Lock rate"}
                  </button>
                </div>
              ))
            )}
            <div className="pm-note mt-2">Fee estimate: {method === "RTGS" ? "KES 300 flat" : method === "PesaLink" ? "free (PesaLink)" : "KES 45 per payment"} · settles within 5 minutes.</div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="pm-preview-label">Aggregated per supplier</div>
          <div className="pm-card mb-3">
            {bySupplier.map((g) => (
              <div className="pm-tx-row mb-2" key={g.name}>
                <div>
                  <div className="fw-semibold pm-fs-13">{g.name}</div>
                  <div className="pm-muted pm-fs-11">{g.count} bill(s) · {method} from {account === "kcb" ? "KCB •••• 4491" : "M-Pesa wallet"}</div>
                </div>
                <b className="pm-fs-14">{fmt(g.total)}</b>
              </div>
            ))}
          </div>
          <div className="pm-summary-card">
            <div className="pm-summary-row"><span>Bills</span><b>{chosen.length}</b></div>
            <div className="pm-summary-row"><span>Total disbursement</span><b>{fmt(total)}</b></div>
            <div className="pm-summary-row"><span>Execution</span><b>{date} · {method}</b></div>
            <div className="pm-summary-row"><span>Authorization</span><b>{needsDual ? "Dual approval + Director PIN" : "Single approval + PIN"}</b></div>
          </div>
        </div>
      )}

      {step === 4 && (
        phase === "done" ? (
          <div className="text-center py-3">
            <div className="pm-big-ic pm-big-ic-success mx-auto"><CheckCircle2 size={28} /></div>
            <h5 className="fw-bold mt-3">Run executed</h5>
            <p className="pm-muted">{fmt(total)} sent to {bySupplier.length} supplier(s) via {method}. Bills marked Paid, eTIMS receipts filed, WHT certificates queued.</p>
          </div>
        ) : (
          <div>
            <div className="pm-summary-card mb-3">
              <div className="pm-summary-row"><span>Disbursing</span><b>{fmt(total)} to {bySupplier.length} supplier(s)</b></div>
              <div className="pm-summary-row"><span>From</span><b>{account === "kcb" ? "KCB •••• 4491" : "M-Pesa Business wallet"}</b></div>
              <div className="pm-summary-row"><span>Via</span><b>{method}</b></div>
            </div>
            {needsDual ? (
              <div className="pm-warn-chip w-100 justify-content-start mb-3"><AlertTriangle size={14} /> This run exceeds KES 500K — dual approval required. A second approver must authorize before execution.</div>
            ) : (
              <div className="pm-note mb-3">Single approval applies (run under KES 500K). Your PIN authorizes the disbursement.</div>
            )}
            <div className="row g-3">
              <div className="col-md-6"><Field label="Director PIN" req><input type="password" className="form-control pm-input" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} /></Field></div>
              <div className="col-md-6">
                <Field label="Confirm">
                  <button className={cls("pm-check-list-item w-100", auth && "pm-check-on")} onClick={() => setAuth(!auth)}>
                    <span className="pm-checkbox">{auth ? "✓" : ""}</span>
                    <span>I authorize this payment run</span>
                  </button>
                </Field>
              </div>
            </div>
            {phase === "running" && (
              <div className="pm-sync-list mt-3">
                <div className="pm-sync-step pm-sync-active"><Loader2 size={15} className="pm-spin" /> Creating {chosen.length} disbursement instructions…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">2</span> Verifying balances & PIN…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">3</span> Transmitting to {method}…</div>
              </div>
            )}
          </div>
        )
      )}
    </Modal>
  );
}

/* ── FX modal ── */

function FxModal({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [locks, setLocks] = useState<Record<string, boolean>>({ fx1: true, fx2: false });
  const doLock = (id: string) => {
    setLocks((x) => ({ ...x, [id]: !x[id] }));
    notify({ tone: "info", title: locks[id] ? "Rate unlocked" : "Rate locked at 129.4", body: locks[id] ? "You're exposed to market drift now." : "KES amount fixed until payment executes." });
  };
  return (
    <Modal open={open} onClose={onClose} kicker="FX Exposure" title="Foreign-currency bills" subtitle="Lock the KES/USD rate now to remove drift risk."
      footer={<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>}
    >
      {fxSeed.map((f) => (
        <div className="pm-fx-row" key={f.id}>
          <div className="flex-grow-1">
            <div className="fw-semibold pm-fs-13">{f.bill} · {f.supplier}</div>
            <div className="pm-muted pm-fs-11">USD {f.usd.toLocaleString()} × {f.rate} = KES {f.kes.toLocaleString()}</div>
          </div>
          <div className="text-end">
            <Badge tone={locks[f.id] ? "success" : "warning"}>{locks[f.id] ? "Rate locked" : "Floating"}</Badge>
            <div className="mt-1"><button className="pm-link-btn pm-fs-12" onClick={() => doLock(f.id)}>{locks[f.id] ? "Unlock" : "Lock at 129.4"}</button></div>
          </div>
        </div>
      ))}
      <div className="pm-note mt-2">Locked rates are held by PayMo's FX desk at no extra fee for up to 30 days.</div>
    </Modal>
  );
}
