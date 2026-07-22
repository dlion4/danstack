/* ============================================================================
 * Register.tsx — Paymo BAAS Create Account (Emerald Glass Edition)
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: legacy page52.html (1715 LOC) — vanilla JS + Bootstrap CSS
 * STACK ........: Vite + React + TypeScript + TanStack Query v5 + Bootstrap 5
 * ARCHITECTURE .: ONE component file holds all layout + logic (per spec).
 *                 Styles live in ../styles/register.module.css (CSS Module).
 * REPO NOTES ...: Fabia-tuned for dlion4/danstack — no new packages; art is
 *                 served from /public/assets; fonts come from routes/__root.tsx.
 *
 * EVERY INTERACTION FROM THE LEGACY PAGE IS MAINTAINED:
 *   5-step wizard (type → basic → KYC → security → success), per-type
 *   conditional fields (business KYB, developer extras), social pre-fill,
 *   per-type progress steps, drag&drop uploads, liveness capture, staged
 *   verification animation, password strength meter + match check, 6-digit
 *   PIN boxes with auto-advance focus, passkey/biometric toggles, consent,
 *   API-key copy, per-type next steps, and confetti celebration.
 *
 * LEGACY BRIDGE MAP (vanilla JS -> React):
 *   state{} object .................. useState fields (acctType, step, flags…)
 *   step-pane DOM toggling .......... currentStep state + conditional classes
 *   buildSteps()/innerHTML .......... STEP_CONFIG map rendered via .map()
 *   validateBasic()/checkSecurity() . derived booleans from controlled inputs
 *   pin-box focus chain ............. pinRefs array (DOM ref bridge)
 *   file inputs/drag-drop ........... ref-based hidden <input type="file">
 *   verify stage setInterval ........ interval in ref, cleaned on unmount
 *   fireConfetti() body.appendChild . confettiHostRef DOM sandbox in useEffect
 * ========================================================================== */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
if (typeof document !== 'undefined') {
  import('bootstrap/dist/js/bootstrap.bundle.min.js')
}
import styles from '../styles/register.module.css';

/* --------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------ */
type AccountType = 'personal' | 'business' | 'developer';
type Tone = 'toneMint' | 'toneBlue' | 'toneGold';

interface AccountTypeCard {
  id: AccountType;
  icon: string;
  tone: Tone;
  title: string;
  badge?: { label: string; kind: 'badgeOk' | 'badgeGold' };
  text: string;
  tags: string[];
}

interface NextStep { ic: string; c: string; t: string; s: string; }

interface RegistrationConfig {
  banner: { pill: string; titleTop: string; titleAccent: string; copy: string };
  brandFeatures: Array<{ icon: string; title: string; sub: string }>;
  brandStats: Array<{ value: string; label: string }>;
  socialProviders: Array<{ id: string; icon: string; color?: string }>;
  accountTypes: AccountTypeCard[];
  stepConfig: Record<AccountType, string[]>;
  countryCodes: string[];
  countries: Array<{ value: string; label: string }>;
  businessTypes: string[];
  monthlyVolumes: string[];
  devUseCases: string[];
  devLanguages: string[];
  docTypes: string[];
  verifyStages: string[];
  nextSteps: Record<AccountType, NextStep[]>;
  confettiColors: string[];
  sandboxApiKey: string;
  footLinks: string[];
}

/* --------------------------------------------------------------------------
 * 1. initialMockData — every repeating/hardcoded block extracted from legacy
 *    markup + script. GET /api/registration-config returns this same shape.
 * ------------------------------------------------------------------------ */
