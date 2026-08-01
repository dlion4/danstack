'use client';

import shared from '../../shared/styles/appPage.module.css';
import { SimpleModal } from '../../shared/components/modals.tsx';

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

  /* ---- 1. Edit Profile Modal ---- */
  const editProfileModal = (
    <SimpleModal
      show={isOpen('editProfileModal')}
      title="Edit Profile"
      icon="bi-person"
      isLarge
      onClose={() => closeModal('editProfileModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('editProfileModal')}>
            Cancel
          </button>
          <button className={s.buttonPrimary}>Save Changes</button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Row 1 */}
        <div>
          <label className={s.formLabel}>Full Legal Name</label>
          <input className={s.formControl} defaultValue="Amina Grace Kamau" />
        </div>
        <div>
          <label className={s.formLabel}>Preferred Name</label>
          <input className={s.formControl} defaultValue="Amina K." />
        </div>
        {/* Row 2 */}
        <div>
          <label className={s.formLabel}>Date of Birth</label>
          <input type="date" className={s.formControl} defaultValue="1992-03-14" />
        </div>
        <div>
          <label className={s.formLabel}>Gender</label>
          <select className={s.formControl} defaultValue="Female">
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        {/* Row 3 */}
        <div>
          <label className={s.formLabel}>Primary Phone</label>
          <input className={s.formControl} defaultValue="+254 712 345 890" />
        </div>
        <div>
          <label className={s.formLabel}>Secondary Phone</label>
          <input className={s.formControl} placeholder="Add secondary phone" />
        </div>
        {/* Row 4 */}
        <div>
          <label className={s.formLabel}>Primary Email</label>
          <input className={s.formControl} defaultValue="amina.kamau@personal.co.ke" />
        </div>
        <div>
          <label className={s.formLabel}>Work Email</label>
          <input className={s.formControl} defaultValue="amina@company.co.ke" />
        </div>
        {/* Row 5 - full width */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label className={s.formLabel}>Residential Address</label>
          <textarea
            className={s.formControl}
            rows={2}
            defaultValue="Apt 3A, Lavington Green, Nairobi, Kenya"
          />
        </div>
      </div>
    </SimpleModal>
  );

  /* ---- 2. Full Profile View Modal ---- */
  const profileModal = (
    <SimpleModal
      show={isOpen('profileModal')}
      title="Full Profile View"
      icon="bi-person-circle"
      onClose={() => closeModal('profileModal')}
      footer={
        <>
          <button className={s.button} onClick={() => closeModal('profileModal')}>
            Close
          </button>
          <button className={s.buttonPrimary} onClick={() => openModal('editProfileModal')}>
            Edit Profile
          </button>
        </>
      }
    >
      {/* Centered avatar section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669, #34d399)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '24px',
            fontWeight: 700,
          }}
        >
          AK
        </div>
        <div style={{ fontWeight: 700, fontSize: '16px' }}>Amina Grace Kamau</div>
        <div style={{ color: 'var(--ink-400, #9ca3af)', fontSize: '13px' }}>
          Premium Member since Jan 2023
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'var(--surface-2, #faf7f3)',
          }}
        >
          <div style={{ color: 'var(--ink-400, #9ca3af)', fontSize: '12px', marginBottom: '4px' }}>
            Email
          </div>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>amina.kamau@personal.co.ke</div>
        </div>
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'var(--surface-2, #faf7f3)',
          }}
        >
          <div style={{ color: 'var(--ink-400, #9ca3af)', fontSize: '12px', marginBottom: '4px' }}>
            Phone
          </div>
          <div style={{ fontWeight: 700, fontSize: '14px' }}>+254 712 345 890</div>
        </div>
      </div>
    </SimpleModal>
  );

  return (
    <>
      {editProfileModal}
      {profileModal}
    </>
  );
}
