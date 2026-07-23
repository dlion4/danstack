/* ============================================================================
 * Mfa.tsx — Paymo BAAS MFA Challenge (Emerald Glass Edition)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy page54.html (1,287 LOC) — vanilla JS + Bootstrap CSS
 * STACK ........: Vite + React + TypeScript + TanStack Query v5 + Bootstrap 5
 * ARCHITECTURE .: ONE component file holds all layout + logic (per spec).
 *                 Styles live in ../styles/mfa.module.css (CSS Module).
 * REPO NOTES ...: tuned for dlion4/danstack — no new packages; art is served
 *                 from /public/assets; fonts come from routes/__root.tsx.
 *
 * EVERY INTERACTION FROM THE LEGACY PAGE IS MAINTAINED:
 *   6 factor cards (TOTP / SMS+WhatsApp / push / passkey / hardware key /
 *   recovery code), TOTP 30s conic ring, SMS send + 60s resend lockout,
 *   push-device mock with scanline + approve/deny, WebAuthn support badge,
 *   hardware-key touch simulation with animated SVG, recovery-code input
 *   sanitizer + template download, shake + attempt counter on error, 5:00
 *   session countdown, help modal, "use different account" reset, and the
 *   success state with factor + risk decision.
 *
 * LEGACY BRIDGE MAP (vanilla JS -> React):
 *   state{} object ....................... useState fields
 *   renderPanel() innerHTML per method ... JSX conditional sections
 *   otpMarkup()/bindOtp() DOM wiring ..... otpRef bridge + setOtpDigit/paste
 *   setInterval(tickTimers, 1000) ........ single useEffect interval (cleaned)
 *   showError() insertAdjacentHTML ....... errorMsg state + shake counter
 *   completeSuccess() display toggle ..... success state render
 *   helpModal bootstrap.Modal ............ modalRef + Modal.getOrCreateInstance
 *   downloadTemplate() Blob+a.click() .... kept verbatim (browser API bridge)
 * ========================================================================== */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
if (typeof document !== 'undefined') {
  import('bootstrap/dist/js/bootstrap.bundle.min.js')
}
import styles from '../styles/mfa.module.css';

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */
type MfaMethod = 'totp' | 'sms' | 'push' | 'passkey' | 'hardware' | 'recovery';
type BadgeKind = 'badgeOk' | 'badgeAdv' | 'badgeNative' | 'badgeSoon' | 'badgeWarn';

interface MfaConfig {
  brand: { pill: string; title: string; copy: string; securityStrip: Array<{ icon: string; color: string; label: string }> };
  header: { pill: string; title: string; copy: string };
  methods: Array<{ id: MfaMethod; icon: string; label: string; sub: string; lastUsed?: boolean }>;
  factorLabels: Record<MfaMethod, string>;
  risk: { location: string; ipReputation: string; deviceFingerprint: string };
  sms: { destination: string; resendSeconds: number };
  push: { deviceName: string; requester: string };
  passkey: { registeredCount: number; promptMs: number };
  hardware: { promptMs: number };
  recovery: { placeholder: string; sampleCodes: string[] };
  help: { items: Array<{ icon: string; color: string; text: string }> };
  sessionSeconds: number;
  totpPeriod: number;
}

/* --------------------------------------------------------------------------
 * 1. initialMockData — every repeating/hardcoded block extracted from legacy
 *    markup + script. GET /api/mfa-config returns this same shape.
 * ------------------------------------------------------------------------ */
