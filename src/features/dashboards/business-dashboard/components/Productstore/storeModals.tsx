import { useMemo, useState } from "react";
import { THEMES, fmtKES } from "./data";
import type { Discount } from "./data";
import { useStore } from "./store";
import { Badge, Field, Modal, WizardShell } from "./ui";

/* ==================================================================
   STORE PREVIEW — mock storefront in browser chrome (uses live theme)
================================================================== */
export function StorePreviewModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { config, products, addOrder, recordActivity, toast, openModal } = useStore();
  const t = THEMES.find((x) => x.id === config.theme) ?? THEMES[0];
  const listed = products.filter((p) => p.status === "Active" && p.listed);
  const featured = listed.filter((p) => p.featured).slice(0, 4);
  const grid = (featured.length >= 4 ? featured : listed).slice(0, 8);

  const simulateOrder = () => {
    const item = listed[0];
    const order = {
      id: "ORD-" + (1103 + Math.floor(Math.random() * 5)),
      customer: "Demo Customer", email: "demo@paymo.store", phone: "0700 000 000",
      channel: "Online Store" as const,
      items: item ? [{ name: item.name, qty: 1, price: item.price, emoji: item.emoji, sku: item.sku }] : [],
      total: item ? item.price : 0, payment: "M-Pesa" as const, status: "New" as const,
      date: "Just now", location: "Nairobi", deliveryFee: 300,
      events: [{ time: "Just now", title: "Order placed", note: "Test order from store preview" }],
    };
    addOrder(order);
    recordActivity(`Test order ${order.id} placed via store preview`, "bi-bag-check");
    toast(`${order.id} received (test order) — see the Orders section.`, "success", "Demo checkout complete");
  };

  return (
    <Modal open onClose={onClose} title="Storefront preview" subtitle={`Live at ${config.customDomain ?? config.domain}`} icon="bi-eye" size="xl" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary me-auto" onClick={onClose}><i className="bi bi-x-lg me-1" /> Close preview</button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { onClose(); openModal("share"); }}><i className="bi bi-share me-1" /> Share</button>
          <button type="button" className="btn btn-primary" onClick={simulateOrder}><i className="bi bi-bag-plus me-1" /> Simulate order</button>
        </>
      }
    >
      <div className="pm-browser">
        <div className="pm-browser-top">
          <span className="b-dot" style={{ background: "#f04438" }} />
          <span className="b-dot" style={{ background: "#f79009" }} />
          <span className="b-dot" style={{ background: "#12b76a" }} />
          <div className="pm-browser-url"><i className="bi bi-lock-fill me-1" />{config.customDomain ?? config.domain}</div>
          <Badge tone={config.live ? "green" : "amber"}>{config.live ? "● Live" : "Preview mode"}</Badge>
        </div>
        <div style={{ background: t.vars.bg, color: t.vars.ink }}>
          {/* announcement */}
          {config.sections.announcement && (
            <div style={{ background: t.vars.accent, color: "#fff", fontSize: "0.7rem", padding: "0.4rem 1rem", textAlign: "center" }}>
              {config.announcement}
            </div>
          )}
          {/* header */}
          <div className="d-flex align-items-center justify-content-between px-3 py-2" style={{ borderBottom: `1px solid ${t.vars.soft}` }}>
            <div className="d-flex align-items-center gap-2 fw-bold">
              <span style={{ fontSize: "1.3rem" }}>{config.logoEmoji}</span>
              <span style={{ fontSize: "0.95rem" }}>{config.name}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: "0.72rem", opacity: 0.8 }}>KES · Kenya 🇰🇪</span>
              <span className="d-inline-grid" style={{ width: 26, height: 26, borderRadius: 7, background: t.vars.accent, color: "#fff", placeItems: "center", fontSize: "0.7rem" }}>
                <i className="bi bi-bag" />
              </span>
            </div>
          </div>
          {/* hero */}
          {config.sections.hero && (
            <div className="p-4 text-center" style={{ background: `linear-gradient(135deg, ${t.vars.soft}, ${t.vars.bg})` }}>
              <div style={{ fontSize: "1.35rem", fontWeight: 800 }}>{config.name}</div>
              <div style={{ fontSize: "0.8rem", opacity: 0.75 }}>{config.tagline}</div>
              <div className="mt-2 d-inline-block px-3 py-1 rounded-pill text-white" style={{ background: t.vars.accent, fontSize: "0.74rem", fontWeight: 700 }}>
                Shop now →
              </div>
            </div>
          )}
          {/* categories */}
          {config.sections.categories && (
            <div className="d-flex gap-2 px-3 py-2 flex-wrap">
              {["All", "Food & Beverage", "Crafts & Art", "Home & Living", "Beauty & Wellness"].map((c) => (
                <span key={c} className="px-2 py-1 rounded-pill" style={{ fontSize: "0.66rem", fontWeight: 600, background: c === "All" ? t.vars.accent : t.vars.card, color: c === "All" ? "#fff" : t.vars.ink, border: `1px solid ${t.vars.soft}` }}>
                  {c}
                </span>
              ))}
            </div>
          )}
          {/* products */}
          <div className="p-3">
            {config.sections.featured && <div style={{ fontSize: "0.8rem", fontWeight: 800, marginBottom: 6 }}>⭐ Featured products</div>}
            <div className="row g-2">
              {grid.map((p) => (
                <div className="col-3" key={p.id}>
                  <div style={{ background: t.vars.card, borderRadius: 10, overflow: "hidden", border: `1px solid ${t.vars.soft}` }}>
                    <img src={p.img} alt="" style={{ width: "100%", height: 64, objectFit: "cover", display: "block" }} />
                    <div className="p-2">
                      <div style={{ fontSize: "0.62rem", fontWeight: 700, lineHeight: 1.2, minHeight: 26 }}>{p.name}</div>
                      <div style={{ fontSize: "0.66rem", fontWeight: 800, color: t.vars.accent }}>{fmtKES(p.price)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* testimonials */}
          {config.sections.testimonials && (
            <div className="px-3 pb-3">
              <div style={{ background: t.vars.card, border: `1px solid ${t.vars.soft}`, borderRadius: 10, padding: "0.7rem", fontSize: "0.68rem" }}>
                “The kiondo arrived in two days — quality ni nzuri sana!” — Grace W., Nairobi ★★★★★
              </div>
            </div>
          )}
          {/* footer */}
          <div className="p-3 text-center" style={{ background: t.vars.ink, color: t.vars.bg, fontSize: "0.66rem" }}>
            {config.name} · Powered by <b>PayMo</b> · M-Pesa &amp; Cards accepted · eTIMS receipts
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ==================================================================
   THEME CUSTOMIZER — 4-step wizard
================================================================== */
export function ThemeCustomizerModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { config, setConfig, recordActivity, toast } = useStore();
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState(config.theme);
  const [sections, setSections] = useState({ ...config.sections });
  const [name, setName] = useState(config.name);
  const [tagline, setTagline] = useState(config.tagline);
  const [announcement, setAnnouncement] = useState(config.announcement);
  const [logo, setLogo] = useState(config.logoEmoji);
  const steps = [
    { label: "Theme", icon: "bi-palette" },
    { label: "Layout", icon: "bi-layout-three-columns" },
    { label: "Branding", icon: "bi-stars" },
    { label: "Apply", icon: "bi-check2-circle" },
  ];
  return (
    <Modal open onClose={onClose} title="Customize store theme" subtitle="Changes preview instantly — published when you apply" icon="bi-palette" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Next <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => {
              setConfig({ theme, sections, name, tagline, announcement, logoEmoji: logo });
              recordActivity(`Storefront theme updated → ${THEMES.find((t) => t.id === theme)?.name}`, "bi-palette");
              toast("Storefront updated — changes are live on " + config.domain + ".", "success", "Theme applied");
              onClose();
            }}>
              <i className="bi bi-rocket-takeoff me-1" /> Publish changes
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={steps} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            {THEMES.map((t) => (
              <div className="col-md-4" key={t.id}>
                <div className={`pm-theme-card ${theme === t.id ? "sel" : ""}`} onClick={() => setTheme(t.id)}>
                  <div className="pm-theme-thumb" style={{ background: t.vars.bg }}>
                    <span style={{ fontSize: "1.8rem" }}>{t.emoji}</span>
                    <span className="d-flex gap-1">
                      <span className="rounded-circle" style={{ width: 10, height: 10, background: t.vars.accent }} />
                      <span className="rounded-circle" style={{ width: 10, height: 10, background: t.vars.ink }} />
                      <span className="rounded-circle" style={{ width: 10, height: 10, background: t.vars.soft }} />
                    </span>
                  </div>
                  <div className="p-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <b style={{ fontSize: "0.82rem" }}>{t.name}</b>
                      {theme === t.id && <i className="bi bi-check-circle-fill text-primary" />}
                    </div>
                    <div className="pm-prod-meta">{t.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="row g-2">
            {Object.entries(sections).map(([k, v]) => (
              <div className="col-md-6" key={k}>
                <div className="d-flex align-items-center justify-content-between p-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                  <span className="fw-semibold text-capitalize" style={{ fontSize: "0.84rem" }}>
                    <i className={`bi ${k === "hero" ? "bi-image" : k === "announcement" ? "bi-megaphone" : k === "featured" ? "bi-star" : k === "categories" ? "bi-grid" : k === "testimonials" ? "bi-chat-quote" : k === "newsletter" ? "bi-envelope" : "bi-journal"} me-2`} />
                    {k === "hero" ? "Hero banner" : k === "announcement" ? "Announcement bar" : k === "featured" ? "Featured products" : k === "categories" ? "Category menu" : k === "testimonials" ? "Customer testimonials" : k === "newsletter" ? "Newsletter signup" : "Blog section"}
                  </span>
                  <div className="form-check form-switch mb-0">
                    <input className="form-check-input" type="checkbox" checked={v} onChange={(e) => setSections((s) => ({ ...s, [k]: e.target.checked }))} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Store name" className="col-md-6">
              <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Logo emoji" className="col-md-2">
              <input className="form-control text-center" style={{ fontSize: "1.3rem" }} value={logo} onChange={(e) => setLogo(e.target.value)} />
            </Field>
            <Field label="Tagline" className="col-md-4">
              <input className="form-control" value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </Field>
            <Field label="Announcement bar text" className="col-12">
              <input className="form-control" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} />
            </Field>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="d-flex gap-3 mb-3">
              {THEMES.map((t) => (
                <span key={t.id} className={`pm-chip ${theme === t.id ? "on" : ""}`}>{t.emoji} {t.name}</span>
              ))}
            </div>
            <div className="pm-note">
              <i className="bi bi-check2-circle me-1 text-primary" />
              Ready to publish: theme <b>{THEMES.find((t) => t.id === theme)?.name}</b>, {Object.values(sections).filter(Boolean).length} sections on, brand “{name}”.
              <div className="pm-prod-meta mt-1">Existing orders, discounts and payments are unaffected.</div>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   PUBLISH WIZARD — 4-step launch flow
================================================================== */
export function PublishWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { config, setConfig, recordActivity, toast, openModal } = useStore();
  const [step, setStep] = useState(0);
  const [domainChoice, setDomainChoice] = useState<"sub" | "custom">("sub");
  const checks = [
    { label: "At least 3 products listed", ok: true },
    { label: "Payment rail configured (M-Pesa)", ok: config.payments.mpesa },
    { label: "Shipping zones set", ok: config.zones.length > 0 },
    { label: "eTIMS validation passed", ok: config.vatRegistered },
    { label: "Returns policy published", ok: config.returnsPolicy },
  ];
  const steps = [
    { label: "Checklist", icon: "bi-list-check" },
    { label: "Domain", icon: "bi-globe2" },
    { label: "Payments", icon: "bi-credit-card" },
    { label: "Launch", icon: "bi-rocket-takeoff" },
  ];
  return (
    <Modal open onClose={onClose} title="Publish your online store" subtitle="4 steps to going live — no code needed" icon="bi-rocket-takeoff" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && step < 3 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Continue <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-success btn-lg" onClick={() => {
              setConfig({ live: true });
              recordActivity("Online store published — now LIVE", "bi-rocket-takeoff");
              toast("🎉 Your store is LIVE at " + (domainChoice === "custom" ? (config.customDomain ?? config.domain) : config.domain), "success", "Store published");
              onClose();
            }}>
              <i className="bi bi-rocket-takeoff me-1" /> Go Live!
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={steps} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            {checks.map((c) => (
              <div key={c.label} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                {c.ok ? <i className="bi bi-check-circle-fill text-primary" /> : <i className="bi bi-exclamation-circle-fill" style={{ color: "var(--pm-warn)" }} />}
                <span style={{ fontSize: "0.86rem" }}>{c.label}</span>
                {c.ok ? <Badge tone="green" className="ms-auto">Passed</Badge> : <Badge tone="amber" className="ms-auto">Fix</Badge>}
              </div>
            ))}
            {!config.payments.mpesa && (
              <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => openModal("payments")}>
                <i className="bi bi-gear me-1" /> Fix payment rails
              </button>
            )}
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <div className="col-12">
              <div className="d-flex flex-column gap-2">
                <label className="d-flex align-items-center gap-2 p-3" style={{ border: "2px solid " + (domainChoice === "sub" ? "var(--pm-green)" : "var(--pm-border)"), borderRadius: 12, cursor: "pointer" }}>
                  <input type="radio" className="form-check-input mt-0" checked={domainChoice === "sub"} onChange={() => setDomainChoice("sub")} />
                  <div className="flex-grow-1">
                    <b style={{ fontSize: "0.86rem" }}>Free PayMo subdomain</b>
                    <div className="pm-prod-meta">tsretail.paymo.store — SSL included, live in seconds</div>
                  </div>
                  <Badge tone="green">FREE</Badge>
                </label>
                <label className="d-flex align-items-center gap-2 p-3" style={{ border: "2px solid " + (domainChoice === "custom" ? "var(--pm-green)" : "var(--pm-border)"), borderRadius: 12, cursor: "pointer" }}>
                  <input type="radio" className="form-check-input mt-0" checked={domainChoice === "custom"} onChange={() => setDomainChoice("custom")} />
                  <div className="flex-grow-1">
                    <b style={{ fontSize: "0.86rem" }}>Custom domain</b>
                    <div className="pm-prod-meta">{config.customDomain ? `${config.customDomain} — connected ✓` : "e.g. www.sokosanaa.co.ke — takes 24h for DNS"}</div>
                  </div>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("domain")}>Connect</button>
                </label>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            {[
              { k: "mpesa", name: "M-Pesa Express (STK Push)", desc: "Customer confirms on their phone — 98% approval rate in KE", icon: "bi-phone" },
              { k: "card", name: "Card payments (DPO)", desc: "Visa & Mastercard — international shoppers", icon: "bi-credit-card" },
              { k: "pesalink", name: "PesaLink (bank-to-bank)", desc: "Direct from 40+ Kenyan banks", icon: "bi-bank" },
              { k: "cod", name: "Cash on delivery", desc: "Customer pays the rider", icon: "bi-cash" },
            ].map((p) => {
              const key = p.k as keyof typeof config.payments;
              return (
                <div className="col-12" key={p.k}>
                  <div className="d-flex align-items-center gap-2 p-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                    <i className={`bi ${p.icon}`} style={{ fontSize: "1.2rem", color: "var(--pm-green-dark)" }} />
                    <div className="flex-grow-1">
                      <b style={{ fontSize: "0.84rem" }}>{p.name}</b>
                      <div className="pm-prod-meta">{p.desc}</div>
                    </div>
                    <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" checked={config.payments[key]} onChange={(e) => setConfig({ payments: { ...config.payments, [key]: e.target.checked } })} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {step === 3 && (
          <div className="text-center py-4">
            <div style={{ fontSize: "3rem" }}>🎉</div>
            <h5 className="mt-2">Everything is ready!</h5>
            <p className="pm-prod-meta">
              Your store will go live at <b>{domainChoice === "custom" ? (config.customDomain ?? config.domain) : config.domain}</b>.<br />
              M-Pesa, Card, PesaLink and COD rails are active. eTIMS receipts auto-generate on every sale.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <Badge tone="green">SSL secured</Badge>
              <Badge tone="blue">eTIMS ready</Badge>
              <Badge tone="green">KES checkout</Badge>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   DISCOUNT WIZARD — 4-step coupon builder
================================================================== */
export function DiscountWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { addDiscount, recordActivity, toast } = useStore();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<"percent" | "fixed" | "freeship">("percent");
  const [code, setCode] = useState("AUGUST10");
  const [value, setValue] = useState("10");
  const [minOrder, setMinOrder] = useState("0");
  const [cap, setCap] = useState("100");
  const [cats, setCats] = useState<string[]>(["All products"]);
  const [start, setStart] = useState("2026-08-01");
  const [end, setEnd] = useState("2026-08-31");
  const steps = [
    { label: "Type", icon: "bi-ticket-perforated" },
    { label: "Value & Code", icon: "bi-123" },
    { label: "Rules", icon: "bi-sliders" },
    { label: "Activate", icon: "bi-check2-circle" },
  ];
  return (
    <Modal open onClose={onClose} title="Create discount" subtitle="Coupon codes customers enter at checkout" icon="bi-ticket-perforated" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Next <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => {
              const d: Discount = {
                code: code.toUpperCase(), label: type === "percent" ? `${value}% off — ${cats[0]}` : type === "fixed" ? `KES ${value} off — ${cats[0]}` : "Free delivery — " + cats[0],
                type, value: Number(value) || 0, status: start <= new Date().toISOString().slice(0, 10) ? "Active" : "Scheduled", uses: 0, cap: Number(cap) || 0,
              };
              addDiscount(d);
              recordActivity(`Discount ${d.code} created (${d.label})`, "bi-ticket-perforated");
              toast(`${d.code} is ${d.status.toLowerCase()} — share it with customers!`, "success", "Discount created");
              onClose();
            }}>
              <i className="bi bi-check-lg me-1" /> Activate {code.toUpperCase()}
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={steps} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {[
              { id: "percent", t: "Percentage off", d: "e.g. 10% off entire order", icon: "bi-percent" },
              { id: "fixed", t: "Fixed amount off", d: "e.g. KES 500 off orders above KES 2,000", icon: "bi-cash-coin" },
              { id: "freeship", t: "Free delivery", d: "Waive the delivery fee (any zone)", icon: "bi-truck" },
            ].map((o) => (
              <label key={o.id} className="d-flex align-items-center gap-3 p-3" style={{ border: "2px solid " + (type === o.id ? "var(--pm-green)" : "var(--pm-border)"), borderRadius: 12, cursor: "pointer" }}>
                <input type="radio" className="form-check-input mt-0" checked={type === o.id} onChange={() => setType(o.id as typeof type)} />
                <i className={`bi ${o.icon}`} style={{ fontSize: "1.2rem", color: "var(--pm-green-dark)" }} />
                <div>
                  <b style={{ fontSize: "0.86rem" }}>{o.t}</b>
                  <div className="pm-prod-meta">{o.d}</div>
                </div>
              </label>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Coupon code" className="col-md-6" hint="Customers type this at checkout.">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-hash" /></span>
                <input className="form-control text-uppercase" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
              </div>
            </Field>
            <Field label={type === "percent" ? "Discount %" : type === "fixed" ? "Amount off (KES)" : "Value capped at (KES)"} className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">{type === "percent" ? "%" : "KES"}</span>
                <input type="number" min={0} className="form-control" value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
            </Field>
            <div className="col-12">
              <div className="pm-note">
                {type === "percent" ? `Customers save ${value}% at checkout — e.g. a KES 2,000 basket pays KES ${(2000 * (1 - Number(value || 0) / 100)).toLocaleString()}.` :
                  type === "fixed" ? `KES ${value} deducted per order.` : `Delivery fee (KES ${value}) waived per order.`}
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Minimum order (KES)" className="col-md-4">
              <input type="number" min={0} className="form-control" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
            </Field>
            <Field label="Usage cap (uses)" className="col-md-4">
              <input type="number" min={1} className="form-control" value={cap} onChange={(e) => setCap(e.target.value)} />
            </Field>
            <Field label="Applies to" className="col-md-4">
              <select className="form-select" value={cats[0]} onChange={(e) => setCats([e.target.value])}>
                <option>All products</option>
                <option>Food & Beverage</option>
                <option>Crafts & Art</option>
                <option>Home & Living</option>
                <option>Beauty & Wellness</option>
              </select>
            </Field>
            <Field label="Starts" className="col-md-6">
              <input type="date" className="form-control" value={start} onChange={(e) => setStart(e.target.value)} />
            </Field>
            <Field label="Ends" className="col-md-6">
              <input type="date" className="form-control" value={end} onChange={(e) => setEnd(e.target.value)} />
            </Field>
          </div>
        )}
        {step === 3 && (
          <div className="pm-note mb-3">
            <i className="bi bi-magic me-1" />
            <b>{code.toUpperCase()}</b> — {type === "percent" ? `${value}% off` : type === "fixed" ? `KES ${value} off` : "Free delivery"} · min order KES {minOrder} · {cats[0]} · {start} → {end} · first {cap} customers.
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   SETTINGS MODALS — domain, checkout, payments, shipping, eTIMS, store
================================================================== */
export function DomainModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { config, connectDomain, recordActivity, toast } = useStore();
  const [domain, setDomain] = useState(config.customDomain ?? "www.sokosanaa.co.ke");
  const [phase, setPhase] = useState<"idle" | "checking" | "ok">(config.customDomain ? "ok" : "idle");
  return (
    <Modal open onClose={onClose} title="Connect custom domain" subtitle="Point your .co.ke / .com to your store" icon="bi-globe2"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          {phase !== "ok" ? (
            <button type="button" className="btn btn-primary" disabled={!domain.trim() || phase === "checking"} onClick={() => {
              setPhase("checking");
              window.setTimeout(() => {
                setPhase("ok");
                connectDomain(domain.trim());
                recordActivity(`Custom domain connected: ${domain.trim()}`, "bi-globe2");
                toast(`${domain.trim()} verified — SSL issued, traffic now routes to your store.`, "success", "Domain connected");
              }, 1500);
            }}>
              {phase === "checking" ? <><span className="pm-spin me-1">◌</span> Verifying DNS…</> : <><i className="bi bi-shield-check me-1" /> Verify & connect</>}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => { toast("DNS records re-checked — all green.", "info", "DNS healthy"); onClose(); }}>
              <i className="bi bi-check2 me-1" /> Done
            </button>
          )}
        </>
      }
    >
      <div className="pm-note soft mb-3">
        Current store: <b>{config.customDomain ?? config.domain}</b>
      </div>
      {phase !== "ok" ? (
        <Field label="Your domain" hint="e.g. www.sokosanaa.co.ke — we auto-issue SSL after verification.">
          <input className="form-control" value={domain} onChange={(e) => setDomain(e.target.value)} />
        </Field>
      ) : (
        <div className="text-center py-3">
          <i className="bi bi-check-circle-fill text-primary" style={{ fontSize: "2.4rem" }} />
          <h5 className="mt-2">DNS verified</h5>
          <p className="pm-prod-meta mb-2">{domain} now serves your store over HTTPS.</p>
          <Badge tone="green">SSL Active</Badge> <Badge tone="blue">Propagation 0–24h</Badge>
        </div>
      )}
      <div className="mt-3" style={{ fontSize: "0.78rem" }}>
        <b>DNS settings for your registrar:</b>
        <div className="pm-prod-meta mt-1">CNAME → store.paymo.app · TXT → paymo-verify=tsr-2026</div>
      </div>
    </Modal>
  );
}

export function CheckoutSettingsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { config, setConfig, toast } = useStore();
  const [guest, setGuest] = useState(config.guestCheckout);
  const [abandoned, setAbandoned] = useState(config.abandonedCart);
  const [phone, setPhone] = useState(true);
  const [notes, setNotes] = useState(true);
  const [timer, setTimer] = useState("15 min");
  return (
    <Modal open onClose={onClose} title="Checkout settings" subtitle="How customers complete purchases" icon="bi-bag-check"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            setConfig({ guestCheckout: guest, abandonedCart: abandoned });
            toast("Checkout settings saved — applies to all future sessions.", "success", "Checkout updated");
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Save
          </button>
        </>
      }
    >
      <div className="d-flex flex-column gap-3">
        {[
          { v: guest, set: setGuest, t: "Guest checkout", d: "Allow customers to buy without creating an account" },
          { v: abandoned, set: setAbandoned, t: "Abandoned cart recovery", d: "Auto-send WhatsApp reminder after cart idle time" },
          { v: phone, set: setPhone, t: "Require phone number", d: "Safaricom number needed for M-Pesa & delivery" },
          { v: notes, set: setNotes, t: "Order notes field", d: "Let customers add delivery instructions" },
        ].map((o, i) => (
          <div key={i} className="d-flex align-items-center gap-2 p-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
            <div className="flex-grow-1">
              <b style={{ fontSize: "0.84rem" }}>{o.t}</b>
              <div className="pm-prod-meta">{o.d}</div>
            </div>
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" checked={o.v} onChange={(e) => o.set(e.target.checked)} />
            </div>
          </div>
        ))}
        <Field label="Cart hold timer">
          <select className="form-select" value={timer} onChange={(e) => setTimer(e.target.value)}>
            <option>15 min</option><option>30 min</option><option>1 hour</option><option>6 hours</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}

export function PaymentMethodsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { config, setConfig, toast, recordActivity } = useStore();
  const [p, setP] = useState({ ...config.payments });
  const [paybill, setPaybill] = useState(config.paybill);
  const [till, setTill] = useState(config.till);
  const [processor, setProcessor] = useState("DPO Group");
  return (
    <Modal open onClose={onClose} title="Payment rails" subtitle="Every shilling lands in your PayMo wallet — reconciled automatically" icon="bi-credit-card"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            setConfig({ payments: p, paybill, till });
            recordActivity("Payment rails updated on storefront", "bi-credit-card");
            toast("Payment rails saved — store checkout updated instantly.", "success", "Rails updated");
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Save rails
          </button>
        </>
      }
    >
      {[
        { k: "mpesa", t: "M-Pesa Express (STK Push)", icon: <span className="pm-mp">M</span>, on: p.mpesa, set: (v: boolean) => setP((s) => ({ ...s, mpesa: v })) },
        { k: "card", t: "Card payments — Visa / Mastercard", icon: <i className="bi bi-credit-card" />, on: p.card, set: (v: boolean) => setP((s) => ({ ...s, card: v })) },
        { k: "pesalink", t: "PesaLink bank-to-bank", icon: <i className="bi bi-bank" />, on: p.pesalink, set: (v: boolean) => setP((s) => ({ ...s, pesalink: v })) },
        { k: "cod", t: "Cash on delivery", icon: <i className="bi bi-cash" />, on: p.cod, set: (v: boolean) => setP((s) => ({ ...s, cod: v })) },
      ].map((r) => (
        <div key={r.k} className="d-flex align-items-center gap-3 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
          <span className="pm-kpi-icon" style={{ width: 34, height: 34, fontSize: "0.9rem", background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}>{r.icon}</span>
          <b style={{ fontSize: "0.85rem" }} className="flex-grow-1">{r.t}</b>
          <div className="form-check form-switch mb-0">
            <input className="form-check-input" type="checkbox" checked={r.on} onChange={(e) => r.set(e.target.checked)} />
          </div>
        </div>
      ))}
      <div className="row g-3 mt-1">
        <Field label="M-Pesa Paybill" className="col-md-6">
          <input className="form-control" value={paybill} onChange={(e) => setPaybill(e.target.value)} />
        </Field>
        <Field label="Till number" className="col-md-6">
          <input className="form-control" value={till} onChange={(e) => setTill(e.target.value)} />
        </Field>
        <Field label="Card processor" className="col-md-6">
          <select className="form-select" value={processor} onChange={(e) => setProcessor(e.target.value)}>
            <option>DPO Group</option><option>Pesapal</option><option>Flutterwave</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}

export function ShippingZonesModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { config, setConfig, toast } = useStore();
  const [zones, setZones] = useState(config.zones.map((z) => ({ ...z })));
  const [freeOver, setFreeOver] = useState(String(config.freeOver));
  const [newZone, setNewZone] = useState("");
  return (
    <Modal open onClose={onClose} title="Shipping zones & rates" subtitle="Delivery fees customers see at checkout" icon="bi-truck"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            setConfig({ zones, freeOver: Number(freeOver) || 0 });
            toast("Shipping rates updated — checkout now shows new fees.", "success", "Zones saved");
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Save rates
          </button>
        </>
      }
    >
      {zones.map((z, i) => (
        <div key={i} className="d-flex align-items-center gap-2 mb-2">
          <div className="flex-grow-1">
            <b style={{ fontSize: "0.82rem" }}>{z.name}</b>
            <div className="pm-prod-meta">{z.eta}</div>
          </div>
          <div className="input-group" style={{ width: 150 }}>
            <span className="input-group-text">KES</span>
            <input type="number" min={0} className="form-control" value={z.price} onChange={(e) => setZones((zs) => zs.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)))} />
          </div>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setZones((zs) => zs.filter((_, j) => j !== i))}>
            <i className="bi bi-trash" />
          </button>
        </div>
      ))}
      <div className="input-group mt-3">
        <input className="form-control" placeholder="New zone — e.g. East Africa (EAC)" value={newZone} onChange={(e) => setNewZone(e.target.value)} />
        <button type="button" className="btn btn-outline-primary" disabled={!newZone.trim()} onClick={() => {
          setZones((zs) => [...zs, { name: newZone.trim(), price: 1500, eta: "3–5 days" }]);
          setNewZone("");
          toast("Zone added — set its fee and save.", "info", "Zone added");
        }}>
          <i className="bi bi-plus-lg me-1" /> Add zone
        </button>
      </div>
      <Field label="Free delivery above (KES)" className="mt-3">
        <input type="number" min={0} className="form-control" value={freeOver} onChange={(e) => setFreeOver(e.target.value)} />
      </Field>
    </Modal>
  );
}

export function ETimsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { config, setConfig, products, toast, recordActivity } = useStore();
  const [registered, setRegistered] = useState(config.vatRegistered);
  const [rate, setRate] = useState(config.vatRate);
  const [auto, setAuto] = useState(true);
  const [syncing, setSyncing] = useState(false);
  return (
    <Modal open onClose={onClose} title="eTIMS & tax compliance" subtitle="KRA electronic tax invoice integration" icon="bi-shield-check"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" disabled={syncing} onClick={() => {
            setSyncing(true);
            window.setTimeout(() => {
              setSyncing(false);
              setConfig({ vatRegistered: registered, vatRate: rate });
              recordActivity(`eTIMS sync complete — ${products.length} SKUs validated`, "bi-shield-check");
              toast(`${products.length} SKUs validated with KRA iTax. Settings saved.`, "success", "eTIMS synced");
            }, 1400);
          }}>
            {syncing ? <><span className="pm-spin me-1">◌</span> Syncing with iTax…</> : <><i className="bi bi-arrow-repeat me-1" /> Sync & save</>}
          </button>
        </>
      }
    >
      <div className="d-flex align-items-center gap-3 p-3 mb-3" style={{ background: "var(--pm-green-soft)", borderRadius: 12 }}>
        <i className="bi bi-patch-check-fill text-primary" style={{ fontSize: "1.6rem" }} />
        <div>
          <b style={{ fontSize: "0.86rem" }}>Status: Registered & compliant</b>
          <div className="pm-prod-meta">KRA PIN P051234567X · last validated yesterday 22:00</div>
        </div>
        <Badge tone="green" className="ms-auto">Active</Badge>
      </div>
      {[
        { v: registered, set: setRegistered, t: "VAT registered (KRA)", d: "16% VAT is added to receipts and filed monthly" },
        { v: auto, set: setAuto, t: "Auto-validate new SKUs", d: "Every new product is checked against iTax codes before listing" },
      ].map((o, i) => (
        <div key={i} className="d-flex align-items-center gap-2 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
          <div className="flex-grow-1">
            <b style={{ fontSize: "0.84rem" }}>{o.t}</b>
            <div className="pm-prod-meta">{o.d}</div>
          </div>
          <div className="form-check form-switch mb-0">
            <input className="form-check-input" type="checkbox" checked={o.v} onChange={(e) => o.set(e.target.checked)} />
          </div>
        </div>
      ))}
      <Field label="VAT rate">
        <select className="form-select" value={rate} onChange={(e) => setRate(e.target.value)}>
          <option>16%</option><option>0%</option><option>8%</option><option>Exempt</option>
        </select>
      </Field>
      <div className="pm-note soft mt-3"><i className="bi bi-calendar-event me-1" />Next VAT filing due <b>20th of this month</b> — figures prepared on the Bookkeeping &amp; Taxes page.</div>
    </Modal>
  );
}

