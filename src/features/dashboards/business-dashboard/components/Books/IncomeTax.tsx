import { useEffect, useState } from "react";
import {
  Calculator, Send, CheckCircle2, Loader2, TrendingDown, Percent, PiggyBank, Download,
} from "lucide-react";
import { incomeTax, installmentSchedule } from "../../dataBooks";
import { cls, downloadCSV, fmt, fmtDate, todayISO, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, Section, Stepper } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function IncomeTax({ notify, qa, onConsume }: {
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [computation, setComputation] = useState(false);
  const [payInstallment, setPayInstallment] = useState<(typeof installmentSchedule)[number] | null>(null);
  const [planner, setPlanner] = useState(false);
  const [installments, setInstallments] = useState(installmentSchedule);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "taxComputation") setComputation(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const addBacks = incomeTax.addBacks.reduce((s, a) => s + a.amount, 0);
  const deductions = incomeTax.deductions.reduce((s, a) => s + a.amount, 0);
  const taxable = incomeTax.accountingProfit + addBacks + deductions;
  const taxDue = Math.round(taxable * (incomeTax.rate / 100));
  const balance = taxDue - incomeTax.installmentsPaid;
  const effRate = Math.round((taxDue / incomeTax.accountingProfit) * 100);

  return (
    <>
      <Section
        no="4.7" sub="Your Business · Corporate Tax" id="sec-income-tax"
        title="Income Tax & Installments"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setPlanner(true)}><PiggyBank size={15} /> Tax Saving Planner</button>
            <button className="btn pm-btn-violet" onClick={() => setComputation(true)}><Calculator size={15} /> Tax Computation</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<TrendingDown size={16} />} label="Accounting profit (YTD)" value={fmt(incomeTax.accountingProfit)} delta="before tax" sub={`year end ${incomeTax.yearEnd}`} /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Calculator size={16} />} label="Taxable profit" value={fmt(taxable)} delta={`+${fmt(addBacks)} add-backs`} sub={`${fmt(Math.abs(deductions))} allowances`} /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Percent size={16} />} label="Tax @ 30%" value={fmt(taxDue)} delta={`${effRate}% effective`} sub="resident company rate" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<PiggyBank size={16} />} label="Balance to pay" value={fmt(balance)} delta={`${fmt(incomeTax.installmentsPaid)} paid`} sub="after installments" deltaTone="down" /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div><div className="pm-card-title">Tax computation — {incomeTax.yearEnd}</div><div className="pm-card-sub">Accounting profit adjusted to taxable profit</div></div>
                <button className="pm-link-btn pm-fs-12" onClick={() => setComputation(true)}>Full computation →</button>
              </div>
              <table className="table pm-report-table mb-0">
                <tbody>
                  <tr className="pm-report-bold"><td>Accounting profit before tax</td><td className="text-end">{fmt(incomeTax.accountingProfit)}</td></tr>
                  <tr><td colSpan={2} className="pm-muted pm-fs-11 pt-3">ADD BACK — non-deductible</td></tr>
                  {incomeTax.addBacks.map((a) => <tr key={a.label}><td style={{ paddingLeft: 28 }}>{a.label}</td><td className="text-end">{fmt(a.amount)}</td></tr>)}
                  <tr><td colSpan={2} className="pm-muted pm-fs-11 pt-3">LESS — capital allowances</td></tr>
                  {incomeTax.deductions.map((a) => <tr key={a.label}><td style={{ paddingLeft: 28 }}>{a.label}</td><td className="text-end t-success">({fmt(Math.abs(a.amount))})</td></tr>)}
                  <tr className="pm-report-bold pm-report-divider"><td>TAXABLE PROFIT</td><td className="text-end">{fmt(taxable)}</td></tr>
                  <tr><td>Corporate tax @ {incomeTax.rate}%</td><td className="text-end fw-bold">{fmt(taxDue)}</td></tr>
                  <tr><td>Less: installments already paid</td><td className="text-end t-success">({fmt(incomeTax.installmentsPaid)})</td></tr>
                  <tr className="pm-report-bold pm-report-divider"><td>BALANCE OF TAX PAYABLE</td><td className="text-end">{fmt(balance)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Installment schedule</div><div className="pm-card-sub">25% each — 20th of Apr, Jun, Sep & Dec</div></div>
              {installments.map((i) => (
                <div className="pm-sched-row" key={i.q}>
                  <div className="flex-grow-1">
                    <div className="fw-semibold pm-fs-13">{i.q}</div>
                    <div className="pm-muted pm-fs-11">Due {fmtDate(i.due)} · {i.pct}% of estimate</div>
                  </div>
                  <div className="text-end">
                    <b className="pm-fs-13">{fmt(i.amount)}</b>
                    <div className="mt-1">
                      {i.status === "paid" ? <Badge tone="success">Paid ✓</Badge>
                        : <button className="pm-link-btn pm-fs-11" onClick={() => setPayInstallment(i)}>Pay now →</button>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="pm-cyan-note mt-2">⚠️ Underpaying installments attracts 5% penalty + 1% monthly interest. PayMo reserves the cash automatically if you enable the tax sweep.</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── full computation modal ── */}
      <Modal open={computation} onClose={() => setComputation(false)} kicker="Corporate Tax" title="Full tax computation" subtitle={`Financial year ending ${incomeTax.yearEnd}`} size="lg"
        footer={<><button className="btn pm-btn-ghost" onClick={() => setComputation(false)}>Close</button>
          <button className="btn pm-btn-soft" onClick={() => { downloadCSV(`tax-computation-${todayISO()}.csv`, [["Line", "Amount (KES)"], ["Accounting profit", incomeTax.accountingProfit], ...incomeTax.addBacks.map((a) => [`Add back: ${a.label}`, a.amount]), ...incomeTax.deductions.map((a) => [`Deduct: ${a.label}`, a.amount]), ["Taxable profit", taxable], [`Tax @ ${incomeTax.rate}%`, taxDue], ["Installments paid", -incomeTax.installmentsPaid], ["Balance payable", balance]]); notify({ tone: "success", title: "Computation exported", body: "tax-computation.csv downloaded — hand it to your accountant." }); }}><Download size={15} /> Export</button>
          <button className="btn pm-btn-violet" onClick={() => { notify({ tone: "success", title: "Sent to accountant", body: "Grace Mwende received the computation and supporting schedules." }); setComputation(false); }}><Send size={15} /> Send to accountant</button></>}
      >
        <div className="pm-summary-card mb-3">
          <div className="pm-summary-row"><span>Effective tax rate</span><b>{effRate}%</b></div>
          <div className="pm-summary-row"><span>Statutory rate</span><b>{incomeTax.rate}% (resident company)</b></div>
          <div className="pm-summary-row"><span>Balance due on filing</span><b>{fmt(balance)}</b></div>
          <div className="pm-summary-row"><span>Return deadline</span><b>30 June 2027 (6 months after year end)</b></div>
        </div>
        <div className="pm-preview-label">Why your taxable profit differs from accounting profit</div>
        {[...incomeTax.addBacks.map((a) => ({ ...a, why: "Not allowable for tax — added back to profit" })), ...incomeTax.deductions.map((a) => ({ ...a, why: "Tax-only allowance — reduces taxable profit" }))].map((a) => (
          <div className="pm-line-view" key={a.label}>
            <div className="flex-grow-1">
              <div className="fw-semibold pm-fs-13">{a.label}</div>
              <div className="pm-muted pm-fs-11">{a.why}</div>
            </div>
            <b className={cls("pm-fs-13", a.amount < 0 ? "t-success" : "t-danger")}>{a.amount < 0 ? "−" : "+"}{fmt(Math.abs(a.amount))}</b>
          </div>
        ))}
      </Modal>

      {/* ── pay installment wizard ── */}
      <PayInstallment i={payInstallment} onClose={() => setPayInstallment(null)} notify={notify}
        onPaid={(q) => setInstallments((xs) => xs.map((x) => (x.q === q ? { ...x, status: "paid" } : x)))} />

      {/* ── tax planner ── */}
      <PlannerModal open={planner} onClose={() => setPlanner(false)} notify={notify} taxDue={taxDue} />
    </>
  );
}

/* ── pay installment ── */

function PayInstallment({ i, onClose, notify, onPaid }: {
  i: (typeof installmentSchedule)[number] | null; onClose: () => void; notify: Notify; onPaid: (q: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [source, setSource] = useState("Tax & Statutory reserve");
  const [pin, setPin] = useState("");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { if (i) { setStep(1); setPin(""); setPaying(false); setDone(false); } }, [i]);
  if (!i) return null;
  const pay = () => {
    setPaying(true);
    window.setTimeout(() => {
      setPaying(false); setDone(true);
      onPaid(i.q);
      notify({ tone: "success", title: "Installment paid", body: `${fmt(i.amount)} paid to KRA · PRN generated and filed to the audit trail.` });
    }, 1600);
  };
  return (
    <Modal open={!!i} onClose={onClose} kicker="Corporate Tax" title={`Pay ${i.q}`} hideClose={paying}
      footer={
        done ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
          : step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-violet" onClick={() => setStep(2)}>Continue →</button></>)
          : (<><button className="btn pm-btn-ghost" disabled={paying} onClick={() => setStep(1)}>← Back</button>
            <button className="btn pm-btn-violet" disabled={!pin || paying} onClick={pay}>{paying ? <><Loader2 size={15} className="pm-spin" /> Paying KRA…</> : <><Send size={15} /> Pay {fmt(i.amount)}</>}</button></>)
      }
    >
      <Stepper steps={2} current={step} labels={["Payment source", "Authorize"]} />
      {step === 1 && (
        <div>
          <div className="pm-summary-card mb-3">
            <div className="pm-summary-row"><span>Installment</span><b>{i.q}</b></div>
            <div className="pm-summary-row"><span>Amount</span><b>{fmt(i.amount)}</b></div>
            <div className="pm-summary-row"><span>Due date</span><b>{fmtDate(i.due)}</b></div>
          </div>
          <Field label="Pay from">
            <div className="pm-check-list">
              {["Tax & Statutory reserve", "KCB Current — •••• 4491", "M-Pesa Business Wallet"].map((s) => (
                <button key={s} className={cls("pm-check-list-item", source === s && "pm-check-on")} onClick={() => setSource(s)}>
                  <span className="pm-checkbox">{source === s ? "✓" : ""}</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}
      {step === 2 && (
        done ? (
          <div className="text-center py-3">
            <div className="pm-big-ic pm-big-ic-success mx-auto"><CheckCircle2 size={28} /></div>
            <h5 className="fw-bold mt-3">Paid to KRA</h5>
            <p className="pm-muted">{fmt(i.amount)} settled from {source}. Payment Registration Number filed.</p>
          </div>
        ) : (
          <div>
            <div className="pm-summary-card mb-3">
              <div className="pm-summary-row"><span>Paying</span><b>{fmt(i.amount)}</b></div>
              <div className="pm-summary-row"><span>From</span><b>{source}</b></div>
              <div className="pm-summary-row"><span>To</span><b>KRA — corporate tax installment</b></div>
            </div>
            <Field label="Enter your PIN" req><input type="password" className="form-control pm-input" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} /></Field>
          </div>
        )
      )}
    </Modal>
  );
}

/* ── tax planner ── */

function PlannerModal({ open, onClose, notify, taxDue }: {
  open: boolean; onClose: () => void; notify: Notify; taxDue: number;
}) {
  const [picks, setPicks] = useState<string[]>(["pension", "capex"]);
  const OPTIONS = [
    { id: "pension", label: "Registered pension contributions", save: 72000, note: "Up to KES 30,000/employee/month is deductible" },
    { id: "capex", label: "Bring forward equipment purchase", save: 54000, note: "Wear & tear allowance accelerates the deduction" },
    { id: "insurance", label: "Group life & WIBA cover", save: 21600, note: "Fully deductible business expense" },
    { id: "training", label: "Staff training levy claim", save: 18000, note: "NITA reimbursement plus deduction" },
    { id: "donation", label: "Donations to approved charities", save: 15000, note: "Deductible if the charity is KRA-approved" },
  ];
  const saved = OPTIONS.filter((o) => picks.includes(o.id)).reduce((s, o) => s + o.save, 0);
  return (
    <Modal open={open} onClose={onClose} kicker="Tax Planning" title="Legitimate tax-saving options" subtitle="Estimated impact on this year's corporate tax bill." size="lg"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
        <button className="btn pm-btn-violet" onClick={() => { notify({ tone: "success", title: "Plan sent to accountant", body: `${picks.length} strategies flagged · estimated saving ${fmt(saved)}. Grace will confirm eligibility.` }); onClose(); }}><Send size={15} /> Discuss with accountant</button></>}
    >
      {OPTIONS.map((o) => {
        const on = picks.includes(o.id);
        return (
          <button key={o.id} className={cls("pm-check-list-item mb-2", on && "pm-check-on")} onClick={() => setPicks((p) => (on ? p.filter((x) => x !== o.id) : [...p, o.id]))}>
            <span className="pm-checkbox">{on ? "✓" : ""}</span>
            <span className="flex-grow-1 text-start">
              <b className="pm-fs-13">{o.label}</b>
              <span className="pm-muted pm-fs-11 d-block">{o.note}</span>
            </span>
            <b className="pm-fs-13 t-success">−{fmt(o.save)}</b>
          </button>
        );
      })}
      <div className="pm-total-panel mt-2">
        <div className="pm-total-row"><span>Current tax estimate</span><b>{fmt(taxDue)}</b></div>
        <div className="pm-total-row"><span>Potential saving</span><b className="t-success">− {fmt(saved)}</b></div>
        <div className="pm-total-row pm-total-grand"><span>Revised estimate</span><b>{fmt(taxDue - saved)}</b></div>
      </div>
      <div className="pm-note mt-2">These are legitimate deductions under the Income Tax Act — always confirm eligibility with your accountant before acting.</div>
    </Modal>
  );
}
