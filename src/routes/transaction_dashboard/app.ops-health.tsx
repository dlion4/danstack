import { createFileRoute } from '@tanstack/react-router'
import OpsSystem from '@/features/transaction-dashboard/system-health/pages/OpsSystem'

/**
 * app.mobile-money.tsx — Mobile Money & PSP.
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute('/transaction_dashboard/app/ops-health')({
  component: OpsSystem  ,
})
