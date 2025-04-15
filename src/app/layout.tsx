import "./globals.css";
import { cn } from "@/lib/utils";
import { geistSans, geistMono } from "./fonts/fonts";
import { constructMetadata } from "@/lib/metadata";
import { PersonSchema, WebsiteSchema, ProjectsSchema } from "@/lib/schema";

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
        <main>{children}</main>
      </body>
    </html>
  );
}
