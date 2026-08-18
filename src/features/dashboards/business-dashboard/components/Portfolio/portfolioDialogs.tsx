import { useState } from "react";
import {
  BS_ASSETS, BS_LIABILITIES, PL_EXPENSES, PL_REVENUE, VACANCY, fmtKES,
} from "./data";
import { useStore } from "./store";
import { Badge, Chip, Drawer, Field, Modal, StatusBadge } from "./ui";

/* ==================================================================
   ENTITY DRAWER — deep dive into one entity
================================================================== */
export function EntityDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { entities, folders, setCurrentEntityId, openModal } = useStore();
  const e = entities.find((x) => x.id === String(payload.id));
  if (!e) return null;
  const net = e.revenueMTD - e.expensesMTD;
  const folder = folders.find((f) => f.id === e.folder);
  return (
    <Drawer open onClose={onClose} icon="bi-buildings" title={e.name} subtitle={`${e.type} · ${folder?.emoji} ${folder?.name} · KRA ${e.krapin ?? "—"}`}>
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={e.status} />
        <Badge tone="slate">{e.type}</Badge>
        {e.type === "Rental" && <Badge tone="amber">{e.units} units</Badge>}
      </div>
      <div className="row g-2 mb-3">
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Cash</div><b>{fmtKES(e.cash)}</b></div></div>
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Revenue MTD</div><b>{fmtKES(e.revenueMTD)}</b></div></div>
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Expenses MTD</div><b>{fmtKES(e.expensesMTD)}</b></div></div>
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Net profit MTD</div><b className="text-primary">{fmtKES(net)}</b></div></div>
      </div>
      <div className="pm-card mb-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
        <div className="pm-kpi-label mb-1">Margin</div>
        <div className="progress" style={{ height: 9 }}>
          <div className="progress-bar" style={{ width: `${Math.min(100, Math.round((net / (e.revenueMTD || 1)) * 100))}%` }} />
        </div>
        <div className="pm-prod-meta mt-1">{Math.round((net / (e.revenueMTD || 1)) * 100)}% net margin · tax exposure {fmtKES(e.taxExposure)}</div>
      </div>
      <div className="row g-2">
        <div className="col-12">
          <button type="button" className="btn btn-primary btn-sm w-100" onClick={() => { setCurrentEntityId(e.id); onClose(); }}>
            <i className="bi bi-box-arrow-in-right me-1" /> Jump into {e.name} {e.type === "Rental" ? "(rental context)" : ""}
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { onClose(); openModal("transferWizard"); }}>
            <i className="bi bi-arrow-left-right me-1" /> Transfer funds
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { onClose(); openModal("consolidatedPnL"); }}>
            <i className="bi bi-journal-check me-1" /> Group P&amp;L
          </button>
        </div>
        {e.type === "Rental" && (
          <div className="col-6">
            <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { onClose(); openModal("tenantWizard"); }}>
              <i className="bi bi-person-plus me-1" /> Add tenant
            </button>
          </div>
        )}
        {e.type === "Rental" && (
          <div className="col-6">
            <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { onClose(); openModal("depositLedger", { entityId: e.id }); }}>
              <i className="bi bi-cash-stack me-1" /> Deposits
            </button>
          </div>
        )}
      </div>
    </Drawer>
  );
}

/* ==================================================================
   TRANSFER DETAIL — approval workflow
================================================================== */
export function TransferDetailModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { transfers, approveTransfer } = useStore();
  const t = transfers.find((x) => x.id === String(payload.id));
  if (!t) return null;
  return (
    <Modal open onClose={onClose} title={t.id} subtitle={`${t.date} · ${t.type}`} icon="bi-arrow-left-right" size="md"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          {t.status === "Pending approval" && (
            <button type="button" className="btn btn-success" onClick={() => { approveTransfer(t.id); onClose(); }}>
              <i className="bi bi-check2-all me-1" /> Approve &amp; execute
            </button>
          )}
        </>
      }
    >
      <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap py-2 mb-3">
        <span className="fw-bold">🏛️ {t.from}</span>
        <span className="badge-soft ink pm-mono" style={{ fontSize: "1rem" }}>{fmtKES(t.amount)}</span>
        <i className="bi bi-arrow-right text-primary" />
        <span className="fw-bold">🏛️ {t.to}</span>
      </div>
      <div className="d-flex align-items-center gap-2 mb-3">
        <StatusBadge status={t.status} />
        <Badge tone="slate">{t.type}</Badge>
      </div>
      <div className="pm-note mb-3"><i className="bi bi-chat-left-text me-1" />{t.reason}</div>
      {t.note && <div className={t.status === "Pending approval" ? "pm-note" : "pm-note soft"}><i className={t.status === "Pending approval" ? "bi bi-exclamation-triangle me-1" : "bi bi-check2-circle me-1 text-primary"} />{t.note}</div>}
      {t.status === "Pending approval" && (
        <div className="pm-kpi-label mt-3 mb-1">Approval rule hit</div>
      )}
      {t.status === "Pending approval" && (
        <div className="pm-prod-meta">R-01: transfers above KES 1,000,000 require Portfolio Owner approval. No funds move until you approve.</div>
      )}
      {t.status === "Executed" && (
        <div className="pm-prod-meta mt-3"><i className="bi bi-shield-check me-1 text-primary" />Executed instantly on the internal ledger — no bank fees, and the consolidation engine eliminates it automatically.</div>
      )}
    </Modal>
  );
}

