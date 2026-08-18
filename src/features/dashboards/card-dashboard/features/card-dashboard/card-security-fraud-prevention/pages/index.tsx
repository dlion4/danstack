import { useEffect, useState } from "react";
import { cn } from "../../../../lib";
import { Icon, type IconName } from "../../../../components/ui/icons";
import { Badge, Btn, Chip, FieldLabel, Modal, Progress, Reveal, SectionHead, Spark, Toggle, Empty } from "../../../../components/ui";
import { useApp, scrollToId } from "../../../../lib";
import { kes, kesShort, type PmCard, type Txn } from "../../../../lib";
import { CardVisual } from "../../../../components/modals/modalsA";
import {
  COMPROMISE_REASONS,
  RISK_METRICS,
  SEED_SECURITY_RULES,
  SEED_SUSPICIOUS,
  kes,
  kesShort,
} from "../../../../lib";

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
                <span className="rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-[#cfe8db]">Module 5.7</span>
              </div>
              <h1 className="font-display mt-3 text-[26px] font-bold leading-[1.1] tracking-tight sm:text-[34px]">
                Security &amp; Fraud<br className="hidden sm:block" /> Prevention
              </h1>
              <p className="mt-2 max-w-[510px] text-[13px] leading-relaxed text-white/65">
                Live fraud posture, enforceable safeguards, and a one-click compromise workflow that blocks a card,
                files disputes and issues a replacement in under a minute.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn icon="alertTri" onClick={() => openModal({ type: "fraudWizard" })}>Report Compromised Card</Btn>
                <Btn variant="ghost" icon="shield" onClick={() => document.getElementById("safeguards")?.scrollIntoView({ behavior: "smooth" })}>Safeguards</Btn>
                <Btn variant="ghost" icon="gauge" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { k: "Risk score", v: `${risk.score}/100`, warn: false },
                  { k: "Attempts blocked", v: String(risk.attemptsBlocked) },
                  { k: "Value protected", v: kesShort(risk.valueProtected) },
                  { k: "Open fraud events", v: String(activeFraud.length), warn: activeFraud.length > 0 },
                ].map((s) => (
                  <div key={s.k} className="leading-tight">
                    <p className={cn("font-display num text-[17px] font-bold", s.warn ? "text-[#ffd27d]" : "text-white")}>{s.v}</p>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/45">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* risk gauge */}
            <div className="relative hidden h-[230px] w-[230px] flex-none md:grid place-items-center">
              <svg viewBox="0 0 120 120" className="h-[200px] w-[200px] -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="#12b76a" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(risk.score / 100) * 326.7} 326.7`} />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="font-display text-[34px] font-bold leading-none">{risk.score}</p>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#cfe8db]">{risk.label}</p>
                  <p className="mt-1 text-[9.5px] text-white/45">of 100 risk points</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: "shield" as IconName, tone: "bg-pmgreen-soft text-[#067647]", label: "Attempts Blocked · 30d", value: String(risk.attemptsBlocked), note: "Pre-empted by policy rules", spark: [6, 8, 9, 12, 11, 14, 16, 18], stroke: "#12b76a" },
          { icon: "flag" as IconName, tone: "bg-warn-soft text-[#93370d]", label: "Open Disputes", value: String(risk.disputesOpen), note: "Resolve in 7–14 days", spark: [1, 2, 1, 2, 2, 1, 2, 2], stroke: "#f79009", action: () => document.getElementById("suspicious")?.scrollIntoView({ behavior: "smooth" }) },
          { icon: "snow" as IconName, tone: "bg-pmblue-soft text-[#175cd3]", label: "Frozen Cards", value: String(frozen), note: "Protective freezes in effect", spark: [1, 1, 2, 1, 1, 2, 2, 2], stroke: "#2e90fa" },
          { icon: "bell" as IconName, tone: "bg-pmviolet-soft text-[#5925dc]", label: "Alerts · 30d", value: String(risk.alerts30d), note: "Across push, SMS & email", spark: [14, 16, 18, 20, 19, 22, 24, 26], stroke: "#7a5af8" },
        ].map((k, i) => (
          <Reveal key={k.label} delay={i * 70}>
            <button onClick={k.action} className={cn("group w-full rounded-2xl border border-line bg-white p-4 text-left shadow-pm transition-all duration-200", k.action ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-pm-lg" : "cursor-default")}>
              <div className="flex items-start justify-between">
                <span className={cn("grid h-[42px] w-[42px] place-items-center rounded-xl", k.tone)}><Icon name={k.icon} size={19} /></span>
                <Spark points={k.spark} stroke={k.stroke} />
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.07em] text-muted">{k.label}</p>
              <p className="num font-display mt-0.5 text-[22px] font-bold leading-none tracking-tight text-ink">{k.value}</p>
              <p className="mt-2 text-[11px] font-semibold text-faint">{k.note}</p>
            </button>
          </Reveal>
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
    <section id="fraud-events" className="scroll-mt-24">
      <SectionHead  title="Fraud Events" sub="Detected anomalies across the programme, ranked by severity.">
        <Chip on={showResolved} onClick={() => setShowResolved((v) => !v)}>Include resolved</Chip>
      </SectionHead>

      {shown.length === 0 ? (
        <Empty icon="shieldCheck" title="No fraud events" sub="Your programme is clean. Detected anomalies will appear here." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {shown.map((e, i) => {
            const m = severityMeta(e.severity);
            return (
              <Reveal key={e.id} delay={(i % 2) * 70}>
                <div className={cn("rounded-2xl border bg-white p-4 shadow-pm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pm-lg", e.resolved ? "border-line" : "border-[#fecaca]", e.severity === "critical" && !e.resolved && "ring-1 ring-danger/30")}>
                  <div className="flex items-start gap-3">
                    <span className={cn("grid h-10 w-10 flex-none place-items-center rounded-xl", m.tone === "danger" ? "bg-danger-soft text-[#b42318]" : m.tone === "warning" ? "bg-warn-soft text-[#93370d]" : m.tone === "info" ? "bg-pmblue-soft text-[#175cd3]" : "bg-canvas text-muted")}>
                      <Icon name={m.icon} size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13.5px] font-bold text-ink">{e.title}</p>
                        <Badge tone={m.tone} dot>{m.label}</Badge>
                        {e.resolved && <Badge tone="muted">Resolved</Badge>}
                      </div>
                      <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{e.detail}</p>
                      <p className="mt-1.5 text-[10.5px] font-semibold text-faint">{e.time} · {e.affected} card{e.affected === 1 ? "" : "s"} affected</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-line/70 pt-3">
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
            );
          })}
        </div>
      )}

      <Reveal delay={80}>
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-warn/35 bg-warn-soft/40 p-4">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-warn/15 text-[#93370d]"><Icon name="alertTri" size={18} /></span>
          <p className="min-w-0 flex-1 text-[12.5px] font-semibold leading-relaxed text-[#93370d]">
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
    <section id="safeguards" className="scroll-mt-24">
      <SectionHead  title="Safeguards & Rules" sub="Standing rules enforced at the point of authorisation across Visa and Mastercard.">
        <Badge tone="success" dot>{rules.filter((r) => r.enabled).length} of {rules.length} active</Badge>
      </SectionHead>

      <Reveal>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
          <ul className="grid gap-2 md:grid-cols-2">
            {rules.map((r) => (
              <li key={r.id} className={cn("flex flex-wrap items-center gap-3 rounded-xl border p-3 transition", r.enabled ? "border-pmgreen/40 bg-pmgreen-soft/35" : "border-line bg-canvas/40")}>
                <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", r.enabled ? "bg-white text-[#067647] shadow-sm" : "bg-white text-faint")}>
                  <Icon name={r.icon} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-ink">{r.title}</p>
                  <p className="text-[11px] leading-snug text-muted">{r.desc}</p>
                </div>
                <Badge tone={r.enabled ? "success" : "muted"} dot>{r.enabled ? "On" : "Off"}</Badge>
                <Toggle on={r.enabled} label={r.title} onChange={() => toggle(r.id)} />
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-canvas/80 px-3 py-2 text-[11.5px] font-semibold leading-relaxed text-muted">
            <Icon name="info" size={13} className="mt-0.5 flex-none text-pmblue" />
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
    <section id="report-card" className="scroll-mt-24">
      <SectionHead  title="Report a Compromise" sub="Block a lost or stolen card, sweep suspicious charges into disputes, and issue a replacement — all in one flow." />
      <Reveal>
        <div className="rounded-2xl border-2 border-danger/25 bg-gradient-to-br from-danger-soft/40 to-white p-5 shadow-pm">
          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-danger-soft text-[#b42318]"><Icon name="alertTri" size={18} /></span>
                <div>
                  <p className="font-display text-[15px] font-bold text-ink">What happened?</p>
                  <p className="text-[11.5px] text-muted">Select the closest reason — we'll tailor the containment.</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {COMPROMISE_REASONS.map((r) => (
                  <button key={r} onClick={() => setReason(r)} className={cn("rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition", reason === r ? "border-danger bg-danger-soft text-[#b42318]" : "border-line bg-white text-muted hover:border-[#c4c9d4]")}>{r}</button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="rounded-xl bg-white/70 p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-faint">Cards available to report</p>
                <p className="num mt-1 font-display text-[20px] font-bold text-ink">{eligible.length}</p>
              </div>
              <Btn variant="danger" icon="shield" onClick={() => openModal({ type: "fraudWizard" })}>Start containment</Btn>
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
    <section id="suspicious" className="scroll-mt-24">
      <SectionHead  title="Review Transactions" sub="Flagged transactions to confirm or clear. Flagged items push to disputes.">
        <Badge tone={selected.length > 0 ? "warning" : "muted"} dot>{selected.length} flagged</Badge>
      </SectionHead>

      <Reveal>
        <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
          <ul className="divide-y divide-line/70">
            {SEED_SUSPICIOUS.map((s) => {
              const card = byId(s.cardId);
              const on = selected.includes(s.id);
              return (
                <li key={s.id} className={cn("flex items-center gap-3 py-3", on && "rounded-lg bg-warn-soft/30 -mx-2 px-2")}>
                  <button onClick={() => toggle(s.id)} className={cn("grid h-[18px] w-[18px] flex-none place-items-center rounded border-2 transition", on ? "border-danger bg-danger text-white" : "border-[#d0d5dd] text-transparent")}>
                    <Icon name="check" size={11} strokeWidth={3} />
                  </button>
                  <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-canvas text-muted"><Icon name="globe" size={15} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-ink">{s.merchant}</p>
                    <p className="text-[10.5px] font-semibold text-faint">{card?.nickname} •• {card?.last4} · {s.time}</p>
                  </div>
                  <Badge tone={s.flagged ? "danger" : "muted"} dot>{s.reason}</Badge>
                  <p className="num hidden font-display text-[13.5px] font-bold text-ink sm:block">{kes(s.amount)}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3">
            <p className="num text-[12px] font-bold text-muted">{selected.length} selected · <span className="text-ink">{kes(selectedSum)}</span></p>
            <div className="flex gap-2">
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
    <section id="audit-log" className="scroll-mt-24">
      <SectionHead  title="Audit Log" sub="An immutable record of every security-relevant action and automated decision.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Audit log exported", `${audit.length} entries written to security-audit.csv`)}>Export</Btn>
      </SectionHead>

      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-canvas/70 text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint">
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-3 py-2.5">Actor</th>
                  <th className="px-3 py-2.5">Action</th>
                  <th className="px-3 py-2.5">Target</th>
                  <th className="px-4 py-2.5 text-right">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {audit.map((a) => (
                  <tr key={a.id} className="text-[12.5px] transition hover:bg-canvas/60">
                    <td className="num px-4 py-3 font-bold text-muted">{a.time}</td>
                    <td className="px-3 py-3 font-bold text-ink">{a.actor}</td>
                    <td className="px-3 py-3 font-semibold text-muted">{a.action}</td>
                    <td className="px-3 py-3 font-semibold text-muted">{a.target}</td>
                    <td className="px-4 py-3 text-right"><Badge tone={outcomeTone(a.outcome)} dot className="capitalize">{a.outcome}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-line/70 md:hidden">
            {audit.map((a) => (
              <li key={a.id} className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="num text-[11px] font-bold text-faint">{a.time}</span>
                  <p className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-ink">{a.action}</p>
                  <Badge tone={outcomeTone(a.outcome)} dot className="capitalize">{a.outcome}</Badge>
                </div>
                <p className="mt-0.5 text-[10.5px] font-semibold text-faint">{a.actor} · {a.target}</p>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-line bg-canvas/60 px-4 py-2.5">
            <p className="text-[11.5px] font-bold text-muted">{audit.length} entries · last 24h</p>
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-faint"><span className="live-dot" /> Logging in real time</p>
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
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-pmgreen-soft text-[#067647]"><Icon name="checkCircle" size={26} /></span>
          <p className="max-w-[340px] text-[13px] leading-relaxed text-muted">
            Old card cancelled. A new virtual replacement was issued instantly. {selected.length} transaction{selected.length === 1 ? "" : "s"} pushed to disputes.
          </p>
        </div>
      ) : step === 1 ? (
        <div className="space-y-2">
          <FieldLabel>Which card is compromised?</FieldLabel>
          {eligible.map((c) => (
            <button key={c.id} onClick={() => setCardId(c.id)} className={cn("flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition", cardId === c.id ? "border-danger bg-danger-soft/40" : "border-line bg-white hover:border-[#c4c9d4]")}>
              <span className={cn("grid h-4 w-4 flex-none place-items-center rounded-full border-2", cardId === c.id ? "border-danger" : "border-[#d0d5dd]")}>{cardId === c.id && <span className="h-2 w-2 rounded-full bg-danger" />}</span>
              <span className="min-w-0 flex-1"><span className="block text-[13px] font-bold text-ink">{c.nickname}</span><span className="block text-[11px] font-semibold text-faint">{c.holder.toLowerCase()} · •• {c.last4}</span></span>
              <Badge tone="muted" className="capitalize">{c.status}</Badge>
            </button>
          ))}
        </div>
      ) : step === 2 ? (
        <div className="space-y-3">
          <FieldLabel hint={`${selected.length} selected`}>Flag unauthorised transactions</FieldLabel>
          <p className="-mt-1 text-[11.5px] text-muted">Select any transactions you did not make. They will be pushed to disputes automatically.</p>
          <div className="space-y-1.5">
            {suspicious.map((t) => (
              <button key={t.id} onClick={() => toggleTxn(t.id)} className={cn("flex w-full items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition", selected.includes(t.id) ? "border-danger bg-danger-soft/40" : "border-line bg-white hover:border-[#c4c9d4]")}>
                <span className={cn("grid h-[18px] w-[18px] flex-none place-items-center rounded border-2", selected.includes(t.id) ? "border-danger bg-danger text-white" : "border-[#d0d5dd] text-transparent")}><Icon name="check" size={11} strokeWidth={3} /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[12.5px] font-bold text-ink">{t.merchant} {t.intl && <Badge tone="info" className="ml-1">INTL</Badge>}</span><span className="block text-[10.5px] font-semibold text-faint">{t.date} · {t.time}</span></span>
                <span className="num text-[12.5px] font-bold text-ink">{kes(t.amount)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-line">
            {[
              ["Permanent Card Block", card ? `${card.nickname} •• ${card.last4}` : "—", "Will apply"],
              ["Disputes Created", `${selected.length} item${selected.length === 1 ? "" : "s"}`, "Pushed to network"],
              ["Issue Replacement", "Virtual replacement", "Available instantly"],
            ].map(([k, v, note], i) => (
              <div key={k} className={cn("flex items-center justify-between gap-3 px-4 py-3 text-[12.5px]", i % 2 === 0 ? "bg-canvas/60" : "bg-white")}>
                <div><p className="font-bold text-ink">{k}</p><p className="text-[11px] font-semibold text-muted">{v}</p></div>
                <Badge tone={i === 0 ? "danger" : "success"}>{note}</Badge>
              </div>
            ))}
          </div>
          <div>
            <FieldLabel>Enter PIN to authorise block</FieldLabel>
            <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••" className="focus-ring num w-full rounded-[10px] border-2 border-line bg-canvas/50 px-3.5 py-2.5 text-center font-display text-xl font-bold tracking-[0.5em] text-ink outline-none transition focus:border-danger focus:bg-white" />
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
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge tone={m.tone} dot>{m.label} severity</Badge>
          <Badge tone="muted">{event.affected} card{event.affected === 1 ? "" : "s"} affected</Badge>
          <Badge tone="muted">{event.time}</Badge>
        </div>
        <div className="rounded-xl border border-line bg-canvas/50 p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-faint">Recommended actions</p>
          <ul className="mt-2 space-y-1.5 text-[12px] font-semibold text-ink-2">
            <li className="flex items-center gap-2"><Icon name="check" size={13} className="text-pmgreen" strokeWidth={2.5} /> Review flagged transactions in this window</li>
            <li className="flex items-center gap-2"><Icon name="check" size={13} className="text-pmgreen" strokeWidth={2.5} /> Consider freezing the affected card</li>
            <li className="flex items-center gap-2"><Icon name="check" size={13} className="text-pmgreen" strokeWidth={2.5} /> Push unrecognised charges to disputes</li>
          </ul>
        </div>
        <p className="rounded-lg bg-canvas/80 px-3 py-2 text-[11.5px] leading-relaxed text-muted">
          Resolving closes the event and logs the action to the audit trail. Unresolved critical events keep the programme risk score elevated.
        </p>
      </div>
    </Modal>
  );
}
