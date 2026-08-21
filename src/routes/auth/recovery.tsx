import { createFileRoute } from "@tanstack/react-router";
import Recovery from "../../features/authentication/pages/Recovery";

export const Route = createFileRoute("/auth/recovery")({
	component: Recovery,
	head: () => ({ meta: [{ title: "Account recovery · Paymo BAAS" }] }),
});
