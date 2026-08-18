import { useState } from "react";
import { fmtKES } from "./data";
import { useStore } from "./store";
import { Badge, Drawer, Modal, StatusBadge } from "./ui";

/* ==================================================================
   KYB CENTER — full compliance workspace
================================================================== */
export function KybCenterModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { kybDocs, directors, submitKybForReview, openModal, verifyKraPin, profile } = useStore();
  const verified = kybDocs.filter((d) => d.status === "Verified").length;
  const missing = kybDocs.filter((d) => d.required && d.status === "Missing").length;
  const total = kybDocs.filter((d) => d.required).length;
  const pct = Math.round((verified / total) * 100);
  const level: "Level 1" | "Level 2" | "Level 3" = missing === 0 ? "Level 2" : pct > 40 ? "Level 1" : "Level 1";
  const limits = { "Level 1": "KES 300K / day", "Level 2": "KES 5M / day", "Level 3": "KES 20M / day" };

  return (
    <Modal open onClose={onClose} title="KYB compliance center" subtitle="Know-Your-Business documents · required by CBK & PayMo" icon="bi-shield-check" size="xl" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-outline-primary" onClick={() => openModal("uploadDoc")}>
            <i className="bi bi-cloud-upload me-1" /> Upload document
          </button>
          <button type="button" className="btn btn-success" disabled={missing > 0} onClick={submitKybForReview}>
            <i className="bi bi-shield-check me-1" /> Submit pack for review
          </button>
        </>
      }
    >
      <div className="row g-3 mb-3">
        <div className="col-lg-4">
          <div className="pm-card h-100 text-center" style={{ background: "linear-gradient(180deg, var(--pm-green-soft), #fff)" }}>
            <div className="pm-kpi-label mb-1">Current compliance level</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "Sora", color: "var(--pm-green-dark)" }}>{level}</div>
            <StatusBadge status={level} />
            <div className="pm-prod-meta mt-2">Transaction limit: <b>{limits[level]}</b></div>
            {missing > 0 && <div className="pm-prod-meta">Upload {missing} more required doc(s) to reach Level 2</div>}
          </div>
        </div>
        <div className="col-lg-8">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between mb-2">
              <b style={{ fontSize: "0.9rem" }}>Document completion</b>
              <span className="pm-prod-meta">{verified}/{total} required verified</span>
            </div>
            <div className="progress mb-3" style={{ height: 10 }}><div className="progress-bar" style={{ width: `${pct}%` }} /></div>
            <div className="row g-2">
              <div className="col-6 col-md-3"><div className="pm-card py-2 px-3 text-center" style={{ boxShadow: "none", background: "var(--pm-green-soft)" }}><div className="pm-kpi-label">Verified</div><b>{kybDocs.filter((d) => d.status === "Verified").length}</b></div></div>
              <div className="col-6 col-md-3"><div className="pm-card py-2 px-3 text-center" style={{ boxShadow: "none", background: "#fef0c7" }}><div className="pm-kpi-label">Review</div><b>{kybDocs.filter((d) => d.status === "Under Review").length}</b></div></div>
              <div className="col-6 col-md-3"><div className="pm-card py-2 px-3 text-center" style={{ boxShadow: "none", background: "#fef0c7" }}><div className="pm-kpi-label">Expiring</div><b>{kybDocs.filter((d) => d.status === "Expiring soon").length}</b></div></div>
              <div className="col-6 col-md-3"><div className="pm-card py-2 px-3 text-center" style={{ boxShadow: "none", background: "#fee4e2" }}><div className="pm-kpi-label">Missing</div><b>{kybDocs.filter((d) => d.status === "Missing").length}</b></div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="pm-kpi-label mb-2">Compliance checklist</div>
      {kybDocs.map((d) => (
        <div key={d.id} className="d-flex align-items-center gap-3 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 12 }}>
          <i className={`bi ${d.status === "Verified" ? "bi-patch-check-fill text-primary" : d.status === "Under Review" ? "bi-hourglass-split" : d.status === "Expiring soon" ? "bi-clock-history" : "bi-exclamation-circle-fill"}`} style={{ color: d.status === "Missing" ? "var(--pm-danger)" : d.status === "Expiring soon" ? "var(--pm-warn)" : undefined, fontSize: "1.1rem" }} />
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <b style={{ fontSize: "0.84rem" }}>{d.label}</b>
            <div className="pm-prod-meta">{d.desc}{d.uploaded ? ` · uploaded ${d.uploaded}` : ""}{d.expires ? ` · expires ${d.expires}` : ""}</div>
          </div>
          <StatusBadge status={d.status} />
          {d.status === "Missing" && <button type="button" className="btn btn-sm btn-primary" onClick={() => openModal("uploadDoc", { docId: d.id })}><i className="bi bi-cloud-upload me-1" />Upload</button>}
          {d.status === "Expiring soon" && <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => openModal("uploadDoc", { docId: d.id })}><i className="bi bi-arrow-repeat me-1" />Renew</button>}
        </div>
      ))}

      <div className="row g-3 mt-1">
        <div className="col-lg-6">
          <div className="pm-card h-100" style={{ background: "#fafbfd", boxShadow: "none" }}>
            <b style={{ fontSize: "0.86rem" }}>KRA PIN status</b>
            <div className="d-flex align-items-center gap-2 mt-1"><span className="pm-mono">{profile.kraPin}</span>{profile.kraVerified ? <Badge tone="green">Verified ✓</Badge> : <Badge tone="amber">Unverified</Badge>}</div>
            {!profile.kraVerified && <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={verifyKraPin}><i className="bi bi-shield-check me-1" />Verify via iTax</button>}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="pm-card h-100" style={{ background: "#fafbfd", boxShadow: "none" }}>
            <div className="d-flex justify-content-between mb-1"><b style={{ fontSize: "0.86rem" }}>Directors on file</b><Badge tone="slate">{directors.length}</Badge></div>
            <div className="pm-prod-meta">{directors.filter((d) => d.beneficialOwner).length} declared beneficial owners · total ownership {directors.reduce((a, b) => a + b.ownershipPct, 0)}%</div>
            <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => openModal("addDirector")}><i className="bi bi-person-plus me-1" />Add director / owner</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ==================================================================
   BUSINESS DRAWER — profile for one entity in the portfolio
