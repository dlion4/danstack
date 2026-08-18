import { useMemo } from "react";
import { COVER_GAPS, fmtKES, fmtKESK } from "./data";
import { useStore } from "./store";
import { Badge, Kpi, Section, StatusBadge } from "./ui";

/* ==================================================================
   PAGE HEADER
================================================================== */
export function PageHeader() {
  const { policies, openModal } = useStore();
  const active = policies.filter((p) => p.status === "Active").length;
  const totalCover = policies.reduce((a, p) => a + p.cover, 0);
  return (
    <div className="pm-banner-hero p-4 d-flex flex-wrap align-items-center gap-3">
      <div className="flex-grow-1" style={{ minWidth: 280 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="pm-zone" style={{ background: "linear-gradient(90deg, #7a5af8, #0e7490)" }}><i className="bi bi-shield-check" /> GROW</span>
          <span className="badge-soft green">Page 11 · 5 sections</span>
        </div>
        <h1 className="mb-1" style={{ fontSize: "1.6rem", fontWeight: 800 }}>Insurance &amp; Protection</h1>
        <p className="mb-0" style={{ color: "#b9c7d8", fontSize: "0.86rem", maxWidth: 640 }}>
          Every policy, claim and beneficiary in one place — with renewal radars so
          coverage never lapses when you need it most.
        </p>
      </div>
      <div className="d-flex flex-column gap-2 align-items-lg-end">
        <div className="d-flex align-items-center gap-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14 }}>
          <div className="text-center">
            <div style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "Sora", color: "#7ee2b0" }}>{fmtKESK(totalCover)}</div>
            <div style={{ fontSize: "0.62rem", color: "#b9c7d8", letterSpacing: "0.08em" }}>TOTAL COVER</div>
          </div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.18)" }} />
          <div>
            <div className="fw-bold" style={{ fontSize: "0.86rem" }}>{active} of {policies.length} policies active</div>
            <div className="pm-prod-meta" style={{ color: "#b9c7d8" }}>6 licensed underwriters · claims paid in 3 days avg</div>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("claim")}><i className="bi bi-shield-exclamation me-1" /> File a Claim</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("policy")}><i className="bi bi-shield-plus me-1" /> Get a Quote</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("renewals")}><i className="bi bi-calendar-event me-1" /> Renewals</button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   11.1 COVER COMMAND CENTER
================================================================== */
export function CoverCommandCenter() {
  const { policies, claims, openModal } = useStore();
  const active = policies.filter((p) => p.status === "Active").length;
  const expiring = policies.filter((p) => p.status === "Expiring soon").length;
  const totalCover = policies.reduce((a, p) => a + p.cover, 0);
  const monthly = policies.filter((p) => p.frequency === "Monthly").reduce((a, p) => a + p.premium, 0);
  const openClaims = claims.filter((c) => c.status === "Open" || c.status === "Under review");
  const paid = claims.filter((c) => c.status === "Paid").reduce((a, c) => a + c.amount, 0);

  return (
    <>
      <Section no="11.1" title="Cover Command Center"
        sub="The state of your protection — and where the gaps are."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("renewals")}>
              <i className="bi bi-calendar-event me-1" /> Renewals
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("policy")}>
              <i className="bi bi-shield-plus me-1" /> Get a quote
            </button>
          </>
        }
      />
      <div className="pm-stat-grid">
        <Kpi icon="bi-shield-fill-check" iconBg="var(--pm-green-soft)" label="Active policies" value={String(active)} delta={`${expiring} expiring soon`} deltaGood={expiring === 0} footer={`${policies.length} total in force`} />
        <Kpi icon="bi-buildings" iconBg="#e8f1fe" label="Total cover" value={fmtKESK(totalCover)} delta="+KES 4M cyber" footer="across 5 underwriters" />
        <Kpi icon="bi-cash-coin" iconBg="#fef0c7" label="Premiums" value={fmtKESK(monthly) + "/mo"} delta="12% of revenue" footer="auto-paid from Cash & Accounts" />
        <Kpi icon="bi-shield-exclamation" iconBg="#f0ebfe" label="Claims in review" value={String(openClaims.length)} delta={`${fmtKES(paid)} paid YTD`} footer="avg 3-day settlement" />
      </div>

      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <div className="pm-card h-100">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Coverage radar — gaps to close</div>
            {COVER_GAPS.map((g) => (
              <div key={g.title} className="d-flex gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <i className={`bi ${g.icon}`} style={{ color: g.tone, width: 22 }} />
                <div className="flex-grow-1">
                  <b style={{ fontSize: "0.82rem" }}>{g.title}</b>
                  <div className="pm-prod-meta">{g.text}</div>
                </div>
              </div>
            ))}
            <div className="pm-note soft mt-3"><i className="bi bi-lightbulb me-1" />Closing all three gaps makes your business "fully protected" — a tick that unlocks better lending rates.</div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="pm-card h-100">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Why coverage matters</div>
            <div className="pm-prod-meta" style={{ fontSize: "0.78rem", lineHeight: 1.6 }}>
              <p>The 2025 Nairobi floods hit 1 in 4 SMEs without flood cover — average uninsured loss KES 3.2M. Your stock &amp; premises policy covers flood up to KES 8M.</p>
              <p className="mb-0">WIBA is mandatory for all Kenyan employers; lapses attract fines of KES 100K per incident. Renewals are auto-quoted 30 days ahead.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   11.2 POLICIES
