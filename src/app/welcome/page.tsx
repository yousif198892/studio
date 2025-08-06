
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
        
        // Save the new user to the 'users' key in localStorage.
        // This key holds all dynamically created users.
        const existingUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
        
        // Prevent adding duplicates
        if (!existingUsers.some(u => u.email === newUser.email)) {
            const updatedUsers = [...existingUsers, newUser];
            localStorage.setItem("users", JSON.stringify(updatedUsers));
        }

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
