import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { ShieldAlert, Info, ShieldCheck, Phone, Flag, Copy, Lock } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';
import { ErrorModal } from '../../../features/errors/components/ErrorModal';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-account-suspended')({
  component: ErrorAccountSuspended,
});

function ErrorAccountSuspended() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [traceId, setTraceId] = useState('');

  useEffect(() => {
    setTraceId('fraud_' + Math.random().toString(36).slice(2, 8) + '_x99');
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

  const copyTrace = () => {
    navigator.clipboard.writeText(traceId);
    addToast('Trace ID copied', 'Share with support', 'emerald');
  };

  const verifyActivity = () => {
    addToast('Verification started', 'Check your email for steps', 'emerald');
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#F87171] flex items-center justify-center text-white shadow-lg">
          <ShieldAlert size={20} />
        </div>
      }
      rightAction={
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Info size={16} />
          Why locked?
        </button>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-[28px] bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[44px] text-[#EF4444] relative">
            <ShieldAlert size={48} className="animate-lockPulse" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] font-bold text-[11px] uppercase tracking-wider mb-3">
            🔒 Account Restricted
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            Suspicious activity detected
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            Fraud prevention paused your account. Funds safe in vault. Verify your recent activity to unlock — this protects you.
          </div>

          {/* Alert */}
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3.5 flex gap-2.5 items-start text-left mt-4">
            <span className="text-[#EF4444] text-xl mt-0.5">⚠️</span>
            <div>
              <span className="font-bold text-[13px] block">Why this happened</span>
              <span className="text-[12px] text-[#4B5563] leading-relaxed mt-0.5">
                Unusual login from new device (IP: 192.168.1.42, Nairobi) + large transfer at 2:47 AM. Our AI flagged as suspicious.
              </span>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-2.5 text-[12px] text-left">
              <span className="font-bold block mb-1">🏦 Account status</span>
              <span className="text-[#4B5563]">Frozen • Read-only • No outbound</span>
            </div>
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-2.5 text-[12px] text-left">
              <span className="font-bold block mb-1">💰 Funds</span>
              <span className="text-[#4B5563]">KES 842,000 in vault • Safe • Accessible after unlock</span>
            </div>
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-2.5 text-[12px] text-left">
              <span className="font-bold block mb-1">📱 Device</span>
              <span className="text-[#4B5563]">iPhone 15 • iOS 17.2 • New to account</span>
            </div>
            <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-2.5 text-[12px] text-left">
              <span className="font-bold block mb-1">📍 Location</span>
              <span className="text-[#4B5563]">Nairobi, Kenya • IP: 192.168.1.42</span>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3.5 text-left mt-4">
            <span className="font-bold text-[12px] uppercase tracking-wider">Steps to unlock</span>
            <div className="flex gap-2.5 items-center py-2 border-b border-dashed border-[#E8E2D9] text-[13px]">
              <div className="w-6.5 h-6.5 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center flex-shrink-0">
                <span className="text-[#10b981] text-sm">1</span>
              </div>
              <div className="flex-1">
                <span className="font-bold">Verify email</span>
                <span className="text-gray-500"> — Click link we sent to you@company.com</span>
              </div>
            </div>
            <div className="flex gap-2.5 items-center py-2 border-b border-dashed border-[#E8E2D9] text-[13px]">
              <div className="w-6.5 h-6.5 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center flex-shrink-0">
                <span className="text-[#F59E0B] text-sm">2</span>
              </div>
              <div className="flex-1">
                <span className="font-bold">Confirm recent transactions</span>
                <span className="text-gray-500"> — Was this you? KES 500,000 transfer</span>
              </div>
            </div>
            <div className="flex gap-2.5 items-center py-2 text-[13px]">
              <div className="w-6.5 h-6.5 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center flex-shrink-0">
                <span className="text-[#6366F1] text-sm">3</span>
              </div>
              <div className="flex-1">
                <span className="font-bold">Upload ID (if needed)</span>
                <span className="text-gray-500"> — Quick selfie verification</span>
              </div>
            </div>
          </div>

          {/* Safe Message */}
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3 flex gap-2.5 items-start text-left mt-3">
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <span className="font-bold text-[13px] block">Your money is safe</span>
              <span className="text-[12px] text-[#4B5563] leading-relaxed mt-0.5">
                Funds frozen in vault, not lost. This is a security measure to protect your account from unauthorized access.
              </span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-3">
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
              🛡️ Funds safe
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
              🕐 Unlock in 5-10 min
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={verifyActivity}
              className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
            >
              <ShieldCheck size={18} />
              Verify My Activity
            </button>
            <button
              onClick={() => addToast('Emergency support paged', 'Team will call in 2 min', 'emerald')}
              className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Phone size={16} />
              Emergency Support
            </button>
            <button
              onClick={() => addToast('Fraud report logged', 'Our team will investigate', 'emerald')}
              className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Flag size={16} />
              Report Fraud
            </button>
          </div>
          <div className="text-gray-500 text-sm flex items-center gap-2">
            <span>🔍</span> Trace: <code className="bg-gray-100 px-1.5 py-0.5 rounded">{traceId}</code>
            <button onClick={copyTrace} className="p-1 hover:bg-gray-100 rounded">
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ErrorToast toasts={toasts} onRemove={removeToast} />

      {/* Info Modal */}
      <ErrorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Why account locked?"
        subtitle="Fraud protection"
        icon={<Lock size={24} />}
        iconBg="#FEF2F2"
        iconColor="#EF4444"
        actionButton={
          <button
            onClick={() => setShowModal(false)}
            className="w-full bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            Verify now
          </button>
        }
      >
        <p className="mb-2">
          Our AI detected <b>unusual patterns</b>: new device + large transfer at unusual time. This triggered automatic freeze to protect your funds.
        </p>
        <ul className="ps-3 mb-3 list-disc text-sm">
          <li>No funds lost — frozen in vault</li>
          <li>Quick verification unlocks in 5-10 min</li>
          <li>If this wasn't you, we'll investigate</li>
        </ul>
        <div className="p-3 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]">
          <span className="text-[#059669] mr-1">💡</span>
          <b>Tip:</b> Enable 2FA to reduce false positives.
        </div>
      </ErrorModal>

      <style>{`
        @keyframes rise {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes lockPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 18px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-lockPulse { animation: lockPulse 2s infinite; }
      `}</style>
    </ErrorLayout>
  );
}
