import { useMemo, useState } from "react";
import { IMG_LIBRARY, fmtKES } from "./data";
import type { Product } from "./data";
import { useStore } from "./store";
import { Badge, Chip, EmptyState, Field, Modal, Spark, StatusBadge, StockBar, Thumb, WizardShell } from "./ui";

type Step = { label: string; icon: string };
const P_STEPS: Step[] = [
  { label: "Basics", icon: "bi-info-circle" },
  { label: "Pricing & Tax", icon: "bi-cash-coin" },
  { label: "Variants", icon: "bi-layers" },
  { label: "Inventory", icon: "bi-box-seam" },
  { label: "Media & Listing", icon: "bi-images" },
  { label: "Review & Publish", icon: "bi-check2-circle" },
];

/* ==================================================================
   PRODUCT WIZARD — 6-step guided flow (create & edit)
================================================================== */
export function ProductWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, saveProduct, recordActivity, toast } = useStore();
  const editId = String(payload.editId ?? "");
  const src = products.find((p) => p.id === editId);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(src?.name ?? "");
  const [desc, setDesc] = useState(src ? `${src.name} — crafted for the Kenyan market, eTIMS validated.` : "");
  const [category, setCategory] = useState(src?.category ?? "Food & Beverage");
  const [supplier, setSupplier] = useState(src?.supplier ?? "");
  const [tags, setTags] = useState(src ? src.tags.join(", ") : "");

  const [price, setPrice] = useState(src ? String(src.price) : "");
  const [compareAt, setCompareAt] = useState(src?.compareAt ? String(src.compareAt) : "");
  const [cost, setCost] = useState(src ? String(src.cost) : "");
  const [vat, setVat] = useState(src?.vat ?? "16%");
  const [etims, setEtims] = useState(src?.eTims ?? "0901.21.00");

  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<{ name: string; sku: string; price: number; stock: number }[]>([
    { name: "Small", sku: "", price: 0, stock: 0 },
    { name: "Medium", sku: "", price: 0, stock: 0 },
  ]);

  const [trackStock, setTrackStock] = useState(true);
  const [stock, setStock] = useState(src ? String(src.stock) : "50");
  const [reorder, setReorder] = useState(src ? String(src.reorderAt) : "10");
  const [onOrder, setOnOrder] = useState(src ? String(src.onOrder ?? 0) : "0");
  const [sku, setSku] = useState(src?.sku ?? "");

  const [img, setImg] = useState(src?.img ?? IMG_LIBRARY[0].url);
  const [emoji, setEmoji] = useState(src?.emoji ?? "🧺");
  const [listed, setListed] = useState(src?.listed ?? true);
  const [featured, setFeatured] = useState(src?.featured ?? false);
  const [seo, setSeo] = useState("");

  const [finalStatus, setFinalStatus] = useState<"Active" | "Draft">(src?.status === "Draft" ? "Draft" : "Active");

  const categories = useMemo(() => Array.from(new Set(["Food & Beverage", "Crafts & Art", "Fashion & Apparel", "Home & Living", "Beauty & Wellness", ...products.map((p) => p.category)])), [products]);

  const priceNum = Number(price) || 0;
  const costNum = Number(cost) || 0;
  const margin = priceNum > 0 ? Math.round(((priceNum - costNum) / priceNum) * 100) : 0;
  const canNext =
    step === 0 ? name.trim().length > 1 && category !== "" :
    step === 1 ? priceNum > 0 && costNum >= 0 :
    true;

  const nextSku = useMemo(() => {
    if (sku) return sku;
    const maxN = products.reduce((m, p) => {
      const n = parseInt(p.sku.replace(/\D/g, ""), 10);
      return Number.isFinite(n) ? Math.max(m, n) : m;
    }, 0);
    return `PRD-${String(maxN + 1).padStart(3, "0")}`;
  }, [sku, products]);

  const finish = (status: "Active" | "Draft") => {
    const finalSku = sku || nextSku;
    const product: Product = {
      id: src?.id ?? "p" + Date.now(),
      name: name.trim(),
      sku: finalSku,
      category,
      price: priceNum,
      compareAt: compareAt ? Number(compareAt) : null,
      cost: costNum,
      stock: trackStock ? Number(stock) || 0 : 0,
      reorderAt: Number(reorder) || 0,
      vat,
      status,
      listed: status === "Active" ? listed : false,
      featured: status === "Active" ? featured : false,
      img,
      emoji,
      sold30: src?.sold30 ?? 0,
      rating: src?.rating ?? 0,
      reviews: src?.reviews ?? 0,
      supplier: supplier || "—",
      eTims: etims || "0901.21.00",
      updated: "Just now",
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      onOrder: Number(onOrder) || 0,
    };
    saveProduct(product);
    recordActivity(`${src ? "Updated" : "Created"} product “${product.name}” (${product.sku})`, "bi-box-seam");
    toast(`${product.name} ${src ? "updated" : "created"} as ${status === "Active" ? "Active — live on storefront" : "Draft"}.`, "success", src ? "Product updated" : "Product created");
    onClose();
  };

  const foot = (
    <>
      <button type="button" className="btn btn-outline-secondary me-auto" onClick={() => { toast("Progress autosaved as draft — find it in the Draft tab.", "info", "Saved as draft"); onClose(); }}>
        Save as Draft
      </button>
      {step > 0 && (
        <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => Math.max(0, s - 1))}>
          <i className="bi bi-arrow-left me-1" /> Back
        </button>
      )}
      {step < P_STEPS.length - 1 ? (
        <button type="button" className="btn btn-primary" disabled={!canNext} onClick={() => { if (canNext) setStep((s) => s + 1); }}>
          Next step <i className="bi bi-arrow-right ms-1" />
        </button>
      ) : (
        <button type="button" className="btn btn-primary" onClick={() => finish(finalStatus)}>
          <i className={`bi ${finalStatus === "Draft" ? "bi-save" : "bi-rocket-takeoff"} me-1`} />
          {finalStatus === "Draft" ? "Save as Draft" : src ? "Save & Update" : "Create & Publish"}
        </button>
      )}
    </>
  );

  return (
    <Modal
      open
      onClose={onClose}
      title={src ? `Edit product — ${src.name}` : "New product"}
      subtitle="Product Wizard · autosaves to drafts · eTIMS validated on publish"
      icon="bi-box-seam"
      size="lg"
      footer={foot}
      hideClose
    >
      <WizardShell steps={P_STEPS} current={step} onStep={(i) => i < step && setStep(i)}>
        {/* STEP 1 — BASICS */}
        {step === 0 && (
          <div className="row g-3">
            <Field label="Product name *" className="col-12" hint="Shown on the storefront, invoices and eTIMS receipts.">
              <input className="form-control" placeholder="e.g. Handwoven Kiondo Basket" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <Field label="Category *" className="col-md-6">
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Supplier / artisan" className="col-md-6" hint="Links to Pay Suppliers PO records.">
              <input className="form-control" placeholder="e.g. Kitui Weavers Sacco" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
            </Field>
            <Field label="Description" className="col-12">
              <textarea className="form-control" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
            </Field>
            <Field label="Tags" className="col-12" hint="Comma separated — used for collections & search.">
              <input className="form-control" placeholder="Handmade, Gift, Featured" value={tags} onChange={(e) => setTags(e.target.value)} />
            </Field>
          </div>
        )}

        {/* STEP 2 — PRICING & TAX */}
        {step === 1 && (
          <div>
            <div className="row g-3">
              <Field label="Selling price (KES) *" className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text">KES</span>
                  <input type="number" min={0} className="form-control" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </Field>
              <Field label="Compare-at price" className="col-md-4" hint="Strikethrough price shown on store.">
                <div className="input-group">
                  <span className="input-group-text">KES</span>
                  <input type="number" min={0} className="form-control" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} />
                </div>
              </Field>
              <Field label="Cost per unit" className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text">KES</span>
                  <input type="number" min={0} className="form-control" value={cost} onChange={(e) => setCost(e.target.value)} />
                </div>
              </Field>
              <Field label="VAT rate" className="col-md-4" hint="VAT-registered business — 16% default per KRA.">
                <select className="form-select" value={vat} onChange={(e) => setVat(e.target.value)}>
                  <option>16%</option>
                  <option>0%</option>
                  <option>Exempt</option>
                </select>
              </Field>
              <Field label="eTIMS / HSC code" className="col-md-4" hint="Auto-validated against KRA iTax on save.">
                <input className="form-control" value={etims} onChange={(e) => setEtims(e.target.value)} />
              </Field>
            </div>
            <div className="pm-note mt-3 d-flex align-items-center gap-2">
              <i className="bi bi-calculator" />
              <span>
                Live margin: <b>{margin}%</b> · You keep <b>{fmtKES(priceNum - costNum)}</b> of every {fmtKES(priceNum)} sale
                {vat === "16%" && <> (excl. VAT on receipt)</>}.
              </span>
            </div>
          </div>
        )}

        {/* STEP 3 — VARIANTS */}
        {step === 2 && (
          <div>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" id="hasVar" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} />
              <label className="form-check-label" htmlFor="hasVar">This product has variants (size, colour, weight…)</label>
            </div>
            {!hasVariants ? (
              <EmptyState icon="bi-layers" title="Single variant" text="No size or colour options — one SKU covers this product." />
            ) : (
              <div>
                <div className="table-responsive">
                  <table className="table pm-table align-middle">
                    <thead><tr><th>Option</th><th>SKU</th><th>Price (KES)</th><th>Stock</th><th></th></tr></thead>
                    <tbody>
                      {variants.map((v, i) => (
                        <tr key={i}>
                          <td>
                            <input className="form-control form-control-sm" value={v.name} onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                          </td>
                          <td>
                            <input className="form-control form-control-sm" placeholder={`${nextSku}-${i + 1}`} value={v.sku} onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, sku: e.target.value } : x)))} />
                          </td>
                          <td>
                            <input type="number" className="form-control form-control-sm" value={v.price || ""} onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)))} />
                          </td>
                          <td>
                            <input type="number" className="form-control form-control-sm" value={v.stock} onChange={(e) => setVariants((vs) => vs.map((x, j) => (j === i ? { ...x, stock: Number(e.target.value) } : x)))} />
                          </td>
                          <td>
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))}><i className="bi bi-trash" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setVariants((vs) => [...vs, { name: "", sku: "", price: 0, stock: 0 }])}>
                  <i className="bi bi-plus-lg me-1" /> Add option
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — INVENTORY */}
        {step === 3 && (
          <div className="row g-3">
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="track" checked={trackStock} onChange={(e) => setTrackStock(e.target.checked)} />
                <label className="form-check-label" htmlFor="track">Track inventory on this product (syncs with Inventory &amp; Stock page)</label>
              </div>
            </div>
            {trackStock && (
              <>
                <Field label="Quantity on hand" className="col-md-4">
                  <input type="number" min={0} className="form-control" value={stock} onChange={(e) => setStock(e.target.value)} />
                </Field>
                <Field label="Low-stock alert at" className="col-md-4" hint="We'll ping you on WhatsApp & the dashboard.">
                  <input type="number" min={0} className="form-control" value={reorder} onChange={(e) => setReorder(e.target.value)} />
                </Field>
                <Field label="Units on order (PO)" className="col-md-4">
                  <input type="number" min={0} className="form-control" value={onOrder} onChange={(e) => setOnOrder(e.target.value)} />
                </Field>
              </>
            )}
            <Field label="SKU" className="col-md-4" hint="Auto-generated — override if needed.">
              <input className="form-control" placeholder={nextSku} value={sku} onChange={(e) => setSku(e.target.value)} />
            </Field>
          </div>
        )}

        {/* STEP 5 — MEDIA & LISTING */}
        {step === 4 && (
          <div>
            <Field label="Product photo" hint="Pick from your media library (demo assets)." className="mb-2">
              <div className="d-flex flex-wrap gap-2">
                {IMG_LIBRARY.map((m) => (
                  <button
                    key={m.url}
                    type="button"
                    onClick={() => setImg(m.url)}
                    className="p-0 border-0 bg-transparent"
                    style={{ borderRadius: 10, outline: img === m.url ? "2px solid var(--pm-green)" : "1px solid var(--pm-border)", outlineOffset: 1 }}
                    title={m.label}
                  >
                    <img src={m.url} alt={m.label} style={{ width: 62, height: 46, objectFit: "cover", borderRadius: 8, display: "block" }} />
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Emoji fallback" className="col-md-4 mt-3">
              <input className="form-control" value={emoji} onChange={(e) => setEmoji(e.target.value)} />
            </Field>
            <Field label="SEO / listing title" className="col-md-8 mt-3" hint="Used in store search results and Google.">
              <input className="form-control" placeholder={name || "Listing title"} value={seo} onChange={(e) => setSeo(e.target.value)} />
            </Field>
            <div className="d-flex gap-3 mt-3">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="listed" checked={listed} onChange={(e) => setListed(e.target.checked)} />
                <label className="form-check-label" htmlFor="listed">List on online store</label>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                <label className="form-check-label" htmlFor="featured">Feature on homepage</label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6 — REVIEW */}
        {step === 5 && (
          <div>
            <div className="d-flex gap-3 align-items-center mb-3">
              <Thumb img={img} emoji={emoji} size={64} />
              <div className="flex-grow-1">
                <div className="fw-bold">{name || "Untitled product"}</div>
                <div className="pm-prod-meta">{category} · {nextSku} · eTIMS {etims}</div>
                <div className="d-flex gap-2 mt-1">
                  <Badge tone="green">KES {priceNum.toLocaleString()}</Badge>
                  {compareAt && <Badge tone="slate"><s>KES {Number(compareAt).toLocaleString()}</s></Badge>}
                  <Badge tone={vat === "16%" ? "blue" : "slate"}>{vat} VAT</Badge>
                </div>
              </div>
              <div>
                <select className="form-select form-select-sm" value={finalStatus} onChange={(e) => setFinalStatus(e.target.value as "Active" | "Draft")}>
                  <option value="Active">Publish as Active</option>
                  <option value="Draft">Keep as Draft</option>
                </select>
              </div>
            </div>
            <div className="pm-note soft mb-3">
              <i className="bi bi-shield-check me-1 text-primary" />
              This product will be validated against KRA eTIMS before appearing on receipts. Tax: {vat} · Margin: {margin}%.
            </div>
            <div className="row g-3">
              <div className="col-6">
                <div className="pm-card" style={{ boxShadow: "none" }}>
                  <div className="pm-kpi-label">Storefront</div>
                  <div className="fw-semibold">{listed ? "Listed on online store" : "Hidden from store"}</div>
                  <div style={{ fontSize: "0.74rem", color: "var(--pm-muted)" }}>{featured ? "⭐ Featured on homepage" : "Not featured"}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="pm-card" style={{ boxShadow: "none" }}>
                  <div className="pm-kpi-label">Inventory</div>
                  <div className="fw-semibold">{trackStock ? `${stock} units · alert at ${reorder}` : "Not tracked"}</div>
                  <div style={{ fontSize: "0.74rem", color: "var(--pm-muted)" }}>{hasVariants ? `${variants.length} variants configured` : "Single variant"} · {tags ? tags.split(",").length : 0} tags</div>
                </div>
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setStep(1)}><i className="bi bi-arrow-left me-1" /> Pricing</button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setStep(4)}><i className="bi bi-arrow-left me-1" /> Media</button>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   QUICK VIEW
================================================================== */
export function QuickViewModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, openModal } = useStore();
  const p = products.find((x) => x.id === String(payload.id));
  if (!p) return null;
  const sales = [6, 9, 8, 12, 11, 15, 14, 18, 17, 20, 22, 21];
  return (
    <Modal open onClose={onClose} title={p.name} subtitle={`${p.sku} · ${p.category}`} icon="bi-eye" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => openModal("productWizard", { editId: p.id })}>
            <i className="bi bi-pencil me-1" /> Edit in Wizard
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => openModal("stock", { id: p.id })}>
            <i className="bi bi-box-seam me-1" /> Adjust Stock
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { onClose(); openModal("barcode", { ids: [p.id] }); }}>
            <i className="bi bi-upc-scan me-1" /> Print Barcode
          </button>
        </>
      }
    >
      <div className="d-flex gap-3 flex-wrap">
        <Thumb img={p.img} emoji={p.emoji} size={120} />
        <div className="flex-grow-1" style={{ minWidth: 240 }}>
          <div className="d-flex gap-2 align-items-center flex-wrap mb-2">
            <StatusBadge status={p.status} />
            {p.listed && <Badge tone="green"><i className="bi bi-globe2 me-1" /> On store</Badge>}
            {p.featured && <Badge tone="amber"><i className="bi bi-star-fill me-1" /> Featured</Badge>}
            {p.stock === 0 ? <Badge tone="red">Out of stock</Badge> : p.stock <= p.reorderAt ? <Badge tone="amber">Low stock</Badge> : null}
          </div>
          <div className="d-flex align-items-baseline gap-2">
            <span className="fs-4 fw-bold">{fmtKES(p.price)}</span>
            {p.compareAt && <span className="text-decoration-line-through" style={{ color: "var(--pm-muted)" }}>{fmtKES(p.compareAt)}</span>}
            <span className="pm-prod-meta">cost {fmtKES(p.cost)} · margin {Math.round(((p.price - p.cost) / p.price) * 100)}%</span>
          </div>
          <div className="d-flex gap-4 mt-2 flex-wrap">
            <div><div className="pm-kpi-label">Sold (30d)</div><b>{p.sold30}</b></div>
            <div><div className="pm-kpi-label">Rating</div><b>{"★".repeat(Math.round(p.rating))} {p.rating}</b> <span className="pm-prod-meta">({p.reviews})</span></div>
            <div><div className="pm-kpi-label">Supplier</div><b className="fs-6">{p.supplier}</b></div>
            <div><div className="pm-kpi-label">eTIMS code</div><b className="fs-6">{p.eTims} ✓</b></div>
          </div>
          {p.tags.length > 0 && (
            <div className="d-flex gap-1 mt-2 flex-wrap">
              {p.tags.map((t) => <Badge key={t} tone="slate">#{t}</Badge>)}
            </div>
          )}
        </div>
      </div>
      <div className="row g-3 mt-3">
        <div className="col-md-5">
          <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
            <div className="pm-kpi-label mb-1">Stock level</div>
            <StockBar stock={p.stock} reorder={p.reorderAt} />
            <div className="pm-prod-meta mt-2">Reorder at {p.reorderAt} units · {p.onOrder ? `${p.onOrder} on order via PO` : "No open POs"}</div>
          </div>
        </div>
        <div className="col-md-7">
          <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
            <div className="pm-kpi-label mb-1">Sales trend — last 12 weeks</div>
            <Spark data={sales} w={300} h={56} />
          </div>
        </div>
      </div>
      <div className="pm-note soft mt-3">
        <i className="bi bi-receipt me-1" />
        Last updated {p.updated}. Every sale of this SKU posts to the General Ledger and eTIMS filing automatically.
      </div>
    </Modal>
  );
}

