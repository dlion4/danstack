import { createFileRoute } from '@tanstack/react-router'
import DevHome from '@/features/Layouts/dashboard-dev-layout/pages/DevHome'

export const Route = createFileRoute('/dev/')({ component: DevHome })
