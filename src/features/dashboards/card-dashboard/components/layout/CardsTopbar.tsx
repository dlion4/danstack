/* ============================================================================
 * CardsTopbar.tsx — fixed top header for the Card Dashboard.
 * Replicates the business-dashboard header pattern:
 *   Left  : hamburger toggle + search bar
 *   Right : accounts chip · business chip · divider · API keys · security
 *           divider · support · notifications bell · user avatar+name
 * ============================================================================
 */
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Icon, type IconName } from "../../icons";
import { useApp } from "../../store";
import styles from "./topbar.module.css";

const s = styles as Record<string, string>;

/* ---- Search ---- */
function SearchBar() {
  const { cards, txns, openDrawer } = useApp();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setFocus(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const query = q.trim().toLowerCase();
  const cardHits = query ? cards.filter((c) => (c.nickname + c.holder + c.last4 + c.tier).toLowerCase().includes(query)).slice(0, 3) : [];
  const txnHits = query ? txns.filter((t) => (t.merchant + t.category).toLowerCase().includes(query)).slice(0, 3) : [];
  const showPanel = focus && query.length > 0;

  return (
    <div ref={ref} className={cn(s["global-search"], "d-none d-md-block")}>
      <i className={cn("bi bi-search", s["search-icon"])} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocus(true)}
        placeholder="Search cards, merchants, modules…"
        aria-label="Search cards"
      />
      {showPanel && (
        <div className={cn(s["dropdown-panel"], s.show)} style={{ left: 0, right: "auto", width: 380 }}>
          {cardHits.length + txnHits.length === 0 ? (
            <p className="text-center mb-0" style={{ padding: "20px 16px", fontSize: 12.5, color: "var(--pm-muted)" }}>No matches for "{q}".</p>
          ) : (
            <div className={s["panel-body"]}>
              {cardHits.length > 0 && <p className={s["nav-group-label"]}>Cards</p>}
              {cardHits.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { openDrawer({ type: "card", cardId: c.id }); setQ(""); setFocus(false); }}
                  className={s.menuItem}
                >
                  <i className="bi bi-credit-card-2-front" style={{ color: "var(--pm-green)" }} />
                  <span className="flex-grow-1 fw-semibold" style={{ fontSize: "0.82rem" }}>{c.nickname}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--pm-muted)" }}>•• {c.last4}</span>
                </button>
              ))}
              {txnHits.length > 0 && <p className={s["nav-group-label"]}>Transactions</p>}
              {txnHits.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setQ(""); setFocus(false); }}
                  className={s.menuItem}
                >
                  <i className="bi bi-wallet2" style={{ color: "var(--pm-blue)" }} />
                  <span className="flex-grow-1 fw-semibold" style={{ fontSize: "0.82rem" }}>{t.merchant}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--pm-muted)" }}>KES {t.amount.toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- Notifications ---- */
