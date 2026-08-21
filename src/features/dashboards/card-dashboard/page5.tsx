/* ============================================================================
 * Card Dashboard — page 5.5 · Prepaid Card Management (Bootstrap 5 edition)
 * ========================================================================== */

import { useEffect, useState } from "react";
import { cn } from "./utils/cn";
import { Icon, type IconName, NetworkMark } from "./icons";
import { Badge, Btn, Chip, Drawer, FieldLabel, Modal, Progress, Reveal, SectionHead, Spark, Toggle, Empty } from "./ui";
import { useApp } from "./store";
import {
  MCC_CATEGORIES,
  PREPAID_FEES,
  PREPAID_FUNDING_SOURCES,
  PREPAID_ISSUANCE_FEE,
  PREPAID_USES,
  kes,
  kesShort,
  type PrepaidCard,
  type PrepaidForm,
  type PrepaidUse,
} from "./data";

/* ---------------- helpers ---------------- */

const mccLabel = (id: string) => MCC_CATEGORIES.find((m) => m.id === id)?.label ?? "All categories";
const useMeta = (id: PrepaidUse) => PREPAID_USES.find((u) => u.id === id) ?? PREPAID_USES[0];

const statusTone = (s: PrepaidCard["status"]): "success" | "info" | "warning" | "muted" =>
  s === "active" ? "success" : s === "frozen" ? "info" : s === "depleted" ? "warning" : "muted";

/* ---------------- prepaid card visual ---------------- */

