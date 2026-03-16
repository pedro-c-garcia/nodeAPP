export default function Home() {
  return (
    <>
      <section className="exp-hero">
        <h1>ProtoSketch Studio</h1>
        <p>
          <strong>Experiencias experimentais de funcionalidades base</strong>
        </p>
        <p>Mockups navegaveis para validacao conceptual inicial</p>
        <button className="cta primary" type="button">
          Explorar Experiencias
        </button>
      </section>

      <section className="exp-disclaimer">
        <h3>Isto e experimental</h3>
        <p>
          <strong>AVISO:</strong> Estes mockups sao prototipos funcionais avulsos
          que mostram apenas a logica base das funcionalidades. Nao representam
          o design final nem os detalhes refinados.
        </p>
        <p>
          Proximos passos: refinamento de <strong>UI/UX pelas equipas de design</strong> +{" "}
          <strong>implementacao detalhada pelas equipas funcionais</strong>.
        </p>
      </section>

      <section className="exp-features">
        <article className="exp-feature">
          <h3>O que vais encontrar</h3>
          <p>
            Fluxos navegaveis que testam a logica base das funcionalidades
            principais da futura aplicacao.
          </p>
        </article>
        <article className="exp-feature">
          <h3>Estado actual</h3>
          <p>
            Provas de conceito funcionais. Design e pormenores serao refinados
            pelas equipas especializadas.
          </p>
        </article>
        <article className="exp-feature">
          <h3>Para quem</h3>
          <p>
            Stakeholders, PMs e equipas que querem validar a logica antes do
            refinamento detalhado.
          </p>
        </article>
      </section>

      <section className="exp-callout">
        <h2>Explora as experiencias experimentais -&gt;</h2>
        <p>
          Clica para testar fluxos base. Deixa feedback sobre a logica funcional.
        </p>
        <button className="cta primary large" type="button">
          Comecar Testes
        </button>
      </section>
    </>
  );
}