================================================================== */
export function BusinessDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { portfolio, folders, setCurrentBusinessId, openModal } = useStore();
  const b = portfolio.find((x) => x.id === String(payload.id));
  if (!b) return null;
  const folder = folders.find((f) => f.id === b.folder);
  const net = b.revenueMTD - b.expensesMTD;
  return (
    <Drawer open onClose={onClose} icon="bi-buildings" title={b.name} subtitle={`${b.entityType} · ${folder?.emoji} ${folder?.name} · KRA ${b.kraPin}`}>
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={b.status} />
        <StatusBadge status={b.kybLevel} />
        {b.units && <Badge tone="amber">{b.units} units</Badge>}
      </div>
      <div className="row g-2 mb-3">
        <div className="col-4"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Cash</div><b>{fmtKES(b.cash)}</b></div></div>
        <div className="col-4"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Revenue</div><b>{fmtKES(b.revenueMTD)}</b></div></div>
        <div className="col-4"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Net MTD</div><b className={net < 0 ? "pm-qtyneg" : "text-primary"}>{fmtKES(net)}</b></div></div>
      </div>
      <div className="pm-card mb-3" style={{ background: "#fafbfd", boxShadow: "none" }}>
        <div className="pm-kpi-label">Last activity</div>
        <b style={{ fontSize: "0.84rem" }}>{b.lastActivity}</b>
        {b.status === "Suspended" && <div className="pm-prod-meta mt-1" style={{ color: "var(--pm-danger)" }}><i className="bi bi-exclamation-triangle me-1" />Compliance issue detected — resolve to reactivate</div>}
        {b.status === "Inactive" && <div className="pm-prod-meta mt-1"><i className="bi bi-pause-circle me-1" />No transactions in 30+ days</div>}
      </div>
      <div className="row g-2">
        <div className="col-12">
          <button type="button" className="btn btn-primary btn-sm w-100" onClick={() => { setCurrentBusinessId(b.id); onClose(); }}>
            <i className="bi bi-box-arrow-in-right me-1" /> Switch to this business
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { onClose(); openModal("editProfile"); }}>
            <i className="bi bi-pencil-square me-1" /> Edit profile
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { onClose(); openModal("kybCenter"); }}>
            <i className="bi bi-shield-check me-1" /> KYB status
          </button>
        </div>
        {b.status === "Active" ? (
          <div className="col-6">
            <button type="button" className="btn btn-outline-warning btn-sm w-100" onClick={() => { onClose(); openModal("deactivate", { id: b.id }); }}>
              <i className="bi bi-pause-circle me-1" /> Deactivate
            </button>
          </div>
        ) : (
          <div className="col-6">
            <button type="button" className="btn btn-outline-primary btn-sm w-100" onClick={() => { onClose(); openModal("reactivate", { id: b.id }); }}>
              <i className="bi bi-play-circle me-1" /> Reactivate
            </button>
          </div>
        )}
        <div className="col-6">
          <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => { onClose(); openModal("deleteBusiness", { id: b.id }); }}>
            <i className="bi bi-trash me-1" /> Delete
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ==================================================================
   TAX REGISTRATIONS EDITOR
