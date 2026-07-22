import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import styles from '../styles/virtual-credit-cards.module.css'
import VirtualCreditCardsModals from '../components/VirtualCreditCardsModals'

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface VirtualCard {
  alias: string
  number: string
  type: 'Multi-Use' | 'Subscription' | 'Single-Use'
  bg: string
  brand: 'VISA' | 'Mastercard'
  limit: string
  spent: string
  exp: string
}

interface Subscription {
  merchant: string
  card: string
  amount: string
  date: string
}

interface Transaction {
  date: string
  merchant: string
  card: string
  amount: string
  status: 'Success' | 'Pending' | 'Declined'
}

interface VirtualCreditCardsConfig {
  pageTitle: string
  pageSub: string
  creditLimit: string
  outstandingBalance: string
  dueDate: string
  activeCards: VirtualCard[]
  subscriptions: Subscription[]
  transactions: Transaction[]
}

const initialMockData: VirtualCreditCardsConfig = {
  pageTitle: 'Virtual Credit Card Center',
  pageSub: 'Create instant virtual cards for secure online purchases. Allocate credit limits, set expiry rules, and isolate subscription billing.',
  creditLimit: 'KES 150,000',
  outstandingBalance: 'KES 42,300',
  dueDate: '12 Jul 2025',
  activeCards: [
    { alias: 'AWS Hosting', number: '**** 9173', type: 'Subscription', bg: 'var(--pm-gradient-hero)', brand: 'VISA', limit: '20,000', spent: '2,400', exp: '06/25' },
    { alias: 'Marketing Ads', number: '**** 7720', type: 'Multi-Use', bg: 'var(--pm-gradient-blue)', brand: 'Mastercard', limit: '50,000', spent: '15,400', exp: '11/26' },
    { alias: 'Software Subs', number: '**** 1104', type: 'Multi-Use', bg: 'var(--pm-gradient-slate)', brand: 'VISA', limit: '15,000', spent: '3,600', exp: '01/27' },
    { alias: 'Travel Exp', number: '**** 4409', type: 'Multi-Use', bg: 'var(--pm-gradient-warm)', brand: 'Mastercard', limit: '23,000', spent: '850', exp: '08/26' }
  ],
  subscriptions: [
    { merchant: 'AWS Cloud', card: 'AWS Hosting', amount: 'KES 2,400', date: '15th' },
    { merchant: 'Netflix', card: 'Software Subs', amount: 'KES 1,200', date: '20th' },
    { merchant: 'Spotify', card: 'Software Subs', amount: 'KES 300', date: '1st' },
    { merchant: 'Facebook Ads', card: 'Marketing Ads', amount: 'KES ~15k', date: 'Weekly' },
    { merchant: 'Google Workspace', card: 'Software Subs', amount: 'KES 2,100', date: '25th' }
  ],
  transactions: [
    { date: '27 Jun', merchant: 'Facebook Ads', card: 'Marketing Ads', amount: 'KES 12,400', status: 'Success' },
    { date: '25 Jun', merchant: 'Google Wksp', card: 'Software Subs', amount: 'KES 2,100', status: 'Success' },
    { date: '22 Jun', merchant: 'AWS EMEA', card: 'AWS Hosting', amount: 'KES 2,400', status: 'Success' },
    { date: '18 Jun', merchant: 'Uber *Trip', card: 'Travel Exp', amount: 'KES 850', status: 'Pending' },
    { date: '15 Jun', merchant: 'Netflix', card: 'Software Subs', amount: 'KES 1,200', status: 'Success' },
    { date: '10 Jun', merchant: 'LinkedIn Ads', card: 'Marketing Ads', amount: 'KES 3,000', status: 'Declined' }
  ]
}

