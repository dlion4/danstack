import { useMemo, useState } from "react";
import { BUSINESSES, MODULES, fmtKES } from "./data";
import { useStore } from "./store";
import { Badge, EmptyState, Kpi, Section, StatusBadge } from "./ui";

/* ==================================================================
   PAGE HEADER
================================================================== */
export function PageHeader() {
  const { members, roles, openModal } = useStore();
  const active = members.filter((m) => m.status === "Active").length;
  const pending = members.filter((m) => m.status === "Pending invite").length;
  const no2fa = members.filter((m) => m.status === "Active" && !m.twoFA).length;
  return (
    <div className="pm-banner-hero p-4 d-flex flex-wrap align-items-center gap-3">
      <div className="flex-grow-1" style={{ minWidth: 280 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="pm-zone" style={{ background: "linear-gradient(90deg, #475467, #101828)" }}><i className="bi bi-person-gear" /> RUN</span>
          <span className="badge-soft green">Page 6 · 6 sections</span>
        </div>
        <h1 className="mb-1" style={{ fontSize: "1.6rem", fontWeight: 800 }}>Team Management &amp; Roles</h1>
        <p className="mb-0" style={{ color: "#b9c7d8", fontSize: "0.86rem", maxWidth: 640 }}>
          Who has access, what they can touch, and who signs off on money leaving.
          Dangerous settings live here — every change is confirmed and audit-logged.
        </p>
      </div>
      <div className="d-flex flex-column gap-2 align-items-lg-end">
        <div className="d-flex align-items-center gap-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14 }}>
          <div className="text-center">
            <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "Sora", color: "#7ee2b0" }}>{active}</div>
            <div style={{ fontSize: "0.62rem", color: "#b9c7d8", letterSpacing: "0.08em" }}>ACTIVE MEMBERS</div>
          </div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.18)" }} />
          <div>
            <div className="fw-bold" style={{ fontSize: "0.86rem" }}>{roles.length} roles · {pending} pending invite{pending === 1 ? "" : "s"}</div>
            <div className="pm-prod-meta" style={{ color: "#b9c7d8" }}>{no2fa > 0 ? `⚠ ${no2fa} without 2FA` : "All members have 2FA ✓"}</div>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("inviteWizard")}><i className="bi bi-person-plus me-1" /> Invite Member</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("permMatrix")}><i className="bi bi-grid-3x3 me-1" /> Permission Matrix</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("pendingApprovals")}><i className="bi bi-hourglass-split me-1" /> Approvals</button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   6.1 TEAM COMMAND CENTER
