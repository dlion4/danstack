import { createFileRoute } from '@tanstack/react-router'
import SecurityCenter from '../../features/authentication/pages/SecurityCenter'

export const Route = createFileRoute('/auth/security')({ component: SecurityCenter })
