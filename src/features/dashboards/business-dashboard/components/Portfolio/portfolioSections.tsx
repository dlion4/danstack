import { useState } from "react";
import { MONTHLY_RENT, VACANCY, fmtK, fmtKES } from "./data";
import { useStore } from "./store";
import { Badge, Kpi, Section, StatusBadge } from "./ui";

/* ==================================================================
   PAGE HEADER
================================================================== */
export function PageHeader() {
  const { entities, openModal } = useStore();
  const cash = entities.reduce((a, b) => a + b.cash, 0);
  const revenue = entities.reduce((a, b) => a + b.revenueMTD, 0);
  return (
    <div className="pm-banner-hero p-4 d-flex flex-wrap align-items-center gap-3">
      <div className="flex-grow-1" style={{ minWidth: 280 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="pm-zone" style={{ background: "linear-gradient(90deg, #475467, #101828)" }}><i className="bi bi-buildings" /> RUN</span>
          <span className="badge-soft green">Page 14 · 9 sections</span>
        </div>
        <h1 className="mb-1" style={{ fontSize: "1.6rem", fontWeight: 800 }}>Multi-Business Portfolio</h1>
        <p className="mb-0" style={{ color: "#b9c7d8", fontSize: "0.86rem", maxWidth: 640 }}>
          Five entities, one helicopter view. Consolidated numbers, strictly separate books,
          and a rental sub-system that runs your houses like businesses.
        </p>
      </div>
      <div className="d-flex flex-column gap-2 align-items-lg-end">
        <div className="d-flex align-items-center gap-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14 }}>
          <div className="text-center">
            <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "Sora", color: "#7ee2b0" }}>{fmtK(cash)}</div>
            <div style={{ fontSize: "0.62rem", color: "#b9c7d8", letterSpacing: "0.08em" }}>GROUP CASH</div>
          </div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.18)" }} />
          <div>
            <div className="fw-bold" style={{ fontSize: "0.86rem" }}>{fmtKES(revenue)} revenue MTD</div>
            <div className="pm-prod-meta" style={{ color: "#b9c7d8" }}>{entities.length} entities · 1 transfer awaiting approval</div>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("entityWizard")}><i className="bi bi-plus-lg me-1" /> Add Entity</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("transferWizard")}><i className="bi bi-arrow-left-right me-1" /> Transfer Funds</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("consolidatedPnL")}><i className="bi bi-journal-check me-1" /> Group P&amp;L</button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   14.1 PORTFOLIO OVERVIEW & CONSOLIDATED COMMAND CENTER
