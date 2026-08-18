import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown, Search, Bell, User, Settings, Building2, LogOut, Sparkles, Wallet, LayoutGrid, Zap, Package, Megaphone, Users, Shield, Database, Puzzle } from "lucide-react";
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, BarController, BarElement, DoughnutController, ArcElement, Tooltip, Legend } from "chart.js";
import { StoreProvider, useStore } from "./components/Dashboard/store";
import { ToastHost, Badge, Modal, Section, Spark } from "./components/Dashboard/ui";
import { ACTIVITY_FEED, BUSINESSES, CASH_SPLIT, EXPENSES_30D, EXPENSES_90D, fmtK, HEALTH_SCORE, MODULES, REVENUE_30D, REVENUE_90D } from "./dataDashboard";
import { cls } from "./lib";
import { Avatar } from "./components/Getpaid/ui";
import { NAVIGATION, ZONES, type NavZone } from "./lib/navigation";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, BarController, BarElement, DoughnutController, ArcElement, Tooltip, Legend);

type NavPage = "dashboard" | "getpaid" | "paysuppliers" | "cash" | "books" | "crm" | "productstore" | "inventory" | "marketing" | "profile" | "team" | "disputes" | "notifications" | "data" | "integrations" | "portfolio" | "funding" | "insurance";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutGrid,
  Wallet,
  User,
  Building2,
  Zap,
  Sparkles,
  Settings,
  Package,
  Megaphone,
  Users,
  Shield,
  Bell,
  Database,
  Puzzle,
};

/* ==================================================================
   HERO — dynamic morning briefing
================================================================== */
function PageHeader() {
  const { openModal, attention, kpis } = useStore();
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const urgent = attention.filter((a) => a.tier === "urgent").length;
  const netPos = kpis.find((k) => k.id === "net")?.value ?? 0;
  return (
    <div className="pm-banner-hero p-4 d-flex flex-wrap align-items-center gap-4" style={{ background: "linear-gradient(115deg, #0b1322 0%, #123a2c 55%, #0d5c38 100%)" }}>
      <div className="flex-grow-1" style={{ minWidth: 280 }}>
        <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
          <span className="pm-zone"><i className="bi bi-grid-1x2" /> HOME</span>
          <span className="badge-soft" style={{ background: "rgba(255,255,255,0.12)", color: "#cfe8db" }}>🛍️ TS Retail Ltd</span>
          <span className="badge-soft" style={{ background: "rgba(255,255,255,0.12)", color: "#cfe8db" }}><i className="bi bi-calendar3 me-1" />{today}</span>
        </div>
        <h1 className="mb-1" style={{ fontSize: "1.7rem", fontWeight: 800 }}>{greet}, Wanjiku 👋</h1>
        <p className="mb-0" style={{ color: "#b9c7d8", fontSize: "0.88rem", maxWidth: 560 }}>
          {urgent > 0 ? (
            <><b style={{ color: "#ffd0cc" }}>{urgent} thing{urgent === 1 ? "" : "s"} need you today</b> — and the business is trending {kpis[1].trend.includes("+") ? "up" : "flat"}. Here's your briefing:</>
          ) : (
            <>All quiet on the western front. Here's your briefing for {today}:</>
          )}
        </p>
      </div>
      <div className="d-flex gap-2 flex-wrap align-items-center">
        <div className="d-flex gap-3 px-2">
          <div className="text-center" style={{ minWidth: 96 }}>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, fontFamily: "Sora", color: "#7ee2b0" }}>{fmtK(netPos)}</div>
            <div style={{ fontSize: "0.6rem", color: "#b9c7d8", letterSpacing: "0.08em" }}>NET POSITION</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }} />
          <div className="text-center" style={{ minWidth: 76 }}>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, fontFamily: "Sora", color: urgent ? "#ff8f88" : "#7ee2b0" }}>{urgent}</div>
            <div style={{ fontSize: "0.6rem", color: "#b9c7d8", letterSpacing: "0.08em" }}>URGENT</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.15)" }} />
          <div className="text-center" style={{ minWidth: 76 }}>
            <div style={{ fontSize: "1.35rem", fontWeight: 800, fontFamily: "Sora", color: "#7ee2b0" }}>{HEALTH_SCORE.overall}</div>
            <div style={{ fontSize: "0.6rem", color: "#b9c7d8", letterSpacing: "0.08em" }}>HEALTH</div>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("quickInvoice")}><i className="bi bi-plus-lg me-1" /> Quick Invoice</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("analytics")}><i className="bi bi-graph-up me-1" /> Analytics</button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   0.1 FINANCIAL PULSE — hero cash card + 5 supporting cards
