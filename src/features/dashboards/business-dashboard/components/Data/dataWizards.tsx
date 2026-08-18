import { useState } from "react";
import { useStore } from "./store";
import { Badge, Chip, Field, Modal, WizardShell } from "./ui";

/* ==================================================================
   DATA EXPORT WIZARD — 4 steps
================================================================== */
export function ExportWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { createDataRequest, toast } = useStore();
  const [step, setStep] = useState(0);
  const [format, setFormat] = useState<"CSV" | "JSON" | "PDF" | "ZIP-all">("ZIP-all");
  const [categories, setCategories] = useState<Set<string>>(new Set(["Customer PII", "Transaction history", "eTIMS fiscal receipts"]));
  const [dateRange, setDateRange] = useState("All time");
  const [email, setEmail] = useState("wanjiku@techsol.co.ke");

  const cats = ["Customer PII", "Transaction history", "KYB documents", "Bank & M-Pesa logs", "Team & access data", "Inventory & stock", "Marketing & campaigns", "eTIMS fiscal receipts"];

  return (
    <Modal open onClose={onClose} title="Export your data" subtitle="4 steps · Kenya DPA 2019 right to data portability" icon="bi-download" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={step === 1 && categories.size === 0} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              const id = createDataRequest("Export", `${categories.size} categories (${format})`, `Range: ${dateRange} · Delivered to ${email}`);
              toast(`${id} processing — ready within 24h. You'll get an email with a download link valid for 7 days.`, "success", "Export requested");
              onClose();
            }}>
              <i className="bi bi-download me-1" /> Submit export
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Scope", icon: "bi-box-seam" }, { label: "Categories", icon: "bi-list-check" }, { label: "Format & range", icon: "bi-file-earmark" }, { label: "Deliver to", icon: "bi-envelope" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {[
              { id: "full", t: "Full account export", d: "Everything PayMo holds on this business — all 8 categories", icon: "bi-database" },
              { id: "customers", t: "Customer data only", d: "CRM profiles, transaction history, consents", icon: "bi-people" },
              { id: "financial", t: "Financial records", d: "Invoices, payments, eTIMS receipts, ledger entries", icon: "bi-receipt" },
              { id: "custom", t: "Custom selection", d: "Pick specific categories on the next step", icon: "bi-sliders" },
            ].map((o) => (
              <button key={o.id} type="button" className={`pm-theme-card text-start p-3 ${categories.size === 8 && o.id === "full" ? "sel" : ""}`} onClick={() => {
                if (o.id === "full") setCategories(new Set(cats));
                else if (o.id === "customers") setCategories(new Set(["Customer PII", "Transaction history"]));
                else if (o.id === "financial") setCategories(new Set(["Transaction history", "eTIMS fiscal receipts", "Bank & M-Pesa logs"]));
                else setCategories(new Set());
              }}>
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${o.icon}`} style={{ color: "var(--pm-green-dark)" }} />
                  <div className="flex-grow-1"><b style={{ fontSize: "0.86rem" }}>{o.t}</b><div className="pm-prod-meta">{o.d}</div></div>
                  {categories.size === 8 && o.id === "full" && <i className="bi bi-check-circle-fill text-primary" />}
                </div>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="pm-kpi-label mb-2">Select data categories to include ({categories.size})</div>
            <div className="row g-2">
              {cats.map((c) => (
                <div className="col-md-6" key={c}>
                  <div className="d-flex align-items-center gap-2 p-2" style={{ border: `1px solid ${categories.has(c) ? "var(--pm-green)" : "var(--pm-border)"}`, borderRadius: 10, cursor: "pointer" }} onClick={() => setCategories((s) => { const n = new Set(s); if (n.has(c)) n.delete(c); else n.add(c); return n; })}>
                    <div className="form-check mb-0"><input className="form-check-input" type="checkbox" checked={categories.has(c)} readOnly /></div>
                    <span style={{ fontSize: "0.82rem" }}>{c}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Format" className="col-12">
              <div className="d-flex gap-2 flex-wrap">
                {(["ZIP-all", "CSV", "JSON", "PDF"] as const).map((f) => (
                  <Chip key={f} on={format === f} onClick={() => setFormat(f)}>{f === "ZIP-all" ? "ZIP (all formats)" : f}</Chip>
                ))}
              </div>
            </Field>
            <Field label="Date range" className="col-md-6">
              <select className="form-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option>All time</option><option>This year</option><option>Last 12 months</option><option>This quarter</option><option>Custom range</option>
              </select>
            </Field>
            <div className="col-12">
              <div className="pm-note soft"><i className="bi bi-info-circle me-1" />Export is encrypted with AES-256. The download link expires after 7 days for security.</div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="row g-3">
            <Field label="Send download link to" className="col-12">
              <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <div className="col-12">
              <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
                <div className="pm-kpi-label mb-1">Export summary</div>
                <div style={{ fontSize: "0.82rem" }}>{categories.size} categories · {format} · {dateRange}</div>
                <div className="pm-prod-meta mt-1">Ready within 24h · link valid 7 days · encrypted</div>
              </div>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   DATA DELETION WIZARD — 4 steps
================================================================== */
export function DeletionWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { createDataRequest, toast } = useStore();
  const [step, setStep] = useState(0);
  const [target, setTarget] = useState("Specific customer / supplier data");
  const [name, setName] = useState("Kevin Barasa (offboarded)");
  const [reason, setReason] = useState("Customer requested deletion (right to erasure)");
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <Modal open onClose={onClose} title="Request data deletion" subtitle="4 steps · right to erasure under Kenya DPA 2019" icon="bi-eraser" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={step === 2 && !acknowledged} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-danger" onClick={() => {
              createDataRequest("Delete", `${target}: ${name}`, reason);
              toast("Deletion request filed. PII will be anonymised while transaction data is retained per KRA 7-year rule.", "warning", "Deletion requested");
              onClose();
            }}>
              <i className="bi bi-eraser me-1" /> Submit deletion
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Scope", icon: "bi-crosshair" }, { label: "Target", icon: "bi-person" }, { label: "Retention rules", icon: "bi-shield-check" }, { label: "Confirm", icon: "bi-exclamation-triangle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {["Specific customer / supplier data", "Former team member data", "Marketing & analytics data", "Entire business (account closure)"].map((t) => (
              <button key={t} type="button" className={`pm-theme-card text-start p-2 ${target === t ? "sel" : ""}`} onClick={() => setTarget(t)}>
                <div className="d-flex align-items-center gap-2"><i className="bi bi-dot" /><b style={{ fontSize: "0.84rem" }}>{t}</b>{target === t && <i className="bi bi-check-circle-fill text-primary ms-auto" />}</div>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Name / reference of the data subject" className="col-12"><input className="form-control" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Reason for deletion" className="col-12">
              <select className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                <option>Customer requested deletion (right to erasure)</option>
                <option>Data no longer necessary</option>
                <option>Consent withdrawn and no other lawful basis</option>
                <option>Compliance with legal obligation</option>
              </select>
            </Field>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}>
              <i className="bi bi-exclamation-triangle me-1" style={{ color: "var(--pm-danger)" }} />PayMo cannot fully delete some data:
            </div>
            <div className="d-flex flex-column gap-2">
              {[
                { t: "Transaction records", d: "Retained 7 years per KRA Tax Procedures Act — PII anonymised" },
                { t: "eTIMS fiscal receipts", d: "Retained 7 years per KRA — amounts and HSC codes kept" },
                { t: "KYB documents", d: "Retained 5 years post-closure per CBK guidelines" },
                { t: "Audit trail entries", d: "Retained indefinitely — the log of what was deleted is itself auditable" },
              ].map((r) => (
                <div key={r.t} className="d-flex align-items-start gap-2 p-2 border rounded">
                  <i className="bi bi-lock-fill text-danger mt-1" />
                  <div><b style={{ fontSize: "0.82rem" }}>{r.t}</b><div className="pm-prod-meta">{r.d}</div></div>
                </div>
              ))}
            </div>
            <div className="form-check mt-3"><input className="form-check-input" type="checkbox" id="ackDel" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} /><label className="form-check-label" htmlFor="ackDel" style={{ fontSize: "0.82rem" }}>I understand that PII will be anonymised but some records are legally retained.</label></div>
          </div>
        )}
        {step === 3 && (
          <div className="pm-note" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}>
            <i className="bi bi-exclamation-triangle me-1" style={{ color: "var(--pm-danger)" }} />
            Submitting will: anonymise PII for <b>{name}</b>, retain transaction data per KRA rules, and log this action in the audit trail.
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   CONSENT MANAGER — 4 steps
================================================================== */
export function ConsentManagerModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { consents, withdrawConsent, grantConsent, toast } = useStore();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, boolean>>(Object.fromEntries(consents.map((c) => [c.id, c.status === "Granted"])));

  return (
    <Modal open onClose={onClose} title="Manage consent" subtitle="4 steps · Kenya DPA 2019 — your data, your choice" icon="bi-shield-check" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Next <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              consents.forEach((c) => {
                if (selections[c.id] && c.status !== "Granted") grantConsent(c.id);
                else if (!selections[c.id] && c.status === "Granted" && c.withdrawable) withdrawConsent(c.id);
              });
              toast("Consent preferences saved.", "success", "Consent updated");
              onClose();
            }}><i className="bi bi-check2-circle me-1" /> Save preferences</button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Overview", icon: "bi-shield-check" }, { label: "Marketing", icon: "bi-megaphone" }, { label: "Analytics", icon: "bi-graph-up" }, { label: "Review", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            <div className="pm-note mb-3"><i className="bi bi-shield-check me-1" />You control what PayMo does with your data. Required consents (for CBK/KRA compliance) can't be withdrawn.</div>
            {consents.map((c) => (
              <div key={c.id} className="d-flex align-items-center gap-3 p-2 mb-2 border rounded">
                <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" checked={selections[c.id]} disabled={!c.withdrawable} onChange={(e) => setSelections((s) => ({ ...s, [c.id]: e.target.checked }))} /></div>
                <div className="flex-grow-1">
                  <b style={{ fontSize: "0.84rem" }}>{c.scope}</b>
                  <div className="pm-prod-meta">{c.description}</div>
                  <div className="pm-prod-meta">Lawful basis: {c.lawful}{!c.withdrawable && <Badge tone="red" className="ms-1">Required</Badge>}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="pm-note mb-3"><i className="bi bi-megaphone me-1" />Marketing consent affects how PayMo contacts you about products, offers and campaigns.</div>
            {consents.filter((c) => c.scope === "Marketing").map((c) => (
              <div key={c.id} className="p-3 border rounded mb-2">
                <div className="d-flex align-items-center justify-content-between">
                  <div><b>{c.scope}</b><div className="pm-prod-meta">{c.description}</div></div>
                  <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" checked={selections[c.id]} onChange={(e) => setSelections((s) => ({ ...s, [c.id]: e.target.checked }))} /></div>
                </div>
                <div className="pm-prod-meta mt-2">Withdrawing stops WhatsApp/SMS/email campaigns immediately. You can re-grant any time.</div>
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3"><i className="bi bi-graph-up me-1" />Analytics and credit-scoring consents affect product features.</div>
            {consents.filter((c) => ["Analytics", "Credit scoring"].includes(c.scope)).map((c) => (
              <div key={c.id} className="p-3 border rounded mb-2">
                <div className="d-flex align-items-center justify-content-between">
                  <div><b>{c.scope}</b><div className="pm-prod-meta">{c.description}</div></div>
                  <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" checked={selections[c.id]} disabled={!c.withdrawable} onChange={(e) => setSelections((s) => ({ ...s, [c.id]: e.target.checked }))} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 3 && (
          <div>
            {consents.map((c) => (
              <div key={c.id} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <b style={{ fontSize: "0.8rem" }} className="flex-grow-1">{c.scope}</b>
                <Badge tone={selections[c.id] ? "green" : "slate"}>{selections[c.id] ? "Granted" : "Withdrawn"}</Badge>
              </div>
            ))}
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   ACCOUNT CLOSURE WIZARD — 4 steps
================================================================== */
export function AccountClosureModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { deleteAccount, revokeAllSessions } = useStore();
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState("Switching to a different platform");
  const [exportFirst, setExportFirst] = useState(true);
  const [acknowledged, setAcknowledged] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  return (
    <Modal open onClose={onClose} title="Close account permanently" subtitle="4 steps · this is the most destructive action — read carefully" icon="bi-x-circle" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={step === 2 && !acknowledged} onClick={() => setStep((s) => s + 1)}>Next <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-danger" disabled={confirmText !== "DELETE TECHSOLUTIONS"} onClick={() => {
              if (deleteAccount(confirmText)) { revokeAllSessions(); onClose(); }
            }}><i className="bi bi-x-circle me-1" /> Close account forever</button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Impact", icon: "bi-exclamation-octagon" }, { label: "Export first", icon: "bi-download" }, { label: "Retention", icon: "bi-shield-lock" }, { label: "Confirm", icon: "bi-fire" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            <div className="pm-note mb-3" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}>
              <i className="bi bi-exclamation-octagon me-1" style={{ color: "var(--pm-danger)" }} />Closing <b>TechSolutions Ltd</b> will:
            </div>
            {["Stop all M-Pesa collections, payouts and card processing", "Cancel all active subscriptions and recurring invoices", "Pause all integrations (QuickBooks, eTIMS, Sendy)", "Revoke access for all 9 team members instantly", "Archive the business — it becomes read-only"].map((i) => (
              <div key={i} className="d-flex align-items-start gap-2 py-1"><i className="bi bi-x-circle text-danger mt-1" /><span style={{ fontSize: "0.82rem" }}>{i}</span></div>
            ))}
            <Field label="Why are you closing?" className="mt-3">
              <select className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                <option>Switching to a different platform</option><option>Business closed</option><option>Too expensive</option><option>Security concern</option><option>Other</option>
              </select>
            </Field>
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="d-flex align-items-center gap-2 p-3 mb-2" style={{ border: `2px solid ${exportFirst ? "var(--pm-green)" : "var(--pm-border)"}`, borderRadius: 12 }}>
              <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" checked={exportFirst} onChange={(e) => setExportFirst(e.target.checked)} /></div>
              <div><b style={{ fontSize: "0.86rem" }}>Export all data before closing</b><div className="pm-prod-meta">Strongly recommended — once closed, you can only access retained records via legal request.</div></div>
              {exportFirst && <Badge tone="green">Recommended</Badge>}
            </div>
            {exportFirst && <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => { onClose(); }}><i className="bi bi-download me-1" />Start export now</button>}
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3">After closure, PayMo retains some data per Kenyan law:</div>
            {["Transaction records: 7 years (KRA Tax Procedures Act)", "eTIMS receipts: 7 years (KRA)", "KYB documents: 5 years post-closure (CBK)", "Audit trail: indefinite (the record of closure is itself auditable)"].map((r) => (
              <div key={r} className="d-flex align-items-start gap-2 py-1"><i className="bi bi-lock-fill text-amber mt-1" /><span style={{ fontSize: "0.82rem" }}>{r}</span></div>
            ))}
            <div className="form-check mt-3"><input className="form-check-input" type="checkbox" id="ackClose" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} /><label className="form-check-label" htmlFor="ackClose" style={{ fontSize: "0.82rem" }}>I understand some data is legally retained and will be permanently destroyed after the retention period.</label></div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="pm-note mb-3" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}>
              <i className="bi bi-fire me-1" style={{ color: "var(--pm-danger)" }} />This is irreversible. Type <b className="pm-mono">DELETE TECHSOLUTIONS</b> below to confirm.
            </div>
            <input className="form-control pm-mono text-danger" placeholder="DELETE TECHSOLUTIONS" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}
