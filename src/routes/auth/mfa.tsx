import { createFileRoute } from "@tanstack/react-router";
import Mfa from "../../features/authentication/pages/Mfa";

export const Route = createFileRoute("/auth/mfa")({
	component: Mfa,
	head: () => ({ meta: [{ title: "Two-factor verification · Paymo BAAS" }] }),
});
