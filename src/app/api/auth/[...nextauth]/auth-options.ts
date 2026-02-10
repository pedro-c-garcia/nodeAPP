import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getMongoClient } from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const client = await getMongoClient();
        const db = client.db("nodeAppDB");
        const collection = db.collection("regUsers");

        const provider = account?.provider ?? "unknown";
        const providerAccountId =
          account?.providerAccountId ?? user.id ?? "";
        const email = user.email ?? (profile as { email?: string })?.email;

        const filter =
          providerAccountId !== ""
            ? { provider, providerAccountId }
            : { email };

        await collection.updateOne(
          filter,
          {
            $setOnInsert: {
              provider,
              providerAccountId,
              email,
              name: user.name ?? null,
              image: user.image ?? null,
              profile: profile ?? null,
              account: account ?? null,
              createdAt: new Date(),
            },
            $set: {
              lastLoginAt: new Date(),
            },
          },
          { upsert: true }
        );

        return true;
      } catch (error) {
        console.error("Failed to register user in MongoDB", error);
        return false;
      }
    },
  },
};
