import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/analytics.module.css'

/* ============================================================================
   Analytics — modal layer (legacy page 1.8)
   LEGACY BRIDGE:
     openM(id)          → parent lifts `active` state into this component
     doAction(id,msg)   → `results` state; legacy showLoading spinner, then
                          body swaps to a receipt (exact legacy behavior)
     nextFlow('rb',4)   → `flow` step state + stepper (Type/Columns/Delivery/Done)
     sw(prefix,key,btn) → `tabs` state map per modal (tpanel show/hide)
     cacheAndReset()    → useEffect on close resets all of the above
   ========================================================================== */

interface ModalsProps {
  active: string | null
  onClose: () => void
  onOpen: (id: string) => void
}

type Size = 'md' | 'lg' | 'xl'
type BadgeTone = 'badgeS' | 'badgeW' | 'badgeD' | 'badgeI' | 'badgeP'

function MBox({
  id,
  active,
  title,
  size = 'md',
  onClose,
  children,
  footer,
}: {
  id: string
  active: string | null
  title: ReactNode
  size?: Size
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  if (active !== id) return null
  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modalWrap} role="dialog" aria-modal="true" aria-label={id}>
        <div className={`${styles.modalBox} ${size === 'lg' ? styles.modalBoxLg : ''} ${size === 'xl' ? styles.modalBoxXl : ''}`}>
          <div className={styles.modalHeader}>
            <h5 className={styles.modalTitle}>{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div className={styles.modalBody}>{children}</div>
          {footer && <div className={styles.modalFooter}>{footer}</div>}
        </div>
      </div>
    </>
  )
}

function BusyOverlay() {
  return (
    <div className={styles.loadingOv}>
      <div className={styles.spinner} />
      <p className={styles.loadingLabel}>Processing...</p>
    </div>
  )
}

/* ---------- LEGACY BRIDGE: file download ---------- */
function downloadFile(name: string, content: string, type = 'text/plain') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([content], { type }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}

interface Result {
  msg: string
  ref?: string
}

const RB_STEPS = ['Type', 'Columns', 'Delivery', 'Done']
const REPORT_TYPES = ['Transaction Summary', 'Failure Analysis', 'Merchant Performance', 'Category Trends', 'Custom Query']
const GROUP_OPTS = ['None', 'Bank', 'Status', 'Category', 'Merchant']
const SORT_OPTS = ['Amount (Descending)', 'Date (Newest)', 'Success Rate']
const FORMAT_OPTS = ['PDF', 'Excel (.xlsx)', 'CSV']
const DELIVERY_OPTS = ['Email (PDF attached)', 'Download link', 'WhatsApp']
const RB_COLS = ['Date & Time', 'Bank Name', 'Amount', 'Status', 'Merchant Name']
const RETRY_ATTEMPTS = ['3', '5', '7']
const RETRY_DELAYS = ['5 minutes', '15 minutes', '30 minutes']

