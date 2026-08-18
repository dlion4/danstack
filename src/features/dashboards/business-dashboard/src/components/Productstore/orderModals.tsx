import { useState } from "react";
import { fmtKES } from "./data";
import type { OrderStatus } from "./data";
import { useStore } from "./store";
import { Badge, Drawer, Field, Modal, StatusBadge } from "./ui";

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  New: ["Processing", "Shipped", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
  Refunded: [],
};

export const orderStatusTone = (s: OrderStatus) =>
  s === "New" ? "blue" : s === "Processing" ? "amber" : s === "Shipped" ? "violet" : s === "Delivered" ? "green" : s === "Cancelled" ? "slate" : "red";

/* ==================================================================
   ORDER DETAIL — slide-over drawer with timeline & actions
================================================================== */
export function OrderDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { orders, openModal } = useStore();
  const o = orders.find((x) => x.id === String(payload.id));
  if (!o) return null;
  const nexts = STATUS_FLOW[o.status];
  return (
    <Drawer open onClose={onClose} icon="bi-receipt" title={`Order ${o.id}`} subtitle={`${o.date} · ${o.channel} · ${o.location}`}>
      <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
        <StatusBadge status={o.status} />
        <Badge tone={o.payment === "M-Pesa" ? "green" : o.payment === "Card" ? "blue" : o.payment === "Cash on Delivery" ? "amber" : "violet"}>
          <i className={`bi ${o.payment === "M-Pesa" ? "bi-phone" : o.payment === "Card" ? "bi-credit-card" : o.payment === "Cash on Delivery" ? "bi-cash" : "bi-bank"} me-1`} />
          {o.payment}
        </Badge>
      </div>

      {/* customer */}
      <div className="pm-card mb-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
        <div className="pm-kpi-label mb-2">Customer</div>
        <div className="d-flex align-items-center gap-2">
          <div className="pm-avatar" style={{ width: 38, height: 38, fontSize: "0.78rem" }}>{o.customer.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div>
          <div className="flex-grow-1">
            <div className="fw-bold" style={{ fontSize: "0.88rem" }}>{o.customer}</div>
            <div className="pm-prod-meta">{o.phone} · {o.email}</div>
          </div>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("notifyCustomer", { id: o.id })}>
            <i className="bi bi-chat-dots" />
          </button>
        </div>
      </div>

      {/* items */}
      <div className="pm-card mb-3" style={{ boxShadow: "none" }}>
        <div className="pm-kpi-label mb-2">Items ({o.items.length})</div>
        {o.items.map((it, i) => (
          <div key={i} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: i < o.items.length - 1 ? "1px solid var(--pm-border)" : "none" }}>
            <span style={{ fontSize: "1.2rem" }}>{it.emoji}</span>
            <div className="flex-grow-1">
              <div className="fw-semibold" style={{ fontSize: "0.82rem" }}>{it.name}</div>
              <div className="pm-prod-meta">{it.sku} · qty {it.qty}</div>
            </div>
            <b style={{ fontSize: "0.82rem" }}>{fmtKES(it.price * it.qty)}</b>
          </div>
        ))}
        <div className="mt-2 pt-2" style={{ borderTop: "1px dashed var(--pm-border)" }}>
          <div className="d-flex justify-content-between pm-prod-meta"><span>Subtotal</span><span>{fmtKES(o.total)}</span></div>
          <div className="d-flex justify-content-between pm-prod-meta"><span>Delivery</span><span>{o.deliveryFee ? fmtKES(o.deliveryFee) : "Free"}</span></div>
          <div className="d-flex justify-content-between fw-bold mt-1" style={{ fontSize: "0.95rem" }}><span>Total</span><span className="text-primary">{fmtKES(o.total + o.deliveryFee)}</span></div>
        </div>
      </div>

      {/* timeline */}
      <div className="pm-card mb-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
        <div className="pm-kpi-label mb-2">Order timeline</div>
        <div className="pm-timeline">
          {o.events.map((ev, i) => {
            const done = ev.time !== "—";
            const current = done && (i === 0 || o.events[i - 1].time !== "—");
            return (
              <div key={i} className={`pm-tl-item ${done ? "done" : ""} ${current ? "current" : ""}`}>
                <div className="pm-tl-dot" />
                <div className="pm-tl-title">{ev.title}</div>
                <div className="pm-tl-time">{done ? ev.time : "Pending"} {ev.note ? `· ${ev.note}` : ""}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* actions */}
      <div className="row g-2">
        {nexts.map((s) => (
          <div className="col-6" key={s}>
            <button type="button" className="btn btn-primary w-100 btn-sm" onClick={() => openModal("orderStatus", { id: o.id, to: s })}>
              {s === "Shipped" ? <><i className="bi bi-truck me-1" /> Mark Shipped</> : s === "Delivered" ? <><i className="bi bi-check2-circle me-1" /> Mark Delivered</> : s === "Processing" ? <><i className="bi bi-box-seam me-1" /> Start Packing</> : <><i className="bi bi-x-circle me-1" /> Cancel</>}
            </button>
          </div>
        ))}
        {o.status !== "Refunded" && o.status !== "Cancelled" && (
          <div className="col-6">
            <button type="button" className="btn btn-outline-danger w-100 btn-sm" onClick={() => openModal("refund", { id: o.id })}>
              <i className="bi bi-arrow-counterclockwise me-1" /> Refund
            </button>
          </div>
        )}
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary w-100 btn-sm" onClick={() => openModal("resendReceipt", { id: o.id })}>
            <i className="bi bi-receipt me-1" /> Receipt
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary w-100 btn-sm" onClick={() => openModal("packingSlip", { id: o.id })}>
            <i className="bi bi-printer me-1" /> Packing slip
          </button>
        </div>
      </div>
      <div className="pm-note soft mt-3">
        <i className="bi bi-shield-check me-1" />
        {o.payment === "Cash on Delivery" ? "COD — collect KES " + (o.total + o.deliveryFee).toLocaleString() + " on delivery." : "Payment settled — every sale posts to the General Ledger & eTIMS."}
      </div>
    </Drawer>
  );
}

/* ==================================================================
   STATUS / REFUND / RECEIPT / NOTIFY / SLIP
================================================================== */
export function OrderStatusModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { orders, setOrderStatus, recordActivity, toast } = useStore();
  const o = orders.find((x) => x.id === String(payload.id));
  const to = String(payload.to ?? "Processing") as OrderStatus;
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  if (!o) return null;
  const labels: Record<string, string> = {
    Processing: "packing started", Shipped: "order shipped", Delivered: "delivery completed", Cancelled: "order cancelled",
  };
  return (
    <Modal open onClose={onClose} title={`Mark as ${to}`} subtitle={`${o.id} · ${o.customer}`} icon="bi-arrow-repeat" size="sm"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className={to === "Cancelled" ? "btn btn-danger" : "btn btn-primary"} onClick={() => {
            setOrderStatus(o.id, to, note, notify);
            recordActivity(`${o.id} → ${to}${notify ? " (customer notified)" : ""}`, "bi-arrow-repeat");
            toast(`${o.id} is now ${to}. ${notify ? "Customer notified via SMS & WhatsApp." : ""}`, "success", "Status updated");
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Confirm
          </button>
        </>
      }
    >
      <p className="mb-2">Move <b>{o.id}</b> to <Badge tone={orderStatusTone(to)}>{to}</Badge> ({labels[to] ?? ""}).</p>
      <Field label="Note (internal or to customer)">
        <input className="form-control" placeholder={to === "Shipped" ? "e.g. Sendy tracking SK-88500" : "Optional note"} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div className="form-check form-switch mt-3">
        <input className="form-check-input" type="checkbox" id="notify" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
        <label className="form-check-label" htmlFor="notify">Notify customer (SMS + WhatsApp)</label>
      </div>
    </Modal>
  );
}

export function RefundModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { orders, refundOrder, recordActivity, toast } = useStore();
  const o = orders.find((x) => x.id === String(payload.id));
  const [reason, setReason] = useState("Item damaged in transit");
  const [mode, setMode] = useState<"full" | "partial">("full");
  const [partial, setPartial] = useState("");
  const [method, setMethod] = useState("M-Pesa reversal");
  if (!o) return null;
  const total = o.total + o.deliveryFee;
  const amount = mode === "full" ? total : Number(partial) || 0;
  return (
    <Modal open onClose={onClose} title="Refund order" subtitle={`${o.id} · total ${fmtKES(total)}`} icon="bi-arrow-counterclockwise"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-danger" disabled={amount <= 0 || amount > total} onClick={() => {
            refundOrder(o.id, reason, amount, method);
            recordActivity(`Refund issued on ${o.id} — ${fmtKES(amount)} (${method})`, "bi-arrow-counterclockwise");
            toast(`${fmtKES(amount)} refunded on ${o.id} via ${method}.`, "success", "Refund issued");
            onClose();
          }}>
            <i className="bi bi-arrow-counterclockwise me-1" /> Refund {fmtKES(amount)}
          </button>
        </>
      }
    >
      <div className="d-flex gap-2 mb-3">
        <label className="d-flex align-items-center gap-2 p-2 flex-grow-1" style={{ border: "2px solid " + (mode === "full" ? "var(--pm-danger)" : "var(--pm-border)"), borderRadius: 10, cursor: "pointer" }}>
          <input type="radio" className="form-check-input mt-0" checked={mode === "full"} onChange={() => setMode("full")} />
          <span className="fw-semibold" style={{ fontSize: "0.84rem" }}>Full · {fmtKES(total)}</span>
        </label>
        <label className="d-flex align-items-center gap-2 p-2 flex-grow-1" style={{ border: "2px solid " + (mode === "partial" ? "var(--pm-danger)" : "var(--pm-border)"), borderRadius: 10, cursor: "pointer" }}>
          <input type="radio" className="form-check-input mt-0" checked={mode === "partial"} onChange={() => setMode("partial")} />
          <span className="fw-semibold" style={{ fontSize: "0.84rem" }}>Partial</span>
        </label>
      </div>
      {mode === "partial" && (
        <Field label="Amount (KES)" className="mb-3">
          <input type="number" min={1} max={total} className="form-control" value={partial} onChange={(e) => setPartial(e.target.value)} />
        </Field>
      )}
      <Field label="Reason" className="mb-3">
        <select className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
          <option>Item damaged in transit</option>
          <option>Wrong item delivered</option>
          <option>Item not received</option>
          <option>Customer changed mind</option>
          <option>Other</option>
        </select>
      </Field>
      <Field label="Refund method">
        <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option>M-Pesa reversal</option>
          <option>Refund to card (3–5 days)</option>
          <option>PesaLink refund</option>
          <option>Store credit</option>
        </select>
      </Field>
      <div className="pm-note mt-3">Refunds post to the ledger and update eTIMS receipts automatically. Stock is not restocked — adjust manually if returned.</div>
    </Modal>
  );
}

