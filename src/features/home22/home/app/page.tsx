"use client";

/**
 * page.tsx — Paymo BaaS homepage
 * ----------------------------------------------------------------------------
 * Wires together:
 *   - <Header />  from ./components/homeLayout/Header  (new refactored navbar)
 *   - <Home />    from ./components/Home                (homepage body sections)
 *   - <Footer />  from ./components/homeLayout/Footer  (new themed footer)
 *
 * The Home component renders all body sections (hero, problem, platform,
 * use-cases, flow-engine, coverage, modules, developers, security, results,
 * faq, cta) plus the Bootstrap offcanvas + modals + toast wrap. Its inline
 * footer has been stripped — replaced by the themed <Footer /> below.
 */

import Footer from "@/features/home/components/homeLayout/Footer";
import Header from "@/features/home/components/homeLayout/Header";
import Home from "@/features/home/components/Home";

export default function Page() {
  return (
    <>
      <Header />
      <Home />
      <Footer />
    </>
  );
}
