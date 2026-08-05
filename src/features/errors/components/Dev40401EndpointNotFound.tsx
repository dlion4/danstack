import { ErrorCard } from './ErrorCard';

export function Dev40401EndpointNotFound() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-404-01"
				icon="compass"
				badgeText="Dev • 404 • Not Found"
				title="Endpoint Not Found"
				subtitle="API path /v9/invalid not found — 404. Check docs for correct endpoint."
				reasonTitle="Why blocked?"
				reasonText="Path /v9/invalid doesn't exist — latest v2. Maybe typo or old version. Check API reference."
				boxes={[
					{ label: 'Path', value: '/v9/invalid' },
					{ label: 'Available', value: '/v2/transfers etc' },
					{ label: 'Version', value: 'v2 latest' },
					{ label: 'Docs', value: 'API Reference' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'View API Docs', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Check Endpoint List', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Endpoint Not Found"
				modalSubtitle="Error — after fail"
				modalTrace="dev-404-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
