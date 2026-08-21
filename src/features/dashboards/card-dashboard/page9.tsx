/* ============================================================================
 * Card Dashboard — page 5.9 · Card Program Administration (Bootstrap 5)
 * ========================================================================== */

import { useEffect, useState } from "react";
import { cn } from "./utils/cn";
import { Icon, type IconName } from "./icons";
import { Badge, Btn, FieldLabel, Modal, Progress, Reveal, SectionHead, Toggle, Empty } from "./ui";
import { useApp } from "./store";
import {
  ENV_INFO,
  MAINTENANCE_WINDOWS,
  SEED_ADMINS,
  SEED_API_KEYS,
  SEED_GATEWAY_EVENTS,
  SEED_SYSTEMS,
  WEBHOOK_ENDPOINTS,
  type SystemStatus,
} from "./data";

/* ---------------- helpers ---------------- */

const statusMeta: Record<SystemStatus, { tone: "success" | "warning" | "info" | "danger" | "muted"; label: string; dot: "green" | "amber" | "red"; icon: IconName }> = {
  operational: { tone: "success", label: "Operational", dot: "green", icon: "checkCircle" },
  degraded: { tone: "warning", label: "Degraded", dot: "amber", icon: "alertTri" },
  syncing: { tone: "info", label: "Syncing", dot: "green", icon: "refresh" },
  down: { tone: "danger", label: "Down", dot: "red", icon: "x" },
  funded: { tone: "success", label: "Funded", dot: "green", icon: "wallet" },
};

/* ============ 01 · System health overview ============ */

