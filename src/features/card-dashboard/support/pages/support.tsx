import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/support.module.css'
import SupportModals from '../components/SupportModals'

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; to: string; label: string; active?: boolean; dot?: boolean }
interface AttentionItem { icon: string; iconBg: string; iconColor: string; iconText: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }
interface SuggestionItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface SupportItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; link: string; linkLabel: string }

interface SupportConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: { initials: string; name: string; role: string }
  breadcrumb: { parents: { label: string; to: string }[]; current: string }
  pageCode: string
  pageTitle: string
  pageSub: string
  hero: { score: string; detail: string }
  statCards: { key: string; col: string; label: string; labelColor: string; value: string; badge: { icon: string; text: string; tone: BadgeTone }; lines: string[]; borderColor?: string }[]
  sections: {
    attention: AttentionItem[]
    suggestions: SuggestionItem[]
    quickActions: QuickAction[]
    support: { title: string; sub: string; items: SupportItem[] }
  }
  openCases: { caseId: string; type: string; card: string; status: string; statusTone: BadgeTone; nextStep: string }[]
}

const initialMockData: SupportConfig = {
  nav: [
    { icon: 'bi-house', to: '/dashboard', label: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', to: '/select-dashboard', label: 'Hubs' },
    { icon: 'bi-wallet2', to: '/payments', label: 'Payments' },
    { icon: 'bi-credit-card', to: '/cards', label: 'Cards', active: true, dot: true },
    { icon: 'bi-shield-check', to: '/security', label: 'Security' },
    { icon: 'bi-gear', to: '/settings', label: 'Settings' },
  ],
  headerTitle: 'Card Support',
  headerSub: 'Self-service help, troubleshooting, disputes, and emergency support',
  searchPlaceholder: 'Search FAQ, disputes, support tickets...',
  user: { initials: 'AK', name: 'Amina K.', role: 'Card Holder' },
  breadcrumb: {
    parents: [{ label: 'Home', to: '/' }, { label: 'Card Center', to: '/select-dashboard' }],
    current: 'Support',
  },
  pageCode: 'PAGE 5.10',
  pageTitle: 'Card Support',
  pageSub: 'Access self-service help, troubleshoot declined transactions, file disputes, and reach emergency support services.',
  hero: {
    score: '91/100',
    detail: 'Excellent posture. Protected by AI.',
  },
  statCards: [
    { key: 'cards', col: 'col-lg-3 col-md-6', label: 'ACTIVE CARDS', labelColor: 'var(--pm-primary)', value: '7', badge: { icon: 'bi-credit-card-2-front', text: 'All active', tone: 'badgeS' }, lines: ['2 physical debit, 3 virtual debit, 1 virtual credit and 1 prepaid card'] },
    { key: 'score', col: 'col-lg-3 col-md-6', label: 'SECURITY SCORE', labelColor: 'var(--pm-accent)', value: '91/100', badge: { icon: 'bi-shield-check', text: 'Excellent', tone: 'badgeS' }, lines: ['3D Secure on all cards', 'PIN updated 14 days ago'] },
    { key: 'cases', col: 'col-lg-3 col-md-6', label: 'OPEN CASES', labelColor: 'var(--pm-warning)', value: '2', badge: { icon: 'bi-clock', text: '1 awaiting response', tone: 'badgeW' }, lines: ['Dispute #CDP-44892', 'PIN reset #PR-11228'] },
    { key: 'actions', col: 'col-lg-3 col-md-6', label: 'NEEDS ACTION', labelColor: 'var(--pm-danger)', value: '3', badge: { icon: 'bi-exclamation-triangle', text: 'Review below', tone: 'badgeD' }, lines: ['1 expiring, 1 frozen, 1 PIN change due'] },
  ],
  sections: {
    attention: [
      { icon: 'bi-credit-card', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', iconText: 'EX', title: 'Visa Debit expires in 28 days', sub: '****4521 · renew or replace', actionLabel: 'Renew', actionClass: 'btnPmDSoft', modal: 'renewCardModal' },
      { icon: 'bi-snow2', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', iconText: 'FR', title: 'Travel prepaid card frozen', sub: '****8890 · unfreeze to use', actionLabel: 'Unfreeze', modal: 'freezeCardModal' },
      { icon: 'bi-key', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', iconText: 'PIN', title: 'PIN change recommended', sub: 'Corporate ****6677 · 90+', actionLabel: 'Change', modal: 'changePinModal' },
    ],
    suggestions: [
      { icon: 'bi-bell', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Enable transaction alerts on 2 cards', sub: 'Increase fraud detection coverage', actionLabel: 'Enable', modal: 'notifSettingsModal' },
      { icon: 'bi-globe', iconBg: 'var(--pm-purple-soft)', iconColor: 'var(--pm-purple)', title: 'Lock international on daily-use card', sub: 'Only enable when travelling', actionLabel: 'Configure', modal: 'cardControlsModal' },
      { icon: 'bi-star', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Set default contactless card', sub: 'No default contactless card selected', actionLabel: 'Set', modal: 'defaultCardsModal' },
    ],
    quickActions: [
      { icon: 'bi-key', iconColor: 'var(--pm-primary)', label: 'Change PIN', modal: 'changePinModal' },
      { icon: 'bi-snow2', iconColor: 'var(--pm-info)', label: 'Freeze/Unfreeze', modal: 'freezeCardModal' },
      { icon: 'bi-exclamation-diamond', iconColor: 'var(--pm-danger)', label: 'Report Lost', modal: 'reportLostModal' },
      { icon: 'bi-sliders', iconColor: 'var(--pm-purple)', label: 'Card Controls', modal: 'cardControlsModal' },
      { icon: 'bi-shield-exclamation', iconColor: 'var(--pm-warning)', label: 'Dispute', modal: 'disputeModal' },
      { icon: 'bi-question-circle', iconColor: 'var(--pm-accent)', label: 'FAQ & Help', modal: 'faqModal' },
      { icon: 'bi-calculator', iconColor: 'var(--pm-muted)', label: 'Fee Calculator', modal: 'feeCalcModal' },
      { icon: 'bi-headset', iconColor: 'var(--pm-primary)', label: 'Live Support', modal: 'contactSupportModal' },
    ],
    support: {
      title: '5.10.3 — Card Support & Dispute Help',
      sub: 'Self-service FAQ, troubleshooting wizard, dispute filing, emergency hotlines, live chat and branch locator.',
      items: [
        { icon: 'bi-question-circle', iconBg: 'var(--pm-primary)', iconColor: '#fff', title: 'FAQ by card type', sub: '120+ answered questions', link: '#', linkLabel: 'View' },
        { icon: 'bi-wrench', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Troubleshoot wizard', sub: 'Step-by-step decline diagnosis', link: '#', linkLabel: 'Start' },
        { icon: 'bi-check-circle', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Card status checker', sub: 'Real-time card health', link: '#', linkLabel: 'Check' },
        { icon: 'bi-search', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'BIN lookup tool', sub: 'Verify card issuer / type', link: '#', linkLabel: 'Lookup' },
      ],
    },
  },
  openCases: [
    { caseId: 'CDP-44892', type: 'Chargeback', card: 'Visa ****4521', status: 'Awaiting evidence', statusTone: 'badgeW', nextStep: 'Upload merchant receipt' },
    { caseId: 'PR-11228', type: 'PIN Reset', card: 'MC ****3392', status: 'Processing', statusTone: 'badgeI', nextStep: 'OTP verification pending' },
    { caseId: 'FRZ-88100', type: 'Freeze request', card: 'Prepaid ****8890', status: 'Resolved', statusTone: 'badgeS', nextStep: 'Card re-frozen by cardholder' },
    { caseId: 'RPL-22019', type: 'Replacement', card: 'Visa ****4521', status: 'Awaiting dispatch', statusTone: 'badgeP', nextStep: 'Card personalised, courier pending' },
  ],
}

async function fetchSupportConfig(): Promise<SupportConfig> {
  try {
    const res = await fetch('/api/card-support', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return (await res.json()) as SupportConfig
  } catch {
    return initialMockData
  }
}

/* SUPPORT PAGE COMPONENT - PROFESSIONAL BOOTSTRAP GRID LAYOUT */
export default function Support() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-card-support'],
    queryFn: fetchSupportConfig,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  return (
    <div className={styles.supportPage}>
      <div className={styles.main}>
        <div className={styles.pageBar}>
                <div>
                  <div className={styles.breadcrumb}>
                    {config.breadcrumb.parents.map((p) => (
                      <span key={p.to}><Link to={p.to}>{p.label}</Link> / </span>
                    ))}
                    <strong>{config.breadcrumb.current}</strong>
                  </div>
                  <h2 className={styles.pageH2}>{config.pageCode} — {config.pageTitle}</h2>
                  <p className={styles.pageSub}>{config.pageSub}</p>
                </div>
                <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                  <button className={styles.btnPm} onClick={() => setActiveModal('troubleshootModal')}><i className="bi bi-wrench" /> Troubleshoot</button>
                  <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => setActiveModal('contactSupportModal')}><i className="bi bi-headset" /> Contact Support</button>
                </div>
              </div>

          {isLoading && (
            <div className="col-12">
              <div className="d-flex justify-content-center align-items-center" style={{ padding: 60 }}>
                <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
              </div>
            </div>
          )}

          {error && !errorDismissed && (
            <div className="col-12">
              <div className="alert alert-danger m-3 d-flex align-items-center justify-content-between" role="alert">
                <span><i className="bi bi-exclamation-triangle me-2" />Failed to load support data. Showing cached data.</span>
                <button className="btn-close" onClick={() => setErrorDismissed(true)} />
              </div>
            </div>
          )}

          {/* HERO STATS SECTION - FULL WIDTH */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
                <p style={{ margin: '0', fontSize: 12, color: 'rgba(255,255,255,.78)', textTransform: 'uppercase', fontWeight: 600 }}>Support center live <span style={{ color: '#86efac' }}>●</span></p>
                <div className={styles.sv} style={{ margin: '8px 0', color: '#fff' }}>24/7 Assistance</div>
                <p style={{ margin: '0', fontSize: 12, color: 'rgba(255,255,255,.78)' }}>Self-service tools, live chat, phone hotline, and emergency services available around the clock.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6">
              <div className={styles.card} style={{ minHeight: 170 }}>
                <p className={styles.sl} style={{ color: 'var(--pm-accent)' }}>OPEN CASES</p>
                <div className={styles.sv} style={{ margin: '6px 0' }}>2</div>
                <span className={`${styles.badge} ${styles.badgeW}`}><i className="bi bi-clock" /> 1 awaiting response</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Dispute #CDP-44892<br />PIN reset #PR-11228</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-4 col-6">
              <div className={styles.card} style={{ minHeight: 170 }}>
                <p className={styles.sl} style={{ color: 'var(--pm-info)' }}>AVG RESPONSE</p>
                <div className={styles.sv} style={{ margin: '6px 0' }}>45s</div>
                <span className={`${styles.badge} ${styles.badgeS}`}><i className="bi bi-chat-left-text" /> Live chat</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Phone: +254 800 723 001<br />Email: cards@paymo.co.ke</div>
              </div>
            </div>
            <div className="col-lg-2 col-md-4">
              <div className={styles.card} style={{ minHeight: 170, borderLeft: '3px solid var(--pm-danger)' }}>
                <p className={styles.sl} style={{ color: 'var(--pm-danger)' }}>EMERGENCY</p>
                <div className={styles.sv} style={{ margin: '6px 0' }}>24/7</div>
                <span className={`${styles.badge} ${styles.badgeD}`}><i className="bi bi-telephone" /> Hotline</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>+254 800 999 001<br />Lost / stolen cards</div>
              </div>
            </div>
          </div>

          {/* ATTENTION / SUGGESTIONS / QUICK ACTIONS - FULL WIDTH SECTIONS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.st}>Attention Required</h3>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('attentionFullModal')}>View all</button>
                </div>
                {config.sections.attention.map((item) => (
                  <div key={item.title} className={styles.sr}>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: item.iconBg, color: item.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}><i className={`bi ${item.icon}`} /></div>
                      <div><div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div></div>
                    </div>
                    <button className={`${styles.btnPm} ${styles.btnSm} ${item.actionClass ? styles[item.actionClass] : ''}`} onClick={() => setActiveModal(item.modal)}>{item.actionLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.st}>Smart Suggestions</h3>
                  <span className={`${styles.badge} ${styles.badgeP}`}><i className="bi bi-stars" /> AI</span>
                </div>
                {config.sections.suggestions.map((item) => (
                  <div key={item.title} className={styles.sr}>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: item.iconBg, color: item.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}><i className={`bi ${item.icon}`} /></div>
                      <div><div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div></div>
                    </div>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(item.modal)}>{item.actionLabel}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="mb-3">
                  <h3 className={styles.st}>Quick Actions</h3>
                  <p className={styles.ss}>Frequent card support workflows</p>
                </div>
                <div className={styles.quickGrid}>
                  {config.sections.quickActions.map((a) => (
                    <button key={a.label} className={styles.quickBtn} onClick={() => setActiveModal(a.modal)}>
                      <i className={`bi ${a.icon} me-1`} style={{ color: a.iconColor }} /> {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SUPPORT SECTIONS - FULL WIDTH */}
          <div className="row g-3">
            <div className="col-12">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
                  <div>
                    <h3 className={styles.st}><i className="bi bi-headset" style={{ color: 'var(--pm-accent)' }} /> {config.sections.support.title}</h3>
                    <p className={styles.ss}>{config.sections.support.sub}</p>
                  </div>
                  <div className="d-flex" style={{ gap: 8 }}>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('troubleshootModal')}><i className="bi bi-wrench" /> Troubleshoot</button>
                    <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('contactSupportModal')}><i className="bi bi-headset" /> Contact</button>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-lg-4">
                    <div className={styles.ub}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}><i className="bi bi-question-circle text-primary me-1"></i> Self-Service Help</h4>
                      {config.sections.support.items.map((item) => (
                        <div key={item.title} className={styles.sr} style={{ cursor: 'pointer' }} onClick={() => setActiveModal(item.title === 'FAQ by card type' ? 'faqModal' : item.title === 'Troubleshoot wizard' ? 'troubleshootModal' : item.title === 'Card status checker' ? 'cardStatusModal' : item.title === 'BIN lookup tool' ? 'binLookupModal' : item.title === 'Fee calculator' ? 'feeCalcModal' : 'contactSupportModal')}>
                          <div>
                            <strong>{item.title}</strong>
                            <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                          </div>
                          <i className="bi bi-chevron-right text-muted" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className={styles.ub}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}><i className="bi bi-chat-dots text-info me-1"></i> Support Channels</h4>
                      <div className={styles.sr} style={{ cursor: 'pointer' }} onClick={() => setActiveModal('contactSupportModal')}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--pm-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-chat-left-text" />
                          </div>
                          <div><strong>In-app chat</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Avg response: 45 seconds</div></div>
                        </div>
                      </div>
                      <div className={styles.sr} style={{ cursor: 'pointer' }} onClick={() => setActiveModal('contactSupportModal')}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--pm-accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-telephone" />
                          </div>
                          <div><strong>Card hotline</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>+254 800 723 001 · 24/7</div></div>
                        </div>
                      </div>
                      <div className={styles.sr} style={{ cursor: 'pointer' }} onClick={() => setActiveModal('contactSupportModal')}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--pm-warning)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-envelope" />
                          </div>
                          <div><strong>Email support</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>cards@paymo.co.ke</div></div>
                        </div>
                      </div>
                      <div className={styles.sr} style={{ cursor: 'pointer' }} onClick={() => setActiveModal('contactSupportModal')}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-whatsapp" />
                          </div>
                          <div><strong>WhatsApp</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>+254 712 000 001</div></div>
                        </div>
                      </div>
                      <div className={styles.sr} style={{ cursor: 'pointer' }} onClick={() => setActiveModal('branchLocatorModal')}>
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--pm-purple)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-geo-alt" />
                          </div>
                          <div><strong>Branch locator</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>In-person card assistance</div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className={styles.ub}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}><i className="bi bi-exclamation-triangle text-danger me-1"></i> Emergency Services</h4>
                      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-danger-soft)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#991B1B' }}>24/7 LOST / STOLEN HOTLINE</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--pm-danger)' }}>+254 800 999 001</div>
                        <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD} mt-2`} onClick={() => setActiveModal('reportLostModal')}>Report Lost / Stolen Now</button>
                      </div>
                      <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-warning-soft)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }}>EMERGENCY REPLACEMENT</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--pm-warning)' }}>Express courier within 4 hours</div>
                        <button className={`${styles.btnPm} ${styles.btnSm} mt-2`} onClick={() => setActiveModal('renewCardModal')}>Request Replacement</button>
                      </div>
                      <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8' }}>TRAVEL EMERGENCY</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--pm-info)' }}>Cash advance & concierge</div>
                        <button className={`${styles.btnPm} ${styles.btnSm} mt-2`} onClick={() => setActiveModal('emergencyModal')}>Get Help Abroad</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OPEN CASES - FULL WIDTH */}
          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0' }}>Open Cases & Dispute Tracker</h4>
                <div className="d-flex" style={{ gap: 8 }}>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('disputeModal')}><i className="bi bi-plus-lg" /> New Dispute</button>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('caseExportModal')}><i className="bi bi-download" /> Export</button>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className={styles.tbl}>
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Type</th>
                    <th>Card</th>
                    <th>Status</th>
                    <th>Opened</th>
                    <th>Next Step</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {config.openCases.map((c) => (
                    <tr key={c.caseId}>
                      <td data-label="Case ID"><strong>{c.caseId}</strong></td>
                      <td data-label="Type">{c.type}</td>
                      <td data-label="Card">{c.card}</td>
                      <td data-label="Status"><span className={`${styles.badge} ${styles[c.statusTone]}`}>{c.status}</span></td>
                      <td data-label="Opened">{c.nextStep === 'Upload merchant receipt' ? '24 Jun 2025' : c.nextStep === 'OTP verification pending' ? '26 Jun 2025' : c.nextStep === 'Card re-frozen by cardholder' ? '20 Jun 2025' : '22 Jun 2025'}</td>
                      <td data-label="Next Step">{c.nextStep}</td>
                      <td data-label="Action">
                        <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal(c.nextStep === 'Upload merchant receipt' ? 'disputeModal' : c.nextStep === 'OTP verification pending' ? 'changePinModal' : c.nextStep === 'Card re-frozen by cardholder' ? 'freezeCardModal' : 'renewCardModal')}>
                          {c.nextStep === 'Upload merchant receipt' ? 'Respond' : c.nextStep === 'OTP verification pending' ? 'Complete' : c.nextStep === 'Card re-frozen by cardholder' ? 'Review' : 'Track'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <SupportModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} config={config} />
    </div>
  )
}