import { useEffect, useState } from "react";
import {
  Zap, Plus, Pause, Play, Trash2, Pencil, History, CheckCircle2, Gift, RefreshCw,
} from "lucide-react";
import type { CrmCustomer, Nudge } from "../../dataCrm";
import { nudgesSeed } from "../../dataCrm";
import { cls, fmt, uid, type QAction } from "../../lib";
import { Badge, Confirm, Field, Kpi, Modal, Section, SlideOver, Stepper, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

const TRIGGERS = [
  { id: "due", label: "Invoice due date", desc: "Runs the morning the invoice falls due" },
  { id: "paid", label: "Payment received", desc: "Runs the moment a payment matches an invoice" },
  { id: "overdue3", label: "3 days after due date", desc: "Gentle grace-period follow-up" },
  { id: "overdue14", label: "14 days overdue", desc: "Escalation nudge" },
  { id: "silence60", label: "No activity for 60 days", desc: "Win-back / re-engagement" },
  { id: "birthday", label: "Customer birthday", desc: "Runs at 08:00 on the day" },
  { id: "portal", label: "First portal login", desc: "Welcome / onboarding touch" },
];

const AUDIENCES = [
  { id: "all", label: "All customers" },
  { id: "vip", label: "VIP tier only" },
  { id: "risk", label: "At-risk customers" },
  { id: "new", label: "New customers" },
  { id: "portal", label: "Portal-enabled" },
  { id: "ltv", label: "LTV above KES 200K" },
];

const LOG = [
  { t: "today 08:00", name: "Due-today invoice reminder", to: "14 customers", channel: "WhatsApp", result: "9 paid within 3h" },
  { t: "today 10:47", name: "Thank-you after payment", to: "22 customers", channel: "SMS", result: "all delivered" },
  { t: "yesterday 08:00", name: "3-day grace follow-up", to: "3 customers", channel: "Email", result: "1 payment received" },
  { t: "3 days ago 09:00", name: "Win-back after silence", to: "2 customers", channel: "Email", result: "1 opened, 0 replies" },
];

export default function Nudges({ customers, notify, qa, onConsume }: {
  customers: CrmCustomer[];
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [nudges, setNudges] = useState<Nudge[]>(nudgesSeed);
  const [wizard, setWizard] = useState(false);
  const [detail, setDetail] = useState<Nudge | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [delFor, setDelFor] = useState<Nudge | null>(null);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "newNudge") setWizard(true);
    if (qa.a === "nudgeLog") setLogOpen(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const active = nudges.filter((n) => n.status === "active");
  const sent = nudges.reduce((s, n) => s + n.sent30d, 0);

  return (
    <>
      <Section
        no="6.6" sub="Money In · Automation" id="sec-nudges"
        title="Automated Nudges & Follow-ups"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setLogOpen(true)}><History size={15} /> Delivery Log</button>
            <button className="btn pm-btn-primary" onClick={() => setWizard(true)}><Plus size={15} /> New Automation</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Zap size={16} />} label="Active automations" value={`${active.length} rules`} delta="run automatically" sub="24/7, no clicks needed" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<RefreshCw size={16} />} label="Nudges sent (30d)" value={`${sent} messages`} delta="97% delivered" sub="WhatsApp + SMS + Email" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="Recovery impact" value={fmt(340000)} delta="recovered" sub="from overdue nudge sequence" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Gift size={16} />} label="Delight touches" value="2 birthdays" delta="1 win-back" sub="relationship builders" /></div>
        </div>

        <div className="pm-card">
          <div className="pm-card-head">
            <div><div className="pm-card-title">Your automations</div><div className="pm-card-sub">Each rule fires the moment its trigger happens</div></div>
          </div>
          {nudges.map((n) => (
            <div className="pm-sweep-row" key={n.id}>
              <div className="pm-sweep-ic pm-sweep-ic-green"><Zap size={16} /></div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <b className="pm-fs-14">{n.name}</b>
                  {n.status === "active" ? <Badge tone="success" dot>Active</Badge> : <Badge tone="warning">Paused</Badge>}
                </div>
                <div className="pm-muted pm-fs-12 mt-1">When: {n.trigger} · who: {n.audience}</div>
                <div className="pm-muted pm-fs-12">Then: {n.channel} — “{n.message.slice(0, 60)}…”</div>
                <div className="pm-fs-11 pm-muted mt-1">{n.sent30d} sent in 30 days · last run {n.lastSent}</div>
              </div>
              <div className="d-flex gap-1 align-items-center flex-wrap">
                <button className="pm-icon-btn" onClick={() => setDetail(n)}><Pencil size={13} /></button>
                <button className="pm-icon-btn" onClick={() => { setNudges((ns) => ns.map((x) => (x.id === n.id ? { ...x, status: n.status === "active" ? "paused" : "active", lastSent: "just now" } : x))); notify({ tone: n.status === "active" ? "warning" : "success", title: n.status === "active" ? `${n.name} paused` : `${n.name} resumed`, body: n.status === "active" ? "No more automatic messages until you resume." : "The automation is live again." }); }}>
                  {n.status === "active" ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button className="pm-icon-btn pm-icon-danger" onClick={() => setDelFor(n)}><Trash2 size={13} /></button>
                <Toggle on={n.status === "active"} onChange={(v) => {
                  setNudges((ns) => ns.map((x) => (x.id === n.id ? { ...x, status: v ? "active" : "paused" } : x)));
                  notify({ tone: v ? "success" : "warning", title: v ? `${n.name} resumed` : `${n.name} paused` });
                }} />
              </div>
            </div>
          ))}
        </div>

        <div className="pm-tip mt-3">
          <Gift size={15} />
          <span><b>Pro tip:</b> pair the overdue sequence with the At-Risk segment — recoveries jumped 34% last quarter. <button className="pm-link-btn" onClick={() => setWizard(true)}>Build one now →</button></span>
        </div>
      </Section>

      {/* ════ create automation wizard ════ */}
      <NudgeWizard open={wizard} onClose={() => setWizard(false)} notify={notify}
        onCreate={(n) => setNudges((ns) => [...ns, n])} />

      {/* ════ nudge detail / edit ════ */}
      <NudgeDetail n={detail} onClose={() => setDetail(null)} customers={customers} notify={notify}
        onSave={(n) => setNudges((ns) => ns.map((x) => (x.id === n.id ? n : x)))} />

      {/* ════ delivery log ════ */}
      <Modal open={logOpen} onClose={() => setLogOpen(false)} kicker="Automation Log" title="Delivery log — last 7 days"
        footer={<button className="btn pm-btn-ghost" onClick={() => setLogOpen(false)}>Close</button>}
      >
        {LOG.map((l, i) => (
          <div className="pm-tx-row mb-2" key={i}>
            <div>
              <div className="fw-semibold pm-fs-13">{l.name}</div>
              <div className="pm-muted pm-fs-11">{l.t} · {l.to} · via {l.channel}</div>
            </div>
            <Badge tone={l.result.includes("paid") || l.result.includes("delivered") ? "success" : "muted"}>{l.result}</Badge>
          </div>
        ))}
      </Modal>

      {/* ════ delete ════ */}
      <Confirm open={!!delFor} onClose={() => setDelFor(null)}
        onConfirm={() => { if (delFor) { setNudges((ns) => ns.filter((x) => x.id !== delFor.id)); notify({ tone: "danger", title: "Automation deleted", body: delFor.name }); } }}
        title="Delete automation" confirmLabel="Delete" tone="danger"
        body={<span>Delete <b>{delFor?.name}</b>? It will stop sending messages immediately.</span>} icon={<Trash2 size={18} />} />
    </>
  );
}

