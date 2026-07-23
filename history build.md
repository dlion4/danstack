Continuing with the final two pages — **3.2 Electricity** and **3.5 Mobile Money & Airtime**. Let me first verify the current state and read the two unread source files.



Good — the pattern is clear. Now let me read the two source files and the reference data/modals structure in parallel.



The CSS header is shared boilerplate. Let me locate where the actual body content and modals begin in both files.



Let me read the main body content of 3.2.html in chunks.



Now let me read the modal bodies in chunks to capture all functionality.



I have the full wizard detail and pattern. Let me get a compact map of the remaining modals (titles + tabs + action types).



Complete modal map captured for 3.2 (28 modals). Now let me confirm the kit's `doAction`/`body` API from settings and read the 3.5 source structure in parallel.



Kit API confirmed. Now let me map out 3.5 (Mobile Money & Airtime) the same way.



Let me check 3.5 for wizard step-flows, read its body content, and grab its JS data arrays.



Three 3-step wizards in 3.5. Let me read the body content and the wizard details.



I have comprehensive coverage. Let me grab the final details — 3.5's section 2.6.3 header, the 3 wizard step contents, and JS data arrays.



I now have complete coverage of both pages. Let me verify the available CSS classes by checking the generated water module, then generate CSS for both new pages.



All needed classes exist in the base+extras set. I'll render small status dots with inline styles (no new class needed). Let me create the folder structures and generate CSS for both pages.



CSS is ready for both. Now let me write the Electricity data file with all extracted content.



Now the Electricity page component.



Now the Electricity modals — all 28, fully functional via the shared kit.



Now the route. Let me mirror the existing water route.



Let me check the utility sidebar nav to confirm the route slugs match the nav keys.



Nav keys are `electricity` and `airtime`. Let me create the electricity route, then build the Mobile Airtime page (routed at `/utility/airtime`).



Now the Mobile Money & Airtime data file.



Now the Mobile Airtime page component.



Now the Mobile Airtime modals — all 26 functional.



Now the airtime route, then generate routes and start validation.



Now let me install dependencies, generate routes, and run the type check.



Routes registered. Now the type check (focused on the new files).



My new files are clean (zero errors matching my paths). Let me confirm the 223 errors are pre-existing in other files, not mine.



All 223 errors are in pre-existing files (Home, card-dashboard, transaction-dashboard, etc.) — none in my new electricity/mobile-airtime work. These don't block the esbuild-based production build. Let me run the build and the runtime checks.



Build passes. Now the runtime validation — start the dev server and curl the routes.



Dev server is up. Let me curl both new routes and run the error/marker checks.



No errors, both render fully. Let me verify section markers are present and run regression on the 4 existing utility pages.



The response has null bytes; let me strip them and re-grep with text mode.



All sections render on both new pages. Now regression-check the 4 existing utility pages, then stop the server.



All 6 pages validated with no regressions. Now let me update the playbook doc status and rebuild the cumulative ZIP.



Now let me rebuild the cumulative ZIP. First let me check the previous zip's structure to stay consistent.



Same structure. Let me rebuild the cumulative ZIP with all 6 pages, the shared kit, routes, doc, and tooling.



Everything is complete and validated. Let me present the final cumulative ZIP.



## ✅ All 6 utility deep-dive pages complete — 3.2 Electricity + 3.5 Mobile Money delivered & validated

The final two (and largest) sources are now refactored onto the shared modal kit, in the cream theme, fully responsive, with every modal functional.

### What I built this phase

**3.2 — Electricity Management** → `/utility/electricity` (`electricity/{pages,components,styles,data}`)
- Full body: hero + 3 stat cards, Attention/Smart Suggestions/Quick Actions, **4 sections** (Prepaid Tokens w/ clickable meter grid + alert feed + token summary + recent tokens; Postpaid w/ filter tabs All/Due/Paid/Dispute + billing snapshot + forecast/risk; Usage Analytics w/ 6-month chart + performance board + efficiency levers + portfolio directory; Automation/Outages/Household w/ auto-rules, outage feed, members, open cases) + transactions table.
- **28 functional modals**: 4 wizards (Buy Token, Pay Postpaid, Add Meter = 4-step; Bulk Pay = 3-step), 5 tabbed (Manage Meter, Auto-Top-Up, Usage Analytics, Dispute, Outage Tracker), 10 loading→receipt actions, 9 display/info (token vault xl, breakdown, tariff calc, forecast, notifications, health, compare, attention, profile).

**3.5 — Mobile Money & Airtime Hub** → `/utility/airtime` (`mobile-airtime/{pages,components,styles,data}`)
- Full body: M-Pesa wallet hero + 3 stat cards, Attention/Suggestions/Actions, **3 sections** (Airtime & Data line table; Interoperability + agent locator; M-Pesa Deep Integration suite = 6 `.map()` service cards) + transactions.
- **26 functional modals**: 3 wizards (Buy Airtime, Send Cross-Network, M-Pesa Global = 3-step), 4 tabbed (Buy Data networks, Agent Locator list/map, M-Shwari save/loan/lock with per-tab actions, KCB save/loan), 11 actions incl. multi-claim Tunukiwa, 6 display (analytics, history xl, notifications, profile, attention, receipt).

Both follow your exact rules: `pagename/{pages,components,styles,data}`, `className`/style-objects, Bootstrap grid intact, content extracted to `initialMockData` + `.map()`, vanilla Bootstrap JS bridged via the shared `useModals` React engine.

### Validation (3-way, all green)
- **tsc**: zero errors in any new file (`electricity`, `mobile-airtime`, `_shared`, `routes/utility`). The 223 remaining errors are all pre-existing in Home/card-dashboard/transaction-dashboard — none introduced by me.
- **`npm run build`**: exit 0 (3.76s).
- **Dev-server SSR**: `/utility/electricity` (179 KB) & `/utility/airtime` (99 KB) → HTTP 200, **all section markers present, zero runtime errors** (`TypeError`/`Cannot read properties`/`ReferenceError`/hydration = none). Regression on `/utility`, `/utility/water`, `/utility/internet`, `/utility/settings` = all clean.

### Deliverable
`danstack-utility-pages.zip` (cumulative — now the **complete 6/6 set**): all six deep-dive folders + `_shared/modalKit.tsx` + 7 routes + `DEV_LAYOUT_MIGRATION.md` (status now all ✅) + CSS tooling. Drop-in to `src/` of your repo.

Both new pages are wired to the utility sidebar (nav keys `electricity` / `airtime`) so highlighting and navigation work out of the box.