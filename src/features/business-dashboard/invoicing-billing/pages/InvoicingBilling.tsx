import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from '../styles/invoicing-billing.module.css'
import InvoicingBillingModals from '../components/InvoicingBillingModals'

/* ============================================================================
   PayMo BaaS — Invoicing & Billing (legacy page 3.3)
   React + TypeScript + TanStack Query, cream + indigo dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

interface NavItem { icon: string; title: string; active?: boolean; dot?: boolean }
interface HeroStat { key: string; col: string; label: string; labelColor?: string; value: string; badge?: { icon: string; text: string; tone: BadgeTone }; agingBar?: { segments: { width: string; color: string; label: string }[] }; miniBars?: { height: string; color: string }[]; progress?: { percent: number; color: string }; extra?: { label: string; value: string }[] }
interface FeedItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; btnLabel: string; btnClass?: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface InvoiceRow { id: string; customer: string; amount: string; dueDate: string; status: string; statusTone: BadgeTone; modal: string }
interface LinkCard { key: string; name: string; amount: string; views: number; conversions: number; status: string; statusTone: BadgeTone; modal: string }
interface AgingBlock { range: string; amount: string; color: string; bgColor: string; textColor: string }
interface PlanCard { key: string; name: string; price: string; subscribers: number; mrr: string; badge: { text: string; tone: BadgeTone }; modal: string }
interface SubscriberRow { name: string; plan: string; amount: string; nextBill: string; status: string; statusTone: BadgeTone; modal: string }
interface User { initials: string; name: string; role: string; avatarBg: string }

interface InvoicingConfig {
  nav: NavItem[]
  headerTitle: string
  headerSub: string
  searchPlaceholder: string
  user: User
  breadcrumb: { parent: string; current: string }
  pageTitle: string
  pageSub: string
  heroStats: HeroStat[]
  attentionItems: FeedItem[]
  suggestions: FeedItem[]
  quickActions: QuickAction[]
  invoices: InvoiceRow[]
  linkCards: LinkCard[]
  agingBlocks: AgingBlock[]
  planCards: PlanCard[]
  subscriberRows: SubscriberRow[]
}

/* ---------- typed mock data (fallback + initial render) ---------- */
const initialMockData: InvoicingConfig = {
  nav: [
    { icon: 'bi-house', title: 'Business Home' },
    { icon: 'bi-shop', title: 'Collections' },
    { icon: 'bi-receipt', title: 'Invoicing', active: true, dot: true },
    { icon: 'bi-people', title: 'Payroll' },
    { icon: 'bi-send', title: 'Disbursements' },
    { icon: 'bi-gear', title: 'Business Settings' },
  ],
  headerTitle: 'Apex Retail Ltd',
  headerSub: 'KRA PIN: P051***49G',
  searchPlaceholder: 'Search invoices, links, subscriptions, customers...',
  user: { initials: 'AP', name: 'Sarah A.', role: 'Finance Admin', avatarBg: 'linear-gradient(135deg, #DDD6FE 0%, #A78BFA 100%)' },
  breadcrumb: { parent: 'Business Portal', current: 'Invoicing & Billing' },
  pageTitle: 'PAGE 3.3 — Invoicing & Billing',
  pageSub: 'Manage invoices, payment links, collections tracking, and recurring subscriptions.',
  heroStats: [
    { key: 'outstanding', col: 'col-lg-3 col-md-6', label: 'TOTAL OUTSTANDING', value: 'KES 482,500', agingBar: { segments: [{ width: '55%', color: 'var(--pm-accent)', label: '0-30' }, { width: '24%', color: 'var(--pm-warning)', label: '31-60' }, { width: '21%', color: 'var(--pm-danger)', label: '61+' }] }, badge: { icon: 'bi-clock', text: 'Aging tracked', tone: 'badgeI' } },
    { key: 'monthly', col: 'col-lg-3 col-md-6', label: 'MONTHLY INVOICED', value: 'KES 1.2M', badge: { icon: 'bi-graph-up-arrow', text: '82% collection rate', tone: 'badgeS' }, extra: [{ label: 'Paid', value: 'KES 984K' }, { label: 'Pending', value: 'KES 216K' }] },
    { key: 'mrr', col: 'col-lg-3 col-md-6', label: 'MRR (SUBSCRIPTIONS)', value: 'KES 345,000', badge: { icon: 'bi-people', text: '124 Active Subs', tone: 'badgeP' } },
    { key: 'dso', col: 'col-lg-3 col-md-6', label: 'DSO', value: '28 Days', badge: { icon: 'bi-check-circle', text: 'Healthy', tone: 'badgeS' }, miniBars: [{ height: '40%', color: 'var(--pm-accent)' }, { height: '65%', color: 'var(--pm-primary)' }, { height: '55%', color: 'var(--pm-accent)' }, { height: '80%', color: 'var(--pm-primary)' }, { height: '45%', color: 'var(--pm-warning)' }] },
  ],
  attentionItems: [
    { icon: 'bi-exclamation-triangle', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: 'Overdue Invoice: INV-2025-042', sub: 'Global Exporters · KES 145,000 · 14 days overdue', btnLabel: 'Send Reminder', btnClass: 'btnPmD', modal: 'recordPaymentModal' },
    { icon: 'bi-credit-card', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Subscription Payment Failed', sub: 'Coast Logistics · KES 25,000/month · M-Pesa timeout', btnLabel: 'Retry', modal: 'subscriptionDetailModal' },
    { icon: 'bi-link-45deg', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'High-Value Link Abandoned', sub: 'KES 340,000 link viewed 3x but not paid', btnLabel: 'Resend', modal: 'linkAnalyticsModal' },
  ],
  suggestions: [
    { icon: 'bi-envelope', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'Enable Auto-Reminders', sub: '2 invoices due this week · Reduce DSO by 5 days', btnLabel: 'Setup', modal: 'reminderSettingsModal' },
    { icon: 'bi-percent', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: 'Offer Early Payment Discount', sub: '2% discount for 5-day payment could improve collections 15%', btnLabel: 'Configure', modal: 'invoiceDetailModal' },
    { icon: 'bi-shield-check', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Update Withholding Tax Settings', sub: 'New KRA WHT API integration available', btnLabel: 'Update', modal: 'taxSettingsModal' },
  ],
  quickActions: [
    { icon: 'bi-plus-circle', iconColor: 'var(--pm-primary)', label: 'New Invoice', modal: 'newInvoiceModal' },
    { icon: 'bi-link-45deg', iconColor: 'var(--pm-info)', label: 'Payment Link', modal: 'newPaymentLinkModal' },
    { icon: 'bi-arrow-repeat', iconColor: 'var(--pm-purple)', label: 'Subscription', modal: 'newSubscriptionModal' },
    { icon: 'bi-file-earmark-minus', iconColor: 'var(--pm-danger)', label: 'Credit Note', modal: 'creditNoteModal' },
    { icon: 'bi-cash-coin', iconColor: 'var(--pm-accent)', label: 'Record Pay', modal: 'recordPaymentModal' },
    { icon: 'bi-bell', iconColor: 'var(--pm-warning)', label: 'Reminders', modal: 'reminderSettingsModal' },
    { icon: 'bi-person-lines-fill', iconColor: 'var(--pm-muted)', label: 'Customers', modal: 'customerSelectModal' },
    { icon: 'bi-file-earmark-text', iconColor: 'var(--pm-primary)', label: 'Templates', modal: 'invoiceTemplatesModal' },
  ],
  invoices: [
    { id: 'INV-2025-042', customer: 'Global Exporters', amount: 'KES 145,000', dueDate: '15 Jun 2025', status: 'Overdue', statusTone: 'badgeD', modal: 'invoiceDetailModal' },
    { id: 'INV-2025-041', customer: 'Coast Logistics', amount: 'KES 140,000', dueDate: '28 Jun 2025', status: 'Paid', statusTone: 'badgeS', modal: 'invoiceDetailModal' },
    { id: 'INV-2025-040', customer: 'Nairobi Distributors', amount: 'KES 98,500', dueDate: '30 Jun 2025', status: 'Pending', statusTone: 'badgeW', modal: 'invoiceDetailModal' },
    { id: 'INV-2025-039', customer: 'Mombasa Traders', amount: 'KES 75,000', dueDate: '5 Jul 2025', status: 'Draft', statusTone: 'badgeI', modal: 'invoiceDetailModal' },
    { id: 'INV-2025-038', customer: ' Rift Valley Co.', amount: 'KES 24,000', dueDate: '10 Jul 2025', status: 'Sent', statusTone: 'badgeP', modal: 'invoiceDetailModal' },
  ],
  linkCards: [
    { key: 'link1', name: 'Global Exporters — USD Invoice', amount: 'USD 1,200', views: 12, conversions: 0, status: 'Viewed', statusTone: 'badgeI', modal: 'linkAnalyticsModal' },
    { key: 'link2', name: 'Coast Logistics — KES 140K', amount: 'KES 140,000', views: 8, conversions: 1, status: 'Paid', statusTone: 'badgeS', modal: 'linkAnalyticsModal' },
    { key: 'link3', name: 'Nairobi Distributors', amount: 'KES 98,500', views: 5, conversions: 0, status: 'Active', statusTone: 'badgeP', modal: 'linkAnalyticsModal' },
  ],
  agingBlocks: [
    { range: '0-30 Days', amount: 'KES 265K', color: '#047857', bgColor: 'var(--pm-accent-soft)', textColor: '#065F46' },
    { range: '31-60 Days', amount: 'KES 117K', color: '#B45309', bgColor: 'var(--pm-warning-soft)', textColor: '#92400E' },
    { range: '61-90+ Days', amount: 'KES 100K', color: '#DC2626', bgColor: 'var(--pm-danger-soft)', textColor: '#991B1B' },
  ],
  planCards: [
    { key: 'basic', name: 'Basic Plan', price: 'KES 2,500/mo', subscribers: 68, mrr: 'KES 170,000', badge: { text: 'Active', tone: 'badgeS' }, modal: 'subscriptionDetailModal' },
    { key: 'pro', name: 'Pro Plan', price: 'KES 5,000/mo', subscribers: 42, mrr: 'KES 210,000', badge: { text: 'Active', tone: 'badgeP' }, modal: 'subscriptionDetailModal' },
    { key: 'enterprise', name: 'Enterprise Plan', price: 'KES 12,500/mo', subscribers: 14, mrr: 'KES 175,000', badge: { text: 'Premium', tone: 'badgeI' }, modal: 'subscriptionDetailModal' },
  ],
  subscriberRows: [
    { name: 'Coast Logistics', plan: 'Pro Plan', amount: 'KES 5,000', nextBill: '1 Jul 2025', status: 'Active', statusTone: 'badgeS', modal: 'subscriptionDetailModal' },
    { name: 'Nairobi Distributors', plan: 'Basic Plan', amount: 'KES 2,500', nextBill: '1 Jul 2025', status: 'Active', statusTone: 'badgeS', modal: 'subscriptionDetailModal' },
    { name: 'Rift Valley Co.', plan: 'Enterprise', amount: 'KES 12,500', nextBill: '1 Jul 2025', status: 'Failed', statusTone: 'badgeD', modal: 'subscriptionDetailModal' },
    { name: 'Mombasa Traders', plan: 'Pro Plan', amount: 'KES 5,000', nextBill: '1 Jul 2025', status: 'Active', statusTone: 'badgeS', modal: 'subscriptionDetailModal' },
  ],
}

/* ---------- TanStack Query fetcher ---------- */
async function fetchInvoicingData(): Promise<InvoicingConfig> {
  const res = await fetch('/api/business-dashboard/invoicing-billing')
  if (!res.ok) throw new Error('Network error')
  return res.json()
}

export default function InvoicingBilling() {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')

  const [activeModal, setActiveModal] = useState<string | null>(null)

  const { data: apiData } = useQuery({
    queryKey: ['invoicing-billing'],
    queryFn: fetchInvoicingData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const config = apiData ?? initialMockData

  return (
    <div className={cx(s.bizPage, 'container-fluid')}>
      {/* CONTENT */}
      <div className={s.content}>
          {/* HERO STATS */}
          <div className="row g-3">
            {config.heroStats.map((hs) => (
              <div key={hs.key} className={hs.col}>
                <div className={cx(s.card, hs.key === 'outstanding' ? s.cardAccent : '')} style={{ cursor: 'pointer' }} onClick={() => setActiveModal(hs.key === 'outstanding' ? 'agingReportModal' : hs.key === 'monthly' ? 'invoiceDetailModal' : hs.key === 'mrr' ? 'subscriptionDetailModal' : 'invoiceDetailModal')}>
                  <div className={s.sl} style={hs.labelColor ? { color: hs.labelColor } : {}}>{hs.label}</div>
                  <div className={s.sv}>{hs.value}</div>
                  {hs.badge && (
                    <span className={cx(s.badge, s[hs.badge.tone])}>
                      <i className={`bi ${hs.badge.icon}`} /> {hs.badge.text}
                    </span>
                  )}
                  {hs.agingBar && (
                    <div className={s.invStatusBar}>
                      {hs.agingBar.segments.map((seg) => (
                        <div key={seg.label} style={{ width: seg.width, background: seg.color }} />
                      ))}
                    </div>
                  )}
                  {hs.miniBars && (
                    <div className={s.miniBars}>
                      {hs.miniBars.map((mb, i) => (
                        <div key={i} className={s.miniBar} style={{ height: mb.height, background: mb.color }} />
                      ))}
                    </div>
                  )}
                  {hs.progress && (
                    <div className={s.progress}>
                      <div className={s.progressBar} style={{ width: `${hs.progress.percent}%`, background: hs.progress.color }} />
                    </div>
                  )}
                  {hs.extra && (
                    <div className="d-flex gap-2 mt-2" style={{ fontSize: 12 }}>
                      {hs.extra.map((e) => (
                        <span key={e.label}><strong>{e.value}</strong> <span style={{ color: 'var(--pm-muted)' }}>{e.label}</span></span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ATTENTION */}
          <div className={s.card}>
            <h3 className={cx(s.st, 'text-danger')}><i className="bi bi-exclamation-triangle" style={{ color: 'var(--pm-danger)' }} /> Attention Required</h3>
            {config.attentionItems.map((ai) => (
              <div key={ai.title} className={s.feedItem}>
                <div className={s.iconCircle} style={{ background: ai.iconBg, color: ai.iconColor }}><i className={`bi ${ai.icon}`} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{ai.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>{ai.sub}</div>
                </div>
                <button className={cx(s.btnPm, s.btnSm, ai.btnClass ? s[ai.btnClass] : '')} onClick={() => setActiveModal(ai.modal)}>{ai.btnLabel}</button>
              </div>
            ))}
          </div>

          {/* SUGGESTIONS */}
          <div className={s.card}>
            <h3 className={cx(s.st, 'text-warning')}><i className="bi bi-stars" style={{ color: 'var(--pm-warning)' }} /> Smart Suggestions</h3>
            {config.suggestions.map((sg) => (
              <div key={sg.title} className={s.feedItem}>
                <div className={s.iconCircle} style={{ background: sg.iconBg, color: sg.iconColor }}><i className={`bi ${sg.icon}`} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{sg.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>{sg.sub}</div>
                </div>
                <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(sg.modal)}>{sg.btnLabel}</button>
              </div>
            ))}
          </div>

          {/* QUICK ACTIONS */}
          <div className={s.card}>
            <h3 className={s.st}><i className="bi bi-grid-3x3-gap" style={{ color: 'var(--pm-primary)' }} /> Quick Actions</h3>
            <div className={s.quickGrid}>
              {config.quickActions.map((qa) => (
                <button key={qa.label} className={s.quickBtn} onClick={() => setActiveModal(qa.modal)}>
                  <i className={`bi ${qa.icon}`} style={{ color: qa.iconColor }} />
                  {qa.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3.3.1: Invoice Creation & Management */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={cx(s.st, 'text-primary')}><i className="bi bi-receipt" style={{ color: 'var(--pm-primary)' }} /> 3.3.1 — Invoice Creation & Management</h3>
                <p className={s.ss}>Create, send, and track all invoices with payment status.</p>
              </div>
              <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('newInvoiceModal')}>
                <i className="bi bi-plus-circle" /> New Invoice
              </button>
            </div>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {config.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td><strong>{inv.id}</strong></td>
                      <td>{inv.customer}</td>
                      <td>{inv.amount}</td>
                      <td>{inv.dueDate}</td>
                      <td><span className={cx(s.badge, s[inv.statusTone])}>{inv.status}</span></td>
                      <td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(inv.modal)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3.3.2: Payment Links & Checkout */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={cx(s.st, 'text-info')}><i className="bi bi-link-45deg" style={{ color: 'var(--pm-info)' }} /> 3.3.2 — Payment Links & Checkout</h3>
                <p className={s.ss}>Generate payment links, track views, conversions, and revenue.</p>
              </div>
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('newPaymentLinkModal')}>
                <i className="bi bi-link-45deg" /> New Link
              </button>
            </div>
            <div className="row g-3">
              {config.linkCards.map((lc) => (
                <div key={lc.key} className="col-lg-4 col-md-6">
                  <div className={s.linkCard} onClick={() => setActiveModal(lc.modal)}>
                    <div className="d-flex justify-content-between align-items-center">
                      <strong style={{ fontSize: 13 }}>{lc.name}</strong>
                      <span className={cx(s.badge, s[lc.statusTone])}>{lc.status}</span>
                    </div>
                    <div className={s.sv} style={{ fontSize: 18 }}>{lc.amount}</div>
                    <div className="d-flex gap-2 mt-2" style={{ fontSize: 12 }}>
                      <span><i className="bi bi-eye" /> {lc.views} views</span>
                      <span><i className="bi bi-check-circle" /> {lc.conversions} paid</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="col-lg-4 col-md-6">
                <div className={cx(s.card, s.cardAccent)} style={{ cursor: 'pointer' }} onClick={() => setActiveModal('linkAnalyticsModal')}>
                  <div className={s.sl} style={{ color: 'rgba(255,255,255,.7)' }}>CONVERSION RATE</div>
                  <div className={s.sv}>41.7%</div>
                  <span className={cx(s.badge, s.badgeS)}><i className="bi bi-arrow-up" /> +8% this month</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3.3.3: Collections Tracking & Aging */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={cx(s.st, 'text-warning')}><i className="bi bi-clock-history" style={{ color: 'var(--pm-warning)' }} /> 3.3.3 — Collections Tracking & Aging</h3>
                <p className={s.ss}>Monitor aging buckets, escalation workflows, and collection rates.</p>
              </div>
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('agingReportModal')}>
                <i className="bi bi-graph-up" /> Aging Report
              </button>
            </div>
            <div className="row g-3">
              {config.agingBlocks.map((ab) => (
                <div key={ab.range} className="col-md-4">
                  <div style={{ background: ab.bgColor, borderRadius: 'var(--pm-r-md)', padding: 16, cursor: 'pointer' }} onClick={() => setActiveModal('agingReportModal')}>
                    <div style={{ fontSize: 12, color: ab.color, fontWeight: 600 }}>{ab.range}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: ab.textColor }}>{ab.amount}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 d-flex gap-2">
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('reminderSettingsModal')}>
                <i className="bi bi-bell" /> Send Auto-Reminders
              </button>
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('bulkRemindersModal')}>
                <i className="bi bi-envelope" /> Bulk Reminders
              </button>
            </div>
          </div>

          {/* SECTION 3.3.4: Subscription & Recurring Billing */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={cx(s.st, 'text-purple')}><i className="bi bi-arrow-repeat" style={{ color: 'var(--pm-purple)' }} /> 3.3.4 — Subscription & Recurring Billing</h3>
                <p className={s.ss}>Manage plans, subscriber lifecycle, and recurring revenue.</p>
              </div>
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('newSubscriptionModal')}>
                <i className="bi bi-plus-circle" /> New Subscription
              </button>
            </div>
            <div className="row g-3 mb-3">
              {config.planCards.map((pc) => (
                <div key={pc.key} className="col-lg-4 col-md-6">
                  <div className={s.planCard} style={{ cursor: 'pointer' }} onClick={() => setActiveModal(pc.modal)}>
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>{pc.name}</strong>
                      <span className={cx(s.badge, s[pc.badge.tone])}>{pc.badge.text}</span>
                    </div>
                    <div className={s.sv} style={{ fontSize: 16 }}>{pc.price}</div>
                    <div className="d-flex gap-2" style={{ fontSize: 12 }}>
                      <span>{pc.subscribers} subscribers</span>
                      <span>· MRR: {pc.mrr}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>Customer</th><th>Plan</th><th>Amount</th><th>Next Bill</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {config.subscriberRows.map((sr) => (
                    <tr key={sr.name}>
                      <td><strong>{sr.name}</strong></td>
                      <td>{sr.plan}</td>
                      <td>{sr.amount}</td>
                      <td>{sr.nextBill}</td>
                      <td><span className={cx(s.badge, s[sr.statusTone])}>{sr.status}</span></td>
                      <td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(sr.modal)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* MODALS */}
      <InvoicingBillingModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
