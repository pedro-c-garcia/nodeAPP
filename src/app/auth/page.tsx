"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = useMemo(() => {
    const raw = searchParams.get("callbackUrl");
    return raw && raw.startsWith("/") ? raw : "/profile";
  }, [searchParams]);

  useEffect(() => {
    if (session) {
      router.replace(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  return (
    <section className="card" style={{ marginTop: 24 }}>
      <h1>Autenticação</h1>
      <p className="muted">
        Conecte-se com o Google para acessar recursos personalizados.
      </p>
      {status === "loading" && <p className="muted">Verificando sessão...</p>}
      {status !== "loading" && (
        <div className="form-row">
          {session ? (
            <button className="button secondary" onClick={() => signOut()}>
              Sair
            </button>
          ) : (
            <>
              <button
                className="button"
                onClick={() =>
                  signIn("google", { callbackUrl, prompt: "select_account" })
                }
                type="button"
              >
                Autenticar
              </button>
              <button
                className="button secondary"
                onClick={() =>
                  signIn("google", { callbackUrl, prompt: "select_account" })
                }
                type="button"
              >
                Registar
              </button>
            </>
          )}
        </div>
      )}
      {session && (
        <p className="muted">
          Logado como {session.user?.email ?? "usuário"}.
        </p>
      )}
    </section>
  );
}
