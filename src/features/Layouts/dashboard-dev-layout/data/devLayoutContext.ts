/* ============================================================================
 * devLayoutContext.ts — bridge between the DevShell chrome and its child pages.
 * ----------------------------------------------------------------------------
 * The shell owns toast + right-aside state. Pages rendered inside <Outlet />
 * can call useDevShell() to push a toast or open a panel — same contract as
 * the cards layout's useCardsShell().
 * ========================================================================== */
import { createContext, useContext } from 'react';
import type { AsideKind, ToastTone } from './devLayoutData';

export interface ToastInput {
  message: string;
  type?: ToastTone;
  title?: string;
}

export interface DevShellContextValue {
  showToast: (toast: ToastInput | string) => void;
  openAside: (kind: AsideKind) => void;
}

export const DevShellContext = createContext<DevShellContextValue | null>(null);

export function useDevShell(): DevShellContextValue {
  const ctx = useContext(DevShellContext);
  if (!ctx) {
    throw new Error('useDevShell() must be used inside <DevShell> (DevShellContext provider).');
  }
  return ctx;
}
