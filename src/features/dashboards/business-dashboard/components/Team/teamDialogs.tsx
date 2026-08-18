import { useState } from "react";
import { BUSINESSES, MODULES, PERM_LEVELS, fmtKES } from "./data";
import type { AccessLevel, PermLevel } from "./data";
import { useStore } from "./store";
import { Badge, Chip, Drawer, Field, Modal, StatusBadge } from "./ui";

const permTone = (p: PermLevel) => (p === "Full" ? "green" : p === "Approve" ? "violet" : p === "Edit" ? "blue" : p === "Create" ? "green" : "slate");

/* ==================================================================
   MEMBER DRAWER
================================================================== */
export function MemberDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { members, roles, sessions, loginEvents, openModal, changeRole, toggle2FA, resendInvite } = useStore();
  const m = members.find((x) => x.id === String(payload.id));
  if (!m) return null;
  const role = roles.find((r) => r.id === m.roleId);
  const mySessions = sessions.filter((s) => s.memberId === m.id);
  const myLogins = loginEvents.filter((l) => l.memberId === m.id).slice(0, 4);
  const scoped = Object.entries(m.businesses).filter(([, v]) => v !== "No Access");

  return (
    <Drawer open onClose={onClose} icon="bi-person" title={m.name} subtitle={`${m.email} · ${m.department}`}>
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={m.status} />
        <Badge tone="slate"><i className={`bi ${role?.icon} me-1`} />{role?.name}</Badge>
        <Badge tone={m.twoFA ? "green" : "red"}><i className={`bi ${m.twoFA ? "bi-shield-lock-fill" : "bi-shield-slash"} me-1`} />2FA {m.twoFA ? "on" : "off"}</Badge>
      </div>

      {m.status === "Pending invite" && (
        <div className="pm-note mb-3">
          <i className="bi bi-envelope-paper me-1" />Invited by {m.invitedBy} · expires {m.inviteExpires}
          <div className="d-flex gap-2 mt-2">
            <button type="button" className="btn btn-sm btn-primary" onClick={() => resendInvite(m.id)}><i className="bi bi-arrow-repeat me-1" />Resend</button>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => openModal("revokeInvite", { id: m.id })}><i className="bi bi-x-circle me-1" />Revoke</button>
          </div>
        </div>
      )}

      <div className="row g-2 mb-3">
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Joined</div><b style={{ fontSize: "0.8rem" }}>{m.joined}</b></div></div>
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Last active</div><b style={{ fontSize: "0.8rem" }}>{m.lastActive}</b></div></div>
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Phone</div><b style={{ fontSize: "0.8rem" }}>{m.phone}</b></div></div>
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Sessions</div><b>{m.sessions}</b></div></div>
      </div>

      <Field label="Role" className="mb-3">
        <select className="form-select" value={m.roleId} disabled={m.roleId === "owner"} onChange={(e) => changeRole(m.id, e.target.value)}>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        {m.roleId === "owner" && <div className="pm-prod-meta mt-1">The Owner role can't be changed here — use Transfer Ownership.</div>}
      </Field>

      <div className="pm-kpi-label mb-2">Business access ({scoped.length})</div>
      {BUSINESSES.map((b) => (
        <div key={b.id} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
          <span>{b.emoji}</span>
          <span style={{ fontSize: "0.8rem" }} className="flex-grow-1">{b.name}</span>
          <StatusBadge status={m.businesses[b.id]} />
        </div>
      ))}
      <button type="button" className="btn btn-outline-secondary btn-sm w-100 mt-2" onClick={() => openModal("businessAccess", { memberId: m.id })}>
        <i className="bi bi-shield-lock me-1" /> Edit business access
      </button>

      {mySessions.length > 0 && (
        <>
          <div className="pm-kpi-label mt-3 mb-2">Active sessions</div>
          {mySessions.map((s) => (
            <div key={s.id} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
              <i className={`bi ${s.device.includes("iPhone") || s.device.includes("Samsung") || s.device.includes("Tecno") || s.device.includes("Android") ? "bi-phone" : "bi-laptop"}`} />
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>{s.device} {s.current && <Badge tone="green">this device</Badge>}</div>
                <div className="pm-prod-meta">{s.location} · {s.lastSeen}</div>
              </div>
              {s.risk !== "Low" && <Badge tone={s.risk === "High" ? "red" : "amber"}>{s.risk} risk</Badge>}
            </div>
          ))}
        </>
      )}

      {myLogins.length > 0 && (
        <>
          <div className="pm-kpi-label mt-3 mb-2">Recent logins</div>
          {myLogins.map((l) => (
            <div key={l.id} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
              <i className={`bi ${l.result === "Success" ? "bi-check-circle-fill text-primary" : l.result === "Blocked" ? "bi-shield-x" : "bi-x-circle"}`} style={{ color: l.result === "Success" ? undefined : "var(--pm-danger)" }} />
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.78rem" }}>{l.result} · {l.method}</div>
                <div className="pm-prod-meta">{l.location} · {l.time}{l.note ? ` · ${l.note}` : ""}</div>
              </div>
            </div>
          ))}
        </>
      )}

      <div className="row g-2 mt-3">
        <div className="col-6"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => openModal("sessions", { memberId: m.id })}><i className="bi bi-laptop me-1" /> Sessions</button></div>
        <div className="col-6"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => toggle2FA(m.id, !m.twoFA)}><i className="bi bi-shield-lock me-1" /> {m.twoFA ? "Reset 2FA" : "Require 2FA"}</button></div>
        <div className="col-6"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => openModal("resetPassword", { id: m.id })}><i className="bi bi-key me-1" /> Reset password</button></div>
        <div className="col-6"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => openModal("memberAudit", { id: m.id })}><i className="bi bi-clipboard-data me-1" /> Their audit</button></div>
        {m.roleId !== "owner" && (
          <>
            {m.status === "Active" ? (
              <div className="col-6"><button type="button" className="btn btn-outline-warning btn-sm w-100" onClick={() => openModal("suspend", { id: m.id })}><i className="bi bi-pause-circle me-1" /> Suspend</button></div>
            ) : m.status === "Suspended" ? (
              <div className="col-6"><button type="button" className="btn btn-outline-primary btn-sm w-100" onClick={() => openModal("reactivate", { id: m.id })}><i className="bi bi-play-circle me-1" /> Reactivate</button></div>
            ) : null}
            <div className="col-6"><button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => openModal("offboardWizard", { memberId: m.id })}><i className="bi bi-person-dash me-1" /> Offboard</button></div>
          </>
        )}
      </div>
    </Drawer>
  );
}

