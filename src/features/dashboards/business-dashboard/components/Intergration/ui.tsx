import { useId, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useStore } from "./store";

/* ============ helpers ============ */
export const toneOf: Record<string, string> = {
  Active: "green", Draft: "slate", Archived: "slate",
  Sent: "blue", Partial: "amber", Received: "green", Closed: "slate",
  Counting: "amber", Completed: "green",
  "Pending inspection": "amber", Quarantined: "violet", Restocked: "green", Refunded: "slate", Destroyed: "red",
  Damage: "red", Theft: "red", Expired: "red", "Cycle count": "slate", "Return to supplier": "violet", "Initial count": "blue", Found: "green", Other: "slate",
  Warehouse: "green", "Shop floor": "blue", Quarantine: "violet", "In transit": "amber",
  /* funding & credit */
  Approved: "green", Pending: "amber", Rejected: "red", Disbursed: "blue", Submitted: "blue",
  "In review": "violet", "Paid off": "slate", Overdue: "red", "Awaiting acceptance": "amber",
  Due: "amber", Upcoming: "slate", Paid: "green",
  Available: "green", Financed: "blue", Ineligible: "slate", "Past due": "red",
  Verified: "green", Uploaded: "amber", Missing: "red", "Under review": "violet",
  /* marketing & growth */
  Scheduled: "blue", Paused: "amber", Ended: "slate", Live: "green",
  Published: "green", "Pending review": "amber", Replied: "blue",
  Delivered: "blue", Queued: "violet", Unread: "amber",
  Gold: "amber", Silver: "slate", Bronze: "green",
  WhatsApp: "green", Instagram: "violet", Facebook: "blue", TikTok: "slate", Email: "slate", SMS: "slate",
  /* apps & integrations */
  Healthy: "green", Error: "red", Syncing: "amber", Success: "green", Failed: "red",
  Resolved: "green", Unresolved: "red", "Reconnect needed": "amber", "Not connected": "slate",
};