================================================================== */
function FinancialPulse() {
  const { kpis, openModal } = useStore();
  const hero = kpis.find((k) => k.id === "cash")!;
  const rest = kpis.filter((k) => k.id !== "cash" && k.id !== "net");
  const net = kpis.find((k) => k.id === "net")!;
  const trendTone = (k: typeof kpis[number]) => (k.id === "paidOut" || k.id === "receivables" || k.id === "payables" ? (k.trend.includes("+") && k.id === "paidOut" ? "down" : k.trend.includes("+KES") || k.trend.includes("due") ? "down" : k.trend.startsWith("-") ? "up" : "flat") : (k.trend.includes("+") ? "up" : "flat"));
  return (
    <>
      <Section no="0.1" title="Financial Pulse" sub="Six numbers that answer every question you have about money today." />
      <div className="row g-3">
        {/* HERO CASH CARD */}
        <div className="col-lg-4 col-md-6">
          <div className="pm-card h-100" style={{ background: "linear-gradient(135deg, #12b76a 0%, #0b8f52 70%, #0a7a47 100%)", border: "none", color: "#fff", cursor: "pointer" }} onClick={() => openModal("kpiDetail", { ...hero })}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="pm-kpi-label" style={{ color: "rgba(255,255,255,0.75)" }}>Cash on Hand</div>
                <div style={{ fontSize: "2.1rem", fontWeight: 800, fontFamily: "Sora", letterSpacing: "-0.03em" }}>KES 1,245,000</div>
                <div className="mt-1" style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.8)" }}>{hero.sub}</div>
              </div>
              <span className="pm-kpi-icon" style={{ width: 40, height: 40, background: "rgba(255,255,255,0.18)", color: "#fff" }}><i className="bi bi-wallet2" /></span>
            </div>
            <div className="d-flex justify-content-between align-items-end mt-3">
              <div>
                <span className="pm-delta up" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}><i className="bi bi-arrow-up-right" /> +12% vs last month</span>
                <div className="mt-2 d-flex gap-1 flex-wrap">
                  {CASH_SPLIT.map((c) => (
                    <span key={c.label} className="badge-soft" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: "0.62rem" }}><i className={`bi ${c.icon} me-1`} />{c.label} {fmtK(c.value)}K</span>
                  ))}
                </div>
              </div>
              <svg width="120" height="44" aria-hidden>
                <defs><linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(255,255,255,0.5)" /><stop offset="100%" stopColor="rgba(255,255,255,0)" /></linearGradient></defs>
                <polygon points={`0,44 ${hero.spark.map((v, i) => `${(i / (hero.spark.length - 1)) * 120},${40 - ((v - 780) / (1250 - 780)) * 36}`).join(" ")} 120,44`} fill="url(#heroSpark)" />
                <polyline points={hero.spark.map((v, i) => `${(i / (hero.spark.length - 1)) * 120},${40 - ((v - 780) / (1250 - 780)) * 36}`).join(" ")} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
        {/* SUPPORTING CARDS */}
        {rest.map((k) => (
          <div className="col-lg-4 col-md-6" key={k.id}>
            <div className="pm-card pm-card-hover h-100" style={{ cursor: "pointer", borderTop: `3px solid ${k.id === "collected" ? "var(--pm-green)" : k.id === "paidOut" ? "var(--pm-warn)" : k.id === "receivables" ? "var(--pm-danger)" : "var(--pm-violet)"}`, ...(k.alert ? { boxShadow: "0 0 0 3px rgba(240,68,56,0.08)" } : {}) }} onClick={() => openModal("kpiDetail", { ...k })}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div className="pm-kpi-label">{k.label}</div>
                  <div className="pm-kpi-value" style={{ fontSize: "1.45rem" }}>{fmtK(k.value)}</div>
                </div>
                <span className="pm-kpi-icon" style={{ width: 36, height: 36, background: k.id === "collected" ? "var(--pm-green-soft)" : k.id === "paidOut" ? "#fef0c7" : k.id === "receivables" ? "#fee4e2" : "#f0ebfe", color: k.id === "collected" ? "var(--pm-green-dark)" : k.id === "paidOut" ? "var(--pm-warn)" : k.id === "receivables" ? "var(--pm-danger)" : "var(--pm-violet)" }}>
                  <i className={`bi ${k.id === "collected" ? "bi-graph-up-arrow" : k.id === "paidOut" ? "bi-graph-down-arrow" : k.id === "receivables" ? "bi-hourglass-split" : "bi-truck"}`} />
                </span>
              </div>
              <div className="pm-prod-meta mb-2">{k.sub}</div>
              <div className="d-flex justify-content-between align-items-center">
                <span className={`pm-delta ${trendTone(k)}`}>
                  <i className={`bi ${trendTone(k) === "up" ? "bi-arrow-up-right" : trendTone(k) === "down" ? "bi-arrow-down-right" : "bi-dash"}`} /> {k.trend}
                </span>
                <Spark data={k.spark} w={76} h={26} color={trendTone(k) === "up" ? "#12b76a" : trendTone(k) === "down" ? "#f04438" : "#98a2b3"} />
              </div>
              {k.alert && <div className="mt-2"><Badge tone={k.alert.color as "red" | "amber"}><i className="bi bi-exclamation-triangle me-1" />{k.alert.text}</Badge></div>}
            </div>
          </div>
        ))}
        {/* NET POSITION — wide strip */}
        <div className="col-12">
          <div className="pm-card pm-card-hover d-flex flex-wrap align-items-center gap-3" style={{ cursor: "pointer", background: "linear-gradient(90deg, #f8fafc, #fff)", borderLeft: "4px solid var(--pm-violet)" }} onClick={() => openModal("kpiDetail", { ...net })}>
            <span className="pm-kpi-icon" style={{ width: 42, height: 42, background: "#f0ebfe", color: "var(--pm-violet)" }}><i className="bi bi-diagram-3" /></span>
            <div className="flex-grow-1" style={{ minWidth: 200 }}>
              <div className="pm-kpi-label">Net Cash Position</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "Sora", color: "var(--pm-ink)" }}>KES 685,000 <span className="pm-delta up ms-2" style={{ fontSize: "0.72rem" }}>▲ +8.2%</span></div>
              <div className="pm-prod-meta">{net.sub}</div>
            </div>
            <Spark data={net.spark} w={160} h={40} color="#7a5af8" />
            <span className="badge-soft blue" style={{ cursor: "pointer" }}>Balance sheet →</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   0.2 ATTENTION HUB — money-at-stake redesign
