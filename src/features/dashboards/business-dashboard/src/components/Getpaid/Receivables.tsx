import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ArrowUpDown, MessageCircle, Sparkles, Send, Users,
  ShieldAlert, Phone, Mail, CheckCircle2, Wallet,
} from "lucide-react";
import type { AgingRow, Customer } from "../../dataGetpaid";
import { aiSuggestionsSeed, reminderTemplates } from "../../dataGetpaid";
import { cls, fmt, fmtDate, fmtN, type QAction } from "../../lib";
import {
  Avatar, Badge, Field, Kpi, LineChart, Modal, Section, SlideOver, StackedBar, Stepper,
} from "./ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

const BUCKETS = [
  { k: "b30", label: "0–30 days", tone: "text", color: "#94a3b8" },
  { k: "b60", label: "31–60 days", tone: "text", color: "#38bdf8" },
  { k: "b90", label: "61–90 days", tone: "amber", color: "#f59e0b" },
  { k: "b90p", label: "90+ days", tone: "red", color: "#e11d48" },
] as const;

export default function Receivables({ aging, setAging, customers, notify, emit, qa, onConsume }: {
  aging: AgingRow[];
  setAging: React.Dispatch<React.SetStateAction<AgingRow[]>>;
  customers: Customer[];
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "b90p", dir: -1 });
  const [profile, setProfile] = useState<Customer | null>(null);
  const [contactFor, setContactFor] = useState<Customer | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [writeOff, setWriteOff] = useState<AgingRow | null>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);

  useEffect(() => {
    if (!qa) return;
    switch (qa.a) {
      case "reminders": setBulkOpen(true); break;
      case "suggest": setSuggestOpen(true); break;
      case "customer": {
        const c = customers.find((x) => x.id === qa.p);
        if (c) setProfile(c);
        break;
      }
    }
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const custOf = (id: string) => customers.find((c) => c.id === id);
  const total = (r: AgingRow) => r.b30 + r.b60 + r.b90 + r.b90p;
  const grand = (k: "b30" | "b60" | "b90" | "b90p") => aging.reduce((s, r) => s + r[k], 0);
  const grandTotal = aging.reduce((s, r) => s + total(r), 0);

  const rows = useMemo(() => {
    const d = sort.dir;
    return [...aging].sort((a, b) => {
      switch (sort.key) {
        case "name": return (custOf(a.customerId)?.name ?? "").localeCompare(custOf(b.customerId)?.name ?? "") * d;
        default: return (a[sort.key as "b30"] - b[sort.key as "b30"]) * d;
      }
    });
  }, [aging, sort, customers]);

  const trend = [12, 14, 13, 16, 18, 21].map((v) => v * 18000);
  const trendLabels = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];

  const overdueCount = aging.filter((r) => r.b60 + r.b90 + r.b90p > 0).length;

  return (
    <>
      <Section
        no="1.5" sub="Money In · Who Owes You" id="sec-receivables"
        title="Receivables & Aging Dashboard"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setSuggestOpen(true)}><Sparkles size={15} /> AI Suggested Reminders</button>
            <button className="btn pm-btn-primary" onClick={() => setBulkOpen(true)}><Send size={15} /> Bulk Reminder Tool</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Wallet size={16} />} label="Total outstanding" value={fmt(grandTotal)} delta="2.8%" sub="vs last month" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<ShieldAlert size={16} />} label="Overdue (31+ days)" value={fmt(grand("b60") + grand("b90") + grand("b90p"))} delta={`${overdueCount} customers`} sub="need action" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<AlertTriangle size={16} />} label="90+ days (high risk)" value={fmt(grand("b90p"))} delta="1 write-off candidate" sub="see Kariuki Logistics" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="Days Sales Outstanding" value="41 days" delta="3 days" sub="faster than last month" /></div>
        </div>

        <div className="row g-3">
          {/* aging table */}
          <div className="col-12 col-xl-8">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div>
                  <div className="pm-card-title">Aging summary by customer</div>
                  <div className="pm-card-sub">Click a row for the full receivables profile. Default sort: worst offenders first.</div>
                </div>
                <button className="btn pm-btn-ghost btn-sm" onClick={() => setSort({ key: "b90p", dir: -1 })}>Reset sort</button>
              </div>
              <div className="table-responsive">
                <table className="table pm-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="pm-th-sort" onClick={() => setSort({ key: "name", dir: sort.key === "name" ? ((sort.dir * -1) as 1 | -1) : 1 })}>Customer <ArrowUpDown size={11} /></th>
                      {BUCKETS.map((b) => (
                        <th key={b.k} className={cls("text-end pm-th-sort pm-bucket-head", b.tone === "amber" && "pm-bucket-amber", b.tone === "red" && "pm-bucket-red")}
                          onClick={() => setSort({ key: b.k, dir: sort.key === b.k ? ((sort.dir * -1) as 1 | -1) : -1 })}>
                          {b.label} <ArrowUpDown size={11} />
                        </th>
                      ))}
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const c = custOf(r.customerId);
                      return (
                        <tr key={r.customerId} className="pm-click-row" onClick={() => c && setProfile(c)}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Avatar name={c?.name ?? "?"} size={28} />
                              <div>
                                <div className="fw-semibold pm-fs-13">{c?.name}</div>
                                <div className="pm-muted pm-fs-11">{c?.business}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-end pm-fs-13">{r.b30 ? fmtN(r.b30) : <span className="pm-muted">—</span>}</td>
                          <td className="text-end pm-fs-13">{r.b60 ? fmtN(r.b60) : <span className="pm-muted">—</span>}</td>
                          <td className="text-end pm-fs-13 pm-cell-amber">{r.b90 ? fmtN(r.b90) : <span className="pm-muted">—</span>}</td>
                          <td className="text-end pm-fs-13 fw-bold pm-cell-red">{r.b90p ? fmtN(r.b90p) : <span className="pm-muted">—</span>}</td>
                          <td className="text-end fw-bold pm-fs-13">{fmt(total(r))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="pm-tot-row">
                      <td>Column totals</td>
                      {BUCKETS.map((b) => (
                        <td key={b.k} className={cls("text-end fw-bold", b.tone === "amber" && "pm-cell-amber", b.tone === "red" && "pm-cell-red")}>{fmtN(grand(b.k))}</td>
                      ))}
                      <td className="text-end fw-bold t-primary">{fmt(grandTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* right column: charts + priority */}
          <div className="col-12 col-xl-4">
            <div className="pm-card mb-3">
              <div className="pm-card-head">
                <div>
                  <div className="pm-card-title">Receivables health</div>
                  <div className="pm-card-sub">Breakdown by aging bucket</div>
                </div>
              </div>
              <StackedBar
                h={18}
                labels
                segments={[
                  { v: grand("b30"), color: "#94a3b8", label: "0–30" },
                  { v: grand("b60"), color: "#38bdf8", label: "31–60" },
                  { v: grand("b90"), color: "#f59e0b", label: "61–90" },
                  { v: grand("b90p"), color: "#e11d48", label: "90+" },
                ]}
              />
              <div className="mt-3">
                <div className="pm-card-sub mb-1">Total outstanding — last 6 months</div>
                <LineChart data={trend} labels={trendLabels} format={(n) => fmt(n)} h={110} color="#0e7490" />
              </div>
            </div>

            <div className="pm-card">
              <div className="pm-card-head">
                <div className="pm-card-title">Priority actions</div>
              </div>
              <button className="pm-priority-row" onClick={() => emit({ a: "focusOverdue" })}>
                <span className="pm-prio-ic pm-prio-danger"><AlertTriangle size={16} /></span>
                <div className="flex-grow-1 text-start">
                  <b>{overdueCount} overdue invoice(s) need action</b>
                  <span className="pm-muted pm-fs-12 d-block">Click to filter the Invoice Center to Overdue</span>
                </div>
                <span className="pm-arrow">→</span>
              </button>
              <button className="pm-priority-row" onClick={() => { const c = customers.find((x) => x.id === "c4"); if (c) setProfile(c); }}>
                <span className="pm-prio-ic pm-prio-warn"><Users size={16} /></span>
                <div className="flex-grow-1 text-start">
                  <b>At-risk customer: Kariuki Logistics</b>
                  <span className="pm-muted pm-fs-12 d-block">Aging profile worsened month-over-month</span>
                </div>
                <span className="pm-arrow">→</span>
              </button>
              <button className="pm-priority-row" onClick={() => { const c = customers.find((x) => x.id === "c8"); if (c) setProfile(c); }}>
                <span className="pm-prio-ic pm-prio-warn"><Wallet size={16} /></span>
                <div className="flex-grow-1 text-start">
                  <b>Largest outstanding: {fmt(80500)}</b>
                  <span className="pm-muted pm-fs-12 d-block">Njoroge & Sons — 2 open invoices</span>
                </div>
                <span className="pm-arrow">→</span>
              </button>
              <button className="pm-priority-row" onClick={() => setSuggestOpen(true)}>
                <span className="pm-prio-ic pm-prio-good"><Sparkles size={16} /></span>
                <div className="flex-grow-1 text-start">
                  <b>4 AI-suggested reminders ready</b>
                  <span className="pm-muted pm-fs-12 d-block">Based on payment history & channel preference</span>
                </div>
                <span className="pm-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── customer profile ── */}
      <CustomerProfile
        c={profile} onClose={() => setProfile(null)} aging={aging} onContact={(c) => { setProfile(null); setContactFor(c); }}
        onWriteOff={(r) => { setProfile(null); setWriteOff(r); }} notify={notify}
      />

      {/* ── contact modal ── */}
      <ContactModal c={contactFor} onClose={() => setContactFor(null)} notify={notify} />

      {/* ── bulk reminder wizard ── */}
      <BulkReminder open={bulkOpen} onClose={() => setBulkOpen(false)} aging={aging} customers={customers} notify={notify} />

      {/* ── write-off ── */}
      <WriteOffModal r={writeOff} onClose={() => setWriteOff(null)} customers={customers} notify={notify} setAging={setAging} />

      {/* ── AI suggestions ── */}
      <AiSuggestions open={suggestOpen} onClose={() => setSuggestOpen(false)} customers={customers} notify={notify} />
    </>
  );
}

/* ── customer profile slide-over ── */

function CustomerProfile({ c, onClose, aging, onContact, onWriteOff, notify }: {
  c: Customer | null; onClose: () => void; aging: AgingRow[];
  onContact: (c: Customer) => void; onWriteOff: (r: AgingRow) => void; notify: Notify;
}) {
  if (!c) return null;
  const row = aging.find((r) => r.customerId === c.id);
  const total = row ? row.b30 + row.b60 + row.b90 + row.b90p : c.balance;
  const invoices = [
    { n: "INV-0130", amt: 62000, due: "66 days ago", age: "90+" },
    { n: "INV-0138", amt: 49500, due: "17 days ago", age: "31–60" },
    { n: "INV-0144", amt: 33000, due: "draft — not sent", age: "—" },
  ];
  return (
    <SlideOver open={!!c} onClose={onClose} kicker="Receivables Profile" title={c.name} width={560}
      footer={
        <>
          <button className="btn pm-btn-soft btn-sm" onClick={() => onContact(c)}><Phone size={14} /> Contact</button>
          {row && total > 0 && <button className="btn pm-btn-danger-soft btn-sm" onClick={() => onWriteOff(row)}><ShieldAlert size={14} /> Write off</button>}
        </>
      }
    >
      <div className="pm-detail-head">
        <div className="d-flex align-items-center gap-3">
          <Avatar name={c.name} size={44} />
          <div>
            <div className="fw-bold">{c.name} — {c.business}</div>
            <div className="pm-muted pm-fs-12">{c.phone} · {c.email} · KRA PIN {c.pin}</div>
          </div>
        </div>
        <div className="pm-stat-row mt-3">
          <div><b>{fmt(total)}</b><span>total outstanding</span></div>
          <div><b>{c.avgDays} days</b><span>avg days to pay</span></div>
          <div><b>{row && row.b90p > 0 ? "High" : "Medium"}</b><span>aging risk</span></div>
        </div>
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Open invoices & aging</div>
        {invoices.map((i) => (
          <div className="pm-line-view" key={i.n}>
            <div className="flex-grow-1">
              <div className="fw-semibold pm-fs-13">{i.n} · {fmt(i.amt)}</div>
              <div className="pm-muted pm-fs-11">Due {i.due}</div>
            </div>
            <Badge tone={i.age === "90+" ? "danger" : i.age === "31–60" ? "warning" : "muted"}>{i.age}</Badge>
          </div>
        ))}
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Communication log</div>
        {[
          { t: "12 days ago", text: "Final demand email sent (template: Final demand before action)" },
          { t: "40 days ago", text: "Formal notice email sent" },
          { t: "70 days ago", text: "SMS reminder delivered to 0700 512 487" },
          { t: "96 days ago", text: "Invoice INV-0130 sent and viewed by customer" },
        ].map((x, i) => (
          <div className="pm-tl-item" key={i}>
            <span className="pm-tl-dot pm-tl-dot-rem" />
            <div><div className="pm-fs-13">{x.text}</div><div className="pm-muted pm-fs-11">{x.t}</div></div>
          </div>
        ))}
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Payment history pattern</div>
        <div className="pm-cyan-note">
          Pays on average in <b>{c.avgDays} days</b> — slower than your 30-day terms. First payment made after 2 reminders in the last 3 invoices. Recommended: include a 2% late-fee clause or ask for a deposit on new work.
        </div>
        <button className="btn pm-btn-primary btn-sm mt-2 w-100" onClick={() => { onContact(c); notify({ tone: "info", title: "Contact options opened" }); }}>
          <MessageCircle size={14} /> Contact customer now
        </button>
      </div>
    </SlideOver>
  );
}

/* ── contact ── */

function ContactModal({ c, onClose, notify }: { c: Customer | null; onClose: () => void; notify: Notify }) {
  const [channel, setChannel] = useState("whatsapp");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (c) setMsg(`Habari ${c.name.split(" ")[0]}, quick follow-up from TechSol Ltd regarding your outstanding balance. Kindly advise when we can expect payment. Asante!`);
  }, [c]);
  if (!c) return null;
  const send = () => {
    notify({ tone: "success", title: `Message sent via ${channel}`, body: `${c.name} · ${c.phone}` });
    onClose();
  };
  return (
    <Modal open={!!c} onClose={onClose} kicker="Contact Customer" title={c.name} subtitle={`${c.phone} · ${c.email}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={send}><Send size={15} /> Send message</button></>}
    >
      <div className="pm-mode-tabs mb-3">
        <button className={cls("pm-mode-tab", channel === "whatsapp" && "pm-mode-on")} onClick={() => setChannel("whatsapp")}><MessageCircle size={13} /> WhatsApp</button>
        <button className={cls("pm-mode-tab", channel === "sms" && "pm-mode-on")} onClick={() => setChannel("sms")}><Send size={13} /> SMS</button>
        <button className={cls("pm-mode-tab", channel === "email" && "pm-mode-on")} onClick={() => setChannel("email")}><Mail size={13} /> Email</button>
      </div>
      <textarea className="form-control pm-input" rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} />
    </Modal>
  );
}

/* ── bulk reminder wizard ── */

function BulkReminder({ open, onClose, aging, customers, notify }: {
  open: boolean; onClose: () => void; aging: AgingRow[]; customers: Customer[]; notify: Notify;
}) {
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState<Set<string>>(new Set(aging.map((r) => r.customerId)));
  const [channel, setChannel] = useState("whatsapp");
  const [tmpl, setTmpl] = useState("friendly");
  const [msg, setMsg] = useState(reminderTemplates[0].body);
  const custOf = (id: string) => customers.find((c) => c.id === id);
  const totalOf = (r: AgingRow) => r.b30 + r.b60 + r.b90 + r.b90p;
  const chosen = aging.filter((r) => sel.has(r.customerId));
  const chosenTotal = chosen.reduce((s, r) => s + totalOf(r), 0);

  useEffect(() => { if (open) { setStep(1); setSel(new Set(aging.map((r) => r.customerId))); setChannel("whatsapp"); setTmpl("friendly"); } }, [open, aging]);

  const pickT = (id: string) => {
    setTmpl(id);
    setMsg(reminderTemplates.find((t) => t.id === id)!.body);
  };
  const finish = () => {
    notify({
      tone: "success", title: `Bulk reminders sent`,
      body: `${chosen.length} customer(s) · ${fmt(chosenTotal)} outstanding · via ${channel}. All logged in each customer's profile.`,
    });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Bulk Reminder Tool" title="Chase multiple customers at once" size="lg"
      footer={
        step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" disabled={sel.size === 0} onClick={() => setStep(2)}>Continue →</button></>)
          : step === 2 ? (<><button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button><button className="btn pm-btn-primary" onClick={() => setStep(3)}>Preview →</button></>)
          : (<><button className="btn pm-btn-ghost" onClick={() => setStep(2)}>← Back</button><button className="btn pm-btn-primary" onClick={finish}><Send size={15} /> Send {chosen.length} reminder(s)</button></>)
      }
    >
      <Stepper steps={3} current={step} labels={["Select customers", "Channel & template", "Review & send"]} />
      {step === 1 && (
        <div className="pm-select-list">
          {aging.map((r) => {
            const c = custOf(r.customerId);
            const on = sel.has(r.customerId);
            return (
              <button key={r.customerId} className={cls("pm-check-list-item", on && "pm-check-on")} onClick={() => setSel((s) => { const n = new Set(s); on ? n.delete(r.customerId) : n.add(r.customerId); return n; })}>
                <span className="pm-checkbox">{on ? "✓" : ""}</span>
                <Avatar name={c?.name ?? "?"} size={26} />
                <span className="flex-grow-1 text-start">
                  <b className="pm-fs-13">{c?.name}</b>
                  <span className="pm-muted pm-fs-11 d-block">{c?.business} · avg {c?.avgDays} days to pay</span>
                </span>
                <b className="pm-fs-13">{fmt(totalOf(r))}</b>
              </button>
            );
          })}
        </div>
      )}
      {step === 2 && (
        <div>
          <Field label="Channel">
            <div className="pm-mode-tabs">
              <button className={cls("pm-mode-tab", channel === "whatsapp" && "pm-mode-on")} onClick={() => setChannel("whatsapp")}><MessageCircle size={13} /> WhatsApp</button>
              <button className={cls("pm-mode-tab", channel === "sms" && "pm-mode-on")} onClick={() => setChannel("sms")}><Send size={13} /> SMS</button>
              <button className={cls("pm-mode-tab", channel === "email" && "pm-mode-on")} onClick={() => setChannel("email")}><Mail size={13} /> Email</button>
            </div>
          </Field>
          <Field label="Template">
            <div className="pm-mode-tabs">
              {reminderTemplates.map((t) => (
                <button key={t.id} className={cls("pm-mode-tab", tmpl === t.id && "pm-mode-on")} onClick={() => pickT(t.id)}>{t.label}</button>
              ))}
            </div>
          </Field>
          <Field label="Message preview" hint="{name}, {inv}, {amount}, {due} are merged per customer.">
            <textarea className="form-control pm-input pm-mono pm-fs-13" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} />
          </Field>
        </div>
      )}
      {step === 3 && (
        <div>
          <div className="pm-summary-card mb-2">
            <div className="pm-summary-row"><span>Recipients</span><b>{chosen.length} customers</b></div>
            <div className="pm-summary-row"><span>Total chased</span><b>{fmt(chosenTotal)}</b></div>
            <div className="pm-summary-row"><span>Channel</span><b>{channel}</b></div>
            <div className="pm-summary-row"><span>Template</span><b>{reminderTemplates.find((t) => t.id === tmpl)?.label}</b></div>
          </div>
          {chosen.map((r) => (
            <div className="pm-tx-row" key={r.customerId}>
              <div>
                <div className="fw-semibold pm-fs-13">{custOf(r.customerId)?.name}</div>
                <div className="pm-muted pm-fs-11">{msg.replace("{name}", custOf(r.customerId)?.name.split(" ")[0] ?? "").replace("{amount}", fmt(totalOf(r))).slice(0, 90)}…</div>
              </div>
              <b className="pm-fs-13">{fmt(totalOf(r))}</b>
            </div>
          ))}
          <div className="pm-cyan-note">Every reminder is logged in the customer profile and the audit trail.</div>
        </div>
      )}
    </Modal>
  );
}

