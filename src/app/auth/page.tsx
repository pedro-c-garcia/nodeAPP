"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthPage() {
  const { data: session, status } = useSession();

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
            <button
              className="button"
              onClick={() => signIn("google")}
              type="button"
            >
              Entrar com Google
            </button>
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
