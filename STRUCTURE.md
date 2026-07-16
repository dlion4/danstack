# Paymo Frontend Structure Guide

> Living reference for how this TanStack Start + React app is organized, how to
> link routes/pages, and **how to keep 70+ pages from style-clashing**.

---

## 1. Folder Structure (what goes where)

```
src/
├── styles.css                         # GLOBAL only: Tailwind + body resets. Keep tiny.
│
├── components/
│   ├── homeLayout/                    # The persistent Home chrome components
│   │   ├── Header.jsx                 #   Renders ONCE in __root.tsx
│   │   ├── Footer.jsx                 #   Renders ONCE in __root.tsx
│   │   └── BackgroundCanvas.tsx       #   Renders ONCE in __root.tsx
│   │
│   └── LayoutStyles/
│       └── HomeLayout.css             # Chrome styles for ↑ above. Plain CSS.
│                                      #   Linked once in __root.tsx head.links.
│
├── features/                          # ONE folder per business domain
│   └── home/
│       ├── pages/
│       │   ├── Home.tsx               #   The big homepage (route "/")
│       │   ├── About.tsx
│       │   └── Homepage.tsx           #   (legacy business page — route "/business")
│       └── styles/
│           ├── homepage.module.css    #   CSS MODULE — scoped to Home.tsx only
│           └── Home.module.css        #   CSS MODULE — scoped to Homepage.tsx
│
└── routes/                            # TanStack FILE-BASED routing (source of truth)
    ├── __root.tsx                     # App shell: <html>, Header, <main>, Footer, providers
    ├── index.tsx                      # Maps URL "/"        → Home component
    └── business.jsx                   # Maps URL "/business" → Homepage component
```

---

## 2. The Three Layers of CSS (and why they don't clash)

| Layer | File | Scope | How loaded |
|-------|------|-------|------------|
| **Global** | `src/styles.css` | Whole app | Tailwind + base resets only. Linked in `__root.tsx`. |
| **Layout chrome** | `components/LayoutStyles/HomeLayout.css` | Header/Footer/nav | Plain class names OK — mounted once at root. Linked in `__root.tsx`. |
| **Page-specific** | `features/<feature>/styles/<name>.module.css` | ONE page only | **CSS Module** → class names auto-hashed. Imported by the page. |

### Why CSS Modules prevent clashes

A `.module.css` file is compiled so every class becomes unique:

```css
/* features/home/styles/homepage.module.css */
.heroTitle { color: white; }
```
```tsx
// features/home/pages/Home.tsx
import s from '../styles/homepage.module.css';
<h1 className={s.heroTitle}>...</h1>   // renders as class="_heroTitle_abc123"
```

Even if a `/pricing` page also has `.heroTitle`, the two never collide because
each is renamed. **This is the rule for all 70+ pages: ship a `.module.css`.**

---

## 3. How routing works (file-based)

Routes live in `src/routes/`. **The filename IS the URL** — no manual route table:

| File | URL |
|------|-----|
| `routes/index.tsx` | `/` |
| `routes/business.jsx` | `/business` |
| `routes/about.tsx` | `/about` |
| `routes/pricing.tsx` | `/pricing` |
| `routes/solutions/banks.tsx` | `/solutions/banks` |

Each route file is 3 lines — it only wires a URL to a feature component:

```tsx
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import Homepage from '../features/home/pages/Home'

export const Route = createFileRoute('/')({ component: Homepage })
```