/* ═══════════════ nudge wizard (3 steps) ═══════════════ */

function NudgeWizard({ open, onClose, notify, onCreate }: {
  open: boolean; onClose: () => void; notify: Notify; onCreate: (n: Nudge) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("due");
  const [aud, setAud] = useState("all");
  const [channel, setChannel] = useState("WhatsApp");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (open) {
      setStep(1); setName(""); setTrigger("due"); setAud("all"); setChannel("WhatsApp");
      setMsg("Hi {name}, invoice {invoice} is due today. Pay via M-Pesa Paybill 880321, account {invoice}.");
    }
  }, [open]);
  const valid1 = name.trim();
  const valid2 = msg.trim();
  const save = () => {
    onCreate({
      id: uid("n"), name, trigger: TRIGGERS.find((t) => t.id === trigger)?.label ?? trigger,
      audience: AUDIENCES.find((a) => a.id === aud)?.label ?? aud, channel, message: msg,
      status: "active", sent30d: 0, lastSent: "never",
    });
    notify({ tone: "success", title: "Automation live", body: `${name} will run on its next trigger.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Automation" title="New nudge automation" size="lg"
      footer={
        <>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 3 && <button className="btn pm-btn-primary" disabled={step === 1 ? !valid1 : !valid2} onClick={() => setStep(step + 1)}>Continue →</button>}
          {step === 3 && <button className="btn pm-btn-primary" onClick={save}><CheckCircle2 size={15} /> Activate automation</button>}
        </>
      }
    >
      <Stepper steps={3} current={step} labels={["Trigger & audience", "Message", "Review"]} />
      {step === 1 && (
        <div>
          <Field label="Automation name" req><input className="form-control pm-input" placeholder="e.g. VIP birthday surprise" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="pm-preview-label">When it fires</div>
              <div className="pm-select-list">
                {TRIGGERS.map((t) => (
                  <button key={t.id} className={cls("pm-check-list-item", trigger === t.id && "pm-check-on")} onClick={() => setTrigger(t.id)}>
                    <span className="pm-checkbox">{trigger === t.id ? "✓" : ""}</span>
                    <span className="text-start"><b className="pm-fs-13">{t.label}</b><span className="pm-muted pm-fs-11 d-block">{t.desc}</span></span>
                  </button>
                ))}
              </div>
            </div>
            <div className="col-md-6">
              <div className="pm-preview-label">Who receives it</div>
              <div className="pm-select-list">
                {AUDIENCES.map((a) => (
                  <button key={a.id} className={cls("pm-check-list-item", aud === a.id && "pm-check-on")} onClick={() => setAud(a.id)}>
                    <span className="pm-checkbox">{aud === a.id ? "✓" : ""}</span><span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <Field label="Channel"><div className="pm-mode-tabs">{["WhatsApp", "Email", "SMS"].map((ch) => <button key={ch} className={cls("pm-mode-tab", channel === ch && "pm-mode-on")} onClick={() => setChannel(ch)}>{ch}</button>)}</div></Field>
          <Field label="Message" req><textarea className="form-control pm-input" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} /></Field>
          <div className="pm-fs-11 pm-muted">Merge fields: {"{name}"} {"{invoice}"} {"{amount}"} {"{due}"} — filled per customer.</div>
        </div>
      )}
      {step === 3 && (
        <div>
          <div className="pm-summary-card">
            <div className="pm-summary-row"><span>Name</span><b>{name}</b></div>
            <div className="pm-summary-row"><span>Fires</span><b>{TRIGGERS.find((t) => t.id === trigger)?.label}</b></div>
            <div className="pm-summary-row"><span>Audience</span><b>{AUDIENCES.find((a) => a.id === aud)?.label}</b></div>
            <div className="pm-summary-row"><span>Channel</span><b>{channel}</b></div>
          </div>
          <div className="pm-preview-label mt-3">Preview</div>
          <div className="pm-bubble pm-bubble-me w-100">{msg.replace("{name}", "Amina").replace("{invoice}", "INV-0146")}<div className="pm-bubble-meta">via {channel} · fires automatically</div></div>
          <div className="pm-cyan-note mt-2">Customers can always reply — replies land in the Communication Hub inbox (6.2).</div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════ nudge detail ═══════════════ */

function NudgeDetail({ n, onClose, customers, notify, onSave }: {
  n: Nudge | null; onClose: () => void; customers: CrmCustomer[]; notify: Notify;
  onSave: (n: Nudge) => void;
}) {
  const [msg, setMsg] = useState("");
  const [channel, setChannel] = useState("");
  const [aud, setAud] = useState("");
  useEffect(() => { if (n) { setMsg(n.message); setChannel(n.channel); setAud(n.audience); } }, [n]);
  if (!n) return null;
  const roughAudience = n.audience.includes("VIP") ? customers.filter((c) => c.tier === "vip").length
    : n.audience.includes("At-risk") ? customers.filter((c) => c.tier === "risk").length
    : n.audience.includes("New") ? customers.filter((c) => c.tier === "new").length
    : customers.length;
  return (
    <SlideOver open={!!n} onClose={onClose} kicker="Automation" title={n.name} width={520}
      footer={<button className="btn pm-btn-primary btn-sm w-100" onClick={() => { onSave({ ...n, message: msg, channel, audience: aud }); notify({ tone: "success", title: "Automation updated", body: n.name }); onClose(); }}>Save changes</button>}
    >
      <div className="pm-detail-head">
        <div className="d-flex align-items-center gap-2">
          {n.status === "active" ? <Badge tone="success" dot>Active</Badge> : <Badge tone="warning">Paused</Badge>}
          <span className="pm-muted pm-fs-12">trigger: {n.trigger}</span>
        </div>
        <div className="pm-stat-row mt-3">
          <div><b>{n.sent30d}</b><span>sent · 30d</span></div>
          <div><b>~{roughAudience}</b><span>audience</span></div>
          <div><b>{n.channel}</b><span>channel</span></div>
        </div>
      </div>
      <div className="pm-detail-section">
        <Field label="Audience"><input className="form-control pm-input" value={aud} onChange={(e) => setAud(e.target.value)} /></Field>
        <Field label="Channel"><div className="pm-mode-tabs">{["WhatsApp", "Email", "SMS"].map((ch) => <button key={ch} className={cls("pm-mode-tab", channel === ch && "pm-mode-on")} onClick={() => setChannel(ch)}>{ch}</button>)}</div></Field>
        <Field label="Message"><textarea className="form-control pm-input" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} /></Field>
      </div>
    </SlideOver>
  );
}
