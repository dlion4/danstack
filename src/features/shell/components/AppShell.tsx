/* ============================================================================
 * AppShell.tsx — the reusable Paymo BAAS application shell.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy layout.html (1,627 LOC) — the whole standalone shell.
 *   This file owns layout composition + ALL interactive state and bridges the
 *   legacy vanilla-JS lifecycle (resize, Cmd/Ctrl+B, Escape, click-outside,
 *   dropdowns, aside panels, toasts) into React hooks. Child pages render into
 *   <Outlet /> and can call useShell() to fire toasts or open an aside panel.
 *
 * STACK ........: Vite + React + TypeScript + TanStack Router + TanStack Query
 * ARCHITECTURE .: Layout route at routes/_app.tsx renders <AppShell>, whose
 *                 <Outlet /> hosts the page route (Dashboard, ModulePage…).
 *
 * LEGACY BRIDGE MAP (vanilla JS -> React):
 *   applyLayout() class toggling ........ derived className strings per render
 *   toggleSidebar() / closeMobile() ..... onToggle / onCloseMobile handlers
 *   toggleDropdown() / closeAll() ....... openDropdown state + click-outside
 *   openAside() / closeAside() .......... activePanel state
 *   addToast() innerHTML + timeout ...... toasts state + leaving animation
 *   window resize listener .............. useEffect breakpoint sync
 *   keydown Ctrl/Cmd+B + Escape ......... useEffect global listener
 *   copyToClipboard() ................... navigator.clipboard w/ fallback
 *   initTooltips() (Bootstrap JS) ....... NOT needed — we use title= attributes
 * ========================================================================== */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import {
  cx,
  fetchShellContent,
  initialMockData,
} from '../data/shellData';
import type { AsideKind, ToastTone } from '../data/shellData';
import { ShellContext } from '../data/shellContext';
import type { ShellContextValue, ToastInput } from '../data/shellContext';
import styles from '../styles/shell.module.css';

import Sidebar from './Sidebar';
import TopNav from './TopNav';
import type { DropdownName } from './TopNav';
import RightAside from './RightAside';
import Toasts from './Toasts';
import type { ToastRecord } from './Toasts';

const s = styles as Record<string, string>;

let toastIdSeq = 0;

