import { createFileRoute } from '@tanstack/react-router'
import AccountsPayable from '@/features/business-dashboard/accounts-payable/pages/AccountsPayable'

/**
 * business-dashboard/accounts-payable.tsx — Accounts Payable & Supplier Management (Page 3.6).
 * Self-contained page with its own sidebar, header, and modal layer.
 * Renders at /business-dashboard/accounts-payable
 */
export const Route = createFileRoute('/business-dashboard/accounts-payable')({
  component: AccountsPayable,
})
