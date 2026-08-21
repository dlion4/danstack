/* ============================================================================
 * Card Dashboard — shared modals A (Bootstrap 5 edition)
 * ----------------------------------------------------------------------------
 * CardVisual (the plastic card render used by many pages), alert preferences,
 * freeze flows, PIN request, limits and the card detail drawer. Behavior and
 * copy are identical to the Tailwind original; markup uses Bootstrap utilities
 * + scoped .pmc-* classes.
 * ========================================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "./utils/cn";
import { Icon, NetworkMark } from "./icons";
import { Badge, Btn, Drawer, FieldLabel, Modal, Progress, Toggle } from "./ui";
import { useApp } from "./store";
import { kes, type AlertPrefs, type PmCard } from "./data";

/* ============ shared: card plastic visual ============ */

export function CardVisual({ card, small }: { card: PmCard; small?: boolean }) {
  return (
    <div
      className={cn("pmc-card-visual pmc-card-sheen", small ? "pmc-p-35" : "pmc-p-4 pmc-sm-p-5")}
      style={{ background: card.gradient, filter: card.status === "frozen" ? "saturate(0.35)" : undefined }}
    >
      <div className="pmc-hero-dots position-absolute top-0 start-0 w-100 h-100" />
      <div className="position-relative d-flex h-100 flex-column justify-content-between">
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <p className={cn("pmc-display fw-bold pmc-ls-tight mb-0", small ? "pmc-fs-11" : "pmc-fs-135")}>PayMo</p>
            <p
              className={cn("fw-semibold text-uppercase mb-0", small ? "pmc-fs-9" : "pmc-fs-9")}
              style={{ letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)" }}
            >
              {card.tier === "premium" ? "Premium Travel" : card.tier === "corporate" ? "Corporate" : card.tier === "credit" ? "Credit" : card.tier === "prepaid" ? "Prepaid" : card.kind === "virtual" ? "Virtual Debit" : "Debit"}
            </p>
          </div>
          <span className="d-flex align-items-center pmc-gap-15">
            {card.channels.contactless && <Icon name="wave" size={small ? 13 : 16} style={{ color: "rgba(255,255,255,0.8)" }} />}
            <NetworkMark network={card.network} />
          </span>
        </div>
        <div>
          <p
            className={cn("pmc-display fw-semibold mb-0", small ? "pmc-fs-12" : "pmc-fs-sm-165")}
            style={{ letterSpacing: "0.08em", color: "rgba(255,255,255,0.95)" }}
          >
            {card.panMask}
          </p>
          <div className="pmc-mt-15 d-flex align-items-end justify-content-between">
            <div className={cn("lh-sm", small ? "pmc-fs-9" : "pmc-fs-10")}>
              <p className="fw-semibold text-uppercase mb-0" style={{ letterSpacing: "0.05em", color: "rgba(255,255,255,0.55)" }}>Card Holder</p>
              <p className="fw-bold mb-0" style={{ letterSpacing: "0.025em", color: "rgba(255,255,255,0.95)" }}>{card.holder}</p>
            </div>
            <div className={cn("text-end lh-sm", small ? "pmc-fs-9" : "pmc-fs-10")}>
              <p className="fw-semibold text-uppercase mb-0" style={{ letterSpacing: "0.05em", color: "rgba(255,255,255,0.55)" }}>Expires</p>
              <p className="fw-bold mb-0" style={{ color: "rgba(255,255,255,0.95)" }}>{card.expiry}</p>
            </div>
          </div>
        </div>
      </div>
      {card.status === "frozen" && (
        <span
          className="position-absolute d-inline-flex align-items-center pmc-gap-1 rounded-2 pmc-px-2 pmc-py-1 pmc-fs-10 fw-bold"
          style={{ right: 12, top: 12, background: "rgba(11,19,34,0.7)", color: "#a5d8ff", backdropFilter: "blur(4px)" }}
        >
          <Icon name="snow" size={11} /> FROZEN
        </span>
      )}
      {card.status === "blocked" && (
        <span
          className="position-absolute d-inline-flex align-items-center pmc-gap-1 rounded-2 pmc-px-2 pmc-py-1 pmc-fs-10 fw-bold"
          style={{ right: 12, top: 12, background: "rgba(11,19,34,0.7)", color: "#fda29b", backdropFilter: "blur(4px)" }}
        >
          <Icon name="lock" size={11} /> BLOCKED
        </span>
      )}
    </div>
  );
}

/* ============ Configure Alerts modal (original 5.1 flow) ============ */

function RuleRow({
  icon,
  title,
  desc,
  on,
  onChange,
  disabled,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  title: string;
  desc: string;
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn("d-flex align-items-center pmc-gap-3 pmc-radius pmc-px-35 pmc-py-3", disabled && "opacity-50")}
      style={{
        border: `1px solid ${on ? "rgba(18,183,106,0.4)" : "var(--pmc-line)"}`,
        background: on ? "rgba(231,248,239,0.4)" : "#fff",
        transition: "border-color 0.15s ease, background 0.15s ease",
      }}
    >
      <span className={cn("pmc-icon-sq d-grid", on ? "pmc-tone-green" : "pmc-tone-muted")}>
        <Icon name={icon} size={16} />
      </span>
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <p className="pmc-fs-13 fw-bold pmc-ink mb-0">{title}</p>
        <p className="pmc-fs-115 lh-sm pmc-muted mb-0">{desc}</p>
      </div>
      <Toggle on={on} onChange={onChange} disabled={disabled} label={title} />
    </div>
  );
}

