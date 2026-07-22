/* ============================================================================
 * CardsShell.tsx — the reusable Paymo BAAS Cards Layout shell.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-cards-layout/*.ts + *.html
 *   This file owns layout composition + ALL interactive state and bridges the
 *   legacy Angular lifecycle (resize, Escape, click-outside, dropdowns,
 *   aside panels, toasts) into React hooks. Child pages render into
 *   <Outlet /> and can call useCardsShell() to fire toasts or open an aside panel.
 *
 * STACK ........: Vite + React + TypeScript + TanStack Router + TanStack Query
 * ARCHITECTURE .: Layout route renders <CardsShell>, whose <Outlet /> hosts
 *                 the page route (CardsHome, CardsModulePage…).
 *
 * LEGACY BRIDGE MAP (Angular -> React):
 *   sidebarExpanded class toggling .... derived className strings per render
 *   toggleSidebar() / closeMobile() ... onToggle / onCloseMobile handlers
 *   toggleDropdown() / closeAll() ...... openDropdown state + click-outside
 *   openAside() / closeAside() ......... activePanel state
 *   addToast() + setTimeout ........... toasts state + leaving animation
 *   window resize listener ............. useEffect breakpoint sync
 *   keydown Escape .................... useEffect global listener
 *   HostListener document:click ........ useEffect click-outside
 * ========================================================================== */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import {
  cx,
  fetchCardsLayoutContent,
  initialMockData,
} from '../data/cardsLayoutData';
import type { AsideKind, ToastTone } from '../data/cardsLayoutData';
import { CardsShellContext } from '../data/cardsLayoutContext';
import type { CardsShellContextValue, ToastInput } from '../data/cardsLayoutContext';
import styles from '../styles/cardsLayout.module.css';

import CardsSidebar from './CardsSidebar';
import CardsHeader from './CardsHeader';
import type { DropdownName } from './CardsHeader';
import CardsAside from './CardsAside';
import CardsToasts from './CardsToasts';
import type { ToastRecord } from './CardsToasts';

const s = styles as Record<string, string>;

let toastIdSeq = 0;

