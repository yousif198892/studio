
import { LoginForm } from "@/components/login-form";
import { ClientOnly } from "@/components/client-only";

export default function LoginPage() {
  return (
    <ClientOnly>
      <LoginForm />
    </ClientOnly>
  );
}

