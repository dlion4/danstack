import { ErrorCard } from './ErrorCard';

export function Dev40003SandboxProdMismatch() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FFFBEB, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-400-03"
				icon="sign-stop"
				badgeText="Dev • Sandbox/Prod Mismatch • Warning"
				title="Sandbox vs Production Key Mismatch"
				subtitle="Using prod key sk_live in sandbox — or vice versa. Switch key env before call."
				reasonTitle="Heads up — warning before action"
				reasonText="You are using sandbox URL https://api.sandbox.paymo.co with prod key sk_live_xxx — mismatch. Use sk_test_xxx for sandbox."
				boxes={[
					{ label: 'URL', value: 'sandbox.paymo.co' },
					{ label: 'Key Used', value: 'sk_live_xxx • prod' },
					{ label: 'Expected', value: 'sk_test_xxx • sandbox' },
					{ label: 'Env', value: 'Sandbox' },
				]}
				statusBadges={[
					{ text: 'Can proceed with confirm', icon: 'shield-check', variant: 'confirm' },
					{ text: 'Before action • Warning gate', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Switch to Test Key', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Switch to Prod URL', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Sandbox vs Production Key Mismatch"
				modalSubtitle="Warning — before send"
				modalTrace="dev-400-03_xxx_KE"
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
