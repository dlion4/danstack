import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Gauge, RefreshCw, Book, ArrowUpCircle, Lightbulb, Clipboard, Hourglass } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-429')({
  component: Error429,
});

function Error429() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [seconds, setSeconds] = useState(42);
  const [retryEnabled, setRetryEnabled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setRetryEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addToast = (title: string, message: string, type: Toast['type'] = 'emerald') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const copyRetry = () => {
    navigator.clipboard.writeText('Retry-After: 42');
    addToast('Header copied', 'Retry-After: 42', 'emerald');
  };

  const upgrade = () => {
    addToast('Sales notified', 'We will increase limit for growth plan', 'emerald');
  };

  const handleRetry = () => {
    if (retryEnabled) {
      addToast('Retrying', 'Sending queued requests...', 'emerald');
      setTimeout(() => window.location.reload(), 600);
    }
  };

  const formatTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg">
          <Gauge size={20} />
        </div>
      }
      rightAction={
        <button
          onClick={() => window.location.reload()}
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-[28px] bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center text-[42px] text-[#6366F1] relative">
            <Gauge size={48} className="animate-rev" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF2FF] border border-[#C7D2FE] text-[#4338CA] font-bold text-[11px] uppercase tracking-wider mb-3">
            ⚡ 429 • Slow down
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            You're moving too fast
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            Rate limit to protect ledger stability. Throttled for {seconds}s. Friendly guard — queued, not dropped.
          </div>

          {/* Stats */}
          <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-4 mt-4.5">
            <div className="flex justify-between text-[12px] font-bold mb-2">
              <span>Current limit</span>
              <span>100 req/sec</span>
            </div>
            <div className="h-3 bg-white border border-[#E8E2D9] rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full transition-all duration-1000"
                style={{ width: `${(seconds / 42) * 100}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-left">
              <div className="bg-white border border-[#E8E2D9] rounded-lg p-2">
                <span className="font-bold text-[11px] uppercase text-[#4B5563] block">Used</span>
                <span className="font-bold text-[13px]">127 / 100</span>
              </div>
              <div className="bg-white border border-[#E8E2D9] rounded-lg p-2">
                <span className="font-bold text-[11px] uppercase text-[#4B5563] block">Window</span>
                <span className="font-bold text-[13px]">1 sec sliding</span>
              </div>
              <div className="bg-white border border-[#E8E2D9] rounded-lg p-2">
                <span className="font-bold text-[11px] uppercase text-[#4B5563] block">Remaining</span>
                <span className="font-bold text-[13px]">0 • Reset {seconds}s</span>
              </div>
            </div>

            {/* Timer */}
            <div className="bg-[#0F172A] text-[#E2E8F0] rounded-xl p-3.5 flex justify-between items-center mt-3">
              <div>
                <div className="text-[11px] opacity-70 uppercase tracking-wider">Retry after</div>
                <div className="font-bold text-[22px] tabular-nums">{formatTime(seconds)}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-[11px] font-bold">
                🛡️ Auto-retry at 00:00
              </span>
              <button
                onClick={copyRetry}
                className="px-3 py-2 rounded-lg border border-[#334155] bg-[#1E293B] text-white font-semibold text-[11px] hover:bg-[#334155] transition-colors flex items-center gap-1"
              >
                <Clipboard size={12} />
                Retry header
              </button>
            </div>

            {/* Tip */}
            <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3 flex gap-2.5 items-start text-left mt-3">
              <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center flex-shrink-0">
                <Lightbulb size={16} />
              </div>
              <div>
                <span className="font-bold text-[13px] block">Pro tip to avoid 429</span>
                <span className="text-[12px] text-[#4B5563] leading-relaxed">
                  Use webhooks instead of polling <code className="bg-white px-1 py-0.5 rounded">/transactions</code>. Batch bulk payouts. Cache balance for 30s.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={handleRetry}
            disabled={!retryEnabled}
            className={`px-5 py-3 font-bold text-[14px] flex items-center gap-2 transition-all rounded-xl ${
              retryEnabled
                ? 'bg-[#10b981] text-white shadow-lg hover:-translate-y-0.5'
                : 'bg-[#6366F1] text-white opacity-60 cursor-not-allowed'
            }`}
          >
            {retryEnabled ? (
              <>
                <span className="text-lg">✓</span>
                Retry now
              </>
            ) : (
              <>
                <Hourglass size={18} />
                Retry in {seconds}s
              </>
            )}
          </button>
          <Link
            to="/docs/rate-limits"
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Book size={16} />
            Rate Policy
          </Link>
          <button
            onClick={upgrade}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <ArrowUpCircle size={18} />
            Increase limit
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
        @keyframes rev {
          from { transform: rotate(-18deg); }
          to { transform: rotate(18deg); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-rev { animation: rev 1.2s ease-in-out infinite alternate; }
      `}</style>
    
    <style>{`
      :root {
        --theme-bg-gradient-1: #E0E7FF;
        --theme-bg-gradient-2: #D1FAE5;
      }
    `}</style>
</ErrorLayout>
  );
}
