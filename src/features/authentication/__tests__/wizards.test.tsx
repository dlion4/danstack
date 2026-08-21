/**
 * @vitest-environment jsdom
 *
 * Drives each of the six /auth/account-status wizards through every step and
 * asserts they can actually be completed and submitted. The driver fills each
 * step generically (inputs, selects, checkboxes, option cards, uploads), so a
 * step whose validation can never be satisfied fails the test loudly.
 */

import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	ApplicationTracker,
	createSubmission,
	percentOf,
	statusOf,
} from "../components/ApplicationTracker";
import { s } from "../components/AuthKit";
import { WIZARDS } from "../components/TaskWizards";
import AccountStatus from "../pages/AccountStatus";

afterEach(cleanup);

const wait = async (ms: number) => {
	await act(async () => {
		await new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	});
};

const click = (el: Element) => {
	fireEvent.click(el);
};

const setValue = (
	el: HTMLInputElement | HTMLTextAreaElement,
	value: string,
) => {
	fireEvent.change(el, { target: { value } });
};

const LONG =
	"We onboarded two supermarket chains on 14 August and ran a national back-to-school promotion across three outlets, which tripled our usual volume.";

function footerButtons() {
	const foot = document.querySelector(`.${s.modalFoot}`);
	if (!foot) throw new Error("wizard footer missing");
	return Array.from(foot.querySelectorAll("button"));
}

async function fillCurrentStep() {
	// 1 · allow-listed in-step actions
	for (const btn of Array.from(document.querySelectorAll("button"))) {
		const label = btn.textContent?.trim() ?? "";
		if (
			label === "Start liveness scan" ||
			label === "Connect with bank login"
		) {
			click(btn);
			await wait(2400);
		}
	}

	// 2 · option cards (single-select) — pick the first if nothing is selected
	const options = Array.from(
		document.querySelectorAll<HTMLButtonElement>(`button.${s.option}`),
	);
	if (options.length && !document.querySelector(`button.${s.optionOn}`)) {
		click(options[0]);
	}

	// 3 · segmented mini buttons: one pick per group that has no selection
	const groups = new Set<Element>();
	for (const mini of Array.from(
		document.querySelectorAll(`button.${s.miniBtn}`),
	)) {
		if (mini.parentElement) groups.add(mini.parentElement);
	}
	for (const group of groups) {
		if (group.querySelector(`button.${s.miniBtnOn}`)) continue;
		const first = group.querySelector<HTMLButtonElement>(`button.${s.miniBtn}`);
		if (first) click(first);
	}

	// 4 · uploads
	const drops = Array.from(
		document.querySelectorAll<HTMLButtonElement>(
			`button.${s.drop}:not(.${s.dropDone})`,
		),
	);
	for (const drop of drops) click(drop);
	if (drops.length) await wait(1000);

	// 5 · selects — take the last option (the first is often a placeholder)
	for (const select of Array.from(document.querySelectorAll("select"))) {
		const opts = Array.from(select.options).filter((o) => o.value !== "");
		if (opts.length)
			fireEvent.change(select, {
				target: { value: opts[opts.length - 1].value },
			});
	}

	// 6 · text inputs
	const inputs = Array.from(document.querySelectorAll("input"));
	let shareSeen = 0;
	let otpDigit = 1;
	for (const input of inputs) {
		if (input.type === "checkbox" || input.type === "radio") continue;
		if (input.maxLength === 1) {
			setValue(input, String(otpDigit++ % 10));
			continue;
		}
		if (input.type === "date") {
			setValue(input, "2020-01-15");
			continue;
		}
		// beneficial-ownership share cells: first holder takes 100%
		if (input.nextElementSibling?.textContent?.trim() === "%") {
			setValue(input, shareSeen++ === 0 ? "100" : "0");
			continue;
		}
		const numeric =
			input.inputMode === "numeric" || input.inputMode === "decimal";
		setValue(input, numeric ? "1200000" : "Amara Okafor");
	}

	// 7 · textareas
	for (const area of Array.from(document.querySelectorAll("textarea"))) {
		setValue(area, LONG);
	}

	// 8 · checkboxes
	for (const box of Array.from(
		document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
	)) {
		if (!box.checked) click(box);
	}
}

