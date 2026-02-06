import "./globals.css";
import { cn } from "@/lib/utils";
import { geistSans, geistMono } from "./fonts/fonts";
import { constructMetadata } from "@/lib/metadata";
import { PersonSchema, WebsiteSchema, ProjectsSchema } from "@/lib/schema";
import { Analytics } from "@/lib/analytics";
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="hCeXpe7cAWrD1ZYAH3YfCWT80G6rx6AqSkQbMYgmZ3U" />
        <PersonSchema />
        <WebsiteSchema />
        <ProjectsSchema />
      </head>
      <body
        className={cn(
          "antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main>{children}</main>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
