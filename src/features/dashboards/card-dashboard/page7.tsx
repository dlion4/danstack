/* ============================================================================
 * Card Dashboard — page 5.7 · Security & Fraud Prevention (Bootstrap 5)
 * ========================================================================== */

import { useEffect, useState } from "react";
import { cn } from "./utils/cn";
import { Icon, type IconName } from "./icons";
import { Badge, Btn, Chip, FieldLabel, Modal, Reveal, SectionHead, Spark, Toggle, Empty } from "./ui";
import { useApp } from "./store";
import {
  COMPROMISE_REASONS,
  RISK_METRICS,
  SEED_SECURITY_RULES,
  SEED_SUSPICIOUS,
  kes,
  kesShort,
} from "./data";

const severityMeta = (s: string): { tone: "danger" | "warning" | "info" | "muted"; label: string; icon: IconName } =>
  s === "critical" ? { tone: "danger", label: "Critical", icon: "alertTri" } : s === "high" ? { tone: "warning", label: "High", icon: "alertTri" } : s === "medium" ? { tone: "info", label: "Medium", icon: "shield" } : { tone: "muted", label: "Low", icon: "info" };

const outcomeTone = (o: string): "success" | "warning" | "danger" => (o === "success" ? "success" : o === "warning" ? "warning" : "danger");

/* ============ 01 · Security overview ============ */

