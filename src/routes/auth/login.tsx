import { createFileRoute } from '@tanstack/react-router'
import Login from '../../features/authentication/pages/Login'

export const Route = createFileRoute('/auth/login')({ component: Login })
