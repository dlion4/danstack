import { useMemo, useState } from "react";
import { CHANNEL_STATS, fmtKES } from "./data";
import { useStore } from "./store";
import { Badge, EmptyState, Kpi, Section, StatusBadge } from "./ui";

/* ==================================================================
   PAGE HEADER
================================================================== */
export function PageHeader() {
  const { openModal, notifs, rules } = useStore();
  const unread = notifs.filter((n) => n.unread).length;
  const urgent = notifs.filter((n) => n.unread && n.priority === "Urgent").length;
  return (
    <div className="pm-banner-hero p-4 d-flex flex-wrap align-items-center gap-3">
      <div className="flex-grow-1" style={{ minWidth: 280 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <span className="pm-zone" style={{ background: "linear-gradient(90deg, #475467, #101828)" }}><i className="bi bi-bell" /> RUN</span>
          <span className="badge-soft green">Page 8 · 7 sections</span>
        </div>
        <h1 className="mb-1" style={{ fontSize: "1.6rem", fontWeight: 800 }}>Notifications Center</h1>
        <p className="mb-0" style={{ color: "#b9c7d8", fontSize: "0.86rem", maxWidth: 640 }}>
          One place for everything that pings you. Route alerts to the right channel,
          quiet the noise, and never miss a fire.
        </p>
      </div>
      <div className="d-flex flex-column gap-2 align-items-lg-end">
        <div className="d-flex align-items-center gap-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14 }}>
          <div className="text-center">
            <div style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "Sora", color: "#7ee2b0" }}>{unread}</div>
            <div style={{ fontSize: "0.62rem", color: "#b9c7d8", letterSpacing: "0.08em" }}>UNREAD</div>
          </div>
          <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.18)" }} />
          <div>
            <div className="fw-bold" style={{ fontSize: "0.86rem" }}>{urgent} urgent · {rules.filter((r) => r.status === "Active").length} alert rules</div>
            <div className="pm-prod-meta" style={{ color: "#b9c7d8" }}>89.2% in-app open rate · quiet hours tonight 22:00</div>
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("preferencesWizard")}><i className="bi bi-sliders me-1" /> Preferences</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("alertRuleWizard")}><i className="bi bi-plus-lg me-1" /> New Alert Rule</button>
          <button type="button" className="btn btn-light btn-sm" onClick={() => openModal("testNotif")}><i className="bi bi-send me-1" /> Test Alert</button>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   8.1 NOTIFICATION COMMAND CENTER
