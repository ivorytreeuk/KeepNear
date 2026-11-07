import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Staff sign-in · KeepNear", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" variant="admin" />
    </Suspense>
  );
}
