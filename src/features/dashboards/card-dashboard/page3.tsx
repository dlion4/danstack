/* ============================================================================
 * Card Dashboard — page 5.3 · Virtual Debit Cards (Bootstrap 5 edition)
 * ========================================================================== */

import { useEffect, useState } from "react";
import { cn } from "./utils/cn";
import { Icon, type IconName } from "./icons";
import { Badge, Btn, Chip, FieldLabel, Modal, Progress, Reveal, SectionHead, Spark, Toggle, Empty } from "./ui";
import { useApp, scrollToId } from "./store";
import { kes, kesShort, type PmCard, type Txn } from "./data";
import { CardVisual } from "./modalsA";

type VirtualFilter = "all" | "multi" | "single" | "locked";

const PURPOSES: { id: string; title: string; sub: string; icon: IconName; singleUse: boolean; defaultLock: string }[] = [
  { id: "subscription", title: "Subscription", sub: "Lock to one recurring merchant", icon: "refresh", singleUse: false, defaultLock: "AWS EMEA" },
  { id: "supplier", title: "Supplier purchase", sub: "Set a controlled one-off spend limit", icon: "building", singleUse: false, defaultLock: "Open merchants" },
  { id: "one-time", title: "One-time purchase", sub: "Auto-close after the first success", icon: "zap", singleUse: true, defaultLock: "Open merchants" },
  { id: "team", title: "Team spend", sub: "Delegate a controlled online budget", icon: "users", singleUse: false, defaultLock: "Open merchants" },
];

const LOCK_OPTIONS = ["Open merchants", "AWS EMEA", "Meta Platforms", "Google Workspace", "Netflix", "Alibaba.com", "Custom merchant"];

function isVirtualDebit(card: PmCard) {
  return card.kind === "virtual" && card.tier !== "credit" && card.tier !== "prepaid";
}

function typeLabel(card: PmCard) {
  return card.singleUse || card.tier === "single-use" ? "Single-use" : "Multi-use";
}

function virtualGradient(purpose: string) {
  if (purpose === "subscription") return "linear-gradient(118deg,#0b4ea2 0%,#175cd3 55%,#2e90fa 100%)";
  if (purpose === "one-time") return "linear-gradient(118deg,#5b21b6 0%,#7a5af8 58%,#9b8afb 100%)";
  if (purpose === "team") return "linear-gradient(118deg,#07633c 0%,#0b8f52 55%,#12b76a 100%)";
  return "linear-gradient(118deg,#0b1322 0%,#1d2939 54%,#344054 100%)";
}

/* ============ 01 · Virtual Debit Overview ============ */

