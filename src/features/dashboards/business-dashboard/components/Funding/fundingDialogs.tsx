import { useState } from "react";
import { fmtKES, fmtKESK } from "./data";
import { useStore } from "./store";
import { Drawer, Modal } from "./ui";

/* ==================================================================
   OFFER DRAWER
================================================================== */
export function OfferDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { offers, applyForOffer } = useStore();
  const offer = offers.find((o) => o.id === payload.offerId);
  if (!offer) return null;
  return (
    <Drawer open onClose={onClose} title={offer.product} subtitle={`${offer.lender} · ${offer.term}`} icon={offer.icon}>
      <div className="d-flex align-items-end justify-content-between mb-3">
        <div>
          <div className="pm-kpi-label">Facility size</div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "Sora" }}>{fmtKES(offer.amount)}</div>
        </div>
        <div className="text-end">
          <div className="pm-kpi-label">Rate</div>
          <div className="fw-bold" style={{ fontSize: "1rem", color: "var(--pm-green-dark)" }}>{offer.rate}</div>
        </div>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-6"><div className="pm-note soft h-100 p-2"><b className="d-block" style={{ fontSize: "0.72rem" }}>TERM</b>{offer.term}</div></div>
        <div className="col-6"><div className="pm-note soft h-100 p-2"><b className="d-block" style={{ fontSize: "0.72rem" }}>FEE</b>{offer.fee}</div></div>
        <div className="col-12"><div className="pm-note soft p-2"><b className="d-block" style={{ fontSize: "0.72rem" }}>APPROVAL</b>{offer.approval}</div></div>
      </div>
      <div className="fw-bold mb-2" style={{ fontSize: "0.85rem" }}>What you get</div>
      <ul className="mb-3" style={{ fontSize: "0.82rem", color: "var(--pm-muted)" }}>
        {offer.perks.map((p) => <li key={p} className="mb-1">{p}</li>)}
      </ul>
      <div className="pm-note soft"><i className="bi bi-shield-check me-1" />Licensed by CBK · no hidden charges · repay early free of penalty.</div>
      <div className="d-flex gap-2 mt-3">
        <button type="button" className="btn btn-warning flex-grow-1" onClick={() => { applyForOffer(offer.id); onClose(); }}>
          <i className="bi bi-lightning-charge me-1" />Apply now
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
      </div>
    </Drawer>
  );
}

/* ==================================================================
   APPLY MODAL (Funding matcher)
================================================================== */
export function ApplyModal({ onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { offers, applyForOffer } = useStore();
  const [amount, setAmount] = useState("500000");
  const [purpose, setPurpose] = useState("Working capital");
  const [selected, setSelected] = useState<string | null>(offers[0]?.id ?? null);
  const chosen = offers.find((o) => o.id === selected);
  const num = Number(amount) || 0;
  const matched = offers
    .map((o) => ({ ...o, fit: Math.min(100, Math.round((num / o.amount) * 100)) }))
    .sort((a, b) => a.fit - b.fit)
    .slice(0, 3);

  return (
    <Modal open onClose={onClose} title="Funding Matcher" subtitle="3 steps · rates locked for 14 days" icon="bi-lightning-charge" size="lg">
      <div className="mb-3">
        <div className="fw-bold mb-1" style={{ fontSize: "0.85rem" }}>Step 1 — How much do you need?</div>
        <div className="input-group">
          <span className="input-group-text">KES</span>
          <input className="form-control" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} placeholder="e.g. 500000" />
        </div>
      </div>
      <div className="mb-3">
        <div className="fw-bold mb-1" style={{ fontSize: "0.85rem" }}>Step 2 — What's it for?</div>
        <select className="form-select" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option>Working capital</option>
          <option>Stock / inventory</option>
          <option>Equipment</option>
          <option>Expansion</option>
          <option>Bridge a large payment</option>
        </select>
      </div>
      <div>
        <div className="fw-bold mb-1" style={{ fontSize: "0.85rem" }}>Step 3 — Best matches for {fmtKESK(num)}</div>
        {matched.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`pm-dd-item w-100 ${selected === o.id ? "selected" : ""}`}
            style={{ borderRadius: 12, border: selected === o.id ? "1.5px solid var(--pm-green)" : "1.5px solid transparent" }}
            onClick={() => setSelected(o.id)}
          >
            <span className="pm-kpi-icon" style={{ width: 34, height: 34, fontSize: "0.85rem", background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}><i className={`bi ${o.icon}`} /></span>
            <span className="flex-grow-1">
              <span className="d-block fw-semibold" style={{ fontSize: "0.8rem" }}>{o.product} · {o.lender}</span>
              <span style={{ fontSize: "0.68rem", color: "var(--pm-muted)" }}>{o.rate} · {o.term} · up to {fmtKESK(o.amount)}</span>
            </span>
            {selected === o.id && <i className="bi bi-check-circle-fill" style={{ color: "var(--pm-green)" }} />}
          </button>
        ))}
      </div>
      <div className="d-flex gap-2 mt-4">
        <button type="button" className="btn btn-primary flex-grow-1" disabled={!chosen} onClick={() => { if (chosen) applyForOffer(chosen.id); onClose(); }}>
          <i className="bi bi-send me-1" />Apply for {chosen ? chosen.product : "selected offer"}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}

