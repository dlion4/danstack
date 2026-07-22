import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import CorporateBusinessCardsModals from '../components/CorporateBusinessCardsModals';

interface NavItem { icon: string; active?: boolean; dot?: boolean; }
interface StatCard { key: string; col: string; label: string; labelColor: string; value: string; warnBorder?: boolean; rawCard?: { bg: string; number: string; name: string }; lines?: string[]; badge?: { icon: string; text: string; tone: string }; progress?: { width: string; color: string } }
interface AttentionItem { icon: string; iconBg: string; iconColor: string; iconText?: string; title: string; sub: string; actionLabel: string; actionClass?: string; modal: string }
interface CardDesign { bg: string; label: string; price: string }
interface ControlToggle { label: string; sub: string; on?: boolean }
interface ControlSecurity { label: string; sub: string; actionLabel: string; modal: string }
interface LimitsItem { label: string; value: string; width: string; color: string }
interface ReplacementItem { type: string; desc: string; impact: string; actionLabel: string; actionClass?: string; modal: string }

interface CorporateConfig {
  nav: NavItem[];
  headerTitle: string;
  headerSub: string;
  searchPlaceholder: string;
  user: { initials: string; name: string; role: string };
  breadcrumb: { parents: { label: string; to: string }[]; current: string };
  pageCode: string;
  pageTitle: string;
  pageSub: string;
  heroActions: { label: string; modal: string }[];
  statCards: StatCard[];
  attention: AttentionItem[];
  portfolio: { bg: string; number: string; title: string; sub: string; subTone?: string; actionLabel: string; modal: string }[];
  quickActions: { icon: string; iconColor: string; label: string; modal: string }[];
  issuance: {
    delivery: { title: string; badge: string; stepTitle: string; tracker: string; steps: any[]; note: string };
    designs: CardDesign[];
  };
  controls: {
    toggles: ControlToggle[];
    security: ControlSecurity[];
    limits: LimitsItem[];
    limitsActionLabel: string;
    limitsModal: string;
  };
  replacements: ReplacementItem[];
}

