import { ErrorCard } from './ErrorCard';

export function Util40401MeterNotFound() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-404-01"
				icon="lightning-charge"
				badgeText="KPLC • Meter Not Found • 404"
				title="Electricity Meter Not Found"
				subtitle="KPLC meter no. 12345678 not in registry — check digits / meter type."
				reasonTitle="Why blocked?"
				reasonText="KPLC API query meter 12345678 returned 404 METER_NOT_FOUND — maybe prepaid vs postpaid mismatch or typo."
				boxes={[
					{ label: 'Meter', value: '12345678 • Prepaid' },
					{ label: 'Provider', value: 'KPLC / Kenya Power' },
					{ label: 'Response', value: '404 — not found' },
					{ label: 'Check', value: 'Prepaid vs Postpaid?' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Check Meter Number', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Try Postpaid Lookup', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Electricity Meter Not Found"
				modalSubtitle="Error — after fail"
				modalTrace="util-404-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
