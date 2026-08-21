/* ============================================================================
 * Card Dashboard — UI primitives (Bootstrap 5 edition)
 * ----------------------------------------------------------------------------
 * Same export names and prop APIs as the Tailwind originals so every call
 * site, re-export file and route keeps working. Markup now uses Bootstrap
 * classes (.badge, .btn, .progress, .modal, .offcanvas, .form-switch) styled
 * through the scoped .pmc-* theme in index.css.
 * ========================================================================== */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "./utils/cn";
import { Icon, type IconName } from "./icons";

/* ---------- Badge ---------- */

export type BadgeTone = "success" | "warning" | "danger" | "info" | "muted" | "violet";
const badgeTones: Record<BadgeTone, string> = {
  success: "pmc-badge-success",
  warning: "pmc-badge-warning",
  danger: "pmc-badge-danger",
  info: "pmc-badge-info",
  muted: "pmc-badge-muted",
  violet: "pmc-badge-violet",
};

export function Badge({ tone = "muted", children, className, dot }: { tone?: BadgeTone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("badge", badgeTones[tone], className)}>
      {dot && <span className="pmc-dot" />}
      {children}
    </span>
  );
}

/* ---------- Chip (filter pill) ---------- */

export function Chip({ on, onClick, children, count }: { on: boolean; onClick: () => void; children: ReactNode; count?: number }) {
  return (
    <button type="button" onClick={onClick} className={cn("pmc-chip pmc-focus", on && "on")}>
      {children}
      {count !== undefined && <span className="pmc-chip-count">{count}</span>}
    </button>
  );
}

/* ---------- Toggle switch ---------- */

export function Toggle({ on, onChange, disabled, label }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={cn("pmc-toggle", on && "on")}
    >
      <span className="pmc-toggle-knob" />
    </button>
  );
}

/* ---------- Section header (numbered) ---------- */

export function SectionHead({
  no,
  title,
  sub,
  id,
  children,
}: {
  no: string;
  title: string;
  sub?: string;
  id?: string;
  children?: ReactNode;
}) {
  return (
    <div id={id} className="pmc-section-head pmc-scroll-mt">
      <span className="pmc-section-no">{no}</span>
      <h2 className="pmc-section-title">{title}</h2>
      {children && <div className="pmc-section-actions">{children}</div>}
      {sub && <p className="pmc-section-sub">{sub}</p>}
    </div>
  );
}

/* ---------- Progress ---------- */

const barTones = { green: "pmc-bar-green", amber: "pmc-bar-amber", red: "pmc-bar-red", blue: "pmc-bar-blue", violet: "pmc-bar-violet" };

export function Progress({ value, tone = "green", className }: { value: number; tone?: "green" | "amber" | "red" | "blue" | "violet"; className?: string }) {
  return (
    <div className={cn("progress", className)} style={{ height: 5, borderRadius: 99 }} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={cn("progress-bar", barTones[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, transition: "width 0.5s ease-out" }}
      />
    </div>
  );
}

/* ---------- Sparkline ---------- */

export function Spark({ points, stroke = "#12b76a", w = 84, h = 28, fill = true }: { points: number[]; stroke?: string; w?: number; h?: number; fill?: boolean }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const norm = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (w - 2) + 1;
    const y = h - 3 - ((p - min) / (max - min || 1)) * (h - 6);
    return `${x},${y}`;
  });
  const path = `M${norm.join(" L")}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-hidden="true">
      {fill && <path d={`${path} L${w - 1},${h} L1,${h} Z`} fill={stroke} opacity="0.12" stroke="none" />}
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={norm[norm.length - 1].split(",")[0]} cy={norm[norm.length - 1].split(",")[1]} r="2.6" fill={stroke} />
    </svg>
  );
}

/* ---------- width helpers (callers still pass Tailwind max-w-* strings) ---------- */

const TW_MAX_W: Record<string, string> = {
  sm: "384px",
  md: "448px",
  lg: "512px",
  xl: "576px",
  "2xl": "672px",
  "3xl": "768px",
  full: "100%",
};

function maxWidthFrom(width?: string, fallback = "512px"): string {
  if (!width) return fallback;
  const arbitrary = width.match(/max-w-\[(.+)\]/);
  if (arbitrary) return arbitrary[1];
  const token = width.replace(/^max-w-/, "");
  return TW_MAX_W[token] ?? fallback;
}

/* ---------- Modal ---------- */

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  width = "max-w-lg",
  tone,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: IconName;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  tone?: "danger" | "default";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal show pmc-modal" role="dialog" aria-modal="true">
      <div className="pmc-overlay" onClick={onClose} />
      <div className="modal-dialog" style={{ maxWidth: maxWidthFrom(width) }}>
        <div className="modal-content">
          <div className={cn("pmc-modal-head", tone === "danger" && "pmc-modal-head-danger")}>
            {icon && (
              <span className={cn("pmc-modal-icon", tone === "danger" ? "pmc-tone-danger" : "pmc-tone-green")}>
                <Icon name={icon} size={18} />
              </span>
            )}
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <h3 className="pmc-modal-title">{title}</h3>
              {subtitle && <p className="pmc-modal-sub">{subtitle}</p>}
            </div>
            <button type="button" onClick={onClose} aria-label="Close dialog" className="pmc-modal-close pmc-focus">
              <Icon name="x" size={17} />
            </button>
          </div>
          <div className="pmc-modal-body pmc-thin-scroll">{children}</div>
          {footer && <div className="pmc-modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- Drawer ---------- */

export function Drawer({
  open,
  onClose,
  children,
  side = "right",
  width = "max-w-[430px]",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "right" | "left";
  width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const w = maxWidthFrom(width, "430px");
  return (
    <>
      <div className="pmc-drawer-backdrop" onClick={onClose} />
      <div
        className={cn("offcanvas show pmc-drawer", side === "right" ? "offcanvas-end" : "offcanvas-start")}
        style={{ "--bs-offcanvas-width": w, width: w, maxWidth: "100vw" } as CSSProperties}
        role="dialog"
        aria-modal="true"
      >
        <div className="offcanvas-body">{children}</div>
      </div>
    </>
  );
}

/* ---------- Reveal on scroll ---------- */

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("pmc-reveal", inView && "in", className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------- Empty state ---------- */

export function Empty({ icon = "inbox", title, sub, action }: { icon?: IconName; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="pmc-empty">
      <span className="pmc-empty-icon">
        <Icon name={icon} size={20} />
      </span>
      <p className="pmc-empty-title">{title}</p>
      {sub && <p className="pmc-empty-sub">{sub}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ---------- Buttons ---------- */

const btnVariants: Record<string, string> = {
  primary: "btn-primary",
  dark: "pmc-btn-dark",
  ghost: "pmc-btn-ghost",
  outline: "btn-outline-secondary",
  danger: "btn-danger",
  dangerGhost: "pmc-btn-danger-ghost",
};

export function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  icon,
  className,
  disabled,
  type = "button",
}: {
  children?: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "dark" | "ghost" | "outline" | "danger" | "dangerGhost";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn("btn pmc-focus", btnVariants[variant], size === "sm" && "btn-sm", size === "lg" && "btn-lg", className)}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

/* ---------- Field label ---------- */

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="pmc-label">
      <span>{children}</span>
      {hint && <span className="pmc-label-hint">{hint}</span>}
    </div>
  );
}
