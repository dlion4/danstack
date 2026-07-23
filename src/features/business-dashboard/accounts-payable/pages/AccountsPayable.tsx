import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from '../styles/accounts-payable.module.css'
import AccountsPayableModals from '../components/AccountsPayableModals'

/* ============================================================================
   PayMo BaaS — Accounts Payable & Supplier Management (legacy page 3.6)
   React + TypeScript + TanStack Query, cream + indigo/emerald dashboard theme.
   ========================================================================== */

type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP' | 'badgeDark'

interface NavItem { icon: string; title: string; active?: boolean; dot?: boolean }
interface HeroStat { key: string; col: string; label: string; labelColor?: string; value: string; badge?: { icon: string; text: string; tone: BadgeTone }; progress?: { percent: number; color: string }; extra?: { label: string; value: string }[] }
interface FeedItem { icon: string; iconBg: string; iconColor: string; title: string; sub: string; btnLabel: string; btnClass?: string; modal: string }
interface QuickAction { icon: string; iconColor: string; label: string; modal: string }
interface SupplierRow { name: string; category: string; invoices: number; outstanding: string; status: string; statusTone: BadgeTone; modal: string }
interface InvoiceRow { id: string; supplier: string; amount: string; dueDate: string; status: string; statusTone: BadgeTone; modal: string }
interface DiscountRow { supplier: string; discount: string; terms: string; savings: string; expires: string; expiresTone: BadgeTone; modal: string }
interface User { initials: string; name: string; role: string; avatarBg: string }

interface APConfig {
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
  quickActions: QuickAction[]
  suppliers: SupplierRow[]
  invoices: InvoiceRow[]
  discounts: DiscountRow[]
}

