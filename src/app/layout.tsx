import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SpotlightProvider } from "@/components/ui/spotlight";
import { AnimationSettingsProvider } from "@/components/animation-settings";
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Toaster } from '@/components/ui/sonner';
import { OneSignalInit } from '@/components/onesignal-init';
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Abdul Rahman | Software Engineer & UI/UX Designer",
  description: "Software engineer with hands-on experience building backend systems, desktop applications, and developer tools, passionate about automation, clean code, and creating solutions that improve productivity.",
  openGraph: {
    title: "Abdul Rahman | Software Engineer & UI/UX Designer",
    description: "Software engineer with hands-on experience building backend systems, desktop applications, and developer tools, passionate about automation, clean code, and creating solutions that improve productivity.",
    images: [{ url: "/thumbnail-portfolio.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Abdul Rahman | Software Engineer & UI/UX Designer",
    description: "Software engineer with hands-on experience building backend systems, desktop applications, and developer tools, passionate about automation, clean code, and creating solutions that improve productivity.",
    images: ["/thumbnail-portfolio.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <RootProvider>
            <AnimationSettingsProvider>
              <SpotlightProvider>
                {children}
              </SpotlightProvider>
            </AnimationSettingsProvider>
          </RootProvider>
          <Toaster />
        </ThemeProvider>
        <OneSignalInit />
        <Analytics />
      </body>
    </html>
  );
}
