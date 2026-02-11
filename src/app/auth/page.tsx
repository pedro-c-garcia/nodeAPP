import { Suspense } from "react";
import { AuthClient } from "./auth-client";

type AuthPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
};

function normalizeCallback(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && value.startsWith("/") ? value : "/profile";
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const callbackUrl = normalizeCallback(params.callbackUrl);

  return (
    <Suspense fallback={<section className="card" style={{ marginTop: 24 }}>Carregando...</section>}>
      <AuthClient callbackUrl={callbackUrl} />
    </Suspense>
  );
}
