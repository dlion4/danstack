import { createFileRoute } from "@tanstack/react-router";
import BusinessPage from "../../features/home/components/Home";

export const Route = createFileRoute("/_home/business")({
	component: BusinessPage,
});