export function StoreSettingsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { config, setConfig, toast } = useStore();
  const [name, setName] = useState(config.name);
  const [tagline, setTagline] = useState(config.tagline);
  const [logo, setLogo] = useState(config.logoEmoji);
  const [returns, setReturns] = useState(config.returnsPolicy);
  const [oos, setOos] = useState(config.sellWhenOOS);
  return (
    <Modal open onClose={onClose} title="Store settings" subtitle="General storefront configuration" icon="bi-gear"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            setConfig({ name, tagline, logoEmoji: logo, returnsPolicy: returns, sellWhenOOS: oos });
            toast("Store settings saved.", "success", "Settings updated");
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Save settings
          </button>
        </>
      }
    >
      <div className="row g-3">
        <Field label="Store name" className="col-md-8">
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Logo emoji" className="col-md-4">
          <input className="form-control text-center" style={{ fontSize: "1.3rem" }} value={logo} onChange={(e) => setLogo(e.target.value)} />
        </Field>
        <Field label="Tagline" className="col-12">
          <input className="form-control" value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </Field>
      </div>
      {[
        { v: returns, set: setReturns, t: "Published returns policy", d: "7-day returns shown on product pages — builds trust" },
        { v: oos, set: setOos, t: "Sell when out of stock", d: "Allow backorders (stock tracked as negative)" },
      ].map((o, i) => (
        <div key={i} className="d-flex align-items-center gap-2 p-2 mt-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
          <div className="flex-grow-1">
            <b style={{ fontSize: "0.84rem" }}>{o.t}</b>
            <div className="pm-prod-meta">{o.d}</div>
          </div>
          <div className="form-check form-switch mb-0">
            <input className="form-check-input" type="checkbox" checked={o.v} onChange={(e) => o.set(e.target.checked)} />
          </div>
        </div>
      ))}
    </Modal>
  );
}

