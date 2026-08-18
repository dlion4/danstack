import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import {
  X, CheckCircle2, AlertTriangle, Info, XCircle, QrCode as QrIcon,
  Landmark, Smartphone, CreditCard, Link2, Radio, ScanLine, Hash,
} from "lucide-react";
import { cls, fmt, fmtN, hueFor, initials, qrGrid } from "../../lib";

/* ═══════════════════ Toasts ═══════════════════ */

export type ToastTone = "success" | "warning" | "danger" | "info";
export interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  body?: string;
}
let toastSeq = 0;
const ToastCtx = createContext<(t: { tone: ToastTone; title: string; body?: string }) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const notify = useCallback((t: { tone: ToastTone; title: string; body?: string }) => {
    const id = ++toastSeq;
    setToasts((x) => [...x.slice(-4), { ...t, id }]);
    window.setTimeout(() => setToasts((x) => x.filter((y) => y.id !== id)), 4600);
  }, []);
  const icons: Record<ToastTone, ReactNode> = {
    success: <CheckCircle2 size={17} />,
    warning: <AlertTriangle size={17} />,
    danger: <XCircle size={17} />,
    info: <Info size={17} />,
  };
  return (
    <ToastCtx.Provider value={notify}>
      {children}
      <div className="pm-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`pm-toast pm-toast-${t.tone}`} role="alert">
            <span className="pm-toast-icon">{icons[t.tone]}</span>
            <div className="pm-toast-body">
              <div className="pm-toast-title">{t.title}</div>
              {t.body && <div className="pm-toast-text">{t.body}</div>}
            </div>
            <button className="pm-toast-x" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ═══════════════════ Modal ═══════════════════ */

const MODAL_SIZES: Record<string, string> = {
  sm: "modal-sm",
  lg: "modal-lg",
  xl: "modal-xl",
  md: "",
};

export function Modal({
  open, onClose, title, kicker, subtitle, size = "md", children, footer, hideClose = false, bodyClass = "",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  kicker?: string;
  subtitle?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  children?: ReactNode;
  footer?: ReactNode;
  hideClose?: boolean;
  bodyClass?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    document.body.classList.add("pm-lock");
    return () => {
      window.removeEventListener("keydown", h);
      document.body.classList.remove("pm-lock");
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className="pm-backdrop" onClick={onClose} />
      <div
        className={cls("pm-modal modal fade show d-block")}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${MODAL_SIZES[size]}`}>
          <div className="modal-content pm-mc">
            <div className="modal-header pm-mh">
              <div className="min-w-0">
                {kicker && <div className="pm-kicker">{kicker}</div>}
                <h5 className="modal-title pm-mt">{title}</h5>
                {subtitle && <div className="pm-mt-sub">{subtitle}</div>}
              </div>
              {!hideClose && (
                <button className="pm-x" onClick={onClose} aria-label="Close">
                  <X size={18} />
                </button>
              )}
            </div>
            <div className={cls("modal-body pm-mb", bodyClass)}>{children}</div>
            {footer && <div className="modal-footer pm-mf">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════ Slide-over (right panel) ═══════════════════ */

export function SlideOver({
  open, onClose, title, kicker, children, footer, width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  kicker?: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    document.body.classList.add("pm-lock");
    return () => {
      window.removeEventListener("keydown", h);
      document.body.classList.remove("pm-lock");
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="pm-backdrop" onClick={onClose} />
      <div className="pm-drawer" style={{ width: `min(${width}px, 100vw)` }} role="dialog" aria-modal="true">
        <div className="pm-drawer-h">
          <div className="min-w-0">
            {kicker && <div className="pm-kicker">{kicker}</div>}
            <div className="pm-drawer-title">{title}</div>
          </div>
          <button className="pm-x" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="pm-drawer-b">{children}</div>
        {footer && <div className="pm-drawer-f">{footer}</div>}
      </div>
    </>
  );
}

/* ═══════════════════ Confirm ═══════════════════ */

export function Confirm({
  open, onClose, onConfirm, title, body, confirmLabel = "Confirm", tone = "primary", icon,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  tone?: "primary" | "danger" | "warning";
  icon?: ReactNode;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className={cls("btn", tone === "danger" ? "btn-danger" : tone === "warning" ? "btn-warning" : "btn pm-btn-primary")}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="d-flex gap-3 align-items-start">
        {icon && <div className={cls("pm-confirm-ic", tone === "danger" ? "pm-confirm-danger" : tone === "warning" ? "pm-confirm-warn" : "")}>{icon}</div>}
        <div className="pm-confirm-body">{body}</div>
      </div>
    </Modal>
  );
}

/* ═══════════════════ Atoms ═══════════════════ */

export function Badge({ tone = "muted", children, dot }: { tone?: string; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`pm-badge pm-badge-${tone}`}>
      {dot && <span className="pm-badge-dot" />}
      {children}
    </span>
  );
}

export function PillTabs({
  tabs, active, onChange,
}: {
  tabs: { id: string; label: string; count?: number; tone?: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="pm-pills">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={cls("pm-pill", active === t.id && "pm-pill-on")}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.count !== undefined && (
            <span className={cls("pm-pill-count", t.tone && `pm-pill-count-${t.tone}`)}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Section({
  no, sub, title, right, children, id,
}: {
  no: string;
  sub: string;
  title: string;
  right?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="pm-section">
      <div className="d-flex align-items-end justify-content-between gap-3 mb-3 flex-wrap">
        <div>
          <div className="pm-kicker">
            <span className="pm-secno">{no}</span> {sub}
          </div>
          <h3 className="pm-section-title">{title}</h3>
        </div>
        {right && <div className="d-flex gap-2 align-items-center flex-wrap">{right}</div>}
      </div>
      {children}
    </section>
  );
}

export function Kpi({
  icon, label, value, sub, delta, deltaTone = "up", accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: ReactNode;
  delta?: string;
  deltaTone?: "up" | "down" | "flat";
  accent?: string;
}) {
  return (
    <div className="pm-kpi">
      <div className="pm-kpi-top">
        <span className="pm-kpi-ic" style={accent ? { background: accent + "1a", color: accent } : undefined}>{icon}</span>
        <span className="pm-kpi-label">{label}</span>
      </div>
      <div className="pm-kpi-value">{value}</div>
      <div className="pm-kpi-sub">
        {delta && (
          <span className={cls("pm-kpi-delta", deltaTone === "up" ? "t-up" : deltaTone === "down" ? "t-down" : "t-flat")}>
            {deltaTone === "down" ? "▼" : deltaTone === "up" ? "▲" : "•"} {delta}
          </span>
        )}
        {sub && <span className="pm-kpi-note">{sub}</span>}
      </div>
    </div>
  );
}

export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const h = hueFor(name);
  return (
    <span
      className="pm-avatar"
      style={{
        width: size, height: size, fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${h} 62% 45%), hsl(${(h + 40) % 360} 60% 38%))`,
      }}
    >
      {initials(name)}
    </span>
  );
}

