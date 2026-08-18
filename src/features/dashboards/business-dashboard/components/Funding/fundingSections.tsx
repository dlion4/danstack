import { useMemo } from "react";
import { FUNDING_TIPS, fmtKES, fmtKESK } from "./data";
import { useStore } from "./store";
import { Badge, Kpi, Section, StatusBadge } from "./ui";

/* ==================================================================
   PAGE HEADER
================================================================== */
export function PageHeader() {
  const { profile, openModal } = useStore();
  const util = Math.round((profile.utilized / profile.limit) * 100);
  return (
    <div className="pm-banner-hero p-4 d-flex flex-wrap align-items-center gap-3">
      <div className="flex-grow-1" style={{ minWidth: 280 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="pm-zone" style={{ background: "linear-gradient(90deg, #f79009, #e11d48)" }}><i className="bi bi-lightning-charge" /> GROW</span>
          <span className="badge-soft green">Page 10 · 5 sections</span>
        </div>
        <h1 className="mb-1" style={{ fontSize: "1.6rem", fontWeight: 800 }}>Funding &amp; Credit</h1>
        <p className="mb-0" style={{ color: "#b9c7d8", fontSize: "0.86rem", maxWidth: 640 }}>
          Your business credit score, live offers from competing lenders, and every
          repayment in one place. Borrow smarter, never be caught short.
        </p>
      </div>
      <div className="d-flex flex-column gap-2 align-items-lg-end">
        <div className="d-flex align-items-center gap-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14 }}>
          <div className="text-center">
            <div style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "Sora", color: "#7ee2b0" }}>{profile.score}</div>
            <div style={{ fontSize: "0.62rem", color: "#b9c7d8", letterSpacing: "0.08em" }}>CREDIT SCORE</div>
          </div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.18)" }} />
          <div>
            <div className="fw-bold" style={{ fontSize: "0.86rem" }}>{profile.band}</div>
            <div className="pm-prod-meta" style={{ color: "#b9c7d8" }}>{fmtKES(profile.limit)} pre-qualified · {util}% used</div>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("apply")}><i className="bi bi-plus-lg me-1" /> Apply for Funding</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("score")}><i className="bi bi-graph-up-arrow me-1" /> Simulate Score</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("offers")}><i className="bi bi-lightning-charge me-1" /> View All Offers</button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   10.1 CREDIT COMMAND CENTER
