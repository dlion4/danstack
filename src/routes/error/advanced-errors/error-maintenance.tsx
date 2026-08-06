import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Settings2, RefreshCw, TrendingUp, Info, Bell, Zap, ShieldCheck, Clock } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-maintenance')({
  component: ErrorMaintenance,
});

function ErrorMaintenance() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [progress, setProgress] = useState(75);
  const [eta, setEta] = useState('~12 min left');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev;
        return prev + Math.random() * 0.8;
      });
    }, 1800);

    const etaInterval = setInterval(() => {
      const mins = Math.max(2, Math.round((100 - progress) / 3));
      setEta(`~${mins} min left`);
    }, 1800);

    return () => {
      clearInterval(interval);
      clearInterval(etaInterval);
    };
  }, [progress]);

  const addToast = (title: string, message: string, type: Toast['type'] = 'emerald') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const subscribe = () => {
    addToast('You are subscribed', 'We will email when maintenance ends', 'emerald');
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white shadow-lg">
          <Settings2 size={20} />
        </div>
      }
      rightAction={
        <Link
          to="https://status.paymo.co"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
          Status: Maintenance
        </Link>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Top Line */}
        <div className="h-[5px] bg-gradient-to-r from-[#10b981] via-[#34D399] to-[#F59E0B]"></div>

        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-3.5 rounded-[28px] bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[44px] text-[#059669] relative">
            <Settings2 size={48} className="animate-gear" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-bold text-[11px] uppercase tracking-wider mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-spin" style={{ animationDuration: '1.2s' }}></span>
            Scheduled Maintenance
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            Upgrading ledger — back shortly
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            Core banking ledger upgrade for faster KES rails (2x speed). Funds safe frozen. No action needed — we'll notify.
          </div>

          {/* Progress */}
          <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-4 mt-4.5">
            <div className="flex justify-between text-[12px] font-bold mb-2">
              <span>Upgrade Progress</span>
              <span className="text-[#059669]">{Math.floor(progress)}%</span>
            </div>
            <div className="h-3 bg-white border border-[#E8E2D9] rounded-full overflow-hidden mb-2.5 relative">
              <div
                className="h-full bg-gradient-to-r from-[#10b981] to-[#34D399] rounded-full relative animate-shimmer"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-repeating-linear-gradient animate-moveStripes"></div>
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-[#4B5563] mt-2.5">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {eta}
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} />
                Vault locked safe
              </span>
            </div>

            {/* Changelog */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              <div className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D9] text-[11px]">
                <span className="font-bold block mb-1">⚡ Faster transfers</span>
                <span className="text-[#4B5563]">M-Pesa rail 1.8s → 0.9s</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E2D9] text-[11px]">
                <span className="font-bold block mb-1">🛡️ More secure</span>
                <span className="text-[#4B5563]">HSM key rotation done</span>
              </div>
            </div>

            {/* Subscribe */}
            <div className="flex gap-2 mt-3.5">
              <input
                type="email"
                placeholder="you@company.com — get notified when live"
                className="flex-1 px-3.5 py-3 rounded-xl border border-[#E8E2D9] bg-[#FFFCF5] text-[13px] focus:outline-none focus:border-[#10b981] focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.12)] transition-all"
              />
              <button
                onClick={subscribe}
                className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-4 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
              >
                <Bell size={18} />
                Notify Me
              </button>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-3.5">
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
              🏦 Funds safe • Read-only
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
              🕐 Started 18 min ago
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <RefreshCw size={18} />
            Check Status
          </button>
          <Link
            to="https://status.paymo.co"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <TrendingUp size={16} />
            Status Page
          </Link>
          <button
            onClick={() => addToast('Maintenance FAQ', 'Ledger frozen, no outbound but inbound queued', 'emerald')}
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Info size={16} />
            FAQ
          </button>
        </div>
      </div>

      {/* Toast Container */}
      <ErrorToast toasts={toasts} onRemove={removeToast} />

      <style>{`
        @keyframes rise {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes gear {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes moveStripes {
          to { transform: translateX(20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-gear { animation: gear 8s linear infinite; }
        .animate-shimmer { 
          background-size: 200% 100%; 
          animation: shimmer 2s infinite linear; 
          background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 10px, transparent 10px 20px);
        }
        .animate-moveStripes { animation: moveStripes 1s linear infinite; }
        .animate-pulse { animation: pulse 1.2s infinite; }
        .animate-spin { animation: spin 1.2s infinite; }
        .bg-repeating-linear-gradient {
          background-image: repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 10px, transparent 10px 20px);
        }
      `}</style>
    
    <style>{`
      :root {
        --theme-bg-gradient-1: #D1FAE5;
        --theme-bg-gradient-2: #FFFBEB;
      }
    `}</style>
</ErrorLayout>
  );
}
