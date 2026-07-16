/**
 * Route file (TanStack Start convention from STRUCTURE.md):
 * maps URL /login -> the Login feature component. 3 lines, nothing else.
 * Requires: npm i @tanstack/react-router (+ "tsr generate" to register).
 */
import { createFileRoute } from '@tanstack/react-router';
import Login from '../features/authentication/pages/Login';
// import Login from '../features/authentication/pages/Login';

export const Route = createFileRoute('/login')({ component: Login });
