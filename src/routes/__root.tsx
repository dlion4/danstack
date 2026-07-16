import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import appCss from '../styles.css?url'
import homeLayoutCss from '../components/LayoutStyles/HomeLayout.css?url'
import Header from '../components/homeLayout/Header'
import Footer from '../components/homeLayout/Footer'
import BackgroundCanvas from '../components/homeLayout/BackgroundCanvas'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false },
  },
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Paymo | Unified Banking & Payment Infrastructure for Africa',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'stylesheet',
        href: homeLayoutCss,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="relative min-h-screen bg-[#07090e] text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        {/* Ambient Particle Background */}
        <BackgroundCanvas />

        {/* Floating Capsule Header & Zero-Flicker Mega Dropdown */}
        <Header />

        {/* Main Route Body Outlet (Displays active page content) */}
        <QueryClientProvider client={queryClient}>
          <main className="min-h-screen pt-32 pb-20">
            {children}
          </main>
        </QueryClientProvider>

        {/* Global Footer */}
        <Footer />

        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
