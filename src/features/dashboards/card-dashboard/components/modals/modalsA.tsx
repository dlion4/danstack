import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib";
import { Icon, NetworkMark } from "../ui/icons";
import { Badge, Btn, Drawer, FieldLabel, Modal, Progress, Toggle } from "../ui";
import { useApp } from "../../lib";
import { kes, type AlertPrefs, type PmCard } from "../../lib";

/* ============ shared: card plastic visual ============ */

export function CardVisual({ card, small }: { card: PmCard; small?: boolean }) {
  return (
    <div
      className={cn(
        "card-sheen relative overflow-hidden rounded-2xl text-white shadow-[var(--shadow-card)]",
        small ? "aspect-[1.62] p-3.5" : "aspect-[1.62] p-4 sm:p-5",
        card.status === "frozen" && "saturate-[0.35]"
      )}
      style={{ background: card.gradient }}
    >
      <div className="pm-hero-dots absolute inset-0" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className={cn("font-display font-bold tracking-tight", small ? "text-[11px]" : "text-[13.5px]")}>PayMo</p>
            <p className={cn("font-semibold uppercase tracking-[0.14em] text-white/60", small ? "text-[7.5px]" : "text-[9px]")}>
              {card.tier === "premium" ? "Premium Travel" : card.tier === "corporate" ? "Corporate" : card.tier === "credit" ? "Credit" : card.tier === "prepaid" ? "Prepaid" : card.kind === "virtual" ? "Virtual Debit" : "Debit"}
            </p>
          </div>
          <span className="flex items-center gap-1.5">
            {card.channels.contactless && <Icon name="wave" size={small ? 13 : 16} className="text-white/80" />}
            <NetworkMark network={card.network} />
          </span>
        </div>
        <div>
          <p className={cn("font-display font-semibold tracking-[0.08em] text-white/95", small ? "text-[12px]" : "text-[15px] sm:text-[16.5px]")}>
            {card.panMask}
          </p>
          <div className="mt-1.5 flex items-end justify-between">
            <div className={cn("leading-tight", small ? "text-[8px]" : "text-[10px]")}>
              <p className="font-semibold uppercase tracking-wider text-white/55">Card Holder</p>
              <p className="font-bold tracking-wide text-white/95">{card.holder}</p>
            </div>
            <div className={cn("text-right leading-tight", small ? "text-[8px]" : "text-[10px]")}>
              <p className="font-semibold uppercase tracking-wider text-white/55">Expires</p>
              <p className="font-bold text-white/95">{card.expiry}</p>
            </div>
          </div>
        </div>
      </div>
      {card.status === "frozen" && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-[#0b1322]/70 px-2 py-1 text-[10px] font-bold text-[#a5d8ff] backdrop-blur-sm">
          <Icon name="snow" size={11} /> FROZEN
        </span>
      )}
      {card.status === "blocked" && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-[#0b1322]/70 px-2 py-1 text-[10px] font-bold text-[#fda29b] backdrop-blur-sm">
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
    <div className={cn("flex items-center gap-3 rounded-xl border px-3.5 py-3 transition", on ? "border-pmgreen/40 bg-pmgreen-soft/40" : "border-line bg-white", disabled && "opacity-50")}>
      <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", on ? "bg-pmgreen-soft text-[#067647]" : "bg-canvas text-muted")}>
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-ink">{title}</p>
        <p className="text-[11.5px] leading-snug text-muted">{desc}</p>
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
      className={cn(
        "flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all duration-150",
        on ? "border-pmgreen bg-pmgreen-soft/50 shadow-[0_2px_10px_-4px_rgba(18,183,106,0.4)]" : "border-line bg-white hover:border-[#c4c9d4]"
      )}
    >
      <span className={cn("grid h-5 w-5 flex-none place-items-center rounded-md border-2 transition", on ? "border-pmgreen bg-pmgreen text-white" : "border-[#d0d5dd] bg-white text-transparent")}>
        <Icon name="check" size={12} strokeWidth={3} />
      </span>
      <span className={cn("grid h-8 w-8 flex-none place-items-center rounded-lg", on ? "bg-white text-[#067647]" : "bg-canvas text-muted")}>
        <Icon name={icon} size={15} />
      </span>
      <span className="min-w-0">
        <span className="block text-[12.5px] font-bold text-ink">{title}</span>
        <span className="block truncate text-[10.5px] font-semibold text-faint">{sub}</span>
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
      <div className="space-y-5">
        {/* Scope */}
        <div>
          <FieldLabel hint="Applies instantly">Alert scope</FieldLabel>
          <div className="thin-scroll flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => set({ scope: "all" })}
              className={cn(
                "flex-none rounded-[10px] border px-3 py-2 text-[12px] font-bold transition",
                p.scope === "all" ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover:border-[#c4c9d4]"
              )}
            >
              All cards · {cards.length}
            </button>
            {cards.filter((c) => c.status !== "blocked").map((c) => (
              <button
                key={c.id}
                onClick={() => set({ scope: c.id })}
                className={cn(
                  "flex-none rounded-[10px] border px-3 py-2 text-[12px] font-bold transition",
                  p.scope === c.id ? "border-pmgreen bg-pmgreen-soft text-[#067647]" : "border-line bg-white text-muted hover:border-[#c4c9d4]"
                )}
              >
                {c.nickname} ·• {c.last4}
              </button>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="space-y-2">
          <FieldLabel>What should trigger an alert?</FieldLabel>
          <RuleRow
            icon="zap"
            title="Notify on all transactions"
            desc="Every authorisation, any amount. High volume — great for frozen-card monitoring."
            on={p.allTxns}
            onChange={(v) => set({ allTxns: v })}
          />
          <div className={cn(!p.allTxns ? "" : "pointer-events-none opacity-60")}>
            <div key={shakeKey} className={cn("rounded-xl border border-line bg-white p-3.5", err && !p.push && !p.sms && !p.email ? "" : "", shakeKey > 0 && "shake")}>
              <div className="flex items-center gap-3">
                <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", p.largeEnabled ? "bg-warn-soft text-[#93370d]" : "bg-canvas text-muted")}>
                  <Icon name="gauge" size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-ink">Large Transaction Alert Threshold</p>
                  <p className="text-[11.5px] text-muted">Only alert when a single transaction exceeds the amount below.</p>
                </div>
                <Toggle on={p.largeEnabled} onChange={(v) => set({ largeEnabled: v })} label="Large transaction threshold" />
              </div>
              {p.largeEnabled && (
                <div className="mt-3 border-t border-dashed border-line pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-faint">KES</span>
                      <input
                        type="number"
                        min={100}
                        max={500000}
                        step={500}
                        value={p.threshold}
                        onChange={(e) => set({ threshold: Number(e.target.value) })}
                        className="focus-ring num w-[130px] rounded-[10px] border border-line bg-canvas/60 py-2 pl-11 pr-3 text-[13px] font-bold text-ink outline-none focus:border-pmgreen/60 focus:bg-white"
                      />
                    </div>
                    {[5000, 10000, 25000, 50000].map((v) => (
                      <button
                        key={v}
                        onClick={() => set({ threshold: v })}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-bold transition",
                          p.threshold === v ? "border-pmgreen bg-pmgreen-soft text-[#067647]" : "border-line bg-white text-muted hover:border-[#c4c9d4]"
                        )}
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
                    className="mt-3 w-full"
                    aria-label="Large transaction threshold"
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-semibold text-faint">
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
          <div className="grid gap-2 sm:grid-cols-3">
            <ChannelCheck icon="phone" title="App Push" sub="This device · iPhone 15 Pro" on={p.push} onToggle={() => set({ push: !p.push })} />
            <ChannelCheck icon="sms" title="SMS" sub="+254 7•• ••• 213" on={p.sms} onToggle={() => set({ sms: !p.sms })} />
            <ChannelCheck icon="mail" title="Email" sub="d•••@acmetraders.co.ke" on={p.email} onToggle={() => set({ email: !p.email })} />
          </div>
        </div>

        {/* Live preview */}
        <div className="rounded-xl border border-line bg-canvas/70 p-3.5">
          <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">
            <Icon name="eye" size={12} /> Live preview · lock screen
          </p>
          <div className="mx-auto max-w-[340px] rounded-xl bg-[#0b1322] p-3 text-white shadow-pm">
            <div className="flex items-start gap-2.5 rounded-lg bg-white/10 p-2.5 backdrop-blur">
              <span className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-[7px] bg-pmgreen">
                <span className="font-display text-[11px] font-bold">P</span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold">PayMo</p>
                  <p className="text-[9.5px] text-white/50">now</p>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-white/85">
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
          <p className="flex items-center gap-2 rounded-lg bg-danger-soft px-3 py-2 text-[12px] font-bold text-[#b42318]">
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
      <div className="space-y-3">
        <CardVisual card={card} small />
        <ul className="space-y-1.5 rounded-xl border border-line bg-canvas/60 p-3.5 text-[12.5px] font-semibold text-ink-2">
          <li className="flex items-center gap-2"><Icon name="check" size={13} className="text-danger" /> New purchases, ATM withdrawals & online charges decline</li>
          <li className="flex items-center gap-2"><Icon name="check" size={13} className="text-danger" /> Refunds and incoming reversals still post normally</li>
          <li className="flex items-center gap-2"><Icon name="check" size={13} className="text-pmgreen-dark" /> Unfreeze anytime — takes effect immediately</li>
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
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {cards.filter((c) => c.status === "active").map((c) => (
          <div key={c.id} className="rounded-lg border border-line bg-canvas/60 px-2 py-2 text-center">
            <p className="truncate text-[11px] font-bold text-ink">{c.nickname}</p>
            <p className="text-[10px] font-semibold text-faint">•• {c.last4}</p>
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
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-pmgreen-soft text-[#067647]">
            <Icon name="checkCircle" size={26} />
          </span>
          <p className="font-display text-[15px] font-bold text-ink">Check your phone</p>
          <p className="max-w-[280px] text-[12.5px] leading-relaxed text-muted">
            Enter your business OTP in the PayMo app to reveal the PIN. Never share it — PayMo staff will never ask for it.
          </p>
        </div>
      ) : (
        <div className="py-2">
          <FieldLabel hint="Any 4 digits for demo">Enter your PayMo PIN</FieldLabel>
          <div className="flex justify-center gap-3">
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
                className="focus-ring h-14 w-12 rounded-xl border-2 border-line bg-canvas/50 text-center font-display text-xl font-bold text-ink outline-none transition focus:border-pmgreen focus:bg-white"
                aria-label={`PIN digit ${i + 1}`}
              />
            ))}
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11.5px] font-semibold text-faint">
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
      <div className="space-y-5">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <FieldLabel>Monthly spending limit</FieldLabel>
            <span className="num font-display text-[15px] font-bold text-ink">{kes(month)}</span>
          </div>
          <input type="range" min={5000} max={500000} step={5000} value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full" aria-label="Monthly limit" />
          <div className="mt-2">
            <div className="mb-1 flex justify-between text-[11px] font-semibold text-faint">
              <span>Spent this month · {kes(card.spentMonth)}</span>
              <span>{Math.round((card.spentMonth / month) * 100)}%</span>
            </div>
            <Progress value={(card.spentMonth / month) * 100} tone={(card.spentMonth / month) > 0.85 ? "red" : (card.spentMonth / month) > 0.6 ? "amber" : "green"} />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <FieldLabel>Per-transaction cap</FieldLabel>
            <span className="num font-display text-[15px] font-bold text-ink">{kes(perTxn)}</span>
          </div>
          <input type="range" min={1000} max={200000} step={1000} value={perTxn} onChange={(e) => setPerTxn(Number(e.target.value))} className="w-full" aria-label="Per transaction limit" />
          {perTxn > month && (
            <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-bold text-[#93370d]">
              <Icon name="alertTri" size={13} /> Per-transaction cap is above the monthly limit.
            </p>
          )}
        </div>

        <div>
          <FieldLabel>Payment rails</FieldLabel>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["online", "Online payments", "globe"],
                ["contactless", "Contactless / NFC", "wave"],
                ["atm", "ATM withdrawals", "wallet"],
                ["intl", "International use", "send"],
              ] as const
            ).map(([key, label, icon]) => (
              <div key={key} className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-canvas text-muted"><Icon name={icon} size={15} /></span>
                <span className="flex-1 text-[12px] font-bold text-ink-2">{label}</span>
                <Toggle
                  on={card.channels[key]}
                  onChange={(v) => {
                    updateChannels(card.id, { [key]: v });
                    toast("info", `${label} ${v ? "enabled" : "disabled"}`, `${card.nickname} •• ${card.last4}`);
                  }}
                  label={label}
                />
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
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">Card detail</p>
          <h3 className="font-display text-[16px] font-bold tracking-tight text-ink">{card.nickname}</h3>
        </div>
        <button onClick={closeDrawer} aria-label="Close panel" className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink">
          <Icon name="x" size={17} />
        </button>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4 pb-28">
        <div className="card-hover">
          <CardVisual card={card} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={statusTone} dot className="capitalize">{card.status}</Badge>
          <Badge tone="muted">{card.kind === "virtual" ? "Virtual" : "Physical"}</Badge>
          <Badge tone="muted">{card.network}</Badge>
          <Badge tone="violet">Issued {card.issuedOn}</Badge>
        </div>

        {/* Usage */}
        <div className="mt-4 rounded-xl border border-line bg-white p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">This month's usage</p>
            <p className="num font-display text-[15px] font-bold text-ink">{usage}%</p>
          </div>
          <Progress className="mt-2" value={usage} tone={usage > 85 ? "red" : usage > 60 ? "amber" : "green"} />
          <div className="mt-2 flex justify-between text-[11.5px] font-semibold text-faint">
            <span>{kes(card.spentMonth)} spent</span>
            <span>of {kes(card.limitMonth)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {card.status === "frozen" ? (
            <Btn
              icon="zap"
              className="col-span-2"
              onClick={() => {
                setCardStatus(card.id, "active");
                toast("success", `${card.nickname} unfrozen`, "The card is accepting authorisations again.");
                pushNotif({ channel: "push", title: "Card unfrozen", body: `${card.nickname} •• ${card.last4} is active again.` });
              }}
            >
              Unfreeze Card
            </Btn>
          ) : card.status === "active" ? (
            <Btn variant="dangerGhost" icon="snow" className="col-span-2" onClick={() => openModal({ type: "freeze", cardId: card.id })}>
              Freeze Card
            </Btn>
          ) : null}
          <Btn variant="outline" icon="bell" onClick={() => openModal({ type: "alerts", cardId: card.id })}>Alerts</Btn>
          <Btn variant="outline" icon="sliders" onClick={() => openModal({ type: "limits", cardId: card.id })}>Limits</Btn>
          <Btn variant="outline" icon="key" onClick={() => openModal({ type: "pin", cardId: card.id })}>View PIN</Btn>
          <Btn
            variant="outline"
            icon="copy"
            onClick={() => {
              toast("info", "Card details copied", "PAN, expiry and CVV copied as a secure snippet.");
            }}
          >
            Copy Details
          </Btn>
        </div>

        {/* Recent activity */}
        <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-faint">Recent activity</p>
        {cardTxns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-canvas/50 p-4 text-center text-[12px] font-semibold text-faint">
            No transactions on this card yet.
          </div>
        ) : (
          <ul className="divide-y divide-line/70 rounded-xl border border-line bg-white">
            {cardTxns.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-3.5 py-2.5">
                <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-canvas text-muted">
                  <Icon name={t.channel === "Online" ? "globe" : t.channel === "ATM" ? "wallet" : t.channel === "Wallet" ? "phone" : "card"} size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-bold text-ink">{t.merchant}</p>
                  <p className="text-[10.5px] font-semibold text-faint">{t.date} · {t.time}</p>
                </div>
                <div className="text-right">
                  <p className="num text-[12.5px] font-bold text-ink">−{kes(t.amount)}</p>
                  <Badge tone={t.status === "Cleared" ? "success" : t.status === "Pending" ? "warning" : t.status === "Declined" ? "danger" : "violet"} className="mt-0.5">{t.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}

        {card.status === "delivering" && (
          <div className="mt-4 rounded-xl border border-warn/30 bg-warn-soft/60 p-3.5">
            <p className="flex items-center gap-1.5 text-[12px] font-bold text-[#93370d]"><Icon name="clock" size={13} /> Courier update</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-[#93370d]/80">
              Dispatched 25 Jun via Fargo Courier — expected within 2 working days (Nairobi metro). Activation OTP will be sent on delivery.
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
}
