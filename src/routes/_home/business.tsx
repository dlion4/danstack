import { createFileRoute } from '@tanstack/react-router'
import BusinessPage from '../../features/home/pages/Homepage'

export const Route = createFileRoute('/_home/business')({ component: BusinessPage })
