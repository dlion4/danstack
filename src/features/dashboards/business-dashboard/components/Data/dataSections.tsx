import { useStore } from "./store";
import { Badge, EmptyState, Kpi, Section, StatusBadge } from "./ui";

/* ==================================================================
   PAGE HEADER
================================================================== */
export function PageHeader() {
  const { openModal, policy } = useStore();
  return (
    <div className="pm-banner-hero p-4 d-flex flex-wrap align-items-center gap-3">
      <div className="flex-grow-1" style={{ minWidth: 280 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="pm-zone" style={{ background: "linear-gradient(90deg, #475467, #101828)" }}><i className="bi bi-shield-lock" /> RUN</span>
          <span className="badge-soft green">Page 9 · Data, Privacy &amp; Account</span>
        </div>
        <h1 className="mb-1" style={{ fontSize: "1.6rem", fontWeight: 800 }}>Data, Privacy &amp; Account Management</h1>
        <p className="mb-0" style={{ color: "#b9c7d8", fontSize: "0.86rem", maxWidth: 640 }}>
          Your data, your rights. Export everything, control consents, manage third-party sharing,
          and govern your account — all compliant with the Kenya Data Protection Act 2019.
        </p>
      </div>
      <div className="d-flex flex-column gap-2 align-items-lg-end">
        <div className="d-flex align-items-center gap-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14 }}>
          <div className="text-center">
            <div style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "Sora", color: "#7ee2b0" }}>DPA</div>
            <div style={{ fontSize: "0.62rem", color: "#b9c7d8", letterSpacing: "0.08em" }}>KENYA 2019</div>
          </div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.18)" }} />
          <div>
            <div className="fw-bold" style={{ fontSize: "0.86rem" }}>{policy.version}</div>
            <div className="pm-prod-meta" style={{ color: "#b9c7d8" }}>DPA 2019 compliant · 7-yr retention locked</div>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("exportWizard")}><i className="bi bi-download me-1" /> Export Data</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("consentManager")}><i className="bi bi-shield-check me-1" /> Consent</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("auditLog")}><i className="bi bi-clipboard-data me-1" /> Audit Trail</button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   9.1 DATA COMMAND CENTER
