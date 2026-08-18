import { useState } from "react";
import { TEAM, coverOf, fmtKES, stockOf } from "./data";
import { useStore } from "./store";
import { Badge, Chip, EmptyState, Field, Modal, StatusBadge, Thumb, WizardShell } from "./ui";

const byId = (products: ReturnType<typeof useStore>["products"], id: string) => products.find((p) => p.id === id);
const LOC_ICON: Record<string, string> = { Warehouse: "bi-buildings", "Shop floor": "bi-shop", Quarantine: "bi-shield-exclamation", "In transit": "bi-truck" };

/* ==================================================================
   STOCK COUNT WIZARD — 4 steps: Scope → Count sheet → Variances → Post
================================================================== */
export function StockCountWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { counts, products, locations, startCount, updateCount, postCount, recordActivity, toast } = useStore();
  const existing = counts.find((c) => c.id === String(payload.id ?? ""));
  const [step, setStep] = useState(existing ? 1 : 0);
  const [name, setName] = useState(existing?.name ?? "");
  const [scopeType, setScopeType] = useState<"location" | "category">("location");
  const [locId, setLocId] = useState(existing?.locId ?? "l1");
  const [category, setCategory] = useState("");
  const [assignee, setAssignee] = useState(existing?.assignedTo ?? TEAM[2]);
  const [sheet, setSheet] = useState<{ productId: string; expected: number; counted: number | null }[]>(
    existing ? existing.items.map((i) => ({ productId: i.productId, expected: i.expected, counted: i.counted })) : [],
  );
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const locName = locations.find((l) => l.id === locId)?.name ?? "";
  const scopeLabel = scopeType === "location" ? locName : category;

  const buildScope = () => {
    const list = products.filter((p) => p.status === "Active" && (scopeType === "location" ? (p.stockByLoc[locId] ?? 0) > 0 : p.category === category && stockOf(p) > 0));
    return list.map((p) => ({ productId: p.id, expected: scopeType === "location" ? p.stockByLoc[locId] ?? 0 : stockOf(p), counted: null as number | null }));
  };

  const countedDone = sheet.filter((s) => s.counted !== null).length;
  const variances = sheet.filter((s) => s.counted !== null && s.counted !== s.expected);
  const valueImpact = variances.reduce((a, v) => a + ((v.counted ?? 0) - v.expected) * (byId(products, v.productId)?.cost ?? 0), 0);
  const exact = sheet.length - variances.length;
  const countId = existing?.id ?? "CNT-NEW";
  const saveProgress = () => {
    if (existing) {
      updateCount(existing.id, sheet.filter((s) => s.counted !== null).map((s) => ({ productId: s.productId, counted: s.counted })));
      toast(`${existing.id} saved — resume any time from the Stock Counts tab.`, "info", "Progress saved");
    } else {
      const id = startCount(name || "Untitled count", scopeLabel, locId, assignee, sheet.map((s) => ({ productId: s.productId, expected: s.expected })));
      updateCount(id, sheet.filter((s) => s.counted !== null).map((s) => ({ productId: s.productId, counted: s.counted })));
      toast(`${id} created & saved — resume any time from the Stock Counts tab.`, "info", "Progress saved");
    }
    onClose();
  };
  const finishCount = () => {
    const id = existing?.id ?? startCount(name || "Untitled count", scopeLabel, locId, assignee, sheet.map((s) => ({ productId: s.productId, expected: s.expected })));
    updateCount(id, sheet.filter((s) => s.counted !== null).map((s) => ({ productId: s.productId, counted: s.counted })));
    postCount(id, sheet);
    recordActivity(`Stock count ${id} posted — ${variances.length} variance(s)`, "bi-clipboard-check");
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={existing ? `Resume — ${existing.name}` : "Start stock count"}
      subtitle="4-step count wizard · variances post as ledger adjustments" icon="bi-clipboard-check" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary me-auto" disabled={step < 1 || sheet.length === 0} onClick={saveProgress}>
            <i className="bi bi-save me-1" /> Save progress
          </button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary"
              disabled={(step === 0 && !name.trim()) || (step === 1 && (sheet.length === 0 || countedDone < sheet.length)) || (step === 2 && false)}
              onClick={() => {
                if (step === 0) { setSheet(buildScope()); setStep(1); }
                else setStep((s) => s + 1);
              }}>
              {step === 1 && countedDone < sheet.length ? `Counting ${countedDone}/${sheet.length}…` : "Next step"} <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={finishCount}>
              <i className="bi bi-check2-circle me-1" /> Post count &amp; close
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Scope", icon: "bi-crosshair" }, { label: "Count sheet", icon: "bi-list-ol" }, { label: "Variance review", icon: "bi-exclamation-triangle" }, { label: "Post", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {/* STEP 1 — SCOPE */}
        {step === 0 && (
          <div className="row g-3">
            <Field label="Count name *" className="col-12">
              <input className="form-control" placeholder="e.g. End-of-month shop floor count" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <div className="col-12">
              <label className="form-label">What are you counting?</label>
              <div className="d-flex gap-2 flex-wrap">
                <Chip on={scopeType === "location"} onClick={() => setScopeType("location")}><i className="bi bi-geo-alt me-1" /> A location</Chip>
                <Chip on={scopeType === "category"} onClick={() => setScopeType("category")}><i className="bi bi-tags me-1" /> A category</Chip>
              </div>
            </div>
            {scopeType === "location" ? (
              <Field label="Location" className="col-md-6">
                <select className="form-select" value={locId} onChange={(e) => setLocId(e.target.value)}>
                  {locations.filter((l) => l.type !== "In transit").map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </Field>
            ) : (
              <Field label="Category" className="col-md-6">
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            )}
            <Field label="Assign to" className="col-md-6">
              <select className="form-select" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                {TEAM.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <div className="col-12">
              <div className="pm-note">
                <i className="bi bi-info-circle me-1" />
                The system snapshots current stock as the <b>expected</b> value. Your counted figures create variances that post as ledger adjustments on completion.
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — COUNT SHEET */}
        {step === 1 && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="pm-prod-meta">{sheet.length} SKUs in scope · {countedDone}/{sheet.length} counted</div>
              <div className="progress" style={{ width: 140, height: 6 }}>
                <div className="progress-bar" style={{ width: `${sheet.length ? (countedDone / sheet.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="table-responsive" style={{ maxHeight: 320, overflowY: "auto" }}>
              <table className="table pm-table align-middle">
                <thead><tr><th>Product</th><th className="text-end">System says</th><th className="text-end" style={{ width: 130 }}>You counted</th><th className="text-end">Δ</th></tr></thead>
                <tbody>
                  {sheet.map((s) => {
                    const p = byId(products, s.productId);
                    const var_ = s.counted !== null ? s.counted - s.expected : null;
                    return (
                      <tr key={s.productId}>
                        <td><div className="d-flex align-items-center gap-2"><Thumb img={p?.img ?? ""} emoji={p?.emoji ?? "📦"} size={32} /><div><div className="pm-prod-name">{p?.name}</div><div className="pm-prod-meta">{p?.sku}</div></div></div></td>
                        <td className="text-end pm-prod-meta">{s.expected}</td>
                        <td>
                          <input type="number" min={0} className="form-control form-control-sm text-end" placeholder="—" value={s.counted ?? ""}
                            onChange={(e) => setSheet((sh) => sh.map((x) => x.productId === s.productId ? { ...x, counted: e.target.value === "" ? null : Number(e.target.value) } : x))} />
                        </td>
                        <td className="text-end">
                          {var_ === null ? <span className="pm-prod-meta">—</span> : var_ === 0 ? <Badge tone="green">Match</Badge> :
                            <Badge tone={var_ > 0 ? "blue" : "red"}>{var_ > 0 ? "+" : ""}{var_}</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {sheet.length === 0 && <EmptyState icon="bi-box" title="Nothing to count" text="This scope has no stock — choose another location or category." />}
          </div>
        )}

        {/* STEP 3 — VARIANCE REVIEW */}
        {step === 2 && (
          <div>
            {variances.length === 0 ? (
              <EmptyState icon="bi-check2-circle" title="Perfect count!" text="Every SKU matches the system. No adjustments will be posted." />
            ) : (
              <div className="table-responsive">
                <table className="table pm-table align-middle">
                  <thead><tr><th>Product</th><th className="text-end">System</th><th className="text-end">Counted</th><th className="text-end">Δ</th><th>Reason</th></tr></thead>
                  <tbody>
                    {variances.map((s) => {
                      const p = byId(products, s.productId);
                      const var_ = (s.counted ?? 0) - s.expected;
                      return (
                        <tr key={s.productId}>
                          <td><div className="pm-prod-name">{p?.name}</div><div className="pm-prod-meta">{p?.sku}</div></td>
                          <td className="text-end pm-prod-meta">{s.expected}</td>
                          <td className="text-end fw-bold">{s.counted}</td>
                          <td className="text-end"><Badge tone={var_ > 0 ? "blue" : "red"}>{var_ > 0 ? "+" : ""}{var_}</Badge></td>
                          <td>
                            <select className="form-select form-select-sm" value={reasons[s.productId] ?? "Missing"} onChange={(e) => setReasons((r) => ({ ...r, [s.productId]: e.target.value }))}>
                              <option>Missing</option><option>Damaged</option><option>Not found on shelf</option><option>Wrong SKU</option><option>Duplicate entry</option><option>Other</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pm-note mt-2">
              {variances.length} variance(s) · value impact <b>{valueImpact >= 0 ? "+" : "−"}KES {Math.abs(valueImpact).toLocaleString()}</b> — will post as a Cycle count adjustment to the ledger.
            </div>
          </div>
        )}

        {/* STEP 4 — POST */}
        {step === 3 && (
          <div>
            <div className="pm-stat-grid mb-3">
              <div className="pm-card" style={{ boxShadow: "none" }}>
                <div className="pm-kpi-label">SKUs counted</div>
                <div className="pm-kpi-value">{sheet.length}</div>
              </div>
              <div className="pm-card" style={{ boxShadow: "none" }}>
                <div className="pm-kpi-label">Exact matches</div>
                <div className="pm-kpi-value" style={{ color: "var(--pm-green-dark)" }}>{exact}</div>
              </div>
              <div className="pm-card" style={{ boxShadow: "none" }}>
                <div className="pm-kpi-label">Variances</div>
                <div className="pm-kpi-value" style={{ color: variances.length ? "var(--pm-warn)" : "var(--pm-green-dark)" }}>{variances.length}</div>
              </div>
            </div>
            <div className="pm-note">
              <i className="bi bi-journal-check me-1 text-primary" />
              Posting {countId} writes variances to the <b>General Ledger</b> (Dr/ Cr Stock Variance) and updates on-hand balances. Accuracy target: 98.5%+.
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   TRANSFER WIZARD — 3 steps: Locations → Items → Review
================================================================== */
export function TransferWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, locations, transferStock } = useStore();
  const pre = String(payload.productId ?? "");
  const [step, setStep] = useState(0);
  const [from, setFrom] = useState("l1");
  const [to, setTo] = useState(pre ? "l2" : "l2");
  const [rows, setRows] = useState<{ productId: string; qty: string }[]>([{ productId: pre, qty: "5" }]);
  const fromName = locations.find((l) => l.id === from)?.name ?? "";
  const toName = locations.find((l) => l.id === to)?.name ?? "";
  const valid = rows.filter((r) => r.productId && Number(r.qty) > 0 && Number(r.qty) <= (byId(products, r.productId)?.stockByLoc[from] ?? 0));
  const totalUnits = valid.reduce((a, r) => a + Number(r.qty), 0);

  return (
    <Modal open onClose={onClose} title="Transfer stock between locations" subtitle="3-step transfer · two ledger entries (out + in) per line" icon="bi-arrow-left-right" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={(step === 0 && (from === to)) || (step === 1 && valid.length === 0)} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => { transferStock(from, to, valid.map((r) => ({ productId: r.productId, qty: Number(r.qty) }))); onClose(); }}>
              <i className="bi bi-check2-circle me-1" /> Post transfer
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Locations", icon: "bi-geo-alt" }, { label: "Items", icon: "bi-box-seam" }, { label: "Review", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">From</label>
              <div className="d-flex flex-column gap-2">
                {locations.filter((l) => l.type !== "In transit").map((l) => (
                  <button key={l.id} type="button" className={`pm-theme-card text-start p-2 ${from === l.id ? "sel" : ""}`} onClick={() => setFrom(l.id)}>
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${LOC_ICON[l.type]}`} style={{ color: "var(--pm-green-dark)" }} />
                      <b style={{ fontSize: "0.84rem" }}>{l.name}</b>
                      <span className="badge-soft slate ms-auto">{l.type}</span>
                    </div>
                    <div className="pm-prod-meta">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label">To</label>
              <div className="d-flex flex-column gap-2">
                {locations.filter((l) => l.type !== "In transit").map((l) => (
                  <button key={l.id} type="button" className={`pm-theme-card text-start p-2 ${to === l.id ? "sel" : ""}`} onClick={() => setTo(l.id)}>
                    <div className="d-flex align-items-center gap-2">
                      <i className={`bi ${LOC_ICON[l.type]}`} style={{ color: "var(--pm-green-dark)" }} />
                      <b style={{ fontSize: "0.84rem" }}>{l.name}</b>
                      <span className="badge-soft slate ms-auto">{l.type}</span>
                    </div>
                    <div className="pm-prod-meta">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            {from === to && <div className="col-12"><div className="pm-note"><i className="bi bi-exclamation-triangle me-1" />From and To are the same — pick two different locations.</div></div>}
          </div>
        )}
        {step === 1 && (
          <div>
            {rows.map((r, i) => {
              const p = byId(products, r.productId);
              const avail = p ? p.stockByLoc[from] ?? 0 : 0;
              const q = Number(r.qty) || 0;
              return (
                <div key={i} className="d-flex align-items-center gap-2 mb-2">
                  <select className="form-select flex-grow-1" style={{ maxWidth: 340 }} value={r.productId}
                    onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, productId: e.target.value } : x)))}>
                    <option value="">— Select SKU —</option>
                    {products.filter((p) => p.status === "Active" && (p.stockByLoc[from] ?? 0) > 0).map((p) => (
                      <option key={p.id} value={p.id}>{p.sku} · {p.name} ({p.stockByLoc[from]} avail)</option>
                    ))}
                  </select>
                  <input type="number" min={1} className="form-control" style={{ width: 90 }} placeholder="Qty" value={r.qty}
                    onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))} />
                  <span className="pm-prod-meta" style={{ width: 110 }}>{avail} in {fromName}</span>
                  {q > avail && <Badge tone="red">exceeds</Badge>}
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}><i className="bi bi-trash" /></button>
                </div>
              );
            })}
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setRows((rs) => [...rs, { productId: "", qty: "1" }])}>
              <i className="bi bi-plus-lg me-1" /> Add line
            </button>
            <div className="pm-note mt-3"><i className="bi bi-info-circle me-1" />Available stock updates live as you type — you can't transfer more than is on hand at {fromName}.</div>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3">
              Moving <b>{totalUnits} units</b> ({valid.length} SKU{valid.length === 1 ? "" : "s"}) from <b>{fromName}</b> → <b>{toName}</b>.
            </div>
            <div className="table-responsive">
              <table className="table pm-table align-middle">
                <thead><tr><th>SKU</th><th className="text-end">Qty</th><th className="text-end">Unit cost</th><th className="text-end">Value</th></tr></thead>
                <tbody>
                  {valid.map((r) => {
                    const p = byId(products, r.productId);
                    return (
                      <tr key={r.productId}>
                        <td><div className="d-flex align-items-center gap-2"><Thumb img={p?.img ?? ""} emoji={p?.emoji ?? "📦"} size={30} /><b style={{ fontSize: "0.8rem" }}>{p?.name}</b></div></td>
                        <td className="text-end">{r.qty}</td>
                        <td className="text-end pm-prod-meta">{fmtKES(p?.cost ?? 0)}</td>
                        <td className="text-end fw-bold">{fmtKES((p?.cost ?? 0) * Number(r.qty))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pm-prod-meta"><i className="bi bi-journal-check me-1 text-primary" />Two ledger entries per line: Transfer Out (−{fromName}) and Transfer In (+{toName}).</div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   ADJUSTMENT WIZARD — 3 steps: Type & reason → Items → Review
================================================================== */
const ADJ_TYPES: { id: string; label: string; dir: 1 | -1; icon: string; d: string }[] = [
  { id: "Damage", label: "Damage", dir: -1, icon: "bi-tornado", d: "Broken in handling or transit" },
  { id: "Theft", label: "Theft / shrinkage", dir: -1, icon: "bi-shield-exclamation", d: "Missing stock — needs police OB where applicable" },
  { id: "Expired", label: "Expired / spoiled", dir: -1, icon: "bi-hourglass-bottom", d: "Past best-before or spoiled" },
  { id: "Return to supplier", label: "Return to supplier", dir: -1, icon: "bi-box-arrow-left", d: "Sent back for credit or replacement" },
  { id: "Found", label: "Found stock", dir: 1, icon: "bi-search", d: "Extra units discovered" },
  { id: "Other", label: "Other", dir: -1, icon: "bi-circle", d: "Anything else — add a reason" },
];

export function AdjustmentWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, locations, postAdjustment } = useStore();
  const pre = String(payload.productId ?? "");
  const [step, setStep] = useState(0);
  const [type, setType] = useState(ADJ_TYPES[0].id);
  const [locId, setLocId] = useState("l1");
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<{ productId: string; qty: string; reason: string }[]>([{ productId: pre, qty: "1", reason: "" }]);
  const dir = ADJ_TYPES.find((t) => t.id === type)?.dir ?? -1;
  const valid = rows.filter((r) => r.productId && Number(r.qty) > 0);
  const valueImpact = valid.reduce((a, r) => a + (byId(products, r.productId)?.cost ?? 0) * Number(r.qty) * dir, 0);

  return (
    <Modal open onClose={onClose} title="Post a stock adjustment" subtitle="3-step adjustment · posts straight to the movement ledger" icon="bi-sliders" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={step === 1 && valid.length === 0} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className={valueImpact < 0 ? "btn btn-danger" : "btn btn-primary"}
              onClick={() => { postAdjustment(type, valid.map((r) => ({ productId: r.productId, qty: Number(r.qty) * dir, reason: r.reason || type })), locId, note); onClose(); }}>
              <i className="bi bi-check2-circle me-1" /> Post adjustment
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Type & reason", icon: "bi-sliders" }, { label: "Items", icon: "bi-box-seam" }, { label: "Review", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <div className="col-12">
              <div className="row g-2">
                {ADJ_TYPES.map((t) => (
                  <div className="col-md-6" key={t.id}>
                    <button type="button" className={`pm-theme-card text-start p-2 w-100 ${type === t.id ? "sel" : ""}`} onClick={() => setType(t.id)}>
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${t.icon}`} style={{ color: t.dir < 0 ? "var(--pm-danger)" : "var(--pm-green-dark)" }} />
                        <b style={{ fontSize: "0.84rem" }}>{t.label}</b>
                        <Badge tone={t.dir < 0 ? "red" : "green"} className="ms-auto">{t.dir < 0 ? "− stock" : "+ stock"}</Badge>
                      </div>
                      <div className="pm-prod-meta mt-1">{t.d}</div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <Field label="Location" className="col-md-6">
              <select className="form-select" value={locId} onChange={(e) => setLocId(e.target.value)}>
                {locations.filter((l) => l.type !== "In transit").map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
            <Field label="Internal note" className="col-md-6">
              <input className="form-control" placeholder="e.g. Found during pack-out" value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </div>
        )}
        {step === 1 && (
          <div>
            {rows.map((r, i) => {
              const p = byId(products, r.productId);
              return (
                <div key={i} className="d-flex align-items-center gap-2 mb-2">
                  <select className="form-select flex-grow-1" style={{ maxWidth: 300 }} value={r.productId}
                    onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, productId: e.target.value } : x)))}>
                    <option value="">— Select SKU —</option>
                    {products.filter((p) => p.status !== "Archived").map((p) => (
                      <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>
                    ))}
                  </select>
                  <input type="number" min={1} className="form-control" style={{ width: 90 }} placeholder="Qty" value={r.qty}
                    onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))} />
                  <span className="pm-prod-meta" style={{ width: 90 }}>{p ? fmtKES(p.cost) + " cost" : ""}</span>
                  <input className="form-control" style={{ width: 170 }} placeholder="Reason" value={r.reason}
                    onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, reason: e.target.value } : x)))} />
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}><i className="bi bi-trash" /></button>
                </div>
              );
            })}
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setRows((rs) => [...rs, { productId: "", qty: "1", reason: "" }])}>
              <i className="bi bi-plus-lg me-1" /> Add line
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3">
              <b>{type}</b> — {valid.length} line(s), live value impact <b style={{ color: valueImpact < 0 ? "var(--pm-danger)" : "var(--pm-green-dark)" }}>{valueImpact >= 0 ? "+" : "−"}KES {Math.abs(valueImpact).toLocaleString()}</b>
            </div>
            <div className="table-responsive">
              <table className="table pm-table align-middle">
                <thead><tr><th>SKU</th><th className="text-end">Δ Qty</th><th className="text-end">Unit cost</th><th className="text-end">Impact</th><th>Reason</th></tr></thead>
                <tbody>
                  {valid.map((r) => {
                    const p = byId(products, r.productId);
                    return (
                      <tr key={r.productId}>
                        <td><b style={{ fontSize: "0.8rem" }}>{p?.name}</b><div className="pm-prod-meta">{p?.sku}</div></td>
                        <td className={`text-end ${dir < 0 ? "pm-qtyneg" : "pm-qtypos"}`}>{dir < 0 ? "−" : "+"}{r.qty}</td>
                        <td className="text-end pm-prod-meta">{fmtKES(p?.cost ?? 0)}</td>
                        <td className="text-end fw-bold">{fmtKES((p?.cost ?? 0) * Number(r.qty) * dir)}</td>
                        <td className="pm-prod-meta">{r.reason || type}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   RECEIVE PO WIZARD — 3 steps: Select PO → Verify → Post
================================================================== */
export function ReceivePOWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { pos, products, locations, receivePO } = useStore();
  const open = pos.filter((po) => po.status === "Sent" || po.status === "Partial");
  const pre = String(payload.poId ?? "");
  const [step, setStep] = useState(0);
  const [poId, setPoId] = useState(pre || open[0]?.id || "");
  const [locId, setLocId] = useState("l1");
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const po = pos.find((x) => x.id === poId);
  const receiveRows = po ? po.items.map((it) => ({ productId: it.productId, qty: qtys[it.productId] ?? Math.max(0, it.qty - it.received), remaining: it.qty - it.received })).filter((r) => r.qty > 0) : [];
  const totalQty = receiveRows.reduce((a, r) => a + r.qty, 0);
  const totalValue = receiveRows.reduce((a, r) => a + (byId(products, r.productId)?.cost ?? 0) * r.qty, 0);

  return (
    <Modal open onClose={onClose} title="Receive stock from purchase order" subtitle="3-step goods receipt · posts Dr Inventory / Cr Accounts Payable" icon="bi-box-arrow-in-down" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={(step === 0 && !po) || (step === 1 && receiveRows.length === 0)} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => { receivePO(poId, receiveRows.map((r) => ({ productId: r.productId, qty: r.qty })), locId); onClose(); }}>
              <i className="bi bi-check2-circle me-1" /> Post goods receipt
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Select PO", icon: "bi-cart-check" }, { label: "Verify lines", icon: "bi-clipboard-check" }, { label: "Post", icon: "bi-journal-check" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            {open.length === 0 ? (
              <EmptyState icon="bi-check2-circle" title="No open POs" text="Nothing waiting to be received. Create a PO from the Reorder wizard." />
            ) : (
              <div className="d-flex flex-column gap-2">
                {open.map((o) => {
                  const units = o.items.reduce((a, b) => a + b.qty, 0);
                  const got = o.items.reduce((a, b) => a + b.received, 0);
                  return (
                    <button key={o.id} type="button" className={`pm-theme-card text-start p-2 ${poId === o.id ? "sel" : ""}`} onClick={() => setPoId(o.id)}>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <b className="pm-mono" style={{ fontSize: "0.84rem" }}>{o.id}</b>
                        <StatusBadge status={o.status} />
                        <span className="pm-prod-meta ms-auto">{o.supplier} · due {o.expected}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <div className="progress flex-grow-1" style={{ height: 6 }}>
                          <div className="progress-bar" style={{ width: `${(got / units) * 100}%` }} />
                        </div>
                        <span className="pm-prod-meta">{got}/{units} units received</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {step === 1 && po && (
          <div>
            <Field label="Receive into location" className="col-md-6 mb-3">
              <select className="form-select" value={locId} onChange={(e) => setLocId(e.target.value)}>
                {locations.filter((l) => l.type === "Warehouse" || l.type === "Shop floor").map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
            <div className="table-responsive">
              <table className="table pm-table align-middle">
                <thead><tr><th>Line</th><th className="text-end">Ordered</th><th className="text-end">Already in</th><th className="text-end" style={{ width: 130 }}>Receiving now</th></tr></thead>
                <tbody>
                  {po.items.map((it) => {
                    const p = byId(products, it.productId);
                    const remaining = it.qty - it.received;
                    return (
                      <tr key={it.productId}>
                        <td><div className="d-flex align-items-center gap-2"><Thumb img={p?.img ?? ""} emoji={p?.emoji ?? "📦"} size={32} /><div><div className="pm-prod-name">{p?.name}</div><div className="pm-prod-meta">{p?.sku}</div></div></div></td>
                        <td className="text-end">{it.qty}</td>
                        <td className="text-end pm-prod-meta">{it.received}</td>
                        <td>
                          <input type="number" min={0} max={remaining} className="form-control form-control-sm text-end" value={qtys[it.productId] ?? remaining}
                            onChange={(e) => setQtys((q) => ({ ...q, [it.productId]: Number(e.target.value) }))} disabled={remaining <= 0} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="pm-note mt-2"><i className="bi bi-exclamation-triangle me-1" />Short delivery? Leave the receiving qty lower — the PO stays <b>Partial</b> until the balance arrives.</div>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3">
              Receiving <b>{totalQty} units</b> ({receiveRows.length} lines) from <b className="pm-mono">{po?.id}</b> into {locations.find((l) => l.id === locId)?.name}.
            </div>
            <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
              <div className="pm-kpi-label mb-2">Ledger entry preview</div>
              <div className="d-flex justify-content-between py-1"><span><i className="bi bi-box-seam me-2 text-primary" />Dr Inventory</span><b>{fmtKES(totalValue)}</b></div>
              <div className="d-flex justify-content-between py-1"><span><i className="bi bi-person-lines-fill me-2" />Cr Accounts Payable</span><b>{fmtKES(totalValue)}</b></div>
              <div className="pm-prod-meta mt-2"><i className="bi bi-shield-check me-1" />Supplier invoice later matches against this receipt on the Pay Suppliers page.</div>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   REORDER WIZARD — 3 steps: Select items → Supplier & dates → Send
================================================================== */
export function ReorderWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, createPO, recordActivity } = useStore();
  const preIds = (payload.ids as string[]) ?? [];
  const suggestions = products.filter((p) => p.status === "Active" && stockOf(p) <= p.reorderAt);
  const extras = products.filter((p) => p.status === "Active" && stockOf(p) > p.reorderAt);
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Set<string>>(new Set(preIds.length ? preIds : suggestions.filter((s) => !s.onOrder).map((s) => s.id)));
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [supplier, setSupplier] = useState("Kirinyaga Farmers Co-op");
  const [expected, setExpected] = useState("2026-08-05");
  const [note, setNote] = useState("");
  const suppliers = Array.from(new Set(products.map((p) => p.supplier)));
  const chosen = products.filter((p) => sel.has(p.id));
  const totalUnits = chosen.reduce((a, p) => a + (qtys[p.id] ?? p.reorderQty), 0);

  return (
    <Modal open onClose={onClose} title="Reorder low stock" subtitle="3-step auto-restock · suggested quantities from 30-day velocity" icon="bi-cart-plus" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={chosen.length === 0} onClick={() => setStep((s) => s + 1)}>Next step <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => {
              createPO(supplier, chosen.map((p) => ({ productId: p.id, qty: qtys[p.id] ?? p.reorderQty })), expected, note);
              recordActivity(`Reorder PO sent to ${supplier} — ${chosen.length} SKUs, ${totalUnits} units`, "bi-cart-plus");
              onClose();
            }}>
              <i className="bi bi-send me-1" /> Send purchase order
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Select items", icon: "bi-check2-square" }, { label: "Supplier & dates", icon: "bi-truck" }, { label: "Review & send", icon: "bi-send-check" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            <div className="pm-kpi-label mb-2">Suggested — at or below reorder point (ranked by days of cover)</div>
            {suggestions.map((p) => {
              const cov = coverOf(p);
              return (
                <div key={p.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                  <input className="form-check-input" type="checkbox" checked={sel.has(p.id)} disabled={p.onOrder > 0 && stockOf(p) === 0}
                    onChange={() => setSel((s) => { const n = new Set(s); if (n.has(p.id)) n.delete(p.id); else n.add(p.id); return n; })} />
                  <Thumb img={p.img} emoji={p.emoji} size={34} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-semibold text-truncate" style={{ fontSize: "0.8rem" }}>{p.name}</div>
                    <div className="pm-prod-meta">{stockOf(p)} on hand · reorder at {p.reorderAt} · {p.sold30} sold/30d</div>
                  </div>
                  <Badge tone={cov === 0 ? "red" : cov < 7 ? "amber" : "slate"}>{cov === 0 ? "Out" : cov + "d cover"}</Badge>
                  {p.onOrder > 0 ? <Badge tone="blue">+{p.onOrder} on order</Badge> : null}
                  <input type="number" min={1} className="form-control form-control-sm" style={{ width: 84 }} value={qtys[p.id] ?? p.reorderQty}
                    onChange={(e) => setQtys((q) => ({ ...q, [p.id]: Number(e.target.value) }))} disabled={!sel.has(p.id)} />
                  <span className="pm-prod-meta" style={{ width: 70 }}>{fmtKES((qtys[p.id] ?? p.reorderQty) * p.cost)}</span>
                </div>
              );
            })}
            <div className="pm-kpi-label mt-3 mb-2">Add more items</div>
            <select className="form-select" value="" onChange={(e) => { if (e.target.value) { setSel((s) => new Set([...s, e.target.value])); } }}>
              <option value="">— Add another SKU to this PO —</option>
              {extras.map((p) => <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}
            </select>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Supplier" className="col-md-6">
              <select className="form-select" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
                {suppliers.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Expected delivery" className="col-md-6">
              <input type="date" className="form-control" value={expected} onChange={(e) => setExpected(e.target.value)} />
            </Field>
            <Field label="Note to supplier" className="col-12">
              <input className="form-control" placeholder="e.g. Please WhatsApp dispatch confirmation" value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <div className="col-12">
              <div className="pm-note soft"><i className="bi bi-lightbulb me-1" />POs sent here also appear on the Pay Suppliers page — approval rules apply if configured there.</div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3">Sending <b>{chosen.length} SKUs · {totalUnits} units</b> to <b>{supplier}</b>, expected <b>{expected}</b>.</div>
            <div className="table-responsive">
              <table className="table pm-table align-middle">
                <thead><tr><th>SKU</th><th className="text-end">Qty</th><th className="text-end">Unit cost</th><th className="text-end">PO value</th></tr></thead>
                <tbody>
                  {chosen.map((p) => (
                    <tr key={p.id}>
                      <td><div className="d-flex align-items-center gap-2"><Thumb img={p.img} emoji={p.emoji} size={30} /><b style={{ fontSize: "0.8rem" }}>{p.name}</b></div></td>
                      <td className="text-end">{qtys[p.id] ?? p.reorderQty}</td>
                      <td className="text-end pm-prod-meta">{fmtKES(p.cost)}</td>
                      <td className="text-end fw-bold">{fmtKES((qtys[p.id] ?? p.reorderQty) * p.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-prod-meta"><i className="bi bi-shield-check me-1 text-primary" />Stock-on-order updates immediately; ledger entries post when the goods arrive.</div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   WRITE-OFF WIZARD — 3 steps: Select batches → Reason & method → Post
================================================================== */
export function WriteOffWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { batches, products, writeOff } = useStore();
  const sorted = [...batches].sort((a, b) => a.daysLeft - b.daysLeft);
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Set<string>>(new Set(sorted.filter((b) => b.daysLeft < 30).map((b) => b.id)));
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("Expired past best-before");
  const [method, setMethod] = useState("Destroy");
  const [note, setNote] = useState("");
  const chosen = sorted.filter((b) => sel.has(b.id) && (qtys[b.id] ?? 1) > 0);
  const totalQty = chosen.reduce((a, b) => a + (qtys[b.id] ?? 1), 0);
  const totalLoss = chosen.reduce((a, b) => a + (qtys[b.id] ?? 1) * (byId(products, b.productId)?.cost ?? 0), 0);

  return (
    <Modal open onClose={onClose} title="Write off stock" subtitle="3-step write-off · creates an Expired adjustment + ledger entry" icon="bi-trash" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={chosen.length === 0} onClick={() => setStep((s) => s + 1)}>Next step <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-danger" disabled={chosen.length === 0} onClick={() => {
              writeOff(chosen.map((b) => ({ productId: b.productId, qty: qtys[b.id] ?? 1 })), reason, method, chosen[0].locId);
              onClose();
            }}>
              <i className="bi bi-trash me-1" /> Post write-off (−KES {totalLoss.toLocaleString()})
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Select batches", icon: "bi-check2-square" }, { label: "Reason & method", icon: "bi-sliders" }, { label: "Post", icon: "bi-trash" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="pm-kpi-label">Batches — sorted FEFO (first-expiry first-out)</div>
              <Chip on={sel.size === sorted.length} onClick={() => setSel(sel.size === sorted.length ? new Set() : new Set(sorted.map((b) => b.id)))}>Toggle all</Chip>
            </div>
            {sorted.map((b) => {
              const p = byId(products, b.productId);
              return (
                <div key={b.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                  <input className="form-check-input" type="checkbox" checked={sel.has(b.id)} onChange={() => setSel((s) => { const n = new Set(s); if (n.has(b.id)) n.delete(b.id); else n.add(b.id); return n; })} />
                  <Thumb img={p?.img ?? ""} emoji={p?.emoji ?? "📦"} size={34} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-semibold text-truncate" style={{ fontSize: "0.8rem" }}>{p?.name}</div>
                    <div className="pm-prod-meta pm-mono">Batch {b.batchNo} · expires {b.expiry} · {b.qty} units</div>
                  </div>
                  <Badge tone={b.daysLeft < 7 ? "red" : b.daysLeft < 30 ? "amber" : "green"}>{b.daysLeft}d left</Badge>
                  <input type="number" min={1} max={b.qty} className="form-control form-control-sm" style={{ width: 76 }} value={qtys[b.id] ?? 1} onChange={(e) => setQtys((q) => ({ ...q, [b.id]: Number(e.target.value) }))} disabled={!sel.has(b.id)} />
                </div>
              );
            })}
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Reason" className="col-md-6">
              <select className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                <option>Expired past best-before</option>
                <option>Damaged in storage</option>
                <option>Contaminated</option>
                <option>Regulatory recall</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Method" className="col-md-6">
              <div className="d-flex gap-2">
                <Chip on={method === "Destroy"} onClick={() => setMethod("Destroy")}><i className="bi bi-trash me-1" /> Destroy</Chip>
                <Chip on={method === "Donate"} onClick={() => setMethod("Donate")}><i className="bi bi-heart me-1" /> Donate</Chip>
                <Chip on={method === "Sell at discount"} onClick={() => setMethod("Sell at discount")}><i className="bi bi-tag me-1" /> Sell at discount</Chip>
              </div>
            </Field>
            <Field label="Note" className="col-12">
              <input className="form-control" placeholder="e.g. Disposal via licensed handler" value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3">
              Writing off <b>{totalQty} units</b> across {chosen.length} batch(es) — <b>{method}</b> · {reason}. Total loss <b style={{ color: "var(--pm-danger)" }}>KES {totalLoss.toLocaleString()}</b>.
            </div>
            <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
              <div className="pm-kpi-label mb-2">Ledger entry preview</div>
              <div className="d-flex justify-content-between py-1"><span><i className="bi bi-journal-x me-2" style={{ color: "var(--pm-danger)" }} />Dr Inventory Write-off (expense)</span><b>{fmtKES(totalLoss)}</b></div>
              <div className="d-flex justify-content-between py-1"><span><i className="bi bi-box-seam me-2" />Cr Inventory</span><b>{fmtKES(totalLoss)}</b></div>
              <div className="pm-prod-meta mt-2"><i className="bi bi-shield-check me-1" />Expense feeds Bookkeeping &amp; Taxes as a deductible — flagged for your accountant.</div>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   RETURN INSPECTION WIZARD — 4 steps: Inspect → Photos → Decision → Post
================================================================== */
export function ReturnInspectionWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { returns, products, processReturn } = useStore();
  const r = returns.find((x) => x.id === String(payload.id));
  const [step, setStep] = useState(0);
  const [condition, setCondition] = useState("Minor wear");
  const [photos, setPhotos] = useState<Set<number>>(new Set());
  const [decision, setDecision] = useState<"Restock" | "Quarantine" | "Destroy" | "Refund">("Restock");
  const [note, setNote] = useState("");
  if (!r) return null;
  const p = byId(products, r.productId);

  const decisions = [
    { id: "Restock" as const, icon: "bi-arrow-counterclockwise", d: "Adds back to Main Warehouse — sellable as-is", tone: "green" },
    { id: "Quarantine" as const, icon: "bi-shield-exclamation", d: "Hold in Quarantine for supplier review or repair", tone: "violet" },
    { id: "Destroy" as const, icon: "bi-trash", d: "Write off — customer already refunded or will be", tone: "red" },
    { id: "Refund" as const, icon: "bi-cash-coin", d: "Refund without restocking (item kept or lost)", tone: "amber" },
  ];

  return (
    <Modal open onClose={onClose} title={`Inspect return ${r.id}`} subtitle={`${r.orderId} · ${p?.name} × ${r.qty} · ${r.reason}`} icon="bi-search" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={step === 1 && photos.size === 0} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className={decision === "Destroy" ? "btn btn-danger" : "btn btn-primary"}
              onClick={() => { processReturn(r.id, decision, note || condition); onClose(); }}>
              <i className="bi bi-check2-circle me-1" /> Post decision
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Inspect", icon: "bi-search" }, { label: "Photos", icon: "bi-camera" }, { label: "Decision", icon: "bi-arrow-left-right" }, { label: "Post", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Condition of returned item</label>
              <div className="d-flex gap-2 flex-wrap">
                {["Like new", "Minor wear", "Damaged", "Unusable"].map((c) => (
                  <Chip key={c} on={condition === c} onClick={() => setCondition(c)}>
                    <i className={`bi ${c === "Like new" ? "bi-stars" : c === "Minor wear" ? "bi-circle-half" : c === "Damaged" ? "bi-x-octagon" : "bi-trash"} me-1`} /> {c}
                  </Chip>
                ))}
              </div>
            </div>
            <Field label="Inspection notes" className="col-12">
              <textarea className="form-control" rows={2} placeholder="e.g. Packaging intact, product unused" value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <div className="col-12">
              <div className="pm-note soft"><i className="bi bi-info-circle me-1" />Photos protect you if a customer disputes the decision later — they attach to the return record.</div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="row g-2">
              {[0, 1, 2].map((i) => (
                <div className="col-4" key={i}>
                  <button type="button" className={`w-100 pm-theme-card ${photos.has(i) ? "sel" : ""}`} style={{ padding: 0 }}
                    onClick={() => setPhotos((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}>
                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: 110, gap: 4 }}>
                      {photos.has(i) ? (
                        <>
                          <span style={{ fontSize: "1.7rem" }}>{["📦", "🖐️", "🧾"][i]}</span>
                          <span className="pm-prod-meta" style={{ fontSize: "0.66rem" }}>photo_{i + 1}.jpg ✓</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-camera" style={{ fontSize: "1.4rem", color: "#98a2b3" }} />
                          <span className="pm-prod-meta" style={{ fontSize: "0.66rem" }}>Add photo</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
            <div className="pm-prod-meta mt-2 text-center">{photos.size}/3 evidence photos attached</div>
          </div>
        )}
        {step === 2 && (
          <div className="d-flex flex-column gap-2">
            {decisions.map((d) => (
              <button key={d.id} type="button" className={`pm-theme-card text-start p-2 w-100 ${decision === d.id ? "sel" : ""}`} onClick={() => setDecision(d.id)}>
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${d.icon}`} style={{ color: d.tone === "red" ? "var(--pm-danger)" : d.tone === "amber" ? "var(--pm-warn)" : "var(--pm-green-dark)" }} />
                  <b style={{ fontSize: "0.86rem" }}>{d.id === "Restock" ? "Restock to warehouse" : d.id}</b>
                  <Badge tone={d.tone} className="ms-auto">{d.tone === "green" ? "+ stock" : d.tone === "red" ? "− stock" : d.tone === "violet" ? "hold" : "no change"}</Badge>
                </div>
                <div className="pm-prod-meta mt-1">{d.d}</div>
              </button>
            ))}
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="pm-note mb-3">
              <b>{r.id}</b> → {decision} · condition “{condition}” · {photos.size} photo(s).
            </div>
            <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
              <div className="pm-kpi-label mb-2">What happens on post</div>
              {decision === "Restock" && <div className="pm-prod-meta"><i className="bi bi-box-seam me-1 text-primary" />+{r.qty} unit(s) added to Main Warehouse · movement logged as Return · customer thanked via WhatsApp.</div>}
              {decision === "Quarantine" && <div className="pm-prod-meta"><i className="bi bi-shield-exclamation me-1" />Item held in Quarantine location · supplier review scheduled · customer on hold until resolved.</div>}
              {decision === "Destroy" && <div className="pm-prod-meta"><i className="bi bi-trash me-1" style={{ color: "var(--pm-danger)" }} />Item written off · refund already issued on {r.orderId} · ledger expense recorded.</div>}
              {decision === "Refund" && <div className="pm-prod-meta"><i className="bi bi-cash-coin me-1" style={{ color: "var(--pm-warn)" }} />KES {r.value.toLocaleString()} refunded via M-Pesa reversal · no stock change · receipt reissued on eTIMS.</div>}
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   NEW PO — 2-step quick purchase order
================================================================== */
export function NewPoModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { products, createPO } = useStore();
  const [step, setStep] = useState(0);
  const [rows, setRows] = useState<{ productId: string; qty: string }[]>([{ productId: "", qty: "10" }]);
  const [supplier, setSupplier] = useState("Kitui Weavers Sacco");
  const [expected, setExpected] = useState("2026-08-10");
  const [note, setNote] = useState("");
  const suppliers = Array.from(new Set(products.map((p) => p.supplier)));
  const valid = rows.filter((r) => r.productId && Number(r.qty) > 0);
  const totalUnits = valid.reduce((a, r) => a + Number(r.qty), 0);

  return (
    <Modal open onClose={onClose} title="Create purchase order" subtitle="Quick 2-step PO — full supplier workflows live on Pay Suppliers" icon="bi-cart-plus" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step === 0 ? (
            <button type="button" className="btn btn-primary" disabled={valid.length === 0} onClick={() => setStep(1)}>Next <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(0)}><i className="bi bi-arrow-left me-1" /> Back</button>
              <button type="button" className="btn btn-primary" onClick={() => { createPO(supplier, valid.map((r) => ({ productId: r.productId, qty: Number(r.qty) })), expected, note); onClose(); }}>
                <i className="bi bi-send me-1" /> Send PO
              </button>
            </>
          )}
        </>
      }
    >
      {step === 0 ? (
        <div>
          {rows.map((r, i) => (
            <div key={i} className="d-flex align-items-center gap-2 mb-2">
              <select className="form-select flex-grow-1" style={{ maxWidth: 340 }} value={r.productId}
                onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, productId: e.target.value } : x)))}>
                <option value="">— Select SKU —</option>
                {products.filter((p) => p.status !== "Archived").map((p) => <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}
              </select>
              <input type="number" min={1} className="form-control" style={{ width: 90 }} placeholder="Qty" value={r.qty}
                onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)))} />
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}><i className="bi bi-trash" /></button>
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setRows((rs) => [...rs, { productId: "", qty: "10" }])}>
            <i className="bi bi-plus-lg me-1" /> Add line
          </button>
        </div>
      ) : (
        <div className="row g-3">
          <Field label="Supplier" className="col-md-6">
            <select className="form-select" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
              {suppliers.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Expected delivery" className="col-md-6">
            <input type="date" className="form-control" value={expected} onChange={(e) => setExpected(e.target.value)} />
          </Field>
          <Field label="Note" className="col-12">
            <input className="form-control" value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <div className="col-12">
            <div className="pm-note">{valid.length} line(s) · {totalUnits} units → {supplier}, expected {expected}.</div>
          </div>
        </div>
      )}
    </Modal>
  );
}
