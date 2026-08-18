import { useState } from "react";
import { ATTRIBUTION, CHANNELS, IDEAS, LOYALTY, NPS, POSTS, REFERRAL, TEMPLATES, fmtKES } from "./data";
import { useStore } from "./store";
import { Badge, Chip, Drawer, Field, Modal, Spark, StatusBadge } from "./ui";

/* ==================================================================
   CAMPAIGN DRAWER — performance detail
================================================================== */
export function CampaignDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { campaigns, pauseCampaign, launchCampaign, duplicateCampaign, openModal, toast } = useStore();
  const c = campaigns.find((x) => x.id === String(payload.id));
  if (!c) return null;
  const openRate = c.sent ? Math.round((c.opened / c.sent) * 100) : 0;
  const ctr = c.opened ? Math.round((c.clicks / c.opened) * 100) : 0;
  const roi = c.cost ? (c.revenue / c.cost).toFixed(1) : "—";
  return (
    <Drawer open onClose={onClose} icon="bi-megaphone" title={c.name} subtitle={`${c.id} · ${c.channel} · ${c.date}`}>
      <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={c.status} />
        <Badge tone="slate">{c.goal}</Badge>
        <Badge tone="blue">{c.audience} · {c.audienceCount.toLocaleString()}</Badge>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Sent</div><b>{c.sent.toLocaleString()}</b></div></div>
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Open rate</div><b className="text-primary">{openRate}%</b></div></div>
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Click-through</div><b>{ctr}%</b></div></div>
        <div className="col-6"><div className="pm-card py-2 px-3" style={{ boxShadow: "none", background: "#fafbfd" }}><div className="pm-kpi-label">Conversions</div><b>{c.conversions}</b></div></div>
      </div>
      <div className="pm-card mb-3" style={{ boxShadow: "none", background: "var(--pm-green-soft)" }}>
        <div className="d-flex justify-content-between">
          <span><div className="pm-kpi-label">Revenue</div><b style={{ fontSize: "1.1rem" }}>{fmtKES(c.revenue)}</b></span>
          <span><div className="pm-kpi-label">Spend</div><b>{fmtKES(c.cost)}</b></span>
          <span><div className="pm-kpi-label">ROI</div><b className="text-primary" style={{ fontSize: "1.1rem" }}>{roi}×</b></span>
        </div>
      </div>
      <div className="pm-kpi-label mb-2">Conversion funnel</div>
      {[
        { l: "Sent / reached", v: c.sent },
        { l: "Opened / viewed", v: c.opened },
        { l: "Clicked", v: c.clicks },
        { l: "Purchased", v: c.conversions },
      ].map((f, i) => {
        const prev = [c.sent, c.sent, c.opened, c.clicks][i] || 1;
        const pct = Math.max(3, Math.round((f.v / (i === 0 ? c.audienceCount || 1 : prev)) * 100));
        return (
          <div key={f.l} className="mb-2">
            <div className="d-flex justify-content-between" style={{ fontSize: "0.76rem" }}>
              <span className="fw-semibold">{f.l}</span>
              <span className="pm-prod-meta">{f.v.toLocaleString()} ({i === 0 ? "100%" : Math.round((f.v / prev) * 100) + "%"})</span>
            </div>
            <div className="progress" style={{ height: 8 }}>
              <div className="progress-bar" style={{ width: `${pct}%`, background: ["#101828", "#12b76a", "#2e90fa", "#7a5af8"][i] }} />
            </div>
          </div>
        );
      })}
      <div className="row g-2 mt-3">
        {c.status === "Active" && (
          <div className="col-6"><button type="button" className="btn btn-outline-danger btn-sm w-100" onClick={() => { pauseCampaign(c.id); onClose(); }}><i className="bi bi-pause-fill me-1" /> Pause</button></div>
        )}
        {(c.status === "Paused" || c.status === "Draft") && (
          <div className="col-6"><button type="button" className="btn btn-success btn-sm w-100" onClick={() => { launchCampaign(c.id); onClose(); }}><i className="bi bi-play-fill me-1" /> Launch</button></div>
        )}
        <div className="col-6"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => {
          const copy = duplicateCampaign(c.id);
          toast(copy ? `${copy.id} created as Draft from ${c.id}.` : "Couldn't duplicate.", copy ? "success" : "warning", "Duplicated");
          onClose();
        }}><i className="bi bi-copy me-1" /> Duplicate</button></div>
        <div className="col-6"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => toast("Campaign report exported (PDF).", "info", "Export")}><i className="bi bi-download me-1" /> Report</button></div>
        <div className="col-6"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => { onClose(); openModal("campaignWizard", { name: c.name }); }}><i className="bi bi-pencil me-1" /> Edit</button></div>
      </div>
    </Drawer>
  );
}

