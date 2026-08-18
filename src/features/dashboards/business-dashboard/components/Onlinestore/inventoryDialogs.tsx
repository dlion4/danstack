import { useState } from "react";
import { coverOf, fmtKES, stockOf, valueOf } from "./data";
import type { Location } from "./data";
import { useStore } from "./store";
import { Badge, Drawer, Field, Modal, Spark, StatusBadge, Thumb } from "./ui";

const LOC_ICON: Record<string, string> = { Warehouse: "bi-buildings", "Shop floor": "bi-shop", Quarantine: "bi-shield-exclamation", "In transit": "bi-truck" };

/* ==================================================================
   SKU DRAWER — full inventory profile of one product
================================================================== */
export function SkuDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, locations, movements, openModal, updateReorder, toast, recordActivity } = useStore();
  const p = products.find((x) => x.id === String(payload.id));
  const [reorderAt, setReorderAt] = useState(String(p?.reorderAt ?? 0));
  const [reorderQty, setReorderQty] = useState(String(p?.reorderQty ?? 0));
  const [autoPO, setAutoPO] = useState(p?.autoPO ?? false);
  if (!p) return null;
  const total = stockOf(p);
  const value = valueOf(p);
  const cov = coverOf(p);
  const spark = Array.from({ length: 12 }, (_, i) => Math.max(1, Math.round((p.sold30 / 12) * (0.6 + (i % 4) * 0.22))));
  const pMoves = movements.filter((m) => m.productId === p.id).slice(0, 5);
  const hasBatch = ["p2", "p3", "p12", "p13"].includes(p.id);

  return (
    <Drawer open onClose={onClose} icon="bi-box-seam" title={p.name} subtitle={`${p.sku} · ${p.category} · ${p.supplier}`}>
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={p.status} />
        {total === 0 ? <Badge tone="red">Out of stock</Badge> : total <= p.reorderAt ? <Badge tone="amber">Low stock</Badge> : <Badge tone="green">Healthy</Badge>}
        {p.onOrder > 0 && <Badge tone="blue">+{p.onOrder} on order</Badge>}
        {p.serialized && <Badge tone="violet">Serialized</Badge>}
        {hasBatch && <Badge tone="slate">Batch-tracked</Badge>}
      </div>

      <div className="row g-2 mb-3">
        <div className="col-4"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">On hand</div><b>{total}</b></div></div>
        <div className="col-4"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Value</div><b>{fmtKES(value)}</b></div></div>
        <div className="col-4"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Cover</div><b>{cov === 0 ? "0d" : cov === Infinity ? "∞" : cov + "d"}</b></div></div>
      </div>

      <div className="pm-card mb-3" style={{ boxShadow: "none" }}>
        <div className="pm-kpi-label mb-2">Stock by location</div>
        {locations.map((l) => {
          const q = p.stockByLoc[l.id] ?? 0;
          return (
            <div key={l.id} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
              <i className={`bi ${LOC_ICON[l.type]}`} style={{ color: "var(--pm-green-dark)", width: 18 }} />
              <span style={{ fontSize: "0.8rem" }} className="flex-grow-1">{l.name}</span>
              <span className="pm-prod-meta">{l.type}</span>
              <b style={{ width: 40, textAlign: "right" }}>{q}</b>
            </div>
          );
        })}
      </div>

      <div className="pm-card mb-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
        <div className="d-flex justify-content-between align-items-center mb-1">
          <div className="pm-kpi-label">Sales pace — 12 weeks</div>
          <Spark data={spark} w={120} h={34} />
        </div>
        <div className="pm-prod-meta">{p.sold30} sold in 30 days · reorder at {p.reorderAt} units</div>
      </div>

      <div className="pm-card mb-3" style={{ boxShadow: "none" }}>
        <div className="pm-kpi-label mb-2">Reorder settings</div>
        <div className="d-flex align-items-end gap-2 mb-2">
          <Field label="Alert at" className="flex-grow-1">
            <input type="number" min={0} className="form-control form-control-sm" value={reorderAt} onChange={(e) => setReorderAt(e.target.value)} />
          </Field>
          <Field label="Reorder qty" className="flex-grow-1">
            <input type="number" min={1} className="form-control form-control-sm" value={reorderQty} onChange={(e) => setReorderQty(e.target.value)} />
          </Field>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => {
            updateReorder(p.id, { reorderAt: Number(reorderAt) || 0, reorderQty: Number(reorderQty) || 1, autoPO });
            recordActivity(`Reorder settings updated on ${p.name}`, "bi-sliders");
            toast(`Reorder point ${reorderAt} · qty ${reorderQty} · auto-PO ${autoPO ? "on" : "off"}`, "success", "Settings saved");
          }}>
            <i className="bi bi-check-lg" />
          </button>
        </div>
        <div className="form-check form-switch">
          <input className="form-check-input" type="checkbox" id="autoPO" checked={autoPO} onChange={(e) => setAutoPO(e.target.checked)} />
          <label className="form-check-label pm-prod-meta" htmlFor="autoPO">Auto-generate PO when stock hits the reorder point</label>
        </div>
      </div>

      {pMoves.length > 0 && (
        <div className="pm-card mb-3" style={{ boxShadow: "none" }}>
          <div className="pm-kpi-label mb-2">Recent movements</div>
          {pMoves.map((m) => (
            <div key={m.id} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
              <Badge tone={m.type === "Purchase" ? "green" : m.type === "Sale" ? "blue" : m.type.includes("Transfer") ? "slate" : m.type === "Write-off" ? "red" : "amber"}>{m.type}</Badge>
              <span className={`fw-bold ${m.qty > 0 ? "pm-qtypos" : "pm-qtyneg"}`} style={{ fontSize: "0.8rem", width: 44 }}>{m.qty > 0 ? "+" : ""}{m.qty}</span>
              <span className="pm-prod-meta flex-grow-1">{locations.find((l) => l.id === m.locId)?.name} · {m.ref}</span>
              <span className="pm-prod-meta">{m.time}</span>
            </div>
          ))}
        </div>
      )}

      <div className="row g-2">
        <div className="col-6"><button type="button" className="btn btn-outline-primary btn-sm w-100" onClick={() => openModal("adjustmentWizard", { productId: p.id })}><i className="bi bi-sliders me-1" /> Adjust</button></div>
        <div className="col-6"><button type="button" className="btn btn-outline-primary btn-sm w-100" onClick={() => openModal("transferWizard", { productId: p.id })}><i className="bi bi-arrow-left-right me-1" /> Transfer</button></div>
        <div className="col-6"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => openModal("scan")}><i className="bi bi-upc-scan me-1" /> Scan</button></div>
        <div className="col-6"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => openModal("reorderSettings", { id: p.id })}><i className="bi bi-cart-plus me-1" /> Restock</button></div>
      </div>
    </Drawer>
  );
}

