import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentSession } from "@/lib/auth";

export default async function AuthPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-12 sm:px-8">
      <AuthForm />
    </main>
  );
}
