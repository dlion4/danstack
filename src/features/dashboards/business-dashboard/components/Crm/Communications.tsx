import { useEffect, useMemo, useState } from "react";
import {
  MessageCircle, Send, Megaphone, FileText, Plus, Pencil, Trash2, CheckCircle2,
  Search, Inbox,
} from "lucide-react";
import type { CrmCustomer, Msg, MsgTemplate } from "../../dataCrm";
import { templatesSeed } from "../../dataCrm";
import { cls, fmtDT, uid, type QAction } from "../../lib";
import { Avatar, Badge, EmptyState, Field, Kpi, Modal, Section, SlideOver, Stepper, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Communications({ customers, msgs, setMsgs, notify, qa, onConsume }: {
  customers: CrmCustomer[];
  msgs: Msg[];
  setMsgs: React.Dispatch<React.SetStateAction<Msg[]>>;
  notify: Notify;
  emit?: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [templates, setTemplates] = useState<MsgTemplate[]>(templatesSeed);
  const [threadFor, setThreadFor] = useState<string | null>(null);
  const [compose, setCompose] = useState<{ to: string; replyTo?: string } | null>(null);
  const [broadcast, setBroadcast] = useState(false);
  const [tplManager, setTplManager] = useState(false);
  const [tplEdit, setTplEdit] = useState<MsgTemplate | null>(null);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "compose") setCompose({ to: typeof qa.p === "string" ? qa.p : "" });
    if (qa.a === "broadcast") setBroadcast(true);
    if (qa.a === "templates") setTplManager(true);
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const nameOf = (id: string) => customers.find((c) => c.id === id)?.name ?? "Unknown";
  const unread = msgs.filter((m) => m.direction === "in" && !m.read).length;

  const threads = useMemo(() => {
    const map = new Map<string, Msg[]>();
    msgs.forEach((m) => {
      const k = m.customerId;
      map.set(k, [...(map.get(k) ?? []), m]);
    });
    return [...map.entries()].sort((a, b) => (b[1][b[1].length - 1].t > a[1][a[1].length - 1].t ? 1 : -1));
  }, [msgs]);

  const send = (to: string, text: string, channel: string, schedule?: string) => {
    setMsgs((xs) => [...xs, { id: uid("m"), customerId: to, direction: "out", channel: channel as Msg["channel"], text, t: new Date().toISOString(), read: true }]);
    notify({
      tone: "success",
      title: schedule ? "Message scheduled" : `Sent via ${channel}`,
      body: schedule ? `${nameOf(to)} will receive it ${schedule}.` : `${nameOf(to)} · ${text.slice(0, 60)}${text.length > 60 ? "…" : ""}`,
    });
  };

  return (
    <>
      <Section
        no="6.2" sub="Money In · Conversations" id="sec-communications"
        title="Smart Communication Hub"
        right={
          <>
            <button className="btn pm-btn-soft" onClick={() => setTplManager(true)}><FileText size={15} /> Templates</button>
            <button className="btn pm-btn-soft" onClick={() => setBroadcast(true)}><Megaphone size={15} /> Broadcast</button>
            <button className="btn pm-btn-primary" onClick={() => setCompose({ to: "" })}><Plus size={15} /> New Message</button>
          </>
        }
      >
        <div className="row g-3 mb-3">
          <div className="col-6 col-lg-3"><Kpi icon={<MessageCircle size={16} />} label="Conversations" value={`${threads.length} threads`} delta={`${msgs.length} messages`} sub="across 3 channels" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Inbox size={16} />} label="Unread from customers" value={`${unread} messages`} delta="respond within SLA" sub="target: under 2 hours" deltaTone="down" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<CheckCircle2 size={16} />} label="Replies sent (7d)" value="38 messages" delta="97% answered" sub="WhatsApp fastest" /></div>
          <div className="col-6 col-lg-3"><Kpi icon={<Megaphone size={16} />} label="Campaigns (30d)" value="4 broadcasts" delta="1,240 reached" sub="open rate 71%" /></div>
        </div>

        <div className="row g-3">
          {/* inbox */}
          <div className="col-12 col-lg-5">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Inbox</div><div className="pm-card-sub">Tap a thread to see the full conversation</div></div>
              {threads.length === 0 && <EmptyState icon={<Inbox size={24} />} title="Inbox zero 🎉" body="No conversations yet." />}
              {threads.map(([cid, list]) => {
                const last = list[list.length - 1];
                const unreadCount = list.filter((m) => m.direction === "in" && !m.read).length;
                return (
                  <button key={cid} className={cls("pm-thread-row", unreadCount > 0 && "pm-thread-unread")} onClick={() => { setThreadFor(cid); setMsgs((xs) => xs.map((m) => (m.customerId === cid ? { ...m, read: true } : m))); }}>
                    <Avatar name={nameOf(cid)} size={34} />
                    <span className="flex-grow-1 text-start">
                      <b className="pm-fs-13">{nameOf(cid)} {unreadCount > 0 && <span className="pm-unread-pill">{unreadCount}</span>}</b>
                      <span className="pm-muted pm-fs-11 d-block text-truncate" style={{ maxWidth: 240 }}>{last.direction === "out" ? "You: " : ""}{last.text}</span>
                    </span>
                    <span className="text-end">
                      <span className="pm-muted pm-fs-11 d-block">{fmtDT(last.t).split(" · ")[1]}</span>
                      <Badge tone={last.channel === "WhatsApp" ? "success" : last.channel === "Email" ? "info" : "muted"}>{last.channel}</Badge>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* channel activity */}
          <div className="col-12 col-lg-7">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Recent messages</div>
                <div className="d-flex gap-2 align-items-center">
                  <span className="pm-muted pm-fs-12">preferred channel auto-selected per customer</span>
                </div>
              </div>
              {msgs.slice(0, 8).map((m) => (
                <div className={cls("pm-feed-row", m.direction === "in" && "pm-feed-in")} key={m.id}>
                  <Avatar name={nameOf(m.customerId)} size={26} />
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2">
                      <b className="pm-fs-13">{nameOf(m.customerId)}</b>
                      {m.direction === "in" && !m.read && <span className="pm-unread-pill">new</span>}
                      <span className="pm-muted pm-fs-11">{fmtDT(m.t)}</span>
                    </div>
                    <div className="pm-fs-13">{m.text}</div>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-1">
                    <Badge tone={m.channel === "WhatsApp" ? "success" : m.channel === "Email" ? "info" : "muted"}>{m.channel}</Badge>
                    <button className="pm-link-btn pm-fs-11" onClick={() => setCompose({ to: m.customerId, replyTo: m.text })}>Reply →</button>
                  </div>
                </div>
              ))}
              <div className="pm-cyan-note mt-2">💡 Messages here sync with the customer's 360° timeline automatically.</div>
            </div>
          </div>
        </div>
      </Section>

      {/* ════ thread slide-over ════ */}
      <ThreadPanel customerId={threadFor} onClose={() => setThreadFor(null)} customers={customers} msgs={msgs}
        onSend={(to, text, channel) => send(to, text, channel)} />

      {/* ════ compose modal ════ */}
      <ComposeModal compose={compose} onClose={() => setCompose(null)} customers={customers} templates={templates}
        notify={notify} onSend={send} />

      {/* ════ broadcast wizard ════ */}
      <BroadcastWizard open={broadcast} onClose={() => setBroadcast(false)} customers={customers} templates={templates} notify={notify} onSend={send} />

      {/* ════ template manager ════ */}
      <TemplateManager open={tplManager} onClose={() => setTplManager(false)} templates={templates} setTemplates={setTemplates}
        notify={notify} onEdit={(t) => { setTplManager(false); setTplEdit(t); }} />
      <TemplateEdit tpl={tplEdit} onClose={() => setTplEdit(null)} templates={templates} setTemplates={setTemplates} notify={notify} />
    </>
  );
}

/* ═══════════════ thread panel ═══════════════ */

function ThreadPanel({ customerId, onClose, customers, msgs, onSend }: {
  customerId: string | null; onClose: () => void; customers: CrmCustomer[]; msgs: Msg[];
  onSend: (to: string, text: string, channel: string) => void;
}) {
  const [text, setText] = useState("");
  if (!customerId) return null;
  const c = customers.find((x) => x.id === customerId);
  const thread = msgs.filter((m) => m.customerId === customerId);
  const send = () => {
    if (!text.trim()) return;
    onSend(customerId, text, c?.channel ?? "WhatsApp");
    setText("");
  };
  return (
    <SlideOver open={!!customerId} onClose={onClose} kicker={`${c?.business ?? ""} · prefers ${c?.channel ?? "—"}`} title={c?.name ?? ""} width={520}
      footer={
        <div className="d-flex gap-2 w-100">
          <input className="form-control pm-input flex-grow-1" placeholder={`Send a ${c?.channel ?? ""}…`} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
          <button className="btn pm-btn-primary" onClick={send}><Send size={15} /></button>
        </div>
      }
    >
      <div className="pm-chat">
        {thread.map((m) => (
          <div key={m.id} className={cls("pm-bubble-row", m.direction === "out" && "pm-bubble-out")}>
            <div className={cls("pm-bubble", m.direction === "out" ? "pm-bubble-me" : "pm-bubble-them")}>
              {m.text}
              <div className="pm-bubble-meta">{fmtDT(m.t)} · {m.channel}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="d-flex gap-2 mt-2 flex-wrap">
        <button className="btn pm-btn-soft btn-sm" onClick={() => onSend(customerId, "Hi {name}! Just checking in — is there anything we can help with this week?", c?.channel ?? "WhatsApp")}>Quick check-in</button>
        <button className="btn pm-btn-soft btn-sm" onClick={() => onSend(customerId, "Payment received, asante! Receipt attached.", c?.channel ?? "WhatsApp")}>Receipt follow-up</button>
      </div>
    </SlideOver>
  );
}

/* ═══════════════ compose ═══════════════ */

function ComposeModal({ compose, onClose, customers, templates, notify, onSend }: {
  compose: { to: string; replyTo?: string } | null; onClose: () => void; customers: CrmCustomer[];
  templates: MsgTemplate[]; notify: Notify; onSend: (to: string, text: string, channel: string, schedule?: string) => void;
}) {
  const [channel, setChannel] = useState("WhatsApp");
  const [tplId, setTplId] = useState("");
  const [msg, setMsg] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [when, setWhen] = useState("");
  const [to, setTo] = useState("");
  useEffect(() => {
    if (compose) {
      setTo(compose.to);
      setChannel(compose.to ? customers.find((c) => c.id === compose.to)?.channel ?? "WhatsApp" : "WhatsApp");
      setTplId(""); setMsg(compose.replyTo ? `Re: "${compose.replyTo.slice(0, 60)}…" — ` : ""); setSchedule(false); setWhen("");
    }
  }, [compose, customers]);
  if (!compose) return null;
  const c = customers.find((x) => x.id === to);
  const pick = (id: string) => {
    setTplId(id);
    const t = templates.find((x) => x.id === id);
    if (t) setMsg(t.body.replace("{name}", c?.name.split(" ")[0] ?? "customer").replace("{invoice}", "INV-0146").replace("{amount}", "KES 12,500").replace("{due}", "30 April"));
  };
  const sendIt = () => {
    if (!to || !msg.trim()) { notify({ tone: "warning", title: "Message empty", body: "Pick a customer and write something." }); return; }
    onSend(to, msg, channel, schedule ? when.replace("T", " ") : undefined);
    onClose();
  };
  return (
    <Modal open={!!compose} onClose={onClose} kicker="Communication Hub" title={c ? `Message ${c.name}` : "New message"} subtitle={c ? `${c.phone} · ${c.email}` : "Pick a customer to start."}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" onClick={sendIt}><Send size={15} /> {schedule ? "Schedule" : "Send"}</button></>}
    >
      <Field label="Customer" req>
        <select className="form-select pm-input" value={to} onChange={(e) => { setTo(e.target.value); const pickC = customers.find((x) => x.id === e.target.value); if (pickC) setChannel(pickC.channel); }}>
          <option value="">Select a customer…</option>
          {customers.map((x) => <option key={x.id} value={x.id}>{x.name} — {x.business}</option>)}
        </select>
        {c && <div className="pm-fs-11 pm-muted mt-1">{c.phone} · {c.email}</div>}
      </Field>
      <Field label="Channel">
        <div className="pm-mode-tabs">
          {["WhatsApp", "Email", "SMS"].map((ch) => (
            <button key={ch} className={cls("pm-mode-tab", channel === ch && "pm-mode-on")} onClick={() => setChannel(ch)}>{ch}</button>
          ))}
        </div>
      </Field>
      <Field label="Template">
        <select className="form-select pm-input" value={tplId} onChange={(e) => pick(e.target.value)}>
          <option value="">Write from scratch…</option>
          {templates.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>)}
        </select>
      </Field>
      <Field label="Message">
        <textarea className="form-control pm-input" rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={`Type your ${channel}…`} />
        <div className="pm-fs-11 pm-muted mt-1">Merge fields fill automatically: {"{name}"} {"{invoice}"} {"{amount}"} {"{due}"}</div>
      </Field>
      <div className="pm-toggle-row"><Toggle on={schedule} onChange={setSchedule} label="Schedule for later" /></div>
      {schedule && <Field label="When"><input type="datetime-local" className="form-control pm-input" value={when} onChange={(e) => setWhen(e.target.value)} /></Field>}
    </Modal>
  );
}

/* ═══════════════ broadcast wizard ═══════════════ */

function BroadcastWizard({ open, onClose, customers, notify, onSend }: {
  open: boolean; onClose: () => void; customers: CrmCustomer[]; templates?: MsgTemplate[]; notify: Notify;
  onSend: (to: string, text: string, channel: string, schedule?: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [aud, setAud] = useState<string[]>([]);
  const [channel, setChannel] = useState("WhatsApp");
  const [msg, setMsg] = useState("");
  const [sendNow, setSendNow] = useState(true);
  useEffect(() => { if (open) { setStep(1); setAud([]); setChannel("WhatsApp"); setMsg(""); setSendNow(true); } }, [open]);

  const audience = aud.includes("all") ? customers : customers.filter((c) => aud.includes(c.tier) || c.tags.some((t) => aud.includes(t)));
  const launch = () => {
    audience.forEach((c) => onSend(c.id, msg.replace("{name}", c.name.split(" ")[0]), channel));
    notify({ tone: "success", title: "Broadcast launched", body: `${audience.length} customer(s) will receive it${sendNow ? " now" : " at the scheduled time"} via ${channel}.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} kicker="Campaigns" title="Broadcast to many customers" size="lg"
      footer={
        step === 1 ? (<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button><button className="btn pm-btn-primary" disabled={aud.length === 0} onClick={() => setStep(2)}>Continue →</button></>)
          : step === 2 ? (<><button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button><button className="btn pm-btn-primary" disabled={!msg.trim()} onClick={() => setStep(3)}>Preview →</button></>)
          : (<><button className="btn pm-btn-ghost" onClick={() => setStep(2)}>← Back</button><button className="btn pm-btn-primary" onClick={launch}><Send size={15} /> {sendNow ? "Send now" : "Schedule"}</button></>)
      }
    >
      <Stepper steps={3} current={step} labels={["Audience", "Message", "Review"]} />
      {step === 1 && (
        <div>
          <div className="pm-wizard-hint">Pick tiers and tags — the audience resolves live.</div>
          <div className="pm-check-grid">
            {["all", ...["vip", "regular", "new", "risk"], ...new Set(customers.flatMap((c) => c.tags))].map((a) => (
              <button key={a} className={cls("pm-check-chip", aud.includes(a) && "pm-check-on")} onClick={() => setAud((x) => (x.includes(a) ? x.filter((y) => y !== a) : [...x, a]))}>
                {aud.includes(a) ? "✓ " : ""}{a === "all" ? "Everyone" : a}
              </button>
            ))}
          </div>
          <div className="pm-cyan-note mt-3">Audience now: <b>{audience.length} customer(s)</b></div>
        </div>
      )}
      {step === 2 && (
        <div>
          <Field label="Channel">
            <div className="pm-mode-tabs">{["WhatsApp", "Email", "SMS"].map((ch) => <button key={ch} className={cls("pm-mode-tab", channel === ch && "pm-mode-on")} onClick={() => setChannel(ch)}>{ch}</button>)}</div>
          </Field>
          <Field label="Message">
            <textarea className="form-control pm-input" rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type your broadcast…" />
          </Field>
          <div className="pm-toggle-row"><Toggle on={sendNow} onChange={setSendNow} label={sendNow ? "Send immediately" : "Schedule for later"} /></div>
        </div>
      )}
      {step === 3 && (
        <div>
          <div className="pm-summary-card mb-2">
            <div className="pm-summary-row"><span>Audience</span><b>{audience.length} customers</b></div>
            <div className="pm-summary-row"><span>Channel</span><b>{channel}</b></div>
            <div className="pm-summary-row"><span>Delivery</span><b>{sendNow ? "Immediately" : "Scheduled"}</b></div>
          </div>
          <div className="pm-preview-label">Preview</div>
          <div className="pm-bubble pm-bubble-me w-100">
            {msg.replace("{name}", "Amina")}
            <div className="pm-bubble-meta">via {channel} · merge fields resolved per customer</div>
          </div>
          <div className="pm-note mt-2">Opt-out respected automatically — customers who unsubscribed are excluded.</div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════ template manager ═══════════════ */

function TemplateManager({ open, onClose, templates, setTemplates, notify, onEdit }: {
  open: boolean; onClose: () => void; templates: MsgTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<MsgTemplate[]>>; notify: Notify;
  onEdit: (t: MsgTemplate) => void;
}) {
  const [q, setQ] = useState("");
  const rows = templates.filter((t) => !q || (t.name + t.body).toLowerCase().includes(q.toLowerCase()));
  return (
    <Modal open={open} onClose={onClose} kicker="Templates" title="Message templates" subtitle="Reusable across compose, broadcasts and nudges." size="lg"
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Close</button>
        <button className="btn pm-btn-primary" onClick={() => onEdit({ id: uid("t"), name: "New template", channel: "WhatsApp", body: "Hi {name}! ", folder: "Care" })}><Plus size={15} /> New template</button></>}
    >
      <div className="pm-search mb-3"><Search size={15} /><input placeholder="Search templates…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      {rows.map((t) => (
        <div className="pm-sched-row" key={t.id}>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2"><b className="pm-fs-13">{t.name}</b><Badge tone={t.channel === "WhatsApp" ? "success" : t.channel === "Email" ? "info" : "muted"}>{t.channel}</Badge><span className="pm-muted pm-fs-11">{t.folder}</span></div>
            <div className="pm-muted pm-fs-12 text-truncate" style={{ maxWidth: 420 }}>{t.body}</div>
          </div>
          <div className="d-flex gap-1">
            <button className="pm-icon-btn" onClick={() => onEdit(t)}><Pencil size={13} /></button>
            <button className="pm-icon-btn pm-icon-danger" onClick={() => { setTemplates((ts) => ts.filter((x) => x.id !== t.id)); notify({ tone: "danger", title: "Template deleted", body: t.name }); }}><Trash2 size={13} /></button>
          </div>
        </div>
      ))}
    </Modal>
  );
}

/* ═══════════════ template edit ═══════════════ */

function TemplateEdit({ tpl, onClose, templates, setTemplates, notify }: {
  tpl: MsgTemplate | null; onClose: () => void; templates: MsgTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<MsgTemplate[]>>; notify: Notify;
}) {
  const [f, setF] = useState({ name: "", channel: "WhatsApp", folder: "Care", body: "" });
  useEffect(() => { if (tpl) setF({ name: tpl.name, channel: tpl.channel, folder: tpl.folder, body: tpl.body }); }, [tpl]);
  if (!tpl) return null;
  const isNew = !templates.some((t) => t.id === tpl.id);
  return (
    <Modal open={!!tpl} onClose={onClose} kicker="Templates" title={isNew ? "New template" : `Edit ${tpl.name}`}
      footer={<><button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn pm-btn-primary" disabled={!f.name || !f.body} onClick={() => {
          setTemplates((ts) => isNew ? [...ts, { ...f, id: tpl.id }] : ts.map((x) => (x.id === tpl.id ? { ...x, ...f } : x)));
          notify({ tone: "success", title: "Template saved", body: f.name });
          onClose();
        }}>Save template</button></>}
    >
      <div className="row g-3">
        <div className="col-md-6"><Field label="Name" req><input className="form-control pm-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field></div>
        <div className="col-md-6"><Field label="Folder"><select className="form-select pm-input" value={f.folder} onChange={(e) => setF({ ...f, folder: e.target.value })}>{["Collections", "Invoicing", "Care", "Growth"].map((x) => <option key={x}>{x}</option>)}</select></Field></div>
        <div className="col-12"><Field label="Channel"><div className="pm-mode-tabs">{["WhatsApp", "Email", "SMS"].map((ch) => <button key={ch} className={cls("pm-mode-tab", f.channel === ch && "pm-mode-on")} onClick={() => setF({ ...f, channel: ch })}>{ch}</button>)}</div></Field></div>
        <div className="col-12"><Field label="Body" req><textarea className="form-control pm-input" rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field></div>
      </div>
      <div className="pm-cyan-note">Merge fields: {"{name}"} {"{invoice}"} {"{amount}"} {"{due}"} — resolved per recipient.</div>
    </Modal>
  );
}
