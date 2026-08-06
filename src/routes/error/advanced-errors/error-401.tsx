import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Info, ShieldCheck, Trash2, House, LogIn, X } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';
import { ErrorModal } from '../../../features/errors/components/ErrorModal';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-401')({
  component: Error401,
});

function Error401() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showModal, setShowModal] = useState(false);

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

  const handleLogin = () => {
    addToast('Redirecting to login', 'Refreshing your session...');
    setTimeout(() => {
      window.location.href = '/login';
    }, 900);
  };

  return (
    <ErrorLayout
      logoIcon={
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white shadow-lg">
          <ShieldCheck size={20} />
        </div>
      }
      rightAction={
        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Info size={16} />
          Help
        </button>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Header with gradient line */}
        <div className="h-1 bg-gradient-to-r from-[#10b981] to-[#34D399]"></div>

        {/* Card Head */}
        <div className="p-7 sm:p-8 text-center relative">
          {/* Lock Icon */}
          <div className="relative w-24 h-24 mx-auto mb-4.5">
            <div className="absolute inset-0 rounded-[36px] border-2 border-dashed border-[#A7F3D0] animate-spin" style={{ animationDuration: '22s' }}></div>
            <div className="w-24 h-24 rounded-[28px] bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[44px] text-[#059669] relative z-10">
              <span className="relative">
                <span className="absolute inset-0 rounded-[28px] bg-[#10b981] opacity-0 animate-pulse"></span>
                🔑
              </span>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] font-bold text-[11px] uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
            401 • Invalid Credentials
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            Session needs a fresh key
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed max-w-md mx-auto">
            Your API key or login token expired or is invalid. No funds moved — just re-authenticate.
          </div>

          {/* Reason Box */}
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3 flex gap-2.5 mt-4 text-left">
            <span className="text-[#EF4444] text-xl">⚠️</span>
            <div>
              <span className="font-bold text-[13px]">Why you see this</span>
              <div className="text-[12px] text-[#4B5563]">
                Bearer token TTL reached or Production key used in Sandbox.
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-[#FFFCF5] border border-[#E8E2D9] rounded-xl p-4 mt-5 text-left">
            <span className="font-bold text-[12px] uppercase tracking-wider">
              ✓ Quick security checklist
            </span>
            <div className="flex gap-2.5 items-center py-2 border-b border-dashed border-[#E8E2D9] text-[13px]">
              <div className="w-6.5 h-6.5 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center">
                <span className="text-[#F59E0B] text-sm">🕐</span>
              </div>
              <div className="flex-1">
                <span className="font-bold">Token expired?</span>{' '}
                <span className="text-gray-500">JWTs live 15 min for banking safety</span>
              </div>
              <span className="text-[#10b981]">✓</span>
            </div>
            <div className="flex gap-2.5 items-center py-2 border-b border-dashed border-[#E8E2D9] text-[13px]">
              <div className="w-6.5 h-6.5 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center">
                <span className="text-sm">📚</span>
              </div>
              <div className="flex-1">
                <span className="font-bold">Wrong environment?</span>{' '}
                <span className="text-gray-500">Sandbox key ≠ Production key</span>
              </div>
              <span className="text-gray-400">−</span>
            </div>
            <div className="flex gap-2.5 items-center py-2 text-[13px]">
              <div className="w-6.5 h-6.5 rounded-lg bg-white border border-[#E8E2D9] flex items-center justify-center">
                <span className="text-sm">{`{ }`}</span>
              </div>
              <div className="flex-1">
                <span className="font-bold">Header typo?</span>{' '}
                <span className="text-gray-500">Check spaces in Authorization header</span>
              </div>
              <span className="text-gray-400">−</span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center flex-wrap mt-4">
            <span className="px-3 py-1.5 rounded-full bg-gray-100 border border-[#E8E2D9] text-[11px] font-bold">
              ✓ No breach
            </span>
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
              ⚡ Fix in 20s
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <button
            onClick={handleLogin}
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            <LogIn size={18} />
            Sign In Again
          </button>
          <button
            onClick={() => addToast('Cache cleared', 'Local session reset — try again')}
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear Cache
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
        title="Auth help"
        subtitle="Friendly explainer"
        icon={<ShieldCheck size={24} />}
        iconBg="#ECFDF5"
        iconColor="#047857"
        actionButton={
          <button
            onClick={() => setShowModal(false)}
            className="w-full bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all"
          >
            Sign in — got it
          </button>
        }
      >
        Paymo BaaS uses short-lived tokens (15 min) for banking safety. If idle, we log you out. Just sign in again. Your money stays in vault.
      </ErrorModal>

      <style>{`
        @keyframes rise {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.4; }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-spin { animation: spin 22s linear infinite; }
        .animate-pulse { animation: pulse 2.2s infinite; }
      `}</style>
    
    <style>{`
      :root {
        --theme-bg-gradient-1: #D1FAE5;
        --theme-bg-gradient-2: #FDE68A;
      }
    `}</style>
</ErrorLayout>
  );
}