================================================================== */
export function TaxRegModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { taxRegistrations, toggleTaxRegistration, recordActivity, toast } = useStore();
  return (
    <Modal open onClose={onClose} title="Tax registrations" subtitle="Which taxes your business is registered for — drives filing calendar" icon="bi-receipt-cutoff" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => { recordActivity("Tax registrations updated", "bi-receipt-cutoff"); toast("Tax profile saved — Bookkeeping calendar updated.", "success", "Registrations saved"); onClose(); }}>
            <i className="bi bi-check2-circle me-1" /> Save changes
          </button>
        </>
      }
    >
      {taxRegistrations.map((t) => (
        <div key={t.id} className="d-flex align-items-start gap-3 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 12 }}>
          <div className="form-check form-switch mb-0" style={{ marginTop: 2 }}>
            <input className="form-check-input" type="checkbox" checked={t.registered} onChange={(e) => toggleTaxRegistration(t.id, { registered: e.target.checked })} />
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <b style={{ fontSize: "0.84rem" }}>{t.name}</b>
              <Badge tone="ink">{t.short}</Badge>
              {t.registered && <Badge tone="green">Active</Badge>}
            </div>
            <div className="pm-prod-meta">{t.note}</div>
            {t.registered && t.certNumber && (
              <div className="row g-2 mt-2">
                <div className="col-md-6"><div className="input-group input-group-sm"><span className="input-group-text">Cert #</span><input className="form-control pm-mono" defaultValue={t.certNumber} onChange={(e) => toggleTaxRegistration(t.id, { certNumber: e.target.value })} /></div></div>
                <div className="col-md-6"><div className="input-group input-group-sm"><span className="input-group-text">Effective</span><input className="form-control" defaultValue={t.effectiveDate} onChange={(e) => toggleTaxRegistration(t.id, { effectiveDate: e.target.value })} /></div></div>
              </div>
            )}
          </div>
        </div>
      ))}
      <div className="pm-note soft"><i className="bi bi-info-circle me-1" />Toggling PAYE, NSSF or SHIF adds them to your monthly filing calendar in Bookkeeping &amp; Taxes.</div>
    </Modal>
  );
}

