import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
if (typeof document !== 'undefined') {
  import('bootstrap/dist/js/bootstrap.bundle.min.js')
}
import styles from '../styles/passkeys.module.css'

/* ============================================================================
   Paymo BAAS — Biometric Setup & Passkey Management (legacy page58)
   React + TypeScript + TanStack Query, emerald-glass theme.
   ========================================================================== */

interface HeroStat {
  value: string
  label: string
}

interface CompareRow {
  method: string
  securityLabel: string
  securityBadge: 'badgeOk' | 'badgeNative' | 'badgeSoon'
  friction: string
  bestUse: string
}

interface IconCard {
  icon: string
  title: string
  text: string
}

interface WizardStep {
  title: string
  desc: string
  icon: string
}

interface NumberedStep {
  title: string
  text: string
}

interface Passkey {
  id: string
  name: string
  device: string
  created: string
  lastUsed: string
  status: 'primary' | 'active'
  sync: string
}

interface Policy {
  id: string
  title: string
  text: string
  defaultOn: boolean
}

interface PasskeyConfig {
  pill: string
  heroTitleA: string
  heroTitleB: string
  heroText: string
  heroStats: HeroStat[]
  overviewTitle: string
  overviewText: string
  compareRows: CompareRow[]
  benefitCards: IconCard[]
  wizardSteps: WizardStep[]
  iosSteps: NumberedStep[]
  androidSteps: NumberedStep[]
  defaultPasskeys: Passkey[]
  managementRules: string[]
  recoveryCards: IconCard[]
  policies: Policy[]
  enterpriseStats: { value: string; label: string; gold?: boolean }[]
  pairSteps: string[]
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: PasskeyConfig = {
  pill: 'PAGE 58 · WebAuthn · FIDO2 · Biometrics',
  heroTitleA: 'Go passwordless —',
  heroTitleB: 'faster and more secure.',
  heroText:
    'Set up passkeys and biometrics for instant, phishing-resistant login across Paymo dashboards, API console, treasury controls, and high-risk approvals.',
  heroStats: [
    { value: '0', label: 'password leaks' },
    { value: '2s', label: 'avg login' },
    { value: 'FIDO2', label: 'standard' },
    { value: '99%', label: 'phishing block' },
  ],
  overviewTitle: 'Password vs. passkey vs. biometric.',
  overviewText:
    'Passkeys are cryptographic credentials tied to your device or password manager. Biometrics unlock the passkey locally; Paymo never receives your face, fingerprint, or private key.',
  compareRows: [
    { method: 'Password', securityLabel: 'Medium', securityBadge: 'badgeSoon', friction: 'Typing + memory', bestUse: 'Legacy backup' },
    { method: 'Passkey', securityLabel: 'Very high', securityBadge: 'badgeOk', friction: 'Touch or glance', bestUse: 'Primary login' },
    { method: 'Biometric', securityLabel: 'High', securityBadge: 'badgeNative', friction: 'Instant unlock', bestUse: 'Mobile app, approvals' },
  ],
  benefitCards: [
    { icon: 'bi-shield-check', title: 'Phishing-resistant', text: "Won't work on fake Paymo domains." },
    { icon: 'bi-lightning-charge', title: 'Faster login', text: 'No typing. Just Face ID, Touch ID, or Windows Hello.' },
    { icon: 'bi-cloud-check', title: 'Cross-device', text: 'Sync via iCloud, Google, or password managers.' },
    { icon: 'bi-eye-slash', title: 'Private by design', text: 'Biometrics stay on your device.' },
  ],
  wizardSteps: [
    { title: 'Check compatibility', desc: 'Detect secure context, platform authenticator, and WebAuthn support.', icon: 'bi-device-ssd' },
    { title: 'Create passkey', desc: 'Use your device security prompt or a password manager.', icon: 'bi-fingerprint' },
    { title: 'Name your passkey', desc: 'Choose a clear label for future management.', icon: 'bi-pencil-square' },
    { title: 'Test passkey', desc: 'Authenticate once to confirm it works.', icon: 'bi-check2-circle' },
    { title: 'Success', desc: 'Passwordless sign-in is ready.', icon: 'bi-stars' },
  ],
  iosSteps: [
    { title: 'Open iOS Settings', text: 'Go to Settings > Face ID & Passcode.' },
    { title: 'Enable for Paymo', text: 'Turn on Paymo app authentication.' },
    { title: 'Test unlock', text: 'Approve a test login with Face ID.' },
    { title: 'Keep PIN backup', text: 'PIN remains available if biometric fails.' },
  ],
  androidSteps: [
    { title: 'Open Security', text: 'Settings > Security > Fingerprint.' },
    { title: 'Register finger', text: 'Add at least one fingerprint.' },
    { title: 'Enable in Paymo', text: 'Security > Biometrics > On.' },
    { title: 'Approve test', text: 'Authorize a sample login.' },
  ],
  defaultPasskeys: [
    { id: 'pk_iphone15', name: 'iPhone 15 Pro', device: 'iOS · Face ID', created: '2026-01-14', lastUsed: 'Active today', status: 'primary', sync: 'iCloud Keychain' },
    { id: 'pk_workmac', name: 'Work MacBook', device: 'macOS · Touch ID', created: '2025-12-02', lastUsed: '2 hours ago', status: 'active', sync: '1Password' },
    { id: 'pk_pixel', name: 'Pixel 9', device: 'Android · Fingerprint', created: '2025-10-19', lastUsed: '12 days ago', status: 'active', sync: 'Google Password Manager' },
  ],
  managementRules: [
    'At least one backup method must remain active.',
    'Removing a passkey requires step-up verification.',
    'Primary passkey is used for auto-prompt.',
  ],
  recoveryCards: [
    { icon: 'bi-envelope-check', title: 'Email + password + 2FA', text: 'Standard fallback for low-risk recovery.' },
    { icon: 'bi-shield-question', title: 'Security questions', text: 'Use enrolled questions plus step-up verification.' },
    { icon: 'bi-person-vcard', title: 'Identity verification', text: 'Support-assisted review for high assurance.' },
  ],
  policies: [
    { id: 'require', title: 'Require passkeys', text: 'All admin accounts.', defaultOn: true },
    { id: 'noPasswordOnly', title: 'Disable password-only', text: 'Sensitive roles.', defaultOn: true },
    { id: 'bulk', title: 'Bulk enrollment', text: 'Corporate devices.', defaultOn: false },
    { id: 'autoRemediate', title: 'Auto-remediation', text: 'Notify unenrolled users.', defaultOn: true },
  ],
  enterpriseStats: [
    { value: '83%', label: 'team passkey enrollment' },
    { value: '17', label: 'users need enrollment', gold: true },
    { value: '0', label: 'password-only admins' },
  ],
  pairSteps: [
    'QR scanned by trusted phone.',
    'Face ID approved on phone.',
    'Registering this browser.',
    'New device passkey ready.',
  ],
}

const STORAGE_KEY = 'paymo_passkeys_v1'

type Compat = 'pending' | 'supported' | 'limited'
type BioTab = 'ios' | 'android'
type ModalState =
  | { mode: 'rename'; id: string; name: string }
  | { mode: 'remove'; id: string }
  | null

/* ---------- LEGACY BRIDGE: verbatim file-download helper ---------- */
function download(filename: string, text: string, type = 'text/csv') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type }))
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

