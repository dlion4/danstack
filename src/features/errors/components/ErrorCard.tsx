import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';

// Bootstrap icon component
const IconComponent = ({ iconName, size = 20, className = '' }: { iconName: string; size?: number; className?: string }) => {
	return <i className={`bi bi-${iconName} ${className}`} style={{ fontSize: size }}></i>;
};

interface ErrorBox {
	label: string;
	value: string;
}

interface StatusBadge {
	text: string;
	icon: string;
	variant: 'safe' | 'timing' | 'confirm';
}

interface ActionButton {
	label: string;
	icon: string;
	variant: 'emerald' | 'colored' | 'ghost';
	onClick?: () => void;
	href?: string;
}

interface ErrorCardProps {
	errorCode: string;
	icon: string;
	badgeText: string;
	title: string;
	subtitle: string;
	reasonTitle: string;
	reasonText: string;
	boxes: ErrorBox[];
	statusBadges: StatusBadge[];
	actions: ActionButton[];
	modalTitle: string;
	modalSubtitle: string;
	modalTrace: string;
	theme: 'red' | 'amber' | 'blue';
	logoText?: string;
	permissionBox?: {
		checkbox?: boolean;
		text: string;
		subtext: string;
	};
}

const themeColors = {
	red: {
		gradient: 'linear-gradient(135deg, #EF4444, #F87171)',
		bgLight: '#FEF2F2',
		borderLight: '#FECACA',
		textDark: '#B91C1C',
		iconColor: '#EF4444',
		bgGradient1: '#FEE2E2',
		bgGradient2: '#D1FAE5',
		logoShadow: 'rgba(239,68,68,0.28)',
		btnShadow: 'rgba(239,68,68,0.22)',
		pulseColor: 'rgba(239,68,68,0.4)',
	},
	amber: {
		gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
		bgLight: '#FFFBEB',
		borderLight: '#FDE68A',
		textDark: '#92400E',
		iconColor: '#F59E0B',
		bgGradient1: '#FFFBEB',
		bgGradient2: '#D1FAE5',
		logoShadow: 'rgba(245,158,11,0.28)',
		btnShadow: 'rgba(245,158,11,0.22)',
		pulseColor: 'rgba(245,158,11,0.4)',
	},
	blue: {
		gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
		bgLight: '#F0F9FF',
		borderLight: '#BAE6FD',
		textDark: '#0369A1',
		iconColor: '#3B82F6',
		bgGradient1: '#F0F9FF',
		bgGradient2: '#D1FAE5',
		logoShadow: 'rgba(59,130,246,0.28)',
		btnShadow: 'rgba(59,130,246,0.22)',
		pulseColor: 'rgba(59,130,246,0.4)',
	},
};