/* ==================================================================
   DUPLICATE / ARCHIVE / STOCK / BARCODE / REORDER / BULK / IMPORT / CATEGORIES
================================================================== */
export function DuplicateConfirmModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, duplicateProduct, toast } = useStore();
  const p = products.find((x) => x.id === String(payload.id));
  if (!p) return null;
  return (
    <Modal open onClose={onClose} title="Duplicate product" icon="bi-copy" size="sm"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            const copy = duplicateProduct(p.id);
            if (copy) toast(`${copy.name} created as Draft — SKU ${copy.sku}.`, "success", "Duplicated");
            onClose();
          }}>
            <i className="bi bi-copy me-1" /> Duplicate
          </button>
        </>
      }
    >
      <p className="mb-1">“{p.name}” will be copied into a new <Badge tone="slate">Draft</Badge> product with the same pricing, media and settings.</p>
      <p className="mb-0 pm-prod-meta">Sales history, ratings and reviews are not copied.</p>
    </Modal>
  );
}

export function ArchiveConfirmModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, archiveProducts, toast, recordActivity } = useStore();
  const ids = (payload.ids as string[]) ?? [];
  const names = products.filter((p) => ids.includes(p.id)).map((p) => p.name);
  const single = names.length === 1;
  return (
    <Modal open onClose={onClose} title={single ? "Archive product?" : `Archive ${names.length} products?`} icon="bi-archive" size="sm"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-danger" onClick={() => {
            archiveProducts(ids);
            recordActivity(`Archived ${names.length} product(s): ${names.join(", ")}`, "bi-archive");
            toast(single ? `${names[0]} archived.` : `${names.length} products archived.`, "info", "Archived");
            onClose();
          }}>
            <i className="bi bi-archive me-1" /> Archive
          </button>
        </>
      }
    >
      <p className="mb-1">{single ? <b>{names[0]}</b> : <b>{names.join(", ")}</b>} will be hidden from the storefront and the active catalog.</p>
      <p className="mb-0 pm-prod-meta">Nothing is deleted — you can restore from the Archived tab any time.</p>
    </Modal>
  );
}