/* ==================================================================
   FOLDER MANAGER
================================================================== */
export function FolderManagerModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { folders, portfolio, addFolder, moveBusinessToFolder, toast } = useStore();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🗂️");
  const [color, setColor] = useState("#12b76a");
  const [dragEnt, setDragEnt] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  return (
    <Modal open onClose={onClose} title="Portfolio folders" subtitle="Drag any business between folders — books stay strictly separate" icon="bi-folder" size="xl"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>}
    >
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input className="form-control form-control-sm" style={{ maxWidth: 220 }} placeholder="New folder name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="form-control form-control-sm text-center" style={{ maxWidth: 60, fontSize: "1.1rem" }} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
        <input type="color" className="form-control form-control-color form-control-sm" style={{ maxWidth: 44 }} value={color} onChange={(e) => setColor(e.target.value)} />
        <button type="button" className="btn btn-sm btn-outline-primary" disabled={!name.trim()} onClick={() => { addFolder(name.trim(), emoji, color); toast(`Folder "${name}" created.`, "success", "Folder added"); setName(""); }}>
          <i className="bi bi-folder-plus me-1" /> Add folder
        </button>
      </div>
      <div className="row g-3">
        {folders.map((f) => {
          const members = portfolio.filter((b) => b.folder === f.id);
          return (
            <div className="col-lg-4" key={f.id}>
              <div
                className="pm-card h-100"
                style={{ borderColor: dragOver === f.id ? f.color : undefined, background: dragOver === f.id ? f.color + "12" : undefined, borderLeft: `4px solid ${f.color}` }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(f.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => { if (dragEnt) { moveBusinessToFolder(dragEnt, f.id); toast(`Moved to ${f.name}.`, "success", "Reorganised"); setDragOver(null); setDragEnt(null); } }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span style={{ fontSize: "1.3rem" }}>{f.emoji}</span>
                  <b style={{ fontSize: "0.9rem" }}>{f.name}</b>
                  <Badge tone="slate" className="ms-auto">{members.length}</Badge>
                </div>
                {members.map((b) => (
                  <div key={b.id} className="d-flex align-items-center gap-2 p-2 mb-2 pm-dragrow"
                    draggable onDragStart={() => setDragEnt(b.id)}>
                    <span>{b.emoji}</span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="fw-semibold text-truncate" style={{ fontSize: "0.8rem" }}>{b.name}</div>
                      <div className="pm-prod-meta">{b.entityType} · {b.status}</div>
                    </div>
                    <i className="bi bi-grip-vertical pm-prod-meta" />
                  </div>
                ))}
                {members.length === 0 && <div className="pm-prod-meta">Drop businesses here…</div>}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

/* ==================================================================
   DEACTIVATE / REACTIVATE / DELETE CONFIRMS
================================================================== */
export function DeactivateConfirmModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { portfolio, deactivateBusiness } = useStore();
  const b = portfolio.find((x) => x.id === String(payload.id));
  if (!b) return null;
  return (
    <Modal open onClose={onClose} title="Deactivate business?" icon="bi-pause-circle" size="sm"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-warning" onClick={() => { deactivateBusiness(b.id); onClose(); }}>
            <i className="bi bi-pause-circle me-1" /> Deactivate
          </button>
        </>
      }
    >
      <p className="mb-1">Deactivate <b>{b.name}</b>? New transactions are blocked but all historical data stays intact.</p>
      <p className="pm-prod-meta mb-0">Reactivate any time from the business profile.</p>
    </Modal>
  );
}

export function ReactivateConfirmModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { portfolio, reactivateBusiness } = useStore();
  const b = portfolio.find((x) => x.id === String(payload.id));
  if (!b) return null;
  return (
    <Modal open onClose={onClose} title="Reactivate business?" icon="bi-play-circle" size="sm"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => { reactivateBusiness(b.id); onClose(); }}>
            <i className="bi bi-play-circle me-1" /> Reactivate
          </button>
        </>
      }
    >
      <p className="mb-1"><b>{b.name}</b> will start accepting transactions again immediately.</p>
      <p className="pm-prod-meta mb-0">Compliance level stays at {b.kybLevel} — top up KYB to move higher.</p>
    </Modal>
  );
}

export function DeleteBusinessConfirmModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { portfolio, deleteBusiness, toast } = useStore();
  const b = portfolio.find((x) => x.id === String(payload.id));
  const [confirm, setConfirm] = useState("");
  if (!b) return null;
  const hasHistory = b.revenueMTD > 0 || b.expensesMTD > 0;
  const canDelete = !hasHistory && confirm === b.name;
  return (
    <Modal open onClose={onClose} title="Delete business permanently?" icon="bi-trash" size="md"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-danger" disabled={!canDelete} onClick={() => { deleteBusiness(b.id); onClose(); }}>
            <i className="bi bi-trash me-1" /> Delete forever
          </button>
        </>
      }
    >
      <p className="mb-1">You're about to <b>permanently delete {b.name}</b>. This cannot be undone from the app.</p>
      {hasHistory && (
        <div className="pm-note mt-2" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}>
          <i className="bi bi-shield-exclamation me-1" style={{ color: "var(--pm-danger)" }} />
          Cannot delete — this business has transaction history. Deactivate instead (data is retained per KRA rules for 5 years).
          <button type="button" className="btn btn-sm btn-warning mt-2" onClick={() => { onClose(); toast("Deactivate flow opened instead.", "info", "Redirected"); }}><i className="bi bi-pause-circle me-1" />Deactivate instead</button>
        </div>
      )}
      {!hasHistory && (
        <>
          <p className="pm-prod-meta">No transactions found — safe to delete. Type <b>{b.name}</b> below to confirm.</p>
          <input className="form-control mt-2" placeholder={b.name} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </>
      )}
    </Modal>
  );
}

