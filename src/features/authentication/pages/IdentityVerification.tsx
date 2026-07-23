import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
if (typeof document !== 'undefined') {
  import('bootstrap/dist/js/bootstrap.bundle.min.js')
}
import styles from '../styles/identityVerification.module.css'

/* ============================================================================
   Paymo BAAS — Account Recovery & Identity Verification (legacy page59)
   React + TypeScript + TanStack Query, emerald-glass theme.
   ========================================================================== */

type MethodId = 'basic' | 'document' | 'video' | 'bank' | 'enterprise' | 'affidavit'
type Stage = 'select' | 'verify' | 'review' | 'done'
type BadgeTone = 'badgeOk' | 'badgeNative' | 'badgeAdv' | 'badgeSoon' | 'badgeWarn'

interface VerificationMethod {
  id: MethodId
  icon: string
  title: string
  text: string
  badges: { label: string; tone: BadgeTone }[]
}

interface NextAction {
  id: string
  icon: string
  title: string
  text: string
  cta: string
  primary?: boolean
}

interface KycConfig {
  pill: string
  heroTitleA: string
  heroTitleB: string
  heroText: string
  reasons: string[]
  heroStats: { lbl: string; val: string }[]
  methods: VerificationMethod[]
  docTypes: string[]
  languages: string[]
  timezones: string[]
  slots: string[]
  banks: string[]
  countries: string[]
  caseTypes: string[]
  statusSteps: { icon: string; title: string; text: string }[]
  nextActions: NextAction[]
}

const STAGE_ORDER: Stage[] = ['select', 'verify', 'review', 'done']

const RAIL_STEPS: { stage: Stage; icon: string; label: string }[] = [
  { stage: 'select', icon: 'bi-grid', label: 'Method' },
  { stage: 'verify', icon: 'bi-person-vcard', label: 'Verify' },
  { stage: 'review', icon: 'bi-hourglass-split', label: 'Review' },
  { stage: 'done', icon: 'bi-check2-circle', label: 'Next steps' },
]

