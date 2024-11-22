import "./globals.css";
import { cn } from "@/lib/utils";
import { geistSans, geistMono } from "./fonts/fonts";
import { constructMetadata } from "@/lib/metadata";
import ThemeToggler from "@/components/ThemeToggler";

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        {/* hide on mobile: */}
        <header className="flex justify-between items-center">
          <ThemeToggler />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
