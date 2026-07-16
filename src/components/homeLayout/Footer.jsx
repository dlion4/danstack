import React from 'react';
import { Hexagon, Twitter, Github, Linkedin, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10 bg-[#05070a]/80 backdrop-blur-xl">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <Hexagon className="w-5 h-5 text-slate-950 fill-slate-950" />
              </div>
              <span className="font-display font-bold text-xl text-white">Paymo</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed max-w-sm">
              Licensed Banking-as-a-Service infrastructure providing real-time local collections, payouts, treasury and cards across Africa.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <a href="/twitter" className="social-icon"><span className="border-ring"></span><Twitter className="w-4 h-4" /></a>
              <a href="/github" className="social-icon"><span className="border-ring"></span><Github className="w-4 h-4" /></a>
              <a href="/linkedin" className="social-icon"><span className="border-ring"></span><Linkedin className="w-4 h-4" /></a>
              <a href="/discord" className="social-icon"><span className="border-ring"></span><MessageSquare className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Col 2: Products */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">Products</h5>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><a href="/platform" className="hover:text-white transition-colors">Platform Overview</a></li>
              <li><a href="/payments" className="hover:text-white transition-colors">Global Collections</a></li>
              <li><a href="/payouts" className="hover:text-white transition-colors">Instant Payouts</a></li>
              <li><a href="/virtual-cards" className="hover:text-white transition-colors">Virtual Cards</a></li>
              <li><a href="/fx" className="hover:text-white transition-colors">Treasury & FX</a></li>
            </ul>
          </div>

          {/* Col 3: Solutions */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">Solutions</h5>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><a href="/solutions/banks" className="hover:text-white transition-colors">Banks & PSPs</a></li>
              <li><a href="/solutions/merchants" className="hover:text-white transition-colors">Global Merchants</a></li>
              <li><a href="/solutions/traders" className="hover:text-white transition-colors">Cross-Border FX</a></li>
              <li><a href="/solutions/platforms" className="hover:text-white transition-colors">Marketplaces</a></li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">Resources</h5>
            <ul className="space-y-2.5 text-xs text-white/60">
              <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="/api" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="/trust" className="hover:text-white transition-colors">Trust & Security</a></li>
              <li><a href="/status" className="hover:text-white transition-colors">System Status</a></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© 2026 Paymo Technologies Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/security" className="hover:text-white transition-colors">Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
