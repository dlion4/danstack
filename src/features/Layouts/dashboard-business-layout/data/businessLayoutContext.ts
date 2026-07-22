/* ============================================================================
 * businessLayoutContext.ts — bridge between the BusinessShell chrome and pages.
 * ----------------------------------------------------------------------------
 * The shell owns toast + right-aside state. Pages rendered inside <Outlet />
 * can call useBusinessShell() to push a toast or open a panel — same contract
 * as the cards layout useCardsShell() and the dev layout useDevShell().
 * ========================================================================== */
import { createContext, useContext } from 'react';
import type { AsideKind, ToastTone } from './businessLayoutData';

export interface ToastInput {
  message: string;
  type?: ToastTone;
  title?: string;
}

export interface BusinessShellContextValue {
  showToast: (toast: ToastInput | string) => void;
  openAside: (kind: AsideKind) => void;
}

export const BusinessShellContext = createContext<BusinessShellContextValue | null>(null);

export function useBusinessShell(): BusinessShellContextValue {
  const ctx = useContext(BusinessShellContext);
  if (!ctx) {
    throw new Error('useBusinessShell() must be used inside <BusinessShell> (BusinessShellContext provider).');
  }
  return ctx;
}
