import { useEffect, useState } from "react";
import {
  Plus, Copy, Eye, Link2, Globe, PauseCircle, PlayCircle, Store,
  QrCode as QrIco, MousePointerClick, TrendingUp,
} from "lucide-react";
import type { PayLink } from "../../dataGetpaid";
import { addDays, cls, copyText, fmt, fmtDate, todayISO, uid, type QAction } from "../../lib";
import { Badge, Field, Kpi, Modal, Section, SlideOver, Sparkline, Stepper, Toggle } from "./ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

const COLORS = ["#0ea37f", "#0f2744", "#7c3aed", "#e11d48", "#f59e0b"];

export default function Links({ links, setLinks, notify, qa, onConsume }: {
  links: PayLink[];
  setLinks: React.Dispatch<React.SetStateAction<PayLink[]>>;
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [detail, setDetail] = useState<PayLink | null>(null);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "createLink") setCreateOpen(true);
    if (qa.a === "builder") setBuilderOpen(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const active = links.filter((l) => l.status === "active");
  const views = links.reduce((s, l) => s + l.views, 0);
  const collected = links.reduce((s, l) => s + l.collected, 0);

  return (
    <>
      <Section
        no="1.7" sub="Money In · Online Checkout" id="sec-links"
        title="Payment Links & Checkout Pages"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setBuilderOpen(true)}><Store size={15} /> Checkout Builder</button>
            <button className="btn pm-btn-primary" onClick={() => setCreateOpen(true)}><Plus size={15} /> Create Payment Link</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-4"><Kpi icon={<Link2 size={16} />} label="Active links" value={`${active.length} links`} delta={`${active.length} paying now`} sub="expiry managed automatically" /></div>
          <div className="col-6 col-lg-4"><Kpi icon={<Eye size={16} />} label="Link views" value={String(views)} delta="12.8%" sub="vs last month" /></div>
          <div className="col-6 col-lg-4"><Kpi icon={<TrendingUp size={16} />} label="Collected via links" value={fmt(collected)} delta="9.4%" sub="conversion 24%" /></div>
        </div>

        <div className="row g-3">
          {links.map((l) => (
            <div className="col-12 col-md-6 col-xl-4" key={l.id}>
              <div className={cls("pm-card pm-link-card", l.status !== "active" && "pm-link-dim")}>
                <div className="d-flex justify-content-between align-items-start">
                  <span className="pm-chan-ic pm-chan-ic-links"><Link2 size={18} /></span>
                  {l.status === "active" && <Badge tone="success" dot>Active</Badge>}
                  {l.status === "expired" && <Badge tone="muted">Expired</Badge>}
                  {l.status === "disabled" && <Badge tone="dark">Paused</Badge>}
                </div>
                <div className="pm-link-title mt-2">{l.title}</div>
                <div className="pm-link-amount">{fmt(l.amount)}</div>
                <div className="pm-muted pm-fs-12">Expires {fmtDate(l.expires)}</div>
                <div className="pm-chan-stats mt-2">
                  <div>
                    <div className="pm-chan-statv pm-fs-14">{l.views} views · {l.pays} payments</div>
                    <div className="pm-chan-statl">collected {fmt(l.collected)}</div>
                  </div>
                  <Sparkline data={l.spark} color="#7c3aed" w={84} h={30} />
                </div>
                <div className="d-flex gap-2 mt-2">
                  <button className="btn pm-btn-soft btn-sm flex-grow-1" onClick={() => setDetail(l)}><Eye size={14} /> Performance</button>
                  <button className="btn pm-btn-ghost btn-sm" onClick={async () => { await copyText(`https://pay.link/p/tsl/${l.id}`); notify({ tone: "info", title: "Link copied", body: "Ready to paste into WhatsApp, SMS or email." }); }}>
                    <Copy size={14} />
                  </button>
                  <button className="btn pm-btn-ghost btn-sm" onClick={() => { const st = l.status === "active" ? "disabled" : "active"; setLinks((ls) => ls.map((x) => (x.id === l.id ? { ...x, status: st as PayLink["status"] } : x))); notify({ tone: st === "active" ? "success" : "warning", title: st === "active" ? "Link re-enabled" : "Link paused", body: l.title }); }}>
                    {l.status === "active" ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pm-tip mt-3">
          <Store size={15} />
          <span><b>No-code checkout:</b> build a branded payment page (logo, colours, payment methods) and share one permanent URL. <button className="pm-link-btn" onClick={() => setBuilderOpen(true)}>Open the builder →</button></span>
        </div>
      </Section>

      <CreateLinkModal open={createOpen} onClose={() => setCreateOpen(false)} notify={notify}
        onCreate={(l) => { setLinks((ls) => [{ ...l, id: uid("l"), views: 0, pays: 0, collected: 0, spark: [0, 0, 0, 0, 0, 0, 0] }, ...ls]); }} />

      <CheckoutBuilder open={builderOpen} onClose={() => setBuilderOpen(false)} notify={notify} />

      <LinkDetail l={detail} onClose={() => setDetail(null)} notify={notify} />
    </>
  );
}

/* ── create link ── */

function CreateLinkModal({ open, onClose, notify, onCreate }: {
  open: boolean; onClose: () => void; notify: Notify; onCreate: (l: PayLink) => void;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expiry, setExpiry] = useState("30");
  const [note, setNote] = useState("");
  const [made, setMade] = useState("");
  useEffect(() => { if (open) { setTitle(""); setAmount(""); setExpiry("30"); setNote(""); setMade(""); } }, [open]);
  const valid = title.trim() && Number(amount) > 0;
  const create = () => {
    const l: PayLink = {
      id: "tmp", title, amount: Number(amount), expires: addDays(todayISO(), Number(expiry)),
      views: 0, pays: 0, collected: 0, status: "active", spark: [0, 0, 0, 0, 0, 0, 0],
    };
    onCreate(l);
    setMade(`https://pay.link/p/tsl/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 18)}`);
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Payment Links" title="Create payment link"
      footer={!made ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" disabled={!valid} onClick={create}><Link2 size={15} /> Generate link</button></>)
        : (<button className="btn pm-btn-primary w-100" onClick={() => { notify({ tone: "success", title: "Link live", body: `${title} is now collecting.` }); onClose(); }}>Done</button>)}
    >
      {!made ? (
        <div className="pm-wizard-grid">
          <Field label="What is this for?" req><input className="form-control pm-input" placeholder="e.g. May retainer — Akili Studio" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <Field label="Amount (KES)" req><input type="number" className="form-control pm-input pm-input-lg" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Field label="Expires in">
            <select className="form-select pm-input" value={expiry} onChange={(e) => setExpiry(e.target.value)}>
              <option value="7">7 days</option><option value="30">30 days</option><option value="90">90 days</option><option value="365">Never (until disabled)</option>
            </select>
          </Field>
          <Field label="Note for customer"><input className="form-control pm-input" placeholder="Optional" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        </div>
      ) : (
        <div className="text-center py-2">
          <div className="pm-big-ic pm-big-ic-success"><QrIco size={26} /></div>
          <h6 className="fw-bold mt-2">Link generated</h6>
          <div className="pm-copy-line mx-auto mt-2">
            <span className="pm-mono pm-fs-12">{made}</span>
            <button className="pm-link-btn" onClick={async () => { await copyText(made); notify({ tone: "info", title: "Copied" }); }}>Copy</button>
          </div>
          <div className="d-flex gap-2 mt-3 justify-content-center">
            <button className="btn pm-btn-soft btn-sm" onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent("Please pay here: " + made)}`, "_blank"); }}>WhatsApp</button>
            <button className="btn pm-btn-soft btn-sm" onClick={() => { window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(made)}`; }}>Email</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ── checkout builder ── */

function CheckoutBuilder({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState("TechSol Ltd");
  const [color, setColor] = useState(COLORS[0]);
  const [headline, setHeadline] = useState("Pay TechSol Ltd securely");
  const [amount, setAmount] = useState("25000");
  const [methods, setMethods] = useState<string[]>(["M-Pesa", "Card"]);
  const [published, setPublished] = useState(false);
  const url = "https://pay.link/tsl/checkout";
  useEffect(() => { if (open) { setStep(1); setPublished(false); } }, [open]);
  const publish = () => { setPublished(true); notify({ tone: "success", title: "Checkout page published", body: "One permanent URL — share it anywhere." }); };
  return (
    <Modal open={open} onClose={onClose} kicker="Checkout Builder" title="Branded payment page" size="lg"
      footer={published ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Close</button><button className="btn pm-btn-primary" onClick={async () => { await copyText(url); notify({ tone: "info", title: "Checkout URL copied" }); }}><Copy size={15} /> Copy URL</button></>)
        : (<>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 3 && <button className="btn pm-btn-primary" onClick={() => setStep(step + 1)}>Continue →</button>}
          {step === 3 && <button className="btn pm-btn-primary" onClick={publish}><Globe size={15} /> Publish page</button>}
        </>)}
    >
      <Stepper steps={3} current={step} labels={["Brand", "Amount & Methods", "Publish"]} />
      <div className="pm-builder-grid">
        <div>
          {step === 1 && (
            <div className="pm-wizard-grid">
              <Field label="Business name"><input className="form-control pm-input" value={brand} onChange={(e) => setBrand(e.target.value)} /></Field>
              <Field label="Headline"><input className="form-control pm-input" value={headline} onChange={(e) => setHeadline(e.target.value)} /></Field>
              <Field label="Brand colour">
                <div className="d-flex gap-2">
                  {COLORS.map((c) => (
                    <button key={c} className={cls("pm-swatch", color === c && "pm-swatch-on")} style={{ background: c }} onClick={() => setColor(c)} />
                  ))}
                </div>
              </Field>
            </div>
          )}
          {step === 2 && (
            <div className="pm-wizard-grid">
              <Field label="Default amount (KES)" hint="Customer can edit if you enable flexible amounts.">
                <input type="number" className="form-control pm-input pm-input-lg" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </Field>
              <div className="pm-toggle-row"><Toggle on={true} onChange={() => {}} label="Allow customer to edit amount" /></div>
              <Field label="Payment methods">
                <div className="pm-check-grid">
                  {["M-Pesa", "Card", "QR Code", "PesaLink"].map((m) => (
                    <button key={m} className={cls("pm-check-chip", methods.includes(m) && "pm-check-on")} onClick={() => setMethods((x) => (x.includes(m) ? x.filter((y) => y !== m) : [...x, m]))}>
                      {methods.includes(m) ? "✓ " : ""}{m}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}
          {step === 3 && (
            <div>
              <div className="pm-summary-card">
                <div className="pm-summary-row"><span>URL</span><b className="pm-mono pm-fs-12">{url}</b></div>
                <div className="pm-summary-row"><span>Brand</span><b>{brand}</b></div>
                <div className="pm-summary-row"><span>Default amount</span><b>{fmt(Number(amount) || 0)}</b></div>
                <div className="pm-summary-row"><span>Methods</span><b>{methods.join(", ")}</b></div>
              </div>
              <div className="pm-cyan-note">Publishing makes the page live instantly. You can edit and re-publish anytime — old links keep working.</div>
            </div>
          )}
        </div>
        {/* live preview */}
        <div className="pm-checkout-preview">
          <div className="pm-preview-label mb-2">Live preview</div>
          <div className="pm-checkout-page" style={{ borderTop: `6px solid ${color}` }}>
            <div className="pm-checkout-brand" style={{ color }}>{brand}</div>
            <div className="pm-checkout-amt">{fmt(Number(amount) || 0)}</div>
            <div className="pm-muted pm-fs-12">{headline}</div>
            <div className="pm-checkout-methods">
              {methods.map((m) => <span className="pm-checkout-chip" key={m}>{m}</span>)}
            </div>
            <button className="pm-checkout-btn" style={{ background: color }}>Pay now</button>
            <div className="pm-muted pm-fs-11 mt-2">🔒 Secured by PayMo · eTIMS receipt emailed</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ── link detail ── */

function LinkDetail({ l, onClose, notify }: { l: PayLink | null; onClose: () => void; notify: Notify }) {
  const [copied, setCopied] = useState(false);
  if (!l) return null;
  const url = `https://pay.link/p/tsl/${l.id}`;
  return (
    <SlideOver open={!!l} onClose={onClose} kicker="Link Performance" title={l.title} width={520}
      footer={
        <>
          <button className="btn pm-btn-ghost btn-sm" onClick={onClose}>Close</button>
          <button className="btn pm-btn-primary btn-sm" onClick={async () => { await copyText(url); setCopied(true); notify({ tone: "info", title: "Link copied" }); window.setTimeout(() => setCopied(false), 2000); }}>
            {copied ? "✓ Copied" : <><Copy size={14} /> Copy link</>}
          </button>
        </>
      }
    >
      <div className="pm-detail-head">
        <div className="pm-money-lg">{fmt(l.amount)}</div>
        <div className="pm-muted pm-fs-13">Expires {fmtDate(l.expires)} · {l.status === "active" ? "collecting" : l.status}</div>
      </div>
      <div className="pm-stat-row">
        <div><b>{l.views}</b><span>views</span></div>
        <div><b>{l.pays}</b><span>payments</span></div>
        <div><b>{Math.round((l.pays / Math.max(1, l.views)) * 100)}%</b><span>conversion</span></div>
        <div><b>{fmt(l.collected)}</b><span>collected</span></div>
      </div>
      <div className="pm-detail-section">
        <div className="pm-preview-label">Views per day (7 days)</div>
        <Sparkline data={l.spark} color="#7c3aed" w={460} h={60} />
      </div>
      <div className="pm-detail-section">
        <div className="pm-preview-label">Payments via this link</div>
        {Array.from({ length: l.pays }, (_, i) => (
          <div className="pm-tx-row" key={i}>
            <div>
              <div className="fw-semibold pm-fs-13">Payment #{i + 1}</div>
              <div className="pm-muted pm-fs-11">M-Pesa · ref LNK{120 + i}QZ</div>
            </div>
            <div className="text-end">
              <b className="pm-fs-13">{fmt(Math.round(l.amount))}</b>
              <div><Badge tone="success" dot>Settled</Badge></div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-cyan-note"><MousePointerClick size={14} /> Tip: links sent via WhatsApp convert 3× better than email in this account.</div>
    </SlideOver>
  );
}
