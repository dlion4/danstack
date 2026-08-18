import { useState } from "react";
import {
  API_USAGE, APPS, DATA_FLOW, SYNC_LOG, fmtK,
} from "./data";
import { useStore } from "./store";
import { Badge, Chip, EmptyState, Kpi, Section, StatusBadge } from "./ui";

/* ==================================================================
   PAGE HEADER
================================================================== */
export function PageHeader() {
  const { openModal, connections } = useStore();
  const healthy = connections.filter((c) => c.status === "Healthy").length;
  return (
    <div className="pm-banner-hero p-4 d-flex flex-wrap align-items-center gap-3">
      <div className="flex-grow-1" style={{ minWidth: 280 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="pm-zone" style={{ background: "linear-gradient(90deg, #ff4f00, #d93a00)" }}><i className="bi bi-puzzle" /> GROW</span>
          <span className="badge-soft green">Page 13 · 7 sections</span>
        </div>
        <h1 className="mb-1" style={{ fontSize: "1.6rem", fontWeight: 800 }}>Apps &amp; Integrations</h1>
        <p className="mb-0" style={{ color: "#b9c7d8", fontSize: "0.86rem", maxWidth: 640 }}>
          Your business, one connected system. M-Pesa, eTIMS, QuickBooks, Meta and 20+ more —
          all syncing into the same ledger. Plumbing that just works.
        </p>
      </div>
      <div className="d-flex flex-column gap-2 align-items-lg-end">
        <div className="d-flex align-items-center gap-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14 }}>
          <div className="text-center">
            <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "Sora", color: "#7ee2b0" }}>{healthy}/{connections.length}</div>
            <div style={{ fontSize: "0.62rem", color: "#b9c7d8", letterSpacing: "0.08em" }}>CONNECTIONS HEALTHY</div>
          </div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.18)" }} />
          <div>
            <div className="fw-bold" style={{ fontSize: "0.86rem" }}>914 syncs this month</div>
            <div className="pm-prod-meta" style={{ color: "#b9c7d8" }}>99.4% avg uptime · 128.4K API calls</div>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("marketplace")}><i className="bi bi-plug me-1" /> Connect App</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("syncNow")}><i className="bi bi-arrow-repeat me-1" /> Sync Now</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("apiDocs")}><i className="bi bi-code-slash me-1" /> API Docs</button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   13.1 INTEGRATION COMMAND CENTER
