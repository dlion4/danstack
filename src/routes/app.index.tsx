import { createFileRoute } from '@tanstack/react-router';
import Dashboard from '../features/shell/pages/Dashboard';

export const Route = createFileRoute('/app/')({ component: Dashboard });