export function TeamRolesModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const [roles, setRoles] = useState<Record<string, string>>({
    "Wanjiku Maina": "Owner", "Mwangi Kamau": "Store Manager", "Achieng Otieno": "Editor", "Brian Kim": "Viewer",
  });
  const [invite, setInvite] = useState("");
  const [role, setRole] = useState("Editor");
  return (
    <Modal open onClose={onClose} title="Team & store roles" subtitle="Who can edit products, orders and storefront" icon="bi-people"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            recordActivity("Team roles updated", "bi-people");
            toast("Roles saved — permissions apply immediately.", "success", "Team updated");
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Save roles
          </button>
        </>
      }
    >
      {Object.entries(roles).map(([name, r]) => (
        <div key={name} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
          <div className="pm-avatar" style={{ width: 30, height: 30, fontSize: "0.66rem", background: "linear-gradient(135deg, #12b76a, #0b8f52)" }}>
            {name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>
          <b style={{ fontSize: "0.82rem" }} className="flex-grow-1">{name}</b>
          <select className="form-select form-select-sm" style={{ width: 150 }} value={r} onChange={(e) => setRoles((x) => ({ ...x, [name]: e.target.value }))}>
            <option>Owner</option><option>Store Manager</option><option>Editor</option><option>Viewer</option>
          </select>
        </div>
      ))}
      <div className="input-group mt-3">
        <input className="form-control" placeholder="Invite by email or phone" value={invite} onChange={(e) => setInvite(e.target.value)} />
        <select className="form-select" style={{ maxWidth: 140 }} value={role} onChange={(e) => setRole(e.target.value)}>
          <option>Store Manager</option><option>Editor</option><option>Viewer</option>
        </select>
        <button type="button" className="btn btn-outline-primary" disabled={!invite.trim()} onClick={() => {
          toast(`Invite sent to ${invite} as ${role}.`, "success", "Invite sent");
          setInvite("");
        }}>
          <i className="bi bi-send" />
        </button>
      </div>
    </Modal>
  );
}

