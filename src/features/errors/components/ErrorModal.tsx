interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
}

export function ErrorModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconBg = '#ECFDF5',
  iconColor = '#059669',
  children,
  actionButton,
}: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(15,23,42,0.45)] backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[22px] p-6 max-w-[460px] w-full shadow-2xl animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3 items-center">
            {icon && (
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: iconBg, color: iconColor }}
              >
                {icon}
              </div>
            )}
            <div>
              <div className="font-bold">{title}</div>
              {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-lg border border-[#E8E2D9] bg-white hover:bg-gray-50 transition-colors"
          >
            <i className="bi bi-x-lg text-gray-500"></i>
          </button>
        </div>
        <div className="text-sm leading-relaxed text-[#4B5563]">{children}</div>
        {actionButton && <div className="mt-4">{actionButton}</div>}
      </div>
    </div>
  );
}
