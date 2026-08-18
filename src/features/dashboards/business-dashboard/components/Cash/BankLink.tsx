import { useEffect, useState } from "react";
import {
  Landmark, RefreshCw, Link2, FileText, Loader2, CheckCircle2,
  AlertTriangle, Unlink,
} from "lucide-react";
import type { Account } from "../../dataCash";
import { fmtMoney } from "../../dataCash";
import { cls, fmtDT, todayISO, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, Section, Stepper } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

const BANKS = ["KCB", "Equity", "Co-operative Bank", "NCBA", "Stanbic", "I&M Bank", "DTB", "Absa"];

const UNMATCHED = [
  { id: "u1", desc: "Bank fee — account maintenance", amount: -350, date: todayISO(), candidate: "FEE-0326" },
  { id: "u2", desc: "POS settlement — Visa batch", amount: 61200, date: todayISO(), candidate: "CHRG-88412" },
  { id: "u3", desc: "RTGS in — Jenga Builders refund", amount: 148000, date: todayISO(), candidate: null },
  { id: "u4", desc: "Card annual fee", amount: -1200, date: todayISO(), candidate: null },
];

export default function BankLink({ accounts, setAccounts, notify, qa, onConsume }: {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [connect, setConnect] = useState(false);
  const [reconcile, setReconcile] = useState(false);
  const [disconnect, setDisconnect] = useState<Account | null>(null);
  const [matchFor, setMatchFor] = useState<(typeof UNMATCHED)[number] | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "reconcile") setReconcile(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const linked = accounts.filter((a) => a.linked);

  const sync = (id: string) => {
    setSyncing(id);
    window.setTimeout(() => {
      setSyncing(null);
      notify({ tone: "success", title: "Bank synced", body: `${accounts.find((a) => a.id === id)?.name} statement pulled & auto-reconciled. 4 items need review.` });
    }, 1500);
  };

  return (
    <>
      <Section
        no="3.4" sub="Your Money · Bank Feed" id="sec-banklink"
        title="Bank Link & Reconciliation"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setReconcile(true)}><FileText size={15} /> Reconcile Statement</button>
            <button className="btn pm-btn-cyan" onClick={() => setConnect(true)}><Link2 size={15} /> Connect Bank</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Landmark size={16} />} label="Linked banks" value={`${linked.length} accounts`} delta="KCB + Equity" sub="open-banking feed" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="Reconcile rate" value="99.1%" delta="▲ 0.4 pts" sub="auto-matched items" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<AlertTriangle size={16} />} label="Unmatched items" value="4 items" delta={fmtMoney(148000)} sub="needs review today" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<RefreshCw size={16} />} label="Last sync" value="07:42 today" delta="142 records" sub="both feeds healthy" /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Connected accounts</div><div className="pm-card-sub">Secure open-banking feed — read-only access</div></div>
              {linked.map((a) => (
                <div className="pm-linked-row" key={a.id}>
                  <span className="pm-acc-ic pm-acc-ic-bank"><Landmark size={16} /></span>
                  <div className="flex-grow-1">
                    <div className="fw-semibold pm-fs-13">{a.name} <Badge tone="success" dot>Healthy</Badge></div>
                    <div className="pm-muted pm-fs-11">{a.bank} · {a.number} · last sync today 07:42 · 99.9% uptime</div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn pm-btn-soft btn-sm" disabled={syncing === a.id} onClick={() => sync(a.id)}>
                      <RefreshCw size={13} className={cls(syncing === a.id && "pm-spin")} /> {syncing === a.id ? "Syncing…" : "Sync"}
                    </button>
                    <button className="pm-icon-btn pm-icon-danger" onClick={() => setDisconnect(a)} aria-label="Disconnect"><Unlink size={13} /></button>
                  </div>
                </div>
              ))}
              <div className="pm-cyan-note mt-2">Read-only by design — PayMo can never move money without your PIN, even with a linked bank.</div>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Unmatched items</div><button className="pm-link-btn pm-fs-12" onClick={() => setReconcile(true)}>Open reconciliation →</button></div>
              {UNMATCHED.map((u) => (
                <div className="pm-sched-row" key={u.id}>
                  <div className="flex-grow-1">
                    <div className="fw-semibold pm-fs-13">{u.desc}</div>
                    <div className="pm-muted pm-fs-11">{fmtDT(u.date)} {u.candidate ? `· possible match: ${u.candidate}` : "· no candidate"}</div>
                  </div>
                  <div className="text-end">
                    <b className={cls("pm-fs-13", u.amount > 0 ? "t-success" : "t-danger")}>{u.amount > 0 ? "+" : "−"}{fmtMoney(Math.abs(u.amount))}</b>
                    <div className="mt-1"><button className="pm-link-btn pm-fs-11" onClick={() => setMatchFor(u)}>{u.candidate ? "Review match →" : "Match manually →"}</button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── connect bank wizard (3 steps) ── */}
      <ConnectWizard open={connect} onClose={() => setConnect(false)} notify={notify} setAccounts={setAccounts} />

      {/* ── reconcile wizard (4 steps) ── */}
      <ReconcileWizard open={reconcile} onClose={() => setReconcile(false)} accounts={accounts} notify={notify} />

      {/* ── disconnect ── */}
      <Modal open={!!disconnect} onClose={() => setDisconnect(null)} kicker="Bank Link" title={`Disconnect ${disconnect?.name}?`} subtitle="Statements stop updating automatically."
        footer={<><button className="btn pm-btn-ghost" onClick={() => setDisconnect(null)}>Cancel</button>
          <button className="btn pm-btn-danger" onClick={() => {
            if (disconnect) setAccounts((as) => as.map((a) => (a.id === disconnect.id ? { ...a, linked: false } : a)));
            notify({ tone: "danger", title: "Bank disconnected", body: `${disconnect?.name} feed stopped. Reconnect anytime.` });
            setDisconnect(null);
          }}><Unlink size={15} /> Disconnect</button></>}
      >
        <div className="pm-note">You'll lose auto-reconciliation for this account. Manual CSV import remains available.</div>
      </Modal>

      {/* ── manual match ── */}
      <MatchModal u={matchFor} onClose={() => setMatchFor(null)} notify={notify} />
    </>
  );
}

