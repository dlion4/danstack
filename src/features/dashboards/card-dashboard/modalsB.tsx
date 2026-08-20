/* ============================================================================
 * Card Dashboard — shared modals B (Bootstrap 5 edition)
 * ----------------------------------------------------------------------------
 * Card issuance wizard, dispute filing, fraud report, keyboard shortcuts and
 * the support drawer. Behavior and copy identical to the Tailwind original;
 * markup uses Bootstrap utilities + scoped .pmc-* classes.
 * ========================================================================== */

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
    <div className="d-flex align-items-center pmc-gap-2">
      {[1, 2, 3].map((s) => (
        <div key={s} className="d-flex align-items-center pmc-gap-2">
          <span className={cn("pmc-step-dot", (s < step || issued) && "done", s === step && !issued && "current")}>
            {s < step || issued ? <Icon name="check" size={11} /> : s}
          </span>
          {s < 3 && <span className={cn("pmc-step-line", s < step && "done")} />}
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
        <div className="d-flex flex-column align-items-center pmc-gap-4 p-4 text-center">
          <span className="pmc-done-icon">
            <Icon name="checkCircle" size={26} />
          </span>
          <div>
            <p className="pmc-display pmc-fs-16 fw-bold pmc-ink mb-0">{issued.kind === "virtual" ? "Your new card is ready" : "Order confirmed"}</p>
            <p className="pmc-mt-1 pmc-fs-125 pmc-muted mb-0">
              {issued.kind === "virtual"
                ? "Use it for online transactions immediately — full details are in the card drawer."
                : `Dispatched via Fargo Courier. Activation OTP goes to +254 7•• ••• 213 on delivery.`}
            </p>
          </div>
          <div className="w-100 mx-auto" style={{ maxWidth: 340 }}>
            <CardVisual card={issued} />
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column pmc-gap-4">
          <div className="d-flex align-items-center justify-content-between">
            <StepDot />
            <span className="pmc-kicker pmc-faint">
              Step {step} · {step === 1 ? "Card Tier" : step === 2 ? "Personalisation" : "Review & Pay"}
            </span>
          </div>

          {step === 1 && (
            <div className="row g-2">
              {ISSUE_TIERS.map((t) => {
                const m = TIER_META[t.tier];
                const on = tier === t.tier;
                return (
                  <div key={t.tier} className="col-12 col-sm-6">
                    <button
                      type="button"
                      onClick={() => {
                        setTier(t.tier);
                        setKind(t.kind);
                      }}
                      className={cn("pmc-choice pmc-focus h-100", on && "on")}
                    >
                      <span
                        className={cn("pmc-icon-sq d-grid", !on && "pmc-tone-muted")}
                        style={on ? { background: "var(--pmc-green)", color: "#fff" } : undefined}
                      >
                        <Icon name={t.icon} size={16} />
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span className="d-flex align-items-center pmc-gap-2">
                          <span className="pmc-fs-13 fw-bold pmc-ink">PayMo {m.label}</span>
                          <Badge tone={m.fee === 0 ? "success" : "warning"}>{m.fee === 0 ? "Free" : kes(m.fee)}</Badge>
                        </span>
                        <span className="d-block pmc-mt-05 pmc-fs-115 lh-sm pmc-muted">{m.blurb}</span>
                        <span className="d-block pmc-mt-1 pmc-kicker pmc-faint">{t.kind === "virtual" ? "Virtual · instant" : "Physical · 2–3 days"}</span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="d-flex flex-column pmc-gap-4">
              <div>
                <FieldLabel hint={`${name.length}/21 characters`}>Name on card</FieldLabel>
                <input
                  value={name}
                  maxLength={21}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  className="form-control pmc-focus pmc-display pmc-fs-135 fw-semibold pmc-ink"
                  style={{ letterSpacing: "0.02em" }}
                />
              </div>
              <div>
                <FieldLabel>Linked account</FieldLabel>
                <div className="d-flex flex-column pmc-gap-15">
                  {["Biz Wallet · KES 1,284,000", "M-Pesa Paybill 522 123 · KES 96,400", "KCB Bank •• 4471 · KES 512,300"].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAccount(a)}
                      className={cn("pmc-focus d-flex w-100 align-items-center pmc-gap-25 pmc-radius-sm pmc-px-35 pmc-py-25 text-start pmc-fs-125 fw-bold")}
                      style={
                        account === a
                          ? { border: "1px solid var(--pmc-green)", background: "rgba(231,248,239,0.5)", color: "var(--pmc-green-ink)" }
                          : { border: "1px solid var(--pmc-line)", background: "#fff", color: "var(--pmc-ink-2)" }
                      }
                    >
                      <Icon name={a.startsWith("Biz") ? "wallet" : a.startsWith("M-Pesa") ? "phone" : "building"} size={15} />
                      {a}
                      {account === a && <Icon name="check" size={14} className="ms-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              {kind === "physical" && (
                <div className="d-flex align-items-center pmc-gap-3 pmc-radius pmc-px-35 pmc-py-3" style={{ border: "1px solid var(--pmc-line)", background: "#fff" }}>
                  <span className="pmc-icon-sq d-grid pmc-tone-blue"><Icon name="wave" size={16} /></span>
                  <div className="flex-grow-1">
                    <p className="pmc-fs-13 fw-bold pmc-ink mb-0">Enable Contactless (NFC)</p>
                    <p className="pmc-fs-115 pmc-muted mb-0">Tap-to-pay at POS terminals up to KES 15,000 per tap.</p>
                  </div>
                  <input type="checkbox" checked={contactless} onChange={(e) => setContactless(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#12b76a" }} aria-label="Enable contactless" />
                </div>
              )}
              <div>
                <FieldLabel hint="Live preview">Card preview</FieldLabel>
                <div className="mx-auto" style={{ maxWidth: 360 }}>
                  <CardVisual card={preview} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="d-flex flex-column pmc-gap-4">
              <div className="pmc-radius overflow-hidden" style={{ border: "1px solid var(--pmc-line)" }}>
                {[
                  ["Card Tier", `PayMo ${meta.label}`],
                  ["Cardholder", name.trim().toUpperCase()],
                  ["Funding Source", account],
                  ["Issuance Fee", meta.fee === 0 ? "Free" : kes(meta.fee)],
                  ["Delivery Fee", deliveryFee === 0 ? "Free · instant virtual" : kes(deliveryFee)],
                ].map(([k, v]) => (
                  <div key={k} className="pmc-kv">
                    <span className="fw-semibold pmc-muted">{k}</span>
                    <span className="fw-bold pmc-ink">{v}</span>
                  </div>
                ))}
                <div className="pmc-kv-total pmc-py-3">
                  <span className="pmc-fs-125 fw-bold" style={{ color: "rgba(255,255,255,0.7)" }}>Total to Pay</span>
                  <span className="pmc-num pmc-display pmc-fs-16 fw-bold" style={{ color: "var(--pmc-green)" }}>{kes(total)}</span>
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
                  className={cn("pmc-focus pmc-pin-input", pinErr && "err")}
                  style={{ letterSpacing: "0.5em" }}
                />
                {pinErr && (
                  <p className="pmc-shake pmc-mt-15 d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-bold pmc-danger-ink mb-0">
                    <Icon name="alertTri" size={12} /> Enter your 4-digit PayMo PIN to authorise.
                  </p>
                )}
              </div>
              <p className="pmc-note pmc-note-canvas mb-0">
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
      <div className="d-flex flex-column pmc-gap-4">
        <div className="d-flex align-items-center pmc-gap-3 pmc-radius pmc-p-35" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.6)" }}>
          <span className="pmc-icon-sq-lg d-grid pmc-tone-muted" style={{ background: "#fff", boxShadow: "var(--pmc-shadow-xs, 0 1px 2px rgba(16,24,40,0.06))" }}>
            <Icon name="globe" size={17} />
          </span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <p className="pmc-fs-135 fw-bold pmc-ink mb-0">{txn.merchant}</p>
            <p className="pmc-fs-115 fw-semibold pmc-muted mb-0">{txn.date} · {txn.time} · {card?.nickname} •• {card?.last4}</p>
          </div>
          <p className="pmc-num pmc-display pmc-fs-15 fw-bold pmc-ink mb-0">{kes(txn.amount)}</p>
        </div>

        <div>
          <FieldLabel>Dispute reason</FieldLabel>
          <div className="d-flex flex-column pmc-gap-15">
            {DISPUTE_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className="pmc-focus d-flex w-100 align-items-center pmc-gap-25 pmc-radius-sm pmc-px-35 pmc-py-25 text-start pmc-fs-125 fw-bold"
                style={
                  reason === r
                    ? { border: "1px solid var(--pmc-green)", background: "rgba(231,248,239,0.5)", color: "var(--pmc-green-ink)" }
                    : { border: "1px solid var(--pmc-line)", background: "#fff", color: "var(--pmc-ink-2)" }
                }
              >
                <span className={cn("pmc-radio-dot", reason === r && "on")} />
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
            className="form-control pmc-focus pmc-fs-125 fw-semibold pmc-ink"
            style={{ resize: "none" }}
          />
        </div>

        <label className="d-flex align-items-center pmc-gap-3 pmc-radius pmc-px-35 pmc-py-3 mb-0" style={{ border: "1px solid var(--pmc-line)", background: "#fff", cursor: "pointer" }}>
          <input type="checkbox" checked={freeze} onChange={(e) => setFreeze(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#12b76a" }} />
          <span>
            <span className="d-block pmc-fs-125 fw-bold pmc-ink">Freeze this card immediately</span>
            <span className="d-block pmc-fs-11 pmc-muted">Recommended if you suspect the card details were compromised.</span>
          </span>
        </label>

        <p className="pmc-note pmc-note-warn mb-0">
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
        <div className="d-flex flex-column align-items-center pmc-gap-3 pmc-py-6 text-center">
          <span className="pmc-done-icon"><Icon name="checkCircle" size={26} /></span>
          <p className="pmc-fs-13 pmc-muted mb-0" style={{ maxWidth: 340, lineHeight: 1.65 }}>
            Old card cancelled. A new virtual replacement was issued instantly — find it at the top of <strong className="pmc-ink">My Cards</strong>. {selected.length} transaction{selected.length === 1 ? "" : "s"} pushed to disputes.
          </p>
        </div>
      ) : step === 1 ? (
        <div className="d-flex flex-column pmc-gap-2">
          <FieldLabel>Which card is compromised?</FieldLabel>
          {cards.filter((c) => c.status !== "blocked" && c.status !== "delivering").map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCardId(c.id)}
              className={cn("pmc-choice pmc-focus", cardId === c.id && "on-danger")}
              style={{ alignItems: "center", padding: 12 }}
            >
              <span className={cn("pmc-radio-dot", cardId === c.id && "on-danger")} />
              <span className="flex-grow-1" style={{ minWidth: 0 }}>
                <span className="d-block pmc-fs-13 fw-bold pmc-ink text-start">{c.nickname}</span>
                <span className="d-block pmc-fs-11 fw-semibold pmc-faint text-start">{c.holder.toLowerCase()} · •• {c.last4}</span>
              </span>
              <Badge tone="muted" className="text-capitalize">{c.status}</Badge>
            </button>
          ))}
        </div>
      ) : step === 2 ? (
        <div className="d-flex flex-column pmc-gap-3">
          <FieldLabel hint={`${selected.length} selected`}>Flag unauthorised transactions</FieldLabel>
          <p className="pmc-mt-1 pmc-fs-115 pmc-muted mb-0">Select any transactions you did not make. They will be pushed to disputes automatically.</p>
          <div className="d-flex flex-column pmc-gap-15">
            {suspicious.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                className={cn("pmc-focus d-flex w-100 align-items-center pmc-gap-25 pmc-radius-sm pmc-px-3 pmc-py-25 text-start")}
                style={
                  selected.includes(t.id)
                    ? { border: "1px solid var(--pmc-danger)", background: "rgba(254,228,226,0.4)" }
                    : { border: "1px solid var(--pmc-line)", background: "#fff" }
                }
              >
                <span className={cn("pmc-check-box", selected.includes(t.id) && "on-danger")}>
                  <Icon name="check" size={11} />
                </span>
                <span className="flex-grow-1" style={{ minWidth: 0 }}>
                  <span className="d-flex align-items-center pmc-truncate pmc-fs-125 fw-bold pmc-ink">
                    {t.merchant} {t.intl && <Badge tone="info" className="ms-1">INTL</Badge>}
                  </span>
                  <span className="d-block pmc-fs-105 fw-semibold pmc-faint">{t.date} · {t.time}</span>
                </span>
                <span className="pmc-num pmc-fs-125 fw-bold pmc-ink">{kes(t.amount)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column pmc-gap-4">
          <div className="pmc-radius overflow-hidden" style={{ border: "1px solid var(--pmc-line)" }}>
            {[
              ["Permanent Card Block", card ? `${card.nickname} •• ${card.last4}` : "—", "Will apply"],
              ["Disputes Created", `${selected.length} item${selected.length === 1 ? "" : "s"}`, "Pushed to network"],
              ["Issue Replacement", "Virtual replacement", "Available instantly"],
            ].map(([k, v, note], i) => (
              <div key={k} className="pmc-kv pmc-py-3">
                <div>
                  <p className="fw-bold pmc-ink mb-0">{k}</p>
                  <p className="pmc-fs-11 fw-semibold pmc-muted mb-0">{v}</p>
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
              className="pmc-focus pmc-pin-input danger-focus"
              style={{ letterSpacing: "0.5em" }}
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
  const Kbd = ({ k }: { k: string }) => <kbd className="pmc-kbd">{k}</kbd>;
  return (
    <Modal open={open} onClose={closeModal} icon="zap" title="Keyboard shortcuts" subtitle="Move around the Command Center without touching the mouse." footer={<Btn onClick={closeModal}>Done</Btn>}>
      <div className="pmc-zebra d-flex flex-column pmc-gap-1">
        {[
          [["/"], "Focus search"],
          [["N"], "Issue a new card"],
          [["A"], "Configure alerts"],
          [["F"], "Freeze-all dialog"],
          [["1", "…", "7"], "Jump to section"],
          [["Esc"], "Close any modal or drawer"],
        ].map(([keys, desc], i) => (
          <div key={i} className="d-flex align-items-center justify-content-between rounded-2 pmc-px-2 pmc-py-2">
            <span className="pmc-fs-125 fw-semibold pmc-ink-2">{desc}</span>
            <span className="d-flex align-items-center pmc-gap-1">
              {(keys as string[]).map((k, ki) => (k === "…" ? <span key={ki} className="pmc-fs-11 pmc-faint">…</span> : <Kbd key={ki} k={k} />))}
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
      <div className="d-flex align-items-center justify-content-between pmc-px-5 pmc-py-4" style={{ borderBottom: "1px solid var(--pmc-line)" }}>
        <div>
          <p className="pmc-kicker pmc-faint mb-0">We're online now</p>
          <h3 className="pmc-display pmc-fs-16 fw-bold pmc-ls-tight pmc-ink mb-0">Card Support</h3>
        </div>
        <button type="button" onClick={closeDrawer} aria-label="Close support" className="pmc-icon-btn pmc-icon-btn-sm pmc-focus">
          <Icon name="x" size={17} />
        </button>
      </div>

      <div className="pmc-thin-scroll flex-grow-1 overflow-auto pmc-px-5 pmc-py-4">
        <div className="row g-2">
          {[
            { icon: "sms" as const, label: "Live chat", sub: "~3 min reply" },
            { icon: "phone" as const, label: "Call desk", sub: "+254 709 900 000" },
            { icon: "mail" as const, label: "Email", sub: "cards@paymo.app" },
          ].map((c) => (
            <div key={c.label} className="col-4">
              <button
                type="button"
                onClick={() => toast("info", `${c.label} requested`, "A card specialist will reach out shortly.")}
                className="pmc-card pmc-lift pmc-focus w-100 p-3 text-center"
              >
                <span className="pmc-icon-sq d-grid pmc-tone-green mx-auto"><Icon name={c.icon} size={16} /></span>
                <p className="pmc-mt-15 pmc-fs-115 fw-bold pmc-ink mb-0">{c.label}</p>
                <p className="pmc-fs-95 fw-semibold pmc-faint mb-0">{c.sub}</p>
              </button>
            </div>
          ))}
        </div>

        <p className="pmc-kicker pmc-faint pmc-mt-5 pmc-mb-2">Common questions</p>
        <div className="d-flex flex-column pmc-gap-15">
          {faqs.map((f, i) => (
            <div key={i} className="pmc-card overflow-hidden">
              <button
                type="button"
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="pmc-focus d-flex w-100 align-items-center pmc-gap-2 pmc-px-35 pmc-py-3 text-start"
                style={{ background: "none", border: "none" }}
                aria-expanded={faqOpen === i}
              >
                <span className="flex-grow-1 pmc-fs-125 fw-bold pmc-ink">{f.q}</span>
                <Icon name="chevDown" size={14} className={cn("pmc-faint flex-none", faqOpen === i && "rotate-180")} style={{ transition: "transform 0.2s ease" }} />
              </button>
              {faqOpen === i && (
                <p className="pmc-px-35 pmc-py-3 pmc-fs-12 pmc-muted mb-0" style={{ borderTop: "1px solid rgba(230,233,240,0.7)", lineHeight: 1.65 }}>
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="pmc-kicker pmc-faint pmc-mt-5 pmc-mb-2">Open a ticket</p>
        <div className="d-flex flex-column pmc-gap-25 pmc-radius pmc-p-35" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}>
          <div>
            <FieldLabel>Topic</FieldLabel>
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className="form-select pmc-focus pmc-fs-125 fw-bold pmc-ink">
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
              className="form-control pmc-focus pmc-fs-125 fw-semibold pmc-ink"
              style={{ resize: "none" }}
            />
          </div>
          <Btn
            icon="send"
            className="w-100"
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

        <p className="pmc-mt-4 d-flex align-items-center justify-content-center pmc-gap-15 text-center pmc-fs-11 fw-semibold pmc-faint">
          <span className="pmc-live-dot" /> All systems operational · status.paymo.app
        </p>
      </div>
    </Drawer>
  );
}