describe("verification wizards", () => {
	for (const [taskId, Wizard] of Object.entries(WIZARDS)) {
		it(`${taskId} can be completed end to end`, async () => {
			const onSubmit = vi.fn();
			render(<Wizard open onClose={() => {}} onSubmit={onSubmit} />);

			const totalSteps = document.querySelectorAll(
				`button.${s.wizNode}`,
			).length;
			expect(totalSteps).toBeGreaterThanOrEqual(5);

			for (let i = 0; i < totalSteps; i++) {
				const heading =
					document.querySelector(`.${s.wizStepTitle}`)?.textContent ?? "";
				await fillCurrentStep();
				const advance = footerButtons().at(-1) as HTMLButtonElement;
				expect(
					advance.disabled,
					`step ${i + 1} ("${heading}") of ${taskId} could not be satisfied`,
				).toBe(false);
				click(advance);
				await wait(50);
			}

			await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1), {
				timeout: 4000,
			});
			const rows = onSubmit.mock.calls[0][0] as Array<[string, string]>;
			expect(Array.isArray(rows)).toBe(true);
			expect(rows.length).toBeGreaterThan(2);
		}, 60_000);
	}
});

describe("application tracker", () => {
	const task = {
		id: "fraud-appeal",
		title: "Fraud flag appeal",
		icon: "bi-exclamation-circle",
		tone: "red" as const,
	};

	it("moves pending → in review → resolved", () => {
		const app = createSubmission(task, [["Grounds", "Legitimate growth"]]);
		expect(app.ref.startsWith("PMO-FA-")).toBe(true);
		expect(statusOf(app)).toBe("pending");
		expect(percentOf(app)).toBe(0);

		const mid = { ...app, stage: 2 };
		expect(statusOf(mid)).toBe("review");
		expect(percentOf(mid)).toBe(50);

		const done = { ...app, stage: app.stages.length - 1 };
		expect(statusOf(done)).toBe("resolved");
		expect(percentOf(done)).toBe(100);
	});

	it("offers 'Proceed to account' only once resolved", () => {
		const app = createSubmission(task, [["Grounds", "Legitimate growth"]]);
		const { rerender } = render(
			<ApplicationTracker app={app} open onClose={() => {}} />,
		);
		expect(screen.getByText("Pending")).toBeTruthy();
		expect(screen.queryByText("Proceed to account")).toBeNull();

		rerender(
			<ApplicationTracker
				app={{ ...app, stage: app.stages.length - 1 }}
				open
				onClose={() => {}}
			/>,
		);
		expect(screen.getByText("Resolved")).toBeTruthy();
		expect(screen.getByText("Proceed to account")).toBeTruthy();
	});
});

describe("account status page", () => {
	it("turns a submitted appeal into a live, resolvable application", async () => {
		// fake timers (auto-advancing) so the compliance pipeline can be
		// fast-forwarded at the end of the test
		vi.useFakeTimers({ shouldAdvanceTime: true });
		render(<AccountStatus />);

		// launch the fraud-appeal wizard from its task card
		click(screen.getByText("Submit appeal"));
		await wait(20);
		expect(screen.getByText("What was flagged")).toBeTruthy();

		const totalSteps = document.querySelectorAll(`button.${s.wizNode}`).length;
		for (let i = 0; i < totalSteps; i++) {
			await fillCurrentStep();
			const advance = footerButtons().at(-1) as HTMLButtonElement;
			expect(advance.disabled).toBe(false);
			click(advance);
			await wait(50);
		}

		// the tracker opens itself once the application is filed
		await waitFor(
			() => expect(screen.getAllByText("Pending").length).toBeGreaterThan(0),
			{ timeout: 4000 },
		);
		expect(screen.getAllByText("Appeal received").length).toBeGreaterThan(0);
		expect(screen.queryByText("Proceed to account")).toBeNull();

		// compliance pipeline advances on its own
		await act(async () => {
			vi.advanceTimersByTime(8000 * 6);
		});

		expect(screen.getAllByText("Resolved").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Proceed to account").length).toBeGreaterThan(0);
		expect(
			screen.getAllByText("Appeal upheld · flag lifted").length,
		).toBeGreaterThan(0);
		vi.useRealTimers();
	}, 60_000);
});
