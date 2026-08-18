import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck, RefreshCw, AlertTriangle, CheckCircle2, Loader2, Settings2, Search, Send, Wifi,
} from "lucide-react";
import type { EtimsDoc } from "../../dataBooks";
import { cls, fmt, fmtDT, type QAction } from "../../lib";
import { Badge, EmptyState, Field, Kpi, Modal, PillTabs, Section, SlideOver, Stepper, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Etims({ docs, setDocs, notify, qa, onConsume }: {
  docs: EtimsDoc[];
  setDocs: React.Dispatch<React.SetStateAction<EtimsDoc[]>>;
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<EtimsDoc | null>(null);
  const [fixFor, setFixFor] = useState<EtimsDoc | null>(null);
  const [setup, setSetup] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "focusEtims") { setTab("failed"); document.getElementById("sec-etims")?.scrollIntoView({ behavior: "smooth" }); }
    if (qa.a === "etimsSetup") setSetup(true);
    if (qa.a === "etimsSync") pushQueue();
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const failed = docs.filter((d) => d.status === "failed");
  const queued = docs.filter((d) => d.status === "queued");
  const sent = docs.filter((d) => d.status === "transmitted");
  const rate = Math.round((sent.length / docs.length) * 100);

  const list = useMemo(() => {
    let rows = docs;
    if (tab !== "all") rows = rows.filter((d) => d.status === tab);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      rows = rows.filter((d) => d.invoice.toLowerCase().includes(s) || d.customer.toLowerCase().includes(s));
    }
    return rows;
  }, [docs, tab, q]);

  const pushQueue = () => {
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      const n = docs.filter((d) => d.status === "queued").length;
      setDocs((ds) => ds.map((d) => (d.status === "queued" ? { ...d, status: "transmitted", cuNumber: `KRACU01029${Math.floor(Math.random() * 90000 + 10000)}` } : d)));
      notify({ tone: "success", title: "eTIMS sync complete", body: `${n} document(s) transmitted to KRA. Control unit numbers assigned.` });
    }, 1700);
  };

  return (
    <>
      <Section
        no="4.6" sub="Your Business · KRA eTIMS" id="sec-etims"
        title="eTIMS Compliance & Transmission"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setSetup(true)}><Settings2 size={15} /> eTIMS Setup</button>
            <button className="btn pm-btn-violet" disabled={syncing} onClick={pushQueue}>
              <RefreshCw size={15} className={cls(syncing && "pm-spin")} /> {syncing ? "Transmitting…" : `Transmit Queue (${queued.length})`}
            </button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Wifi size={16} />} label="Device status" value="Online" delta="OSCU virtual" sub="last heartbeat 40s ago" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<BadgeCheck size={16} />} label="Transmitted" value={`${sent.length} docs`} delta={`${rate}% success`} sub="control units issued" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<RefreshCw size={16} />} label="In queue" value={`${queued.length} docs`} delta="auto-push in 5 min" sub="or transmit now" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<AlertTriangle size={16} />} label="Failed" value={`${failed.length} docs`} delta={fmt(failed.reduce((s, d) => s + d.vat, 0))} sub="VAT at risk if unfixed" deltaTone="down" /></div>
        </div>

        {failed.length > 0 && (
          <div className="pm-suggest-banner pm-suggest-banner-violet">
            <div className="pm-suggest-ic"><AlertTriangle size={18} className="t-danger" /></div>
            <div className="flex-grow-1">
              <b>{failed.length} invoice(s) never reached KRA</b>
              <span className="pm-muted pm-fs-13 d-block">Unsent invoices mean understated output VAT — KRA penalties start at KES 10,000 per invoice. Fix them before filing.</span>
            </div>
            <button className="btn pm-btn-violet btn-sm" onClick={() => setTab("failed")}>Show failures →</button>
          </div>
        )}

        <div className="pm-card">
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between px-1 pt-1">
            <PillTabs
              tabs={[
                { id: "all", label: "All", count: docs.length },
                { id: "transmitted", label: "Transmitted", count: sent.length },
                { id: "queued", label: "Queued", count: queued.length, tone: "warning" },
                { id: "failed", label: "Failed", count: failed.length, tone: "danger" },
              ]}
              active={tab}
              onChange={setTab}
            />
            <div className="pm-search"><Search size={15} /><input placeholder="Search invoice or customer…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          </div>
          <div className="table-responsive mt-2">
            <table className="table pm-table align-middle mb-0">
              <thead><tr><th>Document</th><th>Customer</th><th className="text-end">Amount</th><th className="text-end">VAT</th><th>Status</th><th>Control unit</th><th className="text-end" /></tr></thead>
              <tbody>
                {list.length === 0 && <tr><td colSpan={7}><EmptyState icon={<BadgeCheck size={26} />} title="Nothing here" body="All documents in this state are clear." /></td></tr>}
                {list.map((d) => (
                  <tr key={d.id} className="pm-click-row" onClick={() => setDetail(d)}>
                    <td>
                      <div className="fw-semibold pm-fs-13">{d.invoice}</div>
                      <div className="pm-muted pm-fs-11">{fmtDT(d.date)}</div>
                    </td>
                    <td className="pm-fs-13">{d.customer}</td>
                    <td className="text-end pm-fs-13">{fmt(d.amount)}</td>
                    <td className="text-end pm-fs-13">{fmt(d.vat)}</td>
                    <td>
                      {d.status === "transmitted" && <Badge tone="success">✓ Transmitted</Badge>}
                      {d.status === "queued" && <Badge tone="warning" dot>Queued</Badge>}
                      {d.status === "failed" && <Badge tone="danger" dot>Failed</Badge>}
                    </td>
                    <td className="pm-mono pm-fs-11 pm-muted">{d.cuNumber ?? "—"}</td>
                    <td className="text-end">
                      {d.status === "failed" && <button className="btn pm-btn-violet btn-sm" onClick={(e) => { e.stopPropagation(); setFixFor(d); }}>Fix & retry</button>}
                      {d.status === "queued" && <button className="pm-link-btn pm-fs-12" onClick={(e) => { e.stopPropagation(); pushQueue(); }}>Push now →</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pm-table-foot">
            <span className="pm-muted pm-fs-12">Every sales invoice must reach eTIMS within 24 hours of issue (Finance Act requirement).</span>
          </div>
        </div>
      </Section>

      {/* ── doc detail ── */}
      <SlideOver open={!!detail} onClose={() => setDetail(null)} kicker="eTIMS Document" title={detail?.invoice ?? ""} width={480}
        footer={detail?.status === "failed" ? <button className="btn pm-btn-violet btn-sm w-100" onClick={() => { setFixFor(detail); setDetail(null); }}>Fix & retry transmission</button> : <button className="btn pm-btn-ghost btn-sm w-100" onClick={() => setDetail(null)}>Close</button>}
      >
        {detail && (
          <>
            <div className="pm-detail-head">
              <div className="pm-money-lg">{fmt(detail.amount)}</div>
              <div className="pm-muted pm-fs-12">{detail.customer} · VAT {fmt(detail.vat)}</div>
            </div>
            <div className="pm-json">
              {[
                ["Document", detail.invoice],
                ["Status", detail.status],
                ["Transmitted at", fmtDT(detail.date)],
                ["Control unit", detail.cuNumber ?? "not issued"],
                ["Device", "OSCU-VIRT-TSL-01"],
                ["KRA PIN", "P0512345678V"],
              ].map(([k, v]) => <div className="pm-json-row" key={k}><span>{k}</span><b>{v}</b></div>)}
            </div>
            {detail.error && <div className="pm-warn-chip mt-3 w-100 justify-content-start"><AlertTriangle size={13} /> {detail.error}</div>}
            {detail.cuNumber && <div className="pm-cyan-note mt-3">✓ This receipt is valid for the customer's input VAT claim. It appears on your VAT-3 automatically.</div>}
          </>
        )}
      </SlideOver>

      {/* ── fix & retry wizard ── */}
      <FixModal d={fixFor} onClose={() => setFixFor(null)} notify={notify}
        onFixed={(id) => setDocs((ds) => ds.map((x) => (x.id === id ? { ...x, status: "transmitted", cuNumber: `KRACU01029${Math.floor(Math.random() * 90000 + 10000)}`, error: undefined } : x)))} />

      {/* ── setup wizard ── */}
      <SetupWizard open={setup} onClose={() => setSetup(false)} notify={notify} />
    </>
  );
}

/* ── fix & retry ── */

function FixModal({ d, onClose, notify, onFixed }: {
  d: EtimsDoc | null; onClose: () => void; notify: Notify; onFixed: (id: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { if (d) { setStep(1); setPin(d.error?.includes("PIN") ? "" : "P0512345678V"); setRetrying(false); setDone(false); } }, [d]);
  if (!d) return null;
  const isPinIssue = d.error?.includes("PIN");
  const retry = () => {
    setRetrying(true);
    window.setTimeout(() => {
      setRetrying(false); setDone(true);
      onFixed(d.id);
      notify({ tone: "success", title: "Transmission successful", body: `${d.invoice} accepted by KRA — control unit issued.` });
    }, 1600);
  };
  return (
    <Modal open={!!d} onClose={onClose} kicker="eTIMS Recovery" title={`Fix ${d.invoice}`} hideClose={retrying}
      footer={
        done ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
          : step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-violet" disabled={isPinIssue && !pin} onClick={() => setStep(2)}>Continue →</button></>)
          : (<><button className="btn pm-btn-ghost" disabled={retrying} onClick={() => setStep(1)}>← Back</button>
            <button className="btn pm-btn-violet" disabled={retrying} onClick={retry}>{retrying ? <><Loader2 size={15} className="pm-spin" /> Retrying…</> : <><Send size={15} /> Retry transmission</>}</button></>)
      }
    >
      <Stepper steps={2} current={step} labels={["Fix the cause", "Retransmit"]} />
      {step === 1 && (
        <div>
          <div className="pm-warn-chip w-100 justify-content-start mb-3"><AlertTriangle size={14} /> {d.error}</div>
          {isPinIssue ? (
            <>
              <Field label="Corrected customer KRA PIN" req hint="Ask the customer, or mark the sale as a non-PIN retail sale.">
                <input className="form-control pm-input pm-mono" placeholder="A012345678Z" value={pin} onChange={(e) => setPin(e.target.value)} />
              </Field>
              <button className="btn pm-btn-soft btn-sm" onClick={() => { setPin("NON-PIN-RETAIL"); notify({ tone: "info", title: "Marked as retail sale", body: "Transmitted without a customer PIN — the customer can't claim input VAT." }); }}>
                Customer has no PIN — mark as retail sale
              </button>
            </>
          ) : (
            <div className="pm-cyan-note">The device was offline when this invoice was issued. It's back online now — simply retransmit.</div>
          )}
        </div>
      )}
      {step === 2 && (
        done ? (
          <div className="text-center py-3">
            <div className="pm-big-ic pm-big-ic-success mx-auto"><CheckCircle2 size={28} /></div>
            <h5 className="fw-bold mt-3">Accepted by KRA</h5>
            <p className="pm-muted">{d.invoice} now has a valid control unit number and counts toward your VAT return.</p>
          </div>
        ) : (
          <div>
            <div className="pm-summary-card">
              <div className="pm-summary-row"><span>Document</span><b>{d.invoice}</b></div>
              <div className="pm-summary-row"><span>Customer</span><b>{d.customer}</b></div>
              <div className="pm-summary-row"><span>Amount / VAT</span><b>{fmt(d.amount)} / {fmt(d.vat)}</b></div>
              <div className="pm-summary-row"><span>Customer PIN</span><b className="pm-mono">{pin || "—"}</b></div>
            </div>
            {retrying && (
              <div className="pm-sync-list mt-3">
                <div className="pm-sync-step pm-sync-active"><Loader2 size={15} className="pm-spin" /> Signing document with OSCU…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">2</span> Transmitting to KRA eTIMS…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">3</span> Awaiting control unit number…</div>
              </div>
            )}
          </div>
        )
      )}
    </Modal>
  );
}

/* ── setup wizard ── */

function SetupWizard({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("oscu");
  const [pin, setPin] = useState("P0512345678V");
  const [branch, setBranch] = useState("00 — Head office");
  const [auto, setAuto] = useState(true);
  useEffect(() => { if (open) { setStep(1); setMode("oscu"); setAuto(true); } }, [open]);
  return (
    <Modal open={open} onClose={onClose} kicker="eTIMS Configuration" title="eTIMS setup" size="lg"
      footer={
        <>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 3 && <button className="btn pm-btn-violet" onClick={() => setStep(step + 1)}>Continue →</button>}
          {step === 3 && <button className="btn pm-btn-violet" onClick={() => { notify({ tone: "success", title: "eTIMS configured", body: `${mode === "oscu" ? "Virtual OSCU" : "Online portal"} · branch ${branch} · auto-transmit ${auto ? "ON" : "OFF"}.` }); onClose(); }}><CheckCircle2 size={15} /> Save configuration</button>}
        </>
      }
    >
      <Stepper steps={3} current={step} labels={["Device type", "Business details", "Automation"]} />
      {step === 1 && (
        <div className="pm-preset-grid">
          {[
            { id: "oscu", name: "Virtual OSCU (recommended)", desc: "Software control unit inside PayMo — no hardware to buy" },
            { id: "vscu", name: "VSCU / hardware device", desc: "You already have a KRA-approved control unit" },
            { id: "portal", name: "eTIMS online portal", desc: "Manual entry on the KRA portal — slowest option" },
          ].map((m) => (
            <button key={m.id} className={cls("pm-preset-card", mode === m.id && "pm-preset-on")} onClick={() => setMode(m.id)}>
              <span className="pm-acc-ic pm-acc-ic-virtual"><BadgeCheck size={15} /></span>
              <b>{m.name}</b><span>{m.desc}</span>
            </button>
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="row g-3">
          <div className="col-md-6"><Field label="KRA PIN" req><input className="form-control pm-input pm-mono" value={pin} onChange={(e) => setPin(e.target.value)} /></Field></div>
          <div className="col-md-6"><Field label="Branch ID"><select className="form-select pm-input" value={branch} onChange={(e) => setBranch(e.target.value)}><option>00 — Head office</option><option>01 — Westlands shop</option><option>02 — Mombasa depot</option></select></Field></div>
          <div className="col-12"><div className="pm-cyan-note">PayMo registers the device against your PIN with KRA. Approval is instant for virtual OSCU.</div></div>
        </div>
      )}
      {step === 3 && (
        <div>
          <div className="pm-toggle-row"><Toggle on={auto} onChange={setAuto} label="Auto-transmit every sales invoice within 5 minutes" /></div>
          <div className="pm-toggle-row"><Toggle on={true} onChange={() => {}} label="Alert me the moment a transmission fails" /></div>
          <div className="pm-toggle-row"><Toggle on={true} onChange={() => {}} label="Block VAT filing while failures are outstanding" /></div>
          <div className="pm-cyan-note mt-2">With auto-transmit on, you never think about eTIMS again — invoices flow to KRA as you create them.</div>
        </div>
      )}
    </Modal>
  );
}
