import { ErrorCard } from './ErrorCard';

export function Dev40101ApiKeyInvalid() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-401-01"
				icon="key"
				badgeText="Dev • API Key Invalid • 401"
				title="API Key Invalid / Expired / Revoked"
				subtitle="API key expired / revoked — Bearer token invalid. Regenerate key."
				reasonTitle="Why blocked?"
				reasonText="API key sk_live_xxx expired 2026-08-01 — revoked or TTL reached. JWT TTL 1h. Regenerate."
				boxes={[
					{ label: 'Key', value: 'sk_live_xxx • ••1234' },
					{ label: 'Status', value: 'Expired 2026-08-01' },
					{ label: 'TTL', value: '1h' },
					{ label: 'Action', value: 'Regenerate' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Regenerate API Key', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View API Keys', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="API Key Invalid / Expired / Revoked"
				modalSubtitle="Error — after fail"
				modalTrace="dev-401-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
