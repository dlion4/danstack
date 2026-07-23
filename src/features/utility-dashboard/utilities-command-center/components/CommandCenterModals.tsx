import { Fragment, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../styles/utilities-command-center.module.css'

const s = styles as Record<string, string>

interface ModalsProps { active: string | null; onClose: () => void; onOpen: (id: string) => void }
type Size = 'md' | 'lg' | 'xl'
interface Result { msg: string; ref?: string }

function MBox({ id, active, title, size = 'md', onClose, children, footer }: { id: string; active: string | null; title: ReactNode; size?: Size; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  if (active !== id) return null
  return (
    <>
      <div className={s.backdrop} onClick={onClose} />
      <div className={s.modalWrap} role="dialog" aria-modal="true" aria-label={id}>
        <div className={`${s.modalContent} ${size === 'lg' ? s.modalBoxLg : size === 'xl' ? s.modalBoxXl : ''}`}>
          <div className={s.modalHeader}>
            <h5 className={s.modalTitle}>{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
          </div>
          <div className={s.modalBody}>{children}</div>
          {footer && <div className={s.modalFooter}>{footer}</div>}
        </div>
      </div>
    </>
  )
}

const Stepper = ({ labels, current }: { labels: string[]; current: number }) => (
  <div className={s.stepper}>
    {labels.map((l, i) => {
      const n = i + 1, done = n < current, act = n === current
      return (
        <Fragment key={l}>
          <div className={`${s.step} ${done ? s.stepDone : ''} ${act ? s.stepActive : ''}`}>
            <div className={s.stepNum}>{done ? <i className="bi bi-check" /> : n}</div>
            <div className={s.stepLabel}>{l}</div>
          </div>
          {i < labels.length - 1 && <div className={s.stepLine} />}
        </Fragment>
      )
    })}
  </div>
)

const Loading = () => (<div className={s.loadingOv}><div className={s.spinner} /><p className={s.loadingLabel}>Processing payment…</p></div>)

const L = ({ children }: { children: ReactNode }) => <label className={s.formLabel}>{children}</label>
interface FProps { as?: 'select' | 'textarea'; options?: string[]; defaultValue?: string; placeholder?: string; disabled?: boolean; type?: string; rows?: number }
const F = (p: FProps) => {
  if (p.as === 'select') return <select className={s.formControl} defaultValue={p.defaultValue}>{(p.options ?? []).map((o) => <option key={o}>{o}</option>)}</select>
  if (p.as === 'textarea') return <textarea className={s.formControl} rows={p.rows ?? 3} defaultValue={p.defaultValue} placeholder={p.placeholder} />
  return <input className={s.formControl} type={p.type} defaultValue={p.defaultValue} placeholder={p.placeholder} disabled={p.disabled} />
}

export default function CommandCenterModals({ active, onClose, onOpen }: ModalsProps) {
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({ payElectricity: 1, payWater: 1, addUtility: 1, bulkPay: 1 })
  const [tabs, setTabs] = useState<Record<string, string>>({})
  const [chips, setChips] = useState<Record<string, string>>({ elec: '2000', airtime: '500', token: '5000', solar: '1050' })
  const [pick, setPick] = useState<Record<string, string>>({})

  useEffect(() => {
    if (active === null) {
      setResults({}); setBusy(null)
      setFlows({ payElectricity: 1, payWater: 1, addUtility: 1, bulkPay: 1 })
      setTabs({}); setChips({ elec: '2000', airtime: '500', token: '5000', solar: '1050' }); setPick({})
    }
  }, [active])

  const doAction = (id: string, msg: string, ref?: string) => { setBusy(id); window.setTimeout(() => { setResults((p) => ({ ...p, [id]: { msg, ref } })); setBusy(null) }, 1200) }
  const confirmStep = (id: string, total: number) => { setBusy(id); window.setTimeout(() => { setBusy(null); setFlows((p) => ({ ...p, [id]: total })) }, 1200) }
  const step = (id: string) => flows[id] ?? 1
  const go = (id: string, n: number) => setFlows((p) => ({ ...p, [id]: n }))
  const tab = (k: string, d: string) => tabs[k] ?? d
  const setTab = (k: string, v: string) => setTabs((p) => ({ ...p, [k]: v }))
  const isPicked = (k: string, v: string) => pick[k] === v
  const setPicked = (k: string, v: string) => setPick((p) => ({ ...p, [k]: v }))

  const receipt = (r: Result) => (
    <div className={s.receipt}>
      <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
      <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>{r.msg}</h5>
      {r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Ref: {r.ref}</p>}
      <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
        <button className={`${s.btnPm} ${s.btnSm}`} onClick={onClose}><i className="bi bi-download" /> Receipt</button>
        <button className={`${s.btnPm} ${s.btnSm}`} onClick={onClose}><i className="bi bi-whatsapp" /> Share</button>
        <button className={`${s.btnPm} ${s.btnSm}`} onClick={onClose}><i className="bi bi-check2-all" /> Done</button>
      </div>
    </div>
  )
  const body = (id: string, content: ReactNode) => (busy === id ? <Loading /> : results[id] ? receipt(results[id]) : content)

  const Chips = ({ k, opts }: { k: string; opts: { v: string; label: string }[] }) => (
    <div className={s.amountChips}>
      {opts.map((o) => (<span key={o.v} className={`${s.amountChip} ${chips[k] === o.v ? s.amountChipActive : ''}`} onClick={() => setChips((p) => ({ ...p, [k]: o.v }))}>{o.label}</span>))}
    </div>
  )
  const PickedBox = ({ k, v, children, activeStyle }: { k: string; v: string; children: ReactNode; activeStyle?: boolean }) => (
    <div className={`p-3 border rounded text-center selectable ${isPicked(k, v) ? s.selectableActive : ''}`} style={{ cursor: 'pointer', fontSize: 12, ...(activeStyle && isPicked(k, v) ? {} : {}) }} onClick={() => setPicked(k, v)}>{children}</div>
  )

  // multi-step footer driver
  const stepFooter = (id: string, total: number, confirmAt: number, confirmLabel: ReactNode) => {
    const cur = step(id)
    const primary = cur >= total
      ? <button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>
      : cur === confirmAt
        ? <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => confirmStep(id, total)}>{confirmLabel}</button>
        : <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => go(id, cur + 1)}>Continue <i className="bi bi-arrow-right" /></button>
    return <><button className={s.btnPm} onClick={onClose}>Cancel</button>{primary}</>
  }

  const payMethodRadios = (name: string) => (
    <div className="mb-3">
      {[['M-Pesa', 'bi-phone', 'var(--pm-accent)', 'STK Push to 0712***890 · Fee: KES 0', true], ['PayMo Wallet', 'bi-wallet2', 'var(--pm-primary)', 'Balance: KES 24,500 · Fee: KES 0', false], ['Bank Transfer (Equity)', 'bi-bank', 'var(--pm-info)', 'Acc ***4521 · Fee: KES 25', false]].map(([label, icon, color, sub, def]) => (
        <label key={label as string} className={`p-3 border rounded mb-2 d-flex align-items-center gap-3 selectable ${isPicked(name, label as string) ? s.selectableActive : ''}`} style={{ cursor: 'pointer' }} onClick={() => setPicked(name, label as string)}>
          <input type="radio" name={name} defaultChecked={def as boolean} readOnly /> <i className={`bi ${icon}`} style={{ fontSize: 20, color: color as string }} />
          <div><div style={{ fontWeight: 600 }}>{label}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div>
        </label>
      ))}
    </div>
  )

  return (
    <>
      {/* 1 PAY ELECTRICITY (multi-step) */}
      <MBox id="payElectricityModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-lightning-charge text-warning me-2" />Pay Electricity Bill</>}
        footer={stepFooter('payElectricity', 4, 3, <>Pay Now <i className="bi bi-lock" /></>)}>
        {busy === 'payElectricity' ? <Loading /> : (<>
          <Stepper labels={['Meter', 'Pay', 'Confirm', 'Done']} current={step('payElectricity')} />
          {step('payElectricity') === 1 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 1: Select Meter & Type</h6>
            <div className={`${s.tabPills} mb-3`}>
              <button className={`${s.tabPill} ${tab('elecType', 'prepaid') === 'prepaid' ? s.tabPillActive : ''}`} onClick={() => setTab('elecType', 'prepaid')}>Prepaid Token</button>
              <button className={`${s.tabPill} ${tab('elecType', 'prepaid') === 'postpaid' ? s.tabPillActive : ''}`} onClick={() => setTab('elecType', 'postpaid')}>Postpaid Bill</button>
            </div>
            <div className="mb-3"><L>Meter Number</L><F as="select" defaultValue="14825739 — Home (Kilimani)" options={['14825739 — Home (Kilimani)', '22901847 — Office (Westlands)', '33741092 — Rental Unit A', '+ Add new meter']} /></div>
            <L>Amount (KES)</L>
            <div className="mb-2"><Chips k="elec" opts={[{ v: '500', label: '500' }, { v: '1000', label: '1,000' }, { v: '2000', label: '2,000' }, { v: '3000', label: '3,000' }, { v: '5000', label: '5,000' }]} /></div>
            <input type="number" className={s.formControl} value={chips.elec} onChange={(e) => setChips((p) => ({ ...p, elec: e.target.value }))} placeholder="Or enter custom amount" />
            <div className="mt-2 p-2 rounded" style={{ background: 'var(--pm-accent-soft)', fontSize: 12 }}><i className="bi bi-info-circle me-1" /> Estimated units: <strong>~142 kWh</strong> at current tariff KES 14.1/kWh</div>
          </div>)}
          {step('payElectricity') === 2 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 2: Payment Method</h6>
            {payMethodRadios('elecPay')}
            <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}>
              <div className="d-flex justify-content-between mb-1"><span>Amount</span><strong>KES {Number(chips.elec || 0).toLocaleString()}</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Fee</span><strong>KES 0</strong></div>
              <hr className={s.divider} /><div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Total</span><strong style={{ fontSize: 18, color: 'var(--pm-primary)' }}>KES {Number(chips.elec || 0).toLocaleString()}</strong></div>
            </div>
          </div>)}
          {step('payElectricity') === 3 && (<div>
            <h6 style={{ fontWeight: 700, marginBottom: 16 }}>Step 3: Confirm & Authorize</h6>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)' }}>
              <div className="row" style={{ fontSize: 13 }}>
                <div className="col-6 mb-2"><span className="text-muted">Meter</span><br /><strong>14825739</strong></div>
                <div className="col-6 mb-2"><span className="text-muted">Type</span><br /><strong>Prepaid Token</strong></div>
                <div className="col-6 mb-2"><span className="text-muted">Amount</span><br /><strong>KES {Number(chips.elec || 0).toLocaleString()}</strong></div>
                <div className="col-6 mb-2"><span className="text-muted">Method</span><br /><strong>M-Pesa</strong></div>
                <div className="col-6 mb-2"><span className="text-muted">Est. Units</span><br /><strong>~142 kWh</strong></div>
                <div className="col-6 mb-2"><span className="text-muted">Fee</span><br /><strong>KES 0</strong></div>
              </div>
            </div>
            <L>Enter M-Pesa PIN to confirm</L>
            <div className={s.pinInput}>{[0, 1, 2, 3].map((i) => <input key={i} type="password" maxLength={1} />)}</div>
            <p style={{ fontSize: 11, color: 'var(--pm-muted)', textAlign: 'center', marginTop: 8 }}>An STK Push will be sent to your phone for confirmation</p>
          </div>)}
          {step('payElectricity') === 4 && (<div className={s.receipt}>
            <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Payment Successful!</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your KPLC prepaid token has been generated</p>
            <div className="p-3 rounded mb-3" style={{ background: '#fff', textAlign: 'left', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Token Number</span><strong style={{ fontFamily: 'monospace', color: 'var(--pm-primary)' }}>4729-8301-5624-9173-8402</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Units</span><strong>141.8 kWh</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Amount Paid</span><strong>KES {Number(chips.elec || 0).toLocaleString()}.00</strong></div>
              <div className="d-flex justify-content-between mb-2"><span className="text-muted">Transaction ID</span><strong>TXN-PM-20250627-8834</strong></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Date</span><strong>27 Jun 2025, 14:32</strong></div>
            </div>
            <div className="d-flex justify-content-center" style={{ gap: 8 }}>
              <button className={`${s.btnPm} ${s.btnSm}`}><i className="bi bi-clipboard" /> Copy Token</button>
              <button className={`${s.btnPm} ${s.btnSm}`}><i className="bi bi-whatsapp" /> Share</button>
              <button className={`${s.btnPm} ${s.btnSm}`}><i className="bi bi-download" /> Receipt PDF</button>
            </div>
          </div>)}
        </>)}
      </MBox>

      {/* 2 PAY WATER (multi-step) */}
      <MBox id="payWaterModal" active={active} onClose={onClose}
        title={<><i className="bi bi-droplet text-info me-2" />Pay Water Bill</>}
        footer={stepFooter('payWater', 3, 2, <>Pay Now <i className="bi bi-lock" /></>)}>
        {busy === 'payWater' ? <Loading /> : (<>
          <Stepper labels={['Account', 'Pay', 'Done']} current={step('payWater')} />
          {step('payWater') === 1 && (<div>
            <div className="mb-3"><L>Water Provider</L><F as="select" defaultValue="Nairobi Water (NCWSC)" options={['Nairobi Water (NCWSC)', 'Mombasa Water (MOWASSCO)', 'Nakuru Water (NAWASSCO)', 'Kisumu Water (KIWASCO)']} /></div>
            <div className="mb-3"><L>Account Number</L><F defaultValue="290081" /></div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-1"><span>Account Name</span><strong>James Kamau</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Current Bill</span><strong>KES 3,200</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Due Date</span><strong style={{ color: 'var(--pm-warning)' }}>28 Jun 2025</strong></div>
              <div className="d-flex justify-content-between"><span>Previous Balance</span><strong>KES 0</strong></div>
            </div>
          </div>)}
          {step('payWater') === 2 && (<div>
            <div className="mb-3"><L>Amount to Pay</L><F defaultValue="3200" /></div>
            <div className="mb-3"><L>Payment Method</L><F as="select" options={['M-Pesa (0712***890)', 'PayMo Wallet (KES 24,500)', 'Bank Transfer (Equity ***4521)']} /></div>
            <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-1"><span>Subtotal</span><strong>KES 3,200</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Processing Fee</span><strong>KES 0</strong></div>
              <hr className={s.divider} /><div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Total</span><strong>KES 3,200</strong></div>
            </div>
          </div>)}
          {step('payWater') === 3 && (<div className={s.receipt}>
            <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Water Bill Paid!</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Payment of KES 3,200 to NCWSC confirmed</p>
            <div style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Ref: WTR-PM-20250628-4421</div>
            <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
              <button className={`${s.btnPm} ${s.btnSm}`}><i className="bi bi-download" /> Receipt</button>
              <button className={`${s.btnPm} ${s.btnSm}`}><i className="bi bi-whatsapp" /> Share</button>
            </div>
          </div>)}
        </>)}
      </MBox>

      {/* 3 PAY TV (tabbed providers) */}
      <MBox id="payTVModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-tv me-2" style={{ color: 'var(--pm-purple)' }} />TV Subscription Payment</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('payTVModal', 'TV subscription renewed successfully!', 'DSTV-PM-20250627-7712')}>Pay KES 11,500 <i className="bi bi-arrow-right" /></button></>}>
        {body('payTVModal', <>
          <div className={`${s.tabPills} mb-3`}>
            {(['dstv', 'gotv', 'startimes', 'zuku'] as const).map((t) => (<button key={t} className={`${s.tabPill} ${tab('tv', 'dstv') === t ? s.tabPillActive : ''}`} onClick={() => setTab('tv', t)}>{t === 'dstv' ? 'DSTV' : t === 'gotv' ? 'GOtv' : t === 'startimes' ? 'StarTimes' : 'Zuku'}</button>))}
          </div>
          {tab('tv', 'dstv') === 'dstv' && (<div>
            <div className="row g-3 mb-3">
              <div className="col-md-6"><L>Smartcard Number</L><F defaultValue="20491867421" /></div>
              <div className="col-md-6"><L>Account Name</L><F defaultValue="James Kamau" disabled /></div>
            </div>
            <L>Select Package</L>
            <div className="row g-2 mb-3">
              {[['Access', '1,300'], ['Family', '5,800'], ['Compact+', '11,500'], ['Premium', '18,500'], ['Compact', '8,500'], ['Lite', '650']].map(([n, p]) => (
                <div key={n} className="col-4"><PickedBox k="tvPkg" v={n}><strong>{n}</strong><br />KES {p}</PickedBox></div>
              ))}
            </div>
            <div className="row g-3">
              <div className="col-md-6"><L>Add-ons</L>
                <div className="form-check mb-1"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 13 }}>Showmax (+KES 300)</label></div>
                <div className="form-check mb-1"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 13 }}>Asian Bouquet (+KES 500)</label></div>
                <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 13 }}>Box Office Credit (KES 50)</label></div>
              </div>
              <div className="col-md-6"><L>Payment Method</L><F as="select" options={['M-Pesa (0712***890)', 'PayMo Wallet', 'Visa ***2341']} />
                <div className="form-check mt-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 12 }}>Enable auto-renewal monthly</label></div>
              </div>
            </div>
          </div>)}
          {tab('tv', 'dstv') === 'gotv' && (<div>
            <div className="mb-3"><L>GOtv IUC Number</L><F placeholder="Enter GOtv IUC number" /></div>
            <L>Select Package</L>
            <div className="row g-2 mb-3">{[['Lite', '250'], ['Value', '650'], ['Plus', '1,100'], ['Max', '1,650'], ['Supa', '2,500'], ['Supa+', '3,500']].map(([n, p]) => (<div key={n} className="col-4"><PickedBox k="tvPkg" v={`g-${n}`}><strong>{n}</strong><br />KES {p}</PickedBox></div>))}</div>
            <div className="mb-3"><L>Payment Method</L><F as="select" options={['M-Pesa', 'PayMo Wallet']} /></div>
          </div>)}
          {tab('tv', 'dstv') === 'startimes' && (<div>
            <div className="mb-3"><L>Decoder Number</L><F placeholder="Enter StarTimes decoder number" /></div>
            <div className="row g-2 mb-3">{[['Nova', '249'], ['Smart', '699'], ['Super', '1,349']].map(([n, p]) => (<div key={n} className="col-4"><PickedBox k="tvPkg" v={`s-${n}`}><strong>{n}</strong><br />KES {p}</PickedBox></div>))}</div>
            <div className="mb-3"><L>Payment Method</L><F as="select" options={['M-Pesa', 'PayMo Wallet']} /></div>
          </div>)}
          {tab('tv', 'dstv') === 'zuku' && (<div>
            <div className="mb-3"><L>Zuku Account Number</L><F placeholder="ZUKU account" /></div>
            <div className={`${s.tabPills} mb-2`}>{['TV Only', 'Internet Only', 'TV + Internet'].map((t) => (<button key={t} className={`${s.tabPill} ${tab('zukuBundle', 'TV Only') === t ? s.tabPillActive : ''}`} style={{ fontSize: 11 }} onClick={() => setTab('zukuBundle', t)}>{t}</button>))}</div>
            <div className="row g-2 mb-3">{[['Basic', '999'], ['Premium', '2,499'], ['Platinum', '3,999']].map(([n, p]) => (<div key={n} className="col-4"><PickedBox k="tvPkg" v={`z-${n}`}><strong>{n}</strong><br />KES {p}</PickedBox></div>))}</div>
            <div className="mb-3"><L>Payment Method</L><F as="select" options={['M-Pesa', 'PayMo Wallet']} /></div>
          </div>)}
        </>)}
      </MBox>

      {/* 4 PAY INTERNET (tabbed) */}
      <MBox id="payInternetModal" active={active} onClose={onClose}
        title={<><i className="bi bi-wifi text-primary me-2" />Internet Bill Payment</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('payInternetModal', 'Internet bill paid!', 'NET-PM-20250627-1198')}>Pay KES 5,999 <i className="bi bi-arrow-right" /></button></>}>
        {body('payInternetModal', <>
          <div className={`${s.tabPills} mb-3`}>{([['saf', 'Safaricom Fibre'], ['zuku', 'Zuku'], ['faiba', 'Faiba'], ['airtel', 'Airtel']] as const).map(([k, l]) => (<button key={k} className={`${s.tabPill} ${tab('inet', 'saf') === k ? s.tabPillActive : ''}`} onClick={() => setTab('inet', k)}>{l}</button>))}</div>
          {tab('inet', 'saf') === 'saf' && (<div>
            <div className="mb-3"><L>Account Number</L><F defaultValue="SF-40812" /></div>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-1"><span>Package</span><strong>Gold — 40Mbps</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Monthly Fee</span><strong>KES 5,999</strong></div>
              <div className="d-flex justify-content-between"><span>Next Due</span><strong>01 Jul 2025</strong></div>
            </div>
            <L>Upgrade Package?</L>
            <div className="row g-2 mb-3">{[['Silver 20Mbps', '3,499/mo'], ['Gold 40Mbps', '5,999/mo ✓'], ['Platinum 100Mbps', '8,999/mo'], ['Bronze 8Mbps', '2,499/mo']].map(([n, p]) => (<div key={n} className="col-6"><PickedBox k="inetPkg" v={n}><strong>{n}</strong><br />KES {p}</PickedBox></div>))}</div>
          </div>)}
          {tab('inet', 'saf') === 'zuku' && (<div><div className="mb-3"><L>Zuku Account</L><F placeholder="Enter Zuku account number" /></div><div className="mb-3"><L>Package</L><F as="select" options={['10Mbps — KES 2,500', '20Mbps — KES 3,500', '50Mbps — KES 5,500', '100Mbps — KES 7,500']} /></div></div>)}
          {tab('inet', 'saf') === 'faiba' && (<div><div className="mb-3"><L>Faiba Account</L><F placeholder="Enter Faiba number" /></div><div className="mb-3"><L>Plan</L><F as="select" options={['Fiber 15Mbps — KES 2,850', 'Fiber 30Mbps — KES 3,850', '4G Unlimited — KES 3,500']} /></div></div>)}
          {tab('inet', 'saf') === 'airtel' && (<div><div className="mb-3"><L>Airtel Account</L><F placeholder="Enter Airtel number" /></div><div className="mb-3"><L>Plan</L><F as="select" options={['Home 10Mbps — KES 2,999', 'Home 20Mbps — KES 4,499']} /></div></div>)}
          <div className="mb-3"><L>Payment Method</L><F as="select" options={['M-Pesa (0712***890)', 'PayMo Wallet (KES 24,500)', 'Bank Transfer']} /></div>
        </>)}
      </MBox>

      {/* 5 BUY AIRTIME (tabs + airtime/data toggle) */}
      <MBox id="buyAirtimeModal" active={active} onClose={onClose}
        title={<><i className="bi bi-phone text-success me-2" />Airtime & Data Top-Up</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmA}`} onClick={() => doAction('buyAirtimeModal', 'Airtime top-up successful!', 'AIR-PM-20250627-3341')}>Buy Airtime <i className="bi bi-arrow-right" /></button></>}>
        {body('buyAirtimeModal', <>
          <div className={`${s.tabPills} mb-3`}>{([['safaricom', 'Safaricom'], ['airtel', 'Airtel'], ['telkom', 'Telkom']] as const).map(([k, l]) => (<button key={k} className={`${s.tabPill} ${tab('airNet', 'safaricom') === k ? s.tabPillActive : ''}`} onClick={() => setTab('airNet', k)}>{l}</button>))}</div>
          <div className={`${s.tabPills} mb-3`} style={{ background: 'transparent', padding: 0 }}>
            <button className={`${s.tabPill} ${tab('airType', 'airtime') === 'airtime' ? s.tabPillActive : ''}`} onClick={() => setTab('airType', 'airtime')}>Airtime</button>
            <button className={`${s.tabPill} ${tab('airType', 'airtime') === 'data' ? s.tabPillActive : ''}`} onClick={() => setTab('airType', 'data')}>Data Bundles</button>
          </div>
          <div className="mb-3"><L>Phone Number</L><F defaultValue="0712 345 890" placeholder="Enter phone number" /></div>
          {tab('airType', 'airtime') === 'airtime' && (<div>
            <L>Amount (KES)</L>
            <div className="mb-2"><Chips k="airtime" opts={[{ v: '50', label: '50' }, { v: '100', label: '100' }, { v: '200', label: '200' }, { v: '500', label: '500' }, { v: '1000', label: '1,000' }, { v: '2000', label: '2,000' }]} /></div>
          </div>)}
          {tab('airType', 'airtime') === 'data' && (<div>
            <L>Select Data Bundle</L>
            <div className="row g-2">{[['1GB', '24hrs · KES 99'], ['2.5GB', '7 days · KES 300'], ['6GB', '30 days · KES 700'], ['12GB', '30 days · KES 1,000'], ['25GB', '30 days · KES 2,000'], ['50GB', '30 days · KES 3,000']].map(([n, d]) => (<div key={n} className="col-6"><PickedBox k="dataBundle" v={n}><strong>{n}</strong> · {d}</PickedBox></div>))}</div>
          </div>)}
          <div className="mt-3"><L>Payment Method</L><F as="select" options={['M-Pesa', 'PayMo Wallet']} /></div>
        </>)}
      </MBox>

      {/* 6 ORDER GAS */}
      <MBox id="orderGasModal" active={active} onClose={onClose}
        title={<><i className="bi bi-fire text-danger me-2" />Order Gas / LPG Refill</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('orderGasModal', 'Gas order placed! Delivery in 2 hours.', 'GAS-PM-20250627-5590')}>Order KES 2,850 <i className="bi bi-arrow-right" /></button></>}>
        {body('orderGasModal', <>
          <div className="mb-3"><L>Gas Provider</L><F as="select" options={['K-Gas (Paybill 100200)', 'Total Gas', 'Shell Gas', 'Hashi Energy']} /></div>
          <L>Cylinder Size</L>
          <div className="row g-2 mb-3">{[['6kg', '1,350'], ['13kg', '2,850'], ['22.5kg', '4,500']].map(([n, p]) => (<div key={n} className="col-4"><PickedBox k="gasCyl" v={n}><i className="bi bi-fuel-pump d-block mb-1" style={{ fontSize: 20 }} /><strong>{n}</strong><br />KES {p}</PickedBox></div>))}</div>
          <div className="mb-3"><L>Delivery Address</L><F defaultValue="Apt 4B, Kilimani Heights, Nairobi" /></div>
          <div className="mb-3"><L>Delivery Time</L><F as="select" options={['ASAP (within 2 hours)', 'Today Evening (4pm-7pm)', 'Tomorrow Morning (8am-12pm)', 'Tomorrow Afternoon (12pm-4pm)']} /></div>
          <div className="mb-3"><L>Payment Method</L><F as="select" options={['M-Pesa on Delivery', 'Pay Now (M-Pesa)', 'PayMo Wallet']} /></div>
        </>)}
      </MBox>

      {/* 7 ADD UTILITY (multi-step onboarding) */}
      <MBox id="addUtilityModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-plus-circle text-primary me-2" />Add New Utility Service</>}
        footer={stepFooter('addUtility', 4, 3, <>Verify & Add <i className="bi bi-check-lg" /></>)}>
        {busy === 'addUtility' ? <Loading /> : (<>
          <Stepper labels={['Category', 'Provider', 'Account', 'Verify']} current={step('addUtility')} />
          {step('addUtility') === 1 && (<div>
            <h6 style={{ fontWeight: 700 }}>Select Utility Category</h6>
            <div className="row g-2 mt-2">
              {([['Electricity', 'bi-lightning-charge', 'var(--pm-warning)'], ['Water', 'bi-droplet', 'var(--pm-info)'], ['TV', 'bi-tv', 'var(--pm-purple)'], ['Internet', 'bi-wifi', 'var(--pm-primary)'], ['Gas', 'bi-fire', 'var(--pm-danger)'], ['Airtime', 'bi-phone', 'var(--pm-accent)'], ['Solar', 'bi-sun', '#F59E0B'], ['Other', 'bi-three-dots', 'var(--pm-muted)']] as const).map(([n, ic, col]) => (
                <div key={n} className="col-4 col-md-3"><PickedBox k="utilCat" v={n}><i className={`bi ${ic} d-block mb-1`} style={{ fontSize: 24, color: col }} /><span style={{ fontSize: 12, fontWeight: 600 }}>{n}</span></PickedBox></div>
              ))}
            </div>
          </div>)}
          {step('addUtility') === 2 && (<div>
            <h6 style={{ fontWeight: 700 }}>Select Provider</h6>
            <F placeholder="Search providers..." />
            <div className="mt-3">
              {([['Kenya Power (KPLC)', 'bi-lightning-charge', 'var(--pm-warning-soft)', 'var(--pm-warning)', 'Prepaid & Postpaid · Paybill 888880'], ['M-KOPA Solar', 'bi-sun', 'var(--pm-accent-soft)', 'var(--pm-accent)', 'PAYGO Solar · Daily/Weekly payments'], ['Nairobi Water (NCWSC)', 'bi-droplet', 'var(--pm-info-soft)', 'var(--pm-info)', 'Water & Sewerage · Paybill 444400']] as const).map(([n, ic, bg, col, sub]) => (
                <div key={n} className={`p-3 border rounded mb-2 d-flex align-items-center gap-3 selectable ${isPicked('provider', n) ? s.selectableActive : ''}`} style={{ cursor: 'pointer' }} onClick={() => setPicked('provider', n)}>
                  <div className={s.iconCircle} style={{ background: bg, color: col }}><i className={`bi ${ic}`} /></div>
                  <div><strong>{n}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div>
                </div>
              ))}
            </div>
          </div>)}
          {step('addUtility') === 3 && (<div>
            <h6 style={{ fontWeight: 700 }}>Enter Account Details</h6>
            <div className="mb-3"><L>Account / Meter Number</L><F placeholder="Enter your account or meter number" /></div>
            <div className="mb-3"><L>Account Nickname</L><F placeholder="e.g., Home Electricity, Office Water" /></div>
            <div className="mb-3"><L>Account Type</L><F as="select" options={['Personal', 'Business', 'Rental Property', 'Family Member']} /></div>
            <div className="form-check mb-2"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 13 }}>Enable auto-pay for this service</label></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Send bill reminders 3 days before due</label></div>
          </div>)}
          {step('addUtility') === 4 && (<div className="text-center p-4">
            <div className={`${s.iconCircle} mx-auto mb-3`} style={{ width: 64, height: 64, fontSize: 28, background: 'var(--pm-accent-soft)', color: 'var(--pm-accent)' }}><i className="bi bi-check-lg" /></div>
            <h5 style={{ fontWeight: 700 }}>Account Verified & Added!</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Your utility account has been successfully linked to PayMo.</p>
            <div className="p-3 rounded text-start" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
              <div className="d-flex justify-content-between mb-1"><span>Provider</span><strong>Kenya Power (KPLC)</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Account</span><strong>14825739</strong></div>
              <div className="d-flex justify-content-between mb-1"><span>Name</span><strong>James Kamau</strong></div>
              <div className="d-flex justify-content-between"><span>Status</span><span className={`${s.badge} ${s.badgeS}`}>Active</span></div>
            </div>
          </div>)}
        </>)}
      </MBox>

      {/* 8 MANAGE UTILITIES (tabs) */}
      <MBox id="manageUtilitiesModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-gear me-2" />Manage Utility Accounts</>}
        footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
        <div className={`${s.tabPills} mb-3`}>{([['all', 'All Accounts'], ['edit', 'Edit Details'], ['autopay', 'Auto-Pay Rules'], ['alerts', 'Alerts']] as const).map(([k, l]) => (<button key={k} className={`${s.tabPill} ${tab('manage', 'all') === k ? s.tabPillActive : ''}`} onClick={() => setTab('manage', k)}>{l}</button>))}</div>
        {tab('manage', 'all') === 'all' && (<div>
          {([['KPLC Prepaid — Home', 'bi-lightning-charge', 'var(--pm-warning-soft)', 'var(--pm-warning)', 'Meter #14825739 · Active', false], ['NCWSC — Home', 'bi-droplet', 'var(--pm-info-soft)', 'var(--pm-info)', 'Acc #290081 · Active', false], ['DSTV — Compact Plus', 'bi-tv', 'var(--pm-purple-soft)', 'var(--pm-purple)', 'Card #20491867421 · Active', false], ['M-KOPA Solar', 'bi-sun', '#f3f4f6', 'var(--pm-muted)', 'Device #MK-44821 · Paused', true]] as const).map(([n, ic, bg, col, sub, paused]) => (
            <div key={n} className={s.onboardedService} style={paused ? { opacity: 0.6 } : {}}>
              <div className="d-flex align-items-center gap-3"><div className={s.iconCircle} style={{ background: bg, color: col }}><i className={`bi ${ic}`} /></div><div><strong>{n}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div></div>
              <div className="d-flex" style={{ gap: 4 }}>
                {paused ? <button className={`${s.btnPm} ${s.btnSm} ${s.btnPmA}`} title="Resume"><i className="bi bi-play-circle" /></button> : <><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('editServiceModal')}><i className="bi bi-pencil" /></button><button className={`${s.btnPm} ${s.btnSm}`} style={{ color: 'var(--pm-warning)' }} title="Pause"><i className="bi bi-pause-circle" /></button></>}
                <button className={`${s.btnPm} ${s.btnSm}`} style={{ color: 'var(--pm-danger)' }} title="Remove"><i className="bi bi-trash" /></button>
              </div>
            </div>
          ))}
        </div>)}
        {tab('manage', 'all') === 'edit' && (<div>
          <div className="mb-3"><L>Select Account</L><F as="select" options={['KPLC Prepaid — 14825739', 'NCWSC — 290081', 'DSTV — 20491867421']} /></div>
          <div className="mb-3"><L>Nickname</L><F defaultValue="Home Electricity" /></div>
          <div className="mb-3"><L>Category</L><F as="select" options={['Personal', 'Business', 'Rental']} /></div>
          <div className="mb-3"><L>Default Payment Method</L><F as="select" options={['M-Pesa', 'PayMo Wallet', 'Bank Transfer']} /></div>
          <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('manageUtilitiesModal', 'Account details saved!')}>Save Changes</button>
        </div>)}
        {tab('manage', 'all') === 'autopay' && (<div>
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Configure automatic payments for each linked utility.</p>
          {([['KPLC Prepaid', 'Auto-top KES 2,000 when balance below 50 units', true], ['NCWSC Water', 'Pay full bill 2 days before due date', true], ['DSTV Compact Plus', 'Monthly renewal · KES 11,500', false]] as const).map(([n, r, on]) => (
            <div key={n} className="p-3 border rounded mb-2 d-flex justify-content-between align-items-center">
              <div><strong>{n}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{r}</div></div>
              <div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" defaultChecked={on} /></div>
            </div>
          ))}
        </div>)}
        {tab('manage', 'all') === 'alerts' && (<div>
          <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Set alert preferences for each utility.</p>
          {['Bill due date reminders (3 days before)', 'Low balance alerts (electricity tokens)', 'Auto-pay failure notifications', 'Service outage alerts'].map((t, i) => (
            <div key={t} className="form-check mb-2"><input className="form-check-input" type="checkbox" defaultChecked={i !== 2} /><label className="form-check-label" style={{ fontSize: 13 }}>{t}</label></div>
          ))}
          <div className="form-check mb-3"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 13 }}>Price change notifications</label></div>
          <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('manageUtilitiesModal', 'Alert preferences saved!')}>Save Preferences</button>
        </div>)}
      </MBox>

      {/* 9 AUTO-PAY SETUP */}
      <MBox id="autoPaySetupModal" active={active} onClose={onClose}
        title={<><i className="bi bi-arrow-repeat text-primary me-2" />Setup Auto-Pay</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('autoPaySetupModal', 'Auto-pay rule created successfully!')}>Enable Auto-Pay <i className="bi bi-check-lg" /></button></>}>
        {body('autoPaySetupModal', <>
          <div className="mb-3"><L>Select Utility</L><F as="select" options={['KPLC Prepaid (14825739)', 'NCWSC Water (290081)', 'DSTV (20491867421)', 'Safaricom Fibre (SF-40812)', 'K-Gas (13kg cylinder)']} /></div>
          <div className="mb-3"><L>Payment Rule</L><F as="select" options={['Pay full bill amount', 'Fixed amount each month', 'Top-up when balance low', 'Custom amount with cap']} /></div>
          <div className="mb-3"><L>Amount (KES)</L><F defaultValue="2000" placeholder="Enter fixed amount" /></div>
          <div className="mb-3"><L>When to Pay</L><F as="select" options={['2 days before due date', 'On due date', '5 days before due date', '1st of every month', '15th of every month']} /></div>
          <div className="mb-3"><L>Funding Source Priority</L>
            {([['1', 'PayMo Wallet'], ['2', 'M-Pesa'], ['3', 'Bank (Equity)']] as const).map(([n, l]) => (<div key={n} className="p-2 border rounded mb-1 d-flex align-items-center gap-2" style={{ fontSize: 13 }}><i className="bi bi-grip-vertical text-muted" /> <span className={`${s.badge} ${s.badgeI}`}>{n}</span> {l}</div>))}
          </div>
          <div className="mb-3"><L>If Payment Fails</L><F as="select" options={['Retry 3 times, then notify me', 'Skip and notify me', 'Pause auto-pay and notify']} /></div>
          <div className="p-3 rounded" style={{ background: 'var(--pm-accent-soft)', fontSize: 12 }}><i className="bi bi-shield-check me-1" /> Smart limit: Alert me if bill exceeds <strong>KES 5,000</strong> before auto-paying</div>
        </>)}
      </MBox>

      {/* 10 BUDGET SETTINGS */}
      <MBox id="budgetSettingsModal" active={active} onClose={onClose}
        title={<><i className="bi bi-sliders me-2" />Utility Budget Settings</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('budgetSettingsModal', 'Budget settings saved!')}>Save Budgets</button></>}>
        {body('budgetSettingsModal', <>
          <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-info-soft)', fontSize: 13 }}><i className="bi bi-lightbulb me-1" /> Based on your spending history, we suggest a total monthly utility budget of <strong>KES 91,000</strong>.</div>
          {([['Electricity Budget', '20000'], ['Water Budget', '8000'], ['TV & Streaming Budget', '15000'], ['Internet Budget', '12000'], ['Gas & Energy Budget', '10000'], ['Airtime & Data Budget', '8000']] as const).map(([l, v]) => (<div key={l} className="mb-3"><L>{l}</L><F defaultValue={v} /></div>))}
          <div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)' }}><div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Total Monthly Budget</span><strong style={{ fontSize: 18, color: 'var(--pm-primary)' }}>KES 73,000</strong></div></div>
          <div className="form-check mt-3"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 13 }}>Block payments that exceed category budget</label></div>
          <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Roll over unused budget to savings</label></div>
        </>)}
      </MBox>

      {/* 11 BUY TOKEN */}
      <MBox id="buyTokenModal" active={active} onClose={onClose}
        title={<><i className="bi bi-lightning-charge text-warning me-2" />Buy KPLC Prepaid Token</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('buyTokenModal', 'KPLC Token purchased! Token: 5829-4012-7734-9981-2203', 'TKN-PM-20250627-9912')}>Buy Token KES {Number(chips.token || 0).toLocaleString()}</button></>}>
        {body('buyTokenModal', <>
          <div className="mb-3"><L>Select Meter</L><F as="select" options={['14825739 — Home (Kilimani)', '22901847 — Office (Westlands)']} /></div>
          <L>Quick Amounts</L>
          <div className="mb-3"><Chips k="token" opts={[{ v: '500', label: '500' }, { v: '1000', label: '1,000' }, { v: '2000', label: '2,000' }, { v: '3000', label: '3,000' }, { v: '5000', label: '5,000' }]} /></div>
          <input className={s.formControl} value={chips.token} onChange={(e) => setChips((p) => ({ ...p, token: e.target.value }))} placeholder="Custom amount" />
          <div className="mt-2 p-2 rounded" style={{ background: 'var(--pm-accent-soft)', fontSize: 12 }}><i className="bi bi-zap me-1" /> Est. units: <strong>~354 kWh</strong> · 3% bulk discount applied</div>
          <div className="mt-3"><L>Payment Method</L><F as="select" options={['M-Pesa (0712***890)', 'PayMo Wallet']} /></div>
        </>)}
      </MBox>

      {/* 12 HEALTH CHECK */}
      <MBox id="healthCheckModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-heart-pulse text-danger me-2" />Utility Health Check</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => onOpen('payElectricityModal')}>Pay Overdue Bills</button></>}>
        <div className="row g-3 mb-3">
          {([['87', 'HEALTH SCORE', 'var(--pm-accent-soft)', 'var(--pm-accent)', '#047857', 32], ['11/14', 'ON-TIME', 'var(--pm-info-soft)', 'var(--pm-info)', '#1D4ED8', 24], ['2', 'OVERDUE', 'var(--pm-warning-soft)', 'var(--pm-warning)', '#B45309', 24], ['5', 'AUTO-PAY', 'var(--pm-purple-soft)', 'var(--pm-purple)', '#6D28D9', 24]] as const).map(([v, l, bg, col, sub, fs]) => (
            <div key={l} className="col-md-3 col-6 text-center"><div className="p-3 rounded" style={{ background: bg }}><div style={{ fontSize: fs, fontWeight: 800, color: col, fontFamily: 'var(--pm-font-display)' }}>{v}</div><div style={{ fontSize: 11, fontWeight: 600, color: sub }}>{l}</div></div></div>
          ))}
        </div>
        <h6 style={{ fontWeight: 700 }}>Service Status</h6>
        <div className="table-responsive">
          <table className={s.table}><thead><tr><th>Service</th><th>Status</th><th>Last Payment</th><th>Issues</th></tr></thead><tbody>
            {([['bi-lightning-charge', 'var(--pm-warning)', 'KPLC Prepaid', 'badgeD', 'Overdue', '20 Jun 2025', '3 days overdue'], ['bi-droplet', 'var(--pm-info)', 'NCWSC Water', 'badgeW', 'Due Soon', '25 Jun 2025', 'Due tomorrow'], ['bi-tv', 'var(--pm-purple)', 'DSTV', 'badgeW', 'Due Soon', '24 Jun 2025', 'Expires in 2 days'], ['bi-wifi', 'var(--pm-primary)', 'Safaricom Fibre', 'badgeS', 'Healthy', '20 Jun 2025', 'None'], ['bi-phone', 'var(--pm-accent)', 'Safaricom Airtime', 'badgeS', 'Healthy', '22 Jun 2025', 'None'], ['bi-fire', 'var(--pm-danger)', 'K-Gas', 'badgeS', 'Healthy', '15 Jun 2025', 'Refill predicted in 5 days']] as const).map((r, i) => (
              <tr key={i}><td><i className={`bi ${r[0]} me-1`} style={{ color: r[1] }} /> {r[2]}</td><td><span className={`${s.badge} ${s[r[3]]}`}>{r[4]}</span></td><td>{r[5]}</td><td>{r[6]}</td></tr>
            ))}
          </tbody></table>
        </div>
        <h6 style={{ fontWeight: 700, marginTop: 16 }}><i className="bi bi-lightbulb text-warning me-1" /> Recommendations</h6>
        <ul style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>
          <li>Pay KPLC bill immediately to avoid disconnection penalty (KES 500)</li>
          <li>Enable auto-pay for DSTV to maintain uninterrupted viewing</li>
          <li>Your electricity consumption increased 12% — consider energy audit</li>
        </ul>
      </MBox>

      {/* 13 BILL INBOX */}
      <MBox id="billInboxModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-inbox me-2" />Electronic Bill Inbox</>}
        footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
        <div className={`${s.tabPills} mb-3`}>{['All (5)', 'Overdue (1)', 'Due Soon (2)', 'Upcoming (2)'].map((t) => (<button key={t} className={`${s.tabPill} ${tab('inbox', 'All (5)') === t ? s.tabPillActive : ''}`} onClick={() => setTab('inbox', t)}>{t}</button>))}</div>
        {([['var(--pm-danger)', 'bi-lightning-charge', 'var(--pm-danger-soft)', 'var(--pm-danger)', 'KPLC Postpaid — June 2025', 'Due: 24 Jun · 3 days overdue', 'var(--pm-danger)', 'KES 4,850', 'Pay Now', 'payElectricityModal', 'btnPmD'], ['var(--pm-warning)', 'bi-droplet', 'var(--pm-info-soft)', 'var(--pm-info)', 'Nairobi Water — June 2025', 'Due: 28 Jun · Due tomorrow', 'var(--pm-warning)', 'KES 3,200', 'Pay', 'payWaterModal', ''], ['var(--pm-warning)', 'bi-tv', 'var(--pm-purple-soft)', 'var(--pm-purple)', 'DSTV Compact Plus — July 2025', 'Due: 29 Jun · Expires in 2 days', 'var(--pm-ink-soft)', 'KES 11,500', 'Renew', 'payTVModal', ''], ['var(--pm-accent)', 'bi-wifi', 'var(--pm-primary-light)', '#fff', 'Safaricom Fibre — July 2025', 'Due: 01 Jul · 4 days away', 'var(--pm-ink-soft)', 'KES 5,999', 'Pay', 'payInternetModal', ''], ['var(--pm-accent)', 'bi-phone', 'var(--pm-accent-soft)', 'var(--pm-accent)', 'Safaricom Data Bundle', 'Auto-renew: 03 Jul · Monthly plan', 'var(--pm-ink-soft)', 'KES 1,000', '', '', '']] as const).map((b, i) => (
          <div key={i} className="p-3 border rounded mb-2 d-flex align-items-center gap-3" style={{ borderLeft: `3px solid ${b[0]}` }}>
            <div className={s.iconCircle} style={{ background: b[2], color: b[3] }}><i className={`bi ${b[1]}`} /></div>
            <div style={{ flex: 1 }}><strong>{b[4]}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>Due: {b[5]}</div></div>
            <div className="text-end"><strong>{b[7]}</strong><br />{b[9] ? <button className={`${s.btnPm} ${s.btnSm} ${b[10] ? s[b[10]] : ''}`} onClick={() => onOpen(b[9])}>{b[8]}</button> : <span className={`${s.badge} ${s.badgeS}`}>Auto-pay</span>}</div>
          </div>
        ))}
      </MBox>

      {/* 14 SCHEDULE PAYMENT */}
      <MBox id="schedulePaymentModal" active={active} onClose={onClose}
        title={<><i className="bi bi-calendar-event text-primary me-2" />Schedule Payment</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('schedulePaymentModal', 'Payment scheduled for 01 Jul 2025')}>Schedule Payment</button></>}>
        {body('schedulePaymentModal', <>
          <div className="mb-3"><L>Utility Service</L><F as="select" options={['KPLC Prepaid — 14825739', 'NCWSC Water — 290081', 'DSTV — 20491867421', 'Safaricom Fibre — SF-40812', 'K-Gas — 13kg']} /></div>
          <div className="mb-3"><L>Amount (KES)</L><F defaultValue="3000" /></div>
          <div className="mb-3"><L>Schedule Date</L><input type="date" className={s.formControl} defaultValue="2025-07-01" /></div>
          <div className="mb-3"><L>Frequency</L><F as="select" options={['One-time', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly']} /></div>
          <div className="mb-3"><L>Payment Method</L><F as="select" options={['M-Pesa', 'PayMo Wallet', 'Bank Transfer']} /></div>
          <div className="mb-3"><L>Reminder</L><F as="select" options={['1 day before', '3 days before', 'Same day', 'No reminder']} /></div>
        </>)}
      </MBox>

      {/* 15 RECEIPT */}
      <MBox id="receiptModal" active={active} onClose={onClose}
        title={<><i className="bi bi-receipt me-2" />Payment Receipt</>}
        footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
        <div className={s.receipt}>
          <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
          <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>Payment Confirmed</h5>
          <div className="p-3 rounded mt-3" style={{ background: '#fff', textAlign: 'left', fontSize: 13 }}>
            {([['Service', 'KPLC Prepaid Token'], ['Account', '14825739'], ['Amount', 'KES 3,000.00'], ['Units', '212.8 kWh'], ['Payment Method', 'M-Pesa'], ['Transaction ID', 'TXN-PM-20250627-8834'], ['Date & Time', '27 Jun 2025, 14:32 EAT']] as const).map(([k, v]) => (<div key={k} className="d-flex justify-content-between mb-2"><span className="text-muted">{k}</span><strong>{v}</strong></div>))}
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Token</span><strong style={{ fontFamily: 'monospace', color: 'var(--pm-primary)' }}>6738-2910-4455-8821-3307</strong></div>
          </div>
          <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
            <button className={`${s.btnPm} ${s.btnSm}`}><i className="bi bi-clipboard" /> Copy Token</button>
            <button className={`${s.btnPm} ${s.btnSm}`}><i className="bi bi-whatsapp" /> WhatsApp</button>
            <button className={`${s.btnPm} ${s.btnSm}`}><i className="bi bi-envelope" /> Email</button>
            <button className={`${s.btnPm} ${s.btnSm}`}><i className="bi bi-download" /> PDF</button>
          </div>
        </div>
      </MBox>

      {/* 16 NOTIFICATIONS */}
      <MBox id="notificationsModal" active={active} onClose={onClose}
        title={<><i className="bi bi-bell me-2" />Notifications (12)</>}
        footer={<><button className={`${s.btnPm} ${s.btnSm}`}>Mark All Read</button><button className={`${s.btnPm} ${s.btnSm}`} onClick={() => onOpen('notifPrefsModal')}><i className="bi bi-gear" /> Preferences</button><button className={s.btnPm} onClick={onClose}>Close</button></>}>
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {([['var(--pm-danger-soft)', 'bi-exclamation-triangle text-danger', 'KPLC bill overdue', ' — KES 4,850 was due on 24 Jun.', 'payElectricityModal', 'Pay now', '2 hours ago'], ['var(--pm-warning-soft)', 'bi-clock text-warning', 'Water bill due tomorrow', ' — NCWSC KES 3,200 due 28 Jun', '', '', '5 hours ago'], ['var(--pm-info-soft)', 'bi-info-circle text-info', 'DSTV renewal reminder', ' — Compact Plus expires in 2 days', '', '', '1 day ago'], ['var(--pm-accent-soft)', 'bi-check-circle text-success', 'Auto-pay successful', ' — Safaricom data bundle renewed KES 1,000', '', '', '2 days ago'], ['#fff', 'bi-graph-down text-primary', 'Spending alert', ' — Your electricity spend is 12% higher than last month', '', '', '3 days ago'], ['#fff', 'bi-stars', 'Savings tip', ' — Switch to off-peak hours for 15% electricity savings', '', '', '4 days ago']] as const).map((n, i) => (
            <div key={i} className="p-3 rounded mb-2" style={{ background: n[0], fontSize: 13, border: n[0] === '#fff' ? '1px solid var(--pm-border)' : undefined }}>
              <i className={`bi ${n[1]} me-1`} style={n[1] === 'bi-stars' ? { color: 'var(--pm-purple)' } : {}} /> <strong>{n[2]}</strong>{n[3]}
              {n[4] ? <a href="#" style={{ color: 'var(--pm-primary)' }} onClick={(e) => { e.preventDefault(); onOpen(n[4]) }}>{n[5]}</a> : null}
              <div style={{ fontSize: 11, color: 'var(--pm-muted)', marginTop: 4 }}>{n[6]}</div>
            </div>
          ))}
        </div>
      </MBox>

      {/* 17 NOTIF PREFS */}
      <MBox id="notifPrefsModal" active={active} onClose={onClose}
        title={<><i className="bi bi-gear me-2" />Notification Preferences</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('notifPrefsModal', 'Notification preferences saved!')}>Save Preferences</button></>}>
        {body('notifPrefsModal', <div className="table-responsive"><table className={s.table}><thead><tr><th>Alert Type</th><th>SMS</th><th>Push</th><th>Email</th><th>WhatsApp</th></tr></thead><tbody>
          {([['Bill Due Reminders', [1, 1, 0, 0]], ['Payment Confirmations', [1, 1, 1, 0]], ['Auto-Pay Failures', [1, 1, 1, 1]], ['Spending Alerts', [0, 1, 0, 0]], ['Price Changes', [0, 0, 1, 0]], ['Service Outages', [1, 1, 0, 0]]] as const).map((r) => (
            <tr key={r[0]}><td>{r[0]}</td>{r[1].map((c, i) => <td key={i}><input type="checkbox" defaultChecked={c === 1} /></td>)}</tr>
          ))}
        </tbody></table></div>)}
      </MBox>

      {/* 18 BULK PAY (multi-step) */}
      <MBox id="bulkPayModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-collection me-2" />Bulk Utility Payment</>}
        footer={stepFooter('bulkPay', 3, 2, <>Pay All <i className="bi bi-lock" /></>)}>
        {busy === 'bulkPay' ? <Loading /> : (<>
          <Stepper labels={['Select', 'Review', 'Done']} current={step('bulkPay')} />
          {step('bulkPay') === 1 && (<div>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>Select utilities to pay in one batch:</p>
            {([['KPLC Prepaid', '14825739', 'KES 2,000', true], ['NCWSC Water', '290081', 'KES 3,200', true], ['DSTV Compact+', '20491867421', 'KES 11,500', true], ['Safaricom Fibre', 'SF-40812', 'KES 5,999', false], ['Safaricom Airtime', '0712***890', 'KES 500', false]] as const).map(([n, a, amt, on]) => (
              <div key={n} className="form-check p-3 border rounded mb-2"><input className="form-check-input" type="checkbox" defaultChecked={on} /> <label className="form-check-label d-flex justify-content-between w-100 ms-2"><span><strong>{n}</strong> — {a}</span><span>{amt}</span></label></div>
            ))}
            <hr className={s.divider} />
            <div className="d-flex justify-content-between"><span style={{ fontWeight: 700, fontSize: 15 }}>Total Selected</span><strong style={{ fontSize: 18, color: 'var(--pm-primary)' }}>KES 16,700</strong></div>
          </div>)}
          {step('bulkPay') === 2 && (<div>
            <h6 style={{ fontWeight: 700 }}>Review & Confirm</h6>
            <div className="table-responsive"><table className={s.table}><thead><tr><th>Utility</th><th>Account</th><th>Amount</th><th>Status</th></tr></thead><tbody>
              {([['KPLC Prepaid', '14825739', 'KES 2,000'], ['NCWSC Water', '290081', 'KES 3,200'], ['DSTV', '20491867421', 'KES 11,500']] as const).map((r) => (<tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td><span className={`${s.badge} ${s.badgeI}`}>Ready</span></td></tr>))}
            </tbody></table></div>
            <div className="mt-3"><L>Payment Method for All</L><F as="select" options={['M-Pesa (0712***890)', 'PayMo Wallet']} /></div>
            <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-surface-2)' }}><div className="d-flex justify-content-between"><span style={{ fontWeight: 700 }}>Grand Total</span><strong style={{ fontSize: 20, color: 'var(--pm-primary)' }}>KES 16,700</strong></div></div>
          </div>)}
          {step('bulkPay') === 3 && (<div className={s.receipt}>
            <div className={s.receiptIcon}><i className="bi bi-check-all" /></div>
            <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>All Payments Processed!</h5>
            <p style={{ fontSize: 13, color: 'var(--pm-ink-soft)' }}>3 out of 3 payments completed successfully</p>
            <div className="table-responsive"><table className={s.table}><thead><tr><th>Utility</th><th>Amount</th><th>Status</th></tr></thead><tbody>
              {([['KPLC Prepaid', 'KES 2,000'], ['NCWSC Water', 'KES 3,200'], ['DSTV', 'KES 11,500']] as const).map((r) => (<tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td><span className={`${s.badge} ${s.badgeS}`}>Paid</span></td></tr>))}
            </tbody></table></div>
            <button className={`${s.btnPm} ${s.btnSm} mt-3`}><i className="bi bi-download" /> Download All Receipts</button>
          </div>)}
        </>)}
      </MBox>

      {/* 19 SERVICE COMPARISON */}
      <MBox id="serviceComparisonModal" active={active} size="lg" onClose={onClose}
        title={<><i className="bi bi-arrow-left-right me-2" />Internet Plan Comparison</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Close</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('serviceComparisonModal', 'Request submitted! Faiba will contact you within 24 hours.')}>Switch to Faiba</button></>}>
        {body('serviceComparisonModal', <>
          <div className="table-responsive"><table className={s.table}><thead><tr><th>Feature</th><th style={{ background: 'rgba(79,70,229,.06)' }}>Safaricom Gold (Current)</th><th>Faiba 40Mbps</th><th>Zuku 50Mbps</th></tr></thead><tbody>
            {([['Speed', '40 Mbps', '40 Mbps', '50 Mbps'], ['Monthly Cost', 'KES 5,999', 'KES 3,850', 'KES 5,500'], ['Data Cap', 'Unlimited', 'Unlimited', 'Unlimited'], ['Installation', 'Free', 'KES 1,000', 'Free'], ['Router', 'Included', 'Included', 'Included'], ['Customer Rating', '4.2/5', '4.0/5', '3.8/5'], ['Annual Savings', '—', 'KES 25,788/yr', 'KES 5,988/yr']] as const).map((r, i) => (
              <tr key={i}><td>{r[0]}</td><td style={{ background: 'rgba(79,70,229,.03)' }}><strong>{r[1]}</strong></td><td><strong style={{ color: i === 1 || i === 6 ? 'var(--pm-accent)' : undefined }}>{r[2]}</strong></td><td><strong>{r[3]}</strong></td></tr>
            ))}
          </tbody></table></div>
          <div className="p-3 rounded mt-3" style={{ background: 'var(--pm-accent-soft)', fontSize: 13 }}><i className="bi bi-stars me-1" /> <strong>AI Recommendation:</strong> Switch to Faiba 40Mbps to save KES 2,149/month with similar performance.</div>
        </>)}
      </MBox>

      {/* 20 ADD MEMBER */}
      <MBox id="addMemberModal" active={active} onClose={onClose}
        title={<><i className="bi bi-person-plus me-2" />Add Household Member</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('addMemberModal', 'Member invitation sent via SMS!')}>Send Invitation</button></>}>
        {body('addMemberModal', <>
          <div className="mb-3"><L>Full Name</L><F placeholder="Enter member name" /></div>
          <div className="mb-3"><L>Phone Number</L><F placeholder="0712 345 678" /></div>
          <div className="mb-3"><L>Email (optional)</L><F placeholder="email@example.com" /></div>
          <div className="mb-3"><L>Relationship</L><F as="select" options={['Spouse', 'Child', 'Parent', 'Sibling', 'Tenant', 'Caretaker']} /></div>
          <div className="mb-3"><L>Permission Level</L><F as="select" options={['View Only — Can view bills and history', 'Pay Bills — Can make payments up to limit', 'Full Access — Can pay, edit, manage']} /></div>
          <div className="mb-3"><L>Monthly Spending Limit (KES)</L><F defaultValue="10000" /></div>
          <div className="mb-3"><L>Assign Utilities</L>
            {['Electricity', 'Water', 'TV Subscription', 'Internet'].map((t, i) => (<div key={t} className="form-check mb-1"><input className="form-check-input" type="checkbox" defaultChecked={i < 2} /><label className="form-check-label" style={{ fontSize: 13 }}>{t}</label></div>))}
          </div>
        </>)}
      </MBox>

      {/* 21 DISPUTE */}
      <MBox id="disputeModal" active={active} onClose={onClose}
        title={<><i className="bi bi-exclamation-triangle text-warning me-2" />Report Issue / Dispute</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('disputeModal', 'Dispute submitted! Ticket #DSP-20250627-4481 created.', '')}>Submit Dispute</button></>}>
        {body('disputeModal', <>
          <div className="mb-3"><L>Transaction Reference</L><F defaultValue="NET-PM-20250620-1198" /></div>
          <div className="mb-3"><L>Issue Type</L><F as="select" options={['Payment not reflected at provider', 'Wrong amount charged', 'Double charge', 'Service not activated', 'Token not received', 'Other']} /></div>
          <div className="mb-3"><L>Description</L><F as="textarea" defaultValue="Payment of KES 5,999 for Safaricom Fibre on 20 Jun shows as pending. Service has not been renewed." /></div>
          <div className="mb-3"><L>Attach Evidence (optional)</L><input type="file" className={s.formControl} /></div>
          <div className="p-3 rounded" style={{ background: 'var(--pm-info-soft)', fontSize: 12 }}><i className="bi bi-info-circle me-1" /> Disputes are typically resolved within 24-48 hours.</div>
        </>)}
      </MBox>

      {/* 22 EXPORT REPORT */}
      <MBox id="exportReportModal" active={active} onClose={onClose}
        title={<><i className="bi bi-download me-2" />Export Utility Report</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('exportReportModal', 'Report generated and downloading...')}><i className="bi bi-download" /> Generate Report</button></>}>
        {body('exportReportModal', <>
          <div className="mb-3"><L>Report Type</L><F as="select" options={['Monthly Spending Summary', 'Transaction History', 'Budget vs Actual', 'Auto-Pay Activity', 'All Utilities Overview']} /></div>
          <div className="row g-3 mb-3"><div className="col-6"><L>From</L><input type="date" className={s.formControl} defaultValue="2025-01-01" /></div><div className="col-6"><L>To</L><input type="date" className={s.formControl} defaultValue="2025-06-27" /></div></div>
          <div className="mb-3"><L>Format</L><F as="select" options={['PDF Report', 'Excel Spreadsheet (.xlsx)', 'CSV']} /></div>
          <div className="mb-3"><L>Send to</L><F as="select" options={['Download now', 'Email (james.k@email.com)', 'WhatsApp']} /></div>
        </>)}
      </MBox>

      {/* 23 SPEND DETAIL */}
      <MBox id="spendDetailModal" active={active} onClose={onClose}
        title={<><i className="bi bi-bar-chart me-2" />Spending Breakdown — Electricity</>}
        footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
        <div className="row g-3 mb-3">
          {([['KES 18,400', 'THIS MONTH', 'var(--pm-warning-soft)', 'var(--pm-warning)', '#B45309'], ['KES 20,050', 'LAST MONTH', 'var(--pm-surface-2)', 'var(--pm-ink)', 'var(--pm-muted)'], ['-8.2%', 'CHANGE', 'var(--pm-accent-soft)', 'var(--pm-accent)', '#047857']] as const).map((c, i) => (
            <div key={i} className="col-4 text-center"><div className="p-2 rounded" style={{ background: c[2] }}><div style={{ fontSize: 20, fontWeight: 700, color: c[3] }}>{c[0]}</div><div style={{ fontSize: 10, fontWeight: 600, color: c[4] }}>{c[1]}</div></div></div>
          ))}
        </div>
        <h6 style={{ fontWeight: 700 }}>Transaction History</h6>
        <div className="table-responsive"><table className={s.table}><thead><tr><th>Date</th><th>Type</th><th>Meter</th><th>Amount</th><th>Units</th></tr></thead><tbody>
          {([['27 Jun', 'Prepaid Token', '14825739', 'KES 3,000', '212.8 kWh'], ['20 Jun', 'Prepaid Token', '14825739', 'KES 2,000', '141.8 kWh'], ['15 Jun', 'Postpaid Bill', '22901847', 'KES 8,400', '595 kWh'], ['10 Jun', 'Prepaid Token', '14825739', 'KES 3,000', '212.8 kWh'], ['02 Jun', 'Prepaid Token', '14825739', 'KES 2,000', '141.8 kWh']] as const).map((r, i) => (
            <tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td></tr>
          ))}
        </tbody></table></div>
      </MBox>

      {/* 24 PAY BILL QUICK */}
      <MBox id="payBillQuickModal" active={active} onClose={onClose}
        title={<><i className="bi bi-credit-card me-2" />Quick Bill Payment</>}
        footer={<button className={s.btnPm} onClick={onClose}>Cancel</button>}>
        <L>Select Utility to Pay</L>
        {([['bi-lightning-charge', 'var(--pm-warning-soft)', 'var(--pm-warning)', 'Electricity (KPLC)', '3 meters linked', 'payElectricityModal'], ['bi-droplet', 'var(--pm-info-soft)', 'var(--pm-info)', 'Water (NCWSC)', 'KES 3,200 due tomorrow', 'payWaterModal'], ['bi-tv', 'var(--pm-purple-soft)', 'var(--pm-purple)', 'TV Subscription', 'DSTV, GOtv, StarTimes, Zuku', 'payTVModal'], ['bi-wifi', 'var(--pm-primary)', '#fff', 'Internet & Broadband', 'Safaricom, Zuku, Faiba, Airtel', 'payInternetModal'], ['bi-phone', 'var(--pm-accent-soft)', 'var(--pm-accent)', 'Airtime & Data', 'Safaricom, Airtel, Telkom', 'buyAirtimeModal'], ['bi-fire', 'var(--pm-danger-soft)', 'var(--pm-danger)', 'Gas / LPG', 'K-Gas, Total, Shell, Hashi', 'orderGasModal']] as const).map((q) => (
          <div key={q[3]} className="p-3 border rounded mb-2 d-flex align-items-center justify-content-between" style={{ cursor: 'pointer' }} onClick={() => onOpen(q[5])}>
            <div className="d-flex align-items-center gap-3"><div className={s.iconCircle} style={{ background: q[1], color: q[2] }}><i className={`bi ${q[0]}`} /></div><div><strong>{q[3]}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{q[4]}</div></div></div>
            <i className="bi bi-chevron-right text-muted" />
          </div>
        ))}
      </MBox>

      {/* 25 TRANSACTION HISTORY */}
      <MBox id="transactionHistoryModal" active={active} size="xl" onClose={onClose}
        title={<><i className="bi bi-clock-history me-2" />Full Transaction History</>}
        footer={<><button className={s.btnPm} onClick={() => onOpen('exportReportModal')}><i className="bi bi-download" /> Export</button><button className={s.btnPm} onClick={onClose}>Close</button></>}>
        <div className="d-flex mb-3 flex-wrap" style={{ gap: 8 }}>
          <F as="select" options={['All Utilities', 'Electricity', 'Water', 'TV', 'Internet', 'Airtime', 'Gas']} />
          <F as="select" options={['Last 30 days', 'Last 90 days', 'Last 6 months', 'This year']} />
          <F as="select" options={['All Status', 'Success', 'Pending', 'Failed']} />
          <F placeholder="Search ref..." />
        </div>
        <div className="table-responsive" style={{ maxHeight: 400, overflowY: 'auto' }}><table className={s.table}><thead><tr><th>Date</th><th>Utility</th><th>Provider</th><th>Account</th><th>Amount</th><th>Method</th><th>Ref</th><th>Status</th></tr></thead><tbody>
          {([['27 Jun', 'Electricity', 'KPLC', '14825739', 'KES 3,000', 'M-Pesa', 'TXN-8834', 'badgeS', 'Success'], ['25 Jun', 'Water', 'NCWSC', '290081', 'KES 3,200', 'Wallet', 'TXN-7721', 'badgeS', 'Success'], ['24 Jun', 'TV', 'DSTV', '20491867421', 'KES 11,500', 'M-Pesa', 'TXN-6609', 'badgeS', 'Success'], ['22 Jun', 'Airtime', 'Safaricom', '0712***890', 'KES 1,000', 'M-Pesa', 'TXN-5501', 'badgeS', 'Success'], ['20 Jun', 'Internet', 'Safaricom', 'SF-40812', 'KES 5,999', 'Bank', 'TXN-4490', 'badgeW', 'Pending'], ['18 Jun', 'Gas', 'K-Gas', '13kg', 'KES 2,850', 'M-Pesa', 'TXN-3382', 'badgeS', 'Success'], ['15 Jun', 'Electricity', 'KPLC', '22901847', 'KES 8,400', 'Bank', 'TXN-2274', 'badgeS', 'Success'], ['12 Jun', 'TV', 'GOtv', 'GOT-7712', 'KES 1,650', 'M-Pesa', 'TXN-1168', 'badgeS', 'Success'], ['10 Jun', 'Electricity', 'KPLC', '14825739', 'KES 3,000', 'M-Pesa', 'TXN-0054', 'badgeS', 'Success'], ['08 Jun', 'Solar', 'M-KOPA', 'MK-44821', 'KES 150', 'M-Pesa', 'TXN-9948', 'badgeS', 'Success']] as const).map((r, i) => (
            <tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td><td>{r[6]}</td><td><span className={`${s.badge} ${s[r[7]]}`}>{r[8]}</span></td></tr>
          ))}
        </tbody></table></div>
      </MBox>

      {/* 26 EDIT SERVICE */}
      <MBox id="editServiceModal" active={active} onClose={onClose}
        title={<><i className="bi bi-pencil me-2" />Edit Utility Account</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('editServiceModal', 'Account updated successfully!')}>Save Changes</button></>}>
        {body('editServiceModal', <>
          <div className="mb-3"><L>Account Nickname</L><F defaultValue="Home Electricity — Kilimani" /></div>
          <div className="mb-3"><L>Meter / Account Number</L><F defaultValue="14825739" disabled /></div>
          <div className="mb-3"><L>Category</L><F as="select" options={['Personal', 'Business', 'Rental Property', 'Family']} /></div>
          <div className="mb-3"><L>Default Payment Method</L><F as="select" options={['M-Pesa (0712***890)', 'PayMo Wallet', 'Bank Transfer (Equity)']} /></div>
          <div className="mb-3"><L>Auto-Pay</L>
            <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>Enable auto-pay</label></div>
            <div className="mb-2"><span className={s.formLabel} style={{ textTransform: 'none', fontSize: 12 }}>Rule: Top-up KES when balance below</span><div className="d-flex" style={{ gap: 8 }}><F defaultValue="2000" /><F defaultValue="50" placeholder="units" /></div></div>
          </div>
          <div className="mb-3"><L>Reminders</L>
            <div className="form-check"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label" style={{ fontSize: 13 }}>3 days before due date</label></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" /><label className="form-check-label" style={{ fontSize: 13 }}>Low balance alert</label></div>
          </div>
        </>)}
      </MBox>

      {/* 27 PROFILE */}
      <MBox id="profileModal" active={active} onClose={onClose}
        title={<><i className="bi bi-person-circle me-2" />Profile</>}
        footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
        <div className="text-center">
          <div className={`${s.avatar} mx-auto mb-3`} style={{ width: 64, height: 64, fontSize: 24 }}>JK</div>
          <h5 style={{ fontWeight: 700, marginBottom: 2 }}>James Kamau</h5>
          <p style={{ fontSize: 13, color: 'var(--pm-muted)' }}>james.kamau@email.com · +254 712 345 890</p>
          <div className="row g-2 text-start mt-3" style={{ fontSize: 13 }}>
            {([['Member Since', 'Mar 2023'], ['Wallet Balance', 'KES 24,500'], ['Linked Utilities', '14 services'], ['Health Score', '87/100']] as const).map(([k, v], i) => (
              <div key={k} className="col-6"><div className="p-2 rounded" style={{ background: 'var(--pm-surface-2)' }}><span className="text-muted">{k}</span><br /><strong style={i === 3 ? { color: 'var(--pm-accent)' } : {}}>{v}</strong></div></div>
            ))}
          </div>
        </div>
      </MBox>

      {/* 28 ATTENTION DETAIL */}
      <MBox id="attentionDetailModal" active={active} onClose={onClose}
        title={<><i className="bi bi-exclamation-circle text-warning me-2" />All Items Requiring Attention</>}
        footer={<button className={s.btnPm} onClick={onClose}>Close</button>}>
        <div style={{ maxHeight: 450, overflowY: 'auto' }}>
          {([['var(--pm-danger)', 'KPLC bill overdue by 3 days', 'Meter #14825739 · KES 4,850 · Penalty accruing', 'Pay Now', 'payElectricityModal', 'btnPmD'], ['var(--pm-warning)', 'Water bill due tomorrow', 'NCWSC Acc #290081 · KES 3,200', 'Pay', 'payWaterModal', ''], ['var(--pm-warning)', 'DSTV expires in 2 days', 'Compact Plus · KES 11,500', 'Renew', 'payTVModal', ''], ['var(--pm-info)', 'Zuku Internet — Low data', '3.2GB remaining · Resets in 8 days', 'Top-up', 'payInternetModal', ''], ['var(--pm-purple)', 'Internet payment pending', 'Safaricom Fibre · KES 5,999 · Ref TXN-4490', 'Check', 'disputeModal', ''], ['var(--pm-accent)', 'M-KOPA Solar paused', 'Device MK-44821 · Resume to continue service', 'Resume', '', 'btnPmA']] as const).map((a, i) => (
            <div key={i} className="p-3 border rounded mb-2" style={{ borderLeft: `3px solid ${a[0]}` }}>
              <div className="d-flex justify-content-between align-items-start" style={{ gap: 8 }}>
                <div><strong>{a[1]}</strong><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{a[2]}</div></div>
                {a[4] ? <button className={`${s.btnPm} ${s.btnSm} ${a[5] ? s[a[5]] : ''}`} onClick={() => onOpen(a[4])}>{a[3]}</button> : <button className={`${s.btnPm} ${s.btnSm} ${s.btnPmA}`} onClick={() => doAction('attentionDetailModal', 'M-KOPA Solar service resumed!')}>{a[3]}</button>}
              </div>
            </div>
          ))}
        </div>
      </MBox>

      {/* 29 SOLAR MANAGEMENT */}
      <MBox id="solarManageModal" active={active} onClose={onClose}
        title={<><i className="bi bi-sun text-warning me-2" />Solar System Management</>}
        footer={<><button className={s.btnPm} onClick={onClose}>Cancel</button><button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => doAction('solarManageModal', 'Solar payment of KES 1,050 processed! System unlocked.', 'SOL-PM-20250627-2201')}>Pay & Unlock</button></>}>
        {body('solarManageModal', <>
          <div className={`${s.tabPills} mb-3`}>{['Status', 'Payments', 'Settings'].map((t) => (<button key={t} className={`${s.tabPill} ${tab('solar', 'Status') === t ? s.tabPillActive : ''}`} onClick={() => setTab('solar', t)}>{t}</button>))}</div>
          {tab('solar', 'Status') === 'Status' && (<>
            <div className="row g-3 mb-3">
              <div className="col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-warning-soft)' }}><div style={{ fontSize: 10, fontWeight: 600, color: '#B45309' }}>BATTERY</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-warning)' }}>78%</div></div></div>
              <div className="col-6"><div className="p-3 rounded text-center" style={{ background: 'var(--pm-accent-soft)' }}><div style={{ fontSize: 10, fontWeight: 600, color: '#047857' }}>PANEL</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--pm-accent)' }}>92%</div></div></div>
            </div>
            <div className="p-3 rounded mb-3" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>
              {([['Device', 'M-KOPA 600W'], ['Device ID', 'MK-44821'], ['Daily Payment', 'KES 150'], ['Days Remaining', '182 days']] as const).map(([k, v]) => (<div key={k} className="d-flex justify-content-between mb-1"><span>{k}</span><strong>{v}</strong></div>))}
              <div className="d-flex justify-content-between"><span>Status</span><strong style={{ color: 'var(--pm-warning)' }}>Paused</strong></div>
            </div>
          </>)}
          {tab('solar', 'Status') === 'Payments' && (<div className="p-3 rounded" style={{ background: 'var(--pm-surface-2)', fontSize: 13 }}>Last 3 PAYGO payments: KES 150 (08 Jun), KES 150 (07 Jun), KES 150 (06 Jun). All settled on time.</div>)}
          {tab('solar', 'Status') === 'Settings' && (<div><div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Low-battery SMS alerts</label></div><div className="form-check form-switch"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Auto PAYGO top-up</label></div></div>)}
          <div className="mb-3"><L>Make Payment</L>
            <Chips k="solar" opts={[{ v: '150', label: '1 Day (150)' }, { v: '1050', label: '1 Week (1,050)' }, { v: '4500', label: '1 Month (4,500)' }]} />
          </div>
        </>)}
      </MBox>
    </>
  )
}
