import { useEffect, useState } from "react";
import {
  Plus, Landmark, Smartphone, Wallet, Globe, MoreVertical, Eye, ArrowLeftRight,
  Download, Pencil, XCircle, Layers, PiggyBank, Home, Briefcase, SlidersHorizontal, CheckCircle2,
} from "lucide-react";
import type { Account, CashTx } from "../../dataCash";
import { accountsSeed, fmtMoney } from "../../dataCash";
import { cls, downloadCSV, fmtDT, todayISO, uid, type QAction } from "../../lib";
import { Badge, Field, Modal, Section, SlideOver, Sparkline, Stepper, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export const accIcon = (kind: Account["kind"], size = 20) =>
  kind === "bank" ? <Landmark size={size} /> : kind === "mpesa" ? <Smartphone size={size} /> : kind === "fx" ? <Globe size={size} /> : <Wallet size={size} />;

const PRESETS = [
  { id: "vat", name: "VAT / Tax Reserve", desc: "Auto-sweeps tax money for KRA remittance", icon: <PiggyBank size={16} /> },
  { id: "payroll", name: "Payroll Reserve", desc: "Accumulates for monthly staff payments", icon: <Briefcase size={16} /> },
  { id: "rent", name: "Rent / Property", desc: "Ring-fence rental income", icon: <Home size={16} /> },
  { id: "project", name: "Project Savings", desc: "Funds for a specific project or goal", icon: <Layers size={16} /> },
  { id: "buffer", name: "Emergency Buffer", desc: "Rainy-day runway you don't touch", icon: <Wallet size={16} /> },
  { id: "custom", name: "Custom account", desc: "Start from scratch", icon: <SlidersHorizontal size={16} /> },
];

export default function Accounts({ accounts, setAccounts, txs, notify, emit, qa, onConsume }: {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  txs: CashTx[];
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [create, setCreate] = useState(false);
  const [detail, setDetail] = useState<Account | null>(null);
  const [edit, setEdit] = useState<Account | null>(null);
  const [closing, setClosing] = useState<Account | null>(null);
  const [statement, setStatement] = useState<Account | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "newAccount") setCreate(true);
    if (qa.a === "openAccount" && typeof qa.p === "string") {
      const a = accounts.find((x) => x.id === qa.p);
      if (a) setDetail(a);
    }
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const latest = detail ? detail : null;
  const accTxs = (id: string) => txs.filter((t) => t.accountId === id).slice(0, 5);

  return (
    <>
      <Section
        no="3.1" sub="Your Money · Balances" id="sec-accounts"
        title="Virtual Accounts & Balances"
        right={
          <>
            <span className="pm-chip"><Layers size={14} /> {accounts.length} accounts · 3 currencies</span>
            <button className="btn pm-btn-cyan" onClick={() => setCreate(true)}><Plus size={16} /> New Virtual Account</button>
          </>
        }
      >
        <div className="row g-3">
          {accounts.map((a) => (
            <div className="col-12 col-md-6 col-xl-4" key={a.id}>
              <div className={cls("pm-card pm-acc-card", a.status !== "active" && "pm-acc-dim")}>
                <div className="d-flex justify-content-between align-items-start">
                  <span className={cls("pm-acc-ic", `pm-acc-ic-${a.kind}`)}>{accIcon(a.kind, 18)}</span>
                  <div className="d-flex flex-column align-items-end gap-1">
                    {a.status === "active" ? <Badge tone="success" dot>Active</Badge> : <Badge tone="warning" dot>Paused</Badge>}
                    {a.linked && <span className="pm-linked-chip">↔ bank-linked</span>}
                  </div>
                </div>
                <div className="pm-acc-name">{a.name}</div>
                <div className="pm-acc-number pm-mono">{a.number}{a.bank ? ` · ${a.bank}` : ""}</div>
                <div className="pm-acc-balance">{fmtMoney(a.balance, a.currency)}</div>
                {a.reserved > 0 && (
                  <span className="pm-reserved-chip">🔒 {fmtMoney(a.reserved, a.currency)} reserved</span>
                )}
                <div className="pm-acc-stats">
                  <div>
                    <span className="pm-muted pm-fs-11">7-day flow</span>
                    <Sparkline data={a.spark} color="#0e7490" w={86} h={28} />
                  </div>
                  <div className="text-end">
                    <div className="pm-fs-11 pm-muted">in / out · 30d</div>
                    <div className="pm-fs-12"><span className="t-success">+{fmtMoney(a.monthlyIn)}</span></div>
                    <div className="pm-fs-12"><span className="t-danger">−{fmtMoney(a.monthlyOut)}</span></div>
                  </div>
                </div>
                <div className="pm-acc-purpose">{a.purpose}</div>
                <div className="d-flex gap-2 mt-2">
                  <button className="btn pm-btn-soft btn-sm flex-grow-1" onClick={() => setDetail(a)}><Eye size={14} /> View</button>
                  <button className="btn pm-btn-cyan btn-sm flex-grow-1" onClick={() => emit({ a: "transfer", p: a.id })}><ArrowLeftRight size={14} /> Move</button>
                  <div className="pm-menu-wrap">
                    <button className="pm-icon-btn" onClick={() => setMenuFor(menuFor === a.id ? null : a.id)}><MoreVertical size={14} /></button>
                    {menuFor === a.id && (
                      <>
                        <div className="pm-menu-backdrop" onClick={() => setMenuFor(null)} />
                        <div className="pm-menu">
                          <button onClick={() => { setEdit(a); setMenuFor(null); }}><Pencil size={14} /> Edit account</button>
                          <button onClick={() => { setStatement(a); setMenuFor(null); }}><Download size={14} /> Download statement</button>
                          {a.kind === "virtual" && <button className="pm-menu-danger" onClick={() => { setClosing(a); setMenuFor(null); }}><XCircle size={14} /> Close account</button>}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── detail slide-over ── */}
      <SlideOver open={!!detail} onClose={() => setDetail(null)} kicker="Account" title={detail?.name ?? ""} width={520}
        footer={
          latest && (
            <>
              <button className="btn pm-btn-soft btn-sm" onClick={() => { setStatement(latest); setDetail(null); }}><Download size={14} /> Statement</button>
              <button className="btn pm-btn-cyan btn-sm" onClick={() => { setDetail(null); emit({ a: "transfer", p: latest.id }); }}><ArrowLeftRight size={14} /> Move money</button>
            </>
          )
        }
      >
        {latest && (
          <>
            <div className="pm-detail-head">
              <div className="d-flex align-items-center gap-3">
                <span className={cls("pm-acc-ic pm-acc-ic-lg", `pm-acc-ic-${latest.kind}`)}>{accIcon(latest.kind, 20)}</span>
                <div>
                  <div className="fw-bold">{latest.name}</div>
                  <div className="pm-muted pm-fs-12 pm-mono">{latest.number} · {latest.currency}</div>
                </div>
              </div>
              <div className="pm-money-lg mt-3">{fmtMoney(latest.balance, latest.currency)}</div>
              {latest.reserved > 0 && <div className="pm-muted pm-fs-12">🔒 {fmtMoney(latest.reserved, latest.currency)} reserved · available {fmtMoney(latest.balance - latest.reserved, latest.currency)}</div>}
            </div>
            <div className="pm-stat-row">
              <div><b>{fmtMoney(latest.monthlyIn)}</b><span>in · 30d</span></div>
              <div><b>{fmtMoney(latest.monthlyOut)}</b><span>out · 30d</span></div>
              <div><b>{latest.linked ? "Linked" : "Internal"}</b><span>bank status</span></div>
            </div>
            <div className="pm-detail-section mt-3">
              <div className="pm-preview-label">Purpose</div>
              <div className="pm-cyan-note">{latest.purpose}</div>
            </div>
            <div className="pm-detail-section">
              <div className="pm-preview-label">Recent activity</div>
              {accTxs(latest.id).length === 0 && <div className="pm-muted pm-fs-13">No activity yet.</div>}
              {accTxs(latest.id).map((t) => (
                <div className="pm-tx-row mb-2" key={t.id}>
                  <div>
                    <div className="fw-semibold pm-fs-13">{t.desc}</div>
                    <div className="pm-muted pm-fs-11">{fmtDT(t.date)} · {t.ref}</div>
                  </div>
                  <b className={cls("pm-fs-13", t.amount >= 0 ? "t-success" : "t-danger")}>{t.amount >= 0 ? "+" : ""}{fmtMoney(t.amount, latest.currency)}</b>
                </div>
              ))}
            </div>
          </>
        )}
      </SlideOver>

      {/* ── create virtual account wizard ── */}
      <CreateAccountWizard open={create} onClose={() => setCreate(false)} notify={notify} setAccounts={setAccounts} />

      {/* ── edit ── */}
      <EditAccountModal a={edit} onClose={() => setEdit(null)} notify={notify} setAccounts={setAccounts} />

      {/* ── close ── */}
      <CloseAccountModal a={closing} onClose={() => setClosing(null)} notify={notify} setAccounts={setAccounts} />

      {/* ── statement ── */}
      <StatementModal a={statement} onClose={() => setStatement(null)} notify={notify} txs={txs} />
    </>
  );
}

/* ── create virtual account (2 steps) ── */

function CreateAccountWizard({ open, onClose, notify, setAccounts }: {
  open: boolean; onClose: () => void; notify: Notify;
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}) {
  const [step, setStep] = useState(1);
  const [preset, setPreset] = useState("custom");
  const [f, setF] = useState({ name: "", currency: "KES", initial: "", target: "", sweep: false });
  useEffect(() => {
    if (open) {
      setStep(1); setPreset("custom");
      setF({ name: "", currency: "KES", initial: "", target: "", sweep: false });
    }
  }, [open]);
  const valid2 = f.name.trim() && Number(f.initial) >= 0;
  const create = () => {
    const p = PRESETS.find((x) => x.id === preset);
    setAccounts((as) => [...as, {
      id: uid("va"), name: f.name || `${p?.name} (new)`, kind: "virtual" as const, number: `VA-${String(as.length + 1).padStart(2, "0")}`,
      currency: f.currency as "KES", balance: Number(f.initial) || 0, reserved: 0, spark: [0, 0, 0, 0, 0, 0, 0],
      monthlyIn: 0, monthlyOut: 0, status: "active" as const, purpose: f.target ? `Auto-sweep target ${fmtMoney(Number(f.target))}${f.sweep ? " — enabled" : ""}` : p?.desc ?? "Custom virtual account.",
      linked: false,
    }]);
    notify({ tone: "success", title: "Virtual account created", body: `${f.name || p?.name} is live — move money into it anytime.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Your Money" title="Create a virtual account" subtitle="Ring-fence money by purpose — instant, free, internal."
      footer={
        <>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button>}
          {step === 1 && <button className="btn pm-btn-cyan" onClick={() => setStep(2)}>Continue →</button>}
          {step === 2 && <button className="btn pm-btn-cyan" disabled={!valid2} onClick={create}><CheckCircle2 size={15} /> Create account</button>}
        </>
      }
    >
      <Stepper steps={2} current={step} labels={["Choose a purpose", "Configure"]} />
      {step === 1 ? (
        <div className="pm-preset-grid">
          {PRESETS.map((p) => (
            <button key={p.id} className={cls("pm-preset-card", preset === p.id && "pm-preset-on")} onClick={() => setPreset(p.id)}>
              <span className="pm-acc-ic pm-acc-ic-virtual">{p.icon}</span>
              <b>{p.name}</b>
              <span>{p.desc}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="pm-wizard-grid">
          <Field label="Account name" req><input className="form-control pm-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder={PRESETS.find((x) => x.id === preset)?.name} /></Field>
          <div className="row g-2">
            <div className="col-6"><Field label="Currency"><select className="form-select pm-input" value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })}><option>KES</option><option>USD</option><option>EUR</option></select></Field></div>
            <div className="col-6"><Field label="Seed with (optional)"><input type="number" className="form-control pm-input" value={f.initial} onChange={(e) => setF({ ...f, initial: e.target.value })} placeholder="0" /></Field></div>
          </div>
          <Field label="Auto-sweep target (optional)" hint="Sweeps stop moving money in when the balance reaches this cap.">
            <input type="number" className="form-control pm-input" value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })} placeholder="e.g. 150000" />
          </Field>
          <div className="pm-toggle-row"><Toggle on={f.sweep} onChange={(v) => setF({ ...f, sweep: v })} label="Enable weekly auto-sweep from KCB Current" /></div>
          <div className="pm-cyan-note">Virtual accounts are internal — they don't touch the bank and are free forever.</div>
        </div>
      )}
    </Modal>
  );
}

/* ── edit ── */

function EditAccountModal({ a, onClose, notify, setAccounts }: {
  a: Account | null; onClose: () => void; notify: Notify;
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}) {
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [threshold, setThreshold] = useState("");
  useEffect(() => { if (a) { setName(a.name); setPurpose(a.purpose); setThreshold(String(a.lowThreshold ?? "")); } }, [a]);
  if (!a) return null;
  const save = () => {
    setAccounts((as) => as.map((x) => (x.id === a.id ? { ...x, name, purpose, lowThreshold: Number(threshold) || undefined } : x)));
    notify({ tone: "success", title: "Account updated", body: `${name} saved.` });
    onClose();
  };
  return (
    <Modal open={!!a} onClose={onClose} kicker="Account Settings" title={`Edit ${a.name}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" onClick={save}>Save changes</button></>}
    >
      <Field label="Account name"><input className="form-control pm-input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Purpose / note"><textarea className="form-control pm-input" rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} /></Field>
      <Field label="Low-balance alert threshold (KES)" hint="You'll get a notification when the balance crosses this line.">
        <input type="number" className="form-control pm-input" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="e.g. 100000" />
      </Field>
    </Modal>
  );
}

/* ── close account (2 steps) ── */

function CloseAccountModal({ a, onClose, notify, setAccounts }: {
  a: Account | null; onClose: () => void; notify: Notify;
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState("No longer needed");
  const [dest, setDest] = useState("a1");
  useEffect(() => { if (a) { setStep(1); setReason("No longer needed"); setDest("a1"); } }, [a]);
  if (!a) return null;
  const close = () => {
    setAccounts((as) => as.map((x) => (x.id === a.id ? { ...x, status: "closing" } : x)));
    notify({ tone: "warning", title: "Account closing", body: `${a.name} is closing. ${a.balance > 0 ? `KES ${a.balance.toLocaleString()} will move to the selected account.` : "No balance to move."}` });
    onClose();
  };
  return (
    <Modal open={!!a} onClose={onClose} kicker="Close Account" title={`Close ${a.name}?`}
      footer={
        step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" onClick={() => setStep(2)}>Continue →</button></>)
          : (<><button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button><button className="btn pm-btn-danger" onClick={close}>Confirm closure</button></>)
      }
    >
      <Stepper steps={2} current={step} labels={["Reason", "Balance & confirm"]} />
      {step === 1 ? (
        <Field label="Why are you closing it?">
          <select className="form-select pm-input" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>No longer needed</option><option>Consolidating accounts</option><option>Too costly to maintain</option><option>Other</option>
          </select>
        </Field>
      ) : (
        <div>
          <div className="pm-summary-card mb-2">
            <div className="pm-summary-row"><span>Current balance</span><b>{fmtMoney(a.balance, a.currency)}</b></div>
            <div className="pm-summary-row"><span>Move remaining balance to</span>
              <select className="form-select form-select-sm pm-input pm-w-150" value={dest} onChange={(e) => setDest(e.target.value)}>
                {accountsSeed.filter((x) => x.id !== a.id).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>
            </div>
          </div>
          <div className="pm-cyan-note">Closure happens after the balance moves. History is kept read-only for 7 years (audit requirement).</div>
        </div>
      )}
    </Modal>
  );
}

/* ── statement download ── */

function StatementModal({ a, onClose, notify, txs }: {
  a: Account | null; onClose: () => void; notify: Notify; txs: CashTx[];
}) {
  const [range, setRange] = useState("month");
  const [fmtSel, setFmtSel] = useState("csv");
  if (!a) return null;
  const rows = txs.filter((t) => t.accountId === a.id);
  const download = () => {
    downloadCSV(`statement-${a.name.toLowerCase().replace(/\W+/g, "-")}-${todayISO()}.csv`,
      [["Date", "Description", "Category", "Reference", "Amount", "Balance"], ...rows.map((t) => [t.date, t.desc, t.category, t.ref, t.amount, t.balance])]);
    notify({ tone: "success", title: "Statement downloaded", body: `${a.name} · ${range === "month" ? "this month" : range === "quarter" ? "this quarter" : "all time"} · ${rows.length} entries.` });
    onClose();
  };
  return (
    <Modal open={!!a} onClose={onClose} kicker="Statement" title={`${a.name} — statement`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" onClick={download}><Download size={15} /> Download {fmtSel.toUpperCase()}</button></>}
    >
      <Field label="Period">
        <div className="pm-mode-tabs">
          {[["month", "This month"], ["quarter", "This quarter"], ["all", "All time"]].map(([v, l]) => (
            <button key={v} className={cls("pm-mode-tab", range === v && "pm-mode-on")} onClick={() => setRange(v)}>{l}</button>
          ))}
        </div>
      </Field>
      <Field label="Format">
        <div className="pm-radio-grid">
          <button className={cls("pm-radio-card", fmtSel === "csv" && "pm-radio-on")} onClick={() => setFmtSel("csv")}><b>CSV</b><span>Instant — Excel / Sheets</span></button>
          <button className={cls("pm-radio-card", fmtSel === "pdf" && "pm-radio-on")} onClick={() => setFmtSel("pdf")}><b>PDF</b><span>Bank-grade PDF (emailed)</span></button>
        </div>
      </Field>
      <div className="pm-note">{rows.length} ledger entries will be included.</div>
    </Modal>
  );
}
