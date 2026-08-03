import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Paymo BaaS Platform",
  description: "Banking-as-a-Service infrastructure powering Africa's digital economy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${spaceGrotesk.variable} antialiased`}
        style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif",
          background: "#032918",
          color: "#e8f5ee",
          overflowX: "hidden",
        }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
