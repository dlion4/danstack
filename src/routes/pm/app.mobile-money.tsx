import { createFileRoute } from "@tanstack/react-router";
import MobileMoney from "@/features/dashboards/transaction-dashboard/mobile-money/pages/MobileMoney";

/**
 * app.mobile-money.tsx — Mobile Money & PSP.
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute("/pm/app/mobile-money")(
	{
		component: MobileMoney,
	},
);
