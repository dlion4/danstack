/* ============================================================================
 * cardsLayoutContext.ts — bridge between the CardsShell chrome and its child pages.
 * ----------------------------------------------------------------------------
 * The shell owns toast + right-aside state. Pages rendered inside <Outlet />
 * can call useCardsShell() to push a toast or open a panel.
 * ========================================================================== */
import { createContext, useContext } from 'react';
import type { AsideKind, ToastTone } from './cardsLayoutData';

export interface ToastInput {
  message: string;
  type?: ToastTone;
  title?: string;
}

export interface CardsShellContextValue {
  showToast: (toast: ToastInput | string) => void;
  openAside: (kind: AsideKind) => void;
}

export const CardsShellContext = createContext<CardsShellContextValue | null>(null);

export function useCardsShell(): CardsShellContextValue {
  const ctx = useContext(CardsShellContext);
  if (!ctx) {
    throw new Error('useCardsShell() must be used inside <CardsShell> (CardsShellContext provider).');
  }
  return ctx;
}
