import { useEffect, useState } from "react";
import {
  BarChart3, Sparkles, Download, ArrowUpRight, TrendingUp, Clock, Wallet,
  FileText, PieChart as PieIco,
} from "lucide-react";
import { cls, downloadCSV, fmt, fmtN, type QAction } from "../../lib";
import { BarChart, Donut, Field, Kpi, Modal, Section } from "./ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

const SPLIT = [
  { label: "M-Pesa Paybill", v: 186400, color: "#0ea37f" },
  { label: "M-Pesa Till", v: 92750, color: "#38bdf8" },
  { label: "PesaLink", v: 74300, color: "#0e7490" },
  { label: "Payment Links", v: 61850, color: "#7c3aed" },
  { label: "QR Code", v: 48900, color: "#f59e0b" },
  { label: "Card", v: 61200, color: "#e11d48" },
];
const DAYS = [18, 24, 21, 30, 27, 33, 26].map((v) => v * 6400);
const DAYLABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [4, 5, 8, 12, 14, 15, 16, 13, 10, 8, 6, 4];
const HOURLABELS = ["6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p", "12a", "2a", "4a"];

export default function Insights({ notify, emit, qa, onConsume }: {
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const [metrics, setMetrics] = useState<string[]>(["collections", "invoices", "aging"]);
  const [range, setRange] = useState("month");
  const [fmtSel, setFmtSel] = useState("csv");

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "report") setReportOpen(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const total = SPLIT.reduce((s, x) => s + x.v, 0);
  const peakHr = HOURLABELS[HOURS.indexOf(Math.max(...HOURS))];

  const buildReport = () => {
    const rows: Array<Array<string | number>> = [["Metric", "Channel", "Value (KES)"]];
    SPLIT.forEach((s) => {
      if (metrics.includes("collections")) rows.push(["Collections", s.label, s.v]);
    });
    rows.push(["Invoices outstanding", "—", 218400]);
    rows.push(["Overdue", "—", 97500]);
    rows.push(["Peak collection hour", peakHr, "—"]);
    downloadCSV(`paymo-insights-${range}.csv`, rows);
    notify({ tone: "success", title: "Insight report downloaded", body: `Custom report (${range}) saved as CSV.` });
    setReportOpen(false);
  };

  return (
    <>
      <Section
        no="1.9" sub="Money In · Analytics" id="sec-insights"
        title="Collections Insights & Analytics"
        right={
          <button className="btn pm-btn-primary" onClick={() => setReportOpen(true)}>
            <FileText size={15} /> Build Custom Report
          </button>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Wallet size={16} />} label="Collected (7 days)" value={fmt(DAYS.reduce((s, x) => s + x, 0))} delta="11.2%" sub="week-on-week" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<BarChart3 size={16} />} label="Avg ticket" value={fmt(1268)} delta="3.4%" sub="per transaction" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<TrendingUp size={16} />} label="Success rate" value="96.7%" delta="0.8 pts" sub="all channels" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Clock size={16} />} label="Peak collection hour" value={peakHr} delta="Sun 11am" sub="busiest hour" /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-4">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Channel split</div><div className="pm-card-sub">Collections this month</div></div>
              <div className="d-flex align-items-center gap-3">
                <Donut pct={45} size={130} stroke={16} color="#0ea37f" label={<>KES<br />{fmtN(total)}</>} />
                <div className="flex-grow-1">
                  {SPLIT.slice(0, 5).map((s) => (
                    <div className="pm-legend" key={s.label}>
                      <i style={{ background: s.color }} />
                      <span className="pm-fs-12">{s.label}</span>
                      <b className="pm-fs-12 ms-auto">{Math.round((s.v / total) * 100)}%</b>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pm-note mt-2">Paybill + Till = {Math.round(((186400 + 92750) / total) * 100)}% of all inbound money. Card still pending setup — that's the biggest untapped channel.</div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Collections by day</div><div className="pm-card-sub">Last 7 days</div></div>
              <BarChart data={DAYS} labels={DAYLABELS} h={170} format={(n) => fmt(n)} />
              <div className="pm-note mt-2">Weekend dip −18% vs weekdays. Best send day for invoices: <b>Friday morning</b>.</div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Collection heat by hour</div><div className="pm-card-sub">When money arrives</div></div>
              <div className="pm-heat">
                {HOURS.map((h, i) => (
                  <div className="pm-heat-col" key={i}>
                    <div className="pm-heat-cell" style={{ opacity: 0.15 + (h / Math.max(...HOURS)) * 0.85, height: `${10 + h * 4}px` }} />
                    <span className="pm-fs-10 pm-muted">{HOURLABELS[i]}</span>
                  </div>
                ))}
              </div>
              <div className="pm-note mt-2">Peak {peakHr} — most customers pay around lunch. Schedule reminders for 11:30.</div>
            </div>
          </div>
        </div>

        <div className="row g-3 mt-0">
          {[
            {
              ic: <Sparkles size={15} />, title: "M-Pesa callback is your top friction",
              body: "3.6% of Paybill payments fail or stall because no callback URL is configured. Fixing it could recover ~KES 6,700/month automatically.",
              act: "Fix callback URL", action: () => emit({ a: "configChannel", p: "mpesa-paybill" }),
            },
            {
              ic: <Wallet size={15} />, title: "Card payments: KES 61,200 came in last month",
              body: "Even in pending state, one linked card charged successfully. Completing setup could open ~KES 45K/month of card volume.",
              act: "Complete card setup", action: () => emit({ a: "configChannel", p: "card" }),
            },
            {
              ic: <PieIco size={15} />, title: "Overdue bucket grew 9% month-on-month",
              body: "Njoroge & Sons has KES 80,500 across two invoices. The AI copilot rates a WhatsApp nudge at 74% response likelihood today.",
              act: "Review receivables", action: () => emit({ a: "suggest" }),
            },
          ].map((c, i) => (
            <div className="col-12 col-lg-4" key={i}>
              <div className="pm-insight-card">
                <span className="pm-insight-ic">{c.ic}</span>
                <div className="pm-insight-title">{c.title}</div>
                <div className="pm-insight-body">{c.body}</div>
                <button className="pm-link-btn mt-1" onClick={c.action}>{c.act} <ArrowUpRight size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── report builder ── */}
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} kicker="Custom Report" title="Build a collections report" subtitle="Pick metrics, choose a range, download instantly."
        footer={<><button className="btn pm-btn-ghost" onClick={() => setReportOpen(false)}>Cancel</button><button className="btn pm-btn-primary" onClick={buildReport}><Download size={15} /> Generate & Download</button></>}
      >
        <Field label="Include metrics">
          <div className="pm-check-grid">
            {[
              { id: "collections", label: "Collections by channel" },
              { id: "invoices", label: "Invoice statuses" },
              { id: "aging", label: "Receivables aging" },
              { id: "success", label: "Success rates" },
            ].map((m) => (
              <button key={m.id} className={cls("pm-check-chip", metrics.includes(m.id) && "pm-check-on")}
                onClick={() => setMetrics((x) => (x.includes(m.id) ? x.filter((y) => y !== m.id) : [...x, m.id]))}>
                {metrics.includes(m.id) ? "✓ " : ""}{m.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Range">
          <div className="pm-mode-tabs">
            <button className={cls("pm-mode-tab", range === "week" && "pm-mode-on")} onClick={() => setRange("week")}>Last 7 days</button>
            <button className={cls("pm-mode-tab", range === "month" && "pm-mode-on")} onClick={() => setRange("month")}>This month</button>
            <button className={cls("pm-mode-tab", range === "quarter" && "pm-mode-on")} onClick={() => setRange("quarter")}>This quarter</button>
          </div>
        </Field>
        <Field label="Format">
          <div className="pm-mode-tabs">
            <button className={cls("pm-mode-tab", fmtSel === "csv" && "pm-mode-on")} onClick={() => setFmtSel("csv")}>CSV</button>
            <button className={cls("pm-mode-tab", fmtSel === "xlsx" && "pm-mode-on")} onClick={() => setFmtSel("xlsx")}>Excel (emailed)</button>
          </div>
        </Field>
        <div className="pm-note">Reports read straight from the general ledger — the same numbers the accountant sees.</div>
      </Modal>
    </>
  );
}