================================================================== */
export function CreditHub() {
  const { profile, offers, applications, repayments, simulateScore, openModal } = useStore();
  const util = Math.round((profile.utilized / profile.limit) * 100);
  const due = repayments.filter((r) => r.status === "Due" || r.status === "Overdue");
  const inReview = applications.filter((a) => a.status === "In review" || a.status === "Awaiting acceptance");
  const prequalified = offers.filter((o) => o.status === "Pre-qualified");

  return (
    <>
      <Section no="10.1" title="Credit Command Center"
        sub="How lenders see you — and what you can unlock right now."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("score")}>
              <i className="bi bi-sliders me-1" /> Simulate
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("offers")}>
              <i className="bi bi-lightning-charge me-1" /> Compare offers
            </button>
          </>
        }
      />
      <div className="pm-stat-grid">
        <Kpi icon="bi-graph-up-arrow" iconBg="var(--pm-green-soft)" label="Credit score" value={String(profile.score)} delta="+4 this month" footer={profile.band} spark={profile.history} sparkColor="#12b76a" />
        <Kpi icon="bi-bank" iconBg="#e8f1fe" label="Pre-qualified limit" value={fmtKESK(profile.limit)} delta={`${util}% utilised`} deltaGood={util < 50} footer={`${fmtKES(profile.utilized)} drawn`} />
        <Kpi icon="bi-lightning-charge" iconBg="#fef0c7" label="Live offers" value={String(offers.length)} delta={`${prequalified.length} pre-qualified`} footer="5 lenders competing" />
        <Kpi icon="bi-hourglass-split" iconBg="#f0ebfe" label="In review" value={String(inReview.length)} delta={due.length ? `${due.length} due soon` : "nothing due"} deltaGood={due.length === 0} footer="decisions within 2 hours" />
      </div>

      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="fw-bold" style={{ fontSize: "0.9rem" }}>What drives your score</div>
              <button type="button" className="btn btn-link btn-sm p-0" style={{ fontSize: "0.72rem" }} onClick={() => simulateScore()}>
                <i className="bi bi-lightning-charge me-1" />Simulate a change
              </button>
            </div>
            {profile.factors.map((f) => (
              <div key={f.label} className="py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <div className="d-flex align-items-center justify-content-between" style={{ fontSize: "0.8rem" }}>
                  <span className="fw-semibold">{f.label}</span>
                  <span style={{ color: f.tone, fontWeight: 700 }}>{f.pct}%</span>
                </div>
                <div className="progress" style={{ height: 7 }}>
                  <div className="progress-bar" style={{ width: f.pct, background: f.tone }} />
                </div>
                <div className="pm-prod-meta mt-1">{f.note}</div>
              </div>
            ))}
            <div className="pm-note soft mt-3"><i className="bi bi-lightbulb me-1" />Metropol + CRB report refreshed automatically every night — no manual updates needed.</div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="pm-card h-100">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Limit utilisation</div>
            <div className="d-flex align-items-end gap-3">
              <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "Sora" }}>{util}%</div>
              <div className="flex-grow-1 mb-2">
                <div className="progress" style={{ height: 10 }}>
                  <div className="progress-bar" style={{ width: util, background: util > 70 ? "#f79009" : "#12b76a" }} />
                </div>
                <div className="d-flex justify-content-between pm-prod-meta mt-1">
                  <span>{fmtKES(profile.utilized)} used</span>
                  <span>{fmtKES(profile.limit)} limit</span>
                </div>
              </div>
            </div>
            <div className="pm-note soft mt-2"><i className="bi bi-arrow-down-right me-1" />Paying down KES 300K unlocks ~KES 1M more headroom across lenders.</div>
            <hr />
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Smart tips</div>
            {FUNDING_TIPS.map((t) => (
              <div key={t.title} className="d-flex gap-2 py-1" style={{ fontSize: "0.78rem" }}>
                <i className={`bi ${t.icon}`} style={{ color: t.tone, width: 18 }} />
                <div>
                  <b>{t.title}.</b> <span style={{ color: "var(--pm-muted)" }}>{t.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   10.2 FUNDING OFFERS
================================================================== */
export function OffersSection() {
  const { offers, openModal, applyForOffer } = useStore();
  const sorted = useMemo(() => [...offers].sort((a, b) => Number(b.recommended ?? false) - Number(a.recommended ?? false)), [offers]);
  return (
    <>
      <Section no="10.2" title="Funding Offers"
        sub="Real facilities, pre-negotiated for your business. No paperwork, no branch visits."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("offers")}>
              <i className="bi bi-arrow-left-right me-1" /> Compare all
            </button>
          </>
        }
      />
      <div className="row g-3">
        {sorted.map((o) => (
          <div className="col-md-6 col-xl-4" key={o.id}>
            <div className="pm-card h-100" style={o.recommended ? { border: "1.5px solid #f79009" } : undefined}>
              <div className="d-flex align-items-start gap-2 mb-2">
                <span className="pm-kpi-icon" style={{ background: o.recommended ? "#fef0c7" : "var(--pm-green-soft)", color: o.recommended ? "#b54708" : "var(--pm-green-dark)" }}>
                  <i className={`bi ${o.icon}`} />
                </span>
                <div className="flex-grow-1">
                  <div className="fw-bold" style={{ fontSize: "0.86rem" }}>{o.product}</div>
                  <div className="pm-prod-meta">{o.lender}</div>
                </div>
                {o.recommended && <Badge tone="amber"><i className="bi bi-stars me-1" />Best rate</Badge>}
              </div>
              <div className="d-flex align-items-end justify-content-between mb-2">
                <span style={{ fontSize: "1.3rem", fontWeight: 800, fontFamily: "Sora" }}>{fmtKESK(o.amount)}</span>
                <span className="fw-bold" style={{ fontSize: "0.8rem", color: "var(--pm-green-dark)" }}>{o.rate}</span>
              </div>
              <div className="pm-prod-meta mb-2">{o.term} · {o.fee} · {o.approval}</div>
              <ul className="mb-3 ps-3" style={{ fontSize: "0.74rem", color: "var(--pm-muted)" }}>
                {o.perks.slice(0, 3).map((p) => <li key={p}>{p}</li>)}
              </ul>
              <div className="d-flex gap-2">
                <button type="button" className={`btn btn-sm flex-grow-1 ${o.status === "Pre-qualified" ? "btn-warning" : "btn-outline-secondary"}`} onClick={() => applyForOffer(o.id)}>
                  {o.status === "Pre-qualified" ? <><i className="bi bi-lightning-charge me-1" />Apply now</> : "Apply"}
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("offer", { offerId: o.id })}>
                  <i className="bi bi-eye" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   10.3 MY APPLICATIONS
================================================================== */
export function ApplicationsSection() {
  const { applications, acceptFacility, openModal } = useStore();
  return (
    <>
      <Section no="10.3" title="My Applications"
        sub="Track every application from submission to disbursement."
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("activity")}>
            <i className="bi bi-clock-history me-1" /> Activity
          </button>
        }
      />
      <div className="pm-card">
        {applications.length === 0 && (
          <div className="pm-empty py-4">
            <i className="bi bi-folder-check" />
            <h5>No applications yet</h5>
            <p className="mb-3" style={{ fontSize: "0.82rem" }}>Apply for a facility above and it will appear here.</p>
          </div>
        )}
        {applications.map((a, i) => (
          <div key={a.id} className="d-flex flex-wrap align-items-center gap-3 py-3" style={{ borderBottom: i < applications.length - 1 ? "1px solid var(--pm-border)" : undefined }}>
            <div className="flex-grow-1" style={{ minWidth: 220 }}>
              <div className="fw-bold" style={{ fontSize: "0.85rem" }}>{a.product}</div>
              <div className="pm-prod-meta">{a.lender} · applied {a.submitted}</div>
              {a.note && <div className="pm-prod-meta"><i className="bi bi-info-circle me-1" />{a.note}</div>}
            </div>
            <b style={{ fontSize: "0.86rem" }}>{fmtKESK(a.amount)}</b>
            <StatusBadge status={a.status} />
            {a.status === "Awaiting acceptance" && (
              <button type="button" className="btn btn-warning btn-sm" onClick={() => acceptFacility(a.id)}>
                <i className="bi bi-check2-circle me-1" />Accept facility
              </button>
            )}
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("appDetail", { appId: a.id })}>
              <i className="bi bi-eye" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   10.4 REPAYMENT SCHEDULE
================================================================== */
export function RepaymentsSection() {
  const { repayments, repayLoan, openModal } = useStore();
  return (
    <>
      <Section no="10.4" title="Repayment Schedule"
        sub="Never miss a payment — schedule auto-debits from Cash & Accounts."
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("repay")}>
            <i className="bi bi-cash-stack me-1" /> Make repayment
          </button>
        }
      />
      <div className="pm-card">
        {repayments.map((r, i) => (
          <div key={r.id} className="d-flex flex-wrap align-items-center gap-3 py-3" style={{ borderBottom: i < repayments.length - 1 ? "1px solid var(--pm-border)" : undefined }}>
            <div className="flex-grow-1" style={{ minWidth: 180 }}>
              <div className="fw-bold" style={{ fontSize: "0.84rem" }}>{r.lender}</div>
              <div className="pm-prod-meta">Due {r.due}</div>
            </div>
            <b style={{ fontSize: "0.86rem" }}>{fmtKES(r.amount)}</b>
            <StatusBadge status={r.status} />
            {r.status === "Due" && (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => repayLoan(r.id)}>
                <i className="bi bi-cash-coin me-1" />Pay now
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   WIZARDS BANNER
================================================================== */
export function WizardsBanner() {
  const { openModal } = useStore();
  return (
    <div className="pm-card mt-4 d-flex flex-wrap align-items-center gap-3" style={{ background: "linear-gradient(90deg, #0b1322, #3a1d0b)", border: "none", color: "#fff" }}>
      <span style={{ fontSize: "1.6rem" }}>⚡</span>
      <div className="flex-grow-1" style={{ minWidth: 260 }}>
        <b style={{ fontSize: "0.95rem" }}>Funding Match — a guided 3-step flow</b>
        <div style={{ color: "#b9c7d8", fontSize: "0.8rem" }}>
          Tell us the amount and purpose → we match you with the cheapest facility → apply in one tap. Rates are locked for 14 days.
        </div>
      </div>
      <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("apply")}>
        <i className="bi bi-lightning-charge me-1" /> Launch the matcher
      </button>
    </div>
  );
}