/* ==================================================================
   LOAN DRAWER
================================================================== */
export function LoanDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { loans, payLoanInstalment, openModal, toast } = useStore();
  const l = loans.find((x) => x.id === String(payload.id));
  const [paying, setPaying] = useState(false);
  if (!l) return null;
  const pct = Math.round((l.paidCount / l.termMonths) * 100);
  return (
    <Drawer open onClose={onClose} icon="bi-bank" title={l.id} subtitle={`${l.from} → ${l.to} · ${l.rate === null ? "interest-free" : l.rate + "% p.a."}`}>
      <div className="row g-2 mb-3">
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Principal</div><b>{fmtKES(l.principal)}</b></div></div>
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Outstanding</div><b className="text-primary">{fmtKES(l.outstanding)}</b></div></div>
      </div>
      <div className="d-flex justify-content-between mb-1">
        <span className="pm-kpi-label">Repayment progress</span>
        <span className="pm-prod-meta">{l.paidCount}/{l.termMonths} paid</span>
      </div>
      <div className="progress mb-3" style={{ height: 9 }}><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
      <div className="pm-kpi-label mb-2">Schedule</div>
      <div className="table-responsive" style={{ maxHeight: 260, overflowY: "auto" }}>
        <table className="table pm-table align-middle">
          <thead><tr><th>#</th><th>Date</th><th className="text-end">Amount</th><th>Status</th></tr></thead>
          <tbody>
            {l.schedule.map((r) => (
              <tr key={r.n}>
                <td className="pm-prod-meta">{r.n}</td>
                <td style={{ fontSize: "0.78rem" }}>{r.date}</td>
                <td className="text-end fw-bold" style={{ fontSize: "0.8rem" }}>{r.amount.toLocaleString()}</td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {l.note && <div className="pm-note soft mt-2"><i className="bi bi-chat-left-text me-1" />{l.note}</div>}
      <div className="row g-2 mt-3">
        {l.outstanding > 0 && (
          <div className="col-12">
            <button type="button" className="btn btn-primary btn-sm w-100" disabled={paying} onClick={() => {
              const due = l.schedule.find((r) => r.status === "Due");
              setPaying(true);
              window.setTimeout(() => { setPaying(false); payLoanInstalment(l.id, due?.amount ?? 0); }, 900);
            }}>
              {paying ? <><span className="pm-spin me-1">◌</span> Posting…</> : <><i className="bi bi-cash-stack me-1" /> Pay next instalment</>}
            </button>
          </div>
        )}
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { openModal("consolidatedPnL"); toast("Consolidated report opened — this loan eliminates in the adjusted view.", "info", "Consolidation"); }}>
            <i className="bi bi-journal-check me-1" /> In consolidation
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => toast("Loan statement downloaded (PDF).", "info", "Statement")}>
            <i className="bi bi-printer me-1" /> Statement
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ==================================================================
   TENANT DRAWER
================================================================== */
export function TenantDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { tenants, entities, openModal } = useStore();
  const t = tenants.find((x) => x.id === String(payload.id));
  if (!t) return null;
  const prop = entities.find((e) => e.id === t.entityId);
  return (
    <Drawer open onClose={onClose} icon="bi-person" title={t.name} subtitle={`${prop?.name} · Unit ${t.unit} · since ${t.since}`}>
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={t.status === "Active" ? "Active" : t.status === "Overdue" ? "Overdue" : t.status === "Notice" ? "Notice" : "Vacant"} />
        <Badge tone="slate">{t.phone}</Badge>
        {t.email && <Badge tone="slate">{t.email}</Badge>}
      </div>
      <div className="row g-2 mb-3">
        <div className="col-4"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Rent</div><b>{fmtKES(t.rent)}/mo</b></div></div>
        <div className="col-4"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Deposit</div><b>{fmtKES(t.deposit)}</b></div></div>
        <div className="col-4"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Lease</div><b style={{ fontSize: "0.72rem" }}>{t.leaseStart}<br />→ {t.leaseEnd}</b></div></div>
      </div>
      <div className="pm-kpi-label mb-2">Payment history</div>
      {["Dec", "Nov", "Oct"].map((m) => (
        <div key={m} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
          <i className={`bi ${m === "Dec" && t.status === "Overdue" ? "bi-exclamation-circle-fill" : "bi-check-circle-fill"}`} style={{ color: m === "Dec" && t.status === "Overdue" ? "var(--pm-danger)" : "var(--pm-green)" }} />
          <span style={{ fontSize: "0.8rem" }} className="flex-grow-1">{m} rent</span>
          {m === "Dec" && t.status === "Overdue" ? <Badge tone="red">KES {t.rent.toLocaleString()} due</Badge> : <Badge tone="green">Paid · M-Pesa</Badge>}
        </div>
      ))}
      <div className="row g-2 mt-3">
        <div className="col-6">
          <button type="button" className="btn btn-primary btn-sm w-100" onClick={() => openModal("rentReminder", { tenantId: t.id })}>
            <i className="bi bi-bell me-1" /> Rent reminder
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => openModal("depositStatement", { tenantId: t.id })}>
            <i className="bi bi-file-earmark-text me-1" /> Deposit statement
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => openModal("maintenanceWizard")}>
            <i className="bi bi-droplet me-1" /> Log issue
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => openModal("moveOutWizard", { tenantId: t.id })}>
            <i className="bi bi-person-x me-1" /> Move-out
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ==================================================================
   RENT UNIT POPUP (click a unit in the grid)
