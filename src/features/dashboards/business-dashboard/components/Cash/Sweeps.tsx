import { useEffect, useState } from "react";
import {
  Zap, Play, Pause, Plus, History, Trash2, Pencil, RefreshCw, CheckCircle2,
} from "lucide-react";
import type { SweepRule } from "../../dataCash";
import { fmtMoney, sweepsSeed } from "../../dataCash";
import { cls, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, Section, Stepper, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

const TRIGGERS = [
  { id: "below", label: "When a balance drops below" },
  { id: "schedule", label: "On a schedule (daily / weekly)" },
  { id: "deposit", label: "On any incoming deposit" },
  { id: "excess", label: "When a balance exceeds" },
];

const ACTIONS = [
  { id: "fixed", label: "Move a fixed amount" },
  { id: "percent", label: "Move a % of inflow" },
  { id: "upto", label: "Move up to a cap" },
  { id: "excess", label: "Sweep everything above" },
];

export default function Sweeps({ rules, setRules, notify, qa, onConsume }: {
  rules: SweepRule[];
  setRules: React.Dispatch<React.SetStateAction<SweepRule[]>>;
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [create, setCreate] = useState(false);
  const [detail, setDetail] = useState<SweepRule | null>(null);
  const [history, setHistory] = useState(false);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "sweepNow") {
      setRules((rs) => rs.map((r) => (r.status === "active" ? { ...r, lastRun: "just now", runs30d: r.runs30d + 1, moved30d: r.moved30d + (r.id === "R2" ? 48200 : 30000) } : r)));
      notify({ tone: "success", title: "Sweeps executed", body: "All active rules ran immediately and the ledger was updated." });
      onConsume();
      return;
    }
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const active = rules.filter((r) => r.status === "active");
  const moved = rules.reduce((s, r) => s + r.moved30d, 0);

  return (
    <>
      <Section
        no="3.7" sub="Your Money · Automation" id="sec-sweeps"
        title="Sweeps & Auto-Rules"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setHistory(true)}><History size={15} /> Run Log</button>
            <button className="btn pm-btn-cyan" onClick={() => setCreate(true)}><Plus size={15} /> Create Rule</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Zap size={16} />} label="Active rules" value={`${active.length} rules`} delta={`${rules.reduce((s, r) => s + r.runs30d, 0)} runs`} sub="in the last 30 days" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<RefreshCw size={16} />} label="Auto-moved (30d)" value={fmtMoney(moved)} delta="KES 0 fees" sub="all internal rails" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="VAT auto-reserved" value={fmtMoney(182300)} delta="100%" sub="of VAT due — no more surprises" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Pause size={16} />} label="Paused" value={`${rules.length - active.length} rule`} delta="Rent ring-fence" sub="resume anytime" /></div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head"><div className="pm-card-title">Your rules</div><div className="pm-card-sub">Run at 06:00 and 18:00 daily, or instantly on trigger.</div></div>
          {rules.map((r) => (
            <div className="pm-sweep-row" key={r.id}>
              <div className="pm-sweep-ic"><Zap size={16} /></div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <b className="pm-fs-14">{r.name}</b>
                  {r.status === "active" ? <Badge tone="success" dot>Active</Badge> : <Badge tone="warning">Paused</Badge>}
                </div>
                <div className="pm-muted pm-fs-12 mt-1">When: {r.trigger}</div>
                <div className="pm-muted pm-fs-12">Then: {r.action}</div>
                <div className="pm-fs-11 pm-muted mt-1">last run {r.lastRun} · {r.runs30d} runs / 30d · moved {fmtMoney(r.moved30d)}</div>
              </div>
              <div className="d-flex gap-1 align-items-center flex-wrap">
                <button className="pm-icon-btn" onClick={() => setDetail(r)} aria-label="Edit"><Pencil size={13} /></button>
                <button className="pm-icon-btn" onClick={() => {
                  setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, lastRun: "just now", runs30d: x.runs30d + 1, moved30d: x.moved30d + (x.id === "R2" ? 48200 : 30000) } : x)));
                  notify({ tone: "success", title: `${r.name} ran now`, body: "Executed immediately — ledger updated." });
                }} aria-label="Run now"><Play size={13} /></button>
                <button className="pm-icon-btn pm-icon-danger" onClick={() => { setRules((rs) => rs.filter((x) => x.id !== r.id)); notify({ tone: "danger", title: "Rule deleted", body: r.name }); }} aria-label="Delete"><Trash2 size={13} /></button>
                <Toggle on={r.status === "active"} onChange={(v) => {
                  setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: v ? "active" : "paused" } : x)));
                  notify({ tone: v ? "success" : "warning", title: v ? `${r.name} resumed` : `${r.name} paused`, body: v ? "Sweeps continue per schedule." : "No more automatic moves until resumed." });
                }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── create rule wizard ── */}
      <RuleWizard open={create} onClose={() => setCreate(false)} notify={notify}
        onCreate={(r) => setRules((rs) => [...rs, r])} />

      {/* ── edit rule (reuse wizard with existing) ── */}
      <RuleWizard open={!!detail} onClose={() => setDetail(null)} notify={notify} existing={detail}
        onCreate={(r) => { setRules((rs) => rs.map((x) => (x.id === r.id ? r : x))); }} />

      {/* ── run log ── */}
      <RunLog open={history} onClose={() => setHistory(false)} rules={rules} />
    </>
  );
}

