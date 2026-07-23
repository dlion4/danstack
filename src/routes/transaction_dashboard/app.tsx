import { createFileRoute } from '@tanstack/react-router';
import AppShell from '@/features/shell/components/AppShell';

/**
 * app.tsx — LAYOUT route for the authenticated app shell.
 * ----------------------------------------------------------------------------
 * This route adds a "/app" path prefix so its children resolve to /app,
 * /app/transfers, /app/wallets etc. — no conflict with the _home "/" route.
 *
 * The AppShell (sidebar + top nav + right aside) wraps every /app/* page.
 * Auth pages live in routes/auth/* and are NOT children of this route.
 */
export const Route = createFileRoute('/transaction_dashboard/app')({
  component: AppLayout,
});

function AppLayout() {
  // AppShell renders its own <Outlet /> for child pages.
  return <AppShell />;
}
