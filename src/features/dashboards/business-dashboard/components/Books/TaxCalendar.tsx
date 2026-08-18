import { useEffect, useState } from "react";
import {
  CalendarClock, AlertTriangle, CheckCircle2, Bell, Send, Loader2, Download, ShieldCheck,
} from "lucide-react";
import type { TaxEvent } from "../../dataBooks";
import { cls, daysUntil, downloadCSV, fmt, fmtDate, todayISO, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, PillTabs, Section, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function TaxCalendar({ events, setEvents, notify, qa, onConsume }: {
  events: TaxEvent[];
  setEvents: React.Dispatch<React.SetStateAction<TaxEvent[]>>;
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [tab, setTab] = useState("upcoming");
  const [payFor, setPayFor] = useState<TaxEvent | null>(null);
  const [remind, setRemind] = useState(false);
  const [penalty, setPenalty] = useState<TaxEvent | null>(null);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "focusCalendar") { setTab("overdue"); document.getElementById("sec-tax-calendar")?.scrollIntoView({ behavior: "smooth" }); }
    if (qa.a === "reminders") setRemind(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const overdue = events.filter((e) => e.status === "overdue");
  const dueSoon = events.filter((e) => e.status === "due-soon");
  const totalDue = events.filter((e) => e.status !== "filed").reduce((s, e) => s + e.amount, 0);
  const list = events.filter((e) => (tab === "all" ? true : tab === "upcoming" ? e.status !== "filed" : e.status === tab));

  return (
    <>
      <Section
        no="4.8" sub="Your Business · Compliance Calendar" id="sec-tax-calendar"
        title="Tax Calendar & Statutory Deadlines"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => { downloadCSV(`tax-calendar-${todayISO()}.csv`, [["Obligation", "Agency", "Amount", "Due", "Frequency", "Status"], ...events.map((e) => [e.label, e.agency, e.amount, e.due, e.freq, e.status])]); notify({ tone: "success", title: "Calendar exported", body: "Import it into Google Calendar or share with your accountant." }); }}><Download size={15} /> Export Calendar</button>
            <button className="btn pm-btn-violet" onClick={() => setRemind(true)}><Bell size={15} /> Reminder Settings</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<AlertTriangle size={16} />} label="Overdue" value={`${overdue.length} filing`} delta={fmt(overdue.reduce((s, e) => s + e.amount, 0))} sub="penalties accruing daily" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CalendarClock size={16} />} label="Due within 7 days" value={`${dueSoon.length} filings`} delta={fmt(dueSoon.reduce((s, e) => s + e.amount, 0))} sub="auto-pay covers most" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<ShieldCheck size={16} />} label="Total obligations" value={fmt(totalDue)} delta={`${events.filter((e) => e.autopay).length} on auto-pay`} sub="next 90 days" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="On-time record" value="96%" delta="▲ 4 pts" sub="last 12 months" /></div>
        </div>

        {overdue.length > 0 && (
          <div className="pm-suggest-banner pm-suggest-banner-violet">
            <div className="pm-suggest-ic"><AlertTriangle size={18} className="t-danger" /></div>
            <div className="flex-grow-1">
              <b>{overdue[0].label} is {Math.abs(daysUntil(overdue[0].due))} days overdue</b>
              <span className="pm-muted pm-fs-13 d-block">{overdue[0].agency} · {fmt(overdue[0].amount)} plus penalties. Every day costs you more.</span>
            </div>
            <button className="btn pm-btn-violet btn-sm" onClick={() => setPayFor(overdue[0])}>Resolve now →</button>
          </div>
        )}

        <div className="pm-card">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between px-1 pt-1">
            <PillTabs
              tabs={[
                { id: "upcoming", label: "Upcoming", count: events.filter((e) => e.status !== "filed").length },
                { id: "overdue", label: "Overdue", count: overdue.length, tone: "danger" },
                { id: "due-soon", label: "Due soon", count: dueSoon.length, tone: "warning" },
                { id: "filed", label: "Filed", count: events.filter((e) => e.status === "filed").length },
                { id: "all", label: "All", count: events.length },
              ]}
              active={tab}
              onChange={setTab}
            />
            <span className="pm-muted pm-fs-12">Reminders: 7 days, 3 days & morning-of · via WhatsApp + email</span>
          </div>
          <div className="pm-timeline mt-3">
            {list.map((e) => {
              const d = daysUntil(e.due);
              return (
                <div className={cls("pm-cal-row", e.status === "overdue" && "pm-cal-overdue", e.status === "filed" && "pm-cal-filed")} key={e.id}>
                  <div className={cls("pm-cal-date", e.status === "overdue" && "pm-cal-date-red", e.status === "due-soon" && "pm-cal-date-amber")}>
                    <b>{new Date(e.due + "T00:00:00").getDate()}</b>
                    <span>{new Date(e.due + "T00:00:00").toLocaleDateString("en-KE", { month: "short" })}</span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <b className="pm-fs-14">{e.label}</b>
                      <Badge tone={e.agency === "KRA" ? "info" : e.agency === "County" ? "warning" : "muted"}>{e.agency}</Badge>
                      {e.autopay && <span className="pm-autopay-chip">⚡ auto-pay</span>}
                    </div>
                    <div className="pm-muted pm-fs-12">{e.freq} · {e.status === "filed" ? "filed on time ✓" : d < 0 ? `${Math.abs(d)} days overdue` : `in ${d} day${d === 1 ? "" : "s"}`}</div>
                  </div>
                  <div className="text-end">
                    <b className="pm-fs-14">{fmt(e.amount)}</b>
                    <div className="d-flex gap-2 justify-content-end mt-1">
                      {e.status === "filed" ? <Badge tone="success">Filed</Badge> : (
                        <>
                          {e.status === "overdue" && <button className="pm-link-btn pm-fs-11 t-danger" onClick={() => setPenalty(e)}>Penalty calc</button>}
                          <button className="btn pm-btn-violet btn-sm" onClick={() => setPayFor(e)}>Pay & file</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── pay & file ── */}
      <PayFileModal e={payFor} onClose={() => setPayFor(null)} notify={notify}
        onDone={(id) => setEvents((es) => es.map((x) => (x.id === id ? { ...x, status: "filed" } : x)))} />

      {/* ── penalty calculator ── */}
      <PenaltyModal e={penalty} onClose={() => setPenalty(null)} />

      {/* ── reminder settings ── */}
      <RemindersModal open={remind} onClose={() => setRemind(false)} notify={notify} events={events} setEvents={setEvents} />
    </>
  );
}

/* ── pay & file ── */

function PayFileModal({ e, onClose, notify, onDone }: {
  e: TaxEvent | null; onClose: () => void; notify: Notify; onDone: (id: string) => void;
}) {
  const [source, setSource] = useState("Tax & Statutory reserve");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { if (e) { setPin(""); setBusy(false); setDone(false); setSource("Tax & Statutory reserve"); } }, [e]);
  if (!e) return null;
  const overdueDays = Math.max(0, -daysUntil(e.due));
  const penalty = e.status === "overdue" ? Math.round(e.amount * 0.05 + e.amount * 0.01 * Math.ceil(overdueDays / 30)) : 0;
  const submit = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false); setDone(true);
      onDone(e.id);
      notify({ tone: "success", title: `${e.label} filed & paid`, body: `${fmt(e.amount + penalty)} paid to ${e.agency}. Receipt filed to the audit trail.` });
    }, 1700);
  };
  return (
    <Modal open={!!e} onClose={onClose} kicker={`${e.agency} filing`} title={e.label} subtitle={e.status === "overdue" ? `${overdueDays} days overdue — penalties apply` : `Due ${fmtDate(e.due)}`} hideClose={busy}
      footer={done ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
        : (<><button className="btn pm-btn-ghost" disabled={busy} onClick={onClose}>Cancel</button>
          <button className="btn pm-btn-violet" disabled={!pin || busy} onClick={submit}>{busy ? <><Loader2 size={15} className="pm-spin" /> Filing…</> : <><Send size={15} /> Pay {fmt(e.amount + penalty)} & file</>}</button></>)}
    >
      {done ? (
        <div className="text-center py-3">
          <div className="pm-big-ic pm-big-ic-success mx-auto"><CheckCircle2 size={28} /></div>
          <h5 className="fw-bold mt-3">Filed & paid</h5>
          <p className="pm-muted">{e.label} settled with {e.agency}. Acknowledgement saved to your audit trail.</p>
        </div>
      ) : (
        <>
          <div className="pm-summary-card mb-3">
            <div className="pm-summary-row"><span>Principal amount</span><b>{fmt(e.amount)}</b></div>
            {penalty > 0 && <div className="pm-summary-row"><span>Penalty & interest</span><b className="t-danger">+ {fmt(penalty)}</b></div>}
            <div className="pm-summary-row"><span>Total to pay</span><b>{fmt(e.amount + penalty)}</b></div>
            <div className="pm-summary-row"><span>Agency</span><b>{e.agency}</b></div>
          </div>
          <Field label="Pay from">
            <div className="pm-check-list">
              {["Tax & Statutory reserve", "KCB Current — •••• 4491", "M-Pesa Business Wallet"].map((s) => (
                <button key={s} className={cls("pm-check-list-item", source === s && "pm-check-on")} onClick={() => setSource(s)}>
                  <span className="pm-checkbox">{source === s ? "✓" : ""}</span><span>{s}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Enter your PIN to authorise" req><input type="password" className="form-control pm-input" placeholder="••••" value={pin} onChange={(e2) => setPin(e2.target.value)} /></Field>
          {busy && (
            <div className="pm-sync-list mt-2">
              <div className="pm-sync-step pm-sync-active"><Loader2 size={15} className="pm-spin" /> Generating payment slip…</div>
              <div className="pm-sync-step"><span className="pm-sync-num">2</span> Paying {e.agency}…</div>
              <div className="pm-sync-step"><span className="pm-sync-num">3</span> Filing return & saving receipt…</div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

/* ── penalty calculator ── */

function PenaltyModal({ e, onClose }: { e: TaxEvent | null; onClose: () => void }) {
  if (!e) return null;
  const days = Math.max(0, -daysUntil(e.due));
  const months = Math.ceil(days / 30);
  const latePenalty = Math.round(e.amount * 0.05);
  const interest = Math.round(e.amount * 0.01 * months);
  return (
    <Modal open={!!e} onClose={onClose} kicker="Penalty Estimate" title={`Cost of being late — ${e.label}`}
      footer={<button className="btn pm-btn-primary w-100" onClick={onClose}>Understood</button>}
    >
      <div className="pm-summary-card">
        <div className="pm-summary-row"><span>Days overdue</span><b>{days} days ({months} month{months === 1 ? "" : "s"})</b></div>
        <div className="pm-summary-row"><span>Principal</span><b>{fmt(e.amount)}</b></div>
        <div className="pm-summary-row"><span>Late-filing penalty (5%)</span><b className="t-danger">+ {fmt(latePenalty)}</b></div>
        <div className="pm-summary-row"><span>Interest (1% per month)</span><b className="t-danger">+ {fmt(interest)}</b></div>
        <div className="pm-summary-row"><span>Total if paid today</span><b>{fmt(e.amount + latePenalty + interest)}</b></div>
      </div>
      <div className="pm-warn-chip mt-3 w-100 justify-content-start">
        <AlertTriangle size={14} /> Every additional month adds {fmt(Math.round(e.amount * 0.01))} in interest. Pay today to stop the clock.
      </div>
    </Modal>
  );
}

/* ── reminders ── */

function RemindersModal({ open, onClose, notify, events, setEvents }: {
  open: boolean; onClose: () => void; notify: Notify; events: TaxEvent[];
  setEvents: React.Dispatch<React.SetStateAction<TaxEvent[]>>;
}) {
  const [lead, setLead] = useState<string[]>(["7", "3", "0"]);
  const [channels, setChannels] = useState<string[]>(["WhatsApp", "Email"]);
  return (
    <Modal open={open} onClose={onClose} kicker="Never Miss a Deadline" title="Reminder & auto-pay settings" size="lg"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn pm-btn-violet" onClick={() => { notify({ tone: "success", title: "Reminder settings saved", body: `${lead.length} reminder(s) per obligation via ${channels.join(" + ")}.` }); onClose(); }}>Save settings</button></>}
    >
      <Field label="Remind me">
        <div className="pm-check-grid">
          {[["14", "14 days before"], ["7", "7 days before"], ["3", "3 days before"], ["1", "1 day before"], ["0", "Morning of"]].map(([v, l]) => (
            <button key={v} className={cls("pm-check-chip", lead.includes(v) && "pm-check-on")} onClick={() => setLead((x) => (x.includes(v) ? x.filter((y) => y !== v) : [...x, v]))}>{lead.includes(v) ? "✓ " : ""}{l}</button>
          ))}
        </div>
      </Field>
      <Field label="Deliver via">
        <div className="pm-check-grid">
          {["WhatsApp", "Email", "SMS", "Push"].map((c) => (
            <button key={c} className={cls("pm-check-chip", channels.includes(c) && "pm-check-on")} onClick={() => setChannels((x) => (x.includes(c) ? x.filter((y) => y !== c) : [...x, c]))}>{channels.includes(c) ? "✓ " : ""}{c}</button>
          ))}
        </div>
      </Field>
      <div className="pm-preview-label mt-3">Auto-pay per obligation</div>
      {events.filter((e) => e.status !== "filed").map((e) => (
        <div className="pm-sched-row" key={e.id}>
          <div className="flex-grow-1">
            <div className="fw-semibold pm-fs-13">{e.label}</div>
            <div className="pm-muted pm-fs-11">{e.agency} · {e.freq} · {fmt(e.amount)}</div>
          </div>
          <Toggle on={e.autopay} onChange={(v) => setEvents((es) => es.map((x) => (x.id === e.id ? { ...x, autopay: v } : x)))} />
        </div>
      ))}
      <div className="pm-cyan-note mt-2">Auto-pay draws from your Tax & Statutory reserve on the morning of the deadline — you're never late and never surprised.</div>
    </Modal>
  );
}
