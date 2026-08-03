import { createFileRoute } from "@tanstack/react-router";
import Homepage from "../../features/home/components/Home";

export const Route = createFileRoute("/_home/")({ component: Homepage });