function PrepaidVisual({ card, small }: { card: PrepaidCard; small?: boolean }) {
  const pct = card.loaded > 0 ? Math.round((card.balance / card.loaded) * 100) : 0;
  const dimmed = card.status === "frozen" || card.status === "retired";
  return (
    <div
      className="position-relative w-100 overflow-hidden text-white"
      style={{ aspectRatio: "1.62", borderRadius: 16, background: card.gradient, boxShadow: "var(--shadow-card)", filter: dimmed ? "saturate(0.4)" : undefined }}
    >
      <div className="pmc-hero-dots" />
      <div className={cn("position-relative d-flex flex-column justify-content-between h-100", small ? "p-3" : "p-3", !small && "pmc-p-4")}>
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <p className="pmc-display fw-bold mb-0" style={{ fontSize: small ? 12 : 13.5 }}>PayMo</p>
            <p className="fw-semibold text-uppercase mb-0" style={{ fontSize: small ? 8 : 9, letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)" }}>
              {card.form === "virtual" ? "Virtual Prepaid" : "Physical Prepaid"}
            </p>
          </div>
          <NetworkMark network={card.network} />
        </div>
        <div>
          <div className="d-flex align-items-end justify-content-between">
            <div>
              <p className="fw-semibold text-uppercase mb-0" style={{ fontSize: small ? 8 : 9.5, letterSpacing: "0.05em", color: "rgba(255,255,255,0.55)" }}>Balance</p>
              <p className="pmc-num pmc-display fw-bold mb-0" style={{ fontSize: small ? 16 : 20, letterSpacing: "-0.02em" }}>{kes(card.balance)}</p>
            </div>
            <div className="text-end">
              <p className="fw-semibold text-uppercase mb-0" style={{ fontSize: small ? 8 : 9.5, letterSpacing: "0.05em", color: "rgba(255,255,255,0.55)" }}>Valid</p>
              <p className="fw-bold mb-0" style={{ fontSize: small ? 10 : 11 }}>{card.expiry}</p>
            </div>
          </div>
          <div className="overflow-hidden" style={{ marginTop: 8, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.2)" }}>
            <div className="h-100" style={{ width: `${pct}%`, borderRadius: 99, background: "rgba(255,255,255,0.85)" }} />
          </div>
          <div className="d-flex align-items-center justify-content-between" style={{ marginTop: 6 }}>
            <p className="fw-semibold mb-0" style={{ fontSize: small ? 10 : 11.5, letterSpacing: "0.025em", color: "rgba(255,255,255,0.85)" }}>{card.panMask}</p>
            <p className="mb-0" style={{ fontSize: small ? 8 : 9.5, color: "rgba(255,255,255,0.7)" }}>{card.holder}</p>
          </div>
        </div>
      </div>
      {card.status === "frozen" && (
        <span className="position-absolute fw-bold" style={{ right: 12, top: 12, borderRadius: 6, background: "rgba(11,19,34,0.7)", padding: "4px 8px", fontSize: 10, color: "#a5d8ff", backdropFilter: "blur(2px)" }}>FROZEN</span>
      )}
      {card.status === "depleted" && (
        <span className="position-absolute fw-bold" style={{ right: 12, top: 12, borderRadius: 6, background: "rgba(11,19,34,0.7)", padding: "4px 8px", fontSize: 10, color: "#fdd9a0", backdropFilter: "blur(2px)" }}>EMPTY</span>
      )}
      {card.status === "retired" && (
        <span className="position-absolute fw-bold" style={{ right: 12, top: 12, borderRadius: 6, background: "rgba(11,19,34,0.7)", padding: "4px 8px", fontSize: 10, color: "#cdd3df", backdropFilter: "blur(2px)" }}>RETIRED</span>
      )}
    </div>
  );
}

/* ============ 01 · Prepaid overview ============ */

export function PrepaidOverview() {
  const { prepaid, openModal, setPage } = useApp();
  const live = prepaid.filter((p) => p.status !== "retired");
  const totalBalance = live.reduce((s, p) => s + p.balance, 0);
  const totalLoaded = prepaid.reduce((s, p) => s + p.loaded, 0);
  const active = prepaid.filter((p) => p.status === "active").length;
  const lowCount = live.filter((p) => p.loaded > 0 && p.balance / p.loaded < 0.2).length;

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
                <span className="pmc-hero-chip">Module 5.5</span>
              </div>
              <h1 className="pmc-hero-title pmc-mt-3">
                Prepaid Card<br className="d-none d-sm-inline" /> Management
              </h1>
              <p className="pmc-hero-sub" style={{ maxWidth: 500 }}>
                Issue loadable prepaid cards for teams, gifts and travel. Fund them upfront, cap spend by category,
                and top up in seconds — with zero exposure to your main accounts.
              </p>
              <div className="pmc-mt-4 d-flex flex-wrap pmc-gap-2">
                <Btn icon="plus" onClick={() => openModal({ type: "prepaidIssue" })}>Issue Prepaid Card</Btn>
                <Btn variant="ghost" icon="wallet" onClick={() => openModal({ type: "topup" })}>Top Up a Card</Btn>
                <Btn variant="ghost" icon="gauge" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="pmc-hero-stats">
                {[
                  { k: "Total balance", v: kesShort(totalBalance) },
                  { k: "Active cards", v: String(active) },
                  { k: "Loaded MTD", v: kesShort(totalLoaded) },
                  { k: "Low balance", v: String(lowCount), warn: lowCount > 0 },
                ].map((s) => (
                  <div key={s.k} className="lh-sm">
                    <p className="pmc-hero-stat-value" style={s.warn ? { color: "#ffd27d" } : undefined}>{s.v}</p>
                    <p className="pmc-hero-stat-label">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pmc-hero-art" style={{ height: 230 }}>
              <div className="position-absolute" style={{ right: 0, top: 0, width: 245, transform: "rotate(6deg)" }}>
                {prepaid[0] && <PrepaidVisual card={prepaid[0]} />}
              </div>
              <div className="position-absolute" style={{ bottom: 0, left: 4, width: 245, transform: "rotate(-4deg)" }}>
                {prepaid[4] && <PrepaidVisual card={prepaid[4]} />}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="row pmc-g-3 pmc-mt-4">
        {[
          { icon: "wallet" as IconName, tone: "pmc-tone-green", label: "Available Balance", value: kes(totalBalance), note: `across ${live.length} live cards`, spark: [30, 28, 34, 31, 27, 24, 22, 26], stroke: "#12b76a" },
          { icon: "refresh" as IconName, tone: "pmc-tone-blue", label: "Loaded (all-time)", value: kesShort(totalLoaded), note: "top-ups + initial loads", spark: [12, 18, 22, 30, 38, 44, 52, 60], stroke: "#2e90fa" },
          { icon: "card" as IconName, tone: "pmc-tone-violet", label: "Cards Issued", value: String(prepaid.length), note: `${prepaid.filter((p) => p.form === "virtual").length} virtual · ${prepaid.filter((p) => p.form === "physical").length} physical`, spark: [2, 3, 3, 4, 4, 5, 5, 5], stroke: "#7a5af8" },
          { icon: "alertTri" as IconName, tone: "pmc-tone-warn", label: "Need Attention", value: String(lowCount), note: lowCount > 0 ? "low balance — top up soon" : "all balances healthy", spark: [1, 0, 1, 1, 2, 1, 1, 1], stroke: "#f79009", action: () => document.getElementById("balances")?.scrollIntoView({ behavior: "smooth" }) },
        ].map((k, i) => (
          <div key={k.label} className="col-12 col-sm-6 col-xl-3">
            <Reveal delay={i * 70} className="h-100">
              <button
                type="button"
                onClick={k.action}
                className={cn("pmc-card pmc-stat pmc-focus h-100", k.action && "pmc-lift")}
                style={k.action ? undefined : { cursor: "default" }}
              >
                <div className="d-flex align-items-start justify-content-between">
                  <span className={cn("pmc-stat-icon d-grid", k.tone)}><Icon name={k.icon} size={19} /></span>
                  <Spark points={k.spark} stroke={k.stroke} />
                </div>
                <p className="pmc-stat-label">{k.label}</p>
                <p className="pmc-stat-value">{k.value}</p>
                <p className="pmc-mt-2 pmc-fs-11 fw-semibold pmc-faint mb-0">{k.note}</p>
              </button>
            </Reveal>
          </div>
        ))}
      </div>

      {/* Use-case launchers */}
      <div className="row g-2 pmc-mt-4">
        {PREPAID_USES.map((u, i) => (
          <div key={u.id} className="col-12 col-sm-6 col-lg-3">
            <Reveal delay={i * 60} className="h-100">
              <button
                type="button"
                onClick={() => { openModal({ type: "prepaidIssue" }); window.setTimeout(() => window.dispatchEvent(new CustomEvent("pm-prepaid-use", { detail: u.id })), 40); }}
                className="pmc-card pmc-lift pmc-focus d-flex w-100 align-items-center pmc-gap-3 p-3 text-start h-100"
              >
                <span className="pmc-icon-sq d-grid flex-none pmc-tone-green"><Icon name={u.icon} size={16} /></span>
                <span className="flex-grow-1" style={{ minWidth: 0 }}>
                  <span className="d-block pmc-fs-125 fw-bold pmc-ink">{u.title}</span>
                  <span className="d-block text-truncate pmc-fs-105 fw-semibold pmc-faint">{u.sub}</span>
                </span>
                <Icon name="plus" size={14} className="flex-none pmc-faint" />
              </button>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ 02 · Prepaid cards grid ============ */

type PpFilter = "all" | "active" | "low" | "frozen" | "depleted";

export function PrepaidCardsSection() {
  const { prepaid, openModal } = useApp();
  const [filter, setFilter] = useState<PpFilter>("all");
  const [query, setQuery] = useState("");

  const isLow = (p: PrepaidCard) => p.status !== "retired" && p.loaded > 0 && p.balance / p.loaded < 0.2 && p.balance > 0;
  const shown = prepaid.filter((p) => {
    if (filter === "active" && p.status !== "active") return false;
    if (filter === "frozen" && p.status !== "frozen") return false;
    if (filter === "depleted" && p.status !== "depleted") return false;
    if (filter === "low" && !isLow(p)) return false;
    const q = query.trim().toLowerCase();
    return !q || `${p.name} ${p.holder} ${mccLabel(p.mcc)}`.toLowerCase().includes(q);
  });
  const count = (f: PpFilter) => prepaid.filter((p) => (f === "all" ? true : f === "low" ? isLow(p) : p.status === f)).length;

  return (
    <section id="prepaid-cards" className="pmc-scroll-mt">
      <SectionHead no="02" title="Prepaid Cards" sub="Loadable cards with their own balance, category lock and top-up controls.">
        <div className="position-relative">
          <Icon name="search" size={14} className="position-absolute pmc-faint" style={{ left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a prepaid card…"
            className="pmc-focus pmc-radius-sm pmc-fs-125 fw-semibold pmc-ink"
            style={{ width: 190, border: "1px solid var(--pmc-line)", background: "#fff", padding: "8px 12px 8px 36px", outline: "none" }}
          />
        </div>
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "prepaidIssue" })}>Issue Card</Btn>
      </SectionHead>

      <div className="pmc-thin-scroll pmc-mb-4 d-flex pmc-gap-2 overflow-auto pb-1">
        {(["all", "active", "low", "frozen", "depleted"] as PpFilter[]).map((f) => (
          <Chip key={f} on={filter === f} onClick={() => setFilter(f)} count={count(f)}>
            {f === "all" ? "All" : f === "low" ? "Low balance" : f.charAt(0).toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty icon="card" title="No prepaid cards match" sub="Try another filter, or issue a new loadable card." action={<Btn size="sm" icon="plus" onClick={() => openModal({ type: "prepaidIssue" })}>Issue Prepaid Card</Btn>} />
      ) : (
        <div className="row pmc-g-4">
          {shown.map((card, i) => {
            const spentPct = card.loaded > 0 ? Math.round((card.spent / card.loaded) * 100) : 0;
            const low = isLow(card);
            return (
              <div key={card.id} className="col-12 col-sm-6 col-xl-4">
                <Reveal delay={(i % 3) * 70} className="h-100">
                  <div className="pmc-card pmc-lift p-3 h-100">
                    <button type="button" onClick={() => openModal({ type: "prepaidManage", cardId: card.id })} className="pmc-focus d-block w-100 text-start border-0 bg-transparent p-0" aria-label={`Manage ${card.name}`}>
                      <PrepaidVisual card={card} />
                    </button>
                    <div className="pmc-mt-3 d-flex align-items-start justify-content-between pmc-gap-2">
                      <div style={{ minWidth: 0 }}>
                        <p className="text-truncate pmc-fs-135 fw-bold pmc-ink mb-0">{card.name}</p>
                        <p className="pmc-fs-11 fw-semibold pmc-faint mb-0">{useMeta(card.use).title}</p>
                      </div>
                      <Badge tone={statusTone(card.status)} dot className="text-capitalize">{card.status}</Badge>
                    </div>
                    <div className="pmc-mt-2 d-flex flex-wrap pmc-gap-15">
                      <Badge tone="muted">{card.form === "virtual" ? "Virtual" : "Physical"}</Badge>
                      <Badge tone={card.mcc === "any" ? "muted" : "violet"}>{card.mcc === "any" ? "Open MCC" : mccLabel(card.mcc)}</Badge>
                      {low && <Badge tone="warning" dot>Low</Badge>}
                    </div>
                    <div className="pmc-mt-25">
                      <div className="pmc-mb-1 d-flex justify-content-between pmc-fs-105 fw-bold pmc-faint">
                        <span className="pmc-num">{kes(card.balance)} left</span>
                        <span className="pmc-num">{spentPct}% spent</span>
                      </div>
                      <Progress value={100 - spentPct} tone={low ? "red" : spentPct > 60 ? "amber" : "green"} />
                    </div>
                    <div className="pmc-mt-3 d-flex align-items-center pmc-gap-15" style={{ borderTop: "1px solid rgba(230,233,240,0.7)", paddingTop: 12 }}>
                      {card.status === "retired" ? (
                        <span className="flex-grow-1 pmc-radius-sm px-3 pmc-py-15 text-center pmc-fs-115 fw-bold pmc-faint" style={{ background: "var(--pmc-canvas)" }}>Card retired</span>
                      ) : (
                        <Btn size="sm" icon="wallet" className="flex-grow-1" disabled={!card.reloadable && card.status === "depleted"} onClick={() => openModal({ type: "topup", cardId: card.id })}>Top Up</Btn>
                      )}
                      <button type="button" onClick={() => openModal({ type: "prepaidManage", cardId: card.id })} title="Manage" className="pmc-focus pmc-icon-btn pmc-icon-btn-sm pmc-icon-btn-green"><Icon name="sliders" size={14} /></button>
                      <button type="button" onClick={() => openModal({ type: "prepaidManage", cardId: card.id })} title="Details" className="pmc-focus pmc-icon-btn pmc-icon-btn-sm pmc-icon-btn-green"><Icon name="chevRight" size={14} /></button>
                    </div>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ============ 03 · Balances & reloads ============ */

export function BalancesSection() {
  const { prepaid, openModal } = useApp();
  const live = prepaid.filter((p) => p.status !== "retired");

  return (
    <section id="balances" className="pmc-scroll-mt">
      <SectionHead no="03" title="Balances & Reloads" sub="At-a-glance funding health with one-tap top-ups for anything running low.">
        <Btn size="sm" icon="wallet" onClick={() => openModal({ type: "topup" })}>Top Up a Card</Btn>
      </SectionHead>

      {live.length === 0 ? (
        <Empty icon="wallet" title="No live prepaid balances" sub="Issue a prepaid card to start tracking balances here." />
      ) : (
        <Reveal>
          <div className="pmc-table-frame">
            <div className="d-none d-md-block">
              <table className="pmc-table w-100 text-start">
                <thead>
                  <tr>
                    <th className="pmc-px-4 pmc-py-25">Card</th>
                    <th className="pmc-px-3 pmc-py-25">Category lock</th>
                    <th className="pmc-px-3 pmc-py-25">Balance</th>
                    <th className="pmc-px-3 pmc-py-25" style={{ width: 180 }}>Remaining</th>
                    <th className="pmc-px-4 pmc-py-25 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {live.map((p) => {
                    const remaining = p.loaded > 0 ? Math.round((p.balance / p.loaded) * 100) : 0;
                    const low = p.loaded > 0 && p.balance / p.loaded < 0.2;
                    return (
                      <tr key={p.id}>
                        <td className="pmc-px-4 pmc-py-3">
                          <div className="d-flex align-items-center pmc-gap-25">
                            <span className="pmc-icon-sq d-grid flex-none pmc-tone-muted" style={{ width: 32, height: 32, borderRadius: 8 }}><Icon name={p.form === "virtual" ? "card" : "wallet"} size={14} /></span>
                            <div className="lh-sm">
                              <p className="fw-bold pmc-ink mb-0">{p.name}</p>
                              <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">•• {p.last4} · {p.form}</p>
                            </div>
                          </div>
                        </td>
                        <td className="pmc-px-3 pmc-py-3"><Badge tone={p.mcc === "any" ? "muted" : "violet"}>{p.mcc === "any" ? "Open" : mccLabel(p.mcc)}</Badge></td>
                        <td className="pmc-num pmc-px-3 pmc-py-3 pmc-display fw-bold pmc-ink">{kes(p.balance)}</td>
                        <td className="pmc-px-3 pmc-py-3">
                          <div className="d-flex align-items-center pmc-gap-2">
                            <div className="d-inline-block" style={{ width: 110 }}>
                              <Progress value={remaining} tone={low ? "red" : remaining < 50 ? "amber" : "green"} />
                            </div>
                            <span className={cn("pmc-num pmc-fs-11 fw-bold", low ? "pmc-danger-ink" : "pmc-muted")}>{remaining}%</span>
                          </div>
                        </td>
                        <td className="pmc-px-4 pmc-py-3 text-end">
                          <Btn size="sm" variant={low ? "primary" : "outline"} icon="wallet" onClick={() => openModal({ type: "topup", cardId: p.id })}>Top Up</Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="pmc-mobile-list d-md-none">
              {live.map((p) => {
                const remaining = p.loaded > 0 ? Math.round((p.balance / p.loaded) * 100) : 0;
                const low = p.loaded > 0 && p.balance / p.loaded < 0.2;
                return (
                  <li key={p.id}>
                    <span className="pmc-icon-sq d-grid flex-none pmc-tone-muted" style={{ width: 36, height: 36, borderRadius: 10 }}><Icon name={p.form === "virtual" ? "card" : "wallet"} size={15} /></span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p className="text-truncate pmc-fs-13 fw-bold pmc-ink mb-0">{p.name}</p>
                      <p className="pmc-num pmc-fs-11 fw-semibold pmc-faint mb-0">{kes(p.balance)} · {remaining}% left</p>
                      <Progress value={remaining} tone={low ? "red" : remaining < 50 ? "amber" : "green"} className="pmc-mt-15" />
                    </div>
                    <Btn size="sm" variant={low ? "primary" : "outline"} icon="wallet" onClick={() => openModal({ type: "topup", cardId: p.id })}>Top Up</Btn>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      )}
    </section>
  );
}

/* ============ 04 · Limits & MCC locks ============ */

export function ControlsSection() {
  const { prepaid, openModal, toast } = useApp();
  const [autoReload, setAutoReload] = useState(true);
  const [lowAlert, setLowAlert] = useState(true);
  const active = prepaid.filter((p) => p.status === "active" || p.status === "frozen");

  return (
    <section id="controls" className="pmc-scroll-mt">
      <SectionHead no="04" title="Limits & MCC Locks" sub="Category restrictions and spend caps that keep prepaid funds on-purpose." />

      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-card p-4 h-100">
            <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Per-card controls</p>
            {active.length === 0 ? (
              <Empty icon="shield" title="No active cards" sub="Issue a prepaid card to configure category locks." />
            ) : (
              <ul className="list-unstyled d-flex flex-column pmc-gap-2 mb-0">
                {active.map((p) => (
                  <li key={p.id} className="d-flex flex-wrap align-items-center pmc-gap-3 pmc-radius px-3 pmc-py-3" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}>
                    <span className="pmc-icon-sq d-grid flex-none pmc-tone-muted" style={{ background: "#fff", boxShadow: "0 1px 2px rgba(16,24,40,0.06)" }}><Icon name="card" size={15} /></span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p className="pmc-fs-125 fw-bold pmc-ink mb-0">{p.name}</p>
                      <p className="pmc-fs-11 fw-semibold pmc-faint pmc-num mb-0">Cap {kes(p.monthlyLimit)}/mo · •• {p.last4}</p>
                    </div>
                    <Badge tone={p.mcc === "any" ? "muted" : "violet"}>{p.mcc === "any" ? "Open MCC" : mccLabel(p.mcc)}</Badge>
                    <Btn size="sm" variant="outline" icon="sliders" onClick={() => openModal({ type: "prepaidManage", cardId: p.id })}>Edit</Btn>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>

        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-card p-4">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Programme defaults</p>
              <div
                className="d-flex align-items-center pmc-gap-3 pmc-radius p-3"
                style={autoReload ? { border: "1px solid rgba(18,183,106,0.4)", background: "rgba(231,248,239,0.4)" } : { border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}
              >
                <span className={cn("pmc-icon-sq d-grid flex-none", autoReload ? "pmc-green-ink" : "pmc-faint")} style={{ background: "#fff", boxShadow: autoReload ? "0 1px 2px rgba(16,24,40,0.06)" : undefined }}>
                  <Icon name="refresh" size={16} />
                </span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <p className="pmc-fs-125 fw-bold pmc-ink mb-0">Auto-reload when low</p>
                  <p className="pmc-fs-11 pmc-muted mb-0">Top up KES 10,000 when a card drops below 15%.</p>
                </div>
                <Toggle on={autoReload} label="Auto-reload" onChange={(v) => { setAutoReload(v); toast(v ? "success" : "warn", `Auto-reload ${v ? "enabled" : "disabled"}`); }} />
              </div>
              <div
                className="pmc-mt-2 d-flex align-items-center pmc-gap-3 pmc-radius p-3"
                style={lowAlert ? { border: "1px solid rgba(18,183,106,0.4)", background: "rgba(231,248,239,0.4)" } : { border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}
              >
                <span className={cn("pmc-icon-sq d-grid flex-none", lowAlert ? "pmc-green-ink" : "pmc-faint")} style={{ background: "#fff", boxShadow: lowAlert ? "0 1px 2px rgba(16,24,40,0.06)" : undefined }}>
                  <Icon name="bell" size={16} />
                </span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <p className="pmc-fs-125 fw-bold pmc-ink mb-0">Low-balance alerts</p>
                  <p className="pmc-fs-11 pmc-muted mb-0">Notify the cardholder and admin at 20%.</p>
                </div>
                <Toggle on={lowAlert} label="Low-balance alerts" onChange={(v) => { setLowAlert(v); toast(v ? "success" : "warn", `Low-balance alerts ${v ? "on" : "off"}`); }} />
              </div>
            </div>

            <div className="pmc-card p-4 flex-grow-1">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-25">Available MCC categories</p>
              <div className="row g-2">
                {MCC_CATEGORIES.filter((m) => m.id !== "any").map((m) => (
                  <div key={m.id} className="col-6">
                    <div className="d-flex align-items-center pmc-gap-2 pmc-radius-sm px-2 pmc-py-2 h-100" style={{ background: "rgba(242,244,248,0.6)" }}>
                      <Icon name={m.icon} size={13} className="flex-none pmc-muted" />
                      <span className="text-truncate pmc-fs-11 fw-bold pmc-ink-2">{m.label}</span>
                    </div>
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

/* ============ 05 · Load & spend activity ============ */

export function PrepaidActivitySection() {
  const { loads, prepaid, toast } = useApp();
  const [filter, setFilter] = useState<"all" | "load" | "spend">("all");
  const byId = (id: string) => prepaid.find((p) => p.id === id);
  const shown = loads.filter((l) => (filter === "all" ? true : filter === "load" ? l.amount > 0 : l.amount < 0));
  const totalLoaded = loads.filter((l) => l.amount > 0).reduce((s, l) => s + l.amount, 0);
  const totalSpent = loads.filter((l) => l.amount < 0).reduce((s, l) => s + Math.abs(l.amount), 0);

  const kindTone = (k: string): "success" | "danger" | "info" | "violet" =>
    k === "Top-up" ? "success" : k === "Purchase" ? "danger" : k === "Auto-reload" ? "info" : "violet";

  return (
    <section id="prepaid-activity" className="pmc-scroll-mt">
      <SectionHead no="05" title="Load & Spend Activity" sub="Every top-up, purchase, auto-reload and refund across your prepaid cards.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Activity exported", `${shown.length} events written to prepaid-activity.csv`)}>Export CSV</Btn>
      </SectionHead>

      <div className="row g-3 pmc-mb-4" style={{ maxWidth: 448 }}>
        <div className="col-6">
          <div className="pmc-card p-3 h-100">
            <p className="d-flex align-items-center pmc-gap-15 pmc-fs-105 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>
              <Icon name="upRight" size={12} style={{ color: "#067647" }} /> Loaded
            </p>
            <p className="pmc-num pmc-display pmc-mt-1 pmc-fs-16 fw-bold mb-0" style={{ color: "#067647" }}>{kes(totalLoaded)}</p>
          </div>
        </div>
        <div className="col-6">
          <div className="pmc-card p-3 h-100">
            <p className="d-flex align-items-center pmc-gap-15 pmc-fs-105 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>
              <Icon name="downRight" size={12} style={{ color: "#b42318" }} /> Spent
            </p>
            <p className="pmc-num pmc-display pmc-mt-1 pmc-fs-16 fw-bold pmc-ink mb-0">{kes(totalSpent)}</p>
          </div>
        </div>
      </div>

      <div className="pmc-thin-scroll pmc-mb-4 d-flex pmc-gap-2 overflow-auto pb-1">
        {(["all", "load", "spend"] as const).map((f) => (
          <Chip key={f} on={filter === f} onClick={() => setFilter(f)} count={f === "all" ? loads.length : loads.filter((l) => (f === "load" ? l.amount > 0 : l.amount < 0)).length}>
            {f === "all" ? "All" : f === "load" ? "Top-ups" : "Purchases"}
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty icon="inbox" title="No activity yet" sub="Top-ups and purchases will appear here." />
      ) : (
        <Reveal>
          <div className="pmc-table-frame">
            <ul className="pmc-mobile-list">
              {shown.map((l) => {
                const card = byId(l.cardId);
                const isLoad = l.amount > 0;
                return (
                  <li key={l.id}>
                    <span className={cn("pmc-icon-sq d-grid flex-none", isLoad ? "pmc-tone-green" : "pmc-tone-muted")}>
                      <Icon name={isLoad ? "upRight" : "downRight"} size={15} />
                    </span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p className="d-flex flex-wrap align-items-center pmc-gap-15 pmc-fs-13 fw-bold pmc-ink mb-0">
                        {l.merchant}
                        <Badge tone={kindTone(l.kind)}>{l.kind}</Badge>
                      </p>
                      <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{l.date} · {card?.name ?? "—"} •• {card?.last4 ?? "----"}{l.source ? ` · ${l.source}` : ""}</p>
                    </div>
                    <p className={cn("pmc-num pmc-display pmc-fs-135 fw-bold mb-0", isLoad ? "" : "pmc-ink")} style={isLoad ? { color: "#067647" } : undefined}>{isLoad ? "+" : "−"}{kes(Math.abs(l.amount))}</p>
                  </li>
                );
              })}
            </ul>
            <div className="d-flex flex-wrap align-items-center justify-content-between pmc-gap-2 px-4 pmc-py-25" style={{ borderTop: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.6)" }}>
              <p className="pmc-fs-115 fw-bold pmc-muted mb-0">{shown.length} event{shown.length === 1 ? "" : "s"} in view</p>
              <p className="pmc-num pmc-fs-115 fw-bold pmc-muted mb-0">Net · <span className="pmc-display pmc-fs-13 pmc-ink">{kes(totalLoaded - totalSpent)}</span></p>
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );
}

/* ============ 06 · Fees & guide ============ */

export function PrepaidFeesSection() {
  const { openModal } = useApp();
  return (
    <section id="prepaid-fees" className="pmc-scroll-mt">
      <SectionHead no="06" title="Fees & Guide" sub="Transparent prepaid pricing and how to get the most from loadable cards." />
      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-table-frame h-100">
            <div className="px-4 pmc-py-3" style={{ borderBottom: "1px solid var(--pmc-line)" }}>
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Prepaid fee schedule</p>
            </div>
            <table className="pmc-table w-100 text-start">
              <tbody>
                {PREPAID_FEES.map((f, i) => (
                  <tr key={i}>
                    <td className="pmc-px-4 pmc-py-25 fw-bold pmc-ink">{f.item}</td>
                    <td className="pmc-num pmc-px-3 pmc-py-25 pmc-display fw-bold pmc-ink">{f.amount}</td>
                    <td className="d-none d-sm-table-cell pmc-px-4 pmc-py-25 fw-semibold pmc-muted">{f.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            {[
              { icon: "users" as IconName, title: "Fund a team without exposure", copy: "Give each department a capped prepaid card instead of shared logins to the main account." },
              { icon: "spark" as IconName, title: "Gift cards that self-retire", copy: "Load once, let it spend down, and the leftover balance refunds to your wallet on retire." },
              { icon: "globe" as IconName, title: "Travel cash, ring-fenced", copy: "Pre-load a travel card so a lost card never touches your operating funds." },
            ].map((g) => (
              <div key={g.title} className="pmc-card p-4">
                <span className="pmc-icon-sq d-grid pmc-tone-green"><Icon name={g.icon} size={16} /></span>
                <p className="pmc-display pmc-mt-2 pmc-fs-135 fw-bold pmc-ink mb-0">{g.title}</p>
                <p className="pmc-mt-05 pmc-fs-115 pmc-muted mb-0" style={{ lineHeight: 1.6 }}>{g.copy}</p>
              </div>
            ))}
            <Btn icon="plus" onClick={() => openModal({ type: "prepaidIssue" })}>Issue a Prepaid Card</Btn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Modals
   ============================================================ */

/* ---- issuance preview visual ---- */

function IssuePreview({ form, use, name, load, mcc, network }: { form: PrepaidForm; use: PrepaidUse; name: string; load: number; mcc: string; network: "VISA" | "Mastercard" }) {
  const gradient =
    use === "department" ? "linear-gradient(118deg,#3b2aa8 0%,#5925dc 55%,#7a5af8 100%)"
      : use === "travel" ? "linear-gradient(118deg,#0b4ea2 0%,#175cd3 55%,#2e90fa 100%)"
      : use === "gift" ? "linear-gradient(118deg,#7a2e0e 0%,#d92d20 55%,#f79009 100%)"
      : "linear-gradient(118deg,#07633c 0%,#0b8f52 55%,#12b76a 100%)";
  const preview: PrepaidCard = {
    id: "prev", name: name || "Prepaid Card", holder: "ACME TRADERS LTD", form, use, network, last4: "••••",
    panMask: "•••• •••• •••• ••••", expiry: "08/29", status: "active", balance: load, loaded: load, spent: 0,
    monthlyLimit: load, mcc, gradient, reloadable: true, createdOn: "Today",
  };
  return <PrepaidVisual card={preview} />;
}

/* ============ Issue prepaid wizard (original 5.5 flow) ============ */

export function PrepaidIssueModal() {
  const { modal, closeModal, addPrepaid, toast, openModal } = useApp();
  const open = modal?.type === "prepaidIssue";

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PrepaidForm>("virtual");
  const [use, setUse] = useState<PrepaidUse>("gpr");
  const [name, setName] = useState("Marketing Dept");
  const [load, setLoad] = useState(5000);
  const [funding, setFunding] = useState(PREPAID_FUNDING_SOURCES[0]);
  const [monthlyLimit, setMonthlyLimit] = useState(5000);
  const [mcc, setMcc] = useState("any");
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [issued, setIssued] = useState<PrepaidCard | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1); setForm("virtual"); setUse("gpr"); setName("Marketing Dept"); setLoad(5000);
    setFunding(PREPAID_FUNDING_SOURCES[0]); setMonthlyLimit(5000); setMcc("any"); setPin(""); setPinErr(false); setIssued(null);
  }, [open]);

  useEffect(() => {
    const onUse = (e: Event) => {
      const id = (e as CustomEvent<PrepaidUse>).detail;
      const meta = PREPAID_USES.find((u) => u.id === id);
      if (!meta) return;
      setUse(id); setLoad(meta.defaultLoad); setMonthlyLimit(meta.defaultLoad);
      setName(meta.title === "Gift / One-Off Load" ? "Gift Card" : meta.title === "Travel Cash" ? "Travel Cash" : meta.title === "Department Budget" ? "Department Budget" : "Petty Cash");
    };
    window.addEventListener("pm-prepaid-use", onUse);
    return () => window.removeEventListener("pm-prepaid-use", onUse);
  }, []);

  if (!open) return null;
  const fee = PREPAID_ISSUANCE_FEE[form];
  const total = load + fee;
  const network: "VISA" | "Mastercard" = use === "department" || use === "gift" ? "VISA" : "Mastercard";

  const issue = () => {
    if (pin.length !== 4) { setPinErr(true); return; }
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const gradient =
      use === "department" ? "linear-gradient(118deg,#3b2aa8 0%,#5925dc 55%,#7a5af8 100%)"
        : use === "travel" ? "linear-gradient(118deg,#0b4ea2 0%,#175cd3 55%,#2e90fa 100%)"
        : use === "gift" ? "linear-gradient(118deg,#7a2e0e 0%,#d92d20 55%,#f79009 100%)"
        : "linear-gradient(118deg,#07633c 0%,#0b8f52 55%,#12b76a 100%)";
    const card: PrepaidCard = {
      id: `pp${Date.now()}`, name: name.trim() || "Prepaid Card", holder: "ACME TRADERS LTD", form, use, network,
      last4, panMask: `${network === "VISA" ? "4877" : "5210"} 20•• •••• ${last4}`, expiry: "08/29",
      status: "active", balance: load, loaded: load, spent: 0, monthlyLimit, mcc, gradient,
      reloadable: useMeta(use).reloadable, createdOn: "Today",
    };
    addPrepaid(card);
    setIssued(card);
    toast("success", "Prepaid card issued", `${card.name} loaded with ${kes(load)} and ready to use.`);
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="plus"
      title={issued ? "Prepaid card ready!" : "Issue a prepaid card"}
      subtitle={issued ? undefined : "Pick the type, set the initial load and controls, then authorise with your PIN."}
      width="max-w-2xl"
      footer={
        issued ? (
          <>
            <Btn variant="outline" onClick={closeModal}>Close</Btn>
            <Btn icon="wallet" onClick={() => { const id = issued.id; closeModal(); window.setTimeout(() => openModal({ type: "prepaidManage", cardId: id }), 60); }}>Manage card</Btn>
          </>
        ) : step === 1 ? (
          <>
            <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
            <Btn icon="arrowRight" onClick={() => setStep(2)}>Continue</Btn>
          </>
        ) : step === 2 ? (
          <>
            <Btn variant="outline" icon="chevLeft" onClick={() => setStep(1)}>Back</Btn>
            <Btn icon="arrowRight" disabled={name.trim().length < 2 || load < 100} onClick={() => setStep(3)}>Review</Btn>
          </>
        ) : (
          <>
            <Btn variant="outline" icon="chevLeft" onClick={() => setStep(2)}>Back</Btn>
            <Btn icon="lock" onClick={issue}>Pay {kes(total)} &amp; Issue</Btn>
          </>
        )
      }
    >
      {issued ? (
        <div className="d-flex flex-column align-items-center pmc-gap-4 py-2 text-center">
          <span className="pmc-done-icon d-grid"><Icon name="checkCircle" size={26} /></span>
          <div>
            <p className="pmc-display pmc-fs-16 fw-bold pmc-ink mb-0">Loaded and ready</p>
            <p className="pmc-mt-1 pmc-fs-125 pmc-muted mb-0" style={{ lineHeight: 1.6 }}>{kes(issued.balance)} is available now. {issued.reloadable ? "Top it up anytime it runs low." : "This card retires once the balance is spent."}</p>
          </div>
          <div className="w-100" style={{ maxWidth: 340 }}><PrepaidVisual card={issued} /></div>
        </div>
      ) : (
        <div className="d-flex flex-column pmc-gap-4">
          {/* stepper */}
          <div className="d-flex flex-wrap align-items-center justify-content-between pmc-gap-2">
            <div className="d-flex align-items-center pmc-gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="d-flex align-items-center pmc-gap-2">
                  <span className={cn("pmc-step-dot", s < step && "done", s === step && "current")}>
                    {s < step ? <Icon name="check" size={11} strokeWidth={3} /> : s}
                  </span>
                  {s < 3 && <span className="pmc-step-line" style={s < step ? { background: "var(--pmc-green)" } : undefined} />}
                </div>
              ))}
            </div>
            <span className="pmc-fs-11 fw-bold text-uppercase pmc-faint" style={{ letterSpacing: "0.1em" }}>
              Step {step} · {step === 1 ? "Card Type" : step === 2 ? "Initial Funding & Limits" : "Review & Confirm"}
            </span>
          </div>

          {/* Step 1 — form + use */}
          {step === 1 && (
            <div className="d-flex flex-column pmc-gap-4">
              <div>
                <FieldLabel>Card format</FieldLabel>
                <div className="row g-2">
                  {([["virtual", "Virtual Prepaid", "Instant · online use", "card"], ["physical", "Physical Prepaid", "Tap in-store · 2–3 days", "wallet"]] as const).map(([id, label, sub, icon]) => (
                    <div key={id} className="col-6">
                      <button type="button" onClick={() => setForm(id)} className={cn("pmc-focus pmc-choice h-100", form === id && "on")}>
                        <span className={cn("pmc-icon-sq d-grid flex-none", form === id ? "pmc-tone-green-solid" : "pmc-tone-muted")}><Icon name={icon} size={16} /></span>
                        <span>
                          <span className="d-block pmc-fs-13 fw-bold pmc-ink">{label}</span>
                          <span className="d-block pmc-mt-05 pmc-fs-11 pmc-muted">{sub}</span>
                          <span className="d-block pmc-mt-1 pmc-fs-105 fw-bold pmc-faint">Fee {kes(PREPAID_ISSUANCE_FEE[id])}</span>
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>What's it for?</FieldLabel>
                <div className="row g-2">
                  {PREPAID_USES.map((u) => (
                    <div key={u.id} className="col-12 col-sm-6">
                      <button type="button" onClick={() => { setUse(u.id); setLoad(u.defaultLoad); setMonthlyLimit(u.defaultLoad); }} className={cn("pmc-focus pmc-choice h-100", use === u.id && "on")} style={{ padding: 12 }}>
                        <span className={cn("pmc-icon-sq d-grid flex-none", use === u.id ? "pmc-tone-green-solid" : "pmc-tone-muted")} style={{ width: 32, height: 32, borderRadius: 9 }}><Icon name={u.icon} size={15} /></span>
                        <span style={{ minWidth: 0 }}>
                          <span className="d-block pmc-fs-125 fw-bold pmc-ink">{u.title}</span>
                          <span className="d-block pmc-mt-05 pmc-fs-105 pmc-muted" style={{ lineHeight: 1.35 }}>{u.sub}</span>
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — funding & limits */}
          {step === 2 && (
            <div className="row pmc-g-4">
              <div className="col-12 col-lg" style={{ minWidth: 0 }}>
                <div className="d-flex flex-column pmc-gap-4">
                  <div>
                    <FieldLabel hint={`${name.length}/24`}>Card name</FieldLabel>
                    <input
                      value={name}
                      maxLength={24}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Marketing Dept"
                      className="form-control pmc-focus pmc-display pmc-fs-13 fw-semibold pmc-ink"
                    />
                  </div>
                  <div>
                    <div className="pmc-mb-15 d-flex align-items-center justify-content-between">
                      <FieldLabel>Initial Top-up Amount (KES)</FieldLabel>
                      <span className="pmc-num pmc-display pmc-fs-15 fw-bold pmc-ink">{kes(load)}</span>
                    </div>
                    <input type="range" min={500} max={100000} step={500} value={load} onChange={(e) => setLoad(Number(e.target.value))} className="form-range w-100" aria-label="Initial top-up amount" />
                    <div className="pmc-mt-2 d-flex flex-wrap pmc-gap-2">
                      {[1000, 5000, 10000, 25000].map((v) => (
                        <button key={v} type="button" onClick={() => setLoad(v)} className={cn("pmc-focus pmc-pill-choice", load === v && "on")}>{kesShort(v)}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Funding Source</FieldLabel>
                    <div className="d-flex flex-column pmc-gap-15">
                      {PREPAID_FUNDING_SOURCES.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFunding(f)}
                          className="pmc-focus d-flex w-100 align-items-center pmc-gap-25 pmc-radius-sm pmc-px-35 pmc-py-25 text-start pmc-fs-125 fw-bold"
                          style={funding === f ? { border: "1px solid var(--pmc-green)", background: "rgba(231,248,239,0.5)", color: "var(--pmc-green-ink)" } : { border: "1px solid var(--pmc-line)", background: "#fff", color: "var(--pmc-ink-2)" }}
                        >
                          <Icon name={f.startsWith("Biz Wallet") ? "wallet" : f.startsWith("M-Pesa") ? "phone" : "building"} size={15} />
                          <span className="flex-grow-1">{f}</span>
                          {funding === f && <Icon name="check" size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="pmc-mb-15 d-flex align-items-center justify-content-between">
                      <FieldLabel>Monthly Spending Limit (Optional)</FieldLabel>
                      <span className="pmc-num pmc-display pmc-fs-13 fw-bold pmc-ink">{kes(monthlyLimit)}</span>
                    </div>
                    <input type="range" min={500} max={100000} step={500} value={monthlyLimit} onChange={(e) => setMonthlyLimit(Number(e.target.value))} className="form-range w-100" aria-label="Monthly limit" />
                  </div>
                  <div>
                    <FieldLabel>Lock card to specific Merchant Category (MCC)</FieldLabel>
                    <div className="row g-2">
                      {MCC_CATEGORIES.map((m) => (
                        <div key={m.id} className="col-12 col-sm-6">
                          <button type="button" onClick={() => setMcc(m.id)} className={cn("pmc-focus pmc-choice h-100", mcc === m.id && "on")} style={{ padding: "8px 12px" }}>
                            <Icon name={m.icon} size={14} className={cn("flex-none", mcc === m.id ? "pmc-green-ink" : "pmc-muted")} />
                            <span style={{ minWidth: 0 }}>
                              <span className="d-block text-truncate pmc-fs-115 fw-bold pmc-ink">{m.label}</span>
                              <span className="d-block text-truncate pmc-fs-95 pmc-faint">{m.sample}</span>
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-lg-auto" style={{ width: 250 }}>
                <FieldLabel>Live preview</FieldLabel>
                <IssuePreview form={form} use={use} name={name} load={load} mcc={mcc} network={network} />
                <p className="pmc-mt-2 pmc-radius-sm px-3 pmc-py-2 pmc-fs-11 pmc-muted mb-0" style={{ background: "rgba(242,244,248,0.8)", lineHeight: 1.6 }}>Balance shown is the initial load. Spending is capped at your monthly limit and locked to the chosen category.</p>
              </div>
            </div>
          )}

          {/* Step 3 — review */}
          {step === 3 && (
            <div className="d-flex flex-column pmc-gap-4">
              <div className="overflow-hidden pmc-radius" style={{ border: "1px solid var(--pmc-line)" }}>
                {[
                  ["Type", `${form === "virtual" ? "Virtual" : "Physical"} Prepaid ${network}`],
                  ["Name", name.trim()],
                  ["Use case", useMeta(use).title],
                  ["Category lock", mccLabel(mcc)],
                  ["Monthly limit", kes(monthlyLimit)],
                  ["Initial Load", kes(load)],
                  ["Issuance Fee", kes(fee)],
                ].map(([k, v]) => (
                  <div key={k} className="pmc-kv">
                    <span className="fw-semibold pmc-muted">{k}</span>
                    <span className="text-end fw-bold pmc-ink">{v}</span>
                  </div>
                ))}
                <div className="pmc-kv-total">
                  <span className="pmc-fs-125 fw-bold" style={{ color: "rgba(255,255,255,0.7)" }}>Total Deduction</span>
                  <span className="pmc-num pmc-display pmc-fs-16 fw-bold pmc-green">{kes(total)}</span>
                </div>
              </div>
              <p className="pmc-fs-11 fw-semibold pmc-muted mb-0">Debited from {funding.split("·")[0].trim()}.</p>
              <div>
                <FieldLabel hint="Authorises issuance">Enter PIN to authorize issuance</FieldLabel>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setPinErr(false); }}
                  placeholder="••••"
                  className={cn("pmc-focus pmc-pin-input", pinErr && "err pmc-shake")}
                  style={{ letterSpacing: "0.5em" }}
                />
                {pinErr && <p className="pmc-shake pmc-mt-15 d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-bold mb-0" style={{ color: "#b42318" }}><Icon name="alertTri" size={12} /> Enter your 4-digit PayMo PIN.</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ============ Top-up modal ============ */

export function TopupModal() {
  const { modal, closeModal, prepaid, topupPrepaid } = useApp();
  const open = modal?.type === "topup";
  const preId = modal?.type === "topup" ? modal.cardId : undefined;
  const eligible = prepaid.filter((p) => p.status !== "retired");
  const [cardId, setCardId] = useState<string>("");
  const [amount, setAmount] = useState(5000);
  const [source, setSource] = useState("Biz Wallet");
  const [pin, setPin] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCardId(preId ?? eligible[0]?.id ?? "");
    setAmount(5000); setSource("Biz Wallet"); setPin(""); setDone(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;
  const card = prepaid.find((p) => p.id === cardId);

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="wallet"
      title={done ? "Top-up complete" : "Top up a prepaid card"}
      subtitle={done ? undefined : "Funds are available the moment the top-up clears."}
      width="max-w-lg"
      footer={
        done ? (
          <Btn icon="check" onClick={closeModal}>Done</Btn>
        ) : (
          <>
            <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
            <Btn icon="lock" disabled={!card || amount < 100 || pin.length !== 4} onClick={() => { topupPrepaid(cardId, amount, source); setDone(true); }}>Load {kes(amount)}</Btn>
          </>
        )
      }
    >
      {done && card ? (
        <div className="d-flex flex-column align-items-center pmc-gap-3 py-4 text-center">
          <span className="pmc-done-icon d-grid"><Icon name="checkCircle" size={26} /></span>
          <p className="pmc-display pmc-fs-15 fw-bold pmc-ink mb-0">{kes(amount)} added to {card.name}</p>
          <p className="pmc-fs-125 pmc-muted mb-0" style={{ maxWidth: 300, lineHeight: 1.6 }}>The new balance is live and shown in Balances &amp; Reloads.</p>
        </div>
      ) : (
        <div className="d-flex flex-column pmc-gap-4">
          <div>
            <FieldLabel>Card to top up</FieldLabel>
            <div className="pmc-thin-scroll d-flex pmc-gap-2 overflow-auto pb-1">
              {eligible.map((p) => (
                <button key={p.id} type="button" onClick={() => setCardId(p.id)} className={cn("pmc-focus pmc-rect-choice flex-none text-start", cardId === p.id && "on")} style={{ flexDirection: "column", alignItems: "flex-start", gap: 0 }}>
                  <span className="d-block">{p.name}</span>
                  <span className="pmc-num d-block pmc-fs-105 fw-semibold pmc-faint">{kes(p.balance)} · •• {p.last4}</span>
                </button>
              ))}
            </div>
          </div>
          {card && (
            <div className="pmc-radius p-3" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}>
              <div className="mx-auto" style={{ maxWidth: 280 }}><PrepaidVisual card={card} small /></div>
            </div>
          )}
          <div>
            <FieldLabel hint="Min KES 100">Amount to load</FieldLabel>
            <div className="position-relative">
              <span className="position-absolute pmc-fs-11 fw-bold pmc-faint" style={{ left: 12, top: "50%", transform: "translateY(-50%)" }}>KES</span>
              <input
                type="number"
                min={100}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="form-control pmc-focus pmc-num pmc-display pmc-fs-16 fw-bold pmc-ink"
                style={{ paddingLeft: 44 }}
              />
            </div>
            <div className="pmc-mt-2 d-flex flex-wrap pmc-gap-2">
              {[1000, 5000, 10000, 25000].map((v) => (
                <button key={v} type="button" onClick={() => setAmount(v)} className={cn("pmc-focus pmc-pill-choice", amount === v && "on")}>{kesShort(v)}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Fund from</FieldLabel>
            <div className="d-flex flex-column pmc-gap-15">
              {["Biz Wallet", "M-Pesa Paybill 522 123", "KCB Bank •• 4471"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSource(m)}
                  className="pmc-focus d-flex w-100 align-items-center pmc-gap-25 pmc-radius-sm pmc-px-35 pmc-py-25 text-start pmc-fs-125 fw-bold"
                  style={source === m ? { border: "1px solid var(--pmc-green)", background: "rgba(231,248,239,0.5)", color: "var(--pmc-green-ink)" } : { border: "1px solid var(--pmc-line)", background: "#fff", color: "var(--pmc-ink-2)" }}
                >
                  <Icon name={m.startsWith("Biz") ? "wallet" : m.startsWith("M-Pesa") ? "phone" : "building"} size={15} />
                  <span className="flex-grow-1">{m}</span>
                  {source === m && <Icon name="check" size={14} />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel hint="Authorises the load">Enter your PayMo PIN</FieldLabel>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="pmc-focus pmc-pin-input"
              style={{ letterSpacing: "0.5em" }}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ============ Manage prepaid drawer ============ */

export function PrepaidManageDrawer() {
  const { modal, closeModal, prepaid, loads, openModal, setPrepaidStatus, updatePrepaid, retirePrepaid, toast } = useApp();
  const open = modal?.type === "prepaidManage";
  const card = prepaid.find((p) => p.id === (modal?.type === "prepaidManage" ? modal.cardId : ""));
  const [name, setName] = useState("");
  const [limit, setLimit] = useState(0);
  const [mcc, setMcc] = useState("any");
  const [reloadable, setReloadable] = useState(true);
  const [confirmRetire, setConfirmRetire] = useState(false);

  useEffect(() => {
    if (!open || !card) return;
    setName(card.name); setLimit(card.monthlyLimit); setMcc(card.mcc); setReloadable(card.reloadable); setConfirmRetire(false);
  }, [open, card?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open || !card) return null;
  const cardLoads = loads.filter((l) => l.cardId === card.id).slice(0, 5);
  const spentPct = card.loaded > 0 ? Math.round((card.spent / card.loaded) * 100) : 0;

  const save = () => {
    updatePrepaid(card.id, { name: name.trim() || card.name, monthlyLimit: limit, mcc, reloadable });
    closeModal();
  };

  return (
    <Drawer open={open} onClose={closeModal}>
      <div className="d-flex align-items-center justify-content-between px-4 pmc-py-4" style={{ borderBottom: "1px solid var(--pmc-line)" }}>
        <div>
          <p className="pmc-fs-105 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.12em" }}>Prepaid card</p>
          <h3 className="pmc-display pmc-fs-16 fw-bold pmc-ink mb-0" style={{ letterSpacing: "-0.02em" }}>{card.name}</h3>
        </div>
        <button type="button" onClick={closeModal} aria-label="Close" className="pmc-focus pmc-icon-btn pmc-icon-btn-sm border-0" style={{ background: "transparent" }}><Icon name="x" size={17} /></button>
      </div>

      <div className="pmc-thin-scroll flex-grow-1 overflow-auto px-4 pmc-py-4" style={{ paddingBottom: 112 }}>
        <PrepaidVisual card={card} />

        <div className="pmc-mt-3 d-flex flex-wrap align-items-center pmc-gap-2">
          <Badge tone={statusTone(card.status)} dot className="text-capitalize">{card.status}</Badge>
          <Badge tone="muted">{card.form === "virtual" ? "Virtual" : "Physical"}</Badge>
          <Badge tone="violet">{useMeta(card.use).title}</Badge>
        </div>

        <div className="pmc-mt-4 row g-2 pmc-radius p-3 text-center" style={{ background: "rgba(242,244,248,0.7)" }}>
          <div className="col-4"><p className="pmc-num pmc-display pmc-fs-14 fw-bold pmc-ink mb-0">{kesShort(card.balance)}</p><p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Balance</p></div>
          <div className="col-4"><p className="pmc-num pmc-display pmc-fs-14 fw-bold pmc-ink mb-0">{kesShort(card.loaded)}</p><p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Loaded</p></div>
          <div className="col-4"><p className="pmc-num pmc-display pmc-fs-14 fw-bold pmc-ink mb-0">{spentPct}%</p><p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Spent</p></div>
        </div>

        {/* quick actions */}
        <div className="pmc-mt-4 row g-2">
          {card.status !== "retired" && <div className="col-12"><Btn icon="wallet" className="w-100" onClick={() => { const id = card.id; closeModal(); window.setTimeout(() => openModal({ type: "topup", cardId: id }), 60); }}>Top Up</Btn></div>}
          <div className="col-6">
            {card.status === "active" ? (
              <Btn variant="dangerGhost" icon="snow" className="w-100" onClick={() => setPrepaidStatus(card.id, "frozen")}>Freeze</Btn>
            ) : card.status === "frozen" ? (
              <Btn icon="zap" className="w-100" onClick={() => setPrepaidStatus(card.id, "active")}>Unfreeze</Btn>
            ) : (
              <span className="d-block pmc-radius-sm px-3 pmc-py-2 text-center pmc-fs-115 fw-bold pmc-faint" style={{ background: "var(--pmc-canvas)" }}>{card.status === "depleted" ? "Balance empty" : "Retired"}</span>
            )}
          </div>
          <div className="col-6"><Btn variant="outline" icon="copy" className="w-100" onClick={() => toast("info", "Card details copied", "PAN, expiry and CVV copied securely.")}>Copy details</Btn></div>
        </div>

        {/* controls */}
        {card.status !== "retired" && (
          <div className="pmc-mt-5 d-flex flex-column pmc-gap-3">
            <div>
              <FieldLabel>Card name</FieldLabel>
              <input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} className="form-control pmc-focus" />
            </div>
            <div>
              <div className="pmc-mb-15 d-flex align-items-center justify-content-between"><FieldLabel>Monthly limit</FieldLabel><span className="pmc-num pmc-display pmc-fs-14 fw-bold pmc-ink">{kes(limit)}</span></div>
              <input type="range" min={500} max={100000} step={500} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="form-range w-100" aria-label="Monthly limit" />
            </div>
            <div>
              <FieldLabel>Category lock (MCC)</FieldLabel>
              <select value={mcc} onChange={(e) => setMcc(e.target.value)} className="form-select pmc-focus pmc-fs-125 fw-bold">
                {MCC_CATEGORIES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div className="d-flex align-items-center pmc-gap-3 pmc-radius p-3" style={{ border: "1px solid var(--pmc-line)", background: "#fff" }}>
              <span className="pmc-icon-sq d-grid flex-none pmc-tone-green"><Icon name="refresh" size={16} /></span>
              <div className="flex-grow-1" style={{ minWidth: 0 }}><p className="pmc-fs-125 fw-bold pmc-ink mb-0">Reloadable</p><p className="pmc-fs-11 pmc-muted mb-0">Allow future top-ups on this card.</p></div>
              <Toggle on={reloadable} label="Reloadable" onChange={setReloadable} />
            </div>
            <Btn icon="check" className="w-100" onClick={save}>Save controls</Btn>
          </div>
        )}

        {/* recent activity */}
        <p className="pmc-mb-2 pmc-mt-5 pmc-fs-11 fw-bold text-uppercase pmc-faint" style={{ letterSpacing: "0.12em" }}>Recent activity</p>
        {cardLoads.length === 0 ? (
          <div className="pmc-radius p-4 text-center pmc-fs-12 fw-semibold pmc-faint" style={{ border: "1px dashed var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}>No activity on this card yet.</div>
        ) : (
          <ul className="pmc-mobile-list pmc-radius overflow-hidden" style={{ border: "1px solid var(--pmc-line)", background: "#fff" }}>
            {cardLoads.map((l) => (
              <li key={l.id} className="px-3 pmc-py-25">
                <span className={cn("pmc-icon-sq d-grid flex-none", l.amount > 0 ? "pmc-tone-green" : "pmc-tone-muted")} style={{ width: 32, height: 32, borderRadius: 8 }}><Icon name={l.amount > 0 ? "upRight" : "downRight"} size={14} /></span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}><p className="text-truncate pmc-fs-125 fw-bold pmc-ink mb-0">{l.merchant}</p><p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{l.date} · {l.kind}</p></div>
                <p className={cn("pmc-num pmc-fs-125 fw-bold mb-0", l.amount > 0 ? "" : "pmc-ink")} style={l.amount > 0 ? { color: "#067647" } : undefined}>{l.amount > 0 ? "+" : "−"}{kesShort(Math.abs(l.amount))}</p>
              </li>
            ))}
          </ul>
        )}

        {/* retire */}
        {card.status !== "retired" && (
          <div className="pmc-mt-5 pmc-radius pmc-p-35" style={{ border: "1px solid rgba(240,68,56,0.25)", background: "rgba(254,228,226,0.3)" }}>
            <p className="pmc-fs-125 fw-bold mb-0" style={{ color: "#b42318" }}>Retire this card</p>
            <p className="pmc-mt-05 pmc-fs-11 mb-0" style={{ color: "rgba(180,35,24,0.8)", lineHeight: 1.6 }}>Permanently closes the card. Any remaining {kes(card.balance)} is refunded to your Biz Wallet.</p>
            {confirmRetire ? (
              <div className="pmc-mt-25 d-flex pmc-gap-2">
                <Btn size="sm" variant="danger" icon="check" onClick={() => { retirePrepaid(card.id); closeModal(); }}>Confirm retire</Btn>
                <Btn size="sm" variant="outline" onClick={() => setConfirmRetire(false)}>Cancel</Btn>
              </div>
            ) : (
              <Btn size="sm" variant="dangerGhost" icon="x" className="pmc-mt-25" onClick={() => setConfirmRetire(true)}>Retire card</Btn>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
