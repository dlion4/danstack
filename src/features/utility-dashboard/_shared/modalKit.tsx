/* ============================================================================
 * modalKit — shared modal primitives for the utility-dashboard deep-dive pages.
 * ----------------------------------------------------------------------------
 * Pure, stateless presentational helpers (MBox / Stepper / Loading / Lbl / Fld)
 * take the page's CSS-module map `s` so they render with that page's classes.
 * useModals(s, active, onClose) provides the interactive bridge that replaces
 * the legacy vanilla openModal/processAction/stepper/tab logic: loading→receipt
 * flows, multi-step wizards, tab pills, amount chips and selectable grids.
 * ========================================================================== */
import { Fragment, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type S = Record<string, string>
type Size = 'md' | 'lg' | 'xl'
interface Result { msg: string; ref?: string }

export interface MBoxProps { s: S; id: string; active: string | null; title: ReactNode; size?: Size; onClose: () => void; children: ReactNode; footer?: ReactNode }

export function MBox({ s, id, active, title, size = 'md', onClose, children, footer }: MBoxProps) {
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

export function Stepper({ s, labels, current }: { s: S; labels: string[]; current: number }) {
  return (
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
}

export const Loading = ({ s }: { s: S }) => (<div className={s.loadingOv}><div className={s.spinner} /><p className={s.loadingLabel}>Processing…</p></div>)
export const Lbl = ({ s, children }: { s: S; children: ReactNode }) => <label className={s.formLabel}>{children}</label>

interface FldP { as?: 'select' | 'textarea'; options?: string[]; defaultValue?: string; placeholder?: string; disabled?: boolean; type?: string; rows?: number }
export function Fld({ s, ...p }: { s: S } & FldP) {
  if (p.as === 'select') return <select className={s.formControl} defaultValue={p.defaultValue}>{(p.options ?? []).map((o) => <option key={o}>{o}</option>)}</select>
  if (p.as === 'textarea') return <textarea className={s.formControl} rows={p.rows ?? 3} defaultValue={p.defaultValue} placeholder={p.placeholder} />
  return <input className={s.formControl} type={p.type} defaultValue={p.defaultValue} placeholder={p.placeholder} disabled={p.disabled} />
}

export interface ChipOpt { v: string; label: string }

export function useModals(s: S, active: string | null, onClose: () => void) {
  const [results, setResults] = useState<Record<string, Result>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [flows, setFlows] = useState<Record<string, number>>({})
  const [tabs, setTabs] = useState<Record<string, string>>({})
  const [chips, setChips] = useState<Record<string, string>>({})
  const [pick, setPick] = useState<Record<string, string>>({})

  useEffect(() => {
    if (active === null) { setResults({}); setBusy(null); setFlows({}); setTabs({}); setChips({}); setPick({}) }
  }, [active])

  const doAction = (id: string, msg: string, ref?: string) => { setBusy(id); window.setTimeout(() => { setResults((p) => ({ ...p, [id]: { msg, ref } })); setBusy(null) }, 1200) }
  const confirmStep = (id: string, total: number) => { setBusy(id); window.setTimeout(() => { setBusy(null); setFlows((p) => ({ ...p, [id]: total })) }, 1200) }
  const step = (id: string) => flows[id] ?? 1
  const go = (id: string, n: number) => setFlows((p) => ({ ...p, [id]: n }))
  const tab = (k: string, d: string) => tabs[k] ?? d
  const setTab = (k: string, v: string) => setTabs((p) => ({ ...p, [k]: v }))
  const isPicked = (k: string, v: string) => pick[k] === v
  const setPicked = (k: string, v: string) => setPick((p) => ({ ...p, [k]: v }))
  const setChip = (k: string, v: string) => setChips((p) => ({ ...p, [k]: v }))
  const chip = (k: string, d = '') => chips[k] ?? d

  const receipt = (r: Result) => (
    <div className={s.receipt}>
      <div className={s.receiptIcon}><i className="bi bi-check-lg" /></div>
      <h5 style={{ fontWeight: 700, color: 'var(--pm-accent)' }}>{r.msg}</h5>
      {r.ref && <p style={{ fontSize: 12, color: 'var(--pm-muted)' }}>Ref: {r.ref}</p>}
      <div className="d-flex justify-content-center mt-3" style={{ gap: 8 }}>
        <button className={`${s.btnPm} ${s.btnSm}`}><i className="bi bi-download" /> Receipt</button>
        <button className={`${s.btnPm} ${s.btnSm}`}><i className="bi bi-whatsapp" /> Share</button>
        <button className={`${s.btnPm} ${s.btnSm}`} onClick={onClose}>Done</button>
      </div>
    </div>
  )
  const body = (id: string, content: ReactNode) => (busy === id ? <Loading s={s} /> : results[id] ? receipt(results[id]) : content)
  const stepFooter = (id: string, total: number, confirmAt: number, confirmLabel: ReactNode) => {
    const cur = step(id)
    const primary = cur >= total
      ? <button className={`${s.btnPm} ${s.btnPmP}`} onClick={onClose}>Done</button>
      : cur === confirmAt
        ? <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => confirmStep(id, total)}>{confirmLabel}</button>
        : <button className={`${s.btnPm} ${s.btnPmP}`} onClick={() => go(id, cur + 1)}>Continue <i className="bi bi-arrow-right" /></button>
    return <><button className={s.btnPm} onClick={onClose}>Cancel</button>{primary}</>
  }

  const Chips = ({ k, opts }: { k: string; opts: ChipOpt[] }) => (
    <div className={s.amountChips}>
      {opts.map((o) => (<span key={o.v} className={`${s.amountChip} ${chips[k] === o.v ? s.amountChipActive : ''}`} onClick={() => setChip(k, o.v)}>{o.label}</span>))}
    </div>
  )
  const PickedBox = ({ k, v, children }: { k: string; v: string; children: ReactNode }) => (
    <div className={`p-3 border rounded text-center ${isPicked(k, v) ? s.selectableActive : ''}`} style={{ cursor: 'pointer', fontSize: 12 }} onClick={() => setPicked(k, v)}>{children}</div>
  )
  const payMethodRadios = (name: string, opts: [string, string, string, string, boolean][] = [['M-Pesa', 'bi-phone', 'var(--pm-accent)', '0712***890', true], ['PayMo Wallet', 'bi-wallet2', 'var(--pm-primary)', 'Balance KES 24,500', false], ['Bank Transfer', 'bi-bank', 'var(--pm-info)', 'Equity ***4521', false]]) => (
    <div className="mb-3">
      {opts.map(([label, icon, color, sub, def]) => (
        <label key={label} className={`p-3 border rounded mb-2 d-flex align-items-center gap-3 ${isPicked(name, label) ? s.selectableActive : ''}`} style={{ cursor: 'pointer' }} onClick={() => setPicked(name, label)}>
          <input type="radio" name={name} defaultChecked={def} readOnly /> <i className={`bi ${icon}`} style={{ fontSize: 20, color }} />
          <div><div style={{ fontWeight: 600 }}>{label}</div><div style={{ fontSize: 11, color: 'var(--pm-muted)' }}>{sub}</div></div>
        </label>
      ))}
    </div>
  )

  return { doAction, confirmStep, step, go, tab, setTab, isPicked, setPicked, chip, setChip, busy, results, body, stepFooter, receipt, Chips, PickedBox, payMethodRadios }
}
