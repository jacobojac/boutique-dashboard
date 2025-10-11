import { cn } from "@/lib/utils";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="fr" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            geistSans.variable,
            geistMono.variable,
            "antialiased",
            "h-full"
          )}
          suppressHydrationWarning={true}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </>
  );
}
