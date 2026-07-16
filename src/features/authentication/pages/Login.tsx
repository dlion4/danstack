/* ============================================================================
 * Login.tsx — Paymo BAAS Sign In (Emerald Glass Edition)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy page51.html (1403 LOC) — vanilla JS + Bootstrap CSS
 * STACK ........: Vite + React 18 + TypeScript + TanStack Query v5 + Bootstrap 5
 * ARCHITECTURE .: ONE component file holds all layout + logic (per spec).
 *                 Styles live in ../styles/login.module.css (CSS Module).
 *
 * EVERY INTERACTION FROM THE LEGACY PAGE IS MAINTAINED:
 *   Passkey, Password, PIN keypad (+keyboard), Magic Link (+countdown),
 *   Social SSO, device fingerprint chip, smart-default tab, contextual banner,
 *   toasts, language selector, switch-account / cookie / help / recovery links.
 *
 * LEGACY BRIDGE MAP (vanilla JS -> React):
 *   #toast DOM manipulation ......... toast state + rendered overlay
 *   .auth-tab click handlers ........ activeTab state (+localStorage persist)
 *   smartDefault() IIFE ............. useEffect mount bridge
 *   deviceFp() IIFE ................. useEffect -> deviceChip state
 *   passkey flow / .innerHTML ....... passkeyStatus state machine + timeout refs
 *   checkPwForm() DOM toggling ...... derived validity state from controlled inputs
 *   PIN .pin-dot innerHTML .......... pin state -> derived dot rendering; keydown
 *                                     listener bridged in a ref-guarded useEffect
 *   magic countdown setInterval ..... countdown state + interval in ref (cleaned)
 *   social-btn innerHTML ............ socialStatus record keyed by provider
 * ========================================================================== */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import styles from '../styles/login.module.css';

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */
type ToastType = 'info' | 'ok' | 'warn' | 'err';
type AuthTabId = 'passkey' | 'password' | 'pin' | 'magic' | 'social';
type PasskeyStatus = 'idle' | 'scanning' | 'verified';
type SubmitStatus = 'idle' | 'verifying' | 'mfa';
type SocialStatus = 'idle' | 'connecting' | 'connected';

interface FeatureCard { icon: string; title: string; sub: string; tone: 'featTone1' | 'featTone2' | 'featTone3'; }
interface ComplianceBadge { icon: string; label: string; }
interface AuthTab { id: AuthTabId; label: string; icon: string; recommended?: boolean; }
interface PinKey { key: string; label?: string; icon?: string; action?: boolean; title?: string; }
interface SocialProvider { id: string; icon: string; color?: string; }
interface SecItem { icon: string; label: string; }
interface FootLink { id: string; label: string; action: 'link' | 'cookie'; }

/* --------------------------------------------------------------------------
 * 1. initialMockData — every repeating/hardcoded block extracted from legacy
 *    HTML. GET /api/auth-config should return this same shape.
 * ------------------------------------------------------------------------ */
