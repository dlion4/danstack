import { useEffect, useState } from "react";
import { cn } from "../../../../lib";
import { Icon, NetworkMark, type IconName } from "../../../../components/ui/icons";
import { Badge, Btn, Chip, FieldLabel, Modal, Progress, Reveal, SectionHead, Spark, Toggle, Empty } from "../../../../components/ui";
import { useApp, scrollToId } from "../../../../lib";
import { kes, kesShort, type PmCard, type Txn } from "../../../../lib";
import { CardVisual } from "../../../../components/modals/modalsA";
import {
  MCC_CATEGORIES,
  PREPAID_FEES,
  PREPAID_FUNDING_SOURCES,
  PREPAID_ISSUANCE_FEE,
  PREPAID_USES,
  type PrepaidCard,
  type PrepaidForm,
  type PrepaidUse,
} from "../../../../lib";

/* ---------------- helpers ---------------- */

const mccLabel = (id: string) => MCC_CATEGORIES.find((m) => m.id === id)?.label ?? "All categories";
const useMeta = (id: PrepaidUse) => PREPAID_USES.find((u) => u.id === id) ?? PREPAID_USES[0];

const statusTone = (s: PrepaidCard["status"]): "success" | "info" | "warning" | "muted" =>
  s === "active" ? "success" : s === "frozen" ? "info" : s === "depleted" ? "warning" : "muted";

/* ---------------- prepaid card visual ---------------- */

