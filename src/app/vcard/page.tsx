import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/auth-options";
import { VCardClient } from "./vcard-client";

export default async function VCardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth?callbackUrl=/vcard");
  }

  // Server guard + render the client form.
  return <VCardClient />;
}