export function StockAdjustModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, adjustStock, recordActivity, toast } = useStore();
  const p = products.find((x) => x.id === String(payload.id));
  const [mode, setMode] = useState("receive");
  const [qty, setQty] = useState("10");
  const [note, setNote] = useState("");
  if (!p) return null;
  const q = Number(qty) || 0;
  const newStock = mode === "receive" ? p.stock + q : mode === "count" ? q : p.stock - q;
  return (
    <Modal open onClose={onClose} title="Adjust stock" subtitle={`${p.name} · current: ${p.stock} units`} icon="bi-box-seam"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={q <= 0} onClick={() => {
            const diff = newStock - p.stock;
            adjustStock(p.id, diff, note || (diff >= 0 ? `Received ${diff} units` : `Removed ${-diff} units`));
            recordActivity(`Stock adjusted on ${p.name}: ${diff >= 0 ? "+" : ""}${diff}`, "bi-box-seam");
            toast(`${p.name} stock → ${newStock} units.`, "success", "Stock updated");
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Save ({newStock})
          </button>
        </>
      }
    >
      <div className="row g-3">
        <div className="col-12">
          <div className="d-flex gap-2 flex-wrap">
            {[
              { id: "receive", label: "Receive stock (PO)", icon: "bi-arrow-down-circle" },
              { id: "remove", label: "Remove (damage / theft)", icon: "bi-arrow-up-circle" },
              { id: "count", label: "Set from stock count", icon: "bi-sliders" },
            ].map((m) => (
              <Chip key={m.id} on={mode === m.id} onClick={() => setMode(m.id)}>
                <i className={`bi ${m.icon} me-1`} /> {m.label}
              </Chip>
            ))}
          </div>
        </div>
        <Field label={mode === "count" ? "Correct count" : "Quantity"} className="col-md-6">
          <input type="number" min={1} className="form-control" value={qty} onChange={(e) => setQty(e.target.value)} />
        </Field>
        <Field label="Note" className="col-md-6">
          <input className="form-control" placeholder="e.g. PO-1042 delivery" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </div>
      <div className="pm-note mt-3">New on-hand: <b>{newStock}</b> units {newStock <= p.reorderAt && newStock > 0 ? "— still below reorder level ⚠️" : newStock === 0 ? "— OUT OF STOCK" : ""}</div>
    </Modal>
  );
}

