import { useState } from "react";
import { APPS } from "./data";
import { useStore } from "./store";
import { Badge, Chip, Field, Modal, WizardShell } from "./ui";

/* ==================================================================
   APP INSTALL WIZARD — 4 steps
   App & plan → Permissions → Configure → Connect & test
================================================================== */
export function InstallWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { installApp, toast, recordActivity } = useStore();
  const pre = String(payload.appId ?? "");
  const available = APPS.filter((a) => !a.installed);
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState(pre || available[0]?.id || "");
  const [plan, setPlan] = useState("Free plan");
  const [scopes, setScopes] = useState<Set<string>>(new Set(["Read-only data"]));
  const [syncDir, setSyncDir] = useState("Two-way");
  const [freq, setFreq] = useState("Every 15 min");
  const [region, setRegion] = useState("Kenya (Nairobi)");
  const [notify, setNotify] = useState(true);
  const app = APPS.find((a) => a.id === appId);
  if (!app) return null;

  const scopeOptions = ["Read-only data", "Write / push data", "Webhooks & events", "Customer data", "Financial records"];
  const dirOptions = ["Two-way", "Inbound only", "Outbound only"];
  const freqOptions = ["Real-time", "Every 15 min", "Hourly", "Daily 06:00", "Manual only"];

  return (
    <Modal open onClose={onClose} title={`Connect ${app.name}`} subtitle="4 steps · connect, map data, go live — no code" icon={app.icon} size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={step === 2 && scopes.size === 0} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              installApp(app.id);
              recordActivity(`OAuth connected — ${app.name} authorizing`, "bi-shield-check");
              toast(`${app.name} connected! Initial sync is running — you'll see data flow in ~1 minute.`, "success", "App connected");
              onClose();
            }}>
              <i className="bi bi-plug me-1" /> Connect &amp; sync
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "App & plan", icon: "bi-grid" }, { label: "Permissions", icon: "bi-shield-lock" }, { label: "Configure", icon: "bi-sliders" }, { label: "Connect", icon: "bi-plug" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <Field label="App" className="col-md-8">
              <select className="form-select" value={appId} onChange={(e) => setAppId(e.target.value)}>
                {available.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.category}</option>)}
              </select>
            </Field>
            <Field label="Plan" className="col-md-4">
              <select className="form-select" value={plan} onChange={(e) => setPlan(e.target.value)}>
                <option>{app.free ? "Free plan" : "Free trial (14 days)"}</option>
                <option>Standard</option>
                <option>Premium</option>
              </select>
            </Field>
            <div className="col-12">
              <div className="pm-note">
                <i className="bi bi-info-circle me-1" />{app.desc} · ★ {app.rating} · {app.users} businesses use this.
                {!app.free && <> Billing stays with {app.name} — PayMo never marks up.</>}
              </div>
            </div>
            <div className="col-12">
              <div className="pm-kpi-label mb-1">What it does</div>
              {app.features.map((f) => (
                <div key={f} className="d-flex align-items-center gap-2 py-1"><i className="bi bi-check-circle-fill text-primary" /><span style={{ fontSize: "0.82rem" }}>{f}</span></div>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <div className="col-12">
              <div className="pm-note soft"><i className="bi bi-shield-lock me-1" />You control exactly what {app.name} can see and touch. Change any time.</div>
            </div>
            <div className="col-12">
              <label className="form-label">Data scopes</label>
              {scopeOptions.map((s) => (
                <div key={s} className="d-flex align-items-center gap-2 py-1">
                  <div className="form-check mb-0">
                    <input className="form-check-input" type="checkbox" checked={scopes.has(s)} onChange={() => setScopes((x) => { const n = new Set(x); if (n.has(s)) n.delete(s); else n.add(s); return n; })} />
                  </div>
                  <span style={{ fontSize: "0.84rem" }}>{s}</span>
                  {s === "Financial records" && <Badge tone="amber">sensitive</Badge>}
                </div>
              ))}
            </div>
            <div className="col-12">
              <div className="pm-note soft"><i className="bi bi-info-circle me-1" />"Financial records" includes ledger &amp; bank data — only grant it to accounting apps you trust.</div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Sync direction" className="col-md-4">
              <div className="d-flex flex-column gap-1">
                {dirOptions.map((d) => <Chip key={d} on={syncDir === d} onClick={() => setSyncDir(d)}>{d}</Chip>)}
              </div>
            </Field>
            <Field label="Frequency" className="col-md-4">
              <select className="form-select" value={freq} onChange={(e) => setFreq(e.target.value)}>
                {freqOptions.map((f) => <option key={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Data region" className="col-md-4">
              <select className="form-select" value={region} onChange={(e) => setRegion(e.target.value)}>
                <option>Kenya (Nairobi)</option><option>Kenya (Mombasa)</option><option>EU (Frankfurt)</option><option>US (Virginia)</option>
              </select>
            </Field>
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="instNotify" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
                <label className="form-check-label" htmlFor="instNotify"><b style={{ fontSize: "0.84rem" }}>Notify me on sync failures</b><div className="pm-prod-meta">WhatsApp + in-app ping the moment a sync fails.</div></label>
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="text-center py-3">
            <div className="d-inline-flex flex-column align-items-center gap-2 mb-3">
              <span className="pm-kpi-icon" style={{ width: 64, height: 64, fontSize: "1.6rem", background: app.color + "22", color: app.color }}>
                <i className={`bi ${app.icon}`} />
              </span>
              <b>{app.name}</b>
            </div>
            <div className="pm-note text-start mb-2">
              You'll be redirected to <b>{app.name}'s</b> secure login (OAuth 2.0). PayMo never sees your {app.name} password. After you approve, we exchange tokens and start the initial sync.
            </div>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <Badge tone="blue">{scopes.size} scopes</Badge>
              <Badge tone="violet">{syncDir}</Badge>
              <Badge tone="slate">{freq}</Badge>
              <Badge tone="green">{region}</Badge>
            </div>
            <div className="pm-prod-meta mt-2"><i className="bi bi-shield-check me-1 text-primary" />Tokens stored encrypted · re-auth guided automatically on expiry.</div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   SYNC MAPPING WIZARD — 3 steps: Entity → Fields → Review
================================================================== */
export function MappingWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { connections, saveMapping, openModal } = useStore();
  const connId = String(payload.connId ?? connections.find((c) => c.status === "Healthy")?.id);
  const conn = connections.find((c) => c.id === connId);
  const [step, setStep] = useState(0);
  const [entity, setEntity] = useState("Invoices");
  const [fields, setFields] = useState([
    { id: 1, source: "PayMo invoice total", target: "Invoice total", mode: "Map" },
    { id: 2, source: "PayMo customer name", target: "Customer name", mode: "Map" },
    { id: 3, source: "PayMo VAT amount", target: "Tax line (VAT 16%)", mode: "Map" },
    { id: 4, source: "PayMo internal memo", target: "—", mode: "Skip" },
  ]);
  if (!conn) return null;
  return (
    <Modal open onClose={onClose} title="Data sync mapping" subtitle={`${conn.name} · map PayMo fields to ${conn.name} fields`} icon="bi-diagram-3" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Next <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              saveMapping(conn.id, fields.map((f) => ({ id: String(f.id), source: f.source, target: f.target, mode: f.mode })));
              onClose();
              openModal("syncNow");
            }}>
              <i className="bi bi-check2-circle me-1" /> Save & run sync
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Entity", icon: "bi-box" }, { label: "Field mapping", icon: "bi-arrow-left-right" }, { label: "Review", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            <div className="d-flex flex-column gap-2">
              {["Invoices", "Customers", "Products & stock", "Payments & ledger", "Purchase orders"].map((e) => (
                <button key={e} type="button" className={`pm-theme-card text-start p-2 ${entity === e ? "sel" : ""}`} onClick={() => setEntity(e)}>
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${e === "Invoices" ? "bi-receipt" : e === "Customers" ? "bi-people" : e === "Products & stock" ? "bi-box-seam" : e === "Payments & ledger" ? "bi-bank" : "bi-cart-check"}`} style={{ color: "var(--pm-green-dark)" }} />
                    <b style={{ fontSize: "0.86rem" }}>{e}</b>
                    {entity === e && <i className="bi bi-check-circle-fill text-primary ms-auto" />}
                  </div>
                  <div className="pm-prod-meta mt-1">
                    {e === "Invoices" ? "12 fields · 1,240 records synced" : e === "Customers" ? "9 fields · 4,820 records synced" : e === "Products & stock" ? "11 fields · 14 SKUs" : e === "Payments & ledger" ? "16 fields · 48,250 records" : "7 fields · 86 records"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="pm-kpi-label mb-2">Mapping rules for {entity}</div>
            {fields.map((f) => (
              <div key={f.id} className="d-flex align-items-center gap-2 mb-2">
                <span className="pm-prod-meta" style={{ width: 190, fontSize: "0.76rem" }}>{f.source}</span>
                <i className="bi bi-arrow-right text-primary" />
                <select className="form-select" style={{ maxWidth: 220 }} value={f.target} onChange={(e) => setFields((fs) => fs.map((x) => (x.id === f.id ? { ...x, target: e.target.value } : x)))}>
                  <option>Invoice total</option><option>Customer name</option><option>Tax line (VAT 16%)</option><option>Payment reference</option><option>Due date</option><option>—</option>
                </select>
                <select className="form-select" style={{ maxWidth: 110 }} value={f.mode} onChange={(e) => setFields((fs) => fs.map((x) => (x.id === f.id ? { ...x, mode: e.target.value } : x)))}>
                  <option>Map</option><option>Transform</option><option>Skip</option>
                </select>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setFields((fs) => [...fs, { id: Date.now(), source: "New PayMo field", target: "—", mode: "Map" }])}>
              <i className="bi bi-plus-lg me-1" /> Add field
            </button>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3">
              <i className="bi bi-check2-circle me-1 text-primary" />
              {fields.filter((f) => f.mode !== "Skip").length} fields mapped · {fields.filter((f) => f.mode === "Skip").length} skipped · applies from the next sync.
            </div>
            {fields.map((f) => (
              <div key={f.id} className="d-flex align-items-center gap-2 py-1" style={{ borderBottom: "1px solid var(--pm-border)", fontSize: "0.8rem" }}>
                <span className="flex-grow-1 pm-prod-meta">{f.source}</span>
                <i className="bi bi-arrow-right text-primary" />
                <span className="fw-semibold">{f.mode === "Skip" ? "not synced" : f.target}</span>
                <Badge tone={f.mode === "Skip" ? "slate" : f.mode === "Transform" ? "violet" : "green"}>{f.mode}</Badge>
              </div>
            ))}
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   WEBHOOK SETUP WIZARD — 3 steps: Events → Endpoint → Test & activate
================================================================== */
export function WebhookWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { createWebhook, toast } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("https://api.mycompany.co.ke/webhooks/paymo");
  void toast;
  const [events, setEvents] = useState<Set<string>>(new Set(["order.paid"]));
  const [secret, setSecret] = useState(true);
  const [includeTest, setIncludeTest] = useState(true);
  const eventOptions = ["order.created", "order.paid", "order.shipped", "inventory.low", "invoice.paid", "customer.created", "refund.issued"];

  return (
    <Modal open onClose={onClose} title="Create outgoing webhook" subtitle="3 steps · receive PayMo events on your own server" icon="bi-hdd-network" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={(step === 0 && (!name.trim() || events.size === 0)) || (step === 1 && !url.startsWith("https://"))} onClick={() => setStep((s) => s + 1)}>
              Next <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              createWebhook(name.trim(), url.trim(), [...events], secret);
              onClose();
            }}>
              <i className="bi bi-hdd-network me-1" /> Create &amp; activate
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Events", icon: "bi-broadcast" }, { label: "Endpoint", icon: "bi-globe2" }, { label: "Test & activate", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <Field label="Webhook name *" className="col-md-6">
              <input className="form-control" placeholder="e.g. Store orders → ERP" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <div className="col-12">
              <label className="form-label">Events to send *</label>
              <div className="d-flex flex-wrap gap-1">
                {eventOptions.map((e) => (
                  <Chip key={e} on={events.has(e)} onClick={() => setEvents((s) => { const n = new Set(s); if (n.has(e)) n.delete(e); else n.add(e); return n; })}>
                    <span className="pm-mono" style={{ fontSize: "0.7rem" }}>{e}</span>
                  </Chip>
                ))}
              </div>
            </div>
            <div className="col-12"><div className="pm-note soft"><i className="bi bi-info-circle me-1" />{"{ "}Webhooks are idempotent — each delivery carries a signature (HMAC-SHA256) you can verify.</div></div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Endpoint URL *" className="col-12" hint="Must be HTTPS. POSTed as JSON within 5s of the event.">
              <input className="form-control pm-mono" value={url} onChange={(e) => setUrl(e.target.value)} />
            </Field>
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="whSecret" checked={secret} onChange={(e) => setSecret(e.target.checked)} />
                <label className="form-check-label" htmlFor="whSecret"><b style={{ fontSize: "0.84rem" }}>Sign with shared secret</b><div className="pm-prod-meta">Adds X-PayMo-Signature header — verify deliveries are genuinely from PayMo.</div></label>
              </div>
            </div>
            <div className="col-12">
              <div className="pm-note soft"><i className="bi bi-lightbulb me-1" />No server yet? Generate a <b>Zapier catch webhook</b> in 30 seconds instead — no code required.</div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="text-center py-3">
            <div className="pm-note text-start mb-3">
              <i className="bi bi-check2-circle me-1 text-primary" />Endpoint validated — HTTPS ✓ · responds 200 ✓ · signature will be included.
            </div>
            <div className="d-flex justify-content-center gap-2 flex-wrap mb-3">
              <Badge tone="blue">{events.size} events</Badge>
              <Badge tone="violet">{url.split("/")[2]}</Badge>
              {secret && <Badge tone="green">HMAC signed</Badge>}
            </div>
            <div className="form-check d-inline-block">
              <input className="form-check-input" type="checkbox" id="sendTest" checked={includeTest} onChange={(e) => setIncludeTest(e.target.checked)} />
              <label className="form-check-label pm-prod-meta" htmlFor="sendTest">Send a test ping on activation</label>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   API KEY WIZARD — 3 steps: Scopes → Details → Review & copy
================================================================== */
export function ApiKeyWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { createApiKey } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [env, setEnv] = useState<"live" | "test">("live");
  const [scopes, setScopes] = useState<Set<string>>(new Set(["read"]));
  const [ipRestrict, setIpRestrict] = useState(false);
  const [ips, setIps] = useState("41.80.0.0/16");
  const [copied, setCopied] = useState(false);
  const createdKey = `pk_${env === "live" ? "live" : "test"}_${Math.random().toString(16).slice(2, 14)}${Math.random().toString(16).slice(2, 10)}`;

  return (
    <Modal open onClose={onClose} title="Create API key" subtitle="3 steps · scoped, revocable access to the PayMo API" icon="bi-key" size="lg" hideClose={step === 2}
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && step < 2 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={(step === 0 && scopes.size === 0) || (step === 1 && !name.trim())} onClick={() => setStep((s) => s + 1)}>
              Next <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Scopes", icon: "bi-shield-lock" }, { label: "Details", icon: "bi-sliders" }, { label: "Review & copy", icon: "bi-key" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Environment</label>
              <div className="d-flex gap-2">
                <Chip on={env === "live"} onClick={() => setEnv("live")}><i className="bi bi-broadcast me-1" /> Live</Chip>
                <Chip on={env === "test"} onClick={() => setEnv("test")}><i className="bi bi-boxes me-1" /> Test / sandbox</Chip>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label">Permissions</label>
              <div className="d-flex flex-column gap-1">
                {[
                  { id: "read", t: "read — fetch records", d: "Invoices, customers, orders, balances" },
                  { id: "write", t: "write — create & update", d: "Create invoices, update stock, post payments" },
                  { id: "webhooks", t: "webhooks — manage endpoints", d: "Create, test and pause webhooks" },
                  { id: "admin", t: "admin — full control", d: "Everything including team & settings" },
                ].map((s) => (
                  <div key={s.id} className="d-flex align-items-center gap-2 p-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                    <div className="form-check mb-0">
                      <input className="form-check-input" type="checkbox" checked={scopes.has(s.id)} onChange={() => setScopes((x) => { const n = new Set(x); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; })} />
                    </div>
                    <div className="flex-grow-1">
                      <b className="pm-mono" style={{ fontSize: "0.8rem" }}>{s.t}</b>
                      <div className="pm-prod-meta">{s.d}</div>
                    </div>
                    {s.id === "admin" && <Badge tone="red">powerful</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Key name *" className="col-md-8" hint="Shown in logs and audits — name it by use case.">
              <input className="form-control" placeholder="e.g. POS terminal integration" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="ipRes" checked={ipRestrict} onChange={(e) => setIpRestrict(e.target.checked)} />
                <label className="form-check-label" htmlFor="ipRes"><b style={{ fontSize: "0.84rem" }}>Restrict to IP addresses</b><div className="pm-prod-meta">Only requests from these IPs work — best practice for server keys.</div></label>
              </div>
            </div>
            {ipRestrict && (
              <Field label="Allowed CIDRs" className="col-md-6">
                <input className="form-control pm-mono" value={ips} onChange={(e) => setIps(e.target.value)} />
              </Field>
            )}
            <div className="col-12"><div className="pm-note soft"><i className="bi bi-shield-lock me-1" />Live keys + write scope = treat like a password. Rotate quarterly.</div></div>
          </div>
        )}
        {step === 2 && (
          <div className="text-center py-2">
            <div className="pm-note text-start mb-3">
              <i className="bi bi-check2-circle me-1 text-primary" />Key created — copy it now, it won't be shown again.
            </div>
            <div className="d-flex align-items-center gap-2 justify-content-center mb-3">
              <span className="pm-mono fw-bold" style={{ background: "#0b1322", color: "#7ee2b0", borderRadius: 10, padding: "0.6rem 1rem", fontSize: "0.82rem" }}>
                {createdKey}
              </span>
              <button type="button" className="btn btn-outline-primary" onClick={() => {
                try { void navigator.clipboard?.writeText(createdKey); } catch { /* demo */ }
                setCopied(true);
                createApiKey(name, [...scopes]);
              }}>
                <i className={`bi ${copied ? "bi-check2" : "bi-clipboard"}`} /> {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <Badge tone={env === "live" ? "red" : "blue"}>{env === "live" ? "Live" : "Test"}</Badge>
              {[...scopes].map((s) => <Badge key={s} tone="slate">{s}</Badge>)}
              {ipRestrict && <Badge tone="violet">IP locked</Badge>}
            </div>
            <div className="pm-prod-meta mt-2">Stored as a hash — we can't show it again. Use the key in the <span className="pm-mono">Authorization: Bearer</span> header.</div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}
