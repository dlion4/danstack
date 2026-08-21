import { createFileRoute } from "@tanstack/react-router";
import Hub from "../../features/authentication/pages/Hub";

export const Route = createFileRoute("/auth/hub")({
	component: Hub,
	head: () => ({ meta: [{ title: "Dashboard hub · Paymo BAAS" }] }),
});
