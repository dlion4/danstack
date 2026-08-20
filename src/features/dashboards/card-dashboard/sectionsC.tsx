/* ============================================================================
 * Card Dashboard — page 5.1 sections C (Bootstrap 5 edition)
 * ----------------------------------------------------------------------------
 * 05 · Security & Fraud, 06 · Analytics & Reporting, 07 · Programme & System
 * Health (+ embedded 08 · Settings & Support block). Behavior and copy
 * identical to the Tailwind original; markup uses Bootstrap utilities +
 * scoped .pmc-* classes.
 * ========================================================================== */

import { useState } from "react";
import { cn } from "./utils/cn";
import { Icon } from "./icons";
import { Badge, Btn, Progress, Reveal, SectionHead, Toggle } from "./ui";
import { useApp } from "./store";
import { CHANNEL_MIX, HEALTH_SYSTEMS, INTL_CORRIDORS, SPEND_CATEGORIES } from "./data";

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
    <section id="security" className="pmc-scroll-mt">
      <SectionHead no="05" title="Security & Fraud Prevention" sub="Containment tools act instantly across Visa and Mastercard rails." />

      {/* Fraud alert banner */}
      <Reveal>
        <div className="pmc-radius pmc-p-4 pmc-sm-p-5 position-relative overflow-hidden" style={{ border: "1px solid rgba(247,144,9,0.4)", background: "linear-gradient(90deg, var(--pmc-warn-soft), #fff8ec)" }}>
          <div className="d-flex flex-wrap align-items-center pmc-gap-4">
            <span className="pmc-icon-sq-xl d-grid" style={{ background: "rgba(247,144,9,0.15)", color: "var(--pmc-warn-ink)" }}>
              <Icon name="alertTri" size={20} />
            </span>
            <div className="flex-grow-1" style={{ minWidth: 0, flexBasis: 260 }}>
              <p className="d-flex align-items-center pmc-gap-2 pmc-display pmc-fs-145 fw-bold pmc-warn-ink mb-0">
                Fraud spike detected <span className="pmc-live-dot amber" />
              </p>
              <p className="pmc-mt-05 pmc-fs-125 mb-0" style={{ lineHeight: 1.65, color: "rgba(147,55,13,0.75)" }}>
                Card-not-present attempts in Eastern Europe are elevated <strong>400%</strong> in the last 6 hours.
                Two transactions on Founder Card •• 8821 are flagged for review.
              </p>
            </div>
            <div className="d-flex pmc-gap-2">
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

      <div className="row pmc-g-3 pmc-mt-3">
        {/* Safeguards */}
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-card p-4 h-100">
            <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Portfolio safeguards</p>
            <ul className="d-flex flex-column pmc-gap-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {guardList.map((g) => (
                <li
                  key={g.key}
                  className="d-flex align-items-center pmc-gap-3 pmc-radius p-3"
                  style={guards[g.key] ? { border: "1px solid rgba(18,183,106,0.4)", background: "rgba(231,248,239,0.4)" } : { border: "1px solid var(--pmc-line)", background: "#fff" }}
                >
                  <span className={cn("pmc-icon-sq d-grid", guards[g.key] ? "pmc-green-ink" : "pmc-tone-muted pmc-faint")} style={guards[g.key] ? { background: "#fff", boxShadow: "0 1px 2px rgba(16,24,40,0.06)" } : undefined}>
                    <Icon name={g.icon} size={16} />
                  </span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="pmc-fs-125 fw-bold pmc-ink mb-0">{g.title}</p>
                    <p className="pmc-fs-11 lh-sm pmc-muted mb-0">{g.desc}</p>
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
        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-card p-4">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-25">30-day containment</p>
              {[
                ["Authorisations challenged", "312", "var(--pmc-blue)", 78],
                ["Blocked pre-emptively", "46", "var(--pmc-danger)", 34],
                ["Value protected", "KES 412k", "var(--pmc-green)", 62],
              ].map(([label, val, color, w], i) => (
                <div key={label as string} className={i < 2 ? "pmc-mb-25" : undefined}>
                  <div className="pmc-mb-1 d-flex justify-content-between pmc-fs-115 fw-bold">
                    <span className="pmc-muted">{label}</span>
                    <span className="pmc-num pmc-display pmc-ink">{val}</span>
                  </div>
                  <div className="overflow-hidden" style={{ height: 5, borderRadius: 99, background: "#eef0f4" }}>
                    <div className="h-100" style={{ width: `${w}%`, borderRadius: 99, background: color as string }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="pmc-card flex-grow-1 p-4">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-25">Blocked cards</p>
              {blocked.length === 0 ? (
                <p className="pmc-radius pmc-p-35 text-center pmc-fs-115 fw-semibold pmc-faint mb-0" style={{ border: "1px dashed var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}>
                  No permanently blocked cards. Blocks appear here with replacement links.
                </p>
              ) : (
                <ul className="d-flex flex-column pmc-gap-2 mb-0" style={{ listStyle: "none", padding: 0 }}>
                  {blocked.map((c) => (
                    <li key={c.id} className="d-flex align-items-center pmc-gap-25 pmc-radius p-3" style={{ border: "1px solid rgba(240,68,56,0.25)", background: "rgba(254,228,226,0.4)" }}>
                      <Icon name="lock" size={15} className="pmc-danger-ink" />
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <p className="pmc-truncate pmc-fs-125 fw-bold pmc-ink mb-0">{c.nickname}</p>
                        <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">•• {c.last4} · blocked {c.issuedOn === "Today" ? "today" : c.issuedOn}</p>
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
    <svg viewBox="0 0 100 100" style={{ width: 130, height: 130, transform: "rotate(-90deg)" }}>
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
    <section id="analytics" className="pmc-scroll-mt">
      <SectionHead
        no="06"
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

      <div className="row pmc-g-3">
        {/* Category bars */}
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-card p-4 h-100">
            <div className="pmc-mb-3 d-flex align-items-baseline justify-content-between">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">MTD spend by category</p>
              <p className="pmc-num pmc-fs-115 fw-bold pmc-faint mb-0">KES 424,000 total</p>
            </div>
            <ul className="d-flex flex-column pmc-gap-25 mb-0" style={{ listStyle: "none", padding: 0 }}>
              {SPEND_CATEGORIES.map((c) => (
                <li key={c.name}>
                  <div className="pmc-mb-1 d-flex align-items-baseline justify-content-between pmc-fs-115">
                    <span className="fw-bold pmc-ink-2">{c.name}</span>
                    <span className="pmc-num fw-bold pmc-muted">KES {c.amount.toLocaleString()} · {c.pct}%</span>
                  </div>
                  <div className="overflow-hidden" style={{ height: 7, borderRadius: 99, background: "#eef0f4" }}>
                    <div className="h-100" style={{ width: `${(c.amount / max) * 100}%`, borderRadius: 99, background: c.color, transition: "width 0.7s ease-out" }} />
                  </div>
                </li>
              ))}
            </ul>
            <p className="pmc-note pmc-note-canvas pmc-mt-3 mb-0">
              <Icon name="spark" size={13} className="pmc-mt-05 flex-none pmc-violet-ink" />
              Travel grew 24% MoM — seasonal holiday bookings. Consider pushing the Premium Travel card to frequent flyers.
            </p>
          </div>
        </Reveal>

        <div className="col-12 col-lg-5 d-flex flex-column pmc-gap-3">
          {/* Channel mix */}
          <Reveal delay={80}>
            <div className="pmc-card p-4">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-2">Authorisation rails</p>
              <div className="d-flex align-items-center pmc-gap-4">
                <div className="position-relative flex-none">
                  <Donut />
                  <span className="position-absolute top-0 start-0 w-100 h-100 d-grid" style={{ placeItems: "center" }}>
                    <span className="text-center lh-sm">
                      <span className="pmc-num pmc-display pmc-fs-17 fw-bold pmc-ink d-block">68%</span>
                      <span className="d-block pmc-fs-9 fw-bold text-uppercase pmc-faint" style={{ letterSpacing: "0.025em" }}>tap-to-pay</span>
                    </span>
                  </span>
                </div>
                <ul className="flex-grow-1 d-flex flex-column pmc-gap-15 mb-0" style={{ minWidth: 0, listStyle: "none", padding: 0 }}>
                  {CHANNEL_MIX.map((c) => (
                    <li key={c.name} className="d-flex align-items-center pmc-gap-2 pmc-fs-115">
                      <span className="d-inline-block flex-none" style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />
                      <span className="flex-grow-1 pmc-truncate fw-bold pmc-ink-2">{c.name}</span>
                      <span className="pmc-num fw-bold pmc-muted">{c.pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          {/* International corridors */}
          <Reveal delay={140}>
            <div className="pmc-card flex-grow-1 p-4">
              <div className="pmc-mb-2 d-flex align-items-center justify-content-between">
                <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">International corridors</p>
                <Badge tone="info">12% of volume</Badge>
              </div>
              <ul className="d-flex flex-column pmc-gap-2 mb-0" style={{ listStyle: "none", padding: 0 }}>
                {INTL_CORRIDORS.map((c) => (
                  <li key={c.country}>
                    <div className="pmc-mb-05 d-flex justify-content-between pmc-fs-11 fw-bold">
                      <span className="pmc-ink-2">{c.country}</span>
                      <span className="pmc-faint">{c.vol} · {c.pct}%</span>
                    </div>
                    <Progress value={c.pct * 2} tone="blue" />
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
    <section id="program" className="pmc-scroll-mt">
      <SectionHead no="07" title="Programme & System Health" sub="Corporate programme terms and the issuing stack underneath it (Modules 5.6 & 5.9)." />

      <div className="row pmc-g-3">
        {/* Corporate config */}
        <Reveal className="col-12 col-lg-6 h-100">
          <div className="pmc-card p-4 h-100">
            <div className="pmc-mb-3 d-flex align-items-center justify-content-between">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Corporate programme terms</p>
              <Badge tone="violet">Module 5.6</Badge>
            </div>
            <ul className="pmc-divided">
              {corpConfig.map(([k, v, sub]) => (
                <li key={k} className="d-flex align-items-center pmc-gap-3 pmc-py-25">
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="pmc-fs-125 fw-bold pmc-ink mb-0">{k}</p>
                    <p className="pmc-fs-11 fw-semibold pmc-faint mb-0">{sub}</p>
                  </div>
                  <Badge tone="success">{v}</Badge>
                </li>
              ))}
            </ul>
            <div className="pmc-mt-3 row pmc-g-2">
              {[
                ["Departments", "4", "building"],
                ["Budget MTD", "KES 4.5M", "wallet"],
                ["Utilisation", "76%", "gauge"],
              ].map(([k, v, icon]) => (
                <div key={k} className="col-4">
                  <div className="pmc-radius-sm pmc-p-25 text-center h-100" style={{ background: "rgba(242,244,248,0.7)" }}>
                    <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={15} className="mx-auto pmc-muted" />
                    <p className="pmc-num pmc-mt-1 pmc-display pmc-fs-13 fw-bold pmc-ink mb-0">{v}</p>
                    <p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>{k}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Health */}
        <Reveal delay={80} className="col-12 col-lg-6 h-100">
          <div className="pmc-card p-4 h-100" id="health">
            <div className="pmc-mb-3 d-flex align-items-center justify-content-between">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">Issuing stack health</p>
              <button type="button" onClick={sync} className="d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-bold pmc-green-dark pmc-focus" style={{ background: "none", border: "none", padding: 0 }}>
                <Icon name="refresh" size={12} className={cn(syncing && "pmc-spin")} /> Re-check
              </button>
            </div>
            <ul className="d-flex flex-column pmc-gap-2 mb-0" style={{ listStyle: "none", padding: 0 }}>
              {HEALTH_SYSTEMS.map((h) => (
                <li key={h.name} className="d-flex align-items-center pmc-gap-3 pmc-radius pmc-px-3 pmc-py-25" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}>
                  <span className={cn("pmc-live-dot", h.dot === "amber" && "amber")} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="pmc-fs-125 fw-bold pmc-ink mb-0">{h.name}</p>
                    <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{h.detail}</p>
                  </div>
                  <Badge tone={h.dot === "green" ? "success" : "warning"}>{h.status}</Badge>
                </li>
              ))}
            </ul>
            <p className="pmc-mt-3 d-flex align-items-center justify-content-center pmc-gap-15 pmc-fs-11 fw-semibold pmc-faint mb-0">
              <Icon name="clock" size={12} /> Last automated check {syncing ? "running…" : `· ${lastSync}`} · all issuing endpoints accepting payloads
            </p>
          </div>
        </Reveal>
      </div>

      {/* Settings (5.10) */}
      <div id="settings" className="pmc-scroll-mt">
        <SectionHead no="08" title="Card Settings & Support" sub="Programme-wide defaults applied to every newly issued card (Module 5.10)." />
        <div className="row pmc-g-3">
          <Reveal className="col-12 col-lg-7 h-100">
            <div className="pmc-card p-4 h-100">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Default for new cards</p>
              <ul className="d-flex flex-column pmc-gap-2 mb-0" style={{ listStyle: "none", padding: 0 }}>
                {(
                  [
                    ["online", "Default for Online Payments", "Card-not-present enabled at issuance", "globe"],
                    ["contactless", "Default for Contactless / NFC", "Tap-to-pay enabled at issuance", "wave"],
                    ["atm", "Default for ATM", "Cash access enabled at issuance", "wallet"],
                  ] as const
                ).map(([key, title, desc, icon]) => (
                  <li key={key} className="d-flex align-items-center pmc-gap-3 pmc-radius pmc-px-3 pmc-py-25" style={{ border: "1px solid var(--pmc-line)" }}>
                    <span className="pmc-icon-sq d-grid pmc-tone-muted"><Icon name={icon} size={16} /></span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p className="pmc-fs-125 fw-bold pmc-ink mb-0">{title}</p>
                      <p className="pmc-fs-11 pmc-muted mb-0">{desc}</p>
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
              <div className="pmc-mt-3 row pmc-g-2">
                <div className="col-12 col-sm-6">
                  <p className="pmc-mb-1 pmc-fs-11 fw-bold text-uppercase pmc-muted" style={{ letterSpacing: "0.06em" }}>Default funding source · virtual cards</p>
                  <select value={funding} onChange={(e) => { setFunding(e.target.value); toast("success", "Funding source updated"); }} className="form-select pmc-focus pmc-fs-125 fw-bold pmc-ink">
                    {["Biz Wallet (primary)", "M-Pesa Paybill 522 123", "KCB Bank •• 4471"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="col-12 col-sm-6">
                  <p className="pmc-mb-1 pmc-fs-11 fw-bold text-uppercase pmc-muted" style={{ letterSpacing: "0.06em" }}>Preferred international currency</p>
                  <select value={currency} onChange={(e) => { setCurrency(e.target.value); toast("success", "Settlement currency updated"); }} className="form-select pmc-focus pmc-fs-125 fw-bold pmc-ink">
                    {["KES — Kenya Shilling", "USD — US Dollar", "GBP — British Pound", "EUR — Euro"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80} className="col-12 col-lg-5 h-100">
            <div className="pmc-card d-flex flex-column p-4 h-100">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Need a human?</p>
              <div className="d-flex flex-column pmc-gap-2">
                {[
                  ["Live chat", "Fastest · card specialists online now", "sms"],
                  ["Fraud hotline", "+254 709 900 112 · 24/7", "phone"],
                  ["Email desk", "cards@paymo.app · < 1 hour", "mail"],
                ].map(([t, s, icon]) => (
                  <button key={t} type="button" onClick={() => openDrawer({ type: "support" })} className="pmc-lift pmc-focus d-flex w-100 align-items-center pmc-gap-3 pmc-radius p-3 text-start" style={{ border: "1px solid var(--pmc-line)", background: "#fff" }}>
                    <span className="pmc-icon-sq d-grid pmc-tone-green"><Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={16} /></span>
                    <span className="flex-grow-1" style={{ minWidth: 0 }}>
                      <span className="d-block pmc-fs-125 fw-bold pmc-ink">{t}</span>
                      <span className="d-block pmc-fs-105 fw-semibold pmc-faint">{s}</span>
                    </span>
                    <Icon name="chevRight" size={14} className="pmc-faint" />
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-3">
                <div className="pmc-radius p-3" style={{ background: "rgba(242,244,248,0.7)" }}>
                  <p className="d-flex align-items-center pmc-gap-15 pmc-fs-105 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.1em" }}><span className="pmc-live-dot" /> All systems operational</p>
                  <p className="pmc-mt-1 pmc-fs-115 fw-semibold pmc-muted mb-0">Uptime 99.98% · 30 days · status.paymo.app</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