================================================================== */
export function RentUnitModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { tenants, openModal } = useStore();
  const unit = String(payload.unit ?? "2B");
  const entityId = String(payload.entityId ?? "e3");
  const t = tenants.find((x) => x.unit === unit && x.entityId === entityId);
  return (
    <Modal open onClose={onClose} title={`Unit ${unit}`} subtitle="Kilimani House 1 · rent KES 30,000/month" icon="bi-door-open" size="sm"
      footer={
        t ? (
          <>
            <button type="button" className="btn btn-outline-secondary" onClick={() => { onClose(); openModal("tenantDrawer", { id: t.id }); }}>
              <i className="bi bi-eye me-1" /> Tenant profile
            </button>
            {t.status === "Overdue" && (
              <button type="button" className="btn btn-primary" onClick={() => { onClose(); openModal("rentReminder", { tenantId: t.id }); }}>
                <i className="bi bi-bell me-1" /> Send rent reminder
              </button>
            )}
            {t.status === "Active" && (
              <button type="button" className="btn btn-primary" onClick={() => { onClose(); openModal("rentReminder", { tenantId: t.id }); }}>
                <i className="bi bi-check2-circle me-1" /> Mark rent paid
              </button>
            )}
          </>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => { onClose(); openModal("tenantWizard"); }}>
            <i className="bi bi-person-plus me-1" /> List a tenant
          </button>
        )
      }
    >
      {t ? (
        <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
          <div className="d-flex align-items-center gap-3">
            <span className="pm-avatar" style={{ width: 44, height: 44 }}>{t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
            <div>
              <b>{t.name}</b>
              <div className="pm-prod-meta">{t.phone} · lease {t.leaseStart} → {t.leaseEnd}</div>
              <div className="mt-1"><StatusBadge status={t.status === "Active" ? "Active" : t.status === "Overdue" ? "Overdue" : t.status === "Notice" ? "Notice" : "Vacant"} /></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-3">
          <span style={{ fontSize: "2rem" }}>🏚️</span>
          <h6 className="mt-2">Unit vacant</h6>
          <p className="pm-prod-meta">KES 30,000/month vacancy loss accumulating — list a tenant to stop the bleed.</p>
        </div>
      )}
    </Modal>
  );
}

/* ==================================================================
   RENT REMINDER
================================================================== */
export function RentReminderModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { tenants, sendReminder } = useStore();
  const t = tenants.find((x) => x.id === String(payload.tenantId));
  const [template, setTemplate] = useState("Friendly reminder");
  const [channels, setChannels] = useState({ whatsapp: true, sms: true, email: false });
  if (!t) return null;
  return (
    <Modal open onClose={onClose} title="Send rent reminder" subtitle={`${t.name} · Unit ${t.unit} · ${fmtKES(t.rent)} due`} icon="bi-bell"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={!Object.values(channels).some(Boolean)} onClick={() => {
            const names = Object.entries(channels).filter(([, v]) => v).map(([k]) => k === "whatsapp" ? "WhatsApp" : k === "sms" ? "SMS" : "Email").join(" + ");
            sendReminder(t.id, names);
            onClose();
          }}>
            <i className="bi bi-send me-1" /> Send via {Object.values(channels).filter(Boolean).length} channel(s)
          </button>
        </>
      }
    >
      <Field label="Template" className="mb-3">
        <select className="form-select" value={template} onChange={(e) => setTemplate(e.target.value)}>
          <option>Friendly reminder</option>
          <option>Formal notice (day 10+)</option>
          <option>Final demand before action</option>
        </select>
      </Field>
      <div className="pm-wa-preview mb-3">
        <div className="pm-wa-head"><i className="bi bi-whatsapp" /> Preview</div>
        <div className="pm-wa-bubble">
          {template === "Friendly reminder"
            ? `Habari ${t.name.split(" ")[0]}! 🌿 Rent for Unit ${t.unit} (${fmtKES(t.rent)}) is now due. Please pay via M-Pesa Paybill 247247, account ${t.unit}-RENT. Asante!`
            : template === "Formal notice (day 10+)"
              ? `Dear ${t.name}, rent for Unit ${t.unit} is now 10 days overdue. Please settle ${fmtKES(t.rent)} immediately to avoid late charges per your lease clause 4.2.`
              : `FINAL DEMAND: ${t.name}, rent arrears of ${fmtKES(t.rent)} for Unit ${t.unit} must be settled within 48 hours or we will proceed with action per the lease agreement.`}
        </div>
      </div>
      {[
        { k: "whatsapp" as const, t: "WhatsApp", icon: "bi-whatsapp" },
        { k: "sms" as const, t: "SMS", icon: "bi-chat-left-text" },
        { k: "email" as const, t: "Email", icon: "bi-envelope" },
      ].map((c) => (
        <div key={c.k} className="d-flex align-items-center gap-2 py-1">
          <i className={`bi ${c.icon}`} style={{ width: 20 }} />
          <span style={{ fontSize: "0.84rem" }} className="flex-grow-1">{c.t}</span>
          <div className="form-check form-switch mb-0">
            <input className="form-check-input" type="checkbox" checked={channels[c.k]} onChange={(e) => setChannels((s) => ({ ...s, [c.k]: e.target.checked }))} />
          </div>
        </div>
      ))}
    </Modal>
  );
}

