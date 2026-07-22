/* ============================================================================
 * utilityLayoutContext.ts — bridge between the UtilityShell chrome and pages.
 * ----------------------------------------------------------------------------
 * The shell owns toast + right-aside state. Pages rendered inside <Outlet />
 * can call useUtilityShell() to push a toast or open a panel — same contract
 * as useCardsShell() / useDevShell() / useBusinessShell().
 * ========================================================================== */
import { createContext, useContext } from 'react';
import type { AsideKind, ToastTone } from './utilityLayoutData';

export interface ToastInput {
  message: string;
  type?: ToastTone;
  title?: string;
}

export interface UtilityShellContextValue {
  showToast: (toast: ToastInput | string) => void;
  openAside: (kind: AsideKind) => void;
}

export const UtilityShellContext = createContext<UtilityShellContextValue | null>(null);

export function useUtilityShell(): UtilityShellContextValue {
  const ctx = useContext(UtilityShellContext);
  if (!ctx) {
    throw new Error('useUtilityShell() must be used inside <UtilityShell> (UtilityShellContext provider).');
  }
  return ctx;
}
