'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { AccountProfileModals } from '../modals/AccountProfileModals';
import styles from '../styles/accountProfile.module.css';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const profileData = {
	fullName: 'Amina Grace Kamau',
	preferredName: 'Amina K.',
	dob: '14 Mar 1992',
	gender: 'Female',
	nationalId: '*** ****7832',
	memberSince: 'Jan 2023',
	primaryEmail: 'amina.kamau@personal.co.ke',
	workEmail: 'amina@company.co.ke',
	primaryPhone: '+254 712 345 890',
	address: 'Apt 3A, Lavington Green, Nairobi',
	nationality: 'Kenyan',
	idType: 'National ID',
	verification: 'Level 3 - Full',
	preferredLanguage: 'English',
};

const fetchProfileData = async () => {
	await new Promise((resolve) => setTimeout(resolve, 600));
	return profileData;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AccountProfile() {
	const [modalState, setModalState] = useState<Record<string, boolean>>({});

	const openModal = (id: string) => setModalState((prev) => ({ ...prev, [id]: true }));
	const closeModal = (id: string) => setModalState((prev) => ({ ...prev, [id]: false }));

	useQuery({
		queryKey: ['accountProfileData'],
		queryFn: fetchProfileData,
		initialData: profileData,
	});

	return (
		<div className={styles.pageRoot}>
			{/* ==================== PAGE BAR ==================== */}
			<div className={styles.pageBar}>
				<div>
					<div className={styles.breadcrumb}>
						<a href="#">Home</a> / <a href="#">Account</a> / <strong>Profile</strong>
					</div>
					<h1 className={styles.pageTitle}>Account Profile</h1>
					<p className={styles.pageDescription}>
						Your core identity, verification status, membership tier and quick profile snapshot.
					</p>
				</div>
				<div className="d-flex flex-wrap" style={{ gap: 8 }}>
					<button
						className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
						onClick={() => openModal('editProfileModal')}
					>
						<i className="bi bi-pencil-square"></i> Edit Profile
					</button>
					<button
						className={`${styles.button} ${styles.buttonSmall}`}
						onClick={() => openModal('profileModal')}
					>
						<i className="bi bi-eye"></i> View Profile
					</button>
				</div>
			</div>

			{/* ==================== CONTENT GRID ==================== */}
			<div className={styles.contentGrid}>

				{/* ---------- SECTION 18.1: Profile Overview ---------- */}
				<div className={styles.card}>
					<h2 className={styles.sectionTitle}>
						<i className="bi bi-person-circle" style={{ color: 'var(--pri)' }}></i>
						Profile Overview
					</h2>
					<p className={styles.sectionSubtitle}>
						Your core identity, verification status, membership tier and quick profile snapshot.
					</p>
					<hr className={styles.divider} />

					{/* Profile Hero */}
					<div className={styles.profileHero}>
						<div className={styles.profileAvatar}>AK</div>
						<div className={styles.profileInfo}>
							<p className={styles.profileName}>Amina Grace Kamau</p>
							<div className={styles.profileTier}>
								<i className="bi bi-gem"></i> Premium Member
							</div>
							<p className={styles.profileMeta}>
								Account Owner &bull; Joined January 2023 &bull; NBO, Kenya
							</p>
							<div className={styles.profileActions}>
								<button
									className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
									onClick={() => openModal('editProfileModal')}
								>
									<i className="bi bi-pencil-square"></i> Edit Profile
								</button>
								<button
									className={`${styles.button} ${styles.buttonSmall}`}
									onClick={() => openModal('profileModal')}
								>
									<i className="bi bi-eye"></i> View Profile
								</button>
							</div>
						</div>
					</div>

					<hr className={styles.divider} />

					{/* Details Grid */}
					<div className={styles.detailsGrid}>
						{/* Left — Personal Information */}
						<div className={styles.detailBlock}>
							<div className={styles.detailBlockTitle}>Personal Information</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Full Name</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>Amina Grace Kamau</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Preferred Name</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>Amina K.</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Date of Birth</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>14 Mar 1992</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Gender</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>Female</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>National ID</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>*** ****7832</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Member Since</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>Jan 2023</span>
							</div>
						</div>

						{/* Right — Contact Information */}
						<div className={styles.detailBlock}>
							<div className={styles.detailBlockTitle}>Contact Information</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Primary Email</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>amina.kamau@personal.co.ke</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Work Email</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>amina@company.co.ke</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Primary Phone</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>+254 712 345 890</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Secondary Phone</span>
								<span className={`${styles.badge} ${styles.badgeWarning}`}>Not set</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Address</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>Apt 3A, Lavington Green, Nairobi</span>
							</div>
						</div>
					</div>
				</div>

				{/* ---------- SECTION 18.2: Personal & Contact Details ---------- */}
				<div className={styles.card}>
					<h2 className={styles.sectionTitle}>
						<i className="bi bi-person" style={{ color: 'var(--purple)' }}></i>
						Personal &amp; Contact Details
					</h2>
					<p className={styles.sectionSubtitle}>
						Detailed personal and contact information including verification status and communication preferences.
					</p>
					<hr className={styles.divider} />

					<div className={styles.detailsGrid}>
						{/* Left — Identity & Verification */}
						<div className={styles.detailBlock}>
							<div className={styles.detailBlockTitle}>Identity &amp; Verification</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Full Legal Name</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>Amina Grace Kamau</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>DOB</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>14 Mar 1992</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Gender</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>Female</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Nationality</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>Kenyan</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>ID Type</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>National ID</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>ID Number</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>*** ****7832</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Verification</span>
								<span className={`${styles.badge} ${styles.badgeSuccess}`}><i className="bi bi-check-circle"></i> Level 3 - Full</span>
							</div>
						</div>

						{/* Right — Communication */}
						<div className={styles.detailBlock}>
							<div className={styles.detailBlockTitle}>Communication</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Primary Email</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>amina.kamau@personal.co.ke</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Work Email</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>amina@company.co.ke</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Primary Phone</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>+254 712 345 890</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Secondary Phone</span>
								<span className={`${styles.badge} ${styles.badgeWarning}`}>Not set</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Address</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>Apt 3A, Lavington Green, Nairobi</span>
							</div>
							<div className={styles.summaryRow}>
								<span style={{ fontSize: 14 }}>Preferred Language</span>
								<span style={{ fontSize: 14, fontWeight: 600 }}>English</span>
							</div>
						</div>
					</div>
				</div>

			</div>

			{/* ==================== MODALS ==================== */}
			<AccountProfileModals modalState={modalState} openModal={openModal} closeModal={closeModal} />
		</div>
	);
}
