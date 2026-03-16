import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

type ContactPayload = {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  company?: string;
  title?: string;
};

export async function POST(req: Request) {
  const payload = (await req.json()) as ContactPayload;
  const firstName = payload.firstName?.trim();
  const lastName = payload.lastName?.trim();

  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: "firstName and lastName are required." },
      { status: 400 }
    );
  }

  // Write to nodeAppDB.contacts collection.
  const client = await getMongoClient();
  const db = client.db("nodeAppDB");
  const result = await db.collection("contacts").insertOne({
    firstName,
    lastName,
    phoneNumber: payload.phoneNumber?.trim() ?? "",
    email: payload.email?.trim() ?? "",
    company: payload.company?.trim() ?? "",
    title: payload.title?.trim() ?? "",
    createdAt: new Date(),
  });

  return NextResponse.json({ id: result.insertedId.toString() });
}
