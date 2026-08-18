import { useEffect, useState } from "react";
import { API_USAGE, APPS, SOCIAL_INBOX_SAMPLE } from "./data";
import { useStore } from "./store";
import { Badge, Chip, Drawer, Field, Modal, StatusBadge, WizardShell } from "./ui";

/* ==================================================================
   APP DRAWER — connection detail
================================================================== */
export function AppDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { connections, openModal, syncConnection, toggleWebhook } = useStore();
  void toggleWebhook;
  const c = connections.find((x) => x.id === String(payload.id));
  const [syncing, setSyncing] = useState(false);
  if (!c) return null;
  const app = APPS.find((a) => a.id === c.appId);
  return (
    <Drawer open onClose={onClose} icon={c.icon} title={c.name} subtitle={`${c.direction} · ${c.frequency} · region: Kenya (Nairobi)`}>
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={c.status === "Reconnect needed" ? "Reconnect needed" : c.status} />
        <Badge tone="slate">uptime {c.uptime}</Badge>
        <Badge tone="blue">{c.records.toLocaleString()} records</Badge>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Last sync</div><b style={{ fontSize: "0.8rem" }}>{c.lastSync}</b></div></div>
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Errors (30d)</div><b style={{ color: c.errors ? "var(--pm-danger)" : "var(--pm-green-dark)" }}>{c.errors}</b></div></div>
      </div>
      {c.tokenExpiry && (
        <div className="pm-note mb-3" style={{ borderColor: "#f6b7b0", background: "#fef6f5" }}>
          <i className="bi bi-exclamation-triangle me-1" style={{ color: "var(--pm-danger)" }} />{c.tokenExpiry}
        </div>
      )}
      <div className="pm-kpi-label mb-2">Granted scopes</div>
      {c.scopes.map((s) => (
        <div key={s} className="d-flex align-items-center gap-2 py-1"><i className="bi bi-check-circle-fill text-primary" /><span style={{ fontSize: "0.82rem" }}>{s}</span></div>
      ))}
      {app && (
        <div className="pm-kpi-label mt-3 mb-1">About</div>
      )}
      {app && <div className="pm-prod-meta mb-3">{app.desc} · ★ {app.rating} · {app.users} businesses</div>}
      <div className="row g-2">
        {c.status === "Error" || c.status === "Reconnect needed" ? (
          <div className="col-12">
            <button type="button" className="btn btn-warning btn-sm w-100" onClick={() => { onClose(); openModal("reconnect", { id: c.id }); }}>
              <i className="bi bi-arrow-repeat me-1" /> Re-authenticate
            </button>
          </div>
        ) : (
          <div className="col-6">
            <button type="button" className="btn btn-primary btn-sm w-100" disabled={syncing} onClick={() => {
              setSyncing(true);
              window.setTimeout(() => { setSyncing(false); syncConnection(c.id, 24 + Math.floor(Math.random() * 80)); }, 1400);
            }}>
              {syncing ? <><span className="pm-spin me-1">◌</span> Syncing…</> : <><i className="bi bi-arrow-repeat me-1" /> Sync now</>}
            </button>
          </div>
        )}
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { onClose(); openModal("mappingWizard", { connId: c.id }); }}>
            <i className="bi bi-diagram-3 me-1" /> Field mapping
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { onClose(); openModal("webhookWizard"); }}>
            <i className="bi bi-hdd-network me-1" /> Add webhook
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => { onClose(); openModal("uninstall", { id: c.id }); }}>
            <i className="bi bi-plug me-1" /> Disconnect
          </button>
        </div>
      </div>
    </Drawer>
  );
}