/* ==================================================================
   ROLE DRAWER
================================================================== */
export function RoleDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { roles, members, openModal, updateRolePerm, deleteRole } = useStore();
  const r = roles.find((x) => x.id === String(payload.id));
  if (!r) return null;
  const holders = members.filter((m) => m.roleId === r.id);
  const granted = MODULES.filter((m) => r.perms[m.id] !== "None").length;

  return (
    <Drawer open onClose={onClose} icon={r.icon} title={r.name} subtitle={`${holders.length} member(s) · ${granted}/${MODULES.length} modules granted`}>
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        {r.system ? <Badge tone="slate">System role</Badge> : <Badge tone="violet">Custom role</Badge>}
        {r.canApprove ? <Badge tone="green">Can approve {r.approvalLimit ? `≤ ${fmtKES(r.approvalLimit)}` : "any amount"}</Badge> : <Badge tone="slate">No approvals</Badge>}
      </div>
      <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />{r.desc}</div>

      <div className="pm-kpi-label mb-2">Module permissions {!r.system && <span className="pm-prod-meta">— tap to change</span>}</div>
      {MODULES.map((m) => (
        <div key={m.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
          <i className={`bi ${m.icon}`} style={{ color: "var(--pm-green-dark)", width: 20 }} />
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{m.name}{m.sensitive && <Badge tone="red" className="ms-1">sensitive</Badge>}</div>
          </div>
          {r.system ? (
            <StatusBadge status={r.perms[m.id]} />
          ) : (
            <select className="form-select form-select-sm" style={{ width: 110 }} value={r.perms[m.id]} onChange={(e) => updateRolePerm(r.id, m.id, e.target.value as PermLevel)}>
              {PERM_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          )}
        </div>
      ))}

      <div className="pm-kpi-label mt-3 mb-2">Members with this role</div>
      {holders.length === 0 && <div className="pm-prod-meta">Nobody yet — assign it from a member's profile.</div>}
      {holders.map((m) => (
        <div key={m.id} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)", cursor: "pointer" }} onClick={() => { onClose(); openModal("memberDrawer", { id: m.id }); }}>
          <span className="pm-avatar" style={{ width: 28, height: 28, fontSize: "0.62rem", background: m.avatarColor }}>{m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
          <b style={{ fontSize: "0.8rem" }} className="flex-grow-1">{m.name}</b>
          <StatusBadge status={m.status} />
        </div>
      ))}

      <div className="row g-2 mt-3">
        <div className="col-6"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { onClose(); openModal("permMatrix"); }}><i className="bi bi-grid-3x3 me-1" /> Compare roles</button></div>
        <div className="col-6"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { onClose(); openModal("roleWizard"); }}><i className="bi bi-copy me-1" /> Duplicate</button></div>
        {!r.system && (
          <div className="col-12"><button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => { deleteRole(r.id); onClose(); }}><i className="bi bi-trash me-1" /> Delete role</button></div>
        )}
      </div>
    </Drawer>
  );
}