================================================================== */
export function CommandCenter() {
  const { connections, openModal, syncAllHealthy, toast } = useStore();
  const healthy = connections.filter((c) => c.status === "Healthy").length;
  const totalRecords = connections.reduce((a, b) => a + b.records, 0);
  const avgUptime = "99.4%";
  const dirIcon = (d: string) => (d === "in" ? <i className="bi bi-arrow-down-circle" /> : d === "out" ? <i className="bi bi-arrow-up-circle" /> : <i className="bi bi-arrow-left-right" />);
  const dirTone = (d: string) => (d === "in" ? "green" : d === "out" ? "blue" : "violet");
  return (
    <>
      <Section no="13.1" title="Integration Command Center"
        sub="How data flows through your business — every rail into the central ledger."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("exportData")}>
              <i className="bi bi-download me-1" /> Export data
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => { const n = syncAllHealthy(); toast(`Sync Now fired — ${n} connections refreshing.`, "success", "Syncing"); }}>
              <i className="bi bi-arrow-repeat me-1" /> Sync Now
            </button>
          </>
        }
      />
      <div className="pm-stat-grid">
        <Kpi icon="bi-puzzle" iconBg="var(--pm-green-soft)" label="Connected apps" value={String(connections.length)} delta={`${healthy} healthy`} footer="9 marketplace installs + core rails" />
        <Kpi icon="bi-arrow-repeat" iconBg="#e8f1fe" label="Records synced" value={fmtK(totalRecords)} delta="+1.8K today" spark={[82, 84, 83, 86, 85, 88, 90, 89, 92, 94, 93, 96]} sparkColor="#2e90fa" footer="across all connections" />
        <Kpi icon="bi-hdd-network" iconBg="#fef0c7" label="Webhook deliveries" value={fmtK(API_USAGE.webhookDeliveries)} delta="99.2% success" footer="3 endpoints · 1 paused" />
        <Kpi icon="bi-heart-pulse" iconBg="#f0ebfe" label="Average uptime" value={avgUptime} delta="+0.2 pts" spark={[99.1, 99.2, 99.3, 99.2, 99.4, 99.3, 99.4]} sparkColor="#7a5af8" footer="target 99.5%" />
      </div>
      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <div className="pm-card h-100">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Data flow map</div>
            <div className="pm-flow-hub d-flex align-items-center gap-3 flex-wrap justify-content-center">
              <div className="pm-hub-card">
                <div className="pm-brand-logo" style={{ margin: "0 auto 0.4rem" }}>P</div>
                <div className="fw-bold" style={{ fontSize: "0.8rem" }}>PayMo ledger</div>
                <div className="pm-prod-meta">single source of truth</div>
              </div>
              {DATA_FLOW.map((d) => (
                <div key={d.app} className="pm-flow-node" onClick={() => openModal("appDrawer", { id: connections.find((c) => c.appId === (d.app === "Safaricom Daraja" ? "safaricom" : d.app === "eTIMS KRA" ? "etims" : d.app === "QuickBooks" ? "quickbooks" : d.app === "Meta" ? "meta" : d.app === "Sendy" ? "sendy" : d.app === "DPO Pay" ? "dpo" : d.app === "Google Sheets" ? "sheets" : "zapier"))?.id ?? "c1" })}>
                  <span className="pm-kpi-icon" style={{ width: 34, height: 34, fontSize: "0.9rem", background: d.color + "22", color: d.color }}>
                    <i className={`bi ${d.icon}`} />
                  </span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-semibold text-truncate" style={{ fontSize: "0.76rem" }}>{d.app}</div>
                    <div className="pm-prod-meta" style={{ fontSize: "0.66rem" }}>{d.detail}</div>
                  </div>
                  <span className="badge-soft" style={{ fontSize: "0.6rem", background: dirTone(d.dir) === "green" ? "#e7f8ef" : dirTone(d.dir) === "blue" ? "#e8f1fe" : "#f0ebfe" }}>
                    {dirIcon(d.dir)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pm-prod-meta mt-2 text-center">Tap any node to manage its connection.</div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <b style={{ fontSize: "0.9rem" }}>Sync activity — last 24h</b>
              <button type="button" className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: "0.74rem" }} onClick={() => openModal("health")}>Full log</button>
            </div>
            {SYNC_LOG.slice(0, 6).map((l) => (
              <div key={l.id} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, background: l.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.56rem" }}>{l.initials}</span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="fw-semibold text-truncate" style={{ fontSize: "0.76rem" }}>{l.app}</div>
                  <div className="pm-prod-meta" style={{ fontSize: "0.66rem" }}>{l.direction} · {l.duration}</div>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   13.2 APP MARKETPLACE
================================================================== */
export function MarketplaceSection() {
  const { openModal } = useStore();
  const [cat, setCat] = useState("All");
  const cats = ["All", "Kenya Rails", "Accounting", "Payments", "Commerce", "Logistics", "Marketing", "Productivity", "Automation", "Developer"];
  const list = cat === "All" ? APPS : APPS.filter((a) => a.category === cat);
  const featured = APPS.filter((a) => a.popular && !a.installed).slice(0, 4);
  return (
    <>
      <Section no="13.2" title="App Marketplace"
        sub="20+ apps built for how Kenyan SMEs work. Connect in 4 steps — data stays yours."
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("marketplace")}>
            <i className="bi bi-grid me-1" /> Open full marketplace
          </button>
        }
      />
      <div className="pm-card mb-3 d-flex flex-wrap align-items-center gap-3" style={{ background: "linear-gradient(110deg, #fff4e8, #fffaf3 55%, #fff)", borderColor: "#f6d7b4" }}>
        <span style={{ fontSize: "1.6rem" }}>🔌</span>
        <div className="flex-grow-1" style={{ minWidth: 240 }}>
          <b style={{ fontSize: "0.95rem" }}>Most popular for retail shops</b>
          <div className="pm-prod-meta">Install one this week — average setup time 3 minutes, no developer needed.</div>
        </div>
        <div className="d-flex gap-2">
          {featured.map((a) => (
            <button key={a.id} type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("installWizard", { appId: a.id })}>
              {a.initials === "G" ? <i className="bi bi-google me-1" /> : null}{a.name}
            </button>
          ))}
        </div>
      </div>
      <div className="d-flex gap-1 flex-wrap mb-2">
        {cats.map((c) => (
          <Chip key={c} on={cat === c} onClick={() => setCat(c)}>{c}</Chip>
        ))}
      </div>
      <div className="row g-3">
        {list.map((a) => (
          <div className="col-lg-3 col-md-4 col-6" key={a.id}>
            <div className="pm-card pm-card-hover h-100 d-flex flex-column">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span style={{ width: 36, height: 36, borderRadius: 10, background: a.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.7rem" }}>{a.initials}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="fw-bold text-truncate" style={{ fontSize: "0.8rem" }}>{a.name}</div>
                  <div className="pm-prod-meta" style={{ fontSize: "0.66rem" }}>★ {a.rating} · {a.users}</div>
                </div>
              </div>
              <div className="pm-prod-meta flex-grow-1" style={{ fontSize: "0.72rem" }}>{a.desc}</div>
              <div className="d-flex gap-1 mt-2 flex-wrap">
                {a.popular && <Badge tone="amber">Popular</Badge>}
                <Badge tone="slate">{a.category}</Badge>
              </div>
              {a.installed ? (
                <button type="button" className="btn btn-sm btn-outline-secondary w-100 mt-2" onClick={() => openModal("marketplace")}>
                  <i className="bi bi-check2-circle me-1 text-primary" /> Connected
                </button>
              ) : (
                <button type="button" className="btn btn-sm btn-primary w-100 mt-2" onClick={() => openModal("installWizard", { appId: a.id })}>
                  <i className="bi bi-plug me-1" /> Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   13.3 CONNECTED APPS
================================================================== */
export function ConnectedAppsSection() {
  const { connections, openModal } = useStore();
  const [tab, setTab] = useState<"all" | "issues">("all");
  const shown = tab === "all" ? connections : connections.filter((c) => c.status !== "Healthy");
  return (
    <>
      <Section no="13.3" title="Connected Apps &amp; Management"
        sub="Every active connection — status, sync frequency, and what it can see."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("installWizard", { appId: "xero" })}>
            <i className="bi bi-plug me-1" /> Connect new app
          </button>
        }
      />
      <div className="pm-card">
        <ul className="nav nav-tabs border-0 mb-2">
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>All connections <span className="badge bg-light text-secondary border ms-1">{connections.length}</span></button></li>
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "issues" ? "active" : ""}`} onClick={() => setTab("issues")}>Needs attention <span className="badge bg-light text-secondary border ms-1">{connections.filter((c) => c.status !== "Healthy").length}</span></button></li>
        </ul>
        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead><tr><th>App</th><th>Status</th><th>Last sync</th><th>Uptime</th><th className="text-end">Records</th><th>Direction</th><th>Frequency</th><th style={{ width: 40 }}></th></tr></thead>
            <tbody>
              {shown.map((c) => (
                <tr key={c.id} className="row-select" onClick={() => openModal("appDrawer", { id: c.id })}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ width: 32, height: 32, borderRadius: 8, background: c.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.62rem" }}>{c.initials}</span>
                      <div style={{ minWidth: 0 }}>
                        <div className="pm-prod-name text-truncate" style={{ maxWidth: 190 }}>{c.name}</div>
                        {c.tokenExpiry && <div className="pm-prod-meta" style={{ color: "var(--pm-danger)" }}>{c.tokenExpiry.split("—")[0].trim()}</div>}
                      </div>
                    </div>
                  </td>
                  <td><StatusBadge status={c.status === "Reconnect needed" ? "Reconnect needed" : c.status} /></td>
                  <td className="pm-prod-meta" style={{ whiteSpace: "nowrap" }}>{c.lastSync}</td>
                  <td className="pm-prod-meta">{c.uptime}</td>
                  <td className="text-end fw-bold" style={{ fontSize: "0.82rem" }}>{c.records.toLocaleString()}</td>
                  <td><Badge tone="slate">{c.direction}</Badge></td>
                  <td className="pm-prod-meta">{c.frequency}</td>
                  <td><button type="button" className="btn btn-sm btn-outline-secondary" style={{ border: "none" }}><i className="bi bi-chevron-right" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {shown.length === 0 && <EmptyState icon="bi-check2-circle" title="Everything healthy" text="No connections need attention right now." />}
        <div className="pm-note soft mt-2"><i className="bi bi-info-circle me-1" />Meta re-authenticates every 60 days by policy — we'll ping you before it expires, and 3 days after it breaks.</div>
      </div>
    </>
  );
}

/* ==================================================================
   13.4 SYNC CENTER
================================================================== */
export function SyncCenterSection() {
  const { connections, openModal, syncConnection, toast } = useStore();
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  return (
    <>
      <Section no="13.4" title="Sync Center &amp; Data Mapping"
        sub="Control the direction, frequency and field rules for every integration."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("mappingWizard")}>
              <i className="bi bi-diagram-3 me-1" /> Field mapping
            </button>
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal("syncNow")}>
              <i className="bi bi-arrow-repeat me-1" /> Sync everything
            </button>
          </>
        }
      />
      <div className="pm-card">
        {connections.map((c) => (
          <div key={c.id} className="d-flex align-items-center gap-3 py-2 flex-wrap" style={{ borderBottom: "1px solid var(--pm-border)" }}>
            <span style={{ width: 34, height: 34, borderRadius: 9, background: c.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.64rem" }}>{c.initials}</span>
            <div className="flex-grow-1" style={{ minWidth: 170 }}>
              <div className="fw-semibold" style={{ fontSize: "0.82rem" }}>{c.name}</div>
              <div className="pm-prod-meta">{c.direction} · {c.frequency} · {c.realtime ? "streaming" : "batch"}</div>
            </div>
            <Badge tone={c.status === "Healthy" ? "green" : c.status === "Error" ? "red" : "amber"}>{c.status === "Reconnect needed" ? "Reconnect needed" : c.status}</Badge>
            <div className="d-flex gap-1">
              <button type="button" className="btn btn-sm btn-outline-primary" disabled={syncing[c.id] || c.status !== "Healthy"} onClick={() => {
                setSyncing((s) => ({ ...s, [c.id]: true }));
                window.setTimeout(() => {
                  setSyncing((s) => ({ ...s, [c.id]: false }));
                  syncConnection(c.id, 12 + Math.floor(Math.random() * 70));
                  toast(`${c.name} synced.`, "success", "Sync complete");
                }, 1200);
              }}>
                {syncing[c.id] ? <><span className="pm-spin me-1">◌</span>…</> : <><i className="bi bi-arrow-repeat me-1" />Sync</>}
              </button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openModal("mappingWizard", { connId: c.id })}><i className="bi bi-diagram-3 me-1" />Map</button>
              {c.status !== "Healthy" && (
                <button type="button" className="btn btn-sm btn-warning" onClick={() => openModal(c.status === "Error" ? "errorDetail" : "reconnect", { id: c.status === "Error" ? "e1" : c.id })}>
                  <i className="bi bi-wrench me-1" />Fix
                </button>
              )}
            </div>
          </div>
        ))}
        <div className="pm-note mt-3"><i className="bi bi-shield-check me-1" />Mappings are versioned — every change is logged, and you can roll back to the previous mapping with one click.</div>
      </div>
    </>
  );
}

/* ==================================================================
   13.5 WEBHOOKS & AUTOMATIONS
================================================================== */
export function WebhooksSection() {
  const { webhooks, automations, openModal, toggleAutomation, toast } = useStore();
  return (
    <>
      <Section no="13.5" title="Webhooks &amp; Automation"
        sub="Push events to your own servers, and let if-this-then-that run your back office."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("automationWizard")}>
              <i className="bi bi-lightning-charge me-1" /> New automation
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("webhookWizard")}>
              <i className="bi bi-hdd-network me-1" /> New webhook
            </button>
          </>
        }
      />
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <b style={{ fontSize: "0.9rem" }}>Outgoing webhooks</b>
              <Badge tone="slate">{webhooks.length} endpoints</Badge>
            </div>
            {webhooks.map((w) => {
              const last = w.deliveries[0];
              return (
                <div key={w.id} className="p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 12, cursor: "pointer" }} onClick={() => openModal("webhookDetail", { id: w.id })}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <b style={{ fontSize: "0.82rem" }}>{w.name}</b>
                    <StatusBadge status={w.status} />
                    {w.secret && <Badge tone="violet">signed</Badge>}
                    <span className="ms-auto pm-prod-meta pm-mono" style={{ fontSize: "0.68rem" }}>{w.url.split("/")[2]}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <div className="d-flex gap-1 flex-wrap">
                      {w.events.slice(0, 3).map((e) => <span key={e} className="badge-soft ink pm-mono" style={{ fontSize: "0.6rem" }}>{e}</span>)}
                      {w.events.length > 3 && <span className="pm-prod-meta">+{w.events.length - 3}</span>}
                    </div>
                    <span className="ms-auto pm-prod-meta">{last ? `last: ${last.code} · ${last.time}` : "no deliveries yet"}</span>
                  </div>
                </div>
              );
            })}
            <div className="pm-note soft"><i className="bi bi-lightbulb me-1" />No server? A Zapier catch webhook gives you the same power with zero code.</div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <b style={{ fontSize: "0.9rem" }}>Automations</b>
              <Badge tone="slate">{automations.filter((a) => a.status === "Active").length} active</Badge>
            </div>
            {automations.map((a) => (
              <div key={a.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <i className="bi bi-lightning-charge-fill" style={{ color: a.status === "Active" ? "var(--pm-warn)" : "#98a2b3" }} />
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="fw-semibold" style={{ fontSize: "0.8rem" }}>{a.name}</div>
                  <div className="pm-prod-meta text-truncate">{a.trigger} → {a.action} · {a.runs} runs</div>
                </div>
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" checked={a.status === "Active"} onChange={() => { toggleAutomation(a.id); toast(`${a.name} ${a.status === "Active" ? "paused" : "activated"}.`, "info", "Automation updated"); }} />
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-outline-primary btn-sm w-100 mt-3" onClick={() => openModal("automationWizard")}>
              <i className="bi bi-plus-lg me-1" /> Build an automation
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   13.6 INTEGRATION HEALTH & SYNC LOGS
================================================================== */
export function HealthSection() {
  const { connections, errors, syncLog, openModal, retryError } = useStore();
  const [tab, setTab] = useState<"errors" | "log">("errors");
  const unresolved = errors.filter((e) => e.status === "Unresolved");
  return (
    <>
      <Section no="13.6" title="Integration Health &amp; Sync Logs"
        sub="The IT view — catch breaks before customers do. Retry, reconnect, resolve."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("health")}>
              <i className="bi bi-heart-pulse me-1" /> Health overview
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("syncNow")}>
              <i className="bi bi-arrow-repeat me-1" /> Sync Now
            </button>
          </>
        }
      />
      <div className="row g-3 mb-3">
        {connections.map((c) => (
          <div className="col-lg-3 col-md-4 col-6" key={c.id}>
            <div className="pm-card pm-card-hover h-100" onClick={() => openModal(c.status === "Healthy" ? "appDrawer" : "errorDetail", { id: c.status === "Healthy" ? c.id : errors.find((e) => e.app === c.name)?.id ?? "e1" })}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className={`pm-dot-live`} style={{ background: c.status === "Healthy" ? "var(--pm-green)" : c.status === "Reconnect needed" ? "var(--pm-warn)" : "var(--pm-danger)" }} />
                <span style={{ width: 26, height: 26, borderRadius: 7, background: c.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.56rem" }}>{c.initials}</span>
                <b style={{ fontSize: "0.76rem" }} className="text-truncate">{c.name}</b>
              </div>
              <div className="pm-prod-meta" style={{ fontSize: "0.66rem" }}>{c.status === "Healthy" ? `last sync ${c.lastSync}` : c.status}</div>
              <div className="pm-prod-meta" style={{ fontSize: "0.66rem" }}>uptime {c.uptime}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="pm-card">
        <ul className="nav nav-tabs border-0 mb-2">
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "errors" ? "active" : ""}`} onClick={() => setTab("errors")}>Sync errors <span className={`badge ${unresolved.length ? "text-bg-danger" : "bg-light text-secondary border"} ms-1`}>{unresolved.length} open</span></button></li>
          <li className="nav-item"><button type="button" className={`nav-link ${tab === "log" ? "active" : ""}`} onClick={() => setTab("log")}>Sync history <span className="badge bg-light text-secondary border ms-1">{syncLog.length}</span></button></li>
        </ul>
        {tab === "errors" ? (
          <div className="table-responsive">
            <table className="table pm-table align-middle">
              <thead><tr><th>Time</th><th>Integration</th><th>Error type</th><th>Message</th><th>Status</th><th>Attempts</th><th></th></tr></thead>
              <tbody>
                {errors.map((e) => (
                  <tr key={e.id} className="row-select" onClick={() => openModal("errorDetail", { id: e.id })}>
                    <td className="pm-prod-meta" style={{ whiteSpace: "nowrap" }}>{e.time}</td>
                    <td><div className="d-flex align-items-center gap-2"><span style={{ width: 26, height: 26, borderRadius: 7, background: e.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.56rem" }}>{e.initials}</span><b style={{ fontSize: "0.8rem" }}>{e.app}</b></div></td>
                    <td><Badge tone={e.errorType === "Authentication failed" ? "red" : e.errorType === "Rate limit exceeded" ? "amber" : "violet"}>{e.errorType}</Badge></td>
                    <td className="pm-prod-meta" style={{ maxWidth: 280 }}>{e.message}</td>
                    <td><StatusBadge status={e.status} /></td>
                    <td className="text-end pm-prod-meta">{e.attempts}</td>
                    <td onClick={(ev) => ev.stopPropagation()}>
                      {e.status === "Unresolved" && (
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { retryError(e.id); }}>
                          <i className="bi bi-arrow-repeat me-1" />Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: 380, overflowY: "auto" }}>
            <table className="table pm-table align-middle">
              <thead><tr><th>Time</th><th>App</th><th>Direction</th><th className="text-end">Records</th><th className="text-end">Duration</th><th>Status</th></tr></thead>
              <tbody>
                {syncLog.map((l) => (
                  <tr key={l.id}>
                    <td className="pm-prod-meta" style={{ whiteSpace: "nowrap" }}>{l.time}</td>
                    <td><div className="d-flex align-items-center gap-2"><span style={{ width: 24, height: 24, borderRadius: 6, background: l.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.54rem" }}>{l.initials}</span><b style={{ fontSize: "0.78rem" }}>{l.app}</b></div></td>
                    <td className="pm-prod-meta">{l.direction}</td>
                    <td className="text-end fw-bold" style={{ fontSize: "0.8rem" }}>{l.records}</td>
                    <td className="text-end pm-prod-meta">{l.duration}</td>
                    <td><StatusBadge status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* ==================================================================
   13.7 API ACCESS & DEVELOPER TOOLS
================================================================== */
export function ApiSection() {
  const { apiKeys, openModal } = useStore();
  return (
    <>
      <Section no="13.7" title="API Access &amp; Developer Tools"
        sub="Keys, rate limits, docs and a sandbox — build on PayMo safely."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("sandbox")}>
              <i className="bi bi-boxes me-1" /> Sandbox
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("apiDocs")}>
              <i className="bi bi-code-slash me-1" /> API Docs
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("apiKeyWizard")}>
              <i className="bi bi-key me-1" /> New API key
            </button>
          </>
        }
      />
      <div className="row g-3">
        <div className="col-lg-7">
          <div className="pm-card h-100">
            <div className="pm-kpi-label mb-2">API keys ({apiKeys.length})</div>
            <div className="table-responsive">
              <table className="table pm-table align-middle">
                <thead><tr><th>Name</th><th>Key</th><th>Scopes</th><th>Last used</th><th className="text-end">Requests</th><th></th></tr></thead>
                <tbody>
                  {apiKeys.map((k) => (
                    <tr key={k.id}>
                      <td><b style={{ fontSize: "0.8rem" }}>{k.name}</b><div className="pm-prod-meta">created {k.created}</div></td>
                      <td><span className="pm-mono pm-prod-meta">{k.prefix}</span></td>
                      <td><div className="d-flex gap-1">{k.scopes.map((s) => <Badge key={s} tone={s === "admin" ? "red" : "slate"}>{s}</Badge>)}</div></td>
                      <td className="pm-prod-meta">{k.lastUsed}</td>
                      <td className="text-end fw-bold" style={{ fontSize: "0.8rem" }}>{k.requests.toLocaleString()}</td>
                      <td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => openModal("revokeKey", { id: k.id })}><i className="bi bi-x-circle me-1" />Revoke</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="pm-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <b style={{ fontSize: "0.9rem" }}>Rate limits & usage</b>
              <button type="button" className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: "0.74rem" }} onClick={() => openModal("usage")}>Details</button>
            </div>
            <div className="pm-kpi-label mb-1">Requests this month</div>
            <div className="progress mb-1" style={{ height: 10 }}>
              <div className="progress-bar" style={{ width: `${Math.round((API_USAGE.requests30d / API_USAGE.limit) * 100)}%` }} />
            </div>
            <div className="pm-prod-meta mb-3">{fmtK(API_USAGE.requests30d)} / {fmtK(API_USAGE.limit)} · {API_USAGE.rateLimit}</div>
            <div className="pm-kpi-label mb-1">Quick endpoints</div>
            {[
              { m: "GET", p: "/v1/invoices", d: "list invoices" },
              { m: "POST", p: "/v1/payments/stk", d: "M-Pesa push" },
              { m: "GET", p: "/v1/inventory/{sku}", d: "stock level" },
            ].map((r) => (
              <div key={r.p} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <Badge tone={r.m === "GET" ? "green" : "blue"}>{r.m}</Badge>
                <span className="pm-mono fw-semibold" style={{ fontSize: "0.76rem" }}>{r.p}</span>
                <span className="pm-prod-meta ms-auto">{r.d}</span>
              </div>
            ))}
            <div className="d-flex gap-2 mt-3">
              <button type="button" className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => openModal("apiDocs")}><i className="bi bi-code-slash me-1" />Docs</button>
              <button type="button" className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => openModal("sandbox")}><i className="bi bi-boxes me-1" />Sandbox</button>
              <button type="button" className="btn btn-outline-secondary btn-sm flex-grow-1" onClick={() => openModal("usage")}><i className="bi bi-graph-up-arrow me-1" />Usage</button>
            </div>
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
    <div className="pm-card mt-4 d-flex flex-wrap align-items-center gap-3" style={{ background: "linear-gradient(90deg, #0b1322, #3a1405)", border: "none", color: "#fff" }}>
      <span style={{ fontSize: "1.6rem" }}>🧭</span>
      <div className="flex-grow-1" style={{ minWidth: 260 }}>
        <b style={{ fontSize: "0.95rem" }}>Guided flows on this page</b>
        <div style={{ color: "#b9c7d8", fontSize: "0.8rem" }}>
          Connect App (4 steps) · Sync Mapping (3) · Webhook Builder (3) · API Key (3) · Automation (3). Every connect, key and webhook hits the audit trail.
        </div>
      </div>
      <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("installWizard", { appId: "shopify" })}>
        <i className="bi bi-magic me-1" /> Connect an app
      </button>
    </div>
  );
}
