import { useState } from "react";
import { fmtKES } from "./data";
import { useStore } from "./store";
import { Drawer, Modal, StatusBadge } from "./ui";

/* ==================================================================
   POLICY DETAIL DRAWER
================================================================== */
export function PolicyDetailDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { policies, renewPolicy, reinstatePolicy, activateCyber } = useStore();
  const p = policies.find((x) => x.id === payload.policyId);
  if (!p) return null;
  return (
    <Drawer open onClose={onClose} title={p.name} subtitle={`${p.provider} · ${p.frequency}`} icon={p.icon}>
      <div className="d-flex align-items-end justify-content-between mb-3">
        <div>
          <div className="pm-kpi-label">Cover</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "Sora" }}>{fmtKES(p.cover)}</div>
        </div>
        <div className="text-end">
          <div className="pm-kpi-label">Premium</div>
          <div className="fw-bold" style={{ fontSize: "0.95rem", color: "var(--pm-green-dark)" }}>{fmtKES(p.premium)}/{p.frequency === "Annual" ? "yr" : "mo"}</div>
        </div>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-6"><div className="pm-note soft p-2"><b className="d-block" style={{ fontSize: "0.72rem" }}>STATUS</b><StatusBadge status={p.status} /></div></div>
        <div className="col-6"><div className="pm-note soft p-2"><b className="d-block" style={{ fontSize: "0.72rem" }}>RENEWS</b>{p.expires}</div></div>
      </div>
      <div className="fw-bold mb-2" style={{ fontSize: "0.85rem" }}>What's covered</div>
      <ul className="mb-3" style={{ fontSize: "0.82rem", color: "var(--pm-muted)" }}>
        {p.perils.map((x) => <li key={x} className="mb-1"><i className="bi bi-check2-circle me-1" style={{ color: "var(--pm-green)" }} />{x}</li>)}
      </ul>
      {p.notes && <div className="pm-note soft mb-3"><i className="bi bi-info-circle me-1" />{p.notes}</div>}
      {p.status === "Expiring soon" && (
        <button type="button" className="btn btn-warning w-100 mb-2" onClick={() => { renewPolicy(p.id); onClose(); }}>
          <i className="bi bi-arrow-clockwise me-1" />Renew now
        </button>
      )}
      {p.status === "Lapsed" && (
        <button type="button" className="btn btn-warning w-100 mb-2" onClick={() => { reinstatePolicy(p.id); onClose(); }}>
          <i className="bi bi-arrow-counterclockwise me-1" />Reinstate now
        </button>
      )}
      {p.id === "pol4" && p.status === "Pending" && (
        <button type="button" className="btn btn-primary w-100 mb-2" onClick={() => { activateCyber(); onClose(); }}>
          <i className="bi bi-shield-lock me-1" />Activate cyber cover
        </button>
      )}
      <button type="button" className="btn btn-outline-secondary w-100" onClick={onClose}>Close</button>
    </Drawer>
  );
}

