import { createFileRoute } from "@tanstack/react-router";
import AppProfile from "@/features/dashboards/business-dashboard/components/Profile/App";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/profile — designed Business Profile & KYB. */
export const Route = createFileRoute("/business-dashboard/profile")({
	component: ProfileRoute,
});

function ProfileRoute() {
	const go = useBusinessNavigate();
	return <AppProfile onNavigate={go} />;
}
