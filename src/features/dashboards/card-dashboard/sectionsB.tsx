import { useEffect, useMemo, useState } from "react";
import { cn } from "./utils/cn";
import { Icon, type IconName } from "./icons";
import { Badge, Btn, Chip, Empty, Reveal, SectionHead } from "./ui";
import { useApp } from "./store";
import { kes, type TxnStatus } from "./data";

/* ============ 03 · Alerts & Notifications ============ */

export function AlertsSection() {
  const { alerts, cards, notifs, openModal, markAllRead, unread } = useApp();
  const [chanFilter, setChanFilter] = useState("all");

  const scopeLabel = alerts.scope === "all" ? "All cards" : cards.find((c) => c.id === alerts.scope)?.nickname ?? "All cards";

  const rules: { icon: IconName; label: string; state: string; on: boolean }[] = [
    { icon: "zap", label: "All transactions", state: alerts.allTxns ? "Every authorisation" : "Off", on: alerts.allTxns },
    {
      icon: "gauge",
      label: "Large transaction threshold",
      state: alerts.largeEnabled ? `Above ${kes(alerts.threshold)}` : "Off",
      on: alerts.largeEnabled,
    },
    { icon: "globe", label: "International transactions", state: alerts.international ? "Outside Kenya" : "Off", on: alerts.international },
    { icon: "x", label: "Declined transactions", state: alerts.declined ? "Every decline" : "Off", on: alerts.declined },
    { icon: "globe", label: "Card-Not-Present (Online)", state: alerts.cnp ? "Every online purchase" : "Off", on: alerts.cnp },
  ];

  const channels = [
    { icon: "phone" as IconName, name: "App Push", detail: "This device · iPhone 15 Pro", on: alerts.push },
    { icon: "sms" as IconName, name: "SMS", detail: "+254 7•• ••• 213", on: alerts.sms },
    { icon: "mail" as IconName, name: "Email", detail: "d•••@acmetraders.co.ke", on: alerts.email },
  ];

  const notifFiltered = notifs.filter((n) => chanFilter === "all" || n.channel === chanFilter);
  const chanIcon: Record<string, IconName> = { push: "phone", sms: "sms", email: "mail", system: "shield" };
  const chanTone: Record<string, string> = {
    push: "bg-pmgreen-soft text-[#067647]",
    sms: "bg-pmblue-soft text-[#175cd3]",
    email: "bg-pmviolet-soft text-[#5925dc]",
    system: "bg-warn-soft text-[#93370d]",
  };

  return (
    <section id="alerts" className="scroll-mt-24">
      <SectionHead
        no="03"
        title="Alerts & Notifications"
        sub={`Real-time rules for ${scopeLabel.toLowerCase()}. Changes apply to the very next transaction.`}
      >
        <Btn size="sm" icon="sliders" onClick={() => openModal({ type: "alerts" })}>Configure Alerts</Btn>
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-5">
        {/* Rules summary */}
        <Reveal className="lg:col-span-3">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-[13.5px] font-bold text-ink">Active alert rules</p>
              <Badge tone={rules.some((r) => r.on) ? "success" : "danger"} dot>
                {rules.filter((r) => r.on).length} of {rules.length} on
              </Badge>
            </div>
            <ul className="divide-y divide-line/70">
              {rules.map((r) => (
                <li key={r.label} className="flex items-center gap-3 py-2.5">
                  <span className={cn("grid h-8 w-8 flex-none place-items-center rounded-lg", r.on ? "bg-pmgreen-soft text-[#067647]" : "bg-canvas text-faint")}>
                    <Icon name={r.icon} size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[12.5px] font-bold", r.on ? "text-ink" : "text-faint")}>{r.label}</span>
                    <span className={cn("block text-[11px] font-semibold", r.on ? "text-muted" : "text-faint/70")}>{r.state}</span>
                  </span>
                  {r.on ? <Badge tone="success">Live</Badge> : <Badge tone="muted">Off</Badge>}
                </li>
              ))}
            </ul>
            <button
              onClick={() => openModal({ type: "alerts" })}
              className="focus-ring mt-3 flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-line py-2.5 text-[12px] font-bold text-muted transition hover:border-pmgreen/50 hover:bg-pmgreen-soft/40 hover:text-[#067647]"
            >
              <Icon name="sliders" size={13} /> Edit rules & threshold
            </button>
          </div>
        </Reveal>

        {/* Channels */}
        <Reveal delay={80} className="lg:col-span-2">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Delivery channels</p>
            <ul className="space-y-2">
              {channels.map((c) => (
                <li key={c.name} className={cn("flex items-center gap-3 rounded-xl border p-3 transition", c.on ? "border-pmgreen/40 bg-pmgreen-soft/40" : "border-line bg-canvas/50")}>
                  <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", c.on ? "bg-white text-[#067647] shadow-sm" : "bg-white text-faint")}>
                    <Icon name={c.icon} size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[12.5px] font-bold", c.on ? "text-ink" : "text-faint")}>{c.name}</span>
                    <span className="block truncate text-[10.5px] font-semibold text-faint">{c.detail}</span>
                  </span>
                  {c.on ? (
                    <span className="flex items-center gap-1 text-[10.5px] font-bold text-[#067647]"><span className="live-dot" />ON</span>
                  ) : (
                    <Badge tone="muted">Off</Badge>
                  )}
                </li>
              ))}
            </ul>
            {channels.filter((c) => c.on).length === 0 && (
              <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-danger-soft px-3 py-2 text-[11.5px] font-bold leading-snug text-[#b42318]">
                <Icon name="alertTri" size={13} className="mt-0.5 flex-none" /> No delivery channels — alerts are firing into the void. Enable at least one.
              </p>
            )}
            <div className="mt-3 rounded-xl bg-canvas/70 p-3">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-faint">Quiet hours</p>
              <p className="mt-0.5 text-[12px] font-bold text-ink">22:00 – 06:30 EAT · fraud alerts always break through</p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Notification log */}
      <Reveal delay={120}>
        <div className="mt-3 rounded-2xl border border-line bg-white p-4 shadow-pm">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="font-display mr-auto text-[13.5px] font-bold text-ink">
              Notification log {unread > 0 && <Badge tone="danger" className="ml-1">{unread} unread</Badge>}
            </p>
            {["all", "push", "sms", "email", "system"].map((c) => (
              <Chip key={c} on={chanFilter === c} onClick={() => setChanFilter(c)}>
                {c === "all" ? "All" : c === "push" ? "Push" : c.toUpperCase()}
              </Chip>
            ))}
            <button onClick={markAllRead} className="ml-1 text-[11.5px] font-bold text-pmgreen-dark transition hover:text-pmgreen">
              Mark all read
            </button>
          </div>
          {notifFiltered.length === 0 ? (
            <Empty icon="bell" title={`No ${chanFilter} notifications`} sub="Alerts you receive will appear here with full context." />
          ) : (
            <ul className="divide-y divide-line/70">
              {notifFiltered.slice(0, 6).map((n) => (
                <li key={n.id} className={cn("flex items-start gap-3 py-3", !n.read && "rounded-lg bg-pmgreen-soft/25 px-2 -mx-2")}>
                  <span className={cn("mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-[10px]", chanTone[n.channel])}>
                    <Icon name={chanIcon[n.channel]} size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-ink">
                      {n.title}
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-pmgreen" />}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{n.body}</p>
                  </div>
                  <span className="flex-none pt-0.5 text-[10.5px] font-bold text-faint">{n.time}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 04 · Transactions ============ */

const TXN_FILTERS: ("all" | TxnStatus | "flagged")[] = ["all", "Cleared", "Pending", "Declined", "Disputed", "flagged"];

export function TransactionsSection() {
  const { txns, cards, openModal, toast } = useApp();
  const [filter, setFilter] = useState<(typeof TXN_FILTERS)[number]>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const onSearch = (e: Event) => setQ((e as CustomEvent).detail as string);
    window.addEventListener("pm-txn-search", onSearch);
    return () => window.removeEventListener("pm-txn-search", onSearch);
  }, []);

  const cardName = (id: string) => {
    const c = cards.find((x) => x.id === id);
    return c ? `${c.nickname} •• ${c.last4}` : "—";
  };

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    return txns.filter((t) => {
      if (filter === "flagged" && !t.flagged) return false;
      if (filter !== "all" && filter !== "flagged" && t.status !== filter) return false;
      if (query && !(t.merchant + t.category + cardName(t.cardId)).toLowerCase().includes(query)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txns, filter, q, cards]);

  const clearedVol = shown.filter((t) => t.status === "Cleared").reduce((s, t) => s + t.amount, 0);

  const toneFor = (s: TxnStatus): "success" | "warning" | "danger" | "violet" =>
    s === "Cleared" ? "success" : s === "Pending" ? "warning" : s === "Declined" ? "danger" : "violet";
  const chanIcon = (c: string): IconName => (c === "Online" ? "globe" : c === "ATM" ? "wallet" : c === "Wallet" ? "phone" : "card");

  const exportCsv = () => {
    toast("success", "Transactions exported", `${shown.length} rows written to transactions-jun.csv`);
  };

  return (
    <section id="transactions" className="scroll-mt-24">
      <SectionHead
        no="04"
        title="Transaction Feed"
        sub="Live authorisations across every card. Dispute anything suspicious within 120 days."
      >
        <div className="relative">
          <Icon name="search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by merchant…"
            className="focus-ring w-[190px] rounded-[10px] border border-line bg-white py-2 pl-9 pr-3 text-[12.5px] font-semibold outline-none transition placeholder:font-medium placeholder:text-faint focus:border-pmgreen/50"
          />
        </div>
        <Btn size="sm" variant="outline" icon="download" onClick={exportCsv}>Export</Btn>
      </SectionHead>

      <div className="thin-scroll mb-4 flex gap-2 overflow-x-auto pb-1">
        {TXN_FILTERS.map((f) => {
          const count = f === "all" ? txns.length : f === "flagged" ? txns.filter((t) => t.flagged).length : txns.filter((t) => t.status === f).length;
          return (
            <Chip key={f} on={filter === f} onClick={() => setFilter(f)} count={count}>
              {f === "all" ? "All" : f === "flagged" ? "Flagged" : f}
            </Chip>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <Empty
          icon="search"
          title="No matching transactions"
          sub={q ? `Nothing found for “${q}”. Try another merchant or clear the filter.` : "No transactions with this status right now."}
          action={
            <Btn size="sm" variant="outline" onClick={() => { setQ(""); setFilter("all"); }}>Clear filters</Btn>
          }
        />
      ) : (
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-canvas/70 text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint">
                    <th className="px-4 py-2.5">Merchant</th>
                    <th className="px-3 py-2.5">Card</th>
                    <th className="px-3 py-2.5">Channel</th>
                    <th className="px-3 py-2.5 text-right">Amount</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {shown.map((t) => (
                    <tr key={t.id} className="group text-[12.5px] transition hover:bg-pmgreen-soft/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-canvas text-muted"><Icon name={chanIcon(t.channel)} size={14} /></span>
                          <div className="leading-tight">
                            <p className="flex items-center gap-1.5 font-bold text-ink">
                              {t.merchant}
                              {t.intl && <Badge tone="info">INTL</Badge>}
                              {t.flagged && <Badge tone="danger" dot>FLAG</Badge>}
                            </p>
                            <p className="text-[10.5px] font-semibold text-faint">{t.category} · {t.date} · {t.time}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-semibold text-muted">{cardName(t.cardId)}</td>
                      <td className="px-3 py-3 font-semibold text-muted">{t.channel}</td>
                      <td className="num px-3 py-3 text-right font-display font-bold text-ink">{kes(t.amount)}</td>
                      <td className="px-3 py-3"><Badge tone={toneFor(t.status)} dot>{t.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                          {t.status === "Cleared" && (
                            <Btn size="sm" variant="outline" icon="flag" onClick={() => openModal({ type: "dispute", txnId: t.id })}>Dispute</Btn>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-line/70 md:hidden">
              {shown.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-canvas text-muted"><Icon name={chanIcon(t.channel)} size={15} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-bold text-ink">
                      {t.merchant}
                      {t.intl && <Badge tone="info">INTL</Badge>}
                    </p>
                    <p className="text-[10.5px] font-semibold text-faint">{cardName(t.cardId)} · {t.date}</p>
                    <div className="mt-1"><Badge tone={toneFor(t.status)} dot>{t.status}</Badge></div>
                  </div>
                  <div className="text-right">
                    <p className="num font-display text-[13.5px] font-bold text-ink">−{kes(t.amount)}</p>
                    {t.status === "Cleared" && (
                      <button onClick={() => openModal({ type: "dispute", txnId: t.id })} className="mt-1 text-[11px] font-bold text-pmgreen-dark">
                        Dispute
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-canvas/60 px-4 py-2.5">
              <p className="text-[11.5px] font-bold text-muted">{shown.length} transaction{shown.length === 1 ? "" : "s"} in view</p>
              <p className="num text-[11.5px] font-bold text-muted">Cleared volume · <span className="font-display text-[13px] text-ink">{kes(clearedVol)}</span></p>
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );
}
