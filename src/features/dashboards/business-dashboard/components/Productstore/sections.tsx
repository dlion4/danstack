import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArcElement, BarController, BarElement, CategoryScale, Chart, DoughnutController, Filler,
  Legend, LinearScale, LineController, LineElement, PointElement, Tooltip,
} from "chart.js";
import { FUNNEL, ORDERS_30D, REVENUE_30D, THEMES, TRAFFIC, fmtKES } from "./data";
import type { OrderStatus } from "./data";
import { useStore } from "./store";
import { Badge, Chip, EmptyState, Kpi, Section, StatusBadge, StockBar, Thumb } from "./ui";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, BarController, BarElement, ArcElement, DoughnutController, Tooltip, Legend, Filler);

const DAYS = Array.from({ length: 30 }, (_, i) => `d${i + 1}`);

/* ==================================================================
   PAGE HEADER
================================================================== */
export function PageHeader() {
  const { openModal, config, setConfig, toast, recordActivity } = useStore();
  return (
    <div className="pm-banner-hero p-4 d-flex flex-wrap align-items-center gap-3">
      <div className="flex-grow-1" style={{ minWidth: 280 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="pm-zone"><i className="bi bi-box-seam" /> YOUR BUSINESS</span>
          <span className="badge-soft green">Page 7 · 7 sections</span>
        </div>
        <h1 className="mb-1" style={{ fontSize: "1.6rem", fontWeight: 800 }}>Products &amp; Online Store</h1>
        <p className="mb-0" style={{ color: "#b9c7d8", fontSize: "0.86rem", maxWidth: 620 }}>
          Your catalog, storefront, orders and store analytics — one command center.
          Every sale posts to the ledger and files to eTIMS automatically.
        </p>
      </div>
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <div className="d-flex align-items-center gap-2 me-2" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 99, padding: "0.3rem 0.9rem" }}>
          <span className="pm-dot-live" />
          <span className="fw-semibold" style={{ fontSize: "0.82rem" }}>{config.live ? "Store LIVE" : "Store paused"}</span>
          <div className="form-check form-switch mb-0 ms-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={config.live}
              onChange={(e) => {
                const live = e.target.checked;
                setConfig({ live });
                if (live) { recordActivity("Store set LIVE", "bi-broadcast"); toast("Store is LIVE again — visitors can order.", "success", "Store live"); }
                else { recordActivity("Store paused", "bi-pause-circle"); toast("Store paused — visitors see a coming-soon page.", "warning", "Store paused"); }
              }}
            />
          </div>
        </div>
        <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("preview")}>
          <i className="bi bi-eye me-1" /> Preview
        </button>
        <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("theme")}>
          <i className="bi bi-palette me-1" /> Customize
        </button>
        <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("import")}>
          <i className="bi bi-file-earmark-arrow-up me-1" /> Import
        </button>
        <button type="button" className="btn btn-light btn-sm text-white" style={{ background: "#f79009", border: "none" }} onClick={() => openModal("productWizard")}>
          <i className="bi bi-plus-lg me-1" /> Add Product
        </button>
      </div>
    </div>
  );
}

