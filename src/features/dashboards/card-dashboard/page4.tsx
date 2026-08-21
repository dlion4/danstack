/* ============================================================================
 * Card Dashboard — page 5.4 · Virtual Credit Cards (Bootstrap 5 edition)
 * ========================================================================== */

import { useEffect, useState } from "react";
import { cn } from "./utils/cn";
import { Icon, type IconName } from "./icons";
import { Badge, Btn, Chip, Drawer, FieldLabel, Modal, Progress, Reveal, SectionHead, Spark, Toggle, Empty } from "./ui";
import { useApp } from "./store";
import { CardVisual } from "./modalsA";
import {
  COLOR_THEMES,
  CREDIT_FEES,
  CREDIT_FUNDING_SOURCES,
  CREDIT_PURPOSES,
  SEED_STATEMENTS,
  UTILISATION_TREND,
  kes,
  kesShort,
  type ColorTheme,
  type CreditPurpose,
  type PmCard,
} from "./data";

/* helpers */

function isCreditCard(card: PmCard) {
  return card.kind === "virtual" && card.tier === "credit";
}

function purposeOf(card: PmCard): CreditPurpose {
  if (card.singleUse || card.tier === "single-use") return "single-use";
  if (card.merchantLock && card.merchantLock !== "Open merchants") return "subscription";
  return "multi-use";
}

const purposeMeta = (p: CreditPurpose) => CREDIT_PURPOSES.find((c) => c.id === p) ?? CREDIT_PURPOSES[2];

/* ============ 01 · Credit Center overview ============ */

