/* ============================================================================
 * Card Dashboard — page 5.8 · Card Analytics & Reporting (Bootstrap 5)
 * ========================================================================== */

import { useState } from "react";
import { cn } from "./utils/cn";
import { Icon } from "./icons";
import { Badge, Btn, FieldLabel, Modal, Progress, Reveal, SectionHead } from "./ui";
import { useApp } from "./store";
import {
  AI_OPPORTUNITIES,
  ANALYTICS_DATASETS,
  AT_RISK_FACTORS,
  CARD_TYPE_STATS,
  DELIVERY_FUNNEL,
  FORECAST,
  LTV_SEGMENTS,
  MERCHANT_MIX,
  PORTFOLIO_METRICS,
  REPORT_FIELDS,
  REPORT_FORMATS,
  REPORT_FREQUENCIES,
  REVENUE_STREAMS,
  TOP_MERCHANTS,
  UPSEL_SEGMENTS,
  kes,
  kesShort,
} from "./data";

/* ============ 01 · Analytics overview ============ */

export function AnalyticsOverview() {
  const { openModal, setPage } = useApp();
  const maxRevenue = Math.max(...REVENUE_STREAMS.map((r) => r.amount));

  return (
    <section id="overview" className="pmc-scroll-mt">
      <Reveal>
        <div className="pmc-hero">
          <div className="pmc-hero-dots" />
          <div className="position-relative d-flex flex-wrap align-items-center pmc-gap-6">
            <div className="flex-grow-1" style={{ minWidth: 0, flexBasis: 300 }}>
              <div className="d-flex flex-wrap align-items-center pmc-gap-2">
                <span className="pmc-hero-chip d-inline-flex align-items-center pmc-gap-15 text-uppercase fw-bold" style={{ letterSpacing: "0.12em" }}>
                  <span className="pmc-live-dot" /> BAAS · Cards
                </span>
                <span className="pmc-hero-chip">Module 5.8</span>
              </div>
              <h1 className="pmc-hero-title pmc-mt-3">
                Card Analytics &amp;<br className="d-none d-sm-inline" /> Reporting
              </h1>
              <p className="pmc-hero-sub" style={{ maxWidth: 510 }}>
                Every metric behind your card programme — issuance, activation, revenue, merchant mix,
                corporate spend and churn — with a self-service report builder.
              </p>
              <div className="pmc-mt-4 d-flex flex-wrap pmc-gap-2">
                <Btn icon="download" onClick={() => openModal({ type: "reportBuilder" })}>Build a Report</Btn>
                <Btn variant="ghost" icon="chart" onClick={() => document.getElementById("revenue")?.scrollIntoView({ behavior: "smooth" })}>Revenue Trends</Btn>
                <Btn variant="ghost" icon="gauge" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="pmc-hero-stats">
                {[
                  { k: "Issued MTD", v: "4,500" },
                  { k: "Virtual share", v: "68%" },
                  { k: "Gross revenue MTD", v: kesShort(18500000) },
                  { k: "Active rate", v: "74%" },
                ].map((s) => (
                  <div key={s.k} className="lh-sm">
                    <p className="pmc-hero-stat-value">{s.v}</p>
                    <p className="pmc-hero-stat-label">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pmc-hero-art" style={{ height: 230 }}>
              {/* mini bar chart */}
              <div className="position-absolute d-flex align-items-end pmc-gap-2 p-3" style={{ right: 0, top: 0, height: 150, width: 210, borderRadius: 16, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(2px)" }}>
                {[40, 55, 48, 66, 74, 82, 78, 90, 96, 100].map((h, i) => (
                  <div key={i} className="flex-grow-1" style={{ height: `${h}%`, borderRadius: "4px 4px 0 0", background: "rgba(18,183,106,0.8)", opacity: 0.5 + (h / 100) * 0.5, transition: "all 0.2s ease" }} />
                ))}
              </div>
              <div className="position-absolute p-3" style={{ bottom: 0, left: 4, width: 210, borderRadius: 16, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(2px)" }}>
                <p className="pmc-fs-95 fw-bold text-uppercase mb-0" style={{ letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)" }}>Revenue streams</p>
                {REVENUE_STREAMS.slice(0, 3).map((r) => (
                  <div key={r.name} style={{ marginTop: 6 }}>
                    <div className="d-flex justify-content-between pmc-fs-10 fw-bold"><span style={{ color: "rgba(255,255,255,0.7)" }}>{r.name}</span><span className="pmc-num">{kesShort(r.amount)}</span></div>
                    <div className="overflow-hidden" style={{ marginTop: 2, height: 3, borderRadius: 99, background: "rgba(255,255,255,0.2)" }}>
                      <span className="d-block h-100" style={{ width: `${(r.amount / maxRevenue) * 100}%`, borderRadius: 99, background: r.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="row pmc-g-3 pmc-mt-4">
        {ANALYTICS_DATASETS.map((d, i) => (
          <div key={d.id} className="col-12 col-sm-6 col-xl-3">
            <Reveal delay={i * 70} className="h-100">
              <button
                type="button"
                onClick={() => document.getElementById(d.id === "issuance" ? "issuance" : d.id === "usage" ? "revenue" : d.id === "merchant" ? "concentration" : "corporate-spend")?.scrollIntoView({ behavior: "smooth" })}
                className="pmc-card pmc-lift pmc-focus w-100 p-4 text-start h-100"
              >
                <div className="d-flex align-items-start justify-content-between">
                  <span className={cn("pmc-stat-icon d-grid", i === 0 ? "pmc-tone-green" : i === 1 ? "pmc-tone-blue" : i === 2 ? "pmc-tone-violet" : "pmc-tone-warn")}>
                    <Icon name={d.icon} size={19} />
                  </span>
                  <Icon name="arrowRight" size={15} className="pmc-faint" />
                </div>
                <p className="pmc-mt-3 pmc-fs-135 fw-bold pmc-ink mb-0">{d.title}</p>
                <p className="pmc-mt-05 pmc-fs-115 pmc-muted mb-0" style={{ lineHeight: 1.35 }}>{d.desc}</p>
                <Badge tone="muted" className="pmc-mt-2">{d.sample}</Badge>
              </button>
            </Reveal>
          </div>
        ))}
      </div>

      {/* portfolio metrics strip */}
      <Reveal delay={100}>
        <div className="row g-3 pmc-mt-4">
          {PORTFOLIO_METRICS.map((m) => (
            <div key={m.label} className="col-12 col-sm-4">
              <div className="pmc-card d-flex align-items-center pmc-gap-3 p-4 h-100">
                <span className={cn("pmc-icon-sq d-grid flex-none", m.tone)} style={{ width: 40, height: 40 }}><Icon name={m.icon} size={18} /></span>
                <div>
                  <p className="pmc-fs-105 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.08em" }}>{m.label}</p>
                  <p className="pmc-num pmc-display pmc-fs-20 fw-bold pmc-ink mb-0" style={{ letterSpacing: "-0.02em" }}>{m.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 02 · Issuance & activation ============ */

export function IssuanceSection() {
  const { toast } = useApp();
  return (
    <section id="issuance" className="pmc-scroll-mt">
      <SectionHead no="02" title="Issuance & Activation" sub="How many cards went out, how fast they activated, and where delivery drops off.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Issuance report exported", "Issuance & activation dataset exported as CSV.")}>Export</Btn>
      </SectionHead>

      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-table-frame h-100">
            <div className="d-flex align-items-center justify-content-between px-4 pmc-py-3" style={{ borderBottom: "1px solid var(--pmc-line)" }}>
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Cards issued by type · MTD</p>
              <Badge tone="success" dot>4,500 total</Badge>
            </div>
            <div className="pmc-thin-scroll overflow-auto">
              <table className="pmc-table w-100 text-start" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th className="pmc-px-4 pmc-py-25">Card Type</th>
                    <th className="pmc-px-3 pmc-py-25">Issued MTD</th>
                    <th className="pmc-px-3 pmc-py-25">MoM Growth</th>
                    <th className="pmc-px-4 pmc-py-25 text-end">Pending Review</th>
                  </tr>
                </thead>
                <tbody>
                  {CARD_TYPE_STATS.map((c) => (
                    <tr key={c.type}>
                      <td className="pmc-px-4 pmc-py-3"><span className="d-flex align-items-center pmc-gap-2 fw-bold pmc-ink"><span style={{ width: 10, height: 10, borderRadius: 99, background: c.tone }} />{c.type}</span></td>
                      <td className="pmc-num pmc-px-3 pmc-py-3 pmc-display fw-bold pmc-ink">{c.issued.toLocaleString()}</td>
                      <td className="pmc-px-3 pmc-py-3">
                        <span className={cn("pmc-num d-inline-flex align-items-center fw-bold", c.growth >= 0 ? "pmc-green-ink" : "pmc-danger-ink")} style={{ gap: 2 }}>
                          <Icon name={c.growth >= 0 ? "upRight" : "downRight"} size={12} strokeWidth={2.5} />{c.growth > 0 ? `+${c.growth}%` : `${c.growth}%`}
                        </span>
                      </td>
                      <td className="pmc-px-4 pmc-py-3 text-end"><Badge tone={c.pending > 0 ? "warning" : "muted"}>{c.pending}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pmc-py-25" style={{ borderTop: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.6)" }}>
              <p className="pmc-fs-115 fw-bold pmc-muted mb-0">Analysis of 4,500 issued cards this month.</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-card p-4">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Delivery & activation funnel</p>
              <ul className="list-unstyled d-flex flex-column pmc-gap-3 mb-0">
                {DELIVERY_FUNNEL.map((f) => (
                  <li key={f.label}>
                    <div className="pmc-mb-1 d-flex align-items-baseline justify-content-between pmc-fs-115">
                      <span className="fw-bold pmc-ink-2">{f.label}</span>
                      <span className="pmc-num fw-bold pmc-muted">{f.rate}% · {f.time}</span>
                    </div>
                    <Progress value={f.rate} tone={f.rate >= 90 ? "green" : f.rate >= 70 ? "blue" : "amber"} />
                  </li>
                ))}
              </ul>
              <p className="pmc-note pmc-note-warn pmc-mt-3 mb-0" style={{ fontSize: 11 }}>
                65% of unactivated physical cards failed delivery OTP verification. Recommend SMS reminders.
              </p>
            </div>
            <div className="row g-2">
              {[
                { k: "Virtual share", v: "68%", tone: "pmc-green-ink" },
                { k: "Credit approved", v: "1,210", tone: "pmc-blue-ink" },
                { k: "Avg activation", v: "0 mins", tone: "pmc-violet-ink" },
              ].map((s) => (
                <div key={s.k} className="col-4">
                  <div className="pmc-radius p-3 text-center h-100" style={{ background: "#fff", boxShadow: "var(--shadow-pm)" }}>
                    <p className={cn("pmc-num pmc-display pmc-fs-15 fw-bold mb-0", s.tone)}>{s.v}</p>
                    <p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>{s.k}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 03 · Usage & revenue ============ */

export function RevenueSection() {
  const { toast } = useApp();
  const max = Math.max(...REVENUE_STREAMS.map((r) => r.amount));
  const total = REVENUE_STREAMS.reduce((s, r) => s + r.amount, 0);

  return (
    <section id="revenue" className="pmc-scroll-mt">
      <SectionHead no="03" title="Usage & Revenue Trends" sub="Where the money comes from and how the portfolio is performing.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Revenue report exported", "Usage & revenue dataset exported.")}>Export</Btn>
      </SectionHead>

      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-card p-4 h-100">
            <div className="pmc-mb-3 d-flex align-items-baseline justify-content-between">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Gross revenue streams · MTD</p>
              <p className="pmc-num pmc-display pmc-fs-16 fw-bold pmc-green-dark mb-0">{kesShort(total)}</p>
            </div>
            <ul className="list-unstyled d-flex flex-column pmc-gap-3 mb-0">
              {REVENUE_STREAMS.map((r) => (
                <li key={r.name}>
                  <div className="pmc-mb-1 d-flex align-items-baseline justify-content-between pmc-fs-12">
                    <span className="fw-bold pmc-ink-2">{r.name}</span>
                    <span className="pmc-num fw-bold pmc-muted">{kesShort(r.amount)}</span>
                  </div>
                  <div className="d-flex align-items-center pmc-gap-2">
                    <div className="flex-grow-1 overflow-hidden" style={{ height: 8, borderRadius: 99, background: "#eef0f4" }}>
                      <div className="h-100" style={{ width: `${(r.amount / max) * 100}%`, borderRadius: 99, background: r.color, transition: "all 0.7s ease" }} />
                    </div>
                    <span className="flex-none pmc-fs-105 fw-semibold pmc-faint" style={{ width: 130 }}>{r.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="pmc-note pmc-note-green pmc-mt-3 mb-0">
              <Icon name="spark" size={12} className="flex-none" style={{ marginTop: 2 }} /> Interchange remains the largest single revenue source — merchant discount sharing of KES 12.2M this month.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-card p-4">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Channel mix</p>
              {[
                { name: "POS terminals", pct: 45, tone: "green" as const, note: "Physical retail" },
                { name: "Online / e-commerce", pct: 35, tone: "violet" as const, note: "Card-not-present" },
                { name: "ATM withdrawals", pct: 15, tone: "amber" as const, note: "Cash access" },
                { name: "Mobile wallets", pct: 5, tone: "blue" as const, note: "Apple / Google Pay" },
              ].map((c, i, arr) => (
                <div key={c.name} style={{ marginBottom: i === arr.length - 1 ? 0 : 10 }}>
                  <div className="pmc-mb-1 d-flex align-items-baseline justify-content-between pmc-fs-115"><span className="fw-bold pmc-ink-2">{c.name}</span><span className="pmc-num fw-bold pmc-muted">{c.pct}%</span></div>
                  <Progress value={c.pct * 2} tone={c.tone} />
                </div>
              ))}
              <p className="pmc-note pmc-note-canvas pmc-mt-3 mb-0" style={{ fontSize: 11 }}>Contactless (tap-to-pay) is 68% of POS. Mobile wallet usage doubled since Apple Pay integration.</p>
            </div>
            <div className="row g-2">
              {[
                { k: "Domestic (KES)", v: "88%", tone: "pmc-green-ink" },
                { k: "International", v: "12%", tone: "pmc-blue-ink" },
                { k: "Avg active", v: "74%", tone: "pmc-violet-ink" },
              ].map((s) => (
                <div key={s.k} className="col-4">
                  <div className="pmc-radius p-3 text-center h-100" style={{ background: "#fff", boxShadow: "var(--shadow-pm)" }}>
                    <p className={cn("pmc-num pmc-display pmc-fs-15 fw-bold mb-0", s.tone)}>{s.v}</p>
                    <p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>{s.k}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 04 · Merchant concentration ============ */

export function ConcentrationSection() {
  const maxVol = Math.max(...MERCHANT_MIX.map((m) => m.vol));
  return (
    <section id="concentration" className="pmc-scroll-mt">
      <SectionHead no="04" title="Merchant Concentration" sub="Category mix, top merchants and international corridors." />

      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-5 h-100">
          <div className="pmc-card p-4 h-100">
            <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Spend by category · KES millions</p>
            <ul className="list-unstyled d-flex flex-column pmc-gap-25 mb-0">
              {MERCHANT_MIX.map((m) => (
                <li key={m.name}>
                  <div className="pmc-mb-1 d-flex align-items-baseline justify-content-between pmc-fs-115">
                    <span className="fw-bold pmc-ink-2">{m.name}</span>
                    <span className="pmc-num fw-bold pmc-muted">KES {m.vol}M · {m.pct}%</span>
                  </div>
                  <div className="overflow-hidden" style={{ height: 7, borderRadius: 99, background: "#eef0f4" }}>
                    <div className="h-100" style={{ width: `${(m.vol / maxVol) * 100}%`, borderRadius: 99, background: m.color }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="pmc-note pmc-note-blue pmc-mt-3 mb-0">
              Travel has grown 24% MoM — seasonal holiday bookings. Consider pushing the travel rewards campaign.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80} className="col-12 col-lg-7 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-table-frame">
              <div className="px-4 pmc-py-3" style={{ borderBottom: "1px solid var(--pmc-line)" }}>
                <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Top merchants by volume</p>
              </div>
              <div className="pmc-thin-scroll overflow-auto">
                <table className="pmc-table w-100 text-start" style={{ minWidth: 480 }}>
                  <thead>
                    <tr>
                      <th className="pmc-px-4 pmc-py-25">Merchant</th>
                      <th className="pmc-px-3 pmc-py-25">Category</th>
                      <th className="pmc-px-3 pmc-py-25 text-end">Txn volume</th>
                      <th className="pmc-px-4 pmc-py-25 text-end">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TOP_MERCHANTS.map((m) => (
                      <tr key={m.name}>
                        <td className="pmc-px-4 pmc-py-3 fw-bold pmc-ink">{m.name}</td>
                        <td className="pmc-px-3 pmc-py-3 fw-semibold pmc-muted">{m.category}</td>
                        <td className="pmc-num pmc-px-3 pmc-py-3 text-end fw-bold pmc-ink">{m.vol.toLocaleString()}</td>
                        <td className="pmc-px-4 pmc-py-3 text-end"><Badge tone={m.pct > 6 ? "warning" : "muted"}>{m.pct}%</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 pmc-py-25" style={{ borderTop: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.6)" }}>
                <p className="pmc-fs-115 fw-bold pmc-muted mb-0">Top 10 merchants = 45% of total volume — high reliance on daily essentials and transport.</p>
              </div>
            </div>
            <div className="row g-2">
              {[
                { k: "US (USD)", v: "50%", tone: "pmc-tone-blue" },
                { k: "UK (GBP)", v: "20%", tone: "pmc-tone-green" },
                { k: "EU (EUR)", v: "15%", tone: "pmc-tone-violet" },
                { k: "UAE (AED)", v: "7%", tone: "pmc-tone-warn" },
              ].map((c) => (
                <div key={c.k} className="col-6 col-sm-3">
                  <div className={cn("pmc-radius p-3 text-center h-100", c.tone)} style={{ boxShadow: "var(--shadow-pm)" }}>
                    <p className="pmc-display pmc-fs-15 fw-bold mb-0">{c.v}</p>
                    <p className="pmc-fs-95 fw-bold text-uppercase mb-0" style={{ letterSpacing: "0.025em", opacity: 0.7 }}>{c.k}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 05 · Corporate spend & risk ============ */

export function CorporateSpendSection() {
  return (
    <section id="corporate-spend" className="pmc-scroll-mt">
      <SectionHead no="05" title="Corporate Spend & Risk" sub="B2B programme performance, at-risk cards and credit-upsell potential." />

      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-6 h-100">
          <div className="pmc-card p-4 h-100">
            <div className="pmc-mb-3 d-flex align-items-center justify-content-between">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Department utilisation</p>
              <Badge tone="violet">B2B KES 412M MTD</Badge>
            </div>
            {[
              { name: "Fleet Management", alloc: 2500000, spent: 2100000 },
              { name: "Sales & Marketing", alloc: 1000000, spent: 950000 },
              { name: "Executive Travel", alloc: 800000, spent: 350000 },
            ].map((d, i, arr) => {
              const pct = Math.round((d.spent / d.alloc) * 100);
              return (
                <div key={d.name} style={{ marginBottom: i === arr.length - 1 ? 0 : 12 }}>
                  <div className="pmc-mb-1 d-flex align-items-baseline justify-content-between pmc-fs-12"><span className="fw-bold pmc-ink-2">{d.name}</span><span className="pmc-num fw-bold pmc-muted">{kesShort(d.spent)} / {kesShort(d.alloc)}</span></div>
                  <Progress value={pct} tone={pct > 85 ? "red" : pct > 60 ? "amber" : "green"} />
                </div>
              );
            })}
            <p className="pmc-note pmc-note-canvas pmc-mt-3 mb-0">Corporate spend represents 34% of total dashboard volume with highly profitable interchange margins.</p>
          </div>
        </Reveal>

        <Reveal delay={80} className="col-12 col-lg-6 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-card p-4">
              <div className="pmc-mb-3 d-flex align-items-center justify-content-between">
                <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">At-risk cards</p>
                <Badge tone="danger" dot>1,420 · 3.1%</Badge>
              </div>
              <ul className="list-unstyled d-flex flex-column pmc-gap-2 mb-0">
                {AT_RISK_FACTORS.map((f) => (
                  <li key={f.factor} className="d-flex align-items-center pmc-gap-3 pmc-radius px-3 pmc-py-2" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}>
                    <span className="pmc-icon-sq d-grid flex-none pmc-tone-danger" style={{ width: 32, height: 32, borderRadius: 8 }}><Icon name="alertTri" size={14} /></span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}><p className="pmc-fs-12 fw-bold pmc-ink mb-0">{f.factor}</p><p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{f.cards} cards · −{f.drop}% volume</p></div>
                    <Badge tone="danger">−{f.drop}%</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pmc-card p-4">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-25">Credit-upsell segments</p>
              <div className="d-flex flex-column pmc-gap-2">
                {UPSEL_SEGMENTS.map((s) => (
                  <div key={s.segment} className="d-flex align-items-center pmc-gap-25">
                    <span className="flex-none" style={{ width: 10, height: 10, borderRadius: 99, background: "var(--pmc-green)" }} />
                    <div className="flex-grow-1" style={{ minWidth: 0 }}><p className="text-truncate pmc-fs-12 fw-bold pmc-ink mb-0">{s.segment}</p><p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{s.eligible} eligible · suggested {s.limit}</p></div>
                    <Badge tone="success">{s.conv}% est.</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 06 · Insights & forecast ============ */

export function InsightsSection() {
  const { openModal } = useApp();
  return (
    <section id="insights" className="pmc-scroll-mt">
      <SectionHead no="06" title="Insights & Forecast" sub="AI-surfaced opportunities and next-month projections.">
        <Btn size="sm" icon="download" onClick={() => openModal({ type: "reportBuilder" })}>Build a Report</Btn>
      </SectionHead>

      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-5 h-100">
          <div className="pmc-card p-4 h-100">
            <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">AI opportunities</p>
            <ul className="list-unstyled d-flex flex-column pmc-gap-2 mb-0">
              {AI_OPPORTUNITIES.map((o) => (
                <li key={o.title} className="d-flex align-items-start pmc-gap-3 pmc-radius p-3" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}>
                  <span className={cn("pmc-icon-sq d-grid flex-none", o.tone)}><Icon name={o.icon} size={16} /></span>
                  <div style={{ minWidth: 0 }}><p className="pmc-fs-125 fw-bold pmc-ink mb-0">{o.title}</p><p className="pmc-fs-11 pmc-muted mb-0" style={{ lineHeight: 1.35 }}>{o.desc}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={80} className="col-12 col-lg-7 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-card p-4">
              <div className="pmc-mb-3 d-flex flex-wrap align-items-center justify-content-between pmc-gap-2">
                <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Lifetime value by segment</p>
                <Badge tone="info">Focus acquisition on Virtual Only</Badge>
              </div>
              <div className="pmc-thin-scroll overflow-auto">
                <table className="pmc-table w-100 text-start" style={{ minWidth: 460 }}>
                  <thead>
                    <tr>
                      <th className="pmc-px-4 pmc-py-25">Segment</th>
                      <th className="pmc-px-3 pmc-py-25 text-end">Avg LTV</th>
                      <th className="pmc-px-3 pmc-py-25 text-end">CAC</th>
                      <th className="pmc-px-4 pmc-py-25 text-end">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LTV_SEGMENTS.map((s) => (
                      <tr key={s.segment}>
                        <td className="pmc-px-4 pmc-py-3 fw-bold pmc-ink">{s.segment}</td>
                        <td className="pmc-num pmc-px-3 pmc-py-3 text-end pmc-display fw-bold pmc-ink">{kes(s.ltv)}</td>
                        <td className="pmc-num pmc-px-3 pmc-py-3 text-end fw-semibold pmc-muted">{kes(s.cac)}</td>
                        <td className="pmc-px-4 pmc-py-3 text-end"><Badge tone={Number(s.roi.replace("x", "")) >= 20 ? "success" : "muted"}>{s.roi}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="row g-2">
              {[
                { k: "Next-month volume", v: FORECAST.volume, tone: "pmc-green-ink", note: FORECAST.growth },
                { k: "Predicted active cards", v: FORECAST.activeCards, tone: "pmc-blue-ink", note: "ML forecast" },
                { k: "Confidence score", v: FORECAST.confidence, tone: "pmc-violet-ink", note: "Model v2.4" },
              ].map((s) => (
                <div key={s.k} className="col-12 col-sm-4">
                  <div className="pmc-card pmc-p-35 h-100">
                    <p className={cn("pmc-num pmc-display pmc-fs-16 fw-bold mb-0", s.tone)}>{s.v}</p>
                    <p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>{s.k}</p>
                    <p className="pmc-mt-05 pmc-fs-105 fw-semibold pmc-faint mb-0">{s.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Report builder modal (original 5.8 flow)
   ============================================================ */

export function ReportBuilderModal() {
  const { modal, closeModal, toast } = useApp();
  const open = modal?.type === "reportBuilder";
  const [step, setStep] = useState(1);
  const [datasets, setDatasets] = useState<string[]>(["issuance"]);
  const [fields, setFields] = useState<string[]>(REPORT_FIELDS.slice(0, 5));
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [format, setFormat] = useState("CSV");
  const [frequency, setFrequency] = useState("Once");
  const [emails, setEmails] = useState("");
  const [done, setDone] = useState(false);

  const toggleDataset = (id: string) => setDatasets((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  const toggleField = (f: string) => setFields((fs) => (fs.includes(f) ? fs.filter((x) => x !== f) : [...fs, f]));

  const reset = () => {
    setStep(1);
    setDatasets(["issuance"]);
    setFields(REPORT_FIELDS.slice(0, 5));
    setDateRange("Last 30 days");
    setFormat("CSV");
    setFrequency("Once");
    setEmails("");
    setDone(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); closeModal(); }}
      icon="download"
      title={done ? "Report scheduled" : "Build a report"}
      subtitle={done ? undefined : "Select datasets, fields and delivery — or export immediately."}
      width="max-w-2xl"
      footer={
        done ? (
          <Btn icon="check" onClick={() => { reset(); closeModal(); }}>Done</Btn>
        ) : step === 1 ? (
          <>
            <Btn variant="outline" onClick={() => { reset(); closeModal(); }}>Cancel</Btn>
            <Btn icon="arrowRight" disabled={datasets.length === 0} onClick={() => setStep(2)}>Continue</Btn>
          </>
        ) : step === 2 ? (
          <>
            <Btn variant="outline" icon="chevLeft" onClick={() => setStep(1)}>Back</Btn>
            <Btn icon="arrowRight" disabled={fields.length === 0} onClick={() => setStep(3)}>Continue</Btn>
          </>
        ) : (
          <>
            <Btn variant="outline" icon="chevLeft" onClick={() => setStep(2)}>Back</Btn>
            <Btn
              icon="check"
              onClick={() => {
                setDone(true);
                toast("success", "Report compiled", frequency === "Once" ? "Your report is ready for download." : `Report scheduled ${frequency.toLowerCase()} and will be emailed.`);
              }}
            >
              {frequency === "Once" ? "Generate Report" : "Schedule Report"}
            </Btn>
          </>
        )
      }
    >
      {done ? (
        <div className="d-flex flex-column align-items-center pmc-gap-3 py-4 text-center">
          <span className="pmc-done-icon d-grid"><Icon name="checkCircle" size={26} /></span>
          <p className="pmc-display pmc-fs-15 fw-bold pmc-ink mb-0">Report ready</p>
          <p className="pmc-fs-125 pmc-muted mb-0" style={{ maxWidth: 320, lineHeight: 1.6 }}>
            {datasets.length} dataset{datasets.length === 1 ? "" : "s"} · {fields.length} fields · {format} format{emails.trim() ? ` · sent to ${emails.trim()}` : " · available for download"}.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column pmc-gap-4">
          {/* stepper */}
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center pmc-gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="d-flex align-items-center pmc-gap-2">
                  <span className={cn("pmc-step-dot", s < step && "done", s === step && "current")}>{s < step ? <Icon name="check" size={11} strokeWidth={3} /> : s}</span>
                  {s < 3 && <span className="pmc-step-line" style={s < step ? { background: "var(--pmc-green)" } : undefined} />}
                </div>
              ))}
            </div>
            <span className="pmc-fs-11 fw-bold text-uppercase pmc-faint" style={{ letterSpacing: "0.1em" }}>
              Step {step} · {step === 1 ? "Datasets" : step === 2 ? "Configure Options" : "Frequency & Recipients"}
            </span>
          </div>

          {step === 1 && (
            <div>
              <FieldLabel hint={`${datasets.length} selected`}>1. Select Datasets</FieldLabel>
              <div className="row g-2">
                {ANALYTICS_DATASETS.map((d) => {
                  const on = datasets.includes(d.id);
                  return (
                    <div key={d.id} className="col-12 col-sm-6">
                      <button type="button" onClick={() => toggleDataset(d.id)} className={cn("pmc-focus pmc-choice h-100", on && "on")} style={{ padding: 12 }}>
                        <span className={cn("pmc-icon-sq d-grid flex-none", on ? "pmc-tone-green-solid" : "pmc-tone-muted")}><Icon name={d.icon} size={16} /></span>
                        <span style={{ minWidth: 0 }}><span className="d-block pmc-fs-125 fw-bold pmc-ink">{d.title}</span><span className="d-block pmc-mt-05 pmc-fs-105 pmc-muted" style={{ lineHeight: 1.35 }}>{d.desc}</span></span>
                        {on && <Icon name="check" size={15} className="ms-auto flex-none pmc-green" style={{ marginTop: 4 }} strokeWidth={2.6} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="d-flex flex-column pmc-gap-4">
              <div>
                <FieldLabel>Date range</FieldLabel>
                <div className="d-flex flex-wrap pmc-gap-2">
                  {["Today", "Last 7 days", "Last 30 days", "This quarter", "This year", "Custom"].map((r) => (
                    <button key={r} type="button" onClick={() => setDateRange(r)} className={cn("pmc-focus pmc-pill-choice", dateRange === r && "on")}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel hint={`${fields.length}/${REPORT_FIELDS.length} selected`}>2. Fields</FieldLabel>
                <div className="row g-2">
                  {REPORT_FIELDS.map((f) => (
                    <div key={f} className="col-12 col-sm-6">
                      <button type="button" onClick={() => toggleField(f)} className={cn("pmc-focus pmc-choice h-100", fields.includes(f) && "on")} style={{ padding: "8px 12px" }}>
                        <span className="d-grid flex-none" style={{ width: 16, height: 16, borderRadius: 4, placeItems: "center", border: `2px solid ${fields.includes(f) ? "var(--pmc-green)" : "#d0d5dd"}`, background: fields.includes(f) ? "var(--pmc-green)" : "transparent", color: fields.includes(f) ? "#fff" : "transparent" }}>
                          <Icon name="check" size={10} strokeWidth={3} />
                        </span>
                        <span className="pmc-fs-115 fw-bold pmc-ink">{f}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Format</FieldLabel>
                <div className="d-flex flex-wrap pmc-gap-2">
                  {REPORT_FORMATS.map((f) => (
                    <button key={f} type="button" onClick={() => setFormat(f)} className={cn("pmc-focus pmc-rect-choice", format === f && "on")}>{f}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="d-flex flex-column pmc-gap-4">
              <div>
                <FieldLabel>3. Frequency & Timing</FieldLabel>
                <div className="row g-2">
                  {REPORT_FREQUENCIES.map((f) => (
                    <div key={f} className="col-6 col-sm-3">
                      <button type="button" onClick={() => setFrequency(f)} className={cn("pmc-focus pmc-rect-choice w-100 justify-content-center", frequency === f && "on")}>{f}</button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Recipients & format</FieldLabel>
                <input value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="david@acmetraders.co.ke, finance@…" className="form-control pmc-focus pmc-fs-125 fw-semibold" />
              </div>
              <div className="pmc-radius pmc-p-35 text-white" style={{ border: "1px solid var(--pmc-line)", background: "var(--pmc-ink)" }}>
                <p className="pmc-fs-105 fw-bold text-uppercase mb-0" style={{ letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)" }}>Summary</p>
                <div className="pmc-mt-15 d-flex flex-column pmc-gap-1" style={{ fontSize: 12 }}>
                  <p className="d-flex justify-content-between mb-0"><span style={{ color: "rgba(255,255,255,0.7)" }}>Datasets</span><span className="fw-bold">{datasets.length}</span></p>
                  <p className="d-flex justify-content-between mb-0"><span style={{ color: "rgba(255,255,255,0.7)" }}>Fields</span><span className="fw-bold">{fields.length}</span></p>
                  <p className="d-flex justify-content-between mb-0"><span style={{ color: "rgba(255,255,255,0.7)" }}>Range</span><span className="fw-bold">{dateRange}</span></p>
                  <p className="d-flex justify-content-between mb-0"><span style={{ color: "rgba(255,255,255,0.7)" }}>Format</span><span className="fw-bold">{format}</span></p>
                  <p className="d-flex justify-content-between mb-0"><span style={{ color: "rgba(255,255,255,0.7)" }}>Frequency</span><span className="fw-bold">{frequency}</span></p>
                </div>
              </div>
              <p className="pmc-note pmc-note-canvas mb-0">Exports are pre-formatted to align with KRA iTax templates where applicable.</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