const initialMockData: APConfig = {
  nav: [
    { icon: 'bi-house', title: 'Business Home' },
    { icon: 'bi-shop', title: 'Collections' },
    { icon: 'bi-receipt', title: 'Invoicing' },
    { icon: 'bi-people', title: 'Payroll' },
    { icon: 'bi-send', title: 'Disbursements' },
    { icon: 'bi-file-earmark-minus', title: 'Accounts Payable', active: true, dot: true },
    { icon: 'bi-gear', title: 'Business Settings' },
  ],
  headerTitle: 'Corporate Solutions Ltd',
  headerSub: '18 Active Suppliers · KRA PIN: P051***28G',
  searchPlaceholder: 'Search suppliers, invoices, payments, discounts...',
  user: { initials: 'AO', name: 'Amina O.', role: 'Head of Procurement · AP Admin', avatarBg: 'linear-gradient(135deg, #FECDD3 0%, #FB7185 100%)' },
  breadcrumb: { parent: 'Business Portal', current: 'Accounts Payable' },
  pageTitle: 'PAGE 3.6 — Accounts Payable & Supplier Management',
  pageSub: 'Manage supplier invoices, approval workflows, payment execution, and discount tracking.',
  heroStats: [
    { key: 'payables', col: 'col-lg-3 col-md-6', label: 'TOTAL PAYABLES', value: 'KES 2.4M', badge: { icon: 'bi-file-earmark-minus', text: '18 suppliers', tone: 'badgeI' } },
    { key: 'dueWeek', col: 'col-lg-3 col-md-6', label: 'DUE THIS WEEK', labelColor: 'var(--pm-warning)', value: 'KES 450K', badge: { icon: 'bi-clock', text: '5 invoices', tone: 'badgeW' } },
    { key: 'overdue', col: 'col-lg-3 col-md-6', label: 'OVERDUE', labelColor: 'var(--pm-danger)', value: 'KES 120K', badge: { icon: 'bi-exclamation-triangle', text: '2 invoices', tone: 'badgeD' } },
    { key: 'savings', col: 'col-lg-3 col-md-6', label: 'DISCOUNTS CAPTURED', value: 'KES 38K', badge: { icon: 'bi-percent', text: 'This month', tone: 'badgeS' } },
  ],
  attentionItems: [
    { icon: 'bi-exclamation-triangle', iconBg: 'var(--pm-danger-soft)', iconColor: 'var(--pm-danger)', title: '2 Overdue Invoices', sub: 'INV-8822 CreativeHub KES 45,000 & INV-0092 Global Logistics KES 75,000', btnLabel: 'Take Action', btnClass: 'btnPmD', modal: 'approvalQueueModal' },
    { icon: 'bi-clock', iconBg: 'var(--pm-warning-soft)', iconColor: 'var(--pm-warning)', title: '5 Invoices Due This Week', sub: 'Total KES 450,000 · OfficeMart, DesignWorks, CloudServe +2', btnLabel: 'Review', modal: 'approvalQueueModal' },
    { icon: 'bi-percent', iconBg: 'var(--pm-accent-soft)', iconColor: 'var(--pm-accent)', title: 'OfficeMart 2% Discount Expires Tomorrow', sub: 'Pay early to save KES 250 on KES 12,500 invoice', btnLabel: 'Pay Now', modal: 'earlyPaymentCalcModal' },
    { icon: 'bi-shield-exclamation', iconBg: 'var(--pm-info-soft)', iconColor: 'var(--pm-info)', title: 'Failed PesaLink Transfer', sub: 'INV-0092 to Global Logistics · Invalid account length', btnLabel: 'Retry', modal: 'paymentDetailModal' },
  ],
  quickActions: [
    { icon: 'bi-person-plus', iconColor: 'var(--pm-primary)', label: 'Add Supplier', modal: 'addSupplierModal' },
    { icon: 'bi-file-earmark-plus', iconColor: 'var(--pm-info)', label: 'Process Invoice', modal: 'processInvoiceModal' },
    { icon: 'bi-people', iconColor: 'var(--pm-accent)', label: 'Bulk Pay', modal: 'bulkPaySuppliersModal' },
    { icon: 'bi-check2-square', iconColor: 'var(--pm-warning)', label: 'Approve', modal: 'approvalQueueModal' },
    { icon: 'bi-calendar-check', iconColor: 'var(--pm-purple)', label: 'Schedule Pay', modal: 'schedulePaymentModal' },
    { icon: 'bi-graph-up', iconColor: 'var(--pm-danger)', label: 'View Aging', modal: 'agingReportModal' },
    { icon: 'bi-arrow-left-right', iconColor: 'var(--pm-muted)', label: 'Reconcile', modal: 'reconciliationModal' },
    { icon: 'bi-file-earmark-spreadsheet', iconColor: 'var(--pm-primary)', label: 'Export AP', modal: 'exportAPModal' },
  ],
  suppliers: [
    { name: 'OfficeMart', category: 'Office Supplies', invoices: 3, outstanding: 'KES 12,500', status: 'Active', statusTone: 'badgeS', modal: 'supplierDetailModal' },
    { name: 'CreativeHub', category: 'Design & Marketing', invoices: 2, outstanding: 'KES 45,000', status: 'Overdue', statusTone: 'badgeD', modal: 'supplierDetailModal' },
    { name: 'CloudServe', category: 'Cloud & IT Services', invoices: 4, outstanding: 'KES 128,000', status: 'Active', statusTone: 'badgeS', modal: 'supplierDetailModal' },
    { name: 'Global Logistics', category: 'Transport & Freight', invoices: 2, outstanding: 'KES 75,000', status: 'Payment Failed', statusTone: 'badgeD', modal: 'supplierDetailModal' },
    { name: 'DesignWorks Agency', category: 'Creative Services', invoices: 1, outstanding: 'KES 28,000', status: 'Pending', statusTone: 'badgeW', modal: 'supplierDetailModal' },
  ],
  invoices: [
    { id: 'INV-4419', supplier: 'OfficeMart', amount: 'KES 12,500', dueDate: '28 Jun 2025', status: 'Pending Approval', statusTone: 'badgeW', modal: 'invoiceDetailModal' },
    { id: 'INV-8822', supplier: 'CreativeHub', amount: 'KES 45,000', dueDate: '15 Jun 2025', status: 'Overdue', statusTone: 'badgeD', modal: 'invoiceDetailModal' },
    { id: 'INV-0092', supplier: 'Global Logistics', amount: 'KES 75,000', dueDate: '20 Jun 2025', status: 'Payment Failed', statusTone: 'badgeD', modal: 'invoiceDetailModal' },
    { id: 'INV-3410', supplier: 'CloudServe', amount: 'KES 128,000', dueDate: '5 Jul 2025', status: 'Approved', statusTone: 'badgeS', modal: 'invoiceDetailModal' },
    { id: 'INV-5510', supplier: 'DesignWorks', amount: 'KES 28,000', dueDate: '10 Jul 2025', status: 'Draft', statusTone: 'badgeI', modal: 'invoiceDetailModal' },
  ],
  discounts: [
    { supplier: 'OfficeMart', discount: '2%', terms: 'Net 10 / 2% early pay', savings: 'KES 250', expires: 'Tomorrow', expiresTone: 'badgeW', modal: 'discountTrackingModal' },
    { supplier: 'CloudServe', discount: '1.5%', terms: 'Net 15 / 1.5%', savings: 'KES 1,920', expires: '3 days', expiresTone: 'badgeW', modal: 'discountTrackingModal' },
    { supplier: 'Global Logistics', discount: '3%', terms: 'Net 7 / 3% rush', savings: 'KES 2,250', expires: 'Expired', expiresTone: 'badgeD', modal: 'discountTrackingModal' },
  ],
}