function ChannelCheck({
  icon,
  title,
  sub,
  on,
  onToggle,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  title: string;
  sub: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn("pmc-choice pmc-focus", on && "on")}
      style={{ alignItems: "center", padding: 12 }}
    >
      <span className={cn("pmc-check-box", on && "on")}>
        <Icon name="check" size={12} />
      </span>
      <span className={cn("pmc-icon-sq-sm d-grid", on ? "pmc-tone-green" : "pmc-tone-muted")} style={on ? { background: "#fff" } : undefined}>
        <Icon name={icon} size={15} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span className="d-block pmc-fs-125 fw-bold pmc-ink">{title}</span>
        <span className="d-block pmc-truncate pmc-fs-105 fw-semibold pmc-faint">{sub}</span>
      </span>
    </button>
  );
}

export function ConfigureAlertsModal() {
  const { modal, closeModal, alerts, saveAlerts, cards } = useApp();
  const open = modal?.type === "alerts";
  const presetCard = modal?.type === "alerts" ? modal.cardId : undefined;

  const [p, setP] = useState<AlertPrefs>(alerts);
  const [err, setErr] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    if (open) {
      setP({ ...alerts, scope: presetCard ?? alerts.scope });
      setErr(null);
    }
  }, [open, alerts, presetCard]);

  if (!open) return null;
  const set = (patch: Partial<AlertPrefs>) => setP((prev) => ({ ...prev, ...patch }));

  const activeCard = cards.find((c) => c.id === p.scope);
  const save = () => {
    if (p.largeEnabled && (p.threshold < 100 || p.threshold > 500000)) {
      setErr("Threshold must be between KES 100 and KES 500,000.");
      setShakeKey((k) => k + 1);
      return;
    }
    if (!p.push && !p.sms && !p.email) {
      setErr("Pick at least one delivery channel, otherwise alerts can't reach you.");
      setShakeKey((k) => k + 1);
      return;
    }
    saveAlerts(p);
    closeModal();
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="bell"
      title="Configure Transaction Alerts"
      subtitle="Choose which card events trigger a notification and where we deliver it."
      width="max-w-2xl"
      footer={
        <>
          <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
          <Btn icon="check" onClick={save}>Save Changes</Btn>
        </>
      }
    >
      <div className="d-flex flex-column pmc-gap-5">
        {/* Scope */}
        <div>
          <FieldLabel hint="Applies instantly">Alert scope</FieldLabel>
          <div className="pmc-thin-scroll d-flex pmc-gap-2 overflow-auto pb-1">
            <button
              type="button"
              onClick={() => set({ scope: "all" })}
              className="pmc-rect-choice pmc-focus flex-none"
              style={p.scope === "all" ? { borderColor: "var(--pmc-ink)", background: "var(--pmc-ink)", color: "#fff" } : undefined}
            >
              All cards · {cards.length}
            </button>
            {cards.filter((c) => c.status !== "blocked").map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => set({ scope: c.id })}
                className={cn("pmc-rect-choice pmc-focus flex-none", p.scope === c.id && "on")}
              >
                {c.nickname} ·• {c.last4}
              </button>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="d-flex flex-column pmc-gap-2">
          <FieldLabel>What should trigger an alert?</FieldLabel>
          <RuleRow
            icon="zap"
            title="Notify on all transactions"
            desc="Every authorisation, any amount. High volume — great for frozen-card monitoring."
            on={p.allTxns}
            onChange={(v) => set({ allTxns: v })}
          />
          <div className={cn(!p.allTxns ? "" : "pe-none opacity-60")}>
            <div key={shakeKey} className={cn("pmc-card pmc-p-35", shakeKey > 0 && "pmc-shake")}>
              <div className="d-flex align-items-center pmc-gap-3">
                <span className={cn("pmc-icon-sq d-grid", p.largeEnabled ? "pmc-tone-warn" : "pmc-tone-muted")}>
                  <Icon name="gauge" size={16} />
                </span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <p className="pmc-fs-13 fw-bold pmc-ink mb-0">Large Transaction Alert Threshold</p>
                  <p className="pmc-fs-115 pmc-muted mb-0">Only alert when a single transaction exceeds the amount below.</p>
                </div>
                <Toggle on={p.largeEnabled} onChange={(v) => set({ largeEnabled: v })} label="Large transaction threshold" />
              </div>
              {p.largeEnabled && (
                <div className="pmc-mt-3 pt-3" style={{ borderTop: "1px dashed var(--pmc-line)" }}>
                  <div className="d-flex flex-wrap align-items-center pmc-gap-2">
                    <div className="position-relative">
                      <span className="position-absolute pmc-fs-11 fw-bold pmc-faint" style={{ left: 12, top: "50%", transform: "translateY(-50%)" }}>KES</span>
                      <input
                        type="number"
                        min={100}
                        max={500000}
                        step={500}
                        value={p.threshold}
                        onChange={(e) => set({ threshold: Number(e.target.value) })}
                        className="pmc-focus pmc-num rounded-3 pmc-py-2 pmc-fs-13 fw-bold pmc-ink"
                        style={{ width: 130, paddingLeft: 44, paddingRight: 12, border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.6)", outline: "none" }}
                      />
                    </div>
                    {[5000, 10000, 25000, 50000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => set({ threshold: v })}
                        className={cn("pmc-pill-choice pmc-focus", p.threshold === v && "on")}
                      >
                        {v / 1000}k
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={100000}
                    step={500}
                    value={Math.min(100000, p.threshold)}
                    onChange={(e) => set({ threshold: Number(e.target.value) })}
                    className="pmc-mt-3 w-100"
                    aria-label="Large transaction threshold"
                  />
                  <div className="pmc-mt-1 d-flex justify-content-between pmc-fs-10 fw-semibold pmc-faint">
                    <span>KES 500</span>
                    <span>KES 100,000+</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <RuleRow
            icon="globe"
            title="Notify on international transactions"
            desc="Any authorisation outside Kenya, incl. USD/GBP/EUR online merchants."
            on={p.international}
            onChange={(v) => set({ international: v })}
          />
          <RuleRow
            icon="x"
            title="Notify on declined transactions"
            desc="Insufficient funds, limit breaches or bank-blocked attempts."
            on={p.declined}
            onChange={(v) => set({ declined: v })}
          />
          <RuleRow
            icon="globe"
            title="Notify on Card-Not-Present (Online) usage"
            desc="Every online / in-app purchase where the physical card isn't tapped."
            on={p.cnp}
            onChange={(v) => set({ cnp: v })}
          />
        </div>

        {/* Channels */}
        <div>
          <FieldLabel hint="Multi-channel recommended">Delivery Channels</FieldLabel>
          <div className="row g-2">
            <div className="col-12 col-sm-4">
              <ChannelCheck icon="phone" title="App Push" sub="This device · iPhone 15 Pro" on={p.push} onToggle={() => set({ push: !p.push })} />
            </div>
            <div className="col-12 col-sm-4">
              <ChannelCheck icon="sms" title="SMS" sub="+254 7•• ••• 213" on={p.sms} onToggle={() => set({ sms: !p.sms })} />
            </div>
            <div className="col-12 col-sm-4">
              <ChannelCheck icon="mail" title="Email" sub="d•••@acmetraders.co.ke" on={p.email} onToggle={() => set({ email: !p.email })} />
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="pmc-radius pmc-p-35" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.7)" }}>
          <p className="pmc-mb-2 d-flex align-items-center pmc-gap-15 pmc-kicker pmc-faint">
            <Icon name="eye" size={12} /> Live preview · lock screen
          </p>
          <div className="mx-auto pmc-radius p-3 text-white" style={{ maxWidth: 340, background: "#0b1322", boxShadow: "var(--pmc-shadow)" }}>
            <div className="d-flex align-items-start pmc-gap-25 rounded-2 pmc-p-25" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)" }}>
              <span className="pmc-mt-05 d-grid flex-none" style={{ width: 28, height: 28, borderRadius: 7, background: "var(--pmc-green)", placeItems: "center" }}>
                <span className="pmc-display pmc-fs-11 fw-bold">P</span>
              </span>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div className="d-flex align-items-center justify-content-between">
                  <p className="pmc-fs-11 fw-bold mb-0">PayMo</p>
                  <p className="pmc-fs-95 mb-0" style={{ color: "rgba(255,255,255,0.5)" }}>now</p>
                </div>
                <p className="pmc-mt-05 pmc-fs-11 lh-sm mb-0" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {p.allTxns
                    ? `Transaction of KES 1,240 at Quickmart on ${activeCard ? activeCard.nickname : "card"} •• ${activeCard?.last4 ?? "8821"}.`
                    : p.largeEnabled
                      ? `Large transaction of ${kes(p.threshold)} at Kenya Airways on ${activeCard ? activeCard.nickname : "card"} •• ${activeCard?.last4 ?? "8821"}.`
                      : "Alerts paused — no rules active for this scope."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {err && (
          <p className="d-flex align-items-center pmc-gap-2 rounded-2 pmc-px-3 pmc-py-2 pmc-fs-12 fw-bold pmc-danger-ink mb-0" style={{ background: "var(--pmc-danger-soft)" }}>
            <Icon name="alertTri" size={14} /> {err}
          </p>
        )}
      </div>
    </Modal>
  );
}

/* ============ Freeze confirm ============ */

export function FreezeModal() {
  const { modal, closeModal, cards, setCardStatus, toast, pushNotif } = useApp();
  const open = modal?.type === "freeze";
  const card = cards.find((c) => c.id === (modal?.type === "freeze" ? modal.cardId : ""));
  if (!open || !card) return null;

  const confirm = () => {
    setCardStatus(card.id, "frozen");
    toast("warn", `${card.nickname} frozen`, "All authorisations will be declined until you unfreeze it.");
    pushNotif({ channel: "push", title: "Card frozen", body: `${card.nickname} •• ${card.last4} was frozen from the Command Center.` });
    closeModal();
  };

  return (
    <Modal
      open={open}
      onClose={closeModal}
      tone="danger"
      icon="snow"
      title={`Freeze ${card.nickname}?`}
      subtitle="Freezing blocks new authorisations instantly. Recurring subscriptions linked to this card will fail."
      footer={
        <>
          <Btn variant="outline" onClick={closeModal}>Keep card active</Btn>
          <Btn variant="danger" icon="snow" onClick={confirm}>Freeze Card</Btn>
        </>
      }
    >
      <div className="d-flex flex-column pmc-gap-3">
        <CardVisual card={card} small />
        <ul className="d-flex flex-column pmc-gap-15 pmc-radius pmc-p-35 pmc-fs-125 fw-semibold pmc-ink-2 mb-0" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.6)", listStyle: "none" }}>
          <li className="d-flex align-items-center pmc-gap-2"><Icon name="check" size={13} className="pmc-danger-ink" /> New purchases, ATM withdrawals & online charges decline</li>
          <li className="d-flex align-items-center pmc-gap-2"><Icon name="check" size={13} className="pmc-danger-ink" /> Refunds and incoming reversals still post normally</li>
          <li className="d-flex align-items-center pmc-gap-2"><Icon name="check" size={13} className="pmc-green-dark" /> Unfreeze anytime — takes effect immediately</li>
        </ul>
      </div>
    </Modal>
  );
}

export function FreezeAllModal() {
  const { modal, closeModal, cards, freezeAll } = useApp();
  const open = modal?.type === "freezeAll";
  const activeCount = cards.filter((c) => c.status === "active").length;
  if (!open) return null;
  return (
    <Modal
      open={open}
      onClose={closeModal}
      tone="danger"
      icon="snow"
      title="Freeze every active card?"
      subtitle={`${activeCount} active card${activeCount === 1 ? "" : "s"} will decline all authorisations immediately. This is the fastest response if a device or wallet is lost.`}
      footer={
        <>
          <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
          <Btn variant="danger" icon="snow" onClick={() => { freezeAll(); closeModal(); }}>
            Freeze {activeCount} Cards
          </Btn>
        </>
      }
    >
      <div className="row g-2">
        {cards.filter((c) => c.status === "active").map((c) => (
          <div key={c.id} className="col-4 col-sm-3">
            <div className="rounded-2 pmc-px-2 pmc-py-2 text-center" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.6)" }}>
              <p className="pmc-truncate pmc-fs-11 fw-bold pmc-ink mb-0">{c.nickname}</p>
              <p className="pmc-fs-10 fw-semibold pmc-faint mb-0">•• {c.last4}</p>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ============ PIN modal ============ */

export function PinModal() {
  const { modal, closeModal, cards, toast } = useApp();
  const open = modal?.type === "pin";
  const card = cards.find((c) => c.id === (modal?.type === "pin" ? modal.cardId : ""));
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [sent, setSent] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setDigits(["", "", "", ""]);
      setSent(false);
    }
  }, [open]);

  if (!open || !card) return null;

  const onDigit = (i: number, v: string) => {
    const val = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => d.map((x, xi) => (xi === i ? val : x)));
    if (val && i < 3) refs.current[i + 1]?.focus();
  };
  const complete = digits.every((d) => d !== "");

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="key"
      title={sent ? "PIN sent securely" : "Request card PIN"}
      subtitle={sent ? undefined : `We'll SMS a one-time PIN view link for ${card.nickname} •• ${card.last4} to +254 7•• ••• 213.`}
      footer={
        sent ? (
          <Btn icon="check" onClick={closeModal}>Done</Btn>
        ) : (
          <>
            <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
            <Btn
              icon="send"
              disabled={!complete}
              onClick={() => {
                setSent(true);
                toast("success", "PIN link sent via SMS", "The link expires in 5 minutes.");
              }}
            >
              Verify & Send
            </Btn>
          </>
        )
      }
    >
      {sent ? (
        <div className="d-flex flex-column align-items-center pmc-gap-3 pmc-py-6 text-center">
          <span className="pmc-done-icon">
            <Icon name="checkCircle" size={26} />
          </span>
          <p className="pmc-display pmc-fs-15 fw-bold pmc-ink mb-0">Check your phone</p>
          <p className="pmc-fs-125 pmc-muted mb-0" style={{ maxWidth: 280, lineHeight: 1.65 }}>
            Enter your business OTP in the PayMo app to reveal the PIN. Never share it — PayMo staff will never ask for it.
          </p>
        </div>
      ) : (
        <div className="pmc-py-2">
          <FieldLabel hint="Any 4 digits for demo">Enter your PayMo PIN</FieldLabel>
          <div className="d-flex justify-content-center pmc-gap-3">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                inputMode="numeric"
                type="password"
                value={d}
                onChange={(e) => onDigit(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus();
                }}
                className="pmc-otp-box pmc-focus"
                aria-label={`PIN digit ${i + 1}`}
              />
            ))}
          </div>
          <p className="pmc-mt-3 d-flex align-items-center justify-content-center pmc-gap-15 text-center pmc-fs-115 fw-semibold pmc-faint">
            <Icon name="lock" size={12} /> Verified over an encrypted channel · never stored
          </p>
        </div>
      )}
    </Modal>
  );
}

