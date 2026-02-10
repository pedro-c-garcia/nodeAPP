import { getMongoClient } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/auth-options";

type Movie = {
  _id: string;
  title: string;
  year?: number | string;
  genres?: string[];
  imdb?: { rating?: number };
};

type FilmsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const PAGE_SIZE = 20;

function getParam(value: string | string[] | undefined, fallback: string) {
  if (!value) return fallback;
  return Array.isArray(value) ? value[0] : value;
}

export default async function FilmsPage({ searchParams }: FilmsPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth?callbackUrl=/films");
  }

  const params = await searchParams;
  const page = Math.max(1, Number(getParam(params.page, "1")));
  const titleQuery = getParam(params.title, "").trim();
  const yearQuery = getParam(params.year, "").trim();
  const genreQuery = getParam(params.genre, "").trim();
  const orderQuery = getParam(params.order, "year_desc").trim();

  const filter: Record<string, unknown> = {};
  if (titleQuery) {
    filter.title = { $regex: titleQuery, $options: "i" };
  }
  if (yearQuery && !Number.isNaN(Number(yearQuery))) {
    filter.year = Number(yearQuery);
  }
  if (genreQuery) {
    filter.genres = { $in: [genreQuery] };
  }

  const client = await getMongoClient();
  const db = client.db("sample_mflix");
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    year_desc: { year: -1 },
    year_asc: { year: 1 },
    rating_desc: { "imdb.rating": -1 },
  };
  const sort = sortMap[orderQuery] ?? sortMap.year_desc;

  const genresRaw = await db.collection<Movie>("movies").distinct("genres");
  const genres = genresRaw
    .filter((item): item is string => typeof item === "string")
    .sort((a, b) => a.localeCompare(b, "pt", { sensitivity: "base" }));

  const movies = await db
    .collection<Movie>("movies")
    .find(filter, {
      projection: { title: 1, year: 1, genres: 1, imdb: 1 },
    })
    .sort(sort)
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .toArray();

  const total = await db.collection<Movie>("movies").countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const baseParams = new URLSearchParams();
  if (titleQuery) baseParams.set("title", titleQuery);
  if (yearQuery) baseParams.set("year", yearQuery);
  if (genreQuery) baseParams.set("genre", genreQuery);
  if (orderQuery) baseParams.set("order", orderQuery);

  return (
    <section style={{ marginTop: 24 }}>
      <div className="card">
        <h1>Mostra Filmes</h1>
        <p className="muted">
          Filmes da base sample_mflix.movies com filtros e paginação.
        </p>
        <form className="form-row" method="get">
          <div className="field">
            <label htmlFor="title">Título</label>
            <input id="title" name="title" defaultValue={titleQuery} />
          </div>
          <div className="field">
            <label htmlFor="year">Ano</label>
            <input id="year" name="year" defaultValue={yearQuery} />
          </div>
          <div className="field">
            <label htmlFor="genre">Gênero</label>
            <select id="genre" name="genre" defaultValue={genreQuery}>
              <option value="">Todos</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="order">Ordenação</label>
            <select id="order" name="order" defaultValue={orderQuery}>
              <option value="year_desc">Ano (desc)</option>
              <option value="year_asc">Ano (asc)</option>
              <option value="rating_desc">Rating IMDB</option>
            </select>
          </div>
          <button className="button" type="submit">
            Filtrar
          </button>
          <Link className="button secondary" href="/films">
            Limpar
          </Link>
        </form>
        <p className="muted">
          Página {page} de {totalPages} • {total} filmes encontrados
        </p>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Ano</th>
              <th>Gêneros</th>
              <th>IMDB</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => {
              const rawYear = movie.year;
              const year =
                typeof rawYear === "number"
                  ? rawYear
                  : Number.parseInt(String(rawYear ?? "").replace(/\D/g, ""), 10);
              return (
                <tr key={movie._id}>
                  <td>{movie.title}</td>
                  <td>{Number.isFinite(year) ? year : "-"}</td>
                  <td>{movie.genres?.join(", ") ?? "-"}</td>
                  <td>{movie.imdb?.rating ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="form-row" style={{ marginTop: 12 }}>
          {hasPrev ? (
            <Link
              className="button secondary"
              href={`/films?${baseParams.toString()}&page=${page - 1}`}
            >
              Anterior
            </Link>
          ) : (
            <span className="muted">Anterior</span>
          )}
          {hasNext ? (
            <Link
              className="button secondary"
              href={`/films?${baseParams.toString()}&page=${page + 1}`}
            >
              Próxima
            </Link>
          ) : (
            <span className="muted">Próxima</span>
          )}
        </div>
      </div>
    </section>
  );
}