After adding/removing a route file, regenerate the tree:
```bash
npm run generate-routes     # or: npx tsr generate
```
(The dev server usually auto-regenerates; run this manually if a route isn't picked up.)

---

## 4. How pages get the nav + footer (the Home Layout)

The persistent chrome lives in `__root.tsx` (the **root route**). Every page is
rendered inside it through the `{children}` outlet:

```
__root.tsx  (RootDocument shell)
├── BackgroundCanvas        ← ambient effect
├── Header                  ← nav, always visible
├── QueryClientProvider
│   └── <main> {children}   ← active page lands here
└── Footer                  ← footer, always visible
```

**So a page component should NEVER render its own `<nav>` or `<footer>`** —
those come from the root. A page just renders its own content (hero, sections,
forms, etc.). If you ever see two navs, it's because a page re-rendered one —
remove it from the page.

### Optional: a second layout

If later you want pages WITHOUT the Home chrome (e.g. an app dashboard, a login
screen), add a **pathless layout route**:

```
routes/
├── __root.tsx          # bare shell (no Header/Footer)
├── (home)/             # ← layout group: pages that WANT Home chrome
│   ├── _home.tsx       #   renders Header + <Outlet/> + Footer
│   ├── index.tsx       #   /
│   └── about.tsx       #   /about
└── (app)/              # ← layout group: dashboard chrome instead
    ├── _app.tsx
    └── dashboard.tsx   #   /dashboard
```

The `(name)` folders are ignored in the URL; `_name.tsx` files act as layouts.

---

## 5. Adding a new page (step-by-step recipe)

Goal: add `/pricing`.

1. **Component + scoped styles** (feature-first):
   ```
   src/features/pricing/
   ├── pages/Pricing.tsx
   └── styles/pricing.module.css
   ```
2. **Pricing.tsx**
   ```tsx
   import s from '../styles/pricing.module.css';
   export default function Pricing() {
     return <div className={s.page}>…</div>;
   }
   ```
3. **Route file** maps URL → component:
   ```tsx
   // src/routes/pricing.tsx
   import { createFileRoute } from '@tanstack/react-router';
   import Pricing from '../features/pricing/pages/Pricing';
   export const Route = createFileRoute('/pricing')({ component: Pricing });
   ```
4. **Regenerate** (if dev server didn't): `npm run generate-routes`
5. **Link to it** from anywhere — use TanStack `<Link>` for SPA nav:
   ```tsx
   import { Link } from '@tanstack/react-router';
   <Link to="/pricing">Pricing</Link>
   ```
   (The Header uses plain `<a href>` today; swap to `<Link>` for client-side speed.)

The page automatically inherits Header + Footer from `__root.tsx`. No extra wiring.

---

## 6. Linking between pages

```tsx
import { Link } from '@tanstack/react-router';

// Client-side navigation (preferred — no full reload)
<Link to="/pricing">Pricing</Link>
<Link to="/solutions/banks">Banks</Link>

// Programmatic (after a form submit, etc.)
import { useNavigate } from '@tanstack/react-router';
const navigate = useNavigate();
navigate({ to: '/dashboard' });
```

---

## 7. Recommended optimizations for TanStack Start

These are not done yet — pick what fits:

1. **Code-split per route automatically.** File-based routing already lazy-loads
   each `routes/*.tsx`. Keep page components large-but-isolated; they're split for you.
2. **`defaultPreload: 'intent'`** is already on (see `router.tsx`) — links preload
   on hover. Good.
3. **Colocate page data with the route** using `loader` instead of `useQuery`
   for initial server render:
   ```tsx
   export const Route = createFileRoute('/pricing')({
     component: Pricing,
     loader: () => fetchPricing(),          // runs SSR + caches
   });
   // inside component: Route.useLoaderData()
   ```
4. **Shared UI primitives** — if you repeat the same "glass card", "kicker",
   "section" markup across pages, lift them into `src/components/ui/` as small
   reusable components styled with Tailwind. That cuts CSS-module bloat.
5. **Consolidate design tokens** — put brand colors in `styles.css` under
   `@theme { --color-paymo: #10b981; }` (Tailwind v4 syntax) so every page/theme
   file can use `--color-paymo` instead of repeating hex codes.
6. **Feature folders scale** — keep one folder per domain (`features/pricing`,
   `features/payments`, `features/dashboard`). Never dump all pages in one dir.
7. **Drop the legacy `.jsx` route + `main.tsx`** once unused — `routes/main.tsx`
   is flagged by the route generator as "no Route export" and `routes/business.jsx`
   duplicates logic; migrate them to `.tsx` feature files + route files.

---

## TL;DR cheat sheet

- **Global base** → `src/styles.css` (Tailwind + resets only)
- **Nav/footer look** → `components/LayoutStyles/HomeLayout.css` (linked in `__root.tsx`)
- **One page's styles** → `features/<x>/styles/<x>.module.css` (CSS Module = no clash)
- **URL → page** → a 3-line file in `routes/`, then `npm run generate-routes`
- **Pages get chrome for free** via `__root.tsx` — never add nav/footer inside a page
- **Link pages** → `<Link to="/x">` from `@tanstack/react-router`
