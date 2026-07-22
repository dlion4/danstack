/* ============================================================================
   PayMo BaaS — dashboard chrome paths

   These routes render their OWN dashboard chrome (rail sidebar + app header),
   exactly like your auth pages do. Import this in `src/routes/__root.tsx` and
   exclude these paths from the marketing Header / Footer / BackgroundCanvas
   the same way AUTH_PATHS is handled, e.g.:

     import { DASH_PATHS } from './transaction_dashboard/-dashboardPaths'

     const isBare = AUTH_PATHS.some(p => location.pathname.startsWith(p))
                 || DASH_PATHS.some(p => location.pathname.startsWith(p))
     // ...render <Outlet /> bare when isBare, else with site chrome
   ========================================================================== */

export const DASH_PATHS = [
  '/transaction_dashboard',
] as const

export type DashPath = (typeof DASH_PATHS)[number]
