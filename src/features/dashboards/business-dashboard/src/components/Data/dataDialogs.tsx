import { useState } from "react";
import { useStore } from "./store";
import { Badge, Chip, Drawer, Modal, StatusBadge } from "./ui";

/* ==================================================================
   DATA REQUEST HISTORY MODAL
================================================================== */
export function RequestHistoryModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { dataRequests, downloadRequest, deleteRequest } = useStore();
  return (
    <Modal open onClose={onClose} title="Data request history" subtitle="Exports, access & deletion requests under Kenya DPA 2019" icon="bi-clock-history" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>Done</button>}
    >
      {dataRequests.map((r) => (
        <div key={r.id} className="d-flex align-items-start gap-3 p-3 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 12 }}>
          <span className="pm-kpi-icon" style={{ width: 38, height: 38, fontSize: "0.9rem", background: r.type === "Delete" ? "#fee4e2" : r.type === "Export" ? "var(--pm-green-soft)" : "#e8f1fe", color: r.type === "Delete" ? "var(--pm-danger)" : r.type === "Export" ? "var(--pm-green-dark)" : "var(--pm-blue)" }}>
            <i className={`bi ${r.type === "Delete" ? "bi-eraser" : r.type === "Export" ? "bi-download" : "bi-eye"}`} />
          </span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <b style={{ fontSize: "0.84rem" }}>{r.id}</b>
              <Badge tone={r.type === "Delete" ? "red" : r.type === "Export" ? "green" : "blue"}>{r.type}</Badge>
              <StatusBadge status={r.status} />
              {r.size && <Badge tone="slate">{r.size}</Badge>}
            </div>
            <div className="pm-prod-meta mt-1">{r.scope}</div>
            <div className="pm-prod-meta">Requested {r.requested}{r.completed ? ` · completed ${r.completed}` : ""}{r.note ? ` · ${r.note}` : ""}</div>
          </div>
          <div className="text-end d-flex flex-column gap-1">
            {r.status === "Available" && <button type="button" className="btn btn-sm btn-primary" onClick={() => downloadRequest(r.id)}><i className="bi bi-download me-1" />Download</button>}
            {r.status === "Processing" && <button type="button" className="btn btn-sm btn-outline-secondary" disabled>Processing…</button>}
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteRequest(r.id)}><i className="bi bi-x-circle" /></button>
          </div>
        </div>
      ))}
    </Modal>
  );
}

/* ==================================================================
   AUDIT TRAIL MODAL
================================================================== */
export function AuditLogModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { auditTrail, toast } = useStore();
  const [sev, setSev] = useState<"All" | "Info" | "Warning" | "Critical">("All");
  const list = auditTrail.filter((a) => sev === "All" || a.severity === sev);
  return (
    <Modal open onClose={onClose} title="Data & Privacy audit trail" subtitle="Immutable record of every access, export and consent change" icon="bi-clipboard-data" size="xl" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => toast("Full audit trail (12,408 events) exported as CSV.", "info", "Exported")}><i className="bi bi-download me-1" /> Export CSV</button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
        </>
      }
    >
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {(["All", "Info", "Warning", "Critical"] as const).map((s) => (
          <Chip key={s} on={sev === s} onClick={() => setSev(s)}>{s} {s !== "All" && `(${auditTrail.filter((a) => a.severity === s).length})`}</Chip>
        ))}
      </div>
      <div className="table-responsive" style={{ maxHeight: 440, overflowY: "auto" }}>
        <table className="table pm-table align-middle">
          <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>Category</th><th>Severity</th><th>IP</th></tr></thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id}>
                <td className="pm-prod-meta" style={{ whiteSpace: "nowrap" }}>{a.time}</td>
                <td><b style={{ fontSize: "0.8rem" }}>{a.actor}</b></td>
                <td style={{ fontSize: "0.8rem" }}>{a.action}</td>
                <td className="pm-prod-meta" style={{ maxWidth: 240 }}>{a.target}</td>
                <td><Badge tone="slate">{a.category}</Badge></td>
                <td><Badge tone={a.severity === "Critical" ? "red" : a.severity === "Warning" ? "amber" : "slate"}>{a.severity}</Badge></td>
                <td className="pm-mono pm-prod-meta">{a.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pm-note soft mt-2"><i className="bi bi-lock me-1" />Entries are append-only — nobody, including the Owner, can edit or delete them. Retained 7 years.</div>
    </Modal>
  );
}

