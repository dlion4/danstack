import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Trash, Home, BookOpen, Search } from "lucide-react";
import { ErrorLayout } from '../../../features/errors/components/ErrorLayout';
import { ErrorToast } from '../../../features/errors/components/ErrorToast';

interface Toast {
  id: string;
  title: string;
  message: string;
  type?: 'emerald' | 'red' | 'amber' | 'info' | 'gray';
}

export const Route = createFileRoute('/error/advanced-errors/error-410')({
  component: Error410,
});

function Error410() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (title: string, message: string, type: Toast['type'] = 'gray') => {
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
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6B7280] to-[#111827] flex items-center justify-center text-white shadow-lg">
          <Trash size={20} />
        </div>
      }
      rightAction={
        <button
          onClick={() => addToast('Search opened', 'Type what you need', 'gray')}
          className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] bg-white font-semibold hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Search size={16} />
          Search
        </button>
      }
    >
      <div className="bg-white border border-[#E8E2D9] rounded-[28px] shadow-xl overflow-hidden animate-rise">
        {/* Card Head */}
        <div className="p-6.5 sm:p-7 text-center">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-[28px] bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[42px] text-[#6B7280] relative">
            <Trash size={48} className="animate-fadeTrash" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-[#374151] font-bold text-[11px] uppercase tracking-wider mb-3">
            📦 410 • Permanently Gone
          </div>

          {/* Title */}
          <div className="font-['Space_Grotesk'] text-[26px] font-bold mb-2">
            This vault moved to archive
          </div>

          {/* Subtitle */}
          <div className="text-[14px] text-[#4B5563] leading-relaxed">
            Unlike 404, this resource was <b>intentionally removed</b> and won't return. Legal, compliance or migration reason. Let's take you somewhere fresh.
          </div>

          {/* Archive Notice */}
          <div className="bg-[#FFFCF5] border border-dashed border-[#E8E2D9] rounded-xl p-3.5 text-left mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-[12px] uppercase tracking-wider">Archive notice</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-[#E8E2D9] font-bold">
                Removed 3 days ago
              </span>
            </div>
            <div className="text-[13px] text-[#4B5563]">
              ℹ️ Endpoint <code className="bg-white border border-[#E8E2D9] px-1.5 py-0.5 rounded">/v1/legacy/cards</code> sunset on May 10, 2026. Migrated to <code className="bg-white border border-[#E8E2D9] px-1.5 py-0.5 rounded">/v2/virtual-cards</code>.
            </div>
            <div className="flex gap-2 flex-wrap mt-2.5">
              <span className="px-2.5 py-1 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
                🔗 Use /v2
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
                ✓ No action needed
              </span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 justify-center mt-3">
            <span className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
              🛡️ Safe to ignore
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] font-bold">
              🕐 Migration complete
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4.5 sm:p-7 bg-[#FFFEFB] border-t border-[#E8E2D9] flex flex-wrap gap-2.5 justify-center">
          <Link
            to="/"
            className="bg-gradient-to-br from-[#10b981] to-[#059669] text-white border-none rounded-xl px-5 py-3 font-bold text-[14px] shadow-lg flex items-center gap-2 hover:-translate-y-0.5 transition-all no-underline"
          >
            <Home size={18} />
            Return Home
          </Link>
          <button
            onClick={() => addToast('Opening docs', 'Migration guide loading...', 'gray')}
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <BookOpen size={16} />
            Migration Guide
          </button>
          <button
            onClick={() => addToast('Search opened', 'Type what you need', 'gray')}
            className="px-4.5 py-3 rounded-xl border border-[#E8E2D9] bg-white font-semibold text-[14px] hover:border-gray-400 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Search size={16} />
            Search Site
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
        @keyframes fadeTrash {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.88) rotate(-8deg); }
        }
        .animate-rise { animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fadeTrash { animation: fadeTrash 3s ease-in-out infinite; }
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
