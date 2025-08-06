
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, mockUsers } from "@/lib/data";

export default function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userParam = searchParams.get("user");
    if (userParam) {
      try {
        const newUser: User = JSON.parse(decodeURIComponent(userParam));
        
        // Start with the mock users to ensure they are always present as a base
        const userMap = new Map<string, User>();
        mockUsers.forEach(u => userMap.set(u.id, u));

        // Get the current list of users from localStorage and add them to the map
        const storedUsers: User[] = JSON.parse(localStorage.getItem("users") || "[]");
        storedUsers.forEach(u => userMap.set(u.id, u));
        
        // Add or update the new user from the registration flow
        userMap.set(newUser.id, newUser);

        // Save the consolidated list back to localStorage
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
