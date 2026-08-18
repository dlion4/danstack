import { useState } from "react";
import {
  ShieldCheck, FileText, Download, AlertTriangle, CalendarClock, BadgeCheck,
} from "lucide-react";
import type { Supplier } from "../../dataPay";
import { statutoryDues, whtRatesSeed } from "../../dataPay";
import { addDays, daysUntil, downloadCSV, fmt, fmtDate, todayISO, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, Section } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Compliance({ suppliers, notify }: {
  suppliers: Supplier[];
  notify: Notify;
  emit?: (q: QAction) => void;
  qa?: QAction;
  onConsume?: () => void;
}) {
  const [rates, setRates] = useState(whtRatesSeed);
  const [certOpen, setCertOpen] = useState(false);
  const [etimsOpen, setEtimsOpen] = useState(false);

  const dueSoon = statutoryDues.filter((d) => daysUntil(d.due) <= 10);

  return (
    <>
      <Section
        no="2.9" sub="Money Out · KRA & eTIMS" id="sec-compliance"
        title="Compliance & Withholding Taxes"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setEtimsOpen(true)}><BadgeCheck size={15} /> Verify eTIMS Receipt</button>
            <button className="btn pm-btn-soft" onClick={() => setCertOpen(true)}><FileText size={15} /> Generate WHT Certificate</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<ShieldCheck size={16} />} label="eTIMS status" value="Active" delta="14 invoices synced" sub="auto-submission ON" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<BadgeCheck size={16} />} label="KRA PIN" value="P0512345678V" delta="Valid · VAT-registered" sub="iTax portal linked" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<FileText size={16} />} label="WHT remitted (YTD)" value={fmt(148800)} delta="12 suppliers" sub="certificates issued" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CalendarClock size={16} />} label="Next statutory due" value={fmtDate(addDays(todayISO(), 5))} delta="PAYE · KES 98,000" sub="auto-pay enabled" deltaTone="down" /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div className="pm-card-title">Withholding tax rates</div>
                <div className="pm-card-sub">Rates are editable — verify with KRA before use.</div>
              </div>
              {rates.map((r, i) => (
                <div className="pm-rate-row" key={r.type}>
                  <div className="flex-grow-1">
                    <div className="fw-semibold pm-fs-13">{r.type}</div>
                    <div className="pm-muted pm-fs-11">{r.desc}</div>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <input
                      type="number" className="form-control form-control-sm pm-input pm-w-70 text-end"
                      value={r.rate}
                      onChange={(e) => setRates((rs) => rs.map((x, j) => (j === i ? { ...x, rate: Number(e.target.value) } : x)))}
                    />
                    <span className="pm-fs-13 fw-bold">%</span>
                  </div>
                </div>
              ))}
              <button className="btn pm-btn-soft btn-sm mt-2" onClick={() => notify({ tone: "success", title: "WHT rates saved", body: "New bills will use the updated rates. Existing bills are unchanged." })}>Save rates</button>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div className="pm-card-title">Statutory calendar</div>
                <button className="pm-link-btn pm-fs-12" onClick={() => notify({ tone: "info", title: "Reminder added", body: "All statutory dates now push a 5-day and 1-day reminder." })}>+ Add reminders</button>
              </div>
              {statutoryDues.map((d) => {
                const days = daysUntil(d.due);
                return (
                  <div className="pm-stat-row-item" key={d.id}>
                    <div className="flex-grow-1">
                      <div className="fw-semibold pm-fs-13">{d.label}</div>
                      <div className="pm-muted pm-fs-11">{d.agency} · {d.freq}</div>
                    </div>
                    <div className="text-end">
                      <b className="pm-fs-13">{fmt(d.amount)}</b>
                      <div>
                        <Badge tone={days <= 5 ? "danger" : days <= 10 ? "warning" : "muted"}>{days < 0 ? "overdue" : `${days} day${days === 1 ? "" : "s"} left`}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
              {dueSoon.length > 0 && (
                <div className="pm-warn-chip mt-2"><AlertTriangle size={13} /> {dueSoon.length} payment(s) due within 10 days — auto-pay covers all of them.</div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ── WHT certificate ── */}
      <CertModal open={certOpen} onClose={() => setCertOpen(false)} suppliers={suppliers} notify={notify} />

      {/* ── eTIMS verify ── */}
      <EtimsModal open={etimsOpen} onClose={() => setEtimsOpen(false)} notify={notify} />
    </>
  );
}

/* ── WHT certificate generator ── */

function CertModal({ open, onClose, suppliers, notify }: {
  open: boolean; onClose: () => void; suppliers: Supplier[]; notify: Notify;
}) {
  const [supp, setSupp] = useState("s1");
  const [period, setPeriod] = useState("March 2026");
  const [made, setMade] = useState<string | null>(null);
  const s = suppliers.find((x) => x.id === supp);
  const gen = () => {
    setMade(`WHT-CERT-${period.replace(" ", "-").toUpperCase()}-${(s?.name ?? "SUP").slice(0, 6).toUpperCase()}`);
  };
  const download = () => {
    downloadCSV(`${made}.csv`, [
      ["Withholding Tax Certificate"],
      ["Payer", "TechSol Ltd · PIN P0512345678V"],
      ["Payee", s?.name ?? "", s?.pin ?? ""],
      ["Period", period],
      ["Amount paid (excl VAT)", "WHT rate", "WHT withheld"],
      ["KES 84,500", "2%", "KES 1,690"],
    ]);
    notify({ tone: "success", title: "WHT certificate downloaded", body: `${made}.csv — share with ${s?.name} and your accountant.` });
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Withholding Tax" title="Generate WHT certificate" subtitle="For the supplier and the iTax return."
      footer={made ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Close</button><button className="btn pm-btn-primary" onClick={download}><Download size={15} /> Download</button></>)
        : (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={gen} disabled={!s}><FileText size={15} /> Generate</button></>)}
    >
      {!made ? (
        <div className="pm-wizard-grid">
          <Field label="Supplier"><select className="form-select pm-input" value={supp} onChange={(e) => setSupp(e.target.value)}>{suppliers.map((x) => <option key={x.id} value={x.id}>{x.name} — {x.wtType}</option>)}</select></Field>
          <Field label="Period"><select className="form-select pm-input" value={period} onChange={(e) => setPeriod(e.target.value)}><option>March 2026</option><option>February 2026</option><option>January 2026</option><option>Q1 2026</option></select></Field>
          <div className="pm-cyan-note">The certificate lists every payment made in the period with the WHT withheld and rate applied.</div>
        </div>
      ) : (
        <div>
          <div className="pm-big-ic pm-big-ic-success mx-auto mb-3"><ShieldCheck size={26} /></div>
          <div className="pm-copy-line mx-auto"><span className="pm-mono pm-fs-12">{made}</span></div>
          <div className="pm-summary-card mt-3">
            <div className="pm-summary-row"><span>Payee</span><b>{s?.name}</b></div>
            <div className="pm-summary-row"><span>Period</span><b>{period}</b></div>
            <div className="pm-summary-row"><span>WHT withheld</span><b className="t-danger">{fmt(1690)}</b></div>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ── eTIMS verify ── */

function EtimsModal({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [receipt, setReceipt] = useState("");
  const [result, setResult] = useState<"ok" | "bad" | null>(null);
  const verify = () => {
    if (!receipt.trim()) { notify({ tone: "warning", title: "Enter a receipt number", body: "e.g. ET-2026-88412 (from the supplier's eTIMS receipt)." }); return; }
    setResult(receipt.trim().toUpperCase().startsWith("ET") ? "ok" : "bad");
  };
  return (
    <Modal open={open} onClose={() => { setResult(null); setReceipt(""); onClose(); }} kicker="eTIMS" title="Verify a supplier receipt"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Close</button><button className="btn pm-btn-primary" onClick={verify}><BadgeCheck size={15} /> Verify against iTax</button></>}
    >
      <Field label="eTIMS receipt number" hint="Printed on the supplier's receipt — format ET-YYYY-NNNNN.">
        <input className="form-control pm-input pm-mono" placeholder="ET-2026-88412" value={receipt} onChange={(e) => setReceipt(e.target.value)} />
      </Field>
      {result === "ok" && (
        <div className="pm-cyan-note">✓ Receipt verified with iTax: supplier registered, VAT 16%, amount matches your bill. Safe to pay and reclaim VAT.</div>
      )}
      {result === "bad" && (
        <div className="pm-warn-chip w-100 justify-content-start"><AlertTriangle size={14} /> Could not verify this receipt with iTax. Check the number — paying unverified receipts risks losing the VAT reclaim.</div>
      )}
      <div className="pm-note mt-2">Auto-verification runs on every captured bill; use this for one-off checks.</div>
    </Modal>
  );
}