/* ── write-off ── */

function WriteOffModal({ r, onClose, customers, notify, setAging }: {
  r: AgingRow | null; onClose: () => void; customers: Customer[]; notify: Notify;
  setAging: React.Dispatch<React.SetStateAction<AgingRow[]>>;
}) {
  const [reason, setReason] = useState("Customer insolvent");
  const [note, setNote] = useState("");
  const [which, setWhich] = useState("90plus");
  const c = r ? customers.find((x) => x.id === r.customerId) : null;
  const amount = !r ? 0 : which === "90plus" ? r.b90p : which === "all" ? r.b30 + r.b60 + r.b90 + r.b90p : r.b90 + r.b90p;
  if (!r) return null;
  const apply = () => {
    setAging((rs) => rs.map((x) => x.customerId === r.customerId
      ? (which === "all" ? { ...x, b30: 0, b60: 0, b90: 0, b90p: 0 } : which === "90plus" ? { ...x, b90p: 0 } : { ...x, b90: 0, b90p: 0 })
      : x));
    notify({ tone: "warning", title: "Write-off recorded", body: `${fmt(amount)} written off for ${c?.name}. Credit note CN-0042 created — flagged for accountant review.` });
    onClose();
  };
  return (
    <Modal open={!!r} onClose={onClose} kicker="Write-off & Credit Note" title={`Write off — ${c?.name}`} subtitle="For truly uncollectible debts."
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-danger" disabled={amount <= 0} onClick={apply}><ShieldAlert size={15} /> Write off {fmt(amount)}</button></>}
    >
      <Field label="Scope">
        <div className="pm-mode-tabs">
          <button className={cls("pm-mode-tab", which === "90plus" && "pm-mode-on")} onClick={() => setWhich("90plus")}>90+ days bucket</button>
          <button className={cls("pm-mode-tab", which === "60plus" && "pm-mode-on")} onClick={() => setWhich("60plus")}>61+ days</button>
          <button className={cls("pm-mode-tab", which === "all" && "pm-mode-on")} onClick={() => setWhich("all")}>Entire balance</button>
        </div>
      </Field>
      <Field label="Reason">
        <select className="form-select pm-input" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option>Customer insolvent</option><option>Disputed</option><option>Error</option><option>Other</option>
        </select>
      </Field>
      <Field label="Internal note"><input className="form-control pm-input" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <div className="pm-impact-box">
        <div className="pm-impact-row"><span>Receivable reduced by</span><b className="t-danger">− {fmt(amount)}</b></div>
        <div className="pm-impact-row"><span>Credit note created</span><b>CN-0042</b></div>
        <div className="pm-impact-row"><span>Bad-debt ledger entry</span><b>Optional — feeds Bookkeeping</b></div>
      </div>
    </Modal>
  );
}

