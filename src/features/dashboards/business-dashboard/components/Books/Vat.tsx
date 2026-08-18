import { useEffect, useState } from "react";
import {
  Receipt, Send, Download, CheckCircle2, Loader2, AlertTriangle, FileText, Scale, Calculator,
} from "lucide-react";
import type { VatPeriod } from "../../dataBooks";
import { vatBreakdown } from "../../dataBooks";
import { cls, daysUntil, downloadCSV, fmt, fmtDate, todayISO, type QAction } from "../../lib";
import { Badge, Donut, Field, Kpi, Modal, Section, StackedBar, Stepper, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Vat({ periods, setPeriods, notify, emit, qa, onConsume }: {
  periods: VatPeriod[];
  setPeriods: React.Dispatch<React.SetStateAction<VatPeriod[]>>;
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [filing, setFiling] = useState(false);
  const [detail, setDetail] = useState<VatPeriod | null>(null);
  const [calc, setCalc] = useState(false);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "fileVat") setFiling(true);
    if (qa.a === "vatCalc") setCalc(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const open = periods.find((p) => p.status === "open");
  const days = open ? daysUntil(open.due) : 0;
  const reclaimRate = open ? Math.round((open.inputVat / open.outputVat) * 100) : 0;

  return (
    <>
      <Section
        no="4.5" sub="Your Business · KRA VAT" id="sec-vat"
        title="VAT Management & Filing"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setCalc(true)}><Calculator size={15} /> VAT Calculator</button>
            <button className="btn pm-btn-violet" onClick={() => setFiling(true)}><Send size={15} /> File VAT Return</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Receipt size={16} />} label="Output VAT (March)" value={fmt(open?.outputVat ?? 0)} delta="on sales" sub="collected from customers" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Scale size={16} />} label="Input VAT (March)" value={fmt(open?.inputVat ?? 0)} delta={`${reclaimRate}% of output`} sub="reclaimable on purchases" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<FileText size={16} />} label="Net VAT payable" value={fmt(open?.net ?? 0)} delta="reserved ✓" sub="held in VAT Reserve account" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<AlertTriangle size={16} />} label="Filing deadline" value={`${days} days`} delta={fmtDate(open?.due ?? todayISO())} sub="VAT-3 return · by the 20th" deltaTone="down" /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div><div className="pm-card-title">March 2026 — return preview</div><div className="pm-card-sub">Auto-built from categorized transactions & eTIMS receipts</div></div>
                <Badge tone="warning" dot>Draft — not filed</Badge>
              </div>
              <table className="table pm-report-table mb-2">
                <thead><tr><th>Category</th><th className="text-end">Net amount</th><th className="text-end">VAT</th></tr></thead>
                <tbody>
                  {vatBreakdown.map((b) => (
                    <tr key={b.label}>
                      <td>{b.label}</td>
                      <td className="text-end">{fmt(b.net)}</td>
                      <td className={cls("text-end fw-bold", b.label.includes("Input") && "t-success")}>{b.vat ? fmt(b.vat) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="pm-report-bold pm-report-divider">
                    <td>NET VAT PAYABLE TO KRA</td><td />
                    <td className="text-end">{fmt(open?.net ?? 0)}</td>
                  </tr>
                </tfoot>
              </table>
              <StackedBar h={16} labels segments={[
                { v: open?.inputVat ?? 0, color: "#0ea37f", label: "Input (reclaim)" },
                { v: open?.net ?? 0, color: "#7c3aed", label: "Net payable" },
              ]} />
              <div className="d-flex gap-2 mt-3">
                <button className="btn pm-btn-violet btn-sm flex-grow-1" onClick={() => setFiling(true)}><Send size={14} /> Review & file return</button>
                <button className="btn pm-btn-ghost btn-sm" onClick={() => emit({ a: "focusEtims" })}>Check eTIMS first</button>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Filing history</div><div className="pm-card-sub">iTax acknowledgements kept for 7 years</div></div>
              {periods.map((p) => (
                <button className="pm-vat-row" key={p.id} onClick={() => setDetail(p)}>
                  <div className="flex-grow-1 text-start">
                    <div className="fw-semibold pm-fs-13">{p.period}</div>
                    <div className="pm-muted pm-fs-11">{p.status === "filed" ? `Filed ${fmtDate(p.filedOn!)} · ${p.ackNumber}` : `Due ${fmtDate(p.due)}`}</div>
                  </div>
                  <div className="text-end">
                    <b className="pm-fs-13">{fmt(p.net)}</b>
                    <div><Badge tone={p.status === "filed" ? "success" : p.status === "overdue" ? "danger" : "warning"} dot={p.status !== "filed"}>{p.status}</Badge></div>
                  </div>
                </button>
              ))}
              <div className="pm-cyan-note mt-2">💡 Your VAT Reserve virtual account already holds {fmt(open?.net ?? 0)} — filing won't squeeze your cash.</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── filing wizard (4 steps) ── */}
      <FilingWizard open={filing} onClose={() => setFiling(false)} period={open} notify={notify}
        onFiled={(id, ack) => setPeriods((ps) => ps.map((p) => (p.id === id ? { ...p, status: "filed", filedOn: todayISO(), ackNumber: ack } : p)))} />

      {/* ── period detail ── */}
      <Modal open={!!detail} onClose={() => setDetail(null)} kicker="VAT Return" title={detail?.period ?? ""} subtitle={detail?.status === "filed" ? `Filed ${fmtDate(detail.filedOn!)}` : `Due ${detail ? fmtDate(detail.due) : ""}`}
        footer={<><button className="btn pm-btn-ghost" onClick={() => setDetail(null)}>Close</button>
          {detail?.status === "filed" && <button className="btn pm-btn-violet" onClick={() => { downloadCSV(`vat-return-${detail.period.replace(" ", "-")}.csv`, [["VAT-3 Return", detail.period], ["Output VAT", detail.outputVat], ["Input VAT", detail.inputVat], ["Net payable", detail.net], ["Acknowledgement", detail.ackNumber ?? ""]]); notify({ tone: "success", title: "Return downloaded", body: `${detail.period} VAT-3 with acknowledgement.` }); }}><Download size={15} /> Download return</button>}
          {detail?.status === "open" && <button className="btn pm-btn-violet" onClick={() => { setDetail(null); setFiling(true); }}><Send size={15} /> File this return</button>}</>}
      >
        {detail && (
          <>
            <div className="pm-summary-card">
              <div className="pm-summary-row"><span>Output VAT (sales)</span><b>{fmt(detail.outputVat)}</b></div>
              <div className="pm-summary-row"><span>Input VAT (purchases)</span><b className="t-success">− {fmt(detail.inputVat)}</b></div>
              <div className="pm-summary-row"><span>Net payable to KRA</span><b>{fmt(detail.net)}</b></div>
              {detail.ackNumber && <div className="pm-summary-row"><span>iTax acknowledgement</span><b className="pm-mono pm-fs-12">{detail.ackNumber}</b></div>}
            </div>
            <div className="d-flex align-items-center gap-3 mt-3">
              <Donut pct={Math.round((detail.inputVat / detail.outputVat) * 100)} size={72} stroke={10} color="#0ea37f" />
              <div className="pm-fs-13 pm-muted">Input VAT recovered {Math.round((detail.inputVat / detail.outputVat) * 100)}% of output. The higher this is, the less cash leaves the business.</div>
            </div>
          </>
        )}
      </Modal>

      {/* ── VAT calculator ── */}
      <VatCalculator open={calc} onClose={() => setCalc(false)} notify={notify} />
    </>
  );
}

/* ── filing wizard ── */

function FilingWizard({ open, onClose, period, notify, onFiled }: {
  open: boolean; onClose: () => void; period?: VatPeriod; notify: Notify;
  onFiled: (id: string, ack: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [confirmData, setConfirmData] = useState(false);
  const [payNow, setPayNow] = useState(true);
  const [pin, setPin] = useState("");
  const [filing, setFiling] = useState(false);
  const [ack, setAck] = useState<string | null>(null);

  useEffect(() => { if (open) { setStep(1); setConfirmData(false); setPayNow(true); setPin(""); setFiling(false); setAck(null); } }, [open]);
  if (!period) return null;

  const submit = () => {
    setFiling(true);
    window.setTimeout(() => {
      const a = `KRA-VAT-2026-${Math.floor(Math.random() * 900000 + 100000)}`;
      setFiling(false);
      setAck(a);
      onFiled(period.id, a);
      notify({ tone: "success", title: "VAT return filed with KRA", body: `${period.period} · acknowledgement ${a}${payNow ? ` · ${fmt(period.net)} paid from VAT Reserve` : ""}.` });
    }, 2000);
  };

  return (
    <Modal open={open} onClose={onClose} kicker="iTax Filing" title={`File VAT-3 — ${period.period}`} size="lg" hideClose={filing}
      footer={
        ack ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
          : step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-violet" onClick={() => setStep(2)}>Continue →</button></>)
          : step === 2 ? (<><button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button><button className="btn pm-btn-violet" disabled={!confirmData} onClick={() => setStep(3)}>Continue →</button></>)
          : (<><button className="btn pm-btn-ghost" disabled={filing} onClick={() => setStep(2)}>← Back</button>
            <button className="btn pm-btn-violet" disabled={!pin || filing} onClick={submit}>{filing ? <><Loader2 size={15} className="pm-spin" /> Submitting to iTax…</> : <><Send size={15} /> Submit return</>}</button></>)
      }
    >
      <Stepper steps={3} current={step} labels={["Review figures", "Declarations", "Submit & pay"]} />
      {step === 1 && (
        <div>
          <table className="table pm-report-table mb-2">
            <tbody>
              <tr><td>Total sales (standard-rated)</td><td className="text-end">{fmt(2477500)}</td></tr>
              <tr><td>Output VAT @ 16%</td><td className="text-end fw-bold">{fmt(period.outputVat)}</td></tr>
              <tr><td>Zero-rated & exempt sales</td><td className="text-end">{fmt(578000)}</td></tr>
              <tr><td>Total purchases (with VAT)</td><td className="text-end">{fmt(1338100)}</td></tr>
              <tr><td>Input VAT claimable</td><td className="text-end fw-bold t-success">({fmt(period.inputVat)})</td></tr>
              <tr className="pm-report-bold pm-report-divider"><td>NET VAT PAYABLE</td><td className="text-end">{fmt(period.net)}</td></tr>
            </tbody>
          </table>
          <div className="pm-cyan-note">Figures come straight from categorized transactions and verified eTIMS receipts. Any uncategorized item is excluded.</div>
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="pm-preview-label">Pre-submission checks</div>
          {[
            { label: "All sales invoices transmitted to eTIMS", ok: false, note: "2 failed transmissions — VAT may be understated" },
            { label: "All purchase receipts have supplier KRA PINs", ok: true, note: "Input VAT fully supported" },
            { label: "Period reconciled to bank", ok: true, note: "KCB & Equity matched" },
            { label: "No uncategorized VATable transactions", ok: false, note: "8 items uncategorized" },
          ].map((c) => (
            <div className="pm-health-row" key={c.label}>
              <span className={cls("pm-health-dot", c.ok ? "pm-health-ok" : "pm-health-bad")}>{c.ok ? "✓" : "!"}</span>
              <span className="flex-grow-1"><b className="pm-fs-13">{c.label}</b><span className="pm-muted pm-fs-11 d-block">{c.note}</span></span>
            </div>
          ))}
          <button className={cls("pm-check-list-item w-100 mt-3", confirmData && "pm-check-on")} onClick={() => setConfirmData(!confirmData)}>
            <span className="pm-checkbox">{confirmData ? "✓" : ""}</span>
            <span>I declare that the information in this return is true and complete</span>
          </button>
        </div>
      )}
      {step === 3 && (
        ack ? (
          <div className="text-center py-3">
            <div className="pm-big-ic pm-big-ic-success mx-auto"><CheckCircle2 size={28} /></div>
            <h5 className="fw-bold mt-3">Return filed with KRA</h5>
            <p className="pm-muted">{period.period} VAT-3 submitted successfully.</p>
            <div className="pm-copy-line mx-auto"><span className="pm-mono pm-fs-13">{ack}</span></div>
            <div className="pm-cyan-note mt-3">{payNow ? `${fmt(period.net)} paid from your VAT Reserve. Receipt filed to the audit trail.` : "Remember to pay before the 20th to avoid a 5% penalty plus 1% monthly interest."}</div>
          </div>
        ) : (
          <div>
            <div className="pm-summary-card mb-3">
              <div className="pm-summary-row"><span>Return</span><b>VAT-3 · {period.period}</b></div>
              <div className="pm-summary-row"><span>Amount payable</span><b>{fmt(period.net)}</b></div>
              <div className="pm-summary-row"><span>KRA PIN</span><b className="pm-mono">P0512345678V</b></div>
            </div>
            <div className="pm-toggle-row"><Toggle on={payNow} onChange={setPayNow} label={`Pay ${fmt(period.net)} now from VAT Reserve (balance ${fmt(182300)})`} /></div>
            <Field label="Enter your iTax PIN to sign the return" req>
              <input type="password" className="form-control pm-input" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value)} />
            </Field>
            {filing && (
              <div className="pm-sync-list mt-3">
                <div className="pm-sync-step pm-sync-active"><Loader2 size={15} className="pm-spin" /> Connecting to iTax…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">2</span> Submitting VAT-3 return…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">3</span> {payNow ? "Paying from VAT Reserve…" : "Generating payment slip…"}</div>
              </div>
            )}
          </div>
        )
      )}
    </Modal>
  );
}

/* ── VAT calculator ── */

function VatCalculator({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [amount, setAmount] = useState("116000");
  const [mode, setMode] = useState<"inclusive" | "exclusive">("inclusive");
  const n = Number(amount) || 0;
  const vat = mode === "inclusive" ? n * 16 / 116 : n * 0.16;
  const net = mode === "inclusive" ? n - vat : n;
  const gross = mode === "inclusive" ? n : n + vat;
  return (
    <Modal open={open} onClose={onClose} kicker="Tools" title="VAT calculator" subtitle="Kenya standard rate 16%"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
        <button className="btn pm-btn-violet" onClick={async () => { await navigator.clipboard?.writeText(`Net ${Math.round(net)} · VAT ${Math.round(vat)} · Gross ${Math.round(gross)}`); notify({ tone: "info", title: "Copied", body: "VAT breakdown copied to clipboard." }); }}>Copy breakdown</button></>}
    >
      <Field label="Amount (KES)"><input type="number" className="form-control pm-input pm-input-lg" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
      <div className="pm-mode-tabs mb-3">
        <button className={cls("pm-mode-tab", mode === "inclusive" && "pm-mode-on")} onClick={() => setMode("inclusive")}>VAT inclusive</button>
        <button className={cls("pm-mode-tab", mode === "exclusive" && "pm-mode-on")} onClick={() => setMode("exclusive")}>VAT exclusive</button>
      </div>
      <div className="pm-summary-card">
        <div className="pm-summary-row"><span>Net (excl. VAT)</span><b>{fmt(net)}</b></div>
        <div className="pm-summary-row"><span>VAT @ 16%</span><b className="t-primary">{fmt(vat)}</b></div>
        <div className="pm-summary-row"><span>Gross (incl. VAT)</span><b>{fmt(gross)}</b></div>
      </div>
    </Modal>
  );
}