const initialMockData: CorporateConfig = {
  nav: [
    { icon: 'bi-house' },
    { icon: 'bi-grid-3x3-gap' },
    { icon: 'bi-wallet2' },
    { icon: 'bi-credit-card', active: true },
    { icon: 'bi-shield-lock' },
    { icon: 'bi-bar-chart-line' },
  ],
  headerTitle: 'Card Center',
  headerSub: 'Physical, Virtual, Prepaid & Corporate Card Management',
  searchPlaceholder: 'Search cards, transactions, limits, requests...',
  user: { initials: 'CA', name: 'James K.', role: 'Cardholder' },
  breadcrumb: {
    parents: [{ label: 'Home', to: '/' }, { label: 'Card Center', to: '/card-center' }],
    current: 'Corporate & Business Card Programs',
  },
  pageCode: '5.6',
  pageTitle: 'Corporate & Business Card Programs',
  pageSub: 'Manage employee expense cards, setup policies, enforce approvals, automate reconciliation, and control corporate billing.',
  heroActions: [
    { label: 'Issue New Card', modal: 'issueCardModal' },
    { label: 'Bulk Upload', modal: 'bulkIssueModal' },
    { label: 'Policy Rules', modal: 'policyRulesModal' },
    { label: 'View Approvals', modal: 'approvalQueueModal' },
    { label: 'Generate Report', modal: 'reportsModal' },
  ],
  statCards: [
    {
      key: 'active',
      col: 'col-lg-4',
      label: 'ACTIVE CARDS',
      labelColor: 'var(--pm-primary)',
      value: '42',
      badge: { icon: 'bi-check-circle-fill', text: 'Active', tone: 'success' },
    },
    {
      key: 'pending',
      col: 'col-lg-4',
      label: 'PENDING APPROVALS',
      labelColor: 'var(--pm-warning)',
      value: 'KES 485K',
      badge: { icon: 'bi-clock-history', text: '8 transactions', tone: 'warning' },
    },
    {
      key: 'spend',
      col: 'col-lg-4',
      label: 'TOTAL SPEND (MTD)',
      labelColor: 'var(--pm-info)',
      value: 'KES 2.4M',
      progress: { width: '86%', color: 'var(--pm-info)' },
    },
  ],
  attention: [
    {
      icon: 'bi-exclamation-triangle',
      iconBg: 'var(--pm-danger-soft)',
      iconColor: 'var(--pm-danger)',
      title: 'Large Transaction Pending',
      sub: 'AWS EMEA · KES 145,000 · Exceeds KES 100K limit',
      actionLabel: 'Review',
      modal: 'reviewTransactionModal',
    },
    {
      icon: 'bi-envelope',
      iconBg: 'var(--pm-warning-soft)',
      iconColor: 'var(--pm-warning)',
      title: 'Missing Receipt',
      sub: 'J. Wanjiku · Java House · KES 8,500',
      actionLabel: 'Upload',
      modal: 'uploadReceiptModal',
    },
  ],
  portfolio: [
    {
      bg: 'debitStandard',
      number: '8422',
      title: 'Standard Debit Card',
      sub: 'Active · KES 145.2k available',
      actionLabel: 'View',
      modal: 'viewCardDetailsModal',
    },
    {
      bg: 'debitBusiness',
      number: '1102',
      title: 'SME Business Debit',
      sub: 'Needs PIN',
      actionLabel: 'PIN',
      modal: 'pinManagementModal',
    },
    {
      bg: 'debitPremium',
      number: '5591',
      title: 'Premium Travel Debit',
      sub: 'In transit',
      actionLabel: 'Track',
      modal: 'cardDeliveryModal',
    },
    {
      bg: 'debitStandard',
      number: '9421',
      title: 'Legacy Debit Card',
      sub: 'Frozen',
      actionLabel: 'Replace',
      modal: 'replaceCardModal',
    },
  ],
  quickActions: [
    { icon: 'bi-plus-circle', iconColor: 'var(--pm-primary)', label: 'Issue Card', modal: 'issueCardModal' },
    { icon: 'bi-people', iconColor: 'var(--pm-warning)', label: 'Bulk Upload', modal: 'bulkIssueModal' },
    { icon: 'bi-shield-lock', iconColor: 'var(--pm-warning)', label: 'Policy Rules', modal: 'policyRulesModal' },
    { icon: 'bi-check-circle', iconColor: 'var(--pm-purple)', label: 'Approvals', modal: 'approvalQueueModal' },
    { icon: 'bi-bar-chart', iconColor: 'var(--pm-danger)', label: 'Reporting', modal: 'reportsModal' },
  ],
  issuance: {
    delivery: {
      title: 'Premium Travel Debit',
      badge: 'Dispatched',
      stepTitle: 'Courier',
      tracker: 'TRK-9921448',
      steps: [
        { icon: 'bi-check', title: 'Approved', sub: '25 Jun, 10:00 AM', done: true, active: false },
        { icon: 'bi-check', title: 'Printed', sub: '26 Jun, 09:15 AM', done: true, active: false },
        { icon: '3', title: 'Courier', sub: '26 Jun, 14:30 PM — Hub Nairobi', done: false, active: true },
        { icon: '4', title: 'Out for Delivery', sub: 'Pending', done: false, active: false },
        { icon: '5', title: 'Delivered', sub: 'Pending signature', done: false, active: false },
      ],
      note: 'You must provide the 4-digit Delivery OTP (8812) to the rider to receive your card.',
    },
    designs: [
      { bg: 'debitStandard', label: 'Standard', price: 'Free' },
      { bg: 'debitPremium', label: 'Premium', price: 'KES 1,000' },
      { bg: 'debitBusiness', label: 'Business', price: 'Free for SMEs' },
    ],
  },
  controls: {
    toggles: [
      { label: 'Online Transactions', sub: 'E‑commerce & web', on: true },
      { label: 'International Spend', sub: 'Outside Kenya', on: false },
      { label: 'ATM Withdrawals', sub: 'Cash access', on: true },
      { label: 'Contactless (Tap‑to‑pay)', sub: 'NFC payments', on: true },
    ],
    security: [
      { label: 'Change Card PIN', sub: 'Requires old PIN', actionLabel: 'Change', modal: 'pinManagementModal' },
      { label: 'Reset Forgotten PIN', sub: 'Requires OTP + Auth', actionLabel: 'Reset', modal: 'resetPinModal' },
      { label: 'Geo‑Fencing', sub: 'Restrict by location', actionLabel: 'Manage', modal: 'geoFencingModal' },
      { label: 'Travel Mode', sub: 'Pre‑declare travel', actionLabel: 'Setup', modal: 'travelModeModal' },
    ],
    limits: [
      { label: 'Daily POS Limit', value: 'KES 42k / 100k', width: '42%', color: 'var(--pm-primary)' },
      { label: 'Daily ATM Limit', value: 'KES 0 / 40k', width: '0%', color: 'var(--pm-info)' },
    ],
    limitsActionLabel: 'Adjust All Limits',
    limitsModal: 'cardLimitsModal',
  },
  replacements: [
    { type: 'Temporary Freeze', desc: 'Misplaced card but not stolen.', impact: 'Blocks new authorizations instantly.', actionLabel: 'Freeze Card', modal: 'freezeCardModal' },
    { type: 'Report Lost/Stolen', desc: 'Card is definitely lost or stolen.', impact: 'Permanent block. Reissues a new PAN.', actionLabel: 'Report Lost', modal: 'reportLostModal' },
    { type: 'Replace Damaged', desc: 'Chip/Magstripe broken. Same card number.', impact: 'Old card works until new card is activated.', actionLabel: 'Replace', modal: 'replaceCardModal' },
    { type: 'Cancel Card', desc: 'Close debit card permanently.', impact: 'Permanent closure. Balance returned to wallet.', actionLabel: 'Cancel', modal: 'cancelCardModal' },
  ],
};

