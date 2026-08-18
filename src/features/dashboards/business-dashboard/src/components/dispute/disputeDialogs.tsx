import { useState } from "react";
import { CHARGEBACK_RISK, fmtKES } from "./data";
import { useStore } from "./store";
import { Badge, Chip, Drawer, Field, Modal, StatusBadge } from "./ui";

/* ==================================================================
   DISPUTE DRAWER — Full dispute claim profile & timeline
================================================================== */
export function DisputeDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { disputes, openModal } = useStore();
  const dispute = disputes.find((d) => d.id === String(payload.id)) ?? disputes[0];

  return (
    <Drawer open onClose={onClose} icon="bi-shield-exclamation" title={`Dispute ${dispute.id}`} subtitle={`${dispute.type} · ${dispute.channel}`}>
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={dispute.status} />
        <Badge tone="red">Amount: {fmtKES(dispute.amount)}</Badge>
        <Badge tone="amber">Fee at risk: {fmtKES(dispute.feeAtRisk)}</Badge>
        {dispute.daysLeft > 0 && <Badge tone="red"><i className="bi bi-clock-history me-1" />{dispute.deadline}</Badge>}
      </div>

      <div className="pm-card mb-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
        <div className="pm-kpi-label mb-1">Customer &amp; Transaction Details</div>
        <div className="fw-bold" style={{ fontSize: "0.9rem" }}>{dispute.customerName}</div>
        <div className="pm-prod-meta">{dispute.customerPhone} · Txn ID: <span className="pm-mono">{dispute.txnId}</span></div>
        <div className="mt-2" style={{ fontSize: "0.82rem" }}><b>Claim Reason:</b> {dispute.reason}</div>
      </div>

      <div className="pm-card mb-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
        <div className="pm-kpi-label mb-2">Attached Evidence Documents ({dispute.evidenceDocs.length})</div>
        {dispute.evidenceDocs.length === 0 ? (
          <div className="pm-prod-meta text-danger"><i className="bi bi-exclamation-triangle me-1" />No evidence attached yet. Upload waybill or receipt to defend claim.</div>
        ) : (
          dispute.evidenceDocs.map((doc, i) => (
            <div key={i} className="d-flex align-items-center justify-content-between py-1 border-bottom" style={{ fontSize: "0.8rem" }}>
              <span><i className="bi bi-file-earmark-check me-1 text-success" />{doc}</span>
              <Badge tone="green">Attached</Badge>
            </div>
          ))
        )}
      </div>

      <div className="pm-kpi-label mb-2">Case Timeline &amp; Log</div>
      <div className="pm-timeline mb-3">
        {dispute.timeline.map((item, idx) => (
          <div key={idx} className="pm-tl-item done">
            <div className="pm-tl-dot" />
            <div className="pm-tl-title">{item.title}</div>
            <div className="pm-tl-time">{item.time} · {item.note}</div>
          </div>
        ))}
      </div>

      <div className="row g-2 mt-3">
        {dispute.status === "Needs Evidence" && (
          <div className="col-12">
            <button type="button" className="btn btn-success btn-sm w-100" onClick={() => { onClose(); openModal("evidenceWizard", { disputeId: dispute.id }); }}>
              <i className="bi bi-file-earmark-arrow-up me-1" /> Defend &amp; Upload Evidence
            </button>
          </div>
        )}

        <div className="col-6">
          <button type="button" className="btn btn-outline-primary btn-sm w-100" onClick={() => { onClose(); openModal("settlementWizard", { disputeId: dispute.id }); }}>
            <i className="bi bi-hand-thumbs-up me-1" /> Offer Pre-Settlement
          </button>
        </div>

        <div className="col-6">
          <button type="button" className="btn btn-outline-warning btn-sm w-100" onClick={() => { onClose(); openModal("arbitrationWizard", { disputeId: dispute.id }); }}>
            <i className="bi bi-bank2 me-1" /> Formal Arbitration
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ==================================================================
   SUPPORT TICKET DRAWER — Message history & replies
================================================================== */
export function TicketDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { tickets, replyTicket, escalateTicket, closeTicket } = useStore();
  const ticket = tickets.find((t) => t.id === String(payload.id)) ?? tickets[0];
  const [replyText, setReplyText] = useState("");

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    replyTicket(ticket.id, replyText);
    setReplyText("");
  };

  return (
    <Drawer open onClose={onClose} icon="bi-headset" title={ticket.id} subtitle={`${ticket.subject} · ${ticket.category}`}>
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={ticket.status} />
        <Badge tone={ticket.priority === "Urgent" ? "red" : ticket.priority === "High" ? "amber" : "blue"}>{ticket.priority} Priority</Badge>
        <Badge tone="slate">Agent: {ticket.agent}</Badge>
      </div>

      <div className="pm-kpi-label mb-2">Ticket Conversation</div>
      <div className="d-flex flex-column gap-2 mb-3" style={{ maxHeight: 350, overflowY: "auto" }}>
        {ticket.messages.map((m, idx) => (
          <div key={idx} className={`p-2 rounded ${m.isAgent ? "bg-light border-start border-3 border-primary" : "bg-white border"}`}>
            <div className="d-flex justify-content-between mb-1">
              <b style={{ fontSize: "0.8rem" }}>{m.sender}</b>
              <span className="pm-prod-meta">{m.time}</span>
            </div>
            <div style={{ fontSize: "0.82rem" }}>{m.text}</div>
            {m.attachment && <div className="mt-1 pm-prod-meta"><i className="bi bi-paperclip me-1" />{m.attachment}</div>}
          </div>
        ))}
      </div>

      {ticket.status !== "Resolved" && (
        <Field label="Reply to Ticket" className="mb-3">
          <textarea className="form-control mb-2" rows={3} placeholder="Type message to PayMo support..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-primary btn-sm flex-grow-1" onClick={handleSendReply}>
              <i className="bi bi-send me-1" /> Send Reply
            </button>
            <button type="button" className="btn btn-outline-warning btn-sm" onClick={() => escalateTicket(ticket.id)}>
              <i className="bi bi-fire me-1" /> Escalate
            </button>
            <button type="button" className="btn btn-outline-success btn-sm" onClick={() => closeTicket(ticket.id)}>
              Close Ticket
            </button>
          </div>
        </Field>
      )}
    </Drawer>
  );
}

