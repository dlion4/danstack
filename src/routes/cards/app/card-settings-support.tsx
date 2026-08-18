import { createFileRoute } from "@tanstack/react-router";
import {
	DefaultsSection,
	FaqSection,
	ResourcesSection,
	SettingsDefaultsModal,
	SettingsOverview,
	SupportSection,
} from "@/features/dashboards/card-dashboard/features/card-dashboard/card-settings-support/pages";

/**
 * app.card-settings-support.tsx — Settings & Support (Module 5.10).
 * Child of routes/cards/app.tsx, so it renders INSIDE the cards shell.
 */
export const Route = createFileRoute("/cards/app/card-settings-support")({
	component: CardSettingsSupport,
});

function CardSettingsSupport() {
	return (
		<>
			<SettingsOverview />
			<DefaultsSection />
			<SupportSection />
			<FaqSection />
			<ResourcesSection />
			<SettingsDefaultsModal />
		</>
	);
}