const config = initialMockData;

export default function CorporateBusinessCardsPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="pm-app">
      {/* Sidebar */}
      <aside className="pm-sidebar">
        <div className="pm-sidebar-logo">P</div>
        <nav className="pm-sidebar-nav">
          {config.nav.map((item, idx) => (
            <button 
              key={idx} 
              className={`pm-nav-item ${item.active ? 'active' : ''}`}
              onClick={() => {
                // Handle navigation if needed
                console.log('Nav item clicked:', item.icon);
              }}
            >
              <i className={`bi ${item.icon}`} />
              {item.dot && <span className="badge-dot" />}
            </button>
          ))}
        </nav>
        <button className="pm-nav-item" style={{ marginTop: 'auto' }}><i className="bi bi-question-circle" /></button>
      </aside>

      {/* Main Content */}
      <div className="pm-main">
        {/* Header */}
        <header className="pm-header">
          <div className="pm-header-title" style={{ flexShrink: 0 }}>
            <div className="d-flex align-items-center gap-2">
              <div className="pm-avatar" style={{ width: 36, height: 36, fontSize: 13, background: 'var(--pm-primary)' }}>{config.user.initials}</div>
              <div>
                <h1>{config.headerTitle}</h1>
                <p>{config.headerSub}</p>
              </div>
            </div>
          </div>
          <div className="pm-header-search">
            <i className="bi bi-search" />
            <input type="text" placeholder={config.searchPlaceholder} />
          </div>
          <div className="pm-header-actions">
            <button className="pm-header-btn" onClick={() => setActiveModal('reportsModal')}>
              <i className="bi bi-file-earmark-bar-graph" />
            </button>
            <button className="pm-header-btn" onClick={() => setActiveModal('approvalQueueModal')}>
              <i className="bi bi-ui-checks" />
              <span className="counter">8</span>
            </button>
            <button className="pm-header-btn" onClick={() => setActiveModal('notificationsModal')}>
              <i className="bi bi-bell" />
              <span className="counter">3</span>
            </button>
            <div className="pm-profile-btn" onClick={() => setActiveModal('companyProfileModal')}>
              <div className="pm-avatar" style={{ background: '#1E293B' }}>A</div>
              <div>
                <div className="pm-name">Acme Corp</div>
                <div className="pm-role">Admin Access</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Bar */}
        <div className="pm-page-bar">
          <div>
            <div className="pm-breadcrumb">
              {config.breadcrumb.parents.map((p, index) => (
                <React.Fragment key={p.to}>
                  <Link to={p.to}>{p.label}</Link>{index < config.breadcrumb.parents.length - 1 ? ' / ' : ''}
                </React.Fragment>
              ))}
              <strong>{config.breadcrumb.current}</strong>
            </div>
            <h2 style={{ fontFamily: 'var(--pm-font-display)', fontSize: 20, fontWeight: 700, margin: '8px 0 2px' }}>
              PAGE {config.pageCode} — {config.pageTitle}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)', margin: 0 }}>
              {config.pageSub}
            </p>
          </div>
          <div className="d-flex flex-wrap" style={{ gap: 8 }}>
            <button className="pm-btn" onClick={() => setActiveModal('policyRulesModal')}>
              <i className="bi bi-shield-lock" /> Policies
            </button>
            <button className="pm-btn" onClick={() => setActiveModal('reconciliationModal')}>
              <i className="bi bi-journal-check" /> Recon
            </button>
            <button className="pm-btn pm-btn-primary" onClick={() => setActiveModal('issueCardModal')}>
              <i className="bi bi-plus-lg" /> Issue Card
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="pm-content">
          {/* HERO STATS ROW */}
          <div className="row g-3">
            {config.statCards.map((s) => (
              <div key={s.key} className={s.col}>
                <div 
                  className={`${s.key === 'active' ? 'pm-card-accent' : ''} ${s.warnBorder ? 'border-start-danger' : ''}`}
                  style={{ 
                    minHeight: 170,
                    borderLeft: s.warnBorder ? '3px solid var(--pm-danger)' : undefined
                  }}
                >
                  {s.key === 'active' ? (
                    <>
                      <div className="d-flex justify-content-between">
                        <div>
                          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>
                            Active Cards <span style={{ color: '#86efac' }}>●</span>
                          </p>
                          <div className="pm-stat-value" style={{ margin: '8px 0', color: '#fff' }}>{s.value}</div>
                          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.78)' }}>{s.lines?.[0] ?? ''}</p>
                        </div>
                        {s.rawCard && (
                          <div className="text-end">
                            <div className="c-card">
                              <div className="logo" style={{ fontFamily: 'var(--pm-font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '1px' }}>PayMo</div>
                              <div className="chip" style={{ width: 40, height: 30, background: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)', borderRadius: 6, margin: '10px 0' }}></div>
                              <div className="pan" style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: '2px', margin: 'auto 0 10px' }}>{s.rawCard.number}</div>
                              <div className="bot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div className="name" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{s.rawCard.name}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                        <button 
                          className="pm-btn pm-btn-sm" 
                          style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} 
                          onClick={() => setActiveModal('viewCardDetailsModal')}
                        >
                          View Details
                        </button>
                        <button 
                          className="pm-btn pm-btn-sm" 
                          style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.22)', color: '#fff' }} 
                          onClick={() => setActiveModal('cardLimitsModal')}
                        >
                          Limits
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="pm-stat-label" style={{ color: s.labelColor }}>{s.label}</p>
                      <div className="pm-stat-value" style={{ margin: '6px 0' }}>{s.value}</div>
                      {s.badge && (
                        <span className={`pm-badge pm-badge-${s.badge.tone}`}>
                          <i className={`bi ${s.badge.icon}`} /> {s.badge.text}
                        </span>
                      )}
                      {s.progress && (
                        <div className="mt-3">
                          <div className="pm-progress">
                            <div className="pm-progress-bar" style={{ width: s.progress.width, background: s.progress.color }} />
                          </div>
                        </div>
                      )}
                      {s.lines?.map((l) => (
                        <div key={l} className="mt-2" style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>{l}</div>
                      ))}
                      {s.key === 'limit' && (
                        <button className="pm-btn pm-btn-sm mt-3 w-100" onClick={() => setActiveModal('cardLimitsModal')}>
                          Adjust Limits
                        </button>
                      )}
                      {s.key === 'security' && (
                        <button className="pm-btn pm-btn-sm mt-2" onClick={() => setActiveModal('cardHealthModal')}>
                          Security Audit
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* MAIN ACTION SECTIONS */}
          <div className="row g-3">
            <div className="col-lg-4">
              <div className="pm-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="pm-section-title">Attention & Tracking</h3>
                  <button className="pm-btn pm-btn-sm" onClick={() => setActiveModal('cardDeliveryModal')}>Track All</button>
                </div>
                {config.attention.map((item) => (
                  <div key={item.title} className="feed-item">
                    <div className="pm-icon-circle" style={{ background: item.iconBg, color: item.iconColor, fontSize: 12 }}>
                      {item.iconText ?? item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                    </div>
                    <button 
                      className={`pm-btn pm-btn-sm ${item.actionClass ? `pm-${item.actionClass}` : ''}`} 
                      onClick={() => setActiveModal(item.modal)}
                    >
                      {item.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="pm-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="pm-section-title">Card Portfolio</h3>
                  <button className="pm-btn pm-btn-sm" onClick={() => setActiveModal('portfolioModal')}>Manage</button>
                </div>
                {config.portfolio.map((item) => (
                  <div key={item.number} className="feed-item">
                    <div className={`c-card ${item.bg === 'debitStandard' ? 'c-card-debit' : item.bg === 'debitBusiness' ? 'c-card-business' : item.bg === 'debitPremium' ? 'c-card-premium' : ''} ${item.subTone === 'text-danger' ? 'c-card-frozen-filter' : ''}`}>
                      <span>{item.number}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{item.sub}</div>
                    </div>
                    <button className="pm-btn pm-btn-sm" onClick={() => setActiveModal(item.modal)}>
                      {item.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="pm-card">
                <div className="mb-3">
                  <h3 className="pm-section-title">Card Controls & Actions</h3>
                  <p className="pm-sub">Section 5.2.2 & 5.2.3 operations</p>
                </div>
                <div className="quick-action-grid">
                  {config.quickActions.map((a) => (
                    <button key={a.label} className="quick-action-btn" onClick={() => setActiveModal(a.modal)}>
                      <i className={`bi ${a.icon} me-1`} style={{ color: a.iconColor }} /> {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5.2.1 — Card Issuance, Ordering & Tracking */}
          <div className="pm-card">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className="pm-section-title"><i className="bi bi-credit-card-2-front-fill" style={{ color: 'var(--pm-primary)' }} /> 5.2.1 — Card Issuance, Ordering & Tracking</h3>
                <p className="pm-section-sub">Order new personal or corporate debit cards, customize designs, and track courier delivery in real-time.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className="pm-btn pm-btn-sm" onClick={() => setActiveModal('bulkOrderModal')}>
                  <i className="bi bi-files" /> Bulk Order
                </button>
                <button className="pm-btn pm-btn-sm pm-btn-primary" onClick={() => setActiveModal('orderCardModal')}>
                  <i className="bi bi-plus-lg" /> Order Card
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-7">
                <div className="utility-block">
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Active Deliveries</h4>
                  <div className="p-3 border rounded mb-3" style={{ borderLeft: '3px solid var(--pm-warning)!important' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{config.issuance.delivery.title}</span> 
                        <span className={`pm-badge pm-badge-warning ms-2`}>{config.issuance.delivery.badge}</span>
                      </div>
                      <button className="pm-btn pm-btn-sm" onClick={() => setActiveModal('cardDeliveryModal')}>
                        View Tracker
                      </button>
                    </div>
                    <div className="pm-stepper mb-2 mt-3" style={{ marginBottom: '12px!important' }}>
                      {config.issuance.delivery.steps.map((step, i) => (
                        <div 
                          key={i} 
                          className={`pm-step ${step.active ? 'active' : ''} ${step.done ? 'completed' : ''}`}
                        >
                          <div className="step-num">{step.done ? <i className="bi bi-check" /> : step.icon}</div>
                          <div className="stepLabel">{step.title}</div>
                          {i < config.issuance.delivery.steps.length - 1 && (
                            <div className="step-line" style={{ background: step.done ? 'var(--pm-accent)' : 'var(--pm-border)' }} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--pm-ink-soft)' }}>
                      <i className="bi bi-truck me-1" /> Fargo Courier ({config.issuance.delivery.tracker}). Expected delivery: <strong>Tomorrow, 2:00 PM - 5:00 PM</strong> at Kilimani Office.
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="utility-block">
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Available Card Designs</h4>
                  <div className="d-flex flex-wrap gap-2">
                    {config.issuance.designs.map((d) => (
                      <div 
                        key={d.label} 
                        className="border rounded p-2 text-center" 
                        style={{ width: 120, cursor: 'pointer' }} 
                        onClick={() => setActiveModal('orderCardModal')}
                      >
                        <div className={`c-card ${d.bg}`} style={{ width: '100%', padding: 8, borderRadius: 6 }}>
                          <div className="card-logo" style={{ fontSize: 8 }}>PayMo</div>
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{d.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--pm-muted)' }}>{d.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5.2.2 & 5.2.3 — Physical Card Controls & PIN Management */}
          <div className="pm-card">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className="pm-section-title"><i className="bi bi-sliders" style={{ color: 'var(--pm-info)' }} /> 5.2.2 & 5.2.3 — Physical Card Controls & PIN Management</h3>
                <p className="pm-section-sub">Configure daily limits, geographic scopes, MCC blocking, contactless caps, and manage card PINs.</p>
              </div>
              <div className="d-flex" style={{ gap: 8 }}>
                <button className="pm-btn pm-btn-sm" onClick={() => setActiveModal('merchantControlsModal')}>
                  <i className="bi bi-shop" /> MCC Blocks
                </button>
                <button className="pm-btn pm-btn-sm" onClick={() => setActiveModal('cardLimitsModal')}>
                  <i className="bi bi-speedometer2" /> Limits
                </button>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-lg-4">
                <div className="pm-card">
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Transaction Toggles</h4>
                  {config.controls.toggles.map((t) => (
                    <div key={t.label} className="status-row">
                      <div>
                        <strong>{t.label}</strong>
                        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{t.sub}</div>
                      </div>
                      <div className="form-check form-switch">
                        <input className="form-check-input" type="checkbox" defaultChecked={t.on} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className="utility-block">
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Security & PIN</h4>
                  {config.controls.security.map((s) => (
                    <div key={s.label} className="status-row">
                      <div>
                        <strong>{s.label}</strong>
                        <div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{s.sub}</div>
                      </div>
                      <button className="pm-btn pm-btn-sm" onClick={() => setActiveModal(s.modal)}>{s.actionLabel}</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <div className="utility-block">
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Active Limits (Standard Debit)</h4>
                  {config.controls.limits.map((l) => (
                    <div key={l.label} className="mb-3">
                      <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
                        <span>{l.label}</span>
                        <span>{l.value}</span>
                      </div>
                      <div className="pm-progress">
                        <div className="pm-progress-bar" style={{ width: l.width, background: l.color }} />
                      </div>
                    </div>
                  ))}
                  {config.controls.limitsActionLabel && (
                    <button 
                      className="pm-btn pm-btn-sm w-100" 
                      onClick={() => setActiveModal(config.controls.limitsModal)}
                    >
                      {config.controls.limitsActionLabel}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 5.2.4 — Card Replacement, Freeze & Cancellation */}
          <div className="pm-card">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap" style={{ gap: 8 }}>
              <div>
                <h3 className="pm-section-title"><i className="bi bi-shield-x" style={{ color: 'var(--pm-danger)' }} /> 5.2.4 — Card Replacement, Freeze & Cancellation</h3>
                <p className="pm-section-sub">Handle lost/stolen cards, temporary freezes, damaged card replacements, and permanent account closures securely.</p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Action Type</th>
                    <th>Description</th>
                    <th>Impact</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {config.replacements.map((r) => (
                    <tr key={r.type}>
                      <td data-label="Action Type"><strong>{r.type}</strong></td>
                      <td data-label="Description">{r.desc}</td>
                      <td data-label="Impact">{r.impact}</td>
                      <td data-label="Action">
                        <button 
                          className={`pm-btn pm-btn-sm ${r.actionClass ? `pm-${r.actionClass}` : ''}`}
                          style={r.actionClass === 'btnDanger' ? { background: 'var(--pm-warning)', color: '#fff', border: 'none' } : {}}
                          onClick={() => setActiveModal(r.modal)}
                        >
                          {r.actionLabel}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <div className="pm-sidebar-overlay" onClick={() => setActiveModal(null)} />

      {/* Modals */}
      <CorporateBusinessCardsModals 
        active={activeModal} 
        onClose={() => setActiveModal(null)} 
        onOpen={setActiveModal} 
      />
    </div>
  );
}