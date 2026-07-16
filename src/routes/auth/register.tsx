import { createFileRoute } from '@tanstack/react-router';
import Register from '../../features/authentication/pages/Register';
// import Register from '../../../features/auth/pages/Register';

export const Route = createFileRoute('/auth/register')({ component: Register });
