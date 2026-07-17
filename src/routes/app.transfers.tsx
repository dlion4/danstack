import { createFileRoute } from '@tanstack/react-router';
import TransferOverview from '../features/transfers/pages/TransferOverview';
// import TransferOverview from '../features/transfers/pages/TransferOverview';

/**
 * app.transfers.tsx — Transfer Overview Command Center (Page 1.1).
 * Child of routes/app.tsx, so it renders INSIDE the app shell (sidebar +
 * top nav + right aside stay fixed; only this body swaps in).
 */
export const Route = createFileRoute('/app/transfers')({
  component: TransferOverview,
});
