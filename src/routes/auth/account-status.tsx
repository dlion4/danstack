import { createFileRoute } from '@tanstack/react-router';
import AccountStatus from '../../features/authentication/pages/AccountStatus';

export const Route = createFileRoute('/auth/account-status')({ component: AccountStatus });
