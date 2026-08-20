import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "./utils/cn";
import { Icon, type IconName } from "./icons";

/* ---------- Badge ---------- */

export type BadgeTone = "success" | "warning" | "danger" | "info" | "muted" | "violet";
const badgeTones: Record<BadgeTone, string> = {
  success: "bg-pmgreen-soft text-[#067647]",
  warning: "bg-warn-soft text-[#93370d]",
  danger: "bg-danger-soft text-[#b42318]",
  info: "bg-pmblue-soft text-[#175cd3]",
  muted: "bg-canvas text-[#475467]",
  violet: "bg-pmviolet-soft text-[#5925dc]",
};

export function Badge({ tone = "muted", children, className, dot }: { tone?: BadgeTone; children: ReactNode; className?: string; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold", badgeTones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ---------- Chip (filter pill) ---------- */

export function Chip({ on, onClick, children, count }: { on: boolean; onClick: () => void; children: ReactNode; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "focus-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-all duration-150",
        on
          ? "border-ink bg-ink text-white shadow-sm"
          : "border-line bg-white text-[#475467] hover:border-[#c4c9d4] hover:-translate-y-px"
      )}
    >
      {children}
      {count !== undefined && (
        <span className={cn("rounded-full px-1.5 text-[10.5px] font-bold", on ? "bg-white/20" : "bg-canvas")}>{count}</span>
      )}
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
      className={cn(
        "focus-ring relative h-[24px] w-[44px] flex-none rounded-full transition-colors duration-200",
        on ? "bg-pmgreen" : "bg-[#d0d5dd]",
        disabled && "cursor-not-allowed opacity-40"
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all duration-200",
          on ? "left-[23px]" : "left-[3px]"
        )}
      />
    </button>
  );
}

/* ---------- Section header (numbered, matches pm-sec) ---------- */

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
    <div id={id} className="mt-10 mb-4 flex scroll-mt-24 flex-wrap items-center gap-3 first:mt-0">
      <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] bg-ink font-display text-[12px] font-bold text-white">
        {no}
      </span>
      <h2 className="font-display text-[17px] font-bold tracking-tight text-ink sm:text-[19px]">{title}</h2>
      {children && <div className="ml-auto flex flex-wrap items-center gap-2">{children}</div>}
      {sub && <p className="-mt-1 ml-[42px] w-full text-[12.5px] leading-relaxed text-muted">{sub}</p>}
    </div>
  );
}

/* ---------- Progress ---------- */

export function Progress({ value, tone = "green", className }: { value: number; tone?: "green" | "amber" | "red" | "blue" | "violet"; className?: string }) {
  const colors = { green: "bg-pmgreen", amber: "bg-warn", red: "bg-danger", blue: "bg-pmblue", violet: "bg-pmviolet" };
  return (
    <div className={cn("h-[5px] w-full overflow-hidden rounded-full bg-[#eef0f4]", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", colors[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
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
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="overlay-fade absolute inset-0 bg-[#0b1322]/55 backdrop-blur-[3px]" onClick={onClose} />
      <div
        className={cn(
          "modal-pop relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-pm-lg sm:rounded-2xl",
          width
        )}
      >
        <div className={cn("flex items-start gap-3 border-b border-line px-5 py-4", tone === "danger" && "bg-danger-soft/40")}>
          {icon && (
            <span
              className={cn(
                "mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-[10px]",
                tone === "danger" ? "bg-danger-soft text-[#b42318]" : "bg-pmgreen-soft text-[#067647]"
              )}
            >
              <Icon name={icon} size={18} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[15.5px] font-bold tracking-tight text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="focus-ring -mr-1 grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink"
          >
            <Icon name="x" size={17} />
          </button>
        </div>
        <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-[#fafbfd] px-5 py-3.5">{footer}</div>}
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
  return (
    <div className="fixed inset-0 z-[75]" role="dialog" aria-modal="true">
      <div className="overlay-fade absolute inset-0 bg-[#0b1322]/45 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cn(
          "absolute inset-y-0 flex w-full flex-col bg-white shadow-pm-lg",
          side === "right" ? "right-0 drawer-in" : "left-0 drawer-in-left",
          width
        )}
      >
        {children}
      </div>
    </div>
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
    <div ref={ref} className={cn("reveal", inView && "in", className)} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ---------- Empty state ---------- */

export function Empty({ icon = "inbox", title, sub, action }: { icon?: IconName; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-12 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-canvas text-faint">
        <Icon name={icon} size={20} />
      </span>
      <p className="font-display text-[14px] font-bold text-ink">{title}</p>
      {sub && <p className="max-w-[300px] text-[12.5px] text-muted">{sub}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ---------- Buttons ---------- */

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
  const variants = {
    primary: "bg-pmgreen text-white hover:bg-pmgreen-dark shadow-[0_4px_14px_-4px_rgba(18,183,106,0.55)]",
    dark: "bg-ink text-white hover:bg-side-2",
    ghost: "bg-white/12 text-white hover:bg-white/20 border border-white/20",
    outline: "border border-line bg-white text-ink hover:border-[#c4c9d4] hover:bg-canvas/60",
    danger: "bg-danger text-white hover:bg-[#d92d20] shadow-[0_4px_14px_-4px_rgba(240,68,56,0.5)]",
    dangerGhost: "bg-danger-soft text-[#b42318] hover:bg-[#fecdca]",
  };
  const sizes = { sm: "px-3 py-1.5 text-[12.5px] gap-1.5", md: "px-4 py-2 text-[13px] gap-2", lg: "px-5 py-2.5 text-[13.5px] gap-2" };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "focus-ring inline-flex items-center justify-center rounded-[10px] font-bold transition-all duration-150 active:scale-[0.98]",
        variants[variant],
        sizes[size],
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

/* ---------- Field label ---------- */

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between">
      <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#475467]">{children}</span>
      {hint && <span className="text-[11px] text-faint">{hint}</span>}
    </div>
  );
}