/* ==================================================================
   PRIVACY POLICY MODAL
================================================================== */
export function PrivacyPolicyModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { policy, toast } = useStore();
  return (
    <Modal open onClose={onClose} title="Privacy policy" subtitle={policy.version} icon="bi-file-earmark-text" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={() => { toast("Policy reviewed and acknowledged.", "success", "Reviewed"); onClose(); }}>Acknowledge</button>}
    >
      <div className="pm-card mb-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
        <div className="row g-2">
          <div className="col-md-6"><div className="pm-kpi-label">Compliance</div><b style={{ fontSize: "0.82rem" }}>{policy.compliance}</b></div>
          <div className="col-md-6"><div className="pm-kpi-label">Data controller</div><b style={{ fontSize: "0.82rem" }}>{policy.dataController}</b></div>
          <div className="col-md-6"><div className="pm-kpi-label">DPO contact</div><b style={{ fontSize: "0.82rem" }} className="pm-mono">{policy.dpoContact}</b></div>
          <div className="col-md-6"><div className="pm-kpi-label">Last review</div><b style={{ fontSize: "0.82rem" }}>{policy.lastReview}</b></div>
        </div>
      </div>
      <div className="pm-kpi-label mb-2">Key points</div>
      {[
        "We collect only data necessary for running your business — no surveillance, no profiling for ads.",
        "Data is stored encrypted at rest (AES-256) and in transit (TLS 1.3).",
        "Retention: 7 years (KRA/CBK) · 5 years (KYB) · 2 years (marketing) · then permanently destroyed.",
        "Third-party sharing only with your consent or legal obligation (CBK/KRA).",
        "You have the right to access, rectify, export and request deletion of your data.",
        "Breaches are reported to the Office of the Data Protection Commissioner within 72 hours.",
      ].map((p, i) => (
        <div key={i} className="d-flex align-items-start gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
          <i className="bi bi-check-circle-fill text-primary mt-1" />
          <span style={{ fontSize: "0.82rem" }}>{p}</span>
        </div>
      ))}
      <div className="pm-note soft mt-3"><i className="bi bi-shield-check me-1" />Questions? Email {policy.dpoContact} — we respond within 48 hours.</div>
    </Modal>
  );
}

/* ==================================================================
   DATA SHARING / INTEGRATIONS MODAL
================================================================== */
export function IntegrationsDataModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { integrations, disconnectIntegration, reconnectIntegration } = useStore();
  return (
    <Modal open onClose={onClose} title="Third-party data sharing" subtitle="Who sees your data, what they access, and how to cut it off" icon="bi-puzzle" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>Done</button>}
    >
      {integrations.map((int) => (
        <div key={int.id} className="d-flex align-items-start gap-3 p-3 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 12 }}>
          <span className="pm-kpi-icon" style={{ width: 38, height: 38, fontSize: "0.9rem", background: int.color + "22", color: int.color }}>
            <i className={`bi ${int.icon}`} />
          </span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <b style={{ fontSize: "0.86rem" }}>{int.name}</b>
              <StatusBadge status={int.status} />
              <Badge tone={int.dataAccess === "Full Access" ? "green" : int.dataAccess === "Limited" ? "amber" : "blue"}>{int.dataAccess}</Badge>
            </div>
            <div className="pm-prod-meta mt-1">Last sync: {int.lastSync}</div>
            <div className="d-flex gap-1 flex-wrap mt-1">
              {int.scopes.map((s) => <span key={s} className="badge-soft slate" style={{ fontSize: "0.62rem" }}>{s}</span>)}
            </div>
          </div>
          {int.status === "Connected" ? (
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => disconnectIntegration(int.id)}><i className="bi bi-plug me-1" />Disconnect</button>
          ) : (
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => reconnectIntegration(int.id)}><i className="bi bi-plug-fill me-1" />Reconnect</button>
          )}
        </div>
      ))}
      <div className="pm-note soft mt-2"><i className="bi bi-shield-check me-1" />Disconnecting stops data sharing immediately. Integration settings are retained for 30 days in case you reconnect.</div>
    </Modal>
  );
}

