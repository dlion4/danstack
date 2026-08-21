/* ============================================================================
 * ApplicationTracker.tsx — Paymo BAAS · live status of a submitted application
 * ----------------------------------------------------------------------------
 * Every wizard on /auth/account-status produces an application. This dialog is
 * the "where is it now?" view: reference, progress bar, status badge and a
 * stage timeline that advances on its own. Once the decision lands, the footer
 * turns into "Proceed to account", which routes the customer to /auth/hub.
 * ========================================================================== */

import {
	Badge,
	Button,
	cx,
	go,
	Modal,
	Notice,
	Progress,
	s,
	toast,
} from "./AuthKit";
import type { AppStatus, Submission, TrackStage } from "./WizardKit";
import { makeRef, SummaryRows } from "./WizardKit";

/* --------------------------------------------------------------------------
 * Per-task pipelines — each queue reviews a different thing
 * ------------------------------------------------------------------------ */
export const PIPELINES: Record<string, TrackStage[]> = {
	"identity-verification": [
		{ label: "Application received", note: "Documents encrypted and queued." },
		{
			label: "Automated document checks",
			note: "Tamper, expiry and MRZ validation.",
		},
		{
			label: "Face match & liveness",
			note: "Selfie compared to your ID photo.",
		},
		{
			label: "KYC analyst review",
			note: "Manual sign-off by a compliance officer.",
		},
		{ label: "Decision issued", note: "Identity verified — limits restored." },
	],
	"bank-verification": [
		{ label: "Ownership request filed", note: "Sent to 2 banks and 1 wallet." },
		{
			label: "Institution confirmation",
			note: "Waiting on the account holders' banks.",
		},
		{
			label: "Name & sanctions screening",
			note: "Account names matched to your profile.",
		},
		{ label: "Mandate activation", note: "Debit mandate registered." },
		{ label: "Accounts linked", note: "Payouts and transfers re-enabled." },
	],
	"business-verification": [
		{ label: "KYB pack received", note: "4 documents indexed." },
		{
			label: "Registry lookup",
			note: "Entity confirmed with the company registry.",
		},
		{
			label: "Director & UBO screening",
			note: "PEP, sanctions and adverse media.",
		},
		{ label: "Risk tiering", note: "Limits and monitoring thresholds set." },
		{ label: "KYB approved", note: "Higher limits unlocked." },
	],
	"transaction-review": [
		{
			label: "Review submitted",
			note: "4 transactions re-queued for scoring.",
		},
		{
			label: "Transaction re-scoring",
			note: "Models re-run with your context.",
		},
		{ label: "Counterparty checks", note: "Receiving institutions contacted." },
		{ label: "Holds released", note: "Funds returned to available balance." },
		{ label: "Case closed", note: "No further action required." },
	],
	"fraud-appeal": [
		{ label: "Appeal received", note: "Reference issued to compliance." },
		{ label: "Compliance triage", note: "Analyst assigned within 4 hours." },
		{
			label: "Evidence assessment",
			note: "Documents cross-checked with settlement data.",
		},
		{
			label: "Risk re-scoring",
			note: "Velocity model re-run with your evidence.",
		},
		{
			label: "Decision · flag lifted",
			note: "Restrictions removed from the account.",
		},
	],
	"dispute-resolution": [
		{ label: "Response filed", note: "Evidence bundle sent to the issuer." },
		{ label: "Issuer acknowledgement", note: "Issuer confirmed receipt." },
		{ label: "Scheme review", note: "Card scheme weighs the evidence." },
		{
			label: "Pre-arbitration window",
			note: "Last chance for either side to settle.",
		},
		{ label: "Dispute closed", note: "Decision recorded on the case." },
	],
};

const SLA: Record<string, string> = {
	"identity-verification": "24–48 hours",
	"bank-verification": "1–2 business days",
	"business-verification": "3–5 business days",
	"transaction-review": "up to 4 hours",
	"fraud-appeal": "24 hours (priority)",
	"dispute-resolution": "issuer-led, up to 45 days",
};

const OUTCOME: Record<string, string> = {
	"identity-verification": "Identity verified",
	"bank-verification": "All accounts linked",
	"business-verification": "KYB approved",
	"transaction-review": "Holds released",
	"fraud-appeal": "Appeal upheld · flag lifted",
	"dispute-resolution": "Resolved in your favour",
};

const PREFIX: Record<string, string> = {
	"identity-verification": "KYC",
	"bank-verification": "LNK",
	"business-verification": "KYB",
	"transaction-review": "TXN",
	"fraud-appeal": "FA",
	"dispute-resolution": "DSP",
};

export function createSubmission(
	task: { id: string; title: string; icon: string; tone: Submission["tone"] },
	summary: Array<[string, string]>,
): Submission {
	return {
		taskId: task.id,
		ref: makeRef(PREFIX[task.id] ?? "APP"),
		title: task.title,
		icon: task.icon,
		tone: task.tone,
		submittedAt: Date.now(),
		stages: PIPELINES[task.id] ?? PIPELINES["identity-verification"],
		stage: 0,
		status: "pending",
		summary,
		sla: SLA[task.id] ?? "24–48 hours",
		outcome: OUTCOME[task.id] ?? "Approved",
	};
}