const initialMockData = {
  leftPanel: {
    pill: 'Secured by Paymo Shield',
    titleTop: 'One login.',
    titleAccent: 'Your entire financial world.',
    copy: 'Sign in once to access payments, banking, FX, treasury, and compliance — all from a single secure identity.',
    features: [
      { icon: 'bi-fingerprint', title: 'Passkey-first security', sub: 'Sign in with Face ID, Touch ID, or Windows Hello', tone: 'featTone1' },
      { icon: 'bi-shield-lock', title: 'Zero-knowledge architecture', sub: 'We never store your passwords in plain text', tone: 'featTone2' },
      { icon: 'bi-graph-up-arrow', title: 'Risk-based authentication', sub: 'Step-up challenges only when something looks unusual', tone: 'featTone3' },
    ] as FeatureCard[],
    compliance: [
      { icon: 'bi-shield-check', label: 'PCI DSS L1' },
      { icon: 'bi-patch-check', label: 'SOC 2 Type II' },
      { icon: 'bi-award', label: 'ISO 27001' },
    ] as ComplianceBadge[],
  },

  tabs: [
    { id: 'passkey', label: 'Passkey', icon: 'bi-fingerprint', recommended: true },
    { id: 'password', label: 'Password', icon: 'bi-lock' },
    { id: 'pin', label: 'PIN', icon: 'bi-grid-3x3-gap' },
    { id: 'magic', label: 'Magic Link', icon: 'bi-magic' },
    { id: 'social', label: 'Social', icon: 'bi-people' },
  ] as AuthTab[],

  pinDigits: [0, 1, 2, 3, 4, 5] as number[],
  pinKeys: [
    { key: '1', label: '1' }, { key: '2', label: '2' }, { key: '3', label: '3' },
    { key: '4', label: '4' }, { key: '5', label: '5' }, { key: '6', label: '6' },
    { key: '7', label: '7' }, { key: '8', label: '8' }, { key: '9', label: '9' },
    { key: 'bio', icon: 'bi-person-bounding-box', action: true, title: 'Biometric' },
    { key: '0', label: '0' },
    { key: 'del', icon: 'bi-backspace', action: true, title: 'Delete' },
  ] as PinKey[],

  socialProviders: [
    { id: 'Google', icon: 'bi-google', color: '#ea4335' },
    { id: 'Apple', icon: 'bi-apple' },
    { id: 'Microsoft', icon: 'bi-microsoft', color: '#00a4ef' },
    { id: 'LinkedIn', icon: 'bi-linkedin', color: '#0a66c2' },
  ] as SocialProvider[],

  secStrip: [
    { icon: 'bi-lock-fill', label: '256-bit encryption' },
    { icon: 'bi-eye-slash-fill', label: 'Zero-knowledge' },
    { icon: 'bi-shield-fill-check', label: 'Fraud monitored' },
    { icon: 'bi-patch-check-fill', label: 'PCI DSS L1' },
  ] as SecItem[],

  auxLinks: [
    { id: 'recovery', label: 'Forgot password/PIN' },
    { id: 'help', label: 'Need help?' },
    { id: 'switch', label: 'Switch account' },
  ] as const,

  footLinks: [
    { id: 'privacy', label: 'Privacy', action: 'link' },
    { id: 'terms', label: 'Terms', action: 'link' },
    { id: 'cookies', label: 'Cookie Settings', action: 'cookie' },
    { id: 'accessibility', label: 'Accessibility', action: 'link' },
  ] as FootLink[],

  languages: ['🇬🇧 EN', '🇫🇷 FR', '🇵🇹 PT', '🇸🇦 AR', '🇰🇪 SW'],

  toastIcons: {
    info: 'bi-info-circle',
    ok: 'bi-check-circle-fill',
    warn: 'bi-exclamation-triangle-fill',
    err: 'bi-x-circle-fill',
  } as Record<ToastType, string>,

  toastColors: {
    info: '#a5f3fc',
    ok: '#86efac',
    warn: '#fcd34d',
    err: '#fca5a5',
  } as Record<ToastType, string>,

  copyright: '© 2026 Paymo Financial Technologies Ltd.',
};

/* --------------------------------------------------------------------------
 * 2. API LAYER — swap URL when the backend is ready.
 * ------------------------------------------------------------------------ */