/* ==================================================================
   REORDER SETTINGS MODAL
================================================================== */
export function ReorderSettingsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, updateReorder, recordActivity, toast } = useStore();
  const p = products.find((x) => x.id === String(payload.id));
  const [reorderAt, setReorderAt] = useState(String(p?.reorderAt ?? 0));
  const [reorderQty, setReorderQty] = useState(String(p?.reorderQty ?? 0));
  const [autoPO, setAutoPO] = useState(p?.autoPO ?? false);
  const [channels, setChannels] = useState({ whatsapp: true, sms: true, email: false });
  if (!p) return null;
  const cov = coverOf(p);
  return (
    <Modal open onClose={onClose} title="Reorder settings" subtitle={`${p.name} · ${stockOf(p)} on hand`} icon="bi-cart-plus"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            updateReorder(p.id, { reorderAt: Number(reorderAt) || 0, reorderQty: Number(reorderQty) || 1, autoPO });
            recordActivity(`Reorder rule updated on ${p.sku}`, "bi-sliders");
            toast(`Alert at ${reorderAt} · restock ${reorderQty} · auto-PO ${autoPO ? "ON" : "OFF"}.`, "success", "Reorder rule saved");
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Save rule
          </button>
        </>
      }
    >
      <div className="row g-3">
        <Field label="Reorder point (alert at)" className="col-md-6">
          <input type="number" min={0} className="form-control" value={reorderAt} onChange={(e) => setReorderAt(e.target.value)} />
        </Field>
        <Field label="Restock quantity" className="col-md-6">
          <input type="number" min={1} className="form-control" value={reorderQty} onChange={(e) => setReorderQty(e.target.value)} />
        </Field>
      </div>
      <div className="form-check form-switch mt-3">
        <input className="form-check-input" type="checkbox" id="rapo" checked={autoPO} onChange={(e) => setAutoPO(e.target.checked)} />
        <label className="form-check-label" htmlFor="rapo"><b style={{ fontSize: "0.84rem" }}>Auto-generate purchase order</b><div className="pm-prod-meta">Sends a draft PO to {p.supplier} when the reorder point is hit.</div></label>
      </div>
      <div className="pm-kpi-label mt-3 mb-1">Alert channels</div>
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
      <div className="pm-note soft mt-3">
        <i className="bi bi-lightbulb me-1" />Current cover: <b>{cov === Infinity ? "no sales yet" : cov + " days"}</b> at the last 30-day sales pace.
      </div>
    </Modal>
  );
}