/* ==================================================================
   APPLICATION DETAIL
================================================================== */
export function AppDetailModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { applications, acceptFacility } = useStore();
  const app = applications.find((a) => a.id === payload.appId);
  if (!app) return null;
  return (
    <Modal open onClose={onClose} title={app.product} subtitle={`${app.lender} · applied ${app.submitted}`} icon="bi-bank">
      <div className="row g-2 mb-3">
        <div className="col-6"><div className="pm-note soft p-2"><b className="d-block" style={{ fontSize: "0.72rem" }}>AMOUNT</b>{fmtKES(app.amount)}</div></div>
        <div className="col-6"><div className="pm-note soft p-2"><b className="d-block" style={{ fontSize: "0.72rem" }}>STATUS</b>{app.status}</div></div>
      </div>
      {app.note && <div className="pm-note soft mb-3"><i className="bi bi-info-circle me-1" />{app.note}</div>}
      <div className="pm-note"><i className="bi bi-clock-history me-1" />Typical decision time: 2 hours. You'll be pinged the moment the lender responds.</div>
      {app.status === "Awaiting acceptance" && (
        <div className="d-flex gap-2 mt-3">
          <button type="button" className="btn btn-warning flex-grow-1" onClick={() => { acceptFacility(app.id); onClose(); }}>
            <i className="bi bi-check2-circle me-1" />Accept facility
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Later</button>
        </div>
      )}
    </Modal>
  );
}

