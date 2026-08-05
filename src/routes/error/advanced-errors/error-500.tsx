import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Cpu, RefreshCw, Home, LifeBuoy, Terminal, ShieldCheck, Bell } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-500')({
  component: Error500,
});

function Error500() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [traceId, setTraceId] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState(15);

  useEffect(() => {
    setTraceId('srv_' + Math.random().toString(36).slice(2, 9) + '_500');
    setTimestamp(new Date().toISOString());

    const timer = setInterval(() => {
      setRetrySeconds((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          addToast('Auto-retried', 'Re-checking now', 'emerald');
          setTimeout(() => window.location.reload(), 800);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addToast = (title: string, message: string, type: Toast['type'] = 'red') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const retryNow = () => {
    addToast('Retrying transaction', 'Using safe retry with same idempotency', 'emerald');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#F87171] flex items-center justify-center text-white shadow-lg">
          <Cpu size={20} />
        </div>
      }
      rightAction={
        <Link
          to="https://status.paymo.co"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
          Status
        </Link>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Server Bars Animation */}
          <div className="flex gap-2 justify-center items-end h-[86px] mx-auto mb-4">
            <div className="w-2.5 rounded-[6px] bg-gradient-to-b from-[#10b981] to-[#059669] animate-pulseBar" style={{ height: '38px' }}></div>
            <div className="w-2.5 rounded-[6px] bg-gradient-to-b from-[#10b981] to-[#059669] animate-pulseBar" style={{ height: '54px', animationDelay: '0.15s' }}></div>
            <div className="w-2.5 rounded-[6px] bg-gradient-to-b from-[#EF4444] to-[#F87171] animate-pulseBar" style={{ height: '84px', animationDelay: '0.3s' }}></div>
            <div className="w-2.5 rounded-[6px] bg-gradient-to-b from-[#10b981] to-[#059669] animate-pulseBar" style={{ height: '62px', animationDelay: '0.45s' }}></div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] font-bold text-[11px] uppercase tracking-wider mb-3">
            ⚠️ 500 • Critical • We know
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            Our servers hiccuped — vault safe
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            Something broke on our side. Engineering paged, ledger paused but funds secure in vault. Retry in a moment — no double charge.
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-2.5 text-[12px] text-left">
              <span className="font-bold block mb-1">🛡️ Funds</span>
              <span className="text-[#4B5563]">Safe in vault • No movement • Idempotent safe</span>
            </div>
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-2.5 text-[12px] text-left">
              <span className="font-bold block mb-1">🔔 Team</span>
              <span className="text-[#4B5563]">Notified 12s ago • On-call engaged • Fix ETA 4 min</span>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-[#0F172A] rounded-xl p-3.5 text-left relative overflow-hidden mt-4">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#EF4444] to-[#10b981]"></div>
            <div className="flex justify-between items-center text-[#94A3B8] text-[11px] uppercase tracking-wider font-bold mb-2">
              <span className="flex items-center gap-1">
                <Terminal size={14} />
                Technical trace
              </span>
              <button
                onClick={() => setShowTechDetails(!showTechDetails)}
                className="px-2 py-1 rounded-lg border border-[#334155] bg-[#1E293B] text-white font-semibold text-[11px] hover:bg-[#334155] transition-colors"
              >
                {showTechDetails ? 'Hide details' : 'Show details'}
              </button>
            </div>
            <div
              className={`font-mono text-[11.5px] text-[#94A3B8] leading-relaxed overflow-hidden transition-all duration-350 ${
                showTechDetails ? 'max-h-[300px]' : 'max-h-0'
              }`}
            >
              [INTERNAL_SERVER_ERROR] 500
              <br />
              Timestamp: {timestamp}
              <br />
              Trace: paymo_core_v2.transactions.engine.processor_exception
              <br />
              Caused by: <span className="text-[#F87171]">ConnectionTimeoutException</span> at socket_io:8080
              <br />
              Trace ID: {traceId}
              <br />
              User impact: none • Retriable: yes
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-3.5">
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
              🛡️ No funds moved
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
              🔄 Auto-retry in {retrySeconds}s
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={retryNow}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <RefreshCw size={18} />
            Retry Now
          </button>
          <Link
            to="/"
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Home size={16} />
            Back to Safety
          </Link>
          <button
            onClick={() => addToast('Support ticket opened', 'We linked trace ID — reply in &lt;5 min', 'emerald')}
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <LifeBuoy size={16} />
            Contact Support
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
        @keyframes pulseBar {
          0%, 100% { transform: scaleY(0.7); opacity: 0.7; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-pulseBar { animation: pulseBar 1.6s ease-in-out infinite; }
        .animate-pulse { animation: pulse 1.2s infinite; }
      `}</style>
    </ErrorLayout>
  );
}
