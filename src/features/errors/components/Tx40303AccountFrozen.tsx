import { ErrorCard } from './ErrorCard';

export function Tx40303AccountFrozen() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-403-03"
				icon="lock-fill"
				badgeText="Account • Frozen • Restricted"
				title="Account Frozen — Source Account Restricted"
				subtitle="Source account frozen — business account suspended due to fraud lock. Can't send until unlock."
				reasonTitle="Why blocked?"
				reasonText="Source KES Float account frozen because business account restricted — fraud trigger 87/100. Unlock via verify activity."
				boxes={[
					{ label: 'Account', value: 'KES Float • M-Pesa' },
					{ label: 'Status', value: 'Frozen — restricted' },
					{ label: 'Reason', value: 'Fraud Prevention Trigger' },
					{ label: 'Unlock', value: 'Verify activity' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After send • After 2-4s fail', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Verify Activity to Unlock', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Contact Fraud Team', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Account Frozen — Source Account Restricted"
				modalSubtitle="Error — after send failed"
				modalTrace="tx-403-03_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
