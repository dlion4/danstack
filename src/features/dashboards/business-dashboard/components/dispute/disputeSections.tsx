import { useState } from "react";
import { fmtK, fmtKES } from "./data";
import { useStore } from "./store";
import { Badge, EmptyState, Kpi, Section, StatusBadge } from "./ui";

/* ==================================================================
   PAGE HEADER
================================================================== */
export function PageHeader() {
  const { openModal, disputes, risk } = useStore();
  const needsEvidence = disputes.filter((d) => d.status === "Needs Evidence").length;
  const totalHeld = disputes.filter((d) => d.status === "Needs Evidence" || d.status === "Under Arbitration").reduce((a, b) => a + b.amount, 0);

  return (
    <div className="pm-banner-hero p-4 d-flex flex-wrap align-items-center gap-3">
      <div className="flex-grow-1" style={{ minWidth: 280 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="pm-zone" style={{ background: "linear-gradient(90deg, #f04438, #b42318)" }}><i className="bi bi-shield-exclamation" /> RUN</span>
          <span className="badge-soft green">Page 7 · 7 sections</span>
        </div>
        <h1 className="mb-1" style={{ fontSize: "1.6rem", fontWeight: 800 }}>Dispute Management &amp; Support</h1>
        <p className="mb-0" style={{ color: "#b9c7d8", fontSize: "0.86rem", maxWidth: 640 }}>
          Defend customer chargebacks, M-Pesa reversals, and non-delivery claims.
          Automated Sendy waybill &amp; eTIMS receipt evidence submission keeps your CBK ratio safe.
        </p>
      </div>

      <div className="d-flex flex-column gap-2 align-items-lg-end">
        <div className="d-flex align-items-center gap-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14 }}>
          <div className="text-center">
            <div style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "Sora", color: "#7ee2b0" }}>{risk.disputeRatio}%</div>
            <div style={{ fontSize: "0.62rem", color: "#b9c7d8", letterSpacing: "0.08em" }}>CBK DISPUTE RATIO</div>
          </div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.18)" }} />
          <div>
            <div className="fw-bold" style={{ fontSize: "0.86rem" }}>{fmtKES(totalHeld)} held in reserve</div>
            <div className="pm-prod-meta" style={{ color: "#b9c7d8" }}>{needsEvidence} claim(s) require evidence within 48h</div>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("evidenceWizard", { disputeId: "DSP-2026-089" })}>
            <i className="bi bi-shield-check me-1" /> Defend Claim
          </button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("fileDisputeWizard")}>
            <i className="bi bi-plus-lg me-1" /> File Dispute
          </button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("openTicketWizard")}>
            <i className="bi bi-headset me-1" /> Support Ticket
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   7.1 DISPUTE COMMAND CENTER
================================================================== */
export function DisputeCommandCenter() {
  const { disputes, openModal, risk } = useStore();
  const activeDisputes = disputes.filter((d) => d.status === "Needs Evidence" || d.status === "Under Arbitration");
  const urgentDisputes = disputes.filter((d) => d.status === "Needs Evidence" && d.daysLeft <= 2);

  return (
    <>
      <Section no="7.1" title="Dispute &amp; Chargeback Command Center"
        sub="Real-time monitoring of M-Pesa 234 reversals, Visa card chargebacks, and PesaLink bank disputes."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("chargebackHealth")}>
              <i className="bi bi-activity me-1" /> CBK Risk Dashboard
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("evidenceVault")}>
              <i className="bi bi-folder-check me-1" /> Evidence Vault
            </button>
          </>
        }
      />

      <div className="pm-stat-grid">
        <Kpi icon="bi-shield-exclamation" iconBg="#fee4e2" label="Active Dispute Claims" value={String(activeDisputes.length)} delta={`${urgentDisputes.length} urgent deadline(s)`} footer="M-Pesa, Visa & PesaLink" />
        <Kpi icon="bi-cash-coin" iconBg="#fef0c7" label="Dispute Reserve (Held)" value={fmtKES(risk.atRiskAmount)} delta="held on reserve" footer="released when dispute is won" />
        <Kpi icon="bi-trophy" iconBg="var(--pm-green-soft)" label="30-Day Win Rate" value={`${risk.winRate}%`} delta={`${risk.won30d} won / ${risk.lost30d} lost`} footer="industry avg: 62%" />
        <Kpi icon="bi-activity" iconBg="#e8f1fe" label="CBK Dispute Ratio" value={`${risk.disputeRatio}%`} delta="safe zone" footer="CBK threshold limit: 0.90%" />
      </div>

      {urgentDisputes.length > 0 && (
        <div className="pm-card mt-3 d-flex flex-wrap align-items-center gap-3" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}>
          <span className="pm-dot-live" style={{ background: "var(--pm-danger)" }} />
          <div className="flex-grow-1">
            <b style={{ fontSize: "0.95rem" }} className="text-danger">Urgent: {urgentDisputes[0].id} needs evidence within {urgentDisputes[0].deadline}</b>
            <div className="pm-prod-meta">{urgentDisputes[0].customerName} ({urgentDisputes[0].customerPhone}) · {fmtKES(urgentDisputes[0].amount)} at risk</div>
          </div>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => openModal("evidenceWizard", { disputeId: urgentDisputes[0].id })}>
            <i className="bi bi-file-earmark-arrow-up me-1" /> Upload Evidence Now
          </button>
        </div>
      )}
    </>
  );
}