/* ==================================================================
   EVIDENCE VAULT MODAL
================================================================== */
export function EvidenceVaultModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { evidenceVault, openModal } = useStore();
  const [filterType, setFilterType] = useState<string>("All");

  const filtered = filterType === "All" ? evidenceVault : evidenceVault.filter((e) => e.type === filterType);

  return (
    <Modal open onClose={onClose} title="Evidence Vault &amp; Proofs" subtitle="Centralized repository of waybills, 3DS logs & eTIMS receipts" icon="bi-folder-check" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => { onClose(); openModal("bulkEvidenceWizard"); }}>
            <i className="bi bi-file-earmark-arrow-up me-1" /> Bulk Upload Evidence
          </button>
        </>
      }
    >
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {["All", "Waybill / Delivery Proof", "eTIMS Fiscal Receipt", "Customer WhatsApp Chat", "Terms of Service"].map((t) => (
          <Chip key={t} on={filterType === t} onClick={() => setFilterType(t)}>{t}</Chip>
        ))}
      </div>

      <div className="table-responsive">
        <table className="table pm-table align-middle">
          <thead><tr><th>Document</th><th>Type</th><th>Dispute ID</th><th>Uploaded</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td><b>{e.title}</b><div className="pm-mono pm-prod-meta">{e.fileName}</div></td>
                <td><Badge tone="slate">{e.type}</Badge></td>
                <td><span className="pm-mono">{e.disputeId}</span></td>
                <td><span className="pm-prod-meta">{e.uploaded}</span></td>
                <td>{e.verified ? <Badge tone="green">Verified ✓</Badge> : <Badge tone="amber">Pending</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

/* ==================================================================
   CHARGEBACK HEALTH MODAL
================================================================== */
export function ChargebackHealthModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  return (
    <Modal open onClose={onClose} title="Chargeback &amp; Dispute Health (CBK Compliance)" subtitle="Monitor your dispute ratio against CBK & Card Scheme thresholds" icon="bi-activity" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>Done</button>}
    >
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="pm-card text-center py-3" style={{ background: "var(--pm-green-soft)", border: "none" }}>
            <div className="pm-kpi-label">Dispute Ratio</div>
            <div className="display-6 fw-bold text-success">0.28%</div>
            <div className="pm-prod-meta">CBK Max Limit: <b>0.90%</b></div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="pm-card text-center py-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
            <div className="pm-kpi-label">30-Day Win Rate</div>
            <div className="display-6 fw-bold text-primary">{CHARGEBACK_RISK.winRate}%</div>
            <div className="pm-prod-meta">{CHARGEBACK_RISK.won30d} Won / {CHARGEBACK_RISK.lost30d} Lost</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="pm-card text-center py-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
            <div className="pm-kpi-label">Amount at Risk</div>
            <div className="display-6 fw-bold text-danger">{fmtKES(CHARGEBACK_RISK.atRiskAmount)}</div>
            <div className="pm-prod-meta">In Dispute Reserve</div>
          </div>
        </div>
      </div>

      <div className="pm-note soft">
        <i className="bi bi-shield-check me-1" />
        Your dispute ratio is well within CBK safety bounds (0.28% vs 0.90% limit). Keep submitting Sendy waybills and eTIMS receipts to maintain a high win rate.
      </div>
    </Modal>
  );
}