export function VirtualOverview() {
  const { cards, txns, openModal, setPage } = useApp();
  const virtualCards = cards.filter(isVirtualDebit);
  const active = virtualCards.filter((c) => c.status === "active").length;
  const spend = virtualCards.reduce((sum, c) => sum + c.spentMonth, 0);
  const lockedCount = virtualCards.filter((c) => c.merchantLock && c.merchantLock !== "Open merchants").length;
  const onlineTxns = txns.filter((t) => virtualCards.some((c) => c.id === t.cardId)).length;

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
                <span className="pmc-hero-chip">Module 5.3</span>
              </div>
              <h1 className="pmc-hero-title pmc-mt-3">
                Virtual Debit<br className="d-none d-sm-inline" /> Card Center
              </h1>
              <p className="pmc-hero-sub" style={{ maxWidth: 500 }}>
                Create purpose-built digital cards in seconds. Lock a card to one merchant, cap the spend, require 3-D Secure, or make it disappear after one successful purchase.
              </p>
              <div className="pmc-mt-4 d-flex flex-wrap pmc-gap-2">
                <Btn icon="plus" onClick={() => openModal({ type: "virtualIssue" })}>Create Virtual Card</Btn>
                <Btn variant="ghost" icon="shield" onClick={() => scrollToId("guardrails")}>Set Guardrails</Btn>
                <Btn variant="ghost" icon="card" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="pmc-hero-stats">
                {[
                  { k: "Active virtual cards", v: String(active) },
                  { k: "MTD virtual spend", v: kesShort(spend) },
                  { k: "Merchant-locked", v: String(lockedCount) },
                  { k: "Online authorisations", v: String(onlineTxns) },
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
                {virtualCards[0] && <CardVisual card={virtualCards[0]} />}
              </div>
              <div className="position-absolute" style={{ bottom: 0, left: 4, width: 245, transform: "rotate(-4deg)" }}>
                {virtualCards[1] && <CardVisual card={virtualCards[1]} />}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="row pmc-g-3 pmc-mt-4">
        {[
          { icon: "card" as IconName, tone: "pmc-tone-green", label: "Virtual Cards", value: `${active} active`, note: `${virtualCards.filter((c) => c.singleUse || c.tier === "single-use").length} single-use ready`, spark: [4, 5, 5, 6, 6, 7, 7, 8] },
          { icon: "wallet" as IconName, tone: "pmc-tone-blue", label: "MTD Online Spend", value: kes(spend), note: "+18.2% vs last month", spark: [12, 14, 13, 17, 19, 20, 25, 28] },
          { icon: "lock" as IconName, tone: "pmc-tone-violet", label: "Merchant Locks", value: `${lockedCount} protected`, note: "No mismatched merchants", spark: [2, 2, 3, 3, 3, 4, 4, 4] },
          { icon: "shieldCheck" as IconName, tone: "pmc-tone-warn", label: "3-D Secure", value: "100%", note: "Enabled for virtual debit", spark: [90, 92, 95, 96, 98, 100, 100, 100] },
        ].map((k, i) => (
          <div key={k.label} className="col-12 col-sm-6 col-xl-3">
            <Reveal delay={i * 70} className="h-100">
              <div className="pmc-card p-4 h-100">
                <div className="d-flex align-items-start justify-content-between">
                  <span className={cn("pmc-stat-icon d-grid", k.tone)}><Icon name={k.icon} size={19} /></span>
                  <Spark points={k.spark} stroke={i === 1 ? "#2e90fa" : i === 2 ? "#7a5af8" : i === 3 ? "#f79009" : "#12b76a"} />
                </div>
                <p className="pmc-stat-label">{k.label}</p>
                <p className="pmc-stat-value" style={{ fontSize: 23 }}>{k.value}</p>
                <p className="pmc-mt-2 pmc-fs-11 fw-semibold pmc-faint mb-0">{k.note}</p>
              </div>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ 02 · Virtual Card Portfolio ============ */

export function VirtualCardsSection() {
  const { cards, openModal, toast, setCardStatus } = useApp();
  const [filter, setFilter] = useState<VirtualFilter>("all");
  const [query, setQuery] = useState("");
  const virtualCards = cards.filter(isVirtualDebit);
  const shown = virtualCards.filter((c) => {
    if (filter === "multi" && (c.singleUse || c.tier === "single-use")) return false;
    if (filter === "single" && !(c.singleUse || c.tier === "single-use")) return false;
    if (filter === "locked" && (!c.merchantLock || c.merchantLock === "Open merchants")) return false;
    const q = query.toLowerCase();
    return !q || `${c.nickname} ${c.holder} ${c.merchantLock ?? ""} ${c.purpose ?? ""}`.toLowerCase().includes(q);
  });

  const count = (f: VirtualFilter) => virtualCards.filter((c) => {
    if (f === "all") return true;
    if (f === "multi") return !(c.singleUse || c.tier === "single-use");
    if (f === "single") return c.singleUse || c.tier === "single-use";
    return !!c.merchantLock && c.merchantLock !== "Open merchants";
  }).length;

  return (
    <section id="virtual-cards" className="pmc-scroll-mt">
      <SectionHead no="02" title="Virtual Card Portfolio" sub="Purpose-built cards that only work where and how you intend.">
        <div className="position-relative">
          <Icon name="search" size={14} className="position-absolute pmc-faint" style={{ left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a virtual card…" className="pmc-focus pmc-radius-sm pmc-fs-125 fw-semibold pmc-ink" style={{ width: 190, border: "1px solid var(--pmc-line)", background: "#fff", padding: "8px 12px 8px 36px", outline: "none" }} />
        </div>
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "virtualIssue" })}>Create Card</Btn>
      </SectionHead>

      <div className="pmc-thin-scroll pmc-mb-4 d-flex pmc-gap-2 overflow-auto pb-1">
        {(["all", "multi", "single", "locked"] as VirtualFilter[]).map((f) => (
          <Chip key={f} on={filter === f} onClick={() => setFilter(f)} count={count(f)}>
            {f === "all" ? "All" : f === "multi" ? "Multi-use" : f === "single" ? "Single-use" : "Merchant-locked"}
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty icon="card" title="No virtual cards match" sub="Try another filter, or create a new controlled virtual card." action={<Btn size="sm" icon="plus" onClick={() => openModal({ type: "virtualIssue" })}>Create Virtual Card</Btn>} />
      ) : (
        <div className="row pmc-g-4">
          {shown.map((card, i) => {
            const usage = Math.round((card.spentMonth / card.limitMonth) * 100);
            const locked = card.merchantLock && card.merchantLock !== "Open merchants";
            return (
              <div key={card.id} className="col-12 col-sm-6 col-xl-4">
                <Reveal delay={(i % 3) * 70} className="h-100">
                  <div className="pmc-card pmc-lift-lg pmc-p-35 h-100">
                    <button type="button" onClick={() => openModal({ type: "virtualDetails", cardId: card.id })} className="pmc-card-hover d-block w-100 text-start pmc-focus" style={{ background: "none", border: "none", padding: 0 }} aria-label={`Manage ${card.nickname}`}>
                      <CardVisual card={card} />
                    </button>
                    <div className="pmc-mt-3 d-flex align-items-start justify-content-between pmc-gap-2">
                      <div style={{ minWidth: 0 }}>
                        <p className="pmc-truncate pmc-fs-135 fw-bold pmc-ink mb-0">{card.nickname}</p>
                        <p className="pmc-fs-11 fw-semibold pmc-faint mb-0">{card.purpose ?? "Online spend"} · •• {card.last4}</p>
                      </div>
                      <Badge tone={card.status === "active" ? "success" : card.status === "frozen" ? "info" : "danger"} dot className="text-capitalize">{card.status}</Badge>
                    </div>
                    <div className="pmc-mt-2 d-flex flex-wrap pmc-gap-15">
                      <Badge tone={card.singleUse || card.tier === "single-use" ? "violet" : "info"}>{typeLabel(card)}</Badge>
                      {locked && <Badge tone="success"><Icon name="lock" size={10} /> {card.merchantLock}</Badge>}
                      {card.requires3ds && <Badge tone="muted">3DS</Badge>}
                    </div>
                    <div className="pmc-mt-25">
                      <div className="pmc-mb-1 d-flex justify-content-between pmc-fs-105 fw-bold pmc-faint">
                        <span className="pmc-num">{kesShort(card.spentMonth)} spent</span>
                        <span className="pmc-num">{usage}% of {kesShort(card.limitMonth)}</span>
                      </div>
                      <Progress value={usage} tone={usage > 85 ? "red" : usage > 60 ? "amber" : "green"} />
                    </div>
                    <div className="pmc-mt-3 d-flex align-items-center pmc-gap-15 pt-3" style={{ borderTop: "1px solid rgba(230,233,240,0.7)" }}>
                      {card.status === "active" ? (
                        <Btn size="sm" variant="dangerGhost" icon="snow" className="flex-grow-1" onClick={() => setCardStatus(card.id, "frozen")}>Freeze</Btn>
                      ) : (
                        <Btn size="sm" icon="zap" className="flex-grow-1" onClick={() => { setCardStatus(card.id, "active"); toast("success", `${card.nickname} unfrozen`); }}>Unfreeze</Btn>
                      )}
                      <button type="button" onClick={() => openModal({ type: "virtualDetails", cardId: card.id })} title="Reveal credentials & controls" aria-label={`Reveal credentials for ${card.nickname}`} className="pmc-icon-btn pmc-icon-btn-sm pmc-focus"><Icon name="eye" size={14} /></button>
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

/* ============ 03 · Programme Guardrails ============ */

export function GuardrailsSection() {
  const { toast } = useApp();
  const [guards, setGuards] = useState({
    threeDs: true,
    firstUse: true,
    geo: true,
    velocity: true,
    expiry: true,
  });
  const list: { key: keyof typeof guards; icon: IconName; title: string; desc: string; hint: string }[] = [
    { key: "threeDs", icon: "shieldCheck", title: "Require 3-D Secure", desc: "Challenge virtual card purchases with an OTP or biometric approval.", hint: "All virtual cards" },
    { key: "firstUse", icon: "zap", title: "Single-use auto-close", desc: "Destroy a single-use PAN immediately after its first successful authorisation.", hint: "New single-use cards" },
    { key: "geo", icon: "globe", title: "High-risk corridor screening", desc: "Require extra verification for card-not-present traffic from elevated-risk countries.", hint: "Realtime scoring" },
    { key: "velocity", icon: "gauge", title: "Authorisation velocity limits", desc: "Soft decline after 4 online attempts within 5 minutes from the same card.", hint: "Portfolio default" },
    { key: "expiry", icon: "clock", title: "Unused-card expiry", desc: "Auto-freeze virtual cards that have no authorisation activity after 60 days.", hint: "60-day window" },
  ];

  return (
    <section id="guardrails" className="pmc-scroll-mt">
      <SectionHead no="03" title="Security Guardrails" sub="Programme defaults that remove the human error from online spend.">
        <Badge tone="success" dot>All policies enforced</Badge>
      </SectionHead>
      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-card p-4 h-100">
            <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Default virtual safeguards</p>
            <ul className="d-flex flex-column pmc-gap-2 mb-0" style={{ listStyle: "none", padding: 0 }}>
              {list.map((g) => (
                <li
                  key={g.key}
                  className="d-flex align-items-center pmc-gap-3 pmc-radius p-3"
                  style={guards[g.key] ? { border: "1px solid rgba(18,183,106,0.4)", background: "rgba(231,248,239,0.35)" } : { border: "1px solid var(--pmc-line)", background: "#fff" }}
                >
                  <span className={cn("pmc-icon-sq d-grid", guards[g.key] ? "pmc-green-ink" : "pmc-tone-muted pmc-faint")} style={guards[g.key] ? { background: "#fff", boxShadow: "0 1px 2px rgba(16,24,40,0.06)" } : undefined}><Icon name={g.icon} size={16} /></span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="pmc-fs-125 fw-bold pmc-ink mb-0">{g.title}</p>
                    <p className="pmc-fs-11 lh-sm pmc-muted mb-0">{g.desc}</p>
                  </div>
                  <div className="d-flex align-items-center pmc-gap-2">
                    <span className="d-none d-xl-block text-end pmc-fs-10 fw-bold pmc-faint">{g.hint}</span>
                    <Toggle on={guards[g.key]} label={g.title} onChange={(value) => { setGuards((s) => ({ ...s, [g.key]: value })); toast(value ? "success" : "warn", `${g.title} ${value ? "enabled" : "disabled"}`, "Updated across the virtual debit programme."); }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="pmc-card d-flex flex-column p-4 h-100">
            <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Policy impact · 30 days</p>
            <div className="pmc-mt-4 d-flex flex-column pmc-gap-3">
              {[
                ["Mismatched merchant attempts", "18", "Blocked before authorisation", "green", 78],
                ["3DS challenges completed", "42", "100% successful", "blue", 64],
                ["Single-use cards closed", "16", "Zero credentials retained", "violet", 48],
              ].map(([label, value, note, tone, width]) => (
                <div key={label as string}>
                  <div className="pmc-mb-1 d-flex justify-content-between pmc-gap-3 pmc-fs-115 fw-bold">
                    <span className="pmc-muted">{label}</span><span className="pmc-num pmc-display pmc-ink">{value}</span>
                  </div>
                  <Progress value={width as number} tone={tone as "blue" | "violet" | "green"} />
                  <p className="pmc-mt-1 pmc-fs-105 fw-semibold pmc-faint mb-0">{note}</p>
                </div>
              ))}
            </div>
            <div className="mt-auto pmc-radius p-3" style={{ background: "rgba(231,248,239,0.6)" }}>
              <p className="d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-bold pmc-green-ink mb-0"><Icon name="shieldCheck" size={13} /> Last risk scan: just now</p>
              <p className="pmc-mt-1 pmc-fs-11 mb-0" style={{ lineHeight: 1.65, color: "rgba(6,118,71,0.8)" }}>No active virtual cards require intervention. All merchant locks are operating normally.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 04 · Funding & spend limits ============ */

export function FundingSection() {
  const { cards, openModal, toast } = useApp();
  const [source, setSource] = useState("Biz Wallet · KES 1,284,000");
  const virtualCards = cards.filter(isVirtualDebit);
  const committed = virtualCards.reduce((sum, c) => sum + c.limitMonth, 0);
  const used = virtualCards.reduce((sum, c) => sum + c.spentMonth, 0);

  return (
    <section id="funding" className="pmc-scroll-mt">
      <SectionHead no="04" title="Funding & Spending Limits" sub="Every virtual card remains tied to a funded source, a monthly ceiling and a per-transaction cap." />
      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-5 h-100">
          <div className="pmc-card p-4 h-100">
            <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Default funding source</p>
            <div className="pmc-mt-3 pmc-radius pmc-p-35" style={{ border: "1px solid rgba(18,183,106,0.35)", background: "rgba(231,248,239,0.4)" }}>
              <div className="d-flex align-items-center pmc-gap-3">
                <span className="pmc-icon-sq-lg d-grid pmc-green-ink" style={{ background: "#fff", boxShadow: "0 1px 2px rgba(16,24,40,0.06)" }}><Icon name="wallet" size={17} /></span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}><p className="pmc-fs-125 fw-bold pmc-ink mb-0">{source}</p><p className="pmc-fs-11 fw-semibold pmc-muted mb-0">Primary source for new virtual cards</p></div>
              </div>
              <select value={source} onChange={(e) => { setSource(e.target.value); toast("success", "Default funding source updated"); }} className="form-select pmc-focus pmc-mt-3 pmc-fs-125 fw-bold pmc-ink">
                <option>Biz Wallet · KES 1,284,000</option>
                <option>M-Pesa Paybill 522 123 · KES 96,400</option>
                <option>KCB Bank •• 4471 · KES 512,300</option>
              </select>
            </div>
            <div className="pmc-mt-4 row pmc-g-2">
              <div className="col-6">
                <div className="pmc-radius p-3 h-100" style={{ background: "rgba(242,244,248,0.7)" }}><p className="pmc-fs-10 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Committed monthly</p><p className="pmc-num pmc-mt-1 pmc-display pmc-fs-16 fw-bold pmc-ink mb-0">{kesShort(committed)}</p></div>
              </div>
              <div className="col-6">
                <div className="pmc-radius p-3 h-100" style={{ background: "rgba(242,244,248,0.7)" }}><p className="pmc-fs-10 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Available headroom</p><p className="pmc-num pmc-mt-1 pmc-display pmc-fs-16 fw-bold pmc-green-dark mb-0">{kesShort(Math.max(0, 1_284_000 - committed))}</p></div>
              </div>
            </div>
            <div className="pmc-mt-3"><div className="pmc-mb-1 d-flex justify-content-between pmc-fs-11 fw-bold pmc-faint"><span>Portfolio spend</span><span>{kesShort(used)} used</span></div><Progress value={(used / Math.max(committed, 1)) * 100} /></div>
          </div>
        </Reveal>
        <Reveal delay={80} className="col-12 col-lg-7 h-100">
          <div className="pmc-table-frame h-100">
            <div className="pmc-table-head"><p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Card allocations</p><Badge tone="muted">Live</Badge></div>
            <div className="pmc-thin-scroll table-responsive">
              <table className="table pmc-table w-100 text-start align-middle" style={{ minWidth: 610 }}>
                <thead><tr><th scope="col">Card</th><th scope="col">Merchant policy</th><th scope="col">Monthly limit</th><th scope="col">Spend</th><th scope="col" className="text-end">Action</th></tr></thead>
                <tbody>
                  {virtualCards.map((card) => {
                    const pct = (card.spentMonth / card.limitMonth) * 100;
                    return (
                      <tr key={card.id}>
                        <td><p className="fw-bold pmc-ink mb-0">{card.nickname}</p><p className="pmc-fs-105 fw-semibold pmc-faint mb-0">•• {card.last4} · {typeLabel(card)}</p></td>
                        <td><Badge tone={card.merchantLock && card.merchantLock !== "Open merchants" ? "success" : "muted"}>{card.merchantLock ?? "Open merchants"}</Badge></td>
                        <td className="pmc-num fw-bold pmc-ink">{kes(card.limitMonth)}</td>
                        <td><p className="pmc-num pmc-fs-115 fw-bold pmc-ink mb-0">{kes(card.spentMonth)} <span className="pmc-faint">({Math.round(pct)}%)</span></p><Progress value={pct} tone={pct > 85 ? "red" : pct > 60 ? "amber" : "green"} className="pmc-mt-15" /></td>
                        <td className="text-end"><Btn size="sm" variant="outline" icon="sliders" onClick={() => openModal({ type: "limits", cardId: card.id })}>Edit</Btn></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 05 · Virtual activity ============ */

export function VirtualActivitySection() {
  const { cards, txns, openModal, toast } = useApp();
  const [filter, setFilter] = useState<"all" | "Cleared" | "Pending" | "Declined" | "Disputed">("all");
  const virtualCards = cards.filter(isVirtualDebit);
  const activity = txns.filter((t) => virtualCards.some((c) => c.id === t.cardId)).filter((t) => filter === "all" || t.status === filter);
  const byId = (id: string) => virtualCards.find((c) => c.id === id);

  const tone = (status: Txn["status"]): "success" | "warning" | "danger" | "violet" => status === "Cleared" ? "success" : status === "Pending" ? "warning" : status === "Declined" ? "danger" : "violet";

  return (
    <section id="activity" className="pmc-scroll-mt">
      <SectionHead no="05" title="Virtual Card Activity" sub="Online authorisations, merchant enforcement and disputes for this card type.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Activity export ready", `${activity.length} virtual card transactions exported as CSV.`)}>Export CSV</Btn>
      </SectionHead>
      <div className="pmc-thin-scroll pmc-mb-4 d-flex pmc-gap-2 overflow-auto pb-1">
        {(["all", "Cleared", "Pending", "Declined", "Disputed"] as const).map((s) => <Chip key={s} on={filter === s} onClick={() => setFilter(s)} count={s === "all" ? txns.filter((t) => virtualCards.some((c) => c.id === t.cardId)).length : activity.filter((t) => t.status === s).length}>{s === "all" ? "All" : s}</Chip>)}
      </div>
      {activity.length === 0 ? <Empty icon="inbox" title="No virtual card activity" sub="Transactions will appear here as virtual cards are used." /> : (
        <Reveal>
          <div className="pmc-table-frame">
            <div className="table-responsive d-none d-md-block">
              <table className="table pmc-table w-100 text-start align-middle">
                <thead><tr><th scope="col">Merchant</th><th scope="col">Virtual card</th><th scope="col">Policy result</th><th scope="col" className="text-end">Amount</th><th scope="col" className="text-end">Action</th></tr></thead>
                <tbody>
                  {activity.map((txn) => {
                    const card = byId(txn.cardId);
                    const matching = !card?.merchantLock || card.merchantLock === "Open merchants" || txn.merchant.includes(card.merchantLock.split(" ")[0]);
                    return (
                      <tr key={txn.id}>
                        <td>
                          <div className="d-flex align-items-center pmc-gap-25">
                            <span className="pmc-icon-sq-sm d-grid pmc-tone-muted"><Icon name="globe" size={14} /></span>
                            <span><span className="d-block fw-bold pmc-ink">{txn.merchant}</span><span className="d-block pmc-fs-105 fw-semibold pmc-faint">{txn.date} · {txn.time} · {txn.category}</span></span>
                          </div>
                        </td>
                        <td><p className="fw-bold pmc-ink mb-0">{card?.nickname}</p><p className="pmc-fs-105 fw-semibold pmc-faint mb-0">•• {card?.last4}</p></td>
                        <td><Badge tone={matching ? "success" : "danger"} dot>{matching ? "Policy matched" : "Merchant mismatch"}</Badge></td>
                        <td className="pmc-num text-end pmc-display fw-bold pmc-ink">{kes(txn.amount)}</td>
                        <td className="text-end">{txn.status === "Cleared" ? <Btn size="sm" variant="outline" icon="flag" onClick={() => openModal({ type: "dispute", txnId: txn.id })}>Dispute</Btn> : <Badge tone={tone(txn.status)}>{txn.status}</Badge>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="pmc-mobile-list d-md-none">
              {activity.map((txn) => {
                const card = byId(txn.cardId);
                return (
                  <li key={txn.id}>
                    <span className="pmc-icon-sq d-grid pmc-tone-muted"><Icon name="globe" size={15} /></span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p className="pmc-truncate pmc-fs-13 fw-bold pmc-ink mb-0">{txn.merchant}</p>
                      <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{card?.nickname} · {txn.date}</p>
                      <div className="pmc-mt-1"><Badge tone={tone(txn.status)} dot>{txn.status}</Badge></div>
                    </div>
                    <div className="text-end">
                      <p className="pmc-num pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">−{kes(txn.amount)}</p>
                      {txn.status === "Cleared" && <button type="button" onClick={() => openModal({ type: "dispute", txnId: txn.id })} className="pmc-mt-1 pmc-fs-11 fw-bold pmc-green-dark pmc-focus" style={{ background: "none", border: "none", padding: 0 }}>Dispute</button>}
                    </div>
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

/* ============ 06 · Best practice ============ */

export function VirtualBestPractice() {
  const { openModal } = useApp();
  const flows = [
    { icon: "refresh" as IconName, title: "Recurring software", copy: "Create a merchant-locked multi-use card for every subscription. Your primary card number never touches a vendor.", action: "Create subscription card", purpose: "subscription" },
    { icon: "zap" as IconName, title: "One-off online buys", copy: "Use a single-use card with the exact purchase ceiling. It automatically closes after the payment clears.", action: "Create single-use card", purpose: "one-time" },
    { icon: "users" as IconName, title: "Delegated team spend", copy: "Give a teammate a limited virtual card instead of handing over a company card or buying a gift card.", action: "Create team card", purpose: "team" },
  ];
  return (
    <section id="best-practice" className="pmc-scroll-mt">
      <SectionHead no="06" title="Safer-by-Design Workflows" sub="Use card purpose and merchant locks instead of chasing reimbursements or exposing your primary credentials." />
      <div className="row pmc-g-3">
        {flows.map((flow, i) => (
          <div key={flow.title} className="col-12 col-md-4">
            <Reveal delay={i * 70} className="h-100">
              <div className="pmc-card pmc-lift-lg d-flex flex-column pmc-p-5 h-100">
                <span className="pmc-icon-sq-lg d-grid pmc-tone-green"><Icon name={flow.icon} size={18} /></span>
                <h3 className="pmc-display pmc-mt-3 pmc-fs-145 fw-bold pmc-ls-tight pmc-ink">{flow.title}</h3>
                <p className="pmc-mt-1 pmc-fs-12 pmc-muted" style={{ lineHeight: 1.65 }}>{flow.copy}</p>
                <Btn className="mt-auto pmc-pt-4" size="sm" variant="outline" icon="plus" onClick={() => { openModal({ type: "virtualIssue" }); window.setTimeout(() => window.dispatchEvent(new CustomEvent("pm-virtual-purpose", { detail: flow.purpose })), 30); }}>{flow.action}</Btn>
              </div>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ Virtual issuance wizard ============ */

export function VirtualIssueModal() {
  const { modal, closeModal, addCard, toast, openModal } = useApp();
  const open = modal?.type === "virtualIssue";
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState("subscription");
  const [name, setName] = useState("AWS / Subscriptions");
  const [merchant, setMerchant] = useState("AWS EMEA");
  const [limit, setLimit] = useState(25000);
  const [threeDs, setThreeDs] = useState(true);
  const [pin, setPin] = useState("");
  const [issued, setIssued] = useState<PmCard | null>(null);

  useEffect(() => {
    const choosePurpose = (event: Event) => {
      const next = (event as CustomEvent<string>).detail;
      const choice = PURPOSES.find((p) => p.id === next);
      if (!choice) return;
      setPurpose(choice.id);
      setName(choice.title === "Subscription" ? "AWS / Subscriptions" : choice.title === "One-time purchase" ? "One-time Purchase" : choice.title === "Team spend" ? "Team Online Spend" : "Supplier Purchases");
      setMerchant(choice.defaultLock);
      setLimit(choice.singleUse ? 10000 : choice.id === "team" ? 50000 : 25000);
    };
    window.addEventListener("pm-virtual-purpose", choosePurpose);
    return () => window.removeEventListener("pm-virtual-purpose", choosePurpose);
  }, []);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setPurpose("subscription");
    setName("AWS / Subscriptions");
    setMerchant("AWS EMEA");
    setLimit(25000);
    setThreeDs(true);
    setPin("");
    setIssued(null);
  }, [open]);

  if (!open) return null;
  const choice = PURPOSES.find((p) => p.id === purpose) ?? PURPOSES[0];
  const preview: PmCard = { id: "preview", nickname: name || "Virtual Card", holder: "ACME TRADERS LTD", tier: choice.singleUse ? "single-use" : "standard", kind: "virtual", network: purpose === "subscription" ? "Mastercard" : "VISA", last4: "••••", panMask: "•••• •••• •••• ••••", expiry: "09/29", status: "active", issuedOn: "Today", spentMonth: 0, limitMonth: limit, limitPerTxn: limit, channels: { online: true, contactless: false, atm: false, intl: true }, gradient: virtualGradient(purpose), purpose: choice.title, merchantLock: merchant, singleUse: choice.singleUse, requires3ds: threeDs };

  const issue = () => {
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const first = preview.network === "VISA" ? "4539" : "5210";
    const card: PmCard = { ...preview, id: `v${Date.now()}`, last4, panMask: `${first} 8••• •••• ${last4}`, issuedOn: "Today", tag: choice.singleUse ? "Single-use" : "Just issued" };
    addCard(card);
    setIssued(card);
    toast("success", "Virtual card created", `${card.nickname} is ready for an online authorisation.`);
  };

  const stepDots = (
    <div className="d-flex align-items-center pmc-gap-2">
      {[1, 2, 3].map((s) => (
        <div key={s} className="d-flex align-items-center pmc-gap-2">
          <span className={cn("pmc-step-dot", (s < step || issued) && "done", s === step && !issued && "current")}>
            {s < step || issued ? <Icon name="check" size={11} /> : s}
          </span>
          {s < 3 && <span className={cn("pmc-step-line", s < step && "done")} />}
        </div>
      ))}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="plus"
      title={issued ? "Virtual card created" : "Create a virtual debit card"}
      subtitle={issued ? undefined : "Build a controlled online payment method in three quick steps."}
      width="max-w-2xl"
      footer={
        issued ? (
          <><Btn variant="outline" onClick={closeModal}>Close</Btn><Btn icon="eye" onClick={() => { closeModal(); openModal({ type: "virtualDetails", cardId: issued.id }); }}>View Credentials</Btn></>
        ) : step === 1 ? (
          <><Btn variant="outline" onClick={closeModal}>Cancel</Btn><Btn icon="arrowRight" onClick={() => setStep(2)}>Continue</Btn></>
        ) : step === 2 ? (
          <><Btn variant="outline" icon="chevLeft" onClick={() => setStep(1)}>Back</Btn><Btn icon="arrowRight" disabled={!name.trim()} onClick={() => setStep(3)}>Review</Btn></>
        ) : (
          <><Btn variant="outline" icon="chevLeft" onClick={() => setStep(2)}>Back</Btn><Btn icon="lock" disabled={pin.length !== 4} onClick={issue}>Create Card</Btn></>
        )
      }
    >
      {issued ? (
        <div className="d-flex flex-column align-items-center pmc-gap-4 p-4 text-center">
          <span className="pmc-done-icon"><Icon name="checkCircle" size={26} /></span>
          <div>
            <p className="pmc-display pmc-fs-16 fw-bold pmc-ink mb-0">Ready for online payments</p>
            <p className="pmc-mt-1 pmc-fs-125 pmc-muted mb-0">Your merchant lock and 3-D Secure requirements are already active.</p>
          </div>
          <div className="w-100 mx-auto" style={{ maxWidth: 340 }}><CardVisual card={issued} /></div>
        </div>
      ) : (
        <div className="d-flex flex-column pmc-gap-4">
          <div className="d-flex align-items-center justify-content-between">
            {stepDots}
            <span className="pmc-kicker pmc-faint">Step {step} · {step === 1 ? "Purpose" : step === 2 ? "Controls" : "Confirm"}</span>
          </div>

          {step === 1 && (
            <div className="row g-2">
              {PURPOSES.map((p) => (
                <div key={p.id} className="col-12 col-sm-6">
                  <button
                    type="button"
                    onClick={() => { setPurpose(p.id); setMerchant(p.defaultLock); setLimit(p.singleUse ? 10000 : p.id === "team" ? 50000 : 25000); }}
                    className={cn("pmc-choice pmc-focus h-100", purpose === p.id && "on")}
                  >
                    <span className={cn("pmc-icon-sq d-grid", purpose === p.id ? "pmc-tone-green" : "pmc-tone-muted")} style={purpose === p.id ? { background: "var(--pmc-green)", color: "#fff" } : undefined}>
                      <Icon name={p.icon} size={16} />
                    </span>
                    <span>
                      <span className="d-block pmc-fs-13 fw-bold pmc-ink">{p.title}</span>
                      <span className="d-block pmc-mt-05 pmc-fs-115 lh-sm pmc-muted">{p.sub}</span>
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="row pmc-gap-5">
              <div className="col-12 col-lg-7 d-flex flex-column pmc-gap-4">
                <div>
                  <FieldLabel hint={`${name.length}/24 characters`}>Card nickname</FieldLabel>
                  <input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} className="form-control pmc-focus pmc-fs-13 fw-bold pmc-ink" />
                </div>
                <div>
                  <FieldLabel>Merchant lock</FieldLabel>
                  <select value={merchant} onChange={(e) => setMerchant(e.target.value)} className="form-select pmc-focus pmc-fs-125 fw-bold pmc-ink">
                    {LOCK_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <p className="pmc-mt-15 pmc-fs-11 fw-semibold pmc-muted mb-0">A locked card declines any merchant that does not match this policy.</p>
                </div>
                <div>
                  <div className="pmc-mb-15 d-flex align-items-center justify-content-between">
                    <FieldLabel>Monthly spending limit</FieldLabel>
                    <span className="pmc-num pmc-display pmc-fs-15 fw-bold pmc-ink">{kes(limit)}</span>
                  </div>
                  <input type="range" min={1000} max={150000} step={1000} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-100" aria-label="Monthly spending limit" />
                  <div className="pmc-mt-1 d-flex justify-content-between pmc-fs-10 fw-semibold pmc-faint"><span>KES 1,000</span><span>KES 150,000</span></div>
                </div>
                <div className="d-flex align-items-center pmc-gap-3 pmc-radius p-3" style={{ border: "1px solid var(--pmc-line)", background: "#fff" }}>
                  <span className="pmc-icon-sq d-grid pmc-tone-green"><Icon name="shieldCheck" size={16} /></span>
                  <div className="flex-grow-1">
                    <p className="pmc-fs-125 fw-bold pmc-ink mb-0">Require 3-D Secure</p>
                    <p className="pmc-fs-11 pmc-muted mb-0">OTP or biometric approval when challenged.</p>
                  </div>
                  <Toggle on={threeDs} label="Require 3-D Secure" onChange={setThreeDs} />
                </div>
              </div>
              <div className="col-12 col-lg-5">
                <CardVisual card={preview} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="d-flex flex-column pmc-gap-4">
              <div className="pmc-radius overflow-hidden" style={{ border: "1px solid var(--pmc-line)" }}>
                {[["Card purpose", choice.title], ["Merchant policy", merchant], ["Monthly limit", kes(limit)], ["3-D Secure", threeDs ? "Required" : "Optional"], ["Card type", choice.singleUse ? "Single-use" : "Multi-use"]].map(([k, v]) => (
                  <div key={k} className="pmc-kv">
                    <span className="fw-semibold pmc-muted">{k}</span>
                    <span className="fw-bold pmc-ink">{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <FieldLabel hint="Authorises immediate issuance">Enter your PayMo PIN</FieldLabel>
                <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" className="pmc-focus pmc-pin-input" style={{ letterSpacing: "0.5em" }} />
              </div>
              <p className="pmc-note pmc-note-canvas mb-0">Virtual cards are issued instantly. Credentials are only revealed after a second verification step.</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ============ Secure virtual card credentials & controls ============ */

export function VirtualDetailsModal() {
  const { modal, closeModal, cards, updateVirtualMeta, toast, openModal } = useApp();
  const open = modal?.type === "virtualDetails";
  const card = cards.find((c) => c.id === (modal?.type === "virtualDetails" ? modal.cardId : ""));
  const [revealed, setRevealed] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [merchant, setMerchant] = useState("Open merchants");
  const [threeDs, setThreeDs] = useState(true);
  const [singleUse, setSingleUse] = useState(false);

  useEffect(() => {
    if (!open || !card) return;
    setRevealed(false); setSeconds(30); setMerchant(card.merchantLock ?? "Open merchants"); setThreeDs(card.requires3ds ?? true); setSingleUse(card.singleUse ?? card.tier === "single-use");
  }, [open, card?.id]);

  useEffect(() => {
    if (!revealed) return;
    if (seconds === 0) { setRevealed(false); return; }
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [revealed, seconds]);

  if (!open || !card) return null;
  const fullPan = `${card.network === "VISA" ? "4539" : "5210"} 83${card.last4.slice(0, 2)} 7286 ${card.last4}`;
  const cvv = String((Number(card.last4) * 7 + 113) % 1000).padStart(3, "0");
  const save = () => { updateVirtualMeta(card.id, { merchantLock: merchant, purpose: card.purpose, requires3ds: threeDs, singleUse }); toast("success", "Virtual card controls saved", `${card.nickname} now follows the new merchant and security policy.`); closeModal(); };

  return (
    <Modal open={open} onClose={closeModal} icon="lock" title={`Secure details · ${card.nickname}`} subtitle="Credentials are protected and automatically re-mask after 30 seconds." width="max-w-xl" footer={<><Btn variant="outline" onClick={closeModal}>Cancel</Btn><Btn icon="check" onClick={save}>Save Controls</Btn></>}>
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
            <div className="col-12 col-sm" style={{ minWidth: 0 }}>
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
            <button type="button" onClick={() => toast("success", "Credentials copied", "Card number and CVV copied to your secure clipboard for 30 seconds.")} className="pmc-mt-2 d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-bold pmc-green-dark pmc-focus" style={{ background: "none", border: "none", padding: 0 }}>
              <Icon name="copy" size={13} /> Copy secure details
            </button>
          )}
        </div>

        <div>
          <FieldLabel>Merchant lock</FieldLabel>
          <select value={merchant} onChange={(e) => setMerchant(e.target.value)} className="form-select pmc-focus pmc-fs-125 fw-bold pmc-ink">
            {LOCK_OPTIONS.map((o) => <option key={o}>{o}</option>)}
          </select>
          <p className="pmc-mt-15 pmc-fs-11 pmc-muted mb-0">A locked card automatically declines online transactions from a different merchant.</p>
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
                <span className="d-block pmc-fs-105 pmc-muted">Close after payment</span>
              </span>
              <Toggle on={singleUse} label="Single-use mode" onChange={setSingleUse} />
            </div>
          </div>
        </div>

        <div className="d-flex flex-wrap pmc-gap-2 pmc-radius p-3" style={{ background: "rgba(242,244,248,0.7)" }}>
          <Btn size="sm" variant="outline" icon="sliders" onClick={() => { closeModal(); openModal({ type: "limits", cardId: card.id }); }}>Edit spend limits</Btn>
          <Btn size="sm" variant="outline" icon="flag" onClick={() => { closeModal(); window.setTimeout(() => scrollToId("activity"), 80); }}>View activity</Btn>
        </div>
      </div>
    </Modal>
  );
}
