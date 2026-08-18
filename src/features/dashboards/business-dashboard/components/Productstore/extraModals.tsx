import { useState } from "react";
import { useStore } from "./store";
import { Drawer, Field, Modal } from "./ui";

export function AnalyticsExportModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const [range, setRange] = useState("Last 30 days");
  const [format, setFormat] = useState<"PDF" | "CSV" | "Excel">("PDF");
  const [include, setInclude] = useState({ revenue: true, orders: true, products: true, customers: false, vat: true });
  const [exporting, setExporting] = useState(false);
  return (
    <Modal open onClose={onClose} title="Export store report" subtitle="Share-ready analytics for your accountant" icon="bi-file-earmark-bar-graph"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={exporting} onClick={() => {
            setExporting(true);
            window.setTimeout(() => {
              setExporting(false);
              recordActivity(`Store report exported (${format}, ${range})`, "bi-file-earmark-bar-graph");
              toast(`${format} report (${range}) downloaded — check your Downloads folder.`, "success", "Report exported");
              onClose();
            }, 1200);
          }}>
            {exporting ? <><span className="pm-spin me-1">◌</span> Building report…</> : <><i className="bi bi-download me-1" /> Export {format}</>}
          </button>
        </>
      }
    >
      <Field label="Date range" className="mb-3">
        <select className="form-select" value={range} onChange={(e) => setRange(e.target.value)}>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>This quarter</option>
          <option>Year to date</option>
          <option>Custom range</option>
        </select>
      </Field>
      <div className="d-flex gap-2 mb-3">
        {(["PDF", "CSV", "Excel"] as const).map((f) => (
          <button key={f} type="button" className={`pm-chip ${format === f ? "on" : ""}`} onClick={() => setFormat(f)}>
            <i className={`bi ${f === "PDF" ? "bi-file-pdf" : f === "CSV" ? "bi-filetype-csv" : "bi-file-earmark-excel"} me-1`} /> {f}
          </button>
        ))}
      </div>
      {[
        { k: "revenue" as const, t: "Revenue & fees breakdown" },
        { k: "orders" as const, t: "Orders & fulfilment summary" },
        { k: "products" as const, t: "Top products table" },
        { k: "customers" as const, t: "Customer contact list" },
        { k: "vat" as const, t: "VAT collected (eTIMS ready)" },
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

export function HelpModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, openModal } = useStore();
  return (
    <Modal open onClose={onClose} title="Help & shortcuts" subtitle="Everything on this page, at a glance" icon="bi-question-circle" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { toast("Guided tour started — follow the highlights on each section. (Demo)", "info", "Guided tour"); onClose(); }}>
            <i className="bi bi-compass me-1" /> Start guided tour
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Got it</button>
        </>
      }
    >
      <div className="row g-3">
        {[
          { icon: "bi-box-seam", t: "Product Wizard (6 steps)", d: "Add products fast: basics → pricing & tax → variants → inventory → media → review. Autosaves drafts.", act: () => openModal("productWizard") },
          { icon: "bi-cart4", t: "Orders & fulfilment", d: "Open any order for the full timeline. Move New → Shipped → Delivered or issue refunds.", act: () => onClose() },
          { icon: "bi-palette", t: "Theme customizer", d: "4-step wizard: pick a theme, toggle sections, set branding, publish instantly.", act: () => openModal("theme") },
          { icon: "bi-rocket-takeoff", t: "Publish wizard", d: "4-step launch: checklist → domain → payment rails → Go Live.", act: () => openModal("publish") },
          { icon: "bi-ticket-perforated", t: "Discount builder", d: "4-step coupon flow: type → value & code → rules → activate.", act: () => openModal("discount") },
          { icon: "bi-file-earmark-arrow-up", t: "CSV import (3 steps)", d: "Upload → map columns → validate. Every SKU is eTIMS-checked.", act: () => openModal("import") },
        ].map((h, i) => (
          <div className="col-md-6" key={i}>
            <div className="pm-help-item">
              <i className={`bi ${h.icon}`} />
              <div>
                <b style={{ fontSize: "0.84rem" }}>{h.t}</b>
                <div className="pm-prod-meta">{h.d}</div>
                <button type="button" className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: "0.74rem" }} onClick={() => h.act()}>
                  Open →
                </button>
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

export function ActivityDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { activity, toast } = useStore();
  const [filter, setFilter] = useState("All");
  const kinds = ["All", "Orders", "Products", "Storefront", "Compliance"];
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" title="Activity log" subtitle="Everything that happened on your store — audit-ready">
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
      <button type="button" className="btn btn-outline-secondary w-100 mt-3" onClick={() => toast("Full audit trail (12,408 events) queued for export.", "info", "Audit trail")}>
        <i className="bi bi-download me-1" /> Export full audit trail
      </button>
    </Drawer>
  );
}
