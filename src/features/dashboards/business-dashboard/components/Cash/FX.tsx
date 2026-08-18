import { useEffect, useState } from "react";
import {
  Globe, ArrowLeftRight, Lock, Clock, Plus, History, TrendingUp, TrendingDown, CheckCircle2, Loader2,
} from "lucide-react";
import type { Account, RateRow } from "../../dataCash";
import { fmtMoney, ratesSeed } from "../../dataCash";
import { cls, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, Section, Sparkline, Stepper } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function FX({ accounts, setAccounts, notify, qa, onConsume }: {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [rates] = useState<RateRow[]>(ratesSeed);
  const [locks, setLocks] = useState<Record<string, boolean>>({ USD: true, EUR: false, GBP: false });
  const [convert, setConvert] = useState(false);
  const [addWallet, setAddWallet] = useState(false);
  const [history, setHistory] = useState(false);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "convert") setConvert(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const fxAccounts = accounts.filter((a) => a.kind === "fx");
  const fxValueKes = fxAccounts.reduce((s, a) => s + a.balance * (a.currency === "USD" ? 129.4 : 140.2), 0);

  const toggleLock = (ccy: string) => {
    setLocks((l) => ({ ...l, [ccy]: !l[ccy] }));
    notify({ tone: "info", title: locks[ccy] ? `${ccy} rate unlocked` : `${ccy} rate locked`, body: locks[ccy] ? "Exposed to market drift again." : "Your KES value is now fixed for 30 days." });
  };

  return (
    <>
      <Section
        no="3.6" sub="Your Money · Global" id="sec-fx"
        title="Multi-Currency Wallets & FX"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setAddWallet(true)}><Plus size={15} /> Add Currency Wallet</button>
            <button className="btn pm-btn-cyan" onClick={() => setConvert(true)}><ArrowLeftRight size={15} /> Convert Currency</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Globe size={16} />} label="FX wallets value" value={fmtMoney(fxValueKes)} delta={`${fxAccounts.length} wallets`} sub="USD + EUR combined" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<TrendingUp size={16} />} label="USD/KES" value="129.4" delta="▲ 0.8%" sub="locked exposure: USD 3,520" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<TrendingDown size={16} />} label="EUR/KES" value="140.2" delta="▼ 0.3%" sub="unlocked — watch it" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Lock size={16} />} label="Locked conversions" value="1 rate lock" delta="expires in 28 days" sub="USD 3,520 @ 129.4" /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-5">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Currency wallets</div><button className="pm-link-btn pm-fs-12" onClick={() => setHistory(true)}><History size={13} /> Rate history</button></div>
              {fxAccounts.map((a) => (
                <div className="pm-fx-wallet" key={a.id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <span className="pm-acc-ic pm-acc-ic-fx"><Globe size={16} /></span>
                      <div>
                        <div className="fw-semibold pm-fs-13">{a.name}</div>
                        <div className="pm-muted pm-fs-11">{a.currency} · {a.purpose}</div>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="pm-fs-14 fw-bold">{fmtMoney(a.balance, a.currency)}</div>
                      <div className="pm-muted pm-fs-11">≈ {fmtMoney(a.balance * (a.currency === "USD" ? 129.4 : 140.2))}</div>
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-2">
                    <button className="btn pm-btn-soft btn-sm flex-grow-1" onClick={() => setConvert(true)}><ArrowLeftRight size={13} /> Convert</button>
                    <button className="btn pm-btn-ghost btn-sm" onClick={() => notify({ tone: "info", title: "Wallet statement", body: `${a.name} statement exported to CSV (demo).` })}>Statement</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-12 col-lg-7">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Live rates</div><div className="pm-card-sub">PayMo FX desk · mid-market + 0.4%</div></div>
              {rates.map((r) => (
                <div className="pm-rate-row" key={r.ccy}>
                  <div className="pm-rate-ccy">{r.ccy}/KES</div>
                  <div className="pm-fs-15 fw-bold">{r.rate}</div>
                  <span className={cls("pm-fs-12 fw-bold", r.chg >= 0 ? "t-success" : "t-danger")}>{r.chg >= 0 ? "▲" : "▼"} {Math.abs(r.chg)}%</span>
                  <Sparkline data={r.spark} color={r.chg >= 0 ? "#0ea37f" : "#e11d48"} w={110} h={30} />
                  <div className="text-end">
                    <Badge tone={locks[r.ccy] ? "success" : "warning"}>{locks[r.ccy] ? "Locked" : "Floating"}</Badge>
                    <div className="mt-1">
                      <button className="pm-link-btn pm-fs-12" onClick={() => toggleLock(r.ccy)}>{locks[r.ccy] ? "Unlock" : `Lock at ${r.rate}`}</button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pm-note mt-2">Rates refresh every 60 s. Locking fixes your KES value for 30 days at no extra fee.</div>
            </div>
          </div>
        </div>
      </Section>

      <ConvertWizard open={convert} onClose={() => setConvert(false)} accounts={accounts} setAccounts={setAccounts} notify={notify} />
      <AddWalletModal open={addWallet} onClose={() => setAddWallet(false)} notify={notify} setAccounts={setAccounts} />
      <RateHistory open={history} onClose={() => setHistory(false)} notify={notify} />
    </>
  );
}

/* ── conversion wizard (3 steps) ── */

function ConvertWizard({ open, onClose, accounts, setAccounts, notify }: {
  open: boolean; onClose: () => void; accounts: Account[]; setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  notify: Notify;
}) {
  const [step, setStep] = useState(1);
  const [fromCcy, setFromCcy] = useState("KES");
  const [toCcy, setToCcy] = useState("USD");
  const [amount, setAmount] = useState("");
  const [lock, setLock] = useState(true);
  const [quoteSecs, setQuoteSecs] = useState(60);
  const [done, setDone] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(1); setFromCcy("KES"); setToCcy("USD"); setAmount(""); setLock(true); setDone(false); setExecuting(false); setQuoteSecs(60);
  }, [open]);

  useEffect(() => {
    if (!open || step !== 2 || done) return;
    const t = window.setInterval(() => setQuoteSecs((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [open, step, done]);

  const rate = fromCcy === "KES" && toCcy === "USD" ? 129.4 : fromCcy === "USD" && toCcy === "KES" ? 1 / 129.4 : 1;
  const amt = Number(amount) || 0;
  const converted = fromCcy === "KES" && toCcy === "USD" ? amt / rate : amt * (fromCcy === "USD" && toCcy === "KES" ? 129.4 : 1);
  const ccyLabel = (c: string) => c;

  const exec = () => {
    setExecuting(true);
    window.setTimeout(() => {
      setExecuting(false);
      setDone(true);
      const kesAcc = accounts.find((a) => a.currency === "KES" && a.kind === "bank");
      const usdAcc = accounts.find((a) => a.currency === "USD");
      if (kesAcc && usdAcc && fromCcy === "KES" && toCcy === "USD") {
        setAccounts((as) => as.map((a) => (a.id === kesAcc.id ? { ...a, balance: a.balance - amt } : a.id === usdAcc.id ? { ...a, balance: a.balance + converted } : a)));
      }
      notify({ tone: "success", title: "Conversion complete", body: `${fmtMoney(amt, fromCcy)} → ${fmtMoney(converted, toCcy)} ${lock ? "· rate locked for 30 days" : "· executed at market"}.` });
    }, 1600);
  };

  return (
    <Modal open={open} onClose={onClose} kicker="FX Desk" title="Convert currency" hideClose={executing}
      footer={
        done ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
          : step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" disabled={!amt} onClick={() => { setQuoteSecs(60); setStep(2); }}>Get quote →</button></>)
          : (<><button className="btn pm-btn-ghost" disabled={executing} onClick={() => setStep(1)}>← Back</button>
            <button className="btn pm-btn-cyan" disabled={executing || quoteSecs === 0} onClick={exec}>
              {executing ? <><Loader2 size={15} className="pm-spin" /> Converting…</> : <><CheckCircle2 size={15} /> Confirm conversion</>}
            </button></>)
      }
    >
      <Stepper steps={2} current={step} labels={["Amounts", "Quote & confirm"]} />
      {step === 1 && (
        <div className="row g-3">
          <div className="col-5"><Field label="From"><select className="form-select pm-input" value={fromCcy} onChange={(e) => setFromCcy(e.target.value)}><option>KES</option><option>USD</option><option>EUR</option></select></Field></div>
          <div className="col-2 d-flex align-items-end justify-content-center pb-3"><button className="pm-swap-btn" onClick={() => { setFromCcy(toCcy); setToCcy(fromCcy); }} aria-label="Swap"><ArrowLeftRight size={16} /></button></div>
          <div className="col-5"><Field label="To"><select className="form-select pm-input" value={toCcy} onChange={(e) => setToCcy(e.target.value)}><option>KES</option><option>USD</option><option>EUR</option></select></Field></div>
          <div className="col-12">
            <Field label={`Amount (${ccyLabel(fromCcy)})`} req><input type="number" className="form-control pm-input pm-input-lg" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          </div>
        </div>
      )}
      {step === 2 && (
        done ? (
          <div className="text-center py-3">
            <div className="pm-big-ic pm-big-ic-success mx-auto"><CheckCircle2 size={28} /></div>
            <h5 className="fw-bold mt-3">Converted</h5>
            <p className="pm-muted">{fmtMoney(amt, fromCcy)} → {fmtMoney(converted, toCcy)} at {rate}.</p>
          </div>
        ) : (
          <div>
            <div className="pm-quote-box">
              <div className="pm-quote-row"><span>{fmtMoney(amt, fromCcy)}</span><ArrowLeftRight size={14} className="pm-muted" /><b>{fmtMoney(converted, toCcy)}</b></div>
              <div className="pm-muted pm-fs-12">Rate: {ccyLabel(fromCcy)}/KES {rate} · mid-market + 0.4% fee included</div>
              <div className={cls("pm-quote-timer", quoteSecs <= 10 && "pm-quote-timer-warn")}>
                <Clock size={13} /> Quote valid for {quoteSecs}s {quoteSecs === 0 && "— expired, go back for a fresh quote"}
              </div>
            </div>
            <div className="pm-toggle-row mt-3">
              <button className="pm-toggle-wrap" onClick={() => setLock(!lock)}><span className={cls("pm-toggle", lock && "pm-toggle-on")}><span className="pm-toggle-knob" /></span></button>
              <span className="pm-fs-13 fw-semibold">Lock this rate for 30 days</span>
            </div>
            <div className="pm-cyan-note mt-1">Locking fixes the KES value — ideal for known supplier invoices. Conversions settle instantly into the target wallet.</div>
          </div>
        )
      )}
    </Modal>
  );
}

/* ── add wallet ── */

function AddWalletModal({ open, onClose, notify, setAccounts }: {
  open: boolean; onClose: () => void; notify: Notify;
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}) {
  const [ccy, setCcy] = useState("USD");
  const [name, setName] = useState("");
  const add = () => {
    setAccounts((as) => [...as, {
      id: "fx-" + Date.now(), name: name || `${ccy} Wallet`, kind: "fx" as const, number: `FX-${ccy}`,
      currency: ccy as "USD" | "EUR", balance: 0, reserved: 0, spark: [0, 0, 0, 0, 0, 0, 0],
      monthlyIn: 0, monthlyOut: 0, status: "active" as const, purpose: `New ${ccy} wallet — convert in from KES anytime.`, linked: false,
    }]);
    notify({ tone: "success", title: `${ccy} wallet created`, body: `${name || ccy + " Wallet"} is ready to receive ${ccy}.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Multi-Currency" title="Add a currency wallet"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" onClick={add}><Plus size={15} /> Create wallet</button></>}
    >
      <Field label="Currency">
        <div className="pm-mode-tabs">
          {["USD", "EUR", "GBP"].map((c) => <button key={c} className={cls("pm-mode-tab", ccy === c && "pm-mode-on")} onClick={() => setCcy(c)}>{c}</button>)}
        </div>
      </Field>
      <Field label="Wallet name"><input className="form-control pm-input" placeholder={`e.g. ${ccy} Supplier Wallet`} value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <div className="pm-note">Wallets are free. You convert in from KES whenever you need — no minimums.</div>
    </Modal>
  );
}

/* ── rate history ── */

function RateHistory({ open, onClose }: { open: boolean; onClose: () => void; notify?: Notify }) {
  const rows = [
    { t: "today 09:00", ccy: "USD", rate: 129.4, kind: "refresh" },
    { t: "yesterday 18:00", ccy: "USD", rate: 128.8, kind: "refresh" },
    { t: "3 days ago", ccy: "USD", rate: 129.0, kind: "locked 30d" },
    { t: "5 days ago", ccy: "EUR", rate: 140.6, kind: "refresh" },
    { t: "8 days ago", ccy: "USD", rate: 128.4, kind: "conversion" },
  ];
  return (
    <Modal open={open} onClose={onClose} kicker="FX History" title="Rate & lock history"
      footer={<button className="btn pm-btn-ghost" onClick={onClose}>Close</button>}
    >
      {rows.map((r, i) => (
        <div className="pm-tx-row mb-2" key={i}>
          <div>
            <div className="fw-semibold pm-fs-13">{r.ccy}/KES @ {r.rate}</div>
            <div className="pm-muted pm-fs-11">{r.t}</div>
          </div>
          <Badge tone={r.kind === "locked 30d" ? "success" : r.kind === "conversion" ? "info" : "muted"}>{r.kind}</Badge>
        </div>
      ))}
    </Modal>
  );
}
