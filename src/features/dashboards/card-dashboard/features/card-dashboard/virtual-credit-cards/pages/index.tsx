import { useEffect, useState } from "react";
import { cn } from "../../../../lib";
import { Icon, type IconName } from "../../../../components/ui/icons";
import { Badge, Btn, Chip, FieldLabel, Modal, Progress, Reveal, SectionHead, Spark, Toggle, Empty } from "../../../../components/ui";
import { useApp, scrollToId } from "../../../../lib";
import { kes, kesShort, type PmCard, type Txn } from "../../../../lib";
import { CardVisual } from "../../../../components/modals/modalsA";
import {
  COLOR_THEMES,
  CREDIT_FEES,
  CREDIT_FUNDING_SOURCES,
  SEED_STATEMENTS,
  UTILISATION_TREND,
  kes,
  kesShort,
  type ColorTheme,
} from "../../../../lib";
import { 
  CREDIT_FEES,
  CREDIT_FUNDING_SOURCES,
  CREDIT_PURPOSES,
  COLOR_THEMES,
  type CreditPurpose,
  type PmCard,
} from "../../../../lib";

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
                <span className="rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-[#cfe8db]">Module 5.4</span>
              </div>
              <h1 className="font-display mt-3 text-[26px] font-bold leading-[1.1] tracking-tight sm:text-[34px]">
                Virtual Credit<br className="hidden sm:block" /> Card Center
              </h1>
              <p className="mt-2 max-w-[500px] text-[13px] leading-relaxed text-white/65">
                Issue single-use, subscription-locked or multi-use credit cards against one revolving business line.
                Every card carries its own ceiling, colour and expiry.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn icon="plus" onClick={() => openModal({ type: "creditIssue" })}>Issue Credit Card</Btn>
                <Btn variant="ghost" icon="wallet" onClick={() => openModal({ type: "repay" })}>Make a Payment</Btn>
                <Btn variant="ghost" icon="chart" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { k: "Approved line", v: kesShort(creditLine.approved) },
                  { k: "Available now", v: kesShort(available) },
                  { k: "Utilisation", v: `${utilisation}%` },
                  { k: "Cards on line", v: String(creditCards.length) },
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
                {creditCards[0] && <CardVisual card={creditCards[0]} />}
              </div>
              <div className="absolute bottom-0 left-1 w-[245px] -rotate-[4deg]">
                {creditCards[1] && <CardVisual card={creditCards[1]} />}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: "wallet" as IconName,
            tone: "bg-pmgreen-soft text-[#067647]",
            label: "Available Credit",
            value: kes(available),
            note: `of ${kesShort(creditLine.approved)} approved`,
            spark: [88, 86, 84, 82, 80, 78, 76, 74],
            stroke: "#12b76a",
          },
          {
            icon: "chart" as IconName,
            tone: "bg-pmblue-soft text-[#175cd3]",
            label: "Outstanding Balance",
            value: kes(creditLine.outstanding),
            note: `+ ${kesShort(creditLine.pendingAuth)} pending auth`,
            spark: [22, 26, 31, 28, 34, 38, 42, 45],
            stroke: "#2e90fa",
          },
          {
            icon: "clock" as IconName,
            tone: "bg-warn-soft text-[#93370d]",
            label: "Payment Due",
            value: kes(creditLine.minimumDue),
            note: `Minimum · by ${creditLine.dueDate}`,
            spark: [10, 10, 12, 12, 14, 14, 16, 16],
            stroke: "#f79009",
            action: () => openModal({ type: "repay" }),
          },
          {
            icon: "refresh" as IconName,
            tone: "bg-pmviolet-soft text-[#5925dc]",
            label: "Repaid · Last 3 Cycles",
            value: kesShort(paidThisYear),
            note: creditLine.autoDebit ? "Auto-debit active" : "Manual settlement",
            spark: [39, 49, 62, 45, 52, 60, 58, 62],
            stroke: "#7a5af8",
          },
        ].map((k, i) => (
          <Reveal key={k.label} delay={i * 70}>
            <button
              onClick={k.action}
              className={cn(
                "group w-full rounded-2xl border border-line bg-white p-4 text-left shadow-pm transition-all duration-200",
                k.action ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-pm-lg" : "cursor-default"
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn("grid h-[42px] w-[42px] place-items-center rounded-xl", k.tone)}>
                  <Icon name={k.icon} size={19} />
                </span>
                <Spark points={k.spark} stroke={k.stroke} />
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.07em] text-muted">{k.label}</p>
              <p className="num font-display mt-0.5 text-[22px] font-bold leading-none tracking-tight text-ink">{k.value}</p>
              <p className="mt-2 text-[11px] font-semibold text-faint">{k.note}</p>
            </button>
          </Reveal>
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
    <section id="credit-line" className="scroll-mt-24">
      <SectionHead  title="Credit Line & Statement" sub="One revolving line behind every virtual credit card. Statement closes monthly.">
        <Btn size="sm" variant="outline" icon="inbox" onClick={() => openModal({ type: "statement" })}>All statements</Btn>
        <Btn size="sm" icon="wallet" onClick={() => openModal({ type: "repay" })}>Make a Payment</Btn>
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-5">
        {/* Limit gauge */}
        <Reveal className="lg:col-span-3">
          <div className="h-full rounded-2xl border border-line bg-white p-5 shadow-pm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Biz Credit Line</p>
                <p className="num font-display mt-1 text-[26px] font-bold leading-none tracking-tight text-ink">{kes(creditLine.approved)}</p>
                <p className="mt-1.5 text-[11.5px] font-semibold text-faint">Visa &amp; Mastercard revolving · {creditLine.apr}% p.m. on carried balance</p>
              </div>
              <Badge tone={utilisation > 60 ? "warning" : "success"} dot>
                {utilisation}% utilised
              </Badge>
            </div>

            <div className="mt-4">
              <Progress value={utilisation} tone={utilisation > 80 ? "red" : utilisation > 50 ? "amber" : "green"} className="h-[10px]" />
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                {[
                  { k: "Outstanding", v: kesShort(creditLine.outstanding), tone: "text-ink" },
                  { k: "Pending auth", v: kesShort(creditLine.pendingAuth), tone: "text-[#93370d]" },
                  { k: "Available", v: kesShort(available), tone: "text-[#067647]" },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-canvas/70 p-2.5">
                    <p className={cn("num font-display text-[14px] font-bold", s.tone)}>{s.v}</p>
                    <p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing cycle */}
            <div className="mt-4 rounded-xl border border-line bg-canvas/50 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[12px] font-bold text-ink">
                  <Icon name="clock" size={13} className="text-muted" /> Current cycle
                </p>
                <p className="text-[11.5px] font-semibold text-muted">{creditLine.cycleStart} – {creditLine.cycleEnd}</p>
              </div>
              <Progress className="mt-2.5" value={cycleProgress} tone="violet" />
              <p className="mt-1.5 text-[11px] font-semibold text-faint">{30 - cycleDay} days until this cycle closes and the statement is issued.</p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-pmgreen/30 bg-pmgreen-soft/40 p-3.5">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] bg-white text-[#067647] shadow-sm">
                <Icon name="wallet" size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-bold text-ink">Minimum due {kes(creditLine.minimumDue)}</p>
                <p className="text-[11px] font-semibold text-muted">Due {creditLine.dueDate} · settle in full to avoid {creditLine.apr}% interest</p>
              </div>
              <Btn size="sm" icon="arrowRight" onClick={() => openModal({ type: "repay" })}>Pay now</Btn>
            </div>
          </div>
        </Reveal>

        {/* Statement summary + auto debit */}
        <Reveal delay={80} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <div className="flex items-center justify-between">
                <p className="font-display text-[13.5px] font-bold text-ink">Open statement</p>
                <Badge tone="warning" dot>Open</Badge>
              </div>
              <p className="mt-1 text-[11.5px] font-semibold text-faint">{openStatement?.period}</p>
              <div className="mt-3 space-y-2">
                {[
                  ["Spend this cycle", kes(creditLine.outstanding)],
                  ["Paid", kes(openStatement?.paid ?? 0)],
                  ["Interest", creditLine.outstanding > 0 ? `${creditLine.apr}% if carried` : "None"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-muted">{k}</span>
                    <span className="num font-bold text-ink">{v}</span>
                  </div>
                ))}
              </div>
              <Btn size="sm" variant="outline" icon="download" className="mt-3 w-full" onClick={() => openModal({ type: "statement" })}>
                View statement
              </Btn>
            </div>

            <div className="flex-1 rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display text-[13.5px] font-bold text-ink">Auto-debit settlement</p>
              <div className={cn("mt-3 flex items-center gap-3 rounded-xl border p-3 transition", creditLine.autoDebit ? "border-pmgreen/40 bg-pmgreen-soft/40" : "border-line bg-canvas/50")}>
                <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", creditLine.autoDebit ? "bg-white text-[#067647] shadow-sm" : "bg-white text-faint")}>
                  <Icon name="refresh" size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-ink">Debit minimum on due date</p>
                  <p className="text-[11px] text-muted">From KCB Bank •• 4471 on {creditLine.dueDate}</p>
                </div>
                <Toggle on={creditLine.autoDebit} label="Auto-debit settlement" onChange={setAutoDebit} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-canvas/70 p-2.5 text-center">
                  <p className="num font-display text-[14px] font-bold text-ink">{cards.filter(isCreditCard).length}</p>
                  <p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Cards on line</p>
                </div>
                <div className="rounded-xl bg-canvas/70 p-2.5 text-center">
                  <p className="num font-display text-[14px] font-bold text-ink">{SEED_STATEMENTS.length}</p>
                  <p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Statements</p>
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
    <section id="credit-cards" className="scroll-mt-24">
      <SectionHead  title="Virtual Credit Cards" sub="Each card draws from the same line but carries its own ceiling, lock and colour.">
        <div className="relative">
          <Icon name="search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a credit card…"
            className="focus-ring w-[190px] rounded-[10px] border border-line bg-white py-2 pl-9 pr-3 text-[12.5px] font-semibold outline-none transition placeholder:font-medium placeholder:text-faint focus:border-pmgreen/50"
          />
        </div>
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "creditIssue" })}>Issue Card</Btn>
      </SectionHead>

      <div className="thin-scroll mb-4 flex gap-2 overflow-x-auto pb-1">
        {(["all", "single-use", "subscription", "multi-use"] as CreditFilter[]).map((f) => (
          <Chip key={f} on={filter === f} onClick={() => setFilter(f)} count={count(f)}>
            {f === "all" ? "All cards" : purposeMeta(f).title}
          </Chip>
        ))}
      </div>

      {/* Quick purpose launchers */}
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {CREDIT_PURPOSES.map((p, i) => (
          <Reveal key={p.id} delay={i * 60}>
            <button
              onClick={() => {
                openModal({ type: "creditIssue" });
                window.setTimeout(() => window.dispatchEvent(new CustomEvent("pm-credit-purpose", { detail: p.id })), 40);
              }}
              className="group flex w-full items-center gap-3 rounded-xl border border-line bg-white p-3 text-left shadow-pm transition-all duration-200 hover:-translate-y-0.5 hover:border-pmgreen/50 hover:shadow-pm-lg"
            >
              <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-pmgreen-soft text-[#067647]">
                <Icon name={p.icon} size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-bold text-ink">{p.title}</span>
                <span className="block truncate text-[10.5px] font-semibold text-faint">{p.sub}</span>
              </span>
              <Icon name="plus" size={14} className="flex-none text-faint transition group-hover:text-pmgreen" />
            </button>
          </Reveal>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((card, i) => {
            const usage = Math.round((card.spentMonth / card.limitMonth) * 100);
            const meta = purposeMeta(purposeOf(card));
            const locked = card.merchantLock && card.merchantLock !== "Open merchants";
            return (
              <Reveal key={card.id} delay={(i % 3) * 70}>
                <div className="group rounded-2xl border border-line bg-white p-3.5 shadow-pm transition-all duration-200 hover:-translate-y-1 hover:shadow-pm-lg">
                  <button onClick={() => openModal({ type: "creditDetails", cardId: card.id })} className="card-hover block w-full text-left" aria-label={`Manage ${card.nickname}`}>
                    <CardVisual card={card} />
                  </button>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-bold text-ink">{card.nickname}</p>
                      <p className="text-[11px] font-semibold text-faint">{card.holder.toLowerCase()} · •• {card.last4}</p>
                    </div>
                    <Badge tone={card.status === "active" ? "success" : card.status === "frozen" ? "info" : "danger"} dot className="capitalize">{card.status}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone="violet">{meta.title}</Badge>
                    {locked && <Badge tone="success"><Icon name="lock" size={10} /> {card.merchantLock}</Badge>}
                    {card.requires3ds && <Badge tone="muted">3DS</Badge>}
                  </div>
                  <div className="mt-2.5">
                    <div className="mb-1 flex justify-between text-[10.5px] font-bold text-faint">
                      <span className="num">{kesShort(card.spentMonth)} drawn</span>
                      <span className="num">{usage}% of {kesShort(card.limitMonth)}</span>
                    </div>
                    <Progress value={usage} tone={usage > 85 ? "red" : usage > 60 ? "amber" : "green"} />
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 border-t border-line/70 pt-3">
                    {card.status === "active" ? (
                      <Btn size="sm" variant="dangerGhost" icon="snow" className="flex-1" onClick={() => { setCardStatus(card.id, "frozen"); toast("warn", `${card.nickname} frozen`, "New authorisations will decline until unfrozen."); }}>Freeze</Btn>
                    ) : (
                      <Btn size="sm" icon="zap" className="flex-1" onClick={() => { setCardStatus(card.id, "active"); toast("success", `${card.nickname} reactivated`); }}>Unfreeze</Btn>
                    )}
                    <button onClick={() => openModal({ type: "creditDetails", cardId: card.id })} title="Secure details" className="focus-ring grid h-8 w-8 place-items-center rounded-[9px] border border-line text-muted transition hover:border-pmgreen/50 hover:bg-pmgreen-soft hover:text-[#067647]"><Icon name="eye" size={14} /></button>
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

/* ============ 04 · Repayment & billing history ============ */

export function RepaymentSection() {
  const { repayments, creditLine, openModal, toast } = useApp();

  return (
    <section id="repayment" className="scroll-mt-24">
      <SectionHead  title="Repayment & Billing" sub="Every shilling repaid against the line, with method and reference for reconciliation.">
        <Btn size="sm" variant="outline" icon="inbox" onClick={() => openModal({ type: "statement" })}>Statements</Btn>
        <Btn size="sm" icon="wallet" onClick={() => openModal({ type: "repay" })}>Make a Payment</Btn>
      </SectionHead>

      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-canvas/70 text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint">
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Type</th>
                  <th className="px-3 py-2.5">Method</th>
                  <th className="px-3 py-2.5">Reference</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {repayments.map((r) => (
                  <tr key={r.id} className="text-[12.5px] transition hover:bg-pmgreen-soft/15">
                    <td className="px-4 py-3 font-bold text-ink">{r.date}</td>
                    <td className="px-3 py-3"><Badge tone={r.type === "Auto-debit" ? "info" : r.type === "Wallet" ? "violet" : "muted"}>{r.type}</Badge></td>
                    <td className="px-3 py-3 font-semibold text-muted">{r.method}</td>
                    <td className="num px-3 py-3 font-semibold text-faint">{r.ref}</td>
                    <td className="num px-4 py-3 text-right font-display font-bold text-[#067647]">+{kes(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-line/70 md:hidden">
            {repayments.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-pmgreen-soft text-[#067647]"><Icon name="checkCircle" size={15} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-ink">{r.date}</p>
                  <p className="text-[10.5px] font-semibold text-faint">{r.method} · {r.ref}</p>
                  <div className="mt-1"><Badge tone={r.type === "Auto-debit" ? "info" : r.type === "Wallet" ? "violet" : "muted"}>{r.type}</Badge></div>
                </div>
                <p className="num font-display text-[13.5px] font-bold text-[#067647]">+{kesShort(r.amount)}</p>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-canvas/60 px-4 py-2.5">
            <p className="text-[11.5px] font-bold text-muted">{repayments.length} repayments recorded</p>
            <button onClick={() => toast("info", "Repayment history exported", `${repayments.length} repayments written to repayments.csv`)} className="text-[11.5px] font-bold text-pmgreen-dark transition hover:text-pmgreen">
              Export CSV
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { icon: "wallet" as IconName, title: "Settle in full", copy: `Pay ${kes(creditLine.outstanding)} before ${creditLine.dueDate} and pay zero interest.`, action: "Pay balance", amount: creditLine.outstanding },
            { icon: "gauge" as IconName, title: "Pay the minimum", copy: `${kes(creditLine.minimumDue)} keeps the account current. Interest applies to the remainder.`, action: "Pay minimum", amount: creditLine.minimumDue },
            { icon: "sliders" as IconName, title: "Pay a custom amount", copy: "Choose any figure between the minimum and the full outstanding balance.", action: "Choose amount", amount: 0 },
          ].map((o) => (
            <div key={o.title} className="flex h-full flex-col rounded-2xl border border-line bg-white p-4 shadow-pm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pm-lg">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-pmgreen-soft text-[#067647]"><Icon name={o.icon} size={18} /></span>
              <h3 className="font-display mt-3 text-[14px] font-bold tracking-tight text-ink">{o.title}</h3>
              <p className="mt-1 flex-1 text-[11.5px] leading-relaxed text-muted">{o.copy}</p>
              <Btn size="sm" variant="outline" className="mt-3" icon="arrowRight" onClick={() => openModal({ type: "repay" })}>{o.action}</Btn>
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
    <section id="credit-activity" className="scroll-mt-24">
      <SectionHead  title="Credit Activity" sub="Authorisations against the credit line with the card that produced each one.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Credit activity exported", `${shown.length} authorisations written to credit-activity.csv`)}>Export CSV</Btn>
      </SectionHead>

      <div className="thin-scroll mb-4 flex gap-2 overflow-x-auto pb-1">
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
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-canvas/70 text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint">
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Merchant</th>
                    <th className="px-3 py-2.5">Card</th>
                    <th className="px-3 py-2.5 text-right">Amount</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {shown.map((t) => {
                    const card = byId(t.cardId);
                    return (
                      <tr key={t.id} className="text-[12.5px] transition hover:bg-pmgreen-soft/15">
                        <td className="px-4 py-3 font-bold text-ink">{t.date}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-canvas text-muted"><Icon name="globe" size={14} /></span>
                            <div className="leading-tight">
                              <p className="font-bold text-ink">{t.merchant}</p>
                              <p className="text-[10.5px] font-semibold text-faint">{t.memo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-bold text-ink">{card?.nickname ?? "—"}</p>
                          <p className="text-[10.5px] font-semibold text-faint">•• {card?.last4 ?? "----"}</p>
                        </td>
                        <td className="num px-3 py-3 text-right font-display font-bold text-ink">{kes(t.amount)}</td>
                        <td className="px-4 py-3"><Badge tone={tone(t.status)} dot>{t.status}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-line/70 md:hidden">
              {shown.map((t) => {
                const card = byId(t.cardId);
                return (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-canvas text-muted"><Icon name="globe" size={15} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold text-ink">{t.merchant}</p>
                      <p className="text-[10.5px] font-semibold text-faint">{t.date} · {card?.nickname}</p>
                      <div className="mt-1"><Badge tone={tone(t.status)} dot>{t.status}</Badge></div>
                    </div>
                    <p className="num font-display text-[13.5px] font-bold text-ink">−{kesShort(t.amount)}</p>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-canvas/60 px-4 py-2.5">
              <p className="text-[11.5px] font-bold text-muted">{shown.length} authorisation{shown.length === 1 ? "" : "s"} in view</p>
              <p className="num text-[11.5px] font-bold text-muted">Cleared · <span className="font-display text-[13px] text-ink">{kes(total)}</span></p>
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
    <section id="credit-insights" className="scroll-mt-24">
      <SectionHead  title="Fees, Utilisation & Insights" sub="How the line is priced, how hard it is working, and what to watch.">
        <Btn size="sm" variant="outline" icon="wallet" onClick={() => openModal({ type: "repay" })}>Reduce balance</Btn>
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="font-display text-[13.5px] font-bold text-ink">Utilisation trend · 6 months</p>
              <Badge tone={healthy ? "success" : utilisation > 60 ? "danger" : "warning"} dot>{utilisation}% now</Badge>
            </div>
            <div className="flex h-[150px] items-end gap-2.5">
              {UTILISATION_TREND.map((u) => (
                <div key={u.m} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="num text-[10.5px] font-bold text-faint">{u.pct}%</span>
                  <div
                    className={cn("w-full rounded-t-[6px] transition-all duration-500", u.m === "Jun" ? "bg-pmgreen" : "bg-[#dbe4f0]")}
                    style={{ height: `${(u.pct / max) * 110}px` }}
                  />
                  <span className="text-[10.5px] font-bold uppercase tracking-wide text-muted">{u.m}</span>
                </div>
              ))}
            </div>
            <p className={cn("mt-3 flex items-start gap-1.5 rounded-lg px-3 py-2 text-[11.5px] font-semibold leading-relaxed", healthy ? "bg-pmgreen-soft/70 text-[#067647]" : "bg-warn-soft/70 text-[#93370d]")}>
              <Icon name={healthy ? "checkCircle" : "alertTri"} size={13} className="mt-0.5 flex-none" />
              {healthy
                ? "Utilisation is healthy. Keeping below 40% supports a limit increase review."
                : "Utilisation is elevated. Paying down before the cycle closes reduces interest exposure."}
            </p>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2.5 text-[13.5px] font-bold text-ink">Credit pricing</p>
              <ul className="divide-y divide-line/70">
                {CREDIT_FEES.slice(0, 5).map((f) => (
                  <li key={f.item} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-ink">{f.item}</p>
                      <p className="text-[10.5px] font-semibold text-faint">{f.note}</p>
                    </div>
                    <span className="num flex-none font-display text-[12.5px] font-bold text-ink">{f.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2 text-[13.5px] font-bold text-ink">Limit review</p>
              <p className="text-[11.5px] leading-relaxed text-muted">
                You have repaid on time for 3 consecutive cycles. A limit increase to <strong className="text-ink">KES 750,000</strong> may be available.
              </p>
              <div className="mt-3 rounded-xl bg-canvas/70 p-3">
                <div className="mb-1 flex justify-between text-[10.5px] font-bold text-faint">
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
    <div className="card-sheen relative aspect-[1.62] w-full overflow-hidden rounded-2xl text-white shadow-[var(--shadow-card)]" style={{ background: sw.gradient }}>
      <div className="pm-hero-dots absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-[13.5px] font-bold">PayMo</p>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/60">
              {purpose === "single-use" ? "Single-Use Credit" : purpose === "subscription" ? "Subscription Credit" : "Virtual Credit"}
            </p>
          </div>
          {meta.selfDestructs && <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">1× only</span>}
        </div>
        <div>
          <p className="font-display text-[15px] font-semibold tracking-[0.08em] text-white/95">•••• •••• •••• ••••</p>
          <div className="mt-1.5 flex items-end justify-between">
            <div className="leading-tight">
              <p className="text-[9.5px] font-semibold uppercase tracking-wider text-white/55">Alias</p>
              <p className="text-[11.5px] font-bold tracking-wide text-white/95">{alias.toUpperCase() || "CARD ALIAS"}</p>
            </div>
            <div className="text-right leading-tight">
              <p className="text-[9.5px] font-semibold uppercase tracking-wider text-white/55">Valid thru</p>
              <p className="text-[11.5px] font-bold text-white/95">{expiry}</p>
            </div>
          </div>
          <p className="num mt-2 text-[10px] font-bold text-white/70">Limit {kes(limit)} / month</p>
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
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-pmgreen-soft text-[#067647]"><Icon name="checkCircle" size={26} /></span>
          <div>
            <p className="font-display text-[16px] font-bold text-ink">Your new card is ready</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">You can now use it for online transactions. {meta.selfDestructs ? "It will retire itself after the first successful payment." : meta.locksToMerchant ? "It is locked to the first merchant it transacts with." : "It draws from your revolving credit line."}</p>
          </div>
          <div className="w-full max-w-[340px]"><CardVisual card={issued} /></div>
          <p className="text-[11px] font-semibold text-faint">Funding · {funding.split("·")[0].trim()}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stepper */}
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
              Step {step} · {step === 1 ? "Select Card Purpose" : step === 2 ? "Customization & Limits" : "Security & Confirmation"}
            </span>
          </div>

          {/* Step 1 — purpose */}
          {step === 1 && (
            <div className="space-y-2">
              {CREDIT_PURPOSES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPurpose(p.id); setLimit(p.defaultLimit); }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all duration-150",
                    purpose === p.id ? "border-pmgreen bg-pmgreen-soft/50 shadow-[0_4px_16px_-6px_rgba(18,183,106,0.4)]" : "border-line bg-white hover:border-[#c4c9d4]"
                  )}
                >
                  <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", purpose === p.id ? "bg-pmgreen text-white" : "bg-canvas text-muted")}>
                    <Icon name={p.icon} size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-bold text-ink">{p.title}</span>
                      <Badge tone={p.id === "single-use" ? "violet" : p.id === "subscription" ? "info" : "muted"}>{p.badge}</Badge>
                    </span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-muted">{p.sub}</span>
                  </span>
                  {purpose === p.id && <Icon name="check" size={16} className="mt-1.5 flex-none text-pmgreen" strokeWidth={2.6} />}
                </button>
              ))}
              <p className="rounded-lg bg-canvas/80 px-3 py-2 text-[11.5px] leading-relaxed text-muted">
                All three card types draw from the same <strong className="text-ink">Biz Credit Line</strong>. Limits are per card, not per line.
              </p>
            </div>
          )}

          {/* Step 2 — customization */}
          {step === 2 && (
            <div className="grid gap-5 lg:grid-cols-[1fr_250px]">
              <div className="space-y-4">
                <div>
                  <FieldLabel hint={`${alias.length}/24 characters`}>Card Nickname (Alias)</FieldLabel>
                  <input
                    value={alias}
                    maxLength={24}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Marketing Ads"
                    className="focus-ring w-full rounded-[10px] border border-line bg-canvas/50 px-3.5 py-2.5 font-display text-[13px] font-semibold tracking-wide text-ink outline-none transition placeholder:font-medium placeholder:text-faint focus:border-pmgreen/60 focus:bg-white"
                  />
                </div>

                <div>
                  <FieldLabel>Color Theme</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_THEMES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        aria-label={t.label}
                        className={cn(
                          "flex items-center gap-2 rounded-[10px] border-2 px-2.5 py-1.5 transition",
                          theme === t.id ? "border-pmgreen bg-pmgreen-soft/50" : "border-line bg-white hover:border-[#c4c9d4]"
                        )}
                      >
                        <span className="h-4 w-4 flex-none rounded-full ring-1 ring-black/10" style={{ background: t.swatch }} />
                        <span className="text-[11.5px] font-bold text-ink">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <FieldLabel>Funding Source</FieldLabel>
                  <div className="space-y-1.5">
                    {CREDIT_FUNDING_SOURCES.map((f) => (
                      <button
                        key={f}
                        onClick={() => setFunding(f)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-left text-[12.5px] font-bold transition",
                          funding === f ? "border-pmgreen bg-pmgreen-soft/50 text-[#067647]" : "border-line bg-white text-ink-2 hover:border-[#c4c9d4]"
                        )}
                      >
                        <Icon name={f.startsWith("Biz Credit") ? "card" : f.startsWith("Biz Wallet") ? "wallet" : "building"} size={15} />
                        <span className="flex-1">{f}</span>
                        {funding === f && <Icon name="check" size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <FieldLabel>Monthly Spending Limit (KES)</FieldLabel>
                    <span className="num font-display text-[15px] font-bold text-ink">{kes(limit)}</span>
                  </div>
                  <input type="range" min={2000} max={200000} step={1000} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-full" aria-label="Monthly spending limit" />
                  <div className="mt-1 flex justify-between text-[10px] font-semibold text-faint"><span>KES 2,000</span><span>KES 200,000</span></div>
                </div>

                <div>
                  <FieldLabel>Expiry / Valid Thru</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {EXPIRY_OPTIONS.map((e) => (
                      <button
                        key={e}
                        onClick={() => setExpiry(e)}
                        className={cn(
                          "num rounded-[10px] border-2 px-3 py-2 font-display text-[12.5px] font-bold transition",
                          expiry === e ? "border-pmgreen bg-pmgreen-soft/50 text-[#067647]" : "border-line bg-white text-ink-2 hover:border-[#c4c9d4]"
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <FieldLabel>Live preview</FieldLabel>
                <div className="sticky top-0">
                  <CreditCardPreview purpose={purpose} alias={alias} theme={theme} expiry={expiry} limit={limit} />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-line">
                {[
                  ["Card Type", meta.title],
                  ["Nickname", alias.trim()],
                  ["Color Theme", sw.label],
                  ["Limit", `${kes(limit)} / month`],
                  ["Expiry", expiry],
                  ["Funding Source", funding],
                ].map(([k, v], i) => (
                  <div key={k} className={cn("flex items-center justify-between gap-3 px-4 py-2.5 text-[12.5px]", i % 2 === 0 ? "bg-canvas/60" : "bg-white")}>
                    <span className="font-semibold text-muted">{k}</span>
                    <span className="text-right font-bold text-ink">{v}</span>
                  </div>
                ))}
              </div>

              <div className="mx-auto max-w-[300px]">
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
                  className={cn(
                    "focus-ring num w-full rounded-[10px] border-2 bg-canvas/50 px-3.5 py-2.5 text-center font-display text-xl font-bold tracking-[0.5em] text-ink outline-none transition focus:bg-white",
                    pinErr ? "border-danger shake" : "border-line focus:border-pmgreen"
                  )}
                />
                {pinErr && <p className="shake mt-1.5 flex items-center gap-1.5 text-[11.5px] font-bold text-[#b42318]"><Icon name="alertTri" size={12} /> Enter your 4-digit PayMo PIN.</p>}
              </div>

              <p className="rounded-lg bg-pmgreen-soft/50 px-3 py-2 text-[11.5px] leading-relaxed text-[#067647]">
                <Icon name="zap" size={12} className="mr-1 inline" />
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
      <div className="space-y-4">
        <CardVisual card={card} />

        <div className="rounded-xl border border-line bg-canvas/50 p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] font-bold text-ink">Card credentials</p>
            <button onClick={() => { setRevealed((r) => !r); setSeconds(30); }} className="flex items-center gap-1.5 text-[11.5px] font-bold text-pmgreen-dark transition hover:text-pmgreen">
              <Icon name={revealed ? "eyeOff" : "eye"} size={13} />{revealed ? `Hide · ${seconds}s` : "Reveal"}
            </button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_92px]">
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-faint">Card number</p>
              <p className="num mt-1 font-display text-[14px] font-bold tracking-[0.08em] text-ink">{revealed ? fullPan : card.panMask}</p>
            </div>
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-faint">CVV</p>
              <p className="num mt-1 font-display text-[14px] font-bold tracking-[0.14em] text-ink">{revealed ? cvv : "•••"}</p>
            </div>
          </div>
          {revealed && (
            <button onClick={() => toast("success", "Credentials copied", "PAN and CVV held on your clipboard for 30 seconds.")} className="mt-2 flex items-center gap-1.5 text-[11.5px] font-bold text-pmgreen-dark">
              <Icon name="copy" size={13} /> Copy secure details
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-xl bg-canvas/70 p-3 text-center">
          <div><p className="num font-display text-[13.5px] font-bold text-ink">{kesShort(card.spentMonth)}</p><p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Drawn</p></div>
          <div><p className="num font-display text-[13.5px] font-bold text-ink">{kesShort(card.limitMonth)}</p><p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Card limit</p></div>
          <div><p className="num font-display text-[13.5px] font-bold text-ink">{usage}%</p><p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Used</p></div>
        </div>

        <div>
          <FieldLabel>Merchant lock</FieldLabel>
          <select value={lock} onChange={(e) => setLock(e.target.value)} className="focus-ring w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink outline-none">
            {["Open merchants", "Netflix", "AWS EMEA", "Meta Platforms", "Google Workspace", "Alibaba.com"].map((o) => <option key={o}>{o}</option>)}
          </select>
          <p className="mt-1.5 text-[11px] text-muted">A locked card declines any other merchant automatically.</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white p-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-pmgreen-soft text-[#067647]"><Icon name="shieldCheck" size={15} /></span>
            <span className="flex-1"><span className="block text-[12px] font-bold text-ink">Require 3-D Secure</span><span className="block text-[10.5px] text-muted">OTP challenge</span></span>
            <Toggle on={threeDs} label="Require 3-D Secure" onChange={setThreeDs} />
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white p-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-pmviolet-soft text-[#5925dc]"><Icon name="zap" size={15} /></span>
            <span className="flex-1"><span className="block text-[12px] font-bold text-ink">Single-use mode</span><span className="block text-[10.5px] text-muted">Retire after payment</span></span>
            <Toggle on={singleUse} label="Single-use mode" onChange={setSingleUse} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl bg-canvas/70 p-3">
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
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-pmgreen-soft text-[#067647]"><Icon name="checkCircle" size={26} /></span>
          <p className="font-display text-[15px] font-bold text-ink">{kes(amount)} applied</p>
          <p className="max-w-[300px] text-[12.5px] leading-relaxed text-muted">Your available credit has increased and the payment is logged in Repayment &amp; Billing.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <FieldLabel hint={`Max ${kes(creditLine.outstanding)}`}>Amount to pay</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-faint">KES</span>
              <input
                type="number"
                min={100}
                max={creditLine.outstanding}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="focus-ring num w-full rounded-[10px] border border-line bg-canvas/50 py-2.5 pl-11 pr-3 font-display text-[16px] font-bold text-ink outline-none transition focus:border-pmgreen/60 focus:bg-white"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { label: "Minimum", v: creditLine.minimumDue },
                { label: "Half", v: Math.round(creditLine.outstanding / 2) },
                { label: "Full balance", v: creditLine.outstanding },
              ].map((o) => (
                <button
                  key={o.label}
                  onClick={() => setAmount(o.v)}
                  className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold transition", amount === o.v ? "border-pmgreen bg-pmgreen-soft text-[#067647]" : "border-line bg-white text-muted hover:border-[#c4c9d4]")}
                >
                  {o.label} · {kesShort(o.v)}
                </button>
              ))}
            </div>
            {over && <p className="shake mt-2 flex items-center gap-1.5 text-[11.5px] font-bold text-[#b42318]"><Icon name="alertTri" size={12} /> Amount exceeds the outstanding balance.</p>}
          </div>

          <div>
            <FieldLabel>Pay from</FieldLabel>
            <div className="space-y-1.5">
              {["KCB Bank •• 4471 · KES 512,300", "Biz Wallet · KES 1,284,000", "M-Pesa Paybill 522 123 · KES 96,400"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m.split("·")[0].trim())}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-left text-[12.5px] font-bold transition",
                    method === m.split("·")[0].trim() ? "border-pmgreen bg-pmgreen-soft/50 text-[#067647]" : "border-line bg-white text-ink-2 hover:border-[#c4c9d4]"
                  )}
                >
                  <Icon name={m.startsWith("KCB") ? "building" : m.startsWith("Biz") ? "wallet" : "phone"} size={15} />
                  <span className="flex-1">{m}</span>
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
              className="focus-ring num w-full rounded-[10px] border-2 border-line bg-canvas/50 px-3.5 py-2.5 text-center font-display text-xl font-bold tracking-[0.5em] text-ink outline-none transition focus:border-pmgreen focus:bg-white"
            />
          </div>

          <p className="rounded-lg bg-canvas/80 px-3 py-2 text-[11.5px] leading-relaxed text-muted">
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
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">Credit line</p>
          <h3 className="font-display text-[16px] font-bold tracking-tight text-ink">Statement History</h3>
        </div>
        <button onClick={closeModal} aria-label="Close" className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink">
          <Icon name="x" size={17} />
        </button>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4 pb-24">
        {SEED_STATEMENTS.map((s) => (
          <div key={s.id} className="mb-3 rounded-2xl border border-line bg-white p-4 shadow-pm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-bold text-ink">{s.period}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-faint">Spend {kes(s.spend)} · Interest {kes(s.interest)}</p>
              </div>
              <Badge tone={s.status === "Paid" ? "success" : "warning"} dot>{s.status}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3">
              <p className="num text-[12px] font-bold text-muted">
                {s.status === "Paid" ? `Repaid ${kes(s.paid)}` : `${kes(s.spend - s.paid)} outstanding`}
              </p>
              <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Statement downloaded", `${s.period} PDF saved to your device.`)}>PDF</Btn>
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-dashed border-line bg-canvas/50 p-4 text-center">
          <Icon name="inbox" size={20} className="mx-auto text-faint" />
          <p className="mt-2 text-[12px] font-bold text-ink">Older statements</p>
          <p className="mt-0.5 text-[11px] text-muted">Statements older than four cycles are archived. Request them from support.</p>
          <Btn size="sm" variant="outline" className="mt-3" icon="headset" onClick={() => closeModal()}>Ask support</Btn>
        </div>
      </div>
    </Drawer>
  );
}