/* ==================================================================
   GET A QUOTE (coverage check)
================================================================== */
export function PolicyModal({ onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { toast } = useStore();
  const [kind, setKind] = useState("Business Interruption");
  const [cover, setCover] = useState("6000000");
  const kinds = ["Business Interruption", "Cyber & Data Breach", "Goods in Transit", "Key Person", "Fire & Allied"];
  const est = Math.round((Number(cover) || 0) * (kind.includes("Cyber") ? 0.0015 : kind.includes("Transit") ? 0.0022 : 0.0013));
  return (
    <Modal open onClose={onClose} title="Get a quote" subtitle="4-step coverage check · 3 underwriters quoted" icon="bi-shield-plus" size="lg">
      <div className="mb-3">
        <div className="fw-bold mb-1" style={{ fontSize: "0.85rem" }}>Step 1 — What do you want to protect?</div>
        <div className="d-flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button key={k} type="button" className={`pm-chip ${kind === k ? "on" : ""}`} onClick={() => setKind(k)}>{k}</button>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <div className="fw-bold mb-1" style={{ fontSize: "0.85rem" }}>Step 2 — Sum insured (KES)</div>
        <div className="input-group">
          <span className="input-group-text">KES</span>
          <input className="form-control" value={cover} onChange={(e) => setCover(e.target.value.replace(/[^\d]/g, ""))} />
        </div>
      </div>
      <div className="pm-note soft mb-3">
        <i className="bi bi-lightbulb me-1" />Estimated premium for {fmtKES(Number(cover) || 0)} of {kind} cover: <b>{fmtKES(est)}/mo</b>. Three underwriters will quote within 15 minutes.
      </div>
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-primary flex-grow-1" onClick={() => { toast(`Quote requested for ${kind} — 3 underwriters notified.`, "success", "Quote started"); onClose(); }}>
          <i className="bi bi-send me-1" />Request quotes
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}

/* ==================================================================
   FILE A CLAIM
================================================================== */
export function ClaimModal({ onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { policies, fileClaim } = useStore();
  const active = policies.filter((p) => p.status !== "Lapsed");
  const [policyId, setPolicyId] = useState(active[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  return (
    <Modal open onClose={onClose} title="File a claim" subtitle="Assessor assigned within 24 hours · payout avg 3 days" icon="bi-shield-exclamation">
      <div className="mb-3">
        <label className="form-label">Policy</label>
        <select className="form-select" value={policyId} onChange={(e) => setPolicyId(e.target.value)}>
          {active.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.provider}</option>)}
        </select>
      </div>
      <div className="mb-3">
        <label className="form-label">Amount claimed (KES)</label>
        <div className="input-group">
          <span className="input-group-text">KES</span>
          <input className="form-control" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} placeholder="e.g. 50000" />
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">What happened?</label>
        <textarea className="form-control" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe the incident, date and any reference numbers…" />
      </div>
      <div className="pm-note soft"><i className="bi bi-paperclip me-1" />Attach photos, invoices or police reports after submitting — you'll get a secure upload link.</div>
      <div className="d-flex gap-2 mt-3">
        <button type="button" className="btn btn-primary flex-grow-1" disabled={!policyId || !Number(amount)} onClick={() => { fileClaim(policyId, Number(amount), note || "Claim lodged from dashboard."); onClose(); }}>
          <i className="bi bi-send me-1" />Lodge claim
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}

/* ==================================================================
   CLAIM DETAIL
================================================================== */
export function ClaimDetailModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { claims, updateClaimStatus } = useStore();
  const c = claims.find((x) => x.id === payload.claimId);
  if (!c) return null;
  return (
    <Modal open onClose={onClose} title={c.id} subtitle={`${c.policyName} · lodged ${c.date}`} icon="bi-shield-exclamation">
      <div className="row g-2 mb-3">
        <div className="col-6"><div className="pm-note soft p-2"><b className="d-block" style={{ fontSize: "0.72rem" }}>AMOUNT</b>{fmtKES(c.amount)}</div></div>
        <div className="col-6"><div className="pm-note soft p-2"><b className="d-block" style={{ fontSize: "0.72rem" }}>STATUS</b><StatusBadge status={c.status} /></div></div>
      </div>
      <div className="pm-note soft mb-3"><i className="bi bi-info-circle me-1" />{c.note}</div>
      <div className="pm-note"><i className="bi bi-clock-history me-1" />Next step: assessor site visit, then settlement to your default payout account.</div>
      {(c.status === "Under review" || c.status === "Open") && (
        <div className="d-flex gap-2 mt-3">
          <button type="button" className="btn btn-outline-secondary" onClick={() => { updateClaimStatus(c.id, "Approved"); }}>Approve</button>
          <button type="button" className="btn btn-outline-danger" onClick={() => { updateClaimStatus(c.id, "Rejected"); }}>Reject</button>
          <button type="button" className="btn btn-outline-secondary ms-auto" onClick={onClose}>Close</button>
        </div>
      )}
    </Modal>
  );
}

/* ==================================================================
   RENEWALS
================================================================== */
export function RenewalsModal({ onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { policies, renewPolicy, reinstatePolicy } = useStore();
  const flagged = policies.filter((p) => p.status === "Expiring soon" || p.status === "Lapsed");
  return (
    <Modal open onClose={onClose} title="Renewals & reinstatements" subtitle="Auto-quoted 30 days before expiry · one-tap renew" icon="bi-calendar-event">
      {flagged.length === 0 && <div className="pm-empty"><i className="bi bi-check2-circle" /><h5>All clear</h5><p className="mb-0" style={{ fontSize: "0.82rem" }}>Nothing needs attention.</p></div>}
      {flagged.map((p) => (
        <div key={p.id} className="pm-dd-item" style={{ alignItems: "center" }}>
          <span className="pm-kpi-icon" style={{ width: 34, height: 34, fontSize: "0.8rem", background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}><i className={`bi ${p.icon}`} /></span>
          <span className="flex-grow-1">
            <span className="d-block fw-semibold" style={{ fontSize: "0.8rem" }}>{p.name}</span>
            <span style={{ fontSize: "0.68rem", color: "var(--pm-muted)" }}>{p.provider} · {fmtKES(p.premium)}/{p.frequency === "Annual" ? "yr" : "mo"} · renews {p.expires}</span>
          </span>
          {p.status === "Expiring soon" && (
            <button type="button" className="btn btn-sm btn-warning" onClick={() => renewPolicy(p.id)}>Renew</button>
          )}
          {p.status === "Lapsed" && (
            <button type="button" className="btn btn-sm btn-warning" onClick={() => reinstatePolicy(p.id)}>Reinstate</button>
          )}
        </div>
      ))}
    </Modal>
  );
}

/* ==================================================================
   BENEFICIARIES
================================================================== */
export function BeneficiariesModal({ onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { beneficiaries } = useStore();
  return (
    <Modal open onClose={onClose} title="Beneficiaries" subtitle="Business-protection payouts" icon="bi-people">
      {beneficiaries.map((b) => (
        <div key={b.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
          <span className="pm-avatar" style={{ width: 34, height: 34, fontSize: "0.7rem" }}>{b.name.slice(0, 2)}</span>
          <div className="flex-grow-1">
            <div className="fw-semibold" style={{ fontSize: "0.82rem" }}>{b.name}</div>
            <div className="pm-prod-meta">{b.relationship}</div>
          </div>
          <b style={{ fontSize: "0.86rem" }}>{b.share}%</b>
        </div>
      ))}
      <div className="pm-note soft mt-3"><i className="bi bi-lightbulb me-1" />Shares are set when a policy is bound — update them from the policy's paperwork anytime.</div>
    </Modal>
  );
}

/* ==================================================================
   ACTIVATE CYBER
================================================================== */
export function ActivateCyberModal({ onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { activateCyber, toast } = useStore();
  const [agree, setAgree] = useState(false);
  return (
    <Modal open onClose={onClose} title="Activate Cyber & Data Breach" subtitle="KES 4M cover · Sanlam" icon="bi-shield-lock">
      <div className="pm-note soft mb-3"><i className="bi bi-shield-lock me-1" />Activation runs a quick security audit (2 min). Once passed, cover is live immediately and the KES 6,200/mo premium starts.</div>
      <div className="form-check mb-3">
        <input className="form-check-input" type="checkbox" id="cy-agree" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <label className="form-check-label" htmlFor="cy-agree" style={{ fontSize: "0.84rem" }}>I confirm TS Retail Ltd runs backups, uses MFA, and will follow the breach response playbook.</label>
      </div>
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-primary flex-grow-1" disabled={!agree} onClick={() => { activateCyber(); onClose(); }}>
          <i className="bi bi-play me-1" />Run audit &amp; activate
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={() => { toast("Quote saved — you can activate anytime from Policies.", "info"); onClose(); }}>Later</button>
      </div>
    </Modal>
  );
}

/* ==================================================================
   HELP
================================================================== */
export function HelpModal({ onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Help — Insurance & Protection" icon="bi-question-circle">
      <div style={{ fontSize: "0.84rem" }}>
        <p>Your policies are aggregated from licensed underwriters (Britam, APA, Jubilee, Sanlam, Madison). Premiums auto-pay from Cash &amp; Accounts.</p>
        <p className="mb-1">Good to know:</p>
        <ul>
          <li>Filing a claim never raises your premium for protected events.</li>
          <li>WIBA lapses are illegal — renewals are flagged 30 days out.</li>
          <li>Fully-protected businesses get better lending terms.</li>
        </ul>
      </div>
      <div className="pm-note soft"><i className="bi bi-lightbulb me-1" />Keyboard: <span className="pm-kbd">Esc</span> close · <span className="pm-kbd">/</span> search.</div>
    </Modal>
  );
}

/* ==================================================================
   ACTIVITY DRAWER
================================================================== */
export function ActivityDrawer({ onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { activity } = useStore();
  return (
    <Drawer open onClose={onClose} title="Activity log" subtitle="Everything that touched your coverage" icon="bi-clock-history">
      {activity.map((a) => (
        <div key={a.text + a.time} className="d-flex gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
          <i className={`bi ${a.icon}`} style={{ color: "var(--pm-green-dark)", width: 20 }} />
          <div className="flex-grow-1">
            <div style={{ fontSize: "0.8rem" }}>{a.text}</div>
            <div className="pm-prod-meta">{a.time} · {a.by}</div>
          </div>
        </div>
      ))}
    </Drawer>
  );
}