function NotifBell({ count }: { count: number }) {
  const { notifs, markAllRead, markRead } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const chanIcon: Record<string, string> = { push: "bi-telephone", sms: "bi-chat-dots", email: "bi-envelope", system: "bi-shield" };
  const chanTone: Record<string, string> = { push: "success", sms: "info", email: "primary", system: "warning" };

  return (
    <div ref={ref} className={cn("position-relative")}>
      <button type="button" className={s["header-action"]} aria-label={`Notifications, ${count} unread`} onClick={() => setOpen((o) => !o)}>
        <i className={cn("bi bi-bell", s["action-icon"])} />
        {count > 0 && <span className={s["header-badge"]}>{count}</span>}
      </button>
      {open && (
        <div className={cn(s["dropdown-panel"], s.show)} role="menu" style={{ width: 380 }}>
          <div className={s["panel-header"]}>
            <span className={s["panel-title"]}>Notifications</span>
            <button type="button" className={s.menuItem} style={{ padding: "2px 8px", fontSize: "0.75rem" }} onClick={markAllRead}>Mark all read</button>
          </div>
          <div className={s["panel-body"]}>
            {notifs.slice(0, 6).map((n) => (
              <div key={n.id} className={cn(s["notification-item"], !n.read && s.unread)} onClick={() => markRead(n.id)}>
                <div className={cn(s["notification-icon"], s[chanTone[n.channel] ?? "primary"])}>
                  <i className={`bi ${chanIcon[n.channel] ?? "bi-bell"}`} />
                </div>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <span className="fw-semibold" style={{ fontSize: "0.82rem", color: "var(--text)" }}>{n.title}</span>
                    {!n.read && <span className={s["notification-dot"]} />}
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: "0.75rem" }}>{n.body}</div>
                </div>
                <span className="text-muted flex-shrink-0" style={{ fontSize: "0.7rem" }}>{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- User avatar dropdown ---- */
function UserTrigger() {
  const { openModal, openDrawer, toast } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="position-relative">
      <button type="button" className={s["user-trigger"]} aria-label="Account menu" onClick={() => setOpen((o) => !o)}>
        <div className={s.avatar} style={{ background: "linear-gradient(135deg,#12b76a,#0b8f52)" }}>DA</div>
        <div className={s["user-meta"]}>
          <div className={s["user-name"]}>David A.</div>
          <div className={s["user-role"]}>BAAS Admin</div>
        </div>
        <i className={cn("bi bi-chevron-down", s.chev)} style={{ fontSize: "0.8rem" }} />
      </button>
      {open && (
        <div className={cn(s["dropdown-panel"], s.show)} role="menu" style={{ width: 280 }}>
          <div className="p-3 d-flex align-items-center gap-3 border-bottom">
            <div className={s.avatar} style={{ width: 46, height: 46, fontSize: "1rem", background: "linear-gradient(135deg,#12b76a,#0b8f52)" }}>DA</div>
            <div>
              <div className="fw-bold" style={{ fontSize: "0.9rem" }}>David Achieng</div>
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>david@acmetraders.co.ke</div>
            </div>
          </div>
          <div className={s["panel-body"]}>
            <button type="button" className={s.menuItem} onClick={() => setOpen(false)}>
              <i className="bi bi-person" /> Profile
            </button>
            <button type="button" className={s.menuItem} onClick={() => { openModal({ type: "settingsDefaults" }); setOpen(false); }}>
              <i className="bi bi-gear" /> Card Settings
            </button>
            <button type="button" className={s.menuItem} onClick={() => { openModal({ type: "shortcuts" }); setOpen(false); }}>
              <i className="bi bi-keyboard" /> Keyboard Shortcuts
            </button>
            <button type="button" className={s.menuItem} onClick={() => { openDrawer({ type: "support" }); setOpen(false); }}>
              <i className="bi bi-headset" /> Support
            </button>
          </div>
          <div className={s["panel-footer"]}>
            <button type="button" className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2" style={{ fontSize: "0.82rem" }} onClick={() => { toast("info", "Signed out", "Session ended."); setOpen(false); }}>
              <i className="bi bi-box-arrow-right" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================
 * Topbar — main export
 * ======================================================================== */
export default function CardsTopbar({
  expanded,
  onToggleSidebar,
}: {
  expanded: boolean;
  onToggleSidebar: () => void;
}) {
  const { unread, openModal } = useApp();

  return (
    <header className={cn(s["top-header"], expanded && s["sidebar-expanded"])}>
      {/* Left: toggle + search */}
      <div className="d-flex align-items-center gap-3">
        <button type="button" className={s["sidebar-toggle"]} onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <i className="bi bi-list" />
        </button>
        <SearchBar />
      </div>

      {/* Right: actions */}
      <div className={s["header-actions"]}>
        {/* Accounts chip */}
        <button type="button" className={s["account-id-chip"]} title="Linked card accounts">
          <i className="bi bi-layers" />
          <span className="d-none d-sm-inline">Accounts</span>
          <i className={cn("bi bi-chevron-down", s.chev)} style={{ fontSize: "0.7rem" }} />
        </button>

        {/* Business entity chip */}
        <button type="button" className={s["business-chip"]} title="Business entity">
          <span style={{ fontSize: "0.95rem" }}>💳</span>
          <span className="d-none d-sm-inline">Acme Traders Ltd</span>
          <i className={cn("bi bi-chevron-down", s.chev)} style={{ fontSize: "0.65rem", color: "var(--pm-muted)" }} />
        </button>

        <div className={cn("vr d-none d-lg-block mx-1")} style={{ height: 28, opacity: 0.15 }} />

        {/* API Keys */}
        <button type="button" className={s["header-action"]} onClick={() => openModal({ type: "adminKey" })} title="API Keys" aria-label="API Keys">
          <i className={cn("bi bi-key", s["action-icon"])} />
        </button>

        {/* Security */}
        <button type="button" className={s["header-action"]} onClick={() => openModal({ type: "fraudWizard" })} title="Security & Fraud" aria-label="Security">
          <i className={cn("bi bi-shield-lock", s["action-icon"])} />
        </button>

        <div className={cn("vr d-none d-lg-block mx-1")} style={{ height: 28, opacity: 0.15 }} />

        {/* Support / Compliance */}
        <button type="button" className={s["header-action"]} onClick={() => openModal({ type: "shortcuts" })} title="Card Support" aria-label="Card Support">
          <i className={cn("bi bi-shield-check", s["action-icon"])} />
        </button>

        {/* Notifications */}
        <NotifBell count={unread} />

        {/* User */}
        <UserTrigger />
      </div>
    </header>
  );
}
