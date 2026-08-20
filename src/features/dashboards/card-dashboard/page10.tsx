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
    <section id="overview" className="scroll-mt-24">
      <Reveal>
        <div className="pm-hero relative overflow-hidden rounded-2xl border border-line p-5 text-white shadow-pm sm:p-7">
          <div className="pm-hero-dots absolute inset-0" />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="min-w-0 flex-1 basis-[300px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#cfe8db]">
                  <span className="live-dot" /> BAAS · Cards
                </span>
                <span className="rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-[#cfe8db]">Module 5.10</span>
              </div>
              <h1 className="font-display mt-3 text-[26px] font-bold leading-[1.1] tracking-tight sm:text-[34px]">
                Card Settings<br className="hidden sm:block" /> &amp; Support
              </h1>
              <p className="mt-2 max-w-[510px] text-[13px] leading-relaxed text-white/65">
                Programme-wide defaults for every new card, plus the help centre, FAQs and support channels
                for when you need a human.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn icon="sliders" onClick={() => openModal({ type: "settingsDefaults" })}>Edit Defaults</Btn>
                <Btn variant="ghost" icon="headset" onClick={() => openDrawer({ type: "support" })}>Get Support</Btn>
                <Btn variant="ghost" icon="gauge" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { k: "Defaults enabled", v: `${onCount}/4` },
                  { k: "Funding source", v: cardDefaults.fundingSource.split("(")[0].trim() },
                  { k: "Currency", v: cardDefaults.currency.split("—")[0].trim() },
                  { k: "Support", v: "24/7" },
                ].map((s) => (
                  <div key={s.k} className="leading-tight">
                    <p className="font-display num text-[17px] font-bold text-white">{s.v}</p>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/45">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden h-[220px] w-[260px] flex-none md:block">
              <div className="absolute right-0 top-0 w-[230px] rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Current defaults</p>
                <div className="mt-3 space-y-2">
                  {[
                    { k: "Online payments", on: cardDefaults.online },
                    { k: "Contactless / NFC", on: cardDefaults.contactless },
                    { k: "ATM", on: cardDefaults.atm },
                    { k: "Spend alerts", on: cardDefaults.spendingAlerts },
                  ].map((d) => (
                    <div key={d.k} className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", d.on ? "bg-pmgreen" : "bg-white/25")} />
                      <span className="flex-1 text-[11.5px] font-bold text-white/85">{d.k}</span>
                      <span className="text-[10px] font-bold text-white/50">{d.on ? "On" : "Off"}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-[210px] rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Funding</p>
                <p className="mt-1 text-[12px] font-bold text-white">{cardDefaults.fundingSource}</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* quick links */}
      <Reveal delay={80}>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: "sliders" as IconName, label: "Card defaults", sub: "New card settings", anchor: "card-defaults" },
            { icon: "headset" as IconName, label: "Get support", sub: "Live chat & call desk", anchor: "support" },
            { icon: "help" as IconName, label: "Help & FAQs", sub: "Common questions", anchor: "faq" },
            { icon: "shieldCheck" as IconName, label: "Resources", sub: "Docs & compliance", anchor: "resources" },
          ].map((q) => (
            <button key={q.label} onClick={() => document.getElementById(q.anchor)?.scrollIntoView({ behavior: "smooth" })} className="group rounded-2xl border border-line bg-white p-4 text-left shadow-pm transition-all duration-200 hover:-translate-y-1 hover:shadow-pm-lg">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-pmgreen-soft text-[#067647]"><Icon name={q.icon} size={18} /></span>
              <p className="mt-2.5 text-[13px] font-bold text-ink">{q.label}</p>
              <p className="text-[10.5px] font-semibold text-faint">{q.sub}</p>
            </button>
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
    <section id="card-defaults" className="scroll-mt-24">
      <SectionHead no="02" title="Programme Defaults" sub="Every newly issued card inherits these settings. Existing cards are unaffected.">
        <Btn size="sm" icon="sliders" onClick={() => openModal({ type: "settingsDefaults" })}>Edit All</Btn>
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Default card behaviour</p>
            <ul className="space-y-2">
              {([
                ["online", "Default for Online Payments", "Card-not-present enabled at issuance", "globe", cardDefaults.online],
                ["contactless", "Default for Contactless / NFC", "Tap-to-pay enabled at issuance", "wave", cardDefaults.contactless],
                ["atm", "Default for ATM", "Cash access enabled at issuance", "wallet", cardDefaults.atm],
                ["spendingAlerts", "Spending alerts on by default", "Real-time push + SMS for new cards", "bell", cardDefaults.spendingAlerts],
                ["autoFreezeUnused", "Auto-freeze unused cards", "Freeze after 60 days with no activity", "snow", cardDefaults.autoFreezeUnused],
              ] as [keyof CardDefaults, string, string, IconName, boolean][]).map(([key, title, desc, icon, on]) => (
                <li key={key} className={cn("flex items-center gap-3 rounded-xl border p-3 transition", on ? "border-pmgreen/40 bg-pmgreen-soft/35" : "border-line bg-canvas/40")}>
                  <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", on ? "bg-white text-[#067647] shadow-sm" : "bg-white text-faint")}><Icon name={icon} size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-ink">{title}</p>
                    <p className="text-[11px] leading-snug text-muted">{desc}</p>
                  </div>
                  <Toggle on={on} label={title} onChange={(v) => set({ [key]: v } as Partial<CardDefaults>)} />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-muted">Default funding source for virtual cards</p>
              <select value={cardDefaults.fundingSource} onChange={(e) => { set({ fundingSource: e.target.value }); }} className="focus-ring w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink outline-none">
                {DEFAULT_FUNDING_SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-muted">Preferred international currency</p>
              <select value={cardDefaults.currency} onChange={(e) => { set({ currency: e.target.value }); }} className="focus-ring w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink outline-none">
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted">Used for cross-border settlement and virtual-card billing when no card-level currency is set.</p>
            </div>
            <button onClick={() => { set({ online: true, contactless: true, atm: false, spendingAlerts: true, autoFreezeUnused: false }); toast("success", "Defaults reset", "Restored to the recommended configuration."); }} className="w-full rounded-[10px] border border-dashed border-line py-2.5 text-[11.5px] font-bold text-muted transition hover:border-pmgreen/50 hover:text-[#067647]">
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
    <section id="support" className="scroll-mt-24">
      <SectionHead no="03" title="Get Support" sub="Reach a card specialist through whichever channel suits you." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SUPPORT_CHANNELS.map((c, i) => (
          <Reveal key={c.id} delay={i * 60}>
            <button onClick={() => openDrawer({ type: "support" })} className="group flex h-full flex-col rounded-2xl border border-line bg-white p-4 text-left shadow-pm transition-all duration-200 hover:-translate-y-1 hover:border-pmgreen/50 hover:shadow-pm-lg">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-pmgreen-soft text-[#067647]"><Icon name={c.icon} size={19} /></span>
              <p className="mt-3 text-[14px] font-bold text-ink">{c.name}</p>
              <p className="mt-0.5 flex-1 text-[11.5px] text-muted">{c.sub}</p>
              <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3">
                <Badge tone="success" dot>Avg {c.response}</Badge>
                <Icon name="arrowRight" size={14} className="text-faint transition group-hover:translate-x-0.5 group-hover:text-ink" />
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      <Reveal delay={100}>
        <div className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-pm">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-pmblue-soft text-[#175cd3]"><Icon name="headset" size={20} /></span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[13.5px] font-bold text-ink">We're online now <span className="live-dot" /></p>
            <p className="text-[11.5px] text-muted">Average first response: 3 minutes. Card specialists are available 24/7.</p>
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
    <section id="faq" className="scroll-mt-24">
      <SectionHead no="04" title="Help & FAQs" sub="Answers to the questions card administrators ask most." />
      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="space-y-2">
            {SUPPORT_FAQS.map((f, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm transition-all duration-200">
                <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-pmgreen-soft text-[#067647]"><Icon name="help" size={14} /></span>
                  <span className="flex-1 text-[13px] font-bold text-ink">{f.q}</span>
                  <Icon name="chevDown" size={15} className={cn("flex-none text-faint transition-transform duration-200", open === i && "rotate-180")} />
                </button>
                {open === i && <p className="border-t border-line/70 bg-canvas/40 px-4 py-3.5 text-[12.5px] leading-relaxed text-muted">{f.a}</p>}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2 text-[13.5px] font-bold text-ink">Still stuck?</p>
              <p className="text-[12px] leading-relaxed text-muted">Can't find an answer? Open a ticket and a specialist will get back to you in minutes.</p>
              <Btn className="mt-3 w-full" icon="send" onClick={() => window.dispatchEvent(new CustomEvent("pm-open-support"))}>Open a support ticket</Btn>
            </div>
            <div className="flex-1 rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2 text-[13.5px] font-bold text-ink">Self-service quick links</p>
              <ul className="space-y-1.5">
                {[
                  ["Freeze a lost card", "snow", "security"],
                  ["Dispute a transaction", "flag", "transactions"],
                  ["View my PIN", "key", "cards"],
                  ["Change card limits", "sliders", "cards"],
                ].map(([label, icon, anchor]) => (
                  <li key={label as string}>
                    <button onClick={() => window.dispatchEvent(new CustomEvent("pm-goto", { detail: anchor }))} className="flex w-full items-center gap-2.5 rounded-[10px] border border-line bg-canvas/40 px-3 py-2.5 text-left text-[12px] font-bold text-ink transition hover:border-pmgreen/50 hover:bg-pmgreen-soft/40">
                      <Icon name={icon as IconName} size={14} className="text-muted" />
                      <span className="flex-1">{label}</span>
                      <Icon name="arrowRight" size={13} className="text-faint" />
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
    <section id="resources" className="scroll-mt-24">
      <SectionHead no="05" title="Resources & Trust" sub="Documentation, guides and the compliance foundations behind the programme." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {RESOURCES.map((r, i) => (
          <Reveal key={r.id} delay={i * 60}>
            <button onClick={() => toast("info", `${r.title} opened`, "The resource is available to download.")} className="group flex h-full flex-col rounded-2xl border border-line bg-white p-4 text-left shadow-pm transition-all duration-200 hover:-translate-y-1 hover:shadow-pm-lg">
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-canvas text-muted"><Icon name={r.icon} size={18} /></span>
                <Badge tone="muted">{r.tag}</Badge>
              </div>
              <p className="mt-3 text-[13px] font-bold text-ink">{r.title}</p>
              <p className="mt-0.5 flex-1 text-[11.5px] leading-snug text-muted">{r.desc}</p>
              <Icon name="arrowRight" size={14} className="mt-3 text-faint transition group-hover:translate-x-0.5 group-hover:text-ink" />
            </button>
          </Reveal>
        ))}
      </div>

      <Reveal delay={100}>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {TRUST_BADGES.map((b) => (
            <div key={b.label} className="flex items-center gap-2.5 rounded-2xl border border-line bg-white px-4 py-3 shadow-pm">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-pmgreen-soft text-[#067647]"><Icon name={b.icon} size={15} /></span>
              <span className="text-[11.5px] font-bold text-ink">{b.label}</span>
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
      <div className="space-y-4">
        <ul className="space-y-2">
          {([
            ["online", "Default for Online Payments", "Card-not-present enabled at issuance", "globe", d.online],
            ["contactless", "Default for Contactless / NFC", "Tap-to-pay enabled at issuance", "wave", d.contactless],
            ["atm", "Default for ATM", "Cash access enabled at issuance", "wallet", d.atm],
          ] as const).map(([key, title, desc, icon, on]) => (
            <li key={key} className={cn("flex items-center gap-3 rounded-xl border p-3 transition", on ? "border-pmgreen/40 bg-pmgreen-soft/35" : "border-line bg-canvas/40")}>
              <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", on ? "bg-white text-[#067647] shadow-sm" : "bg-white text-faint")}><Icon name={icon} size={16} /></span>
              <div className="min-w-0 flex-1"><p className="text-[12.5px] font-bold text-ink">{title}</p><p className="text-[11px] leading-snug text-muted">{desc}</p></div>
              <Toggle on={on} label={title} onChange={(v) => set({ [key]: v } as Partial<CardDefaults>)} />
            </li>
          ))}
        </ul>

        <div>
          <FieldLabel>Default funding source for virtual cards</FieldLabel>
          <select value={d.fundingSource} onChange={(e) => set({ fundingSource: e.target.value })} className="focus-ring w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink outline-none">
            {DEFAULT_FUNDING_SOURCES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <FieldLabel>Preferred international currency</FieldLabel>
          <select value={d.currency} onChange={(e) => set({ currency: e.target.value })} className="focus-ring w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink outline-none">
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas/40 p-3">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-white text-faint"><Icon name="bell" size={16} /></span>
          <div className="min-w-0 flex-1"><p className="text-[12.5px] font-bold text-ink">Spending alerts on by default</p><p className="text-[11px] text-muted">Real-time push + SMS for new cards.</p></div>
          <Toggle on={d.spendingAlerts} label="Spending alerts" onChange={(v) => set({ spendingAlerts: v })} />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas/40 p-3">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-white text-faint"><Icon name="snow" size={16} /></span>
          <div className="min-w-0 flex-1"><p className="text-[12.5px] font-bold text-ink">Auto-freeze unused cards</p><p className="text-[11px] text-muted">Freeze after 60 days with no authorisation activity.</p></div>
          <Toggle on={d.autoFreezeUnused} label="Auto-freeze unused" onChange={(v) => set({ autoFreezeUnused: v })} />
        </div>

        <p className="rounded-lg bg-canvas/80 px-3 py-2 text-[11.5px] leading-relaxed text-muted">
          These defaults apply to cards issued from now on. You can always override them on an individual card.
        </p>
      </div>
    </Modal>
  );
}
