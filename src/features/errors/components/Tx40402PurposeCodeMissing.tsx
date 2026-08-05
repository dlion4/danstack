import { ErrorCard } from './ErrorCard';

export function Tx40402PurposeCodeMissing() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-404-02"
				icon="card-list"
				badgeText="Transfer • Purpose Code • CBK"
				title="Purpose Code Required / Missing"
				subtitle="Salary transfer requires purpose code for CBK reporting — missing. Add purpose before send."
				reasonTitle="Heads up — warning before send"
				reasonText="CBK requires purpose code for salary, loan, dividend etc. You selected Other but amount >500k — needs specific code."
				boxes={[
					{ label: 'Amount', value: 'KES 800k' },
					{ label: 'Purpose Now', value: 'Other' },
					{ label: 'Required', value: 'Salary / Wages etc' },
					{ label: 'Regulation', value: 'CBK FX Reporting' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before send • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Select Purpose Code', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Code List', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Purpose Code Required / Missing"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-404-02_xxx_KE"
				theme="amber"
				permissionBox={{
					checkbox: true,
					text: 'I confirm — recipient & amount correct, I want to proceed',
					subtext: 'No funds moved until Confirm. Reversible 30 min. You can cancel now.',
				}}
			/>
		</div>
	);
}
