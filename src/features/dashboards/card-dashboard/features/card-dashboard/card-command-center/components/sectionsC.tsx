import { useState } from "react";
import { cn } from "../../../../lib";
import { Icon } from "../../../../components/ui/icons";
import { Badge, Btn, Progress, Reveal, SectionHead, Toggle } from "../../../../components/ui";
import { useApp } from "../../../../lib";
import { CHANNEL_MIX, HEALTH_SYSTEMS, INTL_CORRIDORS, SPEND_CATEGORIES } from "../../../../lib";

/* ============ 05 · Security & Fraud ============ */

export function SecuritySection() {
  const { cards, openModal, toast } = useApp();
  const [guards, setGuards] = useState({
    threeDS: true,
    velocity: true,
    geoAtm: false,
    nightLock: false,
  });

  const blocked = cards.filter((c) => c.status === "blocked");

  const guardList: { key: keyof typeof guards; icon: Parameters<typeof Icon>[0]["name"]; title: string; desc: string }[] = [
    { key: "threeDS", icon: "shieldCheck", title: "3-D Secure enforcement", desc: "OTP on every online authorisation above KES 5,000." },
    { key: "velocity", icon: "gauge", title: "Velocity rules", desc: "Max 6 authorisations / 10 min per card, then soft-decline." },
    { key: "geoAtm", icon: "wallet", title: "ATM geo-blocking", desc: "Decline ATM withdrawals outside Kenya." },
    { key: "nightLock", icon: "clock", title: "Night lock (POS)", desc: "Block physical POS taps between 23:00 and 05:00 EAT." },
  ];

  return (
    <section id="security" className="scroll-mt-24">
      <SectionHead  title="Security & Fraud Prevention" sub="Containment tools act instantly across Visa and Mastercard rails." />

      {/* Fraud alert banner */}
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-warn/40 bg-gradient-to-r from-warn-soft to-[#fff8ec] p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-warn/15 text-[#93370d]">
              <Icon name="alertTri" size={20} />
            </span>
            <div className="min-w-0 flex-1 basis-[260px]">
              <p className="flex items-center gap-2 font-display text-[14.5px] font-bold text-[#93370d]">
                Fraud spike detected <span className="live-dot amber" />
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#93370d]/75">
                Card-not-present attempts in Eastern Europe are elevated <strong>400%</strong> in the last 6 hours.
                Two transactions on Founder Card •• 8821 are flagged for review.
              </p>
            </div>
            <div className="flex gap-2">
              <Btn variant="dark" icon="shield" onClick={() => openModal({ type: "fraud" })}>Review & Secure</Btn>
              <Btn
                variant="outline"
                onClick={() => {
                  toast("info", "Watching closely", "We've tightened ML scoring for CNP traffic for 24h.");
                }}
              >
                Snooze 24h
              </Btn>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-3 grid gap-3 lg:grid-cols-5">
        {/* Safeguards */}
        <Reveal className="lg:col-span-3">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Portfolio safeguards</p>
            <ul className="space-y-2">
              {guardList.map((g) => (
                <li key={g.key} className={cn("flex items-center gap-3 rounded-xl border p-3 transition", guards[g.key] ? "border-pmgreen/40 bg-pmgreen-soft/40" : "border-line bg-white")}>
                  <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", guards[g.key] ? "bg-white text-[#067647] shadow-sm" : "bg-canvas text-faint")}>
                    <Icon name={g.icon} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-ink">{g.title}</p>
                    <p className="text-[11px] leading-snug text-muted">{g.desc}</p>
                  </div>
                  <Toggle
                    on={guards[g.key]}
                    label={g.title}
                    onChange={(v) => {
                      setGuards((s) => ({ ...s, [g.key]: v }));
                      toast(v ? "success" : "warn", `${g.title} ${v ? "enabled" : "disabled"}`, "Applied to every active card in the programme.");
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Recent containment + blocked */}
        <Reveal delay={80} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2.5 text-[13.5px] font-bold text-ink">30-day containment</p>
              {[
                ["Authorisations challenged", "312", "bg-pmblue", 78],
                ["Blocked pre-emptively", "46", "bg-danger", 34],
                ["Value protected", "KES 412k", "bg-pmgreen", 62],
              ].map(([label, val, color, w]) => (
                <div key={label as string} className="mb-2.5 last:mb-0">
                  <div className="mb-1 flex justify-between text-[11.5px] font-bold">
                    <span className="text-muted">{label}</span>
                    <span className="num font-display text-ink">{val}</span>
                  </div>
                  <div className="h-[5px] overflow-hidden rounded-full bg-[#eef0f4]">
                    <div className={cn("h-full rounded-full", color as string)} style={{ width: `${w}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1 rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2.5 text-[13.5px] font-bold text-ink">Blocked cards</p>
              {blocked.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line bg-canvas/50 p-3.5 text-center text-[11.5px] font-semibold text-faint">
                  No permanently blocked cards. Blocks appear here with replacement links.
                </p>
              ) : (
                <ul className="space-y-2">
                  {blocked.map((c) => (
                    <li key={c.id} className="flex items-center gap-2.5 rounded-xl border border-danger/25 bg-danger-soft/40 p-3">
                      <Icon name="lock" size={15} className="text-[#b42318]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-bold text-ink">{c.nickname}</p>
                        <p className="text-[10.5px] font-semibold text-faint">•• {c.last4} · blocked {c.issuedOn === "Today" ? "today" : c.issuedOn}</p>
                      </div>
                      <Badge tone="danger">Blocked</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 06 · Analytics ============ */

function Donut() {
  const r = 40;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" className="h-[130px] w-[130px] -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#eef0f4" strokeWidth="13" />
      {CHANNEL_MIX.map((c) => {
        const len = (c.pct / 100) * circ;
        const el = (
          <circle
            key={c.name}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={c.color}
            strokeWidth="13"
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

export function AnalyticsSection() {
  const { toast } = useApp();
  const max = Math.max(...SPEND_CATEGORIES.map((c) => c.amount));
  return (
    <section id="analytics" className="scroll-mt-24">
      <SectionHead
        
        title="Analytics & Reporting"
        sub="Where the programme's money actually goes — merchant mix, rails and corridors."
      >
        <Btn
          size="sm"
          variant="outline"
          icon="download"
          onClick={() => toast("success", "Report queued", "Full portfolio report (Module 5.8 datasets) will land in your email within a minute.")}
        >
          Full report · Module 5.8
        </Btn>
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-5">
        {/* Category bars */}
        <Reveal className="lg:col-span-3">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <div className="mb-3 flex items-baseline justify-between">
              <p className="font-display text-[13.5px] font-bold text-ink">MTD spend by category</p>
              <p className="num text-[11.5px] font-bold text-faint">KES 424,000 total</p>
            </div>
            <ul className="space-y-2.5">
              {SPEND_CATEGORIES.map((c) => (
                <li key={c.name}>
                  <div className="mb-1 flex items-baseline justify-between text-[11.5px]">
                    <span className="font-bold text-ink-2">{c.name}</span>
                    <span className="num font-bold text-muted">KES {c.amount.toLocaleString()} · {c.pct}%</span>
                  </div>
                  <div className="h-[7px] overflow-hidden rounded-full bg-[#eef0f4]">
                    <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${(c.amount / max) * 100}%`, background: c.color }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-canvas/80 px-3 py-2 text-[11.5px] font-semibold leading-relaxed text-muted">
              <Icon name="spark" size={13} className="mt-0.5 flex-none text-pmviolet" />
              Travel grew 24% MoM — seasonal holiday bookings. Consider pushing the Premium Travel card to frequent flyers.
            </p>
          </div>
        </Reveal>

        <div className="flex flex-col gap-3 lg:col-span-2">
          {/* Channel mix */}
          <Reveal delay={80}>
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2 text-[13.5px] font-bold text-ink">Authorisation rails</p>
              <div className="flex items-center gap-4">
                <div className="relative flex-none">
                  <Donut />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="rotate-0 text-center leading-tight">
                      <span className="num block font-display text-[17px] font-bold text-ink">68%</span>
                      <span className="block text-[9px] font-bold uppercase tracking-wide text-faint">tap-to-pay</span>
                    </span>
                  </span>
                </div>
                <ul className="min-w-0 flex-1 space-y-1.5">
                  {CHANNEL_MIX.map((c) => (
                    <li key={c.name} className="flex items-center gap-2 text-[11.5px]">
                      <span className="h-2.5 w-2.5 flex-none rounded-[3px]" style={{ background: c.color }} />
                      <span className="min-w-0 flex-1 truncate font-bold text-ink-2">{c.name}</span>
                      <span className="num font-bold text-muted">{c.pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          {/* International corridors */}
          <Reveal delay={140}>
            <div className="flex-1 rounded-2xl border border-line bg-white p-4 shadow-pm">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-display text-[13.5px] font-bold text-ink">International corridors</p>
                <Badge tone="info">12% of volume</Badge>
              </div>
              <ul className="space-y-2">
                {INTL_CORRIDORS.map((c) => (
                  <li key={c.country}>
                    <div className="mb-0.5 flex justify-between text-[11px] font-bold">
                      <span className="text-ink-2">{c.country}</span>
                      <span className="text-faint">{c.vol} · {c.pct}%</span>
                    </div>
                    <Progress value={c.pct * 2} tone="blue" className="h-[5px]" />
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============ 07 · Programme, Health & Settings ============ */

export function ProgramSection() {
  const { toast, sync, syncing, lastSync, openDrawer } = useApp();
  const [defaults, setDefaults] = useState({ online: true, contactless: true, atm: false });
  const [funding, setFunding] = useState("Biz Wallet (primary)");
  const [currency, setCurrency] = useState("KES — Kenya Shilling");

  const corpConfig = [
    ["Liability Model", "Corporate — company liable", "Corporate programme settles all charges"],
    ["Billing Cycle End", "28th of month", "Statement generated 29th, 02:00 EAT"],
    ["Auto-Debit Settlement", "Enabled", "From KCB •• 4471 on the 30th"],
    ["Settlement Grace Period", "3 days", "Late settlement attracts 2.1% p.m."],
  ];

  return (
    <section id="program" className="scroll-mt-24">
      <SectionHead  title="Programme & System Health" sub="Corporate programme terms and the issuing stack underneath it (Modules 5.6 & 5.9)." />

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Corporate config */}
        <Reveal>
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-[13.5px] font-bold text-ink">Corporate programme terms</p>
              <Badge tone="violet">Module 5.6</Badge>
            </div>
            <ul className="divide-y divide-line/70">
              {corpConfig.map(([k, v, sub]) => (
                <li key={k} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-ink">{k}</p>
                    <p className="text-[11px] font-semibold text-faint">{sub}</p>
                  </div>
                  <Badge tone="success">{v}</Badge>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ["Departments", "4", "building"],
                ["Budget MTD", "KES 4.5M", "wallet"],
                ["Utilisation", "76%", "gauge"],
              ].map(([k, v, icon]) => (
                <div key={k} className="rounded-xl bg-canvas/70 p-2.5 text-center">
                  <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={15} className="mx-auto text-muted" />
                  <p className="num mt-1 font-display text-[13px] font-bold text-ink">{v}</p>
                  <p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">{k}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Health */}
        <Reveal delay={80}>
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm" id="health">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-[13.5px] font-bold text-ink">Issuing stack health</p>
              <button onClick={sync} className="flex items-center gap-1.5 text-[11.5px] font-bold text-pmgreen-dark transition hover:text-pmgreen">
                <Icon name="refresh" size={12} className={cn(syncing && "spin-slow")} /> Re-check
              </button>
            </div>
            <ul className="space-y-2">
              {HEALTH_SYSTEMS.map((h) => (
                <li key={h.name} className="flex items-center gap-3 rounded-xl border border-line bg-canvas/40 px-3 py-2.5">
                  <span className={cn("live-dot", h.dot === "amber" && "amber")} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-ink">{h.name}</p>
                    <p className="text-[10.5px] font-semibold text-faint">{h.detail}</p>
                  </div>
                  <Badge tone={h.dot === "green" ? "success" : "warning"}>{h.status}</Badge>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-faint">
              <Icon name="clock" size={12} /> Last automated check {syncing ? "running…" : `· ${lastSync}`} · all issuing endpoints accepting payloads
            </p>
          </div>
        </Reveal>
      </div>

      {/* Settings (5.10) */}
      <div id="settings" className="scroll-mt-24">
        <SectionHead  title="Card Settings & Support" sub="Programme-wide defaults applied to every newly issued card" />
        <div className="grid gap-3 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Default for new cards</p>
              <ul className="space-y-2">
                {(
                  [
                    ["online", "Default for Online Payments", "Card-not-present enabled at issuance", "globe"],
                    ["contactless", "Default for Contactless / NFC", "Tap-to-pay enabled at issuance", "wave"],
                    ["atm", "Default for ATM", "Cash access enabled at issuance", "wallet"],
                  ] as const
                ).map(([key, title, desc, icon]) => (
                  <li key={key} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-canvas text-muted"><Icon name={icon} size={16} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-bold text-ink">{title}</p>
                      <p className="text-[11px] text-muted">{desc}</p>
                    </div>
                    <Toggle
                      on={defaults[key]}
                      label={title}
                      onChange={(v) => {
                        setDefaults((d) => ({ ...d, [key]: v }));
                        toast("success", `${title.split("Default for ")[1]} ${v ? "enabled" : "disabled"} by default`);
                      }}
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.06em] text-muted">Default funding source · virtual cards</p>
                  <select value={funding} onChange={(e) => { setFunding(e.target.value); toast("success", "Funding source updated"); }} className="focus-ring w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink outline-none">
                    {["Biz Wallet (primary)", "M-Pesa Paybill 522 123", "KCB Bank •• 4471"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.06em] text-muted">Preferred international currency</p>
                  <select value={currency} onChange={(e) => { setCurrency(e.target.value); toast("success", "Settlement currency updated"); }} className="focus-ring w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink outline-none">
                    {["KES — Kenya Shilling", "USD — US Dollar", "GBP — British Pound", "EUR — Euro"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80} className="lg:col-span-2">
            <div className="flex h-full flex-col rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Need a human?</p>
              <div className="space-y-2">
                {[
                  ["Live chat", "Fastest · card specialists online now", "sms"],
                  ["Fraud hotline", "+254 709 900 112 · 24/7", "phone"],
                  ["Email desk", "cards@paymo.app · < 1 hour", "mail"],
                ].map(([t, s, icon]) => (
                  <button key={t} onClick={() => openDrawer({ type: "support" })} className="group flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left transition hover:-translate-y-0.5 hover:border-pmgreen/50 hover:shadow-pm">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-pmgreen-soft text-[#067647]"><Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={16} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-bold text-ink">{t}</span>
                      <span className="block text-[10.5px] font-semibold text-faint">{s}</span>
                    </span>
                    <Icon name="chevRight" size={14} className="text-faint transition group-hover:translate-x-0.5 group-hover:text-ink" />
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-3">
                <div className="rounded-xl bg-canvas/70 p-3">
                  <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-faint"><span className="live-dot" /> All systems operational</p>
                  <p className="mt-1 text-[11.5px] font-semibold text-muted">Uptime 99.98% · 30 days · status.paymo.app</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
