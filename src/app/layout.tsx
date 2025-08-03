import type { Metadata } from "next";
import { PT_Sans, Belleza } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-sans",
});

const belleza = Belleza({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-belleza",
});

export const metadata: Metadata = {
  title: "LinguaLeap",
  description: "AI-Enhanced Language Learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          ptSans.variable,
          belleza.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