/* ==================================================================
   PERMISSION MATRIX (roles × modules)
================================================================== */
export function PermMatrixModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { roles, updateRolePerm, openModal, toast, recordActivity } = useStore();
  const [onlySensitive, setOnlySensitive] = useState(false);
  const shown = onlySensitive ? MODULES.filter((m) => m.sensitive) : MODULES;
  return (
    <Modal open onClose={onClose} title="Permission matrix" subtitle="Every role × every module — the whole access model on one screen" icon="bi-grid-3x3" size="xl" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary me-auto" onClick={() => { onClose(); openModal("roleWizard"); }}>
            <i className="bi bi-plus-lg me-1" /> New custom role
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => toast("Matrix exported as CSV — hand it to your auditor.", "info", "Exported")}>
            <i className="bi bi-download me-1" /> Export
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { recordActivity("Permission matrix saved", "bi-grid-3x3"); toast("Matrix saved — changes apply on each member's next page load.", "success", "Permissions saved"); onClose(); }}>
            <i className="bi bi-check2 me-1" /> Save matrix
          </button>
        </>
      }
    >
      <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
        <Chip on={!onlySensitive} onClick={() => setOnlySensitive(false)}>All modules ({MODULES.length})</Chip>
        <Chip on={onlySensitive} onClick={() => setOnlySensitive(true)}>Sensitive only ({MODULES.filter((m) => m.sensitive).length})</Chip>
        <span className="ms-auto d-flex gap-1 flex-wrap">
          {PERM_LEVELS.map((l) => <span key={l} className={`badge-soft ${permTone(l)}`} style={{ fontSize: "0.6rem" }}>{l}</span>)}
        </span>
      </div>
      <div className="table-responsive" style={{ maxHeight: 460, overflowY: "auto" }}>
        <table className="table pm-table align-middle pm-matrix-table">
          <thead>
            <tr>
              <th style={{ minWidth: 190, position: "sticky", left: 0, background: "#fff", zIndex: 2 }}>Module</th>
              {roles.map((r) => (
                <th key={r.id} className="text-center" style={{ minWidth: 108 }}>
                  <i className={`bi ${r.icon}`} style={{ color: r.color }} /><br />
                  <span style={{ fontSize: "0.62rem" }}>{r.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((m) => (
              <tr key={m.id}>
                <td style={{ position: "sticky", left: 0, background: "#fff", zIndex: 1 }}>
                  <i className={`bi ${m.icon} me-2`} style={{ color: "var(--pm-green-dark)" }} />
                  <b style={{ fontSize: "0.78rem" }}>{m.name}</b>
                  {m.sensitive && <Badge tone="red" className="ms-1">!</Badge>}
                  <div className="pm-prod-meta">{m.zone}</div>
                </td>
                {roles.map((r) => (
                  <td key={r.id} className="text-center">
                    <select
                      className={`form-select form-select-sm pm-matrix-cell tone-${permTone(r.perms[m.id])}`}
                      value={r.perms[m.id]}
                      disabled={r.id === "owner"}
                      onChange={(e) => updateRolePerm(r.id, m.id, e.target.value as PermLevel)}
                    >
                      {PERM_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pm-note soft mt-2"><i className="bi bi-shield-check me-1" />Owner is locked to Full everywhere by design. Changes here are audit-logged and take effect on the member's next request.</div>
    </Modal>
  );
}

/* ==================================================================
   PER-BUSINESS ACCESS MATRIX
================================================================== */
export function BusinessAccessModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { members, setMemberBusinessAccess, recordActivity, toast } = useStore();
  const focus = String(payload.memberId ?? "");
  const list = focus ? members.filter((m) => m.id === focus) : members.filter((m) => m.status !== "Revoked");
  const levels: AccessLevel[] = ["No Access", "Viewer", "Standard", "Admin"];
  return (
    <Modal open onClose={onClose} title="Per-business access matrix" subtitle="Enforced at the API layer — a 403 before any data is queried" icon="bi-shield-lock" size="xl" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => { recordActivity("Business access matrix updated", "bi-shield-lock"); toast("Access matrix saved — permissions apply immediately.", "success", "Access updated"); onClose(); }}>
            <i className="bi bi-check2 me-1" /> Save access
          </button>
        </>
      }
    >
      <div className="table-responsive">
        <table className="table pm-table align-middle">
          <thead>
            <tr>
              <th style={{ minWidth: 170 }}>Member</th>
              {BUSINESSES.map((b) => <th key={b.id} className="text-center">{b.emoji}<br /><span style={{ fontSize: "0.62rem" }}>{b.name.split(" ")[0]}</span></th>)}
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className="pm-avatar" style={{ width: 28, height: 28, fontSize: "0.62rem", background: m.avatarColor }}>{m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                    <div><b style={{ fontSize: "0.8rem" }}>{m.name}</b><div className="pm-prod-meta">{m.department}</div></div>
                  </div>
                </td>
                {BUSINESSES.map((b) => (
                  <td key={b.id} className="text-center">
                    <select
                      className={`form-select form-select-sm pm-matrix-cell tone-${m.businesses[b.id] === "Admin" ? "red" : m.businesses[b.id] === "Standard" ? "green" : m.businesses[b.id] === "Viewer" ? "blue" : "slate"}`}
                      value={m.businesses[b.id]}
                      disabled={m.roleId === "owner"}
                      onChange={(e) => setMemberBusinessAccess(m.id, b.id, e.target.value as AccessLevel)}
                    >
                      {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </td>
                ))}
                <td className="pm-prod-meta" style={{ fontSize: "0.68rem", maxWidth: 140 }}>
                  {m.roleId === "owner" ? "Owner — locked to Admin everywhere" : m.roleId === "caretaker" ? "Property-scoped by design" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pm-note soft mt-2"><i className="bi bi-shield-check me-1" />Example: caretaker James requesting Kilimani House 2 data gets <b>403 Forbidden</b> before the query runs — and the attempt is audit-logged.</div>
    </Modal>
  );
}

/* ==================================================================
   SESSIONS & DEVICES
================================================================== */
export function SessionsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { sessions, members, revokeSession, revokeAllSessions } = useStore();
  const focus = String(payload.memberId ?? "");
  const [filter, setFilter] = useState<"all" | "risky">(focus ? "all" : "all");
  const list = sessions
    .filter((s) => (!focus || s.memberId === focus))
    .filter((s) => (filter === "all" ? true : s.risk !== "Low"));
  const member = members.find((m) => m.id === focus);
  return (
    <Modal open onClose={onClose} title={member ? `Sessions — ${member.name}` : "Active sessions & devices"} subtitle="Every signed-in device across the team · kill any of them instantly" icon="bi-laptop" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          {member && <button type="button" className="btn btn-outline-danger" onClick={() => { revokeAllSessions(member.id); onClose(); }}><i className="bi bi-box-arrow-right me-1" /> Revoke all for {member.name.split(" ")[0]}</button>}
        </>
      }
    >
      <div className="d-flex gap-2 mb-3">
        <Chip on={filter === "all"} onClick={() => setFilter("all")}>All sessions ({sessions.filter((s) => !focus || s.memberId === focus).length})</Chip>
        <Chip on={filter === "risky"} onClick={() => setFilter("risky")}>Risky only ({sessions.filter((s) => (!focus || s.memberId === focus) && s.risk !== "Low").length})</Chip>
      </div>
      {list.map((s) => {
        const m = members.find((x) => x.id === s.memberId);
        return (
          <div key={s.id} className="d-flex align-items-center gap-3 p-2 mb-2" style={{ border: `1px solid ${s.risk === "High" ? "#f6b7b0" : "var(--pm-border)"}`, borderRadius: 12, background: s.risk === "High" ? "#fef6f5" : "#fff" }}>
            <i className={`bi ${s.device.toLowerCase().includes("iphone") || s.device.toLowerCase().includes("android") || s.device.toLowerCase().includes("samsung") || s.device.toLowerCase().includes("tecno") ? "bi-phone" : "bi-laptop"}`} style={{ fontSize: "1.3rem", color: "var(--pm-green-dark)" }} />
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <b style={{ fontSize: "0.84rem" }}>{s.device}</b>
                {s.current && <Badge tone="green">Current device</Badge>}
                {s.risk !== "Low" && <Badge tone={s.risk === "High" ? "red" : "amber"}>{s.risk} risk</Badge>}
              </div>
              <div className="pm-prod-meta">{m?.name} · {s.browser} · {s.location} · <span className="pm-mono">{s.ip}</span></div>
              <div className="pm-prod-meta">Last seen {s.lastSeen}</div>
            </div>
            <button type="button" className="btn btn-sm btn-outline-danger" disabled={s.current} onClick={() => revokeSession(s.id)}>
              <i className="bi bi-box-arrow-right me-1" />{s.current ? "This device" : "Revoke"}
            </button>
          </div>
        );
      })}
      {list.length === 0 && <div className="pm-prod-meta text-center py-3">No sessions match.</div>}
      <div className="pm-note soft mt-2"><i className="bi bi-geo-alt me-1" />High-risk = new country or impossible travel. We block these automatically and notify the member.</div>
    </Modal>
  );
}

/* ==================================================================
   AUDIT LOG
================================================================== */
export function AuditLogModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { audit, toast } = useStore();
  const [sev, setSev] = useState<"All" | "Info" | "Warning" | "Critical">("All");
  const list = audit.filter((a) => sev === "All" || a.severity === sev);
  return (
    <Modal open onClose={onClose} title="Audit log" subtitle="Immutable record of every sensitive action — who, what, when, from where" icon="bi-clipboard-data" size="xl" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => toast("Full audit log (12,408 events) exported as CSV.", "info", "Exported")}>
            <i className="bi bi-download me-1" /> Export CSV
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
        </>
      }
    >
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {(["All", "Info", "Warning", "Critical"] as const).map((s) => (
          <Chip key={s} on={sev === s} onClick={() => setSev(s)}>
            {s} {s !== "All" && `(${audit.filter((a) => a.severity === s).length})`}
          </Chip>
        ))}
      </div>
      <div className="table-responsive" style={{ maxHeight: 440, overflowY: "auto" }}>
        <table className="table pm-table align-middle">
          <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>Module</th><th>Severity</th><th>IP</th></tr></thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id}>
                <td className="pm-prod-meta" style={{ whiteSpace: "nowrap" }}>{a.time}</td>
                <td><b style={{ fontSize: "0.8rem" }}>{a.actor}</b></td>
                <td style={{ fontSize: "0.8rem" }}>{a.action}</td>
                <td className="pm-prod-meta" style={{ maxWidth: 240 }}>{a.target}</td>
                <td><Badge tone="slate">{a.module}</Badge></td>
                <td><Badge tone={a.severity === "Critical" ? "red" : a.severity === "Warning" ? "amber" : "slate"}>{a.severity}</Badge></td>
                <td className="pm-mono pm-prod-meta">{a.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pm-note soft mt-2"><i className="bi bi-lock me-1" />Audit entries are append-only — nobody, including the Owner, can edit or delete them. Retained 7 years.</div>
    </Modal>
  );
}

/* ==================================================================
   MEMBER AUDIT (filtered)
================================================================== */
export function MemberAuditModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { audit, members } = useStore();
  const m = members.find((x) => x.id === String(payload.id));
  const list = audit.filter((a) => a.actor === m?.name);
  return (
    <Modal open onClose={onClose} title={`Audit trail — ${m?.name}`} subtitle="Everything this member has done" icon="bi-clipboard-data" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>Done</button>}
    >
      {list.length === 0 && <div className="pm-prod-meta text-center py-4">No recorded actions yet for this member.</div>}
      {list.map((a) => (
        <div key={a.id} className="d-flex align-items-start gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
          <Badge tone={a.severity === "Critical" ? "red" : a.severity === "Warning" ? "amber" : "slate"}>{a.severity}</Badge>
          <div className="flex-grow-1">
            <b style={{ fontSize: "0.82rem" }}>{a.action}</b>
            <div className="pm-prod-meta">{a.target} · {a.module}</div>
          </div>
          <span className="pm-prod-meta">{a.time}</span>
        </div>
      ))}
    </Modal>
  );
}

/* ==================================================================
   APPROVAL RULE DETAIL
================================================================== */
export function ApprovalDetailModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { approvalRules, members, toggleApprovalRule, deleteApprovalRule } = useStore();
  const r = approvalRules.find((x) => x.id === String(payload.id));
  if (!r) return null;
  return (
    <Modal open onClose={onClose} title={r.name} subtitle={`${r.trigger} · ${r.appliesTo}`} icon="bi-check2-square" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-danger me-auto" onClick={() => { deleteApprovalRule(r.id); onClose(); }}><i className="bi bi-trash me-1" /> Delete rule</button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { toggleApprovalRule(r.id); onClose(); }}>
            <i className={`bi ${r.status === "Active" ? "bi-pause" : "bi-play"} me-1`} /> {r.status === "Active" ? "Pause" : "Activate"}
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
        </>
      }
    >
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={r.status} />
        <Badge tone="ink">Above {fmtKES(r.threshold)}</Badge>
        <Badge tone={r.requireAll ? "violet" : "blue"}>{r.requireAll ? "ALL must approve" : "ANY approver"}</Badge>
        <Badge tone="slate">{r.triggered} triggers this month</Badge>
      </div>
      <div className="pm-flow-chain d-flex align-items-center gap-2 flex-wrap mb-3">
        <span className="pm-chain-node"><i className="bi bi-person me-1" />Requester</span>
        <i className="bi bi-arrow-right text-primary" />
        <span className="pm-chain-node warn"><i className="bi bi-hourglass-split me-1" />Awaiting approval</span>
        <i className="bi bi-arrow-right text-primary" />
        {r.approvers.map((id) => {
          const m = members.find((x) => x.id === id);
          return <span key={id} className="pm-chain-node ok"><i className="bi bi-check2 me-1" />{m?.name.split(" ")[0] ?? id}</span>;
        })}
        <i className="bi bi-arrow-right text-primary" />
        <span className="pm-chain-node done"><i className="bi bi-cash-stack me-1" />Released</span>
      </div>
      <div className="row g-2">
        <div className="col-md-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Escalation</div><b style={{ fontSize: "0.8rem" }}>{r.escalation}</b></div></div>
        <div className="col-md-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Scope</div><b style={{ fontSize: "0.8rem" }}>{r.appliesTo}</b></div></div>
      </div>
      <div className="pm-note soft mt-3"><i className="bi bi-shield-check me-1" />Maker-checker enforced: the person who raises the request can never approve it — even if they're listed above.</div>
    </Modal>
  );
}

