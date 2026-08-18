import { useEffect, useState } from "react";
import {
  ArrowLeftRight, CalendarClock, Zap, Loader2, CheckCircle2,
  ArrowDownUp, Repeat,
} from "lucide-react";
import type { Account } from "../../dataCash";
import { fmtMoney } from "../../dataCash";
import { addDays, cls, fmtDT, todayISO, uid, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, Section, Stepper } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;
type Transfer = { id: string; from: string; to: string; amount: number; date: string; status: "completed" | "scheduled"; memo: string };

export default function MoveMoney({ accounts, setAccounts, transfers, setTransfers, notify, qa, onConsume }: {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  transfers: Transfer[];
  setTransfers: React.Dispatch<React.SetStateAction<Transfer[]>>;
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [wizard, setWizard] = useState(false);
  const [presetFrom, setPresetFrom] = useState<string | null>(null);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "transfer") {
      setPresetFrom(typeof qa.p === "string" ? qa.p : null);
      setWizard(true);
    }
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;
  const completed = transfers.filter((t) => t.status === "completed");
  const scheduled = transfers.filter((t) => t.status === "scheduled");
  const moved30d = completed.reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <Section
        no="3.3" sub="Your Money · Internal" id="sec-transfers"
        title="Move Money — Internal Transfers"
        right={
          <button className="btn pm-btn-cyan" onClick={() => { setPresetFrom(null); setWizard(true); }}><ArrowLeftRight size={15} /> New Transfer</button>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-4"><Kpi icon={<Repeat size={16} />} label="Transfers (30d)" value={`${completed.length} completed`} delta={fmtMoney(moved30d)} sub="moved between accounts" /></div>
          <div className="col-6 col-lg-4"><Kpi icon={<CalendarClock size={16} />} label="Scheduled" value={`${scheduled.length} upcoming`} delta={fmtMoney(scheduled.reduce((s, t) => s + t.amount, 0))} sub="will execute automatically" /></div>
          <div className="col-6 col-lg-4"><Kpi icon={<Zap size={16} />} label="Cost" value="KES 0.00" delta="free" sub="internal rails — instant settlement" /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Recent transfers</div><button className="pm-link-btn pm-fs-12" onClick={() => { setPresetFrom(null); setWizard(true); }}>New transfer →</button></div>
              <div className="table-responsive">
                <table className="table pm-table align-middle mb-0">
                  <thead><tr><th>From → To</th><th className="text-end">Amount</th><th>Memo</th><th>When</th><th>Status</th></tr></thead>
                  <tbody>
                    {transfers.map((t) => (
                      <tr key={t.id}>
                        <td className="pm-fs-13"><b>{accName(t.from)}</b> <span className="pm-muted">→</span> <b>{accName(t.to)}</b></td>
                        <td className="text-end fw-bold pm-fs-13">{fmtMoney(t.amount)}</td>
                        <td className="pm-muted pm-fs-12">{t.memo}</td>
                        <td className="pm-muted pm-fs-12">{fmtDT(t.date)}</td>
                        <td>{t.status === "completed" ? <Badge tone="success">Completed</Badge> : <Badge tone="info" dot>Scheduled</Badge>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Balance overview</div><div className="pm-card-sub">available = balance − reserved</div></div>
              {accounts.filter((a) => a.currency === "KES").map((a) => (
                <div className="pm-balance-row" key={a.id}>
                  <div className="flex-grow-1">
                    <div className="fw-semibold pm-fs-13">{a.name}</div>
                    <div className="pm-muted pm-fs-11">{a.number}</div>
                  </div>
                  <div className="text-end">
                    <b className="pm-fs-13">{fmtMoney(a.balance)}</b>
                    <div className="pm-muted pm-fs-11">avail {fmtMoney(a.balance - a.reserved)}</div>
                  </div>
                </div>
              ))}
              <div className="pm-cyan-note mt-2">Internal transfers never touch the bank — they settle instantly at zero cost.</div>
            </div>
          </div>
        </div>
      </Section>

      <TransferWizard
        open={wizard} onClose={() => setWizard(false)} accounts={accounts} setAccounts={setAccounts}
        notify={notify} presetFrom={presetFrom}
        onTransfer={(t) => setTransfers((ts) => [t, ...ts])}
      />
    </>
  );
}

/* ── transfer wizard (3 steps) ── */

function TransferWizard({ open, onClose, accounts, setAccounts, notify, presetFrom, onTransfer }: {
  open: boolean; onClose: () => void; accounts: Account[]; setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  notify: Notify; presetFrom: string | null;
  onTransfer: (t: Transfer) => void;
}) {
  const [step, setStep] = useState(1);
  const [from, setFrom] = useState("a1");
  const [to, setTo] = useState("a3");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [mode, setMode] = useState<"instant" | "schedule">("instant");
  const [when, setWhen] = useState(addDays(todayISO(), 1));
  const [executing, setExecuting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setFrom(presetFrom ?? "a1");
    setTo("a3");
    setAmount("");
    setMemo("");
    setMode("instant");
    setExecuting(false);
    setDone(false);
  }, [open, presetFrom]);

  const fromAcc = accounts.find((a) => a.id === from);
  const toAcc = accounts.find((a) => a.id === to);
  const amt = Number(amount) || 0;
  const avail = fromAcc ? fromAcc.balance - fromAcc.reserved : 0;
  const invalid = !amt || amt <= 0 || amt > avail || from === to;

  const exec = () => {
    setExecuting(true);
    window.setTimeout(() => {
      setExecuting(false);
      setDone(true);
      setAccounts((as) => as.map((a) => (a.id === from ? { ...a, balance: a.balance - amt } : a.id === to ? { ...a, balance: a.balance + amt } : a)));
      onTransfer({
        id: uid("it"), from, to, amount: amt,
        date: mode === "instant" ? new Date().toISOString() : when + "T06:00:00",
        status: mode === "instant" ? "completed" : "scheduled", memo: memo || "Internal transfer",
      });
      notify({
        tone: "success",
        title: mode === "instant" ? "Transfer complete" : "Transfer scheduled",
        body: `${fmtMoney(amt)} ${mode === "instant" ? "moved" : "will move on " + when} from ${fromAcc?.name} to ${toAcc?.name}.`,
      });
    }, 1400);
  };

  return (
    <Modal open={open} onClose={onClose} kicker="Internal Transfer" title="Move money between accounts" hideClose={executing}
      footer={
        done ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
          : step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" disabled={invalid} onClick={() => setStep(2)}>Continue →</button></>)
          : (<><button className="btn pm-btn-ghost" disabled={executing} onClick={() => setStep(1)}>← Back</button>
            <button className="btn pm-btn-cyan" disabled={executing} onClick={exec}>
              {executing ? <><Loader2 size={15} className="pm-spin" /> Executing…</> : <><Zap size={15} /> {mode === "instant" ? "Transfer instantly" : "Schedule transfer"}</>}
            </button></>)
      }
    >
      <Stepper steps={2} current={step} labels={["Accounts & amount", "Review & execute"]} />
      {step === 1 && (
        <div>
          <div className="row g-3">
            <div className="col-12">
              <div className="pm-transfer-pair">
                <div className="flex-grow-1">
                  <Field label="From">
                    <select className="form-select pm-input" value={from} onChange={(e) => setFrom(e.target.value)}>
                      {accounts.filter((a) => a.status === "active").map((a) => <option key={a.id} value={a.id}>{a.name} — {fmtMoney(a.balance, a.currency)}</option>)}
                    </select>
                  </Field>
                </div>
                <button className="pm-swap-btn" onClick={() => { setFrom(to); setTo(from); }} title="Swap" aria-label="Swap accounts"><ArrowDownUp size={16} /></button>
                <div className="flex-grow-1">
                  <Field label="To">
                    <select className="form-select pm-input" value={to} onChange={(e) => setTo(e.target.value)}>
                      {accounts.filter((a) => a.status === "active").map((a) => <option key={a.id} value={a.id}>{a.name} — {fmtMoney(a.balance, a.currency)}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            </div>
            <div className="col-md-7">
              <Field label="Amount (KES)" req>
                <input type="number" className="form-control pm-input pm-input-lg" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <div className="pm-fs-11 pm-muted mt-1">Available: {fmtMoney(avail)} (after reserved)</div>
              </Field>
            </div>
            <div className="col-md-5">
              <Field label="Memo"><input className="form-control pm-input" placeholder="What's this for?" value={memo} onChange={(e) => setMemo(e.target.value)} /></Field>
            </div>
          </div>
          <div className="d-flex gap-2 mt-2">
            {[5000, 20000, 50000].map((v) => (
              <button key={v} className="btn pm-btn-soft btn-sm" onClick={() => setAmount(String(v))}>{fmtMoney(v)}</button>
            ))}
            <button className="btn pm-btn-ghost btn-sm" onClick={() => setAmount(String(avail))}>Max available</button>
          </div>
          {invalid && amt > 0 && <div className="pm-warn-chip mt-2">Insufficient available balance or invalid account pair.</div>}
        </div>
      )}
      {step === 2 && (
        done ? (
          <div className="text-center py-3">
            <div className="pm-big-ic pm-big-ic-success mx-auto"><CheckCircle2 size={28} /></div>
            <h5 className="fw-bold mt-3">Transfer {mode === "instant" ? "complete" : "scheduled"}</h5>
            <p className="pm-muted">{fmtMoney(amt)} {mode === "instant" ? "settled instantly" : `will move on ${when} at 06:00`} · {fromAcc?.name} → {toAcc?.name}.</p>
            <div className="pm-cyan-note">Zero fees · recorded in the ledger as an internal movement.</div>
          </div>
        ) : (
          <div>
            <div className="pm-summary-card">
              <div className="pm-summary-row"><span>From</span><b>{fromAcc?.name} ({fromAcc?.number})</b></div>
              <div className="pm-summary-row"><span>To</span><b>{toAcc?.name} ({toAcc?.number})</b></div>
              <div className="pm-summary-row"><span>Amount</span><b>{fmtMoney(amt)}</b></div>
              <div className="pm-summary-row"><span>Memo</span><b>{memo || "—"}</b></div>
              <div className="pm-summary-row"><span>Fee</span><b className="t-success">KES 0 — internal rail</b></div>
              <div className="pm-summary-row"><span>From balance after</span><b>{fmtMoney((fromAcc?.balance ?? 0) - amt)}</b></div>
            </div>
            <div className="pm-mode-tabs mt-3">
              <button className={cls("pm-mode-tab", mode === "instant" && "pm-mode-on")} onClick={() => setMode("instant")}><Zap size={13} /> Instant</button>
              <button className={cls("pm-mode-tab", mode === "schedule" && "pm-mode-on")} onClick={() => setMode("schedule")}><CalendarClock size={13} /> Schedule</button>
            </div>
            {mode === "schedule" && (
              <Field label="Execution date"><input type="date" className="form-control pm-input" value={when} onChange={(e) => setWhen(e.target.value)} /></Field>
            )}
          </div>
        )
      )}
    </Modal>
  );
}
