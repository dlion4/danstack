import { createFileRoute } from '@tanstack/react-router'
import Support from '@/features/card-dashboard/support/pages/support'

/**
 * app.support.tsx — Card Support (Page 5.10 Part 2)
 * Child of routes/app.tsx, so it renders INSIDE the app shell.
 */
export const Route = createFileRoute('/cards/app/support')({
  component: Support,
})
