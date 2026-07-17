/* ============================================================================
 * Recovery.tsx — Paymo BAAS Account Recovery (Emerald Glass Edition)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy page53.html (1,103 LOC) — vanilla JS + Bootstrap CSS
 * STACK ........: Vite + React + TypeScript + TanStack Query v5 + Bootstrap 5
 * ARCHITECTURE .: ONE component file holds all layout + logic (per spec).
 *                 Styles live in ../styles/recovery.module.css (CSS Module).
 * REPO NOTES ...: tuned for dlion4/danstack — no new packages; art is served
 *                 from /public/assets; fonts come from routes/__root.tsx.
 *
 * EVERY INTERACTION FROM THE LEGACY PAGE IS MAINTAINED:
 *   3-step flow (method -> verify -> reset) + success state, 4 recovery
 *   methods (email / sms / security questions / magic link), 6-digit OTP
 *   boxes with auto-advance, Backspace focus-back and full paste support,
 *   60s resend countdown, magic-link auto-advance after 3s, shake-on-error,
 *   Enter-key submit, password strength meter with 4 live requirement rows,
 *   confirm-match gate, eye toggles, "log out all devices", success screen.
 *
 * LEGACY BRIDGE MAP (vanilla JS -> React):
 *   state vars (currentStep/selectedMethod/resendInterval) . useState + refs
 *   .tab-btn show/hide ................. selectedMethod state mapping
 *   goToStep() display toggling ........ step state + conditional classes
 *   handleContinue() validation+shake .. form submit + shakeKey counter
 *   document keypress Enter ............ native form onSubmit (a11y upgrade)
 *   OTP input/paste listeners .......... otpRefs DOM bridge + setOtpDigit
 *   startResendTimer() setInterval ..... resendTick effect (cleaned)
 *   strength innerHTML updates ......... derived data render (.map())
 * ========================================================================== */

import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import styles from '../styles/recovery.module.css';

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */
type RecoveryMethod = 'email' | 'sms' | 'questions' | 'magic';
type Tone = 'featMint' | 'featPurple' | 'featGreen';

interface RecoveryConfig {
  brand: {
    title: string;
    copy: string;
    features: Array<{ icon: string; tone: Tone; title: string; sub: string }>;
  };
  methods: Array<{ id: RecoveryMethod; icon: string; label: string }>;
  verifyIcons: Record<RecoveryMethod, string>;
  verifySubtitles: Record<RecoveryMethod, string>;
  securityQuestions: string[];
  passwordRequirements: string[];
  magicExpiryNote: string;
  resendSeconds: number;
  magicRedirectMs: number;
  loginRoute: string;
}

/* --------------------------------------------------------------------------
 * 1. initialMockData — every repeating/hardcoded block extracted from legacy
 *    markup + script. GET /api/recovery-config returns this same shape.
 * ------------------------------------------------------------------------ */
const initialMockData: RecoveryConfig = {
  brand: {
    title: 'Secure Account Recovery',
    copy: "We'll help you regain access to your account safely. Your security is our priority.",
    features: [
      { icon: 'bi-shield-check', tone: 'featMint', title: 'End-to-End Encrypted', sub: '256-bit encryption' },
      { icon: 'bi-eye-slash', tone: 'featPurple', title: 'Privacy Protected', sub: 'Zero-knowledge architecture' },
      { icon: 'bi-clock-history', tone: 'featGreen', title: 'Fast Recovery', sub: 'Under 2 minutes' },
    ],
  },

  methods: [
    { id: 'email', icon: 'bi-envelope', label: 'Email' },
    { id: 'sms', icon: 'bi-phone', label: 'SMS' },
    { id: 'questions', icon: 'bi-shield-question', label: 'Security Qs' },
    { id: 'magic', icon: 'bi-link-45deg', label: 'Magic Link' },
  ],

  verifyIcons: {
    email: 'bi-envelope-check',
    sms: 'bi-phone',
    questions: 'bi-shield-question',
    magic: 'bi-link-45deg',
  },

  verifySubtitles: {
    email: 'Enter the 6-digit code sent to your email',
    sms: 'Enter the 6-digit code sent to your phone',
    questions: 'Answer your security questions to verify identity',
    magic: 'Open the magic link we sent to your email',
  },

  securityQuestions: [
    "What is your mother's maiden name?",
    'What was the name of your first pet?',
    'What city were you born in?',
  ],

  passwordRequirements: [
    'At least 8 characters',
    'One uppercase letter',
    'One number',
    'One special character',
  ],

  magicExpiryNote: "We'll send a secure link to reset your password. Link expires in 15 minutes.",
  resendSeconds: 60,
  magicRedirectMs: 3000,
  loginRoute: '/login',
};

