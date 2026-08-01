/* ============================================================================
 * settings/modals/AccountSettingsModals.tsx
 * ----------------------------------------------------------------------------
 * All modals for the Account Settings & Administration page. Refactored from
 * the legacy 1.18.html modal blocks — every modal is state-driven through the
 * shared modal primitives (no Bootstrap-JS, no innerHTML). Includes the
 * original settings modals plus new developer / preference / lifecycle
 * modals for the comprehensive settings hub.
 * ========================================================================== */
"use client";

import { useState } from "react";
import shared from "../../shared/styles/appPage.module.css";
import {
  FlowModal,
  InfoBox,
  ModalShell,
  SelectField,
  SimpleModal,
  TabbedModal,
  Toggle,
} from "../../shared-settings-acc/components/modals";

const s = shared as Record<string, string>;

export interface AccountSettingsModalsProps {
  modalState: Record<string, boolean>;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
}

export function AccountSettingsModals({
  modalState,
  openModal,
  closeModal,
}: AccountSettingsModalsProps) {
  const isOpen = (id: string) => !!modalState[id];
  const close = (id: string) => closeModal(id);

  /* ---- shared local state ---- */
  const [editTab, setEditTab] = useState(0);
  const [kycTab, setKycTab] = useState(0);
  const [notifTab, setNotifTab] = useState(0);
  const [prefTab, setPrefTab] = useState(0);
  const [apiTab, setApiTab] = useState(0);

  const fieldGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  };

  const fullRow: React.CSSProperties = { gridColumn: "1 / -1" };

  /* ================= S1. All Attention Items ================= */
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
            <div style={{ fontWeight: 600, fontSize: 13 }}>Password expires in 12 days</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Policy: 90-day rotation • last changed 89 days ago</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("changePasswordModal")}>
            Update
          </button>
        </div>
        <div className={s.summaryRow}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Secondary phone not verified</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Profile completeness at 98%</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("editProfileModal")}>
            Verify
          </button>
        </div>
        <div className={s.summaryRow}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>New login from Windows PC</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Nairobi, KE • 26 Jun 2025 • not yet confirmed</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("sessionModal")}>
            Review
          </button>
        </div>
        <div className={s.summaryRow}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Proof of address expiring</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Utility bill expires 15 Aug 2025</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("kycModal")}>
            Renew
          </button>
        </div>
        <div className={s.summaryRow}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>3 recommendations waiting</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Biometrics, POA renewal, data sharing review</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("securityAuditModal")}>
            Review
          </button>
        </div>
      </div>
    </SimpleModal>
  );

  /* ================= S2. Change Password ================= */
  const changePasswordModal = (
    <SimpleModal
      show={isOpen("changePasswordModal")}
      onClose={() => close("changePasswordModal")}
      iconCls="bi bi-key"
      title="Change Password"
      submitLabel="Change Password"
      successTitle="Password changed successfully!"
      successMsg="All other sessions have been signed out. Use your new password on your next login."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className={s.formLabel}>Current Password</label>
          <input type="password" className={s.formControl} placeholder="Enter current password" />
        </div>
        <div>
          <label className={s.formLabel}>New Password</label>
          <input type="password" className={s.formControl} placeholder="Min 12 characters" />
        </div>
        <div>
          <label className={s.formLabel}>Confirm New Password</label>
          <input type="password" className={s.formControl} placeholder="Confirm new password" />
        </div>
        <InfoBox variant="info">
          <i className="bi bi-info-circle" /> Must be at least 12 characters with uppercase, a number and a
          symbol. Cannot reuse any of your last 3 passwords. You will be signed out of other devices.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= S3. Two-Factor Authentication (wizard) ================= */
  const enable2FAModal = (
    <FlowModal
      show={isOpen("enable2FAModal")}
      onClose={() => close("enable2FAModal")}
      iconCls="bi bi-shield-check"
      title="Two-Factor Authentication"
      steps={["Choose method", "Scan QR code", "Verify"]}
      confirmLabel="Enable 2FA"
    >
      {(step) => {
        if (step === 1) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "bi bi-phone", name: "Authenticator App", desc: "Google Authenticator, Authy or Microsoft Authenticator", active: true },
                { icon: "bi bi-chat-dots", name: "SMS Verification", desc: "Receive a one-time code by SMS on your primary number", active: false },
                { icon: "bi bi-fingerprint", name: "Biometric", desc: "Fingerprint or Face ID on trusted devices", active: false },
              ].map((m) => (
                <div
                  key={m.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: m.active ? "2px solid var(--pri)" : "1px solid var(--border)",
                    background: m.active ? "var(--success-bg)" : "var(--surface-2)",
                    cursor: "pointer",
                  }}
                >
                  <div className={s.iconChip} style={{ background: "#fff", color: "var(--pri)" }}>
                    <i className={m.icon} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{m.desc}</div>
                  </div>
                  <i className={`bi ${m.active ? "bi-check-circle-fill" : "bi-circle"}`} style={{ color: m.active ? "var(--pri)" : "var(--ink-300)", fontSize: 18 }} />
                </div>
              ))}
            </div>
          );
        }
        if (step === 2) {
          return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 170,
                  height: 170,
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="bi bi-qr-code" style={{ fontSize: 90, color: "var(--pri)" }} />
              </div>
              <code style={{ fontSize: 12, background: "var(--surface-2)", padding: "6px 12px", borderRadius: 6 }}>
                JBSW Y3DP EHPK 3PXP
              </code>
              <p style={{ fontSize: 12, color: "var(--ink-500)", textAlign: "center", margin: 0, maxWidth: 380 }}>
                Scan the QR code with your authenticator app. Keep your phone available — you will need a
                code to continue. Backup codes are generated on the next step.
              </p>
            </div>
          );
        }
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "var(--success-bg)",
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color: "#047857",
              }}
            >
              <i className="bi bi-check-circle-fill" /> Enter the 6-digit code from your authenticator app.
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {["_", "_", "_", "_", "_", "_"].map((_, i) => (
                <input
                  key={i}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  style={{
                    width: 44,
                    height: 54,
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: 700,
                    border: "2px solid var(--border)",
                    borderRadius: 10,
                  }}
                />
              ))}
            </div>
            <InfoBox variant="success">
              <i className="bi bi-shield-check" /> On completion, 10 single-use backup codes will be shown.
              Store them safely — they are the only way in if you lose your device.
            </InfoBox>
          </div>
        );
      }}
    </FlowModal>
  );

  /* ================= S4. Security Questions ================= */
  const securityQuestionsModal = (
    <SimpleModal
      show={isOpen("securityQuestionsModal")}
      onClose={() => close("securityQuestionsModal")}
      iconCls="bi bi-question-circle"
      title="Security Questions"
      submitLabel="Save Questions"
      successTitle="Security questions updated!"
      successMsg="Your recovery questions are now set. They are only used during account recovery."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SelectField
          label="Question 1"
          options={["What was the name of your first pet?", "What city were you born in?", "What was your first school?"]}
          defaultValue="What was the name of your first pet?"
        />
        <div>
          <label className={s.formLabel}>Answer 1</label>
          <input className={s.formControl} placeholder="Your answer" />
        </div>
        <SelectField
          label="Question 2"
          options={["What is your mother's maiden name?", "What street did you grow up on?", "What was your first car?"]}
          defaultValue="What city were you born in?"
        />
        <div>
          <label className={s.formLabel}>Answer 2</label>
          <input className={s.formControl} placeholder="Your answer" />
        </div>
        <SelectField
          label="Question 3"
          options={["What was your childhood nickname?", "What is your favourite teacher's name?", "What was your first job?"]}
          defaultValue="What was your first school?"
        />
        <div>
          <label className={s.formLabel}>Answer 3</label>
          <input className={s.formControl} placeholder="Your answer" />
        </div>
        <InfoBox variant="warning">
          <i className="bi bi-exclamation-triangle" /> Answers are case-sensitive and cannot contain your
          name or date of birth. They can only be changed with full KYC verification.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= S5. Full Security Audit Log ================= */
  const securityAuditModal = (
    <ModalShell
      show={isOpen("securityAuditModal")}
      onClose={() => close("securityAuditModal")}
      iconCls="bi bi-shield-check"
      title="Full Security Audit Log"
      size="lg"
      footer={
        <>
          <button className={s.button} onClick={() => close("securityAuditModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`}>Export CSV</button>
        </>
      }
    >
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Event</th>
              <th>IP</th>
              <th>Device</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: "27 Jun 2025 14:22", event: "Login from new device", ip: "102.68.XX.XX", device: "iPhone 15 Pro", status: "Success" },
              { date: "27 Jun 2025 14:21", event: "2FA challenge passed", ip: "102.68.XX.XX", device: "iPhone 15 Pro", status: "Success" },
              { date: "15 Jun 2025 09:10", event: "Password changed", ip: "102.68.XX.XX", device: "MacBook Pro", status: "Success" },
              { date: "10 Jun 2025 11:45", event: "2FA enabled via Authenticator App", ip: "102.68.XX.XX", device: "MacBook Pro", status: "Success" },
              { date: "03 Jun 2025 16:20", event: "KYC document uploaded (Utility Bill)", ip: "102.68.XX.XX", device: "MacBook Pro", status: "Pending" },
              { date: "01 Jun 2025 08:00", event: "Session terminated remotely", ip: "105.XX.XX.XX", device: "iPad Air", status: "Success" },
              { date: "28 May 2025 22:04", event: "Failed login attempt (wrong password)", ip: "196.XX.XX.XX", device: "Unknown", status: "Blocked" },
              { date: "20 May 2025 07:35", event: "API key created (Production)", ip: "102.68.XX.XX", device: "MacBook Pro", status: "Success" },
            ].map((row) => (
              <tr key={row.date}>
                <td style={{ whiteSpace: "nowrap" }}>{row.date}</td>
                <td>{row.event}</td>
                <td>{row.ip}</td>
                <td>{row.device}</td>
                <td>
                  <span className={`${s.badge} ${row.status === "Blocked" ? s.badgeDanger : row.status === "Pending" ? s.badgeWarning : s.badgeSuccess}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModalShell>
  );

  /* ================= S6. Active Sessions ================= */
  const sessionModal = (
    <ModalShell
      show={isOpen("sessionModal")}
      onClose={() => close("sessionModal")}
      iconCls="bi bi-laptop"
      title="Active Sessions"
      size="lg"
      footer={
        <>
          <button className={s.button} onClick={() => close("sessionModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonDanger}`} onClick={() => openModal("terminateAllSessionsModal")}>
            Terminate All Other Sessions
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
              <th>Last Active</th>
              <th>IP</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              { device: "iPhone 15 Pro", detail: "iOS 18.5 • App v4.2.1", location: "Nairobi, KE", active: "Just now", ip: "102.68.XX.XX", status: "Current", current: true },
              { device: "MacBook Pro", detail: "macOS 15.4 • Safari", location: "Nairobi, KE", active: "14:22 today", ip: "102.68.XX.XX", status: "Active", current: false },
              { device: "Windows PC", detail: "Windows 11 • Chrome", location: "Nairobi, KE", active: "26 Jun 2025", ip: "102.68.XX.XX", status: "New", current: false },
              { device: "iPad Air", detail: "iPadOS 18.4 • App", location: "Mombasa, KE", active: "20 Jun 2025", ip: "105.XX.XX.XX", status: "Active", current: false },
            ].map((row) => (
              <tr key={row.device}>
                <td>
                  <strong>{row.device}</strong>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{row.detail}</div>
                </td>
                <td>{row.location}</td>
                <td>{row.active}</td>
                <td>{row.ip}</td>
                <td>
                  <span className={`${s.badge} ${row.status === "New" ? s.badgeWarning : s.badgeSuccess}`}>{row.status}</span>
                </td>
                <td>
                  {row.current ? (
                    <button className={`${s.button} ${s.buttonSmall}`} disabled>
                      This device
                    </button>
                  ) : (
                    <button className={`${s.button} ${s.buttonSmall}`}>Terminate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModalShell>
  );

  /* ================= S7. Terminate all sessions confirm ================= */
  const terminateAllSessionsModal = (
    <SimpleModal
      show={isOpen("terminateAllSessionsModal")}
      onClose={() => close("terminateAllSessionsModal")}
      iconCls="bi bi-exclamation-triangle"
      title="Terminate All Sessions?"
      submitLabel="Terminate All"
      submitVariant="danger"
      successTitle="All sessions terminated!"
      successMsg="All other devices have been signed out. You remain signed in on this device."
    >
      <InfoBox variant="warning">
        <i className="bi bi-exclamation-triangle" /> This will log you out from all other devices, apps
        and connected services. You will need to sign in again on each device.
      </InfoBox>
    </SimpleModal>
  );

  /* ================= S8. KYC Document Vault (tabs) ================= */
  const kycModal = (
    <ModalShell
      show={isOpen("kycModal")}
      onClose={() => close("kycModal")}
      iconCls="bi bi-file-earmark-check"
      title="KYC & Document Vault"
      size="lg"
      footer={
        <>
          <button className={s.button} onClick={() => close("kycModal")}>
            Close
          </button>
          {kycTab === 0 && (
            <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => openModal("viewDocModal")}>
              Upload Document
            </button>
          )}
        </>
      }
    >
      <div className={s.pills} style={{ marginBottom: 20 }}>
        {["Upload", "View Documents", "Status"].map((tab, i) => (
          <button
            key={tab}
            className={`${s.pill} ${kycTab === i ? s.pillActive : ""}`}
            onClick={() => setKycTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      {kycTab === 0 && (
        <div style={fieldGrid}>
          <div>
            <label className={s.formLabel}>Document Type</label>
            <select className={s.formControl} defaultValue="National ID">
              <option>National ID</option>
              <option>Passport</option>
              <option>Utility Bill</option>
              <option>Bank Statement</option>
              <option>Selfie</option>
            </select>
          </div>
          <div>
            <label className={s.formLabel}>Expiry Date (if applicable)</label>
            <input type="date" className={s.formControl} />
          </div>
          <div style={fullRow}>
            <label className={s.formLabel}>Upload File</label>
            <div
              style={{
                border: "2px dashed var(--border-2)",
                borderRadius: 12,
                padding: "32px",
                textAlign: "center",
                background: "var(--surface-2)",
                cursor: "pointer",
              }}
            >
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: 32, color: "var(--ink-300)", display: "block", marginBottom: 8 }} />
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Click to upload or drag and drop</p>
              <p style={{ fontSize: 12, color: "var(--ink-500)", margin: 0 }}>PDF, JPG, PNG — max 10 MB</p>
            </div>
          </div>
        </div>
      )}

      {kycTab === 1 && (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Expiry</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "National ID", type: "Identity", status: "Verified", uploaded: "12 Jan 2023", expiry: "—", variant: "success" },
                { name: "Passport", type: "Identity", status: "Verified", uploaded: "03 Mar 2024", expiry: "Mar 2031", variant: "success" },
                { name: "Utility Bill", type: "Address", status: "Expiring", uploaded: "15 May 2025", expiry: "15 Aug 2025", variant: "warning" },
                { name: "Selfie", type: "Identity", status: "Verified", uploaded: "12 Jan 2023", expiry: "—", variant: "success" },
                { name: "Bank Statement", type: "Financial", status: "Verified", uploaded: "20 Jun 2025", expiry: "—", variant: "success" },
              ].map((doc) => (
                <tr key={doc.name}>
                  <td>
                    <strong>{doc.name}</strong>
                  </td>
                  <td>{doc.type}</td>
                  <td>
                    <span className={`${s.badge} ${doc.variant === "warning" ? s.badgeWarning : s.badgeSuccess}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td>{doc.uploaded}</td>
                  <td>{doc.expiry}</td>
                  <td>
                    <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("viewDocModal")}>
                      {doc.status === "Expiring" ? "Renew" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {kycTab === 2 && (
        <div>
          <div
            style={{
              background: "var(--success-bg)",
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <i className="bi bi-check-circle-fill" style={{ fontSize: 28, color: "#047857" }} />
            <div>
              <div style={{ fontWeight: 700, color: "#047857", fontSize: 14 }}>Verification Status: FULLY VERIFIED</div>
              <div style={{ fontSize: 12, color: "#065F46" }}>
                All required documents approved. Account limits fully unlocked.
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
              <span>Identity</span>
              <span>100%</span>
            </div>
            <div className={s.progressTrack}>
              <div className={s.progressBar} style={{ width: "100%" }} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
              <span>Address</span>
              <span>75%</span>
            </div>
            <div className={s.progressTrack}>
              <div className={s.progressBar} style={{ width: "75%", background: "var(--warning)" }} />
            </div>
          </div>
          <div>
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: 12 }}>
              <span>Financial</span>
              <span>100%</span>
            </div>
            <div className={s.progressTrack}>
              <div className={s.progressBar} style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      )}
    </ModalShell>
  );

  /* ================= S9. Document Viewer ================= */
  const viewDocModal = (
    <SimpleModal
      show={isOpen("viewDocModal")}
      onClose={() => close("viewDocModal")}
      iconCls="bi bi-file-earmark"
      title="Document Viewer"
      footer={
        <>
          <button className={s.button} onClick={() => close("viewDocModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`}>Download PDF</button>
        </>
      }
    >
      <div style={{ padding: "28px", textAlign: "center", background: "var(--surface-2)", borderRadius: 12 }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: 16,
            background: "var(--info-bg)",
            color: "var(--info)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            margin: "0 auto 16px",
          }}
        >
          <i className="bi bi-file-earmark-text" />
        </div>
        <div style={{ fontWeight: 700 }}>National ID — 32****891</div>
        <div style={{ fontSize: 12, color: "var(--ink-500)", marginTop: 4 }}>Verified on 12 Jan 2023</div>
        <div className="mt-2">
          <span className={`${s.badge} ${s.badgeSuccess}`}>
            <i className="bi bi-shield-check" /> Authentic document
          </span>
        </div>
      </div>
    </SimpleModal>
  );

  /* ================= S10. Advanced Notification Settings ================= */
  const notifSettingsModal = (
    <TabbedModal
      show={isOpen("notifSettingsModal")}
      onClose={() => close("notifSettingsModal")}
      iconCls="bi bi-sliders"
      title="Advanced Notification Settings"
      tabs={[
        {
          key: "channels",
          label: "Channels",
          render: () => (
            <div>
              <Toggle
                checked
                onChange={() => { }}
                label="Email notifications"
                description="Send alerts to amina.kamau@personal.co.ke"
              />
              <Toggle
                checked
                onChange={() => { }}
                label="SMS notifications"
                description="Send alerts to +254 712 345 890"
              />
              <Toggle
                checked
                onChange={() => { }}
                label="Push notifications"
                description="Deliver to the PayMo mobile app"
              />
              <Toggle
                checked={false}
                onChange={() => { }}
                label="WhatsApp notifications"
                description="Deliver to your linked WhatsApp number"
              />
            </div>
          ),
        },
        {
          key: "quiet",
          label: "Quiet Hours",
          render: () => (
            <div>
              <Toggle
                checked
                onChange={() => { }}
                label="Enable quiet hours"
                description="Suppress non-critical alerts during selected hours"
              />
              <div style={fieldGrid}>
                <div>
                  <label className={s.formLabel}>From</label>
                  <input type="time" className={s.formControl} defaultValue="22:00" />
                </div>
                <div>
                  <label className={s.formLabel}>To</label>
                  <input type="time" className={s.formControl} defaultValue="07:00" />
                </div>
              </div>
              <div className="mt-2">
                <Toggle
                  checked={false}
                  onChange={() => { }}
                  label="Allow security alerts during quiet hours"
                  description="Critical events are always delivered"
                />
              </div>
            </div>
          ),
        },
        {
          key: "digest",
          label: "Digest",
          render: () => (
            <div>
              <SelectField
                label="Email digest frequency"
                options={["Daily", "Weekly (Monday)", "Monthly", "Never"]}
                defaultValue="Weekly (Monday)"
              />
              <SelectField
                label="Activity summary depth"
                options={["Full transaction list", "Summary only", "Balance only"]}
                defaultValue="Summary only"
              />
              <InfoBox variant="info">
                <i className="bi bi-info-circle" /> Digest emails consolidate all non-urgent updates.
                Security and transaction alerts are always sent immediately.
              </InfoBox>
            </div>
          ),
        },
      ]}
      footer={
        <>
          <button className={s.button} onClick={() => close("notifSettingsModal")}>
            Cancel
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => close("notifSettingsModal")}>
            Save Settings
          </button>
        </>
      }
    />
  );

  /* ================= S11. Privacy & Data Controls ================= */
  const privacyModal = (
    <SimpleModal
      show={isOpen("privacyModal")}
      onClose={() => close("privacyModal")}
      iconCls="bi bi-lock"
      title="Privacy & Data Controls"
      submitLabel="Save Preferences"
      successTitle="Privacy preferences saved!"
      successMsg="Your data sharing and marketing preferences have been updated."
    >
      <div>
        <Toggle
          checked
          onChange={() => { }}
          label="Share anonymized usage data"
          description="Help us improve PayMo with anonymous product analytics."
        />
        <Toggle
          checked={false}
          onChange={() => { }}
          label="Allow partners to contact me"
          description="Receive relevant offers from vetted financial partners."
        />
        <Toggle
          checked
          onChange={() => { }}
          label="Personalized recommendations"
          description="Tailored products based on your account activity."
        />
        <Toggle
          checked={false}
          onChange={() => { }}
          label="Share data with credit bureaus"
          description="Let us report on-time payments to build credit history."
        />
        <Toggle
          checked={false}
          onChange={() => { }}
          label="Email marketing"
          description="Offers, product updates and feature announcements."
        />
        <div style={{ marginTop: 12 }}>
          <InfoBox variant="info">
            <i className="bi bi-file-earmark-lock" /> You can request a full copy of your data at any time
            from the Export button, or request deletion from the account lifecycle section.
          </InfoBox>
        </div>
      </div>
    </SimpleModal>
  );

  /* ================= S12. Download / Export data ================= */
  const downloadDataModal = (
    <SimpleModal
      show={isOpen("downloadDataModal")}
      onClose={() => close("downloadDataModal")}
      iconCls="bi bi-download"
      title="Download Your Data"
      submitLabel="Request Export"
      successTitle="Export requested!"
      successMsg="Your data export will be ready within 24 hours and sent to your primary email."
      successRef="DATA-20250627-9914"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SelectField
          label="Data Range"
          options={["All data (Jan 2023 – Present)", "Last 12 months", "Last 3 months"]}
        />
        <SelectField label="Format" options={["JSON (complete)", "CSV (transactions)", "PDF (summary)"]} />
        <div style={fieldGrid}>
          <Toggle checked onChange={() => { }} label="Include documents" description="KYC files & statements" />
          <Toggle checked={false} onChange={() => { }} label="Include activity logs" description="Login & device history" />
        </div>
        <InfoBox variant="info">
          <i className="bi bi-info-circle" /> Your export includes profile, transactions, documents and
          activity logs. Large exports may take up to 24 hours.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= S13. Close Account (danger flow) ================= */
  const closeAccountModal = (
    <FlowModal
      show={isOpen("closeAccountModal")}
      onClose={() => close("closeAccountModal")}
      iconCls="bi bi-exclamation-triangle"
      title="Close Account"
      steps={["Understand impact", "Confirm identity", "Submit request"]}
      confirmLabel="Close Account"
      submitVariant="danger"
    >
      {(step) => {
        if (step === 1) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "var(--danger-bg)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: "#b91c1c",
                }}
              >
                <i className="bi bi-exclamation-triangle-fill" /> Closing your account is permanent and
                cannot be undone.
              </div>
              {[
                "All balances are converted and paid out to your linked account",
                "Recurring payments, standing orders and scheduled transfers are cancelled",
                "Cards are frozen immediately and virtual cards destroyed",
                "KYC documents and historical records are retained for 7 years (legal requirement)",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 10, fontSize: 13 }}>
                  <i className="bi bi-x-circle" style={{ color: "var(--danger)", flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
              <Toggle
                checked
                onChange={() => { }}
                label="I understand my account will be closed permanently"
              />
            </div>
          );
        }
        if (step === 2) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <InfoBox variant="warning">
                <i className="bi bi-shield-lock" /> For your security we need to confirm your identity.
                A 6-digit code has been sent to +254 712 345 890.
              </InfoBox>
              <div>
                <label className={s.formLabel}>Reason for closing (optional)</label>
                <select className={s.formControl} defaultValue="">
                  <option value="">Select a reason...</option>
                  <option>Found a better provider</option>
                  <option>Too many fees</option>
                  <option>Privacy concerns</option>
                  <option>Business closed</option>
                  <option>Duplicate account</option>
                </select>
              </div>
              <div>
                <label className={s.formLabel}>Payout account</label>
                <select className={s.formControl} defaultValue="M-Pesa 0712 345 890">
                  <option>M-Pesa 0712 345 890</option>
                  <option>Equity Bank ****4521</option>
                </select>
              </div>
            </div>
          );
        }
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
            <p style={{ fontSize: 13, color: "var(--ink-700)", textAlign: "center", maxWidth: 380 }}>
              A 6-digit code was sent to your registered phone number. Enter it to confirm the closure
              request.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {["_", "_", "_", "_", "_", "_"].map((_, i) => (
                <input
                  key={i}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  style={{
                    width: 44,
                    height: 54,
                    textAlign: "center",
                    fontSize: 20,
                    fontWeight: 700,
                    border: "2px solid var(--border)",
                    borderRadius: 10,
                  }}
                />
              ))}
            </div>
            <InfoBox variant="danger">
              <i className="bi bi-exclamation-triangle" /> Your request will be processed within 5
              business days. A final confirmation is sent before any funds are paid out.
            </InfoBox>
          </div>
        );
      }}
    </FlowModal>
  );

  /* ================= S14. Reactivation request ================= */
  const reactivateModal = (
    <SimpleModal
      show={isOpen("reactivateModal")}
      onClose={() => close("reactivateModal")}
      iconCls="bi bi-arrow-counterclockwise"
      title="Request Account Reactivation"
      submitLabel="Submit Request"
      successTitle="Reactivation requested!"
      successMsg="Our support team will review your request and contact you within 2 business days."
      successRef="REACT-20250627-4410"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <InfoBox variant="info">
          <i className="bi bi-info-circle" /> Your account is currently <strong>Active</strong>. Use this
          flow to request reactivation after a voluntary hold, suspension or closure in progress.
        </InfoBox>
        <SelectField
          label="Reason for reactivation"
          options={["I closed my account by mistake", "Account was suspended in error", "I wish to reopen my business account", "Other"]}
        />
        <div>
          <label className={s.formLabel}>Additional details</label>
          <textarea className={s.formControl} rows={3} placeholder="Tell us anything we should know" />
        </div>
      </div>
    </SimpleModal>
  );

  /* ================= S15. Create API Key (tabbed) ================= */
  const apiKeyModal = (
    <TabbedModal
      show={isOpen("apiKeyModal")}
      onClose={() => close("apiKeyModal")}
      iconCls="bi bi-key"
      title="Create API Key"
      tabs={[
        {
          key: "create",
          label: "Create Key",
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className={s.formLabel}>Key Name</label>
                <input className={s.formControl} placeholder="e.g. Production, Sandbox, Merchant Portal" />
              </div>
              <SelectField
                label="Environment"
                options={["Production", "Sandbox (test)", "Merchant Portal"]}
                defaultValue="Sandbox (test)"
              />
              <div>
                <label className={s.formLabel}>Permissions</label>
                <div className={s.softBox} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Toggle checked onChange={() => { }} label="Read balances & transactions" />
                  <Toggle checked onChange={() => { }} label="Initiate payments & transfers" />
                  <Toggle checked={false} onChange={() => { }} label="Manage virtual cards" />
                  <Toggle checked={false} onChange={() => { }} label="Manage webhooks" />
                </div>
              </div>
            </div>
          ),
        },
        {
          key: "webhooks",
          label: "Webhooks",
          render: () => (
            <div>
              <div className={s.summaryRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>https://merchant.example.com/hook</div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>events: payment.succeeded, card.frozen</div>
                </div>
                <span className={`${s.badge} ${s.badgeSuccess}`}>Active</span>
              </div>
              <div className={s.summaryRow}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>https://staging.example.com/hook</div>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>events: all events</div>
                </div>
                <span className={`${s.badge} ${s.badgeOutline}`}>Paused</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <button className={`${s.button} ${s.buttonPrimary}`}>
                  <i className="bi bi-plus-lg" /> Add Webhook
                </button>
              </div>
            </div>
          ),
        },
        {
          key: "rotate",
          label: "Rotate",
          render: () => (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SelectField
                label="Rotate key"
                options={["Production — pm_live_9xK2••••••••••••", "Sandbox — pm_test_5yQ7••••••••••••", "Merchant Portal — pm_merch_3tR8••••••"]}
                defaultValue="Production — pm_live_9xK2••••••••••••"
              />
              <InfoBox variant="warning">
                <i className="bi bi-exclamation-triangle" /> Rotating a key immediately revokes the old
                key. Update your integrations before rotating to avoid service interruption.
              </InfoBox>
            </div>
          ),
        },
      ]}
      footer={
        <>
          <button className={s.button} onClick={() => close("apiKeyModal")}>
            Cancel
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => close("apiKeyModal")}>
            Generate Key
          </button>
        </>
      }
    />
  );

  /* ================= S16. Webhooks ================= */
  const webhookModal = (
    <SimpleModal
      show={isOpen("webhookModal")}
      onClose={() => close("webhookModal")}
      iconCls="bi bi-broadcast"
      title="Manage Webhooks"
      submitLabel="Save Webhook"
      successTitle="Webhook updated!"
      successMsg="Your webhook endpoint and event subscriptions have been saved."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className={s.formLabel}>Endpoint URL</label>
          <input className={s.formControl} defaultValue="https://merchant.example.com/hook" />
        </div>
        <div>
          <label className={s.formLabel}>Secret</label>
          <input type="password" className={s.formControl} defaultValue="whsec_9xK2••••••••••" />
        </div>
        <div>
          <label className={s.formLabel}>Events</label>
          <div className={s.softBox} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Toggle checked onChange={() => { }} label="payment.succeeded" />
            <Toggle checked onChange={() => { }} label="payment.failed" />
            <Toggle checked onChange={() => { }} label="card.frozen" />
            <Toggle checked={false} onChange={() => { }} label="kyc.updated" />
            <Toggle checked={false} onChange={() => { }} label="session.terminated" />
          </div>
        </div>
        <div className={s.summaryRow} style={{ paddingBottom: 0, borderBottom: "none" }}>
          <span style={{ fontSize: 13, color: "var(--ink-700)" }}>Delivery status</span>
          <span className={`${s.badge} ${s.badgeSuccess}`}>
            <i className="bi bi-check-circle" /> Healthy — 0 failures
          </span>
        </div>
      </div>
    </SimpleModal>
  );

  /* ================= S17. Preferences & Localization ================= */
  const preferencesModal = (
    <TabbedModal
      show={isOpen("preferencesModal")}
      onClose={() => close("preferencesModal")}
      iconCls="bi bi-gear"
      title="Preferences & Localization"
      tabs={[
        {
          key: "localization",
          label: "Localization",
          render: () => (
            <div style={fieldGrid}>
              <SelectField label="Language" options={["English (UK)", "English (US)", "Swahili", "French"]} defaultValue="English (UK)" />
              <SelectField label="Secondary Language" options={["None", "Swahili", "French"]} defaultValue="Swahili" />
              <SelectField label="Time Zone" options={["Africa/Nairobi (EAT, UTC+03:00)", "UTC", "Africa/Kampala", "Africa/Kigali"]} defaultValue="Africa/Nairobi (EAT, UTC+03:00)" />
              <SelectField label="Default Currency" options={["KES — Kenyan Shilling", "USD — US Dollar", "GBP — British Pound"]} defaultValue="KES — Kenyan Shilling" />
              <SelectField label="Number Format" options={["1,234,567.89", "1 234 567,89", "1.234.567,89"]} />
              <SelectField label="Date Format" options={["DD MMM YYYY (27 Jun 2025)", "YYYY-MM-DD", "MM/DD/YYYY"]} defaultValue="DD MMM YYYY (27 Jun 2025)" />
            </div>
          ),
        },
        {
          key: "interface",
          label: "Interface",
          render: () => (
            <div>
              <SelectField label="Interface Theme" options={["Emerald Light", "Dark", "System sync"]} defaultValue="Emerald Light" />
              <SelectField label="Statement Frequency" options={["Monthly", "Quarterly", "Never (self-serve)"]} defaultValue="Monthly" />
              <Toggle checked onChange={() => { }} label="Reduced motion" description="Minimize animations and transitions" />
              <Toggle checked onChange={() => { }} label="High contrast mode" description="Stronger text and border contrast" />
              <Toggle checked onChange={() => { }} label="Compact density" description="Show more rows in tables and lists" />
              <Toggle checked={false} onChange={() => { }} label="Sound effects" description="Play sounds for confirmations and alerts" />
            </div>
          ),
        },
        {
          key: "accessibility",
          label: "Accessibility",
          render: () => (
            <div>
              <SelectField
                label="Text Size"
                options={["Small", "Standard", "Large", "Extra large"]}
                defaultValue="Standard"
              />
              <Toggle checked={false} onChange={() => { }} label="Screen reader announcements" />
              <Toggle checked onChange={() => { }} label="Keyboard navigation hints" />
              <Toggle checked={false} onChange={() => { }} label="Color-blind friendly palette" />
              <InfoBox variant="info">
                <i className="bi bi-universal-access" /> Accessibility preferences apply to the web app and
                are synced to the mobile app when signed in.
              </InfoBox>
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

  /* ================= S18. Edit Profile (tabbed) ================= */
  const editProfileModal = (
    <ModalShell
      show={isOpen("editProfileModal")}
      onClose={() => close("editProfileModal")}
      iconCls="bi bi-person"
      title="Edit Profile"
      size="lg"
      footer={
        <>
          <button className={s.button} onClick={() => close("editProfileModal")}>
            Cancel
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => close("editProfileModal")}>
            Save Changes
          </button>
        </>
      }
    >
      <div className={s.pills} style={{ marginBottom: 20 }}>
        {["Personal", "Contact", "Address"].map((tab, i) => (
          <button
            key={tab}
            className={`${s.pill} ${editTab === i ? s.pillActive : ""}`}
            onClick={() => setEditTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      {editTab === 0 && (
        <div style={fieldGrid}>
          <div>
            <label className={s.formLabel}>Full Legal Name</label>
            <input className={s.formControl} defaultValue="Amina Grace Kamau" />
          </div>
          <div>
            <label className={s.formLabel}>Preferred Name</label>
            <input className={s.formControl} defaultValue="Amina K." />
          </div>
          <div>
            <label className={s.formLabel}>Date of Birth</label>
            <input type="date" className={s.formControl} defaultValue="1992-03-14" />
          </div>
          <div>
            <label className={s.formLabel}>Gender</label>
            <select className={s.formControl} defaultValue="Female">
              <option>Female</option>
              <option>Male</option>
              <option>Prefer not to say</option>
            </select>
          </div>
          <div>
            <label className={s.formLabel}>Nationality</label>
            <select className={s.formControl} defaultValue="Kenyan">
              <option>Kenyan</option>
              <option>Ugandan</option>
              <option>Tanzanian</option>
            </select>
          </div>
          <div>
            <label className={s.formLabel}>ID Type</label>
            <select className={s.formControl} defaultValue="National ID">
              <option>National ID</option>
              <option>Passport</option>
              <option>Driving Licence</option>
            </select>
          </div>
        </div>
      )}

      {editTab === 1 && (
        <div style={fieldGrid}>
          <div>
            <label className={s.formLabel}>Primary Phone</label>
            <input className={s.formControl} defaultValue="+254 712 345 890" />
          </div>
          <div>
            <label className={s.formLabel}>Secondary Phone</label>
            <input className={s.formControl} placeholder="Add secondary phone" />
          </div>
          <div>
            <label className={s.formLabel}>Primary Email</label>
            <input className={s.formControl} defaultValue="amina.kamau@personal.co.ke" />
          </div>
          <div>
            <label className={s.formLabel}>Work Email</label>
            <input className={s.formControl} defaultValue="amina@company.co.ke" />
          </div>
          <div>
            <label className={s.formLabel}>Preferred Language</label>
            <select className={s.formControl} defaultValue="English">
              <option>English</option>
              <option>Swahili</option>
              <option>French</option>
            </select>
          </div>
          <div>
            <label className={s.formLabel}>Time Zone</label>
            <select className={s.formControl} defaultValue="Africa/Nairobi">
              <option>Africa/Nairobi (EAT)</option>
              <option>Africa/Kampala</option>
              <option>UTC</option>
            </select>
          </div>
        </div>
      )}

      {editTab === 2 && (
        <div style={fieldGrid}>
          <div style={fullRow}>
            <label className={s.formLabel}>Residential Address</label>
            <textarea className={s.formControl} rows={2} defaultValue="Apt 3A, Lavington Green, Nairobi, Kenya" />
          </div>
          <div>
            <label className={s.formLabel}>City</label>
            <input className={s.formControl} defaultValue="Nairobi" />
          </div>
          <div>
            <label className={s.formLabel}>Postal Code</label>
            <input className={s.formControl} defaultValue="00100" />
          </div>
          <div>
            <label className={s.formLabel}>Postal Address</label>
            <input className={s.formControl} defaultValue="P.O. Box 4521-00100, Nairobi" />
          </div>
          <div>
            <label className={s.formLabel}>Country</label>
            <select className={s.formControl} defaultValue="Kenya">
              <option>Kenya</option>
              <option>Uganda</option>
              <option>Tanzania</option>
            </select>
          </div>
        </div>
      )}
    </ModalShell>
  );

  /* ================= S19. Linked Accounts & Wallets ================= */
  const linkedAccountsModal = (
    <TabbedModal
      show={isOpen("linkedAccountsModal")}
      onClose={() => close("linkedAccountsModal")}
      iconCls="bi bi-link-45deg"
      title="Linked Accounts & Wallets"
      tabs={[
        {
          key: "accounts",
          label: "Accounts",
          render: () => (
            <div>
              {[
                { name: "M-Pesa", detail: "0712 345 890", grad: "linear-gradient(135deg,#4CAF50,#2E7D32)", letter: "M", linked: true },
                { name: "Equity Bank", detail: "Account ****4521", grad: "linear-gradient(135deg,#FF6F00,#E65100)", letter: "E", linked: true },
                { name: "KCB Bank", detail: "Account ****7782", grad: "linear-gradient(135deg,#1565C0,#0D47A1)", letter: "K", linked: false },
                { name: "Airtel Money", detail: "0733 981 204", grad: "linear-gradient(135deg,#D32F2F,#B71C1C)", letter: "A", linked: false },
              ].map((acc) => (
                <div className={s.summaryRow} key={acc.name}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: acc.grad,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {acc.letter}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{acc.name}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{acc.detail}</div>
                    </div>
                  </div>
                  {acc.linked ? (
                    <span className={`${s.badge} ${s.badgeSuccess}`}>Linked</span>
                  ) : (
                    <button className={`${s.button} ${s.buttonSmall} ${s.buttonPrimary}`}>Link</button>
                  )}
                </div>
              ))}
            </div>
          ),
        },
        {
          key: "savings",
          label: "PayMo Accounts",
          render: () => (
            <div>
              <div className={s.summaryRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className={s.iconChip} style={{ background: "var(--success-bg)", color: "var(--success)" }}>
                    <i className="bi bi-wallet2" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>PayMo KES Wallet</div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)" }}>•••• 5530 • KES 1,284,300</div>
                  </div>
                </div>
                <span className={`${s.badge} ${s.badgeSuccess}`}>Default</span>
              </div>
              <div className={s.summaryRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className={s.iconChip} style={{ background: "var(--info-bg)", color: "var(--info)" }}>
                    <i className="bi bi-globe" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>PayMo USD Account</div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)" }}>•••• 8842 • USD 2,410</div>
                  </div>
                </div>
                <span className={`${s.badge} ${s.badgeOutline}`}>Active</span>
              </div>
              <div className={s.summaryRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className={s.iconChip} style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>
                    <i className="bi bi-piggy-bank" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>PayMo Savings Account</div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)" }}>•••• 2091 • KES 356,000</div>
                  </div>
                </div>
                <span className={`${s.badge} ${s.badgeOutline}`}>Active</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <button className={`${s.button} ${s.buttonPrimary}`}>
                  <i className="bi bi-plus-lg" /> Open New Account
                </button>
              </div>
            </div>
          ),
        },
      ]}
    />
  );

  return (
    <>
      {attentionModal}
      {changePasswordModal}
      {enable2FAModal}
      {securityQuestionsModal}
      {securityAuditModal}
      {sessionModal}
      {terminateAllSessionsModal}
      {kycModal}
      {viewDocModal}
      {notifSettingsModal}
      {privacyModal}
      {downloadDataModal}
      {closeAccountModal}
      {reactivateModal}
      {apiKeyModal}
      {webhookModal}
      {preferencesModal}
      {editProfileModal}
      {linkedAccountsModal}
    </>
  );
}
