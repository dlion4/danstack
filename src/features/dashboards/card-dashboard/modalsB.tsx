import { useEffect, useMemo, useState } from "react";
import { cn } from "./utils/cn";
import { Icon } from "./icons";
import { Badge, Btn, Drawer, FieldLabel, Modal } from "./ui";
import { useApp } from "./store";
import { kes, DISPUTE_REASONS, TIER_META, type CardTier, type PmCard } from "./data";
import { CardVisual } from "./modalsA";

/* ============ Issue Card wizard (mirrors 5.2 flow) ============ */

const ISSUE_TIERS: { tier: CardTier; kind: "physical" | "virtual"; icon: Parameters<typeof Icon>[0]["name"] }[] = [
  { tier: "standard", kind: "physical", icon: "card" },
  { tier: "premium", kind: "physical", icon: "spark" },
  { tier: "credit", kind: "virtual", icon: "zap" },
  { tier: "prepaid", kind: "virtual", icon: "wallet" },
];

export function IssueCardModal() {
  const { modal, closeModal, addCard, toast } = useApp();
  const open = modal?.type === "issue";
  const [step, setStep] = useState(1);
  const [tier, setTier] = useState<CardTier>("standard");
  const [kind, setKind] = useState<"physical" | "virtual">("physical");
  const [name, setName] = useState("DAVID OCHIENG");
  const [account, setAccount] = useState("Biz Wallet · KES 1,284,000");
  const [contactless, setContactless] = useState(true);
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [issued, setIssued] = useState<PmCard | null>(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setTier("standard");
      setKind("physical");
      setName("DAVID OCHIENG");
      setPin("");
      setPinErr(false);
      setIssued(null);
    }
  }, [open]);

  const meta = TIER_META[tier];
  const deliveryFee = kind === "physical" ? 300 : 0;
  const total = meta.fee + deliveryFee;

  const gradients: Record<CardTier, string> = {
    standard: "linear-gradient(118deg,#1d2939 0%,#344054 60%,#475467 100%)",
    premium: "linear-gradient(118deg,#0b1322 0%,#123a2c 55%,#0d5c38 100%)",
    credit: "linear-gradient(118deg,#3b2aa8 0%,#5925dc 55%,#7a5af8 100%)",
    "single-use": "linear-gradient(118deg,#0b4ea2 0%,#175cd3 55%,#2e90fa 100%)",
    prepaid: "linear-gradient(118deg,#07633c 0%,#0b8f52 55%,#12b76a 100%)",
    corporate: "linear-gradient(118deg,#101828 0%,#1d2939 55%,#0b8f52 130%)",
  };

  const preview: PmCard = useMemo(
    () => ({
      id: "preview",
      nickname: meta.label,
      holder: name.trim().toUpperCase() || "CARD HOLDER",
      tier,
      kind,
      network: tier === "credit" || tier === "standard" ? "VISA" : "Mastercard",
      last4: "••••",
      panMask: "•••• •••• •••• ••••",
      expiry: "08/29",
      status: "active",
      issuedOn: "Today",
      spentMonth: 0,
      limitMonth: 50000,
      limitPerTxn: 20000,
      channels: { online: true, contactless, atm: kind === "physical", intl: tier === "premium" || tier === "credit" },
      gradient: gradients[tier],
    }),
    [tier, kind, name, contactless, meta.label]
  );

  if (!open) return null;

  const issue = () => {
    if (pin.length !== 4) {
      setPinErr(true);
      return;
    }
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const card: PmCard = {
      ...preview,
      id: `c${Date.now()}`,
      nickname: `${meta.label} ${last4.slice(0, 2)}`,
      last4,
      panMask: `${tier === "credit" || tier === "standard" ? "4539 10" : "5210 44"}•• •••• ${last4}`,
      status: kind === "physical" ? "delivering" : "active",
      tag: kind === "physical" ? "In delivery" : "Just issued",
      limitMonth: tier === "credit" ? 100000 : 50000,
    };
    addCard(card);
    setIssued(card);
    toast("success", "Card issued", kind === "virtual" ? "Your new card is ready for online transactions." : "Physical card dispatched — track it in My Cards.");
  };

  const StepDot = () => (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <span
            className={cn(
              "grid h-6 w-6 place-items-center rounded-full font-display text-[11px] font-bold transition-all",
              s < step || issued ? "bg-pmgreen text-white" : s === step ? "bg-ink text-white" : "bg-canvas text-faint"
            )}
          >
            {s < step || issued ? <Icon name="check" size={11} strokeWidth={3} /> : s}
          </span>
          {s < 3 && <span className={cn("h-px w-6 sm:w-10", s < step ? "bg-pmgreen" : "bg-line")} />}
        </div>
      ))}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="plus"
      title={issued ? "Card issued successfully" : "Issue a new card"}
      subtitle={issued ? undefined : "Three quick steps — virtual cards are live instantly, physical cards ship in 2–3 days."}
      width="max-w-2xl"
      footer={
        issued ? (
          <Btn icon="check" onClick={closeModal}>Go to My Cards</Btn>
        ) : step === 1 ? (
          <>
            <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
            <Btn icon="arrowRight" onClick={() => setStep(2)}>Continue</Btn>
          </>
        ) : step === 2 ? (
          <>
            <Btn variant="outline" icon="chevLeft" onClick={() => setStep(1)}>Back</Btn>
            <Btn icon="arrowRight" onClick={() => setStep(3)} disabled={name.trim().length < 3}>Review</Btn>
          </>
        ) : (
          <>
            <Btn variant="outline" icon="chevLeft" onClick={() => setStep(2)}>Back</Btn>
            <Btn icon="lock" onClick={issue}>Pay {kes(total)} & Issue</Btn>
          </>
        )
      }
    >
      {issued ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-pmgreen-soft text-[#067647]">
            <Icon name="checkCircle" size={26} />
          </span>
          <div>
            <p className="font-display text-[16px] font-bold text-ink">{issued.kind === "virtual" ? "Your new card is ready" : "Order confirmed"}</p>
            <p className="mt-1 text-[12.5px] text-muted">
              {issued.kind === "virtual"
                ? "Use it for online transactions immediately — full details are in the card drawer."
                : `Dispatched via Fargo Courier. Activation OTP goes to +254 7•• ••• 213 on delivery.`}
            </p>
          </div>
          <div className="w-full max-w-[340px]">
            <CardVisual card={issued} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <StepDot />
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-faint">
              Step {step} · {step === 1 ? "Card Tier" : step === 2 ? "Personalisation" : "Review & Pay"}
            </span>
          </div>

          {step === 1 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {ISSUE_TIERS.map((t) => {
                const m = TIER_META[t.tier];
                const on = tier === t.tier;
                return (
                  <button
                    key={t.tier}
                    onClick={() => {
                      setTier(t.tier);
                      setKind(t.kind);
                    }}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all duration-150",
                      on ? "border-pmgreen bg-pmgreen-soft/50 shadow-[0_4px_16px_-6px_rgba(18,183,106,0.4)]" : "border-line bg-white hover:border-[#c4c9d4]"
                    )}
                  >
                    <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", on ? "bg-pmgreen text-white" : "bg-canvas text-muted")}>
                      <Icon name={t.icon} size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-ink">PayMo {m.label}</span>
                        <Badge tone={m.fee === 0 ? "success" : "warning"}>{m.fee === 0 ? "Free" : kes(m.fee)}</Badge>
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-muted">{m.blurb}</span>
                      <span className="mt-1 block text-[10.5px] font-bold uppercase tracking-wide text-faint">{t.kind === "virtual" ? "Virtual · instant" : "Physical · 2–3 days"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <FieldLabel hint={`${name.length}/21 characters`}>Name on card</FieldLabel>
                <input
                  value={name}
                  maxLength={21}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  className="focus-ring w-full rounded-[10px] border border-line bg-canvas/50 px-3.5 py-2.5 font-display text-[13.5px] font-semibold tracking-wide text-ink outline-none transition focus:border-pmgreen/60 focus:bg-white"
                />
              </div>
              <div>
                <FieldLabel>Linked account</FieldLabel>
                <div className="space-y-1.5">
                  {["Biz Wallet · KES 1,284,000", "M-Pesa Paybill 522 123 · KES 96,400", "KCB Bank •• 4471 · KES 512,300"].map((a) => (
                    <button
                      key={a}
                      onClick={() => setAccount(a)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-left text-[12.5px] font-bold transition",
                        account === a ? "border-pmgreen bg-pmgreen-soft/50 text-[#067647]" : "border-line bg-white text-ink-2 hover:border-[#c4c9d4]"
                      )}
                    >
                      <Icon name={a.startsWith("Biz") ? "wallet" : a.startsWith("M-Pesa") ? "phone" : "building"} size={15} />
                      {a}
                      {account === a && <Icon name="check" size={14} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              {kind === "physical" && (
                <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-pmblue-soft text-[#175cd3]"><Icon name="wave" size={16} /></span>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-ink">Enable Contactless (NFC)</p>
                    <p className="text-[11.5px] text-muted">Tap-to-pay at POS terminals up to KES 15,000 per tap.</p>
                  </div>
                  <input type="checkbox" checked={contactless} onChange={(e) => setContactless(e.target.checked)} className="h-4 w-4 accent-[#12b76a]" aria-label="Enable contactless" />
                </div>
              )}
              <div>
                <FieldLabel hint="Live preview">Card preview</FieldLabel>
                <div className="mx-auto max-w-[360px]">
                  <CardVisual card={preview} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-line">
                {[
                  ["Card Tier", `PayMo ${meta.label}`],
                  ["Cardholder", name.trim().toUpperCase()],
                  ["Funding Source", account],
                  ["Issuance Fee", meta.fee === 0 ? "Free" : kes(meta.fee)],
                  ["Delivery Fee", deliveryFee === 0 ? "Free · instant virtual" : kes(deliveryFee)],
                ].map(([k, v], i) => (
                  <div key={k} className={cn("flex items-center justify-between px-4 py-2.5 text-[12.5px]", i % 2 === 0 ? "bg-canvas/60" : "bg-white")}>
                    <span className="font-semibold text-muted">{k}</span>
                    <span className="font-bold text-ink">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-ink px-4 py-3">
                  <span className="text-[12.5px] font-bold text-white/70">Total to Pay</span>
                  <span className="num font-display text-[16px] font-bold text-pmgreen">{kes(total)}</span>
                </div>
              </div>
              <div>
                <FieldLabel hint="Authorises issuance">Enter PIN to issue card</FieldLabel>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ""));
                    setPinErr(false);
                  }}
                  placeholder="••••"
                  className={cn(
                    "focus-ring num w-full rounded-[10px] border-2 bg-canvas/50 px-3.5 py-2.5 text-center font-display text-xl font-bold tracking-[0.5em] text-ink outline-none transition focus:bg-white",
                    pinErr ? "border-danger" : "border-line focus:border-pmgreen"
                  )}
                />
                {pinErr && (
                  <p className="shake mt-1.5 flex items-center gap-1.5 text-[11.5px] font-bold text-[#b42318]">
                    <Icon name="alertTri" size={12} /> Enter your 4-digit PayMo PIN to authorise.
                  </p>
                )}
              </div>
              <p className="rounded-lg bg-canvas/80 px-3 py-2 text-[11.5px] leading-relaxed text-muted">
                Your card will be instantly generated and ready for use{kind === "physical" ? " once delivered and activated" : ""}. Fees are debited from {account.split("·")[0]}.
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/* ============ Dispute modal (mirrors 5.3 flow) ============ */

export function DisputeModal() {
  const { modal, closeModal, txns, cards, fileDispute, setCardStatus, toast } = useApp();
  const open = modal?.type === "dispute";
  const txn = txns.find((t) => t.id === (modal?.type === "dispute" ? modal.txnId : ""));
  const [reason, setReason] = useState(DISPUTE_REASONS[0]);
  const [details, setDetails] = useState("");
  const [freeze, setFreeze] = useState(true);

  useEffect(() => {
    if (open) {
      setReason(DISPUTE_REASONS[0]);
      setDetails("");
      setFreeze(true);
    }
  }, [open]);

  if (!open || !txn) return null;
  const card = cards.find((c) => c.id === txn.cardId);

  return (
    <Modal
      open={open}
      onClose={closeModal}
      icon="flag"
      title="Dispute transaction"
      subtitle="We push the chargeback to the card network with pre-filled evidence."
      width="max-w-xl"
      footer={
        <>
          <Btn variant="outline" onClick={closeModal}>Cancel</Btn>
          <Btn
            icon="flag"
            onClick={() => {
              fileDispute(txn.id, reason);
              if (freeze && card && card.status === "active") {
                setCardStatus(card.id, "frozen");
                toast("warn", `${card.nickname} frozen`, "Protective freeze applied while the dispute is investigated.");
              }
              closeModal();
            }}
          >
            File Dispute
          </Btn>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas/60 p-3.5">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-[10px] bg-white text-muted shadow-sm"><Icon name="globe" size={17} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold text-ink">{txn.merchant}</p>
            <p className="text-[11.5px] font-semibold text-muted">{txn.date} · {txn.time} · {card?.nickname} •• {card?.last4}</p>
          </div>
          <p className="num font-display text-[15px] font-bold text-ink">{kes(txn.amount)}</p>
        </div>

        <div>
          <FieldLabel>Dispute reason</FieldLabel>
          <div className="space-y-1.5">
            {DISPUTE_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 text-left text-[12.5px] font-bold transition",
                  reason === r ? "border-pmgreen bg-pmgreen-soft/50 text-[#067647]" : "border-line bg-white text-ink-2 hover:border-[#c4c9d4]"
                )}
              >
                <span className={cn("grid h-4 w-4 flex-none place-items-center rounded-full border-2", reason === r ? "border-pmgreen" : "border-[#d0d5dd]")}>
                  {reason === r && <span className="h-2 w-2 rounded-full bg-pmgreen" />}
                </span>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel hint="Optional but strengthens the case">Details</FieldLabel>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            placeholder="Tell us what happened — receipts, emails or screenshots can be attached after filing."
            className="focus-ring w-full resize-none rounded-[10px] border border-line bg-canvas/50 px-3.5 py-2.5 text-[12.5px] font-semibold text-ink outline-none transition placeholder:font-medium placeholder:text-faint focus:border-pmgreen/60 focus:bg-white"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-3">
          <input type="checkbox" checked={freeze} onChange={(e) => setFreeze(e.target.checked)} className="h-4 w-4 accent-[#12b76a]" />
          <span>
            <span className="block text-[12.5px] font-bold text-ink">Freeze this card immediately</span>
            <span className="block text-[11px] text-muted">Recommended if you suspect the card details were compromised.</span>
          </span>
        </label>

        <p className="rounded-lg bg-warn-soft/70 px-3 py-2 text-[11.5px] font-semibold leading-relaxed text-[#93370d]">
          Filing a false chargeback may result in account termination. Chargebacks take 7–14 days to resolve via the VISA/Mastercard networks.
        </p>
      </div>
    </Modal>
  );
}

/* ============ Fraud wizard (mirrors 5.7 flow) ============ */

export function FraudWizardModal() {
  const { modal, closeModal, cards, txns, blockAndReplace } = useApp();
  const open = modal?.type === "fraud";
  const [step, setStep] = useState(1);
  const [cardId, setCardId] = useState("c1");
  const [selected, setSelected] = useState<string[]>([]);
  const [pin, setPin] = useState("");
  const [done, setDone] = useState(false);

  const suspicious = useMemo(() => txns.filter((t) => t.flagged || (t.intl && t.channel === "Online" && t.status === "Cleared")), [txns]);

  useEffect(() => {
    if (open) {
      setStep(1);
      setCardId("c1");
      setSelected(txns.filter((t) => t.flagged).map((t) => t.id));
      setPin("");
      setDone(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const card = cards.find((c) => c.id === cardId);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

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
      subtitle={done ? undefined : "Walk through the compromise — we'll contain the damage in under a minute."}
      width="max-w-xl"
      footer={
        done ? (
          <Btn icon="check" onClick={closeModal}>Back to Command Center</Btn>
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
            Old card cancelled. A new virtual replacement was issued instantly — find it at the top of <strong className="text-ink">My Cards</strong>. {selected.length} transaction{selected.length === 1 ? "" : "s"} pushed to disputes.
          </p>
        </div>
      ) : step === 1 ? (
        <div className="space-y-2">
          <FieldLabel>Which card is compromised?</FieldLabel>
          {cards.filter((c) => c.status !== "blocked" && c.status !== "delivering").map((c) => (
            <button
              key={c.id}
              onClick={() => setCardId(c.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition",
                cardId === c.id ? "border-danger bg-danger-soft/40" : "border-line bg-white hover:border-[#c4c9d4]"
              )}
            >
              <span className={cn("grid h-4 w-4 flex-none place-items-center rounded-full border-2", cardId === c.id ? "border-danger" : "border-[#d0d5dd]")}>
                {cardId === c.id && <span className="h-2 w-2 rounded-full bg-danger" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-ink">{c.nickname}</span>
                <span className="block text-[11px] font-semibold text-faint">{c.holder.toLowerCase()} · •• {c.last4}</span>
              </span>
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
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left transition",
                  selected.includes(t.id) ? "border-danger bg-danger-soft/40" : "border-line bg-white hover:border-[#c4c9d4]"
                )}
              >
                <span className={cn("grid h-4.5 w-4.5 h-[18px] w-[18px] flex-none place-items-center rounded border-2", selected.includes(t.id) ? "border-danger bg-danger text-white" : "border-[#d0d5dd] text-transparent")}>
                  <Icon name="check" size={11} strokeWidth={3} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-bold text-ink">{t.merchant} {t.intl && <Badge tone="info" className="ml-1">INTL</Badge>}</span>
                  <span className="block text-[10.5px] font-semibold text-faint">{t.date} · {t.time}</span>
                </span>
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
                <div>
                  <p className="font-bold text-ink">{k}</p>
                  <p className="text-[11px] font-semibold text-muted">{v}</p>
                </div>
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
              className="focus-ring num w-full rounded-[10px] border-2 border-line bg-canvas/50 px-3.5 py-2.5 text-center font-display text-xl font-bold tracking-[0.5em] text-ink outline-none transition focus:border-danger focus:bg-white"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ============ Shortcuts modal ============ */

export function ShortcutsModal() {
  const { modal, closeModal } = useApp();
  const open = modal?.type === "shortcuts";
  const Kbd = ({ k }: { k: string }) => (
    <kbd className="rounded-[5px] border border-line border-b-2 bg-canvas px-1.5 py-0.5 font-sans text-[10.5px] font-bold text-ink-2">{k}</kbd>
  );
  return (
    <Modal open={open} onClose={closeModal} icon="zap" title="Keyboard shortcuts" subtitle="Move around the Command Center without touching the mouse." footer={<Btn onClick={closeModal}>Done</Btn>}>
      <div className="space-y-1">
        {[
          [["/"], "Focus search"],
          [["N"], "Issue a new card"],
          [["A"], "Configure alerts"],
          [["F"], "Freeze-all dialog"],
          [["1", "…", "7"], "Jump to section"],
          [["Esc"], "Close any modal or drawer"],
        ].map(([keys, desc], i) => (
          <div key={i} className="flex items-center justify-between rounded-lg px-2 py-2 odd:bg-canvas/60">
            <span className="text-[12.5px] font-semibold text-ink-2">{desc}</span>
            <span className="flex items-center gap-1">
              {(keys as string[]).map((k, ki) => (k === "…" ? <span key={ki} className="text-[11px] text-faint">…</span> : <Kbd key={ki} k={k} />))}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ============ Support drawer ============ */

export function SupportDrawer() {
  const { drawer, closeDrawer, toast } = useApp();
  const open = drawer?.type === "support";
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [topic, setTopic] = useState("Dispute status");
  const [msg, setMsg] = useState("");

  if (!open) return null;

  const faqs = [
    { q: "How long do chargebacks take?", a: "7–14 days via VISA/Mastercard networks. You'll get a push + SMS at every stage, and provisional credit is applied within 48h for fraud-verified claims." },
    { q: "When does my physical card arrive?", a: "Nairobi metro: 2 working days via Fargo Courier. Other regions: 3–5 days. Track status from the card drawer — the activation OTP is sent on delivery." },
    { q: "Can I use my card outside Kenya?", a: "Yes, if International Use is enabled on the card (Limits & controls). FX is charged at network rate + 1.5% for Standard, 0.5% for Premium Travel." },
  ];

  return (
    <Drawer open={open} onClose={closeDrawer}>
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-faint">We're online now</p>
          <h3 className="font-display text-[16px] font-bold tracking-tight text-ink">Card Support</h3>
        </div>
        <button onClick={closeDrawer} aria-label="Close support" className="focus-ring grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink">
          <Icon name="x" size={17} />
        </button>
      </div>

      <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: "sms" as const, label: "Live chat", sub: "~3 min reply" },
            { icon: "phone" as const, label: "Call desk", sub: "+254 709 900 000" },
            { icon: "mail" as const, label: "Email", sub: "cards@paymo.app" },
          ].map((c) => (
            <button
              key={c.label}
              onClick={() => toast("info", `${c.label} requested`, "A card specialist will reach out shortly.")}
              className="rounded-xl border border-line bg-white p-3 text-center transition hover:-translate-y-0.5 hover:border-pmgreen/50 hover:shadow-pm"
            >
              <span className="mx-auto grid h-9 w-9 place-items-center rounded-[10px] bg-pmgreen-soft text-[#067647]"><Icon name={c.icon} size={16} /></span>
              <p className="mt-1.5 text-[11.5px] font-bold text-ink">{c.label}</p>
              <p className="text-[9.5px] font-semibold text-faint">{c.sub}</p>
            </button>
          ))}
        </div>

        <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-faint">Common questions</p>
        <div className="space-y-1.5">
          {faqs.map((f, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-line bg-white">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="flex w-full items-center gap-2 px-3.5 py-3 text-left">
                <span className="flex-1 text-[12.5px] font-bold text-ink">{f.q}</span>
                <Icon name="chevDown" size={14} className={cn("text-faint transition-transform duration-200", faqOpen === i && "rotate-180")} />
              </button>
              {faqOpen === i && <p className="border-t border-line/70 px-3.5 py-3 text-[12px] leading-relaxed text-muted">{f.a}</p>}
            </div>
          ))}
        </div>

        <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-faint">Open a ticket</p>
        <div className="space-y-2.5 rounded-xl border border-line bg-canvas/50 p-3.5">
          <div>
            <FieldLabel>Topic</FieldLabel>
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className="focus-ring w-full rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-bold text-ink outline-none">
              {["Dispute status", "Card not received", "Limit increase request", "Fraud investigation", "Something else"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>Message</FieldLabel>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={3}
              placeholder="Describe the issue — include the card's last 4 digits."
              className="focus-ring w-full resize-none rounded-[10px] border border-line bg-white px-3 py-2.5 text-[12.5px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-faint"
            />
          </div>
          <Btn
            icon="send"
            className="w-full"
            disabled={msg.trim().length < 5}
            onClick={() => {
              toast("success", "Ticket submitted", `Ref #CS-${Math.floor(4000 + Math.random() * 999)} · "${topic}" — expect a reply within 3 minutes.`);
              setMsg("");
              closeDrawer();
            }}
          >
            Submit Ticket
          </Btn>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold text-faint">
          <span className="live-dot" /> All systems operational · status.paymo.app
        </p>
      </div>
    </Drawer>
  );
}