async function fetchVirtualCreditCards(): Promise<VirtualCreditCardsConfig> {
  // Frontend-only demo: no backend for this endpoint yet. Fall back to bundled
  // mock data on any failure so SSR doesn't throw on the origin-less relative
  // fetch and the page renders content instead of only an error banner.
  try {
    const res = await fetch('/api/virtual-credit-cards', { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return (await res.json()) as VirtualCreditCardsConfig
  } catch {
    return initialMockData
  }
}

export default function VirtualCreditCards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymo-virtual-credit-cards'],
    queryFn: fetchVirtualCreditCards,
    retry: 1,
    staleTime: 60_000
  })
  const config = data ?? initialMockData

  const [errorDismissed, setErrorDismissed] = useState(false)
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const getUtilization = (spent: string, limit: string): number => {
    const s = parseInt(spent.replace(/,/g, ''), 10)
    const l = parseInt(limit.replace(/,/g, ''), 10)
    return Math.round((s / l) * 100)
  }

  return (
    <div className={styles.virtualCreditCards}>
      <div className={styles.main}>
        {isLoading && (
          <div className="d-flex justify-content-center align-items-center" style={{ padding: 60 }}>
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          </div>
        )}

        {error && !errorDismissed && (
          <div className="alert alert-danger m-3 d-flex align-items-center justify-content-between" role="alert">
            <span><i className="bi bi-exclamation-triangle me-2" />Failed to load card data. Showing cached data.</span>
            <button className="btn-close" onClick={() => setErrorDismissed(true)} />
          </div>
        )}

        {/* PAGE BAR */}
        <div className={styles.pageBar}>
          <div>
            <div className={styles.breadcrumb}>
              <Link to="/">Home</Link> / <Link to="/cards">Card Center</Link> / <Link to="/cards/virtual">Virtual Cards</Link> / <strong>Management</strong>
            </div>
            <h2 className={styles.pageH2}>PAGE 5.4 — Virtual Credit Card Center</h2>
            <p className={styles.pageSub}>Create instant virtual cards for secure online purchases. Allocate credit limits, set expiry rules, and isolate subscription billing.</p>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <button className={styles.btnPm} onClick={() => setActiveModal('cardSecurityModal')}><i className="bi bi-shield-lock" /> Security Check</button>
            <button className={styles.btnPm} onClick={() => setActiveModal('payCreditBillModal')}><i className="bi bi-cash-stack" /> Pay Balance</button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => setActiveModal('createCardModal')}><i className="bi bi-plus-lg" /> Create Virtual Card</button>
          </div>
        </div>

        <div className={styles.content}>
          <div className="row g-3">
            <div className="col-lg-4">
              <div className={`${styles.card} ${styles.cardAccent}`} style={{ minHeight: 170 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>
                  Virtual credit limit active <span style={{ color: '#86efac' }}>●</span>
                </p>
                <div className={styles.statValue} style={{ margin: '8px 0', color: '#fff' }}>KES 150,000</div>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>Total credit limit shared across your active virtual cards.</p>
                <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }}
                    onClick={() => setActiveModal('limitAllocationModal')}>Allocate Limit</button>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }}
                    onClick={() => setActiveModal('payCreditBillModal')}>Repay balance</button>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }}
                    onClick={() => setActiveModal('limitIncreaseModal')}>Request Increase</button>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-4 col-6">
              <div className={styles.card} style={{ minHeight: 170 }}>
                <p className={styles.statLabel} style={{ color: 'var(--pm-warning)' }}>OUTSTANDING BALANCE</p>
                <div className={styles.statValue} style={{ margin: '6px 0' }}>{config.outstandingBalance}</div>
                <span className={`${styles.badge} ${styles.badgeW}`}><i className="bi bi-calendar" /> Due in 12 days</span>
                <div className="pm-mini-bars mt-3">
                  <div className={styles.miniBars}>
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className={styles.miniBar} style={{
                        height: i === 0 ? '35%' : i === 1 ? '20%' : i === 2 ? '52%' : i === 3 ? '25%' : i === 4 ? '88%' : '10%',
                        background: i === 0 || i === 4 ? 'var(--pm-warning)' : i === 2 ? 'var(--pm-accent)' : 'var(--pm-info)'
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-4 col-6">
              <div className={styles.card} style={{ minHeight: 170 }}>
                <p className={styles.statLabel} style={{ color: 'var(--pm-info)' }}>ACTIVE V-CARDS</p>
                <div className={styles.statValue} style={{ margin: '6px 0' }}>4 Cards</div>
                <span className={`${styles.badge} ${styles.badgeS}`}><i className="bi bi-shield-check" /> 100% Tokenized</span>
                <div className="mt-2">
                  <div className="d-flex justify-content-between" style={{ fontSize: 11, color: 'var(--pm-muted)' }}>
                    <span>Limit Utilization</span><span>28%</span>
                  </div>
                  <div className={styles.progress} mt-1>
                    <div className={styles.progressBar} style={{ width: '28%', background: 'var(--pm-info)' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-4">
              <div className={styles.card} style={{ minHeight: 170, borderLeft: '3px solid var(--pm-accent)' }}>
                <p className={styles.statLabel} style={{ color: 'var(--pm-accent)' }}>ACTIVE SUBSCRIPTIONS</p>
                <div className={styles.statValue} style={{ margin: '6px 0' }}>
                  KES 8,450<span style={{ fontSize: 14, color: 'var(--pm-muted)' }}>/mo</span>
                </div>
                <span className={`${styles.badge} ${styles.badgeS}`}><i className="bi bi-arrow-repeat" /> 7 active merchants</span>
                <div className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
                  <div>Highest: <strong>AWS Cloud (KES 2,400)</strong></div>
                  <div>Upcoming: <strong>Netflix (KES 1,200)</strong></div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.sectionTitle}>Attention Required</h3>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('attentionModal')}>View all</button>
                </div>
                <div className={styles.feedItem}>
                  <div className={styles.iconCircle} style={{ background: 'var(--pm-danger-soft)', color: 'var(--pm-danger)', fontSize: 12 }}>
                    CV
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Single-use card compromised</div>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Blocked attempt at unauthorized merchant</div>
                  </div>
                  <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmD}`} onClick={() => setActiveModal('fraudAlertModal')}>Review</button>
                </div>
                <div className={styles.feedItem}>
                  <div className={styles.iconCircle} style={{ background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)', fontSize: 12 }}>
                    BL
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Approaching card limit</div>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>&apos;Marketing Ads&apos; card at 92% of limit</div>
                  </div>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('limitAllocationModal')}>Adjust</button>
                </div>
                <div className={styles.feedItem}>
                  <div className={styles.iconCircle} style={{ background: 'var(--pm-purple-soft)', color: 'var(--pm-purple)', fontSize: 12 }}>
                    EX
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Virtual card expiring soon</div>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>&apos;AWS Hosting&apos; card expires in 5 days</div>
                  </div>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('cardExpiryModal')}>Renew</button>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className={styles.sectionTitle}>Smart Suggestions</h3>
                  <span className={`${styles.badge} ${styles.badgeP}`}><i className="bi bi-stars" /> AI</span>
                </div>
                <div className={styles.feedItem}>
                  <div className={styles.iconCircle} style={{ background: 'var(--pm-accent-soft)', color: 'var(--pm-accent)', fontSize: 12 }}>
                    AP
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Set up auto-pay for credit balance</div>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Avoid late fees of KES 500</div>
                  </div>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('autoPayModal')}>Setup</button>
                </div>
                <div className={styles.feedItem}>
                  <div className={styles.iconCircle} style={{ background: 'var(--pm-info-soft)', color: 'var(--pm-info)', fontSize: 12 }}>
                    SB
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Isolate online subscriptions</div>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Move Netflix & Spotify to a dedicated card</div>
                  </div>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('createCardModal')}>Create</button>
                </div>
                <div className={styles.feedItem}>
                  <div className={styles.iconCircle} style={{ background: 'var(--pm-warning-soft)', color: 'var(--pm-warning)', fontSize: 12 }}>
                    ZP
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Unused subscriptions detected</div>
                    <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>&apos;Adobe CC&apos; hasn&apos;t been accessed in 3 months</div>
                  </div>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('subscriptionManageModal')}>Review</button>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="mb-3">
                  <h3 className={styles.sectionTitle}>Quick Actions</h3>
                  <p className={styles.sectionSub}>Frequent card and credit operations</p>
                </div>
                <div className={styles.quickGrid}>
                  <button className={styles.quickBtn} onClick={() => setActiveModal('createCardModal')}>
                    <i className="bi bi-plus-circle text-primary me-1" /> New V-Card
                  </button>
                  <button className={styles.quickBtn} onClick={() => setActiveModal('payCreditBillModal')}>
                    <i className="bi bi-cash-stack text-success me-1" /> Pay Balance
                  </button>
                  <button className={styles.quickBtn} onClick={() => setActiveModal('limitAllocationModal')}>
                    <i className="bi bi-sliders text-warning me-1" /> Adjust Limits
                  </button>
                  <button className={styles.quickBtn} onClick={() => setActiveModal('freezeCardModal')}>
                    <i className="bi bi-snow text-info me-1" /> Freeze Card
                  </button>
                  <button className={styles.quickBtn} onClick={() => setActiveModal('subscriptionManageModal')}>
                    <i className="bi bi-arrow-repeat me-1" style={{ color: 'var(--pm-purple)' }} /> Subscriptions
                  </button>
                  <button className={styles.quickBtn} onClick={() => setActiveModal('generateCVVModal')}>
                    <i className="bi bi-arrow-clockwise text-danger me-1" /> Rotate CVV
                  </button>
                  <button className={styles.quickBtn} onClick={() => setActiveModal('transactionHistoryModal')}>
                    <i className="bi bi-list-columns me-1" style={{ color: 'var(--pm-primary)' }} /> Statements
                  </button>
                  <button className={styles.quickBtn} onClick={() => setActiveModal('disputeTransactionModal')}>
                    <i className="bi bi-shield-exclamation me-1" style={{ color: 'var(--pm-accent)' }} /> Dispute
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-credit-card-2-front" style={{ color: 'var(--pm-primary)' }} /> 5.4.1 — Virtual Card Issuance & Lifecycle</h3>
                <p className={styles.sectionSub}>Manage your active virtual cards, reveal details, rotate CVVs, or generate single-use cards for secure checkouts.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('deletedCardsModal')}><i className="bi bi-trash" /> Trash</button>
                <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('createCardModal')}><i className="bi bi-plus-lg" /> Create Card</button>
              </div>
            </div>
            <div className={styles.vcardGrid}>
              {config.activeCards.map((card) => (
                <div key={card.alias} className={styles.vcardWrapper}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className={styles.vcardBrand}>{card.alias}
                      <span className={`${styles.badge} ${styles.badgeS} ms-2`} style={{ fontSize: 11 }}>{card.type}</span>
                    </div>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('manageCardModal')}>
                      <i className="bi bi-gear" />
                    </button>
                  </div>
                  <div className={styles.creditCardUi} style={{ background: card.bg }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className={styles.vcardBrand}>PayMo</div>
                      {card.brand === 'VISA' ? (
                        <div className={styles.vcardVisa}>VISA</div>
                      ) : (
                        <div className={styles.vcardMastercard}>
                          <div className={styles.circle1} />
                          <div className={styles.circle2} />
                        </div>
                      )}
                    </div>
                    <div className={styles.vcardChip} />
                    <div className={styles.vcardNumber}>{card.number}</div>
                    <div className={styles.vcardBottom}>
                      <div>
                        <div className={styles.vcardLabel}>Valid Thru</div>
                        <div className={styles.vcardValue}>{card.exp}</div>
                      </div>
                      <div>
                        <button className={`${styles.btnPm} ${styles.btnSm}`} style={{ background: 'rgba(255,255,255,.2)', color: '#fff', border: 'none' }}
                          onClick={() => setActiveModal('revealCardModal')}>
                          <i className="bi bi-eye" /> Show
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12, color: 'var(--pm-muted)' }}>
                    <span>Spend</span><span>Limit: KES {card.limit}</span>
                  </div>
                  <div className={styles.progress}>
                    <div className={styles.progressBarFill} style={{ width: `${getUtilization(card.spent, card.limit)}%`, background: 'var(--pm-primary)' }} />
                  </div>
                  <div className="d-flex justify-content-between" style={{ gap: 4 }}>
                    <button className={`${styles.btnPm} ${styles.btnSm} w-100`} onClick={() => setActiveModal('freezeCardModal')}>
                      <i className="bi bi-snow" /> Freeze
                    </button>
                    <button className={`${styles.btnPm} ${styles.btnSm} w-100`} onClick={() => setActiveModal('generateCVVModal')}>
                      <i className="bi bi-arrow-clockwise" /> CVV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="row g-3">
            <div className="col-lg-8">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
                  <div>
                    <h3 className={styles.sectionTitle}><i className="bi bi-graph-up-arrow" style={{ color: 'var(--pm-accent)' }} /> 5.4.2 — Credit Limit & Repayment Desk</h3>
                    <p className={styles.sectionSub}>Monitor your credit line utilization, distribute limits among cards, and execute repayments.</p>
                  </div>
                  <div className="d-flex" style={{ gap: 8 }}>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('autoPayModal')}><i className="bi bi-arrow-repeat" /> Auto-Pay</button>
                    <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP}`} onClick={() => setActiveModal('payCreditBillModal')}><i className="bi bi-cash-stack" /> Repay Balance</button>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-lg-8">
                    <div className={styles.ub}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, marginBottom: '12px' }}>Limit Allocation by Card</h4>
                      <div className="table-responsive">
                        <table className={styles.tbl}>
                          <thead>
                            <tr>
                              <th>Card Alias</th>
                              <th>Current Limit</th>
                              <th>New Limit (KES)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {config.activeCards.map((card) => (
                              <tr key={card.alias}>
                                <td><strong>{card.alias}</strong></td>
                                <td>{card.limit}</td>
                                <td>
                                  <input type="number" className={styles.formControl} style={{ padding: '4px 8px', height: 'auto' }}
                                    defaultValue={parseInt(card.limit.replace(/,/g, ''), 10)} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 12 }}>
                        Total allocated cannot exceed KES 150,000. Changes apply instantly.
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className={styles.ub} mb-3>
                      <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Current Statement</h4>
                      <div className={styles.statusRow}>
                        <div><strong>Previous Balance</strong></div>
                        <strong>KES 0</strong>
                      </div>
                      <div className={styles.statusRow}>
                        <div><strong>Purchases & Advances</strong></div>
                        <strong>{config.outstandingBalance}</strong>
                      </div>
                      <div className={styles.statusRow}>
                        <div><strong>Interest & Fees</strong></div>
                        <strong>KES 0</strong>
                      </div>
                      <div className={styles.statusRow}>
                        <div><strong>Payments & Credits</strong></div>
                        <strong>KES 0</strong>
                      </div>
                      <div className={styles.statusRow}>
                        <div><strong>Total Amount Due</strong></div>
                        <strong style={{ color: 'var(--pm-danger)' }}>KES 42,300</strong>
                      </div>
                      <div className={styles.statusRow}>
                        <div><strong>Minimum Payment</strong></div>
                        <strong>KES 4,230</strong>
                      </div>
                      <div className="d-flex mt-3" style={{ gap: 8 }}>
                        <button className={`${styles.btnPm} ${styles.btnSm} ${styles.btnPmP} w-100`} onClick={() => setActiveModal('payCreditBillModal')}>
                          Pay Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Recent Card Transactions</h4>
                  <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('transactionHistoryModal')}>View All</button>
                </div>
                <div className="table-responsive">
                  <table className={styles.tbl}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Merchant</th>
                        <th>Card</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config.transactions.map((tx, i) => (
                        <tr key={i}>
                          <td>{tx.date}</td>
                          <td>{tx.merchant}</td>
                          <td><span style={{ fontSize: 12, color: 'var(--pm-muted)' }}>{tx.card}</span></td>
                          <td><strong>{tx.amount}</strong></td>
                          <td>
                            <span className={`${styles.badge} ${tx.status === 'Success' ? styles.badgeS : tx.status === 'Pending' ? styles.badgeW : styles.badgeD}`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className={styles.sectionTitle}><i className="bi bi-shop" style={{ color: 'var(--pm-purple)' }} /> 5.4.3 — Subscription & Merchant Management</h3>
                <p className={styles.sectionSub}>Identify recurring charges, monitor merchant locks, and cancel unwanted subscriptions with one click.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('merchantAnalyticsModal')}><i className="bi bi-pie-chart" /> Analytics</button>
                <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('subscriptionManageModal')}><i className="bi bi-list-check" /> Manage All</button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0', marginBottom: '12px' }}>Active Subscriptions Detected</h4>
                  <div>
                    {config.subscriptions.map((sub, i) => (
                      <div key={i} className={styles.statusRow}>
                        <div><strong>{sub.merchant}</strong>
                          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Card: {sub.card}</div>
                        </div>
                        <div className="text-end">
                          <strong>{sub.amount}</strong>
                          <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Due: {sub.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className={styles.ub}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Recent Card Transactions</h4>
                    <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => setActiveModal('transactionHistoryModal')}>View All</button>
                  </div>
                  <div className="table-responsive">
                    <table className={styles.tbl}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Merchant</th>
                          <th>Card</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {config.transactions.slice(0, 4).map((tx, i) => (
                          <tr key={i}>
                            <td data-label="Date">{tx.date}</td>
                            <td data-label="Merchant">{tx.merchant}</td>
                            <td data-label="Card"><span style={{ fontSize: 12, color: 'var(--pm-muted)' }}>{tx.card}</span></td>
                            <td data-label="Amount"><strong>{tx.amount}</strong></td>
                            <td data-label="Status">
                              <span className={`${styles.badge} ${tx.status === 'Success' ? styles.badgeS : tx.status === 'Pending' ? styles.badgeW : styles.badgeD}`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <VirtualCreditCardsModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
      </div>
    </div>
  )
}