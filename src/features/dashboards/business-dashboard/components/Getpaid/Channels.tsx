import { useEffect, useMemo, useState } from "react";
import {
  Plus, Settings2, ArrowUpRight, AlertTriangle, Wifi, Copy,
  Eye, Loader2, Send, CheckCircle2, Zap, Wallet,
} from "lucide-react";
import type { Channel, Tx } from "../../dataGetpaid";
import { fmt, fmtN, fmtDT, cls, copyText, type QAction } from "../../lib";
import {
  Badge, ChannelIcon, EmptyState, Field, Modal, PillTabs, Section,
  SlideOver, Sparkline, Toggle,
} from "./ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function Channels({
  channels, setChannels, txs, notify, emit, qa, onConsume,
}: {
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  txs: Tx[];
  notify: Notify;
  emit: (q: QAction) => void;
  qa: QAction;
  onConsume: () => void;
}) {
  const [tier, setTier] = useState("active");
  const [configFor, setConfigFor] = useState<Channel | null>(null);
  const [activateFor, setActivateFor] = useState<Channel | null>(null);
  const [txSlide, setTxSlide] = useState<Channel | null>(null);
  const [recvOpen, setRecvOpen] = useState(false);

  useEffect(() => {
    if (!qa) return;
    if (qa.a === "receive") setRecvOpen(true);
    if (qa.a === "configChannel" && typeof qa.p === "string") {
      const ch = channels.find((c) => c.id === qa.p);
      if (ch) setConfigFor(ch);
    }
    onConsume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qa]);

  const list = useMemo(
    () => channels.filter((c) => c.tier === tier),
    [channels, tier]
  );

  const activeTotal = channels.filter((c) => c.tier === "active").reduce((s, c) => s + c.month, 0);

  return (
    <>
      <Section
        no="1.1" sub="Money In · Collection Channels" id="sec-channels"
        title="Payment Methods Hub"
        right={
          <>
            <span className="pm-chip"><Wifi size={14} /> 6 rails monitored live</span>
            <button className="btn pm-btn-primary" onClick={() => setRecvOpen(true)}>
              <Zap size={16} /> Receive Payment
            </button>
          </>
        }
      >
        <div className="d-flex gap-2 align-items-end justify-content-between flex-wrap mb-3">
          <PillTabs
            tabs={[
              { id: "active", label: "Active", count: channels.filter((c) => c.tier === "active").length },
              { id: "pending", label: "Pending Setup", count: channels.filter((c) => c.tier === "pending").length, tone: "warning" },
              { id: "available", label: "Available", count: channels.filter((c) => c.tier === "available").length },
            ]}
            active={tier}
            onChange={setTier}
          />
          <span className="pm-muted pm-fs-13">
            Live collections this month across active rails: <b className="t-primary">{fmt(activeTotal)}</b>
          </span>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={<Wallet size={30} />}
            title="No channels in this tier"
            body="Channels you activate or begin setting up will appear here."
          />
        ) : (
          <div className="row g-3">
            {list.map((c) => (
              <div className="col-12 col-md-6 col-xl-4" key={c.id}>
                <div className={cls("pm-channel-card", c.tier !== "active" && "pm-channel-dim")}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`pm-chan-ic pm-chan-ic-${c.id}`}>
                      <ChannelIcon id={c.id} size={20} />
                    </span>
                    <div className="d-flex flex-column align-items-end gap-1">
                      {c.tier === "active" && <Badge tone="success" dot>Active</Badge>}
                      {c.tier === "pending" && <Badge tone="warning" dot>Pending Setup</Badge>}
                      {c.tier === "available" && <Badge tone="muted">Available</Badge>}
                    </div>
                  </div>
                  <div className="pm-chan-name">{c.name}</div>
                  <div className="pm-chan-desc">{c.desc}</div>
                  <div className="pm-chan-acct">
                    <span>{c.accountLabel}:</span> <b className="pm-mono">{c.account}</b>
                  </div>

                  {c.tier === "active" && (
                    <>
                      <div className="pm-chan-stats">
                        <div>
                          <div className="pm-chan-statv">{fmt(c.month)}</div>
                          <div className="pm-chan-statl">this month · {fmtN(c.txCount)} tx</div>
                        </div>
                        <Sparkline data={c.spark} color={c.id === "pesalink" ? "#0e7490" : "#0ea37f"} />
                      </div>
                      <div className="pm-chan-row">
                        <span className="pm-muted pm-fs-12">Success {c.success}%</span>
                        <span className="pm-fs-12">
                          avg ticket <b>{fmt(c.avgTicket)}</b>
                        </span>
                      </div>
                      {c.warning && (
                        <div className="pm-warn-chip" onClick={() => setConfigFor(c)}>
                          <AlertTriangle size={13} /> {c.warning} <ArrowUpRight size={13} />
                        </div>
                      )}
                      <div className="pm-fee">💡 {c.fee}</div>
                    </>
                  )}

                  {c.tier !== "active" && (
                    <div className="pm-chan-placeholder">
                      {c.tier === "pending"
                        ? "2 of 4 setup steps complete — acquirer documents missing"
                        : c.id === "ussd"
                          ? "Reach feature-phone customers who can't use apps. Safaricom shortcode request takes 3 days."
                          : "Not enabled for this business yet."}
                    </div>
                  )}

                  <div className="d-flex gap-2 mt-2">
                    {c.tier === "active" && (
                      <>
                        <button className="btn pm-btn-soft btn-sm flex-grow-1" onClick={() => setTxSlide(c)}>
                          <Eye size={14} /> View Transactions
                        </button>
                        <button className="btn pm-btn-ghost btn-sm" onClick={() => setConfigFor(c)} aria-label={`Configure ${c.name}`}>
                          <Settings2 size={14} /> Configure
                        </button>
                      </>
                    )}
                    {c.tier === "pending" && (
                      <button className="btn pm-btn-warning-soft btn-sm flex-grow-1" onClick={() => setConfigFor(c)}>
                        Complete Setup →
                      </button>
                    )}
                    {c.tier === "available" && (
                      <button className="btn pm-btn-primary btn-sm flex-grow-1" onClick={() => setActivateFor(c)}>
                        <Plus size={14} /> Activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ── Configure channel modal ── */}
      <ConfigureModal channel={configFor} onClose={() => setConfigFor(null)} notify={notify} setChannels={setChannels} />

      {/* ── Activate channel modal ── */}
      <ActivateModal channel={activateFor} onClose={() => setActivateFor(null)} notify={notify} setChannels={setChannels} />

      {/* ── Channel transactions slide-over ── */}
      <ChannelTxSlide txSlide={txSlide} txs={txs} onClose={() => setTxSlide(null)} emit={emit} notify={notify} />

      {/* ── Receive payment wizard ── */}
      <ReceiveWizard open={recvOpen} onClose={() => setRecvOpen(false)} notify={notify} />
    </>
  );
}

/* ───────────────────────── Configure modal ───────────────────────── */

function ConfigureModal({
  channel, onClose, notify, setChannels,
}: {
  channel: Channel | null;
  onClose: () => void;
  notify: Notify;
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
}) {
  const [paybill, setPaybill] = useState("880321");
  const [callback, setCallback] = useState("");
  const [autoVerify, setAutoVerify] = useState(false);
  const [tillName, setTillName] = useState("TechSol Ltd — Shop Floor");
  const [bank, setBank] = useState("KCB");
  const [acct, setAcct] = useState("1290449123");
  const [acquire, setAcquire] = useState("Safaricom Dawa×Pesapal");
  const [posCount, setPosCount] = useState("2");
  const [online, setOnline] = useState(true);
  const [qrMode, setQrMode] = useState("dynamic");
  const [wallets, setWallets] = useState<string[]>(["M-Pesa", "Airtel Money"]);
  const [baseUrl, setBaseUrl] = useState("pay.link/p/tsl");
  const [defaultExp, setDefaultExp] = useState("30 days");
  const [ussdApp, setUssdApp] = useState(false);

  const patch = (p: Partial<Channel>) =>
    setChannels((cs) => cs.map((c) => (c.id === channel?.id ? { ...c, ...p } : c)));

  const save = (msg: string) => {
    if (!channel) return;
    patch({
      account:
        channel.id === "mpesa-paybill" ? paybill
          : channel.id === "mpesa-till" ? "4105541"
          : channel.id === "pesalink" ? `${bank} •••• ${acct.slice(-4)}`
          : channel.id === "card" ? acquire
          : channel.id === "qr" ? (qrMode === "dynamic" ? "Dynamic QR · v4" : "Static QR · poster")
          : channel.id === "links" ? `${baseUrl} · 6 active`
          : channel.id === "ussd" ? "*483*21#" : channel.account,
      warning: channel.id === "mpesa-paybill" && !callback ? "Callback URL missing — payments may stall verification" : undefined,
      tier: channel.id === "card" && acquire ? "pending" : channel.tier,
    });
    notify({ tone: "success", title: "Settings saved", body: msg });
    onClose();
  };

  if (!channel) return null;
  return (
    <Modal
      open={!!channel} onClose={onClose} kicker="Channel Configuration" title={channel.name} subtitle={channel.desc}
      footer={
        <>
          <button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn pm-btn-primary" onClick={() => save(`${channel.name} configuration updated.`)}>Save Changes</button>
        </>
      }
    >
      <div className="pm-config-summary">
        <span className={`pm-chan-ic pm-chan-ic-${channel.id}`}><ChannelIcon id={channel.id} size={20} /></span>
        <div>
          <div className="fw-bold">{channel.name}</div>
          <div className="pm-muted pm-fs-13">{channel.accountLabel}: <b className="pm-mono">{channel.account}</b></div>
        </div>
        <div className="ms-auto text-end">
          <Badge tone={channel.tier === "active" ? "success" : channel.tier === "pending" ? "warning" : "muted"} dot>
            {channel.tier === "active" ? "Live" : channel.tier === "pending" ? "Incomplete" : "Not enabled"}
          </Badge>
          <div className="pm-fee pm-fs-12 mt-1">{channel.fee}</div>
        </div>
      </div>

      {channel.id === "mpesa-paybill" && (
        <>
          <Field label="Paybill number" req>
            <input className="form-control pm-input" value={paybill} onChange={(e) => setPaybill(e.target.value)} />
          </Field>
          <Field label="Account reference format" hint="What your customers type in the account field. Use INVOICE_NUMBER, CUSTOMER_NAME or custom.">
            <select className="form-select pm-input">
              <option>INVOICE_NUMBER (recommended)</option>
              <option>CUSTOMER_NAME</option>
              <option>ORDER_ID</option>
              <option>Custom prefix</option>
            </select>
          </Field>
          <Field label="Callback URL" hint="Safaricom pushes payment confirmations here. Missing callbacks delay verification by up to 24h.">
            <div className="d-flex gap-2">
              <input className="form-control pm-input" placeholder="https://api.paymo.co.ke/webhooks/mpesa" value={callback} onChange={(e) => setCallback(e.target.value)} />
              <button className="btn pm-btn-soft" onClick={() => { setCallback("https://api.paymo.co.ke/webhooks/mpesa/880321"); notify({ tone: "info", title: "Suggested URL filled", body: "Generate this webhook in Apps & Integrations." }); }}>
                Auto-fill
              </button>
            </div>
            {!callback && <div className="pm-warn-chip mt-2"><AlertTriangle size={13} /> Callback URL not configured — 3 payments awaiting verification</div>}
          </Field>
          <div className="pm-toggle-row">
            <Toggle on={autoVerify} onChange={setAutoVerify} label="Auto-verify payments against invoices" />
          </div>
        </>
      )}

      {channel.id === "mpesa-till" && (
        <>
          <Field label="Till number"><input className="form-control pm-input" defaultValue="4105541" /></Field>
          <Field label="Store / counter name"><input className="form-control pm-input" value={tillName} onChange={(e) => setTillName(e.target.value)} /></Field>
          <Field label="Receipt template" hint="What customers see on their M-Pesa confirmation.">
            <select className="form-select pm-input"><option>Standard Buy Goods receipt</option><option>Custom receipt with logo</option></select>
          </Field>
          <div className="pm-note"><b>Live status:</b> receiving normally. 128 transactions this month.</div>
        </>
      )}

      {channel.id === "pesalink" && (
        <>
          <Field label="Bank"><select className="form-select pm-input" value={bank} onChange={(e) => setBank(e.target.value)}><option>KCB</option><option>Equity</option><option>Co-operative</option><option>NCBA</option><option>I&M</option></select></Field>
          <Field label="Account number"><input className="form-control pm-input" value={acct} onChange={(e) => setAcct(e.target.value)} /></Field>
          <Field label="PesaLink routing code"><input className="form-control pm-input" defaultValue="PSL-0091" /></Field>
          <Field label="Auto-reconcile bank transfers"><Toggle on={true} onChange={() => {}} label="Match transfers to invoices by reference" /></Field>
        </>
      )}

      {channel.id === "card" && (
        <>
          <Field label="Acquirer / gateway" hint="PayMo pre-integrates with Kenyan acquirers. Choose one to continue.">
            <select className="form-select pm-input" value={acquire} onChange={(e) => setAcquire(e.target.value)}>
              <option>Safaricom Dawa×Pesapal</option>
              <option>PayPal (Kenya)</option>
              <option>Pesapal</option>
              <option>Direct POS bank integration</option>
            </select>
          </Field>
          <Field label="POS terminals"><input className="form-control pm-input" value={posCount} onChange={(e) => setPosCount(e.target.value)} /></Field>
          <div className="pm-toggle-row"><Toggle on={online} onChange={setOnline} label="Enable online checkout (Visa / Mastercard)" /></div>
          <div className="pm-note">
            <b>Remaining setup steps:</b> upload acquirer KYC (2 docs) and connect terminal serials. Once saved, your application goes to review (1–2 business days).
          </div>
        </>
      )}

      {channel.id === "qr" && (
        <>
          <Field label="QR mode">
            <div className="pm-radio-grid">
              <button className={cls("pm-radio-card", qrMode === "dynamic" && "pm-radio-on")} onClick={() => setQrMode("dynamic")}>
                <b>Dynamic QR</b><span>Amount editable per sale · expires never</span>
              </button>
              <button className={cls("pm-radio-card", qrMode === "static" && "pm-radio-on")} onClick={() => setQrMode("static")}>
                <b>Static QR</b><span>Printed poster · fixed merchant QR</span>
              </button>
            </div>
          </Field>
          <Field label="Supported wallets">
            <div className="pm-check-grid">
              {["M-Pesa", "Airtel Money", "Equitel", "Bank apps"].map((w) => (
                <button key={w} className={cls("pm-check-chip", wallets.includes(w) && "pm-check-on")}
                  onClick={() => setWallets((x) => (x.includes(w) ? x.filter((y) => y !== w) : [...x, w]))}>
                  {wallets.includes(w) ? "✓ " : ""}{w}
                </button>
              ))}
            </div>
          </Field>
        </>
      )}

      {channel.id === "links" && (
        <>
          <Field label="Base URL"><input className="form-control pm-input" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} /></Field>
          <Field label="Default expiry"><select className="form-select pm-input" value={defaultExp} onChange={(e) => setDefaultExp(e.target.value)}><option>30 days</option><option>7 days</option><option>48 hours</option><option>Never</option></select></Field>
          <div className="pm-toggle-row"><Toggle on={true} onChange={() => {}} label="Send me an alert when a link is paid" /></div>
        </>
      )}

      {channel.id === "ussd" && (
        <>
          <Field label="Shortcode"><input className="form-control pm-input" defaultValue="*483*21#" /></Field>
          <Field label="Menu language"><select className="form-select pm-input"><option>English / Kiswahili</option><option>English only</option><option>Kiswahili only</option></select></Field>
          <Field label="Session fee" hint="KES 1.50 charged by the carrier per session, deducted from collections.">
            <input className="form-control pm-input" defaultValue="1.50" disabled />
          </Field>
          <div className="pm-toggle-row"><Toggle on={ussdApp} onChange={setUssdApp} label="I already have a Safaricom shortcode application number" /></div>
        </>
      )}
    </Modal>
  );
}

/* ───────────────────────── Activate modal ────────────────────────── */

function ActivateModal({
  channel, onClose, notify, setChannels,
}: {
  channel: Channel | null;
  onClose: () => void;
  notify: Notify;
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
}) {
  const [step, setStep] = useState(1);
  const [checks, setChecks] = useState<string[]>(["kyc"]);
  const requirements = channel?.id === "ussd"
    ? ["kyc — Business certificate & KRA PIN on file", "sign — Authorise shortcode request to Safaricom", "fee — Accept KES 1.50 per-session carrier fee"]
    : ["kyc — Acquirer KYC documents on file", "sign — Authorise merchant agreement", "fee — Accept card processing fees"];

  if (!channel) return null;
  const confirm = () => {
    setChannels((cs) =>
      cs.map((c) => (c.id === channel.id ? { ...c, tier: "active" as const, warning: undefined, account: channel.id === "ussd" ? "*483*21# · pending carrier approval" : c.account } : c))
    );
    notify({ tone: "success", title: `${channel.name} activated`, body: channel.id === "ussd" ? "Shortcode request sent to Safaricom. Live in ~3 days." : "Channel is now live and accepting payments." });
    onClose();
  };
  return (
    <Modal
      open={!!channel} onClose={onClose} kicker="Activate Channel" title={`Activate ${channel.name}`} subtitle={channel.desc}
      footer={
        step === 1 ? (
          <>
            <button className="btn pm-btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn pm-btn-primary" onClick={() => setStep(2)} disabled={checks.length < 2}>Continue →</button>
          </>
        ) : (
          <>
            <button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn pm-btn-primary" onClick={confirm}><CheckCircle2 size={15} /> Confirm Activation</button>
          </>
        )
      }
    >
      {step === 1 ? (
        <div>
          <div className="pm-wizard-hint">Tick everything you can confirm. Missing items can be completed after activation.</div>
          <div className="pm-check-list">
            {requirements!.map((r) => {
              const id = r.split(" — ")[0];
              return (
                <button key={r} className={cls("pm-check-list-item", checks.includes(id) && "pm-check-on")}
                  onClick={() => setChecks((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]))}>
                  <span className="pm-checkbox">{checks.includes(id) ? "✓" : ""}</span>
                  <span>{r}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <div className="pm-big-ic"><Zap size={26} /></div>
          <h6 className="fw-bold mt-2">Ready to go live?</h6>
          <p className="pm-muted pm-fs-14">
            {channel.name} will start appearing in your Payment Methods Hub as <Badge tone="success" dot>Active</Badge>.
            {channel.id === "ussd" && " Safaricom approves shortcodes within 3 business days — we'll notify you."}
          </p>
          <div className="pm-cyan-note">You can pause or remove this channel at any time from Configure.</div>
        </div>
      )}
    </Modal>
  );
}

/* ───────────────────────── Channel tx slide-over ─────────────────── */

function ChannelTxSlide({
  txSlide, txs, onClose, emit, notify,
}: {
  txSlide: Channel | null;
  txs: Tx[];
  onClose: () => void;
  emit: (q: QAction) => void;
  notify: Notify;
}) {
  if (!txSlide) return null;
  const related = txs.filter((t) => t.channel.startsWith(txSlide.id === "mpesa-paybill" ? "M-Pesa Paybill" : txSlide.id === "mpesa-till" ? "M-Pesa Till" : txSlide.id === "pesalink" ? "PesaLink" : txSlide.id === "qr" ? "QR" : txSlide.id === "links" ? "Payment Link" : "Card"));
  return (
    <SlideOver open={!!txSlide} onClose={onClose} kicker="Channel Activity" title={`${txSlide.name} — recent transactions`} width={560}>
      {related.length === 0 ? (
        <EmptyState icon={<Wallet size={26} />} title="No recent transactions" body="Activity will appear here as payments arrive on this rail." />
      ) : (
        <div className="pm-tx-list">
          {related.map((t) => (
            <div className="pm-tx-row" key={t.id}>
              <div>
                <div className="fw-semibold pm-fs-14">{t.name ?? "Unknown payer"}</div>
                <div className="pm-muted pm-fs-12">{t.ref} · {t.phone} · {fmtDT(t.t)}</div>
              </div>
              <div className="text-end">
                <div className="fw-bold pm-fs-14">{fmt(t.amount)}</div>
                {t.status === "matched" && <Badge tone="success" dot>Matched</Badge>}
                {t.status === "suggested" && <Badge tone="info" dot>Suggested</Badge>}
                {t.status === "unmatched" && (
                  <button className="pm-link-btn pm-fs-12" onClick={() => { onClose(); emit({ a: "matchTx", p: t }); }}>
                    Match to invoice →
                  </button>
                )}
                {t.status === "partial" && <Badge tone="warning" dot>Partial</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 d-flex gap-2">
        <button className="btn pm-btn-soft btn-sm flex-grow-1" onClick={() => { onClose(); emit({ a: "sync" }); }}>Sync M-Pesa now</button>
        <button className="btn pm-btn-ghost btn-sm" onClick={async () => {
          await copyText(related.map((t) => `${t.ref},${t.amount},${t.status}`).join("\n"));
          notify({ tone: "info", title: "Transaction list copied" });
        }}><Copy size={14} /> Copy list</button>
      </div>
    </SlideOver>
  );
}

/* ───────────────────────── Receive payment wizard ────────────────── */

function ReceiveWizard({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: Notify }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("1500");
  const [customer, setCustomer] = useState("");
  const [ref, setRef] = useState("");
  const [method, setMethod] = useState("stk");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const reset = () => { setStep(1); setAmount("1500"); setCustomer(""); setRef(""); setMethod("stk"); setPhone(""); setSending(false); setSent(false); };
  const close = () => { onClose(); window.setTimeout(reset, 300); };

  const exec = () => {
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
      notify({ tone: "success", title: `Collection request sent`, body: method === "stk" ? `M-Pesa PIN prompt pushed to ${phone || "customer's phone"}.` : "Link/QR generated and ready to share." });
    }, 1600);
  };

  return (
    <Modal
      open={open} onClose={close} kicker="Receive Payment" title="Collect money from a customer"
      size="md" hideClose={sending}
      footer={
        sent ? (
          <button className="btn pm-btn-primary w-100" onClick={close}>Done</button>
        ) : step === 1 ? (
          <>
            <button className="btn pm-btn-ghost" onClick={close}>Cancel</button>
            <button className="btn pm-btn-primary" disabled={!amount || Number(amount) <= 0} onClick={() => setStep(2)}>Continue →</button>
          </>
        ) : step === 2 ? (
          <>
            <button className="btn pm-btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn pm-btn-primary" onClick={() => setStep(3)}>Continue →</button>
          </>
        ) : (
          <>
            <button className="btn pm-btn-ghost" disabled={sending} onClick={() => setStep(2)}>← Back</button>
            <button className="btn pm-btn-primary" disabled={sending || (method === "stk" && !phone)} onClick={exec}>
              {sending ? <><Loader2 size={15} className="pm-spin" /> Triggering…</> : <><Send size={15} /> {method === "stk" ? "Trigger STK Push" : method === "qr" ? "Generate QR" : "Create Link"}</>}
            </button>
          </>
        )
      }
    >
      {sent ? (
        <div className="text-center py-4">
          <div className="pm-big-ic pm-big-ic-success"><CheckCircle2 size={28} /></div>
          <h5 className="fw-bold mt-3">Request sent!</h5>
          <p className="pm-muted">
            {method === "stk"
              ? <>M-Pesa PIN prompt is on your customer's phone. Awaiting <b>{fmt(Number(amount) || 0)}</b> — this updates automatically when they pay.</>
              : method === "qr"
                ? <>QR generated for <b>{fmt(Number(amount) || 0)}</b>. Show this screen or download it for print.</>
                : <>Payment link created for <b>{fmt(Number(amount) || 0)}</b>. Share it via SMS or WhatsApp.</>}
          </p>
          <div className="pm-wait-dots my-3"><span /><span /><span /></div>
          <div className="pm-cyan-note">You'll get a notification the second the payment settles.</div>
        </div>
      ) : step === 1 ? (
        <div className="pm-wizard-grid">
          <Field label="Amount (KES)" req><input type="number" className="form-control pm-input pm-input-lg" placeholder="1,500" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Field label="Customer name (optional)"><input className="form-control pm-input" placeholder="Who is paying?" value={customer} onChange={(e) => setCustomer(e.target.value)} /></Field>
          <Field label="Reference / Order ID" hint="Useful for matching later — e.g. an invoice number."><input className="form-control pm-input" placeholder="INV-0145" value={ref} onChange={(e) => setRef(e.target.value)} /></Field>
        </div>
      ) : step === 2 ? (
        <div>
          <div className="pm-wizard-hint">Choose how the customer will pay. All methods settle into your business wallet.</div>
          <div className="pm-method-grid">
            <button className={cls("pm-method", method === "stk" && "pm-method-on")} onClick={() => setMethod("stk")}>
              <span className="pm-method-ic pm-method-ic-stk"><Zap size={18} /></span>
              <b>M-Pesa STK Push</b><span>Send PIN prompt to their phone</span>
            </button>
            <button className={cls("pm-method", method === "qr" && "pm-method-on")} onClick={() => setMethod("qr")}>
              <span className="pm-method-ic pm-method-ic-qr"><Wallet size={18} /></span>
              <b>Dynamic QR Code</b><span>Customer scans to pay</span>
            </button>
            <button className={cls("pm-method", method === "link" && "pm-method-on")} onClick={() => setMethod("link")}>
              <span className="pm-method-ic pm-method-ic-link"><Send size={18} /></span>
              <b>Payment Link</b><span>Send link via SMS / WhatsApp</span>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="pm-summary-card">
            <div className="pm-summary-row"><span>Amount</span><b>{fmt(Number(amount) || 0)}</b></div>
            <div className="pm-summary-row"><span>Method</span><b>{method === "stk" ? "M-Pesa STK Push" : method === "qr" ? "Dynamic QR" : "Payment Link"}</b></div>
            {customer && <div className="pm-summary-row"><span>Customer</span><b>{customer}</b></div>}
            {ref && <div className="pm-summary-row"><span>Reference</span><b className="pm-mono">{ref}</b></div>}
          </div>
          {method === "stk" && (
            <Field label="Customer phone number" req hint="Format: 07XX XXX XXX or +2547…">
              <input className="form-control pm-input" placeholder="0712 445 890" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <div className="pm-note mt-2">Clicking the button triggers an M-Pesa PIN prompt on the customer's phone. They approve it to pay.</div>
            </Field>
          )}
          {(method === "qr" || method === "link") && (
            <div className="pm-note">The {method === "qr" ? "QR code" : "link"} will be generated immediately and expire in 24 hours.</div>
          )}
        </div>
      )}
    </Modal>
  );
}
