import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Shield, Clock, CheckCircle2, Receipt, MessageCircle, ShieldCheck, Bell, Hourglass, Check } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-processing-hold')({
  component: ErrorProcessingHold,
});

function ErrorProcessingHold() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [elapsed, setElapsed] = useState('00:06:12');

  useEffect(() => {
    let sec = 372;
    const interval = setInterval(() => {
      sec++;
      const h = String(Math.floor(sec / 3600)).padStart(2, '0');
      const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      setElapsed(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addToast = (title: string, message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center text-white shadow-lg">
          <Shield size={20} />
        </div>
      }
      rightAction={
        <button
          onClick={() => addToast('Review queue', 'Your position: #3', 'info')}
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Clock size={16} />
          Review queue
        </button>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Top Line */}
        <div className="h-[5px] bg-gradient-to-r from-[#0EA5E9] to-[#10b981]"></div>

        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-[28px] bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[44px] text-[#0EA5E9] relative">
            <Shield size={48} className="animate-shieldFloat" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] font-bold text-[11px] uppercase tracking-wider mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9] animate-spin" style={{ animationDuration: '1.2s' }}></span>
            Security Review • Step 2/3
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            KES transfer flagged for routine check
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            Your transfer is safe in vault — not lost. Compliance verifying source of funds per CBK.
          </div>

          {/* Amount */}
          <div className="text-[20px] font-bold bg-[#FFFCF5] border border-[#E8E2D9] rounded-full px-4 py-1.5 inline-flex items-center gap-2 mt-2">
            <span className="text-[#10b981]">💱</span> KES 120,000.00 → M-Pesa ••••• 1230
          </div>

          {/* Stepper */}
          <div className="flex justify-between items-center relative mt-5 px-1">
            <div className="absolute top-4 left-4 right-4 h-[3px] bg-[#E5E7EB] rounded-[3px]"></div>
            <div className="absolute top-4 left-4 h-[3px] bg-gradient-to-r from-[#10b981] to-[#0EA5E9] rounded-[3px] w-[55%] animate-grow"></div>
            
            <div className="w-[34px] h-[34px] rounded-full bg-white border-2 border-[#E5E7EB] flex items-center justify-center font-bold text-[14px] relative z-10 done">
              <Check size={14} className="text-[#10b981]" />
            </div>
            <div className="w-[34px] h-[34px] rounded-full bg-[#F0F9FF] border-2 border-[#0EA5E9] flex items-center justify-center font-bold text-[14px] relative z-10 active">
              <span className="w-3.5 h-3.5 rounded-full bg-[#0EA5E9] animate-pulse"></span>
            </div>
            <div className="w-[34px] h-[34px] rounded-full bg-white border-2 border-[#E5E7EB] flex items-center justify-center font-bold text-[14px] relative z-10 text-gray-400">
              3
            </div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold text-[#4B5563]">
            <span className="text-[#059669]">Initiated</span>
            <span className="text-[#0EA5E9]">Verifying • 6 min</span>
            <span>Complete</span>
          </div>

          {/* Info Box */}
          <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-3.5 text-left mt-4">
            <span className="font-bold text-[13px] block flex items-center gap-1">
              <span className="text-[#0EA5E9]">ℹ️</span>
              What happens next?
            </span>
            <span className="text-[12px] text-[#4B5563] leading-relaxed mt-1 block">
              • Human verifies ID + transaction pattern (large amount + night) • Usually 1-4 hrs business • You'll get SMS + push when done • No action needed unless we ask for receipt
            </span>
          </div>

          {/* Timer Box */}
          <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3 flex justify-between items-center mt-3">
            <div>
              <span className="font-bold text-[11px] uppercase tracking-wider text-[#4B5563] block">In review for</span>
              <span className="font-bold text-[16px] flex items-center gap-1">
                <Hourglass size={16} />
                {elapsed}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#4B5563] block">Avg ETA</span>
              <span className="font-bold text-[#059669]">1h 22m • <span className="font-semibold text-[#4B5563]">noon today</span></span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold text-[11px]">
              🏦 Vault safe
            </span>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-3">
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
              <ShieldCheck size={12} className="inline mr-1" />
              CBK compliant
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
              <Bell size={12} className="inline mr-1" />
              Notify when done
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={() => addToast('Noted', 'We will notify via SMS + Push', 'emerald')}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <CheckCircle2 size={18} />
            Got it, back to home
          </button>
          <Link
            to="/transactions/txn_hold_120k"
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Receipt size={16} />
            View Transaction
          </Link>
          <button
            onClick={() => addToast('Compliance chat opened', 'Ask about hold — avg reply 3 min', 'emerald')}
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Chat Compliance
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
        @keyframes shieldFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes grow {
          from { width: 10%; }
          to { width: 55%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseInfo {
          70% { box-shadow: 0 0 0 12px rgba(14, 165, 233, 0); }
          100% { box-shadow: 0 0 0 6px rgba(14, 165, 233, 0.15); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-shieldFloat { animation: shieldFloat 3s ease-in-out infinite; }
        .animate-grow { animation: grow 1.4s ease; }
        .animate-pulse { animation: pulse 1.8s infinite; }
        .animate-spin { animation: spin 1.2s linear infinite; }
        .active { 
          background: #F0F9FF; 
          border-color: #0EA5E9; 
          color: #0EA5E9; 
          box-shadow: 0 0 0 6px rgba(14, 165, 233, 0.15); 
          animation: pulseInfo 1.8s infinite; 
        }
        .done { background: #10b981; border-color: #10b981; color: white; }
      `}</style>
    </ErrorLayout>
  );
}