/* ── connect wizard ── */

function ConnectWizard({ open, onClose, notify, setAccounts }: {
  open: boolean; onClose: () => void; notify: Notify;
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}) {
  const [step, setStep] = useState(1);
  const [bank, setBank] = useState("KCB");
  const [acct, setAcct] = useState("");
  const [token, setToken] = useState("");
  const [agree, setAgree] = useState(false);
  const [verify, setVerify] = useState<"idle" | "checking" | "ok">("idle");
  useEffect(() => { if (open) { setStep(1); setBank("KCB"); setAcct(""); setToken(""); setAgree(false); setVerify("idle"); } }, [open]);
  const doVerify = () => {
    setVerify("checking");
    window.setTimeout(() => {
      setVerify("ok");
      setAccounts((as) => [...as, {
        id: "bnk-" + Date.now(), name: `${bank} Account`, kind: "bank" as const, bank, number: "•••• " + (acct.slice(-4) || "0000"),
        currency: "KES", balance: 0, reserved: 0, spark: [0, 0, 0, 0, 0, 0, 0], monthlyIn: 0, monthlyOut: 0,
        status: "active" as const, purpose: "Linked via open banking — read-only feed.", linked: true,
      }]);
      notify({ tone: "success", title: `${bank} connected`, body: "Verification token confirmed. Statement history is importing (up to 24 months)." });
    }, 1800);
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Open Banking" title="Connect a bank account" size="lg" hideClose={verify === "checking"}
      footer={
        verify === "ok" ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
          : step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" disabled={!bank || !acct} onClick={() => setStep(2)}>Continue →</button></>)
          : (<><button className="btn pm-btn-ghost" disabled={verify === "checking"} onClick={() => setStep(1)}>← Back</button>
            <button className="btn pm-btn-cyan" disabled={!token || !agree || verify === "checking"} onClick={doVerify}>
              {verify === "checking" ? <><Loader2 size={15} className="pm-spin" /> Verifying…</> : <><Link2 size={15} /> Verify & connect</>}
            </button></>)
      }
    >
      <Stepper steps={2} current={step} labels={["Bank details", "Verify"]} />
      {step === 1 && (
        <div className="pm-wizard-grid">
          <Field label="Bank">
            <div className="pm-mode-tabs">
              {BANKS.slice(0, 6).map((b) => (
                <button key={b} className={cls("pm-mode-tab", bank === b && "pm-mode-on")} onClick={() => setBank(b)}>{b}</button>
              ))}
            </div>
          </Field>
          <Field label="Account number" req><input className="form-control pm-input" placeholder="e.g. 1290449123" value={acct} onChange={(e) => setAcct(e.target.value)} /></Field>
          <div className="pm-cyan-note">🔒 Read-only access via open banking. PayMo never sees your passwords and can never initiate transfers without your PIN.</div>
        </div>
      )}
      {step === 2 && (
        verify === "ok" ? (
          <div className="text-center py-3">
            <div className="pm-big-ic pm-big-ic-success mx-auto"><CheckCircle2 size={28} /></div>
            <h5 className="fw-bold mt-3">{bank} connected</h5>
            <p className="pm-muted">Statement history is importing — auto-reconciliation starts immediately.</p>
          </div>
        ) : (
          <div>
            <Field label="Enter the verification token" hint="We sent a 6-digit token to your bank's registered phone.">
              <input className="form-control pm-input pm-input-lg pm-mono" placeholder="••••••" value={token} onChange={(e) => setToken(e.target.value)} />
            </Field>
            <button className={cls("pm-check-list-item w-100", agree && "pm-check-on")} onClick={() => setAgree(!agree)}>
              <span className="pm-checkbox">{agree ? "✓" : ""}</span>
              <span>I authorise read-only statement access for this account</span>
            </button>
            {verify === "checking" && (
              <div className="pm-sync-list mt-3">
                <div className="pm-sync-step pm-sync-active"><Loader2 size={15} className="pm-spin" /> Exchanging with bank's open-banking API…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">2</span> Verifying token…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">3</span> Pulling statement history…</div>
              </div>
            )}
          </div>
        )
      )}
    </Modal>
  );
}

