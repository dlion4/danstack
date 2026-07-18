import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styles from '../styles/initiateTransfer.module.css';
import { InitiateTransferModals } from '../components/InitiateTransferModals';

// Mock data for repeating content
const initialMockData = {
  heroStats: [
    {
      id: 1,
      label: 'Transfer engine live',
      value: 'KES 124.7M',
      description: 'Processed today across 12 rails • 98.9% success rate • 4.2s avg settlement',
      isAccent: true,
      buttons: [
        { label: 'Rails', action: 'railHealth' },
        { label: 'Fees', action: 'feeCalc' },
        { label: 'New', action: 'newTransfer' }
      ]
    },
    {
      id: 2,
      label: "TODAY'S TRANSFERS",
      value: '2,841',
      badge: { text: '2,812 completed', variant: 'success' },
      description: '29 in progress • 0 failed',
      labelColor: 'success'
    },
    {
      id: 3,
      label: 'AVG SETTLEMENT',
      value: '4.2s',
      badge: { text: '-0.8s vs yesterday', variant: 'info' },
      description: 'PesaLink: 3.4s • RTGS: 8.7s',
      labelColor: 'info'
    },
    {
      id: 4,
      label: 'PENDING APPROVAL',
      value: '14',
      badge: { text: '7 high-value', variant: 'warning' },
      description: 'KES 48.3M awaiting maker-checker',
      labelColor: 'warning',
      borderLeft: true
    }
  ],
  transferTypes: [
    { id: 'single', label: 'Single' },
    { id: 'bulk', label: 'Bulk' },
    { id: 'recurring', label: 'Recurring' }
  ],
  sourceAccounts: [
    { id: 1, name: 'PayMo KES Float (M-Pesa)', balance: 'KES 124.7M' },
    { id: 2, name: 'PayMo KES Nostro (KCB)', balance: 'KES 89.4M' },
    { id: 3, name: 'PayMo USD Nostro', balance: 'USD 2.8M' },
    { id: 4, name: 'Client Segregated', balance: 'KES 31.2M' }
  ],
  beneficiaryTypes: [
    { id: 'bank', label: 'Bank' },
    { id: 'mobile', label: 'Mobile Money' },
    { id: 'wallet', label: 'Wallet' }
  ],
  banks: [
    'KCB Bank Kenya',
    'Equity Bank',
    'Co-operative Bank',
    'Stanbic Bank',
    'NCBA Bank',
    'ABSA Bank Kenya'
  ],
  mobileNetworks: [
    'Safaricom M-Pesa',
    'Airtel Money',
    'Telkom T-Kash'
  ],
  currencies: ['KES', 'USD', 'EUR', 'UGX', 'TZS'],
  purposeCodes: [
    'Salary / Wages',
    'Supplier Payment',
    'Loan Disbursement',
    'Dividend',
    'Refund',
    'Tax Payment',
    'Other'
  ],
  rails: [
    { id: 'pesalink', name: 'PesaLink', time: '3.4s', fee: 'KES 50', success: '99.4%', recommended: true },
    { id: 'mpesa', name: 'M-Pesa STK', time: '2.1s', fee: 'KES 35', success: '99.7%', fastest: true },
    { id: 'rtgs', name: 'RTGS', time: '8.7s', fee: 'KES 200', success: '99.9%', highValue: true },
    { id: 'swift', name: 'SWIFT', time: '1-3d', fee: 'KES 2,500', success: '97.8%', international: true }
  ]
};

// Mock fetch function
const fetchInitiateTransferData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return initialMockData;
};

