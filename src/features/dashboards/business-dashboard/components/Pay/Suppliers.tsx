import { useEffect, useState } from "react";
import {
  Plus, Building2, Phone, Mail, MessageCircle, FileText,
  Upload, CheckCircle2, AlertTriangle, Send,
} from "lucide-react";
import type { Bill, Supplier } from "../../dataPay";
import { cls, fmt, fmtDate, uid, type QAction } from "../../lib";
import { Badge, Field, Modal, Section, SlideOver, Stepper } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Suppliers({ suppliers, setSuppliers, bills, notify, emit, qa, onConsume }: {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  bills: Bill[];
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [wizard, setWizard] = useState(false);
  const [profile, setProfile] = useState<Supplier | null>(null);
  const [contactFor, setContactFor] = useState<Supplier | null>(null);
  const [docsFor, setDocsFor] = useState<Supplier | null>(null);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "openSupplier" && typeof qa.p === "string") {
      const s = suppliers.find((x) => x.id === qa.p);
      if (s) setProfile(s);
    }
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const billsFor = (id: string) => bills.filter((b) => b.supplierId === id);

  return (
    <>
      <Section
        no="2.1" sub="Money Out · Vendors" id="sec-suppliers"
        title="Supplier Directory"
        right={
          <>
            <span className="pm-chip"><Building2 size={14} /> {suppliers.filter((s) => s.status === "active").length} active vendors</span>
            <button className="btn pm-btn-out" onClick={() => setWizard(true)}><Plus size={16} /> Add Supplier</button>
          </>
        }
      >
        <div className="row g-3">
          {suppliers.map((s) => (
            <div className="col-12 col-md-6 col-xl-3" key={s.id}>
              <div className="pm-card pm-sup-card h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <span className="pm-sup-ic"><Building2 size={18} /></span>
                  {s.status === "active" ? <Badge tone="success" dot>Active</Badge> : <Badge tone="warning" dot>On hold</Badge>}
                </div>
                <div className="pm-sup-name">{s.name}</div>
                <div className="pm-sup-cat">{s.category}</div>
                <div className="pm-sup-meta">
                  <span className="pm-star-row">{"★".repeat(Math.floor(s.rating))}<i>{s.rating}</i> · {s.terms}</span>
                  <span>{s.wtType}</span>
                </div>
                <div className="pm-sup-stats">
                  <div><b>{fmt(s.owed)}</b><span>owed now</span></div>
                  <div><b>{fmt(s.ytd)}</b><span>paid YTD</span></div>
                </div>
                {s.owed > 0 && <div className={cls("pm-warn-chip w-100 justify-content-start", s.owed > 100000 && "pm-warn-chip-red")}><AlertTriangle size={13} /> {s.owed > 100000 ? "Overdue balance — payment blocked" : "Balance due"}</div>}
                {s.status === "onhold" && <div className="pm-note pm-fs-11 mt-2">{s.note}</div>}
                <div className="d-flex gap-2 mt-auto pt-2">
                  <button className="btn pm-btn-soft btn-sm flex-grow-1" onClick={() => setProfile(s)}>Profile</button>
                  <button className="btn pm-btn-ghost btn-sm" onClick={() => emit({ a: "newBill", p: s.id })}>New Bill</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <SupplierWizard open={wizard} onClose={() => setWizard(false)} notify={notify} setSuppliers={setSuppliers} />

      <SupplierProfile
        s={profile} onClose={() => setProfile(null)} bills={profile ? billsFor(profile.id) : []}
        onContact={(x) => { setProfile(null); setContactFor(x); }}
        onDocs={(x) => { setProfile(null); setDocsFor(x); }}
        emit={emit}
      />

      <ContactSupplierModal s={contactFor} onClose={() => setContactFor(null)} notify={notify} />
      <SupplierDocsModal s={docsFor} onClose={() => setDocsFor(null)} notify={notify} />
    </>
  );
}

/* ── Add supplier wizard (3 steps) ── */

function SupplierWizard({ open, onClose, notify, setSuppliers }: {
  open: boolean; onClose: () => void; notify: Notify;
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ name: "", category: "Goods · Inventory", phone: "", email: "", contact: "", note: "" });
  const [tax, setTax] = useState({ pin: "", wtType: "Goods · WHT 2%", terms: "Net 30" });
  const [bank, setBank] = useState({ bank: "KCB", account: "" });
  useEffect(() => {
    if (open) {
      setStep(1);
      setF({ name: "", category: "Goods · Inventory", phone: "", email: "", contact: "", note: "" });
      setTax({ pin: "", wtType: "Goods · WHT 2%", terms: "Net 30" });
      setBank({ bank: "KCB", account: "" });
    }
  }, [open]);
  const valid1 = f.name && f.phone;
  const valid2 = tax.pin;
  const create = () => {
    setSuppliers((ss) => [...ss, {
      id: uid("s"), name: f.name, category: f.category, phone: f.phone, email: f.email, pin: tax.pin,
      contact: f.contact || f.name, terms: tax.terms, bank: bank.bank, account: "•••• " + (bank.account.slice(-4) || "0000"),
      wtType: tax.wtType, rating: 0, owed: 0, ytd: 0, status: "active", note: f.note || "New supplier — awaiting first order.",
    }]);
    notify({ tone: "success", title: "Supplier added", body: `${f.name} is now in the directory with ${tax.wtType}.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Supplier Onboarding" title="Add a supplier" subtitle="KRA PIN and WHT classification are auto-validated against iTax."
      footer={
        <>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 3 && <button className="btn pm-btn-primary" disabled={step === 1 ? !valid1 : !valid2} onClick={() => setStep(step + 1)}>Continue →</button>}
          {step === 3 && <button className="btn pm-btn-primary" onClick={create}><CheckCircle2 size={15} /> Save supplier</button>}
        </>
      }
    >
      <Stepper steps={3} current={step} labels={["Business details", "Tax & terms", "Review"]} />
      {step === 1 && (
        <div className="row g-3">
          <div className="col-md-6"><Field label="Supplier / business name" req><input className="form-control pm-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Category"><select className="form-select pm-input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}><option>Goods · Inventory</option><option>Goods · Perishables</option><option>Services · Transport</option><option>Professional services</option><option>Contractor · Fit-out</option><option>Equipment</option><option>Other</option></select></Field></div>
          <div className="col-md-6"><Field label="Phone" req><input className="form-control pm-input" placeholder="07XX XXX XXX" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Email (billing)"><input className="form-control pm-input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Contact person"><input className="form-control pm-input" value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Internal note"><input className="form-control pm-input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field></div>
        </div>
      )}
      {step === 2 && (
        <div className="row g-3">
          <div className="col-md-6"><Field label="KRA PIN" req hint="Validated against iTax in the background."><input className="form-control pm-input" placeholder="P0123456X" value={tax.pin} onChange={(e) => setTax({ ...tax, pin: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Payment terms"><select className="form-select pm-input" value={tax.terms} onChange={(e) => setTax({ ...tax, terms: e.target.value })}><option>On delivery</option><option>Net 15</option><option>Net 30</option><option>Net 60</option><option>50% deposit</option></select></Field></div>
          <div className="col-md-6"><Field label="Withholding tax type" hint="Determines how much WHT you deduct & remit to KRA."><select className="form-select pm-input" value={tax.wtType} onChange={(e) => setTax({ ...tax, wtType: e.target.value })}><option>Goods · WHT 2%</option><option>Services · WHT 5%</option><option>Professional · WHT 5%</option><option>Contractor · WHT 3%</option><option>Royalties · WHT 10%</option><option>Rent · WHT 10%</option><option>Exempt</option></select></Field></div>
          <div className="col-md-6"><Field label="Bank"><select className="form-select pm-input" value={bank.bank} onChange={(e) => setBank({ ...bank, bank: e.target.value })}><option>KCB</option><option>Equity</option><option>Co-op</option><option>NCBA</option><option>I&M</option><option>Stanbic</option><option>M-Pesa</option></select></Field></div>
          <div className="col-12"><Field label="Account number"><input className="form-control pm-input" placeholder="Bank account or M-Pesa number" value={bank.account} onChange={(e) => setBank({ ...bank, account: e.target.value })} /></Field></div>
        </div>
      )}
      {step === 3 && (
        <div>
          <div className="pm-summary-card">
            <div className="pm-summary-row"><span>Name</span><b>{f.name || "—"}</b></div>
            <div className="pm-summary-row"><span>Category</span><b>{f.category}</b></div>
            <div className="pm-summary-row"><span>KRA PIN</span><b className="pm-mono">{tax.pin || "—"}</b></div>
            <div className="pm-summary-row"><span>Terms</span><b>{tax.terms}</b></div>
            <div className="pm-summary-row"><span>WHT</span><b>{tax.wtType}</b></div>
            <div className="pm-summary-row"><span>Bank</span><b>{bank.bank} {bank.account}</b></div>
          </div>
          <div className="pm-cyan-note mt-2">On save, PayMo runs the KRA PIN against iTax and files the supplier for eTIMS invoice verification.</div>
        </div>
      )}
    </Modal>
  );
}

/* ── Supplier profile ── */

function SupplierProfile({ s, onClose, bills, onContact, onDocs, emit }: {
  s: Supplier | null; onClose: () => void; bills: Bill[];
  onContact: (s: Supplier) => void; onDocs: (s: Supplier) => void;
  emit: (q: QAction) => void;
}) {
  if (!s) return null;
  return (
    <SlideOver open={!!s} onClose={onClose} kicker="Supplier Profile" title={s.name} width={560}
      footer={
        <>
          <button className="btn pm-btn-soft btn-sm" onClick={() => onContact(s)}><Phone size={14} /> Contact</button>
          <button className="btn pm-btn-soft btn-sm" onClick={() => onDocs(s)}><FileText size={14} /> Documents</button>
          <button className="btn pm-btn-out btn-sm" onClick={() => { onClose(); emit({ a: "newBill", p: s.id }); }}><Plus size={14} /> New Bill</button>
        </>
      }
    >
      <div className="pm-detail-head">
        <div className="d-flex align-items-center gap-3">
          <span className="pm-sup-ic pm-sup-ic-lg"><Building2 size={20} /></span>
          <div>
            <div className="fw-bold">{s.name}</div>
            <div className="pm-muted pm-fs-12">{s.category} · {s.contact} · {s.phone}</div>
            <div className="pm-muted pm-fs-11 pm-mono">KRA PIN {s.pin} · {s.bank} {s.account}</div>
          </div>
        </div>
        <div className="pm-stat-row mt-3">
          <div><b>{fmt(s.owed)}</b><span>owed now</span></div>
          <div><b>{fmt(s.ytd)}</b><span>paid YTD</span></div>
          <div><b>{s.rating ? s.rating : "—"}</b><span>rating</span></div>
          <div><b>{s.terms}</b><span>terms</span></div>
        </div>
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Bills with this supplier ({bills.length})</div>
        {bills.length === 0 && <div className="pm-muted pm-fs-13">No bills yet.</div>}
        {bills.map((b) => (
          <div className="pm-line-view" key={b.id}>
            <div className="flex-grow-1">
              <button className="pm-link-btn pm-fs-13 fw-semibold" onClick={() => { onClose(); emit({ a: "openBill", p: b.id }); }}>{b.number}</button>
              <div className="pm-muted pm-fs-11">Due {fmtDate(b.due)} · {b.etims === "verified" ? "eTIMS verified" : b.etims}</div>
            </div>
            <div className="text-end">
              <b className="pm-fs-13">{fmt(b.amount)}</b>
              <div><Badge tone={b.status === "paid" ? "success" : b.status === "overdue" ? "danger" : b.status === "pending" ? "warning" : "muted"}>{b.status}</Badge></div>
            </div>
          </div>
        ))}
      </div>

      <div className="pm-detail-section">
        <div className="pm-preview-label">Notes & compliance</div>
        <div className="pm-cyan-note">{s.note}</div>
        <div className="pm-note mt-2">WHT classification: <b>{s.wtType}</b>. Certificates for 2025 are available in Compliance (2.9).</div>
      </div>
    </SlideOver>
  );
}

/* ── Contact supplier ── */

function ContactSupplierModal({ s, onClose, notify }: { s: Supplier | null; onClose: () => void; notify: Notify }) {
  const [channel, setChannel] = useState("whatsapp");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (s) setMsg(`Habari ${s.contact}, TechSol Ltd here — re: our account with ${s.name}. Please share the updated statement when you can. Asante!`);
  }, [s]);
  if (!s) return null;
  return (
    <Modal open={!!s} onClose={onClose} kicker="Supplier Contact" title={`Message ${s.name}`} subtitle={`${s.contact} · ${s.phone} · ${s.email}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={() => { notify({ tone: "success", title: `Message sent via ${channel}`, body: `${s.contact} · ${s.phone}` }); onClose(); }}><Send size={15} /> Send message</button></>}
    >
      <div className="pm-mode-tabs mb-3">
        <button className={cls("pm-mode-tab", channel === "whatsapp" && "pm-mode-on")} onClick={() => setChannel("whatsapp")}><MessageCircle size={13} /> WhatsApp</button>
        <button className={cls("pm-mode-tab", channel === "sms" && "pm-mode-on")} onClick={() => setChannel("sms")}><Send size={13} /> SMS</button>
        <button className={cls("pm-mode-tab", channel === "email" && "pm-mode-on")} onClick={() => setChannel("email")}><Mail size={13} /> Email</button>
      </div>
      <textarea className="form-control pm-input" rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} />
    </Modal>
  );
}

/* ── Supplier documents ── */

function SupplierDocsModal({ s, onClose, notify }: { s: Supplier | null; onClose: () => void; notify: Notify }) {
  const [docs, setDocs] = useState<string[]>([]);
  useEffect(() => {
    if (s) setDocs(["wht-certificate-2025.pdf", "contract-annex.pdf", "kra-pin-certificate.pdf"]);
  }, [s]);
  if (!s) return null;
  return (
    <Modal open={!!s} onClose={onClose} kicker="Supplier Documents" title={`${s.name} — documents`}
      footer={<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>}
    >
      {docs.map((d) => (
        <div className="pm-evidence" key={d}>
          <FileText size={14} /> {d}
          <button className="pm-link-btn ms-auto" onClick={() => notify({ tone: "info", title: "Document opened", body: `${d} (demo preview).` })}>View</button>
        </div>
      ))}
      <button className="btn pm-btn-soft btn-sm mt-2" onClick={() => { setDocs((x) => [...x, `statement-${x.length + 1}.pdf`]); notify({ tone: "info", title: "Document added", body: "Uploaded to the supplier vault." }); }}>
        <Upload size={13} /> Upload document
      </button>
      <div className="pm-note mt-2">All supplier documents are encrypted and shared only with your finance team.</div>
    </Modal>
  );
}
