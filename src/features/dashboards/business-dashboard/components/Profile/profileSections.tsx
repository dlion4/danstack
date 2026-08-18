import { useState } from "react";
import { SECTOR_PRESETS, fmtK, fmtKES } from "./data";
import { useStore } from "./store";
import { Badge, Chip, EmptyState, Kpi, Section, StatusBadge } from "./ui";

/* ==================================================================
   PAGE HEADER
================================================================== */
export function PageHeader() {
  const { profile, portfolio, openModal, verifyKraPin } = useStore();
  const activeCount = portfolio.filter((b) => b.status === "Active").length;
  return (
    <div className="pm-banner-hero p-4 d-flex flex-wrap align-items-center gap-3">
      <div className="flex-grow-1" style={{ minWidth: 280 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="pm-zone" style={{ background: "linear-gradient(90deg, #475467, #101828)" }}><i className="bi bi-sliders" /> RUN</span>
          <span className="badge-soft green">Page 5 · 2 sections</span>
        </div>
        <h1 className="mb-1" style={{ fontSize: "1.6rem", fontWeight: 800 }}>Business Profile &amp; KYB</h1>
        <p className="mb-0" style={{ color: "#b9c7d8", fontSize: "0.86rem", maxWidth: 640 }}>
          The control room. Who your business is, what compliance level you hold,
          and how your portfolio of entities is organized.
        </p>
      </div>
      <div className="d-flex flex-column gap-2 align-items-lg-end">
        <div className="d-flex align-items-center gap-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14 }}>
          <div className="text-center">
            <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "Sora", color: "#7ee2b0" }}>Level 2</div>
            <div style={{ fontSize: "0.62rem", color: "#b9c7d8", letterSpacing: "0.08em" }}>COMPLIANCE</div>
          </div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.18)" }} />
          <div>
            <div className="fw-bold" style={{ fontSize: "0.86rem" }}>KES 5M / day limits · {activeCount} of {portfolio.length} active</div>
            <div className="pm-prod-meta" style={{ color: "#b9c7d8" }}>{profile.kraVerified ? "KRA PIN verified ✓" : "KRA PIN needs verification"} · CR12 renewing soon</div>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("editProfile")}><i className="bi bi-pencil-square me-1" /> Edit Profile</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("kybCenter")}><i className="bi bi-shield-check me-1" /> KYB Center</button>
          {!profile.kraVerified && <button type="button" className="btn btn-light btn-sm" onClick={verifyKraPin}><i className="bi bi-check-circle me-1" /> Verify KRA</button>}
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   SECTION 1 — BUSINESS PROFILE & KYB
================================================================== */
export function BusinessProfileSection() {
  const { profile, kybDocs, directors, taxRegistrations, appliedPresets, openModal, applyPreset } = useStore();
  const verified = kybDocs.filter((d) => d.status === "Verified").length;
  const totalRequired = kybDocs.filter((d) => d.required).length;
  const pct = Math.round((verified / totalRequired) * 100);
  const missing = kybDocs.filter((d) => d.required && d.status === "Missing").length;
  const expiring = kybDocs.filter((d) => d.status === "Expiring soon").length;
  const activeTaxes = taxRegistrations.filter((t) => t.registered).length;

  return (
    <>
      <Section no="5.1" title="Business Profile &amp; KYB (Know Your Business)"
        sub="Master identity record used by PayMo, KRA, CBK & banks — flows into every invoice, receipt and payment page."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("share")}>
              <i className="bi bi-share me-1" /> Share profile
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("exportPack")}>
              <i className="bi bi-download me-1" /> Export pack
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("editProfile")}>
              <i className="bi bi-pencil-square me-1" /> Edit profile
            </button>
          </>
        }
      />

      {/* Business Identity Card */}
      <div className="pm-card mb-3">
        <div className="row g-3">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-3 mb-3">
              <span style={{ width: 62, height: 62, borderRadius: 14, background: profile.primaryColor, color: "#fff", display: "grid", placeItems: "center", fontSize: "1.8rem" }}>{profile.logoEmoji}</span>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <b style={{ fontSize: "1.1rem", color: profile.secondaryColor }}>{profile.legalName}</b>
                  {profile.tradingName && profile.tradingName !== profile.legalName && <Badge tone="slate">trades as “{profile.tradingName}”</Badge>}
                  <Badge tone="green">{profile.entityType}</Badge>
                </div>
                <div className="pm-prod-meta">Reg. {profile.regNumber} · Founded {profile.regDate}</div>
              </div>
            </div>
            <div className="row g-2">
              <div className="col-md-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                <div className="pm-kpi-label">KRA PIN</div>
                <div className="d-flex align-items-center gap-2">
                  <b className="pm-mono">{profile.kraPin}</b>
                  {profile.kraVerified ? <Badge tone="green"><i className="bi bi-check-circle-fill me-1" />Verified</Badge> : <Badge tone="amber">Unverified</Badge>}
                </div>
              </div></div>
              <div className="col-md-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                <div className="pm-kpi-label">Financial year end</div><b>{profile.fyEnd}</b>
              </div></div>
              <div className="col-md-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                <div className="pm-kpi-label">Business email</div><b style={{ fontSize: "0.82rem" }}>{profile.email}</b>
              </div></div>
              <div className="col-md-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                <div className="pm-kpi-label">Business phone</div><b>{profile.phone}</b>
              </div></div>
              <div className="col-12"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                <div className="pm-kpi-label">Physical address</div><b style={{ fontSize: "0.84rem" }}>{profile.address}</b>
                <div className="pm-prod-meta">{profile.county}</div>
              </div></div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="pm-brand-preview p-3 h-100" style={{ background: profile.primaryColor + "12", border: `1px solid ${profile.primaryColor}40`, borderRadius: 12 }}>
              <div className="pm-kpi-label mb-1">Brand identity preview</div>
              <div className="d-flex gap-2 mb-3">
                <div className="text-center">
                  <div style={{ width: 60, height: 42, background: profile.primaryColor, borderRadius: 8 }} />
                  <div className="pm-prod-meta pm-mono mt-1" style={{ fontSize: "0.66rem" }}>{profile.primaryColor}</div>
                </div>
                <div className="text-center">
                  <div style={{ width: 60, height: 42, background: profile.secondaryColor, borderRadius: 8 }} />
                  <div className="pm-prod-meta pm-mono mt-1" style={{ fontSize: "0.66rem" }}>{profile.secondaryColor}</div>
                </div>
              </div>
              <div style={{ fontSize: "0.78rem" }}>
                <b style={{ color: profile.secondaryColor }}>{profile.tradingName || profile.legalName}</b><br />
                <span className="pm-prod-meta">{profile.website} · {profile.instagram}</span>
              </div>
              <div className="pm-prod-meta mt-2">Applied to invoices, payment links & customer portal.</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI band */}
      <div className="pm-stat-grid">
        <Kpi icon="bi-shield-fill-check" iconBg="var(--pm-green-soft)" label="Compliance level" value="Level 2" delta="Full KYB" footer="up to KES 5M / day" />
        <Kpi icon="bi-check2-circle" iconBg="#e8f1fe" label="KYB documents verified" value={`${verified}/${totalRequired}`} delta={`${pct}%`} footer={`${missing} missing · ${expiring} expiring`} deltaGood={pct === 100} />
        <Kpi icon="bi-people" iconBg="#f0ebfe" label="Directors on file" value={String(directors.length)} delta={`${directors.filter((d) => d.beneficialOwner).length} beneficial owners`} footer={`${directors.reduce((a, b) => a + b.ownershipPct, 0)}% ownership accounted`} />
        <Kpi icon="bi-receipt-cutoff" iconBg="#fef0c7" label="Tax registrations" value={String(activeTaxes)} delta="VAT + PAYE + NSSF + SHIF" footer="drives monthly filing calendar" />
      </div>

      {/* KYB checklist strip */}
      <div className="pm-card mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <b style={{ fontSize: "0.9rem" }}>KYB checklist</b>
            <div className="pm-prod-meta">Encrypted at rest · shared only with PayMo compliance</div>
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("complianceLevels")}>
              <i className="bi bi-info-circle me-1" /> Level explainer
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("kybCenter")}>
              <i className="bi bi-shield-check me-1" /> Full KYB center
            </button>
          </div>
        </div>
        <div className="progress mb-3" style={{ height: 10 }}>
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <div className="row g-2">
          {kybDocs.map((d) => (
            <div className="col-lg-4 col-md-6" key={d.id}>
              <div className="d-flex align-items-center gap-2 p-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10, cursor: "pointer" }} onClick={() => d.status === "Missing" || d.status === "Expiring soon" ? openModal("uploadDoc", { docId: d.id }) : openModal("kybCenter")}>
                <i className={`bi ${d.status === "Verified" ? "bi-patch-check-fill text-primary" : d.status === "Under Review" ? "bi-hourglass-split" : d.status === "Expiring soon" ? "bi-clock-history" : "bi-exclamation-circle-fill"}`} style={{ color: d.status === "Missing" ? "var(--pm-danger)" : d.status === "Expiring soon" ? "var(--pm-warn)" : undefined }} />
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="fw-semibold text-truncate" style={{ fontSize: "0.78rem" }}>{d.label}</div>
                  <div className="pm-prod-meta">{d.uploaded ? `uploaded ${d.uploaded}` : d.desc}</div>
                </div>
                <StatusBadge status={d.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Directors + Tax registrations row */}
      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between mb-2">
              <b style={{ fontSize: "0.9rem" }}>Directors &amp; beneficial ownership</b>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal("addDirector")}><i className="bi bi-person-plus me-1" />Add director</button>
            </div>
            <div className="table-responsive">
              <table className="table pm-table align-middle">
                <thead><tr><th>Name</th><th>Role</th><th>KRA PIN</th><th className="text-end">Ownership</th><th>Docs</th><th></th></tr></thead>
                <tbody>
                  {directors.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="pm-avatar" style={{ width: 30, height: 30, fontSize: "0.66rem" }}>{d.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                          <div><b style={{ fontSize: "0.82rem" }}>{d.name}</b>{d.beneficialOwner && <div><Badge tone="amber" className="mt-1">Beneficial owner</Badge></div>}</div>
                        </div>
                      </td>
                      <td className="pm-prod-meta">{d.role}</td>
                      <td className="pm-mono pm-prod-meta">{d.kraPin}</td>
                      <td className="text-end fw-bold">{d.ownershipPct}%</td>
                      <td>
                        {d.idUploaded ? <i className="bi bi-check-circle-fill text-primary me-1" title="ID uploaded" /> : <i className="bi bi-x-circle me-1" style={{ color: "var(--pm-danger)" }} />}
                        {d.pinUploaded ? <i className="bi bi-check-circle-fill text-primary" title="PIN uploaded" /> : <i className="bi bi-x-circle" style={{ color: "var(--pm-danger)" }} />}
                      </td>
                      <td><button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }} onClick={() => openModal("kybCenter")}><i className="bi bi-chevron-right" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-note soft"><i className="bi bi-shield-check me-1" />CBK requires all beneficial owners (25%+ control) to be declared.</div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between mb-2">
              <b style={{ fontSize: "0.9rem" }}>Tax registrations</b>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal("taxReg")}><i className="bi bi-pencil me-1" />Manage</button>
            </div>
            {taxRegistrations.map((t) => (
              <div key={t.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <span className={`pm-dot-live`} style={{ background: t.registered ? "var(--pm-green)" : "#98a2b3" }} />
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <b style={{ fontSize: "0.82rem" }}>{t.short}</b>
                  <div className="pm-prod-meta">{t.registered && t.certNumber ? t.certNumber : t.registered ? "Registered" : "Not applicable"}</div>
                </div>
                {t.registered ? <Badge tone="green">Active</Badge> : <Badge tone="slate">Off</Badge>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sector presets */}
      <div className="pm-card mt-3">
        <div className="d-flex justify-content-between mb-2">
          <div>
            <b style={{ fontSize: "0.9rem" }}><i className="bi bi-magic me-1" style={{ color: "var(--pm-green-dark)" }} />Sector presets</b>
            <div className="pm-prod-meta">Industry-tailored configuration in seconds — CoA, invoice defaults, active modules.</div>
          </div>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal("sectorPresets")}><i className="bi bi-arrow-right me-1" />Browse all presets</button>
        </div>
        <div className="row g-2">
          {SECTOR_PRESETS.map((p) => {
            const applied = appliedPresets.includes(p.id);
            return (
              <div className="col-lg-4 col-md-6" key={p.id}>
                <div className={`pm-card pm-card-hover h-100 ${applied ? "sel" : ""}`} onClick={() => applied ? openModal("sectorPresets") : applyPreset(p.id)} style={{ borderColor: applied ? "var(--pm-green)" : undefined }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span style={{ fontSize: "1.4rem" }}>{p.emoji}</span>
                    <b style={{ fontSize: "0.86rem" }}>{p.name}</b>
                    {applied && <Badge tone="green" className="ms-auto">Applied</Badge>}
                  </div>
                  <div className="pm-prod-meta">{p.desc}</div>
                  <div className="pm-prod-meta mt-1"><i className="bi bi-list-check me-1" />{p.changes.length} settings changed</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   SECTION 2 — MULTI-BUSINESS PORTFOLIO MANAGEMENT
================================================================== */
export function PortfolioSection() {
  const { portfolio, folders, openModal, setCurrentBusinessId, searchQuery } = useStore();
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const q = searchQuery.trim().toLowerCase();
  const filtered = portfolio.filter((b) => (filter === "all" || b.status.toLowerCase() === filter) && (folderFilter === "all" || b.folder === folderFilter) && (!q || (b.name + b.kraPin).toLowerCase().includes(q)));
  const totalCash = portfolio.reduce((a, b) => a + b.cash, 0);
  const totalRevenue = portfolio.reduce((a, b) => a + b.revenueMTD, 0);

  return (
    <>
      <Section no="5.2" title="Multi-Business Portfolio Management"
        sub="Every business under one login — books stay legally separate, but access flows through this control room."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("folderManager")}>
              <i className="bi bi-folder me-1" /> Manage folders
            </button>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("newRental")}>
              <i className="bi bi-house-add me-1" /> Add Rental Property
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("newBusiness")}>
              <i className="bi bi-plus-lg me-1" /> Add New Business
            </button>
          </>
        }
      />
      <div className="pm-stat-grid">
        <Kpi icon="bi-buildings" iconBg="var(--pm-green-soft)" label="Businesses in portfolio" value={String(portfolio.length)} delta={`${portfolio.filter((b) => b.status === "Active").length} active`} footer={`${portfolio.filter((b) => b.status === "Inactive").length} inactive · ${portfolio.filter((b) => b.status === "Suspended").length} suspended`} />
        <Kpi icon="bi-folder" iconBg="#f0ebfe" label="Portfolio folders" value={String(folders.length)} delta="drag & drop to organise" footer="virtual grouping · ledgers stay separate" />
        <Kpi icon="bi-cash-stack" iconBg="#e8f1fe" label="Total group cash" value={fmtKES(totalCash)} delta={fmtK(totalCash) + " group balance"} footer="across all active businesses" />
        <Kpi icon="bi-graph-up-arrow" iconBg="#fef0c7" label="Group revenue MTD" value={fmtKES(totalRevenue)} delta="all sources" footer="deep view on Portfolio page" />
      </div>

      <div className="pm-card mt-3">
        {/* filters */}
        <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
          <div className="d-flex gap-1 flex-wrap">
            {(["all", "active", "inactive", "suspended"] as const).map((f) => (
              <Chip key={f} on={filter === f} onClick={() => setFilter(f)}>{f === "all" ? "All statuses" : f.charAt(0).toUpperCase() + f.slice(1)}</Chip>
            ))}
          </div>
          <div className="d-flex gap-1 flex-wrap ms-lg-3">
            <Chip on={folderFilter === "all"} onClick={() => setFolderFilter("all")}>All folders</Chip>
            {folders.map((f) => <Chip key={f.id} on={folderFilter === f.id} onClick={() => setFolderFilter(f.id)}>{f.emoji} {f.name}</Chip>)}
          </div>
          <span className="ms-auto pm-prod-meta">{filtered.length} of {portfolio.length} shown</span>
        </div>

        {/* business cards */}
        <div className="row g-3">
          {filtered.map((b) => {
            const folder = folders.find((f) => f.id === b.folder);
            const net = b.revenueMTD - b.expensesMTD;
            return (
              <div className="col-lg-4 col-md-6" key={b.id}>
                <div className="pm-card pm-card-hover h-100" onClick={() => openModal("businessDrawer", { id: b.id })} style={{ borderLeft: `4px solid ${b.color}` }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ width: 40, height: 40, borderRadius: 10, background: b.color + "22", color: b.color, display: "grid", placeItems: "center", fontSize: "1.1rem" }}>{b.emoji}</span>
                      <div>
                        <b style={{ fontSize: "0.88rem" }}>{b.name}</b>
                        <div className="pm-prod-meta">{b.entityType}{b.units ? ` · ${b.units} units` : ""}</div>
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="d-flex gap-2 mb-2 flex-wrap">
                    <Badge tone="slate">{folder?.emoji} {folder?.name}</Badge>
                    <StatusBadge status={b.kybLevel} />
                  </div>
                  <div className="row g-2">
                    <div className="col-4"><div className="pm-card py-1 px-2 text-center" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label" style={{ fontSize: "0.6rem" }}>Cash</div><b style={{ fontSize: "0.72rem" }}>{fmtK(b.cash)}</b></div></div>
                    <div className="col-4"><div className="pm-card py-1 px-2 text-center" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label" style={{ fontSize: "0.6rem" }}>Revenue</div><b style={{ fontSize: "0.72rem" }}>{fmtK(b.revenueMTD)}</b></div></div>
                    <div className="col-4"><div className="pm-card py-1 px-2 text-center" style={{ boxShadow: "none", background: net < 0 ? "#fef6f5" : "var(--pm-green-soft)" }}><div className="pm-kpi-label" style={{ fontSize: "0.6rem" }}>Net</div><b style={{ fontSize: "0.72rem", color: net < 0 ? "var(--pm-danger)" : "var(--pm-green-dark)" }}>{fmtK(net)}</b></div></div>
                  </div>
                  <div className="pm-prod-meta mt-2"><i className="bi bi-clock-history me-1" />Last active: {b.lastActivity}</div>
                  <div className="d-flex gap-1 mt-2 flex-wrap">
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); setCurrentBusinessId(b.id); }}><i className="bi bi-box-arrow-in-right me-1" />Switch</button>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); openModal("editProfile"); }}><i className="bi bi-pencil me-1" />Edit</button>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); openModal("businessDrawer", { id: b.id }); }}><i className="bi bi-eye me-1" />Details</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && <EmptyState icon="bi-buildings" title="No businesses match" text="Try clearing filters or search." />}

        {/* Portfolio grouping strip */}
        <div className="row g-3 mt-3">
          {folders.map((f) => {
            const members = portfolio.filter((b) => b.folder === f.id);
            const aggCash = members.reduce((a, b) => a + b.cash, 0);
            return (
              <div className="col-lg-4" key={f.id}>
                <div className="pm-card h-100" style={{ borderLeft: `4px solid ${f.color}`, background: f.color + "08" }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span style={{ fontSize: "1.4rem" }}>{f.emoji}</span>
                    <b style={{ fontSize: "0.9rem" }}>{f.name}</b>
                    <Badge tone="slate" className="ms-auto">{members.length}</Badge>
                  </div>
                  <div className="pm-prod-meta mb-2">{members.map((m) => m.name).join(" · ")}</div>
                  <div className="d-flex justify-content-between">
                    <span className="pm-prod-meta">Group cash</span>
                    <b>{fmtKES(aggCash)}</b>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="pm-note soft mt-3"><i className="bi bi-info-circle me-1" />Detailed per-business dashboards, consolidated P&amp;L and inter-company transfers live on the dedicated <b>Multi-Business Portfolio</b> page. This section is for <b>management &amp; configuration</b>.</div>
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
    <div className="pm-card mt-4 d-flex flex-wrap align-items-center gap-3" style={{ background: "linear-gradient(90deg, #0b1322, #1f2937)", border: "none", color: "#fff" }}>
      <span style={{ fontSize: "1.6rem" }}>🧭</span>
      <div className="flex-grow-1" style={{ minWidth: 260 }}>
        <b style={{ fontSize: "0.95rem" }}>Guided flows on this page</b>
        <div style={{ color: "#b9c7d8", fontSize: "0.8rem" }}>
          Edit Profile (6 steps) · Upload KYB Document (4) · Add Business (5) · Add Rental Property (5, rich preset) · Sector Presets (4) · Add Director / Beneficial Owner (3). Every change auto-flows to invoices, tax filings and the payment pages.
        </div>
      </div>
      <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("editProfile")}>
        <i className="bi bi-magic me-1" /> Edit business profile
      </button>
    </div>
  );
}
