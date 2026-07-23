import { createFileRoute } from '@tanstack/react-router'
import AccountSettings from '@/features/card-dashboard/account-settings/pages/account-settings'

/**
 * app.account-settings.tsx — Card Account & Settings (Page 5.10 Part 1)
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute('/cards/app/account-settings')({
  component: AccountSettings,
})
