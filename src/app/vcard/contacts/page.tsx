import { getMongoClient } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/auth-options";
import { ContactsClient } from "./contacts-client";

type Contact = {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  company?: string;
  title?: string;
};

type ContactsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const PAGE_SIZE = 20;

function getParam(value: string | string[] | undefined, fallback: string) {
  if (!value) return fallback;
  return Array.isArray(value) ? value[0] : value;
}

export default async function ContactsPage({
  searchParams,
}: ContactsPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth?callbackUrl=/vcard/contacts");
  }

  // Server-side filtering and pagination.
  const params = await searchParams;
  const page = Math.max(1, Number(getParam(params.page, "1")));
  const nameQuery = getParam(params.name, "").trim();
  const companyQuery = getParam(params.company, "").trim();
  const titleQuery = getParam(params.title, "").trim();

  const filter: Record<string, unknown> = {};
  if (nameQuery) {
    filter.$or = [
      { firstName: { $regex: nameQuery, $options: "i" } },
      { lastName: { $regex: nameQuery, $options: "i" } },
    ];
  }
  if (companyQuery) {
    filter.company = { $regex: companyQuery, $options: "i" };
  }
  if (titleQuery) {
    filter.title = { $regex: titleQuery, $options: "i" };
  }

  const client = await getMongoClient();
  const db = client.db("nodeAppDB");
  const contacts = await db
    .collection<Contact>("contacts")
    .find(filter, {
      projection: {
        firstName: 1,
        lastName: 1,
        phoneNumber: 1,
        email: 1,
        company: 1,
        title: 1,
      },
    })
    .sort({ lastName: 1, firstName: 1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .toArray();

  const total = await db.collection<Contact>("contacts").countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const baseParams = new URLSearchParams();
  if (nameQuery) baseParams.set("name", nameQuery);
  if (companyQuery) baseParams.set("company", companyQuery);
  if (titleQuery) baseParams.set("title", titleQuery);

  return (
    <section style={{ marginTop: 24 }}>
      <div className="card">
        <h1>Contactos vCard</h1>
        <p className="muted">
          Pesquisa por nome, empresa ou titulo. Resultados paginados.
        </p>
        <form className="form-row" method="get">
          <div className="field">
            <label htmlFor="name">Nome</label>
            <input id="name" name="name" defaultValue={nameQuery} />
          </div>
          <div className="field">
            <label htmlFor="company">Empresa</label>
            <input id="company" name="company" defaultValue={companyQuery} />
          </div>
          <div className="field">
            <label htmlFor="title">Titulo</label>
            <input id="title" name="title" defaultValue={titleQuery} />
          </div>
          <button className="button" type="submit">
            Filtrar
          </button>
          <Link className="button secondary" href="/vcard/contacts">
            Limpar
          </Link>
        </form>
        <p className="muted">
          Pagina {page} de {totalPages} • {total} contactos encontrados
        </p>
      </div>

      <ContactsClient
        contacts={contacts.map((c) => ({
          id: c._id.toString(),
          firstName: c.firstName,
          lastName: c.lastName,
          phoneNumber: c.phoneNumber ?? "",
          email: c.email ?? "",
          company: c.company ?? "",
          title: c.title ?? "",
        }))}
        pagination={{
          baseQuery: baseParams.toString(),
          page,
          hasPrev,
          hasNext,
        }}
      />
    </section>
  );
}
