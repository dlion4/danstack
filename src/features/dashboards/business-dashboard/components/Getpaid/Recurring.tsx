import { useEffect, useState } from "react";
import {
  RefreshCw, Pause, Play, CalendarX2, Edit3, MoreVertical, AlertTriangle,
  Globe, TrendingUp, TrendingDown, Percent, Plus, CircleCheck,
} from "lucide-react";
import type { Customer, Recurring } from "../../dataGetpaid";
import { dunningSeed } from "../../dataGetpaid";
import { addDays, cls, copyText, fmt, fmtDate, fmtN, todayISO, uid, type QAction } from "../../lib";
import { Avatar, Badge, Donut, EmptyState, Field, Kpi, Modal, PillTabs, QrCode, Section, SlideOver, Stepper, Toggle } from "./ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

const FREQS = ["Weekly", "Monthly", "Quarterly", "Yearly"];

export default function Recurring({ recurring, setRecurring, customers, notify, emit, qa, onConsume }: {
  recurring: Recurring[];
  setRecurring: React.Dispatch<React.SetStateAction<Recurring[]>>;
  customers: Customer[];
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [tab, setTab] = useState("active");
  const [detail, setDetail] = useState<Recurring | null>(null);
  const [pauseFor, setPauseFor] = useState<Recurring | null>(null);
  const [endFor, setEndFor] = useState<Recurring | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editFor, setEditFor] = useState<Recurring | null>(null);
  const [priceOpen, setPriceOpen] = useState(false);
  const [dunningOpen, setDunningOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  useEffect(() => {
    if (!qa) return;
    switch (qa.a) {
      case "createRecurring": setWizardOpen(true); break;
      case "dunning": setDunningOpen(true); break;
      case "portal": setPortalOpen(true); break;
      case "priceImpact": setPriceOpen(true); break;
      case "openRecurring": {
        const r = recurring.find((x) => x.id === qa.p);
        if (r) setDetail(r);
        break;
      }
    }
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const custOf = (id: string) => customers.find((c) => c.id === id);
  const active = recurring.filter((r) => r.status === "active");
  const mrr = active.reduce((s, r) => s + (r.freq === "Quarterly" ? r.amount / 3 : r.freq === "Yearly" ? r.amount / 12 : r.amount), 0);
  const list = recurring.filter((r) => (tab === "all" ? true : r.status === tab));

  const patch = (id: string, p: Partial<Recurring>) => setRecurring((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  return (
    <>
      <Section
        no="1.4" sub="Money In · Recurring Revenue" id="sec-recurring"
        title="Recurring Invoices & Subscriptions"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setDunningOpen(true)}><AlertTriangle size={15} /> Dunning Rules</button>
            <button className="btn pm-btn-primary" onClick={() => setWizardOpen(true)}><Plus size={15} /> Create Recurring</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<RefreshCw size={16} />} label="Monthly Recurring Revenue" value={fmt(mrr)} delta="6.4%" sub="vs last month" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<TrendingUp size={16} />} label="Annual Run Rate" value={`KES ${fmtN(mrr * 12)}`} delta="9.1%" sub="growth projected" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<TrendingDown size={16} />} label="Churn (this month)" value="3.2%" delta="1.1 pts" deltaTone="down" sub="2 subscriptions ended" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CircleCheck size={16} />} label="Net New MRR" value="KES 12,500" delta="+2 new" sub="Kimani Hardware + Muthoni" /></div>
        </div>

        <div className="pm-card">
          <div className="d-flex justify-content-between align-items-center px-3 pt-3 flex-wrap gap-2">
            <PillTabs
              tabs={[
                { id: "active", label: "Active", count: recurring.filter((r) => r.status === "active").length },
                { id: "paused", label: "Paused", count: recurring.filter((r) => r.status === "paused").length },
                { id: "ended", label: "Ended", count: recurring.filter((r) => r.status === "ended").length },
                { id: "all", label: "All", count: recurring.length },
              ]}
              active={tab}
              onChange={setTab}
            />
            <span className="pm-muted pm-fs-12">Scheduler runs daily · next sweep tomorrow 06:00 EAT</span>
          </div>
          <div className="table-responsive">
            <table className="table pm-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Customer</th><th>Amount / cycle</th><th>Frequency</th><th>Next invoice</th>
                  <th className="text-end">Lifetime</th><th>On-time rate</th><th>Status</th><th className="text-end" />
                </tr>
              </thead>
              <tbody>
                {list.map((r) => {
                  const c = custOf(r.customerId);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Avatar name={c?.name ?? "?"} size={30} />
                          <div>
                            <div className="fw-semibold pm-fs-13">{c?.name}</div>
                            <div className="pm-muted pm-fs-11">{c?.business} · {r.channel}</div>
                          </div>
                        </div>
                      </td>
                      <td className="fw-bold pm-fs-13"><span className="t-primary">{fmt(r.amount)}</span></td>
                      <td className="pm-fs-13">{r.freq}</td>
                      <td className="pm-fs-13">{r.status === "ended" ? "—" : fmtDate(r.next)}{r.failures > 0 && <span className="pm-fail-flag ms-1"><AlertTriangle size={11} /> {r.failures} failed send(s)</span>}</td>
                      <td className="text-end pm-fs-13">{fmt(r.lifetime)} <span className="pm-muted pm-fs-11">({r.count} invoices)</span></td>
                      <td><Donut pct={r.onTime} size={36} stroke={5} color={r.onTime > 90 ? "#16a34a" : r.onTime > 80 ? "#f59e0b" : "#e11d48"} /></td>
                      <td>
                        {r.status === "active" && <Badge tone="success" dot>Active</Badge>}
                        {r.status === "paused" && <Badge tone="warning" dot>Paused</Badge>}
                        {r.status === "ended" && <Badge tone="muted">Ended</Badge>}
                      </td>
                      <td className="text-end">
                        <div className="pm-menu-wrap">
                          <button className="pm-icon-btn" onClick={() => setMenuFor(menuFor === r.id ? null : r.id)}><MoreVertical size={15} /></button>
                          {menuFor === r.id && (
                            <>
                              <div className="pm-menu-backdrop" onClick={() => setMenuFor(null)} />
                              <div className="pm-menu">
                                <button onClick={() => { setDetail(r); setMenuFor(null); }}><RefreshCw size={14} /> View schedule</button>
                                <button onClick={() => { setEditFor(r); setMenuFor(null); }}><Edit3 size={14} /> Edit future invoices</button>
                                {r.status === "active" && <button onClick={() => { setPauseFor(r); setMenuFor(null); }}><Pause size={14} /> Pause</button>}
                                {r.status === "paused" && <button onClick={() => { patch(r.id, { status: "active" }); notify({ tone: "success", title: "Schedule resumed", body: `${c?.name} will be invoiced again from ${fmtDate(r.next)}.` }); setMenuFor(null); }}><Play size={14} /> Resume</button>}
                                {r.status !== "ended" && <button onClick={() => { setEndFor(r); setMenuFor(null); }}><CalendarX2 size={14} /> End schedule</button>}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {list.length === 0 && (
              <EmptyState icon={<RefreshCw size={26} />} title="Nothing here" body="Schedules in this state will appear here." action={<button className="btn pm-btn-primary btn-sm" onClick={() => setWizardOpen(true)}><Plus size={14} /> Create Recurring</button>} />
            )}
          </div>
        </div>

        <div className="pm-tip">
          <Percent size={15} />
          <span><b>Price change awareness:</b> KRA VAT rate changes would affect 5 recurring templates. <button className="pm-link-btn" onClick={() => setPriceOpen(true)}>Preview impact →</button></span>
        </div>
      </Section>

      {/* ── detail slide-over ── */}
      <RecurringDetail
        r={detail} onClose={() => setDetail(null)} customer={detail ? custOf(detail.customerId) : undefined}
        onPause={(r) => { setDetail(null); setPauseFor(r); }} onEdit={(r) => { setDetail(null); setEditFor(r); }}
        onEnd={(r) => { setDetail(null); setEndFor(r); }} emit={emit} notify={notify}
      />

      {/* ── modals ── */}
      <PauseModal r={pauseFor} onClose={() => setPauseFor(null)} notify={notify} patch={patch} />
      <EndModal r={endFor} onClose={() => setEndFor(null)} notify={notify} patch={patch} />
      <CreateWizard open={wizardOpen} onClose={() => setWizardOpen(false)} customers={customers}
        onCreate={(data) => {
          setRecurring((rs) => [{ ...data, id: uid("r"), lifetime: 0, count: 0, failures: 0, onTime: 100 }, ...rs]);
          notify({ tone: "success", title: "Recurring schedule created", body: `${data.amount ? fmt(data.amount) : ""} every ${data.freq.toLowerCase()} starting ${fmtDate(data.next)}.` });
        }} />
      <EditFutureModal r={editFor} onClose={() => setEditFor(null)} notify={notify} patch={patch} />
      <PriceImpact open={priceOpen} onClose={() => setPriceOpen(false)} activeCount={active.length}
        onApply={(newAmt) => { setRecurring((rs) => rs.map((r) => (r.status === "active" && r.amount === 12500 ? { ...r, amount: newAmt } : r))); notify({ tone: "success", title: "Price updated", body: "Subscribers will be notified on their next invoice." }); }} />
      <DunningRules open={dunningOpen} onClose={() => setDunningOpen(false)} notify={notify} />
      <PortalModal open={portalOpen} onClose={() => setPortalOpen(false)} notify={notify} />
    </>
  );
}

/* ── detail ── */

function RecurringDetail({ r, onClose, customer, onPause, onEdit, onEnd, emit, notify }: {
  r: Recurring | null; onClose: () => void; customer?: Customer;
  onPause: (r: Recurring) => void; onEdit: (r: Recurring) => void; onEnd: (r: Recurring) => void;
  emit: (q: QAction) => void; notify: Notify;
}) {
  if (!r) return null;
  const past = Array.from({ length: 5 }, (_, i) => ({ n: r.count - i, amt: r.amount, t: addDays(todayISO(), -30 * (i + 1)) }));
  return (
    <SlideOver open={!!r} onClose={onClose} kicker="Recurring schedule" title={customer?.name ?? "Schedule"} width={580}
      footer={
        <>
          {r.status === "active" && <button className="btn pm-btn-soft btn-sm" onClick={() => onPause(r)}><Pause size={14} /> Pause</button>}
          <button className="btn pm-btn-soft btn-sm" onClick={() => onEdit(r)}><Edit3 size={14} /> Edit future invoices</button>
          {r.status !== "ended" && <button className="btn pm-btn-danger-soft btn-sm" onClick={() => onEnd(r)}><CalendarX2 size={14} /> End schedule</button>}
        </>
      }
    >
      <div className="pm-detail-head">
        <div className="d-flex align-items-center gap-3">
          <Avatar name={customer?.name ?? "?"} size={40} />
          <div>
            <div className="fw-bold">{customer?.name} — {customer?.business}</div>
            <div className="pm-muted pm-fs-12">{r.freq} · {fmt(r.amount)} · via {r.channel}</div>
          </div>
          <div className="ms-auto">
            {r.status === "active" ? <Badge tone="success" dot>Active</Badge> : r.status === "paused" ? <Badge tone="warning" dot>Paused</Badge> : <Badge tone="muted">Ended</Badge>}
          </div>
        </div>
        <div className="pm-stat-row mt-3">
          <div><b>{fmt(r.lifetime)}</b><span>lifetime invoiced</span></div>
          <div><b>{r.count}</b><span>invoices generated</span></div>
          <div><b>{r.onTime}%</b><span>on-time payments</span></div>
          <div><b>{r.failures}</b><span>failed sends</span></div>
        </div>
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Schedule timeline</div>
        {r.status !== "ended" && (
          <div className="pm-tl-item">
            <span className="pm-tl-dot pm-tl-dot-next" />
            <div className="flex-grow-1">
              <div className="fw-semibold pm-fs-13">Next invoice — {fmtDate(r.next)}</div>
              <div className="pm-muted pm-fs-11">Auto-generates at 06:00 EAT · sends via {r.channel}</div>
            </div>
            <Badge tone="info">{fmt(r.amount)}</Badge>
          </div>
        )}
        {past.map((p) => (
          <div className="pm-tl-item" key={p.n}>
            <span className={cls("pm-tl-dot", p.n % 3 === 0 ? "pm-tl-dot-pay" : "pm-tl-dot-sent")} />
            <div className="flex-grow-1">
              <button className="pm-link-btn pm-fs-13 fw-semibold" onClick={() => { onClose(); emit({ a: "openInvoice", p: `inv-${String(128 + p.n).padStart(4, "0")}` }); }}>
                INV-{String(1000 + p.n).slice(1)} · {fmtDate(p.t)}
              </button>
              <div className="pm-muted pm-fs-11">{p.n % 3 === 0 ? "Paid via M-Pesa" : "Sent · no payment recorded"} · {fmt(p.amt)}</div>
            </div>
          </div>
        ))}
        {r.failures > 0 && (
          <div className="pm-warn-chip mt-2">
            <AlertTriangle size={13} /> {r.failures} invoice(s) failed to send — invalid phone/email.{" "}
            <button className="pm-link-btn" onClick={() => { onClose(); emit({ a: "openRecurring", p: r.id }); notify({ tone: "info", title: "Customer contact opened", body: "Fix the contact details in Customers & CRM." }); }}>
              Fix contact
            </button>
          </div>
        )}
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Customer portal</div>
        <div className="pm-cyan-note">
          Share a self-service link where {customer?.name.split(" ")[0]} can view invoices, download receipts and update payment details.{" "}
          <button className="pm-link-btn" onClick={() => { onClose(); emit({ a: "portal" }); }}>Generate link →</button>
        </div>
      </div>
    </SlideOver>
  );
}

/* ── pause ── */

function PauseModal({ r, onClose, notify, patch }: {
  r: Recurring | null; onClose: () => void; notify: Notify; patch: (id: string, p: Partial<Recurring>) => void;
}) {
  const [reason, setReason] = useState("");
  if (!r) return null;
  return (
    <Modal open={!!r} onClose={onClose} kicker="Recurring" title="Pause schedule"
      footer={<>
        <button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn pm-btn-warning" onClick={() => { patch(r.id, { status: "paused" }); notify({ tone: "warning", title: "Schedule paused", body: reason ? `Reason: ${reason}` : "No new invoices will generate until you resume." }); onClose(); }}><Pause size={15} /> Pause schedule</button>
      </>}
    >
      <Field label="Reason (internal memo)">
        <input className="form-control pm-input" placeholder="e.g. Customer requested hold, awaiting contract renewal" value={reason} onChange={(e) => setReason(e.target.value)} />
      </Field>
      <div className="pm-note">Pausing stops future generation but keeps the schedule and history intact. Resume anytime.</div>
    </Modal>
  );
}

/* ── end ── */

function EndModal({ r, onClose, notify, patch }: {
  r: Recurring | null; onClose: () => void; notify: Notify; patch: (id: string, p: Partial<Recurring>) => void;
}) {
  const [mode, setMode] = useState("after");
  const [afterN, setAfterN] = useState("1");
  const [onDate, setOnDate] = useState(addDays(todayISO(), 30));
  if (!r) return null;
  const apply = () => {
    patch(r.id, mode === "now" ? { status: "ended" } : { status: "active" });
    notify({
      tone: "info", title: "End condition set",
      body: mode === "now" ? "Schedule ended immediately." : mode === "after" ? `Will end after ${afterN} more invoice(s).` : `Will end on ${fmtDate(onDate)}.`,
    });
    onClose();
  };
  return (
    <Modal open={!!r} onClose={onClose} kicker="Recurring" title="End schedule" subtitle={`${fmt(r.amount)} ${r.freq.toLowerCase()} — choose when it stops.`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-danger" onClick={apply}>Apply end condition</button></>}
    >
      <div className="pm-check-list">
        {[
          { id: "after", title: "End after X more invoices", extra: <input className="form-control form-control-sm pm-input pm-w-90" value={afterN} onChange={(e) => setAfterN(e.target.value)} disabled={mode !== "after"} /> },
          { id: "on", title: "End on a specific date", extra: <input type="date" className="form-control form-control-sm pm-input pm-w-140" value={onDate} onChange={(e) => setOnDate(e.target.value)} disabled={mode !== "on"} /> },
          { id: "now", title: "End immediately", extra: null },
        ].map((o) => (
          <button key={o.id} className={cls("pm-check-list-item", mode === o.id && "pm-check-on")} onClick={() => setMode(o.id)}>
            <span className="pm-checkbox">{mode === o.id ? "✓" : ""}</span>
            <span>{o.title}</span>
            {o.extra && <span className="ms-auto" onClick={(e) => e.stopPropagation()}>{o.extra}</span>}
          </button>
        ))}
      </div>
    </Modal>
  );
}

/* ── create wizard ── */

function CreateWizard({ open, onClose, customers, onCreate }: {
  open: boolean; onClose: () => void; customers: Customer[];
  onCreate: (data: Omit<Recurring, "id" | "lifetime" | "count" | "failures" | "onTime">) => void;
}) {
  const [step, setStep] = useState(1);
  const [cust, setCust] = useState("");
  const [amount, setAmount] = useState("");
  const [freq, setFreq] = useState("Monthly");
  const [start, setStart] = useState(addDays(todayISO(), 7));
  const [channel, setChannel] = useState("Email + WhatsApp");
  const [dunning, setDunning] = useState(true);
  const [notes, setNotes] = useState("Thank you for your business. Pay via M-Pesa Paybill 880321, account {INV}.");
  const reset = () => { setStep(1); setCust(""); setAmount(""); setFreq("Monthly"); setStart(addDays(todayISO(), 7)); setChannel("Email + WhatsApp"); setDunning(true); setNotes("Thank you for your business. Pay via M-Pesa Paybill 880321, account {INV}."); };
  const close = () => { onClose(); window.setTimeout(reset, 250); };
  const valid1 = cust && Number(amount) > 0;
  const c = customers.find((x) => x.id === cust);
  return (
    <Modal open={open} onClose={close} kicker="Recurring Invoices" title="Create Recurring Schedule" size="lg"
      footer={
        <>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 3 && <button className="btn pm-btn-primary" disabled={step === 1 && !valid1} onClick={() => setStep(step + 1)}>Continue →</button>}
          {step === 3 && (
            <button className="btn pm-btn-primary" onClick={() => { onCreate({ customerId: cust, amount: Number(amount), freq, next: start, status: "active", channel, start: todayISO() }); close(); }}>
              <RefreshCw size={15} /> Create schedule
            </button>
          )}
        </>
      }
    >
      <Stepper steps={3} current={step} labels={["Customer & Amount", "Terms & Delivery", "Review"]} />
      {step === 1 && (
        <div className="row g-3">
          <div className="col-md-6">
            <Field label="Customer" req>
              <select className="form-select pm-input" value={cust} onChange={(e) => setCust(e.target.value)}>
                <option value="">Select customer…</option>
                {customers.map((x) => <option key={x.id} value={x.id}>{x.name} — {x.business}</option>)}
              </select>
            </Field>
          </div>
          <div className="col-md-6"><Field label="Amount per cycle (KES)" req><input type="number" className="form-control pm-input" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field></div>
          <div className="col-md-6">
            <Field label="Frequency">
              <div className="pm-mode-tabs">
                {FREQS.map((f) => <button key={f} className={cls("pm-mode-tab", freq === f && "pm-mode-on")} onClick={() => setFreq(f)}>{f}</button>)}
              </div>
            </Field>
          </div>
          <div className="col-md-6"><Field label="First invoice date"><input type="date" className="form-control pm-input" value={start} onChange={(e) => setStart(e.target.value)} /></Field></div>
        </div>
      )}
      {step === 2 && (
        <div className="row g-3">
          <div className="col-12">
            <Field label="Delivery channel">
              <select className="form-select pm-input" value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option>Email + WhatsApp</option><option>Email only</option><option>WhatsApp only</option><option>SMS + payment link</option>
              </select>
            </Field>
          </div>
          <div className="col-12">
            <Field label="Invoice note"><textarea className="form-control pm-input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          </div>
          <div className="col-12">
            <div className={cls("pm-recur-box", dunning && "pm-recur-on")}>
              <Toggle on={dunning} onChange={setDunning} label="Enable automatic dunning" />
              <div className="pm-muted pm-fs-12 mt-1">Day 1 SMS → Day 3 WhatsApp → Day 7 email + late fee → Day 14 pause flag. Editable in Dunning Rules.</div>
            </div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <div className="pm-summary-card">
            <div className="pm-summary-row"><span>Customer</span><b>{c?.name ?? "—"} ({c?.business})</b></div>
            <div className="pm-summary-row"><span>Amount</span><b>{fmt(Number(amount) || 0)}</b></div>
            <div className="pm-summary-row"><span>Frequency</span><b>{freq}</b></div>
            <div className="pm-summary-row"><span>First invoice</span><b>{fmtDate(start)}</b></div>
            <div className="pm-summary-row"><span>Delivery</span><b>{channel}</b></div>
            <div className="pm-summary-row"><span>Dunning</span><b>{dunning ? "Enabled (4-step)" : "Off"}</b></div>
          </div>
          <div className="pm-cyan-note">MRR impact: <b>+ {fmt(Number(amount) || 0)}</b> · The scheduler checks every day at 06:00 EAT and generates invoices automatically.</div>
        </div>
      )}
    </Modal>
  );
}

/* ── edit future ── */

function EditFutureModal({ r, onClose, notify, patch }: {
  r: Recurring | null; onClose: () => void; notify: Notify; patch: (id: string, p: Partial<Recurring>) => void;
}) {
  const [scope, setScope] = useState("future");
  const [amount, setAmount] = useState("");
  const [channel, setChannel] = useState("");
  useEffect(() => { if (r) { setAmount(String(r.amount)); setChannel(r.channel); setScope("future"); } }, [r]);
  if (!r) return null;
  const save = () => {
    patch(r.id, { amount: Number(amount) || r.amount, channel });
    notify({ tone: "success", title: scope === "future" ? "Future invoices updated" : "Next instance updated", body: scope === "future" ? "All cycles from the next invoice use the new settings." : "Only the next invoice instance was changed." });
    onClose();
  };
  return (
    <Modal open={!!r} onClose={onClose} kicker="Recurring" title="Edit schedule"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={save}>Save changes</button></>}
    >
      <Field label="Apply changes to">
        <div className="pm-mode-tabs">
          <button className={cls("pm-mode-tab", scope === "future" && "pm-mode-on")} onClick={() => setScope("future")}>All future invoices</button>
          <button className={cls("pm-mode-tab", scope === "next" && "pm-mode-on")} onClick={() => setScope("next")}>Next instance only</button>
        </div>
      </Field>
      <Field label="Amount per cycle (KES)"><input type="number" className="form-control pm-input" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
      <Field label="Delivery channel"><select className="form-select pm-input" value={channel} onChange={(e) => setChannel(e.target.value)}><option>Email + WhatsApp</option><option>Email only</option><option>WhatsApp only</option><option>SMS + payment link</option></select></Field>
      <div className="pm-note">Historical invoices are never touched — only future generations change.</div>
    </Modal>
  );
}

/* ── price impact ── */

function PriceImpact({ open, onClose, activeCount, onApply }: {
  open: boolean; onClose: () => void; activeCount: number;
  onApply: (newAmt: number) => void;
}) {
  const [newAmt, setNewAmt] = useState("13500");
  const old = 12500;
  return (
    <Modal open={open} onClose={onClose} kicker="Price Change" title="Update recurring price" subtitle="Changing the maintenance-contract rate."
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" disabled={!Number(newAmt)} onClick={() => { onApply(Number(newAmt)); onClose(); }}>Apply new price</button></>}
    >
      <Field label="New amount (KES)"><input type="number" className="form-control pm-input pm-input-lg" value={newAmt} onChange={(e) => setNewAmt(e.target.value)} /></Field>
      <div className="pm-impact-box">
        <div className="pm-impact-row"><span>Affected active subscriptions</span><b>{activeCount} of {activeCount}</b></div>
        <div className="pm-impact-row"><span>MRR change</span><b className="t-success">+ {fmt((Number(newAmt) - old) * 5)}</b></div>
        <div className="pm-impact-row"><span>Customer notification</span><b>On next invoice</b></div>
      </div>
      <div className="pm-cyan-note">Customers see the new price on their next generated invoice. We recommend a WhatsApp heads-up 2 weeks before for loyalty-heavy businesses.</div>
    </Modal>
  );
}

/* ── dunning rules ── */

function DunningRules({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [rows, setRows] = useState(dunningSeed);
  const save = () => { notify({ tone: "success", title: "Dunning sequence saved", body: `${rows.filter((r) => r.on).length} automated reminder steps active.` }); onClose(); };
  return (
    <Modal open={open} onClose={onClose} kicker="Dunning Automation" title="Late payment sequence" subtitle="Runs automatically after each failed collection."
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={save}>Save sequence</button></>}
    >
      {rows.map((r, i) => (
        <div className="pm-dun-row" key={i}>
          <Toggle on={r.on} onChange={(v) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, on: v } : x)))} />
          <span className="pm-dun-day">Day {r.day}</span>
          <select className="form-select form-select-sm pm-input pm-w-120" value={r.channel} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, channel: e.target.value } : x)))}>
            <option>SMS</option><option>WhatsApp</option><option>Email</option>
          </select>
          <input className="form-control form-control-sm pm-input flex-grow-1" value={r.message} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, message: e.target.value } : x)))} />
          <button className="pm-icon-btn pm-icon-danger" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}><CalendarX2 size={13} /></button>
        </div>
      ))}
      <button className="btn pm-btn-soft btn-sm mt-2" onClick={() => setRows((rs) => [...rs, { day: 21, channel: "Email", message: "Final notice before account suspension.", on: true }])}><Plus size={14} /> Add step</button>
      <div className="pm-note mt-2">A "pause service" flag can be attached to Day 14 for subscription businesses.</div>
    </Modal>
  );
}