export function AdminOverview() {
  const { sync, syncing, setPage, openModal } = useApp();
  const [checked, setChecked] = useState("2 minutes ago");
  const healthy = SEED_SYSTEMS.filter((s) => s.status !== "degraded" && s.status !== "down").length;
  const degraded = SEED_SYSTEMS.filter((s) => s.status === "degraded").length;

  const runCheck = () => {
    sync();
    setChecked("just now");
  };

  return (
    <section id="overview" className="pmc-scroll-mt">
      <Reveal>
        <div className="pmc-hero">
          <div className="pmc-hero-dots" />
          <div className="position-relative d-flex flex-wrap align-items-center pmc-gap-6">
            <div className="flex-grow-1" style={{ minWidth: 0, flexBasis: 300 }}>
              <div className="d-flex flex-wrap align-items-center pmc-gap-2">
                <span className="pmc-hero-chip d-inline-flex align-items-center pmc-gap-15 text-uppercase fw-bold" style={{ letterSpacing: "0.12em" }}>
                  <span className="pmc-live-dot" /> BAAS · Cards
                </span>
                <span className="pmc-hero-chip">Module 5.9</span>
              </div>
              <h1 className="pmc-hero-title pmc-mt-3">
                Card Program<br className="d-none d-sm-inline" /> Administration
              </h1>
              <p className="pmc-hero-sub" style={{ maxWidth: 510 }}>
                Monitor the issuing stack — gateways, ledger, KYC/AML and settlement — plus webhooks,
                API keys and admin access for the whole programme.
              </p>
              <div className="pmc-mt-4 d-flex flex-wrap pmc-gap-2">
                <Btn icon="refresh" onClick={runCheck}>{syncing ? "Checking…" : "Run Health Check"}</Btn>
                <Btn variant="ghost" icon="key" onClick={() => document.getElementById("integrations")?.scrollIntoView({ behavior: "smooth" })}>API Keys</Btn>
                <Btn variant="ghost" icon="gauge" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="pmc-hero-stats">
                {[
                  { k: "Systems healthy", v: `${healthy}/${SEED_SYSTEMS.length}` },
                  { k: "Degraded", v: String(degraded), warn: degraded > 0 },
                  { k: "Uptime · 30d", v: "99.98%" },
                  { k: "Last check", v: checked },
                ].map((s) => (
                  <div key={s.k} className="lh-sm">
                    <p className="pmc-hero-stat-value" style={s.warn ? { color: "#ffd27d" } : undefined}>{s.v}</p>
                    <p className="pmc-hero-stat-label">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="pmc-hero-art" style={{ height: 220, width: 260 }}>
              <div className="position-absolute p-4" style={{ right: 0, top: 0, width: 230, borderRadius: 16, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(2px)" }}>
                <p className="pmc-fs-10 fw-bold text-uppercase mb-0" style={{ letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)" }}>Issuing endpoints</p>
                <div className="pmc-mt-3 d-flex flex-column pmc-gap-2">
                  {SEED_SYSTEMS.slice(0, 4).map((s) => {
                    const m = statusMeta[s.status];
                    return (
                      <div key={s.id} className="d-flex align-items-center pmc-gap-2">
                        <span className={cn("pmc-live-dot", m.dot === "amber" && "amber", m.dot === "red" && "red")} />
                        <span className="flex-grow-1 pmc-fs-115 fw-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{s.name}</span>
                        <span className="pmc-fs-10 fw-bold" style={{ color: "rgba(255,255,255,0.5)" }}>{s.latency ?? "—"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="position-absolute p-3" style={{ bottom: 0, left: 0, width: 210, borderRadius: 16, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(2px)" }}>
                <p className="pmc-fs-10 fw-bold text-uppercase mb-0" style={{ letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)" }}>Environment</p>
                <p className="pmc-mt-1 pmc-fs-12 fw-bold text-white mb-0">{ENV_INFO.environment}</p>
                <p className="pmc-fs-105 mb-0" style={{ color: "rgba(255,255,255,0.5)" }}>{ENV_INFO.region}</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* systems grid */}
      <div className="row pmc-g-3 pmc-mt-4">
        {SEED_SYSTEMS.map((s, i) => {
          const m = statusMeta[s.status];
          return (
            <div key={s.id} className="col-12 col-sm-6 col-xl-4">
              <Reveal delay={(i % 3) * 70} className="h-100">
                <button
                  type="button"
                  onClick={() => openModal({ type: "adminHealth" })}
                  className="pmc-card pmc-lift pmc-focus w-100 p-4 text-start h-100"
                  style={{ border: `1px solid ${s.status === "degraded" ? "rgba(247,144,9,0.4)" : "var(--pmc-line)"}` }}
                >
                  <div className="d-flex align-items-start justify-content-between">
                    <span className={cn("pmc-stat-icon d-grid", m.tone === "success" ? "pmc-tone-green" : m.tone === "warning" ? "pmc-tone-warn" : m.tone === "info" ? "pmc-tone-blue" : "pmc-tone-muted")}>
                      <Icon name={m.icon} size={19} />
                    </span>
                    <span className={cn("pmc-live-dot", m.dot === "amber" && "amber", m.dot === "red" && "red")} />
                  </div>
                  <p className="pmc-mt-3 pmc-fs-135 fw-bold pmc-ink mb-0">{s.name}</p>
                  <p className="pmc-mt-05 pmc-fs-115 fw-semibold pmc-muted mb-0">{s.detail}</p>
                  <div className="pmc-mt-2 d-flex align-items-center justify-content-between">
                    <Badge tone={m.tone} dot>{m.label}</Badge>
                    <span className="pmc-fs-105 fw-semibold pmc-faint">{s.latency ? `${s.latency} · ` : ""}{s.lastEvent}</span>
                  </div>
                </button>
              </Reveal>
            </div>
          );
        })}
      </div>

      {/* degraded callout */}
      {degraded > 0 && (
        <Reveal delay={120}>
          <div className="pmc-mt-4 d-flex align-items-center pmc-gap-3 p-4" style={{ borderRadius: 16, border: "1px solid rgba(247,144,9,0.35)", background: "rgba(255,250,235,0.4)" }}>
            <span className="pmc-icon-sq d-grid flex-none" style={{ width: 40, height: 40, background: "rgba(247,144,9,0.15)", color: "#93370d" }}><Icon name="alertTri" size={18} /></span>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <p className="pmc-fs-125 fw-bold mb-0" style={{ color: "#93370d" }}>KYC / AML Oracle is degraded</p>
              <p className="pmc-fs-115 mb-0" style={{ color: "rgba(147,55,13,0.75)" }}>Identity checks are running with a 1.2s delay. Issuance remains unaffected — the vendor is investigating.</p>
            </div>
            <Btn size="sm" variant="outline" onClick={() => openModal({ type: "adminHealth" })}>Details</Btn>
          </div>
        </Reveal>
      )}

      <Reveal delay={140}>
        <p className="pmc-mt-4 d-flex align-items-center justify-content-center pmc-gap-15 py-3 text-center pmc-fs-115 fw-semibold pmc-muted mb-0" style={{ borderRadius: 16, border: "1px solid var(--pmc-line)", background: "#fff", boxShadow: "var(--shadow-pm)" }}>
          <Icon name="clock" size={13} /> Last automated check: {checked}. All issuing endpoints are active and accepting payload requests.
        </p>
      </Reveal>
    </section>
  );
}

/* ============ 02 · Gateway logs ============ */

export function GatewayLogsSection() {
  const { toast } = useApp();
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");
  const shown = SEED_GATEWAY_EVENTS.filter((e) => (filter === "all" ? true : filter === "success" ? e.status === "success" : e.status !== "success"));
  const successRate = Math.round((SEED_GATEWAY_EVENTS.filter((e) => e.status === "success").length / SEED_GATEWAY_EVENTS.length) * 100);

  return (
    <section id="gateway-logs" className="pmc-scroll-mt">
      <SectionHead no="02" title="Gateway Logs" sub="Live request/response flow across Visa, Mastercard, ledger and the KYC/AML oracle.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Gateway logs exported", `${SEED_GATEWAY_EVENTS.length} events written to gateway-logs.csv`)}>Export</Btn>
      </SectionHead>

      <div className="row g-3 pmc-mb-4" style={{ maxWidth: 448 }}>
        {[
          { k: "Success rate", v: `${successRate}%`, tone: "pmc-green-ink" },
          { k: "Requests", v: String(SEED_GATEWAY_EVENTS.length), tone: "pmc-ink" },
          { k: "Errors", v: String(SEED_GATEWAY_EVENTS.filter((e) => e.status !== "success").length), tone: "pmc-danger-ink" },
        ].map((s) => (
          <div key={s.k} className="col-4">
            <div className="pmc-card p-3 h-100">
              <p className="pmc-fs-10 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>{s.k}</p>
              <p className={cn("pmc-num pmc-display pmc-mt-1 pmc-fs-16 fw-bold mb-0", s.tone)}>{s.v}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pmc-thin-scroll pmc-mb-4 d-flex pmc-gap-2 overflow-auto pb-1">
        {(["all", "success", "error"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className="pmc-focus pmc-pill-choice"
            style={filter === f ? { border: "1px solid var(--pmc-ink)", background: "var(--pmc-ink)", color: "#fff" } : undefined}
          >
            {f === "all" ? "All" : f === "success" ? "Successful" : "Errors"}
          </button>
        ))}
      </div>

      <Reveal>
        <div className="pmc-table-frame">
          <ul className="pmc-mobile-list" style={{ fontFamily: "var(--bs-font-monospace, SFMono-Regular, Menlo, monospace)", fontSize: 12 }}>
            {shown.map((e) => (
              <li key={e.id} className="px-4 pmc-py-25">
                <span className="pmc-num flex-none pmc-fs-11 fw-bold pmc-faint">{e.time}</span>
                <span className="flex-none fw-bold pmc-ink" style={{ width: 130 }}>{e.gateway}</span>
                <span className="d-none d-sm-block flex-grow-1 fw-semibold pmc-muted" style={{ minWidth: 0 }}>{e.type}</span>
                <span className={cn("pmc-num flex-none fw-bold")} style={{ color: e.status === "success" ? "#067647" : e.status === "retry" ? "#93370d" : "#b42318" }}>{e.code}</span>
                <span className="flex-none"><Badge tone={e.status === "success" ? "success" : e.status === "retry" ? "warning" : "danger"} dot>{e.status === "success" ? "200" : e.status === "retry" ? "Retry" : "Error"}</Badge></span>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center justify-content-between px-4 pmc-py-25" style={{ borderTop: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.6)" }}>
            <p className="pmc-fs-115 fw-bold pmc-muted mb-0">{shown.length} event{shown.length === 1 ? "" : "s"}</p>
            <p className="d-flex align-items-center pmc-gap-15 pmc-fs-115 fw-semibold pmc-faint mb-0"><span className="pmc-live-dot" /> Streaming live</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 03 · Webhooks & API keys ============ */

export function IntegrationsSection() {
  const { openModal, toast } = useApp();
  return (
    <section id="integrations" className="pmc-scroll-mt">
      <SectionHead no="03" title="Webhooks & API Keys" sub="Outgoing webhooks for card events and API credentials for your engineering team.">
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "adminKey" })}>New API Key</Btn>
      </SectionHead>

      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-card p-4 h-100">
            <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Webhook endpoints</p>
            <ul className="list-unstyled d-flex flex-column pmc-gap-2 mb-0">
              {WEBHOOK_ENDPOINTS.map((w) => (
                <li key={w.id} className="d-flex flex-wrap align-items-center pmc-gap-3 pmc-radius px-3 pmc-py-3" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}>
                  <span className={cn("pmc-icon-sq d-grid flex-none", w.status === "healthy" ? "pmc-tone-green" : "pmc-tone-danger")}>
                    <Icon name={w.status === "healthy" ? "checkCircle" : "alertTri"} size={16} />
                  </span>
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="text-truncate pmc-fs-125 fw-bold pmc-ink mb-0">{w.name}</p>
                    <p className="text-truncate pmc-fs-105 fw-semibold pmc-faint mb-0" style={{ fontFamily: "var(--bs-font-monospace, SFMono-Regular, Menlo, monospace)" }}>{w.url}</p>
                  </div>
                  <div className="d-flex flex-column align-items-end pmc-gap-1">
                    <Badge tone={w.status === "healthy" ? "success" : "danger"} dot>{w.status === "healthy" ? "Healthy" : "Failing"}</Badge>
                    <span className="pmc-num pmc-fs-105 fw-semibold pmc-faint">{w.successRate}% success · {w.last}</span>
                  </div>
                  <button type="button" onClick={() => openModal({ type: "adminWebhook", webhookId: w.id })} className="pmc-focus pmc-icon-btn pmc-icon-btn-sm pmc-icon-btn-green"><Icon name="sliders" size={14} /></button>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-card p-4">
              <div className="pmc-mb-3 d-flex align-items-center justify-content-between">
                <p className="pmc-display pmc-fs-135 fw-bold pmc-ink mb-0">API keys</p>
                <Btn size="sm" variant="outline" icon="plus" onClick={() => openModal({ type: "adminKey" })}>Add</Btn>
              </div>
              <ul className="list-unstyled d-flex flex-column pmc-gap-2 mb-0">
                {SEED_API_KEYS.map((k) => (
                  <li key={k.id} className="d-flex align-items-center pmc-gap-3 pmc-radius px-3 pmc-py-25" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}>
                    <span className="pmc-display d-grid flex-none fw-bold pmc-green" style={{ width: 32, height: 32, borderRadius: 8, background: "var(--pmc-ink)", fontSize: 10 }}><Icon name="key" size={14} /></span>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p className="text-truncate pmc-fs-12 fw-bold pmc-ink mb-0">{k.name}</p>
                      <p className="pmc-fs-10 fw-semibold pmc-faint mb-0" style={{ fontFamily: "var(--bs-font-monospace, SFMono-Regular, Menlo, monospace)" }}>{k.prefix}</p>
                    </div>
                    <Badge tone={k.env === "live" ? "success" : "muted"}>{k.env}</Badge>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => { navigator.clipboard?.writeText("pk_live_8f2a").catch(() => {}); toast("info", "Key copied", "Secret revealed once — copy it somewhere safe."); }}
                className="pmc-focus pmc-mt-2 w-100 pmc-radius-sm pmc-py-2 pmc-fs-115 fw-bold pmc-muted"
                style={{ border: "1px dashed var(--pmc-line)", background: "transparent" }}
              >
                Copy production key
              </button>
            </div>
            <div className="pmc-card p-4 flex-grow-1">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-2">API usage · 30d</p>
              <div className="d-flex flex-column pmc-gap-25">
                {[
                  ["Issuance calls", 12400, 78],
                  ["Authorisation events", 88400, 64],
                  ["Webhook deliveries", 5210, 46],
                ].map(([label, val, w]) => (
                  <div key={label as string}>
                    <div className="pmc-mb-1 d-flex justify-content-between pmc-fs-11 fw-bold"><span className="pmc-muted">{label}</span><span className="pmc-num pmc-ink">{(val as number).toLocaleString()}</span></div>
                    <Progress value={w as number} tone="violet" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ 04 · Admin access ============ */

export function AdminAccessSection() {
  const { toast } = useApp();
  return (
    <section id="admin-access" className="pmc-scroll-mt">
      <SectionHead no="04" title="Admin Access" sub="Who can administer the card programme and their scope.">
        <Btn size="sm" icon="plus" onClick={() => toast("info", "Invite sent", "A new administrator invitation has been emailed.")}>Invite Admin</Btn>
      </SectionHead>

      <Reveal>
        <div className="pmc-table-frame">
          <div className="d-none d-md-block">
            <table className="pmc-table w-100 text-start">
              <thead>
                <tr>
                  <th className="pmc-px-4 pmc-py-25">Administrator</th>
                  <th className="pmc-px-3 pmc-py-25">Access level</th>
                  <th className="pmc-px-3 pmc-py-25">Last login</th>
                  <th className="pmc-px-4 pmc-py-25 text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {SEED_ADMINS.map((a) => (
                  <tr key={a.id}>
                    <td className="pmc-px-4 pmc-py-3">
                      <div className="d-flex align-items-center pmc-gap-25">
                        <span className="pmc-display d-grid flex-none fw-bold pmc-green" style={{ width: 32, height: 32, borderRadius: 99, background: "var(--pmc-ink)", fontSize: 10.5 }}>{a.initials}</span>
                        <div className="lh-sm"><p className="fw-bold pmc-ink mb-0">{a.name}</p><p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{a.role}</p></div>
                      </div>
                    </td>
                    <td className="pmc-px-3 pmc-py-3"><Badge tone="muted">{a.access}</Badge></td>
                    <td className="pmc-px-3 pmc-py-3 fw-semibold pmc-muted">{a.lastLogin}</td>
                    <td className="pmc-px-4 pmc-py-3 text-end"><Badge tone={a.status === "active" ? "success" : "warning"} dot className="text-capitalize">{a.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="pmc-mobile-list d-md-none">
            {SEED_ADMINS.map((a) => (
              <li key={a.id}>
                <span className="pmc-display d-grid flex-none fw-bold pmc-green" style={{ width: 36, height: 36, borderRadius: 99, background: "var(--pmc-ink)", fontSize: 11 }}>{a.initials}</span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <p className="text-truncate pmc-fs-13 fw-bold pmc-ink mb-0">{a.name}</p>
                  <p className="pmc-fs-105 fw-semibold pmc-faint mb-0">{a.access}</p>
                </div>
                <Badge tone={a.status === "active" ? "success" : "warning"} dot className="text-capitalize">{a.status}</Badge>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center justify-content-between px-4 pmc-py-25" style={{ borderTop: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.6)" }}>
            <p className="pmc-fs-115 fw-bold pmc-muted mb-0">{SEED_ADMINS.length} administrators</p>
            <p className="pmc-fs-115 fw-semibold pmc-faint mb-0">Owner access cannot be revoked</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ============ 05 · Environment & maintenance ============ */

export function EnvironmentSection() {
  const { toast } = useApp();
  const items: [string, string][] = [
    ["Region", ENV_INFO.region],
    ["Environment", ENV_INFO.environment],
    ["API version", ENV_INFO.apiVersion],
    ["Issuer partner", ENV_INFO.issuerPartner],
    ["Compliance", ENV_INFO.pci],
    ["Networks", ENV_INFO.networks],
  ];

  return (
    <section id="environment" className="pmc-scroll-mt">
      <SectionHead no="05" title="Environment & Maintenance" sub="Where the programme runs and upcoming maintenance windows." />

      <div className="row pmc-g-3">
        <Reveal className="col-12 col-lg-7 h-100">
          <div className="pmc-card p-4 h-100">
            <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-3">Environment details</p>
            <div className="overflow-hidden pmc-radius" style={{ border: "1px solid var(--pmc-line)" }}>
              {items.map(([k, v], i) => (
                <div key={k} className="d-flex flex-wrap align-items-center justify-content-between pmc-gap-2 px-4 pmc-py-3 pmc-fs-125" style={{ background: i % 2 === 0 ? "rgba(242,244,248,0.5)" : "#fff" }}>
                  <span className="fw-bold pmc-ink">{k}</span>
                  <span className="text-end fw-semibold pmc-muted">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={80} className="col-12 col-lg-5 h-100">
          <div className="d-flex flex-column pmc-gap-3 h-100">
            <div className="pmc-card p-4">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-25">Maintenance windows</p>
              <ul className="list-unstyled d-flex flex-column pmc-gap-2 mb-0">
                {MAINTENANCE_WINDOWS.map((m) => (
                  <li key={m.window} className="pmc-radius p-3" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.4)" }}>
                    <p className="d-flex align-items-center pmc-gap-2 pmc-fs-12 fw-bold pmc-ink mb-0"><Icon name="clock" size={13} className="pmc-muted" /> {m.window}</p>
                    <p className="pmc-mt-05 pmc-fs-105 fw-semibold pmc-faint mb-0">{m.when}</p>
                    <Badge tone={m.status === "upcoming" ? "info" : "muted"} className="pmc-mt-15">{m.status}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pmc-card p-4 flex-grow-1">
              <p className="pmc-display pmc-fs-135 fw-bold pmc-ink pmc-mb-2">Uptime · last 30 days</p>
              <p className="pmc-num pmc-display pmc-fs-26 fw-bold pmc-green-dark mb-0">99.98%</p>
              <p className="pmc-fs-11 pmc-muted mb-0">4 minutes of scheduled maintenance, zero unplanned incidents.</p>
              <button type="button" onClick={() => toast("info", "Status page", "Live status is published at status.paymo.app.")} className="pmc-focus pmc-mt-3 pmc-fs-115 fw-bold pmc-green-dark border-0 bg-transparent p-0">View status page →</button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   Modals
   ============================================================ */

/* ============ Health check modal ============ */

export function HealthCheckModal() {
  const { modal, closeModal, sync, toast } = useApp();
  const open = modal?.type === "adminHealth";
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ name: string; ok: boolean; latency: string }[]>([]);
  const [done, setDone] = useState(false);

  const run = () => {
    setRunning(true);
    setDone(false);
    setResults([]);
    sync();
    SEED_SYSTEMS.forEach((s, i) => {
      window.setTimeout(() => {
        setResults((r) => [...r, { name: s.name, ok: s.status !== "down" && s.status !== "degraded", latency: s.latency ?? "—" }]);
        if (i === SEED_SYSTEMS.length - 1) {
          setRunning(false);
          setDone(true);
          toast("success", "Health check complete", "All issuing endpoints responded. See the results below.");
        }
      }, 350 * (i + 1));
    });
  };

  useEffect(() => {
    if (open) { setRunning(false); setDone(false); setResults([]); }
  }, [open]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={closeModal} icon="gauge" title="Run health check" subtitle="Pings every issuing endpoint and returns latency in real time." width="max-w-lg" footer={done ? <Btn icon="check" onClick={closeModal}>Done</Btn> : <><Btn variant="outline" onClick={closeModal}>Cancel</Btn><Btn icon="refresh" disabled={running} onClick={run}>{running ? "Checking…" : "Start Check"}</Btn></>}>
      <div className="d-flex flex-column pmc-gap-2">
        {results.length === 0 && !running && (
          <Empty icon="gauge" title="Ready to check" sub="Start a health check to probe gateways, ledger, KYC/AML and settlement." />
        )}
        {results.map((r) => (
          <div key={r.name} className="d-flex align-items-center pmc-gap-3 pmc-radius p-3" style={{ border: "1px solid var(--pmc-line)", background: "#fff" }}>
            <span className={cn("pmc-icon-sq d-grid flex-none", r.ok ? "pmc-tone-green" : "pmc-tone-warn")}>
              <Icon name={r.ok ? "checkCircle" : "alertTri"} size={16} />
            </span>
            <div className="flex-grow-1" style={{ minWidth: 0 }}><p className="pmc-fs-125 fw-bold pmc-ink mb-0">{r.name}</p><p className="pmc-fs-105 fw-semibold pmc-faint mb-0">Latency {r.latency}</p></div>
            <Badge tone={r.ok ? "success" : "warning"} dot>{r.ok ? "Healthy" : "Degraded"}</Badge>
          </div>
        ))}
        {running && (
          <div className="d-flex align-items-center justify-content-center pmc-gap-2 py-4 pmc-fs-12 fw-bold pmc-muted">
            <Icon name="refresh" size={15} className="pmc-spin" /> Probing endpoints…
          </div>
        )}
        {done && (
          <p className="pmc-note pmc-note-green mb-0">
            <Icon name="checkCircle" size={12} className="flex-none" style={{ marginTop: 2 }} /> Check complete — KYC/AML oracle still degraded (1.2s), everything else is operational.
          </p>
        )}
      </div>
    </Modal>
  );
}

/* ============ Webhook detail modal ============ */

export function WebhookModal() {
  const { modal, closeModal, toast } = useApp();
  const open = modal?.type === "adminWebhook";
  const webhook = WEBHOOK_ENDPOINTS.find((w) => w.id === (modal?.type === "adminWebhook" ? modal.webhookId : ""));
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (open) setEnabled(true);
  }, [open]);

  if (!open || !webhook) return null;

  return (
    <Modal open={open} onClose={closeModal} icon="key" title={webhook.name} subtitle="Outgoing webhook configuration and delivery health." width="max-w-lg" footer={<><Btn variant="outline" onClick={closeModal}>Cancel</Btn><Btn icon="check" onClick={() => { toast("success", "Webhook saved", `${webhook.name} configuration updated.`); closeModal(); }}>Save</Btn></>}>
      <div className="d-flex flex-column pmc-gap-4">
        <div>
          <FieldLabel>Endpoint URL</FieldLabel>
          <input value={webhook.url} readOnly className="form-control pmc-focus" style={{ fontFamily: "var(--bs-font-monospace, SFMono-Regular, Menlo, monospace)", fontSize: 12, background: "rgba(242,244,248,0.6)" }} />
        </div>
        <div
          className="d-flex align-items-center pmc-gap-3 pmc-radius p-3"
          style={enabled ? { border: "1px solid rgba(18,183,106,0.4)", background: "rgba(231,248,239,0.4)" } : { border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}
        >
          <span className={cn("pmc-icon-sq d-grid flex-none", enabled ? "pmc-green-ink" : "pmc-faint")} style={{ background: "#fff", boxShadow: enabled ? "0 1px 2px rgba(16,24,40,0.06)" : undefined }}><Icon name="refresh" size={16} /></span>
          <div className="flex-grow-1"><p className="pmc-fs-125 fw-bold pmc-ink mb-0">Active</p><p className="pmc-fs-11 pmc-muted mb-0">Pause delivery without deleting the endpoint.</p></div>
          <Toggle on={enabled} label="Webhook active" onChange={setEnabled} />
        </div>
        <div className="pmc-radius pmc-p-35" style={{ border: "1px solid var(--pmc-line)", background: "rgba(242,244,248,0.5)" }}>
          <p className="pmc-fs-11 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.08em" }}>Delivery stats · 30d</p>
          <div className="pmc-mt-2 row g-2 text-center">
            <div className="col-4"><p className="pmc-num pmc-display pmc-fs-14 fw-bold pmc-ink mb-0">{webhook.successRate}%</p><p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Success</p></div>
            <div className="col-4"><p className="pmc-num pmc-display pmc-fs-14 fw-bold pmc-ink mb-0">5,210</p><p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Delivered</p></div>
            <div className="col-4"><p className="pmc-num pmc-display pmc-fs-14 fw-bold pmc-ink mb-0">0</p><p className="pmc-fs-95 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.025em" }}>Retries queued</p></div>
          </div>
        </div>
        <div className="d-flex flex-wrap pmc-gap-2">
          <Btn size="sm" variant="outline" icon="send" onClick={() => toast("success", "Test event sent", "A sample payload was delivered to the endpoint.")}>Test webhook</Btn>
          <Btn size="sm" variant="outline" icon="refresh" onClick={() => toast("info", "Replaying failures", "Failed deliveries will be retried in the next minute.")}>Replay failures</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ============ API key modal ============ */

export function ApiKeyModal() {
  const { modal, closeModal, toast } = useApp();
  const open = modal?.type === "adminKey";
  const [name, setName] = useState("");
  const [env, setEnv] = useState<"live" | "test">("test");
  const [scope, setScope] = useState("read");
  const [created, setCreated] = useState<{ prefix: string; secret: string } | null>(null);

  useEffect(() => {
    if (open) { setName(""); setEnv("test"); setScope("read"); setCreated(null); }
  }, [open]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={closeModal} icon="key" title={created ? "Key created" : "Create API key"} subtitle={created ? undefined : "Credentials for your engineering team to integrate with the card programme."} width="max-w-lg" footer={created ? <Btn icon="check" onClick={closeModal}>Done</Btn> : <><Btn variant="outline" onClick={closeModal}>Cancel</Btn><Btn icon="key" disabled={name.trim().length < 2} onClick={() => setCreated({ prefix: `${env === "live" ? "pk_live" : "pk_test"}_${Math.random().toString(36).slice(2, 8)}`, secret: `${env === "live" ? "sk_live" : "sk_test"}_${Math.random().toString(36).slice(2, 18)}` })}>Create Key</Btn></>}>
      {created ? (
        <div className="d-flex flex-column pmc-gap-3">
          <div className="pmc-radius p-4 text-center" style={{ border: "2px solid rgba(18,183,106,0.5)", background: "rgba(231,248,239,0.4)" }}>
            <p className="pmc-fs-11 fw-bold text-uppercase pmc-faint mb-0" style={{ letterSpacing: "0.1em" }}>Copy now — shown once</p>
            <p className="pmc-mt-2 pmc-fs-13 fw-bold pmc-ink mb-0" style={{ wordBreak: "break-all", fontFamily: "var(--bs-font-monospace, SFMono-Regular, Menlo, monospace)" }}>{created.secret}</p>
            <p className="pmc-mt-1 pmc-fs-11 fw-semibold pmc-faint mb-0" style={{ wordBreak: "break-all", fontFamily: "var(--bs-font-monospace, SFMono-Regular, Menlo, monospace)" }}>{created.prefix}</p>
          </div>
          <Btn className="w-100" icon="copy" onClick={() => { navigator.clipboard?.writeText(created.secret).catch(() => {}); toast("success", "Key copied", "Store it in your secrets manager."); }}>Copy secret key</Btn>
        </div>
      ) : (
        <div className="d-flex flex-column pmc-gap-4">
          <div>
            <FieldLabel>Key name</FieldLabel>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Production Core" className="form-control pmc-focus fw-bold" />
          </div>
          <div>
            <FieldLabel>Environment</FieldLabel>
            <div className="row g-2">
              {([["test", "Test / sandbox"], ["live", "Live production"]] as const).map(([id, label]) => (
                <div key={id} className="col-6">
                  <button type="button" onClick={() => setEnv(id)} className={cn("pmc-focus pmc-rect-choice w-100 justify-content-center", env === id && "on")}>{label}</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Permissions</FieldLabel>
            <div className="d-flex flex-wrap pmc-gap-2">
              {["read", "write", "admin"].map((s) => (
                <button key={s} type="button" onClick={() => setScope(s)} className={cn("pmc-focus pmc-pill-choice text-capitalize", scope === s && "on")}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
