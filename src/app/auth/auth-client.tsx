"use client";

import { useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type AuthClientProps = {
  callbackUrl: string;
};

export function AuthClient({ callbackUrl }: AuthClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  return (
    <section className="card" style={{ marginTop: 24 }}>
      <h1>Autenticacao</h1>
      <p className="muted">
        Conecte-se com o Google para acessar recursos personalizados.
      </p>
      {status === "loading" && <p className="muted">Verificando sessao...</p>}
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
          Logado como {session.user?.email ?? "usuario"}.
        </p>
      )}
    </section>
  );
}
