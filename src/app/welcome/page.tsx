
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@/lib/data";

export default function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userParam = searchParams.get("user");
    if (userParam) {
      try {
        const newUser: User = JSON.parse(decodeURIComponent(userParam));
        
        const userMap = new Map<string, User>();
        
        const storedUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
        storedUsers.forEach(u => userMap.set(u.id, u));
        
        userMap.set(newUser.id, newUser);

        const updatedUsers = Array.from(userMap.values());
        localStorage.setItem("users", JSON.stringify(updatedUsers));

        router.replace(`/dashboard?userId=${newUser.id}`);

      } catch (error) {
        console.error("Failed to process new user, redirecting to login.", error);
        router.replace("/login");
      }
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
