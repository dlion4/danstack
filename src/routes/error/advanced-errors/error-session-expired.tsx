import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Clock, Info, LogIn, Smile, House, Save, ShieldCheck, Timer } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';
import { ErrorModal } from '../../../features/errors/components/ErrorModal';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-session-expired')({
  component: ErrorSessionExpired,
});

function ErrorSessionExpired() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);

  const addToast = (title: string, message: string, type: Toast['type'] = 'amber') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loginAgain = () => {
    addToast('Redirecting to login', 'Refreshing your session...', 'emerald');
    setTimeout(() => {
      window.location.href = '/login';
    }, 800);
  };

  const enableFaceId = () => {
    addToast('Face ID setup', 'Opening biometric enrollment...', 'emerald');
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-white shadow-lg">
          <Clock size={20} />
        </div>
      }
      rightAction={
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Info size={16} />
          Why?
        </button>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-[28px] bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[44px] text-[#F59E0B] relative">
            <Clock size={48} className="animate-tick" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] font-bold text-[11px] uppercase tracking-wider mb-3">
            ⏰ Session Expired
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            Banking session timed out
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            No activity for 15 minutes. Banking security policy. Your draft auto-saved — just sign in to continue.
          </div>

          {/* Auto-save */}
          <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3.5 flex gap-2.5 items-start text-left mt-4">
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center flex-shrink-0">
              <Save size={16} />
            </div>
            <div>
              <span className="font-bold text-[13px] block">Draft auto-saved</span>
              <span className="text-[12px] text-[#4B5563] leading-relaxed mt-0.5">
                Your transfer of <b>KES 45,000</b> to <b>M-Pesa •••• 1230</b> saved. Sign in to complete.
              </span>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-3.5 text-left mt-3">
            <span className="font-bold text-[12px] uppercase tracking-wider">15-minute idle policy</span>
            <div className="text-[13px] text-[#4B5563] mt-1 mb-2">
              Kenya CBK requires banking sessions to timeout after 15 min of inactivity. This protects your account.
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
                ✓ No funds lost
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
                ✓ Draft safe
              </span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-3">
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
              🛡️ Security first
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
              🕐 15 min idle
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={loginAgain}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <LogIn size={18} />
            Sign In Again
          </button>
          <button
            onClick={enableFaceId}
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Smile size={16} />
            Enable Face ID
          </button>
          <Link
            to="/"
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <House size={16} />
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
        title="Why session expires?"
        subtitle="Banking security"
        icon={<Timer size={24} />}
        iconBg="#FFFBEB"
        iconColor="#F59E0B"
        actionButton={
          <button
            onClick={() => setShowModal(false)}
            className="w-full bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            Sign in — I understand
          </button>
        }
      >
        <p className="mb-2">
          Kenya CBK requires <b>15-minute idle timeout</b> for all banking sessions. This prevents unauthorized access if you step away.
        </p>
        <ul className="ps-3 mb-3 list-disc text-sm">
          <li>Auto-saves your drafts</li>
          <li>Keeps funds in vault</li>
          <li>Quick sign-in resumes work</li>
        </ul>
        <div className="p-3 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]">
          <span className="text-[#059669] mr-1">💡</span>
          <b>Tip:</b> Enable Face ID to skip password on mobile.
        </div>
      </ErrorModal>

      <style>{`
        @keyframes rise {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes tick {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(12deg); }
          75% { transform: rotate(-12deg); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-tick { animation: tick 2s ease-in-out infinite; }
      `}</style>
    </ErrorLayout>
  );
}
