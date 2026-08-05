import { ErrorCard } from './ErrorCard';

export function Dev40004SdkOutdated() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-400-04"
				icon="box-seam"
				badgeText="Dev • SDK Outdated • v1→v2"
				title="SDK Version Outdated — Needs Update"
				subtitle="SDK v1.2 outdated — breaking changes in v2.0. Update SDK before prod calls."
				reasonTitle="Heads up — warning before action"
				reasonText="Your SDK paymo-node v1.2 — latest v2.3. v1.2 uses /v1 endpoints sunset. Update to v2.3 for /v2 + new auth."
				boxes={[
					{ label: 'Your SDK', value: 'v1.2 • paymo-node' },
					{ label: 'Latest', value: 'v2.3 • breaking' },
					{ label: 'Sunset', value: 'v1 on 2026-05-10' },
					{ label: 'Action', value: 'npm i paymo-node@latest' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Update SDK Guide', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Changelog v1→v2', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="SDK Version Outdated — Needs Update"
				modalSubtitle="Warning — before send"
				modalTrace="dev-400-04_xxx_KE"
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