/* ==================================================================
   DEPOSIT LEDGER MODAL
================================================================== */
export function DepositLedgerModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { deposits, tenants } = useStore();
  const held = deposits.reduce((a, d) => a + d.amount, 0);
  return (
    <Modal open onClose={onClose} title="Security deposits ledger" subtitle={`Held as a liability · ${tenants.filter((t) => t.status !== "Vacant").length} active deposits`} icon="bi-cash-stack" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>}
    >
      <div className="pm-card mb-3" style={{ background: "var(--pm-green-soft)", border: "none" }}>
        <div className="d-flex justify-content-between">
          <span><div className="pm-kpi-label">Total held</div><b style={{ fontSize: "1.2rem" }}>{fmtKES(held)}</b></span>
          <span><div className="pm-kpi-label">Account</div><b>Security Deposits Liability</b></span>
          <span><div className="pm-kpi-label">Rule</div><b>Never touchable as income</b></span>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table pm-table align-middle">
          <thead><tr><th>Date</th><th>Tenant</th><th>Type</th><th className="text-end">Amount</th><th>Note</th></tr></thead>
          <tbody>
            {deposits.map((d) => (
              <tr key={d.id}>
                <td className="pm-prod-meta">{d.date}</td>
                <td style={{ fontSize: "0.82rem" }}>{d.tenant}</td>
                <td><StatusBadge status={d.type === "Move-in" ? "Active" : d.type === "Deduction" ? "Destroyed" : "Refunded"} /></td>
                <td className={`text-end fw-bold ${d.amount < 0 ? "pm-qtyneg" : "pm-qtypos"}`}>{d.amount >= 0 ? "+" : ""}{fmtKES(d.amount)}</td>
                <td className="pm-prod-meta">{d.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pm-note soft mt-2"><i className="bi bi-shield-check me-1" />Deposits refund within 7 days of move-out, minus documented deductions with photo evidence.</div>
    </Modal>
  );
}

/* ==================================================================
   DEPOSIT STATEMENT
================================================================== */
export function DepositStatementModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { tenants, toast } = useStore();
  const t = tenants.find((x) => x.id === String(payload.tenantId));
  if (!t) return null;
  return (
    <Modal open onClose={onClose} title="Deposit statement" subtitle={`For ${t.name} · Unit ${t.unit}`} icon="bi-file-earmark-text"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => { toast("Deposit statement downloaded & sent to tenant via WhatsApp.", "success", "Statement sent"); onClose(); }}>
            <i className="bi bi-send me-1" /> Send & download
          </button>
        </>
      }
    >
      <div className="p-3" style={{ border: "1px dashed var(--pm-border)", borderRadius: 12 }}>
        <div className="d-flex justify-content-between">
          <div>
            <div className="fw-bold">Security Deposit Statement</div>
            <div className="pm-prod-meta">Kilimani House 1 · Nairobi</div>
          </div>
          <div className="text-end"><div className="fw-bold">{t.name}</div><div className="pm-prod-meta">Unit {t.unit} · {t.phone}</div></div>
        </div>
        <hr />
        <div className="d-flex justify-content-between"><span style={{ fontSize: "0.82rem" }}>Deposit paid ({t.leaseStart})</span><b>{fmtKES(t.deposit)}</b></div>
        <div className="d-flex justify-content-between"><span style={{ fontSize: "0.82rem" }}>Deductions</span><b>KES 0</b></div>
        <div className="d-flex justify-content-between"><span style={{ fontSize: "0.82rem" }}>Interest (per tenancy law)</span><b>KES 0</b></div>
        <hr />
        <div className="d-flex justify-content-between fw-bold"><span>Balance held</span><span className="text-primary">{fmtKES(t.deposit)}</span></div>
        <div className="pm-prod-meta mt-2">Refundable within 7 days of move-out · this statement is auto-generated and can be disputed via the tenant portal.</div>
      </div>
    </Modal>
  );
}

