import { useState } from "react";
import type { Channel, NotifCategory } from "./data";
import { useStore } from "./store";
import { Badge, Chip, Drawer, Field, Modal, StatusBadge } from "./ui";

/* ==================================================================
   NOTIFICATION DRAWER — detail & actions
================================================================== */
export function NotifDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { notifs, markRead, archive, deleteNotif, muteCategory, openModal } = useStore();
  const n = notifs.find((x) => x.id === String(payload.id));
  const [muteChoice, setMuteChoice] = useState("7 days");
  if (!n) return null;

  return (
    <Drawer open onClose={onClose} icon={n.icon} title={n.title} subtitle={`${n.category} · ${n.time} · ${n.priority}`}>
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={n.delivery} />
        {n.priority === "Urgent" ? <Badge tone="red">Urgent</Badge> : n.priority === "Important" ? <Badge tone="amber">Important</Badge> : <Badge tone="slate">Routine</Badge>}
        {n.archived && <Badge tone="slate">Archived</Badge>}
      </div>

      <div className="pm-card mb-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
        <div style={{ fontSize: "0.9rem" }}>{n.body}</div>
      </div>

      <div className="pm-kpi-label mb-2">Delivered via</div>
      <div className="d-flex gap-1 flex-wrap mb-3">
        {n.channels.map((c) => (
          <Badge key={c} tone={c === "whatsapp" ? "green" : c === "sms" ? "blue" : c === "email" ? "slate" : "violet"}>{c}</Badge>
        ))}
      </div>

      {n.moduleLink && (
        <div className="pm-note soft mb-3">
          <i className="bi bi-arrow-up-right me-1" />Source module: <b>{n.moduleLink}</b> — the action opens the right page.
        </div>
      )}

      <div className="row g-2">
        {n.action && (
          <div className="col-12">
            <button type="button" className="btn btn-primary btn-sm w-100" onClick={() => { markRead(n.id); openModal(n.category === "Payments" && n.title.includes("reversal") ? "reversalNotice" : "notifAction", { notifId: n.id }); }}>
              <i className="bi bi-lightning-charge me-1" /> {n.action}
            </button>
          </div>
        )}
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { markRead(n.id); onClose(); }}>
            <i className="bi bi-check2 me-1" /> Mark read
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { n.archived ? null : archive(n.id); onClose(); }}>
            <i className="bi bi-archive me-1" /> {n.archived ? "Archived" : "Archive"}
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => { deleteNotif(n.id); onClose(); }}>
            <i className="bi bi-trash me-1" /> Delete
          </button>
        </div>
        <div className="col-6">
          <button type="button" className="btn btn-outline-warning btn-sm w-100" onClick={() => {
            muteCategory(n.category, muteChoice);
            onClose();
          }}>
            <i className="bi bi-bell-slash me-1" /> Mute {n.category}
          </button>
        </div>
      </div>

      <div className="mt-3 d-flex align-items-center gap-2">
        <span className="pm-prod-meta" style={{ fontSize: "0.72rem" }}>Mute for</span>
        <select className="form-select form-select-sm" style={{ width: 110 }} value={muteChoice} onChange={(e) => setMuteChoice(e.target.value)}>
          <option>24 hours</option><option>7 days</option><option>30 days</option>
        </select>
      </div>
    </Drawer>
  );
}

/* ==================================================================
   DELIVERY LOG MODAL
================================================================== */
export function DeliveryLogModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { deliveryLog, retryDelivery } = useStore();
  const [filter, setFilter] = useState<"All" | Channel | "Failed">("All");
  const list = deliveryLog.filter((l) => filter === "All" ? true : filter === "Failed" ? l.status === "Bounced" : l.channel === filter);
  return (
    <Modal open onClose={onClose} title="Delivery log" subtitle="Every notification sent, every channel, every outcome" icon="bi-envelope-check" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>Done</button>}
    >
      <div className="d-flex gap-1 flex-wrap mb-3">
        {(["All", "whatsapp", "sms", "email", "inapp", "Failed"] as const).map((f) => (
          <Chip key={f} on={filter === f} onClick={() => setFilter(f)}>
            {f === "Failed" ? "Failed only" : f === "All" ? "All" : f}
          </Chip>
        ))}
      </div>
      <div className="table-responsive">
        <table className="table pm-table align-middle">
          <thead><tr><th>Notification</th><th>Channel</th><th>Recipient</th><th>Sent</th><th>Attempts</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.id}>
                <td><b style={{ fontSize: "0.8rem" }}>{l.title}</b></td>
                <td><Badge tone={l.channel === "whatsapp" ? "green" : l.channel === "sms" ? "blue" : l.channel === "email" ? "slate" : "violet"}>{l.channel}</Badge></td>
                <td className="pm-prod-meta">{l.recipient}</td>
                <td className="pm-prod-meta">{l.sent}</td>
                <td className="text-end pm-prod-meta">{l.attempts}</td>
                <td><StatusBadge status={l.status} /></td>
                <td>
                  {l.status === "Bounced" && (
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => retryDelivery(l.id)}>
                      <i className="bi bi-arrow-repeat me-1" />Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {list.length === 0 && <div className="pm-prod-meta text-center py-3">Nothing matches this filter.</div>}
      <div className="pm-note soft mt-2"><i className="bi bi-info-circle me-1" />Bounced emails auto-retry 3 times with backoff, then fall back to SMS if enabled.</div>
    </Modal>
  );
}

