import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Hourglass, RefreshCw, Check, ShieldCheck, X, CheckCircle2, Search, LifeBuoy } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-408')({
  component: Error408,
});

function Error408() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: Toast['type'] = 'amber') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const verifiedRetry = () => {
    addToast('Retrying safely', 'Using same idempotency key to prevent double charge...', 'emerald');
    setTimeout(() => window.location.reload(), 900);
  };

  const checkStatus = () => {
    addToast('Checking ledger', 'Querying PSP for final status...', 'amber');
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white shadow-lg">
          <Hourglass size={20} />
        </div>
      }
      rightAction={
        <button
          onClick={() => window.location.reload()}
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Check
        </button>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-[28px] bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[44px] text-[#F59E0B] relative">
            <Hourglass size={48} className="animate-flip" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-bold text-[11px] uppercase tracking-wider mb-3">
            ⏱️ 408 • Request Timeout
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            Bank took too long to answer
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            3D-Secure or M-Pesa prompt timed out. No shame — networks lag. Verify before retry to avoid double charge.
          </div>

          {/* Timeline */}
          <div className="flex justify-between items-center relative mt-4.5 px-2">
            <div className="absolute top-3.5 left-5 right-5 h-[3px] bg-[#F3F4F6] rounded-[3px]"></div>
            <div className="absolute top-3.5 left-5 h-[3px] bg-gradient-to-r from-[#10b981] to-[#F59E0B] rounded-[3px] w-[64%] animate-prog"></div>
            
            <div className="text-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#E5E7EB] flex items-center justify-center text-[14px] relative done">
                <Check size={14} className="text-[#10b981]" />
              </div>
              <div className="text-[10px] font-bold mt-1.5 text-[#10b981]">SENT</div>
            </div>
            <div className="text-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#E5E7EB] flex items-center justify-center text-[14px] relative done">
                <ShieldCheck size={14} className="text-[#10b981]" />
              </div>
              <div className="text-[10px] font-bold mt-1.5 text-[#10b981]">VAULT OK</div>
            </div>
            <div className="text-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#FFFBEB] border-2 border-[#F59E0B] flex items-center justify-center text-[14px] relative active">
                <Hourglass size={14} className="text-[#F59E0B]" />
              </div>
              <div className="text-[10px] font-bold mt-1.5 text-[#F59E0B]">BANK WAIT</div>
            </div>
            <div className="text-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#E5E7EB] flex items-center justify-center text-[14px] relative">
                <X size={14} className="text-gray-400" />
              </div>
              <div className="text-[10px] font-bold mt-1.5 text-gray-400">TIMEOUT</div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-[#FFFBEB] border-l-4 border-[#F59E0B] rounded-r-xl p-3.5 flex gap-2.5 items-start text-left mt-4">
            <span className="text-[#F59E0B] text-xl mt-0.5">⚠️</span>
            <div>
              <span className="font-bold text-[13px] block">Safety check — mandatory</span>
              <span className="text-[12px] text-[#4B5563] leading-relaxed mt-0.5">
                Open your bank app / M-Pesa statement. If you see <b>KES pending</b>, don't retry yet. Wait 2 min.
              </span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-3.5">
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
              🛡️ No double-charge guard
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
              🕐 28s elapsed
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={verifiedRetry}
            className="bg-[#F59E0B] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:bg-[#D97706] hover:-translate-y-0.5 transition-all"
          >
            <CheckCircle2 size={18} />
            I've checked, retry
          </button>
          <button
            onClick={checkStatus}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <Search size={18} />
            Check Status
          </button>
          <Link
            to="/support?topic=timeout"
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <LifeBuoy size={16} />
            Help
          </Link>
        </div>
      </div>

      {/* Toast Container */}
      <ErrorToast toasts={toasts} onRemove={removeToast} />

      <style>{`
        @keyframes rise {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes flip {
          0% { transform: rotate(0deg); }
          45% { transform: rotate(180deg); }
          100% { transform: rotate(180deg); }
        }
        @keyframes prog {
          from { width: 0; }
          to { width: 64%; }
        }
        @keyframes pulseAm {
          0%, 100% { box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.18); }
          50% { box-shadow: 0 0 0 9px rgba(245, 158, 11, 0); }
          70% { box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.18); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-flip { animation: flip 2.2s ease-in-out infinite; }
        .animate-prog { animation: prog 2s ease; }
        .active { animation: pulseAm 1.6s infinite; }
        .done { background: #10b981; border-color: #10b981; color: white; }
      `}</style>
    
    <style>{`
      :root {
        --theme-bg-gradient-1: #FEF3C7;
        --theme-bg-gradient-2: #D1FAE5;
      }
    `}</style>
</ErrorLayout>
  );
}
