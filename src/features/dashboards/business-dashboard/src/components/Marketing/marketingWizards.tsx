import { useState } from "react";
import { CHANNELS, TEMPLATES, fmtKES } from "./data";
import { useStore } from "./store";
import { Badge, Chip, Field, Modal, Thumb, WizardShell } from "./ui";

/* ==================================================================
   CAMPAIGN WIZARD — 5 steps
   Goal & audience → Channel & content → Budget & schedule → Review → Launch
================================================================== */
export function CampaignWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { createCampaign, segments, addSegment, openModal, toast } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(String(payload.name ?? ""));
  const [goal, setGoal] = useState("Drive sales");
  const [audience, setAudience] = useState(segments[5].id);
  const [newSegName, setNewSegName] = useState("");
  const [channels, setChannels] = useState<Set<string>>(new Set(["whatsapp"]));
  const [msg, setMsg] = useState("");
  const [sms, setSms] = useState("");
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [budget, setBudget] = useState("5000");
  const [timing, setTiming] = useState<"now" | "later">("later");
  const [when, setWhen] = useState("Fri 17:00 — best time");
  const [autoOpt, setAutoOpt] = useState(true);

  const seg = segments.find((s) => s.id === audience);
  const reach = seg?.count ?? 0;
  const selChans = CHANNELS.filter((c) => channels.has(c.id));
  const cost = selChans.reduce((a, c) => a + c.price * reach, 0);
  const budgetNum = Number(budget) || 0;
  const affordable = cost <= budgetNum;

  const steps = [
    { label: "Goal & audience", icon: "bi-crosshair" },
    { label: "Channel & content", icon: "bi-chat-square-text" },
    { label: "Budget & schedule", icon: "bi-wallet2" },
    { label: "Review", icon: "bi-check2-circle" },
    { label: "Launch", icon: "bi-rocket-takeoff" },
  ];

  return (
    <Modal open onClose={onClose} title="New marketing campaign" subtitle="5 steps · audience-first · priced per channel" icon="bi-megaphone" size="lg" hideClose
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary me-auto" onClick={() => { toast("Campaign saved as Draft — find it in the Campaigns tab.", "info", "Saved as draft"); onClose(); }}>
            Save as Draft
          </button>
          {step > 0 && step < 4 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 4 ? (
            <button type="button" className="btn btn-primary"
              disabled={(step === 0 && (!name.trim() || !seg)) || (step === 1 && channels.size === 0 && !msg && !sms && !emailBody) || (step === 2 && !affordable)}
              onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              const id = createCampaign({
                name, goal, emoji: "📣", channel: selChans.map((c) => c.name).join(" + "),
                audience: seg?.name ?? "Custom", audienceCount: reach,
                status: timing === "now" ? "Active" : "Scheduled", cost: Math.round(cost),
              });
              toast(`${id} ${timing === "now" ? "launched" : "scheduled"} — ${selChans.map((c) => c.name).join(" + ")} to ${reach.toLocaleString()} contacts.`, "success", timing === "now" ? "Campaign live" : "Campaign scheduled");
              onClose();
              openModal("campaignDrawer", { id });
            }}>
              <i className="bi bi-rocket-takeoff me-1" /> {timing === "now" ? "Launch now" : "Schedule launch"}
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={steps} current={step} onStep={(i) => i < step && setStep(i)}>
        {/* STEP 1 — GOAL & AUDIENCE */}
        {step === 0 && (
          <div className="row g-3">
            <Field label="Campaign name *" className="col-12">
              <input className="form-control" placeholder="e.g. End-of-Month Clearance" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <div className="col-12">
              <label className="form-label">Goal</label>
              <div className="d-flex gap-2 flex-wrap">
                {["Drive sales", "Grow followers", "Win back customers", "Announce products", "Loyalty", "Referrals"].map((g) => (
                  <Chip key={g} on={goal === g} onClick={() => setGoal(g)}>{g}</Chip>
                ))}
              </div>
            </div>
            <Field label="Audience" className="col-md-8" hint={`Estimated reach: ${reach.toLocaleString()} contacts`}>
              <select className="form-select" value={audience} onChange={(e) => setAudience(e.target.value)}>
                {segments.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name} — {s.count.toLocaleString()}</option>)}
              </select>
            </Field>
            <Field label="Or create a new segment" className="col-md-4">
              <div className="input-group">
                <input className="form-control" placeholder="Segment name" value={newSegName} onChange={(e) => setNewSegName(e.target.value)} />
                <button type="button" className="btn btn-outline-primary" disabled={!newSegName.trim()} onClick={() => { const id = addSegment({ name: newSegName, emoji: "🎯", desc: "New segment", rules: ["Custom"] }); setAudience(id); setNewSegName(""); toast("Segment created & selected.", "success", "Segment added"); }}>
                  <i className="bi bi-plus-lg" />
                </button>
              </div>
            </Field>
            {seg && (
              <div className="col-12">
                <div className="pm-note soft"><i className="bi bi-people me-1" /><b>{seg.name}</b>: {seg.desc} — rules: {seg.rules.join(" · ")}.</div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — CHANNEL & CONTENT */}
        {step === 1 && (
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Channels</label>
              <div className="d-flex flex-wrap gap-2">
                {CHANNELS.map((c) => (
                  <Chip key={c.id} on={channels.has(c.id)} onClick={() => setChannels((s) => { const n = new Set(s); if (n.has(c.id)) n.delete(c.id); else n.add(c.id); return n; })}>
                    <i className={`bi ${c.icon} me-1`} /> {c.name}
                  </Chip>
                ))}
              </div>
              <div className="pm-prod-meta mt-1">{selChans.map((c) => `${c.name} ${fmtKES(Math.round(c.price * reach))}`).join(" · ")} at {reach.toLocaleString()} contacts</div>
            </div>
            <div className="col-12">
              <label className="form-label">Quick fill from template</label>
              <div className="d-flex gap-1 flex-wrap">
                {TEMPLATES.slice(0, 4).map((t) => (
                  <button key={t.id} type="button" className="pm-chip" onClick={() => { setMsg(t.text); setSms(t.text); setEmailBody(t.text); setSubject(t.name); }}>
                    {t.icon} {t.name}
                  </button>
                ))}
              </div>
            </div>
            {channels.has("whatsapp") && (
              <Field label="WhatsApp message" className="col-12">
                <textarea className="form-control" rows={2} placeholder="⚡ {{first_name}}, your offer inside…" value={msg} onChange={(e) => setMsg(e.target.value)} />
                <div className="pm-wa-preview mt-2">
                  <div className="pm-wa-head"><i className="bi bi-whatsapp" /> WhatsApp Business</div>
                  <div className="pm-wa-bubble">{msg || "Your message preview appears here — variables like {{first_name}} personalise per customer."}</div>
                </div>
              </Field>
            )}
            {channels.has("sms") && (
              <Field label="SMS body" className="col-md-6" hint={`${sms.length}/160 characters · ${sms.length > 160 ? 2 : 1} SMS`}>
                <textarea className="form-control" rows={2} value={sms} onChange={(e) => setSms(e.target.value)} />
              </Field>
            )}
            {channels.has("email") && (
              <Field label="Email subject" className="col-md-6">
                <input className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </Field>
            )}
            {channels.has("email") && (
              <Field label="Email body" className="col-12">
                <textarea className="form-control" rows={2} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
              </Field>
            )}
            {(channels.has("instagram") || channels.has("tiktok")) && (
              <div className="col-12"><div className="pm-note soft"><i className="bi bi-instagram me-1" />Social posts for this campaign are drafted in the Social Composer — you can attach them after launch.</div></div>
            )}
          </div>
        )}

        {/* STEP 3 — BUDGET & SCHEDULE */}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Budget (KES)" className="col-md-6">
              <div className="input-group"><span className="input-group-text">KES</span>
                <input type="number" min={0} className="form-control" value={budget} onChange={(e) => setBudget(e.target.value)} />
              </div>
            </Field>
            <div className="col-md-6">
              <div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: affordable ? "var(--pm-green-soft)" : "#fee4e2" }}>
                <div className="pm-kpi-label">Send cost at {reach.toLocaleString()} contacts</div>
                <b style={{ color: affordable ? "var(--pm-green-dark)" : "var(--pm-danger)" }}>{fmtKES(cost)}</b>
                {!affordable && <div className="pm-prod-meta">Over budget — raise budget or trim channels.</div>}
              </div>
            </div>
            <div className="col-12">
              <label className="form-label">Timing</label>
              <div className="d-flex gap-2 flex-wrap">
                <Chip on={timing === "now"} onClick={() => setTiming("now")}><i className="bi bi-play-fill me-1" /> Send now</Chip>
                <Chip on={timing === "later"} onClick={() => setTiming("later")}><i className="bi bi-calendar3 me-1" /> Schedule</Chip>
              </div>
            </div>
            {timing === "later" && (
              <Field label="Send time" className="col-md-6">
                <select className="form-select" value={when} onChange={(e) => setWhen(e.target.value)}>
                  <option>Fri 17:00 — best time</option>
                  <option>Tue 09:00 — morning commute</option>
                  <option>Wed 12:30 — lunch break</option>
                  <option>Sat 10:00 — weekend browsing</option>
                  <option>Custom…</option>
                </select>
              </Field>
            )}
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="autoOpt" checked={autoOpt} onChange={(e) => setAutoOpt(e.target.checked)} />
                <label className="form-check-label" htmlFor="autoOpt"><b style={{ fontSize: "0.84rem" }}>Auto-optimize</b><div className="pm-prod-meta">Shift budget to the best-performing channel mid-campaign.</div></label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — REVIEW */}
        {step === 3 && (
          <div>
            <div className="row g-2 mb-3">
              {[
                { l: "Campaign", v: name || "—" },
                { l: "Goal", v: goal },
                { l: "Audience", v: `${seg?.name} · ${reach.toLocaleString()} contacts` },
                { l: "Channels", v: selChans.map((c) => c.name).join(" + ") || "—" },
                { l: "Cost", v: fmtKES(cost) },
                { l: "Timing", v: timing === "now" ? "Immediately" : when },
              ].map((r) => (
                <div className="col-md-4 col-6" key={r.l}>
                  <div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                    <div className="pm-kpi-label">{r.l}</div>
                    <b style={{ fontSize: "0.84rem" }}>{r.v}</b>
                  </div>
                </div>
              ))}
            </div>
            <div className="pm-note soft"><i className="bi bi-shield-check me-1" />WhatsApp templates are pre-approved for your number. Sending paused if consent coverage drops below 95%.</div>
          </div>
        )}

        {/* STEP 5 — LAUNCH */}
        {step === 4 && (
          <div className="text-center py-3">
            <div style={{ fontSize: "3rem" }}>🚀</div>
            <h5 className="mt-2">Ready for {timing === "now" ? "launch" : "scheduling"}!</h5>
            <p className="pm-prod-meta">
              {timing === "now"
                ? `First wave hits ${reach.toLocaleString()} contacts in the next 15 minutes.`
                : `Locked in for ${when}. You can edit until 1 hour before send.`}
            </p>
            <div className="d-flex justify-content-center gap-2">
              <Badge tone="green">{seg?.count.toLocaleString()} reach</Badge>
              <Badge tone="blue">{fmtKES(cost)} budget</Badge>
              <Badge tone="violet">{selChans.length} channel(s)</Badge>
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   FLASH SALE WIZARD — 4 steps
================================================================== */
export function FlashSaleWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { launchFlashSale, openModal } = useStore();
  const products = [...Array(5)].map((_, i) => ({
    id: "f" + (i + 1), name: ["Handwoven Kiondo Basket", "Safari Blend Coffee 500g", "Kitui Wild Honey 500ml", "Maasai Beaded Bracelet Set", "Cold-Pressed Coconut Oil"][i],
    emoji: ["🧺", "☕", "🍯", "📿", "🥥"][i], price: [2450, 1850, 1250, 1150, 950][i], cost: [1180, 980, 720, 430, 520][i],
    stock: [27, 64, 41, 120, 88][i], sold30: [142, 214, 168, 188, 121][i],
    img: `https://images.pexels.com/photos/${["31653080", "37987695", "9106164", "32405949", "725998"][i]}/pexels-photo-${["31653080", "37987695", "9106164", "32405949", "725998"][i]}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=160&w=240`,
  }));
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Set<string>>(new Set(["f1", "f4"]));
  const [discount, setDiscount] = useState(20);
  const [start, setStart] = useState("Tomorrow 09:00");
  const [duration, setDuration] = useState("48 hours");
  const [cap, setCap] = useState("100 orders");
  const [code, setCode] = useState("MASHUJAA20");
  const [channel, setChannel] = useState("WhatsApp + SMS + Instagram");
  const chosen = products.filter((p) => sel.has(p.id));
  const marginLoss = chosen.reduce((a, p) => a + (p.price * discount) / 100 * (p.sold30 / 30), 0);

  return (
    <Modal open onClose={onClose} title="Flash sale builder" subtitle="4 steps · discounted products + promo code + announcement" icon="bi-lightning-charge" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={(step === 0 && chosen.length === 0) || (step === 2 && !code.trim())} onClick={() => setStep((s) => s + 1)}>
              Next step <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-warning" onClick={() => {
              launchFlashSale("Mashujaa Weekend Flash Sale", chosen.map((c) => c.name), discount, code.toUpperCase(), channel);
              onClose();
              openModal("campaignDrawer", { id: "CMP-024" });
            }}>
              <i className="bi bi-lightning-charge me-1" /> Launch sale
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Products & pricing", icon: "bi-box-seam" }, { label: "Duration & audience", icon: "bi-clock-history" }, { label: "Promo code & terms", icon: "bi-ticket-perforated" }, { label: "Preview & launch", icon: "bi-lightning-charge" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <label className="form-label mb-0">Discount %</label>
              {[10, 15, 20, 30, 50].map((d) => <Chip key={d} on={discount === d} onClick={() => setDiscount(d)}>{d}%</Chip>)}
              <span className="pm-prod-meta ms-auto">est. margin impact/day: −{fmtKES(Math.round(marginLoss))}</span>
            </div>
            {products.map((p) => {
              const salePrice = Math.round(p.price * (1 - discount / 100));
              const margin = Math.round(((salePrice - p.cost) / salePrice) * 100);
              return (
                <div key={p.id} className="d-flex align-items-center gap-2 py-2" style={{ borderBottom: "1px solid var(--pm-border)" }}>
                  <input className="form-check-input" type="checkbox" checked={sel.has(p.id)} onChange={() => setSel((s) => { const n = new Set(s); if (n.has(p.id)) n.delete(p.id); else n.add(p.id); return n; })} />
                  <Thumb img={p.img} emoji={p.emoji} size={36} />
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-semibold text-truncate" style={{ fontSize: "0.82rem" }}>{p.name}</div>
                    <div className="pm-prod-meta">{p.stock} in stock · {p.sold30} sold/30d</div>
                  </div>
                  <div className="text-end">
                    <div className="pm-prod-meta"><s>{fmtKES(p.price)}</s></div>
                    <b className={margin < 0 ? "text-danger" : "text-primary"}>{fmtKES(salePrice)}</b>
                  </div>
                  <Badge tone={margin < 15 ? "amber" : "green"}>{margin}% margin</Badge>
                </div>
              );
            })}
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Starts" className="col-md-4">
              <select className="form-select" value={start} onChange={(e) => setStart(e.target.value)}>
                <option>Today 18:00</option><option>Tomorrow 09:00</option><option>Fri 17:00 — best time</option><option>Custom…</option>
              </select>
            </Field>
            <Field label="Duration" className="col-md-4">
              <select className="form-select" value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option>24 hours</option><option>48 hours</option><option>This weekend</option><option>Custom…</option>
              </select>
            </Field>
            <Field label="Order cap" className="col-md-4">
              <select className="form-select" value={cap} onChange={(e) => setCap(e.target.value)}>
                <option>50 orders</option><option>100 orders</option><option>No cap</option>
              </select>
            </Field>
            <Field label="Audience" className="col-md-6">
              <select className="form-select">
                <option>All customers (4,820)</option><option>Loyalty members (1,284)</option><option>WhatsApp opted-in (1,284)</option><option>VIP only (47)</option>
              </select>
            </Field>
            <Field label="Announce via" className="col-md-6">
              <select className="form-select" value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option>WhatsApp + SMS + Instagram</option><option>WhatsApp only</option><option>Instagram + TikTok</option><option>All channels</option>
              </select>
            </Field>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Promo code" className="col-md-6" hint="Customers enter this at checkout.">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-hash" /></span>
                <input className="form-control text-uppercase" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
                <button type="button" className="btn btn-outline-secondary" onClick={() => setCode("MASHUJA" + Math.floor(10 + Math.random() * 89))}><i className="bi bi-shuffle" /></button>
              </div>
            </Field>
            <div className="col-12">
              <div className="d-flex gap-2 flex-wrap">
                <Chip on><i className="bi bi-check2 me-1" /> One use per customer</Chip>
                <Chip on><i className="bi bi-check2 me-1" /> Not combinable with other codes</Chip>
                <Chip on><i className="bi bi-check2 me-1" /> Applies to {chosen.length} product(s)</Chip>
              </div>
            </div>
            <div className="col-12">
              <div className="pm-note soft"><i className="bi bi-shield-check me-1" />Codes sync with the Products &amp; Store discounts engine — eTIMS receipts show the discount line automatically.</div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="pm-wa-preview mb-3">
              <div className="pm-wa-head"><i className="bi bi-whatsapp" /> Announcement preview</div>
              <div className="pm-wa-bubble">
                ⚡ FLASH SALE: {discount}% off {chosen.slice(0, 2).map((c) => c.name.split(" ").slice(0, 2).join(" ")).join(" & ")}
                {chosen.length > 2 ? ` +${chosen.length - 2} more` : ""}!<br />
                Code: <b>{code}</b> · {start} · {duration} · {cap}.<br />
                Shop: paymo.app/s/flash
              </div>
            </div>
            <div className="pm-note">
              <i className="bi bi-check2-circle me-1 text-primary" />Ready to launch: {chosen.length} product(s) at {discount}% off, code <b>{code}</b>, {start} for {duration} via {channel}.
            </div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   LOYALTY WIZARD — 4 steps
================================================================== */
export function LoyaltyWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { saveLoyalty, recordActivity, toast } = useStore();
  const [step, setStep] = useState(0);
  const [rate, setRate] = useState(10);
  const [tiersOn, setTiersOn] = useState(true);
  const [doubleDay, setDoubleDay] = useState("Friday");
  const [rules, setRules] = useState({ purchase: true, double: true, review: true, referral: true });
  const [rewards, setRewards] = useState([true, true, true, false]);
  const [welcome, setWelcome] = useState(true);

  return (
    <Modal open onClose={onClose} title="Loyalty program setup" subtitle="4 steps · points, tiers, earning rules & rewards" icon="bi-stars" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Next step <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              saveLoyalty({ pointsPerKes: rate, doublePointsDay: doubleDay });
              recordActivity("Loyalty program updated", "bi-stars");
              toast("Loyalty rules saved — 1,284 members updated instantly.", "success", "Program updated");
              onClose();
            }}>
              <i className="bi bi-check2-circle me-1" /> Save program
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Earning rate", icon: "bi-percent" }, { label: "Earning rules", icon: "bi-plus-circle" }, { label: "Rewards", icon: "bi-gift" }, { label: "Launch", icon: "bi-check2-circle" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <Field label="Points per KES spent" className="col-md-6" hint="1 point per KES 10 = 10% back in soft value. Standard: 5–20.">
              <div className="input-group"><span className="input-group-text">1 pt / KES</span>
                <input type="number" min={1} className="form-control" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
              </div>
            </Field>
            <Field label="Double-points day" className="col-md-6">
              <select className="form-select" value={doubleDay} onChange={(e) => setDoubleDay(e.target.value)}>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="tiersOn" checked={tiersOn} onChange={(e) => setTiersOn(e.target.checked)} />
                <label className="form-check-label" htmlFor="tiersOn"><b style={{ fontSize: "0.84rem" }}>Tiered membership</b><div className="pm-prod-meta">Bronze → Silver (500 pts) → Gold (2,500 pts). Gold = early access + free delivery.</div></label>
              </div>
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            {[
              { k: "purchase" as const, t: "Earn on every purchase", d: "1 pt per KES " + rate },
              { k: "double" as const, t: `Double points on ${doubleDay}s`, d: "Automated — no manual set-up" },
              { k: "review" as const, t: "Bonus for reviews", d: "50 pts per verified product review" },
              { k: "referral" as const, t: "Referral bonus", d: "100 pts when a referred friend orders" },
            ].map((r) => (
              <div key={r.k} className="d-flex align-items-center gap-2 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                <div className="flex-grow-1"><b style={{ fontSize: "0.84rem" }}>{r.t}</b><div className="pm-prod-meta">{r.d}</div></div>
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" checked={rules[r.k]} onChange={(e) => setRules((s) => ({ ...s, [r.k]: e.target.checked }))} />
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div>
            {[
              { id: 0, n: "KES 100 off next order", c: 500, d: "Auto-applied at till or checkout" },
              { id: 1, n: "Free same-day delivery", c: 400, d: "Nairobi · value KES 300" },
              { id: 2, n: "KES 500 voucher", c: 2000, d: "Store-wide, 90 days" },
              { id: 3, n: "VIP early access", c: 3000, d: "24h head-start on every drop" },
            ].map((r) => (
              <div key={r.id} className="d-flex align-items-center gap-2 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                <div className="flex-grow-1"><b style={{ fontSize: "0.84rem" }}>{r.n}</b><div className="pm-prod-meta">{r.d}</div></div>
                <Badge tone="amber">{r.c} pts</Badge>
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" checked={rewards[r.id]} onChange={(e) => setRewards((s) => s.map((x, i) => (i === r.id ? e.target.checked : x)))} />
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 3 && (
          <div>
            <div className="row g-2 mb-3">
              <div className="col-4"><div className="pm-card text-center py-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Earn rate</div><b>1 pt / KES {rate}</b></div></div>
              <div className="col-4"><div className="pm-card text-center py-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Members</div><b>1,284</b></div></div>
              <div className="col-4"><div className="pm-card text-center py-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Rewards live</div><b>{rewards.filter(Boolean).length}</b></div></div>
            </div>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" id="welcome" checked={welcome} onChange={(e) => setWelcome(e.target.checked)} />
              <label className="form-check-label" htmlFor="welcome"><b style={{ fontSize: "0.84rem" }}>Welcome bonus</b><div className="pm-prod-meta">100 pts on sign-up — members spend 2.3× more on average.</div></label>
            </div>
            <div className="pm-note"><i className="bi bi-shield-check me-1 text-primary" />Saving updates all 1,284 members instantly and syncs the rewards catalog to the storefront checkout.</div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   REFERRAL WIZARD — 3 steps
================================================================== */
export function ReferralWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { recordActivity, toast } = useStore();
  const [step, setStep] = useState(0);
  const [rewardType, setRewardType] = useState<"points" | "cash" | "percent">("points");
  const [rewardVal, setRewardVal] = useState("100");
  const [friendReward, setFriendReward] = useState("KES 200 off first order");
  const [cap, setCap] = useState("10 referrals / month");
  const [channels, setChannels] = useState({ whatsapp: true, sms: true, social: true });
  return (
    <Modal open onClose={onClose} title="Referral program" subtitle="3 steps · turn your happiest customers into marketers" icon="bi-people" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Next <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              recordActivity("Referral program updated", "bi-people");
              toast("Referral 2.0 updated — 96 active participants now see the new rewards.", "success", "Program updated");
              onClose();
            }}>
              <i className="bi bi-check2-circle me-1" /> Save program
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Rewards", icon: "bi-gift" }, { label: "Sharing channels", icon: "bi-share" }, { label: "Launch", icon: "bi-rocket-takeoff" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Referrer earns</label>
              <div className="d-flex gap-2 flex-wrap">
                <Chip on={rewardType === "points"} onClick={() => setRewardType("points")}>Points</Chip>
                <Chip on={rewardType === "cash"} onClick={() => setRewardType("cash")}>Cash credit</Chip>
                <Chip on={rewardType === "percent"} onClick={() => setRewardType("percent")}>% of sale</Chip>
              </div>
            </div>
            <Field label="Reward value" className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">{rewardType === "points" ? "pts" : rewardType === "cash" ? "KES" : "%"}</span>
                <input type="number" min={1} className="form-control" value={rewardVal} onChange={(e) => setRewardVal(e.target.value)} />
              </div>
            </Field>
            <Field label="Friend gets" className="col-md-6">
              <select className="form-select" value={friendReward} onChange={(e) => setFriendReward(e.target.value)}>
                <option>KES 200 off first order</option>
                <option>10% off first order</option>
                <option>Free delivery + 5% off</option>
                <option>KES 500 welcome voucher</option>
              </select>
            </Field>
            <Field label="Cap" className="col-md-6">
              <select className="form-select" value={cap} onChange={(e) => setCap(e.target.value)}>
                <option>10 referrals / month</option><option>20 referrals / month</option><option>Unlimited</option>
              </select>
            </Field>
          </div>
        )}
        {step === 1 && (
          <div>
            {[
              { k: "whatsapp" as const, t: "WhatsApp share button", d: "Every member gets a personal link in their loyalty account", icon: "bi-whatsapp" },
              { k: "sms" as const, t: "SMS invite on delivery", d: "Auto-sent after first order: “Enjoyed it? Share & earn”", icon: "bi-chat-left-text" },
              { k: "social" as const, t: "Instagram / TikTok stories", d: "Share cards with a scannable QR to your store", icon: "bi-instagram" },
            ].map((r) => (
              <div key={r.k} className="d-flex align-items-center gap-2 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 10 }}>
                <i className={`bi ${r.icon}`} style={{ color: "var(--pm-green-dark)" }} />
                <div className="flex-grow-1"><b style={{ fontSize: "0.84rem" }}>{r.t}</b><div className="pm-prod-meta">{r.d}</div></div>
                <div className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" checked={channels[r.k]} onChange={(e) => setChannels((s) => ({ ...s, [r.k]: e.target.checked }))} />
                </div>
              </div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="pm-card mb-3 text-center" style={{ background: "var(--pm-green-soft)", border: "none" }}>
              <div style={{ fontSize: "1.6rem" }}>🤝</div>
              <b>Referrer gets {rewardVal} {rewardType === "points" ? "points" : rewardType === "cash" ? "KES credit" : "% commission"} · friend gets {friendReward}</b>
              <div className="pm-prod-meta mt-1">{cap} · shared via {Object.entries(channels).filter(([, v]) => v).map(([k]) => k).join(" + ")}</div>
            </div>
            <div className="pm-note"><i className="bi bi-lightbulb me-1" />Referrals already cut your acquisition cost 23% (KES 232 → 178). With these settings we project KES 152 within 60 days.</div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   A/B TEST WIZARD — 4 steps
================================================================== */
export function ABTestWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { startABTest, toast } = useStore();
  const [step, setStep] = useState(0);
  const [variable, setVariable] = useState("WhatsApp opener");
  const [name, setName] = useState("January offer opener");
  const [a, setA] = useState("JANUARY15 — 15% off everything!");
  const [b, setB] = useState("We made you a special offer 👀");
  const [split, setSplit] = useState("20% of segment");
  const [duration, setDuration] = useState("5 days");
  return (
    <Modal open onClose={onClose} title="A/B test builder" subtitle="4 steps · find what makes your audience click" icon="bi-award" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 3 ? (
            <button type="button" className="btn btn-primary" disabled={(step === 1 && (!a.trim() || !b.trim()))} onClick={() => setStep((s) => s + 1)}>
              Next <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => {
              startABTest(name, variable, a, b);
              toast(`${name} is running — winner auto-rolls to the remaining audience.`, "success", "Test started");
              onClose();
            }}>
              <i className="bi bi-play-fill me-1" /> Start test
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Variable", icon: "bi-sliders" }, { label: "Variants A & B", icon: "bi-123" }, { label: "Audience & split", icon: "bi-people" }, { label: "Schedule", icon: "bi-calendar3" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div className="row g-3">
            <Field label="Test name" className="col-md-8">
              <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="What are you testing?" className="col-md-4">
              <select className="form-select" value={variable} onChange={(e) => setVariable(e.target.value)}>
                <option>WhatsApp opener</option><option>Offer amount</option><option>Email subject</option><option>Send time</option><option>Button wording</option>
              </select>
            </Field>
            <div className="col-12"><div className="pm-note soft"><i className="bi bi-lightbulb me-1" />One variable at a time = clean results. Your last test (AB-09) lifted opens 38%.</div></div>
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <Field label="Variant A" className="col-md-6">
              <textarea className="form-control" rows={3} value={a} onChange={(e) => setA(e.target.value)} />
              <div className="pm-wa-preview mt-2"><div className="pm-wa-bubble">{a}</div></div>
            </Field>
            <Field label="Variant B" className="col-md-6">
              <textarea className="form-control" rows={3} value={b} onChange={(e) => setB(e.target.value)} />
              <div className="pm-wa-preview mt-2"><div className="pm-wa-bubble">{b}</div></div>
            </Field>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Audience" className="col-md-6">
              <select className="form-select">
                <option>WhatsApp opted-in (1,284)</option>
                <option>All customers (4,820)</option>
                <option>VIP customers (47)</option>
              </select>
            </Field>
            <Field label="Test on" className="col-md-6">
              <select className="form-select" value={split} onChange={(e) => setSplit(e.target.value)}>
                <option>20% of segment</option><option>30% of segment</option><option>50% of segment</option>
              </select>
            </Field>
            <div className="col-12">
              <div className="pm-note">Split: 50/50 between A and B. The winner automatically sends to the remaining 80% — no manual rollout.</div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="row g-3">
            <Field label="Run for" className="col-md-6">
              <select className="form-select" value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option>3 days</option><option>5 days</option><option>7 days</option>
              </select>
            </Field>
            <Field label="Success metric" className="col-md-6">
              <select className="form-select">
                <option>Open rate</option><option>Click rate</option><option>Conversion rate</option><option>Revenue per recipient</option>
              </select>
            </Field>
            <div className="col-12"><div className="pm-note"><i className="bi bi-award me-1 text-primary" />Stats dashboard updates hourly — you'll get a WhatsApp ping when significance hits 95%.</div></div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   BROADCAST WIZARD — 3 steps
================================================================== */
export function BroadcastWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { segments, createCampaign, openModal, toast } = useStore();
  const [step, setStep] = useState(0);
  const [segment, setSegment] = useState(segments[3].id);
  const [template, setTemplate] = useState(TEMPLATES[0].text);
  const [msg, setMsg] = useState(TEMPLATES[0].text);
  const [timing, setTiming] = useState("Fri 17:00 — best time");
  const seg = segments.find((s) => s.id === segment);
  const smsParts = Math.max(1, Math.ceil(msg.length / 160));
  const cost = seg ? Math.round(seg.count * 0.55) : 0;

  return (
    <Modal open onClose={onClose} title="WhatsApp broadcast" subtitle="3 steps · consent-safe, template-approved" icon="bi-whatsapp" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" disabled={(step === 1 && msg.trim().length < 10)} onClick={() => setStep((s) => s + 1)}>
              Next <i className="bi bi-arrow-right ms-1" />
            </button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              const id = createCampaign({ name: "Broadcast: " + (template || "message").split(" ").slice(0, 4).join(" "), channel: "WhatsApp", goal: "Drive sales", emoji: "💬", audience: seg?.name ?? "Segment", audienceCount: seg?.count ?? 0, status: "Scheduled", cost });
              toast(`Broadcast scheduled for ${timing} — ${seg?.count.toLocaleString()} recipients.`, "success", "Broadcast queued");
              onClose();
              openModal("campaignDrawer", { id });
            }}>
              <i className="bi bi-calendar-check me-1" /> Schedule broadcast
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Audience", icon: "bi-people" }, { label: "Message", icon: "bi-chat-square-text" }, { label: "Schedule", icon: "bi-calendar3" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            {segments.slice(0, 4).map((s) => (
              <button key={s.id} type="button" className={`pm-theme-card text-start p-2 w-100 mb-2 ${segment === s.id ? "sel" : ""}`} onClick={() => setSegment(s.id)}>
                <div className="d-flex align-items-center gap-2">
                  <span>{s.emoji}</span>
                  <b style={{ fontSize: "0.84rem" }} className="flex-grow-1">{s.name}</b>
                  <Badge tone="slate">{s.count.toLocaleString()}</Badge>
                  {segment === s.id && <i className="bi bi-check-circle-fill text-primary" />}
                </div>
                <div className="pm-prod-meta">{s.desc}</div>
              </button>
            ))}
            <div className="pm-note soft"><i className="bi bi-shield-check me-1" />Only WhatsApp-consented numbers receive broadcasts — compliance is automatic.</div>
          </div>
        )}
        {step === 1 && (
          <div>
            <Field label="Start from template" className="mb-2">
              <div className="d-flex gap-1 flex-wrap">
                {TEMPLATES.map((t) => (
                  <button key={t.id} type="button" className={`pm-chip ${template === t.text ? "on" : ""}`} onClick={() => { setTemplate(t.text); setMsg(t.text); }}>
                    {t.icon} {t.name}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Message" hint={`${msg.length} chars · ${smsParts} SMS equivalent · est. cost ${fmtKES(cost)}`}>
              <textarea className="form-control" rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} />
            </Field>
            <div className="pm-wa-preview mt-2">
              <div className="pm-wa-head"><i className="bi bi-whatsapp" /> WhatsApp Business preview</div>
              <div className="pm-wa-bubble">{msg}</div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Send time" className="col-md-6">
              <select className="form-select" value={timing} onChange={(e) => setTiming(e.target.value)}>
                <option>Fri 17:00 — best time</option><option>Now</option><option>Tue 09:00</option><option>Custom…</option>
              </select>
            </Field>
            <div className="col-md-6">
              <div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
                <div className="pm-kpi-label">Recipients</div>
                <b>{seg?.count.toLocaleString()}</b> <span className="pm-prod-meta">· cost {fmtKES(cost)}</span>
              </div>
            </div>
            <div className="col-12"><div className="pm-note"><i className="bi bi-check2-circle me-1 text-primary" />Rate limits respected: broadcast drips over ~30 min to avoid WhatsApp blocks.</div></div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}

/* ==================================================================
   FEEDBACK CAMPAIGN — 3 steps
================================================================== */
export function FeedbackWizardModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { segments, createCampaign, toast } = useStore();
  const [step, setStep] = useState(0);
  const [segment, setSegment] = useState(segments[0].id);
  const [qType, setQType] = useState<"nps" | "stars" | "open">("nps");
  const [incentive, setIncentive] = useState(true);
  const [timing, setTiming] = useState("3 days after delivery");
  const seg = segments.find((s) => s.id === segment);
  return (
    <Modal open onClose={onClose} title="Feedback campaign" subtitle="3 steps · turn customers into your product team" icon="bi-chat-square-heart" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          {step > 0 && <button type="button" className="btn btn-outline-secondary" onClick={() => setStep((s) => s - 1)}><i className="bi bi-arrow-left me-1" /> Back</button>}
          {step < 2 ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Next <i className="bi bi-arrow-right ms-1" /></button>
          ) : (
            <button type="button" className="btn btn-success" onClick={() => {
              createCampaign({ name: "Feedback — " + seg?.name, channel: "WhatsApp + Email", goal: "Feedback", emoji: "💬", audience: seg?.name ?? "Segment", audienceCount: seg?.count ?? 0, status: "Scheduled", cost: 300 });
              toast(`Feedback campaign scheduled (${timing}) — responses flow into Reviews & NPS.`, "success", "Campaign scheduled");
              onClose();
            }}>
              <i className="bi bi-calendar-check me-1" /> Schedule campaign
            </button>
          )}
        </>
      }
    >
      <WizardShell steps={[{ label: "Who to ask", icon: "bi-people" }, { label: "Question", icon: "bi-question-circle" }, { label: "Schedule", icon: "bi-calendar3" }]} current={step} onStep={(i) => i < step && setStep(i)}>
        {step === 0 && (
          <div>
            {segments.slice(0, 3).map((s) => (
              <button key={s.id} type="button" className={`pm-theme-card text-start p-2 w-100 mb-2 ${segment === s.id ? "sel" : ""}`} onClick={() => setSegment(s.id)}>
                <div className="d-flex align-items-center gap-2">
                  <span>{s.emoji}</span>
                  <b style={{ fontSize: "0.84rem" }} className="flex-grow-1">{s.name}</b>
                  <Badge tone="slate">{s.count.toLocaleString()}</Badge>
                  {segment === s.id && <i className="bi bi-check-circle-fill text-primary" />}
                </div>
                <div className="pm-prod-meta">{s.desc}</div>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Question type</label>
              <div className="d-flex gap-2 flex-wrap">
                <Chip on={qType === "nps"} onClick={() => setQType("nps")}>NPS 0–10</Chip>
                <Chip on={qType === "stars"} onClick={() => setQType("stars")}>Star rating</Chip>
                <Chip on={qType === "open"} onClick={() => setQType("open")}>Open text</Chip>
              </div>
            </div>
            <div className="col-12">
              <div className="pm-wa-preview">
                <div className="pm-wa-head"><i className="bi bi-whatsapp" /> Message preview</div>
                <div className="pm-wa-bubble">
                  Hi {"{first_name}"}! {qType === "nps" ? "How likely are you to recommend Soko Sanaa to a friend? (0–10)" : qType === "stars" ? "How was your {product}? ⭐⭐⭐⭐⭐" : "What should we make or fix next? We read everything."}
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="inc" checked={incentive} onChange={(e) => setIncentive(e.target.checked)} />
                <label className="form-check-label" htmlFor="inc"><b style={{ fontSize: "0.84rem" }}>Incentivize with 50 loyalty points</b><div className="pm-prod-meta">Doubles response rates — costs ~KES 60/response in points liability.</div></label>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="row g-3">
            <Field label="Trigger" className="col-md-6">
              <select className="form-select" value={timing} onChange={(e) => setTiming(e.target.value)}>
                <option>3 days after delivery</option><option>Immediately after order</option><option>7 days after delivery</option><option>Monthly to VIPs</option>
              </select>
            </Field>
            <div className="col-12"><div className="pm-note"><i className="bi bi-graph-up me-1" />NPS is 8.2 today — responses from {seg?.count.toLocaleString()} members keep it fresh.</div></div>
          </div>
        )}
      </WizardShell>
    </Modal>
  );
}
