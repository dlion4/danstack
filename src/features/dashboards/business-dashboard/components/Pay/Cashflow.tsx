import { useState } from "react";
import {
  TrendingUp, TrendingDown, Wallet, CalendarClock, Download, Settings2, AlertTriangle, RefreshCw, CheckCircle2,
} from "lucide-react";
import type { ScheduledPayment } from "../../dataPay";
import { balanceForecast, forecastLabels, scheduledSeed } from "../../dataPay";
import { cls, downloadCSV, fmt, fmtDate, todayISO, type QAction } from "../../lib";
import { Badge, Field, Kpi, LineChart, Modal, Section, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Cashflow({ notify }: {
  notify: Notify;
  emit?: (q: QAction) => void;
  qa?: QAction;
  onConsume?: () => void;
}) {
  const [sched, setSched] = useState<ScheduledPayment[]>(scheduledSeed);
  const [guard, setGuard] = useState({ on: true, threshold: 250000 });
  const [guardOpen, setGuardOpen] = useState(false);
  const [projecting, setProjecting] = useState(false);

  const totalScheduled = sched.filter((s) => s.status !== "completed").reduce((x, s) => x + s.amount, 0);
  const minProjected = Math.min(...balanceForecast);
  const risk = guard.on && minProjected < guard.threshold;

  const runNow = (id: string) => {
    setSched((ss) => ss.map((s) => (s.id === id ? { ...s, status: "processing" } : s)));
    notify({ tone: "info", title: "Payment released", body: "Executing immediately via the scheduled channel." });
    window.setTimeout(() => {
      setSched((ss) => ss.map((s) => (s.id === id ? { ...s, status: "completed" } : s)));
      notify({ tone: "success", title: "Payment settled", body: "The scheduled payment has completed." });
    }, 1600);
  };

  const cancel = (id: string) => {
    setSched((ss) => ss.map((s) => (s.id === id ? { ...s, status: "failed" } : s)));
    notify({ tone: "warning", title: "Payment cancelled", body: "Removed from the queue. The bill stays open." });
  };

  const project = () => {
    setProjecting(true);
    window.setTimeout(() => {
      setProjecting(false);
      notify({ tone: "success", title: "Projection refreshed", body: "14-day forecast rebuilt from live balances + scheduled outflows." });
    }, 1200);
  };

  const exportSched = () => {
    downloadCSV(`paymo-scheduled-${todayISO()}.csv`,
      [["Payment", "Recipient", "Amount", "Date", "Channel", "Status"], ...sched.map((s) => [s.label, s.to, s.amount, s.date, s.channel, s.status])]);
    notify({ tone: "success", title: "CSV downloaded", body: `${sched.length} scheduled payments exported.` });
  };

  return (
    <>
      <Section
        no="2.8" sub="Money Out · Liquidity" id="sec-cashflow"
        title="Cashflow & Scheduled Payments"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={exportSched}><Download size={15} /> Export Schedule</button>
            <button className="btn pm-btn-primary" onClick={project} disabled={projecting}>
              <RefreshCw size={15} className={cls(projecting && "pm-spin")} /> {projecting ? "Rebuilding…" : "Run Projection"}
            </button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Wallet size={16} />} label="Current balance" value={fmt(2410300)} delta="KCB + M-Pesa wallets" sub="combined" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CalendarClock size={16} />} label="Scheduled outflows" value={fmt(totalScheduled)} delta={`${sched.filter((s) => s.status === "scheduled" || s.status === "processing").length} payments`} sub="next 14 days" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<TrendingDown size={16} />} label="Lowest point (14d)" value={fmt(minProjected)} delta="after payroll + rent" sub="day 7" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<TrendingUp size={16} />} label="Safe days of runway" value="32 days" delta="▲ 4 days" sub="vs last projection" /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="pm-card">
              <div className="pm-card-head">
                <div className="pm-card-title">14-day balance projection</div>
                <div className="pm-card-sub">Ledger-driven — recalculates when payments land or leave.</div>
              </div>
              <LineChart data={balanceForecast} labels={forecastLabels} format={(n) => fmt(n)} h={190} color="#0e7490" />
              {guard.on && (
                <div className="pm-guard-line" style={{ bottom: `${(guard.threshold / 2500000) * 100}%` }}>
                  <span>overdraft guard · KES {guard.threshold.toLocaleString()}</span>
                </div>
              )}
              <div className="pm-note mt-2">Day 7 dips {Math.round(((1 - minProjected / 2410300) * 100))}% — payroll + rent on the same day. Move rent to the 3rd to smooth the trough.</div>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className={cls("pm-card h-100", risk && "pm-card-risk")}>
              <div className="pm-card-head">
                <div className="pm-card-title">Scheduled payments</div>
                <button className="pm-icon-btn" onClick={() => setGuardOpen(true)} aria-label="Guard settings"><Settings2 size={14} /></button>
              </div>
              {risk && (
                <div className="pm-warn-chip w-100 justify-content-start mb-2">
                  <AlertTriangle size={13} /> Projection falls below your KES {guard.threshold.toLocaleString()} guard on day 7.
                </div>
              )}
              {sched.map((s) => (
                <div className="pm-sched-row" key={s.id}>
                  <div className="flex-grow-1">
                    <div className="fw-semibold pm-fs-13">{s.label}</div>
                    <div className="pm-muted pm-fs-11">{s.to} · {s.channel} · {fmtDate(s.date)}</div>
                  </div>
                  <div className="text-end">
                    <b className="pm-fs-13">{fmt(s.amount)}</b>
                    <div className="d-flex gap-1 justify-content-end mt-1">
                      {s.status === "scheduled" && (
                        <>
                          <button className="pm-link-btn pm-fs-11" onClick={() => runNow(s.id)}>Run now</button>
                          <button className="pm-link-btn pm-fs-11 t-danger" onClick={() => cancel(s.id)}>Cancel</button>
                        </>
                      )}
                      {s.status === "processing" && <Badge tone="warning" dot>Processing</Badge>}
                      {s.status === "completed" && <Badge tone="success">Settled ✓</Badge>}
                      {s.status === "failed" && <Badge tone="muted">Cancelled</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── guard settings ── */}
      <Modal open={guardOpen} onClose={() => setGuardOpen(false)} kicker="Liquidity" title="Overdraft guard" subtitle="Warn when the projection dips below a safety level."
        footer={<><button className="btn pm-btn-ghost" onClick={() => setGuardOpen(false)}>Cancel</button>
          <button className="btn pm-btn-primary" onClick={() => { notify({ tone: "success", title: "Guard updated", body: `Threshold set to KES ${guard.threshold.toLocaleString()} — alerts ${guard.on ? "ON" : "OFF"}.` }); setGuardOpen(false); }}>
            <CheckCircle2 size={15} /> Save guard
          </button></>}
      >
        <div className="pm-toggle-row"><Toggle on={guard.on} onChange={(v) => setGuard({ ...guard, on: v })} label="Enable overdraft guard" /></div>
        <Field label="Safety threshold (KES)">
          <input type="number" className="form-control pm-input pm-input-lg" value={guard.threshold} onChange={(e) => setGuard({ ...guard, threshold: Number(e.target.value) })} />
        </Field>
        <div className="pm-cyan-note">When the projection crosses this line, PayMo alerts you 5 days ahead and suggests which payment to defer.</div>
      </Modal>
    </>
  );
}
