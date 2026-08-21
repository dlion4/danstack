/* ============================================================================
 * Card Dashboard — page 5.10 · Card Settings & Support (Bootstrap 5)
 * ========================================================================== */

import { useState } from "react";
import { cn } from "./utils/cn";
import { Icon, type IconName } from "./icons";
import { Badge, Btn, FieldLabel, Modal, Reveal, SectionHead, Toggle } from "./ui";
import { useApp } from "./store";
import {
  CURRENCIES,
  DEFAULT_FUNDING_SOURCES,
  RESOURCES,
  SUPPORT_CHANNELS,
  SUPPORT_FAQS,
  TRUST_BADGES,
  type CardDefaults,
} from "./data";

/* ============ 01 · Settings & support overview ============ */

export function SettingsOverview() {
  const { cardDefaults, openModal, setPage, openDrawer } = useApp();
  const onCount = [cardDefaults.online, cardDefaults.contactless, cardDefaults.atm, cardDefaults.spendingAlerts].filter(Boolean).length;

  return (
    <section id="overview" className="pmc-scroll-mt">
      <Reveal>
        <div className="pmc-hero">
          <div className="pmc-hero-dots" />
          <div className="position-relative d-flex flex-wrap align-items-center pmc-gap-6">
            <div className="flex-grow-1" style={{ minWidth: 0, flexBasis: 300 }}>
              <div className="d-flex flex-wrap align-items-center pmc-gap-2">
                <span className="pmc-hero-chip d-inline-flex align-items-center pmc-gap-15 text-uppercase fw-bold" style={{ letterSpacing: "0.12em" }}>
                  <span className="pmc-live-dot" /> BAAS · Cards
                </span>
                <span className="pmc-hero-chip">Module 5.10</span>
              </div>
              <h1 className="pmc-hero-title pmc-mt-3">
                Card Settings<br className="d-none d-sm-inline" /> &amp; Support
              </h1>
              <p className="pmc-hero-sub" style={{ maxWidth: 510 }}>
                Programme-wide defaults for every new card, plus the help centre, FAQs and support channels
                for when you need a human.
              </p>
              <div className="pmc-mt-4 d-flex flex-wrap pmc-gap-2">
                <Btn icon="sliders" onClick={() => openModal({ type: "settingsDefaults" })}>Edit Defaults</Btn>
                <Btn variant="ghost" icon="headset" onClick={() => openDrawer({ type: "support" })}>Get Support</Btn>
                <Btn variant="ghost" icon="gauge" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="pmc-hero-stats">
                {[
                  { k: "Defaults enabled", v: `${onCount}/4` },
                  { k: "Funding source", v: cardDefaults.fundingSource.split("(")[0].trim() },
                  { k: "Currency", v: cardDefaults.currency.split("—")[0].trim() },
                  { k: "Support", v: "24/7" },
                ].map((s) => (
                  <div key={s.k} className="lh-sm">
                    <p className="pmc-hero-stat-value">{s.v}</p>
                    <p className="pmc-hero-stat-label">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pmc-hero-art" style={{ height: 220, width: 260 }}>
              <div className="position-absolute p-4" style={{ right: 0, top: 0, width: 230, borderRadius: 16, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(2px)" }}>
                <p className="pmc-fs-10 fw-bold text-uppercase mb-0" style={{ letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)" }}>Current defaults</p>
                <div className="pmc-mt-3 d-flex flex-column pmc-gap-2">
                  {[
                    { k: "Online payments", on: cardDefaults.online },
                    { k: "Contactless / NFC", on: cardDefaults.contactless },
                    { k: "ATM", on: cardDefaults.atm },
                    { k: "Spend alerts", on: cardDefaults.spendingAlerts },
                  ].map((d) => (
                    <div key={d.k} className="d-flex align-items-center pmc-gap-2">
                      <span style={{ width: 8, height: 8, borderRadius: 99, background: d.on ? "var(--pmc-green)" : "rgba(255,255,255,0.25)", flex: "none" }} />
                      <span className="flex-grow-1 pmc-fs-115 fw-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{d.k}</span>
                      <span className="pmc-fs-10 fw-bold" style={{ color: "rgba(255,255,255,0.5)" }}>{d.on ? "On" : "Off"}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="position-absolute p-3" style={{ bottom: 0, left: 0, width: 210, borderRadius: 16, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(2px)" }}>
                <p className="pmc-fs-10 fw-bold text-uppercase mb-0" style={{ letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)" }}>Funding</p>
                <p className="pmc-mt-1 pmc-fs-12 fw-bold text-white mb-0">{cardDefaults.fundingSource}</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* quick links */}
      <Reveal delay={80}>
        <div className="row pmc-g-3 pmc-mt-4">
          {[
            { icon: "sliders" as IconName, label: "Card defaults", sub: "New card settings", anchor: "card-defaults" },
            { icon: "headset" as IconName, label: "Get support", sub: "Live chat & call desk", anchor: "support" },
            { icon: "help" as IconName, label: "Help & FAQs", sub: "Common questions", anchor: "faq" },
            { icon: "shieldCheck" as IconName, label: "Resources", sub: "Docs & compliance", anchor: "resources" },
          ].map((q) => (
            <div key={q.label} className="col-6 col-sm-3">
              <button type="button" onClick={() => document.getElementById(q.anchor)?.scrollIntoView({ behavior: "smooth" })} className="pmc-card pmc-lift pmc-focus w-100 p-4 text-start h-100">
                <span className="pmc-icon-sq d-grid pmc-tone-green" style={{ width: 40, height: 40 }}><Icon name={q.icon} size={18} /></span>
                <p className="pmc-mt-25 pmc-fs-13 fw-bold pmc-ink mb-0">{q.label}</p>
                <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{q.sub}</p>
              </button>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 02 · Programme defaults ============ */

export function DefaultsSection() {
  const { cardDefaults, saveDefaults, toast, openModal } = useApp();
  const set = (patch: Partial<CardDefaults>) => saveDefaults({ ...cardDefaults, ...patch });

  return (
    <section id="card-defaults" className="pmc-scroll-mt">
      <SectionHead no="02" title="Programme Defaults" sub="Every newly issued card inherits these settings. Existing cards are unaffected.">
        <Btn size="sm" icon="sliders" onClick={() => openModal({ type: "settingsDefaults" })}>Edit All</Btn>
      </SectionHead>

      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-card p-4 h-100">
            <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Default card behaviour</p>
            <ul className="list-unstyled d-flex flex-column pmc-gap-2 mb-0">
              {([
                ["online", "Default for Online Payments", "Card-not-present enabled at issuance", "globe", cardDefaults.online],
                ["contactless", "Default for Contactless / NFC", "Tap-to-pay enabled at issuance", "wave", cardDefaults.contactless],
                ["atm", "Default for ATM", "Cash access enabled at issuance", "wallet", cardDefaults.atm],
                ["spendingAlerts", "Spending alerts on by default", "Real-time push + SMS for new cards", "bell", cardDefaults.spendingAlerts],
                ["autoFreezeUnused", "Auto-freeze unused cards", "Freeze after 60 days with no activity", "snow", cardDefaults.autoFreezeUnused],
              ] as [keyof CardDefaults, string, string, IconName, boolean][]).map(([key, title, desc, icon, on]) => (
                <li
                  key={key}
                  className="d-flex align-items-center pmc-gap-3 pmc-radius p-3"
                  style={on ? { border: "1px solid rgba(18,183,106,0.4)", background: "rgba(231,248,239,0.35)" } : { border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}
                >
                  <span className={cn("pmc-icon-sq d-grid flex-none", on ? "pmc-green-ink" : "pmc-faint")} style={{ background: "#fff", boxShadow: on ? "0 1px 2px rgba(16,24,40,0.06)" : undefined }}><Icon name={icon} size={16} /></span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="pmc-fs-125 fw-bold pmc-ink mb-0">{title}</p>
                    <p className="pmc-fs-11 pmc-muted mb-0" style={{ lineHeight: 1.35 }}>{desc}</p>
                  </div>
                  <Toggle on={on} label={title} onChange={(v) => set({ [key]: v } as Partial<CardDefaults>)} />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-card p-4">
              <p className="pmc-mb-15 pmc-fs-11 fw-bold text-uppercase pmc-muted" style={{ letterSpacing: "0.06em" }}>Default funding source for virtual cards</p>
              <select value={cardDefaults.fundingSource} onChange={(e) => { set({ fundingSource: e.target.value }); }} className="form-select pmc-focus pmc-fs-125 fw-bold">
                {DEFAULT_FUNDING_SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="pmc-card p-4">
              <p className="pmc-mb-15 pmc-fs-11 fw-bold text-uppercase pmc-muted" style={{ letterSpacing: "0.06em" }}>Preferred international currency</p>
              <select value={cardDefaults.currency} onChange={(e) => { set({ currency: e.target.value }); }} className="form-select pmc-focus pmc-fs-125 fw-bold">
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <p className="pmc-mt-15 pmc-fs-11 pmc-muted mb-0" style={{ lineHeight: 1.6 }}>Used for cross-border settlement and virtual-card billing when no card-level currency is set.</p>
            </div>
            <button
              type="button"
              onClick={() => { set({ online: true, contactless: true, atm: false, spendingAlerts: true, autoFreezeUnused: false }); toast("success", "Defaults reset", "Restored to the recommended configuration."); }}
              className="pmc-focus w-100 pmc-radius-sm pmc-py-25 pmc-fs-115 fw-bold pmc-muted"
              style={{ border: "1px dashed var(--pmc-line)", background: "transparent" }}
            >
              Reset to recommended defaults
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 03 · Get support ============ */

export function SupportSection() {
  const { openDrawer, toast } = useApp();
  return (
    <section id="support" className="pmc-scroll-mt">
      <SectionHead no="03" title="Get Support" sub="Reach a card specialist through whichever channel suits you." />

      <div className="row pmc-g-3">
        {SUPPORT_CHANNELS.map((c, i) => (
          <div key={c.id} className="col-12 col-sm-6 col-lg-3">
            <Reveal delay={i * 60} className="h-100">
              <button type="button" onClick={() => openDrawer({ type: "support" })} className="pmc-card pmc-lift pmc-focus d-flex flex-column w-100 p-4 text-start h-100">
                <span className="pmc-icon-sq d-grid pmc-tone-green" style={{ width: 44, height: 44 }}><Icon name={c.icon} size={19} /></span>
                <p className="pmc-mt-3 pmc-fs-14 fw-bold pmc-ink mb-0">{c.name}</p>
                <p className="pmc-mt-05 flex-grow-1 pmc-fs-115 pmc-muted mb-0">{c.sub}</p>
                <div className="pmc-mt-3 d-flex align-items-center justify-content-between" style={{ borderTop: "1px solid rgba(230,233,240,0.7)", paddingTop: 12 }}>
                  <Badge tone="success" dot>Avg {c.response}</Badge>
                  <Icon name="arrowRight" size={14} className="pmc-faint" />
                </div>
              </button>
            </Reveal>
          </div>
        ))}
      </div>

      <Reveal delay={100}>
        <div className="pmc-mt-3 d-flex flex-wrap align-items-center pmc-gap-4 pmc-card p-4">
          <span className="pmc-icon-sq d-grid flex-none pmc-tone-blue" style={{ width: 44, height: 44 }}><Icon name="headset" size={20} /></span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <p className="d-flex align-items-center pmc-gap-2 pmc-fs-135 fw-bold pmc-ink mb-0">We're online now <span className="pmc-live-dot" /></p>
            <p className="pmc-fs-115 pmc-muted mb-0">Average first response: 3 minutes. Card specialists are available 24/7.</p>
          </div>
          <Btn icon="sms" onClick={() => openDrawer({ type: "support" })}>Start a chat</Btn>
          <Btn variant="outline" icon="phone" onClick={() => toast("info", "Calling card desk", "+254 709 900 112 · available 24/7.")}>Call desk</Btn>
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 04 · Help & FAQs ============ */

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="pmc-scroll-mt">
      <SectionHead no="04" title="Help & FAQs" sub="Answers to the questions card administrators ask most." />
      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="d-flex flex-column pmc-gap-2">
            {SUPPORT_FAQS.map((f, i) => (
              <div key={i} className="pmc-card overflow-hidden">
                <button type="button" onClick={() => setOpen(open === i ? null : i)} className="pmc-focus d-flex w-100 align-items-center pmc-gap-3 px-4 text-start border-0 bg-transparent" style={{ paddingTop: 14, paddingBottom: 14 }}>
                  <span className="pmc-icon-sq d-grid flex-none pmc-tone-green" style={{ width: 28, height: 28, borderRadius: 8 }}><Icon name="help" size={14} /></span>
                  <span className="flex-grow-1 pmc-fs-13 fw-bold pmc-ink">{f.q}</span>
                  <Icon name="chevDown" size={15} className="flex-none pmc-faint" style={{ transition: "transform 0.2s ease", transform: open === i ? "rotate(180deg)" : undefined }} />
                </button>
                {open === i && <p className="px-4 pmc-fs-125 pmc-muted mb-0" style={{ borderTop: "1px solid rgba(230,233,240,0.7)", background: "rgba(242,244,248,0.4)", paddingTop: 14, paddingBottom: 14, lineHeight: 1.6 }}>{f.a}</p>}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-card p-4">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-2">Still stuck?</p>
              <p className="pmc-fs-12 pmc-muted mb-0" style={{ lineHeight: 1.6 }}>Can't find an answer? Open a ticket and a specialist will get back to you in minutes.</p>
              <Btn className="pmc-mt-3 w-100" icon="send" onClick={() => window.dispatchEvent(new CustomEvent("pm-open-support"))}>Open a support ticket</Btn>
            </div>
            <div className="pmc-card p-4 flex-grow-1">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-2">Self-service quick links</p>
              <ul className="list-unstyled d-flex flex-column pmc-gap-15 mb-0">
                {[
                  ["Freeze a lost card", "snow", "security"],
                  ["Dispute a transaction", "flag", "transactions"],
                  ["View my PIN", "key", "cards"],
                  ["Change card limits", "sliders", "cards"],
                ].map(([label, icon, anchor]) => (
                  <li key={label as string}>
                    <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("pm-goto", { detail: anchor }))} className="pmc-focus pmc-quick-link d-flex w-100 align-items-center pmc-gap-25 pmc-radius-sm px-3 pmc-py-25 text-start pmc-fs-12 fw-bold pmc-ink">
                      <Icon name={icon as IconName} size={14} className="pmc-muted" />
                      <span className="flex-grow-1">{label}</span>
                      <Icon name="arrowRight" size={13} className="pmc-faint" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 05 · Resources & trust ============ */

export function ResourcesSection() {
  const { toast } = useApp();
  return (
    <section id="resources" className="pmc-scroll-mt">
      <SectionHead no="05" title="Resources & Trust" sub="Documentation, guides and the compliance foundations behind the programme." />

      <div className="row pmc-g-3">
        {RESOURCES.map((r, i) => (
          <div key={r.id} className="col-12 col-sm-6 col-lg-3">
            <Reveal delay={i * 60} className="h-100">
              <button type="button" onClick={() => toast("info", `${r.title} opened`, "The resource is available to download.")} className="pmc-card pmc-lift pmc-focus d-flex flex-column w-100 p-4 text-start h-100">
                <div className="d-flex align-items-start justify-content-between">
                  <span className="pmc-icon-sq d-grid pmc-tone-muted" style={{ width: 40, height: 40 }}><Icon name={r.icon} size={18} /></span>
                  <Badge tone="muted">{r.tag}</Badge>
                </div>
                <p className="pmc-mt-3 pmc-fs-13 fw-bold pmc-ink mb-0">{r.title}</p>
                <p className="pmc-mt-05 flex-grow-1 pmc-fs-115 pmc-muted mb-0" style={{ lineHeight: 1.35 }}>{r.desc}</p>
                <Icon name="arrowRight" size={14} className="pmc-faint pmc-mt-3" />
              </button>
            </Reveal>
          </div>
        ))}
      </div>

      <Reveal delay={100}>
        <div className="row g-2 pmc-mt-4">
          {TRUST_BADGES.map((b) => (
            <div key={b.label} className="col-12 col-sm-6 col-lg-3">
              <div className="pmc-card d-flex align-items-center pmc-gap-25 px-4 pmc-py-3 h-100">
                <span className="pmc-icon-sq d-grid flex-none pmc-tone-green" style={{ width: 32, height: 32, borderRadius: 8 }}><Icon name={b.icon} size={15} /></span>
                <span className="pmc-fs-115 fw-bold pmc-ink">{b.label}</span>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ============================================================
   Settings modal (original 5.10 fields)
   ============================================================ */

export function SettingsDefaultsModal() {
  const { modal, closeModal, cardDefaults, saveDefaults } = useApp();
  const open = modal?.type === "settingsDefaults";
  const [d, setD] = useState<CardDefaults>(cardDefaults);

  if (!open) return null;
  const set = (patch: Partial<CardDefaults>) => setD((prev) => ({ ...prev, ...patch }));

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="sliders"
      title="Programme card defaults"
      subtitle="Configure what every newly issued card inherits. Existing cards are unchanged."
      width="max-w-lg"
      footer={
        <>
          <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
          <Btn icon="check" onClick={() => { saveDefaults(d); closeModal(); }}>Save Defaults</Btn>
        </>
      }
    >
      <div className="d-flex flex-column pmc-gap-4">
        <ul className="list-unstyled d-flex flex-column pmc-gap-2 mb-0">
          {([
            ["online", "Default for Online Payments", "Card-not-present enabled at issuance", "globe", d.online],
            ["contactless", "Default for Contactless / NFC", "Tap-to-pay enabled at issuance", "wave", d.contactless],
            ["atm", "Default for ATM", "Cash access enabled at issuance", "wallet", d.atm],
          ] as const).map(([key, title, desc, icon, on]) => (
            <li
              key={key}
              className="d-flex align-items-center pmc-gap-3 pmc-radius p-3"
              style={on ? { border: "1px solid rgba(18,183,106,0.4)", background: "rgba(231,248,239,0.35)" } : { border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}
            >
              <span className={cn("pmc-icon-sq d-grid flex-none", on ? "pmc-green-ink" : "pmc-faint")} style={{ background: "#fff", boxShadow: on ? "0 1px 2px rgba(16,24,40,0.06)" : undefined }}><Icon name={icon} size={16} /></span>
              <div className="flex-grow-1" style={{ minWidth: 0 }}><p className="pmc-fs-125 fw-bold pmc-ink mb-0">{title}</p><p className="pmc-fs-11 pmc-muted mb-0" style={{ lineHeight: 1.35 }}>{desc}</p></div>
              <Toggle on={on} label={title} onChange={(v) => set({ [key]: v } as Partial<CardDefaults>)} />
            </li>
          ))}
        </ul>

        <div>
          <FieldLabel>Default funding source for virtual cards</FieldLabel>
          <select value={d.fundingSource} onChange={(e) => set({ fundingSource: e.target.value })} className="form-select pmc-focus pmc-fs-125 fw-bold">
            {DEFAULT_FUNDING_SOURCES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <FieldLabel>Preferred international currency</FieldLabel>
          <select value={d.currency} onChange={(e) => set({ currency: e.target.value })} className="form-select pmc-focus pmc-fs-125 fw-bold">
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="d-flex align-items-center pmc-gap-3 pmc-radius p-3" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}>
          <span className="pmc-icon-sq d-grid flex-none pmc-faint" style={{ background: "#fff" }}><Icon name="bell" size={16} /></span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}><p className="pmc-fs-125 fw-bold pmc-ink mb-0">Spending alerts on by default</p><p className="pmc-fs-11 pmc-muted mb-0">Real-time push + SMS for new cards.</p></div>
          <Toggle on={d.spendingAlerts} label="Spending alerts" onChange={(v) => set({ spendingAlerts: v })} />
        </div>

        <div className="d-flex align-items-center pmc-gap-3 pmc-radius p-3" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}>
          <span className="pmc-icon-sq d-grid flex-none pmc-faint" style={{ background: "#fff" }}><Icon name="snow" size={16} /></span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}><p className="pmc-fs-125 fw-bold pmc-ink mb-0">Auto-freeze unused cards</p><p className="pmc-fs-11 pmc-muted mb-0">Freeze after 60 days with no authorisation activity.</p></div>
          <Toggle on={d.autoFreezeUnused} label="Auto-freeze unused" onChange={(v) => set({ autoFreezeUnused: v })} />
        </div>

        <p className="pmc-note pmc-note-canvas mb-0">
          These defaults apply to cards issued from now on. You can always override them on an individual card.
        </p>
      </div>
    </Modal>
  );
}