/* Demo micro-deposit values accepted by the legacy page (verbatim). */
const DEMO_DEPOSIT_1 = '0.23'
const DEMO_DEPOSIT_2 = '0.47'

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: KycConfig = {
  pill: 'High assurance recovery',
  heroTitleA: 'Verify your',
  heroTitleB: 'identity.',
  heroText:
    'We need to confirm it is really you. This protects your Paymo account from unauthorized recovery, fraud, and sensitive-action abuse.',
  reasons: [
    'Account recovery',
    'Large transaction above $10,000',
    'Sensitive action: API key rotation',
    'Regulatory requirement: KYC refresh',
  ],
  heroStats: [
    { lbl: 'Auto review', val: '2-5 min' },
    { lbl: 'Video calls', val: '4h SLA' },
    { lbl: 'Languages', val: '8' },
    { lbl: 'Encryption', val: 'TLS 1.3' },
  ],
  methods: [
    {
      id: 'basic',
      icon: 'bi-shield-check',
      title: 'Level 1 - Basic',
      text: 'Dual-channel OTP plus security questions for low-risk recovery.',
      badges: [
        { label: 'Email', tone: 'badgeOk' },
        { label: 'SMS', tone: 'badgeOk' },
      ],
    },
    {
      id: 'document',
      icon: 'bi-person-vcard',
      title: 'Level 2 - Standard',
      text: 'Government ID, selfie match, and automated document review.',
      badges: [
        { label: 'ID', tone: 'badgeNative' },
        { label: 'Selfie', tone: 'badgeNative' },
      ],
    },
    {
      id: 'video',
      icon: 'bi-camera-video',
      title: 'Level 3 - Video',
      text: 'Live agent verification for high-risk recovery and legal holds.',
      badges: [{ label: '4h slots', tone: 'badgeAdv' }],
    },
    {
      id: 'bank',
      icon: 'bi-bank',
      title: 'Bank Micro-deposit',
      text: 'Confirm ownership of a linked bank account with two small amounts.',
      badges: [{ label: '1-2 days', tone: 'badgeSoon' }],
    },
    {
      id: 'enterprise',
      icon: 'bi-building-lock',
      title: 'Enterprise Courier',
      text: 'Document courier verification for enterprise admins and signatories.',
      badges: [{ label: 'High assurance', tone: 'badgeWarn' }],
    },
    {
      id: 'affidavit',
      icon: 'bi-file-earmark-lock',
      title: 'Notarized Affidavit',
      text: 'Legal dispute recovery with notarized statement and compliance review.',
      badges: [{ label: '3-5 days', tone: 'badgeWarn' }],
    },
  ],
  docTypes: ['Passport', 'National ID', "Driver's License", "Voter's Card"],
  languages: ['English', 'French', 'Portuguese', 'Swahili', 'Arabic', 'Hausa', 'Yoruba', 'Zulu'],
  timezones: ['WAT - Lagos', 'EAT - Nairobi', 'GMT - Accra/London', 'GST - Dubai'],
  slots: [
    'Today 14:00',
    'Today 16:30',
    'Tomorrow 09:00',
    'Tomorrow 11:30',
    'Tomorrow 15:00',
    '+2 days 10:00',
    '+2 days 13:30',
    '+2 days 17:00',
  ],
  banks: ['GTBank', 'Equity Bank', 'Stanbic Bank', 'Standard Bank'],
  countries: ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'United Kingdom'],
  caseTypes: [
    'Lost access to all factors',
    'Business signatory dispute',
    'Estate/legal representative',
    'Regulatory hold appeal',
  ],
  statusSteps: [
    { icon: 'bi-check-lg', title: 'Submitted', text: 'Evidence package received' },
    { icon: 'bi-hourglass-split', title: 'Under review', text: 'Automated and human checks running' },
    { icon: 'bi-info', title: 'Decision', text: 'Approved, rejected, or additional info required' },
  ],
  nextActions: [
    {
      id: 'password',
      icon: 'bi-key',
      title: 'Set new password',
      text: 'Create a strong password and revoke older login credentials.',
      cta: 'Start password reset',
    },
    {
      id: 'mfa',
      icon: 'bi-phone',
      title: 'Re-enroll MFA',
      text: 'Refresh authenticator, SMS, WhatsApp, or passkey factors.',
      cta: 'Open MFA setup',
    },
    {
      id: 'sessions',
      icon: 'bi-clock-history',
      title: 'Review login activity',
      text: 'Check recent logins and mark unauthorized devices.',
      cta: 'Review sessions',
    },
    {
      id: 'passkey',
      icon: 'bi-shield-lock',
      title: 'Set up passkey',
      text: 'Add phishing-resistant recovery for future access.',
      cta: 'Create passkey',
      primary: true,
    },
  ],
}

/* ---------- TanStack Query fetcher (generic API placeholder) ---------- */
async function fetchKycConfig(): Promise<KycConfig> {
  const res = await fetch('/api/kyc-config')
  if (!res.ok) throw new Error(`Request failed with ${res.status}`)
  const json = (await res.json()) as Partial<KycConfig>
  return { ...initialMockData, ...json }
}