/* ==================================================================
   MAINTENANCE DETAIL — assign vendor / resolve
================================================================== */
export function MaintenanceDetailModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { maintenance, assignMaintenance, resolveMaintenance, toast } = useStore();
  const m = maintenance.find((x) => x.id === String(payload.id));
  const [vendor, setVendor] = useState("Fundi John Mwangi");
  const [cost, setCost] = useState("3500");
  if (!m) return null;
  return (
    <Modal open onClose={onClose} title={m.id} subtitle={`Unit ${m.unit} · ${m.date}`} icon="bi-droplet"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          {m.status === "Open" && (
            <button type="button" className="btn btn-primary" onClick={() => {
              assignMaintenance(m.id, vendor, Number(cost) || 0);
              toast(`Draft PO sent to Pay Suppliers for ${vendor}.`, "info", "Vendor assigned");
              onClose();
            }}>
              <i className="bi bi-person-check me-1" /> Assign vendor
            </button>
          )}
          {m.status === "Assigned" && (
            <button type="button" className="btn btn-success" onClick={() => { resolveMaintenance(m.id, m.cost || Number(cost) || 0); onClose(); }}>
              <i className="bi bi-check2-circle me-1" /> Mark resolved
            </button>
          )}
        </>
      }
    >
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={m.status} />
        <Badge tone={m.priority === "Emergency" ? "red" : m.priority === "High" ? "amber" : "green"}>{m.priority}</Badge>
        {m.photos > 0 && <Badge tone="slate">📷 {m.photos} photo(s)</Badge>}
      </div>
      <div className="pm-note mb-3"><i className="bi bi-chat-square-text me-1" />"{m.issue}"</div>
      {m.status === "Open" && (
        <div className="row g-3">
          <Field label="Vendor" className="col-md-6">
            <select className="form-select" value={vendor} onChange={(e) => setVendor(e.target.value)}>
              <option>Fundi John Mwangi</option><option>SecureGate Ltd</option><option>QuickFix Plumbing</option><option>Other…</option>
            </select>
          </Field>
          <Field label="Est. cost (KES)" className="col-md-6">
            <div className="input-group"><span className="input-group-text">KES</span>
              <input type="number" min={0} className="form-control" value={cost} onChange={(e) => setCost(e.target.value)} /></div>
          </Field>
          <div className="col-12">
            <div className="pm-note soft"><i className="bi bi-truck me-1" />Assigning creates a purchase order on the Pay Suppliers page — the vendor invoice matches against it.</div>
          </div>
        </div>
      )}
      {m.status === "Assigned" && (
        <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
          <div className="d-flex justify-content-between"><span className="pm-prod-meta">Vendor</span><b>{m.vendor}</b></div>
          <div className="d-flex justify-content-between"><span className="pm-prod-meta">Est. cost</span><b>{fmtKES(m.cost)}</b></div>
          <div className="d-flex justify-content-between"><span className="pm-prod-meta">SLA</span><b>{m.priority === "Emergency" ? "1 hour" : "48 hours"}</b></div>
        </div>
      )}
      {m.status === "Resolved" && (
        <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
          <div className="d-flex justify-content-between"><span className="pm-prod-meta">Vendor</span><b>{m.vendor}</b></div>
          <div className="d-flex justify-content-between"><span className="pm-prod-meta">Final cost</span><b>{fmtKES(m.cost)}</b></div>
          <div className="pm-prod-meta mt-2"><i className="bi bi-check2-circle me-1 text-primary" />Cost posted to the property P&amp;L — visible in group reports.</div>
        </div>
      )}
    </Modal>
  );
}