/* ==================================================================
   ACCOUNT SECURITY MODAL
================================================================== */
export function AccountSecurityModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { updatePassword, revokeAllSessions } = useStore();
  return (
    <Modal open onClose={onClose} title="Account security" subtitle="Password, sessions and 2FA" icon="bi-shield-lock"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>Done</button>}
    >
      <div className="d-flex flex-column gap-3">
        <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-key-fill text-primary" />
            <b style={{ fontSize: "0.86rem" }}>Password</b>
            <Badge tone="green">Strong · changed 3 days ago</Badge>
          </div>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={updatePassword}>
            <i className="bi bi-arrow-repeat me-1" />Reset password (kills all sessions)
          </button>
        </div>
        <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-shield-lock-fill text-success" />
            <b style={{ fontSize: "0.86rem" }}>Two-factor authentication</b>
            <Badge tone="green">Enabled (TOTP)</Badge>
          </div>
          <div className="pm-prod-meta">Protected by authenticator app. Backup codes generated.</div>
        </div>
        <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <i className="bi bi-laptop text-primary" />
            <b style={{ fontSize: "0.86rem" }}>Active sessions</b>
            <Badge tone="blue">3 devices</Badge>
          </div>
          <button type="button" className="btn btn-sm btn-outline-warning" onClick={revokeAllSessions}>
            <i className="bi bi-box-arrow-right me-1" />Revoke all sessions
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ==================================================================
   HELP
================================================================== */
export function HelpModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal, toast } = useStore();
  return (
    <Modal open onClose={onClose} title="Help & shortcuts" subtitle="Data, Privacy & Account — every flow on this page" icon="bi-question-circle" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { toast("Guided tour started.", "info", "Tour"); onClose(); }}><i className="bi bi-compass me-1" /> Tour</button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Got it</button>
        </>
      }
    >
      <div className="row g-3">
        {[
          { icon: "bi-download", t: "Export Data (4 steps)", d: "Scope → categories → format → deliver. Encrypted ZIP.", act: () => openModal("exportWizard") },
          { icon: "bi-eraser", t: "Delete Request (4 steps)", d: "Scope → target → retention rules → confirm.", act: () => openModal("deletionWizard") },
          { icon: "bi-shield-check", t: "Consent Manager (4 steps)", d: "Overview → marketing → analytics → review.", act: () => openModal("consentManager") },
          { icon: "bi-x-circle", t: "Account Closure (4 steps)", d: "Impact → export first → retention → typed confirm.", act: () => openModal("accountClosure") },
          { icon: "bi-clipboard-data", t: "Audit Trail", d: "Every access, export, consent change — filter by severity.", act: () => openModal("auditLog") },
          { icon: "bi-puzzle", t: "Third-party Data Sharing", d: "See who accesses your data — disconnect any integration.", act: () => openModal("integrationsData") },
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
      <div className="pm-note soft mt-3"><i className="bi bi-keyboard me-1" /><span className="pm-kbd">Esc</span> close · <span className="pm-kbd">Enter</span> next step · <span className="pm-kbd">/</span> search</div>
    </Modal>
  );
}

/* ==================================================================
   ACTIVITY DRAWER
================================================================== */
export function ActivityDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { activity, toast } = useStore();
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" title="Data & privacy activity" subtitle="Every change to your data rights">
      {activity.map((a, i) => (
        <div key={i} className="pm-toprow">
          <span className="pm-kpi-icon" style={{ width: 34, height: 34, fontSize: "0.85rem", background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}><i className={`bi ${a.icon}`} /></span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 500 }}>{a.text}</div>
            <div className="pm-prod-meta">{a.time} · {a.by}</div>
          </div>
        </div>
      ))}
      <button type="button" className="btn btn-outline-secondary w-100 mt-3" onClick={() => toast("Activity log exported.", "info", "Exported")}><i className="bi bi-download me-1" /> Export activity</button>
    </Drawer>
  );
}
