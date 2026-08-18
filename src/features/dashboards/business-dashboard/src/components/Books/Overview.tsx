import { useEffect, useState } from "react";
import {
  TrendingUp, TrendingDown, Scale, AlertTriangle, Activity,
  FileText, Sparkles, ArrowUpRight, ShieldCheck, Lock,
} from "lucide-react";
import { plExpenses, plMonths, plRevenue } from "../../dataBooks";
import { cls, fmt, type QAction } from "../../lib";
import { Badge, Donut, Kpi, LineChart, Modal, Section } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Overview({ uncategorized, notify, emit, qa, onConsume }: {
  uncategorized: number;
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [health, setHealth] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);
  const [lockedPeriods, setLockedPeriods] = useState<string[]>(["February 2026", "January 2026"]);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "health") setHealth(true);
    if (qa.a === "lockPeriod") setLockOpen(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const revenue = plRevenue[plRevenue.length - 1];
  const expenses = plExpenses[plExpenses.length - 1];
  const profit = revenue - expenses;
  const margin = Math.round((profit / revenue) * 100);

  const checks = [
    { label: "Bank accounts reconciled", ok: true, note: "KCB + Equity matched today" },
    { label: "Transactions categorized", ok: uncategorized === 0, note: `${uncategorized} still uncategorized` },
    { label: "eTIMS transmissions clean", ok: false, note: "2 failed transmissions" },
    { label: "VAT return prepared", ok: true, note: "March draft ready to file" },
    { label: "Trial balance balances", ok: true, note: "Debits = credits" },
    { label: "Statutory filings on time", ok: false, note: "County permit overdue" },
  ];
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  return (
    <>
      <Section
        no="4.1" sub="Your Business · Books Health" id="sec-books-overview"
        title="Bookkeeping Overview"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setLockOpen(true)}><Lock size={15} /> Lock Period</button>
            <button className="btn pm-btn-violet" onClick={() => setHealth(true)}><ShieldCheck size={15} /> Books Health Check</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<TrendingUp size={16} />} label="Revenue (March)" value={fmt(revenue)} delta="▲ 3.9%" sub="vs February" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<TrendingDown size={16} />} label="Expenses (March)" value={fmt(expenses)} delta="▲ 3.4%" sub="tracking with revenue" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Scale size={16} />} label="Net profit (March)" value={fmt(profit)} delta={`${margin}% margin`} sub="before tax" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<AlertTriangle size={16} />} label="Needs your attention" value={`${uncategorized} items`} delta="uncategorized" sub="1-click bulk approve available" deltaTone="down" /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div><div className="pm-card-title">Revenue vs expenses — 6 months</div><div className="pm-card-sub">Straight from the general ledger, updated live</div></div>
                <button className="pm-link-btn pm-fs-12" onClick={() => emit({ a: "report", p: "pl" })}>Open P&L →</button>
              </div>
              <LineChart data={plRevenue} labels={plMonths} format={(n) => fmt(n)} h={150} color="#7c3aed" />
              <div className="pm-dual-legend">
                <span><i style={{ background: "#7c3aed" }} /> Revenue <b>{fmt(revenue)}</b></span>
                <span><i style={{ background: "#e11d48" }} /> Expenses <b>{fmt(expenses)}</b></span>
                <span><i style={{ background: "#0ea37f" }} /> Net <b>{fmt(profit)}</b></span>
              </div>
              <div className="pm-bars mt-3" style={{ height: 90 }}>
                {plExpenses.map((v, i) => (
                  <div className="pm-bar-col" key={i} title={`${plMonths[i]}: ${fmt(v)}`}>
                    <div className="pm-bar-fill" style={{ height: `${(v / Math.max(...plExpenses)) * 100}%`, background: i === plExpenses.length - 1 ? "#e11d48" : "#e11d4899" }} />
                    <div className="pm-bar-x">{plMonths[i]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div className="pm-card-title">Books health score</div>
                <button className="pm-link-btn pm-fs-12" onClick={() => setHealth(true)}>Details →</button>
              </div>
              <div className="d-flex align-items-center gap-3 mb-2">
                <Donut pct={score} size={104} stroke={13} color={score > 80 ? "#0ea37f" : score > 60 ? "#f59e0b" : "#e11d48"} />
                <div>
                  <div className="pm-fs-13 fw-bold">{score >= 80 ? "Healthy" : score >= 60 ? "Needs attention" : "At risk"}</div>
                  <div className="pm-muted pm-fs-12">{checks.filter((c) => c.ok).length} of {checks.length} checks passing. Fix the red items before filing.</div>
                </div>
              </div>
              {checks.map((c) => (
                <button className="pm-health-row" key={c.label} onClick={() => {
                  if (c.label.includes("categorized")) emit({ a: "focusCategorize" });
                  else if (c.label.includes("eTIMS")) emit({ a: "focusEtims" });
                  else if (c.label.includes("VAT")) emit({ a: "fileVat" });
                  else if (c.label.includes("Statutory")) emit({ a: "focusCalendar" });
                  else notify({ tone: "success", title: c.label, body: c.note });
                }}>
                  <span className={cls("pm-health-dot", c.ok ? "pm-health-ok" : "pm-health-bad")}>{c.ok ? "✓" : "!"}</span>
                  <span className="flex-grow-1 text-start">
                    <b className="pm-fs-13">{c.label}</b>
                    <span className="pm-muted pm-fs-11 d-block">{c.note}</span>
                  </span>
                  <ArrowUpRight size={14} className="pm-muted" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="row g-3 mt-0">
          {[
            { ic: <Sparkles size={15} />, title: "Your biggest cost is people — 60% of spend", body: "Salaries are KES 1.86M of KES 3.07M total operating cost. Industry benchmark for a services SME is 45–55%.", act: "Open P&L breakdown", action: () => emit({ a: "report", p: "pl" }) },
            { ic: <Activity size={15} />, title: "VAT input is only 54% of output", body: "You could be missing reclaimable input VAT on expense receipts without KRA PINs. 8 uncategorized items may carry VAT.", act: "Review uncategorized", action: () => emit({ a: "focusCategorize" }) },
            { ic: <FileText size={15} />, title: "Year-end is 9 months away — close monthly", body: "Businesses that close monthly file 4× faster at year-end. 6 of 8 close-checklist items are already done.", act: "Open year-end close", action: () => emit({ a: "yearEnd" }) },
          ].map((c, i) => (
            <div className="col-12 col-lg-4" key={i}>
              <div className="pm-insight-card">
                <span className="pm-insight-ic pm-insight-ic-violet">{c.ic}</span>
                <div className="pm-insight-title">{c.title}</div>
                <div className="pm-insight-body">{c.body}</div>
                <button className="pm-link-btn mt-1" onClick={c.action}>{c.act} <ArrowUpRight size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── health check modal ── */}
      <Modal open={health} onClose={() => setHealth(false)} kicker="Diagnostics" title="Books health check" subtitle="Everything an accountant checks before signing off." size="lg"
        footer={<><button className="btn pm-btn-ghost" onClick={() => setHealth(false)}>Close</button>
          <button className="btn pm-btn-violet" onClick={() => { notify({ tone: "success", title: "Health report generated", body: "Sent to grace@mwendecpa.co.ke with a full breakdown." }); setHealth(false); }}>Send to accountant</button></>}
      >
        <div className="d-flex align-items-center gap-3 mb-3">
          <Donut pct={score} size={86} stroke={11} color={score > 80 ? "#0ea37f" : "#f59e0b"} />
          <div>
            <div className="fw-bold">{score}% healthy</div>
            <div className="pm-muted pm-fs-13">{checks.filter((c) => !c.ok).length} issue(s) to resolve before month-end close.</div>
          </div>
        </div>
        {checks.map((c) => (
          <div className="pm-health-row" key={c.label}>
            <span className={cls("pm-health-dot", c.ok ? "pm-health-ok" : "pm-health-bad")}>{c.ok ? "✓" : "!"}</span>
            <span className="flex-grow-1"><b className="pm-fs-13">{c.label}</b><span className="pm-muted pm-fs-11 d-block">{c.note}</span></span>
            <Badge tone={c.ok ? "success" : "warning"}>{c.ok ? "Pass" : "Fix"}</Badge>
          </div>
        ))}
      </Modal>

      {/* ── lock period ── */}
      <Modal open={lockOpen} onClose={() => setLockOpen(false)} kicker="Period Control" title="Lock an accounting period" subtitle="Locked periods can't be edited — protects filed returns."
        footer={<><button className="btn pm-btn-ghost" onClick={() => setLockOpen(false)}>Cancel</button>
          <button className="btn pm-btn-violet" onClick={() => { setLockedPeriods((p) => [...p, "March 2026"]); notify({ tone: "success", title: "March 2026 locked", body: "No further edits allowed. Unlock requires owner PIN." }); setLockOpen(false); }}><Lock size={15} /> Lock March 2026</button></>}
      >
        <div className="pm-preview-label">Currently locked</div>
        {lockedPeriods.map((p) => (
          <div className="pm-tx-row mb-2" key={p}>
            <div><div className="fw-semibold pm-fs-13">{p}</div><div className="pm-muted pm-fs-11">Locked by Wanjiru K.</div></div>
            <button className="pm-link-btn pm-fs-12" onClick={() => { setLockedPeriods((x) => x.filter((y) => y !== p)); notify({ tone: "warning", title: `${p} unlocked`, body: "Edits are possible again — remember to re-lock after adjustments." }); }}>Unlock</button>
          </div>
        ))}
        <div className="pm-cyan-note mt-2">Locking March prevents accidental edits to figures you've already filed with KRA.</div>
      </Modal>
    </>
  );
}