export function Money({ n, bold, tone }: { n: number; bold?: boolean; tone?: string }) {
  return <span className={cls("pm-money", bold && "fw-bold", tone && `t-${tone}`)}>{fmt(n)}</span>;
}

export function Field({ label, hint, children, req }: { label: ReactNode; hint?: string; children: ReactNode; req?: boolean }) {
  return (
    <div className="pm-field">
      <label className="pm-flabel">
        {label} {req && <span className="t-danger">*</span>}
      </label>
      {children}
      {hint && <div className="pm-fhint">{hint}</div>}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" className="pm-toggle-wrap" onClick={() => onChange(!on)}>
      <span className={cls("pm-toggle", on && "pm-toggle-on")}>
        <span className="pm-toggle-knob" />
      </span>
      {label && <span className="pm-toggle-label">{label}</span>}
    </button>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="pm-empty">
      <div className="pm-empty-ic">{icon}</div>
      <div className="pm-empty-title">{title}</div>
      {body && <div className="pm-empty-body">{body}</div>}
      {action}
    </div>
  );
}

/* ═══════════════════ Charts ═══════════════════ */

export function Sparkline({ data, color = "#0ea37f", w = 96, h = 34 }: { data: number[]; color?: string; w?: number; h?: number }) {
  const id = useId();
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => [
    (i / (data.length - 1 || 1)) * w,
    h - 4 - ((v - min) / (max - min || 1)) * (h - 10),
  ]);
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const last = pts[pts.length - 1] ?? [w, h / 2];
  return (
    <svg width={w} height={h} className="pm-spark" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.30" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.8" fill={color} />
    </svg>
  );
}

export function Donut({ pct, size = 68, stroke = 9, color = "#0ea37f", label }: { pct: number; size?: number; stroke?: number; color?: string; label?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(pct, 100) / 100) * c;
  return (
    <div className="pm-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8edf4" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="pm-donut-label">{label ?? `${Math.round(pct)}%`}</div>
    </div>
  );
}