/* ── reconcile wizard (4 steps) ── */

function ReconcileWizard({ open, onClose, accounts, notify }: {
  open: boolean; onClose: () => void; accounts: Account[]; notify: Notify;
}) {
  const [step, setStep] = useState(1);
  const [accId, setAccId] = useState("a1");
  const [importing, setImporting] = useState(false);
  const [matched, setMatched] = useState(0);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [complete, setComplete] = useState(false);
  useEffect(() => { if (open) { setStep(1); setAccId("a1"); setImporting(false); setMatched(0); setReviewed(new Set()); setComplete(false); } }, [open]);

  const startImport = () => {
    setImporting(true);
    window.setTimeout(() => { setImporting(false); setMatched(138); setStep(3); }, 1700);
  };
  const finish = () => {
    setComplete(true);
    notify({ tone: "success", title: "Reconciliation complete", body: `${matched + reviewed.size} of ${matched + UNMATCHED.length} items settled. The books match the bank.` });
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Reconciliation" title="Reconcile a statement" size="lg"
      footer={
        complete ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
          : step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" onClick={() => setStep(2)}>Continue →</button></>)
          : step === 2 ? (<><button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button><button className="btn pm-btn-cyan" disabled={importing} onClick={startImport}>{importing ? <><Loader2 size={15} className="pm-spin" /> Importing…</> : "Import statement"}</button></>)
          : step === 3 ? (<><button className="btn pm-btn-ghost" onClick={() => setStep(2)}>← Back</button><button className="btn pm-btn-cyan" disabled={reviewed.size < UNMATCHED.length} onClick={finish}>Complete reconciliation</button></>)
          : undefined
      }
    >
      <Stepper steps={3} current={step} labels={["Statement", "Import", "Review"]} />
      {step === 1 && (
        <div className="pm-wizard-grid">
          <Field label="Account">
            <select className="form-select pm-input" value={accId} onChange={(e) => setAccId(e.target.value)}>
              {accounts.filter((a) => a.linked).map((a) => <option key={a.id} value={a.id}>{a.name} — {a.bank} {a.number}</option>)}
            </select>
          </Field>
          <Field label="Statement period"><input className="form-control pm-input" defaultValue="March 2026" disabled /></Field>
          <div className="pm-cyan-note">The statement is pulled straight from the bank's open-banking API — nothing to upload.</div>
        </div>
      )}
      {step === 2 && (
        <div className="text-center py-3">
          {!importing ? (
            <>
              <div className="pm-big-ic mx-auto"><FileText size={26} /></div>
              <h6 className="fw-bold mt-2">Ready to import</h6>
              <p className="pm-muted pm-fs-13">~142 statement lines for {accounts.find((a) => a.id === accId)?.name}.</p>
            </>
          ) : (
            <div className="pm-sync-list text-start">
              <div className="pm-sync-step pm-sync-active"><Loader2 size={15} className="pm-spin" /> Pulling statement…</div>
              <div className="pm-sync-step"><span className="pm-sync-num">2</span> Matching against ledger entries…</div>
              <div className="pm-sync-step"><span className="pm-sync-num">3</span> Flagging differences…</div>
            </div>
          )}
        </div>
      )}
      {step === 3 && (
        !complete ? (
          <div>
            <div className="pm-summary-card mb-3">
              <div className="pm-summary-row"><span>Auto-matched</span><b className="t-success">{matched} items ✓</b></div>
              <div className="pm-summary-row"><span>Needing review</span><b>{UNMATCHED.length} items</b></div>
              <div className="pm-summary-row"><span>Reviewed</span><b>{reviewed.size} of {UNMATCHED.length}</b></div>
            </div>
            {UNMATCHED.map((u) => (
              <div className="pm-sched-row" key={u.id}>
                <div className="flex-grow-1">
                  <div className="fw-semibold pm-fs-13">{u.desc}</div>
                  <div className="pm-muted pm-fs-11">{u.candidate ? `Possible match: ${u.candidate}` : "No candidate — decide how to treat it"}</div>
                </div>
                <b className={cls("pm-fs-13", u.amount > 0 ? "t-success" : "t-danger")}>{u.amount > 0 ? "+" : "−"}{fmtMoney(Math.abs(u.amount))}</b>
                <button className="btn pm-btn-soft btn-sm" onClick={() => { setReviewed((s) => new Set(s).add(u.id)); notify({ tone: "info", title: "Item reviewed", body: u.candidate ? `Matched to ledger entry ${u.candidate}.` : "Recorded as a bank-side adjustment." }); }}>
                  {reviewed.has(u.id) ? "✓ Done" : "Review"}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3">
            <div className="pm-big-ic pm-big-ic-success mx-auto"><CheckCircle2 size={28} /></div>
            <h5 className="fw-bold mt-3">Books reconciled</h5>
            <p className="pm-muted">{matched + UNMATCHED.length} items · ledger matches the bank statement exactly.</p>
          </div>
        )
      )}
    </Modal>
  );
}

/* ── manual match ── */

function MatchModal({ u, onClose, notify }: { u: (typeof UNMATCHED)[number] | null; onClose: () => void; notify: Notify }) {
  const [choice, setChoice] = useState("match");
  if (!u) return null;
  const apply = () => {
    notify({ tone: "success", title: "Item resolved", body: choice === "match" ? `Matched to ${u.candidate ?? "closest ledger entry"}.` : choice === "adjust" ? "Recorded as bank-side adjustment." : "Added as a new ledger entry." });
    onClose();
  };
  return (
    <Modal open={!!u} onClose={onClose} kicker="Unmatched Item" title={u.desc} subtitle={`${fmtMoney(Math.abs(u.amount))} on ${u.date}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" onClick={apply}>Apply</button></>}
    >
      <div className="pm-mode-tabs mb-3">
        <button className={cls("pm-mode-tab", choice === "match" && "pm-mode-on")} onClick={() => setChoice("match")}>{u.candidate ? `Match to ${u.candidate}` : "Match to entry…"}</button>
        <button className={cls("pm-mode-tab", choice === "adjust" && "pm-mode-on")} onClick={() => setChoice("adjust")}>Bank adjustment</button>
        <button className={cls("pm-mode-tab", choice === "new" && "pm-mode-on")} onClick={() => setChoice("new")}>New ledger entry</button>
      </div>
      {choice === "match" && !u.candidate && (
        <Field label="Search ledger entries"><input className="form-control pm-input" placeholder="ref or description…" /></Field>
      )}
      <div className="pm-cyan-note">All three options keep the ledger and the bank statement in lockstep.</div>
    </Modal>
  );
}
