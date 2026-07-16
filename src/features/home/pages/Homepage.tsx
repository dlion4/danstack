import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from '../../../routes/__root';
import styles from '../styles/home.module.css';
export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/business',
  component: HomePage,
});

export default function HomePage() {
  return (
    <div className="text-center px-4 max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
        Business & Enterprise Treasury Portal
      </div>
      <h1 className="font-display text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
        Next-Gen Corporate Treasury &{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
          Cross-Border FX
        </span>
      </h1>
      <p className="text-base md:text-lg text-white/60 leading-relaxed mb-8 max-w-2xl mx-auto">
        Issue corporate USD cards, perform real-time FX hedging, and automate mass vendor payouts across 30+ African clearing rails.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left my-10">
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
          <h3 className="text-white font-bold text-base mb-1">Virtual Cards</h3>
          <p className="text-xs text-white/50">Instant corporate cards for cloud tools & subscription management.</p>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
          <h3 className="text-white font-bold text-base mb-1">Mass Payouts</h3>
          <p className="text-xs text-white/50">Disburse funds to 10,000+ accounts in seconds with batch API.</p>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
          <h3 className="text-white font-bold text-base mb-1">Multi-Currency Accounts</h3>
          <p className="text-xs text-white/50">Hold USD, NGN, KES, GHS, EUR & ZAR balances locally.</p>
        </div>
      </div>
    </div>
  );
}