export function BarcodeModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, toast } = useStore();
  const preselect = (payload.ids as string[]) ?? [];
  const [sel, setSel] = useState<string[]>(preselect.length ? preselect : products.filter((p) => p.status === "Active").slice(0, 6).map((p) => p.id));
  const [size, setSize] = useState("50 × 25 mm");
  const [copies, setCopies] = useState("1");
  const chosen = products.filter((p) => sel.includes(p.id));
  const bars = (sku: string) => sku.split("").map((c, i) => ({ w: (c.charCodeAt(0) % 3) + 1, k: i }));
  return (
    <Modal open onClose={onClose} title="Print barcodes" subtitle="EAN-style labels with SKU — for shelf & inventory counts" icon="bi-upc-scan" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={chosen.length === 0} onClick={() => { toast(`Sent ${chosen.length} barcode label(s) to your label printer (${size}, ×${copies}).`, "success", "Printing"); onClose(); }}>
            <i className="bi bi-printer me-1" /> Print {chosen.length} label{chosen.length > 1 ? "s" : ""}
          </button>
        </>
      }
    >
      <div className="row g-3">
        <Field label="Label size" className="col-md-6">
          <select className="form-select" value={size} onChange={(e) => setSize(e.target.value)}>
            <option>50 × 25 mm</option>
            <option>40 × 20 mm</option>
            <option>A4 sheet (30 labels)</option>
          </select>
        </Field>
        <Field label="Copies per product" className="col-md-6">
          <input type="number" min={1} className="form-control" value={copies} onChange={(e) => setCopies(e.target.value)} />
        </Field>
      </div>
      <div className="mt-3 d-flex flex-wrap gap-2">
        {products.filter((p) => p.status === "Active").map((p) => (
          <Chip key={p.id} on={sel.includes(p.id)} onClick={() => setSel((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))}>
            {p.emoji} {p.sku}
          </Chip>
        ))}
      </div>
      <div className="row g-3 mt-1">
        {chosen.map((p) => (
          <div className="col-md-6" key={p.id}>
            <div className="pm-card" style={{ boxShadow: "none", background: "#fafbfd" }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <b style={{ fontSize: "0.8rem" }}>{p.name}</b>
                <span className="pm-prod-meta">{fmtKES(p.price)}</span>
              </div>
              <div className="pm-barcode">
                {bars(p.sku).map((b) => (
                  <div key={b.k} className={`bar ${b.w === 1 ? "thin" : ""}`} style={{ width: `${b.w * 2}px` }} />
                ))}
              </div>
              <div className="text-center mt-1" style={{ fontSize: "0.72rem", letterSpacing: "0.12em", color: "var(--pm-muted)" }}>{p.sku}</div>
            </div>
          </div>
        ))}
        {chosen.length === 0 && <EmptyState icon="bi-upc-scan" title="No products selected" text="Tap product chips above to add labels." />}
      </div>
    </Modal>
  );
}