function PrepaidVisual({ card, small }: { card: PrepaidCard; small?: boolean }) {
  const pct = card.loaded > 0 ? Math.round((card.balance / card.loaded) * 100) : 0;
  return (
    <div
      className={cn(
        "card-sheen relative aspect-[1.62] w-full overflow-hidden rounded-2xl text-white shadow-[var(--shadow-card)]",
        (card.status === "frozen" || card.status === "retired") && "saturate-[0.4]"
      )}
      style={{ background: card.gradient }}
    >
      <div className="pm-hero-dots absolute inset-0" />
      <div className={cn("relative flex h-full flex-col justify-between", small ? "p-3.5" : "p-4")}>
        <div className="flex items-start justify-between">
          <div>
            <p className={cn("font-display font-bold", small ? "text-[12px]" : "text-[13.5px]")}>PayMo</p>
            <p className={cn("font-semibold uppercase tracking-[0.14em] text-white/60", small ? "text-[8px]" : "text-[9px]")}>
              {card.form === "virtual" ? "Virtual Prepaid" : "Physical Prepaid"}
            </p>
          </div>
          <NetworkMark network={card.network} />
        </div>
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className={cn("font-semibold uppercase tracking-wider text-white/55", small ? "text-[8px]" : "text-[9.5px]")}>Balance</p>
              <p className={cn("num font-display font-bold tracking-tight", small ? "text-[16px]" : "text-[20px]")}>{kes(card.balance)}</p>
            </div>
            <div className="text-right">
              <p className={cn("font-semibold uppercase tracking-wider text-white/55", small ? "text-[8px]" : "text-[9.5px]")}>Valid</p>
              <p className={cn("font-bold", small ? "text-[10px]" : "text-[11px]")}>{card.expiry}</p>
            </div>
          </div>
          <div className="mt-2 h-[4px] overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white/85" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <p className={cn("font-semibold tracking-wide text-white/85", small ? "text-[10px]" : "text-[11.5px]")}>{card.panMask}</p>
            <p className={cn("text-white/70", small ? "text-[8px]" : "text-[9.5px]")}>{card.holder}</p>
          </div>
        </div>
      </div>
      {card.status === "frozen" && (
        <span className="absolute right-3 top-3 rounded-md bg-[#0b1322]/70 px-2 py-1 text-[10px] font-bold text-[#a5d8ff] backdrop-blur-sm">FROZEN</span>
      )}
      {card.status === "depleted" && (
        <span className="absolute right-3 top-3 rounded-md bg-[#0b1322]/70 px-2 py-1 text-[10px] font-bold text-[#fdd9a0] backdrop-blur-sm">EMPTY</span>
      )}
      {card.status === "retired" && (
        <span className="absolute right-3 top-3 rounded-md bg-[#0b1322]/70 px-2 py-1 text-[10px] font-bold text-[#cdd3df] backdrop-blur-sm">RETIRED</span>
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
                <span className="rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-[#cfe8db]">Module 5.5</span>
              </div>
              <h1 className="font-display mt-3 text-[26px] font-bold leading-[1.1] tracking-tight sm:text-[34px]">
                Prepaid Card<br className="hidden sm:block" /> Management
              </h1>
              <p className="mt-2 max-w-[500px] text-[13px] leading-relaxed text-white/65">
                Issue loadable prepaid cards for teams, gifts and travel. Fund them upfront, cap spend by category,
                and top up in seconds — with zero exposure to your main accounts.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn icon="plus" onClick={() => openModal({ type: "prepaidIssue" })}>Issue Prepaid Card</Btn>
                <Btn variant="ghost" icon="wallet" onClick={() => openModal({ type: "topup" })}>Top Up a Card</Btn>
                <Btn variant="ghost" icon="gauge" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { k: "Total balance", v: kesShort(totalBalance) },
                  { k: "Active cards", v: String(active) },
                  { k: "Loaded MTD", v: kesShort(totalLoaded) },
                  { k: "Low balance", v: String(lowCount), warn: lowCount > 0 },
                ].map((s) => (
                  <div key={s.k} className="leading-tight">
                    <p className={cn("font-display num text-[17px] font-bold", s.warn ? "text-[#ffd27d]" : "text-white")}>{s.v}</p>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/45">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden h-[230px] w-[300px] flex-none md:block">
              <div className="absolute right-0 top-0 w-[245px] rotate-[6deg]">
                {prepaid[0] && <PrepaidVisual card={prepaid[0]} />}
              </div>
              <div className="absolute bottom-0 left-1 w-[245px] -rotate-[4deg]">
                {prepaid[4] && <PrepaidVisual card={prepaid[4]} />}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: "wallet" as IconName, tone: "bg-pmgreen-soft text-[#067647]", label: "Available Balance", value: kes(totalBalance), note: `across ${live.length} live cards`, spark: [30, 28, 34, 31, 27, 24, 22, 26], stroke: "#12b76a" },
          { icon: "refresh" as IconName, tone: "bg-pmblue-soft text-[#175cd3]", label: "Loaded (all-time)", value: kesShort(totalLoaded), note: "top-ups + initial loads", spark: [12, 18, 22, 30, 38, 44, 52, 60], stroke: "#2e90fa" },
          { icon: "card" as IconName, tone: "bg-pmviolet-soft text-[#5925dc]", label: "Cards Issued", value: String(prepaid.length), note: `${prepaid.filter((p) => p.form === "virtual").length} virtual · ${prepaid.filter((p) => p.form === "physical").length} physical`, spark: [2, 3, 3, 4, 4, 5, 5, 5], stroke: "#7a5af8" },
          { icon: "alertTri" as IconName, tone: "bg-warn-soft text-[#93370d]", label: "Need Attention", value: String(lowCount), note: lowCount > 0 ? "low balance — top up soon" : "all balances healthy", spark: [1, 0, 1, 1, 2, 1, 1, 1], stroke: "#f79009", action: () => document.getElementById("balances")?.scrollIntoView({ behavior: "smooth" }) },
        ].map((k, i) => (
          <Reveal key={k.label} delay={i * 70}>
            <button
              onClick={k.action}
              className={cn("group w-full rounded-2xl border border-line bg-white p-4 text-left shadow-pm transition-all duration-200", k.action ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-pm-lg" : "cursor-default")}
            >
              <div className="flex items-start justify-between">
                <span className={cn("grid h-[42px] w-[42px] place-items-center rounded-xl", k.tone)}><Icon name={k.icon} size={19} /></span>
                <Spark points={k.spark} stroke={k.stroke} />
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.07em] text-muted">{k.label}</p>
              <p className="num font-display mt-0.5 text-[22px] font-bold leading-none tracking-tight text-ink">{k.value}</p>
              <p className="mt-2 text-[11px] font-semibold text-faint">{k.note}</p>
            </button>
          </Reveal>
        ))}
      </div>

      {/* Use-case launchers */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {PREPAID_USES.map((u, i) => (
          <Reveal key={u.id} delay={i * 60}>
            <button
              onClick={() => { openModal({ type: "prepaidIssue" }); window.setTimeout(() => window.dispatchEvent(new CustomEvent("pm-prepaid-use", { detail: u.id })), 40); }}
              className="group flex w-full items-center gap-3 rounded-xl border border-line bg-white p-3 text-left shadow-pm transition-all duration-200 hover:-translate-y-0.5 hover:border-pmgreen/50 hover:shadow-pm-lg"
            >
              <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-pmgreen-soft text-[#067647]"><Icon name={u.icon} size={16} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-bold text-ink">{u.title}</span>
                <span className="block truncate text-[10.5px] font-semibold text-faint">{u.sub}</span>
              </span>
              <Icon name="plus" size={14} className="flex-none text-faint transition group-hover:text-pmgreen" />
            </button>
          </Reveal>
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
    <section id="prepaid-cards" className="scroll-mt-24">
      <SectionHead  title="Prepaid Cards" sub="Loadable cards with their own balance, category lock and top-up controls.">
        <div className="relative">
          <Icon name="search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a prepaid card…" className="focus-ring w-[190px] rounded-[10px] border border-line bg-white py-2 pl-9 pr-3 text-[12.5px] font-semibold outline-none transition placeholder:font-medium placeholder:text-faint focus:border-pmgreen/50" />
        </div>
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "prepaidIssue" })}>Issue Card</Btn>
      </SectionHead>

      <div className="thin-scroll mb-4 flex gap-2 overflow-x-auto pb-1">
        {(["all", "active", "low", "frozen", "depleted"] as PpFilter[]).map((f) => (
          <Chip key={f} on={filter === f} onClick={() => setFilter(f)} count={count(f)}>
            {f === "all" ? "All" : f === "low" ? "Low balance" : f.charAt(0).toUpperCase() + f.slice(1)}
          </Chip>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty icon="card" title="No prepaid cards match" sub="Try another filter, or issue a new loadable card." action={<Btn size="sm" icon="plus" onClick={() => openModal({ type: "prepaidIssue" })}>Issue Prepaid Card</Btn>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((card, i) => {
            const spentPct = card.loaded > 0 ? Math.round((card.spent / card.loaded) * 100) : 0;
            const low = isLow(card);
            return (
              <Reveal key={card.id} delay={(i % 3) * 70}>
                <div className="group rounded-2xl border border-line bg-white p-3.5 shadow-pm transition-all duration-200 hover:-translate-y-1 hover:shadow-pm-lg">
                  <button onClick={() => openModal({ type: "prepaidManage", cardId: card.id })} className="card-hover block w-full text-left" aria-label={`Manage ${card.name}`}>
                    <PrepaidVisual card={card} />
                  </button>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-bold text-ink">{card.name}</p>
                      <p className="text-[11px] font-semibold text-faint">{useMeta(card.use).title}</p>
                    </div>
                    <Badge tone={statusTone(card.status)} dot className="capitalize">{card.status}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone="muted">{card.form === "virtual" ? "Virtual" : "Physical"}</Badge>
                    <Badge tone={card.mcc === "any" ? "muted" : "violet"}>{card.mcc === "any" ? "Open MCC" : mccLabel(card.mcc)}</Badge>
                    {low && <Badge tone="warning" dot>Low</Badge>}
                  </div>
                  <div className="mt-2.5">
                    <div className="mb-1 flex justify-between text-[10.5px] font-bold text-faint">
                      <span className="num">{kes(card.balance)} left</span>
                      <span className="num">{spentPct}% spent</span>
                    </div>
                    <Progress value={100 - spentPct} tone={low ? "red" : spentPct > 60 ? "amber" : "green"} />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 border-t border-line/70 pt-3">
                    {card.status === "retired" ? (
                      <span className="flex-1 rounded-[10px] bg-canvas px-3 py-1.5 text-center text-[11.5px] font-bold text-faint">Card retired</span>
                    ) : (
                      <Btn size="sm" icon="wallet" className="flex-1" disabled={!card.reloadable && card.status === "depleted"} onClick={() => openModal({ type: "topup", cardId: card.id })}>Top Up</Btn>
                    )}
                    <button onClick={() => openModal({ type: "prepaidManage", cardId: card.id })} title="Manage" className="focus-ring grid h-8 w-8 place-items-center rounded-[9px] border border-line text-muted transition hover:border-pmgreen/50 hover:bg-pmgreen-soft hover:text-[#067647]"><Icon name="sliders" size={14} /></button>
                    <button onClick={() => openModal({ type: "prepaidManage", cardId: card.id })} title="Details" className="focus-ring grid h-8 w-8 place-items-center rounded-[9px] border border-line text-muted transition hover:border-pmgreen/50 hover:bg-pmgreen-soft hover:text-[#067647]"><Icon name="chevRight" size={14} /></button>
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

/* ============ 03 · Balances & reloads ============ */

export function BalancesSection() {
  const { prepaid, openModal } = useApp();
  const live = prepaid.filter((p) => p.status !== "retired");

  return (
    <section id="balances" className="scroll-mt-24">
      <SectionHead  title="Balances & Reloads" sub="At-a-glance funding health with one-tap top-ups for anything running low.">
        <Btn size="sm" icon="wallet" onClick={() => openModal({ type: "topup" })}>Top Up a Card</Btn>
      </SectionHead>

      {live.length === 0 ? (
        <Empty icon="wallet" title="No live prepaid balances" sub="Issue a prepaid card to start tracking balances here." />
      ) : (
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-canvas/70 text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint">
                    <th className="px-4 py-2.5">Card</th>
                    <th className="px-3 py-2.5">Category lock</th>
                    <th className="px-3 py-2.5">Balance</th>
                    <th className="px-3 py-2.5 w-[180px]">Remaining</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {live.map((p) => {
                    const remaining = p.loaded > 0 ? Math.round((p.balance / p.loaded) * 100) : 0;
                    const low = p.loaded > 0 && p.balance / p.loaded < 0.2;
                    return (
                      <tr key={p.id} className="text-[12.5px] transition hover:bg-pmgreen-soft/15">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-canvas text-muted"><Icon name={p.form === "virtual" ? "card" : "wallet"} size={14} /></span>
                            <div className="leading-tight">
                              <p className="font-bold text-ink">{p.name}</p>
                              <p className="text-[10.5px] font-semibold text-faint">•• {p.last4} · {p.form}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3"><Badge tone={p.mcc === "any" ? "muted" : "violet"}>{p.mcc === "any" ? "Open" : mccLabel(p.mcc)}</Badge></td>
                        <td className="num px-3 py-3 font-display font-bold text-ink">{kes(p.balance)}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={remaining} tone={low ? "red" : remaining < 50 ? "amber" : "green"} className="w-[110px]" />
                            <span className={cn("num text-[11px] font-bold", low ? "text-[#b42318]" : "text-muted")}>{remaining}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Btn size="sm" variant={low ? "primary" : "outline"} icon="wallet" onClick={() => openModal({ type: "topup", cardId: p.id })}>Top Up</Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line/70 md:hidden">
              {live.map((p) => {
                const remaining = p.loaded > 0 ? Math.round((p.balance / p.loaded) * 100) : 0;
                const low = p.loaded > 0 && p.balance / p.loaded < 0.2;
                return (
                  <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-canvas text-muted"><Icon name={p.form === "virtual" ? "card" : "wallet"} size={15} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-ink">{p.name}</p>
                      <p className="num text-[11px] font-semibold text-faint">{kes(p.balance)} · {remaining}% left</p>
                      <Progress value={remaining} tone={low ? "red" : remaining < 50 ? "amber" : "green"} className="mt-1.5" />
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
    <section id="controls" className="scroll-mt-24">
      <SectionHead  title="Limits & MCC Locks" sub="Category restrictions and spend caps that keep prepaid funds on-purpose." />

      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Per-card controls</p>
            {active.length === 0 ? (
              <Empty icon="shield" title="No active cards" sub="Issue a prepaid card to configure category locks." />
            ) : (
              <ul className="space-y-2">
                {active.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-canvas/40 px-3.5 py-3">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-white text-muted shadow-sm"><Icon name="card" size={15} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-bold text-ink">{p.name}</p>
                      <p className="text-[11px] font-semibold text-faint num">Cap {kes(p.monthlyLimit)}/mo · •• {p.last4}</p>
                    </div>
                    <Badge tone={p.mcc === "any" ? "muted" : "violet"}>{p.mcc === "any" ? "Open MCC" : mccLabel(p.mcc)}</Badge>
                    <Btn size="sm" variant="outline" icon="sliders" onClick={() => openModal({ type: "prepaidManage", cardId: p.id })}>Edit</Btn>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Programme defaults</p>
              <div className={cn("flex items-center gap-3 rounded-xl border p-3 transition", autoReload ? "border-pmgreen/40 bg-pmgreen-soft/40" : "border-line bg-canvas/50")}>
                <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", autoReload ? "bg-white text-[#067647] shadow-sm" : "bg-white text-faint")}><Icon name="refresh" size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-ink">Auto-reload when low</p>
                  <p className="text-[11px] text-muted">Top up KES 10,000 when a card drops below 15%.</p>
                </div>
                <Toggle on={autoReload} label="Auto-reload" onChange={(v) => { setAutoReload(v); toast(v ? "success" : "warn", `Auto-reload ${v ? "enabled" : "disabled"}`); }} />
              </div>
              <div className={cn("mt-2 flex items-center gap-3 rounded-xl border p-3 transition", lowAlert ? "border-pmgreen/40 bg-pmgreen-soft/40" : "border-line bg-canvas/50")}>
                <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", lowAlert ? "bg-white text-[#067647] shadow-sm" : "bg-white text-faint")}><Icon name="bell" size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-ink">Low-balance alerts</p>
                  <p className="text-[11px] text-muted">Notify the cardholder and admin at 20%.</p>
                </div>
                <Toggle on={lowAlert} label="Low-balance alerts" onChange={(v) => { setLowAlert(v); toast(v ? "success" : "warn", `Low-balance alerts ${v ? "on" : "off"}`); }} />
              </div>
            </div>

            <div className="flex-1 rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2.5 text-[13.5px] font-bold text-ink">Available MCC categories</p>
              <ul className="grid grid-cols-2 gap-1.5">
                {MCC_CATEGORIES.filter((m) => m.id !== "any").map((m) => (
                  <li key={m.id} className="flex items-center gap-2 rounded-lg bg-canvas/60 px-2.5 py-2">
                    <Icon name={m.icon} size={13} className="flex-none text-muted" />
                    <span className="truncate text-[11px] font-bold text-ink-2">{m.label}</span>
                  </li>
                ))}
              </ul>
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
    <section id="prepaid-activity" className="scroll-mt-24">
      <SectionHead  title="Load & Spend Activity" sub="Every top-up, purchase, auto-reload and refund across your prepaid cards.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Activity exported", `${shown.length} events written to prepaid-activity.csv`)}>Export CSV</Btn>
      </SectionHead>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="rounded-xl border border-line bg-white p-3 shadow-pm">
          <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-faint"><Icon name="upRight" size={12} className="text-[#067647]" /> Loaded</p>
          <p className="num font-display mt-1 text-[16px] font-bold text-[#067647]">{kes(totalLoaded)}</p>
        </div>
        <div className="rounded-xl border border-line bg-white p-3 shadow-pm">
          <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-faint"><Icon name="downRight" size={12} className="text-[#b42318]" /> Spent</p>
          <p className="num font-display mt-1 text-[16px] font-bold text-ink">{kes(totalSpent)}</p>
        </div>
      </div>

      <div className="thin-scroll mb-4 flex gap-2 overflow-x-auto pb-1">
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
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
            <ul className="divide-y divide-line/70">
              {shown.map((l) => {
                const card = byId(l.cardId);
                const isLoad = l.amount > 0;
                return (
                  <li key={l.id} className="flex items-center gap-3 px-4 py-3">
                    <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", isLoad ? "bg-pmgreen-soft text-[#067647]" : "bg-canvas text-muted")}>
                      <Icon name={isLoad ? "upRight" : "downRight"} size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-bold text-ink">
                        {l.merchant}
                        <Badge tone={kindTone(l.kind)}>{l.kind}</Badge>
                      </p>
                      <p className="text-[10.5px] font-semibold text-faint">{l.date} · {card?.name ?? "—"} •• {card?.last4 ?? "----"}{l.source ? ` · ${l.source}` : ""}</p>
                    </div>
                    <p className={cn("num font-display text-[13.5px] font-bold", isLoad ? "text-[#067647]" : "text-ink")}>{isLoad ? "+" : "−"}{kes(Math.abs(l.amount))}</p>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-canvas/60 px-4 py-2.5">
              <p className="text-[11.5px] font-bold text-muted">{shown.length} event{shown.length === 1 ? "" : "s"} in view</p>
              <p className="num text-[11.5px] font-bold text-muted">Net · <span className="font-display text-[13px] text-ink">{kes(totalLoaded - totalSpent)}</span></p>
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
    <section id="prepaid-fees" className="scroll-mt-24">
      <SectionHead  title="Fees & Guide" sub="Transparent prepaid pricing and how to get the most from loadable cards." />
      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
            <div className="border-b border-line px-4 py-3"><p className="font-display text-[13.5px] font-bold text-ink">Prepaid fee schedule</p></div>
            <table className="w-full text-left">
              <tbody className="divide-y divide-line/70">
                {PREPAID_FEES.map((f, i) => (
                  <tr key={i} className="text-[12.5px] transition hover:bg-pmgreen-soft/15">
                    <td className="px-4 py-2.5 font-bold text-ink">{f.item}</td>
                    <td className="num px-3 py-2.5 font-display font-bold text-ink">{f.amount}</td>
                    <td className="hidden px-4 py-2.5 font-semibold text-muted sm:table-cell">{f.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-3">
            {[
              { icon: "users" as IconName, title: "Fund a team without exposure", copy: "Give each department a capped prepaid card instead of shared logins to the main account." },
              { icon: "spark" as IconName, title: "Gift cards that self-retire", copy: "Load once, let it spend down, and the leftover balance refunds to your wallet on retire." },
              { icon: "globe" as IconName, title: "Travel cash, ring-fenced", copy: "Pre-load a travel card so a lost card never touches your operating funds." },
            ].map((g) => (
              <div key={g.title} className="rounded-2xl border border-line bg-white p-4 shadow-pm">
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-pmgreen-soft text-[#067647]"><Icon name={g.icon} size={16} /></span>
                <p className="font-display mt-2 text-[13.5px] font-bold text-ink">{g.title}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{g.copy}</p>
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
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-pmgreen-soft text-[#067647]"><Icon name="checkCircle" size={26} /></span>
          <div>
            <p className="font-display text-[16px] font-bold text-ink">Loaded and ready</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{kes(issued.balance)} is available now. {issued.reloadable ? "Top it up anytime it runs low." : "This card retires once the balance is spent."}</p>
          </div>
          <div className="w-full max-w-[340px]"><PrepaidVisual card={issued} /></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* stepper */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={cn("grid h-6 w-6 place-items-center rounded-full font-display text-[11px] font-bold", s < step ? "bg-pmgreen text-white" : s === step ? "bg-ink text-white" : "bg-canvas text-faint")}>
                    {s < step ? <Icon name="check" size={11} strokeWidth={3} /> : s}
                  </span>
                  {s < 3 && <span className={cn("h-px w-7 sm:w-10", s < step ? "bg-pmgreen" : "bg-line")} />}
                </div>
              ))}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
              Step {step} · {step === 1 ? "Card Type" : step === 2 ? "Initial Funding & Limits" : "Review & Confirm"}
            </span>
          </div>

          {/* Step 1 — form + use */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <FieldLabel>Card format</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {([["virtual", "Virtual Prepaid", "Instant · online use", "card"], ["physical", "Physical Prepaid", "Tap in-store · 2–3 days", "wallet"]] as const).map(([id, label, sub, icon]) => (
                    <button key={id} onClick={() => setForm(id)} className={cn("flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition", form === id ? "border-pmgreen bg-pmgreen-soft/50 shadow-[0_4px_16px_-6px_rgba(18,183,106,0.4)]" : "border-line bg-white hover:border-[#c4c9d4]")}>
                      <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", form === id ? "bg-pmgreen text-white" : "bg-canvas text-muted")}><Icon name={icon} size={16} /></span>
                      <span><span className="block text-[13px] font-bold text-ink">{label}</span><span className="mt-0.5 block text-[11px] text-muted">{sub}</span><span className="mt-1 block text-[10.5px] font-bold text-faint">Fee {kes(PREPAID_ISSUANCE_FEE[id])}</span></span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>What's it for?</FieldLabel>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PREPAID_USES.map((u) => (
                    <button key={u.id} onClick={() => { setUse(u.id); setLoad(u.defaultLoad); setMonthlyLimit(u.defaultLoad); }} className={cn("flex items-start gap-3 rounded-xl border-2 p-3 text-left transition", use === u.id ? "border-pmgreen bg-pmgreen-soft/50" : "border-line bg-white hover:border-[#c4c9d4]")}>
                      <span className={cn("grid h-8 w-8 flex-none place-items-center rounded-[9px]", use === u.id ? "bg-pmgreen text-white" : "bg-canvas text-muted")}><Icon name={u.icon} size={15} /></span>
                      <span className="min-w-0"><span className="block text-[12.5px] font-bold text-ink">{u.title}</span><span className="mt-0.5 block text-[10.5px] leading-snug text-muted">{u.sub}</span></span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — funding & limits */}
          {step === 2 && (
            <div className="grid gap-5 lg:grid-cols-[1fr_250px]">
              <div className="space-y-4">
                <div>
                  <FieldLabel hint={`${name.length}/24`}>Card name</FieldLabel>
                  <input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} placeholder="Marketing Dept" className="focus-ring w-full rounded-[10px] border border-line bg-canvas/50 px-3.5 py-2.5 font-display text-[13px] font-semibold tracking-wide text-ink outline-none transition placeholder:font-medium placeholder:text-faint focus:border-pmgreen/60 focus:bg-white" />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <FieldLabel>Initial Top-up Amount (KES)</FieldLabel>
                    <span className="num font-display text-[15px] font-bold text-ink">{kes(load)}</span>
                  </div>
                  <input type="range" min={500} max={100000} step={500} value={load} onChange={(e) => setLoad(Number(e.target.value))} className="w-full" aria-label="Initial top-up amount" />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[1000, 5000, 10000, 25000].map((v) => (
                      <button key={v} onClick={() => setLoad(v)} className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold transition", load === v ? "border-pmgreen bg-pmgreen-soft text-[#067647]" : "border-line bg-white text-muted hover:border-[#c4c9d4]")}>{kesShort(v)}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel>Funding Source</FieldLabel>
                  <div className="space-y-1.5">
                    {PREPAID_FUNDING_SOURCES.map((f) => (
                      <button key={f} onClick={() => setFunding(f)} className={cn("flex w-full items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-left text-[12.5px] font-bold transition", funding === f ? "border-pmgreen bg-pmgreen-soft/50 text-[#067647]" : "border-line bg-white text-ink-2 hover:border-[#c4c9d4]")}>
                        <Icon name={f.startsWith("Biz Wallet") ? "wallet" : f.startsWith("M-Pesa") ? "phone" : "building"} size={15} />
                        <span className="flex-1">{f}</span>
                        {funding === f && <Icon name="check" size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <FieldLabel>Monthly Spending Limit (Optional)</FieldLabel>
                    <span className="num font-display text-[13px] font-bold text-ink">{kes(monthlyLimit)}</span>
                  </div>
                  <input type="range" min={500} max={100000} step={500} value={monthlyLimit} onChange={(e) => setMonthlyLimit(Number(e.target.value))} className="w-full" aria-label="Monthly limit" />
                </div>
                <div>
                  <FieldLabel>Lock card to specific Merchant Category (MCC)</FieldLabel>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {MCC_CATEGORIES.map((m) => (
                      <button key={m.id} onClick={() => setMcc(m.id)} className={cn("flex items-center gap-2.5 rounded-[10px] border px-3 py-2 text-left transition", mcc === m.id ? "border-pmgreen bg-pmgreen-soft/50" : "border-line bg-white hover:border-[#c4c9d4]")}>
                        <Icon name={m.icon} size={14} className={cn("flex-none", mcc === m.id ? "text-[#067647]" : "text-muted")} />
                        <span className="min-w-0"><span className="block truncate text-[11.5px] font-bold text-ink">{m.label}</span><span className="block truncate text-[9.5px] text-faint">{m.sample}</span></span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <FieldLabel>Live preview</FieldLabel>
                <IssuePreview form={form} use={use} name={name} load={load} mcc={mcc} network={network} />
                <p className="mt-2 rounded-lg bg-canvas/80 px-3 py-2 text-[11px] leading-relaxed text-muted">Balance shown is the initial load. Spending is capped at your monthly limit and locked to the chosen category.</p>
              </div>
            </div>
          )}

          {/* Step 3 — review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-line">
                {[
                  ["Type", `${form === "virtual" ? "Virtual" : "Physical"} Prepaid ${network}`],
                  ["Name", name.trim()],
                  ["Use case", useMeta(use).title],
                  ["Category lock", mccLabel(mcc)],
                  ["Monthly limit", kes(monthlyLimit)],
                  ["Initial Load", kes(load)],
                  ["Issuance Fee", kes(fee)],
                ].map(([k, v], i) => (
                  <div key={k} className={cn("flex items-center justify-between gap-3 px-4 py-2.5 text-[12.5px]", i % 2 === 0 ? "bg-canvas/60" : "bg-white")}>
                    <span className="font-semibold text-muted">{k}</span>
                    <span className="text-right font-bold text-ink">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-ink px-4 py-3">
                  <span className="text-[12.5px] font-bold text-white/70">Total Deduction</span>
                  <span className="num font-display text-[16px] font-bold text-pmgreen">{kes(total)}</span>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-muted">Debited from {funding.split("·")[0].trim()}.</p>
              <div>
                <FieldLabel hint="Authorises issuance">Enter PIN to authorize issuance</FieldLabel>
                <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setPinErr(false); }} placeholder="••••" className={cn("focus-ring num w-full rounded-[10px] border-2 bg-canvas/50 px-3.5 py-2.5 text-center font-display text-xl font-bold tracking-[0.5em] text-ink outline-none transition focus:bg-white", pinErr ? "border-danger shake" : "border-line focus:border-pmgreen")} />
                {pinErr && <p className="shake mt-1.5 flex items-center gap-1.5 text-[11.5px] font-bold text-[#b42318]"><Icon name="alertTri" size={12} /> Enter your 4-digit PayMo PIN.</p>}
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
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-pmgreen-soft text-[#067647]"><Icon name="checkCircle" size={26} /></span>
          <p className="font-display text-[15px] font-bold text-ink">{kes(amount)} added to {card.name}</p>
          <p className="max-w-[300px] text-[12.5px] leading-relaxed text-muted">The new balance is live and shown in Balances &amp; Reloads.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <FieldLabel>Card to top up</FieldLabel>
            <div className="thin-scroll flex gap-2 overflow-x-auto pb-1">
              {eligible.map((p) => (
                <button key={p.id} onClick={() => setCardId(p.id)} className={cn("flex-none rounded-[10px] border px-3 py-2 text-left text-[12px] font-bold transition", cardId === p.id ? "border-pmgreen bg-pmgreen-soft/50 text-[#067647]" : "border-line bg-white text-muted hover:border-[#c4c9d4]")}>
                  <span className="block">{p.name}</span>
                  <span className="num block text-[10.5px] font-semibold text-faint">{kes(p.balance)} · •• {p.last4}</span>
                </button>
              ))}
            </div>
          </div>
          {card && (
            <div className="rounded-xl border border-line bg-canvas/50 p-3">
              <div className="mx-auto max-w-[280px]"><PrepaidVisual card={card} small /></div>
            </div>
          )}
          <div>
            <FieldLabel hint="Min KES 100">Amount to load</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-faint">KES</span>
              <input type="number" min={100} step={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="focus-ring num w-full rounded-[10px] border border-line bg-canvas/50 py-2.5 pl-11 pr-3 font-display text-[16px] font-bold text-ink outline-none transition focus:border-pmgreen/60 focus:bg-white" />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[1000, 5000, 10000, 25000].map((v) => (
                <button key={v} onClick={() => setAmount(v)} className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold transition", amount === v ? "border-pmgreen bg-pmgreen-soft text-[#067647]" : "border-line bg-white text-muted hover:border-[#c4c9d4]")}>{kesShort(v)}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Fund from</FieldLabel>
            <div className="space-y-1.5">
              {["Biz Wallet", "M-Pesa Paybill 522 123", "KCB Bank •• 4471"].map((m) => (
                <button key={m} onClick={() => setSource(m)} className={cn("flex w-full items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-left text-[12.5px] font-bold transition", source === m ? "border-pmgreen bg-pmgreen-soft/50 text-[#067647]" : "border-line bg-white text-ink-2 hover:border-[#c4c9d4]")}>
                  <Icon name={m.startsWith("Biz") ? "wallet" : m.startsWith("M-Pesa") ? "phone" : "building"} size={15} />
                  <span className="flex-1">{m}</span>
                  {source === m && <Icon name="check" size={14} />}
                </button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel hint="Authorises the load">Enter your PayMo PIN</FieldLabel>
            <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" className="focus-ring num w-full rounded-[10px] border-2 border-line bg-canvas/50 px-3.5 py-2.5 text-center font-display text-xl font-bold tracking-[0.5em] text-ink outline-none transition focus:border-pmgreen focus:bg-white" />
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
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">Prepaid card</p>
          <h3 className="font-display text-[16px] font-bold tracking-tight text-ink">{card.name}</h3>
        </div>
        <button onClick={closeModal} aria-label="Close" className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink"><Icon name="x" size={17} /></button>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4 pb-28">
        <PrepaidVisual card={card} />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={statusTone(card.status)} dot className="capitalize">{card.status}</Badge>
          <Badge tone="muted">{card.form === "virtual" ? "Virtual" : "Physical"}</Badge>
          <Badge tone="violet">{useMeta(card.use).title}</Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-canvas/70 p-3 text-center">
          <div><p className="num font-display text-[14px] font-bold text-ink">{kesShort(card.balance)}</p><p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Balance</p></div>
          <div><p className="num font-display text-[14px] font-bold text-ink">{kesShort(card.loaded)}</p><p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Loaded</p></div>
          <div><p className="num font-display text-[14px] font-bold text-ink">{spentPct}%</p><p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Spent</p></div>
        </div>

        {/* quick actions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {card.status !== "retired" && <Btn icon="wallet" className="col-span-2" onClick={() => { const id = card.id; closeModal(); window.setTimeout(() => openModal({ type: "topup", cardId: id }), 60); }}>Top Up</Btn>}
          {card.status === "active" ? (
            <Btn variant="dangerGhost" icon="snow" onClick={() => setPrepaidStatus(card.id, "frozen")}>Freeze</Btn>
          ) : card.status === "frozen" ? (
            <Btn icon="zap" onClick={() => setPrepaidStatus(card.id, "active")}>Unfreeze</Btn>
          ) : (
            <span className="rounded-[10px] bg-canvas px-3 py-2 text-center text-[11.5px] font-bold text-faint">{card.status === "depleted" ? "Balance empty" : "Retired"}</span>
          )}
          <Btn variant="outline" icon="copy" onClick={() => toast("info", "Card details copied", "PAN, expiry and CVV copied securely.")}>Copy details</Btn>
        </div>

        {/* controls */}
        {card.status !== "retired" && (
          <div className="mt-5 space-y-3">
            <div>
              <FieldLabel>Card name</FieldLabel>
              <input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} className="focus-ring w-full rounded-[10px] border border-line bg-canvas/50 px-3.5 py-2.5 text-[13px] font-bold text-ink outline-none transition focus:border-pmgreen/60 focus:bg-white" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between"><FieldLabel>Monthly limit</FieldLabel><span className="num font-display text-[14px] font-bold text-ink">{kes(limit)}</span></div>
              <input type="range" min={500} max={100000} step={500} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-full" aria-label="Monthly limit" />
            </div>
            <div>
              <FieldLabel>Category lock (MCC)</FieldLabel>
              <select value={mcc} onChange={(e) => setMcc(e.target.value)} className="focus-ring w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink outline-none">
                {MCC_CATEGORIES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-3">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-pmgreen-soft text-[#067647]"><Icon name="refresh" size={16} /></span>
              <div className="min-w-0 flex-1"><p className="text-[12.5px] font-bold text-ink">Reloadable</p><p className="text-[11px] text-muted">Allow future top-ups on this card.</p></div>
              <Toggle on={reloadable} label="Reloadable" onChange={setReloadable} />
            </div>
            <Btn icon="check" className="w-full" onClick={save}>Save controls</Btn>
          </div>
        )}

        {/* recent activity */}
        <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-faint">Recent activity</p>
        {cardLoads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-canvas/50 p-4 text-center text-[12px] font-semibold text-faint">No activity on this card yet.</div>
        ) : (
          <ul className="divide-y divide-line/70 rounded-xl border border-line bg-white">
            {cardLoads.map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-3.5 py-2.5">
                <span className={cn("grid h-8 w-8 flex-none place-items-center rounded-lg", l.amount > 0 ? "bg-pmgreen-soft text-[#067647]" : "bg-canvas text-muted")}><Icon name={l.amount > 0 ? "upRight" : "downRight"} size={14} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-[12.5px] font-bold text-ink">{l.merchant}</p><p className="text-[10.5px] font-semibold text-faint">{l.date} · {l.kind}</p></div>
                <p className={cn("num text-[12.5px] font-bold", l.amount > 0 ? "text-[#067647]" : "text-ink")}>{l.amount > 0 ? "+" : "−"}{kesShort(Math.abs(l.amount))}</p>
              </li>
            ))}
          </ul>
        )}

        {/* retire */}
        {card.status !== "retired" && (
          <div className="mt-5 rounded-xl border border-danger/25 bg-danger-soft/30 p-3.5">
            <p className="text-[12.5px] font-bold text-[#b42318]">Retire this card</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-[#b42318]/80">Permanently closes the card. Any remaining {kes(card.balance)} is refunded to your Biz Wallet.</p>
            {confirmRetire ? (
              <div className="mt-2.5 flex gap-2">
                <Btn size="sm" variant="danger" icon="check" onClick={() => { retirePrepaid(card.id); closeModal(); }}>Confirm retire</Btn>
                <Btn size="sm" variant="outline" onClick={() => setConfirmRetire(false)}>Cancel</Btn>
              </div>
            ) : (
              <Btn size="sm" variant="dangerGhost" icon="x" className="mt-2.5" onClick={() => setConfirmRetire(true)}>Retire card</Btn>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
