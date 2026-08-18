import { useState } from "react";
import { fmtKES } from "./data";
import type { Channel, NotifCategory, NotifPriority } from "./data";
import { useStore } from "./store";
import { Badge, Chip, Field, Modal, WizardShell } from "./ui";

const CHANNEL_META: { id: Channel; label: string; icon: string; d: string }[] = [
  { id: "whatsapp", label: "WhatsApp", icon: "bi-whatsapp", d: "Fastest open rate (85%) — great for urgent money alerts" },
  { id: "sms", label: "SMS", icon: "bi-chat-left-text", d: "Works on feature phones, KES 0.80 per message" },
  { id: "email", label: "Email", icon: "bi-envelope", d: "Free, for reports & documents you'll revisit" },
  { id: "inapp", label: "In-app", icon: "bi-bell", d: "Always on — this feed, never sleeps" },
  { id: "push", label: "Push", icon: "bi-phone", d: "Phone notification for instant visibility" },
];

/* ==================================================================
   PREFERENCES WIZARD — 5 steps
================================================================== */
export function PreferencesWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { prefs, toggleChannel, setPriorityMin, toggleDigests, recordActivity, toast } = useStore();
  const [step, setStep] = useState(0);
  const [selectedCat, setSelectedCat] = useState<NotifCategory>("Payments");
  const cat = prefs.find((p) => p.id === selectedCat) ?? prefs[0];

  const steps = [
    { label: "Categories", icon: "bi-tags" },
    { label: "Channels", icon: "bi-broadcast" },
    { label: "Priority floor", icon: "bi-filter" },
    { label: "Digests", icon: "bi-envelope-paper" },
    { label: "Review", icon: "bi-check2-circle" },
  ];

  return (
    <Modal open onClose={onClose} title="Notification preferences" subtitle="5 steps · decide what reaches you, where, and how loudly" icon="bi-sliders" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 4 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Next step <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              recordActivity("Notification preferences wizard saved", "bi-sliders");
              toast("Preferences saved — new alerts follow these rules immediately.", "success", "Preferences updated");
              onClose();
            }}>
              <i className="bi bi-check2-circle me-1" /> Save preferences
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={steps} current={step} onStep={(i) => i < step && setStep(i)}>
        {/* 1 — CATEGORIES */}
        {step === 0 && (
          <div>
            <div className="pm-kpi-label mb-2">Pick a category to configure (repeat for each)</div>
            {prefs.map((p) => (
              <button key={p.id} type="button" className={`pm-theme-card text-start p-2 w-100 mb-2 ${selectedCat === p.id ? "sel" : ""}`} onClick={() => setSelectedCat(p.id)}>
                <div className="d-flex align-items-center gap-2">
                  <span className="pm-kpi-icon" style={{ width: 32, height: 32, fontSize: "0.85rem", background: p.color + "22", color: p.color }}><i className={`bi ${p.icon}`} /></span>
                  <div className="flex-grow-1">
                    <b style={{ fontSize: "0.84rem" }}>{p.name}</b>
                    <div className="pm-prod-meta">{p.count} recent · min {p.priorityMin} · {p.muted ? "MUTED" : p.digests ? "digest on" : "instant"}</div>
                  </div>
                  {selectedCat === p.id && <i className="bi bi-check-circle-fill text-primary" />}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 2 — CHANNELS */}
        {step === 1 && (
          <div>
            <div className="pm-note mb-3"><i className="bi bi-broadcast me-1" />Where should <b>{cat.name}</b> alerts go?</div>
            {CHANNEL_META.map((c) => (
              <div key={c.id} className="d-flex align-items-center gap-3 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                <i className={`bi ${c.icon}`} style={{ fontSize: "1.2rem", color: "var(--pm-green-dark)" }} />
                <div className="flex-grow-1">
                  <b style={{ fontSize: "0.84rem" }}>{c.label}</b>
                  <div className="pm-prod-meta">{c.d}</div>
                </div>
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" checked={cat.channels[c.id]} onChange={(e) => toggleChannel(cat.id, c.id, e.target.checked)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3 — PRIORITY FLOOR */}
        {step === 2 && (
          <div>
            <div className="pm-note mb-3"><i className="bi bi-filter me-1" />Only send <b>{cat.name}</b> alerts at or above:</div>
            <div className="d-flex gap-2 flex-wrap mb-3">
              {(["Routine", "Important", "Urgent"] as NotifPriority[]).map((p) => (
                <Chip key={p} on={cat.priorityMin === p} onClick={() => setPriorityMin(cat.id, p)}>{p}</Chip>
              ))}
            </div>
            <div className="pm-note soft">
              {cat.priorityMin === "Routine" && <><i className="bi bi-info-circle me-1" />Everything arrives — the noisiest option.</>}
              {cat.priorityMin === "Important" && <><i className="bi bi-info-circle me-1" />Routine noise stays in the app; real issues ping you.</>}
              {cat.priorityMin === "Urgent" && <><i className="bi bi-info-circle me-1" />Only fire-alarm level events reach you. Recommended for high-volume categories.</>}
            </div>
          </div>
        )}

        {/* 4 — DIGESTS */}
        {step === 3 && (
          <div>
            <div className="d-flex align-items-center gap-2 p-3 mb-2" style={{ border: "2px solid " + (cat.digests ? "var(--pm-green)" : "var(--pm-border)"), borderRadius: 12 }}>
              <div className="form-check form-switch mb-0">
                <input className="form-check-input" type="checkbox" checked={cat.digests} onChange={(e) => toggleDigests(cat.id, e.target.checked)} />
              </div>
              <div className="flex-grow-1">
                <b style={{ fontSize: "0.86rem" }}>Bundle into daily digest</b>
                <div className="pm-prod-meta">One summary email at 08:00 instead of 20 individual pings. Urgent alerts still break through.</div>
              </div>
              {cat.digests && <Badge tone="green">On</Badge>}
            </div>
            {cat.digests && (
              <div className="pm-note soft"><i className="bi bi-envelope-paper me-1" />Included in the daily digest: a count of alerts per category, top 3 by importance, and links to act.</div>
            )}
          </div>
        )}

        {/* 5 — REVIEW */}
        {step === 4 && (
          <div>
            <div className="pm-note mb-3"><i className="bi bi-check2-circle me-1 text-primary" />Summary of your choices:</div>
            {prefs.map((p) => {
              const channels = CHANNEL_META.filter((c) => p.channels[c.id]).map((c) => c.label);
              return (
                <div key={p.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                  <i className={`bi ${p.icon}`} style={{ color: p.color, width: 20 }} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <b style={{ fontSize: "0.8rem" }}>{p.name}</b>
                    <div className="pm-prod-meta text-truncate">
                      {p.muted ? "Muted" : channels.length ? channels.join(" · ") : "No channels!"} · min {p.priorityMin}{p.digests ? " · digest" : ""}
                    </div>
                  </div>
                  <button type="button" className="btn btn-link btn-sm p-0 text-primary" style={{ fontSize: "0.7rem" }} onClick={() => setStep(1)}>Edit</button>
                </div>
              );
            })}
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   ALERT RULE WIZARD — 4 steps
================================================================== */
export function AlertRuleWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { createRule, toast } = useStore();
  const [step, setStep] = useState(0);
  const [trigger, setTrigger] = useState("Payment received");
  const [threshold, setThreshold] = useState("100000");
  const [category, setCategory] = useState<NotifCategory>("Payments");
  const [channels, setChannels] = useState<Set<Channel>>(new Set(["whatsapp", "inapp"]));
  const [recipients, setRecipients] = useState<string[]>(["You"]);
  const [name, setName] = useState("");
  const [dedupe, setDedupe] = useState(true);
  const triggers = ["Payment received", "Dispute / reversal claim", "SKU hits reorder level", "Compliance doc expires", "Invoice past due date", "Sync error", "Large payout sent"];

  const eligibleRecipients = ["You", "Mwangi Kamau", "Achieng Otieno", "Brian Kim", "Grace Njeri"];

  return (
    <Modal open onClose={onClose} title="Create alert rule" subtitle="4 steps · custom triggers with thresholds, channels & recipients" icon="bi-plus-circle" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={step === 2 && channels.size === 0} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              const ruleName = name.trim() || `${trigger} ${Number(threshold) ? "over " + fmtKES(Number(threshold)) : ""}`;
              createRule({ name: ruleName, trigger, threshold: Number(threshold) || 0, currency: trigger === "SKU hits reorder level" ? "units" : trigger === "Compliance doc expires" ? "days" : "KES", category, channels: [...channels], recipients, status: "Active" });
              toast(`Rule "${ruleName}" live — will fire immediately when conditions are met.`, "success", "Alert rule created");
              onClose();
            }}>
              <i className="bi bi-check2-circle me-1" /> Activate rule
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[
        { label: "Trigger", icon: "bi-lightning-charge" },
        { label: "Threshold", icon: "bi-sliders" },
        { label: "Channels", icon: "bi-broadcast" },
        { label: "Recipients", icon: "bi-people" },
      ]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="d-flex flex-column gap-2">
            {triggers.map((t) => (
              <button key={t} type="button" className={`pm-theme-card text-start p-2 ${trigger === t ? "sel" : ""}`} onClick={() => {
                setTrigger(t);
                setCategory(t === "Payment received" || t === "Dispute / reversal claim" || t === "Large payout sent" ? "Payments" : t === "SKU hits reorder level" ? "Inventory" : t === "Compliance doc expires" ? "Compliance" : t === "Sync error" ? "System" : "Sales");
              }}>
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${t.includes("Payment") || t.includes("payout") ? "bi-cash-coin" : t.includes("Dispute") ? "bi-shield-exclamation" : t.includes("SKU") ? "bi-box-seam" : t.includes("Compliance") ? "bi-shield-check" : t.includes("Sync") ? "bi-puzzle" : "bi-receipt"}`} style={{ color: "var(--pm-green-dark)" }} />
                  <b style={{ fontSize: "0.84rem" }}>{t}</b>
                  {trigger === t && <i className="bi bi-check-circle-fill text-primary ms-auto" />}
                </div>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Fire when above" className="col-md-6">
              <div className="input-group">
                <input type="number" min={0} className="form-control" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
                <span className="input-group-text">{trigger === "SKU hits reorder level" ? "units" : trigger === "Compliance doc expires" ? "days" : "KES"}</span>
              </div>
              <div className="d-flex gap-2 mt-2">
                {[10000, 50000, 100000, 500000].map((v) => <Chip key={v} on={Number(threshold) === v} onClick={() => setThreshold(String(v))}>{fmtKES(v)}</Chip>)}
              </div>
            </Field>
            <Field label="Rule name (optional)" className="col-md-6">
              <input className="form-control" placeholder="e.g. Big money alerts" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="dedupe" checked={dedupe} onChange={(e) => setDedupe(e.target.checked)} />
                <label className="form-check-label" htmlFor="dedupe"><b style={{ fontSize: "0.84rem" }}>De-duplicate repeats</b><div className="pm-prod-meta">Same trigger within 30 minutes sends once, not 40 times.</div></label>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-kpi-label mb-2">Deliver via</div>
            {CHANNEL_META.map((c) => (
              <div key={c.id} className="d-flex align-items-center gap-3 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                <i className={`bi ${c.icon}`} style={{ fontSize: "1.2rem", color: "var(--pm-green-dark)" }} />
                <b style={{ fontSize: "0.84rem" }} className="flex-grow-1">{c.label}</b>
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" checked={channels.has(c.id)} onChange={() => setChannels((s) => { const n = new Set(s); if (n.has(c.id)) n.delete(c.id); else n.add(c.id); return n; })} />
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="pm-kpi-label mb-2">Notify these people</div>
            {eligibleRecipients.map((r) => (
              <div key={r} className="d-flex align-items-center gap-2 p-2 mb-1" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                <div className="form-check mb-0"><input className="form-check-input" type="checkbox" checked={recipients.includes(r)} onChange={() => setRecipients((x) => x.includes(r) ? x.filter((y) => y !== r) : [...x, r])} /></div>
                <b style={{ fontSize: "0.84rem" }}>{r}</b>
                {r === "You" && <Badge tone="green" className="ms-auto">Always</Badge>}
              </div>
            ))}
            <div className="pm-note soft mt-3"><i className="bi bi-people me-1" />Team members receive via their own channel preferences — you choose who, they choose how.</div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   QUIET HOURS WIZARD — 3 steps
================================================================== */
export function QuietHoursWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { addQuietHour, toast } = useStore();
  const [step, setStep] = useState(0);
  const [label, setLabel] = useState("Nightly silence");
  const [days, setDays] = useState("Mon – Fri");
  const [start, setStart] = useState("22:00");
  const [end, setEnd] = useState("07:00");
  const [allowUrgent, setAllowUrgent] = useState(true);

  return (
    <Modal open onClose={onClose} title="Add quiet hours" subtitle="3 steps · silence routine pings without missing fires" icon="bi-moon" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Next <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              addQuietHour({ label: label || "Quiet hours", days, start, end, allowUrgent, active: true });
              toast(`Quiet hours "${label}" active — ${days} ${start}→${end}${allowUrgent ? ", urgent breaks through" : ""}.`, "success", "Quiet hours added");
              onClose();
            }}>
              <i className="bi bi-check2-circle me-1" /> Add window
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Schedule", icon: "bi-calendar3" }, { label: "Exceptions", icon: "bi-fire" }, { label: "Review", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <Field label="Label" className="col-md-6"><input className="form-control" placeholder="Nightly silence" value={label} onChange={(e) => setLabel(e.target.value)} /></Field>
            <Field label="Days" className="col-md-6">
              <select className="form-select" value={days} onChange={(e) => setDays(e.target.value)}>
                <option>Mon – Fri</option><option>Sat – Sun</option><option>Every day</option><option>Custom dates</option>
              </select>
            </Field>
            <Field label="From" className="col-md-6"><input type="time" className="form-control" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
            <Field label="Until" className="col-md-6"><input type="time" className="form-control" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
          </div>
        )}
        {step === 1 && (
          <div>
            <div className="d-flex align-items-center gap-2 p-3 mb-2" style={{ border: "2px solid " + (allowUrgent ? "var(--pm-green)" : "var(--pm-border)"), borderRadius: 12 }}>
              <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" checked={allowUrgent} onChange={(e) => setAllowUrgent(e.target.checked)} /></div>
              <div className="flex-grow-1">
                <b style={{ fontSize: "0.86rem" }}>Let Urgent alerts break through</b>
                <div className="pm-prod-meta">M-Pesa reversals, KRA deadlines, security blocks — the fires still reach you.</div>
              </div>
              {allowUrgent && <Badge tone="green">Recommended</Badge>}
            </div>
            <div className="pm-note soft"><i className="bi bi-fire me-1" />Without this, a 2am reversal claim would wait until morning — often too late.</div>
          </div>
        )}
        {step === 2 && (
          <div className="pm-note">
            <i className="bi bi-moon me-1" />{label} · {days} · {start} → {end} · urgent {allowUrgent ? "breaks through" : "is also muted ⚠️"}
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   DIGEST SCHEDULE MODAL
================================================================== */
export function DigestScheduleModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { digest, prefs, saveDigest, toggleDigests, toast, recordActivity } = useStore();
  const [d, setD] = useState({ ...digest });
  const digestCats = prefs.filter((p) => p.digests);
  return (
    <Modal open onClose={onClose} title="Daily digest schedule" subtitle="One summary email instead of twenty pings" icon="bi-envelope-paper"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => { saveDigest(d); recordActivity("Digest schedule updated", "bi-envelope-paper"); toast(`Digest ${d.enabled ? `on — ${d.frequency.toLowerCase()} at ${d.time} ${d.timezone}` : "paused"}.`, "success", "Digest saved"); onClose(); }}>
            <i className="bi bi-check2 me-1" /> Save schedule
          </button>
        </>
      }
    >
      <div className="d-flex align-items-center gap-2 p-3 mb-3" style={{ border: "1px solid var(--pm-border)", borderRadius: 12 }}>
        <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" checked={d.enabled} onChange={(e) => setD((x) => ({ ...x, enabled: e.target.checked }))} /></div>
        <b style={{ fontSize: "0.86rem" }}>Digest enabled</b>
      </div>
      <div className="row g-3">
        <Field label="Frequency" className="col-md-4">
          <select className="form-select" value={d.frequency} onChange={(e) => setD((x) => ({ ...x, frequency: e.target.value }))}>
            <option>Daily</option><option>Weekdays only</option><option>Weekly</option>
          </select>
        </Field>
        <Field label="Time" className="col-md-4"><input type="time" className="form-control" value={d.time} onChange={(e) => setD((x) => ({ ...x, time: e.target.value }))} /></Field>
        <Field label="Timezone" className="col-md-4"><input className="form-control" value={d.timezone} readOnly /></Field>
      </div>
      <div className="pm-kpi-label mt-3 mb-2">Categories bundled into the digest</div>
      {prefs.map((p) => (
        <div key={p.id} className="d-flex align-items-center gap-2 py-1">
          <i className={`bi ${p.icon}`} style={{ color: p.color, width: 20 }} />
          <span style={{ fontSize: "0.82rem" }} className="flex-grow-1">{p.name}</span>
          <div className="form-check form-switch mb-0"><input className="form-check-input" type="checkbox" checked={p.digests} onChange={(e) => toggleDigests(p.id, e.target.checked)} /></div>
        </div>
      ))}
      {digestCats.length === 0 && <div className="pm-prod-meta">No categories set to digest — toggle them on above.</div>}
    </Modal>
  );
}
