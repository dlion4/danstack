/* ============================================================================
 * wallet-activation/modals/WalletActivationModals.tsx
 * ----------------------------------------------------------------------------
 * All modals for the Wallet Activation & Cross-Dashboard Hub (Page 20).
 * Refactored from the legacy 1.18.html modal blocks — every modal is
 * state-driven through the shared modal primitives (no Bootstrap-JS, no
 * innerHTML). Implements the Page 20 outline sections 20.1–20.7:
 *
 *   20.1  Primary wallet & identity anchor
 *   20.2  Dashboard activation gateway (consent suite, PIN gate, tour)
 *   20.3  Cross-dashboard account linkage (directory, permissions,
 *         notifications, unlink/relink/revoke)
 *   20.4  Money Relocation Wizard (8-step fund safety protocol)
 *   20.5  Account security & session management
 *   20.6  User profile & account controls
 *   20.7  Advanced linkage configuration (auto-rules, naming, limits)
 * ========================================================================== */
"use client";

import { useState } from "react";
import shared from "../../transaction-dashboard/shared/styles/appPage.module.css";
import {
  FlowModal,
  InfoBox,
  ModalShell,
  ReviewRow,
  SelectField,
  SimpleModal,
  TabbedModal,
  Toggle,
  // } from "../../dashboards/transaction-dashboard/shared/components/modals.tsx";
} from "../../transaction-dashboard/shared/components/modals";

const s = shared as Record<string, string>;

export interface WalletActivationModalsProps {
  modalState: Record<string, boolean>;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
}

