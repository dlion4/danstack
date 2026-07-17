import { createFileRoute } from '@tanstack/react-router'
import IdentityVerification from '../../features/authentication/pages/IdentityVerification'

export const Route = createFileRoute('/auth/identity')({ component: IdentityVerification })
