import { createFileRoute } from '@tanstack/react-router'
import BusinessHome from '@/features/Layouts/dashboard-business-layout/pages/BusinessHome'

export const Route = createFileRoute('/business/')({ component: BusinessHome })