async function fetchAPData(): Promise<APConfig> {
  const res = await fetch('/api/business-dashboard/accounts-payable')
  if (!res.ok) throw new Error('Network error')
  return res.json()
}

export default function AccountsPayable() {
  const s = styles as Record<string, string>
  const cx = (...cls: (string | false | undefined)[]) => cls.filter(Boolean).join(' ')
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const { data: apiData } = useQuery({ queryKey: ['accounts-payable'], queryFn: fetchAPData, staleTime: 5 * 60 * 1000, retry: 1 })
  const config = apiData ?? initialMockData

  return (
    <div className={s.bizPage}>
      <aside className={s.sidebar}>
        <div className={s.sidebarLogo}>PB</div>
        <nav className={s.sidebarNav}>
          {config.nav.map((n) => (
            <button key={n.title} className={`${s.navItem} ${n.active ? s.navItemActive : ''}`} title={n.title}>
              <i className={`bi ${n.icon}`} />{n.dot && <span className={s.badgeDot} />}
            </button>
          ))}
        </nav>
      </aside>

      <div className={s.main}>
        <header className={s.header}>
          <div className={s.headerTitle}><h1>{config.headerTitle}</h1><p>{config.headerSub}</p></div>
          <div className={s.headerSearch}><i className="bi bi-search" /><input type="text" placeholder={config.searchPlaceholder} /></div>
          <div className={s.headerActions}>
            <button className={s.headerBtn} onClick={() => setActiveModal('notificationsModal')}><i className="bi bi-bell" /><span className={s.counter}>3</span></button>
            <button className={s.headerBtn} onClick={() => setActiveModal('approvalQueueModal')}><i className="bi bi-check2-square" /></button>
            <button className={s.profileBtn} onClick={() => setActiveModal('profileModal')}>
              <div className={s.avatar} style={{ background: config.user.avatarBg }}>{config.user.initials}</div>
              <div><div className={s.profileName}>{config.user.name}</div><div className={s.profileRole}>{config.user.role}</div></div>
            </button>
          </div>
        </header>

        <div className={s.pageBar}>
          <div>
            <div className={s.breadcrumb}><a href="#">{config.breadcrumb.parent}</a> · {config.breadcrumb.current}</div>
            <h2 className={s.pageH2}>{config.pageTitle}</h2>
            <p className={s.pageSub}>{config.pageSub}</p>
          </div>
          <div className="d-flex gap-2">
            <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('processInvoiceModal')}><i className="bi bi-file-earmark-plus" /> Process Invoice</button>
            <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('addSupplierModal')}><i className="bi bi-person-plus" /> Add Supplier</button>
          </div>
        </div>

        <div className={s.content}>
          {/* HERO */}
          <div className="row g-3">
            {config.heroStats.map((hs) => (
              <div key={hs.key} className={hs.col}>
                <div className={cx(s.card, hs.key === 'payables' ? s.cardAccent : '')} style={{ cursor: 'pointer' }} onClick={() => setActiveModal(hs.key === 'payables' ? 'agingReportModal' : hs.key === 'overdue' ? 'approvalQueueModal' : hs.key === 'savings' ? 'discountTrackingModal' : 'approvalQueueModal')}>
                  <div className={s.sl} style={hs.labelColor ? { color: hs.labelColor } : {}}>{hs.label}</div>
                  <div className={s.sv}>{hs.value}</div>
                  {hs.badge && <span className={cx(s.badge, s[hs.badge.tone])}><i className={`bi ${hs.badge.icon}`} /> {hs.badge.text}</span>}
                  {hs.progress && <div className={s.progress}><div className={s.progressBar} style={{ width: `${hs.progress.percent}%`, background: hs.progress.color }} /></div>}
                  {hs.extra && <div className="d-flex gap-2 mt-2" style={{ fontSize: 12 }}>{hs.extra.map((e) => <span key={e.label}><strong>{e.value}</strong> <span style={{ color: 'var(--pm-muted)' }}>{e.label}</span></span>)}</div>}
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
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{ai.title}</div><div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>{ai.sub}</div></div>
                <button className={cx(s.btnPm, s.btnSm, ai.btnClass ? s[ai.btnClass] : '')} onClick={() => setActiveModal(ai.modal)}>{ai.btnLabel}</button>
              </div>
            ))}
          </div>

          {/* QUICK ACTIONS */}
          <div className={s.card}>
            <h3 className={s.st}><i className="bi bi-grid-3x3-gap" style={{ color: 'var(--pm-primary)' }} /> Quick Actions</h3>
            <div className={s.quickGrid}>
              {config.quickActions.map((qa) => (
                <button key={qa.label} className={s.quickBtn} onClick={() => setActiveModal(qa.modal)}>
                  <i className={`bi ${qa.icon}`} style={{ color: qa.iconColor }} />{qa.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3.6.1 Supplier Management */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={cx(s.st, 'text-primary')}><i className="bi bi-person-lines-fill" style={{ color: 'var(--pm-primary)' }} /> 3.6.1 — Supplier Management</h3>
                <p className={s.ss}>Manage supplier profiles, categories, and onboarding.</p>
              </div>
              <button className={cx(s.btnPm, s.btnSm, s.btnPmP)} onClick={() => setActiveModal('addSupplierModal')}><i className="bi bi-person-plus" /> Add Supplier</button>
            </div>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>Supplier</th><th>Category</th><th>Invoices</th><th>Outstanding</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {config.suppliers.map((sr) => (
                    <tr key={sr.name}>
                      <td><strong>{sr.name}</strong></td>
                      <td>{sr.category}</td>
                      <td>{sr.invoices}</td>
                      <td>{sr.outstanding}</td>
                      <td><span className={cx(s.badge, s[sr.statusTone])}>{sr.status}</span></td>
                      <td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(sr.modal)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3.6.2 Invoice Processing & Approval */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={cx(s.st, 'text-info')}><i className="bi bi-file-earmark-check" style={{ color: 'var(--pm-info)' }} /> 3.6.2 — Invoice Processing & Approval</h3>
                <p className={s.ss}>Upload, review, approve, and schedule supplier invoices.</p>
              </div>
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('processInvoiceModal')}><i className="bi bi-file-earmark-plus" /> Process</button>
            </div>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>Invoice #</th><th>Supplier</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {config.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td><strong>{inv.id}</strong></td>
                      <td>{inv.supplier}</td>
                      <td>{inv.amount}</td>
                      <td>{inv.dueDate}</td>
                      <td><span className={cx(s.badge, s[inv.statusTone])}>{inv.status}</span></td>
                      <td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(inv.modal)}>Detail</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3.6.3 Payment Execution */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={cx(s.st, 'text-accent')}><i className="bi bi-send-check" style={{ color: 'var(--pm-accent)' }} /> 3.6.3 — Payment Execution</h3>
                <p className={s.ss}>Execute approved payments via PesaLink, M-Pesa B2C, or bank transfer.</p>
              </div>
              <button className={cx(s.btnPm, s.btnSm, s.btnPmA)} onClick={() => setActiveModal('bulkPaySuppliersModal')}><i className="bi bi-people" /> Bulk Pay</button>
            </div>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
              <div className="d-flex justify-content-between"><span>Approved for Payment</span><strong>3 invoices · KES 165,500</strong></div>
              <div className="d-flex justify-content-between"><span>Payment Methods</span><strong>PesaLink, M-Pesa B2C, Bank Transfer</strong></div>
              <div className="d-flex justify-content-between"><span>Last Batch Executed</span><strong>22 Jun 2025 · KES 98,000</strong></div>
            </div>
            <div className="d-flex gap-2">
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('bulkPaySuppliersModal')}><i className="bi bi-people" /> Execute Batch</button>
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('schedulePaymentModal')}><i className="bi bi-calendar-check" /> Schedule</button>
            </div>
          </div>

          {/* 3.6.4 Discount & Terms Tracking */}
          <div className={s.card}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className={cx(s.st, 'text-purple')}><i className="bi bi-percent" style={{ color: 'var(--pm-purple)' }} /> 3.6.4 — Discount & Terms Tracking</h3>
                <p className={s.ss}>Capture early-payment discounts and track supplier terms.</p>
              </div>
              <button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal('discountTrackingModal')}><i className="bi bi-percent" /> View All</button>
            </div>
            <div className="table-responsive">
              <table className={s.tbl}>
                <thead><tr><th>Supplier</th><th>Discount</th><th>Terms</th><th>Savings</th><th>Expires</th><th>Action</th></tr></thead>
                <tbody>
                  {config.discounts.map((dr) => (
                    <tr key={dr.supplier}>
                      <td><strong>{dr.supplier}</strong></td>
                      <td>{dr.discount}</td>
                      <td>{dr.terms}</td>
                      <td style={{ color: 'var(--pm-accent)' }}>{dr.savings}</td>
                      <td><span className={cx(s.badge, s[dr.expiresTone])}>{dr.expires}</span></td>
                      <td><button className={cx(s.btnPm, s.btnSm)} onClick={() => setActiveModal(dr.modal)}>Capture</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AccountsPayableModals active={activeModal} onClose={() => setActiveModal(null)} onOpen={setActiveModal} />
    </div>
  )
}