================================================================== */
export function DataCommandCenter() {
  const { dataCategories, dataRequests, consents, integrations, openModal } = useStore();
  const activeReqs = dataRequests.filter((r) => r.status === "Processing");
  const granted = consents.filter((c) => c.status === "Granted");
  const connected = integrations.filter((i) => i.status === "Connected");
  const totalSize = dataCategories.reduce((acc, c) => acc + parseFloat(c.size), 0);
  return (
    <>
      <Section no="9.1" title="Data Command Center"
        sub="Your data footprint, active requests, consent status and compliance posture — at a glance."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("privacyPolicy")}><i className="bi bi-file-earmark-text me-1" /> Privacy policy</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("exportWizard")}><i className="bi bi-download me-1" /> Export data</button>
          </>
        }
      />
      <div className="pm-stat-grid">
        <Kpi icon="bi-database" iconBg="var(--pm-green-soft)" label="Data footprint" value={`${totalSize.toFixed(0)} MB`} delta="across 8 categories" footer="4,820 customers · 48K transactions" />
        <Kpi icon="bi-hourglass-split" iconBg="#e8f1fe" label="Active data requests" value={String(activeReqs.length)} delta={activeReqs.length ? "processing" : "all clear"} deltaGood={activeReqs.length === 0} footer={`${dataRequests.length} total requests`} />
        <Kpi icon="bi-shield-check" iconBg="#f0ebfe" label="Consents granted" value={`${granted.length}/${consents.length}`} delta={`${consents.filter((c) => c.withdrawable).length} withdrawable`} footer="per Kenya DPA 2019" />
        <Kpi icon="bi-puzzle" iconBg="#fef0c7" label="Data-sharing integrations" value={String(connected.length)} delta={`${integrations.length - connected.length} disconnected`} footer="full audit of scopes" />
      </div>
      <div className="pm-card mt-3">
        <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Data categories &amp; retention</div>
        <div className="row g-2">
          {dataCategories.map((c) => (
            <div className="col-lg-3 col-md-6" key={c.id}>
              <div className="p-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10, borderLeft: `3px solid ${c.color}` }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className={`bi ${c.icon}`} style={{ color: c.color, fontSize: "1.1rem" }} />
                  <b style={{ fontSize: "0.8rem" }} className="flex-grow-1">{c.name}</b>
                  {c.sensitive && <i className="bi bi-lock-fill text-danger" style={{ fontSize: "0.7rem" }} />}
                </div>
                <div className="pm-prod-meta">{c.count} · {c.size}</div>
                <Badge tone="slate" className="mt-1">Retain {c.retention}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   9.2 DATA EXPORT & DOWNLOAD CENTER
================================================================== */
export function ExportSection() {
  const { dataRequests, openModal, downloadRequest } = useStore();
  return (
    <>
      <Section no="9.2" title="Data Export &amp; Download Center"
        sub="Request, track and download your data — encrypted ZIP, valid for 7 days."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("exportWizard")}><i className="bi bi-download me-1" /> New export</button>
        }
      />
      <div className="pm-card">
        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead><tr><th>Request</th><th>Type</th><th>Scope</th><th>Requested</th><th>Completed</th><th>Size</th><th>Status</th><th style={{ width: 120 }}></th></tr></thead>
            <tbody>
              {dataRequests.map((r) => (
                <tr key={r.id}>
                  <td><span className="pm-mono fw-bold" style={{ fontSize: "0.8rem" }}>{r.id}</span></td>
                  <td><Badge tone={r.type === "Delete" ? "red" : r.type === "Export" ? "green" : "blue"}>{r.type}</Badge></td>
                  <td className="pm-prod-meta" style={{ maxWidth: 250 }}>{r.scope}</td>
                  <td className="pm-prod-meta">{r.requested}</td>
                  <td className="pm-prod-meta">{r.completed ?? "—"}</td>
                  <td className="pm-prod-meta">{r.size ?? "—"}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    {r.status === "Available" && <button type="button" className="btn btn-sm btn-primary" onClick={() => downloadRequest(r.id)}><i className="bi bi-download me-1" />Download</button>}
                    {r.status === "Processing" && <button type="button" className="btn btn-sm btn-outline-secondary" disabled>Processing…</button>}
                    {r.status === "Expired" && <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => openModal("exportWizard")}>Re-request</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {dataRequests.length === 0 && <EmptyState icon="bi-download" title="No data requests yet" text="Export or delete your data any time — Kenya DPA 2019 gives you the right." />}
        <button type="button" className="btn btn-link btn-sm p-0 text-primary mt-2" onClick={() => openModal("requestHistory")}>View full history →</button>
      </div>
    </>
  );
}

/* ==================================================================
   9.3 CONSENT MANAGEMENT
================================================================== */
export function ConsentSection() {
  const { consents, openModal, withdrawConsent, grantConsent } = useStore();
  return (
    <>
      <Section no="9.3" title="Consent Management"
        sub="Grant or withdraw consent for how PayMo uses your data — your rights under DPA 2019."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("consentManager")}><i className="bi bi-shield-check me-1" /> Manage all consents</button>
        }
      />
      <div className="row g-3">
        {consents.map((c) => (
          <div className="col-lg-6" key={c.id}>
            <div className="pm-card h-100" style={{ borderLeft: `3px solid ${c.status === "Granted" ? "var(--pm-green)" : "var(--pm-danger)"}` }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="pm-kpi-icon" style={{ width: 34, height: 34, fontSize: "0.85rem", background: c.status === "Granted" ? "var(--pm-green-soft)" : "#fee4e2", color: c.status === "Granted" ? "var(--pm-green-dark)" : "var(--pm-danger)" }}>
                  <i className={`bi ${c.status === "Granted" ? "bi-shield-check" : "bi-shield-x"}`} />
                </span>
                <div className="flex-grow-1">
                  <b style={{ fontSize: "0.86rem" }}>{c.scope}</b>
                  <div className="pm-prod-meta">{c.description}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="pm-prod-meta">Lawful basis: {c.lawful}</span>
                {c.withdrawable ? <Badge tone="green">Withdrawable</Badge> : <Badge tone="red">Required</Badge>}
              </div>
              <div className="d-flex gap-2">
                {c.status === "Granted" && c.withdrawable ? (
                  <button type="button" className="btn btn-sm btn-outline-danger flex-grow-1" onClick={() => withdrawConsent(c.id)}><i className="bi bi-shield-x me-1" />Withdraw</button>
                ) : c.status === "Withdrawn" ? (
                  <button type="button" className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => grantConsent(c.id)}><i className="bi bi-shield-check me-1" />Re-grant</button>
                ) : null}
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("consentManager")}>Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   9.4 PRIVACY POLICY & RETENTION
================================================================== */
export function PrivacySection() {
  const { policy, openModal } = useStore();
  return (
    <>
      <Section no="9.4" title="Privacy Policy &amp; Retention"
        sub="How PayMo handles your data — retention rules, lawful bases, and your rights."
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("privacyPolicy")}><i className="bi bi-file-earmark-text me-1" /> Read full policy</button>
        }
      />
      <div className="pm-card">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="pm-card h-100" style={{ boxShadow: "none", background: "#fafbfd" }}>
              <div className="pm-kpi-label mb-1">Policy version</div>
              <b style={{ fontSize: "0.9rem" }}>{policy.version}</b>
              <div className="pm-prod-meta mt-1">{policy.compliance}</div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="pm-card h-100" style={{ boxShadow: "none", background: "#fafbfd" }}>
              <div className="pm-kpi-label mb-1">Data controller</div>
              <b style={{ fontSize: "0.9rem" }}>{policy.dataController}</b>
              <div className="pm-prod-meta mt-1">DPO: <span className="pm-mono">{policy.dpoContact}</span></div>
            </div>
          </div>
        </div>
        <div className="pm-note soft mt-3"><i className="bi bi-clock-history me-1" /><b>Retention schedule:</b> {policy.retentionSchedule}</div>
        <div className="pm-note mt-2"><i className="bi bi-shield-check me-1 text-primary" />You have the right to access, rectify, export, and request deletion of your data. Breaches are reported to ODPC within 72 hours.</div>
      </div>
    </>
  );
}

/* ==================================================================
   9.5 AUDIT TRAIL & ACCESS LOG
================================================================== */
export function AuditSection() {
  const { auditTrail, openModal } = useStore();
  const critical = auditTrail.filter((a) => a.severity === "Critical").length;
  return (
    <>
      <Section no="9.5" title="Audit Trail &amp; Access Log"
        sub="Append-only record of every data access, export and consent change."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("auditLog")}><i className="bi bi-clipboard-data me-1" /> Full audit trail</button>
        }
      />
      <div className="pm-stat-grid mb-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <div className="pm-card py-3"><div className="pm-kpi-label">Events (30d)</div><div className="pm-kpi-value">{auditTrail.length}</div><div className="pm-prod-meta">retained 7 years</div></div>
        <div className="pm-card py-3" style={{ background: critical ? "#fef6f5" : undefined }}><div className="pm-kpi-label">Critical</div><div className="pm-kpi-value" style={{ color: critical ? "var(--pm-danger)" : undefined }}>{critical}</div><div className="pm-prod-meta">passwords, closures</div></div>
        <div className="pm-card py-3"><div className="pm-kpi-label">Warnings</div><div className="pm-kpi-value" style={{ color: "var(--pm-warn)" }}>{auditTrail.filter((a) => a.severity === "Warning").length}</div><div className="pm-prod-meta">consent changes, deletions</div></div>
        <div className="pm-card py-3"><div className="pm-kpi-label">Tamper-proof</div><div className="pm-kpi-value" style={{ fontSize: "1.2rem" }}>✓ Hash-chained</div><div className="pm-prod-meta">nobody can edit</div></div>
      </div>
      <div className="pm-card">
        {auditTrail.slice(0, 5).map((a) => (
          <div key={a.id} className="d-flex align-items-start gap-3 py-2" style={{ borderBottom: "1px solid var(--pm-border)", cursor: "pointer" }} onClick={() => openModal("auditLog")}>
            <span className="pm-kpi-icon" style={{ width: 32, height: 32, fontSize: "0.8rem", background: a.severity === "Critical" ? "#fee4e2" : a.severity === "Warning" ? "#fef0c7" : "var(--pm-green-soft)", color: a.severity === "Critical" ? "var(--pm-danger)" : a.severity === "Warning" ? "var(--pm-warn)" : "var(--pm-green-dark)" }}>
              <i className={`bi ${a.severity === "Critical" ? "bi-exclamation-octagon-fill" : a.severity === "Warning" ? "bi-exclamation-triangle-fill" : "bi-info-circle-fill"}`} />
            </span>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{a.actor} · {a.action}</div>
              <div className="pm-prod-meta">{a.target} — {a.category} · <span className="pm-mono">{a.ip}</span></div>
            </div>
            <span className="pm-prod-meta">{a.time}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   9.6 THIRD-PARTY DATA SHARING
================================================================== */
export function SharingSection() {
  const { integrations, openModal } = useStore();
  return (
    <>
      <Section no="9.6" title="Third-Party Data Sharing"
        sub="Every integration that touches your data — what it sees, and how to cut it off."
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("integrationsData")}><i className="bi bi-puzzle me-1" /> Manage all</button>
        }
      />
      <div className="row g-3">
        {integrations.map((int) => (
          <div className="col-lg-4 col-md-6" key={int.id}>
            <div className="pm-card pm-card-hover h-100" onClick={() => openModal("integrationsData")} style={{ borderTop: `3px solid ${int.color}` }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="pm-kpi-icon" style={{ width: 38, height: 38, fontSize: "0.95rem", background: int.color + "22", color: int.color }}>
                  <i className={`bi ${int.icon}`} />
                </span>
                <StatusBadge status={int.status} />
              </div>
              <b style={{ fontSize: "0.86rem" }}>{int.name}</b>
              <div className="pm-prod-meta">{int.dataAccess} · last sync {int.lastSync}</div>
              <div className="d-flex gap-1 flex-wrap mt-2">
                {int.scopes.map((s) => <span key={s} className="badge-soft slate" style={{ fontSize: "0.62rem" }}>{s}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   9.7 ACCOUNT MANAGEMENT
================================================================== */
export function AccountSection() {
  const { openModal, updatePassword, revokeAllSessions } = useStore();
  return (
    <>
      <Section no="9.7" title="Account Management"
        sub="Password, sessions, 2FA and the nuclear option — close your account."
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("accountSecurity")}><i className="bi bi-shield-lock me-1" /> Security settings</button>
        }
      />
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="pm-card h-100">
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-key-fill text-primary fs-5" />
              <b style={{ fontSize: "0.9rem" }}>Password</b>
              <Badge tone="green">Strong</Badge>
            </div>
            <div className="pm-prod-meta mb-2">Changed 3 days ago · meets all complexity requirements</div>
            <button type="button" className="btn btn-sm btn-outline-primary w-100" onClick={updatePassword}>
              <i className="bi bi-arrow-repeat me-1" />Reset password
            </button>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="pm-card h-100">
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-shield-lock-fill text-success fs-5" />
              <b style={{ fontSize: "0.9rem" }}>2FA</b>
              <Badge tone="green">Enabled</Badge>
            </div>
            <div className="pm-prod-meta mb-2">TOTP via authenticator app · backup codes generated</div>
            <button type="button" className="btn btn-sm btn-outline-secondary w-100" onClick={() => openModal("accountSecurity")}>
              <i className="bi bi-gear me-1" />Manage 2FA
            </button>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="pm-card h-100">
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-laptop text-primary fs-5" />
              <b style={{ fontSize: "0.9rem" }}>Sessions</b>
              <Badge tone="blue">3 active</Badge>
            </div>
            <div className="pm-prod-meta mb-2">MacBook Pro · iPhone 15 · Samsung A54</div>
            <button type="button" className="btn btn-sm btn-outline-warning w-100" onClick={revokeAllSessions}>
              <i className="bi bi-box-arrow-right me-1" />Revoke all
            </button>
          </div>
        </div>
      </div>
      <div className="pm-card mt-3 d-flex flex-wrap align-items-center gap-3" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}>
        <span style={{ fontSize: "1.4rem" }}>⚠️</span>
        <div className="flex-grow-1" style={{ minWidth: 240 }}>
          <b style={{ fontSize: "0.9rem" }} className="text-danger">Danger zone — Close account</b>
          <div className="pm-prod-meta">Permanently close TechSolutions Ltd. Data retained per KRA/CBK rules, then destroyed. This cannot be undone.</div>
        </div>
        <button type="button" className="btn btn-danger btn-sm" onClick={() => openModal("accountClosure")}>
          <i className="bi bi-x-circle me-1" /> Close account
        </button>
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
    <div className="pm-card mt-4 d-flex flex-wrap align-items-center gap-3" style={{ background: "linear-gradient(90deg, #0b1322, #1f2937)", border: "none", color: "#fff" }}>
      <span style={{ fontSize: "1.6rem" }}>🧭</span>
      <div className="flex-grow-1" style={{ minWidth: 260 }}>
        <b style={{ fontSize: "0.95rem" }}>Guided flows on this page</b>
        <div style={{ color: "#b9c7d8", fontSize: "0.8rem" }}>
          Export Data (4 steps) · Delete Request (4 steps) · Consent Manager (4 steps) · Account Closure (4 steps). All Kenya DPA 2019 compliant, audit-logged forever.
        </div>
      </div>
      <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("exportWizard")}>
        <i className="bi bi-download me-1" /> Export my data
      </button>
    </div>
  );
}