/* abbreviated supporting modals (legacy "M10-23 … all functional") */
const QUICK_MODALS: { id: string; icon: string; title: string; body: string; action?: string; msg?: string }[] = [
  { id: 'autoRetryModal2', icon: 'bi-arrow-repeat', title: 'Auto-Retry Settings', body: 'Max attempts 3 • Delay 5 min. Adjust per merchant policy.', action: 'Save', msg: 'Settings saved.' },
  { id: 'healthCheckModal2', icon: 'bi-heart-pulse', title: 'System Health', body: 'All systems operational. Last check: 2 minutes ago.' },
  { id: 'trendModal2', icon: 'bi-graph-up', title: 'Trend Details', body: 'Peak volume day: Tuesday (KES 124.8M). Best performing hour: 10-11 AM.' },
  { id: 'merchantDrillModal2', icon: 'bi-shop', title: 'Merchant Risk', body: 'Top 3 merchants = 47% volume. Diversification score: 42/100.' },
  { id: 'categoryModal2', icon: 'bi-tags', title: 'Category Insights', body: 'Government payments: KES 892M (89.2% success). Utilities: 98.4% success.' },
  { id: 'exportModal2', icon: 'bi-download', title: 'Quick Export', body: 'Export last 30 days transactions in CSV format.', action: 'Export', msg: 'Export ready for download.' },
  { id: 'reportBuilderModal2', icon: 'bi-file-earmark-plus', title: 'Quick Report', body: 'Generate monthly reconciliation report.', action: 'Generate', msg: 'Report generated and emailed.' },
  { id: 'scheduledReportsModal2', icon: 'bi-calendar-event', title: 'Quick Schedule', body: 'Schedule weekly failure report.', action: 'Schedule', msg: 'Report scheduled successfully.' },
  { id: 'failureDrillModal2', icon: 'bi-x-circle', title: 'Quick Failure View', body: 'KRA iTax: 318 failures (52% retry success).' },
  { id: 'merchantDrillModal3', icon: 'bi-shop', title: 'Quick Merchant View', body: 'KRA concentration risk: 24.1% of volume.' },
  { id: 'trendModal3', icon: 'bi-graph-up', title: 'Quick Trend', body: 'Tuesday is the best performing day (+18%).' },
  { id: 'categoryModal3', icon: 'bi-tags', title: 'Quick Category', body: 'Government payments: KES 892M (89.2% success).' },
  { id: 'exportModal3', icon: 'bi-download', title: 'Quick Export', body: 'Export last 7 days in Excel.', action: 'Export', msg: 'Export ready.' },
  { id: 'reportBuilderModal3', icon: 'bi-file-earmark-plus', title: 'Quick Report', body: 'Generate failure analysis report.', action: 'Generate', msg: 'Report generated.' },
  { id: 'scheduledReportsModal3', icon: 'bi-calendar-event', title: 'Quick Schedule', body: 'Schedule daily summary.', action: 'Schedule', msg: 'Scheduled successfully.' },
  { id: 'failureDrillModal3', icon: 'bi-x-circle', title: 'Quick Failure', body: 'KRA iTax: 318 failures today.' },
]

