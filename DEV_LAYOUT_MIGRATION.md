# Developer Layout — Angular → TanStack React migration

**Repo:** `danstack` · **Stack:** Vite + React 19 + TypeScript + TanStack Router/Start + TanStack Query + Bootstrap 5 + CSS Modules
**Source (Angular):** `dashboard-dev-{layout,sidebar,header,aside,main}.{ts,html,css}`
**Result (React):** `src/features/Layouts/dashboard-dev-layout/` + routes under `src/routes/dev*`
**Validation:** `tsc --noEmit` clean for the whole dev layout + routes · `npm run build` = exit 0 · SSR `GET /dev` and `/dev/<module>` = **200, no runtime errors** (shell chrome server-rendered; home/module content hydrates client-side exactly like the cards shell).

This layout was built **in the exact same manner, design and structure** as the existing `dashboard-cards-layout` (the reference you pointed at), so the next layouts (`business`, `utility`) can be produced by the playbook at the bottom.

---

## 1. What was created

```
src/features/Layouts/dashboard-dev-layout/
  components/
    DevShell.tsx        ← composition + ALL interactive state (mirrors CardsShell)
    DevSidebar.tsx      ← collapsible nav, real router <Link>s (mirrors CardsSidebar)
    DevHeader.tsx       ← toggle + SANDBOX pill + search + 2 aside-openers + 2 dropdowns
    DevAside.tsx        ← right slide-in: System Status / API Explorer / API Keys
    DevToasts.tsx       ← toast stack (4.5s auto-dismiss)
  data/
    devLayoutContext.ts ← DevShellContext + useDevShell()  (showToast / openAside)
    devLayoutData.ts    ← types + initialMockData + fetchDevLayoutContent() + cx + findModule
  pages/
    DevHome.tsx         ← /dev home (hero + stats + module grid)
    DevModulePage.tsx   ← /dev/$module destination (hero + stats + features + empty-state)
  styles/
    devLayout.module.css← standalone shell CSS, SCOPED under .devRoot (+ shared helpers)

src/routes/
  dev.tsx               ← layout route  -> <DevShell/>            (path /dev)
  dev/index.tsx         ← index route   -> <DevHome/>             (path /dev/)
  dev/$module.tsx       ← dynamic route -> <DevModulePage/>       (path /dev/$module)
src/routeTree.gen.ts    ← regenerated (run `pnpm generate-routes`) so /dev* registers
```

## 2. Angular → React mapping

| Angular | React | Notes |
|---|---|---|
| `dashboard-dev-layout` (state: `sidebarExpanded`, `mobileOpen`, `openAsidePanel`, `activeSection`, `isDesktop`; `@HostListener` resize/keydown) | `DevShell.tsx` | All state → `useState`; `@HostListener` → `useEffect` (resize, Escape, **Ctrl/Cmd+B** toggle sidebar, click-outside via `[data-dropdown]`). SSR-safe defaults (`isDesktop=true`) to avoid hydration mismatch, synced on mount. |
| `dashboard-dev-sidebar` (navGroups, routerLinks) | `DevSidebar.tsx` + `navGroups` in `devLayoutData.ts` | Every link is a typed router `<Link>`: `dashboard` → `/dev`, others → `/dev/$module`. Active state derived from URL in the shell. |
| `dashboard-dev-header` (dropdowns, toasts, aside-openers) | `DevHeader.tsx` | Dropdown open-state lifted to the shell; click-outside + Escape handled there. `addToast`/`removeToast` → shell toast engine. Aside openers emit `apiExplorer` / `systemStatus`; user-menu "API Keys" emits `apiKeys`. |
| `dashboard-dev-aside` (3 panels) | `DevAside.tsx` | Panel visibility derived from `activePanel` (not DOM `.active` toggling). Panel actions call `onToast(...)`. |
| `dashboard-dev-main` (wrapper only — home markup was not in the upload) | `DevHome.tsx` / `DevModulePage.tsx` | Home/module visuals **reuse the shared** `src/features/shell/styles/dashboard.module.css` (`d.*` classes) — the same hero/stats/module-grid the cards home uses — so the look is consistent across dashboards. |