/* ==================================================================
   TEST NOTIFICATION MODAL
================================================================== */
export function TestNotifModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [priority, setPriority] = useState<"Urgent" | "Important" | "Routine">("Important");
  const [sending, setSending] = useState(false);
  const send = () => {
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      recordActivity(`Test notification sent via ${channel} (${priority})`, "bi-send");
      toast(`Test ${priority.toLowerCase()} alert delivered via ${channel} ✓ — check your ${channel === "inapp" ? "feed" : channel === "email" ? "inbox" : channel}.`, "success", "Test delivered");
      onClose();
    }, 1400);
  };
  return (
    <Modal open onClose={onClose} title="Send test notification" subtitle="Verify each channel actually reaches you" icon="bi-send"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={sending} onClick={send}>
            {sending ? <><span className="pm-spin me-1">◌</span> Sending…</> : <><i className="bi bi-send me-1" /> Send test</>}
          </button>
        </>
      }
    >
      <Field label="Channel" className="mb-3">
        <select className="form-select" value={channel} onChange={(e) => setChannel(e.target.value as Channel)}>
          <option value="whatsapp">WhatsApp (0722 445 118)</option>
          <option value="sms">SMS (0722 445 118)</option>
          <option value="email">Email (wanjiku@techsol.co.ke)</option>
          <option value="inapp">In-app</option>
          <option value="push">Push</option>
        </select>
      </Field>
      <Field label="Priority styling" className="mb-3">
        <div className="d-flex gap-2">
          {(["Urgent", "Important", "Routine"] as const).map((p) => (
            <Chip key={p} on={priority === p} onClick={() => setPriority(p)}>{p}</Chip>
          ))}
        </div>
      </Field>
      <div className="pm-wa-preview">
        <div className="pm-wa-head"><i className="bi bi-whatsapp" /> Preview</div>
        <div className="pm-wa-bubble">
          {priority === "Urgent" ? "🚨 " : priority === "Important" ? "⚠️ " : "💬 "}
          Test notification from PayMo — if you can read this, {channel} delivery works!
        </div>
      </div>
    </Modal>
  );
}

/* ==================================================================
   TEMPLATE EDITOR MODAL
================================================================== */
export function TemplateEditorModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { templates, updateTemplate, toast, recordActivity } = useStore();
  const preId = String(payload.templateId ?? templates[0]?.id ?? "t1");
  const t = templates.find((x) => x.id === preId) ?? templates[0];
  const [subject, setSubject] = useState(t.subject);
  const [body, setBody] = useState(t.body);
  return (
    <Modal open onClose={onClose} title="Edit notification template" subtitle={`${t.name} · ${t.channel} · ${t.category}`} icon="bi-pencil-square"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            updateTemplate(t.id, { subject, body });
            recordActivity(`Template "${t.name}" updated`, "bi-pencil");
            toast("Template saved — applies to all future notifications of this type.", "success", "Template updated");
            onClose();
          }}>
            <i className="bi bi-check2 me-1" /> Save template
          </button>
        </>
      }
    >
      <div className="pm-kpi-label mb-2">Available variables — copy-paste into your text:</div>
      <div className="d-flex gap-1 flex-wrap mb-3">
        {t.variables.map((v) => (
          <span key={v} className="badge-soft ink pm-mono" style={{ fontSize: "0.68rem" }}>{v}</span>
        ))}
      </div>
      {t.channel === "email" && (
        <Field label="Subject line" className="mb-3">
          <input className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
      )}
      <Field label="Body">
        <textarea className="form-control" rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>
      <div className="pm-wa-preview mt-3">
        <div className="pm-wa-head"><i className={`bi ${t.channel === "email" ? "bi-envelope" : t.channel === "sms" ? "bi-chat-left-text" : "bi-whatsapp"}`} /> Rendered preview</div>
        <div className="pm-wa-bubble">{body.replace(/\{\{amount\}\}/g, "14,500").replace(/\{\{customer\}\}/g, "Dennis Otieno").replace(/\{\{sku\}\}/g, "PRD-010").replace(/\{\{stock\}\}/g, "6").replace(/\{\{reorder\}\}/g, "10").replace(/\{\{supplier\}\}/g, "Ankole Crafts").replace(/\{\{doc\}\}/g, "CR12").replace(/\{\{days\}\}/g, "34").replace(/\{\{date\}\}/g, "22 Feb 2026").replace(/\{\{name\}\}/g, "Wanjiku").replace(/\{\{integration\}\}/g, "Meta").replace(/\{\{error\}\}/g, "OAuth expired").replace(/\{\{action\}\}/g, "Reconnect").replace(/\{\{channel\}\}/g, "M-Pesa").replace(/\{\{ref\}\}/g, "QK88123049")}</div>
      </div>
    </Modal>
  );
}

