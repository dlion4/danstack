import { useEffect, useState } from "react";
import {
  Users, Wallet, ShieldCheck, Lock, Loader2, CheckCircle2, Eye, FileText, History,
} from "lucide-react";
import { employeesSeed, payrollStats } from "../../dataPay";
import { addDays, cls, fmt, fmtDate, todayISO, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, Section, Stepper, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Payroll({ notify, qa, onConsume }: {
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [wizard, setWizard] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [runs, setRuns] = useState([
    { id: "pr1", period: "February 2026", gross: 615000, net: 446200, date: addDays(todayISO(), -28), status: "completed" },
    { id: "pr2", period: "January 2026", gross: 602000, net: 438100, date: addDays(todayISO(), -58), status: "completed" },
  ]);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "payroll") setWizard(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const S = payrollStats;

  return (
    <>
      <Section
        no="2.6" sub="Money Out · Staff" id="sec-payroll"
        title="Payroll & Staff Payments"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setHistoryOpen(true)}><History size={15} /> Run History</button>
            <button className="btn pm-btn-out" onClick={() => setWizard(true)}><Users size={15} /> Run Payroll</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Users size={16} />} label="Next run" value={fmtDate(addDays(todayISO(), 6))} delta={`${S.headcount} employees`} sub="monthly cycle" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Wallet size={16} />} label="Gross payroll" value={fmt(S.gross)} delta="▲ 1.2%" sub="vs last month" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<ShieldCheck size={16} />} label="Statutory deductions" value={fmt(S.paye + S.nssf + S.shif + S.other)} delta="PAYE + NSSF + SHIF" sub="auto-filed with KRA" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Lock size={16} />} label="Net disbursement" value={fmt(S.net)} delta="KES 1.99M" sub="wallet balance — sufficient" /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div className="pm-card-title">Team snapshot</div>
                <div className="pm-card-sub">{S.headcount} employees · 3 departments · bank + M-Pesa payout</div>
              </div>
              <div className="table-responsive">
                <table className="table pm-table align-middle mb-0">
                  <thead><tr><th>Employee</th><th>Dept</th><th className="text-end">Gross</th><th className="text-end">Net</th><th>Method</th><th className="text-end" /></tr></thead>
                  <tbody>
                    {employeesSeed.map((e) => (
                      <tr key={e.id}>
                        <td className="fw-semibold pm-fs-13">{e.name}</td>
                        <td className="pm-muted pm-fs-13">{e.dept}</td>
                        <td className="text-end pm-fs-13">{fmt(e.gross)}</td>
                        <td className="text-end fw-bold pm-fs-13">{fmt(e.net)}</td>
                        <td><Badge tone={e.method === "Bank" ? "info" : "success"}>{e.method}</Badge></td>
                        <td className="text-end">
                          <button className="pm-icon-btn" onClick={() => { setHistoryOpen(false); setWizard(false); notify({ tone: "info", title: `Payslip — ${e.name}`, body: `Gross ${fmt(e.gross)} · net ${fmt(e.net)} · open the payslip from the payroll wizard.` }); }} aria-label="Payslip"><Eye size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pm-note mt-2">+ {S.headcount - employeesSeed.length} more employees · 1 employee missing bank details — will be paid via M-Pesa.</div>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div className="pm-card-title">Statutory — this cycle</div>
                <div className="pm-card-sub">Auto-filed with KRA, NSSF & SHA</div>
              </div>
              {[
                { label: "Gross pay", v: S.gross, tone: "" },
                { label: "PAYE (income tax)", v: -S.paye, tone: "t-danger" },
                { label: "NSSF", v: -S.nssf, tone: "t-danger" },
                { label: "SHIF", v: -S.shif, tone: "t-danger" },
                { label: "Other deductions", v: -S.other, tone: "t-danger" },
              ].map((r) => (
                <div className="pm-pay-stat" key={r.label}>
                  <span>{r.label}</span>
                  <b className={cls(r.v < 0 && "t-danger")}>{r.v < 0 ? "− " + fmt(-r.v) : fmt(r.v)}</b>
                </div>
              ))}
              <div className="pm-pay-net"><span>Net disbursement</span><b>{fmt(S.net)}</b></div>
              <div className="pm-toggle-row mt-2">
                <Toggle on={true} onChange={() => {}} label="Auto-file KRA P10, NSSF & SHIF returns" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      <PayrollWizard open={wizard} onClose={() => setWizard(false)} notify={notify} onRun={(net) => {
        setRuns((rs) => [{ id: "pr-" + Date.now(), period: "March 2026", gross: S.gross, net, date: todayISO(), status: "completed" }, ...rs]);
      }} />

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} kicker="Payroll" title="Run history"
        footer={<button className="btn pm-btn-ghost" onClick={() => setHistoryOpen(false)}>Close</button>}
      >
        {runs.map((r) => (
          <div className="pm-tx-row mb-2" key={r.id}>
            <div>
              <div className="fw-semibold pm-fs-13">{r.period}</div>
              <div className="pm-muted pm-fs-11">{fmtDate(r.date)} · gross {fmt(r.gross)}</div>
            </div>
            <div className="text-end">
              <b className="pm-fs-13">{fmt(r.net)} net</b>
              <div><Badge tone="success" dot>Completed</Badge></div>
            </div>
          </div>
        ))}
      </Modal>
    </>
  );
}