/* --------------------------------------------------------------------------
 * 2. API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
async function fetchRecoveryConfig(): Promise<RecoveryConfig> {
  const response = await fetch('/api/recovery-config', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Recovery config API responded HTTP ${response.status}`);
  return response.json() as Promise<RecoveryConfig>;
}

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */
const s = styles as Record<string, string>;
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

const STRENGTH_COLORS = ['#ef4444', '#fbbf24', '#52d689', '#2ee6a0'];

function strengthOf(password: string): boolean[] {
  return [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
}

/* --------------------------------------------------------------------------
 * 3. COMPONENT
 * ------------------------------------------------------------------------ */
export default function Recovery() {
  /* ---------- TanStack Query ---------- */
  const { data: apiData, error, isLoading } = useQuery({
    queryKey: ['paymo-recovery-config'],
    queryFn: fetchRecoveryConfig,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  // Falls back to initialMockData while the API is unreachable; the error
  // banner below surfaces that failure state to the user.
  const content = apiData ?? initialMockData;

  /* ---------- wizard state (legacy currentStep / selectedMethod) ---------- */
  const [step, setStep] = useState(1); // 1 method · 2 verify · 3 reset · 0 success
  const [method, setMethod] = useState<RecoveryMethod>('email');
  const [shakeKey, setShakeKey] = useState(0); // bump to replay .shake

  /* method inputs */
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [identifierInput, setIdentifierInput] = useState('');
  const [magicEmailInput, setMagicEmailInput] = useState('');

  /* verification */
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [resendLeft, setResendLeft] = useState(content.resendSeconds);
  const [resendActive, setResendActive] = useState(false);
  const [resentFlash, setResentFlash] = useState(false);

  /* reset password */
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [logoutDevices, setLogoutDevices] = useState(true);
  const [resetting, setResetting] = useState(false);

  /* ---------- refs (legacy DOM bridges) ---------- */
  const cardRef = useRef<HTMLDivElement | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
  }, []);

  /* ---------- derived validation (legacy checkPasswordMatch) ---------- */
  const reqMet = strengthOf(newPwd);
  const score = reqMet.filter(Boolean).length;
  const matchOk = confirmPwd.length > 0 && newPwd === confirmPwd;
  const resetReady = reqMet.every(Boolean) && matchOk;

  const step1Ready =
    (method === 'email' && emailInput.trim().length > 0) ||
    (method === 'sms' && phoneInput.trim().length > 0) ||
    (method === 'questions' && identifierInput.trim().length > 0) ||
    (method === 'magic' && magicEmailInput.trim().length > 0);

  const verifyReady =
    method === 'questions' ? answers.every((a) => a.trim().length > 0) : otp.every((d) => d.length === 1);

  /* LEGACY BRIDGE: goToStep(step) — legacy toggled section display and step
     dots; React derives both from `step` state. */
  const goToStep = (next: number) => {
    setStep(next);
    cardRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* LEGACY BRIDGE: startResendTimer() setInterval — effect-based countdown
     with proper cleanup; begins when an OTP method enters step 2. */
  useEffect(() => {
    if (step !== 2 || method === 'questions' || method === 'magic' || !resendActive) return undefined;
    if (resendLeft <= 0) {
      setResendActive(false);
      return undefined;
    }
    const id = setTimeout(() => setResendLeft((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [step, method, resendActive, resendLeft]);

  /* LEGACY BRIDGE: setupVerification() magic-section auto-advance —
     legacy setTimeout(() => goToStep(3), 3000). */
  useEffect(() => {
    if (step === 2 && method === 'magic') {
      const id = setTimeout(() => goToStep(3), content.magicRedirectMs);
      return () => clearTimeout(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, method, content.magicRedirectMs]);

  /* ---------- step 1 continue (legacy handleContinue) ---------- */
  const handleContinue = (e: FormEvent) => {
    e.preventDefault();
    if (!step1Ready) {
      setShakeKey((k) => k + 1); // legacy: input.classList.add('shake')
      return;
    }
    if (method === 'email' || method === 'sms') {
      setResendLeft(content.resendSeconds);
      setResendActive(true);
    }
    setOtp(['', '', '', '', '', '']);
    goToStep(2);
  };

  /* ---------- resend (legacy handleResend + innerHTML flash) ---------- */
  const handleResend = () => {
    setResendLeft(content.resendSeconds);
    setResendActive(true);
    setResentFlash(true);
    later(() => setResentFlash(false), 2000);
  };

  /* ---------- OTP boxes (legacy .otp-input listeners) ---------- */
  const setOtpDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < otpRefs.current.length - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  /* LEGACY BRIDGE: legacy paste listener split 6 chars across inputs. */
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!data) return;
    setOtp((prev) => {
      const next = [...prev];
      data.split('').forEach((ch, i) => {
        next[i] = ch;
      });
      return next;
    });
    otpRefs.current[Math.min(data.length, 6) - 1]?.focus();
  };

  /* ---------- step 2 verify (legacy handleVerify) ---------- */
  const handleVerify = (e: FormEvent) => {
    e.preventDefault();
    if (!verifyReady) {
      setShakeKey((k) => k + 1);
      return;
    }
    goToStep(3);
  };

  /* ---------- step 3 reset (legacy handleReset spinner -> success) ---------- */
  const handleReset = (e: FormEvent) => {
    e.preventDefault();
    if (!resetReady || resetting) return;
    setResetting(true);
    later(() => {
      setResetting(false);
      goToStep(0); // success state (legacy hid .step-indicator here)
    }, 2000);
  };

  /* ------------------------------------------------------------------------
   * 4. TEMPLATE (JSX)
   * ---------------------------------------------------------------------- */
  return (
    <div className={s.recoveryPage}>
      {/* ===== TanStack Query: loading spinner ===== */}
      {isLoading && (
        <div className={s.loadingOverlay} role="status" aria-live="polite">
          <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
          <span>Loading recovery configuration…</span>
        </div>
      )}

      {/* ===== TanStack Query: error banner ===== */}
      {error && (
        <div className={cx('alert alert-danger alert-dismissible fade show', s.errorBanner)} role="alert">
          <strong>
            <i className="bi bi-exclamation-triangle me-2" />
            Recovery config unavailable
          </strong>
          <div className="small mt-1">
            <code>/api/recovery-config</code> — {error.message}. Using bundled configuration.
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
        </div>
      )}

      {/* background blobs (legacy fixed blobs) */}
      <div className={s.blob} style={{ width: '500px', height: '500px', background: '#2ee6a0', top: '-160px', right: '-120px' }} />
      <div className={s.blob} style={{ width: '380px', height: '380px', background: '#0a7a54', bottom: '-100px', left: '-60px', animationDelay: '-6s' }} />

      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }}>
        <div className="row g-4 align-items-center w-100">
          {/* ================= LEFT: brand visual ================= */}
          <div className="col-lg-6 d-none d-lg-block">
            <div className="position-relative">
              <div className={s.brandArt} />
              <div className={s.brandShade} />
              <div style={{ position: 'relative', zIndex: 2, padding: '3rem' }}>
                <div className={cx(s.logoMark, 'mb-3')}>P</div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: '#fff' }}>{content.brand.title}</h2>
                <p className={s.mutedText} style={{ fontSize: '1.1rem', maxWidth: '400px', lineHeight: 1.6 }}>
                  {content.brand.copy}
                </p>
                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {content.brand.features.map((feat) => (
                    <div className={s.featRow} key={feat.title}>
                      <div className={cx(s.featIcon, s[feat.tone])}>
                        <i className={`bi ${feat.icon}`} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--rc-ink-0)' }}>{feat.title}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--rc-ink-3)' }}>{feat.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: recovery card ================= */}
          <div className="col-lg-6">
            <div className={cx(s.glassStrong, 'p-4 p-md-5')} style={{ maxWidth: '480px', margin: '0 auto' }} ref={cardRef}>
              {/* logo */}
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className={s.logoMark}>P</div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--rc-ink-0)' }}>
                    Paymo <span className={s.textGradient}>BAAS</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--rc-ink-3)' }}>Secure Recovery</div>
                </div>
              </div>

              {/* step indicator (hidden on success, as legacy did) */}
              {step > 0 && (
                <div className={s.stepIndicator}>
                  {[1, 2, 3].map((dot, i) => (
                    <div key={dot} style={{ display: 'contents' }}>
                      <div className={cx(s.stepDot, step > dot && s.completed, step === dot && s.active)}>
                        {step > dot ? <i className="bi bi-check-lg" /> : dot}
                      </div>
                      {i < 2 && <div className={s.stepLine} />}
                    </div>
                  ))}
                </div>
              )}

              {/* ===== STEP 1: choose method ===== */}
              {step === 1 && (
                <form onSubmit={handleContinue} noValidate>
                  <h3 className={s.brandTitleSm} style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--rc-ink-0)' }}>
                    Recover Your Account
                  </h3>
                  <p className={s.mutedText} style={{ marginBottom: '1.5rem' }}>
                    Choose how you&apos;d like to verify your identity
                  </p>

                  <div className={s.tabContainer} role="tablist" aria-label="Recovery method">
                    {content.methods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        role="tab"
                        aria-selected={method === m.id}
                        className={cx(s.tabBtn, method === m.id && s.active)}
                        onClick={() => setMethod(m.id)}
                      >
                        <i className={`bi ${m.icon}`} />
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* method panes (legacy .method-content display toggling) */}
                  <div key={shakeKey} className={shakeKey > 0 && !step1Ready ? s.shake : undefined}>
                    {method === 'email' && (
                      <div className={s.formGroup}>
                        <label className={s.formLabel} htmlFor="rcEmail">Email Address</label>
                        <input type="email" className={s.formInput} id="rcEmail" placeholder="your@email.com"
                          autoComplete="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} />
                      </div>
                    )}
                    {method === 'sms' && (
                      <div className={s.formGroup}>
                        <label className={s.formLabel} htmlFor="rcPhone">Phone Number</label>
                        <input type="tel" className={s.formInput} id="rcPhone" placeholder="+254 700 000 000"
                          autoComplete="tel" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
                      </div>
                    )}
                    {method === 'questions' && (
                      <div className={s.formGroup}>
                        <label className={s.formLabel} htmlFor="rcIdentifier">Email or Phone</label>
                        <input type="text" className={s.formInput} id="rcIdentifier" placeholder="your@email.com or +254..."
                          value={identifierInput} onChange={(e) => setIdentifierInput(e.target.value)} />
                      </div>
                    )}
                    {method === 'magic' && (
                      <>
                        <div className={s.formGroup}>
                          <label className={s.formLabel} htmlFor="rcMagicEmail">Email Address</label>
                          <input type="email" className={s.formInput} id="rcMagicEmail" placeholder="your@email.com"
                            value={magicEmailInput} onChange={(e) => setMagicEmailInput(e.target.value)} />
                        </div>
                        <div className={s.infoBox}>
                          <i className="bi bi-info-circle" style={{ color: 'var(--rc-accent)', marginRight: '0.5rem' }} />
                          <span style={{ fontSize: '0.85rem', color: 'var(--rc-ink-2)' }}>{content.magicExpiryNote}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <button type="submit" className={cx(s.btnPaymo, 'w-100 mt-3')} disabled={!step1Ready}>
                    Continue <i className="bi bi-arrow-right ms-1" />
                  </button>

                  <div className="mt-4" style={{ textAlign: 'center' }}>
                    <a href={content.loginRoute} style={{ fontSize: '0.9rem' }}>
                      <i className="bi bi-arrow-left me-1" /> Back to Sign In
                    </a>
                  </div>
                </form>
              )}

              {/* ===== STEP 2: verification ===== */}
              {step === 2 && (
                <form onSubmit={handleVerify} noValidate>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div className={cx(s.medallion, s.medallionMint)}>
                      <i className={`bi ${content.verifyIcons[method]}`} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--rc-ink-0)' }}>
                      Verify Your Identity
                    </h3>
                    <p className={s.mutedText} style={{ marginBottom: 0 }}>{content.verifySubtitles[method]}</p>
                  </div>

                  <div key={`verify-${shakeKey}`} className={shakeKey > 0 && !verifyReady ? s.shake : undefined}>
                    {/* OTP (email/sms) */}
                    {(method === 'email' || method === 'sms') && (
                      <div>
                        <div className={s.otpContainer}>
                          {otp.map((digit, i) => (
                            <input
                              key={i}
                              ref={(el) => { otpRefs.current[i] = el; }}
                              type="text"
                              inputMode="numeric"
                              className={s.otpInput}
                              maxLength={1}
                              aria-label={`Code digit ${i + 1}`}
                              value={digit}
                              onChange={(e) => setOtpDigit(i, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(i, e.key)}
                              onPaste={handleOtpPaste}
                            />
                          ))}
                        </div>

                        {resendActive && resendLeft > 0 && (
                          <div className={s.timerText}>
                            Didn&apos;t receive the code? Resend in <span className={s.countdown}>{resendLeft}</span>s
                          </div>
                        )}
                        {(!resendActive || resendLeft <= 0) && (
                          <button type="button" className={cx(s.btnOutline, 'w-100 mt-3')} onClick={handleResend}>
                            {resentFlash
                              ? (<><i className="bi bi-check-circle me-1" /> Code Resent!</>)
                              : (<><i className="bi bi-arrow-clockwise me-1" /> Resend Code</>)}
                          </button>
                        )}
                      </div>
                    )}

                    {/* security questions */}
                    {method === 'questions' && (
                      <div>
                        {content.securityQuestions.map((q, i) => (
                          <div className={s.formGroup} key={q}>
                            <label className={s.formLabel} htmlFor={`rcAnswer${i}`}>{q}</label>
                            <input
                              type="text"
                              className={s.formInput}
                              id={`rcAnswer${i}`}
                              placeholder="Your answer"
                              value={answers[i]}
                              onChange={(e) => {
                                const next = [...answers];
                                next[i] = e.target.value;
                                setAnswers(next);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* magic link status */}
                    {method === 'magic' && (
                      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div className={s.successIcon}>
                          <i className="bi bi-check-lg" />
                        </div>
                        <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--rc-ink-0)' }}>Check Your Email</h4>
                        <p className={s.mutedText} style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                          We&apos;ve sent a secure recovery link to<br />
                          <strong style={{ color: 'var(--rc-accent)' }}>{magicEmailInput || 'your email'}</strong>
                        </p>
                        <div className={s.infoBox} style={{ textAlign: 'left' }}>
                          <i className="bi bi-clock" style={{ color: 'var(--rc-accent)', marginRight: '0.5rem' }} />
                          <span style={{ fontSize: '0.85rem', color: 'var(--rc-ink-2)' }}>Link expires in 15 minutes</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {method !== 'magic' && (
                    <button type="submit" className={cx(s.btnPaymo, 'w-100 mt-3')} disabled={!verifyReady}>
                      Verify <i className="bi bi-check-circle ms-1" />
                    </button>
                  )}

                  <button type="button" className={cx(s.btnOutline, 'w-100 mt-2')} onClick={() => goToStep(1)}>
                    <i className="bi bi-arrow-left me-1" /> Change Method
                  </button>
                </form>
              )}

              {/* ===== STEP 3: reset password ===== */}
              {step === 3 && (
                <form onSubmit={handleReset} noValidate>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div className={cx(s.medallion, s.medallionPurple)}>
                      <i className="bi bi-lock" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--rc-ink-0)' }}>
                      Create New Password
                    </h3>
                    <p className={s.mutedText} style={{ marginBottom: 0 }}>Choose a strong, unique password</p>
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.formLabel} htmlFor="newPassword">New Password</label>
                    <div className="position-relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        className={s.formInput}
                        id="newPassword"
                        placeholder="Enter new password"
                        style={{ paddingRight: '3rem' }}
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                      />
                      <button type="button" className={s.eyeBtn} aria-label={showNew ? 'Hide password' : 'Show password'}
                        onClick={() => setShowNew((v) => !v)}>
                        <i className={showNew ? 'bi bi-eye-slash' : 'bi bi-eye'} />
                      </button>
                    </div>
                    {/* LEGACY BRIDGE: strengthBar width/background per score */}
                    <div className={s.strengthTrack}>
                      <div
                        className={s.strengthBar}
                        style={{
                          width: `${(score / 4) * 100}%`,
                          background: score > 0 ? STRENGTH_COLORS[score - 1] : 'transparent',
                        }}
                      />
                    </div>
                    <div style={{ marginTop: '0.7rem', display: 'grid', gap: '0.2rem' }}>
                      {content.passwordRequirements.map((req, i) => (
                        <div className={cx(s.reqRow, reqMet[i] && s.met)} key={req}>
                          <i className={reqMet[i] ? 'bi bi-check-circle-fill' : 'bi bi-circle'} />
                          {req}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={s.formGroup}>
                    <label className={s.formLabel} htmlFor="confirmPassword">Confirm Password</label>
                    <div className="position-relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        className={s.formInput}
                        id="confirmPassword"
                        placeholder="Confirm new password"
                        style={{ paddingRight: '3rem' }}
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                      />
                      <button type="button" className={s.eyeBtn} aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        onClick={() => setShowConfirm((v) => !v)}>
                        <i className={showConfirm ? 'bi bi-eye-slash' : 'bi bi-eye'} />
                      </button>
                    </div>
                  </div>

                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="logoutDevices"
                      checked={logoutDevices}
                      onChange={(e) => setLogoutDevices(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="logoutDevices"
                      style={{ color: 'var(--rc-ink-2)', fontSize: '0.85rem' }}>
                      Log out all other devices
                    </label>
                  </div>

                  <button type="submit" className={cx(s.btnPaymo, 'w-100')} disabled={!resetReady || resetting}>
                    {resetting
                      ? (<><span className="spinner-border spinner-border-sm me-2" /> Resetting...</>)
                      : (<>Reset Password <i className="bi bi-arrow-right ms-1" /></>)}
                  </button>
                </form>
              )}

              {/* ===== SUCCESS ===== */}
              {step === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div className={s.successIcon}>
                    <i className="bi bi-check-lg" />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--rc-ink-0)' }}>
                    Password Reset Successfully
                  </h3>
                  <p className={s.mutedText} style={{ marginBottom: '1.5rem' }}>
                    Your account is now secured. You can sign in with your new password.
                  </p>
                  <a href={content.loginRoute} className={cx(s.btnPaymo, 'w-100 d-inline-flex align-items-center justify-content-center')}>
                    Go to Sign In <i className="bi bi-arrow-right ms-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