/* ==================================================================
   PENDING APPROVALS
================================================================== */
export function PendingApprovalsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity, pushAudit } = useStore();
  const [items, setItems] = useState([
    { id: "pa1", what: "Supplier payment — Kirinyaga Farmers Co-op", amount: 148000, by: "Mwangi Kamau", when: "2 hours ago", rule: "Supplier payments over KES 100,000" },
    { id: "pa2", what: "Stock write-off — expired chai batch", amount: 24000, by: "Brian Kim", when: "Yesterday", rule: "Stock write-offs over KES 20,000" },
    { id: "pa3", what: "Customer refund — ORD-1092", amount: 96000, by: "Grace Njeri", when: "Yesterday", rule: "Refunds over KES 10,000" },
  ]);
  const act = (id: string, approve: boolean) => {
    const it = items.find((x) => x.id === id);
    setItems((prev) => prev.filter((x) => x.id !== id));
    recordActivity(`${approve ? "Approved" : "Rejected"} ${it?.what} (${fmtKES(it?.amount ?? 0)})`, approve ? "bi-check2-circle" : "bi-x-circle");
    pushAudit("Wanjiku Maina", approve ? "Approved request" : "Rejected request", `${it?.what} · ${fmtKES(it?.amount ?? 0)}`, "Approvals", "Warning");
    toast(`${it?.what} ${approve ? "approved — payment releasing now." : "rejected — requester notified."}`, approve ? "success" : "warning", approve ? "Approved" : "Rejected");
  };
  const total = items.reduce((a, b) => a + b.amount, 0);
  return (
    <Modal open onClose={onClose} title="Pending your approval" subtitle={`${items.length} request(s) · ${fmtKES(total)} total`} icon="bi-hourglass-split" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>Done</button>}
    >
      {items.length === 0 && (
        <div className="text-center py-4">
          <i className="bi bi-check-circle-fill" style={{ fontSize: "2.6rem", color: "var(--pm-green)" }} />
          <h6 className="mt-2">All clear 🎉</h6>
          <p className="pm-prod-meta">Nothing waiting on you. Approvals appear here the moment a rule triggers.</p>
        </div>
      )}
      {items.map((i) => (
        <div key={i.id} className="pm-card mb-2" style={{ boxShadow: "none", border: "1px solid var(--pm-border)" }}>
          <div className="d-flex align-items-start gap-2 mb-2">
            <i className="bi bi-hourglass-split" style={{ color: "var(--pm-warn)", fontSize: "1.1rem" }} />
            <div className="flex-grow-1">
              <b style={{ fontSize: "0.86rem" }}>{i.what}</b>
              <div className="pm-prod-meta">Raised by {i.by} · {i.when} · rule: {i.rule}</div>
            </div>
            <b>{fmtKES(i.amount)}</b>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-sm btn-success flex-grow-1" onClick={() => act(i.id, true)}><i className="bi bi-check2 me-1" />Approve</button>
            <button type="button" className="btn btn-sm btn-outline-danger flex-grow-1" onClick={() => act(i.id, false)}><i className="bi bi-x-lg me-1" />Reject</button>
          </div>
        </div>
      ))}
    </Modal>
  );
}

