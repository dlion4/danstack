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
  // } from "../../shared/components/modals.tsx";
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

  const fieldGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  };

  const fullRow: React.CSSProperties = { gridColumn: "1 / -1" };

  /* ================= W1. Primary PayMo Wallet Card (full view) ================= */
  const walletCardModal = (
    <ModalShell
      show={isOpen("walletCardModal")}
      onClose={() => close("walletCardModal")}
      iconCls="bi bi-wallet2"
      title="Primary PayMo Wallet"
      size="lg"
      footer={
        <>
          <button className={s.button} onClick={() => close("walletCardModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => openModal("downloadAccountDetailsModal")}>
            <i className="bi bi-download" /> Download PDF
          </button>
        </>
      }
    >
      <div
        style={{
          background: "linear-gradient(135deg, #064e3b, #059669 55%, #10b981)",
          borderRadius: 18,
          padding: 24,
          color: "#fff",
          marginBottom: 18,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, letterSpacing: 1 }}>
            <i className="bi bi-wallet2" /> PAYMO WALLET
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 999, background: "rgba(255,255,255,0.16)" }}>
            <i className="bi bi-check-circle" /> Active
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.7)" }}>
              Account Number
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: 2, marginTop: 4 }}>
              PM-4521-8830-1024
              <button
                className={s.button}
                style={{ marginLeft: 10, padding: "4px 10px", fontSize: 11, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}
                onClick={() => openModal("shareQRModal")}
              >
                <i className="bi bi-qr-code" /> QR
              </button>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 6 }}>
              Wallet ID: WLT-8H2K-9XQ4 • AMINA GRACE KAMAU • Premium
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.7)" }}>
              Available Balance
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 700, marginTop: 2 }}>
              KES 1,284,300
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.78)", marginTop: 4 }}>
              KES • USD • EUR • GBP wallets
            </div>
          </div>
        </div>
      </div>

      <div style={fieldGrid}>
        {[
          { label: "Account Holder", value: "Amina Grace Kamau" },
          { label: "KYC Tier", value: "Premium — fully verified" },
          { label: "Account Status", value: "Active" },
          { label: "Date Opened", value: "12 January 2023" },
          { label: "Account Age", value: "2 years 7 months" },
          { label: "Linked Dashboards", value: "6 active dashboards" },
        ].map((info) => (
          <div key={info.label} style={{ padding: "12px 16px", borderRadius: 10, background: "var(--surface-2)" }}>
            <div style={{ color: "var(--ink-500)", fontSize: 11, marginBottom: 4 }}>{info.label}</div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{info.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <InfoBox variant="success">
          <i className="bi bi-shield-check" /> Your primary PayMo wallet is always linked by default
          across every dashboard. It cannot be unlinked.
        </InfoBox>
      </div>
    </ModalShell>
  );

  /* ================= W2. Share QR / QR code viewer ================= */
  const shareQRModal = (
    <SimpleModal
      show={isOpen("shareQRModal")}
      onClose={() => close("shareQRModal")}
      size="lg"
      iconCls="bi bi-qr-code"
      title="Share Wallet QR"
      footer={
        <>
          <button className={s.button} onClick={() => close("shareQRModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`}>Copy Wallet ID</button>
        </>
      }
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 190,
            height: 190,
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <i className="bi bi-qr-code" style={{ fontSize: 130, color: "var(--ink-900)" }} />
        </div>
        <code style={{ fontSize: 13, background: "var(--surface-2)", padding: "8px 14px", borderRadius: 8 }}>
          PM-4521-8830-1024
        </code>
        <p style={{ fontSize: 12, color: "var(--ink-500)", margin: "12px 0 0" }}>
          Scan to send money to this wallet. QR codes expire after 10 minutes and rotate automatically
          for security.
        </p>
      </div>
    </SimpleModal>
  );

  /* ================= W3. Download account details ================= */
  const downloadAccountDetailsModal = (
    <SimpleModal
      show={isOpen("downloadAccountDetailsModal")}
      onClose={() => close("downloadAccountDetailsModal")}
      size="lg"
      iconCls="bi bi-download"
      title="Download Account Details"
      successTitle="PDF generated!"
      successMsg="Your wallet account details have been generated as a PDF and saved to your device."
      successRef="WALLET-20250627-1024"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SelectField
          label="Include"
          options={["Account summary + QR", "Full statement (last 3 months)", "Security & linked accounts snapshot"]}
          defaultValue="Account summary + QR"
        />
        <InfoBox variant="info">
          <i className="bi bi-file-earmark-pdf" /> The PDF includes your masked account number, wallet ID,
          KYC tier and QR code. Full account numbers are never included in downloads.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= W4. Wallet health snapshot ================= */
  const walletHealthModal = (
    <ModalShell
      show={isOpen("walletHealthModal")}
      onClose={() => close("walletHealthModal")}
      iconCls="bi bi-heart-pulse"
      title="Wallet Health Snapshot"
      size="lg"
      footer={
        <>
          <button className={s.button} onClick={() => close("walletHealthModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => openModal("walletCardModal")}>
            Full Wallet View
          </button>
        </>
      }
    >
      <div className="row g-3">
        <div className="col-md-6">
          <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--success-bg)", color: "#047857", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Total Consolidated Balance</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, marginTop: 4 }}>
              KES 2,412,800
            </div>
            <div style={{ fontSize: 12, color: "#065F46" }}>Across 6 linked dashboard accounts</div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Pending Incoming</div>
              <div style={{ fontWeight: 700, color: "var(--success)" }}>+KES 45,000</div>
            </div>
            <div style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Pending Outgoing</div>
              <div style={{ fontWeight: 700, color: "var(--warning)" }}>-KES 12,500</div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 10 }}>
              Security Status
            </div>
            <div className={s.summaryRow}>
              <span style={{ fontSize: 13 }}>PIN set</span>
              <span className={`${s.badge} ${s.badgeSuccess}`}>
                <i className="bi bi-check-circle" /> Enabled
              </span>
            </div>
            <div className={s.summaryRow}>
              <span style={{ fontSize: 13 }}>Biometric</span>
              <span className={`${s.badge} ${s.badgeSuccess}`}>
                <i className="bi bi-check-circle" /> Enabled
              </span>
            </div>
            <div className={s.summaryRow}>
              <span style={{ fontSize: 13 }}>2FA status</span>
              <span className={`${s.badge} ${s.badgeSuccess}`}>Active</span>
            </div>
            <div className={s.summaryRow}>
              <span style={{ fontSize: 13 }}>Active sessions</span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>4 devices</span>
            </div>
          </div>
        </div>
      </div>

      <h4 style={{ fontSize: 13, fontWeight: 700, margin: "6px 0 10px" }}>
        Latest consolidated activity
      </h4>
      {[
        { icon: "bi bi-arrow-down-left", bg: "var(--success-bg)", color: "var(--success)", title: "Received KES 125,000", desc: "PayMo KES Wallet → Transaction Hub", time: "Today, 14:22", amount: "+KES 125,000" },
        { icon: "bi bi-arrow-up-right", bg: "var(--warning-bg)", color: "var(--warning)", title: "Sent KES 25,000", desc: "Business Float → Utilities Hub", time: "25 Jun, 09:12", amount: "-KES 25,000" },
        { icon: "bi bi-piggy-bank", bg: "var(--purple-bg)", color: "var(--purple)", title: "Auto-sweep KES 180,000", desc: "Business Float → Savings Jar", time: "24 Jun, 11:45", amount: "-KES 180,000" },
      ].map((item) => (
        <div className={s.summaryRow} key={item.title}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
              <i className={item.icon} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{item.desc}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: item.amount.startsWith("+") ? "var(--success)" : "var(--ink-900)" }}>
              {item.amount}
            </div>
            <div style={{ fontSize: 10, color: "var(--ink-500)" }}>{item.time}</div>
          </div>
        </div>
      ))}
    </ModalShell>
  );

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
      steps={["Choose account", "Set permissions", "Confirm PIN"]}
      confirmLabel="Link Account"
    >
      {(step) => {
        if (step === 1) {
          return (
            <div>
              <SelectField
                label="Dashboard origin"
                options={["Transaction Hub", "Business Portal", "Savings & Investments", "Loans & Credit", "Crypto Center", "Utilities Hub"]}
                defaultValue="Business Portal"
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                {[
                  { name: "Business Float", detail: "•••• 2207 • KES 6,150,000 • Active", grad: "linear-gradient(135deg,#7c3aed,#8b5cf6)", letter: "B" },
                  { name: "Collection Account", detail: "•••• 4418 • KES 890,000 • Active", grad: "linear-gradient(135deg,#059669,#10b981)", letter: "C" },
                  { name: "Payroll Float", detail: "•••• 7732 • KES 2,300,000 • Paused", grad: "linear-gradient(135deg,#b45309,#f59e0b)", letter: "P" },
                ].map((acc) => (
                  <div
                    key={acc.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: acc.name === "Business Float" ? "2px solid var(--pri)" : "1px solid var(--border)",
                      background: acc.name === "Business Float" ? "var(--success-bg)" : "var(--surface-2)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 11, background: acc.grad, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
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
            </div>
          );
        }
        if (step === 2) {
          return (
            <div>
              <InfoBox variant="info">
                <i className="bi bi-sliders" /> Choose the permission level for this dashboard to see and
                use the linked account.
              </InfoBox>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                {[
                  { name: "Full Control", desc: "View balance + transfer in/out + auto rules", active: true },
                  { name: "View + Transfer In/Out", desc: "Balance visible with bidirectional transfers", active: false },
                  { name: "View + Transfer In", desc: "Receive into this dashboard only", active: false },
                  { name: "View Only", desc: "Balance visible, no transfers", active: false },
                ].map((p) => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: p.active ? "2px solid var(--pri)" : "1px solid var(--border)", background: p.active ? "var(--success-bg)" : "var(--surface-2)", cursor: "pointer" }}>
                    <i className={`bi ${p.active ? "bi-check-circle-fill" : "bi-circle"}`} style={{ color: p.active ? "var(--pri)" : "var(--ink-300)", fontSize: 17 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
            <p style={{ fontSize: 13, color: "var(--ink-700)", textAlign: "center", maxWidth: 360 }}>
              Confirm with your PIN to link <strong>Business Float</strong> to this dashboard with
              <strong> Full Control</strong> permissions.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {["_", "_", "_", "_"].map((_, i) => (
                <input key={i} type="password" inputMode="numeric" maxLength={1} style={{ width: 48, height: 56, textAlign: "center", fontSize: 22, fontWeight: 700, border: "2px solid var(--border)", borderRadius: 10 }} />
              ))}
            </div>
            <InfoBox variant="success">
              <i className="bi bi-shield-check" /> Linking is instant and reversible. You can revoke access
              at any time from the links panel.
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
      title="Link Permission Controls"
      tabs={[
        {
          key: "presets",
          label: "Presets",
          render: () => (
            <div>
              {[
                { name: "Full Inter-Dashboard Access", desc: "Enables all toggles below", active: true },
                { name: "View Only", desc: "Balance visible, no transfers", active: false },
                { name: "One-Way In", desc: "Can receive only", active: false },
                { name: "One-Way Out", desc: "Can send only", active: false },
                { name: "Custom", desc: "User-defined combination", active: false },
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
              <Toggle checked onChange={() => { }} label="Visibility" description="Allow this dashboard to see my balance from Business Float" />
              <Toggle checked onChange={() => { }} label="Inbound transfers" description="Allow money to flow INTO this dashboard from Business Float" />
              <Toggle checked onChange={() => { }} label="Outbound transfers" description="Allow money to flow OUT to Business Float" />
              <Toggle checked={false} onChange={() => { }} label="Auto-sweep" description="Move excess balance above a threshold automatically" />
              <Toggle checked={false} onChange={() => { }} label="Auto-top-up" description="Refill this dashboard when balance drops below threshold" />
              <Toggle checked onChange={() => { }} label="Notification sharing" description="Receive alerts about transactions on Business Float" />
              <Toggle checked onChange={() => { }} label="Statement access" description="Include Business Float in consolidated statements" />
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
          { name: "PayMo KES Wallet", origin: "Transaction Hub", number: "•••• 5530", linked: "12 Jan 2023", balance: "KES 1,284,300", permission: "Full Control", status: "Active", grad: "linear-gradient(135deg,#059669,#10b981)", letter: "P" },
          { name: "Business Float", origin: "Business Portal", number: "•••• 2207", linked: "03 Feb 2024", balance: "KES 6,150,000", permission: "Full Control", status: "Active", grad: "linear-gradient(135deg,#7c3aed,#8b5cf6)", letter: "B" },
          { name: "Savings Jar", origin: "Savings & Investments", number: "•••• 7793", linked: "15 Mar 2024", balance: "KES 480,000", permission: "View + Transfer In", status: "Active", grad: "linear-gradient(135deg,#b45309,#f59e0b)", letter: "S" },
          { name: "Loan Disbursement", origin: "Loans & Credit", number: "•••• 8910", linked: "02 Apr 2025", balance: "KES 0", permission: "View Only", status: "Paused", grad: "linear-gradient(135deg,#3b82f6,#2563eb)", letter: "L" },
          { name: "Fiat On-ramp", origin: "Crypto Center", number: "•••• 0042", linked: "12 Jun 2025", balance: "USD 2,410", permission: "View + Transfer In", status: "Active", grad: "linear-gradient(135deg,#ef4444,#dc2626)", letter: "C" },
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
                <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("linkPermissionsModal")}>Permissions</button>
                <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("linkNotificationsModal")}>Alerts</button>
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

  /* ================= W17. Active sessions & devices ================= */
  const activeSessionsModal = (
    <ModalShell
      show={isOpen("activeSessionsModal")}
      onClose={() => close("activeSessionsModal")}
      iconCls="bi bi-laptop"
      title="Active Sessions & Devices"
      size="lg"
      footer={
        <>
          <button className={s.button} onClick={() => close("activeSessionsModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonDanger}`} onClick={() => openModal("logoutAllModal")}>
            End All Other Sessions
          </button>
        </>
      }
    >
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Device</th>
              <th>Location</th>
              <th>Dashboard Access</th>
              <th>Last Active</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              { device: "iPhone 15 Pro", detail: "iOS 18.5 • App v4.2.1", location: "Nairobi, KE", dash: "6 dashboards", active: "Just now", status: "Current", current: true },
              { device: "MacBook Pro", detail: "macOS 15.4 • Safari", location: "Nairobi, KE", dash: "6 dashboards", active: "14:22 today", status: "Active", current: false },
              { device: "Windows PC", detail: "Windows 11 • Chrome", location: "Nairobi, KE", dash: "3 dashboards", active: "26 Jun 2025", status: "New", current: false },
              { device: "iPad Air", detail: "iPadOS 18.4 • App", location: "Mombasa, KE", dash: "2 dashboards", active: "20 Jun 2025", status: "Active", current: false },
            ].map((row) => (
              <tr key={row.device}>
                <td>
                  <strong>{row.device}</strong>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{row.detail}</div>
                </td>
                <td>{row.location}</td>
                <td>{row.dash}</td>
                <td>{row.active}</td>
                <td>
                  <span className={`${s.badge} ${row.status === "New" ? s.badgeWarning : s.badgeSuccess}`}>{row.status}</span>
                </td>
                <td>
                  {row.current ? (
                    <button className={`${s.button} ${s.buttonSmall}`} disabled>This device</button>
                  ) : (
                    <button className={`${s.button} ${s.buttonSmall}`}>End Session</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2">
        <InfoBox variant="warning">
          <i className="bi bi-exclamation-triangle" /> A suspicious login was detected from Windows PC
          (Nairobi) on 26 Jun 2025. Verify it or revoke it now.
        </InfoBox>
      </div>
    </ModalShell>
  );

  /* ================= W18. Dashboard access logs ================= */
  const accessLogsModal = (
    <ModalShell
      show={isOpen("accessLogsModal")}
      onClose={() => close("accessLogsModal")}
      iconCls="bi bi-list-check"
      title="Dashboard Access Logs"
      size="xl"
      footer={
        <>
          <button className={s.button} onClick={() => close("accessLogsModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`}>Export CSV</button>
          <button className={s.button}>Export PDF</button>
        </>
      }
    >
      <div className={s.pills} style={{ marginBottom: 16 }}>
        {["All events", "Activations", "Linking", "Unlinking", "Revocations"].map((f, i) => (
          <button key={f} className={`${s.pill} ${i === 0 ? s.pillActive : ""}`}>{f}</button>
        ))}
      </div>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Dashboard</th>
              <th>IP</th>
              <th>Device</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: "27 Jun 2025 14:22", action: "Dashboard activated (Business Portal)", dash: "Business", ip: "102.68.XX.XX", device: "iPhone 15 Pro", status: "Success", variant: "success" },
              { date: "27 Jun 2025 14:21", action: "Account linked (Business Float)", dash: "Business", ip: "102.68.XX.XX", device: "iPhone 15 Pro", status: "Success", variant: "success" },
              { date: "26 Jun 2025 07:58", action: "New device login (Windows PC)", dash: "All", ip: "102.68.XX.XX", device: "Windows PC", status: "Review", variant: "warning" },
              { date: "20 Jun 2025 08:00", action: "Crypto Center access revoked", dash: "Crypto", ip: "105.XX.XX.XX", device: "iPad Air", status: "Revoked", variant: "danger" },
              { date: "15 Jun 2025 09:10", action: "Permission changed (Savings Jar)", dash: "Savings", ip: "102.68.XX.XX", device: "MacBook Pro", status: "Success", variant: "success" },
              { date: "03 Jun 2025 16:20", action: "Unlink requested (Old float)", dash: "Business", ip: "102.68.XX.XX", device: "MacBook Pro", status: "Pending", variant: "warning" },
              { date: "28 May 2025 22:04", action: "Activation consent captured", dash: "Utilities", ip: "102.68.XX.XX", device: "MacBook Pro", status: "Success", variant: "success" },
              { date: "12 May 2025 10:15", action: "Cross-dashboard limit increased", dash: "Business", ip: "102.68.XX.XX", device: "MacBook Pro", status: "Success", variant: "success" },
            ].map((row) => (
              <tr key={row.date}>
                <td style={{ whiteSpace: "nowrap" }}>{row.date}</td>
                <td>{row.action}</td>
                <td>{row.dash}</td>
                <td>{row.ip}</td>
                <td>{row.device}</td>
                <td>
                  <span className={`${s.badge} ${row.variant === "success" ? s.badgeSuccess : row.variant === "warning" ? s.badgeWarning : s.badgeDanger}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2">
        <InfoBox variant="success">
          <i className="bi bi-shield-lock" /> Logs are immutable and hash-verified (SHA-256). Any
          tampering is detectable.
        </InfoBox>
      </div>
    </ModalShell>
  );

  /* ================= W19. PIN & biometric management ================= */
  const pinManagementModal = (
    <TabbedModal
      show={isOpen("pinManagementModal")}
      onClose={() => close("pinManagementModal")}
      iconCls="bi bi-fingerprint"
      title="PIN & Biometric Management"
      tabs={[
        {
          key: "pin",
          label: "PIN",
          render: () => (
            <div>
              <div className={s.summaryRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Cross-dashboard PIN</div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Used for activations, links and relocations</div>
                </div>
                <span className={`${s.badge} ${s.badgeSuccess}`}><i className="bi bi-check-circle" /> Set</span>
              </div>
              <div className={s.summaryRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Attempt history</div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>3 attempts before 15-minute lockout</div>
                </div>
                <span className={`${s.badge} ${s.badgeOutline}`}>0 recent failures</span>
              </div>
              <div className={s.summaryRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Emergency PIN (duress)</div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Silently alerts security while appearing to work</div>
                </div>
                <span className={`${s.badge} ${s.badgeOutline}`}>Not set</span>
              </div>
              <div className="mt-2">
                <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => openModal("changePinModal")}>
                  <i className="bi bi-key" /> Change PIN
                </button>
              </div>
            </div>
          ),
        },
        {
          key: "biometric",
          label: "Biometrics",
          render: () => (
            <div>
              <Toggle checked onChange={() => { }} label="Biometric for dashboard activation" description="Require fingerprint / Face ID when activating a dashboard" />
              <Toggle checked={false} onChange={() => { }} label="Per-dashboard biometric" description="Require biometric for Business but not Utilities" />
              <Toggle checked onChange={() => { }} label="Biometric for money relocation" description="Adds a biometric step to the relocation wizard" />
              <InfoBox variant="info">
                <i className="bi bi-fingerprint" /> Biometrics are stored on-device (Secure Enclave) and
                never transmitted to PayMo servers.
              </InfoBox>
            </div>
          ),
        },
        {
          key: "recovery",
          label: "Recovery",
          render: () => (
            <div>
              <SelectField
                label="PIN recovery method"
                options={["Email + SMS + security questions", "Email + SMS", "Security questions only"]}
                defaultValue="Email + SMS + security questions"
              />
              <Toggle checked onChange={() => { }} label="SMS fallback after 2 failed PIN attempts" />
              <InfoBox variant="warning">
                <i className="bi bi-exclamation-triangle" /> Full account recovery requires KYC-verified
                documents and may take up to 24 hours.
              </InfoBox>
            </div>
          ),
        },
      ]}
      footer={
        <>
          <button className={s.button} onClick={() => close("pinManagementModal")}>
            Cancel
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => close("pinManagementModal")}>
            Save Security Settings
          </button>
        </>
      }
    />
  );

  /* ================= W20. Change PIN ================= */
  const changePinModal = (
    <SimpleModal
      show={isOpen("changePinModal")}
      onClose={() => close("changePinModal")}
      iconCls="bi bi-key"
      title="Change Cross-Dashboard PIN"
      size="lg"
      submitLabel="Change PIN"
      successTitle="PIN changed successfully!"
      successMsg="Your cross-dashboard PIN has been updated. All activations will require the new PIN."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className={s.formLabel}>Current PIN</label>
          <input type="password" className={s.formControl} maxLength={4} placeholder="••••" />
        </div>
        <div>
          <label className={s.formLabel}>New PIN (4-6 digits)</label>
          <input type="password" className={s.formControl} maxLength={6} placeholder="••••" />
        </div>
        <div>
          <label className={s.formLabel}>Confirm New PIN</label>
          <input type="password" className={s.formControl} maxLength={6} placeholder="••••" />
        </div>
        <InfoBox variant="warning">
          <i className="bi bi-exclamation-triangle" /> Avoid birthdays, sequences or repeated digits. Your
          PIN cannot match your last 5 PINs.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= W21. Profile quick view ================= */
  const profileQuickViewModal = (
    <SimpleModal
      show={isOpen("profileQuickViewModal")}
      onClose={() => close("profileQuickViewModal")}
      iconCls="bi bi-person-circle"
      title="Profile Quick View"
      size="lg"
      footer={
        <>
          <button className={s.button} onClick={() => close("profileQuickViewModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`}>Go to Full Profile</button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 18 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
          AK
        </div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Amina Grace Kamau</div>
        <span className={`${s.badge} ${s.badgeSuccess}`}>
          <i className="bi bi-patch-check" /> Premium • Full KYC
        </span>
      </div>
      <div style={fieldGrid}>
        {[
          { label: "Phone", value: "+254 712 345 890" },
          { label: "Email", value: "amina.kamau@personal.co.ke" },
          { label: "KRA PIN", value: "A00•••••89" },
          { label: "Language", value: "English (UK)" },
          { label: "Time Zone", value: "Africa/Nairobi" },
          { label: "Address", value: "Lavington Green, Nairobi" },
        ].map((info) => (
          <div key={info.label} style={{ padding: "12px 16px", borderRadius: 10, background: "var(--surface-2)" }}>
            <div style={{ color: "var(--ink-500)", fontSize: 11, marginBottom: 4 }}>{info.label}</div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{info.value}</div>
          </div>
        ))}
      </div>
    </SimpleModal>
  );

  /* ================= W22. Logout current dashboard ================= */
  const logoutCurrentModal = (
    <SimpleModal
      show={isOpen("logoutCurrentModal")}
      onClose={() => close("logoutCurrentModal")}
      iconCls="bi bi-box-arrow-right"
      title="Logout from Dashboard"
      size="lg"
      submitLabel="Logout"
      successTitle="Logged out!"
      successMsg="You have been signed out of the Business Portal. You will return to the wallet hub."
    >
      <InfoBox variant="info">
        <i className="bi bi-info-circle" /> Logging out of <strong>Business Portal</strong> returns you
        to the wallet activation hub. Other dashboards stay signed in.
      </InfoBox>
      <div className="mt-2">
        <Toggle checked={false} onChange={() => { }} label="Clear cache on logout" description="Remove locally cached balances and activity" />
      </div>
    </SimpleModal>
  );

  /* ================= W23. Logout all dashboards ================= */
  const logoutAllModal = (
    <SimpleModal
      show={isOpen("logoutAllModal")}
      onClose={() => close("logoutAllModal")}
      iconCls="bi bi-box-arrow-right"
      title="Logout from All Dashboards?"
      size="lg"
      submitLabel="Logout Everywhere"
      submitVariant="danger"
      successTitle="Signed out everywhere!"
      successMsg="All dashboard sessions across all devices have been ended and sessions cleaned up."
    >
      <InfoBox variant="warning">
        <i className="bi bi-exclamation-triangle" /> This ends every active session across all 8
        dashboards and devices. You will need to sign in again on each device.
      </InfoBox>
      <div className="mt-2">
        <Toggle checked onChange={() => { }} label="Secure session cleanup" description="Invalidate tokens and refresh cached credentials" />
        <Toggle checked={false} onChange={() => { }} label="Auto-logout timer" description="15 min • 30 min • 1 hour • never" />
      </div>
    </SimpleModal>
  );

  /* ================= W24. Disable dashboard ================= */
  const disableDashboardModal = (
    <SimpleModal
      show={isOpen("disableDashboardModal")}
      onClose={() => close("disableDashboardModal")}
      iconCls="bi bi-pause-circle"
      title="Temporarily Disable Dashboard"
      size="lg"
      submitLabel="Disable Dashboard"
      submitVariant="warning"
      successTitle="Dashboard disabled!"
      successMsg="Business Portal is paused. Your data is preserved and all links remain intact. Reactivate anytime."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <InfoBox variant="warning">
          <i className="bi bi-pause-circle" /> Disabling <strong>Business Portal</strong> blocks access
          but preserves all data, links and permissions.
        </InfoBox>
        <div>
          <label className={s.formLabel}>Reason (optional)</label>
          <select className={s.formControl} defaultValue="">
            <option value="">Select a reason...</option>
            <option>Not using this dashboard currently</option>
            <option>Security concern</option>
            <option>Business paused</option>
            <option>Other</option>
          </select>
        </div>
        <Toggle checked onChange={() => { }} label="Keep active links" description="Preserve linked accounts and permissions while disabled" />
      </div>
    </SimpleModal>
  );

  /* ================= W25. Close dashboard ================= */
  const closeDashboardModal = (
    <FlowModal
      show={isOpen("closeDashboardModal")}
      onClose={() => close("closeDashboardModal")}
      iconCls="bi bi-x-octagon"
      title="Permanently Close Dashboard"
      steps={["Understand impact", "Relocate funds", "Confirm closure"]}
      confirmLabel="Close Dashboard"
      submitVariant="danger"
    >
      {(step) => {
        if (step === 1) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InfoBox variant="danger">
                <i className="bi bi-exclamation-triangle" /> Closing <strong>Business Portal</strong> is
                permanent. A 30-day cooling-off period applies before deletion is finalized.
              </InfoBox>
              {[
                "All linked accounts from this dashboard are unlinked",
                "Recurring transfers and auto-rules are cancelled",
                "Data is preserved during the 30-day cooling-off period",
                "Reactivation is free within the cooling-off period",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 10, fontSize: 13 }}>
                  <i className="bi bi-x-circle" style={{ color: "var(--danger)", flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          );
        }
        if (step === 2) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InfoBox variant="warning">
                <i className="bi bi-wallet" /> You have <strong>KES 6,150,000</strong> in linked
                accounts on this dashboard. Funds must be relocated before closure.
              </InfoBox>
              <button className={`${s.button} ${s.buttonAccent}`} onClick={() => openModal("moneyRelocationModal")}>
                <i className="bi bi-arrow-left-right" /> Open Money Relocation Wizard
              </button>
              <InfoBox variant="info">
                <i className="bi bi-check-circle" /> Once balances are zero, closure proceeds. During the
                30-day cooling-off period you can still reactivate.
              </InfoBox>
            </div>
          );
        }
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
            <p style={{ fontSize: 13, color: "var(--ink-700)", textAlign: "center", maxWidth: 380 }}>
              Enter your PIN to confirm permanent closure of <strong>Business Portal</strong>.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {["_", "_", "_", "_"].map((_, i) => (
                <input key={i} type="password" inputMode="numeric" maxLength={1} style={{ width: 48, height: 56, textAlign: "center", fontSize: 22, fontWeight: 700, border: "2px solid var(--border)", borderRadius: 10 }} />
              ))}
            </div>
            <InfoBox variant="danger">
              <i className="bi bi-clock-history" /> A 30-day cooling-off period starts after confirmation.
              You can cancel anytime before final deletion.
            </InfoBox>
          </div>
        );
      }}
    </FlowModal>
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

  /* ================= W27. Auto-transfer rules engine ================= */
  const autoTransferRulesModal = (
    <TabbedModal
      show={isOpen("autoTransferRulesModal")}
      onClose={() => close("autoTransferRulesModal")}
      iconCls="bi bi-robot"
      title="Auto-Transfer Rules Engine"
      size="xl"
      tabs={[
        {
          key: "rules",
          label: "Rules",
          render: () => (
            <div>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--border)", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink-500)", marginBottom: 10 }}>Rule builder</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <label className={s.formLabel}>IF source balance</label>
                    <select className={s.formControl} defaultValue="is greater than">
                      <option>is greater than</option>
                      <option>is less than</option>
                      <option>reaches</option>
                    </select>
                  </div>
                  <div style={{ width: 120 }}>
                    <label className={s.formLabel}>Amount</label>
                    <input className={s.formControl} defaultValue="3,000,000" />
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <label className={s.formLabel}>THEN transfer</label>
                    <select className={s.formControl} defaultValue="50%">
                      <option>50%</option>
                      <option>Fixed amount</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <label className={s.formLabel}>To</label>
                    <select className={s.formControl} defaultValue="Savings Jar">
                      <option>Savings Jar</option>
                      <option>Primary PayMo Wallet</option>
                      <option>Business Float</option>
                    </select>
                  </div>
                  <button className={`${s.button} ${s.buttonPrimary}`}>
                    <i className="bi bi-plus-lg" /> Add Rule
                  </button>
                </div>
              </div>
              {[
                { name: "Balance sweep", desc: "IF Business Float > KES 3M THEN move 50% to KES Wallet", tag: "Threshold", tagCls: "var(--warning-bg)", tagColor: "#b45309", active: true },
                { name: "Salary split", desc: "On salary credit, auto-distribute 40% to Savings Jar", tag: "Schedule", tagCls: "var(--info-bg)", tagColor: "#1d4ed8", active: true },
                { name: "Bill top-up", desc: "On bill due, auto-pull KES 15,000 from Primary Wallet to Utilities", tag: "Trigger", tagCls: "var(--purple-bg)", tagColor: "#6d28d9", active: false },
              ].map((r) => (
                <div key={r.name} className={s.summaryRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: r.tagCls, color: r.tagColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                      <i className="bi bi-gear" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{r.desc}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: r.tagCls, color: r.tagColor }}>{r.tag}</span>
                  <Toggle checked={r.active} onChange={() => { }} />
                </div>
              ))}
            </div>
          ),
        },
        {
          key: "schedules",
          label: "Schedules",
          render: () => (
            <div>
              <SelectField
                label="Scheduled sweep frequency"
                options={["Daily", "Weekly (Monday 09:00)", "Monthly (1st)", "Never"]}
                defaultValue="Weekly (Monday 09:00)"
              />
              <SelectField
                label="Round-up rule"
                options={["Round to nearest 100 KES → Savings", "Round to nearest 500 KES → Savings", "Disabled"]}
                defaultValue="Round to nearest 100 KES → Savings"
              />
              <Toggle checked onChange={() => { }} label="Round-up enabled" description="Send the difference of rounded transactions to Savings dashboard" />
              <InfoBox variant="info">
                <i className="bi bi-piggy-bank" /> Round-ups move an average of KES 3,200/month into your
                savings automatically.
              </InfoBox>
            </div>
          ),
        },
        {
          key: "triggers",
          label: "Triggers",
          render: () => (
            <div>
              <Toggle checked onChange={() => { }} label="Salary-split rules" description="Auto-distribute salary credits to linked dashboards by percentage" />
              <Toggle checked={false} onChange={() => { }} label="Bill-due triggers" description="Auto-pull from Primary Wallet to Utilities when a bill is due" />
              <Toggle checked onChange={() => { }} label="Threshold sweeps" description="Move excess balance above a threshold automatically" />
              <InfoBox variant="warning">
                <i className="bi bi-exclamation-triangle" /> Automated rules are paused during the
                revocation cooldown window (72 hours).
              </InfoBox>
            </div>
          ),
        },
      ]}
      footer={
        <>
          <button className={s.button} onClick={() => close("autoTransferRulesModal")}>
            Cancel
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => close("autoTransferRulesModal")}>
            Save Rules
          </button>
        </>
      }
    />
  );

  /* ================= W28. Account naming & organization ================= */
  const accountNamingModal = (
    <TabbedModal
      show={isOpen("accountNamingModal")}
      onClose={() => close("accountNamingModal")}
      iconCls="bi bi-tags"
      title="Linked Account Naming & Organization"
      size="xl"
      tabs={[
        {
          key: "naming",
          label: "Nicknames",
          render: () => (
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { name: "PayMo KES Wallet", nickname: "Main Wallet", color: "#10b981" },
                  { name: "Business Float", nickname: "My Biz Float", color: "#8b5cf6" },
                  { name: "Savings Jar", nickname: "Rent Savings", color: "#f59e0b" },
                  { name: "Loan Disbursement", nickname: "", color: "#3b82f6" },
                ].map((acc) => (
                  <div key={acc.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                    <input
                      type="color"
                      defaultValue={acc.color}
                      style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{acc.name}</div>
                      <input className={s.formControl} defaultValue={acc.nickname} placeholder="Add a nickname…" style={{ marginTop: 6, fontSize: 12 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
        },
        {
          key: "grouping",
          label: "Grouping",
          render: () => (
            <div>
              <SelectField
                label="Account group"
                options={["Personal", "Business", "Family", "Investments", "Operational"]}
                defaultValue="Business"
              />
              <SelectField
                label="Default priority (auto-fill order)"
                options={["1 — Primary PayMo Wallet", "2 — Business Float", "3 — Savings Jar", "4 — Loan Disbursement", "5 — Fiat On-ramp"]}
                defaultValue="1 — Primary PayMo Wallet"
              />
              <Toggle checked onChange={() => { }} label="Use nickname in transfers" description="Show nicknames instead of account names in transfer forms" />
              <InfoBox variant="info">
                <i className="bi bi-arrow-down-up" /> Priority ranking controls the default source account
                used when initiating transfers from this dashboard.
              </InfoBox>
            </div>
          ),
        },
      ]}
      footer={
        <>
          <button className={s.button} onClick={() => close("accountNamingModal")}>
            Cancel
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => close("accountNamingModal")}>
            Save Organization
          </button>
        </>
      }
    />
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

  /* ================= W30. All attention items ================= */
  const attentionModal = (
    <SimpleModal
      show={isOpen("attentionModal")}
      onClose={() => close("attentionModal")}
      iconCls="bi bi-exclamation-circle"
      title="All Attention Items"
      size="lg"
    >
      <div>
        <div className={s.summaryRow}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>2 dashboards awaiting activation</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Business Portal & Government Services</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall} ${s.buttonPrimary}`} onClick={() => openModal("activateDashboardModal")}>
            Activate
          </button>
        </div>
        <div className={s.summaryRow}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Crypto Center access suspended</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Re-KYC required — document expires soon</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("accessLogsModal")}>
            Review
          </button>
        </div>
        <div className={s.summaryRow}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Business Float balance above threshold</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>KES 6.15M — consider auto-sweep rule</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("autoTransferRulesModal")}>
            Optimize
          </button>
        </div>
        <div className={s.summaryRow}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Suspicious login on Windows PC</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Nairobi, KE • 26 Jun 2025</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("activeSessionsModal")}>
            Review
          </button>
        </div>
        <div className={s.summaryRow}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Consent expiry approaching</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Utilities data-sharing consent expires in 14 days</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("privacyModal")}>
            Renew
          </button>
        </div>
        <div className={s.summaryRow}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Relocation pending for Loan Disbursement</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>KES 0 balance — nothing to relocate</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("moneyRelocationModal")}>
            Wizard
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
      {walletCardModal}
      {shareQRModal}
      {downloadAccountDetailsModal}
      {walletHealthModal}
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
      {activeSessionsModal}
      {accessLogsModal}
      {pinManagementModal}
      {changePinModal}
      {profileQuickViewModal}
      {logoutCurrentModal}
      {logoutAllModal}
      {disableDashboardModal}
      {closeDashboardModal}
      {supportHelpModal}
      {autoTransferRulesModal}
      {accountNamingModal}
      {linkLimitsModal}
      {attentionModal}
      {privacyModal}
      {preferencesModal}
    </>
  );
}