export default function AppShell() {
  /* ---------- TanStack Query: backend-ready shell content ---------- */
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['paymo-shell-content'],
    queryFn: fetchShellContent,
    staleTime: 5 * 60_000,
    retry: 1,
  });
  // Falls back to initialMockData while the API is unreachable so the shell
  // never breaks; the error banner surfaces that failure state.
  const content = apiData ?? initialMockData;

  /* ---------- layout state ---------- */
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 992 : true,
  );
  const [expanded, setExpanded] = useState<boolean>(() => isDesktop);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownName | null>(null);
  const [activePanel, setActivePanel] = useState<AsideKind | null>(null);
  const [twoFactorOn, setTwoFactorOn] = useState(content.security.twoFactorOn);
  const [sandboxOn, setSandboxOn] = useState(content.developers.sandboxOn);

  /* ---------- toasts ---------- */
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const leavingTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  /* ---------- active section from the URL (for nav highlighting) ---------- */
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const activeSection = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    // /app/<section> -> segments[1]; /app -> 'dashboard'
    return segments.length >= 2 ? segments[1] : 'dashboard';
  }, [pathname]);

  /* ======================================================================
   * TOAST ENGINE — replaces legacy addToast() innerHTML + 4.5s auto-dismiss.
   * ==================================================================== */
  const dismissToast = useCallback((id: number) => {
    // mark leaving for the out-animation, then remove after 300ms
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
    // legacy addToast() used a 4.5s auto-dismiss
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
   * ACCOUNT / LOGOUT / COPY actions
   * ==================================================================== */
  const handleSwitchAccount = useCallback(
    (_accountId: string, accountName: string) => {
      showToast(`Switched to ${accountName}`, 'info');
      closeAllDropdowns();
    },
    [showToast, closeAllDropdowns],
  );

  const handleCopyAccountId = useCallback(async () => {
    const text = content.accountId;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast('Account ID copied to clipboard', 'success');
    } catch {
      showToast('Could not copy account ID', 'danger');
    }
  }, [content.accountId, showToast]);

  const handleLogout = useCallback(() => {
    closeAllDropdowns();
    closeAside();
    showToast('Logged out successfully', 'success');
  }, [closeAllDropdowns, closeAside, showToast]);

  const handleToggleTwoFactor = useCallback(
    (next: boolean) => {
      setTwoFactorOn(next);
      showToast(next ? '2FA enabled' : '2FA disabled', 'info');
    },
    [showToast],
  );

  const handleToggleSandbox = useCallback(
    (next: boolean) => {
      setSandboxOn(next);
      showToast(next ? 'Sandbox mode enabled' : 'Live mode enabled', 'info');
    },
    [showToast],
  );

  const handleSearchSubmit = useCallback(
    (query: string) => {
      const q = query.trim();
      if (!q) return;
      showToast(`Searching for "${q}"…`, 'info');
    },
    [showToast],
  );

  /* ======================================================================
   * LEGACY BRIDGE: window resize -> keep isDesktop in sync (legacy did the
   * same breakpoint flip and reset expanded/mobileOpen on crossing 992px).
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
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isDesktop]);

  /* ======================================================================
   * LEGACY BRIDGE: global keydown — Ctrl/Cmd+B toggles the sidebar, Escape
   * closes dropdowns + aside + mobile drawer (exactly like the legacy page).
   * ==================================================================== */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      if (e.key === 'Escape') {
        closeAllDropdowns();
        closeAside();
        if (!isDesktop) closeMobile();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleSidebar, closeAllDropdowns, closeAside, closeMobile, isDesktop]);

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
    // defer to next tick so the opening click doesn't immediately close it
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
  const ctxValue: ShellContextValue = useMemo(
    () => ({ showToast, openAside }),
    [showToast, openAside],
  );

  const unreadCount = content.notifications.filter((n) => n.unread).length;

  /* ======================================================================
   * TEMPLATE
   * ==================================================================== */
  return (
    <ShellContext.Provider value={ctxValue}>
      <div className={s.shellRoot}>
        {/* ambient background */}
        <div className={s.gridOverlay} />
        <div className={cx(s.blob, s.blobMint)} />
        <div className={cx(s.blob, s.blobDeep)} />

        {/* ===== TanStack Query: loading spinner ===== */}
        {isLoading && (
          <div className={s.loadingOverlay} role="status" aria-live="polite">
            <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
            <span>Loading your workspace…</span>
          </div>
        )}

        {/* ============ SIDEBAR ============ */}
        <Sidebar
          content={content}
          isDesktop={isDesktop}
          expanded={expanded}
          mobileOpen={mobileOpen}
          activeSection={activeSection}
          onToggle={toggleSidebar}
          onCloseMobile={closeMobile}
          onOpenAside={openAside}
          onLogout={handleLogout}
        />

        {/* Mobile backdrop */}
        <div
          className={cx(s.sidebarBackdrop, !isDesktop && mobileOpen && s.show)}
          aria-hidden="true"
          onClick={closeMobile}
        />

        {/* ============ HEADER ============ */}
        <TopNav
          content={content}
          expanded={expanded && isDesktop}
          openDropdown={openDropdown}
          onToggleSidebar={toggleSidebar}
          onToggleDropdown={toggleDropdown}
          onOpenAside={openAside}
          onCopyAccountId={handleCopyAccountId}
          onSwitchAccount={handleSwitchAccount}
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
        <RightAside
          content={content}
          activePanel={activePanel}
          twoFactorOn={twoFactorOn}
          sandboxOn={sandboxOn}
          onClose={closeAside}
          onToggleTwoFactor={handleToggleTwoFactor}
          onToggleSandbox={handleToggleSandbox}
        />

        {/* ============ TOASTS ============ */}
        <Toasts toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ShellContext.Provider>
  );
}
