import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RevealHighlightProvider } from "@/components/reveal-highlight";
import { AnimationSettingsProvider } from "@/components/animation-settings";
import { Toaster } from '@/components/ui/sonner';
import { OneSignalInit } from '@/components/onesignal-init';
import { Analytics } from '@vercel/analytics/next';
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
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
      <body className={`${geistSans.variable} ${jetBrainsMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AnimationSettingsProvider>
            <RevealHighlightProvider defaultIntensity={0.6}>
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </RevealHighlightProvider>
          </AnimationSettingsProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
        <OneSignalInit />
        <Analytics />
      </body>
    </html>
  );
}
