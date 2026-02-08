"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

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
    <Link className="button secondary" href="/profile">
      {session.user?.name ?? "Perfil"}
    </Link>
  );
}