================================================================== */
export function PortfolioOverview() {
  const { entities, transfers, openModal, setCurrentEntityId } = useStore();
  const cash = entities.reduce((a, b) => a + b.cash, 0);
  const revenue = entities.reduce((a, b) => a + b.revenueMTD, 0);
  const expenses = entities.reduce((a, b) => a + b.expensesMTD, 0);
  const profit = revenue - expenses;
  const tax = entities.reduce((a, b) => a + b.taxExposure, 0);
  const movements = transfers.filter((t) => t.status === "Executed").slice(0, 3);

  return (
    <>
      <Section no="14.1" title="Portfolio Overview — Consolidated Command Center"
        sub="The only place all your businesses mix. Read-only at group level — every ledger stays strictly separate."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("exportData")}>
              <i className="bi bi-download me-1" /> Export report
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("consolidatedPnL")}>
              <i className="bi bi-journal-check me-1" /> Consolidated P&amp;L
            </button>
          </>
        }
      />
      <div className="pm-stat-grid">
        <Kpi icon="bi-cash-stack" iconBg="var(--pm-green-soft)" label="Total group cash" value={fmtKES(cash)} delta="+6.2%" footer="5 entities · all reconciled" />
        <Kpi icon="bi-graph-up-arrow" iconBg="#e8f1fe" label="Group revenue · MTD" value={fmtKES(revenue)} delta="+12.4%" footer="sales + rent + fees" />
        <Kpi icon="bi-graph-down-arrow" iconBg="#fef0c7" label="Group expenses · MTD" value={fmtKES(expenses)} delta="−2.1%" footer="58% of revenue" />
        <Kpi icon="bi-stars" iconBg="#f0ebfe" label="Group net profit" value={fmtKES(profit)} delta="+18.9%" footer="42% margin" />
        <Kpi icon="bi-receipt" iconBg="#fee4e2" label="Group tax exposure" value={fmtKES(tax)} delta="VAT + PAYE + installments" footer="due 9th & 20th" />
      </div>

      <div className="pm-kpi-label mt-3 mb-2">Entity performance — tap a card to jump into it</div>
      <div className="row g-3">
        {entities.map((e) => {
          const net = e.revenueMTD - e.expensesMTD;
          return (
            <div className="col-lg-4 col-md-6" key={e.id}>
              <div className="pm-card pm-card-hover h-100" onClick={() => openModal("entityDrawer", { id: e.id })}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="pm-kpi-icon" style={{ width: 40, height: 40, fontSize: "1.1rem", background: e.color + "22", color: e.color }}>{e.emoji}</span>
                  <StatusBadge status={e.status} />
                </div>
                <b style={{ fontSize: "0.9rem" }}>{e.name}</b>
                <div className="pm-prod-meta mb-2">{e.type}{e.type === "Rental" ? ` · ${e.units} units` : ""}</div>
                <div className="d-flex justify-content-between"><span className="pm-prod-meta">Net profit MTD</span><b className={net >= 0 ? "text-primary" : "pm-qtyneg"}>{fmtKES(net)}</b></div>
                <div className="d-flex justify-content-between"><span className="pm-prod-meta">Cash</span><b>{fmtKES(e.cash)}</b></div>
                <div className="mt-2">
                  <span className="badge-soft blue" onClick={(ev) => { ev.stopPropagation(); setCurrentEntityId(e.id); openModal("entityDrawer", { id: e.id }); }} style={{ cursor: "pointer" }}>
                    <i className="bi bi-box-arrow-in-right me-1" />Jump into entity →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pm-card mt-3">
        <div className="pm-kpi-label mb-2">Money movement between your entities this month</div>
        {movements.map((t) => (
          <div key={t.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
            <span className="fw-semibold" style={{ fontSize: "0.8rem" }}>{t.from}</span>
            <i className="bi bi-arrow-right text-primary" />
            <span className="fw-semibold" style={{ fontSize: "0.8rem" }}>{t.to}</span>
            <Badge tone="ink">{fmtKES(t.amount)}</Badge>
            <span className="pm-prod-meta flex-grow-1">({t.reason})</span>
            <button type="button" className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: "0.7rem" }} onClick={() => openModal("transferDetail", { id: t.id })}>View →</button>
          </div>
        ))}
        <div className="pm-note soft mt-2"><i className="bi bi-info-circle me-1" />All inter-company moves are free, instant and eliminated from consolidated reports.</div>
      </div>
    </>
  );
}

/* ==================================================================
   14.2 BUSINESS LIST, GROUPING & FOLDERS
================================================================== */
export function FoldersSection() {
  const { entities, folders, moveEntity, openModal, addFolder, toast } = useStore();
  const [newFolder, setNewFolder] = useState("");
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dragEnt, setDragEnt] = useState<string | null>(null);

  return (
    <>
      <Section no="14.2" title="Business List, Grouping &amp; Folders"
        sub="Drag any entity into a folder to reorganise. Folders are virtual — books stay legally separate."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("entityWizard")}>
            <i className="bi bi-plus-lg me-1" /> Add Entity
          </button>
        }
      />
      <div className="row g-3">
        {folders.map((f) => {
          const members = entities.filter((e) => e.folder === f.id);
          const aggCash = members.reduce((a, b) => a + b.cash, 0);
          const aggNet = members.reduce((a, b) => a + (b.revenueMTD - b.expensesMTD), 0);
          return (
            <div className="col-lg-4" key={f.id}>
              <div
                className="pm-card h-100"
                style={{ borderColor: dragOver === f.id ? "var(--pm-green)" : undefined, background: dragOver === f.id ? "var(--pm-green-soft)" : undefined }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(f.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => {
                  if (dragEnt) {
                    moveEntity(dragEnt, f.id);
                    setDragOver(null);
                    setDragEnt(null);
                  }
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span style={{ fontSize: "1.3rem" }}>{f.emoji}</span>
                  <b style={{ fontSize: "0.9rem" }}>{f.name}</b>
                  <Badge tone="slate" className="ms-auto">{members.length} entit{members.length === 1 ? "y" : "ies"}</Badge>
                </div>
                {members.map((e) => (
                  <div
                    key={e.id}
                    className="d-flex align-items-center gap-2 p-2 mb-2 pm-dragrow"
                    draggable
                    onDragStart={() => setDragEnt(e.id)}
                    onClick={() => openModal("entityDrawer", { id: e.id })}
                  >
                    <span className="me-1">{e.emoji}</span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="fw-semibold text-truncate" style={{ fontSize: "0.8rem" }}>{e.name}</div>
                      <div className="pm-prod-meta">{e.type} · cash {fmtKES(e.cash)}</div>
                    </div>
                    <i className="bi bi-grip-vertical pm-prod-meta" />
                  </div>
                ))}
                {members.length === 0 && <div className="pm-prod-meta">Empty folder — drag an entity here.</div>}
                <div className="d-flex justify-content-between mt-2 pt-2" style={{ borderTop: "1px solid var(--pm-border)" }}>
                  <div>
                    <div className="pm-kpi-label">Group cash</div><b style={{ fontSize: "0.8rem" }}>{fmtKES(aggCash)}</b>
                  </div>
                  <div>
                    <div className="pm-kpi-label">Net profit</div><b className="text-primary" style={{ fontSize: "0.8rem" }}>{fmtKES(aggNet)}</b>
                  </div>
                </div>
                <button type="button" className="btn btn-outline-secondary btn-sm w-100 mt-2" disabled={members.length === 0} onClick={() => { openModal("consolidatedPnL"); toast(`Consolidated P&L filtered for ${f.name}.`, "info", "Group view"); }}>
                  <i className="bi bi-journal-check me-1" /> View consolidated P&amp;L
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="input-group mt-3" style={{ maxWidth: 420 }}>
        <input className="form-control" placeholder="New folder — e.g. Vehicles & Equipment" value={newFolder} onChange={(e) => setNewFolder(e.target.value)} />
        <button type="button" className="btn btn-outline-primary" disabled={!newFolder.trim()} onClick={() => { addFolder(newFolder.trim(), "🗂️"); toast(`Folder "${newFolder}" created.`, "success", "Folder added"); setNewFolder(""); }}>
          <i className="bi bi-folder-plus me-1" /> Add folder
        </button>
      </div>
      <div className="pm-note soft mt-3"><i className="bi bi-shield-check me-1" />Drag &amp; drop reorganisation is instant. A business can only live in one folder at a time.</div>
    </>
  );
}

/* ==================================================================
   14.3 ENTITY CREATION & TYPE PRESETS
================================================================== */
export function EntityCreationSection() {
  const { openModal } = useStore();
  const presets = [
    { icon: "🏠", t: "Rental Property", d: "Apartments & houses — tenants, deposits, maintenance, vacancy loss auto-tracked", steps: "4 guided steps", hot: true },
    { icon: "🏢", t: "Limited Company (Ltd)", d: "Trading, services, tech — KRA PIN + eTIMS pre-wired", steps: "3 guided steps" },
    { icon: "🧑‍💼", t: "Sole Proprietorship", d: "Side hustles under your name — instant start", steps: "3 guided steps" },
    { icon: "🤝", t: "SACCO / NGO", d: "Member funds & donor money with restricted accounts", steps: "3 guided steps" },
  ];
  return (
    <>
      <Section no="14.3" title="Entity Creation &amp; Type Presets"
        sub="Presets turn a 2-hour setup into a 5-minute wizard — the Rental preset even builds your chart of accounts."
        actions={
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("entityWizard")}>
            <i className="bi bi-plus-lg me-1" /> Add Entity
          </button>
        }
      />
      <div className="row g-3">
        {presets.map((p) => (
          <div className="col-lg-3 col-md-6" key={p.t}>
            <div className="pm-card pm-card-hover h-100 text-center" onClick={() => openModal("entityWizard")}>
              <span style={{ fontSize: "2rem" }}>{p.icon}</span>
              <div className="fw-bold mt-2" style={{ fontSize: "0.88rem" }}>{p.t}</div>
              <div className="pm-prod-meta mb-2" style={{ fontSize: "0.74rem" }}>{p.d}</div>
              <div className="d-flex justify-content-center gap-2">
                <Badge tone="blue">{p.steps}</Badge>
                {p.hot && <Badge tone="amber">Rich preset</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-card mt-3 d-flex flex-wrap align-items-center gap-3" style={{ background: "linear-gradient(110deg, #e7f8ef, #f6fff9 60%, #fff)", borderColor: "#b7e6cf" }}>
        <span style={{ fontSize: "1.6rem" }}>🏠</span>
        <div className="flex-grow-1" style={{ minWidth: 250 }}>
          <b style={{ fontSize: "0.92rem" }}>Try the Rental Property preset</b>
          <div className="pm-prod-meta">Creates: rental CoA · collections virtual account · recurring rent invoices per unit · a Property Manager role — then optionally adds your first tenant.</div>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("entityWizard")}>
          <i className="bi bi-magic me-1" /> Launch preset
        </button>
      </div>
    </>
  );
}

/* ==================================================================
   14.4 PROPERTY / RENTAL SUB-SYSTEM
================================================================== */
export function RentalSystemSection() {
  const { tenants, maintenance, openModal, currentEntityId } = useStore();
  const [tab, setTab] = useState<"rent" | "tenants" | "deposits" | "maintenance">("rent");
  const houseUnits = ["1A", "1B", "2A", "2B", "3A", "3B"];
  const expected = 6 * MONTHLY_RENT;
  const collected = expected - MONTHLY_RENT * 2; // 1 overdue + 1 vacant
  const house1 = tenants.filter((t) => t.entityId === "e3");
  const maintenanceH1 = maintenance.filter((m) => m.entityId === "e3");
  const openMaint = maintenanceH1.filter((m) => m.status !== "Resolved").length;
  const ctx = currentEntityId === "e3" || currentEntityId === "e4";

  return (
    <>
      <Section no="14.4" title="The Property / Rental Sub-System"
        sub={ctx ? "Rental context ACTIVE — rent collection, tenants, deposits, maintenance & vacancy all live here." : "Activated when the current entity is a Rental Property — switch via the entity menu (House 1 / House 2)."}
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("tenantWizard")}>
              <i className="bi bi-person-plus me-1" /> Add tenant
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("maintenanceWizard")}>
              <i className="bi bi-droplet me-1" /> Log issue
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("depositLedger", { entityId: "e3" })}>
              <i className="bi bi-cash-stack me-1" /> Deposits
            </button>
          </>
        }
      />
      <div className="pm-stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
        <div className="pm-card"><div className="pm-kpi-label">This month's rent (House 1)</div><div className="pm-kpi-value">{fmtKES(expected)}</div><div className="pm-prod-meta">6 units × KES 30,000</div></div>
        <div className="pm-card"><div className="pm-kpi-label">Collected</div><div className="pm-kpi-value" style={{ color: "var(--pm-green-dark)" }}>{fmtKES(collected)}</div><div className="pm-prod-meta">4 units paid ✓</div></div>
        <div className="pm-card"><div className="pm-kpi-label">Outstanding</div><div className="pm-kpi-value" style={{ color: "var(--pm-danger)" }}>{fmtKES(expected - collected)}</div><div className="pm-prod-meta">1 overdue · 1 vacant</div></div>
        <div className="pm-card"><div className="pm-kpi-label">Open maintenance</div><div className="pm-kpi-value">{openMaint}</div><div className="pm-prod-meta">{openMaint ? "1 emergency · 1 assigned" : "all clear"}</div></div>
      </div>

      <div className="pm-card mt-3">
        <ul className="nav nav-tabs border-0 mb-3">
          {([
            ["rent", "Rent dashboard"],
            ["tenants", "Tenant directory"],
            ["deposits", "Deposits"],
            ["maintenance", "Maintenance"],
          ] as const).map(([k, l]) => (
            <li className="nav-item" key={k}>
              <button type="button" className={`nav-link ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{l}</button>
            </li>
          ))}
        </ul>

        {tab === "rent" && (
          <div>
            <div className="row g-3">
              {houseUnits.map((u) => {
                const t = tenants.find((x) => x.unit === u && x.entityId === "e3");
                const tone = !t ? "slate" : t.status === "Active" ? "green" : t.status === "Overdue" ? "red" : "amber";
                return (
                  <div className="col-md-4 col-6" key={u}>
                    <div className={`pm-card pm-card-hover h-100 pm-unit-${tone}`} onClick={() => openModal("rentUnit", { unit: u, entityId: "e3" })}>
                      <div className="d-flex justify-content-between align-items-center">
                        <b style={{ fontSize: "0.9rem" }}>Unit {u}</b>
                        {!t ? <Badge tone="slate">Vacant</Badge> : <Badge tone={t.status === "Overdue" ? "red" : t.status === "Notice" ? "amber" : "green"}>{t.status}</Badge>}
                      </div>
                      <div className="pm-prod-meta mt-1">{t ? `${t.name} · ${t.phone}` : `vacancy loss ${fmtKES(VACANCY.loss)}`}</div>
                      <div className="fw-bold mt-1">{fmtKES(t ? t.rent : 0)}{t ? "/mo" : " lost"}</div>
                      <div className="progress mt-2" style={{ height: 6 }}>
                        <div className="progress-bar" style={{ width: !t ? "0%" : t.status === "Active" ? "100%" : "55%", background: t?.status === "Overdue" ? "var(--pm-danger)" : undefined }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pm-note soft mt-3"><i className="bi bi-info-circle me-1" />Tap any unit → tenant profile, rent status and one-tap reminder. Vacancy loss (KES {fmtKES(VACANCY.loss)} and counting) posts to the P&amp;L automatically.</div>
          </div>
        )}

        {tab === "tenants" && (
          <div className="table-responsive">
            <table className="table pm-table align-middle">
              <thead><tr><th>Tenant</th><th>Unit</th><th>Phone</th><th>Lease</th><th className="text-end">Rent</th><th className="text-end">Deposit</th><th>Status</th><th style={{ width: 40 }}></th></tr></thead>
              <tbody>
                {house1.map((t) => (
                  <tr key={t.id} className="row-select" onClick={() => openModal("tenantDrawer", { id: t.id })}>
                    <td><div className="d-flex align-items-center gap-2"><span className="pm-avatar" style={{ width: 30, height: 30, fontSize: "0.66rem" }}>{t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span><b style={{ fontSize: "0.82rem" }}>{t.name}</b></div></td>
                    <td><span className="badge-soft ink">{t.unit}</span></td>
                    <td className="pm-prod-meta">{t.phone}</td>
                    <td className="pm-prod-meta">{t.leaseStart} → {t.leaseEnd}</td>
                    <td className="text-end fw-bold" style={{ fontSize: "0.8rem" }}>{fmtKES(t.rent)}</td>
                    <td className="text-end pm-prod-meta">{fmtKES(t.deposit)}</td>
                    <td><StatusBadge status={t.status === "Active" ? "Active" : t.status === "Overdue" ? "Overdue" : t.status === "Notice" ? "Notice" : "Vacant"} /></td>
                    <td><button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }}><i className="bi bi-chevron-right" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "deposits" && (
          <div>
            <div className="pm-card mb-3" style={{ background: "var(--pm-green-soft)", border: "none" }}>
              <div className="d-flex justify-content-between"><span className="fw-bold">Security Deposits Held (liability)</span><b style={{ fontSize: "1.1rem" }}>{fmtKES(480000)}</b></div>
              <div className="pm-prod-meta mt-1">16 deposits · move-in credits are Dr Cash / Cr Liability · move-out reverses with documented deductions.</div>
            </div>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("depositLedger", { entityId: "e3" })}>
              <i className="bi bi-cash-stack me-1" /> Open deposit ledger &amp; move-out workflow
            </button>
          </div>
        )}

        {tab === "maintenance" && (
          <div className="table-responsive">
            <table className="table pm-table align-middle">
              <thead><tr><th>ID</th><th>Unit</th><th>Issue</th><th>Priority</th><th>Vendor</th><th className="text-end">Cost</th><th>Status</th><th style={{ width: 40 }}></th></tr></thead>
              <tbody>
                {maintenanceH1.map((m) => (
                  <tr key={m.id} className="row-select" onClick={() => openModal("maintenanceDetail", { id: m.id })}>
                    <td><span className="pm-mono fw-semibold" style={{ fontSize: "0.78rem" }}>{m.id}</span></td>
                    <td><span className="badge-soft ink">{m.unit}</span></td>
                    <td style={{ fontSize: "0.82rem", maxWidth: 260 }}>{m.issue}</td>
                    <td><Badge tone={m.priority === "Emergency" ? "red" : m.priority === "High" ? "amber" : "green"}>{m.priority}</Badge></td>
                    <td className="pm-prod-meta">{m.vendor || "—"}</td>
                    <td className="text-end pm-prod-meta">{m.cost ? fmtKES(m.cost) : "—"}</td>
                    <td><StatusBadge status={m.status} /></td>
                    <td><button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }}><i className="bi bi-chevron-right" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pm-note soft mt-2"><i className="bi bi-truck me-1" />Assigning a vendor creates a PO on Pay Suppliers — costs land on this property's P&amp;L, not the group's.</div>
          </div>
        )}
      </div>
    </>
  );
}

/* ==================================================================
   14.5 CONSOLIDATED FINANCIALS & ELIMINATIONS
================================================================== */
export function ConsolidationSection() {
  const { openModal, toast } = useStore();
  return (
    <>
      <Section no="14.5" title="Consolidated Financials &amp; Eliminations"
        sub="Banker-ready group reports. Inter-company money cancels out — see the true group picture."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { openModal("consolidatedBS"); toast("Balance sheet opened.", "info", "Report"); }}>
              <i className="bi bi-bank me-1" /> Balance sheet
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("consolidatedPnL")}>
              <i className="bi bi-journal-check me-1" /> Open consolidated P&amp;L
            </button>
          </>
        }
      />
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="pm-card h-100">
            <b style={{ fontSize: "0.9rem" }} className="d-block mb-2">How eliminations work</b>
            <div className="pm-note mb-2"><i className="bi bi-arrow-left-right me-1" />TechSolutions paid TS Retail KES 100,000 for an inventory system. Revenue for one, expense for the other — but the group didn't earn a shilling.</div>
            <div className="pm-note soft mb-2"><i className="bi bi-calculator me-1" />The consolidation engine matches the inter-company entry pairs and cancels them. What's left is the <b>true</b> group profit.</div>
            <div className="d-flex gap-2 flex-wrap">
              <Badge tone="green">KES 150,000 transfers eliminated this month</Badge>
              <Badge tone="blue">KES 20,000 markup eliminated</Badge>
              <Badge tone="violet">1 inter-company loan tracked</Badge>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between mb-1"><span className="fw-semibold">Unadjusted group profit</span><b>{fmtKES(662000)}</b></div>
            <div className="d-flex justify-content-between pm-prod-meta mb-1"><span>Eliminations</span><b>−KES 20,000</b></div>
            <div className="d-flex justify-content-between mb-3" style={{ borderTop: "1px dashed var(--pm-border)", paddingTop: 6 }}>
              <span className="fw-bold">Adjusted (true) profit</span><b className="text-primary">{fmtKES(642000)}</b>
            </div>
            <div className="pm-kpi-label mb-1">Unrealised profit note</div>
            <div className="pm-prod-meta mb-2">Inventory sold between your entities still on the books needs an accountant's adjustment — PayMo exports the raw data for them.</div>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("consolidatedPnL")}>
              <i className="bi bi-eye me-1" /> View full report with entity selector
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   14.6 PER-BUSINESS ACCESS CONTROL MATRIX
================================================================== */
export function MatrixSection() {
  const { team, entities, openModal } = useStore();
  return (
    <>
      <Section no="14.6" title="Per-Business Access Control Matrix"
        sub="Grandma sees only House A. The caretaker sees only his property. Your accountant sees everything read-only."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("matrix")}>
            <i className="bi bi-shield-lock me-1" /> Open matrix editor
          </button>
        }
      />
      <div className="pm-card">
        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead>
              <tr>
                <th style={{ minWidth: 140 }}>Team member</th>
                {entities.map((e) => <th key={e.id} className="text-center">{e.emoji}<br /><span style={{ fontSize: "0.6rem" }}>{e.name.split(" ")[0]}</span></th>)}
                <th>Inheritance</th>
              </tr>
            </thead>
            <tbody>
              {team.map((u) => (
                <tr key={u.id} className="row-select" onClick={() => openModal("matrix")}>
                  <td><div className="fw-semibold" style={{ fontSize: "0.8rem" }}>{u.name}</div><div className="pm-prod-meta">{u.role}</div></td>
                  {entities.map((e) => (
                    <td key={e.id} className="text-center">
                      <StatusBadge status={u.matrix[e.id]} />
                    </td>
                  ))}
                  <td className="pm-prod-meta" style={{ fontSize: "0.7rem", maxWidth: 150 }}>
                    {u.role === "Portfolio Owner" ? "Admin everywhere (locked)" : u.managerOf ? `Manages ${u.managerOf} — Standard inherited, overridable` : "No inheritance"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <div className="pm-note soft"><i className="bi bi-shield-check me-1" /><b>Enforced at the API layer.</b> Caretaker James requesting House 2 data gets a 403 before any query runs. "James viewed House 1 ledger" — every attempt is audit-logged.</div>
          </div>
          <div className="col-md-6">
            <div className="pm-note soft"><i className="bi bi-lightbulb me-1" />Add staff from the matrix editor — they start with <b>No Access</b> everywhere until you grant it.</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   14.7 INTER-COMPANY TRANSFERS & CONSOLIDATION RULES
================================================================== */
export function TransfersSection() {
  const { transfers, loans, openModal } = useStore();
  const pending = transfers.filter((t) => t.status === "Pending approval");
  return (
    <>
      <Section no="14.7" title="Inter-Company Transfers &amp; Consolidation Rules"
        sub="Move money between your own entities — free, instant, classified so reports stay clean."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("loanWizard")}>
              <i className="bi bi-bank me-1" /> Set up loan
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("transferWizard")}>
              <i className="bi bi-arrow-left-right me-1" /> Transfer funds
            </button>
          </>
        }
      />
      {pending.length > 0 && (
        <div className="pm-card mb-3 d-flex flex-wrap align-items-center gap-3" style={{ background: "#fef6f5", borderColor: "#f6d2cd" }}>
          <span className="pm-dot-live" style={{ background: "var(--pm-warn)" }} />
          <div className="flex-grow-1" style={{ minWidth: 240 }}>
            <b style={{ fontSize: "0.88rem" }}>{pending.length} transfer awaiting your approval</b>
            <div className="pm-prod-meta">{pending[0].id} · KES {pending[0].amount.toLocaleString()} · {pending[0].from} → {pending[0].to}</div>
          </div>
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("transferDetail", { id: pending[0].id })}>
            <i className="bi bi-check2-all me-1" /> Review &amp; approve
          </button>
        </div>
      )}
      <div className="pm-card">
        <div className="pm-kpi-label mb-2">Transfer register</div>
        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead><tr><th>ID</th><th>From</th><th>To</th><th className="text-end">Amount</th><th>Type</th><th>Reason</th><th>Date</th><th>Status</th><th style={{ width: 40 }}></th></tr></thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id} className="row-select" onClick={() => openModal("transferDetail", { id: t.id })}>
                  <td><span className="pm-mono fw-semibold" style={{ fontSize: "0.78rem" }}>{t.id}</span></td>
                  <td style={{ fontSize: "0.82rem" }}>{t.from}</td>
                  <td style={{ fontSize: "0.82rem" }}>{t.to}</td>
                  <td className="text-end fw-bold" style={{ fontSize: "0.82rem" }}>{fmtKES(t.amount)}</td>
                  <td><Badge tone={t.type === "Loan" ? "blue" : t.type === "Management Fee" ? "violet" : "green"}>{t.type}</Badge></td>
                  <td className="pm-prod-meta" style={{ maxWidth: 200 }}>{t.reason}</td>
                  <td className="pm-prod-meta">{t.date}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td><button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }}><i className="bi bi-chevron-right" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <div className="pm-note soft"><i className="bi bi-shield-check me-1" /><b>Rules:</b> transfers above KES 1,000,000 need owner approval · loans must carry a repayment schedule · type classification drives elimination in consolidation.</div>
          </div>
          <div className="col-md-6">
            <div className="pm-note soft"><i className="bi bi-lightning-charge me-1" /><b>Free &amp; instant:</b> money never leaves PayMo's internal ledger — no bank fees, no 3-day wait.</div>
          </div>
        </div>
      </div>
      <div className="pm-card mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <b style={{ fontSize: "0.9rem" }}>Inter-company loan tracker</b>
          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("loanWizard")}><i className="bi bi-plus-lg me-1" /> New loan</button>
        </div>
        {loans.map((l) => (
          <div key={l.id} className="d-flex align-items-center gap-3 p-2 mb-2 pm-offer-row" onClick={() => openModal("loanDrawer", { id: l.id })}>
            <span style={{ fontSize: "1.2rem" }}>🏦</span>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <div className="fw-semibold" style={{ fontSize: "0.82rem" }}>{l.id} · {l.from} → {l.to}</div>
              <div className="pm-prod-meta">{l.rate === null ? "Interest-free" : l.rate + "% p.a."} · {l.paidCount}/{l.termMonths} paid</div>
            </div>
            <div className="text-end">
              <div className="pm-prod-meta">outstanding</div>
              <b>{fmtKES(l.outstanding)}</b>
            </div>
            <i className="bi bi-chevron-right pm-prod-meta" />
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   14.8 GROUP TAX & STATUTORY EXPOSURE
================================================================== */
export function GroupTaxSection() {
  const { taxItems, entities, openModal } = useStore();
  const vatTotal = taxItems.filter((t) => t.type.includes("VAT")).reduce((a, b) => a + b.amount, 0);
  const payeTotal = taxItems.filter((t) => t.type === "PAYE").reduce((a, b) => a + b.amount, 0);
  const nssfTotal = taxItems.filter((t) => t.type.includes("NSSF")).reduce((a, b) => a + b.amount, 0);
  return (
    <>
      <Section no="14.8" title="Group Tax &amp; Statutory Exposure"
        sub="Every KRA deadline for every entity on one calendar — miss nothing, and see the total cash impact."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("taxCalendar")}>
            <i className="bi bi-calendar3 me-1" /> Open tax calendar
          </button>
        }
      />
      <div className="pm-stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
        <div className="pm-card"><div className="pm-kpi-label">Total VAT</div><div className="pm-kpi-value">{fmtKES(vatTotal)}</div><div className="pm-prod-meta">2 VAT-registered entities</div></div>
        <div className="pm-card"><div className="pm-kpi-label">Total PAYE</div><div className="pm-kpi-value">{fmtKES(payeTotal)}</div><div className="pm-prod-meta">due 9th of the month</div></div>
        <div className="pm-card"><div className="pm-kpi-label">NSSF / SHIF</div><div className="pm-kpi-value">{fmtKES(nssfTotal)}</div><div className="pm-prod-meta">due with PAYE</div></div>
        <div className="pm-card"><div className="pm-kpi-label">Corporate tax instalments</div><div className="pm-kpi-value">{fmtKES(100000)}</div><div className="pm-prod-meta">20 Jan · TechSolutions</div></div>
      </div>
      <div className="row g-3 mt-1">
        <div className="col-lg-6">
          <div className="pm-card h-100">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Next 3 deadlines</div>
            {taxItems.filter((t) => t.status !== "Paid").slice(0, 3).map((t) => (
              <div key={t.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <span style={{ fontSize: "1rem" }}>{entities.find((e) => e.name === t.entity)?.emoji}</span>
                <div className="flex-grow-1">
                  <b style={{ fontSize: "0.82rem" }}>{t.type} · {t.entity}</b>
                  <div className="pm-prod-meta">due {t.due}</div>
                </div>
                <b>{fmtKES(t.amount)}</b>
                <StatusBadge status={t.status} />
              </div>
            ))}
            <div className="pm-note mt-3"><i className="bi bi-lightbulb me-1" /><b>Optimisation insight:</b> TechSolutions has a VAT surplus (input &gt; output) of KES 50,000 while TS Retail owes KES 96,400. KRA doesn't allow offsetting across entities — but seeing both helps you time cash flow.</div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="pm-card h-100">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>eTIMS / iTax readiness</div>
            <div className="table-responsive">
              <table className="table pm-table align-middle">
                <thead><tr><th>Entity</th><th>eTIMS</th><th>PIN</th><th>Status</th></tr></thead>
                <tbody>
                  {entities.map((e, i) => (
                    <tr key={e.id}>
                      <td style={{ fontSize: "0.82rem" }}>{e.emoji} {e.name}</td>
                      <td className="pm-prod-meta">{e.type === "Rental" ? "n/a" : "Active"}</td>
                      <td className="pm-prod-meta">{e.krapin ?? "—"}</td>
                      <td><StatusBadge status={i === 3 ? "Watch" : "Active"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pm-note soft mt-2"><i className="bi bi-exclamation-triangle me-1" />Each Ltd files separately — PayMo blocks accidental consolidated filings and exports per-entity data for your accountant instead.</div>
          </div>
        </div>
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
          Add Entity (5 steps) · Transfer Funds (3) · Inter-Company Loan (3) · Add Tenant (4) · Move-Out (3) · Maintenance (3). Every action posts to its entity's own ledger.
        </div>
      </div>
      <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("entityWizard")}>
        <i className="bi bi-magic me-1" /> Add an entity
      </button>
    </div>
  );
}
