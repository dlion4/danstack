import React, { useState, useEffect, useRef } from 'react';
import { 
  Hexagon, ChevronDown, Layers, ArrowLeftRight, Send, Coins, CreditCard, 
  ShieldCheck, Building2, Globe, Plane, LayoutGrid, TrendingUp, BookOpen, 
  Code2, Webhook, Clock, Newspaper, FileText, Info, Mail, Search, Menu, X, 
  ArrowRight, Twitter, Github, Linkedin, MessageSquare 
} from 'lucide-react';

export default function Header() {
  const [activePanel, setActivePanel] = useState(null);
  const [isPinnedByClick, setIsPinnedByClick] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accordionState, setAccordionState] = useState({ product: false, solutions: false });

  const mouseInTriggersRef = useRef(false);
  const mouseInPanelRef = useRef(false);
  const panelTimeoutRef = useRef(null);

  // Dynamic Mouse Angle Tracker for Border Line Beam Effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const targets = document.querySelectorAll('.nav-item, .panel-card, .btn-primary, .btn-secondary, .social-icon, .top-tab');
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (
          e.clientX >= r.left - 50 &&
          e.clientX <= r.right + 50 &&
          e.clientY >= r.top - 50 &&
          e.clientY <= r.bottom + 50
        ) {
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          el.style.setProperty('--mx', `${x}px`);
          el.style.setProperty('--my', `${y}px`);

          const cx = x - r.width / 2;
          const cy = y - r.height / 2;
          const angle = Math.atan2(cy, cx) * (180 / Math.PI) + 90;
          el.style.setProperty('--border-angle', `${angle}deg`);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Zero-Flicker State Machine Handlers
  const checkClosePanel = () => {
    if (panelTimeoutRef.current) clearTimeout(panelTimeoutRef.current);
    if (!mouseInTriggersRef.current && !mouseInPanelRef.current && !isPinnedByClick) {
      panelTimeoutRef.current = setTimeout(() => {
        if (!mouseInTriggersRef.current && !mouseInPanelRef.current && !isPinnedByClick) {
          setActivePanel(null);
        }
      }, 250);
    }
  };

  const handleTriggerMouseEnter = (panelName) => {
    mouseInTriggersRef.current = true;
    if (panelTimeoutRef.current) clearTimeout(panelTimeoutRef.current);
    setActivePanel(panelName);
  };

  const handleTriggerMouseLeave = () => {
    mouseInTriggersRef.current = false;
    checkClosePanel();
  };

  const handleTriggerClick = (e, panelName) => {
    e.preventDefault();
    e.stopPropagation();

    if (activePanel === panelName) {
      if (isPinnedByClick) {
        setActivePanel(null);
        setIsPinnedByClick(false);
      } else {
        setIsPinnedByClick(true);
      }
    } else {
      setActivePanel(panelName);
      setIsPinnedByClick(true);
    }
  };

  const handlePanelMouseEnter = () => {
    mouseInPanelRef.current = true;
    if (panelTimeoutRef.current) clearTimeout(panelTimeoutRef.current);
  };

  const handlePanelMouseLeave = () => {
    mouseInPanelRef.current = false;
    checkClosePanel();
  };

  // Click Outside to Close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('#nav-zone') && !e.target.closest('#nav-panel')) {
        setActivePanel(null);
        setIsPinnedByClick(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActivePanel(null);
        setIsPinnedByClick(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {/* Backdrop behind open panel */}
      <div 
        className={`nav-backdrop ${activePanel ? 'open' : ''}`} 
        onClick={() => { setActivePanel(null); setIsPinnedByClick(false); }}
      />

      <header id="main-header" className="fixed top-0 left-0 right-0 z-50 pt-3 px-4 sm:px-6 transition-all duration-300">
        {/* Utility Live FX Ticker Top Bar */}
        <div id="top-bar" className="max-w-[1240px] mx-auto mb-2 overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5 text-xs text-white/50">
            <div className="hidden md:flex items-center gap-3 flex-1 overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LIVE FX
              </span>
              <div className="overflow-hidden max-w-md">
                <div className="fx-ticker">
                  <div className="fx-pair"><span class="text-white/60">USD/NGN</span><span className="text-white font-medium">1,520.50</span><span className="fx-change positive">+0.2%</span></div>
                  <div className="fx-pair"><span class="text-white/60">USD/KES</span><span className="text-white font-medium">128.75</span><span className="fx-change positive">+0.5%</span></div>
                  <div className="fx-pair"><span class="text-white/60">USD/GHS</span><span className="text-white font-medium">15.20</span><span className="fx-change negative">-0.1%</span></div>
                  <div className="fx-pair"><span class="text-white/60">EUR/XOF</span><span className="text-white font-medium">655.95</span><span className="fx-change positive">+0.0%</span></div>
                  <div className="fx-pair"><span class="text-white/60">USD/ZAR</span><span className="text-white font-medium">18.45</span><span className="fx-change positive">+0.3%</span></div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-1 mx-auto">
              <a href="/" className="top-tab active"><span className="border-ring"></span>Personal</a>
              <a href="/business" className="top-tab"><span className="border-ring"></span>Business</a>
              <a href="/developers" className="top-tab"><span className="border-ring"></span>Developers</a>
              <a href="/enterprise" className="top-tab"><span className="border-ring"></span>Enterprise</a>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                <span className="text-[11px] text-white/60 font-medium">Systems 100% Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Floating Capsule Header */}
        <div className="max-w-[1240px] mx-auto">
          <div className="glass-pill rounded-full px-4 py-2 flex items-center justify-between border border-white/10 shadow-2xl relative">
            
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group pl-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                <Hexagon className="w-5 h-5 text-slate-950 fill-slate-950" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg tracking-tight text-white leading-tight">Paymo</span>
                <span className="text-[9px] text-emerald-400 font-semibold tracking-wider uppercase -mt-0.5">BaaS Rails</span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className={`nav-zone hidden lg:block ${activePanel ? 'is-open' : ''}`} id="nav-zone">
              <nav className="flex items-center gap-1">
                {['product', 'solutions', 'developers', 'resources'].map((panelKey) => (
                  <button
                    key={panelKey}
                    className={`nav-trigger nav-item px-4 py-1.5 text-[13.5px] font-medium transition-colors ${
                      activePanel === panelKey ? 'is-active' : 'text-white/80 hover:text-white'
                    }`}
                    onMouseEnter={() => handleTriggerMouseEnter(panelKey)}
                    onMouseLeave={handleTriggerMouseLeave}
                    onClick={(e) => handleTriggerClick(e, panelKey)}
                  >
                    <span className="border-ring"></span>
                    {panelKey.charAt(0).toUpperCase() + panelKey.slice(1)}
                    <ChevronDown 
                      className={`w-3.5 h-3.5 text-white/50 menu-arrow transition-transform duration-300 ${
                        activePanel === panelKey ? 'rotate-180 text-emerald-400' : ''
                      }`} 
                    />
                  </button>
                ))}

                <a href="/pricing" className="nav-item px-4 py-1.5 text-[13.5px] font-medium text-white/80 hover:text-white">
                  <span className="border-ring"></span>
                  Pricing
                </a>
              </nav>

              {/* Invisible Hover Gap Bridge */}
              <div className="nav-bridge"></div>

              {/* Mega Dropdown Split Panel */}
              <div
                id="nav-panel"
                className={`nav-panel glass-panel rounded-2xl overflow-hidden shadow-2xl ${
                  activePanel ? 'open' : ''
                }`}
                onMouseEnter={handlePanelMouseEnter}
                onMouseLeave={handlePanelMouseLeave}
              >
                {/* PANE: Product */}
                <div className={`panel-pane ${activePanel === 'product' ? 'active' : ''}`}>
                  <div className="panel-split">
                    <div className="panel-featured">
                      <div className="vector-wave-bg"></div>
                      <svg className="animated-svg-wave" viewBox="0 0 200 200">
                        <path fill="none" stroke="#10b981" strokeWidth="1.5" d="M 10 80 Q 50 10 100 80 T 190 80" />
                        <path fill="none" stroke="#34d399" strokeWidth="1" d="M 10 110 Q 50 40 100 110 T 190 110" />
                        <path fill="none" stroke="#0ea5e9" strokeWidth="0.75" d="M 10 140 Q 50 70 100 140 T 190 140" />
                      </svg>
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">PAYMO CORE</span>
                        <h3 class="font-display font-bold text-white text-xl mt-3 leading-snug">Product Infrastructure</h3>
                        <p className="text-xs text-white/60 mt-1.5 leading-relaxed">Unified API engine connecting 40+ fiat & digital rails across Africa.</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase text-white/40 font-bold">Processed Volume</p>
                          <p className="text-sm font-bold text-white">$4.2 Billion+</p>
                        </div>
                        <a href="/platform" className="w-8 h-8 rounded-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 flex items-center justify-center transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-2 gap-2.5 bg-[#080c14]/50">
                      <a href="/platform" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-blue-500/15 border border-blue-500/25 text-blue-400"><Layers className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">Platform Overview</h4><p className="text-[11px] text-white/50 mt-0.5">One API for 40+ currencies & 30+ rails.</p></div>
                      </a>
                      <a href="/payments" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"><ArrowLeftRight className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">Accept Payments</h4><p className="text-[11px] text-white/50 mt-0.5">Cards, Mobile Money & USSD.</p></div>
                      </a>
                      <a href="/payouts" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-purple-500/15 border border-purple-500/25 text-purple-400"><Send className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">Global Payouts</h4><p className="text-[11px] text-white/50 mt-0.5">Instant mass payouts to accounts & wallets.</p></div>
                      </a>
                      <a href="/fx-treasury" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-amber-500/15 border border-amber-500/25 text-amber-400"><Coins className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">FX & Liquidity</h4><p className="text-[11px] text-white/50 mt-0.5">Competitive cross-border exchange rates.</p></div>
                      </a>
                      <a href="/virtual-cards" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-teal-500/15 border border-teal-500/25 text-teal-400"><CreditCard className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">Virtual Cards</h4><p className="text-[11px] text-white/50 mt-0.5">Issue USD & local Visa/Mastercards.</p></div>
                      </a>
                      <a href="/compliance" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-cyan-500/15 border border-cyan-500/25 text-cyan-400"><ShieldCheck className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">KYC & Fraud</h4><p className="text-[11px] text-white/50 mt-0.5">Automated identity & AML verification.</p></div>
                      </a>
                    </div>
                  </div>
                </div>

                {/* PANE: Solutions */}
                <div className={`panel-pane ${activePanel === 'solutions' ? 'active' : ''}`}>
                  <div className="panel-split">
                    <div className="panel-featured">
                      <div className="vector-wave-bg"></div>
                      <svg className="animated-svg-wave" viewBox="0 0 200 200">
                        <path fill="none" stroke="#10b981" strokeWidth="2" d="M 10 50 Q 80 150 190 50" />
                        <path fill="none" stroke="#0ea5e9" strokeWidth="1.2" d="M 10 90 Q 80 180 190 90" />
                      </svg>
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-500/30">SOLUTIONS</span>
                        <h3 className="font-display font-bold text-white text-xl mt-3 leading-snug">Tailored for Every Market</h3>
                        <p className="text-xs text-white/60 mt-1.5 leading-relaxed">Engineered specifically for banks, marketplaces & importers.</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                        <div><p className="text-[10px] uppercase text-white/40 font-bold">Active Rails</p><p className="text-sm font-bold text-white">16+ Countries</p></div>
                        <a href="/solutions" className="w-8 h-8 rounded-full bg-teal-500/20 hover:bg-teal-500 text-teal-400 hover:text-slate-950 flex items-center justify-center transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 gap-2 bg-[#080c14]/50">
                      <a href="/solutions/banks" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"><Building2 className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13.5px]">Financial Institutions & Banks</h4><p className="text-[11.5px] text-emerald-400/90 mt-0.5 font-medium">Core banking rails & clearing infrastructure.</p></div>
                      </a>
                      <a href="/solutions/merchants" className="panel-card">
                        <span class="border-ring"></span>
                        <div className="panel-card-icon bg-blue-500/15 border border-blue-500/25 text-blue-400"><Globe className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13.5px]">Global Merchants</h4><p className="text-[11.5px] text-emerald-400/90 mt-0.5 font-medium">Accept African payment methods globally.</p></div>
                      </a>
                      <a href="/solutions/traders" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-purple-500/15 border border-purple-500/25 text-purple-400"><Plane className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13.5px]">Cross-Border Traders & Importers</h4><p className="text-[11.5px] text-emerald-400/90 mt-0.5 font-medium">Seamless foreign exchange and FX settlement.</p></div>
                      </a>
                      <a href="/solutions/platforms" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-pink-500/15 border border-pink-500/25 text-pink-400"><LayoutGrid className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13.5px]">Platforms & Marketplaces</h4><p className="text-[11.5px] text-emerald-400/90 mt-0.5 font-medium">Mass automated payouts and multi-split collections.</p></div>
                      </a>
                      <a href="/solutions/smes" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-amber-500/15 border border-amber-500/25 text-amber-400"><TrendingUp className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13.5px]">Growing SMEs & Startups</h4><p className="text-[11.5px] text-emerald-400/90 mt-0.5 font-medium">All-in-one financial dashboard & corporate tools.</p></div>
                      </a>
                    </div>
                  </div>
                </div>

                {/* PANE: Developers */}
                <div className={`panel-pane ${activePanel === 'developers' ? 'active' : ''}`}>
                  <div className="panel-split">
                    <div className="panel-featured">
                      <div className="vector-wave-bg"></div>
                      <svg className="animated-svg-wave" viewBox="0 0 200 200">
                        <path fill="none" stroke="#0ea5e9" strokeWidth="2" d="M 10 100 Q 100 20 190 100 T 10 100" />
                      </svg>
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">DEV HUB</span>
                        <h3 className="font-display font-bold text-white text-xl mt-3 leading-snug">Developer First API</h3>
                        <p className="text-xs text-white/60 mt-1.5 leading-relaxed">Comprehensive REST API, webhooks & native SDKs.</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                        <div><p className="text-[10px] uppercase text-white/40 font-bold">API Status</p><p className="text-sm font-bold text-emerald-400">99.99% SLA</p></div>
                        <a href="/docs" className="w-8 h-8 rounded-full bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-slate-950 flex items-center justify-center transition-all"><ArrowRight className="w-4 h-4" /></a>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-2 gap-2.5 bg-[#080c14]/50">
                      <a href="/docs" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"><BookOpen className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">API Reference</h4><p className="text-[11px] text-white/50 mt-0.5">Interactive REST docs & Sandbox keys.</p></div>
                      </a>
                      <a href="/sdks" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-blue-500/15 border border-blue-500/25 text-blue-400"><Code2 className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">Official SDKs</h4><p className="text-[11px] text-white/50 mt-0.5">Node.js, Python, Go, PHP & Flutter.</p></div>
                      </a>
                      <a href="/webhooks" className="panel-card">
                        <span class="border-ring"></span>
                        <div className="panel-card-icon bg-purple-500/15 border border-purple-500/25 text-purple-400"><Webhook className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">Webhooks & Events</h4><p className="text-[11px] text-white/50 mt-0.5">Real-time payment state callbacks.</p></div>
                      </a>
                      <a href="/changelog" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-amber-500/15 border border-amber-500/25 text-amber-400"><Clock className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">Changelog</h4><p className="text-[11px] text-white/50 mt-0.5">Weekly release notes & API updates.</p></div>
                      </a>
                    </div>
                  </div>
                </div>

                {/* PANE: Resources */}
                <div className={`panel-pane ${activePanel === 'resources' ? 'active' : ''}`}>
                  <div className="panel-split">
                    <div className="panel-featured">
                      <div className="vector-wave-bg"></div>
                      <svg className="animated-svg-wave" viewBox="0 0 200 200">
                        <path fill="none" stroke="#8b5cf6" strokeWidth="2" d="M 10 30 Q 100 170 190 30" />
                      </svg>
                      <div>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-500/30">RESOURCES</span>
                        <h3 className="font-display font-bold text-white text-xl mt-3 leading-snug">Fintech Intelligence</h3>
                        <p className="text-xs text-white/60 mt-1.5 leading-relaxed">Industry insights & cross-border merchant guides.</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                        <div><p className="text-[10px] uppercase text-white/40 font-bold">Report 2026</p><p className="text-sm font-bold text-white">Download PDF</p></div>
                        <a href="/guides" className="w-8 h-8 rounded-full bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-slate-950 flex items-center justify-center transition-all"><ArrowRight className="w-4 h-4" /></a>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-2 gap-2.5 bg-[#080c14]/50">
                      <a href="/blog" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"><Newspaper className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">Fintech Blog</h4><p className="text-[11px] text-white/50 mt-0.5">In-depth market analyses.</p></div>
                      </a>
                      <a href="/guides" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-blue-500/15 border border-blue-500/25 text-blue-400"><FileText className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">Integration Guides</h4><p className="text-[11px] text-white/50 mt-0.5">Step-by-step API onboarding.</p></div>
                      </a>
                      <a href="/about" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-purple-500/15 border border-purple-500/25 text-purple-400"><Info className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">About Paymo</h4><p className="text-[11px] text-white/50 mt-0.5">Mission, team & investors.</p></div>
                      </a>
                      <a href="/contact" className="panel-card">
                        <span className="border-ring"></span>
                        <div className="panel-card-icon bg-amber-500/15 border border-amber-500/25 text-amber-400"><Mail className="w-4 h-4" /></div>
                        <div><h4 className="font-semibold text-white text-[13px]">Contact Sales</h4><p className="text-[11px] text-white/50 mt-0.5">Speak with infrastructure team.</p></div>
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right CTA Actions */}
            <div className="flex items-center gap-3 pr-1">
              <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/40">
                <Search className="w-3.5 h-3.5 text-white/40" />
                <span>Search docs...</span>
                <span className="px-1.5 py-0.2 bg-white/10 text-[10px] text-white/60 rounded">⌘K</span>
              </div>
              
              <a href="/login" className="hidden sm:inline-block text-xs font-semibold text-white/70 hover:text-white transition-colors px-2">Sign In</a>
              
              <a href="/contact" className="btn-primary">
                <span className="border-ring"></span>
                Talk to Sales
              </a>

              <button 
                onClick={() => setMobileOpen(true)} 
                className="lg:hidden w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"
              >
                <Menu className="w-4 h-4 text-white" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`mobile-menu bg-[#07090e] fixed inset-0 z-50 overflow-y-auto p-6 flex flex-col justify-between ${mobileOpen ? 'open' : ''}`}>
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">P</div>
              <span className="font-display font-bold text-lg text-white">Paymo</span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="py-6 space-y-4">
            <div>
              <button 
                onClick={() => setAccordionState(prev => ({ ...prev, product: !prev.product }))}
                className="w-full flex items-center justify-between text-left text-lg font-semibold text-white py-2"
              >
                Product <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${accordionState.product ? 'rotate-180' : ''}`} />
              </button>
              {accordionState.product && (
                <div className="pl-4 space-y-2 pt-2 text-sm text-white/60">
                  <a href="/platform" className="block py-1">Platform Overview</a>
                  <a href="/payments" className="block py-1">Accept Payments</a>
                  <a href="/payouts" className="block py-1">Global Payouts</a>
                </div>
              )}
            </div>

            <div>
              <button 
                onClick={() => setAccordionState(prev => ({ ...prev, solutions: !prev.solutions }))}
                className="w-full flex items-center justify-between text-left text-lg font-semibold text-white py-2"
              >
                Solutions <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${accordionState.solutions ? 'rotate-180' : ''}`} />
              </button>
              {accordionState.solutions && (
                <div className="pl-4 space-y-2 pt-2 text-sm text-white/60">
                  <a href="/solutions/banks" className="block py-1">Financial Institutions</a>
                  <a href="/solutions/merchants" class="block py-1">Global Merchants</a>
                  <a href="/solutions/traders" class="block py-1">Cross-Border Traders</a>
                </div>
              )}
            </div>

            <a href="/developers" className="block text-lg font-semibold text-white py-2">Developers</a>
            <a href="/resources" className="block text-lg font-semibold text-white py-2">Resources</a>
            <a href="/pricing" class="block text-lg font-semibold text-white py-2">Pricing</a>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 space-y-3">
          <a href="/signup" className="btn-primary w-full text-center justify-center">Get Started</a>
          <a href="/login" className="btn-secondary w-full text-center justify-center">Sign In</a>
        </div>
      </div>
    </>
  );
}