/* ==================================================================
   CONSOLIDATED P&L — with eliminations
================================================================== */
export function ConsolidatedPnLModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { entities, openModal } = useStore();
  const [checked, setChecked] = useState<Set<string>>(new Set(entities.map((e) => e.id)));
  const included = entities.filter((e) => checked.has(e.id));
  const revTotal = PL_REVENUE.reduce((a, r) => a + r.TS + r.Tech + r.Rental + r.Sanaa, 0);
  const expTotal = PL_EXPENSES.reduce((a, r) => a + r.TS + r.Tech + r.Rental + r.Sanaa, 0);
  const eliminations = 150000;
  const unadjusted = revTotal - expTotal;
  const adjusted = unadjusted - 20000; // inter-company markup
  return (
    <Modal open onClose={onClose} title="Consolidated P&L" subtitle="Group performance with inter-company eliminations" icon="bi-journal-check" size="xl" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { onClose(); openModal("consolidatedBS"); }}>
            <i className="bi bi-bank me-1" /> Balance sheet
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { onClose(); openModal("exportData"); }}>
            <i className="bi bi-download me-1" /> Export
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
        </>
      }
    >
      <div className="pm-note mb-3"><i className="bi bi-funnel me-1" />Include in consolidation:</div>
      <div className="d-flex gap-1 flex-wrap mb-3">
        {entities.map((e) => (
          <Chip key={e.id} on={checked.has(e.id)} onClick={() => setChecked((s) => { const n = new Set(s); if (n.has(e.id)) n.delete(e.id); else n.add(e.id); return n; })}>
            {e.emoji} {e.name}
          </Chip>
        ))}
      </div>
      <div className="table-responsive">
        <table className="table pm-table align-middle">
          <thead><tr><th>Line</th><th className="text-end">TS Retail</th><th className="text-end">TechSolutions</th><th className="text-end">Rentals</th><th className="text-end">Sanaa</th><th className="text-end">Group</th></tr></thead>
          <tbody>
            <tr><td colSpan={6} className="pm-kpi-label">Revenue</td></tr>
            {PL_REVENUE.map((r) => (
              <tr key={r.line}>
                <td style={{ fontSize: "0.8rem" }}>{r.line}</td>
                <td className="text-end pm-prod-meta">{r.TS ? r.TS.toLocaleString() : "—"}</td>
                <td className="text-end pm-prod-meta">{r.Tech ? r.Tech.toLocaleString() : "—"}</td>
                <td className="text-end pm-prod-meta">{r.Rental ? r.Rental.toLocaleString() : "—"}</td>
                <td className="text-end pm-prod-meta">{r.Sanaa ? r.Sanaa.toLocaleString() : "—"}</td>
                <td className="text-end pm-prod-meta">{(r.TS + r.Tech + r.Rental + r.Sanaa).toLocaleString()}</td>
              </tr>
            ))}
            <tr><td colSpan={6} className="pm-kpi-label">Expenses</td></tr>
            {PL_EXPENSES.map((r) => (
              <tr key={r.line}>
                <td style={{ fontSize: "0.8rem" }}>{r.line}</td>
                <td className="text-end pm-prod-meta">{r.TS ? r.TS.toLocaleString() : "—"}</td>
                <td className="text-end pm-prod-meta">{r.Tech ? r.Tech.toLocaleString() : "—"}</td>
                <td className="text-end pm-prod-meta">{r.Rental ? r.Rental.toLocaleString() : "—"}</td>
                <td className="text-end pm-prod-meta">{r.Sanaa ? r.Sanaa.toLocaleString() : "—"}</td>
                <td className="text-end pm-prod-meta">{(r.TS + r.Tech + r.Rental + r.Sanaa).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pm-card mt-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
        <div className="d-flex justify-content-between"><span className="fw-semibold">Unadjusted net profit</span><b>{fmtKES(unadjusted)}</b></div>
        <div className="d-flex justify-content-between pm-prod-meta"><span>Inter-company eliminations (KES {eliminations.toLocaleString()} transfers, KES 20,000 markup)</span><b>−KES 20,000</b></div>
        <div className="d-flex justify-content-between mt-1" style={{ borderTop: "1px dashed var(--pm-border)", paddingTop: 6 }}><span className="fw-bold">Adjusted (true group) profit</span><b className="text-primary">{fmtKES(adjusted)}</b></div>
      </div>
      <div className="pm-note soft mt-2"><i className="bi bi-info-circle me-1" />{included.length}/{entities.length} entities included. Transfers between your own entities cancel out — that's the elimination.</div>
    </Modal>
  );
}

/* ==================================================================
   CONSOLIDATED BALANCE SHEET
================================================================== */
export function ConsolidatedBSModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast } = useStore();
  const assets = BS_ASSETS.reduce((a, b) => a + b.value, 0);
  const liabilities = BS_LIABILITIES.reduce((a, b) => a + b.value, 0);
  return (
    <Modal open onClose={onClose} title="Consolidated balance sheet" subtitle="Group position — assets, liabilities & equity" icon="bi-bank" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => toast("Balance sheet downloaded (PDF, banker-ready).", "info", "Export")}>
            <i className="bi bi-download me-1" /> Download
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
        </>
      }
    >
      <div className="row g-3">
        <div className="col-md-6">
          <div className="pm-kpi-label mb-2">Assets</div>
          {BS_ASSETS.map((a) => (
            <div key={a.line} className="d-flex justify-content-between py-1" style={{ borderBottom: "1px solid var(--pm-border)", fontSize: "0.82rem" }}>
              <span>{a.line}</span><b>{fmtKES(a.value)}</b>
            </div>
          ))}
          <div className="d-flex justify-content-between mt-2"><b>Total assets</b><b>{fmtKES(assets)}</b></div>
        </div>
        <div className="col-md-6">
          <div className="pm-kpi-label mb-2">Liabilities</div>
          {BS_LIABILITIES.map((a) => (
            <div key={a.line} className="d-flex justify-content-between py-1" style={{ borderBottom: "1px solid var(--pm-border)", fontSize: "0.82rem" }}>
              <span>{a.line}</span><b>{fmtKES(a.value)}</b>
            </div>
          ))}
          <div className="d-flex justify-content-between mt-2"><b>Total liabilities</b><b>{fmtKES(liabilities)}</b></div>
          <div className="d-flex justify-content-between mt-1 text-primary"><b>Owner's equity</b><b>{fmtKES(assets - liabilities)}</b></div>
        </div>
      </div>
      <div className="pm-note soft mt-3"><i className="bi bi-shield-check me-1" />Inter-company receivables &amp; payables (KES 1.29M) cancel out between your entities — already eliminated above.</div>
    </Modal>
  );
}