/* ── rule wizard (3 steps) ── */

function RuleWizard({ open, onClose, notify, existing, onCreate }: {
  open: boolean; onClose: () => void; notify: Notify;
  existing?: SweepRule | null;
  onCreate: (r: SweepRule) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("schedule");
  const [schedule, setSchedule] = useState("Every Monday 06:00");
  const [threshold, setThreshold] = useState("20000");
  const [fromAcc, setFromAcc] = useState("KCB Current Account");
  const [action, setAction] = useState("fixed");
  const [amount, setAmount] = useState("30000");
  const [toAcc, setToAcc] = useState("VAT Reserve");
  useEffect(() => {
    if (open) {
      setStep(1); setName(existing?.name ?? ""); setTrigger("schedule"); setSchedule("Every Monday 06:00"); setThreshold("20000");
      setFromAcc("KCB Current Account"); setAction("fixed"); setAmount("30000"); setToAcc("VAT Reserve");
    }
  }, [open, existing]);
  const valid1 = name.trim();
  const create = () => {
    const t = TRIGGERS.find((x) => x.id === trigger)?.label ?? trigger;
    const a = ACTIONS.find((x) => x.id === action)?.label ?? action;
    onCreate({
      id: existing?.id ?? "R" + (sweepsSeed.length + 2), name,
      trigger: t + (trigger === "schedule" ? ` (${schedule})` : trigger === "below" ? ` — KES ${threshold}` : ""),
      action: `${a} ${amount ? "KES " + Number(amount).toLocaleString() : ""} from ${fromAcc} → ${toAcc}`,
      status: "active", lastRun: "never", runs30d: 0, moved30d: 0,
    });
    notify({ tone: "success", title: existing ? "Rule updated" : "Auto-rule created", body: `${name} is ${existing ? "saved" : "live"} — sweeps run automatically from now.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Automation" title={existing ? `Edit ${existing.name}` : "Create an auto-rule"} size="lg"
      footer={
        <>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 3 && <button className="btn pm-btn-cyan" disabled={step === 1 && !valid1} onClick={() => setStep(step + 1)}>Continue →</button>}
          {step === 3 && <button className="btn pm-btn-cyan" onClick={create}><CheckCircle2 size={15} /> {existing ? "Save rule" : "Activate rule"}</button>}
        </>
      }
    >
      <Stepper steps={3} current={step} labels={["Trigger", "Action", "Review"]} />
      {step === 1 && (
        <div className="pm-wizard-grid">
          <Field label="Rule name" req><input className="form-control pm-input" placeholder="e.g. Weekly buffer top-up" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="When should it run?">
            <div className="pm-check-list">
              {TRIGGERS.map((t) => (
                <button key={t.id} className={cls("pm-check-list-item", trigger === t.id && "pm-check-on")} onClick={() => setTrigger(t.id)}>
                  <span className="pm-checkbox">{trigger === t.id ? "✓" : ""}</span>
                  <span className="flex-grow-1 text-start">{t.label}</span>
                </button>
              ))}
            </div>
          </Field>
          {trigger === "schedule" && <Field label="Schedule"><select className="form-select pm-input" value={schedule} onChange={(e) => setSchedule(e.target.value)}><option>Every Monday 06:00</option><option>Every day 18:00</option><option>Every Friday 17:00</option><option>Monthly on the 1st</option><option>Monthly on the 20th</option></select></Field>}
          {trigger === "below" && <Field label="Below what balance (KES)?"><input type="number" className="form-control pm-input" value={threshold} onChange={(e) => setThreshold(e.target.value)} /></Field>}
        </div>
      )}
      {step === 2 && (
        <div className="pm-wizard-grid">
          <Field label="What should happen?">
            <div className="pm-check-list">
              {ACTIONS.map((a) => (
                <button key={a.id} className={cls("pm-check-list-item", action === a.id && "pm-check-on")} onClick={() => setAction(a.id)}>
                  <span className="pm-checkbox">{action === a.id ? "✓" : ""}</span>
                  <span className="flex-grow-1 text-start">{a.label}</span>
                </button>
              ))}
            </div>
          </Field>
          {action !== "excess" && <Field label="Amount (KES)"><input type="number" className="form-control pm-input pm-input-lg" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>}
          <div className="row g-2">
            <div className="col-6"><Field label="From"><select className="form-select pm-input" value={fromAcc} onChange={(e) => setFromAcc(e.target.value)}><option>KCB Current Account</option><option>M-Pesa Business Wallet</option><option>Equity Bank — Rent Account</option></select></Field></div>
            <div className="col-6"><Field label="To"><select className="form-select pm-input" value={toAcc} onChange={(e) => setToAcc(e.target.value)}><option>VAT Reserve</option><option>Payroll Reserve</option><option>Emergency Buffer</option><option>Tax & Statutory</option><option>Kilimani Rent Collections</option></select></Field></div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <div className="pm-summary-card">
            <div className="pm-summary-row"><span>Name</span><b>{name}</b></div>
            <div className="pm-summary-row"><span>Trigger</span><b>{TRIGGERS.find((x) => x.id === trigger)?.label}{trigger === "schedule" ? ` (${schedule})` : trigger === "below" ? ` < KES ${threshold}` : ""}</b></div>
            <div className="pm-summary-row"><span>Action</span><b>{ACTIONS.find((x) => x.id === action)?.label} {action !== "excess" ? fmtMoney(Number(amount) || 0) : ""}</b></div>
            <div className="pm-summary-row"><span>Path</span><b>{fromAcc} → {toAcc}</b></div>
          </div>
          <div className="pm-cyan-note mt-2">Sweeps never push an account below its reserved balance. Every run is logged and reversible.</div>
        </div>
      )}
    </Modal>
  );
}

/* ── run log ── */

function RunLog({ open, onClose, rules }: { open: boolean; onClose: () => void; rules: SweepRule[] }) {
  return (
    <Modal open={open} onClose={onClose} kicker="Sweeps" title="Run log" subtitle="Every automatic movement, timestamped."
      footer={<button className="btn pm-btn-ghost" onClick={onClose}>Close</button>}
    >
      {rules.map((r) => (
        <div className="pm-tx-row mb-2" key={r.id}>
          <div>
            <div className="fw-semibold pm-fs-13">{r.name}</div>
            <div className="pm-muted pm-fs-11">last run {r.lastRun} · {r.runs30d} runs / 30d</div>
          </div>
          <div className="text-end">
            <b className="pm-fs-13">{fmtMoney(r.moved30d)}</b>
            <div><Badge tone={r.status === "active" ? "success" : "warning"}>{r.status}</Badge></div>
          </div>
        </div>
      ))}
    </Modal>
  );
}
