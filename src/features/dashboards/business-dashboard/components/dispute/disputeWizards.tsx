import { useState } from "react";
import { fmtKES } from "./data";
import type { Priority, SupportCategory } from "./data";
import { useStore } from "./store";
import { Badge, Chip, Field, Modal, WizardShell } from "./ui";

/* ==================================================================
   DEFEND CLAIM & EVIDENCE WIZARD — 5 steps
   1. Claim Review → 2. Delivery Proof → 3. eTIMS/3DS Proof → 4. Defence Notes → 5. Submit to Arbiter
================================================================== */
export function EvidenceWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { disputes, submitEvidence, uploadEvidenceDoc, toast } = useStore();
  const preId = String(payload.disputeId ?? "DSP-2026-089");
  const dispute = disputes.find((d) => d.id === preId) ?? disputes[0];

  const [step, setStep] = useState(0);
  const [waybillNo, setWaybillNo] = useState("Sendy SK-88412");
  const [deliveryProofUploaded, setDeliveryProofUploaded] = useState(true);
  const [etimsHash] = useState("HASH-P05123-991204");
  const [etimsUploaded, setEtimsUploaded] = useState(true);
  const [chatLogUploaded, setChatLogUploaded] = useState(false);
  const [defenceNotes, setDefenceNotes] = useState("Goods delivered on time via Sendy courier (waybill SK-88412). Recipient Dennis Otieno signed for parcel on 16 Jan 14:00.");

  const steps = [
    { label: "Claim Review", icon: "bi-shield-exclamation" },
    { label: "Delivery Proof", icon: "bi-truck" },
    { label: "eTIMS & 3DS", icon: "bi-shield-check" },
    { label: "Defence Notes", icon: "bi-pencil-square" },
    { label: "Submit Defence", icon: "bi-send-check" },
  ];

  const handleFinish = () => {
    const docs = [];
    if (deliveryProofUploaded) docs.push(waybillNo);
    if (etimsUploaded) docs.push("eTIMS Hash " + etimsHash);
    if (chatLogUploaded) docs.push("WhatsApp Chat Log");

    submitEvidence(dispute.id, docs, defenceNotes);
    if (deliveryProofUploaded) {
      uploadEvidenceDoc({
        title: `Waybill ${waybillNo}`,
        type: "Waybill / Delivery Proof",
        fileName: `${waybillNo.replace(/ /g, "_")}.pdf`,
        disputeId: dispute.id,
      });
    }
    toast(`Defence submitted for ${dispute.id}. Status changed to Under Arbitration.`, "success", "Defence Submitted");
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={`Defend Claim — ${dispute.id}`} subtitle={`${dispute.type} · ${fmtKES(dispute.amount)} at risk · ${dispute.deadline}`} icon="bi-shield-check" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 4 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={handleFinish}>
              <i className="bi bi-send-check me-1" /> Submit Defence to {dispute.arbitrator}
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={steps} current={step} onStep={(i) => i < step && setStep(i)}>
        {/* Step 0 — Claim Review */}
        {step === 0 && (
          <div>
            <div className="pm-card mb-3" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <b className="text-danger" style={{ fontSize: "1rem" }}>{dispute.type}</b>
                  <div className="pm-prod-meta mt-1">Transaction ID: <span className="pm-mono">{dispute.txnId}</span> ({dispute.channel})</div>
                </div>
                <div className="text-end">
                  <div className="fw-bold fs-5 text-danger">{fmtKES(dispute.amount)}</div>
                  <Badge tone="red">{dispute.deadline}</Badge>
                </div>
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Customer</div><b>{dispute.customerName}</b><div className="pm-prod-meta">{dispute.customerPhone}</div></div></div>
              <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Arbiter / Channel</div><b>{dispute.arbitrator}</b></div></div>
            </div>

            <Field label="Customer Claim Reason">
              <div className="form-control bg-light" style={{ fontSize: "0.85rem" }}>{dispute.reason}</div>
            </Field>

            <div className="pm-note soft mt-3">
              <i className="bi bi-shield-check me-1 text-primary" />
              Winning this dispute returns <b>{fmtKES(dispute.amount)}</b> from the dispute hold reserve straight back into your available balance.
            </div>
          </div>
        )}

        {/* Step 1 — Delivery Proof */}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Courier / Delivery Method" className="col-md-6">
              <input className="form-control" value="Sendy Express" readOnly />
            </Field>
            <Field label="Waybill / Tracking Number" className="col-md-6">
              <input className="form-control pm-mono" value={waybillNo} onChange={(e) => setWaybillNo(e.target.value)} />
            </Field>

            <div className="col-12">
              <div className="p-3 border rounded" style={{ background: deliveryProofUploaded ? "var(--pm-green-soft)" : "#fafbfd" }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-file-earmark-pdf fs-4 text-primary" />
                    <div>
                      <b>Signed Delivery Note &amp; Courier Receipt</b>
                      <div className="pm-prod-meta">{waybillNo.replace(/ /g, "_")}.pdf (Verified Sendy API)</div>
                    </div>
                  </div>
                  <button type="button" className={`btn btn-sm ${deliveryProofUploaded ? "btn-success" : "btn-outline-primary"}`} onClick={() => setDeliveryProofUploaded(!deliveryProofUploaded)}>
                    {deliveryProofUploaded ? "Attached ✓" : "Upload File"}
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="pm-note soft">
                <i className="bi bi-truck me-1" />
                Safaricom and Visa arbiters require a timestamped GPS signature or signed waybill for delivery claims.
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — eTIMS & 3DS Proof */}
        {step === 2 && (
          <div className="row g-3">
            <div className="col-md-6">
              <div className="p-3 border rounded h-100" style={{ background: "#fafbfd" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-shield-check fs-4 text-danger" />
                  <b>eTIMS Fiscal Receipt</b>
                </div>
                <div className="pm-mono text-muted mb-2" style={{ fontSize: "0.75rem" }}>{etimsHash}</div>
                <Badge tone="green">KRA iTax Verified ✓</Badge>
                <div className="form-check mt-3">
                  <input className="form-check-input" type="checkbox" id="chkEtims" checked={etimsUploaded} onChange={(e) => setEtimsUploaded(e.target.checked)} />
                  <label className="form-check-label pm-prod-meta" htmlFor="chkEtims">Include eTIMS Receipt in defence pack</label>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 border rounded h-100" style={{ background: "#fafbfd" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-whatsapp fs-4 text-success" />
                  <b>WhatsApp Order Confirmation Log</b>
                </div>
                <div className="pm-prod-meta mb-2">Chat export showing buyer confirmed order &amp; address</div>
                <button type="button" className={`btn btn-sm ${chatLogUploaded ? "btn-success" : "btn-outline-secondary"}`} onClick={() => setChatLogUploaded(!chatLogUploaded)}>
                  {chatLogUploaded ? "Attached ✓" : "Attach Chat Log"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Defence Notes */}
        {step === 3 && (
          <div>
            <Field label="Formal Written Defence Statement" hint="State clearly why the claim is invalid based on attached evidence.">
              <textarea className="form-control" rows={4} value={defenceNotes} onChange={(e) => setDefenceNotes(e.target.value)} />
            </Field>

            <div className="pm-note mt-3">
              <i className="bi bi-info-circle me-1" />
              Tip: Safaricom reversal desk resolves 89% of claims within 48 hours when a Sendy waybill + eTIMS receipt are submitted together.
            </div>
          </div>
        )}

        {/* Step 4 — Submit Review */}
        {step === 4 && (
          <div>
            <div className="pm-card text-center mb-3" style={{ background: "var(--pm-green-soft)", border: "none" }}>
              <i className="bi bi-shield-check text-success display-4 mb-2" />
              <h5>Ready to submit defence to {dispute.arbitrator}</h5>
              <div className="pm-prod-meta">Case ID: <b>{dispute.id}</b> · Claim Amount: <b>{fmtKES(dispute.amount)}</b></div>
            </div>

            <div className="table-responsive">
              <table className="table pm-table align-middle">
                <thead><tr><th>Evidence Item</th><th>Type</th><th>Status</th></tr></thead>
                <tbody>
                  {deliveryProofUploaded && <tr><td>{waybillNo}</td><td>Delivery Proof</td><td><Badge tone="green">Attached</Badge></td></tr>}
                  {etimsUploaded && <tr><td>{etimsHash}</td><td>eTIMS Receipt</td><td><Badge tone="green">Verified</Badge></td></tr>}
                  {chatLogUploaded && <tr><td>Customer WhatsApp Log</td><td>Chat Log</td><td><Badge tone="green">Attached</Badge></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   FILE DISPUTE / REVERSAL CLAIM WIZARD — 4 steps
================================================================== */
export function FileDisputeWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { fileDispute } = useStore();
  const [step, setStep] = useState(0);
  const [txnId, setTxnId] = useState("QK88200192");
  const [channel, setChannel] = useState<"M-Pesa" | "Card" | "PesaLink" | "Payment Link">("M-Pesa");
  const [customerName, setCustomerName] = useState("James Mutua");
  const [customerPhone, setCustomerPhone] = useState("0701 884 532");
  const [amount, setAmount] = useState("9500");
  const [type, setType] = useState<any>("M-Pesa Reversal Claim");
  const [reason, setReason] = useState("M-Pesa system double-debit or customer reversal requested");
  const [notes, setNotes] = useState("Customer called 234 M-Pesa helpline requesting reversal. Need to block reversal or request proof.");

  const steps = [
    { label: "Transaction", icon: "bi-search" },
    { label: "Claim Type", icon: "bi-shield-exclamation" },
    { label: "Details & Reason", icon: "bi-pencil-square" },
    { label: "Submit", icon: "bi-send-check" },
  ];

  const handleFinish = () => {
    fileDispute({
      type,
      txnId,
      channel,
      customerName,
      customerPhone,
      amount: Number(amount) || 0,
      feeAtRisk: Math.round((Number(amount) || 0) * 0.03),
      reason,
      deadline: "In 3 days",
      arbitrator: channel === "M-Pesa" ? "Safaricom Reversal Desk" : "DPO Visa Arbitration",
      notes,
      evidenceDocs: [],
    });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Lodge New Dispute / Reversal Claim" subtitle="File a claim with Safaricom, Card Issuers or PesaLink" icon="bi-shield-exclamation" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-warning" onClick={handleFinish}>
              <i className="bi bi-shield-exclamation me-1" /> Submit Claim
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={steps} current={step} onStep={(i) => i < step && setStep(i)}>
        {/* Step 0 — Transaction */}
        {step === 0 && (
          <div className="row g-3">
            <Field label="Transaction Receipt Number (M-Pesa / DPO / PesaLink) *" className="col-md-6">
              <input className="form-control pm-mono" value={txnId} onChange={(e) => setTxnId(e.target.value)} />
            </Field>
            <Field label="Payment Rail Channel *" className="col-md-6">
              <select className="form-select" value={channel} onChange={(e) => setChannel(e.target.value as any)}>
                <option value="M-Pesa">M-Pesa Express / Till</option>
                <option value="Card">Card (Visa/Mastercard)</option>
                <option value="PesaLink">PesaLink Bank Transfer</option>
                <option value="Payment Link">Payment Link</option>
              </select>
            </Field>
            <Field label="Amount at Risk (KES) *" className="col-md-4">
              <input type="number" className="form-control" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Customer Name" className="col-md-4">
              <input className="form-control" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </Field>
            <Field label="Customer Phone" className="col-md-4">
              <input className="form-control" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            </Field>
          </div>
        )}

        {/* Step 1 — Claim Type */}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Dispute Category *" className="col-12">
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="M-Pesa Reversal Claim">M-Pesa Reversal Claim (Customer requested 234 reversal)</option>
                <option value="Card Chargeback">Card Chargeback (Fraud / Unauthorized)</option>
                <option value="Non-Delivery Claim">Non-Delivery Claim (Goods not received)</option>
                <option value="Quality / Damaged">Quality / Damaged Goods</option>
                <option value="PesaLink Dispute">PesaLink Bank Transfer Dispute</option>
                <option value="Fraudulent Transaction">Fraudulent / Unauthorized Transaction</option>
              </select>
            </Field>
            <div className="col-12">
              <div className="pm-note soft">
                <i className="bi bi-info-circle me-1" />
                When a customer requests an M-Pesa reversal via Safaricom, PayMo automatically places the funds in the Dispute Reserve until proof of delivery is provided.
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Dispute Reason Summary *" className="col-12">
              <input className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
            <Field label="Internal Notes &amp; Actions Required" className="col-12">
              <textarea className="form-control" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="pm-card" style={{ background: "#fafbfd", boxShadow: "none" }}>
            <h6 className="fw-bold mb-3">Claim Summary</h6>
            <div className="row g-2">
              <div className="col-6"><b>Txn ID:</b> {txnId}</div>
              <div className="col-6"><b>Channel:</b> {channel}</div>
              <div className="col-6"><b>Customer:</b> {customerName} ({customerPhone})</div>
              <div className="col-6"><b>Amount:</b> {fmtKES(Number(amount) || 0)}</div>
              <div className="col-12 mt-2"><b>Reason:</b> {reason}</div>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   OPEN SUPPORT TICKET WIZARD — 4 steps
================================================================== */
export function SupportTicketWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openTicket } = useStore();
  const [step, setStep] = useState(0);
  const [subject, setSubject] = useState("eTIMS Fiscal Receipt Timeout on Invoice INV-0092");
  const [category, setCategory] = useState<SupportCategory>("eTIMS Receipt Error");
  const [priority, setPriority] = useState<Priority>("High");
  const [text, setText] = useState("When finalizing payment for invoice INV-0092, the eTIMS API returned HTTP 504 Gateway Timeout. Customer needs official KRA receipt.");
  const [attachment, setAttachment] = useState("eTIMS_Error_Log_0092.txt");

  const steps = [
    { label: "Category", icon: "bi-tags" },
    { label: "Issue Details", icon: "bi-pencil-square" },
    { label: "Priority", icon: "bi-alarm" },
    { label: "Submit", icon: "bi-send-check" },
  ];

  const handleFinish = () => {
    openTicket(subject, category, priority, text, attachment);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Open PayMo Support Ticket" subtitle="Direct line to KRA, CBK and M-Pesa Integration Engineers" icon="bi-headset" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleFinish}>
              <i className="bi bi-send me-1" /> Submit Ticket
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={steps} current={step} onStep={(i) => i < step && setStep(i)}>
        {/* Step 0 — Category */}
        {step === 0 && (
          <div className="row g-3">
            <Field label="Support Category *" className="col-12">
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value as SupportCategory)}>
                <option value="eTIMS Receipt Error">eTIMS / KRA Fiscal Receipt Error</option>
                <option value="Payment Reversal">M-Pesa / Bank Payment Reversal</option>
                <option value="KYB / Limits">KYB Compliance &amp; Transaction Limits</option>
                <option value="Payout Delay">NCBA / Bank Payout Delay</option>
                <option value="API / Webhook">API &amp; Webhook Integration Issue</option>
              </select>
            </Field>
            <Field label="Subject / Brief Description *" className="col-12">
              <input className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
          </div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Detailed Explanation *" className="col-12">
              <textarea className="form-control" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
            </Field>
            <Field label="Attachment / Log File (Optional)" className="col-12">
              <input className="form-control pm-mono" value={attachment} onChange={(e) => setAttachment(e.target.value)} />
            </Field>
          </div>
        )}

        {/* Step 2 — Priority */}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Severity / Priority Level *" className="col-12">
              <div className="d-flex gap-2">
                {(["Low", "Medium", "High", "Urgent"] as Priority[]).map((p) => (
                  <Chip key={p} on={priority === p} onClick={() => setPriority(p)}>
                    {p}
                  </Chip>
                ))}
              </div>
            </Field>
            <div className="col-12">
              <div className="pm-note soft">
                <i className="bi bi-clock-history me-1" />
                Response SLAs: <b>Urgent</b> = &lt;30 mins · <b>High</b> = &lt;2 hours · <b>Medium/Low</b> = Same day.
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Submit */}
        {step === 3 && (
          <div className="pm-card text-center" style={{ background: "var(--pm-green-soft)", border: "none" }}>
            <i className="bi bi-headset display-4 text-success mb-2" />
            <h5>Ready to submit ticket to PayMo Engineering Desk</h5>
            <div className="pm-prod-meta mt-2">Subject: <b>{subject}</b> ({category})</div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   PRE-DISPUTE SETTLEMENT WIZARD — 3 steps
================================================================== */
export function PreDisputeSettlementWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { disputes, acceptSettlement } = useStore();
  const preId = String(payload.disputeId ?? "DSP-2026-089");
  const dispute = disputes.find((d) => d.id === preId) ?? disputes[0];

  const [step, setStep] = useState(0);
  const [offerType, setOfferType] = useState<"Full Refund" | "Partial Refund" | "Replacement + Voucher">("Partial Refund");
  const [refundAmount, setRefundAmount] = useState(Math.round(dispute.amount * 0.5));
  const [reason, setReason] = useState("Goodwill settlement to avoid arbitration fee & delay");

  return (
    <Modal open onClose={onClose} title={`Pre-Dispute Settlement — ${dispute.id}`} subtitle="Settle directly with buyer before formal bank arbitration" icon="bi-hand-thumbs-up" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
              Next <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              acceptSettlement(dispute.id, refundAmount, reason);
              onClose();
            }}>
              <i className="bi bi-check-circle me-1" /> Execute Settlement
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Settlement Type", icon: "bi-hand-thumbs-up" }, { label: "Refund Amount", icon: "bi-cash-coin" }, { label: "Confirm", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <Field label="Settlement Offer Type" className="col-12">
              <div className="d-flex gap-2">
                {(["Partial Refund", "Full Refund", "Replacement + Voucher"] as const).map((t) => (
                  <Chip key={t} on={offerType === t} onClick={() => {
                    setOfferType(t);
                    if (t === "Full Refund") setRefundAmount(dispute.amount);
                    else if (t === "Partial Refund") setRefundAmount(Math.round(dispute.amount * 0.5));
                  }}>
                    {t}
                  </Chip>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="row g-3">
            <Field label="Refund Amount (KES)" className="col-md-6">
              <input type="number" className="form-control" value={refundAmount} onChange={(e) => setRefundAmount(Number(e.target.value) || 0)} />
            </Field>
            <Field label="Settlement Note to Customer" className="col-12">
              <input className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="pm-note">
            <i className="bi bi-check-circle me-1 text-primary" />
            Refunding <b>{fmtKES(refundAmount)}</b> from dispute hold. This closes dispute <b>{dispute.id}</b> and protects your CBK chargeback rating.
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   ARBITRATION ESCALATION WIZARD — 3 steps
================================================================== */
export function ArbitrationWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { disputes, requestArbitration } = useStore();
  const preId = String(payload.disputeId ?? "DSP-2026-088");
  const dispute = disputes.find((d) => d.id === preId) ?? disputes[0];

  const [step, setStep] = useState(0);
  const [arbiter, setArbiter] = useState(dispute.arbitrator);
  const [notes, setNotes] = useState("Escalating to formal arbitration as buyer 3DS authentication log is verified and delivery note is signed.");

  return (
    <Modal open onClose={onClose} title={`Request Formal Arbitration — ${dispute.id}`} subtitle="Escalate to Card Scheme (Visa/Mastercard) or CBK Financial Ombudsman" icon="bi-bank2" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
              Next <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-warning" onClick={() => {
              requestArbitration(dispute.id, notes);
              onClose();
            }}>
              <i className="bi bi-bank2 me-1" /> Escalate Case
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Arbiter", icon: "bi-bank2" }, { label: "Escalation Grounds", icon: "bi-pencil-square" }, { label: "Review", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <Field label="Formal Arbitration Authority">
            <select className="form-select" value={arbiter} onChange={(e) => setArbiter(e.target.value)}>
              <option value="DPO Group / Visa Arbitration">DPO Group / Visa Arbitration Desk</option>
              <option value="Safaricom Reversal Desk">Safaricom M-Pesa Reversal Committee</option>
              <option value="CBK Financial Ombudsman">CBK Financial Ombudsman Service</option>
            </select>
          </Field>
        )}

        {step === 1 && (
          <Field label="Escalation Grounds &amp; Legal Summary">
            <textarea className="form-control" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        )}

        {step === 2 && (
          <div className="pm-note">
            <i className="bi bi-exclamation-triangle me-1" />
            Escalating case <b>{dispute.id}</b> to <b>{arbiter}</b>. Decision is binding. Estimated timeline is 5 business days.
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   BULK EVIDENCE UPLOAD WIZARD — 3 steps
================================================================== */
export function BulkEvidenceWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { disputes, toast } = useStore();
  const [step, setStep] = useState(0);
  const [selectedDisputes, setSelectedDisputes] = useState<string[]>(["DSP-2026-089"]);
  const [files] = useState(["Sendy_Batch_Waybills_Jan16.pdf", "eTIMS_Receipt_Batch_Jan16.pdf"]);

  return (
    <Modal open onClose={onClose} title="Bulk Evidence Uploader" subtitle="Batch upload delivery receipts & eTIMS proofs for multiple claims" icon="bi-file-earmark-arrow-up" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
              Next <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              toast(`Bulk evidence attached to ${selectedDisputes.length} dispute(s).`, "success", "Bulk Upload Complete");
              onClose();
            }}>
              <i className="bi bi-check2-circle me-1" /> Attach &amp; Submit All
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Select Claims", icon: "bi-check2-square" }, { label: "Upload Files", icon: "bi-paperclip" }, { label: "Confirm", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            <label className="form-label">Select Active Claims Needs Evidence</label>
            {disputes.filter((d) => d.status === "Needs Evidence").map((d) => (
              <div key={d.id} className="d-flex align-items-center gap-2 p-2 mb-2 border rounded">
                <input type="checkbox" checked={selectedDisputes.includes(d.id)} onChange={() => {
                  setSelectedDisputes(selectedDisputes.includes(d.id) ? selectedDisputes.filter((x) => x !== d.id) : [...selectedDisputes, d.id]);
                }} />
                <div><b>{d.id}</b> — {d.customerName} ({fmtKES(d.amount)})</div>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="p-4 text-center border rounded border-dashed bg-light mb-3">
              <i className="bi bi-cloud-arrow-up display-4 text-muted" />
              <div className="fw-bold mt-2">Drag &amp; Drop Batch Waybills / Receipts Here</div>
              <div className="pm-prod-meta">Supports PDF, PNG, JPG up to 25MB total</div>
            </div>
            {files.map((f, i) => (
              <div key={i} className="d-flex justify-content-between p-2 bg-white border rounded mb-1">
                <span><i className="bi bi-file-earmark-pdf me-2 text-primary" />{f}</span>
                <Badge tone="green">Uploaded ✓</Badge>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="pm-note">
            Attaching {files.length} evidence file(s) across {selectedDisputes.length} dispute case(s).
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}
