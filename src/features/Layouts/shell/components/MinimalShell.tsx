/* ============================================================================
 * MinimalShell.tsx — simplified shell for wallet-activation page.
 * ----------------------------------------------------------------------------
 * This is a minimal layout variant with:
 * - Sidebar with only logo and logout/switch account
 * - No top navbar
 * - No right aside
 * - No navigation links
 * - Same responsiveness as shell layout
 * - Clean, neutral design
 * ========================================================================== */

import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import type { ShellContextValue, ToastInput } from "../data/shellContext";
import { ShellContext } from "../data/shellContext";
import type { ToastTone } from "../data/shellData";
import { cx } from "../data/shellData";
import styles from "../styles/shell.module.css";
import type { ToastRecord } from "./Toasts";
import Toasts from "./Toasts";
import PaymoLogo from "../../../../components/shared/PaymoLogo";

const s = styles as Record<string, string>;

let toastIdSeq = 0;

interface MinimalShellProps {
	children: React.ReactNode;
}

export default function MinimalShell({ children }: MinimalShellProps) {
	/* ---------- layout state ---------- */
	const [isDesktop, setIsDesktop] = useState<boolean>(() =>
		typeof window !== "undefined" ? window.innerWidth >= 992 : true,
	);
	const [expanded, setExpanded] = useState<boolean>(() => isDesktop);
	const [mobileOpen, setMobileOpen] = useState(false);

	/* ---------- toasts ---------- */
	const [toasts, setToasts] = useState<ToastRecord[]>([]);
	const leavingTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
		new Map(),
	);

	/* ======================================================================
	 * TOAST ENGINE
	 * ==================================================================== */
	const dismissToast = useCallback((id: number) => {
		setToasts((prev) =>
			prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
		);
		const timer = setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
			leavingTimersRef.current.delete(id);
		}, 300);
		leavingTimersRef.current.set(id, timer);
	}, []);

	const showToast = useCallback(
		(toast: ToastInput | string, tone?: ToastTone) => {
			const input: ToastInput =
				typeof toast === "string" ? { message: toast } : toast;
			const id = (toastIdSeq += 1);
			const type: ToastTone = input.type ?? tone ?? "info";
			const record: ToastRecord = {
				id,
				message: input.message,
				title: input.title ?? "",
				type,
			};
			setToasts((prev) => [...prev, record]);
			setTimeout(() => dismissToast(id), 4500);
		},
		[dismissToast],
	);

	useEffect(
		() => () => {
			leavingTimersRef.current.forEach(clearTimeout);
			leavingTimersRef.current.clear();
		},
		[],
	);

	/* ======================================================================
	 * SIDEBAR
	 * ==================================================================== */
	const toggleSidebar = useCallback(() => {
		if (isDesktop) setExpanded((v) => !v);
		else setMobileOpen((v) => !v);
	}, [isDesktop]);

	const closeMobile = useCallback(() => setMobileOpen(false), []);

	/* ======================================================================
	 * LOGOUT
	 * ==================================================================== */
	const handleLogout = useCallback(() => {
		showToast("Logged out successfully", "success");
	}, [showToast]);

	/* ======================================================================
	 * SWITCH ACCOUNT
	 * ==================================================================== */
	const handleSwitchAccount = useCallback(() => {
		window.location.href = "/auth/hub";
	}, []);

	/* ======================================================================
	 * RESPONSIVENESS
	 * ==================================================================== */
	useEffect(() => {
		const onResize = () => {
			const desktop = window.innerWidth >= 992;
			if (desktop !== isDesktop) {
				setIsDesktop(desktop);
				if (desktop) setMobileOpen(false);
				else setExpanded(false);
			}
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [isDesktop]);

	/* ======================================================================
	 * GLOBAL KEYBOARD SHORTCUTS
	 * ==================================================================== */
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
				e.preventDefault();
				toggleSidebar();
			}
			if (e.key === "Escape") {
				if (!isDesktop) closeMobile();
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [toggleSidebar, closeMobile, isDesktop]);

	/* ---------- body scroll lock when mobile drawer is open ---------- */
	useEffect(() => {
		const lock = !isDesktop && mobileOpen;
		document.body.style.overflow = lock ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isDesktop, mobileOpen]);

	/* ---------- context value for child pages ---------- */
	const ctxValue: ShellContextValue = useMemo(
		() => ({ showToast, openAside: () => {} }),
		[showToast],
	);

	/* ======================================================================
	 * TEMPLATE
	 * ==================================================================== */
	return (
		<ShellContext.Provider value={ctxValue}>
			<div className={s.shellRoot}>
				{/* ambient background */}
				<div className={s.gridOverlay} />
				<div className={cx(s.blob, s.blobMint)} />
				<div className={cx(s.blob, s.blobDeep)} />

				{/* ============ MINIMAL SIDEBAR ============ */}
				<aside
					className={cx(
						s.sidebar,
						isDesktop && expanded && s.expanded,
						!isDesktop && mobileOpen && s.mobileOpen,
						!isDesktop && !mobileOpen && s.mobileClosed,
					)}
					aria-label="Minimal navigation"
				>
					<div className={s.brandRow}>
						<Link to="/" className={s.brandLink} aria-label="Go to home">
							<PaymoLogo expanded={expanded || !isDesktop} />
						</Link>
						{!isDesktop && (
							<button
								type="button"
								className={s.sidebarToggle}
								onClick={closeMobile}
								aria-label="Close menu"
							>
								<i className="bi bi-x-lg" />
							</button>
						)}
					</div>

					<div className={s.navScroll}>
						{/* Only show logo and account actions */}
						<div className="mb-2">
							<span className={s.navGroupLabel}>Account</span>
							<nav className="d-flex flex-column">
								<button
									type="button"
									className={s.navLink}
									onClick={handleSwitchAccount}
									title="Switch Account"
								>
									<span className={s.navIcon}>
										<i className="bi bi-arrow-left-right" />
									</span>
									<span className={s.navLabel}>Switch Account</span>
								</button>
								<button
									type="button"
									className={s.navLink}
									onClick={handleLogout}
									title="Logout"
								>
									<span className={s.navIcon}>
										<i className="bi bi-box-arrow-right" />
									</span>
									<span className={s.navLabel}>Logout</span>
								</button>
							</nav>
						</div>
					</div>
				</aside>

				{/* Mobile backdrop */}
				<div
					className={cx(s.sidebarBackdrop, !isDesktop && mobileOpen && s.show)}
					aria-hidden="true"
					onClick={closeMobile}
				/>

				{/* ============ MAIN CONTENT ============ */}
				<main
					className={cx(
						s.mainContent,
						expanded && isDesktop && s.sidebarExpanded,
					)}
				>
					{children}
				</main>

				{/* ============ TOASTS ============ */}
				<Toasts toasts={toasts} onDismiss={dismissToast} />
			</div>
		</ShellContext.Provider>
	);
}
