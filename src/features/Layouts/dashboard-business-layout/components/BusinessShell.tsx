/* ============================================================================
 * BusinessShell.tsx — the reusable Paymo BAAS Business Layout shell.
 * ----------------------------------------------------------------------------
 * MIGRATED FROM: Angular dashboard-business-layout (typescript + html).
 * ARCHITECTURE: Layout route renders <BusinessShell>, whose <Outlet /> hosts
 * the page route.
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
	BusinessShellContext,
	type BusinessShellContextValue,
} from "../data/businessLayoutContext";
import type {
	AsideKind,
	ToastInput,
	ToastTone,
} from "../data/businessLayoutData";
import {
	cx,
	fetchBusinessLayoutContent,
	initialMockData,
} from "../data/businessLayoutData";
import { resolveBusinessPageMeta } from "../data/businessPageMeta";
import styles from "../styles/businessLayout.module.css";
import BusinessAside from "./BusinessAside";
import type { DropdownName } from "./BusinessHeader";
import BusinessHeader from "./BusinessHeader";
import BusinessPageBar from "./BusinessPageBar";
import BusinessSidebar from "./BusinessSidebar";
import type { BusinessToastRecord } from "./BusinessToasts";
import BusinessToasts from "./BusinessToasts";

const s = styles as Record<string, string>;
let toastIdSeq = 0;
export default function BusinessShell() {
	useEffect(() => {
		let cancelled = false;
		import("bootstrap/dist/js/bootstrap.bundle.min.js").catch((err) => {
			if (!cancelled)
				console.warn("[BusinessShell] Bootstrap JS failed to load:", err);
		});
		return () => {
			cancelled = true;
		};
	}, []);
	const { data: apiData } = useQuery({
		queryKey: ["business-layout-content"],
		queryFn: fetchBusinessLayoutContent,
		staleTime: 5 * 60_000,
		retry: 1,
	});
	const content = apiData ?? initialMockData;
	const [isDesktop, setIsDesktop] = useState(true);
	const [expanded, setExpanded] = useState(true);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [openDropdown, setOpenDropdown] = useState<DropdownName | null>(null);
	const [activePanel, setActivePanel] = useState<AsideKind | null>(null);
	const [toasts, setToasts] = useState<BusinessToastRecord[]>([]);
	const leavingTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
		new Map(),
	);
	const pathname = useRouterState({ select: (st) => st.location.pathname });
	const activeSection = useMemo(() => {
		const segments = pathname.split("/").filter(Boolean);
		return segments.length >= 2 ? segments[1] : "dashboard";
	}, [pathname]);
	const pageMeta = useMemo(() => resolveBusinessPageMeta(pathname), [pathname]);
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
			const titles: Record<ToastTone, string> = {
				success: "Success",
				danger: "Error",
				warning: "Warning",
				info: "Info",
			};
			const record: BusinessToastRecord = {
				id,
				message: input.message,
				title: input.title ?? titles[type],
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
	const toggleSidebar = useCallback(() => {
		if (isDesktop) setExpanded((v) => !v);
		else setMobileOpen((v) => !v);
	}, [isDesktop]);
	const closeMobile = useCallback(() => setMobileOpen(false), []);
	const toggleDropdown = useCallback((name: DropdownName) => {
		setOpenDropdown((prev) => (prev === name ? null : name));
	}, []);
	const closeAllDropdowns = useCallback(() => setOpenDropdown(null), []);
	const openAside = useCallback(
		(kind: AsideKind) => {
			setActivePanel(kind);
			closeAllDropdowns();
		},
		[closeAllDropdowns],
	);
	const closeAside = useCallback(() => setActivePanel(null), []);
	const handleLogout = useCallback(() => {
		closeAllDropdowns();
		closeAside();
		showToast("Logged out successfully", "success");
	}, [closeAllDropdowns, closeAside, showToast]);
	const handleSearchSubmit = useCallback(
		(query: string) => {
			const q = query.trim();
			if (!q) return;
			showToast(`Searching for "${q}"…`, "info");
		},
		[showToast],
	);
	useEffect(() => {
		const onResize = () => {
			const desktop = window.innerWidth >= 992;
			if (desktop !== isDesktop) {
				setIsDesktop(desktop);
				if (desktop) setMobileOpen(false);
				else setExpanded(false);
			}
		};
		onResize();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [isDesktop]);
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
				e.preventDefault();
				toggleSidebar();
				return;
			}
			if (e.key === "Escape") {
				closeAllDropdowns();
				closeAside();
				if (!isDesktop) closeMobile();
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [closeAllDropdowns, closeAside, closeMobile, isDesktop, toggleSidebar]);
	useEffect(() => {
		if (!openDropdown) return undefined;
		const onDocClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			if (target && !target.closest("[data-dropdown]")) {
				closeAllDropdowns();
			}
		};
		const id = setTimeout(
			() => document.addEventListener("click", onDocClick),
			0,
		);
		return () => {
			clearTimeout(id);
			document.removeEventListener("click", onDocClick);
		};
	}, [openDropdown, closeAllDropdowns]);
	useEffect(() => {
		const lock = (!isDesktop && mobileOpen) || activePanel !== null;
		document.body.style.overflow = lock ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isDesktop, mobileOpen, activePanel]);
	const ctxValue: BusinessShellContextValue = useMemo(
		() => ({ showToast, openAside }),
		[showToast, openAside],
	);
	const unreadCount = content.notifications.filter((n) => n.unread).length;
	return (
		<BusinessShellContext.Provider value={ctxValue}>
			<div className={s.businessRoot}>
				<BusinessSidebar
					content={content}
					isDesktop={isDesktop}
					expanded={expanded}
					mobileOpen={mobileOpen}
					activeSection={activeSection}
					onToggle={toggleSidebar}
					onCloseMobile={closeMobile}
					onLogout={handleLogout}
				/>
				<div
					className={cx(
						s["sidebar-backdrop"],
						!isDesktop && mobileOpen && s.show,
					)}
					aria-hidden="true"
					onClick={closeMobile}
				/>
				<BusinessHeader
					content={content}
					expanded={expanded && isDesktop}
					openDropdown={openDropdown}
					onToggleSidebar={toggleSidebar}
					onToggleDropdown={toggleDropdown}
					onOpenAside={openAside}
					onLogout={handleLogout}
					onSearchSubmit={handleSearchSubmit}
					unreadCount={unreadCount}
				/>
				<main
					className={cx(
						s["main-content"],
						expanded && isDesktop && s["sidebar-expanded"],
						pageMeta && s.flush,
					)}
				>
					{pageMeta && <BusinessPageBar meta={pageMeta} />}
					<Outlet />
				</main>
				<BusinessAside
					activePanel={activePanel}
					onClose={closeAside}
					onToast={showToast}
				/>
				<BusinessToasts toasts={toasts} onDismiss={dismissToast} />
			</div>
		</BusinessShellContext.Provider>
	);
}
