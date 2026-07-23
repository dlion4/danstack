import { createFileRoute } from '@tanstack/react-router'
import WaterDeepDive from '@/features/utility-dashboard/water/pages/WaterDeepDive'

// 3.3 — Water Management Deep Dive (named route wins over /utility/$module).
export const Route = createFileRoute('/utility/water')({ component: WaterDeepDive })
