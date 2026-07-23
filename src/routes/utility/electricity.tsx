import { createFileRoute } from '@tanstack/react-router'
import ElectricityManagement from '@/features/utility-dashboard/electricity/pages/ElectricityManagement'

// 3.2 — Electricity Management Deep Dive (named route wins over /utility/$module).
export const Route = createFileRoute('/utility/electricity')({ component: ElectricityManagement })