const initialMockData: MfaConfig = {
  brand: {
    pill: 'Risk-based step-up required',
    title: 'Verify before entering your financial control plane.',
    copy: 'Paymo Shield checks device, location, network, and session risk before allowing dashboard access.',
    securityStrip: [
      { icon: 'bi-lock-fill', color: '#2ee6a0', label: 'TLS 1.3' },
      { icon: 'bi-shield-check', color: '#86efac', label: 'SOC 2' },
      { icon: 'bi-eye-slash', color: '#a78bfa', label: 'No code logs' },
      { icon: 'bi-clock-history', color: '#fbbf24', label: '30s TOTP' },
    ],
  },

  header: {
    pill: 'Paymo Shield MFA',
    title: 'Verify your identity.',
    copy: 'We need to confirm it is really you. Choose one approved factor to continue.',
  },

  methods: [
    { id: 'totp', icon: 'bi-shield-lock', label: 'Authenticator app', sub: 'Google Authenticator, Authy, Microsoft', lastUsed: true },
    { id: 'sms', icon: 'bi-phone', label: 'SMS / WhatsApp', sub: 'Send code to +254 •••••4321' },
    { id: 'push', icon: 'bi-bell', label: 'Push approval', sub: 'Approve from trusted phone' },
    { id: 'passkey', icon: 'bi-fingerprint', label: 'Passkey / biometric', sub: 'Face ID, Touch ID, Windows Hello' },
    { id: 'hardware', icon: 'bi-usb-symbol', label: 'Security key', sub: 'YubiKey or FIDO2 hardware key' },
    { id: 'recovery', icon: 'bi-key', label: 'Recovery code', sub: 'Use a saved backup code' },
  ],

  factorLabels: {
    totp: 'Authenticator app',
    sms: 'SMS / WhatsApp',
    push: 'Push approval',
    passkey: 'Passkey / biometric',
    hardware: 'Security key',
    recovery: 'Recovery code',
  },

  risk: {
    location: 'Nairobi, Kenya',
    ipReputation: 'IP reputation: trusted',
    deviceFingerprint: 'Device fingerprint: known',
  },

  sms: { destination: '+254 •••••4321', resendSeconds: 60 },
  push: { deviceName: 'iPhone 15 Pro', requester: 'Nairobi' },
  passkey: { registeredCount: 2, promptMs: 2200 },
  hardware: { promptMs: 2600 },
  recovery: {
    placeholder: 'PAYMO-1A2B3C',
    sampleCodes: ['PAYMO-8F4A2C', 'PAYMO-71B9E0', 'PAYMO-3D6F90', 'PAYMO-A1C778', 'PAYMO-52EE14'],
  },

  help: {
    items: [
      { icon: 'bi-shield-check', color: '#2ee6a0', text: 'Use recovery codes if you lost your phone or authenticator app.' },
      { icon: 'bi-phone', color: '#7cf5c8', text: 'SMS and WhatsApp codes expire after 5 minutes.' },
      { icon: 'bi-headset', color: '#fbbf24', text: 'Support-assisted recovery requires identity verification and may take 24-48 hours.' },
    ],
  },

  sessionSeconds: 300,
  totpPeriod: 30,
};

/* --------------------------------------------------------------------------
 * 2. API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
async function fetchMfaConfig(): Promise<MfaConfig> {
  const response = await fetch('/api/mfa-config', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`MFA config API responded HTTP ${response.status}`);
  return response.json() as Promise<MfaConfig>;
}

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */
const s = styles as Record<string, string>;
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

/* LEGACY BRIDGE: getBrowserLabel() — navigator.userAgent sniffing, verbatim. */
function getBrowserLabel(): string {
  if (typeof navigator === 'undefined') return 'Unknown browser';
  const ua = navigator.userAgent;
  const browser = ua.includes('Edg') ? 'Edge' : ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Browser';
  const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') ? 'iOS' : 'this device';
  return `${browser} on ${os}`;
}

/* --------------------------------------------------------------------------
 * 3. COMPONENT
 * ------------------------------------------------------------------------ */
