import { createFileRoute } from "@tanstack/react-router";
import AppBooks from "@/features/dashboards/business-dashboard/AppBooks";
import { useBusinessNavigate } from "@/features/dashboards/business-dashboard/lib/routes";

/** /business-dashboard/books — designed Bookkeeping & Taxes. */
export const Route = createFileRoute("/business-dashboard/books")({
	component: BooksRoute,
});

function BooksRoute() {
	const go = useBusinessNavigate();
	return <AppBooks onNavigate={go} />;
}