/* ==================================================================
   ACCESS MATRIX MODAL
================================================================== */
export function MatrixModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { team, entities, updateMatrix, addTeamMember, toast, recordActivity } = useStore();
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Staff");
  const levels = ["No Access", "Viewer", "Standard", "Admin"] as const;
  return (
    <Modal open onClose={onClose} title="Access control matrix" subtitle="Who can see what — enforced at the API layer, 403s before data is queried" icon="bi-shield-lock" size="xl" hideClose
      footer={
        <>
          <div className="input-group me-auto" style={{ maxWidth: 380 }}>
            <input className="form-control" placeholder="Invite name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <select className="form-select" style={{ maxWidth: 130 }} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option>Staff</option><option>Caretaker</option><option>Accountant</option><option>Manager</option>
            </select>
            <button type="button" className="btn btn-outline-primary" disabled={!newName.trim()} onClick={() => { addTeamMember(newName.trim(), newRole); toast(`${newName} invited — starts with No Access everywhere.`, "success", "Member added"); setNewName(""); }}>
              <i className="bi bi-person-plus" />
            </button>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => { recordActivity("Access matrix saved", "bi-shield-lock"); toast("Matrix saved — permissions apply immediately.", "success", "Matrix updated"); onClose(); }}>
            <i className="bi bi-check2 me-1" /> Save matrix
          </button>
        </>
      }
    >
      <div className="table-responsive">
        <table className="table pm-table align-middle">
          <thead>
            <tr>
              <th style={{ minWidth: 150 }}>Team member</th>
              {entities.map((e) => <th key={e.id} className="text-center">{e.emoji}<br /><span style={{ fontSize: "0.62rem" }}>{e.name.split(" ")[0]}</span></th>)}
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {team.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="fw-semibold" style={{ fontSize: "0.8rem" }}>{u.name}</div>
                  <div className="pm-prod-meta">{u.role}{u.managerOf && <> · manages {u.managerOf}</>}</div>
                </td>
                {entities.map((e) => (
                  <td key={e.id} className="text-center">
                    <select
                      className="form-select form-select-sm pm-matrix-cell"
                      style={{ width: 116, margin: "0 auto", fontWeight: 600, fontSize: "0.7rem" }}
                      value={u.matrix[e.id]}
                      disabled={u.role === "Portfolio Owner"}
                      onChange={(ev) => updateMatrix(u.id, e.id, ev.target.value as (typeof levels)[number])}
                    >
                      {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </td>
                ))}
                <td className="pm-prod-meta" style={{ fontSize: "0.68rem", maxWidth: 130 }}>
                  {u.role === "Portfolio Owner" ? "Admin everywhere (locked)" : u.managerOf ? `Inherits Standard on all Rental Properties unless overridden` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pm-note soft mt-2">
        <i className="bi bi-shield-check me-1" />Enforced at the API middleware level: James (caretaker) requesting House 2 data gets <b>403 Forbidden</b> before any query runs. Every access attempt is audit-logged.
      </div>
    </Modal>
  );
}

/* ==================================================================
   TAX CALENDAR MODAL
================================================================== */
export function TaxCalendarModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { taxItems, payTax, entities } = useStore();
  const totalDue = taxItems.filter((t) => t.status === "Due").reduce((a, b) => a + b.amount, 0);
  const totalUpcoming = taxItems.filter((t) => t.status === "Upcoming").reduce((a, b) => a + b.amount, 0);
  return (
    <Modal open onClose={onClose} title="Group tax calendar" subtitle="Every deadline, every entity — one place" icon="bi-calendar3" size="lg" hideClose
      footer={<button type="button" className="btn btn-primary" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>}
    >
      <div className="pm-stat-grid mb-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <div className="pm-card py-3" style={{ boxShadow: "none", background: "#fef6f5" }}><div className="pm-kpi-label">Due now</div><div className="pm-kpi-value" style={{ color: "var(--pm-danger)", fontSize: "1.3rem" }}>{fmtKES(totalDue)}</div></div>
        <div className="pm-card py-3" style={{ boxShadow: "none" }}><div className="pm-kpi-label">Upcoming</div><div className="pm-kpi-value" style={{ fontSize: "1.3rem" }}>{fmtKES(totalUpcoming)}</div></div>
        <div className="pm-card py-3" style={{ boxShadow: "none" }}><div className="pm-kpi-label">Entities filing</div><div className="pm-kpi-value" style={{ fontSize: "1.3rem" }}>{entities.length}</div></div>
      </div>
      {taxItems.map((t) => (
        <div key={t.id} className="d-flex align-items-center gap-2 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 12 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: "#f2f4f8", display: "grid", placeItems: "center", fontSize: "0.8rem" }}>
            {entities.find((e) => e.name === t.entity)?.emoji}
          </span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <b style={{ fontSize: "0.82rem" }}>{t.type} · {t.entity}</b>
            <div className="pm-prod-meta">due {t.due} · {fmtKES(t.amount)}</div>
          </div>
          <StatusBadge status={t.status} />
          {t.status !== "Paid" && (
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => payTax(t.id)}>
              <i className="bi bi-receipt me-1" />File &amp; pay
            </button>
          )}
        </div>
      ))}
      <div className="pm-note mt-3"><i className="bi bi-exclamation-triangle me-1" />Each legal entity files separately — KRA does not allow consolidated returns. This calendar just makes sure none slips.</div>
    </Modal>
  );
}

