import { useEffect, useState } from "react";
import {
  CreditCard, Plus, Snowflake, Lock, Pencil, ShieldCheck, Truck, CheckCircle2,
} from "lucide-react";
import type { VCard } from "../../dataCash";
import { fmtMoney } from "../../dataCash";
import { cls, uid, type QAction } from "../../lib";
import { Confirm, Field, Kpi, Modal, Section, SlideOver, Stepper, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Cards({ cards, setCards, notify, qa, onConsume }: {
  cards: VCard[];
  setCards: React.Dispatch<React.SetStateAction<VCard[]>>;
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [create, setCreate] = useState(false);
  const [detail, setDetail] = useState<VCard | null>(null);
  const [limits, setLimits] = useState<VCard | null>(null);
  const [pinFor, setPinFor] = useState<VCard | null>(null);
  const [blockFor, setBlockFor] = useState<VCard | null>(null);
  const [physical, setPhysical] = useState(false);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "newCard") setCreate(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const totalSpend = cards.reduce((s, c) => s + c.spent30d, 0);
  const frozen = cards.filter((c) => c.status === "frozen").length;

  return (
    <>
      <Section
        no="3.8" sub="Your Money · Spend Controls" id="sec-cards"
        title="Bank Cards & Limits"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setPhysical(true)}><Truck size={15} /> Request Physical Card</button>
            <button className="btn pm-btn-cyan" onClick={() => setCreate(true)}><Plus size={15} /> New Virtual Card</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<CreditCard size={16} />} label="Active cards" value={`${cards.length} cards`} delta={`${frozen} frozen`} sub="2 virtual · 2 physical" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<ShieldCheck size={16} />} label="Spend (30d)" value={fmtMoney(totalSpend)} delta="within limits" sub="auto-lock at limit" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Lock size={16} />} label="Frozen now" value={`${frozen} card${frozen === 1 ? "" : "s"}`} delta="Travel card" sub="unfreeze with one tap" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CreditCard size={16} />} label="Cashback (30d)" value={fmtMoney(2340)} delta="1.5%" sub="on supplier spend" /></div>
        </div>

        <div className="row g-3">
          {cards.map((c) => {
            const pct = Math.min(100, Math.round((c.spent30d / c.limit) * 100));
            return (
              <div className="col-12 col-md-6 col-xl-3" key={c.id}>
                <div className={cls("pm-card-visual", c.status === "frozen" && "pm-card-frozen")} style={{ background: c.gradient }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <CreditCard size={20} opacity={0.85} />
                    <div className="d-flex flex-column align-items-end gap-1">
                      {c.type === "virtual" ? <span className="pm-card-type">VIRTUAL</span> : <span className="pm-card-type">PHYSICAL</span>}
                      {c.status === "frozen" && <span className="pm-card-type pm-card-frozen-chip">❄ FROZEN</span>}
                    </div>
                  </div>
                  <div className="pm-card-number">{c.number}</div>
                  <div className="d-flex justify-content-between align-items-end mt-1">
                    <div>
                      <div className="pm-card-owner">{c.owner}</div>
                      <div className="pm-card-cur">{c.currency} · {c.name}</div>
                    </div>
                    <b className="pm-fs-14">{fmtMoney(c.spent30d, c.currency)} / {fmtMoney(c.limit, c.currency)}</b>
                  </div>
                  <div className="pm-card-bar"><span style={{ width: `${pct}%`, background: pct > 80 ? "#fbbf24" : "#5eead4" }} /></div>
                </div>
                <div className="d-flex gap-2 mt-2">
                  <button className="btn pm-btn-soft btn-sm flex-grow-1" onClick={() => setDetail(c)}><Pencil size={13} /> Manage</button>
                  <button className={cls("btn btn-sm", c.status === "frozen" ? "pm-btn-primary" : "pm-btn-ghost")} onClick={() => {
                    const st = c.status === "frozen" ? "active" : "frozen";
                    setCards((cs) => cs.map((x) => (x.id === c.id ? { ...x, status: st } : x)));
                    notify({ tone: st === "active" ? "success" : "warning", title: st === "active" ? `${c.name} unfrozen` : `${c.name} frozen`, body: st === "active" ? "Spending works again instantly." : "All transactions declined until you unfreeze." });
                  }}>
                    <Snowflake size={13} /> {c.status === "frozen" ? "Unfreeze" : "Freeze"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── create virtual card (2 steps) ── */}
      <CreateCardWizard open={create} onClose={() => setCreate(false)} notify={notify}
        onCreate={(c) => setCards((cs) => [...cs, c])} />

      {/* ── card detail ── */}
      <CardDetail
        c={detail} onClose={() => setDetail(null)} notify={notify}
        onLimits={(x) => { setDetail(null); setLimits(x); }}
        onPin={(x) => { setDetail(null); setPinFor(x); }}
        onBlock={(x) => { setDetail(null); setBlockFor(x); }}
      />

      {/* ── limits ── */}
      <LimitsModal c={limits} onClose={() => setLimits(null)} notify={notify} setCards={setCards} />

      {/* ── PIN ── */}
      <PinModal c={pinFor} onClose={() => setPinFor(null)} notify={notify} />

      {/* ── block ── */}
      <Confirm open={!!blockFor} onClose={() => setBlockFor(null)}
        onConfirm={() => {
          if (blockFor) setCards((cs) => cs.map((x) => (x.id === blockFor.id ? { ...x, status: "blocked" } : x)));
          notify({ tone: "danger", title: "Card blocked", body: `${blockFor?.name} is permanently blocked. Request a replacement.` });
        }}
        title="Block card" confirmLabel="Block permanently" tone="danger"
        body={<span><b>{blockFor?.number}</b> ({blockFor?.name}) will stop working everywhere. This cannot be undone.</span>}
        icon={<ShieldCheck size={18} />}
      />

      {/* ── physical card request ── */}
      <Modal open={physical} onClose={() => setPhysical(false)} kicker="Physical Card" title="Request a physical card" subtitle="Delivered in 3–5 business days · KES 1,200 annual fee."
        footer={<><button className="btn pm-btn-ghost" onClick={() => setPhysical(false)}>Cancel</button>
          <button className="btn pm-btn-cyan" onClick={() => { notify({ tone: "success", title: "Card ordered", body: "Physical card will be couriered to Westlands office — arrive in 3–5 days." }); setPhysical(false); }}><Truck size={15} /> Order card</button></>}
      >
        <div className="pm-wizard-grid">
          <Field label="Card name"><input className="form-control pm-input" placeholder="e.g. Field Ops Card" /></Field>
          <Field label="Cardholder"><select className="form-select pm-input"><option>Wanjiru K. (Owner)</option><option>Peter N. (Finance)</option><option>Mary Kamau (Ops)</option></select></Field>
          <Field label="Delivery address"><input className="form-control pm-input" defaultValue="Westlands Office Park, 3rd Floor, Nairobi" /></Field>
        </div>
      </Modal>
    </>
  );
}

/* ── create card wizard ── */

function CreateCardWizard({ open, onClose, notify, onCreate }: {
  open: boolean; onClose: () => void; notify: Notify; onCreate: (c: VCard) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("Mercy J.");
  const [ccy, setCcy] = useState("KES");
  const [limit, setLimit] = useState("100000");
  const [online, setOnline] = useState(true);
  useEffect(() => { if (open) { setStep(1); setName(""); setOwner("Mercy J."); setCcy("KES"); setLimit("100000"); setOnline(true); } }, [open]);
  const create = () => {
    onCreate({
      id: uid("vc"), name: name || "New card", type: "virtual", number: "•••• " + String(Math.floor(Math.random() * 9000 + 1000)),
      currency: ccy, owner, spent30d: 0, limit: Number(limit) || 0, online,
      status: "active", gradient: "linear-gradient(135deg, #0e7490, #155e75)",
    });
    notify({ tone: "success", title: "Virtual card created", body: `${name || "New card"} · ${ccy} ${Number(limit).toLocaleString()} limit · ready to use instantly.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Cards" title="Create a virtual card" subtitle="Issued instantly — no credit checks."
      footer={
        <>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button>}
          {step === 1 && <button className="btn pm-btn-cyan" onClick={() => setStep(2)}>Continue →</button>}
          {step === 2 && <button className="btn pm-btn-cyan" onClick={create}><CheckCircle2 size={15} /> Issue card</button>}
        </>
      }
    >
      <Stepper steps={2} current={step} labels={["Card details", "Limits"]} />
      {step === 1 ? (
        <div className="pm-wizard-grid">
          <Field label="Card name" req hint="e.g. Marketing ads, Dev tools…"><input className="form-control pm-input" placeholder="Marketing Team Card" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <div className="row g-2">
            <div className="col-6"><Field label="Cardholder"><select className="form-select pm-input" value={owner} onChange={(e) => setOwner(e.target.value)}>{["Mercy J.", "Kevin O.", "Peter N.", "Mary Kamau"].map((o) => <option key={o}>{o}</option>)}</select></Field></div>
            <div className="col-6"><Field label="Currency"><select className="form-select pm-input" value={ccy} onChange={(e) => setCcy(e.target.value)}><option>KES</option><option>USD</option></select></Field></div>
          </div>
        </div>
      ) : (
        <div className="pm-wizard-grid">
          <Field label="Monthly limit" req><input type="number" className="form-control pm-input pm-input-lg" value={limit} onChange={(e) => setLimit(e.target.value)} /></Field>
          <div className="pm-toggle-row"><Toggle on={online} onChange={setOnline} label="Allow online / card-not-present payments" /></div>
          <div className="pm-cyan-note">Cards auto-lock when the limit is hit — you'll get an instant alert. Limits are editable anytime.</div>
        </div>
      )}
    </Modal>
  );
}

/* ── card detail ── */

function CardDetail({ c, onClose, onLimits, onPin, onBlock }: {
  c: VCard | null; onClose: () => void; notify?: Notify;
  onLimits: (c: VCard) => void; onPin: (c: VCard) => void; onBlock: (c: VCard) => void;
}) {
  if (!c) return null;
  const pct = Math.min(100, Math.round((c.spent30d / c.limit) * 100));
  return (
    <SlideOver open={!!c} onClose={onClose} kicker="Card" title={c.name} width={500}
      footer={
        <>
          <button className="btn pm-btn-soft btn-sm" onClick={() => onPin(c)}><Lock size={14} /> Set PIN</button>
          <button className="btn pm-btn-soft btn-sm" onClick={() => onLimits(c)}><Pencil size={14} /> Limits</button>
          <button className="btn pm-btn-danger-soft btn-sm" onClick={() => onBlock(c)}><ShieldCheck size={14} /> Block card</button>
        </>
      }
    >
      <div className="pm-card-visual mb-3" style={{ background: c.gradient }}>
        <div className="d-flex justify-content-between">
          <CreditCard size={20} opacity={0.85} />
          <span className="pm-card-type">{c.type.toUpperCase()} {c.status !== "active" && `· ${c.status.toUpperCase()}`}</span>
        </div>
        <div className="pm-card-number">{c.number}</div>
        <div className="pm-card-owner">{c.owner} · {c.currency}</div>
      </div>
      <div className="pm-detail-section">
        <div className="pm-preview-label">Spend this month</div>
        <div className="d-flex justify-content-between pm-fs-13 mb-1"><span>{fmtMoney(c.spent30d, c.currency)}</span><span className="pm-muted">of {fmtMoney(c.limit, c.currency)}</span></div>
        <div className="progress pm-prog"><div className="progress-bar" style={{ width: `${pct}%`, background: pct > 80 ? "#f59e0b" : "#0e7490" }} /></div>
      </div>
      <div className="pm-detail-section">
        <div className="pm-preview-label">Settings</div>
        <div className="pm-stat-row">
          <div><b>{c.online ? "On" : "Off"}</b><span>online payments</span></div>
          <div><b>{c.status === "active" ? "Working" : "Frozen"}</b><span>status</span></div>
          <div><b>2.4%</b><span>cashback rate</span></div>
        </div>
      </div>
      <div className="pm-detail-section">
        <div className="pm-preview-label">Recent authorisations</div>
        {[
          { t: "today 11:20", m: "Google Ads · KES 24,000", ok: true },
          { t: "yesterday", m: "Canva Pro · KES 1,800", ok: true },
          { t: "2 days ago", m: "Declined — daily limit · KES 40,000", ok: false },
        ].map((x, i) => (
          <div className="pm-tl-item" key={i}>
            <span className={cls("pm-tl-dot", x.ok ? "pm-tl-dot-pay" : "pm-tl-dot-rem")} />
            <div><div className="pm-fs-13">{x.m}</div><div className="pm-muted pm-fs-11">{x.t}</div></div>
          </div>
        ))}
      </div>
    </SlideOver>
  );
}

/* ── limits ── */

function LimitsModal({ c, onClose, notify, setCards }: {
  c: VCard | null; onClose: () => void; notify: Notify;
  setCards: React.Dispatch<React.SetStateAction<VCard[]>>;
}) {
  const [limit, setLimit] = useState("");
  const [online, setOnline] = useState(true);
  useEffect(() => { if (c) { setLimit(String(c.limit)); setOnline(c.online); } }, [c]);
  if (!c) return null;
  const save = () => {
    setCards((cs) => cs.map((x) => (x.id === c.id ? { ...x, limit: Number(limit) || x.limit, online } : x)));
    notify({ tone: "success", title: "Card limits updated", body: `${c.name} · monthly ${fmtMoney(Number(limit))} · online ${online ? "ON" : "OFF"}.` });
    onClose();
  };
  return (
    <Modal open={!!c} onClose={onClose} kicker="Card Controls" title={`Limits — ${c.name}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" onClick={save}>Save limits</button></>}
    >
      <Field label="Monthly limit"><input type="number" className="form-control pm-input pm-input-lg" value={limit} onChange={(e) => setLimit(e.target.value)} /></Field>
      <div className="pm-toggle-row"><Toggle on={online} onChange={setOnline} label="Online / card-not-present payments" /></div>
      <div className="pm-note">Changes apply to the next authorisation immediately.</div>
    </Modal>
  );
}

/* ── PIN ── */

function PinModal({ c, onClose, notify }: { c: VCard | null; onClose: () => void; notify: Notify }) {
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  if (!c) return null;
  const save = () => {
    if (pin.length !== 4 || pin !== pin2) { notify({ tone: "warning", title: "PINs don't match", body: "Use a 4-digit PIN and confirm it correctly." }); return; }
    notify({ tone: "success", title: "PIN set", body: `${c.name} PIN updated.` });
    onClose();
  };
  return (
    <Modal open={!!c} onClose={onClose} kicker="Card PIN" title={`Set PIN — ${c.name}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-cyan" onClick={save}>Set PIN</button></>}
    >
      <div className="row g-3">
        <div className="col-6"><Field label="New 4-digit PIN"><input type="password" maxLength={4} className="form-control pm-input pm-input-lg pm-mono" value={pin} onChange={(e) => setPin(e.target.value)} /></Field></div>
        <div className="col-6"><Field label="Confirm PIN"><input type="password" maxLength={4} className="form-control pm-input pm-input-lg pm-mono" value={pin2} onChange={(e) => setPin2(e.target.value)} /></Field></div>
      </div>
      <div className="pm-note">The PIN is used at POS for physical cards and for 3D-Secure online.</div>
    </Modal>
  );
}
