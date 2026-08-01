'use client';

import { useState } from 'react';
import styles from '../styles/walletActivation.module.css';

/* ------------------------------------------------------------------ */
/*  FAQ data                                                           */
/* ------------------------------------------------------------------ */

const FAQS = [
	{
		q: 'How do I link an account from another dashboard?',
		a: 'Open the "Link Account" modal under Section 20.3, choose the account you want (primary wallet, virtual account, or any account from a previously activated dashboard), pick a permission level, confirm your PIN, and the live flow chart will draw a new money path to it.',
	},
	{
		q: 'What does a linked account actually let me do?',
		a: 'Once linked, money in the Primary PayMo Wallet can be used inside the linked dashboard — pay bills from Utilities, fund your Business Float, or top up Savings. The permission level decides whether funds can flow both ways, one-way in, or remain view-only.',
	},
	{
		q: 'What happens when I unlink or revoke an account?',
		a: 'The money path on the flow chart breaks. If the account still holds a balance, the Money Relocation Wizard (Section 20.4) runs first so no funds are stranded — you choose a destination, verify with your PIN, and funds are moved safely.',
	},
	{
		q: 'Can I get notifications for linked accounts?',
		a: 'Yes. Section 20.3.4 and the "Alerts" button let you toggle notifications per linked account — when money is received, when a balance drops below a threshold, and which channel (Push, SMS, Email, WhatsApp) to use.',
	},
	{
		q: 'Is every dashboard activated the same way?',
		a: 'Each dashboard asks you to accept its specific Terms, Policies and AML declarations (7+ items), then confirm your PIN. After activation you land on a success screen where you can start a guided tour or link accounts.',
	},
];

const VIDEOS = [
	{ icon: 'bi bi-play-circle', title: 'How inter-dashboard transfers work', dur: '2:34' },
	{ icon: 'bi bi-link-45deg', title: 'Linking & permission levels explained', dur: '1:58' },
	{ icon: 'bi bi-shield-exclamation', title: 'What happens when you revoke access', dur: '2:12' },
];

/* ------------------------------------------------------------------ */
/*  HowItWorks — video + FAQ panel (right half of the top banner)      */
/* ------------------------------------------------------------------ */

interface HowItWorksProps {
	openModal: (id: string) => void;
}

export default function HowItWorks({ openModal }: HowItWorksProps) {
	const [tab, setTab] = useState<'video' | 'faq'>('video');
	const [openFaq, setOpenFaq] = useState<number | null>(0);

	return (
		<div className={styles.howItWorks}>
			<div className={styles.howItWorksHead}>
				<h3 className={styles.howItWorksTitle}>
					<i className="bi bi-question-circle" style={{ color: 'var(--pri)' }}></i>
					How It Works
				</h3>
				<div className={styles.howItWorksTabs}>
					<button
						className={`${styles.howItWorksTab} ${tab === 'video' ? styles.howItWorksTabActive : ''}`}
						onClick={() => setTab('video')}
					>
						<i className="bi bi-play-circle"></i> Watch
					</button>
					<button
						className={`${styles.howItWorksTab} ${tab === 'faq' ? styles.howItWorksTabActive : ''}`}
						onClick={() => setTab('faq')}
					>
						<i className="bi bi-question-lg"></i> FAQ
					</button>
				</div>
			</div>

			<div className={styles.howItWorksPanel}>
				{tab === 'video' ? (
					<>
						<div className={styles.videoBox} onClick={() => openModal('supportHelpModal')}>
							<div className={styles.videoThumb}>
								<button className={styles.videoPlay} onClick={() => openModal('tourGuideModal')}>
									<i className="bi bi-play-fill"></i>
								</button>
								<div className={styles.videoTitle}>Wallet Activation in 2 minutes</div>
								<div className={styles.videoSub}>
									Watch how to activate, link and move money across dashboards
								</div>
							</div>
						</div>
						<div className={styles.videoList}>
							{VIDEOS.map((v) => (
								<div
									className={styles.videoListItem}
									key={v.title}
									onClick={() => openModal('tourGuideModal')}
								>
									<span className={styles.videoListIcon}>
										<i className={v.icon}></i>
									</span>
									<span>{v.title}</span>
									<span className={styles.videoListDur}>{v.dur}</span>
								</div>
							))}
						</div>
					</>
				) : (
					<div className={styles.faqList}>
						{FAQS.map((f, i) => (
							<div className={styles.faqItem} key={f.q}>
								<button
									className={`${styles.faqQ} ${openFaq === i ? styles.faqQOpen : ''}`}
									onClick={() => setOpenFaq(openFaq === i ? null : i)}
								>
									<span>{f.q}</span>
									<i className={`bi bi-chevron-down ${styles.faqQIcon}`}></i>
								</button>
								{openFaq === i && <div className={styles.faqA}>{f.a}</div>}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
