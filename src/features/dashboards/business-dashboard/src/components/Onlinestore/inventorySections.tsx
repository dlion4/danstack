import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArcElement, BarController, BarElement, CategoryScale, Chart, DoughnutController, Filler,
  Legend, LinearScale, LineController, LineElement, PointElement, Tooltip,
} from "chart.js";
import { MOVE_COUNTS_30D, SUPPLIERS, VALUE_TREND, coverOf, fmtKES, fmtK, stockOf, valueOf } from "./data";
import { useStore } from "./store";
import { Badge, Chip, EmptyState, Kpi, Section, StatusBadge, Thumb } from "./ui";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, BarController, BarElement, ArcElement, DoughnutController, Tooltip, Legend, Filler);
const DAYS = Array.from({ length: 30 }, (_, i) => `d${i + 1}`);
const LOC_ICON: Record<string, string> = { Warehouse: "bi-buildings", "Shop floor": "bi-shop", Quarantine: "bi-shield-exclamation", "In transit": "bi-truck" };

/* ==================================================================
   PAGE HEADER
================================================================== */
export function PageHeader() {
  const { products, locations, openModal } = useStore();
  const units = products.filter((p) => p.status !== "Archived").reduce((a, p) => a + stockOf(p), 0);
  const value = products.filter((p) => p.status !== "Archived").reduce((a, p) => a + valueOf(p), 0);
  return (
    <div className="pm-banner-hero p-4 d-flex flex-wrap align-items-center gap-3">
      <div className="flex-grow-1" style={{ minWidth: 280 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="pm-zone"><i className="bi bi-boxes" /> YOUR BUSINESS</span>
          <span className="badge-soft green">Page 8 · 8 sections</span>
        </div>
        <h1 className="mb-1" style={{ fontSize: "1.6rem", fontWeight: 800 }}>Inventory &amp; Stock</h1>
        <p className="mb-0" style={{ color: "#b9c7d8", fontSize: "0.86rem", maxWidth: 640 }}>
          How much you hold, where it lives, what it's worth, and what to reorder before you run out.
          Every movement posts to the General Ledger — stock is money in boxes.
        </p>
      </div>
      <div className="d-flex flex-column gap-2" style={{ minWidth: 230 }}>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge-soft ink">{locations.length} locations</span>
          <span className="badge-soft ink">{units} units on hand</span>
          <span className="badge-soft ink">{fmtKES(value)} value</span>
          <span className="badge-soft green">98.7% accuracy</span>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("receiveWizard")}><i className="bi bi-box-arrow-in-down me-1" /> Receive PO</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("countWizard")}><i className="bi bi-clipboard-check me-1" /> Stock Count</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("transferWizard")}><i className="bi bi-arrow-left-right me-1" /> Transfer</button>
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("adjustmentWizard")}><i className="bi bi-sliders me-1" /> Adjust</button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   8.1 INVENTORY COMMAND CENTER
================================================================== */
export function CommandCenter() {
  const { products, batches, openModal } = useStore();
  const lineRef = useRef<HTMLCanvasElement | null>(null);
  const doughRef = useRef<HTMLCanvasElement | null>(null);
  const charts = useRef<Chart[]>([]);

  const active = products.filter((p) => p.status === "Active");
  const totalValue = active.reduce((a, p) => a + valueOf(p), 0);
  const totalUnits = active.reduce((a, p) => a + stockOf(p), 0);
  const low = active.filter((p) => stockOf(p) <= p.reorderAt);

  const catValue = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach((p) => { map[p.category] = (map[p.category] ?? 0) + valueOf(p); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [active]);

  useEffect(() => {
    const mk = (el: HTMLCanvasElement | null, cfg: Record<string, unknown>) => { if (el) charts.current.push(new Chart(el, cfg as never)); };
    mk(lineRef.current, {
      type: "line",
      data: {
        labels: DAYS,
        datasets: [{
          label: "Stock value (KES '000)",
          data: VALUE_TREND,
          borderColor: "#12b76a",
          backgroundColor: "rgba(18,183,106,0.10)",
          fill: true, tension: 0.4, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2.5,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c: { raw: unknown }) => "KES " + Number(c.raw).toLocaleString() + ",000" } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 8, color: "#98a2b3", font: { size: 10 } } },
          y: { grid: { color: "#eef0f4" }, ticks: { color: "#98a2b3", font: { size: 10 }, callback: (v: string | number) => v + "K" } },
        },
      },
    });
    mk(doughRef.current, {
      type: "doughnut",
      data: {
        labels: catValue.map((c) => c[0]),
        datasets: [{ data: catValue.map((c) => c[1]), backgroundColor: ["#12b76a", "#7a5af8", "#2e90fa", "#f79009", "#f04438"], borderWidth: 0, hoverOffset: 6 }],
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: "68%", plugins: { legend: { display: false } } },
    });
    return () => { charts.current.forEach((c) => c.destroy()); charts.current = []; };
  }, [catValue]);

  const alerts = [
    { tone: "amber", icon: "bi-exclamation-triangle", text: `${low.length} SKUs at/below reorder point`, sub: `Restock cost ≈ ${fmtKES(low.reduce((a, p) => a + p.reorderQty * p.cost, 0))}`, act: () => openModal("reorderWizard"), btn: "Reorder" },
    { tone: "red", icon: "bi-hourglass-split", text: "1 batch expires in under a week", sub: "B-2302 · Kitui Wild Honey · 3 units", act: () => openModal("writeoffWizard"), btn: "Write off" },
    { tone: "blue", icon: "bi-cart-check", text: "2 open purchase orders", sub: "PO-1041 due tomorrow · PO-1042 in 4 days", act: () => openModal("poDrawer", { id: "PO-1041" }), btn: "View PO" },
    { tone: "violet", icon: "bi-arrow-counterclockwise", text: "1 return awaiting inspection", sub: "RTN-035 · Kikoy — wrong size", act: () => openModal("returnWizard", { id: "RTN-035" }), btn: "Inspect" },
  ];
  void batches;

  return (
    <>
      <Section no="8.1" title="Inventory Command Center"
        sub="Stock value, units, health and alerts at a glance — computed live from the ledger every minute."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("exportLedger")}>
              <i className="bi bi-download me-1" /> Export report
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("alerts")}>
              <i className="bi bi-bell me-1" /> All alerts
            </button>
          </>
        }
      />
      <div className="pm-stat-grid">
        <Kpi icon="bi-cash-stack" iconBg="var(--pm-green-soft)" label="Stock value (at cost)" value={fmtKES(totalValue)} delta="+1.8%" spark={VALUE_TREND} footer="closing stock · weighted average" />
        <Kpi icon="bi-box-seam" iconBg="#e8f1fe" label="Units on hand" value={totalUnits.toLocaleString()} delta="+4.2%" spark={[540, 545, 551, 548, 556, 561, 558, 564, 569, 572, 576, 582]} sparkColor="#2e90fa" footer="across all active SKUs" />
        <Kpi icon="bi-exclamation-triangle" iconBg="#fef0c7" label="Low-stock SKUs" value={String(low.length)} delta={low.length > 0 ? "action needed" : "all healthy"} deltaGood={low.length === 0} footer={low.length ? "below reorder point" : "reorder points satisfied"} />
        <Kpi icon="bi-arrow-left-right" iconBg="#f0ebfe" label="Movements · 30d" value="186" delta="+11.4%" spark={MOVE_COUNTS_30D} sparkColor="#7a5af8" footer="purchases, sales, transfers…" />
      </div>
      <div className="row g-3 mt-1">
        <div className="col-lg-8">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <div className="fw-bold" style={{ fontSize: "0.9rem" }}>Stock value — last 30 days</div>
                <div className="pm-prod-meta">KES {fmtK(totalValue)} total · up 7.2% on purchases received</div>
              </div>
              <div className="d-flex gap-1">
                {["7d", "30d", "90d"].map((r, i) => (
                  <button key={r} type="button" className={`pm-chip ${i === 1 ? "on" : ""}`}>{r}</button>
                ))}
              </div>
            </div>
            <div style={{ height: 235 }}><canvas ref={lineRef} /></div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="pm-card h-100">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Value by category</div>
            <div style={{ height: 168 }}><canvas ref={doughRef} /></div>
            {catValue.map((c) => (
              <div key={c[0]} className="d-flex justify-content-between py-1" style={{ borderBottom: "1px solid var(--pm-border)", fontSize: "0.78rem" }}>
                <span>{c[0]}</span>
                <b>{fmtKES(c[1])}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="row g-3 mt-1">
        {alerts.map((a, i) => (
          <div className="col-lg-3 col-md-6" key={i}>
            <div className="pm-card pm-card-hover h-100" onClick={a.act}>
              <div className="d-flex align-items-start gap-2">
                <span className="pm-kpi-icon" style={{ width: 36, height: 36, fontSize: "0.9rem", background: "var(--pm-green-soft)", color: "var(--pm-warn)" }}>
                  <i className={`bi ${a.icon}`} />
                </span>
                <div className="flex-grow-1">
                  <div className="fw-semibold" style={{ fontSize: "0.82rem" }}>{a.text}</div>
                  <div className="pm-prod-meta">{a.sub}</div>
                </div>
              </div>
              <div className="mt-2">
                <span className="badge-soft blue"><i className="bi bi-lightning-charge-fill me-1" />{a.btn} →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   8.2 STOCK LEVELS & LOCATIONS
================================================================== */
export function LocationsLevels() {
  const { products, locations, openModal, searchQuery } = useStore();
  const [locFilter, setLocFilter] = useState("all");
  const [lowOnly, setLowOnly] = useState(false);
  const active = products.filter((p) => p.status !== "Archived");

  const filtered = useMemo(() => {
    let list = active;
    if (locFilter !== "all") list = list.filter((p) => (p.stockByLoc[locFilter] ?? 0) > 0);
    if (lowOnly) list = list.filter((p) => stockOf(p) > 0 && stockOf(p) <= p.reorderAt);
    const q = searchQuery.trim().toLowerCase();
    if (q) list = list.filter((p) => (p.name + p.sku + p.category).toLowerCase().includes(q));
    return list;
  }, [active, locFilter, lowOnly, searchQuery]);

  const locTotals = (locId: string) => {
    const units = active.reduce((a, p) => a + (p.stockByLoc[locId] ?? 0), 0);
    const value = active.reduce((a, p) => a + (p.stockByLoc[locId] ?? 0) * p.cost, 0);
    return { units, value };
  };

  return (
    <>
      <Section no="8.2" title="Stock Levels &amp; Locations"
        sub="Your four locations and the master stock table — transfer between them with two ledger entries per line."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("location")}>
              <i className="bi bi-geo-alt me-1" /> Add location
            </button>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("transferWizard")}>
              <i className="bi bi-arrow-left-right me-1" /> Transfer stock
            </button>
          </>
        }
      />
      <div className="row g-3">
        {locations.map((l) => {
          const t = locTotals(l.id);
          const capPct = l.type === "Warehouse" ? 68 : l.type === "Shop floor" ? 54 : l.type === "Quarantine" ? 12 : 40;
          return (
            <div className="col-lg-3 col-md-6" key={l.id}>
              <div className="pm-card pm-card-hover h-100" onClick={() => openModal("location", { id: l.id })}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="pm-kpi-icon" style={{ width: 38, height: 38, background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}>
                    <i className={`bi ${LOC_ICON[l.type]}`} />
                  </span>
                  <StatusBadge status={l.type} />
                </div>
                <div className="fw-bold" style={{ fontSize: "0.88rem" }}>{l.name}</div>
                <div className="pm-prod-meta mb-2">{l.desc} {l.isDefault && "· default"}</div>
                <div className="d-flex justify-content-between">
                  <span className="pm-prod-meta">Units</span>
                  <b>{t.units}</b>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="pm-prod-meta">Value</span>
                  <b>{fmtKES(t.value)}</b>
                </div>
                <div className="pm-prod-meta mb-1">Capacity used</div>
                <div className="progress" style={{ height: 6 }}>
                  <div className="progress-bar" style={{ width: `${capPct}%`, background: capPct > 85 ? "#f04438" : undefined }} />
                </div>
                <div className="pm-prod-meta mt-1">{capPct}% · {l.type === "In transit" ? "moves automatically" : "tap to manage"}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pm-card mt-3">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <div className="pm-kpi-label">Master stock table</div>
          <span className="ms-auto d-flex gap-2 flex-wrap align-items-center">
            {["all", ...locations.map((l) => l.id)].map((id) => {
              const l = locations.find((x) => x.id === id);
              return (
                <Chip key={id} on={locFilter === id} onClick={() => setLocFilter(id)}>
                  {id === "all" ? "All locations" : l?.name}
                </Chip>
              );
            })}
            <div className="form-check mb-0">
              <input className="form-check-input" type="checkbox" id="low8" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
              <label className="form-check-label pm-prod-meta" htmlFor="low8">Low stock only</label>
            </div>
          </span>
        </div>
        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead>
              <tr>
                <th style={{ minWidth: 200 }}>SKU</th>
                {locations.map((l) => <th key={l.id} className="text-end">{l.name.split(" ")[0]}</th>)}
                <th className="text-end">Total</th>
                <th className="text-end">Value</th>
                <th className="text-end">On order</th>
                <th>Cover</th>
                <th>Status</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const cov = coverOf(p);
                const total = stockOf(p);
                return (
                  <tr key={p.id} className="row-select" onClick={() => openModal("sku", { id: p.id })}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Thumb img={p.img} emoji={p.emoji} />
                        <div style={{ minWidth: 0 }}>
                          <div className="pm-prod-name text-truncate" style={{ maxWidth: 200 }}>{p.name}</div>
                          <div className="pm-prod-meta">{p.sku} · {p.supplier}</div>
                        </div>
                      </div>
                    </td>
                    {locations.map((l) => (
                      <td key={l.id} className={`text-end ${(p.stockByLoc[l.id] ?? 0) === 0 ? "pm-prod-meta" : "fw-semibold"}`} style={{ fontSize: "0.82rem" }}>
                        {p.stockByLoc[l.id] ?? 0}
                      </td>
                    ))}
                    <td className="text-end fw-bold">{total}</td>
                    <td className="text-end pm-prod-meta">{fmtKES(valueOf(p))}</td>
                    <td className="text-end">{p.onOrder > 0 ? <Badge tone="blue">+{p.onOrder}</Badge> : <span className="pm-prod-meta">—</span>}</td>
                    <td>
                      {cov === 0 ? <Badge tone="red">Out</Badge> : cov === Infinity ? <Badge tone="slate">No sales</Badge> : <Badge tone={cov < 7 ? "red" : cov < 15 ? "amber" : "green"}>{cov}d</Badge>}
                    </td>
                    <td>
                      {total === 0 ? <Badge tone="red">Out</Badge> : total <= p.reorderAt ? <Badge tone="amber">Low</Badge> : <Badge tone="green">OK</Badge>}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }} onClick={() => openModal("sku", { id: p.id })}>
                        <i className="bi bi-chevron-right" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <EmptyState icon="bi-search" title="No SKUs match" text="Try another location filter or clear the search." />
        )}
        <div className="pm-prod-meta mt-2">Row click opens the SKU profile with per-location stock, movements and reorder controls.</div>
      </div>
    </>
  );
}

/* ==================================================================
   8.3 STOCK ADJUSTMENTS & COUNTS
================================================================== */
export function AdjustmentsCounts() {
  const { adjustments, counts, products, locations, openModal } = useStore();
  const [tab, setTab] = useState<"adjustments" | "counts">("adjustments");
  return (
    <>
      <Section no="8.3" title="Stock Adjustments &amp; Counts"
        sub="Record losses, corrections and physical counts — every variance posts to the ledger with a reason."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("adjustmentWizard")}>
              <i className="bi bi-sliders me-1" /> New adjustment
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("countWizard")}>
              <i className="bi bi-clipboard-check me-1" /> Start stock count
            </button>
          </>
        }
      />
      <div className="pm-card">
        <ul className="nav nav-tabs border-0 mb-2">
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "adjustments" ? "active" : ""}`} onClick={() => setTab("adjustments")}>Adjustments <span className="badge bg-light text-secondary border ms-1">{adjustments.length}</span></button></li>
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "counts" ? "active" : ""}`} onClick={() => setTab("counts")}>Stock counts <span className="badge bg-light text-secondary border ms-1">{counts.length}</span></button></li>
        </ul>

        {tab === "adjustments" ? (
          <div className="table-responsive">
            <table className="table pm-table align-middle">
              <thead><tr><th>ID</th><th>Date</th><th>Type</th><th>Items</th><th>Location</th><th className="text-end">Units</th><th className="text-end">Value impact</th><th>By</th><th style={{ width: 40 }}></th></tr></thead>
              <tbody>
                {adjustments.map((a) => (
                  <tr key={a.id} className="row-select" onClick={() => openModal("adjustmentDetail", { id: a.id })}>
                    <td><span className="pm-mono fw-semibold" style={{ fontSize: "0.8rem" }}>{a.id}</span></td>
                    <td className="pm-prod-meta">{a.date}</td>
                    <td><StatusBadge status={a.type} /></td>
                    <td className="pm-prod-meta">
                      {a.items.slice(0, 2).map((it) => products.find((p) => p.id === it.productId)?.name.split(" ")[0]).join(", ")}
                      {a.items.length > 2 ? ` +${a.items.length - 2}` : ""}
                    </td>
                    <td className="pm-prod-meta">{locations.find((l) => l.id === a.locId)?.name}</td>
                    <td className="text-end fw-bold">{a.items.reduce((s, b) => s + Math.abs(b.qty), 0)}</td>
                    <td className={`text-end fw-bold ${a.value < 0 ? "pm-qtyneg" : "pm-qtypos"}`}>{a.value >= 0 ? "+" : "−"}KES {Math.abs(a.value).toLocaleString()}</td>
                    <td className="pm-prod-meta">{a.by}</td>
                    <td><button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }}><i className="bi bi-chevron-right" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="row g-3">
            {counts.map((c) => {
              const done = c.items.filter((i) => i.counted !== null).length;
              const variances = c.items.filter((i) => i.counted !== null && i.variance !== 0);
              const pct = Math.round((done / c.items.length) * 100);
              return (
                <div className="col-md-6" key={c.id}>
                  <div className="pm-card pm-card-hover h-100" style={{ boxShadow: "none", border: "1px solid var(--pm-border)" }} onClick={() => openModal("countDetail", { id: c.id })}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="fw-bold" style={{ fontSize: "0.88rem" }}>{c.name}</div>
                        <div className="pm-prod-meta"><span className="pm-mono">{c.id}</span> · {c.scopeLabel} · {c.assignedTo}</div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <div className="progress flex-grow-1" style={{ height: 7 }}>
                        <div className="progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="pm-prod-meta">{pct}%</span>
                    </div>
                    <div className="pm-prod-meta">
                      {c.status === "Counting" ? `${done}/${c.items.length} counted · ${variances.length} variance(s) so far` : `${c.items.length} items · ${variances.length} variance(s) posted`}
                    </div>
                    <div className="mt-2 d-flex gap-2">
                      <span className="badge-soft blue"><i className={`bi ${c.status === "Counting" ? "bi-play-fill" : "bi-eye"} me-1`} />{c.status === "Counting" ? "Resume count" : "View results"}</span>
                      <span className="badge-soft slate">started {c.started}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ==================================================================
   8.4 PURCHASE ORDERS & RESTOCKING
================================================================== */
export function PurchaseOrders() {
  const { pos, openModal } = useStore();
  return (
    <>
      <Section no="8.4" title="Purchase Orders &amp; Restocking"
        sub="Open POs, deliveries in flight and supplier reliability — receive stock with one wizard."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("newPo")}>
              <i className="bi bi-plus-lg me-1" /> New PO
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("receiveWizard")}>
              <i className="bi bi-box-arrow-in-down me-1" /> Receive stock
            </button>
          </>
        }
      />
      <div className="row g-3">
        {SUPPLIERS.map((s) => (
          <div className="col-lg-4 col-md-6" key={s.name}>
            <div className="pm-card pm-card-hover h-100" onClick={() => openModal("poDrawer", { id: s.openPOs ? "PO-1041" : "PO-1040" })}>
              <div className="d-flex justify-content-between align-items-start mb-1">
                <b style={{ fontSize: "0.86rem" }}>{s.name}</b>
                <Badge tone={s.onTime >= 90 ? "green" : s.onTime >= 80 ? "amber" : "red"}>{s.onTime}% on-time</Badge>
              </div>
              <div className="pm-prod-meta mb-2">{s.category} · avg lead {s.leadDays} days</div>
              <div className="d-flex justify-content-between">
                <span className="pm-prod-meta">Open POs</span>
                <b>{s.openPOs || "None"}</b>
              </div>
              <div className="progress mt-2" style={{ height: 5 }}>
                <div className="progress-bar" style={{ width: `${s.onTime}%`, background: s.onTime >= 90 ? undefined : "#f79009" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-card mt-3">
        <div className="pm-kpi-label mb-2">Purchase order register</div>
        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead><tr><th>PO</th><th>Supplier</th><th>Created</th><th>Expected</th><th className="text-end">Units</th><th>Progress</th><th>Status</th><th style={{ width: 40 }}></th></tr></thead>
            <tbody>
              {pos.map((po) => {
                const units = po.items.reduce((a, b) => a + b.qty, 0);
                const got = po.items.reduce((a, b) => a + b.received, 0);
                return (
                  <tr key={po.id} className="row-select" onClick={() => openModal("poDrawer", { id: po.id })}>
                    <td><span className="pm-mono fw-semibold" style={{ fontSize: "0.8rem" }}>{po.id}</span></td>
                    <td className="fw-semibold" style={{ fontSize: "0.82rem" }}>{po.supplier}</td>
                    <td className="pm-prod-meta">{po.date}</td>
                    <td className="pm-prod-meta">{po.expected}</td>
                    <td className="text-end fw-bold">{units}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: 6, minWidth: 70 }}>
                          <div className="progress-bar" style={{ width: `${(got / units) * 100}%` }} />
                        </div>
                        <span className="pm-prod-meta">{got}/{units}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={po.status} /></td>
                    <td><button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }}><i className="bi bi-chevron-right" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="pm-note soft mt-2">
          <i className="bi bi-shield-check me-1" />
          Receiving stock posts <b>Dr Inventory / Cr Accounts Payable</b> — the supplier invoice is matched on the Pay Suppliers page.
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   8.5 LOW-STOCK & REORDER AUTOMATION
================================================================== */
export function ReorderAutomation() {
  const { products, openModal, toast, recordActivity } = useStore();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const low = products.filter((p) => p.status === "Active" && stockOf(p) <= p.reorderAt);
  const chosen = low.filter((p) => sel.has(p.id) && !(p.onOrder > 0 && stockOf(p) === 0));
  const totalCost = chosen.reduce((a, p) => a + (qtys[p.id] ?? p.reorderQty) * p.cost, 0);
  return (
    <>
      <Section no="8.5" title="Low-Stock Alerts &amp; Reorder Automation"
        sub="Reorder points + 30-day velocity = suggestions ranked by days of cover. Never run out again."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("reorderWizard", { ids: [...sel] })} disabled={chosen.length === 0}>
            <i className="bi bi-cart-plus me-1" /> Create PO ({chosen.length})
          </button>
        }
      />
      <div className="pm-card">
        <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
          <div className="form-check form-switch mb-0">
            <input className="form-check-input" type="checkbox" defaultChecked onChange={(e) => { recordActivity("Auto-PO " + (e.target.checked ? "enabled" : "paused"), "bi-cart-plus"); toast(`Auto-PO ${e.target.checked ? "enabled — drafts fire automatically at reorder points" : "paused — you'll approve manually"}.`, "info", "Auto-PO " + (e.target.checked ? "on" : "off")); }} />
          </div>
          <div>
            <b style={{ fontSize: "0.86rem" }}>Auto-generate purchase orders</b>
            <div className="pm-prod-meta">Drafts a PO to the SKU's supplier the moment stock crosses its reorder point.</div>
          </div>
          <button type="button" className="btn btn-outline-secondary btn-sm ms-auto" onClick={() => openModal("expirySettings")}>
            <i className="bi bi-bell me-1" /> Alert settings
          </button>
        </div>
        {low.map((p) => {
          const cov = coverOf(p);
          const onOrderOnly = p.onOrder > 0 && stockOf(p) === 0;
          return (
            <div key={p.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
              <input className="form-check-input" type="checkbox" disabled={onOrderOnly} checked={sel.has(p.id)} onChange={() => setSel((s) => { const n = new Set(s); if (n.has(p.id)) n.delete(p.id); else n.add(p.id); return n; })} />
              <Thumb img={p.img} emoji={p.emoji} size={36} />
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div className="fw-semibold text-truncate" style={{ fontSize: "0.82rem" }}>{p.name}</div>
                <div className="pm-prod-meta">{stockOf(p)} on hand · alert at {p.reorderAt} · {p.sold30} sold/30d · supplier {p.supplier}</div>
              </div>
              {onOrderOnly ? (
                <Badge tone="blue">+{p.onOrder} in transit</Badge>
              ) : (
                <>
                  <Badge tone={cov === 0 ? "red" : cov < 7 ? "amber" : "slate"}>{cov === 0 ? "Out of stock" : cov + "d cover"}</Badge>
                  <input type="number" min={1} className="form-control form-control-sm" style={{ width: 78 }} value={qtys[p.id] ?? p.reorderQty} onChange={(e) => setQtys((q) => ({ ...q, [p.id]: Number(e.target.value) }))} disabled={!sel.has(p.id)} />
                  <span className="pm-prod-meta" style={{ width: 90 }}>{fmtKES((qtys[p.id] ?? p.reorderQty) * p.cost)}</span>
                </>
              )}
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("reorderSettings", { id: p.id })} title="Reorder rule">
                <i className="bi bi-gear" />
              </button>
            </div>
          );
        })}
        {low.length === 0 && <EmptyState icon="bi-check2-circle" title="All healthy" text="No SKUs are below their reorder points." />}
        <div className="d-flex justify-content-between mt-3 flex-wrap gap-2">
          <div className="pm-note soft flex-grow-1">
            <i className="bi bi-lightbulb me-1" />Days of cover = on hand ÷ (30-day sales ÷ 30). Under 7 days is urgent; under 15 needs planning.
            {chosen.length > 0 && <> Selected restock: <b>{fmtKES(totalCost)}</b> across {chosen.length} SKU(s).</>}
          </div>
          <button type="button" className="btn btn-outline-primary btn-sm align-self-center" onClick={() => openModal("reorderWizard")}>
            Open full reorder wizard →
          </button>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   8.6 STOCK VALUATION & MOVEMENT LEDGER
================================================================== */
export function ValuationLedger() {
  const { movements, products, locations, openModal, searchQuery } = useStore();
  const [typeFilter, setTypeFilter] = useState("All");
  const types = ["All", "Purchase", "Sale", "Adjustment", "Transfer", "Return", "Count", "Write-off"];
  const totalValue = products.filter((p) => p.status === "Active").reduce((a, p) => a + valueOf(p), 0);

  const filtered = useMemo(() => {
    let list = movements;
    if (typeFilter !== "All") {
      list = typeFilter === "Transfer" ? list.filter((m) => m.type.includes("Transfer")) : list.filter((m) => m.type === typeFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => {
        const p = products.find((x) => x.id === m.productId);
        return ((p?.name ?? "") + (p?.sku ?? "") + m.ref).toLowerCase().includes(q);
      });
    }
    return list;
  }, [movements, typeFilter, searchQuery, products]);

  return (
    <>
      <Section no="8.6" title="Stock Valuation &amp; Movement Ledger"
        sub="The complete audit trail of every unit that entered, moved or left — this is what your accountant reads."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("valuation")}>
              <i className="bi bi-calculator me-1" /> Valuation method
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("exportLedger")}>
              <i className="bi bi-download me-1" /> Export ledger
            </button>
          </>
        }
      />
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <b style={{ fontSize: "0.9rem" }}>Closing stock valuation</b>
              <Badge tone="green">Weighted avg</Badge>
            </div>
            <div className="pm-kpi-value mb-2">{fmtKES(totalValue)}</div>
            <div className="pm-prod-meta mb-3">at cost · 582 units · 14 SKUs</div>
            <div className="pm-kpi-label mb-1">Value by category</div>
            {Object.entries(products.filter((p) => p.status === "Active").reduce<Record<string, number>>((m, p) => { m[p.category] = (m[p.category] ?? 0) + valueOf(p); return m; }, {}))
              .sort((a, b) => b[1] - a[1])
              .map(([cat, v]) => (
                <div key={cat} className="d-flex align-items-center gap-2 py-1">
                  <span className="flex-grow-1" style={{ fontSize: "0.8rem" }}>{cat}</span>
                  <div className="progress" style={{ width: 90, height: 6 }}>
                    <div className="progress-bar" style={{ width: `${(v / totalValue) * 100}%` }} />
                  </div>
                  <b style={{ fontSize: "0.78rem", width: 76, textAlign: "right" }}>{fmtKES(v)}</b>
                </div>
              ))}
            <button type="button" className="btn btn-outline-primary btn-sm mt-3" onClick={() => openModal("valuation")}>
              <i className="bi bi-arrow-repeat me-1" /> Change method (FIFO / weighted)
            </button>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="pm-card">
            <div className="d-flex flex-wrap align-items-center gap-1 mb-2">
              {types.map((t) => (
                <Chip key={t} on={typeFilter === t} onClick={() => setTypeFilter(t)}>{t}</Chip>
              ))}
              <span className="ms-auto pm-prod-meta">{filtered.length} of {movements.length} entries</span>
            </div>
            <div className="table-responsive" style={{ maxHeight: 430, overflowY: "auto" }}>
              <table className="table pm-table align-middle">
                <thead><tr><th>Time</th><th>Type</th><th>SKU</th><th className="text-end">Δ Qty</th><th>Location</th><th className="text-end">Balance</th><th className="text-end">Value</th><th>Ref</th><th>By</th></tr></thead>
                <tbody>
                  {filtered.map((m) => {
                    const p = products.find((x) => x.id === m.productId);
                    return (
                      <tr key={m.id}>
                        <td className="pm-prod-meta" style={{ whiteSpace: "nowrap" }}>{m.time}</td>
                        <td>
                          <Badge tone={m.type === "Purchase" ? "green" : m.type === "Sale" ? "blue" : m.type.includes("Transfer") ? "slate" : m.type === "Return" ? "violet" : m.type === "Write-off" ? "red" : m.type === "Count" ? "slate" : "amber"}>{m.type}</Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span style={{ fontSize: "0.95rem" }}>{p?.emoji ?? "📦"}</span>
                            <div><div className="pm-prod-name">{p?.name ?? "—"}</div><div className="pm-prod-meta">{p?.sku ?? "—"}</div></div>
                          </div>
                        </td>
                        <td className={`text-end fw-bold ${m.qty > 0 ? "pm-qtypos" : "pm-qtyneg"}`}>{m.qty > 0 ? "+" : ""}{m.qty}</td>
                        <td className="pm-prod-meta">{locations.find((l) => l.id === m.locId)?.name}</td>
                        <td className="text-end">{m.balance}</td>
                        <td className="text-end pm-prod-meta">{fmtKES(m.value)}</td>
                        <td><span className="pm-mono pm-prod-meta">{m.ref}</span></td>
                        <td className="pm-prod-meta">{m.by}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <EmptyState icon="bi-search" title="No movements match" />}
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   8.7 EXPIRY, BATCHES & SERIALS
================================================================== */
export function ExpiryBatches() {
  const { batches, products, locations, openModal, toast } = useStore();
  const [tab, setTab] = useState<"expiring" | "batches" | "serials">("expiring");
  const expiring = [...batches].filter((b) => b.daysLeft < 60).sort((a, b) => a.daysLeft - b.daysLeft);
  const serials = [
    { sn: "SN-AH-0118", sku: "PRD-010", name: "Ankole Cow-Horn Mug", loc: "Main Warehouse", status: "Available" },
    { sn: "SN-AH-0119", sku: "PRD-010", name: "Ankole Cow-Horn Mug", loc: "Shop Floor", status: "Available" },
    { sn: "SN-AH-0117", sku: "PRD-010", name: "Ankole Cow-Horn Mug", loc: "—", status: "Sold · ORD-1088" },
  ];
  return (
    <>
      <Section no="8.7" title="Expiry, Batches &amp; Serial Numbers"
        sub="FEFO picking (first-expiry-first-out), batch traceability and serial tracking for high-value items."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("expirySettings")}>
              <i className="bi bi-bell me-1" /> Expiry alerts
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => openModal("writeoffWizard")}>
              <i className="bi bi-trash me-1" /> Write-off wizard
            </button>
          </>
        }
      />
      <div className="pm-card">
        <ul className="nav nav-tabs border-0 mb-2">
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "expiring" ? "active" : ""}`} onClick={() => setTab("expiring")}>Expiring soon <span className="badge bg-light text-secondary border ms-1">{expiring.length}</span></button></li>
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "batches" ? "active" : ""}`} onClick={() => setTab("batches")}>All batches <span className="badge bg-light text-secondary border ms-1">{batches.length}</span></button></li>
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "serials" ? "active" : ""}`} onClick={() => setTab("serials")}>Serial numbers <span className="badge bg-light text-secondary border ms-1">{serials.length}</span></button></li>
        </ul>

        {tab === "expiring" && (
          <div className="table-responsive">
            <table className="table pm-table align-middle">
              <thead><tr><th>Batch</th><th>Product</th><th>Expiry date</th><th>Days left</th><th className="text-end">Qty</th><th>Location</th><th>Action</th></tr></thead>
              <tbody>
                {expiring.map((b) => {
                  const p = products.find((x) => x.id === b.productId);
                  return (
                    <tr key={b.id}>
                      <td><span className="pm-mono fw-semibold">{b.batchNo}</span></td>
                      <td><div className="d-flex align-items-center gap-2"><span style={{ fontSize: "1rem" }}>{p?.emoji}</span><b style={{ fontSize: "0.82rem" }}>{p?.name}</b></div></td>
                      <td className="pm-prod-meta">{b.expiry}</td>
                      <td><Badge tone={b.daysLeft < 7 ? "red" : b.daysLeft < 30 ? "amber" : "green"}>{b.daysLeft}d</Badge></td>
                      <td className="text-end fw-bold">{b.qty}</td>
                      <td className="pm-prod-meta">{locations.find((l) => l.id === b.locId)?.name}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => openModal("writeoffWizard")}><i className="bi bi-trash me-1" />Write off</button>
                          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => toast(`FEFO: ${b.batchNo} moved to the front of the pick queue for ${p?.name}.`, "info", "Pick priority set")}><i className="bi bi-arrow-up-short me-1" />Sell first</button>
                          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => toast(`SELLFAST discount created on Products & Store for ${p?.name} — 15% off.`, "success", "Discount created")}><i className="bi bi-tag me-1" />Discount</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {expiring.length === 0 && <tr><td colSpan={7}><EmptyState icon="bi-check2-circle" title="No expiring stock" text="All batches have 60+ days left." /></td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {tab === "batches" && (
          <div className="table-responsive">
            <table className="table pm-table align-middle">
              <thead><tr><th>Batch</th><th>Product</th><th>Expiry</th><th className="text-end">Days left</th><th className="text-end">Qty</th><th>Location</th><th>Picking rule</th></tr></thead>
              <tbody>
                {[...batches].sort((a, b) => a.daysLeft - b.daysLeft).map((b) => {
                  const p = products.find((x) => x.id === b.productId);
                  return (
                    <tr key={b.id}>
                      <td><span className="pm-mono fw-semibold">{b.batchNo}</span></td>
                      <td><b style={{ fontSize: "0.82rem" }}>{p?.name}</b></td>
                      <td className="pm-prod-meta">{b.expiry}</td>
                      <td className="text-end"><Badge tone={b.daysLeft < 7 ? "red" : b.daysLeft < 30 ? "amber" : "green"}>{b.daysLeft}</Badge></td>
                      <td className="text-end fw-bold">{b.qty}</td>
                      <td className="pm-prod-meta">{locations.find((l) => l.id === b.locId)?.name}</td>
                      <td className="pm-prod-meta">FEFO — pick earliest expiry first</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === "serials" && (
          <div>
            <div className="pm-note soft mb-3"><i className="bi bi-upc-scan me-1" />Serialized SKUs: each unit has a unique number — perfect for warranties, returns verification and anti-fraud.</div>
            <div className="table-responsive">
              <table className="table pm-table align-middle">
                <thead><tr><th>Serial</th><th>Product</th><th>Location</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {serials.map((s) => (
                    <tr key={s.sn}>
                      <td><span className="pm-mono fw-semibold">{s.sn}</span></td>
                      <td><div className="d-flex align-items-center gap-2"><span>🏆</span><b style={{ fontSize: "0.82rem" }}>{s.name}</b><span className="pm-prod-meta">{s.sku}</span></div></td>
                      <td className="pm-prod-meta">{s.loc}</td>
                      <td><Badge tone={s.status === "Available" ? "green" : "slate"}>{s.status}</Badge></td>
                      <td><button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("scan")}><i className="bi bi-upc-scan me-1" />Scan</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ==================================================================
   8.8 RETURNS & DAMAGED STOCK
================================================================== */
export function ReturnsDamage() {
  const { returns, products, adjustments, openModal } = useStore();
  const [tab, setTab] = useState<"returns" | "damaged">("returns");
  const damaged = adjustments.filter((a) => ["Damage", "Theft", "Expired"].includes(a.type));
  const monthLoss = damaged.reduce((a, b) => a + Math.abs(b.value), 0);
  const monthUnits = damaged.reduce((a, b) => a + b.items.reduce((s, i) => s + Math.abs(i.qty), 0), 0);
  return (
    <>
      <Section no="8.8" title="Returns &amp; Damaged Stock"
        sub="Customer returns flow through inspection; damage and theft register here with reasons for your accountant."
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("returnsPolicy")}>
            <i className="bi bi-file-earmark-text me-1" /> Returns policy
          </button>
        }
      />
      <div className="pm-card">
        <ul className="nav nav-tabs border-0 mb-2">
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "returns" ? "active" : ""}`} onClick={() => setTab("returns")}>Customer returns <span className="badge bg-light text-secondary border ms-1">{returns.length}</span></button></li>
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "damaged" ? "active" : ""}`} onClick={() => setTab("damaged")}>Damaged &amp; shrinkage <span className="badge bg-light text-secondary border ms-1">{damaged.length}</span></button></li>
        </ul>

        {tab === "returns" ? (
          <div className="table-responsive">
            <table className="table pm-table align-middle">
              <thead><tr><th>Return</th><th>Order</th><th>Product</th><th className="text-end">Qty</th><th>Reason</th><th>Status</th><th className="text-end">Value</th><th>Action</th></tr></thead>
              <tbody>
                {returns.map((r) => {
                  const p = products.find((x) => x.id === r.productId);
                  return (
                    <tr key={r.id}>
                      <td><span className="pm-mono fw-semibold" style={{ fontSize: "0.8rem" }}>{r.id}</span></td>
                      <td><span className="pm-mono pm-prod-meta">{r.orderId}</span></td>
                      <td><div className="d-flex align-items-center gap-2"><span style={{ fontSize: "1rem" }}>{p?.emoji}</span><b style={{ fontSize: "0.82rem" }}>{p?.name}</b></div></td>
                      <td className="text-end">{r.qty}</td>
                      <td className="pm-prod-meta" style={{ maxWidth: 200 }}>{r.reason}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td className="text-end fw-bold">{fmtKES(r.value)}</td>
                      <td>
                        {r.status === "Pending inspection" || r.status === "Quarantined" ? (
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => openModal("returnWizard", { id: r.id })}>
                            <i className="bi bi-search me-1" /> Inspect
                          </button>
                        ) : (
                          <span className="badge-soft slate">{r.condition}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <div className="pm-stat-grid mb-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <div className="pm-card py-3" style={{ boxShadow: "none", background: "#fef2f2" }}>
                <div className="pm-kpi-label">Shrinkage this month</div>
                <div className="pm-kpi-value" style={{ color: "var(--pm-danger)" }}>{fmtKES(monthLoss)}</div>
                <div className="pm-prod-meta">{monthUnits} units · posted to ledger as expense</div>
              </div>
              <div className="pm-card py-3" style={{ boxShadow: "none" }}>
                <div className="pm-kpi-label">Top reason</div>
                <div className="fw-bold" style={{ fontSize: "1.1rem" }}>Transit damage · 58%</div>
                <div className="pm-prod-meta">courier handling — consider padding upgrade</div>
              </div>
              <div className="pm-card py-3" style={{ boxShadow: "none" }}>
                <div className="pm-kpi-label">Shrinkage rate</div>
                <div className="pm-kpi-value">0.42%</div>
                <div className="pm-prod-meta">industry avg 1.0% — you're doing well</div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table pm-table align-middle">
                <thead><tr><th>ID</th><th>Type</th><th>Items</th><th className="text-end">Units</th><th className="text-end">Loss</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {damaged.map((a) => (
                    <tr key={a.id} className="row-select" onClick={() => openModal("adjustmentDetail", { id: a.id })}>
                      <td><span className="pm-mono fw-semibold" style={{ fontSize: "0.8rem" }}>{a.id}</span></td>
                      <td><StatusBadge status={a.type} /></td>
                      <td className="pm-prod-meta">{a.items.map((it) => products.find((p) => p.id === it.productId)?.name.split(" ")[0]).join(", ")}</td>
                      <td className="text-end fw-bold">{a.items.reduce((s, i) => s + Math.abs(i.qty), 0)}</td>
                      <td className="text-end fw-bold pm-qtyneg">−KES {Math.abs(a.value).toLocaleString()}</td>
                      <td className="pm-prod-meta">{a.date}</td>
                      <td><button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }}><i className="bi bi-chevron-right" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-note mt-3"><i className="bi bi-shield-check me-1" />Shrinkage posts as a deductible expense and feeds Bookkeeping &amp; Taxes automatically.</div>
          </div>
        )}
      </div>
    </>
  );
}

/* ==================================================================
   WIZARD BANNER
================================================================== */
export function WizardsBanner() {
  const { openModal } = useStore();
  return (
    <div className="pm-card mt-4 d-flex flex-wrap align-items-center gap-3" style={{ background: "linear-gradient(90deg, #0b1322, #123a2c)", border: "none", color: "#fff" }}>
      <span style={{ fontSize: "1.6rem" }}>🧭</span>
      <div className="flex-grow-1" style={{ minWidth: 260 }}>
        <b style={{ fontSize: "0.95rem" }}>Guided flows on this page</b>
        <div style={{ color: "#b9c7d8", fontSize: "0.8rem" }}>
          Stock Count (4 steps) · Receive PO (3) · Transfer (3) · Adjustment (3) · Reorder (3) · Write-off (3) · Return inspection (4). Every one posts real ledger entries.
        </div>
      </div>
      <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("countWizard")}>
        <i className="bi bi-magic me-1" /> Start a guided flow
      </button>
    </div>
  );
}