/* ==================================================================
   URGENT DEADLINES MODAL
================================================================== */
export function UrgentDeadlinesModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { disputes, openModal } = useStore();
  const urgentList = disputes.filter((d) => d.status === "Needs Evidence" && d.daysLeft <= 2);

  return (
    <Modal open onClose={onClose} title="Urgent Dispute Deadlines (&lt; 48 Hours)" subtitle="Upload evidence before deadline expires to prevent automatic loss" icon="bi-alarm" size="lg"
      footer={<button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>}
    >
      {urgentList.length === 0 ? (
        <div className="text-center py-4 text-success">
          <i className="bi bi-check-circle display-4" />
          <h5 className="mt-2">No Urgent Deadlines</h5>
          <div className="pm-prod-meta">All active disputes have sufficient evidence or time remaining.</div>
        </div>
      ) : (
        urgentList.map((d) => (
          <div key={d.id} className="p-3 border rounded mb-2 bg-light">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <b>{d.id} — {d.type}</b>
              <Badge tone="red">{d.deadline}</Badge>
            </div>
            <div className="pm-prod-meta mb-2">Customer: {d.customerName} ({d.customerPhone}) · Amount: <b>{fmtKES(d.amount)}</b></div>
            <button type="button" className="btn btn-sm btn-success" onClick={() => { onClose(); openModal("evidenceWizard", { disputeId: d.id }); }}>
              <i className="bi bi-file-earmark-arrow-up me-1" /> Upload Evidence Now
            </button>
          </div>
        ))
      )}
    </Modal>
  );
}

/* ==================================================================
   HELP & SHORTCUTS MODAL
================================================================== */
export function HelpModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal, toast } = useStore();
  return (
    <Modal open onClose={onClose} title="Help &amp; Dispute Shortcuts" subtitle="Dispute Management & Support — every flow on this page" icon="bi-question-circle" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { toast("Guided tour started — follow highlighted sections.", "info", "Guided Tour"); onClose(); }}>
            <i className="bi bi-compass me-1" /> Start Guided Tour
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Got it</button>
        </>
      }
    >
      <div className="row g-3">
        {[
          { icon: "bi-shield-check", t: "Defend Claim Wizard (5 steps)", d: "Review claim → upload waybill → attach eTIMS → statement → submit.", act: () => openModal("evidenceWizard") },
          { icon: "bi-shield-exclamation", t: "File Dispute (4 steps)", d: "Lookup transaction → select category → details → submit.", act: () => openModal("fileDisputeWizard") },
          { icon: "bi-headset", t: "Support Ticket Wizard (4 steps)", d: "Select category → details → set SLA priority → submit to engineers.", act: () => openModal("openTicketWizard") },
          { icon: "bi-hand-thumbs-up", t: "Pre-Dispute Settlement (3 steps)", d: "Offer partial refund or replacement before formal chargeback.", act: () => openModal("settlementWizard") },
          { icon: "bi-bank2", t: "Formal Arbitration (3 steps)", d: "Escalate case to Safaricom, DPO Visa or CBK Ombudsman.", act: () => openModal("arbitrationWizard") },
          { icon: "bi-file-earmark-arrow-up", t: "Bulk Evidence Upload (3 steps)", d: "Batch upload waybills & receipts for multiple claims.", act: () => openModal("bulkEvidenceWizard") },
        ].map((h, i) => (
          <div className="col-md-6" key={i}>
            <div className="pm-help-item">
              <i className={`bi ${h.icon}`} />
              <div>
                <b style={{ fontSize: "0.84rem" }}>{h.t}</b>
                <div className="pm-prod-meta">{h.d}</div>
                <button type="button" className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: "0.74rem" }} onClick={() => h.act()}>Open →</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-note soft mt-3">
        <i className="bi bi-keyboard me-1" />
        <span className="pm-kbd">Tab</span> move between fields · <span className="pm-kbd">Enter</span> next wizard step · <span className="pm-kbd">Esc</span> close modal · <span className="pm-kbd">/</span> focus search
      </div>
    </Modal>
  );
}

/* ==================================================================
   ACTIVITY DRAWER
================================================================== */
export function ActivityDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { activity, toast } = useStore();
  const [filter, setFilter] = useState("All");
  const kinds = ["All", "Disputes", "Evidence", "Tickets", "Arbitration"];
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" title="Dispute &amp; Support Log" subtitle="Audit trail of all claim defences, evidence uploads & tickets">
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {kinds.map((k) => <button key={k} type="button" className={`pm-chip ${filter === k ? "on" : ""}`} onClick={() => setFilter(k)}>{k}</button>)}
      </div>
      {activity.map((a, i) => (
        <div key={i} className="pm-toprow">
          <span className="pm-kpi-icon" style={{ width: 34, height: 34, fontSize: "0.85rem", background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}>
            <i className={`bi ${a.icon}`} />
          </span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 500 }}>{a.text}</div>
            <div className="pm-prod-meta">{a.time} · {a.by}</div>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline-secondary w-100 mt-3" onClick={() => toast("Dispute audit log exported as CSV.", "info", "Audit Exported")}>
        <i className="bi bi-download me-1" /> Export Audit Log
      </button>
    </Drawer>
  );
}
