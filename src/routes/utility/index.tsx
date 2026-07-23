import { createFileRoute } from '@tanstack/react-router'
import UtilitiesCommandCenter from '@/features/utility-dashboard/utilities-command-center/pages/UtilitiesCommandCenter'

// 3.1 — Utilities Command Center is the utility layout overview (/utility).
export const Route = createFileRoute('/utility/')({ component: UtilitiesCommandCenter })