/* ==================================================================
   LOCATION MODAL — add / edit
================================================================== */
export function LocationModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { locations, addLocation, updateLocation, removeLocation, toast, recordActivity } = useStore();
  const edit = locations.find((l) => l.id === String(payload.id ?? ""));
  const [name, setName] = useState(edit?.name ?? "");
  const [type, setType] = useState<Location["type"]>(edit?.type ?? "Warehouse");
  const [desc, setDesc] = useState(edit?.desc ?? "");
  const [isDefault, setIsDefault] = useState(edit?.isDefault ?? false);
  return (
    <Modal open onClose={onClose} title={edit ? "Edit location" : "Add location"} subtitle="Stock lives in locations — transfers move between them" icon="bi-geo-alt"
      footer={
        <>
          {edit && (
            <button type="button" className="btn btn-outline-danger me-auto" disabled={edit.isDefault} onClick={() => {
              removeLocation(edit.id);
              recordActivity(`Location ${edit.name} removed`, "bi-geo-alt");
              toast(`${edit.name} removed.`, "info", "Location deleted");
              onClose();
            }}>
              <i className="bi bi-trash me-1" /> Delete
            </button>
          )}
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={!name.trim()} onClick={() => {
            if (edit) {
              updateLocation(edit.id, { name, type, desc, isDefault });
              recordActivity(`Location ${name} updated`, "bi-geo-alt");
              toast(`${name} updated.`, "success", "Location saved");
            } else {
              addLocation({ id: "l" + Date.now(), name: name.trim(), type, desc: desc || "New location", isDefault });
              recordActivity(`Location ${name} added`, "bi-geo-alt");
              toast(`${name} added — transfers can now route to it.`, "success", "Location created");
            }
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Save location
          </button>
        </>
      }
    >
      <div className="row g-3">
        <Field label="Location name *" className="col-md-8">
          <input className="form-control" placeholder="e.g. Westlands Pop-up" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label="Type" className="col-md-4">
          <select className="form-select" value={type} onChange={(e) => setType(e.target.value as Location["type"])}>
            <option>Warehouse</option><option>Shop floor</option><option>Quarantine</option><option>In transit</option>
          </select>
        </Field>
        <Field label="Description" className="col-12">
          <input className="form-control" placeholder="Address / notes" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Field>
        <div className="col-12">
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id="defLoc" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            <label className="form-check-label" htmlFor="defLoc">Make default receiving location (POs land here)</label>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ==================================================================
   ADJUSTMENT DETAIL — view & reverse
================================================================== */
export function AdjustmentDetailModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { adjustments, products, locations, postAdjustment, recordActivity, toast } = useStore();
  const a = adjustments.find((x) => x.id === String(payload.id));
  if (!a) return null;
  return (
    <Modal open onClose={onClose} title={a.id} subtitle={`${a.date} · by ${a.by}`} icon="bi-clipboard-x"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-outline-danger" onClick={() => {
            postAdjustment("Reverse: " + a.type, a.items.map((it) => ({ ...it, qty: -it.qty })), a.locId, "Reversal of " + a.id);
            recordActivity(`${a.id} reversed`, "bi-arrow-counterclockwise");
            toast(`${a.id} reversed — stock restored.`, "warning", "Adjustment reversed");
            onClose();
          }}>
            <i className="bi bi-arrow-counterclockwise me-1" /> Reverse this adjustment
          </button>
        </>
      }
    >
      <div className="d-flex align-items-center gap-2 mb-3">
        <StatusBadge status={a.type} />
        <Badge tone="slate">{locations.find((l) => l.id === a.locId)?.name}</Badge>
        <Badge tone={a.value < 0 ? "red" : "green"}>{a.value >= 0 ? "+" : "−"}KES {Math.abs(a.value).toLocaleString()}</Badge>
      </div>
      <div className="table-responsive">
        <table className="table pm-table align-middle">
          <thead><tr><th>SKU</th><th className="text-end">Δ Qty</th><th>Reason</th></tr></thead>
          <tbody>
            {a.items.map((it, i) => {
              const p = products.find((x) => x.id === it.productId);
              return (
                <tr key={i}>
                  <td><div className="d-flex align-items-center gap-2"><Thumb img={p?.img ?? ""} emoji={p?.emoji ?? "📦"} size={30} /><div><b style={{ fontSize: "0.8rem" }}>{p?.name}</b><div className="pm-prod-meta">{p?.sku}</div></div></div></td>
                  <td className={`text-end fw-bold ${it.qty > 0 ? "pm-qtypos" : "pm-qtyneg"}`}>{it.qty > 0 ? "+" : ""}{it.qty}</td>
                  <td className="pm-prod-meta">{it.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {a.note && <div className="pm-note soft mt-2"><i className="bi bi-chat-left-text me-1" />{a.note}</div>}
      <div className="pm-prod-meta mt-2"><i className="bi bi-shield-check me-1 text-primary" />Reversals keep the original entry for audit — the ledger never rewrites history.</div>
    </Modal>
  );
}

/* ==================================================================
   COUNT DETAIL MODAL
================================================================== */
export function CountDetailModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { counts, products, openModal, toast } = useStore();
  const c = counts.find((x) => x.id === String(payload.id));
  if (!c) return null;
  const done = c.items.filter((i) => i.counted !== null).length;
  const variances = c.items.filter((i) => i.counted !== null && i.variance !== 0);
  const pct = Math.round((done / c.items.length) * 100);
  return (
    <Modal open onClose={onClose} title={c.name} subtitle={`${c.id} · ${c.scopeLabel} · assigned to ${c.assignedTo}`} icon="bi-clipboard-check" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { toast("Count sheet CSV downloaded.", "info", "Export complete"); onClose(); }}>
            <i className="bi bi-download me-1" /> Export sheet
          </button>
          {c.status === "Counting" ? (
            <button type="button" className="btn btn-primary" onClick={() => { onClose(); openModal("countWizard", { id: c.id }); }}>
              <i className="bi bi-play-fill me-1" /> Resume counting
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
          )}
        </>
      }
    >
      <div className="d-flex align-items-center gap-3 mb-3">
        <StatusBadge status={c.status} />
        <div className="progress flex-grow-1" style={{ height: 8 }}>
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <span className="pm-prod-meta">{done}/{c.items.length} counted · {variances.length} variance(s)</span>
      </div>
      <div className="table-responsive" style={{ maxHeight: 320, overflowY: "auto" }}>
        <table className="table pm-table align-middle">
          <thead><tr><th>SKU</th><th className="text-end">Expected</th><th className="text-end">Counted</th><th className="text-end">Δ</th></tr></thead>
          <tbody>
            {c.items.map((it) => {
              const p = products.find((x) => x.id === it.productId);
              return (
                <tr key={it.productId}>
                  <td><b style={{ fontSize: "0.8rem" }}>{p?.name}</b><div className="pm-prod-meta">{p?.sku}</div></td>
                  <td className="text-end pm-prod-meta">{it.expected}</td>
                  <td className="text-end">{it.counted ?? <span className="pm-prod-meta">—</span>}</td>
                  <td className="text-end">
                    {it.variance === null || it.variance === undefined ? <span className="pm-prod-meta">—</span> :
                      it.variance === 0 ? <Badge tone="green">Match</Badge> : <Badge tone={it.variance > 0 ? "blue" : "red"}>{it.variance > 0 ? "+" : ""}{it.variance}</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

/* ==================================================================
   EXPORT LEDGER MODAL
================================================================== */
export function ExportLedgerModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const [range, setRange] = useState("Last 30 days");
  const [format, setFormat] = useState<"CSV" | "PDF" | "Excel">("CSV");
  const [include, setInclude] = useState({ movements: true, adjustments: true, counts: true, valuation: true, batches: false });
  const [exporting, setExporting] = useState(false);
  return (
    <Modal open onClose={onClose} title="Export inventory report" subtitle="Accountant-ready movement & valuation data" icon="bi-file-earmark-arrow-down"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={exporting} onClick={() => {
            setExporting(true);
            window.setTimeout(() => {
              setExporting(false);
              recordActivity(`Inventory ${format} export (${range})`, "bi-file-earmark-arrow-down");
              toast(`${format} report (${range}) downloaded — includes stock valuation for KRA.`, "success", "Export complete");
              onClose();
            }, 1200);
          }}>
            {exporting ? <><span className="pm-spin me-1">◌</span> Building…</> : <><i className="bi bi-download me-1" /> Export {format}</>}
          </button>
        </>
      }
    >
      <Field label="Date range" className="mb-3">
        <select className="form-select" value={range} onChange={(e) => setRange(e.target.value)}>
          <option>Last 7 days</option><option>Last 30 days</option><option>This quarter</option><option>Year to date</option><option>Custom range</option>
        </select>
      </Field>
      <div className="d-flex gap-2 mb-3">
        {(["CSV", "PDF", "Excel"] as const).map((f) => (
          <button key={f} type="button" className={`pm-chip ${format === f ? "on" : ""}`} onClick={() => setFormat(f)}>
            <i className={`bi ${f === "PDF" ? "bi-file-pdf" : f === "CSV" ? "bi-filetype-csv" : "bi-file-earmark-excel"} me-1`} /> {f}
          </button>
        ))}
      </div>
      {[
        { k: "movements" as const, t: "Movement ledger (all types)" },
        { k: "adjustments" as const, t: "Adjustment register" },
        { k: "counts" as const, t: "Stock count history" },
        { k: "valuation" as const, t: "Closing stock valuation" },
        { k: "batches" as const, t: "Batch & expiry report" },
      ].map((r) => (
        <div key={r.k} className="d-flex align-items-center gap-2 py-1">
          <div className="form-check form-switch mb-0">
            <input className="form-check-input" type="checkbox" checked={include[r.k]} onChange={(e) => setInclude((s) => ({ ...s, [r.k]: e.target.checked }))} />
          </div>
          <span style={{ fontSize: "0.84rem" }}>{r.t}</span>
        </div>
      ))}
    </Modal>
  );
}

/* ==================================================================
   VALUATION METHOD MODAL
================================================================== */
export function ValuationModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const [method, setMethod] = useState<"weighted" | "fifo">("weighted");
  return (
    <Modal open onClose={onClose} title="Stock valuation method" subtitle="Determines the value of your closing stock on the books" icon="bi-calculator"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            recordActivity(`Valuation method changed to ${method === "fifo" ? "FIFO" : "Weighted Average Cost"}`, "bi-calculator");
            toast(`${method === "fifo" ? "FIFO" : "Weighted Average Cost"} applied to closing stock valuation.`, "success", "Method updated");
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Apply method
          </button>
        </>
      }
    >
      <div className="d-flex flex-column gap-2">
        <label className={`pm-theme-card p-3 d-flex gap-2 ${method === "weighted" ? "sel" : ""}`} style={{ cursor: "pointer" }}>
          <input type="radio" className="form-check-input mt-1" checked={method === "weighted"} onChange={() => setMethod("weighted")} />
          <div>
            <b style={{ fontSize: "0.86rem" }}>Weighted Average Cost <Badge tone="green" className="ms-1">Recommended</Badge></b>
            <div className="pm-prod-meta">Averages the cost of all stock received. Smoothes supplier price swings — simpler for mixed retail.</div>
          </div>
        </label>
        <label className={`pm-theme-card p-3 d-flex gap-2 ${method === "fifo" ? "sel" : ""}`} style={{ cursor: "pointer" }}>
          <input type="radio" className="form-check-input mt-1" checked={method === "fifo"} onChange={() => setMethod("fifo")} />
          <div>
            <b style={{ fontSize: "0.86rem" }}>FIFO — First In, First Out</b>
            <div className="pm-prod-meta">Matches perishables & FEFO picking. Cost of goods reflects the oldest batches first.</div>
          </div>
        </label>
      </div>
      <div className="pm-note mt-3"><i className="bi bi-exclamation-triangle me-1" />Changing methods re-values closing stock historically — PayMo recalculates prior periods and flags the change for your accountant.</div>
    </Modal>
  );
}

/* ==================================================================
   EXPIRY ALERT SETTINGS MODAL
================================================================== */
export function ExpirySettingsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const [crit, setCrit] = useState("7");
  const [warn, setWarn] = useState("30");
  const [channels, setChannels] = useState({ whatsapp: true, sms: true, email: true });
  const [autoWO, setAutoWO] = useState(false);
  return (
    <Modal open onClose={onClose} title="Expiry & alert settings" subtitle="FEFO alerts for batch-tracked products" icon="bi-hourglass-split"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            recordActivity("Expiry alert thresholds updated", "bi-hourglass-split");
            toast(`Alerts: critical at ${crit}d, warning at ${warn}d. Channels saved.`, "success", "Expiry settings saved");
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Save settings
          </button>
        </>
      }
    >
      <div className="row g-3">
        <Field label="Critical alert — days before expiry" className="col-md-6">
          <input type="number" min={1} className="form-control" value={crit} onChange={(e) => setCrit(e.target.value)} />
        </Field>
        <Field label="Warning alert — days before expiry" className="col-md-6">
          <input type="number" min={1} className="form-control" value={warn} onChange={(e) => setWarn(e.target.value)} />
        </Field>
      </div>
      <div className="pm-kpi-label mt-3 mb-1">Notify via</div>
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
      <div className="form-check form-switch mt-3">
        <input className="form-check-input" type="checkbox" id="autoWO" checked={autoWO} onChange={(e) => setAutoWO(e.target.checked)} />
        <label className="form-check-label" htmlFor="autoWO"><b style={{ fontSize: "0.84rem" }}>Auto write-off at 0 days</b><div className="pm-prod-meta">Expired batches are written off without manual approval (audit-logged).</div></label>
      </div>
    </Modal>
  );
}

/* ==================================================================
   BARCODE SCAN MODAL
================================================================== */
export function BarcodeScanModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { products, openModal, toast } = useStore();
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState<string | null>(null);
  const p = products.find((x) => x.id === found);
  const simulate = () => {
    setScanning(true);
    setFound(null);
    window.setTimeout(() => {
      const candidates = products.filter((x) => x.status === "Active");
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      setFound(pick.id);
      setScanning(false);
      toast(`Scanned ${pick.sku} — ${pick.name}.`, "success", "Barcode recognised");
    }, 1400);
  };
  return (
    <Modal open onClose={onClose} title="Scan a barcode" subtitle="Camera scan or manual entry — ties units to counts & moves" icon="bi-upc-scan"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          {p && <button type="button" className="btn btn-primary" onClick={() => { onClose(); openModal("sku", { id: p.id }); }}><i className="bi bi-eye me-1" /> Open SKU profile</button>}
        </>
      }
    >
      <div className="pm-scanbox text-center py-4" style={{ position: "relative" }}>
        {scanning && <div className="pm-scanline" />}
        <i className={`bi ${scanning ? "bi-upc-scan" : found ? "bi-check-circle-fill text-primary" : "bi-camera-video"}`} style={{ fontSize: "2.4rem", color: scanning ? "var(--pm-green)" : "#98a2b3" }} />
        <div className="pm-prod-meta mt-2">{scanning ? "Scanning…" : found ? "Found!" : "Point your camera at a shelf label or barcode"}</div>
        {p && (
          <div className="d-inline-flex align-items-center gap-2 mt-3 px-3 py-2" style={{ background: "var(--pm-green-soft)", borderRadius: 10 }}>
            <Thumb img={p.img} emoji={p.emoji} size={36} />
            <div className="text-start">
              <b style={{ fontSize: "0.84rem" }}>{p.name}</b>
              <div className="pm-prod-meta">{p.sku} · {stockOf(p)} on hand</div>
            </div>
          </div>
        )}
      </div>
      <div className="d-flex gap-2 mt-3">
        <button type="button" className="btn btn-outline-primary flex-grow-1" disabled={scanning} onClick={simulate}>
          {scanning ? <><span className="pm-spin me-1">◌</span> Scanning…</> : <><i className="bi bi-camera me-1" /> Simulate scan</>}
        </button>
        <input className="form-control" style={{ width: 200 }} placeholder="or type SKU…" onKeyDown={(e) => {
          if (e.key === "Enter") {
            const sku = (e.target as HTMLInputElement).value.trim().toUpperCase();
            const match = products.find((x) => x.sku.toUpperCase() === sku);
            if (match) { setFound(match.id); toast(`${match.sku} found.`, "success", "SKU recognised"); }
            else toast(`No SKU matches “${sku}”.`, "warning", "Not found");
          }
        }} />
      </div>
    </Modal>
  );
}