/* ==================================================================
   MUTE CATEGORY MODAL
================================================================== */
export function MuteCategoryModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { prefs, muteCategory, unmuteCategory } = useStore();
  const catId = String(payload.category ?? "Marketing") as NotifCategory;
  const cat = prefs.find((p) => p.id === catId);
  const [duration, setDuration] = useState("7 days");
  if (!cat) return null;
  return (
    <Modal open onClose={onClose} title={`${cat.muted ? "Unmute" : "Mute"} ${cat.name}`} icon="bi-bell-slash" size="sm"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {cat.muted ? (
            <button type="button" className="btn btn-primary" onClick={() => { unmuteCategory(cat.id); onClose(); }}><i className="bi bi-bell me-1" /> Unmute now</button>
          ) : (
            <button type="button" className="btn btn-warning" onClick={() => { muteCategory(cat.id, duration); onClose(); }}><i className="bi bi-bell-slash me-1" /> Mute for {duration}</button>
          )}
        </>
      }
    >
      {!cat.muted && (
        <Field label="Duration" className="mb-3">
          <select className="form-select" value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option>24 hours</option><option>7 days</option><option>30 days</option>
          </select>
        </Field>
      )}
      <div className="pm-note soft"><i className="bi bi-fire me-1" />Urgent KRA, security and reversal alerts always break through a mute.</div>
    </Modal>
  );
}

/* ==================================================================
   MARK ALL READ CONFIRM
================================================================== */
export function MarkAllReadConfirmModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { notifs, markAllRead } = useStore();
  const unread = notifs.filter((n) => n.unread).length;
  return (
    <Modal open onClose={onClose} title="Mark all as read?" icon="bi-check2-all" size="sm"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => { markAllRead(); onClose(); }}>
            <i className="bi bi-check2-all me-1" /> Mark {unread} read
          </button>
        </>
      }
    >
      <p className="mb-0">{unread} unread notification{unread === 1 ? "" : "s"} will be marked as read across all categories. Nothing is archived or deleted.</p>
    </Modal>
  );
}

/* ==================================================================
   NOTIFICATION ACTION (generic module jump)
================================================================== */
export function NotifActionModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { notifs, toast } = useStore();
  const n = notifs.find((x) => x.id === String(payload.notifId ?? ""));
  if (!n) return null;
  return (
    <Modal open onClose={onClose} title={n.action ?? "Action"} subtitle={n.title} icon="bi-lightning-charge"
      footer={<button type="button" className="btn btn-primary" onClick={() => { toast(`Action handed to ${n.moduleLink ?? "the relevant module"}. (Demo jump)`, "info", "Action triggered"); onClose(); }}><i className="bi bi-arrow-up-right me-1" /> Open {n.moduleLink}</button>}
    >
      <p className="mb-0" style={{ fontSize: "0.88rem" }}>{n.body}</p>
      <div className="pm-note soft mt-3"><i className="bi bi-arrow-up-right me-1" />Jumping to <b>{n.moduleLink}</b> — the notification stays marked as read.</div>
    </Modal>
  );
}

/* ==================================================================
   HELP
================================================================== */
export function HelpModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal, toast } = useStore();
  return (
    <Modal open onClose={onClose} title="Help & shortcuts" subtitle="Notifications Center — every flow on this page" icon="bi-question-circle" size="lg"
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
          { icon: "bi-sliders", t: "Preferences Wizard (5 steps)", d: "Category → channels → priority floor → digests → review.", act: () => openModal("preferencesWizard") },
          { icon: "bi-plus-circle", t: "Alert Rule Wizard (4 steps)", d: "Trigger → threshold → channels → recipients. De-dup included.", act: () => openModal("alertRuleWizard") },
          { icon: "bi-moon", t: "Quiet Hours (3 steps)", d: "Schedule → urgent exceptions → review. Fires still break through.", act: () => openModal("quietHours") },
          { icon: "bi-envelope-paper", t: "Digest Schedule", d: "Bundle routine categories into one 08:00 summary email.", act: () => openModal("digestSchedule") },
          { icon: "bi-send", t: "Test Notification", d: "Verify WhatsApp, SMS, email, in-app and push actually reach you.", act: () => openModal("testNotif") },
          { icon: "bi-envelope-check", t: "Delivery Log", d: "Every send with status — retry bounced deliveries inline.", act: () => openModal("deliveryLog") },
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
  const kinds = ["All", "Rules", "Prefs", "Digests", "Deliveries"];
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" title="Notification activity" subtitle="Every change to how you're alerted">
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
      <button type="button" className="btn btn-outline-secondary w-100 mt-3" onClick={() => toast("Notification audit trail exported.", "info", "Exported")}>
        <i className="bi bi-download me-1" /> Export audit trail
      </button>
    </Drawer>
  );
}
