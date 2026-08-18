import { useEffect, useState } from "react";
import { cn } from "../../../../lib";
import { Icon, type IconName } from "../../../../components/ui/icons";
import { Badge, Btn, Chip, FieldLabel, Modal, Progress, Reveal, SectionHead, Spark, Toggle, Empty } from "../../../../components/ui";
import { useApp, scrollToId } from "../../../../lib";
import { kes, kesShort, type PmCard, type Txn } from "../../../../lib";
import { CardVisual } from "../../../../components/modals/modalsA";
import {
  ENV_INFO,
  MAINTENANCE_WINDOWS,
  SEED_ADMINS,
  SEED_API_KEYS,
  SEED_GATEWAY_EVENTS,
  SEED_SYSTEMS,
  WEBHOOK_ENDPOINTS,
  type SystemStatus,
} from "../../../../lib";

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
    <section id="overview" className="scroll-mt-24">
      <Reveal>
        <div className="pm-hero relative overflow-hidden rounded-2xl border border-line p-5 text-white shadow-pm sm:p-7">
          <div className="pm-hero-dots absolute inset-0" />
          <div className="relative flex flex-wrap items-center gap-6">
            <div className="min-w-0 flex-1 basis-[300px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#cfe8db]">
                  <span className="live-dot" /> BAAS · Cards
                </span>
                <span className="rounded-md bg-white/12 px-2.5 py-1 text-[10.5px] font-semibold text-[#cfe8db]">Module 5.9</span>
              </div>
              <h1 className="font-display mt-3 text-[26px] font-bold leading-[1.1] tracking-tight sm:text-[34px]">
                Card Program<br className="hidden sm:block" /> Administration
              </h1>
              <p className="mt-2 max-w-[510px] text-[13px] leading-relaxed text-white/65">
                Monitor the issuing stack — gateways, ledger, KYC/AML and settlement — plus webhooks,
                API keys and admin access for the whole programme.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Btn icon="refresh" onClick={runCheck}>{syncing ? "Checking…" : "Run Health Check"}</Btn>
                <Btn variant="ghost" icon="key" onClick={() => document.getElementById("integrations")?.scrollIntoView({ behavior: "smooth" })}>API Keys</Btn>
                <Btn variant="ghost" icon="gauge" onClick={() => setPage("5.1")}>Command Center</Btn>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { k: "Systems healthy", v: `${healthy}/${SEED_SYSTEMS.length}` },
                  { k: "Degraded", v: String(degraded), warn: degraded > 0 },
                  { k: "Uptime · 30d", v: "99.98%" },
                  { k: "Last check", v: checked },
                ].map((s) => (
                  <div key={s.k} className="leading-tight">
                    <p className={cn("font-display num text-[17px] font-bold", s.warn ? "text-[#ffd27d]" : "text-white")}>{s.v}</p>
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/45">{s.k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden h-[220px] w-[260px] flex-none md:block">
              <div className="absolute right-0 top-0 w-[230px] rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Issuing endpoints</p>
                <div className="mt-3 space-y-2">
                  {SEED_SYSTEMS.slice(0, 4).map((s) => {
                    const m = statusMeta[s.status];
                    return (
                      <div key={s.id} className="flex items-center gap-2">
                        <span className={cn("live-dot", m.dot === "amber" && "amber", m.dot === "red" && "red")} />
                        <span className="flex-1 text-[11.5px] font-bold text-white/85">{s.name}</span>
                        <span className="text-[10px] font-bold text-white/50">{s.latency ?? "—"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-[210px] rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Environment</p>
                <p className="mt-1 text-[12px] font-bold text-white">{ENV_INFO.environment}</p>
                <p className="text-[10.5px] text-white/50">{ENV_INFO.region}</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* systems grid */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SEED_SYSTEMS.map((s, i) => {
          const m = statusMeta[s.status];
          return (
            <Reveal key={s.id} delay={(i % 3) * 70}>
              <button onClick={() => openModal({ type: "adminHealth" })} className={cn("group w-full rounded-2xl border bg-white p-4 text-left shadow-pm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pm-lg", s.status === "degraded" ? "border-warn/40" : "border-line")}>
                <div className="flex items-start justify-between">
                  <span className={cn("grid h-[42px] w-[42px] place-items-center rounded-xl", m.tone === "success" ? "bg-pmgreen-soft text-[#067647]" : m.tone === "warning" ? "bg-warn-soft text-[#93370d]" : m.tone === "info" ? "bg-pmblue-soft text-[#175cd3]" : "bg-canvas text-muted")}>
                    <Icon name={m.icon} size={19} />
                  </span>
                  <span className={cn("live-dot", m.dot === "amber" && "amber", m.dot === "red" && "red")} />
                </div>
                <p className="mt-3 text-[13.5px] font-bold text-ink">{s.name}</p>
                <p className="mt-0.5 text-[11.5px] font-semibold text-muted">{s.detail}</p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge tone={m.tone} dot>{m.label}</Badge>
                  <span className="text-[10.5px] font-semibold text-faint">{s.latency ? `${s.latency} · ` : ""}{s.lastEvent}</span>
                </div>
              </button>
            </Reveal>
          );
        })}
      </div>

      {/* degraded callout */}
      {degraded > 0 && (
        <Reveal delay={120}>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-warn/35 bg-warn-soft/40 p-4">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-warn/15 text-[#93370d]"><Icon name="alertTri" size={18} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold text-[#93370d]">KYC / AML Oracle is degraded</p>
              <p className="text-[11.5px] text-[#93370d]/75">Identity checks are running with a 1.2s delay. Issuance remains unaffected — the vendor is investigating.</p>
            </div>
            <Btn size="sm" variant="outline" onClick={() => openModal({ type: "adminHealth" })}>Details</Btn>
          </div>
        </Reveal>
      )}

      <Reveal delay={140}>
        <p className="mt-4 flex items-center justify-center gap-1.5 rounded-2xl border border-line bg-white py-3 text-center text-[11.5px] font-semibold text-muted shadow-pm">
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
    <section id="gateway-logs" className="scroll-mt-24">
      <SectionHead  title="Gateway Logs" sub="Live request/response flow across Visa, Mastercard, ledger and the KYC/AML oracle.">
        <Btn size="sm" variant="outline" icon="download" onClick={() => toast("success", "Gateway logs exported", `${SEED_GATEWAY_EVENTS.length} events written to gateway-logs.csv`)}>Export</Btn>
      </SectionHead>

      <div className="mb-4 grid grid-cols-3 gap-3 sm:max-w-md">
        {[
          { k: "Success rate", v: `${successRate}%`, tone: "text-[#067647]" },
          { k: "Requests", v: String(SEED_GATEWAY_EVENTS.length), tone: "text-ink" },
          { k: "Errors", v: String(SEED_GATEWAY_EVENTS.filter((e) => e.status !== "success").length), tone: "text-[#b42318]" },
        ].map((s) => (
          <div key={s.k} className="rounded-xl border border-line bg-white p-3 shadow-pm">
            <p className="text-[10px] font-bold uppercase tracking-wide text-faint">{s.k}</p>
            <p className={cn("num font-display mt-1 text-[16px] font-bold", s.tone)}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="thin-scroll mb-4 flex gap-2 overflow-x-auto pb-1">
        {(["all", "success", "error"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition", filter === f ? "border-ink bg-ink text-white" : "border-line bg-white text-muted hover:border-[#c4c9d4]")}>
            {f === "all" ? "All" : f === "success" ? "Successful" : "Errors"}
          </button>
        ))}
      </div>

      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
          <ul className="divide-y divide-line/70 font-mono text-[12px]">
            {shown.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-canvas/60">
                <span className="num flex-none text-[11px] font-bold text-faint">{e.time}</span>
                <span className="w-[130px] flex-none font-bold text-ink">{e.gateway}</span>
                <span className="hidden flex-1 font-semibold text-muted sm:block">{e.type}</span>
                <span className={cn("num flex-none font-bold", e.status === "success" ? "text-[#067647]" : e.status === "retry" ? "text-[#93370d]" : "text-[#b42318]")}>{e.code}</span>
                <span className="flex-none"><Badge tone={e.status === "success" ? "success" : e.status === "retry" ? "warning" : "danger"} dot>{e.status === "success" ? "200" : e.status === "retry" ? "Retry" : "Error"}</Badge></span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-line bg-canvas/60 px-4 py-2.5">
            <p className="text-[11.5px] font-bold text-muted">{shown.length} event{shown.length === 1 ? "" : "s"}</p>
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-faint"><span className="live-dot" /> Streaming live</p>
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
    <section id="integrations" className="scroll-mt-24">
      <SectionHead  title="Webhooks & API Keys" sub="Outgoing webhooks for card events and API credentials for your engineering team.">
        <Btn size="sm" icon="plus" onClick={() => openModal({ type: "adminKey" })}>New API Key</Btn>
      </SectionHead>

      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Webhook endpoints</p>
            <ul className="space-y-2">
              {WEBHOOK_ENDPOINTS.map((w) => (
                <li key={w.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-canvas/40 px-3.5 py-3">
                  <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", w.status === "healthy" ? "bg-pmgreen-soft text-[#067647]" : "bg-danger-soft text-[#b42318]")}>
                    <Icon name={w.status === "healthy" ? "checkCircle" : "alertTri"} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-bold text-ink">{w.name}</p>
                    <p className="truncate font-mono text-[10.5px] font-semibold text-faint">{w.url}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone={w.status === "healthy" ? "success" : "danger"} dot>{w.status === "healthy" ? "Healthy" : "Failing"}</Badge>
                    <span className="num text-[10.5px] font-semibold text-faint">{w.successRate}% success · {w.last}</span>
                  </div>
                  <button onClick={() => openModal({ type: "adminWebhook", webhookId: w.id })} className="focus-ring grid h-8 w-8 place-items-center rounded-[9px] border border-line text-muted transition hover:border-pmgreen/50 hover:bg-pmgreen-soft hover:text-[#067647]"><Icon name="sliders" size={14} /></button>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-[13.5px] font-bold text-ink">API keys</p>
                <Btn size="sm" variant="outline" icon="plus" onClick={() => openModal({ type: "adminKey" })}>Add</Btn>
              </div>
              <ul className="space-y-2">
                {SEED_API_KEYS.map((k) => (
                  <li key={k.id} className="flex items-center gap-3 rounded-xl border border-line bg-canvas/40 px-3 py-2.5">
                    <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-ink font-display text-[10px] font-bold text-pmgreen"><Icon name="key" size={14} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-bold text-ink">{k.name}</p>
                      <p className="font-mono text-[10px] font-semibold text-faint">{k.prefix}</p>
                    </div>
                    <Badge tone={k.env === "live" ? "success" : "muted"}>{k.env}</Badge>
                  </li>
                ))}
              </ul>
              <button onClick={() => { navigator.clipboard?.writeText("pk_live_8f2a").catch(() => {}); toast("info", "Key copied", "Secret revealed once — copy it somewhere safe."); }} className="mt-2 w-full rounded-[10px] border border-dashed border-line py-2 text-[11.5px] font-bold text-muted transition hover:border-pmgreen/50 hover:text-[#067647]">Copy production key</button>
            </div>
            <div className="flex-1 rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2 text-[13.5px] font-bold text-ink">API usage · 30d</p>
              <div className="space-y-2.5">
                {[
                  ["Issuance calls", 12400, 78],
                  ["Authorisation events", 88400, 64],
                  ["Webhook deliveries", 5210, 46],
                ].map(([label, val, w]) => (
                  <div key={label as string}>
                    <div className="mb-1 flex justify-between text-[11px] font-bold"><span className="text-muted">{label}</span><span className="num text-ink">{(val as number).toLocaleString()}</span></div>
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
    <section id="admin-access" className="scroll-mt-24">
      <SectionHead  title="Admin Access" sub="Who can administer the card programme and their scope.">
        <Btn size="sm" icon="plus" onClick={() => toast("info", "Invite sent", "A new administrator invitation has been emailed.")}>Invite Admin</Btn>
      </SectionHead>

      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-pm">
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line bg-canvas/70 text-[10.5px] font-bold uppercase tracking-[0.08em] text-faint">
                  <th className="px-4 py-2.5">Administrator</th>
                  <th className="px-3 py-2.5">Access level</th>
                  <th className="px-3 py-2.5">Last login</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {SEED_ADMINS.map((a) => (
                  <tr key={a.id} className="text-[12.5px] transition hover:bg-canvas/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-ink font-display text-[10.5px] font-bold text-pmgreen">{a.initials}</span>
                        <div className="leading-tight"><p className="font-bold text-ink">{a.name}</p><p className="text-[10.5px] font-semibold text-faint">{a.role}</p></div>
                      </div>
                    </td>
                    <td className="px-3 py-3"><Badge tone="muted">{a.access}</Badge></td>
                    <td className="px-3 py-3 font-semibold text-muted">{a.lastLogin}</td>
                    <td className="px-4 py-3 text-right"><Badge tone={a.status === "active" ? "success" : "warning"} dot className="capitalize">{a.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="divide-y divide-line/70 md:hidden">
            {SEED_ADMINS.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3">
                <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-ink font-display text-[11px] font-bold text-pmgreen">{a.initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-ink">{a.name}</p>
                  <p className="text-[10.5px] font-semibold text-faint">{a.access}</p>
                </div>
                <Badge tone={a.status === "active" ? "success" : "warning"} dot className="capitalize">{a.status}</Badge>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-line bg-canvas/60 px-4 py-2.5">
            <p className="text-[11.5px] font-bold text-muted">{SEED_ADMINS.length} administrators</p>
            <p className="text-[11.5px] font-semibold text-faint">Owner access cannot be revoked</p>
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
    <section id="environment" className="scroll-mt-24">
      <SectionHead  title="Environment & Maintenance" sub="Where the programme runs and upcoming maintenance windows." />

      <div className="grid gap-3 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="h-full rounded-2xl border border-line bg-white p-4 shadow-pm">
            <p className="font-display mb-3 text-[13.5px] font-bold text-ink">Environment details</p>
            <div className="overflow-hidden rounded-xl border border-line">
              {items.map(([k, v], i) => (
                <div key={k} className={cn("flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[12.5px]", i % 2 === 0 ? "bg-canvas/50" : "bg-white")}>
                  <span className="font-bold text-ink">{k}</span>
                  <span className="text-right font-semibold text-muted">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
          <div className="flex h-full flex-col gap-3">
            <div className="rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2.5 text-[13.5px] font-bold text-ink">Maintenance windows</p>
              <ul className="space-y-2">
                {MAINTENANCE_WINDOWS.map((m) => (
                  <li key={m.window} className="rounded-xl border border-line bg-canvas/40 p-3">
                    <p className="flex items-center gap-2 text-[12px] font-bold text-ink"><Icon name="clock" size={13} className="text-muted" /> {m.window}</p>
                    <p className="mt-0.5 text-[10.5px] font-semibold text-faint">{m.when}</p>
                    <Badge tone={m.status === "upcoming" ? "info" : "muted"} className="mt-1.5">{m.status}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 rounded-2xl border border-line bg-white p-4 shadow-pm">
              <p className="font-display mb-2 text-[13.5px] font-bold text-ink">Uptime · last 30 days</p>
              <p className="num font-display text-[26px] font-bold text-pmgreen-dark">99.98%</p>
              <p className="text-[11px] text-muted">4 minutes of scheduled maintenance, zero unplanned incidents.</p>
              <button onClick={() => toast("info", "Status page", "Live status is published at status.paymo.app.")} className="mt-3 text-[11.5px] font-bold text-pmgreen-dark transition hover:text-pmgreen">View status page →</button>
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
      <div className="space-y-2">
        {results.length === 0 && !running && (
          <Empty icon="gauge" title="Ready to check" sub="Start a health check to probe gateways, ledger, KYC/AML and settlement." />
        )}
        {results.map((r) => (
          <div key={r.name} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3">
            <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", r.ok ? "bg-pmgreen-soft text-[#067647]" : "bg-warn-soft text-[#93370d]")}>
              <Icon name={r.ok ? "checkCircle" : "alertTri"} size={16} />
            </span>
            <div className="min-w-0 flex-1"><p className="text-[12.5px] font-bold text-ink">{r.name}</p><p className="text-[10.5px] font-semibold text-faint">Latency {r.latency}</p></div>
            <Badge tone={r.ok ? "success" : "warning"} dot>{r.ok ? "Healthy" : "Degraded"}</Badge>
          </div>
        ))}
        {running && (
          <div className="flex items-center justify-center gap-2 py-4 text-[12px] font-bold text-muted">
            <Icon name="refresh" size={15} className="spin-slow" /> Probing endpoints…
          </div>
        )}
        {done && (
          <p className="rounded-lg bg-pmgreen-soft/50 px-3 py-2 text-[11.5px] font-semibold text-[#067647]">
            <Icon name="checkCircle" size={12} className="mr-1 inline" /> Check complete — KYC/AML oracle still degraded (1.2s), everything else is operational.
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
      <div className="space-y-4">
        <div>
          <FieldLabel>Endpoint URL</FieldLabel>
          <input value={webhook.url} readOnly className="focus-ring w-full rounded-[10px] border border-line bg-canvas/60 px-3.5 py-2.5 font-mono text-[12px] font-semibold text-ink outline-none" />
        </div>
        <div className={cn("flex items-center gap-3 rounded-xl border p-3", enabled ? "border-pmgreen/40 bg-pmgreen-soft/40" : "border-line bg-canvas/50")}>
          <span className={cn("grid h-9 w-9 flex-none place-items-center rounded-[10px]", enabled ? "bg-white text-[#067647] shadow-sm" : "bg-white text-faint")}><Icon name="refresh" size={16} /></span>
          <div className="flex-1"><p className="text-[12.5px] font-bold text-ink">Active</p><p className="text-[11px] text-muted">Pause delivery without deleting the endpoint.</p></div>
          <Toggle on={enabled} label="Webhook active" onChange={setEnabled} />
        </div>
        <div className="rounded-xl border border-line bg-canvas/50 p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-faint">Delivery stats · 30d</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div><p className="num font-display text-[14px] font-bold text-ink">{webhook.successRate}%</p><p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Success</p></div>
            <div><p className="num font-display text-[14px] font-bold text-ink">5,210</p><p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Delivered</p></div>
            <div><p className="num font-display text-[14px] font-bold text-ink">0</p><p className="text-[9.5px] font-bold uppercase tracking-wide text-faint">Retries queued</p></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
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
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-pmgreen/50 bg-pmgreen-soft/40 p-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-faint">Copy now — shown once</p>
            <p className="mt-2 break-all font-mono text-[13px] font-bold text-ink">{created.secret}</p>
            <p className="mt-1 break-all font-mono text-[11px] font-semibold text-faint">{created.prefix}</p>
          </div>
          <Btn className="w-full" icon="copy" onClick={() => { navigator.clipboard?.writeText(created.secret).catch(() => {}); toast("success", "Key copied", "Store it in your secrets manager."); }}>Copy secret key</Btn>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <FieldLabel>Key name</FieldLabel>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Production Core" className="focus-ring w-full rounded-[10px] border border-line bg-canvas/50 px-3.5 py-2.5 text-[13px] font-bold text-ink outline-none transition placeholder:font-medium placeholder:text-faint focus:border-pmgreen/60 focus:bg-white" />
          </div>
          <div>
            <FieldLabel>Environment</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {([["test", "Test / sandbox"], ["live", "Live production"]] as const).map(([id, label]) => (
                <button key={id} onClick={() => setEnv(id)} className={cn("rounded-[10px] border-2 px-3 py-2.5 text-[12px] font-bold transition", env === id ? "border-pmgreen bg-pmgreen-soft/50 text-[#067647]" : "border-line bg-white text-ink-2 hover:border-[#c4c9d4]")}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Permissions</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {["read", "write", "admin"].map((s) => (
                <button key={s} onClick={() => setScope(s)} className={cn("rounded-full border px-3 py-1.5 text-[11.5px] font-bold capitalize transition", scope === s ? "border-pmgreen bg-pmgreen-soft text-[#067647]" : "border-line bg-white text-muted hover:border-[#c4c9d4]")}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
