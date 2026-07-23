import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * app.card-settings-support.tsx — Card Settings & Support (Page 5.10)
 * DEPRECATED: Split into /cards/app/account-settings and /cards/app/support
 * Redirects to /cards/app/account-settings for backward compatibility.
 */
export const Route = createFileRoute('/cards/app/card-settings-support')({
  beforeLoad: () => {
    throw redirect({ to: '/cards/app/account-settings' })
  },
})