export function ShareStoreModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { config, toast } = useStore();
  const url = config.customDomain ?? config.domain;
  const links = [
    { icon: "bi-globe2", label: "Store URL", value: `https://${url}` },
    { icon: "bi-whatsapp", label: "WhatsApp share", value: `https://wa.me/?text=Shop%20at%20${url}` },
    { icon: "bi-instagram", label: "Instagram bio link", value: `https://${url}/?ref=ig` },
  ];
  const qrCells = useMemo(() => {
    const cells: boolean[] = [];
    for (let i = 0; i < 81; i++) {
      const r = Math.floor(i / 9), c = i % 9;
      const finder = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
      cells.push(finder ? (r === 0 || r === 2 || c === 0 || c === 2) : (i * 7 + i * i * 3) % 5 < 2);
    }
    return cells;
  }, []);
  const copy = (v: string) => {
    try {
      void navigator.clipboard?.writeText(v);
    } catch { /* demo */ }
    toast(`Copied: ${v}`, "info", "Link copied");
  };
  return (
    <Modal open onClose={onClose} title="Share your store" subtitle="Drive traffic from every channel" icon="bi-share" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>}
    >
      <div className="d-flex gap-4 flex-wrap align-items-start">
        <div className="text-center">
          <div className="pm-qr">
            {qrCells.map((f, i) => <div key={i} className={`cell ${f ? "" : "blank"}`} />)}
          </div>
          <div className="pm-prod-meta mt-2">Scan to open store</div>
        </div>
        <div className="flex-grow-1" style={{ minWidth: 260 }}>
          {links.map((l) => (
            <div key={l.label} className="d-flex align-items-center gap-2 mb-2">
              <i className={`bi ${l.icon}`} style={{ color: "var(--pm-green-dark)" }} />
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div className="fw-semibold" style={{ fontSize: "0.78rem" }}>{l.label}</div>
                <div className="pm-prod-meta text-truncate">{l.value}</div>
              </div>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => copy(l.value)}>
                <i className="bi bi-clipboard" />
              </button>
            </div>
          ))}
          <div className="pm-note soft mt-3"><i className="bi bi-megaphone me-1" />Tip: paste the Instagram link in your bio and tag products in posts — orders land here automatically.</div>
        </div>
      </div>
    </Modal>
  );
}

export function PauseStoreModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { setConfig, recordActivity, toast } = useStore();
  return (
    <Modal open onClose={onClose} title="Pause your store?" icon="bi-pause-circle" size="sm"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Keep live</button>
          <button type="button" className="btn btn-danger" onClick={() => {
            setConfig({ live: false });
            recordActivity("Store paused", "bi-pause-circle");
            toast("Store paused — visitors see a 'We'll be back' page. Orders & catalog are untouched.", "warning", "Store paused");
            onClose();
          }}>
            <i className="bi bi-pause-fill me-1" /> Pause store
          </button>
        </>
      }
    >
      <p className="mb-1">Customers will not be able to place orders while paused. You can go live again anytime.</p>
      <p className="pm-prod-meta mb-0">Existing orders continue to be fulfilled normally.</p>
    </Modal>
  );
}