/* ---------- LEGACY BRIDGE: UA device-name sniffing (verbatim logic) ---------- */
function detectDeviceName() {
  if (typeof navigator === 'undefined') return 'This device passkey'
  const ua = navigator.userAgent
  if (/iPhone/i.test(ua)) return 'iPhone passkey'
  if (/Android/i.test(ua)) return 'Android passkey'
  if (/Mac/i.test(ua)) return 'MacBook passkey'
  if (/Windows/i.test(ua)) return 'Windows Hello passkey'
  return 'This device passkey'
}

/* ---------- TanStack Query fetcher (generic API placeholder) ---------- */
async function fetchPasskeyConfig(): Promise<PasskeyConfig> {
  const res = await fetch('/api/passkey-config')
  if (!res.ok) throw new Error(`Request failed with ${res.status}`)
  const json = (await res.json()) as Partial<PasskeyConfig>
  return { ...initialMockData, ...json }
}

export default function Passkeys() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-passkey-config'],
    queryFn: fetchPasskeyConfig,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const rootRef = useRef<HTMLDivElement | null>(null)
  const wizardSectionRef = useRef<HTMLElement | null>(null)
  const manageSectionRef = useRef<HTMLElement | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)

  const [errorDismissed, setErrorDismissed] = useState(false)

  /* ---------- passkeys persisted in localStorage (legacy behavior) ---------- */
  const [passkeys, setPasskeys] = useState<Passkey[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw) as Passkey[]
      } catch {
        /* corrupted storage → fall through to defaults */
      }
    }
    return initialMockData.defaultPasskeys
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(passkeys))
    } catch {
      /* storage unavailable (private mode) */
    }
  }, [passkeys])

  /* ---------- environment / compatibility (client-only detection) ---------- */
  const [compat, setCompat] = useState<Compat>('pending')
  const [hasWebAuthn, setHasWebAuthn] = useState<boolean | null>(null)
  const [isSecure, setIsSecure] = useState<boolean | null>(null)

  const runCompatibility = () => {
    const webauthn = typeof window !== 'undefined' && 'PublicKeyCredential' in window
    const secure = typeof window !== 'undefined' ? window.isSecureContext : false
    setHasWebAuthn(webauthn)
    setIsSecure(secure)
    setCompat(webauthn && secure ? 'supported' : 'limited')
  }

  /* ---------- wizard ---------- */
  const [wizardIndex, setWizardIndex] = useState(0)
  const [wizardBusy, setWizardBusy] = useState<null | 'creating' | 'testing'>(null)

  const nextWizard = () => setWizardIndex((i) => Math.min(i + 1, config.wizardSteps.length - 1))

  const simulateCreatePasskey = () => {
    setWizardBusy('creating')
    window.setTimeout(() => {
      setWizardBusy(null)
      nextWizard()
    }, 1200)
  }

  const nameNewPasskey = () => {
    const name = nameInputRef.current?.value.trim() || detectDeviceName()
    setPasskeys((prev) => [
      ...prev,
      {
        id: 'pk_' + Date.now(),
        name,
        device: typeof navigator !== 'undefined' && navigator.platform ? navigator.platform : 'This device',
        created: new Date().toISOString().slice(0, 10),
        lastUsed: 'Just now',
        status: prev.length ? 'active' : 'primary',
        sync: 'Device-only',
      },
    ])
    nextWizard()
  }

  const testPasskey = () => {
    setWizardBusy('testing')
    window.setTimeout(() => {
      setWizardBusy(null)
      nextWizard()
    }, 1000)
  }

  /* ---------- biometric tabs ---------- */
  const [bioTab, setBioTab] = useState<BioTab>('ios')

  /* ---------- passkey management ---------- */
  const [modal, setModal] = useState<ModalState>(null)

  const commitRename = () => {
    if (!modal || modal.mode !== 'rename') return
    const name = modal.name.trim()
    if (name) {
      setPasskeys((prev) => prev.map((p) => (p.id === modal.id ? { ...p, name } : p)))
    }
    setModal(null)
  }

  const commitRemove = () => {
    if (!modal || modal.mode !== 'remove') return
    setPasskeys((prev) => {
      const next = prev.filter((p) => p.id !== modal.id)
      if (next.length && !next.some((p) => p.status === 'primary')) {
        next[0] = { ...next[0], status: 'primary' }
      }
      return next
    })
    setModal(null)
  }

  const setPrimary = (id: string) =>
    setPasskeys((prev) =>
      prev.map((p) => ({ ...p, status: p.id === id ? 'primary' : 'active' })),
    )

  const addSampleDevice = () =>
    setPasskeys((prev) => [
      ...prev,
      {
        id: 'pk_sample_' + Date.now(),
        name: 'Security key',
        device: 'YubiKey 5C NFC',
        created: new Date().toISOString().slice(0, 10),
        lastUsed: 'Never',
        status: 'active',
        sync: 'Hardware key',
      },
    ])

  /* ---------- QR grid (81 cells, finder corners + random fill) ---------- */
  const qrCells = useMemo(() => {
    const cells: boolean[] = []
    for (let i = 0; i < 81; i++) {
      const finder = (i < 21 && i % 9 < 3) || (i < 27 && i % 9 > 5) || (i > 53 && i % 9 < 3)
      cells.push(finder || Math.random() > 0.42)
    }
    return cells
  }, [])

  /* ---------- QR countdown (02:00, legacy timer) ---------- */
  const qrEndRef = useRef(Date.now() + 120_000)
  const [qrLeftMs, setQrLeftMs] = useState(120_000)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQrLeftMs(Math.max(0, qrEndRef.current - Date.now()))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const qrMinutes = String(Math.floor(qrLeftMs / 60_000)).padStart(2, '0')
  const qrSeconds = String(Math.floor((qrLeftMs % 60_000) / 1000)).padStart(2, '0')

  /* ---------- cross-device pairing simulation (legacy interval flow) ---------- */
  const [pairStep, setPairStep] = useState(0) // completed steps, 1-based semantics below
  const [pairing, setPairing] = useState(false)
  const pairTimerRef = useRef<number | undefined>(undefined)

  const simulatePair = () => {
    if (pairing) return
    setPairing(true)
    setPairStep(0)
    const steps = config.pairSteps
    let i = 0
    pairTimerRef.current = window.setInterval(() => {
      i += 1
      setPairStep(i)
      if (i >= steps.length) {
        if (pairTimerRef.current) window.clearInterval(pairTimerRef.current)
        window.setTimeout(() => {
          setPasskeys((prev) => [
            ...prev,
            {
              id: 'pk_pair_' + Date.now(),
              name: 'Paired browser',
              device: 'Chrome · Cross-device',
              created: new Date().toISOString().slice(0, 10),
              lastUsed: 'Just now',
              status: 'active',
              sync: 'Phone passkey',
            },
          ])
          setPairing(false)
        }, 500)
      }
    }, 800)
  }

  useEffect(
    () => () => {
      if (pairTimerRef.current) window.clearInterval(pairTimerRef.current)
    },
    [],
  )

  const pairStatusText =
    pairStep === 0
      ? 'Waiting for phone scan.'
      : config.pairSteps[Math.min(pairStep - 1, config.pairSteps.length - 1)]
  const pairProgress = (Math.min(pairStep, config.pairSteps.length) / config.pairSteps.length) * 100

  /* ---------- enterprise policies ---------- */
  const [policyState, setPolicyState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialMockData.policies.map((p) => [p.id, p.defaultOn])),
  )

  const togglePolicy = (id: string) =>
    setPolicyState((prev) => ({ ...prev, [id]: !prev[id] }))

  /* ---------- exports (legacy CSV download bridge) ---------- */
  const downloadAudit = () =>
    download(
      'paymo-passkey-audit.csv',
      'name,device,created,lastUsed,status,sync\n' +
        passkeys.map((p) => `${p.name},${p.device},${p.created},${p.lastUsed},${p.status},${p.sync}`).join('\n'),
    )

  const exportEnterprise = () =>
    download(
      'paymo-enterprise-passkey-policy.csv',
      'policy,status\n' +
        config.policies.map((p) => `${p.title},${policyState[p.id] ?? p.defaultOn ? 'on' : 'off'}`).join('\n'),
    )

  /* ---------- LEGACY BRIDGE: IntersectionObserver reveal (data-reveal hooks) ---------- */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add(styles.revealIn))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add(styles.revealIn)
        }),
      { threshold: 0.12 },
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const scrollTo = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: 'smooth' })

  const step = config.wizardSteps[wizardIndex]

  return (
    <div className={styles.passkeysPage} ref={rootRef}>
      <div className={styles.gridOverlay} />
      <div className={styles.blob} style={{ width: 520, height: 520, background: '#2ee6a0', top: -160, right: -120 }} />
      <div
        className={styles.blob}
        style={{ width: 420, height: 420, background: '#0f9d6c', bottom: -130, left: -90, animationDelay: '-6s' }}
      />

      {/* ---------- query error banner (non-breaking fallback) ---------- */}
      {error && !errorDismissed && (
        <div className={`alert alert-danger alert-dismissible ${styles.errorBanner}`} role="alert">
          <strong>Could not load passkey configuration.</strong> Showing the built-in defaults.{' '}
          <span className="text-decoration-underline">{String((error as Error).message ?? '')}</span>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setErrorDismissed(true)} />
        </div>
      )}

      {/* ---------- loading overlay ---------- */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBox}>
            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Loading passkey configuration…
          </div>
        </div>
      )}

      <div className={`container ${styles.authPanel}`}>
        {/* ================= HERO ================= */}
        <section className={`row g-4 align-items-stretch mb-4 ${styles.reveal}`} data-reveal>
          <div className="col-lg-6">
            <div className={`${styles.glassStrong} p-4 p-lg-5 h-100`}>
              <div className="d-flex align-items-center gap-2 mb-4">
                <span className={styles.logoMark}>P</span>
                <div>
                  <div className="fw-bold text-white">
                    Paymo <span className={styles.textGradient}>BAAS</span>
                  </div>
                  <div className={styles.mutedSmall}>Security / Biometrics</div>
                </div>
              </div>
              <span className={`${styles.pill} mb-3`}>
                <span className={styles.pillDot} /> {config.pill}
              </span>
              <h1 className="mb-3" style={{ fontSize: 'clamp(2.1rem, 5vw, 4.1rem)', lineHeight: 1.04, fontWeight: 900 }}>
                {config.heroTitleA} <span className={styles.textGradient}>{config.heroTitleB}</span>
              </h1>
              <p className="mb-4" style={{ color: 'var(--pk-ink2)', fontSize: '1.05rem', maxWidth: 620 }}>
                {config.heroText}
              </p>
              <div className="d-flex flex-wrap gap-2 mb-4">
                <button
                  className={`btn ${styles.btnPrimaryPaymo}`}
                  onClick={() => scrollTo(wizardSectionRef.current)}
                >
                  <i className="bi bi-fingerprint me-1" /> Set up passkey
                </button>
                <button className={`btn ${styles.btnOutlinePaymo}`} onClick={runCompatibility}>
                  <i className="bi bi-device-ssd me-1" /> Check compatibility
                </button>
              </div>
              <div className="row g-2">
                {config.heroStats.map((s) => (
                  <div className="col-6 col-md-3" key={s.label}>
                    <div className={`${styles.glass} p-3 h-100`}>
                      <div className={`${styles.textGradient} fw-bold fs-4`}>{s.value}</div>
                      <div className={styles.mutedSmall}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className={`${styles.heroVisual} h-100 d-flex align-items-center justify-content-center p-4`}>
              <div className={`${styles.heroInner} text-center`}>
                <div className={`${styles.shieldOrbit} mx-auto mb-4`}>
                  <div className={styles.shieldCore}>
                    <i className="bi bi-fingerprint" />
                  </div>
                  <div className={styles.orbitChip}>
                    <i className="bi bi-phone" />
                  </div>
                  <div className={styles.orbitChip}>
                    <i className="bi bi-key" />
                  </div>
                  <div className={styles.orbitChip}>
                    <i className="bi bi-shield-lock" />
                  </div>
                  <div className={styles.orbitChip}>
                    <i className="bi bi-laptop" />
                  </div>
                </div>
                <div className={`${styles.glass} p-3 mx-auto ${styles.compatCard}`}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className={`${styles.mono} ${styles.mutedSmall}`}>DEVICE CHECK</span>
                    <span
                      className={`${styles.badgeMini} ${
                        compat === 'pending' ? styles.badgeSoon : compat === 'supported' ? styles.badgeOk : styles.badgeWarn
                      }`}
                    >
                      {compat}
                    </span>
                  </div>
                  <div className="text-start" style={{ fontSize: '0.88rem', color: 'var(--pk-ink2)' }}>
                    {compat === 'pending' &&
                      'Run compatibility to detect passkeys, platform authenticator, and secure context status.'}
                    {compat === 'supported' &&
                      'This browser supports WebAuthn in a secure context. You can create platform or synced passkeys.'}
                    {compat === 'limited' &&
                      'Passkey APIs are limited in this context. You can still review setup steps and manage existing passkeys.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 58.1 OVERVIEW ================= */}
        <section className={`${styles.glass} p-3 p-lg-4 mb-4 ${styles.reveal}`} data-reveal>
          <div className={styles.sectionLabel}>58.1 · Passkey &amp; Biometric Overview</div>
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <h2 className="mb-3">{config.overviewTitle}</h2>
              <p style={{ color: 'var(--pk-ink2)' }}>{config.overviewText}</p>
            </div>
            <div className="col-lg-7">
              <div className="table-responsive">
                <table className={styles.compareTable}>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Security</th>
                      <th>Friction</th>
                      <th>Best Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.compareRows.map((row) => (
                      <tr key={row.method}>
                        <td>
                          <strong>{row.method}</strong>
                        </td>
                        <td>
                          <span className={`${styles.badgeMini} ${styles[row.securityBadge]}`}>{row.securityLabel}</span>
                        </td>
                        <td>{row.friction}</td>
                        <td>{row.bestUse}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="row g-3 mt-2">
            {config.benefitCards.map((card) => (
              <div className="col-md-3" key={card.title}>
                <div className={`${styles.deviceCard} h-100`}>
                  <i className={`bi ${card.icon} ${styles.textGradient} fs-3`} />
                  <h6 className="mt-2">{card.title}</h6>
                  <p className={styles.cardDesc}>{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= 58.2 WIZARD ================= */}
        <section className={`row g-4 mb-4 ${styles.reveal}`} data-reveal ref={wizardSectionRef}>
          <div className="col-lg-5">
            <div className={`${styles.glass} p-3 p-lg-4 h-100`}>
              <div className={styles.sectionLabel}>58.2 · Passkey Setup Wizard</div>
              <h2 className="mb-3">Create a passkey in five guided steps.</h2>
              <div className="d-flex flex-column gap-2">
                {config.wizardSteps.map((s, i) => (
                  <div
                    key={s.title}
                    className={`${styles.wizardStep} ${i === wizardIndex ? styles.wizardStepActive : ''} ${
                      i < wizardIndex ? styles.wizardStepDone : ''
                    }`}
                  >
                    <div className="d-flex align-items-start gap-3">
                      <span className={styles.stepNum}>
                        {i < wizardIndex ? <i className="bi bi-check-lg" /> : i + 1}
                      </span>
                      <div>
                        <h6 className="mb-1">
                          <i className={`bi ${s.icon} me-1`} />
                          {s.title}
                        </h6>
                        <p className="mb-0" style={{ fontSize: '0.82rem', color: 'var(--pk-ink2)' }}>
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className={`${styles.glassStrong} p-3 p-lg-4 h-100`}>
              {wizardIndex === 0 && (
                <div>
                  <h4>{step.title}</h4>
                  <p style={{ color: 'var(--pk-ink2)' }}>{step.desc}</p>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className={`${styles.glass} p-3`}>
                        <div className={`${styles.mono} ${styles.mutedSmall}`}>WEB AUTHN</div>
                        <div className={`fw-bold ${hasWebAuthn ? 'text-success' : 'text-warning'}`}>
                          {hasWebAuthn === null ? 'Not checked' : hasWebAuthn ? 'Available' : 'Not detected'}
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className={`${styles.glass} p-3`}>
                        <div className={`${styles.mono} ${styles.mutedSmall}`}>SECURE CONTEXT</div>
                        <div className={`fw-bold ${isSecure ? 'text-success' : 'text-warning'}`}>
                          {isSecure === null ? 'Not checked' : isSecure ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className={`btn ${styles.btnPrimaryPaymo}`}
                    onClick={() => {
                      runCompatibility()
                      nextWizard()
                    }}
                  >
                    Continue <i className="bi bi-arrow-right ms-1" />
                  </button>
                </div>
              )}

              {wizardIndex === 1 && (
                <div>
                  <h4>{step.title}</h4>
                  <p style={{ color: 'var(--pk-ink2)' }}>{step.desc}</p>
                  <div className={`${styles.flowFrame} mb-3`}>
                    <div className={styles.flowLabel}>
                      <span className={`${styles.badgeMini} ${styles.badgeNative}`}>Platform prompt</span>
                      <div className="fw-bold text-white">Face ID, Touch ID, Windows Hello, or Android fingerprint.</div>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className={`btn ${styles.btnPrimaryPaymo}`}
                      disabled={wizardBusy === 'creating'}
                      onClick={simulateCreatePasskey}
                    >
                      {wizardBusy === 'creating' ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-fingerprint me-1" /> Create passkey
                        </>
                      )}
                    </button>
                    <button className={`btn ${styles.btnOutlinePaymo}`} onClick={nextWizard}>
                      Use password manager
                    </button>
                  </div>
                </div>
              )}

              {wizardIndex === 2 && (
                <div>
                  <h4>{step.title}</h4>
                  <p style={{ color: 'var(--pk-ink2)' }}>{step.desc}</p>
                  <label className={styles.formLabelPaymo} htmlFor="newPasskeyName">
                    Passkey name
                  </label>
                  <input
                    id="newPasskeyName"
                    ref={nameInputRef}
                    className={`${styles.formInput} mb-3`}
                    defaultValue={detectDeviceName()}
                  />
                  <button className={`btn ${styles.btnPrimaryPaymo}`} onClick={nameNewPasskey}>
                    Save name <i className="bi bi-arrow-right ms-1" />
                  </button>
                </div>
              )}

              {wizardIndex === 3 && (
                <div>
                  <h4>{step.title}</h4>
                  <p style={{ color: 'var(--pk-ink2)' }}>{step.desc}</p>
                  <div className={`${styles.glass} p-4 text-center mb-3`}>
                    <i className={`bi bi-fingerprint ${styles.textGradient} ${styles.bigFingerprint}`} />
                    <h5 className="mt-2">Touch or glance to test</h5>
                    <p className={styles.mutedSmall}>This confirms Paymo can use the new passkey.</p>
                  </div>
                  <button
                    className={`btn ${styles.btnPrimaryPaymo}`}
                    disabled={wizardBusy === 'testing'}
                    onClick={testPasskey}
                  >
                    {wizardBusy === 'testing' ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                        Testing...
                      </>
                    ) : (
                      'Test passkey'
                    )}
                  </button>
                </div>
              )}

              {wizardIndex === 4 && (
                <div className="text-center py-4">
                  <div className={styles.successOrb}>
                    <i className="bi bi-check-lg" />
                  </div>
                  <h4>Your passkey is ready.</h4>
                  <p style={{ color: 'var(--pk-ink2)' }}>You can now sign in without a password on this device.</p>
                  <button
                    className={`btn ${styles.btnPrimaryPaymo}`}
                    onClick={() => scrollTo(manageSectionRef.current)}
                  >
                    Manage passkeys
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= 58.3 BIOMETRICS ================= */}
        <section className={`${styles.glass} p-3 p-lg-4 mb-4 ${styles.reveal}`} data-reveal>
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
            <div>
              <div className={styles.sectionLabel}>58.3 · Biometric Enrollment</div>
              <h2 className="mb-0">Set up mobile biometrics.</h2>
            </div>
            <div className={styles.tabsWrap} role="tablist">
              <button
                className={`${styles.tabBtn} ${bioTab === 'ios' ? styles.tabBtnActive : ''}`}
                onClick={() => setBioTab('ios')}
              >
                <i className="bi bi-apple" /> Face ID / Touch ID
              </button>
              <button
                className={`${styles.tabBtn} ${bioTab === 'android' ? styles.tabBtnActive : ''}`}
                onClick={() => setBioTab('android')}
              >
                <i className="bi bi-android2" /> Android fingerprint
              </button>
            </div>
          </div>
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className={`${styles.tabPanel} ${bioTab === 'ios' ? styles.tabPanelActive : ''}`}>
                <div className="row g-3">
                  {config.iosSteps.map((s, i) => (
                    <div className="col-sm-6" key={s.title}>
                      <div className={`${styles.deviceCard} h-100`}>
                        <span className={styles.stepNum}>{i + 1}</span>
                        <h6 className="mt-2">{s.title}</h6>
                        <p style={{ fontSize: '0.84rem', color: 'var(--pk-ink2)' }}>{s.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${styles.tabPanel} ${bioTab === 'android' ? styles.tabPanelActive : ''}`}>
                <div className="row g-3">
                  {config.androidSteps.map((s, i) => (
                    <div className="col-sm-6" key={s.title}>
                      <div className={`${styles.deviceCard} h-100`}>
                        <span className={styles.stepNum}>{i + 1}</span>
                        <h6 className="mt-2">{s.title}</h6>
                        <p style={{ fontSize: '0.84rem', color: 'var(--pk-ink2)' }}>{s.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className={styles.flowFrame}>
                <div className={styles.flowLabel}>
                  <span className={`${styles.badgeMini} ${styles.badgeNative} mb-1`}>Local unlock</span>
                  <div className="fw-bold text-white d-block">Biometric signal never leaves your device.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 58.4 MANAGE ================= */}
        <section className={`row g-4 mb-4 ${styles.reveal}`} data-reveal ref={manageSectionRef}>
          <div className="col-lg-8">
            <div className={`${styles.glass} p-3 p-lg-4 h-100`}>
              <div className={styles.sectionLabel}>58.4 · Manage Passkeys</div>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h2 className="mb-0">Registered passkeys.</h2>
                <button className={`btn ${styles.btnOutlinePaymo} btn-sm`} onClick={addSampleDevice}>
                  <i className="bi bi-plus-lg me-1" /> Add sample device
                </button>
              </div>
              <div className="d-flex flex-column gap-2">
                {passkeys.length === 0 && <div className={styles.emptyList}>No passkeys registered.</div>}
                {passkeys.map((pk) => (
                  <div
                    key={pk.id}
                    className={`${styles.passkeyCard} ${pk.status === 'primary' ? styles.passkeyCardPrimary : ''}`}
                  >
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className={styles.passkeyIcon}>
                          <i className="bi bi-key-fill" />
                        </div>
                        <div>
                          <div className="fw-bold text-white">
                            {pk.name}{' '}
                            {pk.status === 'primary' && (
                              <span className={`${styles.badgeMini} ${styles.badgeNative} ms-1`}>Primary</span>
                            )}
                          </div>
                          <div className={styles.mutedSmall}>
                            {pk.device} · Created {pk.created} · {pk.sync}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--pk-ink2)' }}>Last used: {pk.lastUsed}</div>
                        </div>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className={`btn ${styles.btnOutlinePaymo} btn-sm`}
                          onClick={() => setModal({ mode: 'rename', id: pk.id, name: pk.name })}
                        >
                          Rename
                        </button>
                        <button className={`btn ${styles.btnOutlinePaymo} btn-sm`} onClick={() => setPrimary(pk.id)}>
                          Set primary
                        </button>
                        <button
                          className={`btn ${styles.btnOutlinePaymo} btn-sm`}
                          onClick={() => setModal({ mode: 'remove', id: pk.id })}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className={`${styles.glass} p-3 p-lg-4 h-100`}>
              <h5 className="mb-3">Management rules</h5>
              <div className="d-flex flex-column gap-3">
                {config.managementRules.map((rule) => (
                  <div className="d-flex gap-2" key={rule}>
                    <i className={`bi bi-check-circle-fill ${styles.checkRule}`} />
                    <span style={{ color: 'var(--pk-ink2)', fontSize: '0.9rem' }}>{rule}</span>
                  </div>
                ))}
              </div>
              <hr className={styles.hrSoft} />
              <button className={`btn ${styles.btnPrimaryPaymo} w-100`} onClick={downloadAudit}>
                <i className="bi bi-download me-1" /> Download passkey audit
              </button>
            </div>
          </div>
        </section>

        {/* ================= 58.5 CROSS-DEVICE ================= */}
        <section className={`row g-4 mb-4 ${styles.reveal}`} data-reveal>
          <div className="col-lg-5">
            <div className={`${styles.glass} p-3 p-lg-4 h-100 position-relative overflow-hidden`}>
              <div className={styles.sectionLabel}>58.5 · Cross-Device Passkeys</div>
              <h2 className="mb-3">Sign in with your phone on another device.</h2>
              <p style={{ color: 'var(--pk-ink2)' }}>
                Scan the pairing QR from your phone, approve with Face ID or fingerprint, then register a new passkey
                for the device you're using.
              </p>
              <div className="d-flex flex-column gap-2 mt-3">
                <div className={styles.deviceCard}>
                  <span className={`${styles.badgeMini} ${styles.badgeNative} me-2`}>1</span>Select "another device" on
                  desktop.
                </div>
                <div className={styles.deviceCard}>
                  <span className={`${styles.badgeMini} ${styles.badgeNative} me-2`}>2</span>Scan QR with trusted phone.
                </div>
                <div className={styles.deviceCard}>
                  <span className={`${styles.badgeMini} ${styles.badgeNative} me-2`}>3</span>Authenticate locally and
                  approve.
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-7">
            <div className={`${styles.glassStrong} p-4 h-100 text-center position-relative`}>
              <div className="position-relative d-inline-block mb-3">
                <div className={styles.qrBox}>
                  {qrCells.map((on, i) => (
                    <span key={i} className={`${styles.qrCell} ${on ? '' : styles.qrCellOff}`} />
                  ))}
                </div>
                <div className={styles.scanLine} />
              </div>
              <h5>Pair a new device</h5>
              <p style={{ color: 'var(--pk-ink2)', fontSize: '0.9rem' }}>
                QR expires in{' '}
                <span className={`${styles.mono} ${styles.textGradient}`}>
                  {qrMinutes}:{qrSeconds}
                </span>
              </p>
              <button className={`btn ${styles.btnPrimaryPaymo}`} onClick={simulatePair} disabled={pairing}>
                <i className="bi bi-qr-code-scan me-1" /> Simulate phone approval
              </button>
              <div className={`${styles.progressThin} mt-3`}>
                <span className={styles.progressThinFill} style={{ width: `${pairProgress}%` }} />
              </div>
              <div className="mt-2" style={{ fontSize: '0.85rem', color: 'var(--pk-ink3)' }}>
                {pairStatusText}
              </div>
            </div>
          </div>
        </section>

        {/* ================= 58.6 RECOVERY ================= */}
        <section className={`${styles.glass} p-3 p-lg-4 mb-4 ${styles.reveal}`} data-reveal>
          <div className={styles.sectionLabel}>58.6 · Recovery Without Passkey</div>
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <h2 className="mb-3">Keep a safe backup path.</h2>
              <p style={{ color: 'var(--pk-ink2)' }}>
                If you lose all passkeys, you can still regain access with traditional recovery. Paymo recommends
                keeping at least two recovery channels active.
              </p>
            </div>
            <div className="col-lg-7">
              <div className="row g-3">
                {config.recoveryCards.map((card) => (
                  <div className="col-md-4" key={card.title}>
                    <div className={`${styles.deviceCard} h-100`}>
                      <i className={`bi ${card.icon} ${styles.textGradient} fs-3`} />
                      <h6 className="mt-2">{card.title}</h6>
                      <p className={styles.cardDesc} style={{ fontSize: '0.82rem' }}>
                        {card.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= 58.7 ENTERPRISE ================= */}
        <section className={`${styles.glassStrong} p-3 p-lg-4 ${styles.reveal}`} data-reveal>
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
            <div>
              <div className={styles.sectionLabel}>58.7 · Enterprise Passkey Management</div>
              <h2 className="mb-0">Admin-grade enforcement.</h2>
            </div>
            <button className={`btn ${styles.btnOutlinePaymo}`} onClick={exportEnterprise}>
              <i className="bi bi-file-earmark-spreadsheet me-1" /> Export audit CSV
            </button>
          </div>
          <div className="row g-3">
            {config.policies.map((policy) => (
              <div className="col-lg-3 col-md-6" key={policy.id}>
                <div className={`${styles.enterpriseCard} h-100 d-flex justify-content-between gap-3`}>
                  <div>
                    <h6>{policy.title}</h6>
                    <p className={styles.cardDesc} style={{ fontSize: '0.82rem' }}>
                      {policy.text}
                    </p>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={policyState[policy.id] ?? policy.defaultOn}
                      onChange={() => togglePolicy(policy.id)}
                    />
                    <span className={styles.slider} />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="row g-3 mt-2">
            {config.enterpriseStats.map((s) => (
              <div className="col-md-4" key={s.label}>
                <div className={`${styles.glass} p-3`}>
                  <div className={`${s.gold ? styles.textGradientGold : styles.textGradient} fw-bold fs-3`}>
                    {s.value}
                  </div>
                  <div style={{ color: 'var(--pk-ink3)', fontSize: '0.78rem' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ================= CONFIRM / RENAME MODAL (React-driven) ================= */}
      {modal && (
        <>
          <div className={styles.modalBackdrop} onClick={() => setModal(null)} />
          <div className={styles.modalWrap} role="dialog" aria-modal="true" aria-labelledby="passkeyModalTitle">
            <div className={styles.modalBox}>
              <div className="d-flex align-items-center justify-content-between p-3 border-0">
                <h5 className="modal-title" id="passkeyModalTitle">
                  {modal.mode === 'remove' ? 'Remove passkey?' : 'Rename passkey'}
                </h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setModal(null)} />
              </div>
              <div className="px-3 pb-3" style={{ color: 'var(--pk-ink2)' }}>
                {modal.mode === 'remove' ? (
                  <p className="mb-0">
                    Remove <strong>{passkeys.find((p) => p.id === modal.id)?.name}</strong>? You will need a password
                    or another passkey on this device.
                  </p>
                ) : (
                  <>
                    <label className={styles.formLabelPaymo} htmlFor="renamePasskeyInput">
                      Passkey name
                    </label>
                    <input
                      id="renamePasskeyInput"
                      className={styles.formInput}
                      value={modal.name}
                      autoFocus
                      onChange={(e) => setModal({ ...modal, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename()
                        if (e.key === 'Escape') setModal(null)
                      }}
                    />
                  </>
                )}
              </div>
              <div className="d-flex justify-content-end gap-2 p-3 border-0">
                <button type="button" className={`btn ${styles.btnOutlinePaymo}`} onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn ${modal.mode === 'remove' ? styles.btnDangerSoft : styles.btnPrimaryPaymo}`}
                  onClick={modal.mode === 'remove' ? commitRemove : commitRename}
                >
                  {modal.mode === 'remove' ? 'Remove passkey' : 'Save name'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
