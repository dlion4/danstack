import { createFileRoute } from '@tanstack/react-router';
import Mfa from '../../features/authentication/pages/Mfa';

export const Route = createFileRoute('/auth/mfa')({ component: Mfa });