export function ReorderPOModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, updateProduct, recordActivity, toast } = useStore();
  const low = products.filter((p) => p.status === "Active" && p.stock <= p.reorderAt);
  const pre = (payload.ids as string[]) ?? [];
  const list = pre.length ? products.filter((p) => pre.includes(p.id)) : low;
  const [step, setStep] = useState(0);
  const [qtys, setQtys] = useState<Record<string, number>>(Object.fromEntries(list.map((p) => [p.id, Math.max(p.reorderAt * 2 - p.stock, 5)])));
  const [supplier, setSupplier] = useState(list[0]?.supplier ?? "Kitui Weavers Sacco");
  const [date, setDate] = useState("2026-08-05");
  const [note, setNote] = useState("");
  const totalQty = Object.values(qtys).reduce((a, b) => a + b, 0);
  const poNo = `PO-${1043 + Math.floor(Math.random() * 3)}`;
  return (
    <Modal open onClose={onClose} title="Create purchase order" subtitle="Restock low inventory — links to Pay Suppliers" icon="bi-cart-plus" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step === 0 ? (
            <button type="button" className="btn btn-primary" disabled={list.length === 0} onClick={() => setStep(1)}>
              Review PO <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(0)}><i className="bi bi-arrow-left me-1" /> Back</button>
              <button type="button" className="btn btn-primary" onClick={() => {
                list.forEach((p) => updateProduct(p.id, { onOrder: (p.onOrder ?? 0) + (qtys[p.id] ?? 0) }));
                recordActivity(`${poNo} sent to ${supplier} for ${totalQty} units`, "bi-cart-plus");
                toast(`${poNo} sent to ${supplier} · ${list.length} line item(s), ${totalQty} units.`, "success", "PO created");
                onClose();
              }}>
                <i className="bi bi-send me-1" /> Send {poNo}
              </button>
            </>
          )}
        </>
      }
    >
      {step === 0 ? (
        <div>
          <p className="pm-prod-meta mb-2">These items are at or below their reorder point:</p>
          {list.map((p) => (
            <div className="d-flex align-items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }} key={p.id}>
              <Thumb img={p.img} emoji={p.emoji} size={36} />
              <div className="flex-grow-1">
                <div className="fw-semibold" style={{ fontSize: "0.82rem" }}>{p.name}</div>
                <div className="pm-prod-meta">{p.sku} · {p.stock} on hand · alert at {p.reorderAt}</div>
              </div>
              <input type="number" min={1} className="form-control form-control-sm" style={{ width: 90 }} value={qtys[p.id]} onChange={(e) => setQtys((q) => ({ ...q, [p.id]: Number(e.target.value) }))} />
              <span className="pm-prod-meta">units</span>
            </div>
          ))}
          {list.length === 0 && <EmptyState icon="bi-check2-circle" title="No low-stock items" text="Every product is above its reorder point. 🎉" />}
        </div>
      ) : (
        <div className="row g-3">
          <Field label="Supplier" className="col-md-6">
            <select className="form-select" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
              {Array.from(new Set(products.map((p) => p.supplier))).map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Expected delivery" className="col-md-6">
            <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Note to supplier" className="col-12">
            <input className="form-control" placeholder="e.g. Please WhatsApp dispatch confirmation" value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <div className="col-12">
            <div className="pm-note">
              <div className="d-flex justify-content-between">
                <span><b>{poNo}</b> — draft order to <b>{supplier}</b></span>
                <span><b>{totalQty} units</b> · {list.length} line item(s)</span>
              </div>
              <div className="pm-prod-meta mt-1">Stock updates when you mark the PO received on the Inventory & Stock page. A copy posts to Pay Suppliers → Open POs.</div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function BulkPriceModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { products, applyBulkPrice, recordActivity, toast } = useStore();
  const ids = (payload.ids as string[]) ?? [];
  const target = ids.length ? products.filter((p) => ids.includes(p.id)) : products.filter((p) => p.status === "Active");
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<"up" | "down" | "set">("up");
  const [mode, setMode] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("10");
  const v = Number(value) || 0;
  const newPrice = (p: number) => {
    if (dir === "set") return mode === "fixed" ? v : Math.round(p * (v / 100));
    if (mode === "percent") return Math.round(p * (1 + (dir === "up" ? 1 : -1) * (v / 100)));
    return p + (dir === "up" ? 1 : -1) * v;
  };
  const preview = target.slice(0, 8);
  return (
    <Modal open onClose={onClose} title="Bulk price edit" subtitle={`${target.length} product(s) affected`} icon="bi-sliders" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step === 0 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep(1)}>Preview changes <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <>
              <button type="button" className="btn btn-outline-secondary" onClick={() => setStep(0)}><i className="bi bi-arrow-left me-1" /> Back</button>
              <button type="button" className="btn btn-primary" onClick={() => {
                const n = applyBulkPrice(target.map((p) => p.id), mode, v, dir);
                recordActivity(`Bulk price ${dir === "set" ? "set" : dir === "up" ? "increase" : "decrease"} of ${mode === "percent" ? v + "%" : "KES " + v} applied to ${n} products`, "bi-sliders");
                toast(`Prices updated on ${n} product(s).`, "success", "Bulk edit applied");
                onClose();
              }}>
                <i className="bi bi-check-lg me-1" /> Apply to {target.length}
              </button>
            </>
          )}
        </>
      }
    >
      {step === 0 ? (
        <div className="row g-3">
          <Field label="Operation" className="col-md-6">
            <div className="d-flex gap-2 flex-wrap">
              <Chip on={dir === "up"} onClick={() => setDir("up")}><i className="bi bi-arrow-up me-1" /> Increase</Chip>
              <Chip on={dir === "down"} onClick={() => setDir("down")}><i className="bi bi-arrow-down me-1" /> Decrease</Chip>
              <Chip on={dir === "set"} onClick={() => setDir("set")}><i className="bi bi-equals me-1" /> Set to</Chip>
            </div>
          </Field>
          <Field label="Type" className="col-md-6">
            <div className="d-flex gap-2">
              <Chip on={mode === "percent"} onClick={() => setMode("percent")}>% (percent)</Chip>
              <Chip on={mode === "fixed"} onClick={() => setMode("fixed")}>KES (fixed)</Chip>
            </div>
          </Field>
          <Field label="Value" className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">{mode === "percent" ? "%" : "KES"}</span>
              <input type="number" min={0} className="form-control" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
          </Field>
          <div className="col-12">
            <div className="pm-note">Example: Safari Blend Coffee Beans {fmtKES(1850)} → <b>{fmtKES(newPrice(1850))}</b></div>
          </div>
        </div>
      ) : (
        <div>
          <div className="table-responsive">
            <table className="table pm-table align-middle">
              <thead><tr><th>Product</th><th>Current</th><th>New price</th></tr></thead>
              <tbody>
                {preview.map((p) => (
                  <tr key={p.id}>
                    <td><div className="d-flex align-items-center gap-2"><Thumb img={p.img} emoji={p.emoji} size={32} /><b style={{ fontSize: "0.8rem" }}>{p.name}</b></div></td>
                    <td className="pm-prod-meta">{fmtKES(p.price)}</td>
                    <td className="fw-bold text-primary">{fmtKES(newPrice(p.price))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {target.length > preview.length && <div className="pm-prod-meta text-center">+ {target.length - preview.length} more products…</div>}
        </div>
      )}
    </Modal>
  );
}

export function ImportCsvModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { importProducts, recordActivity, toast } = useStore();
  const [step, setStep] = useState(0);
  const [file, setFile] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({ A: "Product name", B: "SKU", C: "Category", D: "Price", E: "Stock" });
  const [skipWarn, setSkipWarn] = useState(false);
  const cols = ["Product name", "SKU", "Category", "Price", "Stock", "Ignore this column"];
  const rows = [
    { name: "Oloilong Rooibos Tea 100g", sku: "PRD-015", cat: "Food & Beverage", price: 890, stock: 40 },
    { name: "Beaded Leather Sandals", sku: "PRD-016", cat: "Fashion & Apparel", price: 2400, stock: 25 },
    { name: "Moringa Powder 200g", sku: "PRD-017", cat: "Beauty & Wellness", price: 0, stock: 60 },
  ];
  return (
    <Modal open onClose={onClose} title="Import products from CSV" subtitle="3-step import — template, mapping, validation" icon="bi-file-earmark-arrow-up" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step === 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => { toast("products-template.csv downloaded — contains headers & sample rows.", "info", "Template"); setFile(true); }}><i className="bi bi-download me-1" /> Download template</button>}
          {step === 0 && <button type="button" className="btn btn-primary" disabled={!file} onClick={() => setStep(1)}>Next: map columns <i className="bi bi-arrow-right ms-1" /></button>}
          {step === 1 && <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Next: validate <i className="bi bi-arrow-right ms-1" /></button>}
          {step === 2 && (
            <button type="button" className="btn btn-primary" onClick={() => {
              const valid = rows.filter((r) => r.price > 0 || skipWarn).map((r, i) => ({
                id: "p" + Date.now() + i, name: r.name, sku: r.sku, category: r.cat, price: r.price, compareAt: null, cost: Math.round(r.price * 0.45), stock: r.stock, reorderAt: 10, vat: "16%", status: "Active" as const, listed: true, featured: false, img: IMG_LIBRARY[(i + 3) % IMG_LIBRARY.length].url, emoji: "📦", sold30: 0, rating: 0, reviews: 0, supplier: "—", eTims: "0901.21.00", updated: "Just now", tags: ["Imported"],
              }));
              importProducts(valid);
              recordActivity(`CSV import: ${valid.length} products imported (products_july.csv)`, "bi-file-earmark-arrow-up");
              toast(`${valid.length} products imported and listed on the store.`, "success", "Import complete");
              onClose();
            }}>
              <i className="bi bi-check-lg me-1" /> Import {skipWarn ? 3 : 2} products
            </button>
          )}
        </>
      }
    >
      <div className="d-flex align-items-center gap-3 mb-3">
        {["Upload file", "Map columns", "Validate & import"].map((s, i) => (
          <div key={s} className="d-flex align-items-center gap-2">
            <span className={`badge rounded-pill ${i <= step ? "text-bg-success" : "bg-light text-secondary border"}`}>{i + 1}</span>
            <span className="fw-semibold" style={{ fontSize: "0.8rem", color: i === step ? "var(--pm-ink)" : "var(--pm-muted)" }}>{s}</span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="text-center py-4" style={{ border: "2px dashed var(--pm-border)", borderRadius: 14 }}>
          {!file ? (
            <button type="button" className="btn btn-outline-primary" onClick={() => { setFile(true); toast("File browser opened (demo) — selected products_july.csv", "info"); }}>
              <i className="bi bi-cloud-arrow-up me-1" /> Select CSV file
            </button>
          ) : (
            <div>
              <div className="d-inline-flex align-items-center gap-2 px-3 py-2" style={{ background: "var(--pm-green-soft)", borderRadius: 10 }}>
                <i className="bi bi-file-earmark-spreadsheet text-primary" />
                <b style={{ fontSize: "0.85rem" }}>products_july.csv</b>
                <span className="pm-prod-meta">1.2 MB · 3 rows</span>
                <button type="button" className="btn-close" style={{ fontSize: "0.55rem" }} onClick={() => setFile(false)} />
              </div>
              <div className="pm-prod-meta mt-2">Encoding OK · 3 rows detected · KES currency detected</div>
            </div>
          )}
          <p className="pm-prod-meta mt-3 mb-0">Max 5,000 rows · .csv or .xlsx · every imported SKU is auto-validated against eTIMS</p>
        </div>
      )}

      {step === 1 && (
        <div className="row g-3">
          {(["A", "B", "C", "D", "E"] as const).map((c) => (
            <Field key={c} label={`Column ${c}`} className="col-md-6">
              <select className="form-select" value={mapping[c]} onChange={(e) => setMapping((m) => ({ ...m, [c]: e.target.value }))}>
                {cols.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
          ))}
          <div className="col-12">
            <div className="table-responsive">
              <table className="table pm-table">
                <thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.sku}>
                      <td>{r.name}</td><td>{r.sku}</td><td>{r.cat}</td>
                      <td>{r.price ? fmtKES(r.price) : <Badge tone="red">missing</Badge>}</td>
                      <td>{r.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          {[
            { ok: true, msg: "2 products ready — pricing & SKUs valid" },
            { ok: true, msg: "All SKUs unique — no duplicates with existing catalog" },
            { ok: false, msg: "1 row missing price (Moringa Powder) — will import at KES 0" },
          ].map((r, i) => (
            <div key={i} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
              {r.ok ? <i className="bi bi-check-circle-fill text-primary" /> : <i className="bi bi-exclamation-triangle-fill" style={{ color: "var(--pm-warn)" }} />}
              <span style={{ fontSize: "0.84rem" }}>{r.msg}</span>
              {!r.ok && (
                <div className="form-check ms-auto">
                  <input className="form-check-input" type="checkbox" id="skip" checked={skipWarn} onChange={(e) => setSkipWarn(e.target.checked)} />
                  <label className="form-check-label pm-prod-meta" htmlFor="skip">Skip row</label>
                </div>
              )}
            </div>
          ))}
          <div className="pm-note mt-3"><i className="bi bi-shield-check me-1" />Imported products inherit 16% VAT and are eTIMS-validated before listing.</div>
        </div>
      )}
    </Modal>
  );
}