/* ==================================================================
   RECONNECT — animated OAuth flow
================================================================== */
export function ReconnectModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { connections, reconnectApp, recordActivity } = useStore();
  const c = connections.find((x) => x.id === String(payload.id));
  const [phase, setPhase] = useState<"idle" | "auth" | "done">("idle");
  if (!c) return null;
  const run = () => {
    setPhase("auth");
    window.setTimeout(() => {
      setPhase("done");
      reconnectApp(c.id);
      recordActivity(`${c.name} OAuth token refreshed`, "bi-shield-check");
    }, 2400);
  };
  return (
    <Modal open onClose={onClose} title="Re-authenticate" subtitle={`${c.name} — OAuth 2.0 token refresh`} icon="bi-arrow-repeat" size="sm" hideClose={phase === "auth"}
      footer={
        phase === "done" ? (
          <button type="button" className="btn btn-primary w-100" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>
        ) : (
          <button type="button" className="btn btn-outline-secondary w-100" disabled={phase === "auth"} onClick={onClose}>Cancel</button>
        )
      }
    >
      <div className="text-center py-3">
        {phase === "idle" && (
          <>
            <span className="pm-kpi-icon mx-auto mb-3" style={{ width: 64, height: 64, fontSize: "1.6rem", background: c.color + "22", color: c.color }}>
              <i className={`bi ${c.icon}`} />
            </span>
            <b style={{ fontSize: "0.95rem" }}>{c.name}</b>
            <p className="pm-prod-meta mt-1 mb-3">Your session expired (60-day Meta policy). You'll be redirected to {c.name}'s login to approve access again — 60 seconds, then sync resumes.</p>
            <button type="button" className="btn btn-success" onClick={run}><i className="bi bi-box-arrow-up-right me-1" /> Start re-authentication</button>
          </>
        )}
        {phase === "auth" && (
          <>
            <div className="pm-stk-ring mx-auto mb-3"><i className="pm-spin bi bi-arrow-repeat" style={{ fontSize: "1.6rem", color: "var(--pm-green)" }} /></div>
            <b>Redirecting to {c.name}…</b>
            <p className="pm-prod-meta mt-1 mb-0">Waiting for you to approve access. If you've approved already, we're exchanging the authorization code for tokens.</p>
          </>
        )}
        {phase === "done" && (
          <>
            <i className="bi bi-check-circle-fill" style={{ fontSize: "3rem", color: "var(--pm-green)" }} />
            <h5 className="mt-2">Reconnected 🎉</h5>
            <p className="pm-prod-meta mb-1">New token stored (valid 60 days). Queued records are syncing now.</p>
            <Badge tone="green">Sync resumed</Badge>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ==================================================================
   SYNC NOW — animated per-app progress
================================================================== */
export function SyncNowModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { connections, syncConnection, errors, toast, recordActivity } = useStore();
  const [results, setResults] = useState<{ id: string; done: boolean }[]>(
    connections.filter((c) => c.status === "Healthy").map((c) => ({ id: c.id, done: false })),
  );
  const running = results.some((r) => !r.done);
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => {
      const next = results.find((r) => !r.done);
      if (next) {
        const conn = connections.find((c) => c.id === next.id);
        if (conn) syncConnection(conn.id, 5 + Math.floor(Math.random() * 60));
        setResults((rs) => rs.map((r) => (r.id === next.id ? { ...r, done: true } : r)));
      } else {
        recordActivity(`Sync Now complete — ${results.length} connections refreshed`, "bi-arrow-repeat");
        toast(`${results.length} connections synced successfully.`, "success", "Sync complete");
      }
    }, 700);
    return () => window.clearTimeout(t);
  }, [running, results, connections, syncConnection, recordActivity, toast]);

  const failed = connections.filter((c) => c.status === "Error" || c.status === "Reconnect needed");
  return (
    <Modal open onClose={onClose} title="Sync now" subtitle="Forcing an immediate sync on all healthy connections" icon="bi-arrow-repeat" size="md" hideClose={running}
      footer={
        !running ? (
          <button type="button" className="btn btn-primary w-100" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>
        ) : undefined
      }
    >
      {results.map((r) => {
        const c = connections.find((x) => x.id === r.id);
        return (
          <div key={r.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: c?.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.62rem" }}>{c?.initials}</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 600 }} className="flex-grow-1">{c?.name}</span>
            {r.done ? (
              <Badge tone="green"><i className="bi bi-check2 me-1" />Synced</Badge>
            ) : (
              <span className="pm-prod-meta"><span className="pm-spin me-1">◌</span>Syncing…</span>
            )}
          </div>
        );
      })}
      {failed.map((c) => (
        <div key={c.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)", opacity: 0.7 }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: c.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.62rem" }}>{c.initials}</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 600 }} className="flex-grow-1">{c.name}</span>
          <Badge tone="red">Skipped — error</Badge>
        </div>
      ))}
      <div className="pm-prod-meta mt-2"><i className="bi bi-info-circle me-1" />{errors.filter((e) => e.status === "Unresolved").length} connection(s) skipped due to unresolved errors — re-authenticate or retry first.</div>
    </Modal>
  );
}