/* ==================================================================
   SECURITY POLICY
================================================================== */
export function SecurityPolicyModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { policy, updatePolicy, recordActivity, toast, openModal } = useStore();
  const [p, setP] = useState({ ...policy });
  return (
    <Modal open onClose={onClose} title="Security policy" subtitle="Org-wide rules that apply to every member" icon="bi-shield-lock" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => { updatePolicy(p); recordActivity("Security policy updated", "bi-shield-lock"); toast("Security policy saved — applies at every member's next login.", "success", "Policy saved"); onClose(); }}>
            <i className="bi bi-check2 me-1" /> Save policy
          </button>
        </>
      }
    >
      {[
        { k: "enforce2FA" as const, t: "Require two-factor authentication", d: "Members without 2FA are locked out after the grace period", danger: false },
        { k: "requireStrongPassword" as const, t: "Require strong passwords", d: `Minimum ${p.passwordMinLength} chars, mixed case, number & symbol`, danger: false },
        { k: "blockNewCountries" as const, t: "Block logins from new countries", d: "Auto-blocks + notifies on impossible travel (recommended)", danger: false },
        { k: "ipAllowlist" as const, t: "Restrict access to IP allowlist", d: "Only these networks can sign in — can lock you out if misconfigured", danger: true },
      ].map((r) => (
        <div key={r.k} className="d-flex align-items-center gap-2 p-2 mb-2" style={{ border: `1px solid ${r.danger && p[r.k] ? "#f6b7b0" : "var(--pm-border)"}`, borderRadius: 10, background: r.danger && p[r.k] ? "#fef6f5" : "#fff" }}>
          <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" checked={p[r.k] as boolean} onChange={(e) => setP((s) => ({ ...s, [r.k]: e.target.checked }))} /></div>
          <div className="flex-grow-1">
            <b style={{ fontSize: "0.84rem" }}>{r.t}{r.danger && <Badge tone="red" className="ms-1">dangerous</Badge>}</b>
            <div className="pm-prod-meta">{r.d}</div>
          </div>
        </div>
      ))}
      {p.ipAllowlist && (
        <Field label="Allowed CIDR ranges" className="mb-3">
          <input className="form-control pm-mono" value={p.allowlistCidrs} onChange={(e) => setP((s) => ({ ...s, allowlistCidrs: e.target.value }))} />
        </Field>
      )}
      <div className="row g-3">
        <Field label="Session timeout (minutes)" className="col-md-4">
          <input type="number" min={5} max={480} className="form-control" value={p.sessionTimeoutMins} onChange={(e) => setP((s) => ({ ...s, sessionTimeoutMins: Number(e.target.value) }))} />
        </Field>
        <Field label="Max failed login attempts" className="col-md-4">
          <input type="number" min={3} max={10} className="form-control" value={p.maxFailedAttempts} onChange={(e) => setP((s) => ({ ...s, maxFailedAttempts: Number(e.target.value) }))} />
        </Field>
        <Field label="2FA grace period (days)" className="col-md-4">
          <input type="number" min={0} max={30} className="form-control" value={p.gracePeriodDays} onChange={(e) => setP((s) => ({ ...s, gracePeriodDays: Number(e.target.value) }))} />
        </Field>
      </div>
      <button type="button" className="btn btn-outline-primary btn-sm w-100 mt-3" onClick={() => { onClose(); openModal("twofaWizard"); }}>
        <i className="bi bi-shield-check me-1" /> Run the guided 2FA enforcement wizard
      </button>
    </Modal>
  );
}

