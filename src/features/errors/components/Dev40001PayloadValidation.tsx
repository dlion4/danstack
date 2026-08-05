import { ErrorCard } from './ErrorCard';

export function Dev40001PayloadValidation() {
	return (
		<div
			className="min-h-screen flex flex-col font-['Inter']"
			style={{
				background:
					'radial-gradient(900px 500px at 10% 0%, #FEE2E2, transparent 60%), radial-gradient(700px 400px at 90% 5%, #D1FAE5, transparent 55%), #FFFCF5',
			}}
		>
			<ErrorCard
				errorCode="DEV-400-01"
				icon="braces"
				badgeText="Dev • 400 • Validation"
				title="Payload Validation Failed — Schema Error"
				subtitle="JSON payload failed schema validation — routing_number required for KES. Shows field errors."
				reasonTitle="Why blocked?"
				reasonText="Missing routing_number for KES bank transfer — required field. Also amount must >0."
				boxes={[
					{ label: 'Field', value: 'routing_number • missing' },
					{ label: 'Field 2', value: 'amount must >0' },
					{ label: 'Trace', value: 'api_9921_x88' },
					{ label: 'Example', value: 'See API docs' },
				]}
				statusBadges={[
					{ text: 'Zero-liability • Safe', icon: 'shield-check', variant: 'safe' },
					{ text: 'After 2-4s • Failed', icon: 'clock-history', variant: 'timing' },
				]}
				actions={[
					{ label: 'Fix Payload', icon: 'lightning-charge', variant: 'colored' },
					{ label: 'View API Docs', icon: 'arrow-up-right', variant: 'emerald' },
					{ label: 'Go to Dashboard', icon: 'grid', variant: 'ghost', href: '/dev-dashboard' },
					{ label: 'Home', icon: 'house', variant: 'ghost', href: '/' },
				]}
				modalTitle="Payload Validation Failed — Schema Error"
				modalSubtitle="Error — after fail"
				modalTrace="dev-400-01_xxx_KE"
				theme="red"
			/>
		</div>
	);
}
