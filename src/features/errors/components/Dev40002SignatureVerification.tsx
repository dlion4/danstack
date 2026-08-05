import { ErrorCard } from './ErrorCard';

export function Dev40002SignatureVerification() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-400-02"
				icon="shield-exclamation"
				badgeText="Webhooks • Signature • HMAC Mismatch"
				title="Webhook Signature Verification Failed"
				subtitle="HMAC signature mismatch — check webhook secret. Your verification failed."
				reasonTitle="Heads up — warning before action"
				reasonText="Expected signature HMAC SHA256 abc... vs received def... — mismatch. Likely secret typo or payload modified."
				boxes={[
					{ label: 'Expected', value: 'abc123... HMAC' },
					{ label: 'Received', value: 'def456... HMAC' },
					{ label: 'Secret', value: 'whsec_•••1234' },
					{ label: 'Action', value: 'Check secret' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Check Webhook Secret', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Signing Docs', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Webhook Signature Verification Failed"
				modalSubtitle="Warning — before send"
				modalTrace="dev-400-02_xxx_KE"
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