export default function CardsShell() {
  /* ---------- TanStack Query: backend-ready cards layout content ---------- */
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['cards-layout-content'],
    queryFn: fetchCardsLayoutContent,
    staleTime: 5 * 60_000,
    retry: 1,
  });
  const content = apiData ?? initialMockData;

  /* ---------- layout state ---------- */
  // SSR-safe defaults: the server has no `window`, so we render the desktop
  // (expanded) layout on both the server AND the first client paint to avoid a
  // hydration mismatch, then sync to the real viewport in useEffect on mount.
  const [isDesktop, setIsDesktop] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownName | null>(null);
  const [activePanel, setActivePanel] = useState<AsideKind | null>(null);

  /* ---------- toasts ---------- */
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const leavingTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  /* ---------- active section from the URL (for nav highlighting) ---------- */
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const activeSection = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.length >= 3 ? segments[2] : 'card-overview';
  }, [pathname]);

  /* ======================================================================
   * TOAST ENGINE — replaces Angular addToast() + 4.5s auto-dismiss.
   * ==================================================================== */
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      leavingTimersRef.current.delete(id);
    }, 300);
    leavingTimersRef.current.set(id, timer);
  }, []);

  const showToast = useCallback((toast: ToastInput | string, tone?: ToastTone) => {
    const input: ToastInput = typeof toast === 'string' ? { message: toast } : toast;
    const id = (toastIdSeq += 1);
    const type: ToastTone = input.type ?? tone ?? 'info';
    const record: ToastRecord = {
      id,
      message: input.message,
      title: input.title ?? '',
      type,
    };
    setToasts((prev) => [...prev, record]);
    setTimeout(() => dismissToast(id), 4500);
  }, [dismissToast]);

  useEffect(
    () => () => {
      leavingTimersRef.current.forEach(clearTimeout);
      leavingTimersRef.current.clear();
    },
    [],
  );

  /* ======================================================================
   * SIDEBAR
   * ==================================================================== */
  const toggleSidebar = useCallback(() => {
    if (isDesktop) setExpanded((v) => !v);
    else setMobileOpen((v) => !v);
  }, [isDesktop]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  /* ======================================================================
   * DROPDOWNS — toggle / closeAll, plus click-outside + Escape.
   * ==================================================================== */
  const toggleDropdown = useCallback((name: DropdownName) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }, []);
  const closeAllDropdowns = useCallback(() => setOpenDropdown(null), []);

  /* ======================================================================
   * RIGHT ASIDE
   * ==================================================================== */
  const openAside = useCallback((kind: AsideKind) => {
    setActivePanel(kind);
    closeAllDropdowns();
  }, [closeAllDropdowns]);
  const closeAside = useCallback(() => setActivePanel(null), []);

  /* ======================================================================
   * ACTIONS
   * ==================================================================== */
  const handleLogout = useCallback(() => {
    closeAllDropdowns();
    closeAside();
    showToast('Logged out successfully', 'success');
  }, [closeAllDropdowns, closeAside, showToast]);

  const handleSearchSubmit = useCallback(
    (query: string) => {
      const q = query.trim();
      if (!q) return;
      showToast(`Searching for "${q}"…`, 'info');
    },
    [showToast],
  );

  /* ======================================================================
   * LEGACY BRIDGE: window resize -> keep isDesktop in sync.
   * ==================================================================== */
  useEffect(() => {
    const onResize = () => {
      const desktop = window.innerWidth >= 992;
      if (desktop !== isDesktop) {
        setIsDesktop(desktop);
        if (desktop) setMobileOpen(false);
        else setExpanded(false);
      }
    };
    onResize(); // sync the SSR-safe default to the real viewport on mount
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isDesktop]);

  /* ======================================================================
   * LEGACY BRIDGE: global keydown — Escape closes dropdowns + aside + mobile.
   * ==================================================================== */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
        closeAside();
        if (!isDesktop) closeMobile();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeAllDropdowns, closeAside, closeMobile, isDesktop]);

  /* ======================================================================
   * LEGACY BRIDGE: click-outside closes any open dropdown.
   * ==================================================================== */
  useEffect(() => {
    if (!openDropdown) return undefined;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && !target.closest(`.${s.dropdownWrap}`)) {
        closeAllDropdowns();
      }
    };
    const id = setTimeout(() => document.addEventListener('click', onDocClick), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('click', onDocClick);
    };
  }, [openDropdown, closeAllDropdowns, s.dropdownWrap]);

  /* ---------- body scroll lock when mobile drawer or aside is open ---------- */
  useEffect(() => {
    const lock = (!isDesktop && mobileOpen) || activePanel !== null;
    document.body.style.overflow = lock ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isDesktop, mobileOpen, activePanel]);

  /* ---------- context value for child pages ---------- */
  const ctxValue: CardsShellContextValue = useMemo(
    () => ({ showToast, openAside }),
    [showToast, openAside],
  );

  const unreadCount = content.notifications.filter((n) => n.unread).length;

  /* ======================================================================
   * TEMPLATE
   * ==================================================================== */
  return (
    <CardsShellContext.Provider value={ctxValue}>
      <div className={s.cardsRoot}>
        {/* ===== TanStack Query: loading spinner ===== */}
        {isLoading && (
          <div className={s.loadingOverlay} role="status" aria-live="polite">
            <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
            <span>Loading your card workspace…</span>
          </div>
        )}

        {/* ============ SIDEBAR ============ */}
        <CardsSidebar
          content={content}
          isDesktop={isDesktop}
          expanded={expanded}
          mobileOpen={mobileOpen}
          activeSection={activeSection}
          onToggle={toggleSidebar}
          onCloseMobile={closeMobile}
          onLogout={handleLogout}
        />

        {/* Mobile backdrop */}
        <div
          className={cx(s.sidebarBackdrop, !isDesktop && mobileOpen && s.show)}
          aria-hidden="true"
          onClick={closeMobile}
        />

        {/* ============ HEADER ============ */}
        <CardsHeader
          content={content}
          expanded={expanded && isDesktop}
          openDropdown={openDropdown}
          onToggleSidebar={toggleSidebar}
          onToggleDropdown={toggleDropdown}
          onOpenAside={openAside}
          onLogout={handleLogout}
          onSearchSubmit={handleSearchSubmit}
          unreadCount={unreadCount}
        />

        {/* ============ MAIN (child route renders here) ============ */}
        <main className={cx(s.mainContent, expanded && isDesktop && s.sidebarExpanded)}>
          <Outlet />
        </main>

        {/* ============ RIGHT ASIDE ============ */}
        <div
          className={cx(s.asideBackdrop, activePanel && s.show)}
          aria-hidden="true"
          onClick={closeAside}
        />
        <CardsAside
          content={content}
          activePanel={activePanel}
          onClose={closeAside}
          onToast={showToast}
        />

        {/* ============ TOASTS ============ */}
        <CardsToasts toasts={toasts} onDismiss={dismissToast} />
      </div>
    </CardsShellContext.Provider>
  );
}
