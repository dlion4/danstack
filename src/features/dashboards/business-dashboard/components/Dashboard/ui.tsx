import { useId, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useStore } from "./store";

/* ============ helpers ============ */
export const toneOf: Record<string, string> = {
  Active: "success",
  Draft: "muted",
  Archived: "muted",
  Sent: "info",
  Partial: "warning",
  Received: "success",
  Closed: "muted",
  Counting: "warning",
  Completed: "success",
  "Pending inspection": "warning",
  Quarantined: "violet",
  Restocked: "success",
  Refunded: "muted",
  Destroyed: "danger",
  Damage: "danger",
  Theft: "danger",
  Expired: "danger",
  "Cycle count": "muted",
  "Return to supplier": "violet",
  "Initial count": "info",
  Found: "success",
  Other: "muted",
  Warehouse: "success",
  "Shop floor": "info",
  Quarantine: "violet",
  "In transit": "warning",
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
  Disbursed: "info",
  Submitted: "info",
  "In review": "violet",
  "Paid off": "muted",
  Overdue: "danger",
  "Awaiting acceptance": "warning",
  Due: "warning",
  Upcoming: "muted",
  Paid: "success",
  Available: "success",
  Financed: "info",
  Ineligible: "muted",
  "Past due": "danger",
  Verified: "success",
  Uploaded: "warning",
  Missing: "danger",
  "Under review": "violet",
  Scheduled: "info",
  Paused: "warning",
  Ended: "muted",
  Live: "success",
  Published: "success",
  "Pending review": "warning",
  Replied: "info",
  Delivered: "info",
  Queued: "violet",
  Unread: "warning",
  Gold: "warning",
  Silver: "muted",
  Bronze: "success",
  WhatsApp: "success",
  Instagram: "violet",
  Facebook: "info",
  TikTok: "muted",
  Email: "muted",
  SMS: "muted",
  Healthy: "success",
  Error: "danger",
  Syncing: "warning",
  Success: "success",
  Failed: "danger",
  Resolved: "success",
  Unresolved: "danger",
  "Reconnect needed": "warning",
  "Not connected": "muted",
  Watch: "warning",
  Critical: "danger",
  Vacant: "muted",
  Notice: "warning",
  Open: "info",
  Assigned: "violet",
  Executed: "success",
  "Pending approval": "warning",
  "No Access": "muted",
  Viewer: "info",
  Standard: "success",
  Admin: "danger",
  Ltd: "success",
  "Sole Prop": "info",
  "SACCO / NGO": "violet",
  Rental: "warning",
  "Under Review": "warning",
  Inactive: "muted",
  Suspended: "danger",
  "Level 1": "warning",
  "Level 2": "success",
  "Level 3": "violet",
  "Expiring soon": "warning",
  Owner: "danger",
  Manager: "info",
  Accountant: "violet",
  Staff: "muted",
  "Custom role": "violet",
  "Pending invite": "warning",
  Revoked: "muted",
  Enabled: "success",
  Disabled: "muted",
  Full: "success",
  Approve: "violet",
  Edit: "info",
  View: "muted",
  None: "muted",
  Create: "success",
  "Needs Evidence": "warning",
  "Under Arbitration": "violet",
  Won: "success",
  Lost: "danger",
  Escalated: "danger",
  "Pending Customer": "warning",
  Low: "muted",
  Medium: "info",
  High: "warning",
  Urgent: "danger",
  Read: "muted",
  Opened: "success",
  Bounced: "danger",
  Muted: "muted",
  Important: "warning",
  Routine: "muted",
  Processing: "warning",
  Connected: "success",
  Disconnected: "danger",
  Required: "danger",
  "Full Access": "success",
  Limited: "warning",
  "Read Only": "info",
  "In Progress": "warning",
  Planned: "muted",
};

