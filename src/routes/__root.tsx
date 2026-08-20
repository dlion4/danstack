import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import BackgroundCanvas from "../components/homeLayout/BackgroundCanvas";
import appCss from "../styles.css?url";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: { refetchOnWindowFocus: false },
	},
});

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover",
			},
			{
				title: "Paymo | Unified Banking & Payment Infrastructure for Africa",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const pathname = useRouterState({ select: (st) => st.location.pathname });
	const isWalletActivation = pathname === "/wallet-activation";

	return (
		<html lang="en" className="dark">
			<head>
				<HeadContent />
			</head>
			<body className="relative min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
				{/* Ambient Particle Background (global) - hidden for wallet-activation */}
				{!isWalletActivation && <BackgroundCanvas />}

				{/* Main Route Body Outlet (Displays active page content) */}
				{/* NOTE: Header/Footer live in the _home layout route, NOT here,
            so auth pages render with zero chrome. */}
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>

				<Scripts />
			</body>
		</html>
	);
}
