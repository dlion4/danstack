import { useEffect, useState } from "react";
import {
  Globe, Settings2, Eye, CheckCircle2, Link2, ShieldCheck,
} from "lucide-react";
import type { CrmCustomer } from "../../dataCrm";
import { portalSettings } from "../../dataCrm";
import { cls, copyText, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, QrCode, Section, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Portal({ customers, notify, qa, onConsume }: {
  customers: CrmCustomer[];
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [feats, setFeats] = useState(portalSettings.features);
  const [linkFor, setLinkFor] = useState<CrmCustomer | null>(null);
  const [preview, setPreview] = useState(false);
  const [settings, setSettings] = useState(false);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "portal") setSettings(true);
    if (qa.a === "portalLink") { const c = customers.find((x) => x.id === qa.p) ?? customers[0]; if (c) setLinkFor(c); }
    if (qa.a === "portalPreview") setPreview(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const enabled = customers.filter((c) => c.portal);
  const eligible = customers.filter((c) => !c.portal && c.totalInvoices > 0);

  const enable = (c: CrmCustomer) => {
    notify({ tone: "success", title: "Portal enabled", body: `${c.name} can now log in and see their invoices.` });
  };

  return (
    <>
      <Section
        no="6.5" sub="Money In · Self-Service" id="sec-portal"
        title="Customer Payment Portal"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setPreview(true)}><Eye size={15} /> Preview Portal</button>
            <button className="btn pm-btn-soft" onClick={() => setSettings(true)}><Settings2 size={15} /> Portal Settings</button>
            <button className="btn pm-btn-primary" onClick={() => setLinkFor(customers[0])}><Link2 size={15} /> Generate Access Link</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<Globe size={16} />} label="Portal enabled" value={`${enabled.length} customers`} delta={`${eligible.length} eligible`} sub="waiting for invite" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<ShieldCheck size={16} />} label="Self-serve actions (30d)" value="42 logins" delta="31 payments" sub="customers paid themselves" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="Support tickets avoided" value="18 tickets" delta="−64%" sub="vs pre-portal months" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Link2 size={16} />} label="Receipt downloads" value="27 downloads" delta="0 questions" sub="'Where's my invoice?'" /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-7">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div><div className="pm-card-title">Customers with portal access</div><div className="pm-card-sub">They see only their own invoices, receipts and balances</div></div>
              </div>
              {enabled.map((c) => (
                <div className="pm-sched-row" key={c.id}>
                  <div className="flex-grow-1">
                    <b className="pm-fs-13">{c.name}</b>
                    <span className="pm-muted pm-fs-11 d-block">{c.business} · {c.email || "no email — link via SMS/WhatsApp"}</span>
                  </div>
                  <Badge tone="success" dot>Active</Badge>
                  <button className="pm-link-btn pm-fs-12" onClick={() => setLinkFor(c)}>Link →</button>
                </div>
              ))}
              {eligible.length > 0 && (
                <div className="pm-cyan-note mt-2">
                  💡 {eligible.length} customer(s) with invoices but no portal yet — invite them with one link each.{" "}
                  {eligible.map((c) => <button key={c.id} className="pm-tag-chip mx-1" onClick={() => enable(c)}>{c.name} +invite</button>)}
                </div>
              )}
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">What customers see</div><button className="pm-link-btn pm-fs-12" onClick={() => setPreview(true)}>Full preview →</button></div>
              <div className="pm-portal-mini">
                <div className="pm-portal-mini-head" style={{ background: portalSettings.accent }}>{portalSettings.title}</div>
                <div className="pm-portal-mini-body">
                  {feats.viewInvoices && <div>📄 View invoices</div>}
                  {feats.receipts && <div>🧾 Download receipts</div>}
                  {feats.paymentMethods && <div>💳 Update payment method</div>}
                  {feats.updateContact && <div>✏️ Update contact details</div>}
                  {feats.cancelSub && <div>🚪 Cancel subscription</div>}
                  <button className="pm-portal-mini-btn" style={{ background: portalSettings.accent }}>Pay now</button>
                </div>
              </div>
              <div className="pm-note mt-2">Branded with your colours — looks like your own product.</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ════ access link ════ */}
      <AccessLink c={linkFor} onClose={() => setLinkFor(null)} notify={notify} />

      {/* ════ full preview ════ */}
      <PreviewModal open={preview} onClose={() => setPreview(false)} feats={feats} notify={notify} />

      {/* ════ settings ════ */}
      <SettingsModal open={settings} onClose={() => setSettings(false)} feats={feats} setFeats={setFeats} notify={notify} />
    </>
  );
}

/* ── access link ── */