/* ==================================================================
   ERROR DETAIL + RETRY
================================================================== */
export function ErrorDetailModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { errors, retryError, openModal } = useStore();
  const e = errors.find((x) => x.id === String(payload.id));
  const [retrying, setRetrying] = useState(false);
  if (!e) return null;
  return (
    <Modal open onClose={onClose} title="Sync error detail" subtitle={`${e.app} · ${e.time}`} icon="bi-exclamation-triangle"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          {e.status === "Unresolved" ? (
            <>
              {e.errorType === "Authentication failed" && (
                <button type="button" className="btn btn-warning" onClick={() => { onClose(); openModal("reconnect", { id: "c3" }); }}>
                  <i className="bi bi-arrow-repeat me-1" /> Re-authenticate
                </button>
              )}
              <button type="button" className="btn btn-primary" disabled={retrying} onClick={() => {
                setRetrying(true);
                window.setTimeout(() => { setRetrying(false); retryError(e.id); onClose(); }, 1300);
              }}>
                {retrying ? <><span className="pm-spin me-1">◌</span> Retrying…</> : <><i className="bi bi-arrow-repeat me-1" /> Retry now</>}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>
          )}
        </>
      }
    >
      <div className="d-flex align-items-center gap-2 mb-3">
        <StatusBadge status={e.status} />
        <Badge tone="red">{e.errorType}</Badge>
        <Badge tone="slate">{e.attempts} attempt(s)</Badge>
      </div>
      <div className="pm-card mb-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
        <div className="pm-kpi-label mb-1">Error message</div>
        <div style={{ fontSize: "0.84rem" }}>{e.message}</div>
      </div>
      <div className="pm-card" style={{ boxShadow: "none", background: "#0b1322", color: "#c3cdda" }}>
        <div className="pm-mono" style={{ fontSize: "0.68rem", whiteSpace: "pre-wrap" }}>
          {`{ "error": "${e.errorType.toLowerCase().replace(/ /g, "_")}",\n  "integration": "${e.app}",\n  "status": ${e.status === "Resolved" ? "resolved" : "retry_pending"},\n  "suggested_action": ${e.errorType === "Authentication failed" ? '"re-authenticate OAuth"' : '"retry with exponential backoff"'}\n}`}
        </div>
      </div>
      {e.status === "Resolved" && <div className="pm-note mt-3"><i className="bi bi-check2-circle me-1 text-primary" />Resolved — records recovered and resynced with zero data loss.</div>}
    </Modal>
  );
}

/* ==================================================================
   WEBHOOK DETAIL — test / toggle / delete
================================================================== */
export function WebhookDetailModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { webhooks, testWebhook, toggleWebhook, deleteWebhook } = useStore();
  const w = webhooks.find((x) => x.id === String(payload.id));
  const [testing, setTesting] = useState(false);
  if (!w) return null;
  return (
    <Modal open onClose={onClose} title={w.name} subtitle={w.url} icon="bi-hdd-network" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-danger me-auto" onClick={() => { deleteWebhook(w.id); onClose(); }}>
            <i className="bi bi-trash me-1" /> Delete
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { toggleWebhook(w.id); onClose(); }}>
            <i className={`bi ${w.status === "Active" ? "bi-pause" : "bi-play"} me-1`} /> {w.status === "Active" ? "Pause" : "Activate"}
          </button>
          <button type="button" className="btn btn-primary" disabled={testing} onClick={() => {
            setTesting(true);
            window.setTimeout(() => { setTesting(false); testWebhook(w.id); }, 1100);
          }}>
            {testing ? <><span className="pm-spin me-1">◌</span> Sending…</> : <><i className="bi bi-lightning-charge me-1" /> Test webhook</>}
          </button>
        </>
      }
    >
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={w.status} />
        {w.secret && <Badge tone="violet">HMAC signed</Badge>}
        <Badge tone="blue">{w.events.length} event(s)</Badge>
      </div>
      <div className="pm-kpi-label mb-1">Subscribed events</div>
      <div className="d-flex flex-wrap gap-1 mb-3">
        {w.events.map((e) => <span key={e} className="badge-soft ink pm-mono" style={{ fontSize: "0.66rem" }}>{e}</span>)}
      </div>
      <div className="pm-kpi-label mb-2">Delivery log</div>
      {w.deliveries.length === 0 && <div className="pm-prod-meta">No deliveries yet — send a test event.</div>}
      {w.deliveries.map((d, i) => (
        <div key={i} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
          <Badge tone={d.code === 200 ? "green" : "red"}>{d.code}</Badge>
          <span className="flex-grow-1" style={{ fontSize: "0.78rem" }}>{d.status}</span>
          <span className="pm-prod-meta">{d.time}</span>
        </div>
      ))}
      <div className="pm-card mt-3" style={{ boxShadow: "none", background: "#0b1322", color: "#c3cdda" }}>
        <div className="pm-mono" style={{ fontSize: "0.68rem", whiteSpace: "pre-wrap" }}>{w.deliveries[0]?.payload ?? '{"event":"…"}'}</div>
      </div>
    </Modal>
  );
}

