/* ============================================================================
 * Passkeys.tsx — Paymo BAAS · Passkeys & biometrics
 * ----------------------------------------------------------------------------
 * Re-themed to the PayMo Business design language via ../components/AuthKit and
 * rebuilt as a management console instead of a 1,520-line explainer page.
 *
 * Kept: passkey inventory, enrolment wizard, device pairing, security policies,
 * recovery guidance and the password/passkey/biometric comparison.
 * Added: rename + revoke dialogs, primary switching, live policy toggles,
 * export of the passkey inventory and toasts on every action.
 *
 * Routes/links preserved: /auth/security · /auth/hub · /auth/mfa · /auth/login
 * ========================================================================== */

import { useMemo, useState } from "react";
import {
	AuthConsole,
	AuthPage,
	Badge,
	Button,
	Card,
	cx,
	EmptyState,
	Field,
	go,
	Hero,
	Input,
	Modal,
	Notice,
	OptionCard,
	Progress,
	Section,
	Stepper,
	Switch,
	s,
	toast,
} from "../components/AuthKit";

interface Passkey {
	id: string;
	name: string;
	device: string;
	icon: string;
	created: string;
	lastUsed: string;
	sync: string;
	primary: boolean;
}

const INITIAL_KEYS: Passkey[] = [
	{
		id: "pk-1",
		name: "iPhone 15 Pro",
		device: "iOS 18 · Face ID",
		icon: "bi-phone",
		created: "12 Mar 2026",
		lastUsed: "Active now",
		sync: "iCloud Keychain",
		primary: true,
	},
	{
		id: "pk-2",
		name: "MacBook Pro",
		device: "macOS · Touch ID",
		icon: "bi-laptop",
		created: "12 Mar 2026",
		lastUsed: "2 hours ago",
		sync: "iCloud Keychain",
		primary: false,
	},
	{
		id: "pk-3",
		name: "YubiKey 5C",
		device: "FIDO2 hardware key",
		icon: "bi-usb-symbol",
		created: "04 Feb 2026",
		lastUsed: "6 days ago",
		sync: "Device-bound",
		primary: false,
	},
];

const POLICIES = [
	{
		id: "requireApprovals",
		title: "Require passkey for treasury approvals",
		sub: "Payouts above KES 500,000 and API key rotation",
		on: true,
	},
	{
		id: "allowSync",
		title: "Allow synced passkeys",
		sub: "iCloud Keychain, Google Password Manager, 1Password",
		on: true,
	},
	{
		id: "blockPassword",
		title: "Block password sign-in on trusted devices",
		sub: "Passwords still work during recovery",
		on: false,
	},
	{
		id: "stepUp",
		title: "Re-prompt every 12 hours",
		sub: "Shorter windows for shared workstations",
		on: false,
	},
];

const COMPARE = [
	{
		method: "Password",
		security: "Medium",
		tone: "amber" as const,
		friction: "Typing + memory",
		best: "Legacy backup",
	},
	{
		method: "Passkey",
		security: "Very high",
		tone: "green" as const,
		friction: "Touch or glance",
		best: "Primary login",
	},
	{
		method: "Biometric",
		security: "High",
		tone: "blue" as const,
		friction: "Instant unlock",
		best: "Mobile approvals",
	},
];

const WIZARD_STEPS = [
	{ label: "Name", icon: "bi-tag" },
	{ label: "Device", icon: "bi-fingerprint" },
	{ label: "Done", icon: "bi-check2" },
];

