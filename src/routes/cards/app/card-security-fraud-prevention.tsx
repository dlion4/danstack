import { createFileRoute } from '@tanstack/react-router'
import CardSecurityFraudPrevention from '@/features/card-dashboard/CardSecurityFraudPrevention/pages/CardSecurityFraudPrevention'

/**
 * app.card-security-fraud-prevention.tsx — Card Security & Fraud Prevention (Page 5.7)
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute('/cards/app/card-security-fraud-prevention')({
  component: CardSecurityFraudPrevention,
})