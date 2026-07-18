import { createFileRoute } from "@tanstack/react-router";
import Liquidity from "../features/liquidity/pages/Liquidity";

/**
 * app.liquidity.tsx — Liquidity & Float Management (Page 1.5).
 * Child of routes/app.tsx, so it renders INSIDE the app shell
 * (sidebar + top nav + right aside stay fixed; only this body swaps in).
 */
export const Route = createFileRoute("/app/liquidity")({
	component: Liquidity,
});
