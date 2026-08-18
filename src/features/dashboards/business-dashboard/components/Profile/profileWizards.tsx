import { useState } from "react";
import { COUNTIES, FY_MONTHS, INDUSTRIES, SECTOR_PRESETS, fmtKES } from "./data";
import type { EntityType } from "./data";
import { useStore } from "./store";
import { Badge, Chip, Field, Modal, WizardShell } from "./ui";

/* ==================================================================
   BUSINESS PROFILE EDITOR — 6 steps
================================================================== */
export function EditProfileWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { profile, updateProfile, applyPreset, recordActivity, toast } = useStore();
  const [step, setStep] = useState(0);
  const [p, setP] = useState({ ...profile });
  const [suggestPreset, setSuggestPreset] = useState(false);

  const steps = [
    { label: "Identity", icon: "bi-buildings" },
    { label: "Address & contact", icon: "bi-geo-alt" },
    { label: "Branding", icon: "bi-palette" },
    { label: "Industry & sector", icon: "bi-tags" },
    { label: "Financial year", icon: "bi-calendar-event" },
    { label: "Invoice defaults", icon: "bi-receipt" },
  ];

  return (
    <Modal open onClose={onClose} title="Edit business profile" subtitle="6 steps · flows into invoices, tax returns, payment pages & customer portals" icon="bi-pencil-square" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary me-auto" onClick={() => { updateProfile(p); toast("Draft saved.", "info", "Saved"); onClose(); }}>
            Save draft
          </button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 5 ? (
            <button type="button" className="btn btn-primary"
              disabled={(step === 0 && (!p.legalName.trim() || !p.regNumber.trim() || !p.kraPin.trim()))}
              onClick={() => {
                if (step === 3 && p.industry !== profile.industry) setSuggestPreset(true);
                setStep((s) => s + 1);
              }}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              updateProfile(p);
              recordActivity(`Business profile updated (${p.legalName})`, "bi-pencil-square");
              toast("Profile saved — reflected on invoices, receipts and payment pages immediately.", "success", "Profile updated");
              onClose();
            }}>
              <i className="bi bi-check2-circle me-1" /> Save profile
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={steps} current={step} onStep={(i) => i < step && setStep(i)}>
        {/* STEP 1 — IDENTITY */}
        {step === 0 && (
          <div className="row g-3">
            <Field label="Legal name (as registered) *" className="col-md-8">
              <input className="form-control" value={p.legalName} onChange={(e) => setP((x) => ({ ...x, legalName: e.target.value }))} />
            </Field>
            <Field label="Trading name (if different)" className="col-md-4">
              <input className="form-control" value={p.tradingName} onChange={(e) => setP((x) => ({ ...x, tradingName: e.target.value }))} />
            </Field>
            <Field label="Entity type *" className="col-md-6">
              <select className="form-select" value={p.entityType} onChange={(e) => setP((x) => ({ ...x, entityType: e.target.value as EntityType }))}>
                {["Sole Proprietorship", "Limited Company", "Partnership", "NGO", "SACCO", "Trust"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Registration date" className="col-md-6">
              <input className="form-control" placeholder="12 Mar 2022" value={p.regDate} onChange={(e) => setP((x) => ({ ...x, regDate: e.target.value }))} />
            </Field>
            <Field label="Business registration number *" className="col-md-6" hint="e.g. PPT/2024/123456">
              <input className="form-control pm-mono" value={p.regNumber} onChange={(e) => setP((x) => ({ ...x, regNumber: e.target.value }))} />
            </Field>
            <Field label="KRA PIN *" className="col-md-6" hint="We'll verify this against iTax in real time.">
              <div className="input-group">
                <input className="form-control pm-mono text-uppercase" value={p.kraPin} onChange={(e) => setP((x) => ({ ...x, kraPin: e.target.value.toUpperCase() }))} />
                {p.kraVerified ? <span className="input-group-text text-primary"><i className="bi bi-check-circle-fill me-1" />Verified</span> : <span className="input-group-text" style={{ color: "var(--pm-warn)" }}><i className="bi bi-hourglass-split me-1" />Unverified</span>}
              </div>
            </Field>
          </div>
        )}

        {/* STEP 2 — ADDRESS & CONTACT */}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Physical address" className="col-12">
              <input className="form-control" value={p.address} onChange={(e) => setP((x) => ({ ...x, address: e.target.value }))} />
            </Field>
            <Field label="County / sub-county" className="col-md-6">
              <select className="form-select" value={p.county.split(" ·")[0]} onChange={(e) => setP((x) => ({ ...x, county: e.target.value }))}>
                {COUNTIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Business email *" className="col-md-6">
              <input className="form-control" value={p.email} onChange={(e) => setP((x) => ({ ...x, email: e.target.value }))} />
            </Field>
            <Field label="Business phone *" className="col-md-6">
              <input className="form-control" value={p.phone} onChange={(e) => setP((x) => ({ ...x, phone: e.target.value }))} />
            </Field>
            <Field label="Primary contact person" className="col-md-6">
              <input className="form-control" value={p.contactName} onChange={(e) => setP((x) => ({ ...x, contactName: e.target.value }))} />
            </Field>
            <Field label="Alternative contact" className="col-md-6">
              <input className="form-control" value={p.altContactName} onChange={(e) => setP((x) => ({ ...x, altContactName: e.target.value }))} />
            </Field>
            <Field label="Alt contact phone" className="col-md-6">
              <input className="form-control" value={p.altContactPhone} onChange={(e) => setP((x) => ({ ...x, altContactPhone: e.target.value }))} />
            </Field>
          </div>
        )}

        {/* STEP 3 — BRANDING */}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Logo (emoji or upload)" className="col-md-3">
              <input className="form-control text-center" style={{ fontSize: "1.5rem" }} value={p.logoEmoji} onChange={(e) => setP((x) => ({ ...x, logoEmoji: e.target.value }))} />
            </Field>
            <Field label="Primary brand colour" className="col-md-4">
              <div className="input-group">
                <input type="color" className="form-control form-control-color" style={{ width: 44 }} value={p.primaryColor} onChange={(e) => setP((x) => ({ ...x, primaryColor: e.target.value }))} />
                <input className="form-control pm-mono" value={p.primaryColor} onChange={(e) => setP((x) => ({ ...x, primaryColor: e.target.value }))} />
              </div>
            </Field>
            <Field label="Secondary colour" className="col-md-5">
              <div className="input-group">
                <input type="color" className="form-control form-control-color" style={{ width: 44 }} value={p.secondaryColor} onChange={(e) => setP((x) => ({ ...x, secondaryColor: e.target.value }))} />
                <input className="form-control pm-mono" value={p.secondaryColor} onChange={(e) => setP((x) => ({ ...x, secondaryColor: e.target.value }))} />
              </div>
            </Field>
            <Field label="Website" className="col-md-6"><input className="form-control" value={p.website} onChange={(e) => setP((x) => ({ ...x, website: e.target.value }))} /></Field>
            <Field label="Instagram" className="col-md-3"><input className="form-control" value={p.instagram} onChange={(e) => setP((x) => ({ ...x, instagram: e.target.value }))} /></Field>
            <Field label="Facebook" className="col-md-3"><input className="form-control" value={p.facebook} onChange={(e) => setP((x) => ({ ...x, facebook: e.target.value }))} /></Field>
            <div className="col-12">
              <div className="pm-brand-preview p-3" style={{ background: p.primaryColor + "12", border: "1px solid " + p.primaryColor + "40", borderRadius: 12 }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span style={{ width: 42, height: 42, borderRadius: 10, background: p.primaryColor, color: "#fff", display: "grid", placeItems: "center", fontSize: "1.3rem" }}>{p.logoEmoji}</span>
                  <div><b style={{ fontSize: "0.92rem", color: p.secondaryColor }}>{p.tradingName || p.legalName}</b><div className="pm-prod-meta">{p.address}</div></div>
                </div>
                <div className="pm-prod-meta">Preview of your invoice/payment page header · brand colours flow everywhere customer-facing.</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — INDUSTRY */}
        {step === 3 && (
          <div className="row g-3">
            <Field label="Industry *" className="col-md-6">
              <select className="form-select" value={p.industry} onChange={(e) => setP((x) => ({ ...x, industry: e.target.value }))}>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Sub-sector" className="col-md-6">
              <input className="form-control" placeholder="e.g. IT services & software" value={p.subSector} onChange={(e) => setP((x) => ({ ...x, subSector: e.target.value }))} />
            </Field>
            {suggestPreset && (
              <div className="col-12">
                <div className="pm-note d-flex align-items-center gap-2" style={{ background: "var(--pm-green-soft)", borderColor: "#b7e6cf" }}>
                  <i className="bi bi-magic text-primary" />
                  <span className="flex-grow-1">Detected industry change — apply the matching sector preset to configure defaults automatically?</span>
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => { const preset = SECTOR_PRESETS.find((s) => s.industries.some((i) => p.industry.toLowerCase().includes(i.toLowerCase()))); if (preset) applyPreset(preset.id); setSuggestPreset(false); }}>
                    Apply preset
                  </button>
                </div>
              </div>
            )}
            <div className="col-12">
              <div className="pm-note soft"><i className="bi bi-info-circle me-1" />Industry drives compliance rules (e.g. NGO exemptions), report benchmarks, and default chart of accounts.</div>
            </div>
          </div>
        )}

        {/* STEP 5 — FINANCIAL YEAR */}
        {step === 4 && (
          <div className="row g-3">
            <Field label="Financial year end month *" className="col-md-6" hint="Most Kenyan businesses use December — but NGOs and some subsidiaries use March/June.">
              <select className="form-select" value={p.fyEnd} onChange={(e) => setP((x) => ({ ...x, fyEnd: e.target.value }))}>
                {FY_MONTHS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <div className="col-md-6">
              <div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                <div className="pm-kpi-label">Current tax year</div>
                <b>Jan 2025 → Dec 2025</b>
                <div className="pm-prod-meta">Annual filing due 30 Jun 2026</div>
              </div>
            </div>
            <div className="col-12"><div className="pm-note"><i className="bi bi-calendar-event me-1" />Year-end triggers auto-closing entries, tax return draft generation and archive of the year in Bookkeeping.</div></div>
          </div>
        )}

        {/* STEP 6 — INVOICE DEFAULTS */}
        {step === 5 && (
          <div className="row g-3">
            <Field label="Default payment terms" className="col-md-6">
              <select className="form-select" value={p.defaultTerms} onChange={(e) => setP((x) => ({ ...x, defaultTerms: e.target.value }))}>
                <option>On receipt</option><option>7 days</option><option>15 days</option><option>30 days</option><option>60 days</option><option>90 days</option>
              </select>
            </Field>
            <Field label="Default invoice template" className="col-md-6">
              <select className="form-select" value={p.defaultTemplate} onChange={(e) => setP((x) => ({ ...x, defaultTemplate: e.target.value }))}>
                <option>Professional</option><option>Simple</option><option>Retail</option>
              </select>
            </Field>
            <Field label="Default invoice notes" className="col-12" hint="Appears at the bottom of every invoice.">
              <textarea className="form-control" rows={2} value={p.invoiceNotes} onChange={(e) => setP((x) => ({ ...x, invoiceNotes: e.target.value }))} />
            </Field>
            <Field label="Payment instructions" className="col-12" hint="Tells the customer how to pay you.">
              <textarea className="form-control" rows={2} value={p.paymentInstructions} onChange={(e) => setP((x) => ({ ...x, paymentInstructions: e.target.value }))} />
            </Field>
            <div className="col-12"><div className="pm-note soft"><i className="bi bi-shield-check me-1" />These are per-business defaults — you can override any of them per invoice in Get Paid.</div></div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   UPLOAD DOCUMENT WIZARD — 4 steps
================================================================== */
export function UploadDocWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { kybDocs, uploadDoc } = useStore();
  const preId = String(payload.docId ?? "");
  const [step, setStep] = useState(0);
  const [docId, setDocId] = useState(preId || kybDocs.find((d) => d.status === "Missing")?.id || "kd1");
  const [fileName, setFileName] = useState("");
  const [phase, setPhase] = useState<"idle" | "uploading" | "done">("idle");
  const doc = kybDocs.find((d) => d.id === docId);

  const doUpload = () => {
    setPhase("uploading");
    window.setTimeout(() => { setPhase("done"); }, 1500);
  };
  return (
    <Modal open onClose={onClose} title="Upload KYB document" subtitle="4 steps · encrypted at rest · shared only with PayMo compliance" icon="bi-cloud-upload" size="lg" hideClose={phase === "uploading"}
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && step < 3 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={(step === 1 && !fileName.trim())} onClick={() => setStep((s) => s + 1)}>
              Next <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : phase === "done" ? (
            <button type="button" className="btn btn-success" onClick={() => { uploadDoc(docId, fileName); onClose(); }}>
              <i className="bi bi-check2-circle me-1" /> Submit for review
            </button>
          ) : (
            <button type="button" className="btn btn-primary" disabled={phase === "uploading"} onClick={doUpload}>
              {phase === "uploading" ? <><span className="pm-spin me-1">◌</span> Uploading & scanning…</> : <><i className="bi bi-cloud-upload me-1" /> Upload &amp; scan</>}
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Select document", icon: "bi-list-check" }, { label: "Attach file", icon: "bi-paperclip" }, { label: "Review", icon: "bi-eye" }, { label: "Upload & submit", icon: "bi-cloud-upload" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            <div className="pm-kpi-label mb-2">Which document are you uploading?</div>
            {kybDocs.map((d) => (
              <button key={d.id} type="button" className={`pm-theme-card text-start p-2 w-100 mb-2 ${docId === d.id ? "sel" : ""}`} onClick={() => setDocId(d.id)}>
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${d.status === "Verified" ? "bi-patch-check-fill text-primary" : d.status === "Under Review" ? "bi-hourglass-split" : d.status === "Expiring soon" ? "bi-clock-history" : "bi-exclamation-circle-fill"}`} style={{ color: d.status === "Missing" ? "var(--pm-danger)" : d.status === "Expiring soon" ? "var(--pm-warn)" : undefined }} />
                  <b style={{ fontSize: "0.84rem" }} className="flex-grow-1">{d.label}</b>
                  <Badge tone={d.status === "Verified" ? "green" : d.status === "Missing" ? "red" : d.status === "Expiring soon" ? "amber" : "blue"}>{d.status}</Badge>
                </div>
                <div className="pm-prod-meta mt-1">{d.desc}</div>
              </button>
            ))}
          </div>
        )}
        {step === 1 && doc && (
          <div>
            <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />{doc.label} — {doc.desc}. Max 10MB · PDF, JPG or PNG · OCR & IPRS cross-check happen on upload.</div>
            <div className="text-center py-4" style={{ border: "2px dashed var(--pm-border)", borderRadius: 14 }}>
              {!fileName ? (
                <button type="button" className="btn btn-outline-primary" onClick={() => setFileName(`${doc.id}-${Date.now().toString().slice(-6)}.pdf`)}>
                  <i className="bi bi-cloud-arrow-up me-1" /> Select file
                </button>
              ) : (
                <div>
                  <div className="d-inline-flex align-items-center gap-2 px-3 py-2" style={{ background: "var(--pm-green-soft)", borderRadius: 10 }}>
                    <i className="bi bi-file-earmark-pdf text-primary" />
                    <b style={{ fontSize: "0.85rem" }}>{fileName}</b>
                    <span className="pm-prod-meta">2.4 MB · PDF</span>
                    <button type="button" className="btn-close" style={{ fontSize: "0.55rem" }} onClick={() => setFileName("")} />
                  </div>
                  <div className="pm-prod-meta mt-2">File attached · click Next to review before upload.</div>
                </div>
              )}
            </div>
          </div>
        )}
        {step === 2 && doc && (
          <div>
            <div className="row g-2 mb-3">
              <div className="col-md-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Document</div><b style={{ fontSize: "0.82rem" }}>{doc.label}</b></div></div>
              <div className="col-md-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">File</div><b className="pm-mono" style={{ fontSize: "0.78rem" }}>{fileName}</b></div></div>
            </div>
            <div className="pm-note"><i className="bi bi-shield-lock me-1 text-primary" />On upload we scan the document, extract text via OCR, and cross-check against the KRA/IPRS registry. Only PayMo compliance sees the file.</div>
          </div>
        )}
        {step === 3 && (
          <div className="text-center py-3">
            {phase === "idle" && (<>
              <i className="bi bi-cloud-upload" style={{ fontSize: "2.4rem", color: "var(--pm-green-dark)" }} />
              <p className="pm-prod-meta mt-2 mb-3">Ready to upload <b>{fileName}</b> for <b>{doc?.label}</b>. Click below to encrypt and send.</p>
            </>)}
            {phase === "uploading" && (<>
              <div className="pm-stk-ring mx-auto mb-2"><i className="pm-spin bi bi-arrow-repeat" style={{ fontSize: "1.6rem", color: "var(--pm-green)" }} /></div>
              <p className="pm-prod-meta">Uploading & running OCR + IPRS check…</p>
            </>)}
            {phase === "done" && (<>
              <i className="bi bi-check-circle-fill" style={{ fontSize: "3rem", color: "var(--pm-green)" }} />
              <h5 className="mt-2">Uploaded successfully</h5>
              <p className="pm-prod-meta mb-1">OCR complete · IPRS match found · submitted for compliance review.</p>
              <div className="d-flex justify-content-center gap-2"><Badge tone="green">Encrypted</Badge><Badge tone="blue">OCR ✓</Badge><Badge tone="violet">IPRS ✓</Badge></div>
            </>)}
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   NEW BUSINESS WIZARD — 5 steps
================================================================== */
export function NewBusinessWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { addBusiness, folders, openModal, toast, recordActivity, applyPreset } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("Limited Company");
  const [regNumber, setRegNumber] = useState("");
  const [kraPin, setKraPin] = useState("");
  const [industry, setIndustry] = useState("Retail / Trading");
  const [folder, setFolder] = useState("fol1");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [applyPresetToo, setApplyPresetToo] = useState(true);
  const [emoji, setEmoji] = useState("🏢");

  return (
    <Modal open onClose={onClose} title="Add a new business" subtitle="5 steps · mini-onboarding · full KYB can be completed later" icon="bi-plus-circle" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 4 ? (
            <button type="button" className="btn btn-primary"
              disabled={(step === 0 && !name.trim()) || (step === 1 && (!kraPin.trim() || !regNumber.trim()))}
              onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              const id = addBusiness({
                name: name.trim(), emoji, color: "#12b76a", entityType, status: "Active", folder,
                cash: 0, revenueMTD: 0, expensesMTD: 0, lastActivity: "Just created", kybLevel: "Level 1", kraPin,
              });
              if (applyPresetToo) {
                const preset = SECTOR_PRESETS.find((s) => s.industries.some((i) => industry.toLowerCase().includes(i.toLowerCase())));
                if (preset) applyPreset(preset.id);
              }
              recordActivity(`New business "${name}" onboarded (${entityType})`, "bi-plus-circle");
              toast(`🎉 ${name} is live in your portfolio at Level 1. Complete KYB to unlock Level 2 limits (KES 5M/day).`, "success", "Business created");
              onClose();
              openModal("businessDrawer", { id });
            }}>
              <i className="bi bi-check2-circle me-1" /> Create business
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[
        { label: "Name & type", icon: "bi-building" },
        { label: "KRA & registration", icon: "bi-shield-check" },
        { label: "Industry & folder", icon: "bi-tags" },
        { label: "Contact & branding", icon: "bi-envelope" },
        { label: "Review", icon: "bi-check2-circle" },
      ]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <Field label="Business name *" className="col-md-8">
              <input className="form-control" placeholder="e.g. TS Logistics Ltd" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <Field label="Logo emoji" className="col-md-4">
              <input className="form-control text-center" style={{ fontSize: "1.4rem" }} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
            </Field>
            <div className="col-12">
              <label className="form-label">Entity type</label>
              <div className="d-flex gap-2 flex-wrap">
                {(["Limited Company", "Sole Proprietorship", "Partnership", "NGO", "SACCO", "Trust"] as const).map((t) => (
                  <Chip key={t} on={entityType === t} onClick={() => setEntityType(t)}>{t}</Chip>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Registration number *" className="col-md-6" hint="From your incorporation certificate">
              <input className="form-control pm-mono" placeholder="PPT/2024/XXXXXX" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} />
            </Field>
            <Field label="KRA PIN *" className="col-md-6" hint="Verified against iTax automatically">
              <input className="form-control pm-mono text-uppercase" placeholder="P000000000X" value={kraPin} onChange={(e) => setKraPin(e.target.value.toUpperCase())} />
            </Field>
            <div className="col-12"><div className="pm-note soft"><i className="bi bi-info-circle me-1" />Level 1 KYB (basic) starts you at KES 300K/day. Upload the CR12, M&amp;A, and directors' IDs later to unlock Level 2 (KES 5M/day).</div></div>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Industry" className="col-md-6">
              <select className="form-select" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Portfolio folder" className="col-md-6">
              <select className="form-select" value={folder} onChange={(e) => setFolder(e.target.value)}>
                {folders.map((f) => <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}
              </select>
            </Field>
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="npAP" checked={applyPresetToo} onChange={(e) => setApplyPresetToo(e.target.checked)} />
                <label className="form-check-label" htmlFor="npAP">
                  <b style={{ fontSize: "0.84rem" }}>Apply the {industry} sector preset</b>
                  <div className="pm-prod-meta">Auto-configures Chart of Accounts, invoice defaults and modules that fit this industry.</div>
                </label>
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="row g-3">
            <Field label="Business email" className="col-md-6">
              <input className="form-control" placeholder="hello@company.co.ke" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Business phone" className="col-md-6">
              <input className="form-control" placeholder="07xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <div className="col-12">
              <div className="pm-note soft"><i className="bi bi-lightbulb me-1" />Add logo, brand colours and social handles after creation from the Business Profile Editor (6-step wizard).</div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <div className="row g-2 mb-3">
              {[
                { l: "Name", v: name || "—" },
                { l: "Type", v: entityType },
                { l: "KRA PIN", v: kraPin || "—" },
                { l: "Reg No.", v: regNumber || "—" },
                { l: "Industry", v: industry },
                { l: "Folder", v: folders.find((f) => f.id === folder)?.name },
              ].map((x) => (
                <div className="col-md-4 col-6" key={x.l}>
                  <div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                    <div className="pm-kpi-label">{x.l}</div>
                    <b style={{ fontSize: "0.82rem" }}>{x.v}</b>
                  </div>
                </div>
              ))}
            </div>
            <div className="pm-note"><i className="bi bi-shield-check me-1 text-primary" />On creation: entity added to portfolio · Level 1 KYB activated · KRA PIN queued for iTax verification · virtual M-Pesa account provisioned.</div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   NEW RENTAL PROPERTY WIZARD — 5 steps (rich preset)
================================================================== */
export function NewRentalWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { addBusiness, toast, recordActivity, applyPreset, openModal } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [propType, setPropType] = useState("Apartment complex");
  const [address, setAddress] = useState("");
  const [units, setUnits] = useState("4");
  const [rent, setRent] = useState("30000");
  const [deposit, setDeposit] = useState("30000");
  const [dueDay, setDueDay] = useState("1st of month");
  const [addTenants, setAddTenants] = useState(false);
  const [firstTenant, setFirstTenant] = useState({ name: "", phone: "", unit: "1A" });
  const grossMonthly = Number(units) * Number(rent);

  return (
    <Modal open onClose={onClose} title="Add rental property" subtitle="5 steps · specialized wizard · applies the full Real Estate preset" icon="bi-house-add" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 4 ? (
            <button type="button" className="btn btn-primary" disabled={(step === 0 && !name.trim()) || (step === 1 && !address.trim())} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              const id = addBusiness({
                name: name.trim(), emoji: "🏠", color: "#f79009", entityType: "Sole Proprietorship",
                status: "Active", folder: "fol2", cash: 0, revenueMTD: 0, expensesMTD: 0,
                lastActivity: "Just created", kybLevel: "Level 1", units: Number(units), kraPin: "A004321001X",
              });
              applyPreset("sp2");
              recordActivity(`Rental property "${name}" onboarded (${units} units, Real Estate preset applied)`, "bi-house-add");
              toast(`🏠 ${name} is live! Rent invoices, security deposit tracking and property CoA all configured. ${addTenants ? "First tenant added." : "Add tenants when you're ready."}`, "success", "Property added");
              onClose();
              openModal("businessDrawer", { id });
            }}>
              <i className="bi bi-check2-circle me-1" /> Create property
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[
        { label: "Property basics", icon: "bi-house" },
        { label: "Location", icon: "bi-geo-alt" },
        { label: "Units & rent", icon: "bi-cash-coin" },
        { label: "Auto-config", icon: "bi-magic" },
        { label: "First tenant", icon: "bi-person-plus" },
      ]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <Field label="Property name *" className="col-md-8">
              <input className="form-control" placeholder="e.g. Kilimani House 3" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <Field label="Property type" className="col-md-4">
              <select className="form-select" value={propType} onChange={(e) => setPropType(e.target.value)}>
                <option>Apartment complex</option><option>Standalone house</option><option>Commercial space</option><option>Mixed-use</option><option>Bedsitters</option>
              </select>
            </Field>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Address *" className="col-12">
              <input className="form-control" placeholder="Street, neighbourhood, town" value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
            <Field label="County" className="col-md-6">
              <select className="form-select" defaultValue="Nairobi">
                {COUNTIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Number of units *" className="col-md-3">
              <input type="number" min={1} className="form-control" value={units} onChange={(e) => setUnits(e.target.value)} />
            </Field>
            <Field label="Rent per unit (KES)" className="col-md-3">
              <div className="input-group"><span className="input-group-text">KES</span><input type="number" min={0} className="form-control" value={rent} onChange={(e) => setRent(e.target.value)} /></div>
            </Field>
            <Field label="Security deposit per unit" className="col-md-3">
              <div className="input-group"><span className="input-group-text">KES</span><input type="number" min={0} className="form-control" value={deposit} onChange={(e) => setDeposit(e.target.value)} /></div>
            </Field>
            <Field label="Payment terms" className="col-md-3">
              <select className="form-select" value={dueDay} onChange={(e) => setDueDay(e.target.value)}>
                <option>1st of month</option><option>5th of month</option><option>Anniversary of move-in</option>
              </select>
            </Field>
            <div className="col-12">
              <div className="pm-note">
                <i className="bi bi-calculator me-1" />Projection: <b>{units} units × {fmtKES(Number(rent))}</b> = <b className="text-primary">{fmtKES(grossMonthly)} / month</b> gross rent · deposits held: <b>{fmtKES(Number(units) * Number(deposit))}</b> (liability).
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="pm-note mb-3" style={{ background: "var(--pm-green-soft)", borderColor: "#b7e6cf" }}><i className="bi bi-magic me-1 text-primary" />The Real Estate preset — everything below is auto-configured when you finish:</div>
            {[
              { icon: "bi-journal-bookmark", t: "Rental Chart of Accounts", d: "Rent Income · Property Maintenance · Mortgage Interest · Security Deposits Liability" },
              { icon: "bi-bank", t: `Virtual account: "${name || "Property"} Collections"`, d: "Rent lands here first, then sweeps to your bank" },
              { icon: "bi-receipt", t: `Recurring rent invoices × ${units} units`, d: "Due ${dueDay} — auto-sent via WhatsApp & SMS" },
              { icon: "bi-person-badge", t: "Property Manager role", d: "Ready to assign to a caretaker with restricted access" },
              { icon: "bi-shield-check", t: "Rent Default Insurance option", d: "Cover up to 3 months' unpaid rent (from Insurance page)" },
            ].map((a) => (
              <div key={a.t} className="d-flex align-items-start gap-3 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 12 }}>
                <i className={`bi ${a.icon}`} style={{ color: "var(--pm-green-dark)", marginTop: 2 }} />
                <div><b style={{ fontSize: "0.84rem" }}>{a.t}</b><div className="pm-prod-meta">{a.d}</div></div>
              </div>
            ))}
          </div>
        )}
        {step === 4 && (
          <div className="row g-3">
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="addT" checked={addTenants} onChange={(e) => setAddTenants(e.target.checked)} />
                <label className="form-check-label" htmlFor="addT"><b style={{ fontSize: "0.84rem" }}>Add the first tenant now</b><div className="pm-prod-meta">Skip if units aren't ready — you can add tenants any time.</div></label>
              </div>
            </div>
            {addTenants && (
              <>
                <Field label="Tenant name" className="col-md-4"><input className="form-control" value={firstTenant.name} onChange={(e) => setFirstTenant((t) => ({ ...t, name: e.target.value }))} /></Field>
                <Field label="Phone (M-Pesa)" className="col-md-4"><input className="form-control" placeholder="07xx xxx xxx" value={firstTenant.phone} onChange={(e) => setFirstTenant((t) => ({ ...t, phone: e.target.value }))} /></Field>
                <Field label="Unit" className="col-md-4"><input className="form-control" value={firstTenant.unit} onChange={(e) => setFirstTenant((t) => ({ ...t, unit: e.target.value }))} /></Field>
                <div className="col-12"><div className="pm-note soft"><i className="bi bi-info-circle me-1" />Deposit of {fmtKES(Number(deposit))} recorded as a liability · rent invoice generated for {dueDay}.</div></div>
              </>
            )}
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   SECTOR PRESETS BROWSER — 4 steps
================================================================== */
export function SectorPresetsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { applyPreset, appliedPresets } = useStore();
  const [step, setStep] = useState(0);
  const [presetId, setPresetId] = useState(SECTOR_PRESETS[0].id);
  const [selectedChanges, setSelectedChanges] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState(false);
  const preset = SECTOR_PRESETS.find((p) => p.id === presetId);

  return (
    <Modal open onClose={onClose} title="Sector presets" subtitle="4 steps · industry-tailored configuration in seconds" icon="bi-magic" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={!preset} onClick={() => {
              if (step === 1 && preset) setSelectedChanges(new Set(preset.changes));
              setStep((s) => s + 1);
            }}>
              Next <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" disabled={!confirm} onClick={() => { if (preset) applyPreset(preset.id); onClose(); }}>
              <i className="bi bi-magic me-1" /> Apply preset
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[
        { label: "Choose preset", icon: "bi-tags" },
        { label: "Preview changes", icon: "bi-eye" },
        { label: "Select changes", icon: "bi-check2-square" },
        { label: "Confirm", icon: "bi-check2-circle" },
      ]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            {SECTOR_PRESETS.map((p) => (
              <div className="col-md-6" key={p.id}>
                <button type="button" className={`pm-theme-card text-start p-3 w-100 ${presetId === p.id ? "sel" : ""}`} onClick={() => setPresetId(p.id)}>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: "1.4rem" }}>{p.emoji}</span>
                    <b style={{ fontSize: "0.86rem" }}>{p.name}</b>
                    {appliedPresets.includes(p.id) && <Badge tone="green" className="ms-auto">Applied</Badge>}
                    {presetId === p.id && !appliedPresets.includes(p.id) && <i className="bi bi-check-circle-fill text-primary ms-auto" />}
                  </div>
                  <div className="pm-prod-meta mt-1">{p.desc}</div>
                  <div className="pm-prod-meta mt-1"><i className="bi bi-list-check me-1" />{p.changes.length} settings changed</div>
                </button>
              </div>
            ))}
          </div>
        )}
        {step === 1 && preset && (
          <div>
            <div className="pm-note mb-3"><span style={{ fontSize: "1.2rem" }}>{preset.emoji}</span> <b>{preset.name}</b> — {preset.desc}</div>
            <div className="pm-kpi-label mb-2">What will change</div>
            {preset.changes.map((c) => (
              <div key={c} className="d-flex align-items-start gap-2 py-1"><i className="bi bi-check-circle-fill text-primary" style={{ marginTop: 3 }} /><span style={{ fontSize: "0.82rem" }}>{c}</span></div>
            ))}
            <div className="pm-note soft mt-3"><i className="bi bi-shield-check me-1" />Every change is reversible from Bookkeeping &amp; Taxes and Get Paid.</div>
          </div>
        )}
        {step === 2 && preset && (
          <div>
            <div className="pm-kpi-label mb-2">Pick which changes to apply (all selected by default)</div>
            {preset.changes.map((c) => (
              <div key={c} className="d-flex align-items-start gap-2 p-2 mb-1" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                <div className="form-check mb-0"><input className="form-check-input" type="checkbox" checked={selectedChanges.has(c)} onChange={() => setSelectedChanges((s) => { const n = new Set(s); if (n.has(c)) n.delete(c); else n.add(c); return n; })} /></div>
                <span style={{ fontSize: "0.82rem" }}>{c}</span>
              </div>
            ))}
          </div>
        )}
        {step === 3 && preset && (
          <div>
            <div className="pm-note mb-3">Applying <b>{preset.name}</b> · {selectedChanges.size} of {preset.changes.length} changes selected.</div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="confirmPreset" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
              <label className="form-check-label" htmlFor="confirmPreset">I understand these changes take effect immediately and can be reverted individually.</label>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   ADD DIRECTOR / BENEFICIAL OWNER — 3 steps
================================================================== */
export function AddDirectorModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { addDirector, toast } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Director");
  const [kraPin, setKraPin] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [ownershipPct, setOwnershipPct] = useState("10");
  const [beneficialOwner, setBeneficialOwner] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const [pinUploaded, setPinUploaded] = useState(false);

  return (
    <Modal open onClose={onClose} title="Add director / beneficial owner" subtitle="3 steps · CBK-compliant onboarding" icon="bi-person-plus" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={step === 0 && (!name.trim() || !kraPin.trim())} onClick={() => setStep((s) => s + 1)}>
              Next <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              addDirector({ name, role, kraPin, idNumber, idUploaded, pinUploaded, beneficialOwner, ownershipPct: Number(ownershipPct) || 0 });
              toast(`${name} added — ${beneficialOwner ? "beneficial owner declaration updated." : "director recorded."}`, "success", "Director added");
              onClose();
            }}>
              <i className="bi bi-check2-circle me-1" /> Save director
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[
        { label: "Personal info", icon: "bi-person" },
        { label: "Ownership", icon: "bi-percent" },
        { label: "Documents", icon: "bi-cloud-upload" },
      ]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <Field label="Full name *" className="col-md-6"><input className="form-control" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Role" className="col-md-6">
              <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option>Director</option><option>Founder</option><option>Managing Director</option><option>Chairperson</option><option>Company Secretary</option>
              </select>
            </Field>
            <Field label="KRA PIN *" className="col-md-6"><input className="form-control pm-mono text-uppercase" placeholder="A000000000X" value={kraPin} onChange={(e) => setKraPin(e.target.value.toUpperCase())} /></Field>
            <Field label="National ID number" className="col-md-6"><input className="form-control pm-mono" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} /></Field>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Ownership percentage" className="col-md-6" hint="≥ 25% counts as a beneficial owner under CBK rules.">
              <div className="input-group"><input type="number" min={0} max={100} className="form-control" value={ownershipPct} onChange={(e) => setOwnershipPct(e.target.value)} /><span className="input-group-text">%</span></div>
            </Field>
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="benOwn" checked={beneficialOwner || Number(ownershipPct) >= 25} onChange={(e) => setBeneficialOwner(e.target.checked)} />
                <label className="form-check-label" htmlFor="benOwn"><b style={{ fontSize: "0.84rem" }}>Declare as beneficial owner</b><div className="pm-prod-meta">Required if this person actually controls the business, even indirectly (CBK regulation).</div></label>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <div className="col-md-6">
              <div className="pm-card p-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className={`bi ${idUploaded ? "bi-check-circle-fill text-primary" : "bi-cloud-upload"}`} />
                  <b style={{ fontSize: "0.84rem" }}>National ID copy</b>
                </div>
                {idUploaded ? <Badge tone="green">Uploaded ✓</Badge> : <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setIdUploaded(true)}><i className="bi bi-cloud-upload me-1" />Upload ID</button>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="pm-card p-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className={`bi ${pinUploaded ? "bi-check-circle-fill text-primary" : "bi-cloud-upload"}`} />
                  <b style={{ fontSize: "0.84rem" }}>KRA PIN Certificate</b>
                </div>
                {pinUploaded ? <Badge tone="green">Uploaded ✓</Badge> : <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setPinUploaded(true)}><i className="bi bi-cloud-upload me-1" />Upload PIN</button>}
              </div>
            </div>
            <div className="col-12"><div className="pm-note soft"><i className="bi bi-shield-lock me-1" />Documents are encrypted and shared only with PayMo compliance. Missing docs won't block adding the director — you can upload later.</div></div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}
