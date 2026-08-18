import { useEffect, useRef, useState } from "react";
import {
  ArcElement, BarController, BarElement, CategoryScale, Chart, DoughnutController, Filler,
  Legend, LinearScale, LineController, LineElement, PointElement, Tooltip,
} from "chart.js";
import {
  ATTRIBUTION, CHANNEL_ROAS, CHANNELS, FUNNEL, IDEAS, LOYALTY, NPS, NEW_CUSTOMERS,
  REFERRAL, SPEND_REV, fmtK, fmtKES,
} from "./data";
import { useStore } from "./store";
import { Badge, EmptyState, Kpi, Section, Spark, StatusBadge } from "./ui";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, BarController, BarElement, ArcElement, DoughnutController, Tooltip, Legend, Filler);

/* ==================================================================
   PAGE HEADER
================================================================== */
export function PageHeader() {
  const { openModal } = useStore();
  return (
    <div className="pm-banner-hero p-4 d-flex flex-wrap align-items-center gap-3">
      <div className="flex-grow-1" style={{ minWidth: 280 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="pm-zone" style={{ background: "linear-gradient(90deg, #7a5af8, #5b3ee0)" }}><i className="bi bi-megaphone" /> GROW</span>
          <span className="badge-soft green">Page 12 · 7 sections</span>
        </div>
        <h1 className="mb-1" style={{ fontSize: "1.6rem", fontWeight: 800 }}>Marketing &amp; Growth</h1>
        <p className="mb-0" style={{ color: "#b9c7d8", fontSize: "0.86rem", maxWidth: 640 }}>
          More customers, cheaper. Campaigns, WhatsApp, social, loyalty and experiments —
          all measured against revenue, because likes don't pay rent.
        </p>
      </div>
      <div className="d-flex flex-column gap-2 align-items-lg-end">
        <div className="d-flex align-items-center gap-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14 }}>
          <div className="text-center">
            <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "Sora", color: "#7ee2b0" }}>21.4×</div>
            <div style={{ fontSize: "0.62rem", color: "#b9c7d8", letterSpacing: "0.08em" }}>CAMPAIGN ROI</div>
          </div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.18)" }} />
          <div>
            <div className="fw-bold" style={{ fontSize: "0.86rem" }}>KES 214,500 from KES 10,000</div>
            <div className="pm-prod-meta" style={{ color: "#b9c7d8" }}>this month · auto-optimized mix</div>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("campaignWizard")}><i className="bi bi-megaphone me-1" /> New Campaign</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("socialComposer")}><i className="bi bi-instagram me-1" /> Compose Post</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("roiCalc")}><i className="bi bi-calculator me-1" /> ROI Calculator</button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   12.1 MARKETING COMMAND CENTER
