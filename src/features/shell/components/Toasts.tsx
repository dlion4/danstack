/* ============================================================================
 * Toasts.tsx — toast stack for the Paymo BAAS shell.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy layout.html -> #toastContainer + addToast() that built
 *   .paymo-toast nodes via innerHTML with a 4.5s auto-dismiss + manual close.
 * LEGACY BRIDGE: the toast list is now React state in AppShell; this file is
 *   purely presentational. The tone -> icon/color map is kept verbatim.
 * ========================================================================== */
import type { ToastTone } from '../data/shellData';
import { cx } from '../data/shellData';
import styles from '../styles/shell.module.css';

const s = styles as Record<string, string>;

export interface ToastRecord {
  id: number;
  message: string;
  title: string;
  type: ToastTone;
  leaving?: boolean;
}

const TONE: Record<ToastTone, { bg: string; color: string; icon: string; title: string }> = {
  success: { bg: 'rgba(46,230,160,0.14)', color: '#2ee6a0', icon: 'bi-check-lg', title: 'Success' },
  danger: { bg: 'rgba(248,113,113,0.14)', color: '#f87171', icon: 'bi-x-lg', title: 'Error' },
  warning: { bg: 'rgba(251,191,36,0.14)', color: '#fbbf24', icon: 'bi-exclamation-triangle', title: 'Warning' },
  info: { bg: 'rgba(167,139,250,0.14)', color: '#a78bfa', icon: 'bi-bell', title: 'Info' },
};

interface ToastsProps {
  toasts: ToastRecord[];
  onDismiss: (id: number) => void;
}

export default function Toasts({ toasts, onDismiss }: ToastsProps) {
  return (
    <div className={s.toastContainer} aria-live="polite" aria-atomic="false">
      {toasts.map((t) => {
        const tone = TONE[t.type];
        return (
          <div className={cx(s.paymoToast, t.leaving && s.leaving)} key={t.id} role="status">
            <div className={s.toastIc} style={{ background: tone.bg, color: tone.color }}>
              <i className={`bi ${tone.icon}`} />
            </div>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className={s.toastTitle}>{t.title || tone.title}</div>
              <div className={s.toastMsg}>{t.message}</div>
            </div>
            <button
              type="button"
              className={s.toastClose}
              aria-label="Dismiss notification"
              onClick={() => onDismiss(t.id)}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
