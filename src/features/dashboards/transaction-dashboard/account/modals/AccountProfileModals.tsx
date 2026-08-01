/* ============================================================================
 * account/modals/AccountProfileModals.tsx
 * ----------------------------------------------------------------------------
 * All modals for the Account Profile & Digital Bank page. Refactored from the
 * legacy 1.18.html modal blocks — every modal is state-driven through the
 * shared modal primitives (no Bootstrap-JS, no innerHTML). Includes the
 * original account modals plus new digital-banking modals.
 * ========================================================================== */
"use client";

import { ReactNode, useState } from "react";
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

  /* ================= M8. Open / Link Digital Bank Account ================= */
  const bankAccountModal = (
    <TabbedModal
      show={isOpen("bankAccountModal")}
      onClose={() => close("bankAccountModal")}
      iconCls="bi bi-bank"
      title="Digital Bank Accounts"
      tabs={[
        {
          key: "open",
          label: "Open Account",
          render: () => (
            <div>
              <SelectField
                label="Account Type"
                options={[
                  "PayMo Wallet (KES)",
                  "PayMo USD Account",
                  "PayMo Business Account",
                  "PayMo Savings Account",
                ]}
              />
              <SelectField
                label="Purpose"
                options={["Personal use", "Business / merchant", "Savings", "Cross-border"]}
              />
              <div className="mb-3">
                <label className={s.fieldLabel}>Initial Deposit (KES)</label>
                <input className={s.field} defaultValue="1,000" />
              </div>
              <InfoBox variant="info">
                <i className="bi bi-info-circle" /> Opening a PayMo account is free. No monthly maintenance
                fees, instant IBAN + account number issued.
              </InfoBox>
            </div>
          ),
        },
        {
          key: "link",
          label: "Link External",
          render: () => (
            <div>
              <SelectField
                label="Institution"
                options={["M-Pesa (Safaricom)", "Equity Bank", "KCB Bank", "Co-operative Bank", "Airtel Money"]}
              />
              <div className="mb-3">
                <label className={s.fieldLabel}>Account / Phone Number</label>
                <input className={s.field} placeholder="e.g. 0712345678 or account number" />
              </div>
              <div className="mb-3">
                <label className={s.fieldLabel}>Account Name</label>
                <input className={s.field} defaultValue="Amina Grace Kamau" />
              </div>
              <InfoBox variant="success">
                <i className="bi bi-shield-check" /> We use bank-grade encrypted connections. You control
                what each account can do.
              </InfoBox>
            </div>
          ),
        },
      ]}
      footer={
        <>
          <button className={s.button} onClick={() => close("bankAccountModal")}>
            Cancel
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => openModal("accountAddedModal")}>
            {accountTab === 0 ? "Open Account" : "Link Account"}
          </button>
        </>
      }
    />
  );

  /* ================= M9. Account added receipt ================= */
  const accountAddedModal = (
    <SimpleModal
      show={isOpen("accountAddedModal")}
      onClose={() => close("accountAddedModal")}
      iconCls="bi bi-check-circle"
      title="Account Created"
      successTitle="Digital account created!"
      successMsg="Your new PayMo USD Account ending 8842 is ready. The account number and routing details have been emailed to you."
      successRef="ACC-20250627-5520"
    />
  );

  /* ================= M10. Virtual Card ================= */
  const virtualCardModal = (
    <SimpleModal
      show={isOpen("virtualCardModal")}
      onClose={() => close("virtualCardModal")}
      iconCls="bi bi-credit-card"
      title="Create Virtual Card"
      footer={
        <>
          <button className={s.button} onClick={() => close("virtualCardModal")}>
            Cancel
          </button>
          <button className={`${s.button} ${s.buttonPrimary}`} onClick={() => openModal("cardCreatedModal")}>
            Generate Card
          </button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SelectField
          label="Funded From"
          options={["PayMo KES Wallet • KES 1,284,300", "PayMo USD Account • USD 2,410"]}
        />
        <div style={fieldGrid}>
          <div>
            <label className={s.formLabel}>Daily Spend Limit</label>
            <select className={s.formControl} defaultValue="KES 100,000">
              <option>KES 20,000</option>
              <option>KES 50,000</option>
              <option>KES 100,000</option>
              <option>KES 500,000</option>
            </select>
          </div>
          <div>
            <label className={s.formLabel}>Expires</label>
            <select className={s.formControl} defaultValue="12 months">
              <option>1 month</option>
              <option>6 months</option>
              <option>12 months</option>
            </select>
          </div>
        </div>
        <InfoBox variant="info">
          <i className="bi bi-lock" /> A virtual card is instantly generated and can be used for online
          purchases. You can freeze it at any time.
        </InfoBox>
      </div>
    </SimpleModal>
  );

  /* ================= M11. Card created receipt ================= */
  const cardCreatedModal = (
    <SimpleModal
      show={isOpen("cardCreatedModal")}
      onClose={() => close("cardCreatedModal")}
      iconCls="bi bi-check-circle"
      title="Card Ready"
      successTitle="Virtual card generated!"
      successMsg="Your virtual card **** 4412 is ready for immediate use. Full card details are available in the Card Details modal."
      successRef="CARD-20250627-7731"
    />
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

  return (
    <>
      {editProfileModal}
      {profileSavedModal}
      {profileModal}
      {kycModal}
      {docUploadedModal}
      {viewDocModal}
      {attentionModal}
      {bankAccountModal}
      {accountAddedModal}
      {virtualCardModal}
      {cardCreatedModal}
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
    </>
  );
}
