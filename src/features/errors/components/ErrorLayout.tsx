import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

interface ErrorLayoutProps {
  children: ReactNode;
  logoIcon?: ReactNode;
  logoText?: string;
  logoHref?: string;
  rightAction?: ReactNode;
}

export function ErrorLayout({
  children,
  logoIcon,
  logoText = 'Paymo BaaS',
  logoHref = '/',
  rightAction,
}: ErrorLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col font-['Inter']">
      {/* Top Bar */}
      <div className="px-6 py-5 max-w-[1200px] w-full mx-auto flex justify-between items-center">
        <Link to={logoHref} className="flex gap-2.5 items-center font-extrabold">
          {logoIcon || (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white shadow-lg">
              <span className="text-lg">⚡</span>
            </div>
          )}
          <span>{logoText}</span>
        </Link>
        {rightAction}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
