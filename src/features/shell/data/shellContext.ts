/* ============================================================================
 * shellContext.ts — bridge between the AppShell chrome and its child pages.
 * ----------------------------------------------------------------------------
 * The shell owns toast + right-aside state. Pages rendered inside <Outlet />
 * (Dashboard, ModulePage, future modules) can call useShell() to push a toast
 * or open the Security / Developers aside without prop-drilling.
 * ========================================================================== */
import { createContext, useContext } from 'react';
import type { AsideKind, ToastTone } from './shellData';

export interface ToastInput {
  message: string;
  type?: ToastTone;
  title?: string;
}

export interface ShellContextValue {
  /** Push a toast. Mirrors the legacy addToast() vanilla helper. */
  showToast: (toast: ToastInput | string) => void;
  /** Open the Security or Developers right-aside panel. */
  openAside: (kind: AsideKind) => void;
}

export const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error('useShell() must be used inside <AppShell> (ShellContext provider).');
  }
  return ctx;
}