export function SecurityOverview() {
  const { cards, fraudEvents, openModal, setPage } = useApp();
  const activeFraud = fraudEvents.filter((e) => !e.resolved);
  const frozen = cards.filter((c) => c.status === "frozen").length;
  const risk = RISK_METRICS;

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
                <span className="pmc-hero-chip">Module 5.7</span>
              </div>
              <h1 className="pmc-hero-title pmc-mt-3">
                Security &amp; Fraud<br className="d-none d-sm-inline" /> Prevention
              </h1>
              <p className="pmc-hero-sub" style={{ maxWidth: 510 }}>
                Live fraud posture, enforceable safeguards, and a one-click compromise workflow that blocks a card,
                files disputes and issues a replacement in under a minute.
              </p>
              <div className="pmc-mt-4 d-flex flex-wrap pmc-gap-2">
                <Btn icon="alertTri" onClick={() => openModal({ type: "fraudWizard" })}>Report Compromised Card</Btn>
                <Btn variant="ghost" icon="shield" onClick={() => document.getElementById("safeguards")?.scrollIntoView({ behavior: "smooth" })}>Safeguards</Btn>
                <Btn variant="ghost" icon="gauge" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="pmc-hero-stats">
                {[
                  { k: "Risk score", v: `${risk.score}/100`, warn: false },
                  { k: "Attempts blocked", v: String(risk.attemptsBlocked) },
                  { k: "Value protected", v: kesShort(risk.valueProtected) },
                  { k: "Open fraud events", v: String(activeFraud.length), warn: activeFraud.length > 0 },
                ].map((s) => (
                  <div key={s.k} className="lh-sm">
                    <p className="pmc-hero-stat-value" style={s.warn ? { color: "#ffd27d" } : undefined}>{s.v}</p>
                    <p className="pmc-hero-stat-label">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* risk gauge */}
            <div className="position-relative flex-none d-none d-md-grid" style={{ height: 230, width: 230, placeItems: "center" }}>
              <svg viewBox="0 0 120 120" style={{ width: 200, height: 200, transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="#12b76a" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(risk.score / 100) * 326.7} 326.7`} />
              </svg>
              <div className="position-absolute d-grid text-center" style={{ inset: 0, placeItems: "center" }}>
                <div>
                  <p className="pmc-display fw-bold lh-1 mb-0" style={{ fontSize: 34 }}>{risk.score}</p>
                  <p className="pmc-fs-11 fw-bold text-uppercase mb-0" style={{ letterSpacing: "0.12em", color: "#cfe8db" }}>{risk.label}</p>
                  <p className="pmc-mt-1 pmc-fs-95 mb-0" style={{ color: "rgba(255,255,255,0.45)" }}>of 100 risk points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="row pmc-g-3 pmc-mt-4">
        {[
          { icon: "shield" as IconName, tone: "pmc-tone-green", label: "Attempts Blocked · 30d", value: String(risk.attemptsBlocked), note: "Pre-empted by policy rules", spark: [6, 8, 9, 12, 11, 14, 16, 18], stroke: "#12b76a" },
          { icon: "flag" as IconName, tone: "pmc-tone-warn", label: "Open Disputes", value: String(risk.disputesOpen), note: "Resolve in 7–14 days", spark: [1, 2, 1, 2, 2, 1, 2, 2], stroke: "#f79009", action: () => document.getElementById("suspicious")?.scrollIntoView({ behavior: "smooth" }) },
          { icon: "snow" as IconName, tone: "pmc-tone-blue", label: "Frozen Cards", value: String(frozen), note: "Protective freezes in effect", spark: [1, 1, 2, 1, 1, 2, 2, 2], stroke: "#2e90fa" },
          { icon: "bell" as IconName, tone: "pmc-tone-violet", label: "Alerts · 30d", value: String(risk.alerts30d), note: "Across push, SMS & email", spark: [14, 16, 18, 20, 19, 22, 24, 26], stroke: "#7a5af8" },
        ].map((k, i) => (
          <div key={k.label} className="col-12 col-sm-6 col-xl-3">
            <Reveal delay={i * 70} className="h-100">
              <button
                type="button"
                onClick={k.action}
                className={cn("pmc-card pmc-stat pmc-focus h-100", k.action && "pmc-lift")}
                style={k.action ? undefined : { cursor: "default" }}
              >
                <div className="d-flex align-items-start justify-content-between">
                  <span className={cn("pmc-stat-icon d-grid", k.tone)}><Icon name={k.icon} size={19} /></span>
                  <Spark points={k.spark} stroke={k.stroke} />
                </div>
                <p className="pmc-stat-label">{k.label}</p>
                <p className="pmc-stat-value">{k.value}</p>
                <p className="pmc-mt-2 pmc-fs-11 fw-semibold pmc-faint mb-0">{k.note}</p>
              </button>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ 02 · Fraud events ============ */

export function FraudEventsSection() {
  const { fraudEvents, resolveFraudEvent, openModal } = useApp();
  const [showResolved, setShowResolved] = useState(false);
  const shown = fraudEvents.filter((e) => showResolved || !e.resolved);
  const activeCount = fraudEvents.filter((e) => !e.resolved).length;

  return (
    <section id="fraud-events" className="pmc-scroll-mt">
      <SectionHead no="02" title="Fraud Events" sub="Detected anomalies across the programme, ranked by severity.">
        <Chip on={showResolved} onClick={() => setShowResolved((v) => !v)}>Include resolved</Chip>
      </SectionHead>

      {shown.length === 0 ? (
        <Empty icon="shieldCheck" title="No fraud events" sub="Your programme is clean. Detected anomalies will appear here." />
      ) : (
        <div className="row pmc-g-3">
          {shown.map((e, i) => {
            const m = severityMeta(e.severity);
            return (
              <div key={e.id} className="col-12 col-lg-6">
                <Reveal delay={(i % 2) * 70} className="h-100">
                  <div
                    className="pmc-card pmc-lift p-4 h-100"
                    style={{
                      border: `1px solid ${e.resolved ? "var(--pmc-line)" : "#fecaca"}`,
                      boxShadow: e.severity === "critical" && !e.resolved ? "0 0 0 1px rgba(240,68,56,0.3), var(--shadow-pm)" : undefined,
                    }}
                  >
                    <div className="d-flex align-items-start pmc-gap-3">
                      <span className={cn("pmc-icon-sq d-grid flex-none", m.tone === "danger" ? "pmc-tone-danger" : m.tone === "warning" ? "pmc-tone-warn" : m.tone === "info" ? "pmc-tone-blue" : "pmc-tone-muted")} style={{ width: 40, height: 40 }}>
                        <Icon name={m.icon} size={18} />
                      </span>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <div className="d-flex flex-wrap align-items-center pmc-gap-2">
                          <p className="pmc-fs-135 fw-bold pmc-ink mb-0">{e.title}</p>
                          <Badge tone={m.tone} dot>{m.label}</Badge>
                          {e.resolved && <Badge tone="muted">Resolved</Badge>}
                        </div>
                        <p className="pmc-mt-05 pmc-fs-115 pmc-muted mb-0" style={{ lineHeight: 1.35 }}>{e.detail}</p>
                        <p className="pmc-mt-15 pmc-fs-105 fw-semibold pmc-faint mb-0">{e.time} · {e.affected} card{e.affected === 1 ? "" : "s"} affected</p>
                      </div>
                    </div>
                    <div className="pmc-mt-3 d-flex flex-wrap pmc-gap-2" style={{ borderTop: "1px solid rgba(230,233,240,0.7)", paddingTop: 12 }}>
                      {!e.resolved && (
                        <>
                          <Btn size="sm" icon="search" onClick={() => openModal({ type: "fraudEvent", eventId: e.id })}>Investigate</Btn>
                          <Btn size="sm" variant="outline" icon="check" onClick={() => resolveFraudEvent(e.id)}>Mark resolved</Btn>
                        </>
                      )}
                      {e.severity === "critical" && !e.resolved && (
                        <Btn size="sm" variant="danger" icon="snow" onClick={() => openModal({ type: "freezeAll" })}>Freeze all</Btn>
                      )}
                    </div>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      )}

      <Reveal delay={80}>
        <div className="pmc-mt-3 d-flex align-items-center pmc-gap-3 p-4" style={{ borderRadius: 16, border: "1px solid rgba(247,144,9,0.35)", background: "rgba(255,250,235,0.4)" }}>
          <span className="pmc-icon-sq d-grid flex-none" style={{ width: 40, height: 40, background: "rgba(247,144,9,0.15)", color: "#93370d" }}><Icon name="alertTri" size={18} /></span>
          <p className="flex-grow-1 pmc-fs-125 fw-semibold mb-0" style={{ minWidth: 0, color: "#93370d", lineHeight: 1.6 }}>
            <strong>{activeCount} active event{activeCount === 1 ? "" : "s"}</strong> need{activeCount === 1 ? "s" : ""} attention.
            We tightened ML scoring for card-not-present traffic for 24 hours.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 03 · Safeguards & rules ============ */

export function SafeguardsSection() {
  const { toast } = useApp();
  const [rules, setRules] = useState(SEED_SECURITY_RULES);
  const toggle = (id: string) => {
    setRules((rs) => {
      const next = rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
      const changed = next.find((r) => r.id === id);
      if (changed) toast(changed.enabled ? "success" : "warn", `${changed.title} ${changed.enabled ? "enabled" : "disabled"}`, "Applied to every active card.");
      return next;
    });
  };

  return (
    <section id="safeguards" className="pmc-scroll-mt">
      <SectionHead no="03" title="Safeguards & Rules" sub="Standing rules enforced at the point of authorisation across Visa and Mastercard.">
        <Badge tone="success" dot>{rules.filter((r) => r.enabled).length} of {rules.length} active</Badge>
      </SectionHead>

      <Reveal>
        <div className="pmc-card p-4">
          <ul className="list-unstyled row g-2 mb-0">
            {rules.map((r) => (
              <li key={r.id} className="col-12 col-md-6">
                <div
                  className="d-flex flex-wrap align-items-center pmc-gap-3 pmc-radius p-3 h-100"
                  style={r.enabled ? { border: "1px solid rgba(18,183,106,0.4)", background: "rgba(231,248,239,0.35)" } : { border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}
                >
                  <span className={cn("pmc-icon-sq d-grid flex-none", r.enabled ? "pmc-green-ink" : "pmc-faint")} style={{ background: "#fff", boxShadow: r.enabled ? "0 1px 2px rgba(16,24,40,0.06)" : undefined }}>
                    <Icon name={r.icon} size={16} />
                  </span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="pmc-fs-125 fw-bold pmc-ink mb-0">{r.title}</p>
                    <p className="pmc-fs-11 pmc-muted mb-0" style={{ lineHeight: 1.35 }}>{r.desc}</p>
                  </div>
                  <Badge tone={r.enabled ? "success" : "muted"} dot>{r.enabled ? "On" : "Off"}</Badge>
                  <Toggle on={r.enabled} label={r.title} onChange={() => toggle(r.id)} />
                </div>
              </li>
            ))}
          </ul>
          <p className="pmc-note pmc-note-canvas pmc-mt-3 mb-0">
            <Icon name="info" size={13} className="flex-none pmc-blue" style={{ marginTop: 2 }} />
            Disabling a rule reduces protection. Disabled rules are logged in the audit trail.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 04 · Report a compromise (inline flow) ============ */

export function ReportCardSection() {
  const { cards, openModal } = useApp();
  const eligible = cards.filter((c) => c.status !== "blocked");
  const [reason, setReason] = useState(COMPROMISE_REASONS[0]);

  return (
    <section id="report-card" className="pmc-scroll-mt">
      <SectionHead no="04" title="Report a Compromise" sub="Block a lost or stolen card, sweep suspicious charges into disputes, and issue a replacement — all in one flow." />
      <Reveal>
        <div className="p-4 p-sm-5" style={{ borderRadius: 16, border: "2px solid rgba(240,68,56,0.25)", background: "linear-gradient(to bottom right, rgba(254,228,226,0.4), #fff)", boxShadow: "var(--shadow-pm)" }}>
          <div className="row g-4">
            <div className="col-12 col-lg" style={{ minWidth: 0 }}>
              <div className="d-flex align-items-center pmc-gap-25">
                <span className="pmc-icon-sq d-grid flex-none pmc-tone-danger" style={{ width: 40, height: 40 }}><Icon name="alertTri" size={18} /></span>
                <div>
                  <p className="pmc-display pmc-fs-15 fw-bold pmc-ink mb-0">What happened?</p>
                  <p className="pmc-fs-115 pmc-muted mb-0">Select the closest reason — we'll tailor the containment.</p>
                </div>
              </div>
              <div className="pmc-mt-3 d-flex flex-wrap pmc-gap-2">
                {COMPROMISE_REASONS.map((r) => (
                  <button key={r} type="button" onClick={() => setReason(r)} className={cn("pmc-focus pmc-pill-choice", reason === r && "on-danger")}>{r}</button>
                ))}
              </div>
            </div>
            <div className="col-12 col-lg-auto" style={{ width: 260 }}>
              <div className="d-flex flex-column pmc-gap-2 h-100">
                <div className="pmc-radius p-3" style={{ background: "rgba(255,255,255,0.7)" }}>
                  <p className="pmc-fs-11 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.08em" }}>Cards available to report</p>
                  <p className="pmc-num pmc-display pmc-mt-1 pmc-fs-20 fw-bold pmc-ink mb-0">{eligible.length}</p>
                </div>
                <Btn variant="danger" icon="shield" onClick={() => openModal({ type: "fraudWizard" })}>Start containment</Btn>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 05 · Review suspicious transactions ============ */

export function SuspiciousSection() {
  const { cards, openModal } = useApp();
  const [selected, setSelected] = useState<string[]>(SEED_SUSPICIOUS.filter((s) => s.flagged).map((s) => s.id));
  const byId = (id: string) => cards.find((c) => c.id === id);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const selectedSum = SEED_SUSPICIOUS.filter((s) => selected.includes(s.id)).reduce((sum, s) => sum + s.amount, 0);

  return (
    <section id="suspicious" className="pmc-scroll-mt">
      <SectionHead no="05" title="Review Transactions" sub="Flagged transactions to confirm or clear. Flagged items push to disputes.">
        <Badge tone={selected.length > 0 ? "warning" : "muted"} dot>{selected.length} flagged</Badge>
      </SectionHead>

      <Reveal>
        <div className="pmc-card p-4">
          <ul className="list-unstyled mb-0">
            {SEED_SUSPICIOUS.map((s, i) => {
              const card = byId(s.cardId);
              const on = selected.includes(s.id);
              return (
                <li
                  key={s.id}
                  className={cn("d-flex align-items-center pmc-gap-3 pmc-py-3", on && "pmc-radius-sm")}
                  style={{
                    borderTop: i === 0 ? undefined : "1px solid rgba(230,233,240,0.7)",
                    background: on ? "rgba(255,250,235,0.3)" : undefined,
                    marginLeft: on ? -8 : undefined,
                    marginRight: on ? -8 : undefined,
                    paddingLeft: on ? 8 : undefined,
                    paddingRight: on ? 8 : undefined,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggle(s.id)}
                    aria-label={`Flag ${s.merchant}`}
                    className="pmc-focus d-grid flex-none p-0"
                    style={{ width: 18, height: 18, borderRadius: 4, placeItems: "center", border: `2px solid ${on ? "var(--pmc-danger)" : "#d0d5dd"}`, background: on ? "var(--pmc-danger)" : "transparent", color: on ? "#fff" : "transparent", transition: "all 0.15s ease" }}
                  >
                    <Icon name="check" size={11} strokeWidth={3} />
                  </button>
                  <span className="pmc-icon-sq d-grid flex-none pmc-tone-muted"><Icon name="globe" size={15} /></span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="text-truncate pmc-fs-13 fw-bold pmc-ink mb-0">{s.merchant}</p>
                    <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{card?.nickname} •• {card?.last4} · {s.time}</p>
                  </div>
                  <Badge tone={s.flagged ? "danger" : "muted"} dot>{s.reason}</Badge>
                  <p className="pmc-num d-none d-sm-block pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">{kes(s.amount)}</p>
                </li>
              );
            })}
          </ul>
          <div className="pmc-mt-3 d-flex flex-wrap align-items-center justify-content-between pmc-gap-2" style={{ borderTop: "1px solid rgba(230,233,240,0.7)", paddingTop: 12 }}>
            <p className="pmc-num pmc-fs-12 fw-bold pmc-muted mb-0">{selected.length} selected · <span className="pmc-ink">{kes(selectedSum)}</span></p>
            <div className="d-flex pmc-gap-2">
              <Btn size="sm" variant="outline" onClick={() => setSelected([])}>Clear</Btn>
              <Btn size="sm" variant="dangerGhost" icon="flag" disabled={selected.length === 0} onClick={() => openModal({ type: "fraudWizard" })}>File disputes</Btn>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 06 · Audit log ============ */

export function AuditLogSection() {
  const { audit, toast } = useApp();
  return (
    <section id="audit-log" className="pmc-scroll-mt">
      <SectionHead no="06" title="Audit Log" sub="An immutable record of every security-relevant action and automated decision.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Audit log exported", `${audit.length} entries written to security-audit.csv`)}>Export</Btn>
      </SectionHead>

      <Reveal>
        <div className="pmc-table-frame">
          <div className="d-none d-md-block">
            <table className="pmc-table w-100 text-start">
              <thead>
                <tr>
                  <th className="pmc-px-4 pmc-py-25">Time</th>
                  <th className="pmc-px-3 pmc-py-25">Actor</th>
                  <th className="pmc-px-3 pmc-py-25">Action</th>
                  <th className="pmc-px-3 pmc-py-25">Target</th>
                  <th className="pmc-px-4 pmc-py-25 text-end">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.id}>
                    <td className="pmc-num pmc-px-4 pmc-py-3 fw-bold pmc-muted">{a.time}</td>
                    <td className="pmc-px-3 pmc-py-3 fw-bold pmc-ink">{a.actor}</td>
                    <td className="pmc-px-3 pmc-py-3 fw-semibold pmc-muted">{a.action}</td>
                    <td className="pmc-px-3 pmc-py-3 fw-semibold pmc-muted">{a.target}</td>
                    <td className="pmc-px-4 pmc-py-3 text-end"><Badge tone={outcomeTone(a.outcome)} dot className="text-capitalize">{a.outcome}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="pmc-mobile-list d-md-none">
            {audit.map((a) => (
              <li key={a.id}>
                <div className="w-100">
                  <div className="d-flex align-items-center pmc-gap-25">
                    <span className="pmc-num pmc-fs-11 fw-bold pmc-faint">{a.time}</span>
                    <p className="flex-grow-1 text-truncate pmc-fs-125 fw-bold pmc-ink mb-0" style={{ minWidth: 0 }}>{a.action}</p>
                    <Badge tone={outcomeTone(a.outcome)} dot className="text-capitalize">{a.outcome}</Badge>
                  </div>
                  <p className="pmc-mt-05 pmc-fs-105 fw-semibold pmc-faint mb-0">{a.actor} · {a.target}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center justify-content-between px-4 pmc-py-25" style={{ borderTop: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.6)" }}>
            <p className="pmc-fs-115 fw-bold pmc-muted mb-0">{audit.length} entries · last 24h</p>
            <p className="d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-semibold pmc-faint mb-0"><span className="pmc-live-dot" /> Logging in real time</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============================================================
   Modals
   ============================================================ */

/* ============ Compromised card wizard (original 5.7 flow) ============ */

export function FraudWizardModal() {
  const { modal, closeModal, cards, txns, blockAndReplace } = useApp();
  const open = modal?.type === "fraudWizard";
  const presetId = modal?.type === "fraudWizard" ? modal.cardId : undefined;

  const [step, setStep] = useState(1);
  const [cardId, setCardId] = useState("c1");
  const [selected, setSelected] = useState<string[]>([]);
  const [pin, setPin] = useState("");
  const [done, setDone] = useState(false);

  const eligible = cards.filter((c) => c.status !== "blocked");
  const suspicious = txns.filter((t) => t.flagged || (t.intl && t.channel === "Online" && t.status === "Cleared")).slice(0, 4);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setCardId(presetId ?? eligible[0]?.id ?? "c1");
    setSelected(txns.filter((t) => t.flagged).map((t) => t.id));
    setPin("");
    setDone(false);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;
  const card = cards.find((c) => c.id === cardId);
  const toggleTxn = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const confirm = () => {
    if (!card || pin.length !== 4) return;
    blockAndReplace(card.id, selected);
    setDone(true);
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      tone={done ? "default" : "danger"}
      icon={done ? "shieldCheck" : "shield"}
      title={done ? "Card Blocked & Secured" : "Report a compromised card"}
      subtitle={done ? undefined : "Contain the damage in under a minute — block, dispute and replace."}
      width="max-w-xl"
      footer={
        done ? (
          <Btn icon="check" onClick={closeModal}>Back to Security</Btn>
        ) : step < 3 ? (
          <>
            <Btn variant="outline" onClick={step === 1 ? closeModal : () => setStep(step - 1)}>{step === 1 ? "Cancel" : "Back"}</Btn>
            <Btn icon="arrowRight" disabled={step === 1 && !card} onClick={() => setStep(step + 1)}>Continue</Btn>
          </>
        ) : (
          <>
            <Btn variant="outline" icon="chevLeft" onClick={() => setStep(2)}>Back</Btn>
            <Btn variant="danger" icon="lock" disabled={pin.length !== 4} onClick={confirm}>Confirm Permanent Block</Btn>
          </>
        )
      }
    >
      {done ? (
        <div className="d-flex flex-column align-items-center pmc-gap-3 py-4 text-center">
          <span className="pmc-done-icon d-grid"><Icon name="checkCircle" size={26} /></span>
          <p className="pmc-fs-13 pmc-muted mb-0" style={{ maxWidth: 340, lineHeight: 1.6 }}>
            Old card cancelled. A new virtual replacement was issued instantly. {selected.length} transaction{selected.length === 1 ? "" : "s"} pushed to disputes.
          </p>
        </div>
      ) : step === 1 ? (
        <div className="d-flex flex-column pmc-gap-2">
          <FieldLabel>Which card is compromised?</FieldLabel>
          {eligible.map((c) => (
            <button key={c.id} type="button" onClick={() => setCardId(c.id)} className={cn("pmc-focus pmc-choice", cardId === c.id && "on-danger")} style={{ padding: 12 }}>
              <span className="d-grid flex-none" style={{ width: 16, height: 16, borderRadius: 99, border: `2px solid ${cardId === c.id ? "var(--pmc-danger)" : "#d0d5dd"}`, placeItems: "center" }}>
                {cardId === c.id && <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--pmc-danger)" }} />}
              </span>
              <span className="flex-grow-1" style={{ minWidth: 0 }}>
                <span className="d-block pmc-fs-13 fw-bold pmc-ink">{c.nickname}</span>
                <span className="d-block pmc-fs-11 fw-semibold pmc-faint">{c.holder.toLowerCase()} · •• {c.last4}</span>
              </span>
              <Badge tone="muted" className="text-capitalize">{c.status}</Badge>
            </button>
          ))}
        </div>
      ) : step === 2 ? (
        <div className="d-flex flex-column pmc-gap-3">
          <FieldLabel hint={`${selected.length} selected`}>Flag unauthorised transactions</FieldLabel>
          <p className="pmc-fs-115 pmc-muted mb-0" style={{ marginTop: -4 }}>Select any transactions you did not make. They will be pushed to disputes automatically.</p>
          <div className="d-flex flex-column pmc-gap-15">
            {suspicious.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTxn(t.id)}
                className="pmc-focus d-flex w-100 align-items-center pmc-gap-25 pmc-radius-sm px-3 pmc-py-25 text-start"
                style={selected.includes(t.id) ? { border: "1px solid var(--pmc-danger)", background: "rgba(254,228,226,0.4)" } : { border: "1px solid var(--pmc-line)", background: "#fff" }}
              >
                <span className="d-grid flex-none border-0" style={{ width: 18, height: 18, borderRadius: 4, placeItems: "center", border: `2px solid ${selected.includes(t.id) ? "var(--pmc-danger)" : "#d0d5dd"}`, background: selected.includes(t.id) ? "var(--pmc-danger)" : "transparent", color: selected.includes(t.id) ? "#fff" : "transparent" }}>
                  <Icon name="check" size={11} strokeWidth={3} />
                </span>
                <span className="flex-grow-1" style={{ minWidth: 0 }}>
                  <span className="d-block text-truncate pmc-fs-125 fw-bold pmc-ink">{t.merchant} {t.intl && <Badge tone="info" className="ms-1">INTL</Badge>}</span>
                  <span className="d-block pmc-fs-105 fw-semibold pmc-faint">{t.date} · {t.time}</span>
                </span>
                <span className="pmc-num pmc-fs-125 fw-bold pmc-ink">{kes(t.amount)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column pmc-gap-4">
          <div className="overflow-hidden pmc-radius" style={{ border: "1px solid var(--pmc-line)" }}>
            {[
              ["Permanent Card Block", card ? `${card.nickname} •• ${card.last4}` : "—", "Will apply"],
              ["Disputes Created", `${selected.length} item${selected.length === 1 ? "" : "s"}`, "Pushed to network"],
              ["Issue Replacement", "Virtual replacement", "Available instantly"],
            ].map(([k, v, note], i) => (
              <div key={k} className="d-flex align-items-center justify-content-between pmc-gap-3 px-4 pmc-py-3" style={{ fontSize: 12.5, background: i % 2 === 0 ? "rgba(242,244,248,0.6)" : "#fff" }}>
                <div><p className="fw-bold pmc-ink mb-0">{k}</p><p className="pmc-fs-11 fw-semibold pmc-muted mb-0">{v}</p></div>
                <Badge tone={i === 0 ? "danger" : "success"}>{note}</Badge>
              </div>
            ))}
          </div>
          <div>
            <FieldLabel>Enter PIN to authorise block</FieldLabel>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="pmc-focus pmc-pin-input danger-focus"
              style={{ letterSpacing: "0.5em" }}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ============ Fraud event investigation modal ============ */

export function FraudEventModal() {
  const { modal, closeModal, fraudEvents, resolveFraudEvent } = useApp();
  const open = modal?.type === "fraudEvent";
  const event = fraudEvents.find((e) => e.id === (modal?.type === "fraudEvent" ? modal.eventId : ""));
  if (!open || !event) return null;
  const m = severityMeta(event.severity);

  return (
    <Modal
      open={open}
      onClose={closeModal}
      tone={event.severity === "critical" ? "danger" : "default"}
      icon={m.icon}
      title={event.title}
      subtitle={event.detail}
      width="max-w-lg"
      footer={
        <>
          <Btn variant="outline" onClick={closeModal}>Close</Btn>
          <Btn icon="check" onClick={() => { resolveFraudEvent(event.id); closeModal(); }}>Mark resolved</Btn>
        </>
      }
    >
      <div className="d-flex flex-column pmc-gap-4">
        <div className="d-flex flex-wrap pmc-gap-2">
          <Badge tone={m.tone} dot>{m.label} severity</Badge>
          <Badge tone="muted">{event.affected} card{event.affected === 1 ? "" : "s"} affected</Badge>
          <Badge tone="muted">{event.time}</Badge>
        </div>
        <div className="pmc-radius pmc-p-35" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}>
          <p className="pmc-fs-11 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.08em" }}>Recommended actions</p>
          <ul className="list-unstyled pmc-mt-2 d-flex flex-column pmc-gap-15 mb-0 pmc-fs-12 fw-semibold pmc-ink-2">
            <li className="d-flex align-items-center pmc-gap-2"><Icon name="check" size={13} className="pmc-green" strokeWidth={2.5} /> Review flagged transactions in this window</li>
            <li className="d-flex align-items-center pmc-gap-2"><Icon name="check" size={13} className="pmc-green" strokeWidth={2.5} /> Consider freezing the affected card</li>
            <li className="d-flex align-items-center pmc-gap-2"><Icon name="check" size={13} className="pmc-green" strokeWidth={2.5} /> Push unrecognised charges to disputes</li>
          </ul>
        </div>
        <p className="pmc-note pmc-note-canvas mb-0">
          Resolving closes the event and logs the action to the audit trail. Unresolved critical events keep the programme risk score elevated.
        </p>
      </div>
    </Modal>
  );
}