export function Badge({ tone = "muted", children, className = "" }: { tone?: string; children: ReactNode; className?: string }) {
  return <span className={`pm-badge pm-badge-${tone} ${className}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const getIconClass = () => {
    if (status === "Active" || status === "Received" || status === "Restocked" || status === "Completed" || status === "Found" || status === "Available" || status === "Verified") return "bi-check-circle";
    if (status === "Draft") return "bi-x";
    if (status === "Pending" || status === "Partial" || status === "In Progress" || status === "Processing" || status === "Pending approval" || status === "Pending review" || status === "Pending Customer" || status === "Pending invite" || status === "Awaiting acceptance" || status === "Due" || status === "Upcoming" || status === "Scheduled" || status === "Paused" || status === "Watch" || status === "Notice" || status === "Important" || status === "Unread" || status === "Gold" || status === "Level 1" || status === "Expiring soon" || status === "Needs Evidence" || status === "Limited" || status === "Medium" || status === "High" || status === "Urgent" || status === "Ineligible" || status === "Missing" || status === "Under review" || status === "Under Review" || status === "Reconnect needed" || status === "Syncing" || status === "Critical" || status === "Low" || status === "Routine" || status === "Planned" || status === "In transit" || status === "Quarantine" || status === "Quarantined" || status === "Return to supplier" || status === "Cycle count" || status === "Initial count" || status === "Pending inspection" || status === "Counting" || status === "Damage" || status === "Theft" || status === "Expired" || status === "Destroyed" || status === "Refunded" || status === "Closed" || status === "Archived" || status === "Paid off" || status === "Inactive" || status === "Suspended" || status === "Revoked" || status === "Disabled" || status === "None" || status === "Muted" || status === "Read" || status === "Bounced" || status === "Disconnected" || status === "Failed" || status === "Unresolved" || status === "Lost" || status === "Escalated" || status === "Error" || status === "Not connected" || status === "No Access" || status === "Past due" || status === "Overdue") return "bi-exclamation-triangle";
    if (status === "Sent" || status === "Disbursed" || status === "Submitted" || status === "In review" || status === "Queued" || status === "Assigned" || status === "Approve" || status === "Under Arbitration" || status === "Viewer" || status === "Read Only" || status === "View" || status === "Routine" || status === "Planned" || status === "Upcoming" || status === "Scheduled" || status === "Paused" || status === "Watch" || status === "Notice" || status === "Important" || status === "Unread" || status === "Gold" || status === "Level 1" || status === "Expiring soon" || status === "Needs Evidence" || status === "Limited" || status === "Medium" || status === "High" || status === "Urgent" || status === "Ineligible" || status === "Missing" || status === "Under review" || status === "Under Review" || status === "Reconnect needed" || status === "Syncing" || status === "Critical" || status === "Low" || status === "Routine" || status === "Planned" || status === "In transit" || status === "Quarantine" || status === "Quarantined" || status === "Return to supplier" || status === "Cycle count" || status === "Initial count" || status === "Pending inspection" || status === "Counting" || status === "Damage" || status === "Theft" || status === "Expired" || status === "Destroyed" || status === "Refunded" || status === "Closed" || status === "Archived" || status === "Paid off" || status === "Inactive" || status === "Suspended" || status === "Revoked" || status === "Disabled" || status === "None" || status === "Muted" || status === "Read" || status === "Bounced" || status === "Disconnected" || status === "Failed" || status === "Unresolved" || status === "Lost" || status === "Escalated" || status === "Error" || status === "Not connected" || status === "No Access" || status === "Past due" || status === "Overdue") return "bi-info-circle";
    return "bi-check-circle";
  };
  return (
    <Badge tone={toneOf[status] ?? "muted"}>
      <span className="me-1"><i className={`bi ${getIconClass()}`} /></span>
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
  icon: ReactNode; iconBg: string; label: string; value: string; delta?: string; deltaGood?: boolean;
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
          {icon}
        </div>
      </div>
      <div className="d-flex align-items-end justify-content-between gap-2">
        <div>
          {delta && (
            <span className={`pm-delta ${delta.startsWith("-") ? "down" : deltaGood ? "up" : "flat"}`}>
              {delta.startsWith("-") ? "▼" : "▲"} {delta}
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
  open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode; icon?: ReactNode;
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
                {icon && <span className="pm-kpi-icon" style={{ width: 34, height: 34, fontSize: "0.9rem", background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}>{icon}</span>}
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
  open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode; icon?: ReactNode;
}) {
  if (!open) return null;
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <aside className="pm-drawer" role="dialog" aria-modal="true">
        <div className="pm-drawer-head">
          {icon && <span className="pm-kpi-icon" style={{ width: 36, height: 36, background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}>{icon}</span>}
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
export interface WizStep { label: string; icon: ReactNode }
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
              {i < current ? <i className="bi bi-check-circle-fill" /> : s.icon}
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
        {out ? <Badge tone="danger">Out</Badge> : low ? <Badge tone="warning">Low</Badge> : null}
      </div>
      <div className="progress" style={{ height: 5 }}>
        <div className="progress-bar" style={{ width: `${pct}%`, background: out ? "#f04438" : low ? "#f79009" : undefined }} />
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="pm-empty">
      <div className="pm-empty-ic">{icon}</div>
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
        <div key={t.id} className={`pm-toast pm-toast-${t.type}`} role="status">
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
