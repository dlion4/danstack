import { useState } from "react";
import { BUSINESSES, DEPARTMENTS, MODULES, PERM_LEVELS, fmtKES } from "./data";
import type { AccessLevel, PermLevel, RoleId } from "./data";
import { useStore } from "./store";
import { Badge, Chip, Field, Modal, StatusBadge, WizardShell } from "./ui";

const permTone = (p: PermLevel) => (p === "Full" ? "green" : p === "Approve" ? "violet" : p === "Edit" ? "blue" : p === "Create" ? "green" : p === "View" ? "slate" : "slate");

/* ==================================================================
   INVITE MEMBER WIZARD — 5 steps
================================================================== */
export function InviteWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { roles, inviteMember, openModal, toast } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[3]);
  const [roleId, setRoleId] = useState<RoleId>("staff");
  const [businesses, setBusinesses] = useState<Record<string, AccessLevel>>({ b1: "No Access", b2: "Standard", b3: "No Access", b4: "No Access" });
  const [channels, setChannels] = useState({ email: true, whatsapp: true, sms: false });
  const [require2FA, setRequire2FA] = useState(true);
  const [message, setMessage] = useState("");
  const role = roles.find((r) => r.id === roleId);
  const scopedCount = Object.values(businesses).filter((v) => v !== "No Access").length;

  return (
    <Modal open onClose={onClose} title="Invite team member" subtitle="5 steps · least-privilege by default · invite expires in 7 days" icon="bi-person-plus" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 4 ? (
            <button type="button" className="btn btn-primary"
              disabled={(step === 0 && (!name.trim() || !email.includes("@"))) || (step === 2 && scopedCount === 0)}
              onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              const id = inviteMember({
                name: name.trim(), email: email.trim(), phone, roleId, department,
                avatarColor: role?.color ?? "#12b76a", businesses,
              });
              const chans = Object.entries(channels).filter(([, v]) => v).map(([k]) => k === "whatsapp" ? "WhatsApp" : k.toUpperCase()).join(" + ");
              toast(`Invite sent to ${email} via ${chans} — ${role?.name} on ${scopedCount} business(es). Expires in 7 days.`, "success", "Invite sent");
              onClose();
              openModal("memberDrawer", { id });
            }}>
              <i className="bi bi-send me-1" /> Send invite
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[
        { label: "Person", icon: "bi-person" },
        { label: "Role", icon: "bi-shield-lock" },
        { label: "Business scope", icon: "bi-buildings" },
        { label: "Permissions review", icon: "bi-grid-3x3" },
        { label: "Send invite", icon: "bi-send" },
      ]} current={step} onStep={(i) => i < step && setStep(i)}>
        {/* 1 — PERSON */}
        {step === 0 && (
          <div className="row g-3">
            <Field label="Full name *" className="col-md-6">
              <input className="form-control" placeholder="e.g. Naomi Chemtai" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <Field label="Work email *" className="col-md-6" hint="The invite link goes here.">
              <input className="form-control" placeholder="name@company.co.ke" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Phone (M-Pesa / WhatsApp)" className="col-md-6">
              <input className="form-control" placeholder="07xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label="Department" className="col-md-6">
              <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <div className="col-12"><div className="pm-note soft"><i className="bi bi-shield-check me-1" />We never send passwords. The invitee sets their own and must verify their phone before first login.</div></div>
          </div>
        )}

        {/* 2 — ROLE */}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            {roles.filter((r) => r.id !== "owner").map((r) => (
              <button key={r.id} type="button" className={`pm-theme-card text-start p-3 ${roleId === r.id ? "sel" : ""}`} onClick={() => setRoleId(r.id)}>
                <div className="d-flex align-items-center gap-2">
                  <span className="pm-kpi-icon" style={{ width: 34, height: 34, fontSize: "0.9rem", background: r.color + "22", color: r.color }}><i className={`bi ${r.icon}`} /></span>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2">
                      <b style={{ fontSize: "0.88rem" }}>{r.name}</b>
                      {!r.system && <Badge tone="violet">Custom</Badge>}
                      {r.approvalLimit !== null && r.approvalLimit > 0 && <Badge tone="amber">Approves ≤ {fmtKES(r.approvalLimit)}</Badge>}
                    </div>
                    <div className="pm-prod-meta">{r.desc}</div>
                  </div>
                  {roleId === r.id && <i className="bi bi-check-circle-fill text-primary" />}
                </div>
              </button>
            ))}
            <div className="pm-note soft"><i className="bi bi-lightbulb me-1" />Not sure? Start with <b>Viewer</b> — you can always upgrade. Downgrading later is harder on trust.</div>
          </div>
        )}

        {/* 3 — BUSINESS SCOPE */}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3"><i className="bi bi-buildings me-1" />Grant access <b>per business</b>. A caretaker for one property should never see the others.</div>
            {BUSINESSES.map((b) => (
              <div key={b.id} className="d-flex align-items-center gap-2 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                <span style={{ fontSize: "1.1rem" }}>{b.emoji}</span>
                <b style={{ fontSize: "0.84rem" }} className="flex-grow-1">{b.name}</b>
                <select className="form-select form-select-sm" style={{ width: 140 }} value={businesses[b.id]} onChange={(e) => setBusinesses((s) => ({ ...s, [b.id]: e.target.value as AccessLevel }))}>
                  {(["No Access", "Viewer", "Standard", "Admin"] as const).map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            ))}
            {scopedCount === 0 && <div className="pm-note" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}><i className="bi bi-exclamation-triangle me-1" style={{ color: "var(--pm-danger)" }} />Grant access to at least one business, otherwise the invite is pointless.</div>}
          </div>
        )}

        {/* 4 — PERMISSIONS REVIEW */}
        {step === 3 && role && (
          <div>
            <div className="pm-note mb-3"><i className="bi bi-eye me-1" />Exactly what <b>{name || "this person"}</b> will be able to do as <b>{role.name}</b>:</div>
            <div className="table-responsive" style={{ maxHeight: 300, overflowY: "auto" }}>
              <table className="table pm-table align-middle">
                <thead><tr><th>Module</th><th>Zone</th><th>Access</th></tr></thead>
                <tbody>
                  {MODULES.map((m) => (
                    <tr key={m.id}>
                      <td><i className={`bi ${m.icon} me-2`} style={{ color: "var(--pm-green-dark)" }} /><b style={{ fontSize: "0.8rem" }}>{m.name}</b>{m.sensitive && <Badge tone="red" className="ms-1">sensitive</Badge>}</td>
                      <td className="pm-prod-meta">{m.zone}</td>
                      <td><StatusBadge status={role.perms[m.id]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-note soft mt-2"><i className="bi bi-info-circle me-1" />Need something different? Create a <b>custom role</b> instead of over-granting a system role.</div>
          </div>
        )}

        {/* 5 — SEND */}
        {step === 4 && (
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Send invite via</label>
              <div className="d-flex gap-2 flex-wrap">
                {([["email", "Email", "bi-envelope"], ["whatsapp", "WhatsApp", "bi-whatsapp"], ["sms", "SMS", "bi-chat-left-text"]] as const).map(([k, l, ic]) => (
                  <Chip key={k} on={channels[k]} onClick={() => setChannels((s) => ({ ...s, [k]: !s[k] }))}><i className={`bi ${ic} me-1`} />{l}</Chip>
                ))}
              </div>
            </div>
            <Field label="Personal message (optional)" className="col-12">
              <textarea className="form-control" rows={2} placeholder={`Karibu ${name.split(" ")[0] || "team"}! You've been added to help run the shop.`} value={message} onChange={(e) => setMessage(e.target.value)} />
            </Field>
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="inv2fa" checked={require2FA} onChange={(e) => setRequire2FA(e.target.checked)} />
                <label className="form-check-label" htmlFor="inv2fa"><b style={{ fontSize: "0.84rem" }}>Require 2FA before first login</b><div className="pm-prod-meta">Strongly recommended for anyone touching money.</div></label>
              </div>
            </div>
            <div className="col-12">
              <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
                <div className="row text-center g-2">
                  <div className="col-3"><div className="pm-kpi-label">Person</div><b style={{ fontSize: "0.78rem" }}>{name || "—"}</b></div>
                  <div className="col-3"><div className="pm-kpi-label">Role</div><b style={{ fontSize: "0.78rem" }}>{role?.name}</b></div>
                  <div className="col-3"><div className="pm-kpi-label">Businesses</div><b style={{ fontSize: "0.78rem" }}>{scopedCount}</b></div>
                  <div className="col-3"><div className="pm-kpi-label">2FA</div><b style={{ fontSize: "0.78rem" }}>{require2FA ? "Required" : "Optional"}</b></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   CUSTOM ROLE BUILDER — 5 steps
================================================================== */
export function RoleWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { createRole, openModal, toast } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState("#7a5af8");
  const [icon, setIcon] = useState("bi-person-badge");
  const [perms, setPerms] = useState<Record<string, PermLevel>>(Object.fromEntries(MODULES.map((m) => [m.id, "None" as PermLevel])));
  const [canApprove, setCanApprove] = useState(false);
  const [approvalLimit, setApprovalLimit] = useState("25000");
  const [template, setTemplate] = useState("blank");

  const applyTemplate = (t: string) => {
    setTemplate(t);
    if (t === "ops") setPerms(Object.fromEntries(MODULES.map((m) => [m.id, ["getpaid", "crm", "products", "inventory"].includes(m.id) ? "Full" : m.id === "suppliers" ? "Create" : "None"])) as Record<string, PermLevel>);
    else if (t === "finance") setPerms(Object.fromEntries(MODULES.map((m) => [m.id, m.id === "books" ? "Full" : ["cash", "getpaid", "suppliers"].includes(m.id) ? "View" : "None"])) as Record<string, PermLevel>);
    else if (t === "readonly") setPerms(Object.fromEntries(MODULES.map((m) => [m.id, m.id === "settings" ? "None" : "View"])) as Record<string, PermLevel>);
    else setPerms(Object.fromEntries(MODULES.map((m) => [m.id, "None" as PermLevel])));
  };
  const grantedCount = Object.values(perms).filter((p) => p !== "None").length;
  const sensitiveGrants = MODULES.filter((m) => m.sensitive && perms[m.id] !== "None" && perms[m.id] !== "View").length;

  return (
    <Modal open onClose={onClose} title="Create custom role" subtitle="5 steps · least privilege, per module, with financial ceilings" icon="bi-shield-lock" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 4 ? (
            <button type="button" className="btn btn-primary" disabled={step === 0 && !name.trim()} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              const id = "role" + Date.now();
              createRole({ id, name: name.trim(), desc: desc || "Custom role", icon, color, perms, approvalLimit: canApprove ? Number(approvalLimit) || 0 : 0, canApprove });
              toast(`Role "${name}" created — ${grantedCount} module(s) granted. Assign it from any member's profile.`, "success", "Role created");
              onClose();
              openModal("roleDrawer", { id });
            }}>
              <i className="bi bi-check2-circle me-1" /> Create role
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[
        { label: "Basics", icon: "bi-tag" },
        { label: "Start from", icon: "bi-magic" },
        { label: "Module permissions", icon: "bi-grid-3x3" },
        { label: "Financial limits", icon: "bi-cash-coin" },
        { label: "Review", icon: "bi-check2-circle" },
      ]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <Field label="Role name *" className="col-md-6"><input className="form-control" placeholder="e.g. Warehouse Supervisor" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></Field>
            <Field label="Colour" className="col-md-3">
              <input type="color" className="form-control form-control-color w-100" value={color} onChange={(e) => setColor(e.target.value)} />
            </Field>
            <Field label="Icon" className="col-md-3">
              <select className="form-select" value={icon} onChange={(e) => setIcon(e.target.value)}>
                <option value="bi-person-badge">Badge</option><option value="bi-box-seam">Box</option><option value="bi-truck">Truck</option><option value="bi-house">House</option><option value="bi-calculator">Calculator</option><option value="bi-megaphone">Megaphone</option>
              </select>
            </Field>
            <Field label="Description" className="col-12" hint="Shown to admins when assigning this role.">
              <input className="form-control" placeholder="What this role is for and what it cannot do" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </Field>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            {[
              { id: "blank", t: "Start from scratch", d: "Everything set to None — grant only what's needed", icon: "bi-file-earmark" },
              { id: "ops", t: "Operations template", d: "Full sales, customers, products & stock. No bank or books.", icon: "bi-shop" },
              { id: "finance", t: "Finance template", d: "Full books, read-only on cash & payments", icon: "bi-calculator" },
              { id: "readonly", t: "Read-only template", d: "View everything except Settings", icon: "bi-eye" },
            ].map((t) => (
              <div className="col-md-6" key={t.id}>
                <button type="button" className={`pm-theme-card text-start p-3 w-100 ${template === t.id ? "sel" : ""}`} onClick={() => applyTemplate(t.id)}>
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${t.icon}`} style={{ color: "var(--pm-green-dark)", fontSize: "1.1rem" }} />
                    <b style={{ fontSize: "0.86rem" }}>{t.t}</b>
                    {template === t.id && <i className="bi bi-check-circle-fill text-primary ms-auto" />}
                  </div>
                  <div className="pm-prod-meta mt-1">{t.d}</div>
                </button>
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="pm-kpi-label">Set access per module</div>
              <div className="d-flex gap-1">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setPerms(Object.fromEntries(MODULES.map((m) => [m.id, "View" as PermLevel])))}>All View</button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setPerms(Object.fromEntries(MODULES.map((m) => [m.id, "None" as PermLevel])))}>Clear all</button>
              </div>
            </div>
            <div className="table-responsive" style={{ maxHeight: 320, overflowY: "auto" }}>
              <table className="table pm-table align-middle">
                <thead><tr><th>Module</th><th style={{ minWidth: 300 }}>Access level</th></tr></thead>
                <tbody>
                  {MODULES.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <i className={`bi ${m.icon} me-2`} style={{ color: "var(--pm-green-dark)" }} />
                        <b style={{ fontSize: "0.8rem" }}>{m.name}</b>
                        {m.sensitive && <Badge tone="red" className="ms-1">sensitive</Badge>}
                        <div className="pm-prod-meta">{m.zone}</div>
                      </td>
                      <td>
                        <div className="pm-perm-group">
                          {PERM_LEVELS.map((lvl) => (
                            <button key={lvl} type="button" className={`pm-perm-btn ${perms[m.id] === lvl ? "on " + permTone(lvl) : ""}`} onClick={() => setPerms((p) => ({ ...p, [m.id]: lvl }))}>
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="row g-3">
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="canAppr" checked={canApprove} onChange={(e) => setCanApprove(e.target.checked)} />
                <label className="form-check-label" htmlFor="canAppr"><b style={{ fontSize: "0.84rem" }}>This role can approve payments</b><div className="pm-prod-meta">Maker-checker: approvers cannot approve their own requests.</div></label>
              </div>
            </div>
            {canApprove && (
              <Field label="Approval ceiling (KES)" className="col-md-6" hint="Anything above this escalates to Admin/Owner.">
                <div className="input-group"><span className="input-group-text">KES</span><input type="number" min={0} step={5000} className="form-control" value={approvalLimit} onChange={(e) => setApprovalLimit(e.target.value)} /></div>
              </Field>
            )}
            <div className="col-12">
              <div className={sensitiveGrants > 0 ? "pm-note" : "pm-note soft"}>
                <i className={`bi ${sensitiveGrants > 0 ? "bi-exclamation-triangle" : "bi-shield-check text-primary"} me-1`} />
                {sensitiveGrants > 0
                  ? <>This role has <b>write access to {sensitiveGrants} sensitive module(s)</b> (bank, books, suppliers or settings). Only grant this to people you'd trust with the cheque book.</>
                  : <>No sensitive write access — safe for front-line staff.</>}
              </div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="pm-kpi-icon" style={{ width: 42, height: 42, background: color + "22", color }}><i className={`bi ${icon}`} /></span>
              <div><b style={{ fontSize: "0.95rem" }}>{name || "Untitled role"}</b><div className="pm-prod-meta">{desc || "Custom role"}</div></div>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-4"><div className="pm-card text-center py-2" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Modules granted</div><b>{grantedCount}/{MODULES.length}</b></div></div>
              <div className="col-4"><div className="pm-card text-center py-2" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Sensitive writes</div><b style={{ color: sensitiveGrants ? "var(--pm-danger)" : undefined }}>{sensitiveGrants}</b></div></div>
              <div className="col-4"><div className="pm-card text-center py-2" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Approval ceiling</div><b>{canApprove ? fmtKES(Number(approvalLimit)) : "Cannot approve"}</b></div></div>
            </div>
            <div className="d-flex gap-1 flex-wrap">
              {MODULES.filter((m) => perms[m.id] !== "None").map((m) => (
                <span key={m.id} className="badge-soft slate" style={{ fontSize: "0.66rem" }}>{m.name}: {perms[m.id]}</span>
              ))}
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   APPROVAL RULE WIZARD — 4 steps
================================================================== */
export function ApprovalWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { members, createApprovalRule, toast } = useStore();
  const [step, setStep] = useState(0);
  const [trigger, setTrigger] = useState("Supplier payment");
  const [threshold, setThreshold] = useState("100000");
  const [appliesTo, setAppliesTo] = useState("All businesses");
  const [approvers, setApprovers] = useState<string[]>(["u1"]);
  const [requireAll, setRequireAll] = useState(false);
  const [escalation, setEscalation] = useState("Escalates to Owner after 24 hours");
  const [name, setName] = useState("");
  const eligible = members.filter((m) => m.status === "Active" && ["owner", "admin", "manager", "accountant"].includes(m.roleId));
  const triggers = ["Supplier payment", "Bank transfer", "Customer refund", "Inventory write-off", "Payroll run", "Supplier created", "Loan drawdown"];

  return (
    <Modal open onClose={onClose} title="Create approval rule" subtitle="4 steps · maker-checker controls for money leaving the business" icon="bi-check2-square" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={step === 2 && approvers.length === 0} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              const ruleName = name.trim() || `${trigger}s over ${fmtKES(Number(threshold))}`;
              createApprovalRule({ name: ruleName, trigger, threshold: Number(threshold) || 0, currency: "KES", approvers, requireAll, status: "Active", appliesTo, escalation });
              toast(`Rule live — ${trigger.toLowerCase()}s above ${fmtKES(Number(threshold))} now need ${requireAll ? "ALL" : "ANY"} of ${approvers.length} approver(s).`, "success", "Approval rule created");
              onClose();
            }}>
              <i className="bi bi-check2-circle me-1" /> Activate rule
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[
        { label: "Trigger", icon: "bi-lightning-charge" },
        { label: "Threshold & scope", icon: "bi-cash-coin" },
        { label: "Approvers", icon: "bi-people" },
        { label: "Review", icon: "bi-check2-circle" },
      ]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            <div className="pm-kpi-label mb-2">What action should require approval?</div>
            <div className="d-flex flex-column gap-2">
              {triggers.map((t) => (
                <button key={t} type="button" className={`pm-theme-card text-start p-2 ${trigger === t ? "sel" : ""}`} onClick={() => setTrigger(t)}>
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${t.includes("payment") || t.includes("transfer") ? "bi-cash-stack" : t.includes("refund") ? "bi-arrow-counterclockwise" : t.includes("write-off") ? "bi-trash" : t.includes("Payroll") ? "bi-people" : t.includes("Loan") ? "bi-bank" : "bi-truck"}`} style={{ color: "var(--pm-green-dark)" }} />
                    <b style={{ fontSize: "0.84rem" }}>{t}</b>
                    {trigger === t && <i className="bi bi-check-circle-fill text-primary ms-auto" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Threshold — approval needed above this amount" className="col-md-6">
              <div className="input-group"><span className="input-group-text">KES</span><input type="number" min={0} step={5000} className="form-control" value={threshold} onChange={(e) => setThreshold(e.target.value)} /></div>
              <div className="d-flex gap-2 mt-2">
                {[10000, 50000, 100000, 500000].map((v) => <Chip key={v} on={Number(threshold) === v} onClick={() => setThreshold(String(v))}>{fmtKES(v)}</Chip>)}
              </div>
            </Field>
            <Field label="Applies to" className="col-md-6">
              <select className="form-select" value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)}>
                <option>All businesses</option>
                {BUSINESSES.map((b) => <option key={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Rule name (optional)" className="col-12">
              <input className="form-control" placeholder={`${trigger}s over ${fmtKES(Number(threshold) || 0)}`} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <div className="col-12"><div className="pm-note soft"><i className="bi bi-info-circle me-1" />Set the threshold at the number that would hurt if it went out by mistake — not so low that everything needs a signature.</div></div>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-kpi-label mb-2">Who can approve?</div>
            {eligible.map((m) => (
              <div key={m.id} className="d-flex align-items-center gap-2 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                <div className="form-check mb-0"><input className="form-check-input" type="checkbox" checked={approvers.includes(m.id)} onChange={() => setApprovers((a) => a.includes(m.id) ? a.filter((x) => x !== m.id) : [...a, m.id])} /></div>
                <span className="pm-avatar" style={{ width: 30, height: 30, fontSize: "0.66rem", background: m.avatarColor }}>{m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                <div className="flex-grow-1"><b style={{ fontSize: "0.82rem" }}>{m.name}</b><div className="pm-prod-meta">{m.email}</div></div>
                <Badge tone="slate">{m.roleId}</Badge>
              </div>
            ))}
            <div className="d-flex gap-2 mt-3">
              <Chip on={!requireAll} onClick={() => setRequireAll(false)}>ANY approver is enough</Chip>
              <Chip on={requireAll} onClick={() => setRequireAll(true)}>ALL must approve (dual control)</Chip>
            </div>
            <Field label="Escalation" className="mt-3">
              <select className="form-select" value={escalation} onChange={(e) => setEscalation(e.target.value)}>
                <option>Escalates to Owner after 24 hours</option>
                <option>Escalates to Owner after 48 hours</option>
                <option>Escalates to Admin after 4 hours</option>
                <option>No escalation — waits indefinitely</option>
              </select>
            </Field>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="pm-note mb-3">
              <i className="bi bi-check2-square me-1 text-primary" />
              <b>{trigger}s above {fmtKES(Number(threshold) || 0)}</b> on <b>{appliesTo}</b> will require {requireAll ? "ALL" : "ANY"} of <b>{approvers.length}</b> approver(s).
            </div>
            <div className="pm-flow-chain d-flex align-items-center gap-2 flex-wrap mb-3">
              <span className="pm-chain-node"><i className="bi bi-person me-1" />Requester</span>
              <i className="bi bi-arrow-right text-primary" />
              <span className="pm-chain-node warn"><i className="bi bi-hourglass-split me-1" />Pending approval</span>
              <i className="bi bi-arrow-right text-primary" />
              {approvers.map((id) => {
                const m = members.find((x) => x.id === id);
                return <span key={id} className="pm-chain-node ok"><i className="bi bi-check2 me-1" />{m?.name.split(" ")[0]}</span>;
              })}
              <i className="bi bi-arrow-right text-primary" />
              <span className="pm-chain-node done"><i className="bi bi-cash-stack me-1" />Payment released</span>
            </div>
            <div className="pm-note soft"><i className="bi bi-shield-check me-1" />Maker-checker enforced: whoever creates the request cannot approve it, even if they're on the approver list.</div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   OFFBOARDING WIZARD — 4 steps
================================================================== */
export function OffboardWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { members, removeMember, revokeAllSessions, toast, pushAudit } = useStore();
  const preId = String(payload.memberId ?? "");
  const [step, setStep] = useState(0);
  const [memberId, setMemberId] = useState(preId || members.find((m) => m.status === "Suspended")?.id || members[members.length - 1].id);
  const [reassignTo, setReassignTo] = useState("u2");
  const [checks, setChecks] = useState({ sessions: true, apiKeys: true, approvals: true, devices: true });
  const [reason, setReason] = useState("Left the company");
  const [confirm, setConfirm] = useState("");
  const m = members.find((x) => x.id === memberId);
  const target = members.find((x) => x.id === reassignTo);
  const canFinish = m && confirm === m.name;

  return (
    <Modal open onClose={onClose} title="Offboard team member" subtitle="4 steps · reassign work, revoke everything, keep the audit trail" icon="bi-person-dash" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={!m || (m.roleId === "owner")} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-danger" disabled={!canFinish} onClick={() => {
              if (!m) return;
              revokeAllSessions(m.id);
              removeMember(m.id);
              pushAudit("Wanjiku Maina", "Offboarded member", `${m.name} — ${reason}, work reassigned to ${target?.name}`, "Team", "Critical");
              toast(`${m.name} fully offboarded. Work reassigned to ${target?.name}. Audit trail retained.`, "warning", "Offboarding complete");
              onClose();
            }}>
              <i className="bi bi-person-dash me-1" /> Complete offboarding
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[
        { label: "Who", icon: "bi-person" },
        { label: "Reassign work", icon: "bi-arrow-left-right" },
        { label: "Revoke access", icon: "bi-shield-slash" },
        { label: "Confirm", icon: "bi-exclamation-triangle" },
      ]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            <Field label="Member to offboard" className="mb-3">
              <select className="form-select" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                {members.filter((x) => x.roleId !== "owner").map((x) => <option key={x.id} value={x.id}>{x.name} — {x.email} ({x.status})</option>)}
              </select>
            </Field>
            <Field label="Reason">
              <select className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                <option>Left the company</option><option>Contract ended</option><option>Role no longer needed</option><option>Security concern</option><option>Other</option>
              </select>
            </Field>
            {m && (
              <div className="pm-card mt-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                <div className="d-flex align-items-center gap-2">
                  <span className="pm-avatar" style={{ width: 40, height: 40, background: m.avatarColor }}>{m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                  <div><b>{m.name}</b><div className="pm-prod-meta">{m.email} · joined {m.joined} · last active {m.lastActive}</div></div>
                  <StatusBadge status={m.status} />
                </div>
              </div>
            )}
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="pm-note mb-3"><i className="bi bi-arrow-left-right me-1" />Anything assigned to {m?.name} needs a new owner, or it becomes orphaned.</div>
            <Field label="Reassign open work to" className="mb-3">
              <select className="form-select" value={reassignTo} onChange={(e) => setReassignTo(e.target.value)}>
                {members.filter((x) => x.id !== memberId && x.status === "Active").map((x) => <option key={x.id} value={x.id}>{x.name} ({x.roleId})</option>)}
              </select>
            </Field>
            {[
              { icon: "bi-receipt", t: "3 draft invoices", d: "Get Paid" },
              { icon: "bi-truck", t: "1 open purchase order", d: "Pay Suppliers" },
              { icon: "bi-check2-square", t: "2 pending approvals awaiting them", d: "Approvals" },
              { icon: "bi-people", t: "12 assigned customers", d: "CRM" },
            ].map((w) => (
              <div key={w.t} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <i className={`bi ${w.icon}`} style={{ color: "var(--pm-green-dark)" }} />
                <span style={{ fontSize: "0.82rem" }} className="flex-grow-1">{w.t}</span>
                <span className="pm-prod-meta">{w.d}</span>
                <i className="bi bi-arrow-right text-primary" />
                <b style={{ fontSize: "0.78rem" }}>{target?.name.split(" ")[0]}</b>
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-kpi-label mb-2">Revoke everything</div>
            {[
              { k: "sessions" as const, t: `Kill all active sessions (${m?.sessions ?? 0})`, d: "Signs them out of every device immediately" },
              { k: "devices" as const, t: "Remove trusted devices", d: "Their phone & laptop stop being remembered" },
              { k: "apiKeys" as const, t: "Revoke personal API keys", d: "Any integration they built stops working" },
              { k: "approvals" as const, t: "Remove from approval chains", d: "Rules requiring them fall back to escalation" },
            ].map((r) => (
              <div key={r.k} className="d-flex align-items-center gap-2 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" checked={checks[r.k]} onChange={(e) => setChecks((s) => ({ ...s, [r.k]: e.target.checked }))} /></div>
                <div className="flex-grow-1"><b style={{ fontSize: "0.84rem" }}>{r.t}</b><div className="pm-prod-meta">{r.d}</div></div>
              </div>
            ))}
            <div className="pm-note soft"><i className="bi bi-archive me-1" />Their audit trail, invoices and approvals stay in the ledger permanently — offboarding never deletes history.</div>
          </div>
        )}
        {step === 3 && m && (
          <div>
            <div className="pm-note mb-3" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}>
              <i className="bi bi-exclamation-triangle me-1" style={{ color: "var(--pm-danger)" }} />
              This <b>permanently removes {m.name}</b> from the team. Sessions die instantly, and they lose access to all {Object.values(m.businesses).filter((v) => v !== "No Access").length} business(es).
            </div>
            <div className="row g-2 mb-3">
              <div className="col-md-4"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Reason</div><b style={{ fontSize: "0.8rem" }}>{reason}</b></div></div>
              <div className="col-md-4"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Work goes to</div><b style={{ fontSize: "0.8rem" }}>{target?.name}</b></div></div>
              <div className="col-md-4"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Revoking</div><b style={{ fontSize: "0.8rem" }}>{Object.values(checks).filter(Boolean).length} of 4</b></div></div>
            </div>
            <Field label={`Type "${m.name}" to confirm`}>
              <input className="form-control" placeholder={m.name} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </Field>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   2FA ENFORCEMENT WIZARD — 3 steps
================================================================== */
export function TwoFaWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { members, policy, updatePolicy, recordActivity, pushAudit, toast } = useStore();
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState<"all" | "sensitive">("all");
  const [grace, setGrace] = useState(String(policy.gracePeriodDays));
  const [methods, setMethods] = useState({ totp: true, sms: true, email: false });
  const without = members.filter((m) => m.status === "Active" && !m.twoFA);
  const affected = scope === "all" ? without : without.filter((m) => ["admin", "manager", "accountant"].includes(m.roleId));

  return (
    <Modal open onClose={onClose} title="Enforce two-factor authentication" subtitle="3 steps · the single highest-impact security control" icon="bi-shield-lock" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Next <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              updatePolicy({ enforce2FA: true, gracePeriodDays: Number(grace) || 7 });
              recordActivity(`2FA enforcement enabled — ${affected.length} member(s), ${grace}-day grace`, "bi-shield-lock");
              pushAudit("Wanjiku Maina", "Enforced 2FA policy", `${scope === "all" ? "All members" : "Sensitive roles"} · ${grace}-day grace`, "Security", "Warning");
              toast(`2FA enforced. ${affected.length} member(s) have ${grace} days to enrol or they'll be locked out.`, "success", "Policy active");
              onClose();
            }}>
              <i className="bi bi-shield-check me-1" /> Enforce policy
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Who", icon: "bi-people" }, { label: "Methods & grace", icon: "bi-key" }, { label: "Rollout", icon: "bi-megaphone" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            <div className="d-flex flex-column gap-2 mb-3">
              <button type="button" className={`pm-theme-card text-start p-3 ${scope === "all" ? "sel" : ""}`} onClick={() => setScope("all")}>
                <div className="d-flex align-items-center gap-2"><i className="bi bi-people" style={{ color: "var(--pm-green-dark)" }} /><b style={{ fontSize: "0.86rem" }}>Everyone</b>{scope === "all" && <i className="bi bi-check-circle-fill text-primary ms-auto" />}</div>
                <div className="pm-prod-meta mt-1">All active members must use 2FA. Recommended.</div>
              </button>
              <button type="button" className={`pm-theme-card text-start p-3 ${scope === "sensitive" ? "sel" : ""}`} onClick={() => setScope("sensitive")}>
                <div className="d-flex align-items-center gap-2"><i className="bi bi-shield-lock" style={{ color: "var(--pm-green-dark)" }} /><b style={{ fontSize: "0.86rem" }}>Only roles touching money</b>{scope === "sensitive" && <i className="bi bi-check-circle-fill text-primary ms-auto" />}</div>
                <div className="pm-prod-meta mt-1">Admins, managers and accountants only.</div>
              </button>
            </div>
            <div className="pm-note"><i className="bi bi-people me-1" /><b>{affected.length} member(s)</b> currently without 2FA will be affected: {affected.map((m) => m.name.split(" ")[0]).join(", ") || "none — everyone is already covered 🎉"}</div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Allowed second factors</label>
              <div className="d-flex gap-2 flex-wrap">
                {([["totp", "Authenticator app (TOTP)", "bi-phone"], ["sms", "SMS code", "bi-chat-left-text"], ["email", "Email code", "bi-envelope"]] as const).map(([k, l, ic]) => (
                  <Chip key={k} on={methods[k]} onClick={() => setMethods((s) => ({ ...s, [k]: !s[k] }))}><i className={`bi ${ic} me-1`} />{l}</Chip>
                ))}
              </div>
              <div className="pm-prod-meta mt-1">Authenticator apps are the most secure — SMS is the most practical in Kenya. Enable both.</div>
            </div>
            <Field label="Grace period (days)" className="col-md-6" hint="How long members have to enrol before lockout.">
              <input type="number" min={0} max={30} className="form-control" value={grace} onChange={(e) => setGrace(e.target.value)} />
            </Field>
            <div className="col-12"><div className="pm-note soft"><i className="bi bi-info-circle me-1" />During the grace period they'll see a reminder banner at every login. After it expires, login is blocked until they enrol.</div></div>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3"><i className="bi bi-megaphone me-1 text-primary" />On activation we notify all {affected.length} affected member(s) by email + WhatsApp with a step-by-step enrolment link.</div>
            <div className="pm-timeline">
              <div className="pm-tl-item done"><div className="pm-tl-dot" /><div className="pm-tl-title">Today — policy activated</div><div className="pm-tl-time">Members notified immediately</div></div>
              <div className="pm-tl-item current"><div className="pm-tl-dot" /><div className="pm-tl-title">Day 1–{grace} — grace period</div><div className="pm-tl-time">Login reminder banner shown each session</div></div>
              <div className="pm-tl-item"><div className="pm-tl-dot" /><div className="pm-tl-title">Day {Number(grace) + 1} — enforcement</div><div className="pm-tl-time">Members without 2FA cannot sign in until enrolled</div></div>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   BULK PERMISSIONS WIZARD — 3 steps
================================================================== */
export function BulkWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { members, roles, bulkUpdateRole } = useStore();
  const preIds = (payload.ids as string[]) ?? [];
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>(preIds);
  const [roleId, setRoleId] = useState<RoleId>("staff");
  const eligible = members.filter((m) => m.roleId !== "owner");
  const role = roles.find((r) => r.id === roleId);

  return (
    <Modal open onClose={onClose} title="Bulk role change" subtitle="3 steps · change several members at once, safely" icon="bi-people" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={step === 0 && selected.length === 0} onClick={() => setStep((s) => s + 1)}>
              Next <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => { bulkUpdateRole(selected, roleId); onClose(); }}>
              <i className="bi bi-check2-circle me-1" /> Apply to {selected.length}
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Select members", icon: "bi-check2-square" }, { label: "New role", icon: "bi-shield-lock" }, { label: "Review", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            {eligible.map((m) => (
              <div key={m.id} className="d-flex align-items-center gap-2 p-2 mb-1" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                <div className="form-check mb-0"><input className="form-check-input" type="checkbox" checked={selected.includes(m.id)} onChange={() => setSelected((s) => s.includes(m.id) ? s.filter((x) => x !== m.id) : [...s, m.id])} /></div>
                <span className="pm-avatar" style={{ width: 28, height: 28, fontSize: "0.62rem", background: m.avatarColor }}>{m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                <b style={{ fontSize: "0.82rem" }} className="flex-grow-1">{m.name}</b>
                <Badge tone="slate">{roles.find((r) => r.id === m.roleId)?.name}</Badge>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            {roles.filter((r) => r.id !== "owner").map((r) => (
              <button key={r.id} type="button" className={`pm-theme-card text-start p-2 ${roleId === r.id ? "sel" : ""}`} onClick={() => setRoleId(r.id)}>
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${r.icon}`} style={{ color: r.color }} />
                  <b style={{ fontSize: "0.84rem" }}>{r.name}</b>
                  {roleId === r.id && <i className="bi bi-check-circle-fill text-primary ms-auto" />}
                </div>
                <div className="pm-prod-meta mt-1">{r.desc}</div>
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3"><i className="bi bi-exclamation-triangle me-1" />{selected.length} member(s) will become <b>{role?.name}</b>. Their previous permissions are replaced entirely.</div>
            {selected.map((id) => {
              const m = members.find((x) => x.id === id);
              const old = roles.find((r) => r.id === m?.roleId)?.name;
              return (
                <div key={id} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                  <b style={{ fontSize: "0.8rem" }} className="flex-grow-1">{m?.name}</b>
                  <span className="pm-prod-meta">{old}</span>
                  <i className="bi bi-arrow-right text-primary" />
                  <b style={{ fontSize: "0.8rem" }}>{role?.name}</b>
                </div>
              );
            })}
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}