export function ErrorCard({
	errorCode,
	icon,
	badgeText,
	title,
	subtitle,
	reasonTitle,
	reasonText,
	boxes,
	statusBadges,
	actions,
	modalTitle,
	modalSubtitle,
	modalTrace,
	theme,
	permissionBox,
}: ErrorCardProps) {
	const [showModal, setShowModal] = useState(false);
	const [toasts, setToasts] = useState<{ title: string; message: string; id: number }[]>([]);
	const [confirmed, setConfirmed] = useState(false);

	const colors = themeColors[theme];

	const addToast = (title: string, message: string) => {
		const id = Date.now();
		setToasts((prev) => [...prev, { title, message, id }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 3800);
	};

	const handleAction = (action: ActionButton) => {
		if (action.href) return;
		addToast(action.label, `${errorCode} logged`);
	};

	return (
		<>
			<style>{`
				@keyframes rise {
					from { transform: translateY(16px); opacity: 0; }
					to { transform: translateY(0); opacity: 1; }
				}
				@keyframes pulse {
					70% { box-shadow: 0 0 0 18px ${colors.pulseColor.replace('0.4', '0')}; }
					100% { box-shadow: 0 0 0 0 ${colors.pulseColor.replace('0.4', '0')}; }
				}
				@keyframes shake {
					0%, 85%, 100% { transform: rotate(0); }
					88% { transform: rotate(-8deg); }
					90% { transform: rotate(8deg); }
					92% { transform: rotate(-4deg); }
				}
				@keyframes float {
					0%, 100% { transform: translateY(0); }
					50% { transform: translateY(-8px); }
				}
				@keyframes slide {
					from { transform: translateX(16px); opacity: 0; }
					to { transform: translateX(0); opacity: 1; }
				}
				.error-card { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
				.icon-pulse { animation: pulse 2s infinite; }
				.icon-shake { animation: shake 3s ease-in-out infinite; }
				.icon-float { animation: float 3s ease-in-out infinite; }
				.toast-enter { animation: slide 0.35s ease; }
			`}</style>

			{/* Top Bar */}
			<div className="flex justify-between items-center px-6 py-5 max-w-[1200px] mx-auto">
				<div className="flex items-center gap-2.5 font-extrabold">
					<div
						className="w-9 h-9 rounded-[11px] flex items-center justify-center text-white"
						style={{
							background: colors.gradient,
							boxShadow: `0 6px 16px ${colors.logoShadow}`,
						}}
					>
						<IconComponent iconName={icon} size={20} />
					</div>
					<span>{logoText || `DanStack • Dev • ${theme === 'red' ? 'RED' : theme === 'amber' ? 'AMBER' : 'BLUE'}`}</span>
				</div>
				<div className="flex gap-2">
					<span className="px-2 py-1 rounded-full bg-white border border-[#E8E2D9] text-[10px] font-bold">
						{errorCode}
					</span>
					<button
						className="px-3 py-2 bg-white border border-[#E8E2D9] rounded-xl font-semibold text-[14px] flex items-center gap-2"
						onClick={() => setShowModal(true)}
					>
						<IconComponent iconName="info-circle" size={16} /> Why?
					</button>
				</div>
			</div>

			{/* Main Card */}
			<div className="flex-1 flex items-center justify-center p-4">
				<div
					className="error-card bg-white border border-[#E8E2D9] rounded-[28px] shadow-[0_20px_60px_rgba(26,31,46,0.08)] max-w-[680px] w-full overflow-hidden"
				>
					<div
						className="h-[5px]"
						style={{ background: colors.gradient }}
					></div>

					<div className="px-7 py-[26px] pb-[18px] text-center">
						{/* Icon */}
						<div
							className="icon-pulse relative w-24 h-24 mx-auto mb-3.5 rounded-[28px] flex items-center justify-center text-[44px]"
							style={{
								background: colors.bgLight,
								border: `1px solid ${colors.borderLight}`,
								color: colors.iconColor,
							}}
						>
							<IconComponent iconName={icon} size={48} className={theme === 'red' ? 'icon-shake' : 'icon-float'} />
						</div>

						{/* Badge */}
						<div
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase"
							style={{
								background: colors.bgLight,
								border: `1px solid ${colors.borderLight}`,
								color: colors.textDark,
							}}
						>
							<IconComponent iconName={theme === 'amber' ? 'exclamation-triangle' : 'exclamation-octagon'} size={14} />
							{badgeText}
						</div>

						{/* Title */}
						<h1
							className="text-[22px] font-bold mt-3 mb-2 leading-[1.25]"
							style={{ fontFamily: 'Space Grotesk, sans-serif' }}
						>
							{title}
						</h1>

						{/* Subtitle */}
						<p className="text-[14px] text-[#4B5563] leading-[1.6]">{subtitle}</p>

						{/* Reason Box */}
						<div
							className="mt-4 p-3.5 rounded-[14px] flex gap-2.5 text-left"
							style={{
								background: colors.bgLight,
								border: `1px solid ${colors.borderLight}`,
								borderLeft: `4px solid ${colors.iconColor}`,
							}}
						>
							<div className="text-[20px]" style={{ color: colors.iconColor }}>
								<IconComponent iconName="shield-exclamation" size={20} />
							</div>
							<div>
								<b className="text-[13px]">{reasonTitle}</b>
								<div className="text-[12px] text-[#4B5563] mt-0.5">{reasonText}</div>
							</div>
						</div>

						{/* Grid Boxes */}
						<div className="grid grid-cols-2 gap-2.5 mt-4 text-left">
							{boxes.map((box, index) => (
								<div
									key={index}
									className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-[14px] p-3 py-[12px] px-[14px]"
								>
									<b className="text-[11px] uppercase tracking-[0.06em] block">{box.label}</b>
									<span className="text-[12px] text-[#4B5563]">{box.value}</span>
								</div>
							))}
						</div>

						{/* Permission Box (if present) */}
						{permissionBox && (
							<div className="mt-4 bg-white border border-dashed border-[#E8E2D9] rounded-[14px] p-3 flex gap-2.5 items-start text-left">
								{permissionBox.checkbox && (
									<input
										type="checkbox"
										id="confirmCheck"
										checked={confirmed}
										onChange={(e) => {
											setConfirmed(e.target.checked);
											if (e.target.checked) {
												addToast('Confirmed', 'Proceed');
											}
										}}
									/>
								)}
								<div>
									<b className="text-[13px]">{permissionBox.text}</b>
									<div className="text-[11px] text-[#4B5563] mt-0.5">{permissionBox.subtext}</div>
								</div>
							</div>
						)}

						{/* Status Badges */}
						<div className="flex gap-2 justify-center flex-wrap mt-2">
							{statusBadges.map((badge, index) => (
								<span
									key={index}
									className="px-3 py-1.5 rounded-full text-[11px] font-bold"
									style={{
										background:
											badge.variant === 'safe'
												? '#ECFDF5'
												: badge.variant === 'confirm'
													? '#ECFDF5'
													: 'white',
										border:
											badge.variant === 'safe'
												? '1px solid #A7F3D0'
												: badge.variant === 'confirm'
													? '1px solid #A7F3D0'
													: '1px solid #E8E2D9',
										color: badge.variant === 'safe' || badge.variant === 'confirm' ? '#047857' : '#1A1F2E',
									}}
								>
									<IconComponent iconName={badge.icon} size={12} className="inline mr-1" />
									{badge.text}
								</span>
							))}
						</div>
					</div>

					{/* Actions */}
					<div className="px-7 py-[18px] bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
						{actions.map((action, index) => {
							const buttonBaseClass =
								'rounded-xl py-3 px-[22px] font-bold text-[14px] flex items-center gap-2 transition-transform hover:-translate-y-0.5';
							if (action.href) {
								return (
									<Link
										key={index}
										to={action.href}
										className={`${buttonBaseClass} bg-white border border-[#E8E2D9] text-[#1A1F2E]`}
									>
										<IconComponent iconName={action.icon} size={16} className="inline mr-1" />
										{action.label}
									</Link>
								);
							}

							return (
								<button
									key={index}
									onClick={() => handleAction(action)}
									className={`${buttonBaseClass} ${
										action.variant === 'emerald'
											? 'text-white'
											: action.variant === 'colored'
												? 'text-white'
												: 'bg-white border border-[#E8E2D9] text-[#1A1F2E]'
									}`}
									style={
										action.variant === 'emerald'
											? {
													background: 'linear-gradient(135deg, #10b981, #059669)',
													boxShadow: '0 8px 20px rgba(16,185,129,0.28)',
												}
											: action.variant === 'colored'
												? {
														background: colors.gradient,
														boxShadow: `0 8px 20px ${colors.btnShadow}`,
													}
												: {}
									}
								>
									<IconComponent iconName={action.icon} size={16} className="inline mr-1" />
									{action.label}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* Toast Container */}
			<div className="fixed top-4.5 right-4.5 z-[9999] flex flex-col gap-2">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className="toast-enter bg-white border border-[#E8E2D9] border-l-4 rounded-xl p-3 py-[12px] px-[14px] shadow-[0_20px_60px_rgba(26,31,46,0.08)] min-w-[300px]"
						style={{ borderLeftColor: colors.iconColor }}
					>
						<div className="font-bold text-[13px] flex items-center gap-2">
							<IconComponent iconName="info-circle-fill" size={14} />
							{toast.title}
						</div>
						<div className="text-[12px] text-[#4B5563]">{toast.message}</div>
					</div>
				))}
			</div>

			{/* Modal */}
			{showModal && (
				<div
					className="fixed inset-0 bg-[rgba(15,23,42,0.45)] backdrop-blur-sm grid place-items-center p-4 z-[10000]"
					onClick={() => setShowModal(false)}
				>
					<div
						className="bg-white rounded-[22px] p-[22px] max-w-[480px] w-full"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex justify-between">
							<div className="flex gap-2 items-center">
								<div
									className="w-11 h-11 rounded-xl flex items-center justify-center"
									style={{
										background: colors.bgLight,
										color: colors.iconColor,
									}}
								>
									<IconComponent iconName={icon} size={24} />
								</div>
								<div>
									<b>{modalTitle}</b>
									<div className="text-[11px] text-[#4B5563]">{modalSubtitle}</div>
								</div>
							</div>
							<button
								className="px-2.5 py-1.5 bg-white border border-[#E8E2D9] rounded-xl"
								onClick={() => setShowModal(false)}
							>
								<IconComponent iconName="x-lg" size={18} />
							</button>
						</div>
						<div className="text-[12px] text-[#4B5563] leading-[1.7] mt-2.5">
							Error after send — vault safe, retry safe, trace ID
							<br />
							<br />
							<b>Trace:</b> <code>{modalTrace}</code> • Funds safe • No double charge
						</div>
						<div className="mt-3">
							<button
								className="w-full text-white rounded-xl py-3 px-[22px] font-bold text-[14px]"
								style={{
									background: colors.gradient,
									boxShadow: `0 8px 20px ${theme === 'red' ? 'rgba(239,68,68,0.22)' : theme === 'amber' ? 'rgba(245,158,11,0.22)' : 'rgba(59,130,246,0.22)'}`,
								}}
								onClick={() => setShowModal(false)}
							>
								Got it
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