function AccessLink({ c, onClose, notify }: { c: CrmCustomer | null; onClose: () => void; notify: Notify }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => { setCopied(false); }, [c]);
  if (!c) return null;
  const url = `https://pay.paymo.co.ke/portal/tsl/${c.id}`;
  return (
    <Modal open={!!c} onClose={onClose} kicker="Customer Portal" title={`Access link — ${c.name}`} subtitle="One tap and they're in. No password to remember."
      footer={<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>}
    >
      <div className="d-flex gap-3 align-items-center flex-wrap">
        <QrCode value={`PORTAL:${c.id}`} size={116} />
        <div className="flex-grow-1">
          <div className="pm-copy-line">
            <span className="pm-mono pm-fs-12 text-truncate">{url}</span>
            <button className="pm-link-btn" onClick={async () => { await copyText(url); setCopied(true); notify({ tone: "info", title: "Link copied", body: "Paste it into WhatsApp, SMS or email." }); window.setTimeout(() => setCopied(false), 2000); }}>{copied ? "✓ Copied" : "Copy"}</button>
          </div>
          <div className="d-flex gap-2 mt-2 flex-wrap">
            <button className="btn pm-btn-soft btn-sm" onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(`Hi! Here's your customer portal: ${url}`)}`, "_blank"); notify({ tone: "info", title: "WhatsApp opened", body: "Pre-filled message ready to send." }); }}>WhatsApp</button>
            <button className="btn pm-btn-soft btn-sm" onClick={() => { window.location.href = `sms:?body=${encodeURIComponent("Your portal: " + url)}`; notify({ tone: "info", title: "SMS drafted" }); }}>SMS</button>
            <button className="btn pm-btn-soft btn-sm" onClick={() => { window.location.href = `mailto:${c.email}?subject=${encodeURIComponent("Your customer portal")}&body=${encodeURIComponent(url)}`; notify({ tone: "info", title: "Email drafted" }); }}>Email</button>
          </div>
        </div>
      </div>
      <div className="pm-cyan-note mt-3">First visit auto-links their phone number — no setup. The link never expires.</div>
    </Modal>
  );
}

/* ── preview ── */

function PreviewModal({ open, onClose, feats, notify }: {
  open: boolean; onClose: () => void; feats: typeof portalSettings.features; notify: Notify;
}) {
  const invoices = [
    { n: "INV-0146", amt: "KES 12,500", due: "30 Apr 2026", status: "Unpaid" },
    { n: "INV-0141", amt: "KES 12,500", due: "Paid", status: "Paid ✓" },
  ];
  return (
    <Modal open={open} onClose={onClose} kicker="Portal Preview" title="What your customers see" subtitle="Rendered exactly as it appears on their phone." size="lg"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
        <button className="btn pm-btn-primary" onClick={() => { notify({ tone: "info", title: "Portal is live", body: `${portalSettings.title} is public at your permanent URL.` }); onClose(); }}><Globe size={15} /> Open live portal</button></>}
    >
      <div className="pm-checkout-page">
        <div className="pm-checkout-brand" style={{ color: portalSettings.accent }}>{portalSettings.title}</div>
        <div className="pm-muted pm-fs-12">Signed in as Amina Wanjiru · 0712 445 890</div>
        <div className="pm-portal-inv mt-2">
          {invoices.map((i) => (
            <div className="pm-portal-inv-row" key={i.n}>
              <div className="text-start flex-grow-1">
                <b className="pm-fs-13">{i.n}</b>
                <div className="pm-muted pm-fs-11">{i.due}</div>
              </div>
              <div className="text-end">
                <b className="pm-fs-13">{i.amt}</b>
                <div><Badge tone={i.status.startsWith("Paid") ? "success" : "warning"}>{i.status}</Badge></div>
              </div>
            </div>
          ))}
        </div>
        {feats.receipts && <div className="pm-portal-tile">🧾 Download receipt</div>}
        {feats.paymentMethods && <div className="pm-portal-tile">💳 Update payment method</div>}
        <button className="pm-checkout-btn" style={{ background: portalSettings.accent }}>Pay outstanding balance</button>
        <div className="pm-muted pm-fs-11 mt-2">🔒 Secured by PayMo · receipts auto-filed to eTIMS</div>
      </div>
    </Modal>
  );
}

/* ── settings ── */

function SettingsModal({ open, onClose, feats, setFeats, notify }: {
  open: boolean; onClose: () => void; feats: typeof portalSettings.features;
  setFeats: React.Dispatch<React.SetStateAction<typeof portalSettings.features>>; notify: Notify;
}) {
  const [accent, setAccent] = useState(portalSettings.accent);
  const rows: { k: keyof typeof feats; label: string; note: string }[] = [
    { k: "viewInvoices", label: "View invoices", note: "Upcoming and past invoices with status" },
    { k: "receipts", label: "Download receipts", note: "Payment receipts in PDF" },
    { k: "paymentMethods", label: "Update payment method", note: "Save M-Pesa / card for faster paying" },
    { k: "updateContact", label: "Update contact details", note: "Let customers fix their own phone/email" },
    { k: "cancelSub", label: "Cancel subscriptions", note: "Self-service cancellation (if allowed)" },
  ];
  return (
    <Modal open={open} onClose={onClose} kicker="Portal Settings" title="Customer portal settings"
      footer={<button className="btn pm-btn-primary w-100" onClick={() => { notify({ tone: "success", title: "Portal settings saved", body: "Changes are live immediately for all customers." }); onClose(); }}>Save settings</button>}
    >
      {rows.map((r) => (
        <div className="pm-sched-row" key={r.k}>
          <div className="flex-grow-1">
            <b className="pm-fs-13">{r.label}</b>
            <span className="pm-muted pm-fs-11 d-block">{r.note}</span>
          </div>
          <Toggle on={feats[r.k]} onChange={(v) => setFeats({ ...feats, [r.k]: v })} />
        </div>
      ))}
      <Field label="Brand colour"><div className="d-flex gap-2">{[portalSettings.accent, "#0f2744", "#0e7490", "#be123c"].map((c) => <button key={c} className={cls("pm-swatch", accent === c && "pm-swatch-on")} style={{ background: c }} onClick={() => setAccent(c)} />)}</div></Field>
      <div className="pm-cyan-note">The portal is served under pay.paymo.co.ke — it always matches your business branding.</div>
    </Modal>
  );
}
