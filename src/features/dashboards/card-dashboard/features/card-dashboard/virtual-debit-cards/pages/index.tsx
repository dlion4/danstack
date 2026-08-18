import { useEffect, useState } from "react";
import { cn } from "../../../../lib";
import { Icon, type IconName } from "../../../../components/ui/icons";
import { Badge, Btn, Chip, FieldLabel, Modal, Progress, Reveal, SectionHead, Spark, Toggle, Empty } from "../../../../components/ui";
import { useApp, scrollToId } from "../../../../lib";
import { kes, kesShort, type PmCard, type Txn } from "../../../../lib";
import { CardVisual } from "../../../../components/modals/modalsA";

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
                <span className="rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-[#cfe8db]">Module 5.3</span>
              </div>
              <h1 className="font-display mt-3 text-[26px] font-bold leading-[1.1] tracking-tight sm:text-[34px]">
                Virtual Debit<br className="hidden sm:block" /> Card Center
              </h1>
              <p className="mt-2 max-w-[500px] text-[13px] leading-relaxed text-white/65">
                Create purpose-built digital cards in seconds. Lock a card to one merchant, cap the spend, require 3-D Secure, or make it disappear after one successful purchase.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn icon="plus" onClick={() => openModal({ type: "virtualIssue" })}>Create Virtual Card</Btn>
                <Btn variant="ghost" icon="shield" onClick={() => scrollToId("guardrails")}>Set Guardrails</Btn>
                <Btn variant="ghost" icon="card" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { k: "Active virtual cards", v: String(active) },
                  { k: "MTD virtual spend", v: kesShort(spend) },
                  { k: "Merchant-locked", v: String(lockedCount) },
                  { k: "Online authorisations", v: String(onlineTxns) },
                ].map((s) => (
                  <div key={s.k} className="leading-tight">
                    <p className="font-display num text-[17px] font-bold text-white">{s.v}</p>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/45">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden h-[230px] w-[300px] flex-none md:block">
              <div className="absolute right-0 top-0 w-[245px] rotate-[6deg]">
                {virtualCards[0] && <CardVisual card={virtualCards[0]} />}
              </div>
              <div className="absolute bottom-0 left-1 w-[245px] -rotate-[4deg]">
                {virtualCards[1] && <CardVisual card={virtualCards[1]} />}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: "card" as IconName, tone: "bg-pmgreen-soft text-[#067647]", label: "Virtual Cards", value: `${active} active`, note: `${virtualCards.filter((c) => c.singleUse || c.tier === "single-use").length} single-use ready`, spark: [4, 5, 5, 6, 6, 7, 7, 8] },
          { icon: "wallet" as IconName, tone: "bg-pmblue-soft text-[#175cd3]", label: "MTD Online Spend", value: kes(spend), note: "+18.2% vs last month", spark: [12, 14, 13, 17, 19, 20, 25, 28] },
          { icon: "lock" as IconName, tone: "bg-pmviolet-soft text-[#5925dc]", label: "Merchant Locks", value: `${lockedCount} protected`, note: "No mismatched merchants", spark: [2, 2, 3, 3, 3, 4, 4, 4] },
          { icon: "shieldCheck" as IconName, tone: "bg-warn-soft text-[#93370d]", label: "3-D Secure", value: "100%", note: "Enabled for virtual debit", spark: [90, 92, 95, 96, 98, 100, 100, 100] },
        ].map((k, i) => (
          <Reveal key={k.label} delay={i * 70}>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <div className="flex items-start justify-between">
                <span className={cn("grid h-[42px] w-[42px] place-items-center rounded-xl", k.tone)}><Icon name={k.icon} size={19} /></span>
                <Spark points={k.spark} stroke={i === 1 ? "#2e90fa" : i === 2 ? "#7a5af8" : i === 3 ? "#f79009" : "#12b76a"} />
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.07em] text-muted">{k.label}</p>
              <p className="num font-display mt-0.5 text-[23px] font-bold leading-none tracking-tight text-ink">{k.value}</p>
              <p className="mt-2 text-[11px] font-semibold text-faint">{k.note}</p>
            </div>
          </Reveal>
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
    <section id="virtual-cards" className="scroll-mt-24">
      <SectionHead  title="Virtual Card Portfolio" sub="Purpose-built cards that only work where and how you intend.">
        <div className="relative">
          <Icon name="search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a virtual card…" className="focus-ring w-[190px] rounded-[10px] border border-line bg-white py-2 pl-9 pr-3 text-[12.5px] font-semibold outline-none transition placeholder:font-medium placeholder:text-faint focus:border-pmgreen/50" />
        </div>
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "virtualIssue" })}>Create Card</Btn>
      </SectionHead>

      <div className="thin-scroll mb-4 flex gap-2 overflow-x-auto pb-1">
        {(["all", "multi", "single", "locked"] as VirtualFilter[]).map((f) => (
          <Chip key={f} on={filter === f} onClick={() => setFilter(f)} count={count(f)}>
            {f === "all" ? "All" : f === "multi" ? "Multi-use" : f === "single" ? "Single-use" : "Merchant-locked"}
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty icon="card" title="No virtual cards match" sub="Try another filter, or create a new controlled virtual card." action={<Btn size="sm" icon="plus" onClick={() => openModal({ type: "virtualIssue" })}>Create Virtual Card</Btn>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((card, i) => {
            const usage = Math.round((card.spentMonth / card.limitMonth) * 100);
            const locked = card.merchantLock && card.merchantLock !== "Open merchants";
            return (
              <Reveal key={card.id} delay={(i % 3) * 70}>
                <div className="group rounded-2xl border border-line bg-white p-3.5 shadow-pm transition-all duration-200 hover:-translate-y-1 hover:shadow-pm-lg">
                  <button onClick={() => openModal({ type: "virtualDetails", cardId: card.id })} className="card-hover block w-full text-left" aria-label={`Manage ${card.nickname}`}>
                    <CardVisual card={card} />
                  </button>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-bold text-ink">{card.nickname}</p>
                      <p className="text-[11px] font-semibold text-faint">{card.purpose ?? "Online spend"} · •• {card.last4}</p>
                    </div>
                    <Badge tone={card.status === "active" ? "success" : card.status === "frozen" ? "info" : "danger"} dot className="capitalize">{card.status}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone={card.singleUse || card.tier === "single-use" ? "violet" : "info"}>{typeLabel(card)}</Badge>
                    {locked && <Badge tone="success"><Icon name="lock" size={10} /> {card.merchantLock}</Badge>}
                    {card.requires3ds && <Badge tone="muted">3DS</Badge>}
                  </div>
                  <div className="mt-2.5">
                    <div className="mb-1 flex justify-between text-[10.5px] font-bold text-faint">
                      <span className="num">{kesShort(card.spentMonth)} spent</span>
                      <span className="num">{usage}% of {kesShort(card.limitMonth)}</span>
                    </div>
                    <Progress value={usage} tone={usage > 85 ? "red" : usage > 60 ? "amber" : "green"} />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 border-t border-line/70 pt-3">
                    {card.status === "active" ? (
                      <Btn size="sm" variant="dangerGhost" icon="snow" className="flex-1" onClick={() => setCardStatus(card.id, "frozen")}>Freeze</Btn>
                    ) : (
                      <Btn size="sm" icon="zap" className="flex-1" onClick={() => { setCardStatus(card.id, "active"); toast("success", `${card.nickname} unfrozen`); }}>Unfreeze</Btn>
                    )}
                    <button onClick={() => openModal({ type: "virtualDetails", cardId: card.id })} title="Reveal credentials & controls" className="focus-ring grid h-8 w-8 place-items-center rounded-[9px] border border-line text-muted transition hover:border-pmgreen/50 hover:bg-pmgreen-soft hover:text-[#067647]"><Icon name="eye" size={14} /></button>
                    <button onClick={() => openModal({ type: "limits", cardId: card.id })} title="Limits" className="focus-ring grid h-8 w-8 place-items-center rounded-[9px] border border-line text-muted transition hover:border-pmgreen/50 hover:bg-pmgreen-soft hover:text-[#067647]"><Icon name="sliders" size={14} /></button>
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
    <section id="guardrails" className="scroll-mt-24">
      <SectionHead  title="Security Guardrails" sub="Programme defaults that remove the human error from online spend.">
        <Badge tone="success" dot>All policies enforced</Badge>
      </SectionHead>
      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
            <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Default virtual safeguards</p>
            <ul className="space-y-2">
              {list.map((g) => (
                <li key={g.key} className={cn("flex items-center gap-3 rounded-xl border p-3 transition", guards[g.key] ? "border-pmgreen/40 bg-pmgreen-soft/35" : "border-line bg-white")}>
                  <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", guards[g.key] ? "bg-white text-[#067647] shadow-sm" : "bg-canvas text-faint")}><Icon name={g.icon} size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-ink">{g.title}</p>
                    <p className="text-[11px] leading-snug text-muted">{g.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden text-right text-[10px] font-bold text-faint xl:block">{g.hint}</span>
                    <Toggle on={guards[g.key]} label={g.title} onChange={(value) => { setGuards((s) => ({ ...s, [g.key]: value })); toast(value ? "success" : "warn", `${g.title} ${value ? "enabled" : "disabled"}`, "Updated across the virtual debit programme."); }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={80} className="lg:col-span-2">
          <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-4 shadow-pm">
            <p className="font-display text-[13.5px] font-bold text-ink">Policy impact · 30 days</p>
            <div className="mt-4 space-y-3">
              {[
                ["Mismatched merchant attempts", "18", "Blocked before authorisation", "bg-pmgreen", 78],
                ["3DS challenges completed", "42", "100% successful", "bg-pmblue", 64],
                ["Single-use cards closed", "16", "Zero credentials retained", "bg-pmviolet", 48],
              ].map(([label, value, note, tone, width]) => (
                <div key={label as string}>
                  <div className="mb-1 flex justify-between gap-3 text-[11.5px] font-bold">
                    <span className="text-muted">{label}</span><span className="num font-display text-ink">{value}</span>
                  </div>
                  <Progress value={width as number} tone={tone === "bg-pmblue" ? "blue" : tone === "bg-pmviolet" ? "violet" : "green"} />
                  <p className="mt-1 text-[10.5px] font-semibold text-faint">{note}</p>
                </div>
              ))}
            </div>
            <div className="mt-auto rounded-xl bg-pmgreen-soft/60 p-3">
              <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#067647]"><Icon name="shieldCheck" size={13} /> Last risk scan: just now</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#067647]/80">No active virtual cards require intervention. All merchant locks are operating normally.</p>
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
    <section id="funding" className="scroll-mt-24">
      <SectionHead  title="Funding & Spending Limits" sub="Every virtual card remains tied to a funded source, a monthly ceiling and a per-transaction cap." />
      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <p className="font-display text-[13.5px] font-bold text-ink">Default funding source</p>
            <div className="mt-3 rounded-xl border border-pmgreen/35 bg-pmgreen-soft/40 p-3.5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-white text-[#067647] shadow-sm"><Icon name="wallet" size={17} /></span>
                <div className="min-w-0 flex-1"><p className="text-[12.5px] font-bold text-ink">{source}</p><p className="text-[11px] font-semibold text-muted">Primary source for new virtual cards</p></div>
              </div>
              <select value={source} onChange={(e) => { setSource(e.target.value); toast("success", "Default funding source updated"); }} className="focus-ring mt-3 w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink outline-none">
                <option>Biz Wallet · KES 1,284,000</option>
                <option>M-Pesa Paybill 522 123 · KES 96,400</option>
                <option>KCB Bank •• 4471 · KES 512,300</option>
              </select>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-canvas/70 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-faint">Committed monthly</p><p className="num mt-1 font-display text-[16px] font-bold text-ink">{kesShort(committed)}</p></div>
              <div className="rounded-xl bg-canvas/70 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-faint">Available headroom</p><p className="num mt-1 font-display text-[16px] font-bold text-pmgreen-dark">{kesShort(Math.max(0, 1_284_000 - committed))}</p></div>
            </div>
            <div className="mt-3"><div className="mb-1 flex justify-between text-[11px] font-bold text-faint"><span>Portfolio spend</span><span>{kesShort(used)} used</span></div><Progress value={(used / Math.max(committed, 1)) * 100} /></div>
          </div>
        </Reveal>
        <Reveal delay={80} className="lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
            <div className="flex items-center justify-between border-b border-line px-4 py-3"><p className="font-display text-[13.5px] font-bold text-ink">Card allocations</p><Badge tone="muted">Live</Badge></div>
            <div className="thin-scroll overflow-x-auto">
              <table className="min-w-[610px] w-full text-left">
                <thead><tr className="border-b border-line bg-canvas/60 text-[10px] font-bold uppercase tracking-[0.08em] text-faint"><th className="px-4 py-2.5">Card</th><th className="px-3 py-2.5">Merchant policy</th><th className="px-3 py-2.5">Monthly limit</th><th className="px-3 py-2.5">Spend</th><th className="px-4 py-2.5 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-line/70">
                  {virtualCards.map((card) => {
                    const pct = (card.spentMonth / card.limitMonth) * 100;
                    return <tr key={card.id} className="text-[12.5px] transition hover:bg-pmgreen-soft/15"><td className="px-4 py-3"><p className="font-bold text-ink">{card.nickname}</p><p className="text-[10.5px] font-semibold text-faint">•• {card.last4} · {typeLabel(card)}</p></td><td className="px-3 py-3"><Badge tone={card.merchantLock && card.merchantLock !== "Open merchants" ? "success" : "muted"}>{card.merchantLock ?? "Open merchants"}</Badge></td><td className="num px-3 py-3 font-bold text-ink">{kes(card.limitMonth)}</td><td className="px-3 py-3"><p className="num text-[11.5px] font-bold text-ink">{kes(card.spentMonth)} <span className="text-faint">({Math.round(pct)}%)</span></p><Progress value={pct} tone={pct > 85 ? "red" : pct > 60 ? "amber" : "green"} className="mt-1.5 w-[110px]" /></td><td className="px-4 py-3 text-right"><Btn size="sm" variant="outline" icon="sliders" onClick={() => openModal({ type: "limits", cardId: card.id })}>Edit</Btn></td></tr>;
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
    <section id="activity" className="scroll-mt-24">
      <SectionHead  title="Virtual Card Activity" sub="Online authorisations, merchant enforcement and disputes for this card type.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Activity export ready", `${activity.length} virtual card transactions exported as CSV.`)}>Export CSV</Btn>
      </SectionHead>
      <div className="thin-scroll mb-4 flex gap-2 overflow-x-auto pb-1">
        {(["all", "Cleared", "Pending", "Declined", "Disputed"] as const).map((s) => <Chip key={s} on={filter === s} onClick={() => setFilter(s)} count={s === "all" ? txns.filter((t) => virtualCards.some((c) => c.id === t.cardId)).length : activity.filter((t) => t.status === s).length}>{s === "all" ? "All" : s}</Chip>)}
      </div>
      {activity.length === 0 ? <Empty icon="inbox" title="No virtual card activity" sub="Transactions will appear here as virtual cards are used." /> : (
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
            <div className="hidden md:block"><table className="w-full text-left"><thead><tr className="border-b border-line bg-canvas/70 text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint"><th className="px-4 py-2.5">Merchant</th><th className="px-3 py-2.5">Virtual card</th><th className="px-3 py-2.5">Policy result</th><th className="px-3 py-2.5 text-right">Amount</th><th className="px-4 py-2.5 text-right">Action</th></tr></thead><tbody className="divide-y divide-line/70">
              {activity.map((txn) => { const card = byId(txn.cardId); const matching = !card?.merchantLock || card.merchantLock === "Open merchants" || txn.merchant.includes(card.merchantLock.split(" ")[0]); return <tr key={txn.id} className="group text-[12.5px] transition hover:bg-pmgreen-soft/20"><td className="px-4 py-3"><div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-lg bg-canvas text-muted"><Icon name="globe" size={14} /></span><span><span className="block font-bold text-ink">{txn.merchant}</span><span className="block text-[10.5px] font-semibold text-faint">{txn.date} · {txn.time} · {txn.category}</span></span></div></td><td className="px-3 py-3"><p className="font-bold text-ink">{card?.nickname}</p><p className="text-[10.5px] font-semibold text-faint">•• {card?.last4}</p></td><td className="px-3 py-3"><Badge tone={matching ? "success" : "danger"} dot>{matching ? "Policy matched" : "Merchant mismatch"}</Badge></td><td className="num px-3 py-3 text-right font-display font-bold text-ink">{kes(txn.amount)}</td><td className="px-4 py-3 text-right">{txn.status === "Cleared" ? <Btn size="sm" variant="outline" icon="flag" onClick={() => openModal({ type: "dispute", txnId: txn.id })}>Dispute</Btn> : <Badge tone={tone(txn.status)}>{txn.status}</Badge>}</td></tr>; })}
            </tbody></table></div>
            <ul className="divide-y divide-line/70 md:hidden">{activity.map((txn) => { const card = byId(txn.cardId); return <li key={txn.id} className="flex items-center gap-3 px-4 py-3"><span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-canvas text-muted"><Icon name="globe" size={15} /></span><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-bold text-ink">{txn.merchant}</p><p className="text-[10.5px] font-semibold text-faint">{card?.nickname} · {txn.date}</p><div className="mt-1"><Badge tone={tone(txn.status)} dot>{txn.status}</Badge></div></div><div className="text-right"><p className="num font-display text-[13.5px] font-bold text-ink">−{kes(txn.amount)}</p>{txn.status === "Cleared" && <button onClick={() => openModal({ type: "dispute", txnId: txn.id })} className="mt-1 text-[11px] font-bold text-pmgreen-dark">Dispute</button>}</div></li>; })}</ul>
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
    <section id="best-practice" className="scroll-mt-24">
      <SectionHead  title="Safer-by-Design Workflows" sub="Use card purpose and merchant locks instead of chasing reimbursements or exposing your primary credentials." />
      <div className="grid gap-3 md:grid-cols-3">
        {flows.map((flow, i) => <Reveal key={flow.title} delay={i * 70}><div className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-pm transition-all duration-200 hover:-translate-y-1 hover:shadow-pm-lg"><span className="grid h-10 w-10 place-items-center rounded-xl bg-pmgreen-soft text-[#067647]"><Icon name={flow.icon} size={18} /></span><h3 className="font-display mt-3 text-[14.5px] font-bold tracking-tight text-ink">{flow.title}</h3><p className="mt-1 text-[12px] leading-relaxed text-muted">{flow.copy}</p><Btn className="mt-auto pt-4" size="sm" variant="outline" icon="plus" onClick={() => { openModal({ type: "virtualIssue" }); window.setTimeout(() => window.dispatchEvent(new CustomEvent("pm-virtual-purpose", { detail: flow.purpose })), 30); }}>{flow.action}</Btn></div></Reveal>)}
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
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <span className={cn("grid h-6 w-6 place-items-center rounded-full font-display text-[11px] font-bold", s < step || issued ? "bg-pmgreen text-white" : s === step ? "bg-ink text-white" : "bg-canvas text-faint")}>
            {s < step || issued ? <Icon name="check" size={11} strokeWidth={3} /> : s}
          </span>
          {s < 3 && <span className={cn("h-px w-7 sm:w-10", s < step ? "bg-pmgreen" : "bg-line")} />}
        </div>
      ))}
    </div>
  );

  return <Modal open={open} onClose={closeModal} icon="plus" title={issued ? "Virtual card created" : "Create a virtual debit card"} subtitle={issued ? undefined : "Build a controlled online payment method in three quick steps."} width="max-w-2xl" footer={issued ? <><Btn variant="outline" onClick={closeModal}>Close</Btn><Btn icon="eye" onClick={() => { closeModal(); openModal({ type: "virtualDetails", cardId: issued.id }); }}>View Credentials</Btn></> : step === 1 ? <><Btn variant="outline" onClick={closeModal}>Cancel</Btn><Btn icon="arrowRight" onClick={() => setStep(2)}>Continue</Btn></> : step === 2 ? <><Btn variant="outline" icon="chevLeft" onClick={() => setStep(1)}>Back</Btn><Btn icon="arrowRight" disabled={!name.trim()} onClick={() => setStep(3)}>Review</Btn></> : <><Btn variant="outline" icon="chevLeft" onClick={() => setStep(2)}>Back</Btn><Btn icon="lock" disabled={pin.length !== 4} onClick={issue}>Create Card</Btn></>}>
    {issued ? <div className="flex flex-col items-center gap-4 py-4 text-center"><span className="grid h-14 w-14 place-items-center rounded-full bg-pmgreen-soft text-[#067647]"><Icon name="checkCircle" size={26} /></span><div><p className="font-display text-[16px] font-bold text-ink">Ready for online payments</p><p className="mt-1 text-[12.5px] text-muted">Your merchant lock and 3-D Secure requirements are already active.</p></div><div className="w-full max-w-[340px]"><CardVisual card={issued} /></div></div> : <div className="space-y-4"><div className="flex items-center justify-between">{stepDots}<span className="text-[11px] font-bold uppercase tracking-[0.1em] text-faint">Step {step} · {step === 1 ? "Purpose" : step === 2 ? "Controls" : "Confirm"}</span></div>{step === 1 && <div className="grid gap-2 sm:grid-cols-2">{PURPOSES.map((p) => <button key={p.id} onClick={() => { setPurpose(p.id); setMerchant(p.defaultLock); setLimit(p.singleUse ? 10000 : p.id === "team" ? 50000 : 25000); }} className={cn("flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition", purpose === p.id ? "border-pmgreen bg-pmgreen-soft/50 shadow-[0_4px_16px_-6px_rgba(18,183,106,0.4)]" : "border-line bg-white hover:border-[#c4c9d4]")}><span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", purpose === p.id ? "bg-pmgreen text-white" : "bg-canvas text-muted")}><Icon name={p.icon} size={16} /></span><span><span className="block text-[13px] font-bold text-ink">{p.title}</span><span className="mt-0.5 block text-[11.5px] leading-snug text-muted">{p.sub}</span></span></button>)}</div>}{step === 2 && <div className="grid gap-5 lg:grid-cols-[1fr_260px]"><div className="space-y-4"><div><FieldLabel hint={`${name.length}/24 characters`}>Card nickname</FieldLabel><input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} className="focus-ring w-full rounded-[10px] border border-line bg-canvas/50 px-3.5 py-2.5 text-[13px] font-bold text-ink outline-none transition focus:border-pmgreen/60 focus:bg-white" /></div><div><FieldLabel>Merchant lock</FieldLabel><select value={merchant} onChange={(e) => setMerchant(e.target.value)} className="focus-ring w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink outline-none">{LOCK_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select><p className="mt-1.5 text-[11px] font-semibold text-muted">A locked card declines any merchant that does not match this policy.</p></div><div><div className="mb-1.5 flex items-center justify-between"><FieldLabel>Monthly spending limit</FieldLabel><span className="num font-display text-[15px] font-bold text-ink">{kes(limit)}</span></div><input type="range" min={1000} max={150000} step={1000} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-full" /><div className="mt-1 flex justify-between text-[10px] font-semibold text-faint"><span>KES 1,000</span><span>KES 150,000</span></div></div><div className="flex items-center gap-3 rounded-xl border border-line bg-white p-3"><span className="grid h-9 w-9 place-items-center rounded-[10px] bg-pmgreen-soft text-[#067647]"><Icon name="shieldCheck" size={16} /></span><div className="flex-1"><p className="text-[12.5px] font-bold text-ink">Require 3-D Secure</p><p className="text-[11px] text-muted">OTP or biometric approval when challenged.</p></div><Toggle on={threeDs} label="Require 3-D Secure" onChange={setThreeDs} /></div></div><CardVisual card={preview} /></div>}{step === 3 && <div className="space-y-4"><div className="overflow-hidden rounded-xl border border-line">{[["Card purpose", choice.title], ["Merchant policy", merchant], ["Monthly limit", kes(limit)], ["3-D Secure", threeDs ? "Required" : "Optional"], ["Card type", choice.singleUse ? "Single-use" : "Multi-use"]].map(([k, v], i) => <div key={k} className={cn("flex items-center justify-between px-4 py-2.5 text-[12.5px]", i % 2 === 0 ? "bg-canvas/60" : "bg-white")}><span className="font-semibold text-muted">{k}</span><span className="font-bold text-ink">{v}</span></div>)}</div><div><FieldLabel hint="Authorises immediate issuance">Enter your PayMo PIN</FieldLabel><input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" className="focus-ring num w-full rounded-[10px] border-2 border-line bg-canvas/50 px-3.5 py-2.5 text-center font-display text-xl font-bold tracking-[0.5em] text-ink outline-none transition focus:border-pmgreen focus:bg-white" /></div><p className="rounded-lg bg-canvas/80 px-3 py-2 text-[11.5px] leading-relaxed text-muted">Virtual cards are issued instantly. Credentials are only revealed after a second verification step.</p></div>}</div>}
  </Modal>;
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

  return <Modal open={open} onClose={closeModal} icon="lock" title={`Secure details · ${card.nickname}`} subtitle="Credentials are protected and automatically re-mask after 30 seconds." width="max-w-xl" footer={<><Btn variant="outline" onClick={closeModal}>Cancel</Btn><Btn icon="check" onClick={save}>Save Controls</Btn></>}>
    <div className="space-y-4"><CardVisual card={card} /><div className="rounded-xl border border-line bg-canvas/50 p-3.5"><div className="flex items-center justify-between"><p className="text-[12.5px] font-bold text-ink">Card credentials</p><button onClick={() => { setRevealed((r) => !r); setSeconds(30); }} className="flex items-center gap-1.5 text-[11.5px] font-bold text-pmgreen-dark transition hover:text-pmgreen"><Icon name={revealed ? "eyeOff" : "eye"} size={13} />{revealed ? `Hide · ${seconds}s` : "Reveal"}</button></div><div className="mt-3 grid gap-2 sm:grid-cols-[1fr_92px]"><div className="rounded-lg border border-line bg-white px-3 py-2.5"><p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-faint">Card number</p><p className="num mt-1 font-display text-[14px] font-bold tracking-[0.08em] text-ink">{revealed ? fullPan : card.panMask}</p></div><div className="rounded-lg border border-line bg-white px-3 py-2.5"><p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-faint">CVV</p><p className="num mt-1 font-display text-[14px] font-bold tracking-[0.14em] text-ink">{revealed ? cvv : "•••"}</p></div></div>{revealed && <button onClick={() => toast("success", "Credentials copied", "Card number and CVV copied to your secure clipboard for 30 seconds.")} className="mt-2 flex items-center gap-1.5 text-[11.5px] font-bold text-pmgreen-dark"><Icon name="copy" size={13} /> Copy secure details</button>}</div><div><FieldLabel>Merchant lock</FieldLabel><select value={merchant} onChange={(e) => setMerchant(e.target.value)} className="focus-ring w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink outline-none">{LOCK_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select><p className="mt-1.5 text-[11px] text-muted">A locked card automatically declines online transactions from a different merchant.</p></div><div className="grid gap-2 sm:grid-cols-2"><div className="flex items-center gap-2.5 rounded-xl border border-line bg-white p-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-pmgreen-soft text-[#067647]"><Icon name="shieldCheck" size={15} /></span><span className="flex-1"><span className="block text-[12px] font-bold text-ink">Require 3-D Secure</span><span className="block text-[10.5px] text-muted">OTP challenge</span></span><Toggle on={threeDs} label="Require 3-D Secure" onChange={setThreeDs} /></div><div className="flex items-center gap-2.5 rounded-xl border border-line bg-white p-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-pmviolet-soft text-[#5925dc]"><Icon name="zap" size={15} /></span><span className="flex-1"><span className="block text-[12px] font-bold text-ink">Single-use mode</span><span className="block text-[10.5px] text-muted">Close after payment</span></span><Toggle on={singleUse} label="Single-use mode" onChange={setSingleUse} /></div></div><div className="flex flex-wrap gap-2 rounded-xl bg-canvas/70 p-3"><Btn size="sm" variant="outline" icon="sliders" onClick={() => { closeModal(); openModal({ type: "limits", cardId: card.id }); }}>Edit spend limits</Btn><Btn size="sm" variant="outline" icon="flag" onClick={() => { closeModal(); window.setTimeout(() => scrollToId("activity"), 80); }}>View activity</Btn></div></div>
  </Modal>;
}