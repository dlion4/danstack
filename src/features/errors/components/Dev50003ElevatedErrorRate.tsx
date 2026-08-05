import { ErrorCard } from './ErrorCard';

export function Dev50003ElevatedErrorRate() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-500-03"
				icon="graph-up-arrow"
				badgeText="Monitoring • Incident • Error Rate >5%"
				title="Monitoring Incident — Elevated Error Rate"
				subtitle="API error rate 7.2% >5% threshold — incident declared, engineering paged. Check status."
				reasonTitle="Why blocked?"
				reasonText="Your app error rate 7.2% last 15 min — 72 errors / 1000 calls. Mostly 400 validation. Incident INC_8841 opened."
				boxes={[
					{ label: 'Error Rate', value: '7.2% • >5% threshold' },
					{ label: 'Errors', value: '72 / 1000 calls' },
					{ label: 'Top Error', value: '400 validation 65%' },
					{ label: 'Incident', value: 'INC_8841 • P2' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'View Incident Dashboard', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Error Logs', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Monitoring Incident — Elevated Error Rate"
				modalSubtitle="Error — after fail"
				modalTrace="dev-500-03_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
