"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function NavUser() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="muted">...</span>;
  }

  if (!session) {
    return (
      <Link className="button secondary" href="/auth">
        Login
      </Link>
    );
  }

  return (
    <div className="menu">
      <span className="menu-label">
        {session.user?.name ?? "Perfil"}
      </span>
      <div className="menu-panel">
        <Link className="menu-item" href="/profile">
          Perfil
        </Link>
        <button
          className="menu-item"
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
