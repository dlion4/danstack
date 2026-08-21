/* ============================================================================
 * Card Dashboard — page 5.1 sections B (Bootstrap 5 edition)
 * ----------------------------------------------------------------------------
 * 03 · Alerts & Notifications and 04 · Transaction Feed. Behavior and copy
 * identical to the Tailwind original; markup uses Bootstrap utilities +
 * scoped .pmc-* classes.
 * ========================================================================== */

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
    push: "pmc-tone-green",
    sms: "pmc-tone-blue",
    email: "pmc-tone-violet",
    system: "pmc-tone-warn",
  };

  return (
    <section id="alerts" className="pmc-scroll-mt">
      <SectionHead
        no="03"
        title="Alerts & Notifications"
        sub={`Real-time rules for ${scopeLabel.toLowerCase()}. Changes apply to the very next transaction.`}
      >
        <Btn size="sm" icon="sliders" onClick={() => openModal({ type: "alerts" })}>Configure Alerts</Btn>
      </SectionHead>

      <div className="row pmc-g-3">
        {/* Rules summary */}
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-card p-4 h-100">
            <div className="pmc-mb-3 d-flex align-items-center justify-content-between">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Active alert rules</p>
              <Badge tone={rules.some((r) => r.on) ? "success" : "danger"} dot>
                {rules.filter((r) => r.on).length} of {rules.length} on
              </Badge>
            </div>
            <ul className="pmc-divided">
              {rules.map((r) => (
                <li key={r.label} className="d-flex align-items-center pmc-gap-3 pmc-py-25">
                  <span className={cn("pmc-icon-sq-sm d-grid", r.on ? "pmc-tone-green" : "pmc-tone-muted", !r.on && "pmc-faint")}>
                    <Icon name={r.icon} size={15} />
                  </span>
                  <span className="flex-grow-1" style={{ minWidth: 0 }}>
                    <span className={cn("d-block pmc-fs-125 fw-bold", r.on ? "pmc-ink" : "pmc-faint")}>{r.label}</span>
                    <span className={cn("d-block pmc-fs-11 fw-semibold", r.on ? "pmc-muted" : "pmc-faint")} style={!r.on ? { opacity: 0.7 } : undefined}>{r.state}</span>
                  </span>
                  {r.on ? <Badge tone="success">Live</Badge> : <Badge tone="muted">Off</Badge>}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => openModal({ type: "alerts" })}
              className="pmc-focus pmc-mt-3 d-flex w-100 align-items-center justify-content-center pmc-gap-15 pmc-radius-sm pmc-py-25 pmc-fs-12 fw-bold pmc-muted"
              style={{ border: "1px dashed var(--pmc-line)", background: "none", transition: "all 0.15s ease" }}
            >
              <Icon name="sliders" size={13} /> Edit rules & threshold
            </button>
          </div>
        </Reveal>

        {/* Channels */}
        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="pmc-card p-4 h-100">
            <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Delivery channels</p>
            <ul className="d-flex flex-column pmc-gap-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {channels.map((c) => (
                <li
                  key={c.name}
                  className="d-flex align-items-center pmc-gap-3 pmc-radius p-3"
                  style={c.on ? { border: "1px solid rgba(18,183,106,0.4)", background: "rgba(231,248,239,0.4)" } : { border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}
                >
                  <span className={cn("pmc-icon-sq d-grid", c.on ? "pmc-green-ink" : "pmc-faint")} style={{ background: "#fff", boxShadow: c.on ? "0 1px 2px rgba(16,24,40,0.06)" : undefined }}>
                    <Icon name={c.icon} size={16} />
                  </span>
                  <span className="flex-grow-1" style={{ minWidth: 0 }}>
                    <span className={cn("d-block pmc-fs-125 fw-bold", c.on ? "pmc-ink" : "pmc-faint")}>{c.name}</span>
                    <span className="d-block pmc-truncate pmc-fs-105 fw-semibold pmc-faint">{c.detail}</span>
                  </span>
                  {c.on ? (
                    <span className="d-flex align-items-center pmc-gap-1 pmc-fs-105 fw-bold pmc-green-ink"><span className="pmc-live-dot" />ON</span>
                  ) : (
                    <Badge tone="muted">Off</Badge>
                  )}
                </li>
              ))}
            </ul>
            {channels.filter((c) => c.on).length === 0 && (
              <p className="pmc-mt-3 d-flex align-items-start pmc-gap-15 rounded-2 pmc-px-3 pmc-py-2 pmc-fs-115 fw-bold lh-sm pmc-danger-ink mb-0" style={{ background: "var(--pmc-danger-soft)" }}>
                <Icon name="alertTri" size={13} className="pmc-mt-05 flex-none" /> No delivery channels — alerts are firing into the void. Enable at least one.
              </p>
            )}
            <div className="pmc-mt-3 pmc-radius p-3" style={{ background: "rgba(242,244,248,0.7)" }}>
              <p className="pmc-fs-105 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.1em" }}>Quiet hours</p>
              <p className="pmc-mt-05 pmc-fs-12 fw-bold pmc-ink mb-0">22:00 – 06:30 EAT · fraud alerts always break through</p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Notification log */}
      <Reveal delay={120}>
        <div className="pmc-card pmc-mt-3 p-4">
          <div className="pmc-mb-3 d-flex flex-wrap align-items-center pmc-gap-2">
            <p className="pmc-display pmc-fs-135 fw-bold pmc-ink me-auto mb-0">
              Notification log {unread > 0 && <Badge tone="danger" className="ms-1">{unread} unread</Badge>}
            </p>
            {["all", "push", "sms", "email", "system"].map((c) => (
              <Chip key={c} on={chanFilter === c} onClick={() => setChanFilter(c)}>
                {c === "all" ? "All" : c === "push" ? "Push" : c.toUpperCase()}
              </Chip>
            ))}
            <button type="button" onClick={markAllRead} className="ms-1 pmc-fs-115 fw-bold pmc-green-dark pmc-focus" style={{ background: "none", border: "none", padding: 0 }}>
              Mark all read
            </button>
          </div>
          {notifFiltered.length === 0 ? (
            <Empty icon="bell" title={`No ${chanFilter} notifications`} sub="Alerts you receive will appear here with full context." />
          ) : (
            <ul className="pmc-divided">
              {notifFiltered.slice(0, 6).map((n) => (
                <li
                  key={n.id}
                  className={cn("d-flex align-items-start pmc-gap-3 pmc-py-3", !n.read && "pmc-radius-xs pmc-px-2")}
                  style={!n.read ? { background: "rgba(231,248,239,0.25)", marginLeft: -8, marginRight: -8 } : undefined}
                >
                  <span className={cn("pmc-mt-05 pmc-icon-sq d-grid", chanTone[n.channel])}>
                    <Icon name={chanIcon[n.channel]} size={15} />
                  </span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="d-flex flex-wrap align-items-center pmc-gap-2 pmc-fs-13 fw-bold pmc-ink mb-0">
                      {n.title}
                      {!n.read && <span className="d-inline-block rounded-circle" style={{ width: 6, height: 6, background: "var(--pmc-green)" }} />}
                    </p>
                    <p className="pmc-mt-05 pmc-fs-12 pmc-muted mb-0" style={{ lineHeight: 1.65 }}>{n.body}</p>
                  </div>
                  <span className="flex-none pmc-pt-05 pmc-fs-105 fw-bold pmc-faint">{n.time}</span>
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
    <section id="transactions" className="pmc-scroll-mt">
      <SectionHead
        no="04"
        title="Transaction Feed"
        sub="Live authorisations across every card. Dispute anything suspicious within 120 days."
      >
        <div className="position-relative">
          <Icon name="search" size={14} className="position-absolute pmc-faint" style={{ left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by merchant…"
            className="pmc-focus pmc-radius-sm pmc-fs-125 fw-semibold pmc-ink"
            style={{ width: 190, border: "1px solid var(--pmc-line)", background: "#fff", padding: "8px 12px 8px 36px", outline: "none" }}
          />
        </div>
        <Btn size="sm" variant="outline" icon="download" onClick={exportCsv}>Export</Btn>
      </SectionHead>

      <div className="pmc-thin-scroll pmc-mb-4 d-flex pmc-gap-2 overflow-auto pb-1">
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
          <div className="pmc-table-frame">
            {/* Desktop table */}
            <div className="table-responsive d-none d-md-block">
              <table className="table pmc-table w-100 text-start align-middle">
                <thead>
                  <tr>
                    <th scope="col">Merchant</th>
                    <th scope="col">Card</th>
                    <th scope="col">Channel</th>
                    <th scope="col" className="text-end">Amount</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <div className="d-flex align-items-center pmc-gap-25">
                          <span className="pmc-icon-sq-sm d-grid pmc-tone-muted"><Icon name={chanIcon(t.channel)} size={14} /></span>
                          <div className="lh-sm">
                            <p className="d-flex align-items-center pmc-gap-15 fw-bold pmc-ink mb-0">
                              {t.merchant}
                              {t.intl && <Badge tone="info">INTL</Badge>}
                              {t.flagged && <Badge tone="danger" dot>FLAG</Badge>}
                            </p>
                            <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{t.category} · {t.date} · {t.time}</p>
                          </div>
                        </div>
                      </td>
                      <td className="fw-semibold pmc-muted">{cardName(t.cardId)}</td>
                      <td className="fw-semibold pmc-muted">{t.channel}</td>
                      <td className="pmc-num text-end pmc-display fw-bold pmc-ink">{kes(t.amount)}</td>
                      <td><Badge tone={toneFor(t.status)} dot>{t.status}</Badge></td>
                      <td>
                        <div className="d-flex justify-content-end pmc-gap-15 pmc-row-actions">
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
            <ul className="pmc-mobile-list d-md-none">
              {shown.map((t) => (
                <li key={t.id}>
                  <span className="pmc-icon-sq d-grid pmc-tone-muted"><Icon name={chanIcon(t.channel)} size={15} /></span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="d-flex flex-wrap align-items-center pmc-gap-15 pmc-fs-13 fw-bold pmc-ink mb-0">
                      {t.merchant}
                      {t.intl && <Badge tone="info">INTL</Badge>}
                    </p>
                    <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{cardName(t.cardId)} · {t.date}</p>
                    <div className="pmc-mt-1"><Badge tone={toneFor(t.status)} dot>{t.status}</Badge></div>
                  </div>
                  <div className="text-end">
                    <p className="pmc-num pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">−{kes(t.amount)}</p>
                    {t.status === "Cleared" && (
                      <button type="button" onClick={() => openModal({ type: "dispute", txnId: t.id })} className="pmc-mt-1 pmc-fs-11 fw-bold pmc-green-dark pmc-focus" style={{ background: "none", border: "none", padding: 0 }}>
                        Dispute
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <div className="pmc-table-footer">
              <p className="mb-0">{shown.length} transaction{shown.length === 1 ? "" : "s"} in view</p>
              <p className="mb-0">Cleared volume · <span className="pmc-display pmc-fs-13 pmc-ink">{kes(clearedVol)}</span></p>
            </div>
          </div>
        </Reveal>
      )}
    </section>
  );
}
