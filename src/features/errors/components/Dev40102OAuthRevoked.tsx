import { ErrorCard } from './ErrorCard';

export function Dev40102OAuthRevoked() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-401-02"
				icon="person-x"
				badgeText="OAuth • Revoked • Re-consent"
				title="OAuth Consent Revoked by User"
				subtitle="User revoked Business OAuth consent — re-consent required to continue syncing KCB data."
				reasonTitle="Heads up — warning before action"
				reasonText="User jane@company.co revoked OAuth consent for KCB account ••1234 on 2026-08-05 11:00 — app can no longer fetch data."
				boxes={[
					{ label: 'User', value: 'jane@company.co' },
					{ label: 'Bank', value: 'KCB ••1234' },
					{ label: 'Revoked', value: '2026-08-05 11:00' },
					{ label: 'Action', value: 'Request re-consent' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Request Re-consent', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View OAuth Logs', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="OAuth Consent Revoked by User"
				modalSubtitle="Warning — before send"
				modalTrace="dev-401-02_xxx_KE"
				theme="amber"
				permissionBox={{
					checkbox: true,
					text: 'I confirm — details correct, want to proceed',
					subtext: 'No funds moved until Confirm. Cancel safe.',
				}}
			/>
		</div>
	);
}
