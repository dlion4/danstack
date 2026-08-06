import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Search, ChevronRight, ArrowLeft, Flag, Compass } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-404')({
  component: Error404,
});

function Error404() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const suggestions = [
    { key: 'dashboard home overview', icon: '📊', label: 'Dashboard', desc: 'Overview & balances', href: '/', color: 'text-green-500' },
    { key: 'transfers send money', icon: '⇄', label: 'Transfers', desc: 'Send KES, USD', href: '/transfers', color: 'text-blue-500' },
    { key: 'cards virtual', icon: '💳', label: 'Virtual Cards', desc: 'Create & manage', href: '/cards', color: 'text-yellow-500' },
    { key: 'docs api', icon: '{ }', label: 'API Docs', desc: 'Integration guides', href: '/docs', color: 'text-purple-500' },
    { key: 'transactions history', icon: '📋', label: 'Transactions', desc: 'History & receipts', href: '/transactions', color: 'text-cyan-500' },
    { key: 'support help', icon: '🆘', label: 'Help Center', desc: 'Answers & chat', href: '/support', color: 'text-red-500' },
  ];

  const addToast = (title: string, message: string, type: Toast['type'] = 'emerald') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const reportLink = () => {
    addToast('Thanks for reporting', 'We logged this missing path — fixing!');
  };

  const filteredSuggestions = suggestions.filter((sug) =>
    sug.key.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === ''
  );

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white shadow-lg">
          <Compass size={20} />
        </div>
      }
      rightAction={
        <Link
          to="/"
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all"
        >
          Dashboard
        </Link>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Card Head */}
        <div className="p-7 sm:p-8 text-center relative">
          {/* Big 404 */}
          <div className="flex justify-center items-center gap-0 mb-4 relative">
            <span className="font-['Space_Grotesk'] text-[112px] font-bold leading-[0.85] tracking-[-6px] text-[#F5F1EC] relative z-0">
              404
            </span>
            <div className="absolute w-16 h-16 rounded-[20px] bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[28px] text-[#059669] animate-floaty z-10 shadow-lg">
              <Search size={32} />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold text-[11px] uppercase tracking-wider mb-3">
            📍 Page lost in vault
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[28px] font-bold mb-2">
            Lost at sea? Let's navigate
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed max-w-[520px] mx-auto mb-6">
            The page you looked for moved or never existed. Search or jump to a safe vault — your session stays intact.
          </div>

          {/* Search */}
          <div className="relative max-w-[480px] mx-auto mb-5.5">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Dashboard, Transfers, API Docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-[#E8E2D9] bg-[#FFFCF5] text-[14px] focus:outline-none focus:border-[#10b981] focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.12)] transition-all"
            />
          </div>

          {/* Suggestions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-left">
            {filteredSuggestions.map((sug) => (
              <Link
                key={sug.href}
                to={sug.href}
                className="flex gap-2.5 items-center p-3.5 rounded-xl border border-[#E8E2D9] bg-[#FFFCF5] hover:-translate-y-0.5 hover:border-[#10b981] hover:bg-white hover:shadow-lg transition-all no-underline text-inherit"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center flex-shrink-0">
                  <span className={`text-lg ${sug.color}`}>{sug.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-[13px] block">{sug.label}</span>
                  <span className="text-[11px] text-[#4B5563]">{sug.desc}</span>
                </div>
                <ChevronRight size={16} className="text-gray-400 ml-auto flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            <Link
              to="/"
              className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all no-underline"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Link>
            <button
              onClick={reportLink}
              className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Flag size={16} />
              Report broken link
            </button>
          </div>
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <span>🔐</span> Error ID: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{"404-{{404{{"}</code>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ErrorToast toasts={toasts} onRemove={removeToast} />

      <style>{`
        @keyframes rise {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes floaty {
          0%, 100% { transform: translateY(0) rotate(-6deg); }
          50% { transform: translateY(-14px) rotate(6deg); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-floaty { animation: floaty 3s ease-in-out infinite; }
      `}</style>
    
    <style>{`
      :root {
        --theme-bg-gradient-1: #D1FAE5;
        --theme-bg-gradient-2: #FEF3C7;
      }
    `}</style>
</ErrorLayout>
  );
}