export function CreditOverview() {
  const { cards, creditLine, openModal, setPage, repayments } = useApp();
  const creditCards = cards.filter(isCreditCard);
  const available = creditLine.approved - creditLine.outstanding - creditLine.pendingAuth;
  const utilisation = Math.round(((creditLine.outstanding + creditLine.pendingAuth) / creditLine.approved) * 100);
  const paidThisYear = repayments.reduce((s, r) => s + r.amount, 0);

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
                <span className="pmc-hero-chip">Module 5.4</span>
              </div>
              <h1 className="pmc-hero-title pmc-mt-3">
                Virtual Credit<br className="d-none d-sm-inline" /> Card Center
              </h1>
              <p className="pmc-hero-sub" style={{ maxWidth: 500 }}>
                Issue single-use, subscription-locked or multi-use credit cards against one revolving business line.
                Every card carries its own ceiling, colour and expiry.
              </p>
              <div className="pmc-mt-4 d-flex flex-wrap pmc-gap-2">
                <Btn icon="plus" onClick={() => openModal({ type: "creditIssue" })}>Issue Credit Card</Btn>
                <Btn variant="ghost" icon="wallet" onClick={() => openModal({ type: "repay" })}>Make a Payment</Btn>
                <Btn variant="ghost" icon="chart" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="pmc-hero-stats">
                {[
                  { k: "Approved line", v: kesShort(creditLine.approved) },
                  { k: "Available now", v: kesShort(available) },
                  { k: "Utilisation", v: `${utilisation}%` },
                  { k: "Cards on line", v: String(creditCards.length) },
                ].map((s) => (
                  <div key={s.k} className="lh-sm">
                    <p className="pmc-hero-stat-value">{s.v}</p>
                    <p className="pmc-hero-stat-label">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pmc-hero-art" style={{ height: 230 }}>
              <div className="position-absolute" style={{ right: 0, top: 0, width: 245, transform: "rotate(6deg)" }}>
                {creditCards[0] && <CardVisual card={creditCards[0]} />}
              </div>
              <div className="position-absolute" style={{ bottom: 0, left: 4, width: 245, transform: "rotate(-4deg)" }}>
                {creditCards[1] && <CardVisual card={creditCards[1]} />}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="row pmc-g-3 pmc-mt-4">
        {[
          {
            icon: "wallet" as IconName,
            tone: "pmc-tone-green",
            label: "Available Credit",
            value: kes(available),
            note: `of ${kesShort(creditLine.approved)} approved`,
            spark: [88, 86, 84, 82, 80, 78, 76, 74],
            stroke: "#12b76a",
          },
          {
            icon: "chart" as IconName,
            tone: "pmc-tone-blue",
            label: "Outstanding Balance",
            value: kes(creditLine.outstanding),
            note: `+ ${kesShort(creditLine.pendingAuth)} pending auth`,
            spark: [22, 26, 31, 28, 34, 38, 42, 45],
            stroke: "#2e90fa",
          },
          {
            icon: "clock" as IconName,
            tone: "pmc-tone-warn",
            label: "Payment Due",
            value: kes(creditLine.minimumDue),
            note: `Minimum · by ${creditLine.dueDate}`,
            spark: [10, 10, 12, 12, 14, 14, 16, 16],
            stroke: "#f79009",
            action: () => openModal({ type: "repay" }),
          },
          {
            icon: "refresh" as IconName,
            tone: "pmc-tone-violet",
            label: "Repaid · Last 3 Cycles",
            value: kesShort(paidThisYear),
            note: creditLine.autoDebit ? "Auto-debit active" : "Manual settlement",
            spark: [39, 49, 62, 45, 52, 60, 58, 62],
            stroke: "#7a5af8",
          },
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
                  <span className={cn("pmc-stat-icon d-grid", k.tone)}>
                    <Icon name={k.icon} size={19} />
                  </span>
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
    </section>
  );
}

/* ============ 02 · Credit line & statement ============ */

export function CreditLineSection() {
  const { creditLine, cards, openModal, setAutoDebit } = useApp();
  const available = creditLine.approved - creditLine.outstanding - creditLine.pendingAuth;
  const utilisation = Math.round(((creditLine.outstanding + creditLine.pendingAuth) / creditLine.approved) * 100);
  const openStatement = SEED_STATEMENTS.find((s) => s.status === "Open");

  const cycleDay = 21;
  const cycleProgress = Math.min(100, Math.round((cycleDay / 30) * 100));

  return (
    <section id="credit-line" className="pmc-scroll-mt">
      <SectionHead no="02" title="Credit Line & Statement" sub="One revolving line behind every virtual credit card. Statement closes monthly.">
        <Btn size="sm" variant="outline" icon="inbox" onClick={() => openModal({ type: "statement" })}>All statements</Btn>
        <Btn size="sm" icon="wallet" onClick={() => openModal({ type: "repay" })}>Make a Payment</Btn>
      </SectionHead>

      <div className="row pmc-g-3">
        {/* Limit gauge */}
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-card pmc-p-5 h-100">
            <div className="d-flex flex-wrap align-items-start justify-content-between pmc-gap-3">
              <div>
                <p className="pmc-fs-11 fw-bold text-uppercase pmc-muted mb-0" style={{ letterSpacing: "0.08em" }}>Biz Credit Line</p>
                <p className="pmc-num pmc-display pmc-mt-1 pmc-fs-26 fw-bold pmc-ls-tight pmc-ink mb-0" style={{ lineHeight: 1 }}>{kes(creditLine.approved)}</p>
                <p className="pmc-mt-15 pmc-fs-115 fw-semibold pmc-faint mb-0">Visa &amp; Mastercard revolving · {creditLine.apr}% p.m. on carried balance</p>
              </div>
              <Badge tone={utilisation > 60 ? "warning" : "success"} dot>
                {utilisation}% utilised
              </Badge>
            </div>

            <div className="pmc-mt-4">
              <Progress value={utilisation} tone={utilisation > 80 ? "red" : utilisation > 50 ? "amber" : "green"} className="pmc-progress-lg" />
              <div className="pmc-mt-2 row pmc-g-2 text-center">
                {[
                  { k: "Outstanding", v: kesShort(creditLine.outstanding), cls: "pmc-ink" },
                  { k: "Pending auth", v: kesShort(creditLine.pendingAuth), cls: "pmc-warn-ink" },
                  { k: "Available", v: kesShort(available), cls: "pmc-green-ink" },
                ].map((s) => (
                  <div key={s.k} className="col-4">
                    <div className="pmc-radius-sm pmc-p-25 h-100" style={{ background: "rgba(242,244,248,0.7)" }}>
                      <p className={cn("pmc-num pmc-display pmc-fs-14 fw-bold mb-0", s.cls)}>{s.v}</p>
                      <p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>{s.k}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing cycle */}
            <div className="pmc-mt-4 pmc-radius pmc-p-35" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}>
              <div className="d-flex flex-wrap align-items-center justify-content-between pmc-gap-2">
                <p className="d-flex align-items-center pmc-gap-15 pmc-fs-12 fw-bold pmc-ink mb-0">
                  <Icon name="clock" size={13} className="pmc-muted" /> Current cycle
                </p>
                <p className="pmc-fs-115 fw-semibold pmc-muted mb-0">{creditLine.cycleStart} – {creditLine.cycleEnd}</p>
              </div>
              <Progress className="pmc-mt-25" value={cycleProgress} tone="violet" />
              <p className="pmc-mt-15 pmc-fs-11 fw-semibold pmc-faint mb-0">{30 - cycleDay} days until this cycle closes and the statement is issued.</p>
            </div>

            <div className="pmc-mt-3 d-flex flex-wrap align-items-center pmc-gap-3 pmc-radius pmc-p-35" style={{ border: "1px solid rgba(18,183,106,0.3)", background: "rgba(231,248,239,0.4)" }}>
              <span className="pmc-icon-sq-lg d-grid pmc-green-ink" style={{ background: "#fff", boxShadow: "0 1px 2px rgba(16,24,40,0.06)" }}>
                <Icon name="wallet" size={17} />
              </span>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <p className="pmc-fs-125 fw-bold pmc-ink mb-0">Minimum due {kes(creditLine.minimumDue)}</p>
                <p className="pmc-fs-11 fw-semibold pmc-muted mb-0">Due {creditLine.dueDate} · settle in full to avoid {creditLine.apr}% interest</p>
              </div>
              <Btn size="sm" icon="arrowRight" onClick={() => openModal({ type: "repay" })}>Pay now</Btn>
            </div>
          </div>
        </Reveal>

        {/* Statement summary + auto debit */}
        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-card p-4">
              <div className="d-flex align-items-center justify-content-between">
                <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Open statement</p>
                <Badge tone="warning" dot>Open</Badge>
              </div>
              <p className="pmc-mt-1 pmc-fs-115 fw-semibold pmc-faint mb-0">{openStatement?.period}</p>
              <div className="pmc-mt-3 d-flex flex-column pmc-gap-2">
                {[
                  ["Spend this cycle", kes(creditLine.outstanding)],
                  ["Paid", kes(openStatement?.paid ?? 0)],
                  ["Interest", creditLine.outstanding > 0 ? `${creditLine.apr}% if carried` : "None"],
                ].map(([k, v]) => (
                  <div key={k} className="d-flex align-items-center justify-content-between pmc-fs-12">
                    <span className="fw-semibold pmc-muted">{k}</span>
                    <span className="pmc-num fw-bold pmc-ink">{v}</span>
                  </div>
                ))}
              </div>
              <Btn size="sm" variant="outline" icon="download" className="pmc-mt-3 w-100" onClick={() => openModal({ type: "statement" })}>
                View statement
              </Btn>
            </div>

            <div className="pmc-card flex-grow-1 p-4">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Auto-debit settlement</p>
              <div
                className="pmc-mt-3 d-flex align-items-center pmc-gap-3 pmc-radius p-3"
                style={creditLine.autoDebit ? { border: "1px solid rgba(18,183,106,0.4)", background: "rgba(231,248,239,0.4)" } : { border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}
              >
                <span className={cn("pmc-icon-sq d-grid", creditLine.autoDebit ? "pmc-green-ink" : "pmc-faint")} style={{ background: "#fff", boxShadow: creditLine.autoDebit ? "0 1px 2px rgba(16,24,40,0.06)" : undefined }}>
                  <Icon name="refresh" size={16} />
                </span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <p className="pmc-fs-125 fw-bold pmc-ink mb-0">Debit minimum on due date</p>
                  <p className="pmc-fs-11 pmc-muted mb-0">From KCB Bank •• 4471 on {creditLine.dueDate}</p>
                </div>
                <Toggle on={creditLine.autoDebit} label="Auto-debit settlement" onChange={setAutoDebit} />
              </div>
              <div className="pmc-mt-3 row pmc-g-2 text-center">
                <div className="col-6">
                  <div className="pmc-radius-sm pmc-p-25" style={{ background: "rgba(242,244,248,0.7)" }}>
                    <p className="pmc-num pmc-display pmc-fs-14 fw-bold pmc-ink mb-0">{cards.filter(isCreditCard).length}</p>
                    <p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Cards on line</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="pmc-radius-sm pmc-p-25" style={{ background: "rgba(242,244,248,0.7)" }}>
                    <p className="pmc-num pmc-display pmc-fs-14 fw-bold pmc-ink mb-0">{SEED_STATEMENTS.length}</p>
                    <p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Statements</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 03 · Virtual credit cards grid ============ */

type CreditFilter = "all" | "single-use" | "subscription" | "multi-use";

export function CreditCardsSection() {
  const { cards, openModal, setCardStatus, toast } = useApp();
  const [filter, setFilter] = useState<CreditFilter>("all");
  const [query, setQuery] = useState("");

  const creditCards = cards.filter(isCreditCard);
  const shown = creditCards.filter((c) => {
    if (filter !== "all" && purposeOf(c) !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || `${c.nickname} ${c.holder} ${c.merchantLock ?? ""} ${c.purpose ?? ""}`.toLowerCase().includes(q);
  });
  const count = (f: CreditFilter) => (f === "all" ? creditCards.length : creditCards.filter((c) => purposeOf(c) === f).length);

  return (
    <section id="credit-cards" className="pmc-scroll-mt">
      <SectionHead no="03" title="Virtual Credit Cards" sub="Each card draws from the same line but carries its own ceiling, lock and colour.">
        <div className="position-relative">
          <Icon name="search" size={14} className="position-absolute pmc-faint" style={{ left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a credit card…"
            className="pmc-focus pmc-radius-sm pmc-fs-125 fw-semibold pmc-ink"
            style={{ width: 190, border: "1px solid var(--pmc-line)", background: "#fff", padding: "8px 12px 8px 36px", outline: "none" }}
          />
        </div>
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "creditIssue" })}>Issue Card</Btn>
      </SectionHead>

      <div className="pmc-thin-scroll pmc-mb-4 d-flex pmc-gap-2 overflow-auto pb-1">
        {(["all", "single-use", "subscription", "multi-use"] as CreditFilter[]).map((f) => (
          <Chip key={f} on={filter === f} onClick={() => setFilter(f)} count={count(f)}>
            {f === "all" ? "All cards" : purposeMeta(f).title}
          </Chip>
        ))}
      </div>

      {/* Quick purpose launchers */}
      <div className="row g-2 pmc-mb-4">
        {CREDIT_PURPOSES.map((p, i) => (
          <div key={p.id} className="col-12 col-sm-4">
            <Reveal delay={i * 60} className="h-100">
              <button
                type="button"
                onClick={() => {
                  openModal({ type: "creditIssue" });
                  window.setTimeout(() => window.dispatchEvent(new CustomEvent("pm-credit-purpose", { detail: p.id })), 40);
                }}
                className="pmc-card pmc-lift pmc-focus d-flex w-100 align-items-center pmc-gap-3 p-3 text-start h-100"
              >
                <span className="pmc-icon-sq d-grid pmc-tone-green">
                  <Icon name={p.icon} size={16} />
                </span>
                <span className="flex-grow-1" style={{ minWidth: 0 }}>
                  <span className="d-block pmc-fs-125 fw-bold pmc-ink">{p.title}</span>
                  <span className="d-block pmc-truncate pmc-fs-105 fw-semibold pmc-faint">{p.sub}</span>
                </span>
                <Icon name="plus" size={14} className="flex-none pmc-faint" />
              </button>
            </Reveal>
          </div>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty
          icon="card"
          title="No credit cards match"
          sub="Try another filter, or issue a single-use, subscription or multi-use credit card."
          action={<Btn size="sm" icon="plus" onClick={() => openModal({ type: "creditIssue" })}>Issue Credit Card</Btn>}
        />
      ) : (
        <div className="row pmc-g-4">
          {shown.map((card, i) => {
            const usage = Math.round((card.spentMonth / card.limitMonth) * 100);
            const meta = purposeMeta(purposeOf(card));
            const locked = card.merchantLock && card.merchantLock !== "Open merchants";
            return (
              <div key={card.id} className="col-12 col-sm-6 col-xl-4">
                <Reveal delay={(i % 3) * 70} className="h-100">
                  <div className="pmc-card pmc-lift-lg pmc-p-35 h-100">
                    <button type="button" onClick={() => openModal({ type: "creditDetails", cardId: card.id })} className="pmc-card-hover d-block w-100 text-start pmc-focus" style={{ background: "none", border: "none", padding: 0 }} aria-label={`Manage ${card.nickname}`}>
                      <CardVisual card={card} />
                    </button>
                    <div className="pmc-mt-3 d-flex align-items-start justify-content-between pmc-gap-2">
                      <div style={{ minWidth: 0 }}>
                        <p className="pmc-truncate pmc-fs-135 fw-bold pmc-ink mb-0">{card.nickname}</p>
                        <p className="pmc-fs-11 fw-semibold pmc-faint mb-0">{card.holder.toLowerCase()} · •• {card.last4}</p>
                      </div>
                      <Badge tone={card.status === "active" ? "success" : card.status === "frozen" ? "info" : "danger"} dot className="text-capitalize">{card.status}</Badge>
                    </div>
                    <div className="pmc-mt-2 d-flex flex-wrap pmc-gap-15">
                      <Badge tone="violet">{meta.title}</Badge>
                      {locked && <Badge tone="success"><Icon name="lock" size={10} /> {card.merchantLock}</Badge>}
                      {card.requires3ds && <Badge tone="muted">3DS</Badge>}
                    </div>
                    <div className="pmc-mt-25">
                      <div className="pmc-mb-1 d-flex justify-content-between pmc-fs-105 fw-bold pmc-faint">
                        <span className="pmc-num">{kesShort(card.spentMonth)} drawn</span>
                        <span className="pmc-num">{usage}% of {kesShort(card.limitMonth)}</span>
                      </div>
                      <Progress value={usage} tone={usage > 85 ? "red" : usage > 60 ? "amber" : "green"} />
                    </div>
                    <div className="pmc-mt-3 d-flex align-items-center pmc-gap-15 pt-3" style={{ borderTop: "1px solid rgba(230,233,240,0.7)" }}>
                      {card.status === "active" ? (
                        <Btn size="sm" variant="dangerGhost" icon="snow" className="flex-grow-1" onClick={() => { setCardStatus(card.id, "frozen"); toast("warn", `${card.nickname} frozen`, "New authorisations will decline until unfrozen."); }}>Freeze</Btn>
                      ) : (
                        <Btn size="sm" icon="zap" className="flex-grow-1" onClick={() => { setCardStatus(card.id, "active"); toast("success", `${card.nickname} reactivated`); }}>Unfreeze</Btn>
                      )}
                      <button type="button" onClick={() => openModal({ type: "creditDetails", cardId: card.id })} title="Secure details" aria-label={`Secure details for ${card.nickname}`} className="pmc-icon-btn pmc-icon-btn-sm pmc-focus"><Icon name="eye" size={14} /></button>
                      <button type="button" onClick={() => openModal({ type: "limits", cardId: card.id })} title="Limits" aria-label={`Limits for ${card.nickname}`} className="pmc-icon-btn pmc-icon-btn-sm pmc-focus"><Icon name="sliders" size={14} /></button>
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

/* ============ 04 · Repayment & billing history ============ */

export function RepaymentSection() {
  const { repayments, creditLine, openModal, toast } = useApp();

  return (
    <section id="repayment" className="pmc-scroll-mt">
      <SectionHead no="04" title="Repayment & Billing" sub="Every shilling repaid against the line, with method and reference for reconciliation.">
        <Btn size="sm" variant="outline" icon="inbox" onClick={() => openModal({ type: "statement" })}>Statements</Btn>
        <Btn size="sm" icon="wallet" onClick={() => openModal({ type: "repay" })}>Make a Payment</Btn>
      </SectionHead>

      <Reveal>
        <div className="pmc-table-frame">
          <div className="table-responsive d-none d-md-block">
            <table className="table pmc-table w-100 text-start align-middle">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Type</th>
                  <th scope="col">Method</th>
                  <th scope="col">Reference</th>
                  <th scope="col" className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {repayments.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-bold pmc-ink">{r.date}</td>
                    <td><Badge tone={r.type === "Auto-debit" ? "info" : r.type === "Wallet" ? "violet" : "muted"}>{r.type}</Badge></td>
                    <td className="fw-semibold pmc-muted">{r.method}</td>
                    <td className="pmc-num fw-semibold pmc-faint">{r.ref}</td>
                    <td className="pmc-num text-end pmc-display fw-bold pmc-green-ink">+{kes(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="pmc-mobile-list d-md-none">
            {repayments.map((r) => (
              <li key={r.id}>
                <span className="pmc-icon-sq d-grid pmc-tone-green"><Icon name="checkCircle" size={15} /></span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <p className="pmc-fs-13 fw-bold pmc-ink mb-0">{r.date}</p>
                  <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{r.method} · {r.ref}</p>
                  <div className="pmc-mt-1"><Badge tone={r.type === "Auto-debit" ? "info" : r.type === "Wallet" ? "violet" : "muted"}>{r.type}</Badge></div>
                </div>
                <p className="pmc-num pmc-display pmc-fs-135 fw-bold pmc-green-ink mb-0">+{kesShort(r.amount)}</p>
              </li>
            ))}
          </ul>
          <div className="pmc-table-footer">
            <p className="mb-0">{repayments.length} repayments recorded</p>
            <button type="button" onClick={() => toast("info", "Repayment history exported", `${repayments.length} repayments written to repayments.csv`)} className="fw-bold pmc-green-dark pmc-focus" style={{ background: "none", border: "none", padding: 0, fontSize: 11.5 }}>
              Export CSV
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="row pmc-g-3 pmc-mt-3">
          {[
            { icon: "wallet" as IconName, title: "Settle in full", copy: `Pay ${kes(creditLine.outstanding)} before ${creditLine.dueDate} and pay zero interest.`, action: "Pay balance", amount: creditLine.outstanding },
            { icon: "gauge" as IconName, title: "Pay the minimum", copy: `${kes(creditLine.minimumDue)} keeps the account current. Interest applies to the remainder.`, action: "Pay minimum", amount: creditLine.minimumDue },
            { icon: "sliders" as IconName, title: "Pay a custom amount", copy: "Choose any figure between the minimum and the full outstanding balance.", action: "Choose amount", amount: 0 },
          ].map((o) => (
            <div key={o.title} className="col-12 col-sm-4">
              <div className="pmc-card pmc-lift d-flex flex-column p-4 h-100">
                <span className="pmc-icon-sq-lg d-grid pmc-tone-green"><Icon name={o.icon} size={18} /></span>
                <h3 className="pmc-display pmc-mt-3 pmc-fs-14 fw-bold pmc-ls-tight pmc-ink">{o.title}</h3>
                <p className="pmc-mt-1 flex-grow-1 pmc-fs-115 pmc-muted mb-0" style={{ lineHeight: 1.65 }}>{o.copy}</p>
                <Btn size="sm" variant="outline" className="pmc-mt-3" icon="arrowRight" onClick={() => openModal({ type: "repay" })}>{o.action}</Btn>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 05 · Credit activity (original 5.4 table) ============ */

export function CreditActivitySection() {
  const { creditTxns, cards, toast } = useApp();
  const [filter, setFilter] = useState<"all" | "Cleared" | "Pending" | "Declined">("all");
  const byId = (id: string) => cards.find((c) => c.id === id);
  const shown = creditTxns.filter((t) => filter === "all" || t.status === filter);
  const total = creditTxns.filter((t) => t.status === "Cleared").reduce((s, t) => s + t.amount, 0);

  const tone = (s: string): "success" | "warning" | "danger" => (s === "Cleared" ? "success" : s === "Pending" ? "warning" : "danger");

  return (
    <section id="credit-activity" className="pmc-scroll-mt">
      <SectionHead no="05" title="Credit Activity" sub="Authorisations against the credit line with the card that produced each one.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Credit activity exported", `${shown.length} authorisations written to credit-activity.csv`)}>Export CSV</Btn>
      </SectionHead>

      <div className="pmc-thin-scroll pmc-mb-4 d-flex pmc-gap-2 overflow-auto pb-1">
        {(["all", "Cleared", "Pending", "Declined"] as const).map((s) => (
          <Chip key={s} on={filter === s} onClick={() => setFilter(s)} count={s === "all" ? creditTxns.length : creditTxns.filter((t) => t.status === s).length}>
            {s === "all" ? "All" : s}
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty icon="inbox" title="No credit activity" sub="Authorisations will appear here once a virtual credit card is used." />
      ) : (
        <Reveal>
          <div className="pmc-table-frame">
            <div className="table-responsive d-none d-md-block">
              <table className="table pmc-table w-100 text-start align-middle">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Merchant</th>
                    <th scope="col">Card</th>
                    <th scope="col" className="text-end">Amount</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((t) => {
                    const card = byId(t.cardId);
                    return (
                      <tr key={t.id}>
                        <td className="fw-bold pmc-ink">{t.date}</td>
                        <td>
                          <div className="d-flex align-items-center pmc-gap-25">
                            <span className="pmc-icon-sq-sm d-grid pmc-tone-muted"><Icon name="globe" size={14} /></span>
                            <div className="lh-sm">
                              <p className="fw-bold pmc-ink mb-0">{t.merchant}</p>
                              <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{t.memo}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="fw-bold pmc-ink mb-0">{card?.nickname ?? "—"}</p>
                          <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">•• {card?.last4 ?? "----"}</p>
                        </td>
                        <td className="pmc-num text-end pmc-display fw-bold pmc-ink">{kes(t.amount)}</td>
                        <td><Badge tone={tone(t.status)} dot>{t.status}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="pmc-mobile-list d-md-none">
              {shown.map((t) => {
                const card = byId(t.cardId);
                return (
                  <li key={t.id}>
                    <span className="pmc-icon-sq d-grid pmc-tone-muted"><Icon name="globe" size={15} /></span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p className="pmc-truncate pmc-fs-13 fw-bold pmc-ink mb-0">{t.merchant}</p>
                      <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{t.date} · {card?.nickname}</p>
                      <div className="pmc-mt-1"><Badge tone={tone(t.status)} dot>{t.status}</Badge></div>
                    </div>
                    <p className="pmc-num pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">−{kesShort(t.amount)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="pmc-table-footer">
              <p className="mb-0">{shown.length} authorisation{shown.length === 1 ? "" : "s"} in view</p>
              <p className="mb-0">Cleared · <span className="pmc-display pmc-fs-13 pmc-ink">{kes(total)}</span></p>
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );
}

/* ============ 06 · Fees, utilisation & insights ============ */

export function CreditInsightsSection() {
  const { creditLine, openModal } = useApp();
  const utilisation = Math.round(((creditLine.outstanding + creditLine.pendingAuth) / creditLine.approved) * 100);
  const max = Math.max(...UTILISATION_TREND.map((u) => u.pct));
  const healthy = utilisation <= 40;

  return (
    <section id="credit-insights" className="pmc-scroll-mt">
      <SectionHead no="06" title="Fees, Utilisation & Insights" sub="How the line is priced, how hard it is working, and what to watch.">
        <Btn size="sm" variant="outline" icon="wallet" onClick={() => openModal({ type: "repay" })}>Reduce balance</Btn>
      </SectionHead>

      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-card p-4 h-100">
            <div className="pmc-mb-3 d-flex align-items-baseline justify-content-between">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Utilisation trend · 6 months</p>
              <Badge tone={healthy ? "success" : utilisation > 60 ? "danger" : "warning"} dot>{utilisation}% now</Badge>
            </div>
            <div className="d-flex align-items-end pmc-gap-25" style={{ height: 150 }}>
              {UTILISATION_TREND.map((u) => (
                <div key={u.m} className="d-flex flex-column align-items-center pmc-gap-15" style={{ flex: 1, minWidth: 0 }}>
                  <span className="pmc-num pmc-fs-105 fw-bold pmc-faint">{u.pct}%</span>
                  <div
                    className="w-100"
                    style={{
                      height: `${(u.pct / max) * 110}px`,
                      borderRadius: "6px 6px 0 0",
                      background: u.m === "Jun" ? "var(--pmc-green)" : "#dbe4f0",
                      transition: "height 0.5s ease",
                    }}
                  />
                  <span className="pmc-fs-105 fw-bold text-uppercase pmc-muted" style={{ letterSpacing: "0.025em" }}>{u.m}</span>
                </div>
              ))}
            </div>
            <p className={cn("pmc-note pmc-mt-3 mb-0", healthy ? "pmc-note-green" : "pmc-note-warn")}>
              <Icon name={healthy ? "checkCircle" : "alertTri"} size={13} className="pmc-mt-05 flex-none" />
              {healthy
                ? "Utilisation is healthy. Keeping below 40% supports a limit increase review."
                : "Utilisation is elevated. Paying down before the cycle closes reduces interest exposure."}
            </p>
          </div>
        </Reveal>

        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-card p-4">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-25">Credit pricing</p>
              <ul className="pmc-divided">
                {CREDIT_FEES.slice(0, 5).map((f) => (
                  <li key={f.item} className="d-flex align-items-center justify-content-between pmc-gap-3 pmc-py-2">
                    <div style={{ minWidth: 0 }}>
                      <p className="pmc-fs-12 fw-bold pmc-ink mb-0">{f.item}</p>
                      <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{f.note}</p>
                    </div>
                    <span className="pmc-num flex-none pmc-display pmc-fs-125 fw-bold pmc-ink">{f.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pmc-card flex-grow-1 p-4">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-2">Limit review</p>
              <p className="pmc-fs-115 pmc-muted mb-0" style={{ lineHeight: 1.65 }}>
                You have repaid on time for 3 consecutive cycles. A limit increase to <strong className="pmc-ink">KES 750,000</strong> may be available.
              </p>
              <div className="pmc-mt-3 pmc-radius p-3" style={{ background: "rgba(242,244,248,0.7)" }}>
                <div className="pmc-mb-1 d-flex justify-content-between pmc-fs-105 fw-bold pmc-faint">
                  <span>Current {kesShort(creditLine.approved)}</span>
                  <span>Offer {kesShort(750000)}</span>
                </div>
                <Progress value={67} tone="violet" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Modals & drawers
   ============================================================ */

/* ---- Credit card visual that supports a colour theme override ---- */

function CreditCardPreview({ purpose, alias, theme, expiry, limit }: { purpose: CreditPurpose; alias: string; theme: ColorTheme; expiry: string; limit: number }) {
  const meta = purposeMeta(purpose);
  const sw = COLOR_THEMES.find((t) => t.id === theme) ?? COLOR_THEMES[0];
  return (
    <div className="pmc-card-visual pmc-card-sheen" style={{ background: sw.gradient }}>
      <div className="pmc-hero-dots position-absolute top-0 start-0 w-100 h-100" />
      <div className="position-relative d-flex h-100 flex-column justify-content-between p-4">
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <p className="pmc-display pmc-fs-135 fw-bold mb-0">PayMo</p>
            <p className="pmc-fs-9 fw-semibold text-uppercase mb-0" style={{ letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)" }}>
              {purpose === "single-use" ? "Single-Use Credit" : purpose === "subscription" ? "Subscription Credit" : "Virtual Credit"}
            </p>
          </div>
          {meta.selfDestructs && (
            <span className="rounded-2 pmc-fs-9 fw-bold text-uppercase" style={{ background: "rgba(255,255,255,0.15)", padding: "2px 6px", letterSpacing: "0.025em" }}>1× only</span>
          )}
        </div>
        <div>
          <p className="pmc-display pmc-fs-15 fw-semibold mb-0" style={{ letterSpacing: "0.08em", color: "rgba(255,255,255,0.95)" }}>•••• •••• •••• ••••</p>
          <div className="pmc-mt-15 d-flex align-items-end justify-content-between">
            <div className="lh-sm">
              <p className="pmc-fs-95 fw-semibold text-uppercase mb-0" style={{ letterSpacing: "0.05em", color: "rgba(255,255,255,0.55)" }}>Alias</p>
              <p className="pmc-fs-115 fw-bold mb-0" style={{ letterSpacing: "0.025em", color: "rgba(255,255,255,0.95)" }}>{alias.toUpperCase() || "CARD ALIAS"}</p>
            </div>
            <div className="text-end lh-sm">
              <p className="pmc-fs-95 fw-semibold text-uppercase mb-0" style={{ letterSpacing: "0.05em", color: "rgba(255,255,255,0.55)" }}>Valid thru</p>
              <p className="pmc-fs-115 fw-bold mb-0" style={{ color: "rgba(255,255,255,0.95)" }}>{expiry}</p>
            </div>
          </div>
          <p className="pmc-num pmc-mt-2 pmc-fs-10 fw-bold mb-0" style={{ color: "rgba(255,255,255,0.7)" }}>Limit {kes(limit)} / month</p>
        </div>
      </div>
    </div>
  );
}

/* ============ Issue Credit Card wizard (original 5.4 three steps) ============ */

const EXPIRY_OPTIONS = ["06/28", "12/28", "06/29", "12/29"];

export function CreditIssueModal() {
  const { modal, closeModal, addCard, toast, openModal } = useApp();
  const open = modal?.type === "creditIssue";

  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState<CreditPurpose>("multi-use");
  const [alias, setAlias] = useState("Marketing Ads");
  const [theme, setTheme] = useState<ColorTheme>("violet");
  const [funding, setFunding] = useState(CREDIT_FUNDING_SOURCES[0]);
  const [limit, setLimit] = useState(40000);
  const [expiry, setExpiry] = useState("06/28");
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [issued, setIssued] = useState<PmCard | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setPurpose("multi-use");
    setAlias("Marketing Ads");
    setTheme("violet");
    setFunding(CREDIT_FUNDING_SOURCES[0]);
    setLimit(40000);
    setExpiry("06/28");
    setPin("");
    setPinErr(false);
    setIssued(null);
  }, [open]);

  // pick up purpose presets from elsewhere on the page
  useEffect(() => {
    const onPreset = (e: Event) => {
      const p = (e as CustomEvent<string>).detail as CreditPurpose;
      const meta = CREDIT_PURPOSES.find((c) => c.id === p);
      if (!meta) return;
      setPurpose(p);
      setLimit(meta.defaultLimit);
      setAlias(p === "single-use" ? "One-Off Purchase" : p === "subscription" ? "Streaming & SaaS" : "Marketing Ads");
    };
    window.addEventListener("pm-credit-purpose", onPreset);
    return () => window.removeEventListener("pm-credit-purpose", onPreset);
  }, []);

  if (!open) return null;
  const meta = purposeMeta(purpose);
  const sw = COLOR_THEMES.find((t) => t.id === theme) ?? COLOR_THEMES[0];

  const issue = () => {
    if (pin.length !== 4) {
      setPinErr(true);
      return;
    }
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const bin = purpose === "subscription" ? "5210" : "4123";
    const card: PmCard = {
      id: `cr${Date.now()}`,
      nickname: alias.trim() || "Virtual Credit",
      holder: "ACME TRADERS LTD",
      tier: "credit",
      kind: "virtual",
      network: purpose === "subscription" ? "Mastercard" : "VISA",
      last4,
      panMask: `${bin} 55•• •••• ${last4}`,
      expiry,
      status: "active",
      issuedOn: "Today",
      spentMonth: 0,
      limitMonth: limit,
      limitPerTxn: limit,
      channels: { online: true, contactless: false, atm: false, intl: true },
      gradient: sw.gradient,
      purpose: meta.title,
      merchantLock: meta.locksToMerchant ? "Netflix" : "Open merchants",
      singleUse: meta.selfDestructs,
      requires3ds: true,
      tag: meta.selfDestructs ? "Single-use" : "Just issued",
    };
    addCard(card);
    setIssued(card);
    toast("success", "Virtual credit card issued", `${card.nickname} •• ${last4} is ready for online transactions.`);
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="plus"
      title={issued ? "Virtual Card Issued!" : "Issue a virtual credit card"}
      subtitle={issued ? undefined : "Three steps — pick the purpose, customise the card, then authorise with your PIN."}
      width="max-w-2xl"
      footer={
        issued ? (
          <>
            <Btn variant="outline" onClick={closeModal}>Close</Btn>
            <Btn icon="eye" onClick={() => { const id = issued.id; closeModal(); window.setTimeout(() => openModal({ type: "creditDetails", cardId: id }), 60); }}>View card details</Btn>
          </>
        ) : step === 1 ? (
          <>
            <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
            <Btn icon="arrowRight" onClick={() => setStep(2)}>Continue</Btn>
          </>
        ) : step === 2 ? (
          <>
            <Btn variant="outline" icon="chevLeft" onClick={() => setStep(1)}>Back</Btn>
            <Btn icon="arrowRight" disabled={alias.trim().length < 2} onClick={() => setStep(3)}>Review &amp; confirm</Btn>
          </>
        ) : (
          <>
            <Btn variant="outline" icon="chevLeft" onClick={() => setStep(2)}>Back</Btn>
            <Btn icon="lock" onClick={issue}>Issue Card</Btn>
          </>
        )
      }
    >
      {issued ? (
        <div className="d-flex flex-column align-items-center pmc-gap-4 pmc-py-2 text-center">
          <span className="pmc-done-icon"><Icon name="checkCircle" size={26} /></span>
          <div>
            <p className="pmc-display pmc-fs-16 fw-bold pmc-ink mb-0">Your new card is ready</p>
            <p className="pmc-mt-1 pmc-fs-125 pmc-muted mb-0" style={{ lineHeight: 1.65 }}>You can now use it for online transactions. {meta.selfDestructs ? "It will retire itself after the first successful payment." : meta.locksToMerchant ? "It is locked to the first merchant it transacts with." : "It draws from your revolving credit line."}</p>
          </div>
          <div className="w-100 mx-auto" style={{ maxWidth: 340 }}><CardVisual card={issued} /></div>
          <p className="pmc-fs-11 fw-semibold pmc-faint mb-0">Funding · {funding.split("·")[0].trim()}</p>
        </div>
      ) : (
        <div className="d-flex flex-column pmc-gap-4">
          {/* Stepper */}
          <div className="d-flex flex-wrap align-items-center justify-content-between pmc-gap-2">
            <div className="d-flex align-items-center pmc-gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="d-flex align-items-center pmc-gap-2">
                  <span className={cn("pmc-step-dot", s < step && "done", s === step && "current")}>
                    {s < step ? <Icon name="check" size={11} /> : s}
                  </span>
                  {s < 3 && <span className={cn("pmc-step-line", s < step && "done")} />}
                </div>
              ))}
            </div>
            <span className="pmc-kicker pmc-faint">
              Step {step} · {step === 1 ? "Select Card Purpose" : step === 2 ? "Customization & Limits" : "Security & Confirmation"}
            </span>
          </div>

          {/* Step 1 — purpose */}
          {step === 1 && (
            <div className="d-flex flex-column pmc-gap-2">
              {CREDIT_PURPOSES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setPurpose(p.id); setLimit(p.defaultLimit); }}
                  className={cn("pmc-choice pmc-focus", purpose === p.id && "on")}
                >
                  <span className={cn("pmc-icon-sq d-grid", purpose === p.id ? "pmc-tone-green" : "pmc-tone-muted")} style={purpose === p.id ? { background: "var(--pmc-green)", color: "#fff" } : undefined}>
                    <Icon name={p.icon} size={16} />
                  </span>
                  <span className="flex-grow-1" style={{ minWidth: 0 }}>
                    <span className="d-flex flex-wrap align-items-center pmc-gap-2">
                      <span className="pmc-fs-135 fw-bold pmc-ink">{p.title}</span>
                      <Badge tone={p.id === "single-use" ? "violet" : p.id === "subscription" ? "info" : "muted"}>{p.badge}</Badge>
                    </span>
                    <span className="d-block pmc-mt-05 pmc-fs-115 lh-sm pmc-muted">{p.sub}</span>
                  </span>
                  {purpose === p.id && <Icon name="check" size={16} className="pmc-mt-15 flex-none pmc-green" />}
                </button>
              ))}
              <p className="pmc-note pmc-note-canvas mb-0">
                All three card types draw from the same <strong className="pmc-ink">Biz Credit Line</strong>. Limits are per card, not per line.
              </p>
            </div>
          )}

          {/* Step 2 — customization */}
          {step === 2 && (
            <div className="row pmc-gap-5">
              <div className="col-12 col-lg-7 d-flex flex-column pmc-gap-4">
                <div>
                  <FieldLabel hint={`${alias.length}/24 characters`}>Card Nickname (Alias)</FieldLabel>
                  <input
                    value={alias}
                    maxLength={24}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Marketing Ads"
                    className="form-control pmc-focus pmc-display pmc-fs-13 fw-semibold pmc-ink"
                    style={{ letterSpacing: "0.02em" }}
                  />
                </div>

                <div>
                  <FieldLabel>Color Theme</FieldLabel>
                  <div className="d-flex flex-wrap pmc-gap-2">
                    {COLOR_THEMES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        aria-label={t.label}
                        className={cn("pmc-focus d-flex align-items-center pmc-gap-2 pmc-radius-sm pmc-px-25 pmc-py-15")}
                        style={theme === t.id ? { border: "2px solid var(--pmc-green)", background: "rgba(231,248,239,0.5)" } : { border: "2px solid var(--pmc-line)", background: "#fff" }}
                      >
                        <span className="d-inline-block flex-none rounded-circle" style={{ width: 16, height: 16, background: t.swatch, boxShadow: "0 0 0 1px rgba(0,0,0,0.1)" }} />
                        <span className="pmc-fs-115 fw-bold pmc-ink">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel>Funding Source</FieldLabel>
                  <div className="d-flex flex-column pmc-gap-15">
                    {CREDIT_FUNDING_SOURCES.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFunding(f)}
                        className="pmc-focus d-flex w-100 align-items-center pmc-gap-25 pmc-radius-sm pmc-px-35 pmc-py-25 text-start pmc-fs-125 fw-bold"
                        style={funding === f ? { border: "1px solid var(--pmc-green)", background: "rgba(231,248,239,0.5)", color: "var(--pmc-green-ink)" } : { border: "1px solid var(--pmc-line)", background: "#fff", color: "var(--pmc-ink-2)" }}
                      >
                        <Icon name={f.startsWith("Biz Credit") ? "card" : f.startsWith("Biz Wallet") ? "wallet" : "building"} size={15} />
                        <span className="flex-grow-1">{f}</span>
                        {funding === f && <Icon name="check" size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="pmc-mb-15 d-flex align-items-center justify-content-between">
                    <FieldLabel>Monthly Spending Limit (KES)</FieldLabel>
                    <span className="pmc-num pmc-display pmc-fs-15 fw-bold pmc-ink">{kes(limit)}</span>
                  </div>
                  <input type="range" min={2000} max={200000} step={1000} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-100" aria-label="Monthly spending limit" />
                  <div className="pmc-mt-1 d-flex justify-content-between pmc-fs-10 fw-semibold pmc-faint"><span>KES 2,000</span><span>KES 200,000</span></div>
                </div>

                <div>
                  <FieldLabel>Expiry / Valid Thru</FieldLabel>
                  <div className="d-flex flex-wrap pmc-gap-2">
                    {EXPIRY_OPTIONS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setExpiry(e)}
                        className={cn("pmc-num pmc-radius-sm pmc-px-3 pmc-py-2 pmc-display pmc-fs-125 fw-bold pmc-focus")}
                        style={expiry === e ? { border: "2px solid var(--pmc-green)", background: "rgba(231,248,239,0.5)", color: "var(--pmc-green-ink)" } : { border: "2px solid var(--pmc-line)", background: "#fff", color: "var(--pmc-ink-2)" }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-5">
                <FieldLabel>Live preview</FieldLabel>
                <div className="position-sticky" style={{ top: 0 }}>
                  <CreditCardPreview purpose={purpose} alias={alias} theme={theme} expiry={expiry} limit={limit} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — confirmation */}
          {step === 3 && (
            <div className="d-flex flex-column pmc-gap-4">
              <div className="pmc-radius overflow-hidden" style={{ border: "1px solid var(--pmc-line)" }}>
                {[
                  ["Card Type", meta.title],
                  ["Nickname", alias.trim()],
                  ["Color Theme", sw.label],
                  ["Limit", `${kes(limit)} / month`],
                  ["Expiry", expiry],
                  ["Funding Source", funding],
                ].map(([k, v]) => (
                  <div key={k} className="pmc-kv">
                    <span className="fw-semibold pmc-muted">{k}</span>
                    <span className="text-end fw-bold pmc-ink">{v}</span>
                  </div>
                ))}
              </div>

              <div className="mx-auto" style={{ maxWidth: 300 }}>
                <CreditCardPreview purpose={purpose} alias={alias} theme={theme} expiry={expiry} limit={limit} />
              </div>

              <div>
                <FieldLabel hint="Authorises issuance">Enter PIN to issue card</FieldLabel>
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
                {pinErr && <p className="pmc-shake pmc-mt-15 d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-bold pmc-danger-ink mb-0"><Icon name="alertTri" size={12} /> Enter your 4-digit PayMo PIN.</p>}
              </div>

              <p className="pmc-note pmc-note-green mb-0">
                <Icon name="zap" size={12} className="me-1 d-inline-block" />
                Your card will be instantly generated and ready for use. Drawn amounts are added to this cycle's statement.
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ============ Secure credit card details ============ */

export function CreditDetailsModal() {
  const { modal, closeModal, cards, updateVirtualMeta, toast, openModal } = useApp();
  const open = modal?.type === "creditDetails";
  const card = cards.find((c) => c.id === (modal?.type === "creditDetails" ? modal.cardId : ""));

  const [revealed, setRevealed] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [lock, setLock] = useState("Open merchants");
  const [threeDs, setThreeDs] = useState(true);
  const [singleUse, setSingleUse] = useState(false);

  useEffect(() => {
    if (!open || !card) return;
    setRevealed(false);
    setSeconds(30);
    setLock(card.merchantLock ?? "Open merchants");
    setThreeDs(card.requires3ds ?? true);
    setSingleUse(card.singleUse ?? false);
  }, [open, card?.id]);

  useEffect(() => {
    if (!revealed) return;
    if (seconds === 0) { setRevealed(false); return; }
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [revealed, seconds]);

  if (!open || !card) return null;
  const bin = card.network === "VISA" ? "4123" : "5210";
  const fullPan = `${bin} 5509 8812 ${card.last4}`;
  const cvv = String((Number(card.last4) * 7 + 211) % 1000).padStart(3, "0");
  const usage = Math.round((card.spentMonth / card.limitMonth) * 100);

  const save = () => {
    updateVirtualMeta(card.id, { merchantLock: lock, purpose: card.purpose, requires3ds: threeDs, singleUse });
    toast("success", "Card controls saved", `${card.nickname} now follows the updated policy.`);
    closeModal();
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="lock"
      title={`Secure details · ${card.nickname}`}
      subtitle="Credentials re-mask automatically 30 seconds after being revealed."
      width="max-w-xl"
      footer={
        <>
          <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
          <Btn icon="check" onClick={save}>Save controls</Btn>
        </>
      }
    >
      <div className="d-flex flex-column pmc-gap-4">
        <CardVisual card={card} />

        <div className="pmc-radius pmc-p-35" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}>
          <div className="d-flex align-items-center justify-content-between">
            <p className="pmc-fs-125 fw-bold pmc-ink mb-0">Card credentials</p>
            <button type="button" onClick={() => { setRevealed((r) => !r); setSeconds(30); }} className="d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-bold pmc-green-dark pmc-focus" style={{ background: "none", border: "none", padding: 0 }}>
              <Icon name={revealed ? "eyeOff" : "eye"} size={13} />{revealed ? `Hide · ${seconds}s` : "Reveal"}
            </button>
          </div>
          <div className="pmc-mt-3 row g-2">
            <div className="col-12 col-sm">
              <div className="rounded-2 pmc-px-3 pmc-py-25" style={{ border: "1px solid var(--pmc-line)", background: "#fff" }}>
                <p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.08em" }}>Card number</p>
                <p className="pmc-num pmc-mt-1 pmc-display pmc-fs-14 fw-bold pmc-ink mb-0" style={{ letterSpacing: "0.08em" }}>{revealed ? fullPan : card.panMask}</p>
              </div>
            </div>
            <div className="col-12 col-sm-auto">
              <div className="rounded-2 pmc-px-3 pmc-py-25 h-100" style={{ border: "1px solid var(--pmc-line)", background: "#fff", minWidth: 92 }}>
                <p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.08em" }}>CVV</p>
                <p className="pmc-num pmc-mt-1 pmc-display pmc-fs-14 fw-bold pmc-ink mb-0" style={{ letterSpacing: "0.14em" }}>{revealed ? cvv : "•••"}</p>
              </div>
            </div>
          </div>
          {revealed && (
            <button type="button" onClick={() => toast("success", "Credentials copied", "PAN and CVV held on your clipboard for 30 seconds.")} className="pmc-mt-2 d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-bold pmc-green-dark pmc-focus" style={{ background: "none", border: "none", padding: 0 }}>
              <Icon name="copy" size={13} /> Copy secure details
            </button>
          )}
        </div>

        <div className="row pmc-g-2 pmc-radius p-3 text-center" style={{ background: "rgba(242,244,248,0.7)" }}>
          <div className="col-4"><p className="pmc-num pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">{kesShort(card.spentMonth)}</p><p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Drawn</p></div>
          <div className="col-4"><p className="pmc-num pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">{kesShort(card.limitMonth)}</p><p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Card limit</p></div>
          <div className="col-4"><p className="pmc-num pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">{usage}%</p><p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Used</p></div>
        </div>

        <div>
          <FieldLabel>Merchant lock</FieldLabel>
          <select value={lock} onChange={(e) => setLock(e.target.value)} className="form-select pmc-focus pmc-fs-125 fw-bold pmc-ink">
            {["Open merchants", "Netflix", "AWS EMEA", "Meta Platforms", "Google Workspace", "Alibaba.com"].map((o) => <option key={o}>{o}</option>)}
          </select>
          <p className="pmc-mt-15 pmc-fs-11 pmc-muted mb-0">A locked card declines any other merchant automatically.</p>
        </div>

        <div className="row g-2">
          <div className="col-12 col-sm-6">
            <div className="d-flex align-items-center pmc-gap-25 pmc-radius p-3 h-100" style={{ border: "1px solid var(--pmc-line)", background: "#fff" }}>
              <span className="pmc-icon-sq-sm d-grid pmc-tone-green"><Icon name="shieldCheck" size={15} /></span>
              <span className="flex-grow-1">
                <span className="d-block pmc-fs-12 fw-bold pmc-ink">Require 3-D Secure</span>
                <span className="d-block pmc-fs-105 pmc-muted">OTP challenge</span>
              </span>
              <Toggle on={threeDs} label="Require 3-D Secure" onChange={setThreeDs} />
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <div className="d-flex align-items-center pmc-gap-25 pmc-radius p-3 h-100" style={{ border: "1px solid var(--pmc-line)", background: "#fff" }}>
              <span className="pmc-icon-sq-sm d-grid pmc-tone-violet"><Icon name="zap" size={15} /></span>
              <span className="flex-grow-1">
                <span className="d-block pmc-fs-12 fw-bold pmc-ink">Single-use mode</span>
                <span className="d-block pmc-fs-105 pmc-muted">Retire after payment</span>
              </span>
              <Toggle on={singleUse} label="Single-use mode" onChange={setSingleUse} />
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap pmc-gap-2 pmc-radius p-3" style={{ background: "rgba(242,244,248,0.7)" }}>
          <Btn size="sm" variant="outline" icon="sliders" onClick={() => { const id = card.id; closeModal(); window.setTimeout(() => openModal({ type: "limits", cardId: id }), 60); }}>Edit limits</Btn>
          <Btn size="sm" variant="outline" icon="chart" onClick={() => { closeModal(); window.setTimeout(() => document.getElementById("credit-activity")?.scrollIntoView({ behavior: "smooth" }), 80); }}>View activity</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ============ Repayment modal ============ */

export function RepayModal() {
  const { modal, closeModal, creditLine, repayCredit } = useApp();
  const open = modal?.type === "repay";
  const [amount, setAmount] = useState(creditLine.minimumDue);
  const [method, setMethod] = useState("KCB Bank •• 4471");
  const [pin, setPin] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount(creditLine.minimumDue);
    setMethod("KCB Bank •• 4471");
    setPin("");
    setDone(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const over = amount > creditLine.outstanding;

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="wallet"
      title={done ? "Payment successful" : "Make a credit payment"}
      subtitle={done ? undefined : `Outstanding ${kes(creditLine.outstanding)} · minimum due ${kes(creditLine.minimumDue)} by ${creditLine.dueDate}.`}
      width="max-w-lg"
      footer={
        done ? (
          <Btn icon="check" onClick={closeModal}>Done</Btn>
        ) : (
          <>
            <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
            <Btn
              icon="lock"
              disabled={amount < 100 || over || pin.length !== 4}
              onClick={() => { repayCredit(amount, method); setDone(true); }}
            >
              Pay {kes(amount)}
            </Btn>
          </>
        )
      }
    >
      {done ? (
        <div className="d-flex flex-column align-items-center pmc-gap-3 pmc-py-6 text-center">
          <span className="pmc-done-icon"><Icon name="checkCircle" size={26} /></span>
          <p className="pmc-display pmc-fs-15 fw-bold pmc-ink mb-0">{kes(amount)} applied</p>
          <p className="pmc-fs-125 pmc-muted mb-0" style={{ maxWidth: 300, lineHeight: 1.65 }}>Your available credit has increased and the payment is logged in Repayment &amp; Billing.</p>
        </div>
      ) : (
        <div className="d-flex flex-column pmc-gap-4">
          <div>
            <FieldLabel hint={`Max ${kes(creditLine.outstanding)}`}>Amount to pay</FieldLabel>
            <div className="position-relative">
              <span className="position-absolute pmc-fs-11 fw-bold pmc-faint" style={{ left: 12, top: "50%", transform: "translateY(-50%)" }}>KES</span>
              <input
                type="number"
                min={100}
                max={creditLine.outstanding}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="form-control pmc-focus pmc-num pmc-display pmc-fs-16 fw-bold pmc-ink"
                style={{ paddingLeft: 44 }}
              />
            </div>
            <div className="pmc-mt-2 d-flex flex-wrap pmc-gap-2">
              {[
                { label: "Minimum", v: creditLine.minimumDue },
                { label: "Half", v: Math.round(creditLine.outstanding / 2) },
                { label: "Full balance", v: creditLine.outstanding },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => setAmount(o.v)}
                  className={cn("pmc-pill-choice pmc-focus", amount === o.v && "on")}
                >
                  {o.label} · {kesShort(o.v)}
                </button>
              ))}
            </div>
            {over && <p className="pmc-shake pmc-mt-2 d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-bold pmc-danger-ink mb-0"><Icon name="alertTri" size={12} /> Amount exceeds the outstanding balance.</p>}
          </div>

          <div>
            <FieldLabel>Pay from</FieldLabel>
            <div className="d-flex flex-column pmc-gap-15">
              {["KCB Bank •• 4471 · KES 512,300", "Biz Wallet · KES 1,284,000", "M-Pesa Paybill 522 123 · KES 96,400"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m.split("·")[0].trim())}
                  className="pmc-focus d-flex w-100 align-items-center pmc-gap-25 pmc-radius-sm pmc-px-35 pmc-py-25 text-start pmc-fs-125 fw-bold"
                  style={method === m.split("·")[0].trim() ? { border: "1px solid var(--pmc-green)", background: "rgba(231,248,239,0.5)", color: "var(--pmc-green-ink)" } : { border: "1px solid var(--pmc-line)", background: "#fff", color: "var(--pmc-ink-2)" }}
                >
                  <Icon name={m.startsWith("KCB") ? "building" : m.startsWith("Biz") ? "wallet" : "phone"} size={15} />
                  <span className="flex-grow-1">{m}</span>
                  {method === m.split("·")[0].trim() && <Icon name="check" size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel hint="Authorises the debit">Enter your PayMo PIN</FieldLabel>
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

          <p className="pmc-note pmc-note-canvas mb-0">
            Settling the full balance before {creditLine.dueDate} avoids the {creditLine.apr}% monthly interest charge.
          </p>
        </div>
      )}
    </Modal>
  );
}

/* ============ Statement drawer ============ */

export function StatementDrawer() {
  const { modal, closeModal, toast } = useApp();
  const open = modal?.type === "statement";

  return (
    <Drawer open={open} onClose={closeModal} width="max-w-[440px]">
      <div className="d-flex align-items-center justify-content-between pmc-px-5 pmc-py-4" style={{ borderBottom: "1px solid var(--pmc-line)" }}>
        <div>
          <p className="pmc-kicker pmc-faint mb-0">Credit line</p>
          <h3 className="pmc-display pmc-fs-16 fw-bold pmc-ls-tight pmc-ink mb-0">Statement History</h3>
        </div>
        <button type="button" onClick={closeModal} aria-label="Close" className="pmc-icon-btn pmc-icon-btn-sm pmc-focus">
          <Icon name="x" size={17} />
        </button>
      </div>

      <div className="pmc-thin-scroll flex-grow-1 overflow-auto pmc-px-5 pmc-py-4" style={{ paddingBottom: 96 }}>
        {SEED_STATEMENTS.map((s) => (
          <div key={s.id} className="pmc-card pmc-mb-3 p-4">
            <div className="d-flex align-items-start justify-content-between pmc-gap-2">
              <div>
                <p className="pmc-fs-13 fw-bold pmc-ink mb-0">{s.period}</p>
                <p className="pmc-mt-05 pmc-fs-11 fw-semibold pmc-faint mb-0">Spend {kes(s.spend)} · Interest {kes(s.interest)}</p>
              </div>
              <Badge tone={s.status === "Paid" ? "success" : "warning"} dot>{s.status}</Badge>
            </div>
            <div className="pmc-mt-3 d-flex align-items-center justify-content-between pt-3" style={{ borderTop: "1px solid rgba(230,233,240,0.7)" }}>
              <p className="pmc-num pmc-fs-12 fw-bold pmc-muted mb-0">
                {s.status === "Paid" ? `Repaid ${kes(s.paid)}` : `${kes(s.spend - s.paid)} outstanding`}
              </p>
              <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Statement downloaded", `${s.period} PDF saved to your device.`)}>PDF</Btn>
            </div>
          </div>
        ))}

        <div className="pmc-radius p-4 text-center" style={{ border: "1px dashed var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}>
          <Icon name="inbox" size={20} className="mx-auto pmc-faint" />
          <p className="pmc-mt-2 pmc-fs-12 fw-bold pmc-ink mb-0">Older statements</p>
          <p className="pmc-mt-05 pmc-fs-11 pmc-muted mb-0">Statements older than four cycles are archived. Request them from support.</p>
          <Btn size="sm" variant="outline" className="pmc-mt-3" icon="headset" onClick={() => closeModal()}>Ask support</Btn>
        </div>
      </div>
    </Drawer>
  );
}