================================================================== */
export function PoliciesSection() {
  const { policies, openModal, renewPolicy, reinstatePolicy } = useStore();
  const sorted = useMemo(() => {
    const order: Record<string, number> = { "Expiring soon": 0, Lapsed: 1, Pending: 2, Active: 3 };
    return [...policies].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  }, [policies]);
  return (
    <>
      <Section no="11.2" title="Policies"
        sub="Every policy you hold — renewals and gaps flagged automatically."
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("policy")}>
            <i className="bi bi-shield-plus me-1" /> Get a quote
          </button>
        }
      />
      <div className="row g-3">
        {sorted.map((p) => (
          <div className="col-md-6 col-xl-4" key={p.id}>
            <div className="pm-card h-100">
              <div className="d-flex align-items-start gap-2 mb-2">
                <span className="pm-kpi-icon" style={{ background: p.status === "Lapsed" ? "#fef3f2" : p.status === "Expiring soon" ? "#fef0c7" : "var(--pm-green-soft)", color: p.status === "Lapsed" ? "#b42318" : p.status === "Expiring soon" ? "#b54708" : "var(--pm-green-dark)" }}>
                  <i className={`bi ${p.icon}`} />
                </span>
                <div className="flex-grow-1">
                  <div className="fw-bold" style={{ fontSize: "0.86rem" }}>{p.name}</div>
                  <div className="pm-prod-meta">{p.provider} · since {p.started}</div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="d-flex align-items-end justify-content-between mb-1">
                <span style={{ fontSize: "1.15rem", fontWeight: 800, fontFamily: "Sora" }}>{fmtKESK(p.cover)}</span>
                <span className="pm-prod-meta">{fmtKES(p.premium)}/{p.frequency === "Annual" ? "yr" : "mo"}</span>
              </div>
              <div className="pm-prod-meta mb-2">Renews {p.expires}</div>
              <ul className="mb-3 ps-3" style={{ fontSize: "0.74rem", color: "var(--pm-muted)" }}>
                {p.perils.slice(0, 3).map((x) => <li key={x}>{x}</li>)}
              </ul>
              <div className="d-flex gap-2">
                {p.status === "Expiring soon" && (
                  <button type="button" className="btn btn-sm btn-warning flex-grow-1" onClick={() => renewPolicy(p.id)}>
                    <i className="bi bi-arrow-clockwise me-1" />Renew now
                  </button>
                )}
                {p.status === "Lapsed" && (
                  <button type="button" className="btn btn-sm btn-warning flex-grow-1" onClick={() => reinstatePolicy(p.id)}>
                    <i className="bi bi-arrow-counterclockwise me-1" />Reinstate
                  </button>
                )}
                {p.status === "Pending" && (
                  <button type="button" className="btn btn-sm btn-outline-secondary flex-grow-1" onClick={() => openModal("activateCyber")}>
                    <i className="bi bi-shield-lock me-1" />Activate
                  </button>
                )}
                {(p.status === "Active" || p.status === "Claim paid") && (
                  <button type="button" className="btn btn-sm btn-outline-secondary flex-grow-1" onClick={() => openModal("policyDetail", { policyId: p.id })}>
                    <i className="bi bi-eye me-1" />View
                  </button>
                )}
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("policyDetail", { policyId: p.id })}>
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
   11.3 CLAIMS
================================================================== */
export function ClaimsSection() {
  const { claims, updateClaimStatus, openModal } = useStore();
  return (
    <>
      <Section no="11.3" title="Claims"
        sub="Track every claim from lodgement to payout."
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("claim")}>
            <i className="bi bi-shield-exclamation me-1" /> File a claim
          </button>
        }
      />
      <div className="pm-card">
        {claims.map((c, i) => (
          <div key={c.id} className="d-flex flex-wrap align-items-center gap-3 py-3" style={{ borderBottom: i < claims.length - 1 ? "1px solid var(--pm-border)" : undefined }}>
            <div className="flex-grow-1" style={{ minWidth: 220 }}>
              <div className="d-flex align-items-center gap-2">
                <b style={{ fontSize: "0.85rem" }}>{c.id}</b>
                <Badge tone="slate">{c.policyName}</Badge>
              </div>
              <div className="pm-prod-meta">{c.date} · {c.note}</div>
            </div>
            <b style={{ fontSize: "0.86rem" }}>{fmtKES(c.amount)}</b>
            <StatusBadge status={c.status} />
            {(c.status === "Under review" || c.status === "Open") && (
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("claimDetail", { claimId: c.id })}>
                <i className="bi bi-eye" />
              </button>
            )}
            {c.status === "Approved" && (
              <button type="button" className="btn btn-sm btn-primary" onClick={() => updateClaimStatus(c.id, "Paid")}>
                <i className="bi bi-cash-coin me-1" />Mark paid
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   11.4 BENEFICIARIES
================================================================== */
export function BeneficiariesSection() {
  const { beneficiaries } = useStore();
  const total = beneficiaries.reduce((a, b) => a + b.share, 0);
  return (
    <>
      <Section no="11.4" title="Beneficiaries"
        sub="Who the business-protection payouts go to — percentages must total 100%."
      />
      <div className="pm-card">
        <div className="d-flex gap-3 flex-wrap">
          {beneficiaries.map((b) => (
            <div key={b.id} className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 240, padding: "10px 0" }}>
              <span className="pm-avatar" style={{ width: 36, height: 36 }}>{b.name.slice(0, 2)}</span>
              <div className="flex-grow-1">
                <div className="fw-semibold" style={{ fontSize: "0.82rem" }}>{b.name}</div>
                <div className="pm-prod-meta">{b.relationship}</div>
              </div>
              <div className="text-end">
                <b style={{ fontSize: "0.9rem" }}>{b.share}%</b>
                <div className="progress mt-1" style={{ height: 5, width: 80 }}>
                  <div className="progress-bar" style={{ width: b.share }} />
                </div>
              </div>
            </div>
          ))}
          <div className="d-flex align-items-center gap-2" style={{ padding: "10px 0" }}>
            <span className="pm-kpi-icon" style={{ width: 36, height: 36, fontSize: "0.8rem", background: "#e8f1fe", color: "var(--pm-blue)" }}><i className="bi bi-check-lg" /></span>
            <div>
              <div className="fw-semibold" style={{ fontSize: "0.8rem" }}>Total {total}%</div>
              <div className="pm-prod-meta">Allocation valid</div>
            </div>
          </div>
        </div>
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
    <div className="pm-card mt-4 d-flex flex-wrap align-items-center gap-3" style={{ background: "linear-gradient(90deg, #0b1322, #12304b)", border: "none", color: "#fff" }}>
      <span style={{ fontSize: "1.6rem" }}>🛡️</span>
      <div className="flex-grow-1" style={{ minWidth: 260 }}>
        <b style={{ fontSize: "0.95rem" }}>Coverage Check — a guided 4-step review</b>
        <div style={{ color: "#b9c7d8", fontSize: "0.8rem" }}>
          Assets → People → Cyber → Continuity. Finds gaps, quotes three underwriters, and binds cover in one tap.
        </div>
      </div>
      <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("policy")}>
        <i className="bi bi-shield-plus me-1" /> Launch the check
      </button>
    </div>
  );
}