const initialMockData: RegistrationConfig = {
  banner: {
    pill: 'Free to join · 2-minute setup',
    titleTop: 'Your financial world, ',
    titleAccent: 'unified.',
    copy: 'Join 2M+ people and businesses building, banking, and moving money across Africa and the world.',
  },

  brandFeatures: [
    { icon: 'bi-shield-lock', title: 'Bank-grade security', sub: '256-bit encryption · PCI DSS L1 · SOC 2' },
    { icon: 'bi-lightning-charge', title: 'Instant onboarding', sub: 'No paperwork, no branch visits' },
    { icon: 'bi-globe-africa', title: '25+ markets, 40+ currencies', sub: 'One account, borderless reach' },
  ],

  brandStats: [
    { value: '2M+', label: 'USERS' },
    { value: '99.9%', label: 'UPTIME' },
    { value: 'Free', label: 'TO JOIN' },
  ],

  socialProviders: [
    { id: 'Google', icon: 'bi-google', color: '#ea4335' },
    { id: 'Apple', icon: 'bi-apple' },
    { id: 'Microsoft', icon: 'bi-microsoft', color: '#00a4ef' },
    { id: 'LinkedIn', icon: 'bi-linkedin', color: '#0a66c2' },
  ],

  accountTypes: [
    {
      id: 'personal', icon: 'bi-person', tone: 'toneMint',
      title: 'Personal Account',
      text: 'Send money, pay bills, shop online, and manage your finances across Africa.',
      tags: ['Individuals', 'Freelancers'],
    },
    {
      id: 'business', icon: 'bi-shop', tone: 'toneBlue',
      title: 'Business Account', badge: { label: 'Free setup', kind: 'badgeOk' },
      text: 'Accept payments, pay suppliers, manage payroll, and access working capital.',
      tags: ['SMEs', 'E-commerce'],
    },
    {
      id: 'developer', icon: 'bi-code-slash', tone: 'toneGold',
      title: 'Developer Account', badge: { label: 'Free API credits', kind: 'badgeGold' },
      text: 'Build financial products with our APIs. Sandbox, docs, and community.',
      tags: ['Fintech founders', 'Neobank builders'],
    },
  ],

  stepConfig: {
    personal: ['Basic Info', 'Identity', 'Security'],
    business: ['Business Info', 'KYB', 'Security'],
    developer: ['Profile', 'Verification', 'Security'],
  },

  countryCodes: ['🇳🇬 +234', '🇰🇪 +254', '🇬🇭 +233', '🇿🇦 +27', '🇺🇬 +256', '🇬🇧 +44', '🇺🇸 +1'],

  countries: [
    { value: 'NG', label: 'Nigeria' },
    { value: 'KE', label: 'Kenya' },
    { value: 'GH', label: 'Ghana' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'UG', label: 'Uganda' },
    { value: 'TZ', label: 'Tanzania' },
    { value: 'RW', label: 'Rwanda' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'US', label: 'United States' },
  ],

  businessTypes: ['Sole Proprietorship', 'Partnership', 'LLC', 'PLC', 'NGO', 'Cooperative'],
  monthlyVolumes: ['Under $1K', '$1K–$10K', '$10K–$100K', '$100K–$1M', '$1M+'],
  devUseCases: ['Neobank', 'E-commerce', 'Remittance', 'Lending', 'Treasury', 'Other'],
  devLanguages: ['Node.js', 'Python', 'Go', 'PHP', 'Flutter', 'Java'],
  docTypes: ['International Passport', 'National ID Card', "Driver's License", "Voter's Card"],
  verifyStages: ['Analyzing document…', 'Matching selfie to ID…', 'Running compliance checks…', 'Verified ✓'],

  nextSteps: {
    personal: [
      { ic: 'bi-wallet2', c: '#9ff5cd', t: 'Add money to your wallet', s: 'Fund via bank, card, or mobile money' },
      { ic: 'bi-receipt', c: '#9ccafc', t: 'Set up your first bill payment', s: 'Electricity, airtime, subscriptions' },
      { ic: 'bi-people', c: '#fcd34d', t: 'Invite friends and earn', s: 'Get rewards for every referral' },
    ],
    business: [
      { ic: 'bi-building-check', c: '#9ff5cd', t: 'Complete your business profile', s: 'Unlock higher limits' },
      { ic: 'bi-person-plus', c: '#9ccafc', t: 'Add your first team member', s: 'Assign roles & permissions' },
      { ic: 'bi-link-45deg', c: '#fcd34d', t: 'Create a payment link', s: 'Start accepting payments instantly' },
    ],
    developer: [
      { ic: 'bi-book', c: '#9ff5cd', t: 'Explore the API docs', s: 'REST, GraphQL & 10+ SDKs' },
      { ic: 'bi-discord', c: '#9ccafc', t: 'Join the Discord community', s: '2,400+ developers' },
      { ic: 'bi-rocket', c: '#fcd34d', t: 'Build your first integration', s: 'Make an API call in 30 seconds' },
    ],
  },

  confettiColors: ['#2ee6a0', '#7cf5c8', '#14b981', '#f5b64d', '#52d689'],
  sandboxApiKey: 'pk_sandbox_3xK9mP2qR7vL8nW4hT6yB1cF',
  footLinks: ['Privacy', 'Terms', 'Cookie Settings', 'Help'],
};

/* --------------------------------------------------------------------------
 * 2. API LAYER — point at the real backend when ready.
 * ------------------------------------------------------------------------ */