export function StackedBar({ segments, h = 14, labels }: { segments: { v: number; color: string; label: string }[]; h?: number; labels?: boolean }) {
  const total = segments.reduce((s, x) => s + x.v, 0) || 1;
  return (
    <div>
      <div className="pm-stacked" style={{ height: h }}>
        {segments.map((s, i) => (
          <div key={i} className="pm-stacked-seg" style={{ width: `${(s.v / total) * 100}%`, background: s.color }} title={`${s.label}: ${fmt(s.v)}`} />
        ))}
      </div>
      {labels && (
        <div className="pm-stacked-legend">
          {segments.map((s, i) => (
            <span key={i} className="pm-legend-item">
              <i style={{ background: s.color }} />
              {s.label} <b>{fmtN(s.v)}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function BarChart({ data, labels, color = "#0ea37f", h = 150, format }: { data: number[]; labels: string[]; color?: string; h?: number; format?: (n: number) => string }) {
  const max = Math.max(...data) || 1;
  return (
    <div className="pm-bars" style={{ height: h }}>
      {data.map((v, i) => (
        <div className="pm-bar-col" key={i} title={format ? format(v) : fmt(v)}>
          <div className="pm-bar-fill" style={{ height: `${(v / max) * 100}%`, background: i === data.length - 1 ? color : `${color}b3` }} />
          <div className="pm-bar-x">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data, labels, color = "#0ea37f", h = 160, format }: { data: number[]; labels: string[]; color?: string; h?: number; format?: (n: number) => string }) {
  const id = useId();
  const w = 560;
  const pad = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const x = (i: number) => pad + (i / (data.length - 1 || 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
  const line = data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`;
  const grid = [0.25, 0.5, 0.75].map((f) => pad + f * (h - pad * 2));
  return (
    <div className="pm-line-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} className="pm-line" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {grid.map((g, i) => (
          <line key={i} x1={pad} x2={w - pad} y1={g} y2={g} stroke="#e8edf4" strokeWidth="1" />
        ))}
        <polygon points={area} fill={`url(#${id})`} />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="#fff" stroke={color} strokeWidth="2" />
        ))}
      </svg>
      <div className="pm-line-x">
        {labels.map((l, i) => (
          <span key={i} style={{ left: `${(x(i) / w) * 100}%` }}>{l}</span>
        ))}
      </div>
      <div className="pm-line-y">
        <span>{format ? format(max) : fmt(max)}</span>
        <span>{format ? format((max + min) / 2) : fmt((max + min) / 2)}</span>
        <span>{format ? format(min) : fmt(min)}</span>
      </div>
    </div>
  );
}

/* ═══════════════════ QR code ═══════════════════ */

export function QrCode({ value, size = 148 }: { value: string; size?: number }) {
  const grid = qrGrid(value);
  const N = grid.length;
  return (
    <svg width={size} height={size} className="pm-qr" viewBox={`0 0 ${N} ${N}`} aria-label="Payment QR code">
      {grid.map((row, i) =>
        row.map((on, j) => (on ? <rect key={`${i}-${j}`} x={j} y={i} width={1} height={1} /> : null))
      )}
    </svg>
  );
}

/* ═══════════════════ Stepper ═══════════════════ */

export function Stepper({ steps, current, labels }: { steps: number; current: number; labels: string[] }) {
  return (
    <div className="pm-stepper">
      {Array.from({ length: steps }, (_, i) => (
        <React.Fragment key={i}>
          <div className={cls("pm-step", i + 1 < current && "pm-step-done", i + 1 === current && "pm-step-on")}>
            <span className="pm-step-num">{i + 1 < current ? "✓" : i + 1}</span>
            <span className="pm-step-label">{labels[i]}</span>
          </div>
          {i < steps - 1 && <div className={cls("pm-step-line", i + 1 < current && "pm-step-line-done")} />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ═══════════════════ Pager ═══════════════════ */

export function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="pm-pager">
      <button className="btn pm-btn-ghost btn-sm" disabled={page === 1} onClick={() => onPage(page - 1)}>← Prev</button>
      <span className="pm-pager-info">
        Page {page} of {pages}
      </span>
      <button className="btn pm-btn-ghost btn-sm" disabled={page === pages} onClick={() => onPage(page + 1)}>Next →</button>
    </div>
  );
}

/* ═══════════════════ Channel icon ═══════════════════ */

export function ChannelIcon({ id, size = 20 }: { id: string; size?: number }) {
  const map: Record<string, ReactNode> = {
    "mpesa-paybill": <Hash size={size} />,
    "mpesa-till": <Smartphone size={size} />,
    pesalink: <Landmark size={size} />,
    card: <CreditCard size={size} />,
    qr: <ScanLine size={size} />,
    links: <Link2 size={size} />,
    ussd: <Radio size={size} />,
  };
  return <>{map[id] ?? <QrIcon size={size} />}</>;
}
