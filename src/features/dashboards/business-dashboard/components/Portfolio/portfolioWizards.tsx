import { useState } from "react";
import { fmtKES, MONTHLY_RENT } from "./data";
import { useStore } from "./store";
import { Badge, Chip, Field, Modal, WizardShell } from "./ui";

/* ==================================================================
   ENTITY CREATION WIZARD — type → details → auto-config → tenants
   Rental preset: 4 rich steps · Business preset: 3 simple steps
================================================================== */
export function EntityWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { folders, createEntity, addTenant, recordActivity, toast, openModal } = useStore();
  const [step, setStep] = useState(0);
  const [type, setType] = useState<"Ltd" | "Sole Prop" | "SACCO / NGO" | "Rental">("Rental");
  const [name, setName] = useState("");
  const [folder, setFolder] = useState("f2");
  const [krapin, setKrapin] = useState("");
  const [industry, setIndustry] = useState("Retail / Trading");
  /* rental preset fields */
  const [propType, setPropType] = useState("Apartment");
  const [address, setAddress] = useState("");
  const [units, setUnits] = useState("6");
  const [rent, setRent] = useState(String(MONTHLY_RENT));
  const [deposit, setDeposit] = useState(String(MONTHLY_RENT));
  const [dueDay, setDueDay] = useState("1st of month");
  const [addTenantsNow, setAddTenantsNow] = useState(true);
  const [tenant1, setTenant1] = useState({ name: "", phone: "", unit: "" });

  const isRental = type === "Rental";
  const steps = isRental
    ? [
      { label: "Type", icon: "bi-diagram-3" },
      { label: "Property details", icon: "bi-house" },
      { label: "Financial setup", icon: "bi-cash-coin" },
      { label: "Auto-config", icon: "bi-magic" },
      { label: "Tenants", icon: "bi-people" },
    ]
    : [
      { label: "Type", icon: "bi-diagram-3" },
      { label: "Details", icon: "bi-shop" },
      { label: "Auto-config", icon: "bi-magic" },
    ];

  const finish = () => {
    const id = createEntity({
      name: name.trim() || "New " + type,
      type, folder, emoji: isRental ? (propType === "Apartment" ? "🏢" : "🏠") : type === "Ltd" ? "🏢" : type === "Sole Prop" ? "🧑‍💼" : "🤝",
      color: isRental ? "#f79009" : "#12b76a",
      cash: 0, revenueMTD: 0, expensesMTD: 0, taxExposure: 0, status: "Healthy",
      units: isRental ? Number(units) || 1 : undefined, krapin: krapin || undefined,
    });
    if (isRental && addTenantsNow && tenant1.name.trim()) {
      addTenant({ name: tenant1.name.trim(), phone: tenant1.phone, email: "", unit: tenant1.unit || "1A", entityId: id, rent: Number(rent) || 30000, deposit: Number(deposit) || 30000, leaseStart: "Today", leaseEnd: "12 months", status: "Active", since: "Just now" });
    }
    recordActivity(`Entity "${name || type}" created with ${isRental ? "Rental" : "Standard"} preset`, "bi-plus-circle");
    toast(`🎉 ${name || type} created. ${isRental ? `Chart of accounts, collections VA, rent templates & Property Manager role auto-configured (${units} units).` : `Standard CoA template applied (${industry}).`}`, "success", "Entity ready");
    onClose();
    openModal("entityDrawer", { id });
  };

  const autoConfigList = isRental
    ? [
      { icon: "bi-journal-bookmark", t: "Rental chart of accounts", d: "Rent income · property maintenance · mortgage interest · security deposits liability" },
      { icon: "bi-bank", t: `Virtual account "${name || "Property"} Collections"`, d: "Rent hits this account, then sweeps to your bank" },
      { icon: "bi-receipt", t: `Recurring rent invoices × ${units || "?"} units`, d: "Due " + dueDay + " — auto-generated & sent via WhatsApp" },
      { icon: "bi-person-badge", t: "Default “Property Manager” role", d: "Pre-built for the team member you assign" },
      { icon: "bi-shield-check", t: "Rent Default Insurance (optional)", d: "Page 11 product — cover up to 3 months' unpaid rent" },
    ]
    : [
      { icon: "bi-journal-bookmark", t: `CoA template: ${industry}`, d: "Optimised account codes for your industry" },
      { icon: "bi-bank", t: "Operating virtual account", d: "Named account for collections & expenses" },
      { icon: "bi-receipt", t: "Invoice template", d: "Branded with your KRA PIN & PayMo defaults" },
      { icon: "bi-shield-check", t: "eTIMS profile", d: type === "Ltd" ? "Pre-registered — first sale files automatically" : "Under VAT threshold — exempt until you opt in" },
    ];

  return (
    <Modal open onClose={onClose} title="Add entity to your portfolio" subtitle="Preset-driven setup — 2 hours of configuration, done in 5 minutes" icon="bi-plus-circle" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < steps.length - 1 ? (
            <button type="button" className="btn btn-primary"
              disabled={(step === 1 && !name.trim()) || (step === 2 && (!units || !rent))}
              onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={finish}>
              <i className="bi bi-check2-circle me-1" /> Create entity
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={steps} current={step} onStep={(i) => i < step && setStep(i)}>
        {/* STEP 1 — TYPE */}
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {[
              { id: "Rental" as const, icon: "🏠", t: "Rental Property", d: "Houses & apartments — tenants, deposits, maintenance, vacancy loss", hot: true },
              { id: "Ltd" as const, icon: "🏢", t: "Limited Company (Ltd)", d: "Trading, services, tech — full KRA & eTIMS rails" },
              { id: "Sole Prop" as const, icon: "🧑‍💼", t: "Sole Proprietorship", d: "Side hustles & personal businesses under your name" },
              { id: "SACCO / NGO" as const, icon: "🤝", t: "SACCO / NGO", d: "Member funds & donor money with restricted accounts" },
            ].map((o) => (
              <button key={o.id} type="button" className={`pm-theme-card text-start p-3 ${type === o.id ? "sel" : ""}`} onClick={() => { setType(o.id); setFolder(o.id === "Rental" ? "f2" : "f1"); }}>
                <div className="d-flex align-items-center gap-3">
                  <span style={{ fontSize: "1.6rem" }}>{o.icon}</span>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2">
                      <b style={{ fontSize: "0.9rem" }}>{o.t}</b>
                      {o.hot && <Badge tone="amber">Rich preset</Badge>}
                    </div>
                    <div className="pm-prod-meta">{o.d}</div>
                  </div>
                  {type === o.id && <i className="bi bi-check-circle-fill text-primary" />}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 — PROPERTY / BUSINESS DETAILS */}
        {step === 1 && isRental && (
          <div className="row g-3">
            <Field label="Property name *" className="col-md-8">
              <input className="form-control" placeholder="e.g. Kilimani House 3" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <Field label="Property type" className="col-md-4">
              <select className="form-select" value={propType} onChange={(e) => setPropType(e.target.value)}>
                <option>Apartment</option><option>Standalone house</option><option>Commercial space</option><option>Mixed-use</option>
              </select>
            </Field>
            <Field label="Address" className="col-md-8">
              <input className="form-control" placeholder="Street, neighbourhood, town" value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
            <Field label="Number of units" className="col-md-4">
              <input type="number" min={1} className="form-control" value={units} onChange={(e) => setUnits(e.target.value)} />
            </Field>
          </div>
        )}
        {step === 1 && !isRental && (
          <div className="row g-3">
            <Field label="Business name *" className="col-md-8">
              <input className="form-control" placeholder="e.g. TS Logistics Ltd" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <Field label="KRA PIN" className="col-md-4">
              <input className="form-control" placeholder="P000000000X" value={krapin} onChange={(e) => setKrapin(e.target.value)} />
            </Field>
            <Field label="Industry (CoA template)" className="col-md-6">
              <select className="form-select" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option>Retail / Trading</option><option>Professional services</option><option>Tech / SaaS</option><option>Hospitality</option><option>NGO / Donor</option>
              </select>
            </Field>
            <Field label="Folder" className="col-md-6">
              <select className="form-select" value={folder} onChange={(e) => setFolder(e.target.value)}>
                {folders.map((f) => <option key={f.id} value={f.id}>{f.emoji} {f.name}</option>)}
              </select>
            </Field>
          </div>
        )}

        {/* STEP 3 — FINANCIAL SETUP (rental) */}
        {step === 2 && isRental && (
          <div className="row g-3">
            <Field label="Monthly rent per unit (KES)" className="col-md-4">
              <div className="input-group"><span className="input-group-text">KES</span>
                <input type="number" min={0} className="form-control" value={rent} onChange={(e) => setRent(e.target.value)} />
              </div>
            </Field>
            <Field label="Security deposit per unit (KES)" className="col-md-4">
              <div className="input-group"><span className="input-group-text">KES</span>
                <input type="number" min={0} className="form-control" value={deposit} onChange={(e) => setDeposit(e.target.value)} />
              </div>
            </Field>
            <Field label="Payment terms" className="col-md-4">
              <select className="form-select" value={dueDay} onChange={(e) => setDueDay(e.target.value)}>
                <option>1st of month</option><option>5th of month</option><option>Due on moving-in date</option>
              </select>
            </Field>
            <div className="col-12">
              <div className="pm-note">
                <i className="bi bi-calculator me-1" />
                Projection: <b>{units} units × KES {Number(rent).toLocaleString()}</b> = <b className="text-primary">{fmtKES(Number(units) * Number(rent))}/month</b> gross rent · deposits held <b>{fmtKES(Number(units) * Number(deposit))}</b> (liability).
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — AUTO-CONFIG */}
        {(isRental ? step === 3 : step === 2) && (
          <div>
            <div className="pm-note mb-3" style={{ background: "var(--pm-green-soft)", borderColor: "#b7e6cf" }}>
              <i className="bi bi-magic me-1 text-primary" />The magic step — PayMo builds all of this automatically when you confirm:
            </div>
            {autoConfigList.map((a) => (
              <div key={a.t} className="d-flex align-items-start gap-3 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 12 }}>
                <i className={`bi ${a.icon}`} style={{ color: "var(--pm-green-dark)", marginTop: 2 }} />
                <div>
                  <b style={{ fontSize: "0.84rem" }}>{a.t}</b>
                  <div className="pm-prod-meta">{a.d}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 5 — TENANTS (rental, optional) */}
        {step === 4 && isRental && (
          <div className="row g-3">
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="addTenants" checked={addTenantsNow} onChange={(e) => setAddTenantsNow(e.target.checked)} />
                <label className="form-check-label" htmlFor="addTenants"><b style={{ fontSize: "0.84rem" }}>Add the first tenant now</b><div className="pm-prod-meta">Skip if units are still being prepared — you can add tenants any time.</div></label>
              </div>
            </div>
            {addTenantsNow && (
              <>
                <Field label="Tenant name" className="col-md-4">
                  <input className="form-control" placeholder="e.g. Jane Kamau" value={tenant1.name} onChange={(e) => setTenant1((t) => ({ ...t, name: e.target.value }))} />
                </Field>
                <Field label="Phone" className="col-md-4">
                  <input className="form-control" placeholder="07xx xxx xxx" value={tenant1.phone} onChange={(e) => setTenant1((t) => ({ ...t, phone: e.target.value }))} />
                </Field>
                <Field label="Unit" className="col-md-4">
                  <input className="form-control" placeholder="e.g. 1A" value={tenant1.unit} onChange={(e) => setTenant1((t) => ({ ...t, unit: e.target.value }))} />
                </Field>
                <div className="col-12">
                  <div className="pm-note soft"><i className="bi bi-info-circle me-1" />Deposit of {fmtKES(Number(deposit) || 30000)} will be recorded as a liability and a rent invoice generated for {dueDay}.</div>
                </div>
              </>
            )}
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   INTER-COMPANY TRANSFER WIZARD — 3 steps
================================================================== */
export function TransferWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { entities, createTransfer, openModal, toast } = useStore();
  const [step, setStep] = useState(0);
  const [from, setFrom] = useState(entities[0].id);
  const [to, setTo] = useState(entities[2].id);
  const [amount, setAmount] = useState("50000");
  const [reason, setReason] = useState("");
  const [type, setType] = useState<"Capital Injection" | "Loan" | "Management Fee" | "Expense Reimbursement">("Capital Injection");
  const [scheduleAttached, setScheduleAttached] = useState(false);
  const amt = Number(amount) || 0;
  const fromE = entities.find((e) => e.id === from);
  const toE = entities.find((e) => e.id === to);
  const needsApproval = amt > 1000000;

  return (
    <Modal open onClose={onClose} title="Transfer funds between entities" subtitle="3 steps · free & instant — money never leaves PayMo's ledger" icon="bi-arrow-left-right" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={(step === 0 && (from === to || amt < 1000)) || (step === 1 && !reason.trim())} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className={needsApproval ? "btn btn-warning" : "btn btn-success"} onClick={() => {
              const id = createTransfer(fromE?.name ?? "", toE?.name ?? "", amt, reason.trim(), type);
              toast(needsApproval ? `${id} submitted — Portfolio Owner approval required (KES 1M+ rule).` : `${id} executed instantly — KES ${amt.toLocaleString()} moved.`, needsApproval ? "warning" : "success", needsApproval ? "Approval required" : "Transfer done");
              onClose();
              if (needsApproval) openModal("transferDetail", { id });
            }}>
              <i className={`bi ${needsApproval ? "bi-send-check" : "bi-lightning-charge"} me-1`} /> {needsApproval ? "Submit for approval" : "Execute transfer"}
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Entities & amount", icon: "bi-building" }, { label: "Type & reason", icon: "bi-sliders" }, { label: "Review", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">From</label>
              <div className="d-flex flex-column gap-1">
                {entities.map((e) => (
                  <button key={e.id} type="button" className={`pm-theme-card text-start p-2 ${from === e.id ? "sel" : ""}`} onClick={() => setFrom(e.id)}>
                    <span className="me-1">{e.emoji}</span><b style={{ fontSize: "0.82rem" }}>{e.name}</b>
                    <span className="pm-prod-meta ms-2">cash {fmtKES(e.cash)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label">To</label>
              <div className="d-flex flex-column gap-1">
                {entities.map((e) => (
                  <button key={e.id} type="button" className={`pm-theme-card text-start p-2 ${to === e.id ? "sel" : ""}`} onClick={() => setTo(e.id)}>
                    <span className="me-1">{e.emoji}</span><b style={{ fontSize: "0.82rem" }}>{e.name}</b>
                    <span className="pm-prod-meta ms-2">cash {fmtKES(e.cash)}</span>
                  </button>
                ))}
              </div>
            </div>
            <Field label="Amount (KES)" className="col-md-6">
              <div className="input-group"><span className="input-group-text">KES</span>
                <input type="number" min={1000} className="form-control" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="d-flex gap-2 mt-2">
                {[50000, 100000, 500000].map((v) => <Chip key={v} on={amt === v} onClick={() => setAmount(String(v))}>{fmtKES(v)}</Chip>)}
              </div>
            </Field>
            <div className="col-md-6">
              <div className={`pm-note ${needsApproval ? "" : "soft"}`}>
                <i className={`bi ${needsApproval ? "bi-exclamation-triangle" : "bi-check2-circle me-1 text-primary"}`} />
                {needsApproval
                  ? <>Amount above <b>KES 1,000,000</b> — requires <b>Portfolio Owner approval</b> (rule R-01).</>
                  : <>Under KES 1,000,000 — executes <b>instantly</b>. No bank fees, no waiting.</>}
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Transfer type</label>
              <div className="d-flex gap-2 flex-wrap">
                {(["Capital Injection", "Loan", "Management Fee", "Expense Reimbursement"] as const).map((t) => (
                  <Chip key={t} on={type === t} onClick={() => setType(t)}>{t}</Chip>
                ))}
              </div>
              <div className="pm-prod-meta mt-1">The type tells the consolidation engine how to eliminate this in group reports.</div>
            </div>
            <Field label="Reason / reference *" className="col-12">
              <input className="form-control" placeholder="e.g. Monthly maintenance fund for Kilimani House 1" value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
            {type === "Loan" && (
              <div className="col-12">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="sched" checked={scheduleAttached} onChange={(e) => setScheduleAttached(e.target.checked)} />
                  <label className="form-check-label" htmlFor="sched"><b style={{ fontSize: "0.84rem" }}>Attach repayment schedule</b><div className="pm-prod-meta">Creates an inter-company loan record with instalments — tracked until fully repaid.</div></label>
                </div>
              </div>
            )}
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-card mb-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
              <div className="d-flex align-items-center justify-content-center gap-3 flex-wrap py-2">
                <span className="fw-bold">{fromE?.emoji} {fromE?.name}</span>
                <span className="badge-soft ink pm-mono" style={{ fontSize: "0.9rem" }}>{fmtKES(amt)}</span>
                <i className="bi bi-arrow-right text-primary" />
                <span className="fw-bold">{toE?.emoji} {toE?.name}</span>
              </div>
            </div>
            <div className="pm-kpi-label mb-2">Double-entry impact (separate ledgers)</div>
            <div className="pm-card mb-2" style={{ boxShadow: "none", background: "#fafbfd" }}>
              <div className="fw-semibold mb-1" style={{ fontSize: "0.8rem" }}>{fromE?.name}</div>
              <div className="d-flex justify-content-between pm-prod-meta"><span>Dr Inter-Company Transfer Out</span><span>{fmtKES(amt)}</span></div>
              <div className="d-flex justify-content-between pm-prod-meta"><span>Cr Cash</span><span>{fmtKES(amt)}</span></div>
            </div>
            <div className="pm-card mb-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
              <div className="fw-semibold mb-1" style={{ fontSize: "0.8rem" }}>{toE?.name}</div>
              <div className="d-flex justify-content-between pm-prod-meta"><span>Dr Cash</span><span>{fmtKES(amt)}</span></div>
              <div className="d-flex justify-content-between pm-prod-meta"><span>Cr Inter-Company Transfer In</span><span>{fmtKES(amt)}</span></div>
            </div>
            <div className="pm-note soft"><i className="bi bi-shield-check me-1" />Type "{type}" ensures this cancels out in the consolidated P&amp;L — no double-counting.</div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   INTER-COMPANY LOAN WIZARD — 3 steps
================================================================== */
export function LoanWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { entities, createLoan, openModal, toast } = useStore();
  const [step, setStep] = useState(0);
  const [from, setFrom] = useState(entities[0].id);
  const [to, setTo] = useState(entities[4].id);
  const [principal, setPrincipal] = useState("200000");
  const [rate, setRate] = useState("0");
  const [term, setTerm] = useState("6");
  const [note, setNote] = useState("");
  const p = Number(principal) || 0;
  const r = Number(rate) || 0;
  const t = Number(term) || 1;
  const monthly = r > 0 ? Math.round((p * (r / 100 / 12)) / (1 - Math.pow(1 + r / 100 / 12, -t))) : Math.round(p / t);

  return (
    <Modal open onClose={onClose} title="Set up inter-company loan" subtitle="3 steps · formalise lending between your own entities" icon="bi-bank" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={p < 10000} onClick={() => setStep((s) => s + 1)}>Next <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              const id = createLoan(entities.find((e) => e.id === from)?.name ?? "", entities.find((e) => e.id === to)?.name ?? "", p, r > 0 ? r : null, t, note);
              toast(`${id} created — ${fmtKES(p)} at ${r}% p.a. over ${t} months. Schedule generated.`, "success", "Loan set up");
              onClose();
              openModal("loanDrawer", { id });
            }}>
              <i className="bi bi-check2-circle me-1" /> Create loan & schedule
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Parties & principal", icon: "bi-building" }, { label: "Terms", icon: "bi-percent" }, { label: "Review", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <Field label="Lender (from)" className="col-md-6">
              <select className="form-select" value={from} onChange={(e) => setFrom(e.target.value)}>
                {entities.map((e) => <option key={e.id} value={e.id}>{e.emoji} {e.name}</option>)}
              </select>
            </Field>
            <Field label="Borrower (to)" className="col-md-6">
              <select className="form-select" value={to} onChange={(e) => setTo(e.target.value)}>
                {entities.map((e) => <option key={e.id} value={e.id}>{e.emoji} {e.name}</option>)}
              </select>
            </Field>
            <Field label="Principal (KES)" className="col-md-6">
              <div className="input-group"><span className="input-group-text">KES</span>
                <input type="number" min={10000} className="form-control" value={principal} onChange={(e) => setPrincipal(e.target.value)} />
              </div>
            </Field>
            <Field label="Term (months)" className="col-md-6">
              <select className="form-select" value={term} onChange={(e) => setTerm(e.target.value)}>
                {[3, 6, 12, 24].map((m) => <option key={m} value={m}>{m} months</option>)}
              </select>
            </Field>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Annual interest rate (%)" className="col-md-6" hint="0% for interest-free family-of-entities loans.">
              <div className="input-group"><input type="number" min={0} max={30} className="form-control" value={rate} onChange={(e) => setRate(e.target.value)} /><span className="input-group-text">% p.a.</span></div>
            </Field>
            <Field label="Note" className="col-md-6">
              <input className="form-control" placeholder="e.g. Workshop expansion seed" value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <div className="col-12">
              <div className="pm-note"><i className="bi bi-calculator me-1" />Est. instalment: <b>{fmtKES(monthly)}/month</b> for {t} months ({fmtKES(monthly * t)} total repayable).</div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="row g-2 mb-3">
              {[
                { l: "Lender", v: entities.find((e) => e.id === from)?.name },
                { l: "Borrower", v: entities.find((e) => e.id === to)?.name },
                { l: "Principal", v: fmtKES(p) },
                { l: "Rate", v: r + "% p.a." },
                { l: "Term", v: t + " months" },
                { l: "Instalment", v: fmtKES(monthly) },
              ].map((x) => (
                <div className="col-md-4 col-6" key={x.l}>
                  <div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                    <div className="pm-kpi-label">{x.l}</div>
                    <b style={{ fontSize: "0.82rem" }}>{x.v}</b>
                  </div>
                </div>
              ))}
            </div>
            <div className="pm-note soft"><i className="bi bi-shield-check me-1" />The borrower records a liability; the lender records an asset. Both eliminate in consolidated reports.</div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   TENANT WIZARD — 4 steps
================================================================== */
export function TenantWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { entities, addTenant, toast } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [entityId, setEntityId] = useState("e3");
  const [unit, setUnit] = useState("");
  const [rent, setRent] = useState(String(MONTHLY_RENT));
  const [deposit, setDeposit] = useState(String(MONTHLY_RENT));
  const [leaseStart, setLeaseStart] = useState("2026-02-01");
  const [leaseEnd, setLeaseEnd] = useState("2027-01-31");
  const [depositPaid, setDepositPaid] = useState(true);

  return (
    <Modal open onClose={onClose} title="Add tenant" subtitle="4 steps · creates lease record, deposit entry & rent invoices" icon="bi-person-plus" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={(step === 0 && !name.trim()) || (step === 1 && (!unit.trim() || !rent))} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              addTenant({ name: name.trim(), phone, email, unit: unit.trim(), entityId, rent: Number(rent) || 30000, deposit: Number(deposit) || 30000, leaseStart, leaseEnd, status: "Active", since: "Just now" });
              toast(`${name} added to Unit ${unit} — deposit recorded as liability, invoices scheduled from 1st.`, "success", "Tenant onboarded");
              onClose();
            }}>
              <i className="bi bi-check2-circle me-1" /> Complete onboarding
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Tenant details", icon: "bi-person" }, { label: "Unit & lease", icon: "bi-house" }, { label: "Deposit", icon: "bi-cash-stack" }, { label: "Review", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <Field label="Full name *" className="col-md-6">
              <input className="form-control" placeholder="e.g. Jane Kamau" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <Field label="Phone (M-Pesa)" className="col-md-6">
              <input className="form-control" placeholder="07xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label="Email" className="col-md-6">
              <input className="form-control" placeholder="optional" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Property" className="col-md-6">
              <select className="form-select" value={entityId} onChange={(e) => setEntityId(e.target.value)}>
                {entities.filter((e) => e.type === "Rental").map((e) => <option key={e.id} value={e.id}>{e.emoji} {e.name}</option>)}
              </select>
            </Field>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Unit number *" className="col-md-4">
              <input className="form-control" placeholder="e.g. 3A" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </Field>
            <Field label="Monthly rent (KES)" className="col-md-4">
              <div className="input-group"><span className="input-group-text">KES</span>
                <input type="number" min={0} className="form-control" value={rent} onChange={(e) => setRent(e.target.value)} /></div>
            </Field>
            <Field label="Lease start" className="col-md-4">
              <input type="date" className="form-control" value={leaseStart} onChange={(e) => setLeaseStart(e.target.value)} />
            </Field>
            <Field label="Lease end" className="col-md-4">
              <input type="date" className="form-control" value={leaseEnd} onChange={(e) => setLeaseEnd(e.target.value)} />
            </Field>
            <div className="col-12"><div className="pm-note soft"><i className="bi bi-info-circle me-1" />Rent invoices generate on the 1st of each month and auto-send via WhatsApp + SMS.</div></div>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Security deposit (KES)" className="col-md-6">
              <div className="input-group"><span className="input-group-text">KES</span>
                <input type="number" min={0} className="form-control" value={deposit} onChange={(e) => setDeposit(e.target.value)} /></div>
            </Field>
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="depPaid" checked={depositPaid} onChange={(e) => setDepositPaid(e.target.checked)} />
                <label className="form-check-label" htmlFor="depPaid"><b style={{ fontSize: "0.84rem" }}>Deposit received</b><div className="pm-prod-meta">Credits the Security Deposits Liability account — refunded on move-out.</div></label>
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="row g-2 mb-3">
              {[
                { l: "Tenant", v: name || "—" },
                { l: "Unit", v: unit || "—" },
                { l: "Property", v: entities.find((e) => e.id === entityId)?.name },
                { l: "Rent", v: fmtKES(Number(rent)) + "/mo" },
                { l: "Deposit", v: depositPaid ? fmtKES(Number(deposit)) + " received" : "pending" },
                { l: "Lease", v: leaseStart + " → " + leaseEnd },
              ].map((x) => (
                <div className="col-md-4 col-6" key={x.l}>
                  <div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                    <div className="pm-kpi-label">{x.l}</div>
                    <b style={{ fontSize: "0.8rem" }}>{x.v}</b>
                  </div>
                </div>
              ))}
            </div>
            <div className="pm-note"><i className="bi bi-journal-check me-1 text-primary" />Ledger entries on completion: Dr Cash (deposit) · Cr Security Deposits Liability — and the rent schedule begins next month.</div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   MOVE-OUT WIZARD — 3 steps (deposit deduction workflow)
================================================================== */
export function MoveOutWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { tenants, moveOutTenant, toast } = useStore();
  const tenant = tenants.find((x) => x.id === String(payload.tenantId));
  const [step, setStep] = useState(0);
  const [deductions, setDeductions] = useState([
    { id: 1, item: "Repainting bedroom", amount: "4500" },
  ]);
  const [photos, setPhotos] = useState<Set<number>>(new Set([0, 1]));
  const [method, setMethod] = useState("M-Pesa");
  if (!tenant) return null;
  const deductionTotal = deductions.reduce((a, d) => a + (Number(d.amount) || 0), 0);
  const refund = tenant.deposit - deductionTotal;

  return (
    <Modal open onClose={onClose} title={`Move-out — ${tenant.name}`} subtitle={`Unit ${tenant.unit} · deposit held ${fmtKES(tenant.deposit)}`} icon="bi-person-x" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={step === 0 && photos.size === 0} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" disabled={refund < 0} onClick={() => {
              moveOutTenant(tenant.id, deductionTotal, Math.max(0, refund), deductions.map((d) => d.item).join(", "));
              toast(`Move-out complete — refund ${fmtKES(refund)} via ${method}. Deposit statement sent to ${tenant.name}.`, "success", "Move-out processed");
              onClose();
            }}>
              <i className="bi bi-check2-circle me-1" /> Complete move-out
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Inspection photos", icon: "bi-camera" }, { label: "Deductions", icon: "bi-sliders" }, { label: "Refund", icon: "bi-cash-stack" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            <div className="pm-note mb-3"><i className="bi bi-shield-check me-1 text-primary" />Deductions need photo evidence — this protects both sides if the tenant disputes.</div>
            <div className="row g-2">
              {[0, 1, 2, 3].map((i) => (
                <div className="col-3" key={i}>
                  <button type="button" className={`w-100 pm-theme-card ${photos.has(i) ? "sel" : ""}`} style={{ padding: 0 }}
                    onClick={() => setPhotos((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}>
                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: 90, gap: 4 }}>
                      {photos.has(i) ? (
                        <><span style={{ fontSize: "1.4rem" }}>{["🖼️", "🚪", "🛁", "🔌"][i]}</span>
                          <span className="pm-prod-meta" style={{ fontSize: "0.6rem" }}>photo_{i + 1}.jpg ✓</span></>
                      ) : (
                        <><i className="bi bi-camera" style={{ fontSize: "1.2rem", color: "#98a2b3" }} /><span className="pm-prod-meta" style={{ fontSize: "0.6rem" }}>Add photo</span></>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            {deductions.map((d) => (
              <div key={d.id} className="d-flex align-items-center gap-2 mb-2">
                <input className="form-control flex-grow-1" value={d.item} onChange={(e) => setDeductions((ds) => ds.map((x) => (x.id === d.id ? { ...x, item: e.target.value } : x)))} />
                <div className="input-group" style={{ width: 150 }}><span className="input-group-text">KES</span>
                  <input type="number" min={0} className="form-control" value={d.amount} onChange={(e) => setDeductions((ds) => ds.map((x) => (x.id === d.id ? { ...x, amount: e.target.value } : x)))} />
                </div>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setDeductions((ds) => ds.filter((x) => x.id !== d.id))}><i className="bi bi-trash" /></button>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setDeductions((ds) => [...ds, { id: Date.now(), item: "", amount: "0" }])}>
              <i className="bi bi-plus-lg me-1" /> Add deduction
            </button>
            <div className="pm-note mt-3"><i className="bi bi-calculator me-1" />Deposit {fmtKES(tenant.deposit)} − deductions {fmtKES(deductionTotal)} = refund <b className="text-primary">{fmtKES(refund)}</b></div>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Refund method" className="col-md-6">
              <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option>M-Pesa</option><option>Bank transfer</option><option>Cash (receipt required)</option>
              </select>
            </Field>
            <div className="col-md-6">
              <div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: refund >= 0 ? "var(--pm-green-soft)" : "#fee4e2" }}>
                <div className="pm-kpi-label">Refund amount</div>
                <b style={{ color: refund >= 0 ? "var(--pm-green-dark)" : "var(--pm-danger)" }}>{fmtKES(Math.max(0, refund))}</b>
                {refund < 0 && <div className="pm-prod-meta">Deductions exceed deposit — invoice the difference.</div>}
              </div>
            </div>
            <div className="col-12">
              <div className="pm-note soft"><i className="bi bi-journal-check me-1" />Ledger: Dr Security Deposits Liability · Cr Cash. The unit flips to <b>Vacant</b> and vacancy loss tracking begins.</div>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   MAINTENANCE WIZARD — 3 steps
================================================================== */
export function MaintenanceWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { addMaintenance, openModal, toast } = useStore();
  const [step, setStep] = useState(0);
  const [entityId, setEntityId] = useState("e3");
  const [unit, setUnit] = useState("2B");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState<"Low" | "High" | "Emergency">("High");
  const [reporter, setReporter] = useState("Tenant (portal)");
  return (
    <Modal open onClose={onClose} title="Log maintenance request" subtitle="3 steps · assign vendors, track costs against the property P&L" icon="bi-droplet" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={step === 1 && issue.trim().length < 5} onClick={() => setStep((s) => s + 1)}>
              Next <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              const id = addMaintenance({ unit, entityId, issue: issue.trim(), priority, status: "Open", vendor: "", cost: 0, date: "Just now", photos: 1 });
              toast(`${id} logged (${priority}). Assign a vendor to start work.`, "success", "Request logged");
              onClose();
              openModal("maintenanceDetail", { id });
            }}>
              <i className="bi bi-check2-circle me-1" /> Log request
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Where & how urgent", icon: "bi-crosshair" }, { label: "Describe the issue", icon: "bi-chat-square-text" }, { label: "Review", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <Field label="Property" className="col-md-6">
              <select className="form-select" value={entityId} onChange={(e) => setEntityId(e.target.value)}>
                <option value="e3">🏠 Kilimani House 1</option><option value="e4">🏡 Kilimani House 2</option>
              </select>
            </Field>
            <Field label="Unit" className="col-md-6">
              <input className="form-control" placeholder="e.g. 2B or Common" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </Field>
            <div className="col-12">
              <label className="form-label">Priority</label>
              <div className="d-flex gap-2">
                <Chip on={priority === "Low"} onClick={() => setPriority("Low")}>Low</Chip>
                <Chip on={priority === "High"} onClick={() => setPriority("High")}>High</Chip>
                <Chip on={priority === "Emergency"} onClick={() => setPriority("Emergency")}><i className="bi bi-fire me-1" />Emergency</Chip>
              </div>
            </div>
            <Field label="Reported by" className="col-md-6">
              <select className="form-select" value={reporter} onChange={(e) => setReporter(e.target.value)}>
                <option>Tenant (portal)</option><option>Owner / you</option><option>Caretaker</option>
              </select>
            </Field>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Describe the issue *" className="col-12">
              <textarea className="form-control" rows={3} placeholder="e.g. Kitchen tap leaking — water pooling under the sink" value={issue} onChange={(e) => setIssue(e.target.value)} />
            </Field>
            <div className="col-12">
              <div className="pm-note soft"><i className="bi bi-info-circle me-1" />Emergencies (water, electricity, security) trigger a 1-hour response SLA with your assigned vendors.</div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="pm-note">
            <i className="bi bi-check2-circle me-1 text-primary" />
            <b>{priority}</b> — Unit {unit} · "{issue || "—"}" · reported by {reporter}. Costs post against the property's P&amp;L when resolved.
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}
