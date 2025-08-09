
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@/lib/data";

export default function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // This page is no longer needed with the new server action flow
    // that directly saves to IndexedDB. We just redirect to login.
    // A better implementation would redirect to dashboard, but the
    // userId is not available here anymore.
    const userId = searchParams.get('userId');
    if (userId) {
       router.replace(`/dashboard?userId=${userId}`);
    } else {
       router.replace("/login");
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <p>Setting up your account...</p>
    </div>
  );
}