/* ==================================================================
   REPAYMENT MODAL
================================================================== */
export function RepayModal({ onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { repayments, repayLoan } = useStore();
  const due = repayments.filter((r) => r.status === "Due" || r.status === "Upcoming");
  const [selected, setSelected] = useState(due[0]?.id ?? null);
  return (
    <Modal open onClose={onClose} title="Make a repayment" subtitle="Auto-debits from NCBA Current · instant M-Pesa confirmation" icon="bi-cash-stack">
      {due.length === 0 && <div className="pm-empty"><i className="bi bi-check2-circle" /><h5>Nothing due</h5><p className="mb-0" style={{ fontSize: "0.82rem" }}>All repayments are settled. Nice.</p></div>}
      {due.map((r) => (
        <button
          key={r.id}
          type="button"
          className={`pm-dd-item w-100 ${selected === r.id ? "selected" : ""}`}
          style={{ borderRadius: 12, border: selected === r.id ? "1.5px solid var(--pm-green)" : "1.5px solid transparent" }}
          onClick={() => setSelected(r.id)}
        >
          <span className="flex-grow-1">
            <span className="d-block fw-semibold" style={{ fontSize: "0.8rem" }}>{r.lender}</span>
            <span style={{ fontSize: "0.68rem", color: "var(--pm-muted)" }}>Due {r.due} · {r.status}</span>
          </span>
          <b style={{ fontSize: "0.82rem" }}>{fmtKES(r.amount)}</b>
          {selected === r.id && <i className="bi bi-check-circle-fill" style={{ color: "var(--pm-green)" }} />}
        </button>
      ))}
      {due.length > 0 && (
        <div className="d-flex gap-2 mt-4">
          <button type="button" className="btn btn-primary flex-grow-1" disabled={!selected} onClick={() => { if (selected) repayLoan(selected); onClose(); }}>
            <i className="bi bi-cash-coin me-1" />Pay now
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
        </div>
      )}
    </Modal>
  );
}

/* ==================================================================
   SCORE SIMULATOR
================================================================== */
export function ScoreModal({ onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { profile, simulateScore } = useStore();
  const [payDown, setPayDown] = useState(true);
  const [collect, setCollect] = useState(false);
  const delta = (payDown ? 4 : 0) + (collect ? 3 : 0);
  const projected = Math.min(850, profile.score + delta);
  return (
    <Modal open onClose={onClose} title="Score simulator" subtitle="See how actions move your credit score" icon="bi-graph-up-arrow">
      <div className="d-flex gap-3 align-items-center mb-3">
        <div className="text-center">
          <div className="pm-kpi-label">Today</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "Sora", color: "var(--pm-muted)" }}>{profile.score}</div>
        </div>
        <i className="bi bi-arrow-right" />
        <div className="text-center">
          <div className="pm-kpi-label">Projected</div>
          <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "Sora", color: "var(--pm-green-dark)" }}>{projected}</div>
        </div>
      </div>
      <div className="form-check mb-2">
        <input className="form-check-input" type="checkbox" id="sd-pay" checked={payDown} onChange={(e) => setPayDown(e.target.checked)} />
        <label className="form-check-label" htmlFor="sd-pay" style={{ fontSize: "0.84rem" }}>Pay down KES 300K of debt (+4)</label>
      </div>
      <div className="form-check mb-3">
        <input className="form-check-input" type="checkbox" id="sd-collect" checked={collect} onChange={(e) => setCollect(e.target.checked)} />
        <label className="form-check-label" htmlFor="sd-collect" style={{ fontSize: "0.84rem" }}>Collect 3 more overdue invoices (+3)</label>
      </div>
      <div className="pm-note soft"><i className="bi bi-lightbulb me-1" />Both changes together project a score of <b>{projected}</b> — comfortably into the next lending tier.</div>
      <div className="d-flex gap-2 mt-3">
        <button type="button" className="btn btn-primary flex-grow-1" onClick={() => { simulateScore(); onClose(); }}>
          <i className="bi bi-play me-1" />Simulate
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/* ==================================================================
   ALL OFFERS (compare)
================================================================== */
export function OffersModal({ onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { offers, applyForOffer } = useStore();
  return (
    <Modal open onClose={onClose} title="Compare all offers" subtitle="Sorted by effective cost · rates locked for 14 days" icon="bi-arrow-left-right" size="lg">
      <div className="table-responsive">
        <table className="table align-middle" style={{ fontSize: "0.8rem" }}>
          <thead>
            <tr>
              <th>Offer</th>
              <th>Lender</th>
              <th className="text-end">Amount</th>
              <th>Rate</th>
              <th>Term</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id}>
                <td className="fw-semibold">{o.product} {o.recommended && <i className="bi bi-stars ms-1" style={{ color: "#f79009" }} />}</td>
                <td>{o.lender}</td>
                <td className="text-end">{fmtKESK(o.amount)}</td>
                <td style={{ color: "var(--pm-green-dark)", fontWeight: 600 }}>{o.rate}</td>
                <td className="pm-prod-meta">{o.term}</td>
                <td>
                  <button type="button" className="btn btn-sm btn-warning" onClick={() => { applyForOffer(o.id); onClose(); }}>
                    Apply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pm-note soft"><i className="bi bi-shield-check me-1" />All lenders CBK-licensed. Applying never affects your score until you accept a facility.</div>
    </Modal>
  );
}

/* ==================================================================
   HELP
================================================================== */
export function HelpModal({ onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Help — Funding & Credit" icon="bi-question-circle">
      <div style={{ fontSize: "0.84rem" }}>
        <p>Your <b>credit score</b> is rebuilt nightly from Metropol, CRB and your live PayMo cash-flow. Offers are real facilities pre-negotiated with licensed Kenyan lenders.</p>
        <p className="mb-1">Tips:</p>
        <ul>
          <li>Accepting a facility <b>never</b> costs anything until you draw funds.</li>
          <li>Repaying early is free on every offer here.</li>
          <li>Simulate score changes before you commit to a big decision.</li>
        </ul>
      </div>
      <div className="pm-note soft"><i className="bi bi-lightbulb me-1" />Keyboard: <span className="pm-kbd">Esc</span> close · <span className="pm-kbd">/</span> search.</div>
    </Modal>
  );
}

/* ==================================================================
   ACTIVITY DRAWER
================================================================== */
export function ActivityDrawer({ onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { activity } = useStore();
  return (
    <Drawer open onClose={onClose} title="Activity log" subtitle="Everything that touched your credit file" icon="bi-clock-history">
      {activity.map((a) => (
        <div key={a.text + a.time} className="d-flex gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
          <i className={`bi ${a.icon}`} style={{ color: "var(--pm-green-dark)", width: 20 }} />
          <div className="flex-grow-1">
            <div style={{ fontSize: "0.8rem" }}>{a.text}</div>
            <div className="pm-prod-meta">{a.time} · {a.by}</div>
          </div>
        </div>
      ))}
    </Drawer>
  );
}