/* ==================================================================
   UNINSTALL CONFIRM
================================================================== */
export function UninstallModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { connections, uninstallApp } = useStore();
  const c = connections.find((x) => x.id === String(payload.id));
  if (!c) return null;
  return (
    <Modal open onClose={onClose} title="Disconnect app?" icon="bi-plug" size="sm"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Keep connected</button>
          <button type="button" className="btn btn-danger" onClick={() => { uninstallApp(c.id); onClose(); }}>
            <i className="bi bi-plug me-1" /> Disconnect
          </button>
        </>
      }
    >
      <p className="mb-1">Disconnect <b>{c.name}</b>? Syncs stop immediately and the OAuth token is revoked.</p>
      <p className="pm-prod-meta mb-0">Records already synced stay in your PayMo ledger. Reconnect anytime from the Marketplace.</p>
    </Modal>
  );
}

/* ==================================================================
   REVOKE API KEY CONFIRM
================================================================== */
export function RevokeKeyModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { apiKeys, revokeApiKey } = useStore();
  const k = apiKeys.find((x) => x.id === String(payload.id));
  if (!k) return null;
  return (
    <Modal open onClose={onClose} title="Revoke API key?" icon="bi-key" size="sm"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Keep key</button>
          <button type="button" className="btn btn-danger" onClick={() => { revokeApiKey(k.id); onClose(); }}>
            <i className="bi bi-x-circle me-1" /> Revoke
          </button>
        </>
      }
    >
      <p className="mb-1">Revoke <b>{k.name}</b> (<span className="pm-mono">{k.prefix}</span>)?</p>
      <p className="pm-prod-meta mb-0">Any integration using this key fails immediately with 401 — generate a replacement first if it's in production.</p>
    </Modal>
  );
}

/* ==================================================================
   TEST WEBHOOK (standalone)
================================================================== */
export function TestWebhookModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { webhooks, testWebhook, openModal } = useStore();
  const w = webhooks.find((x) => x.id === String(payload.id ?? webhooks[0]?.id));
  const [phase, setPhase] = useState<"idle" | "sending" | "done">("idle");
  if (!w) return null;
  const send = () => {
    setPhase("sending");
    window.setTimeout(() => { setPhase("done"); testWebhook(w.id); }, 1300);
  };
  return (
    <Modal open onClose={onClose} title="Test webhook" subtitle={`${w.name} · ${w.url}`} icon="bi-lightning-charge" size="sm" hideClose={phase === "sending"}
      footer={
        phase === "done" ? (
          <button type="button" className="btn btn-primary w-100" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>
        ) : (
          <button type="button" className="btn btn-outline-secondary w-100" disabled={phase === "sending"} onClick={onClose}>Cancel</button>
        )
      }
    >
      <div className="text-center py-3">
        {phase === "idle" && (
          <>
            <i className="bi bi-send" style={{ fontSize: "2.2rem", color: "var(--pm-green-dark)" }} />
            <p className="pm-prod-meta mt-2 mb-3">Send a <span className="pm-mono">ping.test</span> event to this endpoint and watch the response.</p>
            <button type="button" className="btn btn-primary" onClick={send}><i className="bi bi-lightning-charge me-1" /> Send test event</button>
          </>
        )}
        {phase === "sending" && (
          <>
            <div className="pm-stk-ring mx-auto mb-2"><i className="pm-spin bi bi-arrow-repeat" style={{ fontSize: "1.4rem", color: "var(--pm-green)" }} /></div>
            <p className="pm-prod-meta mb-0">POST → {w.url.split("/")[2]} · awaiting response…</p>
          </>
        )}
        {phase === "done" && (
          <>
            <i className="bi bi-check-circle-fill" style={{ fontSize: "2.6rem", color: "var(--pm-green)" }} />
            <h6 className="mt-2">200 OK · 38ms</h6>
            <p className="pm-prod-meta mb-1">Payload delivered and verified {w.secret ? "with HMAC signature ✓" : ""}</p>
            <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={() => { onClose(); openModal("webhookDetail", { id: w.id }); }}>
              View delivery log →
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ==================================================================
   MARKETPLACE BROWSE MODAL
================================================================== */
export function MarketplaceModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal } = useStore();
  const [cat, setCat] = useState("All");
  const cats = ["All", "Kenya Rails", "Accounting", "Payments", "Commerce", "Logistics", "Marketing", "Productivity", "Automation", "Developer"];
  const list = cat === "All" ? APPS : APPS.filter((a) => a.category === cat);
  return (
    <Modal open onClose={onClose} title="App marketplace" subtitle={`${APPS.filter((a) => !a.installed).length} apps ready to connect — data stays yours`} icon="bi-grid" size="xl" hideClose
      footer={<button type="button" className="btn btn-primary" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>}
    >
      <div className="d-flex gap-1 flex-wrap mb-3">
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
                <button type="button" className="btn btn-sm btn-outline-secondary w-100 mt-2" onClick={() => { onClose(); openModal("appDrawer", { id: a.id === "meta" ? "c3" : "c1" }); }}>
                  <i className="bi bi-check2-circle me-1 text-primary" /> Connected
                </button>
              ) : (
                <button type="button" className="btn btn-sm btn-primary w-100 mt-2" onClick={() => { onClose(); openModal("installWizard", { appId: a.id }); }}>
                  <i className="bi bi-plug me-1" /> Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ==================================================================
   HEALTH OVERVIEW — filtered to errors per outline "Check Health"
================================================================== */
export function HealthModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { connections, errors, openModal, syncAllHealthy, toast } = useStore();
  const [onlyErrors, setOnlyErrors] = useState(false);
  const shown = onlyErrors ? connections.filter((c) => c.status !== "Healthy") : connections;
  const healthy = connections.filter((c) => c.status === "Healthy").length;
  return (
    <Modal open onClose={onClose} title="Integration health" subtitle={`${healthy}/${connections.length} healthy · avg uptime 99.4%`} icon="bi-heart-pulse" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { const n = syncAllHealthy(); toast(`Synced ${n} healthy connections.`, "success", "Sync kicked off"); onClose(); }}>
            <i className="bi bi-arrow-repeat me-1" /> Sync all healthy
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
        </>
      }
    >
      <div className="d-flex align-items-center gap-2 mb-3">
        <Chip on={!onlyErrors} onClick={() => setOnlyErrors(false)}>All connections</Chip>
        <Chip on={onlyErrors} onClick={() => setOnlyErrors(true)}>Errors only ({connections.filter((c) => c.status !== "Healthy").length})</Chip>
      </div>
      {shown.map((c) => (
        <div key={c.id} className="d-flex align-items-center gap-2 p-2 mb-2" style={{ border: "1px solid " + (c.status === "Healthy" ? "var(--pm-border)" : "#f6b7b0"), borderRadius: 12, background: c.status === "Healthy" ? "#fff" : "#fef6f5" }}>
          <span className={`pm-dot-live`} style={{ background: c.status === "Healthy" ? "var(--pm-green)" : "var(--pm-danger)" }} />
          <span style={{ width: 32, height: 32, borderRadius: 8, background: c.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: "0.62rem" }}>{c.initials}</span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="fw-semibold text-truncate" style={{ fontSize: "0.8rem" }}>{c.name}</div>
            <div className="pm-prod-meta">{c.status === "Healthy" ? `last sync ${c.lastSync}` : "sync interrupted — see error log"}</div>
          </div>
          <Badge tone={c.status === "Healthy" ? "green" : c.status === "Reconnect needed" ? "amber" : "red"}>{c.status}</Badge>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { onClose(); openModal(c.status === "Healthy" ? "appDrawer" : "errorDetail", { id: c.status === "Healthy" ? c.id : errors.find((e) => e.app === c.name)?.id ?? "e1" }); }}>
            {c.status === "Healthy" ? "View" : "Fix"} →
          </button>
        </div>
      ))}
    </Modal>
  );
}