export default function Mfa() {
  /* ---------- TanStack Query ---------- */
  const { data: apiData, error, isLoading } = useQuery({
    queryKey: ['paymo-mfa-config'],
    queryFn: fetchMfaConfig,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  // Falls back to initialMockData while the API is unreachable; the error
  // banner below surfaces that failure state to the user.
  const content = apiData ?? initialMockData;

  /* ---------- state (legacy `state` object) ---------- */
  const [method, setMethod] = useState<MfaMethod>('totp');
  const [attempts, setAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [success, setSuccess] = useState(false);

  const [sessionLeft, setSessionLeft] = useState(content.sessionSeconds);
  const [totpSeconds, setTotpSeconds] = useState(content.totpPeriod);

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [channel, setChannel] = useState<'SMS' | 'WhatsApp'>('SMS');
  const [smsSent, setSmsSent] = useState(false);
  const [smsLeft, setSmsLeft] = useState(0);

  const [pushStatus, setPushStatus] = useState<'idle' | 'sending' | 'visible'>('idle');
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [keyBusy, setKeyBusy] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');

  const [accountCleared, setAccountCleared] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [browserLabel, setBrowserLabel] = useState('Unknown browser');

  /* ---------- refs (legacy DOM bridges) ---------- */
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const recoveryInputRef = useRef<HTMLInputElement | null>(null);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
  }, []);

  /* LEGACY BRIDGE: document.getElementById('browserText').textContent = getBrowserLabel() */
  useEffect(() => {
    setBrowserLabel(getBrowserLabel());
  }, []);

  /* LEGACY BRIDGE: setInterval(tickTimers, 1000) — session countdown, TOTP
     ring seconds and SMS resend lockout, all in one cleaned interval. */
  useEffect(() => {
    const id = setInterval(() => {
      setSessionLeft((v) => Math.max(0, v - 1));
      setTotpSeconds((v) => (v <= 1 ? content.totpPeriod : v - 1));
      setSmsLeft((v) => Math.max(0, v - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [content.totpPeriod]);

  /* legacy setTimeout(() => inputs[0]?.focus(), 100) on OTP render / recovery focus */
  useEffect(() => {
    if (success) return;
    if (method === 'totp' || (method === 'sms' && smsSent)) {
      const id = setTimeout(() => otpRefs.current[0]?.focus(), 100);
      return () => clearTimeout(id);
    }
    if (method === 'recovery') {
      const id = setTimeout(() => recoveryInputRef.current?.focus(), 100);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [method, smsSent, success]);

  /* LEGACY BRIDGE: selectMethod() — reset per-panel state, clear error. */
  const selectMethod = (next: MfaMethod) => {
    setMethod(next);
    setOtp(['', '', '', '', '', '']);
    setErrorMsg(null);
    setPushStatus('idle');
    setPasskeyBusy(false);
    setKeyBusy(false);
  };

  /* LEGACY BRIDGE: showError(message) — attempts counter + shake + inline banner */
  const showError = (message: string) => {
    setAttempts((a) => a + 1);
    setErrorMsg(message);
    setShakeKey((k) => k + 1);
  };

  /* LEGACY BRIDGE: completeSuccess() — hide challenge, show success panel */
  const completeSuccess = () => {
    setErrorMsg(null);
    setSuccess(true);
  };

  /* ---------- OTP boxes (legacy bindOtp) ---------- */
  const otpComplete = otp.every((d) => d.length === 1);

  const setOtpDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(0, 1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && otpRefs.current[index + 1]) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && otpRefs.current[index - 1]) otpRefs.current[index - 1]?.focus();
    if (e.key === 'Enter') {
      e.preventDefault();
      verifyCurrent();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    data.split('').forEach((n, i) => {
      setOtp((prev) => {
        const next = [...prev];
        next[i] = n;
        return next;
      });
    });
    const focusIdx = Math.min(data.length, 6) - 1;
    if (focusIdx >= 0) otpRefs.current[focusIdx]?.focus();
  };

  /* ---------- SMS send (legacy sendSmsCode) ---------- */
  const sendSmsCode = () => {
    setSmsSent(true);
    setSmsLeft(content.sms.resendSeconds);
    setOtp(['', '', '', '', '', '']);
  };

  /* ---------- push flow (legacy startPushFlow) ---------- */
  const startPushFlow = () => {
    setPushStatus('sending');
    later(() => setPushStatus('visible'), 1800);
  };

  /* ---------- passkey / hardware simulations ---------- */
  const simulatePasskey = () => {
    setPasskeyBusy(true);
    later(() => completeSuccess(), content.passkey.promptMs);
  };

  const simulateHardwareKey = () => {
    setKeyBusy(true);
    later(() => completeSuccess(), content.hardware.promptMs);
  };

  /* ---------- verify (legacy verifyCurrent + validateCurrent) ---------- */
  function verifyCurrent() {
    if (method === 'totp' || method === 'sms') {
      if (otpComplete) return completeSuccess();
      return showError(method === 'totp'
        ? 'Enter the full 6-digit authenticator code.'
        : 'Enter the full 6-digit SMS or WhatsApp code.');
    }
    if (method === 'recovery') {
      if (recoveryCode.trim().length >= 8) return completeSuccess();
      return showError('Enter a valid recovery code.');
    }
    return undefined;
  }

  /* ---------- recovery code input sanitizer (legacy input listener) ---------- */
  const handleRecoveryInput = (raw: string) => {
    setRecoveryCode(raw.toUpperCase().replace(/[^A-Z0-9-]/g, ''));
  };

  /* LEGACY BRIDGE: downloadTemplate() — Blob + temp anchor click. Kept as
     direct browser-API work, exactly like the legacy function. */
  const downloadTemplate = () => {
    const blob = new Blob(
      [`Paymo BAAS recovery code template\nGenerated locally for demo\n\n${content.recovery.sampleCodes.join('\n')}\n\nStore these codes in a secure place.`],
      { type: 'text/plain' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paymo-recovery-codes-template.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  /* ---------- footer buttons ----------
     LEGACY BRIDGE: the help modal is driven entirely by the Bootstrap JS
     data-API (data-bs-toggle / data-bs-dismiss), loaded via the bundle import
     above — no typed `bootstrap` import needed in the repo. */
  const startSupportRecovery = () => {
    selectMethod('recovery');
  };

  const useDifferentAccount = () => {
    localStorage.removeItem('paymo_remembered_user');
    window.location.hash = 'different-account-cleared';
    setAccountCleared(true);
  };

  const continueToAccountType = () => {
    window.location.hash = 'account-type';
    setRouteReady(true);
  };

  /* ---------- derived display values ---------- */
  const mm = String(Math.floor(sessionLeft / 60)).padStart(2, '0');
  const ss = String(sessionLeft % 60).padStart(2, '0');
  const totpPct = (totpSeconds / content.totpPeriod) * 100;
  const webAuthnSupported = typeof window !== 'undefined' && !!window.PublicKeyCredential;

  const otpBoxes = (
    <div className={s.otpContainer}>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { otpRefs.current[i] = el; }}
          className={s.otpInput}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Code digit ${i + 1}`}
          value={digit}
          onChange={(e) => setOtpDigit(i, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(i, e)}
          onPaste={handleOtpPaste}
        />
      ))}
    </div>
  );

  /* ------------------------------------------------------------------------
   * 4. TEMPLATE (JSX)
   * ---------------------------------------------------------------------- */
  return (
    <div className={s.mfaPage}>
      {/* ===== TanStack Query: loading spinner ===== */}
      {isLoading && (
        <div className={s.loadingOverlay} role="status" aria-live="polite">
          <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
          <span>Loading MFA configuration…</span>
        </div>
      )}

      {/* ===== TanStack Query: error banner ===== */}
      {error && (
        <div className={cx('alert alert-danger alert-dismissible fade show', s.errorBanner)} role="alert">
          <strong>
            <i className="bi bi-exclamation-triangle me-2" />
            MFA config unavailable
          </strong>
          <div className="small mt-1">
            <code>/api/mfa-config</code> — {error.message}. Using bundled configuration.
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
        </div>
      )}

      {/* legacy fixed grid overlay + blobs */}
      <div className={s.gridOverlay} style={{ position: 'fixed', inset: 0, opacity: 0.45, pointerEvents: 'none' }} />
      <div className={s.blob} style={{ width: '520px', height: '520px', background: '#2ee6a0', top: '-160px', right: '-120px' }} />
      <div className={s.blob} style={{ width: '430px', height: '430px', background: '#0a7a54', bottom: '-130px', left: '-80px', animationDelay: '-6s' }} />

      <main className={s.authWrap}>
        <div className="container">
          <div className="row g-4 align-items-stretch">
            {/* ================= LEFT: brand panel ================= */}
            <div className="col-lg-5 d-none d-lg-block">
              <aside className={cx(s.brandPanel, s.glass)}>
                <div className={s.brandContent}>
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <span className={s.logoMark}>P</span>
                      <div>
                        <div className="fw-bold text-white">
                          Paymo <span className={s.textGradient}>BAAS</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--mf-ink-3)' }}>Borderless African finance infrastructure</div>
                      </div>
                    </div>
                    <span className={cx(s.pill, 'mb-3')}><span className={s.pillDot} /> {content.brand.pill}</span>
                    <h1 className={s.brandTitle}>{content.brand.title}</h1>
                    <p className={cx(s.mutedText, 'mt-3')} style={{ maxWidth: '390px' }}>{content.brand.copy}</p>
                  </div>

                  <div>
                    <div className={cx(s.flowFrame, 'mb-3')}>
                      <img src="/assets/flow-3d.jpg" alt="MFA security flow" />
                    </div>
                    <div className={s.securityStrip}>
                      {content.brand.securityStrip.map((item) => (
                        <div className={s.securityItem} key={item.label}>
                          <i className={`bi ${item.icon}`} style={{ color: item.color }} />
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            {/* ================= RIGHT: challenge panel ================= */}
            <div className="col-lg-7">
              <section className={cx(s.glassStrong, 'p-4 p-md-5 h-100')} style={{ maxWidth: '760px', margin: '0 auto' }}>
                {!success ? (
                  <div>
                    <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-3 d-lg-none">
                          <span className={s.logoMark}>P</span>
                          <div>
                            <div className="fw-bold text-white">Paymo <span className={s.textGradient}>BAAS</span></div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--mf-ink-3)' }}>MFA Challenge</div>
                          </div>
                        </div>
                        <span className={s.pill}><span className={s.pillDot} /> {content.header.pill}</span>
                        <h2 className="mt-3 mb-2" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.7rem)', lineHeight: 1.05, fontWeight: 900, color: 'var(--mf-ink-0)' }}>
                          {content.header.title}
                        </h2>
                        <p className={s.mutedText} style={{ marginBottom: 0 }}>{content.header.copy}</p>
                      </div>
                      <div className="text-lg-end">
                        <span className={cx(s.badgeMini, s.badgeSoon)}>Step-up auth</span>
                        <div style={{ fontSize: '0.76rem', color: 'var(--mf-ink-3)', marginTop: '0.45rem' }}>
                          Session expires in <span className={s.mono} style={{ color: '#fcd34d' }}>{mm}:{ss}</span>
                        </div>
                      </div>
                    </div>

                    {/* risk glass grid */}
                    <div className={cx(s.glass, 'p-3 mb-4')} style={{ borderRadius: '16px' }}>
                      <div className="row g-2">
                        <div className="col-md-6">
                          <div className={s.riskRow}><i className="bi bi-browser-chrome" style={{ color: 'var(--mf-accent)' }} /><span>{browserLabel}</span></div>
                        </div>
                        <div className="col-md-6">
                          <div className={s.riskRow}><i className="bi bi-geo-alt" style={{ color: 'var(--mf-accent-2)' }} /><span>{content.risk.location}</span></div>
                        </div>
                        <div className="col-md-6">
                          <div className={s.riskRow}><i className="bi bi-router" style={{ color: 'var(--mf-accent-3)' }} /><span>{content.risk.ipReputation}</span></div>
                        </div>
                        <div className="col-md-6">
                          <div className={s.riskRow}><i className="bi bi-fingerprint" style={{ color: 'var(--mf-accent-4)' }} /><span>{content.risk.deviceFingerprint}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* method cards */}
                    <div className={s.methodGrid}>
                      {content.methods.map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          className={cx(s.methodCard, method === m.id && s.active, m.lastUsed && s.last)}
                          onClick={() => selectMethod(m.id)}
                        >
                          <div className={s.methodIcon}><i className={`bi ${m.icon}`} /></div>
                          <div className="fw-bold text-white" style={{ fontSize: '0.95rem' }}>{m.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--mf-ink-3)' }}>{m.sub}</div>
                        </button>
                      ))}
                    </div>

                    <hr style={{ borderColor: 'var(--mf-glass-border)', margin: '1.5rem 0' }} />

                    {/* ===== challenge panel (legacy innerHTML regions -> JSX) ===== */}
                    <div key={`${method}-${shakeKey}`} className={cx(s.challengePanel, shakeKey > 0 && errorMsg && s.shake)}>

                      {method === 'totp' && (
                        <div className="row g-4 align-items-center">
                          <div className="col-md-5 text-center">
                            <div className={s.totpRing} style={{ '--progress': `${totpPct}%` } as CSSProperties}>
                              <span className={s.totpTime}>{String(totpSeconds).padStart(2, '0')}</span>
                            </div>
                            <span className={cx(s.badgeMini, s.badgeNative)}>Code refreshes every 30 seconds</span>
                          </div>
                          <div className="col-md-7">
                            <h4 className="mb-2" style={{ color: 'var(--mf-ink-0)', fontWeight: 800 }}>Enter authenticator code</h4>
                            <p className={s.mutedText} style={{ fontSize: '0.92rem' }}>
                              Open Google Authenticator, Authy, Microsoft Authenticator, or your configured TOTP app.
                            </p>
                            {otpBoxes}
                            <button type="button" className={cx(s.btnPaymo, 'w-100')} disabled={!otpComplete} onClick={verifyCurrent}>
                              Verify code <i className="bi bi-check-circle ms-1" />
                            </button>
                            <button type="button" className={cx(s.btnOutline, 'w-100 mt-2')} onClick={() => selectMethod('recovery')}>
                              <i className="bi bi-key me-1" /> Cannot access authenticator?
                            </button>
                          </div>
                        </div>
                      )}

                      {method === 'sms' && (
                        <div>
                          <div className="d-flex align-items-center gap-3 mb-3">
                            <div className={s.methodIcon} style={{ marginBottom: 0 }}><i className="bi bi-phone" /></div>
                            <div>
                              <h4 className="mb-0" style={{ color: 'var(--mf-ink-0)', fontWeight: 800 }}>SMS / WhatsApp code</h4>
                              <div style={{ color: 'var(--mf-ink-3)', fontSize: '0.84rem' }}>Destination: {content.sms.destination}</div>
                            </div>
                          </div>
                          <div className={cx(s.glass, 'p-3 mb-3')} style={{ borderRadius: '14px' }}>
                            <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                              <span style={{ fontSize: '0.86rem', color: 'var(--mf-ink-2)' }}>Choose delivery channel</span>
                              <div className="d-flex gap-2">
                                {(['SMS', 'WhatsApp'] as const).map((ch) => (
                                  <button
                                    type="button"
                                    key={ch}
                                    className={cx(s.btnOutline, 'btn btn-sm', channel === ch && s.active)}
                                    style={channel === ch ? { borderColor: 'var(--mf-accent)', color: '#bdf5d8', background: 'rgba(46,230,160,0.09)', minHeight: 0 } : { minHeight: 0 }}
                                    onClick={() => setChannel(ch)}
                                  >
                                    {ch}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button type="button" className={cx(s.btnPaymo, 'w-100 mb-3')} onClick={sendSmsCode} disabled={smsSent && smsLeft > 0}>
                            <i className="bi bi-send me-1" /> {smsSent ? 'Resend code' : `Send code via ${channel}`}
                          </button>
                          {smsSent && (
                            <div>
                              {otpBoxes}
                              <button type="button" className={cx(s.btnPaymo, 'w-100')} disabled={!otpComplete} onClick={verifyCurrent}>
                                Verify OTP <i className="bi bi-check-circle ms-1" />
                              </button>
                              <div className="text-center mt-2" style={{ fontSize: '0.82rem', color: 'var(--mf-ink-3)' }}>
                                Resend available in <span className={s.mono} style={{ color: 'var(--mf-accent)' }}>{smsLeft}</span>s
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {method === 'push' && (
                        <div className="row g-4 align-items-center">
                          <div className="col-md-5">
                            <div className={s.pushDevice}>
                              <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '0.72rem', color: 'var(--mf-ink-3)' }}>
                                <span>Paymo</span><span>now</span>
                              </div>
                              <div className={s.pushScreen}>
                                <div style={{ position: 'relative', zIndex: 2 }}>
                                  <div className="d-flex align-items-center gap-2 mb-3">
                                    <span className={s.logoMark} style={{ width: '30px', height: '30px', flexBasis: '30px', borderRadius: '8px', fontSize: '0.8rem' }}>P</span>
                                    <strong style={{ color: 'var(--mf-ink-0)' }}>Verify login</strong>
                                  </div>
                                  <p className={s.mutedText} style={{ fontSize: '0.82rem' }}>{browserLabel} is requesting access from {content.push.requester}.</p>
                                  <div className="d-grid gap-2 mt-3">
                                    <button type="button" className={cx(s.btnPaymo, 'btn btn-sm')} onClick={completeSuccess}>Approve</button>
                                    <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} onClick={() => showError('Approval denied on trusted device.')}>Deny</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-7">
                            <h4 className="mb-2" style={{ color: 'var(--mf-ink-0)', fontWeight: 800 }}>Approve on trusted device</h4>
                            <p className={s.mutedText} style={{ fontSize: '0.92rem' }}>
                              We sent a push request to <strong className="text-white">{content.push.deviceName}</strong>, last used 2 days ago in {content.push.requester}.
                            </p>
                            <div className={cx(s.inlineAlert, 'mb-3')}><i className="bi bi-phone-vibrate me-1" /> Open your Paymo mobile app and tap Approve.</div>
                            <button type="button" className={cx(s.btnPaymo, 'w-100')} onClick={startPushFlow} disabled={pushStatus !== 'idle'}>
                              {pushStatus === 'idle'
                                ? (<><i className="bi bi-bell me-1" /> Send push request</>)
                                : (<><span className="spinner-border spinner-border-sm me-2" /> Request sent</>)}
                            </button>
                            <div className="text-center mt-3" style={{ color: 'var(--mf-ink-3)', fontSize: '0.85rem' }}>
                              {pushStatus === 'idle' && 'Waiting to send approval request.'}
                              {pushStatus === 'sending' && <span style={{ color: 'var(--mf-accent)' }}>Waiting for approval...</span>}
                              {pushStatus === 'visible' && <span style={{ color: '#86efac' }}>Request visible on trusted phone. Use the phone preview to approve.</span>}
                            </div>
                          </div>
                        </div>
                      )}

                      {method === 'passkey' && (
                        <div className="text-center" style={{ maxWidth: '520px', margin: '0 auto' }}>
                          <div className={cx(s.methodIcon, 'mx-auto')} style={{ width: '72px', height: '72px', borderRadius: '24px', fontSize: '2rem' }}>
                            <i className="bi bi-fingerprint" />
                          </div>
                          <h4 style={{ color: 'var(--mf-ink-0)', fontWeight: 800 }}>Use passkey or biometric</h4>
                          <p className={s.mutedText} style={{ fontSize: '0.92rem' }}>
                            Authenticate with Face ID, Touch ID, Windows Hello, Android biometric, or a synced passkey.
                          </p>
                          <div className={cx(s.glass, 'p-3 my-3')} style={{ borderRadius: '16px', textAlign: 'left' }}>
                            <div className="d-flex justify-content-between" style={{ fontSize: '0.85rem' }}>
                              <span style={{ color: 'var(--mf-ink-3)' }}>WebAuthn support</span>
                              <span className={cx(s.badgeMini, webAuthnSupported ? s.badgeOk : s.badgeWarn)}>
                                {webAuthnSupported ? 'Detected' : 'Not detected'}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between mt-2" style={{ fontSize: '0.85rem' }}>
                              <span style={{ color: 'var(--mf-ink-3)' }}>Registered passkeys</span>
                              <span className={cx(s.textGradient, 'fw-bold')}>{content.passkey.registeredCount}</span>
                            </div>
                          </div>
                          <button type="button" className={cx(s.btnPaymo, 'w-100')} onClick={simulatePasskey} disabled={passkeyBusy}>
                            {passkeyBusy
                              ? (<><span className="spinner-border spinner-border-sm me-2" /> Waiting for platform prompt...</>)
                              : (<><i className="bi bi-fingerprint me-1" /> Verify with passkey</>)}
                          </button>
                          <button type="button" className={cx(s.btnOutline, 'w-100 mt-2')} onClick={() => selectMethod('totp')}>
                            Use another factor
                          </button>
                        </div>
                      )}

                      {method === 'hardware' && (
                        <div className="row g-4 align-items-center">
                          <div className="col-md-5">
                            <div className={cx(s.hardwareSlot, 'text-center')}>
                              <svg viewBox="0 0 260 130" width="100%" height="130" aria-hidden="true">
                                <defs>
                                  <linearGradient id="keyGrad" x1="0" x2="1">
                                    <stop offset="0" stopColor="#2ee6a0" />
                                    <stop offset="1" stopColor="#7cf5c8" />
                                  </linearGradient>
                                </defs>
                                <rect x="44" y="42" width="170" height="45" rx="18" fill="rgba(255,255,255,.05)" stroke="url(#keyGrad)" strokeWidth="2" />
                                <circle cx="78" cy="64" r="14" fill="none" stroke="#2ee6a0" strokeWidth="3" />
                                <path className="dash" d="M120 64 L200 64" stroke="#bdf5d8" strokeWidth="2" />
                              </svg>
                              <span className={cx(s.badgeMini, s.badgeNative)}>FIDO2 / U2F compatible</span>
                            </div>
                          </div>
                          <div className="col-md-7">
                            <h4 style={{ color: 'var(--mf-ink-0)', fontWeight: 800 }}>Use hardware security key</h4>
                            <p className={s.mutedText} style={{ fontSize: '0.92rem' }}>
                              Insert your YubiKey, Titan key, or compatible FIDO2 device. Touch it when it blinks.
                            </p>
                            <button type="button" className={cx(s.btnPaymo, 'w-100')} onClick={simulateHardwareKey} disabled={keyBusy}>
                              {keyBusy
                                ? (<><span className="spinner-border spinner-border-sm me-2" /> Waiting for touch...</>)
                                : (<><i className="bi bi-usb-drive me-1" /> Start security key check</>)}
                            </button>
                            <div className="text-center mt-3" style={{ fontSize: '0.85rem', color: 'var(--mf-ink-3)' }}>
                              {keyBusy ? <span style={{ color: 'var(--mf-accent)' }}>Touch your security key now.</span> : 'Waiting to start.'}
                            </div>
                          </div>
                        </div>
                      )}

                      {method === 'recovery' && (
                        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
                          <div className="d-flex align-items-center gap-3 mb-3">
                            <div className={s.methodIcon} style={{ marginBottom: 0 }}><i className="bi bi-key" /></div>
                            <div>
                              <h4 className="mb-0" style={{ color: 'var(--mf-ink-0)', fontWeight: 800 }}>Use recovery code</h4>
                              <div style={{ color: 'var(--mf-ink-3)', fontSize: '0.84rem' }}>Enter one of your saved 10-character backup codes.</div>
                            </div>
                          </div>
                          <label className={s.labelPaymo} htmlFor="recoveryCode">Recovery code</label>
                          <input
                            id="recoveryCode"
                            ref={recoveryInputRef}
                            className={cx(s.inputPaymo, s.recoveryCodeInput)}
                            maxLength={11}
                            placeholder={content.recovery.placeholder}
                            value={recoveryCode}
                            onChange={(e) => handleRecoveryInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && recoveryCode.length >= 8) { e.preventDefault(); verifyCurrent(); } }}
                          />
                          <div className={cx(s.inlineAlert, 'my-3')}>
                            <i className="bi bi-exclamation-triangle me-1" /> Recovery codes are single-use. We will ask you to generate new codes after login.
                          </div>
                          <button type="button" className={cx(s.btnPaymo, 'w-100')} disabled={recoveryCode.length < 8} onClick={verifyCurrent}>
                            Verify recovery code <i className="bi bi-check-circle ms-1" />
                          </button>
                          <button type="button" className={cx(s.btnOutline, 'w-100 mt-2')} onClick={downloadTemplate}>
                            <i className="bi bi-download me-1" /> Download new code template
                          </button>
                        </div>
                      )}

                      {/* LEGACY BRIDGE: #inlineError insertAdjacentHTML -> state render */}
                      {errorMsg && (
                        <div className={s.inlineError} role="alert">
                          <i className="bi bi-exclamation-triangle me-1" />
                          {errorMsg} Attempt {attempts} of 5.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 d-flex flex-wrap gap-2 justify-content-between align-items-center">
                      <button
                        type="button"
                        className={cx(s.btnOutline, 'btn btn-sm')}
                        data-bs-toggle="modal"
                        data-bs-target="#mfaHelpModal"
                      >
                        <i className="bi bi-question-circle me-1" /> Need help?
                      </button>
                      <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} onClick={useDifferentAccount} disabled={accountCleared}>
                        {accountCleared ? (<><i className="bi bi-check-lg me-1" /> Remembered account cleared</>) : (<><i className="bi bi-arrow-left me-1" /> Use different account</>)}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ===== success state ===== */
                  <div className={s.successState}>
                    <div className={s.successIcon}><i className="bi bi-check-lg" /></div>
                    <h3 style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--mf-ink-0)' }}>Identity verified.</h3>
                    <p className={s.mutedText} style={{ maxWidth: '420px', margin: '0 auto 1.4rem' }}>
                      Your MFA challenge was completed successfully. Paymo Shield is redirecting you to account selection.
                    </p>
                    <div className={cx(s.glass, 'p-3 mb-3')} style={{ borderRadius: '16px', maxWidth: '420px', margin: '0 auto' }}>
                      <div className="d-flex justify-content-between" style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--mf-ink-3)' }}>Factor used</span>
                        <span className={cx(s.textGradient, 'fw-bold')}>{content.factorLabels[method]}</span>
                      </div>
                      <div className="d-flex justify-content-between mt-2" style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--mf-ink-3)' }}>Risk decision</span>
                        <span style={{ color: '#86efac', fontWeight: 700 }}>Approved</span>
                      </div>
                    </div>
                    <button type="button" className={s.btnPaymo} onClick={continueToAccountType}>
                      {routeReady ? (<><i className="bi bi-check-lg me-1" /> Account type route ready</>) : (<>Continue to account type <i className="bi bi-arrow-right ms-1" /></>)}
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* ===== help modal (legacy Bootstrap modal — data-API driven) ===== */}
      <div className="modal fade" id="mfaHelpModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className={cx('modal-content', s.modalContent)}>
            <div className="modal-header border-0">
              <h5 className="modal-title">MFA help</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              <div className="d-flex flex-column gap-3">
                {content.help.items.map((item) => (
                  <div className={s.riskRow} key={item.text}>
                    <i className={`bi ${item.icon}`} style={{ color: item.color }} />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer border-0">
              <button type="button" className={cx(s.btnOutline, 'btn btn-sm')} data-bs-dismiss="modal">Close</button>
              <button type="button" className={cx(s.btnPaymo, 'btn btn-sm')} data-bs-dismiss="modal" onClick={startSupportRecovery}>Start support recovery</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