export function statusOf(app: Submission): AppStatus {
	if (app.stage >= app.stages.length - 1) return "resolved";
	return app.stage === 0 ? "pending" : "review";
}

export function percentOf(app: Submission) {
	return Math.round((app.stage / (app.stages.length - 1)) * 100);
}

export function StatusBadge({ status }: { status: AppStatus }) {
	if (status === "resolved")
		return (
			<Badge tone="green" icon="bi-check-circle-fill">
				Resolved
			</Badge>
		);
	if (status === "review")
		return (
			<Badge tone="blue" icon="bi-hourglass-split">
				In review
			</Badge>
		);
	return (
		<Badge tone="amber" icon="bi-clock">
			Pending
		</Badge>
	);
}

/* ==========================================================================
 * TRACKER DIALOG
 * ======================================================================== */
export function ApplicationTracker({
	app,
	open,
	onClose,
}: {
	app: Submission | null;
	open: boolean;
	onClose: () => void;
}) {
	if (!app) return null;
	const status = statusOf(app);
	const pct = percentOf(app);
	const submitted = new Date(app.submittedAt).toLocaleString("en-GB", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={`${app.title} · status`}
			sub={`Submitted ${submitted}`}
			icon={app.icon}
			tone={app.tone}
			footer={
				status === "resolved" ? (
					<>
						<Button variant="ghost" onClick={onClose}>
							Close
						</Button>
						<Button
							icon="bi-box-arrow-in-right"
							onClick={() => {
								toast.success(
									"Access restored",
									"Taking you to your dashboards…",
								);
								window.setTimeout(() => go("/auth/hub"), 900);
							}}
						>
							Proceed to account
						</Button>
					</>
				) : (
					<>
						<Button
							variant="ghost"
							icon="bi-bell"
							onClick={() => {
								toast.info(
									"Alerts on",
									"We'll email and push every status change.",
								);
								onClose();
							}}
						>
							Notify me
						</Button>
						<Button variant="subtle" onClick={onClose}>
							Close
						</Button>
					</>
				)
			}
		>
			<div className={s.stack}>
				<div className={s.refBox}>
					<span className={s.grow}>
						<span className={s.tiny}>Reference</span>
						<span className={cx(s.mono, s.strong)} style={{ display: "block" }}>
							{app.ref}
						</span>
					</span>
					<Button
						variant="ghost"
						size="sm"
						icon="bi-clipboard"
						onClick={() => {
							navigator.clipboard?.writeText(app.ref);
							toast.success("Reference copied");
						}}
					>
						Copy
					</Button>
				</div>

				<div className={s.spread}>
					<StatusBadge status={status} />
					<span className={s.tiny}>
						{status === "resolved" ? (
							app.outcome
						) : (
							<>
								<span className={s.liveDot} /> Live · typical decision in{" "}
								{app.sla}
							</>
						)}
					</span>
				</div>

				<Progress value={pct} />
				<div className={s.spread}>
					<span className={s.tiny}>
						Stage {Math.min(app.stage + 1, app.stages.length)} of{" "}
						{app.stages.length}
					</span>
					<span className={s.strong}>{pct}%</span>
				</div>

				<hr className={s.divider} />

				<div className={s.track}>
					{app.stages.map((st, i) => {
						const done = i < app.stage || status === "resolved";
						const now = i === app.stage && status !== "resolved";
						return (
							<div
								key={st.label}
								className={cx(
									s.trackItem,
									done && s.trackDone,
									now && s.trackNow,
								)}
							>
								{i < app.stages.length - 1 && <span className={s.trackLine} />}
								<span className={s.trackDot}>
									{done ? <i className="bi bi-check-lg" /> : i + 1}
								</span>
								<span className={s.grow}>
									<span className={s.trackLabel}>
										{st.label}
										{done && <Badge tone="green">Done</Badge>}
										{now && <Badge tone="blue">In progress</Badge>}
										{!done && !now && <Badge tone="slate">Queued</Badge>}
									</span>
									<p className={s.trackNote}>{st.note}</p>
								</span>
							</div>
						);
					})}
				</div>

				{status === "resolved" ? (
					<Notice tone="green" icon="bi-unlock">
						<b>{app.outcome}.</b> Every restriction tied to this application has
						been lifted — continue to your dashboards.
					</Notice>
				) : (
					<Notice tone="blue" icon="bi-info-circle">
						You can close this window. We'll notify you the moment the status
						changes.
					</Notice>
				)}

				<hr className={s.divider} />
				<div className={s.tiny}>What you submitted</div>
				<SummaryRows rows={app.summary} />
			</div>
		</Modal>
	);
}