/* ==================================================================
   SEGMENT BUILDER MODAL
================================================================== */
export function SegmentBuilderModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { segments, addSegment, toast } = useStore();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [rules, setRules] = useState([
    { id: 1, field: "Lifetime spend", op: ">", value: "10,000" },
    { id: 2, field: "Last purchase", op: "within", value: "30 days" },
  ]);
  const [estCount, setEstCount] = useState(0);
  return (
    <Modal open onClose={onClose} title="Segment builder" subtitle="Dynamic segments update automatically as customer data changes" icon="bi-people" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={!name.trim() || rules.length === 0} onClick={() => {
            const id = addSegment({ name: name.trim(), emoji, desc: rules.map((r) => `${r.field} ${r.op} ${r.value}`).join(" · "), rules: rules.map((r) => `${r.field} ${r.op} ${r.value}`) });
            toast(`Segment "${name}" created — ${id} will populate as data flows in.`, "success", "Segment created");
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Create segment
          </button>
        </>
      }
    >
      <div className="row g-3">
        <Field label="Segment name *" className="col-md-8">
          <input className="form-control" placeholder="e.g. Big basket spenders" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Emoji" className="col-md-4">
          <input className="form-control text-center" style={{ fontSize: "1.2rem" }} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
        </Field>
        {rules.map((r) => (
          <div className="col-12" key={r.id}>
            <div className="d-flex align-items-center gap-2">
              <select className="form-select" style={{ maxWidth: 190 }} value={r.field} onChange={(e) => setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, field: e.target.value } : x)))}>
                {["Lifetime spend", "Last purchase", "Order count", "Channel", "City", "Product category", "Loyalty tier"].map((f) => <option key={f}>{f}</option>)}
              </select>
              <select className="form-select" style={{ maxWidth: 140 }} value={r.op} onChange={(e) => setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, op: e.target.value } : x)))}>
                {[">", "<", "=", "within", "after", "before"].map((o) => <option key={o}>{o}</option>)}
              </select>
              <input className="form-control" style={{ maxWidth: 150 }} value={r.value} onChange={(e) => setRules((rs) => rs.map((x) => (x.id === r.id ? { ...x, value: e.target.value } : x)))} />
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setRules((rs) => rs.filter((x) => x.id !== r.id))}><i className="bi bi-trash" /></button>
            </div>
          </div>
        ))}
        <div className="col-12">
          <button type="button" className="btn btn-sm btn-outline-primary me-2" onClick={() => setRules((rs) => [...rs, { id: Date.now(), field: "City", op: "=", value: "Nairobi" }])}>
            <i className="bi bi-plus-lg me-1" /> Add rule
          </button>
          <button type="button" className="btn btn-sm btn-outline-secondary" disabled={!name.trim()} onClick={() => {
            setEstCount(120 + Math.floor(Math.random() * 400));
            toast("Estimated from last month's data — live count appears once created.", "info", "Estimate ready");
          }}>
            <i className="bi bi-calculator me-1" /> Estimate size
          </button>
          {estCount > 0 && <span className="ms-2 fw-bold text-primary">≈ {estCount} members</span>}
        </div>
        <div className="col-12">
          <div className="pm-note soft"><i className="bi bi-lightbulb me-1" />Existing segments: {segments.length} · members can belong to many segments at once.</div>
        </div>
      </div>
    </Modal>
  );
}

/* ==================================================================
   SOCIAL COMPOSER MODAL
================================================================== */
export function SocialComposerModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { schedulePost, addCalendarItem, toast } = useStore();
  const [platform, setPlatform] = useState<"Instagram" | "Facebook" | "TikTok">("Instagram");
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [emoji, setEmoji] = useState("📸");
  const [when, setWhen] = useState<"now" | "later">("later");
  const [time, setTime] = useState("Tomorrow 09:00");
  const [storeLink, setStoreLink] = useState(true);

  return (
    <Modal open onClose={onClose} title="Compose social post" subtitle="One post → Instagram, Facebook or TikTok" icon="bi-instagram" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={content.trim().length < 5} onClick={() => {
            const id = schedulePost({ platform, content, emoji, time: when === "now" ? "Just now" : time, status: when === "now" ? "Published" : "Scheduled" });
            if (when !== "now") {
              const day = 16;
              addCalendarItem(day, { icon: platform === "Instagram" ? "bi-instagram" : platform === "TikTok" ? "bi-tiktok" : "bi-facebook", label: content.split(" ").slice(0, 3).join(" ") + "…", tone: platform === "Instagram" ? "violet" : "slate" });
            }
            toast(`${id} ${when === "now" ? "published" : "scheduled"} on ${platform}${storeLink ? " with a shoppable link" : ""}.`, "success", when === "now" ? "Post live" : "Post scheduled");
            onClose();
          }}>
            <i className="bi bi-send me-1" /> {when === "now" ? "Publish now" : "Schedule"}
          </button>
        </>
      }
    >
      <div className="d-flex gap-2 mb-3">
        {(["Instagram", "Facebook", "TikTok"] as const).map((p) => (
          <Chip key={p} on={platform === p} onClick={() => setPlatform(p)}>
            <i className={`bi ${p === "Instagram" ? "bi-instagram" : p === "Facebook" ? "bi-facebook" : "bi-tiktok"} me-1`} /> {p}
          </Chip>
        ))}
      </div>
      <Field label="Caption" hint={`${content.length} characters — Instagram sweet spot is 125–150`}>
        <textarea className="form-control" rows={3} placeholder="What's happening at Soko Sanaa today?" value={content} onChange={(e) => setContent(e.target.value)} />
      </Field>
      <Field label="Hashtags" className="mt-2" hint="Comma separated — we suggest 5–8">
        <input className="form-control" placeholder="#madeinkenya #shoplocal #nairobi" value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
      </Field>
      <div className="row g-3 mt-1">
        <Field label="Post emoji" className="col-md-3">
          <input className="form-control text-center" style={{ fontSize: "1.2rem" }} value={emoji} onChange={(e) => setEmoji(e.target.value)} />
        </Field>
        <Field label="Timing" className="col-md-4">
          <div className="d-flex gap-2">
            <Chip on={when === "now"} onClick={() => setWhen("now")}>Now</Chip>
            <Chip on={when === "later"} onClick={() => setWhen("later")}>Schedule</Chip>
          </div>
        </Field>
        {when === "later" && (
          <Field label="Time" className="col-md-5">
            <select className="form-select" value={time} onChange={(e) => setTime(e.target.value)}>
              <option>Tomorrow 09:00</option><option>Fri 17:00 — best time</option><option>Sat 10:00</option><option>Custom…</option>
            </select>
          </Field>
        )}
      </div>
      <div className="form-check form-switch mt-3">
        <input className="form-check-input" type="checkbox" id="shopLink" checked={storeLink} onChange={(e) => setStoreLink(e.target.checked)} />
        <label className="form-check-label" htmlFor="shopLink"><b style={{ fontSize: "0.84rem" }}>Attach shoppable product link</b><div className="pm-prod-meta">Tag products from your store — orders land in Products &amp; Store automatically.</div></label>
      </div>
      <div className="pm-note soft mt-3"><i className="bi bi-graph-up me-1" />Best performing hour for your audience: Friday 17:00 (81% engagement).</div>
    </Modal>
  );
}

