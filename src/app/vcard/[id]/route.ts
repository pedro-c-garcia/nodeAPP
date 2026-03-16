import { ObjectId } from "mongodb";
import { getMongoClient } from "@/lib/mongodb";

function buildVCard(contact: {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  company?: string;
  title?: string;
}) {
  // Minimal vCard 3.0 payload.
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${contact.lastName};${contact.firstName};;;`,
    `FN:${contact.firstName} ${contact.lastName}`.trim(),
  ];

  if (contact.company) lines.push(`ORG:${contact.company}`);
  if (contact.title) lines.push(`TITLE:${contact.title}`);
  if (contact.phoneNumber) lines.push(`TEL;TYPE=CELL:${contact.phoneNumber}`);
  if (contact.email) lines.push(`EMAIL;TYPE=INTERNET:${contact.email}`);

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return new Response("Invalid id", { status: 400 });
  }

  // Fetch contact and return as downloadable .vcf.
  const client = await getMongoClient();
  const db = client.db("nodeAppDB");
  const contact = await db
    .collection("contacts")
    .findOne({ _id: new ObjectId(id) });

  if (!contact) {
    return new Response("Not found", { status: 404 });
  }

  const vcf = buildVCard({
    firstName: contact.firstName ?? "",
    lastName: contact.lastName ?? "",
    phoneNumber: contact.phoneNumber ?? "",
    email: contact.email ?? "",
    company: contact.company ?? "",
    title: contact.title ?? "",
  });

  const filename = `${contact.firstName ?? "contact"}-${
    contact.lastName ?? "card"
  }.vcf`.replace(/\s+/g, "-");

  return new Response(vcf, {
    headers: {
      "content-type": "text/vcard; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