export function CategoryManagerModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { products, toast } = useStore();
  const base = ["Food & Beverage", "Crafts & Art", "Fashion & Apparel", "Home & Living", "Beauty & Wellness"];
  const extra = Array.from(new Set(products.map((p) => p.category))).filter((c) => !base.includes(c));
  const [cats, setCats] = useState<string[]>([...base, ...extra]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#12b76a");
  const counts = (c: string) => products.filter((p) => p.category === c).length;
  return (
    <Modal open onClose={onClose} title="Manage categories" subtitle="Collections shown in the store menu" icon="bi-tags"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" disabled={!name.trim()} onClick={() => {
            setCats((c) => [...c, name.trim()]);
            toast(`Category “${name.trim()}” added — appears in store menu.`, "success", "Category added");
            setName("");
          }}>
            <i className="bi bi-plus-lg me-1" /> Add category
          </button>
        </>
      }
    >
      <div className="input-group mb-3">
        <input className="form-control" placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="color" className="form-control form-control-color" style={{ width: 48 }} value={color} onChange={(e) => setColor(e.target.value)} title="Category colour" />
      </div>
      {cats.map((c) => (
        <div key={c} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />
          <b style={{ fontSize: "0.84rem" }} className="flex-grow-1">{c}</b>
          <Badge tone="slate">{counts(c)} products</Badge>
          {!base.includes(c) && (
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => {
              setCats((x) => x.filter((y) => y !== c));
              toast(`Category “${c}” removed — products keep their tags until re-assigned.`, "info", "Category removed");
            }}>
              <i className="bi bi-trash" />
            </button>
          )}
        </div>
      ))}
      <div className="pm-note soft mt-3"><i className="bi bi-info-circle me-1" />Categories sync to your store navigation and the Inventory &amp; Stock page.</div>
    </Modal>
  );
}
