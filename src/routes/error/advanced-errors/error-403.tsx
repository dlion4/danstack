import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Info, ShieldCheck, Ban, ArrowUp, Send, MessageCircle, X, Copy, Lock } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';
import { ErrorModal } from '../../../features/errors/components/ErrorModal';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-403')({
  component: Error403,
});

function Error403() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);

  const addToast = (title: string, message: string, type: Toast['type'] = 'red') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const copyPerm = () => {
    navigator.clipboard.writeText('cards:write');
    addToast('Copied', 'cards:write copied', 'emerald');
  };

  const upgrade = () => {
    addToast('Upgrade flow', 'Opening tier selector...', 'red');
    setTimeout(() => {
      window.location.href = '/billing';
    }, 800);
  };

  const requestAccess = () => {
    addToast('Access requested', 'Admin notified • 1-2 min', 'emerald');
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#F87171] flex items-center justify-center text-white shadow-lg">
          <ShieldCheck size={20} />
        </div>
      }
      rightAction={
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Info size={16} />
          Why blocked?
        </button>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-[28px] bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[42px] text-[#EF4444] relative">
            <span className="relative">
              <span className="absolute inset-0 rounded-[28px] bg-[#EF4444] opacity-0 animate-pulseRed"></span>
              <ShieldCheck size={48} />
            </span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] font-bold text-[11px] uppercase tracking-wider mb-3">
            <Ban size={14} />
            403 • Scope Required
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            You need extra permission
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed max-w-md mx-auto">
            Your API plan can't access <code className="bg-gray-100 px-1.5 py-0.5 rounded">/v2/virtual-cards</code>. Request the <b>cards:write</b> scope or upgrade tier — friendly guard, no data loss.
          </div>

          {/* Scope Box */}
          <div className="bg-[#FFFBFB] border border-[#FECACA] rounded-xl p-4 mt-4.5 text-left">
            <div className="flex justify-between items-center mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] font-bold text-[11px] uppercase">
                ⚠️ Insufficient scope
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold text-[11px]">
                <Lock size={12} />
                Protected
              </span>
            </div>
            <div className="font-mono bg-[#0F172A] text-[#E2E8F0] px-3 py-2.5 rounded-lg text-[13px] flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="text-sm">{'{ }'}</span>
                cards:write
              </span>
              <button
                onClick={copyPerm}
                className="px-2.5 py-1 rounded-lg border border-[#334155] bg-[#1E293B] text-white font-semibold text-[11px] hover:bg-[#334155] transition-colors flex items-center gap-1"
              >
                <Copy size={12} />
                Copy
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
              <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-2.5 text-[12px]">
                <span className="font-bold block mb-1">👤 Your plan</span>
                <span className="text-[#4B5563]">Starter — read-only cards. Can't create virtual cards.</span>
              </div>
              <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-2.5 text-[12px]">
                <span className="font-bold block mb-1">⬆️ Need?</span>
                <span className="text-[#4B5563]">Growth plan & cards:write scope. Takes 30 sec.</span>
              </div>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-4">
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
              ✓ No bypass
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
              🕐 Fix in 1 min
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={upgrade}
            className="bg-[#EF4444] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:bg-[#DC2626] hover:-translate-y-0.5 transition-all"
          >
            <ArrowUp size={18} />
            Upgrade Tier
          </button>
          <button
            onClick={requestAccess}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <Send size={18} />
            Request cards:write
          </button>
          <button
            onClick={() => addToast('Sales notified', 'Team will unlock scope', 'emerald')}
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Talk to Sales
          </button>
        </div>
      </div>

      {/* Toast Container */}
      <ErrorToast toasts={toasts} onRemove={removeToast} />

      {/* Info Modal */}
      <ErrorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Why 403?"
        subtitle="Friendly explainer"
        icon={<ShieldCheck size={24} />}
        iconBg="#FEF2F2"
        iconColor="#EF4444"
        actionButton={
          <button
            onClick={() => setShowModal(false)}
            className="w-full bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            Request access
          </button>
        }
      >
        403 means authenticated but not authorized. You logged in OK, but your plan lacks <code>cards:write</code>. It's like having building access but not vault key. Upgrade or request scope — no funds at risk.
      </ErrorModal>

      <style>{`
        @keyframes rise {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulseRed {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 18px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-pulseRed { animation: pulseRed 2s infinite; }
      `}</style>
    
    <style>{`
      :root {
        --theme-bg-gradient-1: #FEE2E2;
        --theme-bg-gradient-2: #D1FAE5;
      }
    `}</style>
</ErrorLayout>
  );
}