export default function AnalyticsModals({ active, onClose, onOpen }: ModalsProps) {
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flow, setFlow] = useState(1) // report-builder step 1..4
  const [tabs, setTabs] = useState<Record<string, string>>({ fail: 'summary', merch: 'top', trend: 'daily' })

  useEffect(() => {
    if (active === null) {
      setResults({})
      setFlow(1)
      setBusy(null)
      setTabs({ fail: 'summary', merch: 'top', trend: 'daily' })
    }
  }, [active])

  const busyTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(busyTimer.current), [])

  /* LEGACY BRIDGE: doAction */
  const doAction = (modalId: string, msg: string, ref?: string) => {
    setBusy(modalId)
    busyTimer.current = window.setTimeout(() => {
      setResults((prev) => ({ ...prev, [modalId]: { msg, ref } }))
      setBusy(null)
    }, 1500)
  }

  /* LEGACY BRIDGE: nextFlow('rb', 4) */
  const nextFlow = () => {
    if (flow >= 4) {
      onClose()
      return
    }
    if (flow === 3) {
      setBusy('rb')
      busyTimer.current = window.setTimeout(() => {
        setFlow(4)
        setBusy(null)
      }, 1400)
      return
    }
    setFlow((s) => s + 1)
  }

  /* LEGACY BRIDGE: sw(prefix, key, btn) */
  const sw = (prefix: string, key: string) => setTabs((t) => ({ ...t, [prefix]: key }))

  const receipt = (modalId: string, r: Result) => (
    <div className={styles.receipt}>
      <div className={styles.ri}>
        <i className="bi bi-check-lg" />
      </div>
      <h5 className={styles.receiptTitle}>{r.msg}</h5>
      {r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Reference: {r.ref}</p>}
      <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
        <button
          className={`${styles.btnPm} ${styles.btnSm}`}
          onClick={() => downloadFile(`${modalId}-receipt.txt`, `${r.msg}${r.ref ? `\nReference: ${r.ref}` : ''}`)}
        >
          <i className="bi bi-download" /> Save
        </button>
        <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={onClose}>
          <i className="bi bi-share" /> Continue
        </button>
      </div>
    </div>
  )

  const actionBody = (id: string, children: ReactNode) => (
    <>
      {busy === id && <BusyOverlay />}
      {results[id] ? receipt(id, results[id]) : children}
    </>
  )

  const actionFooter = (id: string, label: string, msg: string, ref?: string, tone: 'btnPmP' | 'btnPmA' = 'btnPmP') =>
    results[id] ? (
      <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
        Done
      </button>
    ) : (
      <>
        <button className={styles.btnPm} onClick={onClose}>
          Cancel
        </button>
        <button className={`${styles.btnPm} ${styles[tone]}`} disabled={busy === id} onClick={() => doAction(id, msg, ref)}>
          {label}
        </button>
      </>
    )

  /* stepper for report builder (labeled steps) */
  const rbStepper = (
    <div className={styles.stepper}>
      {RB_STEPS.map((label, i) => {
        const n = i + 1
        const cls = n < flow ? styles.stepDone : n === flow ? styles.stepActive : ''
        return (
          <div key={label} className={styles.step} style={{ display: 'contents' }}>
            <div className={`${styles.step} ${cls}`} style={{ display: 'flex' }}>
              <div className={styles.stepN}>{n < flow ? <i className="bi bi-check" /> : n}</div>
              <div className={styles.stepL}>{label}</div>
            </div>
            {n < RB_STEPS.length && <div className={styles.stepLine} />}
          </div>
        )
      })}
    </div>
  )

  const tabBtn = (prefix: string, keyName: string, label: string) => (
    <button
      className={`${styles.pill} ${tabs[prefix] === keyName ? styles.pillActive : ''}`}
      onClick={() => sw(prefix, keyName)}
    >
      {label}
    </button>
  )

  return (
    <>
      {/* ============ M1: Report Builder (multi-step) ============ */}
      <MBox
        id="reportBuilderModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-file-earmark-plus me-2" style={{ color: 'var(--pm-purple)' }} />
            Custom Report Builder
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Cancel
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} disabled={busy === 'rb'} onClick={nextFlow}>
              {flow >= 4 ? (
                'Done'
              ) : busy === 'rb' ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" aria-hidden="true" /> Processing
                </>
              ) : (
                <>
                  Continue <i className="bi bi-arrow-right" />
                </>
              )}
            </button>
          </>
        }
      >
        {rbStepper}
        {busy === 'rb' && <BusyOverlay />}
        {flow === 1 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 1: Report Type &amp; Scope</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>Report Type</label>
                <select className={styles.fc} defaultValue={REPORT_TYPES[0]}>
                  {REPORT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Date Range</label>
                <div className="row g-2">
                  <div className="col-6">
                    <input type="date" className={styles.fc} defaultValue="2025-05-01" />
                  </div>
                  <div className="col-6">
                    <input type="date" className={styles.fc} defaultValue="2025-06-27" />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Banks Included</label>
                <select className={styles.fc} multiple defaultValue={['Equity Bank', 'Co-op Bank', 'DTB Kenya']}>
                  {['Equity Bank', 'Co-op Bank', 'DTB Kenya', 'KCB Bank', 'Standard Chartered'].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Transaction Status</label>
                <select className={styles.fc} defaultValue="All (Success + Failed)">
                  {['All (Success + Failed)', 'Success Only', 'Failed Only'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        {flow === 2 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 2: Columns &amp; Grouping</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>Columns to Include</label>
                {RB_COLS.map((c) => (
                  <div className="form-check mb-1" key={c}>
                    <input className="form-check-input" type="checkbox" defaultChecked={c !== 'Merchant Name'} id={`col-${c}`} />
                    <label className="form-check-label" htmlFor={`col-${c}`}>
                      {c}
                    </label>
                  </div>
                ))}
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Group By</label>
                <select className={styles.fc} defaultValue={GROUP_OPTS[0]}>
                  {GROUP_OPTS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
                <label className={`${styles.fl} mt-3`}>Sort By</label>
                <select className={styles.fc} defaultValue={SORT_OPTS[0]}>
                  {SORT_OPTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
        {flow === 3 && (
          <div className={styles.fstepActive}>
            <h6 style={{ fontWeight: 700 }}>Step 3: Filters &amp; Delivery</h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.fl}>Minimum Amount</label>
                <input className={styles.fc} defaultValue="10,000" />
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Maximum Amount</label>
                <input className={styles.fc} defaultValue="" />
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Delivery Format</label>
                <select className={styles.fc} defaultValue={FORMAT_OPTS[0]}>
                  {FORMAT_OPTS.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className={styles.fl}>Delivery Method</label>
                <select className={styles.fc} defaultValue={DELIVERY_OPTS[0]}>
                  {DELIVERY_OPTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className={styles.fl}>Recipients</label>
              <input className={styles.fc} defaultValue="finance@company.com, risk@company.com" />
            </div>
          </div>
        )}
        {flow >= 4 && (
          <div className={`${styles.receipt} ${styles.fstepActive}`}>
            <div className={styles.ri}>
              <i className="bi bi-check-lg" />
            </div>
            <h5 className={styles.receiptTitle}>Report Created Successfully</h5>
            <p className={styles.receiptSub}>Your custom report "Q2 Bank-to-Bank Summary" has been generated and delivered.</p>
            <div className={`${styles.summaryBox} text-start mt-3`} style={{ fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-2">
                <span className={styles.mutedSmall}>Report ID</span>
                <strong>RPT-20250627-8841</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className={styles.mutedSmall}>Records</span>
                <strong>42,891</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className={styles.mutedSmall}>Delivered</span>
                <strong>27 Jun 2025, 14:32</strong>
              </div>
            </div>
          </div>
        )}
      </MBox>

      {/* ============ M2: Export ============ */}
      <MBox
        id="exportModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-download me-2" style={{ color: 'var(--pm-primary-light)' }} />
            Export Transactions
          </>
        }
        footer={actionFooter('exportModal', 'Generate Export', 'Export generated successfully. 42,891 records ready for download.', 'EXP-20250627-9912')}
      >
        {actionBody(
          'exportModal',
          <div className="row g-3">
            <div className="col-md-6">
              <label className={styles.fl}>Date Range</label>
              <div className="row g-2">
                <div className="col-6">
                  <input type="date" className={styles.fc} defaultValue="2025-06-01" />
                </div>
                <div className="col-6">
                  <input type="date" className={styles.fc} defaultValue="2025-06-27" />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <label className={styles.fl}>Format</label>
              <select className={styles.fc} defaultValue="CSV">
                {['CSV', 'Excel (.xlsx)', 'PDF Report'].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className={styles.fl}>Banks</label>
              <select className={styles.fc} multiple defaultValue={['All Banks']}>
                {['All Banks', 'Equity', 'Co-op', 'DTB'].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className={styles.fl}>Status</label>
              <select className={styles.fc} defaultValue="All">
                {['All', 'Success Only', 'Failed Only'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className={styles.fl}>Delivery</label>
              <select className={styles.fc} defaultValue="Download now">
                {['Download now', 'Email to james.k@email.com', 'WhatsApp link'].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>,
        )}
      </MBox>

      {/* ============ M3: Failure Drill (tabs) ============ */}
      <MBox
        id="failureDrillModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-x-circle me-2" style={{ color: 'var(--pm-danger)' }} />
            Failure Root Cause Analysis
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('autoRetryModal')}>
              Configure Auto-Retry
            </button>
          </>
        }
      >
        <div className={`${styles.pills} mb-3`}>
          {tabBtn('fail', 'summary', 'Summary')}
          {tabBtn('fail', 'merchant', 'By Merchant')}
          {tabBtn('fail', 'retry', 'Retry Performance')}
        </div>
        {tabs.fail === 'summary' && (
          <div className={styles.fstepActive}>
            <div className="row g-3">
              {[
                { label: 'TOTAL FAILURES', value: '2,247', bg: 'var(--pm-danger-soft)', color: 'var(--pm-danger)', labelColor: '#fca5a5' },
                { label: 'RECOVERED VIA RETRY', value: '1,504', bg: 'var(--pm-warning-soft)', color: 'var(--pm-warning)', labelColor: '#fcd34d' },
                { label: 'PERMANENT FAIL', value: '743', bg: 'var(--pm-info-soft)', color: 'var(--pm-info)', labelColor: '#93c5fd' },
              ].map((t) => (
                <div className="col-md-4" key={t.label}>
                  <div className={styles.miniStat} style={{ background: t.bg, textAlign: 'left' }}>
                    <div style={{ fontSize: 11, color: t.labelColor, fontWeight: 700 }}>{t.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: t.color }}>{t.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tabs.fail === 'merchant' && (
          <div className={`${styles.fstepActive} table-responsive`}>
            <table className={styles.tbl}>
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Failures</th>
                  <th>Top Reason</th>
                  <th>Retry Success</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['KRA iTax', '318', 'Insufficient Funds', '52%'],
                  ['Co-op Bank', '142', 'Daily Limit', '71%'],
                  ['Equity Bank', '84', '3D Secure Timeout', '88%'],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((c, i) => (
                      <td key={i}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tabs.fail === 'retry' && (
          <div className={styles.fstepActive}>
            <div className={styles.sr}>
              <div>
                <strong>Auto-Retry Enabled</strong>
                <div className={styles.mutedSmall}>67% success rate</div>
              </div>
              <span className={`${styles.badge} ${styles.badgeS}`}>Active</span>
            </div>
            <div className={styles.sr}>
              <div>
                <strong>Manual Retry</strong>
                <div className={styles.mutedSmall}>41% success rate</div>
              </div>
              <span className={`${styles.badge} ${styles.badgeW}`}>Lower</span>
            </div>
          </div>
        )}
      </MBox>

      {/* ============ M4: Merchant Drill (tabs) ============ */}
      <MBox
        id="merchantDrillModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-shop me-2" style={{ color: 'var(--pm-warning)' }} />
            Merchant Performance &amp; Risk
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('categoryModal')}>
              Category Deep Dive
            </button>
          </>
        }
      >
        <div className={`${styles.pills} mb-3`}>
          {tabBtn('merch', 'top', 'Top Merchants')}
          {tabBtn('merch', 'risk', 'Risk Analysis')}
          {tabBtn('merch', 'loyalty', 'Loyalty')}
        </div>
        {tabs.merch === 'top' && (
          <div className={`${styles.fstepActive} table-responsive`}>
            <table className={styles.tbl}>
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Volume</th>
                  <th>Txns</th>
                  <th>Success</th>
                  <th>Avg</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { row: ['KRA iTax', 'KES 684M', '8,421', '89.2%', 'KES 81K'], risk: 'High', tone: 'badgeD' as BadgeTone },
                  { row: ['Equity Bank', 'KES 412M', '5,882', '97.1%', 'KES 70K'], risk: 'Low', tone: 'badgeS' as BadgeTone },
                  { row: ['Safaricom', 'KES 298M', '12,104', '98.4%', 'KES 25K'], risk: 'Low', tone: 'badgeS' as BadgeTone },
                ].map((m) => (
                  <tr key={m.row[0]}>
                    {m.row.map((c, i) => (
                      <td key={i}>{c}</td>
                    ))}
                    <td>
                      <span className={`${styles.badge} ${styles[m.tone]}`}>{m.risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tabs.merch === 'risk' && (
          <div className={styles.fstepActive}>
            <div className={styles.summaryBoxDanger}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>CONCENTRATION ALERT</div>
              <div style={{ fontSize: 12, color: '#fecaca' }}>
                Top 3 merchants account for 47% of total volume. Diversification recommended.
              </div>
            </div>
          </div>
        )}
        {tabs.merch === 'loyalty' && (
          <div className={styles.fstepActive}>
            {[
              { name: 'KRA iTax', sub: '4,201 repeat customers', badge: 'High Loyalty', tone: 'badgeS' as BadgeTone },
              { name: 'Equity Bank', sub: '3,882 repeat customers', badge: 'Medium Loyalty', tone: 'badgeI' as BadgeTone },
            ].map((l) => (
              <div className={styles.sr} key={l.name}>
                <div>
                  <strong>{l.name}</strong>
                  <div className={styles.mutedSmall}>{l.sub}</div>
                </div>
                <span className={`${styles.badge} ${styles[l.tone]}`}>{l.badge}</span>
              </div>
            ))}
          </div>
        )}
      </MBox>

      {/* ============ M5: Trend (tabs) ============ */}
      <MBox
        id="trendModal"
        active={active}
        size="xl"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-graph-up me-2" style={{ color: 'var(--pm-info)' }} />
            Transaction Trend Drill-down
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('reportBuilderModal')}>
              Export This View
            </button>
          </>
        }
      >
        <div className={`${styles.pills} mb-3`}>
          {tabBtn('trend', 'daily', 'Daily')}
          {tabBtn('trend', 'hourly', 'Hourly')}
          {tabBtn('trend', 'bank', 'By Bank')}
        </div>
        {tabs.trend === 'daily' && (
          <div className={styles.fstepActive}>
            <div className={styles.chartBars}>
              {[
                ['48%', 'var(--pm-info)', 'Mon'],
                ['62%', 'var(--pm-primary)', 'Tue'],
                ['71%', 'var(--pm-accent)', 'Wed'],
                ['55%', 'var(--pm-primary)', 'Thu'],
                ['88%', 'var(--pm-accent)', 'Fri'],
                ['39%', 'var(--pm-info)', 'Sat'],
                ['31%', 'var(--pm-info)', 'Sun'],
              ].map(([h, c, l]) => (
                <div key={l} className={styles.chartBar} style={{ height: h, background: c }}>
                  <span className={styles.barLabel}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tabs.trend === 'hourly' && (
          <div className={styles.fstepActive}>
            <div className={styles.summaryBox}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Peak Window</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--pm-primary-light)' }}>10:00 – 11:00 AM</div>
              <div className={styles.mutedSmall}>Average 4,821 transactions per hour</div>
            </div>
          </div>
        )}
        {tabs.trend === 'bank' && (
          <div className={`${styles.fstepActive} table-responsive`}>
            <table className={styles.tbl}>
              <thead>
                <tr>
                  <th>Bank</th>
                  <th>Volume</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { b: 'Equity Bank', v: 'KES 684M', t: '+12%', tone: 'badgeS' as BadgeTone },
                  { b: 'Co-op Bank', v: 'KES 412M', t: '+3%', tone: 'badgeI' as BadgeTone },
                  { b: 'DTB Kenya', v: 'KES 298M', t: '-8%', tone: 'badgeW' as BadgeTone },
                ].map((r) => (
                  <tr key={r.b}>
                    <td>{r.b}</td>
                    <td>{r.v}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[r.tone]}`}>{r.t}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </MBox>

      {/* ============ M6: Category ============ */}
      <MBox
        id="categoryModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-tags me-2" style={{ color: 'var(--pm-accent)' }} />
            Category Performance Analysis
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('reportBuilderModal')}>
              Create Category Report
            </button>
          </>
        }
      >
        <div className="table-responsive">
          <table className={styles.tbl}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Volume</th>
                <th>Txns</th>
                <th>Success</th>
                <th>Avg Value</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {[
                { row: ['Government Payments', 'KES 892M', '9,421', '89.2%', 'KES 94,600'], t: '+18%', tone: 'badgeS' as BadgeTone },
                { row: ['Bank Transfers', 'KES 684M', '12,884', '97.1%', 'KES 53,100'], t: '+4%', tone: 'badgeI' as BadgeTone },
                { row: ['Utilities & Airtime', 'KES 412M', '18,201', '98.4%', 'KES 22,600'], t: '+9%', tone: 'badgeS' as BadgeTone },
                { row: ['Business Payments', 'KES 298M', '1,992', '94.8%', 'KES 149,600'], t: '-6%', tone: 'badgeW' as BadgeTone },
              ].map((r) => (
                <tr key={r.row[0]}>
                  {r.row.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))}
                  <td>
                    <span className={`${styles.badge} ${styles[r.tone]}`}>{r.t}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MBox>

      {/* ============ M7: Scheduled Reports ============ */}
      <MBox
        id="scheduledReportsModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-calendar-event me-2" style={{ color: 'var(--pm-info)' }} />
            Scheduled Reports Manager
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('reportBuilderModal')}>
              Create New Schedule
            </button>
          </>
        }
      >
        {actionBody(
          'scheduledReportsModal',
          <div className="table-responsive">
            <table className={styles.tbl}>
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Frequency</th>
                  <th>Next Run</th>
                  <th>Recipients</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { row: ['Daily Transaction Summary', 'Daily 7:00 AM', '28 Jun', 'Finance (8)'], status: 'Active', tone: 'badgeS' as BadgeTone, action: 'Pause', msg: 'Report paused.' },
                  { row: ['Weekly Failure Report', 'Weekly Mon', '30 Jun', 'Risk (3)'], status: 'Active', tone: 'badgeS' as BadgeTone, action: 'Pause', msg: 'Report paused.' },
                  { row: ['Monthly Merchant Ranking', 'Monthly 1st', '01 Jul', 'Exec (5)'], status: 'Paused', tone: 'badgeW' as BadgeTone, action: 'Resume', msg: 'Report resumed.' },
                ].map((r) => (
                  <tr key={r.row[0]}>
                    {r.row.map((c, i) => (
                      <td key={i}>{c}</td>
                    ))}
                    <td>
                      <span className={`${styles.badge} ${styles[r.tone]}`}>{r.status}</span>
                    </td>
                    <td>
                      <button
                        className={`${styles.btnPm} ${styles.btnSm} ${r.action === 'Resume' ? styles.btnPmA : ''}`}
                        onClick={() => doAction('scheduledReportsModal', r.msg)}
                      >
                        {r.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        )}
      </MBox>

      {/* ============ M8: Auto Retry ============ */}
      <MBox
        id="autoRetryModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-arrow-repeat me-2" style={{ color: 'var(--pm-accent)' }} />
            Configure Auto-Retry Rules
          </>
        }
        footer={actionFooter('autoRetryModal', 'Save Rules', 'Auto-retry rules updated successfully.')}
      >
        {actionBody(
          'autoRetryModal',
          <>
            <div className="mb-3">
              <label className={styles.fl}>Enable Auto-Retry</label>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" defaultChecked aria-label="Enable auto-retry" />
              </div>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Max Retry Attempts</label>
              <select className={styles.fc} defaultValue={RETRY_ATTEMPTS[0]}>
                {RETRY_ATTEMPTS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Retry Delay</label>
              <select className={styles.fc} defaultValue={RETRY_DELAYS[0]}>
                {RETRY_DELAYS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className={styles.fl}>Apply to Merchants</label>
              <select className={styles.fc} multiple defaultValue={['KRA iTax', 'Co-op Bank']}>
                {['KRA iTax', 'Co-op Bank', 'Equity Bank'].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </>,
        )}
      </MBox>

      {/* ============ M9: Health Check ============ */}
      <MBox
        id="healthCheckModal"
        active={active}
        size="lg"
        onClose={onClose}
        title={
          <>
            <i className="bi bi-heart-pulse me-2" style={{ color: 'var(--pm-danger)' }} />
            Analytics Health Check
          </>
        }
        footer={
          <>
            <button className={styles.btnPm} onClick={onClose}>
              Close
            </button>
            <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={() => onOpen('scheduledReportsModal')}>
              View Scheduled Jobs
            </button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          {[
            { value: '96', label: 'DATA QUALITY', bg: 'var(--pm-accent-soft)', color: 'var(--pm-accent)', labelColor: '#6ee7b7', big: true },
            { value: '42.8K', label: 'RECORDS', bg: 'var(--pm-info-soft)', color: 'var(--pm-info)', labelColor: '#93c5fd' },
            { value: '2', label: 'DELAYED', bg: 'var(--pm-warning-soft)', color: 'var(--pm-warning)', labelColor: '#fcd34d' },
            { value: '4', label: 'SCHEDULED', bg: 'var(--pm-purple-soft)', color: 'var(--pm-purple)', labelColor: '#c4b5fd' },
          ].map((t) => (
            <div className="col-md-3 col-6" key={t.label}>
              <div className={styles.miniStat} style={{ background: t.bg }}>
                <div className={styles.miniStatBig} style={{ color: t.color, fontSize: t.big ? 28 : 24 }}>
                  {t.value}
                </div>
                <div className={styles.miniStatLabel} style={{ color: t.labelColor }}>
                  {t.label}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.summaryBox} style={{ fontSize: 13 }}>
          <div className="d-flex justify-content-between mb-2">
            <span>Data freshness</span>
            <strong>Real-time (last update 2 min ago)</strong>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Failed jobs</span>
            <strong>0</strong>
          </div>
          <div className="d-flex justify-content-between">
            <span>Next scheduled run</span>
            <strong>28 Jun 2025, 07:00</strong>
          </div>
        </div>
      </MBox>

      {/* ============ Attention ============ */}
      <MBox
        id="attentionModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-exclamation-circle me-2" style={{ color: 'var(--pm-warning)' }} />
            All Attention Items
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        {[
          { title: 'KRA iTax failures spike 38%', action: 'Investigate', modal: 'failureDrillModal' },
          { title: 'Report generation delayed', action: 'Retry', modal: 'scheduledReportsModal' },
          { title: 'Merchant concentration risk', action: 'Review', modal: 'merchantDrillModal' },
        ].map((a) => (
          <div className={styles.sr} key={a.title}>
            <div>
              <strong>{a.title}</strong>
            </div>
            <button className={`${styles.btnPm} ${styles.btnSm}`} onClick={() => onOpen(a.modal)}>
              {a.action}
            </button>
          </div>
        ))}
      </MBox>

      {/* ============ Notifications ============ */}
      <MBox
        id="notifModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-bell me-2" />
            Analytics Notifications (9)
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className={`${styles.summaryBoxDanger} mb-2`} style={{ fontSize: 13 }}>
          <strong>KRA iTax failure rate above threshold</strong>
          <div style={{ fontSize: 11, color: '#fecaca' }}>318 failures today</div>
        </div>
        <div className={`${styles.summaryBoxWarn} mb-2`} style={{ fontSize: 13 }}>
          <strong>Monthly report generation delayed</strong>
          <div style={{ fontSize: 11, color: '#fde68a' }}>4 hours behind schedule</div>
        </div>
        <div className={`${styles.summaryBoxInfo} mb-2`} style={{ fontSize: 13 }}>
          <strong>New high-value transaction pattern detected</strong>
          <div style={{ fontSize: 11, color: '#93c5fd' }}>12 transactions &gt; KES 5M</div>
        </div>
      </MBox>

      {/* ============ Profile ============ */}
      <MBox
        id="profileModal"
        active={active}
        onClose={onClose}
        title={
          <>
            <i className="bi bi-person-circle me-2" />
            Profile
          </>
        }
        footer={
          <button className={styles.btnPm} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className="text-center">
          <div className={`${styles.avatar} mx-auto mb-3`} style={{ width: 64, height: 64, fontSize: 24 }}>
            JK
          </div>
          <h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.k@email.com · +254 712 345 890</p>
          <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
            <div className="col-6">
              <div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}>
                <span className={styles.mutedSmall}>Reports Generated</span>
                <br />
                <strong>142 this month</strong>
              </div>
            </div>
            <div className="col-6">
              <div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}>
                <span className={styles.mutedSmall}>Data Quality</span>
                <br />
                <strong style={{ color: 'var(--pm-accent)' }}>96/100</strong>
              </div>
            </div>
          </div>
        </div>
      </MBox>

      {/* ============ M10-23: abbreviated supporting modals (all functional) ============ */}
      {QUICK_MODALS.map((m) => (
        <MBox
          key={m.id}
          id={m.id}
          active={active}
          onClose={onClose}
          title={
            <>
              <i className={`bi ${m.icon} me-2`} />
              {m.title}
            </>
          }
          footer={
            m.action ? (
              results[m.id] ? (
                <button className={`${styles.btnPm} ${styles.btnPmP}`} onClick={onClose}>
                  Done
                </button>
              ) : (
                <>
                  <button className={styles.btnPm} onClick={onClose}>
                    Cancel
                  </button>
                  <button className={`${styles.btnPm} ${styles.btnPmP}`} disabled={busy === m.id} onClick={() => doAction(m.id, m.msg ?? 'Done.')}>
                    {m.action}
                  </button>
                </>
              )
            ) : (
              <button className={styles.btnPm} onClick={onClose}>
                Close
              </button>
            )
          }
        >
          {actionBody(m.id, <p style={{ fontSize: 13 }}>{m.body}</p>)}
        </MBox>
      ))}
    </>
  )
}
