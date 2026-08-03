# Paymo BaaS — Home Page (Header + Body + Footer linked)

This package contains the **linked Paymo BaaS homepage**: the new refactored
Header is wired to the actual homepage body content (`Home.tsx`) and the new
themed Footer, with all unused files removed.

## What was done

1. **Linked the new Header** (`Header.tsx` + `Header.module.css`) — already
   refactored from the HTML prototype in the previous step.
2. **Linked the homepage body** (`Home.tsx` + `homepage.module.css`) — the
   full Paymo BAAS body sections (hero, problem, platform, use-cases,
   flow-engine, coverage, modules, developers, security, results, faq, cta)
   plus the Bootstrap offcanvas + modals + toast wrap.
3. **Created a new themed Footer** (`Footer.tsx` + `Footer.module.css`) —
   rebuilt to match the dark-green Paymo BaaS header theme.
4. **Stripped unused / duplicate code from `Home.tsx`**:
   - Removed `@tanstack/react-query` (page now uses static `initialMockData`
     — swap back to `useQuery` in production by re-adding the import).
   - Removed the inline `<footer>` block (replaced by the new themed
     `<Footer />` component).
   - Replaced the 6 image imports (`/public/assets/*.jpg`) with placeholder
     SVGs so the page renders without the actual photography assets.
5. **Removed unused files**:
   - `components/homeLayout/Footer.jsx` (old Tailwind/emerald-500 version)
   - `components/homeLayout/BackgroundCanvas.tsx` (three.js — not used by
     `Home.tsx`, which has its own 2D canvas particle network)
   - `components/LayoutStyles/HomeLayout.css` (only used by the old
     `Header.jsx`, which was already replaced)
   - `pages/About.tsx` (5-line stub)
   - `styles/Home.module.css` (unused)

## File map

```
paymo-home-linked/
├── app/
│   ├── layout.tsx              ← DM Sans + Space Grotesk fonts, dark-green body
│   └── page.tsx                ← <Header /> + <Home /> + <Footer />
├── components/
│   ├── Home.tsx                ← Homepage body sections (adapted)
│   └── homeLayout/
│       ├── Header.tsx          ← New refactored navbar
│       ├── Header.module.css
│       ├── Footer.tsx          ← NEW — themed footer matching the header
│       └── Footer.module.css
├── styles/
│   └── homepage.module.css     ← CSS module for Home.tsx body
├── public/
│   └── assets/
│       ├── dashboard-3d.svg    ← Placeholder (replace with real assets)
│       ├── fx-coins.svg
│       ├── hero-phone.svg
│       ├── network-globe.svg
│       ├── stock-coins.svg
│       └── stock-data.svg
└── screenshots/                ← Visual proof (desktop + mobile)
    ├── wired-desktop-top.png
    ├── wired-desktop-final.png
    ├── wired-footer-only.png
    ├── wired-mobile-top.png
    └── wired-footer-mobile-cta.png
```

## Footer design — matches the header

The new Footer mirrors every visual token of the new Header so the page
reads as one design system:

| Element                | Header                                     | Footer                                              |
| ---------------------- | ------------------------------------------ | --------------------------------------------------- |
| Brand color            | `#16a861` → `#0a8a4e` gradient             | Same gradient on `.btnPrimary`, `.brandMark`, `.newsletterBtn` |
| Surface background     | `#0a1a12` (surface-900)                    | Same `#0a1a12` background                            |
| Border treatment       | `1px solid rgba(22,168,97,0.08)` bottom    | `1px solid rgba(22,168,97,0.1)` top + glowing line  |
| Status badge           | "Systems 100% Operational" in ticker       | Same badge mirrored in the brand column              |
| Icon-box pattern       | 40×40 rounded squares, brand-tinted bg     | 38×38 social icons using same pattern                |
| Buttons                | `.btnPrimary` (gradient) + `.btnGhost`     | Identical classes re-used in footer CTA band         |
| Typography             | DM Sans body + Space Grotesk display       | Same font variables inherited from `layout.tsx`     |
| Top glow strip         | Bottom border of ticker bar                | Top border of footer (mirrored gradient line)        |

### Footer sections

1. **CTA band** — "Ready to build with Paymo?" + green primary + ghost button
2. **Brand column** — logo + tagline + status badge + email newsletter + 4 social icons
3. **Four link columns** — Products / Solutions / Developers / Resources
4. **Bottom bar** — copyright + email chip + Privacy/Terms/Compliance/Cookies links

## Responsive behaviour

| Viewport               | Header behaviour                                | Footer behaviour                                        |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| ≥ 1025px (desktop)     | Full nav, search box, hover dropdowns            | 5-col grid (1.6fr + 4 × 1fr), CTA side-by-side          |
| 721–1024px (tablet)    | Hamburger replaces desktop nav                   | 3-col grid (brand spans full width)                     |
| 481–720px (mobile L)   | Hamburger + drawer                               | 2-col grid, CTA stacks vertically                       |
| ≤ 480px (mobile S)     | Hamburger + drawer, status badge hidden          | 1-col stack, full-width CTA buttons, stacked newsletter |

## How to install in your project

1. Copy these into your repo (overwrite the existing files):
   - `components/homeLayout/Header.tsx` + `Header.module.css`
   - `components/homeLayout/Footer.tsx` + `Footer.module.css`
   - `components/Home.tsx`
   - `styles/homepage.module.css`
   - `app/layout.tsx` (or merge the font + body styles into your existing root layout)
   - `app/page.tsx`
   - `public/assets/*.svg` (or replace with your real photography)
2. Delete the old unused files:
   - `components/homeLayout/Footer.jsx`
   - `components/homeLayout/BackgroundCanvas.tsx`
   - `components/LayoutStyles/HomeLayout.css`
   - `pages/About.tsx` (stub)
   - `styles/Home.module.css`
3. Install deps:
   ```bash
   npm i bootstrap bootstrap-icons
   # (optionally also: npm i @tanstack/react-query)
   ```
4. (Production) To re-enable live API content, restore the TanStack Query
   block in `Home.tsx`:
   ```tsx
   import { useQuery } from "@tanstack/react-query";
   // ...
   const { data: apiData, error, isLoading } = useQuery({
     queryKey: ["paymo-home-content"],
     queryFn: fetchHomeContent,
     staleTime: 60_000,
     retry: 1,
   });
   ```
   And implement `GET /api/paymo-home` to return the same shape as
   `initialMockData`.

## Verification

Tested in a Next.js 16 dev server using `agent-browser`:

| Test                                              | Result |
| ------------------------------------------------- | ------ |
| Desktop 1440×900 — Header sticky, dropdowns open on hover | ✅ |
| Desktop — Home body sections render (hero, problem, platform, use-cases, flow-engine, coverage, modules, developers, security, results, faq, cta) | ✅ |
| Desktop — Footer CTA band + brand column + 4 link columns + bottom bar | ✅ |
| Mobile 390×844 — Hamburger replaces desktop nav, drawer slides in | ✅ |
| Mobile — Footer stacks: CTA → brand → links (2-col) → bottom bar | ✅ |
| Mobile 320×568 — No horizontal overflow, single-column footer | ✅ |
| ESLint                                            | clean (0 errors, 0 warnings) |
| Console errors                                    | none |
