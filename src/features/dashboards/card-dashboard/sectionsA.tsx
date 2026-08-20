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
    <section id="overview" className="scroll-mt-24">
      {/* Hero */}
      <Reveal>
        <div className="pm-hero relative overflow-hidden rounded-2xl border border-line p-5 text-white shadow-pm sm:p-7">
          <div className="pm-hero-dots absolute inset-0" />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="min-w-0 flex-1 basis-[300px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#cfe8db]">
                  <span className="live-dot" /> BAAS · Card Programme
                </span>
                <span className="rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-[#cfe8db]">Module 5.1</span>
              </div>
              <h1 className="font-display mt-3 text-[26px] font-bold leading-[1.1] tracking-tight sm:text-[34px]">
                Card Command Center
              </h1>
              <p className="mt-2 max-w-[480px] text-[13px] leading-relaxed text-white/65">
                Every card Acme Traders has issued — physical, virtual, credit and prepaid — with live spend,
                alerts, controls and fraud response in one place.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn icon="plus" onClick={() => openModal({ type: "issue" })}>Issue New Card</Btn>
                <Btn variant="ghost" icon="bell" onClick={() => openModal({ type: "alerts" })}>
                  Configure Alerts {channelsOn.length > 0 && <span className="rounded-full bg-white/15 px-1.5 text-[10px]">{channelsOn.join(" · ")}</span>}
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
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { k: "Active cards", v: String(stats.active) },
                  { k: "MTD spend", v: kesShort(stats.spend) },
                  { k: "Alerts · 30d", v: "148" },
                  { k: "Fraud flags", v: String(stats.flagged), warn: true },
                ].map((s) => (
                  <div key={s.k} className="leading-tight">
                    <p className={cn("font-display num text-[17px] font-bold", s.warn ? "text-[#ffd27d]" : "text-white")}>{s.v}</p>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/45">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden h-[240px] w-[300px] flex-none md:block">
              <div className="absolute right-2 top-1 w-[250px] rotate-[6deg] transition-transform duration-300 hover:rotate-[3deg]">
                {cards[0] && <CardVisual card={cards[0]} />}
              </div>
              <div className="absolute bottom-1 left-0 w-[250px] -rotate-[4deg] transition-transform duration-300 hover:-rotate-[1deg]">
                {cards[2] && <CardVisual card={cards[2]} />}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* KPI cards */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: "wallet" as IconName,
            tone: "bg-pmgreen-soft text-[#067647]",
            label: "MTD Card Spend",
            value: kes(stats.spend),
            delta: "+8.4%",
            dir: "up",
            spark: [18, 22, 19, 26, 31, 28, 34, 38, 36, 41],
            note: "vs KES " + Math.round(stats.spend / 1.084).toLocaleString() + " last month",
          },
          {
            icon: "card" as IconName,
            tone: "bg-pmblue-soft text-[#175cd3]",
            label: "Active Cards",
            value: `${stats.active} / ${stats.total}`,
            delta: "+2",
            dir: "up",
            spark: [4, 4, 5, 5, 5, 6, 6, 6, 7, 7],
            note: stats.frozen > 0 ? `${stats.frozen} frozen · 1 in delivery` : "1 card in delivery",
          },
          {
            icon: "bell" as IconName,
            tone: "bg-pmviolet-soft text-[#5925dc]",
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
            tone: "bg-warn-soft text-[#93370d]",
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
          <Reveal key={k.label} delay={i * 70}>
            <button
              onClick={k.onClick}
              className={cn(
                "group w-full rounded-2xl border border-line bg-white p-4 text-left shadow-pm transition-all duration-200",
                k.onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-pm-lg" : "cursor-default"
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn("grid h-[42px] w-[42px] place-items-center rounded-xl", k.tone)}>
                  <Icon name={k.icon} size={19} />
                </span>
                <Spark points={k.spark} stroke={k.sparkStroke ?? "#12b76a"} />
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.07em] text-muted">{k.label}</p>
              <p className="num font-display mt-0.5 text-[24px] font-bold leading-none tracking-tight text-ink">{k.value}</p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold",
                    k.dir === "up" && "bg-pmgreen-soft text-[#067647]",
                    k.dir === "flat" && "bg-warn-soft text-[#93370d]"
                  )}
                >
                  {k.dir === "up" && <Icon name="upRight" size={11} strokeWidth={2.4} />}
                  {k.delta}
                </span>
                <span className={cn("text-[11px] font-semibold text-faint", k.warnNote && "font-bold text-[#b42318]")}>{k.note}</span>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {/* Needs attention strip */}
      <Reveal delay={120}>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <button onClick={() => scrollToId("security")} className="group flex items-center gap-3 rounded-2xl border border-warn/35 bg-warn-soft/50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-pm">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-warn/15 text-[#93370d]"><Icon name="alertTri" size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-[#93370d]">CNP fraud spike detected</span>
              <span className="block text-[11.5px] font-semibold text-[#93370d]/70">Online attempts up 400% in 6h — review 2 flagged transactions</span>
            </span>
            <Icon name="arrowRight" size={16} className="text-[#93370d] transition group-hover:translate-x-0.5" />
          </button>
          <button onClick={() => openDrawer({ type: "card", cardId: "c7" })} className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left shadow-pm transition hover:-translate-y-0.5 hover:shadow-pm-lg">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-pmblue-soft text-[#175cd3]"><Icon name="clock" size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-ink">1 card in delivery</span>
              <span className="block text-[11.5px] font-semibold text-muted">Sales Team Card ·• 2214 — Fargo Courier, ETA 2 days</span>
            </span>
            <Icon name="arrowRight" size={16} className="text-faint transition group-hover:translate-x-0.5 group-hover:text-ink" />
          </button>
          <button onClick={() => scrollToId("program")} className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-left shadow-pm transition hover:-translate-y-0.5 hover:shadow-pm-lg">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-canvas text-muted"><Icon name="refresh" size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-ink">KYC/AML oracle degraded</span>
              <span className="block text-[11.5px] font-semibold text-muted">1.2s delay on checks — issuance unaffected</span>
            </span>
            <Icon name="arrowRight" size={16} className="text-faint transition group-hover:translate-x-0.5 group-hover:text-ink" />
          </button>
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
    <section id="cards" className="scroll-mt-24">
      <SectionHead
        no="02"
        title="My Cards"
        sub="Tap any card for the full control drawer — freeze, limits, PIN and activity live there."
      >
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "issue" })}>Issue Card</Btn>
      </SectionHead>

      <div className="thin-scroll mb-4 flex gap-2 overflow-x-auto pb-1">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((c, i) => {
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
                    <Badge tone={c.status === "active" ? "success" : c.status === "frozen" ? "info" : c.status === "delivering" ? "warning" : "danger"} dot className="capitalize">
                      {c.status}
                    </Badge>
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
                      <Btn
                        size="sm"
                        icon="zap"
                        className="flex-1"
                        onClick={() => {
                          setCardStatus(c.id, "active");
                          toast("success", `${c.nickname} unfrozen`);
                          pushNotif({ channel: "push", title: "Card unfrozen", body: `${c.nickname} •• ${c.last4} is active again.` });
                        }}
                      >
                        Unfreeze
                      </Btn>
                    ) : c.status === "active" ? (
                      <Btn size="sm" variant="dangerGhost" icon="snow" className="flex-1" onClick={() => openModal({ type: "freeze", cardId: c.id })}>
                        Freeze
                      </Btn>
                    ) : (
                      <span className="flex-1 rounded-[10px] bg-canvas px-3 py-1.5 text-center text-[11.5px] font-bold text-faint">
                        {c.status === "blocked" ? "Permanently blocked" : "Awaiting delivery"}
                      </span>
                    )}
                    <button onClick={() => openModal({ type: "alerts", cardId: c.id })} title="Configure alerts for this card" className="focus-ring grid h-8 w-8 place-items-center rounded-[9px] border border-line text-muted transition hover:border-pmgreen/50 hover:bg-pmgreen-soft hover:text-[#067647]">
                      <Icon name="bell" size={14} />
                    </button>
                    <button onClick={() => openModal({ type: "limits", cardId: c.id })} title="Limits & controls" className="focus-ring grid h-8 w-8 place-items-center rounded-[9px] border border-line text-muted transition hover:border-pmgreen/50 hover:bg-pmgreen-soft hover:text-[#067647]">
                      <Icon name="sliders" size={14} />
                    </button>
                    <button onClick={() => openDrawer({ type: "card", cardId: c.id })} title="Card details" className="focus-ring grid h-8 w-8 place-items-center rounded-[9px] border border-line text-muted transition hover:border-pmgreen/50 hover:bg-pmgreen-soft hover:text-[#067647]">
                      <Icon name="chevRight" size={14} />
                    </button>
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
