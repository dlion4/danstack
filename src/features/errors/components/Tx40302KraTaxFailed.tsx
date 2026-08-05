import { ErrorCard } from './ErrorCard';

export function Tx40302KraTaxFailed() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-403-02"
				icon="receipt-cutoff"
				badgeText="KRA • Tax Check • Blocked"
				title="KRA Tax Compliance Check Failed"
				subtitle="KRA PIN compliance not compliant — cannot disburse dividends per KRA API. Blocked."
				reasonTitle="Why blocked?"
				reasonText="KRA API tax compliance check returned NON_COMPLIANT — outstanding PAYE KES 89k. Can't disburse dividends until compliant."
				boxes={[
					{ label: 'PIN', value: 'P00123456Z' },
					{ label: 'Check', value: 'Tax Compliance • DIVIDEND' },
					{ label: 'Result', value: 'NON_COMPLIANT' },
					{ label: 'Outstanding', value: 'KES 89k PAYE' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After send • After 2-4s fail', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Pay KRA Outstanding', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Upload Compliance Cert', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="KRA Tax Compliance Check Failed"
				modalSubtitle="Error — after send failed"
				modalTrace="tx-403-02_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
