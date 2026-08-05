import { ErrorCard } from './ErrorCard';

export function Util40402InternetInvalid() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="UTIL-404-02"
				icon="router"
				badgeText="Internet • Account Invalid • ISP Down"
				title="Internet Account Number Invalid / ISP Down"
				subtitle="Zuku account 98765 not found or ISP API down — cannot vend internet."
				reasonTitle="Why blocked?"
				reasonText="Zuku API account 98765 returned 404 ACCOUNT_NOT_FOUND — maybe typo or account closed. ISP also down 503 possible."
				boxes={[
					{ label: 'Account', value: '98765 • Zuku' },
					{ label: 'Provider', value: 'Zuku Fiber' },
					{ label: 'Response', value: '404 — not found' },
					{ label: 'Alt', value: 'Try Safaricom Home' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Check Account No', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'Try Different ISP', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Internet Account Number Invalid / ISP Down"
				modalSubtitle="Error — after fail"
				modalTrace="util-404-02_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