### Routing choice
The cards layout uses one static route file per module. For `dev` I used the repo's **dynamic-segment pattern** (already used by `transaction_dashboard/app.$section`): a single `/dev/$module` route renders `DevModulePage`, which looks the module up via `findModule`. This is type-safe, needs only 3 route files, and gives a friendly empty-state for unknown slugs. The home is the layout **index** (`/dev/`). `DevModulePage` pulls its content from `devLayoutData.modules` (13 fully-defined modules), so the layout is functional end-to-end today; when real per-module pages exist later, swap the `$module` route for static routes like cards does.

### The `--sh-*` token requirement (easy to miss)
The shared `shell/styles/dashboard.module.css` home visuals read CSS variables named `--sh-ink-0`, `--sh-accent`, `--sh-glass-bg`, etc. Those are **not** defined globally — the cards layout re-declares them on its own root. So `devLayout.module.css` **must** declare the same `--sh-*` set on `.devRoot`, otherwise the home hero/cards render un-coloured. The provided transform script does this automatically.

### CSS-module scoping approach
The 5 uploaded `*.css` files are **identical** (one standalone stylesheet, `ViewEncapsulation.None`). It was converted to a CSS module by `make_dev_css.py`:
- `:root { …tokens… }` → `.devRoot { …tokens… }` (tokens cascade to all descendants, incl. the reused `d.*` home visuals).
- The `.app-shell` layout block → `.devRoot { position: relative; min-height: 100vh; overflow-x: clip; font/background }` (cards-style; the chrome is `position: fixed`, the `<main>` uses `margin-left/top` that flip with `.sidebar-expanded`).
- **Dropped** the global element/universal/scrollbar rules (`*{}`, `html,body{}`, `body{}`, `::-webkit-scrollbar*`) — in a CSS module these would otherwise leak onto every page in the app.
- Appended shared button/badge helpers (`btnPrimary`, `btnGhost`, `btnLink`, `btnDanger`, `textGradient`, `badgeMini`, `badgeSoft`, `menuItem`) re-themed to the dev `--paymo-*` tokens, plus a `pulseDot` keyframe for the SANDBOX dot.
- Class names stay **kebab-case** (e.g. `top-header`, `nav-link`); components read them as `s['top-header']` via `const s = styles as Record<string,string>`.

