import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from 'next/font/google';
import "./globals.css";
import PWAInstaller from '@/components/PWAInstaller';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "ReMindMap - Modern Mind Mapping",
  description: "AI-powered mind mapping with smart clustering, recurring reminders, and offline support. Beautiful glass design with priority-based organization.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ReMindMap",
  },
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'ReMindMap - Modern Mind Mapping',
    description: 'AI-powered mind mapping with beautiful design',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 min-h-screen`}>
        <PWAInstaller />
        {children}
      </body>
    </html>
  );
}
