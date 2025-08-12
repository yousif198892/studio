
"use client";

import { PT_Sans, Belleza } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { LanguageProvider, useLanguage } from "@/hooks/use-language.tsx";
import { LanguageSetter } from "@/components/language-setter";
import { useEffect, useState } from "react";
import { getUserById } from "@/lib/data";
import { useSearchParams } from "next/navigation";

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

function AppBody({ children }: { children: React.ReactNode }) {
  const { fontSize } = useLanguage();
  return (
    <body
      className={cn(
        "min-h-screen bg-background font-body antialiased",
        ptSans.variable,
        belleza.variable,
        fontSize === "sm" && "text-sm",
        fontSize === "base" && "text-base",
        fontSize === "lg" && "text-lg"
      )}
      suppressHydrationWarning
    >
        {children}
    </body>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
        <LanguageProvider>
            <LanguageSetter />
            <AppBody>
              {children}
              <Toaster />
            </AppBody>
        </LanguageProvider>
    </html>
  );
}
