import { useEffect, useState } from "react";
import {
  UserPlus, ShieldCheck, History, Lock, CheckCircle2, Loader2, Mail, Trash2,
  Download, Archive, FileCheck2, Eye,
} from "lucide-react";
import type { Collaborator } from "../../dataBooks";
import { auditTrailSeed, closeChecklist } from "../../dataBooks";
import { cls, downloadCSV, fmtDT, todayISO, uid, type QAction } from "../../lib";
import { Avatar, Badge, Confirm, Field, Kpi, Modal, Section, SlideOver, Stepper, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

const ACCESS_AREAS = ["Reports", "Journals", "Categorize", "VAT", "eTIMS", "Audit trail", "Bank feeds", "Payroll"];

export default function Accountant({ collaborators, setCollaborators, uncategorized, notify, emit, qa, onConsume }: {
  collaborators: Collaborator[];
  setCollaborators: React.Dispatch<React.SetStateAction<Collaborator[]>>;
  uncategorized: number;
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [invite, setInvite] = useState(false);
  const [detail, setDetail] = useState<Collaborator | null>(null);
  const [revoke, setRevoke] = useState<Collaborator | null>(null);
  const [audit, setAudit] = useState(false);
  const [yearEnd, setYearEnd] = useState(false);
  const [checks, setChecks] = useState(closeChecklist);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "yearEnd") setYearEnd(true);
    if (qa.a === "invite") setInvite(true);
    if (qa.a === "audit") setAudit(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  useEffect(() => {
    setChecks((cs) => cs.map((c) => (c.id === "cc2" ? { ...c, done: uncategorized === 0, detail: uncategorized === 0 ? "All transactions categorized ✓" : `${uncategorized} transactions still uncategorized` } : c)));
  }, [uncategorized]);

  const doneCount = checks.filter((c) => c.done).length;
  const active = collaborators.filter((c) => c.status === "active");

  return (
    <>
      <Section
        no="4.9" sub="Your Business · Collaboration & Close" id="sec-accountant"
        title="Accountant Access, Audit Trail & Year-End Close"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setAudit(true)}><History size={15} /> Audit Trail</button>
            <button className="btn pm-btn-soft" onClick={() => setYearEnd(true)}><Archive size={15} /> Year-End Close</button>
            <button className="btn pm-btn-violet" onClick={() => setInvite(true)}><UserPlus size={15} /> Invite Accountant</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<ShieldCheck size={16} />} label="Active collaborators" value={`${active.length} people`} delta={`${collaborators.filter((c) => c.status === "invited").length} invited`} sub="scoped, revocable access" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<History size={16} />} label="Audit events (7d)" value={`${auditTrailSeed.length} events`} delta="immutable log" sub="every action, every user" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<FileCheck2 size={16} />} label="Close checklist" value={`${doneCount} / ${checks.length}`} delta={`${checks.length - doneCount} remaining`} sub="month-end readiness" deltaTone={doneCount === checks.length ? "up" : "down"} /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Lock size={16} />} label="Locked periods" value="2 months" delta="Jan + Feb 2026" sub="protected from edits" /></div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Who can see your books</div><button className="pm-link-btn pm-fs-12" onClick={() => setInvite(true)}>+ Invite</button></div>
              {collaborators.map((c) => (
                <div className="pm-collab-row" key={c.id}>
                  <Avatar name={c.name} size={36} />
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <b className="pm-fs-13">{c.name}</b>
                      <Badge tone={c.role === "Accountant" ? "info" : c.role === "Auditor" ? "warning" : "muted"}>{c.role}</Badge>
                      {c.status === "invited" && <Badge tone="warning" dot>Invited</Badge>}
                    </div>
                    <div className="pm-muted pm-fs-11">{c.firm} · {c.email}</div>
                    <div className="pm-access-chips">{c.access.map((a) => <span key={a}>{a}</span>)}</div>
                  </div>
                  <div className="text-end">
                    <div className="pm-muted pm-fs-11">{c.lastActive}</div>
                    <div className="d-flex gap-1 justify-content-end mt-1">
                      <button className="pm-icon-btn" onClick={() => setDetail(c)}><Eye size={13} /></button>
                      <button className="pm-icon-btn pm-icon-danger" onClick={() => setRevoke(c)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pm-cyan-note mt-2">Accountants get read + journal access only — they can never move money.</div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div><div className="pm-card-title">Month-end close checklist</div><div className="pm-card-sub">March 2026 · {doneCount} of {checks.length} complete</div></div>
                <button className="pm-link-btn pm-fs-12" onClick={() => setYearEnd(true)}>Run close →</button>
              </div>
              <div className="progress pm-prog mb-3"><div className="progress-bar" style={{ width: `${(doneCount / checks.length) * 100}%`, background: "#7c3aed" }} /></div>
              {checks.map((c) => (
                <button className="pm-health-row" key={c.id} onClick={() => {
                  if (c.id === "cc2") emit({ a: "focusCategorize" });
                  else if (c.id === "cc4") emit({ a: "newJournal" });
                  else if (c.id === "cc6") emit({ a: "fileVat" });
                  else setChecks((cs) => cs.map((x) => (x.id === c.id ? { ...x, done: !x.done } : x)));
                }}>
                  <span className={cls("pm-health-dot", c.done ? "pm-health-ok" : "pm-health-bad")}>{c.done ? "✓" : "!"}</span>
                  <span className="flex-grow-1 text-start"><b className="pm-fs-13">{c.label}</b><span className="pm-muted pm-fs-11 d-block">{c.detail}</span></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── invite wizard (3 steps) ── */}
      <InviteWizard open={invite} onClose={() => setInvite(false)} notify={notify}
        onInvite={(c) => setCollaborators((cs) => [...cs, c])} />

      {/* ── collaborator detail ── */}
      <SlideOver open={!!detail} onClose={() => setDetail(null)} kicker="Collaborator" title={detail?.name ?? ""} width={480}
        footer={<><button className="btn pm-btn-soft btn-sm" onClick={() => { notify({ tone: "info", title: "Reminder sent", body: `${detail?.name} was nudged to accept the invitation.` }); setDetail(null); }}><Mail size={14} /> Send reminder</button>
          <button className="btn pm-btn-danger-soft btn-sm" onClick={() => { setRevoke(detail); setDetail(null); }}>Revoke access</button></>}
      >
        {detail && (
          <>
            <div className="pm-detail-head">
              <div className="d-flex align-items-center gap-3">
                <Avatar name={detail.name} size={44} />
                <div>
                  <div className="fw-bold">{detail.name}</div>
                  <div className="pm-muted pm-fs-12">{detail.firm} · {detail.email}</div>
                </div>
              </div>
              <div className="pm-stat-row mt-3">
                <div><b>{detail.role}</b><span>role</span></div>
                <div><b>{detail.access.length}</b><span>areas</span></div>
                <div><b>{detail.status}</b><span>status</span></div>
              </div>
            </div>
            <div className="pm-detail-section">
              <div className="pm-preview-label">Access areas</div>
              <div className="pm-check-grid">
                {ACCESS_AREAS.map((a) => <span key={a} className={cls("pm-check-chip", detail.access.includes(a) && "pm-check-on")}>{detail.access.includes(a) ? "✓ " : ""}{a}</span>)}
              </div>
            </div>
            <div className="pm-detail-section">
              <div className="pm-preview-label">Recent activity</div>
              {auditTrailSeed.filter((a) => a.who.startsWith(detail.name.split(" ")[0])).map((a) => (
                <div className="pm-tl-item" key={a.id}><span className="pm-tl-dot pm-tl-dot-view" /><div><div className="pm-fs-13">{a.action}</div><div className="pm-muted pm-fs-11">{fmtDT(a.t)}</div></div></div>
              ))}
              {auditTrailSeed.filter((a) => a.who.startsWith(detail.name.split(" ")[0])).length === 0 && <div className="pm-muted pm-fs-13">No activity yet.</div>}
            </div>
          </>
        )}
      </SlideOver>

      {/* ── revoke ── */}
      <Confirm open={!!revoke} onClose={() => setRevoke(null)}
        onConfirm={() => { if (revoke) { setCollaborators((cs) => cs.filter((x) => x.id !== revoke.id)); notify({ tone: "danger", title: "Access revoked", body: `${revoke.name} can no longer see your books. Their session ended immediately.` }); } }}
        title="Revoke access" confirmLabel="Revoke" tone="danger"
        body={<span>Remove <b>{revoke?.name}</b> from your books? Their sessions end instantly and the change is logged in the audit trail.</span>}
        icon={<ShieldCheck size={18} />} />

      {/* ── audit trail ── */}
      <AuditModal open={audit} onClose={() => setAudit(false)} notify={notify} />

      {/* ── year-end close wizard ── */}
      <CloseWizard open={yearEnd} onClose={() => setYearEnd(false)} checks={checks} notify={notify} emit={emit} />
    </>
  );
}

/* ── invite wizard ── */

function InviteWizard({ open, onClose, notify, onInvite }: {
  open: boolean; onClose: () => void; notify: Notify; onInvite: (c: Collaborator) => void;
}) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ name: "", firm: "", email: "", role: "Accountant" });
  const [access, setAccess] = useState<string[]>(["Reports", "Journals", "VAT"]);
  const [expiry, setExpiry] = useState("never");
  useEffect(() => { if (open) { setStep(1); setF({ name: "", firm: "", email: "", role: "Accountant" }); setAccess(["Reports", "Journals", "VAT"]); setExpiry("never"); } }, [open]);
  const valid1 = f.name && f.email;
  const send = () => {
    onInvite({ id: uid("col"), name: f.name, firm: f.firm || "External", email: f.email, role: f.role as Collaborator["role"], access, lastActive: "invited just now", status: "invited" });
    notify({ tone: "success", title: "Invitation sent", body: `${f.name} received a secure link to ${access.length} area(s). It expires in 7 days if unused.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Collaboration" title="Invite an accountant or auditor" size="lg"
      footer={
        <>
          {step > 1 && <button className="btn pm-btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>}
          {step < 3 && <button className="btn pm-btn-violet" disabled={step === 1 && !valid1} onClick={() => setStep(step + 1)}>Continue →</button>}
          {step === 3 && <button className="btn pm-btn-violet" onClick={send}><Mail size={15} /> Send invitation</button>}
        </>
      }
    >
      <Stepper steps={3} current={step} labels={["Who", "Access", "Review"]} />
      {step === 1 && (
        <div className="row g-3">
          <div className="col-md-6"><Field label="Full name" req><input className="form-control pm-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Grace Mwende, CPA(K)" /></Field></div>
          <div className="col-md-6"><Field label="Firm"><input className="form-control pm-input" value={f.firm} onChange={(e) => setF({ ...f, firm: e.target.value })} placeholder="Mwende & Associates" /></Field></div>
          <div className="col-md-6"><Field label="Email" req><input className="form-control pm-input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field></div>
          <div className="col-md-6"><Field label="Role"><select className="form-select pm-input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{["Accountant", "Auditor", "Bookkeeper", "Viewer"].map((r) => <option key={r}>{r}</option>)}</select></Field></div>
        </div>
      )}
      {step === 2 && (
        <div>
          <Field label="Grant access to">
            <div className="pm-check-grid">
              {ACCESS_AREAS.map((a) => (
                <button key={a} className={cls("pm-check-chip", access.includes(a) && "pm-check-on")} onClick={() => setAccess((x) => (x.includes(a) ? x.filter((y) => y !== a) : [...x, a]))}>{access.includes(a) ? "✓ " : ""}{a}</button>
              ))}
            </div>
          </Field>
          <Field label="Access expires">
            <div className="pm-mode-tabs">
              {[["never", "No expiry"], ["30", "30 days"], ["90", "90 days"], ["year", "End of financial year"]].map(([v, l]) => (
                <button key={v} className={cls("pm-mode-tab", expiry === v && "pm-mode-on")} onClick={() => setExpiry(v)}>{l}</button>
              ))}
            </div>
          </Field>
          <div className="pm-cyan-note">Collaborators never see banking credentials and can never initiate a payment — read + journal access only.</div>
        </div>
      )}
      {step === 3 && (
        <div>
          <div className="pm-summary-card">
            <div className="pm-summary-row"><span>Name</span><b>{f.name}</b></div>
            <div className="pm-summary-row"><span>Email</span><b>{f.email}</b></div>
            <div className="pm-summary-row"><span>Role</span><b>{f.role}</b></div>
            <div className="pm-summary-row"><span>Access</span><b>{access.join(", ") || "none"}</b></div>
            <div className="pm-summary-row"><span>Expiry</span><b>{expiry === "never" ? "No expiry" : expiry === "year" ? "End of FY" : `${expiry} days`}</b></div>
          </div>
          <div className="pm-note mt-2">The invitation link is single-use and expires in 7 days if unopened.</div>
        </div>
      )}
    </Modal>
  );
}

/* ── audit trail ── */

function AuditModal({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [filter, setFilter] = useState("all");
  const rows = auditTrailSeed.filter((a) => filter === "all" || a.kind === filter);
  return (
    <Modal open={open} onClose={onClose} kicker="Immutable Log" title="Audit trail" subtitle="Every action on your books, permanently recorded." size="lg"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
        <button className="btn pm-btn-violet" onClick={() => { downloadCSV(`audit-trail-${todayISO()}.csv`, [["Timestamp", "User", "Action", "Type"], ...auditTrailSeed.map((a) => [a.t, a.who, a.action, a.kind])]); notify({ tone: "success", title: "Audit trail exported", body: "Full log downloaded — auditors accept this format." }); }}><Download size={15} /> Export log</button></>}
    >
      <div className="pm-mode-tabs mb-3">
        {[["all", "All"], ["journal", "Journals"], ["filing", "Filings"], ["edit", "Edits"], ["auto", "System"], ["error", "Errors"]].map(([v, l]) => (
          <button key={v} className={cls("pm-mode-tab", filter === v && "pm-mode-on")} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>
      {rows.map((a) => (
        <div className="pm-tl-item" key={a.id}>
          <span className={cls("pm-tl-dot", a.kind === "filing" && "pm-tl-dot-pay", a.kind === "error" && "pm-tl-dot-rem", a.kind === "journal" && "pm-tl-dot-sent", a.kind === "view" && "pm-tl-dot-view")} />
          <div className="flex-grow-1">
            <div className="pm-fs-13">{a.action}</div>
            <div className="pm-muted pm-fs-11">{a.who} · {fmtDT(a.t)}</div>
          </div>
          <Badge tone={a.kind === "error" ? "danger" : a.kind === "filing" ? "success" : "muted"}>{a.kind}</Badge>
        </div>
      ))}
      <div className="pm-cyan-note mt-2">Audit entries can never be edited or deleted — that's what makes them admissible to KRA and auditors.</div>
    </Modal>
  );
}

/* ── year-end close wizard (4 steps) ── */

function CloseWizard({ open, onClose, checks, notify, emit }: {
  open: boolean; onClose: () => void; checks: typeof closeChecklist; notify: Notify; emit: (q: QAction) => void;
}) {
  const [step, setStep] = useState(1);
  const [period, setPeriod] = useState("March 2026");
  const [rollForward, setRollForward] = useState(true);
  const [lockAfter, setLockAfter] = useState(true);
  const [notifyAcc, setNotifyAcc] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { if (open) { setStep(1); setBusy(false); setDone(false); } }, [open]);

  const outstanding = checks.filter((c) => !c.done);
  const run = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false); setDone(true);
      notify({ tone: "success", title: `${period} closed`, body: `Books closed${lockAfter ? " and locked" : ""}${rollForward ? " · retained earnings rolled forward" : ""}${notifyAcc ? " · accountant notified" : ""}.` });
    }, 2000);
  };

  return (
    <Modal open={open} onClose={onClose} kicker="Period Close" title="Year-end / month-end close" size="lg" hideClose={busy}
      footer={
        done ? (<button className="btn pm-btn-primary w-100" onClick={onClose}>Done</button>)
          : step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-violet" onClick={() => setStep(2)}>Continue →</button></>)
          : step === 2 ? (<><button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button><button className="btn pm-btn-violet" onClick={() => setStep(3)}>Continue →</button></>)
          : (<><button className="btn pm-btn-ghost" disabled={busy} onClick={() => setStep(2)}>← Back</button>
            <button className="btn pm-btn-violet" disabled={busy} onClick={run}>{busy ? <><Loader2 size={15} className="pm-spin" /> Closing books…</> : <><Archive size={15} /> Close {period}</>}</button></>)
      }
    >
      <Stepper steps={3} current={step} labels={["Checklist", "Closing options", "Confirm"]} />
      {step === 1 && (
        <div>
          <Field label="Period to close">
            <select className="form-select pm-input" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option>March 2026</option><option>Q1 2026</option><option>Financial year 2026</option>
            </select>
          </Field>
          <div className="pm-preview-label mt-3">Readiness — {checks.filter((c) => c.done).length} of {checks.length} complete</div>
          {checks.map((c) => (
            <div className="pm-health-row" key={c.id}>
              <span className={cls("pm-health-dot", c.done ? "pm-health-ok" : "pm-health-bad")}>{c.done ? "✓" : "!"}</span>
              <span className="flex-grow-1"><b className="pm-fs-13">{c.label}</b><span className="pm-muted pm-fs-11 d-block">{c.detail}</span></span>
              {!c.done && (
                <button className="pm-link-btn pm-fs-12" onClick={() => {
                  onClose();
                  if (c.id === "cc2") emit({ a: "focusCategorize" });
                  else if (c.id === "cc4") emit({ a: "newJournal" });
                  else if (c.id === "cc6") emit({ a: "fileVat" });
                }}>Fix →</button>
              )}
            </div>
          ))}
          {outstanding.length > 0 && <div className="pm-warn-chip mt-3 w-100 justify-content-start">{outstanding.length} item(s) outstanding — you can still close, but your accountant will likely ask about them.</div>}
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="pm-toggle-row"><Toggle on={rollForward} onChange={setRollForward} label="Roll net profit into Retained Earnings" /></div>
          <div className="pm-toggle-row"><Toggle on={lockAfter} onChange={setLockAfter} label="Lock the period after closing (recommended)" /></div>
          <div className="pm-toggle-row"><Toggle on={notifyAcc} onChange={setNotifyAcc} label="Email the closing pack to Grace Mwende, CPA(K)" /></div>
          <div className="pm-cyan-note mt-2">Closing posts a system journal that zeroes income & expense accounts into Retained Earnings — exactly what your auditor expects.</div>
        </div>
      )}
      {step === 3 && (
        done ? (
          <div className="text-center py-3">
            <div className="pm-big-ic pm-big-ic-success mx-auto"><CheckCircle2 size={28} /></div>
            <h5 className="fw-bold mt-3">{period} is closed</h5>
            <p className="pm-muted">Closing journal posted{lockAfter ? " · period locked" : ""}. Reports for this period are now final.</p>
            <div className="pm-cyan-note">Your next period opened automatically with the rolled-forward balances.</div>
          </div>
        ) : (
          <div>
            <div className="pm-summary-card">
              <div className="pm-summary-row"><span>Closing</span><b>{period}</b></div>
              <div className="pm-summary-row"><span>Checklist</span><b>{checks.filter((c) => c.done).length} of {checks.length} complete</b></div>
              <div className="pm-summary-row"><span>Roll forward</span><b>{rollForward ? "Yes → Retained Earnings" : "No"}</b></div>
              <div className="pm-summary-row"><span>Lock after close</span><b>{lockAfter ? "Yes" : "No"}</b></div>
              <div className="pm-summary-row"><span>Notify accountant</span><b>{notifyAcc ? "Yes" : "No"}</b></div>
            </div>
            {busy && (
              <div className="pm-sync-list mt-3">
                <div className="pm-sync-step pm-sync-active"><Loader2 size={15} className="pm-spin" /> Posting closing journal…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">2</span> Rolling balances forward…</div>
                <div className="pm-sync-step"><span className="pm-sync-num">3</span> {lockAfter ? "Locking period…" : "Finalising reports…"}</div>
              </div>
            )}
          </div>
        )
      )}
    </Modal>
  );
}
