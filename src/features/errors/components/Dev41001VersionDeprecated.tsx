import { ErrorCard } from './ErrorCard';

export function Dev41001VersionDeprecated() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-410-01"
				icon="trash3"
				badgeText="Dev • 410 Gone • Sunset"
				title="API Version Deprecated — Sunset"
				subtitle="v1 endpoint /v1/legacy/cards sunset May 10 2026 — use /v2/virtual-cards migration guide."
				reasonTitle="Why blocked?"
				reasonText="Endpoint /v1/legacy/cards sunset 2026-05-10, removed permanently — 410 Gone. Use /v2."
				boxes={[
					{ label: 'Old', value: '/v1/legacy/cards' },
					{ label: 'New', value: '/v2/virtual-cards' },
					{ label: 'Sunset', value: '2026-05-10' },
					{ label: 'Action', value: 'Migrate' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'View Migration Guide', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Try /v2', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="API Version Deprecated — Sunset"
				modalSubtitle="Error — after fail"
				modalTrace="dev-410-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