/* ==================================================================
   SHARE PROFILE (public snippet)
================================================================== */
export function ShareProfileModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { profile, toast } = useStore();
  const [phase, setPhase] = useState<"idle" | "copied">("idle");
  const share = `${profile.tradingName || profile.legalName} · ${profile.entityType} · KRA ${profile.kraPin} · ${profile.phone}`;
  const copy = () => { try { void navigator.clipboard?.writeText(share); } catch { /* demo */ } setPhase("copied"); toast("Public profile snippet copied.", "info", "Copied"); };
  return (
    <Modal open onClose={onClose} title="Share business profile" subtitle="Suppliers, lenders and banks often ask for this — safe to share" icon="bi-share" size="md"
      footer={<><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button><button type="button" className="btn btn-primary" onClick={copy}><i className={`bi ${phase === "copied" ? "bi-check2" : "bi-clipboard"} me-1`} />{phase === "copied" ? "Copied" : "Copy snippet"}</button></>}
    >
      <div className="pm-card mb-3" style={{ background: profile.primaryColor + "10", border: `1px solid ${profile.primaryColor}40` }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span style={{ width: 46, height: 46, borderRadius: 10, background: profile.primaryColor, color: "#fff", display: "grid", placeItems: "center", fontSize: "1.4rem" }}>{profile.logoEmoji}</span>
          <div>
            <b style={{ color: profile.secondaryColor }}>{profile.tradingName || profile.legalName}</b>
            <div className="pm-prod-meta">{profile.entityType} · {profile.industry}</div>
          </div>
        </div>
        <div style={{ fontSize: "0.82rem" }}>{profile.address}<br />{profile.email} · {profile.phone}<br />KRA PIN: <span className="pm-mono">{profile.kraPin}</span> {profile.kraVerified && <Badge tone="green">Verified</Badge>}</div>
      </div>
      <div className="pm-note soft"><i className="bi bi-shield-check me-1" />Nothing sensitive is shared — no KYB documents, bank details or director IDs.</div>
    </Modal>
  );
}

/* ==================================================================
   COMPLIANCE LEVEL EXPLAINER
================================================================== */
export function ComplianceLevelsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const levels = [
    { id: "L1", name: "Level 1 — Basic", limit: 300000, tone: "amber", need: ["Business name + KRA PIN", "Contact info"], unlock: ["Send/receive payments", "Basic invoicing", "1 user account"] },
    { id: "L2", name: "Level 2 — Full KYB", limit: 5000000, tone: "green", need: ["All 9 required documents", "Directors' IDs & KRA PINs", "Beneficial ownership declaration"], unlock: ["Full merchant limits", "Multi-user & roles", "Funding & credit products", "Invoice financing", "Insurance offers"] },
    { id: "L3", name: "Level 3 — Enhanced", limit: 20000000, tone: "violet", need: ["Level 2 complete", "Audited financials (last year)", "Enhanced due diligence interview"], unlock: ["Highest transaction limits", "Custom API rate limits", "Priority support & dedicated CSM", "Trade finance & LC"] },
  ] as const;
  return (
    <Modal open onClose={onClose} title="Compliance levels explained" subtitle="What each level unlocks and what's needed" icon="bi-shield-fill-check" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>Got it</button>}
    >
      {levels.map((l) => (
        <div key={l.id} className="pm-card mb-2" style={{ boxShadow: "none", border: `1px solid var(--pm-border)`, borderLeft: `4px solid ${l.tone === "green" ? "var(--pm-green)" : l.tone === "amber" ? "var(--pm-warn)" : "var(--pm-violet)"}` }}>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <b>{l.name}</b>
            <Badge tone={l.tone}>{fmtKES(l.limit)} / day</Badge>
          </div>
          <div className="row g-3 mt-1">
            <div className="col-md-6">
              <div className="pm-kpi-label mb-1">Requires</div>
              {l.need.map((n) => <div key={n} className="pm-prod-meta"><i className="bi bi-dot" />{n}</div>)}
            </div>
            <div className="col-md-6">
              <div className="pm-kpi-label mb-1">Unlocks</div>
              {l.unlock.map((u) => <div key={u} className="pm-prod-meta"><i className="bi bi-check text-primary" /> {u}</div>)}
            </div>
          </div>
        </div>
      ))}
      <div className="pm-note soft"><i className="bi bi-info-circle me-1" />Compliance levels are set by CBK regulations — PayMo cannot bypass them, but we make the upgrade as painless as possible.</div>
    </Modal>
  );
}

