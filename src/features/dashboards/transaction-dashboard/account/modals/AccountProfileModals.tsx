/* ============================================================================
 * account/modals/AccountProfileModals.tsx
 * ----------------------------------------------------------------------------
 * All modals for the Account Profile & Digital Bank page. Refactored from the
 * legacy 1.18.html modal blocks — every modal is state-driven through the
 * shared modal primitives (no Bootstrap-JS, no innerHTML). Includes the
 * original account modals plus new digital-banking modals.
 * ========================================================================== */
"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import shared from "../../shared/styles/appPage.module.css";
import {
  FlowModal,
  InfoBox,
  ModalShell,
  PinRow,
  ReviewRow,
  SelectField,
  SimpleModal,
  TabbedModal,
  Toggle,
} from "../../shared-settings-acc/components/modals";

const s = shared as Record<string, string>;

export interface AccountProfileModalsProps {
  modalState: Record<string, boolean>;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
}

export function AccountProfileModals({
  modalState,
  openModal,
  closeModal,
}: AccountProfileModalsProps) {
  const isOpen = (id: string) => !!modalState[id];
  const close = (id: string) => closeModal(id);

  /* ---- shared local state ---- */
  const [editTab, setEditTab] = useState(0);
  const [kycTab, setKycTab] = useState(0);
  const [accountTab, setAccountTab] = useState(0);
  const [biometric, setBiometric] = useState(true);
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);

  const fieldGrid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  };

  const fullRow: React.CSSProperties = { gridColumn: "1 / -1" };

  /* ================= M1. Edit Profile (tabbed wizard) ================= */
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
          <button
            className={`${s.button} ${s.buttonPrimary}`}
            onClick={() => openModal("profileSavedModal")}
          >
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
              <option>Rwandan</option>
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

  /* ================= M2. Profile Saved receipt ================= */
  const profileSavedModal = (
    <SimpleModal
      show={isOpen("profileSavedModal")}
      onClose={() => close("profileSavedModal")}
      iconCls="bi bi-check-circle"
      title="Profile Updated"
      successTitle="Profile updated successfully!"
      successMsg="Your changes have been saved and will reflect across all PayMo services, statements and documents."
    />
  );

  /* ================= M3. Full Profile View ================= */
  const profileModal = (
    <SimpleModal
      show={isOpen("profileModal")}
      onClose={() => close("profileModal")}
      iconCls="bi bi-person-circle"
      title="Full Profile View"
      footer={
        <>
          <button className={s.button} onClick={() => close("profileModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => openModal("editProfileModal")}>
            Edit Profile
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 20 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          AK
        </div>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Amina Grace Kamau</div>
        <div style={{ color: "var(--ink-500)", fontSize: 13 }}>Premium Member since Jan 2023</div>
        <span className={`${s.badge} ${s.badgeSuccess}`}>
          <i className="bi bi-patch-check" /> Verified Account
        </span>
      </div>

      <div style={fieldGrid}>
        {[
          { label: "Email", value: "amina.kamau@personal.co.ke" },
          { label: "Phone", value: "+254 712 345 890" },
          { label: "Nationality", value: "Kenyan" },
          { label: "ID Number", value: "32****891" },
          { label: "Date of Birth", value: "14 Mar 1992" },
          { label: "Gender", value: "Female" },
          { label: "Member Since", value: "12 January 2023" },
          { label: "Account Type", value: "Individual — Premium" },
        ].map((info) => (
          <div key={info.label} style={{ padding: "12px 16px", borderRadius: 10, background: "var(--surface-2)" }}>
            <div style={{ color: "var(--ink-500)", fontSize: 11, marginBottom: 4 }}>{info.label}</div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{info.value}</div>
          </div>
        ))}
      </div>
    </SimpleModal>
  );

  /* ================= M4. KYC Document Vault (tabs) ================= */
  const kycModal = (
    <ModalShell
      show={isOpen("kycModal")}
      onClose={() => close("kycModal")}
      iconCls="bi bi-file-earmark-check"
      title="KYC Document Vault"
      size="lg"
      footer={
        <>
          <button className={s.button} onClick={() => close("kycModal")}>
            Close
          </button>
          {kycTab === 0 && (
            <button
              className={`${s.button} ${s.buttonPrimary}`}
              onClick={() => openModal("docUploadedModal")}
            >
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

  /* ================= M5. Document uploaded receipt ================= */
  const docUploadedModal = (
    <SimpleModal
      show={isOpen("docUploadedModal")}
      onClose={() => close("docUploadedModal")}
      iconCls="bi bi-check-circle"
      title="Document Uploaded"
      successTitle="Document uploaded successfully!"
      successMsg="Your document has been submitted for verification. You will be notified within 24 hours."
      successRef="KYC-20250627-8812"
    />
  );

  /* ================= M6. Document Viewer ================= */
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

  /* ================= M7. All Attention Items ================= */
  const attentionModal = (
    <SimpleModal
      show={isOpen("attentionModal")}
      onClose={() => close("attentionModal")}
      iconCls="bi bi-exclamation-circle"
      title="All Attention Items"
    >
      <div>
        <div className={s.summaryRow}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Password expires in 12 days</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Last changed 89 days ago</div>
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
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Nairobi • 26 Jun 2025</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("sessionModal")}>
            Review
          </button>
        </div>
        <div className={s.summaryRow}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Proof of address expiring</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Utility bill expires in 45 days</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("kycModal")}>
            Renew
          </button>
        </div>
        <div className={s.summaryRow}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>Upgrade to Platinum tier</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>Higher limits, lower fees, priority support</div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`}>Review</button>
        </div>
      </div>
    </SimpleModal>
  );

  /* ================= M12. Card Details ================= */
  const cardDetailsModal = (
    <SimpleModal
      show={isOpen("cardDetailsModal")}
      onClose={() => close("cardDetailsModal")}
      iconCls="bi bi-credit-card-2-front"
      title="Card Details"
      footer={
        <>
          <button className={s.button} onClick={() => close("cardDetailsModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonDanger}`}>Freeze Card</button>
          <button className={`${s.button} ${s.buttonPrimary}`}>Copy Details</button>
        </>
      }
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b, #334155 60%, #10b981)",
          borderRadius: 16,
          padding: 24,
          color: "#fff",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>PAYMO</div>
          <div
            style={{
              width: 34,
              height: 24,
              background: "linear-gradient(135deg, #fbbf24, #d97706)",
              borderRadius: 6,
            }}
          />
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, letterSpacing: 3, marginBottom: 20 }}>
          •••• •••• •••• 4412
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 9, textTransform: "uppercase", opacity: 0.7 }}>Card Holder</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>AMINA KAMAU</div>
          </div>
          <div>
            <div style={{ fontSize: 9, textTransform: "uppercase", opacity: 0.7 }}>Expires</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>08/27</div>
          </div>
          <div>
            <div style={{ fontSize: 9, textTransform: "uppercase", opacity: 0.7 }}>CVV</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>•••</div>
          </div>
        </div>
      </div>
      <div className={s.summaryRow}>
        <span style={{ color: "var(--ink-700)" }}>Status</span>
        <span className={`${s.badge} ${s.badgeSuccess}`}>Active</span>
      </div>
      <div className={s.summaryRow}>
        <span style={{ color: "var(--ink-700)" }}>Spent this month</span>
        <strong>KES 48,200 / 100,000</strong>
      </div>
      <div className={s.summaryRow}>
        <span style={{ color: "var(--ink-700)" }}>Used in</span>
        <strong>12 merchants</strong>
      </div>
    </SimpleModal>
  );

  /* ================= M13. Linked Accounts ================= */
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
          key: "cards",
          label: "Cards",
          render: () => (
            <div>
              <div className={s.summaryRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--ink-300)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                    <i className="bi bi-credit-card" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Visa Debit •••• 4412</div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Virtual • expires 08/27</div>
                  </div>
                </div>
                <button className={`${s.button} ${s.buttonSmall}`} onClick={() => openModal("cardDetailsModal")}>
                  View
                </button>
              </div>
              <div className={s.summaryRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--ink-300)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                    <i className="bi bi-credit-card" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Mastercard •••• 8820</div>
                    <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Physical • expires 05/28</div>
                  </div>
                </div>
                <span className={`${s.badge} ${s.badgeWarning}`}>Frozen</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <button
                  className={`${s.button} ${s.buttonPrimary}`}
                  onClick={() => openModal("virtualCardModal")}
                >
                  <i className="bi bi-plus-lg" /> Create Virtual Card
                </button>
              </div>
            </div>
          ),
        },
      ]}
    />
  );

  /* ================= M14. Account Activity Detail ================= */
  const activityDetailModal = (
    <SimpleModal
      show={isOpen("activityDetailModal")}
      onClose={() => close("activityDetailModal")}
      iconCls="bi bi-arrow-left-right"
      title="Transaction Details"
      footer={
        <>
          <button className={s.button} onClick={() => close("activityDetailModal")}>
            Close
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => openModal("receiptModal")}>
            Download Receipt
          </button>
        </>
      }
    >
      <div
        style={{
          textAlign: "center",
          padding: "12px 0 20px",
          borderBottom: "1px solid var(--border)",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 13, color: "var(--ink-500)" }}>Amount</div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 30, fontWeight: 700, color: "var(--success)" }}>
          +KES 125,000
        </div>
        <span className={`${s.badge} ${s.badgeSuccess}`}>Completed</span>
      </div>
      <ReviewRow label="Reference" value="PAY-20250627-8841" />
      <ReviewRow label="From" value="PayMo KES Wallet" />
      <ReviewRow label="To" value="Amina Grace Kamau" />
      <ReviewRow label="Date" value="27 Jun 2025, 14:22 EAT" />
      <ReviewRow label="Rail" value="PesaLink" />
      <ReviewRow label="Fee" value="KES 50" />
      <ReviewRow label="Narration" value="Salary disbursement" />
    </SimpleModal>
  );

  /* ================= M15. Receipt modal ================= */
  const receiptModal = (
    <SimpleModal
      show={isOpen("receiptModal")}
      onClose={() => close("receiptModal")}
      iconCls="bi bi-receipt"
      title="Payment Receipt"
      successTitle="Receipt downloaded!"
      successMsg="Your payment receipt has been generated and saved to your device as PDF."
      successRef="RCT-20250627-8841"
    >
      <div className={s.receipt}>
        <div className={s.receiptIcon}>
          <i className="bi bi-check-lg" />
        </div>
        <div style={{ fontWeight: 700, fontSize: 22, color: "var(--pri-700)" }}>KES 125,000</div>
        <div style={{ fontSize: 12, color: "var(--ink-500)" }}>To Amina Grace Kamau</div>
        <hr className={s.divider} />
        <ReviewRow label="Ref" value="PAY-20250627-8841" />
        <ReviewRow label="Date" value="27 Jun 2025" />
        <ReviewRow label="Rail" value="PesaLink" />
        <ReviewRow label="Fee" value="KES 50" />
      </div>
    </SimpleModal>
  );

  /* ================= M16. Change Password (used by attention) ================= */
  const changePasswordModal = (
    <SimpleModal
      show={isOpen("changePasswordModal")}
      onClose={() => close("changePasswordModal")}
      iconCls="bi bi-key"
      title="Change Password"
      submitLabel="Change Password"
      successTitle="Password changed successfully!"
      successMsg="All other sessions have been logged out for your security."
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
          <i className="bi bi-info-circle" /> Must be at least 12 characters with uppercase, number and
          symbol. Cannot reuse your last 3 passwords.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= M17. Sessions (referenced from attention) ================= */
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
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {[
              { device: "iPhone 15 Pro", detail: "iOS 18.5 • App v4.2.1", location: "Nairobi, KE", active: "Just now", status: "Current", current: true },
              { device: "MacBook Pro", detail: "macOS 15.4 • Safari", location: "Nairobi, KE", active: "14:22 today", status: "Active", current: false },
              { device: "Windows PC", detail: "Windows 11 • Chrome", location: "Nairobi, KE", active: "26 Jun 2025", status: "New", current: false },
              { device: "iPad Air", detail: "iPadOS 18.4 • App", location: "Mombasa, KE", active: "20 Jun 2025", status: "Active", current: false },
            ].map((row) => (
              <tr key={row.device}>
                <td>
                  <strong>{row.device}</strong>
                  <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{row.detail}</div>
                </td>
                <td>{row.location}</td>
                <td>{row.active}</td>
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

  /* ================= M18. Terminate all sessions confirm ================= */
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
        <i className="bi bi-exclamation-triangle" /> This will log you out from all other devices. You
        will need to sign in again on each device.
      </InfoBox>
    </SimpleModal>
  );

  /* ================= M19. 2FA (referenced from suggestions) ================= */
  const enable2FAModal = (
    <SimpleModal
      show={isOpen("enable2FAModal")}
      onClose={() => close("enable2FAModal")}
      iconCls="bi bi-shield-check"
      title="Two-Factor Authentication"
      submitLabel="Enable 2FA"
      successTitle="2FA enabled!"
      successMsg="Two-factor authentication is now active. Backup codes have been generated."
    >
      <div className={s.pills} style={{ marginBottom: 20 }}>
        {["Authenticator App", "SMS", "Biometric"].map((tab, i) => (
          <button
            key={tab}
            className={`${s.pill} ${i === 0 ? s.pillActive : ""}`}
            onClick={(e) => {
              const parent = e.currentTarget.parentElement;
              parent?.querySelectorAll("button").forEach((b) => b.classList.remove(s.pillActive));
              e.currentTarget.classList.add(s.pillActive);
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            width: 160,
            height: 160,
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <i className="bi bi-qr-code" style={{ fontSize: 80, color: "var(--pri)" }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <code style={{ fontSize: 12, background: "var(--surface-2)", padding: "6px 12px", borderRadius: 6 }}>
            JBSW Y3DP EHPK 3PXP
          </code>
        </div>
        <p style={{ fontSize: 12, color: "var(--ink-500)", textAlign: "center", margin: 0 }}>
          Scan the QR code with Google Authenticator, Authy or your preferred app, then enter the 6-digit
          code to confirm.
        </p>
      </div>
    </SimpleModal>
  );

  /* ================= M20. Download data (referenced from quick actions) ================= */
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
        <InfoBox variant="info">
          <i className="bi bi-info-circle" /> Your export includes profile, transactions, documents and
          activity logs. Large exports may take up to 24 hours.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= M21. New quick-action helpers ================= */
  const privacyModal = (
    <SimpleModal
      show={isOpen("privacyModal")}
      onClose={() => close("privacyModal")}
      iconCls="bi bi-lock"
      title="Privacy & Data Controls"
      submitLabel="Save Preferences"
      successTitle="Preferences saved!"
      successMsg="Your privacy preferences have been updated successfully."
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
          description="Let us report your on-time payments to build credit history."
        />
      </div>
    </SimpleModal>
  );

  /* ================= M22. Transaction Limits Modal ================= */
  const transactionLimitsModal = (
    <SimpleModal
      show={isOpen("transactionLimitsModal")}
      onClose={() => close("transactionLimitsModal")}
      iconCls="bi bi-sliders"
      title="Configure Transaction Limits"
      submitLabel="Save Limits"
      successTitle="Limits Updated!"
      successMsg="Your transaction limits have been successfully updated."
      successRef="TLIM-20250627-7732"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className={s.pills} style={{ marginBottom: 8 }}>
          {["PayMo KES Wallet", "Utility Account", "Services Account", "USD Account"].map((tab, i) => (
            <button
              key={tab}
              className={`${s.pill} ${editTab === i ? s.pillActive : ""}`}
              onClick={() => setEditTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={fieldGrid}>
          <div>
            <label className={s.formLabel}>Daily Limit (KES)</label>
            <input className={s.formControl} type="number" defaultValue="500000" />
          </div>
          <div>
            <label className={s.formLabel}>Monthly Limit (KES)</label>
            <input className={s.formControl} type="number" defaultValue="2000000" />
          </div>
          <div>
            <label className={s.formLabel}>Per Transaction Limit (KES)</label>
            <input className={s.formControl} type="number" defaultValue="100000" />
          </div>
          <div>
            <label className={s.formLabel}>Weekly Limit (KES)</label>
            <input className={s.formControl} type="number" defaultValue="1000000" />
          </div>
        </div>

        <div style={fieldGrid}>
          <div>
            <label className={s.formLabel}>Limit Reset Time</label>
            <input className={s.formControl} type="time" defaultValue="18:00" />
          </div>
          <div>
            <label className={s.formLabel}>Timezone</label>
            <select className={s.formControl} defaultValue="EAT">
              <option>EAT (Africa/Nairobi)</option>
              <option>UTC</option>
              <option>GMT</option>
            </select>
          </div>
        </div>

        <Toggle
          checked
          onChange={() => { }}
          label="Allow limit override with OTP"
          description="Request OTP confirmation when exceeding limits"
        />

        <InfoBox variant="info">
          <i className="bi bi-info-circle" /> PayMo to PayMo transfers are FREE and unlimited. These limits apply to external transfers only.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= M23. Business Limits Modal ================= */
  const businessLimitsModal = (
    <SimpleModal
      show={isOpen("businessLimitsModal")}
      onClose={() => close("businessLimitsModal")}
      iconCls="bi bi-building"
      title="Business Account Limits"
      submitLabel="Save Changes"
      successTitle="Business Limits Updated!"
      successMsg="Your business account limits have been successfully updated."
      successRef="BLIM-20250627-7733"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className={s.utilityBlock} style={{ background: "var(--surface-2)" }}>
          <div className={s.summaryRow} style={{ paddingBottom: 0, borderBottom: "none" }}>
            <span style={{ fontSize: 13, color: "var(--ink-500)" }}>Selected Business</span>
            <strong>TechVentures Ltd</strong>
          </div>
        </div>

        <div style={fieldGrid}>
          <div>
            <label className={s.formLabel}>Daily Limit (KES)</label>
            <input className={s.formControl} type="number" defaultValue="5000000" />
          </div>
          <div>
            <label className={s.formLabel}>Monthly Limit (KES)</label>
            <input className={s.formControl} type="number" defaultValue="15000000" />
          </div>
          <div>
            <label className={s.formLabel}>Per Transaction Limit (KES)</label>
            <input className={s.formControl} type="number" defaultValue="1000000" />
          </div>
          <div>
            <label className={s.formLabel}>International Limit (USD)</label>
            <input className={s.formControl} type="number" defaultValue="50000" />
          </div>
        </div>

        <Toggle
          checked
          onChange={() => { }}
          label="Require approval for high-value transfers"
          description="Transfers above KES 1,000,000 require secondary approval"
        />

        <Toggle
          checked={false}
          onChange={() => { }}
          label="Allow employee access"
          description="Grant limited access to designated employees"
        />
      </div>
    </SimpleModal>
  );

  /* ================= M24. Link Business Modal ================= */
  const linkBusinessModal = (
    <SimpleModal
      show={isOpen("linkBusinessModal")}
      onClose={() => close("linkBusinessModal")}
      iconCls="bi bi-building"
      title="Link Business Account"
      submitLabel="Link Account"
      successTitle="Business Linked!"
      successMsg="Your business account has been successfully linked."
      successRef="BLNK-20250627-7734"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={fieldGrid}>
          <div style={{ gridColumn: "span 2" }}>
            <label className={s.formLabel}>Business Registration Number</label>
            <input className={s.formControl} placeholder="Enter business registration number" />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label className={s.formLabel}>Business Name</label>
            <input className={s.formControl} placeholder="Enter registered business name" />
          </div>
          <div>
            <label className={s.formLabel}>KRA PIN</label>
            <input className={s.formControl} placeholder="Enter KRA PIN" />
          </div>
          <div>
            <label className={s.formLabel}>Business Type</label>
            <select className={s.formControl} defaultValue="">
              <option value="">Select business type...</option>
              <option>Limited Company</option>
              <option>Sole Proprietorship</option>
              <option>Partnership</option>
              <option>NGO/CBO</option>
            </select>
          </div>
        </div>

        <InfoBox variant="warning">
          <i className="bi bi-exclamation-triangle" /> You will need to upload business registration documents for verification after linking.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= M25. External Accounts Modal ================= */
  const externalAccountsModal = (
    <SimpleModal
      show={isOpen("externalAccountsModal")}
      onClose={() => close("externalAccountsModal")}
      iconCls="bi bi-link-45deg"
      title="Manage External Accounts"
      submitLabel="Save Changes"
      successTitle="Accounts Updated!"
      successMsg="Your external account settings have been successfully updated."
      successRef="EXTL-20250627-7735"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className={s.pills} style={{ marginBottom: 8 }}>
          {["Bank Accounts", "Mobile Money", "Crypto Wallets"].map((tab, i) => (
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
            <div style={{ gridColumn: "span 2" }}>
              <label className={s.formLabel}>Bank Name</label>
              <select className={s.formControl} defaultValue="">
                <option value="">Select bank...</option>
                <option>Equity Bank</option>
                <option>KCB Bank</option>
                <option>Standard Chartered</option>
                <option>Cooperative Bank</option>
                <option>ABSA Bank</option>
                <option>Other</option>
              </select>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label className={s.formLabel}>Account Number</label>
              <input className={s.formControl} placeholder="Enter account number" />
            </div>
            <div>
              <label className={s.formLabel}>Account Type</label>
              <select className={s.formControl} defaultValue="">
                <option value="">Select type...</option>
                <option>Savings</option>
                <option>Current</option>
                <option>Fixed Deposit</option>
              </select>
            </div>
            <div>
              <label className={s.formLabel}>Currency</label>
              <select className={s.formControl} defaultValue="KES">
                <option>KES</option>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
          </div>
        )}

        {editTab === 1 && (
          <div style={fieldGrid}>
            <div>
              <label className={s.formLabel}>Mobile Money Provider</label>
              <select className={s.formControl} defaultValue="">
                <option value="">Select provider...</option>
                <option>M-Pesa</option>
                <option>Airtel Money</option>
                <option>T-Kash</option>
              </select>
            </div>
            <div>
              <label className={s.formLabel}>Phone Number</label>
              <input className={s.formControl} placeholder="07XX XXX XXX" />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label className={s.formLabel}>Account Name</label>
              <input className={s.formControl} placeholder="Registered account name" />
            </div>
          </div>
        )}

        <Toggle
          checked
          onChange={() => { }}
          label="Set as default payout account"
          description="This account will be used for automatic payouts"
        />
      </div>
    </SimpleModal>
  );

  /* ================= M26. Auto Payouts Modal ================= */
  const autoPayoutsModal = (
    <SimpleModal
      show={isOpen("autoPayoutsModal")}
      onClose={() => close("autoPayoutsModal")}
      iconCls="bi bi-arrow-repeat"
      title="Configure Auto Payout"
      submitLabel="Save Schedule"
      successTitle="Payout Configured!"
      successMsg="Your auto payout schedule has been successfully saved."
      successRef="APAY-20250627-7736"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={fieldGrid}>
          <div style={{ gridColumn: "span 2" }}>
            <label className={s.formLabel}>Schedule Name</label>
            <input className={s.formControl} placeholder="e.g., Daily Sweep to Equity" />
          </div>
          <div>
            <label className={s.formLabel}>Payout Type</label>
            <select className={s.formControl} defaultValue="">
              <option value="">Select type...</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Instant (Real-time)</option>
              <option>Custom</option>
            </select>
          </div>
          <div>
            <label className={s.formLabel}>Amount</label>
            <input className={s.formControl} placeholder="KES amount or %" />
          </div>
        </div>

        <div style={fieldGrid}>
          <div>
            <label className={s.formLabel}>Destination Account</label>
            <select className={s.formControl} defaultValue="">
              <option value="">Select destination...</option>
              <option>Equity Bank •••• 4521</option>
              <option>KCB Bank •••• 7782</option>
              <option>M-Pesa 0712 345 890</option>
              <option>Airtel Money 0733 456 789</option>
            </select>
          </div>
          <div>
            <label className={s.formLabel}>Schedule Time</label>
            <input className={s.formControl} type="time" defaultValue="18:00" />
          </div>
        </div>

        <Toggle
          checked
          onChange={() => { }}
          label="Minimum balance threshold"
          description="Only payout if balance exceeds KES 50,000"
        />

        <InfoBox variant="info">
          <i className="bi bi-lightning-charge" /> Instant payouts automatically transfer funds when money is collected from clients in real-time.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= M27. Security Limits Modal ================= */
  const securityLimitsModal = (
    <SimpleModal
      show={isOpen("securityLimitsModal")}
      onClose={() => close("securityLimitsModal")}
      iconCls="bi bi-shield-lock"
      title="Security Limits & OTP Verification"
      submitLabel="Save Security Rules"
      successTitle="Security Updated!"
      successMsg="Your security limits have been successfully updated."
      successRef="SECL-20250627-7737"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className={s.pills} style={{ marginBottom: 8 }}>
          {["Internal Transfers", "External Bank", "Mobile Money", "International", "Bill Payment"].map((tab, i) => (
            <button
              key={tab}
              className={`${s.pill} ${editTab === i ? s.pillActive : ""}`}
              onClick={() => setEditTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={fieldGrid}>
          <div>
            <label className={s.formLabel}>OTP Threshold (KES)</label>
            <input className={s.formControl} type="number" defaultValue="500000" />
          </div>
          <div>
            <label className={s.formLabel}>OTP Method</label>
            <select className={s.formControl} defaultValue="WhatsApp">
              <option>SMS</option>
              <option>WhatsApp</option>
              <option>Email</option>
              <option>SMS + WhatsApp</option>
              <option>SMS + WhatsApp + Email</option>
            </select>
          </div>
        </div>

        <Toggle
          checked
          onChange={() => { }}
          label="Require OTP for this transfer type"
          description="Enable OTP verification for transfers above threshold"
        />

        <Toggle
          checked={false}
          onChange={() => { }}
          label="Biometric verification (mobile only)"
          description="Use fingerprint or face recognition for additional security"
        />

        <InfoBox variant="danger">
          <i className="bi bi-exclamation-triangle" /> OTP verification protects against unauthorized transfers. Set appropriate thresholds based on your risk tolerance.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= M28. Country Restrictions Modal ================= */
  const countryRestrictionsModal = (
    <SimpleModal
      show={isOpen("countryRestrictionsModal")}
      onClose={() => close("countryRestrictionsModal")}
      iconCls="bi bi-globe"
      title="Country Restrictions & Verification"
      submitLabel="Save Restrictions"
      successTitle="Restrictions Updated!"
      successMsg="Your country restrictions have been successfully updated."
      successRef="CNTR-20250627-7738"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={fieldGrid}>
          <div style={{ gridColumn: "span 2" }}>
            <label className={s.formLabel}>Country</label>
            <select className={s.formControl} defaultValue="">
              <option value="">Select country...</option>
              <option>Kenya (KE) - National</option>
              <option>Uganda (UG)</option>
              <option>Tanzania (TZ)</option>
              <option>Rwanda (RW)</option>
              <option>United States (US)</option>
              <option>United Kingdom (GB)</option>
              <option>United Arab Emirates (AE)</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className={s.formLabel}>Status</label>
            <select className={s.formControl} defaultValue="Allowed">
              <option>Allowed</option>
              <option>Restricted</option>
              <option>Blocked</option>
            </select>
          </div>
          <div>
            <label className={s.formLabel}>Transfer Limit (KES)</label>
            <input className={s.formControl} type="number" placeholder="0 for blocked" />
          </div>
        </div>

        <div style={fieldGrid}>
          <div style={{ gridColumn: "span 2" }}>
            <label className={s.formLabel}>Verification Required</label>
            <select className={s.formControl} defaultValue="">
              <option value="">Select verification level...</option>
              <option>None</option>
              <option>KYC Required</option>
              <option>Enhanced KYC</option>
              <option>Enhanced KYC + KRA</option>
              <option>Manual Compliance Review</option>
            </select>
          </div>
        </div>

        <InfoBox variant="info">
          <i className="bi bi-info-circle" /> Transfers to Kenya (your national country) are free and unlimited. International transfers may require enhanced verification.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= M29. Risk Mitigation Modal ================= */
  const riskMitigationModal = (
    <SimpleModal
      show={isOpen("riskMitigationModal")}
      onClose={() => close("riskMitigationModal")}
      iconCls="bi bi-shield-check"
      title="Risk Mitigation Rules"
      submitLabel="Save Rules"
      successTitle="Rules Updated!"
      successMsg="Your risk mitigation rules have been successfully updated."
      successRef="RISK-20250627-7739"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={fieldGrid}>
          <div>
            <label className={s.formLabel}>Threshold (KES)</label>
            <input className={s.formControl} type="number" defaultValue="1000000" />
          </div>
          <div>
            <label className={s.formLabel}>Requirement</label>
            <select className={s.formControl} defaultValue="">
              <option value="">Select requirement...</option>
              <option>KYC Verification</option>
              <option>KRA PIN Verification</option>
              <option>Source of Funds Declaration</option>
              <option>Manual Compliance Review</option>
              <option>Enhanced Due Diligence</option>
            </select>
          </div>
        </div>

        <div style={fieldGrid}>
          <div style={{ gridColumn: "span 2" }}>
            <label className={s.formLabel}>Applies To</label>
            <select className={s.formControl} defaultValue="">
              <option value="">Select scope...</option>
              <option>All transfers</option>
              <option>Business transfers only</option>
              <option>International transfers only</option>
              <option>High-risk countries only</option>
            </select>
          </div>
        </div>

        <Toggle
          checked
          onChange={() => { }}
          label="Auto-hold suspicious transactions"
          description="Transactions requiring review will be held for manual approval"
        />

        <InfoBox variant="warning">
          <i className="bi bi-exclamation-triangle" /> Transactions above KES 1,000,000 automatically trigger KYC verification. Business transfers above KES 1,000,000 also require KRA PIN verification.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= M30. Fee Structure Modal ================= */
  const feeStructureModal = (
    <SimpleModal
      show={isOpen("feeStructureModal")}
      onClose={() => close("feeStructureModal")}
      iconCls="bi bi-cash-coin"
      title="Transaction Fee Structure"
      submitLabel="Close"
      showSubmit={false}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { type: "PayMo to PayMo", fee: "FREE", desc: "Instant transfers between PayMo accounts", highlight: true },
          { type: "PayMo to M-Pesa", fee: "KES 25", desc: "Standard mobile money withdrawal" },
          { type: "PayMo to Airtel Money", fee: "KES 25", desc: "Standard mobile money withdrawal" },
          { type: "PayMo to Bank (Local)", fee: "KES 50", desc: "Instant bank transfer (PesaLink)" },
          { type: "PayMo to Bank (International)", fee: "1.5%", desc: "SWIFT transfer (min KES 500)" },
          { type: "Bill Payment", fee: "KES 10", desc: "Utility and service bill payments" },
          { type: "Card Purchase", fee: "0.5%", desc: "Virtual/physical card transactions" },
        ].map((item) => (
          <div
            key={item.type}
            className={s.summaryRow}
            style={{
              background: item.highlight ? "var(--success-bg)" : "var(--surface-2)",
              padding: "12px 16px",
              borderRadius: 8,
            }}
          >
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 13 }}>{item.type}</strong>
              <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{item.desc}</div>
            </div>
            <span
              style={{
                fontWeight: 700,
                color: item.highlight ? "var(--success)" : "var(--pri)",
                fontSize: 14,
              }}
            >
              {item.fee}
            </span>
          </div>
        ))}

        <InfoBox variant="success">
          <i className="bi bi-check-circle" /> <strong>PayMo to PayMo transfers are FREE</strong> — Send money instantly between PayMo accounts at no cost.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= M31. Account Hierarchy Modal ================= */
  const accountHierarchyModal = (
    <SimpleModal
      show={isOpen("accountHierarchyModal")}
      onClose={() => close("accountHierarchyModal")}
      iconCls="bi bi-diagram-3"
      title="Account Hierarchy & Fund Flow"
      submitLabel="Close"
      showSubmit={false}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--pri)" }}>
            <i className="bi bi-diagram-3"></i> Primary Wallet
          </div>
          <div className={s.summaryRow} style={{ paddingBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--ink-500)" }}>Account</span>
            <strong>PayMo KES Wallet</strong>
          </div>
          <div className={s.summaryRow} style={{ paddingBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--ink-500)" }}>Balance</span>
            <strong style={{ color: "var(--pri)" }}>KES 1,284,300</strong>
          </div>
          <div className={s.summaryRow} style={{ paddingBottom: 0 }}>
            <span style={{ fontSize: 13, color: "var(--ink-500)" }}>Funds Source</span>
            <strong>Independent</strong>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
          <i className="bi bi-arrow-down" style={{ fontSize: 20, color: "var(--ink-400)" }}></i>
        </div>

        <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--info)" }}>
            <i className="bi bi-diagram-2"></i> Sub-Accounts (Auto-draw)
          </div>
          {[
            { name: "Utility Account", balance: "KES 150,000" },
            { name: "Services Account", balance: "KES 85,000" },
          ].map((acc) => (
            <div className={s.summaryRow} key={acc.name} style={{ paddingBottom: 8 }}>
              <span style={{ fontSize: 13, color: "var(--ink-500)" }}>{acc.name}</span>
              <strong style={{ color: "var(--pri)" }}>{acc.balance}</strong>
            </div>
          ))}
        </div>

        <InfoBox variant="info">
          <i className="bi bi-info-circle" /> Sub-accounts automatically draw funds from the primary wallet when needed. Set up utility and services accounts for better expense tracking.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= M32. Transaction Notifications Modal ================= */
  const transactionNotificationsModal = (
    <SimpleModal
      show={isOpen("transactionNotificationsModal")}
      onClose={() => close("transactionNotificationsModal")}
      iconCls="bi bi-bell"
      title="Transaction Notifications"
      submitLabel="Save Preferences"
      successTitle="Notifications Updated!"
      successMsg="Your notification preferences have been successfully saved."
      successRef="NOTF-20250627-7740"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className={s.pills} style={{ marginBottom: 8 }}>
          {["All Transactions", "High-Value", "International", "Failed", "Security"].map((tab, i) => (
            <button
              key={tab}
              className={`${s.pill} ${editTab === i ? s.pillActive : ""}`}
              onClick={() => setEditTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ background: "var(--surface-2)", borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Notification Channels</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "SMS Notifications", icon: "bi-phone" },
              { label: "Email Notifications", icon: "bi-envelope" },
              { label: "WhatsApp Notifications", icon: "bi-whatsapp" },
              { label: "Push Notifications", icon: "bi-bell" },
            ].map((channel) => (
              <Toggle
                key={channel.label}
                checked
                onChange={() => { }}
                label={channel.label}
                description={`Receive ${channel.label.toLowerCase()}`}
                icon={channel.icon}
              />
            ))}
          </div>
        </div>

        <Toggle
          checked
          onChange={() => { }}
          label="Real-time alerts"
          description="Receive instant notifications for all transaction activities"
        />

        <InfoBox variant="info">
          <i className="bi bi-info-circle" /> Configure notifications for all transaction events, security alerts, and limit warnings via SMS, Email, WhatsApp, and Push.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= M33. Create Sub-Account Modal ================= */
  const createSubAccountModal = (
    <SimpleModal
      show={isOpen("createSubAccountModal")}
      onClose={() => close("createSubAccountModal")}
      iconCls="bi bi-plus-circle"
      title="Create Sub-Account"
      submitLabel="Create Account"
      successTitle="Sub-Account Created!"
      successMsg="Your sub-account has been successfully created and linked to the primary wallet."
      successRef="SUBA-20250627-7741"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={fieldGrid}>
          <div style={{ gridColumn: "span 2" }}>
            <label className={s.formLabel}>Account Name</label>
            <input className={s.formControl} placeholder="e.g., Utility Account, Services Account" />
          </div>
          <div>
            <label className={s.formLabel}>Account Type</label>
            <select className={s.formControl} defaultValue="">
              <option value="">Select type...</option>
              <option>Utility Account</option>
              <option>Services Account</option>
              <option>Expense Account</option>
              <option>Savings Account</option>
              <option>Custom</option>
            </select>
          </div>
          <div>
            <label className={s.formLabel}>Parent Account</label>
            <select className={s.formControl} defaultValue="PayMo KES Wallet">
              <option>PayMo KES Wallet</option>
              <option>PayMo USD Account</option>
            </select>
          </div>
        </div>

        <div style={fieldGrid}>
          <div>
            <label className={s.formLabel}>Daily Limit (KES)</label>
            <input className={s.formControl} type="number" defaultValue="200000" />
          </div>
          <div>
            <label className={s.formLabel}>Initial Balance (KES)</label>
            <input className={s.formControl} type="number" defaultValue="0" />
          </div>
        </div>

        <Toggle
          checked
          onChange={() => { }}
          label="Auto-draw from parent account"
          description="Automatically transfer funds from parent when balance is low"
        />

        <InfoBox variant="info">
          <i className="bi bi-info-circle" /> Sub-accounts automatically draw funds from the primary wallet when needed. Perfect for expense tracking and budgeting.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  return (
    <>
      {editProfileModal}
      {profileSavedModal}
      {profileModal}
      {kycModal}
      {docUploadedModal}
      {viewDocModal}
      {attentionModal}
      {cardDetailsModal}
      {linkedAccountsModal}
      {activityDetailModal}
      {receiptModal}
      {changePasswordModal}
      {sessionModal}
      {terminateAllSessionsModal}
      {enable2FAModal}
      {downloadDataModal}
      {privacyModal}
      {transactionLimitsModal}
      {businessLimitsModal}
      {linkBusinessModal}
      {externalAccountsModal}
      {autoPayoutsModal}
      {securityLimitsModal}
      {countryRestrictionsModal}
      {riskMitigationModal}
      {feeStructureModal}
      {accountHierarchyModal}
      {transactionNotificationsModal}
      {createSubAccountModal}
    </>
  );
}