/* ==================================================================
   ACCESS REVIEW (periodic certification)
================================================================== */
export function AccessReviewModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { members, roles, openModal, recordActivity, toast } = useStore();
  const [decisions, setDecisions] = useState<Record<string, "keep" | "revoke" | "">>({});
  const reviewable = members.filter((m) => m.roleId !== "owner" && m.status !== "Revoked");
  const done = Object.values(decisions).filter(Boolean).length;
  const flagged = reviewable.filter((m) => m.lastActive.includes("days ago") || m.status === "Suspended" || !m.twoFA);
  return (
    <Modal open onClose={onClose} title="Quarterly access review" subtitle="Certify who still needs access — auditors love this" icon="bi-clipboard-check" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Save & finish later</button>
          <button type="button" className="btn btn-primary" disabled={done < reviewable.length} onClick={() => {
            const revoked = Object.entries(decisions).filter(([, v]) => v === "revoke").length;
            recordActivity(`Access review completed — ${done} certified, ${revoked} flagged for removal`, "bi-clipboard-check");
            toast(`Review certified. ${revoked} member(s) queued for offboarding.`, "success", "Review complete");
            onClose();
          }}>
            <i className="bi bi-check2-circle me-1" /> Certify review ({done}/{reviewable.length})
          </button>
        </>
      }
    >
      <div className="pm-note mb-3"><i className="bi bi-exclamation-triangle me-1" /><b>{flagged.length} member(s)</b> flagged: inactive 3+ days, suspended, or missing 2FA. Decide on each person below.</div>
      {reviewable.map((m) => {
        const role = roles.find((r) => r.id === m.roleId);
        const isFlagged = flagged.some((f) => f.id === m.id);
        return (
          <div key={m.id} className="d-flex align-items-center gap-2 p-2 mb-2" style={{ border: `1px solid ${isFlagged ? "#f6d78b" : "var(--pm-border)"}`, borderRadius: 10, background: isFlagged ? "#fffdf5" : "#fff" }}>
            <span className="pm-avatar" style={{ width: 32, height: 32, fontSize: "0.66rem", background: m.avatarColor }}>{m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <b style={{ fontSize: "0.82rem" }}>{m.name}</b>
              <div className="pm-prod-meta">{role?.name} · last active {m.lastActive}{!m.twoFA ? " · no 2FA" : ""}</div>
            </div>
            <div className="d-flex gap-1">
              <button type="button" className={`btn btn-sm ${decisions[m.id] === "keep" ? "btn-success" : "btn-outline-success"}`} onClick={() => setDecisions((d) => ({ ...d, [m.id]: "keep" }))}><i className="bi bi-check2" /></button>
              <button type="button" className={`btn btn-sm ${decisions[m.id] === "revoke" ? "btn-danger" : "btn-outline-danger"}`} onClick={() => { setDecisions((d) => ({ ...d, [m.id]: "revoke" })); openModal("offboardWizard", { memberId: m.id }); }}><i className="bi bi-x-lg" /></button>
            </div>
          </div>
        );
      })}
    </Modal>
  );
}