/* ==================================================================
   PO DRAWER
================================================================== */
export function PoDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { pos, products, openModal, closePO, toast, recordActivity } = useStore();
  const po = pos.find((x) => x.id === String(payload.id));
  if (!po) return null;
  const units = po.items.reduce((a, b) => a + b.qty, 0);
  const got = po.items.reduce((a, b) => a + b.received, 0);
  const events = [
    { t: po.date, x: "PO created" },
    ...(po.status !== "Draft" ? [{ t: po.date, x: `Sent to ${po.supplier}` }] : []),
    ...(po.status === "Partial" ? [{ t: "1w ago", x: "Partial delivery received (10/25 units)" }] : []),
    ...(po.status === "Received" ? [{ t: po.expected, x: "Fully received & posted to stock" }] : []),
  ];
  const open_ = po.status === "Sent" || po.status === "Partial";
  return (
    <Drawer open onClose={onClose} icon="bi-cart-check" title={po.id} subtitle={`${po.supplier} · created ${po.date} · expected ${po.expected}`}>
      <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
        <StatusBadge status={po.status} />
        <Badge tone="slate">{po.items.length} line(s)</Badge>
        <Badge tone="blue">{got}/{units} units in</Badge>
      </div>
      <div className="progress mb-3" style={{ height: 8 }}>
        <div className="progress-bar" style={{ width: `${(got / units) * 100}%` }} />
      </div>
      {po.items.map((it) => {
        const p = products.find((x) => x.id === it.productId);
        return (
          <div key={it.productId} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
            <Thumb img={p?.img ?? ""} emoji={p?.emoji ?? "📦"} size={36} />
            <div className="flex-grow-1">
              <b style={{ fontSize: "0.82rem" }}>{p?.name}</b>
              <div className="pm-prod-meta">{p?.sku} · {it.received}/{it.qty} received</div>
            </div>
            <b style={{ fontSize: "0.82rem" }}>{fmtKES((p?.cost ?? 0) * it.qty)}</b>
          </div>
        );
      })}
      {po.note && <div className="pm-note soft mt-3"><i className="bi bi-chat-left-text me-1" />{po.note}</div>}
      <div className="pm-kpi-label mt-3 mb-2">Timeline</div>
      <div className="pm-timeline">
        {events.map((e, i) => (
          <div key={i} className={`pm-tl-item ${i < events.length - 1 || po.status === "Received" || po.status === "Closed" ? "done" : "current"}`}>
            <div className="pm-tl-dot" />
            <div className="pm-tl-title">{e.x}</div>
            <div className="pm-tl-time">{e.t}</div>
          </div>
        ))}
      </div>
      <div className="row g-2 mt-3">
        {open_ && (
          <div className="col-6">
            <button type="button" className="btn btn-primary btn-sm w-100" onClick={() => openModal("receiveWizard", { poId: po.id })}>
              <i className="bi bi-box-arrow-in-down me-1" /> Receive stock
            </button>
          </div>
        )}
        {open_ && (
          <div className="col-6">
            <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => {
              closePO(po.id);
              recordActivity(`${po.id} closed`, "bi-archive");
              toast(`${po.id} closed — remaining quantities were cancelled.`, "warning", "PO closed");
              onClose();
            }}>
              <i className="bi bi-x-circle me-1" /> Close PO
            </button>
          </div>
        )}
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { toast(`${po.id} printed as PDF.`, "info", "Printing"); }}>
            <i className="bi bi-printer me-1" /> Print
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ==================================================================
   RETURNS POLICY MODAL
