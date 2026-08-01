'use client';

import React from 'react';
import shared from '../../shared/styles/appPage.module.css';
import {
  FlowModal,
  PinRow,
  ReviewRow,
  SelectField,
  SimpleModal,
  TabbedModal,
} from '../../shared/components/modals.tsx';

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

  /* ---- local state ---- */
  const [flowStep, setFlowStep] = React.useState(0);
  const [twoFaTab, setTwoFaTab] = React.useState(0);
  const [kycTab, setKycTab] = React.useState(0);
  const [notifSettings, setNotifSettings] = React.useState({
    security_push: true,
    security_sms: true,
    security_email: true,
    security_whatsapp: true,
    tx_push: true,
    tx_sms: false,
    tx_email: false,
    tx_whatsapp: false,
    marketing_push: false,
    marketing_sms: false,
    marketing_email: false,
    marketing_whatsapp: false,
    doc_push: true,
    doc_sms: true,
    doc_email: true,
    doc_whatsapp: false,
  });
  const [privacyToggles, setPrivacyToggles] = React.useState({
    marketing: false,
    usageData: true,
    thirdParty: false,
    publicProfile: false,
  });
  const [closeReason, setCloseReason] = React.useState('');
  const [settlementConfirm, setSettlementConfirm] = React.useState(false);
  const [securityQuestions, setSecurityQuestions] = React.useState({
    q1: '', a1: '',
    q2: '', a2: '',
    q3: '', a3: '',
  });
  const [dataRange, setDataRange] = React.useState('all');
  const [dataFormat, setDataFormat] = React.useState('json');

  /* helper */
  const toggleNotif = (key: string) => {
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const togglePrivacy = (key: string) => {
    setPrivacyToggles((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const updateSecurityQ = (field: string, value: string) => {
    setSecurityQuestions((prev) => ({ ...prev, [field]: value }));
  };

  /* ---- 1. Change Password Modal ---- */
  const changePasswordModal = (
    <SimpleModal
      show={isOpen('changePasswordModal')}
      title="Change Password"
      icon="bi-key"
      onClose={() => closeModal('changePasswordModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('changePasswordModal')}>
            Cancel
          </button>
          <button className={s.buttonPrimary}>Change Password</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className={s.formLabel}>Current Password</label>
          <input type="password" className={s.formControl} placeholder="Enter current password" />
        </div>
        <div>
          <label className={s.formLabel}>New Password</label>
          <input type="password" className={s.formControl} placeholder="Enter new password" />
        </div>
        <div>
          <label className={s.formLabel}>Confirm New Password</label>
          <input type="password" className={s.formControl} placeholder="Confirm new password" />
        </div>
        <div
          style={{
            background: 'var(--info-bg, #dbeafe)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '13px',
            color: '#1d4ed8',
            lineHeight: '1.5',
          }}
        >
          <strong>Password Requirements:</strong> Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character. Cannot reuse your last 3 passwords.
        </div>
      </div>
    </SimpleModal>
  );

  /* ---- 2. Enable 2FA Modal ---- */
  const enable2FAModal = (
    <SimpleModal
      show={isOpen('enable2FAModal')}
      title="Two-Factor Authentication"
      icon="bi-shield-check"
      onClose={() => closeModal('enable2FAModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('enable2FAModal')}>
            Cancel
          </button>
          <button className={s.buttonPrimary}>Enable 2FA</button>
        </>
      }
    >
      <div>
        {/* Manual tab bar */}
        <div className={s.pills} style={{ marginBottom: '20px' }}>
          {['Authenticator App', 'SMS', 'Biometric'].map((tab, i) => (
            <button
              key={tab}
              className={`${s.pill} ${twoFaTab === i ? s.pillActive : ''}`}
              onClick={() => setTwoFaTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 0: Authenticator App */}
        {twoFaTab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '160px',
                height: '160px',
                border: '2px dashed var(--border, #e5e2dc)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafaf8',
              }}
            >
              <i className="bi bi-qr-code" style={{ fontSize: '48px', color: 'var(--ink-300, #d1d5db)' }} />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-700, #4b5563)', margin: 0, textAlign: 'center' }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label className={s.formLabel} style={{ margin: 0, marginBottom: 0 }}>
                Manual Code:
              </label>
              <code
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: 'var(--ink-900, #1a1f2e)',
                  background: 'var(--surface-2, #faf7f3)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                }}
              >
                JBSW Y3DP EHPK 3PXP
              </code>
            </div>
          </div>
        )}

        {/* Tab 1: SMS */}
        {twoFaTab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className={s.formLabel}>Phone Number</label>
              <input
                type="tel"
                className={s.formControl}
                placeholder="+254 7XX XXX XXX"
              />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--ink-500, #9ca3af)', margin: 0 }}>
              A verification code will be sent to this number each time you sign in.
            </p>
          </div>
        )}

        {/* Tab 2: Biometric */}
        {twoFaTab === 2 && (
          <div className={s.switchRow} style={{ padding: '16px 0' }}>
            <div>
              <div className={s.switchLabel}>Enable Biometric Authentication</div>
              <div className={s.switchDescription}>
                Use fingerprint or face recognition to verify your identity on supported devices.
              </div>
            </div>
            <label
              style={{
                position: 'relative',
                display: 'inline-block',
                width: '48px',
                height: '26px',
                flexShrink: 0,
              }}
            >
              <input
                type="checkbox"
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: '#d1d5db',
                  borderRadius: '26px',
                  transition: '0.3s',
                }}
              />
            </label>
          </div>
        )}
      </div>
    </SimpleModal>
  );

  /* ---- 3. Active Sessions Modal ---- */
  const sessionModal = (
    <SimpleModal
      show={isOpen('sessionModal')}
      title="Active Sessions"
      icon="bi-laptop"
      isLarge
      onClose={() => closeModal('sessionModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('sessionModal')}>
            Close
          </button>
          <button className={s.buttonDanger}>Terminate All Other Sessions</button>
        </>
      }
    >
      <table className={s.table}>
        <thead>
          <tr>
            <th>Device</th>
            <th>Location</th>
            <th>Last Active</th>
            <th>IP</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-phone" style={{ fontSize: '16px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>iPhone 15 Pro</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-500, #9ca3af)' }}>Safari · iOS 17</div>
                </div>
              </div>
            </td>
            <td>Nairobi, Kenya</td>
            <td>Now</td>
            <td>196.201.214.xxx</td>
            <td>
              <span className={`${s.badge} ${s.badgeSuccess}`}>Current</span>
            </td>
          </tr>
          <tr>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-laptop" style={{ fontSize: '16px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>MacBook Pro</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-500, #9ca3af)' }}>Chrome · macOS</div>
                </div>
              </div>
            </td>
            <td>Nairobi, Kenya</td>
            <td>2 hours ago</td>
            <td>196.201.214.xxx</td>
            <td>
              <button className={`${s.button} ${s.buttonSmall}`}>Terminate</button>
            </td>
          </tr>
          <tr>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-pc-display" style={{ fontSize: '16px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>Windows PC</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-500, #9ca3af)' }}>Edge · Windows 11</div>
                </div>
              </div>
            </td>
            <td>Mombasa, Kenya</td>
            <td>1 day ago</td>
            <td>41.215.16.xxx</td>
            <td>
              <button className={`${s.button} ${s.buttonSmall}`}>Terminate</button>
            </td>
          </tr>
          <tr>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-tablet" style={{ fontSize: '16px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>iPad Air</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-500, #9ca3af)' }}>Safari · iPadOS 17</div>
                </div>
              </div>
            </td>
            <td>Nairobi, Kenya</td>
            <td>3 days ago</td>
            <td>196.201.214.xxx</td>
            <td>
              <button className={`${s.button} ${s.buttonSmall}`}>Terminate</button>
            </td>
          </tr>
        </tbody>
      </table>
    </SimpleModal>
  );

  /* ---- 4. KYC Document Vault Modal ---- */
  const kycModal = (
    <SimpleModal
      show={isOpen('kycModal')}
      title="KYC Document Vault"
      icon="bi-file-earmark-check"
      isLarge
      onClose={() => closeModal('kycModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('kycModal')}>
            Close
          </button>
          <button className={s.buttonPrimary}>Upload Document</button>
        </>
      }
    >
      <div>
        {/* Manual tab bar */}
        <div className={s.pills} style={{ marginBottom: '20px' }}>
          {['Upload', 'View Documents', 'Status'].map((tab, i) => (
            <button
              key={tab}
              className={`${s.pill} ${kycTab === i ? s.pillActive : ''}`}
              onClick={() => setKycTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 0: Upload */}
        {kycTab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className={s.formLabel}>Document Type</label>
              <select className={s.formControl}>
                <option value="">Select document type</option>
                <option value="national_id">National ID</option>
                <option value="passport">Passport</option>
                <option value="utility_bill">Utility Bill</option>
                <option value="driving_license">Driving License</option>
              </select>
            </div>
            <div>
              <label className={s.formLabel}>Expiry Date</label>
              <input type="date" className={s.formControl} />
            </div>
            <div>
              <label className={s.formLabel}>Upload File</label>
              <div
                style={{
                  border: '2px dashed var(--border, #e5e2dc)',
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'var(--surface-2, #faf7f3)',
                }}
              >
                <i className="bi bi-cloud-arrow-up" style={{ fontSize: '32px', color: 'var(--ink-300, #d1d5db)', display: 'block', marginBottom: '8px' }} />
                <p style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px' }}>Click to upload or drag and drop</p>
                <p style={{ fontSize: '12px', color: 'var(--ink-500, #9ca3af)', margin: 0 }}>PDF, JPG, PNG (max 5MB)</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: View Documents */}
        {kycTab === 1 && (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Document</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bi bi-card-text" style={{ fontSize: '16px' }} />
                    <span style={{ fontWeight: 600 }}>National ID</span>
                  </div>
                </td>
                <td><span className={`${s.badge} ${s.badgeSuccess}`}>Verified</span></td>
                <td>12 Jan 2024</td>
                <td>
                  <button className={`${s.button} ${s.buttonSmall}`}>View</button>
                </td>
              </tr>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bi bi-passport" style={{ fontSize: '16px' }} />
                    <span style={{ fontWeight: 600 }}>Passport</span>
                  </div>
                </td>
                <td><span className={`${s.badge} ${s.badgeSuccess}`}>Verified</span></td>
                <td>05 Mar 2024</td>
                <td>
                  <button className={`${s.button} ${s.buttonSmall}`}>View</button>
                </td>
              </tr>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="bi bi-file-earmark-text" style={{ fontSize: '16px' }} />
                    <span style={{ fontWeight: 600 }}>Utility Bill</span>
                  </div>
                </td>
                <td><span className={`${s.badge} ${s.badgeWarning}`}>Expiring</span></td>
                <td>15 Jun 2023</td>
                <td>
                  <button className={`${s.button} ${s.buttonSmall}`}>Renew</button>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Tab 2: Status */}
        {kycTab === 2 && (
          <div
            style={{
              background: 'var(--success-bg, #d1fae5)',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <i className="bi bi-check-circle-fill" style={{ fontSize: '40px', color: '#047857', display: 'block', marginBottom: '12px' }} />
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#047857', marginBottom: '4px' }}>
              FULLY VERIFIED
            </div>
            <p style={{ fontSize: '13px', color: '#047857', margin: 0, opacity: 0.8 }}>
              All your KYC documents have been verified. Your account is in full compliance.
            </p>
          </div>
        )}
      </div>
    </SimpleModal>
  );

  /* ---- 5. Privacy & Data Controls Modal ---- */
  const privacyModal = (
    <SimpleModal
      show={isOpen('privacyModal')}
      title="Privacy & Data Controls"
      icon="bi-lock"
      isLarge
      onClose={() => closeModal('privacyModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('privacyModal')}>
            Cancel
          </button>
          <button className={s.buttonPrimary}>Save Preferences</button>
        </>
      }
    >
      <div>
        <div className={s.switchRow}>
          <div>
            <div className={s.switchLabel}>Marketing Emails</div>
            <div className={s.switchDescription}>
              Receive promotional offers, product updates, and newsletters.
            </div>
          </div>
          <button
            onClick={() => togglePrivacy('marketing')}
            style={{
              width: '48px', height: '26px', borderRadius: '26px', border: 'none', cursor: 'pointer',
              background: privacyToggles.marketing ? 'var(--pri, #10b981)' : '#d1d5db',
              position: 'relative', transition: '0.3s', flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute', top: '3px',
                left: privacyToggles.marketing ? '25px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            />
          </button>
        </div>

        <div className={s.switchRow}>
          <div>
            <div className={s.switchLabel}>Share Usage Data</div>
            <div className={s.switchDescription}>
              Help us improve by sharing anonymized usage analytics.
            </div>
          </div>
          <button
            onClick={() => togglePrivacy('usageData')}
            style={{
              width: '48px', height: '26px', borderRadius: '26px', border: 'none', cursor: 'pointer',
              background: privacyToggles.usageData ? 'var(--pri, #10b981)' : '#d1d5db',
              position: 'relative', transition: '0.3s', flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute', top: '3px',
                left: privacyToggles.usageData ? '25px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            />
          </button>
        </div>

        <div className={s.switchRow}>
          <div>
            <div className={s.switchLabel}>Third-Party Integrations</div>
            <div className={s.switchDescription}>
              Allow connected apps to access your account data.
            </div>
          </div>
          <button
            onClick={() => togglePrivacy('thirdParty')}
            style={{
              width: '48px', height: '26px', borderRadius: '26px', border: 'none', cursor: 'pointer',
              background: privacyToggles.thirdParty ? 'var(--pri, #10b981)' : '#d1d5db',
              position: 'relative', transition: '0.3s', flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute', top: '3px',
                left: privacyToggles.thirdParty ? '25px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            />
          </button>
        </div>

        <div className={s.switchRow}>
          <div>
            <div className={s.switchLabel}>Public Profile Visibility</div>
            <div className={s.switchDescription}>
              Make your profile visible to other users on the platform.
            </div>
          </div>
          <button
            onClick={() => togglePrivacy('publicProfile')}
            style={{
              width: '48px', height: '26px', borderRadius: '26px', border: 'none', cursor: 'pointer',
              background: privacyToggles.publicProfile ? 'var(--pri, #10b981)' : '#d1d5db',
              position: 'relative', transition: '0.3s', flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute', top: '3px',
                left: privacyToggles.publicProfile ? '25px' : '3px',
                width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            />
          </button>
        </div>
      </div>
    </SimpleModal>
  );

  /* ---- 6. Notification Settings Modal ---- */
  const notifSettingsModal = (
    <SimpleModal
      show={isOpen('notifSettingsModal')}
      title="Advanced Notification Settings"
      icon="bi-sliders"
      isLarge
      onClose={() => closeModal('notifSettingsModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('notifSettingsModal')}>
            Cancel
          </button>
          <button className={s.buttonPrimary}>Save Settings</button>
        </>
      }
    >
      <table className={s.table}>
        <thead>
          <tr>
            <th>Category</th>
            <th style={{ textAlign: 'center' }}>Push</th>
            <th style={{ textAlign: 'center' }}>SMS</th>
            <th style={{ textAlign: 'center' }}>Email</th>
            <th style={{ textAlign: 'center' }}>WhatsApp</th>
          </tr>
        </thead>
        <tbody>
          {/* Security alerts — all checked */}
          <tr>
            <td style={{ fontWeight: 600 }}>Security Alerts</td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.security_push} onChange={() => toggleNotif('security_push')} />
            </td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.security_sms} onChange={() => toggleNotif('security_sms')} />
            </td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.security_email} onChange={() => toggleNotif('security_email')} />
            </td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.security_whatsapp} onChange={() => toggleNotif('security_whatsapp')} />
            </td>
          </tr>
          {/* Transaction alerts — Push only */}
          <tr>
            <td style={{ fontWeight: 600 }}>Transaction Alerts</td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.tx_push} onChange={() => toggleNotif('tx_push')} />
            </td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.tx_sms} onChange={() => toggleNotif('tx_sms')} />
            </td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.tx_email} onChange={() => toggleNotif('tx_email')} />
            </td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.tx_whatsapp} onChange={() => toggleNotif('tx_whatsapp')} />
            </td>
          </tr>
          {/* Marketing — none */}
          <tr>
            <td style={{ fontWeight: 600 }}>Marketing</td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.marketing_push} onChange={() => toggleNotif('marketing_push')} />
            </td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.marketing_sms} onChange={() => toggleNotif('marketing_sms')} />
            </td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.marketing_email} onChange={() => toggleNotif('marketing_email')} />
            </td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.marketing_whatsapp} onChange={() => toggleNotif('marketing_whatsapp')} />
            </td>
          </tr>
          {/* Document expiry — Push+SMS+Email */}
          <tr>
            <td style={{ fontWeight: 600 }}>Document Expiry</td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.doc_push} onChange={() => toggleNotif('doc_push')} />
            </td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.doc_sms} onChange={() => toggleNotif('doc_sms')} />
            </td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.doc_email} onChange={() => toggleNotif('doc_email')} />
            </td>
            <td style={{ textAlign: 'center' }}>
              <input type="checkbox" checked={notifSettings.doc_whatsapp} onChange={() => toggleNotif('doc_whatsapp')} />
            </td>
          </tr>
        </tbody>
      </table>
    </SimpleModal>
  );

  /* ---- 7. Close Account Flow Modal ---- */
  const closeAccountModal = (
    <FlowModal
      show={isOpen('closeAccountModal')}
      steps={['Reason', 'Settlement', 'Done']}
      currentStep={flowStep}
      onClose={() => {
        closeModal('closeAccountModal');
        setFlowStep(0);
        setCloseReason('');
        setSettlementConfirm(false);
      }}
    >
      {/* Step 0: Reason */}
      {flowStep === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className={s.formLabel}>Reason for Closing Account</label>
            <textarea
              className={s.formControl}
              rows={4}
              placeholder="Please tell us why you are closing your account..."
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div
            style={{
              background: 'var(--danger-bg, #fee2e2)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#dc2626',
              lineHeight: '1.5',
            }}
          >
            <strong>
              <i className="bi bi-exclamation-triangle" style={{ marginRight: '6px' }} />
              Warning:
            </strong>{' '}
            Closing your account is permanent and cannot be undone. All remaining funds will need to be
            withdrawn before proceeding. Linked accounts and recurring payments will be disconnected.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              className={s.button}
              onClick={() => {
                closeModal('closeAccountModal');
                setFlowStep(0);
              }}
            >
              Cancel
            </button>
            <button className={s.buttonPrimary} onClick={() => setFlowStep(1)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Settlement */}
      {flowStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className={s.summaryRow}>
            <span style={{ color: 'var(--ink-700, #4b5563)' }}>Account Balance</span>
            <span style={{ fontWeight: 700 }}>KES 0.00</span>
          </div>
          <div className={s.summaryRow}>
            <span style={{ color: 'var(--ink-700, #4b5563)' }}>Pending Transfers</span>
            <span style={{ fontWeight: 700 }}>0</span>
          </div>
          <div className={s.summaryRow}>
            <span style={{ color: 'var(--ink-700, #4b5563)' }}>Linked Accounts</span>
            <span style={{ fontWeight: 700 }}>3</span>
          </div>

          <div
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '12px 0',
            }}
          >
            <input
              type="checkbox"
              checked={settlementConfirm}
              onChange={(e) => setSettlementConfirm(e.target.checked)}
              style={{ marginTop: '3px' }}
              id="settlementConfirm"
            />
            <label htmlFor="settlementConfirm" style={{ fontSize: '13px', color: 'var(--ink-700, #4b5563)', cursor: 'pointer' }}>
              I confirm that I have withdrawn all funds and understand that this action is irreversible.
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button className={s.button} onClick={() => setFlowStep(0)}>
              Back
            </button>
            <button
              className={s.buttonDanger}
              disabled={!settlementConfirm}
              onClick={() => setFlowStep(2)}
              style={{ opacity: settlementConfirm ? 1 : 0.5 }}
            >
              Close Account
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Done / Receipt */}
      {flowStep === 2 && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div
            style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--success-bg, #d1fae5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <i className="bi bi-check-lg" style={{ fontSize: '28px', color: '#047857' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: 'var(--ink-900, #1a1f2e)' }}>
            Account Closure Request Submitted
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--ink-700, #4b5563)', margin: '0 0 24px', lineHeight: '1.6' }}>
            Your account closure request has been received. You will receive a confirmation email
            at your registered address. The process will be completed within 3-5 business days.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <button
              className={s.buttonPrimary}
              onClick={() => {
                closeModal('closeAccountModal');
                setFlowStep(0);
                setCloseReason('');
                setSettlementConfirm(false);
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </FlowModal>
  );

  /* ---- Terminate All Sessions Confirmation Modal ---- */
  const terminateAllSessionsModal = (
    <SimpleModal
      show={isOpen('terminateAllSessionsModal')}
      title="Terminate All Sessions?"
      icon="bi-exclamation-triangle"
      onClose={() => closeModal('terminateAllSessionsModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('terminateAllSessionsModal')}>
            Cancel
          </button>
          <button className={s.buttonDanger}>Terminate All</button>
        </>
      }
    >
      <div
        style={{
          background: 'var(--warning-bg, #fef3c7)',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '13px',
          color: '#92400e',
          lineHeight: '1.6',
        }}
      >
        <strong>
          <i className="bi bi-exclamation-triangle" style={{ marginRight: '6px' }} />
          This action will immediately sign out all other devices.
        </strong>{' '}
        Any unsaved work on other sessions will be lost. You will remain signed in on this device.
      </div>
    </SimpleModal>
  );

  /* ---- Attention Items Modal ---- */
  const attentionModal = (
    <SimpleModal
      show={isOpen('attentionModal')}
      title="All Attention Items"
      icon="bi-exclamation-circle"
      onClose={() => closeModal('attentionModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('attentionModal')}>
            Close
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {/* Row 1: Password expiry */}
        <div className={s.summaryRow}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-key" style={{ fontSize: '14px', color: 'var(--warning, #f59e0b)' }} />
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Password expires in 12 days</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-500, #9ca3af)', marginTop: '2px', marginLeft: '22px' }}>
              Update your password to maintain account security.
            </div>
          </div>
          <button
            className={`${s.button} ${s.buttonSmall}`}
            onClick={() => {
              closeModal('attentionModal');
              openModal('changePasswordModal');
            }}
          >
            Update
          </button>
        </div>

        {/* Row 2: Secondary phone not verified */}
        <div className={s.summaryRow}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-phone" style={{ fontSize: '14px', color: 'var(--warning, #f59e0b)' }} />
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Secondary phone not verified</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-500, #9ca3af)', marginTop: '2px', marginLeft: '22px' }}>
              Verify your secondary phone number for account recovery.
            </div>
          </div>
          <button className={`${s.button} ${s.buttonSmall}`}>
            Verify
          </button>
        </div>

        {/* Row 3: New login from Windows PC */}
        <div className={s.summaryRow}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-laptop" style={{ fontSize: '14px', color: 'var(--danger, #ef4444)' }} />
              <span style={{ fontWeight: 600, fontSize: '14px' }}>New login from Windows PC</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-500, #9ca3af)', marginTop: '2px', marginLeft: '22px' }}>
              A new device signed in from Mombasa, Kenya.
            </div>
          </div>
          <button
            className={`${s.button} ${s.buttonSmall}`}
            onClick={() => {
              closeModal('attentionModal');
              openModal('sessionModal');
            }}
          >
            Review
          </button>
        </div>

        {/* Row 4: Proof of address expiring */}
        <div className={s.summaryRow}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-file-earmark-text" style={{ fontSize: '14px', color: 'var(--warning, #f59e0b)' }} />
              <span style={{ fontWeight: 600, fontSize: '14px' }}>Proof of address expiring</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-500, #9ca3af)', marginTop: '2px', marginLeft: '22px' }}>
              Your utility bill document expires in 5 days.
            </div>
          </div>
          <button
            className={`${s.button} ${s.buttonSmall}`}
            onClick={() => {
              closeModal('attentionModal');
              openModal('kycModal');
            }}
          >
            Renew
          </button>
        </div>
      </div>
    </SimpleModal>
  );

  /* ---- Security Questions Modal ---- */
  const securityQuestionsModal = (
    <SimpleModal
      show={isOpen('securityQuestionsModal')}
      title="Security Questions"
      icon="bi-question-circle"
      onClose={() => closeModal('securityQuestionsModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('securityQuestionsModal')}>
            Cancel
          </button>
          <button className={s.buttonPrimary}>Save Questions</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Question 1 */}
        <div>
          <label className={s.formLabel}>Security Question 1</label>
          <select
            className={s.formControl}
            style={{ marginBottom: '8px' }}
            value={securityQuestions.q1}
            onChange={(e) => updateSecurityQ('q1', e.target.value)}
          >
            <option value="">Select a question</option>
            <option value="pet">What was the name of your first pet?</option>
            <option value="school">What was your primary school name?</option>
            <option value="city">In what city were you born?</option>
            <option value="car">What was your first car?</option>
          </select>
          <label className={s.formLabel}>Your Answer</label>
          <input
            type="text"
            className={s.formControl}
            placeholder="Enter your answer"
            value={securityQuestions.a1}
            onChange={(e) => updateSecurityQ('a1', e.target.value)}
          />
        </div>

        {/* Question 2 */}
        <div>
          <label className={s.formLabel}>Security Question 2</label>
          <select
            className={s.formControl}
            style={{ marginBottom: '8px' }}
            value={securityQuestions.q2}
            onChange={(e) => updateSecurityQ('q2', e.target.value)}
          >
            <option value="">Select a question</option>
            <option value="mother">What is your mother's maiden name?</option>
            <option value="street">What street did you grow up on?</option>
            <option value="food">What is your favorite childhood food?</option>
            <option value="teacher">Who was your favorite teacher?</option>
          </select>
          <label className={s.formLabel}>Your Answer</label>
          <input
            type="text"
            className={s.formControl}
            placeholder="Enter your answer"
            value={securityQuestions.a2}
            onChange={(e) => updateSecurityQ('a2', e.target.value)}
          />
        </div>

        {/* Question 3 */}
        <div>
          <label className={s.formLabel}>Security Question 3</label>
          <select
            className={s.formControl}
            style={{ marginBottom: '8px' }}
            value={securityQuestions.q3}
            onChange={(e) => updateSecurityQ('q3', e.target.value)}
          >
            <option value="">Select a question</option>
            <option value="friend">What is the name of your childhood best friend?</option>
            <option value="movie">What was the first movie you saw in theaters?</option>
            <option value="hobby">What was your first hobby?</option>
            <option value="hospital">In what hospital were you born?</option>
          </select>
          <label className={s.formLabel}>Your Answer</label>
          <input
            type="text"
            className={s.formControl}
            placeholder="Enter your answer"
            value={securityQuestions.a3}
            onChange={(e) => updateSecurityQ('a3', e.target.value)}
          />
        </div>
      </div>
    </SimpleModal>
  );

  /* ---- Linked Accounts Modal ---- */
  const linkedAccountsModal = (
    <SimpleModal
      show={isOpen('linkedAccountsModal')}
      title="Linked Accounts"
      icon="bi bi-link-45deg"
      onClose={() => closeModal('linkedAccountsModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('linkedAccountsModal')}>
            Close
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {/* M-Pesa */}
        <div className={s.summaryRow}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '14px', fontWeight: 700,
                }}
              >
                M
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>M-Pesa</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-500, #9ca3af)' }}>0712 345 890</div>
              </div>
            </div>
          </div>
          <span className={`${s.badge} ${s.badgeSuccess}`}>Linked</span>
        </div>

        {/* Equity Bank */}
        <div className={s.summaryRow}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #FF6F00, #E65100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '14px', fontWeight: 700,
                }}
              >
                E
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Equity Bank</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-500, #9ca3af)' }}>****4521</div>
              </div>
            </div>
          </div>
          <span className={`${s.badge} ${s.badgeSuccess}`}>Linked</span>
        </div>

        {/* KCB Bank */}
        <div className={s.summaryRow}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1565C0, #0D47A1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '14px', fontWeight: 700,
                }}
              >
                K
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>KCB Bank</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-500, #9ca3af)' }}>****7782</div>
              </div>
            </div>
          </div>
          <button className={`${s.button} ${s.buttonSmall} ${s.buttonPrimary}`}>Link</button>
        </div>
      </div>
    </SimpleModal>
  );

  /* ---- Download Data Modal ---- */
  const downloadDataModal = (
    <SimpleModal
      show={isOpen('downloadDataModal')}
      title="Download My Data"
      icon="bi-download"
      onClose={() => closeModal('downloadDataModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('downloadDataModal')}>
            Cancel
          </button>
          <button className={s.buttonPrimary}>Request Export</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className={s.formLabel}>Data Range</label>
          <select
            className={s.formControl}
            value={dataRange}
            onChange={(e) => setDataRange(e.target.value)}
          >
            <option value="all">All data</option>
            <option value="12months">Last 12 months</option>
            <option value="3months">Last 3 months</option>
          </select>
        </div>
        <div>
          <label className={s.formLabel}>Format</label>
          <select
            className={s.formControl}
            value={dataFormat}
            onChange={(e) => setDataFormat(e.target.value)}
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        <div
          style={{
            background: 'var(--info-bg, #dbeafe)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '13px',
            color: '#1d4ed8',
            lineHeight: '1.5',
          }}
        >
          <i className="bi bi-info-circle" style={{ marginRight: '6px' }} />
          Your data export will be prepared and delivered to your registered email within 24 hours.
          You will receive a secure download link.
        </div>
      </div>
    </SimpleModal>
  );

  /* ---- Security Audit Log Modal ---- */
  const securityAuditModal = (
    <SimpleModal
      show={isOpen('securityAuditModal')}
      title="Security Audit Log"
      icon="bi-shield-check"
      isLarge
      onClose={() => closeModal('securityAuditModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('securityAuditModal')}>
            Close
          </button>
        </>
      }
    >
      <table className={s.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Event</th>
            <th>IP</th>
            <th>Device</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ whiteSpace: 'nowrap' }}>15 Jan 2025, 09:42</td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-box-arrow-in-right" style={{ color: 'var(--info, #3b82f6)' }} />
                Login from new device
              </div>
            </td>
            <td>196.201.214.xxx</td>
            <td>iPhone 15 Pro · Safari</td>
          </tr>
          <tr>
            <td style={{ whiteSpace: 'nowrap' }}>14 Jan 2025, 16:20</td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-key" style={{ color: 'var(--warning, #f59e0b)' }} />
                Password changed
              </div>
            </td>
            <td>196.201.214.xxx</td>
            <td>MacBook Pro · Chrome</td>
          </tr>
          <tr>
            <td style={{ whiteSpace: 'nowrap' }}>12 Jan 2025, 11:05</td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-shield-check" style={{ color: 'var(--success, #10b981)' }} />
                2FA enabled
              </div>
            </td>
            <td>196.201.214.xxx</td>
            <td>MacBook Pro · Chrome</td>
          </tr>
          <tr>
            <td style={{ whiteSpace: 'nowrap' }}>10 Jan 2025, 14:33</td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-file-earmark-arrow-up" style={{ color: 'var(--purple, #8b5cf6)' }} />
                KYC document uploaded
              </div>
            </td>
            <td>196.201.214.xxx</td>
            <td>iPhone 15 Pro · Safari</td>
          </tr>
          <tr>
            <td style={{ whiteSpace: 'nowrap' }}>08 Jan 2025, 08:15</td>
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="bi bi-x-circle" style={{ color: 'var(--danger, #ef4444)' }} />
                Session terminated
              </div>
            </td>
            <td>41.215.16.xxx</td>
            <td>Windows PC · Edge</td>
          </tr>
        </tbody>
      </table>
    </SimpleModal>
  );

  return (
    <>
      {changePasswordModal}
      {enable2FAModal}
      {sessionModal}
      {kycModal}
      {privacyModal}
      {notifSettingsModal}
      {closeAccountModal}
      {terminateAllSessionsModal}
      {attentionModal}
      {securityQuestionsModal}
      {linkedAccountsModal}
      {downloadDataModal}
      {securityAuditModal}
    </>
  );
}