/* ═══════════════════════ Payroll wizard (5 steps) ═══════════════════════ */

function PayrollWizard({ open, onClose, notify, onRun }: {
  open: boolean; onClose: () => void; notify: Notify; onRun: (net: number) => void;
}) {
  const [step, setStep] = useState(1);
  const [period, setPeriod] = useState({ month: "March 2026", dept: "All departments", date: addDays(todayISO(), 6), method: "Bank + M-Pesa bulk" });
  const [payslip, setPayslip] = useState<(typeof employeesSeed)[number] | null>(null);
  const [autoFile, setAutoFile] = useState(true);
  const [fundFrom, setFundFrom] = useState("Business wallet (KES 1.99M)");
  const [pin, setPin] = useState("");
  const [auth, setAuth] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(1); setPin(""); setAuth(false); setRunning(false); setDone(false);
  }, [open]);

  const S = payrollStats;
  const needsDual = S.net > 500000;

  const execute = () => {
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      setDone(true);
      onRun(S.net);
      notify({ tone: "success", title: "Payroll executed", body: `${fmt(S.net)} disbursed to ${S.headcount} employees. P10, NSSF & SHIF returns filed.` });
    }, 1800);
  };

  return (
    <Modal open={open} onClose={onClose} kicker="Payroll Run" title="Run payroll — March 2026" size="lg" hideClose={running}
      footer={
        done ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
          : step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={() => setStep(2)}>Continue →</button></>)
          : step === 2 ? (<><button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button><button className="btn pm-btn-primary" onClick={() => setStep(3)}>Continue →</button></>)
          : step === 3 ? (<><button className="btn pm-btn-ghost" onClick={() => setStep(2)}>← Back</button><button className="btn pm-btn-primary" onClick={() => setStep(4)}>Continue →</button></>)
          : step === 4 ? (<><button className="btn pm-btn-ghost" onClick={() => setStep(3)}>← Back</button><button className="btn pm-btn-primary" onClick={() => setStep(5)}>Continue →</button></>)
          : (<><button className="btn pm-btn-ghost" disabled={running} onClick={() => setStep(4)}>← Back</button>
            <button className="btn pm-btn-out" disabled={running || !pin || !auth} onClick={execute}>
              {running ? <><Loader2 size={15} className="pm-spin" /> Disbursing…</> : <><Lock size={15} /> Execute payroll</>}
            </button></>)
      }
    >
      <Stepper steps={5} current={step} labels={["Period", "Employees", "Statutory", "Funding", "Authorize"]} />

      {step === 1 && (
        <div className="row g-3">
          <div className="col-md-6"><Field label="Month"><select className="form-select pm-input" value={period.month} onChange={(e) => setPeriod({ ...period, month: e.target.value })}><option>March 2026</option><option>February 2026</option><option>January 2026</option></select></Field></div>
          <div className="col-md-6"><Field label="Department"><select className="form-select pm-input" value={period.dept} onChange={(e) => setPeriod({ ...period, dept: e.target.value })}><option>All departments</option><option>Engineering</option><option>Sales</option><option>Operations</option><option>Finance & Admin</option></select></Field></div>
          <div className="col-md-6"><Field label="Payment date"><input type="date" className="form-control pm-input" value={period.date} onChange={(e) => setPeriod({ ...period, date: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Payout method"><select className="form-select pm-input" value={period.method} onChange={(e) => setPeriod({ ...period, method: e.target.value })}><option>Bank + M-Pesa bulk</option><option>Bank only</option><option>M-Pesa bulk only</option><option>Cheque</option></select></Field></div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="pm-wizard-hint">Review employees ({S.headcount}). Payslips generate automatically on execution.</div>
          <div className="table-responsive">
            <table className="table pm-table align-middle mb-0">
              <thead><tr><th>Employee</th><th>Dept</th><th className="text-end">Gross</th><th className="text-end">Net</th><th>Method</th><th className="text-end" /></tr></thead>
              <tbody>
                {employeesSeed.map((e) => (
                  <tr key={e.id}>
                    <td className="fw-semibold pm-fs-13">{e.name}</td>
                    <td className="pm-muted pm-fs-13">{e.dept}</td>
                    <td className="text-end pm-fs-13">{fmt(e.gross)}</td>
                    <td className="text-end fw-bold pm-fs-13">{fmt(e.net)}</td>
                    <td><Badge tone={e.method === "Bank" ? "info" : "success"}>{e.method}</Badge></td>
                    <td className="text-end"><button className="pm-link-btn pm-fs-12" onClick={() => setPayslip(e)}>Payslip →</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pm-muted pm-fs-12 mt-2">… {S.headcount - employeesSeed.length} more employees</div>
          <div className="pm-warn-chip mt-2"><FileText size={13} /> 1 employee missing bank details — will be paid via M-Pesa.</div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="pm-card mb-3">
            {[
              { label: "Gross Pay", v: S.gross, cls: "" },
              { label: "PAYE (Income Tax)", v: -S.paye, cls: "t-danger" },
              { label: "NSSF", v: -S.nssf, cls: "t-danger" },
              { label: "SHIF", v: -S.shif, cls: "t-danger" },
              { label: "Other deductions", v: -S.other, cls: "t-danger" },
            ].map((r) => (
              <div className="pm-pay-stat" key={r.label}>
                <span>{r.label}</span>
                <b className={r.cls}>{r.v < 0 ? "− " + fmt(-r.v) : fmt(r.v)}</b>
              </div>
            ))}
            <div className="pm-pay-net"><span>Net Disbursement</span><b>{fmt(S.net)}</b></div>
          </div>
          <div className="pm-toggle-row">
            <Toggle on={autoFile} onChange={setAutoFile} label="Auto-file KRA P10, NSSF & SHIF returns after execution" />
          </div>
          {autoFile && <div className="pm-cyan-note mt-1">Returns are filed to iTax, NSSF and SHA portals automatically — you'll receive confirmation receipts.</div>}
        </div>
      )}

      {step === 4 && (
        <div>
          <Field label="Fund from">
            <div className="pm-check-list">
              {[
                { id: "wallet", name: "Business wallet", bal: "KES 1.99M", ic: "🏦" },
                { id: "kcb", name: "KCB Current — •••• 4491", bal: "KES 2.41M", ic: "🏛️" },
              ].map((a) => (
                <button key={a.id} className={cls("pm-check-list-item", fundFrom.startsWith(a.name) && "pm-check-on")} onClick={() => setFundFrom(a.name)}>
                  <span className="pm-checkbox">{fundFrom.startsWith(a.name) ? "✓" : ""}</span>
                  <span>{a.ic}</span>
                  <span className="flex-grow-1 text-start"><b className="pm-fs-13">{a.name}</b><span className="pm-muted pm-fs-11 d-block">{a.bal}</span></span>
                </button>
              ))}
            </div>
          </Field>
          <div className="pm-cyan-note">This run is in KES — no FX conversion required.</div>
          <div className="pm-summary-card mt-3">
            <div className="pm-summary-row"><span>Balance after run</span><b>{fmt(1990000 - S.net)}</b></div>
            <div className="pm-summary-row"><span>Net disbursement</span><b>{fmt(S.net)}</b></div>
          </div>
        </div>
      )}

      {step === 5 && (
        done ? (
          <div className="text-center py-3">
            <div className="pm-big-ic pm-big-ic-success mx-auto"><CheckCircle2 size={28} /></div>
            <h5 className="fw-bold mt-3">Payroll executed</h5>
            <p className="pm-muted">{fmt(S.net)} disbursed to {S.headcount} employees · {period.method} · payslips emailed + M-Pesa notifications sent.</p>
            <div className="pm-cyan-note">P10, NSSF & SHIF returns {autoFile ? "auto-filed ✓" : "ready for manual filing"}</div>
          </div>
        ) : (
          <div>
            <div className="pm-summary-card mb-3">
              <div className="pm-summary-row"><span>Disbursing</span><b>{fmt(S.net)} to {S.headcount} employees</b></div>
              <div className="pm-summary-row"><span>Via</span><b>{period.method}</b></div>
              <div className="pm-summary-row"><span>On</span><b>{fmtDate(period.date)}</b></div>
            </div>
            {needsDual ? (
              <div className="pm-warn-chip w-100 justify-content-start mb-3">⚠️ Dual-approval required for amounts over KES 500K — a second approver must also authorize.</div>
            ) : (
              <div className="pm-note mb-3">Amount is under the KES 500K dual-approval threshold — your PIN alone authorizes this run.</div>
            )}
            <div className="row g-3">
              <div className="col-md-6"><Field label="Enter Director PIN" req><input type="password" className="form-control pm-input" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} /></Field></div>
              <div className="col-md-6">
                <Field label="Confirm">
                  <button className={cls("pm-check-list-item w-100", auth && "pm-check-on")} onClick={() => setAuth(!auth)}>
                    <span className="pm-checkbox">{auth ? "✓" : ""}</span>
                    <span>I authorize this payroll run</span>
                  </button>
                </Field>
              </div>
            </div>
            {running && (
              <div className="pm-sync-list mt-3">
                <div className="pm-sync-step pm-sync-active"><Loader2 size={15} className="pm-spin" /> Generating {S.headcount} payslips…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">2</span> Queueing bank & M-Pesa bulk files…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">3</span> Filing KRA P10, NSSF & SHIF…</div>
              </div>
            )}
          </div>
        )
      )}

      {/* payslip */}
      <Modal open={!!payslip} onClose={() => setPayslip(null)} kicker="Payslip" title={payslip ? `Payslip — ${payslip.name}` : ""} subtitle="March 2026 · preview before run"
        footer={<button className="btn pm-btn-primary w-100" onClick={() => setPayslip(null)}>Done</button>}
      >
        {payslip && (
          <div>
            <div className="pm-payslip-head">
              <div><b className="pm-fs-14">TechSol Ltd</b><span className="pm-muted pm-fs-11 d-block">Payroll · March 2026 · KRA PIN P0512345678V</span></div>
              <Badge tone="info">{payslip.dept}</Badge>
            </div>
            {[
              { label: "Basic salary", v: payslip.gross },
              { label: "PAYE", v: -Math.round(payslip.gross * 0.18) },
              { label: "NSSF", v: -Math.round(payslip.gross * 0.06) },
              { label: "SHIF", v: -Math.round(payslip.gross * 0.0275) },
              { label: "Housing levy", v: -Math.round(payslip.gross * 0.015) },
            ].map((r) => (
              <div className="pm-pay-stat" key={r.label}>
                <span>{r.label}</span>
                <b className={r.v < 0 ? "t-danger" : ""}>{r.v < 0 ? "− " + fmt(-r.v) : fmt(r.v)}</b>
              </div>
            ))}
            <div className="pm-pay-net"><span>Net pay</span><b>{fmt(payslip.net)}</b></div>
            <div className="pm-note mt-2">Paid via {payslip.method === "Bank" ? "bank transfer to salary account" : "M-Pesa bulk (Till 4105541)"}.</div>
          </div>
        )}
      </Modal>
    </Modal>
  );
}