================================================================== */
export function ReturnsPolicyModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const [window_, setWindow_] = useState("7");
  const [whoPays, setWhoPays] = useState("We pay return delivery");
  const [autoRefund, setAutoRefund] = useState("2000");
  return (
    <Modal open onClose={onClose} title="Returns policy" subtitle="Shown on your storefront & printed on packing slips" icon="bi-arrow-counterclockwise"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            recordActivity("Returns policy updated", "bi-arrow-counterclockwise");
            toast(`Policy saved — ${window_} days to return, ${whoPays.toLowerCase()}, auto-refund under KES ${Number(autoRefund).toLocaleString()}.`, "success", "Policy updated");
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Save policy
          </button>
        </>
      }
    >
      <div className="row g-3">
        <Field label="Return window (days)" className="col-md-4">
          <input type="number" min={1} className="form-control" value={window_} onChange={(e) => setWindow_(e.target.value)} />
        </Field>
        <Field label="Return delivery" className="col-md-8">
          <select className="form-select" value={whoPays} onChange={(e) => setWhoPays(e.target.value)}>
            <option>We pay return delivery</option>
            <option>Customer pays return delivery</option>
            <option>No returns after delivery</option>
          </select>
        </Field>
        <Field label="Auto-refund below (KES)" className="col-md-4" hint="Small-value returns refund instantly without inspection.">
          <input type="number" min={0} className="form-control" value={autoRefund} onChange={(e) => setAutoRefund(e.target.value)} />
        </Field>
      </div>
      <div className="pm-note soft mt-3"><i className="bi bi-lightbulb me-1" />Shops with clear returns policies convert 12% better at checkout.</div>
    </Modal>
  );
}

