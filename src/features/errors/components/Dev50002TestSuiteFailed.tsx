import { ErrorCard } from './ErrorCard';

export function Dev50002TestSuiteFailed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-500-02"
				icon="bug"
				badgeText="Sandbox • Tests Failed • Fix"
				title="Integration Test Suite Failed"
				subtitle="Sandbox test suite failed 3/10 tests — transfer, refund, webhook failing."
				reasonTitle="Why blocked?"
				reasonText="Tests: transfer success PASS, transfer invalid FAIL, refund FAIL, webhook delivery FAIL — check sandbox logs."
				boxes={[
					{ label: 'Suite', value: 'Integration v6.2' },
					{ label: 'Passed', value: '3/10' },
					{ label: 'Failed', value: '7 — see logs' },
					{ label: 'Env', value: 'Sandbox' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'View Test Logs', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Fix & Re-run Suite', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Integration Test Suite Failed"
				modalSubtitle="Error — after fail"
				modalTrace="dev-500-02_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
