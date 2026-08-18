import { useEffect, useState } from "react";
import { cn } from "../../../../lib";
import { Icon, type IconName } from "../../../../components/ui/icons";
import { Badge, Btn, Chip, FieldLabel, Modal, Progress, Reveal, SectionHead, Spark, Toggle, Empty } from "../../../../components/ui";
import { useApp, scrollToId } from "../../../../lib";
import { kes, kesShort, type PmCard, type Txn } from "../../../../lib";
import { CardVisual } from "../../../../components/modals/modalsA";
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
} from "../../../../lib";

/* ============ 01 · Analytics overview ============ */

export function AnalyticsOverview() {
  const { openModal, setPage } = useApp();
  const maxRevenue = Math.max(...REVENUE_STREAMS.map((r) => r.amount));

  return (
    <section id="overview" className="scroll-mt-24">
      <Reveal>
        <div className="pm-hero relative overflow-hidden rounded-2xl border border-line p-5 text-white shadow-pm sm:p-7">
          <div className="pm-hero-dots absolute inset-0" />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="min-w-0 flex-1 basis-[300px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#cfe8db]">
                  <span className="live-dot" /> BAAS · Cards
                </span>
                <span className="rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-[#cfe8db]">Module 5.8</span>
              </div>
              <h1 className="font-display mt-3 text-[26px] font-bold leading-[1.1] tracking-tight sm:text-[34px]">
                Card Analytics &amp;<br className="hidden sm:block" /> Reporting
              </h1>
              <p className="mt-2 max-w-[510px] text-[13px] leading-relaxed text-white/65">
                Every metric behind your card programme — issuance, activation, revenue, merchant mix,
                corporate spend and churn — with a self-service report builder.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn icon="download" onClick={() => openModal({ type: "reportBuilder" })}>Build a Report</Btn>
                <Btn variant="ghost" icon="chart" onClick={() => document.getElementById("revenue")?.scrollIntoView({ behavior: "smooth" })}>Revenue Trends</Btn>
                <Btn variant="ghost" icon="gauge" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { k: "Issued MTD", v: "4,500" },
                  { k: "Virtual share", v: "68%" },
                  { k: "Gross revenue MTD", v: kesShort(18500000) },
                  { k: "Active rate", v: "74%" },
                ].map((s) => (
                  <div key={s.k} className="leading-tight">
                    <p className="font-display num text-[17px] font-bold text-white">{s.v}</p>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/45">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden h-[230px] w-[300px] flex-none md:block">
              {/* mini bar chart */}
              <div className="absolute right-0 top-0 flex h-[150px] w-[210px] items-end gap-2 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                {[40, 55, 48, 66, 74, 82, 78, 90, 96, 100].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-[4px] bg-pmgreen/80 transition-all hover:bg-pmgreen" style={{ height: `${h}%`, opacity: 0.5 + (h / 100) * 0.5 }} />
                ))}
              </div>
              <div className="absolute bottom-0 left-1 w-[210px] rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-white/50">Revenue streams</p>
                {REVENUE_STREAMS.slice(0, 3).map((r) => (
                  <div key={r.name} className="mt-1.5">
                    <div className="flex justify-between text-[10px] font-bold"><span className="text-white/70">{r.name}</span><span className="num">{kesShort(r.amount)}</span></div>
                    <div className="mt-0.5 h-[3px] overflow-hidden rounded-full bg-white/20"><span className="block h-full rounded-full" style={{ width: `${(r.amount / maxRevenue) * 100}%`, background: r.color }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ANALYTICS_DATASETS.map((d, i) => (
          <Reveal key={d.id} delay={i * 70}>
            <button
              onClick={() => document.getElementById(d.id === "issuance" ? "issuance" : d.id === "usage" ? "revenue" : d.id === "merchant" ? "concentration" : "corporate-spend")?.scrollIntoView({ behavior: "smooth" })}
              className="group w-full rounded-2xl border border-line bg-white p-4 text-left shadow-pm transition-all duration-200 hover:-translate-y-1 hover:shadow-pm-lg"
            >
              <div className="flex items-start justify-between">
                <span className={cn("grid h-[42px] w-[42px] place-items-center rounded-xl", i === 0 ? "bg-pmgreen-soft text-[#067647]" : i === 1 ? "bg-pmblue-soft text-[#175cd3]" : i === 2 ? "bg-pmviolet-soft text-[#5925dc]" : "bg-warn-soft text-[#93370d]")}>
                  <Icon name={d.icon} size={19} />
                </span>
                <Icon name="arrowRight" size={15} className="text-faint transition group-hover:translate-x-0.5 group-hover:text-ink" />
              </div>
              <p className="mt-3 text-[13.5px] font-bold text-ink">{d.title}</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{d.desc}</p>
              <Badge tone="muted" className="mt-2">{d.sample}</Badge>
            </button>
          </Reveal>
        ))}
      </div>

      {/* portfolio metrics strip */}
      <Reveal delay={100}>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {PORTFOLIO_METRICS.map((m) => (
            <div key={m.label} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-pm">
              <span className={cn("grid h-10 w-10 flex-none place-items-center rounded-xl", m.tone)}><Icon name={m.icon} size={18} /></span>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint">{m.label}</p>
                <p className="num font-display text-[20px] font-bold tracking-tight text-ink">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 02 · Issuance & activation ============ */


// ajhdb

export function IssuanceSection() {
  const { toast } = useApp();
  return (
    <section id="issuance" className="scroll-mt-24">
      <SectionHead  title="Issuance & Activation" sub="How many cards went out, how fast they activated, and where delivery drops off.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Issuance report exported", "Issuance & activation dataset exported as CSV.")}>Export</Btn>
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="font-display text-[13.5px] font-bold text-ink">Cards issued by type · MTD</p>
              <Badge tone="success" dot>4,500 total</Badge>
            </div>
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[520px] text-left">
                <thead><tr className="border-b border-line bg-canvas/60 text-[10px] font-bold uppercase tracking-[0.08em] text-faint"><th className="px-4 py-2.5">Card Type</th><th className="px-3 py-2.5">Issued MTD</th><th className="px-3 py-2.5">MoM Growth</th><th className="px-4 py-2.5 text-right">Pending Review</th></tr></thead>
                <tbody className="divide-y divide-line/70">
                  {CARD_TYPE_STATS.map((c) => (
                    <tr key={c.type} className="text-[12.5px] transition hover:bg-canvas/60">
                      <td className="px-4 py-3"><span className="flex items-center gap-2 font-bold text-ink"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c.tone }} />{c.type}</span></td>
                      <td className="num px-3 py-3 font-display font-bold text-ink">{c.issued.toLocaleString()}</td>
                      <td className="px-3 py-3"><span className={cn("num inline-flex items-center gap-0.5 font-bold", c.growth >= 0 ? "text-[#067647]" : "text-[#b42318]")}><Icon name={c.growth >= 0 ? "upRight" : "downRight"} size={12} strokeWidth={2.5} />{c.growth > 0 ? `+${c.growth}%` : `${c.growth}%`}</span></td>
                      <td className="px-4 py-3 text-right"><Badge tone={c.pending > 0 ? "warning" : "muted"}>{c.pending}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-line bg-canvas/60 px-4 py-2.5"><p className="text-[11.5px] font-bold text-muted">Analysis of 4,500 issued cards this month.</p></div>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Delivery & activation funnel</p>
              <ul className="space-y-3">
                {DELIVERY_FUNNEL.map((f) => (
                  <li key={f.label}>
                    <div className="mb-1 flex items-baseline justify-between text-[11.5px]">
                      <span className="font-bold text-ink-2">{f.label}</span>
                      <span className="num font-bold text-muted">{f.rate}% · {f.time}</span>
                    </div>
                    <Progress value={f.rate} tone={f.rate >= 90 ? "green" : f.rate >= 70 ? "blue" : "amber"} />
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-lg bg-warn-soft/60 px-3 py-2 text-[11px] font-semibold leading-relaxed text-[#93370d]">
                65% of unactivated physical cards failed delivery OTP verification. Recommend SMS reminders.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: "Virtual share", v: "68%", tone: "text-[#067647]" },
                { k: "Credit approved", v: "1,210", tone: "text-[#175cd3]" },
                { k: "Avg activation", v: "0 mins", tone: "text-[#5925dc]" },
              ].map((s) => (
                <div key={s.k} className="rounded-xl bg-white p-3 text-center shadow-pm">
                  <p className={cn("num font-display text-[15px] font-bold", s.tone)}>{s.v}</p>
                  <p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">{s.k}</p>
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
    <section id="revenue" className="scroll-mt-24">
      <SectionHead  title="Usage & Revenue Trends" sub="Where the money comes from and how the portfolio is performing.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Revenue report exported", "Usage & revenue dataset exported.")}>Export</Btn>
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="font-display text-[13.5px] font-bold text-ink">Gross revenue streams · MTD</p>
              <p className="num font-display text-[16px] font-bold text-pmgreen-dark">{kesShort(total)}</p>
            </div>
            <ul className="space-y-3">
              {REVENUE_STREAMS.map((r) => (
                <li key={r.name}>
                  <div className="mb-1 flex items-baseline justify-between text-[12px]">
                    <span className="font-bold text-ink-2">{r.name}</span>
                    <span className="num font-bold text-muted">{kesShort(r.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-[8px] flex-1 overflow-hidden rounded-full bg-[#eef0f4]"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${(r.amount / max) * 100}%`, background: r.color }} /></div>
                    <span className="w-[130px] flex-none text-[10.5px] font-semibold text-faint">{r.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-lg bg-pmgreen-soft/50 px-3 py-2 text-[11.5px] font-semibold text-[#067647]">
              <Icon name="spark" size={12} className="mr-1 inline" /> Interchange remains the largest single revenue source — merchant discount sharing of KES 12.2M this month.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Channel mix</p>
              {[
                { name: "POS terminals", pct: 45, color: "#12b76a", note: "Physical retail" },
                { name: "Online / e-commerce", pct: 35, color: "#7a5af8", note: "Card-not-present" },
                { name: "ATM withdrawals", pct: 15, color: "#f79009", note: "Cash access" },
                { name: "Mobile wallets", pct: 5, color: "#2e90fa", note: "Apple / Google Pay" },
              ].map((c) => (
                <div key={c.name} className="mb-2.5 last:mb-0">
                  <div className="mb-1 flex items-baseline justify-between text-[11.5px]"><span className="font-bold text-ink-2">{c.name}</span><span className="num font-bold text-muted">{c.pct}%</span></div>
                  <Progress value={c.pct * 2} tone={c.pct >= 40 ? "green" : c.pct >= 30 ? "violet" : c.pct >= 15 ? "amber" : "blue"} />
                </div>
              ))}
              <p className="mt-3 rounded-lg bg-canvas/80 px-3 py-2 text-[11px] leading-relaxed text-muted">Contactless (tap-to-pay) is 68% of POS. Mobile wallet usage doubled since Apple Pay integration.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: "Domestic (KES)", v: "88%", tone: "text-[#067647]" },
                { k: "International", v: "12%", tone: "text-[#175cd3]" },
                { k: "Avg active", v: "74%", tone: "text-[#5925dc]" },
              ].map((s) => (
                <div key={s.k} className="rounded-xl bg-white p-3 text-center shadow-pm">
                  <p className={cn("num font-display text-[15px] font-bold", s.tone)}>{s.v}</p>
                  <p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">{s.k}</p>
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
    <section id="concentration" className="scroll-mt-24">
      <SectionHead  title="Merchant Concentration" sub="Category mix, top merchants and international corridors." />

      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Spend by category · KES millions</p>
            <ul className="space-y-2.5">
              {MERCHANT_MIX.map((m) => (
                <li key={m.name}>
                  <div className="mb-1 flex items-baseline justify-between text-[11.5px]">
                    <span className="font-bold text-ink-2">{m.name}</span>
                    <span className="num font-bold text-muted">KES {m.vol}M · {m.pct}%</span>
                  </div>
                  <div className="h-[7px] overflow-hidden rounded-full bg-[#eef0f4]"><div className="h-full rounded-full" style={{ width: `${(m.vol / maxVol) * 100}%`, background: m.color }} /></div>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-lg bg-pmblue-soft/50 px-3 py-2 text-[11.5px] font-semibold text-[#175cd3]">
              Travel has grown 24% MoM — seasonal holiday bookings. Consider pushing the travel rewards campaign.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-3">
          <div className="flex h-full flex-col gap-3">
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
              <div className="border-b border-line px-4 py-3"><p className="font-display text-[13.5px] font-bold text-ink">Top merchants by volume</p></div>
              <div className="thin-scroll overflow-x-auto">
                <table className="w-full min-w-[480px] text-left">
                  <thead><tr className="border-b border-line bg-canvas/60 text-[10px] font-bold uppercase tracking-[0.08em] text-faint"><th className="px-4 py-2.5">Merchant</th><th className="px-3 py-2.5">Category</th><th className="px-3 py-2.5 text-right">Txn volume</th><th className="px-4 py-2.5 text-right">Share</th></tr></thead>
                  <tbody className="divide-y divide-line/70">
                    {TOP_MERCHANTS.map((m) => (
                      <tr key={m.name} className="text-[12.5px] transition hover:bg-canvas/60">
                        <td className="px-4 py-3 font-bold text-ink">{m.name}</td>
                        <td className="px-3 py-3 font-semibold text-muted">{m.category}</td>
                        <td className="num px-3 py-3 text-right font-bold text-ink">{m.vol.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right"><Badge tone={m.pct > 6 ? "warning" : "muted"}>{m.pct}%</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-line bg-canvas/60 px-4 py-2.5"><p className="text-[11.5px] font-bold text-muted">Top 10 merchants = 45% of total volume — high reliance on daily essentials and transport.</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: "US (USD)", v: "50%", tone: "bg-pmblue-soft text-[#175cd3]" },
                { k: "UK (GBP)", v: "20%", tone: "bg-pmgreen-soft text-[#067647]" },
                { k: "EU (EUR)", v: "15%", tone: "bg-pmviolet-soft text-[#5925dc]" },
                { k: "UAE (AED)", v: "7%", tone: "bg-warn-soft text-[#93370d]" },
              ].map((c) => (
                <div key={c.k} className={cn("rounded-xl p-3 text-center shadow-pm", c.tone)}>
                  <p className="font-display text-[15px] font-bold">{c.v}</p>
                  <p className="text-[9.5px] font-bold uppercase tracking-wide opacity-70">{c.k}</p>
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
    <section id="corporate-spend" className="scroll-mt-24">
      <SectionHead  title="Corporate Spend & Risk" sub="B2B programme performance, at-risk cards and credit-upsell potential." />

      <div className="grid gap-3 lg:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-[13.5px] font-bold text-ink">Department utilisation</p>
              <Badge tone="violet">B2B KES 412M MTD</Badge>
            </div>
            {[
              { name: "Fleet Management", alloc: 2500000, spent: 2100000 },
              { name: "Sales & Marketing", alloc: 1000000, spent: 950000 },
              { name: "Executive Travel", alloc: 800000, spent: 350000 },
            ].map((d) => {
              const pct = Math.round((d.spent / d.alloc) * 100);
              return (
                <div key={d.name} className="mb-3 last:mb-0">
                  <div className="mb-1 flex items-baseline justify-between text-[12px]"><span className="font-bold text-ink-2">{d.name}</span><span className="num font-bold text-muted">{kesShort(d.spent)} / {kesShort(d.alloc)}</span></div>
                  <Progress value={pct} tone={pct > 85 ? "red" : pct > 60 ? "amber" : "green"} />
                </div>
              );
            })}
            <p className="mt-3 rounded-lg bg-canvas/80 px-3 py-2 text-[11.5px] leading-relaxed text-muted">Corporate spend represents 34% of total dashboard volume with highly profitable interchange margins.</p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-[13.5px] font-bold text-ink">At-risk cards</p>
                <Badge tone="danger" dot>1,420 · 3.1%</Badge>
              </div>
              <ul className="space-y-2">
                {AT_RISK_FACTORS.map((f) => (
                  <li key={f.factor} className="flex items-center gap-3 rounded-xl border border-line bg-canvas/40 px-3 py-2">
                    <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-danger-soft text-[#b42318]"><Icon name="alertTri" size={14} /></span>
                    <div className="min-w-0 flex-1"><p className="text-[12px] font-bold text-ink">{f.factor}</p><p className="text-[10.5px] font-semibold text-faint">{f.cards} cards · −{f.drop}% volume</p></div>
                    <Badge tone="danger">−{f.drop}%</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2.5 text-[13.5px] font-bold text-ink">Credit-upsell segments</p>
              <div className="space-y-2">
                {UPSEL_SEGMENTS.map((s) => (
                  <div key={s.segment} className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 flex-none rounded-full bg-pmgreen" />
                    <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold text-ink">{s.segment}</p><p className="text-[10.5px] font-semibold text-faint">{s.eligible} eligible · suggested {s.limit}</p></div>
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
    <section id="insights" className="scroll-mt-24">
      <SectionHead  title="Insights & Forecast" sub="AI-surfaced opportunities and next-month projections.">
        <Btn size="sm" icon="download" onClick={() => openModal({ type: "reportBuilder" })}>Build a Report</Btn>
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <p className="font-display mb-3 text-[13.5px] font-bold text-ink">AI opportunities</p>
            <ul className="space-y-2">
              {AI_OPPORTUNITIES.map((o) => (
                <li key={o.title} className="flex items-start gap-3 rounded-xl border border-line bg-canvas/40 p-3">
                  <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", o.tone)}><Icon name={o.icon} size={16} /></span>
                  <div className="min-w-0"><p className="text-[12.5px] font-bold text-ink">{o.title}</p><p className="text-[11px] leading-snug text-muted">{o.desc}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-3">
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-[13.5px] font-bold text-ink">Lifetime value by segment</p>
                <Badge tone="info">Focus acquisition on Virtual Only</Badge>
              </div>
              <div className="thin-scroll overflow-x-auto">
                <table className="w-full min-w-[460px] text-left">
                  <thead><tr className="border-b border-line bg-canvas/60 text-[10px] font-bold uppercase tracking-[0.08em] text-faint"><th className="px-4 py-2.5">Segment</th><th className="px-3 py-2.5 text-right">Avg LTV</th><th className="px-3 py-2.5 text-right">CAC</th><th className="px-4 py-2.5 text-right">ROI</th></tr></thead>
                  <tbody className="divide-y divide-line/70">
                    {LTV_SEGMENTS.map((s) => (
                      <tr key={s.segment} className="text-[12.5px] transition hover:bg-canvas/60">
                        <td className="px-4 py-3 font-bold text-ink">{s.segment}</td>
                        <td className="num px-3 py-3 text-right font-display font-bold text-ink">{kes(s.ltv)}</td>
                        <td className="num px-3 py-3 text-right font-semibold text-muted">{kes(s.cac)}</td>
                        <td className="px-4 py-3 text-right"><Badge tone={Number(s.roi.replace("x", "")) >= 20 ? "success" : "muted"}>{s.roi}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { k: "Next-month volume", v: FORECAST.volume, tone: "text-[#067647]", note: FORECAST.growth },
                { k: "Predicted active cards", v: FORECAST.activeCards, tone: "text-[#175cd3]", note: "ML forecast" },
                { k: "Confidence score", v: FORECAST.confidence, tone: "text-[#5925dc]", note: "Model v2.4" },
              ].map((s) => (
                <div key={s.k} className="rounded-xl border border-line bg-white p-3.5 shadow-pm">
                  <p className={cn("num font-display text-[16px] font-bold", s.tone)}>{s.v}</p>
                  <p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">{s.k}</p>
                  <p className="mt-0.5 text-[10.5px] font-semibold text-faint">{s.note}</p>
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
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-pmgreen-soft text-[#067647]"><Icon name="checkCircle" size={26} /></span>
          <p className="font-display text-[15px] font-bold text-ink">Report ready</p>
          <p className="max-w-[320px] text-[12.5px] leading-relaxed text-muted">
            {datasets.length} dataset{datasets.length === 1 ? "" : "s"} · {fields.length} fields · {format} format{emails.trim() ? ` · sent to ${emails.trim()}` : " · available for download"}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* stepper */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={cn("grid h-6 w-6 place-items-center rounded-full font-display text-[11px] font-bold", s < step ? "bg-pmgreen text-white" : s === step ? "bg-ink text-white" : "bg-canvas text-faint")}>{s < step ? <Icon name="check" size={11} strokeWidth={3} /> : s}</span>
                  {s < 3 && <span className={cn("h-px w-7 sm:w-10", s < step ? "bg-pmgreen" : "bg-line")} />}
                </div>
              ))}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
              Step {step} · {step === 1 ? "Datasets" : step === 2 ? "Configure Options" : "Frequency & Recipients"}
            </span>
          </div>

          {step === 1 && (
            <div>
              <FieldLabel hint={`${datasets.length} selected`}>1. Select Datasets</FieldLabel>
              <div className="grid gap-2 sm:grid-cols-2">
                {ANALYTICS_DATASETS.map((d) => {
                  const on = datasets.includes(d.id);
                  return (
                    <button key={d.id} onClick={() => toggleDataset(d.id)} className={cn("flex items-start gap-3 rounded-xl border-2 p-3 text-left transition", on ? "border-pmgreen bg-pmgreen-soft/45" : "border-line bg-white hover:border-[#c4c9d4]")}>
                      <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", on ? "bg-pmgreen text-white" : "bg-canvas text-muted")}><Icon name={d.icon} size={16} /></span>
                      <span className="min-w-0"><span className="block text-[12.5px] font-bold text-ink">{d.title}</span><span className="mt-0.5 block text-[10.5px] leading-snug text-muted">{d.desc}</span></span>
                      {on && <Icon name="check" size={15} className="ml-auto mt-1 flex-none text-pmgreen" strokeWidth={2.6} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <FieldLabel>Date range</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {["Today", "Last 7 days", "Last 30 days", "This quarter", "This year", "Custom"].map((r) => (
                    <button key={r} onClick={() => setDateRange(r)} className={cn("rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition", dateRange === r ? "border-pmgreen bg-pmgreen-soft text-[#067647]" : "border-line bg-white text-muted hover:border-[#c4c9d4]")}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel hint={`${fields.length}/${REPORT_FIELDS.length} selected`}>2. Fields</FieldLabel>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {REPORT_FIELDS.map((f) => (
                    <button key={f} onClick={() => toggleField(f)} className={cn("flex items-center gap-2.5 rounded-[10px] border px-3 py-2 text-left transition", fields.includes(f) ? "border-pmgreen bg-pmgreen-soft/45" : "border-line bg-white hover:border-[#c4c9d4]")}>
                      <span className={cn("grid h-4 w-4 flex-none place-items-center rounded border-2", fields.includes(f) ? "border-pmgreen bg-pmgreen text-white" : "border-[#d0d5dd] text-transparent")}><Icon name="check" size={10} strokeWidth={3} /></span>
                      <span className="text-[11.5px] font-bold text-ink">{f}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Format</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {REPORT_FORMATS.map((f) => (
                    <button key={f} onClick={() => setFormat(f)} className={cn("rounded-[10px] border-2 px-3 py-1.5 text-[11.5px] font-bold transition", format === f ? "border-pmgreen bg-pmgreen-soft/50 text-[#067647]" : "border-line bg-white text-ink-2 hover:border-[#c4c9d4]")}>{f}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <FieldLabel>3. Frequency & Timing</FieldLabel>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {REPORT_FREQUENCIES.map((f) => (
                    <button key={f} onClick={() => setFrequency(f)} className={cn("rounded-[10px] border-2 px-3 py-2 text-[12px] font-bold transition", frequency === f ? "border-pmgreen bg-pmgreen-soft/50 text-[#067647]" : "border-line bg-white text-ink-2 hover:border-[#c4c9d4]")}>{f}</button>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Recipients & format</FieldLabel>
                <input value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="david@acmetraders.co.ke, finance@…" className="focus-ring w-full rounded-[10px] border border-line bg-canvas/50 px-3.5 py-2.5 text-[12.5px] font-semibold text-ink outline-none transition placeholder:font-medium placeholder:text-faint focus:border-pmgreen/60 focus:bg-white" />
              </div>
              <div className="rounded-xl border border-line bg-ink p-3.5 text-white">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/50">Summary</p>
                <div className="mt-1.5 space-y-1 text-[12px]">
                  <p className="flex justify-between"><span className="text-white/70">Datasets</span><span className="font-bold">{datasets.length}</span></p>
                  <p className="flex justify-between"><span className="text-white/70">Fields</span><span className="font-bold">{fields.length}</span></p>
                  <p className="flex justify-between"><span className="text-white/70">Range</span><span className="font-bold">{dateRange}</span></p>
                  <p className="flex justify-between"><span className="text-white/70">Format</span><span className="font-bold">{format}</span></p>
                  <p className="flex justify-between"><span className="text-white/70">Frequency</span><span className="font-bold">{frequency}</span></p>
                </div>
              </div>
              <p className="rounded-lg bg-canvas/80 px-3 py-2 text-[11.5px] leading-relaxed text-muted">Exports are pre-formatted to align with KRA iTax templates where applicable.</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