/* ==================================================================
   TRANSFER OWNERSHIP (dangerous)
================================================================== */
export function TransferOwnershipModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { members, changeRole, recordActivity, pushAudit, toast } = useStore();
  const candidates = members.filter((m) => m.status === "Active" && m.roleId !== "owner" && (m.roleId === "admin" || m.roleId === "manager"));
  const [target, setTarget] = useState(candidates[0]?.id ?? "");
  const [confirm, setConfirm] = useState("");
  const [ack, setAck] = useState(false);
  const t = members.find((m) => m.id === target);
  const canDo = ack && confirm === "TRANSFER OWNERSHIP" && !!t;
  return (
    <Modal open onClose={onClose} title="Transfer ownership" subtitle="The most dangerous action on this page — read carefully" icon="bi-star" size="md"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-danger" disabled={!canDo} onClick={() => {
            if (!t) return;
            changeRole(t.id, "owner");
            recordActivity(`Ownership transferred to ${t.name}`, "bi-star");
            pushAudit("Wanjiku Maina", "Transferred ownership", `${t.name} is now Owner`, "Team", "Critical");
            toast(`${t.name} is now the Owner. You've been downgraded to Admin.`, "warning", "Ownership transferred");
            onClose();
          }}>
            <i className="bi bi-star me-1" /> Transfer ownership
          </button>
        </>
      }
    >
      <div className="pm-note mb-3" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}>
        <i className="bi bi-exclamation-triangle me-1" style={{ color: "var(--pm-danger)" }} />
        The new Owner gets <b>full control</b> — including billing, KYB, team management and the ability to remove you. You'll become an Admin. This <b>cannot be undone</b> without their cooperation.
      </div>
      <Field label="New owner" className="mb-3">
        <select className="form-select" value={target} onChange={(e) => setTarget(e.target.value)}>
          {candidates.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.email}</option>)}
        </select>
        <div className="pm-prod-meta mt-1">Only active Admins and Managers can receive ownership.</div>
      </Field>
      <div className="form-check mb-3">
        <input className="form-check-input" type="checkbox" id="ackOwn" checked={ack} onChange={(e) => setAck(e.target.checked)} />
        <label className="form-check-label" htmlFor="ackOwn" style={{ fontSize: "0.82rem" }}>I understand I will lose Owner privileges and {t?.name ?? "the new owner"} will control this business.</label>
      </div>
      <Field label={`Type "TRANSFER OWNERSHIP" to confirm`}>
        <input className="form-control pm-mono" placeholder="TRANSFER OWNERSHIP" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Field>
    </Modal>
  );
}

/* ==================================================================
   SMALL CONFIRMS
================================================================== */
export function SuspendConfirmModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { members, suspendMember } = useStore();
  const m = members.find((x) => x.id === String(payload.id));
  if (!m) return null;
  return (
    <Modal open onClose={onClose} title="Suspend member?" icon="bi-pause-circle" size="sm"
      footer={<><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button type="button" className="btn btn-warning" onClick={() => { suspendMember(m.id); onClose(); }}><i className="bi bi-pause-circle me-1" /> Suspend</button></>}
    >
      <p className="mb-1"><b>{m.name}</b> will be signed out of all {m.sessions} device(s) immediately and blocked from signing in.</p>
      <p className="pm-prod-meta mb-0">Their data, assignments and audit trail stay intact. Reactivate any time.</p>
    </Modal>
  );
}

export function ReactivateConfirmModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { members, reactivateMember } = useStore();
  const m = members.find((x) => x.id === String(payload.id));
  if (!m) return null;
  return (
    <Modal open onClose={onClose} title="Reactivate member?" icon="bi-play-circle" size="sm"
      footer={<><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button type="button" className="btn btn-primary" onClick={() => { reactivateMember(m.id); onClose(); }}><i className="bi bi-play-circle me-1" /> Reactivate</button></>}
    >
      <p className="mb-1"><b>{m.name}</b> will be able to sign in again with their previous role and permissions.</p>
      <p className="pm-prod-meta mb-0">They'll need to re-authenticate{!m.twoFA ? " — consider requiring 2FA first." : "."}</p>
    </Modal>
  );
}

export function RevokeInviteModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { members, revokeInvite } = useStore();
  const m = members.find((x) => x.id === String(payload.id));
  if (!m) return null;
  return (
    <Modal open onClose={onClose} title="Revoke invite?" icon="bi-envelope-x" size="sm"
      footer={<><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Keep invite</button><button type="button" className="btn btn-danger" onClick={() => { revokeInvite(m.id); onClose(); }}><i className="bi bi-envelope-x me-1" /> Revoke</button></>}
    >
      <p className="mb-1">The invite link sent to <b>{m.email}</b> will stop working immediately.</p>
      <p className="pm-prod-meta mb-0">You can always invite them again later.</p>
    </Modal>
  );
}

