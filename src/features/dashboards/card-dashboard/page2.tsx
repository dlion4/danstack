/* ============================================================================
 * Card Dashboard — page 5.2 · Physical Debit Cards (Bootstrap 5 edition)
 * ========================================================================== */

import { useEffect, useRef, useState } from "react";
import { cn } from "./utils/cn";
import { Icon, type IconName, NetworkMark } from "./icons";
import { Badge, Btn, Chip, FieldLabel, Modal, Progress, Reveal, SectionHead, Empty } from "./ui";
import { useApp, scrollToId } from "./store";
import {
  kes,
  kesShort,
  PHYS_TIERS,
  SEED_ADDRESSES,
  SEED_ORDERS,
  FEE_SCHEDULE,
  REPLACE_REASONS,
  type PhysTier,
  type PhysTierInfo,
  type CardOrder,
  type OrderStatus,
  type ReplaceReason,
} from "./data";
import { CardVisual } from "./modalsA";

/* ============ 01 · Hero & Tier Comparison ============ */

function TierCard({ tier, onCompare }: { tier: PhysTierInfo; onCompare: () => void }) {
  const popular = tier.id === "premium";
  return (
    <Reveal className="h-100">
      <div
        className="pmc-lift-lg position-relative d-flex flex-column overflow-hidden pmc-radius h-100"
        style={{
          background: "#fff",
          border: popular ? "2px solid var(--pmc-green)" : "2px solid var(--pmc-line)",
          boxShadow: popular ? "0 8px 30px -8px rgba(18,183,106,0.4)" : "var(--pmc-shadow)",
        }}
      >
        {popular && (
          <span
            className="position-absolute pmc-px-25 pmc-py-1 pmc-fs-10 fw-bold text-uppercase text-white"
            style={{ right: 16, top: 16, borderRadius: 99, background: "var(--pmc-green)", letterSpacing: "0.025em", zIndex: 1 }}
          >
            Most popular
          </span>
        )}
        {/* Card preview */}
        <div className="p-4 pb-0">
          <div className="pmc-card-visual pmc-card-sheen pmc-card-hover" style={{ background: tier.gradient }}>
            <div className="pmc-hero-dots position-absolute top-0 start-0 w-100 h-100" />
            <div className="position-relative d-flex h-100 flex-column justify-content-between p-4">
              <div className="d-flex align-items-start justify-content-between">
                <div>
                  <p className="pmc-display pmc-fs-135 fw-bold mb-0">PayMo</p>
                  <p className="pmc-fs-9 fw-semibold text-uppercase mb-0" style={{ letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)" }}>
                    {tier.id === "standard" ? "Standard Debit" : tier.id === "premium" ? "Premium Travel" : "BizSME Business"}
                  </p>
                </div>
                <NetworkMark network={tier.network} />
              </div>
              <div>
                <p className="pmc-display pmc-fs-15 fw-semibold mb-0" style={{ letterSpacing: "0.08em", color: "rgba(255,255,255,0.95)" }}>•••• •••• •••• ••••</p>
                <div className="pmc-mt-15 d-flex align-items-end justify-content-between">
                  <div className="pmc-fs-10 lh-sm">
                    <p className="fw-semibold text-uppercase mb-0" style={{ letterSpacing: "0.05em", color: "rgba(255,255,255,0.55)" }}>Card Holder</p>
                    <p className="fw-bold mb-0" style={{ letterSpacing: "0.025em", color: "rgba(255,255,255,0.95)" }}>YOUR NAME HERE</p>
                  </div>
                  <div className="text-end pmc-fs-10 lh-sm">
                    <p className="fw-semibold text-uppercase mb-0" style={{ letterSpacing: "0.05em", color: "rgba(255,255,255,0.55)" }}>Expires</p>
                    <p className="fw-bold mb-0" style={{ color: "rgba(255,255,255,0.95)" }}>MM/YY</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex flex-grow-1 flex-column pmc-p-5 pt-4">
          <h3 className="pmc-display pmc-fs-16 fw-bold pmc-ls-tight pmc-ink mb-0">{tier.name}</h3>
          <p className="pmc-mt-05 pmc-fs-125 fw-semibold pmc-muted">{tier.subtitle}</p>

          <div className="pmc-mt-3 d-flex align-items-baseline pmc-gap-2">
            {tier.issuanceFee === 0 ? (
              <span className="pmc-fs-115 fw-bold pmc-tone-green" style={{ borderRadius: 99, padding: "4px 10px" }}>Free issuance</span>
            ) : (
              <>
                <span className="pmc-num pmc-display pmc-fs-22 fw-bold pmc-ink">{kes(tier.issuanceFee)}</span>
                <span className="pmc-fs-115 fw-semibold pmc-faint">issuance fee</span>
              </>
            )}
            {tier.monthlyFee > 0 && (
              <span className="pmc-fs-115 fw-bold pmc-tone-blue" style={{ borderRadius: 99, padding: "4px 10px" }}>+{kes(tier.monthlyFee)}/mo</span>
            )}
          </div>

          <ul className="pmc-mt-4 flex-grow-1 d-flex flex-column pmc-gap-15 mb-0" style={{ listStyle: "none", padding: 0 }}>
            {tier.features.map((f) => (
              <li key={f} className="d-flex align-items-start pmc-gap-2 pmc-fs-12">
                <Icon name="check" size={13} className="pmc-mt-05 flex-none pmc-green" />
                <span className={cn(f.startsWith("All Standard") && "fw-bold pmc-ink", !f.startsWith("All Standard") && "pmc-ink-2")}>{f}</span>
              </li>
            ))}
          </ul>

          <div className="pmc-mt-4 row pmc-g-2 pmc-radius pmc-p-25 text-center" style={{ background: "rgba(242,244,248,0.7)" }}>
            <div className="col-4">
              <p className="pmc-num pmc-display pmc-fs-13 fw-bold pmc-ink mb-0">{kesShort(tier.limits.monthly)}</p>
              <p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Monthly</p>
            </div>
            <div className="col-4">
              <p className="pmc-num pmc-display pmc-fs-13 fw-bold pmc-ink mb-0">{kesShort(tier.limits.perTxn)}</p>
              <p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Per txn</p>
            </div>
            <div className="col-4">
              <p className="pmc-num pmc-display pmc-fs-13 fw-bold pmc-ink mb-0">{kesShort(tier.limits.dailyAtm)}</p>
              <p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Daily ATM</p>
            </div>
          </div>

          <Btn
            className="pmc-mt-4 w-100"
            variant={popular ? "primary" : "dark"}
            icon="plus"
            onClick={onCompare}
          >
            Issue {tier.id === "standard" ? "Standard" : tier.id === "premium" ? "Premium" : "BizSME"}
          </Btn>
        </div>
      </div>
    </Reveal>
  );
}

export function HeroAndTiers() {
  const { openModal, setPage } = useApp();
  const startWizard = (tier: PhysTier) => {
    window.dispatchEvent(new CustomEvent("pm-phys-wizard-tier", { detail: tier }));
    openModal({ type: "issue" });
  };

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
                  <span className="pmc-live-dot" /> BAAS · Cards
                </span>
                <span className="pmc-hero-chip">Module 5.2</span>
              </div>
              <h1 className="pmc-hero-title pmc-mt-3">
                Physical Debit Card<br className="d-none d-sm-inline" /> Management
              </h1>
              <p className="pmc-hero-sub">
                Issue, personalise, deliver and activate physical debit cards for your team. Standard, Premium Travel and BizSME tiers — each with distinct limits, FX rates and perks.
              </p>
              <div className="pmc-mt-4 d-flex flex-wrap pmc-gap-2">
                <Btn icon="plus" onClick={() => openModal({ type: "issue" })}>Issue New Card</Btn>
                <Btn variant="ghost" icon="card" onClick={() => scrollToId("orders")}>Track Orders</Btn>
                <Btn variant="ghost" onClick={() => setPage("5.1")}>← Command Center</Btn>
              </div>
              <div className="pmc-hero-stats">
                {[
                  { k: "Physical cards", v: "3 active" },
                  { k: "In delivery", v: "1" },
                  { k: "Issued MTD", v: "2" },
                  { k: "Activation rate", v: "98%" },
                ].map((s) => (
                  <div key={s.k} className="lh-sm">
                    <p className="pmc-hero-stat-value">{s.v}</p>
                    <p className="pmc-hero-stat-label">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pmc-hero-art" style={{ width: 280, height: 220 }}>
              <div className="position-absolute" style={{ right: 0, top: 8, width: 230, transform: "rotate(5deg)" }}>
                <div className="pmc-card-visual pmc-card-sheen" style={{ background: PHYS_TIERS[1].gradient }}>
                  <div className="pmc-hero-dots position-absolute top-0 start-0 w-100 h-100" />
                  <div className="position-relative d-flex h-100 flex-column justify-content-between p-4">
                    <p className="pmc-display pmc-fs-13 fw-bold mb-0">PayMo</p>
                    <p className="pmc-display pmc-fs-14 fw-semibold mb-0" style={{ letterSpacing: "0.08em", color: "rgba(255,255,255,0.9)" }}>5399 82•• •••• 8821</p>
                    <p className="pmc-fs-10 fw-bold mb-0" style={{ color: "rgba(255,255,255,0.8)" }}>DAVID OCHIENG</p>
                  </div>
                </div>
              </div>
              <div className="position-absolute" style={{ bottom: 0, left: 8, width: 230, transform: "rotate(-3deg)" }}>
                <div className="pmc-card-visual pmc-card-sheen" style={{ background: PHYS_TIERS[0].gradient }}>
                  <div className="pmc-hero-dots position-absolute top-0 start-0 w-100 h-100" />
                  <div className="position-relative d-flex h-100 flex-column justify-content-between p-4">
                    <p className="pmc-display pmc-fs-13 fw-bold mb-0">PayMo</p>
                    <p className="pmc-display pmc-fs-14 fw-semibold mb-0" style={{ letterSpacing: "0.08em", color: "rgba(255,255,255,0.9)" }}>4539 11•• •••• 4102</p>
                    <p className="pmc-fs-10 fw-bold mb-0" style={{ color: "rgba(255,255,255,0.8)" }}>GRACE KAMAU</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Tier comparison */}
      <SectionHead no="01" title="Card Tiers" sub="Choose the tier that fits — upgrade or add more cards anytime.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => scrollToId("fees")}>Full fee schedule</Btn>
      </SectionHead>

      <div className="row pmc-g-4">
        {PHYS_TIERS.map((t) => (
          <div key={t.id} className="col-12 col-md-4">
            <TierCard tier={t} onCompare={() => startWizard(t.id)} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ 02 · Card Orders & Delivery Tracking ============ */

const STATUS_META: Record<OrderStatus, { tone: "success" | "warning" | "info" | "danger" | "muted" | "violet"; label: string; icon: IconName }> = {
  processing: { tone: "muted", label: "Processing", icon: "clock" },
  dispatched: { tone: "info", label: "Dispatched", icon: "send" },
  "in-transit": { tone: "info", label: "In Transit", icon: "card" },
  delivered: { tone: "warning", label: "Delivered", icon: "inbox" },
  activated: { tone: "success", label: "Activated", icon: "checkCircle" },
  failed: { tone: "danger", label: "Failed", icon: "alertTri" },
};

function OrderRow({ order, cards, openModal, toast }: { order: CardOrder; cards: any[]; openModal: any; toast: any }) {
  const meta = STATUS_META[order.status];
  const tier = PHYS_TIERS.find((t) => t.id === order.tier);
  const card = cards.find((c) => c.holder === order.holderName && c.kind === "physical");

  const steps: { key: OrderStatus; label: string }[] = [
    { key: "processing", label: "Ordered" },
    { key: "dispatched", label: "Dispatched" },
    { key: "in-transit", label: "In transit" },
    { key: "delivered", label: "Delivered" },
    { key: "activated", label: "Activated" },
  ];
  const stepIdx = steps.findIndex((s) => s.key === order.status);

  return (
    <Reveal className="h-100">
      <div className="pmc-card pmc-lift p-4 h-100">
        <div className="d-flex flex-wrap align-items-start pmc-gap-3">
          <span
            className={cn("pmc-icon-sq-lg d-grid", meta.tone === "success" ? "pmc-tone-green" : meta.tone === "info" ? "pmc-tone-blue" : meta.tone === "warning" ? "pmc-tone-warn" : "pmc-tone-muted")}
          >
            <Icon name={meta.icon} size={18} />
          </span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex flex-wrap align-items-center pmc-gap-2">
              <h4 className="pmc-fs-14 fw-bold pmc-ink mb-0">{tier?.name ?? order.tier}</h4>
              <Badge tone={meta.tone} dot>{meta.label}</Badge>
              <span className="pmc-fs-11 fw-semibold pmc-faint">Tracking: {order.trackingNo}</span>
            </div>
            <p className="pmc-mt-05 pmc-fs-12 fw-semibold pmc-muted mb-0">
              {order.holderName} · Ordered {order.orderedOn} · {order.courier}
            </p>
          </div>
        </div>

        {/* Progress stepper */}
        <div className="pmc-mt-4 d-flex align-items-center pmc-gap-1">
          {steps.map((s, i) => (
            <div key={s.key} className="d-flex align-items-center pmc-gap-1">
              <div className="d-flex flex-column align-items-center">
                <span className={cn("pmc-step-dot", i < stepIdx && "done", i === stepIdx && "current")}>
                  {i < stepIdx ? <Icon name="check" size={10} /> : i + 1}
                </span>
                <span className={cn("pmc-mt-1 pmc-fs-95 fw-bold", i <= stepIdx ? "pmc-ink" : "pmc-faint")}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <span className={cn("pmc-step-line short", i < stepIdx && "done")} style={{ marginTop: -12 }} />}
            </div>
          ))}
        </div>

        <div className="pmc-mt-3 d-flex flex-wrap align-items-center pmc-gap-2 pt-3" style={{ borderTop: "1px solid rgba(230,233,240,0.7)" }}>
          <div className="flex-grow-1 pmc-fs-115 fw-semibold pmc-faint">
            {order.deliveryMethod === "branch-pickup" ? "Collect at branch with valid ID" : `Delivering to: ${order.addressLabel} · ETA ${order.estimatedDelivery}`}
          </div>
          {order.status === "delivered" && !order.activationOtpSent && (
            <Btn size="sm" icon="key" onClick={() => { openModal({ type: "activate", cardId: card?.id ?? "" }); }}>Activate Card</Btn>
          )}
          {order.status === "in-transit" && (
            <Btn size="sm" variant="outline" icon="phone" onClick={() => toast("info", "Contacting courier", `${order.courier} · tracking ${order.trackingNo}`)}>Contact Courier</Btn>
          )}
          {card && order.status === "activated" && (
            <Btn size="sm" variant="outline" icon="chevRight" onClick={() => openModal({ type: "limits", cardId: card.id })}>Manage Card</Btn>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export function OrdersSection() {
  const { cards, openModal, toast } = useApp();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const orders = SEED_ORDERS;
  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <section id="orders" className="pmc-scroll-mt">
      <SectionHead no="02" title="Card Orders & Delivery" sub="Every physical card order from issuance to activation.">
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "issue" })}>New Order</Btn>
      </SectionHead>

      <div className="pmc-thin-scroll pmc-mb-4 d-flex pmc-gap-2 overflow-auto pb-1">
        <Chip on={filter === "all"} onClick={() => setFilter("all")} count={orders.length}>All</Chip>
        {(["processing", "dispatched", "in-transit", "delivered", "activated"] as OrderStatus[]).map((s) => {
          const m = STATUS_META[s];
          const count = orders.filter((o) => o.status === s).length;
          if (count === 0) return null;
          return <Chip key={s} on={filter === s} onClick={() => setFilter(s)} count={count}>{m.label}</Chip>;
        })}
      </div>

      {shown.length === 0 ? (
        <Empty icon="inbox" title="No orders in this status" sub="Issue a new card to create an order." action={<Btn size="sm" icon="plus" onClick={() => openModal({ type: "issue" })}>Issue Card</Btn>} />
      ) : (
        <div className="row pmc-g-3">
          {shown.map((o) => (
            <div key={o.id} className="col-12 col-lg-6">
              <OrderRow order={o} cards={cards} openModal={openModal} toast={toast} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============ 03 · My Physical Cards ============ */

export function MyPhysCardsSection() {
  const { cards, openDrawer, openModal, setCardStatus, toast, pushNotif } = useApp();
  const physCards = cards.filter((c) => c.kind === "physical");

  return (
    <section id="mycards" className="pmc-scroll-mt">
      <SectionHead no="03" title="My Physical Cards" sub="Tap for the full control drawer — freeze, limits, PIN and activity.">
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "issue" })}>Issue Card</Btn>
      </SectionHead>

      {physCards.length === 0 ? (
        <Empty icon="card" title="No physical cards yet" sub="Issue your first physical debit card — it ships in 2–3 days." action={<Btn size="sm" icon="plus" onClick={() => openModal({ type: "issue" })}>Issue Card</Btn>} />
      ) : (
        <div className="row pmc-g-4">
          {physCards.map((c, i) => {
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
                      <Badge tone={c.status === "active" ? "success" : c.status === "frozen" ? "info" : c.status === "delivering" ? "warning" : "danger"} dot className="text-capitalize">{c.status}</Badge>
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
                        <Btn size="sm" icon="zap" className="flex-grow-1" onClick={() => { setCardStatus(c.id, "active"); toast("success", `${c.nickname} unfrozen`); pushNotif({ channel: "push", title: "Card unfrozen", body: `${c.nickname} •• ${c.last4} is active again.` }); }}>Unfreeze</Btn>
                      ) : c.status === "active" ? (
                        <Btn size="sm" variant="dangerGhost" icon="snow" className="flex-grow-1" onClick={() => openModal({ type: "freeze", cardId: c.id })}>Freeze</Btn>
                      ) : (
                        <span className="flex-grow-1 pmc-radius-sm pmc-px-3 pmc-py-15 text-center pmc-fs-115 fw-bold pmc-faint" style={{ background: "var(--pmc-canvas)" }}>
                          {c.status === "blocked" ? "Permanently blocked" : "Awaiting delivery"}
                        </span>
                      )}
                      <button type="button" onClick={() => openModal({ type: "limits", cardId: c.id })} title="Limits" aria-label={`Limits for ${c.nickname}`} className="pmc-icon-btn pmc-icon-btn-sm pmc-focus"><Icon name="sliders" size={14} /></button>
                      <button type="button" onClick={() => openModal({ type: "replace", cardId: c.id })} title="Replace" aria-label={`Replace ${c.nickname}`} className="pmc-icon-btn pmc-icon-btn-sm pmc-focus pmc-icon-btn-blue"><Icon name="refresh" size={14} /></button>
                      <button type="button" onClick={() => openDrawer({ type: "card", cardId: c.id })} title="Details" aria-label={`Open ${c.nickname} details`} className="pmc-icon-btn pmc-icon-btn-sm pmc-focus"><Icon name="chevRight" size={14} /></button>
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

/* ============ 04 · Fee Schedule ============ */

export function FeeSection() {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? FEE_SCHEDULE : FEE_SCHEDULE.slice(0, 8);
  return (
    <section id="fees" className="pmc-scroll-mt">
      <SectionHead no="04" title="Fee Schedule" sub="Complete pricing for every physical card product and service.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => alert("Fee schedule exported as PDF.")}>Export PDF</Btn>
      </SectionHead>
      <Reveal>
        <div className="pmc-table-frame">
          <div className="table-responsive">
            <table className="table pmc-table w-100 text-start align-middle">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Amount</th>
                  <th scope="col" className="d-none d-sm-table-cell">Note</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((f, i) => (
                  <tr key={i}>
                    <td className="fw-bold pmc-ink">{f.item}</td>
                    <td className="pmc-num pmc-display fw-bold pmc-ink">{f.amount}</td>
                    <td className="d-none d-sm-table-cell fw-semibold pmc-muted">{f.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!expanded && FEE_SCHEDULE.length > 8 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="pmc-focus d-flex w-100 align-items-center justify-content-center pmc-gap-15 pmc-py-3 pmc-fs-12 fw-bold pmc-green-dark"
              style={{ border: "none", borderTop: "1px solid var(--pmc-line)", background: "none" }}
            >
              <Icon name="chevDown" size={13} /> Show all {FEE_SCHEDULE.length} fees
            </button>
          )}
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 05 · Delivery Address Book ============ */

export function AddressSection() {
  const { toast } = useApp();
  const [addresses, setAddresses] = useState(SEED_ADDRESSES);

  const setDefault = (id: string) => {
    setAddresses((as) => as.map((a) => ({ ...a, isDefault: a.id === id })));
    toast("success", "Default address updated");
  };

  return (
    <section id="addresses" className="pmc-scroll-mt">
      <SectionHead no="05" title="Delivery Addresses" sub="Saved addresses for card dispatch. Default is used for new orders.">
        <Btn size="sm" icon="plus" onClick={() => toast("info", "Address form coming soon", "Add a new delivery address in the issuance wizard.")}>Add Address</Btn>
      </SectionHead>
      <div className="row pmc-g-3">
        {addresses.map((a, i) => (
          <div key={a.id} className="col-12 col-sm-6 col-lg-4">
            <Reveal delay={i * 60} className="h-100">
              <div
                className="pmc-lift p-4 h-100"
                style={{
                  background: "#fff",
                  borderRadius: "var(--pmc-radius)",
                  border: a.isDefault ? "1px solid rgba(18,183,106,0.5)" : "1px solid var(--pmc-line)",
                  boxShadow: "var(--pmc-shadow)",
                }}
              >
                <div className="d-flex align-items-start justify-content-between">
                  <div>
                    <p className="d-flex align-items-center pmc-gap-2 pmc-fs-135 fw-bold pmc-ink mb-0">
                      {a.label}
                      {a.isDefault && <Badge tone="success">Default</Badge>}
                    </p>
                    <p className="pmc-mt-1 pmc-fs-12 pmc-muted mb-0" style={{ lineHeight: 1.65 }}>{a.line1}<br />{a.line2}<br />{a.city}, {a.county}</p>
                    <p className="pmc-mt-15 pmc-fs-115 fw-semibold pmc-faint mb-0">{a.phone}</p>
                  </div>
                  <span className="pmc-icon-sq d-grid pmc-tone-muted"><Icon name="building" size={16} /></span>
                </div>
                <div className="pmc-mt-3 d-flex pmc-gap-2 pt-3" style={{ borderTop: "1px solid rgba(230,233,240,0.7)" }}>
                  {!a.isDefault && <Btn size="sm" variant="outline" onClick={() => setDefault(a.id)}>Set Default</Btn>}
                  <Btn size="sm" variant="outline" icon="pencil" onClick={() => toast("info", "Edit address", "Address editor opens in the full issuance flow.")}>Edit</Btn>
                </div>
              </div>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ 06 · Replacement & Renewal ============ */

export function ReplacementSection() {
  const { cards, openModal } = useApp();
  const physCards = cards.filter((c) => c.kind === "physical" && c.status !== "delivering");

  return (
    <section id="replacement" className="pmc-scroll-mt">
      <SectionHead no="06" title="Replacement & Renewal" sub="Report a lost, stolen or damaged card — we block the old one and dispatch a new one immediately." />
      <Reveal>
        <div className="pmc-card pmc-p-5">
          <p className="pmc-mb-3 pmc-fs-13 fw-bold pmc-ink">Select a card to replace</p>
          {physCards.length === 0 ? (
            <Empty icon="card" title="No physical cards to replace" sub="Issue a card first, then come back here if it's lost or damaged." />
          ) : (
            <div className="d-flex flex-column pmc-gap-2">
              {physCards.map((c) => (
                <div key={c.id} className="d-flex flex-wrap align-items-center pmc-gap-3 pmc-radius pmc-px-4 pmc-py-3" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}>
                  <span className="pmc-icon-sq d-grid pmc-tone-green" style={{ boxShadow: "0 1px 2px rgba(16,24,40,0.06)" }}><Icon name="card" size={16} /></span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="pmc-fs-13 fw-bold pmc-ink mb-0">{c.nickname}</p>
                    <p className="pmc-fs-11 fw-semibold pmc-faint mb-0">{c.holder.toLowerCase()} · •• {c.last4} · <Badge tone={c.status === "active" ? "success" : c.status === "frozen" ? "info" : "danger"} className="text-capitalize">{c.status}</Badge></p>
                  </div>
                  <Btn size="sm" variant="outline" icon="refresh" onClick={() => openModal({ type: "replace", cardId: c.id })}>Replace</Btn>
                </div>
              ))}
            </div>
          )}
          <div className="pmc-mt-4 row pmc-g-2">
            {REPLACE_REASONS.map((r) => (
              <div key={r.id} className="col-12 col-sm-6 col-lg-4">
                <div className="pmc-radius pmc-p-3 text-center h-100" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}>
                  <Icon name={r.id === "lost" ? "search" : r.id === "stolen" ? "shield" : r.id === "damaged" ? "alertTri" : r.id === "expired" ? "clock" : "users"} size={20} className="mx-auto pmc-muted" />
                  <p className="pmc-mt-2 pmc-fs-125 fw-bold pmc-ink mb-0">{r.label}</p>
                  <p className="pmc-mt-05 pmc-fs-11 pmc-muted mb-0">{r.blurb}</p>
                  <p className="pmc-mt-1 pmc-num pmc-display pmc-fs-13 fw-bold pmc-ink mb-0">{r.fee === 0 ? "Free" : kes(r.fee)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============ Activation Modal ============ */

export function ActivateModal() {
  const { modal, closeModal, cards, toast, setCardStatus, pushNotif } = useApp();
  const open = modal?.type === "activate";
  const card = cards.find((c) => c.id === (modal?.type === "activate" ? modal.cardId : ""));
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) { setOtp(["", "", "", "", "", ""]); setSent(false); setDone(false); }
  }, [open]);

  if (!open || !card) return null;

  const onDigit = (i: number, v: string) => {
    const val = v.replace(/\D/g, "").slice(-1);
    setOtp((d) => d.map((x, xi) => (xi === i ? val : x)));
    if (val && i < 5) refs.current[i + 1]?.focus();
  };
  const complete = otp.every((d) => d !== "");

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="key"
      title={done ? "Card activated!" : sent ? "Enter activation OTP" : "Activate your card"}
      subtitle={done ? undefined : sent ? `A 6-digit OTP was sent to +254 7•• ••• 213 for ${card.nickname} •• ${card.last4}.` : "We'll send an OTP to the phone number on file. Enter it to activate the card for use."}
      footer={
        done ? (
          <Btn icon="check" onClick={closeModal}>Done</Btn>
        ) : !sent ? (
          <>
            <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
            <Btn icon="send" onClick={() => { setSent(true); toast("info", "OTP sent", "Check your phone — the code expires in 5 minutes."); }}>Send OTP</Btn>
          </>
        ) : (
          <>
            <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
            <Btn icon="check" disabled={!complete} onClick={() => {
              setDone(true);
              setCardStatus(card.id, "active");
              toast("success", `${card.nickname} activated`, "Your card is now ready for payments.");
              pushNotif({ channel: "push", title: "Card activated", body: `${card.nickname} •• ${card.last4} is now live.` });
            }}>Activate</Btn>
          </>
        )
      }
    >
      {done ? (
        <div className="d-flex flex-column align-items-center pmc-gap-3 pmc-py-6 text-center">
          <span className="pmc-done-icon"><Icon name="checkCircle" size={26} /></span>
          <p className="pmc-display pmc-fs-15 fw-bold pmc-ink mb-0">{card.nickname} is now live</p>
          <p className="pmc-fs-125 pmc-muted mb-0" style={{ maxWidth: 280, lineHeight: 1.65 }}>You can start using it immediately for contactless, online and ATM transactions.</p>
        </div>
      ) : sent ? (
        <div className="pmc-py-2">
          <FieldLabel>6-digit OTP</FieldLabel>
          <div className="d-flex justify-content-center pmc-gap-25">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                inputMode="numeric"
                type="password"
                value={d}
                onChange={(e) => onDigit(i, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus(); }}
                className="pmc-otp-box pmc-focus"
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => { setOtp(["", "", "", "", "", ""]); toast("info", "OTP resent", "A new code has been sent."); }}
            className="pmc-mt-4 pmc-focus d-flex w-100 align-items-center justify-content-center pmc-gap-15 pmc-fs-12 fw-bold pmc-green-dark"
            style={{ background: "none", border: "none", padding: 0 }}
          >
            <Icon name="refresh" size={13} /> Resend OTP
          </button>
        </div>
      ) : (
        <div className="pmc-py-2">
          <div className="mx-auto" style={{ maxWidth: 300 }}><CardVisual card={card} small /></div>
          <p className="pmc-mt-3 text-center pmc-fs-125 pmc-muted mb-0">The card was delivered to your address. Activate it to start transacting.</p>
        </div>
      )}
    </Modal>
  );
}

/* ============ Replacement Modal ============ */

export function ReplaceModal() {
  const { modal, closeModal, cards, toast, blockAndReplace } = useApp();
  const open = modal?.type === "replace";
  const card = cards.find((c) => c.id === (modal?.type === "replace" ? modal.cardId : ""));
  const [reason, setReason] = useState<ReplaceReason>("lost");
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) { setReason("lost"); setStep(1); setPin(""); setDone(false); }
  }, [open]);

  if (!open || !card) return null;
  const reasonMeta = REPLACE_REASONS.find((r) => r.id === reason);

  return (
    <Modal
      open={open}
      onClose={closeModal}
      tone={done ? "default" : "danger"}
      icon={done ? "checkCircle" : "refresh"}
      title={done ? "Replacement ordered" : `Replace ${card.nickname}?`}
      subtitle={done ? undefined : "The old card will be permanently blocked. A new physical card is dispatched immediately."}
      width="max-w-xl"
      footer={
        done ? (
          <Btn icon="check" onClick={closeModal}>Done</Btn>
        ) : step === 1 ? (
          <>
            <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
            <Btn icon="arrowRight" onClick={() => setStep(2)}>Continue</Btn>
          </>
        ) : (
          <>
            <Btn variant="outline" icon="chevLeft" onClick={() => setStep(1)}>Back</Btn>
            <Btn variant="danger" icon="lock" disabled={pin.length !== 4} onClick={() => {
              blockAndReplace(card.id, []);
              setDone(true);
              toast("success", "Replacement ordered", `Old card blocked. New ${card.tier === "premium" ? "Premium" : "Standard"} card dispatched.`);
            }}>Confirm Replacement</Btn>
          </>
        )
      }
    >
      {done ? (
        <div className="d-flex flex-column align-items-center pmc-gap-3 pmc-py-6 text-center">
          <span className="pmc-done-icon"><Icon name="checkCircle" size={26} /></span>
          <p className="pmc-fs-13 pmc-muted mb-0" style={{ maxWidth: 320, lineHeight: 1.65 }}>Old card permanently blocked. A new physical card has been dispatched — track it in <strong className="pmc-ink">Card Orders</strong>.</p>
        </div>
      ) : step === 1 ? (
        <div className="d-flex flex-column pmc-gap-3">
          <div className="mx-auto" style={{ maxWidth: 300 }}><CardVisual card={card} small /></div>
          <FieldLabel>Why are you replacing this card?</FieldLabel>
          <div className="d-flex flex-column pmc-gap-15">
            {REPLACE_REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReason(r.id)}
                className={cn("pmc-choice pmc-focus", reason === r.id && "on-danger")}
                style={{ padding: 12 }}
              >
                <span className={cn("pmc-radio-dot pmc-mt-05", reason === r.id && "on-danger")} />
                <div>
                  <p className="pmc-fs-125 fw-bold pmc-ink mb-0">{r.label} <span className="pmc-num pmc-display pmc-fs-115 fw-bold pmc-muted">({r.fee === 0 ? "Free" : kes(r.fee)})</span></p>
                  <p className="pmc-fs-11 lh-sm pmc-muted mb-0">{r.blurb}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column pmc-gap-4">
          <div className="pmc-radius overflow-hidden" style={{ border: "1px solid var(--pmc-line)" }}>
            {[
              ["Card", `${card.nickname} •• ${card.last4}`],
              ["Action", "Permanent block + new card issued"],
              ["Reason", reasonMeta?.label ?? "—"],
              ["Fee", reasonMeta ? (reasonMeta.fee === 0 ? "Free" : kes(reasonMeta.fee)) : "—"],
              ["Delivery", "2–3 working days (metro)"],
            ].map(([k, v]) => (
              <div key={k} className="pmc-kv">
                <span className="fw-semibold pmc-muted">{k}</span>
                <span className="fw-bold pmc-ink">{v}</span>
              </div>
            ))}
          </div>
          <div>
            <FieldLabel>Enter PIN to authorise</FieldLabel>
            <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" className="pmc-focus pmc-pin-input danger-focus" style={{ letterSpacing: "0.5em" }} />
          </div>
        </div>
      )}
    </Modal>
  );
}