/* ==================================================================
   SOCIAL INBOX DRAWER
================================================================== */
export function InboxDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { inbox, replyToMessage, markInboxRead } = useStore();
  const [active, setActive] = useState<string | null>(inbox.find((m) => m.unread)?.id ?? inbox[0]?.id ?? null);
  const [reply, setReply] = useState("");
  const activeMsg = inbox.find((m) => m.id === active);
  return (
    <Drawer open onClose={onClose} icon="bi-chat-dots" title="Social inbox" subtitle="WhatsApp · Instagram · Facebook — one reply box">
      <div className="d-flex gap-2 mb-2">
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => { markInboxRead(); }}><i className="bi bi-check2-all me-1" /> Mark all read</button>
        <span className="pm-prod-meta align-self-center">{inbox.filter((m) => m.unread).length} unread</span>
      </div>
      {inbox.map((m) => (
        <button key={m.id} type="button" className={`w-100 text-start p-2 mb-2 ${active === m.id ? "pm-inbox-active" : "pm-inbox-row"}`} onClick={() => setActive(m.id)}>
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${m.channel === "WhatsApp" ? "bi-whatsapp text-success" : m.channel === "Instagram" ? "bi-instagram" : "bi-facebook text-primary"}`} />
            <b style={{ fontSize: "0.8rem" }} className="flex-grow-1">{m.from} <span className="pm-prod-meta">· {m.channel}</span></b>
            {m.unread && <span className="pm-dot-live" />}
            <span className="pm-prod-meta" style={{ fontSize: "0.68rem" }}>{m.time}</span>
          </div>
          <div className="pm-prod-meta text-truncate mt-1" style={{ paddingLeft: 22 }}>{m.text}</div>
        </button>
      ))}
      {activeMsg && (
        <div className="pm-card mt-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Badge tone={activeMsg.tag === "Order" ? "blue" : activeMsg.tag === "Product" ? "violet" : activeMsg.tag === "Feedback" ? "green" : "slate"}>{activeMsg.tag}</Badge>
            <b style={{ fontSize: "0.82rem" }}>{activeMsg.from}</b>
          </div>
          <div className="pm-wa-bubble mb-2">{activeMsg.text}</div>
          <div className="input-group">
            <input className="form-control" placeholder="Type a reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
            <button type="button" className="btn btn-success" disabled={!reply.trim()} onClick={() => { replyToMessage(activeMsg.id, reply.trim()); setReply(""); }}>
              <i className="bi bi-send" />
            </button>
          </div>
          <div className="d-flex gap-1 mt-2 flex-wrap">
            {["Thanks! 🧡", "We'll check now", "In stock ✓", "Delivers in 1–3 days"].map((q) => (
              <button key={q} type="button" className="pm-chip" onClick={() => setReply(q)}>{q}</button>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
}

/* ==================================================================
   REVIEW REPLY MODAL
================================================================== */
export function ReviewReplyModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { reviews, replyToReview, approveReview, setReviewStatus, toast } = useStore();
  const r = reviews.find((x) => x.id === String(payload.id));
  const [reply, setReply] = useState("");
  if (!r) return null;
  return (
    <Modal open onClose={onClose} title={`Review ${r.id}`} subtitle={`${r.customer} · ${r.product} · ${r.platform}`} icon="bi-star"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary me-auto" onClick={() => { setReviewStatus(r.id, "Published"); toast("Review hidden from storefront (kept for audit).", "info", "Review hidden"); onClose(); }}>
            <i className="bi bi-eye-slash me-1" /> Hide
          </button>
          {r.status === "Pending review" && (
            <button type="button" className="btn btn-outline-primary" onClick={() => { approveReview(r.id); onClose(); }}>
              <i className="bi bi-check2-circle me-1" /> Approve only
            </button>
          )}
          <button type="button" className="btn btn-primary" disabled={reply.trim().length < 3} onClick={() => { replyToReview(r.id, reply.trim()); onClose(); }}>
            <i className="bi bi-reply me-1" /> {r.status === "Pending review" ? "Approve & reply" : "Update reply"}
          </button>
        </>
      }
    >
      <div className="d-flex align-items-center gap-2 mb-3">
        <span style={{ color: "#f79009", letterSpacing: 1 }}>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
        <StatusBadge status={r.status} />
        <Badge tone="slate">{r.date}</Badge>
      </div>
      <div className="pm-note mb-3"><i className="bi bi-quote me-1" />"{r.text}"</div>
      <Field label={r.status === "Replied" ? "Your reply (updating)" : "Your reply"} hint="Published publicly under the review — the customer is notified.">
        <textarea className="form-control" rows={3} placeholder="e.g. Asante Grace! Sorry about the bracelet — we've sent a replacement 🧡" value={reply} onChange={(e) => setReply(e.target.value)} />
      </Field>
      {r.stars < 4 && <div className="pm-note mt-3"><i className="bi bi-lightbulb me-1" />Low-star tip: reply within 1 hour — public service recovery boosts trust more than 5-star reviews do.</div>}
    </Modal>
  );
}

/* ==================================================================
   REDEEM POINTS MODAL
================================================================== */
export function RedeemPointsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { redeemPoints } = useStore();
  const memberName = String(payload.member ?? "");
  const [member, setMember] = useState(memberName || LOYALTY.topEarners[0].name);
  const [rewardId, setRewardId] = useState(LOYALTY.rewards[0].id);
  const mem = LOYALTY.topEarners.find((m) => m.name === member);
  const reward = LOYALTY.rewards.find((r) => r.id === rewardId);
  const canRedeem = mem && reward && mem.points >= reward.cost;
  return (
    <Modal open onClose={onClose} title="Redeem loyalty points" subtitle="Search a member, pick a reward, it lands on their WhatsApp" icon="bi-gift"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={!canRedeem} onClick={() => { redeemPoints(member, rewardId); onClose(); }}>
            <i className="bi bi-gift me-1" /> Redeem {reward?.cost} pts
          </button>
        </>
      }
    >
      <Field label="Member" className="mb-3">
        <select className="form-select" value={member} onChange={(e) => setMember(e.target.value)}>
          {LOYALTY.topEarners.map((m) => <option key={m.name}>{m.name} — {m.points.toLocaleString()} pts ({m.tier})</option>)}
        </select>
      </Field>
      <label className="form-label">Reward</label>
      {LOYALTY.rewards.map((r) => (
        <button key={r.id} type="button" className={`w-100 text-start p-2 mb-2 pm-theme-card ${rewardId === r.id ? "sel" : ""}`} onClick={() => setRewardId(r.id)}>
          <div className="d-flex align-items-center gap-2">
            <i className={`bi ${r.icon}`} style={{ color: "var(--pm-green-dark)" }} />
            <b style={{ fontSize: "0.84rem" }} className="flex-grow-1">{r.name}</b>
            <Badge tone="amber">{r.cost} pts</Badge>
          </div>
          <div className="pm-prod-meta">{r.desc}</div>
        </button>
      ))}
      {mem && reward && (
        <div className={canRedeem ? "pm-note" : "pm-note"} style={canRedeem ? {} : { borderColor: "#fbd2d0", background: "#fef6f5" }}>
          {canRedeem
            ? <><i className="bi bi-check2-circle me-1 text-primary" />{mem.name} has {mem.points.toLocaleString()} pts — balance after: {(mem.points - reward.cost).toLocaleString()}.</>
            : <><i className="bi bi-x-circle me-1" style={{ color: "var(--pm-danger)" }} />Insufficient points — {mem.name} has {mem.points.toLocaleString()}, reward needs {reward.cost}.</>}
        </div>
      )}
      <div className="pm-prod-meta mt-2"><i className="bi bi-shield-check me-1" />Vouchers sync to the storefront checkout and the till automatically.</div>
    </Modal>
  );
}

/* ==================================================================
   BUDGET MODAL
================================================================== */
export function BudgetModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { budget, updateBudget, toast, recordActivity } = useStore();
  const [monthly, setMonthly] = useState(String(budget.monthly));
  const [auto, setAuto] = useState(budget.autoOptimize);
  const [boost, setBoost] = useState(String(budget.boost));
  const pct = Math.round((budget.spent / budget.monthly) * 100);
  return (
    <Modal open onClose={onClose} title="Marketing budget" subtitle={`Spent ${fmtKES(budget.spent)} of ${fmtKES(budget.monthly)} this month`} icon="bi-wallet2"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            updateBudget({ monthly: Number(monthly) || 0, autoOptimize: auto, boost: Number(boost) || 0 });
            recordActivity("Marketing budget updated", "bi-wallet2");
            toast("Budget settings saved — spend caps enforced at 100%.", "success", "Budget updated");
            onClose();
          }}>
            <i className="bi bi-check-lg me-1" /> Save budget
          </button>
        </>
      }
    >
      <div className="progress mb-1" style={{ height: 10 }}>
        <div className="progress-bar" style={{ width: `${pct}%`, background: pct > 90 ? "#f04438" : pct > 70 ? "#f79009" : undefined }} />
      </div>
      <div className="pm-prod-meta mb-3">{pct}% used · {Math.max(0, budget.monthly - budget.spent) ? fmtKES(budget.monthly - budget.spent) + " left" : "over budget"}</div>
      <div className="row g-3">
        <Field label="Monthly budget (KES)" className="col-md-6">
          <input type="number" min={0} className="form-control" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        </Field>
        <Field label="Boost pool (KES)" className="col-md-6" hint="Reserved for boosting viral posts.">
          <input type="number" min={0} className="form-control" value={boost} onChange={(e) => setBoost(e.target.value)} />
        </Field>
      </div>
      <div className="form-check form-switch mt-3">
        <input className="form-check-input" type="checkbox" id="bauto" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
        <label className="form-check-label" htmlFor="bauto"><b style={{ fontSize: "0.84rem" }}>Auto-optimize channel mix</b><div className="pm-prod-meta">Shift up to 20% of budget to channels beating their ROAS target.</div></label>
      </div>
      <div className="pm-note soft mt-3"><i className="bi bi-info-circle me-1" />Channel costs: SMS KES 0.80 · WhatsApp KES 0.55 · Email KES 0.02 per contact.</div>
    </Modal>
  );
}

/* ==================================================================
   ATTRIBUTION MODAL
================================================================== */
export function AttributionModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast } = useStore();
  const [model, setModel] = useState("Last-touch");
  const [win, setWin] = useState("30 days");
  return (
    <Modal open onClose={onClose} title="Attribution model" subtitle="How credit for a sale is assigned to channels" icon="bi-diagram-3" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={() => { toast("Attribution model saved — analytics recompute in ~5 min.", "success", "Model updated"); onClose(); }}><i className="bi bi-check2 me-1" /> Save model</button>}
    >
      <div className="row g-3">
        <Field label="Model" className="col-md-6">
          <select className="form-select" value={model} onChange={(e) => setModel(e.target.value)}>
            <option>Last-touch</option><option>First-touch</option><option>Linear</option><option>Time-decay</option><option>Position-based (40/20/40)</option>
          </select>
        </Field>
        <Field label="Attribution window" className="col-md-6">
          <select className="form-select" value={win} onChange={(e) => setWin(e.target.value)}>
            <option>7 days</option><option>30 days</option><option>90 days</option>
          </select>
        </Field>
      </div>
      <div className="pm-kpi-label mt-3 mb-1">Current split (last-touch)</div>
      {ATTRIBUTION.map((a) => (
        <div key={a.label} className="d-flex align-items-center gap-2 py-1">
          <span style={{ width: 9, height: 9, borderRadius: 3, background: a.color, display: "inline-block" }} />
          <span style={{ fontSize: "0.82rem" }} className="flex-grow-1">{a.label}</span>
          <div className="progress" style={{ width: 120, height: 6 }}><div className="progress-bar" style={{ width: `${a.v}%`, background: a.color }} /></div>
          <b style={{ fontSize: "0.8rem", width: 34, textAlign: "right" }}>{a.v}%</b>
        </div>
      ))}
      <div className="pm-note soft mt-3"><i className="bi bi-lightbulb me-1" />Tip: most shops use last-touch, but if you run lots of Instagram discovery, position-based tells the fuller story.</div>
    </Modal>
  );
}

/* ==================================================================
   ROI CALCULATOR — interactive
================================================================== */
export function RoiCalculatorModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal } = useStore();
  const [budget, setBudget] = useState(35000);
  const [mix, setMix] = useState<Record<string, number>>({ whatsapp: 35, sms: 20, email: 5, instagram: 25, tiktok: 15 });
  const [aov, setAov] = useState(2272);
  const roas: Record<string, number> = { whatsapp: 21.4, sms: 8.9, email: 5.1, instagram: 14.2, tiktok: 3.4 };
  const conv: Record<string, number> = { whatsapp: 0.024, sms: 0.011, email: 0.008, instagram: 0.017, tiktok: 0.006 };
  const total = Object.entries(mix).reduce((a, [k, p]) => a + budget * (p / 100) * conv[k] * aov, 0);
  const roi = (total / (budget || 1)).toFixed(1);
  return (
    <Modal open onClose={onClose} title="Campaign ROI calculator" subtitle="Drag the mix — projections from your own channel history" icon="bi-calculator" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => { onClose(); openModal("campaignWizard"); }}>
            <i className="bi bi-megaphone me-1" /> Build campaign with this mix
          </button>
        </>
      }
    >
      <div className="row g-3">
        <div className="col-md-5">
          <Field label="Budget (KES)">
            <div className="input-group"><span className="input-group-text">KES</span>
              <input type="number" min={1000} className="form-control" value={budget} onChange={(e) => setBudget(Number(e.target.value) || 0)} />
            </div>
            <input type="range" className="form-range mt-2" min={5000} max={100000} step={1000} value={Math.min(100000, Math.max(5000, budget))} onChange={(e) => setBudget(Number(e.target.value))} />
          </Field>
          <Field label="Average order value (KES)">
            <input type="number" min={100} className="form-control" value={aov} onChange={(e) => setAov(Number(e.target.value) || 0)} />
          </Field>
        </div>
        <div className="col-md-7">
          <label className="form-label">Channel mix</label>
          {CHANNELS.map((c) => (
            <div key={c.id} className="mb-2">
              <div className="d-flex justify-content-between" style={{ fontSize: "0.76rem" }}>
                <span className="fw-semibold"><i className={`bi ${c.icon} me-1`} />{c.name} <span className="pm-prod-meta">· {roas[c.id] ?? 3}× historical</span></span>
                <b>{mix[c.id] ?? 0}%</b>
              </div>
              <input type="range" className="form-range" min={0} max={60} value={mix[c.id] ?? 0} onChange={(e) => setMix((m) => ({ ...m, [c.id]: Number(e.target.value) }))} />
            </div>
          ))}
        </div>
      </div>
      <div className="pm-card mt-3" style={{ background: "var(--pm-green-soft)", border: "none" }}>
        <div className="row text-center">
          <div className="col-3"><div className="pm-kpi-label">Projected spend</div><b>{fmtKES(budget)}</b></div>
          <div className="col-3"><div className="pm-kpi-label">Projected revenue</div><b className="text-primary" style={{ fontSize: "1.05rem" }}>{fmtKES(total)}</b></div>
          <div className="col-3"><div className="pm-kpi-label">Projected ROI</div><b style={{ fontSize: "1.05rem" }}>{roi}×</b></div>
          <div className="col-3"><div className="pm-kpi-label">Est. conversions</div><b>{Math.max(0, Math.round(total / aov))}</b></div>
        </div>
      </div>
    </Modal>
  );
}

/* ==================================================================
   TEMPLATES MODAL
================================================================== */
export function TemplatesModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal, toast } = useStore();
  return (
    <Modal open onClose={onClose} title="Message template library" subtitle="Approved templates — use them anywhere in 2 taps" icon="bi-collection" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>}
    >
      <div className="row g-3">
        {TEMPLATES.map((t) => (
          <div className="col-md-6" key={t.id}>
            <div className="pm-help-item flex-column align-items-stretch">
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: "1.2rem" }}>{t.icon}</span>
                <div className="flex-grow-1">
                  <b style={{ fontSize: "0.84rem" }}>{t.name}</b>
                  <div className="pm-prod-meta">{t.channel}</div>
                </div>
                <Badge tone="green">Approved</Badge>
              </div>
              <div className="pm-wa-preview mt-2"><div className="pm-wa-bubble">{t.text}</div></div>
              <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={() => { onClose(); openModal("broadcastWizard"); toast(`Template "${t.name}" loaded into the broadcast wizard.`, "info", "Template loaded"); }}>
                <i className="bi bi-arrow-right-circle me-1" /> Use this template
              </button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ==================================================================
   INTEGRATIONS MODAL
================================================================== */
export function IntegrationsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const apps = [
    { name: "WhatsApp Business", desc: "Template messaging + catalogue", icon: "bi-whatsapp", tone: "green", status: "Connected · 97% delivery" },
    { name: "Instagram Shopping", desc: "Shoppable posts & stories", icon: "bi-instagram", tone: "violet", status: "Connected · 27% of sales" },
    { name: "Facebook Page", desc: "Posts, messenger & boosts", icon: "bi-facebook", tone: "blue", status: "Connected" },
    { name: "TikTok for Business", desc: "Organic + boost budget", icon: "bi-tiktok", tone: "slate", status: "Connected" },
    { name: "Google Business", desc: "Maps, reviews, search", icon: "bi-google", tone: "amber", status: "Not connected" },
    { name: "Mailchimp", desc: "Email campaigns", icon: "bi-envelope", tone: "slate", status: "Not connected" },
  ];
  return (
    <Modal open onClose={onClose} title="Channel integrations" subtitle="Your marketing channels, connected to PayMo" icon="bi-puzzle" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>}
    >
      {apps.map((a) => (
        <div key={a.name} className="d-flex align-items-center gap-3 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 12 }}>
          <span className="pm-kpi-icon" style={{ width: 40, height: 40, background: "var(--pm-green-soft)", color: "var(--pm-green-dark)" }}>
            <i className={`bi ${a.icon}`} />
          </span>
          <div className="flex-grow-1">
            <b style={{ fontSize: "0.86rem" }}>{a.name}</b>
            <div className="pm-prod-meta">{a.desc}</div>
          </div>
          {a.status === "Not connected" ? (
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { recordActivity(`${a.name} connected`, "bi-puzzle"); toast(`${a.name} connected — data sync begins now.`, "success", "Channel connected"); }}>
              Connect
            </button>
          ) : (
            <Badge tone="green">{a.status}</Badge>
          )}
        </div>
      ))}
    </Modal>
  );
}

/* ==================================================================
   GROWTH IDEAS MODAL
================================================================== */
export function IdeasModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal, toast } = useStore();
  const act = (i: typeof IDEAS[number]) => {
    if (i.title.includes("At-Risk")) { onClose(); openModal("campaignWizard", { name: "Win-back 60d" }); }
    else if (i.title.includes("review")) { onClose(); openModal("reviewReply", { id: "RV-114" }); }
    else if (i.title.includes("send time")) { onClose(); openModal("calendar"); }
    else { onClose(); toast(`Boosting PST-32 with KES 2,000 from your boost pool.`, "success", "Boost started"); }
  };
  return (
    <Modal open onClose={onClose} title="Growth ideas for this week" subtitle="Generated from your data — no consultant needed" icon="bi-lightbulb" size="lg"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>}
    >
      {IDEAS.map((i) => (
        <div key={i.id} className="d-flex gap-3 p-2 mb-2" style={{ border: "1px solid var(--pm-border)", borderRadius: 12 }}>
          <span className="pm-kpi-icon" style={{ width: 40, height: 40, background: i.tone === "green" ? "var(--pm-green-soft)" : i.tone === "violet" ? "#f0ebfe" : i.tone === "blue" ? "#e8f1fe" : "#fef0c7", color: i.tone === "green" ? "var(--pm-green-dark)" : i.tone === "violet" ? "#5925dc" : i.tone === "blue" ? "#175cd3" : "#93370d" }}>
            <i className={`bi ${i.icon}`} />
          </span>
          <div className="flex-grow-1">
            <b style={{ fontSize: "0.86rem" }}>{i.title}</b>
            <div className="pm-prod-meta">{i.detail}</div>
          </div>
          <button type="button" className="btn btn-sm btn-outline-primary align-self-center" onClick={() => act(i)}>{i.act} →</button>
        </div>
      ))}
    </Modal>
  );
}

/* ==================================================================
   EXPORT ANALYTICS MODAL
================================================================== */
export function ExportAnalyticsModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const [range, setRange] = useState("Last 30 days");
  const [format, setFormat] = useState<"PDF" | "CSV" | "Excel">("PDF");
  const [include, setInclude] = useState({ campaigns: true, social: true, loyalty: true, reviews: true, roi: true });
  const [building, setBuilding] = useState(false);
  return (
    <Modal open onClose={onClose} title="Export marketing analytics" subtitle="Board-ready numbers, one download" icon="bi-file-earmark-bar-graph"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={building} onClick={() => {
            setBuilding(true);
            window.setTimeout(() => {
              setBuilding(false);
              recordActivity(`Marketing ${format} export (${range})`, "bi-file-earmark-bar-graph");
              toast(`${format} report downloaded — includes ROI, campaigns, social & loyalty.`, "success", "Report ready");
              onClose();
            }, 1300);
          }}>
            {building ? <><span className="pm-spin me-1">◌</span> Building…</> : <><i className="bi bi-download me-1" /> Export {format}</>}
          </button>
        </>
      }
    >
      <Field label="Range" className="mb-3">
        <select className="form-select" value={range} onChange={(e) => setRange(e.target.value)}>
          <option>Last 7 days</option><option>Last 30 days</option><option>This quarter</option><option>Year to date</option>
        </select>
      </Field>
      <div className="d-flex gap-2 mb-3">
        {(["PDF", "CSV", "Excel"] as const).map((f) => (
          <button key={f} type="button" className={`pm-chip ${format === f ? "on" : ""}`} onClick={() => setFormat(f)}>
            <i className={`bi ${f === "PDF" ? "bi-file-pdf" : f === "CSV" ? "bi-filetype-csv" : "bi-file-earmark-excel"} me-1`} /> {f}
          </button>
        ))}
      </div>
      {[
        { k: "campaigns" as const, t: "Campaign performance & ROI" },
        { k: "social" as const, t: "Social post analytics" },
        { k: "loyalty" as const, t: "Loyalty & referral report" },
        { k: "reviews" as const, t: "Reviews & NPS" },
        { k: "roi" as const, t: "Channel-level ROAS" },
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
   CONTENT CALENDAR MODAL
================================================================== */
export function CalendarModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { calendarItems, openModal, toast } = useStore();
  const [month] = useState("January 2026");
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <Modal open onClose={onClose} title="Content calendar" subtitle={month + " · everything planned, nothing forgotten"} icon="bi-calendar3" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { onClose(); openModal("campaignWizard"); }}>
            <i className="bi bi-plus-lg me-1" /> Plan campaign
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
        </>
      }
    >
      <div className="d-flex gap-1 flex-wrap mb-3">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <span key={d} className="pm-prod-meta text-center fw-bold" style={{ width: "13.2%" }}>{d}</span>
        ))}
        {days.map((d) => {
          const items = calendarItems.find((c) => c.day === d)?.items ?? [];
          return (
            <button key={d} type="button" className="pm-cal-day" style={{ width: "13.2%", minHeight: 72 }} onClick={() => items.length ? toast(`Day ${d}: ${items.map((i) => i.label).join(" · ")}`, "info", "Scheduled") : toast(`Day ${d} is free — schedule something!`, "info", "Free day")}>
              <span className="pm-prod-meta fw-bold">{d}</span>
              {items.map((it, i) => (
                <span key={i} className="badge-soft" style={{ fontSize: "0.58rem", display: "block", textAlign: "left", marginTop: 2, background: it.tone === "violet" ? "#f0ebfe" : it.tone === "amber" ? "#fef0c7" : it.tone === "blue" ? "#e8f1fe" : "#e7f8ef" }}>
                  {it.icon === "bi-whatsapp" ? "💬" : it.icon === "bi-instagram" ? "📸" : it.icon === "bi-tiktok" ? "🎬" : it.icon === "bi-envelope" ? "📧" : "📊"} {it.label}
                </span>
              ))}
            </button>
          );
        })}
      </div>
      <div className="pm-note soft"><i className="bi bi-lightbulb me-1" />Friday 17:00 is your golden slot — two of your three best campaigns sent then.</div>
    </Modal>
  );
}

/* ==================================================================
   NPS DETAIL MODAL
================================================================== */
export function NpsDetailModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { openModal } = useStore();
  const dist = [["Detractors", NPS.detractors, "#f04438"], ["Passives", NPS.passives, "#f79009"], ["Promoters", NPS.promoters, "#12b76a"]] as const;
  return (
    <Modal open onClose={onClose} title="NPS breakdown" subtitle={`Score ${NPS.score} / 10 · ${NPS.responses} responses`} icon="bi-chat-square-heart" size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={() => { onClose(); openModal("feedbackWizard"); }}>
            <i className="bi bi-plus-lg me-1" /> New feedback campaign
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
        </>
      }
    >
      <div className="pm-card mb-3" style={{ boxShadow: "none", background: "#fafbfd" }}>
        <div className="pm-kpi-label mb-1">12-month NPS trend</div>
        <Spark data={NPS.trend.map((v) => v * 10)} w={500} h={60} />
      </div>
      {dist.map(([label, pct, color]) => (
        <div key={label} className="mb-2">
          <div className="d-flex justify-content-between" style={{ fontSize: "0.78rem" }}>
            <span className="fw-semibold">{label}</span>
            <span className="pm-prod-meta">{pct}% · {Math.round((NPS.responses * pct) / 100)} responses</span>
          </div>
          <div className="progress" style={{ height: 9 }}><div className="progress-bar" style={{ width: `${pct}%`, background: color }} /></div>
        </div>
      ))}
      <div className="pm-note mt-3"><i className="bi bi-lightbulb me-1" />62% promoters means word-of-mouth is your top acquisition channel — the Referral 2.0 program turns that into a machine.</div>
    </Modal>
  );
}

/* ==================================================================
   MEMBER DRAWER
================================================================== */
export function MemberDrawer({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { members, openModal } = useStore();
  const m = members.find((x) => x.name === String(payload.member));
  if (!m) return null;
  const nextTier = m.tier === "Bronze" ? 500 : m.tier === "Silver" ? 2500 : null;
  const progress = m.tier === "Gold" ? 100 : Math.min(100, Math.round((m.points / (nextTier ?? 1)) * 100));
  return (
    <Drawer open onClose={onClose} icon="bi-person-badge" title={m.name} subtitle={`${m.phone} · member since ${m.joined}`}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <StatusBadge status={m.tier} />
        <Badge tone="slate">{m.visits} visits</Badge>
      </div>
      <div className="pm-card mb-3 text-center" style={{ background: "var(--pm-green-soft)", border: "none" }}>
        <div className="pm-kpi-label">Points balance</div>
        <div className="pm-kpi-value">{m.points.toLocaleString()}</div>
        <div className="pm-prod-meta">worth {fmtKES(Math.round(m.points / LOYALTY.pointsPerKes * 10))} in rewards</div>
      </div>
      {nextTier && (
        <div className="mb-3">
          <div className="d-flex justify-content-between" style={{ fontSize: "0.78rem" }}>
            <span className="fw-semibold">Next tier: {m.tier === "Bronze" ? "Silver" : "Gold"}</span>
            <span className="pm-prod-meta">{progress}%</span>
          </div>
          <div className="progress" style={{ height: 8 }}><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
          <div className="pm-prod-meta mt-1">{m.tier === "Bronze" ? "500" : "2,500"} points unlocks {m.tier === "Bronze" ? "Silver" : "Gold"} benefits.</div>
        </div>
      )}
      <div className="row g-2">
        <div className="col-12"><button type="button" className="btn btn-primary btn-sm w-100" onClick={() => openModal("redeemPoints", { member: m.name })}><i className="bi bi-gift me-1" /> Redeem points</button></div>
        <div className="col-6"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => openModal("shareReferral", { member: m.name })}><i className="bi bi-share me-1" /> Referral link</button></div>
        <div className="col-6"><button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={() => openModal("campaignWizard", { name: "Personal offer — " + m.name.split(" ")[0] })}><i className="bi bi-megaphone me-1" /> Personal offer</button></div>
      </div>
      <div className="pm-note soft mt-3"><i className="bi bi-shield-check me-1" />Double-points day: {LOYALTY.doublePointsDay} · earn 1pt per KES {LOYALTY.pointsPerKes}.</div>
    </Drawer>
  );
}

/* ==================================================================
   SHARE REFERRAL MODAL
================================================================== */
export function ShareReferralModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  void payload;
  const { toast, recordActivity } = useStore();
  const copy = () => {
    try { void navigator.clipboard?.writeText("https://" + REFERRAL.link); } catch { /* demo */ }
    toast("Referral link copied — https://" + REFERRAL.link, "info", "Copied");
  };
  return (
    <Modal open onClose={onClose} title="Share referral link" subtitle={`${REFERRAL.reward} for you · ${REFERRAL.cta}`} icon="bi-share"
      footer={<button type="button" className="btn btn-primary" onClick={onClose}><i className="bi bi-check2 me-1" /> Done</button>}
    >
      <div className="pm-card mb-3 text-center" style={{ background: "var(--pm-green-soft)", border: "none" }}>
        <div className="pm-kpi-label">Your link</div>
        <b style={{ fontFamily: "monospace" }}>{REFERRAL.link}</b>
      </div>
      <div className="d-flex gap-2 mb-3">
        <button type="button" className="btn btn-outline-primary flex-grow-1" onClick={() => { recordActivity("Referral link shared via WhatsApp", "bi-whatsapp"); toast("WhatsApp share sheet opened with your link.", "info", "WhatsApp"); }}><i className="bi bi-whatsapp me-1" /> WhatsApp</button>
        <button type="button" className="btn btn-outline-secondary flex-grow-1" onClick={() => { recordActivity("Referral link shared via SMS", "bi-chat-left-text"); toast("SMS template loaded with your link.", "info", "SMS"); }}><i className="bi bi-chat-left-text me-1" /> SMS</button>
        <button type="button" className="btn btn-outline-secondary flex-grow-1" onClick={copy}><i className="bi bi-clipboard me-1" /> Copy</button>
      </div>
      <div className="pm-note"><i className="bi bi-graph-up me-1" />61 friends converted so far — every shared link with the QR card converts 12% better.</div>
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
    <Modal open onClose={onClose} title="Help & shortcuts" subtitle="Marketing & Growth — every flow on this page" icon="bi-question-circle" size="lg"
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
          { icon: "bi-megaphone", t: "Campaign Wizard (5 steps)", d: "Goal → audience → channels & content → budget & schedule → launch.", act: () => openModal("campaignWizard") },
          { icon: "bi-lightning-charge", t: "Flash Sale Builder (4 steps)", d: "Products & margin math → duration → promo code → announcement preview.", act: () => openModal("flashsaleWizard") },
          { icon: "bi-whatsapp", t: "Broadcast Wizard (3 steps)", d: "Consent-safe segment → template message → best-time scheduling.", act: () => openModal("broadcastWizard") },
          { icon: "bi-award", t: "A/B Test Wizard (4 steps)", d: "Variants, audience split, auto-rollout of the winner.", act: () => openModal("abtestWizard") },
          { icon: "bi-stars", t: "Loyalty Wizard (4 steps)", d: "Earning rate → rules → rewards catalog → launch to 1,284 members.", act: () => openModal("loyaltyWizard") },
          { icon: "bi-calculator", t: "ROI Calculator", d: "Drag your channel mix and see projected revenue from your own history.", act: () => openModal("roiCalc") },
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
  const kinds = ["All", "Campaigns", "Social", "Reviews", "Loyalty", "Budget"];
  return (
    <Drawer open onClose={onClose} icon="bi-clock-history" title="Activity log" subtitle="Everything marketing — audit-ready">
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
      <button type="button" className="btn btn-outline-secondary w-100 mt-3" onClick={() => toast("Full marketing audit trail queued for export.", "info", "Audit trail")}>
        <i className="bi bi-download me-1" /> Export full audit trail
      </button>
    </Drawer>
  );
}

/* ==================================================================
   BOOST POST MODAL
================================================================== */
export function BoostPostModal({ payload, onClose }: { payload: Record<string, unknown>; onClose: () => void }) {
  const { boostPost, toast } = useStore();
  const postId = String(payload.postId ?? "");
  const post = POSTS.find((p) => p.id === postId) ?? { id: postId, platform: "TikTok" as const, content: "POV: packing your order at 6am", emoji: "📦", time: "Yesterday", status: "Published" as const, likes: 1280, comments: 96, reach: 18400 };
  const [amount, setAmount] = useState("2000");
  const [audience, setAudience] = useState("People like your followers");
  const amt = Number(amount) || 0;
  return (
    <Modal open onClose={onClose} title="Boost post" subtitle={`${post.id} · ${post.platform} · ${post.reach.toLocaleString()} organic reach`} icon="bi-graph-up-arrow"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" disabled={amt < 200} onClick={() => { boostPost(post.id, amt); toast(`Boost live — expect +${(amt * 7).toLocaleString()} reach over 7 days.`, "success", "Post boosted"); onClose(); }}>
            <i className="bi bi-rocket-takeoff me-1" /> Boost for {fmtKES(amt)}
          </button>
        </>
      }
    >
      <div className="d-flex gap-3 mb-3 align-items-center">
        <span style={{ fontSize: "1.8rem" }}>{post.emoji}</span>
        <div><div className="fw-semibold" style={{ fontSize: "0.84rem" }}>{post.content}</div><div className="pm-prod-meta">🔥 {post.likes.toLocaleString()} likes · {post.reach.toLocaleString()} reach</div></div>
      </div>
      <Field label="Boost budget (KES)" className="mb-3">
        <input type="number" min={200} className="form-control" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <div className="d-flex gap-2 mt-2">
          {[1000, 2000, 5000].map((v) => <Chip key={v} on={amt === v} onClick={() => setAmount(String(v))}>{fmtKES(v)}</Chip>)}
        </div>
      </Field>
      <Field label="Audience">
        <select className="form-select" value={audience} onChange={(e) => setAudience(e.target.value)}>
          <option>People like your followers</option>
          <option>Nairobi, 18–40</option>
          <option>Kenya-wide, craft lovers</option>
          <option>Custom audience…</option>
        </select>
      </Field>
      <div className="pm-note mt-3"><i className="bi bi-lightbulb me-1" />This post is viral (6× average). Boosting now rides the wave — timing matters more than budget.</div>
    </Modal>
  );
}