export function ResendReceiptModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { orders, toast, recordActivity } = useStore();
  const o = orders.find((x) => x.id === String(payload.id));
  const [channels, setChannels] = useState({ sms: true, whatsapp: true, email: false });
  if (!o) return null;
  const c = (k: keyof typeof channels) => channels[k];
  return (
    <Modal open onClose={onClose} title="Send receipt" subtitle={`${o.id} · ${o.customer}`} icon="bi-receipt"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={!Object.values(channels).some(Boolean)} onClick={() => {
            const names = Object.entries(channels).filter(([, v]) => v).map(([k]) => (k === "sms" ? "SMS" : k === "whatsapp" ? "WhatsApp" : "Email")).join(", ");
            recordActivity(`Receipt resent for ${o.id} via ${names}`, "bi-receipt");
            toast(`Receipt sent to ${o.customer} via ${names}.`, "success", "Receipt sent");
            onClose();
          }}>
            <i className="bi bi-send me-1" /> Send receipt
          </button>
        </>
      }
    >
      <div className="pm-note mb-3"><i className="bi bi-file-earmark-text me-1" />eTIMS receipt for {fmtKES(o.total + o.deliveryFee)} — receipt #ET-2026-{o.id.slice(4)}</div>
      <div className="d-flex flex-column gap-2">
        {[
          { k: "sms" as const, t: "SMS to " + o.phone, icon: "bi-chat-left-text" },
          { k: "whatsapp" as const, t: "WhatsApp message", icon: "bi-whatsapp" },
          { k: "email" as const, t: "Email to " + o.email, icon: "bi-envelope" },
        ].map((r) => (
          <div key={r.k} className="d-flex align-items-center gap-2 p-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
            <i className={`bi ${r.icon}`} />
            <span className="flex-grow-1" style={{ fontSize: "0.84rem", fontWeight: 500 }}>{r.t}</span>
            <div className="form-check form-switch mb-0">
              <input className="form-check-input" type="checkbox" checked={c(r.k)} onChange={(e) => setChannels((s) => ({ ...s, [r.k]: e.target.checked }))} />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export function NotifyCustomerModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { orders, toast, recordActivity } = useStore();
  const o = orders.find((x) => x.id === String(payload.id));
  const [template, setTemplate] = useState("Order update");
  const [msg, setMsg] = useState(`Habari ${o?.customer.split(" ")[0] ?? ""}! Your order ${o?.id} is being processed. We'll update you as it ships. — ${o ? "Soko Sanaa" : ""}`);
  if (!o) return null;
  return (
    <Modal open onClose={onClose} title="Message customer" subtitle={`${o.customer} · ${o.phone}`} icon="bi-chat-dots"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={!msg.trim()} onClick={() => {
            recordActivity(`WhatsApp message sent to ${o.customer}`, "bi-chat-dots");
            toast(`Message sent to ${o.customer} via WhatsApp.`, "success", "Customer notified");
            onClose();
          }}>
            <i className="bi bi-whatsapp me-1" /> Send via WhatsApp
          </button>
        </>
      }
    >
      <Field label="Template" className="mb-2">
        <select className="form-select" value={template} onChange={(e) => {
          setTemplate(e.target.value);
          const t = e.target.value;
          setMsg(
            t === "Order update"
              ? `Habari ${o.customer.split(" ")[0]}! Your order ${o.id} is being processed.`
              : t === "Delivery reminder"
                ? `Hi ${o.customer.split(" ")[0]}, your parcel from Soko Sanaa arrives tomorrow — have KES ${(o.total + o.deliveryFee).toLocaleString()} ready if COD.`
                : t === "Collect feedback"
                  ? `Asante ${o.customer.split(" ")[0]}! How was your ${o.items[0]?.name}? Reply 1-5 ⭐`
                  : ""
          );
        }}>
          <option>Order update</option>
          <option>Delivery reminder</option>
          <option>Collect feedback</option>
          <option>Blank</option>
        </select>
      </Field>
      <Field label="Message">
        <textarea className="form-control" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} />
      </Field>
      <div className="pm-prod-meta mt-2"><i className="bi bi-check2-circle text-primary me-1" />Sent from your verified WhatsApp Business number.</div>
    </Modal>
  );
}

