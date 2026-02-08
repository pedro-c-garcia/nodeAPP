import Link from "next/link";

export default function Home() {
  return (
    <section className="hero">
      <div className="card">
        <span className="badge">Bem-vindo</span>
        <h1>Portal de Mercados</h1>
        <p className="muted">
          Este site centraliza autenticação, perfil do usuário e a análise de
          cotações históricas dos principais índices globais.
        </p>
        <div className="form-row">
          <Link className="button" href="/quotes">
            Ver cotações
          </Link>
          <Link className="button secondary" href="/auth">
            Autenticar com Google
          </Link>
        </div>
      </div>
      <div className="card">
        <h2>Próximos passos rápidos</h2>
        <p className="muted">
          Acesse seu perfil, conecte-se com o Google e veja variações
          percentuais dos índices comparados ao S&P 500.
        </p>
        <div className="grid-two">
          <Link className="button secondary" href="/profile">
            Perfil do usuário
          </Link>
          <Link className="button secondary" href="/quotes">
            Painel de índices
          </Link>
        </div>
      </div>
    </section>
  );
}