/* ==================================================================
   7.1 STORE COMMAND CENTER
================================================================== */
export function CommandCenter() {
  const { config, openModal, toast } = useStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels: DAYS,
        datasets: [{
          label: "Store revenue (KES '000)",
          data: REVENUE_30D,
          borderColor: "#12b76a",
          backgroundColor: "rgba(18,183,106,0.10)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5,
          borderWidth: 2.5,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => "KES " + Number(c.raw).toLocaleString() + ",000" } } },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 8, color: "#98a2b3", font: { size: 10 } } },
          y: { grid: { color: "#eef0f4" }, ticks: { color: "#98a2b3", font: { size: 10 }, callback: (v) => v + "K" } },
        },
      },
    });
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, []);

  const checks = [
    { ok: true, t: "Store live & SSL secured", act: () => openModal("domain") },
    { ok: config.payments.mpesa, t: "M-Pesa Express collecting", act: () => openModal("payments") },
    { ok: config.vatRegistered, t: "eTIMS validation active", act: () => openModal("etims") },
    { ok: config.zones.length > 0, t: "Shipping zones configured", act: () => openModal("shipping") },
    { ok: config.returnsPolicy, t: "Returns policy published", act: () => openModal("storeSettings") },
    { ok: true, t: "Discount codes running", act: () => openModal("discount") },
  ];

  return (
    <>
      <Section no="7.1" title="Store Command Center"
        sub="How the store is performing right now — revenue, orders, health and traffic. All figures KES, live from the ledger."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("exportReport")}>
              <i className="bi bi-download me-1" /> Export report
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("share")}>
              <i className="bi bi-share me-1" /> Share store
            </button>
          </>
        }
      />
      <div className="pm-stat-grid">
        <Kpi icon="bi-cash-stack" iconBg="var(--pm-green-soft)" label="Store revenue · 30d" value={fmtKES(486250)} delta="+18.2%" spark={REVENUE_30D} footer="vs previous 30 days" />
        <Kpi icon="bi-bag-check" iconBg="#e8f1fe" label="Orders · 30d" value="214" delta="+9.6%" spark={ORDERS_30D} sparkColor="#2e90fa" footer="average 7.1 orders / day" />
        <Kpi icon="bi-receipt" iconBg="#fef0c7" label="Average order value" value={fmtKES(2272)} delta="+4.1%" footer="best day: Fri 15th · KES 2,940" />
        <Kpi icon="bi-graph-up-arrow" iconBg="#f0ebfe" label="Checkout conversion" value="3.4%" delta="+0.3 pts" spark={[2.1, 2.2, 2.4, 2.3, 2.6, 2.8, 2.7, 3.0, 3.1, 3.2, 3.3, 3.4]} sparkColor="#7a5af8" footer="industry avg 2.1%" />
      </div>
      <div className="row g-3 mt-1">
        <div className="col-lg-8">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <div className="fw-bold" style={{ fontSize: "0.9rem" }}>Revenue — last 30 days</div>
                <div className="pm-prod-meta">KES 486,250 total · M-Pesa 68% · Card 21% · COD 11%</div>
              </div>
              <div className="d-flex gap-1">
                {["7d", "30d", "90d"].map((r, i) => (
                  <button key={r} type="button" className={`pm-chip ${i === 1 ? "on" : ""}`} onClick={() => toast(`Switched chart range to ${r} (demo data).`, "info", "Range changed")}>{r}</button>
                ))}
              </div>
            </div>
            <div style={{ height: 240 }}>
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="pm-card h-100">
            <div className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Store health checklist</div>
            {checks.map((c) => (
              <div key={c.t} className="d-flex align-items-center gap-2 py-1">
                <i className={`bi ${c.ok ? "bi-check-circle-fill text-primary" : "bi-exclamation-triangle-fill"}`} style={{ color: c.ok ? undefined : "var(--pm-warn)" }} />
                <span className="flex-grow-1" style={{ fontSize: "0.82rem" }}>{c.t}</span>
                <button type="button" className="btn btn-link btn-sm p-0" style={{ fontSize: "0.7rem" }} onClick={c.act}>Open →</button>
              </div>
            ))}
            <hr className="my-2" />
            <div className="pm-kpi-label mb-2">Traffic sources</div>
            {TRAFFIC.map((t) => (
              <div key={t.label} className="d-flex align-items-center gap-2 py-1">
                <span style={{ width: 9, height: 9, borderRadius: 3, background: t.color, display: "inline-block" }} />
                <span style={{ fontSize: "0.78rem" }} className="flex-grow-1">{t.label}</span>
                <b style={{ fontSize: "0.78rem" }}>{t.v}%</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   7.2 PRODUCT CATALOG
================================================================== */
export function Catalog() {
  const { products, openModal, updateProduct, toast, recordActivity, searchQuery, setSearchQuery } = useStore();
  const [tab, setTab] = useState<"All" | "Active" | "Draft" | "Out of stock" | "Archived">("All");
  const [cat, setCat] = useState("All categories");
  const [sortKey, setSortKey] = useState<"name" | "price" | "stock" | "sold30" | "updated">("updated");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [storeOnly, setStoreOnly] = useState(false);
  const [lowOnly, setLowOnly] = useState(false);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const cats = useMemo(() => ["All categories", ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  const counts = useMemo(() => ({
    All: products.length,
    Active: products.filter((p) => p.status === "Active").length,
    Draft: products.filter((p) => p.status === "Draft").length,
    "Out of stock": products.filter((p) => p.status === "Active" && p.stock === 0).length,
    Archived: products.filter((p) => p.status === "Archived").length,
  }), [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (tab === "Active") list = list.filter((p) => p.status === "Active");
    if (tab === "Draft") list = list.filter((p) => p.status === "Draft");
    if (tab === "Out of stock") list = list.filter((p) => p.status === "Active" && p.stock === 0);
    if (tab === "Archived") list = list.filter((p) => p.status === "Archived");
    if (cat !== "All categories") list = list.filter((p) => p.category === cat);
    if (storeOnly) list = list.filter((p) => p.listed);
    if (lowOnly) list = list.filter((p) => p.stock > 0 && p.stock <= p.reorderAt);
    const q = searchQuery.trim().toLowerCase();
    if (q) list = list.filter((p) => (p.name + p.sku + p.category + p.tags.join(" ")).toLowerCase().includes(q));
    list.sort((a, b) => {
      const av = sortKey === "updated" ? String(a.updated) : a[sortKey];
      const bv = sortKey === "updated" ? String(b.updated) : b[sortKey];
      const cmp = typeof av === "string" ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
      return cmp * sortDir;
    });
    return list;
  }, [products, tab, cat, storeOnly, lowOnly, searchQuery, sortKey, sortDir]);

  const toggleSel = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allChecked = filtered.length > 0 && filtered.every((p) => sel.has(p.id));
  const sort = (k: typeof sortKey) => { if (sortKey === k) setSortDir((d) => (d === 1 ? -1 : 1)); else { setSortKey(k); setSortDir(1); } };

  const setListedAll = (ids: string[], v: boolean) => {
    ids.forEach((id) => updateProduct(id, { listed: v }));
    recordActivity(`${ids.length} product(s) ${v ? "added to" : "removed from"} the online store`, "bi-globe2");
    toast(`${ids.length} product(s) ${v ? "added to" : "removed from"} the storefront.`, "info", "Store listing updated");
  };

  return (
    <>
      <Section no="7.2" title="Product Catalog"
        sub="Every SKU you sell — status, stock, pricing and storefront visibility. Select rows for bulk actions."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("categories")}>
              <i className="bi bi-tags me-1" /> Categories
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("import")}>
              <i className="bi bi-file-earmark-arrow-up me-1" /> Import CSV
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("productWizard")}>
              <i className="bi bi-plus-lg me-1" /> New Product
            </button>
          </>
        }
      />
      <div className="pm-card">
        {/* tabs + search */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <ul className="nav nav-tabs border-0 mb-0 flex-grow-1" style={{ minWidth: 320 }}>
            {(["All", "Active", "Draft", "Out of stock", "Archived"] as const).map((t) => (
              <li className="nav-item" key={t}>
                <button type="button" className={`nav-link ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                  {t} <span className={`badge ${tab === t ? "text-bg-dark" : "bg-light text-secondary border"}`}>{counts[t]}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="pm-search-box">
            <i className="bi bi-search" />
            <input id="catalog-search" className="form-control form-control-sm" style={{ width: 210 }} placeholder="Search name, SKU, tag…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("reorder")} title="Low-stock reorder wizard">
            <i className="bi bi-cart-plus me-1" /> Reorder
          </button>
        </div>
        {/* category chips */}
        <div className="d-flex flex-wrap gap-1 mb-2">
          {cats.map((c) => (
            <Chip key={c} on={cat === c} onClick={() => setCat(c)}>{c}</Chip>
          ))}
          <span className="ms-auto d-flex gap-3 align-items-center">
            <div className="form-check mb-0">
              <input className="form-check-input" type="checkbox" id="fStore" checked={storeOnly} onChange={(e) => setStoreOnly(e.target.checked)} />
              <label className="form-check-label pm-prod-meta" htmlFor="fStore">On store</label>
            </div>
            <div className="form-check mb-0">
              <input className="form-check-input" type="checkbox" id="fLow" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
              <label className="form-check-label pm-prod-meta" htmlFor="fLow">Low stock</label>
            </div>
          </span>
        </div>
        {/* bulk bar */}
        {sel.size > 0 && (
          <div className="d-flex flex-wrap align-items-center gap-2 p-2 mb-2" style={{ background: "var(--pm-green-soft)", borderRadius: 10 }}>
            <b style={{ fontSize: "0.8rem" }}>{sel.size} selected</b>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal("bulkPrice", { ids: [...sel] })}><i className="bi bi-sliders me-1" /> Bulk price</button>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setListedAll([...sel], true); setSel(new Set()); }}><i className="bi bi-globe2 me-1" /> Add to store</button>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setListedAll([...sel], false); setSel(new Set()); }}><i className="bi bi-eye-slash me-1" /> Hide from store</button>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("barcode", { ids: [...sel] })}><i className="bi bi-upc-scan me-1" /> Barcodes</button>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => openModal("archive", { ids: [...sel] })}><i className="bi bi-archive me-1" /> Archive</button>
            <button type="button" className="btn btn-sm btn-outline-secondary ms-auto" onClick={() => { setSel(new Set()); toast("Selection cleared.", "info"); }}>Clear</button>
          </div>
        )}
        {/* table */}
        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead>
              <tr>
                <th style={{ width: 34 }}>
                  <input className="form-check-input" type="checkbox" checked={allChecked} onChange={() => setSel(allChecked ? new Set() : new Set(filtered.map((p) => p.id)))} />
                </th>
                <th onClick={() => sort("name")} style={{ minWidth: 220 }}>Product {sortKey === "name" && <i className={`bi bi-caret-${sortDir === 1 ? "up" : "down"}-fill ms-1`} />}</th>
                <th>Category</th>
                <th onClick={() => sort("price")} className="text-end">Price {sortKey === "price" && <i className={`bi bi-caret-${sortDir === 1 ? "up" : "down"}-fill`} />}</th>
                <th onClick={() => sort("stock")} className="text-end">Stock {sortKey === "stock" && <i className={`bi bi-caret-${sortDir === 1 ? "up" : "down"}-fill`} />}</th>
                <th onClick={() => sort("sold30")} className="text-end">Sold 30d {sortKey === "sold30" && <i className={`bi bi-caret-${sortDir === 1 ? "up" : "down"}-fill`} />}</th>
                <th>VAT</th>
                <th>Status</th>
                <th>Store</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="row-select" onClick={() => openModal("quickView", { id: p.id })}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input className="form-check-input" type="checkbox" checked={sel.has(p.id)} onChange={() => toggleSel(p.id)} />
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Thumb img={p.img} emoji={p.emoji} />
                      <div style={{ minWidth: 0 }}>
                        <div className="pm-prod-name text-truncate" style={{ maxWidth: 230 }}>{p.name} {p.featured && <i className="bi bi-star-fill" style={{ color: "#f79009", fontSize: "0.7rem" }} />}</div>
                        <div className="pm-prod-meta">{p.sku} · {p.tags.slice(0, 2).map((t) => `#${t}`).join(" ") || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge tone="slate">{p.category}</Badge></td>
                  <td className="text-end">
                    <div className="fw-bold" style={{ fontSize: "0.82rem" }}>{fmtKES(p.price)}</div>
                    {p.compareAt && <div className="pm-prod-meta"><s>{fmtKES(p.compareAt)}</s> · {Math.round(((p.price - p.cost) / p.price) * 100)}% margin</div>}
                  </td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end">
                      <StockBar stock={p.stock} reorder={p.reorderAt} />
                    </div>
                    {p.onOrder ? <div className="pm-prod-meta">+{p.onOrder} on order</div> : null}
                  </td>
                  <td className="text-end">
                    <b style={{ fontSize: "0.82rem" }}>{p.sold30}</b>
                    {p.rating > 0 && <div className="pm-prod-meta">★ {p.rating} ({p.reviews})</div>}
                  </td>
                  <td><Badge tone="blue">{p.vat}</Badge></td>
                  <td><StatusBadge status={p.status} /></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={p.listed}
                        onChange={(e) => {
                          updateProduct(p.id, { listed: e.target.checked });
                          toast(`${p.name} ${e.target.checked ? "added to" : "hidden from"} the storefront.`, "info", "Listing updated");
                        }}
                      />
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="pm-dd">
                      <button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }} onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}>
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      {menuFor === p.id && (
                        <>
                          <div className="pm-overlay" onClick={() => setMenuFor(null)} />
                          <div className="pm-dd-menu" onClick={() => setMenuFor(null)}>
                            <button type="button" className="pm-dd-item" onClick={() => openModal("quickView", { id: p.id })}><i className="bi bi-eye" /> Quick view</button>
                            <button type="button" className="pm-dd-item" onClick={() => openModal("productWizard", { editId: p.id })}><i className="bi bi-pencil" /> Edit in wizard</button>
                            <button type="button" className="pm-dd-item" onClick={() => openModal("duplicate", { id: p.id })}><i className="bi bi-copy" /> Duplicate</button>
                            <button type="button" className="pm-dd-item" onClick={() => openModal("stock", { id: p.id })}><i className="bi bi-box-seam" /> Adjust stock</button>
                            <button type="button" className="pm-dd-item" onClick={() => openModal("barcode", { ids: [p.id] })}><i className="bi bi-upc-scan" /> Print barcode</button>
                            <hr />
                            {p.status === "Archived" ? (
                              <button type="button" className="pm-dd-item danger" onClick={() => openModal("delete", { id: p.id })}><i className="bi bi-trash" /> Delete permanently</button>
                            ) : (
                              <button type="button" className="pm-dd-item danger" onClick={() => openModal("archive", { ids: [p.id] })}><i className="bi bi-archive" /> Archive</button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <EmptyState icon="bi-search" title="No products match" text="Try a different tab, category or search term." action={
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => { setSearchQuery(""); setCat("All categories"); setTab("All"); }}>
              <i className="bi bi-x-circle me-1" /> Clear filters
            </button>
          } />
        )}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="pm-prod-meta">Showing {filtered.length} of {products.length} products · updated just now</div>
          <div className="pm-prod-meta d-none d-md-block"><i className="bi bi-keyboard me-1" />Enter → next step · Esc → close</div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   7.4 STORE BUILDER
================================================================== */
export function StoreBuilder() {
  const { config, setConfig, openModal, toast, discounts, recordActivity } = useStore();
  const t = THEMES.find((x) => x.id === config.theme) ?? THEMES[0];
  const sectionMeta: Record<string, { icon: string; label: string }> = {
    hero: { icon: "bi-image", label: "Hero banner" },
    announcement: { icon: "bi-megaphone", label: "Announcement bar" },
    featured: { icon: "bi-star", label: "Featured products" },
    categories: { icon: "bi-grid", label: "Category menu" },
    testimonials: { icon: "bi-chat-quote", label: "Testimonials" },
    newsletter: { icon: "bi-envelope", label: "Newsletter" },
    blog: { icon: "bi-journal", label: "Blog" },
  };
  return (
    <>
      <Section no="7.4" title="Store Builder &amp; Themes"
        sub="Design your storefront, manage sections, domain, checkout and delivery — no code, live preview."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("storeSettings")}>
              <i className="bi bi-gear me-1" /> Settings
            </button>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("theme")}>
              <i className="bi bi-palette me-1" /> Customize theme
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("preview")}>
              <i className="bi bi-eye me-1" /> Preview storefront
            </button>
          </>
        }
      />
      <div className="row g-3">
        {/* themes */}
        <div className="col-lg-7">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <b style={{ fontSize: "0.9rem" }}>Theme</b>
              <Badge tone="green">Active: {t.name} {t.emoji}</Badge>
            </div>
            <div className="row g-3">
              {THEMES.map((th) => (
                <div className="col-md-4" key={th.id}>
                  <div className={`pm-theme-card ${config.theme === th.id ? "sel" : ""}`} onClick={() => {
                    setConfig({ theme: th.id });
                    recordActivity(`Theme switched to ${th.name}`, "bi-palette");
                    toast(`“${th.name}” applied to your storefront.`, "success", "Theme applied");
                  }}>
                    <div className="pm-theme-thumb" style={{ background: th.vars.bg }}>
                      <span style={{ fontSize: "1.7rem" }}>{th.emoji}</span>
                      <div className="d-flex gap-1">
                        <span className="rounded-circle" style={{ width: 9, height: 9, background: th.vars.accent }} />
                        <span className="rounded-circle" style={{ width: 9, height: 9, background: th.vars.ink }} />
                        <span className="rounded-circle" style={{ width: 9, height: 9, background: th.vars.soft }} />
                      </div>
                    </div>
                    <div className="p-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <b style={{ fontSize: "0.8rem" }}>{th.name}</b>
                        {config.theme === th.id && <i className="bi bi-check-circle-fill text-primary" />}
                      </div>
                      <div className="pm-prod-meta" style={{ fontSize: "0.68rem" }}>{th.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-outline-secondary btn-sm mt-3" onClick={() => openModal("theme")}>
              <i className="bi bi-magic me-1" /> Deep customize (4-step wizard)
            </button>
          </div>
        </div>
        {/* sections toggles */}
        <div className="col-lg-5">
          <div className="pm-card h-100">
            <b style={{ fontSize: "0.9rem" }} className="d-block mb-3">Page sections</b>
            {Object.entries(sectionMeta).map(([k, m]) => (
              <div key={k} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <i className={`bi ${m.icon}`} style={{ color: "var(--pm-green-dark)" }} />
                <span className="flex-grow-1" style={{ fontSize: "0.84rem" }}>{m.label}</span>
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" checked={!!config.sections[k]} onChange={(e) => {
                    setConfig({ sections: { ...config.sections, [k]: e.target.checked } });
                    toast(`${m.label} ${e.target.checked ? "shown" : "hidden"} on the storefront.`, "info", "Section updated");
                  }} />
                </div>
              </div>
            ))}
            <div className="pm-note soft mt-3"><i className="bi bi-lightbulb me-1" />Turning the hero banner off removes the big banner but keeps search & categories.</div>
          </div>
        </div>
      </div>
      <div className="row g-3 mt-1">
        {/* domain */}
        <div className="col-lg-4">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between mb-2">
              <b style={{ fontSize: "0.9rem" }}><i className="bi bi-globe2 me-2" style={{ color: "var(--pm-green-dark)" }} />Domain</b>
              <Badge tone={config.customDomain ? "green" : "blue"}>{config.customDomain ? "Custom" : "Subdomain"}</Badge>
            </div>
            <div className="fw-bold">{config.customDomain ?? config.domain}</div>
            <div className="pm-prod-meta mb-2"><i className="bi bi-lock-fill me-1" />SSL active · auto-renewed · 0 downtime</div>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("domain")}>
              <i className="bi bi-plus-lg me-1" /> Connect custom domain
            </button>
          </div>
        </div>
        {/* payments */}
        <div className="col-lg-4">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between mb-2">
              <b style={{ fontSize: "0.9rem" }}><i className="bi bi-credit-card me-2" style={{ color: "var(--pm-green-dark)" }} />Checkout &amp; payments</b>
              <Badge tone="green">{Object.values(config.payments).filter(Boolean).length} rails</Badge>
            </div>
            <div className="d-flex gap-2 flex-wrap mb-2">
              {config.payments.mpesa && <Badge tone="green"><span className="pm-mp me-1">M</span> M-Pesa</Badge>}
              {config.payments.card && <Badge tone="blue">Card</Badge>}
              {config.payments.pesalink && <Badge tone="violet">PesaLink</Badge>}
              {config.payments.cod && <Badge tone="amber">COD</Badge>}
            </div>
            <div className="pm-prod-meta mb-2">Paybill {config.paybill} · Till {config.till} · guest checkout {config.guestCheckout ? "on" : "off"}</div>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("payments")}><i className="bi bi-gear me-1" /> Rails</button>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("checkout")}><i className="bi bi-bag-check me-1" /> Checkout</button>
            </div>
          </div>
        </div>
        {/* shipping */}
        <div className="col-lg-4">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between mb-2">
              <b style={{ fontSize: "0.9rem" }}><i className="bi bi-truck me-2" style={{ color: "var(--pm-green-dark)" }} />Delivery zones</b>
              <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={() => openModal("shipping")} style={{ fontSize: "0.74rem" }}>Edit</button>
            </div>
            {config.zones.map((z) => (
              <div key={z.name} className="d-flex justify-content-between py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <span style={{ fontSize: "0.82rem" }}>{z.name} <span className="pm-prod-meta">· {z.eta}</span></span>
                <b style={{ fontSize: "0.82rem" }}>{z.price ? fmtKES(z.price) : "Free"}</b>
              </div>
            ))}
            <div className="pm-prod-meta mt-2"><i className="bi bi-truck me-1" />Free delivery above {fmtKES(config.freeOver)}</div>
          </div>
        </div>
      </div>
      <div className="row g-3 mt-1">
        {/* discounts */}
        <div className="col-lg-7">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <b style={{ fontSize: "0.9rem" }}><i className="bi bi-ticket-perforated me-2" style={{ color: "var(--pm-green-dark)" }} />Discount codes</b>
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("discount")}>
                <i className="bi bi-plus-lg me-1" /> New discount
              </button>
            </div>
            {discounts.map((d) => (
              <div key={d.code} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <span className="badge-soft ink" style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>{d.code}</span>
                <span className="flex-grow-1" style={{ fontSize: "0.82rem" }}>{d.label}</span>
                <div className="text-end">
                  <Badge tone={d.status === "Active" ? "green" : d.status === "Scheduled" ? "amber" : "slate"}>{d.status}</Badge>
                  <div className="pm-prod-meta">{d.uses}/{d.cap} used</div>
                </div>
              </div>
            ))}
            <div className="pm-note soft mt-3"><i className="bi bi-graph-up me-1" />JULY15 drove KES 42,300 in extra sales this month.</div>
          </div>
        </div>
        {/* publish card */}
        <div className="col-lg-5">
          <div className="pm-card h-100" style={{ background: "linear-gradient(135deg, #0b1322, #123a2c)", color: "#fff", border: "none" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="pm-dot-live" />
              <b style={{ fontSize: "0.95rem" }}>{config.live ? "Your store is LIVE 🎉" : "Store is paused"}</b>
            </div>
            <p className="mb-3" style={{ color: "#b9c7d8", fontSize: "0.82rem" }}>
              {config.live ? `Customers are shopping at ${config.customDomain ?? config.domain}. Everything below is earning.` : "Visitors see a coming-soon page. Re-publish when ready."}
            </p>
            <div className="d-flex gap-2">
              {config.live ? (
                <button type="button" className="btn btn-outline-light btn-sm" onClick={() => openModal("pause")}>
                  <i className="bi bi-pause-fill me-1" /> Pause store
                </button>
              ) : (
                <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("publish")}>
                  <i className="bi bi-rocket-takeoff me-1" /> Publish now
                </button>
              )}
              <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("publish")}>
                <i className="bi bi-list-check me-1" /> Launch checklist
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   7.5 STORE ORDERS
================================================================== */
export function OrdersSection() {
  const { orders, openModal, toast } = useStore();
  const [tab, setTab] = useState<"All" | OrderStatus>("All");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: orders.length };
    (["New", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"] as OrderStatus[]).forEach((s) => { c[s] = orders.filter((o) => o.status === s).length; });
    return c;
  }, [orders]);

  const filtered = tab === "All" ? orders : orders.filter((o) => o.status === tab);
  const toggleSel = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <>
      <Section no="7.5" title="Store Orders &amp; Fulfilment"
        sub="Every order from the store, Instagram, WhatsApp or in person — payment, status and delivery in one desk."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => toast("Order CSV downloaded (12 rows).", "info", "Export complete")}>
              <i className="bi bi-download me-1" /> Export CSV
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("preview")}>
              <i className="bi bi-bag-plus me-1" /> Simulate order
            </button>
          </>
        }
      />
      <div className="pm-card">
        <ul className="nav nav-tabs border-0 mb-2">
          {(["All", "New", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"] as const).map((t) => (
            <li className="nav-item" key={t}>
              <button type="button" className={`nav-link ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t} <span className={`badge ${tab === t ? "text-bg-dark" : "bg-light text-secondary border"}`}>{counts[t]}</span>
              </button>
            </li>
          ))}
        </ul>
        {sel.size > 0 && (
          <div className="d-flex flex-wrap align-items-center gap-2 p-2 mb-2" style={{ background: "#e8f1fe", borderRadius: 10 }}>
            <b style={{ fontSize: "0.8rem" }}>{sel.size} selected</b>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { toast(`${sel.size} packing slips sent to printer.`, "success", "Printing"); setSel(new Set()); }}>
              <i className="bi bi-printer me-1" /> Print slips
            </button>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { toast("Dispatch PDFs emailed to your fulfilment team.", "info", "Sent"); setSel(new Set()); }}>
              <i className="bi bi-truck me-1" /> Dispatch batch
            </button>
            <button type="button" className="btn btn-sm btn-outline-secondary ms-auto" onClick={() => setSel(new Set())}>Clear</button>
          </div>
        )}
        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead>
              <tr>
                <th style={{ width: 34 }}><input className="form-check-input" type="checkbox" checked={filtered.length > 0 && filtered.every((o) => sel.has(o.id))} onChange={() => setSel(filtered.length > 0 && filtered.every((o) => sel.has(o.id)) ? new Set() : new Set(filtered.map((o) => o.id)))} /></th>
                <th>Order</th>
                <th>Customer</th>
                <th>Channel</th>
                <th className="text-end">Items</th>
                <th className="text-end">Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="row-select" onClick={() => openModal("orderDrawer", { id: o.id })}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input className="form-check-input" type="checkbox" checked={sel.has(o.id)} onChange={() => toggleSel(o.id)} />
                  </td>
                  <td>
                    <div className="fw-semibold" style={{ fontSize: "0.84rem" }}>{o.id}</div>
                    <div className="pm-prod-meta">{o.date}</div>
                  </td>
                  <td>
                    <div className="fw-semibold" style={{ fontSize: "0.84rem" }}>{o.customer}</div>
                    <div className="pm-prod-meta">{o.phone} · {o.location}</div>
                  </td>
                  <td><Badge tone={o.channel === "Online Store" ? "green" : o.channel === "Instagram" ? "violet" : o.channel === "WhatsApp" ? "green" : "slate"}>{o.channel}</Badge></td>
                  <td className="text-end">
                    <span className="d-inline-flex align-items-center gap-1">
                      {o.items.slice(0, 3).map((it, i) => <span key={i} title={it.name}>{it.emoji}</span>)}
                      <span className="pm-prod-meta">({o.items.reduce((a, b) => a + b.qty, 0)})</span>
                    </span>
                  </td>
                  <td className="text-end fw-bold" style={{ fontSize: "0.84rem" }}>{fmtKES(o.total + o.deliveryFee)}</td>
                  <td>
                    <Badge tone={o.payment === "M-Pesa" ? "green" : o.payment === "Card" ? "blue" : o.payment === "Cash on Delivery" ? "amber" : "violet"}>
                      {o.payment === "M-Pesa" ? <span className="pm-mp me-1">M</span> : null}
                      {o.payment}
                    </Badge>
                  </td>
                  <td><StatusBadge status={o.status} /></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="pm-dd">
                      <button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }} onClick={() => setMenuFor(menuFor === o.id ? null : o.id)}>
                        <i className="bi bi-three-dots-vertical" />
                      </button>
                      {menuFor === o.id && (
                        <>
                          <div className="pm-overlay" onClick={() => setMenuFor(null)} />
                          <div className="pm-dd-menu" onClick={() => setMenuFor(null)}>
                            <button type="button" className="pm-dd-item" onClick={() => openModal("orderDrawer", { id: o.id })}><i className="bi bi-eye" /> Open order</button>
                            <button type="button" className="pm-dd-item" onClick={() => openModal("orderStatus", { id: o.id, to: o.status === "New" ? "Processing" : "Shipped" })}><i className="bi bi-arrow-repeat" /> Update status</button>
                            <button type="button" className="pm-dd-item" onClick={() => openModal("packingSlip", { id: o.id })}><i className="bi bi-printer" /> Packing slip</button>
                            <hr />
                            {o.status !== "Refunded" && o.status !== "Cancelled" && (
                              <button type="button" className="pm-dd-item danger" onClick={() => openModal("refund", { id: o.id })}><i className="bi bi-arrow-counterclockwise" /> Refund</button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <EmptyState icon="bi-bag-check" title="No orders here" text="Orders in this status will appear as they come in." />
        )}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="pm-prod-meta">All orders are synced to Get Paid → Invoice Center and post to the ledger.</div>
          <div className="pm-prod-meta d-none d-md-block"><i className="bi bi-lightning-charge me-1" />M-Pesa payments confirmed in ~2s</div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   7.6 STORE PERFORMANCE
================================================================== */
export function Performance() {
  const { products, openModal, toast } = useStore();
  const barRef = useRef<HTMLCanvasElement | null>(null);
  const doughRef = useRef<HTMLCanvasElement | null>(null);
  const charts = useRef<Chart[]>([]);

  useEffect(() => {
    const mk = (el: HTMLCanvasElement | null, cfg: Record<string, unknown>) => {
      if (!el) return;
      charts.current.push(new Chart(el, cfg as never));
    };
    mk(barRef.current, {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: "Orders",
          data: [24, 28, 31, 26, 38, 41, 26],
          backgroundColor: "#12b76a",
          borderRadius: 8,
          maxBarThickness: 34,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false }, ticks: { color: "#98a2b3", font: { size: 10 } } }, y: { grid: { color: "#eef0f4" }, ticks: { color: "#98a2b3", font: { size: 10 } } } },
      },
    });
    mk(doughRef.current, {
      type: "doughnut",
      data: {
        labels: TRAFFIC.map((t) => t.label),
        datasets: [{ data: TRAFFIC.map((t) => t.v), backgroundColor: TRAFFIC.map((t) => t.color), borderWidth: 0, hoverOffset: 6 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "68%",
        plugins: { legend: { display: false } },
      },
    });
    return () => { charts.current.forEach((c) => c.destroy()); charts.current = []; };
  }, []);

  const top = [...products].filter((p) => p.sold30 > 0).sort((a, b) => b.sold30 - a.sold30).slice(0, 5);
  const maxSold = Math.max(...top.map((p) => p.sold30), 1);
  const funWidth = (v: number) => `${Math.max(8, (v / FUNNEL[0].v) * 100)}%`;
  const funColors = ["#12b76a", "#2e90fa", "#7a5af8", "#f79009", "#101828"];

  return (
    <>
      <Section no="7.6" title="Store Performance &amp; Analytics"
        sub="Where shoppers come from, what they buy, and where they drop off — so you can fix the leaks."
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("exportReport")}>
            <i className="bi bi-download me-1" /> Export report
          </button>
        }
      />
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="pm-card">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Orders per day — this week</div>
            <div style={{ height: 210 }}><canvas ref={barRef} /></div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="pm-card h-100">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Traffic sources</div>
            <div style={{ height: 160 }}><canvas ref={doughRef} /></div>
            <div className="pm-prod-meta text-center mt-2">6,310 visits this month</div>
          </div>
        </div>
        <div className="col-lg-3">
          <div className="pm-card h-100">
            <div className="fw-bold mb-3" style={{ fontSize: "0.9rem" }}>Conversion funnel</div>
            {FUNNEL.map((f, i) => (
              <div className="pm-funnel-row" key={f.label}>
                <div className="pm-funnel-head">
                  <span>{f.label}</span>
                  <span className="pm-prod-meta">
                    {f.v.toLocaleString()}
                    {i > 0 && <span className="ms-1">({Math.round((f.v / FUNNEL[i - 1].v) * 100)}%)</span>}
                  </span>
                </div>
                <div className="pm-funnel-bar" style={{ width: funWidth(f.v), background: funColors[i] }}>{i === 0 ? "100%" : `${Math.round((f.v / FUNNEL[i - 1].v) * 100)}%`}</div>
              </div>
            ))}
            <div className="pm-note soft mt-2" style={{ fontSize: "0.72rem" }}>
              <i className="bi bi-lightbulb me-1" />Biggest drop: product views → cart. Add “Buy now” buttons to product cards.
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <div className="pm-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <b style={{ fontSize: "0.9rem" }}>Top products — 30 days</b>
              <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={() => toast("Full product report queued (PDF).", "info", "Report")} style={{ fontSize: "0.74rem" }}>Full report</button>
            </div>
            {top.map((p, i) => (
              <div className="pm-toprow" key={p.id}>
                <span className="fw-bold pm-prod-meta" style={{ width: 18 }}>#{i + 1}</span>
                <Thumb img={p.img} emoji={p.emoji} size={36} />
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="fw-semibold text-truncate" style={{ fontSize: "0.82rem" }}>{p.name}</div>
                  <div className="pm-prod-meta">{p.sold30} sold · {fmtKES(p.price * p.sold30)} revenue</div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="progress" style={{ width: 90, height: 6 }}>
                    <div className="progress-bar" style={{ width: `${(p.sold30 / maxSold) * 100}%` }} />
                  </div>
                  <b style={{ fontSize: "0.8rem" }}>{p.sold30}</b>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-lg-5">
          <div className="pm-card h-100">
            <b style={{ fontSize: "0.9rem" }} className="d-block mb-2">Store intelligence</b>
            {[
              { icon: "bi-lightbulb", c: "#f79009", t: "Restock Ankole Horn Mug", d: "6 left · sells 1.7/day. Reorder now to avoid a gap.", act: () => openModal("reorder") },
              { icon: "bi-star", c: "#7a5af8", t: "Feature Beaded Bracelet Set", d: "Highest margin (63%) but not on homepage.", act: () => openModal("theme") },
              { icon: "bi-chat-dots", c: "#2e90fa", t: "Friday 6–9pm is peak", d: "Schedule your Instagram posts & WhatsApp broadcast then.", act: () => openModal("share") },
              { icon: "bi-graph-up", c: "#12b76a", t: "Free delivery lifted AOV 12%", d: "Orders above KES 5,000 grew since FREEDELIVERY went live.", act: () => openModal("discount") },
            ].map((r, i) => (
              <div key={i} className="d-flex gap-2 py-2" style={{ borderBottom: i < 3 ? "1px solid var(--pm-border)" : "none" }}>
                <span className="pm-kpi-icon" style={{ width: 32, height: 32, fontSize: "0.8rem", background: r.c + "22", color: r.c }}><i className={`bi ${r.icon}`} /></span>
                <div>
                  <div className="fw-semibold" style={{ fontSize: "0.82rem" }}>{r.t}</div>
                  <div className="pm-prod-meta">{r.d}</div>
                  <button type="button" className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: "0.7rem" }} onClick={r.act}>Act →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
