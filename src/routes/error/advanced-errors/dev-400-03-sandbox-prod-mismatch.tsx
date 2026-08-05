import { createFileRoute } from '@tanstack/react-router';
import { Dev40003SandboxProdMismatch } from '../../../features/errors/components/Dev40003SandboxProdMismatch';

export const Route = createFileRoute('/error/advanced-errors/dev-400-03-sandbox-prod-mismatch')({
	component: Dev40003SandboxProdMismatch,
});