================================================================== */
function AttentionHub() {
  const { attention, dismissAttention, snoozeAttention, openModal } = useStore();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? attention : attention.slice(0, 8);
  const tierColor: Record<string, string> = { urgent: "var(--pm-danger)", important: "var(--pm-warn)", informational: "var(--pm-green)" };
  const tierLabel: Record<string, string> = { urgent: "Urgent — act today", important: "Important — this week", informational: "Good to know" };
  const tierIcon: Record<string, string> = { urgent: "bi-fire", important: "bi-clock", informational: "bi-check2-circle" };
  return (
    <>
      <Section no="0.2" title="Attention Hub" sub="What needs you — every item shows the money or impact at stake." actions={<button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("allAttention")}><i className="bi bi-list-check me-1" /> View all</button>} />
      {(["urgent", "important", "informational"] as const).map((tier) => {
        const items = visible.filter((a) => a.tier === tier);
        if (items.length === 0) return null;
        return (
          <div key={tier} className="mb-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="pm-kpi-icon" style={{ width: 24, height: 24, fontSize: "0.7rem", background: tierColor[tier] + "1c", color: tierColor[tier] }}><i className={`bi ${tierIcon[tier]}`} /></span>
              <b style={{ fontSize: "0.78rem", color: tierColor[tier] }}>{tierLabel[tier]}</b>
              <span className="badge-soft slate" style={{ fontSize: "0.6rem" }}>{items.length}</span>
              <div className="flex-grow-1 border-top mx-2" style={{ borderColor: "#f0f2f6" }} />
            </div>
            <div className="row g-2">
              {items.map((a) => (
                <div className="col-lg-4 col-md-6" key={a.id}>
                  <div className="pm-card h-100 d-flex flex-column" style={{ border: "1px solid var(--pm-border)", borderLeft: `4px solid ${tierColor[a.tier]}`, boxShadow: "none" }}>
                    <div className="d-flex align-items-start gap-2 mb-1">
                      <i className={`bi ${a.icon}`} style={{ color: tierColor[a.tier], fontSize: "1.05rem", marginTop: 2 }} />
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="fw-semibold" style={{ fontSize: "0.84rem", lineHeight: 1.3 }}>{a.title}</div>
                        <div className="pm-prod-meta mt-1" style={{ fontSize: "0.74rem" }}>{a.desc}</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-auto pt-2">
                      <span className="badge-soft ink pm-mono" style={{ fontSize: "0.68rem" }}>{a.stake}</span>
                      <span className="pm-prod-meta" style={{ fontSize: "0.68rem" }}><i className="bi bi-clock me-1" />{a.deadline}</span>
                      <span className="flex-grow-1" />
                      <button type="button" className="btn btn-sm btn-outline-secondary px-1" onClick={() => snoozeAttention(a.id, 24)} title="Snooze 24h" style={{ fontSize: "0.7rem" }}><i className="bi bi-clock-history" /></button>
                      <button type="button" className="btn btn-sm btn-outline-secondary px-1" onClick={() => dismissAttention(a.id)} title="Dismiss" style={{ fontSize: "0.7rem" }}><i className="bi bi-x" /></button>
                      <button type="button" className={`btn btn-sm ${a.tier === "urgent" ? "btn-danger" : a.tier === "important" ? "btn-warning" : "btn-success"}`} style={{ fontSize: "0.72rem" }} onClick={() => { dismissAttention(a.id); openModal(a.actionModal, a.actionPayload ?? {}); }}>{a.action}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {attention.length > 8 && !showAll && <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={() => setShowAll(true)}><i className="bi bi-arrow-down-circle me-1" /> Show all {attention.length} items</button>}
      {attention.length === 0 && (
        <div className="pm-card text-center py-5" style={{ background: "linear-gradient(180deg, #e7f8ef, #fff)" }}>
          <div style={{ fontSize: "2.6rem" }}>🎉</div>
          <h5 className="text-primary mt-2">All clear!</h5>
          <p className="pm-prod-meta mb-0">Nothing needs your attention right now.</p>
        </div>
      )}
    </>
  );
}

/* ==================================================================
   0.3 PERFORMANCE — period-selectable chart + cash allocation
================================================================== */
function Performance() {
  const { openModal } = useStore();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const lineRef = useRef<HTMLCanvasElement | null>(null);
  const doughRef = useRef<HTMLCanvasElement | null>(null);
  const charts = useRef<Chart[]>([]);

  useEffect(() => {
    const rev = period === "7d" ? REVENUE_30D.slice(-7) : period === "30d" ? REVENUE_30D : REVENUE_90D;
    const exp = period === "7d" ? EXPENSES_30D.slice(-7) : period === "30d" ? EXPENSES_30D : EXPENSES_90D;
    const labels = rev.map((_, i) => `${i + 1}`);
    charts.current.forEach((c) => c.destroy());
    charts.current = [];
    if (lineRef.current) {
      charts.current.push(new Chart(lineRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            { label: "Revenue", data: rev, borderColor: "#12b76a", backgroundColor: "rgba(18,183,106,0.10)", fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 4, borderWidth: 2.5 },
            { label: "Expenses", data: exp, borderColor: "#f79009", backgroundColor: "rgba(247,144,9,0.08)", fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 4, borderWidth: 2.5 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
          plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: KES ${Number(c.raw).toLocaleString()},000` } } },
          scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 8, color: "#98a2b3", font: { size: 10 } } }, y: { grid: { color: "#eef0f4" }, ticks: { color: "#98a2b3", font: { size: 10 }, callback: (v: string | number) => v + "K" } } },
        },
      }));
    }
    if (doughRef.current) {
      charts.current.push(new Chart(doughRef.current, {
        type: "doughnut",
        data: { labels: CASH_SPLIT.map((c) => c.label), datasets: [{ data: CASH_SPLIT.map((c) => c.value), backgroundColor: CASH_SPLIT.map((c) => c.color), borderWidth: 0, hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: "70%", plugins: { legend: { display: false } } },
      }));
    }
    return () => { charts.current.forEach((c) => c.destroy()); charts.current = []; };
  }, [period]);

  const revTotal = (period === "7d" ? REVENUE_30D.slice(-7) : period === "30d" ? REVENUE_30D : REVENUE_90D).reduce((a, b) => a + b, 0);
  const expTotal = (period === "7d" ? EXPENSES_30D.slice(-7) : period === "30d" ? EXPENSES_30D : EXPENSES_90D).reduce((a, b) => a + b, 0);
  const margin = Math.round(((revTotal - expTotal) / revTotal) * 100);

  return (
    <>
      <Section no="0.3" title="Performance" sub={`Last ${period} · revenue ${fmtK(revTotal)} vs expenses ${fmtK(expTotal)} · ${margin}% margin.`} actions={<button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("analytics")}>Full analytics →</button>} />
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="fw-bold" style={{ fontSize: "0.9rem" }}>Revenue vs Expenses</div>
              <div className="d-flex gap-1">
                {(["7d", "30d", "90d"] as const).map((p) => (
                  <button key={p} type="button" className={`pm-chip ${period === p ? "on" : ""}`} onClick={() => setPeriod(p)}>{p}</button>
                ))}
              </div>
            </div>
            <div style={{ height: 250 }}><canvas ref={lineRef} /></div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="pm-card h-100">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Where cash lives</div>
            <div style={{ height: 150, position: "relative" }}>
              <canvas ref={doughRef} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div className="text-center">
                  <div style={{ fontWeight: 800, fontFamily: "Sora", fontSize: "1.2rem" }}>KES 1.25M</div>
                  <div className="pm-prod-meta" style={{ fontSize: "0.64rem" }}>total liquidity</div>
                </div>
              </div>
            </div>
            {CASH_SPLIT.map((c) => (
              <div key={c.label} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid #f0f2f6" }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: c.color, display: "inline-block" }} />
                <span style={{ fontSize: "0.78rem" }} className="flex-grow-1">{c.label}</span>
                <span className="pm-prod-meta" style={{ fontSize: "0.72rem" }}>{Math.round((c.value / 1245) * 100)}%</span>
                <b style={{ fontSize: "0.78rem" }}>{fmtK(c.value)}K</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   0.4 BUSINESS HEALTH SCORE
================================================================== */
function HealthScore() {
  const { openModal } = useStore();
  const R = 70;
  const CIRC = Math.PI * R;
  const dash = (HEALTH_SCORE.overall / 100) * CIRC;
  const trend = [68, 70, 72, 71, 74, 76, 75, 78, 80, 82];
  return (
    <>
      <Section no="0.4" title="Business Health" sub="A composite of cash, receivables, inventory, compliance and growth — recomputed nightly." actions={<button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("healthDetail")}>Full breakdown →</button>} />
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="pm-card h-100 text-center" style={{ background: "linear-gradient(180deg, #e7f8ef, #fff)" }}>
            <div className="pm-kpi-label mb-1">Overall Score</div>
            <div style={{ position: "relative", width: 196, margin: "0 auto" }}>
              <svg width="196" height="106" viewBox="0 0 196 106">
                <path d={`M ${98 - R} 102 A ${R} ${R} 0 0 1 ${98 + R} 102`} fill="none" stroke="#eef0f4" strokeWidth="15" strokeLinecap="round" />
                <path d={`M ${98 - R} 102 A ${R} ${R} 0 0 1 ${98 + R} 102`} fill="none" stroke="url(#healthGrad2)" strokeWidth="15" strokeLinecap="round" strokeDasharray={`${dash} ${CIRC}`} style={{ transition: "stroke-dasharray 1.1s cubic-bezier(0.16,1,0.3,1)" }} />
                <defs><linearGradient id="healthGrad2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#12b76a" /><stop offset="100%" stopColor="#2e90fa" /></linearGradient></defs>
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 2 }}>
                <div style={{ fontSize: "1.9rem", fontWeight: 800, fontFamily: "Sora", lineHeight: 1, color: "#12b76a" }}>{HEALTH_SCORE.overall}</div>
                <div className="pm-prod-meta">of 100</div>
              </div>
            </div>
            <Badge tone="green" className="mt-1"><i className="bi bi-heart-pulse me-1" />Healthy</Badge>
            <div className="d-flex justify-content-center align-items-end gap-1 mt-2" style={{ height: 36 }}>
              <Spark data={trend} w={140} h={30} color="#12b76a" />
            </div>
            <div className="pm-prod-meta mt-1" style={{ fontSize: "0.7rem" }}>up from 68 a year ago — top 18% of Kenyan SMEs</div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="pm-card h-100">
            <div className="row g-2">
              {HEALTH_SCORE.factors.map((f) => (
                <div className="col-md-6" key={f.label}>
                  <div className="p-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 12, height: "100%" }}>
                    <div className="d-flex justify-content-between mb-1">
                      <b style={{ fontSize: "0.78rem" }}>{f.label}</b>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: f.color }}>{f.score}</span>
                    </div>
                    <div className="progress" style={{ height: 7 }}>
                      <div className="progress-bar" style={{ width: `${f.score}%`, background: f.color }} />
                    </div>
                    <div className="pm-prod-meta mt-1" style={{ fontSize: "0.7rem" }}><i className="bi bi-info-circle me-1" />{f.tip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   0.5 ACTIVITY + 0.6 MODULE STATUS (two-column)
================================================================== */
function ActivityAndModules() {
  const { activity, openModal, toast } = useStore();
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Get Paid", "Inventory", "Team", "Disputes", "Funding"];
  const filtered = filter === "All" ? activity : activity.filter((a) => a.module === filter);
  return (
    <>
      <Section no="0.5" title="Live Activity &amp; System Health" sub="What just happened — and whether every module is behaving." />
      <div className="row g-3">
        <div className="col-lg-7">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <b style={{ fontSize: "0.9rem" }}>Recent Activity</b>
              <button type="button" className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: "0.72rem" }} onClick={() => openModal("fullActivity")}>Full timeline →</button>
            </div>
            <div className="d-flex gap-1 flex-wrap mb-2">
              {filters.map((f) => <button key={f} type="button" className={`pm-chip ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>{f}</button>)}
            </div>
            {filtered.slice(0, 7).map((a, i) => (
              <div key={i} className="d-flex align-items-start gap-3 py-2" style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f0f2f6" : "none" }}>
                <span className="pm-kpi-icon" style={{ width: 32, height: 32, fontSize: "0.8rem", background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}><i className={`bi ${a.icon}`} /></span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 500 }}>{a.title}</div>
                  <div className="pm-prod-meta" style={{ fontSize: "0.7rem" }}>{a.by} · {a.time} · <b>{a.module}</b></div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="pm-prod-meta text-center py-3">No activity in this module yet today.</div>}
          </div>
        </div>
        <div className="col-lg-5">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <b style={{ fontSize: "0.9rem" }}>System Health</b>
              <span className="pm-prod-meta" style={{ fontSize: "0.7rem" }}>{MODULES.filter((m) => m.status === "Healthy").length}/{MODULES.length} healthy</span>
            </div>
            {MODULES.map((m) => (
              <div key={m.id} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid #f0f2f6", cursor: "pointer" }} onClick={() => toast(`Navigate to ${m.name}`, "info", m.name)}>
                <span className="pm-dot-live" style={{ background: m.status === "Healthy" ? "var(--pm-green)" : "var(--pm-warn)" }} />
                <i className={`bi ${m.icon}`} style={{ color: m.status === "Healthy" ? "var(--pm-green-dark)" : "var(--pm-warn)", width: 18 }} />
                <span className="flex-grow-1" style={{ fontSize: "0.78rem", fontWeight: 600 }}>{m.name}</span>
                <span className="pm-prod-meta d-none d-sm-block" style={{ fontSize: "0.7rem", maxWidth: 170, textAlign: "right" }}>{m.summary}</span>
                {m.badge && <Badge tone="amber">{m.badge}</Badge>}
              </div>
            ))}
            <button type="button" className="btn btn-outline-secondary btn-sm w-100 mt-2" onClick={() => openModal("moduleList")}><i className="bi bi-grid me-1" /> All modules</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   0.7 QUICK ACTIONS — toolbar strip
================================================================== */
function QuickActions() {
  const { openModal } = useStore();
  const actions = [
    { icon: "bi-plus-lg", label: "New Invoice", color: "#12b76a", modal: "quickInvoice" },
    { icon: "bi-cash-coin", label: "Record Payment", color: "#12b76a", modal: "recordPayment" },
    { icon: "bi-bag-plus", label: "New Order", color: "#2e90fa", modal: "quickOrder" },
    { icon: "bi-box-seam", label: "Add Product", color: "#7a5af8", modal: "addProduct" },
    { icon: "bi-truck", label: "Dispatch", color: "#f79009", modal: "dispatchOrder" },
    { icon: "bi-bell", label: "Reminders", color: "#f04438", modal: "bulkReminder" },
    { icon: "bi-download", label: "Export", color: "#667085", modal: "exportData" },
    { icon: "bi-megaphone", label: "Campaign", color: "#7a5af8", modal: "newCampaign" },
  ];
  return (
    <>
      <Section no="0.7" title="Quick Actions" sub="One tap to do the thing — every action posts to the ledger." />
      <div className="pm-card d-flex flex-wrap gap-2" style={{ padding: "0.75rem" }}>
        {actions.map((a) => (
          <button key={a.label} type="button" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1" style={{ borderRadius: 99, padding: "0.4rem 0.9rem" }} onClick={() => openModal(a.modal)}>
            <span style={{ color: a.color }}><i className={`bi ${a.icon}`} /></span> {a.label}
          </button>
        ))}
        <span className="flex-grow-1" />
        <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" style={{ borderRadius: 99, padding: "0.4rem 0.9rem" }} onClick={() => openModal("help")}>
          <i className="bi bi-question-circle" /> Help
        </button>
      </div>
    </>
  );
}

/* ==================================================================
   MODAL HOST — 24 functional modals
================================================================== */
function ModalHost() {
  const { modal, closeModal, toast, attention } = useStore();
  if (!modal) return null;
  const p = modal.payload;
  switch (modal.name) {
    case "kpiDetail":
      return (
        <Modal open onClose={closeModal} title={String(p.label ?? "Financial detail")} icon="bi-graph-up" size="lg">
          <div className="pm-card mb-3 text-center" style={{ background: "var(--pm-green-soft)", border: "none" }}>
            <div className="pm-kpi-label">Current value</div>
            <div className="pm-kpi-value">{fmtK(Number(p.value) || 0)}</div>
            <div className="pm-prod-meta">{String(p.sub)}</div>
          </div>
          <div className="d-flex justify-content-center mb-3"><Spark data={(p.spark as number[]) ?? []} w={320} h={60} /></div>
          <div className="d-flex justify-content-between pm-prod-meta">
            <span>Trend: <b>{String(p.trend)}</b></span><span>Source: PayMo ledger · real-time</span>
          </div>
          <div className="pm-note soft mt-2"><i className="bi bi-arrow-up-right me-1" />Open the full <b>{String(p.page)}</b> page for drill-down reports.</div>
        </Modal>
      );
    case "healthDetail":
      return (
        <Modal open onClose={closeModal} title="Business Health — detailed breakdown" icon="bi-speedometer2" size="lg">
          <div className="pm-kpi-value text-center mb-3" style={{ color: "var(--pm-green-dark)" }}>{HEALTH_SCORE.overall}/100</div>
          {HEALTH_SCORE.factors.map((f) => (
            <div key={f.label} className="mb-3">
              <div className="d-flex justify-content-between mb-1"><b style={{ fontSize: "0.82rem" }}>{f.label}</b><span className="pm-prod-meta">{f.score}/100</span></div>
              <div className="progress" style={{ height: 8 }}><div className="progress-bar" style={{ width: `${f.score}%`, background: f.color }} /></div>
              <div className="pm-prod-meta mt-1">{f.tip}</div>
            </div>
          ))}
          <div className="pm-note soft"><i className="bi bi-info-circle me-1" />Recomputed nightly from M-Pesa volume, receivables aging, reorder compliance, KYB status and YoY growth.</div>
        </Modal>
      );
    case "analytics":
      return (
        <Modal open onClose={closeModal} title="Full Analytics" icon="bi-graph-up-arrow" size="xl">
          <p className="pm-prod-meta mb-3">Every module has a full analytics page — all reading from the central ledger in real time.</p>
          <div className="row g-2">
            {["Get Paid", "Pay Suppliers", "Inventory & Stock", "Marketing & Growth", "Products & Store", "Funding & Credit"].map((m) => (
              <div className="col-md-6" key={m}>
                <button type="button" className="pm-theme-card w-100 text-start p-3" onClick={() => toast(`${m} analytics module — full charts and exports.`, "info", m)}>
                  <b style={{ fontSize: "0.88rem" }}>{m} Analytics</b>
                  <div className="pm-prod-meta">Revenue, margins, costs and cohort drill-downs.</div>
                </button>
              </div>
            ))}
          </div>
        </Modal>
      );
    case "allAttention":
      return (
        <Modal open onClose={closeModal} title="All Attention Items" icon="bi-list-check" size="lg">
          {attention.map((a) => (
            <div key={a.id} className="d-flex align-items-start gap-3 p-2 mb-2" style={{ border: `1px solid var(--pm-border)`, borderRadius: 10, borderLeft: `4px solid ${a.tier === "urgent" ? "var(--pm-danger)" : a.tier === "important" ? "var(--pm-warn)" : "var(--pm-green)"}` }}>
              <i className={`bi ${a.icon}`} style={{ color: a.tier === "urgent" ? "var(--pm-danger)" : a.tier === "important" ? "var(--pm-warn)" : "var(--pm-green)" }} />
              <div className="flex-grow-1"><b style={{ fontSize: "0.82rem" }}>{a.title}</b><div className="pm-prod-meta">{a.desc} · {a.deadline}</div></div>
              <span className="badge-soft ink pm-mono" style={{ fontSize: "0.68rem" }}>{a.stake}</span>
            </div>
          ))}
        </Modal>
      );
    case "fullActivity":
      return (
        <Modal open onClose={closeModal} title="Full Activity Timeline" icon="bi-clock-history" size="xl">
          {ACTIVITY_FEED.map((a, i) => (
            <div key={i} className="d-flex align-items-start gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
              <span className="pm-kpi-icon" style={{ width: 30, height: 30, fontSize: "0.8rem", background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}><i className={`bi ${a.icon}`} /></span>
              <div className="flex-grow-1"><b style={{ fontSize: "0.82rem" }}>{a.title}</b><div className="pm-prod-meta">{a.by} · {a.time} · {a.module}</div></div>
            </div>
          ))}
        </Modal>
      );
    case "moduleList":
      return (
        <Modal open onClose={closeModal} title="All Modules" icon="bi-grid" size="xl">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: "0.75rem" }}>
            {MODULES.map((m) => (
              <div key={m.id} className="pm-card h-100" onClick={() => toast(`Navigate to ${m.name}`, "info", m.name)} style={{ cursor: "pointer" }}>
                <i className={`bi ${m.icon}`} style={{ color: "var(--pm-green-dark)" }} /><b style={{ fontSize: "0.82rem" }} className="ms-1">{m.name}</b>
                <div className="pm-prod-meta mt-1">{m.summary}</div>
                <Badge tone={m.status === "Healthy" ? "green" : "amber"} className="mt-2">{m.status}</Badge>
              </div>
            ))}
          </div>
        </Modal>
      );
    case "quickInvoice":
      return (
        <Modal open onClose={closeModal} title="Quick Invoice" icon="bi-plus-circle">
          <div className="pm-note mb-3"><i className="bi bi-lightning-charge me-1 text-primary" />One-liner invoice — full wizard on Get Paid.</div>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Customer name</label><input className="form-control" placeholder="Walk-in customer" /></div>
            <div className="col-md-6"><label className="form-label">Amount (KES)</label><input type="number" className="form-control" placeholder="5000" /></div>
            <div className="col-md-6"><label className="form-label">Description</label><input className="form-control" placeholder="Safari Blend Coffee × 2" /></div>
            <div className="col-md-6"><label className="form-label">Payment</label><select className="form-select"><option>M-Pesa Till</option><option>Cash</option><option>Card</option><option>Credit (30 days)</option></select></div>
          </div>
          <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-primary" onClick={() => { toast("Invoice created and sent via WhatsApp ✓", "success"); closeModal(); }}>Create &amp; Send</button></div>
        </Modal>
      );
    case "recordPayment":
      return (
        <Modal open onClose={closeModal} title="Record Payment" icon="bi-cash-coin">
          <div className="pm-note mb-3"><i className="bi bi-check2-circle me-1 text-primary" />M-Pesa and card payments arrive automatically. Record cash and bank transfers here.</div>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Amount (KES)</label><input type="number" className="form-control" placeholder="25000" /></div>
            <div className="col-md-6"><label className="form-label">From</label><input className="form-control" placeholder="Customer / supplier" /></div>
            <div className="col-md-6"><label className="form-label">Method</label><select className="form-select"><option>Cash</option><option>Bank transfer</option><option>M-Pesa manual</option></select></div>
            <div className="col-md-6"><label className="form-label">Reference</label><input className="form-control" placeholder="Invoice or receipt ref" /></div>
          </div>
          <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-primary" onClick={() => { toast("Payment recorded and posted to ledger ✓", "success"); closeModal(); }}>Save Payment</button></div>
        </Modal>
      );
    case "quickOrder":
      return (
        <Modal open onClose={closeModal} title="New Order" icon="bi-bag-plus">
          <div className="pm-note mb-3"><i className="bi bi-bag-plus me-1 text-primary" />Order + payment in one flow — stock adjusts automatically.</div>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Customer</label><input className="form-control" placeholder="Walk-in" /></div>
            <div className="col-md-6"><label className="form-label">Channel</label><select className="form-select"><option>In Person</option><option>WhatsApp</option><option>Instagram</option></select></div>
            <div className="col-12"><label className="form-label">Products</label><input className="form-control" placeholder="Scan barcode or search…" /></div>
            <div className="col-md-6"><label className="form-label">Payment</label><select className="form-select"><option>M-Pesa Till</option><option>Cash</option><option>Card</option></select></div>
          </div>
          <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-primary" onClick={() => { toast("Order created — stock adjusted, invoice issued ✓", "success"); closeModal(); }}>Create Order</button></div>
        </Modal>
      );
    case "addProduct":
      return (
        <Modal open onClose={closeModal} title="Add Product" icon="bi-box-seam">
          <div className="pm-note mb-3"><i className="bi bi-box-seam me-1 text-primary" />Quick add — full product wizard on Products &amp; Store.</div>
          <div className="row g-3">
            <div className="col-md-8"><label className="form-label">Name</label><input className="form-control" placeholder="New product" /></div>
            <div className="col-md-4"><label className="form-label">Emoji</label><input className="form-control text-center" style={{ fontSize: "1.2rem" }} defaultValue="📦" /></div>
            <div className="col-md-4"><label className="form-label">Price (KES)</label><input type="number" className="form-control" placeholder="1500" /></div>
            <div className="col-md-4"><label className="form-label">Cost (KES)</label><input type="number" className="form-control" placeholder="800" /></div>
            <div className="col-md-4"><label className="form-label">Stock</label><input type="number" className="form-control" placeholder="50" /></div>
          </div>
          <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-primary" onClick={() => { toast("Product created and listed on store ✓", "success"); closeModal(); }}>Save Product</button></div>
        </Modal>
      );
    case "dispatchOrder":
      return (
        <Modal open onClose={closeModal} title="Dispatch Order" icon="bi-truck">
          <div className="pm-note mb-3"><i className="bi bi-truck me-1 text-primary" />Sendy one-click dispatch from the order list.</div>
          <div className="row g-3">
            <div className="col-12"><label className="form-label">Order ID</label><select className="form-select"><option>ORD-1103 · Grace Wanjiru</option><option>ORD-1102 · Brian Otieno</option><option>ORD-1101 · Amina Hassan</option></select></div>
            <div className="col-md-6"><label className="form-label">Delivery zone</label><select className="form-select"><option>Nairobi — same day</option><option>Rest of Kenya</option></select></div>
          </div>
          <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-primary" onClick={() => { toast("Sendy dispatch created — tracking sent to customer ✓", "success"); closeModal(); }}>Dispatch via Sendy</button></div>
        </Modal>
      );
    case "bulkReminder":
      return (
        <Modal open onClose={closeModal} title="Send Bulk Reminders" icon="bi-bell">
          <div className="pm-note mb-3"><i className="bi bi-bell me-1 text-primary" />Remind overdue customers via WhatsApp / SMS. Responses flow into your Social Inbox.</div>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Target</label><select className="form-select"><option>12 overdue invoices</option><option>Invoices 15–30 days late</option><option>Invoices 30+ days late</option></select></div>
            <div className="col-md-6"><label className="form-label">Channel</label><select className="form-select"><option>WhatsApp + SMS</option><option>WhatsApp only</option><option>SMS only</option></select></div>
          </div>
          <div className="pm-wa-preview mt-3"><div className="pm-wa-head"><i className="bi bi-whatsapp" /> Preview</div><div className="pm-wa-bubble">Hi {"{name}"}! Friendly reminder — invoice {`{id}`} for KES {"{amount}"} is due. Pay via M-Pesa Paybill 247247. Asante!</div></div>
          <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-primary" onClick={() => { toast("12 reminders sent ✓", "success"); closeModal(); }}>Send All</button></div>
        </Modal>
      );
    case "exportData":
      return (
        <Modal open onClose={closeModal} title="Export Data" icon="bi-download">
          <div className="pm-note mb-3"><i className="bi bi-download me-1 text-primary" />Quick CSV export for accountants, auditors or your own records.</div>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">What to export</label><select className="form-select"><option>All transactions</option><option>Products &amp; inventory</option><option>Customers</option><option>Invoices</option><option>Accounting entries</option></select></div>
            <div className="col-md-6"><label className="form-label">Format</label><select className="form-select"><option>CSV</option><option>Excel</option><option>PDF</option></select></div>
            <div className="col-md-6"><label className="form-label">Date range</label><select className="form-select"><option>This month</option><option>Last 3 months</option><option>Year to date</option></select></div>
          </div>
          <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-primary" onClick={() => { toast("Export downloaded ✓", "success"); closeModal(); }}>Download</button></div>
        </Modal>
      );
    case "newCampaign":
      return (
        <Modal open onClose={closeModal} title="New Campaign" icon="bi-megaphone">
          <div className="pm-note mb-3"><i className="bi bi-megaphone me-1 text-primary" />Quick campaign — full wizard on Marketing &amp; Growth.</div>
          <div className="row g-3">
            <div className="col-12"><label className="form-label">Campaign name</label><input className="form-control" placeholder="End of month clearance" /></div>
            <div className="col-md-6"><label className="form-label">Channel</label><select className="form-select"><option>WhatsApp</option><option>SMS</option><option>Email</option><option>Multi-channel</option></select></div>
            <div className="col-md-6"><label className="form-label">Audience</label><select className="form-select"><option>All customers (4,820)</option><option>Loyalty members (1,284)</option><option>VIP only (47)</option></select></div>
          </div>
          <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-primary" onClick={() => { toast("Campaign queued ✓", "success"); closeModal(); }}>Create Campaign</button></div>
        </Modal>
      );
    case "sendReminder":
      return (
        <Modal open onClose={closeModal} title="Send Reminder" icon="bi-bell">
          <div className="pm-note mb-3" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}><i className="bi bi-exclamation-triangle me-1" style={{ color: "var(--pm-danger)" }} />Customer: {String(p.customer ?? "—")} · KES 150,000 overdue 45 days.</div>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Channel</label><select className="form-select"><option>WhatsApp</option><option>SMS</option><option>Email</option></select></div>
            <div className="col-md-6"><label className="form-label">Template</label><select className="form-select"><option>Friendly reminder</option><option>Formal demand</option><option>Final notice</option></select></div>
          </div>
          <div className="pm-wa-preview mt-3"><div className="pm-wa-head"><i className="bi bi-whatsapp" /> Preview</div><div className="pm-wa-bubble">Habari {String(p.customer ?? "").split(" ")[0]}! Your invoice INV-0089 is 45 days overdue. Please settle KES 150,000 via M-Pesa Paybill 247247. Asante sana!</div></div>
          <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-primary" onClick={() => { toast("Reminder sent ✓", "success"); closeModal(); }}>Send</button></div>
        </Modal>
      );
    case "topUpAccount":
      return (
        <Modal open onClose={closeModal} title="Top Up Account" icon="bi-cash-coin">
          <div className="pm-note mb-3"><i className="bi bi-cash-coin me-1 text-primary" />Cover the payroll gap + safety buffer today.</div>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Amount (KES)</label><input type="number" className="form-control" defaultValue={500000} /></div>
            <div className="col-md-6"><label className="form-label">Source</label><select className="form-select"><option>M-Pesa Paybill</option><option>Bank transfer (NCBA)</option><option>Draw from credit line</option></select></div>
          </div>
          <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-primary" onClick={() => { toast("Top-up initiated — confirm on your phone ✓", "success"); closeModal(); }}>Initiate Top-Up</button></div>
        </Modal>
      );
    case "fileVat":
      return (
        <Modal open onClose={closeModal} title="File VAT Return" icon="bi-receipt-cutoff">
          <div className="pm-note mb-3" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}><i className="bi bi-exclamation-triangle me-1" style={{ color: "var(--pm-danger)" }} />VAT due 20 January — late filing incurs a KES 20,000 penalty.</div>
          <div className="row g-3">
            <div className="col-md-6"><div className="pm-card py-2 px-3" style={{ background: "#fafbfd" }}><div className="pm-kpi-label">Output VAT</div><b>KES 96,400</b></div></div>
            <div className="col-md-6"><div className="pm-card py-2 px-3" style={{ background: "#fafbfd" }}><div className="pm-kpi-label">Input VAT (reclaimable)</div><b>KES 42,200</b></div></div>
            <div className="col-12"><div className="pm-card py-2 px-3" style={{ background: "#fafbfd" }}><div className="pm-kpi-label">Net payable to KRA</div><b className="text-danger">KES 54,200</b></div></div>
          </div>
          <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-primary" onClick={() => { toast("VAT return filed via iTax ✓", "success"); closeModal(); }}>File via iTax</button></div>
        </Modal>
      );
    case "paySupplier":
      return (
        <Modal open onClose={closeModal} title="Schedule Supplier Payments" icon="bi-truck">
          <div className="pm-note mb-3"><i className="bi bi-truck me-1 text-primary" />3 supplier bills due this week — KES 157,000 total.</div>
          {[["Kirinyaga Farmers Co-op", "KES 48,000", "Due in 2 days"], ["Kitui Weavers Sacco", "KES 67,000", "Due in 5 days"], ["Embu Nuts Ltd", "KES 42,000", "Due in 7 days"]].map(([n, amt, due]) => (
            <div key={n} className="d-flex align-items-center gap-2 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
              <div className="flex-grow-1"><b style={{ fontSize: "0.82rem" }}>{n}</b><div className="pm-prod-meta">{due}</div></div>
              <b>{amt}</b>
              <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" defaultChecked /></div>
            </div>
          ))}
          <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-primary" onClick={() => { toast("3 payments scheduled for their due dates ✓", "success"); closeModal(); }}>Schedule All</button></div>
        </Modal>
      );
    case "viewDetails":
      return (
        <Modal open onClose={closeModal} title="Weekly Collection Details" icon="bi-graph-up-arrow">
          <div className="pm-card mb-2" style={{ background: "var(--pm-green-soft)", border: "none", textAlign: "center" }}><div className="pm-kpi-value">+15%</div><div className="pm-prod-meta">KES 385K this week vs. KES 335K last week</div></div>
          <p className="pm-prod-meta mb-0">Peak hour: <b>Friday 17:00</b>. Best channel: <b>M-Pesa Paybill (68% of volume)</b>. Consider a Friday flash sale to compound the trend.</p>
        </Modal>
      );
    case "viewScore":
      return (
        <Modal open onClose={closeModal} title="Credit Score Details" icon="bi-speedometer2">
          <div className="pm-card text-center mb-3" style={{ background: "var(--pm-green-soft)", border: "none" }}>
            <div className="pm-kpi-label">Score</div><div className="pm-kpi-value">742</div>
            <Badge tone="green">Excellent</Badge>
            <div className="pm-prod-meta mt-1">Top 8% of Kenyan SMEs · unlocked KES 5M/day lending limits</div>
          </div>
          <div className="pm-prod-meta">+12 pts this month — driven by on-time M-Pesa autopay and lower credit utilisation.</div>
        </Modal>
      );
    case "approvePO":
      return (
        <Modal open onClose={closeModal} title="Approve Purchase Order" icon="bi-cart-check">
          <div className="pm-note mb-3"><i className="bi bi-cart-check me-1 text-primary" />Auto-PO drafted for Ankole Crafts Co-op — 20 units × KES 1,450 = KES 29,000.</div>
          <div className="row g-3">
            <div className="col-12"><label className="form-label">Product</label><input className="form-control" value="Ankole Cow-Horn Mug × 20" readOnly /></div>
            <div className="col-6"><label className="form-label">Supplier</label><input className="form-control" value="Ankole Crafts Co-op" readOnly /></div>
            <div className="col-6"><label className="form-label">Total</label><input className="form-control" value="KES 29,000" readOnly /></div>
          </div>
          <div className="d-flex justify-content-end mt-3"><button type="button" className="btn btn-primary" onClick={() => { toast("PO approved and sent to supplier ✓", "success"); closeModal(); }}>Approve &amp; Send</button></div>
        </Modal>
      );
    case "help":
      return (
        <Modal open onClose={closeModal} title="Help — Dashboard" icon="bi-question-circle">
          <p style={{ fontSize: "0.88rem" }}>This is your decision engine. Every card is tappable and jumps to its module. Keyboard: <span className="pm-kbd">Esc</span> close · <span className="pm-kbd">/</span> search. Attention items resolve right here without leaving the page.</p>
        </Modal>
      );
    default:
      return null;
  }
}

/* ==================================================================
   PAGE
================================================================== */
function PageContent() {
  const { modal, closeModal } = useStore();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeModal(); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, closeModal]);
  return (
    <div className="pm-content">
      <PageHeader />
      <FinancialPulse />
      <AttentionHub />
      <Performance />
      <HealthScore />
      <ActivityAndModules />
      <QuickActions />
      <footer className="pm-footer mt-4 rounded-3 d-flex flex-wrap align-items-center gap-3" style={{ boxShadow: "var(--pm-shadow)" }}>
        <div className="flex-grow-1"><div className="fw-bold" style={{ fontSize: "0.84rem" }}>PayMo Business — Dashboard Overview</div><div className="pm-prod-meta">The decision engine · Kenya-first · M-Pesa · eTIMS · KRA compliant</div></div>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge-soft green"><i className="bi bi-shield-check me-1" />Score 82</span>
          <span className="badge-soft blue"><i className="bi bi-cash-stack me-1" />KES 3.45M</span>
          <span className="badge-soft amber"><i className="bi bi-exclamation-triangle me-1" />5 alerts</span>
          <span className="badge-soft violet"><i className="bi bi-activity me-1" />12 modules</span>
        </div>
      </footer>
      <ModalHost />
    </div>
  );
}

export default function AppDashboard({ onNavigate }: { onNavigate?: (p: NavPage) => void }) {
  return (
    <StoreProvider>
      <Shell onNavigate={onNavigate} currentPage="dashboard" />
    </StoreProvider>
  );
}

function Shell({ onNavigate, currentPage }: { onNavigate?: (p: NavPage, anchor?: string) => void; currentPage?: NavPage }) {
  const { business, setBusiness, notifications, markNotifsRead, dismissNotif, toast } = useStore();
  const [sideOpen, setSideOpen] = useState(false);
  const [bizSwitch, setBizSwitch] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [search, setSearch] = useState("");

  const unread = notifications.filter((n) => !n.unread).length;

  const getNavigationWithActiveState = (): NavZone => {
    return Object.fromEntries(
      Object.entries(NAVIGATION).map(([zone, items]) => [
        zone,
        items.map((item) => ({
          ...item,
          active: item.id === currentPage,
        })),
      ])
    );
  };

  const navigation = getNavigationWithActiveState();

  const getIconComponent = (iconName: string) => {
    const IconComp = ICON_MAP[iconName];
    return IconComp ? <IconComp size={16} /> : null;
  };

  return (
    <div className="pm-shell">
      {/* ══════════ SIDEBAR ══════════ */}
      {sideOpen && <div className="pm-side-backdrop" onClick={() => setSideOpen(false)} />}
      <aside className={cls("pm-side", sideOpen && "pm-side-open")}>
        <div className="pm-brand">
          <span className="pm-logo">P</span>
          <div>
            <div className="pm-brand-name">PayMo<span>Business</span></div>
            <div className="pm-brand-zone">Dashboard · Overview</div>
          </div>
          <button className="pm-side-x" onClick={() => setSideOpen(false)}><X size={18} /></button>
        </div>

        <button className="pm-biz-switch" onClick={() => setBizSwitch(true)}>
          <span className="pm-biz-avatar">{business[0]}</span>
          <span className="flex-grow-1 text-start">
            <b>{business}</b>
            <span className="d-block pm-fs-11 pm-muted">Operating · Retail</span>
          </span>
          <ChevronDown size={14} />
        </button>

        <nav className="pm-nav">
          {Object.entries(navigation).map(([zone, items]) => (
            <div className="pm-nav-zone" key={zone}>
              <div className="pm-nav-zone-label" style={{ color: ZONES[zone] }}>{zone}</div>
              {items.map((it) => (
                <button
                  key={it.id}
                  className={cls("pm-nav-item", it.active && "pm-nav-active")}
                  onClick={() => {
                    setSideOpen(false);
                    if (it.id === "dashboard") onNavigate?.("dashboard");
                    else if (it.id === "paysuppliers") onNavigate?.("paysuppliers");
                    else if (it.id === "payroll") onNavigate?.("paysuppliers", "sec-payroll");
                    else if (it.id === "cash") onNavigate?.("cash");
                    else if (it.id === "books") onNavigate?.("books");
                    else if (it.id === "customers") onNavigate?.("crm");
                    else if (it.id === "getpaid") onNavigate?.("getpaid");
                    else if (it.id === "productstore") onNavigate?.("productstore");
                    else if (it.id === "inventory") onNavigate?.("inventory");
                    else if (it.id === "marketing") onNavigate?.("marketing");
                    else if (it.id === "integrations") onNavigate?.("integrations");
                    else if (it.id === "portfolio") onNavigate?.("portfolio");
                    else if (it.id === "profile") onNavigate?.("profile");
                    else if (it.id === "team") onNavigate?.("team");
                    else if (it.id === "disputes") onNavigate?.("disputes");
                    else if (it.id === "notifications") onNavigate?.("notifications");
                    else if (it.id === "data") onNavigate?.("data");
                    else if (it.id === "funding") onNavigate?.("funding");
                    else if (it.id === "insurance") onNavigate?.("insurance");
                    else toast(`${it.label} coming soon`, "info");
                  }}
                >
                  <span className="pm-nav-ic">{getIconComponent(it.iconName)}</span>
                  {it.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="pm-side-foot">
          <div className="pm-upgrade">
            <Sparkles size={14} /> <span>PayMo Pro — 14 days left in trial</span>
          </div>
          <button className="pm-nav-item" onClick={() => toast("Help centre coming soon", "info")}>
            <span className="pm-nav-ic"><Zap size={16} /></span> Help & Support
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <div className="pm-main">
        {/* topbar */}
        <header className="pm-topbar">
          <button className="pm-burger" onClick={() => setSideOpen(true)}><Menu size={19} /></button>
          <div className="pm-crumb">
            <span className="pm-muted">PayMo Business /</span> <b>Dashboard</b>
          </div>
          <div className="pm-top-search">
            <Search size={15} />
            <input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <div className="pm-bell-wrap">
              <button className="pm-bell" onClick={() => { setBellOpen(!bellOpen); setUserMenu(false); }}>
                <Bell size={18} />
                {unread > 0 && <span className="pm-bell-badge">{unread}</span>}
              </button>
              {bellOpen && (
                <>
                  <div className="pm-pop-backdrop" onClick={() => setBellOpen(false)} />
                  <div className="pm-pop pm-notif-pop">
                    <div className="pm-pop-head">
                      <b>Notifications</b>
                      <button className="pm-link-btn pm-fs-12" onClick={() => { markNotifsRead(); toast("All notifications marked as read", "info"); }}>Mark all read</button>
                    </div>
                    {notifications.map((n) => (
                      <button key={n.id} className="pm-notif-row" onClick={() => { dismissNotif(n.id); setBellOpen(false); }}>
                        <span className={`pm-notif-dot pm-notif-dot-${n.unread ? "info" : "muted"}`} />
                        <span className="flex-grow-1 text-start">
                          <b className="pm-fs-13">{n.text}</b>
                          <span className="pm-fs-11 pm-muted">{n.time}</span>
                        </span>
                      </button>
                    ))}
                    <div className="pm-pop-foot">Showing {notifications.length} · eTIMS auto-filing ON</div>
                  </div>
                </>
              )}
            </div>
            <div className="pm-user-wrap">
              <button className="pm-user" onClick={() => { setUserMenu(!userMenu); setBellOpen(false); }}>
                <Avatar name="Wanjiru K." size={34} />
                <span className="d-none d-md-block text-start">
                  <b className="pm-fs-13 d-block">Wanjiru K.</b>
                  <span className="pm-fs-11 pm-muted">Owner · {business}</span>
                </span>
                <ChevronDown size={13} className="pm-muted" />
              </button>
              {userMenu && (
                <>
                  <div className="pm-pop-backdrop" onClick={() => setUserMenu(false)} />
                  <div className="pm-pop pm-menu-pop">
                    <button className="pm-dd-row" onClick={() => { setUserMenu(false); toast("Profile coming soon", "info"); }}><User size={14} /> My profile</button>
                    <button className="pm-dd-row" onClick={() => { setUserMenu(false); toast("Settings coming soon", "info"); }}><Settings size={14} /> Settings & Security</button>
                    <button className="pm-dd-row" onClick={() => { setUserMenu(false); setBizSwitch(true); }}><Building2 size={14} /> Switch business</button>
                    <div className="pm-dd-sep" />
                    <button className="pm-dd-row pm-dd-danger" onClick={() => { setUserMenu(false); toast("Signed out (demo)", "info"); }}><LogOut size={14} /> Sign out</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* content */}
        <PageContent />
      </div>

      {/* ══════════ Business Switcher ══════════ */}
      {bizSwitch && (
        <>
          <div className="pm-pop-backdrop" onClick={() => setBizSwitch(false)} />
          <div className="pm-pop pm-biz-pop">
            <div className="pm-pop-head">
              <b>Switch Business</b>
              <button className="pm-link-btn pm-fs-12" onClick={() => setBizSwitch(false)}>Cancel</button>
            </div>
            <div className="pm-biz-list">
              {BUSINESSES.map((b) => (
                <button
                  key={b.name}
                  className={cls("pm-biz-row", business === b.name && "pm-biz-row-active")}
                  onClick={() => {
                    setBusiness(b.name);
                    setBizSwitch(false);
                    toast(`Switched to ${b.name}`, "success");
                  }}
                >
                  <span className="pm-biz-avatar">{b.emoji}</span>
                  <span className="flex-grow-1 text-start">
                    <b className="pm-fs-13">{b.name}</b>
                    <span className="pm-muted pm-fs-11 d-block">{b.type}</span>
                  </span>
                  <span className="pm-fs-12 pm-muted">{fmtK(b.cash)}K</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      <ToastHost />
    </div>
  );
}