/* ============ Limits drawer ============ */

export function LimitsDrawer() {
  const { modal, closeModal, cards, updateLimits, updateChannels, toast } = useApp();
  const open = modal?.type === "limits";
  const card = cards.find((c) => c.id === (modal?.type === "limits" ? modal.cardId : ""));
  const [month, setMonth] = useState(0);
  const [perTxn, setPerTxn] = useState(0);

  useEffect(() => {
    if (open && card) {
      setMonth(card.limitMonth);
      setPerTxn(card.limitPerTxn);
    }
  }, [open, card?.id]);

  if (!open || !card) return null;

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="sliders"
      title={`Limits & controls · ${card.nickname}`}
      subtitle="Changes apply to the next authorisation, usually within seconds."
      width="max-w-xl"
      footer={
        <>
          <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
          <Btn icon="check" onClick={() => { updateLimits(card.id, month, perTxn); closeModal(); }}>Save Limits</Btn>
        </>
      }
    >
      <div className="d-flex flex-column pmc-gap-5">
        <div>
          <div className="pmc-mb-15 d-flex align-items-baseline justify-content-between">
            <FieldLabel>Monthly spending limit</FieldLabel>
            <span className="pmc-num pmc-display pmc-fs-15 fw-bold pmc-ink">{kes(month)}</span>
          </div>
          <input type="range" min={5000} max={500000} step={5000} value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-100" aria-label="Monthly limit" />
          <div className="pmc-mt-2">
            <div className="pmc-mb-1 d-flex justify-content-between pmc-fs-11 fw-semibold pmc-faint">
              <span>Spent this month · {kes(card.spentMonth)}</span>
              <span>{Math.round((card.spentMonth / month) * 100)}%</span>
            </div>
            <Progress value={(card.spentMonth / month) * 100} tone={(card.spentMonth / month) > 0.85 ? "red" : (card.spentMonth / month) > 0.6 ? "amber" : "green"} />
          </div>
        </div>

        <div>
          <div className="pmc-mb-15 d-flex align-items-baseline justify-content-between">
            <FieldLabel>Per-transaction cap</FieldLabel>
            <span className="pmc-num pmc-display pmc-fs-15 fw-bold pmc-ink">{kes(perTxn)}</span>
          </div>
          <input type="range" min={1000} max={200000} step={1000} value={perTxn} onChange={(e) => setPerTxn(Number(e.target.value))} className="w-100" aria-label="Per transaction limit" />
          {perTxn > month && (
            <p className="pmc-mt-2 d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-bold pmc-warn-ink mb-0">
              <Icon name="alertTri" size={13} /> Per-transaction cap is above the monthly limit.
            </p>
          )}
        </div>

        <div>
          <FieldLabel>Payment rails</FieldLabel>
          <div className="row g-2">
            {(
              [
                ["online", "Online payments", "globe"],
                ["contactless", "Contactless / NFC", "wave"],
                ["atm", "ATM withdrawals", "wallet"],
                ["intl", "International use", "send"],
              ] as const
            ).map(([key, label, icon]) => (
              <div key={key} className="col-6">
                <div className="d-flex align-items-center pmc-gap-25 pmc-radius pmc-px-3 pmc-py-25 h-100" style={{ border: "1px solid var(--pmc-line)", background: "#fff" }}>
                  <span className="pmc-icon-sq-sm d-grid pmc-tone-muted"><Icon name={icon} size={15} /></span>
                  <span className="flex-grow-1 pmc-fs-12 fw-bold pmc-ink-2">{label}</span>
                  <Toggle
                    on={card.channels[key]}
                    onChange={(v) => {
                      updateChannels(card.id, { [key]: v });
                      toast("info", `${label} ${v ? "enabled" : "disabled"}`, `${card.nickname} •• ${card.last4}`);
                    }}
                    label={label}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ============ Card detail drawer ============ */

export function CardDrawer() {
  const { drawer, closeDrawer, cards, txns, openModal, setCardStatus, toast, pushNotif } = useApp();
  const open = drawer?.type === "card";
  const card = cards.find((c) => c.id === (drawer?.type === "card" ? drawer.cardId : ""));
  const cardTxns = useMemo(() => txns.filter((t) => t.cardId === card?.id).slice(0, 5), [txns, card?.id]);

  if (!open || !card) return null;

  const statusTone = card.status === "active" ? "success" : card.status === "frozen" ? "info" : card.status === "delivering" ? "warning" : "danger";
  const usage = Math.round((card.spentMonth / card.limitMonth) * 100);

  return (
    <Drawer open={open} onClose={closeDrawer}>
      <div className="d-flex align-items-center justify-content-between pmc-px-5 pmc-py-4" style={{ borderBottom: "1px solid var(--pmc-line)" }}>
        <div>
          <p className="pmc-kicker pmc-faint mb-0">Card detail</p>
          <h3 className="pmc-display pmc-fs-16 fw-bold pmc-ls-tight pmc-ink mb-0">{card.nickname}</h3>
        </div>
        <button type="button" onClick={closeDrawer} aria-label="Close panel" className="pmc-icon-btn pmc-icon-btn-sm pmc-focus">
          <Icon name="x" size={17} />
        </button>
      </div>

      <div className="pmc-thin-scroll flex-grow-1 overflow-auto pmc-px-5 pmc-py-4" style={{ paddingBottom: 112 }}>
        <div className="pmc-card-hover">
          <CardVisual card={card} />
        </div>

        <div className="pmc-mt-3 d-flex flex-wrap align-items-center pmc-gap-2">
          <Badge tone={statusTone} dot className="text-capitalize">{card.status}</Badge>
          <Badge tone="muted">{card.kind === "virtual" ? "Virtual" : "Physical"}</Badge>
          <Badge tone="muted">{card.network}</Badge>
          <Badge tone="violet">Issued {card.issuedOn}</Badge>
        </div>

        {/* Usage */}
        <div className="pmc-card pmc-mt-4 p-4">
          <div className="d-flex align-items-baseline justify-content-between">
            <p className="pmc-fs-11 fw-bold text-uppercase pmc-muted mb-0" style={{ letterSpacing: "0.08em" }}>This month's usage</p>
            <p className="pmc-num pmc-display pmc-fs-15 fw-bold pmc-ink mb-0">{usage}%</p>
          </div>
          <Progress className="pmc-mt-2" value={usage} tone={usage > 85 ? "red" : usage > 60 ? "amber" : "green"} />
          <div className="pmc-mt-2 d-flex justify-content-between pmc-fs-115 fw-semibold pmc-faint">
            <span>{kes(card.spentMonth)} spent</span>
            <span>of {kes(card.limitMonth)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pmc-mt-4 row g-2">
          {card.status === "frozen" ? (
            <div className="col-12">
              <Btn
                icon="zap"
                className="w-100"
                onClick={() => {
                  setCardStatus(card.id, "active");
                  toast("success", `${card.nickname} unfrozen`, "The card is accepting authorisations again.");
                  pushNotif({ channel: "push", title: "Card unfrozen", body: `${card.nickname} •• ${card.last4} is active again.` });
                }}
              >
                Unfreeze Card
              </Btn>
            </div>
          ) : card.status === "active" ? (
            <div className="col-12">
              <Btn variant="dangerGhost" icon="snow" className="w-100" onClick={() => openModal({ type: "freeze", cardId: card.id })}>
                Freeze Card
              </Btn>
            </div>
          ) : null}
          <div className="col-6"><Btn variant="outline" icon="bell" className="w-100" onClick={() => openModal({ type: "alerts", cardId: card.id })}>Alerts</Btn></div>
          <div className="col-6"><Btn variant="outline" icon="sliders" className="w-100" onClick={() => openModal({ type: "limits", cardId: card.id })}>Limits</Btn></div>
          <div className="col-6"><Btn variant="outline" icon="key" className="w-100" onClick={() => openModal({ type: "pin", cardId: card.id })}>View PIN</Btn></div>
          <div className="col-6">
            <Btn
              variant="outline"
              icon="copy"
              className="w-100"
              onClick={() => {
                toast("info", "Card details copied", "PAN, expiry and CVV copied as a secure snippet.");
              }}
            >
              Copy Details
            </Btn>
          </div>
        </div>

        {/* Recent activity */}
        <p className="pmc-kicker pmc-faint mb-0 pmc-mt-5 pmc-mb-2">Recent activity</p>
        {cardTxns.length === 0 ? (
          <div className="pmc-radius p-4 text-center pmc-fs-12 fw-semibold pmc-faint" style={{ border: "1px dashed var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}>
            No transactions on this card yet.
          </div>
        ) : (
          <ul className="pmc-mobile-list pmc-radius" style={{ border: "1px solid var(--pmc-line)", background: "#fff", overflow: "hidden" }}>
            {cardTxns.map((t) => (
              <li key={t.id}>
                <span className="pmc-icon-sq-sm d-grid pmc-tone-muted">
                  <Icon name={t.channel === "Online" ? "globe" : t.channel === "ATM" ? "wallet" : t.channel === "Wallet" ? "phone" : "card"} size={14} />
                </span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <p className="pmc-truncate pmc-fs-125 fw-bold pmc-ink mb-0">{t.merchant}</p>
                  <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{t.date} · {t.time}</p>
                </div>
                <div className="text-end">
                  <p className="pmc-num pmc-fs-125 fw-bold pmc-ink mb-0">−{kes(t.amount)}</p>
                  <Badge tone={t.status === "Cleared" ? "success" : t.status === "Pending" ? "warning" : t.status === "Declined" ? "danger" : "violet"} className="pmc-mt-05">{t.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}

        {card.status === "delivering" && (
          <div className="pmc-mt-4 pmc-radius pmc-p-35" style={{ border: "1px solid rgba(247,144,9,0.3)", background: "rgba(254,240,199,0.6)" }}>
            <p className="d-flex align-items-center pmc-gap-15 pmc-fs-12 fw-bold pmc-warn-ink mb-0"><Icon name="clock" size={13} /> Courier update</p>
            <p className="pmc-mt-1 pmc-fs-115 pmc-warn-ink mb-0" style={{ lineHeight: 1.65, opacity: 0.8 }}>
              Dispatched 25 Jun via Fargo Courier — expected within 2 working days (Nairobi metro). Activation OTP will be sent on delivery.
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
}
