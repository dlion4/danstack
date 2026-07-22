import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/account-settings.module.css'
import AccountSettingsModals from '../components/AccountSettingsModals'

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; to: string; label: string; active?: boolean; dot?: boolean }
interface CardItem { last4: string; name: string; type: string; status: string; expiry: string; color: string; icon: string }
interface AlertItem { type: string; icon: string; iconBg: string; iconColor: string; title: string; sub: string; actionLabel: string; actionModal: string; checked?: boolean; value?: string }
interface OpenCase { caseId: string; type: string; card: string; status: string; statusTone: BadgeTone; nextStep: string }

interface AccountSettingsConfig {
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
    preferences: { title: string; sub: string; cards: CardItem[] }
    alerts: { title: string; sub: string; alerts: AlertItem[] }
  }
  openCases: OpenCase[]
}

const initialMockData: AccountSettingsConfig = {
  nav: [
    { icon: 'bi-house', to: '/dashboard', label: 'Dashboard' },
    { icon: 'bi-grid-3x3-gap', to: '/select-dashboard', label: 'Hubs' },
    { icon: 'bi-wallet2', to: '/payments', label: 'Payments' },
    { icon: 'bi-credit-card', to: '/cards', label: 'Cards', active: true, dot: true },
    { icon: 'bi-shield-check', to: '/security', label: 'Security' },
    { icon: 'bi-gear', to: '/settings', label: 'Settings' },
  ],
  headerTitle: 'Card Account & Settings',
  headerSub: 'Configure card defaults, preferences, and notification settings',
  searchPlaceholder: 'Search card settings, defaults, alerts...',
  user: { initials: 'AK', name: 'Amina K.', role: 'Card Holder' },
  breadcrumb: {
    parents: [{ label: 'Home', to: '/' }, { label: 'Card Center', to: '/select-dashboard' }],
    current: 'Account & Settings',
  },
  pageCode: 'PAGE 5.10',
  pageTitle: 'Card Account & Settings',
  pageSub: 'Configure default payment cards, personalize alert preferences, and manage your card portfolio settings.',
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
    preferences: {
      title: '5.10.1 — Card Preferences & Defaults',
      sub: 'Configure default payment cards, organise your portfolio, set naming conventions, colour codes and quick-access ordering.',
      cards: [
        { last4: '4521', name: 'Primary Debit', type: 'Visa Debit', status: 'active', expiry: '07/25', color: '#4F46E5', icon: 'bi-credit-card-2-front' },
        { last4: '3392', name: 'Tap-Pay Card', type: 'MC Debit', status: 'active', expiry: '11/26', color: '#10B981', icon: 'bi-nfc' },
        { last4: '1190', name: 'Online Shopping', type: 'Virtual Credit', status: 'active', expiry: '12/27', color: '#8B5CF6', icon: 'bi-cart' },
        { last4: '8890', name: 'Travel Fund', type: 'Prepaid', status: 'frozen', expiry: '03/27', color: '#F59E0B', icon: 'bi-airplane' },
        { last4: '6677', name: 'Corporate', type: 'Business Debit', status: 'active', expiry: '09/26', color: '#3B82F6', icon: 'bi-briefcase' },
      ],
    },
    alerts: {
      title: '5.10.2 — Notification & Alert Settings',
      sub: 'Fine-tune transaction alerts, security notifications, billing reminders, expiry warnings and delivery updates per card and per channel.',
      alerts: [
        { type: 'All transactions', icon: 'bi-receipt', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'All transactions', sub: 'Notify on every card transaction', actionLabel: 'Enable', actionModal: 'notifSettingsModal', checked: true },
        { type: 'Large transactions only', icon: 'bi-graph-up-arrow', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Large transactions only', sub: 'Notify if amount exceeds threshold', actionLabel: 'Configure', actionModal: 'notifSettingsModal', value: '10,000' },
        { type: 'International transactions', icon: 'bi-globe', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'International transactions', sub: 'Alert for non-KES payments', actionLabel: 'Enable', actionModal: 'notifSettingsModal', checked: true },
        { type: 'Declined transactions', icon: 'bi-x-circle', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Declined transactions', sub: 'With decline reason code', actionLabel: 'Enable', actionModal: 'notifSettingsModal', checked: true },
        { type: 'Contactless limit reached', icon: 'bi-wifi', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Contactless limit reached', sub: 'When tap-to-pay limit hit', actionLabel: 'Enable', actionModal: 'notifSettingsModal', checked: true },
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

async function fetchAccountSettingsConfig(): Promise<AccountSettingsConfig> {
  try {
    const res = await fetch('/api/account-settings', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return (await res.json()) as AccountSettingsConfig
  } catch {
    return initialMockData
  }
}

export default function AccountSettings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-account-settings'],
    queryFn: fetchAccountSettingsConfig,
    retry: 1,
    staleTime: 60_000,
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  return (
    <div className={styles.accountSettingsPage}>
      <div className={styles.main}>
        {/* PAGE BAR - FULL WIDTH SECTION */}
        <div className="row mb-4">
          <div className="col-12">
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
                <button className={styles.btnPm} onClick={() => setActiveModal('changePinModal')}><i className="bi bi-key" /> Change PIN</button>
                <button className={styles.btnPm} onClick={() => setActiveModal('freezeCardModal')}><i className="bi bi-snow" /> Freeze Card</button>
                <button className={styles.btnPm} onClick={() => setActiveModal('troubleshootModal')}><i className="bi bi-wrench" /> Troubleshoot</button>
              </div>
            </div>
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
              <span><i className="bi bi-exclamation-triangle me-2" />Failed to load settings data. Showing cached data.</span>
              <button className="btn-close" onClick={() => setErrorDismissed(true)} />
            </div>
          </div>
        )}

        {/* HERO STATS SECTION - FULL WIDTH */}
        <div className="row g-3 mb-4">
          <div className="col-lg-4">
            <div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
              <p style={{ margin: '0', fontSize: 12, color: 'rgba(255,255,255,.78)', textTransform: 'uppercase', fontWeight: 600 }}>Card portfolio configured <span style={{ color: '#86efac' }}>●</span></p>
              <div className={styles.sv} style={{ margin: '8px 0', color: '#fff' }}>7 cards managed</div>
              <p style={{ margin: '0', fontSize: 12, color: 'rgba(255,255,255,.78)' }}>2 physical debit, 3 virtual debit, 1 virtual credit and 1 prepaid card — all preferences and alerts centralised here.</p>
              <div className="mt-3">
                <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('defaultCardsModal')}>Defaults</button>
                <button className={`${styles.btnPm} ${styles.btnSm} ms-2`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('cardNamingModal')}>Organise</button>
                <button className={`${styles.btnPm} ${styles.btnSm} ms-2`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} onClick={() => setActiveModal('notifSettingsModal')}>Alerts</button>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-4 col-6">
            <div className={styles.card} style={{ minHeight: 170 }}>
              <p className={styles.sl} style={{ color: 'var(--pm-accent)' }}>SECURITY SCORE</p>
              <div className={styles.sv} style={{ margin: '6px 0' }}>91<span style={{ fontSize: 14, color: 'var(--pm-muted)', fontWeight: 400 }}>/100</span></div>
              <span className={`${styles.badge} ${styles.badgeS}`}><i className="bi bi-shield-check" /> Excellent</span>
              <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>3D Secure on all cards<br />PIN updated 14 days ago</div>
            </div>
          </div>
          <div className="col-lg-3 col-md-4 col-6">
            <div className={styles.card} style={{ minHeight: 170 }}>
              <p className={styles.sl} style={{ color: 'var(--pm-info)' }}>OPEN CASES</p>
              <div className={styles.sv} style={{ margin: '6px 0' }}>2</div>
              <span className={`${styles.badge} ${styles.badgeW}`}><i className="bi bi-clock" /> 1 awaiting response</span>
              <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>Dispute #CDP-44892<br />PIN reset #PR-11228</div>
            </div>
          </div>
          <div className="col-lg-2 col-md-4">
            <div className={styles.card} style={{ minHeight: 170, borderLeft: '3px solid var(--pm-warning)' }}>
              <p className={styles.sl} style={{ color: 'var(--pm-warning)' }}>NEEDS ACTION</p>
              <div className={styles.sv} style={{ margin: '6px 0' }}>3</div>
              <span className={`${styles.badge} ${styles.badgeD}`}><i className="bi bi-exclamation-triangle" /> Review below</span>
              <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>1 expiring, 1 frozen, 1 PIN change due</div>
            </div>
          </div>
        </div>

        {/* CARD PREFERENCES & ALERTS SECTIONS - FULL WIDTH */}
        <div className="row g-3 mb-4">
          <div className="col-lg-4">
            <div className={styles.card}>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
                <div>
                  <h3 className={styles.st}><i className="bi bi-gear-fill" style={{ color: 'var(--pm-primary)' }} /> {config.sections.preferences.title}</h3>
                  <p className={styles.ss}>{config.sections.preferences.sub}</p>
                </div>
                <div className="d-flex" style={{ gap: 8 }}>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('defaultCardsModal')}><i className="bi bi-check2-circle" /> Defaults</button>
                  <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('cardNamingModal')}><i className="bi bi-pencil" /> Organise</button>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-lg-5">
                  <div className={styles.ub}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Default Card Assignments</h4>
                    {config.sections.preferences.cards.map((c) => (
                      <div key={c.last4} className={styles.sr}>
                        <div>
                          <strong>{c.type === 'Virtual Credit' ? 'Online Payments' : c.type === 'Prepaid' ? 'ATM Withdrawals' : c.type}</strong>
                          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{c.type} ****{c.last4}</div>
                        </div>
                        <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('defaultCardsModal')}>
                          <i className="bi bi-arrow-repeat" /> Change
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className={styles.ub}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Card Portfolio</h4>
                    <div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
                      {config.sections.preferences.cards.map((c) => (
                        <div key={c.last4} className={styles.sr} style={{ padding: '6px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: 4, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10 }}><i className={`bi ${c.icon}`} /></div>
                            <div><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>{c.type} ****{c.last4}</div></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className={styles.ub}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Visual Preview</h4>
                    <div className={styles.cardWidget} style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
                      <div className={styles.cwLogo}>PAYMO VISA</div>
                      <div className={styles.cwNumber}>•••• •••• •••• 4521</div>
                      <div className={styles.cwRow}>
                        <div><div className={styles.cwLabel}>Cardholder</div>AMINA KAMAU</div>
                        <div><div className={styles.cwLabel}>Expires</div>07/25</div>
                        <div><div className={styles.cwLabel}>Type</div>Debit</div>
                      </div>
                    </div>
                    <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('revealPanModal')}><i className="bi bi-eye" /> Reveal</button>
                      <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('cardControlsModal')}><i className="bi bi-sliders" /> Controls</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className={styles.card}>
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
                <div>
                  <h3 className={styles.st}><i className="bi bi-bell-fill" style={{ color: 'var(--pm-warning)' }} /> {config.sections.alerts.title}</h3>
                  <p className={styles.ss}>{config.sections.alerts.sub}</p>
                </div>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('notifSettingsModal')}><i className="bi bi-sliders" /> Configure All</button>
              </div>
              <div className="row g-3">
                <div className="col-lg-6">
                  <div className={styles.ub}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Transaction Alerts</h4>
                    {config.sections.alerts.alerts.map((a) => (
                      <div key={a.type} className={styles.sr}>
                        <div>
                          <strong>{a.type}</strong>
                          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{a.sub}</div>
                        </div>
                        {a.value ? (
                          <div className="d-flex align-items-center gap-2">
                            <input className={styles.fc} style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }} value={a.value} />
                            <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                          </div>
                        ) : (
                          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className={styles.ub}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px' }}>Security & Billing Alerts</h4>
                    <div className={styles.sr}>
                      <div><strong>New device login</strong></div>
                      <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                    </div>
                    <div className={styles.sr}>
                      <div><strong>PIN / password change</strong></div>
                      <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                    </div>
                    <div className={styles.sr}>
                      <div><strong>Card freeze / unfreeze</strong></div>
                      <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                    </div>
                    <div className={styles.sr}>
                      <div><strong>Statement ready</strong></div>
                      <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                    </div>
                    <div className={styles.sr}>
                      <div><strong>Payment due reminder</strong></div>
                      <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                    </div>
                    <div className={styles.sr}>
                      <div><strong>Expiry reminders</strong></div>
                      <div className="d-flex align-items-center gap-2">
                        <select className={styles.fc} style={{ width: 'auto' }}>
                          <option>90, 60, 30, 7 days</option>
                          <option>60, 30, 7 days</option>
                          <option>30, 7 days</option>
                        </select>
                        <div className="form-check form-switch"><input className="form-check-input" type="checkbox" defaultChecked /></div>
                      </div>
                    </div>
                    <hr className={styles.divider} />
                    <h5 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px' }}>Delivery Channels</h5>
                    <div className="d-flex flex-wrap" style={{ gap: 8 }}>
                      <div className="form-check form-check-inline"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 12 }}>Push</label></div>
                      <div className="form-check form-check-inline"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 12 }}>SMS</label></div>
                      <div className="form-check form-check-inline"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 12 }}>Email</label></div>
                      <div className="form-check form-check-inline"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 12 }}>WhatsApp</label></div>
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

      <AccountSettingsModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} config={config} />
    </div>
  )
}