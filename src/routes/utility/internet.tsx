import { createFileRoute } from '@tanstack/react-router'
import InternetManagement from '@/features/utility-dashboard/internet/pages/InternetManagement'

// 3.4 — Internet & Connectivity Management (named route wins over /utility/$module).
export const Route = createFileRoute('/utility/internet')({ component: InternetManagement })
