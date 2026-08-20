import type { SVGProps } from "react";

const paths: Record<string, React.ReactNode> = {
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </>
  ),
  chevDown: <path d="M6 9l6 6 6-6" />,
  chevRight: <path d="M9 6l6 6-6 6" />,
  chevLeft: <path d="M15 6l-6 6 6 6" />,
  card: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <path d="M2 10h20M6 15h4" />
    </>
  ),
  snow: <path d="M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17M12 2l-2.5 2.5M12 2l2.5 2.5M12 22l-2.5-2.5M12 22l2.5-2.5" />,
  lock: (
    <>
      <rect x="4" y="11" width="16" height="9.5" rx="2" />
      <path d="M8 11V7.5a4 4 0 018 0V11M12 15v2" />
    </>
  ),
  alertTri: (
    <>
      <path d="M10.3 3.9L1.9 18a2 2 0 001.7 3h16.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
      <path d="M12 9v4.5M12 17.5h.01" />
    </>
  ),
  shield: <path d="M12 22s8-3.6 8-10V5.2L12 2 4 5.2V12c0 6.4 8 10 8 10z" />,
  shieldCheck: (
    <>
      <path d="M12 22s8-3.6 8-10V5.2L12 2 4 5.2V12c0 6.4 8 10 8 10z" />
      <path d="M9 11.5l2 2 4-4.5" />
    </>
  ),
  chart: <path d="M3 3v17a1 1 0 001 1h17M8 16v-5M13 16V7M18 16v-8" />,
  sliders: (
    <>
      <path d="M5 21v-6M5 9V3M12 21v-9M12 6V3M19 21v-3M19 12V3" />
      <path d="M2 15h6M9 6h6M16 18h6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19M12 2.5a14.5 14.5 0 010 19 14.5 14.5 0 010-19z" />
    </>
  ),
  zap: <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M20 6L9 17l-5-5" />,
  checkCircle: (
    <>
      <path d="M22 11.1V12a10 10 0 11-5.9-9.1" />
      <path d="M22 4L12 14l-3-3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 16v-4.5M12 8h.01" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </>
  ),
  sms: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2.5" />
      <path d="M22 7l-10 6.5L2 7" />
    </>
  ),
  upRight: <path d="M7 17L17 7M8 7h9v9" />,
  downRight: <path d="M7 7l10 10M17 8v9H8" />,
  download: <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  filter: <path d="M22 4H2l8 9v6l4 2v-8l8-9z" />,
  refresh: (
    <>
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.5 9a9 9 0 0114.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0020.5 15" />
    </>
  ),
  eye: (
    <>
      <path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M17.94 17.94A10.5 10.5 0 0112 19.5C5.5 19.5 1.5 12 1.5 12a19 19 0 015.06-5.94M9.9 5.24A10 10 0 0112 4.5c6.5 0 10.5 7.5 10.5 7.5a19 19 0 01-3.16 4.19" />
      <path d="M14.12 14.12a3 3 0 11-4.24-4.24M1.5 1.5l21 21" />
    </>
  ),
  wallet: (
    <>
      <path d="M20 7H5a2 2 0 01-2-2 2 2 0 012-2h13v4" />
      <path d="M3 5v13a3 3 0 003 3h14a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0020 9H5" />
      <path d="M16.5 14h.01" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.1 9a3 3 0 015.8 1c0 2-3 2.5-3 4M12 17.5h.01" />
    </>
  ),
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
  spark: <path d="M12 3l1.9 5.6 5.6 1.9-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 6.5V12l3.5 2" />
    </>
  ),
  wave: <path d="M4.5 12.5a11 11 0 0115 0M7.5 15.5a7 7 0 019 0M10.5 18.5a2.8 2.8 0 013 0M12 5.5h.01" />,
  logout: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
  building: (
    <>
      <rect x="4" y="2.5" width="16" height="19" rx="1.5" />
      <path d="M9 21.5v-4h6v4M8.5 6.5h1.5M14 6.5h1.5M8.5 10.5h1.5M14 10.5h1.5M8.5 14.5h1.5M14 14.5h1.5" />
    </>
  ),
  pie: <path d="M21.2 15.9A10 10 0 118 2.8M22 12A10 10 0 0012 2v10h10z" />,
  key: (
    <>
      <circle cx="7.5" cy="15.5" r="4" />
      <path d="M10.4 12.6L19 4M15.5 7.5l3 3M18.5 4.5l2 2" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </>
  ),
  flag: <path d="M4 22V4c2.5-1.7 5-1.7 7.5 0s5 1.7 7.5 0v11c-2.5 1.7-5 1.7-7.5 0s-5-1.7-7.5 0" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  dots: <path d="M12 6h.01M12 12h.01M12 18h.01" />,
  inbox: (
    <>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.5 5.1L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.5-6.9A2 2 0 0016.7 4H7.3a2 2 0 00-1.8 1.1z" />
    </>
  ),
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0116 0v2" />
      <rect x="2.5" y="14" width="4.5" height="6" rx="1.5" />
      <rect x="17" y="14" width="4.5" height="6" rx="1.5" />
      <path d="M20 20a4 4 0 01-4 2h-2" />
    </>
  ),
  gauge: (
    <>
      <path d="M20.5 14.5A8.5 8.5 0 103.5 14.5" />
      <path d="M12 13l3.5-3.5" />
      <circle cx="12" cy="13.5" r="1.2" />
    </>
  ),
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 18,
  className = "",
  strokeWidth = 1.8,
  ...rest
}: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#12b76a" />
      <path
        d="M10 23V9h7.2a4.6 4.6 0 010 9.2H13.4V23H10z"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="22.5" cy="21.5" r="2.6" fill="#0b1322" />
    </svg>
  );
}

export function NetworkMark({ network, light = true }: { network: "VISA" | "Mastercard"; light?: boolean }) {
  if (network === "VISA") {
    return (
      <span
        className={`font-display italic text-[15px] font-800 tracking-wide ${light ? "text-white" : "text-ink"}`}
        style={{ fontWeight: 800 }}
      >
        VISA
      </span>
    );
  }
  return (
    <span className="flex items-center -space-x-2.5" aria-label="Mastercard">
      <span className="h-5 w-5 rounded-full bg-[#eb001b]/90" />
      <span className="h-5 w-5 rounded-full bg-[#f79e1b]/90" />
    </span>
  );
}