export function WalletActivationModals({
  modalState,
  openModal,
  closeModal,
}: WalletActivationModalsProps) {
  const isOpen = (id: string) => !!modalState[id];
  const close = (id: string) => closeModal(id);

  /* ---- shared local state ---- */
  const [activeDash, setActiveDash] = useState("Business Portal");
  const [linkTab, setLinkTab] = useState(0);
  const [permsTab, setPermsTab] = useState(0);
  const [pinTab, setPinTab] = useState(0);
  const [rulesTab, setRulesTab] = useState(0);
  const [namingTab, setNamingTab] = useState(0);
  const [tourStep, setTourStep] = useState(0);
  const [relocationDestination, setRelocationDestination] = useState(
    "Transfer to Primary PayMo Wallet"
  );
  const [selectedLinkAccount, setSelectedLinkAccount] = useState<string | null>(null);
  const [linkSourceWallet, setLinkSourceWallet] = useState<string | null>(null);
  const [linkDestinationWallet, setLinkDestinationWallet] = useState<string | null>(null);
  const [linkPermissionPreset, setLinkPermissionPreset] = useState<string>("Full Control");

  const fieldGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  };

  const fullRow: React.CSSProperties = { gridColumn: "1 / -1" };






  /* ================= W5. Dashboard Activation Consent Suite ================= */
  const [consentChecks, setConsentChecks] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true });
  const [expandConsent, setExpandConsent] = useState<number | null>(null);
  const toggleConsent = (i: number) =>
    setConsentChecks((prev) => ({ ...prev, [i]: !prev[i] }));

  const consentItems = [
    { name: "Terms of Service", desc: "General terms governing use of this PayMo dashboard." },
    { name: "Acceptable Use Policy (AUP)", desc: "What you can and cannot do with dashboard features." },
    { name: "AML Compliance Declaration", desc: "You confirm funds are from legitimate sources." },
    { name: "CTF Acknowledgment", desc: "You agree to flag suspicious transactions." },
    { name: "Data Sharing Consent", desc: "Allows cross-dashboard balance visibility for linked accounts." },
    { name: "Cross-Dashboard Transaction Authorization", desc: "Permits transfers between your linked dashboards." },
    { name: "Regulatory Compliance Attestation", desc: "CBK / KRA / sector-specific compliance confirmation." },
    { name: "Fee Schedule & Pricing Acknowledgment", desc: "You accept the published fees for this dashboard." },
    { name: "Privacy Policy Addendum", desc: "Dashboard-specific data processing addendum." },
  ];

  const activateDashboardModal = (
    <FlowModal
      show={isOpen("activateDashboardModal")}
      onClose={() => close("activateDashboardModal")}
      iconCls="bi bi-stars"
      title={`Activate ${activeDash} Services`}
      steps={["Accept consent", "Confirm PIN", "Activated"]}
      confirmLabel="Confirm & Activate"
    >
      {(step) => {
        if (step === 1) {
          return (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: "14px 16px", borderRadius: 12, background: "var(--success-bg)", color: "#047857" }}>
                <i className="bi bi-lightning-charge-fill" style={{ fontSize: 22 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Activating {activeDash}</div>
                  <div style={{ fontSize: 12, color: "#065F46" }}>Review and accept the consent items below to unlock this dashboard.</div>
                </div>
              </div>
              <div className={s.softBox} style={{ marginBottom: 14 }}>
                <Toggle
                  checked={Object.values(consentChecks).every(Boolean)}
                  onChange={(next) => {
                    const all: Record<number, boolean> = {};
                    consentItems.forEach((_, i) => (all[i] = next));
                    setConsentChecks(all);
                  }}
                  label="Accept all required consents"
                  description="Toggles every mandatory item below"
                />
              </div>
              <div>
                {consentItems.map((item, i) => (
                  <div key={item.name} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: "1px dashed var(--border)" }}>
                    <button
                      type="button"
                      onClick={() => toggleConsent(i)}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 7,
                        border: consentChecks[i] ? "2px solid var(--pri)" : "2px solid var(--border-2)",
                        background: consentChecks[i] ? "var(--pri)" : "#fff",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        flexShrink: 0,
                        marginTop: 1,
                        cursor: "pointer",
                      }}
                    >
                      {consentChecks[i] && <i className="bi bi-check" />}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {item.name}
                        {i === consentItems.length - 1 && (
                          <span style={{ fontSize: 10, fontWeight: 600, marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "var(--purple-bg)", color: "#6d28d9" }}>
                            Optional
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{item.desc}</div>
                      <button
                        type="button"
                        className={s.button}
                        style={{ border: "none", background: "transparent", color: "var(--pri)", padding: 0, marginTop: 4, fontSize: 11, fontWeight: 600 }}
                        onClick={() => setExpandConsent(expandConsent === i ? null : i)}
                      >
                        {expandConsent === i ? "Hide summary" : "View clause summary"}
                      </button>
                      {expandConsent === i && (
                        <div style={{ fontSize: 11, color: "var(--ink-700)", background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", marginTop: 6, lineHeight: 1.55 }}>
                          Clause 3.1 — You agree to keep account credentials confidential, only transact with
                          legitimate funds, and report any suspicious activity to PayMo compliance within 24 hours.
                          This consent is captured with a timestamp and IP address for the audit trail.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (step === 2) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--info-bg)", color: "var(--info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                <i className="bi bi-shield-lock" />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0, textAlign: "center" }}>
                You are activating {activeDash}
              </p>
              <p style={{ fontSize: 12, color: "var(--ink-500)", textAlign: "center", maxWidth: 360, margin: 0 }}>
                Enter your 4-digit PayMo PIN to confirm this activation. This action is logged to your
                security audit trail with timestamp and IP.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                {["_", "_", "_", "_"].map((_, i) => (
                  <input
                    key={i}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    style={{
                      width: 48,
                      height: 56,
                      textAlign: "center",
                      fontSize: 22,
                      fontWeight: 700,
                      border: "2px solid var(--border)",
                      borderRadius: 10,
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-500)", textAlign: "center" }}>
                3 attempts before a 15-minute lockout. SMS OTP fallback available after 2 failed attempts.
                <br />
                <a href="#" style={{ color: "var(--pri)", fontWeight: 600 }}>Why am I seeing this?</a>
              </div>
            </div>
          );
        }
        return (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--success-bg)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 14px" }}>
              <i className="bi bi-check-lg" />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>
              Welcome to {activeDash}
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-500)", margin: "6px 0 16px", maxWidth: 380 }}>
              Your activation is complete. An activation certificate was generated and a welcome
              notification sent to your preferred channel.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => openModal("tourGuideModal")}>
                <i className="bi bi-play-circle" /> Take a Tour
              </button>
              <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => openModal("linkAccountModal")}>
                <i className="bi bi-link-45deg" /> Link Accounts
              </button>
              <button className={s.button}>Go to Dashboard</button>
              <button className={s.button} onClick={() => openModal("preferencesModal")}>
                <i className="bi bi-gear" /> Set Preferences
              </button>
            </div>
          </div>
        );
      }}
    </FlowModal>
  );

  /* ================= W6. Dashboard Tour Guide Launcher ================= */
  const tourSteps = [
    { icon: "bi bi-grid-1x2", title: "Dashboard Overview", desc: "A snapshot of your balances, active links, recent activity and quick actions." },
    { icon: "bi bi-wallet2", title: "Linked Accounts", desc: "All accounts linked to this dashboard, their balances and permission levels." },
    { icon: "bi bi-arrow-left-right", title: "Transfers", desc: "Send and receive money between this dashboard and any linked account." },
    { icon: "bi bi-sliders", title: "Permissions", desc: "Control visibility, inbound/outbound transfers and auto-sweep rules." },
    { icon: "bi bi-bell", title: "Notifications", desc: "Configure alerts for balance, transactions and link changes." },
    { icon: "bi bi-shield-check", title: "Security", desc: "Manage sessions, PIN and biometric requirements for this dashboard." },
    { icon: "bi bi-clock-history", title: "Activity & Logs", desc: "Review every event on this dashboard with full audit detail." },
    { icon: "bi bi-gear-wide-connected", title: "Settings", desc: "Customize naming, limits and automation rules for this dashboard." },
  ];
  const tourGuideModal = (
    <ModalShell
      show={isOpen("tourGuideModal")}
      onClose={() => close("tourGuideModal")}
      iconCls="bi bi-signpost-2"
      title="Dashboard Tour Guide"
      size="lg"
      footer={
        <>
          <button className={s.button} onClick={() => close("tourGuideModal")}>
            Skip Tour
          </button>
          <button
            className={`${s.button} ${tourStep === tourSteps.length - 1 ? s.buttonPrimary : s.button}`}
            onClick={() => (tourStep < tourSteps.length - 1 ? setTourStep(tourStep + 1) : close("tourGuideModal"))}
          >
            {tourStep === tourSteps.length - 1 ? (
              <>
                Finish <i className="bi bi-check-lg" />
              </>
            ) : (
              <>
                Next <i className="bi bi-arrow-right" />
              </>
            )}
          </button>
        </>
      }
    >
      <div className={s.stepper}>
        {tourSteps.map((_, i) => (
          <span key={i} className={`${s.step} ${i === tourStep ? s.stepActive : i < tourStep ? s.stepDone : ""}`}>
            <span className={s.stepNum}>{i < tourStep ? <i className="bi bi-check" /> : i + 1}</span>
            {i < tourSteps.length - 1 && <span className={s.stepLine} />}
          </span>
        ))}
      </div>
      <div style={{ textAlign: "center", padding: "12px 24px 20px" }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 22,
            background: "var(--success-bg)",
            color: "var(--success)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            margin: "0 auto 18px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <i className={tourSteps[tourStep].icon} />
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>
          {tourSteps[tourStep].title}
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-700)", margin: "8px auto 0", maxWidth: 420, lineHeight: 1.6 }}>
          {tourSteps[tourStep].desc}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
          {tourSteps.map((_, i) => (
            <span
              key={i}
              onClick={() => setTourStep(i)}
              style={{
                width: i === tourStep ? 20 : 8,
                height: 8,
                borderRadius: 999,
                background: i === tourStep ? "var(--pri)" : "var(--border-2)",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
      <InfoBox variant="info">
        <i className="bi bi-gift" /> Completing the tour earns you 200 reward points. You can replay it
        anytime from dashboard settings.
      </InfoBox>
    </ModalShell>
  );

  /* ================= W7. Activation success receipt ================= */
  const activationSuccessModal = (
    <SimpleModal
      show={isOpen("activationSuccessModal")}
      onClose={() => close("activationSuccessModal")}
      size="lg"
      iconCls="bi bi-check-circle"
      title="Dashboard Activated"
      successTitle="Business Portal activated!"
      successMsg="Your consent was recorded with a timestamp and IP audit entry. Welcome notification sent."
      successRef="ACT-20250627-3321"
    />
  );

  /* ================= W8. Link Account wizard ================= */
  const linkAccountModal = (
    <FlowModal
      show={isOpen("linkAccountModal")}
      onClose={() => close("linkAccountModal")}
      iconCls="bi bi-link-45deg"
      title="Link Account"
      steps={["Select source", "Select destination", "Flow preview", "Configure permissions", "Confirm PIN"]}
      confirmLabel="Link Account"
    >
      {(step) => {
        if (step === 1) {
          return (
            <div>
              <InfoBox variant="info">
                <i className="bi bi-wallet2" /> Select the source wallet you want to link from
              </InfoBox>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "var(--ink-700)", marginBottom: 12 }}>Available Source Wallets</div>
                {[
                  { id: 1, name: "PayMo KES Wallet", origin: "Transaction Hub", number: "•••• 5530", balance: "KES 1,284,300", grad: "linear-gradient(135deg,#059669,#10b981)", letter: "P" },
                  { id: 2, name: "Business Float", origin: "Business Portal", number: "•••• 2207", balance: "KES 6,150,000", grad: "linear-gradient(135deg,#7c3aed,#8b5cf6)", letter: "B" },
                  { id: 3, name: "Savings Jar", origin: "Savings & Investments", number: "•••• 7793", balance: "KES 480,000", grad: "linear-gradient(135deg,#b45309,#f59e0b)", letter: "S" },
                ].map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => setLinkSourceWallet(acc.name)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: linkSourceWallet === acc.name ? "2px solid var(--pri)" : "1px solid var(--border)",
                      background: linkSourceWallet === acc.name ? "var(--success-bg)" : "var(--surface-2)",
                      cursor: "pointer",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: acc.grad, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {acc.letter}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{acc.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{acc.origin} • {acc.number}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{acc.balance}</div>
                      <i className={`bi ${linkSourceWallet === acc.name ? "bi-check-circle-fill" : "bi-circle"}`} style={{ color: linkSourceWallet === acc.name ? "var(--pri)" : "var(--ink-300)", fontSize: 17 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (step === 2) {
          return (
            <div>
              <InfoBox variant="info">
                <i className="bi bi-arrow-right" /> Select the destination wallet to link {linkSourceWallet || 'the source wallet'} to
              </InfoBox>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "var(--ink-700)", marginBottom: 12 }}>Available Destination Wallets</div>
                {[
                  { id: 1, name: "Loan Disbursement", origin: "Loans & Credit", number: "•••• 8910", balance: "KES 0", grad: "linear-gradient(135deg,#3b82f6,#2563eb)", letter: "L" },
                  { id: 2, name: "Fiat On-ramp", origin: "Crypto Center", number: "•••• 0042", balance: "USD 2,410", grad: "linear-gradient(135deg,#ef4444,#dc2626)", letter: "C" },
                  { id: 3, name: "Developer Portal", origin: "Developer Portal", number: "•••• 9091", balance: "KES 2,100,000", grad: "linear-gradient(135deg,#8b5cf6,#a78bfa)", letter: "D" },
                ].map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => setLinkDestinationWallet(acc.name)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: linkDestinationWallet === acc.name ? "2px solid var(--pri)" : "1px solid var(--border)",
                      background: linkDestinationWallet === acc.name ? "var(--success-bg)" : "var(--surface-2)",
                      cursor: "pointer",
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: acc.grad, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {acc.letter}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{acc.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{acc.origin} • {acc.number}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{acc.balance}</div>
                      <i className={`bi ${linkDestinationWallet === acc.name ? "bi-check-circle-fill" : "bi-circle"}`} style={{ color: linkDestinationWallet === acc.name ? "var(--pri)" : "var(--ink-300)", fontSize: 17 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (step === 3) {
          return (
            <div>
              <InfoBox variant="warning">
                <i className="bi bi-diagram-3" /> Review how money will flow between these wallets
              </InfoBox>
              <div style={{ marginTop: 16, padding: "16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--pri)" }}>{linkSourceWallet || 'Source'}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Source Wallet</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="bi bi-arrow-left-right" style={{ fontSize: 20, color: "var(--success)" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--success)" }}>Bidirectional</span>
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--pri)" }}>{linkDestinationWallet || 'Destination'}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Destination Wallet</div>
                  </div>
                </div>
                <div style={{ padding: "12px", borderRadius: 8, background: "var(--success-bg)", border: "1px solid var(--success)", fontSize: 12, color: "#065F46" }}>
                  <i className="bi bi-info-circle" /> With the default Full Control permission, money can flow freely in both directions. You can customize this in the next step.
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>What this means:</div>
                  <ul style={{ fontSize: 11, color: "var(--ink-700)", paddingLeft: 16, margin: 0 }}>
                    <li>Both wallets can see each other's balances</li>
                    <li>Transfers can be initiated from either wallet</li>
                    <li>Auto-sweep and auto-top-up rules can be configured</li>
                    <li>Transaction history is shared between both</li>
                  </ul>
                </div>
              </div>
            </div>
          );
        }
        if (step === 4) {
          return (
            <div>
              <InfoBox variant="info">
                <i className="bi bi-sliders" /> Configure permissions and financial capabilities
              </InfoBox>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "var(--ink-700)", marginBottom: 12 }}>Permission Preset</div>
                {[
                  { name: "Full Control", desc: "Bidirectional flow + all features", active: true },
                  { name: "View + Transfer In/Out", desc: "Balance visible with bidirectional transfers", active: false },
                  { name: "View + Transfer In", desc: "Receive into destination only", active: false },
                  { name: "View Only", desc: "Balance visible, no transfers", active: false },
                ].map((p) => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: p.active ? "2px solid var(--pri)" : "1px solid var(--border)", background: p.active ? "var(--success-bg)" : "var(--surface-2)", marginBottom: 8, cursor: "pointer" }}>
                    <i className={`bi ${p.active ? "bi-check-circle-fill" : "bi-circle"}`} style={{ color: p.active ? "var(--pri)" : "var(--ink-300)", fontSize: 17 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
                
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "var(--ink-700)", marginBottom: 8 }}>Toggle Additional Features</div>
                  <Toggle checked={true} onChange={() => { }} label="Balance Visibility" description="Allow both wallets to see each other's balance" />
                  <Toggle checked={true} onChange={() => { }} label="Transaction History" description="Share full transaction history between wallets" />
                  <Toggle checked={false} onChange={() => { }} label="Auto-Sweep" description="Move excess balance above threshold automatically" />
                  <Toggle checked={false} onChange={() => { }} label="Auto-Top-Up" description="Refill when balance drops below threshold" />
                  <Toggle checked={true} onChange={() => { }} label="Notification Sharing" description="Receive alerts about transactions on linked wallet" />
                </div>
              </div>
            </div>
          );
        }
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
            <div style={{ textAlign: "center", maxWidth: 400 }}>
              <p style={{ fontSize: 13, color: "var(--ink-700)", margin: 0 }}>
                Confirm with your PIN to link <strong>{linkSourceWallet || 'source wallet'}</strong> to <strong>{linkDestinationWallet || 'destination wallet'}</strong> with <strong>Full Control</strong> permissions.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {["_", "_", "_", "_"].map((_, i) => (
                <input key={i} type="password" inputMode="numeric" maxLength={1} style={{ width: 48, height: 56, textAlign: "center", fontSize: 22, fontWeight: 700, border: "2px solid var(--border)", borderRadius: 10 }} />
              ))}
            </div>
            <InfoBox variant="success">
              <i className="bi bi-shield-check" /> Linking is instant and reversible. You can modify permissions or unlink at any time from the links panel.
            </InfoBox>
          </div>
        );
      }}
    </FlowModal>
  );

  /* ================= W9. Link permission controls ================= */
  const linkPermissionsModal = (
    <TabbedModal
      show={isOpen("linkPermissionsModal")}
      onClose={() => close("linkPermissionsModal")}
      iconCls="bi bi-sliders"
      title={`Permission Controls - ${selectedLinkAccount || 'Account'}`}
      tabs={[
        {
          key: "presets",
          label: "Presets",
          render: () => (
            <div>
              <InfoBox variant="info">
                <i className="bi bi-info-circle" /> Quick permission presets for {selectedLinkAccount || 'this account'}
              </InfoBox>
              {[
                { name: "Full Inter-Dashboard Access", desc: "Enables all toggles below - bidirectional flow", active: true },
                { name: "View Only", desc: "Balance visible, no transfers allowed", active: false },
                { name: "One-Way In", desc: "Can receive funds only - no outbound transfers", active: false },
                { name: "One-Way Out", desc: "Can send funds only - no inbound transfers", active: false },
                { name: "Custom", desc: "User-defined combination of permissions", active: false },
              ].map((p) => (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: p.active ? "2px solid var(--pri)" : "1px solid var(--border)", background: p.active ? "var(--success-bg)" : "var(--surface-2)", marginBottom: 8, cursor: "pointer" }}>
                  <i className={`bi ${p.active ? "bi-check-circle-fill" : "bi-circle"}`} style={{ color: p.active ? "var(--pri)" : "var(--ink-300)", fontSize: 16 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          key: "granular",
          label: "Granular",
          render: () => (
            <div>
              <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "var(--ink-700)", marginBottom: 4 }}>Financial Permissions</div>
                <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Control how money can flow between accounts</div>
              </div>
              <Toggle checked onChange={() => { }} label="Balance Visibility" description="Allow this dashboard to see balance from {selectedLinkAccount}" />
              <Toggle checked onChange={() => { }} label="Inbound Transfers" description="Allow money to flow INTO this dashboard from {selectedLinkAccount}" />
              <Toggle checked onChange={() => { }} label="Outbound Transfers" description="Allow money to flow OUT to {selectedLinkAccount}" />
              <Toggle checked={false} onChange={() => { }} label="Auto-Sweep" description="Move excess balance above threshold automatically" />
              <Toggle checked={false} onChange={() => { }} label="Auto-Top-Up" description="Refill this dashboard when balance drops below threshold" />
              
              <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid var(--border)", marginTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "var(--ink-700)", marginBottom: 4 }}>Data & Notifications</div>
                <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Control information sharing and alerts</div>
              </div>
              <Toggle checked onChange={() => { }} label="Notification Sharing" description="Receive alerts about transactions on {selectedLinkAccount}" />
              <Toggle checked onChange={() => { }} label="Statement Access" description="Include {selectedLinkAccount} in consolidated statements" />
              <Toggle checked onChange={() => { }} label="Transaction History" description="View full transaction history from {selectedLinkAccount}" />
            </div>
          ),
        },
      ]}
      footer={
        <>
          <button className={s.button} onClick={() => close("linkPermissionsModal")}>
            Cancel
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => close("linkPermissionsModal")}>
            Save Permissions
          </button>
        </>
      }
    />
  );

  /* ================= W10. Notification & alert routing ================= */
  const linkNotificationsModal = (
    <SimpleModal
      show={isOpen("linkNotificationsModal")}
      onClose={() => close("linkNotificationsModal")}
      size="lg"
      iconCls="bi bi-bell"
      title="Notification & Alert Routing"
      submitLabel="Save Notification Settings"
      successTitle="Alert routing saved!"
      successMsg="Your notification preferences for Business Float are now active."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Toggle checked onChange={() => { }} label="Notify on money received" description="Alert me when Business Float receives money" />
        <Toggle checked onChange={() => { }} label="Balance drop alert" description="Notify when balance drops below a set amount" />
        <Toggle checked onChange={() => { }} label="Failed transaction alerts" description="Alert me about failed transactions" />
        <Toggle checked={false} onChange={() => { }} label="Daily balance summary" description="Send daily summary to my preferred channel" />
        <Toggle checked onChange={() => { }} label="Link & permission changes" description="Alert me when this link is unlinked or permissions change" />
        <div className="mt-2">
          <SelectField
            label="Preferred channel"
            options={["Push", "SMS", "Email", "WhatsApp"]}
            defaultValue="Push"
          />
          <div style={fieldGrid}>
            <div>
              <label className={s.formLabel}>Quiet hours from</label>
              <input type="time" className={s.formControl} defaultValue="22:00" />
            </div>
            <div>
              <label className={s.formLabel}>Quiet hours to</label>
              <input type="time" className={s.formControl} defaultValue="07:00" />
            </div>
          </div>
          <div className="mt-2">
            <button className={s.button}>
              <i className="bi bi-send" /> Send test notification
            </button>
          </div>
        </div>
      </div>
    </SimpleModal>
  );

  /* ================= W10.5 Flow Control Modal ================= */
  const linkFlowControlModal = (
    <TabbedModal
      show={isOpen("linkFlowControlModal")}
      onClose={() => close("linkFlowControlModal")}
      iconCls="bi bi-arrow-left-right"
      title={`Flow Control - ${selectedLinkAccount || 'Account'}`}
      tabs={[
        {
          key: "direction",
          label: "Flow Direction",
          render: () => (
            <div>
              <InfoBox variant="warning">
                <i className="bi bi-arrow-left-right" /> Control the direction of money flow between your Primary Wallet and {selectedLinkAccount || 'this account'}
              </InfoBox>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "var(--ink-700)", marginBottom: 12 }}>Select Flow Direction</div>
                {[
                  { name: "Bidirectional", desc: "Money can flow both ways - full access", icon: "bi-arrow-left-right", active: true },
                  { name: "Inbound Only", desc: "Money can only flow INTO this account", icon: "bi-arrow-right", active: false },
                  { name: "Outbound Only", desc: "Money can only flow OUT from this account", icon: "bi-arrow-left", active: false },
                  { name: "No Flow", desc: "No transfers allowed - view only", icon: "bi-x-circle", active: false },
                ].map((p) => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: p.active ? "2px solid var(--pri)" : "1px solid var(--border)", background: p.active ? "var(--success-bg)" : "var(--surface-2)", marginBottom: 8, cursor: "pointer" }}>
                    <i className={`bi ${p.icon}`} style={{ color: p.active ? "var(--pri)" : "var(--ink-400)", fontSize: 18, width: 24 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{p.desc}</div>
                    </div>
                    <i className={`bi ${p.active ? "bi-check-circle-fill" : "bi-circle"}`} style={{ color: p.active ? "var(--pri)" : "var(--ink-300)", fontSize: 17 }} />
                  </div>
                ))}
              </div>
            </div>
          ),
        },
        {
          key: "limits",
          label: "Transfer Limits",
          render: () => (
            <div>
              <InfoBox variant="info">
                <i className="bi bi-shield-check" /> Set transfer limits to protect your funds
              </InfoBox>
              <div style={{ marginTop: 16 }}>
                <div style={fieldGrid}>
                  <div>
                    <label className={s.formLabel}>Daily Transfer Limit</label>
                    <input type="number" className={s.formControl} defaultValue="1000000" placeholder="KES" />
                  </div>
                  <div>
                    <label className={s.formLabel}>Per Transaction Limit</label>
                    <input type="number" className={s.formControl} defaultValue="500000" placeholder="KES" />
                  </div>
                  <div>
                    <label className={s.formLabel}>Monthly Transfer Limit</label>
                    <input type="number" className={s.formControl} defaultValue="10000000" placeholder="KES" />
                  </div>
                  <div>
                    <label className={s.formLabel}>Minimum Transfer Amount</label>
                    <input type="number" className={s.formControl} defaultValue="100" placeholder="KES" />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Toggle checked={true} onChange={() => { }} label="Enforce limits strictly" description="Block transfers that exceed limits" />
                  <Toggle checked={false} onChange={() => { }} label="Allow limit override with PIN" description="Require PIN to exceed limits" />
                </div>
              </div>
            </div>
          ),
        },
        {
          key: "schedule",
          label: "Schedule",
          render: () => (
            <div>
              <InfoBox variant="info">
                <i className="bi bi-clock" /> Set time-based restrictions on transfers
              </InfoBox>
              <div style={{ marginTop: 16 }}>
                <Toggle checked={false} onChange={() => { }} label="Enable time-based restrictions" description="Only allow transfers during specific hours" />
                <div style={{ ...fieldGrid, marginTop: 12 }}>
                  <div>
                    <label className={s.formLabel}>Allowed from</label>
                    <input type="time" className={s.formControl} defaultValue="06:00" />
                  </div>
                  <div>
                    <label className={s.formLabel}>Allowed until</label>
                    <input type="time" className={s.formControl} defaultValue="22:00" />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label className={s.formLabel}>Blocked days</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <button key={day} className={s.button} style={{ padding: "6px 12px", fontSize: 11 }}>{day}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ),
        },
      ]}
      footer={
        <>
          <button className={s.button} onClick={() => close("linkFlowControlModal")}>
            Cancel
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => close("linkFlowControlModal")}>
            Save Flow Settings
          </button>
        </>
      }
    />
  );

  /* ================= W11. Active links management panel ================= */
  const activeLinksModal = (
    <ModalShell
      show={isOpen("activeLinksModal")}
      onClose={() => close("activeLinksModal")}
      iconCls="bi bi-link-45deg"
      title="Active Links Management"
      size="xl"
      footer={
        <>
          <button className={s.button} onClick={() => close("activeLinksModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => openModal("linkAccountModal")}>
            <i className="bi bi-plus-lg" /> Link New Account
          </button>
        </>
      }
    >
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <span className={`${s.badge} ${s.badgeSuccess}`}><i className="bi bi-link-45deg" /> 5 linked accounts</span>
        <span className={`${s.badge} ${s.badgeInfo}`}>Priority ordering applies to transfers</span>
      </div>
      <div className="row g-3">
        {[
          { id: 1, name: "PayMo KES Wallet", origin: "Transaction Hub", number: "•••• 5530", linked: "12 Jan 2023", balance: "KES 1,284,300", permission: "Full Control", status: "Active", grad: "linear-gradient(135deg,#059669,#10b981)", letter: "P" },
          { id: 2, name: "Business Float", origin: "Business Portal", number: "•••• 2207", linked: "03 Feb 2024", balance: "KES 6,150,000", permission: "Full Control", status: "Active", grad: "linear-gradient(135deg,#7c3aed,#8b5cf6)", letter: "B" },
          { id: 3, name: "Savings Jar", origin: "Savings & Investments", number: "•••• 7793", linked: "15 Mar 2024", balance: "KES 480,000", permission: "View + Transfer In", status: "Active", grad: "linear-gradient(135deg,#b45309,#f59e0b)", letter: "S" },
          { id: 4, name: "Loan Disbursement", origin: "Loans & Credit", number: "•••• 8910", linked: "02 Apr 2025", balance: "KES 0", permission: "View Only", status: "Paused", grad: "linear-gradient(135deg,#3b82f6,#2563eb)", letter: "L" },
          { id: 5, name: "Fiat On-ramp", origin: "Crypto Center", number: "•••• 0042", linked: "12 Jun 2025", balance: "USD 2,410", permission: "View + Transfer In", status: "Active", grad: "linear-gradient(135deg,#ef4444,#dc2626)", letter: "C" },
        ].map((acc) => (
          <div className="col-md-6 col-lg-4" key={acc.name}>
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 14, height: "100%", display: "flex", flexDirection: "column", gap: 10, transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: acc.grad, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
                    {acc.letter}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{acc.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{acc.origin}</div>
                  </div>
                </div>
                <span className={`${s.badge} ${acc.status === "Paused" ? s.badgeWarning : s.badgeSuccess}`}>{acc.status}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-500)", display: "flex", justifyContent: "space-between" }}>
                <span>{acc.number}</span>
                <span>Linked {acc.linked}</span>
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>{acc.balance}</div>
              <span className={`${s.badge} ${acc.permission === "Full Control" ? s.badgeSuccess : s.badgeInfo}`} style={{ alignSelf: "flex-start" }}>
                <i className="bi bi-shield-check" /> {acc.permission}
              </span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: "auto" }}>
                <button className={`${s.button} ${s.buttonSmall}`} onClick={() => { setSelectedLinkAccount(acc.name); openModal("linkPermissionsModal"); }}>Permissions</button>
                <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("linkNotificationsModal")}>Alerts</button>
                <button className={`${s.button} ${s.buttonSmall}`} onClick={() => { setSelectedLinkAccount(acc.name); openModal("linkFlowControlModal"); }}>Flow Control</button>
                <button className={`${s.button} ${s.buttonSmall} ${s.buttonDanger}`} onClick={() => openModal("unlinkAccountModal")}>Unlink</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );

  /* ================= W12. Unlink Account ================= */
  const unlinkAccountModal = (
    <FlowModal
      show={isOpen("unlinkAccountModal")}
      onClose={() => close("unlinkAccountModal")}
      iconCls="bi bi-unlink"
      title="Unlink Account"
      steps={["Check balances", "Reason & PIN", "Grace period"]}
      confirmLabel="Confirm Unlink"
      submitVariant="danger"
    >
      {(step) => {
        if (step === 1) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InfoBox variant="warning">
                <i className="bi bi-exclamation-triangle" /> Business Float has a balance of{" "}
                <strong>KES 6,150,000</strong>. Funds must be relocated before unlinking.
              </InfoBox>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className={s.summaryRow}>
                  <span style={{ fontSize: 13 }}>Available balance</span>
                  <strong style={{ fontSize: 13 }}>KES 6,150,000</strong>
                </div>
                <div className={s.summaryRow}>
                  <span style={{ fontSize: 13 }}>Pending balance</span>
                  <span style={{ fontSize: 13 }}>KES 0</span>
                </div>
                <div className={s.summaryRow}>
                  <span style={{ fontSize: 13 }}>Reserved / hold</span>
                  <span style={{ fontSize: 13 }}>KES 45,000</span>
                </div>
              </div>
              <button className={`${s.button} ${s.buttonAccent}`} onClick={() => openModal("moneyRelocationModal")}>
                <i className="bi bi-arrow-left-right" /> Move funds with Money Relocation Wizard
              </button>
            </div>
          );
        }
        if (step === 2) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className={s.formLabel}>Reason for unlinking</label>
                <select className={s.formControl} defaultValue="No longer needed">
                  <option>No longer needed</option>
                  <option>Security concern</option>
                  <option>Switching dashboards</option>
                  <option>Account closure</option>
                  <option>Other</option>
                </select>
              </div>
              <InfoBox variant="info">
                <i className="bi bi-shield-lock" /> Enter your PIN to authorize the unlink request. This is
                recorded to the audit log with timestamp, IP and device fingerprint.
              </InfoBox>
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                {["_", "_", "_", "_"].map((_, i) => (
                  <input key={i} type="password" inputMode="numeric" maxLength={1} style={{ width: 48, height: 56, textAlign: "center", fontSize: 22, fontWeight: 700, border: "2px solid var(--border)", borderRadius: 10 }} />
                ))}
              </div>
            </div>
          );
        }
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--warning-bg)", color: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
              <i className="bi bi-clock-history" />
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-700)", margin: 0, maxWidth: 380 }}>
              Your unlink request for <strong>Business Float</strong> is confirmed. A{" "}
              <strong>24-hour grace period</strong> applies — you can cancel or relink within 24 hours
              with one tap.
            </p>
            <InfoBox variant="success">
              <i className="bi bi-check-circle" /> You can relink instantly within 30 days of unlink
              without re-entering consent.
            </InfoBox>
          </div>
        );
      }}
    </FlowModal>
  );

  /* ================= W13. Relink Account ================= */
  const relinkAccountModal = (
    <SimpleModal
      show={isOpen("relinkAccountModal")}
      onClose={() => close("relinkAccountModal")}
      iconCls="bi bi-link-45deg"
      title="Relink Account"
      size="lg"
      submitLabel="Relink Now"
      successTitle="Account relinked!"
      successMsg="Business Float is linked again with your previous Full Control permissions."
      successRef="RELINK-20250627-8812"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <InfoBox variant="info">
          <i className="bi bi-arrow-counterclockwise" /> Unlinked <strong>20 Jun 2025</strong> — within the
          30-day instant relink window. Previous permissions are preserved.
        </InfoBox>
        {[
          { name: "Business Float", detail: "Unlinked 20 Jun 2025 • had Full Control", grad: "linear-gradient(135deg,#7c3aed,#8b5cf6)", letter: "B" },
          { name: "Old Collection Float", detail: "Unlinked 12 May 2025 • had View Only", grad: "linear-gradient(135deg,#3b82f6,#2563eb)", letter: "C" },
          { name: "Crypto Settlement", detail: "Unlinked 03 Apr 2025 • had One-Way Out", grad: "linear-gradient(135deg,#ef4444,#dc2626)", letter: "X" },
        ].map((acc) => (
          <div key={acc.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: acc.name === "Business Float" ? "2px solid var(--pri)" : "1px solid var(--border)", background: acc.name === "Business Float" ? "var(--success-bg)" : "var(--surface-2)", cursor: "pointer" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: acc.grad, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
              {acc.letter}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{acc.name}</div>
              <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{acc.detail}</div>
            </div>
            <i className={`bi ${acc.name === "Business Float" ? "bi-check-circle-fill" : "bi-circle"}`} style={{ color: acc.name === "Business Float" ? "var(--pri)" : "var(--ink-300)", fontSize: 17 }} />
          </div>
        ))}
      </div>
    </SimpleModal>
  );

  /* ================= W14. Revoke All Dashboard Access ================= */
  const revokeAllAccessModal = (
    <FlowModal
      show={isOpen("revokeAllAccessModal")}
      onClose={() => close("revokeAllAccessModal")}
      iconCls="bi bi-shield-exclamation"
      title="Revoke All Dashboard Access"
      steps={["Understand impact", "Confirm identity", "Revoked"]}
      confirmLabel="Revoke All Access"
      submitVariant="danger"
    >
      {(step) => {
        if (step === 1) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "var(--danger-bg)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#b91c1c" }}>
                <i className="bi bi-exclamation-triangle-fill" /> This is the emergency panic button. All
                inter-dashboard transfers are suspended immediately.
              </div>
              {[
                "Suspends all cross-dashboard transfers instantly",
                "Requires PIN + SMS OTP dual confirmation",
                "Optional notification to your emergency contact",
                "72-hour cooldown before reactivation is allowed",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 10, fontSize: 13 }}>
                  <i className="bi bi-x-circle" style={{ color: "var(--danger)", flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
              <Toggle checked={false} onChange={() => { }} label="Notify emergency contact" description="Send an SMS to your registered emergency number" />
            </div>
          );
        }
        if (step === 2) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
              <p style={{ fontSize: 13, color: "var(--ink-700)", textAlign: "center", maxWidth: 380 }}>
                Enter your PIN and the 6-digit OTP sent to +254 712 345 890.
              </p>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-500)", marginBottom: 8 }}>PIN</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  {["_", "_", "_", "_"].map((_, i) => (
                    <input key={i} type="password" inputMode="numeric" maxLength={1} style={{ width: 46, height: 54, textAlign: "center", fontSize: 20, fontWeight: 700, border: "2px solid var(--border)", borderRadius: 10 }} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-500)", marginBottom: 8 }}>SMS OTP</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  {["_", "_", "_", "_", "_", "_"].map((_, i) => (
                    <input key={i} type="password" inputMode="numeric" maxLength={1} style={{ width: 40, height: 52, textAlign: "center", fontSize: 18, fontWeight: 700, border: "2px solid var(--border)", borderRadius: 10 }} />
                  ))}
                </div>
              </div>
            </div>
          );
        }
        return (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--danger-bg)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 14px" }}>
              <i className="bi bi-shield-x" />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>
              Access revoked across all dashboards
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-500)", margin: "6px auto 0", maxWidth: 380, lineHeight: 1.6 }}>
              All inter-dashboard transfers are suspended. A 72-hour cooldown is now active before you
              can reactivate. Your emergency contact has been notified.
            </p>
          </div>
        );
      }}
    </FlowModal>
  );

  /* ================= W15. Money Relocation Wizard (8 steps) ================= */
  const moneyRelocationModal = (
    <FlowModal
      show={isOpen("moneyRelocationModal")}
      onClose={() => close("moneyRelocationModal")}
      iconCls="bi bi-arrow-left-right"
      title="Money Relocation Wizard"
      steps={["Intent", "Destination", "Allocation", "Review", "Security", "Verify", "Execute", "Receipt"]}
      confirmLabel="Move Funds"
      submitVariant="accent"
    >
      {(step) => {
        if (step === 1) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InfoBox variant="warning">
                <i className="bi bi-exclamation-triangle" /> You have{" "}
                <strong>KES 6,150,000 in Business Float</strong>. Where should we send it?
              </InfoBox>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div className={s.summaryRow}>
                  <span style={{ fontSize: 13 }}>Available balance</span>
                  <strong style={{ fontSize: 13 }}>KES 6,150,000</strong>
                </div>
                <div className={s.summaryRow}>
                  <span style={{ fontSize: 13 }}>Pending balance</span>
                  <span style={{ fontSize: 13 }}>KES 0</span>
                </div>
                <div className={s.summaryRow}>
                  <span style={{ fontSize: 13 }}>Reserved / hold</span>
                  <span style={{ fontSize: 13 }}>KES 45,000</span>
                </div>
              </div>
              <InfoBox variant="danger">
                <i className="bi bi-exclamation-octagon" /> This action is irreversible after
                confirmation. Please review carefully before proceeding.
              </InfoBox>
            </div>
          );
        }
        if (step === 2) {
          return (
            <div>
              <SelectField
                label="Destination"
                options={[
                  "Transfer to Primary PayMo Wallet",
                  "Transfer to another linked dashboard account",
                  "Transfer to external M-Pesa number",
                  "Transfer to linked bank account (PesaLink/EFT/RTGS)",
                  "Withdraw to mobile money (Airtel Money, T-Kash)",
                  "Send to saved beneficiary",
                  "Hold in escrow for 30 days (delayed decision)",
                  "Donate to charity (pre-verified NGO list)",
                ]}
                defaultValue={relocationDestination}
                onChange={(v) => setRelocationDestination(v)}
              />
              <InfoBox variant="info">
                <i className="bi bi-info-circle" /> {relocationDestination}. Eligibility, limits and KYC
                tier requirements are validated automatically.
              </InfoBox>
            </div>
          );
        }
        if (step === 3) {
          return (
            <div>
              <div style={fieldGrid}>
                <div>
                  <label className={s.formLabel}>Amount to move (KES)</label>
                  <input className={s.formControl} defaultValue="6,150,000" />
                </div>
                <div>
                  <label className={s.formLabel}>Or percentage</label>
                  <select className={s.formControl} defaultValue="100%">
                    <option>100% — Send All</option>
                    <option>75%</option>
                    <option>50%</option>
                    <option>25%</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 14, textAlign: "center" }}>
                <div style={{ width: 200, height: 200, borderRadius: "50%", background: "conic-gradient(var(--pri) 0 85%, var(--border) 85% 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                  <div style={{ width: 140, height: 140, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>100%</div>
                    <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Primary Wallet</div>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 8 }}>
                  Allocatable across multiple destinations • reserved amounts excluded
                </p>
              </div>
            </div>
          );
        }
        if (step === 4) {
          return (
            <div>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 6 }}>Source</div>
                <ReviewRow label="Account" value="Business Float •••• 2207" />
                <ReviewRow label="Current balance" value="KES 6,150,000" />
                <ReviewRow label="Post-transfer balance" value="KES 0" highlight />
              </div>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 6 }}>Destination</div>
                <ReviewRow label="Account" value="Primary PayMo Wallet" />
                <ReviewRow label="Amount" value="KES 6,150,000" />
              </div>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 6 }}>Fees</div>
                <ReviewRow label="Platform fee" value="KES 0 (relocation waiver)" />
                <ReviewRow label="Network fee" value="KES 50" />
                <ReviewRow label="FX spread" value="KES 0 (same currency)" />
                <ReviewRow label="Net recipient receives" value="KES 6,149,950" highlight />
                <ReviewRow label="Est. completion" value="~4 seconds" />
              </div>
              <div className="mt-2">
                <InfoBox variant="info">
                  <i className="bi bi-receipt" /> Reference preview:{" "}
                  <strong>REL-20250627-8841</strong> • Estimated completion time per destination shown
                  during execution.
                </InfoBox>
              </div>
            </div>
          );
        }
        if (step === 5) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
              <p style={{ fontSize: 13, color: "var(--ink-700)", textAlign: "center", maxWidth: 380 }}>
                Multi-factor confirmation required to move <strong>KES 6,150,000</strong>.
              </p>
              <div style={{ width: "100%" }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-500)", marginBottom: 8 }}>PIN entry (mandatory)</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  {["_", "_", "_", "_"].map((_, i) => (
                    <input key={i} type="password" inputMode="numeric" maxLength={1} style={{ width: 46, height: 54, textAlign: "center", fontSize: 20, fontWeight: 700, border: "2px solid var(--border)", borderRadius: 10 }} />
                  ))}
                </div>
              </div>
              <InfoBox variant="success">
                <i className="bi bi-fingerprint" /> Biometric confirmation is enabled on this device —
                place your finger or use Face ID when prompted.
              </InfoBox>
              <div style={{ fontSize: 12, color: "var(--ink-700)", textAlign: "center" }}>
                Type to confirm: <em>"I confirm I want to move KES 6,150,000 to Primary PayMo Wallet"</em>
                <input className={s.formControl} style={{ marginTop: 8 }} placeholder="Type the confirmation text" />
              </div>
              <InfoBox variant="warning">
                <i className="bi bi-robot" /> Fraud check: velocity limits, unusual pattern detection and
                device trust score are evaluated before execution.
              </InfoBox>
            </div>
          );
        }
        if (step === 6) {
          return (
            <div>
              <InfoBox variant="info">
                <i className="bi bi-person-check" /> Destination is your own Primary PayMo Wallet — name
                match confirmed automatically. No cooling-off period applies.
              </InfoBox>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)", marginTop: 12 }}>
                <ReviewRow label="Destination type" value="Internal PayMo wallet" />
                <ReviewRow label="Name confirmation" value="Amina Grace Kamau ✓" highlight />
                <ReviewRow label="Network" value="PayMo internal ledger" />
                <ReviewRow label="New beneficiary?" value="No — previously used" />
              </div>
              <div className="mt-2">
                <Toggle checked onChange={() => { }} label="Save destination for future use" />
              </div>
            </div>
          );
        }
        if (step === 7) {
          return (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Executing relocation</div>
                <span className={`${s.badge} ${s.badgeInfo}`}>Processing…</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { name: "Queued", desc: "Relocation request accepted", done: true },
                  { name: "Validating", desc: "Checks, limits and fraud screening", done: true },
                  { name: "Processing", desc: "Moving KES 6,150,000 to Primary Wallet", done: false, active: true },
                  { name: "Completed", desc: "Receipt available", done: false },
                ].map((st) => (
                  <div key={st.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: st.done ? "var(--success)" : st.active ? "var(--pri)" : "var(--border)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {st.done ? <i className="bi bi-check" /> : st.active ? <div className={s.spinner} style={{ width: 16, height: 16, borderWidth: 2 }} /> : <i className="bi bi-circle" style={{ color: "var(--ink-300)" }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{st.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{st.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <InfoBox variant="info">
                  <i className="bi bi-clock" /> Estimated time remaining: <strong>2 seconds</strong> •
                  Auto-retry enabled (up to 3 attempts for transient failures).
                </InfoBox>
              </div>
            </div>
          );
        }
        return (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--success-bg)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 14px" }}>
              <i className="bi bi-check-lg" />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>
              Relocation complete
            </div>
            <p style={{ fontSize: 12, color: "var(--ink-500)", margin: "6px auto 14px", maxWidth: 400 }}>
              KES 6,150,000 moved to Primary PayMo Wallet • KES 50 fee. A receipt with QR code and
              reference has been generated.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => openModal("relocationReceiptModal")}>
                <i className="bi bi-receipt" /> View Receipt
              </button>
              <button className={s.button} onClick={() => openModal("activeLinksModal")}>Link Another Account</button>
              <button className={s.button} onClick={() => close("moneyRelocationModal")}>Return to Dashboard</button>
            </div>
          </div>
        );
      }}
    </FlowModal>
  );

  /* ================= W16. Relocation receipt ================= */
  const relocationReceiptModal = (
    <SimpleModal
      show={isOpen("relocationReceiptModal")}
      onClose={() => close("relocationReceiptModal")}
      iconCls="bi bi-receipt"
      title="Relocation Receipt"
      size="lg"
      successTitle="Receipt downloaded!"
      successMsg="Your relocation receipt has been generated as PDF. Share via SMS, WhatsApp or email."
      successRef="REL-20250627-8841"
    >
      <div className={s.receipt}>
        <div className={s.receiptIcon}>
          <i className="bi bi-check-lg" />
        </div>
        <div style={{ fontWeight: 700, fontSize: 22, color: "var(--pri-700)" }}>KES 6,150,000</div>
        <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Business Float → Primary PayMo Wallet</div>
        <hr className={s.divider} />
        <ReviewRow label="Reference" value="REL-20250627-8841" />
        <ReviewRow label="Date" value="27 Jun 2025, 14:22 EAT" />
        <ReviewRow label="Platform fee" value="KES 0" />
        <ReviewRow label="Network fee" value="KES 50" />
        <ReviewRow label="Net received" value="KES 6,149,950" highlight />
        <ReviewRow label="Rail" value="PayMo Internal Ledger" />
        <div className="mt-2" style={{ display: "flex", justifyContent: "center" }}>
          <i className="bi bi-qr-code" style={{ fontSize: 44, color: "var(--ink-900)" }} />
        </div>
      </div>
    </SimpleModal>
  );



  /* ================= W26. Support & help center ================= */
  const supportHelpModal = (
    <ModalShell
      show={isOpen("supportHelpModal")}
      onClose={() => close("supportHelpModal")}
      iconCls="bi bi-question-circle"
      title="Support & Help Center"
      size="lg"
      footer={
        <>
          <button className={s.button} onClick={() => close("supportHelpModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`}>
            <i className="bi bi-chat-dots" /> Start Live Chat
          </button>
        </>
      }
    >
      <div className="row g-3">
        <div className="col-md-6">
          <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-500)", marginBottom: 8 }}>Guides</div>
            {[
              { icon: "bi bi-link-45deg", title: "Understanding Dashboard Linking", desc: "How links and permissions work" },
              { icon: "bi bi-arrow-left-right", title: "How Inter-Dashboard Transfers Work", desc: "Move money between dashboards" },
              { icon: "bi bi-shield-exclamation", title: "What Happens When I Revoke Access?", desc: "The revocation flow explained" },
              { icon: "bi bi-play-btn", title: "Money Relocation Wizard — Video", desc: "8-step tutorial (4 min)" },
            ].map((g) => (
              <div key={g.title} className={s.summaryRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--info-bg)", color: "var(--info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                    <i className={g.icon} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{g.title}</div>
                    <div style={{ fontSize: 10, color: "var(--ink-500)" }}>{g.desc}</div>
                  </div>
                </div>
                <i className="bi bi-chevron-right" style={{ color: "var(--ink-300)" }} />
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-500)", marginBottom: 8 }}>Contact & Emergency</div>
            <div className={s.summaryRow}>
              <span style={{ fontSize: 13 }}>Live chat (cross-dashboard specialist)</span>
              <button className={`${s.button} ${s.buttonSmall}`}>Start</button>
            </div>
            <div className={s.summaryRow}>
              <span style={{ fontSize: 13 }}>Emergency hotline (lockouts)</span>
              <button className={`${s.button} ${s.buttonSmall}`}>0800 720 720</button>
            </div>
            <div className={s.summaryRow}>
              <span style={{ fontSize: 13 }}>Report suspicious activity</span>
              <button className={`${s.button} ${s.buttonSmall} ${s.buttonDanger}`}>Report</button>
            </div>
            <div className={s.summaryRow}>
              <span style={{ fontSize: 13 }}>Email support</span>
              <button className={`${s.button} ${s.buttonSmall}`}>Email</button>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );

  /* ================= W29. Cross-dashboard limits ================= */
  const linkLimitsModal = (
    <SimpleModal
      show={isOpen("linkLimitsModal")}
      onClose={() => close("linkLimitsModal")}
      iconCls="bi bi-speedometer2"
      title="Cross-Dashboard Limits & Controls"
      size="lg"
      submitLabel="Save Limits"
      successTitle="Limits updated!"
      successMsg="Your cross-dashboard transfer limits have been saved and are now active."
    >
      <div>
        <div className="mb-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Daily transfer limit (inbound)</span>
            <span>KES 2,000,000</span>
          </div>
          <div className={s.progressTrack}>
            <div className={s.progressBar} style={{ width: "34%" }} />
          </div>
        </div>
        <div className="mb-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Daily transfer limit (outbound)</span>
            <span>KES 2,000,000</span>
          </div>
          <div className={s.progressTrack}>
            <div className={s.progressBar} style={{ width: "18%" }} />
          </div>
        </div>
        <div className="mb-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Per-transaction maximum</span>
            <span>KES 1,000,000</span>
          </div>
          <div className={s.progressTrack}>
            <div className={s.progressBar} style={{ width: "22%" }} />
          </div>
        </div>
        <div className="mb-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Monthly cumulative</span>
            <span>KES 12,000,000</span>
          </div>
          <div className={s.progressTrack}>
            <div className={s.progressBar} style={{ width: "41%" }} />
          </div>
        </div>
        <div className="mb-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Velocity limit</span>
            <span>50 tx / hour</span>
          </div>
        </div>
        <InfoBox variant="warning">
          <i className="bi bi-arrow-up-circle" /> To request a limit increase you must provide a
          justification and supporting document. Processing takes 2–3 business days.
        </InfoBox>
        <div className="mt-2">
          <button className={`${s.button} ${s.buttonPrimary}`}>
            <i className="bi bi-arrow-up" /> Request Limit Increase
          </button>
        </div>
      </div>
    </SimpleModal>
  );


  /* ================= W31. Cross-dashboard data consent (privacy) ================= */
  const privacyModal = (
    <SimpleModal
      show={isOpen("privacyModal")}
      onClose={() => close("privacyModal")}
      iconCls="bi bi-lock"
      title="Cross-Dashboard Data Consent"
      size="lg"
      submitLabel="Save Consent"
      successTitle="Consent updated!"
      successMsg="Your cross-dashboard data sharing and visibility preferences have been saved."
    >
      <div>
        <Toggle checked onChange={() => { }} label="Cross-dashboard balance visibility" description="Allow dashboards to see balances of linked accounts" />
        <Toggle checked onChange={() => { }} label="Consolidated statements" description="Combine transactions from all linked accounts" />
        <Toggle checked={false} onChange={() => { }} label="Share data with credit bureaus" description="Report on-time cross-dashboard payments" />
        <Toggle checked={false} onChange={() => { }} label="Partner marketing" description="Relevant offers from vetted partners" />
        <Toggle checked onChange={() => { }} label="Anonymized product analytics" description="Help improve PayMo dashboards" />
        <div style={{ marginTop: 12 }}>
          <InfoBox variant="info">
            <i className="bi bi-file-earmark-lock" /> Consent expiry: 11 July 2026. You can renew or revoke
            any consent at any time from this panel.
          </InfoBox>
        </div>
      </div>
    </SimpleModal>
  );

  /* ================= W32. Set activation preferences ================= */
  const preferencesModal = (
    <TabbedModal
      show={isOpen("preferencesModal")}
      onClose={() => close("preferencesModal")}
      iconCls="bi bi-gear"
      title="Set Activation Preferences"
      tabs={[
        {
          key: "defaults",
          label: "Defaults",
          render: () => (
            <div>
              <SelectField label="Default dashboard after login" options={["Transaction Hub", "Business Portal", "Utilities Hub", "Savings & Investments"]} defaultValue="Transaction Hub" />
              <SelectField label="Activation PIN length" options={["4 digits", "6 digits"]} defaultValue="4 digits" />
              <Toggle checked onChange={() => { }} label="Require biometric for activation" description="Add fingerprint / Face ID to the activation PIN gate" />
              <Toggle checked onChange={() => { }} label="Auto-start tour on first activation" description="Launch the tour guide after the first dashboard is activated" />
            </div>
          ),
        },
        {
          key: "notifications",
          label: "Notifications",
          render: () => (
            <div>
              <Toggle checked onChange={() => { }} label="Activation confirmations" description="Confirm each successful dashboard activation" />
              <Toggle checked onChange={() => { }} label="Link & unlink alerts" description="Notify on every link or unlink event" />
              <Toggle checked onChange={() => { }} label="Consent expiry reminders" description="Remind 30 / 14 / 7 days before consent expiry" />
              <Toggle checked={false} onChange={() => { }} label="Promotional announcements" description="Product updates and feature launches" />
            </div>
          ),
        },
        {
          key: "tour",
          label: "Tour",
          render: () => (
            <div>
              <Toggle checked onChange={() => { }} label="Show tour hotspots" description="Highlight key sections while exploring a dashboard" />
              <Toggle checked={false} onChange={() => { }} label="Remind me later option" description="Allow skipping the tour and being reminded later" />
              <div className="mt-2">
                <button className={s.button} onClick={() => openModal("tourGuideModal")}>
                  <i className="bi bi-play-circle" /> Replay Tour Now
                </button>
              </div>
            </div>
          ),
        },
      ]}
      footer={
        <>
          <button className={s.button} onClick={() => close("preferencesModal")}>
            Cancel
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => close("preferencesModal")}>
            Save Preferences
          </button>
        </>
      }
    />
  );

  return (
    <>
      {/* {walletCardModal}
      {shareQRModal}
      {downloadAccountDetailsModal}
      {walletHealthModal} */}
      {activateDashboardModal}
      {activationSuccessModal}
      {tourGuideModal}
      {linkAccountModal}
      {linkPermissionsModal}
      {linkNotificationsModal}
      {activeLinksModal}
      {unlinkAccountModal}
      {relinkAccountModal}
      {revokeAllAccessModal}
      {moneyRelocationModal}
      {relocationReceiptModal}
      {/* {activeSessionsModal}
      {accessLogsModal}
      {pinManagementModal}
      {changePinModal}
      {profileQuickViewModal}
      {logoutCurrentModal}
      {logoutAllModal}
      {disableDashboardModal}
      {closeDashboardModal} */}
      {supportHelpModal}
      {/* {autoTransferRulesModal}
      {accountNamingModal} */}
      {linkLimitsModal}
      {/* {attentionModal} */}
      {privacyModal}
      {preferencesModal}
    </>
  );
}