export function PackingSlipModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { orders, toast } = useStore();
  const o = orders.find((x) => x.id === String(payload.id));
  if (!o) return null;
  return (
    <Modal open onClose={onClose} title="Packing slip" subtitle="Print & slip into the parcel" icon="bi-printer"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => { toast("Packing slip sent to printer.", "success", "Printing"); onClose(); }}>
            <i className="bi bi-printer me-1" /> Print slip
          </button>
        </>
      }
    >
      <div className="p-3" style={{ border: "1px dashed var(--pm-border)", borderRadius: 12, background: "#fff" }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-bold">Soko Sanaa by TS Retail</div>
            <div className="pm-prod-meta">tsretail.paymo.store · Nairobi, Kenya</div>
          </div>
          <div className="text-end">
            <div className="fw-bold" style={{ fontSize: "1.1rem" }}>{o.id}</div>
            <div className="pm-prod-meta">{o.date}</div>
          </div>
        </div>
        <hr />
        <div className="pm-prod-meta mb-1"><b>SHIP TO:</b> {o.customer} · {o.phone} · {o.location}</div>
        <table className="table table-sm mb-2" style={{ fontSize: "0.78rem" }}>
          <thead><tr><th>Item</th><th className="text-end">Qty</th></tr></thead>
          <tbody>
            {o.items.map((it, i) => (
              <tr key={i}><td>{it.emoji} {it.name}</td><td className="text-end">{it.qty}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="d-flex justify-content-between pm-prod-meta">
          <span>Payment: <b>{o.payment}</b></span>
          <span>Total: <b>{fmtKES(o.total + o.deliveryFee)}</b></span>
        </div>
        <div className="text-center mt-2 pm-prod-meta">Thank you for shopping with us! 🌿</div>
      </div>
    </Modal>
  );
}
