
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
        
        // Get the current list of users from localStorage
        const existingUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
        
        // Use a Map to prevent duplicates, with the new user taking precedence
        const userMap = new Map(existingUsers.map(u => [u.id, u]));
        userMap.set(newUser.id, newUser);

        const updatedUsers = Array.from(userMap.values());
        localStorage.setItem("users", JSON.stringify(updatedUsers));

        // Redirect to the dashboard
        router.replace(`/dashboard?userId=${newUser.id}`);

      } catch (error) {
        console.error("Failed to process new user, redirecting to login.", error);
        router.replace("/login");
      }
    } else {
      // No user data, redirect to login
      router.replace("/login");
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <p>Setting up your account...</p>
    </div>
  );
}