/* ==================================================================
   AUTOMATION BUILDER — 3 steps
================================================================== */
export function AutomationWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { createAutomation, toast } = useStore();
  const [step, setStep] = useState(0);
  const [trigger, setTrigger] = useState("Invoice paid");
  const [action, setAction] = useState("Send WhatsApp to customer");
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const triggers = ["Invoice paid", "Order shipped", "Order delivered", "Low stock alert", "New customer", "Refund issued", "Review received", "Payment failed"];
  const actions = ["Send WhatsApp to customer", "Create QuickBooks journal", "Dispatch via Sendy", "Post to Slack", "Update Google Sheet", "Send email template"];
  return (
    <Modal open onClose={onClose} title="Automation builder" subtitle="3 steps · if this happens, do that — no code" icon="bi-lightning-charge" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Next <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              createAutomation(name.trim() || `${trigger} → ${action}`, trigger, action);
              toast(`Automation live — will run ${enabled ? "automatically" : "after you enable it"} from the next event.`, "success", "Automation created");
              onClose();
            }}>
              <i className="bi bi-check2-circle me-1" /> Create automation
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Trigger", icon: "bi-broadcast" }, { label: "Action", icon: "bi-lightning-charge" }, { label: "Review", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {triggers.map((t) => (
              <button key={t} type="button" className={`pm-theme-card text-start p-2 ${trigger === t ? "sel" : ""}`} onClick={() => setTrigger(t)}>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-arrow-right-circle" style={{ color: "var(--pm-green-dark)" }} />
                  <b style={{ fontSize: "0.84rem" }}>When: {t}</b>
                  {trigger === t && <i className="bi bi-check-circle-fill text-primary ms-auto" />}
                </div>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="d-flex flex-column gap-2">
            {actions.map((a) => (
              <button key={a} type="button" className={`pm-theme-card text-start p-2 ${action === a ? "sel" : ""}`} onClick={() => setAction(a)}>
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${a.includes("WhatsApp") ? "bi-whatsapp" : a.includes("QuickBooks") ? "bi-calculator" : a.includes("Sendy") ? "bi-truck" : a.includes("Slack") ? "bi-slack" : a.includes("Sheet") ? "bi-file-earmark-spreadsheet" : "bi-envelope"}`} style={{ color: "var(--pm-green-dark)" }} />
                  <b style={{ fontSize: "0.84rem" }}>Then: {a}</b>
                  {action === a && <i className="bi bi-check-circle-fill text-primary ms-auto" />}
                </div>
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Automation name" className="col-md-8">
              <input className="form-control" placeholder={`${trigger} → ${action}`} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="autoOn" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                <label className="form-check-label" htmlFor="autoOn"><b style={{ fontSize: "0.84rem" }}>Active immediately</b><div className="pm-prod-meta">Runs on every matching event — paused automations cost nothing.</div></label>
              </div>
            </div>
            <div className="col-12">
              <div className="pm-note"><i className="bi bi-check2-circle me-1 text-primary" />Preview: <b>{trigger}</b> → <b>{action}</b></div>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   EXPORT DATA
================================================================== */
export function ExportDataModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const [range, setRange] = useState("This month (Jan 2026)");
  const [format, setFormat] = useState("CSV");
  const [include, setInclude] = useState({ transactions: true, invoices: true, customers: true, products: false, syncLog: true });
  const [building, setBuilding] = useState(false);
  return (
    <Modal open onClose={onClose} title="Export data" subtitle="Quick CSV/PDF for your accountant or your own tools" icon="bi-download"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={building} onClick={() => {
            setBuilding(true);
            window.setTimeout(() => {
              setBuilding(false);
              recordActivity(`Data export (${format}, ${range})`, "bi-download");
              toast(`${format} export (${range}) downloaded — includes what you selected.`, "success", "Export complete");
              onClose();
            }, 1300);
          }}>
            {building ? <><span className="pm-spin me-1">◌</span> Building…</> : <><i className="bi bi-download me-1" /> Export {format}</>}
          </button>
        </>
      }
    >
      <Field label="Period" className="mb-3">
        <select className="form-select" value={range} onChange={(e) => setRange(e.target.value)}>
          <option>This month (Jan 2026)</option><option>Last month</option><option>This quarter</option><option>Year to date</option><option>Custom range</option>
        </select>
      </Field>
      <div className="d-flex gap-2 mb-3">
        {["CSV", "PDF", "Excel"].map((f) => (
          <button key={f} type="button" className={`pm-chip ${format === f ? "on" : ""}`} onClick={() => setFormat(f)}>{f}</button>
        ))}
      </div>
      {[
        { k: "transactions" as const, t: "Transactions (ledger)" },
        { k: "invoices" as const, t: "Invoices" },
        { k: "customers" as const, t: "Customer directory" },
        { k: "products" as const, t: "Product catalog" },
        { k: "syncLog" as const, t: "Integration sync log" },
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

/* ==================================================================
   API DOCS MODAL
================================================================== */
export function ApiDocsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal, toast } = useStore();
  const [lang, setLang] = useState<"curl" | "js">("curl");
  const curl = `curl https://api.paymo.co.ke/v1/invoices \\
  -H "Authorization: Bearer pk_live_..." \\
  -H "Content-Type: application/json"`;
  const js = `const res = await fetch("https://api.paymo.co.ke/v1/invoices", {
  headers: { Authorization: "Bearer pk_live_..." }
});
const { data } = await res.json();`;
  return (
    <Modal open onClose={onClose} title="API documentation" subtitle="PayMo API v1 · base: https://api.paymo.co.ke/v1" icon="bi-code-slash" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { onClose(); openModal("apiKeyWizard"); }}>
            <i className="bi bi-key me-1" /> Create API key
          </button>
          <button type="button" className="btn btn-primary" onClick={() => toast("Postman collection (v1.4.2) downloaded.", "info", "Collection")}>
            <i className="bi bi-rocket-takeoff me-1" /> Postman collection
          </button>
        </>
      }
    >
      <div className="d-flex gap-2 mb-2">
        <Chip on={lang === "curl"} onClick={() => setLang("curl")}>cURL</Chip>
        <Chip on={lang === "js"} onClick={() => setLang("js")}>JavaScript</Chip>
      </div>
      <div className="pm-card mb-3" style={{ boxShadow: "none", background: "#0b1322", color: "#c3cdda" }}>
        <div className="pm-mono" style={{ fontSize: "0.72rem", whiteSpace: "pre-wrap" }}>{lang === "curl" ? curl : js}</div>
      </div>
      <div className="pm-kpi-label mb-1">Quick reference</div>
      {[
        { m: "GET", p: "/invoices", d: "List invoices (paginated)" },
        { m: "POST", p: "/invoices", d: "Create an invoice" },
        { m: "GET", p: "/customers/{id}", d: "Fetch a customer" },
        { m: "POST", p: "/payments/stk", d: "Initiate M-Pesa STK push" },
        { m: "GET", p: "/inventory/{sku}", d: "Stock level for a SKU" },
      ].map((r) => (
        <div key={r.p} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)" }}>
          <Badge tone={r.m === "GET" ? "green" : "blue"}>{r.m}</Badge>
          <span className="pm-mono fw-semibold" style={{ fontSize: "0.78rem" }}>{r.p}</span>
          <span className="pm-prod-meta ms-auto">{r.d}</span>
        </div>
      ))}
      <div className="pm-note soft mt-3"><i className="bi bi-shield-check me-1" />Rate limit: 100 req/min · burstable to 500 · sandbox at api-sandbox.paymo.co.ke</div>
    </Modal>
  );
}

/* ==================================================================
   SANDBOX MODAL
================================================================== */
export function SandboxModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal, toast } = useStore();
  return (
    <Modal open onClose={onClose} title="API sandbox" subtitle="Test with fake data before touching live" icon="bi-boxes"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => { toast("Sandbox reset — fresh seed data ready.", "info", "Sandbox reset"); onClose(); }}>
            <i className="bi bi-arrow-counterclockwise me-1" /> Reset sandbox
          </button>
        </>
      }
    >
      <div className="pm-note mb-3"><i className="bi bi-info-circle me-1" />Sandbox: <span className="pm-mono">https://api-sandbox.paymo.co.ke/v1</span> — fake M-Pesa, fake eTIMS, no real money.</div>
      <div className="row g-3">
        <div className="col-md-6">
          <div className="pm-card h-100" style={{ boxShadow: "none", background: "#fafbfd" }}>
            <b style={{ fontSize: "0.84rem" }}>Seeded data</b>
            <div className="pm-prod-meta mt-1">2 businesses · 24 customers · 60 invoices · 14 products · 1,000 M-Pesa stubs</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="pm-card h-100" style={{ boxShadow: "none", background: "#fafbfd" }}>
            <b style={{ fontSize: "0.84rem" }}>Test rails</b>
            <div className="pm-prod-meta mt-1">Fake STK push (auto-confirm) · mock eTIMS gateway · webhook echo endpoint</div>
          </div>
        </div>
      </div>
      <button type="button" className="btn btn-outline-primary btn-sm w-100 mt-3" onClick={() => { onClose(); openModal("apiKeyWizard"); }}>
        <i className="bi bi-key me-1" /> Generate test key
      </button>
    </Modal>
  );
}

/* ==================================================================
   USAGE & LIMITS MODAL
================================================================== */
export function UsageModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal } = useStore();
  const pct = Math.round((API_USAGE.requests30d / API_USAGE.limit) * 100);
  return (
    <Modal open onClose={onClose} title="API usage & limits" subtitle="Billing cycle resets in 12 days" icon="bi-graph-up-arrow"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>}
    >
      <div className="pm-kpi-label mb-1">Requests this month</div>
      <div className="progress mb-1" style={{ height: 10 }}>
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <div className="pm-prod-meta mb-3">{API_USAGE.requests30d.toLocaleString()} of {API_USAGE.limit.toLocaleString()} ({pct}%) · {API_USAGE.rateLimit} sustained</div>
      <div className="row g-3">
        <div className="col-4"><div className="pm-card text-center py-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Syncs run</div><b>{API_USAGE.syncCount.toLocaleString()}</b></div></div>
        <div className="col-4"><div className="pm-card text-center py-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Webhook deliveries</div><b>{API_USAGE.webhookDeliveries.toLocaleString()}</b></div></div>
        <div className="col-4"><div className="pm-card text-center py-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Burst limit</div><b>{API_USAGE.burst}</b></div></div>
      </div>
      <button type="button" className="btn btn-outline-primary btn-sm w-100 mt-3" onClick={() => { onClose(); openModal("exportData"); }}>
        <i className="bi bi-download me-1" /> Export usage report
      </button>
    </Modal>
  );
}

/* ==================================================================
   SOCIAL INBOX (unified feed, per outline)
================================================================== */
export function SocialInboxModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity, openModal } = useStore();
  const [reply, setReply] = useState("");
  return (
    <Modal open onClose={onClose} title="Unified social inbox" subtitle="Messages from Meta WhatsApp, Instagram & Facebook — one reply box" icon="bi-chat-dots" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" disabled={!reply.trim()} onClick={() => {
            recordActivity("Reply sent from unified inbox", "bi-chat-dots");
            toast("Reply delivered via the connected Meta channel.", "success", "Sent");
            setReply("");
          }}>
            <i className="bi bi-send me-1" /> Send reply
          </button>
        </>
      }
    >
      <div className="pm-note mb-3" style={{ borderColor: "#f6b7b0", background: "#fef6f5" }}>
        <i className="bi bi-exclamation-triangle me-1" style={{ color: "var(--pm-danger)" }} />
        Meta connection expired — messages shown from last sync. <button type="button" className="btn btn-link btn-sm p-0 text-primary" onClick={() => { onClose(); openModal("reconnect", { id: "c3" }); }}>Reconnect now</button> to resume live replies.
      </div>
      {SOCIAL_INBOX_SAMPLE.map((m, i) => (
        <div key={i} className="d-flex align-items-start gap-2 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 12 }}>
          <i className={`bi ${m.channel === "WhatsApp" ? "bi-whatsapp text-success" : m.channel === "Instagram" ? "bi-instagram" : "bi-facebook text-primary"}`} style={{ marginTop: 2 }} />
          <div className="flex-grow-1">
            <b style={{ fontSize: "0.8rem" }}>{m.from} <span className="pm-prod-meta">· {m.channel}</span></b>
            <div className="pm-prod-meta">{m.text}</div>
          </div>
          {i === 0 && <span className="pm-dot-live" />}
        </div>
      ))}
      <div className="input-group mt-2">
        <input className="form-control" placeholder="Type a reply to the selected conversation…" value={reply} onChange={(e) => setReply(e.target.value)} />
      </div>
    </Modal>
  );
}

/* ==================================================================
   HELP MODAL
================================================================== */
export function HelpModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal, toast } = useStore();
  return (
    <Modal open onClose={onClose} title="Help & shortcuts" subtitle="Apps & Integrations — every flow on this page" icon="bi-question-circle" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { toast("Guided tour started — follow the highlights. (Demo)", "info", "Guided tour"); onClose(); }}>
            <i className="bi bi-compass me-1" /> Start guided tour
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Got it</button>
        </>
      }
    >
      <div className="row g-3">
        {[
          { icon: "bi-plug", t: "Connect App (4 steps)", d: "Browse the marketplace → grant scopes → configure frequency → OAuth connect.", act: () => openModal("installWizard", { appId: "xero" }) },
          { icon: "bi-diagram-3", t: "Sync Mapping (3 steps)", d: "Pick an entity, map fields PayMo ↔ app, save & run a sync.", act: () => openModal("mappingWizard") },
          { icon: "bi-hdd-network", t: "Webhook Builder (3 steps)", d: "Events → HTTPS endpoint → signed deliveries with test ping.", act: () => openModal("webhookWizard") },
          { icon: "bi-key", t: "API Key Wizard (3 steps)", d: "Scopes → IP restrictions → copy once and keep it safe.", act: () => openModal("apiKeyWizard") },
          { icon: "bi-lightning-charge", t: "Automation Builder (3 steps)", d: "If-this-then-that across your stack — no code.", act: () => openModal("automationWizard") },
          { icon: "bi-code-slash", t: "API Docs & Sandbox", d: "cURL/JS snippets, Postman collection and a safe test environment.", act: () => openModal("apiDocs") },
        ].map((h, i) => (
          <div className="col-md-6" key={i}>
            <div className="pm-help-item">
              <i className={`bi ${h.icon}`} />
              <div>
                <b style={{ fontSize: "0.84rem" }}>{h.t}</b>
                <div className="pm-prod-meta">{h.d}</div>
                <button type="button" className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: "0.74rem" }} onClick={() => h.act()}>Open →</button>
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

/* ==================================================================
   ACTIVITY DRAWER
================================================================== */
export function ActivityDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { activity, toast } = useStore();
  const [filter, setFilter] = useState("All");
  const kinds = ["All", "Syncs", "Webhooks", "API keys", "Apps", "Errors"];
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" title="Activity log" subtitle="Every integration event — audit-ready">
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
      <button type="button" className="btn btn-outline-secondary w-100 mt-3" onClick={() => toast("Full integration audit trail queued for export.", "info", "Audit trail")}>
        <i className="bi bi-download me-1" /> Export full audit trail
      </button>
    </Drawer>
  );
}
