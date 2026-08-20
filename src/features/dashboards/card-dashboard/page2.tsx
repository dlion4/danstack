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
    <Reveal>
      <div
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-pm-lg",
          popular ? "border-pmgreen shadow-[0_8px_30px_-8px_rgba(18,183,106,0.4)]" : "border-line shadow-pm"
        )}
      >
        {popular && (
          <span className="absolute right-4 top-4 rounded-full bg-pmgreen px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Most popular
          </span>
        )}
        {/* Card preview */}
        <div className="p-4 pb-0">
          <div
            className="card-sheen card-hover aspect-[1.62] w-full overflow-hidden rounded-2xl text-white shadow-[var(--shadow-card)]"
            style={{ background: tier.gradient }}
          >
            <div className="pm-hero-dots absolute inset-0" />
            <div className="relative flex h-full flex-col justify-between p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-[13.5px] font-bold">PayMo</p>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/60">
                    {tier.id === "standard" ? "Standard Debit" : tier.id === "premium" ? "Premium Travel" : "BizSME Business"}
                  </p>
                </div>
                <NetworkMark network={tier.network} />
              </div>
              <div>
                <p className="font-display text-[15px] font-semibold tracking-[0.08em] text-white/95">•••• •••• •••• ••••</p>
                <div className="mt-1.5 flex items-end justify-between">
                  <div className="text-[10px] leading-tight">
                    <p className="font-semibold uppercase tracking-wider text-white/55">Card Holder</p>
                    <p className="font-bold tracking-wide text-white/95">YOUR NAME HERE</p>
                  </div>
                  <div className="text-right text-[10px] leading-tight">
                    <p className="font-semibold uppercase tracking-wider text-white/55">Expires</p>
                    <p className="font-bold text-white/95">MM/YY</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 pt-4">
          <h3 className="font-display text-[16px] font-bold tracking-tight text-ink">{tier.name}</h3>
          <p className="mt-0.5 text-[12.5px] font-semibold text-muted">{tier.subtitle}</p>

          <div className="mt-3 flex items-baseline gap-2">
            {tier.issuanceFee === 0 ? (
              <span className="rounded-full bg-pmgreen-soft px-2.5 py-1 text-[11.5px] font-bold text-[#067647]">Free issuance</span>
            ) : (
              <>
                <span className="num font-display text-[22px] font-bold text-ink">{kes(tier.issuanceFee)}</span>
                <span className="text-[11.5px] font-semibold text-faint">issuance fee</span>
              </>
            )}
            {tier.monthlyFee > 0 && (
              <span className="rounded-full bg-pmblue-soft px-2.5 py-1 text-[11.5px] font-bold text-[#175cd3]">+{kes(tier.monthlyFee)}/mo</span>
            )}
          </div>

          <ul className="mt-4 flex-1 space-y-1.5">
            {tier.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[12px]">
                <Icon name="check" size={13} className="mt-0.5 flex-none text-pmgreen" strokeWidth={2.5} />
                <span className={cn(f.startsWith("All Standard") && "font-bold text-ink", !f.startsWith("All Standard") && "text-ink-2")}>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-canvas/70 p-2.5 text-center">
            <div>
              <p className="num font-display text-[13px] font-bold text-ink">{kesShort(tier.limits.monthly)}</p>
              <p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Monthly</p>
            </div>
            <div>
              <p className="num font-display text-[13px] font-bold text-ink">{kesShort(tier.limits.perTxn)}</p>
              <p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Per txn</p>
            </div>
            <div>
              <p className="num font-display text-[13px] font-bold text-ink">{kesShort(tier.limits.dailyAtm)}</p>
              <p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Daily ATM</p>
            </div>
          </div>

          <Btn
            className="mt-4 w-full"
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
    <section id="overview" className="scroll-mt-24">
      {/* Hero */}
      <Reveal>
        <div className="pm-hero relative overflow-hidden rounded-2xl border border-line p-5 text-white shadow-pm sm:p-7">
          <div className="pm-hero-dots absolute inset-0" />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="min-w-0 flex-1 basis-[300px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#cfe8db]">
                  <span className="live-dot" /> BAAS · Cards
                </span>
                <span className="rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-[#cfe8db]">Module 5.2</span>
              </div>
              <h1 className="font-display mt-3 text-[26px] font-bold leading-[1.1] tracking-tight sm:text-[34px]">
                Physical Debit Card<br className="hidden sm:block" /> Management
              </h1>
              <p className="mt-2 max-w-[480px] text-[13px] leading-relaxed text-white/65">
                Issue, personalise, deliver and activate physical debit cards for your team. Standard, Premium Travel and BizSME tiers — each with distinct limits, FX rates and perks.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn icon="plus" onClick={() => openModal({ type: "issue" })}>Issue New Card</Btn>
                <Btn variant="ghost" icon="card" onClick={() => scrollToId("orders")}>Track Orders</Btn>
                <Btn variant="ghost" onClick={() => setPage("5.1")}>← Command Center</Btn>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { k: "Physical cards", v: "3 active" },
                  { k: "In delivery", v: "1" },
                  { k: "Issued MTD", v: "2" },
                  { k: "Activation rate", v: "98%" },
                ].map((s) => (
                  <div key={s.k} className="leading-tight">
                    <p className="font-display num text-[17px] font-bold text-white">{s.v}</p>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/45">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden h-[220px] w-[280px] flex-none md:block">
              <div className="absolute right-0 top-2 w-[230px] rotate-[5deg]">
                <div className="card-sheen aspect-[1.62] w-full rounded-2xl text-white shadow-[var(--shadow-card)]" style={{ background: PHYS_TIERS[1].gradient }}>
                  <div className="pm-hero-dots absolute inset-0" />
                  <div className="relative flex h-full flex-col justify-between p-4">
                    <p className="font-display text-[13px] font-bold">PayMo</p>
                    <p className="font-display text-[14px] font-semibold tracking-[0.08em] text-white/90">5399 82•• •••• 8821</p>
                    <p className="text-[10px] font-bold text-white/80">DAVID OCHIENG</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-2 w-[230px] -rotate-[3deg]">
                <div className="card-sheen aspect-[1.62] w-full rounded-2xl text-white shadow-[var(--shadow-card)]" style={{ background: PHYS_TIERS[0].gradient }}>
                  <div className="pm-hero-dots absolute inset-0" />
                  <div className="relative flex h-full flex-col justify-between p-4">
                    <p className="font-display text-[13px] font-bold">PayMo</p>
                    <p className="font-display text-[14px] font-semibold tracking-[0.08em] text-white/90">4539 11•• •••• 4102</p>
                    <p className="text-[10px] font-bold text-white/80">GRACE KAMAU</p>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PHYS_TIERS.map((t) => (
          <TierCard key={t.id} tier={t} onCompare={() => startWizard(t.id)} />
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
    <Reveal>
      <div className="rounded-2xl border border-line bg-white p-4 shadow-pm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pm-lg">
        <div className="flex flex-wrap items-start gap-3">
          <span className={cn("grid h-10 w-10 flex-none place-items-center rounded-xl", meta.tone === "success" ? "bg-pmgreen-soft text-[#067647]" : meta.tone === "info" ? "bg-pmblue-soft text-[#175cd3]" : meta.tone === "warning" ? "bg-warn-soft text-[#93370d]" : "bg-canvas text-muted")}>
            <Icon name={meta.icon} size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-[14px] font-bold text-ink">{tier?.name ?? order.tier}</h4>
              <Badge tone={meta.tone} dot>{meta.label}</Badge>
              <span className="text-[11px] font-semibold text-faint">Tracking: {order.trackingNo}</span>
            </div>
            <p className="mt-0.5 text-[12px] font-semibold text-muted">
              {order.holderName} · Ordered {order.orderedOn} · {order.courier}
            </p>
          </div>
        </div>

        {/* Progress stepper */}
        <div className="mt-4 flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1">
              <div className="flex flex-col items-center">
                <span className={cn(
                  "grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold transition-all",
                  i < stepIdx ? "bg-pmgreen text-white" : i === stepIdx ? "bg-ink text-white ring-2 ring-pmgreen/40 ring-offset-1" : "bg-canvas text-faint"
                )}>
                  {i < stepIdx ? <Icon name="check" size={10} strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn("mt-1 text-[9.5px] font-bold", i <= stepIdx ? "text-ink" : "text-faint")}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <span className={cn("mt-[-12px] h-[2px] w-4 sm:w-8", i < stepIdx ? "bg-pmgreen" : "bg-line")} />}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/70 pt-3">
          <div className="flex-1 text-[11.5px] font-semibold text-faint">
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
    <section id="orders" className="scroll-mt-24">
      <SectionHead no="02" title="Card Orders & Delivery" sub="Every physical card order from issuance to activation.">
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "issue" })}>New Order</Btn>
      </SectionHead>

      <div className="thin-scroll mb-4 flex gap-2 overflow-x-auto pb-1">
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
        <div className="grid gap-3 lg:grid-cols-2">
          {shown.map((o) => <OrderRow key={o.id} order={o} cards={cards} openModal={openModal} toast={toast} />)}
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
    <section id="mycards" className="scroll-mt-24">
      <SectionHead no="03" title="My Physical Cards" sub="Tap for the full control drawer — freeze, limits, PIN and activity.">
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "issue" })}>Issue Card</Btn>
      </SectionHead>

      {physCards.length === 0 ? (
        <Empty icon="card" title="No physical cards yet" sub="Issue your first physical debit card — it ships in 2–3 days." action={<Btn size="sm" icon="plus" onClick={() => openModal({ type: "issue" })}>Issue Card</Btn>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {physCards.map((c, i) => {
            const usage = Math.round((c.spentMonth / c.limitMonth) * 100);
            return (
              <Reveal key={c.id} delay={(i % 3) * 70}>
                <div className="group rounded-2xl border border-line bg-white p-3.5 shadow-pm transition-all duration-200 hover:-translate-y-1 hover:shadow-pm-lg">
                  <button onClick={() => openDrawer({ type: "card", cardId: c.id })} className="card-hover block w-full text-left" aria-label={`Open ${c.nickname} details`}>
                    <CardVisual card={c} />
                  </button>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-[13.5px] font-bold text-ink">
                        {c.nickname}
                        {c.tag && <Badge tone={c.status === "delivering" ? "warning" : "success"}>{c.tag}</Badge>}
                      </p>
                      <p className="text-[11px] font-semibold text-faint">{c.holder.toLowerCase()} · •• {c.last4}</p>
                    </div>
                    <Badge tone={c.status === "active" ? "success" : c.status === "frozen" ? "info" : c.status === "delivering" ? "warning" : "danger"} dot className="capitalize">{c.status}</Badge>
                  </div>
                  <div className="mt-2.5">
                    <div className="mb-1 flex justify-between text-[10.5px] font-bold text-faint">
                      <span className="num">{kesShort(c.spentMonth)} spent</span>
                      <span className="num">{usage}% of {kesShort(c.limitMonth)}</span>
                    </div>
                    <Progress value={usage} tone={usage > 85 ? "red" : usage > 60 ? "amber" : "green"} />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 border-t border-line/70 pt-3">
                    {c.status === "frozen" ? (
                      <Btn size="sm" icon="zap" className="flex-1" onClick={() => { setCardStatus(c.id, "active"); toast("success", `${c.nickname} unfrozen`); pushNotif({ channel: "push", title: "Card unfrozen", body: `${c.nickname} •• ${c.last4} is active again.` }); }}>Unfreeze</Btn>
                    ) : c.status === "active" ? (
                      <Btn size="sm" variant="dangerGhost" icon="snow" className="flex-1" onClick={() => openModal({ type: "freeze", cardId: c.id })}>Freeze</Btn>
                    ) : (
                      <span className="flex-1 rounded-[10px] bg-canvas px-3 py-1.5 text-center text-[11.5px] font-bold text-faint">
                        {c.status === "blocked" ? "Permanently blocked" : "Awaiting delivery"}
                      </span>
                    )}
                    <button onClick={() => openModal({ type: "limits", cardId: c.id })} title="Limits" className="focus-ring grid h-8 w-8 place-items-center rounded-[9px] border border-line text-muted transition hover:border-pmgreen/50 hover:bg-pmgreen-soft hover:text-[#067647]"><Icon name="sliders" size={14} /></button>
                    <button onClick={() => openModal({ type: "replace", cardId: c.id })} title="Replace" className="focus-ring grid h-8 w-8 place-items-center rounded-[9px] border border-line text-muted transition hover:border-pmblue/50 hover:bg-pmblue-soft hover:text-[#175cd3]"><Icon name="refresh" size={14} /></button>
                    <button onClick={() => openDrawer({ type: "card", cardId: c.id })} title="Details" className="focus-ring grid h-8 w-8 place-items-center rounded-[9px] border border-line text-muted transition hover:border-pmgreen/50 hover:bg-pmgreen-soft hover:text-[#067647]"><Icon name="chevRight" size={14} /></button>
                  </div>
                </div>
              </Reveal>
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
    <section id="fees" className="scroll-mt-24">
      <SectionHead no="04" title="Fee Schedule" sub="Complete pricing for every physical card product and service.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => alert("Fee schedule exported as PDF.")}>Export PDF</Btn>
      </SectionHead>
      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line bg-canvas/70 text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint">
                <th className="px-4 py-2.5">Item</th>
                <th className="px-3 py-2.5">Amount</th>
                <th className="hidden px-3 py-2.5 sm:table-cell">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {shown.map((f, i) => (
                <tr key={i} className="text-[12.5px] transition hover:bg-pmgreen-soft/15">
                  <td className="px-4 py-2.5 font-bold text-ink">{f.item}</td>
                  <td className="num px-3 py-2.5 font-display font-bold text-ink">{f.amount}</td>
                  <td className="hidden px-3 py-2.5 font-semibold text-muted sm:table-cell">{f.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!expanded && FEE_SCHEDULE.length > 8 && (
            <button onClick={() => setExpanded(true)} className="flex w-full items-center justify-center gap-1.5 border-t border-line py-3 text-[12px] font-bold text-pmgreen-dark transition hover:bg-pmgreen-soft/30">
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
    <section id="addresses" className="scroll-mt-24">
      <SectionHead no="05" title="Delivery Addresses" sub="Saved addresses for card dispatch. Default is used for new orders.">
        <Btn size="sm" icon="plus" onClick={() => toast("info", "Address form coming soon", "Add a new delivery address in the issuance wizard.")}>Add Address</Btn>
      </SectionHead>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {addresses.map((a, i) => (
          <Reveal key={a.id} delay={i * 60}>
            <div className={cn("rounded-2xl border bg-white p-4 shadow-pm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pm-lg", a.isDefault ? "border-pmgreen/50" : "border-line")}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-2 text-[13.5px] font-bold text-ink">
                    {a.label}
                    {a.isDefault && <Badge tone="success">Default</Badge>}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{a.line1}<br />{a.line2}<br />{a.city}, {a.county}</p>
                  <p className="mt-1.5 text-[11.5px] font-semibold text-faint">{a.phone}</p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-canvas text-muted"><Icon name="building" size={16} /></span>
              </div>
              <div className="mt-3 flex gap-2 border-t border-line/70 pt-3">
                {!a.isDefault && <Btn size="sm" variant="outline" onClick={() => setDefault(a.id)}>Set Default</Btn>}
                <Btn size="sm" variant="outline" icon="pencil" onClick={() => toast("info", "Edit address", "Address editor opens in the full issuance flow.")}>Edit</Btn>
              </div>
            </div>
          </Reveal>
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
    <section id="replacement" className="scroll-mt-24">
      <SectionHead no="06" title="Replacement & Renewal" sub="Report a lost, stolen or damaged card — we block the old one and dispatch a new one immediately." />
      <Reveal>
        <div className="rounded-2xl border border-line bg-white p-5 shadow-pm">
          <p className="mb-3 text-[13px] font-bold text-ink">Select a card to replace</p>
          {physCards.length === 0 ? (
            <Empty icon="card" title="No physical cards to replace" sub="Issue a card first, then come back here if it's lost or damaged." />
          ) : (
            <div className="space-y-2">
              {physCards.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-canvas/40 px-4 py-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-pmgreen-soft text-[#067647] shadow-sm"><Icon name="card" size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-ink">{c.nickname}</p>
                    <p className="text-[11px] font-semibold text-faint">{c.holder.toLowerCase()} · •• {c.last4} · <Badge tone={c.status === "active" ? "success" : c.status === "frozen" ? "info" : "danger"} className="capitalize">{c.status}</Badge></p>
                  </div>
                  <Btn size="sm" variant="outline" icon="refresh" onClick={() => openModal({ type: "replace", cardId: c.id })}>Replace</Btn>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {REPLACE_REASONS.map((r) => (
              <div key={r.id} className="rounded-xl border border-line bg-canvas/50 p-3 text-center">
                <Icon name={r.id === "lost" ? "search" : r.id === "stolen" ? "shield" : r.id === "damaged" ? "alertTri" : r.id === "expired" ? "clock" : "users"} size={20} className="mx-auto text-muted" />
                <p className="mt-2 text-[12.5px] font-bold text-ink">{r.label}</p>
                <p className="mt-0.5 text-[11px] text-muted">{r.blurb}</p>
                <p className="mt-1 num font-display text-[13px] font-bold text-ink">{r.fee === 0 ? "Free" : kes(r.fee)}</p>
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
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-pmgreen-soft text-[#067647]"><Icon name="checkCircle" size={26} /></span>
          <p className="font-display text-[15px] font-bold text-ink">{card.nickname} is now live</p>
          <p className="max-w-[280px] text-[12.5px] leading-relaxed text-muted">You can start using it immediately for contactless, online and ATM transactions.</p>
        </div>
      ) : sent ? (
        <div className="py-2">
          <FieldLabel>6-digit OTP</FieldLabel>
          <div className="flex justify-center gap-2.5">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                inputMode="numeric"
                type="password"
                value={d}
                onChange={(e) => onDigit(i, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus(); }}
                className="focus-ring h-14 w-11 rounded-xl border-2 border-line bg-canvas/50 text-center font-display text-xl font-bold text-ink outline-none transition focus:border-pmgreen focus:bg-white"
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>
          <button onClick={() => { setOtp(["", "", "", "", "", ""]); toast("info", "OTP resent", "A new code has been sent."); }} className="mt-4 flex w-full items-center justify-center gap-1.5 text-[12px] font-bold text-pmgreen-dark transition hover:text-pmgreen">
            <Icon name="refresh" size={13} /> Resend OTP
          </button>
        </div>
      ) : (
        <div className="py-2">
          <div className="mx-auto max-w-[300px]"><CardVisual card={card} small /></div>
          <p className="mt-3 text-center text-[12.5px] text-muted">The card was delivered to your address. Activate it to start transacting.</p>
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
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-pmgreen-soft text-[#067647]"><Icon name="checkCircle" size={26} /></span>
          <p className="max-w-[320px] text-[13px] leading-relaxed text-muted">Old card permanently blocked. A new physical card has been dispatched — track it in <strong className="text-ink">Card Orders</strong>.</p>
        </div>
      ) : step === 1 ? (
        <div className="space-y-3">
          <div className="mx-auto max-w-[300px]"><CardVisual card={card} small /></div>
          <FieldLabel>Why are you replacing this card?</FieldLabel>
          <div className="space-y-1.5">
            {REPLACE_REASONS.map((r) => (
              <button key={r.id} onClick={() => setReason(r.id)} className={cn("flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition", reason === r.id ? "border-danger bg-danger-soft/30" : "border-line bg-white hover:border-[#c4c9d4]")}>
                <span className={cn("mt-1 grid h-5 w-5 flex-none place-items-center rounded-full border-2", reason === r.id ? "border-danger" : "border-[#d0d5dd]")}>
                  {reason === r.id && <span className="h-2.5 w-2.5 rounded-full bg-danger" />}
                </span>
                <div>
                  <p className="text-[12.5px] font-bold text-ink">{r.label} <span className="num font-display text-[11.5px] font-bold text-muted">({r.fee === 0 ? "Free" : kes(r.fee)})</span></p>
                  <p className="text-[11px] leading-snug text-muted">{r.blurb}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-line">
            {[
              ["Card", `${card.nickname} •• ${card.last4}`],
              ["Action", "Permanent block + new card issued"],
              ["Reason", reasonMeta?.label ?? "—"],
              ["Fee", reasonMeta ? (reasonMeta.fee === 0 ? "Free" : kes(reasonMeta.fee)) : "—"],
              ["Delivery", "2–3 working days (metro)"],
            ].map(([k, v], i) => (
              <div key={k} className={cn("flex items-center justify-between px-4 py-2.5 text-[12.5px]", i % 2 === 0 ? "bg-canvas/60" : "bg-white")}>
                <span className="font-semibold text-muted">{k}</span>
                <span className="font-bold text-ink">{v}</span>
              </div>
            ))}
          </div>
          <div>
            <FieldLabel>Enter PIN to authorise</FieldLabel>
            <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" className="focus-ring num w-full rounded-[10px] border-2 border-line bg-canvas/50 px-3.5 py-2.5 text-center font-display text-xl font-bold tracking-[0.5em] text-ink outline-none transition focus:border-danger focus:bg-white" />
          </div>
        </div>
      )}
    </Modal>
  );
}
