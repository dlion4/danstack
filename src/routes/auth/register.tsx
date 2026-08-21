import { createFileRoute } from "@tanstack/react-router";
import Register from "../../features/authentication/pages/Register";

export const Route = createFileRoute("/auth/register")({
	component: Register,
	head: () => ({ meta: [{ title: "Create account · Paymo BAAS" }] }),
});
