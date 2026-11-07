import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Partner sign-in · KeepNear" };

export default function PartnerLoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" variant="partner" />
    </Suspense>
  );
}
