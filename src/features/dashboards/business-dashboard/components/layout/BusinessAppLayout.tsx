/* ============================================================================\n * BusinessAppLayout.tsx — layout route host for the designed PayMo Business
 * pages. Mirrors UtilityShell / CardsShell: the layout owns the theme CSS and
 * an <Outlet />. Each child route renders one designed App (its own sidebar /
 * topbar / store) so fonts, colours and behaviour stay untouched.
 * ========================================================================== */

import { Outlet } from "@tanstack/react-router";
import "../../index.css";

export default function BusinessAppLayout() {
	return <Outlet />;
}
