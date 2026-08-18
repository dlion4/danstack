import { createFileRoute } from "@tanstack/react-router";
import { SettingsOverview, DefaultsSection, SupportSection, FaqSection, ResourcesSection, SettingsDefaultsModal } from "../../../features/card-dashboard/card-settings-support/pages";

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