async function fetchRegistrationConfig(): Promise<RegistrationConfig> {
  const response = await fetch('/api/registration-config', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Registration config API responded HTTP ${response.status}`);
  return response.json() as Promise<RegistrationConfig>;
}

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */
const s = styles as Record<string, string>;
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordStrength(value: string): number {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

const STRENGTH_COLORS = ['#ef4444', '#fbbf24', '#4ea1ff', '#2ee6a0'];
const STRENGTH_LABELS = ['Weak', 'Fair', 'Strong', 'Very Strong'];

const PANEL_COPY: Record<AccountType, { title: string; sub: string }> = {
  personal: { title: 'Create your personal account', sub: 'Tell us a bit about yourself.' },
  business: { title: 'Create your business account', sub: 'Set up your business profile.' },
  developer: { title: 'Create your developer account', sub: 'Set up your developer profile.' },
};

/* --------------------------------------------------------------------------
 * 3. COMPONENT
 * ------------------------------------------------------------------------ */
export default function Register() {
  /* ---------- TanStack Query ---------- */
  const { data: apiData, error, isLoading } = useQuery({
    queryKey: ['paymo-registration-config'],
    queryFn: fetchRegistrationConfig,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  // Falls back to initialMockData while the API is unreachable; the error
  // banner below surfaces that failure state to the user.
  const content = apiData ?? initialMockData;

  /* ---------- wizard state (legacy `state` object) ---------- */
  const [step, setStep] = useState(0); // 0 type · 1 basic · 2 kyc · 3 security · 4 success
  const [acctType, setAcctType] = useState<AccountType | null>(null);
  const [socialConnecting, setSocialConnecting] = useState<string | null>(null);

  /* basic info */
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [bizName, setBizName] = useState('');
  const [email, setEmail] = useState('');
  const [cc, setCc] = useState('🇳🇬 +234');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [country, setCountry] = useState('NG');
  const [useCase, setUseCase] = useState(content.devUseCases[0]);
  const [langs, setLangs] = useState<string[]>([]);
  const [bizType, setBizType] = useState(content.businessTypes[0]);
  const [volume, setVolume] = useState(content.monthlyVolumes[0]);
  const [referral, setReferral] = useState('');

  /* KYC */
  const [docType, setDocType] = useState(content.docTypes[0]);
  const [docFile, setDocFile] = useState<string | null>(null);
  const [docDrag, setDocDrag] = useState(false);
  const [bizFileCount, setBizFileCount] = useState(0);
  const [selfieState, setSelfieState] = useState<'idle' | 'capturing' | 'done'>('idle');
  const [verifying, setVerifying] = useState(false);
  const [verifyStage, setVerifyStage] = useState(0);

  /* security */
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2Raw] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', '']);
  const [passkeyOn, setPasskeyOn] = useState(false);
  const [bioOn, setBioOn] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [creating, setCreating] = useState(false);

  /* success */
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [dashLoading, setDashLoading] = useState(false);
  const [dashNote, setDashNote] = useState(false);

  /* ---------- refs (legacy DOM bridges) ---------- */
  const panelRef = useRef<HTMLDivElement | null>(null);
  const confettiHostRef = useRef<HTMLDivElement | null>(null);
  const pinRefs = useRef<Array<HTMLInputElement | null>>([]);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const bizInputRef = useRef<HTMLInputElement | null>(null);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const verifyIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
    if (verifyIntervalRef.current) clearInterval(verifyIntervalRef.current);
  }, []);

  /* ---------- derived validation (legacy validateBasic / checkSecurity) ---------- */
  const isBusiness = acctType === 'business';
  const isDeveloper = acctType === 'developer';

  const emailOk = email.length > 0 ? EMAIL_RE.test(email.trim()) : null;
  const dobError = !isDeveloper && dob.length > 0
    ? (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000) < 18
    : false;
  const basicReady = !!first.trim() && !!last.trim() && emailOk === true && !!phone.trim() && !dobError;

  const pwdScore = passwordStrength(pwd);
  const pwdMatch = pwd.length > 0 && pwd2.length > 0 && pwd === pwd2;
  const pwd2Touched = pwd2.length > 0;
  const pinComplete = pin.every((d) => d.length === 1);
  const securityReady = pwdScore >= 2 && pwdMatch && pinComplete && agreeTerms && agreeAge;

  const kycReady = !!docFile && selfieState === 'done';

  /* ---------- step navigation (legacy goStep) ---------- */
  const goStep = useCallback((n: number) => {
    setStep(n);
    panelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const panelHeading = (() => {
    if (step === 0) return { title: 'Create your account', sub: 'Choose the account type that fits you best.' };
    if (step === 1 && acctType) return PANEL_COPY[acctType];
    if (step === 2) return { title: 'Verify your identity', sub: 'Required for secure financial services.' };
    if (step === 3) return { title: 'Secure your account', sub: "Set up how you'll sign in." };
    return { title: 'Welcome aboard', sub: 'Your account is ready to go.' };
  })();

  /* ---------- type + social (legacy typeContinue / [data-social]) ---------- */
  const handleSocial = (provider: { id: string }) => {
    if (socialConnecting) return;
    setSocialConnecting(provider.id);
    later(() => {
      setSocialConnecting(null);
      if (!acctType) setAcctType('personal');
      // legacy prefill demo:
      setFirst('Amara');
      setLast('Okafor');
      setEmail(`amara.okafor@${provider.id.toLowerCase()}.com`);
      goStep(1);
    }, 900);
  };

  /* ---------- dev language chips (legacy .lang-chip toggling) ---------- */
  const toggleLang = (lang: string) => {
    setLangs((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
  };

  /* ---------- KYC uploads (legacy docUpload/selfieZone/bizUpload) ---------- */
  const handleDocFile = (file?: File | null) => {
    if (file) setDocFile(file.name);
  };

  const handleSelfieCapture = () => {
    if (selfieState !== 'idle') return;
    setSelfieState('capturing');
    later(() => setSelfieState('done'), 1400);
  };

  const handleBizFiles = (files: FileList | null) => {
    if (files && files.length) setBizFileCount(files.length);
  };

  /* staged verification animation (legacy setInterval over stages) */
  const handleKycContinue = () => {
    if (!kycReady || verifying) return;
    setVerifying(true);
    setVerifyStage(0);
    verifyIntervalRef.current = setInterval(() => {
      setVerifyStage((stage) => {
        const next = stage + 1;
        if (next >= content.verifyStages.length) {
          if (verifyIntervalRef.current) clearInterval(verifyIntervalRef.current);
          later(() => { setVerifying(false); goStep(3); }, 600);
          return stage;
        }
        return next;
      });
    }, 800);
  };

  /* ---------- PIN boxes (legacy .pin-box focus chain) ---------- */
  const handlePinChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setPin((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < pinRefs.current.length - 1) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  /* ---------- create account → success + confetti ---------- */
  /* LEGACY BRIDGE: fireConfetti() — direct DOM build inside an isolated host
     element (mirrors the legacy body.appendChild pattern). */
  const fireConfetti = useCallback(() => {
    const host = confettiHostRef.current;
    if (!host) return;
    for (let i = 0; i < 60; i += 1) {
      const piece = document.createElement('div');
      piece.className = s.confettiPiece;
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = content.confettiColors[Math.floor(Math.random() * content.confettiColors.length)];
      piece.style.animationDelay = `${Math.random() * 0.6}s`;
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      host.appendChild(piece);
      setTimeout(() => piece.remove(), 3500);
    }
  }, [content.confettiColors]);

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!securityReady || creating) return;
    setCreating(true);
    later(() => {
      setCreating(false);
      goStep(4);
      fireConfetti();
    }, 1500);
  };

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard?.writeText(content.sandboxApiKey);
    } catch { /* permissive */ }
    setApiKeyCopied(true);
    later(() => setApiKeyCopied(false), 1500);
  };

  const handleGotoDash = () => {
    setDashLoading(true);
    later(() => {
      setDashLoading(false);
      setDashNote(true); // legacy alert() replaced with an inline notice
    }, 800);
  };

  const successSteps = acctType ? content.nextSteps[acctType] : content.nextSteps.personal;

  const monoStyle: CSSProperties = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

  /* --------------------------------------------------------------------------
   * 4. TEMPLATE (JSX)
   * ------------------------------------------------------------------------ */
  return (
    <div className={s.authPage}>
      {/* ===== TanStack Query: loading spinner ===== */}
      {isLoading && (
        <div className={s.loadingOverlay} role="status" aria-live="polite">
          <div className="spinner-border" style={{ width: '3rem', height: '3rem' }} />
          <span>Loading registration configuration…</span>
        </div>
      )}

      {/* ===== TanStack Query: error banner ===== */}
      {error && (
        <div className={cx('alert alert-danger alert-dismissible fade show', s.errorBanner)} role="alert">
          <strong>
            <i className="bi bi-exclamation-triangle me-2" />
            Registration config unavailable
          </strong>
          <div className="small mt-1">
            <code>/api/registration-config</code> — {error.message}. Using bundled configuration.
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
        </div>
      )}

      <div className={s.authWrap}>
        {/* ================= LEFT BRAND PANEL ================= */}
        <div className={s.authBrand}>
          <div className={s.gridOverlay} />
          <div className={s.blob} style={{ width: '340px', height: '340px', background: '#2ee6a0', top: '-100px', left: '-80px' }} />
          <div className={s.blob} style={{ width: '280px', height: '280px', background: '#0a7a54', bottom: '-80px', right: '-60px', animationDelay: '-6s' }} />

          <div>
            <a href="/" className="d-flex align-items-center gap-2 mb-5">
              <span className={s.logoMark}>P</span>
              <span className="fw-bold text-white fs-5">Paymo <span className={s.textGradient}>BAAS</span></span>
            </a>
            <span className={cx(s.pill, 'mb-3')}><span className={s.pillDot} /> {content.banner.pill}</span>
            <h1 className={cx(s.brandTitle, 'mt-3')}>
              {content.banner.titleTop}
              <span className={s.textGradient}>{content.banner.titleAccent}</span>
            </h1>
            <p className={cx(s.mutedText, 'mt-3')} style={{ maxWidth: '380px' }}>{content.banner.copy}</p>
          </div>

          <div className={s.brandFeatsWrap}>
            {content.brandFeatures.map((feat) => (
              <div className={s.brandFeat} key={feat.title}>
                <div className={s.brandFeatIcon}><i className={`bi ${feat.icon}`} /></div>
                <div>
                  <div className="fw-semibold text-white" style={{ fontSize: '0.95rem' }}>{feat.title}</div>
                  <div className={s.dimText} style={{ fontSize: '0.82rem' }}>{feat.sub}</div>
                </div>
              </div>
            ))}

            <div className="row g-2 mt-3">
              {content.brandStats.map((stat) => (
                <div className="col-4" key={stat.label}>
                  <div className={s.statChip}>
                    <div className={cx(s.textGradient, 'fw-bold')} style={{ fontSize: '1.2rem' }}>{stat.value}</div>
                    <div className={s.dimText} style={{ fontSize: '0.65rem' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT FORM PANEL ================= */}
        <div className={s.authPanel} ref={panelRef}>
          <div className="my-auto py-3" style={{ width: '100%', maxWidth: '560px', margin: '0 auto' }}>
            {/* top row: title + sign in link */}
            <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
              <div>
                <h2 className={s.panelTitle}>{panelHeading.title}</h2>
                <p className={s.dimText} style={{ fontSize: '0.86rem', margin: 0 }}>{panelHeading.sub}</p>
              </div>
              <a href="/login" className={cx(s.btnOutline, 'btn btn-sm d-none d-sm-inline-flex')}>Sign in</a>
            </div>

            {/* progress bar (steps 1–3 only, labels depend on account type) */}
            {acctType && step >= 1 && step <= 3 && (
              <div>
                <div className={s.stepsBar}>
                  {content.stepConfig[acctType].map((label, i) => {
                    const stepIdx = i + 1;
                    return (
                      <div
                        key={label}
                        className={cx(s.stepNode, step > stepIdx && s.done, step === stepIdx && s.active)}
                      >
                        <span />
                      </div>
                    );
                  })}
                </div>
                <div className={s.stepLabels}>
                  {content.stepConfig[acctType].map((label, i) => {
                    const stepIdx = i + 1;
                    return (
                      <span key={label} className={cx(step > stepIdx && s.done, step === stepIdx && s.active)}>
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== STEP 0: ACCOUNT TYPE ===== */}
            <div className={cx(s.stepPane, step === 0 && s.active)}>
              <div className="mb-3">
                <div className="row g-2">
                  {content.socialProviders.map((provider) => (
                    <div className="col-6" key={provider.id}>
                      <button
                        type="button"
                        className={s.socialBtn}
                        onClick={() => handleSocial(provider)}
                        disabled={socialConnecting !== null}
                      >
                        {socialConnecting === provider.id
                          ? (<><span className={s.spinnerP} style={{ borderTopColor: '#c9ffe9', borderColor: 'rgba(201,255,233,.3)' }} /> Connecting…</>)
                          : (<><i className={`bi ${provider.icon}`} style={provider.color ? { color: provider.color } : undefined} /> {provider.id}</>)}
                      </button>
                    </div>
                  ))}
                </div>
                <div className={s.dividerRow}><span>or pick an account type</span></div>
              </div>

              <div className="row g-3">
                {content.accountTypes.map((card) => (
                  <div className="col-12" key={card.id}>
                    <div
                      className={cx(s.typeCard, acctType === card.id && s.selected)}
                      role="button"
                      tabIndex={0}
                      onClick={() => setAcctType(card.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAcctType(card.id); } }}
                    >
                      <div className={s.typeCheck}><i className="bi bi-check-lg" /></div>
                      <div className="d-flex gap-3">
                        <div className={cx(s.typeIcon, s[card.tone])}><i className={`bi ${card.icon}`} /></div>
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <h6 className={s.fieldTitle}>{card.title}</h6>
                            {card.badge && <span className={cx(s.badgeMini, s[card.badge.kind])}>{card.badge.label}</span>}
                          </div>
                          <p className={s.mutedText} style={{ fontSize: '0.84rem', margin: 0 }}>{card.text}</p>
                          <div className="mt-2 d-flex gap-1 flex-wrap">
                            {card.tags.map((tag) => (
                              <span key={tag} className={cx(s.badgeMini, s.badgeNative)}>{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className={cx(s.btnPaymo, 'w-100 mt-4')}
                disabled={!acctType}
                onClick={() => goStep(1)}
              >
                Continue <i className="bi bi-arrow-right ms-1" />
              </button>
              <p className="text-center mt-3" style={{ fontSize: '0.84rem', color: '#7fa694' }}>
                Already have an account? <a href="/login">Sign in</a>
              </p>
            </div>

            {/* ===== STEP 1: BASIC INFO ===== */}
            <div className={cx(s.stepPane, step === 1 && s.active)}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (basicReady) goStep(2);
                }}
                noValidate
              >
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className={s.formLabel} htmlFor="regFirst">First name</label>
                    <input id="regFirst" type="text" className="form-control" required placeholder="Amara"
                      value={first} onChange={(e) => setFirst(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className={s.formLabel} htmlFor="regLast">Last name</label>
                    <input id="regLast" type="text" className="form-control" required placeholder="Okafor"
                      value={last} onChange={(e) => setLast(e.target.value)} />
                  </div>

                  {isBusiness && (
                    <div className="col-12">
                      <label className={s.formLabel} htmlFor="regBizName">Business name</label>
                      <input id="regBizName" type="text" className="form-control" placeholder="Acme Trading Ltd"
                        value={bizName} onChange={(e) => setBizName(e.target.value)} />
                    </div>
                  )}

                  <div className="col-12">
                    <label className={s.formLabel} htmlFor="regEmail">Email address</label>
                    <input id="regEmail" type="email" className={cx('form-control', emailOk !== null && (emailOk ? s.inputValid : s.inputInvalid))}
                      required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    {emailOk === false && <div className={s.fieldErr}><i className="bi bi-exclamation-circle" /> Enter a valid email</div>}
                    {emailOk === true && <div className={s.fieldOk}><i className="bi bi-check-circle" /> Looks good</div>}
                  </div>

                  <div className="col-12">
                    <label className={s.formLabel} htmlFor="regPhone">Phone number</label>
                    <div className="input-group">
                      <select className="form-select" aria-label="Country code" style={{ maxWidth: '130px' }}
                        value={cc} onChange={(e) => setCc(e.target.value)}>
                        {content.countryCodes.map((code) => (
                          <option value={code} key={code}>{code}</option>
                        ))}
                      </select>
                      <input id="regPhone" type="tel" className="form-control" required placeholder="801 234 5678"
                        value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>

                  {!isDeveloper && (
                    <div className="col-md-6">
                      <label className={s.formLabel} htmlFor="regDob">Date of birth</label>
                      <input id="regDob" type="date" className={cx('form-control', dobError && s.inputInvalid)}
                        value={dob} onChange={(e) => setDob(e.target.value)} />
                      {dobError && <div className={s.fieldErr}><i className="bi bi-exclamation-circle" /> Must be 18 or older</div>}
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className={s.formLabel} htmlFor="regCountry">Country of residence</label>
                    <select id="regCountry" className="form-select" value={country} onChange={(e) => setCountry(e.target.value)}>
                      {content.countries.map((cty) => (
                        <option value={cty.value} key={cty.value}>{cty.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* developer extras */}
                  {isDeveloper && (
                    <>
                      <div className="col-12">
                        <label className={s.formLabel} htmlFor="regUseCase">Primary use case</label>
                        <select id="regUseCase" className="form-select" value={useCase} onChange={(e) => setUseCase(e.target.value)}>
                          {content.devUseCases.map((uc) => <option key={uc}>{uc}</option>)}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className={s.formLabel}>Languages (multi-select)</label>
                        <div className="d-flex flex-wrap gap-2">
                          {content.devLanguages.map((lang) => {
                            const selected = langs.includes(lang);
                            return (
                              <button
                                key={lang}
                                type="button"
                                className={cx(s.badgeMini, selected ? s.badgeOk : s.badgeNative)}
                                style={{
                                  cursor: 'pointer',
                                  padding: '0.4rem 0.8rem',
                                  opacity: selected ? 1 : 0.5,
                                }}
                                onClick={() => toggleLang(lang)}
                              >
                                {lang}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  {/* business extras */}
                  {isBusiness && (
                    <>
                      <div className="col-md-6">
                        <label className={s.formLabel} htmlFor="regBizType">Business type</label>
                        <select id="regBizType" className="form-select" value={bizType} onChange={(e) => setBizType(e.target.value)}>
                          {content.businessTypes.map((bt) => <option key={bt}>{bt}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className={s.formLabel} htmlFor="regVolume">Est. monthly volume</label>
                        <select id="regVolume" className="form-select" value={volume} onChange={(e) => setVolume(e.target.value)}>
                          {content.monthlyVolumes.map((vol) => <option key={vol}>{vol}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="col-12">
                    <label className={s.formLabel} htmlFor="regRef">Referral code (optional)</label>
                    <input id="regRef" type="text" className="form-control" placeholder="PAYMO2026"
                      value={referral} onChange={(e) => setReferral(e.target.value)} />
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button type="button" className={s.btnOutline} onClick={() => goStep(0)}>
                    <i className="bi bi-arrow-left me-1" /> Back
                  </button>
                  <button type="submit" className={cx(s.btnPaymo, 'flex-grow-1')} disabled={!basicReady}>
                    Continue to verification <i className="bi bi-arrow-right ms-1" />
                  </button>
                </div>
              </form>
            </div>

            {/* ===== STEP 2: KYC / IDENTITY ===== */}
            <div className={cx(s.stepPane, step === 2 && s.active)}>
              <div className={cx(s.glass, 'p-3 mb-3')} style={{ borderRadius: '14px' }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check" style={{ color: '#86efac' }} />
                  <span className={s.mutedText} style={{ fontSize: '0.84rem' }}>
                    Your documents are encrypted and verified securely. Typically under 30 seconds.
                  </span>
                </div>
              </div>

              <label className={s.formLabel} htmlFor="docType">
                {isBusiness ? 'Representative ID type' : 'Document type'}
              </label>
              <select id="docType" className="form-select mb-3" value={docType} onChange={(e) => setDocType(e.target.value)}>
                {content.docTypes.map((dt) => <option key={dt}>{dt}</option>)}
              </select>

              <label className={s.formLabel}>Upload document</label>
              <div
                className={cx(s.uploadZone, 'mb-3', docDrag && s.drag, docFile && s.hasFile)}
                role="button"
                tabIndex={0}
                onClick={() => docInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter') docInputRef.current?.click(); }}
                onDragOver={(e) => { e.preventDefault(); setDocDrag(true); }}
                onDragLeave={() => setDocDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDocDrag(false); handleDocFile(e.dataTransfer.files[0]); }}
              >
                <i className={cx('bi bi-cloud-arrow-up', s.uploadIcon)} />
                <div className={s.mutedText} style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {docFile
                    ? (<><i className="bi bi-check-circle-fill" style={{ color: '#86efac' }} /> {docFile}</>)
                    : (<>Drag &amp; drop or <span style={{ color: '#2ee6a0' }}>browse</span></>)}
                </div>
                <div className={s.dimText} style={{ fontSize: '0.74rem', marginTop: '0.2rem' }}>JPG, PNG or PDF · Max 10MB</div>
                <input
                  type="file"
                  ref={docInputRef}
                  accept="image/*,.pdf"
                  hidden
                  onChange={(e) => handleDocFile(e.target.files?.[0])}
                />
              </div>

              {isBusiness && (
                <>
                  <label className={s.formLabel}>Business documents (KYB)</label>
                  <div
                    className={cx(s.uploadZone, 'mb-3', bizFileCount > 0 && s.hasFile)}
                    role="button"
                    tabIndex={0}
                    onClick={() => bizInputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === 'Enter') bizInputRef.current?.click(); }}
                  >
                    <i className={cx('bi bi-files', s.uploadIconAlt)} style={{ fontSize: '1.6rem' }} />
                    <div className={s.mutedText} style={{ fontSize: '0.88rem', marginTop: '0.4rem' }}>
                      {bizFileCount > 0
                        ? (<><i className="bi bi-check-circle-fill" style={{ color: '#86efac' }} /> {bizFileCount} document(s) attached</>)
                        : 'Certificate of Incorporation, Articles, Bank statement'}
                    </div>
                    <input type="file" ref={bizInputRef} accept="image/*,.pdf" multiple hidden
                      onChange={(e) => handleBizFiles(e.target.files)} />
                  </div>
                </>
              )}

              <label className={s.formLabel}>Selfie verification (liveness)</label>
              <div
                className={cx(s.uploadZone, 'mb-3', selfieState === 'done' && s.hasFile)}
                role="button"
                tabIndex={0}
                onClick={handleSelfieCapture}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSelfieCapture(); }}
              >
                <i className={cx('bi bi-person-bounding-box', s.uploadIconAlt)} />
                <div className={s.mutedText} style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {selfieState === 'idle' && 'Tap to capture a live selfie'}
                  {selfieState === 'capturing' && (<><span className={s.spinnerP} style={{ borderTopColor: '#c9ffe9', borderColor: 'rgba(201,255,233,.3)' }} /> Capturing liveness…</>)}
                  {selfieState === 'done' && (<><i className="bi bi-check-circle-fill" style={{ color: '#86efac' }} /> Liveness verified</>)}
                </div>
                <div className={s.dimText} style={{ fontSize: '0.74rem', marginTop: '0.2rem' }}>Blink and turn your head when prompted</div>
              </div>

              {/* staged verify animation */}
              {verifying && (
                <div className={cx(s.glass, 'p-4 text-center mb-3')} style={{ borderRadius: '14px' }}>
                  <div className={cx(s.verifyAnim, 'mb-3')} />
                  <div style={{ fontWeight: 600, color: '#fff' }}>{content.verifyStages[verifyStage]}</div>
                  <div className={s.dimText} style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>This usually takes under 30 seconds</div>
                </div>
              )}

              <div className="d-flex gap-2 mt-2">
                <button type="button" className={s.btnOutline} onClick={() => goStep(1)}>
                  <i className="bi bi-arrow-left me-1" /> Back
                </button>
                <button type="button" className={cx(s.btnPaymo, 'flex-grow-1')} disabled={!kycReady || verifying}
                  onClick={handleKycContinue}>
                  Verify &amp; continue <i className="bi bi-arrow-right ms-1" />
                </button>
              </div>
            </div>

            {/* ===== STEP 3: SECURITY ===== */}
            <div className={cx(s.stepPane, step === 3 && s.active)}>
              <form onSubmit={handleCreate} noValidate>
                <label className={s.formLabel} htmlFor="regPwd">Create password</label>
                <div className="input-group mb-1">
                  <input id="regPwd" type={showPwd ? 'text' : 'password'} className="form-control"
                    placeholder="Enter a strong password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
                  <button
                    type="button"
                    className="input-group-text"
                    style={{ cursor: 'pointer' }}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPwd((v) => !v)}
                  >
                    <i className={showPwd ? 'bi bi-eye-slash' : 'bi bi-eye'} />
                  </button>
                </div>
                <div className={s.strengthBar}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={s.strengthSeg}
                      style={pwd.length > 0 && i < pwdScore ? { background: STRENGTH_COLORS[pwdScore - 1] } : undefined}
                    />
                  ))}
                </div>
                <div className="d-flex justify-content-between mt-1">
                  <span className={s.dimText} style={{ fontSize: '0.74rem' }}>Use 8+ chars, mixed case, number &amp; symbol</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 600, color: pwd.length ? STRENGTH_COLORS[Math.max(0, pwdScore - 1)] : undefined }}>
                    {pwd.length ? STRENGTH_LABELS[Math.max(0, pwdScore - 1)] : ''}
                  </span>
                </div>

                <label className={s.formLabel} htmlFor="regPwd2">Confirm password</label>
                <input id="regPwd2" type="password"
                  className={cx('form-control', pwd2Touched && (pwdMatch ? s.inputValid : s.inputInvalid))}
                  placeholder="Re-enter password"
                  value={pwd2} onChange={(e) => setPwd2Raw(e.target.value)} />
                {pwd2Touched && !pwdMatch && (
                  <div className={s.fieldErr}><i className="bi bi-exclamation-circle" /> Passwords don&apos;t match</div>
                )}

                <label className={s.formLabel}>
                  Set 6-digit PIN{' '}
                  <span className={s.dimText} style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>
                    (for quick mobile access)
                  </span>
                </label>
                <div className={s.pinGroup}>
                  {pin.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { pinRefs.current[i] = el; }}
                      className={cx(s.pinBox, 'form-control', digit && s.filled)}
                      maxLength={1}
                      inputMode="numeric"
                      aria-label={`PIN digit ${i + 1}`}
                      value={digit}
                      onChange={(e) => handlePinChange(i, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(i, e.key)}
                    />
                  ))}
                </div>

                {/* passkey / biometric toggles */}
                <div className="mt-4">
                  <div className={cx(s.secCard, 'mb-2', passkeyOn && s.on)}>
                    <div className={s.secIcon}><i className="bi bi-fingerprint" /></div>
                    <div style={{ flex: 1 }}>
                      <div className="fw-semibold text-white" style={{ fontSize: '0.92rem' }}>
                        Set up a Passkey <span className={cx(s.badgeMini, s.badgeOk, 'ms-1')}>Recommended</span>
                      </div>
                      <div className={s.dimText} style={{ fontSize: '0.78rem' }}>Faster, phishing-resistant login with Face ID / Touch ID</div>
                    </div>
                    <label className={s.toggleSwitch}>
                      <input type="checkbox" checked={passkeyOn} onChange={(e) => setPasskeyOn(e.target.checked)} />
                      <span className={s.toggleSlider} />
                    </label>
                  </div>
                  <div className={cx(s.secCard, bioOn && s.on)}>
                    <div className={cx(s.secIcon, s.secIconAlt)}><i className="bi bi-person-badge" /></div>
                    <div style={{ flex: 1 }}>
                      <div className="fw-semibold text-white" style={{ fontSize: '0.92rem' }}>Enable biometric login</div>
                      <div className={s.dimText} style={{ fontSize: '0.78rem' }}>Use your device fingerprint or face unlock</div>
                    </div>
                    <label className={s.toggleSwitch}>
                      <input type="checkbox" checked={bioOn} onChange={(e) => setBioOn(e.target.checked)} />
                      <span className={s.toggleSlider} />
                    </label>
                  </div>
                </div>

                {/* consent */}
                <div className="mt-4">
                  <div className={s.checkRow}>
                    <input type="checkbox" className="form-check-input" id="agreeTerms"
                      checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                    <label htmlFor="agreeTerms" className={s.mutedText} style={{ fontSize: '0.84rem' }}>
                      I agree to the <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
                    </label>
                  </div>
                  <div className={s.checkRow}>
                    <input type="checkbox" className="form-check-input" id="agreeAge"
                      checked={agreeAge} onChange={(e) => setAgreeAge(e.target.checked)} />
                    <label htmlFor="agreeAge" className={s.mutedText} style={{ fontSize: '0.84rem' }}>I confirm I am 18 years or older.</label>
                  </div>
                  <div className={s.checkRow}>
                    <input type="checkbox" className="form-check-input" id="agreeMarketing"
                      checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)} />
                    <label htmlFor="agreeMarketing" className={s.mutedText} style={{ fontSize: '0.84rem' }}>Send me product updates and offers (optional).</label>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button type="button" className={s.btnOutline} onClick={() => goStep(2)}>
                    <i className="bi bi-arrow-left me-1" /> Back
                  </button>
                  <button type="submit" className={cx(s.btnPaymo, 'flex-grow-1')} disabled={!securityReady || creating}>
                    {creating ? (<><span className={s.spinnerP} /> Creating your account…</>) : 'Create account'}
                  </button>
                </div>
                <p className={cx(s.dimText, 'text-center mt-2')} style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-shield-lock me-1" /> Protected by reCAPTCHA · Zero-knowledge encryption
                </p>
              </form>
            </div>

            {/* ===== STEP 4: SUCCESS ===== */}
            <div className={cx(s.stepPane, step === 4 && s.active)}>
              <div className="text-center">
                <div className={s.successCheck}><i className="bi bi-check-lg" /></div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }} className={s.headlineColor}>
                  Welcome to Paymo, <span className={s.textGradient}>{first || 'there'}</span>! 🎉
                </h2>
                <p className={s.mutedText} style={{ maxWidth: '400px', margin: '0.5rem auto 0' }}>
                  Your account is ready. We&apos;ve sent a verification email — confirm it to unlock all features.
                </p>
              </div>

              {/* developer API key */}
              {isDeveloper && (
                <div className={cx(s.glass, 'p-3 mt-4')} style={{ borderRadius: '14px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                    <span className={s.formLabel} style={{ margin: 0 }}>Your sandbox API key</span>
                    <span className={cx(s.badgeMini, s.badgeGold)}>Copy now — shown once</span>
                  </div>
                  <div className="input-group">
                    <input type="text" className="form-control" style={monoStyle} readOnly value={content.sandboxApiKey} aria-label="Sandbox API key" />
                    <button type="button" className="input-group-text" style={{ cursor: 'pointer' }} onClick={handleCopyApiKey} aria-label="Copy API key">
                      {apiKeyCopied ? <i className="bi bi-check-lg" style={{ color: '#86efac' }} /> : <i className="bi bi-clipboard" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className={cx(s.formLabel, 'mb-2')}>Recommended next steps</div>
                <div className="d-flex flex-column gap-2">
                  {successSteps.map((nextStep) => (
                    <button type="button" className={s.nextStepCard} key={nextStep.t}>
                      <div className={s.nextStepIcon} style={{ color: nextStep.c }}>
                        <i className={`bi ${nextStep.ic}`} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="fw-semibold text-white" style={{ fontSize: '0.9rem' }}>{nextStep.t}</div>
                        <div className={s.dimText} style={{ fontSize: '0.78rem' }}>{nextStep.s}</div>
                      </div>
                      <i className="bi bi-chevron-right" style={{ color: '#7fa694' }} />
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" className={cx(s.btnPaymo, 'w-100 mt-4')} onClick={handleGotoDash}>
                {dashLoading ? (<><span className={s.spinnerP} /> Loading…</>) : (<>Go to account selection <i className="bi bi-arrow-right ms-1" /></>)}
              </button>
              {dashNote && (
                <p className="text-center mt-2" style={{ fontSize: '0.8rem', color: '#86efac' }}>
                  → Redirecting to /auth/account-type (wire this to your router when ready)
                </p>
              )}
              <p className={cx(s.dimText, 'text-center mt-3')} style={{ fontSize: '0.78rem' }}>
                <i className="bi bi-envelope me-1" /> Confirmation sent to{' '}
                <span style={monoStyle}>{email || 'your email'}</span>
              </p>
            </div>

            {/* footer mini */}
            <div className={s.footRow}>
              {content.footLinks.map((link) => (
                <a href="#" key={link}>{link}</a>
              ))}
              <span>© 2026 Paymo</span>
            </div>
          </div>
        </div>
      </div>

      {/* LEGACY BRIDGE: isolated confetti DOM host (legacy body.appendChild target) */}
      <div ref={confettiHostRef} className={s.confettiHost} aria-hidden="true" />
    </div>
  );
}
