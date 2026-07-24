import { createFileRoute } from '@tanstack/react-router'
import VirtualAccounts from '@/features/business-dashboard/virtual-accounts/pages/VirtualAccounts'

/**
 * business-dashboard/virtual-accounts.tsx — Virtual Accounts & Sub-Accounts (Page 3.9).
 * Renders inside BusinessShell.
 * Mounts at /business-dashboard/virtual-accounts
 */
export const Route = createFileRoute('/business-dashboard/virtual-accounts')({
  component: VirtualAccounts,
})