/* ── AI suggestions ── */

function AiSuggestions({ open, onClose, customers, notify }: {
  open: boolean; onClose: () => void; customers: Customer[]; notify: Notify;
}) {
  const [sent, setSent] = useState<Set<string>>(new Set());
  useEffect(() => { if (open) setSent(new Set()); }, [open]);
  const custOf = (id: string) => customers.find((c) => c.id === id);
  const sendOne = (id: string, name: string, channel: string) => {
    setSent((s) => new Set(s).add(id));
    notify({ tone: "success", title: "Smart reminder sent", body: `${name} received a ${channel} reminder (predicted response: today).` });
  };
  const sendAll = () => {
    aiSuggestionsSeed.forEach((s) => sendOne(s.id, custOf(s.customerId)?.name ?? "", s.channel));
  };
  return (
    <Modal open={open} onClose={onClose} kicker="AI Collections Copilot" title="Suggested reminders for today" subtitle="Ranked by predicted response likelihood from payment history."
      size="lg"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
        <button className="btn pm-btn-primary" disabled={sent.size === aiSuggestionsSeed.length} onClick={sendAll}><Sparkles size={15} /> Send all ({aiSuggestionsSeed.length - sent.size} left)</button></>}
    >
      <div className="pm-ai-grid">
        {aiSuggestionsSeed.map((s) => {
          const c = custOf(s.customerId);
          const done = sent.has(s.id);
          return (
            <div className={cls("pm-ai-card", done && "pm-ai-done")} key={s.id}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <Avatar name={c?.name ?? "?"} size={30} />
                <div className="flex-grow-1">
                  <div className="fw-semibold pm-fs-13">{c?.name}</div>
                  <div className="pm-muted pm-fs-11">{s.invoice} · due {fmtDate(s.due)}</div>
                </div>
                <b className="pm-fs-13">{fmt(s.amount)}</b>
              </div>
              <div className="pm-ai-reason">💡 {s.reason}</div>
              <div className="d-flex align-items-center justify-content-between mt-2">
                <span className="pm-odds"><span className="pm-odds-bar" style={{ width: `${s.odds}%` }} /></span>
                <span className="pm-muted pm-fs-11">responds {s.odds}% · via {s.channel}</span>
                <button className="btn pm-btn-soft btn-sm" disabled={done} onClick={() => sendOne(s.id, c?.name ?? "", s.channel)}>
                  {done ? "✓ Sent" : "Send"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="pm-cyan-note mt-2">Copilot learns from each customer's average days-to-pay and channel response rate.</div>
    </Modal>
  );
}
