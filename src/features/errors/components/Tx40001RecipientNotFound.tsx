import { ErrorCard } from './ErrorCard';

export function Tx40001RecipientNotFound() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-400-01"
				icon="person-x"
				badgeText="Transfer • Recipient Not Found • 404"
				title="Cannot Fetch End Recipient — Account Not Found"
				subtitle="Name check fails — account doesn't exist at destination bank. KES 45k transfer blocked after 3s."
				reasonTitle="Why blocked?"
				reasonText="PesaLink name lookup returned 404 — account 1234567890 not found at KCB. Possibly closed or typo."
				boxes={[
					{ label: 'Account', value: '•••• 7890 • KCB' },
					{ label: 'Name Lookup', value: '404 — not found' },
					{ label: 'Amount', value: 'KES 45,000' },
					{ label: 'Rail', value: 'PesaLink — 3.4s' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After send • After 2-4s fail', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Check Account Number', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Try Different Bank', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Cannot Fetch End Recipient — Account Not Found"
				modalSubtitle="Error — after send failed"
				modalTrace="tx-400-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