================================================================== */
export function MarketingCommandCenter() {
  const { campaigns, openModal, budget } = useStore();
  const lineRef = useRef<HTMLCanvasElement | null>(null);
  const doughRef = useRef<HTMLCanvasElement | null>(null);
  const charts = useRef<Chart[]>([]);

  const active = campaigns.filter((c) => c.status === "Active");
  const monthRevenue = campaigns.reduce((a, b) => a + b.revenue, 0);
  const monthSpend = campaigns.reduce((a, b) => a + b.cost, 0);
  const best = CHANNEL_ROAS[0];

  useEffect(() => {
    const mk = (el: HTMLCanvasElement | null, cfg: Record<string, unknown>) => { if (el) charts.current.push(new Chart(el, cfg as never)); };
    mk(lineRef.current, {
      type: "line",
      data: {
        labels: SPEND_REV.months,
        datasets: [
          { label: "Revenue (K)", data: SPEND_REV.revenue, borderColor: "#12b76a", backgroundColor: "rgba(18,183,106,0.10)", fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2.5 },
          { label: "Spend (K)", data: SPEND_REV.spend, borderColor: "#7a5af8", backgroundColor: "rgba(122,90,248,0.08)", fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2.5 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#98a2b3", font: { size: 10 } } },
          y: { grid: { color: "#eef0f4" }, ticks: { color: "#98a2b3", font: { size: 10 }, callback: (v: string | number) => v + "K" } },
        },
      },
    });
    mk(doughRef.current, {
      type: "doughnut",
      data: {
        labels: ATTRIBUTION.map((a) => a.label),
        datasets: [{ data: ATTRIBUTION.map((a) => a.v), backgroundColor: ATTRIBUTION.map((a) => a.color), borderWidth: 0, hoverOffset: 6 }],
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: "66%", plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } } },
    });
    return () => { charts.current.forEach((c) => c.destroy()); charts.current = []; };
  }, []);

  const spendPct = Math.round((budget.spent / budget.monthly) * 100);

  return (
    <>
      <Section no="12.1" title="Marketing Command Center"
        sub="Spend vs revenue, channel performance and what's live right now."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("budget")}>
              <i className="bi bi-wallet2 me-1" /> Budget {fmtK(budget.spent)}/{fmtK(budget.monthly)}
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("exportAnalytics")}>
              <i className="bi bi-download me-1" /> Export
            </button>
          </>
        }
      />
      <div className="pm-stat-grid">
        <Kpi icon="bi-cash-stack" iconBg="var(--pm-green-soft)" label="Campaign revenue · 30d" value={fmtKES(monthRevenue)} delta="+32.6%" spark={SPEND_REV.revenue} footer={`from ${fmtKES(monthSpend)} spend`} />
        <Kpi icon="bi-graph-up-arrow" iconBg="#f0ebfe" label="Blended ROI" value="21.4×" delta="+4.1×" spark={[12.4, 14.1, 13.2, 16.8, 18.2, 19.4, 21.4]} sparkColor="#7a5af8" footer="best channel: WhatsApp 21.4×" />
        <Kpi icon="bi-person-plus" iconBg="#e8f1fe" label="New customers · 30d" value="44" delta="+28.4%" spark={NEW_CUSTOMERS} sparkColor="#2e90fa" footer="CAC KES 178 · down 23%" />
        <Kpi icon="bi-chat-square-heart" iconBg="#fef0c7" label="NPS score" value={String(NPS.score)} delta="+0.4 pts" spark={NPS.trend.map((v) => v * 10)} sparkColor="#f79009" footer={`${NPS.responses} responses this quarter`} />
      </div>
      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <div className="pm-card h-100">
            <div className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Marketing spend vs revenue — 7 months</div>
            <div className="pm-prod-meta mb-2">Spend stays flat while revenue compounds — the growth loop working.</div>
            <div style={{ height: 215 }}><canvas ref={lineRef} /></div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="pm-card h-100">
            <div className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Channel ROAS</div>
            <div className="pm-prod-meta mb-2">Revenue returned per shilling spent, last 30 days.</div>
            {CHANNEL_ROAS.map((c) => (
              <div key={c.channel} className="d-flex align-items-center gap-2 py-1">
                <span style={{ fontSize: "0.8rem", width: 86 }} className="fw-semibold">{c.channel}</span>
                <div className="progress flex-grow-1" style={{ height: 9 }}>
                  <div className="progress-bar" style={{ width: `${(c.roas / best.roas) * 100}%`, background: c.channel === "WhatsApp" ? "var(--pm-green)" : c.channel === "Instagram" ? "var(--pm-violet)" : "#98a2b3" }} />
                </div>
                <b style={{ fontSize: "0.8rem", width: 46, textAlign: "right" }}>{c.roas}×</b>
              </div>
            ))}
            <div className="pm-note soft mt-3"><i className="bi bi-lightbulb me-1" />Email is under-used — moving KES 1,000 there projects +KES 4,100 revenue.</div>
          </div>
        </div>
      </div>
      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <div className="pm-card h-100">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Live campaigns</div>
            {active.map((c) => (
              <div key={c.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)", cursor: "pointer" }} onClick={() => openModal("campaignDrawer", { id: c.id })}>
                <span style={{ fontSize: "1.1rem" }}>{c.emoji}</span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="fw-semibold text-truncate" style={{ fontSize: "0.82rem" }}>{c.name}</div>
                  <div className="pm-prod-meta">{c.channel} · {c.audience}</div>
                </div>
                <Badge tone="green">{c.conversions} orders</Badge>
                <b style={{ fontSize: "0.8rem" }}>{fmtKES(c.revenue)}</b>
              </div>
            ))}
            {active.length === 0 && <EmptyState icon="bi-megaphone" title="No live campaigns" />}
            <div className="mt-2"><span className="badge-soft blue" style={{ cursor: "pointer" }} onClick={() => openModal("campaignDrawer", { id: "CMP-024" })}>View all →</span></div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <b style={{ fontSize: "0.9rem" }}>Budget burn</b>
              <Badge tone={spendPct > 90 ? "red" : spendPct > 70 ? "amber" : "green"}>{spendPct}%</Badge>
            </div>
            <div className="progress mb-2" style={{ height: 10 }}>
              <div className="progress-bar" style={{ width: `${spendPct}%` }} />
            </div>
            <div className="pm-prod-meta mb-3">{fmtKES(budget.spent)} of {fmtKES(budget.monthly)} · {fmtKES(budget.monthly - budget.spent)} left · auto-optimize {budget.autoOptimize ? "ON" : "OFF"}</div>
            <div className="pm-kpi-label mb-2">Traffic attribution</div>
            <div style={{ height: 150 }}><canvas ref={doughRef} /></div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   12.2 CAMPAIGNS & CAMPAIGN BUILDER
