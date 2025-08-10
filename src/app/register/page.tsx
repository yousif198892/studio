
"use client";

import { RegisterForm } from "@/components/register-form";
import { ClientOnly } from "@/components/client-only";

export default function RegisterPage() {
  return (
    <ClientOnly>
      <RegisterForm />
    </ClientOnly>
  );
}