/* ── portal link ── */

function PortalModal({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [copied, setCopied] = useState(false);
  const url = "https://pay.paymo.co.ke/portal/tsl/kimani-hardware";
  const doCopy = async () => { await copyText(url); setCopied(true); notify({ tone: "info", title: "Portal link copied" }); window.setTimeout(() => setCopied(false), 2000); };
  return (
    <Modal open={open} onClose={onClose} kicker="Customer Self-Service Portal" title="Portal access link" subtitle="The customer can view invoices, download receipts and update payment method."
      footer={<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>}
    >
      <div className="d-flex gap-3 align-items-center flex-wrap">
        <QrCode value="PORTAL:tsl:kimani-hardware" size={110} />
        <div className="flex-grow-1">
          <div className="pm-copy-line">
            <span className="pm-mono pm-fs-12 text-truncate">{url}</span>
            <button className="pm-link-btn" onClick={doCopy}>{copied ? "✓ Copied" : "Copy"}</button>
          </div>
          <div className="pm-muted pm-fs-12 mt-2">Customer can also <b>cancel</b> their subscription here if you enable it in Settings & Security.</div>
        </div>
      </div>
      <div className="d-flex gap-2 mt-3">
        <button className="btn pm-btn-soft btn-sm" onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent("Your invoice portal: " + url)}`, "_blank"); notify({ tone: "info", title: "WhatsApp opened" }); }}>Share via WhatsApp</button>
        <button className="btn pm-btn-soft btn-sm" onClick={doCopy}>Copy link</button>
        <button className="btn pm-btn-ghost btn-sm" onClick={() => notify({ tone: "info", title: "Portal preview", body: "Opens a read-only portal for the customer (demo)." })}><Globe size={14} /> Preview</button>
      </div>
    </Modal>
  );
}