export function ResetPasswordModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { members, toast, recordActivity, pushAudit } = useStore();
  const m = members.find((x) => x.id === String(payload.id));
  const [channel, setChannel] = useState("Email");
  const [killSessions, setKillSessions] = useState(true);
  if (!m) return null;
  return (
    <Modal open onClose={onClose} title="Reset password" subtitle={`${m.name} · ${m.email}`} icon="bi-key"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            recordActivity(`Password reset link sent to ${m.name} via ${channel}`, "bi-key");
            pushAudit("Wanjiku Maina", "Sent password reset", `${m.name} via ${channel}`, "Security", "Warning");
            toast(`Reset link sent to ${m.name} via ${channel}. Valid 30 minutes.${killSessions ? " All sessions killed." : ""}`, "success", "Reset sent");
            onClose();
          }}>
            <i className="bi bi-send me-1" /> Send reset link
          </button>
        </>
      }
    >
      <div className="pm-note mb-3"><i className="bi bi-shield-check me-1" />You never see or set their password — we send a one-time link they use to choose their own.</div>
      <Field label="Send via" className="mb-3">
        <select className="form-select" value={channel} onChange={(e) => setChannel(e.target.value)}>
          <option>Email</option><option>SMS</option><option>WhatsApp</option><option>Email + SMS</option>
        </select>
      </Field>
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" id="killSess" checked={killSessions} onChange={(e) => setKillSessions(e.target.checked)} />
        <label className="form-check-label" htmlFor="killSess"><b style={{ fontSize: "0.84rem" }}>Kill all their sessions now</b><div className="pm-prod-meta">Recommended if you suspect the account is compromised.</div></label>
      </div>
    </Modal>
  );
}

/* ==================================================================
   EXPORT TEAM REPORT
================================================================== */
export function ExportTeamModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const [format, setFormat] = useState("PDF");
  const [scope, setScope] = useState({ members: true, roles: true, matrix: true, audit: true, sessions: false });
  const [busy, setBusy] = useState(false);
  return (
    <Modal open onClose={onClose} title="Export team & access report" subtitle="Auditor-ready pack — who has access to what, and why" icon="bi-file-earmark-arrow-down"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => {
            setBusy(true);
            window.setTimeout(() => { setBusy(false); recordActivity(`Team report exported (${format})`, "bi-file-earmark-arrow-down"); toast(`${format} report downloaded — ${Object.values(scope).filter(Boolean).length} sections.`, "success", "Report ready"); onClose(); }, 1200);
          }}>
            {busy ? <><span className="pm-spin me-1">◌</span> Building…</> : <><i className="bi bi-download me-1" /> Export {format}</>}
          </button>
        </>
      }
    >
      <div className="d-flex gap-2 mb-3">
        {["PDF", "CSV", "Excel"].map((f) => <button key={f} type="button" className={`pm-chip ${format === f ? "on" : ""}`} onClick={() => setFormat(f)}>{f}</button>)}
      </div>
      {[
        { k: "members" as const, t: "Member directory with roles & status" },
        { k: "roles" as const, t: "Role definitions & approval ceilings" },
        { k: "matrix" as const, t: "Full permission matrix (roles × modules)" },
        { k: "audit" as const, t: "Audit log (last 90 days)" },
        { k: "sessions" as const, t: "Active sessions & devices" },
      ].map((r) => (
        <div key={r.k} className="d-flex align-items-center gap-2 py-1">
          <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" checked={scope[r.k]} onChange={(e) => setScope((s) => ({ ...s, [r.k]: e.target.checked }))} /></div>
          <span style={{ fontSize: "0.84rem" }}>{r.t}</span>
        </div>
      ))}
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
    <Modal open onClose={onClose} title="Help & shortcuts" subtitle="Team Management & Roles — every flow on this page" icon="bi-question-circle" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { toast("Guided tour started — follow the highlights. (Demo)", "info", "Guided tour"); onClose(); }}>
            <i className="bi bi-compass me-1" /> Start guided tour
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Got it</button>
        </>
      }
    >
      <div className="row g-3">
        {[
          { icon: "bi-person-plus", t: "Invite Member (5 steps)", d: "Person → role → business scope → permission review → send via email/WhatsApp/SMS.", act: () => openModal("inviteWizard") },
          { icon: "bi-shield-lock", t: "Custom Role Builder (5 steps)", d: "Basics → template → per-module permissions → approval ceiling → review.", act: () => openModal("roleWizard") },
          { icon: "bi-check2-square", t: "Approval Rule (4 steps)", d: "Trigger → threshold & scope → approvers (ANY/ALL) → maker-checker preview.", act: () => openModal("approvalWizard") },
          { icon: "bi-person-dash", t: "Offboarding (4 steps)", d: "Who → reassign work → revoke sessions/keys/devices → typed confirmation.", act: () => openModal("offboardWizard", { memberId: "u9" }) },
          { icon: "bi-shield-check", t: "2FA Enforcement (3 steps)", d: "Scope → methods & grace period → rollout timeline.", act: () => openModal("twofaWizard") },
          { icon: "bi-grid-3x3", t: "Permission Matrix", d: "Roles × modules on one screen, editable inline, exportable for auditors.", act: () => openModal("permMatrix") },
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
        <span className="pm-kbd">Tab</span> move between fields · <span className="pm-kbd">Enter</span> next wizard step · <span className="pm-kbd">Esc</span> close any modal · <span className="pm-kbd">/</span> focus search
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
  const kinds = ["All", "Members", "Roles", "Approvals", "Security"];
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" title="Team activity" subtitle="Everything that changed access — audit-ready">
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
      <button type="button" className="btn btn-outline-secondary w-100 mt-3" onClick={() => toast("Full team audit trail queued for export.", "info", "Audit trail")}>
        <i className="bi bi-download me-1" /> Export full audit trail
      </button>
    </Drawer>
  );
}
