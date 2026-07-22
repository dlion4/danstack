/* ============================================================================
 * DevToasts.tsx — toast stack for the Paymo BAAS Developer Layout.
 * ----------------------------------------------------------------------------
 * Pure presentational: the shell owns the toast list + timers (mirrors the
 * Angular addToast/removeToast 4.5s auto-dismiss) and passes them down.
 * ========================================================================== */
import type { ToastTone } from '../data/devLayoutData';
import { cx } from '../data/devLayoutData';
import styles from '../styles/devLayout.module.css';

const s = styles as Record<string, string>;

export interface DevToastRecord {
  id: number;
  message: string;
  title: string;
  type: ToastTone;
  leaving?: boolean;
}

const TONE: Record<ToastTone, { bg: string; color: string; icon: string }> = {
  success: { bg: 'rgba(16,185,129,0.1)', color: 'var(--paymo-accent)', icon: 'bi-check-lg' },
  danger: { bg: 'rgba(239,68,68,0.1)', color: 'var(--paymo-danger)', icon: 'bi-x-lg' },
  warning: { bg: 'rgba(245,158,11,0.1)', color: 'var(--paymo-warning)', icon: 'bi-exclamation-triangle' },
  info: { bg: 'rgba(91,77,219,0.1)', color: 'var(--paymo-primary)', icon: 'bi-bell' },
};

interface DevToastsProps {
  toasts: DevToastRecord[];
  onDismiss: (id: number) => void;
}

export default function DevToasts({ toasts, onDismiss }: DevToastsProps) {
  if (toasts.length === 0) return null;
  return (
    <div className={s['toast-container-custom']}>
      {toasts.map((t) => {
        const tone = TONE[t.type] ?? TONE.info;
        return (
          <div key={t.id} className={cx(s['paymo-toast'], t.leaving && s.leaving)}>
            <div className={s['toast-ic']} style={{ background: tone.bg, color: tone.color }}>
              <i className={`bi ${tone.icon}`} />
            </div>
            <div className="flex-grow-1">
              <div className="fw-semibold" style={{ fontSize: '0.82rem' }}>{t.title}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{t.message}</div>
            </div>
            <button
              type="button"
              className="btn btn-link text-muted p-0 ms-2"
              style={{ fontSize: '0.8rem' }}
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