================================================================== */
export function NotifCommandCenter() {
  const { notifs, rules, quietHours, deliveryLog, openModal } = useStore();
  const unread = notifs.filter((n) => n.unread).length;
  const urgentUnread = notifs.filter((n) => n.unread && n.priority === "Urgent").length;
  const bounced = deliveryLog.filter((l) => l.status === "Bounced").length;
  const activeRules = rules.filter((r) => r.status === "Active").length;
  const activeQuiet = quietHours.filter((q) => q.active).length;

  return (
    <>
      <Section no="8.1" title="Notification Command Center"
        sub="How the alerting engine is behaving — inbox load, channel health, rules firing."
        actions={
          <>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("deliveryLog")}>
              <i className="bi bi-envelope-check me-1" /> Delivery log
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("preferencesWizard")}>
              <i className="bi bi-sliders me-1" /> Preferences wizard
            </button>
          </>
        }
      />
      <div className="pm-stat-grid">
        <Kpi icon="bi-bell-fill" iconBg="var(--pm-green-soft)" label="Unread notifications" value={String(unread)} delta={urgentUnread ? `${urgentUnread} urgent` : "no urgent"} deltaGood={urgentUnread === 0} footer={`${notifs.length} total in inbox`} />
        <Kpi icon="bi-envelope-check" iconBg="#e8f1fe" label="Deliveries · 30d" value="5,934" delta="98.4% delivered" spark={[92, 94, 93, 95, 96, 95, 97, 98, 97, 98, 98, 98]} sparkColor="#2e90fa" footer={`${bounced} bounced · auto-retry active`} />
        <Kpi icon="bi-lightning-charge" iconBg="#fef0c7" label="Active alert rules" value={String(activeRules)} delta={`${rules.reduce((a, b) => a + b.fired, 0)} fires · 30d`} footer={`${rules.length - activeRules} paused`} />
        <Kpi icon="bi-moon" iconBg="#f0ebfe" label="Quiet-hour windows" value={String(activeQuiet)} delta="urgent breaks through" footer="next: tonight 22:00" />
      </div>

      <div className="row g-3 mt-1">
        <div className="col-lg-7">
          <div className="pm-card h-100">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Channel reliability — last 30 days</div>
            {CHANNEL_STATS.map((c) => (
              <div key={c.channel} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                <i className={`bi ${c.icon}`} style={{ color: c.tone === "green" ? "#25d366" : c.tone === "blue" ? "var(--pm-blue)" : c.tone === "violet" ? "var(--pm-violet)" : c.tone === "amber" ? "var(--pm-warn)" : "#98a2b3", width: 22 }} />
                <span className="fw-semibold" style={{ fontSize: "0.82rem", width: 86 }}>{c.label}</span>
                <div className="progress flex-grow-1" style={{ height: 8 }}>
                  <div className="progress-bar" style={{ width: c.rate, background: c.tone === "green" ? "#25d366" : c.tone === "blue" ? "var(--pm-blue)" : c.tone === "violet" ? "var(--pm-violet)" : c.tone === "amber" ? "var(--pm-warn)" : "#98a2b3" }} />
                </div>
                <span className="pm-prod-meta" style={{ width: 130, textAlign: "right" }}>{c.opened.toLocaleString()} opened</span>
                <b style={{ fontSize: "0.78rem", width: 48, textAlign: "right" }}>{c.rate}</b>
              </div>
            ))}
            <div className="pm-note soft mt-3"><i className="bi bi-lightbulb me-1" />Email opens lag behind — route urgent alerts to WhatsApp/SMS and keep email for reports.</div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="pm-card h-100">
            <div className="fw-bold mb-2" style={{ fontSize: "0.9rem" }}>Categories at a glance</div>
            {notifs.length > 0 && (
              <div className="d-flex flex-column gap-2">
                {["Payments", "Inventory", "Compliance", "Team", "System", "Sales", "Marketing"].map((cat) => {
                  const catNotifs = notifs.filter((n) => n.category === cat);
                  return (
                    <div key={cat} className="d-flex align-items-center gap-2 p-2 pm-offer-row" onClick={() => openModal("muteCategory", { category: cat })}>
                      <i className={`bi ${catNotifs[0]?.icon ?? "bi-bell"}`} style={{ color: cat === "Payments" ? "var(--pm-green)" : cat === "Inventory" ? "var(--pm-warn)" : cat === "Compliance" ? "var(--pm-danger)" : cat === "Team" ? "var(--pm-violet)" : "var(--pm-muted)", width: 20 }} />
                      <span className="flex-grow-1" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{cat}</span>
                      <Badge tone={catNotifs.filter((n) => n.unread).length ? "blue" : "slate"}>{catNotifs.filter((n) => n.unread).length} unread</Badge>
                      <Badge tone="slate">{catNotifs.length}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   8.2 UNIFIED INBOX
================================================================== */
export function InboxSection() {
  const { notifs, openModal, searchQuery } = useStore();
  const [tab, setTab] = useState<"All" | "Unread" | "Archived">("All");
  const [catFilter, setCatFilter] = useState("All");
  const [prioFilter, setPrioFilter] = useState("All");
  const [sel, setSel] = useState<string[]>([]);
  const q = searchQuery.trim().toLowerCase();

  const filtered = useMemo(() => notifs.filter((n) =>
    (tab === "All" ? !n.archived : tab === "Unread" ? !n.archived && n.unread : n.archived) &&
    (catFilter === "All" || n.category === catFilter) &&
    (prioFilter === "All" || n.priority === prioFilter) &&
    (!q || (n.title + n.body + n.category).toLowerCase().includes(q))
  ), [notifs, tab, catFilter, prioFilter, q]);

  const unreadCount = notifs.filter((n) => !n.archived && n.unread).length;
  const archCount = notifs.filter((n) => n.archived).length;

  return (
    <>
      <Section no="8.2" title="Unified Inbox"
        sub="Every alert from every module in one feed — filter by category, priority or state."
        actions={
          <>
            {sel.length > 0 && <span className="badge-soft blue">{sel.length} selected</span>}
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("markAllReadConfirm")}>
              <i className="bi bi-check2-all me-1" /> Mark all read
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("preferencesWizard")}>
              <i className="bi bi-sliders me-1" /> Preferences
            </button>
          </>
        }
      />
      <div className="pm-card">
        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <ul className="nav nav-tabs border-0 mb-0 flex-grow-1" style={{ minWidth: 280 }}>
            {(["All", "Unread", "Archived"] as const).map((t) => (
              <li className="nav-item" key={t}>
                <button type="button" className={`nav-link ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                  {t} <span className={`badge ${tab === t ? "text-bg-dark" : "bg-light text-secondary border"}`}>{t === "Unread" ? unreadCount : t === "Archived" ? archCount : notifs.filter((n) => !n.archived).length}</span>
                </button>
              </li>
            ))}
          </ul>
          <select className="form-select form-select-sm" style={{ width: 150 }} value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="All">All categories</option>
            {["Payments", "Sales", "Inventory", "Compliance", "Team", "System", "Marketing"].map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="form-select form-select-sm" style={{ width: 130 }} value={prioFilter} onChange={(e) => setPrioFilter(e.target.value)}>
            <option value="All">All priority</option>
            <option>Urgent</option><option>Important</option><option>Routine</option>
          </select>
        </div>

        <div className="d-flex flex-column gap-2">
          {filtered.map((n) => (
            <div key={n.id} className={`d-flex align-items-start gap-3 p-2 ${n.unread ? "pm-notif-unread" : ""}`} style={{ border: "1px solid var(--pm-border)", borderRadius: 12, cursor: "pointer", background: n.unread ? "var(--pm-green-soft)" : "#fff" }} onClick={() => openModal("notifDrawer", { id: n.id })}>
              <div onClick={(e) => e.stopPropagation()}>
                <input className="form-check-input mt-1" type="checkbox" checked={sel.includes(n.id)} onChange={() => setSel((s) => s.includes(n.id) ? s.filter((x) => x !== n.id) : [...s, n.id])} />
              </div>
              <span className="pm-kpi-icon" style={{ width: 38, height: 38, fontSize: "0.95rem", background: (n.category === "Compliance" || n.priority === "Urgent" ? "#fee4e2" : "var(--pm-green-soft)"), color: n.priority === "Urgent" ? "var(--pm-danger)" : "var(--pm-green-dark)" }}>
                <i className={`bi ${n.icon}`} />
              </span>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <b style={{ fontSize: "0.86rem" }}>{n.title}</b>
                  {n.unread && <span className="pm-dot-live" />}
                  {n.priority === "Urgent" ? <Badge tone="red">Urgent</Badge> : n.priority === "Important" ? <Badge tone="amber">Important</Badge> : null}
                  <Badge tone="slate">{n.category}</Badge>
                </div>
                <div className="pm-prod-meta text-truncate">{n.body}</div>
                <div className="pm-prod-meta mt-1" style={{ fontSize: "0.68rem" }}>
                  {n.time} · {n.channels.join(" · ")} · {n.delivery === "Opened" ? "you opened" : n.delivery.toLowerCase()}
                </div>
              </div>
              <div className="text-end d-flex flex-column gap-1">
                {n.action && (
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); openModal("notifDrawer", { id: n.id }); }}>
                    {n.action}
                  </button>
                )}
                <StatusBadge status={n.delivery} />
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <EmptyState icon="bi-bell" title="Nothing here" text="Try a different tab or filter." />}
        <div className="pm-prod-meta mt-2"><i className="bi bi-lightbulb me-1" />Click any notification to open its detail drawer with actions, mute and archive.</div>
      </div>
    </>
  );
}

/* ==================================================================
   8.3 CATEGORY PREFERENCES & ROUTING
================================================================== */
export function PreferencesSection() {
  const { prefs, openModal, unmuteCategory } = useStore();
  return (
    <>
      <Section no="8.3" title="Category Preferences &amp; Routing"
        sub="Per-category control: channels, priority floor, digests and mutes."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("preferencesWizard")}>
            <i className="bi bi-sliders me-1" /> Run preferences wizard
          </button>
        }
      />
      <div className="row g-3">
        {prefs.map((p) => (
          <div className="col-lg-4 col-md-6" key={p.id}>
            <div className={`pm-card h-100 ${p.muted ? "pm-card-muted" : ""}`} style={{ borderTop: `3px solid ${p.color}` }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="pm-kpi-icon" style={{ width: 34, height: 34, fontSize: "0.85rem", background: p.color + "22", color: p.color }}><i className={`bi ${p.icon}`} /></span>
                <div className="flex-grow-1">
                  <b style={{ fontSize: "0.84rem" }}>{p.name}</b>
                  <div className="pm-prod-meta">{p.count} recent</div>
                </div>
                {p.muted ? <Badge tone="red">Muted</Badge> : <Badge tone="green">Active</Badge>}
              </div>
              <div className="d-flex gap-1 flex-wrap mb-2">
                {(["whatsapp", "sms", "email", "inapp", "push"] as const).map((c) => (
                  <span key={c} className={`badge-soft ${p.channels[c] ? "green" : "slate"}`} style={{ fontSize: "0.62rem", opacity: p.channels[c] ? 1 : 0.5 }}>
                    {c}
                  </span>
                ))}
              </div>
              <div className="pm-prod-meta mb-2">
                min <b>{p.priorityMin}</b>{p.digests ? " · daily digest" : " · instant"}
              </div>
              <div className="d-flex gap-1">
                <button type="button" className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => openModal("preferencesWizard")}>
                  <i className="bi bi-sliders me-1" />Configure
                </button>
                {p.muted ? (
                  <button type="button" className="btn btn-sm btn-outline-success" onClick={() => unmuteCategory(p.id)}>
                    <i className="bi bi-bell me-1" />Unmute
                  </button>
                ) : (
                  <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => openModal("muteCategory", { category: p.id })}>
                    <i className="bi bi-bell-slash me-1" />Mute
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   8.4 ALERT RULES & THRESHOLDS
================================================================== */
export function RulesSection() {
  const { rules, openModal, toggleRule, deleteRule } = useStore();
  return (
    <>
      <Section no="8.4" title="Alert Rules &amp; Thresholds"
        sub="Custom triggers with thresholds, recipients and channels — fires only when you want."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("alertRuleWizard")}>
            <i className="bi bi-plus-lg me-1" /> New rule
          </button>
        }
      />
      <div className="pm-card">
        <div className="table-responsive">
          <table className="table pm-table align-middle">
            <thead><tr><th>Rule</th><th>Trigger</th><th className="text-end">Threshold</th><th>Channels</th><th>Recipients</th><th className="text-end">Fired 30d</th><th>Status</th><th style={{ width: 90 }}></th></tr></thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="row-select" onClick={() => openModal("alertRuleWizard")}>
                  <td><b style={{ fontSize: "0.82rem" }}>{r.name}</b></td>
                  <td><Badge tone="slate">{r.trigger}</Badge></td>
                  <td className="text-end fw-bold" style={{ fontSize: "0.82rem" }}>{r.threshold ? `${fmtKES(r.threshold)}` : "Any"}</td>
                  <td>
                    <div className="d-flex gap-1">
                      {r.channels.map((c) => <Badge key={c} tone={c === "whatsapp" ? "green" : c === "sms" ? "blue" : c === "email" ? "slate" : "violet"}>{c}</Badge>)}
                    </div>
                  </td>
                  <td className="pm-prod-meta">{r.recipients.join(", ")}</td>
                  <td className="text-end pm-prod-meta">{r.fired}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="form-check form-switch mb-0">
                      <input className="form-check-input" type="checkbox" checked={r.status === "Active"} onChange={() => toggleRule(r.id)} />
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteRule(r.id)}><i className="bi bi-trash" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pm-note soft mt-2"><i className="bi bi-shield-check me-1" />De-duplication is on for all rules — the same trigger within 30 minutes sends once.</div>
      </div>
    </>
  );
}

/* ==================================================================
   8.5 QUIET HOURS & DND
================================================================== */
export function QuietHoursSection() {
  const { quietHours, openModal, toggleQuietHour, removeQuietHour } = useStore();
  return (
    <>
      <Section no="8.5" title="Quiet Hours &amp; Do-Not-Disturb"
        sub="Silence routine pings at night and on weekends — fires still break through."
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal("quietHours")}>
            <i className="bi bi-moon me-1" /> Add quiet hours
          </button>
        }
      />
      <div className="row g-3">
        {quietHours.map((q) => (
          <div className="col-lg-4 col-md-6" key={q.id}>
            <div className={`pm-card h-100 ${q.active ? "" : "pm-card-muted"}`}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="pm-kpi-icon" style={{ width: 36, height: 36, background: "#f0ebfe", color: "var(--pm-violet)" }}><i className="bi bi-moon" /></span>
                <div className="flex-grow-1">
                  <b style={{ fontSize: "0.86rem" }}>{q.label}</b>
                  <div className="pm-prod-meta">{q.days} · {q.start} → {q.end}</div>
                </div>
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" checked={q.active} onChange={() => toggleQuietHour(q.id)} />
                </div>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <Badge tone={q.allowUrgent ? "green" : "red"}>{q.allowUrgent ? "Urgent breaks through" : "All muted ⚠️"}</Badge>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => removeQuietHour(q.id)}><i className="bi bi-trash" /></button>
              </div>
            </div>
          </div>
        ))}
        <div className="col-lg-4 col-md-6">
          <div className="pm-card h-100 d-flex flex-column align-items-center justify-content-center text-center" style={{ border: "2px dashed var(--pm-border)", boxShadow: "none" }}>
            <i className="bi bi-moon-stars" style={{ fontSize: "1.8rem", color: "var(--pm-violet)" }} />
            <div className="fw-semibold mt-2" style={{ fontSize: "0.84rem" }}>Add a window</div>
            <div className="pm-prod-meta mb-2">Holidays, evenings, weekends</div>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openModal("quietHours")}><i className="bi bi-plus-lg me-1" />New window</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================================================================
   8.6 DELIVERY LOG & RELIABILITY
================================================================== */
export function DeliverySection() {
  const { deliveryLog, openModal, retryDelivery } = useStore();
  const bounced = deliveryLog.filter((l) => l.status === "Bounced");
  const opened = deliveryLog.filter((l) => l.status === "Opened");
  return (
    <>
      <Section no="8.6" title="Delivery Log &amp; Reliability"
        sub="Every notification sent — delivered, opened or bounced, with one-click retry."
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("deliveryLog")}>
            <i className="bi bi-envelope-check me-1" /> Full log
          </button>
        }
      />
      <div className="pm-stat-grid mb-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
        <div className="pm-card py-3"><div className="pm-kpi-label">Delivered</div><div className="pm-kpi-value text-primary">{deliveryLog.filter((l) => l.status === "Delivered").length}</div><div className="pm-prod-meta">of {deliveryLog.length} recent</div></div>
        <div className="pm-card py-3"><div className="pm-kpi-label">Opened</div><div className="pm-kpi-value" style={{ color: "var(--pm-green-dark)" }}>{opened.length}</div><div className="pm-prod-meta">best channel: in-app</div></div>
        <div className="pm-card py-3" style={{ background: bounced.length ? "#fef6f5" : undefined }}><div className="pm-kpi-label">Bounced</div><div className="pm-kpi-value" style={{ color: bounced.length ? "var(--pm-danger)" : undefined }}>{bounced.length}</div><div className="pm-prod-meta">auto-retried ×3 with backoff</div></div>
        <div className="pm-card py-3"><div className="pm-kpi-label">Fallback</div><div className="pm-kpi-value" style={{ fontSize: "1.3rem" }}>SMS ✓</div><div className="pm-prod-meta">email fails fall back to SMS</div></div>
      </div>
      <div className="pm-card">
        {deliveryLog.slice(0, 6).map((l) => (
          <div key={l.id} className="d-flex align-items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
            <span className="pm-kpi-icon" style={{ width: 32, height: 32, fontSize: "0.8rem", background: l.channel === "whatsapp" ? "var(--pm-green-soft)" : l.channel === "sms" ? "#e8f1fe" : "#f2f4f8", color: l.channel === "whatsapp" ? "#25d366" : l.channel === "sms" ? "var(--pm-blue)" : "var(--pm-muted)" }}>
              <i className={`bi ${l.channel === "whatsapp" ? "bi-whatsapp" : l.channel === "sms" ? "bi-chat-left-text" : "bi-envelope"}`} />
            </span>
            <div className="flex-grow-1" style={{ minWidth: 0 }}>
              <b style={{ fontSize: "0.8rem" }}>{l.title}</b>
              <div className="pm-prod-meta">{l.recipient} · {l.sent}{l.note ? ` · ${l.note}` : ""}</div>
            </div>
            <StatusBadge status={l.status} />
            {l.status === "Bounced" && (
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => retryDelivery(l.id)}><i className="bi bi-arrow-repeat me-1" />Retry</button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

/* ==================================================================
   8.7 TEMPLATES & BRANDING
================================================================== */
export function TemplatesSection() {
  const { templates, openModal } = useStore();
  return (
    <>
      <Section no="8.7" title="Templates &amp; Branding"
        sub="Wording and tone for every automated message — variables fill in per event."
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => openModal("testNotif")}>
            <i className="bi bi-send me-1" /> Test a message
          </button>
        }
      />
      <div className="row g-3">
        {templates.map((t) => (
          <div className="col-lg-3 col-md-6" key={t.id}>
            <div className="pm-card pm-card-hover h-100" onClick={() => openModal("templateEditor", { templateId: t.id })}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="pm-kpi-icon" style={{ width: 34, height: 34, fontSize: "0.85rem", background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}>
                  <i className={`bi ${t.channel === "email" ? "bi-envelope" : t.channel === "sms" ? "bi-chat-left-text" : "bi-whatsapp"}`} />
                </span>
                <Badge tone="slate">{t.channel}</Badge>
              </div>
              <b style={{ fontSize: "0.84rem" }}>{t.name}</b>
              <div className="pm-prod-meta mb-2">{t.category}</div>
              <div className="pm-wa-preview">
                <div className="pm-wa-bubble" style={{ fontSize: "0.68rem" }}>{t.body.slice(0, 90)}…</div>
              </div>
              <div className="mt-2"><span className="badge-soft blue" style={{ fontSize: "0.66rem" }}><i className="bi bi-pencil me-1" />Edit template →</span></div>
            </div>
          </div>
        ))}
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
          Preferences (5 steps) · Alert Rule (4) · Quiet Hours (3) · Digest Schedule · Test Alert · Delivery Retry. Every change is audit-logged and applies instantly.
        </div>
      </div>
      <button type="button" className="btn btn-warning btn-sm" onClick={() => openModal("preferencesWizard")}>
        <i className="bi bi-magic me-1" /> Tune my alerts
      </button>
    </div>
  );
}
