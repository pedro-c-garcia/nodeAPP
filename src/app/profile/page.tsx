"use client";

import { signOut, useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  return (
    <section className="card" style={{ marginTop: 24 }}>
      <h1>Perfil do usuário</h1>
      {status === "loading" && <p className="muted">Carregando sessão...</p>}
      {status === "unauthenticated" && (
        <p className="muted">Nenhum usuário autenticado.</p>
      )}
      {status === "authenticated" && (
        <div className="grid-two">
          <div>
            <p>
              <strong>Nome:</strong> {session.user?.name ?? "N/D"}
            </p>
            <p>
              <strong>Email:</strong> {session.user?.email ?? "N/D"}
            </p>
            <button className="button secondary" onClick={() => signOut()}>
              Logout
            </button>
          </div>
          <div>
            <p className="muted">
              Esta sessão foi iniciada via Google através do NextAuth.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