/* ==================================================================
   VACANCY MODAL
================================================================== */
export function VacancyModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal, toast } = useStore();
  return (
    <Modal open onClose={onClose} title="Vacancy tracking" subtitle="Empty units cost you rent every single day" icon="bi-house-door"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => { onClose(); openModal("tenantWizard"); }}>
            <i className="bi bi-person-plus me-1" /> List a tenant
          </button>
        </>
      }
    >
      <div className="pm-card mb-3 text-center" style={{ background: "#fef6f5", border: "1px solid #f6d2cd" }}>
        <div style={{ fontSize: "1.8rem" }}>🏚️</div>
        <b>Unit {VACANCY.unit} — vacant {VACANCY.daysVacant} days</b>
        <div className="pm-prod-meta mb-1">{VACANCY.reason}</div>
        <div className="pm-kpi-label">Vacancy loss</div>
        <div className="pm-kpi-value" style={{ color: "var(--pm-danger)" }}>{fmtKES(VACANCY.loss)}</div>
        <div className="pm-prod-meta">accruing at {fmtKES(VACANCY.monthlyRent)}/month · posts to the property P&amp;L automatically</div>
      </div>
      <div className="row g-3">
        {["Repaint bedroom", "Fix window latch", "Deep clean"].map((a, i) => (
          <div className="col-md-4" key={a}>
            <div className="pm-card text-center" style={{ boxShadow: "none" }}>
              <i className={`bi ${i === 0 ? "bi-brush" : i === 1 ? "bi-tools" : "bi-droplet"}`} style={{ fontSize: "1.2rem", color: "var(--pm-green-dark)" }} />
              <div className="fw-semibold mt-1" style={{ fontSize: "0.78rem" }}>{a}</div>
              <div className="pm-prod-meta">{["Done ✓", "Done ✓", "Scheduled"][i]}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-note mt-3"><i className="bi bi-lightbulb me-1" />Every day vacant = KES 1,000 lost. List now — PayMo handles deposits, invoices and reminders for you.</div>
      <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={() => toast("Listing shared to Facebook Marketplace & WhatsApp groups.", "info", "Listing shared")}>Share listing →</button>
    </Modal>
  );
}

/* ==================================================================
   EXPORT PORTFOLIO DATA
================================================================== */
export function ExportDataModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const [format, setFormat] = useState("PDF");
  const [building, setBuilding] = useState(false);
  return (
    <Modal open onClose={onClose} title="Export portfolio report" subtitle="Banker-ready consolidated documents" icon="bi-download"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={building} onClick={() => {
            setBuilding(true);
            window.setTimeout(() => {
              setBuilding(false);
              recordActivity(`Portfolio ${format} export`, "bi-download");
              toast(`${format} report downloaded — consolidated P&L, balance sheet & tax calendar included.`, "success", "Report ready");
              onClose();
            }, 1300);
          }}>
            {building ? <><span className="pm-spin me-1">◌</span> Building…</> : <><i className="bi bi-download me-1" /> Export {format}</>}
          </button>
        </>
      }
    >
      <div className="d-flex gap-2 mb-3">
        {["PDF", "CSV", "Excel"].map((f) => (
          <button key={f} type="button" className={`pm-chip ${format === f ? "on" : ""}`} onClick={() => setFormat(f)}>{f}</button>
        ))}
      </div>
      {["Consolidated P&L (adjusted)", "Consolidated balance sheet", "Entity performance grid", "Inter-company transfer log", "Group tax calendar"].map((t) => (
        <div key={t} className="d-flex align-items-center gap-2 py-1">
          <i className="bi bi-check-circle-fill text-primary" />
          <span style={{ fontSize: "0.84rem" }}>{t}</span>
        </div>
      ))}
    </Modal>
  );
}

/* ==================================================================
   HELP MODAL
================================================================== */
export function HelpModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal, toast } = useStore();
  return (
    <Modal open onClose={onClose} title="Help & shortcuts" subtitle="Multi-Business Portfolio — every flow on this page" icon="bi-question-circle" size="lg"
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
          { icon: "bi-plus-circle", t: "Add Entity (5 steps)", d: "Rental preset: property → financials → auto-config (CoA, VA, rent templates) → tenants.", act: () => openModal("entityWizard") },
          { icon: "bi-arrow-left-right", t: "Transfer Wizard (3 steps)", d: "Free, instant inter-company moves. KES 1M+ requires owner approval.", act: () => openModal("transferWizard") },
          { icon: "bi-person-plus", t: "Tenant Wizard (4 steps)", d: "Tenant → unit & lease → deposit liability → rent invoices auto-scheduled.", act: () => openModal("tenantWizard") },
          { icon: "bi-person-x", t: "Move-Out Wizard (3 steps)", d: "Photo evidence → deductions → deposit refund, unit flips to Vacant.", act: () => openModal("moveOutWizard", { tenantId: "t5" }) },
          { icon: "bi-shield-lock", t: "Access Matrix", d: "Per-user, per-entity permissions — caretakers see only their property.", act: () => openModal("matrix") },
          { icon: "bi-journal-check", t: "Consolidated P&L", d: "Unadjusted vs adjusted with inter-company eliminations.", act: () => openModal("consolidatedPnL") },
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
  const kinds = ["All", "Transfers", "Tenants", "Entities", "Matrix", "Tax"];
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" title="Portfolio activity log" subtitle="Every action across every entity — audit-ready">
      <div className="d-flex gap-2 mb-3 flex-wrap">
        {kinds.map((k) => (
          <button key={k} type="button" className={`pm-chip ${filter === k ? "on" : ""}`} onClick={() => setFilter(k)}>{k}</button>
        ))}
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
      <button type="button" className="btn btn-outline-secondary w-100 mt-3" onClick={() => toast("Full portfolio audit trail queued for export.", "info", "Audit trail")}>
        <i className="bi bi-download me-1" /> Export full audit trail
      </button>
    </Drawer>
  );
}
