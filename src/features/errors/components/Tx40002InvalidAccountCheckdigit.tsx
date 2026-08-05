import { ErrorCard } from './ErrorCard';

export function Tx40002InvalidAccountCheckdigit() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="TX-400-02"
				icon="123"
				badgeText="Transfer • Invalid Account • Schema"
				title="Invalid Account Number — Check Digit Fail"
				subtitle="Wrong length or check digit for KCB/Equity. Fix account format before send — warning before action."
				reasonTitle="Heads up — warning before send"
				reasonText="KCB accounts must be 14 digits, you entered 10. Check digit algorithm failed. Example valid: 12345678901234."
				boxes={[
					{ label: 'Entered', value: '1234567890 — 10 digits' },
					{ label: 'Expected', value: '14 digits — KCB' },
					{ label: 'Check Digit', value: 'Fail — mod11' },
					{ label: 'Example', value: '12345678901234' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before send • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Fix Account Number', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View Bank Formats', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/business-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Invalid Account Number — Check Digit Fail"
				modalSubtitle="Warning — confirm before send"
				modalTrace="tx-400-02_xxx_KE"
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
