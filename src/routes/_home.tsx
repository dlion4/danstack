import { Outlet, createFileRoute } from '@tanstack/react-router'
import Header from '../components/homeLayout/Header'
import Footer from '../components/homeLayout/Footer'

/**
 * _home — Pathless LAYOUT route.
 * ----------------------------------------------------------------------------
 * Wraps every marketing/home page with the persistent Header + Footer chrome.
 * Auth pages live in `routes/auth/*` and are NOT children of this route, so they
 * render with zero chrome (bare shell from __root.tsx).
 *
 * URL impact: none. `_home` does not appear in the URL. Its children keep their
 * own paths (e.g. routes/_home/index.tsx -> "/", routes/_home/about.tsx -> "/about").
 */
export const Route = createFileRoute('/_home')({
  component: HomeLayout,
})

function HomeLayout() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-20">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
