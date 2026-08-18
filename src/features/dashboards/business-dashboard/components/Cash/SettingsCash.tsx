import { useState } from "react";
import {
  Bell, Globe, ShieldCheck, KeyRound, Archive,
} from "lucide-react";
import type { Account } from "../../dataCash";
import { fmtMoney } from "../../dataCash";
import { cls, type QAction } from "../../lib";
import { Field, Modal, Section, Toggle } from "../Getpaid/ui";

type Notify = (t: { tone: "success" | "warning" | "danger" | "info"; title: string; body?: string }) => void;

export default function SettingsCash({ accounts, notify }: {
  accounts: Account[];
  notify: Notify;
  emit?: (q: QAction) => void;
  qa?: QAction;
  onConsume?: () => void;
}) {
  const [alerts, setAlerts] = useState(false);
  const [display, setDisplay] = useState(false);
  const [security, setSecurity] = useState(false);
  const [dormant, setDormant] = useState({ on: true, months: 12 });
  const [lowBalance, setLowBalance] = useState<Record<string, { on: boolean; at: string }>>({
    a1: { on: true, at: "500000" },
    a2: { on: true, at: "100000" },
  });

  const lowAlertsOn = Object.values(lowBalance).filter((v) => v.on).length;

  return (
    <>
      <Section
        no="3.9" sub="Your Money · Wallet Admin" id="sec-wallet-settings"
        title="Account & Wallet Settings"
        right={
          <span className="pm-chip"><ShieldCheck size={14} /> 2FA on · device trusted</span>
        }
      >
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="pm-card h-100">
              <div className="pm-card-head">
                <div className="pm-card-title">Low-balance alerts</div>
                <button className="pm-link-btn pm-fs-12" onClick={() => setAlerts(true)}>Configure all →</button>
              </div>
              {accounts.filter((a) => a.currency === "KES").slice(0, 6).map((a) => {
                const cfg = lowBalance[a.id];
                return (
                  <div className="pm-sched-row" key={a.id}>
                    <div className="flex-grow-1">
                      <div className="fw-semibold pm-fs-13">{a.name}</div>
                      <div className="pm-muted pm-fs-11">{cfg && cfg.on ? `Alert below ${fmtMoney(Number(cfg.at))}` : "Alerts off"}</div>
                    </div>
                    <Toggle
                      on={cfg?.on ?? false}
                      onChange={(v) => setLowBalance((x) => ({ ...x, [a.id]: { on: v, at: x[a.id]?.at ?? "100000" } }))}
                    />
                  </div>
                );
              })}
              <div className="pm-note mt-2">{lowAlertsOn} alert(s) active — delivered via push + WhatsApp.</div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="pm-card h-100">
              <div className="pm-card-head"><div className="pm-card-title">Wallet preferences</div></div>
              {[
                { icon: <Globe size={16} />, title: "Display currency", sub: "KES (KSh) — base currency", action: () => setDisplay(true) },
                { icon: <Bell size={16} />, title: "Statement notifications", sub: "Monthly statement to billing@techsol.co.ke", action: () => setAlerts(true) },
                { icon: <KeyRound size={16} />, title: "Security & PIN", sub: "Change PIN · re-pair token · 2FA devices", action: () => setSecurity(true) },
                { icon: <Archive size={16} />, title: "Dormant account handling", sub: dormant.on ? `Auto-pause after ${dormant.months} months of no activity` : "Off", action: () => notify({ tone: "info", title: "Dormant policy", body: "Paused accounts keep their balance but stop new transactions until you reactivate them." }) },
              ].map((r, i) => (
                <button className="pm-priority-row" key={i} onClick={r.action}>
                  <span className="pm-prio-ic pm-prio-good">{r.icon}</span>
                  <span className="flex-grow-1 text-start">
                    <b>{r.title}</b>
                    <span className="pm-muted pm-fs-12 d-block">{r.sub}</span>
                  </span>
                  <span className="pm-arrow">→</span>
                </button>
              ))}
              <div className="pm-toggle-row mt-2 px-2">
                <Toggle on={dormant.on} onChange={(v) => setDormant({ ...dormant, on: v })} label={`Auto-pause dormant accounts after ${dormant.months} months`} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── alerts config ── */}
      <Modal open={alerts} onClose={() => setAlerts(false)} kicker="Alerts" title="Balance alert settings"
        footer={<button className="btn pm-btn-primary w-100" onClick={() => { notify({ tone: "success", title: "Alert settings saved", body: "Push + WhatsApp + email, per your delivery rules." }); setAlerts(false); }}>Save settings</button>}
      >
        {accounts.filter((a) => a.currency === "KES").slice(0, 4).map((a) => (
          <div className="pm-sched-row" key={a.id}>
            <div className="flex-grow-1">
              <div className="fw-semibold pm-fs-13">{a.name}</div>
              <input
                type="number" className="form-control form-control-sm pm-input pm-w-150"
                value={lowBalance[a.id]?.at ?? ""} placeholder="threshold"
                onChange={(e) => setLowBalance((x) => ({ ...x, [a.id]: { on: x[a.id]?.on ?? false, at: e.target.value } }))}
              />
            </div>
            <Toggle on={lowBalance[a.id]?.on ?? false} onChange={(v) => setLowBalance((x) => ({ ...x, [a.id]: { on: v, at: x[a.id]?.at ?? "100000" } }))} />
          </div>
        ))}
        <Field label="Deliver via"><div className="pm-check-grid">{["Push", "WhatsApp", "Email"].map((m) => <button key={m} className="pm-check-chip pm-check-on">{m}</button>)}</div></Field>
      </Modal>

      {/* ── display settings ── */}
      <Modal open={display} onClose={() => setDisplay(false)} kicker="Display" title="Currency & number display"
        footer={<button className="btn pm-btn-primary w-100" onClick={() => { notify({ tone: "success", title: "Display updated", body: "All amounts now render in KES with thousands separators." }); setDisplay(false); }}>Save</button>}
      >
        <Field label="Base currency"><select className="form-select pm-input"><option>KES (KSh)</option><option>USD</option><option>EUR</option></select></Field>
        <Field label="Number format"><div className="pm-mode-tabs"><button className={cls("pm-mode-tab pm-mode-on")}>1,234,567</button><button className="pm-mode-tab">1.234.567</button></div></Field>
        <Field label="Compact amounts"><Toggle on={true} onChange={() => {}} label="Show KES 1.2M instead of KES 1,234,567 in cards" /></Field>
      </Modal>

      {/* ── security ── */}
      <Modal open={security} onClose={() => setSecurity(false)} kicker="Security" title="Wallet security" subtitle="PIN, token pairing and device sessions."
        footer={<button className="btn pm-btn-primary w-100" onClick={() => { notify({ tone: "success", title: "Security updated", body: "PIN rotation scheduled and devices pruned." }); setSecurity(false); }}>Save security settings</button>}
      >
        <Field label="Change wallet PIN"><input type="password" className="form-control pm-input" placeholder="New 4–6 digit PIN" /></Field>
        <Field label="Re-pair hardware token"><button className="pm-upload" onClick={() => notify({ tone: "info", title: "Token pairing started", body: "Press the button on your token to confirm (demo)." })}><KeyRound size={15} /> Start pairing</button></Field>
        <div className="pm-toggle-row"><Toggle on={true} onChange={() => {}} label="Require PIN for every external transfer" /></div>
        <div className="pm-toggle-row"><Toggle on={true} onChange={() => {}} label="Auto-lock after 5 failed PIN attempts" /></div>
      </Modal>
    </>
  );
}
