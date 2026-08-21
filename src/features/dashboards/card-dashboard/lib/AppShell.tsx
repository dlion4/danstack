/* ============================================================================
 * Card Dashboard — App shell (Bootstrap 5 edition)
 * ----------------------------------------------------------------------------
 * Mirrors the business-dashboard shell structure: sticky `.pmc-sidebar` at
 * >=lg, offcanvas navigation below lg, sticky `.pmc-topbar`, fixed
 * `.pmc-quickbar`. Behavior (search, notifications, account menu, scroll-spy,
 * custom events, keyboard entry points) is preserved exactly from Shell.tsx.
 * ========================================================================== */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { Icon, Logo, type IconName } from "../icons";
import { Drawer } from "../ui";
import { useApp, scrollToId } from "../store";
import { MODULES } from "../data";
import { navForPage, PAGE_LABELS, type NavItem } from "./navigation";
import type { CardsPageId } from "./routes";

/* ================= Sidebar ================= */

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [active, setActive] = useState("overview");
  const { openModal, openDrawer, page, setPage } = useApp();

  const NAV_MAIN: NavItem[] = navForPage(page);

  useEffect(() => {
    const ids = [...NAV_MAIN.map((n) => n.anchor)];
    const onScroll = () => {
      let current = NAV_MAIN[0]?.anchor ?? "overview";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [page]);

  const go = (anchor: string, filter?: string) => {
    scrollToId(anchor);
    if (filter) window.dispatchEvent(new CustomEvent("pm-card-filter", { detail: filter }));
    onNavigate?.();
  };

  const goPage = (p: CardsPageId, anchor?: string, filter?: string) => {
    setPage(p);
    onNavigate?.();
    if (anchor) window.setTimeout(() => scrollToId(anchor), 120);
    if (filter) window.setTimeout(() => window.dispatchEvent(new CustomEvent("pm-card-filter", { detail: filter })), 120);
  };

  return (
    <div className="d-flex flex-column h-100 w-100">
      {/* Brand */}
      <div className="pmc-brand">
        <Logo size={32} />
        <div style={{ lineHeight: 1.2 }}>
          <p className="pmc-display mb-0 pmc-brand-text" style={{ fontSize: 15, fontWeight: 700, color: "var(--pmc-ink)" }}>PayMo</p>
          <p className="mb-0 pmc-brand-sub" style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pmc-muted)" }}>BAAS · Cards</p>
        </div>
      </div>

      <nav className="pmc-nav-wrap pmc-dark-scroll">
        <p className="pmc-nav-group">Card Center</p>
        <ul className="pmc-nav-list">
          {NAV_MAIN.map((n) => {
            const isOn = active === n.anchor;
            return (
              <li key={n.id}>
                <button type="button" onClick={() => go(n.anchor)} className={cn("pmc-nav-item pmc-focus", isOn && "active")}>
                  <span className="pmc-nav-rail" />
                  <Icon name={n.icon} size={16} className="pmc-nav-icon flex-shrink-0" />
                  <span className="flex-grow-1 pmc-nav-label">{n.label}</span>
                  {n.badge && <span className="pmc-nav-badge">{n.badge}</span>}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="pmc-nav-group">Card Modules</p>
        <ul className="pmc-nav-list">
          {MODULES.map((m) => {
            const pageFor = m.id === "5.2" ? "5.2" as const : m.id === "5.3" ? "5.3" as const : m.id === "5.4" ? "5.4" as const : m.id === "5.5" ? "5.5" as const : m.id === "5.6" ? "5.6" as const : m.id === "5.7" ? "5.7" as const : m.id === "5.8" ? "5.8" as const : m.id === "5.9" ? "5.9" as const : m.id === "5.10" ? "5.10" as const : "5.1" as const;
            const primaryPage = ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "5.9", "5.10"].includes(m.id);
            const isOn = page === pageFor && (primaryPage || active === m.anchor);
            const iconName = (m.icon || "sliders") as any;
            return (
              <li key={m.id} title={m.hint}>
                <button type="button" onClick={() => goPage(pageFor, m.anchor, m.filter)} className={cn("pmc-nav-item pmc-module-item pmc-focus", isOn && "active")}>
                  <Icon name={iconName} size={15} className="pmc-nav-icon flex-shrink-0" />
                  <span className="flex-grow-1 pmc-truncate pmc-module-label">{m.name}</span>
                  {isOn && <span className="pmc-live-dot" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Switch Account */}
      <div className="pmc-side-footer">
        <a href="/auth/hub" className="pmc-switch-acct-btn pmc-focus">
          <Icon name="arrowRight" size={15} />
          <span className="pmc-switch-acct-label">Switch Account</span>
        </a>
        <button type="button" onClick={() => openDrawer({ type: "support" })} className="pmc-support-btn pmc-focus">
          <span className="pmc-icon-sq-sm d-grid" style={{ background: "var(--pmc-blue-soft)", color: "var(--pmc-blue)" }}>
            <Icon name="headset" size={15} />
          </span>
          <span className="pmc-support-text flex-grow-1" style={{ lineHeight: 1.2 }}>
            <span className="d-block" style={{ fontSize: 12, fontWeight: 700, color: "var(--pmc-ink)" }}>Card Support</span>
            <span className="d-block" style={{ fontSize: 10.5, color: "var(--pmc-muted)" }}>24/7 · avg reply 3 min</span>
          </span>
          <Icon name="arrowRight" size={14} style={{ color: "var(--pmc-muted)" }} />
        </button>
        <button type="button" onClick={() => openModal({ type: "shortcuts" })} className="pmc-shortcut-link pmc-focus">
          <Icon name="zap" size={12} /> <span className="pmc-shortcut-label">Keyboard shortcuts</span>
        </button>
      </div>
    </div>
  );
}

/* ================= Topbar ================= */

function SearchBox() {
  const { cards, txns, openDrawer } = useApp();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setFocus(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const query = q.trim().toLowerCase();
  const cardHits = query ? cards.filter((c) => (c.nickname + c.holder + c.last4 + c.tier).toLowerCase().includes(query)).slice(0, 4) : [];
  const txnHits = query ? txns.filter((t) => (t.merchant + t.category).toLowerCase().includes(query)).slice(0, 4) : [];
  const sectionHits = query
    ? MODULES.filter((m) => m.name.toLowerCase().includes(query) || m.hint.toLowerCase().includes(query)).slice(0, 3)
    : [];
  const showPanel = focus && query.length > 0;

  return (
    <div ref={boxRef} className="pmc-search-box pmc-dd d-none d-md-block">
      <Icon name="search" size={15} className="pmc-faint" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 2 }} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocus(true)}
        placeholder="Search cards, merchants, modules…"
        className="pmc-search-input"
      />
      <kbd className="pmc-search-kbd">/</kbd>
      {showPanel && (
        <div className="pmc-dd-menu pmc-search-panel">
          {cardHits.length + txnHits.length + sectionHits.length === 0 ? (
            <p className="pmc-muted text-center mb-0" style={{ padding: "20px 16px", fontSize: 12.5 }}>No matches for “{q}”.</p>
          ) : (
            <div className="pmc-thin-scroll" style={{ maxHeight: 340, overflowY: "auto", padding: 6 }}>
              {cardHits.length > 0 && <p className="pmc-kicker pmc-faint" style={{ padding: "6px 10px 4px" }}>Cards</p>}
              {cardHits.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    openDrawer({ type: "card", cardId: c.id });
                    setQ("");
                    setFocus(false);
                  }}
                  className="pmc-dd-item"
                >
                  <span className="pmc-icon-sq-sm d-grid pmc-tone-green"><Icon name="card" size={14} /></span>
                  <span className="flex-grow-1" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--pmc-ink)" }}>{c.nickname}</span>
                  <span className="pmc-faint" style={{ fontSize: 11, fontWeight: 600 }}>•• {c.last4}</span>
                </button>
              ))}
              {txnHits.length > 0 && <p className="pmc-kicker pmc-faint" style={{ padding: "8px 10px 4px" }}>Transactions</p>}
              {txnHits.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    scrollToId("transactions");
                    window.dispatchEvent(new CustomEvent("pm-txn-search", { detail: t.merchant }));
                    setQ("");
                    setFocus(false);
                  }}
                  className="pmc-dd-item"
                >
                  <span className="pmc-icon-sq-sm d-grid pmc-tone-blue"><Icon name="wallet" size={14} /></span>
                  <span className="flex-grow-1" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--pmc-ink)" }}>{t.merchant}</span>
                  <span className="pmc-num pmc-muted" style={{ fontSize: 11, fontWeight: 700 }}>KES {t.amount.toLocaleString()}</span>
                </button>
              ))}
              {sectionHits.length > 0 && <p className="pmc-kicker pmc-faint" style={{ padding: "8px 10px 4px" }}>Modules</p>}
              {sectionHits.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    scrollToId(m.anchor);
                    if (m.filter) window.dispatchEvent(new CustomEvent("pm-card-filter", { detail: m.filter }));
                    setQ("");
                    setFocus(false);
                  }}
                  className="pmc-dd-item"
                >
                  <span className="pmc-module-id" style={{ background: "var(--pmc-ink)", color: "#fff" }}>{m.id}</span>
                  <span className="flex-grow-1" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--pmc-ink)" }}>{m.name}</span>
                  <Icon name="arrowRight" size={13} className="pmc-faint" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotifBell() {
  const { notifs, unread, markAllRead, markRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const chanIcon: Record<string, IconName> = { push: "phone", sms: "sms", email: "mail", system: "shield" };
  const chanTone: Record<string, string> = {
    push: "pmc-tone-green",
    sms: "pmc-tone-blue",
    email: "pmc-tone-violet",
    system: "pmc-tone-warn",
  };

  return (
    <div ref={ref} className="pmc-dd">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications, ${unread} unread`}
        className="pmc-icon-btn pmc-focus"
      >
        <Icon name="bell" size={16} />
        {unread > 0 && <span className="pmc-count-dot">{unread}</span>}
      </button>
      {open && (
        <div className="pmc-dd-menu" style={{ width: "min(370px, calc(100vw - 2rem))" }}>
          <div className="pmc-dd-head">
            <p className="pmc-display mb-0" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--pmc-ink)" }}>Notifications</p>
            <button type="button" onClick={markAllRead} className="pmc-green-dark pmc-focus" style={{ border: 0, background: "transparent", fontSize: 11.5, fontWeight: 700 }}>
              Mark all read
            </button>
          </div>
          <div className="pmc-thin-scroll" style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifs.slice(0, 7).map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => markRead(n.id)}
                className="d-flex w-100 text-start pmc-gap-3 px-3 py-3 pmc-focus"
                style={{ border: 0, borderBottom: "1px solid rgba(230,233,240,0.7)", background: n.read ? "transparent" : "rgba(231,248,239,0.3)", transition: "background 0.12s ease" }}
              >
                <span className={cn("pmc-icon-sq-sm d-grid mt-1", chanTone[n.channel])}>
                  <Icon name={chanIcon[n.channel]} size={14} />
                </span>
                <span className="flex-grow-1" style={{ minWidth: 0 }}>
                  <span className="d-flex align-items-center pmc-gap-2">
                    <span className="pmc-truncate" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--pmc-ink)" }}>{n.title}</span>
                    {!n.read && <span style={{ width: 6, height: 6, flex: "none", borderRadius: 99, background: "var(--pmc-green)" }} />}
                  </span>
                  <span className="d-block pmc-muted" style={{ marginTop: 2, fontSize: 11.5, lineHeight: 1.55 }}>{n.body}</span>
                  <span className="d-block pmc-faint" style={{ marginTop: 4, fontSize: 10.5, fontWeight: 600 }}>{n.time} · via {n.channel === "push" ? "App Push" : n.channel.toUpperCase()}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AvatarMenu() {
  const { openDrawer, openModal, toast } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const Item = ({ icon, children, onClick }: { icon: IconName; children: ReactNode; onClick: () => void }) => (
    <button
      type="button"
      onClick={() => {
        setOpen(false);
        onClick();
      }}
      className="pmc-dd-item pmc-focus"
    >
      <Icon name={icon} size={15} className="pmc-muted" />
      {children}
    </button>
  );

  return (
    <div ref={ref} className="pmc-dd">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className="pmc-focus d-flex align-items-center pmc-gap-2"
        style={{ border: "1px solid var(--pmc-line)", background: "#fff", borderRadius: 10, padding: "4px 10px 4px 4px", transition: "border-color 0.15s ease" }}
      >
        <span className="pmc-avatar">DA</span>
        <span className="d-none d-lg-block text-start" style={{ lineHeight: 1.2 }}>
          <span className="d-block" style={{ fontSize: 12, fontWeight: 700, color: "var(--pmc-ink)" }}>David A.</span>
          <span className="d-block pmc-faint" style={{ fontSize: 10, fontWeight: 600 }}>BAAS Admin</span>
        </span>
        <Icon name="chevDown" size={13} className="pmc-faint" />
      </button>
      {open && (
        <div className="pmc-dd-menu" style={{ width: 230, padding: 6 }}>
          <div style={{ borderBottom: "1px solid var(--pmc-line)", padding: "4px 10px 8px" }}>
            <p className="mb-0" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--pmc-ink)" }}>David Achieng</p>
            <p className="mb-0 pmc-muted" style={{ fontSize: 11 }}>david@acmetraders.co.ke</p>
          </div>
          <div style={{ paddingTop: 6 }}>
            <Item icon="sliders" onClick={() => scrollToId("settings")}>Card settings</Item>
            <Item icon="zap" onClick={() => openModal({ type: "shortcuts" })}>Keyboard shortcuts</Item>
            <Item icon="headset" onClick={() => openDrawer({ type: "support" })}>Support</Item>
            <Item icon="logout" onClick={() => toast("info", "Signed out of demo session", "This preview keeps you signed in.")}>Sign out</Item>
          </div>
        </div>
      )}
    </div>
  );
}

export function Topbar() {
  const { syncing, sync, lastSync, page } = useApp();
  const labels = PAGE_LABELS[page] ?? PAGE_LABELS["5.1"];
  return (
    <header className="pmc-topbar">
      <div className="pmc-topbar-inner">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("pm-open-nav"))}
          aria-label="Open navigation"
          className="pmc-icon-btn pmc-focus d-lg-none"
        >
          <Icon name="menu" size={17} />
        </button>
        <div className="pmc-crumb d-none d-sm-flex">
          <span>BAAS</span>
          <Icon name="chevRight" size={12} />
          <span>Cards</span>
          <Icon name="chevRight" size={12} />
          <span className="pmc-crumb-current">{labels.long}</span>
        </div>
        <p className="pmc-display d-flex d-sm-none mb-0" style={{ fontSize: 14, fontWeight: 700, color: "var(--pmc-ink)" }}>{labels.short}</p>

        <div className="ms-auto d-flex align-items-center pmc-gap-25">
          <SearchBox />
          <button
            type="button"
            onClick={sync}
            className="pmc-focus d-none d-lg-flex align-items-center pmc-gap-2"
            title="Sync portfolio"
            style={{ borderRadius: 10, border: "1px solid var(--pmc-line)", background: "#fff", padding: "8px 12px", fontSize: 11.5, fontWeight: 700, color: "var(--pmc-muted)", transition: "border-color 0.15s ease, color 0.15s ease" }}
          >
            <Icon name="refresh" size={13} className={cn(syncing && "pmc-spin")} />
            <span className="d-none d-xl-inline">{syncing ? "Syncing…" : `Synced ${lastSync}`}</span>
            <span className={cn("pmc-live-dot", syncing && "amber")} />
          </button>
          <NotifBell />
          <AvatarMenu />
        </div>
      </div>
    </header>
  );
}

/* ================= Quick actions bar ================= */

export function QuickBar() {
  const { openModal, toast, page } = useApp();
  const [exporting, setExporting] = useState(false);

  const exportReport = () => {
    if (exporting) return;
    setExporting(true);
    toast("info", "Compiling report…", page === "5.5" ? "Prepaid balances & loads report being generated." : page === "5.4" ? "Credit line & statement report being generated." : page === "5.2" ? "Physical card report being generated." : page === "5.3" ? "Virtual card controls report being generated." : "Monthly Portfolio Summary (June) is being generated.");
    window.setTimeout(() => {
      setExporting(false);
      toast("success", "Report ready", page === "5.5" ? "Prepaid report downloaded." : page === "5.4" ? "Credit report downloaded." : page === "5.2" ? "Physical card report downloaded." : page === "5.3" ? "Virtual card controls report downloaded." : "Monthly Portfolio Summary (June) downloaded as CSV.");
    }, 1600);
  };

  const Action = ({ icon, label, onClick, tone = "light", spin }: { icon: IconName; label: string; onClick: () => void; tone?: "primary" | "light" | "danger"; spin?: boolean }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn("pmc-qbtn pmc-focus", tone === "primary" && "pmc-qbtn-primary", tone === "danger" && "pmc-qbtn-danger")}
    >
      <Icon name={icon} size={15} className={cn(spin && "pmc-spin")} />
      <span className="d-none d-sm-inline">{label}</span>
    </button>
  );

  return (
    <div className="pmc-quickbar">
      <div className="pmc-quickbar-inner pmc-thin-scroll">
        <Action
          icon="plus"
          label={page === "5.10" ? "Card Defaults" : page === "5.9" ? "Run Health Check" : page === "5.8" ? "Build Report" : page === "5.7" ? "Report Compromise" : page === "5.6" ? "Issue Employee Card" : page === "5.5" ? "Issue Prepaid" : page === "5.4" ? "Issue Credit Card" : page === "5.3" ? "Create Virtual" : "Issue Card"}
          tone={page === "5.7" ? "danger" : "primary"}
          onClick={() => openModal(page === "5.10" ? { type: "settingsDefaults" } : page === "5.9" ? { type: "adminHealth" } : page === "5.8" ? { type: "reportBuilder" } : page === "5.7" ? { type: "fraudWizard" } : page === "5.6" ? { type: "inviteEmployee" } : page === "5.5" ? { type: "prepaidIssue" } : page === "5.4" ? { type: "creditIssue" } : page === "5.3" ? { type: "virtualIssue" } : { type: "issue" })}
        />
        {page === "5.2" ? (
          <Action icon="card" label="Track Orders" onClick={() => scrollToId("orders")} />
        ) : page === "5.3" ? (
          <Action icon="shield" label="Security Rules" onClick={() => scrollToId("guardrails")} />
        ) : page === "5.4" ? (
          <Action icon="wallet" label="Repay Credit" onClick={() => openModal({ type: "repay" })} />
        ) : page === "5.5" ? (
          <Action icon="wallet" label="Top Up" onClick={() => openModal({ type: "topup" })} />
        ) : page === "5.6" ? (
          <Action icon="wallet" label="Billing Setup" onClick={() => openModal({ type: "billing" })} />
        ) : page === "5.7" ? (
          <Action icon="shield" label="Safeguards" onClick={() => scrollToId("safeguards")} />
        ) : page === "5.8" ? (
          <Action icon="chart" label="Revenue Trends" onClick={() => scrollToId("revenue")} />
        ) : page === "5.9" ? (
          <Action icon="key" label="API Keys" onClick={() => scrollToId("integrations")} />
        ) : page === "5.10" ? (
          <Action icon="headset" label="Get Support" onClick={() => scrollToId("support")} />
        ) : (
          <Action icon="bell" label="Configure Alerts" onClick={() => openModal({ type: "alerts" })} />
        )}
        <Action icon="download" label={exporting ? "Compiling…" : "Export Report"} onClick={exportReport} spin={exporting} />
        {page === "5.1" && <Action icon="snow" label="Freeze All" tone="danger" onClick={() => openModal({ type: "freezeAll" })} />}
      </div>
    </div>
  );
}

/* ================= Mobile nav drawer ================= */

export function MobileNav() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const openNav = () => setOpen(true);
    window.addEventListener("pm-open-nav", openNav);
    return () => window.removeEventListener("pm-open-nav", openNav);
  }, []);
  return (
    <Drawer open={open} onClose={() => setOpen(false)} side="left" width="max-w-[300px]">
      <div className="pmc-side-glow h-100">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </div>
    </Drawer>
  );
}
