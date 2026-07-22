import { createFileRoute } from '@tanstack/react-router'
import Compliance from '@/features/transaction-dashboard/compliance/pages/Compliance'

/**
 * app.compliance.tsx — Compliance & AML.
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute('/transaction_dashboard/app/compliance')({
  component: Compliance,
})