## 3. Gotchas hit (so you don't repeat them)
1. **Block comments must not contain `*/`.** A comment like `/* …dashboard-dev-*/*.ts… */` closes early at the `*` `/` in `dev-*` `/` and cascades into hundreds of parse errors. (The cards equivalent `layout/*.ts` is `/*`, which is safe — only `*/` is fatal.)
2. **Don't wrap the reused home in the shell's loading gate incorrectly.** The shell shows a spinner while the layout query is `isLoading`; the pages themselves use `data ?? initialMockData`, so on the client they render immediately after the fetch falls back. SSR therefore shows the chrome + spinner, then the client paints the home (same as cards).
3. **Use the `@/*` alias for the shared shell CSS** (`@/features/shell/styles/dashboard.module.css`) — `vite.config.ts` has `resolve.tsconfigPaths: true`, so it works in both `tsc` and the build, and avoids relative-path depth mistakes (the cards home's `../../shell/...` is actually one `../` short; it only "works" because that file is currently unused/uncompiled).
4. **CSS-module compound selectors** (`.sidebar.expanded .brand-text`, `.right-aside.open`, `.aside-panel-content.active`, `.status-dot.warning`, …) compile fine — both classes get hashed; just apply both via `cx(s['right-aside'], open && s.open)`. Tone classes like `s[n.tone]` / `s.active` / `s.show` / `s.open` / `s.warning` all exist because they appear as selector tokens.

---

# 4. PLAYBOOK — build the next layouts (`business`, `utility`) the same way

Repeat per layout; substitute `<x>` = `business` | `utility` and `<X>` = `Business` | `Utility`.

1. **Drop the uploaded Angular files** for the layout into `/uploads` (`dashboard-<x>-{layout,sidebar,header,aside,main}.{ts,html,css}`).
2. **Copy the dev layout folder** as the scaffold:
   `cp -r src/features/Layouts/dashboard-dev-layout src/features/Layouts/dashboard-<x>-layout`
   then rename identifiers `Dev→<X>`, `dev→<x>` (file names + `DevShell/DevSidebar/…`, `devLayoutData/Context/css`, query keys `dev-layout-content`→`<x>-layout-content`, the fetch URL `/api/dev-layout-content`→`/api/<x>-layout-content`, the context hook `useDevShell`→`use<X>Shell`).
3. **Port the data** from the uploaded `dashboard-<x>-sidebar.ts` (`navGroups`), `dashboard-<x>-header.ts` (`notifications`, search placeholder, aside-opener names), `dashboard-<x>-aside.html` (the right-aside panels → `<X>Aside.tsx`, and set `AsideKind` to the panel ids the header opens), and `dashboard-<x>-sidebar.html` (`brand`, account). Define a `modules: ModuleDef[]` entry per nav key (hero `pill/titlePre/titleAccent/copy`, `c1/c2` gradient, 4 `stats`, 4 `features`, 2 `actions`) so the home grid + module pages render richly — copy the dev file's shape.
4. **Generate the CSS module** from the uploaded standalone stylesheet (all 5 css are identical — use any one):
   `python3 make_dev_css.py` after editing its two paths (`src` → the chosen uploaded css, `dest` → `…/dashboard-<x>-layout/styles/<x>Layout.module.css`) and the root class name (`.devRoot`→`. <x>Root`, used in the `replace(':root {', '.<x>Root {')` line and the injected layout block). The script already drops the global rules and appends `--sh-*` + helpers. **Re-run the assertions**; if a new layout's CSS introduces top-level element selectors you want to keep, scope them under the root instead of deleting.
5. **Re-theme if the palette differs:** the helpers use `--paymo-*`; if the layout's `:root` uses different token names, either map them onto `--paymo-*` in the root block or rename in the helper block. The chrome (sidebar/header/aside) reads `--paymo-*`, `--text`, `--border`, etc., so keep those names present in the root.
6. **Create the 3 route files** mirroring `src/routes/dev{.tsx,/index.tsx,/$module.tsx}` with paths `/ <x>`, `/ <x>/`, `/ <x>/$module`, importing `<X>Shell`, `<X>Home`, `<X>ModulePage`. Update the sidebar brand/account/home links and the home grid + header "view all" links to the new base path. Set the shell's `activeSection` derivation to the right segment index (`/<x>` base ⇒ `segments[1]`).
7. **Regenerate the route tree:** `pnpm generate-routes` (or let the Vite plugin do it on `dev`/`build`), then **validate:** `pnpm tsc --noEmit | grep dashboard-<x>-layout` (must be empty) and `pnpm build` (exit 0). Optionally boot `pnpm dev` and `curl --compressed localhost:3000/<x>` expecting `200` and the brand string in the HTML, with no `TypeError`/`Application error`.
8. **Watch the comment rule** (#1) in the new `*LayoutData.ts` header — don't write `*/*.ts` inside a `/* */` comment.

Following steps 1–8 reproduces exactly what was done for `dev`, in the same structure as `cards`.

## 5. Housekeeping note
`src/features/card-dashboard/VirtualDebitCards/` (PascalCase) is still an **orphan duplicate** no route references — safe to delete. The live page is the kebab-case `virtual-debit-cards/`.