================================================================== */
export function CampaignsSection() {
  const { campaigns, openModal, searchQuery } = useStore();
  const [tab, setTab] = useState<"All" | "Active" | "Scheduled" | "Draft" | "Ended" | "Paused">("All");
  const q = searchQuery.trim().toLowerCase();
  const filtered = campaigns.filter((c) => (tab === "All" || c.status === tab) && (!q || (c.id + c.name + c.channel).toLowerCase().includes(q)));
  const counts = (s: string) => campaigns.filter((c) => (s === "All" ? true : c.status === s)).length;
  return (
    <>
      <Section no="12.2" title="Campaigns &amp; Campaign Builder"
        sub="Every campaign across WhatsApp, SMS, email and social — with live ROI per shilling spent."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("templates")}>
              <i className="bi bi-collection me-1" /> Templates
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("campaignWizard")}>
              <i className="bi bi-megaphone me-1" /> New Campaign
            </button>
          </>
        }
      />
      <div className="pm-card">
        <ul className="nav nav-tabs border-0 mb-2">
          {(["All", "Active", "Scheduled", "Draft", "Ended", "Paused"] as const).map((t) => (
            <li className="nav-item" key={t}>
              <button type="button" className={`nav-link ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t} <span className={`badge ${tab === t ? "text-bg-dark" : "bg-light text-secondary border"}`}>{counts(t)}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead><tr><th>Campaign</th><th>Channels</th><th>Audience</th><th className="text-end">Sent</th><th className="text-end">Open %</th><th className="text-end">Orders</th><th className="text-end">Revenue</th><th className="text-end">Spend</th><th className="text-end">ROI</th><th>Status</th><th style={{ width: 40 }}></th></tr></thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="row-select" onClick={() => openModal("campaignDrawer", { id: c.id })}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: "1.1rem" }}>{c.emoji}</span>
                      <div style={{ minWidth: 0 }}>
                        <div className="pm-prod-name text-truncate" style={{ maxWidth: 210 }}>{c.name}</div>
                        <div className="pm-prod-meta pm-mono">{c.id} · {c.date}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="pm-prod-meta">{c.channel}</span></td>
                  <td className="pm-prod-meta">{c.audienceCount.toLocaleString()}</td>
                  <td className="text-end pm-prod-meta">{c.sent.toLocaleString()}</td>
                  <td className="text-end">{c.sent ? Math.round((c.opened / c.sent) * 100) + "%" : "—"}</td>
                  <td className="text-end fw-bold">{c.conversions}</td>
                  <td className="text-end fw-bold" style={{ fontSize: "0.82rem" }}>{c.revenue ? fmtKES(c.revenue) : "—"}</td>
                  <td className="text-end pm-prod-meta">{c.cost ? fmtKES(c.cost) : "—"}</td>
                  <td className="text-end">
                    {c.cost > 0 ? <Badge tone={(c.revenue / c.cost) > 10 ? "green" : (c.revenue / c.cost) > 3 ? "amber" : "slate"}>{(c.revenue / c.cost).toFixed(1)}×</Badge> : <span className="pm-prod-meta">—</span>}
                  </td>
                  <td><StatusBadge status={c.status} /></td>
                  <td><button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }}><i className="bi bi-chevron-right" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState icon="bi-megaphone" title="No campaigns here" text="Try another tab or clear the search." />}
        <div className="pm-note soft mt-2"><i className="bi bi-info-circle me-1" />Opening a campaign shows the funnel (sent → opened → clicked → purchased) and lets you pause, duplicate or relaunch.</div>
      </div>
    </>
  );
}

/* ==================================================================
   12.3 LOYALTY, REFERRALS & ENGAGEMENT
================================================================== */
export function LoyaltySection() {
  const { members, openModal } = useStore();
  const [tab, setTab] = useState<"members" | "rewards">("members");
  return (
    <>
      <Section no="12.3" title="Customer Engagement &amp; Loyalty"
        sub="Points, tiers and referrals — your repeat-purchase machine."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("segmentBuilder")}>
              <i className="bi bi-funnel me-1" /> Segment builder
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("loyaltyWizard")}>
              <i className="bi bi-gear me-1" /> Program settings
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("referralWizard")}>
              <i className="bi bi-people me-1" /> Referral program
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("redeemPoints")}>
              <i className="bi bi-gift me-1" /> Redeem points
            </button>
          </>
        }
      />
      <div className="pm-stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <div className="pm-card"><div className="pm-kpi-label">Members</div><div className="pm-kpi-value">{LOYALTY.enrolled.toLocaleString()}</div><div className="pm-prod-meta">+48 this week</div></div>
        <div className="pm-card"><div className="pm-kpi-label">Earn rate</div><div className="pm-kpi-value">1/{LOYALTY.pointsPerKes}</div><div className="pm-prod-meta">pt per KES {LOYALTY.pointsPerKes} · double on {LOYALTY.doublePointsDay}</div></div>
        <div className="pm-card"><div className="pm-kpi-label">Points issued</div><div className="pm-kpi-value">{fmtK(LOYALTY.pointsIssued)}</div><div className="pm-prod-meta">{fmtK(LOYALTY.pointsRedeemed)} redeemed (53%)</div></div>
        <div className="pm-card"><div className="pm-kpi-label">Referrals</div><div className="pm-kpi-value">{REFERRAL.participants}</div><div className="pm-prod-meta">{REFERRAL.converted} converted · CAC −23%</div></div>
      </div>
      <div className="pm-card mt-3">
        <ul className="nav nav-tabs border-0 mb-2">
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "members" ? "active" : ""}`} onClick={() => setTab("members")}>Top members</button></li>
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "rewards" ? "active" : ""}`} onClick={() => setTab("rewards")}>Rewards catalog</button></li>
        </ul>
        {tab === "members" ? (
          <div className="table-responsive">
            <table className="table pm-table align-middle">
              <thead><tr><th>Member</th><th>Tier</th><th className="text-end">Points</th><th className="text-end">Visits</th><th>Joined</th><th style={{ width: 40 }}></th></tr></thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.name} className="row-select" onClick={() => openModal("memberDrawer", { member: m.name })}>
                    <td><b style={{ fontSize: "0.82rem" }}>{m.name}</b><div className="pm-prod-meta">{m.phone}</div></td>
                    <td><StatusBadge status={m.tier} /></td>
                    <td className="text-end fw-bold">{m.points.toLocaleString()}</td>
                    <td className="text-end pm-prod-meta">{m.visits}</td>
                    <td className="pm-prod-meta">{m.joined}</td>
                    <td><button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }}><i className="bi bi-chevron-right" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="row g-3">
            {LOYALTY.rewards.map((r) => (
              <div className="col-md-3 col-6" key={r.id}>
                <div className="pm-card pm-card-hover text-center h-100" onClick={() => openModal("redeemPoints")}>
                  <i className={`bi ${r.icon}`} style={{ fontSize: "1.6rem", color: "var(--pm-green-dark)" }} />
                  <div className="fw-bold mt-2" style={{ fontSize: "0.82rem" }}>{r.name}</div>
                  <div className="pm-prod-meta">{r.desc}</div>
                  <Badge tone="amber" className="mt-2">{r.cost} pts</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ==================================================================
   12.4 WHATSAPP & SOCIAL COMMERCE
================================================================== */
export function SocialCommerce() {
  const { posts, inbox, openModal } = useStore();
  const unread = inbox.filter((m) => m.unread).length;
  return (
    <>
      <Section no="12.4" title="WhatsApp &amp; Social Commerce"
        sub="Your store lives where your customers scroll — broadcasts, shoppable posts and one unified inbox."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("integrations")}>
              <i className="bi bi-puzzle me-1" /> Integrations
            </button>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("broadcastWizard")}>
              <i className="bi bi-whatsapp me-1" /> Broadcast
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("socialComposer")}>
              <i className="bi bi-plus-lg me-1" /> Compose
            </button>
          </>
        }
      />
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="pm-card h-100">
            <b style={{ fontSize: "0.9rem" }} className="d-block mb-2">Channels</b>
            {CHANNELS.map((c) => (
              <div key={c.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <i className={`bi ${c.icon}`} style={{ color: c.tone === "green" ? "#25d366" : c.tone === "violet" ? "var(--pm-violet)" : "var(--pm-blue)", fontSize: "1.1rem" }} />
                <div className="flex-grow-1">
                  <div className="fw-semibold" style={{ fontSize: "0.82rem" }}>{c.name}</div>
                  <div className="pm-prod-meta">{c.desc}</div>
                </div>
                <Badge tone="slate">{c.reach.toLocaleString()}</Badge>
              </div>
            ))}
            <div className="pm-card mt-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
              <div className="d-flex justify-content-between align-items-center">
                <b style={{ fontSize: "0.86rem" }}>Inbox</b>
                <Badge tone="amber">{unread} unread</Badge>
              </div>
              <div className="pm-prod-meta mb-2">WhatsApp + IG + FB in one reply box.</div>
              <button type="button" className="btn btn-outline-primary btn-sm w-100" onClick={() => openModal("inbox")}>
                <i className="bi bi-chat-dots me-1" /> Open inbox
              </button>
            </div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="pm-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <b style={{ fontSize: "0.9rem" }}>Scheduled & published posts</b>
              <span className="pm-prod-meta">{posts.length} posts · {posts.reduce((a, b) => a + b.reach, 0).toLocaleString()} total reach</span>
            </div>
            <div className="d-flex flex-column gap-2">
              {posts.map((p) => (
                <div key={p.id} className="pm-post-card d-flex align-items-center gap-3 p-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 12 }}>
                  <span style={{ fontSize: "1.6rem" }}>{p.emoji}</span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <Badge tone={p.platform === "Instagram" ? "violet" : p.platform === "Facebook" ? "blue" : "slate"}>{p.platform}</Badge>
                      <StatusBadge status={p.status} />
                      <span className="pm-prod-meta">{p.time}</span>
                    </div>
                    <div className="pm-prod-meta text-truncate mt-1">{p.content}</div>
                  </div>
                  <div className="text-end" style={{ minWidth: 100 }}>
                    <div className="fw-semibold" style={{ fontSize: "0.78rem" }}>❤️ {p.likes.toLocaleString()} · 👁️ {p.reach.toLocaleString()}</div>
                    {p.status === "Published" && p.platform === "TikTok" && (
                      <button type="button" className="btn btn-sm btn-outline-primary mt-1" onClick={() => openModal("boostPost", { postId: p.id })}>
                        <i className="bi bi-graph-up-arrow me-1" />Boost
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="pm-note soft mt-3"><i className="bi bi-graph-up me-1" />PST-32 is 6× your average reach — <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={() => openModal("boostPost", { postId: "PST-32" })}>boost it now</button> to ride the wave.</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   12.5 PROMOTIONS, FLASH SALES & VOUCHERS
================================================================== */
export function PromotionsSection() {
  const { openModal, toast } = useStore();
  const promos = [
    { code: "MASHUJAA20", desc: "20% off flash sale", status: "Active", used: "186 / no cap", channel: "WhatsApp + SMS + IG" },
    { code: "FREEDELIVERY", desc: "Free delivery Nairobi", status: "Active", used: "61 / 200", channel: "Store" },
    { code: "JULY15", desc: "15% off above KES 5,000", status: "Ended", used: "34 / 100", channel: "Store" },
  ];
  return (
    <>
      <Section no="12.5" title="Promotions, Flash Sales &amp; Vouchers"
        sub="Discount codes with redemption tracking — every code posts to eTIMS receipts automatically."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => toast("Coupon CSV exported.", "info", "Export")}>
              <i className="bi bi-download me-1" /> Export codes
            </button>
            <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("flashsaleWizard")}>
              <i className="bi bi-lightning-charge me-1" /> Build Flash Sale
            </button>
          </>
        }
      />
      <div className="pm-card mb-3 d-flex flex-wrap align-items-center gap-3" style={{ background: "linear-gradient(110deg, #fef0c7, #fff8e6 55%, #fff)", borderColor: "#f6d78b" }}>
        <span style={{ fontSize: "1.6rem" }}>⚡</span>
        <div className="flex-grow-1" style={{ minWidth: 240 }}>
          <b style={{ fontSize: "0.95rem" }}>Mashujaa Weekend Flash Sale is LIVE</b>
          <div className="pm-prod-meta">186 orders · KES 214,500 revenue · 20% off kiondo & beaded sets · ends Sunday 23:59</div>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("campaignDrawer", { id: "CMP-024" })}>
          <i className="bi bi-graph-up me-1" /> Live results
        </button>
      </div>
      <div className="pm-card">
        <div className="pm-kpi-label mb-2">Active vouchers</div>
        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead><tr><th>Code</th><th>Description</th><th>Channel</th><th>Redemptions</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.code}>
                  <td><span className="badge-soft ink pm-mono">{p.code}</span></td>
                  <td style={{ fontSize: "0.84rem" }}>{p.desc}</td>
                  <td className="pm-prod-meta">{p.channel}</td>
                  <td><div className="pm-prod-meta">{p.used}</div></td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("flashsaleWizard")}><i className="bi bi-pencil me-1" />Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-note mt-3"><i className="bi bi-shield-check me-1" />Vouchers sync two-way with Products &amp; Store — create there, measure here, or vice versa.</div>
      </div>
    </>
  );
}

/* ==================================================================
   12.6 REVIEWS & FEEDBACK
================================================================== */
export function ReviewsSection() {
  const { reviews, openModal } = useStore();
  const pending = reviews.filter((r) => r.status === "Pending review").length;
  const avg = (reviews.reduce((a, b) => a + b.stars, 0) / reviews.length).toFixed(1);
  return (
    <>
      <Section no="12.6" title="Customer Feedback &amp; Reviews"
        sub="Reviews build trust; NPS measures it. Reply fast, publish the good, fix the bad."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("npsDetail")}>
              <i className="bi bi-chat-square-heart me-1" /> NPS breakdown
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("feedbackWizard")}>
              <i className="bi bi-plus-lg me-1" /> Feedback campaign
            </button>
          </>
        }
      />
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="pm-card h-100 text-center">
            <div className="pm-kpi-label mb-1">Net Promoter Score</div>
            <div className="pm-kpi-value" style={{ fontSize: "2.6rem" }}>{NPS.score}</div>
            <div className="pm-prod-meta mb-2">{NPS.responses} responses · {NPS.promoters}% promoters</div>
            <Spark data={NPS.trend.map((v) => v * 10)} w={280} h={48} color="#f79009" />
            <div className="pm-prod-meta mt-2">up from 7.4 a year ago — keep asking</div>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="pm-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <b style={{ fontSize: "0.9rem" }}>Latest reviews · avg {avg}★</b>
              <Badge tone={pending ? "amber" : "green"}>{pending} awaiting action</Badge>
            </div>
            {reviews.map((r) => (
              <div key={r.id} className="d-flex align-items-start gap-3 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <span className="pm-avatar" style={{ width: 34, height: 34, fontSize: "0.7rem", background: "linear-gradient(135deg, #7a5af8, #5b3ee0)" }}>
                  {r.customer.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <b style={{ fontSize: "0.8rem" }}>{r.customer}</b>
                    <span style={{ color: "#f79009", fontSize: "0.78rem" }}>{"★".repeat(r.stars)}</span>
                    <span className="pm-prod-meta">{r.product} · {r.date} · {r.platform}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div style={{ fontSize: "0.8rem" }} className="mt-1">"{r.text}"</div>
                </div>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal("reviewReply", { id: r.id })}>
                  <i className="bi bi-reply me-1" />{r.status === "Replied" ? "Edit reply" : "Reply"}
                </button>
              </div>
            ))}
            <div className="pm-note soft mt-3"><i className="bi bi-lightbulb me-1" />A public reply within 1 hour lifts your review conversion 12% — low-star replies matter most.</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   12.7 GROWTH ANALYTICS & EXPERIMENTS
================================================================== */
export function GrowthAnalytics() {
  const { abtests, openModal } = useStore();
  const [tab, setTab] = useState<"funnel" | "experiments" | "ideas">("funnel");
  return (
    <>
      <Section no="12.7" title="Growth Analytics &amp; Experiments"
        sub="The funnel, running A/B tests and AI growth ideas — your experiment lab."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("attribution")}>
              <i className="bi bi-diagram-3 me-1" /> Attribution model
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("abtestWizard")}>
              <i className="bi bi-award me-1" /> New A/B test
            </button>
          </>
        }
      />
      <div className="pm-card">
        <ul className="nav nav-tabs border-0 mb-3">
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "funnel" ? "active" : ""}`} onClick={() => setTab("funnel")}>Conversion funnel</button></li>
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "experiments" ? "active" : ""}`} onClick={() => setTab("experiments")}>A/B experiments <span className="badge bg-light text-secondary border ms-1">{abtests.length}</span></button></li>
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "ideas" ? "active" : ""}`} onClick={() => setTab("ideas")}>Growth ideas <span className="badge bg-light text-secondary border ms-1">{IDEAS.length}</span></button></li>
        </ul>
        {tab === "funnel" && (
          <div className="row g-3">
            <div className="col-lg-7">
              {FUNNEL.map((f, i) => {
                const prev = i === 0 ? f.v : FUNNEL[i - 1].v;
                const pct = i === 0 ? 100 : Math.round((f.v / prev) * 100);
                return (
                  <div className="pm-funnel-row" key={f.label}>
                    <div className="pm-funnel-head">
                      <span>{f.label}</span>
                      <span className="pm-prod-meta">{f.v.toLocaleString()}{i > 0 && ` (${pct}%)`}</span>
                    </div>
                    <div className="pm-funnel-bar" style={{ width: `${Math.max(8, (f.v / FUNNEL[0].v) * 100)}%`, background: ["#101828", "#12b76a", "#2e90fa", "#7a5af8", "#f79009"][i] }}>
                      {i === 0 ? "100%" : `${pct}%`}
                    </div>
                  </div>
                );
              })}
              <div className="pm-note soft mt-3"><i className="bi bi-lightbulb me-1" />Biggest drop: reached → opened (62%). WhatsApp B-variant openers (emoji-led) lift this +38% — test one this week.</div>
            </div>
            <div className="col-lg-5">
              <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
                <div className="pm-kpi-label mb-2">Attribution — last-touch</div>
                {ATTRIBUTION.map((a) => (
                  <div key={a.label} className="d-flex align-items-center gap-2 py-1">
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: a.color, display: "inline-block" }} />
                    <span style={{ fontSize: "0.8rem" }} className="flex-grow-1">{a.label}</span>
                    <b style={{ fontSize: "0.78rem" }}>{a.v}%</b>
                  </div>
                ))}
                <button type="button" className="btn btn-outline-primary btn-sm w-100 mt-2" onClick={() => openModal("attribution")}>
                  Change model
                </button>
              </div>
            </div>
          </div>
        )}
        {tab === "experiments" && (
          <div className="row g-3">
            {abtests.map((t) => (
              <div className="col-md-6" key={t.id}>
                <div className="pm-card" style={{ boxShadow: "none", border: "1px solid var(--pm-border)" }}>
                  <div className="d-flex justify-content-between mb-2">
                    <b style={{ fontSize: "0.86rem" }}>{t.name}</b>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="pm-prod-meta mb-2">{t.variable} · {t.date}</div>
                  <div className="row g-2 mb-2">
                    <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: t.winner === "A" ? "var(--pm-green-soft)" : "#fafbfd" }}><div className="pm-kpi-label">Variant A</div><div style={{ fontSize: "0.78rem" }}>{t.a}</div>{t.winner === "A" && <Badge tone="green" className="mt-1">Winner</Badge>}</div></div>
                    <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: t.winner === "B" ? "var(--pm-green-soft)" : "#fafbfd" }}><div className="pm-kpi-label">Variant B</div><div style={{ fontSize: "0.78rem" }}>{t.b}</div>{t.winner === "B" && <Badge tone="green" className="mt-1">Winner</Badge>}</div></div>
                  </div>
                  <div className="pm-prod-meta"><i className="bi bi-graph-up-arrow me-1 text-primary" />{t.uplift}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === "ideas" && (
          <div className="row g-3">
            {IDEAS.map((i) => (
              <div className="col-md-6" key={i.id}>
                <div className="pm-help-item">
                  <i className={`bi ${i.icon}`} style={{ color: i.tone === "green" ? "var(--pm-green)" : i.tone === "violet" ? "var(--pm-violet)" : i.tone === "blue" ? "var(--pm-blue)" : "var(--pm-warn)" }} />
                  <div>
                    <b style={{ fontSize: "0.84rem" }}>{i.title}</b>
                    <div className="pm-prod-meta">{i.detail}</div>
                    <button type="button" className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: "0.74rem" }} onClick={() => openModal("ideas")}>{i.act} →</button>
                  </div>
                </div>
              </div>
            ))}
            <div className="col-12"><button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("ideas")}><i className="bi bi-magic me-1" /> All growth ideas</button></div>
          </div>
        )}
      </div>
    </>
  );
}

/* ==================================================================
   WIZARD BANNER
================================================================== */
export function WizardsBanner() {
  const { openModal } = useStore();
  return (
    <div className="pm-card mt-4 d-flex flex-wrap align-items-center gap-3" style={{ background: "linear-gradient(90deg, #0b1322, #2a1d55)", border: "none", color: "#fff" }}>
      <span style={{ fontSize: "1.6rem" }}>🧭</span>
      <div className="flex-grow-1" style={{ minWidth: 260 }}>
        <b style={{ fontSize: "0.95rem" }}>Guided flows on this page</b>
        <div style={{ color: "#b9c7d8", fontSize: "0.8rem" }}>
          Campaign (5 steps) · Flash Sale (4) · Loyalty (4) · Referral (3) · A/B Test (4) · WhatsApp Broadcast (3) · Feedback (3). Every launch updates budgets, calendars and the audit trail.
        </div>
      </div>
      <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("campaignWizard")}>
        <i className="bi bi-magic me-1" /> Start campaign wizard
      </button>
    </div>
  );
}