================================================================== */
export function TeamCommandCenter() {
  const { members, roles, approvalRules, sessions, audit, openModal } = useStore();
  const active = members.filter((m) => m.status === "Active");
  const pending = members.filter((m) => m.status === "Pending invite");
  const no2fa = active.filter((m) => !m.twoFA);
  const twoFaPct = Math.round(((active.length - no2fa.length) / Math.max(1, active.length)) * 100);
  const riskySessions = sessions.filter((s) => s.risk !== "Low");
  const criticalEvents = audit.filter((a) => a.severity === "Critical");

  const alerts = [
    { tone: "red", icon: "bi-shield-exclamation", t: `${riskySessions.length} risky session(s)`, d: "Brian Kim signed in from Lagos, NG — blocked", act: () => openModal("sessions", { memberId: "u4" }), btn: "Review" },
    { tone: "amber", icon: "bi-person-lock", t: `${no2fa.length} members without 2FA`, d: "Enforce a policy with a grace period", act: () => openModal("twofaWizard"), btn: "Enforce" },
    { tone: "blue", icon: "bi-envelope-paper", t: `${pending.length} invites pending`, d: "One expires in 2 days — resend before it lapses", act: () => openModal("members"), btn: "View" },
    { tone: "violet", icon: "bi-hourglass-split", t: "3 approvals waiting on you", d: "KES 268,000 held until you sign off", act: () => openModal("pendingApprovals"), btn: "Approve" },
  ];

  return (
    <>
      <Section no="6.1" title="Team Command Center"
        sub="Access health at a glance — who's in, who's risky, and what's waiting on a signature."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("exportTeam")}>
              <i className="bi bi-download me-1" /> Export report
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("accessReview")}>
              <i className="bi bi-clipboard-check me-1" /> Access review
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("inviteWizard")}>
              <i className="bi bi-person-plus me-1" /> Invite member
            </button>
          </>
        }
      />
      <div className="pm-stat-grid">
        <Kpi icon="bi-people-fill" iconBg="var(--pm-green-soft)" label="Active members" value={String(active.length)} delta={`${pending.length} pending`} footer={`${members.length} total across ${BUSINESSES.length} businesses`} />
        <Kpi icon="bi-shield-lock-fill" iconBg={twoFaPct === 100 ? "var(--pm-green-soft)" : "#fee4e2"} label="2FA adoption" value={`${twoFaPct}%`} delta={no2fa.length ? `${no2fa.length} gap(s)` : "fully covered"} deltaGood={twoFaPct === 100} footer="target: 100% for anyone touching money" />
        <Kpi icon="bi-shield-fill-check" iconBg="#f0ebfe" label="Roles defined" value={String(roles.length)} delta={`${roles.filter((r) => !r.system).length} custom`} footer={`${MODULES.length} modules under control`} />
        <Kpi icon="bi-check2-square" iconBg="#e8f1fe" label="Approval rules" value={String(approvalRules.filter((r) => r.status === "Active").length)} delta={`${approvalRules.reduce((a, b) => a + b.triggered, 0)} triggers/mo`} footer="maker-checker on money out" />
        <Kpi icon="bi-clipboard-data" iconBg="#fef0c7" label="Critical audit events" value={String(criticalEvents.length)} delta="last 30 days" deltaGood={criticalEvents.length === 0} footer="blocked logins & role escalations" />
      </div>

      <div className="row g-3 mt-1">
        {alerts.map((a, i) => (
          <div className="col-lg-3 col-md-6" key={i}>
            <div className="pm-card pm-card-hover h-100" onClick={a.act} style={{ borderLeft: `4px solid ${a.tone === "red" ? "var(--pm-danger)" : a.tone === "amber" ? "var(--pm-warn)" : a.tone === "blue" ? "var(--pm-blue)" : "var(--pm-violet)"}` }}>
              <div className="d-flex align-items-start gap-2">
                <span className="pm-kpi-icon" style={{ width: 36, height: 36, fontSize: "0.9rem", background: a.tone === "red" ? "#fee4e2" : a.tone === "amber" ? "#fef0c7" : a.tone === "blue" ? "#e8f1fe" : "#f0ebfe", color: a.tone === "red" ? "var(--pm-danger)" : a.tone === "amber" ? "var(--pm-warn)" : a.tone === "blue" ? "var(--pm-blue)" : "var(--pm-violet)" }}>
                  <i className={`bi ${a.icon}`} />
                </span>
                <div className="flex-grow-1">
                  <div className="fw-semibold" style={{ fontSize: "0.82rem" }}>{a.t}</div>
                  <div className="pm-prod-meta">{a.d}</div>
                </div>
              </div>
              <div className="mt-2"><span className="badge-soft blue"><i className="bi bi-lightning-charge-fill me-1" />{a.btn} →</span></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   6.2 TEAM MEMBERS DIRECTORY
================================================================== */
export function MembersSection() {
  const { members, roles, openModal, searchQuery } = useStore();
  const [tab, setTab] = useState<"All" | "Active" | "Pending invite" | "Suspended">("All");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sel, setSel] = useState<string[]>([]);
  const q = searchQuery.trim().toLowerCase();

  const filtered = useMemo(() => members.filter((m) =>
    (tab === "All" || m.status === tab) &&
    (roleFilter === "all" || m.roleId === roleFilter) &&
    (!q || (m.name + m.email + m.department).toLowerCase().includes(q))
  ), [members, tab, roleFilter, q]);

  const counts = (s: string) => (s === "All" ? members.length : members.filter((m) => m.status === s).length);

  return (
    <>
      <Section no="6.2" title="Team Members"
        sub="Everyone with a login — their role, business scope, 2FA status and last activity."
        actions={
          <>
            {sel.length > 0 && (
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("bulkWizard", { ids: sel })}>
                <i className="bi bi-people me-1" /> Bulk change ({sel.length})
              </button>
            )}
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("businessAccess")}>
              <i className="bi bi-shield-lock me-1" /> Business access
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("inviteWizard")}>
              <i className="bi bi-person-plus me-1" /> Invite
            </button>
          </>
        }
      />
      <div className="pm-card">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <ul className="nav nav-tabs border-0 mb-0 flex-grow-1" style={{ minWidth: 300 }}>
            {(["All", "Active", "Pending invite", "Suspended"] as const).map((t) => (
              <li className="nav-item" key={t}>
                <button type="button" className={`nav-link ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                  {t} <span className={`badge ${tab === t ? "text-bg-dark" : "bg-light text-secondary border"}`}>{counts(t)}</span>
                </button>
              </li>
            ))}
          </ul>
          <select className="form-select form-select-sm" style={{ width: 180 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All roles</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>

        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead>
              <tr>
                <th style={{ width: 34 }}>
                  <input className="form-check-input" type="checkbox"
                    checked={filtered.length > 0 && filtered.every((m) => sel.includes(m.id))}
                    onChange={() => setSel(filtered.every((m) => sel.includes(m.id)) ? [] : filtered.filter((m) => m.roleId !== "owner").map((m) => m.id))} />
                </th>
                <th style={{ minWidth: 210 }}>Member</th>
                <th>Role</th>
                <th>Department</th>
                <th>Businesses</th>
                <th>2FA</th>
                <th>Last active</th>
                <th>Status</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const role = roles.find((r) => r.id === m.roleId);
                const scoped = Object.values(m.businesses).filter((v) => v !== "No Access").length;
                return (
                  <tr key={m.id} className="row-select" onClick={() => openModal("memberDrawer", { id: m.id })}>
                    <td onClick={(e) => e.stopPropagation()}>
                      <input className="form-check-input" type="checkbox" disabled={m.roleId === "owner"} checked={sel.includes(m.id)}
                        onChange={() => setSel((s) => s.includes(m.id) ? s.filter((x) => x !== m.id) : [...s, m.id])} />
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span className="pm-avatar" style={{ width: 36, height: 36, fontSize: "0.72rem", background: m.avatarColor }}>
                          {m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <div className="pm-prod-name text-truncate" style={{ maxWidth: 190 }}>{m.name}{m.roleId === "owner" && <i className="bi bi-star-fill ms-1" style={{ color: "#f79009", fontSize: "0.7rem" }} />}</div>
                          <div className="pm-prod-meta text-truncate" style={{ maxWidth: 190 }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><Badge tone="slate"><i className={`bi ${role?.icon} me-1`} />{role?.name}</Badge></td>
                    <td className="pm-prod-meta">{m.department}</td>
                    <td>
                      <div className="d-flex gap-1">
                        {BUSINESSES.map((b) => (
                          <span key={b.id} title={`${b.name}: ${m.businesses[b.id]}`}
                            className={`pm-biz-dot ${m.businesses[b.id] === "No Access" ? "off" : m.businesses[b.id] === "Admin" ? "admin" : m.businesses[b.id] === "Standard" ? "std" : "view"}`}>
                            {b.emoji}
                          </span>
                        ))}
                        <span className="pm-prod-meta ms-1">{scoped}/{BUSINESSES.length}</span>
                      </div>
                    </td>
                    <td>{m.twoFA ? <Badge tone="green"><i className="bi bi-shield-lock-fill me-1" />On</Badge> : <Badge tone="red"><i className="bi bi-shield-slash me-1" />Off</Badge>}</td>
                    <td className="pm-prod-meta" style={{ whiteSpace: "nowrap" }}>{m.lastActive}</td>
                    <td><StatusBadge status={m.status} /></td>
                    <td><button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }}><i className="bi bi-chevron-right" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState icon="bi-people" title="No members match" text="Try another tab, role filter or search term." />}
        <div className="pm-note soft mt-2"><i className="bi bi-info-circle me-1" />Row click opens the full member profile: role, business scope, sessions, login history and offboarding.</div>
      </div>
    </>
  );
}

/* ==================================================================
   6.3 ROLES & PERMISSIONS
================================================================== */
export function RolesSection() {
  const { roles, openModal } = useStore();
  return (
    <>
      <Section no="6.3" title="Roles &amp; Permissions"
        sub="Least privilege by design — six system roles plus any custom role you build."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("permMatrix")}>
              <i className="bi bi-grid-3x3 me-1" /> Full matrix
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("roleWizard")}>
              <i className="bi bi-shield-lock me-1" /> Create custom role
            </button>
          </>
        }
      />
      <div className="row g-3">
        {roles.map((r) => {
          const granted = MODULES.filter((m) => r.perms[m.id] !== "None").length;
          const sensitive = MODULES.filter((m) => m.sensitive && !["None", "View"].includes(r.perms[m.id])).length;
          return (
            <div className="col-lg-4 col-md-6" key={r.id}>
              <div className="pm-card pm-card-hover h-100" onClick={() => openModal("roleDrawer", { id: r.id })} style={{ borderTop: `3px solid ${r.color}` }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="pm-kpi-icon" style={{ width: 38, height: 38, background: r.color + "22", color: r.color }}><i className={`bi ${r.icon}`} /></span>
                  <div className="flex-grow-1">
                    <b style={{ fontSize: "0.88rem" }}>{r.name}</b>
                    <div className="pm-prod-meta">{r.memberCount} member{r.memberCount === 1 ? "" : "s"}</div>
                  </div>
                  {r.system ? <Badge tone="slate">System</Badge> : <Badge tone="violet">Custom</Badge>}
                </div>
                <div className="pm-prod-meta mb-2" style={{ minHeight: 32 }}>{r.desc}</div>
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.74rem" }}>
                  <span className="pm-prod-meta">Modules granted</span>
                  <b>{granted}/{MODULES.length}</b>
                </div>
                <div className="progress mb-2" style={{ height: 6 }}>
                  <div className="progress-bar" style={{ width: `${(granted / MODULES.length) * 100}%`, background: r.color }} />
                </div>
                <div className="d-flex gap-1 flex-wrap">
                  {r.canApprove ? <Badge tone="green">Approves {r.approvalLimit ? `≤ ${fmtKES(r.approvalLimit)}` : "any"}</Badge> : <Badge tone="slate">No approvals</Badge>}
                  {sensitive > 0 && <Badge tone="red">{sensitive} sensitive write{sensitive === 1 ? "" : "s"}</Badge>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="pm-note mt-3"><i className="bi bi-shield-check me-1" />Rule of thumb: if someone only needs to <b>see</b> a number, give them <b>View</b>. Write access to Cash, Books, Suppliers or Settings should be rare and deliberate.</div>
    </>
  );
}

/* ==================================================================
   6.4 APPROVAL WORKFLOWS
================================================================== */
export function ApprovalsSection() {
  const { approvalRules, members, openModal, toggleApprovalRule } = useStore();
  return (
    <>
      <Section no="6.4" title="Approval Workflows &amp; Thresholds"
        sub="Maker-checker on money leaving the business. Nobody approves their own request — ever."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("pendingApprovals")}>
              <i className="bi bi-hourglass-split me-1" /> Pending (3)
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("approvalWizard")}>
              <i className="bi bi-check2-square me-1" /> New rule
            </button>
          </>
        }
      />
      <div className="pm-card mb-3 d-flex flex-wrap align-items-center gap-3" style={{ background: "linear-gradient(110deg, #fff4e8, #fffaf3 60%, #fff)", borderColor: "#f6d7b4" }}>
        <span style={{ fontSize: "1.6rem" }}>⏳</span>
        <div className="flex-grow-1" style={{ minWidth: 240 }}>
          <b style={{ fontSize: "0.95rem" }}>3 requests waiting on your signature</b>
          <div className="pm-prod-meta">KES 268,000 held · oldest raised 2 hours ago by Mwangi Kamau</div>
        </div>
        <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("pendingApprovals")}>
          <i className="bi bi-check2-square me-1" /> Review &amp; approve
        </button>
      </div>
      <div className="pm-card">
        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead><tr><th>Rule</th><th>Trigger</th><th className="text-end">Threshold</th><th>Approvers</th><th>Mode</th><th>Scope</th><th className="text-end">Triggers</th><th>Status</th><th style={{ width: 40 }}></th></tr></thead>
            <tbody>
              {approvalRules.map((r) => (
                <tr key={r.id} className="row-select" onClick={() => openModal("approvalDetail", { id: r.id })}>
                  <td><b style={{ fontSize: "0.82rem" }}>{r.name}</b><div className="pm-prod-meta">{r.escalation}</div></td>
                  <td><Badge tone="slate">{r.trigger}</Badge></td>
                  <td className="text-end fw-bold" style={{ fontSize: "0.82rem" }}>{r.threshold ? fmtKES(r.threshold) : "Any"}</td>
                  <td>
                    <div className="d-flex">
                      {r.approvers.map((id, i) => {
                        const m = members.find((x) => x.id === id);
                        return <span key={id} className="pm-avatar" title={m?.name} style={{ width: 26, height: 26, fontSize: "0.58rem", background: m?.avatarColor, marginLeft: i ? -8 : 0, border: "2px solid #fff" }}>{m?.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>;
                      })}
                    </div>
                  </td>
                  <td><Badge tone={r.requireAll ? "violet" : "blue"}>{r.requireAll ? "ALL" : "ANY"}</Badge></td>
                  <td className="pm-prod-meta">{r.appliesTo}</td>
                  <td className="text-end pm-prod-meta">{r.triggered}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" checked={r.status === "Active"} onChange={() => toggleApprovalRule(r.id)} />
                    </div>
                  </td>
                  <td><button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }}><i className="bi bi-chevron-right" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-note soft mt-2"><i className="bi bi-shield-check me-1" />Approval ceilings also come from roles: a Store Manager can self-approve up to KES 50,000, but anything above hits these rules.</div>
      </div>
    </>
  );
}

/* ==================================================================
   6.5 SECURITY & SESSIONS
================================================================== */
export function SecuritySection() {
  const { members, sessions, loginEvents, policy, openModal, revokeSession } = useStore();
  const [tab, setTab] = useState<"sessions" | "logins">("sessions");
  const active = members.filter((m) => m.status === "Active");
  const no2fa = active.filter((m) => !m.twoFA);
  const risky = sessions.filter((s) => s.risk !== "Low");
  return (
    <>
      <Section no="6.5" title="Security, Sessions &amp; Devices"
        sub="Every signed-in device, every login attempt, and the org-wide policy that governs them."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("securityPolicy")}>
              <i className="bi bi-sliders me-1" /> Security policy
            </button>
            <button type="button" className={`btn btn-sm ${no2fa.length ? "btn-warning" : "btn-outline-secondary"}`} onClick={() => openModal("twofaWizard")}>
              <i className="bi bi-shield-check me-1" /> Enforce 2FA{no2fa.length ? ` (${no2fa.length})` : ""}
            </button>
          </>
        }
      />
      <div className="row g-3 mb-3">
        <div className="col-lg-4">
          <div className="pm-card h-100">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Policy at a glance</div>
            {[
              { t: "Two-factor authentication", on: policy.enforce2FA, d: policy.enforce2FA ? `Enforced · ${policy.gracePeriodDays}-day grace` : "Not enforced — recommended" },
              { t: "Strong passwords", on: policy.requireStrongPassword, d: `Min ${policy.passwordMinLength} chars, mixed` },
              { t: "Block new countries", on: policy.blockNewCountries, d: "Auto-blocks impossible travel" },
              { t: "IP allowlist", on: policy.ipAllowlist, d: policy.ipAllowlist ? policy.allowlistCidrs : "Off — any network can sign in" },
            ].map((p) => (
              <div key={p.t} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <i className={`bi ${p.on ? "bi-check-circle-fill text-primary" : "bi-circle"}`} style={{ color: p.on ? undefined : "#98a2b3" }} />
                <div className="flex-grow-1">
                  <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{p.t}</div>
                  <div className="pm-prod-meta">{p.d}</div>
                </div>
                <Badge tone={p.on ? "green" : "slate"}>{p.on ? "Enabled" : "Disabled"}</Badge>
              </div>
            ))}
            <button type="button" className="btn btn-outline-primary btn-sm w-100 mt-3" onClick={() => openModal("securityPolicy")}>
              <i className="bi bi-sliders me-1" /> Edit policy
            </button>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="pm-card h-100">
            <ul className="nav nav-tabs border-0 mb-2">
              <li className="nav-item"><button type="button" className={`nav-link ${tab === "sessions" ? "active" : ""}`} onClick={() => setTab("sessions")}>Active sessions <span className="badge bg-light text-secondary border ms-1">{sessions.length}</span></button></li>
              <li className="nav-item"><button type="button" className={`nav-link ${tab === "logins" ? "active" : ""}`} onClick={() => setTab("logins")}>Login history <span className="badge bg-light text-secondary border ms-1">{loginEvents.length}</span></button></li>
            </ul>
            {risky.length > 0 && (
              <div className="pm-note mb-2" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}>
                <i className="bi bi-shield-exclamation me-1" style={{ color: "var(--pm-danger)" }} />
                <b>{risky.length} risky session(s)</b> — new country or impossible travel.
                <button type="button" className="btn btn-link btn-sm p-0 ms-1 text-primary" onClick={() => openModal("sessions")}>Review all →</button>
              </div>
            )}
            {tab === "sessions" ? (
              <div className="table-responsive" style={{ maxHeight: 300, overflowY: "auto" }}>
                <table className="table pm-table align-middle">
                  <thead><tr><th>Member</th><th>Device</th><th>Location</th><th>Last seen</th><th>Risk</th><th></th></tr></thead>
                  <tbody>
                    {sessions.map((s) => {
                      const m = members.find((x) => x.id === s.memberId);
                      return (
                        <tr key={s.id}>
                          <td><div className="d-flex align-items-center gap-2"><span className="pm-avatar" style={{ width: 26, height: 26, fontSize: "0.58rem", background: m?.avatarColor }}>{m?.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span><b style={{ fontSize: "0.78rem" }}>{m?.name}</b></div></td>
                          <td className="pm-prod-meta">{s.device} · {s.browser}</td>
                          <td className="pm-prod-meta">{s.location}</td>
                          <td className="pm-prod-meta">{s.lastSeen}{s.current && <Badge tone="green" className="ms-1">current</Badge>}</td>
                          <td><Badge tone={s.risk === "High" ? "red" : s.risk === "Medium" ? "amber" : "slate"}>{s.risk}</Badge></td>
                          <td><button type="button" className="btn btn-sm btn-outline-danger" disabled={s.current} onClick={() => revokeSession(s.id)}><i className="bi bi-box-arrow-right" /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: 300, overflowY: "auto" }}>
                <table className="table pm-table align-middle">
                  <thead><tr><th>Time</th><th>Member</th><th>Result</th><th>Method</th><th>Location</th><th>Note</th></tr></thead>
                  <tbody>
                    {loginEvents.map((l) => {
                      const m = members.find((x) => x.id === l.memberId);
                      return (
                        <tr key={l.id}>
                          <td className="pm-prod-meta" style={{ whiteSpace: "nowrap" }}>{l.time}</td>
                          <td><b style={{ fontSize: "0.78rem" }}>{m?.name}</b></td>
                          <td><Badge tone={l.result === "Success" ? "green" : l.result === "Blocked" ? "red" : "amber"}>{l.result}</Badge></td>
                          <td className="pm-prod-meta">{l.method}</td>
                          <td className="pm-prod-meta">{l.location}</td>
                          <td className="pm-prod-meta" style={{ maxWidth: 200 }}>{l.note ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   6.6 AUDIT TRAIL
================================================================== */
export function AuditSection() {
  const { audit, openModal } = useStore();
  const critical = audit.filter((a) => a.severity === "Critical").length;
  const warning = audit.filter((a) => a.severity === "Warning").length;
  return (
    <>
      <Section no="6.6" title="Audit Trail"
        sub="Append-only record of every sensitive action. Nobody — not even the Owner — can edit or delete it."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("exportTeam")}>
              <i className="bi bi-download me-1" /> Export
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("auditLog")}>
              <i className="bi bi-clipboard-data me-1" /> Full audit log
            </button>
          </>
        }
      />
      <div className="pm-stat-grid mb-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
        <div className="pm-card py-3"><div className="pm-kpi-label">Events logged (30d)</div><div className="pm-kpi-value">{audit.length}</div><div className="pm-prod-meta">retained 7 years</div></div>
        <div className="pm-card py-3" style={{ background: critical ? "#fef6f5" : undefined }}><div className="pm-kpi-label">Critical</div><div className="pm-kpi-value" style={{ color: critical ? "var(--pm-danger)" : undefined }}>{critical}</div><div className="pm-prod-meta">blocked logins, role escalations</div></div>
        <div className="pm-card py-3"><div className="pm-kpi-label">Warnings</div><div className="pm-kpi-value" style={{ color: "var(--pm-warn)" }}>{warning}</div><div className="pm-prod-meta">permission & data changes</div></div>
        <div className="pm-card py-3"><div className="pm-kpi-label">Tamper-proof</div><div className="pm-kpi-value" style={{ fontSize: "1.3rem" }}>✓ Append-only</div><div className="pm-prod-meta">hash-chained entries</div></div>
      </div>
      <div className="pm-card">
        <div className="pm-kpi-label mb-2">Most recent events</div>
        {audit.slice(0, 6).map((a) => (
          <div key={a.id} className="d-flex align-items-start gap-3 py-2" style={{ borderBottom: "1px solid var(--pm-border)", cursor: "pointer" }} onClick={() => openModal("auditLog")}>
            <span className="pm-kpi-icon" style={{ width: 32, height: 32, fontSize: "0.8rem", background: a.severity === "Critical" ? "#fee4e2" : a.severity === "Warning" ? "#fef0c7" : "var(--pm-green-soft)", color: a.severity === "Critical" ? "var(--pm-danger)" : a.severity === "Warning" ? "var(--pm-warn)" : "var(--pm-green-dark)" }}>
              <i className={`bi ${a.severity === "Critical" ? "bi-exclamation-octagon-fill" : a.severity === "Warning" ? "bi-exclamation-triangle-fill" : "bi-info-circle-fill"}`} />
            </span>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{a.actor} · {a.action}</div>
              <div className="pm-prod-meta">{a.target} — {a.module} · <span className="pm-mono">{a.ip}</span></div>
            </div>
            <span className="pm-prod-meta" style={{ whiteSpace: "nowrap" }}>{a.time}</span>
          </div>
        ))}
        <button type="button" className="btn btn-outline-primary btn-sm w-100 mt-3" onClick={() => openModal("auditLog")}>
          <i className="bi bi-clipboard-data me-1" /> Open full audit log ({audit.length} events)
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
          Invite Member (5 steps) · Custom Role Builder (5) · Approval Rule (4) · Offboarding (4) · 2FA Enforcement (3) · Bulk Role Change (3). Dangerous actions require typed confirmation and are audit-logged forever.
        </div>
      </div>
      <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("inviteWizard")}>
        <i className="bi bi-person-plus me-1" /> Invite a member
      </button>
    </div>
  );
}