async function fetchAuthConfig() {
  const response = await fetch('/api/auth-config', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Auth config API responded HTTP ${response.status}`);
  return response.json() as Promise<typeof initialMockData>;
}

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */
const s = styles as Record<string, string>;
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^\+?\d{7,15}$/;
function validIdentifier(value: string): boolean {
  return EMAIL_RE.test(value) || PHONE_RE.test(value.replace(/\s/g, ''));
}

/* --------------------------------------------------------------------------
 * 3. COMPONENT
 * ------------------------------------------------------------------------ */
export default function Login() {
  /* ---------- TanStack Query ---------- */
  const { data: apiData, error, isLoading } = useQuery({
    queryKey: ['paymo-auth-config'],
    queryFn: fetchAuthConfig,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  // Falls back to initialMockData while the API is unreachable so the page
  // never breaks; the error banner below surfaces the failure state.
  const content = apiData ?? initialMockData;

  /* ---------- state (replaces legacy globals/getElementById) ---------- */
  const [toast, setToast] = useState<{ msg: string; type: ToastType; visible: boolean }>({ msg: '', type: 'info', visible: false });
  const [activeTab, setActiveTab] = useState<AuthTabId>('passkey');
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const [showContextBanner, setShowContextBanner] = useState(false);
  const [deviceChip, setDeviceChip] = useState('Detecting your device…');
  const [passkeySupported] = useState<boolean>(() => typeof window !== 'undefined' && !!window.PublicKeyCredential);

  const [passkeyStatus, setPasskeyStatus] = useState<PasskeyStatus>('idle');

  const [pwEmail, setPwEmail] = useState('');
  const [pwPass, setPwPass] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [pwSubmitStatus, setPwSubmitStatus] = useState<SubmitStatus>('idle');

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [magicEmail, setMagicEmail] = useState('');
  const [magicSentTo, setMagicSentTo] = useState<string | null>(null);
  const [magicSending, setMagicSending] = useState(false);
  const [magicCountdown, setMagicCountdown] = useState(0);

  const [socialStatus, setSocialStatus] = useState<Record<string, SocialStatus>>({});

  /* ---------- refs (isolated sandbox for legacy timer/DOM behavior) ---------- */
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flowTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const magicTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const pinRef = useRef(''); // mirrors `pin` so the keydown listener stays stable
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  /* ---------- toast (replaces the legacy #toast DOM block) ---------- */
  const showToast = useCallback((msg: string, type: ToastType = 'info') => {
    setToast({ msg, type, visible: true });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 3200);
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    flowTimersRef.current.push(id);
    return id;
  }, []);

  /* ---------- active tab (legacy switchTab) ---------- */
  const switchTab = useCallback((tab: AuthTabId) => {
    setActiveTab(tab);
    try { localStorage.setItem('paymo_last_auth', tab); } catch { /* private mode */ }
  }, []);

  /* ==========================================================================
   * LEGACY BRIDGE — mount block (smart defaults + device fingerprint + fonts).
   * Mirrors the legacy IIFEs inside one isolated useEffect with cleanup.
   * ======================================================================= */
  useEffect(() => {
    // Fonts load app-wide via src/routes/__root.tsx head.links — nothing to inject.

    /* LEGACY BRIDGE: smartDefault() — last tab, mobile PIN default, name greeting,
       contextual banner via #redirect hash. */
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    let last: string | null = null;
    let name: string | null = null;
    try { last = localStorage.getItem('paymo_last_auth'); } catch { /* noop */ }
    try { name = localStorage.getItem('paymo_user_name'); } catch { /* noop */ }
    if (name) setWelcomeName(name);
    const validTabs: AuthTabId[] = ['passkey', 'password', 'pin', 'magic', 'social'];
    if (last && validTabs.includes(last as AuthTabId)) {
      setActiveTab(last as AuthTabId);
    } else if (isMobile) {
      setActiveTab('pin');
    }
    if (window.location.hash.includes('redirect')) setShowContextBanner(true);

    /* LEGACY BRIDGE: deviceFp() — UA sniffing into the device chip. */
    const ua = navigator.userAgent;
    let browser = 'your browser';
    let os = 'your device';
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/Safari/i.test(ua)) browser = 'Safari';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad/i.test(ua)) os = 'iOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    setDeviceChip(`${browser} on ${os} · Lagos, NG`);

    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (magicTimerRef.current) clearInterval(magicTimerRef.current);
      flowTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  /* keep a mirrored ref for the keyboard PIN listener (legacy document keydown) */
  useEffect(() => { pinRef.current = pin; }, [pin]);

  /* ==========================================================================
   * PASSKEY — simulated WebAuthn flow (timeouts bridged through `later`).
   * ======================================================================= */
  const handlePasskey = useCallback(() => {
    if (passkeyStatus === 'scanning') return;
    setPasskeyStatus('scanning');
    showToast('Touch your sensor or follow the device prompt…', 'info');
    later(() => {
      setPasskeyStatus('verified');
      showToast('Passkey verified! Redirecting…', 'ok');
      try { localStorage.setItem('paymo_user_name', 'Amara'); } catch { /* noop */ }
      setWelcomeName('Amara');
      later(() => {
        showToast('Welcome back, Amara 👋', 'ok');
        setPasskeyStatus('idle');
      }, 1800);
    }, 2200);
  }, [passkeyStatus, showToast, later]);

  /* ==========================================================================
   * PASSWORD — controlled inputs replace checkPwForm()'s DOM class toggling.
   * ======================================================================= */
  const emailOk = pwEmail.length > 0 ? validIdentifier(pwEmail.trim()) : null;
  const passOk = pwPass.length >= 6;
  const pwSubmitReady = emailOk === true && passOk;

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!pwSubmitReady || pwSubmitStatus !== 'idle') return;
    setPwSubmitStatus('verifying');
    later(() => {
      setPwSubmitStatus('mfa');
      showToast('Password verified. Redirecting to MFA challenge…', 'ok');
      try { localStorage.setItem('paymo_user_name', pwEmail.split('@')[0]); } catch { /* noop */ }
      setWelcomeName(pwEmail.split('@')[0]);
      later(() => setPwSubmitStatus('idle'), 2000);
    }, 1600);
  };

  /* ==========================================================================
   * PIN — 6 dots, keypad, keyboard support, shake-on-wrong (000000 = wrong).
   * ======================================================================= */
  const resetPin = useCallback(() => setPin(''), []);

  const verifyPin = useCallback((value: string) => {
    later(() => {
      if (value === '000000') {
        setPinError(true);
        showToast('Incorrect PIN. Try again.', 'err');
        later(() => { setPinError(false); resetPin(); }, 500);
      } else {
        showToast('PIN verified! Signing you in…', 'ok');
        try { localStorage.setItem('paymo_user_name', 'Amara'); } catch { /* noop */ }
        setWelcomeName('Amara');
        later(resetPin, 1400);
      }
    }, 300);
  }, [later, showToast, resetPin]);

  const pinInput = useCallback((key: string) => {
    if (key === 'del') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (key === 'bio') {
      handlePinBio();
      return;
    }
    setPin((p) => {
      if (p.length >= 6) return p;
      const next = p + key;
      if (next.length === 6) verifyPin(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyPin]);

  const handlePinBio = useCallback(() => {
    if (!passkeySupported) {
      showToast('Biometric not available on this device.', 'warn');
      return;
    }
    showToast('Authenticating with biometrics…', 'info');
    later(() => showToast('Biometric verified! Signing in…', 'ok'), 1500);
  }, [passkeySupported, showToast, later]);

  /* LEGACY BRIDGE: document-level keydown for the PIN pad. */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeTabRef.current !== 'pin') return;
      if (/^[0-9]$/.test(e.key)) pinInput(e.key);
      else if (e.key === 'Backspace') pinInput('del');
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [pinInput]);

  /* ==========================================================================
   * MAGIC LINK — validation, send flow, 60s resend countdown.
   * ======================================================================= */
  const magicOk = magicEmail.length > 0 ? EMAIL_RE.test(magicEmail.trim()) : null;

  const startMagicCountdown = useCallback(() => {
    setMagicCountdown(60);
    if (magicTimerRef.current) clearInterval(magicTimerRef.current);
    magicTimerRef.current = setInterval(() => {
      setMagicCountdown((c) => {
        if (c <= 1) {
          if (magicTimerRef.current) clearInterval(magicTimerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  const handleMagicSend = () => {
    if (magicOk !== true || magicSending) return;
    setMagicSending(true);
    later(() => {
      setMagicSentTo(magicEmail);
      setMagicSending(false);
      showToast('Magic link sent to your inbox!', 'ok');
      startMagicCountdown();
    }, 1400);
  };

  const handleMagicResend = () => {
    if (magicCountdown > 0) return;
    showToast('New magic link sent!', 'ok');
    startMagicCountdown();
  };

  const handleMagicBack = () => {
    if (magicTimerRef.current) clearInterval(magicTimerRef.current);
    setMagicCountdown(0);
    setMagicSentTo(null);
  };

  /* ==========================================================================
   * SOCIAL — per-provider connecting state (replaces innerHTML swaps).
   * ======================================================================= */
  const handleSocial = (provider: SocialProvider) => {
    if (socialStatus[provider.id] === 'connecting') return;
    setSocialStatus((prev) => ({ ...prev, [provider.id]: 'connecting' }));
    showToast(`Opening ${provider.id} secure sign-in…`, 'info');
    later(() => {
      showToast(`${provider.id} account verified! Signing in…`, 'ok');
      setSocialStatus((prev) => ({ ...prev, [provider.id]: 'connected' }));
      later(() => {
        setSocialStatus((prev) => ({ ...prev, [provider.id]: 'idle' }));
      }, 2000);
    }, 1800);
  };

  /* ==========================================================================
   * AUXILIARY links — recovery/register, help, switch account, cookies, lang.
   * ======================================================================= */
  const handleGoto = (dest: 'register' | 'recovery') => {
    const map = { register: 'Create Account', recovery: 'Password / PIN Recovery' };
    showToast(`Redirecting to ${map[dest]} page…`, 'info');
  };

  const handleSwitchAccount = () => {
    try { localStorage.removeItem('paymo_user_name'); } catch { /* noop */ }
    setWelcomeName(null);
    showToast('Remembered account cleared. Sign in with a different account.', 'ok');
  };

  /* --------------------------------------------------------------------------
   * Derived render helpers
   * ------------------------------------------------------------------------ */
  const renderPwHint = () => {
    if (!pwEmail.length) return null;
    return emailOk ? (
      <div className={cx(s.fieldHint, s.ok)}><i className="bi bi-check-circle" /> Looks good</div>
    ) : (
      <div className={cx(s.fieldHint, s.err)}><i className="bi bi-exclamation-circle" /> Enter a valid email or phone</div>
    );
  };

  const renderMagicHint = () => {
    if (!magicEmail.length) return null;
    return magicOk ? (
      <div className={cx(s.fieldHint, s.ok)}><i className="bi bi-check-circle" /> Valid email</div>
    ) : (
      <div className={cx(s.fieldHint, s.err)}><i className="bi bi-exclamation-circle" /> Enter a valid email</div>
    );
  };

  const passkeyButtonContent: Record<PasskeyStatus, ReactNode> = {
    idle: (<><i className="bi bi-fingerprint me-1" /> Sign in with Passkey</>),
    scanning: (<><span className={cx(s.spinIc, 'spinner-border spinner-border-sm me-2')} /> Waiting for authenticator…</>),
    verified: (<><i className="bi bi-check-lg me-1" /> Verified</>),
  };

  const pwSubmitContent: Record<SubmitStatus, ReactNode> = {
    idle: 'Sign in',
    verifying: (<><span className={cx(s.spinIc, 'spinner-border spinner-border-sm me-2')} /> Verifying…</>),
    mfa: (<><i className="bi bi-shield-lock me-1" /> 2FA required</>),
  };

  const mobileLogoStyle: CSSProperties = { gap: '0.5rem' };

  /* --------------------------------------------------------------------------
   * 4. TEMPLATE (JSX)
   * ------------------------------------------------------------------------ */
  return (
    <div className={s.authPage}>
      {/* ===== TanStack Query: loading spinner ===== */}
      {isLoading && (
        <div className={s.loadingOverlay} role="status" aria-live="polite">
          <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
          <span>Loading auth configuration…</span>
        </div>
      )}

      {/* ===== TanStack Query: error banner (falls back to mock config) ===== */}
      {error && (
        <div className={cx('alert alert-danger alert-dismissible fade show', s.errorBanner)} role="alert">
          <strong>
            <i className="bi bi-exclamation-triangle me-2" />
            Auth config unavailable
          </strong>
          <div className="small mt-1">
            <code>/api/auth-config</code> — {error.message}. Using bundled sign-in configuration.
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
        </div>
      )}

      <div className={s.authWrap}>
        {/* ================= LEFT BRAND PANEL ================= */}
        <div className={s.authLeft}>
          <div className={s.gridOverlay} />
          <div className={cx(s.blob, s.blobMint)} />
          <div className={cx(s.blob, s.blobTeal)} />

          <div className="d-flex align-items-center gap-2">
            <span className={s.logoMark}>P</span>
            <span className="fw-bold text-white fs-5">Paymo <span className={s.textGradient}>BAAS</span></span>
          </div>

          <div>
            <span className={cx(s.pill, 'mb-3')}><span className={s.pillDot} /> {content.leftPanel.pill}</span>
            <h1 className={cx(s.heroTitle, 'mb-3')}>
              {content.leftPanel.titleTop}<br />
              <span className={s.textGradient}>{content.leftPanel.titleAccent}</span>
            </h1>
            <p className={cx(s.mutedText, 'mb-4')} style={{ maxWidth: '420px' }}>
              {content.leftPanel.copy}
            </p>
            <div className="d-flex flex-column gap-2" style={{ maxWidth: '430px' }}>
              {content.leftPanel.features.map((feat) => (
                <div className={cx(s.featCard, 'd-flex align-items-center gap-3')} key={feat.title}>
                  <div className={cx(s.featIcon, s[feat.tone])}>
                    <i className={`bi ${feat.icon}`} />
                  </div>
                  <div>
                    <div className={s.headlineColor} style={{ fontWeight: 700, fontSize: '0.92rem' }}>{feat.title}</div>
                    <div className={s.dimText} style={{ fontSize: '0.78rem' }}>{feat.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            {content.leftPanel.compliance.map((badge) => (
              <span className={s.compliance} key={badge.label}>
                <i className={`bi ${badge.icon} me-1`} />{badge.label}
              </span>
            ))}
          </div>
        </div>

        {/* ================= RIGHT AUTH PANEL ================= */}
        <div className={cx(s.authRight, s.fadeOnLoad)}>
          <div className="w-100" style={{ maxWidth: '440px' }}>
            {/* Mobile logo */}
            <div className="d-flex d-lg-none align-items-center mb-4 justify-content-center" style={mobileLogoStyle}>
              <span className={s.logoMark}>P</span>
              <span className="fw-bold text-white fs-5">Paymo <span className={s.textGradient}>BAAS</span></span>
            </div>

            {/* 51.1 Hero */}
            <div className="text-center mb-1">
              <h2 className={s.welcomeTitle}>{welcomeName ? `Welcome back, ${welcomeName}` : 'Welcome back'}</h2>
              <p className={s.mutedText} style={{ fontSize: '0.92rem' }}>Sign in to your Paymo account securely.</p>
            </div>

            {/* Contextual banner */}
            {showContextBanner && (
              <div className={cx(s.contextBanner, 'mb-3 p-2 px-3')} role="status">
                <i className="bi bi-info-circle me-1" /> Please sign in to access your <strong>Treasury Dashboard</strong>.
              </div>
            )}

            {/* Device fingerprint */}
            <div className="text-center mb-3">
              <span className={s.deviceChip}><i className="bi bi-laptop" /> {deviceChip}</span>
            </div>

            {/* 51.2 Auth Tabs — data-driven, horizontal scroll on mobile */}
            <div className={cx(s.authTabs, 'mb-4')} role="tablist">
              {content.tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={cx(s.authTab, activeTab === tab.id && s.active)}
                  onClick={() => switchTab(tab.id)}
                >
                  {tab.recommended && <span className={s.tabDot} />}
                  <i className={`bi ${tab.icon}`} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className={cx(s.glassStrong, s.authCard)}>
              {/* ===== PASSKEY PANEL ===== */}
              <div className={cx(s.authPanel, activeTab === 'passkey' && s.active)} role="tabpanel">
                <div className="text-center">
                  <div
                    className={cx(s.passkeyVisual, passkeyStatus === 'scanning' && s.scanning)}
                    style={passkeyStatus === 'verified' ? { color: '#86efac' } : undefined}
                  >
                    <i className={passkeyStatus === 'verified' ? 'bi bi-check-lg' : 'bi bi-fingerprint'} />
                  </div>
                  <div className="d-flex align-items-center justify-content-center gap-2 mb-1 flex-wrap">
                    <h5 className={s.panelTitle}>Sign in with Passkey</h5>
                    <span className={cx(s.badgeMini, s.badgeGold)}>Fastest &amp; Most Secure</span>
                  </div>
                  <p className={cx(s.mutedText, 'mb-4')} style={{ fontSize: '0.86rem' }}>
                    Use Face ID, Touch ID, or your security key — no password needed.
                  </p>
                  <button
                    className={cx(s.btnPaymo, 'w-100 mb-2')}
                    type="button"
                    onClick={handlePasskey}
                    disabled={!passkeySupported || passkeyStatus === 'scanning'}
                  >
                    {passkeyButtonContent[passkeyStatus]}
                  </button>
                  {!passkeySupported && (
                    <div className={cx(s.fieldHint, s.err, 'justify-content-center')}>
                      <i className="bi bi-exclamation-triangle" /> This device doesn&apos;t support passkeys. Try another method.
                    </div>
                  )}
                  <p className={cx(s.dimText, 'mt-3 mb-0')} style={{ fontSize: '0.78rem' }}>
                    Don&apos;t have a passkey?{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); showToast('Passkey setup opens after your first sign-in.', 'info'); }}>
                      Set one up after login
                    </a>
                  </p>
                </div>
              </div>

              {/* ===== PASSWORD PANEL ===== */}
              <div className={cx(s.authPanel, activeTab === 'password' && s.active)} role="tabpanel">
                <form onSubmit={handlePasswordSubmit} noValidate>
                  <div className="mb-3">
                    <label className={s.formLabel} htmlFor="pwEmail">Email or Phone</label>
                    <input
                      type="text"
                      className={cx(s.inputPaymo, emailOk === null ? '' : emailOk ? s.inputValid : s.inputInvalid)}
                      id="pwEmail"
                      placeholder="you@company.com"
                      autoComplete="username"
                      value={pwEmail}
                      onChange={(e) => setPwEmail(e.target.value)}
                    />
                    {renderPwHint()}
                  </div>
                  <div className="mb-2">
                    <label className={s.formLabel} htmlFor="pwPass">Password</label>
                    <div className={s.inputGroup}>
                      <input
                        type={showPw ? 'text' : 'password'}
                        className={s.inputPaymo}
                        id="pwPass"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        style={{ paddingRight: '44px' }}
                        value={pwPass}
                        onChange={(e) => setPwPass(e.target.value)}
                      />
                      <button
                        type="button"
                        className={s.toggleEye}
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPw((v) => !v)}
                      >
                        <i className={showPw ? 'bi bi-eye-slash' : 'bi bi-eye'} />
                      </button>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <label className="d-flex align-items-center gap-2" style={{ fontSize: '0.82rem', color: '#a5cbb8', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        className={s.rememberCheck}
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />{' '}
                      Remember me for 30 days
                    </label>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleGoto('recovery'); }} style={{ fontSize: '0.82rem' }}>
                      Forgot?
                    </a>
                  </div>
                  <button
                    type="submit"
                    className={cx(s.btnPaymo, 'w-100')}
                    disabled={!pwSubmitReady || pwSubmitStatus !== 'idle'}
                  >
                    {pwSubmitContent[pwSubmitStatus]}
                  </button>
                </form>
              </div>

              {/* ===== PIN PANEL ===== */}
              <div className={cx(s.authPanel, activeTab === 'pin' && s.active)} role="tabpanel">
                <div className="text-center">
                  <h5 className={s.panelTitle}>Enter your 6-digit PIN</h5>
                  <p className={s.mutedText} style={{ fontSize: '0.84rem' }}>Quick access for trusted devices.</p>
                  <div className={cx(s.pinWrap, pinError && s.error)} aria-live="polite">
                    {content.pinDigits.map((i) => (
                      <div
                        key={i}
                        className={cx(s.pinDot, i < pin.length && s.filled, i === pin.length && s.active)}
                      >
                        {i < pin.length ? '•' : ''}
                      </div>
                    ))}
                  </div>
                  <div className={cx(s.pinKeypad, 'mb-3')}>
                    {content.pinKeys.map((key) => (
                      <button
                        key={key.key}
                        type="button"
                        className={cx(s.pinKey, key.action && s.action)}
                        title={key.title}
                        aria-label={key.title ?? `Digit ${key.label}`}
                        onClick={() => pinInput(key.key)}
                      >
                        {key.icon ? <i className={`bi ${key.icon}`} /> : key.label}
                      </button>
                    ))}
                  </div>
                  <p className={cx(s.dimText, 'm-0')} style={{ fontSize: '0.78rem' }}>
                    Or use{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); handlePinBio(); }}>Face ID / Touch ID</a>
                  </p>
                </div>
              </div>

              {/* ===== MAGIC LINK PANEL ===== */}
              <div className={cx(s.authPanel, activeTab === 'magic' && s.active)} role="tabpanel">
                {magicSentTo === null ? (
                  <div>
                    <h5 className={cx(s.panelTitle, 'text-center')}>Passwordless sign in</h5>
                    <p className={cx(s.mutedText, 'text-center mb-3')} style={{ fontSize: '0.84rem' }}>
                      Enter your email and we&apos;ll send you a secure login link.
                    </p>
                    <div className="mb-3">
                      <label className={s.formLabel} htmlFor="magicEmail">Email address</label>
                      <input
                        type="email"
                        className={s.inputPaymo}
                        id="magicEmail"
                        placeholder="you@company.com"
                        autoComplete="email"
                        value={magicEmail}
                        onChange={(e) => setMagicEmail(e.target.value)}
                      />
                      {renderMagicHint()}
                    </div>
                    <button
                      className={cx(s.btnPaymo, 'w-100')}
                      type="button"
                      disabled={magicOk !== true || magicSending}
                      onClick={handleMagicSend}
                    >
                      {magicSending
                        ? (<><span className={cx(s.spinIc, 'spinner-border spinner-border-sm me-2')} /> Sending…</>)
                        : (<><i className="bi bi-send me-1" /> Send magic link</>)}
                    </button>
                  </div>
                ) : (
                  <div className={s.magicSent}>
                    <div className={s.magicSentIcon}>📬</div>
                    <h6 className="mt-2 mb-1">Link sent!</h6>
                    <p className={s.mutedText} style={{ fontSize: '0.84rem', marginBottom: '1rem' }}>
                      Check your inbox at <strong className={s.headlineColor}>{magicSentTo}</strong>. The link expires in 15 minutes.
                    </p>
                    <button
                      className={cx(s.btnOutline, 'btn-sm')}
                      type="button"
                      disabled={magicCountdown > 0}
                      onClick={handleMagicResend}
                    >
                      {magicCountdown > 0 ? `Resend in ${magicCountdown}s` : (<><i className="bi bi-arrow-repeat me-1" /> Resend link</>)}
                    </button>
                    <div className="mt-3">
                      <a href="#" style={{ fontSize: '0.8rem' }} onClick={(e) => { e.preventDefault(); handleMagicBack(); }}>
                        ← Use a different email
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* ===== SOCIAL PANEL ===== */}
              <div className={cx(s.authPanel, activeTab === 'social' && s.active)} role="tabpanel">
                <h5 className={cx(s.panelTitle, 'text-center')}>Continue with</h5>
                <p className={cx(s.mutedText, 'text-center mb-3')} style={{ fontSize: '0.84rem' }}>
                  Fast, secure sign-in with your existing account.
                </p>
                <div className="d-flex flex-column gap-2">
                  {content.socialProviders.map((provider) => {
                    const status: SocialStatus = socialStatus[provider.id] ?? 'idle';
                    return (
                      <button
                        key={provider.id}
                        className={s.socialBtn}
                        type="button"
                        disabled={status === 'connecting'}
                        onClick={() => handleSocial(provider)}
                      >
                        {status === 'connecting' && (
                          <>
                            <span className={cx(s.spinIc, 'spinner-border spinner-border-sm', s.spinIcLight)} />
                            Connecting to {provider.id}…
                          </>
                        )}
                        {status === 'connected' && (
                          <>
                            <i className="bi bi-check-lg" style={{ color: '#86efac' }} />
                            Connected to {provider.id}
                          </>
                        )}
                        {status === 'idle' && (
                          <>
                            <i className={`bi ${provider.icon}`} style={provider.color ? { color: provider.color } : undefined} />
                            Continue with {provider.id}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className={cx(s.dimText, 'mt-3 mb-0 text-center')} style={{ fontSize: '0.74rem' }}>
                  <i className="bi bi-shield-check me-1" /> We only access your name, email, and photo. We never post on your behalf.
                </p>
              </div>
            </div>

            {/* 51.4 Security Strip */}
            <div className={cx(s.secStrip, 'mt-4')}>
              {content.secStrip.map((item) => (
                <div className={s.secItem} key={item.label}>
                  <i className={`bi ${item.icon}`} />
                  <div>{item.label}</div>
                </div>
              ))}
            </div>

            {/* 51.5 Auxiliary */}
            <div className="text-center mt-4">
              <p style={{ fontSize: '0.88rem', color: '#a5cbb8', marginBottom: '0.5rem' }}>
                New to Paymo?{' '}
                <a href="#" style={{ fontWeight: 600 }} onClick={(e) => { e.preventDefault(); handleGoto('register'); }}>
                  Create an account
                </a>
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap" style={{ fontSize: '0.82rem' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); handleGoto('recovery'); }}>Forgot password/PIN</a>
                <span style={{ color: 'rgba(120,245,190,.25)' }}>·</span>
                <a href="#" onClick={(e) => { e.preventDefault(); showToast('Opening support assistant…', 'info'); }}>Need help?</a>
                <span style={{ color: 'rgba(120,245,190,.25)' }}>·</span>
                <a href="#" onClick={(e) => { e.preventDefault(); handleSwitchAccount(); }}>Switch account</a>
              </div>
            </div>

            {/* 51.6 Footer */}
            <hr className={s.hrLine} />
            <div className={s.authFoot}>
              {content.footLinks.map((link) => (
                <a
                  key={link.id}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (link.action === 'cookie') showToast('Cookie settings opened.', 'info');
                  }}
                >
                  {link.label}
                </a>
              ))}
              <select
                className={s.langSelect}
                aria-label="Language"
                onChange={(e) => showToast(`Language switched to ${e.target.value.trim()}`, 'ok')}
              >
                {content.languages.map((lang) => (
                  <option key={lang} style={{ background: '#04150e' }}>{lang}</option>
                ))}
              </select>
            </div>
            <p className={cx(s.dimText, 'text-center')} style={{ fontSize: '0.72rem', marginTop: '0.6rem' }}>
              {content.copyright}
            </p>
          </div>
        </div>
      </div>

      {/* ===== Toast (legacy #toast) ===== */}
      <div className={cx(s.toastPaymo, s.glassStrong, toast.visible && s.show)} role="status">
        <i className={`bi ${content.toastIcons[toast.type]}`} style={{ color: content.toastColors[toast.type] }} />
        <span>{toast.msg}</span>
      </div>
    </div>
  );
}
