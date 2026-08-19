import { useState } from "react";
import type { ReactNode } from "react";
import { NAVIGATION } from "./navigation";

/* ============================================================
   ONE MASTER SHELL — every page shares this sidebar/topbar/quickbar.
   The nav is driven by lib/navigation.ts, so every sidebar item
   maps uniformly to the same routed page id across all pages.
============================================================ */

export type ShellToastType = "success" | "info" | "warning" | "danger";

/* Minimal shape every page store satisfies (structural typing —
   page stores have extra fields, which is fine). */
export interface ShellData {
  business: string;
  setBusiness?: (b: string) => void;
  notifications: { id: number; icon: string; text: string; time: string; unread: boolean }[];
  markNotifsRead: () => void;
  dismissNotif: (id: number) => void;
  toast: (msg: string, type?: ShellToastType, title?: string) => void;
  openModal: (name: string, payload?: Record<string, unknown>) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const SHELL_BUSINESSES = [
  { name: "TS Retail Ltd", emoji: "🛍️", type: "Retail & E-commerce", current: true },
  { name: "Nairobi Java Roasters", emoji: "☕", type: "F&B / Cafe", current: false },
  { name: "Savannah Crafts Ltd", emoji: "🧺", type: "Handicrafts & Export", current: false },
];

/* lucide iconName (from navigation.ts) → bootstrap icon class */
const ICON_BY_NAME: Record<string, string> = {
  LayoutGrid: "bi-grid-3x3-gap",
  Wallet: "bi-wallet2",
  User: "bi-person",
  Building2: "bi-buildings",
  Zap: "bi-lightning-charge",
  Sparkles: "bi-stars",
  Package: "bi-box-seam",
  Megaphone: "bi-megaphone",
  Users: "bi-people",
  Shield: "bi-shield-check",
  Bell: "bi-bell",
  Database: "bi-database",
  Puzzle: "bi-puzzle",
};

const BADGES: Record<string, string> = {
  getpaid: "12 due",
  paysuppliers: "3 POs",
};

/* Nav ids → routed page ids (with optional in-page anchors).
   lib/navigation.ts ids that don't match Root's PageId go through here. */
const ROUTE: Record<string, [string, string?]> = {
  customers: ["crm"],
  payroll: ["paysuppliers", "sec-payroll"],
  expenses: ["paysuppliers", "sec-expenses"],
};

export function findNavEntry(id: string): { zone: string; label: string } | null {
  for (const [zone, items] of Object.entries(NAVIGATION)) {
    const it = items.find((i) => i.id === id);
    if (it) return { zone: zone.replace(/^[^A-Za-z]+/, "").trim(), label: it.label };
  }
  return null;
}

/* ============================================================
   SIDEBAR
============================================================ */
export function Sidebar({ open, onClose, onNavigate, current, data, brandSub, footer }: {
  open: boolean;
  onClose: () => void;
  onNavigate?: (p: string, anchor?: string) => void;
  current: string;
  data: ShellData;
  brandSub?: string;
  footer?: ReactNode;
}) {
  const { toast, business } = data;
  return (
    <>
      {open && <div className="pm-overlay d-lg-none" onClick={onClose} />}
      <aside className={`pm-sidebar ${open ? "open" : ""}`}>
        <div className="pm-brand">
          <div className="pm-brand-logo">P</div>
          <div>
            <div className="pm-brand-name">PayMo Business</div>
            <div className="pm-brand-sub">{brandSub ?? "PayMo Business"}</div>
          </div>
        </div>
        <div className="pm-nav-wrap">
          {Object.entries(NAVIGATION).map(([zone, items]) => (
            <div key={zone}>
              <div className="pm-nav-group">{zone.toUpperCase()}</div>
              {items.map((it) => {
                const r = ROUTE[it.id];
                const active = it.id === current || (r ? r[0] === current : false);
                return (
                  <a
                    key={it.id}
                    className={`pm-nav-item ${active ? "active" : ""}`}
                    onClick={() => {
                      onClose();
                      if (active) return;
                      const r = ROUTE[it.id];
                      if (onNavigate) { onNavigate(r ? r[0] : it.id, r ? r[1] : undefined); return; }
                      toast(`Navigation to "${it.label}" ships in its own page.`, "info", "PayMo demo");
                    }}
                  >
                    <i className={`bi ${ICON_BY_NAME[it.iconName] ?? "bi-circle"}`} />
                    <span>{it.label}</span>
                    {BADGES[it.id] ? (
                      <span className="badge-soft amber ms-auto">{BADGES[it.id]}</span>
                    ) : (
                      <i className="bi bi-chevron-right ms-auto" style={{ fontSize: "0.65rem", color: "#4b5a70" }} />
                    )}
                  </a>
                );
              })}
            </div>
          ))}
        </div>
        {/* <div className="pm-sidebar-foot">
          {footer ?? (
            <div className="pm-upgrade">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-stars" style={{ color: "#ffd66b" }} />
                <span className="fw-bold">PayMo Pro</span>
              </div>
              Pro trial — 14 days left. Unlock KES 5M/day limits and priority support.
            </div>
          )}
          <div className="pm-user-row" onClick={() => toast("Signed in as Wanjiku M. — owner of " + business + ".", "info", "Profile")}>
            <div className="pm-avatar" style={{ width: 30, height: 30, fontSize: "0.7rem" }}>WM</div>
            <div className="flex-grow-1" style={{ lineHeight: 1.2 }}>
              <div className="fw-semibold" style={{ fontSize: "0.78rem" }}>Wanjiku Maina</div>
              <div style={{ fontSize: "0.66rem", color: "#7b8aa3" }}>Owner · {business}</div>
            </div>
            <i className="bi bi-box-arrow-right" style={{ fontSize: "0.8rem", color: "#7b8aa3" }} />
          </div>
        </div> */}
      </aside>
    </>
  );
}

/* ============================================================
   TOPBAR
============================================================ */
export function Topbar({ onMenu, current, data, searchId, searchPlaceholder, crumb }: {
  onMenu: () => void;
  current: string;
  data: ShellData;
  searchId?: string;
  searchPlaceholder?: string;
  crumb?: string;
}) {
  const { business, setBusiness, notifications, markNotifsRead, dismissNotif, openModal, toast, searchQuery, setSearchQuery } = data;
  const [bellOpen, setBellOpen] = useState(false);
  const [bizOpen, setBizOpen] = useState(false);
  const [accOpen, setAccOpen] = useState(false);
  const unread = notifications.filter((n) => n.unread).length;
  const entry = findNavEntry(current);
  const crumbText = crumb ?? (entry ? `${entry.zone} / ${entry.label}` : current);

  return (
    <header className="pm-topbar">
      <button type="button" className="btn btn-outline-secondary btn-sm pm-burger" onClick={onMenu}>
        <i className="bi bi-list" />
      </button>
      <div className="pm-crumb d-none d-md-block" dangerouslySetInnerHTML={{ __html: crumbText }} />
      <div className="ms-auto d-flex align-items-center gap-2">
        <div className="pm-search-box d-none d-lg-block">
          <i className="bi bi-search" />
          <input
            id={searchId}
            className="form-control form-control-sm"
            style={{ width: 240 }}
            placeholder={searchPlaceholder ?? "Search…"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Notifications */}
        <div className="pm-dd">
          <button type="button" className="pm-bell" onClick={() => setBellOpen((v) => !v)} aria-label="Notifications">
            <i className="bi bi-bell" />
            {unread > 0 && <span className="nub">{unread}</span>}
          </button>
          {bellOpen && (
            <>
              <div className="pm-overlay" onClick={() => setBellOpen(false)} />
              <div className="pm-dd-menu" style={{ width: 330, right: 0 }}>
                <div className="d-flex justify-content-between align-items-center px-2 py-2">
                  <span className="fw-bold" style={{ fontSize: "0.85rem" }}>Notifications</span>
                  <button type="button" className="btn btn-link btn-sm p-0" style={{ fontSize: "0.72rem" }} onClick={() => { markNotifsRead(); toast("All notifications marked as read", "info"); }}>
                    Mark all read
                  </button>
                </div>
                {notifications.map((n) => (
                  <div key={n.id} className="pm-dd-item" style={{ alignItems: "flex-start", opacity: n.unread ? 1 : 0.6 }}>
                    <i className={`bi ${n.icon}`} style={{ color: n.unread ? "var(--pm-green)" : "#98a2b3", marginTop: 2 }} />
                    <div className="flex-grow-1">
                      <div style={{ fontSize: "0.78rem", whiteSpace: "normal" }}>{n.text}</div>
                      <div style={{ fontSize: "0.66rem", color: "var(--pm-muted)" }}>{n.time}</div>
                    </div>
                    <button type="button" className="btn-close" style={{ fontSize: "0.5rem" }} onClick={() => dismissNotif(n.id)} />
                  </div>
                ))}
                <hr />
                <button type="button" className="pm-dd-item justify-content-center" onClick={() => { setBellOpen(false); openModal("help"); }}>
                  <i className="bi bi-sliders" /> Notification settings
                </button>
              </div>
            </>
          )}
        </div>

        {/* Business switcher */}
        <div className="pm-dd">
          <button type="button" className="pm-bizchip" onClick={() => setBizOpen((v) => !v)}>
            <span style={{ fontSize: "0.95rem" }}>🛍️</span>
            <span className="d-none d-sm-inline">{business}</span>
            <i className="bi bi-chevron-down" style={{ fontSize: "0.65rem", color: "var(--pm-muted)" }} />
          </button>
          {bizOpen && (
            <>
              <div className="pm-overlay" onClick={() => setBizOpen(false)} />
              <div className="pm-dd-menu" style={{ width: 260, right: 0 }}>
                <div className="px-2 py-1" style={{ fontSize: "0.66rem", color: "var(--pm-muted)", fontWeight: 700, letterSpacing: "0.08em" }}>
                  SWITCH BUSINESS
                </div>
                {SHELL_BUSINESSES.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    className="pm-dd-item"
                    onClick={() => {
                      setBizOpen(false);
                      if (business === b.name) return;
                      if (setBusiness) setBusiness(b.name);
                      toast(`Context switched to ${b.name}.`, "info", "Business switched");
                    }}
                  >
                    <span>{b.emoji}</span>
                    <span className="flex-grow-1">
                      <span className="d-block fw-semibold" style={{ fontSize: "0.8rem" }}>{b.name}</span>
                      <span style={{ fontSize: "0.66rem", color: "var(--pm-muted)" }}>{b.type}</span>
                    </span>
                    {business === b.name && <i className="bi bi-check-lg text-primary" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Account */}
        <div className="pm-dd">
          <button type="button" className="pm-avatar" style={{ border: "none", cursor: "pointer" }} onClick={() => setAccOpen((v) => !v)}>
            WM
          </button>
          {accOpen && (
            <>
              <div className="pm-overlay" onClick={() => setAccOpen(false)} />
              <div className="pm-dd-menu" style={{ width: 210, right: 0 }}>
                <button type="button" className="pm-dd-item" onClick={() => { setAccOpen(false); openModal("activity"); }}><i className="bi bi-clock-history" /> Activity log</button>
                <button type="button" className="pm-dd-item" onClick={() => { setAccOpen(false); openModal("help"); }}><i className="bi bi-question-circle" /> Help &amp; shortcuts</button>
                <hr />
                <button type="button" className="pm-dd-item danger" onClick={() => { setAccOpen(false); toast("Signed out of the demo session.", "info"); }}><i className="bi bi-box-arrow-right" /> Sign out</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   QUICKBAR
============================================================ */
export interface QuickAction { icon: string; label: string; primary?: boolean; onClick: () => void }

export function QuickBar({ actions }: { actions: QuickAction[] }) {
  return (
    <nav className="pm-quickbar" aria-label="Quick actions">
      {actions.map((a) => (
        <button key={a.label} type="button" className={a.primary ? "primary" : ""} onClick={a.onClick}>
          <i className={`bi ${a.icon}`} /> {a.label}
        </button>
      ))}
    </nav>
  );
}