export function Badge({ tone = "slate", children, className = "" }: { tone?: string; children: ReactNode; className?: string }) {
  return <span className={`badge-soft ${tone} ${className}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const icon =
    status === "Active" || status === "Received" || status === "Restocked" || status === "Completed" || status === "Found" || status === "Available" || status === "Verified" ? "bi-check-circle-fill" :
    status === "Draft" ? "bi-pencil-fill" :
    status === "Archived" || status === "Closed" || status === "Paid off" ? "bi-archive-fill" :
    status === "Sent" || status === "Submitted" ? "bi-send-check-fill" :
    status === "Approved" || status === "Paid" ? "bi-check2-circle" :
    status === "Partial" || status === "Counting" || status === "Pending" || status === "Awaiting acceptance" || status === "Uploaded" || status === "Due" ? "bi-hourglass-split" :
    status === "Pending inspection" || status === "In review" ? "bi-search" :
    status === "Quarantined" ? "bi-shield-exclamation" :
    status === "Refunded" ? "bi-arrow-counterclockwise" :
    status === "Rejected" || status === "Overdue" || status === "Past due" || status === "Missing" ? "bi-exclamation-triangle-fill" :
    status === "Destroyed" || status === "Damage" || status === "Theft" || status === "Expired" ? "bi-trash-fill" :
    status === "Disbursed" || status === "Financed" ? "bi-cash-stack" :
    status === "Cycle count" ? "bi-clipboard-check" :
    status === "Return to supplier" ? "bi-box-arrow-left" :
    status === "Initial count" ? "bi-plus-circle-fill" :
    status === "Warehouse" ? "bi-buildings-fill" :
    status === "Shop floor" ? "bi-shop" :
    status === "In transit" ? "bi-truck" :
    status === "Upcoming" || status === "Scheduled" ? "bi-calendar3" :
    status === "Ineligible" ? "bi-slash-circle" :
    status === "Under review" || status === "Pending review" ? "bi-eye" :
    status === "Paused" ? "bi-pause-fill" :
    status === "Ended" ? "bi-stop-fill" :
    status === "Live" ? "bi-broadcast" :
    status === "Published" ? "bi-globe2" :
    status === "Replied" ? "bi-chat-dots" :
    status === "Delivered" ? "bi-check2-all" :
    status === "Queued" ? "bi-hourglass-split" :
    status === "Unread" ? "bi-envelope-open-fill" :
    status === "Gold" ? "bi-gem" :
    status === "Silver" ? "bi-award" :
    status === "Bronze" ? "bi-shield" :
    status === "Healthy" || status === "Success" ? "bi-check-circle-fill" :
    status === "Error" || status === "Failed" ? "bi-exclamation-triangle-fill" :
    status === "Syncing" || status === "Partial" ? "bi-hourglass-split" :
    status === "Paused" ? "bi-pause-fill" :
    status === "Resolved" ? "bi-check2-circle" :
    status === "Unresolved" ? "bi-exclamation-octagon-fill" :
    status === "Reconnect needed" ? "bi-arrow-repeat" :
    status === "Not connected" ? "bi-circle" :
    status === "Other" ? "bi-circle-fill" : "bi-circle-fill";
  return (
    <Badge tone={toneOf[status] ?? "slate"}>
      <i className={`bi ${icon} me-1`} />
      {status}
    </Badge>
  );
}

export function Chip({ on, onClick, children }: { on?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button type="button" className={`pm-chip ${on ? "on" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

/* ============ Section header ============ */
export function Section({ no, title, sub, actions }: { no: string; title: string; sub?: string; actions?: ReactNode }) {
  return (
    <>
      <div className="pm-sec">
        <span className="pm-sec-no">{no}</span>
        <h2>{title}</h2>
        {actions && <div className="ms-auto d-flex align-items-center gap-2 flex-wrap">{actions}</div>}
      </div>
      {sub && <div className="pm-sec-sub">{sub}</div>}
    </>
  );
}

/* ============ Sparkline ============ */
export function Spark({ data, color = "#12b76a", w = 110, h = 34, fill = true }: { data: number[]; color?: string; w?: number; h?: number; fill?: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 3 - ((v - min) / range) * (h - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const gid = useId();
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden style={{ overflow: "visible" }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,${h} ${pts.join(" ")} ${w},${h}`} fill={`url(#${gid})`} />
        </>
      )}
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r="2.6" fill={color} />
    </svg>
  );
}

/* ============ KPI ============ */
export function Kpi({ icon, iconBg, label, value, delta, deltaGood = true, spark, sparkColor, footer }: {
  icon: string; iconBg: string; label: string; value: string; delta?: string; deltaGood?: boolean;
  spark?: number[]; sparkColor?: string; footer?: string;
}) {
  return (
    <div className="pm-card">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <div className="pm-kpi-label">{label}</div>
          <div className="pm-kpi-value">{value}</div>
        </div>
        <div className="pm-kpi-icon" style={{ background: iconBg }}>
          <i className={`bi ${icon}`} />
        </div>
      </div>
      <div className="d-flex align-items-end justify-content-between gap-2">
        <div>
          {delta && (
            <span className={`pm-delta ${delta.startsWith("-") ? "down" : deltaGood ? "up" : "flat"}`}>
              <i className={`bi ${delta.startsWith("-") ? "bi-arrow-down-right" : "bi-arrow-up-right"}`} />
              {delta}
            </span>
          )}
          {footer && <div className="mt-1" style={{ fontSize: "0.72rem", color: "var(--pm-muted)" }}>{footer}</div>}
        </div>
        {spark && <Spark data={spark} color={sparkColor} />}
      </div>
    </div>
  );
}

/* ============ Modal ============ */
export function Modal({ open, onClose, title, subtitle, icon, size = "md", children, footer, hideClose }: {
  open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode; icon?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full"; children: ReactNode; footer?: ReactNode; hideClose?: boolean;
}) {
  if (!open) return null;
  const sizeCls = size === "sm" ? "modal-sm" : size === "lg" ? "modal-lg" : size === "xl" ? "modal-xl" : size === "full" ? "modal-fullscreen" : "";
  return (
    <>
      <div className="modal-backdrop fade show" onClick={hideClose ? undefined : onClose} />
      <div className="modal fade show d-block pm-modal" tabIndex={-1} role="dialog" aria-modal="true">
        <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${sizeCls}`}>
          <div className="modal-content">
            <div className="modal-header">
              <div className="d-flex align-items-center gap-2">
                {icon && <span className="pm-kpi-icon" style={{ width: 34, height: 34, fontSize: "0.9rem", background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}><i className={`bi ${icon}`} /></span>}
                <div>
                  <h5 className="modal-title">{title}</h5>
                  {subtitle && <div style={{ fontSize: "0.74rem", color: "var(--pm-muted)" }}>{subtitle}</div>}
                </div>
              </div>
              {!hideClose && (
                <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
              )}
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

/* ============ Drawer ============ */
export function Drawer({ open, onClose, title, subtitle, children, footer, icon }: {
  open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode; icon?: string;
}) {
  if (!open) return null;
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <aside className="pm-drawer" role="dialog" aria-modal="true">
        <div className="pm-drawer-head">
          {icon && <span className="pm-kpi-icon" style={{ width: 36, height: 36, background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}><i className={`bi ${icon}`} /></span>}
          <div className="flex-grow-1">
            <div className="fw-bold" style={{ fontSize: "0.95rem" }}>{title}</div>
            {subtitle && <div style={{ fontSize: "0.72rem", color: "var(--pm-muted)" }}>{subtitle}</div>}
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
        </div>
        <div className="pm-drawer-body">{children}</div>
        {footer && <div className="pm-drawer-foot">{footer}</div>}
      </aside>
    </>
  );
}

/* ============ Wizard shell ============ */
export interface WizStep { label: string; icon: string }
export function WizardShell({ steps, current, onStep, children, footer }: {
  steps: WizStep[]; current: number; onStep?: (i: number) => void; children: ReactNode; footer?: ReactNode;
}) {
  const pct = Math.round(((current + 1) / steps.length) * 100);
  return (
    <div>
      <div className="pm-wizard-track">
        {steps.map((s, i) => (
          <div key={s.label} className={`pm-wstep ${i === current ? "active" : i < current ? "done" : ""}`}>
            {i < steps.length - 1 && <div className="pm-wline" />}
            <div className="pm-wdot" role="button" onClick={() => onStep?.(i)} style={{ cursor: onStep ? "pointer" : "default" }}>
              {i < current ? <i className="bi bi-check-lg" /> : <i className={`bi ${s.icon}`} style={{ fontSize: "0.85rem" }} />}
            </div>
            <div className="pm-wlabel">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="progress pm-wprogress">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <div style={{ minHeight: 280 }}>{children}</div>
      {footer && <div className="modal-footer px-0 pb-0 mt-2">{footer}</div>}
    </div>
  );
}

/* ============ Table cell bits ============ */
export function Thumb({ img, emoji, size = 42, fallbackBg = "#eef7f2" }: { img: string; emoji: string; size?: number; fallbackBg?: string }) {
  const [err, setErr] = useState(false);
  const style: CSSProperties = { width: size, height: size };
  if (err || !img) {
    return <div className="pm-thumb pm-thumb-fallback" style={{ ...style, background: fallbackBg }}>{emoji}</div>;
  }
  return <img className="pm-thumb" style={style} src={img} alt="" loading="lazy" onError={() => setErr(true)} />;
}

export function StockBar({ stock, reorder, max = 100 }: { stock: number; reorder: number; max?: number }) {
  const pct = Math.min(100, Math.round((stock / max) * 100));
  const low = stock <= reorder && stock > 0;
  const out = stock === 0;
  return (
    <div style={{ minWidth: 90 }}>
      <div className="d-flex align-items-center justify-content-between" style={{ fontSize: "0.74rem" }}>
        <span className="fw-semibold">{stock}</span>
        {out ? <Badge tone="red">Out</Badge> : low ? <Badge tone="amber">Low</Badge> : null}
      </div>
      <div className="progress" style={{ height: 5 }}>
        <div className="progress-bar" style={{ width: `${pct}%`, background: out ? "#f04438" : low ? "#f79009" : undefined }} />
      </div>
    </div>
  );
}

export function EmptyState({ icon = "bi-box", title, text, action }: { icon?: string; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="pm-empty">
      <i className={`bi ${icon}`} />
      <h5>{title}</h5>
      {text && <p className="mb-3" style={{ fontSize: "0.82rem" }}>{text}</p>}
      {action}
    </div>
  );
}

/* ============ Toast host ============ */
export function ToastHost() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pm-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`pm-toast ${t.type}`} role="status">
          <div className="flex-grow-1">
            {t.title && <div className="fw-bold" style={{ fontSize: "0.82rem" }}>{t.title}</div>}
            <div style={{ fontSize: "0.8rem", color: "#475467" }}>{t.msg}</div>
          </div>
          <button type="button" className="btn-close" style={{ fontSize: "0.6rem" }} onClick={() => dismissToast(t.id)} />
        </div>
      ))}
    </div>
  );
}

/* ============ Field label wrapper ============ */
export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="form-label">{label}</label>
      {children}
      {hint && <div style={{ fontSize: "0.7rem", color: "var(--pm-muted)", marginTop: 3 }}>{hint}</div>}
    </div>
  );
}
