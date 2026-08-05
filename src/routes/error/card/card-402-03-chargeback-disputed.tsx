import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Flag, Info, Zap, ArrowUpRight, Home, ShieldAlert, History } from 'lucide-react';
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';
import { ErrorModal } from '../../../features/errors/components/ErrorModal';
import styles from './card-402-03-chargeback-disputed.module.css';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/card/card-402-03-chargeback-disputed')({
  component: Card40203,
});

function Card40203() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);

  const addToast = (title: string, message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const submitEvidence = () => {
    addToast('Submit Evidence', 'CARD-402-03 logged', 'info');
  };

  const acceptChargeback = () => {
    addToast('Accept Chargeback', 'Opening', 'emerald');
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center text-white shadow-lg">
          <Flag size={20} />
        </div>
      }
      rightAction={
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] font-bold text-[10px]">CARD-402-03</span>
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Info size={16} />
            Why?
          </button>
        </div>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Top Line */}
        <div className="h-[5px] bg-gradient-to-r from-[#0EA5E9] to-[#0284C7]"></div>

        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-3.5 rounded-[28px] bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[44px] text-[#0EA5E9] relative">
            <div className="absolute inset-0 rounded-[28px] border border-[#BAE6FD] animate-pulse"></div>
            <Flag size={48} className="animate-float" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] font-bold text-[11px] uppercase tracking-wider mb-3">
            <History size={14} />
            Cards • Chargeback • Disputed
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[22px] font-bold mb-2">
            Chargeback Initiated / Disputed Transaction
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            Customer disputes $120 transaction — card hold KES 15k pending dispute 7-14 days.
          </div>

          {/* Reason */}
          <div className="bg-[#F0F9FF] border border-[#BAE6FD] border-l-4 border-l-[#0EA5E9] rounded-xl p-3.5 flex gap-2.5 items-start text-left mt-4">
            <Info size={24} className="text-[#0EA5E9]" />
            <div>
              <span className="font-bold text-[13px] block">What happens next?</span>
              <span className="text-[12px] text-[#4B5563] leading-relaxed mt-1 block">
                Dispute DIS_9012 filed 2026-08-01 for $120 Amazon — customer says not received. Amount held pending 7-14 day scheme review.
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 text-left">
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Dispute ID</span>
              <span className="text-[12px] text-[#4B5563]">DIS_9012</span>
            </div>
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Amount Held</span>
              <span className="text-[12px] text-[#4B5563]">KES 15,000</span>
            </div>
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3">
              <span className="font-bold text-[11px] uppercase tracking-wider block">Filed</span>
              <span className="text-[12px] text-[#4B5563]">2026-08-01</span>
            </div>
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3">
              <span className="font-bold text-[11px] uppercase tracking-wider block">ETA</span>
              <span className="text-[12px] text-[#4B5563]">7-14 days</span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-2">
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold text-[11px]">
              <ShieldCheck size={12} className="inline mr-1" />
              Vault safe • Queued
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] font-bold text-[11px]">
              <History size={12} className="inline mr-1" />
              Pending • Info hold
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={submitEvidence}
            className="bg-[#0EA5E9] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <Zap size={18} />
            Submit Evidence
          </button>
          <button
            onClick={acceptChargeback}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <ArrowUpRight size={18} />
            Accept Chargeback
          </button>
          <Link
            to="/"
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2 no-underline"
          >
            <Home size={16} />
            Home
          </Link>
        </div>
      </div>

      {/* Toast Container */}
      <ErrorToast toasts={toasts} onRemove={removeToast} />

      {/* Info Modal */}
      <ErrorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Chargeback Initiated / Disputed Transaction"
        subtitle="Info Hold • Waiting"
        icon={<Flag size={24} />}
        iconBg="#F0F9FF"
        iconColor="#0EA5E9"
        actionButton={
          <button
            onClick={() => setShowModal(false)}
            className="w-full bg-[#0EA5E9] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            Got it
          </button>
        }
      >
        <p className="mb-2">
          Error after send — vault safe, retry safe, trace ID
        </p>
        <div className="p-3 rounded-2xl bg-[#FFFCF5] border border-[#E8E2D9]">
          <span className="font-bold text-[12px]">Trace:</span>{' '}
          <code className="bg-white border border-[#E8E2D9] px-1.5 py-0.5 rounded text-[11px]">card-402-03_xxx_KE</code> • Funds safe • No double charge
        </div>
      </ErrorModal>

      <style>{`
        @keyframes rise {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          70% { box-shadow: 0 0 0 18px rgba(14, 165, 233, 0); }
          100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse { animation: pulse 2s infinite; }
      `}</style>
    </ErrorLayout>
  );
}
