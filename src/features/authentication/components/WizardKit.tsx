/* ============================================================================
 * WizardKit.tsx — Paymo BAAS · shared multi-step wizard primitives
 * ----------------------------------------------------------------------------
 * Powers the six verification wizards on /auth/account-status. Every wizard is
 * unique in content, but they all share this shell so the flow, keyboard model
 * and visual language stay identical to the rest of the auth surface.
 * ========================================================================== */

import type { ReactNode } from "react";
import { useState } from "react";
import type { Tone } from "./AuthKit";
import { Badge, Button, cx, Modal, Progress, s, Tile, toast } from "./AuthKit";

/* ==========================================================================
 * APPLICATION MODEL (shared with the tracker)
 * ======================================================================== */
export type AppStatus = "pending" | "review" | "resolved";

export interface TrackStage {
	label: string;
	note: string;
}

export interface Submission {
	taskId: string;
	ref: string;
	title: string;
	icon: string;
	tone: Tone;
	submittedAt: number;
	stages: TrackStage[];
	stage: number;
	status: AppStatus;
	summary: Array<[string, string]>;
	sla: string;
	outcome: string;
}

export interface WizardProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (summary: Array<[string, string]>) => void;
}

/* ==========================================================================
 * STEP MODEL + SHELL
 * ======================================================================== */
export interface WizStep {
	label: string;
	title: string;
	sub: string;
}

export function useWizard(total: number) {
	const [step, setStep] = useState(0);
	return {
		step,
		setStep,
		isLast: step === total - 1,
		back: () => setStep((v) => Math.max(0, v - 1)),
		next: () => setStep((v) => Math.min(total - 1, v + 1)),
		reset: () => setStep(0),
	};
}

export function WizardShell({
	open,
	onClose,
	title,
	sub,
	icon,
	tone = "green",
	steps,
	step,
	setStep,
	canNext,
	onBack,
	onNext,
	submitting,
	submitLabel = "Submit for review",
	children,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	sub: string;
	icon: string;
	tone?: Tone;
	steps: WizStep[];
	step: number;
	setStep: (i: number) => void;
	canNext: boolean;
	onBack: () => void;
	onNext: () => void;
	submitting?: boolean;
	submitLabel?: string;
	children: ReactNode;
}) {
	const isLast = step === steps.length - 1;
	const pct = Math.round(((step + 1) / steps.length) * 100);
	const current = steps[step];

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={title}
			sub={sub}
			icon={icon}
			tone={tone}
			size="lg"
			footer={
				<>
					<span className={cx(s.tiny, s.grow)}>
						Step {step + 1} of {steps.length} · autosaved
					</span>
					<Button
						variant="ghost"
						onClick={step === 0 ? onClose : onBack}
						disabled={submitting}
					>
						{step === 0 ? "Cancel" : "Back"}
					</Button>
					<Button
						onClick={onNext}
						disabled={!canNext || submitting}
						icon={
							submitting
								? "bi-arrow-repeat"
								: isLast
									? "bi-send-check"
									: undefined
						}
					>
						{submitting ? "Submitting…" : isLast ? submitLabel : "Continue"}
					</Button>
				</>
			}
		>
			<div className={s.stack}>
				<div className={s.wizBar}>
					{steps.map((st, i) => (
						<span key={st.label} style={{ display: "inline-flex" }}>
							{i > 0 && <span className={s.wizSep} />}
							<button
								type="button"
								className={cx(
									s.wizNode,
									i === step && s.wizNodeOn,
									i < step && s.wizNodeDone,
								)}
								onClick={() => i < step && setStep(i)}
								disabled={i >= step}
							>
								<span className={s.wizNodeNum}>
									{i < step ? <i className="bi bi-check-lg" /> : i + 1}
								</span>
								{st.label}
							</button>
						</span>
					))}
				</div>

				<Progress value={pct} sm />

				<div>
					<div className={s.wizStepTitle}>{current.title}</div>
					<p className={s.wizStepSub}>{current.sub}</p>
				</div>

				{children}
			</div>
		</Modal>
	);
}

/* ==========================================================================
 * SHARED STEP WIDGETS
 * ======================================================================== */
export function Upload({
	label,
	hint,
	done,
	onDone,
	tone = "slate",
}: {
	label: string;
	hint: string;
	done: boolean;
	onDone: () => void;
	tone?: Tone;
}) {
	const [busy, setBusy] = useState(false);
	return (
		<button
			type="button"
			className={cx(s.drop, busy && s.dropBusy, done && s.dropDone)}
			disabled={busy || done}
			onClick={() => {
				setBusy(true);
				window.setTimeout(() => {
					setBusy(false);
					onDone();
					toast.success("File attached", `${label} · scanned, no issues`);
				}, 850);
			}}
		>
			<Tile
				icon={
					done ? "bi-check-lg" : busy ? "bi-arrow-repeat" : "bi-cloud-arrow-up"
				}
				tone={done ? "green" : busy ? "blue" : tone}
				size="sm"
			/>
			<span className={s.grow}>
				<span className={s.dropTitle}>{label}</span>
				<span className={s.dropSub}>
					{busy
						? "Uploading and scanning…"
						: done
							? "Attached · PDF/JPG · encrypted at rest"
							: hint}
				</span>
			</span>
			{done && <Badge tone="green">Attached</Badge>}
		</button>
	);
}

export function PickRow({
	checked,
	onToggle,
	icon,
	tone = "green",
	title,
	sub,
	right,
}: {
	checked: boolean;
	onToggle: () => void;
	icon: string;
	tone?: Tone;
	title: ReactNode;
	sub?: ReactNode;
	right?: ReactNode;
}) {
	return (
		<button
			type="button"
			className={cx(s.listRow, checked && s.listRowOn)}
			onClick={onToggle}
			style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
		>
			<span className={cx(s.pickBox, checked && s.pickBoxOn)}>
				<i className="bi bi-check-lg" />
			</span>
			<Tile icon={icon} tone={tone} size="sm" />
			<span className={s.grow}>
				<span className={s.optionTitle}>{title}</span>
				{sub && (
					<span className={s.optionSub} style={{ display: "block" }}>
						{sub}
					</span>
				)}
			</span>
			{right}
		</button>
	);
}

export function Choice<T extends string>({
	value,
	options,
	onChange,
}: {
	value: T | "";
	options: Array<{ id: T; label: string }>;
	onChange: (v: T) => void;
}) {
	return (
		<div className={cx(s.row, s.rowTight)}>
			{options.map((o) => (
				<button
					key={o.id}
					type="button"
					className={cx(s.miniBtn, value === o.id && s.miniBtnOn)}
					onClick={() => onChange(o.id)}
				>
					{o.label}
				</button>
			))}
		</div>
	);
}

export function SummaryRows({ rows }: { rows: Array<[string, string]> }) {
	return (
		<div className={s.stack}>
			{rows.map(([k, v]) => (
				<div className={s.spread} key={k}>
					<span className={s.tiny}>{k}</span>
					<span className={s.strong} style={{ textAlign: "right" }}>
						{v}
					</span>
				</div>
			))}
		</div>
	);
}

/** Deterministic-looking reference, e.g. PMO-FA-8Q3D71. */
export function makeRef(prefix: string) {
	const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
	return `PMO-${prefix}-${rand}`;
}