export default function IdentityVerification() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-kyc-config'],
    queryFn: fetchKycConfig,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)

  /* ---------- method & stage state machine ---------- */
  const [selected, setSelected] = useState<MethodId>('basic')
  const [stage, setStage] = useState<Stage>('select')
  const [reasonIndex, setReasonIndex] = useState(0)

  const stageIndex = STAGE_ORDER.indexOf(stage)

  /* ---------- reason select ---------- */
  const pickReason = (idx: number) => setReasonIndex(idx)

  /* ---------- risk badge derivation (legacy mapping, verbatim) ---------- */
  const riskLabel = selected === 'basic' ? 'Risk: Low' : selected === 'document' || selected === 'bank' ? 'Risk: Medium' : 'Risk: High'
  const riskTone =
    selected === 'basic' ? styles.badgeOk : selected === 'document' || selected === 'bank' ? styles.badgeNative : styles.badgeWarn

  /* ---------- verify flow state ---------- */
  // document flow
  const docFileRef = useRef<HTMLInputElement | null>(null)
  const [docLoaded, setDocLoaded] = useState(false)
  const [docError, setDocError] = useState(false)
  const [liveness, setLiveness] = useState({ blink: false, turn: false, smile: false })
  // video flow
  const [slot, setSlot] = useState<string | null>(null)
  // bank flow
  const [depositsSent, setDepositsSent] = useState(false)
  const acctNumRef = useRef<HTMLInputElement | null>(null)
  const dep1Ref = useRef<HTMLInputElement | null>(null)
  const dep2Ref = useRef<HTMLInputElement | null>(null)

  /* ---------- review state ---------- */
  const [caseId, setCaseId] = useState('IDV-0000')
  const [caseEta, setCaseEta] = useState('2-5 min')
  const [reviewPct, setReviewPct] = useState(38)

  /* ---------- done state ---------- */
  const [queuedActions, setQueuedActions] = useState<Record<string, boolean>>({})

  /* ---------- panel navigation (legacy goto/showFlow) ---------- */
  const goto = (name: Stage) => setStage(name)

  const showFlow = () => setStage('verify')

  const simulateRisk = () => {
    const routes: MethodId[] = ['basic', 'document', 'video', 'bank', 'enterprise', 'affidavit']
    setSelected(routes[Math.floor(Math.random() * routes.length)])
    setReasonIndex(Math.floor(Math.random() * config.reasons.length))
  }

  /* ---------- document upload & liveness (legacy handlers) ---------- */
  const handleDocPicked = () => {
    if (!docFileRef.current?.files?.length) return
    setDocLoaded(true)
    setDocError(false)
  }

  const runLiveness = (key: 'blink' | 'turn' | 'smile') =>
    setLiveness((prev) => ({ ...prev, [key]: true }))

  const livenessComplete = liveness.blink && liveness.turn && liveness.smile

  /* ---------- verification submit (legacy validation, verbatim) ---------- */
  const submitVerify = () => {
    if (selected === 'document' && !docLoaded) {
      setDocError(true)
      return
    }
    if (selected === 'bank' && depositsSent) {
      if (dep1Ref.current?.value !== DEMO_DEPOSIT_1 || dep2Ref.current?.value !== DEMO_DEPOSIT_2) {
        dep1Ref.current?.focus()
        return
      }
    }
    setCaseId('IDV-' + Math.floor(1000 + Math.random() * 9000))
    setCaseEta(selected === 'video' ? 'After video call' : selected === 'enterprise' || selected === 'affidavit' ? '3-5 days' : '2-5 min')
    goto('review')
    /* legacy review progress simulation: 38% → +12% / 650ms → done */
    setReviewPct(38)
    let w = 38
    const timer = window.setInterval(() => {
      w += 12
      setReviewPct(Math.min(w, 100))
      if (w >= 100) {
        window.clearInterval(timer)
        window.setTimeout(() => goto('done'), 500)
      }
    }, 650)
  }

  const queueAction = (id: string) => setQueuedActions((prev) => ({ ...prev, [id]: true }))

  return (
    <div className={styles.kycPage}>
      <div className={styles.gridOverlay} />
      <div className={styles.blob} style={{ width: 520, height: 520, background: '#2ee6a0', top: -160, right: -120 }} />
      <div
        className={styles.blob}
        style={{ width: 420, height: 420, background: '#0f9d6c', bottom: -130, left: -80, animationDelay: '-6s' }}
      />

      {/* ---------- query error banner ---------- */}
      {error && !errorDismissed && (
        <div className={`alert alert-danger alert-dismissible ${styles.errorBanner}`} role="alert">
          <strong>Could not load verification config.</strong> Showing the built-in defaults.{' '}
          <span className="text-decoration-underline">{String((error as Error).message ?? '')}</span>
          <button type="button" className="btn-close" aria-label="Close" onClick={() => setErrorDismissed(true)} />
        </div>
      )}

      {/* ---------- loading overlay ---------- */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingBox}>
            <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            Loading verification config…
          </div>
        </div>
      )}

      <div className={`container ${styles.contentWrap}`}>
        <div className="row g-4 align-items-stretch">
          {/* ============ LEFT — HERO PANEL ============ */}
          <aside className="col-lg-5">
            <div className={`${styles.glassStrong} ${styles.heroPanel}`}>
              <div className={styles.heroContent}>
                <div>
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <span className={styles.logoMark}>P</span>
                    <div>
                      <div className="fw-bold text-white">
                        Paymo <span className={styles.textGradient}>BAAS</span>
                      </div>
                      <div className={styles.mutedSmall}>Identity Verification</div>
                    </div>
                  </div>
                  <span className={`${styles.pill} mb-3`}>
                    <span className={styles.pillDot} /> {config.pill}
                  </span>
                  <h1 style={{ fontSize: 'clamp(2.2rem, 4.4vw, 4rem)', lineHeight: 1.02, fontWeight: 900 }}>
                    {config.heroTitleA} <span className={styles.textGradient}>{config.heroTitleB}</span>
                  </h1>
                  <p className="mt-3" style={{ color: 'var(--iv-ink2)', maxWidth: 430 }}>
                    {config.heroText}
                  </p>
                  <div className={`${styles.glass} p-3 mt-4 ${styles.reasonCard}`}>
                    <div className={`${styles.sectionTitle} mb-2`}>Reason for verification</div>
                    <select
                      className="form-select"
                      value={config.reasons[reasonIndex]}
                      onChange={(e) => pickReason(config.reasons.indexOf(e.target.value))}
                      aria-label="Reason for verification"
                    >
                      {config.reasons.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="row g-2">
                    {config.heroStats.map((s) => (
                      <div className="col-6" key={s.lbl}>
                        <div className={styles.detailStat}>
                          <div className={styles.detailStatLbl}>{s.lbl}</div>
                          <div className={styles.detailStatVal}>{s.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ============ RIGHT — FLOW PANEL ============ */}
          <section className="col-lg-7">
            <div className={`${styles.glassStrong} p-3 p-md-4`}>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                  <div className={styles.sectionTitle}>Page 59 - Account Recovery &amp; Identity Verification</div>
                  <h2 className="mb-1" style={{ fontSize: '1.55rem' }}>
                    Choose a verification path
                  </h2>
                  <p className="mb-0" style={{ color: 'var(--iv-ink2)', fontSize: '0.92rem' }}>
                    Select the assurance level that matches your risk prompt.
                  </p>
                </div>
                <span className={`${styles.badgeMini} ${riskTone}`}>{riskLabel}</span>
              </div>

              {/* ---------- step rail ---------- */}
              <div className={`${styles.stepRail} mb-4`}>
                {RAIL_STEPS.map((s) => {
                  const idx = STAGE_ORDER.indexOf(s.stage)
                  return (
                    <span
                      key={s.stage}
                      className={`${styles.stepChip} ${idx === stageIndex ? styles.stepChipActive : ''} ${
                        idx < stageIndex ? styles.stepChipDone : ''
                      }`}
                    >
                      <i className={`bi ${s.icon}`} /> {s.label}
                    </span>
                  )
                })}
              </div>

              {/* ============ PANEL: method select ============ */}
              <div className={`${styles.hiddenPanel} ${stage === 'select' ? styles.hiddenPanelActive : ''}`}>
                <div className="row g-3">
                  {config.methods.map((m) => (
                    <div className="col-md-6 col-xl-4" key={m.id}>
                      <div
                        className={`${styles.methodCard} ${selected === m.id ? styles.methodCardActive : ''}`}
                        onClick={() => setSelected(m.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setSelected(m.id)
                        }}
                      >
                        <div className="d-flex justify-content-between">
                          <div className={styles.methodIcon}>
                            <i className={`bi ${m.icon}`} />
                          </div>
                          <span className={styles.checkDot} />
                        </div>
                        <h5 style={{ fontSize: '1rem' }}>{m.title}</h5>
                        <p style={{ fontSize: '0.82rem', color: 'var(--iv-ink2)', margin: 0 }}>{m.text}</p>
                        <div className="mt-3 d-flex gap-1 flex-wrap">
                          {m.badges.map((b) => (
                            <span key={b.label} className={`${styles.badgeMini} ${styles[b.tone]}`}>
                              {b.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <button className={`btn ${styles.btnPrimaryPaymo}`} onClick={showFlow}>
                    <i className="bi bi-arrow-right-circle me-1" /> Continue verification
                  </button>
                  <button className={`btn ${styles.btnOutlinePaymo}`} onClick={simulateRisk}>
                    <i className="bi bi-lightning-charge me-1" /> Simulate risk routing
                  </button>
                </div>
              </div>

              {/* ============ PANEL: verify flows ============ */}
              <div className={`${styles.hiddenPanel} ${stage === 'verify' ? styles.hiddenPanelActive : ''}`}>
                {/* ---- basic ---- */}
                {selected === 'basic' && (
                  <div>
                    <h4>Dual-channel verification</h4>
                    <p className={styles.mutedBody}>Enter both OTP codes and answer 2 security questions.</p>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className={styles.formLabelPaymo} htmlFor="kycEmailOtp">
                          Email OTP
                        </label>
                        <input className="form-control" id="kycEmailOtp" maxLength={6} placeholder="123456" />
                      </div>
                      <div className="col-md-6">
                        <label className={styles.formLabelPaymo} htmlFor="kycSmsOtp">
                          SMS OTP
                        </label>
                        <input className="form-control" id="kycSmsOtp" maxLength={6} placeholder="654321" />
                      </div>
                      <div className="col-md-6">
                        <label className={styles.formLabelPaymo} htmlFor="kycQ1">
                          Security question 1
                        </label>
                        <input className="form-control" id="kycQ1" placeholder="City where you were born" />
                      </div>
                      <div className="col-md-6">
                        <label className={styles.formLabelPaymo} htmlFor="kycQ2">
                          Security question 2
                        </label>
                        <input className="form-control" id="kycQ2" placeholder="First school name" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ---- document ---- */}
                {selected === 'document' && (
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <h4>Document upload verification</h4>
                      <p className={styles.mutedBody}>
                        Select document type, upload or capture the document, then complete a live selfie match.
                      </p>
                      <label className={styles.formLabelPaymo} htmlFor="docType">
                        Document type
                      </label>
                      <select className="form-select mb-3" id="docType">
                        {config.docTypes.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                      <input type="file" ref={docFileRef} className="d-none" accept="image/*,.pdf" onChange={handleDocPicked} />
                      <div
                        className={`${styles.uploadZone} ${docLoaded ? styles.uploadZoneLoaded : ''} ${
                          docError ? styles.uploadZoneError : ''
                        }`}
                        onClick={() => docFileRef.current?.click()}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') docFileRef.current?.click()
                        }}
                      >
                        {docLoaded ? (
                          <>
                            <i className="bi bi-check-circle" style={{ fontSize: '2rem', color: '#86efac' }} />
                            <div className="fw-bold mt-2">Document received</div>
                            <div className={styles.mutedSmall}>Auto-crop and OCR complete</div>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cloud-arrow-up" style={{ fontSize: '2rem', color: 'var(--iv-accent)' }} />
                            <div className="fw-bold mt-2">Upload or capture document</div>
                            <div className={styles.mutedSmall}>JPEG, PNG, or PDF. Auto-crop enabled.</div>
                          </>
                        )}
                      </div>
                      <div className="mt-3">
                        {['Lighting', 'Glare detection', 'Frame quality'].map((label) => (
                          <div className={styles.qualityRow} key={label}>
                            <span>{label}</span>
                            <span className={`${styles.badgeMini} ${docLoaded ? styles.badgeOk : styles.badgeSoon}`}>
                              {docLoaded ? 'Passed' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className={styles.cameraBox}>
                        <div className={styles.cameraIcon}>
                          <i className="bi bi-person-bounding-box" />
                        </div>
                        <div className={styles.scanLine} />
                        <div className={styles.faceFrame} />
                      </div>
                      <div className="d-flex flex-wrap gap-2 mt-3">
                        <button
                          className={`btn btn-sm ${liveness.blink ? styles.btnPrimaryPaymo : styles.btnOutlinePaymo}`}
                          onClick={() => runLiveness('blink')}
                        >
                          <i className="bi bi-eye me-1" /> Blink
                        </button>
                        <button
                          className={`btn btn-sm ${liveness.turn ? styles.btnPrimaryPaymo : styles.btnOutlinePaymo}`}
                          onClick={() => runLiveness('turn')}
                        >
                          <i className="bi bi-arrow-left-right me-1" /> Turn head
                        </button>
                        <button
                          className={`btn btn-sm ${liveness.smile ? styles.btnPrimaryPaymo : styles.btnOutlinePaymo}`}
                          onClick={() => runLiveness('smile')}
                        >
                          <i className="bi bi-emoji-smile me-1" /> Smile
                        </button>
                      </div>
                      <div className={`${styles.detailStat} mt-3`}>
                        <div className={styles.detailStatLbl}>Face match confidence</div>
                        <div className={styles.detailStatVal}>
                          {livenessComplete ? <span className={styles.faceScoreOk}>97.8% match</span> : 'Not captured'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---- video ---- */}
                {selected === 'video' && (
                  <div>
                    <h4>Schedule a 5-minute video call</h4>
                    <p className={styles.mutedBody}>
                      Have a valid ID ready, use good lighting, and join from a stable connection.
                    </p>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className={styles.formLabelPaymo} htmlFor="callLang">
                          Language
                        </label>
                        <select className="form-select" id="callLang">
                          {config.languages.map((l) => (
                            <option key={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className={styles.formLabelPaymo} htmlFor="callTz">
                          Timezone
                        </label>
                        <select className="form-select" id="callTz">
                          {config.timezones.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="row g-2 mt-3">
                      {config.slots.map((s) => (
                        <div className="col-6 col-md-3" key={s}>
                          <div
                            className={`${styles.slot} ${slot === s ? styles.slotActive : ''}`}
                            onClick={() => setSlot(s)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') setSlot(s)
                            }}
                          >
                            {s}
                          </div>
                        </div>
                      ))}
                    </div>
                    {slot && (
                      <div className={`${styles.glass} p-3 mt-3 ${styles.callConfirm}`}>
                        <i className="bi bi-calendar-check me-2" style={{ color: '#86efac' }} />
                        Video call reserved for <strong>{slot}</strong>. Calendar invite will be sent after submission.
                      </div>
                    )}
                  </div>
                )}

                {/* ---- bank ---- */}
                {selected === 'bank' && (
                  <div>
                    <h4>Micro-deposit verification</h4>
                    <p className={styles.mutedBody}>
                      We send two small deposits to your linked bank. Enter the amounts to confirm ownership.
                    </p>
                    {!depositsSent ? (
                      <div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className={styles.formLabelPaymo} htmlFor="bankName">
                              Bank name
                            </label>
                            <select className="form-select" id="bankName">
                              {config.banks.map((b) => (
                                <option key={b}>{b}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className={styles.formLabelPaymo} htmlFor="acctNum">
                              Account number
                            </label>
                            <input className="form-control" id="acctNum" ref={acctNumRef} placeholder="0123456789" />
                          </div>
                        </div>
                        <button
                          className={`btn ${styles.btnOutlinePaymo} mt-3`}
                          onClick={() => {
                            if (!acctNumRef.current?.value) {
                              acctNumRef.current?.focus()
                              return
                            }
                            setDepositsSent(true)
                          }}
                        >
                          Send micro-deposits
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className={styles.formLabelPaymo} htmlFor="dep1">
                              First amount
                            </label>
                            <input className="form-control" id="dep1" ref={dep1Ref} placeholder={DEMO_DEPOSIT_1} />
                          </div>
                          <div className="col-md-6">
                            <label className={styles.formLabelPaymo} htmlFor="dep2">
                              Second amount
                            </label>
                            <input className="form-control" id="dep2" ref={dep2Ref} placeholder={DEMO_DEPOSIT_2} />
                          </div>
                        </div>
                        <p className="mt-2" style={{ fontSize: '0.82rem', color: 'var(--iv-ink3)' }}>
                          Demo accepted values: {DEMO_DEPOSIT_1} and {DEMO_DEPOSIT_2}.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ---- enterprise ---- */}
                {selected === 'enterprise' && (
                  <div>
                    <h4>Enterprise document courier verification</h4>
                    <p className={styles.mutedBody}>
                      For enterprise admins and signatories, we verify original documents through an approved courier
                      partner.
                    </p>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className={styles.formLabelPaymo} htmlFor="entName">
                          Company legal name
                        </label>
                        <input className="form-control" id="entName" placeholder="Company Ltd" />
                      </div>
                      <div className="col-md-6">
                        <label className={styles.formLabelPaymo} htmlFor="entCountry">
                          Registered country
                        </label>
                        <select className="form-select" id="entCountry">
                          {config.countries.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className={styles.formLabelPaymo} htmlFor="pickupAddr">
                          Courier pickup address
                        </label>
                        <input className="form-control" id="pickupAddr" placeholder="Office address" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ---- affidavit ---- */}
                {selected === 'affidavit' && (
                  <div>
                    <h4>Notarized affidavit recovery</h4>
                    <p className={styles.mutedBody}>
                      For legal disputes, ownership conflicts, or inaccessible recovery factors.
                    </p>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className={styles.formLabelPaymo} htmlFor="affCase">
                          Case type
                        </label>
                        <select className="form-select" id="affCase">
                          {config.caseTypes.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className={styles.formLabelPaymo} htmlFor="jurisdiction">
                          Jurisdiction
                        </label>
                        <input className="form-control" id="jurisdiction" placeholder="e.g. Lagos, Nigeria" />
                      </div>
                      <div className="col-12">
                        <label className={styles.formLabelPaymo} htmlFor="affText">
                          Short explanation
                        </label>
                        <textarea className="form-control" rows={3} id="affText" placeholder="Describe the recovery issue" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex flex-wrap gap-2 mt-4">
                  <button className={`btn ${styles.btnPrimaryPaymo}`} onClick={submitVerify}>
                    <i className="bi bi-shield-check me-1" /> Submit verification
                  </button>
                  <button className={`btn ${styles.btnOutlinePaymo}`} onClick={() => goto('select')}>
                    <i className="bi bi-arrow-left me-1" /> Change method
                  </button>
                </div>
              </div>

              {/* ============ PANEL: review ============ */}
              <div className={`${styles.hiddenPanel} ${stage === 'review' ? styles.hiddenPanelActive : ''}`}>
                <div className="row g-4">
                  <div className="col-lg-6">
                    <h4>Verification status tracking</h4>
                    <p className={styles.mutedBody}>
                      Email and push notifications are sent at each stage. If rejected, we provide a clear reason and
                      re-submission guidance.
                    </p>
                    <div>
                      {config.statusSteps.map((s, i) => (
                        <div
                          key={s.title}
                          className={`${styles.statusLine} ${i === 0 ? styles.statusLineDone : ''} ${
                            i === 1 ? styles.statusLineActive : ''
                          }`}
                        >
                          <span className={styles.statusDot}>
                            <i className={`bi ${s.icon}`} />
                          </span>
                          <strong>{s.title}</strong>
                          <div className={styles.mutedSmall}>{s.text}</div>
                        </div>
                      ))}
                    </div>
                    <div className="progress mt-3">
                      <div className="progress-bar" style={{ width: `${reviewPct}%` }} />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className={styles.flowFrame}>
                      <div className={styles.flowLabel}>
                        <span className={`${styles.badgeMini} ${styles.badgeNative}`}>Review engine</span>
                        <div className="fw-bold text-white mt-1">Identity graph, fraud checks, and compliance rules</div>
                      </div>
                    </div>
                    <div className="row g-2 mt-3">
                      <div className="col-6">
                        <div className={styles.detailStat}>
                          <div className={styles.detailStatLbl}>Case ID</div>
                          <div className={`${styles.detailStatVal} ${styles.mono}`}>{caseId}</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className={styles.detailStat}>
                          <div className={styles.detailStatLbl}>ETA</div>
                          <div className={styles.detailStatVal}>{caseEta}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ============ PANEL: done ============ */}
              <div className={`${styles.hiddenPanel} ${stage === 'done' ? styles.hiddenPanelActive : ''}`}>
                <div className={styles.successCard}>
                  <div className={styles.successIcon}>
                    <i className="bi bi-check-lg" />
                  </div>
                  <h3>Identity verified</h3>
                  <p style={{ color: 'var(--iv-ink2)', maxWidth: 520, margin: '0 auto 1.5rem' }}>
                    Your account recovery can continue. Please secure your account with the next actions.
                  </p>
                  <div className="row g-3 text-start">
                    {config.nextActions.map((a) => (
                      <div className="col-md-6" key={a.id}>
                        <div className={styles.methodCard} style={{ cursor: 'default' }}>
                          <div className={styles.methodIcon}>
                            <i className={`bi ${a.icon}`} />
                          </div>
                          <h5 style={{ fontSize: '1rem' }}>{a.title}</h5>
                          <p style={{ fontSize: '0.82rem', color: 'var(--iv-ink2)' }}>{a.text}</p>
                          <button
                            className={`btn btn-sm w-100 ${a.primary ? styles.btnPrimaryPaymo : styles.btnOutlinePaymo}`}
                            disabled={!!queuedActions[a.id]}
                            onClick={() => queueAction(a.id)}
                          >
                            {queuedActions[a.id] ? (
                              <>
                                <i className="bi bi-check-lg me-1" /> Action queued
                              </>
                            ) : (
                              a.cta
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
