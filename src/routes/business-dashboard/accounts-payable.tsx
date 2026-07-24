import { createFileRoute } from '@tanstack/react-router'
import AccountsPayable from '@/features/business-dashboard/accounts-payable/pages/AccountsPayable'

/**
 * business-dashboard/accounts-payable.tsx — Accounts Payable & Supplier Management (Page 3.6).
 * Renders inside BusinessShell as a child route.
 * Mounts at /business-dashboard/accounts-payable
 */
export const Route = createFileRoute('/business-dashboard/accounts-payable')({
  component: AccountsPayable,
})
