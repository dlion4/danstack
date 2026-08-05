import { ErrorCard } from './ErrorCard';

export function Dev40302IpWhitelistViolation() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-403-02"
				icon="geo-alt"
				badgeText="Security • IP Not Whitelisted • Blocked"
				title="IP Whitelist Violation"
				subtitle="API call from IP 102.219.xxx not in whitelist — blocked per security policy."
				reasonTitle="Why blocked?"
				reasonText="Your IP whitelist has 192.168.1.0/24, but call from 102.219.xxx — not allowed. Add IP or disable whitelist."
				boxes={[
					{ label: 'Your IP', value: '102.219.xxx' },
					{ label: 'Whitelist', value: '192.168.1.0/24' },
					{ label: 'Policy', value: 'IP whitelisting ON' },
					{ label: 'Action', value: 'Add IP' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Add IP to Whitelist', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Disable Whitelist', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="IP Whitelist Violation"
				modalSubtitle="Error — after fail"
				modalTrace="dev-403-02_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