export const InitiateTransfer: React.FC = () => {
  const [activeType, setActiveType] = useState('single');
  const [activeReceiver, setActiveReceiver] = useState('bank');
  const [activeRail, setActiveRail] = useState('smart');
  const [modalState, setModalState] = useState<{ [key: string]: boolean }>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['initiateTransferData'],
    queryFn: fetchInitiateTransferData,
    initialData: initialMockData
  });

  const openModal = (modalId: string) => {
    setModalState(prev => ({ ...prev, [modalId]: true }));
  };

  const closeModal = (modalId: string) => {
    setModalState(prev => ({ ...prev, [modalId]: false }));
  };

  if (isLoading) {
    return (
      <div className={styles.pageRoot}>
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: 'var(--pri)' }}>
            Loading transfer data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageRoot}>
        <div className={styles.alert + ' ' + styles.alertDanger}>
          Failed to load transfer data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageRoot}>
      {/* Page Bar */}
      <div className={styles.pageBar}>
        <div>
          <div className={styles.breadcrumb}>
            <a href="#">Home</a> / <a href="#">Transactions</a> / <strong>Initiate Transfer</strong>
          </div>
          <h1 className={styles.pageTitle}>PAGE 1.2 — Initiate Transfer</h1>
          <p className={styles.pageDescription}>
            Create single, bulk, recurring or instant transfers with smart routing, compliance checks and full authorization workflow.
          </p>
        </div>
        <div className="d-flex flex-wrap" style={{ gap: 8 }}>
          <button className={styles.button + ' ' + styles.buttonSmall} onClick={() => openModal('templateModal')}>
            <i className="bi bi-file-earmark-plus"></i> Templates
          </button>
          <button className={styles.button + ' ' + styles.buttonSmall} onClick={() => openModal('bulkUploadModal')}>
            <i className="bi bi-upload"></i> Bulk Upload
          </button>
          <button className={styles.button + ' ' + styles.buttonPrimary + ' ' + styles.buttonSmall} onClick={() => openModal('newTransferModal')}>
            <i className="bi bi-plus-lg"></i> New Transfer
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Hero Stats */}
        <div className="row g-3">
          {data.heroStats.map((stat: any) => {
            let colClass = 'col-lg-3 col-md-4';
            if (stat.isAccent) colClass = 'col-lg-4';
            else if (stat.id === 2) colClass = 'col-lg-2 col-md-4 col-6';
            else if (stat.id === 3) colClass = 'col-lg-3 col-md-4 col-6';
            
            return (
              <div key={stat.id} className={colClass}>
                <div className={`${styles.card} ${stat.isAccent ? styles.cardAccent : ''}`} style={{ minHeight: 170, ...(stat.borderLeft ? { borderLeft: '3px solid var(--warning)' } : {}) }}>
                <p style={{ margin: 0, fontSize: 12, color: stat.isAccent ? 'rgba(255,255,255,0.78)' : 'var(--ink-700)' }}>
                  {stat.label} {stat.isAccent && <span style={{ color: '#86efac' }}>●</span>}
                </p>
                <div className={styles.statValue} style={{ margin: '8px 0', color: stat.isAccent ? '#fff' : 'var(--ink-900)' }}>
                  {stat.value}
                </p>
                {stat.badge && (
                  <span className={`${styles.badge} ${stat.badge.variant === 'success' ? styles.badgeSuccess : stat.badge.variant === 'warning' ? styles.badgeWarning : styles.badgeInfo}`}>
                    <i className={`bi ${stat.badge.variant === 'success' ? 'bi-check-circle' : stat.badge.variant === 'warning' ? 'bi-clock' : 'bi-lightning'}`}></i> {stat.badge.text}
                  </span>
                )}
                <p style={{ margin: '6px 0 0', fontSize: 12, color: stat.isAccent ? 'rgba(255,255,255,0.78)' : 'var(--ink-700)' }}>
                  {stat.description}
                </p>
                {stat.buttons && (
                  <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
                    {stat.buttons.map((btn: any, idx: number) => (
                      <button
                        key={idx}
                        className={`${styles.button} ${styles.buttonSmall}`}
                        style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.22)', color: '#fff' }}
                        onClick={() => openModal(btn.action + 'Modal')}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>

        {/* Transfer Type, Sender, Receiver */}
        <div className="row g-3">
          {/* Transfer Type */}
          <div className="col-lg-4">
            <div className={styles.card}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className={styles.sectionTitle}>Transfer Type</h3>
                <button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('templateModal')}>
                  Templates
                </button>
              </div>
              <div className={`${styles.pills} mb-3`}>
                {data.transferTypes.map((type: any) => (
                  <button
                    key={type.id}
                    className={`${styles.pill} ${activeType === type.id ? styles.pillActive : ''}`}
                    onClick={() => setActiveType(type.id)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              {activeType === 'single' && (
                <div>
                  <div className="form-check mb-2">
                    <input className="form-check-input" type="radio" name="transferMode" defaultChecked />
                    <label className="form-check-label">Standard (T+0 / T+1)</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="transferMode" />
                    <label className="form-check-label">Instant (Real-time)</label>
                  </div>
                </div>
              )}
              {activeType === 'bulk' && (
                <div className={styles.quickGrid}>
                  <button className={styles.quickButton} onClick={() => openModal('bulkUploadModal')}>
                    <i className="bi bi-upload me-1"></i> CSV / Excel
                  </button>
                  <button className={styles.quickButton} onClick={() => openModal('bulkUploadModal')}>
                    <i className="bi bi-file-earmark-spreadsheet me-1"></i> ISO 20022
                  </button>
                </div>
              )}
              {activeType === 'recurring' && (
                <div className="row g-2">
                  <div className="col-6">
                    <label className={styles.formLabel} style={{ fontSize: 10 }}>Frequency</label>
                    <select className={styles.formControl}>
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Quarterly</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className={styles.formLabel} style={{ fontSize: 10 }}>End Date</label>
                    <input type="date" className={styles.formControl} defaultValue="2025-12-31" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sender */}
          <div className="col-lg-4">
            <div className={styles.card}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className={styles.sectionTitle}>Sender</h3>
                <button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('addAccountModal')}>
                  + Account
                </button>
              </div>
              <div className="mb-3">
                <label className={styles.formLabel}>Source Account</label>
                <select className={styles.formControl}>
                  {data.sourceAccounts.map((account: any) => (
                    <option key={account.id}>{account.name} • {account.balance}</option>
                  ))}
                </select>
              </div>
              <div className="p-3 rounded" style={{ background: 'var(--surface-2)' }}>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Available</span>
                  <strong>KES 124,700,000</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Daily Limit</span>
                  <strong>KES 500,000,000 (24.9% used)</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Verification</span>
                  <span className={`${styles.badge} ${styles.badgeSuccess}`}>Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Receiver */}
          <div className="col-lg-4">
            <div className={styles.card}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className={styles.sectionTitle}>Receiver</h3>
                <button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('beneficiaryModal')}>
                  Address Book
                </button>
              </div>
              <div className="mb-3">
                <label className={styles.formLabel}>Beneficiary Type</label>
                <div className={styles.pills}>
                  {data.beneficiaryTypes.map((type: any) => (
                    <button
                      key={type.id}
                      className={`${styles.pill} ${activeReceiver === type.id ? styles.pillActive : ''}`}
                      onClick={() => setActiveReceiver(type.id)}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              {activeReceiver === 'bank' && (
                <div>
                  <div className="mb-2">
                    <label className={styles.formLabel}>Bank</label>
                    <select className={styles.formControl}>
                      {data.banks.map((bank: string, idx: number) => (
                        <option key={idx}>{bank}</option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-2">
                    <div className="col-7">
                      <label className={styles.formLabel}>Account Number</label>
                      <input className={styles.formControl} defaultValue="1234567890" />
                    </div>
                    <div className="col-5">
                      <label className={styles.formLabel}>Verify</label>
                      <button className={`${styles.button} ${styles.buttonSmall} w-100`} onClick={() => openModal('verifyAccountModal')}>
                        Check Name
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {activeReceiver === 'mobile' && (
                <div>
                  <div className="mb-2">
                    <label className={styles.formLabel}>Network</label>
                    <select className={styles.formControl}>
                      {data.mobileNetworks.map((network: string, idx: number) => (
                        <option key={idx}>{network}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className={styles.formLabel}>Phone Number</label>
                    <input className={styles.formControl} defaultValue="0712345678" placeholder="2547XXXXXXXX" />
                  </div>
                </div>
              )}
              {activeReceiver === 'wallet' && (
                <div className="mb-2">
                  <label className={styles.formLabel}>PayMo Wallet / PayPal</label>
                  <input className={styles.formControl} placeholder="wallet ID or email" />
                </div>
              )}
              <div className="form-check mt-2">
                <input className="form-check-input" type="checkbox" defaultChecked />
                <label className="form-check-label" style={{ fontSize: 13 }}>Save to address book</label>
              </div>
            </div>
          </div>
        </div>

        {/* Amount, Rail, Purpose */}
        <div className="row g-3">
          {/* Amount & Currency */}
          <div className="col-lg-4">
            <div className={styles.card}>
              <h3 className={`${styles.sectionTitle} mb-3`}>Amount & Currency</h3>
              <div className="row g-2 mb-3">
                <div className="col-7">
                  <label className={styles.formLabel}>Amount</label>
                  <input className={styles.formControl} defaultValue="250000" />
                </div>
                <div className="col-5">
                  <label className={styles.formLabel}>Currency</label>
                  <select className={styles.formControl}>
                    {data.currencies.map((currency: string, idx: number) => (
                      <option key={idx}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-3 rounded" style={{ background: 'var(--surface-2)', fontSize: 13 }}>
                <div className="d-flex justify-content-between mb-1">
                  <span>Platform Fee</span>
                  <strong>KES 125</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Rail Fee</span>
                  <strong>KES 50</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>FX Spread</span>
                  <strong>KES 0</strong>
                </div>
                <hr className={styles.divider} />
                <div className="d-flex justify-content-between">
                  <span style={{ fontWeight: 700 }}>Total Debit</span>
                  <strong style={{ color: 'var(--pri)' }}>KES 250,175</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Rail */}
          <div className="col-lg-4">
            <div className={styles.card}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className={styles.sectionTitle}>Payment Rail</h3>
                <button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('railCompareModal')}>
                  Compare
                </button>
              </div>
              <div className={`${styles.pills} mb-3`}>
                <button className={`${styles.pill} ${activeRail === 'smart' ? styles.pillActive : ''}`} onClick={() => setActiveRail('smart')}>
                  Smart
                </button>
                <button className={`${styles.pill} ${activeRail === 'manual' ? styles.pillActive : ''}`} onClick={() => setActiveRail('manual')}>
                  Manual
                </button>
              </div>
              {activeRail === 'smart' && (
                <div>
                  <div className="p-3 rounded mb-2" style={{ background: 'var(--success-bg)' }}>
                    <div className="d-flex justify-content-between">
                      <div>
                        <strong>PesaLink</strong>
                        <div style={{ fontSize: 11, color: '#047857' }}>Recommended • 3.4s • KES 50</div>
                      </div>
                      <span className={`${styles.badge} ${styles.badgeSuccess}`}>Best</span>
                    </div>
                  </div>
                  <div className="row g-2">
                    {data.rails.slice(0, 3).map((rail: any) => (
                      <div key={rail.id} className="col-4">
                        <div className="p-2 border rounded text-center" style={{ borderColor: rail.recommended ? 'var(--pri)' : '' }}>
                          <strong>{rail.name}</strong>
                          <div style={{ fontSize: 10, color: 'var(--ink-500)' }}>{rail.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeRail === 'manual' && (
                <select className={styles.formControl}>
                  {data.rails.map((rail: any) => (
                    <option key={rail.id}>{rail.name} ({rail.fee} • {rail.time})</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Purpose & Compliance */}
          <div className="col-lg-4">
            <div className={styles.card}>
              <h3 className={`${styles.sectionTitle} mb-3`}>Purpose & Compliance</h3>
              <div className="mb-3">
                <label className={styles.formLabel}>Purpose Code</label>
                <select className={styles.formControl}>
                  {data.purposeCodes.map((code: string, idx: number) => (
                    <option key={idx}>{code}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className={styles.formLabel}>Reference / Narration</label>
                <input className={styles.formControl} defaultValue="June 2025 Payroll - Engineering" />
              </div>
              <div className="mb-3">
                <label className={styles.formLabel}>Supporting Documents</label>
                <div className="d-flex gap-2">
                  <button className={`${styles.button} ${styles.buttonSmall}`} onClick={() => openModal('uploadDocModal')}>
                    <i className="bi bi-upload"></i> Upload
                  </button>
                </div>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" />
                <label className="form-check-label" style={{ fontSize: 13 }}>Urgent / Critical priority</label>
              </div>
            </div>
          </div>
        </div>

        {/* Authorization & Summary */}
        <div className="row g-3">
          {/* Authorization */}
          <div className="col-lg-5">
            <div className={styles.card}>
              <h3 className={`${styles.sectionTitle} mb-3`}>Authorization</h3>
              <div className="p-3 rounded mb-3" style={{ background: 'var(--surface-2)' }}>
                <div className="d-flex justify-content-between mb-1">
                  <span>Maker</span>
                  <strong>James K. (You)</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Checker</span>
                  <strong>Grace W. (Finance)</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Approver</span>
                  <strong>Peter O. (Treasury)</strong>
                </div>
              </div>
              <div className="mb-3">
                <label className={styles.formLabel}>Schedule Execution</label>
                <input type="datetime-local" className={styles.formControl} defaultValue="2025-06-27T14:00" />
              </div>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" defaultChecked />
                <label className="form-check-label" style={{ fontSize: 13 }}>Require 2FA on submit</label>
              </div>
            </div>
          </div>

          {/* Transfer Summary */}
          <div className="col-lg-7">
            <div className={styles.card}>
              <h3 className={`${styles.sectionTitle} mb-3`}>Transfer Summary</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 rounded" style={{ background: 'var(--surface-2)' }}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">From</span>
                      <strong>PayMo KES Float</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">To</span>
                      <strong>James K. Mwangi (KCB)</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Amount</span>
                      <strong>KES 250,000</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Total Debit</span>
                      <strong>KES 250,175</strong>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded" style={{ background: 'var(--success-bg)' }}>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Rail</span>
                      <strong>PesaLink</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">ETA</span>
                      <strong>3.4 seconds</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Ref</span>
                      <strong>PAY-20250627-8841</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Risk Score</span>
                      <span className={`${styles.badge} ${styles.badgeSuccess}`}>Low (12)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-check mt-3">
                <input className="form-check-input" type="checkbox" defaultChecked />
                <label className="form-check-label" style={{ fontSize: 13 }}>
                  I accept the <a href="#" onClick={(e) => { e.preventDefault(); openModal('termsModal'); }}>terms and conditions</a>
                </label>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button className={`${styles.button} ${styles.buttonAccent} flex-fill`} onClick={() => openModal('submitSuccessModal')}>
                  <i className="bi bi-check-lg"></i> Submit Transfer
                </button>
                <button className={`${styles.button} flex-fill`} onClick={() => openModal('draftSavedModal')}>
                  <i className="bi bi-save"></i> Save Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InitiateTransferModals
        modalState={modalState}
        openModal={openModal}
        closeModal={closeModal}
        data={data}
      />
    </div>
  );
};
