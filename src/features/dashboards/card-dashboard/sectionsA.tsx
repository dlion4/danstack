/* ============================================================================
 * Card Dashboard — page 5.1 sections A (Bootstrap 5 edition)
 * ----------------------------------------------------------------------------
 * 01 · Overview (hero + KPIs + attention strip) and 02 · My Cards.
 * Behavior and copy identical to the Tailwind original; markup uses Bootstrap
 * utilities + scoped .pmc-* classes.
 * ========================================================================== */

import { useEffect, useMemo, useState } from "react";
import { cn } from "./utils/cn";
import { Icon, type IconName } from "./icons";
import { Badge, Btn, Chip, Progress, Reveal, SectionHead, Spark, Empty } from "./ui";
import { useApp, scrollToId } from "./store";
import { kes, kesShort, type PmCard } from "./data";
import { CardVisual } from "./modalsA";

/* ============ 01 · Overview ============ */

export function OverviewSection() {
  const { cards, alerts, openModal, openDrawer, setPage } = useApp();

  const stats = useMemo(() => {
    const active = cards.filter((c) => c.status === "active").length;
    const spend = cards.reduce((s, c) => s + c.spentMonth, 0);
    const frozen = cards.filter((c) => c.status === "frozen").length;
    const flagged = 1;
    return { active, spend, frozen, flagged, total: cards.length };
  }, [cards]);

  const channelsOn = [alerts.push && "Push", alerts.sms && "SMS", alerts.email && "Email"].filter(Boolean);

  return (
    <section id="overview" className="pmc-scroll-mt">
      {/* Hero */}
      <Reveal>
        <div className="pmc-hero">
          <div className="pmc-hero-dots" />
          <div className="position-relative d-flex flex-wrap align-items-center pmc-gap-6">
            <div className="flex-grow-1" style={{ minWidth: 0, flexBasis: 300 }}>
              <div className="d-flex flex-wrap align-items-center pmc-gap-2">
                <span className="pmc-hero-chip d-inline-flex align-items-center pmc-gap-15 text-uppercase fw-bold" style={{ letterSpacing: "0.12em" }}>
                  <span className="pmc-live-dot" /> BAAS · Card Programme
                </span>
                <span className="pmc-hero-chip">Module 5.1</span>
              </div>
              <h1 className="pmc-hero-title pmc-mt-3">
                Card Command Center
              </h1>
              <p className="pmc-hero-sub">
                Every card Acme Traders has issued — physical, virtual, credit and prepaid — with live spend,
                alerts, controls and fraud response in one place.
              </p>
              <div className="pmc-mt-4 d-flex flex-wrap pmc-gap-2">
                <Btn icon="plus" onClick={() => openModal({ type: "issue" })}>Issue New Card</Btn>
                <Btn variant="ghost" icon="bell" onClick={() => openModal({ type: "alerts" })}>
                  Configure Alerts {channelsOn.length > 0 && (
                    <span className="d-inline-block" style={{ borderRadius: 99, background: "rgba(255,255,255,0.15)", padding: "1px 6px", fontSize: 10 }}>
                      {channelsOn.join(" · ")}
                    </span>
                  )}
                </Btn>
                <Btn variant="ghost" icon="card" onClick={() => setPage("5.2")}>Physical Cards →</Btn>
                <Btn variant="ghost" icon="zap" onClick={() => setPage("5.4")}>Credit Cards →</Btn>
                <Btn variant="ghost" icon="wallet" onClick={() => setPage("5.5")}>Prepaid →</Btn>
                <Btn variant="ghost" icon="users" onClick={() => setPage("5.6")}>Corporate →</Btn>
                <Btn variant="ghost" icon="shield" onClick={() => setPage("5.7")}>Security →</Btn>
                <Btn variant="ghost" icon="chart" onClick={() => setPage("5.8")}>Analytics →</Btn>
                <Btn variant="ghost" icon="building" onClick={() => setPage("5.9")}>Admin →</Btn>
                <Btn variant="ghost" icon="sliders" onClick={() => setPage("5.10")}>Settings →</Btn>
              </div>
              <div className="pmc-hero-stats">
                {[
                  { k: "Active cards", v: String(stats.active) },
                  { k: "MTD spend", v: kesShort(stats.spend) },
                  { k: "Alerts · 30d", v: "148" },
                  { k: "Fraud flags", v: String(stats.flagged), warn: true },
                ].map((s) => (
                  <div key={s.k} className="lh-sm">
                    <p className={cn("pmc-hero-stat-value", s.warn && "pmc-warn-hero")}>{s.v}</p>
                    <p className="pmc-hero-stat-label">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pmc-hero-art">
              <div className="pmc-hero-card-a">
                {cards[0] && <CardVisual card={cards[0]} />}
              </div>
              <div className="pmc-hero-card-b">
                {cards[2] && <CardVisual card={cards[2]} />}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* KPI cards */}
      <div className="row pmc-g-3 pmc-mt-4">
        {[
          {
            icon: "wallet" as IconName,
            tone: "pmc-tone-green",
            label: "MTD Card Spend",
            value: kes(stats.spend),
            delta: "+8.4%",
            dir: "up",
            spark: [18, 22, 19, 26, 31, 28, 34, 38, 36, 41],
            note: "vs KES " + Math.round(stats.spend / 1.084).toLocaleString() + " last month",
          },
          {
            icon: "card" as IconName,
            tone: "pmc-tone-blue",
            label: "Active Cards",
            value: `${stats.active} / ${stats.total}`,
            delta: "+2",
            dir: "up",
            spark: [4, 4, 5, 5, 5, 6, 6, 6, 7, 7],
            note: stats.frozen > 0 ? `${stats.frozen} frozen · 1 in delivery` : "1 card in delivery",
          },
          {
            icon: "bell" as IconName,
            tone: "pmc-tone-violet",
            label: "Alerts Sent · 30d",
            value: "148",
            delta: "+12%",
            dir: "up",
            spark: [6, 9, 7, 11, 10, 13, 12, 15, 14, 17],
            note: `via ${channelsOn.length ? channelsOn.join(", ") : "no channels!"}`,
            warnNote: channelsOn.length === 0,
          },
          {
            icon: "shield" as IconName,
            tone: "pmc-tone-warn",
            label: "Fraud Flags",
            value: String(stats.flagged),
            delta: "needs review",
            dir: "flat",
            spark: [1, 0, 0, 1, 0, 0, 0, 1, 2, 1],
            sparkStroke: "#f79009",
            note: "CNP spike · Eastern Europe",
            onClick: () => scrollToId("security"),
          },
        ].map((k, i) => (
          <div key={k.label} className="col-12 col-sm-6 col-xl-3">
            <Reveal delay={i * 70} className="h-100">
              <button
                type="button"
                onClick={k.onClick}
                className={cn("pmc-card pmc-stat pmc-focus h-100", k.onClick ? "pmc-lift" : undefined)}
                style={k.onClick ? undefined : { cursor: "default" }}
              >
                <div className="d-flex align-items-start justify-content-between">
                  <span className={cn("pmc-stat-icon d-grid", k.tone)}>
                    <Icon name={k.icon} size={19} />
                  </span>
                  <Spark points={k.spark} stroke={k.sparkStroke ?? "#12b76a"} />
                </div>
                <p className="pmc-stat-label">{k.label}</p>
                <p className="pmc-stat-value">{k.value}</p>
                <div className="pmc-mt-2 d-flex align-items-center pmc-gap-2">
                  <span
                    className="d-inline-flex align-items-center pmc-gap-05 pmc-fs-11 fw-bold"
                    style={{
                      borderRadius: 99,
                      padding: "2px 8px",
                      background: k.dir === "up" ? "var(--pmc-green-soft)" : "var(--pmc-warn-soft)",
                      color: k.dir === "up" ? "var(--pmc-green-ink)" : "var(--pmc-warn-ink)",
                    }}
                  >
                    {k.dir === "up" && <Icon name="upRight" size={11} />}
                    {k.delta}
                  </span>
                  <span className={cn("pmc-fs-11 fw-semibold pmc-faint", k.warnNote && "fw-bold pmc-danger-ink")}>{k.note}</span>
                </div>
              </button>
            </Reveal>
          </div>
        ))}
      </div>

      {/* Needs attention strip */}
      <Reveal delay={120}>
        <div className="row pmc-g-3 pmc-mt-4">
          <div className="col-12 col-lg-4">
            <button
              type="button"
              onClick={() => scrollToId("security")}
              className="pmc-lift pmc-focus d-flex align-items-center pmc-gap-3 pmc-radius p-4 w-100 text-start"
              style={{ border: "1px solid rgba(247,144,9,0.35)", background: "rgba(254,240,199,0.5)" }}
            >
              <span className="pmc-icon-sq-lg d-grid" style={{ background: "rgba(247,144,9,0.15)", color: "var(--pmc-warn-ink)" }}>
                <Icon name="alertTri" size={18} />
              </span>
              <span className="flex-grow-1" style={{ minWidth: 0 }}>
                <span className="d-block pmc-fs-13 fw-bold pmc-warn-ink">CNP fraud spike detected</span>
                <span className="d-block pmc-fs-115 fw-semibold" style={{ color: "rgba(147,55,13,0.7)" }}>Online attempts up 400% in 6h — review 2 flagged transactions</span>
              </span>
              <Icon name="arrowRight" size={16} className="pmc-warn-ink" />
            </button>
          </div>
          <div className="col-12 col-lg-4">
            <button
              type="button"
              onClick={() => openDrawer({ type: "card", cardId: "c7" })}
              className="pmc-card pmc-lift pmc-focus d-flex align-items-center pmc-gap-3 p-4 w-100 text-start"
            >
              <span className="pmc-icon-sq-lg d-grid pmc-tone-blue"><Icon name="clock" size={18} /></span>
              <span className="flex-grow-1" style={{ minWidth: 0 }}>
                <span className="d-block pmc-fs-13 fw-bold pmc-ink">1 card in delivery</span>
                <span className="d-block pmc-fs-115 fw-semibold pmc-muted">Sales Team Card ·• 2214 — Fargo Courier, ETA 2 days</span>
              </span>
              <Icon name="arrowRight" size={16} className="pmc-faint" />
            </button>
          </div>
          <div className="col-12 col-lg-4">
            <button
              type="button"
              onClick={() => scrollToId("program")}
              className="pmc-card pmc-lift pmc-focus d-flex align-items-center pmc-gap-3 p-4 w-100 text-start"
            >
              <span className="pmc-icon-sq-lg d-grid pmc-tone-muted"><Icon name="refresh" size={18} /></span>
              <span className="flex-grow-1" style={{ minWidth: 0 }}>
                <span className="d-block pmc-fs-13 fw-bold pmc-ink">KYC/AML oracle degraded</span>
                <span className="d-block pmc-fs-115 fw-semibold pmc-muted">1.2s delay on checks — issuance unaffected</span>
              </span>
              <Icon name="arrowRight" size={16} className="pmc-faint" />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 02 · My Cards ============ */

const FILTERS = [
  { id: "all", label: "All" },
  { id: "physical", label: "Physical" },
  { id: "virtual", label: "Virtual" },
  { id: "credit", label: "Credit" },
  { id: "prepaid", label: "Prepaid" },
  { id: "corporate", label: "Corporate" },
];

function matchFilter(c: PmCard, f: string) {
  if (f === "all") return true;
  if (f === "physical" || f === "virtual") return c.kind === f;
  return c.tier === f;
}

export function CardsSection() {
  const { cards, openModal, openDrawer, setCardStatus, toast, pushNotif } = useApp();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const onFilter = (e: Event) => {
      const f = (e as CustomEvent).detail as string;
      if (FILTERS.some((x) => x.id === f)) setFilter(f);
    };
    window.addEventListener("pm-card-filter", onFilter);
    return () => window.removeEventListener("pm-card-filter", onFilter);
  }, []);

  const shown = cards.filter((c) => matchFilter(c, filter));
  const countFor = (f: string) => cards.filter((c) => matchFilter(c, f)).length;

  return (
    <section id="cards" className="pmc-scroll-mt">
      <SectionHead
        no="02"
        title="My Cards"
        sub="Tap any card for the full control drawer — freeze, limits, PIN and activity live there."
      >
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "issue" })}>Issue Card</Btn>
      </SectionHead>

      <div className="pmc-thin-scroll pmc-mb-4 d-flex pmc-gap-2 overflow-auto pb-1">
        {FILTERS.map((f) => (
          <Chip key={f.id} on={filter === f.id} onClick={() => setFilter(f.id)} count={countFor(f.id)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty
          icon="card"
          title={`No ${filter} cards yet`}
          sub="Issue one in under a minute — virtual cards are live instantly."
          action={<Btn size="sm" icon="plus" onClick={() => openModal({ type: "issue" })}>Issue a {filter} card</Btn>}
        />
      ) : (
        <div className="row pmc-g-4">
          {shown.map((c, i) => {
            const usage = Math.round((c.spentMonth / c.limitMonth) * 100);
            return (
              <div key={c.id} className="col-12 col-sm-6 col-xl-4">
                <Reveal delay={(i % 3) * 70} className="h-100">
                  <div className="pmc-card pmc-lift-lg pmc-p-35 h-100">
                    <button type="button" onClick={() => openDrawer({ type: "card", cardId: c.id })} className="pmc-card-hover d-block w-100 text-start pmc-focus" style={{ background: "none", border: "none", padding: 0 }} aria-label={`Open ${c.nickname} details`}>
                      <CardVisual card={c} />
                    </button>

                    <div className="pmc-mt-3 d-flex align-items-start justify-content-between pmc-gap-2">
                      <div style={{ minWidth: 0 }}>
                        <p className="d-flex align-items-center pmc-gap-15 pmc-truncate pmc-fs-135 fw-bold pmc-ink mb-0">
                          {c.nickname}
                          {c.tag && <Badge tone={c.status === "delivering" ? "warning" : "success"}>{c.tag}</Badge>}
                        </p>
                        <p className="pmc-fs-11 fw-semibold pmc-faint mb-0">{c.holder.toLowerCase()} · •• {c.last4}</p>
                      </div>
                      <Badge tone={c.status === "active" ? "success" : c.status === "frozen" ? "info" : c.status === "delivering" ? "warning" : "danger"} dot className="text-capitalize">
                        {c.status}
                      </Badge>
                    </div>

                    <div className="pmc-mt-25">
                      <div className="pmc-mb-1 d-flex justify-content-between pmc-fs-105 fw-bold pmc-faint">
                        <span className="pmc-num">{kesShort(c.spentMonth)} spent</span>
                        <span className="pmc-num">{usage}% of {kesShort(c.limitMonth)}</span>
                      </div>
                      <Progress value={usage} tone={usage > 85 ? "red" : usage > 60 ? "amber" : "green"} />
                    </div>

                    <div className="pmc-mt-3 d-flex align-items-center pmc-gap-15 pt-3" style={{ borderTop: "1px solid rgba(230,233,240,0.7)" }}>
                      {c.status === "frozen" ? (
                        <Btn
                          size="sm"
                          icon="zap"
                          className="flex-grow-1"
                          onClick={() => {
                            setCardStatus(c.id, "active");
                            toast("success", `${c.nickname} unfrozen`);
                            pushNotif({ channel: "push", title: "Card unfrozen", body: `${c.nickname} •• ${c.last4} is active again.` });
                          }}
                        >
                          Unfreeze
                        </Btn>
                      ) : c.status === "active" ? (
                        <Btn size="sm" variant="dangerGhost" icon="snow" className="flex-grow-1" onClick={() => openModal({ type: "freeze", cardId: c.id })}>
                          Freeze
                        </Btn>
                      ) : (
                        <span className="flex-grow-1 pmc-radius-sm pmc-px-3 pmc-py-15 text-center pmc-fs-115 fw-bold pmc-faint" style={{ background: "var(--pmc-canvas)" }}>
                          {c.status === "blocked" ? "Permanently blocked" : "Awaiting delivery"}
                        </span>
                      )}
                      <button type="button" onClick={() => openModal({ type: "alerts", cardId: c.id })} title="Configure alerts for this card" aria-label={`Configure alerts for ${c.nickname}`} className="pmc-icon-btn pmc-icon-btn-sm pmc-focus">
                        <Icon name="bell" size={14} />
                      </button>
                      <button type="button" onClick={() => openModal({ type: "limits", cardId: c.id })} title="Limits & controls" aria-label={`Limits and controls for ${c.nickname}`} className="pmc-icon-btn pmc-icon-btn-sm pmc-focus">
                        <Icon name="sliders" size={14} />
                      </button>
                      <button type="button" onClick={() => openDrawer({ type: "card", cardId: c.id })} title="Card details" aria-label={`Open ${c.nickname} details`} className="pmc-icon-btn pmc-icon-btn-sm pmc-focus">
                        <Icon name="chevRight" size={14} />
                      </button>
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
