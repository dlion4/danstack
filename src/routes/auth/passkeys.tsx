import { createFileRoute } from "@tanstack/react-router";
import Passkeys from "../../features/authentication/pages/Passkeys";

export const Route = createFileRoute("/auth/passkeys")({
	component: Passkeys,
	head: () => ({ meta: [{ title: "Passkeys & biometrics · Paymo BAAS" }] }),
});