/* ==================================================================
   7.2 ACTIVE DISPUTES & CLAIMS DESK
================================================================== */
export function ActiveDisputesSection() {
  const { disputes, openModal, searchQuery } = useStore();
  const [tab, setTab] = useState<string>("All");

  const q = searchQuery.trim().toLowerCase();
  const filtered = disputes.filter((d) => {
    const matchesTab = tab === "All" || d.status === tab;
    const matchesSearch = !q || (d.id + d.customerName + d.txnId + d.reason).toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const counts = (s: string) => (s === "All" ? disputes.length : disputes.filter((d) => d.status === s).length);

  return (
    <>
      <Section no="7.2" title="Active Disputes &amp; Claims Desk"
        sub="Track, defend, and resolve customer claims across M-Pesa, Card, PesaLink, and Payment Links."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("bulkEvidenceWizard")}>
              <i className="bi bi-file-earmark-arrow-up me-1" /> Bulk Evidence
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("fileDisputeWizard")}>
              <i className="bi bi-plus-lg me-1" /> File Dispute
            </button>
          </>
        }
      />

      <div className="pm-card">
        <ul className="nav nav-tabs border-0 mb-3">
          {(["All", "Needs Evidence", "Under Arbitration", "Won", "Lost"] as const).map((t) => (
            <li className="nav-item" key={t}>
              <button type="button" className={`nav-link ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t} <span className={`badge ${tab === t ? "text-bg-dark" : "bg-light text-secondary border"}`}>{counts(t)}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead>
              <tr>
                <th>Dispute ID</th>
                <th>Channel / Txn</th>
                <th>Customer</th>
                <th>Type / Reason</th>
                <th className="text-end">Amount at Risk</th>
                <th>Deadline</th>
                <th>Status</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="row-select" onClick={() => openModal("disputeDrawer", { id: d.id })}>
                  <td><span className="pm-mono fw-bold" style={{ fontSize: "0.82rem" }}>{d.id}</span></td>
                  <td>
                    <Badge tone={d.channel === "M-Pesa" ? "green" : d.channel === "Card" ? "blue" : "violet"}>{d.channel}</Badge>
                    <div className="pm-mono pm-prod-meta mt-1">{d.txnId}</div>
                  </td>
                  <td>
                    <b>{d.customerName}</b>
                    <div className="pm-prod-meta">{d.customerPhone}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.82rem" }} className="fw-semibold">{d.type}</div>
                    <div className="pm-prod-meta text-truncate" style={{ maxWidth: 220 }}>{d.reason}</div>
                  </td>
                  <td className="text-end fw-bold text-danger" style={{ fontSize: "0.85rem" }}>
                    {fmtKES(d.amount)}
                  </td>
                  <td>
                    {d.daysLeft > 0 ? (
                      <Badge tone={d.daysLeft <= 2 ? "red" : "amber"}>{d.deadline}</Badge>
                    ) : (
                      <span className="pm-prod-meta">Closed</span>
                    )}
                  </td>
                  <td><StatusBadge status={d.status} /></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="d-flex gap-1">
                      {d.status === "Needs Evidence" && (
                        <button type="button" className="btn btn-sm btn-success" onClick={() => openModal("evidenceWizard", { disputeId: d.id })}>
                          Defend
                        </button>
                      )}
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("disputeDrawer", { id: d.id })}>
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && <EmptyState icon="bi-shield-check" title="No disputes found" text="No active dispute claims in this category." />}
      </div>
    </>
  );
}

/* ==================================================================
   7.3 EVIDENCE VAULT & PROOFS REPOSITORY
================================================================== */
export function EvidenceVaultSection() {
  const { evidenceVault, openModal } = useStore();

  return (
    <>
      <Section no="7.3" title="Evidence Vault &amp; Proofs Repository"
        sub="Timestamped Sendy waybills, eTIMS fiscal receipt hashes, and 3DS2 logs stored encrypted for court & bank arbitration."
        actions={
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("evidenceVault")}>
            <i className="bi bi-folder-check me-1" /> View Full Vault ({evidenceVault.length})
          </button>
        }
      />

      <div className="row g-3">
        {evidenceVault.slice(0, 4).map((e) => (
          <div className="col-lg-3 col-md-6" key={e.id}>
            <div className="pm-card pm-card-hover h-100" onClick={() => openModal("evidenceVault")}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <i className={`bi ${e.type.includes("Waybill") ? "bi-truck text-primary" : e.type.includes("eTIMS") ? "bi-shield-check text-danger" : "bi-chat-dots text-success"}`} style={{ fontSize: "1.4rem" }} />
                <Badge tone="green">Verified ✓</Badge>
              </div>
              <b style={{ fontSize: "0.85rem" }}>{e.title}</b>
              <div className="pm-mono pm-prod-meta mt-1">{e.fileName}</div>
              <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                <span className="pm-prod-meta">Case: <span className="pm-mono">{e.disputeId}</span></span>
                <span className="pm-prod-meta">{e.uploaded}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   7.4 PRE-DISPUTE SETTLEMENT & REVERSALS
================================================================== */
export function PreDisputeSettlementSection() {
  const { disputes, openModal } = useStore();
  const resettlable = disputes.filter((d) => d.status === "Needs Evidence");

  return (
    <>
      <Section no="7.4" title="Pre-Dispute Settlement &amp; Reversals"
        sub="Settle directly with buyers before formal card chargeback fees or M-Pesa arbitration delays occur."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("settlementWizard", { disputeId: "DSP-2026-089" })}>
            <i className="bi bi-hand-thumbs-up me-1" /> Offer Settlement
          </button>
        }
      />

      <div className="pm-card">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <b>Claims Eligible for Pre-Dispute Goodwill Settlement</b>
            <div className="pm-prod-meta">Offering partial refund or replacement before bank deadline avoids KES 2,500 arbiter fee</div>
          </div>
        </div>

        <div className="row g-3">
          {resettlable.map((d) => (
            <div className="col-md-6" key={d.id}>
              <div className="p-3 border rounded bg-white">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <b>{d.id} — {d.customerName}</b>
                    <div className="pm-prod-meta">{d.customerPhone} · {d.channel}</div>
                  </div>
                  <Badge tone="amber">Claim: {fmtKES(d.amount)}</Badge>
                </div>
                <div style={{ fontSize: "0.82rem" }} className="mb-3">{d.reason}</div>
                <button type="button" className="btn btn-sm btn-outline-primary w-100" onClick={() => openModal("settlementWizard", { disputeId: d.id })}>
                  <i className="bi bi-hand-thumbs-up me-1" /> Offer Partial Refund / Goodwill
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   7.5 SUPPORT TICKETS & ESCALATION DESK
================================================================== */
export function SupportTicketsSection() {
  const { tickets, openModal } = useStore();

  return (
    <>
      <Section no="7.5" title="Support Tickets &amp; KRA/CBK Escalations"
        sub="Direct escalation desk for eTIMS receipt errors, payout delays, and KYB limit increases."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("openTicketWizard")}>
            <i className="bi bi-headset me-1" /> New Ticket
          </button>
        }
      />

      <div className="pm-card">
        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Category</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Assigned Agent</th>
                <th>Status</th>
                <th>Last Update</th>
                <th style={{ width: 80 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="row-select" onClick={() => openModal("ticketDrawer", { id: t.id })}>
                  <td><span className="pm-mono fw-bold">{t.id}</span></td>
                  <td><Badge tone="slate">{t.category}</Badge></td>
                  <td><b style={{ fontSize: "0.82rem" }}>{t.subject}</b></td>
                  <td><Badge tone={t.priority === "Urgent" ? "red" : t.priority === "High" ? "amber" : "blue"}>{t.priority}</Badge></td>
                  <td><span className="pm-prod-meta">{t.agent}</span></td>
                  <td><StatusBadge status={t.status} /></td>
                  <td><span className="pm-prod-meta">{t.lastUpdate}</span></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("ticketDrawer", { id: t.id })}>
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   7.6 CHARGEBACK RISK & CBK RATIO MONITOR
================================================================== */
export function ChargebackRiskSection() {
  const { risk, openModal } = useStore();

  return (
    <>
      <Section no="7.6" title="Chargeback Risk &amp; CBK Ratio Monitor"
        sub="Compliance safeguards ensuring merchant account health stays within Central Bank of Kenya limits."
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("chargebackHealth")}>
            <i className="bi bi-activity me-1" /> Full Risk Analysis
          </button>
        }
      />

      <div className="pm-card">
        <div className="row g-3 align-items-center">
          <div className="col-md-4 text-center border-end">
            <div className="pm-kpi-label">Current Chargeback Ratio</div>
            <div className="display-5 fw-bold text-success my-1">{risk.disputeRatio}%</div>
            <div className="pm-prod-meta">CBK Ceiling: <b>{risk.cbkThreshold}%</b></div>
            <div className="progress mt-2 mx-auto" style={{ width: 160, height: 8 }}>
              <div className="progress-bar bg-success" style={{ width: `${(risk.disputeRatio / risk.cbkThreshold) * 100}%` }} />
            </div>
          </div>

          <div className="col-md-8">
            <div className="row g-2">
              <div className="col-6 col-md-3">
                <div className="p-2 border rounded text-center">
                  <div className="pm-kpi-label">30d Disputes</div>
                  <b className="fs-5">{risk.totalDisputes30d}</b>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 border rounded text-center">
                  <div className="pm-kpi-label">Claims Won</div>
                  <b className="fs-5 text-success">{risk.won30d}</b>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 border rounded text-center">
                  <div className="pm-kpi-label">Win Rate</div>
                  <b className="fs-5 text-primary">{risk.winRate}%</b>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-2 border rounded text-center">
                  <div className="pm-kpi-label">Amount at Risk</div>
                  <b className="fs-5 text-danger">{fmtK(risk.atRiskAmount)}</b>
                </div>
              </div>
            </div>

            <div className="pm-note soft mt-3 mb-0">
              <i className="bi bi-shield-check me-1 text-success" />
              <b>Status: EXCELLENT.</b> Your dispute ratio is 68% below CBK's maximum limit. Merchant settlement processing speed remains unaffected.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   WIZARD BANNER
================================================================== */
export function WizardsBanner() {
  const { openModal } = useStore();
  return (
    <div className="pm-card mt-4 d-flex flex-wrap align-items-center gap-3" style={{ background: "linear-gradient(90deg, #0b1322, #2d1215)", border: "none", color: "#fff" }}>
      <span style={{ fontSize: "1.6rem" }}>🧭</span>
      <div className="flex-grow-1" style={{ minWidth: 260 }}>
        <b style={{ fontSize: "0.95rem" }}>Guided Dispute &amp; Support Workflows</b>
        <div style={{ color: "#b9c7d8", fontSize: "0.8rem" }}>
          Defend Claim (5 steps) · Lodge Dispute (4) · Open Support Ticket (4) · Pre-Dispute Settlement (3) · Formal Arbitration (3) · Bulk Evidence Upload (3).
        </div>
      </div>
      <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("evidenceWizard", { disputeId: "DSP-2026-089" })}>
        <i className="bi bi-shield-check me-1" /> Defend Pending Claim
      </button>
    </div>
  );
}