export default function Passkeys() {
	const [keys, setKeys] = useState<Passkey[]>(INITIAL_KEYS);
	const [policies, setPolicies] = useState(
		() =>
			Object.fromEntries(POLICIES.map((p) => [p.id, p.on])) as Record<
				string,
				boolean
			>,
	);

	const [addOpen, setAddOpen] = useState(false);
	const [wizStep, setWizStep] = useState(0);
	const [newName, setNewName] = useState("");

	const [renaming, setRenaming] = useState<Passkey | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const [revoking, setRevoking] = useState<Passkey | null>(null);
	const [pairOpen, setPairOpen] = useState(false);

	const coverage = useMemo(
		() => Math.min(100, keys.length * 33 + 1),
		[keys.length],
	);

	const startAdd = () => {
		setNewName("");
		setWizStep(0);
		setAddOpen(true);
	};

	const advance = () => {
		if (wizStep === 0) {
			if (newName.trim().length < 2) {
				toast.warning(
					"Name your passkey",
					"Something like “Work laptop” helps you audit later.",
				);
				return;
			}
			setWizStep(1);
			toast.info(
				"Follow your device prompt",
				"Face ID, Touch ID, Windows Hello or a security key.",
			);
			window.setTimeout(() => setWizStep(2), 2200);
			return;
		}
		if (wizStep === 2) {
			const created: Passkey = {
				id: `pk-${Date.now()}`,
				name: newName.trim(),
				device: "This browser · platform authenticator",
				icon: "bi-shield-lock",
				created: "Just now",
				lastUsed: "Just now",
				sync: "Device-bound",
				primary: keys.length === 0,
			};
			setKeys((prev) => [created, ...prev]);
			setAddOpen(false);
			toast.success(
				"Passkey registered",
				`${created.name} can now sign you in without a password.`,
			);
		}
	};

	const makePrimary = (id: string) => {
		setKeys((prev) => prev.map((k) => ({ ...k, primary: k.id === id })));
		toast.success(
			"Primary passkey updated",
			"It will be offered first at sign-in.",
		);
	};

	const confirmRevoke = () => {
		if (!revoking) return;
		setKeys((prev) => prev.filter((k) => k.id !== revoking.id));
		toast.warning("Passkey revoked", `${revoking.name} can no longer sign in.`);
		setRevoking(null);
	};

	const exportInventory = () => {
		const csv = [
			"name,device,created,last used,sync,primary",
			...keys.map((k) =>
				[k.name, k.device, k.created, k.lastUsed, k.sync, k.primary].join(","),
			),
		].join("\n");
		const blob = new Blob([csv], { type: "text/csv" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = "paymo-passkeys.csv";
		a.click();
		URL.revokeObjectURL(a.href);
		toast.success(
			"Inventory exported",
			"paymo-passkeys.csv saved to your downloads.",
		);
	};

	return (
		<AuthPage>
			<AuthConsole
				crumb="Security · Passkeys & biometrics"
				actions={
					<>
						<Button
							variant="ghost"
							size="sm"
							icon="bi-shield-check"
							onClick={() => go("/auth/security")}
						>
							Security centre
						</Button>
						<Button size="sm" icon="bi-plus-lg" onClick={startAdd}>
							Add passkey
						</Button>
					</>
				}
			>
				<Hero
					zone="PASSKEYS"
					title="Go passwordless."
					copy="Phishing-resistant sign-in for dashboards, the API console and high-risk approvals."
					chips={
						<>
							<Badge tone="onDark">FIDO2 · WebAuthn</Badge>
							<Badge tone="onDark">{keys.length} registered</Badge>
						</>
					}
					stats={[
						{ value: String(keys.length), label: "Passkeys" },
						{ value: "0", label: "Password leaks" },
						{ value: "2s", label: "Avg sign-in" },
					]}
					actions={
						<Button
							size="sm"
							variant="dark"
							icon="bi-qr-code"
							onClick={() => setPairOpen(true)}
						>
							Pair a device
						</Button>
					}
				/>

				<Section
					no="1"
					title="Your passkeys"
					sub="Each credential is bound to a device or password manager. Revoking one is instant."
					actions={
						<Button
							size="sm"
							variant="ghost"
							icon="bi-download"
							onClick={exportInventory}
						>
							Export
						</Button>
					}
				/>

				{keys.length === 0 ? (
					<Card>
						<EmptyState
							icon="bi-fingerprint"
							title="No passkeys yet"
							text="Add one now — it takes about ten seconds and removes password risk entirely."
							action={
								<Button icon="bi-plus-lg" onClick={startAdd}>
									Add your first passkey
								</Button>
							}
						/>
					</Card>
				) : (
					<div className={s.stack}>
						{keys.map((k) => (
							<div
								key={k.id}
								className={cx(s.listRow, k.primary && s.listRowAccent)}
							>
								<span
									className={cx(s.tile, k.primary ? s.tileGreen : s.tileSlate)}
								>
									<i className={`bi ${k.icon}`} />
								</span>
								<div className={s.grow}>
									<div className={cx(s.row, s.rowTight)}>
										<span className={s.optionTitle}>{k.name}</span>
										{k.primary && (
											<Badge tone="green" icon="bi-star-fill">
												Primary
											</Badge>
										)}
										<Badge tone="slate">{k.sync}</Badge>
									</div>
									<div className={s.tiny}>
										{k.device} · added {k.created} · last used {k.lastUsed}
									</div>
								</div>
								<div className={cx(s.row, s.rowTight)}>
									{!k.primary && (
										<Button
											size="sm"
											variant="subtle"
											icon="bi-star"
											onClick={() => makePrimary(k.id)}
										>
											Make primary
										</Button>
									)}
									<Button
										size="sm"
										variant="ghost"
										icon="bi-pencil"
										onClick={() => {
											setRenaming(k);
											setRenameValue(k.name);
										}}
									>
										Rename
									</Button>
									<Button
										size="sm"
										variant="dangerGhost"
										icon="bi-trash"
										onClick={() => setRevoking(k)}
									>
										Revoke
									</Button>
								</div>
							</div>
						))}
					</div>
				)}

				<Card
					title="Passwordless coverage"
					sub="Devices you sign in from that already hold a passkey."
					icon="bi-graph-up-arrow"
				>
					<Progress value={coverage} />
					<div className={s.spread} style={{ marginTop: "0.5rem" }}>
						<span className={s.tiny}>
							{coverage}% of your active devices are covered
						</span>
						<Button
							size="sm"
							variant="outline"
							icon="bi-plus-lg"
							onClick={startAdd}
						>
							Cover another device
						</Button>
					</div>
				</Card>

				<Section
					no="2"
					title="Policies"
					sub="Applied to every member of this workspace."
				/>
				<div className={s.grid} style={{ ["--au-min" as string]: "320px" }}>
					{POLICIES.map((p) => (
						<Card key={p.id}>
							<div className={s.spread}>
								<div className={s.grow}>
									<div className={s.optionTitle}>{p.title}</div>
									<div className={s.tiny}>{p.sub}</div>
								</div>
								<Switch
									on={policies[p.id]}
									label={p.title}
									onToggle={() => {
										const next = !policies[p.id];
										setPolicies((prev) => ({ ...prev, [p.id]: next }));
										toast.info(
											next ? "Policy enabled" : "Policy disabled",
											p.title,
										);
									}}
								/>
							</div>
						</Card>
					))}
				</div>

				<Section
					no="3"
					title="How it compares"
					sub="Why passkeys are the default for financial controls."
				/>
				<div className={s.tableWrap}>
					<table className={s.table}>
						<thead>
							<tr>
								<th>Method</th>
								<th>Security</th>
								<th>Friction</th>
								<th>Best used for</th>
							</tr>
						</thead>
						<tbody>
							{COMPARE.map((r) => (
								<tr key={r.method}>
									<td className={s.strong}>{r.method}</td>
									<td>
										<Badge tone={r.tone}>{r.security}</Badge>
									</td>
									<td>{r.friction}</td>
									<td>{r.best}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<Notice tone="blue" icon="bi-life-preserver">
					Lost every device? Recovery codes and identity verification still work
					—{" "}
					<button
						type="button"
						className={s.link}
						onClick={() => go("/auth/mfa")}
					>
						open the step-up options
					</button>
					.
				</Notice>
			</AuthConsole>

			{/* ---------------- add passkey wizard ---------------- */}
			<Modal
				open={addOpen}
				onClose={() => setAddOpen(false)}
				title="Add a passkey"
				sub="Roughly ten seconds — your device does the hard part."
				icon="bi-fingerprint"
				footer={
					<>
						<Button variant="ghost" onClick={() => setAddOpen(false)}>
							Cancel
						</Button>
						<Button onClick={advance} disabled={wizStep === 1}>
							{wizStep === 2 ? "Finish" : "Continue"}
						</Button>
					</>
				}
			>
				<Stepper steps={WIZARD_STEPS} current={wizStep} />
				<div style={{ marginTop: "1.1rem" }}>
					{wizStep === 0 && (
						<Field
							label="Passkey name"
							hint="Visible only to you and workspace admins."
							htmlFor="pkName"
						>
							<Input
								id="pkName"
								placeholder="Work laptop"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
							/>
						</Field>
					)}
					{wizStep === 1 && (
						<div className={cx(s.center, s.stack)}>
							<div
								className={cx(s.bio, s.bioScan)}
								style={{ margin: "0 auto" }}
							>
								<i className="bi bi-fingerprint" />
							</div>
							<div className={s.cardTitle}>Confirm on your device</div>
							<p className={s.tiny}>
								Face ID, Touch ID, Windows Hello or your security key.
							</p>
						</div>
					)}
					{wizStep === 2 && (
						<div className={cx(s.center, s.stack)}>
							<div
								className={cx(s.bio, s.bioDone)}
								style={{ margin: "0 auto" }}
							>
								<i className="bi bi-check-lg" />
							</div>
							<div className={s.cardTitle}>Passkey ready</div>
							<p className={s.tiny}>
								“{newName || "New passkey"}” will be offered the next time you
								sign in.
							</p>
						</div>
					)}
				</div>
			</Modal>

			{/* ---------------- rename ---------------- */}
			<Modal
				open={!!renaming}
				onClose={() => setRenaming(null)}
				title="Rename passkey"
				icon="bi-pencil"
				size="sm"
				footer={
					<>
						<Button variant="ghost" onClick={() => setRenaming(null)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								if (!renaming) return;
								setKeys((prev) =>
									prev.map((k) =>
										k.id === renaming.id
											? { ...k, name: renameValue.trim() || k.name }
											: k,
									),
								);
								toast.success("Passkey renamed", renameValue.trim());
								setRenaming(null);
							}}
						>
							Save
						</Button>
					</>
				}
			>
				<Field label="Name" htmlFor="pkRename">
					<Input
						id="pkRename"
						value={renameValue}
						onChange={(e) => setRenameValue(e.target.value)}
					/>
				</Field>
			</Modal>

			{/* ---------------- revoke ---------------- */}
			<Modal
				open={!!revoking}
				onClose={() => setRevoking(null)}
				title="Revoke this passkey?"
				sub={revoking ? `${revoking.name} · ${revoking.device}` : undefined}
				icon="bi-shield-x"
				tone="red"
				size="sm"
				footer={
					<>
						<Button variant="ghost" onClick={() => setRevoking(null)}>
							Keep it
						</Button>
						<Button variant="danger" icon="bi-trash" onClick={confirmRevoke}>
							Revoke passkey
						</Button>
					</>
				}
			>
				Sign-in from that device will immediately require a password plus a
				second factor. You can always enrol it again later.
			</Modal>

			{/* ---------------- pair device ---------------- */}
			<Modal
				open={pairOpen}
				onClose={() => setPairOpen(false)}
				title="Pair another device"
				sub="Cross-device passkeys use encrypted Bluetooth proximity — nothing leaves your devices."
				icon="bi-qr-code"
				tone="violet"
				footer={
					<Button variant="ghost" onClick={() => setPairOpen(false)}>
						Close
					</Button>
				}
			>
				<div className={s.stack}>
					<OptionCard
						icon="bi-phone"
						title="Use my phone"
						sub="Scan a QR code with the camera app"
						onClick={() => {
							setPairOpen(false);
							toast.info(
								"QR ready",
								"Scan it with your phone camera to finish pairing.",
							);
						}}
					/>
					<OptionCard
						icon="bi-usb-symbol"
						tone="slate"
						title="Use a hardware key"
						sub="YubiKey, Titan or any FIDO2 key"
						onClick={() => {
							setPairOpen(false);
							startAdd();
						}}
					/>
					<Notice tone="slate" icon="bi-info-circle">
						Paired devices appear in your passkey list and can be revoked at any
						time.
					</Notice>
				</div>
			</Modal>
		</AuthPage>
	);
}
