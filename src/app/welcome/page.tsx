
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@/lib/data";
import { Loader2 } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
       // Redirect to dashboard after a short delay to allow toast to be seen
       const timer = setTimeout(() => {
           router.replace(`/dashboard?userId=${userId}`);
       }, 1000);
       return () => clearTimeout(timer);
    } else {
       // If no user id, go back to login
       router.replace("/login");
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex items-center gap-4">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <p className="text-xl text-muted-foreground">Setting up your account...</p>
        </div>
    </div>
  );
}