/* ==================================================================
   EXPORT PROFILE / KYB PACK
================================================================== */
export function ExportPackModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const [scope, setScope] = useState({ profile: true, kyb: true, directors: true, tax: true });
  const [format, setFormat] = useState("PDF");
  const [busy, setBusy] = useState(false);
  return (
    <Modal open onClose={onClose} title="Export business pack" subtitle="Banker-ready compliance pack — profile + KYB + tax + directors" icon="bi-file-earmark-arrow-down"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => {
            setBusy(true);
            window.setTimeout(() => {
              setBusy(false);
              recordActivity(`Business pack exported (${format})`, "bi-file-earmark-arrow-down");
              toast(`${format} pack downloaded — ${Object.values(scope).filter(Boolean).length} sections included.`, "success", "Pack ready");
              onClose();
            }, 1300);
          }}>
            {busy ? <><span className="pm-spin me-1">◌</span> Building…</> : <><i className="bi bi-download me-1" /> Export {format}</>}
          </button>
        </>
      }
    >
      <div className="d-flex gap-2 mb-3">
        {["PDF", "ZIP"].map((f) => (
          <button key={f} type="button" className={`pm-chip ${format === f ? "on" : ""}`} onClick={() => setFormat(f)}>
            <i className={`bi ${f === "PDF" ? "bi-file-pdf" : "bi-file-zip"} me-1`} /> {f}
          </button>
        ))}
      </div>
      {[
        { k: "profile" as const, t: "Business profile summary" },
        { k: "kyb" as const, t: "KYB documents & compliance status" },
        { k: "directors" as const, t: "Directors & beneficial ownership" },
        { k: "tax" as const, t: "Tax registrations & certificates" },
      ].map((r) => (
        <div key={r.k} className="d-flex align-items-center gap-2 py-1">
          <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" checked={scope[r.k]} onChange={(e) => setScope((s) => ({ ...s, [r.k]: e.target.checked }))} /></div>
          <span style={{ fontSize: "0.84rem" }}>{r.t}</span>
        </div>
      ))}
      <div className="pm-note soft mt-3"><i className="bi bi-shield-lock me-1" />Watermarked with today's date — accepted by banks & lenders as proof of profile.</div>
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
    <Modal open onClose={onClose} title="Help & shortcuts" subtitle="Business Profile & KYB — every flow on this page" icon="bi-question-circle" size="lg"
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
          { icon: "bi-pencil-square", t: "Edit Business Profile (6 steps)", d: "Identity → address → branding → industry (with preset suggest) → FY → invoice defaults.", act: () => openModal("editProfile") },
          { icon: "bi-cloud-upload", t: "Upload KYB Document (4 steps)", d: "Pick doc → attach file → review → encrypted upload with OCR + IPRS check.", act: () => openModal("uploadDoc") },
          { icon: "bi-plus-circle", t: "Add Business (5 steps)", d: "Name & type → KRA & registration → industry & folder → contact → review. Level 1 KYB starts automatically.", act: () => openModal("newBusiness") },
          { icon: "bi-house-add", t: "Add Rental Property (5 steps)", d: "Property basics → location → units & rent → Real Estate auto-config → first tenant.", act: () => openModal("newRental") },
          { icon: "bi-magic", t: "Sector Presets (4 steps)", d: "Pick preset → preview changes → cherry-pick → confirm. 6 sectors ready.", act: () => openModal("sectorPresets") },
          { icon: "bi-person-plus", t: "Add Director (3 steps)", d: "Personal info → ownership % → documents. Auto-flags 25%+ as beneficial owner.", act: () => openModal("addDirector") },
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
  const kinds = ["All", "Profile", "KYB", "Businesses", "Presets", "Directors"];
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" title="Activity log" subtitle="Every profile & compliance event — audit-ready">
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
      <button type="button" className="btn btn-outline-secondary w-100 mt-3" onClick={() => toast("Full compliance audit trail queued for export.", "info", "Audit trail")}>
        <i className="bi bi-download me-1" /> Export full audit trail
      </button>
    </Drawer>
  );
}