/* ==================================================================
   ALERTS MODAL — all inventory alerts grouped
================================================================== */
export function AlertsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { products, batches, returns, pos, openModal } = useStore();
  const low = products.filter((p) => p.status === "Active" && stockOf(p) <= p.reorderAt);
  const expiring = [...batches].filter((b) => b.daysLeft < 30).sort((a, b) => a.daysLeft - b.daysLeft);
  const overdue = pos.filter((p) => p.status === "Sent" || p.status === "Partial");
  const pending = returns.filter((r) => r.status === "Pending inspection" || r.status === "Quarantined");
  const total = low.length + expiring.length + overdue.length + pending.length;
  return (
    <Modal open onClose={onClose} title="All inventory alerts" subtitle={`${total} items need attention across 4 categories`} icon="bi-bell" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>}
    >
      {[
        { title: "Low stock", icon: "bi-exclamation-triangle", tone: "amber", items: low.map((p) => ({ text: `${p.name} — ${stockOf(p)} left (alert at ${p.reorderAt})`, act: () => openModal("reorderSettings", { id: p.id }), btn: "Rule" })) },
        { title: "Expiring soon", icon: "bi-hourglass-split", tone: "red", items: expiring.map((b) => { const p = products.find((x) => x.id === b.productId); return { text: `Batch ${b.batchNo} · ${p?.name} — ${b.daysLeft} days left`, act: () => openModal("writeoffWizard"), btn: "Write off" }; }) },
        { title: "Open purchase orders", icon: "bi-cart-check", tone: "blue", items: overdue.map((po) => ({ text: `${po.id} · ${po.supplier} — due ${po.expected}`, act: () => openModal("poDrawer", { id: po.id }), btn: "View" })) },
        { title: "Returns awaiting decision", icon: "bi-arrow-counterclockwise", tone: "violet", items: pending.map((r) => { const p = products.find((x) => x.id === r.productId); return { text: `${r.id} · ${p?.name} — ${r.reason}`, act: () => openModal("returnWizard", { id: r.id }), btn: "Inspect" }; }) },
      ].map((g) => (
        <div key={g.title} className="mb-3">
          <div className="d-flex align-items-center gap-2 mb-1">
            <i className={`bi ${g.icon}`} style={{ color: g.tone === "red" ? "var(--pm-danger)" : g.tone === "amber" ? "var(--pm-warn)" : g.tone === "blue" ? "var(--pm-blue)" : "var(--pm-violet)" }} />
            <b style={{ fontSize: "0.86rem" }}>{g.title}</b>
            <Badge tone={g.tone}>{g.items.length}</Badge>
          </div>
          {g.items.length === 0 ? (
            <div className="pm-prod-meta px-1">Nothing here — all clear ✓</div>
          ) : (
            g.items.map((it, i) => (
              <div key={i} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <span className="flex-grow-1" style={{ fontSize: "0.8rem" }}>{it.text}</span>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { onClose(); it.act(); }}>{it.btn} →</button>
              </div>
            ))
          )}
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
    <Modal open onClose={onClose} title="Help & shortcuts" subtitle="Inventory & Stock — every flow on this page" icon="bi-question-circle" size="lg"
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
          { icon: "bi-clipboard-check", t: "Stock Count Wizard (4 steps)", d: "Scope → count sheet → variance review → post. Variances become ledger adjustments.", act: () => openModal("countWizard") },
          { icon: "bi-arrow-left-right", t: "Transfer Wizard (3 steps)", d: "Move stock between warehouse, shop floor and quarantine with double ledger entries.", act: () => openModal("transferWizard") },
          { icon: "bi-box-arrow-in-down", t: "Receive PO Wizard (3 steps)", d: "Goods receipt: Dr Inventory / Cr Accounts Payable. Short deliveries keep the PO Partial.", act: () => openModal("receiveWizard") },
          { icon: "bi-cart-plus", t: "Reorder Wizard (3 steps)", d: "Velocity-ranked suggestions with days-of-cover, auto-quantities, supplier pick.", act: () => openModal("reorderWizard") },
          { icon: "bi-trash", t: "Write-off Wizard (3 steps)", d: "FEFO batch selection, reason & method, and the expense hits Bookkeeping & Taxes.", act: () => openModal("writeoffWizard") },
          { icon: "bi-search", t: "Return Inspection (4 steps)", d: "Inspect → photos → decision (restock / quarantine / destroy / refund) → post.", act: () => openModal("returnWizard", { id: "RTN-035" }) },
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
  const kinds = ["All", "Moves", "Counts", "POs", "Returns", "Settings"];
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" title="Activity log" subtitle="Every stock event — audit-ready and ledger-linked">
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
      <button type="button" className="btn btn-outline-secondary w-100 mt-3" onClick={() => toast("Full audit trail (3,412 stock events) queued for export.", "info", "Audit trail")}>
        <i className="bi bi-download me-1" /> Export full audit trail
      </button>
    </Drawer>
  );
}
