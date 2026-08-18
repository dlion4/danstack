import { createFileRoute } from "@tanstack/react-router";
import CardsShell from "../../components/layout/Shell";

export const Route = createFileRoute("/cards/app")({
	component: CardsLayout,
});

function CardsLayout() {
	return <CardsShell />;
}
